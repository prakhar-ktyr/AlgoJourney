---
title: JavaScript Data Types
---

# JavaScript Data Types

Every value in JavaScript is one of just **eight types**. Seven are *primitive* (immutable, compared by value); one is *object* (everything else, compared by reference).

## The seven primitives

| Type        | Example                        | Used for                        |
| ----------- | ------------------------------ | ------------------------------- |
| `string`    | `"hello"`, `'hi'`, `` `yo` ``  | Text                            |
| `number`    | `42`, `3.14`, `-0`, `NaN`      | All ordinary numbers (64-bit float) |
| `bigint`    | `9007199254740993n`            | Integers larger than `2^53 - 1` |
| `boolean`   | `true`, `false`                | Yes/no flags                    |
| `null`      | `null`                         | "Intentionally no value"        |
| `undefined` | `undefined`                    | "Not yet set"                   |
| `symbol`    | `Symbol("id")`                 | Unique, hidden object keys      |

## The object type

Everything that is not a primitive is an **object**: arrays, functions, dates, maps, sets, regular expressions, class instances, and plain `{}` objects all share the type `object`.

```javascript
typeof [];           // "object"
typeof {};           // "object"
typeof function() {}; // "function"  ← special case, but still an object
typeof /abc/;        // "object"
```

(`function` is the one historical exception — it's an object that `typeof` calls out specifically.)

## `typeof` — checking a value's type

```javascript
typeof "hi";         // "string"
typeof 42;           // "number"
typeof 42n;          // "bigint"
typeof true;         // "boolean"
typeof undefined;    // "undefined"
typeof Symbol();     // "symbol"
typeof null;         // "object"   ← infamous historical bug
typeof {};           // "object"
typeof [];           // "object"
typeof function(){}; // "function"
```

`typeof null === "object"` is a 1995 bug that can never be fixed without breaking the web. Test for `null` directly: `value === null`.

## Primitives are immutable and compared by value

```javascript
let a = "hello";
let b = a;       // copies the value
b = "world";
console.log(a);  // "hello" — unchanged

"hi".toUpperCase(); // returns "HI"; the original "hi" is untouched
```

Two primitives are equal if their values match:

```javascript
"abc" === "abc"; // true
42 === 42;       // true
```

## Objects are mutable and compared by reference

```javascript
const a = { x: 1 };
const b = a;     // copies the *reference*, not the object
b.x = 99;
console.log(a.x); // 99 — same object

{ x: 1 } === { x: 1 }; // false — two different objects
```

This is the single biggest source of "but I didn't change that!" bugs. Always remember: assigning an object to a new variable makes them point to the same thing.

## `null` vs `undefined`

Both mean "no value", but with a small difference in *intent*:

- `undefined` — the system hasn't given this a value yet (uninitialized variable, missing property, missing argument).
- `null` — the programmer is **deliberately** marking this as empty.

```javascript
let x;             // undefined (you didn't assign one)
function f(a) {}
f();               // a is undefined
({}).missing;      // undefined

let chosen = null; // null (you set it on purpose)
```

Many style guides say: never assign `undefined` yourself. Use `null` when you mean "intentionally empty".

## Numbers in one type

JavaScript has no separate `int` / `float` — all numbers are 64-bit IEEE 754 floats:

```javascript
typeof 1;     // "number"
typeof 1.5;   // "number"
1 === 1.0;    // true
```

For integer math larger than `Number.MAX_SAFE_INTEGER` (`2^53 - 1`), use `BigInt`:

```javascript
9007199254740993n + 10n; // 9007199254741003n
```

We dive into both in the [Numbers](javascript-numbers) lesson.

## Symbols (preview)

A `Symbol()` is a unique, anonymous identifier. Its main use is as an object key that won't collide with other code's keys.

```javascript
const id = Symbol("id");
const user = { [id]: 42 };
user[id]; // 42
```

Detailed coverage in the [Symbols](javascript-symbols) lesson.

## Functions are values

A function in JavaScript is just an object you can call. It can be assigned, passed as an argument, returned, and stored in arrays — exactly like a number:

```javascript
const greet = function (name) { return "hi " + name; };
const fns = [Math.sqrt, Math.abs, greet];
fns[2]("Ada"); // "hi Ada"
```

This *first-class function* property is what makes callbacks, array methods, and event listeners possible.

## Quick reference

```javascript
const examples = {
  string:    "Ada",
  number:    42,
  bigint:    42n,
  boolean:   true,
  nothing:   null,
  notSet:    undefined,
  symbol:    Symbol("k"),
  array:     [1, 2, 3],     // object
  object:    { a: 1 },      // object
  date:      new Date(),    // object
  fn:        () => 1,       // function (object)
};
```

## Next step

Now we'll zoom in on the most common types, starting with numbers.
