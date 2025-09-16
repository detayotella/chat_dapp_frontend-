import { Outlet, Link, useLocation } from 'react-router-dom'
import { WalletButton } from '../WalletButton'

export default function MainLayout() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-full flex-1 flex-col">
        {/* Navigation Header */}
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-4">
                <Link 
                  to="/" 
                  className="flex-shrink-0 flex items-center"
                >
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    🔥 Fire Chat
                  </h1>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <WalletButton />
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}