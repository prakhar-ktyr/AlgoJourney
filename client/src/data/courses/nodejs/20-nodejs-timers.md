---
title: Node.js Timers
---

# Node.js Timers

Node.js provides timer functions for scheduling code to run later. While they look identical to browser timers, Node.js timers have additional features and subtle differences related to the event loop.

## setTimeout — Run once after a delay

```javascript
setTimeout(() => {
  console.log("This runs after 2 seconds");
}, 2000);
```

With arguments:

```javascript
function greet(name, greeting) {
  console.log(`${greeting}, ${name}!`);
}

setTimeout(greet, 1000, "Alice", "Hello");
// After 1 second: "Hello, Alice!"
```

### Clearing a timeout

```javascript
const timer = setTimeout(() => {
  console.log("This will never run");
}, 5000);

clearTimeout(timer);
```

## setInterval — Run repeatedly

```javascript
let count = 0;

const interval = setInterval(() => {
  count++;
  console.log(`Tick ${count}`);

  if (count >= 5) {
    clearInterval(interval);
    console.log("Done");
  }
}, 1000);
```

### Be careful with setInterval

If the callback takes longer than the interval, calls stack up:

```javascript
// If processData takes 3 seconds but interval is 1 second,
// you'll have overlapping executions
setInterval(async () => {
  await processData(); // takes 3 seconds
}, 1000);

// Better: use setTimeout recursively
async function poll() {
  await processData();
  setTimeout(poll, 1000); // wait 1 second AFTER processing
}
poll();
```

## setImmediate — Run on the next event loop iteration

`setImmediate` schedules a callback to run on the next iteration of the event loop, **after** I/O events:

```javascript
setImmediate(() => {
  console.log("This runs on the next event loop iteration");
});

console.log("This runs first");
```

Output:

```
This runs first
This runs on the next event loop iteration
```

### setImmediate vs setTimeout(fn, 0)

Both run "soon," but their order depends on context:

```javascript
// In the main module, order is non-deterministic
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
// Could be either order!

// Inside an I/O callback, setImmediate always fires first
import fs from "node:fs";

fs.readFile("file.txt", () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
  // Always: "immediate" then "timeout"
});
```

## process.nextTick — Run before anything else

`process.nextTick` schedules a callback to run **before** the event loop continues — even before `setImmediate` and I/O:

```javascript
process.nextTick(() => {
  console.log("nextTick — runs first");
});

setImmediate(() => {
  console.log("setImmediate — runs second");
});

setTimeout(() => {
  console.log("setTimeout — runs third");
}, 0);

console.log("synchronous — runs before all callbacks");
```

Output:

```
synchronous — runs before all callbacks
nextTick — runs first
setTimeout — runs third
setImmediate — runs third
```

> **Warning:** Recursive `process.nextTick` can starve the event loop — I/O callbacks never get a chance to run. Use `setImmediate` for recursive scheduling.

## Execution order summary

```
1. Synchronous code
2. process.nextTick callbacks
3. Microtasks (resolved Promises)
4. Timers (setTimeout, setInterval)
5. I/O callbacks
6. setImmediate callbacks
```

## Timer promises API (Node.js 16+)

The `timers/promises` module provides promise-based versions:

```javascript
import { setTimeout, setInterval, setImmediate } from "node:timers/promises";

// Await a delay
await setTimeout(2000);
console.log("2 seconds passed");

// With a value
const result = await setTimeout(1000, "hello");
console.log(result); // 'hello'

// Cancellable with AbortController
const controller = new AbortController();

setTimeout(5000, null, { signal: controller.signal })
  .then(() => console.log("Done"))
  .catch(() => console.log("Cancelled"));

// Cancel after 1 second
globalThis.setTimeout(() => controller.abort(), 1000);
```

### Async interval iteration

```javascript
import { setInterval } from "node:timers/promises";

const interval = setInterval(1000);
let count = 0;

for await (const _ of interval) {
  count++;
  console.log(`Tick ${count}`);
  if (count >= 5) break;
}
```

## Practical examples

### Debounce

```javascript
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const save = debounce((data) => {
  console.log("Saving:", data);
}, 300);

save("a");
save("ab");
save("abc"); // only this one fires, 300ms later
```

### Polling with timeout

```javascript
import { setTimeout } from "node:timers/promises";

async function pollUntilReady(checkFn, interval = 1000, maxWait = 30000) {
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    const ready = await checkFn();
    if (ready) return true;
    await setTimeout(interval);
  }

  throw new Error("Timed out waiting for ready state");
}

await pollUntilReady(async () => {
  const res = await fetch("http://localhost:3000/health");
  return res.ok;
});
```

### Rate limiter

```javascript
import { setTimeout } from "node:timers/promises";

async function rateLimited(items, fn, delayMs) {
  const results = [];
  for (const item of items) {
    results.push(await fn(item));
    await setTimeout(delayMs);
  }
  return results;
}

// Process items with 200ms between each
await rateLimited(urls, fetch, 200);
```

## Key takeaways

- `setTimeout` — one-time delayed execution.
- `setInterval` — repeated execution (prefer recursive `setTimeout` for async work).
- `setImmediate` — next event loop iteration, after I/O.
- `process.nextTick` — before anything else (use sparingly).
- Use `timers/promises` for async/await-friendly timers.
- The execution order is: sync → nextTick → microtasks → timers → I/O → setImmediate.
