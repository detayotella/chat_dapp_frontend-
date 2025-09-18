import React, { useState, useMemo } from 'react'
import { useChat } from '../contexts/ChatContext'
import { useAccount } from 'wagmi'
import ThreadView from '../components/chat/ThreadView'
import ContactList from '../components/chat/ContactList'
import UserSearch from '../components/chat/UserSearch'

export default function Chat() {
  const { address } = useAccount()
  const { 
    addContact, 
    contacts, 
    messages, 
    userId,
    isConnected 
  } = useChat()
  
  const [showAddContact, setShowAddContact] = useState(false)
  const [newContactAddress, setNewContactAddress] = useState('')
  const [selectedContact, setSelectedContact] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [contactError, setContactError] = useState('')  // Handle adding a new contact
  const handleAddContact = async (e) => {
    e.preventDefault()
    if (!newContactAddress.trim()) return
    
    setIsAddingContact(true)
    setContactError('')
    
    try {
      await addContact(newContactAddress.trim())
      setNewContactAddress('')
      setShowAddContact(false)
      alert('Contact added successfully! 🎉')
    } catch (error) {
      console.error('Error adding contact:', error)
      setContactError(error.message || 'Failed to add contact')
    } finally {
      setIsAddingContact(false)
    }
  }  // Get unique contacts from messages and added contacts
  const getAllMessages = () => {
    const allMessages = []
    Object.values(messages).forEach(conversationMessages => {
      if (Array.isArray(conversationMessages)) {
        allMessages.push(...conversationMessages)
      }
    })
    return allMessages
  }

  const allMessages = getAllMessages()
  const allContactsRaw = [...new Set([
    ...contacts,
    ...allMessages.map(msg => msg.sender === userId ? msg.recipient : msg.sender)
  ])].filter(contact => contact && contact !== userId)

  // Apply search filter to contacts
  const allContacts = useMemo(() => {
    if (!searchTerm.trim()) {
      return allContactsRaw
    }
    return allContactsRaw.filter(contact => 
      contact.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [allContactsRaw, searchTerm])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Fire Chat</h1>
            <div className="flex items-center space-x-2">
              {/* Contract Connection Status */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <button
                onClick={() => setShowAddContact(!showAddContact)}
                className="w-8 h-8 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors flex items-center justify-center"
                title="Add Contact"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Add Contact Form */}
          {showAddContact && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
              <form onSubmit={handleAddContact} className="space-y-3">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Wallet Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={newContactAddress}
                    onChange={(e) => {
                      setNewContactAddress(e.target.value)
                      setContactError('')
                    }}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    disabled={isAddingContact}
                  />
                  {contactError && (
                    <p className="text-red-600 text-xs mt-1">{contactError}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={isAddingContact || !newContactAddress.trim()}
                    className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingContact ? 'Adding...' : 'Add Contact'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddContact(false)
                      setContactError('')
                      setNewContactAddress('')
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                    disabled={isAddingContact}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Contact List */}
                {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {allContacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm font-medium">No contacts found</p>
              <p className="text-xs text-gray-400 mt-1">
                {searchTerm ? 'Try adjusting your search' : 'Add a contact to start chatting'}
              </p>
            </div>
          ) : (
            allContacts.map((contact) => {
              const lastMessage = getLastMessage(contact)
              const conversationId = `${userId}-${contact}`
              const isSelected = selectedContact === contact
              
              return (
                <div
                  key={contact}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-indigo-50 border-indigo-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {contact.slice(2, 4).toUpperCase()}
                    </div>
                    
                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {contact.slice(0, 6)}...{contact.slice(-4)}
                        </p>
                        {lastMessage && (
                          <span className="text-xs text-gray-500">
                            {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {lastMessage ? lastMessage.content || 'No messages yet' : 'No messages yet'}
                      </p>
                    </div>
                    
                    {/* Online indicator */}
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <ThreadView
            conversationId={`${userId}-${selectedContact}`}
            recipientAddress={selectedContact}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.646-.4l-2.854 1.427a.5.5 0 01-.708-.708L8.219 17.146A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to Fire Chat
              </h2>
              <p className="text-gray-600 mb-4">
                Select a contact from the sidebar to start chatting, or add a new contact to begin a conversation.
              </p>
              {allContacts.length === 0 && (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                      <p className="font-medium mb-1">Try these sample addresses for testing:</p>
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setNewContactAddress('0x742d35Cc6634C0532925a3b8D8e6Cf0A79b28c7b')
                            setShowAddContact(true)
                          }}
                          className="block w-full text-left px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          📱 0x742d...8c7b (Sample Contact 1)
                        </button>
                        <button
                          onClick={() => {
                            setNewContactAddress('0x8ba1f109551bD432803012645Hac136c86A11A')
                            setShowAddContact(true)
                          }}
                          className="block w-full text-left px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          📱 0x8ba1...1A11 (Sample Contact 2)
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 bg-blue-50 p-3 rounded">
                      <p className="font-medium text-blue-700">💡 How Fire Chat Works:</p>
                      <p>1. Connect your wallet to Sepolia network</p>
                      <p>2. Add contact addresses you want to chat with</p>
                      <p>3. Messages are sent via smart contract on blockchain</p>
                      <p>4. All conversations are decentralized and on-chain</p>
                    </div>
                  </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}