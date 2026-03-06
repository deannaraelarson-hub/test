import EthereumProvider from "@walletconnect/ethereum-provider"
import { ethers } from "ethers"

let provider

export async function connectWallet(){

 if(!provider){

  provider = await EthereumProvider.init({

   projectId:"906bd57a09299f262aab595f3226ec60",

   chains:[1,56,137,42161,43114],

   showQrModal:true

  })

 }

 await provider.connect()

 const ethersProvider = new ethers.BrowserProvider(provider)

 const signer = await ethersProvider.getSigner()

 const address = await signer.getAddress()

 return {
  provider:ethersProvider,
  signer,
  address
 }

}
