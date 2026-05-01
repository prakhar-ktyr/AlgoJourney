---
title: What is Blockchain
---

# What is Blockchain

A blockchain is a **distributed, immutable digital ledger** that records transactions across a network of computers.

---

## Simple Analogy

Imagine a shared Google Spreadsheet that:
- Everyone can **read** but no one can **edit** past entries
- New rows can only be added after **everyone agrees** the data is valid
- Every participant has a **complete copy**
- If someone tries to change an old row, everyone else's copy proves it's wrong

That's essentially a blockchain.

---

## Key Concepts

### Block
A block contains:
- A list of transactions
- A timestamp
- A hash (unique fingerprint)
- The previous block's hash (creates the "chain")

### Chain
Blocks are linked together. Each block references the previous one:

```
[Block 0] → [Block 1] → [Block 2] → [Block 3]
 Genesis      hash:ab     hash:cd     hash:ef
              prev:00     prev:ab     prev:cd
```

### Distributed Ledger
Every participant (node) has a full copy of the entire blockchain. No single point of failure.

---

## Key Properties

| Property | Description |
|----------|-------------|
| **Immutable** | Once data is recorded, it cannot be altered |
| **Transparent** | All transactions are visible to participants |
| **Decentralized** | No single authority controls the network |
| **Trustless** | No need to trust any individual party |
| **Secure** | Cryptography ensures data integrity |
| **Permissionless** | Anyone can participate (public blockchains) |

---

## Types of Blockchains

| Type | Access | Examples | Use Case |
|------|--------|---------|----------|
| **Public** | Anyone can join | Bitcoin, Ethereum | Cryptocurrency, DeFi |
| **Private** | Invitation only | Hyperledger Fabric | Enterprise supply chain |
| **Consortium** | Group-controlled | R3 Corda | Banking, trade finance |
| **Hybrid** | Mix of public/private | Dragonchain | Selective transparency |

---

## Blockchain vs Traditional Database

| Feature | Blockchain | Traditional DB |
|---------|-----------|---------------|
| Control | Decentralized | Centralized |
| Immutability | Yes (by design) | Admin can modify |
| Trust | Trustless (math-based) | Trust the operator |
| Performance | Slower | Faster |
| Transparency | Full (public chain) | Limited |
| Cost | Higher per transaction | Lower per transaction |

---

## Key Takeaways

- A blockchain is a chain of blocks containing transaction data
- It's **distributed** (many copies), **immutable** (can't change), and **transparent**
- No central authority — trust comes from cryptography and consensus
- Different types serve different needs (public, private, consortium)
- Slower than databases but provides trustless, tamper-proof records

---

Next, we'll learn **How Blockchain Works** step by step →
