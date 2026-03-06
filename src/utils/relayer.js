import { RELAYER_CONFIG } from '../config/constants'

/**
 * Submit deposit through MetaCollector relayer
 */
export async function submitDepositViaRelayer({ contractAddress, signaturePayload }) {
  try {
    const url = `${RELAYER_CONFIG.BASE_URL}${RELAYER_CONFIG.ENDPOINTS.RELAY}`
    
    console.log('Submitting to relayer:', url)
    console.log('With payload:', { contractAddress, signaturePayload })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': RELAYER_CONFIG.API_KEY
      },
      body: JSON.stringify({
        contractAddress,
        signaturePayload
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('Relayer submission error:', error)
    throw error
  }
}

/**
 * Check relayer health
 */
export async function checkRelayerHealth() {
  try {
    const url = `${RELAYER_CONFIG.BASE_URL}${RELAYER_CONFIG.ENDPOINTS.HEALTH}`
    
    const response = await fetch(url, {
      headers: {
        'x-api-key': RELAYER_CONFIG.API_KEY
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Health check error:', error)
    throw error
  }
}