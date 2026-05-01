---
title: TypeScript Abstract Classes
---

# TypeScript Abstract Classes

Abstract classes are base classes from which other classes may be derived. They may not be instantiated directly.

Unlike an interface, an abstract class may contain implementation details for its members (i.e., methods with actual code bodies).

---

## The `abstract` Keyword

The `abstract` keyword is used to define abstract classes as well as abstract methods within an abstract class.

```typescript
abstract class Animal {
  // Regular method with an implementation
  move(): void {
    console.log("roaming the earth...");
  }

  // Abstract method (no implementation!)
  abstract makeSound(): void;
}
```

Because `Animal` is abstract, you **cannot** create a new instance of it:

```typescript
// const myAnimal = new Animal(); // Error: Cannot create an instance of an abstract class.
```

---

## Implementing Abstract Methods

When a subclass extends an abstract class, it **must** implement all the abstract methods defined by the parent class.

```typescript
class Dog extends Animal {
  // We MUST implement makeSound
  makeSound(): void {
    console.log("Woof! Woof!");
  }
}

const myDog = new Dog();
myDog.makeSound(); // Output: Woof! Woof!
myDog.move(); // Output: roaming the earth... (inherited from Animal)
```

## Why Use Abstract Classes?

Abstract classes are perfect when you have a core piece of shared functionality that multiple classes should share, but the classes also have distinct functionality that they must implement themselves.

For example, a `Shape` class could be abstract. All shapes have an `area` (so we enforce an abstract `getArea()` method), but calculating the area differs depending on whether it's a `Circle` or a `Square`.
