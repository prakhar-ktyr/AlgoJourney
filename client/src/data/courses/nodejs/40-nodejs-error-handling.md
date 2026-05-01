---
title: Node.js Error Handling
---

# Node.js Error Handling

Errors are inevitable. Unhandled errors crash your server, lose user data, and expose internals. Proper error handling keeps your app running, gives users clear feedback, and helps you debug quickly.

## Error types in Node.js

| Type | Example | Cause |
|------|---------|-------|
| `SyntaxError` | Unexpected token | Invalid JavaScript |
| `ReferenceError` | Variable not defined | Using undeclared variable |
| `TypeError` | Cannot read property of undefined | Wrong type operation |
| `RangeError` | Maximum call stack exceeded | Infinite recursion |
| `Error` | Custom application errors | Your throw statements |
| System errors | `ENOENT`, `ECONNREFUSED` | OS / network issues |

## try/catch

Handle synchronous and async errors:

```javascript
// Synchronous
try {
  const data = JSON.parse("invalid json");
} catch (err) {
  console.error("Parse error:", err.message);
}

// Async/await
try {
  const data = await readFile("config.json", "utf-8");
  const config = JSON.parse(data);
} catch (err) {
  if (err.code === "ENOENT") {
    console.error("File not found");
  } else {
    console.error("Error:", err.message);
  }
} finally {
  // Always runs — cleanup code
  console.log("Done");
}
```

## Error objects

```javascript
const err = new Error("Something went wrong");

console.log(err.message);  // "Something went wrong"
console.log(err.name);     // "Error"
console.log(err.stack);    // Full stack trace
```

### Custom error classes

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true; // expected error (vs. programming bug)
  }
}

class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Not authenticated") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}
```

Usage:

```javascript
const user = await User.findById(id);
if (!user) {
  throw new NotFoundError("User");
}
```

## Express error handling

### Throwing errors in route handlers

With Express 5, async errors are caught automatically:

```javascript
app.get("/api/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError("User"); // Express 5 catches this
  }
  res.json(user);
});
```

With Express 4, you need to pass errors to `next()`:

```javascript
app.get("/api/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError("User");
    res.json(user);
  } catch (err) {
    next(err); // pass to error middleware
  }
});
```

### Error middleware

Express error middleware has **four** parameters `(err, req, res, next)`:

```javascript
// 404 handler — no route matched
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler — must be last
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Operational error (expected)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate entry" });
  }

  // Unknown error — don't leak details in production
  res.status(500).json({
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
});
```

## Async error patterns

### Promise .catch()

```javascript
fetchData()
  .then((data) => processData(data))
  .then((result) => saveResult(result))
  .catch((err) => {
    console.error("Pipeline failed:", err.message);
  });
```

### Promise.allSettled

When you want all results regardless of failures:

```javascript
const results = await Promise.allSettled([
  fetchUser(1),
  fetchUser(2),
  fetchUser(999), // might fail
]);

results.forEach((result, i) => {
  if (result.status === "fulfilled") {
    console.log(`User ${i}:`, result.value);
  } else {
    console.error(`User ${i} failed:`, result.reason.message);
  }
});
```

## Process-level error handling

Catch errors that escape all other handlers:

```javascript
// Unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  // Log to error tracking service
  // Graceful shutdown
  process.exit(1);
});

// Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Log to error tracking service
  // Graceful shutdown
  process.exit(1);
});
```

**These are last-resort handlers.** If they fire, something is wrong with your error handling.

## Graceful shutdown

When a fatal error occurs, shut down cleanly:

```javascript
import { createServer } from "node:http";

const server = createServer(app);

function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log("HTTP server closed");
    // Close database connections
    // Close other resources
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
```

## Error handling best practices

| Practice | Why |
|----------|-----|
| Use custom error classes | Distinguish expected errors from bugs |
| Centralize error handling | One error middleware, consistent responses |
| Log errors with context | Include request ID, user, route |
| Never expose stack traces in production | Security risk |
| Validate input at the boundary | Catch bad data early |
| Handle async errors | Don't let rejections go unhandled |
| Fail fast | If something is wrong, throw immediately |
| Graceful shutdown | Clean up connections on fatal errors |

## Key takeaways

- Use `try/catch` for sync and async errors. Express 5 catches async errors automatically.
- Create custom error classes (`AppError`, `NotFoundError`) with status codes.
- Add a global error middleware as the **last** middleware in Express.
- Handle process-level errors (`unhandledRejection`, `uncaughtException`) as a safety net.
- Never expose internal error details in production responses.
- Implement graceful shutdown to clean up resources on fatal errors.
