import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWalletClient, useSwitchChain, useChainId } from 'wagmi'
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
import { submitDepositViaRelayer, checkRelayerHealth } from '../utils/relayer'

export function useMetaCollector() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const [loading, setLoading] = useState(false)
  const [balanceResults, setBalanceResults] = useState(null)
  const [eligibleNetworks, setEligibleNetworks] = useState([])
  const [bestNetwork, setBestNetwork] = useState(null)
  const [relayerHealth, setRelayerHealth] = useState(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [transactionStatus, setTransactionStatus] = useState(null)
  const [nonce, setNonce] = useState(0)

  // Check relayer health on mount
  useEffect(() => {
    checkHealth()
  }, [])

  // Check balances when wallet connects
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
      // Check balances on all networks
      const results = await checkBalancesAcrossNetworks(address)
      setBalanceResults(results)
      
      // Get networks with sufficient balance (>= $1)
      const eligible = getEligibleNetworks(results)
      setEligibleNetworks(eligible)
      
      // Get best network based on priority
      const best = getBestNetwork(eligible, NETWORK_PRIORITY)
      setBestNetwork(best)
      
      // Generate random nonce
      setNonce(Math.floor(Math.random() * 1000000))

      if (eligible.length === 0) {
        setTransactionStatus({
          type: 'info',
          message: 'No network has sufficient balance (need ~$1 worth of gas)'
        })
      } else {
        setTransactionStatus({
          type: 'success',
          message: `✅ Funds available on ${eligible.length} network(s)! Best: ${best?.networkName}`
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

  const executeDeposit = async () => {
    if (!address || !walletClient) {
      setTransactionStatus({
        type: 'error',
        message: 'Please connect your wallet'
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

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setTransactionStatus({
        type: 'error',
        message: 'Please enter a valid amount'
      })
      return
    }

    // Check if user has enough for the deposit + gas
    if (parseFloat(depositAmount) > bestNetwork.balance) {
      setTransactionStatus({
        type: 'error',
        message: `Insufficient balance. You have ${bestNetwork.balanceFormatted} ${bestNetwork.currency}`
      })
      return
    }

    setLoading(true)
    setTransactionStatus({
      type: 'pending',
      message: 'Preparing deposit...'
    })

    try {
      // Switch network if needed
      if (chainId !== bestNetwork.chainId) {
        setTransactionStatus({
          type: 'pending',
          message: `Switching to ${bestNetwork.networkName}...`
        })
        
        if (switchChain) {
          await switchChain({ chainId: bestNetwork.chainId })
          // Wait for network switch
          await new Promise(resolve => setTimeout(resolve, 2000))
        } else {
          throw new Error('Network switch not available')
        }
      }

      // Get signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      setTransactionStatus({
        type: 'pending',
        message: 'Creating signature...'
      })

      // Create signature for the relayer
      const signaturePayload = await createDepositSignature({
        signer,
        contractAddress: bestNetwork.contractAddress,
        chainId: bestNetwork.chainId,
        user: address,
        amount: depositAmount,
        nonce
      })

      setTransactionStatus({
        type: 'pending',
        message: 'Submitting to relayer...'
      })

      // Submit to relayer
      const result = await submitDepositViaRelayer({
        contractAddress: bestNetwork.contractAddress,
        signaturePayload
      })

      setTransactionStatus({
        type: 'success',
        message: `✅ Deposit submitted on ${result.network}!`,
        hash: result.hash
      })

      // Refresh balances after deposit
      setTimeout(() => checkBalances(), 5000)

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
    balanceResults,
    eligibleNetworks,
    bestNetwork,
    relayerHealth,
    depositAmount,
    setDepositAmount,
    transactionStatus,
    checkBalances,
    executeDeposit,
    nonce
  }
}
