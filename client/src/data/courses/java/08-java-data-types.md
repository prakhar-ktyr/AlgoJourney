---
title: Java Data Types
---

# Java Data Types

Java types fall into two big buckets:

1. **Primitive types** — small, fixed-size values stored directly in the variable. There are exactly eight.
2. **Reference types** — objects (including `String`, arrays, and every class you write). The variable holds a _reference_ (pointer-like handle) to an object on the heap.

## The eight primitives

| Type      | Size              | Range                                              | Example literal         |
| --------- | ----------------- | -------------------------------------------------- | ----------------------- |
| `byte`    | 8 bits            | −128 … 127                                         | `byte b = 100;`         |
| `short`   | 16 bits           | −32 768 … 32 767                                   | `short s = 30000;`      |
| `int`     | 32 bits           | −2 147 483 648 … 2 147 483 647                     | `int i = 42;`           |
| `long`    | 64 bits           | ±9.2 × 10¹⁸                                        | `long l = 9000000000L;` |
| `float`   | 32 bits           | ~7 decimal digits                                  | `float f = 3.14f;`      |
| `double`  | 64 bits           | ~15 decimal digits                                 | `double d = 3.14;`      |
| `char`    | 16 bits           | A single Unicode code unit (UTF-16): `'A'`, `'☕'` | `char c = 'A';`         |
| `boolean` | 1 bit (logically) | `true` or `false`                                  | `boolean b = true;`     |

### Notes

- `int` is the **default** integer type. Use `long` when the value might exceed about ±2.1 billion.
- `double` is the default for fractional numbers. Use `float` only when memory is tight (e.g. graphics buffers).
- A `long` literal needs a trailing **`L`**: `long big = 10_000_000_000L;`. Without `L`, the literal is treated as `int` and overflows.
- A `float` literal needs a trailing **`f`**: `float pi = 3.14f;`. Without `f` the literal is `double` and the assignment fails.
- Underscores are allowed in numeric literals for readability: `1_000_000`, `0xFF_FF`.

### Number bases

```java
int decimal = 255;
int hex     = 0xFF;          // hexadecimal
int octal   = 0377;           // octal (rarely used)
int binary  = 0b1111_1111;   // binary (Java 7+)
```

## Reference types

Anything that isn't a primitive is a reference type:

```java
String s = "hello";              // String
int[] nums = {1, 2, 3};           // array of int
Person p = new Person("Ada");   // user-defined class
```

A reference variable can also hold the special value **`null`**, meaning "no object":

```java
String s = null;
System.out.println(s.length()); // ❌ NullPointerException at runtime
```

## Wrapper classes

Each primitive has a corresponding **wrapper class** that lets it behave as an object: `Byte`, `Short`, `Integer`, `Long`, `Float`, `Double`, `Character`, `Boolean`.

```java
Integer boxed = 42;          // autoboxing: int → Integer
int unboxed = boxed;         // unboxing:   Integer → int
Integer maybe = null;        // wrappers can be null; primitives cannot
```

Wrappers are needed wherever an object is required — most importantly in collections (`List<Integer>`, not `List<int>`).

## Default values for fields

Fields (but **not** local variables) get a default if you don't initialize them:

| Type                                 | Default     |
| ------------------------------------ | ----------- |
| Numeric (`int`, `long`, `double`, …) | `0` / `0.0` |
| `boolean`                            | `false`     |
| `char`                               | `'\u0000'`  |
| Reference                            | `null`      |

```java
public class Defaults {
    int    i;        // 0
    double d;        // 0.0
    boolean b;       // false
    String  s;       // null
}
```

## Type checking and the `instanceof` operator

```java
Object o = "hello";
System.out.println(o instanceof String);   // true
```

Modern pattern syntax (Java 16+):

```java
if (o instanceof String s) {
    System.out.println(s.length());     // 's' is already typed as String
}
```

In the next lesson we'll look at **type casting** — converting between types.
