---
title: Authentication & Cryptography
---

# Authentication & Cryptography

Authentication answers the fundamental question: **"Who are you?"** Before an operating system can enforce access control policies, it must first verify the identity of the user or process requesting access. Cryptography provides the mathematical foundation that makes secure authentication, data protection, and communication possible. This lesson covers password security, multi-factor authentication, symmetric and asymmetric encryption, hashing, digital signatures, and full-disk encryption.

---

## Authentication Fundamentals

Authentication verifies identity based on one or more **factors**:

| Factor                 | Category   | Examples                                         |
| ---------------------- | ---------- | ------------------------------------------------ |
| **Something you know** | Knowledge  | Password, PIN, security question                 |
| **Something you have** | Possession | Smart card, phone (TOTP), hardware key (YubiKey) |
| **Something you are**  | Inherence  | Fingerprint, face, iris, voice                   |
| **Somewhere you are**  | Location   | GPS coordinates, IP geolocation                  |
| **Something you do**   | Behavior   | Typing rhythm, gait analysis                     |

> **"The three factors of authentication — knowledge, possession, and inherence — form the foundation of every identity verification system."**

---

## Password-Based Authentication

Passwords remain the most common authentication mechanism, despite their well-known weaknesses.

### Password Storage Evolution

| Era    | Method                              | Security Level | Problem                                       |
| ------ | ----------------------------------- | -------------- | --------------------------------------------- |
| 1960s  | **Plaintext**                       | Terrible       | Any breach exposes all passwords              |
| 1970s  | **Encryption** (reversible)         | Poor           | Key compromise reveals all passwords          |
| 1980s  | **Hashing** (one-way)               | Moderate       | Rainbow tables, dictionary attacks            |
| 1990s  | **Salted hashing**                  | Good           | Brute force still possible for weak passwords |
| 2010s+ | **Key stretching** (bcrypt, argon2) | Excellent      | Intentionally slow — resists GPU cracking     |

```text
Password Storage Methods:

1. Plaintext (NEVER DO THIS):
   Database: [alice: "password123"]
   Breach → attacker gets ALL passwords instantly

2. Simple Hash:
   Database: [alice: SHA256("password123") = "ef92b..."]
   Problem: Same password → same hash (rainbow tables)

3. Salted Hash:
   salt = random_bytes(16)
   Database: [alice: salt + SHA256(salt + "password123")]
   Each user gets unique salt → rainbow tables useless

4. Key-Stretched Salted Hash (BEST):
   Database: [alice: bcrypt("password123", cost=12)]
   Intentionally slow (~250ms per hash) → brute force impractical
```

### Password Attack Methods

| Attack                  | Mechanism                             | Speed                   | Defense                     |
| ----------------------- | ------------------------------------- | ----------------------- | --------------------------- |
| **Brute Force**         | Try every possible combination        | Slow for long passwords | Minimum length requirement  |
| **Dictionary**          | Try common words and variations       | Fast for weak passwords | Complexity requirements     |
| **Rainbow Table**       | Precomputed hash→password lookup      | Instant once built      | Salt (makes tables useless) |
| **Credential Stuffing** | Use leaked passwords from other sites | Fast                    | Unique passwords per site   |
| **Keylogging**          | Record keystrokes                     | Captures any password   | Anti-keylogger, MFA         |
| **Phishing**            | Trick user into entering password     | Depends on user         | Security training, MFA      |

### Password Policies

| Policy             | Recommendation                     | Rationale                                |
| ------------------ | ---------------------------------- | ---------------------------------------- |
| **Minimum length** | ≥ 12 characters                    | Exponentially increases brute-force time |
| **Complexity**     | Mix of types OR passphrase         | Increases search space                   |
| **Rotation**       | Only after suspected compromise    | Forced rotation leads to weak patterns   |
| **Reuse**          | Prohibit across sites              | Prevents credential stuffing             |
| **Storage**        | bcrypt/argon2 with cost ≥ 10       | Resists GPU/ASIC cracking                |
| **Lockout**        | Temporary lockout after N failures | Prevents online brute force              |

```python
# Secure password hashing with bcrypt
import bcrypt

def hash_password(password: str) -> bytes:
    """Hash a password with bcrypt (includes random salt)."""
    salt = bcrypt.gensalt(rounds=12)  # 2^12 = 4096 iterations
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed

def verify_password(password: str, hashed: bytes) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(password.encode('utf-8'), hashed)

# Usage
stored_hash = hash_password("my_secure_passphrase")
# stored_hash: b'$2b$12$LJ3m4ys3Lk0T...'  (includes algorithm, cost, salt, hash)

assert verify_password("my_secure_passphrase", stored_hash) == True
assert verify_password("wrong_password", stored_hash) == False
```

> [!TIP]
> Modern guidance from NIST SP 800-63B (2023) recommends: **no arbitrary complexity rules** (they lead to predictable patterns), **minimum 8 characters** (12+ preferred), **check against breach databases**, and **use MFA whenever possible**.

---

## Multi-Factor Authentication (MFA)

MFA combines **two or more** authentication factors, dramatically reducing the risk of compromise.

```text
Single Factor (password only):
  User: "alice" + "password123" → ✓ Authenticated
  Risk: If password is stolen → account compromised

Multi-Factor (password + TOTP):
  User: "alice" + "password123" + "482916" (6-digit code from phone)
  Risk: Attacker needs BOTH the password AND the phone
```

| MFA Method                 | Factor Type                  | Security                 | Convenience |
| -------------------------- | ---------------------------- | ------------------------ | ----------- |
| **SMS code**               | Possession (phone)           | Moderate (SIM swap risk) | High        |
| **TOTP app** (Google Auth) | Possession (phone)           | Good                     | Good        |
| **Hardware key** (YubiKey) | Possession (physical device) | Excellent                | Moderate    |
| **Push notification**      | Possession (phone)           | Good                     | Excellent   |
| **Biometric**              | Inherence                    | Good (depends on sensor) | Excellent   |

### Time-based One-Time Password (TOTP)

```text
TOTP Generation:

1. Shared secret: "JBSWY3DPEHPK3PXP" (established during setup)
2. Time step: floor(current_unix_time / 30) = T
3. HMAC: HMAC-SHA1(secret, T) → 20-byte hash
4. Truncate: Extract 4 bytes → 31-bit integer
5. Modulo: integer mod 10^6 → 6-digit code

Example:
  Time: 2024-01-15 14:30:00 → T = 57283800
  HMAC-SHA1(secret, 57283800) → ...8f3a2b7c...
  Truncate → 5923847
  mod 1000000 → 923847

  Display: 923847 (valid for 30 seconds)
```

---

## Biometric Authentication

| Biometric            | FAR\*   | FRR\*\* | Spoofability            | Cost      | Use Case                    |
| -------------------- | ------- | ------- | ----------------------- | --------- | --------------------------- |
| **Fingerprint**      | 0.001%  | 0.1%    | Medium (gummy finger)   | Low       | Phones, laptops             |
| **Face recognition** | 0.01%   | 0.5%    | Medium (photo, mask)    | Low       | Phones, surveillance        |
| **Iris scan**        | 0.0001% | 0.2%    | Low                     | High      | Border control              |
| **Voice print**      | 0.1%    | 1.0%    | High (AI voice cloning) | Low       | Phone banking               |
| **Retina scan**      | 0.0001% | 0.1%    | Very low                | Very high | Military, secure facilities |

\*FAR = False Acceptance Rate (unauthorized person accepted)
\*\*FRR = False Rejection Rate (authorized person rejected)

> [!WARNING]
> Unlike passwords, biometrics **cannot be changed** if compromised. If your fingerprint data is stolen, you can't get new fingerprints. This is why biometrics should be used as a **factor**, not the sole authentication method.

---

## Cryptography Fundamentals

Cryptography transforms readable data (**plaintext**) into unreadable form (**ciphertext**) and back, using mathematical algorithms and keys.

### Symmetric Encryption

In **symmetric encryption**, the **same key** is used for both encryption and decryption.

```text
Symmetric Encryption:

  Plaintext        Key K          Ciphertext        Key K         Plaintext
  "Hello"    ──▶ ┌──────┐ ──▶   "x7#mQ..."   ──▶ ┌──────┐ ──▶  "Hello"
                 │Encrypt│                         │Decrypt│
                 └──────┘                         └──────┘

  Same key K used for both operations!
```

| Algorithm    | Key Size | Block Size | Status                              |
| ------------ | -------- | ---------- | ----------------------------------- |
| **DES**      | 56 bits  | 64 bits    | ❌ Broken — key too short           |
| **3DES**     | 168 bits | 64 bits    | ⚠️ Deprecated — slow                |
| **AES-128**  | 128 bits | 128 bits   | ✅ Standard — fast, secure          |
| **AES-256**  | 256 bits | 128 bits   | ✅ Gold standard — highest security |
| **ChaCha20** | 256 bits | Stream     | ✅ Modern — fast on mobile/embedded |

### Asymmetric Encryption

In **asymmetric encryption**, two mathematically related keys are used: a **public key** (shared openly) and a **private key** (kept secret).

```text
Asymmetric Encryption:

  Sender (Alice)                              Receiver (Bob)

  Plaintext     Bob's Public Key             Bob's Private Key    Plaintext
  "Hello"  ──▶ ┌────────────────┐ ──▶  ──▶ ┌────────────────┐ ──▶ "Hello"
               │   Encrypt      │           │   Decrypt      │
               │   with PubKey  │           │   with PrivKey │
               └────────────────┘           └────────────────┘

  Anyone can encrypt with Bob's public key.
  ONLY Bob can decrypt with his private key.
```

| Algorithm   | Key Sizes       | Based On               | Use Case                 |
| ----------- | --------------- | ---------------------- | ------------------------ |
| **RSA**     | 2048, 4096 bits | Integer factorization  | Key exchange, signatures |
| **ECDSA**   | 256, 384 bits   | Elliptic curves        | Digital signatures       |
| **ECDH**    | 256, 384 bits   | Elliptic curves        | Key agreement            |
| **Ed25519** | 256 bits        | Twisted Edwards curves | Fast digital signatures  |

### Symmetric vs Asymmetric Comparison

| Feature              | Symmetric                              | Asymmetric                  |
| -------------------- | -------------------------------------- | --------------------------- |
| **Keys**             | One shared key                         | Public + private key pair   |
| **Speed**            | Very fast (AES: ~1 GB/s)               | Slow (RSA: ~10 KB/s)        |
| **Key distribution** | Problem — must share key securely      | Easy — public key is public |
| **Key management**   | $n$ users need $\frac{n(n-1)}{2}$ keys | $n$ users need $2n$ keys    |
| **Use case**         | Bulk data encryption                   | Key exchange, signatures    |
| **Examples**         | AES, ChaCha20                          | RSA, ECDSA                  |

> [!NOTE]
> In practice, systems use **hybrid encryption**: asymmetric encryption to exchange a symmetric session key, then symmetric encryption for the actual data. This combines the key distribution advantage of asymmetric with the speed of symmetric.

---

## Hashing

A **cryptographic hash function** maps input of any size to a fixed-size output, with special security properties.

| Property                | Description                                   | Example                                |
| ----------------------- | --------------------------------------------- | -------------------------------------- |
| **Deterministic**       | Same input → same hash, always                | `SHA256("hello")` always = `2cf24d...` |
| **Fast**                | Compute hash quickly                          | Millions of hashes per second          |
| **Avalanche effect**    | Tiny input change → completely different hash | "hello" vs "hellp" → totally different |
| **Pre-image resistant** | Cannot find input from hash                   | Given `2cf24d...`, cannot find "hello" |
| **Collision resistant** | Cannot find two inputs with same hash         | No known collision for SHA-256         |

```text
Hash Function Examples:

Input: "Hello, World!"
  MD5:    65a8e27d8879283831b664bd8b7f0ad4        (128 bits) ← BROKEN
  SHA-1:  943a702d06f34599aee1f8da8ef9f7296031d699 (160 bits) ← WEAK
  SHA-256: dffd6021bb2bd5b0af676290809ec3a53191dd81
           c7f70a4b28688a362182986f                (256 bits) ✅

Input: "Hello, World?"  (one character changed)
  SHA-256: 4c4f60c1be5b16b47a1a2f0e4b3e8b73d7a2c123
           8f9e4d5a6b7c8d9e0f1a2b3c                (256 bits)

  Completely different! (avalanche effect)
```

| Algorithm   | Output Size  | Status                       | Use Case                                 |
| ----------- | ------------ | ---------------------------- | ---------------------------------------- |
| **MD5**     | 128 bits     | ❌ Broken (collisions found) | Checksums only (not security)            |
| **SHA-1**   | 160 bits     | ❌ Broken (SHAttered attack) | Legacy compatibility only                |
| **SHA-256** | 256 bits     | ✅ Secure                    | Password hashing, signatures, blockchain |
| **SHA-3**   | 224–512 bits | ✅ Secure (different design) | Backup if SHA-2 breaks                   |
| **BLAKE3**  | 256 bits     | ✅ Secure, very fast         | File integrity, modern applications      |

---

## Digital Signatures

A **digital signature** proves that a message came from a specific sender and has not been tampered with. It uses the sender's **private key** to sign and their **public key** to verify.

```text
Digital Signature Workflow:

Signing (Alice):
  Message: "Transfer $500 to Bob"
        │
        ▼
  ┌──────────────┐
  │   Hash(msg)  │ → digest: "a3f2b1..."
  └──────┬───────┘
         │
         ▼
  ┌──────────────────┐
  │ Encrypt digest   │ → signature: "7e9c4d..."
  │ with Alice's     │
  │ PRIVATE key      │
  └──────────────────┘
         │
         ▼
  Send: (Message + Signature)

Verification (Bob):
  Received: ("Transfer $500 to Bob", "7e9c4d...")
         │                              │
         ▼                              ▼
  ┌──────────────┐              ┌──────────────────┐
  │   Hash(msg)  │              │ Decrypt signature │
  │              │              │ with Alice's      │
  │ → "a3f2b1.."│              │ PUBLIC key        │
  └──────┬───────┘              │ → "a3f2b1..."    │
         │                      └────────┬─────────┘
         │                               │
         ▼                               ▼
  ┌────────────────────────────────────────┐
  │           Do they match?               │
  │  "a3f2b1..." == "a3f2b1..." → ✅ VALID │
  └────────────────────────────────────────┘
```

Digital signatures provide:

| Property            | Meaning                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| **Authentication**  | The message was signed by Alice (only she has the private key)               |
| **Integrity**       | The message was not altered (hash would change)                              |
| **Non-repudiation** | Alice cannot deny signing (only her private key could produce the signature) |

---

## Certificates and PKI

How does Bob know that Alice's public key really belongs to Alice? A **Certificate Authority (CA)** vouches for the binding between identity and public key.

```text
Chain of Trust:

┌─────────────────────┐
│   Root CA            │  (Self-signed, trusted by OS/browser)
│   "DigiCert Root"   │
│   Signs ↓            │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│   Intermediate CA    │  (Signed by Root CA)
│   "DigiCert SHA2"   │
│   Signs ↓            │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│   Server Certificate │  (Signed by Intermediate CA)
│   "www.example.com"  │
│   Public Key: ...    │
└─────────────────────┘
```

A digital certificate contains:

| Field               | Content                                              |
| ------------------- | ---------------------------------------------------- |
| **Subject**         | Entity the cert identifies (e.g., `www.example.com`) |
| **Issuer**          | CA that signed this certificate                      |
| **Public Key**      | The subject's public key                             |
| **Validity Period** | Start and expiration dates                           |
| **Serial Number**   | Unique identifier                                    |
| **Signature**       | CA's digital signature over all the above            |

---

## TLS/SSL: Securing Network Communication

**TLS** (Transport Layer Security) secures data in transit between client and server. Here's the simplified handshake:

```text
TLS 1.3 Handshake (simplified):

Client                                    Server
  │                                          │
  ├── ClientHello ──────────────────────────▶│
  │   (supported ciphers, random,            │
  │    key share)                            │
  │                                          │
  │◀────────────────── ServerHello ──────────┤
  │   (chosen cipher, random, key share,     │
  │    certificate, signature)               │
  │                                          │
  │   Both compute shared secret from        │
  │   key exchange (ECDHE)                   │
  │                                          │
  ├── Finished ─────────────────────────────▶│
  │   (encrypted with derived keys)          │
  │                                          │
  │◀───────────────────── Finished ──────────┤
  │                                          │
  │◀═══════ Encrypted Application Data ═════▶│
  │           (AES-256-GCM or ChaCha20)      │
```

| TLS Version | Status         | Key Features                                                |
| ----------- | -------------- | ----------------------------------------------------------- |
| SSL 3.0     | ❌ Deprecated  | POODLE vulnerability                                        |
| TLS 1.0     | ❌ Deprecated  | BEAST vulnerability                                         |
| TLS 1.1     | ❌ Deprecated  | No modern ciphers                                           |
| TLS 1.2     | ✅ Acceptable  | Widely deployed, many cipher options                        |
| TLS 1.3     | ✅ Recommended | Faster handshake (1-RTT), fewer cipher options (all secure) |

---

## Full-Disk Encryption

Full-disk encryption (FDE) protects data at rest by encrypting the entire disk volume.

| Solution          | OS             | Algorithm             | Key Storage             |
| ----------------- | -------------- | --------------------- | ----------------------- |
| **LUKS/dm-crypt** | Linux          | AES-256-XTS           | Passphrase or key file  |
| **BitLocker**     | Windows        | AES-128/256-XTS       | TPM chip + PIN/key      |
| **FileVault**     | macOS          | AES-256-XTS           | Keychain + recovery key |
| **VeraCrypt**     | Cross-platform | AES, Serpent, Twofish | Passphrase + PIM        |

```text
Full-Disk Encryption Data Flow:

Write path:
  Application → File System → [ENCRYPTION] → Block Device → Disk
  Plaintext                    Ciphertext

Read path:
  Disk → Block Device → [DECRYPTION] → File System → Application
  Ciphertext              Plaintext

The encryption/decryption happens transparently in the kernel.
```

> [!IMPORTANT]
> FDE protects against **physical theft** — if someone steals your laptop, they cannot read the disk without the key. However, FDE does NOT protect against attacks while the system is running (the key is in RAM).

---

## Secure Boot

**Secure Boot** ensures that only trusted software runs during the boot process, preventing rootkits and bootkits from loading before the OS.

```text
Secure Boot Chain of Trust:

┌─────────────────────┐
│  Hardware Root of   │  Immutable code in CPU/firmware
│  Trust (ROM)        │  Contains platform key (PK)
└─────────┬───────────┘
          │ verifies
┌─────────▼───────────┐
│  UEFI Firmware      │  Signed with Key Exchange Key (KEK)
│  (BIOS replacement) │
└─────────┬───────────┘
          │ verifies
┌─────────▼───────────┐
│  Boot Loader        │  Signed with db key (e.g., Microsoft, distro)
│  (GRUB, Windows BM) │
└─────────┬───────────┘
          │ verifies
┌─────────▼───────────┐
│  OS Kernel          │  Signed by OS vendor
│  (Linux, Windows)   │
└─────────┬───────────┘
          │ verifies
┌─────────▼───────────┐
│  Kernel Modules     │  Signed modules only
│  (Drivers)          │
└─────────────────────┘

If ANY step fails verification → BOOT HALTS
```

---

## Try It Yourself

**Exercise 1:** An attacker obtains a database of password hashes. The hashes are unsalted SHA-256. The attacker has a precomputed rainbow table with 10 billion entries. If users have 8-character passwords using lowercase letters only ($26^8 \approx 2 \times 10^{11}$), approximately what fraction of passwords can the rainbow table crack?

:::details Solution
The total password space is $26^8 = 208{,}827{,}064{,}576 \approx 2.09 \times 10^{11}$.

The rainbow table has $10^{10} = 10$ billion entries.

Fraction covered: $\frac{10^{10}}{2.09 \times 10^{11}} \approx 4.8\%$

So the rainbow table can crack about **4.8%** of possible passwords directly. However, in practice, users choose non-random passwords, so common passwords like "password", "abcdefgh", etc. would almost certainly be in the table. Realistic crack rates for common user passwords would be **much higher** — potentially 50-80%.

**With salting**, the rainbow table becomes completely useless because each user has a different salt, requiring a separate table for each salt value.
:::

**Exercise 2:** Explain why a system that uses only biometric authentication (fingerprint) is less secure than one using fingerprint + password (MFA).

:::details Solution
**Single-factor biometric only:**

- If the fingerprint sensor is spoofed (e.g., using a gummy fingerprint mold), the attacker gains full access
- Fingerprints can be lifted from surfaces the user has touched
- Biometrics cannot be changed — a compromised fingerprint is compromised forever
- False acceptance rates mean occasional unauthorized access

**Two-factor (fingerprint + password):**

- Attacker needs BOTH the fingerprint AND the password
- Even if the fingerprint is spoofed, the attacker still doesn't know the password
- Even if the password is stolen (phishing), the attacker doesn't have the fingerprint
- Probability of both being compromised simultaneously is much lower: $P(\text{both}) = P(\text{finger}) \times P(\text{password})$

This is the core principle of MFA: compromising one factor should not compromise the system.
:::

**Exercise 3:** In a symmetric encryption system with 100 users where every pair needs a unique key, how many keys are needed? Compare with an asymmetric system.

:::details Solution
**Symmetric:** Every pair of users needs a shared key.
$$\text{Keys} = \binom{100}{2} = \frac{100 \times 99}{2} = 4{,}950 \text{ keys}$$

Each user must securely store 99 keys (one for each other user).

**Asymmetric:** Each user has one key pair (public + private).
$$\text{Key pairs} = 100 \times 2 = 200 \text{ keys total}$$

Each user stores only 1 private key and publishes 1 public key. Public keys can be distributed freely.

The asymmetric system is dramatically simpler to manage: **200 keys vs 4,950 keys**. This advantage grows quadratically — with 1,000 users, symmetric needs 499,500 keys while asymmetric needs only 2,000.
:::

---

## Key Takeaways

- Authentication verifies identity using **knowledge** (passwords), **possession** (tokens), or **inherence** (biometrics) — combining multiple factors (MFA) dramatically increases security
- Passwords must be stored using **salted, key-stretched hashing** (bcrypt, argon2) — never plaintext, never simple hashing
- **Symmetric encryption** (AES) is fast and used for bulk data; **asymmetric encryption** (RSA, ECDSA) solves key distribution but is slow — real systems use **hybrid** approaches
- **Cryptographic hashing** (SHA-256) is a one-way function providing integrity verification; it's deterministic, fast, and collision-resistant
- **Digital signatures** provide authentication, integrity, and non-repudiation by signing a hash with the sender's private key
- The **PKI** system (Certificate Authorities, certificate chains) binds public keys to identities, enabling trust on the internet
- **TLS 1.3** secures network communication with a streamlined 1-RTT handshake combining ECDHE key exchange and AES encryption
- **Full-disk encryption** protects data at rest against physical theft; **Secure Boot** ensures only trusted code runs during startup
