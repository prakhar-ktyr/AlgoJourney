---
title: Node.js REPL
---

# Node.js REPL

The **REPL** stands for **R**ead, **E**valuate, **P**rint, **L**oop. It is an interactive shell where you type JavaScript one expression at a time and immediately see the result. It's perfect for experimenting, debugging, and learning.

## Starting the REPL

Open your terminal and type:

```bash
node
```

You will see a `>` prompt. You are now inside the Node.js REPL:

```
Welcome to Node.js v20.11.0.
Type ".help" for more information.
>
```

## Basic usage

Type any JavaScript expression and press Enter:

```
> 2 + 3
5
> "hello".toUpperCase()
'HELLO'
> Math.random()
0.7234567890123456
> [1, 2, 3].map(n => n * 2)
[ 2, 4, 6 ]
```

The REPL **prints the return value** of every expression. This is different from a script file, where you need `console.log` to see output.

## Variables and state

Variables persist for the duration of the session:

```
> const name = "Alice"
undefined
> const age = 30
undefined
> `${name} is ${age}`
'Alice is 30'
```

Note: `const` and `let` declarations return `undefined` because declarations don't produce a value.

## The underscore `_` variable

The special `_` variable holds the result of the last expression:

```
> 2 + 3
5
> _ * 10
50
> `The answer is ${_}`
'The answer is 50'
```

## Multi-line expressions

The REPL detects incomplete expressions and lets you continue on the next line. It shows `...` to indicate it is waiting for more input:

```
> function greet(name) {
...   return `Hello, ${name}!`;
... }
undefined
> greet("World")
'Hello, World!'
```

This works for objects, arrays, if statements, loops, and any multi-line construct:

```
> const person = {
...   name: "Alice",
...   age: 30,
...   greet() {
...     return `Hi, I'm ${this.name}`;
...   }
... }
undefined
> person.greet()
"Hi, I'm Alice"
```

## Tab completion

Press **Tab** to auto-complete:

- Type `Math.` then press Tab — you will see all `Math` methods.
- Type `console.` then press Tab — you will see `log`, `error`, `warn`, etc.
- Type a variable name partially and press Tab — it auto-completes if there is one match, or shows options if there are multiple.

```
> Math.    [Tab]
Math.E         Math.PI        Math.abs       Math.acos      ...
> Math.sq  [Tab]
Math.sqrt
```

## Dot commands

The REPL has special commands that start with a dot:

| Command | Description |
|---|---|
| `.help` | Show all dot commands |
| `.exit` | Exit the REPL (same as Ctrl+D) |
| `.break` | Abandon the current multi-line expression |
| `.clear` | Reset the REPL context (clears all variables) |
| `.save filename` | Save the current session to a file |
| `.load filename` | Load and execute a JavaScript file |
| `.editor` | Enter editor mode (multi-line editing) |

### Editor mode

`.editor` opens a mini editor where you can type or paste multiple lines. Press **Ctrl+D** to execute, or **Ctrl+C** to cancel:

```
> .editor
// Entering editor mode (Ctrl+D to finish, Ctrl+C to cancel)
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
factorial(5);
// Ctrl+D
120
```

### Save and load

```
> const x = 42
undefined
> const y = x * 2
undefined
> .save session.js
Session saved to: session.js
```

Later, you can load it back:

```
> .load session.js
> const x = 42
undefined
> const y = x * 2
undefined
> y
84
```

## Requiring modules

You can use `require()` in the REPL to load modules:

```
> const fs = require("fs")
undefined
> fs.readdirSync(".")
[ 'app.js', 'package.json', 'node_modules' ]
> const os = require("os")
undefined
> os.hostname()
'my-laptop'
```

## Useful REPL experiments

### Exploring objects

```
> Object.keys({a: 1, b: 2, c: 3})
[ 'a', 'b', 'c' ]
> Object.entries({a: 1, b: 2})
[ [ 'a', 1 ], [ 'b', 2 ] ]
```

### Testing regular expressions

```
> /\d+/.test("abc123")
true
> "2024-01-15".match(/(\d{4})-(\d{2})-(\d{2})/)
[ '2024-01-15', '2024', '01', '15', ... ]
```

### Quick JSON formatting

```
> JSON.stringify({name: "Alice", age: 30}, null, 2)
'{\n  "name": "Alice",\n  "age": 30\n}'
```

### Checking built-in globals

```
> global
<ref *1> Object [global] { ... }
> globalThis === global
true
```

## Exiting the REPL

Three ways:

1. Type `.exit`
2. Press **Ctrl+D**
3. Press **Ctrl+C** twice

## REPL vs script files

| Feature | REPL | Script file |
|---|---|---|
| Auto-prints return values | Yes | No (need `console.log`) |
| Persists across sessions | No | Yes (saved to disk) |
| Good for | Experimenting, debugging | Real programs |
| Multi-line | Supported but awkward | Natural |
| `_` variable | Last result | Not available |

Use the REPL for quick tests and exploration. Use script files for anything you want to keep.

## Tip: Use the REPL as a calculator

The REPL is a great calculator:

```
> 1024 * 1024 * 1024    // 1 GB in bytes
1073741824
> (19.99 * 3) * 1.08    // 3 items with 8% tax
64.7676
> 0.1 + 0.2             // the classic floating-point surprise
0.30000000000000004
```
