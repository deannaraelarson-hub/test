import { connectWallet } from "./wallet/connect.js"
import { findNetwork } from "./utils/balanceScanner.js"
import { getNonce } from "./utils/getNonce.js"
import { signDeposit } from "./utils/signDeposit.js"
import { sendRelayer } from "./utils/sendRelayer.js"
import { ethers } from "ethers"

const status = document.getElementById("status")

function setStatus(msg){
 status.innerText = msg
 console.log(msg)
}

async function start(){

 try{

  setStatus("Connecting wallet...")

  const { signer, address } = await connectWallet()

  if(!address){
   setStatus("Wallet connection failed")
   return
  }

  setStatus("Wallet: " + address)

  setStatus("Scanning networks...")

  const network = await findNetwork(address)

  if(!network){

   setStatus("No eligible network found")

   return
  }

  setStatus("Using network: " + network.name)

  const provider = new ethers.JsonRpcProvider(network.rpc)

  setStatus("Fetching nonce")

  const nonce = await getNonce(
   provider,
   address,
   network.contract
  )

  setStatus("Nonce: " + nonce)

  const amount = "0.0005"

  setStatus("Signing authorization")

  const sig = await signDeposit(
   signer,
   network.contract,
   network.chainId,
   amount,
   nonce
  )

  if(!sig){
   setStatus("Signature failed")
   return
  }

  setStatus("Preparing transaction")

  const iface = new ethers.Interface([
   "function executeDeposit(address user,uint256 amount,uint256 nonce,bytes signature)"
  ])

  const encoded = iface.encodeFunctionData(
   "executeDeposit",
   [
    sig.value.user,
    sig.value.amount,
    nonce,
    sig.signature
   ]
  )

  setStatus("Sending to relayer")

  const result = await sendRelayer({

   network: network.name,

   contractAddress: network.contract,

   encodedFunctionData: encoded,

   amount,

   nonce

  })

  console.log("Relayer response:", result)

  if(result && result.success){

   setStatus("Transaction executed ✔ " + result.hash)

  }else{

   setStatus("Relayer rejected request")

  }

 }catch(err){

  console.error(err)

  setStatus("Error: " + err.message)

 }

}

document
.getElementById("connect")
.addEventListener("click", start)
