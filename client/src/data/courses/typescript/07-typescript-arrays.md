---
title: TypeScript Arrays
---

# TypeScript Arrays

TypeScript has a specific syntax for typing arrays. Arrays can be typed to ensure that all elements within them are of a specific type.

---

## Defining Arrays

There are two ways to define an array type in TypeScript:

**1. Using square brackets `[]`**

```typescript
const names: string[] = ["Dylan", "Alice", "Bob"];
const scores: number[] = [85, 92, 78];
```

**2. Using the generic array type `Array<Type>`**

```typescript
const names: Array<string> = ["Dylan", "Alice", "Bob"];
const scores: Array<number> = [85, 92, 78];
```

Both approaches are equivalent, but the first one is more commonly used in modern TypeScript projects.

---

## Array Methods and Types

When you declare an array of a specific type, TypeScript ensures that array methods (like `push()`, `map()`, etc.) enforce the types as well.

```typescript
const names: string[] = [];

names.push("Dylan"); // No error
// names.push(3);    // Error: Argument of type 'number' is not assignable to parameter of type 'string'
```

---

## Readonly Arrays

The `readonly` keyword can prevent arrays from being changed. This makes the array immutable.

```typescript
const names: readonly string[] = ["Dylan"];

// names.push("Jack"); // Error: Property 'push' does not exist on type 'readonly string[]'.

// Try to change an element:
// names[0] = "Bob";   // Error: Index signature in type 'readonly string[]' only permits reading.
```

Using `readonly` is very useful when you want to pass an array into a function and ensure the function doesn't mutate it.

---

## Type Inference

Just like variables, TypeScript can infer the type of an array if it has an initial value.

```typescript
const numbers = [1, 2, 3]; // inferred to type number[]
numbers.push(4);
// numbers.push("2"); // Error: Argument of type 'string' is not assignable to parameter of type 'number'.

let head: number = numbers[0]; // no error
```
