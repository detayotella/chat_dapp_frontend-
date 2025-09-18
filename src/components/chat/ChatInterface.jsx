import { useState, useEffect, useRef } from 'react'
import { useChat } from '../../contexts/ChatContext'
import { UserProfile } from '../UserProfile'

export default function ChatInterface({ selectedUser, onBack }) {
  const { 
    getConversationMessages, 
    loadConversationMessages, 
    sendMessage, 
    isLoading 
  } = useChat()
  
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages when user changes
  useEffect(() => {
    if (selectedUser?.address) {
      loadMessages()
    }
  }, [selectedUser?.address])

  // Update messages when chat context changes
  useEffect(() => {
    if (selectedUser?.address) {
      const conversationMessages = getConversationMessages(selectedUser.address)
      setMessages(conversationMessages)
    }
  }, [selectedUser?.address, getConversationMessages])

  const loadMessages = async () => {
    if (!selectedUser?.address) return

    try {
      await loadConversationMessages(selectedUser.address)
    } catch (err) {
      console.error('Error loading messages:', err)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser?.address || sending) return

    setSending(true)
    try {
      await sendMessage(newMessage.trim(), selectedUser.address, selectedUser.domainName)
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      // Show error to user
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const groupMessagesByDate = (messages) => {
    const groups = []
    let currentDate = null

    messages.forEach(message => {
      const messageDate = new Date(message.timestamp).toDateString()
      
      if (messageDate !== currentDate) {
        currentDate = messageDate
        groups.push({
          type: 'date',
          date: message.timestamp
        })
      }
      
      groups.push({
        type: 'message',
        ...message,
        isOwn: message.sender.toLowerCase() === message.senderAddress?.toLowerCase()
      })
    })

    return groups
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="lg:hidden mr-3 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <UserProfile 
              address={selectedUser.address} 
              size="md" 
              showDomain={true}
            />
          </div>
          <div className="flex items-center text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Online
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.724-.4l-3.073.54a1 1 0 01-1.304-1.304l.54-3.073A8.955 8.955 0 015 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start your conversation</h3>
              <p className="text-gray-500">Send a message to {selectedUser.domainName}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {groupMessagesByDate(messages).map((item, index) => (
              <div key={index}>
                {item.type === 'date' ? (
                  <div className="flex justify-center">
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                      {formatDate(item.date)}
                    </span>
                  </div>
                ) : (
                  <div className={`flex ${item.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      item.isOwn 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}>
                      <p className="text-sm">{item.content}</p>
                      <p className={`text-xs mt-1 ${
                        item.isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(item.timestamp)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}