---
title: Java Recursion
---

# Java Recursion

A method that calls **itself** is **recursive**. Recursion is a natural fit for problems that can be defined in terms of smaller versions of themselves (factorials, Fibonacci, tree traversals, file-system walks, …).

## Anatomy of a recursive method

Every correct recursion has two parts:

1. **Base case** — a condition under which the method returns directly, _without_ recursing.
2. **Recursive case** — the method calls itself with a _smaller_ problem, then combines the result.

Without a base case, the method would call itself forever and crash with `StackOverflowError`.

## Classic example: factorial

`n! = n × (n-1) × … × 1`, with `0! = 1`.

```java
public static long factorial(int n) {
    if (n < 0) throw new IllegalArgumentException("n must be ≥ 0");
    if (n <= 1) return 1;                  // base case
    return n * factorial(n - 1);           // recursive case
}

System.out.println(factorial(5));   // 120
```

How `factorial(3)` unfolds:

```
factorial(3)
  → 3 * factorial(2)
        → 2 * factorial(1)
              → 1
        → 2 * 1 = 2
  → 3 * 2 = 6
```

## Fibonacci (and why naive recursion can be slow)

```java
public static int fib(int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}
```

Mathematically correct, but each call branches into two more — `fib(40)` is already noticeably slow because it recomputes the same values billions of times. For real use, **memoize** results or write an iterative version:

```java
public static long fibFast(int n) {
    long a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        long t = a + b;
        a = b;
        b = t;
    }
    return a;
}
```

## When recursion shines

Recursion is most natural for **tree-shaped** problems where iteration would be awkward.

### Sum of nested arrays

```java
public static int sum(Object value) {
    if (value instanceof Integer i) return i;
    int total = 0;
    for (Object child : (Object[]) value) {
        total += sum(child);
    }
    return total;
}
```

### Walking a directory tree

```java
public static void list(File f) {
    System.out.println(f);
    if (f.isDirectory()) {
        for (File child : f.listFiles()) {
            list(child);
        }
    }
}
```

## The call stack

Each recursive call uses one **stack frame** for its parameters and local variables. The JVM's stack is finite — typically a few thousand frames. Very deep recursion (`factorial(100_000)`) throws `StackOverflowError`.

Java does **not** automatically optimize tail calls. If you're recursing very deep, convert to a loop.

## Recursion vs iteration

Anything you can do with recursion you can do with a loop, and vice versa. Pick the one that matches the structure of the problem:

- **Tree / nested structure?** Recursion is usually clearer.
- **Linear sequence with a counter?** A loop is usually clearer.
- **Performance-critical, deep call depth?** Iterate.

## A complete example: power

```java
public static long power(long base, int exp) {
    if (exp == 0) return 1;
    if (exp % 2 == 0) {
        long half = power(base, exp / 2);
        return half * half;
    }
    return base * power(base, exp - 1);
}

System.out.println(power(2, 10));   // 1024
```

This "fast exponentiation" runs in O(log n) instead of O(n).

Next: we move into **OOP** with classes and objects.
