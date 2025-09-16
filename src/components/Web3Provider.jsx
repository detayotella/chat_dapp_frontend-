import { createConfig, http, WagmiProvider } from 'wagmi'
import { defaultChain, supportedChains } from '../config/chains'

const config = createConfig({
  chains: supportedChains,
  transports: {
    [defaultChain.id]: http(),
  },
})

export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  )
}