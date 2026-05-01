---
title: Route Parameters
---

# Route Parameters

Route parameters are dynamic segments in URLs that capture values. They're fundamental to REST APIs for identifying specific resources.

---

## Basic Route Parameters

In Express, route parameters are defined with `:` prefix:

```javascript
// :id is a route parameter
app.get("/api/users/:id", (req, res) => {
  console.log(req.params.id); // "42" (always a string)
  const user = findUser(Number(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});
```

```
GET /api/users/42    → req.params.id = "42"
GET /api/users/abc   → req.params.id = "abc"
GET /api/users/      → 404 (no match — param is required)
```

---

## Multiple Parameters

```javascript
app.get("/api/users/:userId/posts/:postId", (req, res) => {
  const { userId, postId } = req.params;
  // userId = "42", postId = "7"
});
```

```
GET /api/users/42/posts/7
  → req.params = { userId: "42", postId: "7" }
```

---

## Parameter Validation

Route params are always strings. Always validate and convert them:

```javascript
app.get("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);

  // Check it's a valid number
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID — must be a positive integer" });
  }

  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});
```

For UUID parameters:

```javascript
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

app.get("/api/users/:id", (req, res) => {
  if (!UUID_REGEX.test(req.params.id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  // ...
});
```

---

## Express Router

For larger APIs, organize routes with `express.Router()`:

```javascript
// routes/users.js
import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.json({ data: users });
});

router.get("/:id", (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

router.post("/", (req, res) => {
  // Create user...
  res.status(201).json(newUser);
});

export default router;
```

```javascript
// index.js
import express from "express";
import usersRouter from "./routes/users.js";
import postsRouter from "./routes/posts.js";

const app = express();
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);

app.listen(3000);
```

---

## Route Parameter Middleware

Use `router.param()` to run logic for a specific parameter:

```javascript
const router = Router();

// Runs whenever :id is in the route
router.param("id", (req, res, next, id) => {
  const numId = Number(id);
  if (isNaN(numId) || numId < 1) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  req.resourceId = numId;
  next();
});

router.get("/:id", (req, res) => {
  // req.resourceId is already validated and converted
  const user = users.find((u) => u.id === req.resourceId);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});
```

---

## Route Order Matters

Express matches routes in the order they're defined. Put specific routes before parameterized ones:

```javascript
// ✅ Correct order
app.get("/api/users/me", (req, res) => { /* current user */ });
app.get("/api/users/:id", (req, res) => { /* user by ID */ });

// ❌ Wrong order — /users/me would match :id = "me"
app.get("/api/users/:id", (req, res) => { /* user by ID */ });
app.get("/api/users/me", (req, res) => { /* never reached! */ });
```

---

## Optional Parameters

Express doesn't have optional params, but you can handle it with multiple routes or query params:

```javascript
// Two separate routes
app.get("/api/users", listUsers);
app.get("/api/users/:id", getUser);

// Or use query params for optional data
// GET /api/users?role=admin
app.get("/api/users", (req, res) => {
  const role = req.query.role; // optional
});
```

---

## Key Takeaways

- Route parameters use `:paramName` syntax in Express
- Params are always **strings** — validate and convert them
- Use `express.Router()` to organize routes into modules
- Route **order matters** — specific routes before parameterized ones
- Use `router.param()` for reusable parameter validation

---

Next, we'll learn about **Request Validation** — ensuring incoming data is correct →
