---
title: Node.js Routing
---

# Node.js Routing

Routing determines how your application responds to a client request to a particular endpoint (URL + HTTP method). Express provides a powerful, flexible routing system.

## Basic routing

A route definition takes the form: `app.METHOD(PATH, HANDLER)`

```javascript
app.get("/", (req, res) => {
  res.send("Home page");
});

app.post("/login", (req, res) => {
  res.send("Login");
});

app.put("/users/:id", (req, res) => {
  res.send(`Update user ${req.params.id}`);
});

app.delete("/users/:id", (req, res) => {
  res.send(`Delete user ${req.params.id}`);
});
```

## Route parameters

Parameters are named URL segments prefixed with `:`:

```javascript
app.get("/users/:id", (req, res) => {
  res.json({ userId: req.params.id });
});
// GET /users/42 → { "userId": "42" }

app.get("/posts/:year/:month", (req, res) => {
  const { year, month } = req.params;
  res.json({ year, month });
});
// GET /posts/2024/01 → { "year": "2024", "month": "01" }
```

> **Note:** Parameters are always strings. Convert to numbers when needed: `Number(req.params.id)`.

### Parameter constraints with regex

```javascript
// Only match numeric IDs
app.get("/users/:id(\\d+)", (req, res) => {
  res.json({ userId: Number(req.params.id) });
});
// GET /users/42 → matches
// GET /users/abc → does NOT match (falls through to 404)
```

## Query strings

Query parameters are parsed automatically into `req.query`:

```javascript
app.get("/api/search", (req, res) => {
  // GET /api/search?q=node&sort=date&page=2
  const { q, sort = "relevance", page = "1" } = req.query;
  res.json({ q, sort, page: Number(page) });
});
```

For array parameters:

```javascript
// GET /api/filter?color=red&color=blue
app.get("/api/filter", (req, res) => {
  const colors = [].concat(req.query.color || []);
  res.json({ colors }); // ["red", "blue"]
});
```

## Route patterns

### Wildcards

```javascript
// Match any path starting with /api/
app.get("/api/*", (req, res) => {
  res.send(`Matched: ${req.path}`);
});
```

### String patterns

```javascript
app.get("/ab?cd", (req, res) => {
  // Matches /acd and /abcd
  res.send("ab?cd");
});

app.get("/ab+cd", (req, res) => {
  // Matches /abcd, /abbcd, /abbbcd, etc.
  res.send("ab+cd");
});
```

## Route handlers

### Multiple handlers (chaining)

```javascript
function validateId(req, res, next) {
  const id = Number(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  req.userId = id;
  next(); // pass control to the next handler
}

app.get("/users/:id", validateId, (req, res) => {
  res.json({ userId: req.userId });
});
```

### Array of handlers

```javascript
const handlers = [authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "Admin panel" });
}];

app.get("/admin", handlers);
```

## app.route() — Chained route methods

Group different HTTP methods for the same path:

```javascript
app.route("/users")
  .get((req, res) => {
    res.json({ users: [] });
  })
  .post((req, res) => {
    res.status(201).json({ user: req.body });
  });

app.route("/users/:id")
  .get((req, res) => {
    res.json({ userId: req.params.id });
  })
  .put((req, res) => {
    res.json({ updated: req.params.id });
  })
  .delete((req, res) => {
    res.status(204).end();
  });
```

## express.Router — Modular routing

For large applications, split routes into separate files using `Router`:

### routes/users.js

```javascript
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json([{ id: 1, name: "Alice" }]);
});

router.get("/:id", (req, res) => {
  res.json({ id: req.params.id, name: "Alice" });
});

router.post("/", (req, res) => {
  res.status(201).json(req.body);
});

router.delete("/:id", (req, res) => {
  res.status(204).end();
});

export default router;
```

### routes/posts.js

```javascript
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json([{ id: 1, title: "First Post" }]);
});

router.get("/:id", (req, res) => {
  res.json({ id: req.params.id, title: "First Post" });
});

export default router;
```

### index.js

```javascript
import express from "express";
import usersRouter from "./routes/users.js";
import postsRouter from "./routes/posts.js";

const app = express();
app.use(express.json());

// Mount routers with a prefix
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);

app.listen(3000);
```

Now:
- `GET /api/users` → users router's `GET /`
- `GET /api/users/42` → users router's `GET /:id`
- `GET /api/posts` → posts router's `GET /`

## Nested routers

Routers can mount other routers:

```javascript
// routes/api.js
import { Router } from "express";
import usersRouter from "./users.js";
import postsRouter from "./posts.js";

const router = Router();
router.use("/users", usersRouter);
router.use("/posts", postsRouter);

export default router;

// index.js
import apiRouter from "./routes/api.js";
app.use("/api", apiRouter);
```

## 404 handling

Add a catch-all at the **end** of all route definitions:

```javascript
// All your routes above...
app.get("/", (req, res) => { ... });
app.use("/api/users", usersRouter);

// 404 handler — must be LAST
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});
```

Express matches routes in order. If no route matches, the 404 handler runs.

## Route order matters

Express evaluates routes top to bottom. More specific routes should come before generic ones:

```javascript
// WRONG ORDER — /users/profile never matches because :id catches it
app.get("/users/:id", (req, res) => { ... });
app.get("/users/profile", (req, res) => { ... });

// CORRECT ORDER — specific before generic
app.get("/users/profile", (req, res) => { ... });
app.get("/users/:id", (req, res) => { ... });
```

## Key takeaways

- Routes match by HTTP method + path.
- `req.params` for URL parameters, `req.query` for query strings.
- Use `express.Router()` to split routes into separate files.
- Mount routers with `app.use(prefix, router)`.
- Route order matters — specific routes before generic ones.
- Add a 404 handler as the last middleware.
