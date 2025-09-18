import { useState } from 'react'
import { useUserProfile } from '../hooks/useUserProfile'

function UserAvatar({ profile, size = 'md', onClick }) {
  const [imageError, setImageError] = useState(false)
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm', 
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg'
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const getInitials = (address) => {
    return address ? address.slice(2, 4).toUpperCase() : '??'
  }

  const hasProfileImage = profile?.imageUrl && !imageError

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer border-2 border-blue-500 hover:border-blue-400 transition-colors ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      {hasProfileImage ? (
        <img
          src={profile.imageUrl}
          alt={profile.fullDomain || 'User avatar'}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
          {getInitials(profile?.address)}
        </div>
      )}
    </div>
  )
}

function UserProfile({ address, size = 'md', showDomain = true, onClick, className = '' }) {
  const { profile, loading, error } = useUserProfile(address)

  if (loading) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className={`${size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12'} rounded-full bg-gray-300 animate-pulse`} />
        {showDomain && (
          <div className="flex flex-col space-y-1">
            <div className="h-4 bg-gray-300 rounded animate-pulse w-24" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
          </div>
        )}
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <UserAvatar profile={{ address }} size={size} onClick={onClick} />
        {showDomain && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <span className="text-xs text-gray-500">No domain registered</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <UserAvatar profile={profile} size={size} onClick={onClick} />
      {showDomain && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {profile.fullDomain || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
          </span>
          <span className="text-xs text-gray-500">
            {profile.isPrimary ? 'Primary domain' : profile.domainName ? 'Domain owner' : 'No domain'}
          </span>
        </div>
      )}
    </div>
  )
}

export { UserProfile, UserAvatar }