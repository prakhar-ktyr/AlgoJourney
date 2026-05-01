---
title: JavaScript Numbers
---

# JavaScript Numbers

Almost every JavaScript number is a **64-bit IEEE 754 floating-point** value — the same format C calls `double`. There is one type, `number`, used for both integers and decimals. For very large integers there is a separate `bigint` type.

## Writing numbers

```javascript
42;          // integer
3.14;        // decimal
.5;          // 0.5
6.022e23;    // scientific notation (Avogadro's number)
0xff;        // hexadecimal → 255
0b1010;      // binary      → 10
0o17;        // octal       → 15
1_000_000;   // numeric separator (just for readability) → 1000000
```

## Arithmetic operators

```javascript
2 + 3;   // 5     addition
10 - 4;  // 6     subtraction
6 * 7;   // 42    multiplication
10 / 4;  // 2.5   division
10 % 3;  // 1     remainder
2 ** 10; // 1024  exponent

let n = 5;
n++;     // n is now 6 (returns the old value: 5)
++n;     // n is now 7 (returns the new value: 7)
```

Division never throws — `1 / 0` is `Infinity`, `-1 / 0` is `-Infinity`, and `0 / 0` is `NaN`.

## Floating-point gotchas

Because numbers are binary floats, some decimal values can't be represented exactly:

```javascript
0.1 + 0.2;        // 0.30000000000000004
0.1 + 0.2 === 0.3; // false
```

This is **not** a JavaScript bug — every language using IEEE 754 has it (including Python, Java, and C). For money, you have three choices:

```javascript
// 1. Round to a fixed number of decimals
(0.1 + 0.2).toFixed(2);            // "0.30"  (a string!)
Number((0.1 + 0.2).toFixed(2));    // 0.3

// 2. Work in cents (integers)
(10 + 20) / 100; // 0.3 — exact

// 3. Use a decimal library or BigInt for cents
```

## `NaN` — Not a Number

`NaN` is the result of an undefined math operation. The strangest thing about it: **`NaN` is not equal to anything, including itself**.

```javascript
0 / 0;       // NaN
parseInt("abc"); // NaN
"hello" * 3; // NaN

NaN === NaN; // false (!)
Number.isNaN(NaN);  // true   ← the safe test
isNaN("foo");       // true   ← legacy, coerces first; avoid
```

## `Infinity`

```javascript
1 / 0;          // Infinity
-1 / 0;         // -Infinity
Math.log(0);    // -Infinity
Number.MAX_VALUE * 2; // Infinity (overflowed)

Infinity > 10;  // true
Infinity + 1;   // Infinity
Infinity - Infinity; // NaN
```

## Useful Number constants

```javascript
Number.MAX_SAFE_INTEGER;  // 9007199254740991  (2^53 - 1)
Number.MIN_SAFE_INTEGER;  // -9007199254740991
Number.EPSILON;           // ~2.22e-16  (smallest meaningful difference)
Number.MAX_VALUE;         // ~1.79e308
Number.MIN_VALUE;         // ~5e-324
```

Use `Number.EPSILON` to compare floats safely:

```javascript
function nearlyEqual(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}
nearlyEqual(0.1 + 0.2, 0.3); // true
```

## Number methods

```javascript
(3.14159).toFixed(2);     // "3.14"        — fixed decimals
(1234.5).toFixed(0);      // "1235"
(1234567).toLocaleString("en-US"); // "1,234,567"
(0.5).toString(2);        // "0.1"         — binary
(255).toString(16);       // "ff"          — hex
Number.isInteger(3);      // true
Number.isInteger(3.0);    // true (3.0 is stored as 3)
Number.isInteger(3.1);    // false
```

## Parsing strings to numbers

```javascript
Number("42");        // 42
Number("42.5");      // 42.5
Number("abc");       // NaN
Number("");          // 0  (a famous foot-gun)
Number(" 7 ");       // 7  (whitespace is trimmed)

parseInt("42px");    // 42       — stops at the first non-digit
parseInt("0xff", 16); // 255
parseFloat("3.14abc"); // 3.14

+"42";   // 42       — unary plus, terse but cryptic
+"abc";  // NaN
```

For user input always check the result:

```javascript
const n = Number(input);
if (Number.isFinite(n)) {
  // safe to use as a number
}
```

## The `Math` object

Standard math lives on the global `Math` object. It is **not** a class — call methods on `Math` directly.

```javascript
Math.PI;            // 3.141592653589793
Math.E;             // 2.718281828459045

Math.abs(-5);       // 5
Math.sign(-3);      // -1
Math.round(2.5);    // 3      (half-away-from-zero for positive, half-toward-zero for negative)
Math.floor(2.9);    // 2
Math.ceil(2.1);     // 3
Math.trunc(-2.7);   // -2     (drop fractional part)

Math.min(3, 1, 4);  // 1
Math.max(3, 1, 4);  // 4
Math.pow(2, 10);    // 1024   (2 ** 10 is preferred)
Math.sqrt(16);      // 4
Math.cbrt(27);      // 3

Math.log(Math.E);   // 1
Math.log2(1024);    // 10
Math.log10(1000);   // 3

Math.sin(0); Math.cos(0); Math.tan(0); // trig functions take radians
```

## Random numbers

```javascript
Math.random();          // a float in [0, 1)
Math.floor(Math.random() * 6) + 1;  // dice roll: 1..6

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

`Math.random()` is **not cryptographically secure**. For passwords, tokens, or anything sensitive, use `crypto.getRandomValues()` (browser) or `crypto.randomInt()` (Node).

## BigInt for huge integers

```javascript
const big = 9007199254740993n;  // trailing `n` makes it a BigInt
big + 1n;                        // 9007199254740994n

typeof big;                      // "bigint"
```

You **cannot mix** BigInt and Number in arithmetic — convert explicitly:

```javascript
1n + 1;          // ❌ TypeError
1n + BigInt(1);  // 2n
Number(1n) + 1;  // 2
```

## Next step

We have numbers; now let's learn the other workhorse type: strings.
