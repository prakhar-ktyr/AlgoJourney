---
title: GraphQL vs REST
---

# GraphQL vs REST

Both GraphQL and REST are ways to build APIs. Understanding their differences helps you choose the right tool.

---

## Side-by-Side Comparison

| Aspect | REST | GraphQL |
|--------|------|---------|
| Endpoints | Multiple (`/users`, `/posts`) | Single (`/graphql`) |
| Data fetching | Server decides response shape | Client decides response shape |
| Over-fetching | Common | Eliminated |
| Under-fetching | Common (need multiple requests) | Eliminated (one query) |
| Versioning | URL-based (`/v1`, `/v2`) | Schema evolution |
| Caching | HTTP caching built-in | Requires custom caching |
| File uploads | Native | Requires extra setup |
| Error handling | HTTP status codes | Always 200, errors in body |
| Learning curve | Lower | Higher |

---

## Over-Fetching Problem

**REST**: Getting a user's name requires fetching everything:

```
GET /api/users/123

Response: {
  "id": "123",
  "name": "Alice",        ← You only need this
  "email": "alice@...",   ← Wasted
  "bio": "...",           ← Wasted
  "avatar": "...",        ← Wasted
  "settings": {...},      ← Wasted
  "preferences": {...}    ← Wasted
}
```

**GraphQL**: Ask for only what you need:

```graphql
query {
  user(id: "123") {
    name
  }
}

# Response: { "data": { "user": { "name": "Alice" } } }
```

---

## Under-Fetching Problem

**REST**: Showing a user profile with their posts and followers requires 3 requests:

```
GET /api/users/123
GET /api/users/123/posts
GET /api/users/123/followers
```

**GraphQL**: One request gets everything:

```graphql
query {
  user(id: "123") {
    name
    posts { title, publishedAt }
    followers { name, avatar }
  }
}
```

---

## When to Use REST

- Simple CRUD applications
- Public APIs with heavy caching needs
- File-heavy APIs (uploads/downloads)
- Team prefers simplicity
- Existing infrastructure built for REST

## When to Use GraphQL

- Complex data with many relationships
- Mobile apps (minimize bandwidth)
- Multiple clients needing different data
- Rapid frontend iteration
- Real-time features needed

---

## Can They Coexist?

Yes! Many companies use both:

- **REST** for simple endpoints (health checks, webhooks, file uploads)
- **GraphQL** for complex data queries

```javascript
// Same server, both protocols
app.use("/api/health", healthRouter);       // REST
app.use("/api/webhooks", webhookRouter);     // REST
app.use("/graphql", graphqlMiddleware);      // GraphQL
```

---

## Key Takeaways

- REST is simpler but leads to over/under-fetching
- GraphQL eliminates wasted data and multiple round trips
- REST has better built-in HTTP caching
- GraphQL is ideal for complex, relational data
- They can coexist in the same application

---

Next, we'll learn about **Schema Basics** — the foundation of every GraphQL API →
