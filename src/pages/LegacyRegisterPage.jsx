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
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Legacy Profile Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Register with the legacy chat registry system
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
              Username
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 dark:bg-gray-800 sm:text-sm sm:leading-6"
                placeholder="Enter your desired username"
              />
            </div>
            {name && (
              <p className={`mt-2 text-sm ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {isAvailable ? 'Username is available!' : 'Username is not available'}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
              Profile Image
            </label>
            <div className="mt-2 flex flex-col items-center">
              {previewUrl && (
                <div className="mb-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-32 w-32 rounded-full object-cover"
                  />
                </div>
              )}
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || isRegistering || !isAvailable || !image}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-400"
            >
              {isLoading || isRegistering ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Prefer the new system?{' '}
            <a href="/register/fire-domain" className="text-indigo-600 hover:text-indigo-500 underline">
              Register a .fire domain instead
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}