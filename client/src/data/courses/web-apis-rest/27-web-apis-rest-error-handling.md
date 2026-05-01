---
title: Error Handling
---

# Error Handling

Good error handling separates amateur APIs from professional ones. Clear, consistent errors help API consumers debug quickly and handle edge cases gracefully.

---

## Consistent Error Format

Every error response should follow the same structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Must be a valid email address" },
      { "field": "name", "message": "Required" }
    ]
  }
}
```

---

## Custom Error Classes

Create custom error classes to standardize error handling:

```javascript
// utils/errors.js
export class AppError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, "NOT_FOUND", `${resource} not found`);
  }
}

export class ValidationError extends AppError {
  constructor(details) {
    super(400, "VALIDATION_ERROR", "Validation failed", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(403, "FORBIDDEN", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(409, "CONFLICT", message);
  }
}
```

---

## Using Custom Errors in Routes

```javascript
import { NotFoundError, ValidationError } from "./utils/errors.js";

app.get("/api/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError("User");
    res.json(user);
  } catch (error) {
    next(error); // Pass to error handler middleware
  }
});

app.post("/api/users", async (req, res, next) => {
  try {
    if (!req.body.email) {
      throw new ValidationError([
        { field: "email", message: "Email is required" },
      ]);
    }
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});
```

---

## Error Handler Middleware

A single centralized error handler:

```javascript
app.use((err, req, res, next) => {
  // Log the error (detailed for debugging)
  console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`);

  // Custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Validation failed", details },
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      error: { code: "INVALID_ID", message: "Invalid resource ID format" },
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      error: { code: "DUPLICATE", message: `${field} already exists` },
    });
  }

  // JSON parse error
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { code: "INVALID_JSON", message: "Request body is not valid JSON" },
    });
  }

  // Fallback — never expose internal details in production
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
    },
  });
});
```

---

## Async Error Wrapper

Avoid repetitive try/catch blocks:

```javascript
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Clean route handlers — no try/catch needed
app.get("/api/users/:id", asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User");
  res.json(user);
}));

app.post("/api/users", asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
}));
```

> **Note**: Express 5 automatically catches async errors, so `asyncHandler` may not be needed.

---

## 404 Handler

Catch requests to undefined routes:

```javascript
// Must be AFTER all route definitions
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `${req.method} ${req.url} not found`,
    },
  });
});
```

---

## Key Takeaways

- Use a **consistent error format** across all endpoints
- Create **custom error classes** for common error types
- Use a **centralized error handler** middleware
- **Never expose** internal details (stack traces, DB errors) in production
- Use `asyncHandler` to avoid repetitive try/catch
- Always have a **404 handler** for undefined routes
- Log errors server-side for debugging

---

Next, we'll learn about **Response Formatting** — structuring consistent API responses →
