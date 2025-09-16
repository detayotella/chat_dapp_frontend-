import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

function UserItem({ user, isActive }) {
  return (
    <Link
      to={`/chat/${user.address}`}
      className={`flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
        isActive ? 'bg-gray-50 dark:bg-gray-800' : ''
      }`}
    >
      <div className="flex-shrink-0">
        <img
          src={user.imageUrl}
          alt={user.name}
          className="h-10 w-10 rounded-full"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
          {user.name}
        </p>
        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
          {user.address.slice(0, 6)}...{user.address.slice(-4)}
        </p>
      </div>
    </Link>
  )
}

export default function UserList({ users = [] }) {
  const { userId } = useParams()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b dark:border-gray-800">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y dark:divide-gray-800">
          {filteredUsers.map((user) => (
            <UserItem
              key={user.address}
              user={user}
              isActive={userId === user.address}
            />
          ))}
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No users found
          </div>
        )}
      </div>
    </div>
  )
}