---
title: TypeScript Class Inheritance
---

# TypeScript Class Inheritance

Classes can inherit from other classes in TypeScript using the `extends` keyword. This forms an "is-a" relationship (e.g., a Dog is an Animal).

Inheritance allows a subclass (child class) to inherit properties and methods from a superclass (parent class), preventing code duplication.

---

## The `extends` Keyword

Here is an example of inheritance.

```typescript
class Animal {
  public name: string;

  public constructor(name: string) {
    this.name = name;
  }

  public move(distanceInMeters: number = 0) {
    console.log(`${this.name} moved ${distanceInMeters}m.`);
  }
}

class Dog extends Animal {
  public bark() {
    console.log("Woof! Woof!");
  }
}

const dog = new Dog("Rex");
dog.bark(); // Output: Woof! Woof!
dog.move(10); // Output: Rex moved 10m.
```

The `Dog` class inherited the `name` property and the `move()` method from the `Animal` class.

---

## The `super` Keyword

If a subclass has its own constructor, it **must** call `super()` before accessing `this`.

The `super()` method calls the constructor of the parent class, ensuring that all the properties defined in the parent class are properly initialized.

```typescript
class Animal {
  constructor(public name: string) {}
}

class Snake extends Animal {
  constructor(
    name: string,
    public length: number,
  ) {
    // Call the parent constructor with the name argument
    super(name);
  }
}

const snake = new Snake("Sammy", 5);
console.log(snake.name); // "Sammy"
console.log(snake.length); // 5
```

You can also use `super` to call methods on the parent class:

```typescript
class Horse extends Animal {
  constructor(name: string) {
    super(name);
  }

  move(distanceInMeters = 45) {
    console.log("Galloping...");
    // Calling the move() method from the Animal class
    super.move(distanceInMeters);
  }
}
```

---

## Method Overriding

As seen in the `Horse` example above, a subclass can override a method defined in its parent class simply by defining a method with the same name.

When you call `horse.move()`, it will execute the `Horse` class's implementation of `move()` rather than the `Animal` class's implementation. However, you can still access the parent's implementation using `super.move()`.
