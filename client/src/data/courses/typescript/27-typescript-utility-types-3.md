---
title: TypeScript Utility Types 3
---

# TypeScript Utility Types 3

In this final utility types lesson, we will look at `Exclude`, `Extract`, and `NonNullable`.

Unlike the previous utilities that operate on object types, these utilities primarily operate on **Union types**.

---

## 1. `Exclude<UnionType, ExcludedMembers>`

`Exclude` removes types from a union. It constructs a type by excluding from `UnionType` all union members that are assignable to `ExcludedMembers`.

```typescript
type Primitive = string | number | boolean;

// Exclude boolean from Primitive
type StringOrNumber = Exclude<Primitive, boolean>;

const val1: StringOrNumber = "Hello"; // OK
const val2: StringOrNumber = 42; // OK
// const val3: StringOrNumber = true; // Error: Type 'boolean' is not assignable to type 'string | number'.
```

---

## 2. `Extract<Type, Union>`

`Extract` is the exact opposite of `Exclude`. It constructs a type by extracting from `Type` all union members that are assignable to `Union`.

```typescript
type AllRoles = "Admin" | "User" | "Guest" | "SuperAdmin";
type AdminRoles = "Admin" | "SuperAdmin" | "Manager";

// Extract roles that exist in BOTH unions
type ExtractedRoles = Extract<AllRoles, AdminRoles>;

const role: ExtractedRoles = "SuperAdmin"; // OK
// const role2: ExtractedRoles = "User";   // Error
```

---

## 3. `NonNullable<Type>`

`NonNullable` constructs a type by excluding `null` and `undefined` from `Type`.

```typescript
type MaybeString = string | null | undefined;

// Remove null and undefined
type DefinitelyString = NonNullable<MaybeString>;

const myStr: DefinitelyString = "Hello";
// const empty: DefinitelyString = null; // Error
```

This is very useful when you have a value that might be null, but you know for sure in a specific context that it isn't.
