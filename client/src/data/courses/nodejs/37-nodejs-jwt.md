---
title: Node.js JWT
---

# Node.js JWT (JSON Web Tokens)

JWT is a compact, URL-safe token format that lets you transmit claims (user identity, roles, permissions) between client and server without server-side session storage. The server signs the token; the client stores and sends it back with each request.

## How JWT works

```
1. Client sends login credentials (username + password)
2. Server verifies credentials
3. Server creates a signed JWT containing user data (claims)
4. Server sends the JWT back to the client
5. Client stores the JWT (cookie or memory)
6. Client sends the JWT in the Authorization header with every request
7. Server verifies the JWT signature and extracts the claims
```

## JWT structure

A JWT has three parts separated by dots:

```
header.payload.signature
```

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDg2NDAwfQ.abc123signature
```

| Part | Contains | Encoded |
|------|----------|---------|
| Header | Algorithm and token type | Base64URL |
| Payload | Claims (user data, expiry) | Base64URL |
| Signature | HMAC or RSA signature | Binary |

The payload is **not encrypted** — anyone can decode it. The signature ensures it hasn't been tampered with.

## Installation

```bash
npm install jsonwebtoken
```

## Creating tokens

```javascript
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your-secret-key";

// Create a token
const token = jwt.sign(
  { userId: 1, role: "admin" },  // payload (claims)
  SECRET,                         // secret key
  { expiresIn: "24h" },          // options
);

console.log(token);
```

### Token options

```javascript
const token = jwt.sign(
  { userId: 1 },
  SECRET,
  {
    expiresIn: "7d",       // "1h", "30m", "7d", or seconds (3600)
    issuer: "myapp",       // who issued the token
    audience: "myapp-api", // who the token is for
    subject: "1",          // user ID as string
  },
);
```

## Verifying tokens

```javascript
try {
  const decoded = jwt.verify(token, SECRET);
  console.log(decoded);
  // { userId: 1, role: "admin", iat: 1700000000, exp: 1700086400 }
} catch (err) {
  if (err.name === "TokenExpiredError") {
    console.log("Token has expired");
  } else if (err.name === "JsonWebTokenError") {
    console.log("Invalid token");
  }
}
```

### Decoding without verification

```javascript
const decoded = jwt.decode(token);
console.log(decoded); // payload contents (NOT verified!)
```

**Never use `jwt.decode` for authentication** — it doesn't verify the signature.

## Auth middleware

```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const user = jwt.verify(token, SECRET);
    req.user = user; // attach decoded payload to request
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
```

## Role-based authorization

```javascript
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// Only admins can delete users
app.delete("/api/users/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    // delete user logic
    res.json({ message: "User deleted" });
  },
);
```

## Complete example

```javascript
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// Simulated user store
const users = [
  { id: 1, username: "alice", password: "hashed-password", role: "admin" },
];

// Login — issue token
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // In real app: await bcrypt.compare(password, user.password)

  const accessToken = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    SECRET,
    { expiresIn: "7d" },
  );

  res.json({ accessToken, refreshToken });
});

// Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token required" });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// Protected route
app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({
    userId: req.user.userId,
    username: req.user.username,
    role: req.user.role,
  });
});

// Refresh token endpoint
app.post("/api/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, SECRET);
    const user = users.find((u) => u.id === decoded.userId);

    if (!user) return res.status(403).json({ error: "User not found" });

    const newAccessToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      SECRET,
      { expiresIn: "15m" },
    );

    res.json({ accessToken: newAccessToken });
  } catch {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
});

app.listen(3000);
```

## Refresh token flow

Access tokens should be **short-lived** (15 minutes). Refresh tokens are **long-lived** (7 days) and used to get new access tokens:

```
1. Login → receive accessToken (15m) + refreshToken (7d)
2. Use accessToken for API requests
3. When accessToken expires → send refreshToken to /api/refresh
4. Receive new accessToken
5. When refreshToken expires → user must log in again
```

## Storing tokens on the client

| Location | Pros | Cons |
|----------|------|------|
| `httpOnly` cookie | Safe from XSS | Needs CSRF protection |
| Memory (variable) | Safe from XSS and CSRF | Lost on refresh |
| `localStorage` | Persists across refreshes | Vulnerable to XSS |

**Recommended**: Store access token in memory, refresh token in an `httpOnly` cookie.

## Security best practices

1. **Use strong secrets** — at least 256 bits of randomness.
2. **Short expiry** for access tokens — 15 minutes is a good default.
3. **Never put sensitive data in the payload** — it's Base64 encoded, not encrypted.
4. **Validate all claims** — check `exp`, `iss`, `aud` during verification.
5. **Use HTTPS** — tokens sent over HTTP can be intercepted.
6. **Implement token revocation** — maintain a blocklist for compromised tokens.

## Key takeaways

- JWT lets you authenticate without server-side sessions.
- Use `jwt.sign()` to create and `jwt.verify()` to validate tokens.
- Create auth middleware that extracts and verifies the token from the `Authorization` header.
- Use short-lived access tokens with longer-lived refresh tokens.
- Store tokens securely — prefer `httpOnly` cookies or in-memory storage.
