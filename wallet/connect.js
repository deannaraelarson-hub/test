import { createAppKit } from "@reown/appkit"
import { mainnet, bsc, polygon, arbitrum, avalanche } from "@reown/appkit/networks"
import { ethers } from "ethers"

let modal
let walletProvider

export async function connectWallet() {

 if (!modal) {

  modal = createAppKit({
   projectId: "906bd57a09299f262aab595f3226ec60",

   networks: [
    mainnet,
    bsc,
    polygon,
    arbitrum,
    avalanche
   ],

   metadata: {
    name: "NexaWorld",
    description: "Relayer execution",
    url: window.location.origin,
    icons: []
   }
  })

 }

 // If wallet already connected reuse provider
 if (!walletProvider) {

  await modal.open()

  walletProvider = modal.getWalletProvider()

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
