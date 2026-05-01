---
title: Node.js Best Practices
---

# Node.js Best Practices

This final lesson brings together everything you've learned into a comprehensive set of best practices for building production-quality Node.js applications.

## Code quality

### Use strict mode and ESM

```json
// package.json
{
  "type": "module"
}
```

ESM (`import`/`export`) is the standard. It enables tree-shaking, static analysis, and top-level `await`.

### Use const by default

```javascript
// Prefer const
const port = 3000;
const users = [];

// Use let only when reassignment is needed
let count = 0;
count++;

// Never use var
```

### Use async/await over callbacks

```javascript
// BAD — callback hell
readFile("a.txt", (err, a) => {
  readFile("b.txt", (err, b) => {
    readFile("c.txt", (err, c) => {
      // nested nightmare
    });
  });
});

// GOOD — async/await
const a = await readFile("a.txt", "utf-8");
const b = await readFile("b.txt", "utf-8");
const c = await readFile("c.txt", "utf-8");

// BETTER — parallel when independent
const [a, b, c] = await Promise.all([
  readFile("a.txt", "utf-8"),
  readFile("b.txt", "utf-8"),
  readFile("c.txt", "utf-8"),
]);
```

### Handle all errors

```javascript
// Always catch async errors
try {
  await riskyOperation();
} catch (err) {
  logger.error("Operation failed:", err);
}

// Always handle promise rejections
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection:", reason);
  process.exit(1);
});
```

### Use early returns

```javascript
// BAD — deep nesting
function processUser(user) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        // actual logic
      }
    }
  }
}

// GOOD — guard clauses
function processUser(user) {
  if (!user) return;
  if (!user.isActive) return;
  if (!user.hasPermission) return;

  // actual logic (no nesting)
}
```

## Security

### The essential security stack

```javascript
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();

// Security headers
app.use(helmet());

// CORS — whitelist specific origins
app.use(cors({
  origin: ["https://myapp.com"],
  credentials: true,
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

// Body size limits
app.use(express.json({ limit: "10kb" }));
```

### Never trust user input

```javascript
// Validate all input
import { body, param, query } from "express-validator";

app.get("/api/users",
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
  getUsers,
);

app.post("/api/users",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("name").trim().escape().notEmpty(),
  handleValidationErrors,
  createUser,
);
```

### Secrets management

```javascript
// config.js — validate at startup
function required(name) {
  if (!process.env[name]) {
    console.error(`FATAL: Missing env var ${name}`);
    process.exit(1);
  }
  return process.env[name];
}

export const config = {
  jwtSecret: required("JWT_SECRET"),
  dbUrl: required("DATABASE_URL"),
};
```

## Performance

### Use async operations

```javascript
// BAD — blocks the event loop
import { readFileSync } from "node:fs";
const data = readFileSync("large-file.txt"); // blocks!

// GOOD — non-blocking
import { readFile } from "node:fs/promises";
const data = await readFile("large-file.txt");
```

### Use streams for large data

```javascript
// BAD — loads entire file into memory
const data = await readFile("huge-file.csv", "utf-8");
processData(data); // might crash with large files

// GOOD — process chunk by chunk
import { createReadStream } from "node:fs";

const stream = createReadStream("huge-file.csv", "utf-8");
stream.on("data", (chunk) => {
  processChunk(chunk);
});
```

### Cache expensive operations

```javascript
const cache = new Map();

async function getUser(id) {
  if (cache.has(id)) {
    return cache.get(id);
  }

  const user = await User.findById(id);
  cache.set(id, user);

  // Auto-expire after 5 minutes
  setTimeout(() => cache.delete(id), 5 * 60 * 1000);

  return user;
}
```

### Use connection pooling

```javascript
// MongoDB — Mongoose manages a pool automatically
await mongoose.connect(dbUrl, {
  maxPoolSize: 10,
});

// MySQL — create a pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  database: "myapp",
});
```

### Parallelize independent operations

```javascript
// BAD — sequential (slow)
const user = await getUser(id);
const posts = await getPosts(id);
const notifications = await getNotifications(id);

// GOOD — parallel (fast)
const [user, posts, notifications] = await Promise.all([
  getUser(id),
  getPosts(id),
  getNotifications(id),
]);
```

## Error handling

### Centralized error handler

```javascript
// utils/AppError.js
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  // Log the error
  if (!err.isOperational) {
    console.error("UNEXPECTED ERROR:", err);
  }

  res.status(err.statusCode || 500).json({
    error: err.isOperational
      ? err.message
      : "Internal server error",
  });
}
```

### Graceful shutdown

```javascript
const server = app.listen(config.port);

async function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);

  server.close(async () => {
    await mongoose.connection.close();
    console.log("Clean shutdown complete");
    process.exit(0);
  });

  // Force close after timeout
  setTimeout(() => process.exit(1), 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
```

## Testing

### Write tests for everything important

```javascript
// Unit test
it("calculates order total with tax", () => {
  const total = calculateTotal(100, 0.1);
  expect(total).toBe(110);
});

// Integration test
it("creates a user via API", async () => {
  const res = await request(app)
    .post("/api/users")
    .send({ name: "Alice", email: "alice@test.com", password: "12345678" });

  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty("id");
});
```

### Test structure

```javascript
describe("UserService", () => {
  // Setup
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("createUser", () => {
    it("creates a user with valid data", async () => { /* ... */ });
    it("rejects duplicate email", async () => { /* ... */ });
    it("rejects short password", async () => { /* ... */ });
  });
});
```

## Logging

### Use structured logging

```javascript
// BAD
console.log("User created: " + user.email);

// GOOD — structured, parseable
console.log(JSON.stringify({
  event: "user_created",
  email: user.email,
  userId: user.id,
  timestamp: new Date().toISOString(),
}));
```

### Use log levels

```javascript
// Simple logger
const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || "info"];

const logger = {
  error: (...args) => currentLevel >= 0 && console.error("[ERROR]", ...args),
  warn: (...args) => currentLevel >= 1 && console.warn("[WARN]", ...args),
  info: (...args) => currentLevel >= 2 && console.log("[INFO]", ...args),
  debug: (...args) => currentLevel >= 3 && console.log("[DEBUG]", ...args),
};

logger.info("Server started");
logger.error("Database connection failed", err.message);
```

## Project organization

### Keep entry point thin

```javascript
// server.js — setup only
import app from "./app.js";
import { connectDB } from "./config/database.js";
import config from "./config/index.js";

await connectDB();
app.listen(config.port, () => {
  console.log(`Server on port ${config.port}`);
});
```

### Separate app from server

```javascript
// app.js — Express setup (exportable for tests)
import express from "express";
// ... middleware, routes, error handler

export default app;
```

## Production checklist

- [ ] `NODE_ENV=production`
- [ ] All secrets in environment variables
- [ ] `npm audit` passes with no critical issues
- [ ] Rate limiting on all public routes
- [ ] Input validation on all endpoints
- [ ] HTTPS enabled
- [ ] CORS configured (not `*`)
- [ ] Helmet enabled
- [ ] Error messages don't leak internals
- [ ] Graceful shutdown handles SIGTERM
- [ ] Health check endpoint exists
- [ ] Logging is structured and searchable
- [ ] Tests pass with good coverage
- [ ] PM2 or Docker for process management

## What's next?

Congratulations on completing this Node.js course! You've gone from the basics of what Node.js is to building production-ready applications with authentication, databases, security, testing, and deployment.

Here are some areas to explore next:

- **GraphQL** with Apollo Server — alternative API paradigm
- **TypeScript** — add static types for larger projects
- **Microservices** — split large apps into smaller services
- **Message queues** — RabbitMQ or Redis for background jobs
- **Serverless** — AWS Lambda, Vercel Functions
- **ORMs** — Prisma or Drizzle for type-safe database queries
- **Monitoring** — Prometheus, Grafana, or Datadog

Keep building, keep learning, and keep shipping.
