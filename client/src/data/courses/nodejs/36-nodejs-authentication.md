---
title: Node.js Authentication
---

# Node.js Authentication

Authentication is verifying **who a user is**. Authorization is verifying **what they can do**. This lesson covers the core authentication mechanisms used in Node.js web applications: cookies, sessions, and tokens.

## Authentication strategies

| Strategy | How it works | Best for |
|----------|-------------|----------|
| Session-based | Server stores session data, client holds a cookie | Traditional web apps (server-rendered) |
| Token-based (JWT) | Client holds a signed token, server is stateless | APIs, SPAs, mobile apps |
| OAuth 2.0 | Delegated auth via third-party (Google, GitHub) | "Login with Google" flows |

## Cookies

Cookies are small pieces of data the server sends to the browser. The browser automatically includes them in every subsequent request.

### Setting cookies in Express

```bash
npm install cookie-parser
```

```javascript
import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());

app.get("/set-cookie", (req, res) => {
  res.cookie("username", "alice", {
    httpOnly: true,    // not accessible via JavaScript
    secure: true,      // only sent over HTTPS
    sameSite: "strict", // not sent with cross-site requests
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  });
  res.send("Cookie set");
});

app.get("/read-cookie", (req, res) => {
  const username = req.cookies.username;
  res.send(`Hello, ${username}`);
});

app.get("/clear-cookie", (req, res) => {
  res.clearCookie("username");
  res.send("Cookie cleared");
});
```

### Cookie security flags

| Flag | Purpose |
|------|---------|
| `httpOnly` | Prevents JavaScript access (blocks XSS theft) |
| `secure` | Cookie only sent over HTTPS |
| `sameSite` | `"strict"` or `"lax"` — prevents CSRF attacks |
| `maxAge` | Expiration time in milliseconds |
| `signed` | Detect tampering (requires cookie-parser secret) |

**Always set `httpOnly`, `secure`, and `sameSite`** on authentication cookies.

## Session-based authentication

Sessions store user data on the **server**. The client only holds a session ID in a cookie.

```bash
npm install express-session
```

```javascript
import express from "express";
import session from "express-session";

const app = express();
app.use(express.json());

app.use(session({
  secret: "your-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));
```

### Login / logout flow

```javascript
// Simulated user database
const users = [
  { id: 1, username: "alice", password: "$2b$10$..." }, // hashed!
];

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Compare password (covered in Password Hashing lesson)
  // const match = await bcrypt.compare(password, user.password);
  // if (!match) return res.status(401).json({ error: "Invalid credentials" });

  // Store user info in session
  req.session.userId = user.id;
  req.session.username = user.username;

  res.json({ message: "Logged in", username: user.username });
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("connect.sid"); // default session cookie name
    res.json({ message: "Logged out" });
  });
});
```

### Auth middleware

```javascript
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

app.get("/profile", requireAuth, (req, res) => {
  res.json({
    userId: req.session.userId,
    username: req.session.username,
  });
});

app.get("/dashboard", requireAuth, (req, res) => {
  res.json({ message: `Welcome, ${req.session.username}` });
});
```

### Session stores

By default, `express-session` stores sessions in memory (fine for development, not for production). For production, use a persistent store:

```bash
npm install connect-mongo
```

```javascript
import MongoStore from "connect-mongo";

app.use(session({
  secret: "your-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: "mongodb://localhost:27017/myapp",
    ttl: 24 * 60 * 60, // 1 day in seconds
  }),
  cookie: { /* ... */ },
}));
```

Other popular stores: `connect-redis`, `connect-pg-simple`.

## Session vs. Token comparison

| Feature | Sessions | Tokens (JWT) |
|---------|----------|-------------|
| State | Server-side (stateful) | Client-side (stateless) |
| Storage | Server memory / DB / Redis | Client (localStorage, cookie) |
| Scalability | Needs shared store for multiple servers | Scales easily (no server state) |
| Revocation | Easy (delete from store) | Hard (need blocklist or short expiry) |
| Size | Small cookie (just session ID) | Larger (token contains claims) |

## Complete example

```javascript
import express from "express";
import session from "express-session";

const app = express();
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  },
}));

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Please log in" });
  }
  next();
}

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // Validate credentials (simplified)
  if (username === "admin" && password === "password") {
    req.session.userId = 1;
    req.session.role = "admin";
    return res.json({ message: "Logged in" });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

app.get("/protected", requireAuth, (req, res) => {
  res.json({ message: "Secret data", userId: req.session.userId });
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out" });
});

app.listen(3000);
```

## Key takeaways

- **Cookies** are sent automatically by the browser. Set `httpOnly`, `secure`, and `sameSite` for security.
- **Sessions** store user state on the server. The client only holds a session ID cookie.
- Use **auth middleware** to protect routes — check `req.session.userId` before proceeding.
- In production, store sessions in a persistent store (Redis, MongoDB) — not in memory.
- Sessions are great for traditional web apps. For APIs and SPAs, consider **JWT** (next lesson).
