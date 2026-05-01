---
title: How Blockchain Works
---

# How Blockchain Works

A step-by-step look at what happens when a transaction is added to the blockchain.

---

## Transaction Lifecycle

```
1. User initiates a transaction
2. Transaction is broadcast to the network
3. Nodes validate the transaction
4. Valid transactions are grouped into a block
5. Miners/validators compete to add the block
6. Winning block is broadcast to the network
7. Nodes verify and add the block to their chain
8. Transaction is confirmed
```

---

## Block Structure

Every block contains:

```
┌──────────────────────────────┐
│         BLOCK HEADER         │
│  ┌────────────────────────┐  │
│  │ Previous Block Hash    │  │
│  │ Timestamp              │  │
│  │ Nonce                  │  │
│  │ Merkle Root            │  │
│  │ Difficulty Target      │  │
│  └────────────────────────┘  │
│         BLOCK BODY           │
│  ┌────────────────────────┐  │
│  │ Transaction 1          │  │
│  │ Transaction 2          │  │
│  │ Transaction 3          │  │
│  │ ...                    │  │
│  └────────────────────────┘  │
│         BLOCK HASH           │
│  Hash of all the above       │
└──────────────────────────────┘
```

### Key fields:

| Field | Purpose |
|-------|---------|
| **Previous Hash** | Links to prior block (creates the chain) |
| **Timestamp** | When the block was created |
| **Nonce** | Number used once — adjusted during mining |
| **Merkle Root** | Single hash summarizing all transactions |
| **Difficulty** | How hard it is to mine this block |
| **Transactions** | The actual data (transfers, contract calls) |

---

## How Blocks Are Linked

Each block's hash includes the previous block's hash:

```
Block 0 (Genesis)          Block 1                    Block 2
Hash: 0000abc              Hash: 0000def              Hash: 0000ghi
Prev: 000000               Prev: 0000abc              Prev: 0000def
Data: "First block"        Data: "Alice→Bob: 5BTC"    Data: "Bob→Carol: 2BTC"
```

If someone changes Block 1's data → its hash changes → Block 2's "previous hash" no longer matches → chain is broken → tampering detected.

---

## Merkle Trees

Transactions are organized in a Merkle tree for efficient verification:

```
          Root Hash
         /         \
    Hash(AB)     Hash(CD)
    /    \       /    \
 Hash(A) Hash(B) Hash(C) Hash(D)
   |       |       |       |
  Tx A    Tx B    Tx C    Tx D
```

Benefits:
- Verify any single transaction without downloading the full block
- Efficiently detect if any transaction was tampered with
- Used by lightweight clients (SPV nodes)

---

## The Genesis Block

The first block in any blockchain:
- Has no previous hash (set to all zeros)
- Often contains a special message
- Bitcoin's genesis block: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"

---

## How Consensus Works (Preview)

Multiple nodes must agree on which block to add:

1. **Proposer** creates a candidate block
2. **Validators** check all transactions are valid
3. **Agreement** is reached through a consensus mechanism
4. **Block** is added to everyone's copy of the chain

(We'll cover consensus mechanisms in detail in upcoming lessons.)

---

## Why It's Tamper-Proof

To change a transaction in Block 100:
1. Recalculate Block 100's hash
2. Recalculate Block 101's hash (it references Block 100)
3. Recalculate Block 102's hash... and so on
4. Do this faster than the rest of the network adds new blocks
5. Convince >50% of the network your chain is valid

This is computationally infeasible on large networks.

---

## Key Takeaways

- Transactions go through validation → grouping → consensus → confirmation
- Blocks contain a header (hashes, nonce) and body (transactions)
- Each block references the previous block's hash — creating the chain
- **Merkle trees** efficiently summarize all transactions in a block
- Changing one block requires recalculating all subsequent blocks
- This makes blockchain practically **tamper-proof**

---

Next, we'll explore **Decentralization & Distributed Systems** →
