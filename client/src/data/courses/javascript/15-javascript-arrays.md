---
title: JavaScript Arrays
---

# JavaScript Arrays

An **array** is an ordered list of values, indexed from `0`. It is JavaScript's most-used data structure — and the engine has a long, fast list of methods for it.

## Creating arrays

```javascript
const empty = [];
const nums = [1, 2, 3];
const mixed = [1, "two", true, null, { a: 1 }];

const seven = new Array(7);          // length 7, all empty (rare; prefer literals)
const filled = new Array(3).fill(0); // [0, 0, 0]
const range = Array.from({ length: 5 }, (_, i) => i); // [0, 1, 2, 3, 4]
const fromIter = Array.from("abc");  // ["a", "b", "c"]
const fromArgs = Array.of(7);        // [7]   — unlike new Array(7)
```

## Indexing and length

```javascript
const fruits = ["apple", "banana", "cherry"];

fruits[0];             // "apple"
fruits[fruits.length - 1]; // "cherry"
fruits.at(-1);         // "cherry"   — modern, supports negatives

fruits.length;         // 3
fruits.length = 2;     // truncates: ["apple", "banana"]
fruits[10] = "x";      // length jumps to 11; gaps are "empty slots"
```

JavaScript arrays are **sparse** — assigning to a high index creates holes. Methods like `forEach` skip them; `for…of` does not. Avoid creating sparse arrays.

## Adding and removing

```javascript
const a = ["b", "c"];

a.push("d");        // ["b", "c", "d"]   — add to end
a.pop();            // ["b", "c"]        — remove from end (returns "d")

a.unshift("a");     // ["a", "b", "c"]   — add to start
a.shift();          // ["b", "c"]        — remove from start (returns "a")

a.splice(1, 1);     // remove 1 item at index 1 → ["b"]
a.splice(1, 0, "x", "y"); // insert without removing → ["b", "x", "y"]
```

`splice` mutates and returns the removed elements. `slice` does **not** mutate:

```javascript
const arr = [1, 2, 3, 4, 5];
arr.slice(1, 4);   // [2, 3, 4]
arr.slice(-2);     // [4, 5]
// arr is still [1, 2, 3, 4, 5]
```

## Iterating

```javascript
const a = ["a", "b", "c"];

// Classic
for (let i = 0; i < a.length; i++) console.log(a[i]);

// Modern, idiomatic
for (const x of a) console.log(x);

// With index
for (const [i, x] of a.entries()) console.log(i, x);

// forEach — fine, but cannot be `break`-ed and ignores the return value
a.forEach((x, i) => console.log(i, x));
```

Use `for…of` by default. Use `forEach` when you've already chained from another method.

## The five core functional methods

These return a **new array** (immutable) and are the heart of modern JS:

```javascript
const nums = [1, 2, 3, 4, 5];

nums.map((n) => n * n);           // [1, 4, 9, 16, 25]
nums.filter((n) => n % 2 === 0);  // [2, 4]
nums.reduce((sum, n) => sum + n, 0); // 15
nums.find((n) => n > 3);          // 4   (or undefined)
nums.findIndex((n) => n > 3);     // 3   (or -1)
nums.some((n) => n > 4);          // true   — at least one
nums.every((n) => n > 0);         // true   — all of them
```

A real-world chain:

```javascript
const orders = [
  { id: 1, total: 50, status: "paid" },
  { id: 2, total: 30, status: "pending" },
  { id: 3, total: 80, status: "paid" },
];

const paidTotal = orders
  .filter((o) => o.status === "paid")
  .map((o) => o.total)
  .reduce((sum, t) => sum + t, 0);   // 130
```

## Searching

```javascript
const a = [10, 20, 30, 20];

a.indexOf(20);       // 1
a.lastIndexOf(20);   // 3
a.includes(20);      // true
a.includes(99);      // false
```

For complex matches, use `find` / `findIndex`:

```javascript
users.find((u) => u.email === target);
```

## Sorting

`sort` mutates in place and converts each element to a string by default:

```javascript
[10, 2, 30].sort();              // [10, 2, 30] → sorted as strings: [10, 2, 30]
[10, 2, 30].sort((a, b) => a - b); // [2, 10, 30]   ← numeric ascending
[10, 2, 30].sort((a, b) => b - a); // [30, 10, 2]   ← descending

users.sort((a, b) => a.name.localeCompare(b.name)); // alphabetical
```

For an immutable sort, use `toSorted` (ES2023) or `[...arr].sort(…)`:

```javascript
const original = [3, 1, 2];
const sorted = original.toSorted((a, b) => a - b);
// original: [3, 1, 2], sorted: [1, 2, 3]
```

## Reversing, flattening

```javascript
[1, 2, 3].reverse();     // [3, 2, 1]   (mutates)
[1, 2, 3].toReversed();  // [3, 2, 1]   (immutable, ES2023)

[[1, 2], [3, 4]].flat();          // [1, 2, 3, 4]
[1, [2, [3, [4]]]].flat(Infinity); // [1, 2, 3, 4]

[1, 2, 3].flatMap((n) => [n, n * 10]); // [1, 10, 2, 20, 3, 30]
```

## Joining and splitting

```javascript
["a", "b", "c"].join("-");  // "a-b-c"
"a-b-c".split("-");          // ["a", "b", "c"]
```

## Concatenating

```javascript
const a = [1, 2];
const b = [3, 4];

[...a, ...b];        // [1, 2, 3, 4]   — preferred
a.concat(b);         // [1, 2, 3, 4]
a.concat(5, [6, 7]); // [1, 2, 5, 6, 7]
```

## Copying

```javascript
const a = [1, 2, 3];

const shallow1 = [...a];          // preferred
const shallow2 = a.slice();
const shallow3 = Array.from(a);

shallow1[0] = 99;  // a is unchanged
```

For nested arrays, `[...a]` only copies the outer level. Use `structuredClone` for a deep copy:

```javascript
const deep = structuredClone(complexArray);
```

## Checking if something is an array

```javascript
Array.isArray([]);          // true
Array.isArray("abc");       // false
typeof [];                  // "object"   — unhelpful
```

## A quick reference: mutating vs not

| Mutates           | Returns new                |
| ----------------- | -------------------------- |
| `push` `pop`      | `slice`                    |
| `shift` `unshift` | `concat`                   |
| `splice`          | `map` `filter` `flat`      |
| `sort` `reverse`  | `toSorted` `toReversed`    |
| `fill` `copyWithin` | `with` (replace at index) |

Knowing which is which avoids 80% of "why did my array change?" bugs.

## Next step

Arrays are ordered lists. For everything else there are objects.
