---
title: Input Sanitization & Security
---

# Input Sanitization & Security

Protecting your API from common attacks — injection, XSS, and other vulnerabilities from the OWASP Top 10.

---

## NoSQL Injection

MongoDB is vulnerable to operator injection:

```javascript
// ❌ Vulnerable — attacker sends { "$gt": "" } as password
app.post("/api/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password, // Could be { "$gt": "" } → matches all!
  });
});

// ✅ Safe — validate types
app.post("/api/login", async (req, res) => {
  if (typeof req.body.email !== "string" || typeof req.body.password !== "string") {
    return res.status(400).json({ error: "Invalid input" });
  }
  // Now safe to query
});
```

Use `express-mongo-sanitize`:

```bash
npm install express-mongo-sanitize
```

```javascript
import mongoSanitize from "express-mongo-sanitize";
app.use(mongoSanitize()); // Strips $ and . from req.body, req.query, req.params
```

---

## XSS Prevention

Prevent stored XSS by sanitizing HTML:

```javascript
// ❌ User submits: <script>alert('hacked')</script> as their name
// If rendered in a page, it executes

// ✅ Escape HTML entities
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

Set security headers with `helmet`:

```bash
npm install helmet
```

```javascript
import helmet from "helmet";
app.use(helmet());
// Sets X-Content-Type-Options, X-Frame-Options, CSP, etc.
```

---

## Request Size Limits

Prevent large payload attacks:

```javascript
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "500kb", extended: true }));
```

---

## Parameter Pollution

Prevent HTTP parameter pollution:

```bash
npm install hpp
```

```javascript
import hpp from "hpp";
app.use(hpp()); // Uses last value if param is duplicated

// GET /api/users?sort=name&sort=evil → req.query.sort = "evil" (not array)
```

---

## Security Checklist

```
✅ Use HTTPS everywhere
✅ Validate and sanitize all input
✅ Use parameterized queries (Mongoose handles this)
✅ Set security headers (helmet)
✅ Rate limit all endpoints
✅ Hash passwords with bcrypt (cost factor 12+)
✅ Use strong JWT secrets (256+ bits)
✅ Set short token expiration
✅ Don't expose stack traces in production
✅ Don't expose sensitive fields (passwords, tokens)
✅ Remove X-Powered-By header
✅ Keep dependencies updated
```

---

## Key Takeaways

- **Validate types** to prevent NoSQL injection
- Use `express-mongo-sanitize` to strip MongoDB operators
- Use `helmet` for security headers
- **Limit request body size** to prevent DoS
- **Escape HTML** in user-generated content
- Follow the **OWASP Top 10** as your security baseline

---

Next, we'll learn about **HTTPS & TLS** — encrypting API communication →
