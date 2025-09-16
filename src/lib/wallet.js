import { createPublicClient, http, createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

// Create a public client for reading from the blockchain
export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

// Safely access ethereum provider
const getProvider = () => {
  if (typeof window === 'undefined') return null
  return window?.ethereum || null
}

// Function to check if MetaMask is installed
export const isMetaMaskAvailable = () => {
  const provider = getProvider()
  return provider?.isMetaMask || false
}

// Function to connect wallet and return the wallet client and account
export const connectWallet = async () => {
  const provider = getProvider()
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask is not installed')
  }

  try {
    // Request account access
    const [account] = await provider.request({ 
      method: 'eth_requestAccounts' 
    })

    // Create a wallet client
    const walletClient = createWalletClient({
      chain: mainnet,
      transport: custom(provider)
    })

    return { walletClient, account }
  } catch (error) {
    console.error('Error connecting wallet:', error)
    throw error
  }
}