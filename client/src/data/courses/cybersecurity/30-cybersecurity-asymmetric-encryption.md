---
title: Asymmetric Encryption
---

# Asymmetric Encryption

Asymmetric encryption (public-key cryptography) uses a mathematically linked pair of keys: a public key anyone can see, and a private key only the owner holds. It solves the key distribution problem of symmetric encryption.

---

## How It Works

```
Key Generation → Public Key (share freely)
              → Private Key (keep SECRET)

Encryption:   Plaintext + Public Key  → Ciphertext
Decryption:   Ciphertext + Private Key → Plaintext

Only the private key can decrypt what the public key encrypted.
```

Think of it like a mailbox: anyone can drop mail in (public key), but only you have the key to open it (private key).

---

## Major Asymmetric Algorithms

### RSA (Rivest-Shamir-Adleman)

The most widely used asymmetric algorithm, based on the difficulty of factoring large prime numbers.

```javascript
import crypto from "crypto";

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,       // Key size in bits
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" }
});

// Encrypt with public key
const encrypted = crypto.publicEncrypt(
  { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
  Buffer.from("Secret message")
);

// Decrypt with private key
const decrypted = crypto.privateDecrypt(
  { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
  encrypted
);
console.log(decrypted.toString());  // "Secret message"
```

| Key Size | Security Level | Status |
|----------|---------------|--------|
| 1024-bit | 80-bit | Insecure — do not use |
| 2048-bit | 112-bit | Minimum recommended |
| 3072-bit | 128-bit | Good for medium term |
| 4096-bit | ~140-bit | Strong, but slower |

### ECC (Elliptic Curve Cryptography)

Based on the difficulty of the elliptic curve discrete logarithm problem. Provides equivalent security with much smaller keys.

```javascript
import crypto from "crypto";

// Generate ECC key pair (P-256 curve)
const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
  namedCurve: "P-256",
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" }
});
```

| RSA Key Size | Equivalent ECC Key | Ratio |
|-------------|-------------------|-------|
| 1024-bit | 160-bit | 6:1 |
| 2048-bit | 224-bit | 9:1 |
| 3072-bit | 256-bit | 12:1 |
| 4096-bit | 384-bit | 11:1 |
| 15360-bit | 521-bit | 30:1 |

**Popular curves:** P-256 (NIST), P-384, Curve25519, secp256k1 (Bitcoin)

### Diffie-Hellman Key Exchange

Allows two parties to establish a shared secret over an insecure channel — without transmitting the secret itself.

```
Alice                              Bob
  |                                 |
  | Generate: a (private), A=g^a   |
  |                                 | Generate: b (private), B=g^b
  |                                 |
  |-------- Send A (public) ------>|
  |<------- Send B (public) -------|
  |                                 |
  | Compute: s = B^a mod p         | Compute: s = A^b mod p
  |                                 |
  | Both arrive at same shared secret: s = g^(ab) mod p
```

```javascript
import crypto from "crypto";

// Alice generates her keys
const alice = crypto.createDiffieHellmanGroup("modp14");
alice.generateKeys();
const alicePublic = alice.getPublicKey();

// Bob generates his keys (same group)
const bob = crypto.createDiffieHellmanGroup("modp14");
bob.generateKeys();
const bobPublic = bob.getPublicKey();

// Both compute the shared secret
const aliceSecret = alice.computeSecret(bobPublic);
const bobSecret = bob.computeSecret(alicePublic);

// aliceSecret === bobSecret (same shared key!)
```

### ECDH (Elliptic Curve Diffie-Hellman)

Diffie-Hellman using elliptic curves — faster, smaller keys:

```javascript
import crypto from "crypto";

// Alice
const alice = crypto.createECDH("prime256v1");
alice.generateKeys();

// Bob
const bob = crypto.createECDH("prime256v1");
bob.generateKeys();

// Exchange public keys and compute shared secret
const aliceShared = alice.computeSecret(bob.getPublicKey());
const bobShared = bob.computeSecret(alice.getPublicKey());
// aliceShared === bobShared
```

---

## Digital Signatures

Asymmetric encryption in reverse: sign with private key, verify with public key.

```
Signing:      Hash(Message) + Private Key → Signature
Verification: Hash(Message) + Public Key + Signature → Valid/Invalid
```

```javascript
import crypto from "crypto";

// Generate keys
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048
});

// Sign a message
const message = "I authorize this transaction";
const signature = crypto.sign("sha256", Buffer.from(message), privateKey);

// Verify the signature (anyone with public key can verify)
const isValid = crypto.verify("sha256", Buffer.from(message), publicKey, signature);
console.log(isValid);  // true

// Tampered message fails verification
const isValid2 = crypto.verify("sha256", Buffer.from("Tampered!"), publicKey, signature);
console.log(isValid2);  // false
```

### What Digital Signatures Provide:

| Property | Description |
|----------|-------------|
| **Authentication** | Proves who signed the message |
| **Integrity** | Detects if message was modified |
| **Non-repudiation** | Signer cannot deny signing |

### Common Signature Algorithms:

| Algorithm | Based On | Use Case |
|-----------|----------|----------|
| **RSA-PSS** | RSA | Certificates, documents |
| **ECDSA** | ECC | TLS, Bitcoin, Ethereum |
| **Ed25519** | Curve25519 | SSH keys, modern apps |
| **DSA** | Discrete log | Legacy (deprecated) |

---

## Public Key Infrastructure (PKI)

How do you trust that a public key really belongs to who it claims?

```
Certificate Authority (CA)
    |
    |--- Signs server's public key → Certificate
    |
Browser trusts CA → Trusts certificate → Trusts server's public key
```

A TLS certificate contains:
- Server's public key
- Domain name
- CA's digital signature
- Expiration date

---

## Hybrid Encryption (How TLS Works)

Asymmetric encryption is slow — so real systems combine both:

```
1. Client → Server:  "Hello, let's talk securely"
2. Server → Client:  Server's public key (in certificate)
3. Client:           Generate random symmetric key
4. Client → Server:  Symmetric key encrypted with server's public key
5. Both sides:       Use symmetric key for fast bulk encryption

Result: Asymmetric solves key exchange, symmetric handles the data
```

This is exactly how HTTPS works in TLS 1.2 (TLS 1.3 uses ECDHE instead).

---

## Performance Comparison

| Operation | RSA-2048 | ECC P-256 | AES-256 |
|-----------|----------|-----------|---------|
| **Key generation** | ~500ms | ~10ms | Instant |
| **Encrypt/Sign** | ~2ms | ~1ms | ~0.001ms |
| **Decrypt/Verify** | ~30ms | ~2ms | ~0.001ms |
| **Throughput** | ~10 KB/s | ~50 KB/s | ~1 GB/s |

This is why asymmetric is used only for key exchange/signatures — never for bulk data.

---

## Algorithm Selection Guide

| Use Case | Recommended Algorithm |
|----------|----------------------|
| **Key exchange** | ECDH (Curve25519 or P-256) |
| **Digital signatures** | Ed25519 or ECDSA (P-256) |
| **Encrypting small data** | RSA-OAEP (2048+ bits) |
| **TLS/HTTPS** | ECDHE + AES-256-GCM |
| **SSH keys** | Ed25519 |
| **Code signing** | RSA-PSS (4096-bit) |
| **Cryptocurrency** | ECDSA (secp256k1) |

---

## Common Mistakes

| Mistake | Risk | Solution |
|---------|------|----------|
| Small RSA keys (<2048) | Can be factored | Use 2048+ bits minimum |
| Encrypting large data with RSA | Extremely slow | Use hybrid encryption |
| Not verifying signatures | Accept forged data | Always verify |
| Reusing ephemeral keys | Breaks forward secrecy | Generate fresh keys per session |
| Ignoring key expiration | Compromised keys stay valid | Implement key rotation |

---

## Quantum Computing Threat

Quantum computers threaten asymmetric cryptography:

| Algorithm | Quantum Impact | Timeline |
|-----------|---------------|----------|
| RSA | Broken by Shor's algorithm | 10-20 years |
| ECC | Broken by Shor's algorithm | 10-20 years |
| AES-256 | Weakened (Grover's) but still safe | Safe with 256-bit |
| SHA-256 | Weakened but still safe | Safe |

**Post-quantum alternatives** (NIST standardized 2024):
- CRYSTALS-Kyber (key exchange)
- CRYSTALS-Dilithium (signatures)
- FALCON (signatures)

---

## Key Takeaways

- Asymmetric encryption uses **key pairs** (public + private)
- **RSA** is widely used but requires large keys; **ECC** offers same security with smaller keys
- **Diffie-Hellman** enables shared secret agreement over insecure channels
- **Digital signatures** provide authentication, integrity, and non-repudiation
- Asymmetric is **too slow** for bulk data — combine with symmetric (hybrid)
- **TLS/HTTPS** uses asymmetric for key exchange, symmetric for data
- Use **Ed25519** for signatures and **ECDH** for key exchange in new systems
- Prepare for **post-quantum** cryptography — monitor NIST standards

---

Next, we'll learn about **Hashing and Digital Certificates** →
