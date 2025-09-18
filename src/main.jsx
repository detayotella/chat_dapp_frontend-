import './polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from './config/wagmi'
import { ChatProvider } from './contexts/ChatContext'
import { UserRegistrationProvider } from './contexts/UserRegistrationContext'
import '@rainbow-me/rainbowkit/styles.css'
import './index.css'

// Global error handlers to catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.warn('🚨 Unhandled promise rejection:', event.reason)
  // Prevent the browser from logging these errors to the console
  event.preventDefault()
})

window.addEventListener('error', (event) => {
  console.warn('🚨 Global error:', event.error)
})

const queryClient = new QueryClient()
import MainLayout from './components/layout/MainLayout'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import FireDomainRegistration from './pages/FireDomainRegistration'
import ChatPage from './pages/ChatPage'
import ProtectedRoute from './components/ProtectedRoute'

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/register/fire-domain',
        element: <FireDomainRegistration />,
      },
    ],
  },
  {
    path: '/chat',
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <UserRegistrationProvider>
            <ChatProvider>
              <RouterProvider router={router} />
            </ChatProvider>
          </UserRegistrationProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
