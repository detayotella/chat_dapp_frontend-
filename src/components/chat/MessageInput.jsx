import { useState, useEffect } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { useTypingIndicator } from '../../hooks/useTypingIndicator'
import debounce from 'lodash/debounce'

export default function MessageInput({ conversation, onSendMessage, isLoading }) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { peerIsTyping, sendTypingIndicator } = useTypingIndicator(conversation)

  // Debounced typing indicator
  const debouncedTypingIndicator = debounce(() => {
    sendTypingIndicator()
  }, 500)

  useEffect(() => {
    return () => {
      debouncedTypingIndicator.cancel()
    }
  }, [debouncedTypingIndicator])

  const handleChange = (e) => {
    setMessage(e.target.value)
    if (e.target.value.trim()) {
      debouncedTypingIndicator()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || isLoading || isSending) return

    try {
      setIsSending(true)
      await onSendMessage(message)
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="border-t dark:border-gray-800">
      {peerIsTyping && (
        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center">
            <span className="mr-2">Typing</span>
            <span className="flex space-x-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
            </span>
          </span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={handleChange}
            placeholder={isLoading ? 'Loading conversation...' : 'Type a message...'}
            className="flex-1 rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-75"
            disabled={isLoading || isSending}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading || isSending}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}