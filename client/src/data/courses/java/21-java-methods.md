---
title: Java Methods
---

# Java Methods

A **method** is a named, reusable block of code. Methods take inputs (parameters), do something, and optionally return a value.

You've already used methods (`System.out.println`, `Math.sqrt`) and seen one of your own (`main`). Now we'll write our own.

## Defining a method

```java
modifiers returnType name(paramType paramName, ...) {
    // body
    return value;     // if returnType is not void
}
```

A small example:

```java
public class Greeter {
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }

    public static void main(String[] args) {
        String msg = greet("Ada");
        System.out.println(msg);   // Hello, Ada!
    }
}
```

Pieces of `public static String greet(String name)`:

- `public` — accessible to other classes.
- `static` — belongs to the class itself, no object required (more on this in **Classes**).
- `String` — return type.
- `greet` — method name.
- `(String name)` — parameter list.

## `void` methods (no return value)

```java
public static void shout(String text) {
    System.out.println(text.toUpperCase() + "!");
}

shout("hello");   // HELLO!
```

A `void` method can still use `return;` to exit early:

```java
public static void greet(String name) {
    if (name == null || name.isEmpty()) return;
    System.out.println("Hello, " + name);
}
```

## Calling methods

- A **`static`** method on the same class: `methodName(args)`.
- A **`static`** method on another class: `ClassName.methodName(args)`.
- An **instance** method: `someObject.methodName(args)` (covered in **Classes**).

```java
double r = Math.sqrt(16);                     // static, other class
String s = greet("Ada");                       // static, same class
int len = "hello".length();                    // instance, on a String
```

## Multiple return paths

A method can have several `return` statements:

```java
public static String classify(int n) {
    if (n > 0) return "positive";
    if (n < 0) return "negative";
    return "zero";
}
```

The compiler insists every code path returns something for non-`void` methods.

## Methods can call methods

```java
public static int square(int x) {
    return x * x;
}

public static int sumOfSquares(int a, int b) {
    return square(a) + square(b);
}
```

## Why use methods?

1. **Reuse** — write the logic once, call it from many places.
2. **Naming** — a well-named method documents _what_ a chunk of code does.
3. **Decomposition** — break big problems into small, testable pieces.
4. **Abstraction** — callers don't need to know _how_ it works.

Aim for short methods (one screenful or less) that do **one thing**.

## A complete example

```java
public class Stats {
    public static int sum(int[] xs) {
        int total = 0;
        for (int x : xs) total += x;
        return total;
    }

    public static double mean(int[] xs) {
        return (double) sum(xs) / xs.length;
    }

    public static int max(int[] xs) {
        int best = xs[0];
        for (int x : xs) if (x > best) best = x;
        return best;
    }

    public static void main(String[] args) {
        int[] data = {5, 2, 9, 1, 7, 3};
        System.out.println("sum  = " + sum(data));
        System.out.println("mean = " + mean(data));
        System.out.println("max  = " + max(data));
    }
}
```

Next: more on **method parameters**.
