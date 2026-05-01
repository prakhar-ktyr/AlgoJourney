---
title: Web3 Development
---

## Web3 Development

Web3 development refers to building applications that interact with blockchain networks. Instead of traditional HTTP APIs, you communicate with decentralized nodes using JSON-RPC calls through libraries like **ethers.js** and **web3.js**.

---

## ethers.js vs web3.js

Both libraries let you interact with Ethereum-compatible blockchains, but they differ in philosophy and design.

| Feature | ethers.js | web3.js |
|---------|-----------|---------|
| Bundle size | ~120 KB (compact) | ~590 KB (larger) |
| Architecture | Provider + Signer separation | Single web3 instance |
| ENS support | Built-in | Plugin required |
| TypeScript | First-class support | Added later |
| Maintenance | Actively maintained (v6) | Maintained by ChainSafe (v4) |
| Learning curve | Moderate | Moderate |
| License | MIT | LGPL-3.0 |

For new projects, **ethers.js** is generally recommended due to its smaller size, cleaner API, and strong TypeScript support.

---

## Connecting to Providers

A **provider** is your gateway to the blockchain. It connects your application to a node that reads and writes data.

### Provider Types

| Provider | Description | Use Case |
|----------|-------------|----------|
| Infura | Managed Ethereum nodes by ConsenSys | Production apps |
| Alchemy | Enhanced node infrastructure + APIs | Production apps with analytics |
| Local (Hardhat/Ganache) | Local dev blockchain | Development and testing |
| MetaMask (browser) | User's browser wallet | Frontend DApps |

### Connecting with ethers.js

```javascript
import { ethers } from "ethers";

// Connect to Infura
const infuraProvider = new ethers.JsonRpcProvider(
  "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
);

// Connect to Alchemy
const alchemyProvider = new ethers.JsonRpcProvider(
  "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
);

// Connect to local Hardhat node
const localProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Connect via MetaMask (browser)
const browserProvider = new ethers.BrowserProvider(window.ethereum);
```

---

## Reading Blockchain Data

Once connected, you can query on-chain data without spending gas.

```javascript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
);

// Get the latest block number
const blockNumber = await provider.getBlockNumber();
console.log("Current block:", blockNumber);

// Get an account balance
const balance = await provider.getBalance("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
console.log("Balance:", ethers.formatEther(balance), "ETH");

// Get transaction details
const tx = await provider.getTransaction("0xTRANSACTION_HASH");
console.log("From:", tx.from);
console.log("To:", tx.to);
console.log("Value:", ethers.formatEther(tx.value), "ETH");

// Get gas price
const feeData = await provider.getFeeData();
console.log("Gas price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
```

---

## Sending Transactions

Sending transactions requires a **Signer** — an entity that holds a private key and can authorize operations.

```javascript
import { ethers } from "ethers";

// Using a private key (NEVER expose in frontend code)
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet("0xYOUR_PRIVATE_KEY", provider);

// Send ETH
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("0.1"),
});

console.log("Transaction hash:", tx.hash);

// Wait for confirmation
const receipt = await tx.wait();
console.log("Confirmed in block:", receipt.blockNumber);
```

> **Security Warning**: Never hard-code private keys in frontend applications. Use environment variables on the server side or wallet connections (MetaMask) on the client side.

---

## Interacting with Smart Contracts

To call a smart contract, you need its **address** and **ABI** (Application Binary Interface).

### What is an ABI?

The ABI is a JSON array describing the contract's functions, events, and their parameters. It acts as the interface between your JavaScript code and the deployed bytecode.

```javascript
// Minimal ERC-20 ABI (only the functions we need)
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const provider = new ethers.JsonRpcProvider(
  "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
);

// Create a contract instance (read-only)
const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const contract = new ethers.Contract(usdtAddress, ERC20_ABI, provider);

// Call read functions (no gas cost)
const name = await contract.name();
const symbol = await contract.symbol();
console.log(`Token: ${name} (${symbol})`);

// Check balance
const balance = await contract.balanceOf("0xSomeAddress");
console.log("Balance:", balance.toString());
```

### Writing to a Contract

```javascript
// Connect contract with a signer for write operations
const signer = await browserProvider.getSigner();
const contractWithSigner = contract.connect(signer);

// Send a transaction (costs gas)
const tx = await contractWithSigner.transfer(
  "0xRecipientAddress",
  ethers.parseUnits("100", 6) // USDT has 6 decimals
);
await tx.wait();
console.log("Transfer confirmed!");
```

---

## Wallet Connection (MetaMask)

MetaMask injects `window.ethereum` into the browser, which you use to request account access.

```javascript
import { ethers } from "ethers";

async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    return;
  }

  // Request account access
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  console.log("Connected account:", accounts[0]);
  console.log("Network:", (await provider.getNetwork()).name);

  return { provider, signer, account: accounts[0] };
}

// Listen for account/network changes
window.ethereum.on("accountsChanged", (accounts) => {
  console.log("Account changed:", accounts[0]);
});

window.ethereum.on("chainChanged", (chainId) => {
  console.log("Network changed:", parseInt(chainId, 16));
  window.location.reload();
});
```

---

## Key Takeaways

- **ethers.js** separates Providers (read) from Signers (write), making the architecture clearer
- Always use **managed providers** (Infura, Alchemy) for production instead of running your own node
- Reading data is free; writing data (transactions) costs **gas**
- The **ABI** defines how your JS code communicates with smart contract bytecode
- **MetaMask** is the standard browser wallet — use `window.ethereum` to connect
- Never expose private keys in client-side code

---

[Next: Building a DApp Frontend](52-blockchain-dapp-frontend)
