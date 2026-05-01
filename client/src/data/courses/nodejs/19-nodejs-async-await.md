---
title: Node.js Async/Await
---

# Node.js Async/Await

`async`/`await` is syntactic sugar over Promises that makes asynchronous code look and behave like synchronous code. It is the recommended way to write async code in modern Node.js.

## async functions

The `async` keyword before a function makes it return a Promise:

```javascript
async function greet() {
  return "Hello!";
}

// Equivalent to:
function greet() {
  return Promise.resolve("Hello!");
}

greet().then(console.log); // 'Hello!'
```

## The await keyword

`await` pauses the function until a Promise settles, then returns its value:

```javascript
import fs from "node:fs/promises";

async function readConfig() {
  const text = await fs.readFile("config.json", "utf8");
  const config = JSON.parse(text);
  return config;
}

const config = await readConfig();
console.log(config);
```

Without `await`, you would need `.then()`:

```javascript
// Without async/await
fs.readFile("config.json", "utf8")
  .then((text) => JSON.parse(text))
  .then((config) => console.log(config));

// With async/await — reads like synchronous code
const text = await fs.readFile("config.json", "utf8");
const config = JSON.parse(text);
console.log(config);
```

## Error handling with try/catch

Use standard `try`/`catch` with `await`:

```javascript
async function loadData() {
  try {
    const text = await fs.readFile("data.json", "utf8");
    return JSON.parse(text);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("File not found, returning defaults");
      return { items: [] };
    }
    throw err; // re-throw unexpected errors
  }
}
```

### try/catch/finally

```javascript
async function processFile(path) {
  let handle;
  try {
    handle = await fs.open(path, "r");
    const content = await handle.readFile("utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Failed:", err.message);
    throw err;
  } finally {
    // Always runs, whether success or error
    await handle?.close();
  }
}
```

## Sequential vs parallel execution

### Sequential (one at a time)

```javascript
// Each request waits for the previous one
const user = await fetchUser(1);
const posts = await fetchPosts(user.id);
const comments = await fetchComments(posts[0].id);
```

Total time = time(user) + time(posts) + time(comments).

### Parallel (all at once)

```javascript
// All three requests start simultaneously
const [users, posts, tags] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
  fetchTags(),
]);
```

Total time = max(time(users), time(posts), time(tags)).

### Common mistake: Accidentally sequential

```javascript
// BAD — these are independent but run sequentially
const users = await fetchUsers();
const posts = await fetchPosts();
const tags = await fetchTags();

// GOOD — run them in parallel
const [users, posts, tags] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
  fetchTags(),
]);
```

## Top-level await

In ES Modules (`"type": "module"` in package.json), you can use `await` at the top level — no need to wrap it in an async function:

```javascript
// app.mjs or app.js with "type": "module"
import fs from "node:fs/promises";

const config = JSON.parse(await fs.readFile("config.json", "utf8"));
console.log("Port:", config.port);
```

In CommonJS, you need to wrap it:

```javascript
// app.cjs
const fs = require("fs/promises");

(async () => {
  const config = JSON.parse(await fs.readFile("config.json", "utf8"));
  console.log("Port:", config.port);
})();
```

## Async iteration — for await...of

Process async data sources (like streams) one item at a time:

```javascript
import fs from "node:fs";

const stream = fs.createReadStream("bigfile.txt", "utf8");

for await (const chunk of stream) {
  console.log(`Chunk: ${chunk.length} chars`);
}

console.log("Done reading");
```

### Creating an async iterable

```javascript
async function* fetchPages(url) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();

    yield data.items;

    hasMore = data.hasNextPage;
    page++;
  }
}

for await (const items of fetchPages("https://api.example.com/users")) {
  console.log(`Got ${items.length} users`);
}
```

## Async patterns

### Retry pattern

```javascript
async function withRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
    }
  }
}

const data = await withRetry(() =>
  fetch("https://api.example.com/data").then((r) => r.json()),
);
```

### Timeout pattern

```javascript
async function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms),
  );
  return Promise.race([promise, timeout]);
}

try {
  const data = await withTimeout(fetch("https://api.example.com"), 5000);
} catch (err) {
  console.error(err.message); // 'Timeout after 5000ms'
}
```

### Batch processing

```javascript
async function processBatch(items, batchSize, fn) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    console.log(`Processed ${Math.min(i + batchSize, items.length)}/${items.length}`);
  }

  return results;
}

// Process 100 items, 10 at a time
const urls = Array.from({ length: 100 }, (_, i) => `https://api.example.com/item/${i}`);
const data = await processBatch(urls, 10, (url) =>
  fetch(url).then((r) => r.json()),
);
```

### Concurrent limit

```javascript
async function mapConcurrent(items, limit, fn) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

// Fetch 50 URLs with max 5 concurrent requests
const data = await mapConcurrent(urls, 5, (url) =>
  fetch(url).then((r) => r.json()),
);
```

## Common mistakes

### 1. Forgetting await

```javascript
// BUG — data is a Promise, not the actual data!
async function loadConfig() {
  const data = fs.readFile("config.json", "utf8"); // forgot await
  return JSON.parse(data); // TypeError: Cannot read JSON of a Promise
}
```

### 2. Using await in a forEach

```javascript
// BUG — forEach doesn't wait for async callbacks
const files = ["a.txt", "b.txt", "c.txt"];

files.forEach(async (file) => {
  const data = await fs.readFile(file, "utf8"); // fires and forgets
  console.log(data);
});
console.log("Done!"); // runs before any file is read!

// FIX — use for...of for sequential
for (const file of files) {
  const data = await fs.readFile(file, "utf8");
  console.log(data);
}

// FIX — use Promise.all for parallel
await Promise.all(
  files.map(async (file) => {
    const data = await fs.readFile(file, "utf8");
    console.log(data);
  }),
);
```

### 3. Catching too broadly

```javascript
// BAD — hides programming errors
try {
  const user = await fetchUser(id);
  JSON.parse(user); // BUG: user is already an object
} catch {
  console.log("User not found"); // Wrong! It's a JSON.parse error
}

// BETTER — catch specific operations
let user;
try {
  user = await fetchUser(id);
} catch {
  console.log("User not found");
  return;
}
// programming errors outside try/catch will properly crash
```

## Key takeaways

- `async` functions always return a Promise.
- `await` pauses execution until the Promise settles.
- Use `try`/`catch` for error handling (same as sync code).
- Use `Promise.all()` for parallel operations — don't make independent awaits sequential.
- `for await...of` works with async iterables (streams, generators).
- Never use `await` inside `forEach` — use `for...of` or `Promise.all(arr.map(...))`.
- Top-level `await` works in ES Modules.
