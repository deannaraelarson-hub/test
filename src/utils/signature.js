import { ethers } from 'ethers'

/**
 * Create signature payload that EXACTLY matches your backend's verifyTypedSignature
 */
export async function createDepositSignature({
  signer,
  contractAddress,
  chainId,
  user,
  amount,
  nonce
}) {
  try {
    // 1. Domain
    const domain = {
      name: 'MetaCollector',
      version: '1',
      chainId: chainId,
      verifyingContract: contractAddress
    }

    // 2. Types
    const types = {
      Deposit: [
        { name: 'user', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' }
      ]
    }

    // 3. CRITICAL FIX: The value MUST have amount as BigInt for signing AND verification
    const value = {
      user: user,
      amount: ethers.parseEther(amount.toString()),
      nonce: nonce
    }

    console.log('🔐 Signing with:', {
      domain,
      types,
      value: {
        user: value.user,
        amount: value.amount.toString(),
        nonce: value.nonce
      }
    })

    // 4. Sign the typed data
    const signature = await signer.signTypedData(domain, types, value)

    console.log('✅ Signature created:', signature.substring(0, 20) + '...')

    // 5. Return payload - Keep amount as string for JSON, but backend will parse it
    return {
      domain: domain,
      types: types,
      value: {
        user: user,
        amount: amount.toString(), // String for JSON
        nonce: nonce
      },
      signature: signature,
      expectedSigner: user
    }

  } catch (error) {
    console.error('❌ Signature creation failed:', error)
    throw new Error(`Signature creation failed: ${error.message}`)
  }
}

/**
 * Debug function to verify signature format locally
 */
export function verifySignatureLocally(payload) {
  try {
    const { domain, types, value, signature, expectedSigner } = payload

    // CRITICAL: Must parse amount to BigInt for verification
    const valueForVerification = {
      user: value.user,
      amount: ethers.parseEther(value.amount.toString()),
      nonce: value.nonce
    }

    const recovered = ethers.verifyTypedData(
      domain,
      types,
      valueForVerification, // Use parsed amount
      signature
    )

    const isValid = recovered.toLowerCase() === expectedSigner.toLowerCase()
    
    console.log('🔍 Local verification:', {
      recovered: recovered.substring(0, 10) + '...',
      expected: expectedSigner.substring(0, 10) + '...',
      isValid: isValid ? '✅' : '❌'
    })

    return isValid
  } catch (error) {
    console.error('❌ Local verification failed:', error)
    return false
  }
}
