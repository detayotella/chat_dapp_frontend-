import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '../layouts/Root'
import ChatLayout from '../layouts/Chat'
import LandingPage from '../pages/LandingPage'
import ChatPage from '../pages/ChatPage'
import RegisterPage from '../pages/RegisterPage'
import FireDomainRegistration from '../pages/FireDomainRegistration'
import LegacyRegisterPage from '../pages/LegacyRegisterPage'
import { AuthProvider } from '../contexts/AuthContext'
import { Web3Provider } from '../contexts/Web3Context'
import { XMTPProvider } from '../contexts/XMTPContext'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'register',
        element: (
          <Web3Provider>
            <AuthProvider>
              <RegisterPage />
            </AuthProvider>
          </Web3Provider>
        ),
      },
      {
        path: 'register/fire-domain',
        element: (
          <Web3Provider>
            <AuthProvider>
              <FireDomainRegistration />
            </AuthProvider>
          </Web3Provider>
        ),
      },
      {
        path: 'register/legacy',
        element: (
          <Web3Provider>
            <AuthProvider>
              <LegacyRegisterPage />
            </AuthProvider>
          </Web3Provider>
        ),
      },
      {
        path: 'chat',
        element: (
          <Web3Provider>
            <AuthProvider>
              <XMTPProvider>
                <ChatLayout />
              </XMTPProvider>
            </AuthProvider>
          </Web3Provider>
        ),
        children: [
          {
            index: true,
            element: <ChatPage />,
          },
          {
            path: ':userId',
            element: <ChatPage />,
          },
        ],
      },
    ],
  },
])