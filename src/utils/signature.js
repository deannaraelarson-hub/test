import { ethers } from 'ethers'
import { METACOLLECTOR } from '../config/constants'

// EIP-712 Domain type
const domainType = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' }
]

// Deposit type for MetaCollector
const depositType = [
  { name: 'user', type: 'address' },
  { name: 'amount', type: 'uint256' },
  { name: 'nonce', type: 'uint256' }
]

/**
 * Create signature payload for MetaCollector deposit
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
    const domain = {
      name: METACOLLECTOR.NAME,
      version: METACOLLECTOR.VERSION,
      chainId,
      verifyingContract: contractAddress
    }

    const types = {
      Deposit: depositType
    }

    const value = {
      user,
      amount: ethers.parseEther(amount.toString()),
      nonce
    }

    // Sign the typed data
    const signature = await signer.signTypedData(domain, types, value)

    // Get the signer's address
    const signerAddress = await signer.getAddress()

    // Return payload in the exact format your backend expects
    return {
      domain,
      types: {
        Deposit: depositType
      },
      value: {
        user,
        amount, // Keep as string for JSON serialization
        nonce
      },
      signature,
      expectedSigner: signerAddress
    }
  } catch (error) {
    console.error('Error creating MetaCollector signature:', error)
    throw new Error(`Signature creation failed: ${error.message}`)
  }
}
