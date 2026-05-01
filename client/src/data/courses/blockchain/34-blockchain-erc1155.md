---
title: ERC-1155 Multi-Token Standard
---

ERC-1155 is a multi-token standard that allows a single smart contract to manage both fungible and non-fungible tokens. It was designed to improve efficiency through batch operations and reduced gas costs compared to deploying separate ERC-20 and ERC-721 contracts.

---

## Why ERC-1155?

Before ERC-1155, a gaming project needing gold coins (fungible), health potions (fungible), and unique swords (non-fungible) required separate contracts. ERC-1155 unifies all token types in one contract.

| Feature | ERC-20 | ERC-721 | ERC-1155 |
|---------|--------|---------|----------|
| Token types | Fungible only | Non-fungible only | Both |
| Tokens per contract | 1 | 1 collection | Unlimited |
| Batch transfers | No | No | Yes |
| Batch balance query | No | No | Yes |
| Gas efficiency | Baseline | Higher | Lowest |
| Contracts needed | 1 per token | 1 per collection | 1 for everything |

---

## The ERC-1155 Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC1155 {
    // Events
    event TransferSingle(
        address indexed operator, address indexed from,
        address indexed to, uint256 id, uint256 value
    );
    event TransferBatch(
        address indexed operator, address indexed from,
        address indexed to, uint256[] ids, uint256[] values
    );
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);
    event URI(string value, uint256 indexed id);

    // Balance queries
    function balanceOf(address account, uint256 id) external view returns (uint256);
    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids)
        external view returns (uint256[] memory);

    // Approvals
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address account, address operator) external view returns (bool);

    // Transfers
    function safeTransferFrom(
        address from, address to, uint256 id, uint256 amount, bytes calldata data
    ) external;
    function safeBatchTransferFrom(
        address from, address to, uint256[] calldata ids,
        uint256[] calldata amounts, bytes calldata data
    ) external;
}
```

---

## Batch Operations

The batch functions are what make ERC-1155 gas-efficient:

```solidity
// Single contract call to transfer multiple token types
// Instead of 5 separate transactions, 1 batch does it all
uint256[] memory ids = new uint256[](3);
uint256[] memory amounts = new uint256[](3);

ids[0] = 1;    amounts[0] = 100;  // 100 gold coins
ids[1] = 2;    amounts[1] = 5;    // 5 health potions
ids[2] = 1001; amounts[2] = 1;    // 1 unique sword

safeBatchTransferFrom(player1, player2, ids, amounts, "");
```

### Gas Savings Comparison

| Operation | ERC-20/721 | ERC-1155 | Savings |
|-----------|-----------|----------|---------|
| Transfer 1 token type | ~65,000 gas | ~52,000 gas | ~20% |
| Transfer 5 token types | ~325,000 gas | ~90,000 gas | ~72% |
| Transfer 10 token types | ~650,000 gas | ~130,000 gas | ~80% |
| Query 10 balances | 10 calls | 1 call | 90% fewer calls |

---

## Fungible + Non-Fungible in One Contract

The trick is in how you use token IDs:

```solidity
// Token ID design:
// IDs 1-1000: Fungible tokens (supply > 1)
//   ID 1 = Gold Coin (supply: 1,000,000)
//   ID 2 = Health Potion (supply: 50,000)
//   ID 3 = Mana Crystal (supply: 25,000)

// IDs 1001+: Non-fungible tokens (supply = 1)
//   ID 1001 = Legendary Sword of Fire (unique)
//   ID 1002 = Dragon Shield #1 (unique)
//   ID 1003 = Dragon Shield #2 (unique)
```

---

## Gaming Use Case: Full Implementation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameItems is ERC1155, Ownable {
    // Token IDs
    uint256 public constant GOLD = 1;
    uint256 public constant HEALTH_POTION = 2;
    uint256 public constant MANA_CRYSTAL = 3;
    uint256 public constant LEGENDARY_SWORD = 1001;

    // Track next NFT ID
    uint256 private _nextNftId = 1001;

    // Token metadata
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC1155("") Ownable(msg.sender) {
        // Mint initial fungible supplies to deployer
        _mint(msg.sender, GOLD, 1_000_000, "");
        _mint(msg.sender, HEALTH_POTION, 50_000, "");
        _mint(msg.sender, MANA_CRYSTAL, 25_000, "");
    }

    // Mint fungible tokens (game rewards)
    function mintFungible(address to, uint256 id, uint256 amount) public onlyOwner {
        require(id < 1001, "Use mintNFT for non-fungibles");
        _mint(to, id, amount, "");
    }

    // Mint a unique NFT item
    function mintNFT(address to, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 newId = _nextNftId;
        _nextNftId++;
        _mint(to, newId, 1, "");
        _tokenURIs[newId] = tokenURI;
        return newId;
    }

    // Batch airdrop to multiple players
    function airdrop(
        address[] calldata players,
        uint256 id,
        uint256 amount
    ) public onlyOwner {
        for (uint256 i = 0; i < players.length; i++) {
            _mint(players[i], id, amount, "");
        }
    }

    function uri(uint256 id) public view override returns (string memory) {
        return _tokenURIs[id];
    }
}
```

---

## Interacting with ERC-1155 in JavaScript

```javascript
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const signer = await provider.getSigner();

const gameItems = new ethers.Contract(contractAddress, abi, signer);

// Check balance of gold coins for a player
const goldBalance = await gameItems.balanceOf(playerAddress, 1); // ID 1 = Gold
console.log("Gold coins:", goldBalance.toString());

// Batch balance check
const balances = await gameItems.balanceOfBatch(
  [playerAddress, playerAddress, playerAddress],
  [1, 2, 3] // Gold, Health Potion, Mana Crystal
);
console.log("All balances:", balances.map((b) => b.toString()));

// Transfer items between players
await gameItems.safeTransferFrom(
  signer.address,
  otherPlayer,
  1,     // Gold token ID
  500,   // Amount
  "0x"   // No additional data
);
```

---

## Receiving ERC-1155 Tokens

Contracts receiving ERC-1155 tokens must implement the receiver interface:

```solidity
interface IERC1155Receiver {
    function onERC1155Received(
        address operator, address from,
        uint256 id, uint256 value, bytes calldata data
    ) external returns (bytes4);

    function onERC1155BatchReceived(
        address operator, address from,
        uint256[] calldata ids, uint256[] calldata values,
        bytes calldata data
    ) external returns (bytes4);
}
```

---

## ERC-1155 vs ERC-20 + ERC-721 Combined

| Aspect | Separate Standards | ERC-1155 |
|--------|-------------------|----------|
| Deployment cost | Multiple contracts | Single contract |
| Atomic trades | Complex, multi-tx | Native batch support |
| Metadata | Per-contract | Per-token ID |
| Marketplace support | Universal | Growing |
| Complexity | Simple per contract | More complex single contract |
| Standards compliance | Mature | Mature |

---

## Key Takeaways

- ERC-1155 manages both fungible and non-fungible tokens in a single contract
- Batch operations (`safeBatchTransferFrom`, `balanceOfBatch`) save significant gas
- Token IDs determine fungibility — supply of 1 makes it non-fungible
- Ideal for gaming where players hold many different item types
- OpenZeppelin provides a complete, audited implementation
- One deployment replaces what would otherwise need multiple ERC-20 and ERC-721 contracts
- The standard is widely supported by marketplaces including OpenSea

---

## Next

[Upgradeable Contracts](/courses/blockchain/35-blockchain-upgradeable-contracts)
