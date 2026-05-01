---
title: Node.js Debugging
---

# Node.js Debugging

`console.log` works, but a real debugger lets you pause execution, inspect variables, step through code line by line, and evaluate expressions — all without modifying your source code.

## console methods (quick debugging)

Beyond `console.log`, Node.js offers useful console methods:

```javascript
// Basic logging
console.log("info message");
console.error("error message");  // goes to stderr
console.warn("warning");

// Formatted table
const users = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
];
console.table(users);
// ┌─────────┬─────────┬─────┐
// │ (index) │  name   │ age │
// ├─────────┼─────────┼─────┤
// │    0    │ 'Alice' │ 30  │
// │    1    │ 'Bob'   │ 25  │
// └─────────┴─────────┴─────┘

// Timing
console.time("db-query");
await database.query("SELECT * FROM users");
console.timeEnd("db-query"); // db-query: 42.3ms

// Count calls
function processItem(item) {
  console.count("processItem called");
  // ...
}

// Group related logs
console.group("User Registration");
console.log("Validating input");
console.log("Hashing password");
console.log("Saving to database");
console.groupEnd();

// Assert (logs only if condition is false)
console.assert(users.length > 0, "No users found!");

// Object inspection with depth
console.dir(deeplyNestedObject, { depth: null, colors: true });
```

## The --inspect flag

Node.js has a built-in debugging protocol. Start your app with `--inspect`:

```bash
# Start with debugger
node --inspect server.js

# Break on first line
node --inspect-brk server.js

# Custom port
node --inspect=9230 server.js
```

Output:

```
Debugger listening on ws://127.0.0.1:9229/abc-123-def
For help, see: https://nodejs.org/en/docs/inspector
```

## Chrome DevTools debugging

1. Start your app with `node --inspect server.js`
2. Open Chrome and go to `chrome://inspect`
3. Click **"Open dedicated DevTools for Node"**
4. You get the full Chrome debugger: breakpoints, call stack, scope variables, console

### Setting breakpoints

In the **Sources** tab:

- Click a line number to set a breakpoint
- Right-click for conditional breakpoints
- Use the **Call Stack** panel to navigate up the stack
- Use the **Scope** panel to inspect local and closure variables
- Use the **Watch** panel to track expressions

## VS Code debugging

VS Code has first-class Node.js debugging support.

### Quick start

1. Open your Node.js file
2. Click the gutter (left of line numbers) to set breakpoints
3. Press **F5** or go to **Run > Start Debugging**
4. Select **"Node.js"** if prompted

### launch.json configuration

Create `.vscode/launch.json` for custom configurations:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.js",
      "env": {
        "NODE_ENV": "development",
        "PORT": "5000"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Current File",
      "type": "node",
      "request": "launch",
      "program": "${file}"
    },
    {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "port": 9229
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/vitest",
      "args": ["run", "--reporter=verbose"],
      "console": "integratedTerminal"
    }
  ]
}
```

### VS Code debugger features

| Feature | How |
|---------|-----|
| Set breakpoint | Click line gutter or press F9 |
| Conditional breakpoint | Right-click gutter → "Conditional Breakpoint" |
| Logpoint | Right-click gutter → "Logpoint" (logs without stopping) |
| Step Over | F10 (next line) |
| Step Into | F11 (enter function) |
| Step Out | Shift+F11 (exit function) |
| Continue | F5 (run to next breakpoint) |
| Debug Console | Evaluate expressions during pause |

## The debugger statement

Add `debugger` to your code to create a programmatic breakpoint:

```javascript
function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    debugger; // execution pauses here when debugger is attached
    total += item.price * item.quantity;
  }
  return total;
}
```

This only pauses when a debugger is attached. Remove `debugger` statements before committing.

## Debugging async code

Async debugging works naturally with `--inspect`:

```javascript
async function fetchUserData(userId) {
  debugger; // pause here
  const user = await User.findById(userId);
  debugger; // and here — after the await resolves
  const posts = await Post.find({ author: userId });
  return { user, posts };
}
```

The debugger correctly handles `await` — it pauses after the promise resolves.

## Environment-based debugging

```javascript
const DEBUG = process.env.DEBUG === "true";

function debug(...args) {
  if (DEBUG) console.log("[DEBUG]", ...args);
}

debug("Processing request", req.method, req.url);
debug("Query params:", req.query);
```

Run with:

```bash
DEBUG=true node server.js
```

### Using the debug package

The popular `debug` package provides namespace-based logging:

```bash
npm install debug
```

```javascript
import createDebug from "debug";

const debug = createDebug("app:server");
const dbDebug = createDebug("app:db");

debug("Server starting on port %d", 3000);
dbDebug("Connecting to %s", dbUrl);
```

```bash
# Enable specific namespaces
DEBUG=app:server node server.js
DEBUG=app:* node server.js          # all app namespaces
DEBUG=* node server.js              # everything
```

## Memory debugging

Detect memory leaks:

```javascript
// Log memory usage
const used = process.memoryUsage();
console.log({
  rss: `${Math.round(used.rss / 1024 / 1024)} MB`,       // total memory
  heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
  heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
  external: `${Math.round(used.external / 1024 / 1024)} MB`,
});
```

Take heap snapshots in Chrome DevTools:

1. Start with `node --inspect`
2. Open Chrome DevTools → **Memory** tab
3. Take a heap snapshot
4. Look for objects that shouldn't be there

## Key takeaways

- Use `console.table`, `console.time`, `console.dir` for quick inspection.
- Use `node --inspect` to enable the debugger protocol.
- **VS Code** has the best debugging experience — set breakpoints, step through code, inspect variables.
- Use the `debug` package for namespace-based logging in libraries and larger apps.
- Remove `debugger` statements and `console.log` calls before committing.
- Use Chrome DevTools Memory tab to diagnose memory leaks.
