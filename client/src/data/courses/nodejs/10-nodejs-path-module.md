---
title: Node.js Path Module
---

# Node.js Path Module

The `path` module provides utilities for working with file and directory paths. It handles the differences between operating systems (Windows uses `\`, Unix uses `/`) so you don't have to.

## Importing

```javascript
// CommonJS
const path = require("path");

// ES Modules
import path from "node:path";
```

## Why use path instead of string concatenation?

```javascript
// Bad — breaks on Windows, misses slashes
const filePath = dir + "/" + file;

// Good — works everywhere
const filePath = path.join(dir, file);
```

String concatenation can produce double slashes, miss trailing slashes, or break on Windows where the separator is `\`. The `path` module handles all of this.

## path.join()

Joins path segments with the correct separator and normalizes the result:

```javascript
path.join("users", "alice", "documents");
// Unix:    'users/alice/documents'
// Windows: 'users\\alice\\documents'

path.join("/home", "alice", "..", "bob", "file.txt");
// '/home/bob/file.txt'  (.. goes up one level)

path.join("src", "./utils", "../lib", "index.js");
// 'src/lib/index.js'
```

`path.join()` does NOT produce an absolute path. It just concatenates and normalizes.

## path.resolve()

Resolves a sequence of paths into an **absolute path**, working right to left until it finds an absolute starting point:

```javascript
path.resolve("file.txt");
// '/home/user/project/file.txt'  (prepends cwd)

path.resolve("/home", "alice", "file.txt");
// '/home/alice/file.txt'

path.resolve("src", "utils", "index.js");
// '/home/user/project/src/utils/index.js'
```

Think of `path.resolve()` as simulating `cd` commands:

```javascript
path.resolve("/home", "alice", "../bob");
// Same as: cd /home → cd alice → cd ../bob
// Result: '/home/bob'
```

## path.join() vs path.resolve()

| Feature | `path.join()` | `path.resolve()` |
|---|---|---|
| Returns | Relative or absolute (depends on input) | Always absolute |
| Starting point | Concatenates segments | Starts from cwd if no absolute segment |
| Use case | Building relative paths | Building absolute paths |

```javascript
// join keeps it relative
path.join("src", "utils");      // 'src/utils'

// resolve makes it absolute
path.resolve("src", "utils");   // '/home/user/project/src/utils'
```

## path.basename()

Returns the last part of a path (the filename):

```javascript
path.basename("/home/alice/report.pdf");    // 'report.pdf'
path.basename("/home/alice/report.pdf", ".pdf"); // 'report' (strip extension)
path.basename("/home/alice/");              // 'alice'
```

## path.dirname()

Returns the directory containing the path:

```javascript
path.dirname("/home/alice/report.pdf");     // '/home/alice'
path.dirname("/home/alice/");               // '/home'
path.dirname("src/utils/index.js");         // 'src/utils'
```

## path.extname()

Returns the file extension:

```javascript
path.extname("report.pdf");     // '.pdf'
path.extname("archive.tar.gz"); // '.gz'
path.extname("Makefile");       // ''
path.extname(".gitignore");     // ''
```

## path.parse()

Breaks a path into an object with `root`, `dir`, `base`, `ext`, and `name`:

```javascript
path.parse("/home/alice/report.pdf");
```

Returns:

```javascript
{
  root: '/',
  dir: '/home/alice',
  base: 'report.pdf',
  ext: '.pdf',
  name: 'report'
}
```

```javascript
path.parse("C:\\Users\\Alice\\report.pdf");
```

Returns:

```javascript
{
  root: 'C:\\',
  dir: 'C:\\Users\\Alice',
  base: 'report.pdf',
  ext: '.pdf',
  name: 'report'
}
```

## path.format()

The opposite of `parse()` — builds a path string from an object:

```javascript
path.format({
  dir: "/home/alice",
  name: "report",
  ext: ".pdf",
});
// '/home/alice/report.pdf'
```

## path.normalize()

Cleans up messy paths:

```javascript
path.normalize("/home//alice/../bob/./file.txt");
// '/home/bob/file.txt'

path.normalize("src///utils/./index.js");
// 'src/utils/index.js'
```

## path.relative()

Returns the relative path from one location to another:

```javascript
path.relative("/home/alice", "/home/bob/file.txt");
// '../bob/file.txt'

path.relative("/home/alice/project/src", "/home/alice/project/lib");
// '../lib'
```

## path.isAbsolute()

Checks if a path is absolute:

```javascript
path.isAbsolute("/home/alice");  // true
path.isAbsolute("./file.txt");  // false
path.isAbsolute("file.txt");    // false
path.isAbsolute("C:\\Users");   // true (Windows)
```

## Platform-specific separators

```javascript
path.sep;       // '/' on Unix, '\\' on Windows
path.delimiter; // ':' on Unix, ';' on Windows (PATH separator)
```

## path.posix and path.win32

Force a specific platform's behavior regardless of the OS you're on:

```javascript
// Always use forward slashes (useful for URLs)
path.posix.join("api", "users", "123");
// 'api/users/123'

// Always use backslashes
path.win32.join("api", "users", "123");
// 'api\\users\\123'
```

## Practical examples

### Get the current file's directory (ESM)

```javascript
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build paths relative to the current file
const configPath = path.join(__dirname, "config", "default.json");
```

### Change file extension

```javascript
function changeExtension(filePath, newExt) {
  const parsed = path.parse(filePath);
  return path.format({ ...parsed, base: undefined, ext: newExt });
}

changeExtension("report.md", ".html");  // 'report.html'
changeExtension("app.ts", ".js");       // 'app.js'
```

### Safe path construction (prevent directory traversal)

```javascript
function safePath(baseDir, userInput) {
  const resolved = path.resolve(baseDir, userInput);
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error("Path traversal detected");
  }
  return resolved;
}

safePath("/uploads", "photo.jpg");       // OK
safePath("/uploads", "../../etc/passwd"); // throws Error
```

## Key takeaways

- Use `path.join()` to concatenate path segments safely.
- Use `path.resolve()` to get absolute paths.
- Use `path.basename()`, `path.dirname()`, `path.extname()` to extract parts.
- Use `path.parse()` and `path.format()` for full path manipulation.
- Never concatenate paths with `+` or template literals — use `path.join()`.
