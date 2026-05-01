---
title: REST vs GraphQL
---

# REST vs GraphQL

**GraphQL** is a query language for APIs developed by Facebook (2015). It's the most popular modern alternative to REST. Understanding both helps you choose the right tool.

---

## How They Differ

### REST: Multiple Endpoints

```
GET /api/users/42
GET /api/users/42/posts
GET /api/users/42/followers
```

Three requests to get a user profile page.

### GraphQL: Single Endpoint

```graphql
POST /graphql

query {
  user(id: 42) {
    name
    email
    posts {
      title
      createdAt
    }
    followers {
      name
    }
  }
}
```

One request, you specify exactly what you need.

---

## Side-by-Side Comparison

| Feature | REST | GraphQL |
|---------|------|---------|
| **Endpoints** | Multiple (`/users`, `/posts`) | Single (`/graphql`) |
| **Data Fetching** | Fixed structure per endpoint | Client specifies exact fields |
| **Over-fetching** | Common (get all fields) | None (get only what you ask) |
| **Under-fetching** | Common (need multiple requests) | None (one request) |
| **HTTP Methods** | GET, POST, PUT, DELETE | POST (always) |
| **Caching** | HTTP caching built-in | Complex (no HTTP caching) |
| **Versioning** | URL-based (`/v1/`, `/v2/`) | Schema evolution |
| **File Uploads** | Native (multipart) | Complex (spec extension) |
| **Learning Curve** | Low | Medium |
| **Tooling** | curl, Postman | GraphiQL, Apollo DevTools |
| **Real-time** | Separate (WebSockets) | Built-in (Subscriptions) |

---

## The Over-fetching Problem

REST returns **everything** about a resource:

```
GET /api/users/42

{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com",
  "bio": "Long biography text...",
  "avatar": "https://...",
  "address": { ... },
  "preferences": { ... },
  "createdAt": "...",
  "lastLogin": "..."
}
```

But you only needed `name` and `avatar` for a user card. That's **over-fetching**.

GraphQL solves this:

```graphql
query {
  user(id: 42) {
    name
    avatar
  }
}

// Returns only:
{ "data": { "user": { "name": "Alice", "avatar": "https://..." } } }
```

---

## The Under-fetching Problem

To show a user profile with posts and followers in REST:

```javascript
// 3 sequential requests (or parallel)
const user = await fetch("/api/users/42").then(r => r.json());
const posts = await fetch("/api/users/42/posts").then(r => r.json());
const followers = await fetch("/api/users/42/followers").then(r => r.json());
```

GraphQL gets it all in one request:

```graphql
query {
  user(id: 42) {
    name
    posts { title }
    followers { name }
  }
}
```

---

## When to Use Each

### Use REST When:

- Building **simple CRUD** APIs
- You want **HTTP caching**
- Working with **file uploads/downloads**
- Building **public APIs** (easier for consumers)
- Team has REST experience
- Microservices communicating with each other

### Use GraphQL When:

- Complex, **deeply nested** data requirements
- **Mobile apps** that need minimal data transfer
- Multiple clients need **different data shapes**
- Rapidly evolving frontend with **changing data needs**
- Building a **Backend for Frontend (BFF)** layer

### Use Both:

Many companies use REST for public APIs and GraphQL internally.

---

## REST Can Solve These Problems Too

REST has patterns to address over/under-fetching:

```
# Sparse fields (like GraphQL field selection)
GET /api/users/42?fields=name,avatar

# Embedding related resources
GET /api/users/42?expand=posts,followers

# Compound documents
GET /api/users/42?include=posts,followers
```

---

## Key Takeaways

- **REST** is simpler, cacheable, and great for CRUD
- **GraphQL** eliminates over/under-fetching with precise queries
- REST is better for **simple APIs** and **public APIs**
- GraphQL shines with **complex data** and **multiple clients**
- They can coexist — many teams use both
- This course focuses on REST, which covers the majority of API needs

---

Next, we'll start **Building REST APIs** — setting up Node.js and Express →
