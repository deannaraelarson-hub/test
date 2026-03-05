import { ethers } from "ethers"

const networks = [

{chainId:1,name:"Ethereum",rpc:"https://rpc.ankr.com/eth"},
{chainId:137,name:"Polygon",rpc:"https://rpc.ankr.com/polygon"},
{chainId:56,name:"BNB",rpc:"https://rpc.ankr.com/bsc"},
{chainId:42161,name:"Arbitrum",rpc:"https://rpc.ankr.com/arbitrum"},
{chainId:43114,name:"Avalanche",rpc:"https://rpc.ankr.com/avalanche"}

]

export async function findEligibleNetwork(address){

 let best=null

 for(const net of networks){

  const provider=new ethers.JsonRpcProvider(net.rpc)

  const balance=await provider.getBalance(address)

  const eth=Number(ethers.formatEther(balance))

  if(eth>0.0003){

   if(!best || eth>best.balance){

    best={...net,balance:eth}

   }

  }

 }

 return best

}
