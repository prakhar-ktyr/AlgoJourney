---
title: TypeScript Mapped Types
---

# TypeScript Mapped Types

When you don't want to repeat yourself, sometimes a type needs to be based on another type.

Mapped types build on the syntax for index signatures, which are used to declare the types of properties which have not been declared ahead of time.

---

## What is a Mapped Type?

A mapped type is a generic type which uses a union of `PropertyKeys` (frequently created via a `keyof`) to iterate through keys to create a new type.

```typescript
type OptionsFlags<Type> = {
  [Property in keyof Type]: boolean;
};
```

In the example above, `OptionsFlags` will take all the properties from `Type` and change their values to be a `boolean`.

```typescript
type FeatureFlags = {
  darkMode: () => void;
  newUserProfile: () => void;
};

// FeatureOptions transforms all methods in FeatureFlags to booleans
type FeatureOptions = OptionsFlags<FeatureFlags>;
// Equivalent to:
// {
//   darkMode: boolean;
//   newUserProfile: boolean;
// }
```

---

## Mapping Modifiers

You can apply modifiers like `readonly` or `?` (optional) during mapping. You can also add or remove these modifiers by prefixing with `+` or `-`.

If you don't add a prefix, then `+` is assumed.

**Removing `readonly`:**

```typescript
type CreateMutable<Type> = {
  // Removes 'readonly' from all properties
  -readonly [Property in keyof Type]: Type[Property];
};

type LockedAccount = {
  readonly id: string;
  readonly name: string;
};

type UnlockedAccount = CreateMutable<LockedAccount>;
// Equivalent to:
// {
//   id: string;
//   name: string;
// }
```

**Removing Optional (`?`):**

```typescript
type Concrete<Type> = {
  // Removes '?' from all properties
  [Property in keyof Type]-?: Type[Property];
};

type MaybeUser = {
  id: string;
  name?: string;
  age?: number;
};

type User = Concrete<MaybeUser>;
// Equivalent to:
// {
//   id: string;
//   name: string;
//   age: number;
// }
```

Most of TypeScript's built-in Utility types (like `Partial`, `Readonly`, `Required`) are actually implemented under the hood using Mapped Types!
