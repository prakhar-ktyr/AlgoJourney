---
title: JavaScript Arrow Functions
---

# JavaScript Arrow Functions

Arrow functions are a shorter syntax for function expressions, introduced in ES2015. They are everywhere in modern JavaScript — every callback, every array method, every React component you'll write tomorrow.

## Syntax

```javascript
// Single parameter, single expression
const square = (n) => n * n;

// No parameters
const now = () => Date.now();

// Multiple parameters
const add = (a, b) => a + b;

// Multi-line body — needs braces and an explicit `return`
const greet = (name) => {
  const message = `Hello, ${name}`;
  return message;
};
```

Compare with the equivalent function expressions:

```javascript
const square = function (n) { return n * n; };
const add    = function (a, b) { return a + b; };
```

Arrow functions trade a few keywords for `=>`. Read aloud as "of these arguments, return…".

## Parentheses around parameters

A single, simple parameter doesn't need parens:

```javascript
const square = n => n * n;       // OK
const square = (n) => n * n;     // also OK; Prettier does this
```

Anything else does:

```javascript
() => 1;             // no params
(a, b) => a + b;     // multiple
({ name }) => name;  // destructuring
(a = 1) => a;        // defaults
(...args) => args;   // rest
```

## Implicit return

A body without `{}` returns the expression directly. With `{}`, you must `return` explicitly.

```javascript
const double = (n) => n * 2;            // implicit return
const double = (n) => { return n * 2; }; // explicit; same result
const noisy  = (n) => { console.log(n); }; // returns undefined
```

To implicit-return an object literal, wrap it in parens — otherwise `{}` looks like a block:

```javascript
const make = (id) => { id, value: 0 }; // ❌ block + comma operator → undefined
const make = (id) => ({ id, value: 0 }); // ✅ returns the object
```

## Arrow functions and `this`

This is the single biggest reason arrow functions exist: they **do not have their own `this`**. They inherit `this` from the surrounding scope at the moment they were *defined*.

```javascript
class Timer {
  constructor() {
    this.seconds = 0;
  }

  // ❌ Regular function — `this` is the timer at *call* time
  startBroken() {
    setInterval(function () {
      this.seconds++;        // `this` is undefined (or window) here
      console.log(this.seconds); // NaN
    }, 1000);
  }

  // ✅ Arrow function — `this` is the surrounding `this` (the Timer instance)
  start() {
    setInterval(() => {
      this.seconds++;
      console.log(this.seconds);
    }, 1000);
  }
}
```

This is the rule that makes arrow functions perfect for callbacks — they "remember" the `this` of the place they were written.

It also makes them a bad choice for **methods on object literals** when you want `this` to refer to the object:

```javascript
const counter = {
  count: 0,
  // ❌ inherits global `this`, not `counter`
  inc: () => { this.count++; },
};
counter.inc();
counter.count; // still 0
```

For object methods, use the shorthand:

```javascript
const counter = {
  count: 0,
  inc() { this.count++; },   // regular method, has its own `this`
};
```

## No `arguments` object

Arrow functions don't bind `arguments`. Use rest parameters instead.

```javascript
function regular() {
  console.log(arguments);    // [Arguments] { 0: 1, 1: 2 }
}

const arrow = (...args) => {
  console.log(args);         // [1, 2]
};
```

## Cannot be used as constructors

```javascript
const Foo = () => {};
new Foo(); // ❌ TypeError: Foo is not a constructor
```

Use `function` or `class` for things you `new`.

## When to use which

| Use…                  | For…                                        |
| --------------------- | ------------------------------------------- |
| Arrow function        | Callbacks, array methods, short helpers     |
| Function declaration  | Top-level helpers (gets a name in stack traces) |
| Method shorthand      | Methods on objects and classes              |
| `class`               | Anything you'll `new`                       |

## Idiomatic patterns

```javascript
// Array methods
const names = users.map((u) => u.name);
const adults = people.filter((p) => p.age >= 18);
const total = items.reduce((sum, it) => sum + it.price, 0);

// Promises
fetch("/api").then((r) => r.json()).then((data) => render(data));

// Curried helpers
const greaterThan = (n) => (x) => x > n;
[1, 2, 3, 4].filter(greaterThan(2)); // [3, 4]

// Default-and-destructure
const fullName = ({ first = "", last = "" } = {}) => `${first} ${last}`.trim();
```

## A subtle pitfall: returning JSX (preview)

In React, the difference between implicit and explicit return matters:

```jsx
const Item = ({ name }) => <li>{name}</li>;            // returns the JSX

const Item = ({ name }) => {
  <li>{name}</li>;                                     // ❌ returns undefined!
};

const Item = ({ name }) => {
  return <li>{name}</li>;                              // ✅
};
```

Forgetting `return` after switching to braces is the most common React beginner bug.

## Next step

Arrow functions inherit `this` and a few other things from their enclosing scope. Scope is the next lesson.
