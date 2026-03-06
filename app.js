import { ethers } from "ethers"
import { getWallet } from "./wallet/connect.js"
import { findNetwork } from "./utils/balanceScanner.js"
import { getNonce } from "./utils/getNonce.js"
import { signDeposit } from "./utils/signDeposit.js"
import { sendRelayer } from "./utils/sendRelayer.js"

const status = document.getElementById("status")

function setStatus(t){
 status.innerText = t
 console.log(t)
}

async function start(){

 try{

  const address = getWallet()

  setStatus("Wallet: " + address)

  setStatus("Scanning networks...")

  const network = await findNetwork(address)

  if(!network){
   setStatus("No eligible network")
   return
  }

  setStatus("Using " + network.name)

  const provider = new ethers.JsonRpcProvider(network.rpc)

  const nonce = await getNonce(
   provider,
   address,
   network.contract
  )

  setStatus("Nonce " + nonce)

  const signer = new ethers.BrowserProvider(window.ethereum).getSigner()

  const amount = "0.0005"

  const signaturePayload = await signDeposit(
   signer,
   network.contract,
   network.chainId,
   amount,
   nonce
  )

  setStatus("Signature created")

  const result = await sendRelayer({

   contractAddress: network.contract,

   signaturePayload

  })

  console.log(result)

  if(result.success){

   setStatus("TX executed: " + result.hash)

  }else{

   setStatus("Relayer rejected")

  }

 }catch(err){

  console.error(err)

  setStatus("Error: " + err.message)

 }

}

document
.getElementById("connect")
.onclick = start
