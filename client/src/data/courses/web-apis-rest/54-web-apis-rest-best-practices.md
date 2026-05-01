---
title: API Design Best Practices
---

# API Design Best Practices

This lesson summarizes the principles and patterns for building professional, production-ready REST APIs.

---

## URL Design

```
✅ Good
GET    /api/v1/users
GET    /api/v1/users/123
GET    /api/v1/users/123/posts
POST   /api/v1/users
PATCH  /api/v1/users/123
DELETE /api/v1/users/123

❌ Bad
GET    /api/getUsers
GET    /api/getUserById?id=123
POST   /api/createUser
POST   /api/deleteUser
```

Rules:
- Use **nouns**, not verbs
- Use **plural** resource names
- Use **kebab-case** for multi-word resources (`/api/blog-posts`)
- Nest for relationships (`/users/123/posts`)
- Keep URLs **3 levels deep** max

---

## Response Design

### Consistent Envelope

```json
{
  "data": { "id": "123", "name": "Alice" },
  "meta": { "requestId": "abc-123" }
}
```

### Collections

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Errors

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "This field is required" }
    ]
  }
}
```

---

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Validate and sanitize all input
- [ ] Use parameterized database queries
- [ ] Implement authentication (JWT/OAuth)
- [ ] Apply rate limiting
- [ ] Set security headers (Helmet)
- [ ] Enable CORS with specific origins
- [ ] Never expose stack traces in production
- [ ] Log security events
- [ ] Keep dependencies updated

---

## Performance Checklist

- [ ] Add pagination to all list endpoints
- [ ] Use database indexes for filtered fields
- [ ] Implement caching (Redis, HTTP cache headers)
- [ ] Use compression (gzip/brotli)
- [ ] Add connection pooling
- [ ] Set reasonable timeouts
- [ ] Use async operations where possible

---

## Reliability Checklist

- [ ] Health check endpoint
- [ ] Graceful shutdown handling
- [ ] Retry logic for external services
- [ ] Circuit breaker for failing dependencies
- [ ] Idempotent operations (safe to retry)
- [ ] Request ID for tracing
- [ ] Structured logging
- [ ] Error monitoring (Sentry)

---

## Versioning Strategy

```
/api/v1/users  ← Current stable
/api/v2/users  ← New version (breaking changes)
```

- Support **at least 2 versions** simultaneously
- Deprecate with headers: `Deprecation: true`
- Give consumers **6+ months** to migrate

---

## API Maturity Checklist

| Level | Requirements |
|-------|-------------|
| **Basic** | Working endpoints, input validation, error handling |
| **Intermediate** | Auth, pagination, rate limiting, tests |
| **Advanced** | Caching, monitoring, documentation, versioning |
| **Production** | CI/CD, Docker, logging, alerting, OpenAPI spec |

---

## Key Takeaways

- **Consistency** is the #1 most important quality of a good API
- Follow REST conventions — nouns, HTTP methods, status codes
- **Validate input**, **handle errors gracefully**, **secure everything**
- **Document** your API and keep docs in sync
- **Monitor** performance and errors in production
- **Test** every endpoint — happy paths and error cases

---

Next, we'll finish with the **Capstone Project** — building a complete API from scratch →
