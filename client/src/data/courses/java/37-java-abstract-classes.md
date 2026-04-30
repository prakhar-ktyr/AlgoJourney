---
title: Java Abstract Classes
---

# Java Abstract Classes

An **abstract class** is one you can't instantiate directly — it's meant to be extended. It can mix concrete (regular) methods with **abstract** methods that have no body. Subclasses are forced to implement those.

Abstract classes sit between concrete classes and interfaces: they let you share both _state_ and _partial behaviour_ with their subclasses.

## Declaring

```java
public abstract class Shape {
    private final String name;

    protected Shape(String name) {
        this.name = name;
    }

    public String name() { return name; }

    public abstract double area();      // no body — every subclass must define
    public abstract double perimeter();
}
```

Trying to write `new Shape("blob")` is a compile error.

## Implementing in a subclass

A non-abstract subclass **must** implement every inherited abstract method:

```java
public class Circle extends Shape {
    private final double radius;
    public Circle(double r) {
        super("circle");
        this.radius = r;
    }
    @Override public double area()       { return Math.PI * radius * radius; }
    @Override public double perimeter()  { return 2 * Math.PI * radius; }
}

public class Rectangle extends Shape {
    private final double w, h;
    public Rectangle(double w, double h) {
        super("rectangle");
        this.w = w;
        this.h = h;
    }
    @Override public double area()       { return w * h; }
    @Override public double perimeter()  { return 2 * (w + h); }
}
```

A subclass that _doesn't_ implement everything is itself abstract:

```java
public abstract class Polygon extends Shape {
    public Polygon() { super("polygon"); }
    // doesn't define area() — Polygon stays abstract
}
```

## Using abstract types polymorphically

```java
Shape[] shapes = { new Circle(2), new Rectangle(3, 4) };
for (Shape s : shapes) {
    System.out.println(s.name() + ": area = " + s.area());
}
```

## Why abstract classes?

- **Share code**: subclasses inherit the concrete fields and methods.
- **Enforce a contract**: every subclass _must_ provide certain methods.
- **Express partial implementations**: e.g. a base `HttpHandler` with retry logic that delegates the actual handling to subclasses.

## Template method pattern

A classic use of abstract classes — a public method with the algorithm's _skeleton_ calls abstract steps that subclasses fill in:

```java
public abstract class Report {
    public final String render() {        // template
        return header() + body() + footer();
    }

    protected String header() { return "=== Report ===\n"; }
    protected String footer() { return "\n=== End ===";  }
    protected abstract String body();      // varies per subclass
}

public class SalesReport extends Report {
    @Override protected String body() {
        return "Total sales: $1234.56";
    }
}
```

Marking `render()` as `final` prevents subclasses from changing the overall structure.

## Abstract class vs interface

| Feature                     | Abstract class         | Interface                                           |
| --------------------------- | ---------------------- | --------------------------------------------------- |
| Multiple inheritance        | One per class          | A class can implement many                          |
| State (fields)              | Yes, with any modifier | Only `public static final` constants                |
| Constructors                | Yes                    | No                                                  |
| Method bodies               | Yes                    | Yes (since Java 8) — `default` and `static` methods |
| Access modifiers on members | Any                    | `public` (or `private` since Java 9)                |

A rule of thumb:

- Use an **interface** when you only want to express a _capability_ (`Comparable`, `Iterable`, `Runnable`).
- Use an **abstract class** when subclasses share real state or non-trivial implementation.

Often the most flexible design is an **interface** plus an **abstract base class** that implements common parts.

## A complete example

```java
public abstract class Employee {
    private final String name;

    protected Employee(String name) { this.name = name; }

    public String name() { return name; }
    public abstract double monthlyPay();

    public final String paycheck() {            // shared logic
        return name + " — $" + monthlyPay();
    }
}

public class Salaried extends Employee {
    private final double salary;
    public Salaried(String n, double s) { super(n); this.salary = s; }
    @Override public double monthlyPay() { return salary; }
}

public class Hourly extends Employee {
    private final double rate;
    private final int hours;
    public Hourly(String n, double r, int h) { super(n); this.rate = r; this.hours = h; }
    @Override public double monthlyPay() { return rate * hours; }
}

public class Demo {
    public static void main(String[] args) {
        Employee[] team = { new Salaried("Ada", 8000), new Hourly("Linus", 60, 160) };
        for (Employee e : team) System.out.println(e.paycheck());
    }
}
```

Next: **interfaces**.
