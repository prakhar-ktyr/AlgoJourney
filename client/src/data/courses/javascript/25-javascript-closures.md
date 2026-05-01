---
title: JavaScript Closures
---

# JavaScript Closures

A **closure** is a function that **remembers the variables of the scope it was created in**, even after that scope has finished running. Closures are not a feature you opt into — every JavaScript function is a closure. Once you see a few examples, the concept clicks.

## The minimal example

```javascript
function makeCounter() {
  let count = 0;
  return function () {
    return ++count;
  };
}

const next = makeCounter();
next(); // 1
next(); // 2
next(); // 3
```

`makeCounter` ran *once* and returned. Yet `count` is still alive — the inner function is keeping it captive. That captive reference is the closure.

Each call to `makeCounter` creates a fresh `count`:

```javascript
const a = makeCounter();
const b = makeCounter();
a(); a(); a(); // 1, 2, 3
b();           // 1   — independent from a
```

## Why this works

When JavaScript executes a function, it creates an environment record holding the function's variables. If anything (a returned function, an event listener, a `setTimeout`) still has a reference to that record after the function returns, the record cannot be garbage-collected. The references persist, and the function can read and write them next time it runs.

## Practical uses

### 1. Private state

Closures let you simulate private data without classes:

```javascript
function createAccount(initial) {
  let balance = initial;
  return {
    deposit(n) { balance += n; },
    withdraw(n) {
      if (n > balance) throw new Error("insufficient funds");
      balance -= n;
    },
    balance() { return balance; },
  };
}

const acct = createAccount(100);
acct.deposit(50);
acct.balance();   // 150
acct.balance = 1_000_000;  // doesn't matter — closure variable is unaffected
```

`balance` exists nowhere outside the methods. There is no way to tamper with it from the outside.

### 2. Event handlers and callbacks

Every callback you attach captures variables from where it was defined:

```javascript
function setupButton(label, action) {
  const button = document.createElement("button");
  button.textContent = label;
  button.addEventListener("click", () => {
    console.log(`Clicked ${label}`);
    action();
  });
  return button;
}
```

The click handler closes over `label` and `action` — they're alive forever (or until the button is removed).

### 3. Curried/partially applied functions

```javascript
function multiplier(factor) {
  return (n) => n * factor;
}

const double = multiplier(2);
const triple = multiplier(3);

double(5); // 10
triple(5); // 15
```

`factor` is captured by each returned function and never changes.

### 4. Once-only functions

```javascript
function once(fn) {
  let done = false;
  let result;
  return (...args) => {
    if (done) return result;
    done = true;
    return (result = fn(...args));
  };
}

const init = once(() => console.log("initialized"));
init(); // logs
init(); // does nothing
```

### 5. Memoization

```javascript
function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}

const slowSquare = (n) => { /* expensive */ return n * n; };
const fastSquare = memoize(slowSquare);
```

The `cache` lives across calls because `fastSquare` keeps a closure over it.

## The classic loop pitfall

A frequent interview question: "What does this print?"

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 3 3 3
```

`var` is function-scoped, so all three callbacks share **one** `i`. By the time the timers fire, the loop has finished and `i === 3`.

Switch to `let` and each iteration gets its own binding:

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 0 1 2
```

Pre-`let`, the workaround was an IIFE:

```javascript
for (var i = 0; i < 3; i++) {
  (function (i) {
    setTimeout(() => console.log(i), 0);
  })(i);
}
```

That's exactly what `let` does for you automatically.

## Closures and memory

A closure keeps its captured variables alive. If you keep a closure around forever, you keep its variables alive forever:

```javascript
function attach() {
  const huge = new Array(1_000_000).fill("x");
  return () => huge.length; // captures `huge`!
}

const handler = attach();   // huge is alive as long as `handler` is alive
```

Modern engines are smart — they only retain variables the inner function actually uses. But if you do reference a large object, expect it to stay in memory.

## Closures vs `this`

`this` is **not** captured by closure for regular functions — it's set per call. Arrow functions are different: they capture `this` from their enclosing scope, just like any other variable.

```javascript
function Counter() {
  this.count = 0;
  setInterval(() => this.count++, 1000); // arrow → captures `this`
}
```

This is the most common way you'll use a closure: an arrow function inside a method.

## A mental model

Whenever you see a function returned, passed as a callback, or stored in a variable, ask: **"What variables does it close over?"** The answers explain virtually every "but I didn't change that!" bug in JavaScript.

## Next step

Closures explain how functions remember variables. Now we tackle the other thing functions track: `this`.
