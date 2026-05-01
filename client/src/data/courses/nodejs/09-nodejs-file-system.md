---
title: Node.js File System
---

# Node.js File System

The `fs` module lets you read, write, create, delete, and manipulate files and directories on the operating system. It is one of the most used modules in Node.js.

## Importing the fs module

```javascript
// CommonJS
const fs = require("fs");

// ES Modules
import fs from "node:fs";

// Promise-based API (recommended for modern code)
import fs from "node:fs/promises";
```

## Three API styles

The `fs` module provides three ways to do the same operations:

1. **Callback-based** (original) — `fs.readFile(path, callback)`
2. **Synchronous** — `fs.readFileSync(path)` (blocks the event loop)
3. **Promise-based** — `fs.promises.readFile(path)` or `import from "node:fs/promises"`

The **promise-based API** is recommended for modern code. Synchronous methods are fine for scripts and startup code, but avoid them in servers.

## Reading files

### Async (promises)

```javascript
import fs from "node:fs/promises";

const data = await fs.readFile("hello.txt", "utf8");
console.log(data);
```

### Async (callback)

```javascript
const fs = require("fs");

fs.readFile("hello.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err.message);
    return;
  }
  console.log(data);
});
```

### Synchronous

```javascript
const fs = require("fs");

const data = fs.readFileSync("hello.txt", "utf8");
console.log(data);
```

> **Important:** If you omit the encoding (`"utf8"`), `readFile` returns a raw `Buffer` instead of a string.

```javascript
const buffer = fs.readFileSync("hello.txt");
console.log(buffer);           // <Buffer 48 65 6c 6c 6f>
console.log(buffer.toString()); // "Hello"
```

## Writing files

### Write (overwrite)

```javascript
import fs from "node:fs/promises";

await fs.writeFile("output.txt", "Hello, World!\n");
console.log("File written successfully");
```

### Append

```javascript
await fs.appendFile("log.txt", `${new Date().toISOString()} - Server started\n`);
```

### Write with options

```javascript
await fs.writeFile("config.json", JSON.stringify(config, null, 2), {
  encoding: "utf8",
  mode: 0o644,   // file permissions (read/write for owner, read for others)
});
```

### Synchronous versions

```javascript
fs.writeFileSync("output.txt", "Hello, World!\n");
fs.appendFileSync("log.txt", "New log entry\n");
```

## Checking if a file exists

```javascript
import fs from "node:fs/promises";

try {
  await fs.access("config.json");
  console.log("File exists");
} catch {
  console.log("File does not exist");
}
```

Or with `stat`:

```javascript
try {
  const stats = await fs.stat("config.json");
  console.log("Is file:", stats.isFile());
  console.log("Is directory:", stats.isDirectory());
  console.log("Size:", stats.size, "bytes");
  console.log("Modified:", stats.mtime);
} catch {
  console.log("File does not exist");
}
```

## Deleting files

```javascript
await fs.unlink("temp.txt");
console.log("File deleted");
```

## Renaming / moving files

```javascript
await fs.rename("old-name.txt", "new-name.txt");

// Move a file to a different directory
await fs.rename("file.txt", "archive/file.txt");
```

## Copying files

```javascript
await fs.copyFile("source.txt", "destination.txt");
```

## Working with directories

### Create a directory

```javascript
await fs.mkdir("logs");

// Create nested directories (like mkdir -p)
await fs.mkdir("data/backups/2024", { recursive: true });
```

### Read a directory

```javascript
const files = await fs.readdir(".");
console.log(files); // ["index.js", "package.json", "node_modules", ...]
```

With file type information:

```javascript
const entries = await fs.readdir(".", { withFileTypes: true });

for (const entry of entries) {
  const type = entry.isDirectory() ? "DIR " : "FILE";
  console.log(`${type} ${entry.name}`);
}
```

### Remove a directory

```javascript
// Remove empty directory
await fs.rmdir("old-logs");

// Remove directory and all contents (like rm -rf)
await fs.rm("temp", { recursive: true, force: true });
```

## Watching for file changes

```javascript
import fs from "node:fs";

const watcher = fs.watch(".", (eventType, filename) => {
  console.log(`${eventType}: ${filename}`);
});

// Stop watching
// watcher.close();
```

For more robust watching, libraries like `chokidar` are preferred.

## Practical examples

### Read and parse JSON

```javascript
import fs from "node:fs/promises";

async function readJSON(filePath) {
  const text = await fs.readFile(filePath, "utf8");
  return JSON.parse(text);
}

const config = await readJSON("config.json");
console.log(config.port); // 3000
```

### Write JSON with pretty formatting

```javascript
async function writeJSON(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, json + "\n");
}

await writeJSON("config.json", { port: 3000, host: "localhost" });
```

### List all files recursively

```javascript
import fs from "node:fs/promises";
import path from "node:path";

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

const allFiles = await listFiles("./src");
console.log(allFiles);
```

### Simple log file

```javascript
import fs from "node:fs/promises";

async function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  await fs.appendFile("app.log", line);
}

await log("Server started");
await log("User logged in");
```

### Copy a directory

```javascript
import fs from "node:fs/promises";

// Node.js 16.7+
await fs.cp("src", "backup", { recursive: true });
```

## Error handling

Always handle errors when working with the file system:

```javascript
import fs from "node:fs/promises";

try {
  const data = await fs.readFile("missing.txt", "utf8");
  console.log(data);
} catch (err) {
  if (err.code === "ENOENT") {
    console.error("File not found");
  } else if (err.code === "EACCES") {
    console.error("Permission denied");
  } else {
    console.error("Unexpected error:", err.message);
  }
}
```

Common error codes:

| Code | Meaning |
|---|---|
| `ENOENT` | File or directory not found |
| `EACCES` | Permission denied |
| `EEXIST` | File already exists |
| `EISDIR` | Expected a file but found a directory |
| `ENOTDIR` | Expected a directory but found a file |
| `ENOTEMPTY` | Directory is not empty |

## Key takeaways

- Use `node:fs/promises` for modern async file operations.
- Use sync methods (`readFileSync`, etc.) only in scripts or startup code.
- Always specify encoding (`"utf8"`) when reading text files.
- Handle errors — file operations can fail for many reasons.
- Use `{ recursive: true }` for nested directory operations.
