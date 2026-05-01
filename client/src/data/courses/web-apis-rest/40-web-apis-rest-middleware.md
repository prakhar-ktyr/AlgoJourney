---
title: Middleware
---

# Middleware

Middleware functions are the building blocks of Express applications. They process requests before they reach your route handlers, enabling reusable logic for logging, auth, validation, and more.

---

## How Middleware Works

```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
              │               │
           next()          next()
```

A middleware function has access to `req`, `res`, and `next`:

```javascript
function myMiddleware(req, res, next) {
  // Do something with req/res
  console.log(`${req.method} ${req.url}`);
  next(); // Pass to the next middleware/handler
}
```

If `next()` isn't called, the request hangs.

---

## Types of Middleware

### Application-Level (Every Request)

```javascript
// Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Request ID
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || crypto.randomUUID();
  res.set("X-Request-ID", req.id);
  next();
});
```

### Route-Level (Specific Routes)

```javascript
app.get("/api/admin/users", authenticate, authorize("admin"), (req, res) => {
  // Only authenticated admins reach here
});
```

### Error-Handling Middleware

Must have **four** parameters:

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: { message: err.message || "Internal server error" },
  });
});
```

---

## Common Middleware Patterns

### Authentication

```javascript
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Auth required" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
```

### Request Validation

```javascript
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Validation failed", details: result.error.issues });
    }
    req.validated = result.data;
    next();
  };
}
```

### Timing / Performance

```javascript
function timing(req, res, next) {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ns = process.hrtime.bigint() - start;
    const ms = Number(ns / 1_000_000n);
    res.set("X-Response-Time", `${ms}ms`);
  });
  next();
}
```

---

## Middleware Order Matters

```javascript
// 1. Security headers
app.use(helmet());

// 2. CORS
app.use(cors());

// 3. Body parsing
app.use(express.json());

// 4. Request logging
app.use(requestLogger);

// 5. Routes
app.use("/api/users", usersRouter);

// 6. 404 handler (after all routes)
app.use(notFoundHandler);

// 7. Error handler (last)
app.use(errorHandler);
```

---

## Third-Party Middleware

Popular middleware packages:

| Package | Purpose |
|---------|---------|
| `cors` | Cross-origin resource sharing |
| `helmet` | Security headers |
| `morgan` | Request logging |
| `compression` | Response compression |
| `express-rate-limit` | Rate limiting |
| `express-mongo-sanitize` | NoSQL injection prevention |

---

## Key Takeaways

- Middleware processes requests **before** route handlers
- Call `next()` to pass control to the next middleware
- **Order matters** — middleware runs in the order it's defined
- Error middleware must have **4 parameters** (err, req, res, next)
- Use middleware for **cross-cutting concerns** (auth, logging, validation)

---

Next, we'll learn about **Caching Strategies** — making your API faster →
