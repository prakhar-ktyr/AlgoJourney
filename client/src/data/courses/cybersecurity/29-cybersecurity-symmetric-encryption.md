---
title: Symmetric Encryption
---

# Symmetric Encryption

Symmetric encryption uses a single shared key for both encryption and decryption. It's the workhorse of modern cryptography — used for encrypting files, database fields, network traffic, and disk drives.

---

## How Symmetric Encryption Works

```
Encryption:  Plaintext + Key → Ciphertext
Decryption:  Ciphertext + Key → Plaintext

Both operations use the SAME key.
```

The security of the system depends entirely on keeping the key secret.

---

## Major Symmetric Algorithms

### DES (Data Encryption Standard)

- Published in 1977 by NIST
- 56-bit key length
- **Status: Broken** — can be cracked in hours

```
Key size: 56 bits (2^56 ≈ 72 quadrillion keys)
Block size: 64 bits
Status: INSECURE — do not use
```

### 3DES (Triple DES)

Applies DES three times with different keys:

```
Ciphertext = DES_encrypt(K3, DES_decrypt(K2, DES_encrypt(K1, Plaintext)))
```

| Variant | Keys | Effective Strength |
|---------|------|-------------------|
| Keying Option 1 | 3 independent keys | 112 bits |
| Keying Option 2 | K1=K3, K2 different | 80 bits |
| Keying Option 3 | All same (K1=K2=K3) | 56 bits (same as DES) |

**Status:** Deprecated since 2023 — use AES instead.

### AES (Advanced Encryption Standard)

The current gold standard, selected by NIST in 2001:

| Feature | Value |
|---------|-------|
| **Block size** | 128 bits |
| **Key sizes** | 128, 192, or 256 bits |
| **Rounds** | 10, 12, or 14 (based on key size) |
| **Status** | Secure — no practical attacks known |
| **Performance** | Hardware acceleration (AES-NI) on modern CPUs |

```javascript
import crypto from "crypto";

// AES-256-GCM encryption (recommended)
function encrypt(plaintext, key) {
  const iv = crypto.randomBytes(12);  // 96-bit IV for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return { iv: iv.toString("hex"), encrypted, authTag: authTag.toString("hex") };
}

function decrypt(encData, key) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(encData.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(encData.authTag, "hex"));

  let decrypted = decipher.update(encData.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Usage
const key = crypto.randomBytes(32);  // 256-bit key
const result = encrypt("Sensitive data", key);
const original = decrypt(result, key);  // "Sensitive data"
```

---

## Block Ciphers vs Stream Ciphers

| Feature | Block Cipher | Stream Cipher |
|---------|-------------|---------------|
| **Processes** | Fixed-size blocks (e.g., 128 bits) | One bit/byte at a time |
| **Speed** | Slightly slower | Very fast |
| **Padding** | Required if data isn't block-aligned | Not needed |
| **Examples** | AES, DES, Blowfish | ChaCha20, RC4, Salsa20 |
| **Use cases** | File encryption, databases | Streaming, real-time comms |

### Block Cipher Padding

When plaintext isn't a multiple of the block size:

```
Block size: 16 bytes
Plaintext: "Hello" (5 bytes)
Padded:    "Hello\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b" (PKCS7)
           Added 11 bytes of value 0x0b (11)
```

### ChaCha20 (Stream Cipher)

Modern alternative to AES for software-only environments:

```javascript
import crypto from "crypto";

const key = crypto.randomBytes(32);
const nonce = crypto.randomBytes(12);

const cipher = crypto.createCipheriv("chacha20-poly1305", key, nonce);
let encrypted = cipher.update("Stream me!", "utf8", "hex");
encrypted += cipher.final("hex");
const authTag = cipher.getAuthTag();
```

| AES-GCM | ChaCha20-Poly1305 |
|---------|-------------------|
| Faster with hardware AES-NI | Faster in software (no special CPU) |
| Standard everywhere | Common in mobile/IoT |
| 128-bit block | 512-bit block (internal) |

---

## Modes of Operation

Modes determine how a block cipher handles data larger than one block.

### ECB (Electronic Codebook) — NEVER USE

Each block encrypted independently:

```
Block 1 + Key → Cipher Block 1
Block 2 + Key → Cipher Block 2
Block 3 + Key → Cipher Block 3

Problem: Identical plaintext blocks → identical ciphertext blocks
         Reveals patterns in data!
```

### CBC (Cipher Block Chaining)

Each block XORed with previous ciphertext block:

```
Plaintext Block 1 ⊕ IV    → Encrypt → Ciphertext 1
Plaintext Block 2 ⊕ CT1   → Encrypt → Ciphertext 2
Plaintext Block 3 ⊕ CT2   → Encrypt → Ciphertext 3
```

| Pros | Cons |
|------|------|
| Hides patterns | Cannot parallelize encryption |
| Well understood | Vulnerable to padding oracle attacks |
| Widely supported | No built-in integrity check |

### CTR (Counter Mode)

Turns a block cipher into a stream cipher:

```
Encrypt(Key, Nonce + Counter=0) → Keystream Block 0 ⊕ Plaintext 0 = CT 0
Encrypt(Key, Nonce + Counter=1) → Keystream Block 1 ⊕ Plaintext 1 = CT 1
Encrypt(Key, Nonce + Counter=2) → Keystream Block 2 ⊕ Plaintext 2 = CT 2
```

| Pros | Cons |
|------|------|
| Parallelizable | Nonce reuse is catastrophic |
| No padding needed | No integrity check |
| Random access to blocks | |

### GCM (Galois/Counter Mode) — RECOMMENDED

CTR mode + authentication (GMAC):

```
Encryption: CTR mode (fast, parallelizable)
Authentication: GHASH over ciphertext + additional data

Output: Ciphertext + Authentication Tag (16 bytes)
```

```javascript
// AES-256-GCM — the recommended choice
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

// Optional: authenticate additional data (e.g., headers)
cipher.setAAD(Buffer.from("additional-authenticated-data"));

const encrypted = cipher.update(plaintext) + cipher.final();
const authTag = cipher.getAuthTag();  // Integrity guarantee!
```

| Pros | Cons |
|------|------|
| Encryption + authentication | Nonce must never repeat |
| Parallelizable | Slightly more complex |
| Industry standard (TLS 1.3) | 96-bit nonce limits messages |

---

## Mode Comparison

| Mode | Confidentiality | Integrity | Parallelizable | Recommended |
|------|----------------|-----------|----------------|-------------|
| ECB | Weak | No | Yes | Never |
| CBC | Good | No | Decrypt only | Legacy |
| CTR | Good | No | Yes | With MAC |
| GCM | Good | Yes | Yes | Yes |
| CCM | Good | Yes | No | Yes (IoT) |

---

## The Key Exchange Problem

Symmetric encryption's biggest challenge: how do Alice and Bob agree on a shared key without an attacker intercepting it?

```
Alice ←——[insecure channel]——→ Bob
      How to share the key?
```

### Solutions:

| Method | How |
|--------|-----|
| **In person** | Physical key exchange (USB drive, paper) |
| **Diffie-Hellman** | Math-based key agreement over public channel |
| **RSA envelope** | Encrypt symmetric key with recipient's public key |
| **Key Derivation** | Derive key from shared password (PBKDF2, HKDF) |
| **Pre-shared** | Both parties configured with same key beforehand |

In practice, TLS/HTTPS uses **asymmetric encryption** to exchange a symmetric key, then uses the symmetric key for fast bulk encryption.

---

## Key Size and Security

| Key Size | Brute Force Attempts | Time (1 billion keys/sec) |
|----------|---------------------|--------------------------|
| 56-bit (DES) | 2^56 ≈ 7.2 × 10^16 | ~833 days |
| 128-bit (AES) | 2^128 ≈ 3.4 × 10^38 | ~10^22 years |
| 256-bit (AES) | 2^256 ≈ 1.2 × 10^77 | Heat death of universe |

**Recommendation:** Use AES-256 for long-term security (quantum-resistant to Grover's algorithm which halves effective key length).

---

## Key Takeaways

- Symmetric encryption uses **one shared key** for both encrypt and decrypt
- **AES-256-GCM** is the recommended algorithm and mode
- Never use **ECB** mode — it reveals patterns in encrypted data
- **GCM** provides both encryption and integrity (authenticated encryption)
- DES is broken, 3DES is deprecated — always use **AES**
- The **key exchange problem** is solved by combining with asymmetric crypto
- **ChaCha20-Poly1305** is the alternative when hardware AES isn't available
- Key size matters: 256-bit keys are secure against quantum attacks

---

Next, we'll learn about **Asymmetric Encryption** →
