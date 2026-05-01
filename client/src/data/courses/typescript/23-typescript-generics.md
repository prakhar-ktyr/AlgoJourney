---
title: TypeScript Generics
---

# TypeScript Generics

Generics allow creating "type variables" which can be used to create classes, functions & type aliases that don't need to explicitly define the types that they use.

Generics make it easier to write reusable code.

---

## Why Generics?

Imagine we have a function that returns the first element of an array.

If we don't know what type of array will be passed in, we might use `any[]`:

```typescript
function getFirstElement(arr: any[]) {
  return arr[0];
}

const num = getFirstElement([1, 2, 3]); // Type of 'num' is any
```

The problem is that TypeScript loses the type information. We passed an array of numbers, but the return type is `any`.

Generics solve this by acting as a placeholder for the type.

---

## Defining a Generic Function

We can define a generic type variable using angle brackets `<T>`. `T` is a common convention meaning "Type", but you can name it anything.

```typescript
function getFirstElement<T>(arr: T[]): T {
  return arr[0];
}

const num = getFirstElement<number>([1, 2, 3]);
// Type of 'num' is explicitly 'number'

const str = getFirstElement(["a", "b", "c"]);
// TypeScript infers T is 'string', so 'str' is a 'string'
```

By using `<T>`, we created a link between the input array (`T[]`) and the output type (`T`).

---

## Multiple Generic Types

You can pass multiple generic types into a function.

```typescript
function merge<U, V>(obj1: U, obj2: V): U & V {
  return { ...obj1, ...obj2 };
}

const result = merge({ name: "Alice" }, { age: 30 });
// result is of type: { name: string } & { age: number }
```

---

## Generic Constraints

Sometimes you want to use a generic type, but you also want to restrict what kind of types are allowed.

For example, we might want to ensure the type has a `.length` property (like a string or an array). We use the `extends` keyword to constrain the generic.

```typescript
// T must be an object with a 'length' property of type number
function logLength<T extends { length: number }>(item: T): void {
  console.log(item.length);
}

logLength("Hello"); // OK (strings have length)
logLength([1, 2, 3]); // OK (arrays have length)
// logLength(10); // Error: Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.
```
