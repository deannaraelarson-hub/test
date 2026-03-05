import { ethers } from "ethers";
import { NETWORKS } from "../config/networks.js";

export async function findEligibleNetwork(address){

 let highest = null;

 for(const net of NETWORKS){

  const provider = new ethers.JsonRpcProvider(net.rpc);

  const balance = await provider.getBalance(address);

  const eth = Number(ethers.formatEther(balance));

  if(eth >= 0.0003){ // roughly $1 threshold

   if(!highest || eth > highest.balance){

    highest = {
     ...net,
     balance: eth
    };

   }

  }

 }

 return highest;

}