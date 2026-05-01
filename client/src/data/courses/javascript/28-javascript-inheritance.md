---
title: JavaScript Inheritance
---

# JavaScript Inheritance

A class can extend another class with `extends`. The child inherits the parent's methods and can override or extend them. Used wisely, inheritance keeps related code DRY; used poorly, it tangles your codebase.

## `extends` and `super`

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  describe() {
    return `${this.name} is an animal`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);             // call the parent constructor first
    this.breed = breed;
  }
  describe() {
    return `${super.describe()} (a ${this.breed})`;
  }
  bark() {
    return "Woof!";
  }
}

const rex = new Dog("Rex", "Labrador");
rex.describe();  // "Rex is an animal (a Labrador)"
rex.bark();      // "Woof!"
rex instanceof Dog;    // true
rex instanceof Animal; // true
```

Two rules around `super`:

1. In a subclass constructor you **must** call `super(...)` before using `this`.
2. `super.foo(...)` calls the parent's version of `foo`, even if the child overrides it.

## Method overriding

Define a method with the same name in the child to replace the parent's behavior. Use `super.method()` if you want to extend rather than replace.

```javascript
class Cache {
  get(key) { /* ... */ }
}

class LoggingCache extends Cache {
  get(key) {
    console.log("get", key);
    return super.get(key);
  }
}
```

## `static` inheritance

Static members are inherited too:

```javascript
class Parent {
  static greet() { return "hello"; }
}

class Child extends Parent {}

Child.greet(); // "hello"
```

Override the same way as instance methods, with `super.staticMethod()` to call the parent.

## Abstract-style classes

JavaScript has no `abstract` keyword. The conventional substitute is to throw in unimplemented methods:

```javascript
class Shape {
  area() {
    throw new Error("Subclass must implement area()");
  }
}

class Circle extends Shape {
  constructor(r) { super(); this.r = r; }
  area() { return Math.PI * this.r ** 2; }
}
```

In TypeScript you'd write `abstract class Shape { abstract area(): number; }` and let the compiler enforce it.

## Mixins — composition for behavior

JavaScript allows only single inheritance (one parent class). To mix behaviors from multiple sources, use **mixins** — functions that take a class and return a subclass:

```javascript
const Serializable = (Base) => class extends Base {
  toJSON() {
    return JSON.stringify({ ...this });
  }
};

const Loggable = (Base) => class extends Base {
  log() { console.log(this.constructor.name, this); }
};

class User {
  constructor(name) { this.name = name; }
}

class AdminUser extends Serializable(Loggable(User)) {}
const a = new AdminUser("Ada");
a.log();
a.toJSON();
```

Use mixins sparingly — composition (passing helpers in) is usually clearer.

## Inheritance vs composition

A common axiom: **prefer composition over inheritance**.

```javascript
// Inheritance (deep hierarchy gets brittle)
class Vehicle {}
class Car extends Vehicle {}
class ElectricCar extends Car {}

// Composition (objects collaborate)
class Battery { /* ... */ }
class Motor   { /* ... */ }
class ElectricCar {
  constructor() {
    this.battery = new Battery();
    this.motor   = new Motor();
  }
}
```

Reach for inheritance only when:

- The "is-a" relationship is real and stable (a `Dog` *is* an `Animal`).
- The base class is small and unlikely to change.
- The child genuinely refines the parent's behavior — not just borrows pieces.

When in doubt, compose.

## Calling parent constructors with `extends null`

Most subclasses extend something useful. If you write `class Foo extends null {}`, you must call `super(null)` in the constructor — it's an obscure edge case.

## Built-in subclassing

You can subclass built-ins like `Array`, `Map`, `Error`:

```javascript
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

throw new HttpError(404, "Not found");
```

Subclassing `Error` is the right way to make custom error types — `instanceof HttpError` works, the stack trace is preserved, and middleware can branch on the type.

## A real example: a small UI hierarchy

```javascript
class Component {
  constructor(el) { this.el = el; }
  mount(parent) { parent.appendChild(this.el); }
  unmount()    { this.el.remove(); }
}

class Button extends Component {
  constructor(label, onClick) {
    super(document.createElement("button"));
    this.el.textContent = label;
    this.el.addEventListener("click", onClick);
  }
}

class IconButton extends Button {
  constructor(label, icon, onClick) {
    super(label, onClick);
    this.el.prepend(icon);
  }
}
```

Small, shallow hierarchies like this work well. If you find yourself writing four or five layers, refactor toward composition.

## Next step

Both classes and `extends` are sugar over a deeper system. Time to look at the engine: prototypes.
