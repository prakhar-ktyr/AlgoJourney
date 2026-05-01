---
title: Representations
---

# Representations

In REST, clients never interact with resources directly. Instead, they exchange **representations** — formatted versions of the resource's current state.

---

## What is a Representation?

A resource exists on the server (e.g., a database record). A representation is how that resource is **presented** to the client:

```
Resource (on server):
  Database record: { _id: ObjectId("..."), name: "Alice", passwordHash: "..." }

Representation (sent to client):
  JSON: { "id": 42, "name": "Alice", "email": "alice@example.com" }
```

The representation is **not** the resource itself — it's a view of it. The same resource can have multiple representations.

---

## JSON Representation

The most common format for REST APIs:

```javascript
// GET /api/users/42
app.get("/api/users/:id", async (req, res) => {
  const user = await db.findById(req.params.id);

  // Transform database record into a representation
  const representation = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    links: {
      self: `/api/users/${user._id}`,
      posts: `/api/users/${user._id}/posts`,
    },
  };

  // Note: passwordHash is NOT included in the representation
  res.json(representation);
});
```

---

## Content Negotiation

Clients can request different representations of the same resource using the `Accept` header:

```
GET /api/users/42
Accept: application/json

→ { "id": 42, "name": "Alice" }
```

```
GET /api/users/42
Accept: application/xml

→ <user><id>42</id><name>Alice</name></user>
```

```
GET /api/users/42
Accept: text/csv

→ id,name
   42,Alice
```

### Implementing in Express

```javascript
app.get("/api/users/:id", (req, res) => {
  const user = { id: 42, name: "Alice", email: "alice@example.com" };

  res.format({
    "application/json": () => {
      res.json(user);
    },
    "application/xml": () => {
      res.type("xml").send(`<user><id>${user.id}</id><name>${user.name}</name></user>`);
    },
    "text/csv": () => {
      res.type("csv").send(`id,name,email\n${user.id},${user.name},${user.email}`);
    },
    default: () => {
      res.status(406).json({ error: "Not Acceptable" });
    },
  });
});
```

---

## Input vs Output Representations

The representation for **creating** a resource differs from the representation for **reading** it:

### Input (POST/PUT)

```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "securePassword123"
}
```

### Output (GET response)

```json
{
  "id": 42,
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "role": "user",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

Notice:
- **Input** includes `password` but **output** never does
- **Output** includes `id`, `createdAt`, `updatedAt` (server-generated)
- The shapes can be completely different

---

## Representation Patterns

### Envelope Pattern

Wrap the data in a container:

```json
{
  "data": { "id": 42, "name": "Alice" },
  "meta": { "requestId": "abc-123", "timestamp": "2024-01-15T10:30:00Z" }
}
```

### Collection with Metadata

```json
{
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Partial Representation (Sparse Fields)

Allow clients to request only specific fields:

```
GET /api/users/42?fields=name,email
```

```json
{
  "name": "Alice",
  "email": "alice@example.com"
}
```

### Expanded Representation (Embedding)

Include related resources inline:

```
GET /api/posts/7?expand=author,comments
```

```json
{
  "id": 7,
  "title": "Understanding REST",
  "author": {
    "id": 42,
    "name": "Alice"
  },
  "comments": [
    { "id": 1, "text": "Great post!", "author": "Bob" }
  ]
}
```

Without expansion:

```json
{
  "id": 7,
  "title": "Understanding REST",
  "authorId": 42
}
```

---

## Transforming Representations

Use serialization functions to control what's exposed:

```javascript
function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
    createdAt: user.createdAt.toISOString(),
  };
  // Excludes: passwordHash, __v, internal fields
}

function serializeUserList(users) {
  return users.map(serializeUser);
}

app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json({ data: serializeUserList(users) });
});

app.get("/api/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(serializeUser(user));
});
```

---

## Key Takeaways

- A **representation** is a formatted view of a resource's state
- **JSON** is the standard representation format for REST APIs
- **Content negotiation** allows different formats via the `Accept` header
- Input and output representations are usually **different**
- Never expose sensitive fields (passwords, internal IDs) in representations
- Use **serialization functions** to control what's sent to clients

---

Next, we'll explore **Statelessness** — the constraint that enables REST APIs to scale →
