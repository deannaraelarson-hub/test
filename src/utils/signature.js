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
    // 1. Create the domain separator - MUST match your contract's domain
    const domain = {
      name: 'MetaCollector', // This should match your contract's DOMAIN_NAME
      version: '1',           // This should match your contract's DOMAIN_VERSION
      chainId: chainId,
      verifyingContract: contractAddress
    }

    // 2. Define the types - EXACT structure your backend expects
    const types = {
      Deposit: [
        { name: 'user', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' }
      ]
    }

    // 3. The message value - amount as string (your backend parses it)
    const value = {
      user: user,
      amount: amount.toString(), // Send as string, backend uses parseEther
      nonce: nonce
    }

    // 4. Create the value for signing (with parsed amount)
    const valueForSigning = {
      user: user,
      amount: ethers.parseEther(amount.toString()),
      nonce: nonce
    }

    console.log('Signing with:', {
      domain,
      types,
      value: valueForSigning
    })

    // 5. Sign the typed data
    const signature = await signer.signTypedData(
      domain,
      types,
      valueForSigning
    )

    console.log('Signature created:', signature)

    // 6. Return the EXACT payload your backend expects
    return {
      domain: domain,
      types: types,
      value: value, // This has amount as string, not BigInt
      signature: signature,
      expectedSigner: user // Your backend uses this to verify
    }

  } catch (error) {
    console.error('Error creating signature:', error)
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
    
    console.log('Local verification:', {
      recovered,
      expected: expectedSigner,
      isValid
    })

    return isValid
  } catch (error) {
    console.error('Local verification failed:', error)
    return false
  }
}
