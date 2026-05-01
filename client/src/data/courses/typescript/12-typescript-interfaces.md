---
title: TypeScript Interfaces
---

# TypeScript Interfaces

Interfaces are similar to type aliases, except they only apply to object types.

Interfaces allow you to define the shape of an object, specifying what properties it should have and what their types are.

---

## Defining an Interface

You use the `interface` keyword to define an interface.

```typescript
interface Rectangle {
  height: number;
  width: number;
}

const rectangle: Rectangle = {
  height: 20,
  width: 10,
};
```

---

## Extending Interfaces

One of the biggest advantages of interfaces over type aliases is that they can **extend** each other's definition using the `extends` keyword.

```typescript
interface Rectangle {
  height: number;
  width: number;
}

interface ColoredRectangle extends Rectangle {
  color: string;
}

const coloredRectangle: ColoredRectangle = {
  height: 20,
  width: 10,
  color: "red",
};
```

This allows you to build complex object structures from simpler ones.

---

## Optional and Readonly Properties

Just like object types, interfaces can have optional and readonly properties.

```typescript
interface Person {
  readonly id: number; // Cannot be changed after creation
  name: string;
  age?: number; // Optional property
}

const john: Person = {
  id: 1,
  name: "John",
};

// john.id = 2; // Error: Cannot assign to 'id' because it is a read-only property.
```

---

## Type Aliases vs Interfaces

As mentioned previously, you can often use `type` and `interface` interchangeably.

However, the key difference is:

- A `type` alias cannot be reopened to add new properties (it's closed after declaration).
- An `interface` can be reopened (declaration merging).

```typescript
// Declaration merging works with Interfaces
interface Car {
  make: string;
}
interface Car {
  model: string;
}

const myCar: Car = {
  make: "Ford",
  model: "Mustang",
};
```
