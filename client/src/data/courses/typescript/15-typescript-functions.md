---
title: TypeScript Functions
---

# TypeScript Functions

TypeScript has specific syntax for typing function parameters and return values.

---

## Return Types

You can specify the type of the value that will be returned by a function. It is placed after the parameter list.

```typescript
// The `: number` here specifies that this function returns a number
function getTime(): number {
  return new Date().getTime();
}
```

If a function doesn't return anything, you can use the `void` type.

```typescript
function printHello(): void {
  console.log("Hello!");
}
```

> [!TIP]
> If no return type is defined, TypeScript will attempt to infer it based on the `return` statements in the function.

---

## Parameters

Function parameters are typed with a similar syntax to variable declarations.

```typescript
function multiply(a: number, b: number): number {
  return a * b;
}

// multiply(2, "3"); // Error: Argument of type 'string' is not assignable to parameter of type 'number'.
```

If no parameter type is defined, TypeScript will default to using `any` (unless additional type information is available, such as from a default parameter).

---

## Optional Parameters

By default, TypeScript assumes that all parameters defined in a function are required.

You can mark a parameter as optional by adding a `?` after its name. Optional parameters must always be placed _after_ any required parameters.

```typescript
function add(a: number, b: number, c?: number): number {
  if (c !== undefined) {
    return a + b + c;
  }
  return a + b;
}

console.log(add(2, 5)); // 7
console.log(add(2, 5, 3)); // 10
```

---

## Default Parameters

For parameters with default values, the default value is specified after the type annotation.

```typescript
function pow(value: number, exponent: number = 10): number {
  return value ** exponent;
}

console.log(pow(2)); // Evaluates to 2^10
```

TypeScript can also infer the type from the default value.

```typescript
// TypeScript infers 'exponent' is a number because of the default value 10
function pow(value: number, exponent = 10) {
  return value ** exponent;
}
```

---

## Rest Parameters

Rest parameters take an infinite number of arguments and bundle them into an array. Since they are an array, their type must be an array type.

```typescript
function add(a: number, b: number, ...rest: number[]): number {
  return a + b + rest.reduce((p, c) => p + c, 0);
}
```
