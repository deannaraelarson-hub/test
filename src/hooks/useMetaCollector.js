import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWalletClient, useNetwork, useSwitchNetwork } from 'wagmi'
import { ethers } from 'ethers'
import { 
  METACOLLECTOR_CONTRACTS, 
  NETWORK_PRIORITY, 
  CHAIN_ID_TO_NETWORK 
} from '../config/contracts'
import { createDepositSignature } from '../utils/signature'
import { 
  checkEligibilityAcrossNetworks, 
  getEligibleNetworks, 
  getBestNetwork 
} from '../utils/eligibility'
import { submitDepositViaRelayer, checkRelayerHealth } from '../utils/relayer'

export function useMetaCollector() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()

  const [loading, setLoading] = useState(false)
  const [eligibility, setEligibility] = useState(null)
  const [eligibleNetworks, setEligibleNetworks] = useState([])
  const [bestNetwork, setBestNetwork] = useState(null)
  const [relayerHealth, setRelayerHealth] = useState(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [transactionStatus, setTransactionStatus] = useState(null)
  const [nonce, setNonce] = useState(0)

  // Convert walletClient to ethers signer
  const getEthersSigner = useCallback(() => {
    if (!walletClient) return null
    
    // Create ethers provider from walletClient
    const provider = new ethers.BrowserProvider(walletClient.transport, 'any')
    return provider.getSigner()
  }, [walletClient])

  // Initialize providers for each network
  const getProviders = useCallback(() => {
    const providers = {}
    
    // Add fallback RPC providers for all networks
    Object.entries(METACOLLECTOR_CONTRACTS).forEach(([network, config]) => {
      providers[network] = new ethers.JsonRpcProvider(config.rpc)
    })
    
    // Override with injected provider for current network if available
    if (window.ethereum && chain) {
      const currentNetwork = CHAIN_ID_TO_NETWORK[chain.id]
      if (currentNetwork) {
        providers[currentNetwork] = new ethers.BrowserProvider(window.ethereum)
      }
    }
    
    return providers
  }, [chain])

  // Check eligibility when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      checkEligibility()
    }
  }, [isConnected, address])

  // Check relayer health on mount
  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    try {
      const health = await checkRelayerHealth()
      setRelayerHealth(health)
    } catch (error) {
      console.error('Failed to check relayer health:', error)
    }
  }

  const checkEligibility = async () => {
    if (!address) return

    setLoading(true)
    setTransactionStatus({
      type: 'pending',
      message: 'Checking eligibility across networks...'
    })

    try {
      const providers = getProviders()
      const results = await checkEligibilityAcrossNetworks(address, providers)
      
      setEligibility(results)
      
      const eligible = getEligibleNetworks(results)
      setEligibleNetworks(eligible)
      
      const best = getBestNetwork(eligible, NETWORK_PRIORITY)
      setBestNetwork(best)
      
      // Generate a random nonce
      setNonce(Math.floor(Math.random() * 1000000))

      if (eligible.length === 0) {
        setTransactionStatus({
          type: 'info',
          message: 'You are not eligible on any network'
        })
      } else {
        setTransactionStatus({
          type: 'success',
          message: `Eligible on ${eligible.length} network(s)! Best: ${best?.networkName}`
        })
      }
    } catch (error) {
      console.error('Eligibility check failed:', error)
      setTransactionStatus({
        type: 'error',
        message: `Failed to check eligibility: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  const executeDeposit = async () => {
    if (!address || !walletClient || !bestNetwork || !depositAmount) {
      setTransactionStatus({
        type: 'error',
        message: 'Missing required data or amount'
      })
      return
    }

    const amount = parseFloat(depositAmount)
    if (amount <= 0) {
      setTransactionStatus({
        type: 'error',
        message: 'Invalid amount'
      })
      return
    }

    if (amount > parseFloat(bestNetwork.remaining)) {
      setTransactionStatus({
        type: 'error',
        message: `Amount exceeds remaining allocation (${bestNetwork.remaining} ${bestNetwork.currency})`
      })
      return
    }

    if (amount < parseFloat(bestNetwork.minAllocation)) {
      setTransactionStatus({
        type: 'error',
        message: `Amount below minimum (${bestNetwork.minAllocation} ${bestNetwork.currency})`
      })
      return
    }

    setLoading(true)
    setTransactionStatus({
      type: 'pending',
      message: 'Creating MetaCollector signature...'
    })

    try {
      // Ensure we're on the correct network
      if (chain?.id !== bestNetwork.chainId && switchNetwork) {
        setTransactionStatus({
          type: 'pending',
          message: `Switching to ${bestNetwork.networkName}...`
        })
        await switchNetwork(bestNetwork.chainId)
        // Wait for network switch
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Get ethers signer from wallet client
      const signer = await getEthersSigner()
      if (!signer) {
        throw new Error('Failed to get signer')
      }

      // Create signature for MetaCollector
      const signaturePayload = await createDepositSignature({
        signer,
        contractAddress: bestNetwork.contractAddress,
        chainId: bestNetwork.chainId,
        user: address,
        amount,
        nonce
      })

      setTransactionStatus({
        type: 'pending',
        message: 'Submitting to MetaCollector relayer...'
      })

      // Submit to relayer
      const result = await submitDepositViaRelayer({
        contractAddress: bestNetwork.contractAddress,
        signaturePayload
      })

      setTransactionStatus({
        type: 'success',
        message: `✅ Deposit submitted on ${result.network}!`,
        hash: result.hash,
        network: result.network,
        blockNumber: result.blockNumber
      })

      // Refresh eligibility after deposit
      setTimeout(() => checkEligibility(), 5000)
      
    } catch (error) {
      console.error('Deposit failed:', error)
      setTransactionStatus({
        type: 'error',
        message: `Deposit failed: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    address,
    isConnected,
    loading,
    eligibility,
    eligibleNetworks,
    bestNetwork,
    relayerHealth,
    depositAmount,
    setDepositAmount,
    transactionStatus,
    checkEligibility,
    executeDeposit,
    nonce
  }
}
