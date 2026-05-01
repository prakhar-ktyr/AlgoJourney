---
title: Resources & URIs
---

# Resources & URIs

In REST, everything is a **resource**. Resources are the core concept that drives API design — how you model them determines the quality of your API.

---

## What is a Resource?

A resource is any **thing** that can be identified, named, and manipulated through the API:

| Resource | URI | Description |
|----------|-----|-------------|
| A user | `/api/users/42` | A specific person |
| All users | `/api/users` | The collection of users |
| A post | `/api/posts/7` | A specific blog post |
| User's posts | `/api/users/42/posts` | Posts belonging to user 42 |
| A search result | `/api/search?q=rest` | The result of a query |
| Server health | `/api/health` | The status of the server |

Resources can be:
- **Concrete**: Users, products, orders (database records)
- **Abstract**: Search results, statistics, health status (computed data)

---

## Resource Naming Rules

### 1. Use Nouns

Resources are **things**, not actions:

```
✅ /api/users
✅ /api/products
✅ /api/orders

❌ /api/getUsers
❌ /api/createProduct
❌ /api/deleteOrder
```

### 2. Use Plurals for Collections

```
✅ /api/users          ← collection
✅ /api/users/42       ← single item in the collection

❌ /api/user
❌ /api/user/42
```

### 3. Use Hierarchies for Relationships

```
/api/users/42                    ← User 42
/api/users/42/posts              ← User 42's posts
/api/users/42/posts/7            ← Post 7 by user 42
/api/users/42/posts/7/comments   ← Comments on that post
```

### 4. Keep It Shallow

Avoid deeply nested URIs — they're hard to use and implement:

```
❌ Deep nesting:
/api/companies/5/departments/3/teams/8/members/42/tasks

✅ Flatten when possible:
/api/tasks?memberId=42
/api/teams/8/members
```

**Rule of thumb**: No more than 2-3 levels of nesting.

---

## Collection vs. Instance Resources

```
Collection:  /api/users       ← represents all users
Instance:    /api/users/42    ← represents one specific user

Operations on Collections:
  GET  /api/users    → List all (with pagination)
  POST /api/users    → Create a new one

Operations on Instances:
  GET    /api/users/42  → Read one
  PUT    /api/users/42  → Replace one
  PATCH  /api/users/42  → Update one
  DELETE /api/users/42  → Delete one
```

---

## Resource Identifiers

Every resource needs a unique identifier in the URI:

```
/api/users/42              ← Numeric ID
/api/users/abc-123-def     ← UUID
/api/users/alice            ← Username (slug)
/api/posts/my-first-post    ← Slug from title
```

### Numeric IDs vs UUIDs

| Feature | Numeric ID | UUID |
|---------|-----------|------|
| Example | `42` | `550e8400-e29b-41d4-a716-446655440000` |
| Length | Short | 36 characters |
| Sequential | Yes (reveals count) | No |
| Guessable | Yes | No |
| Performance | Faster | Slightly slower |
| Security | ⚠️ Enumerable | ✅ Not enumerable |

```javascript
import { randomUUID } from "crypto";

app.post("/api/users", (req, res) => {
  const user = {
    id: randomUUID(), // "550e8400-e29b-41d4-a716-446655440000"
    name: req.body.name,
  };
  res.status(201).json(user);
});
```

---

## Sub-Resources

Model relationships by nesting:

```
# A user's orders
GET /api/users/42/orders

# A specific order
GET /api/users/42/orders/100
# or
GET /api/orders/100

# An order's items
GET /api/orders/100/items
```

When to nest vs. use a top-level resource:

```
# Nest when the sub-resource BELONGS to the parent
GET /api/posts/7/comments      ← Comments belong to a post

# Top-level when the resource is independent
GET /api/comments/99           ← Access comment directly
GET /api/comments?postId=7     ← Filter comments by post
```

---

## Singleton Resources

Some resources exist as a single instance relative to their parent:

```
GET /api/users/42/profile      ← User 42's profile (one per user)
PUT /api/users/42/profile      ← Update the profile
GET /api/users/42/settings     ← User 42's settings
GET /api/server/config         ← Server configuration
```

No ID needed since there's only one per parent.

---

## Action Resources

Sometimes you need to model **actions** that don't map to CRUD. Use a sub-resource:

```
# Approve an order (state change)
POST /api/orders/100/approve

# Send an invitation
POST /api/users/42/invite

# Reset password
POST /api/users/42/password-reset

# Export data
POST /api/reports/export
```

These are sometimes called **controller resources** — they trigger actions rather than managing data.

---

## URI Design Patterns

### E-Commerce API

```
/api/products                    ← All products
/api/products/42                 ← Product 42
/api/products?category=electronics  ← Filtered products
/api/categories                  ← All categories
/api/categories/5/products       ← Products in category 5
/api/cart                        ← Current user's cart
/api/cart/items                  ← Items in cart
/api/orders                      ← User's orders
/api/orders/100                  ← Order 100
/api/orders/100/items            ← Items in order 100
```

### Social Media API

```
/api/users/42                    ← User profile
/api/users/42/posts              ← User's posts
/api/users/42/followers          ← User's followers
/api/users/42/following          ← Who user follows
/api/feed                        ← Current user's feed
/api/posts/7                     ← Specific post
/api/posts/7/likes               ← Likes on post
/api/posts/7/comments            ← Comments on post
```

---

## Key Takeaways

- Everything in REST is a **resource** identified by a **URI**
- Use **plural nouns** for collections, **IDs** for instances
- Use **hierarchy** for relationships but keep it **shallow**
- Consider **UUIDs** over numeric IDs for security
- Model non-CRUD actions as **controller sub-resources**
- Consistent naming is more important than perfect modeling

---

Next, we'll learn about **Representations** — how resources are formatted for transfer →
