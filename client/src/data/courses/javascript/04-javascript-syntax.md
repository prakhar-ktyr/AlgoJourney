---
title: JavaScript Syntax
---

# JavaScript Syntax

**Syntax** is the set of rules that decide what counts as valid JavaScript. You won't memorize them all today — you'll absorb them as you read code. This lesson is a guided tour of every piece of punctuation you'll see in the rest of the course.

## A complete tiny program

```javascript
// Compute and display the area of a circle.
const PI = 3.14159;
const radius = 5;
const area = PI * radius * radius;
console.log("Area:", area);
```

Five lines, six different syntactic ideas. Let's name them.

## Statements and semicolons

A **statement** is one complete instruction. Statements are separated by `;` (semicolons).

```javascript
let x = 1;
let y = 2;
let sum = x + y;
```

JavaScript has **automatic semicolon insertion (ASI)** — the engine will guess where missing semicolons go. It works most of the time, but it occasionally guesses wrong. **The safe rule: end every statement with `;`.** Tools like Prettier add them for you.

A line that starts with `[`, `(`, `/`, `+`, or `-` is the most common ASI trap:

```javascript
const a = 1
const b = 2
[a, b].forEach(console.log)   // Looks fine. It is not.
// Parsed as:  const b = 2[a, b].forEach(...)
```

## Identifiers (names)

Names for variables, functions, classes, etc. must:

- Start with a **letter**, `_`, or `$`.
- Continue with letters, digits, `_`, or `$`.
- **Not** be a reserved word (`for`, `class`, `return`, `await`, …).

JavaScript is **case-sensitive**: `total`, `Total`, and `TOTAL` are three different names.

The community conventions:

| Kind                | Convention      | Example          |
| ------------------- | --------------- | ---------------- |
| Variables, functions | `camelCase`     | `userName`       |
| Classes & constructors | `PascalCase`  | `UserAccount`    |
| Module-level constants | `UPPER_SNAKE` | `MAX_RETRIES`    |
| Private hint         | leading `_`     | `_internalCache` |

## Comments

```javascript
// Single-line comment
let n = 1; // also valid at the end of a line

/*
  Multi-line
  comment.
*/
```

JSDoc comments (`/** ... */`) are picked up by editors for autocomplete and type hints — we'll see them later.

## Blocks

Curly braces `{ }` group statements into a **block**. Blocks are used by `if`, `for`, `while`, functions, and classes.

```javascript
if (n > 0) {
  console.log("positive");
  console.log("first branch");
}
```

A block also creates a **scope** for `let` and `const` (more on that in the [Scope](javascript-scope) lesson).

## Whitespace

Spaces, tabs, and newlines are mostly free — JavaScript ignores them. The two exceptions:

```javascript
const greeting = "hi"; // OK
const greeting=
  "hi";                // OK, JS doesn't care about indentation

// But never split a return value onto a new line:
function bad() {
  return
    42;          // returns undefined! ASI ends the statement after `return`.
}
function good() {
  return 42;
}
```

## Expressions vs statements

An **expression** produces a value. A **statement** does something.

```javascript
1 + 2          // expression  → 3
"a".repeat(3)  // expression  → "aaa"

let x = 1 + 2; // statement (with an expression on the right)
if (x > 0) {}  // statement
```

Some statements have expression forms too — `function`, `class`, and assignment can all appear as expressions.

## Strict mode

Modern JavaScript runs every `class`, `module`, and most build-tool output in **strict mode** automatically. Strict mode bans silly silent bugs (like assigning to an undeclared variable). To opt a classic script in manually:

```javascript
"use strict";

x = 10; // ❌ ReferenceError: x is not defined
```

In this course every example is written for strict mode — assume it is on.

## A vocabulary cheat sheet

| Symbol     | Name                  | Used for                                |
| ---------- | --------------------- | --------------------------------------- |
| `;`        | semicolon             | end of a statement                      |
| `,`        | comma                 | separator in lists, parameters, objects |
| `.`        | dot                   | property access (`user.name`)           |
| `( )`      | parentheses           | function calls, grouping                |
| `[ ]`      | brackets              | arrays, indexing                        |
| `{ }`      | braces                | blocks, objects, destructuring          |
| `=>`       | arrow                 | arrow function                          |
| `...`      | spread / rest         | expand or collect values                |
| `` ` ` ``  | backticks             | template literals                       |
| `?.` `??`  | optional chain / nullish | safe access and defaults             |

If any of those look unfamiliar, that's fine — every one of them gets its own lesson later.

## Next step

Comments come next — the most overlooked piece of syntax. After that, we'll start writing real code with variables.
