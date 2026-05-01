---
title: JSON Basics
---

# JSON Basics

**JSON** (JavaScript Object Notation) is the standard data format for REST APIs. Nearly every modern API sends and receives JSON.

---

## What is JSON?

JSON is a lightweight, text-based data format that's easy for both humans and machines to read:

```json
{
  "name": "Alice Johnson",
  "age": 28,
  "email": "alice@example.com",
  "isActive": true,
  "address": {
    "city": "Springfield",
    "country": "US"
  },
  "skills": ["JavaScript", "Python", "SQL"]
}
```

JSON was inspired by JavaScript object syntax but is **language-independent** — every programming language can parse and generate JSON.

---

## JSON Data Types

| Type | Example | Notes |
|------|---------|-------|
| **String** | `"hello"` | Must use double quotes |
| **Number** | `42`, `3.14`, `-5` | No quotes, supports decimals |
| **Boolean** | `true`, `false` | Lowercase only |
| **Null** | `null` | Represents empty/missing value |
| **Object** | `{ "key": "value" }` | Key-value pairs, keys must be strings |
| **Array** | `[1, 2, 3]` | Ordered list of values |

### What JSON Does NOT Support

```
❌ undefined          → use null instead
❌ 'single quotes'    → must use "double quotes"
❌ Comments           → not allowed in JSON
❌ Trailing commas    → {"a": 1,} is invalid
❌ Functions          → not a data type
❌ Dates              → use ISO strings: "2024-01-15T10:30:00Z"
❌ NaN, Infinity      → not valid JSON numbers
```

---

## JSON in JavaScript

### Parsing JSON (String → Object)

```javascript
const jsonString = '{"name": "Alice", "age": 28}';
const user = JSON.parse(jsonString);

console.log(user.name); // "Alice"
console.log(user.age);  // 28
```

### Stringifying (Object → String)

```javascript
const user = { name: "Alice", age: 28 };
const jsonString = JSON.stringify(user);

console.log(jsonString); // '{"name":"Alice","age":28}'

// Pretty-print with 2-space indent
const pretty = JSON.stringify(user, null, 2);
console.log(pretty);
// {
//   "name": "Alice",
//   "age": 28
// }
```

### With fetch

```javascript
// Sending JSON
const response = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alice", email: "alice@example.com" }),
});

// Receiving JSON
const data = await response.json(); // Automatically parses JSON
console.log(data.name);
```

---

## JSON in Express

```javascript
import express from "express";
const app = express();

// Parse incoming JSON
app.use(express.json());

app.post("/api/users", (req, res) => {
  // req.body is already parsed from JSON
  console.log(req.body.name); // "Alice"

  // res.json() automatically:
  // 1. Stringifies the object
  // 2. Sets Content-Type: application/json
  // 3. Sends the response
  res.json({ id: 1, name: req.body.name });
});
```

---

## JSON Schema

A JSON Schema describes the expected structure of JSON data. It's used for validation and documentation:

```json
{
  "type": "object",
  "required": ["name", "email"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 150
    },
    "roles": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

---

## Common API JSON Patterns

### Single Resource Response

```json
{
  "id": 42,
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-06-20T14:45:00Z"
}
```

### Collection Response

```json
{
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error Response

```json
{
  "error": {
    "code": 400,
    "type": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Must be a valid email" }
    ]
  }
}
```

### Nested Resources

```json
{
  "id": 1,
  "title": "My First Post",
  "author": {
    "id": 42,
    "name": "Alice"
  },
  "tags": ["javascript", "tutorial"],
  "comments": [
    {
      "id": 100,
      "text": "Great post!",
      "author": { "id": 7, "name": "Bob" }
    }
  ]
}
```

---

## JSON Dates

JSON has no date type. Use **ISO 8601** strings:

```json
{
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-06-20T14:45:00.123Z",
  "expiresAt": "2025-01-15T00:00:00+05:30"
}
```

```javascript
// JavaScript Date ↔ ISO string
const now = new Date();
const isoString = now.toISOString(); // "2024-01-15T10:30:00.000Z"
const dateObj = new Date(isoString);  // Back to Date object
```

Always use **UTC** (the `Z` suffix) in APIs to avoid timezone confusion.

---

## Handling Edge Cases

```javascript
// Handle parsing errors
try {
  const data = JSON.parse(invalidString);
} catch (error) {
  console.error("Invalid JSON:", error.message);
}

// Handle BigInt (not supported by JSON)
const big = { value: 9007199254740993n };
// JSON.stringify(big) throws TypeError
// Solution: convert to string
JSON.stringify(big, (key, value) =>
  typeof value === "bigint" ? value.toString() : value
);

// Handle circular references
const obj = {};
obj.self = obj;
// JSON.stringify(obj) throws TypeError
```

---

## JSON vs Other Formats

| Feature | JSON | XML | YAML |
|---------|------|-----|------|
| **Readability** | Good | Verbose | Excellent |
| **Parse speed** | Fast | Slow | Medium |
| **Browser support** | Native | Limited | None |
| **Data types** | Basic | String only | Rich |
| **Comments** | ❌ | ✅ | ✅ |
| **API usage** | ~95% | ~5% | Config files |

---

## Try It Yourself

Open your browser console and try:

```javascript
// Parse JSON
const user = JSON.parse('{"name":"Alice","scores":[95,87,92]}');
console.log(user.scores[1]); // ?

// Stringify with formatting
console.log(JSON.stringify(user, null, 2));

// What happens with invalid JSON?
try {
  JSON.parse("{ name: 'Alice' }"); // Missing quotes
} catch (e) {
  console.log(e.message);
}
```

---

## Key Takeaways

- **JSON** is the standard data format for REST APIs
- Use **double quotes** for strings and keys
- `JSON.parse()` converts string → object; `JSON.stringify()` converts object → string
- Express's `express.json()` middleware parses incoming JSON automatically
- `res.json()` sends JSON responses with the correct Content-Type
- Use **ISO 8601** strings for dates
- Wrap `JSON.parse()` in try/catch for safety

---

Next, we'll explore **What is REST?** — the architectural style behind RESTful APIs →
