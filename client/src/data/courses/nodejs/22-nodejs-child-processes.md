---
title: Node.js Child Processes
---

# Node.js Child Processes

The `child_process` module lets you spawn new processes, run shell commands, and execute other programs from Node.js. This is essential for running system commands, shell scripts, and offloading CPU-intensive work.

## Four ways to create child processes

| Method | Description | Use case |
|---|---|---|
| `exec()` | Run a shell command, buffer output | Short commands, simple scripts |
| `execFile()` | Run a file directly (no shell) | Safer, faster for executables |
| `spawn()` | Stream-based, no buffering | Long-running processes, large output |
| `fork()` | Spawn a Node.js process with IPC | Worker processes, parallel computation |

## exec — Run a shell command

`exec` runs a command in a shell and buffers the output:

```javascript
import { exec } from "node:child_process";

exec("ls -la", (err, stdout, stderr) => {
  if (err) {
    console.error("Error:", err.message);
    return;
  }
  if (stderr) {
    console.error("Stderr:", stderr);
  }
  console.log("Output:\n", stdout);
});
```

### Promise version

```javascript
import { execSync } from "node:child_process";
import { promisify } from "node:util";
import { exec as execCb } from "node:child_process";

const exec = promisify(execCb);

const { stdout } = await exec("git log --oneline -5");
console.log(stdout);
```

### Synchronous version

```javascript
import { execSync } from "node:child_process";

const output = execSync("whoami", { encoding: "utf8" });
console.log(output.trim()); // 'alice'
```

> **Warning:** `exec` runs the command in a **shell** (`/bin/sh` on Unix, `cmd.exe` on Windows). Never pass unsanitized user input to `exec` — it's a **command injection** vulnerability.

```javascript
// DANGEROUS — command injection!
const userInput = "; rm -rf /";
exec(`ls ${userInput}`); // executes: ls ; rm -rf /

// SAFE — use execFile or spawn instead
```

## execFile — Run a file directly

`execFile` runs an executable directly without a shell. It's safer and slightly faster:

```javascript
import { execFile } from "node:child_process";

execFile("git", ["log", "--oneline", "-5"], (err, stdout) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(stdout);
});
```

Arguments are passed as an array, so there's no risk of shell injection.

## spawn — Stream-based processes

`spawn` returns a child process with streams for stdin, stdout, and stderr. It doesn't buffer output, making it ideal for long-running processes or large output:

```javascript
import { spawn } from "node:child_process";

const child = spawn("ls", ["-la", "/usr/local"]);

child.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

child.on("close", (code) => {
  console.log(`Process exited with code ${code}`);
});
```

### Piping between processes

Like shell pipes (`ls | grep .js`):

```javascript
import { spawn } from "node:child_process";

const ls = spawn("ls", ["-la"]);
const grep = spawn("grep", [".js"]);

ls.stdout.pipe(grep.stdin);

grep.stdout.on("data", (data) => {
  console.log(data.toString());
});
```

### Writing to stdin

```javascript
import { spawn } from "node:child_process";

const child = spawn("sort");

child.stdout.on("data", (data) => {
  console.log("Sorted:", data.toString());
});

child.stdin.write("banana\n");
child.stdin.write("apple\n");
child.stdin.write("cherry\n");
child.stdin.end();
```

Output:

```
Sorted: apple
banana
cherry
```

### spawn options

```javascript
const child = spawn("node", ["worker.js"], {
  cwd: "/path/to/directory",       // working directory
  env: { ...process.env, PORT: "3001" }, // environment variables
  stdio: "inherit",                  // inherit parent's stdin/stdout/stderr
  detached: false,                   // run independently of parent
  shell: false,                      // don't use a shell (default)
});
```

`stdio: "inherit"` is useful for running commands that need to show output directly:

```javascript
spawn("npm", ["install"], { stdio: "inherit" });
```

## fork — Spawn a Node.js process with IPC

`fork` is specifically for spawning Node.js processes. It automatically sets up an **IPC (Inter-Process Communication) channel** between parent and child:

### Parent (main.js)

```javascript
import { fork } from "node:child_process";

const child = fork("./worker.js");

// Send a message to the child
child.send({ task: "compute", data: [1, 2, 3, 4, 5] });

// Receive messages from the child
child.on("message", (result) => {
  console.log("Result from worker:", result);
  child.kill(); // clean up
});

child.on("exit", (code) => {
  console.log(`Worker exited with code ${code}`);
});
```

### Child (worker.js)

```javascript
process.on("message", (msg) => {
  if (msg.task === "compute") {
    const sum = msg.data.reduce((a, b) => a + b, 0);
    process.send({ sum });
  }
});
```

Run:

```bash
node main.js
# Result from worker: { sum: 15 }
# Worker exited with code 0
```

### Why fork?

- Offload CPU-intensive work (JSON parsing, image processing, crypto) without blocking the main event loop.
- Each forked process has its own V8 instance and memory.
- IPC channel (`send`/`on("message")`) makes communication easy.

## Error handling

### Process errors

```javascript
const child = spawn("nonexistent-command");

child.on("error", (err) => {
  console.error("Failed to start:", err.message);
  // 'Failed to start: spawn nonexistent-command ENOENT'
});
```

### Exit codes

```javascript
child.on("close", (code, signal) => {
  if (code !== 0) {
    console.error(`Process failed with code ${code}`);
  }
  if (signal) {
    console.log(`Process killed by signal ${signal}`);
  }
});
```

### Killing a process

```javascript
child.kill();           // sends SIGTERM
child.kill("SIGKILL");  // force kill
```

## Practical examples

### Run a shell command and get output

```javascript
import { execSync } from "node:child_process";

function sh(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

console.log("Current branch:", sh("git branch --show-current"));
console.log("Node version:", sh("node --version"));
console.log("Disk usage:", sh("df -h / | tail -1"));
```

### Watch a directory and rebuild

```javascript
import { spawn } from "node:child_process";

const watcher = spawn("node", ["--watch", "src/index.js"], {
  stdio: "inherit",
});

process.on("SIGINT", () => {
  watcher.kill();
  process.exit(0);
});
```

### Parallel workers for CPU-intensive tasks

```javascript
import { fork } from "node:child_process";

function runWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = fork("./heavy-worker.js");
    worker.send(data);
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker exited with ${code}`));
    });
  });
}

// Run 4 parallel workers
const results = await Promise.all([
  runWorker({ chunk: 1 }),
  runWorker({ chunk: 2 }),
  runWorker({ chunk: 3 }),
  runWorker({ chunk: 4 }),
]);

console.log("All workers done:", results);
```

## Key takeaways

- `exec` — shell command, buffered output (watch out for injection).
- `execFile` — direct executable, safer than exec.
- `spawn` — stream-based, best for long-running or large-output processes.
- `fork` — Node.js-specific, built-in IPC for parent-child communication.
- Always handle `"error"` and `"close"` events.
- Never pass unsanitized input to `exec` — use `execFile` or `spawn` with argument arrays.
