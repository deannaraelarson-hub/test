import { createAppKit } from "@reown/appkit"
import { mainnet, bsc, polygon, arbitrum, avalanche } from "@reown/appkit/networks"
import { ethers } from "ethers"

let modal

export async function connectWallet() {

  if (!modal) {

    modal = createAppKit({
      projectId: "906bd57a09299f262aab595f3226ec60",
      networks: [mainnet, bsc, polygon, arbitrum, avalanche],
      themeMode: "dark"
    })

  }

  // open wallet modal
  await modal.open()

  // wait until provider becomes available
  let walletProvider = null

  for (let i = 0; i < 20; i++) {

    walletProvider = modal.getWalletProvider()

    if (walletProvider) break

    await new Promise(r => setTimeout(r, 300))
  }

  if (!walletProvider) {
    throw new Error("Wallet provider not found")
  }

  const provider = new ethers.BrowserProvider(walletProvider)

  const signer = await provider.getSigner()

  const address = await signer.getAddress()

  return {
    provider,
    signer,
    address
  }

}
