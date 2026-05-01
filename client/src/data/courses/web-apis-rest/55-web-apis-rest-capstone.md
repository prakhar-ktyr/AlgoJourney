---
title: Capstone: Build a Complete REST API
---

# Capstone: Build a Complete REST API

Let's bring everything together by building a **Bookstore API** from scratch — a complete, production-ready REST API.

---

## Project Overview

Build an API with:

- **Resources**: Books, Authors, Reviews, Users
- **Auth**: JWT-based registration and login
- **Features**: CRUD, pagination, filtering, sorting, file upload (book covers)
- **Security**: Rate limiting, input validation, CORS
- **Docs**: OpenAPI/Swagger

---

## Project Structure

```
bookstore-api/
├── index.js              ← Entry point
├── config.js             ← Environment config
├── package.json
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── openapi.yaml
├── middleware/
│   ├── auth.js           ← JWT verification
│   ├── validate.js       ← Input validation
│   ├── errorHandler.js   ← Global error handler
│   └── rateLimit.js
├── routes/
│   ├── auth.js
│   ├── books.js
│   ├── authors.js
│   └── reviews.js
├── models/
│   ├── User.js
│   ├── Book.js
│   ├── Author.js
│   └── Review.js
└── __tests__/
    ├── auth.test.js
    ├── books.test.js
    └── authors.test.js
```

---

## Step 1: Setup

```bash
mkdir bookstore-api && cd bookstore-api
npm init -y
npm install express mongoose dotenv jsonwebtoken bcrypt \
  helmet cors express-rate-limit pino pino-http
npm install -D vitest supertest
```

```javascript
// index.js
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import authorRoutes from "./routes/authors.js";
import reviewRoutes from "./routes/reviews.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(pinoHttp());
app.use(rateLimit({ windowMs: 60000, max: 100 }));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/authors", authorRoutes);
app.use("/api/v1/reviews", reviewRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Error handler (must be last)
app.use(errorHandler);

// Start server (skip in tests)
if (process.env.NODE_ENV !== "test") {
  await mongoose.connect(process.env.DATABASE_URL);
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
}

export default app;
```

---

## Step 2: Models

```javascript
// models/Book.js
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200 },
  isbn: { type: String, required: true, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Author", required: true },
  genre: { type: String, enum: ["fiction", "non-fiction", "sci-fi", "fantasy", "mystery"] },
  publishedYear: Number,
  pages: Number,
  summary: { type: String, maxlength: 2000 },
  coverUrl: String,
}, { timestamps: true });

bookSchema.index({ title: "text", isbn: 1 });

export default mongoose.model("Book", bookSchema);
```

---

## Step 3: Routes with Full CRUD

```javascript
// routes/books.js
import { Router } from "express";
import Book from "../models/Book.js";
import { authenticate } from "../middleware/auth.js";
import { validate, bookSchema } from "../middleware/validate.js";

const router = Router();

// Public: List books with pagination, filter, sort
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, genre, sort = "-createdAt", search } = req.query;
    const filter = {};
    if (genre) filter.genre = genre;
    if (search) filter.$text = { $search: search };

    const [data, total] = await Promise.all([
      Book.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).populate("author"),
      Book.countDocuments(filter),
    ]);

    res.json({ data, pagination: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// Public: Get one book
router.get("/:id", async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate("author");
    if (!book) return res.status(404).json({ error: { code: "NOT_FOUND" } });
    res.json({ data: book });
  } catch (err) { next(err); }
});

// Protected: Create
router.post("/", authenticate, validate(bookSchema), async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ data: book });
  } catch (err) { next(err); }
});

// Protected: Update
router.patch("/:id", authenticate, async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ error: { code: "NOT_FOUND" } });
    res.json({ data: book });
  } catch (err) { next(err); }
});

// Protected: Delete
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: { code: "NOT_FOUND" } });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
```

---

## Step 4: Test

```javascript
// __tests__/books.test.js
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../index.js";

describe("Books API", () => {
  it("GET /api/v1/books returns paginated list", async () => {
    const res = await request(app).get("/api/v1/books");
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
  });
});
```

---

## Step 5: Deploy

```bash
# Build and run with Docker
docker compose up -d

# Or deploy to Railway/Render
git push origin main  # CI/CD handles the rest
```

---

## Congratulations! 🎉

You've completed the **Web APIs & REST** course! You now know how to:

- Design RESTful APIs following best practices
- Implement CRUD, authentication, pagination, and caching
- Secure APIs with JWT, rate limiting, and input validation
- Test APIs with Postman and automated testing
- Document APIs with OpenAPI/Swagger
- Deploy with Docker and CI/CD
- Monitor with logging and alerting

**Keep building!** The best way to solidify these skills is to build real projects.
