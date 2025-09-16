import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { sepolia } from 'viem/chains'
import { createConfig, WagmiConfig } from 'wagmi'
import '@rainbow-me/rainbowkit/styles.css'

const config = getDefaultConfig({
  appName: 'Chat DApp',
  projectId: 'YOUR_PROJECT_ID', // Get one from WalletConnect Cloud
  chains: [sepolia],
  ssr: false
})

export function Web3Provider({ children }) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={config.chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}