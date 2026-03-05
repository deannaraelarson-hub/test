import { connectWallet } from "./wallet/connect.js"
import { findEligibleNetwork } from "./utils/balanceScanner.js"
import { getNonce } from "./utils/getNonce.js"
import { signDeposit } from "./utils/signDeposit.js"
import { sendRelayer } from "./utils/sendRelayer.js"
import { ethers } from "ethers"

const status = document.getElementById("status")

function setStatus(msg){

 console.log(msg)
 status.innerText = msg

}

const CONTRACTS = {

1:"0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8"

}

async function start(){

 try{

  setStatus("Opening wallet selector...")

  const {provider,signer,address} = await connectWallet()

  setStatus("Wallet connected: "+address)

  setStatus("Scanning networks for eligible balance...")

  const network = await findEligibleNetwork(address)

  if(!network){

   setStatus("No network with $1+ balance found")

   return

  }

  setStatus("Using network: "+network.name)

  const rpcProvider = new ethers.JsonRpcProvider(network.rpc)

  const nonce = await getNonce(
   rpcProvider,
   address,
   CONTRACTS[network.chainId]
  )

  setStatus("Preparing signature")

  const amount = "0.0005"

  const payload = await signDeposit(
   signer,
   CONTRACTS[network.chainId],
   network.chainId,
   amount,
   nonce
  )

  setStatus("Sending request to relayer")

  const result = await sendRelayer(
   payload,
   CONTRACTS[network.chainId]
  )

  if(result.success){

   setStatus(
    "Transaction executed\nHash: "+result.hash
   )

  }else{

   setStatus("Relayer error: "+result.error)

  }

 }catch(err){

  console.error(err)

  setStatus("Process failed")

 }

}

document
.getElementById("connect")
.addEventListener("click",start)
