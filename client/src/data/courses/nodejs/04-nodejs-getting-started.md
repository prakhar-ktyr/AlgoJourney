---
title: Node.js Getting Started
---

# Node.js Getting Started

You have Node.js installed. Now let's write real programs — starting from a single line and building up to a small project.

## Running JavaScript with Node.js

There are three ways to run JavaScript with Node.js:

### 1. Run a file

Create a file called `app.js`:

```javascript
const name = "Node.js";
console.log(`Hello from ${name}!`);
```

Run it from your terminal:

```bash
node app.js
```

Output:

```
Hello from Node.js!
```

This is how you will run code 99% of the time.

### 2. Evaluate a string

The `-e` flag lets you run inline code without creating a file:

```bash
node -e "console.log(2 + 2)"
```

Output: `4`

Useful for quick one-liners and scripting.

### 3. Use the REPL

Type `node` with no arguments to enter the interactive REPL (Read-Eval-Print Loop):

```bash
$ node
> 2 + 2
4
> "hello".toUpperCase()
'HELLO'
> .exit
```

The REPL is covered in detail in the next lesson.

## The `process` object

Every Node.js program has access to the global `process` object. It provides information about the current process and lets you interact with the operating system.

```javascript
// info.js
console.log("Node version:", process.version);
console.log("Platform:", process.platform);    // 'darwin', 'linux', 'win32'
console.log("Architecture:", process.arch);     // 'x64', 'arm64'
console.log("Current directory:", process.cwd());
console.log("Process ID:", process.pid);
console.log("Uptime:", process.uptime(), "seconds");
```

```bash
node info.js
```

## Command-line arguments

`process.argv` is an array containing the command-line arguments:

```javascript
// args.js
console.log(process.argv);
```

```bash
node args.js hello world
```

Output:

```javascript
[
  '/usr/local/bin/node',   // path to the node binary
  '/home/user/args.js',    // path to your script
  'hello',                 // first argument
  'world'                  // second argument
]
```

The first two elements are always the `node` path and the script path. Your actual arguments start at index 2:

```javascript
// greet.js
const args = process.argv.slice(2);
const name = args[0] || "World";
console.log(`Hello, ${name}!`);
```

```bash
node greet.js Alice    # Hello, Alice!
node greet.js          # Hello, World!
```

## Environment variables

Access environment variables through `process.env`:

```javascript
// env.js
console.log("HOME:", process.env.HOME);
console.log("PATH:", process.env.PATH);
console.log("NODE_ENV:", process.env.NODE_ENV);
```

Set environment variables when running a script:

```bash
NODE_ENV=production node env.js
```

On Windows (PowerShell):

```powershell
$env:NODE_ENV="production"; node env.js
```

## Exit codes

A program's exit code signals success (0) or failure (non-zero) to the operating system:

```javascript
// exit.js
const arg = process.argv[2];

if (!arg) {
  console.error("Usage: node exit.js <name>");
  process.exit(1); // exit with error code 1
}

console.log(`Hello, ${arg}!`);
// implicit process.exit(0) when the program finishes
```

```bash
node exit.js Alice
echo $?   # 0 (success)

node exit.js
echo $?   # 1 (failure)
```

## Standard I/O

Node.js gives you three streams for input and output:

- `process.stdout` — standard output (where `console.log` writes)
- `process.stderr` — standard error (where `console.error` writes)
- `process.stdin` — standard input (for reading user input)

```javascript
// write directly to stdout (no trailing newline like console.log)
process.stdout.write("Hello ");
process.stdout.write("World\n");
```

Reading from stdin (simple example):

```javascript
// ask.js
process.stdout.write("What is your name? ");

process.stdin.once("data", (data) => {
  const name = data.toString().trim();
  console.log(`Hello, ${name}!`);
  process.exit(0);
});
```

```bash
node ask.js
What is your name? Alice
Hello, Alice!
```

## A small project: File stats reporter

Let's combine what you have learned into a useful script that reports information about a file:

```javascript
// filestats.js
const fs = require("fs");
const path = require("path");

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: node filestats.js <file>");
  process.exit(1);
}

const fullPath = path.resolve(filePath);

fs.stat(fullPath, (err, stats) => {
  if (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  console.log(`File: ${path.basename(fullPath)}`);
  console.log(`Path: ${fullPath}`);
  console.log(`Size: ${stats.size} bytes`);
  console.log(`Type: ${stats.isDirectory() ? "Directory" : "File"}`);
  console.log(`Created: ${stats.birthtime.toLocaleString()}`);
  console.log(`Modified: ${stats.mtime.toLocaleString()}`);
});
```

```bash
node filestats.js package.json
```

Output:

```
File: package.json
Path: /home/user/project/package.json
Size: 312 bytes
Type: File
Created: 1/15/2024, 10:30:00 AM
Modified: 1/20/2024, 3:45:00 PM
```

Don't worry if you don't understand `fs` and `path` yet — they each get their own lesson soon. The goal here is to see how a real Node.js script looks.

## Key takeaways

- Run files with `node filename.js`.
- `process.argv` gives you command-line arguments (your args start at index 2).
- `process.env` gives you environment variables.
- `process.exit(code)` ends the program with a status code.
- `console.log` writes to stdout, `console.error` writes to stderr.
