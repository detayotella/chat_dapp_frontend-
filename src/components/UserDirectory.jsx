import { useState, useEffect } from 'react'
import { usePublicClient } from 'wagmi'
import { UserProfile } from './UserProfile'
import FireDomainABI from '../contracts/abi/FireDomainRegistry.json'

const FIRE_DOMAIN_CONTRACT_ADDRESS = import.meta.env.VITE_FIRE_DOMAIN_CONTRACT_ADDRESS

export default function UserDirectory({ onUserSelect, currentUser, searchQuery = '', showHeader = true }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const publicClient = usePublicClient()

  useEffect(() => {
    async function loadRegisteredUsers() {
      if (!publicClient || !FIRE_DOMAIN_CONTRACT_ADDRESS) return

      setLoading(true)
      setError(null)

      try {
        // Get total number of domains
        const totalDomains = await publicClient.readContract({
          address: FIRE_DOMAIN_CONTRACT_ADDRESS,
          abi: FireDomainABI.abi,
          functionName: 'getTotalDomains'
        })

        console.log('Total domains:', totalDomains.toString())

        // Get all domain names
        const domainPromises = []
        for (let i = 0; i < Number(totalDomains); i++) {
          domainPromises.push(
            publicClient.readContract({
              address: FIRE_DOMAIN_CONTRACT_ADDRESS,
              abi: FireDomainABI.abi,
              functionName: 'allDomains',
              args: [i]
            })
          )
        }

        const domainNames = await Promise.all(domainPromises)
        console.log('Domain names:', domainNames)

        // Get unique owners
        const ownerSet = new Set()
        const userPromises = domainNames.map(async (domainName) => {
          try {
            const domainInfo = await publicClient.readContract({
              address: FIRE_DOMAIN_CONTRACT_ADDRESS,
              abi: FireDomainABI.abi,
              functionName: 'getDomain',
              args: [domainName]
            })

            if (domainInfo && domainInfo.owner && domainInfo.isActive) {
              ownerSet.add(domainInfo.owner)
              return {
                address: domainInfo.owner,
                domainName: domainName,
                lastSeen: Date.now() // We'll enhance this later
              }
            }
            return null
          } catch (err) {
            console.error(`Error getting domain info for ${domainName}:`, err)
            return null
          }
        })

        const userResults = await Promise.all(userPromises)
        const uniqueUsers = userResults
          .filter(user => user !== null)
          .filter(user => user.address !== currentUser) // Exclude current user
          .reduce((acc, user) => {
            if (!acc.find(u => u.address === user.address)) {
              acc.push(user)
            }
            return acc
          }, [])

        console.log('Registered users:', uniqueUsers)
        setUsers(uniqueUsers)
      } catch (err) {
        console.error('Error loading registered users:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadRegisteredUsers()
  }, [publicClient, currentUser])

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.domainName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.address?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className={showHeader ? "bg-white rounded-lg shadow p-6" : "p-4"}>
        {showHeader && <h3 className="text-lg font-semibold text-gray-900 mb-4">Registered Users</h3>}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gray-300 animate-pulse" />
              <div className="flex flex-col space-y-1">
                <div className="h-4 bg-gray-300 rounded animate-pulse w-24" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={showHeader ? "bg-white rounded-lg shadow p-6" : "p-4"}>
        {showHeader && <h3 className="text-lg font-semibold text-gray-900 mb-4">Registered Users</h3>}
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">Error loading users</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  if (filteredUsers.length === 0) {
    return (
      <div className={showHeader ? "bg-white rounded-lg shadow p-6" : "p-4"}>
        {showHeader && <h3 className="text-lg font-semibold text-gray-900 mb-4">Registered Users</h3>}
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">
            {searchQuery ? 'No users found' : 'No other users found'}
          </p>
          <p className="text-sm text-gray-400">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Be the first to register a domain and start chatting!'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={showHeader ? "bg-white rounded-lg shadow p-6" : "p-4"}>
      {showHeader && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Registered Users ({filteredUsers.length})
        </h3>
      )}
      <div className="space-y-2">
        {filteredUsers.map((user) => (
          <div
            key={user.address}
            className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors group"
            onClick={() => onUserSelect(user)}
          >
            <div className="flex items-center justify-between">
              <UserProfile 
                address={user.address} 
                size="sm" 
                showDomain={true}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onUserSelect(user)
                }}
                className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-all"
              >
                Chat
              </button>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              Available for chat
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}