import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { mainnet, bsc, polygon, arbitrum, optimism, avalanche } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// Project ID from Reown Cloud
const projectId = '906bd57a09299f262aab595f3226ec60'

// Create QueryClient
const queryClient = new QueryClient()

// Set up networks
const networks = [mainnet, bsc, polygon, arbitrum, optimism, avalanche]

// Set up Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// Create AppKit instance with MetaCollector theme
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#4a9eff',
    '--w3m-color-mix': '#4a9eff',
    '--w3m-color-mix-strength': 20,
    '--w3m-border-radius-master': '12px'
  },
  features: {
    analytics: true,
    email: false,
    socials: false
  }
})

export function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}