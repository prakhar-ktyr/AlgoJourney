---
title: TypeScript Utility Types 1
---

# TypeScript Utility Types 1

TypeScript comes with several built-in **Utility Types** to facilitate common type transformations. These utilities are available globally.

In this first part, we will cover `Partial`, `Required`, and `Readonly`.

---

## 1. `Partial<Type>`

`Partial` changes all the properties in an object to be optional.

This is very useful when writing update functions, where you might only be updating a subset of an object's properties.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// UserUpdate makes all properties optional:
// { id?: number; name?: string; email?: string; }
type UserUpdate = Partial<User>;

function updateUser(user: User, update: UserUpdate) {
  return { ...user, ...update };
}

const currentUser: User = { id: 1, name: "Alice", email: "alice@test.com" };

// We can pass just the name to update!
const updatedUser = updateUser(currentUser, { name: "Alicia" });
```

---

## 2. `Required<Type>`

`Required` is the exact opposite of `Partial`. It changes all the properties in an object to be required (even if they were originally defined as optional).

```typescript
interface Car {
  make: string;
  model: string;
  mileage?: number; // Optional
}

// myCar MUST have mileage now
let myCar: Required<Car> = {
  make: "Ford",
  model: "Focus",
  mileage: 12000, // Error if missing
};
```

---

## 3. `Readonly<Type>`

`Readonly` is used to create a new type where all properties are marked as `readonly`. They cannot be modified once assigned.

```typescript
interface Person {
  name: string;
  age: number;
}

const person: Readonly<Person> = {
  name: "Dylan",
  age: 35,
};

// person.name = 'Israel'; // Error: Cannot assign to 'name' because it is a read-only property.
```
