---
title: Java Classes and Objects
---

# Java Classes and Objects

A **class** defines a new type. An **object** is a value of that type, created with `new`.

## Defining a class

```java
public class Car {
    String brand;
    String model;
    int year;
}
```

That's it. `Car` is now a usable type.

## Creating objects

```java
public class Demo {
    public static void main(String[] args) {
        Car a = new Car();
        a.brand = "Toyota";
        a.model = "Corolla";
        a.year  = 2022;

        Car b = new Car();
        b.brand = "Honda";
        b.model = "Civic";
        b.year  = 2024;

        System.out.println(a.brand + " " + a.model);   // Toyota Corolla
        System.out.println(b.brand + " " + b.model);   // Honda Civic
    }
}
```

`new Car()` does three things:

1. Allocates memory on the **heap** for one `Car` object.
2. Initialises every field to its default (here: `null`, `null`, `0`).
3. Returns a **reference** to the new object, which we store in `a`.

## Reference semantics

Objects are accessed through references. Assigning a reference variable copies the **reference**, not the object.

```java
Car a = new Car();
a.brand = "Toyota";

Car b = a;            // b refers to the SAME object
b.brand = "Honda";

System.out.println(a.brand);    // Honda — both names point to one object
```

`a == b` is `true` here because they reference the same object. `a == new Car()` is always `false` even if every field matches — `==` on objects compares references, not values.

## Multiple classes per file

A single `.java` file may declare any number of classes, but only **one `public` class**, and that class's name must match the file name. Other classes in the same file are _package-private_.

```java
// File: Main.java
public class Main {
    public static void main(String[] args) {
        Helper h = new Helper();
        h.greet();
    }
}

class Helper {
    void greet() { System.out.println("Hi"); }
}
```

For most projects, prefer **one class per file** — easier to find and review.

## `this` — the current object

Inside an instance method, `this` is a reference to the object the method was called on. We'll use it heavily in constructors and setters:

```java
public class Counter {
    int value;

    public void setValue(int value) {
        this.value = value;     // 'this.value' is the field, 'value' is the parameter
    }
}
```

## Static vs instance members

- **Instance** members (fields, methods) belong to _each object_.
- **`static`** members belong to the _class itself_ and are shared.

```java
public class Population {
    static int count = 0;       // shared across all Person objects

    public Population() {
        count++;
    }
}

new Population();
new Population();
new Population();
System.out.println(Population.count);   // 3 — accessed via the class
```

`main` is `static` because the JVM has no `Main` object to call it on when the program starts.

## A complete example

```java
public class Book {
    String title;
    String author;
    int pages;

    void summary() {
        System.out.println(title + " by " + author + " (" + pages + " pages)");
    }

    public static void main(String[] args) {
        Book b1 = new Book();
        b1.title  = "The Pragmatic Programmer";
        b1.author = "Hunt & Thomas";
        b1.pages  = 320;

        Book b2 = new Book();
        b2.title  = "Effective Java";
        b2.author = "Joshua Bloch";
        b2.pages  = 416;

        b1.summary();
        b2.summary();
    }
}
```

This works, but exposing every field directly is sloppy. The next lessons add proper **attributes**, **methods**, and **constructors**.
