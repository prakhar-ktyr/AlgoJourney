---
title: Setting Up Node.js & Express
---

# Setting Up Node.js & Express

Time to build! In this lesson, we'll set up a Node.js project with Express — the most popular framework for building REST APIs in JavaScript.

---

## Prerequisites

Make sure you have **Node.js 18+** installed:

```bash
node --version   # Should show v18.x or later
npm --version    # Should show 9.x or later
```

If not installed, download from [nodejs.org](https://nodejs.org/).

---

## Create a New Project

```bash
# Create project directory
mkdir my-api
cd my-api

# Initialize package.json
npm init -y
```

Edit `package.json` to enable ES modules:

```json
{
  "name": "my-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  }
}
```

Key settings:
- `"type": "module"` enables `import`/`export` syntax
- `"dev"` script uses `--watch` for auto-restart during development

---

## Install Express

```bash
npm install express
```

Express is a minimal, flexible web framework that provides:
- Routing (mapping URLs to handler functions)
- Middleware (processing requests before handlers)
- Built-in JSON parsing
- Error handling

---

## Create Your First API

Create `index.js`:

```javascript
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
```

---

## Run the Server

```bash
# Production mode
npm start

# Development mode (auto-restart on changes)
npm run dev
```

Test it:

```bash
curl http://localhost:3000/api/health
# { "status": "ok", "timestamp": "2024-01-15T10:30:00.000Z" }
```

---

## Project Structure

As your API grows, organize files like this:

```
my-api/
├── index.js           ← Entry point, app setup
├── package.json
├── .env               ← Environment variables
├── routes/
│   ├── users.js       ← User routes
│   └── posts.js       ← Post routes
├── middleware/
│   ├── auth.js        ← Authentication
│   └── validate.js    ← Validation
├── models/
│   └── User.js        ← Database models
└── utils/
    └── errors.js      ← Error helpers
```

---

## Basic Middleware

Middleware functions run **before** your route handlers:

```javascript
import express from "express";

const app = express();

// Built-in middleware
app.use(express.json());            // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data

// Custom middleware — runs for every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // Pass to the next middleware/handler
});

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000);
```

---

## Environment Variables

Use `.env` files for configuration:

```bash
npm install dotenv
```

Create `.env`:

```
PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/myapi
JWT_SECRET=your-secret-key
```

Load in `index.js`:

```javascript
import "dotenv/config";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

console.log(`Environment: ${process.env.NODE_ENV}`);
```

> **Important**: Add `.env` to `.gitignore` — never commit secrets!

---

## Disabling X-Powered-By

Express adds an `X-Powered-By: Express` header by default. Disable it for security:

```javascript
app.disable("x-powered-by");
```

---

## Complete Starter Template

```javascript
import "dotenv/config";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Security
app.disable("x-powered-by");

// Parse request bodies
app.use(express.json({ limit: "1mb" }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

export default app;
```

---

## Try It Yourself

1. Create the project following the steps above
2. Add a `GET /api/time` endpoint that returns the current time
3. Add a `POST /api/echo` endpoint that returns whatever JSON you send it
4. Test with curl or your browser

---

## Key Takeaways

- **Express** is the most popular Node.js web framework for APIs
- Use `"type": "module"` for modern ES module imports
- `express.json()` parses JSON request bodies
- Use `--watch` flag for auto-restart during development
- Always add **404** and **error** handlers
- Store configuration in **environment variables**

---

Next, we'll build our **First API Endpoint** with full CRUD operations →
