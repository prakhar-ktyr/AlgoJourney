---
title: JavaScript Equality
---

# JavaScript Equality

JavaScript has **four** ways to compare values for equality. Knowing which to reach for is one of the most important skills in the language.

| Operator / function    | Coerces? | Special cases                  |
| ---------------------- | -------- | ------------------------------ |
| `===` strict equality  | no       | `NaN !== NaN`, `+0 === -0`     |
| `==` loose equality    | yes      | many surprising rules          |
| `Object.is(a, b)`      | no       | `NaN` equals `NaN`, `+0 ≠ -0`  |
| Deep equality          | n/a      | not built in — write or import |

## `===` — strict equality

The default. Two values are strictly equal when they have the **same type** and the **same value**.

```javascript
1 === 1;          // true
"a" === "a";      // true
true === true;    // true
null === null;    // true
undefined === undefined; // true

1 === "1";        // false  — different types
0 === false;      // false
null === undefined; // false
```

Two foot-guns to remember:

```javascript
NaN === NaN;      // false   — NaN is never equal to itself
0 === -0;         // true    — but they're technically different values
```

## `==` — loose equality (avoid)

`==` converts the operands until they're the same type, then compares. The rules fill an entire page of the spec:

```javascript
"" == 0;          // true   — string → number → 0
"0" == 0;         // true
"0" == false;     // true
[] == false;      // true   — [] → "" → 0; false → 0
[] == 0;          // true
[null] == 0;      // true   — [null] → "" → 0
[1] == 1;         // true
null == undefined; // true  — special-cased
null == 0;        // false  — null is not coerced for <, but is for ==
```

This is the famous "wat" zone. **Rule: use `===` everywhere.** The single useful `==` idiom is the `null` check:

```javascript
if (value == null) {
  // true for both null and undefined
}
```

## `Object.is`

`Object.is(a, b)` is like `===` with two corrections:

```javascript
Object.is(NaN, NaN);  // true   — finally
Object.is(+0, -0);    // false  — strictly distinguishes signed zero
Object.is(1, 1);      // true
Object.is({}, {});    // false  — still reference comparison
```

You'll see it most in low-level libraries (React's bailout check, `Array.prototype.includes`). For everyday code, `===` is fine.

## Reference equality for objects

Two distinct objects are **never** `===`, even with identical contents:

```javascript
{ a: 1 } === { a: 1 }; // false
[1, 2]   === [1, 2];   // false

const obj = { a: 1 };
obj === obj;           // true   — same reference
```

`===` answers "is it the same object in memory?", not "do they look alike?".

## Deep equality

JavaScript has no built-in deep equality. The pragmatic options:

```javascript
// 1. JSON round-trip — quick and dirty; fails on functions, Dates, undefined, NaN, cycles
const equal = JSON.stringify(a) === JSON.stringify(b);

// 2. Hand-rolled, recursive
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => deepEqual(a[k], b[k]));
}

// 3. A library you already have
import { isEqual } from "lodash-es";
isEqual(a, b);
```

Test runners (Vitest, Jest) use deep equality in `expect(a).toEqual(b)`.

## A practical comparison

```javascript
const a = { id: 1, name: "Ada" };
const b = { id: 1, name: "Ada" };
const c = a;

a === b;                         // false (different objects)
a === c;                         // true  (same reference)
a.id === b.id;                   // true  (primitive comparison)
JSON.stringify(a) === JSON.stringify(b); // true (deep-ish)
```

## Comparing with `<` and `>`

Relational operators always coerce to a primitive (preferring number). They have their own quirks:

```javascript
"2" < "10";  // false  — string compare, "2" > "1"
"2" < 10;    // true   — string → number
null < 1;    // true   — null → 0
null > 0;    // false
null == 0;   // false  — but...
null >= 0;   // true   — !!! relational uses different rules than ==

NaN < 1;     // false
NaN > 1;     // false
NaN == NaN;  // false  — every comparison with NaN is false
```

Coerce explicitly when sorting strings as numbers:

```javascript
["10", "2", "1"].sort((a, b) => Number(a) - Number(b));  // ["1", "2", "10"]
```

## Membership tests

The "is X equal to any of these?" pattern:

```javascript
// Pre-ES7
[1, 2, 3].indexOf(value) !== -1;

// Modern, preferred
[1, 2, 3].includes(value);

// Set, for many lookups (O(1))
const allowed = new Set(["GET", "POST", "PUT"]);
allowed.has(method);
```

`includes` uses `Object.is`-like semantics, so `[NaN].includes(NaN)` is `true`. `indexOf` uses `===`, so `[NaN].indexOf(NaN)` is `-1`.

## The single rule to remember

> Use `===` and `!==` for everything. Reach for `Object.is` only when you specifically need NaN-equality, and use a deep-equality helper for nested objects.

## Next step

Now we step beyond primitives into the real workhorse of JavaScript: arrays.
