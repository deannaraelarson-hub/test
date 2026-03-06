// Relayer configuration - USING YOUR EXACT VALUES
export const RELAYER_CONFIG = {
 export const RELAYER_URL = 'https://nexaworldx.com/relayer'
export const RELAYER_API_KEY = '00de6eb9ebf5ea70f92e4c1efdc00ad32a7131f9856bd17d445f62f19a829fe6'
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

// Contract ABI for executeDeposit
export const EXECUTE_DEPOSIT_ABI = [
  "function executeDeposit(address user,uint256 amount,uint256 nonce,bytes signature) payable"
]

