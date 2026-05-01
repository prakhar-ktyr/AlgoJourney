---
title: TypeScript Function Overloading
---

# TypeScript Function Overloading

In TypeScript, you can specify multiple function signatures for a single function. This is called **Function Overloading**.

It allows you to describe the relationship between the parameter types and the return type in cases where a function can be called in multiple different ways.

---

## Why Use Function Overloading?

Imagine a function that returns the length of a string or the length of an array.

Without overloading, you might write:

```typescript
function getLength(x: string | any[]): number {
  return x.length;
}
```

This works, but it doesn't give precise typing if we wanted to change the return type based on the argument.

Let's say we have a function that creates a Date object. It can take a timestamp (number) or month/day/year (numbers).

```typescript
// Without overloading, you'd use optionals, but the relationship is lost:
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d);
  } else {
    return new Date(mOrTimestamp);
  }
}
```

If we use this function, the compiler doesn't enforce passing exactly 1 argument OR exactly 3 arguments. It would allow 2 arguments, which is a bug!

---

## How to Overload a Function

To create overloads, you write the function signatures (without a body) followed by one single function implementation.

```typescript
// Signature 1
function makeDate(timestamp: number): Date;

// Signature 2
function makeDate(m: number, d: number, y: number): Date;

// Implementation Signature (The actual function body)
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d);
  } else {
    return new Date(mOrTimestamp);
  }
}

const d1 = makeDate(12345678); // OK
const d2 = makeDate(5, 5, 5); // OK
// const d3 = makeDate(1, 3); // Error: No overload expects 2 arguments
```

### Key Rules

1. **Implementation Signature is Hidden**: From the outside, the function only exposes the "Overload Signatures" (the ones without the body). The implementation signature is invisible to the caller.
2. **Implementation Must be Compatible**: The implementation signature must be broad enough to handle all the overload signatures. In the example above, the implementation makes `d` and `y` optional to satisfy the first overload.
