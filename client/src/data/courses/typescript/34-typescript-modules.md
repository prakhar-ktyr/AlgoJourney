---
title: TypeScript Modules
---

# TypeScript Modules

TypeScript shares the same module concept and syntax as modern JavaScript (ES Modules).

Any file containing a top-level `import` or `export` is considered a module. Conversely, a file without any top-level `import` or `export` declarations is treated as a script whose contents are available in the global scope (and therefore to modules).

---

## Exporting

You can export any declaration (such as a variable, function, class, type alias, or interface) by adding the `export` keyword.

```typescript
// math.ts
export const pi = 3.14;

export interface TwoDShape {
  area(): number;
}

export function squareTwo(x: number) {
  return x * x;
}
```

You can also use **Default Exports**. Each module can optionally export a default export.

```typescript
// hello.ts
export default function helloWorld() {
  console.log("Hello, world!");
}
```

---

## Importing

You use the `import` keyword to consume things exported from other modules.

```typescript
// app.ts
import { pi, squareTwo } from "./math";

console.log(pi); // 3.14
console.log(squareTwo(10)); // 100
```

To import a default export, you omit the curly braces:

```typescript
import helloWorld from "./hello";

helloWorld();
```

---

## Type-Only Imports and Exports

TypeScript allows you to explicitly specify that you are importing or exporting _only_ types. This is useful because it guarantees the compiler that this import will be completely erased from the generated JavaScript.

```typescript
// Explicitly import a type
import type { TwoDShape } from "./math";

// You can also mix them in the same line:
import { pi, type TwoDShape } from "./math";
```

Using `import type` is a great optimization and prevents runtime errors if the bundler accidentally tries to execute a type file!
