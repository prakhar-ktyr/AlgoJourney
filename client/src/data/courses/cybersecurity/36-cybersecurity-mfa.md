---
title: Multi-Factor Authentication
---

# Multi-Factor Authentication

**Multi-Factor Authentication (MFA)** requires users to provide two or more verification factors to gain access. Even if one factor is compromised (e.g., a stolen password), the attacker still cannot log in without the additional factor(s).

---

## The Three Factor Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Something you know** | Knowledge factor | Password, PIN, security answers |
| **Something you have** | Possession factor | Phone, hardware key, smart card |
| **Something you are** | Inherence factor | Fingerprint, face, voice |

True MFA requires factors from **different categories**. Using a password + security question is NOT MFA (both are knowledge factors).

---

## MFA Methods Compared

| Method | Factor Type | Phishing-Resistant | User Experience |
|--------|-------------|-------------------|-----------------|
| SMS OTP | Possession | No | Easy but slow |
| TOTP (Authenticator app) | Possession | No | Good |
| Push notification | Possession | Partial | Excellent |
| FIDO2/WebAuthn (hardware key) | Possession + Inherence | Yes | Excellent |
| Email OTP | Possession | No | Easy |
| Biometric | Inherence | Yes (local) | Excellent |

---

## TOTP (Time-Based One-Time Password)

TOTP generates a 6-digit code that changes every 30 seconds, based on a shared secret and the current time.

### How TOTP Works

```
TOTP = HMAC-SHA1(secret, floor(time / 30))
     → truncate to 6 digits
```

| Component | Value |
|-----------|-------|
| Algorithm | HMAC-SHA1 (or SHA-256/SHA-512) |
| Time step | 30 seconds |
| Code length | 6 digits (configurable) |
| Shared secret | Base32-encoded, exchanged during setup |

### TOTP Setup Flow

```
1. Server generates random secret
2. Server encodes as otpauth:// URI
3. User scans QR code with authenticator app
4. App stores secret, generates codes every 30s
5. User enters current code to verify setup
```

### otpauth URI Format

```
otpauth://totp/MyApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=MyApp&digits=6&period=30
```

### Server-Side TOTP Verification (Node.js)

```javascript
import { authenticator } from "otplib";

// Generate secret during enrollment
const secret = authenticator.generateSecret();

// Verify a user-submitted token
const isValid = authenticator.verify({ token: "123456", secret });
```

---

## FIDO2 / WebAuthn

FIDO2 is the strongest MFA standard — **phishing-resistant** because credentials are bound to the origin.

| Component | Role |
|-----------|------|
| **WebAuthn** | Browser API for credential creation/assertion |
| **CTAP2** | Protocol between device and authenticator (USB/NFC/BLE) |

### Registration Flow

```javascript
// Server generates a challenge
const options = {
  challenge: randomBytes(32),
  rp: { name: "MyApp", id: "example.com" },
  user: { id: userId, name: "user@example.com", displayName: "User" },
  pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256
  authenticatorSelection: { userVerification: "preferred" },
};

// Browser calls WebAuthn API
const credential = await navigator.credentials.create({ publicKey: options });
// Send credential to server for storage
```

### Authentication Flow

```javascript
const assertion = await navigator.credentials.get({
  publicKey: {
    challenge: serverChallenge,
    rpId: "example.com",
    allowCredentials: [{ type: "public-key", id: credentialId }],
  },
});
// Server verifies signature against stored public key
```

---

## Push Notification MFA

The server sends a push notification to the user's registered device. The user approves or denies the login attempt.

| Pros | Cons |
|------|------|
| Very user-friendly | Requires internet on phone |
| Shows login context (location, device) | Susceptible to MFA fatigue attacks |
| No code to type | Requires vendor app |

---

## SMS OTP Weaknesses

| Vulnerability | Description |
|---------------|-------------|
| **SIM swapping** | Attacker convinces carrier to port number to their SIM |
| **SS7 attacks** | Interception of SMS through telecom protocol flaws |
| **Phishing** | User can be tricked into forwarding the code |
| **Malware** | SMS-reading malware on compromised phones |
| **No encryption** | SMS is transmitted in plaintext over the network |

> **NIST SP 800-63B** discourages SMS as an authenticator. Use TOTP or FIDO2 instead.

---

## MFA Fatigue Attacks

Attackers spam push notifications hoping the user will accidentally approve one.

### How It Works

```
1. Attacker obtains valid username + password
2. Triggers repeated MFA push notifications
3. User, annoyed or confused, approves one
4. Attacker gains access
```

### Mitigations

| Mitigation | How |
|------------|-----|
| Number matching | User must enter a number shown on login screen |
| Rate limiting | Block after N unanswered pushes |
| Context display | Show IP, location, device in notification |
| Phishing-resistant MFA | Use FIDO2 (immune to fatigue) |
| Anomaly detection | Flag unusual login patterns |

---

## Implementing MFA — Decision Matrix

| Scenario | Recommended Method |
|----------|-------------------|
| Consumer app (broad audience) | TOTP + push notifications |
| Enterprise / high security | FIDO2 hardware keys |
| Legacy system integration | TOTP |
| Maximum security (admin accounts) | FIDO2 + biometric |
| Cost-sensitive deployment | TOTP (free authenticator apps) |

---

## Key Takeaways

- MFA combines factors from different categories (know/have/are) to drastically reduce account compromise.
- TOTP is widely supported and free but not phishing-resistant.
- FIDO2/WebAuthn provides the strongest protection — phishing-resistant and bound to the origin.
- Avoid SMS OTP where possible due to SIM swapping and interception risks.
- MFA fatigue attacks exploit push notifications; mitigate with number matching and rate limiting.

---

[Next: OAuth 2.0 & OpenID Connect](37-cybersecurity-oauth-oidc)
