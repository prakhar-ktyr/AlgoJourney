---
title: IPFS & Decentralized Storage
---

Storing large files on-chain is prohibitively expensive. IPFS (InterPlanetary File System) and other decentralized storage solutions provide off-chain storage that is content-addressed, censorship-resistant, and permanent. They are the backbone of NFT metadata, dApp frontends, and decentralized data hosting.

---

## Content Addressing vs Location Addressing

Traditional web addresses point to a *location* (server). IPFS uses *content addressing* — the address is derived from the content itself.

```
Location addressing (traditional web):
  https://example.com/images/cat.png
  └── Points to a specific server
  └── Server could change the file
  └── Server goes down → file lost
  └── No way to verify content hasn't changed

Content addressing (IPFS):
  ipfs://QmT78zSuBmuS4z925WZfrN8Pch1RmGEP3S1NwwrBD7P1dc
  └── Address = hash of the content
  └── Same content always = same address
  └── Anyone can host it
  └── Content is cryptographically verified
  └── If content changes → address changes
```

| Feature | Location Addressing | Content Addressing |
|---------|--------------------|--------------------|
| Address determines | Where to find it | What the content is |
| Verification | Trust the server | Hash verification |
| Duplication | Same file, different URLs | Same file = same CID everywhere |
| Persistence | Depends on server uptime | Anyone can host (survives server death) |
| Censorship | Block the server | Must block all hosts globally |
| Mutability | Content can change at same URL | New content = new address |

---

## How IPFS Works

IPFS is a peer-to-peer network for storing and sharing files using content-addressed identifiers.

```
IPFS architecture:

1. Adding a file to IPFS:
   ┌──────────────────────────────────┐
   │ my-image.png (2MB)               │
   └──────────────────────────────────┘
              ↓ (chunking)
   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
   │Chunk1│ │Chunk2│ │Chunk3│ │Chunk4│
   └──────┘ └──────┘ └──────┘ └──────┘
              ↓ (hashing each chunk)
   ┌──────────────────────────────────┐
   │ Merkle DAG (linked hash tree)    │
   │       Root CID                   │
   │      /    |    \                 │
   │   CID1  CID2  CID3...           │
   └──────────────────────────────────┘

2. Retrieving a file:
   Request CID → DHT lookup → find peers hosting it
   → download chunks → verify hashes → assemble file
```

### Key IPFS Concepts

| Concept | Description |
|---------|-------------|
| CID | Content Identifier — hash-based address of content |
| DAG | Directed Acyclic Graph — data structure linking chunks |
| DHT | Distributed Hash Table — maps CIDs to peer locations |
| Pinning | Telling a node to keep specific content available |
| Gateway | HTTP endpoint to access IPFS content via browser |
| Node | Computer running IPFS software, hosting/serving content |

---

## Content Identifiers (CIDs)

A CID is a self-describing hash that uniquely identifies content on IPFS.

```
CID anatomy (CIDv1):

bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
│    │
│    └── Multihash (SHA-256 hash of content)
└── Multibase prefix (base32)

CIDv0 (legacy):
QmT78zSuBmuS4z925WZfrN8Pch1RmGEP3S1NwwrBD7P1dc
└── Always starts with "Qm" (base58, SHA-256, DAG-PB)

Key property: Same content → same CID → content verification is automatic
```

---

## Pinning

Content on IPFS is only available as long as at least one node stores it. Pinning ensures content persists.

| Pinning Option | Description | Cost |
|----------------|-------------|------|
| Local pinning | Pin on your own IPFS node | Hardware/bandwidth costs |
| Pinata | Pinning-as-a-service | Free tier + paid plans |
| Infura IPFS | Managed IPFS infrastructure | Free tier + paid |
| Web3.Storage | Free pinning (Filecoin-backed) | Free (Protocol Labs) |
| NFT.Storage | Free NFT-specific pinning | Free (designed for NFTs) |

```javascript
// Uploading to IPFS via Pinata
import pinataSDK from "@pinata/sdk";

const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET,
});

// Pin a JSON metadata file
const metadata = {
  name: "Cool NFT #1",
  description: "A very cool NFT",
  image: "ipfs://QmImageHash...",
  attributes: [
    { trait_type: "Background", value: "Blue" },
    { trait_type: "Rarity", value: "Legendary" },
  ],
};

const result = await pinata.pinJSONToIPFS(metadata);
console.log("CID:", result.IpfsHash);
// → "QmT78zSuBmuS4z925WZfrN8Pch1RmGEP3S1NwwrBD7P1dc"
// Access: https://gateway.pinata.cloud/ipfs/QmT78z...
```

---

## Filecoin: Incentive Layer for IPFS

IPFS alone has no built-in incentive to store other people's data. Filecoin adds economic incentives — storage providers are paid to store and serve data reliably.

```
Filecoin architecture:

Storage Providers (miners):
  └── Offer disk space to the network
  └── Prove they're storing data (Proof of Spacetime)
  └── Earn FIL tokens for storing data

Clients:
  └── Pay FIL to store data
  └── Create storage deals with providers
  └── Data is replicated across multiple providers

Proofs:
  ├── Proof of Replication: data is uniquely stored
  └── Proof of Spacetime: data stored over time
```

| Feature | IPFS | Filecoin |
|---------|------|----------|
| Data persistence | Best-effort (pinning) | Guaranteed (paid deals) |
| Incentive | None (altruistic) | FIL token rewards |
| Redundancy | Manual (multiple pins) | Built-in replication |
| Retrieval speed | Fast (p2p) | Slower (unsealing may be needed) |
| Cost | Free (but no guarantee) | Paid per GB/month |

---

## Arweave: Permanent Storage

Arweave offers permanent, one-time-payment storage. Pay once, data stored forever (200+ years target).

| Feature | IPFS + Filecoin | Arweave |
|---------|----------------|---------|
| Storage model | Recurring payments | One-time payment (permanent) |
| Persistence | Duration of deal | Forever (endowment model) |
| Cost model | Per GB per month | Per GB one-time (~$5/GB) |
| Data structure | Merkle DAG | Blockweave (block = data) |
| Token | FIL | AR |
| Best for | Large files, temporary storage | Permanent records, archival |

```
Arweave endowment model:

User pays one-time fee (e.g., $5 for 1 GB)
         ↓
Fee goes into endowment pool
         ↓
Endowment earns yield over time
         ↓
Yield pays miners to store data perpetually
         ↓
Storage costs decrease over time (Moore's law)
→ Endowment grows relative to storage cost
→ Data persists 200+ years (mathematical model)
```

---

## NFT Metadata Storage

NFTs need to store metadata (name, image, attributes) somewhere. On-chain storage is expensive, so most use IPFS or Arweave.

| Storage Method | Cost | Persistence | Mutability | Example |
|---------------|------|-------------|------------|---------|
| On-chain | Very high ($$$) | Permanent | Immutable | Art Blocks (generative SVG) |
| IPFS (pinned) | Low | While pinned | Immutable (same CID) | Most PFP NFTs |
| Arweave | One-time fee | Permanent | Immutable | Solana NFTs (Metaplex) |
| Centralized server | Free/cheap | Until server dies | Mutable (rug risk!) | Bad NFT projects |

```solidity
// NFT contract pointing to IPFS metadata
contract MyNFT is ERC721 {
    // Base URI points to IPFS directory
    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmBaseDirectoryCID/";
    }

    // tokenURI(1) → "ipfs://QmBaseDirectoryCID/1"
    // Gateway: https://ipfs.io/ipfs/QmBaseDirectoryCID/1
}
```

```json
// Metadata file at ipfs://QmBaseDirectoryCID/1
{
  "name": "Cool NFT #1",
  "description": "Part of the Cool collection",
  "image": "ipfs://QmImageCID",
  "attributes": [
    { "trait_type": "Background", "value": "Sunset" },
    { "trait_type": "Eyes", "value": "Laser" }
  ]
}
```

---

## Comparison of Decentralized Storage Solutions

| Solution | Type | Persistence | Cost | Speed | Best For |
|----------|------|-------------|------|-------|----------|
| IPFS | P2P network | Best-effort | Free | Fast | Content distribution, dApp hosting |
| Filecoin | Incentivized IPFS | Deal duration | Paid (FIL) | Medium | Large-scale storage |
| Arweave | Permanent storage | Forever | One-time (AR) | Medium | Archival, NFT metadata |
| Ceramic | Mutable data streams | Network lifetime | Free | Fast | User profiles, social data |
| Storj | Distributed cloud | Subscription | Paid ($/GB) | Fast | Cloud storage replacement |

---

## Key Takeaways

- Content addressing (IPFS) identifies files by their hash, not their location — enabling verification and deduplication
- IPFS is a peer-to-peer network; content persists only while at least one node pins it
- Filecoin adds economic incentives to IPFS with paid storage deals and proof-of-storage
- Arweave offers permanent storage via a one-time payment endowment model
- NFT metadata should be stored on IPFS or Arweave — never on centralized servers alone
- CIDs are immutable: same content always produces the same identifier
- Pinning services (Pinata, Web3.Storage) make IPFS persistence practical without running your own node
- The decentralized storage ecosystem is maturing with solutions for every use case and budget

---

[Next: Zero-Knowledge Proofs](47-blockchain-zk-proofs)
