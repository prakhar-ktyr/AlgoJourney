---
title: Node.js Project Structure
---

# Node.js Project Structure

A good project structure makes your code easier to navigate, test, and maintain. As your app grows from 100 to 10,000 lines, structure becomes critical.

## Starter structure (small projects)

```
my-app/
├── package.json
├── .env
├── .env.example
├── .gitignore
├── server.js          # entry point
├── config.js          # environment & configuration
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── postRoutes.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   └── postController.js
├── models/
│   ├── User.js
│   ├── Post.js
│   └── index.js       # barrel export
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validate.js
├── utils/
│   └── helpers.js
└── __tests__/
    ├── auth.test.js
    └── user.test.js
```

## MVC pattern

**Model–View–Controller** separates concerns:

| Layer | Responsibility | Files |
|-------|---------------|-------|
| **Model** | Data schema, database queries | `models/User.js` |
| **View** | Response formatting (or frontend) | JSON responses / React |
| **Controller** | Business logic, request handling | `controllers/userController.js` |
| **Route** | URL mapping, middleware chain | `routes/userRoutes.js` |

### Model

```javascript
// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
```

### Controller

```javascript
// controllers/userController.js
import User from "../models/User.js";

export async function getAllUsers(req, res) {
  const users = await User.find().select("-password");
  res.json(users);
}

export async function getUserById(req, res) {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
}

export async function updateUser(req, res) {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  ).select("-password");

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
}

export async function deleteUser(req, res) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.status(204).end();
}
```

### Routes

```javascript
// routes/userRoutes.js
import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, getAllUsers);
router.get("/:id", authenticateToken, getUserById);
router.put("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteUser);

export default router;
```

### Entry point

```javascript
// server.js
import express from "express";
import helmet from "helmet";
import cors from "cors";
import config from "./config.js";
import connectDB from "./db.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Global middleware
app.use(helmet());
app.use(cors({ origin: config.clientUrl }));
app.use(express.json({ limit: "10kb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Error handling
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== "test") {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

export default app; // for testing
```

## Middleware pattern

### Authentication middleware

```javascript
// middleware/auth.js
import jwt from "jsonwebtoken";
import config from "../config.js";

export function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
```

### Error handling middleware

```javascript
// middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate entry" });
  }

  res.status(err.statusCode || 500).json({
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
}
```

## Larger project structure

For bigger applications, organize by **feature** (domain):

```
src/
├── app.js              # Express app setup
├── server.js           # Entry point (listen + DB)
├── config/
│   ├── index.js        # Configuration
│   └── database.js     # DB connection
├── features/
│   ├── auth/
│   │   ├── authRoutes.js
│   │   ├── authController.js
│   │   ├── authService.js       # business logic
│   │   └── auth.test.js
│   ├── users/
│   │   ├── userRoutes.js
│   │   ├── userController.js
│   │   ├── userService.js
│   │   ├── User.js              # model
│   │   └── users.test.js
│   └── posts/
│       ├── postRoutes.js
│       ├── postController.js
│       ├── postService.js
│       ├── Post.js
│       └── posts.test.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── validate.js
├── utils/
│   ├── AppError.js
│   └── email.js
└── __tests__/
    └── integration/
        └── api.test.js
```

### Service layer

Separate business logic from HTTP handling:

```javascript
// features/users/userService.js
import User from "./User.js";
import AppError from "../../utils/AppError.js";

export async function findAllUsers() {
  return User.find().select("-password");
}

export async function findUserById(id) {
  const user = await User.findById(id).select("-password");
  if (!user) throw new AppError("User not found", 404);
  return user;
}
```

```javascript
// features/users/userController.js
import * as userService from "./userService.js";

export async function getAllUsers(req, res) {
  const users = await userService.findAllUsers();
  res.json(users);
}

export async function getUserById(req, res) {
  const user = await userService.findUserById(req.params.id);
  res.json(user);
}
```

## Barrel exports

Re-export from `index.js` for cleaner imports:

```javascript
// models/index.js
export { default as User } from "./User.js";
export { default as Post } from "./Post.js";
export { default as Comment } from "./Comment.js";
```

```javascript
import { User, Post } from "./models/index.js";
```

## Configuration module

```javascript
// config/index.js
import "dotenv/config";

function required(name) {
  if (!process.env[name]) {
    throw new Error(`Missing env var: ${name}`);
  }
  return process.env[name];
}

export default {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  db: {
    url: required("DATABASE_URL"),
  },
  jwt: {
    secret: required("JWT_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  },
};
```

## Naming conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files | camelCase or kebab-case | `userController.js` |
| Models | PascalCase | `User.js` |
| Routes | camelCase with suffix | `userRoutes.js` |
| Env vars | UPPER_SNAKE_CASE | `DATABASE_URL` |
| Functions | camelCase | `getAllUsers` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |

## Key takeaways

- Start with a **simple flat structure** and refactor as you grow.
- Use **MVC** to separate models, controllers, and routes.
- Keep the entry point thin — setup only, no business logic.
- Use **middleware** for cross-cutting concerns (auth, validation, errors).
- For larger apps, organize by **feature** with a service layer.
- Use barrel exports (`index.js`) for cleaner imports.
- Centralize configuration and validate required env vars at startup.
