import { Outlet } from 'react-router-dom'
import UserList from '../components/chat/UserList'
import { useXMTP } from '../contexts/XMTPContext'

export default function ChatLayout() {
  const { users, isLoading } = useXMTP()

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
          </div>
        ) : (
          <UserList users={users} />
        )}
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}