---
title: Node.js JSON
---

# Node.js JSON

JSON (JavaScript Object Notation) is the standard data-interchange format on the web. Since JSON is native to JavaScript, Node.js has excellent built-in support for parsing, creating, and manipulating JSON data.

## JSON syntax refresher

```json
{
  "name": "Alice",
  "age": 30,
  "isAdmin": false,
  "hobbies": ["reading", "coding"],
  "address": {
    "city": "Mumbai",
    "zip": "400001"
  },
  "spouse": null
}
```

JSON supports six types: **string**, **number**, **boolean**, **null**, **array**, and **object**. Keys must be double-quoted strings.

## Parsing JSON (string → object)

```javascript
const jsonString = '{"name":"Alice","age":30,"hobbies":["reading","coding"]}';

const user = JSON.parse(jsonString);
console.log(user.name);    // "Alice"
console.log(user.hobbies); // ["reading", "coding"]
```

### Handling invalid JSON

```javascript
try {
  const data = JSON.parse("not valid json");
} catch (err) {
  console.error("Invalid JSON:", err.message);
  // Invalid JSON: Unexpected token 'o', "not valid json" is not valid JSON
}
```

**Always wrap `JSON.parse` in try/catch** when parsing untrusted input (API responses, user data, files).

### Reviver function

Transform values during parsing:

```javascript
const json = '{"name":"Alice","createdAt":"2024-01-15T10:30:00.000Z"}';

const user = JSON.parse(json, (key, value) => {
  // Convert date strings to Date objects
  if (key === "createdAt") return new Date(value);
  return value;
});

console.log(user.createdAt instanceof Date); // true
```

## Stringifying (object → string)

```javascript
const user = { name: "Alice", age: 30, hobbies: ["reading"] };

const jsonString = JSON.stringify(user);
console.log(jsonString);
// '{"name":"Alice","age":30,"hobbies":["reading"]}'
```

### Pretty printing

```javascript
const pretty = JSON.stringify(user, null, 2);
console.log(pretty);
// {
//   "name": "Alice",
//   "age": 30,
//   "hobbies": [
//     "reading"
//   ]
// }
```

The third argument is the number of spaces for indentation.

### Replacer function

Control which properties are included:

```javascript
const user = { name: "Alice", password: "secret123", email: "alice@test.com" };

// Filter out sensitive fields
const safe = JSON.stringify(user, (key, value) => {
  if (key === "password") return undefined; // omit this field
  return value;
});
console.log(safe); // '{"name":"Alice","email":"alice@test.com"}'

// Or use an array of allowed keys
const filtered = JSON.stringify(user, ["name", "email"]);
console.log(filtered); // '{"name":"Alice","email":"alice@test.com"}'
```

### toJSON method

Objects can define a custom `toJSON` method:

```javascript
class User {
  constructor(name, password) {
    this.name = name;
    this.password = password;
  }

  toJSON() {
    return { name: this.name }; // never serialize password
  }
}

const user = new User("Alice", "secret");
console.log(JSON.stringify(user)); // '{"name":"Alice"}'
```

## Reading JSON files

### Synchronous

```javascript
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync("config.json", "utf-8"));
console.log(data);
```

### Asynchronous

```javascript
import { readFile } from "node:fs/promises";

const raw = await readFile("config.json", "utf-8");
const data = JSON.parse(raw);
console.log(data);
```

### Import assertions (Node.js 17.5+)

```javascript
import config from "./config.json" with { type: "json" };
console.log(config);
```

This imports JSON as a module — handy for static configuration.

## Writing JSON files

```javascript
import { writeFile } from "node:fs/promises";

const users = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
];

await writeFile("users.json", JSON.stringify(users, null, 2));
console.log("File written");
```

## Streaming JSON (large files)

For very large JSON files that don't fit in memory, use a streaming parser:

```bash
npm install JSONStream
```

```javascript
import { createReadStream } from "node:fs";
import JSONStream from "JSONStream";

const stream = createReadStream("huge-data.json")
  .pipe(JSONStream.parse("*")); // parse each top-level array element

stream.on("data", (item) => {
  console.log("Item:", item);
});

stream.on("end", () => {
  console.log("Done");
});
```

## JSON in Express

Express parses and sends JSON automatically:

```javascript
import express from "express";

const app = express();
app.use(express.json()); // parse JSON request bodies

app.post("/api/users", (req, res) => {
  console.log(req.body); // already parsed from JSON
  res.json({ message: "Created", user: req.body }); // sends JSON response
});
```

| Method | What it does |
|--------|-------------|
| `express.json()` | Middleware that parses JSON request bodies |
| `res.json(obj)` | Sends a JSON response with correct Content-Type |
| `req.body` | The parsed JSON body (after middleware) |

## Deep cloning objects

A quick trick to deep-clone a plain object:

```javascript
const original = { a: 1, b: { c: 2 } };
const clone = JSON.parse(JSON.stringify(original));

clone.b.c = 99;
console.log(original.b.c); // 2 (unchanged)
```

**Caveat**: This drops `undefined`, functions, `Date` objects (become strings), `Map`, `Set`, and other non-JSON types. For full deep cloning, use `structuredClone()`:

```javascript
const clone = structuredClone(original); // handles Dates, Maps, Sets, etc.
```

## Common pitfalls

| Issue | Cause | Fix |
|-------|-------|-----|
| `undefined is not valid JSON` | Passing `undefined` to `JSON.stringify` | Check value before stringifying |
| Circular reference error | Object references itself | Remove circular refs or use a replacer |
| Dates become strings | `JSON.stringify` converts `Date` to ISO string | Use a reviver to convert back |
| Numbers lose precision | JSON uses IEEE 754 doubles | Use strings for big integers |

## Key takeaways

- `JSON.parse()` converts a string to an object. Always wrap in try/catch for untrusted input.
- `JSON.stringify()` converts an object to a string. Use the replacer to filter fields.
- Read JSON files with `readFile` + `JSON.parse`. Write with `JSON.stringify` + `writeFile`.
- Use streaming parsers for very large JSON files.
- Express handles JSON natively with `express.json()` middleware and `res.json()`.
