---
title: JavaScript Async / Await
---

# JavaScript Async / Await

`async`/`await` is syntactic sugar over promises. It lets you write asynchronous code that *reads* like ordinary synchronous code — no `.then` chains, no callback nesting.

## The basics

Mark a function `async` and it always returns a promise. Inside it, `await` pauses execution until a promise settles, then unwraps its value.

```javascript
async function loadUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  return user;
}

const ada = await loadUser(1);  // top-level await works in modules
```

Equivalent promise version, for comparison:

```javascript
function loadUser(id) {
  return fetch(`/api/users/${id}`).then((r) => r.json());
}
```

`async`/`await` shines when you have multiple sequential awaits, branching, loops, or `try/catch`.

## Three rules

1. `await` only works inside an `async` function (or at the top level of an ES module).
2. An `async` function always returns a promise — even if you `return 42`, the caller gets `Promise<42>`.
3. `await` on a non-promise just unwraps the value (`await 42 === 42`).

## Error handling with `try/catch`

`try/catch` works around `await` exactly like a synchronous error:

```javascript
async function loadUser(id) {
  try {
    const r = await fetch(`/api/users/${id}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (err) {
    console.error("loadUser failed:", err);
    return null;
  }
}
```

A `throw` inside an `async` function rejects the returned promise.

## Sequential vs parallel

The most common performance bug:

```javascript
// ❌ Sequential — each await blocks the next call
const a = await fetchA();
const b = await fetchB();
const c = await fetchC();

// ✅ Parallel — start all three at once
const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);
```

When operations don't depend on each other, fire them all and `await Promise.all`. The total time is the slowest one, not the sum.

## Looping with await

In a `for…of` loop, `await` runs sequentially:

```javascript
for (const id of ids) {
  await processOne(id);   // strictly one at a time
}
```

For parallelism, map and join:

```javascript
await Promise.all(ids.map(processOne));
```

For *bounded* parallelism (e.g. "10 at a time"), use a queue, p-limit, or write a small helper:

```javascript
async function pool(items, n, fn) {
  const results = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve(fn(item)).then((r) => { executing.delete(p); return r; });
    results.push(p);
    executing.add(p);
    if (executing.size >= n) await Promise.race(executing);
  }
  return Promise.all(results);
}
```

`forEach` does **not** await — its callback is fire-and-forget:

```javascript
ids.forEach(async (id) => await processOne(id)); // ❌ doesn't wait
```

Use `for…of` or `Promise.all` instead.

## Top-level await (modules)

Inside an ES module you can `await` at the top level — useful for setup:

```javascript
// config.js
export const config = await fetch("/config.json").then((r) => r.json());
```

The module's importers wait for its top-level promises before they execute.

In Node CommonJS or non-module scripts, wrap with an async IIFE:

```javascript
(async () => {
  await main();
})();
```

## Mixing `async` and event handlers

```javascript
button.addEventListener("click", async () => {
  button.disabled = true;
  try {
    await submit();
  } catch (err) {
    showError(err);
  } finally {
    button.disabled = false;
  }
});
```

`async` works fine as an event-handler callback. Just remember the handler returns a promise that nobody awaits — so you must `try/catch` inside.

## Don't forget to await

```javascript
async function doSomething() {
  saveToDb();   // ❌ returns a promise; nobody waits — errors silently
}

async function doSomething() {
  await saveToDb(); // ✅
}
```

ESLint's `no-floating-promises` (in `@typescript-eslint`) and `require-await` rules catch most of these.

## Avoid unnecessary `async`

Wrapping a synchronous function in `async` adds a microtask round-trip:

```javascript
async function add(a, b) { return a + b; } // unnecessary
```

If a function never `await`s, drop the `async`.

## "Return await" — usually optional

```javascript
async function load() {
  return await fetchData(); // the await is technically unnecessary
}

async function load() {
  return fetchData();        // same observable behavior
}
```

The exception: inside `try/catch`. Without `await`, an error would reject the *returned* promise *outside* the `try`, so the `catch` wouldn't run.

```javascript
async function load() {
  try {
    return await fetchData(); // need await — otherwise catch is skipped
  } catch (err) {
    handle(err);
  }
}
```

## A real-world example

```javascript
async function checkout(cart, paymentInfo) {
  try {
    const [stock, shipping] = await Promise.all([
      checkStock(cart.items),
      calculateShipping(cart.address),
    ]);

    if (!stock.allAvailable) {
      throw new Error("Some items are out of stock");
    }

    const order = await createOrder({ ...cart, shipping });
    await chargeCard(order, paymentInfo);
    await sendConfirmation(order);
    return order;
  } catch (err) {
    await logFailure(err);
    throw err;
  }
}
```

Read it top to bottom. There are no `.then`s, no nested callbacks. Errors short-circuit to `catch`.

## Cancellation with `AbortController`

`async`/`await` doesn't add cancellation — the underlying API has to support it. `fetch`, `node:fs/promises`, timers in Node, and many libraries take an `AbortSignal`:

```javascript
const ctrl = new AbortController();
setTimeout(() => ctrl.abort(), 5000);

try {
  const data = await fetch(url, { signal: ctrl.signal });
} catch (err) {
  if (err.name === "AbortError") console.log("cancelled");
}
```

## Next step

Now that you can await anything, the most useful "anything" is the browser's `fetch` API.
