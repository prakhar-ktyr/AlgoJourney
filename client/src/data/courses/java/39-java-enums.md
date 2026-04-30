---
title: Java Enums
---

# Java Enums

An **enum** is a class with a **fixed, finite set of named instances**. Use one whenever a variable should hold one value out of a small, well-known list — days of the week, traffic-light colours, HTTP methods, log levels, …

## Declaring a basic enum

```java
public enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}
```

```java
Day today = Day.WEDNESDAY;
System.out.println(today);            // WEDNESDAY
System.out.println(today.name());     // "WEDNESDAY"
System.out.println(today.ordinal());  // 2 — zero-based position
```

## Why enums beat constants

Compare:

```java
public static final int MONDAY = 0;
public static final int TUESDAY = 1;
// ...
int day = 7;       // compiler is fine with that — but 7 isn't a valid day!
```

vs.

```java
Day day = Day.MONDAY;
day = 7;           // ❌ compile error
```

Enums are **type-safe**: you can't pass a number where a `Day` is expected, you can't typo a name without the compiler noticing, and they print themselves nicely.

## Iterating

```java
for (Day d : Day.values()) {
    System.out.println(d);
}
```

`values()` returns an array in declaration order. `valueOf("MONDAY")` looks one up by name (throws `IllegalArgumentException` for invalid names).

## In `switch`

Enums work especially well with `switch`:

```java
String tag = switch (today) {
    case SATURDAY, SUNDAY  -> "weekend";
    case FRIDAY            -> "almost weekend";
    default                -> "weekday";
};
```

Inside a `switch` you can use the unqualified name (`SATURDAY`, not `Day.SATURDAY`).

## Enums with fields and methods

Enums are real classes — they can have fields, constructors, and methods.

```java
public enum Planet {
    MERCURY(3.303e+23, 2.4397e6),
    VENUS  (4.869e+24, 6.0518e6),
    EARTH  (5.976e+24, 6.37814e6),
    MARS   (6.421e+23, 3.3972e6);

    private final double mass;     // kg
    private final double radius;   // m

    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
    }

    public double surfaceGravity() {
        final double G = 6.67300E-11;
        return G * mass / (radius * radius);
    }
}
```

```java
for (Planet p : Planet.values()) {
    System.out.printf("%-7s g = %.2f%n", p, p.surfaceGravity());
}
```

The constructor is implicitly `private` — you cannot create new enum values from outside.

## Per-constant method bodies

You can give each enum value its own implementation by using an anonymous-class-style body:

```java
public enum Operation {
    PLUS  { public int apply(int a, int b) { return a + b; } },
    MINUS { public int apply(int a, int b) { return a - b; } },
    TIMES { public int apply(int a, int b) { return a * b; } },
    DIV   { public int apply(int a, int b) { return a / b; } };

    public abstract int apply(int a, int b);
}

System.out.println(Operation.PLUS.apply(3, 4));   // 7
```

## Enums implement interfaces

```java
public interface Describable {
    String describe();
}

public enum Status implements Describable {
    OK    { public String describe() { return "all good"; } },
    WARN  { public String describe() { return "be careful"; } },
    ERROR { public String describe() { return "broken"; } }
}
```

## `EnumSet` and `EnumMap`

Specialised collections optimised for enum keys/values:

```java
import java.util.EnumSet;
EnumSet<Day> weekend = EnumSet.of(Day.SATURDAY, Day.SUNDAY);
weekend.contains(Day.MONDAY);   // false

import java.util.EnumMap;
EnumMap<Day, String> labels = new EnumMap<>(Day.class);
labels.put(Day.MONDAY, "💼");
```

These are much faster and smaller than `HashSet<Day>` / `HashMap<Day, ...>` and are the right default for enum collections.

## Singletons via enum

A single-element enum is the simplest, safest way to declare a singleton:

```java
public enum Config {
    INSTANCE;
    public String name() { return "global config"; }
}

Config.INSTANCE.name();
```

The JVM guarantees exactly one instance — even reflection and serialization can't break it.

## A complete example

```java
public enum LogLevel {
    DEBUG(10), INFO(20), WARN(30), ERROR(40);

    private final int severity;

    LogLevel(int severity) { this.severity = severity; }

    public boolean isAtLeast(LogLevel other) {
        return this.severity >= other.severity;
    }

    public static void main(String[] args) {
        LogLevel current = INFO;

        for (LogLevel l : values()) {
            if (l.isAtLeast(current)) {
                System.out.println("would log: " + l);
            }
        }
    }
}
```

Next: **records** — concise immutable data carriers.
