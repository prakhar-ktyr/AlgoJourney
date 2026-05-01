---
title: Basic Authentication
---

# Basic Authentication

**HTTP Basic Auth** is the simplest user authentication scheme built into the HTTP protocol. It sends credentials with every request.

---

## How It Works

1. Client encodes `username:password` in Base64
2. Sends it in the `Authorization` header
3. Server decodes and verifies

```
Authorization: Basic YWxpY2U6cGFzc3dvcmQxMjM=
                      └── base64("alice:password123")
```

---

## Implementation

```javascript
import bcrypt from "bcrypt";

const users = [
  { username: "alice", passwordHash: await bcrypt.hash("password123", 10) },
];

function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.set("WWW-Authenticate", 'Basic realm="API"');
    return res.status(401).json({ error: "Authentication required" });
  }

  const base64 = authHeader.split(" ")[1];
  const decoded = Buffer.from(base64, "base64").toString();
  const [username, password] = decoded.split(":");

  const user = users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  req.user = { username: user.username };
  next();
}
```

### Client-Side

```javascript
const credentials = btoa("alice:password123");

const response = await fetch("/api/profile", {
  headers: { Authorization: `Basic ${credentials}` },
});
```

```bash
curl -u alice:password123 http://localhost:3000/api/profile
```

---

## Security Concerns

- **Base64 is NOT encryption** — anyone can decode it
- **HTTPS is mandatory** — without it, credentials are visible in plaintext
- **Credentials sent with every request** — larger attack surface
- **No logout mechanism** — credentials are cached by the browser
- **No token expiration** — valid until password changes

---

## When to Use Basic Auth

| Use Case | Recommended? |
|----------|--------------|
| Internal tools / admin panels | ✅ Acceptable |
| Server-to-server (with HTTPS) | ✅ Simple and effective |
| Public APIs | ❌ Use API keys or OAuth |
| User-facing apps | ❌ Use JWT tokens |

For most REST APIs, **JWT tokens** are a better choice. We'll cover those next.

---

## Key Takeaways

- Basic Auth sends **Base64-encoded** credentials in every request
- **Always use HTTPS** — Base64 is encoding, not encryption
- Simple to implement but limited in features
- Best for **internal tools** and **server-to-server** communication
- For user-facing APIs, prefer **JWT tokens**

---

Next, we'll learn about **Token Authentication (JWT)** — the modern standard →
