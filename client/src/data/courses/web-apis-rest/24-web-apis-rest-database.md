---
title: Database Integration
---

# Database Integration

Real APIs need persistent storage. This lesson covers integrating **MongoDB** with Mongoose — the most popular database choice for Node.js REST APIs.

---

## Why MongoDB?

- **JSON-native**: Stores data as JSON-like documents (BSON)
- **Flexible schema**: Fields can vary between documents
- **Great with Node.js**: Mongoose provides a powerful ODM (Object Document Mapper)
- **Scalable**: Built-in replication and sharding

---

## Setup

```bash
npm install mongoose
```

### Connection

```javascript
// db.js
import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/myapi";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}
```

```javascript
// index.js
import express from "express";
import { connectDB } from "./db.js";

const app = express();
app.use(express.json());

// Connect before starting the server
await connectDB();

app.listen(3000, () => console.log("API running on port 3000"));
```

---

## Define a Model

```javascript
// models/Task.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [200, "Title too long"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

export default mongoose.model("Task", taskSchema);
```

---

## CRUD with Mongoose

### Create

```javascript
import Task from "./models/Task.js";

app.post("/api/tasks", async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      priority: req.body.priority,
    });
    res.status(201).json(task);
  } catch (error) {
    if (error.name === "ValidationError") {
      const details = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({ error: "Validation failed", details });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
```

### Read

```javascript
// List with filtering, sorting, pagination
app.get("/api/tasks", async (req, res) => {
  const filter = {};
  if (req.query.completed !== undefined) {
    filter.completed = req.query.completed === "true";
  }
  if (req.query.priority) {
    filter.priority = req.query.priority;
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const sortField = req.query.sort || "-createdAt";

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sortField).skip(skip).limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    data: tasks,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// Get by ID
app.get("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
```

### Update

```javascript
app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return updated doc, run schema validators
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    if (error.name === "ValidationError") {
      const details = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({ error: "Validation failed", details });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
```

### Delete

```javascript
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(204).send();
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
```

---

## Error Handling Middleware

Centralize error handling:

```javascript
app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ error: "Validation failed", details });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate key error" });
  }

  res.status(500).json({ error: "Internal server error" });
});
```

---

## Key Takeaways

- Use **Mongoose** as the ODM for MongoDB in Node.js APIs
- Define **schemas** with validation rules (required, min, max, enum)
- Use `timestamps: true` for automatic `createdAt`/`updatedAt`
- Handle **Mongoose errors** (ValidationError, CastError, duplicate keys)
- Always use `{ new: true, runValidators: true }` with `findByIdAndUpdate`
- Centralize error handling in **middleware**

---

Next, we'll implement **Pagination** — essential for handling large datasets →
