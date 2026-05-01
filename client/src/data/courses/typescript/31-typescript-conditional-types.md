---
title: TypeScript Conditional Types
---

# TypeScript Conditional Types

At the heart of most useful programs, we have to make decisions based on input. JavaScript programs are no different, but with TypeScript, those decisions can be described in the type system.

Conditional types help describe the relation between the types of inputs and outputs.

---

## Syntax

Conditional types take a form that looks a little like conditional expressions (ternary operator) in JavaScript:

```typescript
// SomeType extends OtherType ? TrueType : FalseType;
```

When the type on the left of the `extends` is assignable to the one on the right, then you'll get the type in the first branch (the "true" branch); otherwise you'll get the type in the latter branch (the "false" branch).

```typescript
interface Animal {
  live(): void;
}
interface Dog extends Animal {
  woof(): void;
}

// Example 1: Dog extends Animal is true, so type is number
type Example1 = Dog extends Animal ? number : string;
// Example1 = number

// Example 2: RegExp does not extend Animal, so type is string
type Example2 = RegExp extends Animal ? number : string;
// Example2 = string
```

---

## Practical Example

Conditional types are useful when combined with generics.

Let's say we have a function that creates a Label object. If we pass a number (an ID), it returns an ID Label. If we pass a string (a Name), it returns a Name Label.

```typescript
interface IdLabel {
  id: number;
}
interface NameLabel {
  name: string;
}

// We can define the return type conditionally based on the input T
type NameOrId<T extends number | string> = T extends number ? IdLabel : NameLabel;

function createLabel<T extends number | string>(idOrName: T): NameOrId<T> {
  throw "unimplemented";
}

let a = createLabel("typescript");
//  ^? let a: NameLabel

let b = createLabel(2.8);
//  ^? let b: IdLabel
```

This ensures the compiler knows _exactly_ which return type will come out based on the argument passed in!

TypeScript built-in utility types like `Exclude` and `Extract` are actually implemented using Conditional Types.
