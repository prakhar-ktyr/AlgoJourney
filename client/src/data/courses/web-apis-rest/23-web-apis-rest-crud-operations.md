---
title: CRUD Operations
---

# CRUD Operations

CRUD (Create, Read, Update, Delete) is the foundation of every REST API. This lesson builds a complete, production-ready CRUD API with proper error handling, validation, and response formatting.

---

## The Complete CRUD API

We'll build a **Tasks API** — a to-do list backend:

```javascript
import express from "express";
import { randomUUID } from "crypto";

const app = express();
app.use(express.json());

// In-memory store
const tasks = new Map();

// Seed data
const seed = [
  { title: "Learn REST APIs", completed: false, priority: "high" },
  { title: "Build a project", completed: false, priority: "medium" },
  { title: "Read documentation", completed: true, priority: "low" },
];
seed.forEach((t) => {
  const id = randomUUID();
  tasks.set(id, { id, ...t, createdAt: new Date().toISOString() });
});
```

---

## CREATE — POST /api/tasks

```javascript
app.post("/api/tasks", (req, res) => {
  const { title, priority } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({ error: "Title is required" });
  }

  const validPriorities = ["low", "medium", "high"];
  const taskPriority = priority && validPriorities.includes(priority) ? priority : "medium";

  const task = {
    id: randomUUID(),
    title: title.trim(),
    completed: false,
    priority: taskPriority,
    createdAt: new Date().toISOString(),
  };

  tasks.set(task.id, task);

  res.status(201).json(task);
});
```

---

## READ — GET /api/tasks

### List All (with filtering and sorting)

```javascript
app.get("/api/tasks", (req, res) => {
  let result = Array.from(tasks.values());

  // Filter by completed status
  if (req.query.completed !== undefined) {
    const completed = req.query.completed === "true";
    result = result.filter((t) => t.completed === completed);
  }

  // Filter by priority
  if (req.query.priority) {
    result = result.filter((t) => t.priority === req.query.priority);
  }

  // Sort
  if (req.query.sort === "title") {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else if (req.query.sort === "-title") {
    result.sort((a, b) => b.title.localeCompare(a.title));
  } else {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Pagination
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const start = (page - 1) * limit;
  const paginatedResult = result.slice(start, start + limit);

  res.json({
    data: paginatedResult,
    pagination: {
      page,
      limit,
      total: result.length,
      totalPages: Math.ceil(result.length / limit),
    },
  });
});
```

### Get Single

```javascript
app.get("/api/tasks/:id", (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json(task);
});
```

---

## UPDATE — PUT and PATCH

### PUT (Full Replace)

```javascript
app.put("/api/tasks/:id", (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, completed, priority } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Title is required" });
  }

  const updated = {
    id: task.id,
    title: title.trim(),
    completed: Boolean(completed),
    priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
    createdAt: task.createdAt,
    updatedAt: new Date().toISOString(),
  };

  tasks.set(task.id, updated);
  res.json(updated);
});
```

### PATCH (Partial Update)

```javascript
app.patch("/api/tasks/:id", (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const updates = {};

  if (req.body.title !== undefined) {
    if (typeof req.body.title !== "string" || req.body.title.trim().length === 0) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    updates.title = req.body.title.trim();
  }

  if (req.body.completed !== undefined) {
    updates.completed = Boolean(req.body.completed);
  }

  if (req.body.priority !== undefined) {
    if (!["low", "medium", "high"].includes(req.body.priority)) {
      return res.status(400).json({ error: "Invalid priority" });
    }
    updates.priority = req.body.priority;
  }

  const updated = { ...task, ...updates, updatedAt: new Date().toISOString() };
  tasks.set(task.id, updated);
  res.json(updated);
});
```

---

## DELETE — DELETE /api/tasks/:id

```javascript
app.delete("/api/tasks/:id", (req, res) => {
  if (!tasks.has(req.params.id)) {
    return res.status(404).json({ error: "Task not found" });
  }
  tasks.delete(req.params.id);
  res.status(204).send();
});
```

---

## Bulk Operations

Sometimes you need to operate on multiple resources:

```javascript
// Delete completed tasks
app.delete("/api/tasks", (req, res) => {
  if (req.query.completed !== "true") {
    return res.status(400).json({ error: "Must specify completed=true" });
  }
  let count = 0;
  for (const [id, task] of tasks) {
    if (task.completed) {
      tasks.delete(id);
      count++;
    }
  }
  res.json({ deleted: count });
});
```

---

## Testing Your API

```bash
# Create
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write tests", "priority": "high"}'

# List (filtered)
curl "http://localhost:3000/api/tasks?completed=false&priority=high"

# Update
curl -X PATCH http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID
```

---

## Key Takeaways

- CRUD maps directly to **POST, GET, PUT/PATCH, DELETE**
- Always validate input and return **appropriate status codes**
- Support **filtering**, **sorting**, and **pagination** on list endpoints
- Use **PUT** for full replacement, **PATCH** for partial updates
- Return **204** for successful deletes (no body)
- Use **UUIDs** instead of sequential IDs for better security

---

Next, we'll integrate a **Database** for persistent storage →
