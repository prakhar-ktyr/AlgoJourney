---
title: TypeScript Utility Types 2
---

# TypeScript Utility Types 2

In this lesson, we will cover `Record`, `Omit`, and `Pick`. These are incredibly useful for constructing new types by selecting or removing properties from existing ones.

---

## 1. `Record<Keys, Type>`

`Record` is a shortcut for defining an object type with a specific set of keys and a specific value type.

```typescript
// A dictionary where keys are strings and values are numbers
const nameAgeMap: Record<string, number> = {
  Alice: 21,
  Bob: 25,
};
```

You can also restrict the keys using a union of literal types:

```typescript
type Role = "admin" | "user" | "guest";

const permissions: Record<Role, boolean> = {
  admin: true,
  user: false,
  guest: false,
};
```

---

## 2. `Omit<Type, Keys>`

`Omit` creates a new type by taking an existing type and **removing** specified properties.

This is very useful for creating types for forms or API payloads where you don't need the `id` or `createdAt` fields.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

// Create a new type without 'id' and 'createdAt'
type UserForm = Omit<User, "id" | "createdAt">;

const newUser: UserForm = {
  name: "John",
  email: "john@test.com",
};
```

---

## 3. `Pick<Type, Keys>`

`Pick` is the exact opposite of `Omit`. It creates a new type by **selecting only** the specified properties from an existing type.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

// Create a new type containing ONLY 'id' and 'email'
type UserIdentity = Pick<User, "id" | "email">;

const identity: UserIdentity = {
  id: 42,
  email: "john@test.com",
};
```
