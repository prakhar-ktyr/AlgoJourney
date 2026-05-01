---
title: Node.js Callbacks
---

# Node.js Callbacks

A **callback** is a function passed as an argument to another function, which calls it when its work is done. Callbacks are the original async pattern in Node.js — every built-in async API was designed around them.

## Synchronous callbacks

Not all callbacks are async. Array methods use synchronous callbacks:

```javascript
const numbers = [1, 2, 3, 4, 5];

numbers.forEach((n) => {
  console.log(n); // runs immediately, synchronously
});

console.log("Done"); // runs AFTER all numbers are printed
```

## Asynchronous callbacks

Node.js I/O operations use async callbacks. The callback runs **later**, after the I/O completes:

```javascript
import fs from "node:fs";

console.log("1. Before readFile");

fs.readFile("data.txt", "utf8", (err, data) => {
  console.log("3. File read complete:", data);
});

console.log("2. After readFile (but file isn't read yet!)");
```

Output:

```
1. Before readFile
2. After readFile (but file isn't read yet!)
3. File read complete: <file contents>
```

The callback fires **after** the synchronous code finishes.

## The error-first callback pattern

Node.js uses a convention called **error-first callbacks**: the first argument to the callback is always an error (or `null` if there was no error):

```javascript
fs.readFile("data.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Failed to read file:", err.message);
    return;
  }
  console.log("File contents:", data);
});
```

This pattern is consistent across the entire Node.js API:

```javascript
// File system
fs.writeFile("out.txt", "Hello", (err) => { ... });

// HTTP
http.get("http://example.com", (res) => { ... }).on("error", (err) => { ... });

// DNS
import dns from "node:dns";
dns.lookup("google.com", (err, address) => { ... });

// Child process
import { exec } from "node:child_process";
exec("ls -la", (err, stdout, stderr) => { ... });
```

**Always check the error first.** Ignoring errors is the most common callback mistake.

## Callback hell (the pyramid of doom)

When you need multiple async operations in sequence, callbacks nest deeper and deeper:

```javascript
fs.readFile("config.json", "utf8", (err, configData) => {
  if (err) return console.error(err);

  const config = JSON.parse(configData);

  fs.readFile(config.dataFile, "utf8", (err, rawData) => {
    if (err) return console.error(err);

    const processed = processData(rawData);

    fs.writeFile("output.txt", processed, (err) => {
      if (err) return console.error(err);

      fs.readFile("output.txt", "utf8", (err, result) => {
        if (err) return console.error(err);

        console.log("Final result:", result);
      });
    });
  });
});
```

This is called **callback hell** — deeply nested, hard to read, and error-prone. It's the main reason Promises and `async`/`await` were invented.

## Taming callback hell

### 1. Named functions

Extract each step into a named function:

```javascript
function readConfig(callback) {
  fs.readFile("config.json", "utf8", (err, data) => {
    if (err) return callback(err);
    callback(null, JSON.parse(data));
  });
}

function readData(config, callback) {
  fs.readFile(config.dataFile, "utf8", callback);
}

function writeResult(data, callback) {
  const processed = processData(data);
  fs.writeFile("output.txt", processed, callback);
}

// Still callbacks, but flat and readable
readConfig((err, config) => {
  if (err) return console.error(err);

  readData(config, (err, data) => {
    if (err) return console.error(err);

    writeResult(data, (err) => {
      if (err) return console.error(err);
      console.log("Done!");
    });
  });
});
```

### 2. Use promises (best solution)

Convert callbacks to promises — covered in the next lesson.

## Converting callbacks to promises

Node.js provides `util.promisify()` to convert error-first callback functions to promise-returning functions:

```javascript
import { promisify } from "node:util";
import fs from "node:fs";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Now you can use async/await
const data = await readFile("config.json", "utf8");
const config = JSON.parse(data);
```

Or just use the built-in promise APIs:

```javascript
import fs from "node:fs/promises";

const data = await fs.readFile("config.json", "utf8");
```

## Creating your own callback-based functions

When writing a function that takes a callback, follow the error-first pattern:

```javascript
function fetchUser(id, callback) {
  // Simulate async database query
  setTimeout(() => {
    if (id <= 0) {
      callback(new Error("Invalid user ID"));
      return;
    }

    callback(null, { id, name: "Alice", email: "alice@example.com" });
  }, 100);
}

// Usage
fetchUser(1, (err, user) => {
  if (err) {
    console.error("Failed:", err.message);
    return;
  }
  console.log("User:", user);
});
```

## Common callback mistakes

### 1. Forgetting to return after an error

```javascript
// BUG — callback fires twice!
fs.readFile("file.txt", "utf8", (err, data) => {
  if (err) {
    callback(err);
    // Missing return! Code below still runs.
  }
  callback(null, processData(data)); // Error: data is undefined
});

// FIX
fs.readFile("file.txt", "utf8", (err, data) => {
  if (err) return callback(err); // return stops execution
  callback(null, processData(data));
});
```

### 2. Calling the callback multiple times

```javascript
// BUG
function doWork(callback) {
  doAsync((err, result) => {
    if (err) callback(err);
    callback(null, result); // called even after error!
  });
}

// FIX — use return or else
function doWork(callback) {
  doAsync((err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
}
```

### 3. Throwing inside a callback

```javascript
// BUG — thrown error is NOT caught by try/catch around the async call
try {
  fs.readFile("file.txt", "utf8", (err, data) => {
    throw new Error("oops"); // CRASHES the process
  });
} catch (e) {
  // This NEVER catches the error above
}
```

The `try`/`catch` finishes before the callback runs. Handle errors inside the callback.

## When to use callbacks today

- **Legacy code** — Many existing codebases and npm packages still use callbacks.
- **Event handlers** — `emitter.on("data", callback)` is the callback pattern.
- **Performance-critical code** — Callbacks avoid the overhead of promise objects (rarely matters in practice).

For new code, prefer **promises and async/await** — they are easier to read, compose, and debug. The next two lessons cover them in depth.

## Key takeaways

- A callback is a function passed to another function, called when work completes.
- Node.js uses the **error-first callback pattern**: `(err, result) => { ... }`.
- Always check `err` first and `return` after handling it.
- Nested callbacks create "callback hell" — hard to read and maintain.
- Use `util.promisify()` or `fs/promises` to convert callbacks to promises.
- For new code, prefer `async`/`await` over callbacks.
