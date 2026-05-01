---
title: Node.js Promises
---

# Node.js Promises

A **Promise** is an object that represents the eventual result of an asynchronous operation. It's either pending, fulfilled with a value, or rejected with an error. Promises replaced callbacks as the primary way to handle async code in JavaScript and Node.js.

## Promise states

```
              ┌─── fulfilled (value)
              │
pending ──────┤
              │
              └─── rejected (error)
```

A promise starts **pending** and settles into either **fulfilled** or **rejected**. Once settled, it never changes state.

## Creating a promise

```javascript
const promise = new Promise((resolve, reject) => {
  // Do some async work...
  const success = true;

  if (success) {
    resolve("It worked!"); // fulfill with a value
  } else {
    reject(new Error("Something failed")); // reject with an error
  }
});
```

## Consuming promises with .then() and .catch()

```javascript
promise
  .then((value) => {
    console.log("Success:", value);
  })
  .catch((err) => {
    console.error("Error:", err.message);
  });
```

`.then()` runs when the promise is fulfilled, `.catch()` runs when it's rejected.

## Chaining

`.then()` returns a new promise, so you can chain:

```javascript
import fs from "node:fs/promises";

fs.readFile("config.json", "utf8")
  .then((text) => JSON.parse(text))
  .then((config) => fs.readFile(config.dataFile, "utf8"))
  .then((data) => {
    console.log("Data:", data);
  })
  .catch((err) => {
    console.error("Failed:", err.message);
  });
```

Compare this to the nested callback version — it's flat and readable.

## .finally()

Runs regardless of whether the promise was fulfilled or rejected:

```javascript
fetchData()
  .then((data) => process(data))
  .catch((err) => console.error(err))
  .finally(() => {
    console.log("Cleanup done"); // always runs
  });
```

## Creating resolved/rejected promises

```javascript
// Already fulfilled
const p1 = Promise.resolve(42);
p1.then((v) => console.log(v)); // 42

// Already rejected
const p2 = Promise.reject(new Error("fail"));
p2.catch((e) => console.error(e.message)); // 'fail'
```

## Wrapping callbacks in promises

Convert callback-based functions to promise-returning functions:

```javascript
import fs from "node:fs";

function readFilePromise(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

const data = await readFilePromise("config.json");
```

Or use the built-in `util.promisify`:

```javascript
import { promisify } from "node:util";
import fs from "node:fs";

const readFile = promisify(fs.readFile);
const data = await readFile("config.json", "utf8");
```

## Promise combinators

### Promise.all() — Wait for all, fail on first error

```javascript
const [users, posts, comments] = await Promise.all([
  fetch("/api/users").then((r) => r.json()),
  fetch("/api/posts").then((r) => r.json()),
  fetch("/api/comments").then((r) => r.json()),
]);

console.log(users, posts, comments);
```

If **any** promise rejects, `Promise.all()` rejects immediately with that error. Other promises keep running but their results are discarded.

### Promise.allSettled() — Wait for all, never fail

```javascript
const results = await Promise.allSettled([
  fetch("/api/users").then((r) => r.json()),
  fetch("/api/posts").then((r) => r.json()),
  Promise.reject(new Error("oops")),
]);

for (const result of results) {
  if (result.status === "fulfilled") {
    console.log("Value:", result.value);
  } else {
    console.log("Error:", result.reason.message);
  }
}
```

Returns an array of `{ status, value }` or `{ status, reason }` objects. Never rejects.

### Promise.race() — First to settle wins

```javascript
const result = await Promise.race([
  fetch("/api/data"),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 5000),
  ),
]);
```

Returns the first promise to settle (fulfill or reject). Great for timeouts.

### Promise.any() — First to fulfill wins

```javascript
const fastest = await Promise.any([
  fetch("https://api1.example.com/data"),
  fetch("https://api2.example.com/data"),
  fetch("https://api3.example.com/data"),
]);
```

Returns the first promise to **fulfill**. Ignores rejections unless ALL promises reject (then throws an `AggregateError`).

## Promise combinators comparison

| Method | Resolves when | Rejects when |
|---|---|---|
| `Promise.all()` | All fulfill | Any rejects |
| `Promise.allSettled()` | All settle | Never |
| `Promise.race()` | First settles | First settles (if rejected) |
| `Promise.any()` | First fulfills | All reject |

## Sequential vs parallel execution

### Parallel (fast — use when operations are independent)

```javascript
// All three start at the same time
const [a, b, c] = await Promise.all([
  fetchUser(1),
  fetchUser(2),
  fetchUser(3),
]);
```

### Sequential (slow but necessary when operations depend on each other)

```javascript
const user = await fetchUser(1);
const posts = await fetchPosts(user.id);
const comments = await fetchComments(posts[0].id);
```

## Error handling patterns

### Catch at the end of a chain

```javascript
doStep1()
  .then(doStep2)
  .then(doStep3)
  .catch((err) => {
    // catches any error from step 1, 2, or 3
    console.error("Failed:", err.message);
  });
```

### Catch and recover

```javascript
fetchConfig()
  .catch(() => {
    console.log("Config not found, using defaults");
    return defaultConfig; // chain continues with this value
  })
  .then((config) => startApp(config));
```

### Per-step error handling

```javascript
const data = await fetchData().catch(() => null);
if (!data) {
  console.log("Using cached data");
}
```

## Common promise mistakes

### 1. Forgetting to return in .then()

```javascript
// BUG — the promise chain breaks
fetchUser(1)
  .then((user) => {
    fetchPosts(user.id); // forgot to return!
  })
  .then((posts) => {
    console.log(posts); // undefined!
  });

// FIX
fetchUser(1)
  .then((user) => {
    return fetchPosts(user.id); // return the promise
  })
  .then((posts) => {
    console.log(posts); // works
  });
```

### 2. Creating a promise inside a promise

```javascript
// Unnecessary — this is the "promise constructor antipattern"
function readJSON(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8")
      .then((text) => resolve(JSON.parse(text)))
      .catch(reject);
  });
}

// Just chain instead
function readJSON(path) {
  return fs.readFile(path, "utf8").then((text) => JSON.parse(text));
}
```

### 3. Unhandled rejections

```javascript
// BAD — if fetchData rejects, you get an UnhandledPromiseRejection warning
fetchData();

// GOOD
fetchData().catch((err) => console.error(err));
```

Node.js will eventually terminate the process on unhandled rejections. Always handle errors.

## Practical example: Retry with exponential backoff

```javascript
async function retry(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;

      const delay = baseDelay * 2 ** (attempt - 1);
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

const data = await retry(() => fetch("https://api.example.com/data"));
```

## Key takeaways

- A Promise represents an eventual async result.
- `.then()` for success, `.catch()` for errors, `.finally()` for cleanup.
- `Promise.all()` for parallel operations, `Promise.allSettled()` when you need all results.
- `Promise.race()` for timeouts, `Promise.any()` for fastest success.
- Always handle rejections — unhandled rejections crash Node.js.
- Prefer `async`/`await` (next lesson) over `.then()` chains for readability.
