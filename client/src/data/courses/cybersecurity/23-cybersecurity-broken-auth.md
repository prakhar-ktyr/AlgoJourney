---
title: Broken Authentication
---

# Broken Authentication

Broken authentication occurs when application functions related to authentication and session management are implemented incorrectly, allowing attackers to compromise passwords, keys, or session tokens.

---

## Why Authentication Breaks

Authentication is complex — there are many ways it can fail:

| Vulnerability | Description |
|---------------|-------------|
| **Weak passwords** | No complexity requirements or length minimums |
| **Credential stuffing** | Using leaked credentials from other breaches |
| **Brute force** | Automated guessing with no rate limiting |
| **Session fixation** | Attacker sets the victim's session ID |
| **Insecure storage** | Passwords stored in plain text or weak hashes |
| **Missing MFA** | Single factor easily compromised |
| **Predictable tokens** | Session IDs or reset tokens that can be guessed |

---

## Attack Scenarios

### 1. Credential Stuffing

Attackers use lists of stolen username/password pairs from data breaches:

```
// Attacker has millions of leaked credentials:
admin@company.com : Password123
john.doe@email.com : Summer2024!
jane@example.com : qwerty123

// Automated tool tries each against your login page
// ~0.5-2% success rate (people reuse passwords)
```

### 2. Brute Force Attack

Systematically trying all possible passwords:

```python
# Simple brute force (attacker's perspective)
import requests

passwords = open("rockyou.txt").readlines()  # 14 million common passwords

for password in passwords:
    response = requests.post("https://target.com/login", data={
        "username": "admin",
        "password": password.strip()
    })
    if "Welcome" in response.text:
        print(f"Found: {password}")
        break
```

### 3. Session Fixation

Attacker forces a known session ID onto the victim:

```
1. Attacker gets a valid session: SESSIONID=abc123
2. Attacker sends victim: https://app.com/login?SESSIONID=abc123
3. Victim logs in — server authenticates session abc123
4. Attacker uses abc123 — now authenticated as victim
```

### 4. Password Reset Flaws

```
// Weak reset tokens
https://app.com/reset?token=1001  // Sequential — easily guessed
https://app.com/reset?token=base64(user@email.com)  // Predictable

// No expiration — token works forever
// No invalidation — old tokens still work after password change
```

---

## Prevention Strategies

### 1. Strong Password Policies

```javascript
function validatePassword(password) {
  const checks = {
    minLength: password.length >= 12,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
    notCommon: !commonPasswords.includes(password)
  };

  return Object.values(checks).every(Boolean);
}
```

| Requirement | Recommendation |
|-------------|---------------|
| Minimum length | 12+ characters |
| Complexity | Mix of character types |
| Breach check | Compare against known leaked passwords |
| No restrictions | Allow all printable characters |
| Passphrases | Encourage "correct-horse-battery-staple" style |

### 2. Multi-Factor Authentication (MFA)

Add a second verification factor:

| Factor Type | Examples |
|-------------|----------|
| **Something you know** | Password, PIN |
| **Something you have** | Phone, hardware key, authenticator app |
| **Something you are** | Fingerprint, face recognition |

```javascript
// TOTP (Time-based One-Time Password) verification
import speakeasy from "speakeasy";

function verifyTOTP(secret, userToken) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: userToken,
    window: 1  // Allow 30 seconds clock skew
  });
}
```

### 3. Account Lockout & Rate Limiting

```javascript
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts per window
  message: "Too many login attempts. Try again in 15 minutes.",
  standardHeaders: true
});

app.post("/login", loginLimiter, handleLogin);
```

Progressive delays:

| Attempt | Delay |
|---------|-------|
| 1-3 | No delay |
| 4-5 | 5 seconds |
| 6-8 | 30 seconds |
| 9-10 | 5 minutes |
| 11+ | Account locked for 30 minutes |

### 4. Secure Session Management

```javascript
import session from "express-session";

app.use(session({
  secret: process.env.SESSION_SECRET,
  name: "__Host-session",  // Cookie prefix for extra security
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 30 * 60 * 1000  // 30 minutes
  }
}));

// Regenerate session after login (prevent fixation)
app.post("/login", (req, res) => {
  authenticate(req.body, (err, user) => {
    if (user) {
      req.session.regenerate(() => {  // New session ID
        req.session.userId = user.id;
        res.redirect("/dashboard");
      });
    }
  });
});
```

### 5. Secure Password Storage

```javascript
import bcrypt from "bcrypt";

// Hashing (during registration)
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// Verification (during login)
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

| Algorithm | Status | Notes |
|-----------|--------|-------|
| **bcrypt** | Recommended | Adaptive, built-in salt |
| **Argon2** | Recommended | Memory-hard, modern |
| **scrypt** | Good | Memory-hard |
| **PBKDF2** | Acceptable | If bcrypt/Argon2 unavailable |
| **SHA-256** | Insufficient | Too fast, no salt |
| **MD5** | Broken | Never use for passwords |

---

## Secure Password Reset Flow

1. User requests reset → generate cryptographically random token
2. Store hashed token with expiration (15-30 minutes)
3. Send reset link via verified email
4. User submits new password with token
5. Verify token hash and expiration
6. Update password, invalidate token, invalidate all sessions

```javascript
import crypto from "crypto";

function generateResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const expiry = Date.now() + 30 * 60 * 1000; // 30 minutes
  return { token, hashedToken, expiry };
}
```

---

## Key Takeaways

- Broken authentication is consistently in the OWASP Top 10
- **Credential stuffing** exploits password reuse across sites
- Always hash passwords with **bcrypt** or **Argon2** — never plain text
- Implement **rate limiting** and **account lockout** against brute force
- **Regenerate session IDs** after login to prevent fixation
- **MFA** dramatically reduces account compromise risk
- Password reset tokens must be random, hashed, and time-limited

---

Next, we'll learn about **Security Misconfiguration** →
