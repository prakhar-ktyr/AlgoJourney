---
title: TypeScript Generic Classes
---

# TypeScript Generic Classes

Just like functions, classes and interfaces can also be generic.

This is incredibly useful for creating reusable data structures (like Stacks, Queues, Lists) or components that can handle different types of data while maintaining type safety.

---

## Generic Classes

You define a generic class by placing the generic type parameter `<T>` after the class name.

```typescript
class Box<T> {
  private content: T;

  constructor(initialContent: T) {
    this.content = initialContent;
  }

  getContent(): T {
    return this.content;
  }

  setContent(newContent: T): void {
    this.content = newContent;
  }
}

// Create a Box for strings
const stringBox = new Box<string>("Secret Message");
console.log(stringBox.getContent()); // "Secret Message"

// Create a Box for numbers
const numberBox = new Box<number>(42);
// numberBox.setContent("43"); // Error: Argument of type 'string' is not assignable to parameter of type 'number'.
```

In the example above, `Box` can hold ANY type, but once instantiated, the compiler ensures that the specific instance strictly follows that type.

---

## Generic Interfaces

Interfaces can also take generic parameters.

```typescript
interface KeyValuePair<K, V> {
  key: K;
  value: V;
}

const item1: KeyValuePair<number, string> = { key: 1, value: "Apple" };
const item2: KeyValuePair<string, boolean> = { key: "isActive", value: true };
```

---

## Default Generic Types

You can assign default types to your generics. If the user doesn't specify a type, TypeScript will use the default.

```typescript
class DataStore<T = string> {
  private data: T[] = [];

  addItem(item: T) {
    this.data.push(item);
  }
}

// Defaults to DataStore<string>
const store = new DataStore();
store.addItem("Hello");
// store.addItem(5); // Error

// Explicitly overriding the default to number
const numberStore = new DataStore<number>();
numberStore.addItem(5); // OK
```
