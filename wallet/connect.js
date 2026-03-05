import { createAppKit } from "@reown/appkit"
import { mainnet, bsc, polygon, arbitrum, avalanche } from "@reown/appkit/networks"
import { ethers } from "ethers"

let modal

export async function connectWallet() {
  if (!modal) {
    modal = createAppKit({
      projectId: "906bd57a09299f262aab595f3226ec60",
      networks: [mainnet, bsc, polygon, arbitrum, avalanche],
      themeMode: "dark",
      themeVariables: { "--w3m-accent": "#F7931A", "--w3m-border-radius-master": "8px" },
    })
  }

  const session = await modal.open()
  if (!session) throw new Error("Wallet connection canceled")

  const walletProvider = modal.getWalletProvider()
  if (!walletProvider) throw new Error("Wallet provider not found")

  const provider = new ethers.BrowserProvider(walletProvider)
  const signer = await provider.getSigner()
  const address = await signer.getAddress()

  return { provider, signer, address }
}
