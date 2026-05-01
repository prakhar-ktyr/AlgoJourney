---
title: JavaScript Booleans
---

# JavaScript Booleans

A **boolean** is the simplest type: it is either `true` or `false`. JavaScript uses booleans everywhere — in `if` statements, loops, array methods, and ternary expressions.

## Creating booleans

```javascript
const isReady = true;
const isOnline = false;
```

You'll rarely write `true` or `false` literally — most booleans come from comparisons:

```javascript
const isAdult = age >= 18;
const isEmpty = list.length === 0;
const hasName = user.name !== undefined;
```

## Truthy and falsy

JavaScript needs a boolean answer in many places (`if`, `while`, `&&`, `||`, ternaries). When you give it a non-boolean it is **coerced** to one. There are exactly **eight falsy values** — everything else is truthy.

| Falsy values |
| ------------ |
| `false`      |
| `0`          |
| `-0`         |
| `0n`         |
| `""` (empty string) |
| `null`       |
| `undefined`  |
| `NaN`        |

Everything else — including `"false"`, `"0"`, `[]`, `{}`, and any function — is **truthy**.

```javascript
Boolean(0);        // false
Boolean("");       // false
Boolean(null);     // false
Boolean(undefined);// false
Boolean(NaN);      // false

Boolean("false");  // true   ← non-empty string
Boolean([]);       // true   ← empty array is truthy!
Boolean({});       // true   ← empty object is truthy!
Boolean("0");      // true   ← non-empty string
```

This is why empty arrays surprise newcomers:

```javascript
if ([]) {
  console.log("yes"); // ← runs
}
```

To test "is the array empty?" check `arr.length === 0`.

## Converting to boolean

Three equivalent forms — all common:

```javascript
Boolean(value);   // explicit, recommended for readability
!!value;          // double-negation; terse, popular
value ? true : false; // verbose, avoid

Boolean("");        // false
Boolean("hello");   // true
!!"";               // false
!!"hello";          // true
```

## Logical operators

| Operator | Meaning              | Returns                                 |
| -------- | -------------------- | --------------------------------------- |
| `!`      | NOT                  | always a boolean                        |
| `&&`     | AND                  | the first falsy operand, else the last  |
| `\|\|`   | OR                   | the first truthy operand, else the last |
| `??`     | nullish coalescing   | the first non-null/undefined operand    |

```javascript
!true;             // false
!"hello";          // false
!0;                // true

true && false;     // false
"a" && "b";        // "b"   ← returns the value, not a boolean
0 && "anything";   // 0     ← short-circuits at the first falsy

true || false;     // true
"" || "default";   // "default"
"first" || "second"; // "first" ← short-circuits at the first truthy

null ?? "default";   // "default"
undefined ?? "x";    // "x"
0 ?? "x";            // 0     ← only null/undefined trigger ??
"" ?? "x";           // ""
```

`??` is the modern replacement for `||` when you want a default but consider `0` and `""` as valid values:

```javascript
const fontSize = userSetting || 16;   // 0 falls through to 16  (wrong!)
const fontSize = userSetting ?? 16;   // 0 stays 0              (right)
```

## Short-circuit patterns

These idioms come up constantly:

```javascript
// Default values
const port = process.env.PORT ?? 3000;

// Optional callback
onSuccess && onSuccess(result);

// Conditional render (in JSX or template strings)
return isAdmin && <AdminPanel />;

// Guard clause
user || throwError("missing user");
```

## Comparison operators

All comparison operators return booleans:

```javascript
1 < 2;      // true
1 > 2;      // false
1 <= 1;     // true
1 >= 0;     // true

1 === 1;    // true   — strict equality (recommended)
1 == "1";   // true   — loose equality (avoid; coerces)
1 !== 2;    // true   — strict inequality
1 != "1";   // false  — loose inequality
```

Equality has its own dedicated lesson — see [JavaScript Equality](javascript-equality).

## A real example

```javascript
function canCheckout(cart, user) {
  return (
    cart.items.length > 0 &&
    cart.total > 0 &&
    user?.address &&
    !user.isBanned
  );
}
```

Read it top-to-bottom: there must be items, the total must be positive, the user must have an address, and the user must not be banned. The whole expression returns `true` only if every clause is truthy.

## Next step

Booleans depend on operators, and operators are the next lesson.
