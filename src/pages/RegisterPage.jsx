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
    <div className="min-h-screen bg-fire-gradient-subtle flex flex-col justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <span className="text-6xl animate-glow">🔥</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Welcome to <span className="text-fire-gradient">Fire Chat</span>
          </h1>
          <p className="text-gray-600 text-xl font-medium">
            The future of decentralized communication
          </p>
        </div>

        {/* Main Card */}
        <div className="card shadow-2xl space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Create Your Digital Identity
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Register your unique <span className="font-semibold text-fire-gradient">.fire domain</span> and 
              join the next generation of secure, decentralized messaging
            </p>
          </div>

          {/* Primary CTA */}
          <div className="space-y-6">
            <Link to="/register/fire-domain" className="btn-primary w-full text-center block text-lg py-4">
              <span className="text-2xl mr-3">🔥</span>
              Register Your .fire Domain
            </Link>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                ✨ Get your blockchain identity with a custom .fire domain NFT
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="border-t border-gray-100 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              What's Included:
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100">
                <div className="text-2xl mb-2">💎</div>
                <p className="text-sm font-medium text-gray-700">NFT Domain Ownership</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
                <div className="text-2xl mb-2">🌐</div>
                <p className="text-sm font-medium text-gray-700">Web3 Identity</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 border border-green-100">
                <div className="text-2xl mb-2">💬</div>
                <p className="text-sm font-medium text-gray-700">Secure Messaging</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                <div className="text-2xl mb-2">🎨</div>
                <p className="text-sm font-medium text-gray-700">Custom Profiles</p>
              </div>
            </div>
          </div>

          {/* Secondary Options */}
          <div className="border-t border-gray-100 pt-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">
                Need something different?
              </p>
              <div className="flex justify-center space-x-4">
                <Link to="/" className="btn-ghost text-sm">
                  ← Back to Home
                </Link>
                <Link to="/register/legacy" className="text-accent-600 hover:text-accent-700 font-medium text-sm">
                  Legacy Registration
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Powered by Ethereum blockchain technology
          </p>
        </div>
      </div>
    </div>
  )
}