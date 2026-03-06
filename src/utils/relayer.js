import { RELAYER_URL, RELAYER_API_KEY } from '../config/constants'

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

export async function checkRelayerHealth() {
  try {
    const healthUrl = RELAYER_URL.replace('/relayer', '/health')
    const response = await fetch(healthUrl, {
      headers: {
        'x-api-key': RELAYER_API_KEY
      }
    })
    
    return await response.json()
  } catch (error) {
    console.error('Health check error:', error)
    throw error
  }
}
