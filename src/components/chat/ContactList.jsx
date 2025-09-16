import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useXMTP } from '../../contexts/XMTPContext'
import { formatDistanceToNow } from 'date-fns'
import { EllipsisVerticalIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function ContactList() {
  const { conversations = [], isLoading } = useXMTP()
  const { userId } = useParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredConversations = conversations.filter(conv =>
    conv.peerAddress.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 animate-pulse">
          Loading conversations...
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No conversations found
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredConversations.map(conversation => {
              const isSelected = conversation.peerAddress === userId
              return (
                <li
                  key={conversation.peerAddress}
                  className={`
                    hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer
                    ${isSelected ? 'bg-gray-100 dark:bg-gray-600' : ''}
                  `}
                  onClick={() => navigate(`/chat/${conversation.peerAddress}`)}
                >
                  <div className="relative flex items-center space-x-4 px-4 py-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white">
                        {conversation.peerAddress.slice(2, 4)}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conversation.peerAddress.slice(0, 6)}...{conversation.peerAddress.slice(-4)}
                        </p>
                        {conversation.lastMessage && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(conversation.lastMessage.sent), {
                              addSuffix: true,
                            })}
                          </p>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 relative">
                      <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Start New Chat */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/chat')}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Start New Chat
        </button>
      </div>
    </div>
  )
}