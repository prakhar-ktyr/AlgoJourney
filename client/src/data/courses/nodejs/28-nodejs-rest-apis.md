---
title: Node.js REST APIs
---

# Node.js REST APIs

A **REST API** (Representational State Transfer) is the standard way to build web APIs. It uses HTTP methods and URLs to perform CRUD operations on resources. This lesson shows you how to design and build a production-quality REST API with Express.

## REST principles

1. **Resources** are identified by URLs: `/api/users`, `/api/posts/42`
2. **HTTP methods** define the action: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)
3. **Stateless** — each request contains all the information needed; no server-side session
4. **JSON** is the standard data format for request and response bodies

## HTTP methods and CRUD

| HTTP Method | CRUD Operation | URL Example | Description |
|---|---|---|---|
| GET | Read | `/api/users` | List all users |
| GET | Read | `/api/users/42` | Get user 42 |
| POST | Create | `/api/users` | Create a new user |
| PUT | Replace | `/api/users/42` | Replace user 42 entirely |
| PATCH | Update | `/api/users/42` | Update specific fields |
| DELETE | Delete | `/api/users/42` | Delete user 42 |

## HTTP status codes

| Code | Meaning | When to use |
|---|---|---|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Server bug |

## Building a complete REST API

Let's build a full CRUD API for a "tasks" resource:

```javascript
import express from "express";

const app = express();
app.use(express.json());

// In-memory data store (replace with a database in production)
let tasks = [
  { id: 1, title: "Learn Node.js", completed: false, createdAt: new Date().toISOString() },
  { id: 2, title: "Build an API", completed: false, createdAt: new Date().toISOString() },
];
let nextId = 3;

// GET /api/tasks — List all tasks
app.get("/api/tasks", (req, res) => {
  const { completed, sort } = req.query;

  let result = [...tasks];

  // Filter by completion status
  if (completed !== undefined) {
    const isCompleted = completed === "true";
    result = result.filter((t) => t.completed === isCompleted);
  }

  // Sort
  if (sort === "title") {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === "date") {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json({
    count: result.length,
    tasks: result,
  });
});

// GET /api/tasks/:id — Get a single task
app.get("/api/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
});

// POST /api/tasks — Create a task
app.post("/api/tasks", (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({ error: "Title is required" });
  }

  const task = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  res.status(201).json(task);
});

// PUT /api/tasks/:id — Replace a task
app.put("/api/tasks/:id", (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, completed } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Title is required" });
  }

  tasks[index] = {
    ...tasks[index],
    title: title.trim(),
    completed: Boolean(completed),
  };

  res.json(tasks[index]);
});

// PATCH /api/tasks/:id — Partial update
app.patch("/api/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, completed } = req.body;

  if (title !== undefined) task.title = title.trim();
  if (completed !== undefined) task.completed = Boolean(completed);

  res.json(task);
});

// DELETE /api/tasks/:id — Delete a task
app.delete("/api/tasks/:id", (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(index, 1);
  res.status(204).end();
});

app.listen(3000, () => {
  console.log("Task API running at http://localhost:3000/");
});
```

## Testing with curl

```bash
# List all tasks
curl http://localhost:3000/api/tasks

# Get a specific task
curl http://localhost:3000/api/tasks/1

# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write documentation"}'

# Update a task (partial)
curl -X PATCH http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete a task
curl -X DELETE http://localhost:3000/api/tasks/1

# Filter and sort
curl "http://localhost:3000/api/tasks?completed=false&sort=title"
```

## Response format conventions

### Consistent response structure

```javascript
// Success
{
  "data": { ... },       // or array for collections
  "count": 10,           // for collections
  "page": 1,
  "totalPages": 5
}

// Error
{
  "error": "Not Found",
  "message": "Task with ID 999 does not exist",
  "statusCode": 404
}
```

### Pagination

```javascript
app.get("/api/tasks", (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const paginated = tasks.slice(skip, skip + limit);

  res.json({
    tasks: paginated,
    page,
    limit,
    total: tasks.length,
    totalPages: Math.ceil(tasks.length / limit),
  });
});
```

## URL design best practices

| Good | Bad | Why |
|---|---|---|
| `/api/users` | `/api/getUsers` | Verbs in methods, not URLs |
| `/api/users/42` | `/api/user/42` | Plural nouns |
| `/api/users/42/posts` | `/api/getUserPosts?id=42` | Nested resources |
| `/api/v2/users` | `/api/users-v2` | Version prefix |

## Versioning

```javascript
import v1Router from "./routes/v1/index.js";
import v2Router from "./routes/v2/index.js";

app.use("/api/v1", v1Router);
app.use("/api/v2", v2Router);
```

## Key takeaways

- REST APIs use HTTP methods (GET, POST, PUT, PATCH, DELETE) on resource URLs.
- Use proper HTTP status codes (200, 201, 204, 400, 404, 500).
- Keep URLs noun-based and plural (`/api/users`, not `/api/getUser`).
- Validate input and return clear error messages.
- Support filtering, sorting, and pagination for list endpoints.
- Use consistent response formats across all endpoints.
