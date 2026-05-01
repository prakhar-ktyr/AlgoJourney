---
title: TypeScript Type Aliases
---

# TypeScript Type Aliases

Type Aliases allow defining types with a custom name (an Alias).

Type Aliases can be used for primitives like `string` or more complex types such as objects and arrays.

---

## Defining Type Aliases

You use the `type` keyword to declare a type alias.

```typescript
type CarYear = number;
type CarType = string;
type CarModel = string;

type Car = {
  year: CarYear;
  type: CarType;
  model: CarModel;
};

const carYear: CarYear = 2001;
const carType: CarType = "Toyota";
const carModel: CarModel = "Corolla";

const car: Car = {
  year: carYear,
  type: carType,
  model: carModel,
};
```

By using type aliases, the code becomes much more readable and it's easier to reuse the type definition across multiple variables or functions.

---

## Type Aliases with Primitives

You can alias primitive types. This is usually done to make the code more descriptive:

```typescript
type Point = number;
type ID = string | number;

let userId: ID = 12345;
userId = "uuid-1234"; // also valid
```

_(Note: We will cover the `|` syntax, called a Union type, in a future lesson.)_

---

## Type Aliases with Functions

You can also use type aliases to define function signatures.

```typescript
type MathOperation = (x: number, y: number) => number;

const add: MathOperation = (a, b) => a + b;
const multiply: MathOperation = (a, b) => a * b;
```

This ensures that any function assigned to `MathOperation` accepts exactly two numbers and returns a number.

---

## Type Aliases vs Interfaces

You will often see type aliases and **interfaces** used for similar purposes (typing objects). In most cases, you can use them interchangeably. We will learn more about Interfaces in the next step, but a good rule of thumb is:

- Use `type` aliases for primitives, unions, and tuples.
- Use `interface` for object structures that you might want to extend later.
