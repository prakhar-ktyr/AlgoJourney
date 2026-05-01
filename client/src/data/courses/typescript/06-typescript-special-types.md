---
title: TypeScript Special Types
---

# TypeScript Special Types

TypeScript has several special types that don't refer to any specific type of data, but rather to how the type system itself behaves.

---

## 1. Type `any`

`any` is a type that disables type checking and effectively allows all types to be used.

Using `any` removes the safety features of TypeScript. It is generally used as a fallback or when migrating old JavaScript code where you aren't sure of the types yet.

```typescript
let myValue: any = true;
myValue = "string"; // No error
myValue = 42; // No error

// No error is thrown even if the method doesn't exist
// myValue.doSomething();
```

> [!WARNING]
> Avoid using `any` whenever possible. It entirely defeats the purpose of using TypeScript.

---

## 2. Type `unknown`

`unknown` is a safer alternative to `any`.

Like `any`, you can assign any value to an `unknown` variable. However, unlike `any`, you cannot use an `unknown` variable or call methods on it until you have narrowed its type (e.g., using an `if` statement to check its type).

```typescript
let w: unknown = 1;
w = "string";

// w.length; // Error: Object is of type 'unknown'

// We must cast or check the type first:
if (typeof w === "string") {
  console.log(w.length); // OK
}
```

---

## 3. Type `never`

The `never` type represents the type of values that never occur.
For instance, `never` is the return type for a function that always throws an exception or one that never finishes executing (e.g., an infinite loop).

```typescript
// Function returning never must not have a reachable end point
function throwError(errorMsg: string): never {
  throw new Error(errorMsg);
}

function infiniteLoop(): never {
  while (true) {
    // do something endlessly
  }
}
```

---

## 4. Type `void`

`void` is a little like the opposite of `any`: the absence of having any type at all. You may commonly see this as the return type of functions that do not return a value.

```typescript
function printMessage(msg: string): void {
  console.log(msg);
  // does not return anything
}
```

Assigning a variable to `void` is not very useful, because you can only assign `undefined` (or `null`, if strict null checks are disabled) to it.
