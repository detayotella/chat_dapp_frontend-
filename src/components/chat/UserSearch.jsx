import { useState } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { useChat } from '../../contexts/ChatContext'

export default function UserSearch({ onStartChat }) {
  const [searchQuery, setSearchQuery] = useState('')
  const { isLoading } = useChat()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!searchQuery) return

    // Clean up the address - remove spaces and validate
    const address = searchQuery.trim()
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      alert('Please enter a valid Ethereum address')
      return
    }

    onStartChat(address)
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Enter a wallet address to chat with..."
          className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!searchQuery || isLoading}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Enter an Ethereum address to start a new chat conversation
      </p>
    </div>
  )
}