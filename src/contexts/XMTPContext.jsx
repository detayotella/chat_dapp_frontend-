import { createContext, useContext, useState, useEffect } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { initializeXMTP, listConversations } from '../lib/xmtp-v3'

const XMTPContext = createContext(null)

export function XMTPProvider({ children }) {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  const [client, setClient] = useState(null)
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const initClient = async () => {
    if (!walletClient || !isConnected || !address) return

    try {
      setIsLoading(true)
      setError(null)

      // Create a signer that matches XMTP's requirements
      const signer = {
        type: 'eip191',
        address,
        getAddress: () => Promise.resolve(address),
        signMessage: async (message) => {
          return await walletClient.signMessage({ message })
        },
        _signTypedData: async (domain, types, message) => {
          return await walletClient.signTypedData({
            domain,
            types,
            primaryType: Object.keys(types)[0],
            message,
          })
        }
      }

      const xmtp = await initializeXMTP(signer)
      setClient(xmtp)

      // Load existing conversations
      const convos = await listConversations()
      setConversations(convos)
    } catch (err) {
      console.error('Error initializing XMTP:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize XMTP client when wallet is connected
  useEffect(() => {
    if (walletClient && isConnected && address) {
      initClient()
    }
  }, [walletClient, isConnected, address])

  // Set up conversation streaming
  useEffect(() => {
    if (!client) return

    // Stream for new conversations
    const stream = client.conversations.stream()
    stream.on('conversation', (conversation) => {
      setConversations(prevConvos => [...prevConvos, conversation])
    })

    return () => {
      stream.close()
    }
  }, [client])

  // Reset state when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setClient(null)
      setConversations([])
      setError(null)
    }
  }, [isConnected])

  return (
    <XMTPContext.Provider
      value={{
        client,
        conversations,
        isLoading,
        error,
        initClient
      }}
    >
      {children}
    </XMTPContext.Provider>
  )
}

export function useXMTP() {
  const context = useContext(XMTPContext)
  if (!context) {
    throw new Error('useXMTP must be used within an XMTPProvider')
  }
  return context
}