---
title: Development Environment
---

## Development Environment

A proper development environment is essential for building, testing, and deploying smart contracts efficiently. This lesson covers the two major frameworks — Hardhat and Foundry — along with project structure and tooling.

---

## Framework Comparison

| Feature | Hardhat | Foundry |
|---------|---------|---------|
| Language | JavaScript/TypeScript | Solidity (tests too) |
| Speed | Moderate | Very fast |
| Testing | Mocha + Chai + ethers.js | Forge (Solidity-native) |
| Debugging | `console.log` in Solidity | Traces + `forge debug` |
| Fuzzing | Via plugins | Built-in |
| Maturity | Established (2019) | Newer but growing fast |
| Package manager | npm | Git submodules / soldeer |
| Learning curve | Lower (JS devs) | Lower (Solidity devs) |

---

## Hardhat Setup

### Installation

```bash
mkdir my-project && cd my-project
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

Choose "Create a JavaScript project" for the simplest setup.

### Project Structure

```
my-project/
├── contracts/          # Solidity source files
│   └── Lock.sol
├── scripts/            # Deployment scripts
│   └── deploy.js
├── test/               # Test files
│   └── Lock.js
├── hardhat.config.js   # Configuration
├── package.json
└── .env                # Secrets (never commit!)
```

### Configuration

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      // Local development chain
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
```

### Common Commands

| Command | Description |
|---------|-------------|
| `npx hardhat compile` | Compile all contracts |
| `npx hardhat test` | Run test suite |
| `npx hardhat node` | Start local blockchain |
| `npx hardhat run scripts/deploy.js` | Run deployment script |
| `npx hardhat console` | Interactive JS console |
| `npx hardhat clean` | Clear cache and artifacts |

---

## Foundry Setup

### Installation

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Create new project
forge init my-project
cd my-project
```

### Project Structure

```
my-project/
├── src/                # Solidity source files
│   └── Counter.sol
├── test/               # Solidity test files
│   └── Counter.t.sol
├── script/             # Deployment scripts (Solidity)
│   └── Counter.s.sol
├── lib/                # Dependencies (git submodules)
│   └── forge-std/
├── foundry.toml        # Configuration
└── .env                # Secrets (never commit!)
```

### Configuration

```toml
# foundry.toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.20"
optimizer = true
optimizer_runs = 200

[profile.default.fuzz]
runs = 256

[rpc_endpoints]
sepolia = "${SEPOLIA_RPC_URL}"
mainnet = "${MAINNET_RPC_URL}"

[etherscan]
sepolia = { key = "${ETHERSCAN_API_KEY}" }
```

### Common Commands

| Command | Description |
|---------|-------------|
| `forge build` | Compile contracts |
| `forge test` | Run tests |
| `forge test -vvvv` | Run tests with full traces |
| `forge script script/Deploy.s.sol` | Run deployment script |
| `anvil` | Start local blockchain |
| `cast` | CLI for interacting with contracts |
| `forge coverage` | Check test coverage |

---

## Local Blockchain

Both frameworks provide a local blockchain for development:

### Hardhat Network

```bash
# Start persistent local node (port 8545)
npx hardhat node

# In another terminal, deploy to it
npx hardhat run scripts/deploy.js --network localhost
```

### Anvil (Foundry)

```bash
# Start local node
anvil

# Options
anvil --fork-url $MAINNET_RPC_URL  # Fork mainnet
anvil --block-time 12              # Auto-mine every 12s
anvil --accounts 20                # Generate 20 test accounts
```

| Feature | Hardhat Network | Anvil |
|---------|----------------|-------|
| Speed | Fast | Very fast |
| Forking | Supported | Supported |
| Auto-mining | Default | Default |
| Accounts | 20 (10 ETH each) | 10 (10,000 ETH each) |
| Console.log | Built-in | Via forge-std |

---

## Essential Tools

| Tool | Purpose | Install |
|------|---------|---------|
| MetaMask | Browser wallet | Browser extension |
| Etherscan | Block explorer | Web-based |
| OpenZeppelin | Audited contract library | `npm i @openzeppelin/contracts` |
| Slither | Static analysis | `pip install slither-analyzer` |
| Tenderly | Debugging & simulation | Web-based |
| The Graph | Indexing & querying events | Self-hosted or hosted |

---

## Environment Variables

```bash
# .env (NEVER commit this file)
PRIVATE_KEY=0xabc123...
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=YOUR_API_KEY
```

Add to `.gitignore`:
```
.env
node_modules/
artifacts/
cache/
out/
```

---

## Key Takeaways

- Hardhat is ideal for JavaScript/TypeScript developers; Foundry is faster and preferred by Solidity-focused teams
- Both provide local blockchains, testing frameworks, and deployment tools
- Always use environment variables for secrets — never commit private keys
- The optimizer should be enabled for production deployments (reduces gas costs)
- A local blockchain (Hardhat Network or Anvil) gives instant feedback during development
- Choose the framework that fits your team's language preference and workflow

---

[Next: Testing Smart Contracts](./29-blockchain-testing-contracts)
