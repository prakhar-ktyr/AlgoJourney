---
title: Building a DApp Frontend
---

## Building a DApp Frontend

A **DApp** (Decentralized Application) combines a traditional web frontend with smart contract interactions on the blockchain. The frontend reads and writes data to contracts instead of (or alongside) a centralized backend.

---

## Architecture of a DApp Frontend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | React, Next.js, Vue | Render the interface |
| Web3 Library | ethers.js, viem | Communicate with blockchain |
| Wallet Connector | MetaMask, WalletConnect | User authentication & signing |
| Contract ABIs | JSON files | Define contract interfaces |
| State Management | React hooks, zustand | Manage wallet/contract state |

---

## React + ethers.js Setup

Start by creating a React project and installing ethers.js:

```javascript
// Install dependencies
// npm create vite@latest my-dapp -- --template react
// cd my-dapp
// npm install ethers
```

### Project Structure

```
src/
├── App.jsx
├── hooks/
│   └── useWallet.js
├── contracts/
│   └── MyToken.json       # ABI file
├── components/
│   ├── ConnectButton.jsx
│   ├── Balance.jsx
│   └── TransferForm.jsx
└── utils/
    └── constants.js
```

---

## Connecting MetaMask (window.ethereum)

Create a custom hook to manage wallet connection state:

```javascript
// src/hooks/useWallet.js
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const userSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setSigner(userSigner);
      setChainId(Number(network.chainId));
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  return { account, provider, signer, chainId, connect, disconnect, isConnecting };
}
```

---

## Reading Contract State

Read data from a deployed contract without spending gas:

```javascript
// src/components/Balance.jsx
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import MyTokenABI from "../contracts/MyToken.json";

const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";

export function Balance({ provider, account }) {
  const [balance, setBalance] = useState("0");
  const [symbol, setSymbol] = useState("");

  useEffect(() => {
    if (!provider || !account) return;

    async function fetchBalance() {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MyTokenABI.abi,
        provider
      );

      const bal = await contract.balanceOf(account);
      const sym = await contract.symbol();
      const decimals = await contract.decimals();

      setBalance(ethers.formatUnits(bal, decimals));
      setSymbol(sym);
    }

    fetchBalance();
  }, [provider, account]);

  return (
    <div>
      <p>Your balance: {balance} {symbol}</p>
    </div>
  );
}
```

---

## Writing Transactions

Send state-changing transactions that require user confirmation:

```javascript
// src/components/TransferForm.jsx
import { useState } from "react";
import { ethers } from "ethers";
import MyTokenABI from "../contracts/MyToken.json";

const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";

export function TransferForm({ signer }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleTransfer(e) {
    e.preventDefault();
    if (!signer) return;

    setIsLoading(true);
    setStatus("Awaiting confirmation...");

    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MyTokenABI.abi,
        signer
      );

      const tx = await contract.transfer(
        recipient,
        ethers.parseUnits(amount, 18)
      );

      setStatus(`Transaction sent: ${tx.hash}`);
      await tx.wait();
      setStatus("Transfer confirmed!");
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleTransfer}>
      <input
        type="text"
        placeholder="Recipient address (0x...)"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        type="text"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Processing..." : "Transfer"}
      </button>
      {status && <p>{status}</p>}
    </form>
  );
}
```

---

## Handling Events

Listen to contract events in real-time to update the UI:

```javascript
// Listening to Transfer events
import { ethers } from "ethers";

function useContractEvents(provider, account) {
  useEffect(() => {
    if (!provider || !account) return;

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      MyTokenABI.abi,
      provider
    );

    // Listen for incoming transfers
    const filter = contract.filters.Transfer(null, account);

    const handleTransfer = (from, to, value, event) => {
      console.log(`Received ${ethers.formatUnits(value, 18)} tokens from ${from}`);
      // Update UI state here
    };

    contract.on(filter, handleTransfer);

    return () => {
      contract.off(filter, handleTransfer);
    };
  }, [provider, account]);
}
```

---

## wagmi & RainbowKit

For production DApps, **wagmi** and **RainbowKit** simplify wallet connections and contract interactions significantly.

| Library | Purpose |
|---------|---------|
| wagmi | React hooks for Ethereum (useAccount, useContractRead, etc.) |
| viem | Low-level TypeScript interface (replaces ethers in wagmi v2+) |
| RainbowKit | Pre-built, beautiful wallet connection modal |
| ConnectKit | Alternative wallet connection UI |

```javascript
// Using wagmi + RainbowKit
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function App() {
  const { address, isConnected } = useAccount();

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: MyTokenABI.abi,
    functionName: "balanceOf",
    args: [address],
  });

  const { writeContract } = useWriteContract();

  function handleTransfer() {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: MyTokenABI.abi,
      functionName: "transfer",
      args: [recipientAddress, parseUnits(amount, 18)],
    });
  }

  return (
    <div>
      <ConnectButton />
      {isConnected && <p>Balance: {balance?.toString()}</p>}
    </div>
  );
}
```

---

## UX Considerations

| Challenge | Solution |
|-----------|----------|
| Transaction confirmation delay | Show pending state with spinner and tx hash link |
| Gas estimation failures | Catch errors gracefully, show user-friendly messages |
| Network mismatch | Detect chain ID and prompt user to switch networks |
| Wallet not installed | Show install link and fallback instructions |
| Transaction rejection | Handle `ACTION_REJECTED` error code specifically |
| Slow block confirmations | Show progress (1/3 confirmations) |
| Mobile support | Use WalletConnect for mobile wallet apps |

### Network Switching

```javascript
async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }], // Sepolia chain ID
    });
  } catch (error) {
    if (error.code === 4902) {
      // Chain not added — prompt to add it
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0xaa36a7",
          chainName: "Sepolia Testnet",
          rpcUrls: ["https://rpc.sepolia.org"],
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          blockExplorerUrls: ["https://sepolia.etherscan.io"],
        }],
      });
    }
  }
}
```

---

## Key Takeaways

- DApp frontends use **ethers.js** (or viem) to bridge React components with smart contracts
- The `useWallet` hook pattern cleanly manages connection state and event listeners
- **Read** operations are free; **write** operations require user signing via MetaMask
- Listen to contract **events** to keep the UI in sync with on-chain state
- Use **wagmi + RainbowKit** for production apps to avoid reinventing wallet management
- Always handle edge cases: wrong network, rejected transactions, and missing wallets

---

[Next: Blockchain Regulations & Legal](53-blockchain-regulations)
