---
title: TypeScript Best Practices
---

# TypeScript Best Practices

To get the most out of TypeScript and maintain a clean, robust codebase, it is important to follow industry best practices.

---

## 1. Enable `strict` Mode

Always enable `"strict": true` in your `tsconfig.json`. This turns on all strict type-checking options, including `strictNullChecks`, which prevents an entire class of runtime bugs.

---

## 2. Avoid `any` at All Costs

The `any` type completely disables type checking. If you use it, you lose all the benefits of TypeScript.

- If you don't know a type yet, use `unknown`. You'll be forced to narrow it down before using it.
- If you are migrating a JS project, use `any` temporarily, but replace it as soon as possible.

---

## 3. Prefer Interfaces for Objects

While `type` aliases and `interface` are very similar, `interface` should be your default choice for describing object shapes, especially in public APIs. Interfaces are easier for the compiler to cache and provide better error messages.

Use `type` aliases for primitives, unions, and tuples.

---

## 4. Let Type Inference Do the Work

You don't need to explicitly type everything. TypeScript's inference engine is incredibly smart.

```typescript
// Bad: Redundant typing
const age: number = 25;
const name: string = "Alice";

// Good: Let TypeScript infer it
const age = 25;
const name = "Alice";
```

Only add explicit types when the compiler cannot infer it (like function parameters or complex state).

---

## 5. Use Optional Chaining and Nullish Coalescing

Write cleaner, safer code using modern syntax to handle `null` and `undefined`.

```typescript
// Bad
const zipCode = user && user.address && user.address.zipCode ? user.address.zipCode : "00000";

// Good
const zipCode = user?.address?.zipCode ?? "00000";
```

---

## 6. Avoid Force Casting

Using the `as` keyword bypasses the type checker. Try to use type guards (narrowing) instead of casting whenever possible.

```typescript
// Bad
function printLength(item: string | number) {
  console.log((item as string).length); // Will return undefined at runtime if item is a number!
}

// Good
function printLength(item: string | number) {
  if (typeof item === "string") {
    console.log(item.length);
  }
}
```

---

## 7. Keep Types Close to Usage

Co-locate your types with the components or functions that use them. If a type is only used in one file, define it in that file. If it's used across the application, move it to a dedicated `types.ts` or `interfaces.ts` file.

Following these practices will make your TypeScript journey much smoother and your code incredibly reliable!
