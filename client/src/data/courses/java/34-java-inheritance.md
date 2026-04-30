---
title: Java Inheritance
---

# Java Inheritance

**Inheritance** lets a class take on the fields and methods of another class. The new class (the **subclass**) extends the existing one (the **superclass**) and may add its own members or override inherited ones.

## `extends`

```java
public class Animal {
    String name;

    public void eat() {
        System.out.println(name + " is eating");
    }
}

public class Dog extends Animal {
    public void bark() {
        System.out.println(name + " says: Woof!");
    }
}
```

```java
Dog rex = new Dog();
rex.name = "Rex";   // inherited from Animal
rex.eat();          // inherited
rex.bark();         // own method
```

`Dog` has every public/protected member of `Animal` _plus_ `bark()`.

A class can have at most **one** direct superclass — Java does not support multiple inheritance of classes (it does for interfaces, covered later).

## The class hierarchy

Every class implicitly extends **`java.lang.Object`** if you don't say otherwise. So every Java object has methods like `toString()`, `equals()`, `hashCode()`, and `getClass()`.

```
                 Object
                   │
              ┌────┼────┐
            String  Number   ...
                       │
            ┌──────┬──┴───┬──────┐
          Integer Double  Long   ...
```

## Calling a superclass constructor — `super(...)`

A subclass constructor must initialise the superclass first. If you don't write `super(...)`, the compiler inserts a call to the no-arg `super()` automatically.

```java
public class Animal {
    String name;
    public Animal(String name) { this.name = name; }
}

public class Dog extends Animal {
    String breed;
    public Dog(String name, String breed) {
        super(name);                // call Animal(String)
        this.breed = breed;
    }
}
```

If the superclass has _no_ no-arg constructor, you **must** call `super(...)` explicitly. `super(...)` must be the **first statement** in the constructor body.

## Method overriding

A subclass can replace an inherited method by defining one with the same signature. Mark it with `@Override` so the compiler verifies you really are overriding something.

```java
public class Animal {
    public String sound() { return "generic animal noise"; }
}

public class Dog extends Animal {
    @Override
    public String sound() { return "Woof!"; }
}

public class Cat extends Animal {
    @Override
    public String sound() { return "Meow"; }
}
```

```java
Animal a = new Dog();
System.out.println(a.sound());   // Woof!  — calls Dog's version
```

This is **polymorphism** at work — covered in detail in the next lesson.

## Calling the superclass version — `super.method(...)`

Inside an overriding method, `super` lets you reuse the parent's behaviour:

```java
public class Logger {
    public void log(String msg) {
        System.out.println("[INFO] " + msg);
    }
}

public class TimestampLogger extends Logger {
    @Override
    public void log(String msg) {
        super.log("[" + System.currentTimeMillis() + "] " + msg);
    }
}
```

## What is inherited?

| Member type                             | Inherited?                                                                               |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `public` / `protected` fields & methods | Yes                                                                                      |
| Package-private members                 | Only if the subclass is in the same package                                              |
| `private` members                       | No (the subclass can use them only via inherited public/protected getters)               |
| Constructors                            | **No** — but you call them with `super(...)`                                             |
| `static` members                        | Inherited but not polymorphic — they're tied to the declared class, not the runtime type |

## `final` blocks inheritance

- A `final` **method** cannot be overridden.
- A `final` **class** cannot be extended.

```java
public final class String { ... }     // why you can't subclass String
```

## "Is-a" vs "has-a"

Inheritance models **"is-a"**: a `Dog` is an `Animal`. If the relationship is **"has-a"**, prefer **composition** instead — store the other object as a field:

```java
// Composition: a Car HAS-A Engine, not IS-A Engine.
public class Car {
    private final Engine engine;
    public Car(Engine engine) { this.engine = engine; }
    public void start() { engine.ignite(); }
}
```

Composition is more flexible than inheritance. A common rule: _prefer composition over inheritance_ unless an "is-a" relationship genuinely fits.

## A complete example

```java
public class Vehicle {
    String name;
    int maxSpeed;

    public Vehicle(String name, int maxSpeed) {
        this.name = name;
        this.maxSpeed = maxSpeed;
    }

    public void describe() {
        System.out.println(name + " (max " + maxSpeed + " km/h)");
    }
}

public class Car extends Vehicle {
    int wheels;

    public Car(String name, int maxSpeed) {
        super(name, maxSpeed);
        this.wheels = 4;
    }

    @Override
    public void describe() {
        super.describe();
        System.out.println("  wheels: " + wheels);
    }
}

public class Demo {
    public static void main(String[] args) {
        Car c = new Car("Civic", 200);
        c.describe();
    }
}
```

```
Civic (max 200 km/h)
  wheels: 4
```

Next: **polymorphism** — using parent types to handle many child types uniformly.
