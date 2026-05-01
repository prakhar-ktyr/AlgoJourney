---
title: Node.js Process Module
---

# Node.js Process Module

The `process` object is a global that provides information about and control over the current Node.js process. It's available everywhere without importing — though you can import it from `node:process` for clarity.

## process.argv — command-line arguments

```javascript
// run: node app.js hello world --verbose
console.log(process.argv);
// [
//   '/usr/local/bin/node',    // [0] path to node
//   '/path/to/app.js',        // [1] path to script
//   'hello',                   // [2] first argument
//   'world',                   // [3] second argument
//   '--verbose'                // [4] flag
// ]
```

### Parsing arguments

```javascript
const args = process.argv.slice(2); // skip node and script paths
console.log(args); // ['hello', 'world', '--verbose']

// Simple flag check
const verbose = args.includes("--verbose");
console.log("Verbose mode:", verbose);
```

### Named arguments

```javascript
// run: node app.js --port 3000 --host localhost

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      parsed[key] = args[i + 1] || true;
      i++; // skip value
    }
  }
  return parsed;
}

const options = parseArgs(process.argv.slice(2));
console.log(options); // { port: '3000', host: 'localhost' }
```

### Node.js built-in parseArgs (v18.3+)

```javascript
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    port: { type: "string", short: "p", default: "3000" },
    verbose: { type: "boolean", short: "v", default: false },
  },
});

console.log(values.port);    // "3000"
console.log(values.verbose); // false
```

```bash
node app.js --port 4000 -v
```

## process.env — environment variables

```javascript
console.log(process.env.NODE_ENV);  // 'development'
console.log(process.env.PATH);     // system PATH
console.log(process.env.HOME);     // home directory

// Set at runtime (only affects current process)
process.env.MY_VAR = "hello";
```

## process.cwd() — current working directory

```javascript
console.log(process.cwd()); // /Users/alice/projects/myapp

// Change directory
process.chdir("/tmp");
console.log(process.cwd()); // /tmp
```

## process.exit() — exit the process

```javascript
// Exit with success (code 0)
process.exit(0);

// Exit with failure (code 1)
process.exit(1);
```

### Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General failure |
| 2 | Misuse of shell command |
| 126 | Command not executable |
| 127 | Command not found |
| 128 + N | Fatal signal N (e.g., 130 = SIGINT) |

### Graceful exit

Instead of calling `process.exit()` directly, set the exit code and let the process end naturally:

```javascript
process.exitCode = 1; // will exit with code 1 when event loop is empty
```

## process.pid and process.ppid

```javascript
console.log("Process ID:", process.pid);           // e.g., 12345
console.log("Parent process ID:", process.ppid);    // e.g., 12300
```

## process.platform and process.arch

```javascript
console.log(process.platform); // 'darwin' (macOS), 'linux', 'win32'
console.log(process.arch);     // 'x64', 'arm64'

if (process.platform === "win32") {
  console.log("Running on Windows");
}
```

## process.version and process.versions

```javascript
console.log(process.version);    // 'v20.10.0'
console.log(process.versions);   // { node: '20.10.0', v8: '11.8...', ... }
```

## process.memoryUsage()

```javascript
const mem = process.memoryUsage();
console.log({
  rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,       // total allocated
  heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`, // V8 heap
  heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,   // used heap
  external: `${Math.round(mem.external / 1024 / 1024)} MB`,   // C++ objects
});
```

## process.uptime()

```javascript
console.log(`Process uptime: ${process.uptime().toFixed(2)} seconds`);
```

## Standard I/O streams

`process.stdin`, `process.stdout`, and `process.stderr` are readable/writable streams:

```javascript
// Write to stdout (same as console.log)
process.stdout.write("Hello, world!\n");

// Write to stderr (same as console.error)
process.stderr.write("Error occurred\n");

// Read from stdin
process.stdin.setEncoding("utf8");
process.stdin.on("data", (data) => {
  const input = data.trim();
  console.log(`You typed: ${input}`);

  if (input === "quit") {
    process.exit(0);
  }
});
```

### Interactive CLI prompt

```javascript
import { createInterface } from "node:readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("What is your name? ", (name) => {
  console.log(`Hello, ${name}!`);
  rl.close();
});
```

## Signals

Handle OS signals for graceful shutdown:

```javascript
// Ctrl+C
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT (Ctrl+C)");
  // Cleanup: close DB, flush logs, etc.
  process.exit(0);
});

// kill <pid> (default signal)
process.on("SIGTERM", () => {
  console.log("Received SIGTERM");
  process.exit(0);
});
```

| Signal | Trigger | Default action |
|--------|---------|---------------|
| `SIGINT` | Ctrl+C | Terminate |
| `SIGTERM` | `kill <pid>` | Terminate |
| `SIGHUP` | Terminal closed | Terminate |
| `SIGUSR1` | User signal | Start debugger |

## process.nextTick()

Schedule a callback to run before the next event loop iteration:

```javascript
console.log("1: Start");

process.nextTick(() => {
  console.log("2: nextTick");
});

setTimeout(() => {
  console.log("4: setTimeout");
}, 0);

Promise.resolve().then(() => {
  console.log("3: Promise");
});

console.log("1.5: Synchronous");

// Output:
// 1: Start
// 1.5: Synchronous
// 2: nextTick
// 3: Promise
// 4: setTimeout
```

Execution order: synchronous → `process.nextTick` → microtasks (Promises) → macrotasks (setTimeout).

## Process events

```javascript
// Before exit (event loop empty, can schedule async work)
process.on("beforeExit", (code) => {
  console.log("Before exit with code:", code);
});

// On exit (synchronous only, cannot schedule async work)
process.on("exit", (code) => {
  console.log("Exiting with code:", code);
});

// Unhandled promise rejection
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

// Uncaught exception
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

// Warning
process.on("warning", (warning) => {
  console.warn("Warning:", warning.message);
});
```

## Key takeaways

- `process.argv` gives command-line arguments; use `parseArgs` for structured parsing.
- `process.env` holds environment variables (always strings).
- `process.exit(code)` terminates immediately; prefer setting `process.exitCode`.
- `process.stdin/stdout/stderr` are streams for I/O.
- Handle `SIGINT` and `SIGTERM` for graceful shutdown.
- `process.nextTick()` runs before promises and timers.
- Use `process.memoryUsage()` and `process.uptime()` for monitoring.
