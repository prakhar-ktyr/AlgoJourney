---
title: Public Key Cryptography in Blockchain
---

## What is Public Key Cryptography?

Public key cryptography (asymmetric cryptography) uses a pair of mathematically related keys:

- **Private key**: A secret number only you know — never share it
- **Public key**: Derived from the private key — safe to share with anyone

The magic: you can encrypt with one key and only decrypt with the other. In blockchain, this system proves **ownership** without revealing secrets.

```
┌─────────────────────────────────────────────┐
│  Private Key  ──(math)──→  Public Key       │
│  (SECRET)                  (SHAREABLE)       │
│                                              │
│  You sign with private key                   │
│  Others verify with public key               │
└─────────────────────────────────────────────┘
```

---

## Key Pairs in Blockchain

Every blockchain user has a key pair that acts as their identity:

| Component | Analogy | Purpose |
|-----------|---------|---------|
| Private key | Password / Signature stamp | Sign transactions, prove ownership |
| Public key | Username / Mailing address | Receive funds, verify signatures |
| Address | Shortened mailing address | Human-friendly identifier |

**Important:** The private key generates the public key, and the public key generates the address. This is a **one-way** process:

```
Private Key → Public Key → Address

Can derive:     ✓ forward only
Cannot derive:  ✗ address → public key → private key (impossible)
```

---

## ECDSA and secp256k1

Blockchain (Bitcoin and Ethereum) uses **Elliptic Curve Digital Signature Algorithm (ECDSA)** with a specific curve called **secp256k1**.

**Why elliptic curves?**
- Smaller keys with equivalent security to RSA
- A 256-bit EC key ≈ 3072-bit RSA key in security strength
- Faster signing and verification

**The secp256k1 curve:**

```
Equation: y² = x³ + 7 (over a finite field)

Key sizes:
  Private key: 256 bits (32 bytes) — a random number
  Public key:  512 bits (64 bytes) — a point (x, y) on the curve
  Compressed:  257 bits (33 bytes) — x coordinate + sign bit
```

| Property | Value |
|----------|-------|
| Curve | secp256k1 |
| Key size | 256 bits |
| Used by | Bitcoin, Ethereum, many others |
| Security level | ~128 bits (very secure) |
| Signature size | 64-72 bytes |

---

## Address Generation

The process from private key to blockchain address:

```
Step 1: Generate Private Key
   Random 256-bit number
   Example: e9873d79c6d87dc0fb6a577...8f3c (64 hex chars)

Step 2: Derive Public Key (ECDSA multiplication)
   Private Key × Generator Point = Public Key
   Example: 04a1af804ac108a8a5173...b2e (130 hex chars, uncompressed)

Step 3: Hash the Public Key
   Bitcoin:   RIPEMD160(SHA256(public_key)) → 20 bytes
   Ethereum:  Keccak256(public_key) → take last 20 bytes

Step 4: Encode as Address
   Bitcoin:   Base58Check encoding with version byte + checksum
   Ethereum:  "0x" + 40 hex characters (with EIP-55 checksum)
```

**Bitcoin address generation flow:**

```
Private Key (256 bits)
       │
       ▼ (ECDSA on secp256k1)
Public Key (512 bits)
       │
       ▼ SHA-256
Hash1 (256 bits)
       │
       ▼ RIPEMD-160
Hash2 (160 bits)
       │
       ▼ Add version byte (0x00 for mainnet)
       │
       ▼ Double SHA-256 → first 4 bytes = checksum
       │
       ▼ Base58Check encode
Bitcoin Address (e.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa)
```

**Ethereum address generation:**

```
Private Key (256 bits)
       │
       ▼ (ECDSA on secp256k1)
Public Key (512 bits, uncompressed, without 04 prefix)
       │
       ▼ Keccak-256
Hash (256 bits)
       │
       ▼ Take last 20 bytes (160 bits)
       │
       ▼ Add "0x" prefix
Ethereum Address (e.g., 0x742d35Cc6634C0532925a3b844Bc9e7595f...)
```

---

## Digital Signatures: Signing and Verifying

Digital signatures prove that a transaction was authorized by the holder of the private key — without revealing the key itself.

### Signing Process

```
Transaction Data + Private Key → ECDSA Sign → Signature (r, s, v)

Signer knows: private key + message
Produces:     signature that anyone can verify
```

### Verification Process

```
Transaction Data + Signature + Public Key → ECDSA Verify → Valid / Invalid

Verifier knows: message + signature + public key
Determines:     whether the private key holder signed this
```

### How It Works Step-by-Step

| Step | Action | Who |
|------|--------|-----|
| 1 | Alice wants to send 1 BTC to Bob | Alice |
| 2 | She creates a transaction message | Alice |
| 3 | She signs it with her private key | Alice |
| 4 | She broadcasts transaction + signature to network | Alice |
| 5 | Nodes verify signature against Alice's public key | Network |
| 6 | If valid, transaction is accepted into mempool | Network |

---

## How Blockchain Uses This for Ownership

In traditional finance, a bank verifies your identity. In blockchain, **cryptography** proves ownership:

```
Traditional:    You → Bank (checks ID) → Approves transfer
Blockchain:     You → Sign with private key → Network verifies → Done

No middleman needed. Math replaces trust.
```

**Ownership rules:**
- Whoever holds the private key controls the funds at that address
- A valid signature is the ONLY way to spend funds
- No one can forge a signature without the private key
- Lost private key = lost funds forever (no "forgot password" reset)

---

## Wallet Generation Flow

A wallet is simply a tool that manages your key pairs:

```
┌────────────────────────────────────────────────────┐
│                  WALLET CREATION                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  1. Generate entropy (randomness)                   │
│          │                                          │
│          ▼                                          │
│  2. Create seed phrase (12/24 words - BIP39)        │
│     "abandon ability able about above absent..."    │
│          │                                          │
│          ▼                                          │
│  3. Derive master private key (BIP32)               │
│          │                                          │
│          ▼                                          │
│  4. Derive child keys (HD wallet - BIP44)           │
│     m/44'/60'/0'/0/0 → Account 1                    │
│     m/44'/60'/0'/0/1 → Account 2                    │
│          │                                          │
│          ▼                                          │
│  5. Compute public keys and addresses               │
│                                                     │
└────────────────────────────────────────────────────┘
```

**Hierarchical Deterministic (HD) Wallets:**

| Feature | Description |
|---------|-------------|
| One seed | All keys derived from a single seed phrase |
| Infinite accounts | Can generate unlimited addresses |
| Backup | Only need to store 12/24 words |
| Deterministic | Same seed always produces same keys |
| Hierarchical | Organized in a tree structure |

---

## Security Considerations

| Threat | Protection |
|--------|-----------|
| Private key theft | Hardware wallets, encrypted storage |
| Brute-force attack | 2^256 possible keys (more than atoms in universe) |
| Quantum computing | Post-quantum cryptography research ongoing |
| Phishing | Never enter seed phrase on websites |
| Clipboard malware | Verify addresses before sending |

---

## Key Takeaways

- Public key cryptography uses key pairs: a secret private key and a shareable public key
- Blockchain uses ECDSA with the secp256k1 elliptic curve for key generation and signing
- Address generation: Private Key → Public Key → Hash → Address (one-way process)
- Digital signatures prove transaction authorization without revealing the private key
- Ownership in blockchain is purely cryptographic — whoever holds the private key owns the funds
- HD wallets derive all keys from a single seed phrase using standardized derivation paths
- Losing your private key means losing access forever — there is no recovery mechanism

---

[Next: Consensus Mechanisms Overview](07-blockchain-consensus-overview)
