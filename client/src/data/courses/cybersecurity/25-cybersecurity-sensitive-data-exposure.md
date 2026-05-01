---
title: Sensitive Data Exposure
---

# Sensitive Data Exposure

Sensitive data exposure occurs when applications fail to adequately protect sensitive information such as financial data, healthcare records, credentials, or personal information — whether at rest, in transit, or in use.

---

## What Is Sensitive Data?

| Category | Examples |
|----------|----------|
| **Personal (PII)** | Names, addresses, social security numbers, dates of birth |
| **Financial** | Credit card numbers, bank accounts, transaction history |
| **Authentication** | Passwords, API keys, session tokens, certificates |
| **Health (PHI)** | Medical records, diagnoses, prescriptions |
| **Business** | Trade secrets, internal communications, source code |

---

## How Data Gets Exposed

### Data at Rest (Stored)

Data stored in databases, files, or backups:

```javascript
// WRONG — storing sensitive data in plain text
const user = {
  name: "John Doe",
  ssn: "123-45-6789",          // Plain text SSN
  creditCard: "4111111111111111", // Plain text card number
  password: "MyP@ssw0rd"       // Plain text password!
};

// RIGHT — encrypt or hash sensitive fields
const user = {
  name: "John Doe",
  ssn: encrypt("123-45-6789", encryptionKey),
  creditCard: "************1111",  // Only store last 4 digits
  password: await bcrypt.hash("MyP@ssw0rd", 12)
};
```

### Data in Transit (Moving)

Data traveling between client and server:

```
User → [HTTP plain text] → Server   ← WRONG (anyone can read)
User → [HTTPS encrypted] → Server   ← RIGHT (encrypted in transit)
```

```javascript
// Force HTTPS with HSTS
app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Set HSTS header (browsers remember to always use HTTPS)
res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
```

### Data Leakage Vectors

| Vector | Example |
|--------|---------|
| **URL parameters** | `?password=secret&ssn=123-45-6789` |
| **Logs** | Logging request bodies with credentials |
| **Error messages** | Stack traces revealing DB schemas |
| **Browser storage** | Sensitive data in localStorage |
| **Cached pages** | Credit card forms in browser cache |
| **Backup files** | Unencrypted database dumps |
| **Source control** | API keys committed to Git |
| **HTTP headers** | Tokens in Referer headers |

---

## Weak Cryptography

### Outdated Algorithms

| Algorithm | Status | Replacement |
|-----------|--------|-------------|
| MD5 | Broken | SHA-256 or bcrypt (for passwords) |
| SHA-1 | Deprecated | SHA-256 or SHA-3 |
| DES | Broken | AES-256 |
| RC4 | Broken | AES-GCM or ChaCha20 |
| TLS 1.0/1.1 | Deprecated | TLS 1.2 or 1.3 |

### Improper Use of Cryptography

```javascript
// WRONG — using crypto incorrectly
const crypto = require("crypto");

// Hardcoded key (easily found in source)
const key = "my-secret-key-12";

// ECB mode (reveals patterns in data)
const cipher = crypto.createCipheriv("aes-128-ecb", key, null);

// RIGHT — proper encryption
const key = crypto.randomBytes(32);  // Random 256-bit key
const iv = crypto.randomBytes(16);   // Random initialization vector
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
// GCM mode provides encryption + authentication
```

---

## Prevention Techniques

### 1. Classify Your Data

Identify what's sensitive and apply appropriate protections:

| Classification | Examples | Protection Level |
|----------------|----------|-----------------|
| **Public** | Marketing content | Integrity only |
| **Internal** | Employee directory | Access control |
| **Confidential** | Customer data | Encryption + access control |
| **Restricted** | Passwords, keys | Encryption + strict access + auditing |

### 2. Encrypt Data at Rest

```javascript
import crypto from "crypto";

const algorithm = "aes-256-gcm";

function encrypt(text, masterKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, masterKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return { iv: iv.toString("hex"), encrypted, authTag };
}

function decrypt(encryptedData, masterKey) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    masterKey,
    Buffer.from(encryptedData.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, "hex"));
  let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
```

### 3. Enforce TLS Everywhere

```nginx
# Nginx TLS configuration
server {
    listen 443 ssl;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5:!RC4;
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

### 4. Key Management

| Practice | Description |
|----------|-------------|
| **Never hardcode keys** | Use environment variables or secret managers |
| **Rotate regularly** | Change keys on schedule (90 days) |
| **Use key vaults** | AWS KMS, Azure Key Vault, HashiCorp Vault |
| **Separate environments** | Different keys for dev/staging/production |
| **Limit access** | Only services that need keys should have them |

```javascript
// WRONG
const API_KEY = "sk-abc123xyz";  // Hardcoded in source

// RIGHT
const API_KEY = process.env.API_KEY;  // From environment/secret manager
```

### 5. Data Minimization

Collect and store only what you absolutely need:

```javascript
// WRONG — storing everything
const userData = {
  fullSSN: "123-45-6789",
  fullCreditCard: "4111111111111111",
  cvv: "123"  // Never store CVV!
};

// RIGHT — minimize stored data
const userData = {
  ssnLast4: "6789",                 // Only last 4
  cardLast4: "1111",                // Only last 4
  cardToken: "tok_payment_abc123"   // Use tokenization
};
```

### 6. Prevent Data Leakage

```javascript
// Don't log sensitive data
app.use((req, res, next) => {
  const sanitized = { ...req.body };
  if (sanitized.password) sanitized.password = "[REDACTED]";
  if (sanitized.creditCard) sanitized.creditCard = "[REDACTED]";
  console.log("Request:", req.method, req.path, sanitized);
  next();
});

// Disable browser caching for sensitive pages
res.set({
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
});
```

---

## Compliance Requirements

| Regulation | Scope | Key Requirements |
|------------|-------|-----------------|
| **GDPR** | EU personal data | Consent, right to deletion, breach notification |
| **PCI DSS** | Payment card data | Encryption, access control, regular testing |
| **HIPAA** | Health information | Encryption, access logs, minimum necessary |
| **SOX** | Financial records | Integrity, audit trails |

---

## Key Takeaways

- Sensitive data needs protection both **at rest** and **in transit**
- Always use **TLS 1.2+** for data in transit
- Encrypt sensitive data at rest with **AES-256-GCM**
- Never store passwords in plain text — use **bcrypt** or **Argon2**
- Practice **data minimization** — don't collect what you don't need
- Never hardcode secrets — use **environment variables** or **key vaults**
- Classify data and apply protections based on sensitivity level
- Stay compliant with relevant regulations (GDPR, PCI DSS, etc.)

---

Next, we'll learn about **API Security** →
