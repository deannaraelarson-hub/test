import { ethers } from "https://esm.sh/ethers";

const networks = [

{
 name:"Ethereum",
 chainId:1,
 rpc:"https://rpc.ankr.com/eth",
 price:3500
},

{
 name:"Polygon",
 chainId:137,
 rpc:"https://rpc.ankr.com/polygon",
 price:1
},

{
 name:"BNB",
 chainId:56,
 rpc:"https://rpc.ankr.com/bsc",
 price:600
},

{
 name:"Arbitrum",
 chainId:42161,
 rpc:"https://rpc.ankr.com/arbitrum",
 price:3500
},

{
 name:"Avalanche",
 chainId:43114,
 rpc:"https://rpc.ankr.com/avalanche",
 price:35
}

];

export async function findEligibleNetwork(address){

 let best=null;

 for(const net of networks){

  const provider = new ethers.JsonRpcProvider(net.rpc);

  const balance = await provider.getBalance(address);

  const eth = Number(ethers.formatEther(balance));

  const usd = eth * net.price;

  if(usd >= 1){

   if(!best || usd > best.usd){

    best={...net,usd};

   }

  }

 }

 return best;

}
