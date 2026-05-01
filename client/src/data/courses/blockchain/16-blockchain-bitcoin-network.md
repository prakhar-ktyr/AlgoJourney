---
title: Bitcoin Network & Nodes
---

## Overview

The Bitcoin network is a decentralized peer-to-peer (P2P) system where thousands of nodes communicate to maintain consensus on the state of the blockchain. No single node is authoritative — every full node independently validates every transaction and block.

---

## Node Types

| Node Type | Description | Storage | Validates |
|-----------|-------------|---------|-----------|
| Full Node | Stores entire blockchain, enforces all rules | ~600 GB+ | Everything |
| Pruned Node | Full validation but discards old block data | ~10 GB | Everything |
| Light Node (SPV) | Only downloads block headers | ~50 MB | Headers + Merkle proofs |
| Mining Node | Full node + mining capability | ~600 GB+ | Everything + creates blocks |
| Archive Node | Full node + transaction index | ~800 GB+ | Everything + fast lookups |

---

## Full Nodes

A full node performs complete validation of the Bitcoin protocol:

```text
Full Node Responsibilities:
1. Download and validate every block since genesis
2. Verify every transaction against consensus rules
3. Maintain the current UTXO set
4. Relay valid transactions and blocks to peers
5. Reject invalid data (counterfeit blocks, double-spends)
```

### Why Run a Full Node?

| Reason | Explanation |
|--------|-------------|
| Sovereignty | Verify your own transactions without trusting anyone |
| Privacy | No need to query third-party servers about your addresses |
| Network health | More nodes = more decentralized and resilient |
| Vote with your node | Enforce the rules YOU agree with |

### Popular Full Node Software

| Software | Language | Notes |
|----------|----------|-------|
| Bitcoin Core | C++ | Reference implementation |
| btcd | Go | Alternative implementation |
| Libbitcoin | C++ | Developer library + node |
| Bitcoin Knots | C++ | Bitcoin Core fork with extra features |

---

## Light Nodes (SPV)

Simplified Payment Verification (SPV) nodes, described in the original whitepaper:

```text
SPV Verification:
1. Download all block headers (~80 bytes each)
2. For a specific transaction, request a Merkle proof
3. Verify the transaction is included in a block header
4. Check that sufficient blocks have been mined on top

Trust assumption: miners are honest (cannot verify rules independently)
```

| Aspect | Full Node | SPV Node |
|--------|-----------|----------|
| Storage | ~600 GB | ~50 MB |
| Bandwidth | High | Low |
| Validation | Complete | Header-only |
| Trust model | Trustless | Trusts miners |
| Suitable for | Desktop, server | Mobile, embedded |

---

## Network Propagation

### Peer Discovery

When a new node joins the network:

```text
1. DNS Seeds     → Hardcoded DNS names resolve to known nodes
2. Seed Nodes    → Fallback IP addresses compiled into software
3. addr Messages → Connected peers share known node addresses
4. Peer Exchange → Nodes continuously discover and share peers
```

### Connection Details

| Parameter | Value |
|-----------|-------|
| Default max connections | 125 (8 outbound + 117 inbound) |
| Default port | 8333 (mainnet), 18333 (testnet) |
| Protocol | TCP with custom binary protocol |
| Network magic bytes | 0xF9BEB4D9 (mainnet) |

---

## Block Propagation

When a miner finds a valid block:

```text
Time 0s:     Miner finds valid block
Time ~0.5s:  Block sent to immediate peers
Time ~2s:    Block reaches ~50% of network
Time ~5s:    Block reaches ~90% of network
Time ~10s:   Block reaches nearly all nodes
```

### Propagation Optimizations

| Technique | Description |
|-----------|-------------|
| Compact Blocks (BIP152) | Send block header + short tx IDs; receiver reconstructs from mempool |
| FIBRE | Fast Internet Bitcoin Relay Engine — optimized relay network |
| Headers-first sync | Download headers first, then request full blocks in parallel |

---

## The Mempool

Each node maintains its own mempool (memory pool) of unconfirmed transactions:

```text
Mempool Policies (defaults, configurable):
  Max size:            300 MB
  Min relay fee:       1 sat/vB
  Max ancestry:        25 transactions deep
  Max descendant size: 101 KB
  Expiry:              14 days (336 hours)
```

| Mempool Event | Description |
|---------------|-------------|
| Transaction arrives | Validated against rules, added if valid |
| Block mined | Confirmed transactions removed from mempool |
| Mempool full | Lowest-fee transactions evicted |
| Transaction expired | Removed after 14 days without confirmation |
| Double-spend detected | Conflicting transaction rejected |

---

## Bitcoin Improvement Proposals (BIPs)

BIPs are the formal process for proposing changes to Bitcoin:

### BIP Types

| Type | Purpose | Example |
|------|---------|---------|
| Standards Track | Protocol changes, network rules | BIP141 (SegWit) |
| Informational | Design issues, guidelines | BIP32 (HD Wallets) |
| Process | Procedures, decision-making | BIP1 (BIP Purpose/Guidelines) |

### Notable BIPs

| BIP | Title | Impact |
|-----|-------|--------|
| BIP16 | Pay to Script Hash (P2SH) | Enabled complex scripts with simple addresses |
| BIP32 | HD Wallets | Hierarchical key derivation |
| BIP39 | Mnemonic Seed Phrases | Human-readable wallet backups |
| BIP44 | Multi-Account HD | Standard derivation paths |
| BIP141 | Segregated Witness (SegWit) | Fixed malleability, increased capacity |
| BIP340 | Schnorr Signatures | Key aggregation, batch validation |
| BIP341 | Taproot | Privacy and script efficiency |

### BIP Lifecycle

```text
Draft → Proposed → Final (accepted into protocol)
                 → Withdrawn / Rejected / Replaced
```

---

## Network Statistics (approximate)

| Metric | Value |
|--------|-------|
| Full nodes (reachable) | ~15,000–20,000 |
| Total nodes (estimated) | ~50,000–100,000 |
| Countries with nodes | 100+ |
| Blockchain size | ~600 GB |
| Average block interval | ~10 minutes |
| Average block size | ~1.5 MB |

---

## Key Takeaways

- Full nodes are the backbone of Bitcoin — they independently validate every rule
- SPV (light) nodes trade security for convenience, suitable for mobile wallets
- Peer discovery uses DNS seeds, hardcoded addresses, and peer exchange
- Blocks propagate across the network in seconds thanks to compact block relay
- Each node maintains its own mempool with configurable policies
- BIPs are the formal governance process for protocol changes
- Running your own full node is the only way to be truly trustless

---

## Next

[Bitcoin Limitations & Scaling →](17-blockchain-bitcoin-limitations)
