import { ethers } from 'ethers'
import { METACOLLECTOR_CONTRACTS } from '../config/contracts'

// $1 threshold in USD
const THRESHOLD_USD = 1

/**
 * Check wallet balance across all networks
 * @param {string} walletAddress - The connected wallet address
 * @returns {Promise<Object>} Balance results for each network
 */
export async function checkBalancesAcrossNetworks(walletAddress) {
  const results = {}
  
  console.log(`Checking balances for ${walletAddress} across all networks...`)

  for (const [network, config] of Object.entries(METACOLLECTOR_CONTRACTS)) {
    try {
      // Create provider for this network
      const provider = new ethers.JsonRpcProvider(config.rpc)
      
      // Get balance
      const balanceWei = await provider.getBalance(walletAddress)
      const balanceEth = parseFloat(ethers.formatEther(balanceWei))
      
      // Check if meets $1 threshold
      const meetsThreshold = balanceEth >= config.minBalance
      
      results[network] = {
        network,
        networkName: config.name,
        currency: config.currency,
        chainId: config.chainId,
        contractAddress: config.address,
        
        // Balance info
        balance: balanceEth,
        balanceFormatted: balanceEth.toFixed(6),
        balanceWei: balanceWei.toString(),
        
        // Threshold info
        minRequired: config.minBalance,
        meetsThreshold,
        
        // Status
        hasFunds: balanceEth > 0,
        canParticipate: meetsThreshold
      }
      
      console.log(`${network}: ${balanceEth.toFixed(6)} ${config.currency} ${meetsThreshold ? '✅' : '❌'}`)
      
    } catch (error) {
      console.error(`Error checking ${network}:`, error.message)
      results[network] = {
        network,
        networkName: config.name,
        currency: config.currency,
        error: error.message,
        hasFunds: false,
        canParticipate: false,
        meetsThreshold: false
      }
    }
  }
  
  return results
}

/**
 * Get networks where wallet has sufficient balance (>= $1)
 */
export function getEligibleNetworks(balanceResults) {
  return Object.values(balanceResults)
    .filter(result => result.canParticipate === true)
    .map(result => ({
      ...result
    }))
}

/**
 * Get best network based on priority and balance
 */
export function getBestNetwork(eligibleNetworks, priorityList) {
  if (!eligibleNetworks || eligibleNetworks.length === 0) return null
  
  // Sort by priority order
  const sorted = [...eligibleNetworks].sort((a, b) => {
    const aIndex = priorityList.indexOf(a.network)
    const bIndex = priorityList.indexOf(b.network)
    return aIndex - bIndex
  })
  
  return sorted[0]
}
