---
title: Node.js Serving Static Files
---

# Node.js Serving Static Files

Static files are files that don't change — HTML, CSS, JavaScript, images, fonts, downloads. Express makes serving them simple with `express.static()`.

## express.static()

```javascript
import express from "express";

const app = express();

// Serve files from the "public" directory
app.use(express.static("public"));

app.listen(3000);
```

If your `public/` folder contains:

```
public/
  index.html
  css/
    style.css
  js/
    app.js
  images/
    logo.png
```

Then:
- `http://localhost:3000/index.html` → `public/index.html`
- `http://localhost:3000/css/style.css` → `public/css/style.css`
- `http://localhost:3000/images/logo.png` → `public/images/logo.png`
- `http://localhost:3000/` → `public/index.html` (index.html is served by default)

## Virtual path prefix

Serve static files under a URL prefix:

```javascript
app.use("/static", express.static("public"));
```

Now files are at:
- `http://localhost:3000/static/css/style.css`
- `http://localhost:3000/static/images/logo.png`

## Multiple static directories

```javascript
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(express.static("assets"));
```

Express searches directories in the order they are defined. The first match wins.

## Using absolute paths

When running from a different directory, relative paths may break. Use absolute paths:

```javascript
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "public")));
```

## Options

```javascript
app.use(express.static("public", {
  index: "index.html",           // default index file
  extensions: ["html", "htm"],   // try these extensions if no match
  dotfiles: "ignore",            // ignore dotfiles (.gitignore, .env)
  maxAge: "1d",                  // cache-control max-age (1 day)
  etag: true,                    // generate ETags
  lastModified: true,            // set Last-Modified header
  redirect: true,                // redirect /dir to /dir/
}));
```

### Cache control for production

```javascript
if (process.env.NODE_ENV === "production") {
  app.use(express.static("public", {
    maxAge: "7d",  // cache for 7 days
    immutable: true,
  }));
} else {
  app.use(express.static("public"));
}
```

## Serving an SPA (Single Page Application)

For SPAs (React, Vue, Angular), all routes should serve `index.html`:

```javascript
import express from "express";
import path from "node:path";

const app = express();

// Serve static files
app.use(express.static("dist"));

// API routes
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from API" });
});

// SPA fallback — serve index.html for any unmatched route
app.get("*", (req, res) => {
  res.sendFile(path.resolve("dist", "index.html"));
});

app.listen(3000);
```

## File downloads

```javascript
app.get("/download/:filename", (req, res) => {
  const filePath = path.resolve("files", req.params.filename);

  // Security: prevent directory traversal
  if (!filePath.startsWith(path.resolve("files"))) {
    return res.status(403).send("Forbidden");
  }

  res.download(filePath, (err) => {
    if (err) {
      res.status(404).send("File not found");
    }
  });
});
```

`res.download()` sets the `Content-Disposition` header so the browser downloads the file instead of displaying it.

## Combining static files with API routes

A common pattern — serve a React app and an API from the same server:

```javascript
import express from "express";
import path from "node:path";

const app = express();

// Parse JSON bodies for API routes
app.use(express.json());

// API routes first
app.get("/api/users", (req, res) => {
  res.json([{ id: 1, name: "Alice" }]);
});

app.post("/api/users", (req, res) => {
  res.status(201).json(req.body);
});

// Static files (React build)
app.use(express.static(path.join("client", "dist")));

// SPA fallback (must be after API routes)
app.get("*", (req, res) => {
  res.sendFile(path.resolve("client", "dist", "index.html"));
});

app.listen(3000);
```

## Key takeaways

- `express.static("folder")` serves files from a directory.
- No imports needed — it's built into Express.
- Use `maxAge` for caching in production.
- For SPAs, add a catch-all route that serves `index.html`.
- Always use absolute paths with `path.resolve()` or `path.join()` for reliability.
- Validate file paths to prevent directory traversal attacks.
