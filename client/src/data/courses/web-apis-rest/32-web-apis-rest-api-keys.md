---
title: API Keys
---

# API Keys

API keys are the simplest form of API authentication. They identify which application is making the request.

---

## How API Keys Work

```
Client sends:
GET /api/weather?city=London
X-API-Key: sk_live_abc123def456

Server checks:
1. Is this key valid?
2. Is it within rate limits?
3. Process the request
```

---

## Implementing API Keys

### Generate Keys

```javascript
import { randomBytes } from "crypto";

function generateApiKey() {
  return `sk_${randomBytes(32).toString("hex")}`;
}
// "sk_a1b2c3d4e5f6..."
```

### Middleware

```javascript
const API_KEYS = new Map([
  ["sk_live_abc123", { name: "Web App", tier: "premium" }],
  ["sk_live_def456", { name: "Mobile App", tier: "basic" }],
]);

function authenticateApiKey(req, res, next) {
  const key = req.headers["x-api-key"] || req.query.apiKey;

  if (!key) {
    return res.status(401).json({ error: "API key required" });
  }

  const client = API_KEYS.get(key);
  if (!client) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  req.client = client;
  next();
}

app.use("/api", authenticateApiKey);
```

---

## Where to Send API Keys

| Method | Example | Security |
|--------|---------|----------|
| **Header** (recommended) | `X-API-Key: sk_abc123` | Not logged in URLs |
| **Query param** | `?apiKey=sk_abc123` | ⚠️ Visible in logs, bookmarks |
| **Bearer token** | `Authorization: Bearer sk_abc123` | Standard format |

---

## API Key Security

- **Never expose** API keys in client-side code (use a backend proxy)
- **Store hashed** keys in your database (like passwords)
- Support **key rotation** (issue new key, deprecate old one)
- **Scope keys** by permission level (read-only, read-write)
- Use **HTTPS** — keys in headers are encrypted in transit

---

## Limitations

API keys identify the **application**, not the **user**. For user authentication, use JWT tokens (next lesson).

| Feature | API Key | JWT Token |
|---------|---------|-----------|
| Identifies | Application | User |
| Contains user info | No | Yes |
| Expiration | Manual | Automatic |
| Best for | Server-to-server, public APIs | User login, user-specific data |

---

## Key Takeaways

- API keys are the **simplest** authentication method
- Send keys in **headers** (not query params) for security
- Keys identify **applications**, not users
- Always use **HTTPS** when sending API keys
- For user authentication, use **JWT tokens** instead

---

Next, we'll learn about **Basic Auth** — HTTP's built-in authentication →
