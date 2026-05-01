---
title: TypeScript Primitive Types
---

# TypeScript Primitive Types

TypeScript supports the same primitive types as JavaScript, but allows you to enforce them.

There are three main primitive types in JavaScript and TypeScript:

- `string`: Represents text values such as "Hello", "TypeScript".
- `number`: Represents numeric values like 42, 3.14. JavaScript does not have a special runtime value for integers, so there's no equivalent to `int` or `float` - everything is simply `number`.
- `boolean`: Represents logical values, either `true` or `false`.

---

## 1. String Type

The `string` type is used to store text. You can use single quotes (`'`), double quotes (`"`), or backticks (`` ` ``) for strings.

```typescript
let myName: string = "Alice";
let greeting: string = `Hello, my name is ${myName}`;
```

## 2. Number Type

The `number` type represents both integer and floating-point numbers.

```typescript
let integerNum: number = 42;
let floatNum: number = 3.14;
let hexNum: number = 0xf00d; // Hexadecimal
```

## 3. Boolean Type

The `boolean` type has only two possible values: `true` or `false`.

```typescript
let isDone: boolean = false;
let isLoggedIn: boolean = true;
```

---

## Type Checking

Because TypeScript checks types statically, it will catch mismatched assignments:

```typescript
let score: number = 100;
// score = "high"; // Error: Type 'string' is not assignable to type 'number'

let isWinner: boolean = true;
// isWinner = 1; // Error: Type 'number' is not assignable to type 'boolean'
```

> [!WARNING]
> Keep in mind that primitive types are written in **lowercase** (`string`, `number`, `boolean`).
> You might see `String`, `Number`, or `Boolean` with a capital letter, but these refer to the built-in JavaScript object wrappers, which you should almost never use as types. Always use the lowercase versions.
