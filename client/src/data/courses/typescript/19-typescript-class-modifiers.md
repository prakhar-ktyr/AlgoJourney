---
title: TypeScript Class Modifiers
---

# TypeScript Class Modifiers

Visibility modifiers (also known as access modifiers) control whether methods or properties are visible to code outside the class.

TypeScript provides three main visibility modifiers: `public`, `private`, and `protected`.

---

## 1. `public`

The default visibility of class members is `public`. A public member can be accessed anywhere.

```typescript
class Person {
  public name: string;

  public constructor(name: string) {
    this.name = name;
  }

  public getName() {
    return this.name;
  }
}

const p = new Person("Alice");
console.log(p.name); // OK
```

Because `public` is the default, you don't actually need to write it, but doing so can improve readability.

---

## 2. `private`

A `private` member cannot be accessed from outside of its containing class. It is only accessible within the methods of the class itself.

```typescript
class Person {
  private name: string;

  public constructor(name: string) {
    this.name = name;
  }

  public getName() {
    return this.name; // OK (accessed inside the class)
  }
}

const p = new Person("Alice");
// console.log(p.name); // Error: Property 'name' is private and only accessible within class 'Person'.
```

---

## 3. `protected`

A `protected` member acts much like a `private` member, with one key difference: it can also be accessed within deriving classes (classes that inherit from this one).

```typescript
class Person {
  protected name: string;
  public constructor(name: string) {
    this.name = name;
  }
}

class Employee extends Person {
  private department: string;

  constructor(name: string, department: string) {
    super(name);
    this.department = department;
  }

  public getElevatorPitch() {
    // We can access this.name because it is protected in the parent class
    return `Hello, my name is ${this.name} and I work in ${this.department}.`;
  }
}

const howard = new Employee("Howard", "Sales");
// console.log(howard.name); // Error: Property 'name' is protected and only accessible within class 'Person' and its subclasses.
```

---

## Parameter Properties

TypeScript offers a shorthand for declaring class properties and initializing them in the constructor. This is called **Parameter Properties**.

Instead of declaring a property and then assigning it in the constructor:

```typescript
class Person {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }
}
```

You can just put the visibility modifier directly on the constructor parameter:

```typescript
class Person {
  // TypeScript automatically creates the 'name' property and assigns the argument to it
  constructor(private name: string) {}
}
```
