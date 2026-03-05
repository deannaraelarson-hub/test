import { ethers } from "ethers"

export async function signDeposit(
 signer,
 contract,
 chainId,
 amount,
 nonce
){

 const domain={
  name:"MetaCollector",
  version:"1",
  chainId,
  verifyingContract:contract
 }

 const types={
  Deposit:[
   {name:"user",type:"address"},
   {name:"amount",type:"uint256"},
   {name:"nonce",type:"uint256"}
  ]
 }

 const value={
  user:await signer.getAddress(),
  amount:ethers.parseEther(amount),
  nonce
 }

 const signature=await signer.signTypedData(
  domain,
  types,
  value
 )

 return {domain,types,value,signature}

}
