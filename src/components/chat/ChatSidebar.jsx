import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import UserDirectory from '../UserDirectory'
import { UserProfile } from '../UserProfile'
import { useChat } from '../../contexts/ChatContext'
import { PriceBotProvider, usePriceBotContext } from '../../contexts/PriceBotContext'
import { PriceTicker, MarketSummary } from './PriceCard'

// Internal component with price bot functionality
function ChatSidebarWithPriceBot() {
  const { processMessage, prices, triggerPriceUpdate, triggerMarketSummary } = usePriceBotContext()
  const { address } = useAccount()
  const navigate = useNavigate()
  const { 
    getConversationMessages, 
    loadConversationMessages, 
    sendMessage, 
    getAllMessages,
    createConversationKey,
    conversations,
    isLoading 
  } = useChat()
  
  const [activeTab, setActiveTab] = useState('registered')
  const [searchQuery, setSearchQuery] = useState('')
  const [recentChats, setRecentChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPriceTicker, setShowPriceTicker] = useState(true)

  // Load recent chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem(`recent-chats-${address}`)
    if (savedChats) {
      setRecentChats(JSON.parse(savedChats))
    }
  }, [address])

  // Enhanced message handler with price command support
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    try {
      setIsSending(true)
      const messageContent = newMessage.trim()
      
      // Check if it's a price command
      const isCommand = await processMessage(messageContent)
      
      if (!isCommand && activeChat) {
        // Send regular message to blockchain
        console.log('Sending message to:', activeChat.address, 'content:', messageContent)
        await sendMessage(messageContent, activeChat.address, activeChat.domainName || '')
      }
      
      setNewMessage('')
      
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message: ' + error.message)
    } finally {
      setIsSending(false)
    }
  }

  // Add to recent chats function
  const addToRecentChats = (user) => {
    setRecentChats(prev => {
      const filtered = prev.filter(chat => chat.address !== user.address)
      const updated = [{ ...user, lastMessageAt: Date.now() }, ...filtered].slice(0, 20)
      localStorage.setItem(`recent-chats-${address}`, JSON.stringify(updated))
      return updated
    })
  }

  // Handle user selection
  const handleUserSelect = (user) => {
    loadConversationMessages(address, user.address)
    addToRecentChats(user)
    setActiveChat(user)
    setActiveTab('chat')
  }

  // Get filtered recent chats
  const filteredRecentChats = recentChats.filter(chat =>
    chat.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.address?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get current conversation messages (including system messages)
  const currentMessages = activeChat 
    ? getAllMessages(createConversationKey(address, activeChat.address))
    : []

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-gradient-to-b from-fire-orange-50 to-fire-red-50 border-r-2 border-fire-orange-200 flex flex-col">
        {/* Header with Price Ticker */}
        <div className="p-4 border-b border-fire-orange-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-fire-orange-500 to-fire-red-500 bg-clip-text text-transparent">
              🔥 Fire Chat
            </h1>
            <button
              onClick={() => setShowProfileModal(true)}
              className="btn-ghost p-2"
              title="Profile"
            >
              👤
            </button>
          </div>
          
          {/* Price Ticker */}
          {showPriceTicker && prices && Object.keys(prices).length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-fire-gray-600">Market Overview</span>
                <button
                  onClick={() => setShowPriceTicker(false)}
                  className="text-fire-gray-400 hover:text-fire-gray-600 text-sm"
                >
                  ×
                </button>
              </div>
              <PriceTicker prices={prices} maxCoins={3} />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={triggerPriceUpdate}
                  className="text-xs text-fire-orange-500 hover:text-fire-orange-600"
                >
                  📊 Full Update
                </button>
                <button
                  onClick={triggerMarketSummary}
                  className="text-xs text-fire-orange-500 hover:text-fire-orange-600"
                >
                  📈 Summary
                </button>
              </div>
            </div>
          )}
          
          {/* Navigation Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('registered')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'registered'
                  ? 'bg-fire-orange-500 text-white'
                  : 'text-fire-gray-600 hover:bg-fire-orange-100'
              }`}
            >
              🌐 Users
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'recent'
                  ? 'bg-fire-orange-500 text-white'
                  : 'text-fire-gray-600 hover:bg-fire-orange-100'
              }`}
            >
              💬 Chats
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-fire-orange-200">
          <input
            type="text"
            placeholder="Search users or chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-fire-gray-300 rounded-lg focus:ring-2 focus:ring-fire-orange-500 focus:border-fire-orange-500"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'registered' && (
            <div className="h-full overflow-y-auto p-4">
              <UserDirectory
                searchQuery={searchQuery}
                onUserSelect={handleUserSelect}
              />
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="h-full overflow-y-auto">
              {filteredRecentChats.length > 0 ? (
                <div className="p-2">
                  {filteredRecentChats.map((chat) => (
                    <button
                      key={chat.address}
                      onClick={() => handleUserSelect(chat)}
                      className={`w-full p-3 mb-2 rounded-lg text-left transition-colors ${
                        activeChat?.address === chat.address
                          ? 'bg-fire-orange-500 text-white'
                          : 'hover:bg-fire-orange-100 text-fire-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-fire-orange-400 to-fire-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {chat.username?.[0] || '👤'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {chat.username || `${chat.address.slice(0, 6)}...${chat.address.slice(-4)}`}
                          </p>
                          <p className="text-sm opacity-75 truncate">
                            {chat.address.slice(0, 10)}...
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-fire-gray-500">
                  <p>No recent chats</p>
                  <p className="text-sm mt-2">Start a conversation from the Users tab</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-fire-orange-200">
          <div className="flex space-x-2 mb-3">
            <button
              onClick={() => navigate('/')}
              className="btn-ghost flex-1 py-2 text-sm"
            >
              🏠 Home
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn-ghost flex-1 py-2 text-sm"
            >
              📝 Register
            </button>
          </div>
          <div className="text-xs text-fire-gray-600 space-y-1">
            <p>🌟 {filteredRecentChats.length || 0} recent chats</p>
            <p>🔗 Connected to Sepolia network</p>
            <p className="text-fire-orange-500">💰 Price commands: !price, !movers</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-fire-gray-200 bg-gradient-to-r from-fire-orange-50 to-fire-red-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-fire-orange-400 to-fire-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  {activeChat.username?.[0] || '👤'}
                </div>
                <div>
                  <h2 className="font-bold text-fire-gray-900">
                    {activeChat.username || `${activeChat.address.slice(0, 6)}...${activeChat.address.slice(-4)}`}
                  </h2>
                  <p className="text-sm text-fire-gray-600">
                    {activeChat.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.length > 0 ? (
                currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isSystem 
                        ? 'justify-center'
                        : message.sender === address 
                          ? 'justify-end' 
                          : 'justify-start'
                    }`}
                  >
                    {message.isSystem ? (
                      <div className="max-w-4xl w-full">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                          <div className="text-sm text-blue-600 mb-2 font-medium">
                            🤖 {message.sender}
                          </div>
                          <div className="text-fire-gray-700 whitespace-pre-wrap">
                            {message.content}
                          </div>
                          <div className="text-xs text-blue-500 mt-2">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender === address
                            ? 'bg-gradient-to-r from-fire-orange-500 to-fire-red-500 text-white'
                            : 'bg-fire-gray-100 text-fire-gray-900'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === address ? 'text-fire-orange-100' : 'text-fire-gray-500'
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-fire-gray-500 mt-8">
                  <p>No messages yet</p>
                  <p className="text-sm mt-2">Start the conversation!</p>
                  <div className="mt-4 p-4 bg-fire-orange-50 rounded-lg">
                    <p className="text-sm text-fire-gray-600 mb-2">💡 Try these commands:</p>
                    <div className="space-y-1 text-xs text-fire-orange-600">
                      <p><code>!price</code> - Show all crypto prices</p>
                      <p><code>!price BTC</code> - Show Bitcoin price</p>
                      <p><code>!movers</code> - Show top gainers/losers</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-fire-gray-200 bg-fire-gray-50">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message or !price for crypto prices..."
                  className="flex-1 px-4 py-3 border border-fire-gray-300 rounded-xl focus:ring-2 focus:ring-fire-orange-500 focus:border-fire-orange-500"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? '⏳' : '🚀'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-fire-orange-50 to-fire-red-50">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-fire-gray-900 mb-4">
                Welcome to Fire Chat
              </h2>
              <p className="text-fire-gray-600 mb-6">
                Select a user from the sidebar to start chatting or try price commands!
              </p>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-fire-gray-900 mb-2">🤖 Price Bot Commands:</h3>
                <div className="space-y-2 text-sm text-fire-gray-600 text-left">
                  <p><code className="bg-fire-gray-100 px-2 py-1 rounded">!price</code> - Show all crypto prices</p>
                  <p><code className="bg-fire-gray-100 px-2 py-1 rounded">!price BTC</code> - Show specific coin price</p>
                  <p><code className="bg-fire-gray-100 px-2 py-1 rounded">!movers</code> - Show top gainers/losers</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfile onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  )
}

// Main export wrapped with PriceBotProvider
export default function ChatSidebar() {
  return (
    <PriceBotProvider>
      <ChatSidebarWithPriceBot />
    </PriceBotProvider>
  )
}