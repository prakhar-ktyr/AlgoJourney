---
title: TypeScript Declaration Files
---

# TypeScript Declaration Files (.d.ts)

A declaration file provides type information to TypeScript about an API that's written in JavaScript.

They end with the `.d.ts` extension.

---

## Why Do We Need Them?

TypeScript is strictly typed, but most JavaScript libraries (like Lodash, jQuery, or older React packages) are not written in TypeScript.

When you import a JavaScript library into a TypeScript file, the compiler doesn't know what functions or variables are available, what arguments they take, or what they return.

Declaration files solve this by acting as a "translation layer." They describe the shape of the JavaScript code to the TypeScript compiler without containing any implementation details.

---

## Using DefinitelyTyped

The TypeScript community maintains a massive repository of declaration files for popular JavaScript libraries called **DefinitelyTyped**.

If you install a library like `lodash`:

```bash
npm install lodash
```

TypeScript will likely complain if you try to use it. You can install its types from DefinitelyTyped by prefixing the package name with `@types/`:

```bash
npm install -D @types/lodash
```

Once installed, TypeScript will automatically find the types and provide you with auto-completion and type checking for Lodash!

---

## Writing Your Own Declaration File

If a library doesn't have an `@types/` package, you can write your own declaration file.

Create a file named `global.d.ts` (or `library-name.d.ts`) in your project.

You use the `declare` keyword to tell TypeScript that a variable or module exists globally.

```typescript
// In global.d.ts

// Declare a global variable
declare const APP_VERSION: string;

// Declare a module (for a JS library without types)
declare module "my-untyped-library" {
  export function doSomethingAwesome(input: string): boolean;
  export const secretKey: string;
}
```

Now, in your TypeScript code, you can use these without errors:

```typescript
// app.ts
import { doSomethingAwesome } from "my-untyped-library";

console.log(APP_VERSION); // OK
const success = doSomethingAwesome("Hello"); // OK, returns boolean
```

Declaration files only contain type definitions, never implementation code (like actual function bodies or variable assignments).
