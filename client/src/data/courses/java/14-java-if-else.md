---
title: Java If...Else
---

# Java If...Else

`if` runs a block of code when a condition is `true`. Combined with `else if` and `else`, it lets your program branch.

## `if`

```java
int x = 10;
if (x > 0) {
    System.out.println("positive");
}
```

The condition must be a `boolean` expression — Java does **not** treat numbers or `null` as truthy.

## `if ... else`

```java
int n = -3;
if (n >= 0) {
    System.out.println("non-negative");
} else {
    System.out.println("negative");
}
```

## `if ... else if ... else`

Chain conditions to handle multiple cases:

```java
int score = 73;

if (score >= 90) {
    System.out.println("A");
} else if (score >= 80) {
    System.out.println("B");
} else if (score >= 70) {
    System.out.println("C");
} else if (score >= 60) {
    System.out.println("D");
} else {
    System.out.println("F");
}
```

Only the first matching branch runs.

## Braces are optional but recommended

A single statement after `if` works without braces:

```java
if (ready) start();
```

But this is a famous source of bugs. Always use braces:

```java
if (ready) {
    start();
}
```

## Nested `if`

```java
int age = 20;
boolean hasLicense = true;

if (age >= 18) {
    if (hasLicense) {
        System.out.println("Can drive");
    } else {
        System.out.println("Adult, but needs a license");
    }
} else {
    System.out.println("Too young");
}
```

Often you can flatten nested `if`s with `&&`:

```java
if (age >= 18 && hasLicense) {
    System.out.println("Can drive");
}
```

## Ternary as a compact `if`

```java
String label = (age >= 18) ? "adult" : "minor";
```

Equivalent to:

```java
String label;
if (age >= 18) label = "adult";
else            label = "minor";
```

Use the ternary for short value selections; use `if/else` for multi-statement logic.

## Common pitfalls

### Assignment vs comparison

```java
if (x = 5) { ... }   // ❌ compile error: '=' is assignment, not comparison
if (x == 5) { ... }  // ✅
```

(Java protects you here because `int` doesn't auto-convert to `boolean` — but with `boolean` variables this trap is real: `if (flag = false)` compiles and **always** runs the else branch.)

### Comparing strings with `==`

```java
if (name == "Ada") { ... }        // ❌ tests reference identity
if ("Ada".equals(name)) { ... }   // ✅
```

## A complete example

```java
public class GradeDemo {
    public static void main(String[] args) {
        int score = 87;
        char grade;

        if (score >= 90)      grade = 'A';
        else if (score >= 80) grade = 'B';
        else if (score >= 70) grade = 'C';
        else if (score >= 60) grade = 'D';
        else                  grade = 'F';

        System.out.printf("Score %d → grade %c%n", score, grade);
    }
}
```

Next: **`switch`** for cleaner multi-way branching.
