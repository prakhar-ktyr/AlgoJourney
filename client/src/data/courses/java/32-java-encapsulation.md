---
title: Java Encapsulation
---

# Java Encapsulation

**Encapsulation** is the OOP principle of keeping an object's data **private** and exposing it only through well-defined methods. The class controls _what_ outside code can do with its state — and _can validate_ every change.

## The pattern: private fields + getters/setters

```java
public class Person {
    private String name;        // hidden
    private int age;             // hidden

    public String getName() { return name; }
    public void setName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name required");
        }
        this.name = name;
    }

    public int getAge() { return age; }
    public void setAge(int age) {
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("invalid age");
        }
        this.age = age;
    }
}
```

The world only sees the `getName` / `setName` API. The `name` field could be renamed or stored differently tomorrow without breaking any caller.

## Naming convention (JavaBeans)

For a field `xyz` of type `T`:

- Getter: `T getXyz()`
- Setter: `void setXyz(T value)`
- Boolean fields use `isXyz()` instead of `getXyz()`.

This convention isn't required by the language, but is followed by countless frameworks (Spring, JPA, Jackson, …).

## Read-only fields

Provide a getter, no setter:

```java
public class Order {
    private final String id;
    private final long createdAt;

    public Order(String id) {
        this.id = id;
        this.createdAt = System.currentTimeMillis();
    }

    public String getId()        { return id; }
    public long   getCreatedAt() { return createdAt; }
}
```

Combined with `final` fields, this gives **immutability** — the object can never change after construction. Immutable objects are inherently thread-safe and easier to reason about.

## Validating in setters

Setters are the perfect place to enforce **invariants** — rules that must always hold:

```java
public class Temperature {
    private double celsius;

    public void setCelsius(double celsius) {
        if (celsius < -273.15) {
            throw new IllegalArgumentException("below absolute zero");
        }
        this.celsius = celsius;
    }
}
```

Without encapsulation, anyone could write `t.celsius = -1000` and silently corrupt your program.

## Hiding implementation choices

Encapsulation means you can change _how_ the data is stored:

```java
public class Temperature {
    private double kelvin;       // store internally as kelvin

    public double getCelsius()              { return kelvin - 273.15; }
    public void   setCelsius(double c)      { this.kelvin = c + 273.15; }
    public double getFahrenheit()           { return kelvin * 9/5 - 459.67; }
    public void   setFahrenheit(double f)   { this.kelvin = (f + 459.67) * 5/9; }
}
```

Callers don't know — or care — what unit you store. They just use the API.

## Don't expose mutable internals

Returning a reference to your internal data lets callers mutate it behind your back:

```java
public class Team {
    private final List<String> members = new ArrayList<>();

    public List<String> getMembers() { return members; }    // ❌ caller can clear()
}
```

Two safer patterns:

```java
public List<String> getMembers() {
    return List.copyOf(members);                            // ✅ defensive copy (immutable)
}
public List<String> getMembers() {
    return Collections.unmodifiableList(members);           // ✅ read-only view
}
```

Apply the same care to fields holding arrays, dates, or any mutable object.

## When you don't need accessors

Sometimes a small package-private _value_ class with `public` fields is fine — for example a private `Pair` used only inside one package. Don't over-engineer. Encapsulation is a tool, not a religion.

For straightforward immutable data, **records** (a later lesson) make accessors generate themselves.

## A complete example

```java
public class Stopwatch {
    private long startTime;
    private long endTime;
    private boolean running;

    public void start() {
        if (running) throw new IllegalStateException("already running");
        startTime = System.nanoTime();
        running = true;
    }

    public void stop() {
        if (!running) throw new IllegalStateException("not running");
        endTime = System.nanoTime();
        running = false;
    }

    public long elapsedNanos() {
        long end = running ? System.nanoTime() : endTime;
        return end - startTime;
    }

    public double elapsedMillis() {
        return elapsedNanos() / 1_000_000.0;
    }

    public boolean isRunning() { return running; }
}
```

Notice: no `getStartTime` or `setRunning`. The class exposes only meaningful operations.

Next: organising code with **packages**.
