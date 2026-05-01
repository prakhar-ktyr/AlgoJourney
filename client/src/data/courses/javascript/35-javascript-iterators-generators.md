---
title: JavaScript Iterators and Generators
---

# JavaScript Iterators and Generators

JavaScript has a small, powerful protocol for "things you can iterate over". Once you learn it, you can plug your own data into `for…of`, spread, destructuring, and `Array.from`.

## The iterable protocol

An object is **iterable** if it has a method at the well-known symbol `Symbol.iterator` that returns an **iterator** — an object with a `next()` method that returns `{ value, done }`:

```javascript
const numbers = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        if (i < 3) return { value: i++, done: false };
        return { value: undefined, done: true };
      },
    };
  },
};

for (const n of numbers) console.log(n); // 0, 1, 2
[...numbers];                            // [0, 1, 2]
```

Built-ins that are already iterable: `Array`, `String`, `Map`, `Set`, `arguments`, `NodeList`, `TypedArray`, generators, and many others.

## Generators — the easy way to make iterators

Writing iterators by hand is verbose. **Generator functions** (`function*`) build them for you. Inside a generator, `yield` produces a value and pauses execution; the next `next()` call resumes.

```javascript
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) yield i;
}

[...range(0, 5)];          // [0, 1, 2, 3, 4]
for (const n of range(0, 10, 2)) console.log(n); // 0, 2, 4, 6, 8
```

The `*` makes it a generator. Calling it returns a *generator object* (which is both an iterator and iterable):

```javascript
const g = range(0, 3);
g.next(); // { value: 0, done: false }
g.next(); // { value: 1, done: false }
g.next(); // { value: 2, done: false }
g.next(); // { value: undefined, done: true }
```

## Lazy evaluation

Generators produce values on demand. That makes infinite sequences trivial:

```javascript
function* naturals() {
  let n = 1;
  while (true) yield n++;
}

const it = naturals();
it.next().value; // 1
it.next().value; // 2
// ... forever
```

Combine with helper utilities:

```javascript
function* take(iter, n) {
  for (const x of iter) {
    if (n-- <= 0) return;
    yield x;
  }
}

[...take(naturals(), 5)]; // [1, 2, 3, 4, 5]
```

This is how libraries like `iter-tools` or RxJS feel — pipelines of lazy operators.

## `yield*` — delegate to another iterable

```javascript
function* abc() { yield "a"; yield "b"; yield "c"; }
function* both() {
  yield* abc();
  yield* [1, 2, 3];
}
[...both()]; // ["a", "b", "c", 1, 2, 3]
```

Useful for composing generators or recursing over trees:

```javascript
function* walk(node) {
  yield node.value;
  for (const child of node.children) yield* walk(child);
}
```

## Returning early

A generator finishes when it `return`s or runs off the end. The returned value becomes `{ value: theReturn, done: true }`:

```javascript
function* g() {
  yield 1;
  return "done";
  yield 2; // unreachable
}

const it = g();
it.next(); // { value: 1, done: false }
it.next(); // { value: "done", done: true }
it.next(); // { value: undefined, done: true }
```

You can stop a consumer early with `it.return(value)`.

## Two-way communication

`yield` is also an *expression* — its value is whatever the consumer passes to `next(arg)`. This enables coroutine-style code, but is rare in app code.

```javascript
function* echo() {
  while (true) {
    const got = yield;       // pauses here
    console.log("received:", got);
  }
}

const e = echo();
e.next();           // start (advance to first yield)
e.next("hello");    // logs "received: hello"
```

## Async iterators and `for await…of`

For asynchronous streams (paginated APIs, file lines, message queues), use **async generators** with `async function*`:

```javascript
async function* fetchPages(url) {
  let next = url;
  while (next) {
    const page = await fetch(next).then((r) => r.json());
    yield* page.items;
    next = page.nextUrl;
  }
}

for await (const item of fetchPages("/api/users?page=1")) {
  console.log(item);
}
```

`for await…of` works with anything that has a `Symbol.asyncIterator` method. Node streams, the WHATWG `ReadableStream`, and many database drivers expose this protocol.

## Real-world wins

```javascript
// Custom iterable: a 2D grid that yields cells
class Grid {
  constructor(rows, cols) { this.rows = rows; this.cols = cols; }
  *[Symbol.iterator]() {
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        yield { r, c };
  }
}

for (const { r, c } of new Grid(3, 3)) {
  // visits all 9 cells
}

// Chunk an array
function* chunk(arr, size) {
  for (let i = 0; i < arr.length; i += size) yield arr.slice(i, i + size);
}
[...chunk([1,2,3,4,5,6,7], 3)]; // [[1,2,3],[4,5,6],[7]]

// Tree traversal without recursion overhead
function* inOrder(node) {
  if (!node) return;
  yield* inOrder(node.left);
  yield node.value;
  yield* inOrder(node.right);
}
```

## When to reach for generators

- You need a **lazy** sequence (potentially infinite).
- You're walking a **tree or graph** and want to consume one item at a time.
- You want to **pause and resume** an algorithm naturally.
- You're producing data **incrementally** (parsers, tokenizers, simulations).

For everyday work, array methods are still simpler. Reach for generators when laziness or incremental production buys you something.

## Next step

Iterators handle synchronous sequences. For one-shot async results, the answer is promises.
