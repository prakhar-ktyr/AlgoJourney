---
title: Node.js URL Module
---

# Node.js URL Module

The `url` module provides utilities for URL resolution and parsing. Modern Node.js uses the **WHATWG URL API** (the same `URL` class used in browsers), which has replaced the legacy `url.parse()` function.

## The URL class

```javascript
const url = new URL("https://example.com:8080/api/users?page=2&limit=10#results");

console.log(url.protocol);   // 'https:'
console.log(url.hostname);   // 'example.com'
console.log(url.port);       // '8080'
console.log(url.host);       // 'example.com:8080'
console.log(url.pathname);   // '/api/users'
console.log(url.search);     // '?page=2&limit=10'
console.log(url.hash);       // '#results'
console.log(url.origin);     // 'https://example.com:8080'
console.log(url.href);       // the full URL string
```

No imports needed — `URL` is a global class in Node.js.

## URL parts diagram

```
https://user:pass@example.com:8080/api/users?page=2&limit=10#results
│       │    │    │           │    │          │                │
protocol│    │    hostname    port  pathname   search           hash
        │    │
        username password
        └── auth ──┘
```

## Constructing URLs

### From a full string

```javascript
const url = new URL("https://example.com/api/users");
```

### With a base URL

```javascript
const url = new URL("/api/users", "https://example.com");
console.log(url.href); // 'https://example.com/api/users'

const url2 = new URL("../posts", "https://example.com/api/users");
console.log(url2.href); // 'https://example.com/posts'
```

### Building a URL programmatically

```javascript
const url = new URL("https://example.com");
url.pathname = "/api/search";
url.searchParams.set("q", "node.js");
url.searchParams.set("page", "1");

console.log(url.href);
// 'https://example.com/api/search?q=node.js&page=1'
```

## URLSearchParams

The `searchParams` property is a `URLSearchParams` object that makes it easy to work with query strings:

### Getting values

```javascript
const url = new URL("https://example.com/search?q=node&page=2&lang=en");

url.searchParams.get("q");      // 'node'
url.searchParams.get("page");   // '2' (always a string)
url.searchParams.get("missing"); // null
url.searchParams.has("lang");   // true
```

### Setting values

```javascript
url.searchParams.set("page", "3");     // update existing
url.searchParams.set("sort", "date");  // add new

console.log(url.search); // '?q=node&page=3&lang=en&sort=date'
```

### Appending (allows duplicates)

```javascript
url.searchParams.append("tag", "javascript");
url.searchParams.append("tag", "backend");

url.searchParams.getAll("tag"); // ['javascript', 'backend']
```

### Deleting

```javascript
url.searchParams.delete("lang");
```

### Iterating

```javascript
for (const [key, value] of url.searchParams) {
  console.log(`${key} = ${value}`);
}

// Or convert to a plain object
const params = Object.fromEntries(url.searchParams);
console.log(params); // { q: 'node', page: '3', sort: 'date' }
```

### Sorting

```javascript
url.searchParams.sort(); // sort parameters alphabetically by key
```

## Creating URLSearchParams standalone

You don't need a URL object — use `URLSearchParams` on its own:

```javascript
// From a string
const params = new URLSearchParams("name=Alice&age=30");
params.get("name"); // 'Alice'

// From an object
const params2 = new URLSearchParams({ name: "Bob", age: "25" });
params2.toString(); // 'name=Bob&age=25'

// From an array of pairs
const params3 = new URLSearchParams([
  ["color", "red"],
  ["color", "blue"],
]);
params3.getAll("color"); // ['red', 'blue']
```

## Parsing request URLs in an HTTP server

```javascript
import http from "node:http";

const server = http.createServer((req, res) => {
  // Build a full URL from the request
  const url = new URL(req.url, `http://${req.headers.host}`);

  console.log("Path:", url.pathname);
  console.log("Query:", Object.fromEntries(url.searchParams));

  if (url.pathname === "/api/search") {
    const query = url.searchParams.get("q") || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ query, page, results: [] }));
  } else {
    res.writeHead(404);
    res.end("Not Found\n");
  }
});

server.listen(3000);
```

## URL encoding and decoding

Special characters in URLs must be encoded:

```javascript
// Global functions (encode/decode URI components)
encodeURIComponent("hello world");    // 'hello%20world'
decodeURIComponent("hello%20world");  // 'hello world'

encodeURIComponent("price=10&tax=2"); // 'price%3D10%26tax%3D2'
```

`URLSearchParams` handles encoding automatically:

```javascript
const params = new URLSearchParams();
params.set("q", "node.js & express");
params.toString(); // 'q=node.js+%26+express'
```

## fileURLToPath and pathToFileURL

Convert between file URLs and file paths:

```javascript
import { fileURLToPath, pathToFileURL } from "node:url";

// URL to path
fileURLToPath("file:///home/user/app.js");
// '/home/user/app.js'

// Path to URL
pathToFileURL("/home/user/app.js");
// URL { href: 'file:///home/user/app.js' }
```

This is commonly used in ESM to get `__filename` and `__dirname`:

```javascript
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

## The legacy url.parse() (avoid in new code)

Older code uses `url.parse()` from the `url` module:

```javascript
import url from "node:url";

const parsed = url.parse("https://example.com/api?page=2", true);
console.log(parsed.pathname); // '/api'
console.log(parsed.query);   // { page: '2' }
```

This still works but is deprecated. Use the `URL` class instead.

## Practical example: URL builder utility

```javascript
function buildApiUrl(base, path, params = {}) {
  const url = new URL(path, base);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.href;
}

buildApiUrl("https://api.example.com", "/v2/search", {
  q: "node.js",
  page: 1,
  limit: 20,
});
// 'https://api.example.com/v2/search?q=node.js&page=1&limit=20'
```

## Key takeaways

- Use the `URL` class (global, no import needed) for URL parsing.
- `URLSearchParams` makes query string manipulation easy and safe.
- `URLSearchParams` handles encoding/decoding automatically.
- Use `fileURLToPath()` to convert `import.meta.url` to a file path in ESM.
- Avoid the legacy `url.parse()` — use `new URL()` instead.
