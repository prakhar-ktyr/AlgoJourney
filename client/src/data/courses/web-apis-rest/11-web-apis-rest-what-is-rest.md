---
title: What is REST?
---

# What is REST?

**REST** (Representational State Transfer) is an architectural style for designing web APIs. It was defined by Roy Fielding in his 2000 doctoral dissertation and has become the dominant approach for building web services.

---

## REST in Simple Terms

REST is a set of **guidelines** for how clients and servers should communicate over HTTP. A RESTful API:

1. Uses **URLs** to identify resources
2. Uses **HTTP methods** to define actions
3. Uses **HTTP status codes** to communicate results
4. Sends data as **representations** (usually JSON)
5. Is **stateless** — each request contains all needed information

```
REST = Resources + HTTP Methods + Representations
```

---

## A RESTful API Example

Consider a blog API:

```
Resources:
  /api/posts          ← Collection of blog posts
  /api/posts/42       ← A specific blog post
  /api/posts/42/comments  ← Comments on post 42

Actions (HTTP Methods):
  GET    /api/posts       ← List all posts
  POST   /api/posts       ← Create a new post
  GET    /api/posts/42    ← Read post 42
  PUT    /api/posts/42    ← Update post 42
  DELETE /api/posts/42    ← Delete post 42

Representations (JSON):
  {
    "id": 42,
    "title": "Understanding REST",
    "body": "REST is an architectural style...",
    "author": "Alice",
    "createdAt": "2024-01-15T10:30:00Z"
  }
```

This is intuitive: the URL says **what**, the method says **how**, and the body says **with what data**.

---

## REST vs Non-REST

### Non-RESTful (RPC-style)

```
POST /api/getUser         body: { "id": 42 }
POST /api/createUser      body: { "name": "Alice" }
POST /api/updateUser      body: { "id": 42, "name": "Bob" }
POST /api/deleteUser      body: { "id": 42 }
POST /api/listUsers       body: { "page": 1 }
```

Everything is POST, actions are in the URL, inconsistent structure.

### RESTful

```
GET    /api/users          ← List users
POST   /api/users          ← Create user
GET    /api/users/42       ← Get user 42
PUT    /api/users/42       ← Update user 42
DELETE /api/users/42       ← Delete user 42
```

Consistent, predictable, uses HTTP correctly.

---

## The Six REST Constraints

Roy Fielding defined six constraints that make a system RESTful:

### 1. Client-Server

Separate the user interface (client) from the data storage (server):

```
┌────────┐          ┌────────┐
│ Client │ ◀──────▶ │ Server │
│ (UI)   │   HTTP   │ (Data) │
└────────┘          └────────┘
```

**Benefit**: Client and server can evolve independently.

### 2. Stateless

Every request must contain all information needed to process it. The server stores no client context between requests.

```
❌ Stateful (server remembers):
  Request 1: "Log me in as Alice"
  Request 2: "Show my profile" ← server remembers you're Alice

✅ Stateless (self-contained):
  Request 1: "Log me in as Alice" → returns token
  Request 2: "Show my profile" + Authorization: Bearer token ← includes identity
```

### 3. Cacheable

Responses should indicate whether they can be cached:

```
HTTP/1.1 200 OK
Cache-Control: public, max-age=3600
ETag: "abc123"
```

### 4. Uniform Interface

A consistent way to interact with any resource (covered in the next lesson).

### 5. Layered System

The client doesn't know if it's talking directly to the server or through intermediaries (load balancers, caches, proxies).

```
Client → CDN → Load Balancer → API Server → Database
```

### 6. Code on Demand (Optional)

The server can send executable code to the client (e.g., JavaScript). This constraint is optional and rarely used in REST APIs.

---

## RESTful Design Checklist

| Principle | Check |
|-----------|-------|
| Resources identified by URLs | `/api/users/42` not `/api/getUser?id=42` |
| HTTP methods for actions | GET, POST, PUT, DELETE |
| Standard status codes | 200, 201, 404, 500 |
| Stateless requests | Auth token in every request |
| JSON representations | `Content-Type: application/json` |
| Consistent URL structure | Plural nouns, hierarchical |

---

## Why REST Became Dominant

1. **Simple**: Uses existing HTTP infrastructure
2. **Scalable**: Statelessness enables horizontal scaling
3. **Cacheable**: HTTP caching works out of the box
4. **Universal**: Works with any programming language
5. **Tooling**: Excellent browser, testing, and documentation tools
6. **Human-readable**: URLs and JSON are easy to understand

---

## REST Maturity Model (Richardson)

Leonard Richardson defined levels of REST maturity:

| Level | Description | Example |
|-------|-------------|---------|
| **Level 0** | One URL, one method (POST) | SOAP, XML-RPC |
| **Level 1** | Multiple URLs (resources) | `/getUser`, `/getPost` |
| **Level 2** | HTTP methods used correctly | GET, POST, PUT, DELETE |
| **Level 3** | HATEOAS (hypermedia links) | Links in responses |

Most real-world APIs are at **Level 2**. Level 3 (HATEOAS) is theoretically ideal but rarely fully implemented.

---

## Key Takeaways

- **REST** is an architectural style, not a protocol or standard
- It uses **URLs** for resources, **HTTP methods** for actions, and **JSON** for data
- The six constraints ensure **scalability**, **simplicity**, and **reliability**
- **Statelessness** is the most important constraint for scalability
- Most APIs aim for **Level 2** on the Richardson Maturity Model

---

Next, we'll dive deeper into the **REST Constraints** with practical examples →
