---
title: HTTP Methods
---

# HTTP Methods

HTTP methods (also called **verbs**) define what action to perform on a resource. There are several methods, but REST APIs primarily use five.

---

## The Main HTTP Methods

| Method | Purpose | Has Body? | Idempotent? | Safe? |
|--------|---------|-----------|-------------|-------|
| **GET** | Read/retrieve data | No | Yes | Yes |
| **POST** | Create new resource | Yes | No | No |
| **PUT** | Replace entire resource | Yes | Yes | No |
| **PATCH** | Partially update resource | Yes | Yes* | No |
| **DELETE** | Remove a resource | Optional | Yes | No |

**Idempotent** means calling it multiple times produces the same result as calling it once.

**Safe** means it doesn't modify data on the server.

---

## GET — Retrieve Data

`GET` requests data from the server. It should **never** change server state.

```
GET /api/users HTTP/1.1
Host: api.example.com
Accept: application/json
```

```javascript
// Express handler
app.get("/api/users", (req, res) => {
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];
  res.json(users);
});
```

```javascript
// Client-side fetch
const response = await fetch("/api/users");
const users = await response.json();
```

**Rules for GET:**
- Never include a request body
- Should be cacheable
- Should be safe and idempotent
- Query parameters for filtering/sorting: `GET /api/users?role=admin&sort=name`

---

## POST — Create a Resource

`POST` sends data to create a new resource. The server decides the new resource's URL.

```
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "name": "Charlie",
  "email": "charlie@example.com"
}
```

```javascript
// Express handler
app.post("/api/users", (req, res) => {
  const newUser = {
    id: 3, // Server generates the ID
    name: req.body.name,
    email: req.body.email,
  };
  // Save to database...
  res.status(201).json(newUser);
});
```

```javascript
// Client-side fetch
const response = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Charlie", email: "charlie@example.com" }),
});
const newUser = await response.json();
```

**Rules for POST:**
- Returns `201 Created` with the new resource
- Include a `Location` header pointing to the new resource
- NOT idempotent — calling it twice creates two resources

---

## PUT — Replace a Resource

`PUT` replaces an entire resource with the provided data. If the resource doesn't exist, it may create it.

```
PUT /api/users/3 HTTP/1.1
Content-Type: application/json

{
  "name": "Charlie Brown",
  "email": "charlie.brown@example.com",
  "role": "admin"
}
```

```javascript
// Express handler
app.put("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  // Replace the entire user object
  const updatedUser = {
    id: userId,
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  // Save to database...
  res.json(updatedUser);
});
```

**PUT vs POST:**
- PUT targets a **specific resource** (`/users/3`)
- POST targets a **collection** (`/users`)
- PUT is **idempotent** — sending the same PUT twice has the same effect
- PUT **replaces** the entire resource — omitted fields are removed

---

## PATCH — Partially Update

`PATCH` updates **only the specified fields** of a resource, leaving everything else unchanged.

```
PATCH /api/users/3 HTTP/1.1
Content-Type: application/json

{
  "role": "admin"
}
```

Only the `role` field is updated. All other fields (`name`, `email`) stay the same.

```javascript
// Express handler
app.patch("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  // Only update provided fields
  // existingUser = findUser(userId)
  // const updatedUser = { ...existingUser, ...req.body };
  res.json(updatedUser);
});
```

**PUT vs PATCH:**

```
Original:  { "name": "Charlie", "email": "c@ex.com", "role": "user" }

PUT  { "name": "Charlie" }
Result:    { "name": "Charlie" }  ← email and role are GONE

PATCH { "role": "admin" }
Result:    { "name": "Charlie", "email": "c@ex.com", "role": "admin" }
```

Use PUT when you have the complete resource. Use PATCH for partial updates.

---

## DELETE — Remove a Resource

`DELETE` removes a resource from the server.

```
DELETE /api/users/3 HTTP/1.1
Host: api.example.com
```

```javascript
// Express handler
app.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  // Delete from database...
  res.status(204).send(); // No Content
});
```

```javascript
// Client-side fetch
const response = await fetch("/api/users/3", {
  method: "DELETE",
});
// response.status === 204
```

**Rules for DELETE:**
- Returns `204 No Content` (no body) or `200 OK` (with deleted resource)
- Idempotent — deleting an already-deleted resource should return `404` or `204`

---

## Other HTTP Methods

| Method | Purpose | Usage |
|--------|---------|-------|
| **HEAD** | Same as GET but returns only headers (no body) | Check if resource exists, get metadata |
| **OPTIONS** | Returns allowed methods for a resource | CORS preflight requests |
| **TRACE** | Echoes the request back | Debugging (rarely used) |
| **CONNECT** | Establishes a tunnel | Proxy servers |

```bash
# HEAD — check if resource exists without downloading body
curl -I https://api.example.com/api/users/42

# OPTIONS — see what methods are allowed
curl -X OPTIONS https://api.example.com/api/users
```

---

## CRUD Mapping

REST methods map naturally to **CRUD** database operations:

| CRUD | HTTP Method | SQL | Example |
|------|------------|-----|---------|
| **C**reate | POST | INSERT | `POST /api/users` |
| **R**ead | GET | SELECT | `GET /api/users/42` |
| **U**pdate | PUT / PATCH | UPDATE | `PUT /api/users/42` |
| **D**elete | DELETE | DELETE | `DELETE /api/users/42` |

---

## Method Safety Summary

```
Safe + Idempotent:    GET, HEAD, OPTIONS
Idempotent only:      PUT, DELETE
Neither:              POST, PATCH*

*PATCH can be idempotent depending on implementation
```

**Why does this matter?**

- **Safe** methods can be called by web crawlers, prefetched by browsers
- **Idempotent** methods can be safely retried on network failure
- **POST** should never be retried automatically (could create duplicates)

---

## Complete CRUD Example

```javascript
import express from "express";
const app = express();
app.use(express.json());

let users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];
let nextId = 3;

// GET all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// GET single user
app.get("/api/users/:id", (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// POST create user
app.post("/api/users", (req, res) => {
  const user = { id: nextId++, name: req.body.name, email: req.body.email };
  users.push(user);
  res.status(201).json(user);
});

// PUT replace user
app.put("/api/users/:id", (req, res) => {
  const index = users.findIndex((u) => u.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "User not found" });
  users[index] = { id: users[index].id, name: req.body.name, email: req.body.email };
  res.json(users[index]);
});

// PATCH update user
app.patch("/api/users/:id", (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  Object.assign(user, req.body);
  res.json(user);
});

// DELETE user
app.delete("/api/users/:id", (req, res) => {
  users = users.filter((u) => u.id !== Number(req.params.id));
  res.status(204).send();
});

app.listen(3000);
```

---

## Key Takeaways

- **GET** reads, **POST** creates, **PUT** replaces, **PATCH** updates, **DELETE** removes
- Use the right method for the right action — don't use POST for everything
- **GET** and **DELETE** typically have no request body
- **PUT** replaces the whole resource; **PATCH** updates parts of it
- Idempotent methods (GET, PUT, DELETE) can be safely retried
- REST CRUD maps naturally to database operations

---

Next, we'll learn about **HTTP Status Codes** — how servers communicate the result of a request →
