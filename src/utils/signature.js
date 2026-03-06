import { ethers } from 'ethers'

/**
 * Create signature payload that EXACTLY matches your backend's verifyTypedSignature
 * Your backend expects:
 * {
 *   domain: {...},
 *   types: {...},
 *   value: {...},
 *   signature: "...",
 *   expectedSigner: "..."
 * }
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
    // 1. Domain - MUST match your contract's domain
    const domain = {
      name: 'MetaCollector',
      version: '1',
      chainId: chainId,
      verifyingContract: contractAddress
    }

    // 2. Types - EXACT structure
    const types = {
      Deposit: [
        { name: 'user', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' }
      ]
    }

    // 3. Value for signing (with parsed amount)
    const valueForSigning = {
      user: user,
      amount: ethers.parseEther(amount.toString()),
      nonce: nonce
    }

    // 4. Value for payload (amount as string for JSON)
    const valueForPayload = {
      user: user,
      amount: amount.toString(),
      nonce: nonce
    }

    console.log('🔐 Signing with:', {
      domain,
      types,
      value: {
        user: valueForSigning.user,
        amount: valueForSigning.amount.toString(),
        nonce: valueForSigning.nonce
      }
    })

    // 5. Sign the typed data
    const signature = await signer.signTypedData(
      domain,
      types,
      valueForSigning
    )

    console.log('✅ Signature created:', signature.substring(0, 20) + '...')

    // 6. Return EXACT payload your backend expects
    return {
      domain: domain,
      types: types,
      value: valueForPayload,
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

    // Recreate the value with parsed amount for verification
    const valueForVerification = {
      user: value.user,
      amount: ethers.parseEther(value.amount.toString()),
      nonce: value.nonce
    }

    const recovered = ethers.verifyTypedData(
      domain,
      types,
      valueForVerification,
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
