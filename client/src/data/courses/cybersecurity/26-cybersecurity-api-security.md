---
title: API Security
---

# API Security

APIs (Application Programming Interfaces) are the backbone of modern applications. They connect services, mobile apps, and third-party integrations — making them a prime target for attackers.

---

## Why API Security Matters

- APIs expose application logic and sensitive data directly
- They're often less protected than web UIs
- A single vulnerable endpoint can compromise an entire system
- API traffic now accounts for over 80% of web traffic

---

## OWASP API Security Top 10 (2023)

| # | Vulnerability | Description |
|---|---------------|-------------|
| 1 | **Broken Object Level Authorization** | Accessing other users' resources by changing IDs |
| 2 | **Broken Authentication** | Weak or missing auth mechanisms |
| 3 | **Broken Object Property Level Authorization** | Exposing or modifying restricted fields |
| 4 | **Unrestricted Resource Consumption** | No rate limiting or resource quotas |
| 5 | **Broken Function Level Authorization** | Accessing admin endpoints as regular user |
| 6 | **Unrestricted Access to Sensitive Business Flows** | Automating intended-for-humans workflows |
| 7 | **Server-Side Request Forgery (SSRF)** | Making server fetch attacker-controlled URLs |
| 8 | **Security Misconfiguration** | Default configs, verbose errors, missing headers |
| 9 | **Improper Inventory Management** | Forgotten or undocumented API endpoints |
| 10 | **Unsafe Consumption of APIs** | Trusting third-party API responses without validation |

---

## API Authentication

### API Keys

Simple but limited — treat as passwords:

```javascript
// Middleware to validate API key
function validateApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || !isValidKey(apiKey)) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  next();
}
```

### JWT (JSON Web Tokens)

Stateless authentication for APIs:

```javascript
import jwt from "jsonwebtoken";

// Generate token on login
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// Verify token middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
```

### OAuth 2.0

Delegated authorization for third-party access:

| Grant Type | Use Case |
|------------|----------|
| **Authorization Code** | Web apps with server backend |
| **PKCE** | Single-page apps and mobile |
| **Client Credentials** | Machine-to-machine |
| **Device Code** | IoT devices, CLIs |

---

## Authorization

### Broken Object Level Authorization (BOLA)

The #1 API vulnerability — checking if a user can access a specific resource:

```javascript
// WRONG — no authorization check
app.get("/api/users/:id/profile", authenticate, (req, res) => {
  const profile = await User.findById(req.params.id);
  res.json(profile);  // Any authenticated user can see any profile!
});

// RIGHT — verify ownership
app.get("/api/users/:id/profile", authenticate, (req, res) => {
  if (req.params.id !== req.user.userId && req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }
  const profile = await User.findById(req.params.id);
  res.json(profile);
});
```

### Function Level Authorization

```javascript
// Middleware for role-based access
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

app.delete("/api/users/:id", authenticate, authorize("admin"), deleteUser);
app.get("/api/reports", authenticate, authorize("admin", "analyst"), getReports);
```

---

## Rate Limiting

Prevent abuse and denial of service:

```javascript
import rateLimit from "express-rate-limit";

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per window
  standardHeaders: true,
  message: { error: "Rate limit exceeded. Try again later." }
});

// Stricter limit for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // Only 5 login attempts
  skipSuccessfulRequests: true
});

app.use("/api/", globalLimiter);
app.use("/api/auth/login", authLimiter);
```

---

## Input Validation

Never trust client input — validate everything:

```javascript
import Joi from "joi";

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(100).required(),
  age: Joi.number().integer().min(13).max(120),
  role: Joi.string().valid("user", "editor")  // No "admin" option!
});

app.post("/api/users", authenticate, (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  // Use validated `value`, not raw `req.body`
  createUser(value);
});
```

---

## REST API Security

| Practice | Implementation |
|----------|---------------|
| **Use HTTPS only** | Redirect HTTP to HTTPS |
| **Version your API** | `/api/v1/` — deprecate old versions |
| **Limit response data** | Don't return fields users shouldn't see |
| **Pagination** | Prevent returning millions of records |
| **Disable unused methods** | Block TRACE, OPTIONS if not needed |
| **CORS** | Restrict allowed origins |

```javascript
// Filter response data
function sanitizeUser(user) {
  const { password, resetToken, ...safe } = user.toObject();
  return safe;  // Never expose password hash or internal tokens
}
```

---

## GraphQL Security

GraphQL has unique security concerns:

| Risk | Prevention |
|------|-----------|
| **Introspection exposure** | Disable in production |
| **Query depth attacks** | Set max depth limit |
| **Batch attacks** | Limit number of operations per request |
| **Field-level access** | Implement per-field authorization |

```javascript
import depthLimit from "graphql-depth-limit";
import { createComplexityLimitRule } from "graphql-validation-complexity";

const server = new ApolloServer({
  schema,
  validationRules: [
    depthLimit(5),                    // Max query depth
    createComplexityLimitRule(1000)   // Max query complexity
  ],
  introspection: process.env.NODE_ENV !== "production"
});
```

---

## API Security Headers

```javascript
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'none'",
    "Strict-Transport-Security": "max-age=31536000"
  });
  next();
});
```

---

## API Security Checklist

- [ ] Authenticate all endpoints (except public ones)
- [ ] Implement object-level authorization
- [ ] Validate and sanitize all input
- [ ] Rate limit all endpoints
- [ ] Use HTTPS only
- [ ] Don't expose sensitive data in responses
- [ ] Log all API access for auditing
- [ ] Disable unnecessary HTTP methods
- [ ] Version your API and deprecate old versions
- [ ] Monitor for anomalous usage patterns

---

## Key Takeaways

- APIs are the #1 attack surface for modern applications
- **BOLA** (accessing other users' data) is the most common API flaw
- Always authenticate AND authorize every request
- **Rate limiting** prevents brute force and DoS attacks
- Validate all input with schemas — reject anything unexpected
- GraphQL needs depth limits and complexity analysis
- Never expose internal data in API responses
- Log and monitor API usage for security analysis

---

Next, we'll learn about **Web Application Firewalls** →
