---
title: Java Type Casting
---

# Java Type Casting

**Type casting** is converting a value of one type into another. Java distinguishes two cases:

1. **Widening (implicit)** — small type into a bigger one. Always safe; the compiler does it automatically.
2. **Narrowing (explicit)** — bigger type into a smaller one. May lose information; you must request it with a cast.

## Widening (automatic)

```java
int i = 100;
long l = i;        // int → long  (automatic)
double d = l;      // long → double (automatic)
```

The hierarchy of safe widening:

```
byte → short → int → long → float → double
                char ↗
```

## Narrowing (explicit)

```java
double d = 9.78;
int i = (int) d;    // 9   (decimal part discarded)

long big = 100;
int  small = (int) big;
```

Narrowing **truncates** for integers and may **overflow**:

```java
int huge = 200;
byte b = (byte) huge;   // -56  (overflow into byte's range)
```

## Casting objects (reference types)

Within a class hierarchy you can cast a reference up or down:

```java
Object o = "hello";        // upcast (implicit)
String s = (String) o;     // downcast (explicit)
```

A bad downcast throws `ClassCastException` at runtime:

```java
Object o = 42;
String s = (String) o;     // ❌ ClassCastException
```

Use `instanceof` to check first, or use the pattern form:

```java
if (o instanceof String s) {
    System.out.println(s.toUpperCase());
}
```

## Converting between strings and numbers

### String → number

```java
int    i = Integer.parseInt("42");
long   l = Long.parseLong("9999999999");
double d = Double.parseDouble("3.14");
boolean b = Boolean.parseBoolean("true");
```

A non-numeric input throws `NumberFormatException`:

```java
int x = Integer.parseInt("hello");   // ❌ NumberFormatException
```

### Number → string

```java
String s1 = String.valueOf(42);
String s2 = Integer.toString(42);
String s3 = "" + 42;            // works but less idiomatic
```

## Char ↔ int

A `char` is a 16-bit unsigned integer holding a UTF-16 code unit, so it casts to/from `int` cleanly:

```java
char c = 'A';
int code = c;             // 65   (widening)
char next = (char)(c + 1); // 'B'  (need cast: int → char)
```

## Putting it together

```java
public class CastingDemo {
    public static void main(String[] args) {
        // widening
        int i = 7;
        double d = i;
        System.out.println(d);          // 7.0

        // narrowing
        double pi = 3.14159;
        int truncated = (int) pi;
        System.out.println(truncated);  // 3

        // string → int
        int year = Integer.parseInt("2024");
        System.out.println(year + 1);   // 2025

        // int → string
        String s = String.valueOf(year);
        System.out.println(s + " AD");  // 2024 AD
    }
}
```

In the next lesson we'll cover the full set of **operators**.
