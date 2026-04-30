---
title: Java Method Overloading
---

# Java Method Overloading

**Overloading** lets you define several methods with the **same name** but different parameter lists. Java picks the right one at compile time based on the arguments you pass.

## A simple example

```java
public class Calc {
    public static int add(int a, int b) {
        return a + b;
    }

    public static double add(double a, double b) {
        return a + b;
    }

    public static int add(int a, int b, int c) {
        return a + b + c;
    }
}
```

```java
Calc.add(2, 3);          // calls add(int, int)        → 5
Calc.add(2.5, 3.5);      // calls add(double, double)  → 6.0
Calc.add(1, 2, 3);       // calls add(int, int, int)   → 6
```

## What can differ?

The methods must differ in their **parameter list** — number of parameters, their types, or their order:

```java
void log(String msg) { ... }
void log(String msg, int level) { ... }
void log(int level, String msg) { ... }
```

What does **not** count as overloading:

- Different return types alone — `int foo()` and `double foo()` is a compile error.
- Different parameter names — `add(int a, int b)` and `add(int x, int y)` are the same signature.
- Different access modifiers.

## Why overload?

It lets callers use one familiar name with whatever data they have:

```java
Math.max(3, 5);
Math.max(3.0, 5.0);
Math.max(3L, 5L);
Math.max(3f, 5f);
```

These are four overloads of `Math.max`.

## Overloading and type promotion

If no overload matches the arguments exactly, Java tries to promote them (widening conversion):

```java
public static void print(double d) { System.out.println("double: " + d); }
public static void print(long l)   { System.out.println("long:   " + l); }

print(42);    // long: 42   (int → long is preferred over int → double)
```

The exact rules can get subtle. When in doubt, cast explicitly to make the call unambiguous:

```java
print((double) 42);   // double: 42.0
```

## Overloading with varargs

```java
public static void greet(String name) {
    System.out.println("Hi, " + name);
}

public static void greet(String... names) {
    for (String n : names) System.out.println("Hi, " + n);
}
```

The compiler prefers the more specific (non-varargs) overload when both could match:

```java
greet("Ada");           // "Hi, Ada"  — uses greet(String)
greet("Ada", "Linus");   // uses greet(String...)
```

## Overloading vs overriding

These two terms sound similar but mean very different things:

- **Overloading** = same name, different signatures, in the **same** class.
- **Overriding** = a subclass redefines a method inherited from its parent (covered in the **Inheritance** lesson).

## Best practices

- Overload only when methods do the **same conceptual thing** with different inputs. Don't overload `process(int)` and `process(String)` if they do unrelated jobs — give them different names.
- Avoid overloads where the only difference is one being primitive and the other its wrapper (`int` vs `Integer`) — autoboxing makes the choice surprising.

## A complete example

```java
public class Format {
    public static String format(int n) {
        return "int=" + n;
    }
    public static String format(double n) {
        return String.format("double=%.2f", n);
    }
    public static String format(String s) {
        return "str=\"" + s + "\"";
    }
    public static String format(Object o) {
        return "obj=" + (o == null ? "null" : o.toString());
    }

    public static void main(String[] args) {
        System.out.println(format(7));
        System.out.println(format(3.14159));
        System.out.println(format("hi"));
        System.out.println(format((Object) null));
    }
}
```

Next: variable **scope**.
