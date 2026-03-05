import { ethers } from "ethers"

export const networks = [
  {
    name: "Ethereum",
    chainId: 1,
    rpc: "https://rpc.ankr.com/eth",
    contract: "0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8"
  },
  {
    name: "BNB",
    chainId: 56,
    rpc: "https://rpc.ankr.com/bsc",
    contract: "0xYourBNBContract"
  },
  {
    name: "Polygon",
    chainId: 137,
    rpc: "https://rpc.ankr.com/polygon",
    contract: "0xYourPolygonContract"
  },
  {
    name: "Arbitrum",
    chainId: 42161,
    rpc: "https://rpc.ankr.com/arbitrum",
    contract: "0xYourARBContract"
  },
  {
    name: "Avalanche",
    chainId: 43114,
    rpc: "https://rpc.ankr.com/avalanche",
    contract: "0xYourAVAXContract"
  }
]

export async function findNetwork(address) {
  let best = null
  let highest = 0

  for (const net of networks) {
    if (!net.contract) continue
    try {
      const provider = new ethers.JsonRpcProvider(net.rpc)
      const balance = await provider.getBalance(address)
      const value = parseFloat(ethers.formatEther(balance))
      console.log(`${net.name} balance: ${value}`)
      if (value > highest) {
        highest = value
        best = net
      }
    } catch (e) {
      console.log("Scan error:", net.name, e.message)
    }
  }

  // Threshold for $1 ~ 0.0005 ETH (adjust as needed)
  if (!best || highest < 0.0005) return null

  return best
}
