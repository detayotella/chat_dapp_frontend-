import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useChatRegistry } from '../hooks/useChatRegistry'
import { uploadToIPFS } from '../lib/ipfs'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const { address } = useAccount()
  const { register, isRegistering } = useChatRegistry()
  
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsUploading(true)
    setError(null)

    try {
      // Upload avatar to IPFS
      const avatarUrl = await uploadToIPFS(avatar)
      
      // Register user in the smart contract
      await register({
        args: [username, avatarUrl],
      })

      // Navigate to chat after successful registration
      navigate('/')
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fire-orange-50 via-white to-fire-purple-50 flex items-center justify-center px-6 py-12">
      <div className="card max-w-lg w-full">
        <h2 className="text-3xl font-bold mb-6 text-fire-gray-900 text-center">Complete Your Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-fire-gray-700 mb-3">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="Choose a username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-fire-gray-700 mb-3">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])}
              className="input file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-fire-orange-500 file:text-white hover:file:bg-fire-orange-600"
              required
            />
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm font-medium">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading || isRegistering}
            className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading || isRegistering ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  )
}