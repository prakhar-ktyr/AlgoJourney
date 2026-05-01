---
title: JavaScript Operators
---

# JavaScript Operators

An **operator** combines values to produce a new value. We have already met many of them while talking about numbers, strings, and booleans. This lesson is the consolidated reference.

## Arithmetic

```javascript
2 + 3;    // 5     — also string concatenation: "a" + "b" === "ab"
5 - 2;    // 3
4 * 3;    // 12
9 / 2;    // 4.5
9 % 2;    // 1     — remainder
2 ** 8;   // 256   — exponent

let n = 5;
n++;      // postfix: returns 5, n becomes 6
++n;      // prefix:  n becomes 7, returns 7
n--; --n; // same with subtraction

+"42";    // 42    — unary plus, converts to number
-"42";    // -42
```

## Assignment

```javascript
let x = 10;
x += 5;   // 15      x = x + 5
x -= 3;   // 12
x *= 2;   // 24
x /= 4;   // 6
x %= 4;   // 2
x **= 3;  // 8
```

Logical-assignment operators (ES2021) update only when the left side has a particular truthiness:

```javascript
a ||= b;   // a = a || b   — assign if a is falsy
a &&= b;   // a = a && b   — assign if a is truthy
a ??= b;   // a = a ?? b   — assign if a is null/undefined
```

```javascript
const settings = { theme: "dark" };
settings.theme  ??= "light"; // unchanged: "dark"
settings.locale ??= "en-US"; // assigned:  "en-US"
```

## Comparison

```javascript
1 === 1;   // true   strict equal
1 !== 2;   // true   strict not-equal
1 == "1";  // true   loose equal (coerces — avoid)
1 != "2";  // true   loose not-equal (avoid)
1 < 2;     // true
1 > 2;     // false
1 <= 1;    // true
1 >= 0;    // true
```

Always prefer `===` and `!==`. We'll explain why in the [Equality](javascript-equality) lesson.

## Logical

```javascript
!true;             // false
true && "yes";     // "yes"        — first falsy or last value
0 || "default";    // "default"    — first truthy or last value
null ?? "fallback"; // "fallback"  — only when left is null/undefined
```

See [Booleans](javascript-booleans) for the truthy/falsy table.

## String

`+` concatenates strings. If **either** operand is a string, the other is converted:

```javascript
"a" + "b";    // "ab"
"a" + 1;      // "a1"
1 + "a";      // "1a"
1 + 2 + "x";  // "3x"   — left-to-right
"x" + 1 + 2;  // "x12"  — also left-to-right
```

For anything more interesting, use a template literal:

```javascript
`${name}: ${score}`;  // clearer than name + ": " + score
```

## Bitwise (advanced)

Operate on 32-bit integers. Useful for flags, low-level math, and the occasional hash function.

```javascript
5 & 3;     // 1     AND
5 | 3;     // 7     OR
5 ^ 3;     // 6     XOR
~5;        // -6    NOT
5 << 1;    // 10    left shift
5 >> 1;    // 2     right shift (sign-preserving)
-1 >>> 0;  // 4294967295  unsigned right shift
```

You will rarely need these. Use them when you know you need them.

## Conditional (ternary)

```javascript
const status = age >= 18 ? "adult" : "minor";

const label =
  count === 0 ? "empty"
  : count === 1 ? "one"
  : "many";          // chained — readable when each branch is short
```

For more than two outcomes, prefer `if/else` or `switch`. Long ternary chains hurt readability.

## Optional chaining `?.`

```javascript
const city = user?.address?.city;     // undefined if user or address is null/undefined
const name = users?.[0]?.name;        // works on indexes
const result = obj.callback?.();      // call only if callback exists
```

`?.` short-circuits on `null` or `undefined` and returns `undefined` — no error. It does **not** catch other errors:

```javascript
const x = null;
x?.foo.bar;   // undefined   — short-circuits at the first ?
const y = { foo: null };
y?.foo.bar;   // ❌ TypeError — `?.` only protects the step it appears on
y?.foo?.bar;  // undefined
```

## Nullish coalescing `??`

```javascript
const port = userConfig.port ?? 3000;
```

Only `null` and `undefined` trigger the fallback — `0`, `""`, and `false` are kept. Compare with `||`, which would replace all falsy values.

## `typeof`, `instanceof`, `in`, `delete`

```javascript
typeof "hi";              // "string"
typeof undeclared;        // "undefined" (does NOT throw)

[] instanceof Array;      // true
new Date() instanceof Date; // true

"name" in user;           // true if user has a `name` property
0 in [10, 20, 30];        // true (index 0 exists)

const obj = { a: 1, b: 2 };
delete obj.a;             // removes property; returns true
```

## Spread and rest `...`

We cover these properly in their own lesson, but for completeness:

```javascript
const arr = [1, 2, 3];
const more = [0, ...arr, 4];        // [0, 1, 2, 3, 4]   spread

function sum(...nums) {             // rest — collects args
  return nums.reduce((a, b) => a + b, 0);
}
```

## Operator precedence

When in doubt, **add parentheses**. The most common mistake is mixing `&&` with `||` without grouping:

```javascript
isAdmin || isOwner && hasKey;     // means: isAdmin || (isOwner && hasKey)
(isAdmin || isOwner) && hasKey;   // probably what you wanted
```

A condensed precedence table (high → low):

```
.  ?.  []  ()             member access, call
**                         exponent
*  /  %                    multiplicative
+  -                       additive
<  <=  >  >=  in  instanceof
==  !=  ===  !==
&  ^  |                    bitwise
&&
||  ??
?:                         ternary
=  +=  -=  ...             assignment
,                          comma
```

## Next step

Operators move values around. The values we move often need to be **converted** between types — that's the next lesson.
