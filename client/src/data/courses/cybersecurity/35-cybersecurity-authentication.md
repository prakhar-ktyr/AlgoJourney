---
title: Authentication Methods
---

# Authentication Methods

**Authentication** is the process of verifying that a user or system is who they claim to be. It answers the question "Who are you?" — distinct from **authorization** (What are you allowed to do?).

---

## Authentication Factors

| Factor | Category | Examples |
|--------|----------|----------|
| Something you **know** | Knowledge | Password, PIN, security question |
| Something you **have** | Possession | Phone, hardware key, smart card |
| Something you **are** | Inherence | Fingerprint, face, iris |
| Somewhere you **are** | Location | IP geolocation, GPS |
| Something you **do** | Behavior | Typing pattern, gait |

---

## Password-Based Authentication

The most common (and most attacked) authentication method.

### Best Practices for Password Systems

| Practice | Implementation |
|----------|---------------|
| Hash with Argon2id/bcrypt | Never store plaintext |
| Enforce minimum length (12+) | Long > complex |
| Check against breached lists | Use Have I Been Pwned API |
| Rate-limit login attempts | Prevent brute force |
| Implement account lockout | Temporary lockout after N failures |
| Never limit max password length (< 128) | Allow passphrases |

```javascript
// Checking password against breached database (k-anonymity)
import crypto from "crypto";

async function isPasswordBreached(password) {
  const hash = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await response.text();
  return text.includes(suffix);
}
```

---

## Token-Based Authentication

Instead of sending credentials with every request, the server issues a **token** after initial authentication.

### JWT (JSON Web Token)

```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxNjk5MDAwMDAwfQ.signature
```

| Part | Contains |
|------|----------|
| Header | Algorithm, token type |
| Payload | Claims (user ID, expiry, roles) |
| Signature | HMAC or RSA signature of header + payload |

---

## Biometric Authentication

| Method | Pros | Cons |
|--------|------|------|
| Fingerprint | Fast, convenient | Can be lifted from surfaces |
| Face recognition | Contactless | Spoofable with photos (without liveness) |
| Iris scan | Highly unique | Expensive hardware |
| Voice | Natural | Affected by illness, environment |

> **Important**: Biometrics cannot be changed if compromised. They should be used as one factor alongside others, never alone.

---

## Certificate-Based Authentication

Used in enterprise/IoT environments where devices authenticate using X.509 client certificates.

```
Client → presents client certificate → Server validates against trusted CA
```

| Use Case | Example |
|----------|---------|
| Mutual TLS (mTLS) | Service-to-service auth in microservices |
| Smart cards | Government/military systems |
| IoT devices | Device identity in fleet management |

---

## Passwordless Authentication

Eliminates passwords entirely in favor of more secure methods.

| Method | How It Works |
|--------|-------------|
| Magic links | One-time login link sent to email |
| Passkeys (FIDO2) | Public key cryptography with device authenticator |
| Push notification | Approve login on registered device |
| Biometric + device | Fingerprint unlocks device-stored credential |

---

## Passkeys and FIDO2/WebAuthn

**Passkeys** are the modern replacement for passwords, based on the FIDO2/WebAuthn standard.

```
Registration:
  Device generates key pair → public key sent to server
  Private key stays on device (protected by biometric/PIN)

Authentication:
  Server sends challenge → device signs with private key
  Server verifies with stored public key
```

| Advantage | Explanation |
|-----------|-------------|
| Phishing-resistant | Key is bound to the origin (domain) |
| No shared secrets | Server only stores public keys |
| No password reuse | Each site gets a unique key pair |
| Cross-device sync | Via cloud (Apple/Google/Microsoft) |

---

## Single Sign-On (SSO)

SSO allows users to authenticate once and access multiple applications.

| Protocol | Use Case |
|----------|----------|
| SAML 2.0 | Enterprise applications |
| OAuth 2.0 + OIDC | Web and mobile apps |
| Kerberos | Windows Active Directory |

---

## Session Management Best Practices

| Practice | Reason |
|----------|--------|
| Generate cryptographically random session IDs | Prevent guessing |
| Set `HttpOnly`, `Secure`, `SameSite` on cookies | Prevent XSS/CSRF theft |
| Implement idle and absolute timeouts | Limit exposure window |
| Invalidate sessions on logout | Prevent session reuse |
| Rotate session ID after login | Prevent session fixation |
| Bind sessions to device/IP (optional) | Detect hijacking |

```javascript
// Express session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 3600000, // 1 hour
  },
}));
```

---

## Key Takeaways

- Authentication verifies identity; combine multiple factors for stronger security.
- Passwords remain common but are the weakest link — enforce strong hashing and breach checks.
- Passkeys (FIDO2/WebAuthn) are phishing-resistant and eliminate shared secrets.
- Tokens (JWTs) enable stateless authentication but must be properly secured and validated.
- Session management requires careful cookie configuration, timeouts, and invalidation.

---

[Next: Multi-Factor Authentication](36-cybersecurity-mfa)
