/**
 * Fire Domain Registration Service
 * Handles domain registration with image upload and metadata creation
 */

import { createPinataService } from './pinata'
import { parseEther, formatEther } from 'viem'

class FireDomainService {
  constructor(contract, walletClient, publicClient, pinataConfig) {
    this.contract = contract
    this.walletClient = walletClient
    this.publicClient = publicClient
    this.pinata = createPinataService(pinataConfig.jwt)
  }

  /**
   * Check if a domain name is available
   * @param {string} domainName - Domain name without .fire
   * @returns {Promise<boolean>} - True if available
   */
  async isDomainAvailable(domainName) {
    try {
      return await this.publicClient.readContract({
        address: this.contract.address,
        abi: this.contract.abi,
        functionName: 'isDomainAvailable',
        args: [domainName]
      })
    } catch (error) {
      console.error('Error checking domain availability:', error)
      throw error
    }
  }

  /**
   * Get registration fee
   * @returns {Promise<bigint>} - Registration fee in wei
   */
  async getRegistrationFee() {
    try {
      return await this.publicClient.readContract({
        address: this.contract.address,
        abi: this.contract.abi,
        functionName: 'registrationFee'
      })
    } catch (error) {
      console.error('Error getting registration fee:', error)
      throw error
    }
  }

  /**
   * Register a new domain with image upload
   * @param {Object} registrationData - Registration data
   * @returns {Promise<Object>} - Registration result
   */
  async registerDomain(registrationData) {
    const {
      domainName,
      duration = 365 * 24 * 60 * 60, // 1 year in seconds
      imageFile = null,
      customMetadata = {}
    } = registrationData

    try {
      // Validate domain name
      if (!domainName || domainName.length < 3 || domainName.length > 32) {
        throw new Error('Domain name must be between 3 and 32 characters')
      }

      // Check availability
      const isAvailable = await this.isDomainAvailable(domainName)
      if (!isAvailable) {
        throw new Error('Domain name is not available')
      }

      // Get registration fee
      const fee = await this.getRegistrationFee()

      // Step 1: Upload or generate domain image
      let imageHash
      if (imageFile) {
        console.log('Uploading custom image to IPFS...')
        const imageResult = await this.pinata.uploadFile(imageFile, {
          name: `${domainName}.fire-image`,
          keyvalues: {
            domain: domainName,
            type: 'domain-image'
          }
        })
        imageHash = imageResult.ipfsHash
      } else {
        console.log('Generating default domain image...')
        const generatedImage = await this.pinata.generateDomainImage(domainName)
        const imageResult = await this.pinata.uploadFile(generatedImage, {
          name: `${domainName}.fire-generated-image`,
          keyvalues: {
            domain: domainName,
            type: 'domain-image',
            generated: 'true'
          }
        })
        imageHash = imageResult.ipfsHash
      }

      // Step 2: Create and upload metadata
      console.log('Creating domain metadata...')
      const metadataResult = await this.pinata.createDomainMetadata({
        name: domainName,
        owner: this.walletClient.account.address,
        duration,
        ...customMetadata
      }, imageHash)

      // Step 3: Register domain on blockchain
      console.log('Registering domain on blockchain...')
      const hash = await this.walletClient.writeContract({
        address: this.contract.address,
        abi: this.contract.abi,
        functionName: 'registerDomain',
        args: [
          domainName,
          metadataResult.url,
          `https://gateway.pinata.cloud/ipfs/${imageHash}`,
          BigInt(duration)
        ],
        value: fee
      })

      // Wait for transaction confirmation
      console.log('Waiting for transaction confirmation...')
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash })

      // Parse events to get token ID
      const logs = receipt.logs
      let tokenId = null
      
      for (const log of logs) {
        try {
          const decodedLog = this.publicClient.decodeEventLog({
            abi: this.contract.abi,
            data: log.data,
            topics: log.topics
          })
          
          if (decodedLog.eventName === 'DomainRegistered') {
            tokenId = decodedLog.args.tokenId
            break
          }
        } catch (error) {
          // Skip logs that don't match our ABI
          continue
        }
      }

      return {
        success: true,
        domainName,
        fullDomain: `${domainName}.fire`,
        tokenId: tokenId?.toString(),
        transactionHash: hash,
        metadataUrl: metadataResult.url,
        imageUrl: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
        registrationFee: formatEther(fee),
        duration,
        expiresAt: new Date(Date.now() + duration * 1000).toISOString()
      }
    } catch (error) {
      console.error('Error registering domain:', error)
      throw error
    }
  }

  /**
   * Resolve a domain to an address
   * @param {string} domainName - Domain name without .fire
   * @returns {Promise<string>} - Owner address
   */
  async resolveDomain(domainName) {
    try {
      return await this.publicClient.readContract({
        address: this.contract.address,
        abi: this.contract.abi,
        functionName: 'resolveDomain',
        args: [domainName]
      })
    } catch (error) {
      console.error('Error resolving domain:', error)
      throw error
    }
  }

  /**
   * Reverse resolve an address to its primary domain
   * @param {string} address - Wallet address
   * @returns {Promise<string>} - Primary domain with .fire suffix
   */
  async reverseResolve(address) {
    try {
      return await this.publicClient.readContract({
        address: this.contract.address,
        abi: this.contract.abi,
        functionName: 'reverseResolve',
        args: [address]
      })
    } catch (error) {
      console.error('Error reverse resolving address:', error)
      throw error
    }
  }

  /**
   * Get domain information
   * @param {string} domainName - Domain name without .fire
   * @returns {Promise<Object>} - Domain information
   */
  async getDomainInfo(domainName) {
    try {
      const domain = await this.publicClient.readContract({
        address: this.contract.address,
        abi: this.contract.abi,
        functionName: 'getDomain',
        args: [domainName]
      })

      return {
        name: domain.name,
        owner: domain.owner,
        expires: new Date(Number(domain.expires) * 1000),
        metadataURI: domain.metadataURI,
        imageURI: domain.imageURI,
        isActive: domain.isActive,
        fullDomain: `${domain.name}.fire`
      }
    } catch (error) {
      console.error('Error getting domain info:', error)
      throw error
    }
  }

  /**
   * Get all domains owned by an address
   * @param {string} address - Owner address
   * @returns {Promise<Array>} - Array of domain names
   */
  async getDomainsByOwner(address) {
    try {
      return await this.publicClient.readContract({
        address: this.contract.address,
        abi: this.contract.abi,
        functionName: 'getDomainsByOwner',
        args: [address]
      })
    } catch (error) {
      console.error('Error getting domains by owner:', error)
      throw error
    }
  }

  /**
   * Set primary domain for current user
   * @param {string} domainName - Domain name without .fire
   * @returns {Promise<string>} - Transaction hash
   */
  async setPrimaryDomain(domainName) {
    try {
      const hash = await this.walletClient.writeContract({
        address: this.contract.address,
        abi: this.contract.abi,
        functionName: 'setPrimaryDomain',
        args: [domainName]
      })

      await this.publicClient.waitForTransactionReceipt({ hash })
      return hash
    } catch (error) {
      console.error('Error setting primary domain:', error)
      throw error
    }
  }

  /**
   * Renew a domain
   * @param {string} domainName - Domain name without .fire
   * @param {number} duration - Additional duration in seconds
   * @returns {Promise<string>} - Transaction hash
   */
  async renewDomain(domainName, duration = 365 * 24 * 60 * 60) {
    try {
      const fee = await this.getRegistrationFee()

      const hash = await this.walletClient.writeContract({
        address: this.contract.address,
        abi: this.contract.abi,
        functionName: 'renewDomain',
        args: [domainName, BigInt(duration)],
        value: fee
      })

      await this.publicClient.waitForTransactionReceipt({ hash })
      return hash
    } catch (error) {
      console.error('Error renewing domain:', error)
      throw error
    }
  }

  /**
   * Update domain metadata
   * @param {string} domainName - Domain name without .fire
   * @param {File} newImageFile - New image file (optional)
   * @param {Object} customMetadata - Custom metadata (optional)
   * @returns {Promise<string>} - Transaction hash
   */
  async updateDomainMetadata(domainName, newImageFile = null, customMetadata = {}) {
    try {
      // Get current domain info
      const currentDomain = await this.getDomainInfo(domainName)
      
      let imageHash
      if (newImageFile) {
        // Upload new image
        const imageResult = await this.pinata.uploadFile(newImageFile, {
          name: `${domainName}.fire-updated-image`,
          keyvalues: {
            domain: domainName,
            type: 'domain-image',
            updated: 'true'
          }
        })
        imageHash = imageResult.ipfsHash
      } else {
        // Extract existing image hash from URL
        const imageUrl = currentDomain.imageURI
        imageHash = imageUrl.split('/').pop()
      }

      // Create updated metadata
      const metadataResult = await this.pinata.createDomainMetadata({
        name: domainName,
        owner: currentDomain.owner,
        duration: Math.floor((currentDomain.expires - new Date()) / 1000),
        ...customMetadata
      }, imageHash)

      // Update on blockchain
      const hash = await this.walletClient.writeContract({
        address: this.contract.address,
        abi: this.contract.abi,
        functionName: 'updateDomainMetadata',
        args: [
          domainName,
          metadataResult.url,
          `https://gateway.pinata.cloud/ipfs/${imageHash}`
        ]
      })

      await this.publicClient.waitForTransactionReceipt({ hash })
      return hash
    } catch (error) {
      console.error('Error updating domain metadata:', error)
      throw error
    }
  }

  /**
   * Get total number of registered domains
   * @returns {Promise<number>} - Total domain count
   */
  async getTotalDomains() {
    try {
      const count = await this.publicClient.readContract({
        address: this.contract.address,
        abi: this.contract.abi,
        functionName: 'getTotalDomains'
      })
      return Number(count)
    } catch (error) {
      console.error('Error getting total domains:', error)
      throw error
    }
  }

  /**
   * Search for domains containing a keyword
   * @param {string} keyword - Search keyword
   * @param {number} limit - Maximum results to return
   * @returns {Promise<Array>} - Array of matching domains
   */
  async searchDomains(keyword, limit = 50) {
    try {
      // This would typically be implemented with a subgraph or indexing service
      // For now, we'll return a placeholder implementation
      console.warn('Domain search not fully implemented - requires indexing service')
      return []
    } catch (error) {
      console.error('Error searching domains:', error)
      throw error
    }
  }
}

export default FireDomainService