---
title: URLs & Endpoints
---

# URLs & Endpoints

Every API resource is identified by a **URL** (Uniform Resource Locator). Understanding URL structure is essential for designing and consuming APIs.

---

## Anatomy of a URL

```
https://api.example.com:443/v2/users/42?fields=name,email&format=json#profile
└─┬──┘ └──────┬───────┘└┬┘ └────┬────┘ └──────────┬──────────────┘ └──┬───┘
scheme      host       port    path          query string           fragment
```

| Part | Example | Description |
|------|---------|-------------|
| **Scheme** | `https` | Protocol (http or https) |
| **Host** | `api.example.com` | Server address |
| **Port** | `443` | Network port (optional, defaults to 80/443) |
| **Path** | `/v2/users/42` | Resource location |
| **Query String** | `?fields=name,email` | Optional parameters |
| **Fragment** | `#profile` | Client-side only (not sent to server) |

---

## What is an API Endpoint?

An **endpoint** is a specific URL where an API receives requests. It's the combination of a **path** and an **HTTP method**:

```
GET    /api/users       ← List all users
POST   /api/users       ← Create a new user
GET    /api/users/42    ← Get user with ID 42
PUT    /api/users/42    ← Update user 42
DELETE /api/users/42    ← Delete user 42
```

The same path (`/api/users`) can have different behaviors depending on the HTTP method.

---

## Designing Good URLs

### Use Nouns, Not Verbs

URLs should represent **resources** (things), not **actions**:

```
✅ Good:
GET    /api/users
POST   /api/users
DELETE /api/users/42

❌ Bad:
GET    /api/getUsers
POST   /api/createUser
DELETE /api/deleteUser/42
```

The HTTP method already describes the action. The URL describes the resource.

### Use Plural Nouns

```
✅ Good:  /api/users, /api/products, /api/orders
❌ Bad:   /api/user, /api/product, /api/order
```

The collection is plural. A specific item is accessed by ID: `/api/users/42`.

### Use Hierarchical Structure

Nest related resources logically:

```
/api/users/42/posts          ← Posts by user 42
/api/users/42/posts/7        ← Post 7 by user 42
/api/users/42/posts/7/comments  ← Comments on post 7
```

But avoid deep nesting (more than 2–3 levels):

```
❌ Too deep:
/api/users/42/posts/7/comments/99/likes/5

✅ Better:
/api/comments/99/likes
```

### Use Kebab-Case

```
✅ Good:  /api/user-profiles, /api/order-items
❌ Bad:   /api/userProfiles, /api/order_items
```

### Use Lowercase

```
✅ Good:  /api/users
❌ Bad:   /api/Users, /api/USERS
```

---

## Path Parameters

**Path parameters** identify a specific resource. They're part of the URL path:

```
GET /api/users/:id
GET /api/users/42         ← id = 42
GET /api/users/abc-123    ← id = "abc-123"

GET /api/posts/:postId/comments/:commentId
GET /api/posts/5/comments/12   ← postId = 5, commentId = 12
```

In Express.js:

```javascript
app.get("/api/users/:id", (req, res) => {
  const userId = req.params.id; // "42"
  // Look up user by ID
});
```

---

## Base URL

The **base URL** is the root of your API. All endpoints are relative to it:

```
Base URL:  https://api.example.com/v2

Endpoints:
  GET  https://api.example.com/v2/users
  POST https://api.example.com/v2/users
  GET  https://api.example.com/v2/products
```

Common patterns for base URLs:

```
https://api.example.com           ← Subdomain
https://example.com/api           ← Path prefix
https://api.example.com/v2        ← With version
```

---

## URL Encoding

Special characters in URLs must be **percent-encoded**:

| Character | Encoded |
|-----------|---------|
| Space | `%20` or `+` |
| `&` | `%26` |
| `=` | `%3D` |
| `/` | `%2F` |
| `?` | `%3F` |
| `#` | `%23` |

```javascript
// JavaScript handles encoding automatically
const query = "hello world & goodbye";
const encoded = encodeURIComponent(query);
// "hello%20world%20%26%20goodbye"

const url = `/api/search?q=${encoded}`;
// "/api/search?q=hello%20world%20%26%20goodbye"
```

---

## Common API URL Patterns

Here's a complete example of a well-designed API:

```
# Users
GET    /api/users              List users
POST   /api/users              Create user
GET    /api/users/:id          Get user
PUT    /api/users/:id          Update user
DELETE /api/users/:id          Delete user

# User's posts
GET    /api/users/:id/posts    List user's posts

# Posts
GET    /api/posts              List all posts
POST   /api/posts              Create post
GET    /api/posts/:id          Get post
PUT    /api/posts/:id          Update post
DELETE /api/posts/:id          Delete post

# Search
GET    /api/search?q=keyword   Search across resources

# Authentication
POST   /api/auth/login         Log in
POST   /api/auth/register      Register
POST   /api/auth/logout        Log out
```

---

## Try It Yourself

Identify the parts of this URL:

```
https://api.github.com/repos/facebook/react/issues?state=open&per_page=5
```

1. What is the scheme?
2. What is the host?
3. What is the path?
4. What are the query parameters?
5. What resource does this endpoint represent?

**Answers:**
1. `https`
2. `api.github.com`
3. `/repos/facebook/react/issues`
4. `state=open` and `per_page=5`
5. Open issues for the Facebook React repository

---

## Key Takeaways

- A **URL** identifies a resource on the web
- An **endpoint** is a URL + HTTP method combination
- Use **plural nouns**, **lowercase**, and **kebab-case** in URLs
- **Path parameters** identify specific resources (e.g., `/users/42`)
- Keep nesting shallow (2–3 levels max)
- **Encode** special characters in URLs

---

Next, we'll dive into **HTTP Methods** — the verbs of the API world →
