---
title: JavaScript this
---

# JavaScript `this`

`this` is the most-misunderstood keyword in JavaScript. The good news: there are exactly **five** rules that decide what `this` refers to. Memorize them and the mystery disappears.

## The five rules

`this` is determined **by how the function is called**, not where it's defined (with one exception — arrow functions).

### Rule 1: Method call → the object before the dot

```javascript
const user = {
  name: "Ada",
  greet() {
    return `Hi, ${this.name}`;
  },
};

user.greet(); // "Hi, Ada"   — `this` is `user`
```

### Rule 2: Plain function call → `undefined` (strict) or global

```javascript
"use strict";
function show() {
  console.log(this);
}
show(); // undefined
```

In sloppy (non-strict) code `this` would be the global object (`window` in browsers). All modules, classes, and modern bundles run in strict mode, so `undefined` is the rule you should expect.

The classic foot-gun: pulling a method off an object loses the binding.

```javascript
const greet = user.greet;
greet(); // ❌ TypeError — `this` is undefined, can't read .name
```

### Rule 3: `new` → a brand-new object

When called with `new`, the function is a constructor. `this` is a fresh object that the function implicitly returns.

```javascript
function User(name) {
  this.name = name;
}
const u = new User("Ada");
u.name; // "Ada"
```

Arrow functions can't be called with `new` — they have no `this` of their own.

### Rule 4: Explicit binding with `call`, `apply`, `bind`

You can set `this` directly:

```javascript
function greet(greeting) {
  return `${greeting}, ${this.name}`;
}

greet.call({ name: "Ada" }, "Hi");      // "Hi, Ada"
greet.apply({ name: "Ada" }, ["Hello"]); // "Hello, Ada"

const boundGreet = greet.bind({ name: "Ada" });
boundGreet("Hey"); // "Hey, Ada"
```

`call` and `apply` invoke immediately — they differ only in how arguments are passed (list vs array). `bind` returns a new function with `this` permanently fixed.

### Rule 5: Arrow functions inherit `this` from where they were defined

This is the rule that "fixes" everything. Arrow functions don't have their own `this` — they look it up in the enclosing scope, just like any other variable.

```javascript
class Timer {
  constructor() {
    this.seconds = 0;
  }
  start() {
    setInterval(() => {
      this.seconds++;     // `this` = the Timer instance
    }, 1000);
  }
}
```

Replace the arrow with a regular function and `this` becomes `undefined` because `setInterval` calls it as a plain function.

## A worked example

```javascript
const user = {
  name: "Ada",
  greet() { return `Hi, ${this.name}`; },
};

const dog = { name: "Rex", greet: user.greet };

user.greet();              // "Hi, Ada"  — Rule 1
dog.greet();               // "Hi, Rex"  — Rule 1, different object
const fn = user.greet;
fn();                      // ❌ TypeError — Rule 2 (this is undefined)
fn.call({ name: "X" });    // "Hi, X"    — Rule 4
new user.greet();          // "Hi, undefined" — Rule 3 (this is a new {})
```

## Class methods

Class methods follow the same rules:

```javascript
class Counter {
  constructor() { this.count = 0; }
  inc() { this.count++; }
}

const c = new Counter();
c.inc();              // works — Rule 1
const inc = c.inc;
inc();                // ❌ TypeError — Rule 2 — `this` is undefined

// Fix 1: bind in the constructor
class CounterB {
  constructor() {
    this.count = 0;
    this.inc = this.inc.bind(this);
  }
  inc() { this.count++; }
}

// Fix 2: arrow class field — Rule 5
class CounterC {
  count = 0;
  inc = () => { this.count++; };
}
```

In React class components this used to be a daily nuisance — modern function components removed the problem.

## `this` in callbacks

Inside an array method or event handler, `this` is determined by how the engine calls your callback. Most array methods call your function as a plain function (Rule 2), so `this` is `undefined`. To carry context in, prefer arrow functions:

```javascript
class Tagger {
  prefix = "★ ";

  // ❌ Regular function — `this` is undefined
  tagBad(items) {
    return items.map(function (it) { return this.prefix + it; });
  }

  // ✅ Arrow function — captures `this` from tagOk
  tagOk(items) {
    return items.map((it) => this.prefix + it);
  }
}
```

`addEventListener` is the one common case that *does* call your callback with `this` set — to the element. Most modern code uses arrow handlers and reads the element from `event.currentTarget` instead.

## Strict mode matters

Without `"use strict"` (legacy scripts only), Rule 2 silently sets `this` to `window`/`globalThis`. That hid the bug for a decade. Modules and classes are strict by default — you should never rely on the loose behavior.

## A mental flowchart

When you see a `this` and aren't sure, ask in order:

1. Is it inside an **arrow function**? → look at the enclosing scope's `this`.
2. Was the function called with **`new`**? → the new object.
3. Was the function called via **`.call`/`.apply`/`.bind`**? → the explicit object.
4. Was the function called as **`obj.fn()`**? → `obj`.
5. Otherwise → `undefined` (strict) or global (sloppy).

That's it. Five rules, one question.

## Next step

Now that we understand `this`, classes are easy.
