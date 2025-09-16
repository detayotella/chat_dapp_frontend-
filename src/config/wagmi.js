import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, hardhat } from 'viem/chains'

export const config = getDefaultConfig({
  appName: 'Fire Chat DApp',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [hardhat, sepolia],
  ssr: false
})