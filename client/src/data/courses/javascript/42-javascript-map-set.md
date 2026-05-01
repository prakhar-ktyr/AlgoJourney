---
title: JavaScript Map and Set
---

# JavaScript Map and Set

Plain objects and arrays cover most needs, but for **lookups** and **uniqueness** the dedicated `Map` and `Set` collections are dramatically better.

## `Map` — keyed collection

A `Map` is like an object, with three big advantages:

1. **Any value can be a key** — including objects, functions, even other `Map`s.
2. **Insertion order is preserved** during iteration.
3. **Built-in `size`** and direct iteration.

```javascript
const cache = new Map();

cache.set("user:1", { name: "Ada" });
cache.set("user:2", { name: "Grace" });

cache.get("user:1");        // { name: "Ada" }
cache.has("user:1");        // true
cache.size;                  // 2
cache.delete("user:2");
cache.clear();
```

### Initialize from pairs

```javascript
const m = new Map([
  ["a", 1],
  ["b", 2],
]);
```

### Iterating

```javascript
for (const [key, value] of m)            console.log(key, value);
for (const key   of m.keys())            console.log(key);
for (const value of m.values())          console.log(value);
for (const entry of m.entries())         console.log(entry);

m.forEach((value, key) => console.log(key, value));
```

### Object keys

This is the main reason to reach for `Map`:

```javascript
const meta = new Map();
const user = { id: 1 };

meta.set(user, { lastSeen: Date.now() });
meta.get(user); // { lastSeen: ... }
```

With a plain object you'd have to coerce `user` to a string key (which would be `"[object Object]"`).

### Map vs plain object

| Concern                     | Plain object               | `Map`                  |
| --------------------------- | -------------------------- | ---------------------- |
| Key types                   | strings/symbols only       | any value              |
| Iteration                   | `Object.keys` / `entries`  | direct, ordered        |
| Size                        | `Object.keys(o).length`    | `m.size`               |
| Inherited keys (`toString`) | yes — collisions possible  | no                     |
| JSON serializable           | yes                        | not directly           |
| Ergonomic property access   | `o.foo` / `o["foo"]`       | `m.get` / `m.set`      |

Use a plain object for fixed-shape records (`{ id, name, email }`). Use a `Map` for many dynamic keys, especially when keys aren't strings.

### `Object.fromEntries` and `Object.entries`

Round-trip between objects and Maps:

```javascript
const obj = Object.fromEntries(map);
const map = new Map(Object.entries(obj));
```

## `WeakMap` — keys not retained

A `WeakMap` holds **weak** references to its keys. If nothing else keeps the key alive, the entry is silently garbage-collected. Useful for attaching metadata to objects you don't own.

```javascript
const meta = new WeakMap();
function attach(node, value) { meta.set(node, value); }
```

Restrictions:

- Keys **must be objects** (not strings/numbers).
- Not iterable, no `size`, no `keys`/`values`/`entries`.
- Cannot be enumerated — that's the point.

## `Set` — unique collection

A `Set` stores unique values. Adding a duplicate is a no-op.

```javascript
const tags = new Set();

tags.add("js");
tags.add("ts");
tags.add("js");      // ignored
tags.size;            // 2

tags.has("js");       // true
tags.delete("js");
tags.clear();
```

### Initialize and iterate

```javascript
const unique = new Set([1, 2, 2, 3, 3, 3]);
[...unique]; // [1, 2, 3]

for (const v of unique) console.log(v);
unique.forEach((v) => console.log(v));
```

### Common idioms

```javascript
// Deduplicate an array (one-liner)
const uniq = [...new Set(arr)];

// Membership test (O(1))
const allowed = new Set(["GET", "POST", "PUT"]);
if (allowed.has(method)) { /* ... */ }

// Track "seen"
const seen = new Set();
for (const item of items) {
  if (seen.has(item.id)) continue;
  seen.add(item.id);
  process(item);
}
```

For large lookups, `Set.has` is dramatically faster than `Array.includes`.

### Set operations (ES2025)

The newest browsers ship native set operations:

```javascript
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

a.union(b);              // {1, 2, 3, 4}
a.intersection(b);       // {2, 3}
a.difference(b);         // {1}
a.symmetricDifference(b); // {1, 4}
a.isSubsetOf(b);         // false
a.isSupersetOf(b);       // false
a.isDisjointFrom(b);     // false
```

Polyfill if you need to target older browsers.

## `WeakSet`

Like `WeakMap` but for membership only. Tracks "have I seen this object?" without preventing garbage collection.

```javascript
const visited = new WeakSet();
function visit(node) {
  if (visited.has(node)) return;
  visited.add(node);
  for (const child of node.children) visit(child);
}
```

## Choosing a collection

| Need                                        | Use            |
| ------------------------------------------- | -------------- |
| Fixed-shape record                          | plain `{}`     |
| Many dynamic keys, especially non-string    | `Map`          |
| Unique values                               | `Set`          |
| Per-object metadata, GC-friendly            | `WeakMap`      |
| "Have I seen this object?" without leaking  | `WeakSet`      |
| Indexed list                                | `Array`        |

## A real example: counting word frequencies

```javascript
function wordCount(text) {
  const counts = new Map();
  for (const word of text.toLowerCase().match(/\w+/g) ?? []) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

wordCount("The quick the brown the fox");
// [["the", 3], ["quick", 1], ["brown", 1], ["fox", 1]]
```

`Map` is perfect — keys are dynamic strings, order matters, and `size` is free.

## Next step

We've covered enough JavaScript to ship real code. Two more lessons round things out: testing your code, and a final round of best practices.
