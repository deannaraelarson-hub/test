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

    // Parse amount to BigInt for signing
    const parsedAmount = ethers.parseEther(amount.toString())
    
    // Value with amount as BigInt for signing
    const valueForSigning = {
      user: user,
      amount: parsedAmount,
      nonce: nonce
    }

    // Sign the typed data
    const signature = await signer.signTypedData(domain, types, valueForSigning)

    // CRITICAL: Convert BigInt to string for JSON serialization
    // But keep the structure your backend expects
    return {
      domain: domain,
      types: types,
      value: {
        user: user,
        amount: parsedAmount.toString(), // Convert BigInt to string for JSON
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

export function verifySignatureLocally(payload) {
  try {
    const { domain, types, value, signature, expectedSigner } = payload

    // For local verification, we need to parse the amount string back to BigInt
    const valueForVerification = {
      user: value.user,
      amount: ethers.parseEther(value.amount.toString()), // Parse string back to BigInt
      nonce: value.nonce
    }

    const recovered = ethers.verifyTypedData(
      domain,
      types,
      valueForVerification,
      signature
    )

    const isValid = recovered.toLowerCase() === expectedSigner.toLowerCase()
    return isValid
  } catch (error) {
    console.error('Local verification failed:', error)
    return false
  }
}
