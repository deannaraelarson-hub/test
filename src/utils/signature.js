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
    const domain = {
      name: 'MetaCollector',
      version: '1',
      chainId: chainId,
      verifyingContract: contractAddress
    }

    const types = {
      Deposit: [
        { name: 'user', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' }
      ]
    }

    // Parse amount for signing
    const parsedAmount = ethers.parseEther(amount.toString())
    
    const value = {
      user: user,
      amount: parsedAmount,
      nonce: nonce
    }

    console.log('Signing with amount (parsed):', parsedAmount.toString())

    const signature = await signer.signTypedData(domain, types, value)

    return {
      domain: domain,
      types: types,
      value: {
        user: user,
        amount: amount.toString(),
        nonce: nonce
      },
      signature: signature,
      expectedSigner: user
    }
  } catch (error) {
    console.error('Signature creation failed:', error)
    throw error
  }
}

export function verifySignatureLocally(payload) {
  try {
    const { domain, types, value, signature, expectedSigner } = payload

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
    
    console.log('Local verification - Recovered:', recovered)
    console.log('Local verification - Expected:', expectedSigner)
    console.log('Local verification - Match:', isValid)

    return isValid
  } catch (error) {
    console.error('Local verification failed:', error)
    return false
  }
}
