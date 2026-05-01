---
title: TypeScript Tuples
---

# TypeScript Tuples

A tuple is a specific type of array where the types of elements and their exact length are known in advance.

Tuples are very useful when you want to group a fixed number of different data types together.

---

## Defining a Tuple

To define a tuple, you specify an array of types:

```typescript
// Define our tuple
let ourTuple: [number, boolean, string];

// Initialize correctly
ourTuple = [5, false, "Coding God was here"];
```

As you can see, we have a `number`, a `boolean`, and a `string` exactly in that order.

If we try to set them in the wrong order, or omit an element, TypeScript will throw an error:

```typescript
// ourTuple = [false, "Coding God was here", 5]; // Error: Type 'boolean' is not assignable to type 'number'
```

---

## Readonly Tuples

By default, even though a tuple's type definition enforces length and types, it is still a regular array at runtime. This means we could technically push new items to it:

```typescript
let ourTuple: [number, boolean, string] = [5, false, "Coding God was here"];
// We have no type safety in our tuple for indexes 3+
ourTuple.push("Something new and wrong");
console.log(ourTuple);
```

To prevent this and make the tuple strictly fixed length and unmodifiable, use the `readonly` keyword:

```typescript
let strictTuple: readonly [number, boolean, string] = [5, false, "Coding God was here"];

// strictTuple.push("Testing"); // Error: Property 'push' does not exist on type 'readonly [number, boolean, string]'.
```

---

## Named Tuples

Named tuples provide more context for what each index represents. It acts very similarly to objects but uses an array structure.

```typescript
const graph: [x: number, y: number] = [55.2, 41.3];
```

The names (`x` and `y`) don't do anything functionally but make the code easier to read.

---

## Destructuring Tuples

Since tuples are arrays, we can destructure them just like arrays in JavaScript.

```typescript
const graph: [number, number] = [55.2, 41.3];
const [x, y] = graph;

console.log(x); // 55.2
console.log(y); // 41.3
```
