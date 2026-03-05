import { createAppKit } from "@reown/appkit"
import { mainnet, bsc, polygon, arbitrum, avalanche } from "@reown/appkit/networks"
import { ethers } from "ethers"

let modal

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
    description: "Relayer App",
    url: window.location.origin,
    icons: []
   }

  })

 }

 // OPEN WALLET CONNECT MODAL
 await modal.open()

 // GET WALLETCONNECT PROVIDER
 const wcProvider = modal.getWalletProvider()

 if (!wcProvider) {
  throw new Error("Wallet provider not found")
 }

 // CREATE ETHERS PROVIDER
 const provider = new ethers.BrowserProvider(wcProvider)

 const signer = await provider.getSigner()

 const address = await signer.getAddress()

 return {
  provider,
  signer,
  address
 }

}
