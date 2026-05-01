---
title: Node.js Modules
---

# Node.js Modules

Modules are the building blocks of every Node.js application. Instead of putting all your code in one giant file, you split it into smaller files, each responsible for one thing. Node.js supports two module systems: **CommonJS (CJS)** and **ES Modules (ESM)**.

## Why modules?

- **Organization** — Each file has a clear purpose.
- **Reusability** — Import the same module in multiple files.
- **Encapsulation** — Variables inside a module are private by default.
- **Dependency management** — npm packages are modules you install and import.

## CommonJS (CJS) — The original system

CommonJS has been the default module system in Node.js since day one. It uses `require()` to import and `module.exports` to export.

### Exporting

```javascript
// math.js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = { add, subtract };
```

You can also export a single value:

```javascript
// logger.js
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

module.exports = log;
```

Or attach to `exports` directly (a shorthand for `module.exports`):

```javascript
// utils.js
exports.double = (n) => n * 2;
exports.triple = (n) => n * 3;
```

> **Warning:** Never reassign `exports` directly — `exports = { ... }` breaks the reference. Always use `module.exports = { ... }` when exporting an object.

### Importing

```javascript
// app.js
const { add, subtract } = require("./math");
const log = require("./logger");
const { double } = require("./utils");

log(`2 + 3 = ${add(2, 3)}`);
log(`double(5) = ${double(5)}`);
```

**Rules for `require()` paths:**

- `"./math"` — relative path (current directory). The `.js` extension is optional.
- `"../utils"` — relative path (parent directory).
- `"fs"` — built-in Node.js module (no path prefix).
- `"express"` — npm package (looked up in `node_modules`).

### How `require()` resolves files

When you write `require("./math")`, Node.js looks for:

1. `./math.js`
2. `./math.json`
3. `./math/index.js`

This is why you can create a folder with an `index.js` and require the folder name.

## ES Modules (ESM) — The modern standard

ES Modules use `import`/`export` syntax, matching the standard used in browsers. ESM is the future of JavaScript modules.

### Enabling ESM

Two ways to enable ES Modules in Node.js:

**Option 1:** Add `"type": "module"` to your `package.json`:

```json
{
  "name": "my-app",
  "type": "module"
}
```

Now all `.js` files in the project use ESM.

**Option 2:** Use the `.mjs` file extension:

```
math.mjs    ← always treated as ESM
math.js     ← depends on package.json "type"
math.cjs    ← always treated as CJS
```

### Named exports

```javascript
// math.mjs
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}
```

### Default exports

```javascript
// logger.mjs
export default function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}
```

### Importing

```javascript
// app.mjs
import { add, subtract } from "./math.mjs";
import log from "./logger.mjs";

log(`2 + 3 = ${add(2, 3)}`);
```

> **Important:** In ESM, you **must** include the file extension (`.js`, `.mjs`). `import { add } from "./math"` won't work — you need `import { add } from "./math.js"`.

### Renaming imports

```javascript
import { add as sum } from "./math.mjs";
sum(2, 3); // 5
```

### Import everything

```javascript
import * as math from "./math.mjs";
math.add(2, 3);
math.subtract(5, 2);
```

### Re-exporting

```javascript
// index.mjs — barrel file
export { add, subtract } from "./math.mjs";
export { default as log } from "./logger.mjs";
```

## CJS vs ESM comparison

| Feature | CommonJS | ES Modules |
|---|---|---|
| Syntax | `require()` / `module.exports` | `import` / `export` |
| Loading | Synchronous | Asynchronous |
| File extension | `.js` or `.cjs` | `.mjs` or `.js` (with `"type": "module"`) |
| Top-level `await` | No | Yes |
| `__filename` / `__dirname` | Available | Not available (use `import.meta.url`) |
| Tree-shaking | No | Yes (bundlers can eliminate unused exports) |
| Circular dependencies | Partially resolved | Handled differently (live bindings) |

## `__filename` and `__dirname`

In CommonJS, these globals give you the current file's path:

```javascript
// CJS
console.log(__filename); // /home/user/project/app.js
console.log(__dirname);  // /home/user/project
```

In ESM, they don't exist. Use `import.meta.url` instead:

```javascript
// ESM
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__filename);
console.log(__dirname);
```

Starting from Node.js 21.2+, you can use `import.meta.dirname` and `import.meta.filename` directly:

```javascript
// ESM (Node.js 21.2+)
console.log(import.meta.filename); // /home/user/project/app.js
console.log(import.meta.dirname);  // /home/user/project
```

## Built-in modules

Node.js comes with many built-in modules. You don't need to install them:

```javascript
// CJS
const fs = require("fs");
const path = require("path");
const os = require("os");
const http = require("http");

// ESM
import fs from "fs";
import path from "path";
import os from "os";
import http from "http";
```

In ESM, you can also use the `node:` prefix to make it clear you are importing a built-in:

```javascript
import fs from "node:fs";
import path from "node:path";
```

The `node:` prefix is recommended in modern code — it makes imports unambiguous and avoids name clashes with npm packages.

## Creating a multi-file project

Let's build a small project with multiple modules:

```
my-app/
  package.json
  index.js
  utils/
    math.js
    format.js
    index.js
```

```json
// package.json
{
  "name": "my-app",
  "type": "module"
}
```

```javascript
// utils/math.js
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}
```

```javascript
// utils/format.js
export function currency(amount) {
  return `$${amount.toFixed(2)}`;
}

export function percent(value) {
  return `${(value * 100).toFixed(1)}%`;
}
```

```javascript
// utils/index.js — barrel file re-exports everything
export { add, multiply } from "./math.js";
export { currency, percent } from "./format.js";
```

```javascript
// index.js
import { add, currency } from "./utils/index.js";

const total = add(19.99, 5.99);
console.log(`Total: ${currency(total)}`); // Total: $25.98
```

## Dynamic imports

Both CJS and ESM support loading modules at runtime:

```javascript
// ESM — dynamic import (returns a promise)
const module = await import("./math.js");
module.add(2, 3);

// Useful for conditional loading
if (process.env.NODE_ENV === "development") {
  const { devTools } = await import("./dev-tools.js");
  devTools.start();
}
```

## Module caching

Node.js caches modules after the first `require()` or `import`. If you import the same module in multiple files, the code runs only once and the same object is returned every time:

```javascript
// counter.js
let count = 0;
export function increment() { return ++count; }
export function getCount() { return count; }
```

```javascript
// a.js
import { increment } from "./counter.js";
increment(); // 1

// b.js
import { getCount } from "./counter.js";
console.log(getCount()); // 1 — same instance!
```

This caching is usually what you want, but be aware of it when modules have mutable state.

## Key takeaways

- **CommonJS** (`require`/`module.exports`) is the original system — still widely used.
- **ES Modules** (`import`/`export`) is the modern standard — use it for new projects.
- Enable ESM with `"type": "module"` in `package.json` or use `.mjs` files.
- Always include file extensions in ESM imports.
- Built-in modules can use the `node:` prefix for clarity.
- Modules are cached — the code runs once, the result is reused.
