---
title: JavaScript Type Conversion
---

# JavaScript Type Conversion

JavaScript constantly converts values between types — sometimes because you asked, sometimes silently behind your back. Knowing both kinds is the difference between writing reliable code and chasing weekend bugs.

## Explicit conversion (you ask)

### To string

```javascript
String(42);            // "42"
String(true);          // "true"
String(null);          // "null"
String(undefined);     // "undefined"
String([1, 2, 3]);     // "1,2,3"
String({ a: 1 });      // "[object Object]"

(42).toString();       // "42"
(255).toString(16);    // "ff"
(0.1 + 0.2).toFixed(2); // "0.30"

`${value}`;            // template literal — also coerces to string
```

### To number

```javascript
Number("42");         // 42
Number("42.5");       // 42.5
Number("");           // 0           ← surprise
Number("  3  ");      // 3           ← whitespace trimmed
Number("0x10");       // 16
Number("1e3");        // 1000
Number("12abc");      // NaN
Number(true);         // 1
Number(false);        // 0
Number(null);         // 0           ← surprise
Number(undefined);    // NaN
Number([]);           // 0           ← surprise
Number([42]);         // 42
Number([1, 2]);       // NaN
Number({});           // NaN

parseInt("12abc");    // 12          ← stops at first non-digit
parseInt("0xff", 16); // 255
parseFloat("3.14abc");// 3.14

+"42";                // 42          ← unary plus
+"";                  // 0
+"abc";               // NaN
```

### To boolean

```javascript
Boolean(0);          // false
Boolean(1);          // true
Boolean("");         // false
Boolean("hi");       // true
Boolean(null);       // false
Boolean(undefined);  // false
Boolean(NaN);        // false
Boolean([]);         // true
Boolean({});         // true

!!value;             // double negation — same as Boolean(value)
```

The full falsy list is `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Everything else is truthy.

## Implicit conversion (the engine asks)

JavaScript converts values when you mix types. This is **coercion** — the source of nearly every "wat" moment in the language.

### `+` is overloaded

If either operand is a string, `+` concatenates. Otherwise it adds.

```javascript
1 + 2;        // 3
"1" + 2;      // "12"
1 + "2";      // "12"
1 + 2 + "3";  // "33"   — left-to-right: (1+2) + "3"
"1" + 2 + 3;  // "123"  — once it's a string, it stays one
```

### `-`, `*`, `/`, `%`, `**` always coerce to number

```javascript
"10" - 1;    // 9
"10" * "2";  // 20
"abc" - 1;   // NaN
[] - 0;      // 0
{} - 0;      // NaN  — depending on the parser, sometimes 0
```

### Comparisons coerce

```javascript
"5" < 10;     // true   — string becomes number
"5" < "10";   // false  — both strings, lexicographic
[1] == 1;     // true   — array → "1" → 1
[] == false;  // true   — both → 0
null == undefined; // true   — special case
null == 0;    // false  — null only equals null/undefined under ==
NaN == NaN;   // false
```

### Avoid `==`; use `===`

`==` runs an elaborate coercion algorithm. `===` does not — it just checks type and value. Use `===` everywhere.

The single legitimate use of `==` is `value == null`, which is true only for `null` and `undefined`:

```javascript
if (value == null) {
  // covers both null and undefined
}
```

Even that is increasingly written as `value === null || value === undefined`.

## Object → primitive

When an object meets a primitive operator, it is converted via:

1. `Symbol.toPrimitive` (rarely defined)
2. `valueOf()` (returns a number for `Date`, etc.)
3. `toString()`

```javascript
const a = { toString: () => "hello" };
"" + a;          // "hello"

const b = { valueOf: () => 10 };
b * 2;           // 20

const date = new Date(2025, 0, 1);
date - 0;        // milliseconds since epoch (number context)
`${date}`;       // "Wed Jan 01 2025 ..." (string context)
```

The default `toString` of a plain object is the unhelpful `"[object Object]"` — which is why logging objects with `+` looks broken.

## Common conversion patterns

```javascript
// Number from input field
const n = Number(input.value);
if (!Number.isFinite(n)) throw new Error("not a number");

// Integer
const i = parseInt(input, 10);    // always pass radix 10!

// String from anything
const s = String(value);          // safer than value.toString() — works with null/undefined

// Boolean from "yes"/"no"/"1"/"0"
const yes = ["yes", "true", "1", "on"].includes(value.toLowerCase());

// Null-safe to number, falling back to 0
const count = Number(value) || 0;       // careful: also overrides legitimate 0
const count2 = Number(value ?? 0);      // preserves 0 properly
```

## Truth table cheat sheet

| Value         | `String`        | `Number` | `Boolean` |
| ------------- | --------------- | -------- | --------- |
| `false`       | `"false"`       | `0`      | `false`   |
| `true`        | `"true"`        | `1`      | `true`    |
| `0`           | `"0"`           | `0`      | `false`   |
| `1`           | `"1"`           | `1`      | `true`    |
| `""`          | `""`            | `0`      | `false`   |
| `"hi"`        | `"hi"`          | `NaN`    | `true`    |
| `"7"`         | `"7"`           | `7`      | `true`    |
| `null`        | `"null"`        | `0`      | `false`   |
| `undefined`   | `"undefined"`   | `NaN`    | `false`   |
| `[]`          | `""`            | `0`      | `true`    |
| `[7]`         | `"7"`           | `7`      | `true`    |
| `[1,2]`       | `"1,2"`         | `NaN`    | `true`    |
| `{}`          | `"[object Object]"` | `NaN`| `true`    |

Print this. Re-read it whenever a comparison surprises you.

## Next step

Coercion is bound up with equality, which has its own infamous reputation. Time to confront `==` vs `===` head-on.
