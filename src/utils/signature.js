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

    // CRITICAL: Parse amount to BigInt for the value
    const parsedAmount = ethers.parseEther(amount.toString())
    
    // The value object with amount as BigInt
    const value = {
      user: user,
      amount: parsedAmount,  // This is BigInt, not string
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

    // Sign the typed data
    const signature = await signer.signTypedData(domain, types, value)

    // Return payload with amount as BigInt in value
    return {
      domain: domain,
      types: types,
      value: {
        user: user,
        amount: parsedAmount,  // Send as BigInt
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
