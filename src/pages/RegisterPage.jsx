import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Link } from 'react-router-dom'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()

  // Redirect to Fire Domain registration for new users
  useEffect(() => {
    if (isConnected) {
      navigate('/register/fire-domain')
    }
  }, [isConnected, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-orange-500">Fire</span> Chat
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            The future of decentralized communication
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Get Started
            </h2>
            <p className="text-gray-600 mb-6">
              Create your unique .fire domain to start chatting on the decentralized web
            </p>
          </div>

          {/* Fire Domain Registration */}
          <div className="space-y-4">
            <Link
              to="/register/fire-domain"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 text-center block"
            >
              🔥 Register .fire Domain
            </Link>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Get your blockchain identity with a custom .fire domain
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              What you get:
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-orange-500 mr-3">💎</span>
                <span className="text-gray-600">NFT domain ownership</span>
              </div>
              <div className="flex items-center">
                <span className="text-orange-500 mr-3">🌐</span>
                <span className="text-gray-600">Web3 identity across dApps</span>
              </div>
              <div className="flex items-center">
                <span className="text-orange-500 mr-3">💬</span>
                <span className="text-gray-600">Decentralized chat with XMTP</span>
              </div>
              <div className="flex items-center">
                <span className="text-orange-500 mr-3">🎨</span>
                <span className="text-gray-600">Custom profile images</span>
              </div>
            </div>
          </div>

          {/* Legacy Registration Option */}
          <div className="border-t pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">
                Already have a legacy username?
              </p>
              <Link
                to="/register/legacy"
                className="text-blue-500 hover:text-blue-600 underline text-sm"
              >
                Use Legacy Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}