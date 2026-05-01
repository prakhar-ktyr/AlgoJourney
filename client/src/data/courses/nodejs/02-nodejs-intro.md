---
title: Node.js Introduction
---

# Node.js Introduction

## What is Node.js?

Node.js is a **JavaScript runtime** built on Chrome's V8 JavaScript engine. It lets you run JavaScript outside the browser — on servers, your laptop, Raspberry Pis, robots, and anywhere else a computer exists.

Before Node.js (released in 2009 by Ryan Dahl), JavaScript could only run inside a web browser. Node.js changed that by wrapping the V8 engine in a C++ program that provides access to the file system, network, operating system, and more.

```
Browser JavaScript          Node.js
─────────────────           ───────────────
DOM manipulation            File system access
Window / Document           HTTP servers
Fetch API                   TCP / UDP sockets
Web APIs                    Child processes
                            Operating system APIs
```

## Why use Node.js?

### 1. One language everywhere

You write JavaScript on the front end AND the back end. One language for the entire stack means less context switching, shared code between client and server, and a single toolchain.

### 2. Non-blocking I/O

Node.js uses an **event-driven, non-blocking I/O model**. When your code reads a file or queries a database, it doesn't sit idle and wait. Instead, it registers a callback and moves on to the next task. When the I/O finishes, the callback fires. This makes Node.js extremely efficient for I/O-heavy workloads like web servers and APIs.

```javascript
// Node.js does NOT block here — it moves on immediately
const fs = require("fs");

fs.readFile("data.txt", "utf8", (err, data) => {
  // This runs later, when the file is ready
  console.log(data);
});

console.log("This prints FIRST, before the file is read");
```

### 3. Massive ecosystem

The npm registry has over **2 million packages**. Need a web framework? Express. Need a database ORM? Mongoose, Prisma, Sequelize. Need to send email, resize images, parse CSV, generate PDFs — there is a package for it.

### 4. Fast

The V8 engine compiles JavaScript to machine code using a just-in-time (JIT) compiler. Combined with non-blocking I/O, Node.js handles thousands of concurrent connections on a single thread.

## What can you build with Node.js?

- **Web servers and REST APIs** — The most common use case. Express, Fastify, Koa.
- **Real-time apps** — Chat, live dashboards, multiplayer games using WebSockets.
- **Command-line tools** — npm, ESLint, Prettier, and Vite are all Node.js CLI tools.
- **Microservices** — Small, independent services that communicate over HTTP or message queues.
- **Server-side rendering** — Next.js, Nuxt, and Remix render React/Vue on the server.
- **Desktop apps** — Electron (VS Code, Slack, Discord) bundles Node.js with Chromium.
- **IoT and robotics** — Johnny-Five, Cylon.js for hardware interaction.
- **Scripting and automation** — Build tools, data pipelines, deploy scripts.

## How Node.js works under the hood

Node.js runs on a **single thread** but handles concurrency through the **event loop**. Here is a simplified view:

```
   Your Code
      │
      ▼
  ┌──────────┐
  │  V8       │  ← Compiles & runs your JS
  │  Engine   │
  └────┬─────┘
       │
       ▼
  ┌──────────┐
  │  Event    │  ← Picks up callbacks when I/O completes
  │  Loop     │
  └────┬─────┘
       │
       ▼
  ┌──────────┐
  │  libuv    │  ← Handles async I/O (files, network, DNS)
  │  (C++)    │     using OS threads behind the scenes
  └──────────┘
```

1. **V8** compiles and executes your JavaScript.
2. When your code calls an async function (read a file, make a network request), **libuv** handles it using OS-level threads or kernel async APIs.
3. The **event loop** continuously checks: "Is any async work done?" When it is, the associated callback is pushed onto the call stack and executed.

You will learn the event loop in detail in a dedicated lesson later in the course.

## Node.js vs the browser

| Feature | Browser | Node.js |
|---|---|---|
| JavaScript engine | V8 (Chrome), SpiderMonkey (Firefox) | V8 |
| DOM access | Yes | No |
| `window` / `document` | Yes | No |
| `global` / `globalThis` | `globalThis` | `global` / `globalThis` |
| File system | No (sandboxed) | Yes (`fs` module) |
| HTTP server | No | Yes (`http` module) |
| `require` / `import` | `import` only | Both |
| npm packages | Limited (via bundlers) | Full access |

## A quick example

Here is a tiny HTTP server in Node.js — just 6 lines:

```javascript
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello, World!\n");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
```

Save this as `server.js`, run `node server.js`, and open `http://localhost:3000` in your browser. You just built a web server in 6 lines of code.

## Version history highlights

| Version | Year | Highlight |
|---|---|---|
| v0.1.0 | 2009 | Initial release by Ryan Dahl |
| v4.0.0 | 2015 | Merged with io.js, LTS schedule begins |
| v8.0.0 | 2017 | `async`/`await` support |
| v12.0.0 | 2019 | ES modules support (experimental) |
| v14.0.0 | 2020 | ES modules stable, `fs/promises` |
| v16.0.0 | 2021 | Timers Promises API |
| v18.0.0 | 2022 | Built-in fetch, test runner |
| v20.0.0 | 2023 | Stable test runner, permissions model |
| v22.0.0 | 2024 | require(esm), WebSocket client |

Node.js uses an **even-number LTS** (Long Term Support) schedule. Even-numbered releases (18, 20, 22) get 30 months of support. Stick to the latest LTS for production.
