---
title: JavaScript Objects
---

# JavaScript Objects

An **object** is an unordered collection of `key → value` pairs. Almost everything in JavaScript that isn't a primitive is an object: arrays, functions, dates, classes — they all build on the plain object.

## Creating objects

```javascript
// Object literal — by far the most common
const user = {
  name: "Ada",
  age: 36,
  isAdmin: true,
};

// Empty object
const blank = {};

// From entries
const fromEntries = Object.fromEntries([["a", 1], ["b", 2]]); // { a: 1, b: 2 }

// With a class (covered later)
class User { /* ... */ }
const u = new User();

// With a prototype
const proto = { greet() { return "hi"; } };
const child = Object.create(proto);
```

## Property keys

Keys are always strings (or `Symbol`s). Even numeric-looking keys are stored as strings:

```javascript
const obj = { 1: "one", "2": "two" };
obj[1] === obj["1"]; // true
```

A key with non-identifier characters needs quotes:

```javascript
const headers = {
  "Content-Type": "application/json",
  "X-Trace-Id": "abc",
};
```

You can use a runtime expression as a key with `[ ]`:

```javascript
const field = "email";
const update = { [field]: "ada@example.com", [`${field}Verified`]: true };
```

## Reading and writing properties

```javascript
const user = { name: "Ada", age: 36 };

// Dot notation — for known, identifier-safe keys
user.name;              // "Ada"
user.email = "a@b.com"; // add a property

// Bracket notation — for dynamic or non-identifier keys
const k = "age";
user[k];                // 36
user["full name"] = "Ada Lovelace";

// Missing properties return undefined (no error)
user.unknown;           // undefined
```

## Deleting properties

```javascript
delete user.email;
"email" in user; // false
```

Avoid `delete` on hot paths — it slows the engine down. Setting to `undefined` is faster but keeps the key.

## Shorthand syntax

```javascript
const name = "Ada";
const age = 36;

// Property shorthand
const user = { name, age };
// same as { name: name, age: age }

// Method shorthand
const obj = {
  greet() {
    return `Hi, ${this.name}`;
  },
};

// Computed keys
const key = "id";
const record = { [key]: 1 };
```

## Iterating

```javascript
const user = { name: "Ada", age: 36, admin: true };

Object.keys(user);    // ["name", "age", "admin"]
Object.values(user);  // ["Ada", 36, true]
Object.entries(user); // [["name", "Ada"], ["age", 36], ["admin", true]]

for (const key of Object.keys(user)) console.log(key, user[key]);

for (const [key, value] of Object.entries(user)) {
  console.log(key, value);
}

// for…in walks string keys, including inherited ones — usually NOT what you want
for (const key in user) {
  if (Object.hasOwn(user, key)) console.log(key);
}
```

Modern code rarely needs `for…in`. Reach for `Object.entries` instead.

## Checking for a property

```javascript
"name" in user;            // true (also checks the prototype)
Object.hasOwn(user, "name"); // true (own properties only — modern, preferred)
user.hasOwnProperty("name"); // true (legacy; can be shadowed)
user.name !== undefined;     // works most of the time, fails when value IS undefined
```

`Object.hasOwn` is the safest test.

## Copying and merging

```javascript
const a = { x: 1, y: 2 };
const b = { y: 99, z: 3 };

// Spread — preferred for shallow merges
const merged = { ...a, ...b };  // { x: 1, y: 99, z: 3 }   (later keys win)
const copy = { ...a };

// Object.assign — same behavior, mutates the first argument
Object.assign({}, a, b);        // { x: 1, y: 99, z: 3 }
```

Both are **shallow** — nested objects are still shared by reference:

```javascript
const original = { nested: { a: 1 } };
const copy = { ...original };
copy.nested.a = 99;
original.nested.a; // 99 — same nested object
```

For a deep clone:

```javascript
const deep = structuredClone(original);
```

## Freezing and sealing

```javascript
const config = Object.freeze({ apiUrl: "/api", timeout: 5000 });
config.timeout = 1; // silently ignored (throws in strict mode)

Object.isFrozen(config); // true
```

`freeze` is shallow — nested objects are still mutable. Use a recursive freeze if you need deep immutability.

## Optional chaining and nullish coalescing

```javascript
const user = {};

user.profile?.email;          // undefined — no error
user.tags?.[0];               // undefined
user.callback?.();            // not called

const role = user.role ?? "guest";  // "guest"
```

These two operators (covered briefly in [Operators](javascript-operators)) make defensive code dramatically shorter.

## Destructuring (preview)

The next lesson covers this in depth, but here's a taste:

```javascript
const user = { name: "Ada", age: 36, email: "a@b.com" };

const { name, email } = user;
// name === "Ada", email === "a@b.com"

function greet({ name }) {
  return `Hi, ${name}!`;
}
greet(user);
```

## A complete example

```javascript
const cart = {
  customer: { name: "Ada", email: "a@b.com" },
  items: [
    { sku: "A", price: 9.99, qty: 2 },
    { sku: "B", price: 4.50, qty: 1 },
  ],
  promo: null,
};

const subtotal = cart.items.reduce((s, it) => s + it.price * it.qty, 0);
const discount = cart.promo?.amount ?? 0;
const total = subtotal - discount;

const summary = {
  ...cart,
  totals: { subtotal, discount, total },
};
```

That's three lines of business logic and one line of data shaping — the typical rhythm of JS code.

## Next step

Pulling values out of objects and arrays is so common that JavaScript has dedicated syntax for it: destructuring.
