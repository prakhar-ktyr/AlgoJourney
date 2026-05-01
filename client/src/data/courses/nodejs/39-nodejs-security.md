---
title: Node.js Security
---

# Node.js Security

Web application security is not optional. A single vulnerability can expose user data, allow unauthorized access, or take down your server. This lesson covers the most important security practices for Node.js applications, aligned with the OWASP Top 10.

## Helmet — secure HTTP headers

Helmet sets security-related HTTP headers that protect against common attacks:

```bash
npm install helmet
```

```javascript
import express from "express";
import helmet from "helmet";

const app = express();
app.use(helmet());
```

Headers Helmet sets:

| Header | Protection |
|--------|-----------|
| `Content-Security-Policy` | Prevents XSS, data injection |
| `X-Content-Type-Options: nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options: SAMEORIGIN` | Prevents clickjacking |
| `Strict-Transport-Security` | Forces HTTPS |
| `X-XSS-Protection` | Legacy XSS filter |
| `Referrer-Policy` | Controls referrer info sent |

## Rate limiting

Prevent brute-force attacks and abuse:

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from "express-rate-limit";

// General limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // max 100 requests per window
  message: { error: "Too many requests, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // only 5 login attempts per 15 minutes
  message: { error: "Too many login attempts" },
});
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);
```

## Input validation

Never trust user input. Validate and sanitize everything:

```bash
npm install express-validator
```

```javascript
import { body, validationResult } from "express-validator";

app.post("/api/register",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }).trim(),
  body("name").notEmpty().trim().escape(), // escape HTML entities
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Input is validated and sanitized
    const { email, password, name } = req.body;
    // ... create user
  },
);
```

### Common validation rules

```javascript
body("age").isInt({ min: 0, max: 150 });
body("url").isURL();
body("username").isAlphanumeric().isLength({ min: 3, max: 30 });
body("role").isIn(["user", "admin", "moderator"]);
body("bio").optional().isLength({ max: 500 }).trim().escape();
```

## SQL injection prevention

If you use SQL databases, **always use parameterized queries**:

```javascript
// DANGEROUS — SQL injection!
const query = `SELECT * FROM users WHERE email = '${email}'`;

// SAFE — parameterized query
const [rows] = await pool.execute(
  "SELECT * FROM users WHERE email = ?",
  [email],
);
```

With Mongoose/MongoDB, use strict schemas and avoid passing raw `$` operators from user input:

```javascript
// DANGEROUS — NoSQL injection
const user = await User.findOne({ email: req.body.email });
// If email is { "$gt": "" }, this returns the first user!

// SAFE — validate input type first
if (typeof req.body.email !== "string") {
  return res.status(400).json({ error: "Invalid email" });
}
const user = await User.findOne({ email: req.body.email });
```

## XSS (Cross-Site Scripting) prevention

XSS attacks inject malicious scripts into your pages:

```javascript
// DANGEROUS — rendering user input as HTML
res.send(`<h1>Hello, ${req.query.name}</h1>`);
// If name = <script>steal(cookies)</script>, it executes!

// SAFE — escape HTML
import { escape } from "node:querystring";
res.send(`<h1>Hello, ${escape(req.query.name)}</h1>`);
```

Prevention:

1. **Escape output** — never render raw user input as HTML.
2. **Content Security Policy** (via Helmet) — blocks inline scripts.
3. **httpOnly cookies** — prevents JavaScript access to auth cookies.
4. React, by default, escapes JSX output — but `dangerouslySetInnerHTML` bypasses this.

## CSRF (Cross-Site Request Forgery) prevention

CSRF tricks a logged-in user into making unintended requests:

```bash
npm install csrf-csrf
```

```javascript
import { doubleCsrf } from "csrf-csrf";

const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: "__csrf",
  cookieOptions: { httpOnly: true, sameSite: "strict", secure: true },
});

app.use(doubleCsrfProtection);

// Endpoint to get CSRF token
app.get("/api/csrf-token", (req, res) => {
  res.json({ token: generateToken(req, res) });
});
```

For APIs with JWT authentication, CSRF is less of a concern (tokens aren't sent automatically like cookies).

## CORS (Cross-Origin Resource Sharing)

Control which domains can access your API:

```javascript
import cors from "cors";

// Allow specific origins
app.use(cors({
  origin: ["https://myapp.com", "https://admin.myapp.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // allow cookies
}));

// Dynamic origin
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ["https://myapp.com"];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));
```

**Never use `cors({ origin: "*" })` with `credentials: true`.**

## Request size limits

Prevent denial-of-service via huge payloads:

```javascript
app.use(express.json({ limit: "10kb" }));    // limit JSON body
app.use(express.urlencoded({ limit: "10kb", extended: true }));
```

## Dependency security

```bash
# Check for known vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Check outdated packages
npm outdated
```

Run `npm audit` regularly and in your CI pipeline.

## Environment security

```javascript
// Never expose stack traces in production
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
});
```

## Security checklist

| Area | Action |
|------|--------|
| Headers | Use Helmet |
| Rate limiting | Limit requests per IP, especially auth routes |
| Input validation | Validate and sanitize all user input |
| SQL/NoSQL injection | Use parameterized queries, validate types |
| XSS | Escape output, use CSP, httpOnly cookies |
| CSRF | Use sameSite cookies or CSRF tokens |
| CORS | Whitelist specific origins |
| Passwords | Hash with bcrypt (never plain text) |
| Auth tokens | Short expiry, HTTPS only, httpOnly cookies |
| Dependencies | Run `npm audit` regularly |
| Errors | Never expose stack traces in production |
| HTTPS | Use TLS in production |

## Key takeaways

- Security is a **layered** approach — no single measure is enough.
- Use **Helmet** for secure headers, **rate limiting** for brute-force protection.
- **Validate all input** with express-validator or similar.
- **Parameterize queries** to prevent injection attacks.
- Run `npm audit` regularly and keep dependencies updated.
- In production, hide error details and always use HTTPS.
