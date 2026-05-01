---
title: Node.js HTTP Module
---

# Node.js HTTP Module

The `http` module lets you create web servers and make HTTP requests without installing any packages. It is the foundation that frameworks like Express build on top of.

## Creating a basic HTTP server

```javascript
import http from "node:http";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello, World!\n");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
```

Save as `server.js` and run:

```bash
node server.js
```

Open `http://localhost:3000` in your browser — you will see "Hello, World!".

## The request object (req)

The callback receives a `req` (IncomingMessage) object with details about the incoming request:

```javascript
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Headers:", req.headers);

  res.end("OK\n");
});
```

Key properties:

| Property | Description | Example |
|---|---|---|
| `req.method` | HTTP method | `"GET"`, `"POST"` |
| `req.url` | Request path + query string | `"/users?page=2"` |
| `req.headers` | Request headers (lowercase keys) | `{ "content-type": "application/json" }` |
| `req.httpVersion` | HTTP version | `"1.1"` |

## The response object (res)

The `res` (ServerResponse) object controls what you send back:

```javascript
const server = http.createServer((req, res) => {
  // Set status code
  res.statusCode = 200;

  // Set headers
  res.setHeader("Content-Type", "text/html");
  res.setHeader("X-Custom-Header", "MyValue");

  // Write body and end
  res.write("<h1>Hello</h1>");
  res.write("<p>Welcome to my server</p>");
  res.end();
});
```

Or use `writeHead()` to set status and headers in one call:

```javascript
res.writeHead(200, {
  "Content-Type": "application/json",
  "Cache-Control": "no-cache",
});
res.end(JSON.stringify({ message: "Hello" }));
```

## Routing

Handle different paths and methods:

```javascript
import http from "node:http";

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === "GET" && url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>Home Page</h1>");
  } else if (method === "GET" && url === "/about") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>About Page</h1>");
  } else if (method === "GET" && url === "/api/users") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]));
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found\n");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
```

You can see why frameworks like Express exist — raw routing gets verbose quickly.

## Parsing the URL

Use the `URL` class to parse the request URL:

```javascript
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  console.log("Pathname:", url.pathname);       // '/users'
  console.log("Search:", url.search);            // '?page=2&limit=10'
  console.log("Page:", url.searchParams.get("page")); // '2'

  res.end("OK\n");
});
```

## Reading the request body

The request body comes in chunks. You need to collect them:

```javascript
const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/users") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const user = JSON.parse(body);
        console.log("Received:", user);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ id: 1, ...user }));
      } catch {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid JSON\n");
      }
    });
  } else {
    res.writeHead(404);
    res.end("Not Found\n");
  }
});

server.listen(3000);
```

Test it:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'
```

## Serving static files

```javascript
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  // Prevent directory traversal
  const safePath = path.normalize(req.url).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join("public", safePath);

  if (filePath.endsWith("/")) {
    filePath += "index.html";
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found\n");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(3000, () => {
  console.log("Static server at http://localhost:3000/");
});
```

## Making HTTP requests (client)

### Using the built-in `http.get`

```javascript
import http from "node:http";

http.get("http://jsonplaceholder.typicode.com/todos/1", (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    const todo = JSON.parse(data);
    console.log(todo);
  });
}).on("error", (err) => {
  console.error("Request failed:", err.message);
});
```

### Using the global `fetch` (Node.js 18+)

The easier, modern way:

```javascript
const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
const todo = await response.json();
console.log(todo);
```

`fetch` is available globally in Node.js 18+ without any imports.

## Server events

The HTTP server is an EventEmitter:

```javascript
const server = http.createServer();

server.on("request", (req, res) => {
  res.end("Hello\n");
});

server.on("listening", () => {
  const addr = server.address();
  console.log(`Server running on port ${addr.port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port already in use`);
  } else {
    console.error("Server error:", err.message);
  }
});

server.on("close", () => {
  console.log("Server shut down");
});

server.listen(3000);
```

## Graceful shutdown

```javascript
const server = http.createServer((req, res) => {
  res.end("Hello\n");
});

server.listen(3000, () => {
  console.log("Server started");
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
```

## HTTPS server

For HTTPS, use the `https` module with SSL certificates:

```javascript
import https from "node:https";
import fs from "node:fs";

const options = {
  key: fs.readFileSync("private-key.pem"),
  cert: fs.readFileSync("certificate.pem"),
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end("Secure Hello!\n");
});

server.listen(443);
```

In development, you typically use HTTP. HTTPS is handled by a reverse proxy (Nginx, Cloudflare) in production.

## Key takeaways

- `http.createServer()` creates a server — the callback handles every request.
- The `req` object has the method, URL, and headers.
- The `res` object lets you set status codes, headers, and send the response body.
- Request bodies arrive in chunks — collect them with `req.on("data")`.
- Use `fetch()` (Node.js 18+) for making HTTP requests as a client.
- For real applications, use Express instead of raw `http` — it handles routing, parsing, and middleware for you.
