---
title: Node.js Crypto Module
---

# Node.js Crypto Module

The `node:crypto` module provides cryptographic functionality: hashing, encryption, decryption, random number generation, and digital signatures. It's built into Node.js — no external packages needed.

## Hashing

A hash is a fixed-size fingerprint of data. The same input always produces the same hash, but you can't reverse a hash to get the original data.

### Creating hashes

```javascript
import { createHash } from "node:crypto";

// SHA-256 hash
const hash = createHash("sha256")
  .update("Hello, world!")
  .digest("hex");

console.log(hash);
// 315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3
```

### Common hash algorithms

```javascript
// MD5 (fast, NOT secure — use only for checksums)
createHash("md5").update(data).digest("hex");

// SHA-256 (recommended general purpose)
createHash("sha256").update(data).digest("hex");

// SHA-512 (longer hash, higher security)
createHash("sha512").update(data).digest("hex");
```

### Output formats

```javascript
const hash = createHash("sha256").update("Hello");

hash.digest("hex");    // hexadecimal string
hash.digest("base64"); // Base64 string
hash.digest();         // Buffer (raw bytes)
```

### File checksum

```javascript
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

function fileChecksum(filePath, algorithm = "sha256") {
  return new Promise((resolve, reject) => {
    const hash = createHash(algorithm);
    const stream = createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

const checksum = await fileChecksum("./package.json");
console.log("SHA-256:", checksum);
```

## HMAC (Hash-based Message Authentication Code)

HMAC combines a hash with a secret key — used to verify data integrity and authenticity:

```javascript
import { createHmac } from "node:crypto";

const secret = "my-secret-key";
const message = "Hello, world!";

const hmac = createHmac("sha256", secret)
  .update(message)
  .digest("hex");

console.log("HMAC:", hmac);
```

Use case: verifying webhook signatures from services like GitHub or Stripe.

```javascript
function verifyWebhook(payload, signature, secret) {
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  );
}
```

## Random bytes and UUIDs

### Secure random bytes

```javascript
import { randomBytes } from "node:crypto";

// Synchronous
const token = randomBytes(32).toString("hex"); // 64 hex chars
console.log("Token:", token);

// Async
randomBytes(32, (err, buf) => {
  if (err) throw err;
  console.log("Token:", buf.toString("hex"));
});
```

### Random integers

```javascript
import { randomInt } from "node:crypto";

// Random integer between 0 (inclusive) and 100 (exclusive)
const num = randomInt(100);
console.log(num); // e.g., 42

// Random integer in range [10, 50)
const ranged = randomInt(10, 50);
```

### UUID generation

```javascript
import { randomUUID } from "node:crypto";

const id = randomUUID();
console.log(id); // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

### Generating secure tokens

```javascript
// API key
const apiKey = randomBytes(32).toString("base64url");
// e.g., "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"

// Password reset token
const resetToken = randomBytes(20).toString("hex");
// e.g., "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"

// Session ID
const sessionId = randomUUID();
```

## Symmetric encryption (AES)

Encrypt and decrypt with a shared secret key:

```javascript
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

const algorithm = "aes-256-gcm";
const password = "my-secret-password";

// Derive a key from password
const salt = randomBytes(16);
const key = scryptSync(password, salt, 32); // 32 bytes for AES-256

function encrypt(text) {
  const iv = randomBytes(16); // initialization vector
  const cipher = createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag(); // for GCM mode

  return {
    iv: iv.toString("hex"),
    encrypted,
    authTag: authTag.toString("hex"),
  };
}

function decrypt({ iv, encrypted, authTag }) {
  const decipher = createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// Usage
const encrypted = encrypt("Secret message");
console.log("Encrypted:", encrypted);

const decrypted = decrypt(encrypted);
console.log("Decrypted:", decrypted); // "Secret message"
```

## Timing-safe comparison

Prevent timing attacks when comparing secrets:

```javascript
import { timingSafeEqual } from "node:crypto";

function safeCompare(a, b) {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// Use for comparing tokens, signatures, API keys
const isValid = safeCompare(userToken, storedToken);
```

**Never use `===` to compare secrets** — it short-circuits on the first mismatched character, leaking timing information.

## Key derivation (scrypt / pbkdf2)

Derive encryption keys from passwords:

```javascript
import { scryptSync, randomBytes } from "node:crypto";

const password = "user-password";
const salt = randomBytes(16);

// scrypt (recommended)
const key = scryptSync(password, salt, 64);
console.log("Key:", key.toString("hex"));

// Store salt alongside the derived key
const stored = `${salt.toString("hex")}:${key.toString("hex")}`;
```

## Quick reference

| Function | Purpose | Example |
|----------|---------|---------|
| `createHash` | One-way hash | File checksums, data fingerprinting |
| `createHmac` | Keyed hash | Webhook signature verification |
| `randomBytes` | Secure random data | Tokens, salts, keys |
| `randomUUID` | UUID v4 | Unique identifiers |
| `randomInt` | Random integer | Non-security random numbers |
| `createCipheriv` | Encrypt data | Storing sensitive data |
| `createDecipheriv` | Decrypt data | Reading encrypted data |
| `timingSafeEqual` | Constant-time comparison | Comparing secrets |
| `scryptSync` | Key derivation | Password → encryption key |

## Key takeaways

- Use `createHash("sha256")` for general-purpose hashing.
- Use `createHmac` for verifying message authenticity (webhooks, APIs).
- Use `randomBytes`, `randomUUID`, and `randomInt` for secure random data.
- Use `aes-256-gcm` for symmetric encryption — always include an IV and auth tag.
- Use `timingSafeEqual` when comparing tokens or secrets — never `===`.
- For password hashing, prefer **bcrypt** or **argon2** (covered in the Password Hashing lesson) over raw crypto.
