---
title: TypeScript Objects
---

# TypeScript Objects

TypeScript has a specific syntax for typing objects. It lets you enforce that an object has specific properties with specific types.

---

## Defining Object Types

You define an object type by writing a set of properties and their types inside curly braces `{}`.

```typescript
const car: { type: string; model: string; year: number } = {
  type: "Toyota",
  model: "Corolla",
  year: 2009,
};
```

If you try to assign an object without all the required properties, or with extra properties, TypeScript will complain:

```typescript
// Error: Property 'year' is missing in type '{ type: string; model: string; }'
// const myCar: { type: string, model: string, year: number } = {
//   type: "Toyota",
//   model: "Corolla"
// };
```

---

## Optional Properties

Object properties don't have to be required. You can make a property optional by adding a question mark `?` after the property name.

```typescript
const car: { type: string; mileage?: number } = {
  type: "Toyota",
};

car.mileage = 2000; // This is perfectly fine
```

In the example above, `mileage` is optional, so it is valid to create the object without it.

---

## Readonly Properties

You can mark a property as `readonly`, which will prevent it from being modified after the object is created.

```typescript
const user: { readonly id: number; name: string } = {
  id: 1,
  name: "Alice",
};

user.name = "Bob"; // OK
// user.id = 2; // Error: Cannot assign to 'id' because it is a read-only property.
```

---

## Index Signatures

Index signatures can be used for objects without a defined list of properties, such as dictionaries or maps.

```typescript
const nameAgeMap: { [index: string]: number } = {};

nameAgeMap.Jack = 25; // no error
nameAgeMap.Mark = 50; // no error
// nameAgeMap.Sarah = "Fifty"; // Error: Type 'string' is not assignable to type 'number'.
```

The syntax `{ [index: string]: number }` means that any property added to `nameAgeMap` must have a string key and a number value.

---

## Type Inference

TypeScript can infer object types based on the initial value assigned to a variable.

```typescript
const car = {
  type: "Toyota",
};

car.type = "Ford"; // no error
// car.type = 2; // Error: Type 'number' is not assignable to type 'string'.
```
