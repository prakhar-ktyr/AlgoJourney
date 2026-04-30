---
title: Java Class Methods
---

# Java Class Methods

Fields hold an object's _state_. **Methods** define its _behaviour_.

## Instance methods

Declared like the methods you've already written, but **without** `static`. They are called on an object and have access to that object's fields.

```java
public class Counter {
    private int count = 0;

    public void increment() {
        count++;
    }

    public void reset() {
        count = 0;
    }

    public int value() {
        return count;
    }
}
```

```java
Counter c = new Counter();
c.increment();
c.increment();
c.increment();
System.out.println(c.value());   // 3
c.reset();
System.out.println(c.value());   // 0
```

`c.increment()` runs the method _on `c`_ — `count++` increments `c`'s field, not some other object's.

## `this`

Inside an instance method, `this` refers to the object the method was called on. You usually don't need to write it (`count` and `this.count` mean the same field), but it's required when a parameter shadows a field:

```java
public void setCount(int count) {
    this.count = count;
}
```

## Static methods

Declared with `static`. They belong to the class, not to any object. They **cannot** access instance fields directly because there is no `this`.

```java
public class MathUtil {
    public static int square(int n) {
        return n * n;
    }
}

int s = MathUtil.square(5);    // call on the class
```

Use `static` for utility methods that don't need an object's state, or for factory-like constructors.

## Calling other methods

Inside a class, instance methods can freely call other instance and static methods:

```java
public class Greeter {
    private String name;

    public Greeter(String name) { this.name = name; }

    public void greet() {
        System.out.println(formatGreeting());
    }

    private String formatGreeting() {
        return "Hello, " + name + "!";
    }
}
```

A static method can call other static methods, but to call an instance method it needs an instance:

```java
public class Util {
    public static void main(String[] args) {
        Greeter g = new Greeter("Ada");
        g.greet();
    }
}
```

## Returning values

A method's return type can be:

- A primitive (`int`, `double`, …).
- A reference type (`String`, `Person`, `int[]`, …).
- `void` — no return value. Use `return;` to exit early.
- Even the **same class** — useful for "fluent" / chainable APIs:

```java
public class Builder {
    private StringBuilder sb = new StringBuilder();

    public Builder add(String part) {
        sb.append(part);
        return this;             // enables chaining
    }

    public String build() { return sb.toString(); }
}

String s = new Builder().add("Hello, ").add("world").build();
```

## Method visibility

The same access modifiers as fields apply: `public`, `protected`, package-private (default), `private`. Hide internal helpers behind `private` so callers don't depend on them.

## `toString`, `equals`, and `hashCode`

Every class inherits these methods from `java.lang.Object`. Override them so your class plays nicely with `println`, collections, and `==`-by-content checks.

```java
public class Point {
    private final int x, y;
    public Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public String toString() {
        return "(" + x + ", " + y + ")";
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Point p)) return false;
        return x == p.x && y == p.y;
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(x, y);
    }
}
```

`@Override` tells the compiler to verify you really are overriding a method — typo-proof.

## A complete example

```java
public class Rectangle {
    private double width, height;

    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    public double area() {
        return width * height;
    }

    public double perimeter() {
        return 2 * (width + height);
    }

    public boolean isSquare() {
        return width == height;
    }

    @Override
    public String toString() {
        return "Rectangle(" + width + " × " + height + ")";
    }

    public static void main(String[] args) {
        Rectangle r = new Rectangle(4, 5);
        System.out.println(r);                // Rectangle(4.0 × 5.0)
        System.out.println("area = " + r.area());
        System.out.println("isSquare? " + r.isSquare());
    }
}
```

Next: **constructors** — controlling how objects are born.
