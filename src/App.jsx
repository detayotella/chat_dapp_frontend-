import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import { Web3Provider } from './providers/Web3Provider'
import { ChatProvider } from './contexts/ChatContext'
import { WalletButton } from './components/WalletButton'
import { useAccount } from 'wagmi'
import Register from './pages/Register'
import ChatPage from './pages/ChatPage'

function App() {
  return (
    <Web3Provider>
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-lg">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                  <div className="flex-shrink-0">
                    <h1 className="text-xl font-bold">Fire Chat DApp</h1>
                  </div>
                  <div>
                    <WalletButton />
                  </div>
                </div>
              </div>
            </nav>

            <main className="h-[calc(100vh-4rem)]">
              <Routes>
                <Route path="/" element={<RequireAuth><ChatPage /></RequireAuth>} />
                <Route path="/register" element={<RequireAuth><Register /></RequireAuth>} />
              </Routes>
            </main>
          </div>
        </Router>
      </ChatProvider>
    </Web3Provider>
  )
}

function RequireAuth({ children }) {
  const { isConnected } = useAccount()
  
  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="mb-4">Please connect your wallet to continue using Fire Chat</p>
        <WalletButton />
      </div>
    )
  }
  
  return children
}

export default App