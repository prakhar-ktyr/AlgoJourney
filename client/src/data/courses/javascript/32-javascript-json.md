---
title: JavaScript JSON
---

# JavaScript JSON

**JSON** (JavaScript Object Notation) is a plain-text format for data. It is the language of HTTP APIs, config files, and inter-process communication everywhere on the modern internet. The format is a subset of JavaScript object syntax — but it is *not* JavaScript and has a few important rules.

## What JSON looks like

```json
{
  "name": "Ada",
  "age": 36,
  "isAdmin": true,
  "tags": ["math", "engineering"],
  "address": { "city": "London", "zip": "SW1" },
  "lastLogin": null
}
```

The full grammar: **objects** with string keys, **arrays**, **strings**, **numbers**, **booleans**, and `null`. That's it.

## The two functions

```javascript
JSON.stringify(value);  // JS value → JSON string
JSON.parse(jsonText);   // JSON string → JS value
```

```javascript
const obj  = { a: 1, b: [2, 3] };
const text = JSON.stringify(obj);   // '{"a":1,"b":[2,3]}'
const back = JSON.parse(text);      // { a: 1, b: [2, 3] }
```

`parse` returns a *new* deep copy — `back !== obj`.

## Pretty printing

```javascript
JSON.stringify(obj, null, 2);
// {
//   "a": 1,
//   "b": [
//     2,
//     3
//   ]
// }
```

The third argument is the indent. Use `2` for human-readable; omit for compact (network) output.

## What JSON cannot represent

`JSON.stringify` silently drops or transforms several JavaScript values:

| JS value             | JSON output                        |
| -------------------- | ---------------------------------- |
| `undefined`          | omitted (in objects), `null` (in arrays) |
| Functions            | omitted / `null`                   |
| `Symbol`             | omitted / `null`                   |
| `Date`               | ISO string via `toJSON()`          |
| `Map`, `Set`         | `{}` (empty object)                |
| `BigInt`             | ❌ throws a `TypeError`            |
| `NaN`, `±Infinity`   | `null`                             |
| Circular reference   | ❌ throws a `TypeError`            |

```javascript
JSON.stringify({ a: undefined, b: () => {}, c: new Date(), d: NaN });
// '{"c":"2025-01-01T00:00:00.000Z","d":null}'
```

If you need to round-trip a `Map`, `Set`, or `Date`, convert to a plain object first or use a *replacer* and *reviver*.

## Replacer (custom serialization)

The second argument to `stringify` is a **replacer** — either an array of allowed keys or a function that returns the value to serialize.

```javascript
const user = { id: 1, name: "Ada", password: "secret" };

// Whitelist
JSON.stringify(user, ["id", "name"]);  // '{"id":1,"name":"Ada"}'

// Function
JSON.stringify(user, (key, value) => {
  if (key === "password") return undefined; // strip
  return value;
});
```

You can also define a `toJSON()` method on objects — `stringify` calls it automatically:

```javascript
class Money {
  constructor(amount, currency) { this.amount = amount; this.currency = currency; }
  toJSON() { return `${this.amount} ${this.currency}`; }
}
JSON.stringify({ price: new Money(9.99, "USD") }); // '{"price":"9.99 USD"}'
```

`Date.prototype.toJSON` already exists — that's why dates serialize as ISO strings.

## Reviver (custom deserialization)

`JSON.parse` accepts a **reviver** function called for every key/value pair. Return the value you want; return `undefined` to drop a key.

```javascript
const text = '{"created":"2025-01-01T00:00:00.000Z","tags":["a","b"]}';

const data = JSON.parse(text, (key, value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value);
  }
  return value;
});

data.created instanceof Date; // true
```

## Strict syntax

JSON is stricter than JavaScript object literals:

```text
✅ "key": value      keys MUST be double-quoted strings
✅ "string"          strings MUST use double quotes
❌ 'string'          single quotes not allowed
❌ trailing commas   { "a": 1, }  ← invalid
❌ comments          JSON has no // or /* */
❌ undefined         not a valid value
```

When hand-editing config files, run them through a linter or use **JSONC** (JSON with Comments) explicitly — VS Code's `tsconfig.json` is JSONC.

## Common patterns

### Deep clone (with caveats)

```javascript
const copy = JSON.parse(JSON.stringify(data));
```

Quick and dirty — drops `undefined`, functions, and dates. For a real deep clone use `structuredClone`:

```javascript
const copy = structuredClone(data);
```

`structuredClone` handles `Date`, `Map`, `Set`, `RegExp`, typed arrays, and circular references.

### Read/write a JSON file (Node)

```javascript
import { readFile, writeFile } from "node:fs/promises";

const config = JSON.parse(await readFile("config.json", "utf8"));
config.updatedAt = new Date().toISOString();
await writeFile("config.json", JSON.stringify(config, null, 2));
```

### Send/receive JSON over HTTP

```javascript
// Client
const r = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Ada" }),
});
const user = await r.json();

// Server (Express)
app.post("/api/users", express.json(), (req, res) => {
  res.json({ id: 1, ...req.body });
});
```

`response.json()` is just `await response.text()` followed by `JSON.parse`.

### Safe parsing

```javascript
function safeParse(text) {
  try {
    return [null, JSON.parse(text)];
  } catch (err) {
    return [err, null];
  }
}

const [err, data] = safeParse(input);
if (err) handle(err); else use(data);
```

User input or third-party text is the most common source of `SyntaxError: Unexpected token`. Always wrap parsing in `try/catch`.

## JSON5 and friends

If you need comments, trailing commas, or unquoted keys (e.g. for config files):

- **JSON5** — superset that allows comments, trailing commas, single quotes.
- **YAML** — even more relaxed, indentation-based.
- **TOML** — typed, INI-like.

For data exchange between programs, stick with strict JSON. Tools support it everywhere.

## Next step

Text data also needs pattern matching. On to regular expressions.
