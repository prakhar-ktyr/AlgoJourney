---
title: Response Formatting
---

# Response Formatting

Consistent response formatting makes your API predictable and easy to consume. This lesson covers best practices for structuring API responses.

---

## Standard Response Envelope

Wrap all responses in a consistent structure:

### Success — Single Resource

```json
{
  "data": {
    "id": "abc-123",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Success — Collection

```json
{
  "data": [
    { "id": "abc-123", "name": "Alice" },
    { "id": "def-456", "name": "Bob" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{ "field": "email", "message": "Required" }]
  }
}
```

---

## Response Helper Functions

```javascript
function sendSuccess(res, data, statusCode = 200) {
  res.status(statusCode).json({ data });
}

function sendPaginated(res, data, pagination) {
  res.json({ data, pagination });
}

function sendCreated(res, data) {
  res.status(201).json({ data });
}

function sendNoContent(res) {
  res.status(204).send();
}

// Usage
app.get("/api/users/:id", asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User");
  sendSuccess(res, serializeUser(user));
}));

app.post("/api/users", asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  sendCreated(res, serializeUser(user));
}));
```

---

## Serialization

Control exactly what fields are exposed:

```javascript
function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  // Excludes: passwordHash, __v, resetToken, etc.
}

function serializePost(post, includeBody = false) {
  const result = {
    id: post._id,
    title: post.title,
    slug: post.slug,
    excerpt: post.body?.substring(0, 200),
    author: post.author ? { id: post.author._id, name: post.author.name } : null,
    tags: post.tags,
    createdAt: post.createdAt,
  };
  if (includeBody) result.body = post.body;
  return result;
}
```

---

## Date Formatting

Always use **ISO 8601** format in UTC:

```javascript
// Good
{ "createdAt": "2024-01-15T10:30:00.000Z" }

// Bad
{ "createdAt": "Jan 15, 2024" }
{ "createdAt": 1705311000000 }
```

Mongoose `timestamps: true` handles this automatically.

---

## Null vs Undefined vs Missing

Be consistent:

```javascript
// Include the field with null (field exists but has no value)
{ "avatar": null, "bio": null }

// Don't include the field (field doesn't exist)
// Omit bio entirely if user never set it

// Never use empty strings for "no value"
// Bad: { "avatar": "" }
```

---

## HTTP Headers in Responses

Set appropriate headers:

```javascript
app.use((req, res, next) => {
  // Don't reveal server technology
  res.removeHeader("X-Powered-By");

  // Prevent MIME sniffing
  res.set("X-Content-Type-Options", "nosniff");

  // Request ID for tracing
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  res.set("X-Request-ID", requestId);

  next();
});
```

---

## Key Takeaways

- Use a **consistent envelope** (`data` for success, `error` for failures)
- **Serialize** resources to control exposed fields
- Use **ISO 8601** for all dates
- Include **pagination metadata** with collection responses
- Set proper **HTTP headers** on every response
- Use `null` for empty values, not empty strings

---

Next, we'll learn about **File Uploads** — handling binary data in REST APIs →
