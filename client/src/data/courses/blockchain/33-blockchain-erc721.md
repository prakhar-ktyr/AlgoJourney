---
title: ERC-721 NFT Standard
---

ERC-721 defines the standard for Non-Fungible Tokens (NFTs) on Ethereum. Unlike ERC-20 tokens where each unit is identical, every ERC-721 token is unique and distinguishable, making them ideal for representing ownership of distinct digital or physical assets.

---

## What Are NFTs?

Non-Fungible Tokens represent unique items on the blockchain. Each token has a distinct identifier and cannot be exchanged 1:1 with another token of the same contract.

| Property | Fungible (ERC-20) | Non-Fungible (ERC-721) |
|----------|-------------------|------------------------|
| Interchangeable | Yes | No |
| Divisible | Yes (via decimals) | No (whole units only) |
| Unique ID | No | Yes (tokenId) |
| Use cases | Currency, utility | Art, collectibles, deeds |
| Example | 1 USDC = 1 USDC | CryptoPunk #7804 ≠ #3100 |

---

## The ERC-721 Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC721 {
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    // Query functions
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);

    // Transfer functions
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    function transferFrom(address from, address to, uint256 tokenId) external;

    // Approval functions
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}
```

---

## Metadata: tokenURI and JSON Schema

ERC-721 tokens link to off-chain metadata via the `tokenURI` function:

```solidity
interface IERC721Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}
```

### Metadata JSON Schema

The `tokenURI` returns a URL pointing to a JSON file:

```json
{
  "name": "Cosmic Ape #42",
  "description": "A unique cosmic ape from the Cosmic Ape collection.",
  "image": "ipfs://QmXyz.../42.png",
  "attributes": [
    { "trait_type": "Background", "value": "Nebula" },
    { "trait_type": "Fur", "value": "Golden" },
    { "trait_type": "Eyes", "value": "Laser" },
    { "trait_type": "Power Level", "display_type": "number", "value": 95 }
  ]
}
```

### Storage Options for Metadata

| Storage | Pros | Cons |
|---------|------|------|
| IPFS | Decentralized, content-addressed | Needs pinning service |
| Arweave | Permanent storage | Costs upfront payment |
| On-chain | Fully decentralized | Expensive for large data |
| Centralized server | Cheap, fast | Single point of failure |

---

## Minting NFTs

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CosmicApes is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public mintPrice = 0.05 ether;

    constructor() ERC721("CosmicApes", "CAPE") Ownable(msg.sender) {}

    function mint(string memory uri) public payable {
        require(_nextTokenId < MAX_SUPPLY, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage)
        returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage)
        returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
```

---

## Ownership and Transfers

```javascript
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_KEY");
const nftAddress = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"; // BAYC
const abi = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

const contract = new ethers.Contract(nftAddress, abi, provider);

async function checkNFT() {
  const owner = await contract.ownerOf(42);
  console.log("Owner of token #42:", owner);

  const balance = await contract.balanceOf(owner);
  console.log("Owner holds", balance.toString(), "NFTs");

  const uri = await contract.tokenURI(42);
  console.log("Metadata URI:", uri);
}

checkNFT();
```

---

## Safe Transfer Mechanism

`safeTransferFrom` checks if the recipient can handle NFTs:

```solidity
// Receiving contracts must implement this interface
interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}
```

This prevents tokens from being permanently locked in contracts that don't support them.

---

## NFT Marketplaces

| Marketplace | Chain | Features |
|-------------|-------|----------|
| OpenSea | Multi-chain | Largest, auction support |
| Blur | Ethereum | Trader-focused, aggregator |
| Magic Eden | Solana, Multi | Low fees, cross-chain |
| LooksRare | Ethereum | Community rewards |

Marketplaces use the approval mechanism — you approve the marketplace contract, and it executes `transferFrom` when a sale occurs.

---

## Use Cases Beyond Art

| Use Case | Description |
|----------|-------------|
| Gaming | In-game items, characters, land |
| Real estate | Property deed tokenization |
| Event tickets | Verifiable, tradeable tickets |
| Domain names | ENS (.eth domains) |
| Credentials | Diplomas, certifications |
| Music | Royalty rights, limited editions |
| Identity | Soulbound tokens (non-transferable) |

---

## Key Takeaways

- ERC-721 defines a standard for unique, non-fungible tokens on Ethereum
- Each token has a unique `tokenId` and a single owner
- `tokenURI` links to off-chain JSON metadata containing name, image, and attributes
- Use `safeTransferFrom` to prevent tokens from being locked in incompatible contracts
- IPFS or Arweave are preferred for decentralized metadata storage
- OpenZeppelin provides production-ready ERC-721 implementations
- NFTs have applications far beyond digital art — gaming, identity, real estate, and more

---

## Next

[ERC-1155 Multi-Token Standard](/courses/blockchain/34-blockchain-erc1155)
