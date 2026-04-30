---
title: Java Method Parameters
---

# Java Method Parameters

Parameters are the values you pass to a method when you call it. Inside the method, those values are accessed by their parameter names.

## Multiple parameters

Separate parameters with commas. Each needs its own type.

```java
public static int rectangleArea(int width, int height) {
    return width * height;
}

int area = rectangleArea(4, 5);   // 20
```

## Java is "pass-by-value"

When you pass a variable to a method, the method receives a **copy**. Reassigning the parameter does not change the caller's variable:

```java
public static void increment(int x) {
    x = x + 1;          // changes the local copy
}

int n = 5;
increment(n);
System.out.println(n);   // 5  (unchanged)
```

For **reference types**, the _reference_ is copied. The method can still mutate the object it points to:

```java
public static void clear(int[] arr) {
    arr[0] = 0;             // mutates the original array (visible to caller)
    arr = new int[]{9, 9};  // reassigns local copy only (NOT visible)
}

int[] a = {1, 2, 3};
clear(a);
System.out.println(a[0]);   // 0
System.out.println(a.length); // 3 — array reference unchanged
```

## Default values? — Java has none

Unlike Python or C++, Java has no default parameter values. The standard pattern is **method overloading** (next lesson).

## Variable-length arguments — `varargs`

Use `...` to accept any number of arguments of a given type. Inside the method, the parameter behaves like an array.

```java
public static int sum(int... nums) {
    int total = 0;
    for (int n : nums) total += n;
    return total;
}

sum();              // 0
sum(1, 2, 3);       // 6
sum(1, 2, 3, 4, 5); // 15

int[] arr = {1, 2, 3};
sum(arr);           // 6  (you can pass an array)
```

Rules:

- Only one varargs parameter per method.
- It must be the **last** parameter.

```java
public static String join(String sep, String... parts) { ... }
join("-", "a", "b", "c");     // "a-b-c"
```

## Passing arrays and collections

```java
public static double average(double[] values) {
    double total = 0;
    for (double v : values) total += v;
    return total / values.length;
}

double avg = average(new double[]{1.5, 2.5, 3.5});
```

## Returning multiple values

Java has no tuples. Common patterns:

1. Return an **array**:
   ```java
   public static int[] minMax(int[] xs) {
       int lo = xs[0], hi = xs[0];
       for (int x : xs) {
           if (x < lo) lo = x;
           if (x > hi) hi = x;
       }
       return new int[]{lo, hi};
   }
   ```
2. Return a **record** (Java 16+) — covered later. The cleanest option:
   ```java
   record MinMax(int min, int max) {}
   public static MinMax minMax(int[] xs) { ... }
   ```
3. Return a small **class** you defined.

## Naming parameters

Parameter names should describe **what** the value represents, not the type. Prefer `customerId` over `id`, `searchTerm` over `s`.

## A complete example

```java
public class Geometry {
    public static double distance(double x1, double y1,
                                  double x2, double y2) {
        double dx = x2 - x1;
        double dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public static double perimeter(double... sides) {
        double total = 0;
        for (double s : sides) total += s;
        return total;
    }

    public static void main(String[] args) {
        System.out.println(distance(0, 0, 3, 4));        // 5.0
        System.out.println(perimeter(3, 4, 5));          // 12.0
        System.out.println(perimeter(1, 1, 1, 1, 1));    // 5.0
    }
}
```

Next: **method overloading**.
