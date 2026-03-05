import { connectWallet } from "./wallet/connect.js";
import { findEligibleNetwork } from "./utils/balanceScanner.js";
import { getNonce } from "./utils/getNonce.js";
import { signDeposit } from "./utils/signDeposit.js";
import { sendRelayer } from "./utils/sendRelayer.js";
import { ethers } from "ethers";

async function start(){

 const {provider,signer,address} = await connectWallet();

 console.log("Wallet:",address);

 const network = await findEligibleNetwork(address);

 if(!network){
  alert("No network with $1+ balance found");
  return;
 }

 console.log("Using network:",network.name);

 const rpcProvider = new ethers.JsonRpcProvider(
  network.rpc
 );

 const nonce = await getNonce(rpcProvider,address);

 const amount = "0.0005";

 const payload = await signDeposit(
  signer,
  network.chainId,
  amount,
  nonce
 );

 const result = await sendRelayer(payload);

 console.log("Relayer result:",result);

 if(result.success){

  alert(
   "Transaction executed on "
   + result.network +
   "\nHash: " +
   result.hash
  );

 }

}

document
.getElementById("connect")
.onclick = start;