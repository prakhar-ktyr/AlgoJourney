---
title: Java Polymorphism
---

# Java Polymorphism

**Polymorphism** ("many forms") means a single piece of code can work with many different types — provided they share a common parent class or interface.

## The basic idea

A reference variable's _declared_ type determines what you can call on it. Its _actual_ runtime type determines which method body actually runs (for overridden methods).

```java
class Animal { public String sound() { return "..."; } }
class Dog extends Animal { @Override public String sound() { return "Woof"; } }
class Cat extends Animal { @Override public String sound() { return "Meow"; } }

Animal a = new Dog();         // declared Animal, actually Dog
System.out.println(a.sound()); // Woof
```

The compiler sees `a` as an `Animal` and only lets you call methods declared on `Animal`. At runtime, the JVM dispatches `sound()` to `Dog`'s implementation. This is called **dynamic dispatch** or **late binding**.

## Why is this useful?

Code written in terms of the parent type works for any subclass — including subclasses you haven't written yet.

```java
public static void chorus(Animal[] animals) {
    for (Animal a : animals) {
        System.out.println(a.sound());
    }
}

chorus(new Animal[]{ new Dog(), new Cat(), new Dog() });
```

Add a new `Cow extends Animal` tomorrow — `chorus` already supports it without a single change.

## Polymorphism through interfaces

Interfaces (covered in detail soon) are the most flexible source of polymorphism:

```java
interface Shape {
    double area();
}

class Circle implements Shape {
    double r;
    Circle(double r) { this.r = r; }
    public double area() { return Math.PI * r * r; }
}

class Square implements Shape {
    double side;
    Square(double s) { this.side = s; }
    public double area() { return side * side; }
}

double total = 0;
for (Shape s : List.of(new Circle(2), new Square(3))) {
    total += s.area();
}
```

`for (Shape s : ...)` doesn't care about the concrete classes.

## Upcasting and downcasting

**Upcasting** to a parent type is automatic and always safe:

```java
Animal a = new Dog();   // implicit upcast
```

**Downcasting** back to the subtype needs a cast and may fail at runtime:

```java
Animal a = new Dog();
Dog d = (Dog) a;         // OK
Cat c = (Cat) a;         // ❌ ClassCastException
```

Use `instanceof` (or its pattern form) to check first:

```java
if (a instanceof Dog d) {
    d.bark();
}
```

## Overriding rules

When overriding an inherited method, the subclass version must:

- Have the **same name and parameter types**.
- Have a **compatible return type** (the same, or a subtype — _covariant_ return).
- Be **at least as accessible** (you can widen `protected` → `public`, never narrow).
- Throw **no broader checked exceptions** than the parent.

The `@Override` annotation makes the compiler enforce the first rule and is highly recommended.

## Static methods are NOT polymorphic

```java
class Parent { public static String who() { return "Parent"; } }
class Child  extends Parent { public static String who() { return "Child"; } }

Parent p = new Child();
System.out.println(p.who());   // "Parent"  (static dispatch by declared type)
```

This is "method **hiding**", not overriding. Don't override static methods — call them through the class name to avoid confusion.

## Fields are NOT polymorphic either

Field access is always resolved at compile time using the declared type:

```java
class A { String name = "A"; }
class B extends A { String name = "B"; }

A a = new B();
System.out.println(a.name);    // "A"
```

Always use methods (getters), not direct field access on a parent reference.

## Polymorphism + factory methods

A common pattern: a method's _declared_ return type is an interface, but it returns whichever concrete implementation suits the inputs.

```java
public static Shape parse(String input) {
    if (input.startsWith("circle ")) {
        return new Circle(Double.parseDouble(input.substring(7)));
    }
    if (input.startsWith("square ")) {
        return new Square(Double.parseDouble(input.substring(7)));
    }
    throw new IllegalArgumentException("unknown shape: " + input);
}

Shape s = parse("circle 2.5");   // caller works against Shape, not Circle
```

## A complete example

```java
abstract class Employee {
    String name;
    Employee(String name) { this.name = name; }
    abstract double monthlyPay();
}

class Salaried extends Employee {
    double salary;
    Salaried(String n, double s) { super(n); salary = s; }
    @Override double monthlyPay() { return salary; }
}

class Hourly extends Employee {
    double rate;
    int hours;
    Hourly(String n, double r, int h) { super(n); rate = r; hours = h; }
    @Override double monthlyPay() { return rate * hours; }
}

public class Payroll {
    public static double total(Employee[] employees) {
        double t = 0;
        for (Employee e : employees) t += e.monthlyPay();
        return t;
    }

    public static void main(String[] args) {
        Employee[] team = {
            new Salaried("Ada", 8000),
            new Hourly("Linus", 60, 160),
        };
        System.out.println("Payroll: " + total(team));
    }
}
```

Next: **inner classes**.
