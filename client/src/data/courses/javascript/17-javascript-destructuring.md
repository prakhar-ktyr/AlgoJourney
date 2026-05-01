---
title: JavaScript Destructuring
---

# JavaScript Destructuring

**Destructuring** unpacks values from arrays and properties from objects into named variables — in a single, readable line.

## Array destructuring

```javascript
const [a, b, c] = [1, 2, 3];
// a === 1, b === 2, c === 3
```

Skip with commas:

```javascript
const [, , third] = [1, 2, 3];
// third === 3
```

Defaults for missing values:

```javascript
const [x = 10, y = 20] = [1];
// x === 1, y === 20
```

Collect the rest with `...`:

```javascript
const [head, ...tail] = [1, 2, 3, 4];
// head === 1, tail === [2, 3, 4]
```

A famous one-liner: swap two variables.

```javascript
let a = 1, b = 2;
[a, b] = [b, a];
// a === 2, b === 1
```

## Object destructuring

```javascript
const user = { name: "Ada", age: 36, email: "a@b.com" };

const { name, age } = user;
// name === "Ada", age === 36
```

Rename while destructuring with `:` :

```javascript
const { name: fullName, email: contact } = user;
// fullName === "Ada", contact === "a@b.com"
```

Defaults:

```javascript
const { role = "guest" } = user;
// role === "guest"
```

Combine rename + default:

```javascript
const { country: cc = "US" } = user;
// cc === "US"
```

Collect the rest:

```javascript
const { name, ...others } = user;
// name === "Ada", others === { age: 36, email: "a@b.com" }
```

## Nested destructuring

```javascript
const order = {
  id: 7,
  customer: { name: "Ada", address: { city: "Berlin" } },
  items: [{ sku: "A", qty: 2 }],
};

const {
  customer: { name, address: { city } },
  items: [first],
} = order;

// name === "Ada", city === "Berlin", first === { sku: "A", qty: 2 }
```

Read carefully: `customer:` is **not** declaring a variable named `customer` — it's *path syntax*. The name on the right (`name`, `city`, `first`) is the variable.

## Destructuring function parameters

This is where destructuring shines. Instead of receiving a positional list of arguments, accept a single options object:

```javascript
function createUser({ name, email, role = "user", isAdmin = false }) {
  // ...
}

createUser({ name: "Ada", email: "a@b.com", isAdmin: true });
```

Benefits:

- Order doesn't matter at the call site.
- The signature documents itself.
- Defaults are local to the function.
- Adding a new option doesn't break callers.

For arrays:

```javascript
function midpoint([x1, y1], [x2, y2]) {
  return [(x1 + x2) / 2, (y1 + y2) / 2];
}
midpoint([0, 0], [10, 4]); // [5, 2]
```

## Default-everything pattern

If the caller might omit the entire options object, give the parameter a default:

```javascript
function paginate({ page = 1, pageSize = 20 } = {}) {
  return { page, pageSize };
}

paginate();           // { page: 1, pageSize: 20 }
paginate({ page: 3 }); // { page: 3, pageSize: 20 }
```

Without the `= {}`, calling `paginate()` would throw because you can't destructure `undefined`.

## Destructuring in loops and callbacks

```javascript
const users = [
  { name: "Ada", age: 36 },
  { name: "Grace", age: 85 },
];

for (const { name, age } of users) {
  console.log(`${name} is ${age}`);
}

users.map(({ name }) => name.toUpperCase()); // ["ADA", "GRACE"]

Object.entries({ a: 1, b: 2 }).forEach(([key, value]) => {
  console.log(key, value);
});
```

Pair this with `Object.entries` and `Map` iteration — once you've used it a few times you stop reaching for `arr[0]` / `arr[1]`.

## Returning multiple values

JavaScript can't return multiple things, but it can return an object or array, and the caller can destructure:

```javascript
function parse(input) {
  return { ok: true, value: Number(input) };
}

const { ok, value } = parse("42");
```

For a position-based "tuple" return, use an array:

```javascript
function divide(a, b) {
  return [Math.floor(a / b), a % b];
}
const [q, r] = divide(10, 3); // q === 3, r === 1
```

## Destructuring null and undefined

You can't destructure them — they throw:

```javascript
const { a } = null;       // ❌ TypeError
const { a } = undefined;  // ❌ TypeError
const [x] = null;         // ❌ TypeError
```

That's why function parameters use `= {}`:

```javascript
function f({ a } = {}) { /* safe even if called with no argument */ }
```

## Existing variables (assignment destructuring)

If the variables already exist, wrap the assignment in parentheses — otherwise the parser sees `{` as a block:

```javascript
let a, b;
({ a, b } = { a: 1, b: 2 });
```

This trips up everyone the first time. Just remember the parens.

## A real-world fetch + destructure

```javascript
const response = await fetch("/api/user/42");
const { id, name, email, address: { city = "Unknown" } = {} } = await response.json();
```

One line replaces five `const x = data.x;` assignments — and gives `city` a default if the address is missing.

## Next step

Destructuring uses `...` for "the rest". The same syntax also **spreads** values out — that's the next lesson.
