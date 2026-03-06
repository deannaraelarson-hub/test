import { ethers } from 'ethers'
import { METACOLLECTOR } from '../config/constants'

// EIP-712 Domain type - EXACTLY as your backend expects
const domainType = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' }
]

// Deposit type - EXACTLY as your backend expects
const depositType = [
  { name: 'user', type: 'address' },
  { name: 'amount', type: 'uint256' },
  { name: 'nonce', type: 'uint256' }
]

/**
 * Create signature payload matching your backend's verifyTypedSignature
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
      name: 'MetaCollector', // Must match your contract's domain
      version: '1',
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

    // Return payload in EXACT format your backend expects
    return {
      domain,
      types: {
        Deposit: depositType
      },
      value: {
        user,
        amount, // Keep as string for JSON
        nonce
      },
      signature,
      expectedSigner: signerAddress
    }
  } catch (error) {
    console.error('Error creating signature:', error)
    throw new Error(`Signature creation failed: ${error.message}`)
  }
}
