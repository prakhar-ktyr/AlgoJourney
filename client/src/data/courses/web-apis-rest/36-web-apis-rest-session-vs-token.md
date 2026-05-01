---
title: Session vs Token Authentication
---

# Session vs Token Authentication

Two fundamentally different approaches to keeping users logged in. Each has tradeoffs — choosing the right one depends on your architecture.

---

## Session-Based Authentication

```
1. User logs in → Server creates a session (stored in memory/DB)
2. Server sends session ID in a cookie
3. Browser sends cookie with every request
4. Server looks up session to identify user
```

```javascript
import session from "express-session";

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
}));

app.post("/api/auth/login", async (req, res) => {
  const user = await verifyCredentials(req.body);
  req.session.userId = user.id; // Store in session
  res.json({ message: "Logged in" });
});

app.get("/api/profile", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Not logged in" });
  // Look up user by session data
});
```

## Token-Based Authentication (JWT)

```
1. User logs in → Server creates and returns a JWT
2. Client stores token (localStorage or memory)
3. Client sends token in Authorization header
4. Server verifies token signature (no lookup needed)
```

---

## Comparison

| Feature | Sessions | Tokens (JWT) |
|---------|----------|-------------|
| **Storage** | Server-side (memory/Redis/DB) | Client-side |
| **Stateless** | No (server must store sessions) | Yes |
| **Scalability** | Needs shared session store | Any server can verify |
| **Revocation** | Easy (delete session) | Hard (need blocklist) |
| **Mobile support** | Poor (cookies are web-only) | Excellent |
| **Cross-domain** | Requires cookie config | Works anywhere |
| **CSRF risk** | Yes (cookies auto-sent) | No (manual header) |
| **XSS risk** | Lower (httpOnly cookies) | Higher (if in localStorage) |

---

## When to Use Each

### Sessions
- Traditional **server-rendered** web apps
- When you need **instant revocation** (logout, ban user)
- Single-domain apps

### Tokens (JWT)
- **REST APIs** consumed by multiple clients
- **Mobile apps** and **SPAs**
- **Microservices** architecture
- **Cross-domain** authentication

### Hybrid Approach

Use **refresh tokens** (stored as httpOnly cookies) + **short-lived access tokens** (JWT):

```javascript
// Login — issue both tokens
app.post("/api/auth/login", async (req, res) => {
  const user = await verifyCredentials(req.body);

  const accessToken = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

  // Store refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
});

// Refresh — get new access token
app.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const accessToken = jwt.sign({ userId: payload.userId }, SECRET, { expiresIn: "15m" });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});
```

---

## Key Takeaways

- **Sessions** store state on the server; **tokens** store state on the client
- Tokens are better for **REST APIs**, **mobile**, and **microservices**
- Sessions are simpler for **traditional web apps** with instant revocation needs
- The **hybrid approach** (refresh + access tokens) combines the best of both
- For REST APIs, **JWT tokens** are the recommended choice

---

Next, we'll learn about **Rate Limiting** — protecting your API from abuse →
