import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAccount, usePublicClient, useWalletClient, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi'
import { parseAbiItem } from 'viem'
import FireChatABI from '../contracts/abi/FireChat.json'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { writeContractAsync } = useWriteContract()
  
  const [messages, setMessages] = useState({}) // Store messages by conversation key (sender-recipient)
  const [conversations, setConversations] = useState([])
  const [contacts, setContacts] = useState([]) // Added contacts state
  const [systemMessages, setSystemMessages] = useState([]) // Add system messages for price bot
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Contract configuration
  const chatContractConfig = {
    address: import.meta.env.VITE_FIRE_CHAT_CONTRACT_ADDRESS,
    abi: FireChatABI.abi,
  }

  console.log('🔧 Chat contract config:', chatContractConfig)
  console.log('🔧 Contract address:', import.meta.env.VITE_FIRE_CHAT_CONTRACT_ADDRESS)
  console.log('🔧 Wallet connected:', isConnected)
  console.log('🔧 User address:', address)

  // Helper function to create conversation key
  const createConversationKey = useCallback((addr1, addr2) => {
    const addresses = [addr1, addr2].sort()
    return `${addresses[0]}-${addresses[1]}`
  }, [])

  // Helper function to parse message event
  const parseMessageEvent = useCallback((log) => {
    try {
      const messageId = log.args.messageId
      const content = log.args.content
      const senderAddress = log.args.senderAddress
      const recipientAddress = log.args.recipientAddress
      const recipientDomain = log.args.recipientDomain
      const timestamp = log.args.timestamp

      return {
        id: messageId,
        content,
        sender: senderAddress,        // Use 'sender' instead of 'senderAddress' for MessageList compatibility
        senderAddress,               // Keep original for contract compatibility
        recipient: recipientAddress,  // Add 'recipient' for consistency
        recipientAddress,            // Keep original for contract compatibility
        recipientDomain,
        timestamp: new Date(Number(timestamp) * 1000).toISOString(),
        sent: new Date(Number(timestamp) * 1000).toISOString(),
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash
      }
    } catch (error) {
      console.error('❌ Error parsing message event:', error, log)
      return null
    }
  }, [])

  // Listen for MessageSent events
  useWatchContractEvent({
    ...chatContractConfig,
    eventName: 'MessageSent',
    onLogs: (logs) => {
      console.log('📨 New message events received:', logs)
      
      logs.forEach((log) => {
        const message = parseMessageEvent(log)
        if (!message) return

        console.log('📨 Parsed message:', message)

        const conversationKey = createConversationKey(message.senderAddress, message.recipientAddress)
        
        setMessages(prev => {
          const existingMessages = prev[conversationKey] || []
          
          // Check if message already exists to avoid duplicates (by content and timestamp proximity)
          const messageExists = existingMessages.some(m => 
            m.id === message.id || 
            (m.content === message.content && 
             m.senderAddress === message.senderAddress &&
             Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000) // 5 second window
          )
          
          if (messageExists) {
            console.log('📨 Message already exists, updating pending status')
            // Update the existing message to remove pending status
            return {
              ...prev,
              [conversationKey]: existingMessages.map(m => 
                (m.content === message.content && m.senderAddress === message.senderAddress && m.isPending)
                  ? { ...message, isPending: false }
                  : m
              )
            }
          }
          
          console.log('📨 Adding new message to conversation:', conversationKey)
          return {
            ...prev,
            [conversationKey]: [...existingMessages, { ...message, isPending: false }]
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          }
        })

        // Update conversations list
        setConversations(prev => {
          const existingConvo = prev.find(c => 
            (c.peerAddress === message.senderAddress && message.recipientAddress === address) ||
            (c.peerAddress === message.recipientAddress && message.senderAddress === address)
          )
          
          if (existingConvo) {
            return prev.map(c => 
              c.peerAddress === existingConvo.peerAddress 
                ? { ...c, lastMessage: message, updatedAt: message.timestamp }
                : c
            )
          } else {
            // Create new conversation
            const peerAddress = message.senderAddress === address ? message.recipientAddress : message.senderAddress
            return [...prev, {
              peerAddress,
              lastMessage: message,
              createdAt: message.timestamp,
              updatedAt: message.timestamp
            }]
          }
        })
      })
    },
  })

  // Load historical messages for a conversation
  const loadConversationMessages = useCallback(async (peerAddress) => {
    if (!publicClient || !address) return []

    try {
      setIsLoading(true)
      console.log('📥 Loading messages between', address, 'and', peerAddress)

      // Get MessageSent events from both directions
      const fromBlock = 'earliest'
      const toBlock = 'latest'

      // Messages sent from user to peer
      const sentLogs = await publicClient.getLogs({
        address: chatContractConfig.address,
        event: parseAbiItem('event MessageSent(string indexed messageId, string content, address indexed senderAddress, address indexed recipientAddress, string recipientDomain, uint256 timestamp)'),
        args: {
          senderAddress: address,
          recipientAddress: peerAddress,
        },
        fromBlock,
        toBlock,
      })

      // Messages sent from peer to user
      const receivedLogs = await publicClient.getLogs({
        address: chatContractConfig.address,
        event: parseAbiItem('event MessageSent(string indexed messageId, string content, address indexed senderAddress, address indexed recipientAddress, string recipientDomain, uint256 timestamp)'),
        args: {
          senderAddress: peerAddress,
          recipientAddress: address,
        },
        fromBlock,
        toBlock,
      })

      // Combine and sort messages
      const allLogs = [...sentLogs, ...receivedLogs]
      const messages = allLogs
        .map(parseMessageEvent)
        .filter(Boolean)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

      console.log('📦 Loaded', messages.length, 'historical messages')

      const conversationKey = createConversationKey(address, peerAddress)
      setMessages(prev => ({
        ...prev,
        [conversationKey]: messages
      }))

      return messages
    } catch (error) {
      console.error('❌ Error loading conversation messages:', error)
      setError(error.message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [publicClient, address, parseMessageEvent, createConversationKey, chatContractConfig.address])

  // Send a message
  const sendMessage = useCallback(async (content, recipientAddress, recipientDomain = '') => {
    if (!writeContractAsync || !address) {
      throw new Error('Wallet not connected')
    }

    try {
      console.log('📤 Sending message:', { content, recipientAddress, recipientDomain, sender: address })
      
      const tx = await writeContractAsync({
        ...chatContractConfig,
        functionName: 'sendMessage',
        args: [content, recipientAddress, recipientDomain],
      })

      console.log('✅ Message sent, transaction:', tx)
      
      // Immediately add the message to local state for instant feedback
      const messageId = `${address}-${recipientAddress}-${Date.now()}`
      const timestamp = new Date().toISOString()
      
      const optimisticMessage = {
        id: messageId,
        content,
        sender: address,
        senderAddress: address,
        recipient: recipientAddress,
        recipientAddress,
        recipientDomain,
        timestamp,
        sent: timestamp,
        transactionHash: tx,
        isPending: true // Mark as pending until we get the event
      }

      const conversationKey = createConversationKey(address, recipientAddress)
      
      setMessages(prev => ({
        ...prev,
        [conversationKey]: [...(prev[conversationKey] || []), optimisticMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      }))
      
      return tx
    } catch (error) {
      console.error('❌ Error sending message:', error)
      throw error
    }
  }, [writeContractAsync, address, chatContractConfig, createConversationKey])

  // Get messages for a specific conversation
  const getConversationMessages = useCallback((peerAddress) => {
    const conversationKey = createConversationKey(address, peerAddress)
    return messages[conversationKey] || []
  }, [messages, address, createConversationKey])

  // React to a message
  const reactToMessage = useCallback(async (messageId, senderAddress, recipientAddress, reaction) => {
    if (!writeContractAsync) {
      throw new Error('Wallet not connected')
    }

    try {
      const tx = await writeContractAsync({
        ...chatContractConfig,
        functionName: 'reactToMessage',
        args: [messageId, senderAddress, recipientAddress, reaction],
      })

      console.log('✅ Reaction sent, transaction:', tx)
      return tx
    } catch (error) {
      console.error('❌ Error sending reaction:', error)
      throw error
    }
  }, [writeContractAsync, chatContractConfig])

  // Mark message as read
  const markMessageAsRead = useCallback(async (messageId, senderAddress, recipientAddress) => {
    if (!writeContractAsync) {
      throw new Error('Wallet not connected')
    }

    try {
      const tx = await writeContractAsync({
        ...chatContractConfig,
        functionName: 'markMessageRead',
        args: [messageId, senderAddress, recipientAddress],
      })

      console.log('✅ Message marked as read, transaction:', tx)
      return tx
    } catch (error) {
      console.error('❌ Error marking message as read:', error)
      throw error
    }
  }, [writeContractAsync, chatContractConfig])

  // Set typing indicator
  const setTyping = useCallback(async (recipientAddress, isTyping) => {
    if (!writeContractAsync) {
      throw new Error('Wallet not connected')
    }

    try {
      const tx = await writeContractAsync({
        ...chatContractConfig,
        functionName: 'setTyping',
        args: [recipientAddress, isTyping],
      })

      console.log('✅ Typing indicator set, transaction:', tx)
      return tx
    } catch (error) {
      console.error('❌ Error setting typing indicator:', error)
      throw error
    }
  }, [writeContractAsync, chatContractConfig])

  // Add contact function
  const addContact = useCallback(async (contactAddress) => {
    if (!contactAddress || !address) return

    // Simple validation for Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(contactAddress)) {
      throw new Error('Invalid Ethereum address format')
    }

    // Don't add self or duplicates
    if (contactAddress.toLowerCase() === address.toLowerCase()) {
      throw new Error('Cannot add yourself as a contact')
    }

    if (contacts.includes(contactAddress.toLowerCase())) {
      throw new Error('Contact already exists')
    }

    // Add to contacts list
    setContacts(prev => [...prev, contactAddress.toLowerCase()])
    console.log('✅ Contact added:', contactAddress)
  }, [address, contacts])

  // Add system message function (for price bot, notifications, etc.)
  const addSystemMessage = useCallback((message) => {
    const systemMessage = {
      id: `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'system',
      sender: 'System',
      isSystem: true,
      ...message
    }

    setSystemMessages(prev => {
      // Keep only last 50 system messages to prevent memory issues
      const updated = [...prev, systemMessage].slice(-50)
      return updated
    })

    console.log('📢 System message added:', systemMessage)
    return systemMessage.id
  }, [])

  // Clear system messages
  const clearSystemMessages = useCallback(() => {
    setSystemMessages([])
  }, [])

  // Get all messages for a conversation including system messages
  const getAllMessages = useCallback((conversationKey) => {
    const conversationMessages = messages[conversationKey] || []
    const allMessages = [...conversationMessages, ...systemMessages]
    
    // Sort by timestamp
    return allMessages.sort((a, b) => a.timestamp - b.timestamp)
  }, [messages, systemMessages])

  // Process chat commands (for price bot integration)
  const processCommand = useCallback(async (messageContent) => {
    const content = messageContent.trim()
    
    // Check for price commands
    if (content.startsWith('!price') || content.startsWith('!movers')) {
      // This will be handled by the usePriceCommands hook
      return true
    }
    
    return false
  }, [])

  // Reset state when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setMessages({})
      setConversations([])
      setContacts([])
      setSystemMessages([])
      setError(null)
    }
  }, [isConnected])

  const value = {
    // State
    messages: messages,
    conversations,
    contacts,
    systemMessages,
    isLoading,
    error,
    isConnected: isConnected && !!walletClient,
    userId: address, // Add userId as the connected wallet address

    // Functions
    loadConversationMessages,
    sendMessage,
    getConversationMessages,
    addContact,
    reactToMessage,
    markMessageAsRead,
    setTyping,
    addSystemMessage,
    clearSystemMessages,
    getAllMessages,
    processCommand,

    // Utility
    createConversationKey,
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}