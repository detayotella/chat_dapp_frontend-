import { useState, useEffect } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

export default function MessageInput({ 
  value, 
  onChange, 
  onSend, 
  placeholder = 'Type a message...', 
  disabled = false 
}) {
  const [message, setMessage] = useState(value || '')
  const [isSending, setIsSending] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  // Sync with external value prop
  useEffect(() => {
    setMessage(value || '')
  }, [value])

  const handleChange = (e) => {
    const newValue = e.target.value
    setMessage(newValue)
    onChange && onChange(newValue)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if ((!message.trim() && !selectedFile) || disabled || isSending) return

    try {
      setIsSending(true)
      const attachments = selectedFile ? [selectedFile] : []
      await onSend(message, attachments)
      setMessage('')
      setSelectedFile(null)
      onChange && onChange('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="border-t dark:border-gray-800">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex space-x-4">
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={message}
              onChange={handleChange}
              placeholder={disabled ? 'Loading...' : placeholder}
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-75"
              disabled={disabled || isSending}
            />
            
            {/* File input */}
            <input
              type="file"
              onChange={handleFileSelect}
              accept="image/*,video/*,.pdf,.doc,.docx"
              className="text-sm text-gray-500 dark:text-gray-400"
              disabled={disabled || isSending}
            />
            
            {selectedFile && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Selected: {selectedFile.name}
                <button 
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={(!message.trim() && !selectedFile) || disabled || isSending}
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