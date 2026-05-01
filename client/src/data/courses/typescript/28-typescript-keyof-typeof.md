---
title: TypeScript keyof and typeof
---

# TypeScript `keyof` and `typeof` Operators

TypeScript provides operators that allow you to create types based on other values or types.

---

## 1. The `keyof` Operator

The `keyof` operator takes an object type and produces a string or numeric literal union of its keys.

This is very useful for functions that expect a property name as an argument.

```typescript
interface Person {
  name: string;
  age: number;
  location: string;
}

// PersonKeys is "name" | "age" | "location"
type PersonKeys = keyof Person;

function printPersonProperty(person: Person, property: keyof Person) {
  console.log(person[property]);
}

const alice = { name: "Alice", age: 25, location: "Paris" };

printPersonProperty(alice, "name"); // OK
// printPersonProperty(alice, "salary"); // Error: Argument of type '"salary"' is not assignable...
```

---

## 2. The `typeof` Operator

JavaScript already has a `typeof` operator you can use in an expression context (e.g. `typeof "Hello" === "string"`).

TypeScript adds a `typeof` operator you can use in a **type context** to refer to the _type_ of a variable or property.

```typescript
let s = "hello";
let n: typeof s; // n is inferred as 'string'

const person = {
  name: "Dylan",
  age: 30,
};

// We don't have to write an interface! We can just pull the type from the object.
type PersonType = typeof person;

const anotherPerson: PersonType = {
  name: "Sarah",
  age: 28,
};
```

---

## Combining `keyof` and `typeof`

You can combine them to get the keys of an object without creating an explicit type first!

```typescript
const colors = {
  red: "#FF0000",
  green: "#00FF00",
  blue: "#0000FF",
};

// "red" | "green" | "blue"
type ColorKeys = keyof typeof colors;

function getColor(name: ColorKeys) {
  return colors[name];
}
```
