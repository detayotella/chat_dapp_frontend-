import { useState, useEffect } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useNavigate } from 'react-router-dom'
import { formatEther } from 'viem'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import FireDomainService from '../lib/fireDomains'
import FireDomainABI from '../contracts/abi/FireDomainRegistry.json'
import { useUserRegistration } from '../contexts/UserRegistrationContext'

const FIRE_DOMAIN_CONTRACT_ADDRESS = import.meta.env.VITE_FIRE_DOMAIN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

export default function FireDomainRegistration() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { openConnectModal } = useConnectModal()
  const navigate = useNavigate()
  const { markAsRegistered } = useUserRegistration()

  // Form state
  const [domainName, setDomainName] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [duration, setDuration] = useState(1) // years
  const [useDefaultImage, setUseDefaultImage] = useState(true)

  // UI state
  const [isChecking, setIsChecking] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isAvailable, setIsAvailable] = useState(null)
  const [registrationFee, setRegistrationFee] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [preview, setPreview] = useState(null)

  // Domain service instance
  const [domainService, setDomainService] = useState(null)

  // Initialize domain service
  useEffect(() => {
    if (walletClient && publicClient) {
      const contract = {
        address: FIRE_DOMAIN_CONTRACT_ADDRESS,
        abi: FireDomainABI.abi
      }

      const pinataConfig = {
        jwt: import.meta.env.VITE_PINATA_JWT
      }

      const service = new FireDomainService(contract, walletClient, publicClient, pinataConfig)
      setDomainService(service)
    }
  }, [walletClient, publicClient])

  // Load registration fee
  useEffect(() => {
    if (domainService) {
      loadRegistrationFee()
    }
  }, [domainService])

  const loadRegistrationFee = async () => {
    try {
      const fee = await domainService.getRegistrationFee()
      setRegistrationFee(fee)
    } catch (error) {
      console.error('Error loading registration fee:', error)
    }
  }

  // Check domain availability with debouncing
  useEffect(() => {
    if (!domainName || !domainService) {
      setIsAvailable(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsChecking(true)
      try {
        const available = await domainService.isDomainAvailable(domainName.toLowerCase())
        setIsAvailable(available)
        setError(available ? '' : 'Domain name is not available')
      } catch (error) {
        console.error('Error checking availability:', error)
        setError('Error checking domain availability')
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [domainName, domainService])

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image file must be less than 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      setImageFile(file)
      setUseDefaultImage(false)
      setError('')

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  // Handle domain registration
  const handleRegister = async (e) => {
    e.preventDefault()

    if (!isConnected) {
      openConnectModal?.()
      return
    }

    if (!domainService || !isAvailable) {
      setError('Please check domain availability first')
      return
    }

    setIsRegistering(true)
    setError('')

    try {
      const durationInSeconds = duration * 365 * 24 * 60 * 60

      const result = await domainService.registerDomain({
        domainName: domainName.toLowerCase(),
        duration: durationInSeconds,
        imageFile: useDefaultImage ? null : imageFile,
        customMetadata: {
          registeredBy: address,
          registrationSource: 'fire-domains-dapp'
        }
      })

      setSuccess(result)
      setDomainName('')
      setImageFile(null)
      setPreview(null)
      setUseDefaultImage(true)
      setIsAvailable(null)

      // Mark user as registered in the context
      markAsRegistered(result)

      // Auto-redirect to chat page after 3 seconds
      setTimeout(() => {
        navigate('/chat')
      }, 3000)

    } catch (error) {
      console.error('Registration error:', error)
      setError(error.message || 'Failed to register domain')
    } finally {
      setIsRegistering(false)
    }
  }

  // Domain name validation
  const isValidDomainName = (name) => {
    if (!name) return false
    if (name.length < 3 || name.length > 32) return false
    return /^[a-zA-Z0-9-]+$/.test(name) && !name.startsWith('-') && !name.endsWith('-')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fire-orange-50 via-white to-fire-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Home
            </button>
          </div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-fire-gray-900 mb-4">
              Register Your <span className="bg-gradient-to-r from-fire-orange-500 to-fire-red-500 bg-clip-text text-transparent">.fire</span> Domain
            </h1>
            <p className="text-fire-gray-600 text-lg">
              Create your unique blockchain identity with a custom .fire domain
            </p>
            {registrationFee && (
              <p className="text-sm text-fire-gray-500 mt-2">
                Registration fee: {formatEther(registrationFee)} ETH per year
              </p>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 mb-6">
              <h3 className="text-green-800 font-semibold mb-2 text-lg">
                🎉 Domain Registered Successfully!
              </h3>
              <div className="text-green-700 space-y-2">
                <p><strong>Domain:</strong> {success.fullDomain}</p>
                <p><strong>Token ID:</strong> {success.tokenId}</p>
                <p><strong>Expires:</strong> {new Date(success.expiresAt).toLocaleDateString()}</p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/chat')}
                    className="btn-primary"
                  >
                    🚀 Start Chatting Now
                  </button>
                  <div className="flex space-x-4">
                    <a
                      href={success.metadataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 underline font-medium"
                    >
                      View Metadata
                    </a>
                    <a
                      href={success.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 underline font-medium"
                    >
                      View Image
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <div className="card">
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Domain Name Input */}
              <div>
                <label className="block text-sm font-semibold text-fire-gray-700 mb-3">
                  Domain Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value.toLowerCase())}
                    placeholder="Enter domain name"
                    className="input pr-16"
                    disabled={isRegistering}
                  />
                  <div className="absolute right-4 top-3 text-fire-gray-500 font-semibold">
                    .fire
                  </div>
                </div>
                
                {/* Domain Status */}
                {domainName && (
                  <div className="mt-3">
                    {isChecking ? (
                      <p className="text-fire-gray-500 text-sm">Checking availability...</p>
                    ) : isValidDomainName(domainName) ? (
                      isAvailable === true ? (
                        <p className="text-green-600 text-sm font-medium">✅ Domain is available!</p>
                      ) : isAvailable === false ? (
                        <p className="text-red-600 text-sm font-medium">❌ Domain is not available</p>
                      ) : null
                    ) : (
                      <p className="text-red-600 text-sm font-medium">
                        Invalid domain name (3-32 characters, alphanumeric and hyphens only)
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-semibold text-fire-gray-700 mb-3">
                  Registration Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="input"
                  disabled={isRegistering}
                >
                  <option value={1}>1 Year</option>
                  <option value={2}>2 Years</option>
                  <option value={3}>3 Years</option>
                  <option value={5}>5 Years</option>
                  <option value={10}>10 Years</option>
                </select>
                {registrationFee && (
                  <p className="text-sm text-fire-gray-600 mt-2 font-medium">
                    Total cost: {formatEther(registrationFee * BigInt(duration))} ETH
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-fire-gray-700 mb-3">
                  Domain Image
                </label>
                
                <div className="space-y-4">
                  {/* Image Option Toggle */}
                  <div className="flex space-x-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={useDefaultImage}
                        onChange={() => {
                          setUseDefaultImage(true)
                          setImageFile(null)
                          setPreview(null)
                        }}
                        className="mr-3 w-4 h-4 text-fire-orange-500 border-2 border-fire-gray-300 focus:ring-fire-orange-500"
                        disabled={isRegistering}
                      />
                      <span className="text-fire-gray-700 font-medium">Generate Default Image</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={!useDefaultImage}
                        onChange={() => setUseDefaultImage(false)}
                        className="mr-3 w-4 h-4 text-fire-orange-500 border-2 border-fire-gray-300 focus:ring-fire-orange-500"
                        disabled={isRegistering}
                      />
                      <span className="text-fire-gray-700 font-medium">Upload Custom Image</span>
                    </label>
                  </div>

                  {/* Custom Image Upload */}
                  {!useDefaultImage && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="input"
                        disabled={isRegistering}
                      />
                      <p className="text-sm text-fire-gray-500 mt-2">
                        PNG, JPG, GIF up to 5MB. Recommended: 400x400px
                      </p>
                    </div>
                  )}

                  {/* Image Preview */}
                  {preview && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-fire-gray-700 mb-3">Preview:</p>
                      <img
                        src={preview}
                        alt="Domain image preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-fire-gray-200 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-lg p-4">
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* Register Button */}
              <button
                type="submit"
                disabled={
                  !isConnected ||
                  !domainName ||
                  !isValidDomainName(domainName) ||
                  isAvailable !== true ||
                  isRegistering ||
                  isChecking
                }
                className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isConnected ? (
                  'Connect Wallet to Register'
                ) : isRegistering ? (
                  'Registering Domain...'
                ) : isChecking ? (
                  'Checking Availability...'
                ) : (
                  `Register ${domainName ? domainName + '.fire' : 'Domain'}`
                )}
              </button>

              {/* Connect Wallet Button */}
              {!isConnected && (
                <button
                  type="button"
                  onClick={openConnectModal}
                  className="btn-secondary w-full py-4 text-lg font-semibold"
                >
                  Connect Wallet
                </button>
              )}
            </form>
          </div>

          {/* Info Section */}
          <div className="mt-8 card">
            <h2 className="text-xl font-bold text-fire-gray-900 mb-6">
              About <span className="bg-gradient-to-r from-fire-orange-500 to-fire-red-500 bg-clip-text text-transparent">.fire</span> Domains
            </h2>
            <div className="space-y-4 text-fire-gray-600">
              <div className="flex items-start space-x-3">
                <span className="text-fire-orange-500 text-lg">🔥</span>
                <p>
                  <strong className="text-fire-gray-700">Unique Identity:</strong> Your .fire domain serves as your unique 
                  blockchain identity across the decentralized web.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-fire-orange-500 text-lg">💎</span>
                <p>
                  <strong className="text-fire-gray-700">NFT Ownership:</strong> Each domain is an NFT that you fully own 
                  and can transfer or sell.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-fire-orange-500 text-lg">🌐</span>
                <p>
                  <strong className="text-fire-gray-700">Web3 Integration:</strong> Use your domain for wallet addresses, 
                  dApp usernames, and more.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-fire-orange-500 text-lg">📱</span>
                <p>
                  <strong className="text-fire-gray-700">Chat Integration:</strong> Seamlessly integrates with XMTP for 
                  decentralized messaging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}