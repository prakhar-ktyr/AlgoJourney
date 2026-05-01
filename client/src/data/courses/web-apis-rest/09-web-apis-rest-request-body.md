---
title: Request Body & Payloads
---

# Request Body & Payloads

When creating or updating resources, you send data in the **request body**. This lesson covers the different formats and how to work with them.

---

## When to Use a Request Body

| Method | Body? | Use Case |
|--------|-------|----------|
| **GET** | ❌ No | Never send a body with GET |
| **POST** | ✅ Yes | Creating resources, submitting data |
| **PUT** | ✅ Yes | Replacing a resource |
| **PATCH** | ✅ Yes | Partially updating a resource |
| **DELETE** | ⚠️ Optional | Rarely used, but technically allowed |

---

## JSON — The Standard Format

JSON (JavaScript Object Notation) is the de facto standard for API request/response bodies:

```
POST /api/users HTTP/1.1
Content-Type: application/json

{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "age": 28,
  "roles": ["user", "editor"],
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "country": "US"
  }
}
```

### Sending JSON with Express

```javascript
import express from "express";
const app = express();

// Parse JSON request bodies
app.use(express.json());

app.post("/api/users", (req, res) => {
  console.log(req.body);
  // {
  //   name: "Alice Johnson",
  //   email: "alice@example.com",
  //   age: 28,
  //   roles: ["user", "editor"],
  //   address: { street: "123 Main St", city: "Springfield", country: "US" }
  // }

  const user = createUser(req.body);
  res.status(201).json(user);
});
```

### Sending JSON with fetch

```javascript
const response = await fetch("/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Alice Johnson",
    email: "alice@example.com",
    age: 28,
  }),
});

const newUser = await response.json();
```

### Sending JSON with curl

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'
```

---

## Form Data

HTML forms send data as `application/x-www-form-urlencoded`:

```
POST /api/login HTTP/1.1
Content-Type: application/x-www-form-urlencoded

username=alice&password=secret123
```

```javascript
// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
});
```

---

## Multipart Form Data (File Uploads)

For file uploads, use `multipart/form-data`:

```
POST /api/upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----FormBoundary

------FormBoundary
Content-Disposition: form-data; name="title"

My Photo
------FormBoundary
Content-Disposition: form-data; name="file"; filename="photo.jpg"
Content-Type: image/jpeg

(binary data)
------FormBoundary--
```

Use the `multer` library with Express:

```javascript
import multer from "multer";
const upload = multer({ dest: "uploads/" });

app.post("/api/upload", upload.single("file"), (req, res) => {
  console.log(req.file);  // File metadata
  console.log(req.body);  // Other form fields
  res.json({ filename: req.file.filename });
});
```

With fetch:

```javascript
const formData = new FormData();
formData.append("title", "My Photo");
formData.append("file", fileInput.files[0]);

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
  // Don't set Content-Type — browser sets it with boundary
});
```

---

## Payload Size Limits

Always limit the size of request bodies to prevent abuse:

```javascript
// Limit JSON body to 1MB
app.use(express.json({ limit: "1mb" }));

// Limit URL-encoded body to 500KB
app.use(express.urlencoded({ extended: true, limit: "500kb" }));

// Limit file uploads to 5MB
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
});
```

If a client sends a body larger than the limit, Express returns `413 Payload Too Large`.

---

## Request Body Validation

Always validate incoming data:

```javascript
app.post("/api/users", (req, res) => {
  const { name, email, age } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters" });
  }

  if (!email || !email.includes("@")) {
    errors.push({ field: "email", message: "Valid email is required" });
  }

  if (age !== undefined && (typeof age !== "number" || age < 0 || age > 150)) {
    errors.push({ field: "age", message: "Age must be a number between 0 and 150" });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  // Process valid data...
});
```

---

## JSON Data Types

JSON supports these types in request bodies:

```json
{
  "string": "hello",
  "number": 42,
  "float": 3.14,
  "boolean": true,
  "null": null,
  "array": [1, 2, 3],
  "object": { "key": "value" }
}
```

**Not supported in JSON:**
- Dates (send as ISO string: `"2024-01-15T10:30:00Z"`)
- Functions
- `undefined`
- Comments
- Trailing commas

---

## Response Bodies

API responses also use JSON:

```javascript
// Single resource
res.json({
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  createdAt: "2024-01-15T10:30:00Z",
});

// Collection
res.json({
  data: [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
  },
});

// Error
res.status(400).json({
  error: "Validation failed",
  details: [
    { field: "email", message: "Required" },
  ],
});
```

---

## Try It Yourself

Create a simple server and test different body formats:

```javascript
import express from "express";
const app = express();
app.use(express.json());

app.post("/api/echo", (req, res) => {
  res.json({
    receivedBody: req.body,
    contentType: req.headers["content-type"],
    bodySize: JSON.stringify(req.body).length,
  });
});

app.listen(3000);
```

Test it:

```bash
curl -X POST http://localhost:3000/api/echo \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "items": [1, 2, 3]}'
```

---

## Key Takeaways

- Request bodies carry data for POST, PUT, and PATCH requests
- **JSON** is the standard format (`Content-Type: application/json`)
- Use `express.json()` middleware to parse JSON bodies
- Use `multer` for file uploads (`multipart/form-data`)
- Always **validate** incoming data and **limit** body size
- Never send a body with GET requests

---

Next, we'll learn **JSON Basics** — the data format that powers REST APIs →
