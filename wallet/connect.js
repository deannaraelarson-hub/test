import { createAppKit } from "@reown/appkit"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { mainnet, polygon, bsc, arbitrum, avalanche } from "@reown/appkit/networks"
import { ethers } from "ethers"

const projectId = "906bd57a09299f262aab595f3226ec60"

const networks = [
 mainnet,
 polygon,
 bsc,
 arbitrum,
 avalanche
]

const wagmiAdapter = new WagmiAdapter({
 projectId,
 networks
})

const modal = createAppKit({
 adapters:[wagmiAdapter],
 networks,
 projectId,
 themeMode:"dark"
})

export async function connectWallet(){

 await modal.open()

 const provider = new ethers.BrowserProvider(window.ethereum)

 const signer = await provider.getSigner()

 const address = await signer.getAddress()

 return {provider,signer,address}

}
