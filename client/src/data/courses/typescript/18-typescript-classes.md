---
title: TypeScript Classes
---

# TypeScript Classes

TypeScript adds types and visibility modifiers to JavaScript classes.

If you are familiar with Object-Oriented Programming (OOP) in languages like Java or C#, TypeScript classes will look very familiar.

---

## Defining a Class

You define a class using the `class` keyword. Inside the class, you can declare properties with their types.

```typescript
class Person {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }
}

const person = new Person("Jane");
console.log(person.getName()); // "Jane"
```

In the example above, we declared a `Person` class with a `name` property of type `string`. We then created a `constructor` to initialize this property when a new object is created.

---

## The `this` Keyword

Inside the class methods and constructors, you must use the `this` keyword to refer to the class's own properties.

```typescript
class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet() {
    // We must use 'this.greeting' here
    return "Hello, " + this.greeting;
  }
}
```

---

## Uninitialized Properties

If you declare a property but do not initialize it in the constructor or at the point of declaration, TypeScript will throw an error (if `strictPropertyInitialization` is enabled in `tsconfig.json`).

```typescript
class User {
  // Error: Property 'email' has no initializer and is not definitely assigned in the constructor.
  // email: string;

  // Solution 1: Initialize immediately
  email: string = "";

  // Solution 2: Make it optional
  age?: number;

  // Solution 3: Initialize in the constructor
  id: number;
  constructor(id: number) {
    this.id = id;
  }
}
```
