import { useState, useEffect, useCallback } from 'react'
import { usePublicClient } from 'wagmi'
import FireDomainABI from '../contracts/abi/FireDomainRegistry.json'

const FIRE_DOMAIN_CONTRACT_ADDRESS = import.meta.env.VITE_FIRE_DOMAIN_CONTRACT_ADDRESS

export function useUserProfile(address) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const publicClient = usePublicClient()

  const loadUserProfile = useCallback(async () => {
    if (!address || !publicClient) return

    setLoading(true)
    setError(null)

    try {
      // Get user's primary domain
      const primaryDomainName = await publicClient.readContract({
        address: FIRE_DOMAIN_CONTRACT_ADDRESS,
        abi: FireDomainABI.abi,
        functionName: 'primaryDomain',
        args: [address]
      })

      if (!primaryDomainName) {
        // No primary domain, try to get any domain
        const domains = await publicClient.readContract({
          address: FIRE_DOMAIN_CONTRACT_ADDRESS,
          abi: FireDomainABI.abi,
          functionName: 'getDomainsByOwner',
          args: [address]
        })

        if (domains && domains.length > 0) {
          // Use the first domain as fallback
          const domainInfo = await publicClient.readContract({
            address: FIRE_DOMAIN_CONTRACT_ADDRESS,
            abi: FireDomainABI.abi,
            functionName: 'getDomain',
            args: [domains[0]]
          })

          setProfile({
            address,
            domainName: domains[0],
            fullDomain: `${domains[0]}.fire`,
            imageUrl: domainInfo.imageURI,
            metadataUrl: domainInfo.metadataURI,
            isPrimary: false
          })
        } else {
          // No domains registered
          setProfile({
            address,
            domainName: null,
            fullDomain: null,
            imageUrl: null,
            metadataUrl: null,
            isPrimary: false
          })
        }
      } else {
        // Get primary domain info
        const domainInfo = await publicClient.readContract({
          address: FIRE_DOMAIN_CONTRACT_ADDRESS,
          abi: FireDomainABI.abi,
          functionName: 'getDomain',
          args: [primaryDomainName]
        })

        setProfile({
          address,
          domainName: primaryDomainName,
          fullDomain: `${primaryDomainName}.fire`,
          imageUrl: domainInfo.imageURI,
          metadataUrl: domainInfo.metadataURI,
          isPrimary: true
        })
      }
    } catch (err) {
      console.error('Error loading user profile:', err)
      setError(err.message)
      setProfile({
        address,
        domainName: null,
        fullDomain: null,
        imageUrl: null,
        metadataUrl: null,
        isPrimary: false
      })
    } finally {
      setLoading(false)
    }
  }, [address, publicClient])

  useEffect(() => {
    loadUserProfile()
  }, [loadUserProfile])

  return {
    profile,
    loading,
    error,
    refetch: loadUserProfile
  }
}

// Hook to get multiple user profiles
export function useUserProfiles(addresses) {
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(false)
  const publicClient = usePublicClient()

  const loadProfiles = useCallback(async () => {
    if (!addresses?.length || !publicClient) return

    setLoading(true)
    const newProfiles = {}

    try {
      await Promise.all(
        addresses.map(async (address) => {
          try {
            const primaryDomainName = await publicClient.readContract({
              address: FIRE_DOMAIN_CONTRACT_ADDRESS,
              abi: FireDomainABI.abi,
              functionName: 'primaryDomain',
              args: [address]
            })

            if (primaryDomainName) {
              const domainInfo = await publicClient.readContract({
                address: FIRE_DOMAIN_CONTRACT_ADDRESS,
                abi: FireDomainABI.abi,
                functionName: 'getDomain',
                args: [primaryDomainName]
              })

              newProfiles[address] = {
                address,
                domainName: primaryDomainName,
                fullDomain: `${primaryDomainName}.fire`,
                imageUrl: domainInfo.imageURI,
                metadataUrl: domainInfo.metadataURI,
                isPrimary: true
              }
            } else {
              // Try to get any domain
              const domains = await publicClient.readContract({
                address: FIRE_DOMAIN_CONTRACT_ADDRESS,
                abi: FireDomainABI.abi,
                functionName: 'getDomainsByOwner',
                args: [address]
              })

              if (domains && domains.length > 0) {
                const domainInfo = await publicClient.readContract({
                  address: FIRE_DOMAIN_CONTRACT_ADDRESS,
                  abi: FireDomainABI.abi,
                  functionName: 'getDomain',
                  args: [domains[0]]
                })

                newProfiles[address] = {
                  address,
                  domainName: domains[0],
                  fullDomain: `${domains[0]}.fire`,
                  imageUrl: domainInfo.imageURI,
                  metadataUrl: domainInfo.metadataURI,
                  isPrimary: false
                }
              } else {
                newProfiles[address] = {
                  address,
                  domainName: null,
                  fullDomain: null,
                  imageUrl: null,
                  metadataUrl: null,
                  isPrimary: false
                }
              }
            }
          } catch (err) {
            console.error(`Error loading profile for ${address}:`, err)
            newProfiles[address] = {
              address,
              domainName: null,
              fullDomain: null,
              imageUrl: null,
              metadataUrl: null,
              isPrimary: false
            }
          }
        })
      )

      setProfiles(newProfiles)
    } catch (err) {
      console.error('Error loading profiles:', err)
    } finally {
      setLoading(false)
    }
  }, [addresses, publicClient])

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  return {
    profiles,
    loading,
    refetch: loadProfiles
  }
}