---
title: JavaScript Variables
---

# JavaScript Variables

A **variable** is a named container for a value. JavaScript has three keywords for declaring one: `let`, `const`, and the legacy `var`.

## `const` — the default

Use `const` for any value you don't intend to reassign. That's most variables in real code.

```javascript
const name = "Ada";
const PI = 3.14159;
const MAX_RETRIES = 3;

name = "Grace"; // ❌ TypeError: Assignment to constant variable.
```

`const` does **not** mean "deeply immutable" — it only prevents *reassignment of the binding*. The contents of an object or array are still editable:

```javascript
const user = { name: "Ada" };
user.name = "Grace";  // ✅ allowed — we're mutating, not reassigning
user = {};            // ❌ not allowed — reassignment
```

If you need a truly immutable object, use `Object.freeze(user)`.

## `let` — when reassignment is needed

Use `let` for values that will change over time: counters, accumulators, the result of a loop.

```javascript
let count = 0;
for (let i = 0; i < 5; i++) {
  count += i;
}
console.log(count); // 10
```

You can declare without an initial value; the variable starts as `undefined`.

```javascript
let answer;
console.log(answer); // undefined
answer = 42;
```

## `var` — avoid in new code

`var` is the original variable keyword from 1995. It has two quirks that make modern code hard to reason about:

1. **Function-scoped, not block-scoped.** It leaks out of `{ ... }` blocks.
2. **Hoisted and initialized to `undefined`.** You can use it before its declaration without an error.

```javascript
function demo() {
  if (true) {
    var x = 10;
  }
  console.log(x); // 10  ← `var` leaked out of the if-block

  console.log(y); // undefined  ← hoisting
  var y = 20;
}
```

`let` and `const` solve both problems by being **block-scoped** and by throwing if you read them before the declaration. **Never use `var` in new code.**

## Block scope

A block is anything inside `{ ... }`. `let` and `const` are visible only inside the block they were declared in:

```javascript
{
  const message = "hi";
  console.log(message); // "hi"
}
console.log(message);   // ❌ ReferenceError
```

## The temporal dead zone

```javascript
console.log(x); // ❌ ReferenceError
let x = 1;
```

The variable `x` exists from the start of its block, but it's in the **temporal dead zone (TDZ)** — unusable — until the line that declares it runs. This is a feature, not a bug: it stops you from accidentally using a variable before you set it.

## Multiple declarations on one line

Allowed, but most teams prefer one variable per line for readability:

```javascript
let x = 1, y = 2, z = 3;     // works
let a = 1;                    // preferred
let b = 2;
let c = 3;
```

## Naming rules and conventions

Already covered in the [Syntax](javascript-syntax) lesson. The short version:

- Start with a letter, `_`, or `$`. Then any of those plus digits.
- Cannot be a reserved word.
- Use `camelCase` for variables, `PascalCase` for classes, `UPPER_SNAKE_CASE` for module-level constants.

```javascript
const userId = 42;        // ✅
const MAX_SIZE = 1024;    // ✅ tells readers it's a tuning knob
let _temp = computeTemp(); // ✅ underscore hints "internal"

let 1stName = "Ada";  // ❌ can't start with a digit
let class = "A";      // ❌ reserved word
```

## Choosing between `const` and `let`

A simple rule that works for 95% of code:

> **Default to `const`. Switch to `let` only when you actually reassign.**

This makes the few `let`s in a file scream "this value is changing — pay attention." Code becomes easier to reason about because most names are guaranteed not to switch out from under you.

## A complete example

```javascript
const TAX_RATE = 0.08;

function totalFor(items) {
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.qty;
  }
  const tax = subtotal * TAX_RATE;
  return subtotal + tax;
}

console.log(
  totalFor([
    { price: 9.99, qty: 2 },
    { price: 4.5,  qty: 1 },
  ]),
); // 26.4492
```

Notice: `TAX_RATE`, `tax`, and the loop's `item` are `const`. Only `subtotal`, which we add to in the loop, needs `let`.

## Next step

Now that we have variables, what kinds of values can we store in them? On to data types.
