import { createAppKit } from "@walletconnect/appkit";
import { ethers } from "ethers";

let provider;
let signer;

export async function connectWallet() {

 const modal = createAppKit({
  projectId: "906bd57a09299f262aab595f3226ec60",
  chains: [1,137,56,42161,43114]
 });

 const session = await modal.connect();

 provider = new ethers.BrowserProvider(
  window.ethereum
 );

 signer = await provider.getSigner();

 const address = await signer.getAddress();

 return { provider, signer, address };

}