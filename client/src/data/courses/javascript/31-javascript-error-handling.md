---
title: JavaScript Error Handling
---

# JavaScript Error Handling

Real programs fail — networks drop, files vanish, users type "abc" into number fields. JavaScript handles failure with **errors**: special objects you can `throw` and `catch`.

## `throw` and `Error`

You can throw any value, but **always throw an `Error`** (or a subclass). Built-in tooling, debuggers, and stack traces depend on it.

```javascript
throw new Error("Something went wrong");
```

The `Error` object captures a `message` and a `stack` trace.

```javascript
try {
  throw new Error("boom");
} catch (e) {
  console.log(e.message); // "boom"
  console.log(e.stack);   // Error: boom\n    at ...
  console.log(e.name);    // "Error"
}
```

## `try` / `catch` / `finally`

```javascript
try {
  // code that might throw
  doRiskyThing();
} catch (err) {
  // runs if `try` throws
  console.error("Failed:", err.message);
} finally {
  // always runs (success or failure)
  cleanup();
}
```

`finally` is for cleanup that must happen no matter what — closing a file, releasing a lock, hiding a spinner. It runs even if you `return` from `try` or `catch`.

## Built-in error types

JavaScript ships several `Error` subclasses you'll see in the wild:

| Type             | Triggered by                                |
| ---------------- | ------------------------------------------- |
| `SyntaxError`    | Invalid JS source (`eval`, `JSON.parse`)    |
| `TypeError`      | Wrong type (`null.foo`, calling a non-function) |
| `ReferenceError` | Reading an undeclared variable              |
| `RangeError`     | Out of range (`new Array(-1)`)              |
| `URIError`       | Bad arguments to URI functions              |
| `AggregateError` | `Promise.any` when all reject               |

```javascript
try {
  null.foo;
} catch (e) {
  e instanceof TypeError;  // true
}
```

## Custom error classes

Subclass `Error` to give errors a meaningful name and extra fields. This is the right way to model domain-specific failures.

```javascript
class HttpError extends Error {
  constructor(status, message, { cause } = {}) {
    super(message, { cause });
    this.name = "HttpError";
    this.status = status;
  }
}

class NotFound extends HttpError {
  constructor(message = "Not found") {
    super(404, message);
    this.name = "NotFound";
  }
}

try {
  throw new NotFound("user not found");
} catch (e) {
  if (e instanceof HttpError) {
    console.log(e.status, e.message); // 404 user not found
  }
}
```

Setting `name` matters — it's what shows in `console.error`, in tests, and in the stack trace.

## `cause` — chaining errors

ES2022 added an optional `cause` so you can wrap a low-level error in a higher-level one without losing the original:

```javascript
try {
  await readConfig();
} catch (err) {
  throw new Error("Failed to start app", { cause: err });
}
```

`console.error` and modern devtools display the cause chain.

## Catching only what you expect

Don't swallow errors you didn't anticipate. Re-throw anything you can't handle:

```javascript
try {
  await save(data);
} catch (err) {
  if (err instanceof ValidationError) {
    showFormErrors(err);
  } else {
    throw err;     // bubble up — let an upper layer log/report it
  }
}
```

A bare `try/catch` that "just keeps going" is one of the easiest ways to hide critical bugs.

## Optional `catch` parameter

If you don't need the error object, omit the parameter (ES2019):

```javascript
try {
  return JSON.parse(text);
} catch {
  return null;
}
```

## Errors in async code

`try/catch` works around `await` exactly as you'd expect:

```javascript
async function loadUser(id) {
  try {
    const r = await fetch(`/api/users/${id}`);
    if (!r.ok) throw new HttpError(r.status, r.statusText);
    return await r.json();
  } catch (err) {
    console.error("loadUser failed:", err);
    throw err;
  }
}
```

For raw promises, use `.catch()`:

```javascript
fetch(url)
  .then((r) => r.json())
  .catch((err) => console.error(err));
```

A promise that rejects with no `.catch` and no surrounding `try/await` is an **unhandled rejection** — Node logs it loudly, and modern browsers fire `unhandledrejection` events.

## Global error hooks

Catch the unexpected at the top of your app:

```javascript
// Browser
window.addEventListener("error", (event) => report(event.error));
window.addEventListener("unhandledrejection", (event) => report(event.reason));

// Node
process.on("uncaughtException", (err) => { /* log + exit */ });
process.on("unhandledRejection", (err) => { /* log + exit */ });
```

These are last-resort logs, not a substitute for `try/catch`.

## Don't throw strings

```javascript
throw "oops";          // ❌ no stack trace, no instanceof
throw new Error("oops"); // ✅
```

Anything you can `throw` is fair, but only `Error` subclasses give callers something useful to inspect.

## Validation: throw or return?

For *expected* failures (a missing form field, a 404 from your own API), returning an explicit result is often friendlier:

```javascript
function parsePort(s) {
  const n = Number(s);
  if (!Number.isInteger(n) || n < 1 || n > 65535) {
    return { ok: false, reason: "out of range" };
  }
  return { ok: true, port: n };
}
```

Reserve `throw` for *exceptional* cases — bugs, system failures, unrecoverable conditions.

## A real example

```javascript
class FetchError extends Error {
  constructor(status, body) {
    super(`HTTP ${status}`);
    this.name = "FetchError";
    this.status = status;
    this.body = body;
  }
}

async function api(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    throw new Error(`Network error calling ${url}`, { cause: err });
  }
  if (!res.ok) {
    const body = await res.text();
    throw new FetchError(res.status, body);
  }
  return res.json();
}
```

The caller can branch on `FetchError` for HTTP errors and on the underlying `cause` for network errors.

## Next step

Errors handled. Next we move data around as text — JSON.
