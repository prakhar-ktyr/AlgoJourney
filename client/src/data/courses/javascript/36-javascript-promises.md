---
title: JavaScript Promises
---

# JavaScript Promises

A **Promise** is an object that represents a value that *will be available later*. They are the foundation of all asynchronous JavaScript — `fetch`, `setTimeout` (in modern wrappers), file I/O, database queries, animations.

## Three states

A promise is always in exactly one of:

- **pending** — work is in flight.
- **fulfilled** — work succeeded; has a value.
- **rejected** — work failed; has a reason (usually an `Error`).

Once a promise settles (fulfilled or rejected), its state never changes again.

## Consuming a promise

You don't read a promise directly. You attach callbacks with `.then()`, `.catch()`, and `.finally()`:

```javascript
fetch("/api/user/1")
  .then((response) => response.json())
  .then((user) => console.log(user))
  .catch((err) => console.error(err))
  .finally(() => console.log("done"));
```

Each `.then` returns a **new** promise — that's why you can chain.

The callback you pass to `.then` can:

- **Return a value** — the new promise fulfills with that value.
- **Return a promise** — the new promise waits for it.
- **Throw** — the new promise rejects with the error.

```javascript
Promise.resolve(2)
  .then((n) => n * 5)              // 10
  .then((n) => Promise.resolve(n + 1)) // 11
  .then((n) => { throw new Error("nope"); })
  .catch((e) => console.log(e.message)); // "nope"
```

## Creating a promise

You'll mostly *consume* promises returned by APIs. To wrap a callback-style API in a promise, use the constructor:

```javascript
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

await wait(1000); // pause one second
```

The constructor takes an *executor* function `(resolve, reject) => …`. Call `resolve(value)` for success and `reject(error)` for failure. Calling either after the first time is silently ignored.

```javascript
function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
```

Most modern Node APIs now have a `node:fs/promises` version — you rarely need to write the wrapper yourself.

## Static helpers

```javascript
Promise.resolve(42);          // a promise already fulfilled with 42
Promise.reject(new Error()); // already rejected
```

```javascript
// All settle in parallel; rejects on the FIRST failure.
const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);

// Wait for all, never reject — every result is { status, value/reason }
const results = await Promise.allSettled([fetchA(), fetchB()]);

// First to fulfill wins (others may still complete in the background)
const fastest = await Promise.any([primary(), backup()]);

// First to settle (success or failure) wins
const first = await Promise.race([fetchData(), wait(5000).then(() => { throw new Error("timeout"); })]);
```

A real timeout pattern with `Promise.race`:

```javascript
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}
```

## Chaining vs nesting

Avoid promise pyramids — chain instead.

```javascript
// ❌ Nested
fetchUser(id).then((user) => {
  fetchOrders(user.id).then((orders) => {
    renderOrders(orders);
  });
});

// ✅ Chained
fetchUser(id)
  .then((user) => fetchOrders(user.id))
  .then((orders) => renderOrders(orders));
```

Returning a promise from a `.then` chains it instead of nesting.

## Error handling

A `.catch` handles any rejection earlier in the chain:

```javascript
doA()
  .then(doB)
  .then(doC)
  .catch(handle);  // catches A, B, or C failing
```

A `.then(success, failure)` second-arg form catches only errors from prior steps, **not** errors thrown inside `success`. Prefer `.then(success).catch(failure)` for that reason.

`.finally(callback)` runs after fulfill or reject. The callback receives nothing and its return value is ignored — it can't change the resolved value.

## Unhandled rejections

A promise that rejects with no `.catch` (and no surrounding `try/await`) is an **unhandled rejection**:

```javascript
fetch("/api"); // returns a promise; if it rejects, nobody's listening
```

The browser logs a warning and fires `unhandledrejection`; Node prints a warning and (by default in v15+) crashes. Always attach a `.catch` or `await` inside `try`.

## Promises run async — even when "instant"

A `.then` callback never runs synchronously, even if the promise is already fulfilled. That guarantees consistent ordering.

```javascript
console.log("a");
Promise.resolve().then(() => console.log("b"));
console.log("c");
// a c b
```

## Common pitfall: forgetting to return

In a chain, forgetting `return` breaks the promise sequence:

```javascript
// ❌ outer chain doesn't wait
function load() {
  return fetchA().then((a) => {
    fetchB(a).then(use);   // missing return
  });
}

// ✅
function load() {
  return fetchA().then((a) => fetchB(a).then(use));
}
```

## Common pitfall: parallel vs sequential

If you need each step's output for the next, chain (sequential):

```javascript
const a = await fetchA();
const b = await fetchB(a);
```

If they're independent, fire all and wait together (parallel):

```javascript
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

Parallel is much faster for independent work — don't `await` in a loop when `Promise.all` would do.

## Cancellation

Promises are not cancellable. To cancel, the **operation** (e.g. `fetch`) must accept an `AbortSignal`:

```javascript
const controller = new AbortController();
const promise = fetch(url, { signal: controller.signal });

setTimeout(() => controller.abort(), 5000);
```

Most modern async APIs (fetch, fs, AbortSignal-aware libraries) follow this pattern.

## Next step

Working with `.then` chains everywhere is verbose. The `async`/`await` syntax makes promise code look like ordinary synchronous code — and it's the next lesson.
