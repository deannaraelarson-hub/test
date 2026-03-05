import { ethers } from "https://esm.sh/ethers";

const abi = [
 "function nonces(address) view returns(uint256)"
];

const contract =
"0x377a91FAa5645539940dF7095Fb0EdE2478e7bd8";

export async function getNonce(provider,user){

 const c = new ethers.Contract(
  contract,
  abi,
  provider
 );

 return await c.nonces(user);

}
