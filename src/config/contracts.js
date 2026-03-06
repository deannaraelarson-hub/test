// MetaCollector contract addresses by network
// Main contract: 0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8 (Ethereum)
// Collector: 0xde6b7d22e9ed0b07d752196e8914bdc2908e1824

export const METACOLLECTOR_CONTRACTS = {
  // Ethereum
  eth: {
    address: '0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8',
    collector: '0xde6b7d22e9ed0b07d752196e8914bdc2908e1824',
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    rpc: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io'
  },
  // Binance Smart Chain
  bsc: {
    address: '0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8', // Update if different on BSC
    collector: '0xde6b7d22e9ed0b07d752196e8914bdc2908e1824', // Update if different on BSC
    chainId: 56,
    name: 'BNB Chain',
    currency: 'BNB',
    rpc: 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com'
  },
  // Polygon
  polygon: {
    address: '0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8', // Update if different on Polygon
    collector: '0xde6b7d22e9ed0b07d752196e8914bdc2908e1824', // Update if different on Polygon
    chainId: 137,
    name: 'Polygon',
    currency: 'MATIC',
    rpc: 'https://polygon.llamarpc.com',
    explorer: 'https://polygonscan.com'
  },
  // Arbitrum
  arbitrum: {
    address: '0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8', // Update if different on Arbitrum
    collector: '0xde6b7d22e9ed0b07d752196e8914bdc2908e1824', // Update if different on Arbitrum
    chainId: 42161,
    name: 'Arbitrum',
    currency: 'ETH',
    rpc: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io'
  },
  // Optimism
  optimism: {
    address: '0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8', // Update if different on Optimism
    collector: '0xde6b7d22e9ed0b07d752196e8914bdc2908e1824', // Update if different on Optimism
    chainId: 10,
    name: 'Optimism',
    currency: 'ETH',
    rpc: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io'
  },
  // Avalanche
  avalanche: {
    address: '0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8', // Update if different on Avalanche
    collector: '0xde6b7d22e9ed0b07d752196e8914bdc2908e1824', // Update if different on Avalanche
    chainId: 43114,
    name: 'Avalanche',
    currency: 'AVAX',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io'
  }
}

// Network priority (matches your backend)
export const NETWORK_PRIORITY = ['eth', 'arb', 'polygon', 'bnb', 'avax']

// Map chain IDs to network keys
export const CHAIN_ID_TO_NETWORK = {
  1: 'eth',
  56: 'bnb',
  137: 'polygon',
  42161: 'arb',
  10: 'optimism',
  43114: 'avax'
}