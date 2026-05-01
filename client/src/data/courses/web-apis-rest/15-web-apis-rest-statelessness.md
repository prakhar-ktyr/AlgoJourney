---
title: Statelessness
---

# Statelessness

Statelessness is the most important REST constraint for building scalable APIs. It means every request must contain **all the information** the server needs to process it.

---

## What Does Stateless Mean?

The server **does not store any client context** between requests. Each request is independent and self-contained.

```
Stateful server:
  Request 1: POST /login → Server stores: "User Alice is logged in"
  Request 2: GET /profile → Server looks up: "Who's logged in? Oh, Alice"

Stateless server:
  Request 1: POST /login → Server returns: { token: "eyJhbGci..." }
  Request 2: GET /profile + Authorization: Bearer eyJhbGci...
             → Server reads token: "This request is from Alice"
```

---

## Why Statelessness Matters

### 1. Scalability

With stateless servers, any server can handle any request:

```
                   ┌── Server A ──┐
Client ──▶ Load   ├── Server B ──┤ ──▶ Database
           Balancer└── Server C ──┘

Request 1 → Server A ✅
Request 2 → Server C ✅  (any server works)
Request 3 → Server B ✅
```

With stateful servers, you need **sticky sessions** — each client must always hit the same server:

```
Client 1 ──▶ always Server A  (if Server A dies, session is lost!)
Client 2 ──▶ always Server B
```

### 2. Reliability

If a stateless server crashes, another server picks up the next request seamlessly. No session data is lost.

### 3. Simplicity

No session management, no session storage, no session cleanup.

---

## Implementing Statelessness

### Authentication: JWTs

Instead of server-side sessions, use **JSON Web Tokens** (JWTs):

```javascript
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

// Login — issue a token
app.post("/api/login", async (req, res) => {
  const user = await findUser(req.body.email);
  if (!user || !verifyPassword(req.body.password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    SECRET,
    { expiresIn: "24h" }
  );

  res.json({ token });
});

// Protected route — verify token from request
app.get("/api/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const payload = jwt.verify(token, SECRET);
    // payload = { userId: 42, role: "admin", iat: ..., exp: ... }
    res.json({ userId: payload.userId, role: payload.role });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});
```

The token **contains** the user's identity. The server doesn't need to look up a session.

### Pagination: Cursor in Request

```
GET /api/posts?cursor=eyJpZCI6MTAwfQ&limit=20
```

The cursor contains all state needed to fetch the next page. The server doesn't remember where the client left off.

### Filtering: All Params in URL

```
GET /api/products?category=electronics&minPrice=50&sort=-rating&page=2
```

Every parameter is in the URL. The server has everything it needs.

---

## What About Databases?

Statelessness refers to **client session state**, not application data. The server still uses databases:

```
Stateless = No per-client session stored on the server

These are fine:
✅ Storing user records in a database
✅ Saving orders, posts, comments
✅ Logging requests

These violate statelessness:
❌ In-memory session store (express-session with MemoryStore)
❌ Global variables tracking "current user"
❌ Server-side shopping carts per session
```

---

## Session Data Alternatives

| Stateful Approach | Stateless Alternative |
|------------------|----------------------|
| Server-side session | JWT token |
| Session-stored cart | Database-stored cart (linked to userId) |
| Server remembers last page | Client sends cursor/offset |
| Session-stored form data | Client sends all data on submit |
| Session-stored preferences | Client stores in localStorage |

---

## Tradeoffs

Statelessness has some costs:

| Benefit | Tradeoff |
|---------|----------|
| Scalable | Tokens are larger than session IDs |
| Reliable | Can't revoke JWTs instantly (without a blocklist) |
| Simple server | Client must send more data per request |
| No session store | Repeated data in every request |

For most APIs, the benefits far outweigh the costs.

---

## Key Takeaways

- **Stateless** means no client session state on the server
- Use **JWT tokens** instead of server-side sessions
- Put all context in the **request** (headers, query params, body)
- Statelessness enables **horizontal scaling** and **reliability**
- Database storage is fine — statelessness is about **session state**

---

Next, we'll learn about **HATEOAS** — the REST constraint that makes APIs self-describing →
