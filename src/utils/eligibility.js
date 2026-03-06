import { ethers } from 'ethers'
import { METACOLLECTOR_CONTRACTS } from '../config/contracts'
import { ELIGIBILITY_ABI } from '../config/constants'

/**
 * Check user eligibility across all networks for MetaCollector
 */
export async function checkEligibilityAcrossNetworks(userAddress, providers) {
  const results = {}

  for (const [network, provider] of Object.entries(providers)) {
    try {
      const contract = METACOLLECTOR_CONTRACTS[network]
      if (!contract) continue

      const metaCollector = new ethers.Contract(
        contract.address,
        ELIGIBILITY_ABI,
        provider
      )

      // Check eligibility and presale info
      const [
        isWhitelisted,
        maxAllocation,
        minAllocation,
        deposited,
        remaining,
        isActive,
        tokenPrice,
        collector
      ] = await Promise.all([
        metaCollector.isWhitelisted(userAddress).catch(() => false),
        metaCollector.getMaxAllocation(userAddress).catch(() => ethers.parseEther('0')),
        metaCollector.getMinAllocation(userAddress).catch(() => ethers.parseEther('0')),
        metaCollector.getUserDeposited(userAddress).catch(() => ethers.parseEther('0')),
        metaCollector.getRemainingAllocation(userAddress).catch(() => ethers.parseEther('0')),
        metaCollector.PRESALE_ACTIVE().catch(() => false),
        metaCollector.TOKEN_PRICE().catch(() => ethers.parseEther('0')),
        metaCollector.collector().catch(() => contract.collector)
      ])

      results[network] = {
        isWhitelisted,
        maxAllocation: ethers.formatEther(maxAllocation),
        minAllocation: ethers.formatEther(minAllocation),
        deposited: ethers.formatEther(deposited),
        remaining: ethers.formatEther(remaining),
        isActive,
        tokenPrice: ethers.formatEther(tokenPrice),
        contractAddress: contract.address,
        collector: collector || contract.collector,
        chainId: contract.chainId,
        networkName: contract.name,
        currency: contract.currency,
        explorer: contract.explorer
      }
    } catch (error) {
      console.error(`Error checking MetaCollector on ${network}:`, error)
      results[network] = {
        error: error.message,
        isWhitelisted: false,
        isActive: false,
        networkName: METACOLLECTOR_CONTRACTS[network]?.name || network
      }
    }
  }

  return results
}

/**
 * Get eligible networks for a user
 */
export function getEligibleNetworks(eligibilityResults) {
  return Object.entries(eligibilityResults)
    .filter(([_, data]) => data.isWhitelisted && data.isActive && parseFloat(data.remaining) > 0)
    .map(([network, data]) => ({
      network,
      ...data
    }))
}

/**
 * Get best network for deposit based on priority
 */
export function getBestNetwork(eligibleNetworks, priorityList) {
  if (eligibleNetworks.length === 0) return null

  // Sort by priority
  const sorted = [...eligibleNetworks].sort((a, b) => {
    const aIndex = priorityList.indexOf(a.network)
    const bIndex = priorityList.indexOf(b.network)
    return aIndex - bIndex
  })

  return sorted[0]
}