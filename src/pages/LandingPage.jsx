import { WalletButton } from '../components/WalletButton'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'

export default function LandingPage() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              {/* Fire emoji with glow effect */}
              <div className="mb-8">
                <span className="text-6xl sm:text-8xl animate-glow">🔥</span>
              </div>
              
              <h1 className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl mb-6">
                <span className="text-fire-gradient">Fire Chat</span>
                <br />
                <span className="text-gray-700 text-3xl sm:text-4xl lg:text-5xl font-medium">
                  Decentralized Messaging
                </span>
              </h1>
              
              <p className="mt-6 text-xl leading-8 text-gray-600 max-w-2xl mx-auto">
                Own your digital identity with <span className="font-semibold text-fire-gradient">.fire domains</span>. 
                Chat securely on the blockchain with end-to-end encryption and full data ownership.
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                {!isConnected ? (
                  <div className="flex flex-col items-center gap-4">
                    <WalletButton />
                    <p className="text-sm text-gray-500">Connect your wallet to get started</p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/register" className="btn-primary">
                      🔥 Get Your .fire Domain
                    </Link>
                    <Link to="/chat" className="btn-secondary">
                      💬 Start Chatting
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-accent-gradient uppercase tracking-wide">
              Revolutionary Features
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              The Future of Communication
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Built on cutting-edge blockchain technology for maximum security and user control
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {/* Feature 1 */}
            <div className="card card-hover text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-200">
                🔥
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Custom .fire Domains</h3>
              <p className="text-gray-600">
                Create your unique .fire domain as an NFT. Easy to remember, impossible to fake, 
                and truly yours forever on the blockchain.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card card-hover text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform duration-200">
                🔒
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">End-to-End Encryption</h3>
              <p className="text-gray-600">
                Military-grade encryption ensures your conversations stay private. 
                Only you and your recipients can read your messages.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card card-hover text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform duration-200">
                🌐
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Decentralized Storage</h3>
              <p className="text-gray-600">
                Your data lives on the blockchain and IPFS, not corporate servers. 
                True ownership and privacy guaranteed.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card card-hover text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform duration-200">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Real-time messaging with blockchain security. Experience instant delivery 
                without compromising on decentralization.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card card-hover text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform duration-200">
                🎨
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Rich Profiles</h3>
              <p className="text-gray-600">
                Customize your profile with avatars, bio, and social links. 
                Express yourself while maintaining complete privacy control.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card card-hover text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform duration-200">
                🌍
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Network</h3>
              <p className="text-gray-600">
                Connect with users worldwide without borders or restrictions. 
                Truly global, truly free communication.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-fire-gradient py-24">
        <div className="mx-auto max-w-4xl text-center px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white sm:text-5xl mb-6">
            Ready to Own Your Digital Identity?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have taken control of their digital communication. 
            Register your .fire domain today and start chatting securely.
          </p>
          {!isConnected ? (
            <WalletButton />
          ) : (
            <Link to="/register" className="inline-flex items-center gap-3 bg-white text-orange-600 font-bold py-4 px-8 rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl">
              <span className="text-2xl">🔥</span>
              <span>Get Started Now</span>
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="text-3xl">🔥</span>
              <span className="ml-3 text-xl font-bold text-white">Fire Chat</span>
            </div>
            <p className="text-gray-400">
              Built with ❤️ for the decentralized web. 
              <span className="block mt-2 text-sm">
                Powered by Ethereum • IPFS • Blockchain Technology
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}