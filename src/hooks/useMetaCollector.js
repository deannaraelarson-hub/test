\import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWalletClient, useSwitchChain, useChainId } from 'wagmi'
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
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const [loading, setLoading] = useState(false)
  const [eligibility, setEligibility] = useState(null)
  const [eligibleNetworks, setEligibleNetworks] = useState([])
  const [bestNetwork, setBestNetwork] = useState(null)
  const [relayerHealth, setRelayerHealth] = useState(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [transactionStatus, setTransactionStatus] = useState(null)
  const [nonce, setNonce] = useState(0)

  // Get ethers signer from wallet client
  const getEthersSigner = useCallback(async () => {
    if (!walletClient) return null
    const provider = new ethers.BrowserProvider(walletClient.transport, 'any')
    return provider.getSigner()
  }, [walletClient])

  // Initialize providers for each network
  const getProviders = useCallback(() => {
    const providers = {}
    
    Object.entries(METACOLLECTOR_CONTRACTS).forEach(([network, config]) => {
      providers[network] = new ethers.JsonRpcProvider(config.rpc)
    })
    
    if (window.ethereum && chainId) {
      const currentNetwork = CHAIN_ID_TO_NETWORK[chainId]
      if (currentNetwork) {
        providers[currentNetwork] = new ethers.BrowserProvider(window.ethereum)
      }
    }
    
    return providers
  }, [chainId])

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
      // Switch chain if needed
      if (chainId !== bestNetwork.chainId && switchChain) {
        setTransactionStatus({
          type: 'pending',
          message: `Switching to ${bestNetwork.networkName}...`
        })
        await switchChain({ chainId: bestNetwork.chainId })
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      const signer = await getEthersSigner()
      if (!signer) {
        throw new Error('Failed to get signer')
      }

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
