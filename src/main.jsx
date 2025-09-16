import './polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from './config/wagmi'
import { XMTPProvider } from './contexts/XMTPContext'
import { UserRegistrationProvider } from './contexts/UserRegistrationContext'
import '@rainbow-me/rainbowkit/styles.css'
import './index.css'

const queryClient = new QueryClient()
import MainLayout from './components/layout/MainLayout'
import ChatLayout from './layouts/ChatLayout'
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
      {
        path: '/chat',
        element: (
          <ProtectedRoute>
            <ChatLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: ':userId?',
            element: <ChatPage />,
          },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <UserRegistrationProvider>
            <XMTPProvider>
              <RouterProvider router={router} />
            </XMTPProvider>
          </UserRegistrationProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
