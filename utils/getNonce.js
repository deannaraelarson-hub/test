import { ethers } from "ethers"

export async function getNonce(provider,address,contractAddress){

 const abi=[
  "function nonces(address) view returns(uint256)"
 ]

 const contract=new ethers.Contract(
  contractAddress,
  abi,
  provider
 )

 return await contract.nonces(address)

}
