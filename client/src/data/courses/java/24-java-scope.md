---
title: Java Scope
---

# Java Scope

The **scope** of a variable is the region of code where its name is visible. Java has four main scopes.

## 1. Block scope

A variable declared inside `{ ... }` exists only inside those braces.

```java
{
    int x = 5;
    System.out.println(x);   // OK
}
System.out.println(x);       // ❌ compile error: x is out of scope
```

This applies to `if`, `for`, `while`, and any `{}` block, not just methods.

## 2. Loop scope

The loop variable in a classic `for` exists only inside the loop:

```java
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}
System.out.println(i);   // ❌ i no longer exists
```

## 3. Method (local) scope

A variable declared inside a method exists only until the method returns. It is created fresh on every call.

```java
public static int square(int n) {
    int result = n * n;     // local
    return result;
}
```

Parameters are local variables too.

## 4. Class (field) scope

A variable declared inside a class but outside any method is a **field**. It belongs to the object (or class, if `static`) and is visible everywhere in the class.

```java
public class Counter {
    private int count = 0;       // instance field

    public void increment() {
        count++;                 // visible here
    }

    public int value() {
        return count;            // and here
    }
}
```

## Shadowing

A local variable or parameter can have the **same name** as a field — it then "shadows" the field inside the method:

```java
public class Person {
    private String name;

    public void setName(String name) {     // parameter named 'name'
        // 'name' here refers to the parameter, not the field
        this.name = name;                  // 'this.name' is the field
    }
}
```

`this` always refers to the current object. Use `this.field` when a parameter or local has the same name.

## `static` vs instance scope

A `static` field is shared across **all instances**. An instance field has its own copy per object.

```java
public class Idgen {
    private static int next = 1;     // shared
    private final int id;            // per-object

    public Idgen() {
        this.id = next++;
    }

    public int id() { return id; }
}

Idgen a = new Idgen();   // a.id() == 1
Idgen b = new Idgen();   // b.id() == 2
Idgen c = new Idgen();   // c.id() == 3
```

## Lifetime ≠ scope

- **Scope** is _where the name is visible_ (a compile-time concept).
- **Lifetime** is _how long the value exists in memory_ (a runtime concept).

A local variable's lifetime ends when its method returns. A field's lifetime is tied to the object that owns it; a `static` field's lifetime is the whole program.

## Best practices

- Declare variables in the **smallest scope** that works. The closer the declaration to the use, the easier the code is to read.
- Avoid name reuse where it confuses (e.g. naming a local exactly like a field except in setters).
- Prefer **`final`** local variables when they aren't reassigned — it documents intent.

## A complete example

```java
public class ScopeDemo {
    static int classWide = 100;     // visible to every method in the class

    public static void main(String[] args) {
        int local = 1;

        for (int i = 0; i < 3; i++) {
            int loopOnly = i * 2;   // exists only inside the loop body
            System.out.println(local + classWide + loopOnly);
        }

        // System.out.println(loopOnly);  // ❌ out of scope
        System.out.println(local);        // ✅ still in scope
    }
}
```

Next: **recursion**.
