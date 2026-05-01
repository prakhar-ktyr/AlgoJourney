---
title: TypeScript Implements Keyword
---

# TypeScript Implements Keyword

While `extends` is used to inherit from another class, the `implements` keyword is used to enforce that a class meets the contract defined by an **interface**.

This is a core concept in strongly-typed object-oriented programming.

---

## Implementing an Interface

When a class implements an interface, it must define all the properties and methods specified by that interface.

```typescript
interface Shape {
  getArea: () => number;
}

class Rectangle implements Shape {
  public constructor(
    protected readonly width: number,
    protected readonly height: number,
  ) {}

  // The class MUST define getArea() since it implements Shape
  public getArea(): number {
    return this.width * this.height;
  }
}
```

If `Rectangle` didn't include the `getArea` method, TypeScript would throw an error at compile time:

```typescript
// Error: Class 'Rectangle' incorrectly implements interface 'Shape'.
// Property 'getArea' is missing in type 'Rectangle' but required in type 'Shape'.
```

---

## Implementing Multiple Interfaces

A class can implement multiple interfaces by separating them with commas.

```typescript
interface Pingable {
  ping(): void;
}

interface Pongable {
  pong(): void;
}

// Sonar implements both interfaces
class Sonar implements Pingable, Pongable {
  ping() {
    console.log("ping!");
  }

  pong() {
    console.log("pong!");
  }
}
```

---

## Extends vs Implements

It is important to understand the difference between extending a class and implementing an interface:

- **`extends`**: A class can only extend **one** other class. The child class inherits the actual code (implementation) and properties from the parent class.
- **`implements`**: A class can implement **multiple** interfaces. Interfaces contain no code logic; they only define the _shape_ that the class must follow. The class itself must provide the actual code logic.

You can even combine them! A class can extend another class _and_ implement interfaces at the same time:

```typescript
class BaseClass {
  // ...
}

class MyClass extends BaseClass implements Pingable, Pongable {
  ping() {}
  pong() {}
}
```
