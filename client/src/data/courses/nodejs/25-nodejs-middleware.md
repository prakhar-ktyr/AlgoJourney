---
title: Node.js Middleware
---

# Node.js Middleware

Middleware functions are the backbone of Express. Every request passes through a chain of middleware before a response is sent. Middleware can execute code, modify the request/response objects, end the request-response cycle, or call the next middleware.

## How middleware works

```javascript
function myMiddleware(req, res, next) {
  // Do something with req and/or res
  console.log(`${req.method} ${req.path}`);

  next(); // Pass control to the next middleware/route
}
```

A middleware function receives three arguments:
- `req` — the request object
- `res` — the response object
- `next` — a function that passes control to the next middleware

If you don't call `next()`, the request hangs — no response is ever sent.

## Application-level middleware

Use `app.use()` to apply middleware to all routes:

```javascript
import express from "express";

const app = express();

// Runs for EVERY request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Home");
});

app.listen(3000);
```

### Middleware on specific paths

```javascript
// Only runs for /api/* routes
app.use("/api", (req, res, next) => {
  console.log("API request");
  next();
});
```

## The middleware chain

Middleware runs in the **order it's defined**:

```javascript
app.use((req, res, next) => {
  console.log("1. First middleware");
  next();
});

app.use((req, res, next) => {
  console.log("2. Second middleware");
  next();
});

app.get("/", (req, res) => {
  console.log("3. Route handler");
  res.send("Done");
});
```

Output for `GET /`:

```
1. First middleware
2. Second middleware
3. Route handler
```

## Built-in middleware

Express comes with three built-in middleware functions:

### express.json()

Parses incoming JSON request bodies:

```javascript
app.use(express.json());

app.post("/api/users", (req, res) => {
  console.log(req.body); // { name: 'Alice', email: 'alice@example.com' }
  res.json(req.body);
});
```

### express.urlencoded()

Parses URL-encoded form data:

```javascript
app.use(express.urlencoded({ extended: true }));

app.post("/login", (req, res) => {
  console.log(req.body); // { username: 'alice', password: '...' }
  res.send("Logged in");
});
```

### express.static()

Serves static files (covered in the next lesson):

```javascript
app.use(express.static("public"));
```

## Third-party middleware

### cors — Cross-Origin Resource Sharing

```bash
npm install cors
```

```javascript
import cors from "cors";

app.use(cors()); // allow all origins

// Or configure specific origins
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
}));
```

### helmet — Security headers

```bash
npm install helmet
```

```javascript
import helmet from "helmet";

app.use(helmet()); // sets various security-related HTTP headers
```

### morgan — HTTP request logging

```bash
npm install morgan
```

```javascript
import morgan from "morgan";

app.use(morgan("dev"));
// Output: GET /api/users 200 4.567 ms - 123
```

### compression — Gzip compression

```bash
npm install compression
```

```javascript
import compression from "compression";

app.use(compression());
```

## Writing custom middleware

### Request logger

```javascript
function logger(req, res, next) {
  const start = Date.now();

  // Run after the response is sent
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
}

app.use(logger);
```

### Authentication middleware

```javascript
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const user = verifyToken(token); // your JWT verification
    req.user = user; // attach user to request
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Apply to specific routes
app.get("/api/profile", authenticate, (req, res) => {
  res.json(req.user);
});

// Or to all routes under a path
app.use("/api/admin", authenticate);
```

### Rate limiter

```javascript
function rateLimit(windowMs, maxRequests) {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    const timestamps = (requests.get(ip) || []).filter((t) => t > windowStart);

    if (timestamps.length >= maxRequests) {
      return res.status(429).json({ error: "Too many requests" });
    }

    timestamps.push(now);
    requests.set(ip, timestamps);
    next();
  };
}

// Max 100 requests per 15 minutes
app.use("/api", rateLimit(15 * 60 * 1000, 100));
```

### Request validation

```javascript
function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === "")) {
        errors.push(`${field} is required`);
      }

      if (rules.type && value !== undefined && typeof value !== rules.type) {
        errors.push(`${field} must be a ${rules.type}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  };
}

app.post(
  "/api/users",
  validateBody({
    name: { required: true, type: "string" },
    email: { required: true, type: "string" },
    age: { type: "number" },
  }),
  (req, res) => {
    res.status(201).json(req.body);
  },
);
```

## Error-handling middleware

Error-handling middleware has **four** parameters: `(err, req, res, next)`:

```javascript
// Regular middleware and routes above...

// Error handler — must be the LAST middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});
```

### Triggering error handlers

Pass an error to `next()`:

```javascript
app.get("/api/users/:id", async (req, res, next) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err); // goes to error handler
    }
    res.json(user);
  } catch (err) {
    next(err); // passes unexpected errors to error handler
  }
});
```

### Async error handling wrapper

```javascript
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// No try/catch needed!
app.get(
  "/api/users/:id",
  asyncHandler(async (req, res) => {
    const user = await findUser(req.params.id);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    res.json(user);
  }),
);
```

> **Note:** Express 5 handles async errors automatically without this wrapper.

## Middleware execution order

```
Request
  │
  ▼
app.use(cors())           ← 1. CORS headers
  │
  ▼
app.use(helmet())         ← 2. Security headers
  │
  ▼
app.use(morgan("dev"))    ← 3. Request logging
  │
  ▼
app.use(express.json())   ← 4. Parse JSON body
  │
  ▼
app.use("/api", auth)     ← 5. Authentication (API routes only)
  │
  ▼
app.get("/api/users")     ← 6. Route handler
  │
  ▼
app.use(notFoundHandler)  ← 7. 404 handler (if no route matched)
  │
  ▼
app.use(errorHandler)     ← 8. Error handler
  │
  ▼
Response
```

## Key takeaways

- Middleware runs in order — define it before the routes that need it.
- Always call `next()` or send a response — otherwise the request hangs.
- Use built-in middleware: `express.json()`, `express.urlencoded()`, `express.static()`.
- Error-handling middleware has 4 parameters: `(err, req, res, next)`.
- Put error handlers last.
- Use `next(err)` to forward errors to the error handler.
