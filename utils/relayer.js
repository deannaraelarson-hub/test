export async function sendRelayer(data){

 const res=await fetch(
 "https://nexaworldx.com/relayer",
 {

 method:"POST",

 headers:{
  "Content-Type":"application/json",
  "x-api-key":"00de6eb9ebf5ea70f92e4c1efdc00ad32a7131f9856bd17d445f62f19a829fe6"
 },

 body:JSON.stringify(data)

 })

 return await res.json()

}
