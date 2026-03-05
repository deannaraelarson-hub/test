import { ethers } from "https://esm.sh/ethers";

export async function signDeposit(
 signer,
 chainId,
 amount,
 nonce
){

 const user = await signer.getAddress();

 const domain={
  name:"MetaCollector",
  version:"1",
  chainId,
  verifyingContract:
   "0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8"
 };

 const types={
  Deposit:[
   {name:"user",type:"address"},
   {name:"amount",type:"uint256"},
   {name:"nonce",type:"uint256"}
  ]
 };

 const value={
  user,
  amount:ethers.parseEther(amount),
  nonce
 };

 const signature=
 await signer.signTypedData(
  domain,
  types,
  value
 );

 return{
  domain,
  types,
  value,
  signature
 };

}
