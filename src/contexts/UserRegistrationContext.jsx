import { createContext, useContext, useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

const UserRegistrationContext = createContext()

export const useUserRegistration = () => {
  const context = useContext(UserRegistrationContext)
  if (!context) {
    throw new Error('useUserRegistration must be used within a UserRegistrationProvider')
  }
  return context
}

export const UserRegistrationProvider = ({ children }) => {
  const { address, isConnected } = useAccount()
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [registeredDomains, setRegisteredDomains] = useState([])

  // Check if user is registered (has any .fire domains)
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!isConnected || !address) {
        setIsRegistered(false)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      
      try {
        // For mock mode: check localStorage for registered domains
        const mockRegistrations = JSON.parse(localStorage.getItem('fireDomainsRegistered') || '{}')
        const userDomains = mockRegistrations[address] || []
        
        setRegisteredDomains(userDomains)
        setIsRegistered(userDomains.length > 0)
        
        console.log('🔍 User registration check:', {
          address,
          domains: userDomains,
          isRegistered: userDomains.length > 0
        })
      } catch (error) {
        console.error('Error checking registration status:', error)
        setIsRegistered(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkRegistrationStatus()
  }, [address, isConnected])

  // Function to mark user as registered (called after successful domain registration)
  const markAsRegistered = (domainData) => {
    if (!address) return

    const mockRegistrations = JSON.parse(localStorage.getItem('fireDomainsRegistered') || '{}')
    if (!mockRegistrations[address]) {
      mockRegistrations[address] = []
    }
    
    mockRegistrations[address].push({
      domain: domainData.fullDomain,
      tokenId: domainData.tokenId,
      registeredAt: new Date().toISOString(),
      expiresAt: domainData.expiresAt
    })
    
    localStorage.setItem('fireDomainsRegistered', JSON.stringify(mockRegistrations))
    setRegisteredDomains(mockRegistrations[address])
    setIsRegistered(true)
    
    console.log('✅ User marked as registered:', domainData.fullDomain)
  }

  const value = {
    isRegistered,
    isLoading,
    registeredDomains,
    markAsRegistered,
    // Helper to get primary domain
    primaryDomain: registeredDomains[0]?.domain || null
  }

  return (
    <UserRegistrationContext.Provider value={value}>
      {children}
    </UserRegistrationContext.Provider>
  )
}