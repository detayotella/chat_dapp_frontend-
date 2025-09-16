import { publicClient } from './wallet'
import { createWalletClient, http, custom } from 'viem'
import { mainnet } from 'viem/chains'

const CONTRACT_ADDRESS = import.meta.env.VITE_ENS_CONTRACT_ADDRESS
const CONTRACT_ABI = [
  {
    inputs: [{ name: 'name', type: 'string' }],
    name: 'checkNameAvailability',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'imageHash', type: 'string' }
    ],
    name: 'registerUser',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]

// Check if a name is available
export const checkNameAvailability = async (name) => {
  try {
    const isAvailable = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'checkNameAvailability',
      args: [name]
    })
    return isAvailable
  } catch (error) {
    console.error('Error checking name availability:', error)
    throw error
  }
}

// Register user with ENS name and IPFS image hash
export const registerUser = async (name, imageHash, { walletClient, address }) => {
  if (!walletClient || !address) {
    throw new Error('No wallet found')
  }

  try {
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'registerUser',
      args: [name, imageHash],
      account: address
    })

    return hash
  } catch (error) {
    console.error('Error registering user:', error)
    throw error
  }
}