import { useState, useEffect } from 'react'
import { useXMTP } from '../contexts/XMTPContext'
import { useChatRegistry } from '../hooks/useChatRegistry'
import { useAccount } from 'wagmi'
import { startConversation, sendMessage } from '../lib/xmtp-v3'

export default function Chat() {
  const { address } = useAccount()
  const { client, conversations } = useXMTP()
  const { profile } = useChatRegistry()
  
  const [recipients, setRecipients] = useState([])
  const [newChatAddress, setNewChatAddress] = useState('')
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState(null)

  // Load conversations when client is ready
  useEffect(() => {
    if (!conversations) return
    
    const addresses = conversations.map(convo => convo.peerAddress)
    setRecipients(addresses)
  }, [conversations])

  // Start new chat
  const startNewChat = async (e) => {
    e.preventDefault()
    if (!newChatAddress || !client) return

    try {
      const conversation = await startConversation(newChatAddress)
      setRecipients(prev => [...prev, newChatAddress])
      setSelectedChat(conversation)
      setNewChatAddress('')
    } catch (err) {
      console.error('Error starting new chat:', err)
      setError(err.message)
    }
  }

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!selectedChat || !newMessage) return

    try {
      const sent = await sendMessage(selectedChat, newMessage)
      setMessages(prev => [...prev, {
        sender: address,
        content: newMessage,
        timestamp: new Date()
      }])
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err.message)
    }
  }

  // Load and stream messages when chat is selected
  useEffect(() => {
    if (!selectedChat) return

    const loadMessages = async () => {
      try {
        const msgs = await selectedChat.messages()
        setMessages(msgs.map(msg => ({
          sender: msg.senderAddress,
          content: msg.content,
          timestamp: msg.sent
        })))

        // Set up message streaming
        const stream = selectedChat.streamMessages()
        stream.on('message', (msg) => {
          setMessages(prev => [...prev, {
            sender: msg.senderAddress,
            content: msg.content,
            timestamp: msg.sent
          }])
        })

        return () => {
          stream.close()
        }
      } catch (err) {
        console.error('Error loading messages:', err)
        setError(err.message)
      }
    }

    loadMessages()
  }, [selectedChat])

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-50 border-r">
        <div className="p-4">
          <form onSubmit={startNewChat} className="mb-4">
            <input
              type="text"
              value={newChatAddress}
              onChange={(e) => setNewChatAddress(e.target.value)}
              placeholder="Enter address to start chat"
              className="w-full p-2 border rounded"
            />
            <button
              type="submit"
              className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              New Chat
            </button>
          </form>

          <div className="space-y-2">
            {recipients.map((recipient) => (
              <button
                key={recipient}
                onClick={() => setSelectedChat(conversations.find(c => c.peerAddress === recipient))}
                className={`w-full p-2 text-left rounded ${
                  selectedChat?.peerAddress === recipient ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
              >
                {recipient}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`mb-4 ${
                    message.sender === address ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-2 rounded ${
                      message.sender === address
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat or start a new conversation
          </div>
        )}
      </div>

      {error && (
        <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  )
}