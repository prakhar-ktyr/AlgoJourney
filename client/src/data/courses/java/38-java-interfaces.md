---
title: Java Interfaces
---

# Java Interfaces

An **interface** is a pure contract: a set of method signatures that any implementing class promises to provide. Interfaces are the foundation of polymorphic, decoupled Java code.

## Declaring an interface

```java
public interface Drawable {
    void draw();          // implicitly public abstract
}
```

By default, every method declared in an interface is `public abstract`. You can omit those modifiers — they're implied.

## Implementing an interface

A class uses `implements` and provides bodies for every method:

```java
public class Circle implements Drawable {
    @Override
    public void draw() {
        System.out.println("○");
    }
}

public class Square implements Drawable {
    @Override
    public void draw() {
        System.out.println("□");
    }
}
```

A class can implement **many** interfaces (separated by commas) — this is Java's answer to multiple inheritance.

```java
public class FancyShape implements Drawable, Comparable<FancyShape> {
    @Override public void draw() { ... }
    @Override public int compareTo(FancyShape other) { ... }
}
```

## Interface = type

Once you declare an interface, you have a new **type** you can program against:

```java
Drawable d = new Circle();
d.draw();                // calls Circle.draw()

Drawable[] shapes = { new Circle(), new Square(), new Circle() };
for (Drawable s : shapes) s.draw();
```

This decouples the code from any particular implementation — the holy grail of flexible design.

## `default` methods

Since Java 8, an interface can include **`default`** methods with a body. Implementing classes inherit them automatically and may override them.

```java
public interface Greeter {
    String name();

    default String greet() {
        return "Hello, " + name() + "!";
    }
}

public class Person implements Greeter {
    private final String name;
    public Person(String n) { this.name = n; }
    @Override public String name() { return name; }
}

new Person("Ada").greet();   // "Hello, Ada!" — uses the default
```

Defaults let interfaces evolve without breaking existing implementations.

## `static` methods

Interfaces can also contain `static` helper methods (called via the interface name):

```java
public interface Validator<T> {
    boolean isValid(T value);

    static <T> Validator<T> alwaysTrue() {
        return v -> true;
    }
}

Validator<String> v = Validator.alwaysTrue();
```

## `private` methods (Java 9+)

For shared logic among `default`/`static` methods that you don't want to expose:

```java
public interface Logger {
    default void info(String msg)  { log("INFO",  msg); }
    default void error(String msg) { log("ERROR", msg); }

    private void log(String level, String msg) {
        System.out.println("[" + level + "] " + msg);
    }
}
```

## Constants

Every field in an interface is implicitly `public static final`:

```java
public interface PhysicsConstants {
    double SPEED_OF_LIGHT = 299_792_458;
    double GRAVITY = 9.81;
}
```

(Putting random constants in an interface is generally discouraged — use a `final class` with private constructor instead.)

## Interface inheritance

An interface can `extends` other interfaces (note: `extends`, not `implements`) — and any number of them:

```java
interface Readable { String read(); }
interface Writable { void write(String s); }
interface ReadWrite extends Readable, Writable { }
```

A class implementing `ReadWrite` must provide bodies for both `read()` and `write()`.

## Functional interfaces

An interface with **exactly one abstract method** is a _functional interface_ and can be implemented inline with a **lambda**:

```java
@FunctionalInterface
public interface IntFn {
    int apply(int x);
}

IntFn square = x -> x * x;
System.out.println(square.apply(5));   // 25
```

Lambdas are covered in their own lesson — they make interfaces incredibly lightweight to use.

## Marker interfaces

Some interfaces have _no_ methods. Implementing one tags the class with a property the runtime can check:

```java
public class Person implements java.io.Serializable { ... }
```

(Marker interfaces are less common today — annotations often serve the same purpose.)

## Interface vs abstract class — quick recap

- **Interface** = capability/contract; multiple inheritance allowed; no per-instance state.
- **Abstract class** = partial implementation with shared state; only one allowed per subclass.

It's common to use both: an interface defines the contract, an abstract base class supplies common implementation.

## A complete example

```java
public interface Animal {
    String sound();

    default String describe() {
        return "An animal that says: " + sound();
    }
}

public class Dog implements Animal {
    @Override public String sound() { return "Woof"; }
}

public class Cat implements Animal {
    @Override public String sound() { return "Meow"; }
}

public class Demo {
    public static void main(String[] args) {
        Animal[] zoo = { new Dog(), new Cat() };
        for (Animal a : zoo) System.out.println(a.describe());
    }
}
```

Next: **enums**.
