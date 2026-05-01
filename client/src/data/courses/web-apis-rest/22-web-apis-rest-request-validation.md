---
title: Request Validation
---

# Request Validation

Never trust client input. Validation ensures incoming data is correct, complete, and safe before processing.

---

## Why Validate?

Without validation, bad data can cause:
- **Crashes**: Unexpected types cause runtime errors
- **Security holes**: SQL injection, XSS, command injection
- **Data corruption**: Invalid values stored in the database
- **Confusing errors**: Cryptic database or downstream errors

---

## Manual Validation

Simple and explicit:

```javascript
app.post("/api/users", (req, res) => {
  const { name, email, age, role } = req.body;
  const errors = [];

  // Required fields
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters" });
  }
  if (name && name.length > 100) {
    errors.push({ field: "name", message: "Name must be 100 characters or less" });
  }

  // Email format
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: "email", message: "Valid email is required" });
  }

  // Optional number with range
  if (age !== undefined) {
    if (typeof age !== "number" || age < 0 || age > 150 || !Number.isInteger(age)) {
      errors.push({ field: "age", message: "Age must be an integer between 0 and 150" });
    }
  }

  // Enum value
  const validRoles = ["user", "editor", "admin"];
  if (role && !validRoles.includes(role)) {
    errors.push({ field: "role", message: `Role must be one of: ${validRoles.join(", ")}` });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  // Process valid data...
});
```

---

## Using a Validation Library (Zod)

For larger APIs, use a schema validation library. **Zod** is popular and TypeScript-friendly:

```bash
npm install zod
```

```javascript
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150).optional(),
  role: z.enum(["user", "editor", "admin"]).default("user"),
});

app.post("/api/users", (req, res) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // result.data is typed and validated
  const { name, email, age, role } = result.data;
  // Create user...
});
```

### Different Schemas for Different Operations

```javascript
const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});
```

---

## Validation Middleware

Create reusable validation middleware:

```javascript
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
    }
    req.validated = result.data;
    next();
  };
}

// Usage
app.post("/api/users", validate(createUserSchema), (req, res) => {
  const userData = req.validated; // Validated and clean
  // Create user...
});

app.patch("/api/users/:id", validate(updateUserSchema), (req, res) => {
  const updates = req.validated;
  // Update user...
});
```

---

## Validating Query Parameters

```javascript
const listUsersQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["name", "-name", "createdAt", "-createdAt"]).optional(),
  role: z.enum(["user", "editor", "admin"]).optional(),
});

app.get("/api/users", (req, res) => {
  const result = listUsersQuery.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }
  const { page, limit, sort, role } = result.data;
  // Fetch and return users...
});
```

---

## Input Sanitization

Beyond validation, sanitize input to prevent attacks:

```javascript
// Trim whitespace
const name = req.body.name?.trim();

// Prevent HTML injection
const sanitize = (str) => str.replace(/[<>]/g, "");

// Limit string length
const bio = req.body.bio?.slice(0, 500);

// Strip unknown fields (Zod does this with .strict())
const strictSchema = z.object({
  name: z.string(),
  email: z.string().email(),
}).strict(); // Rejects extra fields
```

---

## Consistent Error Response

Always return validation errors in a consistent format:

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Valid email is required" },
    { "field": "name", "message": "Name must be at least 2 characters" }
  ]
}
```

---

## Key Takeaways

- **Never trust** client input — validate everything
- Validate at the **API boundary** (route handlers)
- Use **schema validation** libraries (Zod) for complex APIs
- Create **validation middleware** for reusability
- **Sanitize** input to prevent injection attacks
- Return **consistent** error formats with field-level details

---

Next, we'll build full **CRUD Operations** with a more realistic setup →
