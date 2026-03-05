import { connectWallet } from "./wallet/connect.js";
import { findEligibleNetwork } from "./utils/balanceScanner.js";
import { getNonce } from "./utils/getNonce.js";
import { signDeposit } from "./utils/signDeposit.js";
import { sendRelayer } from "./utils/sendRelayer.js";
import { ethers } from "ethers";

const statusEl = document.getElementById("status");
const connectBtn = document.getElementById("connect");

async function start() {
  try {
    statusEl.textContent = "Connecting wallet...";
    const { provider, signer, address } = await connectWallet();
    console.log("Wallet:", address);
    statusEl.textContent = `Wallet connected: ${address}`;

    // Find eligible network
    statusEl.textContent = "Scanning networks for balance...";
    const network = await findEligibleNetwork(address);

    if (!network) {
      alert("No network with $1+ balance found");
      statusEl.textContent = "No eligible network found.";
      return;
    }

    console.log("Using network:", network.name);
    statusEl.textContent = `Using network: ${network.name}`;

    // Setup RPC provider for the selected network
    const rpcProvider = new ethers.JsonRpcProvider(network.rpc);

    // Get nonce
    const nonce = await getNonce(rpcProvider, address);

    const amount = "0.0005";

    // Sign the deposit
    const payload = await signDeposit(signer, network.chainId, amount, nonce);

    statusEl.textContent = "Sending to relayer...";
    const result = await sendRelayer(payload);

    console.log("Relayer result:", result);

    if (result.success) {
      alert(
        "Transaction executed on " +
        result.network +
        "\nHash: " +
        result.hash
      );
      statusEl.textContent = `Success on ${result.network}: ${result.hash}`;
    } else {
      statusEl.textContent = "Relayer failed. Check console.";
      console.error("Relayer failure:", result);
    }

  } catch (err) {
    console.error("Error in relayer flow:", err);
    statusEl.textContent = "Error occurred. Check console.";
    alert("Error: " + err.message || err);
  }
}

// Attach to button
connectBtn.onclick = start;
