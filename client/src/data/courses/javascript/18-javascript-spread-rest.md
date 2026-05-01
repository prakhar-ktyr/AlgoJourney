---
title: JavaScript Spread and Rest
---

# JavaScript Spread and Rest

The three dots `...` mean two opposite things depending on **where** they appear:

| Position                                  | Meaning  | What it does                          |
| ----------------------------------------- | -------- | ------------------------------------- |
| In a function declaration's parameter list | **rest** | collect remaining arguments into an array |
| On the left of `=` in destructuring        | **rest** | collect remaining elements/properties  |
| Anywhere a value is expected               | **spread** | expand an iterable or object          |

Same syntax, different meaning. Once you spot which side of the `=` you're on, it becomes natural.

## Rest in function parameters

```javascript
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3);    // 6
sum();           // 0
sum(1, 2, 3, 4); // 10
```

`nums` is a real `Array` (unlike the older `arguments` object), so `map`, `filter`, etc. all work.

A rest parameter must be **last** and there can only be **one**:

```javascript
function fn(a, b, ...rest) {} // ✅
function fn(...rest, last) {} // ❌ SyntaxError
```

Combine with regular params:

```javascript
function logEvent(level, ...messages) {
  console.log(`[${level}]`, ...messages);
}

logEvent("info", "user", 42, "logged in");
// [info] user 42 logged in
```

## Rest in destructuring

```javascript
const [first, ...others] = [1, 2, 3, 4];
// first === 1, others === [2, 3, 4]

const { a, ...rest } = { a: 1, b: 2, c: 3 };
// a === 1, rest === { b: 2, c: 3 }
```

A common pattern: drop a property from an object without mutating it.

```javascript
const user = { id: 1, name: "Ada", password: "secret" };
const { password, ...safe } = user;
// safe === { id: 1, name: "Ada" }
```

## Spread in arrays

```javascript
const a = [1, 2];
const b = [3, 4];

[...a, ...b];          // [1, 2, 3, 4]
[0, ...a, 99, ...b];   // [0, 1, 2, 99, 3, 4]
[...a];                // shallow copy of a

[..."hello"];          // ["h", "e", "l", "l", "o"]
[...new Set([1, 1, 2])]; // [1, 2]
```

Spread works on any **iterable** (`Array`, `String`, `Map`, `Set`, generators, NodeLists in the DOM).

A common deduplication trick:

```javascript
const unique = [...new Set([1, 2, 2, 3, 3, 3])]; // [1, 2, 3]
```

## Spread in function calls

```javascript
function add(a, b, c) {
  return a + b + c;
}

const args = [1, 2, 3];
add(...args);            // 6

Math.max(...[1, 2, 3]);  // 3   (Math.max takes individual arguments)
console.log(...["a","b"]); // a b
```

Before ES6, you'd use `fn.apply(null, args)`. Spread is dramatically clearer.

## Spread in objects

```javascript
const user = { name: "Ada", age: 36 };
const updated = { ...user, age: 37, email: "a@b.com" };
// { name: "Ada", age: 37, email: "a@b.com" }
```

Later keys win — that's how immutable updates work in React, Redux, and modern code in general:

```javascript
function update(state, patch) {
  return { ...state, ...patch };
}
```

Spread is **shallow**. Nested objects still share references:

```javascript
const a = { profile: { city: "NYC" } };
const b = { ...a };
b.profile.city = "LA";
a.profile.city; // "LA"  — same nested object
```

For deep updates use `structuredClone`, a library, or spread layer-by-layer:

```javascript
const updated = {
  ...state,
  profile: { ...state.profile, city: "LA" },
};
```

## Spread vs `Object.assign`

```javascript
{ ...a, ...b }            // preferred — clearer, immutable target
Object.assign({}, a, b);  // same result
Object.assign(a, b);      // mutates a
```

Use spread for new objects; reach for `Object.assign` only when you actually want to mutate an existing one.

## Order matters

```javascript
const user = { name: "Ada", role: "admin" };

{ ...user, role: "user" };   // role: "user"  (override at the end)
{ role: "user", ...user };   // role: "admin" (overridden by spread)
```

Read the literal left-to-right: the last write wins.

## Common spread/rest recipes

```javascript
// Convert arguments-like things to arrays
function takesAll(...args) { return args; }
const arr = [...document.querySelectorAll("p")]; // real array of <p> elements

// Push many items
arr.push(...newItems);
// vs arr.push(newItems[0], newItems[1], ...) — spread is shorter

// Min/max
Math.max(...numbers);

// Clone
const copy = [...arr];
const obj  = { ...source };

// Strip a key
const { secret, ...safe } = data;

// Merge with defaults
const config = { ...DEFAULTS, ...userConfig };
```

## A quick self-check

In each line, is `...x` rest or spread?

```javascript
function f(...x) {}        // rest    (in a parameter list)
const [a, ...x] = arr;     // rest    (left of =)
const y = [...x];          // spread  (value position)
fn(...x);                  // spread  (call argument)
const z = { ...x, key: 1}; // spread  (value position)
```

## Next step

We now have all the data structures we need. Time to control program flow with `if` and `else`.
