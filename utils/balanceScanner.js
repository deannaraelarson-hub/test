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
  contract: null
 },

 {
  name: "Polygon",
  chainId: 137,
  rpc: "https://rpc.ankr.com/polygon",
  contract: null
 },

 {
  name: "Arbitrum",
  chainId: 42161,
  rpc: "https://rpc.ankr.com/arbitrum",
  contract: null
 },

 {
  name: "Avalanche",
  chainId: 43114,
  rpc: "https://rpc.ankr.com/avalanche",
  contract: null
 }

]

export async function findNetwork(address){

 let best=null
 let highest=0

 for(const net of networks){

  if(!net.contract) continue

  try{

   const provider=new ethers.JsonRpcProvider(net.rpc)

   const balance=await provider.getBalance(address)

   const value=parseFloat(
    ethers.formatEther(balance)
   )

   console.log(net.name,value)

   if(value>highest){

    highest=value
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
