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
  const conversation = conversations.find(c => c.peerAddress === userId)
  const typingTimeoutRef = useRef(null)

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversation) return
    
    let mounted = true
    const loadMessages = async () => {
      try {
        const msgs = await conversation.messages()
        if (mounted) {
          setMessages(msgs)
        }
      } catch (err) {
        console.error('Error loading messages:', err)
      }
    }

    loadMessages()

    // Listen for new messages
    const unsubscribe = conversation.onMessage((message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [conversation])

  // Handle sending messages
  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversation) return

    try {
      await conversation.send(newMessage)
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message')
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

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">
          Conversation not found
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
              {conversation.peerAddress.slice(2, 4)}
            </div>
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {conversation.peerAddress.slice(0, 6)}...{conversation.peerAddress.slice(-4)}
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