---
title: First API Endpoint
---

# First API Endpoint

Let's build a complete REST API endpoint for managing a collection of books. This covers all the patterns you'll use in every API.

---

## Setting Up

```javascript
import express from "express";
const app = express();
app.use(express.json());

// In-memory data store (we'll use a database later)
let books = [
  { id: 1, title: "The Pragmatic Programmer", author: "David Thomas", year: 1999 },
  { id: 2, title: "Clean Code", author: "Robert C. Martin", year: 2008 },
  { id: 3, title: "Design Patterns", author: "Gang of Four", year: 1994 },
];
let nextId = 4;
```

---

## GET — List All Books

```javascript
app.get("/api/books", (req, res) => {
  res.json({
    data: books,
    total: books.length,
  });
});
```

```bash
curl http://localhost:3000/api/books
```

```json
{
  "data": [
    { "id": 1, "title": "The Pragmatic Programmer", "author": "David Thomas", "year": 1999 },
    { "id": 2, "title": "Clean Code", "author": "Robert C. Martin", "year": 2008 },
    { "id": 3, "title": "Design Patterns", "author": "Gang of Four", "year": 1994 }
  ],
  "total": 3
}
```

---

## GET — Get a Single Book

```javascript
app.get("/api/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  res.json(book);
});
```

```bash
curl http://localhost:3000/api/books/1
# { "id": 1, "title": "The Pragmatic Programmer", ... }

curl http://localhost:3000/api/books/999
# { "error": "Book not found" }  (404)
```

---

## POST — Create a Book

```javascript
app.post("/api/books", (req, res) => {
  const { title, author, year } = req.body;

  // Validation
  const errors = [];
  if (!title || typeof title !== "string") {
    errors.push({ field: "title", message: "Title is required" });
  }
  if (!author || typeof author !== "string") {
    errors.push({ field: "author", message: "Author is required" });
  }
  if (year !== undefined && (typeof year !== "number" || year < 0)) {
    errors.push({ field: "year", message: "Year must be a positive number" });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  const book = {
    id: nextId++,
    title: title.trim(),
    author: author.trim(),
    year: year || null,
  };

  books.push(book);
  res.status(201).json(book);
});
```

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title": "Refactoring", "author": "Martin Fowler", "year": 1999}'
# { "id": 4, "title": "Refactoring", "author": "Martin Fowler", "year": 1999 }
```

---

## PUT — Replace a Book

```javascript
app.put("/api/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = books.findIndex((b) => b.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  const { title, author, year } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: "Title and author are required" });
  }

  books[index] = { id, title: title.trim(), author: author.trim(), year: year || null };
  res.json(books[index]);
});
```

```bash
curl -X PUT http://localhost:3000/api/books/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "The Pragmatic Programmer (20th Anniversary)", "author": "David Thomas & Andrew Hunt", "year": 2019}'
```

---

## PATCH — Partially Update a Book

```javascript
app.patch("/api/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  // Only update provided fields
  if (req.body.title !== undefined) book.title = req.body.title.trim();
  if (req.body.author !== undefined) book.author = req.body.author.trim();
  if (req.body.year !== undefined) book.year = req.body.year;

  res.json(book);
});
```

```bash
curl -X PATCH http://localhost:3000/api/books/1 \
  -H "Content-Type: application/json" \
  -d '{"year": 2019}'
# Only year is updated, title and author stay the same
```

---

## DELETE — Remove a Book

```javascript
app.delete("/api/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = books.findIndex((b) => b.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  books.splice(index, 1);
  res.status(204).send();
});
```

```bash
curl -X DELETE http://localhost:3000/api/books/1
# 204 No Content
```

---

## Complete Server

```javascript
import express from "express";
const app = express();
app.use(express.json());

let books = [
  { id: 1, title: "The Pragmatic Programmer", author: "David Thomas", year: 1999 },
  { id: 2, title: "Clean Code", author: "Robert C. Martin", year: 2008 },
  { id: 3, title: "Design Patterns", author: "Gang of Four", year: 1994 },
];
let nextId = 4;

app.get("/api/books", (req, res) => {
  res.json({ data: books, total: books.length });
});

app.get("/api/books/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
});

app.post("/api/books", (req, res) => {
  const { title, author, year } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: "Title and author are required" });
  }
  const book = { id: nextId++, title: title.trim(), author: author.trim(), year: year || null };
  books.push(book);
  res.status(201).json(book);
});

app.put("/api/books/:id", (req, res) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Book not found" });
  const { title, author, year } = req.body;
  if (!title || !author) return res.status(400).json({ error: "Title and author are required" });
  books[index] = { id: books[index].id, title: title.trim(), author: author.trim(), year: year || null };
  res.json(books[index]);
});

app.patch("/api/books/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: "Book not found" });
  if (req.body.title !== undefined) book.title = req.body.title.trim();
  if (req.body.author !== undefined) book.author = req.body.author.trim();
  if (req.body.year !== undefined) book.year = req.body.year;
  res.json(book);
});

app.delete("/api/books/:id", (req, res) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Book not found" });
  books.splice(index, 1);
  res.status(204).send();
});

app.listen(3000, () => console.log("API running on http://localhost:3000"));
```

---

## Key Takeaways

- CRUD maps to **GET** (read), **POST** (create), **PUT** (replace), **PATCH** (update), **DELETE** (remove)
- Always **validate** input data before processing
- Return appropriate **status codes** (200, 201, 204, 400, 404)
- Use `req.params` for path parameters and `req.body` for request data
- Return **404** when a resource is not found
- Return **400** when input validation fails

---

Next, we'll learn about **Route Parameters** — dynamic segments in URLs →
