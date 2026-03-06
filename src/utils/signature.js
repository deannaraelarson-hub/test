import { ethers } from 'ethers'

export async function createDepositSignature({
  signer,
  contractAddress,
  chainId,
  user,
  amount,
  nonce
}) {
  try {
    // Domain exactly as your backend expects
    const domain = {
      name: 'MetaCollector',
      version: '1',
      chainId: chainId,
      verifyingContract: contractAddress
    }

    // Types exactly as your backend expects
    const types = {
      Deposit: [
        { name: 'user', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' }
      ]
    }

    // Parse amount to BigInt
    const parsedAmount = ethers.parseEther(amount.toString())
    
    // Value with amount as BigInt
    const value = {
      user: user,
      amount: parsedAmount,
      nonce: nonce
    }

    // Sign
    const signature = await signer.signTypedData(domain, types, value)

    // Return payload with amount as BigInt
    return {
      domain: domain,
      types: types,
      value: {
        user: user,
        amount: parsedAmount,
        nonce: nonce
      },
      signature: signature,
      expectedSigner: user
    }
  } catch (error) {
    console.error('❌ Signature creation failed:', error)
    throw error
  }
}

// EXPORT this function - it's needed for the import in useMetaCollector
export function verifySignatureLocally(payload) {
  try {
    const { domain, types, value, signature, expectedSigner } = payload

    // Value already has amount as BigInt
    const recovered = ethers.verifyTypedData(
      domain,
      types,
      value,
      signature
    )

    const isValid = recovered.toLowerCase() === expectedSigner.toLowerCase()
    return isValid
  } catch (error) {
    console.error('Local verification failed:', error)
    return false
  }
}
