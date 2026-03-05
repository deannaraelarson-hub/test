import { ethers } from "ethers"

export const networks = [
  { name: "Ethereum", chainId: 1, rpc: "https://rpc.ankr.com/eth", contract: "0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8", usdPrice: 1900 },
  { name: "BNB", chainId: 56, rpc: "https://rpc.ankr.com/bsc", contract: "0xYourBNBContract", usdPrice: 320 },
  { name: "Polygon", chainId: 137, rpc: "https://rpc.ankr.com/polygon", contract: "0xYourPolygonContract", usdPrice: 1.1 },
  { name: "Arbitrum", chainId: 42161, rpc: "https://rpc.ankr.com/arbitrum", contract: "0xYourARBContract", usdPrice: 1.1 },
  { name: "Avalanche", chainId: 43114, rpc: "https://rpc.ankr.com/avalanche", contract: "0xYourAVAXContract", usdPrice: 15 },
]

export async function findNetwork(address, minUSD = 1) {
  let best = null
  let bestValue = 0

  const checks = networks.map(async net => {
    try {
      const provider = new ethers.JsonRpcProvider(net.rpc)
      const bal = await provider.getBalance(address)
      const eth = parseFloat(ethers.formatEther(bal))
      const usd = eth * net.usdPrice
      console.log(`${net.name} balance: ${eth} (~$${usd})`)
      if (usd >= minUSD && usd > bestValue) {
        bestValue = usd
        best = net
      }
    } catch (e) {
      console.log("Error scanning", net.name, e.message)
    }
  })

  await Promise.all(checks)
  return best
}
