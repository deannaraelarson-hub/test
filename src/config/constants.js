// Relayer configuration
export const RELAYER_CONFIG = {
  // IMPORTANT: Update this to your actual relayer URL
  BASE_URL: 'https://nexaworldx.com/relayer', // or 'http://localhost:3000' for local testing
  API_KEY: '00de6eb9ebf5ea70f92e4c1efdc00ad32a7131f9856bd17d445f62f19a829fe6',
  ENDPOINTS: {
    RELAY: '/relayer',
    HEALTH: '/health'
  }
}

// MetaCollector specific constants
export const METACOLLECTOR = {
  NAME: 'MetaCollector',
  VERSION: '1',
  COLLECTOR_ADDRESS: '0xde6b7d22e9ed0b07d752196e8914bdc2908e1824'
}

// Contract ABI for executeDeposit (matches your backend)
export const EXECUTE_DEPOSIT_ABI = [
  "function executeDeposit(address user,uint256 amount,uint256 nonce,bytes signature) payable"
]

// Eligibility check ABI
export const ELIGIBILITY_ABI = [
  "function isWhitelisted(address user) view returns (bool)",
  "function getMaxAllocation(address user) view returns (uint256)",
  "function getMinAllocation(address user) view returns (uint256)",
  "function getUserDeposited(address user) view returns (uint256)",
  "function getRemainingAllocation(address user) view returns (uint256)",
  "function PRESALE_ACTIVE() view returns (bool)",
  "function TOKEN_PRICE() view returns (uint256)",
  "function collector() view returns (address)"
]