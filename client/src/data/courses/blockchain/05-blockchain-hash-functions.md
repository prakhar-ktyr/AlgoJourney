---
title: Cryptographic Hash Functions
---

## What is Hashing?

A **hash function** takes an input of any size and produces a fixed-size output (called a hash, digest, or fingerprint). Think of it as a one-way machine: you put data in, get a unique fingerprint out, but you can never reverse it to get the original data back.

```
Input (any size)          Hash Function          Output (fixed size)
─────────────────      ─────────────────      ─────────────────────
"Hello"            →       SHA-256         →   2cf24dba5fb0a30...
"Hello!"           →       SHA-256         →   334d016f755cd6d...
War and Peace      →       SHA-256         →   a1b2c3d4e5f6a7b...
(entire novel)

All outputs are exactly 256 bits (64 hex characters)
```

---

## SHA-256: The Hash Function Behind Bitcoin

**SHA-256** (Secure Hash Algorithm, 256-bit) is the most widely used hash function in blockchain. It produces a 64-character hexadecimal output.

**Examples:**

| Input | SHA-256 Output |
|-------|---------------|
| `"blockchain"` | `625da44e4eaf58d61cf048d168aa6f5e492dea166d8bb54ec06c30de07db57e1` |
| `"Blockchain"` | `b7188fdc4e5670e2f63c89a39dfc8dbb2c21c1a3c3c305fa8ae5b1a68a1e3e5a` |
| `"blockchain "` (space) | `completely different 64-character hash...` |
| `""` (empty) | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

Notice how changing just one character (capitalizing "B" or adding a space) produces a completely different hash.

---

## Properties of Cryptographic Hash Functions

A hash function must satisfy these properties to be useful in blockchain:

### 1. Deterministic
The same input **always** produces the same output. No randomness involved.

```
SHA-256("hello") → 2cf24dba... (always, every time, on every computer)
```

### 2. Fast to Compute
Computing the hash of any input should be quick — this allows nodes to verify blocks rapidly.

### 3. Avalanche Effect
A tiny change in input causes a completely different output. There's no way to predict how the output changes.

```
SHA-256("hello")  → 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
SHA-256("hellp")  → 8f14e45fceea167a5a36dedd4bea2543eb2c5b1da45a16b3f0c7e4c1d5a8e3b2
                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                     Completely different! Only one letter changed.
```

### 4. Pre-image Resistance (One-way)
Given a hash output, it's computationally infeasible to find the original input.

```
Given: 2cf24dba5fb0a30e26e83b2ac5b9e29e...
Find:  ??? (practically impossible without brute force)
```

### 5. Collision Resistance
It should be nearly impossible to find two different inputs that produce the same hash.

```
Find X ≠ Y where SHA-256(X) = SHA-256(Y)
→ Requires ~2^128 attempts (more than atoms in the universe)
```

---

## Summary of Properties

| Property | Meaning | Why It Matters |
|----------|---------|---------------|
| Deterministic | Same input → same output | Nodes can independently verify |
| Fast | Quick computation | Efficient block validation |
| Avalanche effect | Small change → big difference | Can't predict or manipulate |
| Pre-image resistant | Can't reverse the hash | Protects original data |
| Second pre-image resistant | Can't find alternate input for same hash | Prevents forgery |
| Collision resistant | Can't find any two matching hashes | Ensures uniqueness |

---

## How Mining Uses Hashing

In Proof of Work mining, miners repeatedly hash block data with different nonces until they find a hash below the target difficulty:

```
Block Data + Nonce → SHA-256 → Hash

Attempt 1: BlockData + 0      → a8f3e2b1... (too high, try again)
Attempt 2: BlockData + 1      → 9c4d5e6f... (too high, try again)
Attempt 3: BlockData + 2      → f1a2b3c4... (too high, try again)
...
Attempt N: BlockData + 84923  → 00000000000003a1f... (BELOW TARGET! ✓)

The leading zeros indicate the hash meets the difficulty requirement.
```

This is essentially a brute-force lottery — the only way to find a valid hash is to keep trying.

---

## Merkle Trees: Hashing for Efficiency

A **Merkle tree** organizes transaction hashes into a binary tree structure, allowing efficient verification:

```
                    Merkle Root
                   /            \
              Hash(AB)          Hash(CD)
             /       \         /       \
         Hash(A)   Hash(B)  Hash(C)  Hash(D)
           |         |        |        |
          Tx A      Tx B     Tx C     Tx D
```

**How it works:**
1. Each transaction is hashed individually
2. Pairs of hashes are combined and hashed again
3. This continues until one root hash remains

**Benefits:**

| Benefit | Explanation |
|---------|-------------|
| Efficient verification | Verify one transaction with only log₂(n) hashes |
| Tamper detection | Changing any transaction changes the root |
| Light client support | SPV nodes only need the root + proof path |
| Data integrity | One hash summarizes thousands of transactions |

---

## Real-World Hash Function Comparison

| Algorithm | Output Size | Used In | Status |
|-----------|-------------|---------|--------|
| MD5 | 128 bits | Legacy systems | Broken (collisions found) |
| SHA-1 | 160 bits | Git (legacy) | Deprecated (collisions found) |
| SHA-256 | 256 bits | Bitcoin, most blockchains | Secure |
| SHA-3 | Variable | Some newer systems | Secure |
| Keccak-256 | 256 bits | Ethereum | Secure |
| BLAKE2 | Variable | Zcash, some alt-coins | Secure |

---

## Hands-On: Verify Hash Properties

You can verify these properties yourself using any SHA-256 tool or command line:

```bash
# On Linux/Mac terminal:
echo -n "hello" | sha256sum
# 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824

echo -n "Hello" | sha256sum
# 185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969

# Notice: completely different output for "hello" vs "Hello"
```

---

## Key Takeaways

- A hash function converts any input into a fixed-size output that cannot be reversed
- SHA-256 is the backbone of Bitcoin — producing 256-bit (64 hex character) outputs
- Critical properties: deterministic, fast, avalanche effect, pre-image resistant, collision resistant
- Mining is essentially searching for a hash that meets difficulty requirements
- Merkle trees use hierarchical hashing for efficient transaction verification
- Even a single bit change in input produces a completely different hash output
- Broken hash functions (MD5, SHA-1) are never used in modern blockchains

---

[Next: Public Key Cryptography in Blockchain](06-blockchain-public-key-crypto)
