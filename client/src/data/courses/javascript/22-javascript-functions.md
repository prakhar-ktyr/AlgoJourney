---
title: JavaScript Functions
---

# JavaScript Functions

A **function** is a reusable block of code. JavaScript functions are *first-class values* — you can store them in variables, pass them as arguments, and return them from other functions.

## Function declarations

```javascript
function add(a, b) {
  return a + b;
}

add(2, 3); // 5
```

Declarations are **hoisted**: the engine moves them to the top of their scope, so you can call them before the line they appear on.

```javascript
greet(); // works — declaration is hoisted

function greet() {
  console.log("hi");
}
```

## Function expressions

A function used as a value:

```javascript
const add = function (a, b) {
  return a + b;
};

add(2, 3); // 5
```

Function expressions are **not** hoisted in the same way — only the `const`/`let` binding is, and it's in the temporal dead zone until the assignment runs.

Named function expressions are useful for stack traces and recursion:

```javascript
const fact = function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
};
```

## Arrow functions (next lesson)

```javascript
const add = (a, b) => a + b;
```

Arrow functions get their own lesson because they have a few important differences (especially around `this`).

## Parameters

Plain, with defaults, with rest:

```javascript
function greet(name, greeting = "Hello", ...extra) {
  console.log(greeting, name, ...extra);
}

greet("Ada");                          // Hello Ada
greet("Ada", "Hi");                    // Hi Ada
greet("Ada", "Hi", "✨", "🎉");        // Hi Ada ✨ 🎉
```

Default values are computed *per call*, on demand:

```javascript
function log(line, when = new Date()) {
  console.log(when.toISOString(), line);
}
```

## Argument count vs parameter count

JavaScript doesn't enforce arity. Extra arguments are silently dropped (or collected by `...rest`); missing ones are `undefined`.

```javascript
function add(a, b) { return a + b; }
add(1);              // NaN — b is undefined; 1 + undefined → NaN
add(1, 2, 3, 4);     // 3   — extras ignored
```

Inside a non-arrow function, `arguments` is an array-like with everything that was passed. Modern code uses `...rest` instead.

## Return values

Without an explicit `return`, a function returns `undefined`:

```javascript
function log(msg) { console.log(msg); }
log("hi"); // logs "hi", returns undefined
```

Return early to flatten code:

```javascript
function divide(a, b) {
  if (b === 0) return null;
  return a / b;
}
```

Returning multiple values? Use an object (named) or array (positional):

```javascript
function parseRange(s) {
  const [a, b] = s.split("-").map(Number);
  return { start: a, end: b };
}
const { start, end } = parseRange("3-7");
```

## Functions are values

```javascript
const fns = [Math.abs, Math.sqrt, (n) => n * n];
fns.map((fn) => fn(9)); // [9, 3, 81]

function apply(fn, x) {
  return fn(x);
}
apply((n) => n + 1, 10); // 11
```

This is what makes `map`, `filter`, `reduce`, event listeners, and async callbacks possible.

## Higher-order functions

A function that takes or returns another function.

```javascript
function multiplier(factor) {
  return (n) => n * factor;
}

const double = multiplier(2);
const triple = multiplier(3);

double(5); // 10
triple(5); // 15
```

## Pure functions

A **pure** function:

1. returns the same output for the same input, every time, and
2. has no side effects (doesn't read or write the outside world).

```javascript
// Pure
const square = (n) => n * n;
const fullName = ({ first, last }) => `${first} ${last}`;

// Impure — depends on the time
const stamp = () => Date.now();

// Impure — mutates input
const sortAsc = (arr) => arr.sort();

// Pure version
const sortAscPure = (arr) => [...arr].sort();
```

Pure functions are easier to test, cache, and reason about. Reach for them by default.

## IIFE — immediately invoked function expression

```javascript
(function () {
  // runs immediately, in its own scope
})();

(async () => {
  await main();
})();
```

In modules (ES2015+) you rarely need an IIFE — every module file already has its own scope. Top-level `await` (ES2022) replaces the async IIFE.

## Recursion

A function that calls itself.

```javascript
function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1);
}
fact(5); // 120
```

Be aware: JavaScript engines do **not** implement tail-call optimization (Safari is the only one that ever did). Very deep recursion can overflow the stack — use a loop for those cases.

## Function metadata

```javascript
function add(a, b) { return a + b; }

add.name;    // "add"
add.length;  // 2  — number of declared parameters (ignores defaults and rest)
```

## Documenting with JSDoc

```javascript
/**
 * Repeat a string n times.
 * @param {string} s - The string to repeat.
 * @param {number} n - How many times.
 * @returns {string}
 */
function repeat(s, n) {
  return s.repeat(n);
}
```

Modern editors use JSDoc for autocomplete and type checking even in plain `.js` files.

## A complete example

```javascript
function summarize(orders, { onlyPaid = true } = {}) {
  return orders
    .filter((o) => !onlyPaid || o.status === "paid")
    .reduce(
      (acc, o) => {
        acc.count += 1;
        acc.total += o.total;
        return acc;
      },
      { count: 0, total: 0 },
    );
}
```

Default-parameter destructuring, an immutable filter, and a reduce — all in seven lines.

## Next step

Arrow functions are an everyday tool with their own quirks. They get their own lesson.
