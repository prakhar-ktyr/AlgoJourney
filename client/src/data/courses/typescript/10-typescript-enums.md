---
title: TypeScript Enums
---

# TypeScript Enums

An **enum** is a special "class" that represents a group of constants (unchangeable variables).

Enums come in two flavors: `string` and `numeric`.

---

## Numeric Enums

By default, enums will initialize the first value to `0` and add 1 to each additional value.

```typescript
enum CardinalDirections {
  North,
  East,
  South,
  West,
}

let currentDirection = CardinalDirections.North;
// currentDirection is 0
```

### Initialized Numeric Enums

You can set the value of the first numeric enum and have it auto-increment from that.

```typescript
enum CardinalDirections {
  North = 1,
  East, // 2
  South, // 3
  West, // 4
}
// logs 1
console.log(CardinalDirections.North);
// logs 4
console.log(CardinalDirections.West);
```

### Fully Initialized Numeric Enums

You can assign unique number values for each enum value.

```typescript
enum StatusCodes {
  NotFound = 404,
  Success = 200,
  Accepted = 202,
  BadRequest = 400,
}
// logs 404
console.log(StatusCodes.NotFound);
```

---

## String Enums

Enums can also contain strings. This is more common than numeric enums because of their readability and intent.

```typescript
enum CardinalDirections {
  North = "North",
  East = "East",
  South = "South",
  West = "West",
}
// logs "North"
console.log(CardinalDirections.North);
```

String enums do not auto-increment. Each member must be initialized with a string literal or another string enum member.

---

## Heterogeneous Enums

Technically, you can mix string and numeric values, but it is considered bad practice.

```typescript
// Not recommended
enum Status {
  Active = "ACTIVE",
  Pending = 1,
  Closed = "CLOSED",
}
```
