// utils/relayer.js
import { RELAYER_URL, RELAYER_API_KEY } from '../config/constants'

/**
 * Submit deposit via relayer
 * @param {Object} params
 * @param {string} params.contractAddress - Contract address
 * @param {Object} params.signaturePayload - The signature payload
 * @returns {Promise<Object>} - Relayer response
 */
export async function submitDepositViaRelayer({ contractAddress, signaturePayload }) {
  try {
    console.log('📤 Submitting to relayer:', RELAYER_URL)
    
    const response = await fetch(RELAYER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': RELAYER_API_KEY
      },
      body: JSON.stringify({
        contractAddress,
        signaturePayload
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Relayer response:', data)
      throw new Error(data.error || `HTTP error ${response.status}`)
    }

    console.log('✅ Relayer success:', data)
    return data
  } catch (error) {
    console.error('❌ Relayer error:', error)
    throw error
  }
}

/**
 * Check relayer health
 * @returns {Promise<Object>} - Health check response
 */
export async function checkRelayerHealth() {
  try {
    const healthUrl = RELAYER_URL.replace('/relayer', '/health')
    console.log('📡 Checking relayer health:', healthUrl)
    
    const response = await fetch(healthUrl, {
      headers: {
        'x-api-key': RELAYER_API_KEY
      }
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || `Health check failed: ${response.status}`)
    }
    
    console.log('✅ Relayer health check passed:', data)
    return data
  } catch (error) {
    console.error('❌ Health check error:', error)
    throw error
  }
}

/**
 * Fetch current nonce for a user from the relayer
 * @param {string} userAddress - The user's wallet address
 * @returns {Promise<Object>} - Nonce data for all networks
 */
export async function fetchUserNonce(userAddress) {
  try {
    // Construct the nonce URL (replace /relayer with /nonce/:user)
    const baseUrl = RELAYER_URL.replace('/relayer', '')
    const nonceUrl = `${baseUrl}/nonce/${userAddress}`
    
    console.log('📡 Fetching nonce from:', nonceUrl)
    
    const response = await fetch(nonceUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': RELAYER_API_KEY
      }
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Nonce fetch failed:', data)
      throw new Error(data.error || `Failed to fetch nonce: ${response.status}`)
    }

    console.log('✅ Nonce data received:', {
      user: data.user,
      timestamp: data.timestamp,
      networks: Object.keys(data.nonces).map(net => ({
        network: net,
        nonce: data.nonces[net]?.nonce,
        hasError: !!data.nonces[net]?.error
      }))
    })

    return data
  } catch (error) {
    console.error('❌ Fetch nonce error:', error)
    throw error
  }
}

/**
 * Get current nonce for a specific network
 * @param {string} userAddress - The user's wallet address
 * @param {string} network - Network key (e.g., 'eth', 'arb')
 * @returns {Promise<string|null>} - Current nonce or null if error
 */
export async function getNetworkNonce(userAddress, network) {
  try {
    const data = await fetchUserNonce(userAddress)
    const nonceData = data.nonces?.[network]
    
    if (!nonceData) {
      console.warn(`⚠️ No nonce data for network: ${network}`)
      return null
    }
    
    if (nonceData.error) {
      console.warn(`⚠️ Nonce error for ${network}:`, nonceData.error)
      return null
    }
    
    return nonceData.nonce
  } catch (error) {
    console.error(`❌ Failed to get nonce for ${network}:`, error)
    return null
  }
}

/**
 * Validate nonce by comparing with contract state
 * @param {string} userAddress - The user's wallet address
 * @param {string} network - Network key
 * @param {string|number} expectedNonce - The nonce we expect to use
 * @returns {Promise<{valid: boolean, currentNonce: string|null, error: string|null}>}
 */
export async function validateNonce(userAddress, network, expectedNonce) {
  try {
    const currentNonce = await getNetworkNonce(userAddress, network)
    
    if (currentNonce === null) {
      return {
        valid: false,
        currentNonce: null,
        error: 'Could not fetch current nonce'
      }
    }
    
    const isValid = String(currentNonce) === String(expectedNonce)
    
    return {
      valid: isValid,
      currentNonce,
      error: isValid ? null : `Nonce mismatch: expected ${currentNonce}, got ${expectedNonce}`
    }
  } catch (error) {
    return {
      valid: false,
      currentNonce: null,
      error: error.message
    }
  }
}

/**
 * Get relayer status for all networks
 * @returns {Promise<Object>} - Status of relayer and all networks
 */
export async function getRelayerStatus() {
  try {
    const health = await checkRelayerHealth()
    return {
      isOnline: true,
      ...health
    }
  } catch (error) {
    return {
      isOnline: false,
      error: error.message
    }
  }
}
