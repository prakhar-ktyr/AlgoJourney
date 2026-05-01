---
title: JavaScript Modules
---

# JavaScript Modules

A **module** is a JavaScript file with its own scope. Modules let you split a project across many files and `import` only what you need. Modern JS uses **ECMAScript modules (ESM)** — the syntax with `import` and `export`.

## A first module

```javascript
// math.js
export function add(a, b) { return a + b; }
export function sub(a, b) { return a - b; }

export const PI = 3.14159;
```

```javascript
// app.js
import { add, PI } from "./math.js";

console.log(add(2, 3));  // 5
console.log(PI);          // 3.14159
```

Three rules:

1. Top-level `var`/`let`/`const`/`function`/`class` are **module-scoped** — they don't leak into the global namespace.
2. To make something visible to other files, `export` it.
3. To use it elsewhere, `import` it.

## Named exports

The most common style. Export each value as you declare it, or all at once:

```javascript
// inline
export function add(a, b) { return a + b; }
export const VERSION = "1.0";

// or grouped at the bottom
function sub(a, b) { return a - b; }
const MAX = 100;
export { sub, MAX };
```

Import with the same names:

```javascript
import { add, sub, MAX } from "./math.js";
```

Rename on import:

```javascript
import { add as plus } from "./math.js";
plus(1, 2);
```

## Default export

Each module can have **at most one** default export:

```javascript
// logger.js
export default function log(msg) {
  console.log(`[log] ${msg}`);
}
```

```javascript
import log from "./logger.js"; // no braces; pick any name
log("hi");
```

Default exports are convenient but cause real problems at scale:

- The importer can rename them freely → harder to grep across the codebase.
- Re-exports are noisier (`export { default as Logger } from "./logger.js";`).
- Tooling (auto-import, refactors) handles named exports better.

**Recommendation:** prefer named exports. Use a default only when the file truly exports one thing (a React component, a class).

## Mixing named and default

```javascript
// db.js
export default class Connection { /* ... */ }
export const DEFAULT_PORT = 5432;
```

```javascript
import Connection, { DEFAULT_PORT } from "./db.js";
```

## `import * as`

Pull every named export into a namespace:

```javascript
import * as math from "./math.js";
math.add(1, 2);
math.PI;
```

Useful for utility modules. Note that `math.default` is the default export, if any.

## Re-exporting

A "barrel" file aggregates many modules:

```javascript
// index.js
export { add, sub } from "./math.js";
export { greet }    from "./greet.js";
export { default as User } from "./user.js";
```

Now consumers write `import { add, User } from "./index.js"`. Useful for libraries; overuse can hurt tree-shaking.

## Static structure

`import` and `export` are **statically analyzed** — the engine and bundler know your dependency graph at parse time. That's what makes tree-shaking, type checking, and lazy-loading possible. The downside: imports must be at the top level, with literal string paths.

```javascript
import "./styles.css";   // side-effect import (no bindings)
import x from "./x.js";  // ✅ top-level
function f() {
  import "./x.js";       // ❌ SyntaxError
}
```

## Dynamic `import()`

For lazy or conditional loading, use the dynamic form — it returns a promise:

```javascript
button.addEventListener("click", async () => {
  const { default: chart } = await import("./chart.js");
  chart.render();
});
```

This is what enables route-based code splitting in React, Vue, etc.

## Modules in the browser

Add `type="module"` to a script tag:

```html
<script type="module" src="./app.js"></script>
```

In a module:

- Imports use **relative paths with extensions**: `import x from "./util.js"`.
- The script defers automatically (runs after the DOM is parsed).
- It's strict mode by default.
- `this` at the top level is `undefined`, not `window`.

## Modules in Node.js

Two options:

1. Set `"type": "module"` in `package.json` — every `.js` file is ESM.
2. Use the `.mjs` extension for individual ESM files.

In Node, you can omit the file extension only with the legacy CommonJS syntax (`require`). Plain ESM in Node still needs `.js`/`.mjs`/`.json`.

## CommonJS — the older sibling

Node originally invented its own module system, **CommonJS**:

```javascript
// math.js (CommonJS)
function add(a, b) { return a + b; }
module.exports = { add };
```

```javascript
// app.js (CommonJS)
const { add } = require("./math.js");
```

Most new code is ESM. You'll still see `require` in older Node projects and many `node_modules` packages — bundlers handle both transparently.

## Top-level `await`

Inside an ES module you can `await` directly at the top level:

```javascript
// config.js
const response = await fetch("/config.json");
export const config = await response.json();
```

The module's importers wait until its top-level promises settle. Use sparingly — slow imports slow startup.

## A complete example

```javascript
// src/users.js
const cache = new Map();

export async function getUser(id) {
  if (cache.has(id)) return cache.get(id);
  const user = await fetch(`/api/users/${id}`).then((r) => r.json());
  cache.set(id, user);
  return user;
}

export function clearCache() { cache.clear(); }
```

```javascript
// src/app.js
import { getUser } from "./users.js";

const ada = await getUser(1);
console.log(ada.name);
```

`cache` is private to the module — there's no way for another file to touch it. That's the whole point of modules: encapsulation by file.

## Best practices

- **Default to named exports.** Reserve default exports for one-thing-per-file modules.
- **Keep modules small** and focused on one responsibility.
- **Use barrels (index files) deliberately**, not by reflex — they can break tree-shaking.
- **Always include the file extension** in import paths (`./foo.js`, not `./foo`). Node and modern bundlers prefer it.
- **Avoid circular imports.** They work but are fragile and indicate a design problem.

## Next step

Code that does anything real also fails sometimes. Up next: handling errors.
