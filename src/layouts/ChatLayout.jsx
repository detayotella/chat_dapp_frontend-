import { useState } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import ContactList from '../components/chat/ContactList'
import UserSearch from '../components/chat/UserSearch'
import { WalletButton } from '../components/WalletButton'

export default function ChatLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const navigate = useNavigate()

  const handleStartChat = (address) => {
    navigate(`/chat/${address}`)
    setIsSearchOpen(false)
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Chat Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Back to Home
              </Link>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chat
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                {isSearchOpen ? 'Show Contacts' : 'Find Users'}
              </button>
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for user list */}
        <div className="hidden md:flex md:w-80 md:flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
            {isSearchOpen ? (
              <UserSearch onStartChat={handleStartChat} />
            ) : (
              <ContactList />
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex flex-1 flex-col">
          <main className="flex-1 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}