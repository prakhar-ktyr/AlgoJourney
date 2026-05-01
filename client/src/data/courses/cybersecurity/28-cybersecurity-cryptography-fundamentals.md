---
title: Cryptography Fundamentals
---

# Cryptography Fundamentals

Cryptography is the science of securing information by transforming it into an unreadable format. It ensures confidentiality, integrity, authentication, and non-repudiation of data.

---

## A Brief History

| Era | Method | Example |
|-----|--------|---------|
| **Ancient (500 BC)** | Substitution ciphers | Caesar cipher, Atbash |
| **Medieval** | Polyalphabetic ciphers | Vigenère cipher |
| **World War II** | Mechanical encryption | Enigma machine |
| **1970s** | Standardized algorithms | DES (Data Encryption Standard) |
| **1976** | Public key cryptography | Diffie-Hellman key exchange |
| **1977** | Asymmetric encryption | RSA algorithm |
| **2001** | Modern standard | AES (Advanced Encryption Standard) |
| **Present** | Post-quantum research | Lattice-based cryptography |

---

## Core Terminology

| Term | Definition |
|------|-----------|
| **Plaintext** | Original readable message |
| **Ciphertext** | Encrypted unreadable message |
| **Key** | Secret value used to encrypt/decrypt |
| **Cipher** | Algorithm that performs encryption/decryption |
| **Encryption** | Converting plaintext → ciphertext |
| **Decryption** | Converting ciphertext → plaintext |
| **Key space** | Total number of possible keys |
| **Nonce/IV** | One-time value to ensure unique ciphertexts |

### Basic Flow

```
Plaintext + Key → [Encryption Algorithm] → Ciphertext
Ciphertext + Key → [Decryption Algorithm] → Plaintext
```

---

## Types of Cryptography

### 1. Symmetric Encryption

Same key for encryption and decryption:

```
Alice                              Bob
  |                                 |
  |--- Ciphertext (encrypted) ---->|
  |    Key: "shared-secret"        |
  |    Same key used both sides    |
```

```javascript
import crypto from "crypto";

const key = crypto.randomBytes(32);  // 256-bit shared key
const iv = crypto.randomBytes(16);

// Encrypt
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
let encrypted = cipher.update("Hello World", "utf8", "hex");
encrypted += cipher.final("hex");

// Decrypt (same key)
const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
let decrypted = decipher.update(encrypted, "hex", "utf8");
decrypted += decipher.final("utf8");
// "Hello World"
```

| Pros | Cons |
|------|------|
| Very fast | Key distribution problem |
| Efficient for large data | Each pair needs a unique key |
| Simple implementation | No built-in authentication |

**Common algorithms:** AES, ChaCha20, 3DES

---

### 2. Asymmetric Encryption

Two mathematically related keys — public (shared) and private (secret):

```
Alice (has Bob's public key)         Bob (has private key)
  |                                    |
  |--- Encrypt with Bob's public ---->|
  |    Only Bob's private can decrypt  |
  |                                    |
  |<-- Encrypt with Alice's public ---|
  |    Only Alice's private decrypts   |
```

```javascript
import crypto from "crypto";

// Generate key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048
});

// Encrypt with public key
const encrypted = crypto.publicEncrypt(publicKey, Buffer.from("Secret message"));

// Decrypt with private key
const decrypted = crypto.privateDecrypt(privateKey, encrypted);
// "Secret message"
```

| Pros | Cons |
|------|------|
| Solves key distribution | Much slower than symmetric |
| Enables digital signatures | Limited message size |
| No pre-shared secret needed | Computationally expensive |

**Common algorithms:** RSA, ECC (Elliptic Curve), Ed25519

---

### 3. Hashing

One-way transformation — cannot be reversed:

```
Input → [Hash Function] → Fixed-size digest (fingerprint)

"Hello" → SHA-256 → "2cf24dba5fb0a30e26e83b2ac5b9e29e..."
"Hello!" → SHA-256 → "334d016f755cd6dc58c53a86e183882f..." (completely different)
```

```javascript
import crypto from "crypto";

// Create a hash
const hash = crypto.createHash("sha256").update("password123").digest("hex");
// "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"

// Same input always produces same output
// Cannot reverse hash → original
```

| Property | Description |
|----------|-------------|
| **Deterministic** | Same input → same output |
| **One-way** | Cannot reverse the hash |
| **Avalanche effect** | Tiny change → completely different hash |
| **Fixed size** | Output is always the same length |
| **Collision resistant** | Hard to find two inputs with same hash |

**Common algorithms:** SHA-256, SHA-3, BLAKE3, bcrypt (for passwords)

---

## Use Cases

| Use Case | Type | Example |
|----------|------|---------|
| **Encrypting files** | Symmetric | AES-256-GCM for disk encryption |
| **HTTPS/TLS** | Both | Asymmetric for key exchange, symmetric for data |
| **Password storage** | Hashing | bcrypt hash of user passwords |
| **Digital signatures** | Asymmetric | Signing software updates |
| **Data integrity** | Hashing | Checksum of downloaded files |
| **Email encryption** | Asymmetric | PGP/GPG encrypted emails |
| **VPNs** | Symmetric | AES tunnel for VPN traffic |
| **Blockchain** | Hashing | SHA-256 for block hashes |

---

## Comparison Summary

| Feature | Symmetric | Asymmetric | Hashing |
|---------|-----------|------------|---------|
| **Keys** | 1 shared key | 2 keys (public/private) | No key |
| **Speed** | Very fast | Slow | Fast |
| **Reversible** | Yes (with key) | Yes (with key) | No |
| **Use** | Bulk data encryption | Key exchange, signatures | Integrity, passwords |
| **Key length** | 128-256 bits | 2048-4096 bits | N/A |
| **Example** | AES-256 | RSA-2048 | SHA-256 |

---

## Kerckhoffs's Principle

> "A cryptographic system should be secure even if everything about the system, except the key, is public knowledge."

This means:
- Security depends on the **key**, not the algorithm being secret
- Use well-studied public algorithms (AES, RSA) — not custom "secret" ones
- If your security breaks when the algorithm is revealed, it's flawed

---

## Common Mistakes

| Mistake | Why It's Bad | Correct Approach |
|---------|-------------|-----------------|
| Creating your own cipher | Likely contains fatal flaws | Use AES, RSA, or other standards |
| Using MD5 or SHA-1 | Collision attacks discovered | Use SHA-256 or SHA-3 |
| Hardcoding keys | Anyone with source code can decrypt | Use key management systems |
| Reusing nonces/IVs | Breaks encryption security | Generate fresh random values |
| ECB mode | Reveals patterns in data | Use GCM or CBC mode |
| Short keys | Vulnerable to brute force | 256-bit symmetric, 2048+ RSA |

---

## Key Takeaways

- Cryptography provides **confidentiality**, **integrity**, and **authentication**
- **Symmetric** encryption (AES) is fast — uses one shared key
- **Asymmetric** encryption (RSA) solves key distribution — uses key pairs
- **Hashing** (SHA-256) is one-way — used for integrity and passwords
- Modern systems combine all three (e.g., TLS uses all types)
- Never invent your own cryptography — use proven standards
- Security comes from the **key strength**, not algorithm secrecy
- Cryptography is evolving — quantum computing will change the landscape

---

Next, we'll learn about **Symmetric Encryption** in detail →
