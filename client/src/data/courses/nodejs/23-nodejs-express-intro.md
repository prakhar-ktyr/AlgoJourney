---
title: Node.js Express Introduction
---

# Node.js Express Introduction

**Express** is the most popular web framework for Node.js. It provides a thin layer of features on top of the built-in `http` module — routing, middleware, request/response helpers — without hiding the core concepts. Most Node.js APIs and web applications use Express.

## Why Express?

Remember the raw HTTP server from an earlier lesson? Routing, body parsing, static files, and error handling all had to be done manually. Express handles all of that with a clean, minimal API:

```javascript
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
```

That's a complete web server with routing. Compare this to the raw `http` module version that needed URL parsing, method checking, and manual header setting.

## Installation

```bash
mkdir my-api
cd my-api
npm init -y
npm install express
```

If using ES Modules, add `"type": "module"` to `package.json`.

## Your first Express app

Create `index.js`:

```javascript
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Route: GET /
app.get("/", (req, res) => {
  res.send("Welcome to my API!");
});

// Route: GET /about
app.get("/about", (req, res) => {
  res.send("About page");
});

// Route: GET /api/time
app.get("/api/time", (req, res) => {
  res.json({ time: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
```

Run:

```bash
node index.js
```

Visit:
- `http://localhost:3000/` → "Welcome to my API!"
- `http://localhost:3000/about` → "About page"
- `http://localhost:3000/api/time` → `{"time":"2024-01-15T10:30:00.000Z"}`

## Request object (req)

Express extends the Node.js request object with helpful properties:

```javascript
app.get("/api/search", (req, res) => {
  console.log(req.method);         // 'GET'
  console.log(req.path);           // '/api/search'
  console.log(req.query);          // { q: 'node', page: '1' }
  console.log(req.headers);        // { host: 'localhost:3000', ... }
  console.log(req.ip);             // '127.0.0.1'
  console.log(req.protocol);       // 'http'
  console.log(req.hostname);       // 'localhost'
  console.log(req.get("User-Agent")); // browser user agent string

  res.json({ query: req.query });
});
```

## Response object (res)

Express extends the response with convenient methods:

### res.send()

Sends a response and auto-sets Content-Type:

```javascript
res.send("Hello");           // text/html
res.send({ name: "Alice" }); // application/json
res.send(Buffer.from("hi")); // application/octet-stream
```

### res.json()

Sends JSON (always sets Content-Type to application/json):

```javascript
res.json({ users: [{ id: 1, name: "Alice" }] });
```

### res.status()

Sets the HTTP status code (chainable):

```javascript
res.status(201).json({ id: 1, name: "Alice" });
res.status(404).send("Not Found");
res.status(204).end(); // no body
```

### res.redirect()

```javascript
res.redirect("/new-url");
res.redirect(301, "/permanent-new-url"); // permanent redirect
```

### res.sendFile()

Send a file:

```javascript
import path from "node:path";

app.get("/download", (req, res) => {
  res.sendFile(path.resolve("files/report.pdf"));
});
```

### res.set()

Set response headers:

```javascript
res.set("X-Custom-Header", "MyValue");
res.set("Cache-Control", "no-cache");
```

## HTTP methods

Express has methods for every HTTP verb:

```javascript
app.get("/users", (req, res) => { ... });     // Read
app.post("/users", (req, res) => { ... });    // Create
app.put("/users/:id", (req, res) => { ... }); // Replace
app.patch("/users/:id", (req, res) => { ... }); // Update
app.delete("/users/:id", (req, res) => { ... }); // Delete

// Match ALL methods
app.all("/secret", (req, res) => {
  res.send("This matches any HTTP method");
});
```

## Route parameters

Dynamic segments in the URL:

```javascript
app.get("/users/:id", (req, res) => {
  const userId = req.params.id; // '123'
  res.json({ userId });
});

// Multiple params
app.get("/users/:userId/posts/:postId", (req, res) => {
  const { userId, postId } = req.params;
  res.json({ userId, postId });
});
```

Request to `/users/42/posts/7` gives `{ userId: '42', postId: '7' }`.

## Query strings

Parsed automatically into `req.query`:

```javascript
app.get("/api/search", (req, res) => {
  // URL: /api/search?q=node&page=2&limit=10
  const { q, page = "1", limit = "10" } = req.query;
  res.json({ q, page, limit });
});
```

## A complete mini API

```javascript
import express from "express";

const app = express();
app.use(express.json()); // parse JSON request bodies

const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

// GET all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// GET one user
app.get("/api/users/:id", (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// POST create a user
app.post("/api/users", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  const newUser = { id: users.length + 1, name, email };
  users.push(newUser);
  res.status(201).json(newUser);
});

// DELETE a user
app.delete("/api/users/:id", (req, res) => {
  const index = users.findIndex((u) => u.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "User not found" });
  users.splice(index, 1);
  res.status(204).end();
});

app.listen(3000, () => {
  console.log("API running at http://localhost:3000/");
});
```

Test with curl:

```bash
# Get all users
curl http://localhost:3000/api/users

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie", "email": "charlie@example.com"}'

# Delete a user
curl -X DELETE http://localhost:3000/api/users/1
```

## Development with nodemon

Install nodemon to auto-restart on file changes:

```bash
npm install -D nodemon
```

Add a dev script to `package.json`:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

```bash
npm run dev
```

Or use Node.js built-in watch mode (18.11+):

```bash
node --watch index.js
```

## Key takeaways

- Express is a minimal, flexible web framework for Node.js.
- Use `app.get()`, `app.post()`, etc. for routing.
- `req.params` for URL parameters, `req.query` for query strings, `req.body` for request bodies.
- `res.json()`, `res.send()`, `res.status()` for sending responses.
- `express.json()` middleware is needed to parse JSON request bodies.
- Use `nodemon` or `node --watch` for development auto-restart.
