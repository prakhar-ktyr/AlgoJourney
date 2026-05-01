---
title: Hashing Algorithms
---

# Hashing Algorithms

A **hash function** takes an input of any size and produces a fixed-size output (the "hash" or "digest"). Hashing is fundamental to cybersecurity — it secures passwords, verifies file integrity, and underpins digital signatures.

---

## Properties of Cryptographic Hash Functions

| Property | Description |
|----------|-------------|
| **One-way** | Cannot reverse the hash to recover the original input |
| **Deterministic** | Same input always produces the same output |
| **Avalanche effect** | A tiny change in input drastically changes the output |
| **Collision-resistant** | Extremely hard to find two inputs that produce the same hash |
| **Fixed output size** | Output length is constant regardless of input size |

---

## Common Hashing Algorithms

| Algorithm | Output Size | Status | Use Case |
|-----------|-------------|--------|----------|
| MD5 | 128 bits | Broken — do not use for security | Legacy checksums |
| SHA-1 | 160 bits | Deprecated | Git commits (non-security) |
| SHA-256 | 256 bits | Secure | File integrity, blockchain |
| SHA-3 | 224–512 bits | Secure | Modern alternative to SHA-2 |
| bcrypt | 184 bits | Secure | Password hashing |
| Argon2 | Configurable | Secure (recommended) | Password hashing |
| scrypt | Configurable | Secure | Password hashing, key derivation |

---

## Hashing in Action

### File Integrity Check

```bash
# Generate a SHA-256 hash of a file
sha256sum report.pdf
# Output: 3a7bd3e2...  report.pdf

# Verify the hash after download
echo "3a7bd3e2...  report.pdf" | sha256sum --check
```

### Password Hashing with bcrypt (Node.js)

```javascript
import bcrypt from "bcrypt";

// Hash a password (salt rounds = 12)
const hash = await bcrypt.hash("myPassword123", 12);
// $2b$12$LJ3m4sMK...

// Verify a password
const isMatch = await bcrypt.compare("myPassword123", hash);
// true
```

### Argon2 Example (Python)

```python
import argon2

hasher = argon2.PasswordHasher(time_cost=3, memory_cost=65536, parallelism=4)
hash_value = hasher.hash("secretPassword")
# $argon2id$v=19$m=65536,t=3,p=4$...

# Verify
hasher.verify(hash_value, "secretPassword")  # Returns True
```

---

## Why MD5 and SHA-1 Are Broken

MD5 was proven collision-vulnerable in 2004. Attackers can craft two different files with the same MD5 hash. SHA-1 suffered a practical collision in 2017 (SHAttered attack).

**Never use MD5 or SHA-1 for security-critical purposes.**

---

## Rainbow Tables and Salting

A **rainbow table** is a precomputed lookup of hash → plaintext pairs. If passwords are hashed without salt, attackers can look up common passwords instantly.

A **salt** is a random value added to the input before hashing:

```
hash("password" + "x9Kp2m") → completely different hash
hash("password" + "Qr7nLw") → another different hash
```

| Technique | Vulnerable to Rainbow Tables? |
|-----------|-------------------------------|
| Plain hash (e.g., SHA-256 of password) | Yes |
| Hash + unique salt per user | No |
| bcrypt / Argon2 (auto-salting) | No |

Modern password hashing algorithms like bcrypt and Argon2 automatically generate and store a unique salt with each hash.

---

## Choosing the Right Algorithm

| Scenario | Recommended Algorithm |
|----------|----------------------|
| Password storage | Argon2id (preferred), bcrypt, scrypt |
| File integrity / checksums | SHA-256 or SHA-3 |
| Digital signatures | SHA-256 or SHA-3 |
| HMAC (message auth) | SHA-256 |
| Non-security hashing | MurmurHash, xxHash |

---

## Key Takeaways

- Hash functions are one-way — you cannot "decrypt" a hash.
- MD5 and SHA-1 are cryptographically broken; use SHA-256+ for integrity and Argon2/bcrypt for passwords.
- Always salt passwords before hashing; modern password hashers do this automatically.
- The avalanche effect ensures even tiny input changes produce completely different hashes.
- Choose the algorithm based on your use case: speed for integrity checks, deliberate slowness for passwords.

---

[Next: Digital Signatures & Certificates](32-cybersecurity-digital-signatures)
