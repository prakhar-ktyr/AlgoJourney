---
title: Java Math
---

# Java Math

The built-in `java.lang.Math` class provides standard math functions. All its methods are `static`, so you call them on the class itself: `Math.sqrt(2)`.

## Arithmetic helpers

```java
Math.abs(-7);          // 7
Math.max(3, 9);        // 9
Math.min(3, 9);        // 3
Math.pow(2, 10);       // 1024.0
Math.sqrt(16);          // 4.0
Math.cbrt(27);          // 3.0
```

`Math.pow` always returns a `double`. Cast if you need an integer:

```java
int p = (int) Math.pow(2, 10);   // 1024
```

## Rounding

```java
Math.round(2.5);    // 3 (returns long)
Math.round(2.4);    // 2
Math.floor(2.9);    // 2.0  (largest int ≤ x, returned as double)
Math.ceil(2.1);     // 3.0
```

## Constants

```java
Math.PI;    // 3.141592653589793
Math.E;     // 2.718281828459045
```

## Trigonometry

Inputs are in **radians**.

```java
Math.sin(Math.PI / 2);   // 1.0
Math.cos(0);              // 1.0
Math.tan(Math.PI / 4);    // ~1.0
Math.toRadians(180);      // PI
Math.toDegrees(Math.PI);  // 180.0
```

## Logarithms and exponentials

```java
Math.log(Math.E);     // 1.0   (natural log)
Math.log10(1000);     // 3.0
Math.exp(1);           // E
```

## Random numbers

`Math.random()` returns a `double` in `[0.0, 1.0)`:

```java
double r = Math.random();              // e.g. 0.4231...
int dice = (int)(Math.random() * 6) + 1;  // 1..6
```

For more control, use `java.util.Random` or `java.util.concurrent.ThreadLocalRandom`:

```java
import java.util.Random;
Random rng = new Random();
int n = rng.nextInt(100);          // 0..99
double d = rng.nextDouble();       // [0, 1)
boolean b = rng.nextBoolean();
```

## Watch out: floating-point precision

```java
System.out.println(0.1 + 0.2);   // 0.30000000000000004
```

`double` arithmetic is approximate. For money use `BigDecimal`:

```java
import java.math.BigDecimal;
BigDecimal a = new BigDecimal("0.1");
BigDecimal b = new BigDecimal("0.2");
System.out.println(a.add(b));    // 0.3 exactly
```

For arbitrary-precision integers (e.g. cryptography, factorials of big numbers) use `BigInteger`.

## A complete example

```java
public class MathDemo {
    public static void main(String[] args) {
        // Distance between two points (3, 4) and (0, 0)
        double dx = 3, dy = 4;
        double dist = Math.sqrt(dx * dx + dy * dy);
        System.out.println("distance = " + dist);   // 5.0

        // Roll two dice
        int d1 = (int)(Math.random() * 6) + 1;
        int d2 = (int)(Math.random() * 6) + 1;
        System.out.println("dice: " + d1 + " + " + d2 + " = " + (d1 + d2));
    }
}
```

Next: **booleans**.
