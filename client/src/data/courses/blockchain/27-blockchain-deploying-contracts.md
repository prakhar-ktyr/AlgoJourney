---
title: Deploying Smart Contracts
---

## Deploying Smart Contracts

Deployment is the process of publishing your compiled contract bytecode to the blockchain. Once deployed, the contract is immutable and lives at a permanent address. This lesson covers deployment tools, testnets, and best practices.

---

## Deployment Overview

| Step | Description |
|------|-------------|
| 1. Compile | Convert Solidity to bytecode + ABI |
| 2. Choose network | Local, testnet, or mainnet |
| 3. Fund deployer | Ensure deployer wallet has enough ETH for gas |
| 4. Send transaction | Create transaction with bytecode in `data` field |
| 5. Get address | Receive the deployed contract address |
| 6. Verify source | Publish source code on Etherscan for transparency |

---

## Deploying with Remix IDE

Remix is the easiest way to deploy your first contract — no setup required.

1. Open [remix.ethereum.org](https://remix.ethereum.org)
2. Create a new `.sol` file and paste your contract
3. Go to the **Solidity Compiler** tab → click **Compile**
4. Go to the **Deploy & Run** tab
5. Select environment:

| Environment | Description |
|-------------|-------------|
| Remix VM | In-browser blockchain (instant, free) |
| Injected Provider | MetaMask (testnet/mainnet) |
| WalletConnect | Mobile wallets |

6. Set constructor arguments (if any)
7. Click **Deploy**
8. Interact with deployed contract in the panel below

---

## Deploying with Hardhat

Hardhat is the industry-standard deployment tool for professional projects.

### Deploy Script

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Greeter {
    string public greeting;

    constructor(string memory _greeting) {
        greeting = _greeting;
    }

    function setGreeting(string calldata _newGreeting) external {
        greeting = _newGreeting;
    }
}
```

```javascript
// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy with constructor argument
  const Greeter = await ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Blockchain!");

  await greeter.waitForDeployment();
  const address = await greeter.getAddress();
  console.log("Greeter deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Running the Script

```bash
# Deploy to local Hardhat network (temporary)
npx hardhat run scripts/deploy.js

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

---

## Testnet Deployment

Before mainnet, always deploy to a testnet:

| Testnet | Chain ID | ETH Source | Use Case |
|---------|----------|------------|----------|
| Sepolia | 11155111 | Faucets | Primary testing |
| Holesky | 17000 | Faucets | Staking/validator testing |
| Hardhat | 31337 | Auto-funded | Local development |

### Hardhat Network Configuration

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
```

**Security**: Never commit private keys. Use `.env` files with `dotenv` or hardware wallets.

---

## Constructor Arguments

Constructor arguments are ABI-encoded and appended to the bytecode during deployment:

```solidity
contract Token {
    string public name;
    uint256 public totalSupply;
    address public owner;

    constructor(string memory _name, uint256 _supply) {
        name = _name;
        totalSupply = _supply;
        owner = msg.sender;
    }
}
```

```javascript
// In deploy script
const Token = await ethers.getContractFactory("Token");
const token = await Token.deploy("MyToken", 1000000);
```

---

## Verifying on Etherscan

Verification publishes your source code so users can read and trust your contract.

```bash
# Using Hardhat
npx hardhat verify --network sepolia DEPLOYED_ADDRESS "Hello, Blockchain!"

# With constructor args file
npx hardhat verify --network sepolia DEPLOYED_ADDRESS --constructor-args arguments.js
```

```javascript
// arguments.js
module.exports = ["Hello, Blockchain!"];
```

| Verification Method | Pros | Cons |
|-------------------|------|------|
| Hardhat plugin | Automated, scriptable | Requires API key |
| Etherscan UI | No tools needed | Manual, error-prone |
| Foundry | Fast, integrated | Requires Foundry setup |

---

## Deployment Checklist

Before deploying to mainnet:

| Check | Why |
|-------|-----|
| All tests passing | Prevent bugs on immutable code |
| Gas optimization reviewed | Save deployment + usage costs |
| Access controls verified | Prevent unauthorized actions |
| Constructor args double-checked | Cannot change after deployment |
| Audit completed (if applicable) | Security assurance |
| Deployer wallet funded | Need ETH for gas |
| Network confirmed | Wrong network = lost funds |
| Source verification planned | Build user trust |
| Upgrade strategy decided | Immutable unless proxy pattern used |
| Emergency pause mechanism | Circuit breaker for critical bugs |

---

## Deployment Costs

| Factor | Impact on Cost |
|--------|---------------|
| Bytecode size | Larger = more expensive |
| Constructor logic | Complex init = more gas |
| Network congestion | Higher base fee = more ETH |
| Storage initialization | Each slot = 20,000 gas |

A typical simple contract costs 0.01–0.05 ETH on mainnet; complex protocols can cost 1+ ETH.

---

## Key Takeaways

- Deployment sends compiled bytecode to the blockchain in a special transaction
- Always test on testnets (Sepolia) before deploying to mainnet
- Use Hardhat or Foundry deploy scripts for reproducible deployments
- Never expose private keys — use environment variables and `.env` files
- Verify your source code on Etherscan for transparency and trust
- Deployment is irreversible — double-check everything before mainnet

---

[Next: Development Environment](./28-blockchain-dev-environment)
