import { ethers } from "ethers"

const networks = [

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

export async function findNetwork(address){

 let best=null
 let highest=0

 for(const net of networks){

  try{

   const provider=new ethers.JsonRpcProvider(net.rpc)

   const bal=await provider.getBalance(address)

   const eth=Number(
    ethers.formatEther(bal)
   )

   if(eth>highest){

    highest=eth
    best=net

   }

  }catch(e){

   console.log("scan error",net.name)

  }

 }

 if(highest<0.001){

  return null

 }

 return best

}
