import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { uploadToIPFS } from '../lib/ipfs'
import { useChatRegistry } from '../hooks/useChatRegistry'

export default function LegacyRegisterPage() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const { register, isRegistering, resolveUsername, isResolvingUsername } = useChatRegistry()
  
  const [name, setName] = useState('')
  const [image, setImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isAvailable, setIsAvailable] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Update availability when name changes
  useEffect(() => {
    if (!name) {
      setIsAvailable(null)
      return
    }
    
    const checkAvailability = async () => {
      try {
        const resolvedAddress = await resolveUsername(name)
        setIsAvailable(resolvedAddress === null || resolvedAddress === '0x0000000000000000000000000000000000000000')
      } catch (error) {
        console.error('Error checking availability:', error)
        setIsAvailable(null)
      }
    }

    const timer = setTimeout(checkAvailability, 500)
    return () => clearTimeout(timer)
  }, [name, resolveUsername])

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    if (!name || !image || !isAvailable) {
      setError('Please fill in all fields and ensure name is available')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Upload image to IPFS
      const imageHash = await uploadToIPFS(image)

      // Register user on the smart contract
      await register({ args: [name, imageHash] })

      // Navigate to chat
      navigate('/chat')
    } catch (err) {
      console.error('Error registering:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fire-orange-50 via-white to-fire-purple-50 flex flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold leading-9 tracking-tight text-fire-gray-900">
          Legacy Profile Registration
        </h2>
        <p className="mt-4 text-center text-fire-gray-600">
          Register with the legacy chat registry system
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold leading-6 text-fire-gray-700 mb-3">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Enter your desired username"
                />
              </div>
              {name && (
                <p className={`mt-3 text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {isAvailable ? '✅ Username is available!' : '❌ Username is not available'}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-semibold leading-6 text-fire-gray-700 mb-3">
              Profile Image
              </label>
              <div className="mt-3 flex flex-col items-center">
                {previewUrl && (
                  <div className="mb-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-32 w-32 rounded-full object-cover border-4 border-fire-orange-200 shadow-lg"
                    />
                  </div>
                )}
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-fire-orange-500 file:text-white hover:file:bg-fire-orange-600"
                />
              </div>
            </div>

            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium">
                  {error}
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || isRegistering || !isAvailable || !image}
                className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || isRegistering ? 'Registering...' : 'Register Profile'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-fire-gray-600">
              Prefer the new system?{' '}
              <a href="/register/fire-domain" className="text-fire-orange-500 hover:text-fire-orange-600 underline font-medium">
                Register a .fire domain instead
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}