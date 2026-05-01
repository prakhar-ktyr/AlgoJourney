---
title: Bitcoin Script
---

## What is Bitcoin Script?

Bitcoin Script is a simple, stack-based programming language used to define the conditions under which a UTXO can be spent. It is intentionally **not Turing-complete** — it has no loops — to prevent denial-of-service attacks and ensure predictable execution.

---

## Stack-Based Execution

Bitcoin Script operates on a **Last-In, First-Out (LIFO)** stack:

```text
Stack operations:
  PUSH data  → places data on top of stack
  POP        → removes top element
  Operations → consume inputs from stack, push results

Example: 2 3 OP_ADD 5 OP_EQUAL

Step 1: Push 2         Stack: [2]
Step 2: Push 3         Stack: [2, 3]
Step 3: OP_ADD         Stack: [5]        (pops 2 and 3, pushes 2+3)
Step 4: Push 5         Stack: [5, 5]
Step 5: OP_EQUAL       Stack: [TRUE]     (pops both, pushes comparison)
```

---

## Common Opcodes

| Opcode | Function |
|--------|----------|
| OP_DUP | Duplicate the top stack item |
| OP_HASH160 | SHA-256 then RIPEMD-160 hash of top item |
| OP_EQUALVERIFY | Check equality and abort if false |
| OP_CHECKSIG | Verify a signature against a public key |
| OP_CHECKMULTISIG | Verify M-of-N multi-signature |
| OP_RETURN | Mark output as unspendable (data storage) |
| OP_IF / OP_ELSE / OP_ENDIF | Conditional execution |
| OP_CHECKLOCKTIMEVERIFY | Absolute time lock |
| OP_CHECKSEQUENCEVERIFY | Relative time lock |
| OP_ADD | Add top two items |
| OP_EQUAL | Check if top two items are equal |

---

## P2PKH Script Walkthrough

**Pay-to-Public-Key-Hash** is the most common traditional script type. It requires the spender to provide a valid signature and the public key that hashes to the address.

### Locking Script (scriptPubKey)

```text
OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
```

### Unlocking Script (scriptSig)

```text
<signature> <publicKey>
```

### Combined Execution

```text
Script: <sig> <pubKey> OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG

Step 1: Push <sig>             Stack: [sig]
Step 2: Push <pubKey>          Stack: [sig, pubKey]
Step 3: OP_DUP                 Stack: [sig, pubKey, pubKey]
Step 4: OP_HASH160             Stack: [sig, pubKey, hash(pubKey)]
Step 5: Push <pubKeyHash>      Stack: [sig, pubKey, hash(pubKey), pubKeyHash]
Step 6: OP_EQUALVERIFY         Stack: [sig, pubKey]
         (verifies hash(pubKey) == pubKeyHash; aborts if false)
Step 7: OP_CHECKSIG            Stack: [TRUE]
         (verifies sig is valid for pubKey and transaction data)
```

If the final stack value is `TRUE`, the transaction is valid.

---

## Multi-Signature (OP_CHECKMULTISIG)

Multi-sig requires **M** signatures from **N** possible public keys:

### 2-of-3 Multi-Sig Locking Script

```text
OP_2 <pubKey1> <pubKey2> <pubKey3> OP_3 OP_CHECKMULTISIG
```

### Unlocking Script

```text
OP_0 <sig1> <sig2>
```

> Note: `OP_0` is a dummy value due to a historical off-by-one bug in `OP_CHECKMULTISIG`.

### Use Cases for Multi-Sig

| Configuration | Use Case |
|--------------|----------|
| 2-of-3 | Personal security (phone + laptop + hardware wallet) |
| 3-of-5 | Corporate treasury |
| 2-of-2 | Joint accounts, escrow |
| 1-of-2 | Shared access (either party can spend) |

---

## Time Locks

Time locks prevent UTXOs from being spent before a certain condition is met:

### CLTV (CheckLockTimeVerify) — Absolute Time Lock

```text
<expiry_time> OP_CHECKLOCKTIMEVERIFY OP_DROP
OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
```

This UTXO cannot be spent until block height or Unix timestamp specified by `<expiry_time>`.

### CSV (CheckSequenceVerify) — Relative Time Lock

```text
<relative_delay> OP_CHECKSEQUENCEVERIFY OP_DROP
OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
```

This UTXO cannot be spent until `<relative_delay>` blocks have passed since the UTXO was confirmed.

| Lock Type | Reference Point | Example |
|-----------|----------------|---------|
| CLTV | Absolute block height or timestamp | "Spendable after block 800,000" |
| CSV | Relative to UTXO confirmation | "Spendable 144 blocks after creation" |

---

## OP_RETURN (Data Storage)

`OP_RETURN` creates provably unspendable outputs that can carry up to 80 bytes of arbitrary data:

```text
OP_RETURN <data_up_to_80_bytes>
```

Used for: timestamping, proof of existence, token protocols (Omni Layer), anchoring data.

---

## Turing-Incompleteness

Bitcoin Script deliberately lacks:

| Missing Feature | Reason |
|----------------|--------|
| Loops (while, for) | Prevents infinite execution / DoS |
| Recursion | Ensures script halts in finite time |
| Complex state | Keeps validation simple and fast |
| Floating point | Avoids rounding inconsistencies |

This means every script is guaranteed to terminate, and execution cost is bounded.

---

## Taproot Upgrade (2021)

Taproot (BIP340/341/342) modernized Bitcoin scripting:

| Feature | Benefit |
|---------|---------|
| Schnorr signatures | Smaller, more efficient, aggregatable |
| MAST (Merkelized Abstract Syntax Trees) | Reveal only the executed script branch |
| Key-path spending | Simple transactions look identical on-chain |
| Improved privacy | Multi-sig looks like single-sig on-chain |
| Script-path spending | Complex scripts available when needed |

```text
Taproot address: bc1p...

Key-path spend:  Just a signature (most common, cheapest)
Script-path:     Reveal Merkle proof + script branch + witness
```

---

## Key Takeaways

- Bitcoin Script is a stack-based, intentionally non-Turing-complete language
- P2PKH is the classic script: verify the signer owns the private key matching the address
- Multi-sig (M-of-N) enables shared custody and enhanced security
- Time locks (CLTV/CSV) enable conditional spending based on time or block height
- Turing-incompleteness is a feature, not a bug — it guarantees predictable execution
- Taproot (2021) brought Schnorr signatures and MAST for better privacy and efficiency

---

## Next

[Bitcoin Network & Nodes →](16-blockchain-bitcoin-network)
