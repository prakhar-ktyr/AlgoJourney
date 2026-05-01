---
title: TypeScript Union Types
---

# TypeScript Union Types

Union types are used when a value can be more than a single type.

You can use the pipe `|` symbol to separate different types. This is incredibly useful for allowing multiple, specific types while keeping your code type-safe.

---

## Defining a Union Type

For example, a function might accept a status code as either a `string` or a `number`.

```typescript
function printStatusCode(code: string | number) {
  console.log(`My status code is ${code}.`);
}

printStatusCode(404); // OK
printStatusCode("404"); // OK
// printStatusCode(false); // Error: Argument of type 'boolean' is not assignable to parameter of type 'string | number'.
```

---

## Type Narrowing

When you have a union type, you only have access to properties and methods that are common to all the types in the union.

```typescript
function printId(id: number | string) {
  // Error: Property 'toUpperCase' does not exist on type 'string | number'.
  // Property 'toUpperCase' does not exist on type 'number'.
  // console.log(id.toUpperCase());
}
```

To fix this, you need to **narrow** the type using JavaScript's `typeof` operator. This is also called type guarding.

```typescript
function printId(id: number | string) {
  if (typeof id === "string") {
    // In this branch, TypeScript knows 'id' is a string
    console.log(id.toUpperCase());
  } else {
    // Here, TypeScript knows 'id' is a number
    console.log(id);
  }
}
```

---

## Union of Literal Types

Unions are especially powerful when combined with literal types (specific strings or numbers).

```typescript
type Direction = "North" | "South" | "East" | "West";

function move(direction: Direction) {
  console.log(`Moving ${direction}`);
}

move("North"); // OK
// move("Up"); // Error: Argument of type '"Up"' is not assignable to parameter of type 'Direction'.
```

This acts very similarly to an enum, but using only type aliases and unions!
