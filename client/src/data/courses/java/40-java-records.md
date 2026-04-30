---
title: Java Records
---

# Java Records

A **record** (Java 16+) is a special kind of class for **immutable data carriers** — the kind of class you'd otherwise write with private final fields, a constructor, getters, `equals`, `hashCode`, and `toString`. Records do all that for you in a single line.

## The classic boilerplate

Without records:

```java
public final class Point {
    private final int x;
    private final int y;
    public Point(int x, int y) { this.x = x; this.y = y; }
    public int x() { return x; }
    public int y() { return y; }
    @Override public boolean equals(Object o) { ... }
    @Override public int hashCode() { ... }
    @Override public String toString() { ... }
}
```

With a record:

```java
public record Point(int x, int y) { }
```

That's it. The compiler generates:

- `private final int x;` and `private final int y;`
- A canonical constructor `Point(int x, int y)`.
- Accessor methods `x()` and `y()` (note: no `get` prefix).
- `equals(Object)`, `hashCode()`, and `toString()` based on the components.

```java
Point a = new Point(1, 2);
Point b = new Point(1, 2);
System.out.println(a);            // Point[x=1, y=2]
System.out.println(a.x());        // 1
System.out.println(a.equals(b));  // true
System.out.println(a == b);       // false — different objects
```

## Records are immutable

A record's components are `final` and there are no setters. To "change" a value, create a new record:

```java
Point shifted = new Point(a.x() + 5, a.y());
```

This makes records perfect for value objects, DTOs, and cache keys — they're inherently thread-safe and compose well.

## Adding methods

Records can have any number of methods, just like a regular class:

```java
public record Point(int x, int y) {
    public double distanceTo(Point other) {
        int dx = x - other.x;
        int dy = y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
```

## Validation: compact constructor

Need to validate or normalise inputs? Use the **compact constructor** form:

```java
public record Range(int lo, int hi) {
    public Range {
        if (lo > hi) throw new IllegalArgumentException("lo > hi");
    }
}
```

Notice there's no parameter list and no field assignment — the compiler handles assignments automatically _after_ the body runs. You can mutate the parameters before they're stored:

```java
public record Email(String address) {
    public Email {
        address = address.trim().toLowerCase();
    }
}
```

## Static methods and factory constructors

```java
public record Color(int r, int g, int b) {
    public static Color black() { return new Color(0, 0, 0); }
    public static Color of(int r, int g, int b) {
        return new Color(r, g, b);
    }
}
```

You can also declare additional constructors, but they must delegate to the canonical one:

```java
public record Color(int r, int g, int b) {
    public Color(int gray) {
        this(gray, gray, gray);
    }
}
```

## Implementing interfaces

Records can implement interfaces:

```java
public record Person(String name, int age) implements Comparable<Person> {
    @Override
    public int compareTo(Person other) {
        return Integer.compare(this.age, other.age);
    }
}
```

But records cannot **extend** other classes — they implicitly extend `java.lang.Record` and are `final`.

## Pattern matching with records (Java 21+)

Records integrate beautifully with pattern matching:

```java
sealed interface Shape permits Circle, Rectangle {}
record Circle(double r) implements Shape {}
record Rectangle(double w, double h) implements Shape {}

double area(Shape s) {
    return switch (s) {
        case Circle(double r)         -> Math.PI * r * r;
        case Rectangle(double w, double h) -> w * h;
    };
}
```

Notice we deconstruct each record right in the `case` clause — no boilerplate accessors needed.

## When to use a record

- **Yes**: small, immutable bundles of data — DTOs, parsed config, coordinates, money, cache keys, multi-return values.
- **No**: classes that have substantial behaviour, hold mutable state, or need a complex inheritance hierarchy.

## A complete example

```java
public record Order(String id, String customer, double total) {
    public Order {
        if (total < 0) throw new IllegalArgumentException("total must be ≥ 0");
    }

    public Order applyDiscount(double percent) {
        return new Order(id, customer, total * (1 - percent / 100));
    }

    public static void main(String[] args) {
        Order o = new Order("A-100", "Ada", 250.0);
        Order discounted = o.applyDiscount(10);

        System.out.println(o);
        System.out.println(discounted);
        System.out.println(o.equals(discounted));   // false
    }
}
```

Output:

```
Order[id=A-100, customer=Ada, total=250.0]
Order[id=A-100, customer=Ada, total=225.0]
false
```

Next: handling errors with **exceptions**.
