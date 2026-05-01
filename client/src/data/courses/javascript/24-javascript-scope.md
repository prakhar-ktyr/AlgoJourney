---
title: JavaScript Scope
---

# JavaScript Scope

**Scope** decides *which variables a piece of code can see*. JavaScript has three scopes you should know — global, function, and block — and one historical foot-gun (`var`).

## Global scope

A variable declared outside any function or block lives in the **global scope**. In a browser, globals live on `window`; in Node, they live on `globalThis`.

```javascript
// at the top of a file (non-module)
var version = "1.0";   // window.version === "1.0"
let port    = 3000;    // NOT on window (let/const are not globals)
const API   = "/api";

function whatVersion() {
  return version;      // sees the global
}
```

**Inside an ES module**, `var`/`let`/`const` at the top level are **not** added to `window` — they stay module-scoped. We cover modules in their own lesson.

The fewer globals, the better. Treat the global namespace as polluted unless you're writing a tiny script.

## Function scope

Every function creates a new scope. Variables inside a function are invisible outside it.

```javascript
function outer() {
  const secret = 42;
  function inner() {
    console.log(secret); // 42 — inner can see outer's variables
  }
  inner();
}

outer();
console.log(secret); // ❌ ReferenceError
```

## Block scope

`let` and `const` are confined to the nearest `{ … }` block — `if`, `for`, `while`, `try`, or just a bare block.

```javascript
{
  const x = 1;
  console.log(x); // 1
}
console.log(x); // ❌ ReferenceError
```

```javascript
for (let i = 0; i < 3; i++) {
  // i is scoped to this iteration of the loop
}
console.log(i); // ❌ ReferenceError
```

This is what `var` doesn't do — `var` is **function-scoped**, even when written inside a block:

```javascript
for (var j = 0; j < 3; j++) {}
console.log(j); // 3 — leaks
```

That's one more reason to default to `const`/`let`.

## The scope chain

When you read a variable, JavaScript looks in the current scope; if it's not there, it looks in the enclosing scope; and so on, up to the global scope.

```javascript
const a = "global";

function outer() {
  const b = "outer";
  function inner() {
    const c = "inner";
    console.log(a, b, c); // global outer inner
  }
  inner();
}
outer();
```

Reading goes outward. Writing modifies the closest binding it finds.

## Hoisting

The engine does a quick first pass through the code to register declarations. The behavior depends on the kind:

| Declared with                | Hoisted? | Initialized to                                       |
| ---------------------------- | -------- | ---------------------------------------------------- |
| `var x`                      | yes      | `undefined`                                          |
| `let x` / `const x`          | yes      | **uninitialized** (TDZ) — reading throws             |
| `function f() {}`            | yes      | the function itself (you can call it before declaration) |
| `class C {}`                 | yes      | uninitialized (TDZ)                                  |

```javascript
console.log(a); // undefined
var a = 1;

console.log(b); // ❌ ReferenceError (TDZ)
let b = 1;

f(); // works
function f() { return 1; }

g(); // ❌ TypeError
const g = function () { return 1; };
```

The temporal dead zone is a feature: it stops you from accidentally using a variable before you intentionally declared it.

## Shadowing

A nested scope can re-declare a name from an outer scope. The inner declaration **shadows** the outer one — the outer variable is unaffected:

```javascript
const x = "outer";
function f() {
  const x = "inner";
  console.log(x); // "inner"
}
f();
console.log(x);   // "outer"
```

Shadowing is sometimes useful but more often a sign of confusing names. Linters can warn.

## Closures (preview)

Because inner functions can see outer variables, they can also remember them after the outer function returns. That's a **closure** — important enough to get its own lesson next.

```javascript
function makeCounter() {
  let count = 0;
  return () => ++count;
}

const next = makeCounter();
next(); // 1
next(); // 2
```

`count` lives on, captured by the returned arrow function.

## A common pitfall: `var` in a loop

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 3 3 3   — all callbacks share the one `i`

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 0 1 2   — each iteration gets its own `i`
```

This is the textbook example of why `let` was added.

## Module scope

A `.js` file loaded as a module (with `<script type="module">` or `import`) has its own top-level scope. Top-level `let`, `const`, `var`, and `function` are private to the file unless you `export` them.

```javascript
// utils.js
const SECRET = "shh";              // private
export function greet() { ... }    // public
```

We cover modules properly later — for now, just know that "global" inside a module is really "module-level".

## Practical advice

- Default to `const`. Use `let` only when you reassign.
- Never use `var` in new code.
- Keep variables as **narrowly scoped** as possible — declare them next to where they're used.
- Avoid leaking globals: in a browser script, wrap top-level code in a module or an IIFE.
- Use linters (ESLint's `no-shadow`, `no-undef`, `prefer-const`) to catch the common mistakes for you.

## Next step

Closures — the most-asked JavaScript interview topic — fall directly out of how scope works.
