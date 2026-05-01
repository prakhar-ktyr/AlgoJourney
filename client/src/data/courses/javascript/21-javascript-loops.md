---
title: JavaScript Loops
---

# JavaScript Loops

JavaScript has **six** ways to loop. Knowing which to reach for is the difference between a one-liner and a tangle.

| Form          | When to use                                     |
| ------------- | ----------------------------------------------- |
| `for`         | Counted loops; you need the index               |
| `while`       | Run until a condition becomes false             |
| `do … while`  | Run at least once, then check                   |
| `for … of`    | Iterate values of any iterable (default choice) |
| `for … in`    | Iterate string keys of an object (rare)         |
| Array methods | `forEach` / `map` / `filter` / `reduce` (often best) |

## `for`

```javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}
// 0 1 2 3 4
```

Three parts: **initializer**, **condition**, **update**. Any can be empty.

```javascript
for (;;) {
  // infinite loop — needs a `break`
}
```

## `while`

```javascript
let n = 1;
while (n < 1000) {
  n *= 2;
}
console.log(n); // 1024
```

Use when the count isn't known up front (e.g. polling, parsing, retry-until-success).

## `do … while`

Always runs the body **once** before checking:

```javascript
let answer;
do {
  answer = prompt("Pick a number 1-10");
} while (Number(answer) < 1 || Number(answer) > 10);
```

Rare. Most teams write a `while (true) { … if (done) break; }` instead.

## `for … of` — the modern default

Iterates the **values** of any iterable: arrays, strings, `Map`, `Set`, `NodeList`, generators, even `arguments`.

```javascript
for (const x of [10, 20, 30]) console.log(x);
for (const ch of "hi") console.log(ch);             // "h", "i"
for (const [key, value] of Object.entries(obj))     // destructure
  console.log(key, value);
for (const [key, value] of new Map([["a", 1]]))
  console.log(key, value);
```

To get the index, use `entries()`:

```javascript
for (const [i, x] of ["a", "b", "c"].entries()) {
  console.log(i, x);
}
```

`for…of` is the default loop in modern JavaScript.

## `for … in` — usually not what you want

Walks **string keys** of an object, including inherited ones.

```javascript
const obj = { a: 1, b: 2 };
for (const key in obj) {
  console.log(key, obj[key]);
}
```

Two problems:

1. It walks the prototype chain — extra keys can appear.
2. On arrays it gives string indexes (`"0"`, `"1"`) and skips holes inconsistently.

Prefer `Object.keys` / `Object.entries` for objects and `for…of` for arrays.

```javascript
for (const key of Object.keys(obj)) { ... }
for (const [key, value] of Object.entries(obj)) { ... }
```

## Array methods

For most array work, a method beats a manual loop:

```javascript
const nums = [1, 2, 3, 4];

nums.forEach((n) => console.log(n));
nums.map((n) => n * 2);              // [2, 4, 6, 8]
nums.filter((n) => n > 2);           // [3, 4]
nums.reduce((s, n) => s + n, 0);     // 10
nums.find((n) => n > 2);             // 3
nums.some((n) => n > 3);             // true
nums.every((n) => n > 0);            // true
```

Use `for…of` when you need to `break`, `continue`, or `await`. Use methods for data transformations.

## `break` and `continue`

```javascript
for (const x of items) {
  if (x === target) {
    found = x;
    break;        // exit the loop entirely
  }
}

for (const x of items) {
  if (skip(x)) continue;  // skip to the next iteration
  process(x);
}
```

Both work in `for`, `while`, `do…while`, and `for…of`. They do **not** work in `forEach`/`map`/etc. — those are method calls, not loops.

## Labeled breaks

To break out of nested loops in one shot, label the outer one:

```javascript
outer: for (let i = 0; i < grid.length; i++) {
  for (let j = 0; j < grid[i].length; j++) {
    if (grid[i][j] === target) {
      console.log("found at", i, j);
      break outer;
    }
  }
}
```

Useful but rare. Often it's cleaner to extract the inner loop into a function and `return`.

## Looping with `await`

A `for…of` loop with `await` runs sequentially:

```javascript
for (const id of ids) {
  await fetchOne(id);   // one at a time
}
```

For parallel work, fire all promises and `await Promise.all`:

```javascript
const results = await Promise.all(ids.map(fetchOne));
```

`forEach` does **not** await — its callback is called and ignored:

```javascript
ids.forEach(async (id) => await fetchOne(id)); // ❌ doesn't wait
```

Use `for…of` whenever `await` is in play.

## Infinite loops

```javascript
while (true) {
  const job = queue.pop();
  if (!job) break;
  job();
}
```

A clean way to write "process until done." Always have an exit condition.

## Performance notes

Modern engines (V8, SpiderMonkey, JavaScriptCore) optimize all loop forms heavily. Pick the one that's clearest, not the one you think is fastest. The exception: in extremely hot numeric loops, a classic `for (let i = 0; i < n; i++)` can be measurably faster than `for…of`.

## A real example

```javascript
const orders = await fetchOrders();

let revenue = 0;
const overdue = [];

for (const o of orders) {
  if (o.status !== "paid") continue;
  revenue += o.total;
  if (o.dueDate < Date.now()) overdue.push(o.id);
}

console.log({ revenue, overdue });
```

You could write this with `filter` + `reduce`, but the loop is fine — sometimes one explicit pass is clearer than a chain.

## Next step

We've controlled flow with conditionals and loops. Time to package logic into reusable units: functions.
