/**
 * Pinata IPFS Integration for Fire Domain Registry
 * Handles uploading domain images and metadata to IPFS via Pinata
 */

class PinataService {
  constructor(jwt) {
    this.jwt = jwt
    this.baseUrl = 'https://uploads.pinata.cloud/v3'
    this.legacyBaseUrl = 'https://api.pinata.cloud'
    
    // Validate JWT token
    if (!jwt || jwt === 'YOUR_REAL_PINATA_JWT_HERE' || jwt.includes('mock')) {
      throw new Error('⚠️ Real Pinata JWT token required. Please update VITE_PINATA_JWT in your .env file with your actual Pinata API key from https://app.pinata.cloud/developers/api-keys')
    }
  }

  /**
   * Upload a file to IPFS via Pinata (using modern v3 API)
   * @param {File} file - The file to upload
   * @param {Object} metadata - Optional metadata for the file
   * @returns {Promise<Object>} - Upload response with IPFS hash
   */
  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('network', 'public')

      // Add metadata if provided
      if (metadata.name) {
        formData.append('name', metadata.name)
      }

      if (metadata.keyvalues && Object.keys(metadata.keyvalues).length > 0) {
        // Ensure all keyvalues are strings and properly formatted
        const stringifiedKeyValues = {}
        for (const [key, value] of Object.entries(metadata.keyvalues)) {
          stringifiedKeyValues[key] = String(value)
        }
        
        formData.append('keyvalues', JSON.stringify(stringifiedKeyValues))
      }

      const response = await fetch(`${this.baseUrl}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.jwt}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Pinata upload failed: ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Pinata upload successful:', result)
      
      // Extract the CID/hash from different possible response formats
      const cid = result.data?.cid || result.cid || result.IpfsHash
      if (!cid) {
        console.error('❌ No CID found in Pinata response:', result)
        throw new Error('No IPFS hash returned from Pinata')
      }
      
      return {
        success: true,
        ipfsHash: cid,
        pinSize: result.data?.size || result.size || 0,
        timestamp: result.data?.created_at || new Date().toISOString(),
        url: `https://gateway.pinata.cloud/ipfs/${cid}`,
        ipfsUrl: `https://ipfs.io/ipfs/${cid}`, // Alternative IPFS gateway
        originalResponse: result
      }
    } catch (error) {
      console.error('Error uploading file to Pinata:', error)
      throw error
    }
  }

  /**
   * Upload JSON data to IPFS via Pinata (using modern v3 API)
   * @param {Object} jsonData - The JSON data to upload
   * @param {Object} metadata - Optional metadata
   * @returns {Promise<Object>} - Upload response with IPFS hash
   */
  async uploadJSON(jsonData, metadata = {}) {
    try {
      // Convert JSON to Blob first, then to File
      const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: 'application/json'
      })
      const jsonFile = new File([jsonBlob], metadata.name || 'metadata.json', {
        type: 'application/json'
      })

      return await this.uploadFile(jsonFile, metadata)
    } catch (error) {
      console.error('Error uploading JSON to Pinata:', error)
      throw error
    }
  }

  /**
   * Create domain metadata and upload to IPFS
   * @param {Object} domainData - Domain information
   * @param {string} imageHash - IPFS hash of the domain image
   * @returns {Promise<Object>} - Metadata upload response
   */
  async createDomainMetadata(domainData, imageHash) {
    const metadata = {
      name: `${domainData.name}.fire`,
      description: `Fire domain NFT for ${domainData.name}.fire`,
      image: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
      external_url: `https://fire-domains.app/${domainData.name}`,
      attributes: [
        {
          trait_type: "Domain Name",
          value: domainData.name
        },
        {
          trait_type: "TLD",
          value: "fire"
        },
        {
          trait_type: "Registration Date",
          value: new Date().toISOString()
        },
        {
          trait_type: "Expiration Date",
          value: new Date(Date.now() + domainData.duration * 1000).toISOString()
        },
        {
          trait_type: "Length",
          value: domainData.name.length
        }
      ],
      properties: {
        domain: domainData.name,
        tld: "fire",
        fullDomain: `${domainData.name}.fire`,
        owner: domainData.owner,
        registrationTimestamp: Math.floor(Date.now() / 1000),
        expirationTimestamp: Math.floor(Date.now() / 1000) + domainData.duration
      }
    }

    return await this.uploadJSON(metadata, {
      name: `${domainData.name}.fire-metadata`,
      keyvalues: {
        domain: domainData.name,
        type: 'domain-metadata',
        version: '1.0'
      }
    })
  }

  /**
   * Generate a default domain image based on the domain name
   * @param {string} domainName - The domain name
   * @param {Object} options - Image generation options
   * @returns {Promise<Blob>} - Generated image blob
   */
  async generateDomainImage(domainName, options = {}) {
    const {
      width = 400,
      height = 400,
      backgroundColor = '#1a1a1a',
      textColor = '#ff6b35',
      fontSize = 32
    } = options

    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Add gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#ff6b35')
    gradient.addColorStop(1, '#f7931e')
    
    // Draw fire pattern background
    ctx.fillStyle = gradient
    ctx.globalAlpha = 0.1
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = Math.random() * 50 + 10
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Main domain text
    ctx.fillStyle = textColor
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Domain name
    ctx.fillText(domainName, width / 2, height / 2 - 20)
    
    // .fire extension
    ctx.font = `${fontSize * 0.8}px Arial, sans-serif`
    ctx.fillStyle = '#ffffff'
    ctx.fillText('.fire', width / 2, height / 2 + 30)

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png')
    })
  }

  /**
   * Test Pinata connection
   * @returns {Promise<boolean>} - True if connection is successful
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.legacyBaseUrl}/data/testAuthentication`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.jwt}`
        }
      })

      return response.ok
    } catch (error) {
      console.error('Pinata connection test failed:', error)
      return false
    }
  }

  /**
   * Get file info from IPFS hash (using legacy API for compatibility)
   * @param {string} ipfsHash - The IPFS hash
   * @returns {Promise<Object>} - File information
   */
  async getFileInfo(ipfsHash) {
    try {
      const response = await fetch(`${this.legacyBaseUrl}/data/pinList?hashContains=${ipfsHash}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.jwt}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get file info: ${response.statusText}`)
      }

      const result = await response.json()
      return result.rows[0] || null
    } catch (error) {
      console.error('Error getting file info:', error)
      throw error
    }
  }
}

// Factory function for creating PinataService instances
export const createPinataService = (jwt) => {
  return new PinataService(jwt)
}

export default PinataService