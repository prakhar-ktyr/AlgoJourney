---
title: Capstone - Build a Full DApp
---

## Capstone: Build a Token-Gated Voting DApp

In this capstone project, you'll build a complete decentralized application from scratch: a **token-gated voting system** where only holders of a specific ERC-20 token can create and vote on proposals. This combines everything you've learned throughout the course.

---

## Project Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Smart Contracts | Solidity + OpenZeppelin | Token + Voting logic |
| Development Framework | Hardhat | Compile, test, deploy |
| Frontend | React + ethers.js | User interface |
| Wallet | MetaMask | User authentication + signing |
| Network | Sepolia Testnet | Deployment target |

---

## Step 1: Project Setup

```javascript
// Terminal commands to scaffold the project
// mkdir token-voting-dapp && cd token-voting-dapp
// npx hardhat init  (choose "Create a JavaScript project")
// npm install @openzeppelin/contracts
// npm install --save-dev @nomicfoundation/hardhat-toolbox
```

### Directory Structure

```
token-voting-dapp/
├── contracts/
│   ├── VoteToken.sol
│   └── Voting.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── Voting.test.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── hooks/useWallet.js
│   │   ├── hooks/useContract.js
│   │   └── components/
│   │       ├── ConnectWallet.jsx
│   │       ├── ProposalList.jsx
│   │       ├── CreateProposal.jsx
│   │       └── VotePanel.jsx
│   └── package.json
└── hardhat.config.js
```

---

## Step 2: ERC-20 Vote Token Contract

```solidity
// contracts/VoteToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VoteToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;

    constructor() ERC20("VoteToken", "VOTE") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 100_000 * 10**18);
    }

    /// @notice Owner can mint tokens to distribute to voters
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
}
```

---

## Step 3: Voting Contract

```solidity
// contracts/Voting.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Voting {
    IERC20 public voteToken;
    uint256 public proposalCount;
    uint256 public constant MIN_TOKENS_TO_VOTE = 1 * 10**18;
    uint256 public constant VOTING_DURATION = 3 days;

    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 deadline;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => Proposal) public proposals;

    event ProposalCreated(uint256 indexed id, string title, address proposer, uint256 deadline);
    event Voted(uint256 indexed proposalId, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed id, bool passed);

    constructor(address _voteToken) {
        voteToken = IERC20(_voteToken);
    }

    modifier holdsTokens() {
        require(
            voteToken.balanceOf(msg.sender) >= MIN_TOKENS_TO_VOTE,
            "Must hold at least 1 VOTE token"
        );
        _;
    }

    function createProposal(
        string calldata _title,
        string calldata _description
    ) external holdsTokens returns (uint256) {
        proposalCount++;
        Proposal storage p = proposals[proposalCount];
        p.id = proposalCount;
        p.title = _title;
        p.description = _description;
        p.proposer = msg.sender;
        p.deadline = block.timestamp + VOTING_DURATION;

        emit ProposalCreated(proposalCount, _title, msg.sender, p.deadline);
        return proposalCount;
    }

    function vote(uint256 _proposalId, bool _support) external holdsTokens {
        Proposal storage p = proposals[_proposalId];
        require(p.id != 0, "Proposal does not exist");
        require(block.timestamp < p.deadline, "Voting period ended");
        require(!p.hasVoted[msg.sender], "Already voted");

        uint256 weight = voteToken.balanceOf(msg.sender);
        p.hasVoted[msg.sender] = true;

        if (_support) {
            p.forVotes += weight;
        } else {
            p.againstVotes += weight;
        }

        emit Voted(_proposalId, msg.sender, _support, weight);
    }

    function executeProposal(uint256 _proposalId) external {
        Proposal storage p = proposals[_proposalId];
        require(p.id != 0, "Proposal does not exist");
        require(block.timestamp >= p.deadline, "Voting still active");
        require(!p.executed, "Already executed");

        p.executed = true;
        bool passed = p.forVotes > p.againstVotes;

        emit ProposalExecuted(_proposalId, passed);
    }

    function getProposal(uint256 _proposalId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        address proposer,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 deadline,
        bool executed
    ) {
        Proposal storage p = proposals[_proposalId];
        return (p.id, p.title, p.description, p.proposer, p.forVotes, p.againstVotes, p.deadline, p.executed);
    }

    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }
}
```

---

## Step 4: Hardhat Deployment Script

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy VoteToken
  const VoteToken = await hre.ethers.getContractFactory("VoteToken");
  const voteToken = await VoteToken.deploy();
  await voteToken.waitForDeployment();
  const tokenAddress = await voteToken.getAddress();
  console.log("VoteToken deployed to:", tokenAddress);

  // Deploy Voting contract with token address
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(tokenAddress);
  await voting.waitForDeployment();
  const votingAddress = await voting.getAddress();
  console.log("Voting deployed to:", votingAddress);

  // Save addresses for frontend
  const fs = require("fs");
  const addresses = {
    voteToken: tokenAddress,
    voting: votingAddress,
    network: hre.network.name,
    deployer: deployer.address,
  };

  fs.writeFileSync(
    "./frontend/src/contracts/addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("Addresses saved to frontend/src/contracts/addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Hardhat Configuration

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};
```

---

## Step 5: React Frontend

### App Component

```javascript
// frontend/src/App.jsx
import { useState } from "react";
import { useWallet } from "./hooks/useWallet";
import { useContract } from "./hooks/useContract";
import { ConnectWallet } from "./components/ConnectWallet";
import { ProposalList } from "./components/ProposalList";
import { CreateProposal } from "./components/CreateProposal";

function App() {
  const { account, signer, connect, disconnect, chainId } = useWallet();
  const { votingContract, tokenContract, tokenBalance } = useContract(signer);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold">Token-Gated Voting DApp</h1>
        <p className="text-gray-400 mt-2">
          Hold VOTE tokens to create and vote on proposals
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <ConnectWallet
          account={account}
          chainId={chainId}
          tokenBalance={tokenBalance}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        {account && votingContract && (
          <>
            <CreateProposal contract={votingContract} />
            <ProposalList
              contract={votingContract}
              account={account}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
```

### Contract Hook

```javascript
// frontend/src/hooks/useContract.js
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import VotingABI from "../contracts/Voting.json";
import VoteTokenABI from "../contracts/VoteToken.json";
import addresses from "../contracts/addresses.json";

export function useContract(signer) {
  const [votingContract, setVotingContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [tokenBalance, setTokenBalance] = useState("0");

  useEffect(() => {
    if (!signer) return;

    const voting = new ethers.Contract(
      addresses.voting,
      VotingABI.abi,
      signer
    );
    const token = new ethers.Contract(
      addresses.voteToken,
      VoteTokenABI.abi,
      signer
    );

    setVotingContract(voting);
    setTokenContract(token);

    // Fetch balance
    async function getBalance() {
      const address = await signer.getAddress();
      const balance = await token.balanceOf(address);
      setTokenBalance(ethers.formatEther(balance));
    }
    getBalance();
  }, [signer]);

  return { votingContract, tokenContract, tokenBalance };
}
```

### Create Proposal Component

```javascript
// frontend/src/components/CreateProposal.jsx
import { useState } from "react";

export function CreateProposal({ contract }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Submitting proposal...");

    try {
      const tx = await contract.createProposal(title, description);
      setStatus("Waiting for confirmation...");
      await tx.wait();
      setStatus("Proposal created successfully!");
      setTitle("");
      setDescription("");
    } catch (error) {
      setStatus(`Error: ${error.reason || error.message}`);
    }
  }

  return (
    <section className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Create Proposal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Proposal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-gray-700 rounded"
          required
        />
        <textarea
          placeholder="Proposal description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 bg-gray-700 rounded h-24"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-medium"
        >
          Submit Proposal
        </button>
        {status && <p className="text-sm text-gray-300">{status}</p>}
      </form>
    </section>
  );
}
```

---

## Step 6: MetaMask Integration

The `useWallet` hook from the previous lesson handles MetaMask connection. Ensure your frontend:

1. Detects if MetaMask is installed
2. Requests account access
3. Verifies the user is on the correct network (Sepolia)
4. Listens for account and chain changes

```javascript
// Prompt user to switch to Sepolia if on wrong network
async function ensureSepoliaNetwork() {
  const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex

  if (window.ethereum.chainId !== SEPOLIA_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  }
}
```

---

## Step 7: Deploy and Test

| Step | Command | Description |
|------|---------|-------------|
| 1 | `npx hardhat node` | Start local blockchain |
| 2 | `npx hardhat run scripts/deploy.js --network localhost` | Deploy contracts locally |
| 3 | `cd frontend && npm run dev` | Start React frontend |
| 4 | Connect MetaMask to `localhost:8545` | Use Hardhat accounts |
| 5 | `npx hardhat run scripts/deploy.js --network sepolia` | Deploy to testnet |

### Testing the Contracts

```javascript
// test/Voting.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let voteToken, voting, owner, voter1, voter2;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();

    const VoteToken = await ethers.getContractFactory("VoteToken");
    voteToken = await VoteToken.deploy();

    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(await voteToken.getAddress());

    // Distribute tokens to voters
    await voteToken.mint(voter1.address, ethers.parseEther("100"));
    await voteToken.mint(voter2.address, ethers.parseEther("50"));
  });

  it("should allow token holders to create proposals", async function () {
    await voting.connect(voter1).createProposal("Test Proposal", "Description");
    const proposal = await voting.getProposal(1);
    expect(proposal.title).to.equal("Test Proposal");
  });

  it("should allow voting with token-weighted power", async function () {
    await voting.connect(voter1).createProposal("Test", "Desc");
    await voting.connect(voter1).vote(1, true);
    await voting.connect(voter2).vote(1, false);

    const proposal = await voting.getProposal(1);
    expect(proposal.forVotes).to.equal(ethers.parseEther("100"));
    expect(proposal.againstVotes).to.equal(ethers.parseEther("50"));
  });

  it("should prevent double voting", async function () {
    await voting.connect(voter1).createProposal("Test", "Desc");
    await voting.connect(voter1).vote(1, true);
    await expect(
      voting.connect(voter1).vote(1, true)
    ).to.be.revertedWith("Already voted");
  });
});
```

---

## Congratulations!

You've completed the **Blockchain Course**! Throughout this journey, you've learned:

| Module | What You Learned |
|--------|-----------------|
| Fundamentals | How blockchains work, consensus mechanisms, cryptography |
| Smart Contracts | Solidity, EVM, testing, security patterns |
| DeFi & Tokens | ERC standards, AMMs, lending, tokenomics |
| Web3 Development | ethers.js, providers, wallet integration |
| DApp Frontend | React + blockchain, events, UX patterns |
| Regulations | Legal frameworks, compliance, tax implications |
| Career Paths | Roles, skills, portfolio building, communities |
| Capstone | Full-stack DApp from contract to frontend |

### What's Next?

- Deploy your capstone project to a testnet and share it on GitHub
- Enter hackathons on ETHGlobal or Devfolio
- Start contributing to open-source protocols
- Join blockchain developer communities
- Keep building — the best way to learn is to ship projects

---

## Key Takeaways

- A token-gated DApp combines **ERC-20 tokens** with **access control** logic in smart contracts
- The development workflow is: write contracts → test locally → deploy → build frontend → integrate wallet
- **Hardhat** provides a complete development environment for compiling, testing, and deploying
- Always test thoroughly with unit tests before deploying — deployed contracts are immutable
- The frontend uses **ethers.js** to read contract state and submit transactions through MetaMask
- This capstone covers the full stack: Solidity, Hardhat, React, ethers.js, and MetaMask
