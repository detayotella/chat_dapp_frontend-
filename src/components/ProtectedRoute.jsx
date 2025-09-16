import { Navigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useUserRegistration } from '../contexts/UserRegistrationContext'
import { WalletButton } from './WalletButton'

export default function ProtectedRoute({ children }) {
  const { isConnected } = useAccount()
  const { isRegistered, isLoading, primaryDomain } = useUserRegistration()

  // Show loading while checking registration status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking registration status...</p>
        </div>
      </div>
    )
  }

  // If wallet not connected, show connect prompt
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600">Please connect your wallet to access the chat</p>
          </div>
          <WalletButton />
          <div className="mt-4">
            <a 
              href="/" 
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  // If wallet connected but not registered, show registration prompt
  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Required</h2>
            <p className="text-gray-600 mb-6">
              You need to register a .fire domain to access the chat. 
              Your domain serves as your unique identity in the chat.
            </p>
          </div>
          
          <div className="space-y-3">
            <a
              href="/register/fire-domain"
              className="block w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              🔥 Register Your .fire Domain
            </a>
            <a 
              href="/" 
              className="block w-full text-sm text-gray-500 hover:text-gray-700 underline py-2"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  // User is registered, show the protected content
  return children
}