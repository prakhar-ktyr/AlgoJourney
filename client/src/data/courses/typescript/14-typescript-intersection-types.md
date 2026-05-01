---
title: TypeScript Intersection Types
---

# TypeScript Intersection Types

While Union types (`|`) represent a value that can be _one of_ several types, Intersection types (`&`) represent a value that has _all_ the properties of multiple types combined.

Intersections are typically used with objects to mix multiple types into one.

---

## Defining an Intersection Type

You use the ampersand `&` symbol to combine types.

```typescript
type ErrorHandling = {
  success: boolean;
  error?: { message: string };
};

type ArtworksData = {
  artworks: { title: string }[];
};

// Combining them using Intersection:
type ArtworksResponse = ArtworksData & ErrorHandling;
```

Now, any object of type `ArtworksResponse` must contain properties from both `ArtworksData` and `ErrorHandling`.

```typescript
const response: ArtworksResponse = {
  success: true,
  artworks: [{ title: "Mona Lisa" }],
};
```

---

## Intersections vs Extending Interfaces

Intersection types (`&`) perform a similar role to the `extends` keyword with interfaces.

Both can be used to merge shapes together.

```typescript
// Using Interfaces
interface Person {
  name: string;
}
interface Employee extends Person {
  salary: number;
}

// Using Intersections
type TPerson = { name: string };
type TEmployee = TPerson & { salary: number };
```

For most use cases, both accomplish the same thing. The main difference is how conflicts are handled when two properties have the same name but different types.

- Interfaces with conflicting properties will throw an error.
- Intersections will attempt to combine the types (which often results in a type of `never`).

---

## Impossible Intersections

If you intersect two primitive types that have nothing in common, TypeScript will resolve the type to `never`.

```typescript
type StringAndNumber = string & number;
// StringAndNumber is equivalent to 'never' because a value cannot be both a string and a number at the same time.
```
