import { ethers } from "ethers"

export async function signDeposit(
 signer,
 contract,
 chainId,
 amount,
 nonce
){

 const user=await signer.getAddress()

 const domain={
  name:"RelayerDeposit",
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

  user,
  amount:ethers.parseEther(amount).toString(),
  nonce

 }

 const signature=await signer.signTypedData(
  domain,
  types,
  value
 )

 return{

  domain,
  types,
  value,
  signature,
  expectedSigner:user

 }

}
