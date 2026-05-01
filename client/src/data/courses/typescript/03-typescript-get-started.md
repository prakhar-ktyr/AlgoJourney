---
title: TypeScript Get Started
---

# TypeScript Get Started

Before you start writing TypeScript, you need to install it. Because the browser and Node.js only understand JavaScript, you must compile (transpile) your TypeScript code into JavaScript.

---

## Installing TypeScript

The easiest way to install TypeScript is globally via npm (Node Package Manager).

If you don't have npm installed, you need to download and install [Node.js](https://nodejs.org/) first.

Open your terminal and run:

```bash
npm install -g typescript
```

This installs the TypeScript compiler (`tsc`) globally on your system.

To verify that it's installed, check the version:

```bash
tsc -v
```

---

## Your First TypeScript File

1. Create a new file called `index.ts`. (Notice the `.ts` extension).
2. Add the following code to it:

```typescript
let message: string = "Hello, TypeScript!";
console.log(message);
```

---

## Compiling TypeScript

You cannot run `index.ts` directly in the browser or via Node (without extra tools). You must first compile it to JavaScript.

Run the compiler in your terminal:

```bash
tsc index.ts
```

If there are no errors, this command will create a new file named `index.js` in the same directory. The generated JavaScript will look like this:

```javascript
var message = "Hello, TypeScript!";
console.log(message);
```

You can now run the generated JavaScript file using Node:

```bash
node index.js
```

> [!TIP]
> **Watch Mode**: You can run the compiler in watch mode to automatically recompile your file whenever you save changes:
> `tsc index.ts --watch` or `tsc index.ts -w`

In the next lessons, we will explore the TypeScript syntax and how to define types.
