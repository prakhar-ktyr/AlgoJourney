---
title: HTTP Status Codes
---

# HTTP Status Codes

Every HTTP response includes a **status code** — a three-digit number that tells the client what happened. Understanding status codes is crucial for building and debugging APIs.

---

## Status Code Categories

| Range | Category | Meaning |
|-------|----------|---------|
| **1xx** | Informational | Request received, processing continues |
| **2xx** | Success | Request was successful |
| **3xx** | Redirection | Further action needed |
| **4xx** | Client Error | Something wrong with the request |
| **5xx** | Server Error | Something wrong on the server |

---

## 2xx — Success

| Code | Name | When to Use |
|------|------|-------------|
| **200** | OK | General success (GET, PUT, PATCH) |
| **201** | Created | Resource successfully created (POST) |
| **204** | No Content | Success with no response body (DELETE) |
| **202** | Accepted | Request accepted for async processing |

```javascript
// 200 — Successful GET
app.get("/api/users/:id", (req, res) => {
  const user = findUser(req.params.id);
  res.status(200).json(user); // 200 is the default
});

// 201 — Resource created
app.post("/api/users", (req, res) => {
  const user = createUser(req.body);
  res.status(201).json(user);
});

// 204 — Deleted, no body
app.delete("/api/users/:id", (req, res) => {
  deleteUser(req.params.id);
  res.status(204).send();
});

// 202 — Accepted for later processing
app.post("/api/reports", (req, res) => {
  queueReportGeneration(req.body);
  res.status(202).json({ message: "Report generation started" });
});
```

---

## 3xx — Redirection

| Code | Name | When to Use |
|------|------|-------------|
| **301** | Moved Permanently | Resource permanently moved to new URL |
| **302** | Found | Temporary redirect |
| **304** | Not Modified | Cached version is still valid |
| **307** | Temporary Redirect | Same as 302 but preserves HTTP method |
| **308** | Permanent Redirect | Same as 301 but preserves HTTP method |

```javascript
// 301 — Permanent redirect (old API version)
app.get("/api/v1/users", (req, res) => {
  res.redirect(301, "/api/v2/users");
});

// 304 — Not Modified (used with caching headers)
// Handled automatically by Express when ETags match
```

---

## 4xx — Client Errors

These indicate the **client** made a mistake.

| Code | Name | When to Use |
|------|------|-------------|
| **400** | Bad Request | Invalid syntax, missing fields, validation error |
| **401** | Unauthorized | Authentication required (not logged in) |
| **403** | Forbidden | Authenticated but not authorized (no permission) |
| **404** | Not Found | Resource doesn't exist |
| **405** | Method Not Allowed | HTTP method not supported for this endpoint |
| **409** | Conflict | Conflicts with current state (e.g., duplicate email) |
| **422** | Unprocessable Entity | Valid syntax but semantic errors |
| **429** | Too Many Requests | Rate limit exceeded |

```javascript
// 400 — Bad Request
app.post("/api/users", (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Email is required",
    });
  }
});

// 401 — Unauthorized
app.get("/api/profile", (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
  }
});

// 403 — Forbidden
app.delete("/api/users/:id", (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Forbidden",
      message: "Admin access required",
    });
  }
});

// 404 — Not Found
app.get("/api/users/:id", (req, res) => {
  const user = findUser(req.params.id);
  if (!user) {
    return res.status(404).json({
      error: "Not Found",
      message: `User ${req.params.id} not found`,
    });
  }
  res.json(user);
});

// 409 — Conflict
app.post("/api/users", (req, res) => {
  if (emailExists(req.body.email)) {
    return res.status(409).json({
      error: "Conflict",
      message: "Email already registered",
    });
  }
});

// 429 — Too Many Requests
app.use((req, res) => {
  res.status(429).json({
    error: "Too Many Requests",
    message: "Rate limit exceeded. Try again in 60 seconds.",
    retryAfter: 60,
  });
});
```

### 401 vs 403

This is a common confusion:

```
401 Unauthorized = "Who are you?" (not authenticated)
403 Forbidden    = "I know who you are, but you can't do this" (not authorized)
```

---

## 5xx — Server Errors

These indicate something went wrong **on the server**.

| Code | Name | When to Use |
|------|------|-------------|
| **500** | Internal Server Error | Unhandled exception, unexpected error |
| **502** | Bad Gateway | Upstream server returned invalid response |
| **503** | Service Unavailable | Server temporarily overloaded or in maintenance |
| **504** | Gateway Timeout | Upstream server didn't respond in time |

```javascript
// 500 — Internal Server Error (catch-all)
app.get("/api/users", async (req, res) => {
  try {
    const users = await db.query("SELECT * FROM users");
    res.json(users);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
});

// 503 — Service Unavailable
app.use((req, res) => {
  res.status(503).json({
    error: "Service Unavailable",
    message: "Server is under maintenance. Please try again later.",
    retryAfter: 300,
  });
});
```

> **Important**: Never expose internal error details (stack traces, database errors) in production. Return generic messages to the client and log the details server-side.

---

## Error Response Format

Use a consistent error format across your API:

```json
{
  "error": {
    "code": 400,
    "type": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Must be a valid email address" },
      { "field": "name", "message": "Must be at least 2 characters" }
    ]
  }
}
```

---

## Status Code Decision Tree

```
Was the request successful?
├── Yes
│   ├── Created something? → 201
│   ├── No content to return? → 204
│   └── Otherwise → 200
│
└── No
    ├── Client's fault?
    │   ├── Bad data? → 400
    │   ├── Not logged in? → 401
    │   ├── No permission? → 403
    │   ├── Resource not found? → 404
    │   ├── Duplicate/conflict? → 409
    │   └── Rate limited? → 429
    │
    └── Server's fault?
        └── → 500
```

---

## Try It Yourself

Test different status codes using curl:

```bash
# 200 — Success
curl -i https://jsonplaceholder.typicode.com/posts/1

# 404 — Not Found
curl -i https://jsonplaceholder.typicode.com/posts/9999

# 201 — Created
curl -i -X POST https://jsonplaceholder.typicode.com/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "body": "Hello", "userId": 1}'
```

---

## Key Takeaways

- Status codes tell the client **what happened** with their request
- **2xx** = success, **4xx** = client error, **5xx** = server error
- Use **201** for creation, **204** for deletion, **200** for everything else that succeeds
- **401** means "not authenticated", **403** means "not authorized"
- Always return a **consistent error format**
- Never expose internal error details in production

---

Next, we'll explore **HTTP Headers** — metadata that travels with every request and response →
