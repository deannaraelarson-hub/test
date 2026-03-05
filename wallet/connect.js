import { createAppKit } from "https://esm.sh/@walletconnect/appkit";
import { ethers } from "https://esm.sh/ethers";

let modal;

export async function connectWallet() {

 if (!modal) {

  modal = createAppKit({
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

 const session = await modal.open();

 const provider = new ethers.BrowserProvider(
  modal.getProvider()
 );

 const signer = await provider.getSigner();

 const address = await signer.getAddress();

 return { provider, signer, address };

}
