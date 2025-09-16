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
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Choose a username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
            className="mt-1 block w-full"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Registering...' : 'Complete Registration'}
        </button>
      </form>
    </div>
  )
}