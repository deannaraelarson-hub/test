import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../config/contract.js";

export async function signDeposit(signer,chainId,amount,nonce){

 const user = await signer.getAddress();

 const domain = {
  name: "MetaCollector",
  version: "1",
  chainId,
  verifyingContract: CONTRACT_ADDRESS
 };

 const types = {
  Deposit: [
   { name:"user",type:"address"},
   { name:"amount",type:"uint256"},
   { name:"nonce",type:"uint256"}
  ]
 };

 const value = {
  user,
  amount: ethers.parseEther(amount),
  nonce
 };

 const signature = await signer.signTypedData(
  domain,
  types,
  value
 );

 return {
  domain,
  types,
  value,
  signature,
  expectedSigner: user
 };

}