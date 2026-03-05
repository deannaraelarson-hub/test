import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "../config/contract.js";

export async function getNonce(provider,address){

 const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  provider
 );

 const nonce = await contract.nonces(address);

 return Number(nonce);

}