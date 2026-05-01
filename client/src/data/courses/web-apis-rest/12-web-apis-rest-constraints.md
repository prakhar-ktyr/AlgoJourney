---
title: REST Constraints
---

# REST Constraints

The six REST constraints define the rules that make an API truly RESTful. Understanding them helps you design APIs that are scalable, maintainable, and predictable.

---

## 1. Client-Server Separation

The client (frontend) and server (backend) are **independent**. They communicate only through the API interface.

```
┌─────────────┐                    ┌─────────────┐
│   React App │                    │  Express API │
│   Mobile App│ ◀──── HTTP ─────▶  │  Database    │
│   CLI Tool  │                    │  Business    │
└─────────────┘                    │  Logic       │
                                   └─────────────┘
```

**Benefits:**
- Frontend and backend teams work independently
- Multiple clients (web, mobile, CLI) share one API
- Server can be rewritten without changing clients
- Client UI can be redesigned without changing the API

**In practice:**

```javascript
// Server — doesn't know or care about the client
app.get("/api/users", (req, res) => {
  const users = await db.find("users");
  res.json(users); // Returns data, not HTML
});

// Any client can consume this:
// Browser: fetch("/api/users")
// Mobile: HTTP.get("/api/users")
// CLI: curl /api/users
```

---

## 2. Statelessness

Each request must contain **all information** needed to process it. The server does not store session state between requests.

### Stateful (Bad)

```javascript
// ❌ Server stores session state
let currentUser = null;

app.post("/api/login", (req, res) => {
  currentUser = findUser(req.body.email); // Server remembers
  res.json({ message: "Logged in" });
});

app.get("/api/profile", (req, res) => {
  res.json(currentUser); // Uses stored state — breaks with multiple users!
});
```

### Stateless (Good)

```javascript
// ✅ Each request is self-contained
app.post("/api/login", (req, res) => {
  const user = findUser(req.body.email);
  const token = generateJWT(user); // Token contains user info
  res.json({ token });
});

app.get("/api/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const user = verifyJWT(token); // Identity comes from the request
  res.json(user);
});
```

**Why statelessness matters:**

- **Scalability**: Any server can handle any request (no sticky sessions)
- **Reliability**: If a server crashes, no session data is lost
- **Simplicity**: No server-side session management

```
Stateful:  Request → [must go to SAME server] → Response
Stateless: Request → [ANY server can handle it] → Response

Load Balancer
  ├── Server A (can handle any request)
  ├── Server B (can handle any request)
  └── Server C (can handle any request)
```

---

## 3. Cacheability

Responses must declare whether they are **cacheable**. Caching reduces server load and improves performance.

```javascript
// Cacheable — public data that rarely changes
app.get("/api/countries", (req, res) => {
  res.set("Cache-Control", "public, max-age=86400"); // Cache for 24h
  res.json(countries);
});

// Not cacheable — private user data
app.get("/api/profile", (req, res) => {
  res.set("Cache-Control", "private, no-store");
  res.json(profile);
});

// Conditional caching with ETag
app.get("/api/products/:id", (req, res) => {
  const product = getProduct(req.params.id);
  const etag = generateETag(product);

  if (req.headers["if-none-match"] === etag) {
    return res.status(304).send(); // Not Modified — use cached version
  }

  res.set("ETag", etag);
  res.json(product);
});
```

**Cache layers:**

```
Client Cache → CDN Cache → Reverse Proxy Cache → API Server → Database
```

---

## 4. Uniform Interface

The most important constraint. It means all resources are accessed through a **consistent, standardized** interface.

Four sub-constraints:

### a) Resource Identification (URLs)

Each resource has a unique URL:

```
/api/users/42         ← User 42
/api/posts/7          ← Post 7
/api/posts/7/comments ← Comments on post 7
```

### b) Resource Manipulation Through Representations

Clients interact with resources through their **representations** (JSON), not the resources themselves:

```
The resource is a user record in a database.
The representation is the JSON sent to/from the client.

GET /api/users/42 → { "id": 42, "name": "Alice" }  ← representation
PUT /api/users/42 ← { "name": "Alice Updated" }     ← representation
```

### c) Self-Descriptive Messages

Each message contains enough information to understand how to process it:

```
POST /api/users HTTP/1.1
Content-Type: application/json    ← "Body is JSON"
Accept: application/json          ← "I want JSON back"
Authorization: Bearer abc123      ← "I'm authenticated"

{ "name": "Alice" }              ← The data
```

### d) HATEOAS (Hypermedia)

Responses include **links** to related actions and resources:

```json
{
  "id": 42,
  "name": "Alice",
  "links": {
    "self": "/api/users/42",
    "posts": "/api/users/42/posts",
    "update": "/api/users/42",
    "delete": "/api/users/42"
  }
}
```

---

## 5. Layered System

The client doesn't know whether it's connected directly to the end server or to an intermediary:

```
Client → CDN → Load Balancer → API Gateway → API Server → Database
```

Each layer only knows about the adjacent layer. This enables:

- **Load balancing**: Distribute requests across servers
- **Caching**: CDN caches static responses
- **Security**: API gateway handles authentication
- **Monitoring**: Proxy logs all requests

---

## 6. Code on Demand (Optional)

The server can extend client functionality by sending executable code:

```javascript
// Server sends JavaScript to the client
app.get("/api/widget", (req, res) => {
  res.send(`
    <script>
      // This code runs on the client
      document.getElementById("price").textContent = calculatePrice();
    </script>
  `);
});
```

This is the **only optional** constraint. It's rarely used in REST APIs because most APIs return data, not code.

---

## Constraint Summary

| Constraint | Key Benefit | Required? |
|-----------|-------------|-----------|
| Client-Server | Independent evolution | Yes |
| Stateless | Scalability, reliability | Yes |
| Cacheable | Performance | Yes |
| Uniform Interface | Consistency, simplicity | Yes |
| Layered System | Flexibility, security | Yes |
| Code on Demand | Client extensibility | Optional |

---

## Practical Checklist

```
✅ URLs identify resources (nouns, not verbs)
✅ HTTP methods define actions (GET, POST, PUT, DELETE)
✅ Status codes communicate results (200, 404, 500)
✅ Requests are self-contained (no server-side session state)
✅ Responses declare cacheability (Cache-Control headers)
✅ Consistent JSON format for all endpoints
✅ Works behind load balancers and proxies
```

---

## Key Takeaways

- REST has **six constraints** (five required, one optional)
- **Statelessness** is the most impactful for scalability
- **Uniform interface** ensures consistency across all endpoints
- **Cacheability** is often overlooked but critical for performance
- **Layered system** enables modern infrastructure (CDNs, load balancers)
- You don't need all constraints to have a useful API, but more constraints = more benefits

---

Next, we'll explore **Resources & URIs** — the foundation of REST API design →
