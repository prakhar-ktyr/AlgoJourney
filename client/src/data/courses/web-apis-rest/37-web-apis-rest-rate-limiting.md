---
title: Rate Limiting
---

# Rate Limiting

Rate limiting protects your API from abuse, prevents denial-of-service attacks, and ensures fair usage across all clients.

---

## How It Works

Track the number of requests per client within a time window:

```
Client makes 100 requests in 15 minutes
  → Requests 1-100: 200 OK
  → Request 101: 429 Too Many Requests
  → Wait for window to reset, then continue
```

---

## Implementation with express-rate-limit

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from "express-rate-limit";

// Global rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per window
  standardHeaders: true,       // Return rate limit info in headers
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again later",
    retryAfter: 15 * 60,
  },
});

app.use("/api", limiter);
```

### Different Limits for Different Endpoints

```javascript
// Strict limit for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts" },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Generous limit for read operations
const readLimiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
app.use("/api/posts", readLimiter);

// Strict limit for write operations
const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
app.post("/api/posts", writeLimiter);
```

---

## Rate Limit Headers

Standard headers inform clients about their usage:

```
HTTP/1.1 200 OK
RateLimit-Limit: 100
RateLimit-Remaining: 97
RateLimit-Reset: 1705311600

HTTP/1.1 429 Too Many Requests
Retry-After: 900
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1705311600
```

---

## Rate Limiting by User

```javascript
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    // Rate limit by authenticated user, falling back to IP
    return req.user?.userId || req.ip;
  },
});
```

---

## Tiered Rate Limits

Different limits for different API tiers:

```javascript
const tierLimits = { free: 100, basic: 500, premium: 5000 };

const tieredLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => tierLimits[req.client?.tier] || tierLimits.free,
  keyGenerator: (req) => req.client?.id || req.ip,
});
```

---

## Key Takeaways

- Rate limiting **protects** your API from abuse and ensures fairness
- Use **express-rate-limit** for easy implementation
- Apply **stricter limits** to auth endpoints
- Include **rate limit headers** so clients can manage their usage
- Rate limit by **user** when possible, fall back to **IP**
- Consider **tiered limits** for different subscription levels

---

Next, we'll learn about **Input Sanitization** — preventing injection attacks →
