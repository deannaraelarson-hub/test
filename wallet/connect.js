
import { createAppKit } from "@walletconnect/appkit";
import { ethers } from "ethers";

let appkit;
let provider;
let signer;

export async function connectWallet() {

 if(!appkit){

  appkit = createAppKit({
   projectId: "906bd57a09299f262aab595f3226ec60",
   networks: [
    {
     id: 1,
     name: "Ethereum",
     rpcUrl: "https://rpc.ankr.com/eth"
    },
    {
     id: 137,
     name: "Polygon",
     rpcUrl: "https://rpc.ankr.com/polygon"
    },
    {
     id: 56,
     name: "BNB",
     rpcUrl: "https://rpc.ankr.com/bsc"
    },
    {
     id: 42161,
     name: "Arbitrum",
     rpcUrl: "https://rpc.ankr.com/arbitrum"
    },
    {
     id: 43114,
     name: "Avalanche",
     rpcUrl: "https://rpc.ankr.com/avalanche"
    }
   ]
  });

 }

 const session = await appkit.open();

 provider = new ethers.BrowserProvider(window.ethereum);

 signer = await provider.getSigner();

 const address = await signer.getAddress();

 return { provider, signer, address };

}
