---
title: Java Constructors
---

# Java Constructors

A **constructor** runs when an object is created with `new`. Its job is to put the new object into a valid initial state.

## Anatomy of a constructor

A constructor:

- Has the **same name** as its class.
- Has **no return type** (not even `void`).
- May take parameters, like a method.

```java
public class Person {
    String name;
    int age;

    public Person(String name, int age) {     // constructor
        this.name = name;
        this.age = age;
    }
}

Person p = new Person("Ada", 30);
```

`new Person("Ada", 30)` allocates the object, runs the constructor, and returns the reference.

## The default (no-arg) constructor

If you write **no constructor**, Java provides a default `public ClassName()` that does nothing:

```java
public class Empty { }
Empty e = new Empty();    // works — uses the synthetic default
```

But once you declare _any_ constructor, the default goes away:

```java
public class Person {
    String name;
    public Person(String name) { this.name = name; }
}

new Person();    // ❌ compile error — no no-arg constructor exists
```

If you still want a no-arg constructor, **declare it explicitly**.

## Multiple constructors (overloading)

Constructors can be overloaded just like methods — same name, different parameter lists.

```java
public class Person {
    String name;
    int age;

    public Person() {
        this.name = "Anonymous";
        this.age  = 0;
    }

    public Person(String name) {
        this.name = name;
        this.age  = 0;
    }

    public Person(String name, int age) {
        this.name = name;
        this.age  = age;
    }
}
```

## `this(...)` — calling another constructor

Avoid duplicating initialisation logic by chaining:

```java
public class Person {
    String name;
    int age;

    public Person() {
        this("Anonymous", 0);
    }

    public Person(String name) {
        this(name, 0);
    }

    public Person(String name, int age) {
        this.name = name;
        this.age  = age;
    }
}
```

Rules:

- `this(...)` must be the **first statement** in the constructor.
- A constructor cannot call itself directly or indirectly (no cycles).

## Validating in constructors

Use the constructor as a guard against bad input:

```java
public Person(String name, int age) {
    if (name == null || name.isBlank()) {
        throw new IllegalArgumentException("name required");
    }
    if (age < 0) {
        throw new IllegalArgumentException("age cannot be negative");
    }
    this.name = name;
    this.age  = age;
}
```

If the constructor throws, no object is created.

## `final` fields and constructors

`final` fields must be initialised exactly once — either at declaration or in **every** constructor:

```java
public class Person {
    final String id;

    public Person(String id) {
        this.id = id;       // required
    }
}
```

`final` is a great signal that an object's state can't be changed later — the cornerstone of _immutability_.

## Constructor vs method

| Constructor         | Method                        |
| ------------------- | ----------------------------- |
| Same name as class  | Any name                      |
| No return type      | Has a return type (or `void`) |
| Called by `new`     | Called on an object/class     |
| Cannot be inherited | Can be inherited & overridden |

## Static factory methods

A common alternative to public constructors is a **static factory method** that returns a new instance:

```java
public class Color {
    private final int r, g, b;

    private Color(int r, int g, int b) { this.r = r; this.g = g; this.b = b; }

    public static Color of(int r, int g, int b) { return new Color(r, g, b); }
    public static Color black() { return new Color(0, 0, 0); }
    public static Color white() { return new Color(255, 255, 255); }
}

Color red = Color.of(255, 0, 0);
Color w   = Color.white();
```

Factories can have meaningful names, return cached instances, or return subclasses.

## A complete example

```java
public class Rectangle {
    private final double width, height;

    public Rectangle(double width, double height) {
        if (width <= 0 || height <= 0) {
            throw new IllegalArgumentException("sides must be positive");
        }
        this.width = width;
        this.height = height;
    }

    public Rectangle(double side) {       // square
        this(side, side);
    }

    public double area() { return width * height; }

    public static void main(String[] args) {
        Rectangle r = new Rectangle(4, 5);
        Rectangle s = new Rectangle(3);     // 3×3 square via constructor chaining

        System.out.println(r.area());        // 20.0
        System.out.println(s.area());        // 9.0
    }
}
```

Next: **modifiers** like `public`, `private`, and `static`.
