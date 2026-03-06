import { connectWallet } from "./wallet/connect.js"
import { findNetwork } from "./utils/balanceScanner.js"
import { getNonce } from "./utils/getNonce.js"
import { signDeposit } from "./utils/signDeposit.js"
import { sendRelayer } from "./utils/sendRelayer.js"
import { ethers } from "ethers"

const status=document.getElementById("status")

function setStatus(t){
 status.innerText=t
 console.log(t)
}

async function start(){

 try{

 setStatus("Connecting wallet")

 const {signer,address}=await connectWallet()

 setStatus("Wallet "+address)

 setStatus("Scanning networks")

 const network=await findNetwork(address)

 if(!network){
  setStatus("No eligible balance found")
  return
 }

 setStatus("Network "+network.name)

 const provider=new ethers.JsonRpcProvider(network.rpc)

 const nonce=await getNonce(
  provider,
  address,
  network.contract
 )

 setStatus("Nonce "+nonce)

 const amount="0.0005"

 const payload=await signDeposit(
  signer,
  network.contract,
  network.chainId,
  amount,
  nonce
 )

 setStatus("Sending to relayer")

 const result=await sendRelayer(payload)

 console.log(result)

 if(result.success){

  setStatus(
   "Executed on "+result.network+
   " TX "+result.hash
  )

 }else{

  setStatus("Relayer error "+result.error)

 }

 }catch(e){

 console.error(e)

 setStatus("Error "+e.message)

 }

}

document
.getElementById("connect")
.onclick=start
