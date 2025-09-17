import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useXMTP } from '../../contexts/XMTPContext'
import MessageList from './MessageList'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'

export default function ThreadView() {
  const { userId } = useParams()
  const { client, conversations, isLoading } = useXMTP()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const conversation = conversations.find(c => c.peerAddress === userId) || null
  const typingTimeoutRef = useRef(null)

  // Load messages when conversation changes
  useEffect(() => {
    if (!userId || !client) return
    
    let mounted = true
    const loadMessages = async () => {
      try {
        if (conversation) {
          // Real conversation
          const msgs = await conversation.messages()
          if (mounted) {
            setMessages(msgs)
          }

          // Set up message streaming
          const stream = conversation.streamMessages()
          stream.on('message', (message) => {
            if (mounted) {
              setMessages(prev => [...prev, message])
            }
          })

          return () => {
            stream.close()
          }
        } else {
          // Mock conversation - start with empty messages
          if (mounted) {
            setMessages([])
          }
        }
      } catch (err) {
        console.error('Error loading messages:', err)
        if (mounted) {
          setMessages([])
        }
      }
    }

    loadMessages()

    return () => {
      mounted = false
    }
  }, [conversation, userId, client])

  // Handle sending messages
  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      // Create message object for immediate display
      const newMsg = {
        id: Date.now().toString(), // Add unique ID for MessageList
        content: newMessage.trim(),
        senderAddress: client?.address || 'unknown',
        sent: new Date(),
        timestamp: new Date(),
        sender: client?.address || 'unknown'
      }

      // Add message to display immediately for better UX
      setMessages(prev => [...prev, newMsg])

      if (conversation) {
        // Real conversation - send via XMTP
        await conversation.send(newMessage)
        console.log('📤 Message sent via XMTP:', newMessage)
      } else if (userId && client) {
        // Create new conversation and send
        console.log('📤 Creating new conversation with:', userId)
        const newConvo = await client.conversations.newConversation(userId)
        await newConvo.send(newMessage)
        console.log('📤 Message sent to new conversation:', newMessage)
      } else {
        // Mock mode - just log
        console.log('📤 Mock message sent:', newMessage, 'to:', userId)
      }
      
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      
      // Remove the message we optimistically added if sending failed
      setMessages(prev => prev.slice(0, -1))
      
      alert('Failed to send message: ' + err.message)
    }
  }

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    setIsTyping(true)
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to clear typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  if (!userId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No conversation selected
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose a contact from the sidebar to start chatting
          </p>
        </div>
      </div>
    )
  }

  if (!conversation && userId && client) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Start a new conversation
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            This will be your first message to {userId.slice(0, 6)}...{userId.slice(-4)}
          </p>
          <form onSubmit={sendMessage} className="max-w-md mx-auto">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your first message..."
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white">
              {conversation?.peerAddress?.slice(2, 4) || userId?.slice(2, 4)}
            </div>
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {conversation?.peerAddress ? 
                `${conversation.peerAddress.slice(0, 6)}...${conversation.peerAddress.slice(-4)}` :
                `${userId?.slice(0, 6)}...${userId?.slice(-4)}`
              }
            </h2>
            {isTyping && (
              <p className="text-sm text-gray-500 dark:text-gray-400">typing...</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList 
        messages={messages} 
        conversation={conversation}
        isLoading={isLoading} 
      />

      {/* Message Input */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={sendMessage} className="flex items-center gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}