---
title: Java Comments
---

# Java Comments

Comments are notes for humans. The compiler ignores them entirely. Java has three kinds:

## Single-line comment

Start with `//` and continue to the end of the line:

```java
// Initialize the counter.
int count = 0;

int x = 10;  // Comments can also appear after code.
```

## Multi-line comment

Start with `/*` and end with `*/`:

```java
/*
 * Computes the area of a circle.
 * Uses 3.14159 as an approximation of pi.
 */
double area = 3.14159 * r * r;
```

The leading `*` on each line is a stylistic convention — it isn't required.

## Javadoc comment

Start with `/**` and end with `*/`. These are special comments parsed by the **`javadoc`** tool to generate HTML API documentation.

```java
/**
 * Computes the factorial of a non-negative integer.
 *
 * @param n the integer to compute the factorial of (must be ≥ 0)
 * @return  n! — the product of all integers from 1 to n
 * @throws  IllegalArgumentException if n is negative
 */
public static long factorial(int n) {
    if (n < 0) throw new IllegalArgumentException("n must be ≥ 0");
    long result = 1;
    for (int i = 2; i <= n; i++) result *= i;
    return result;
}
```

Common Javadoc tags:

| Tag           | Used for                                 |
| ------------- | ---------------------------------------- |
| `@param`      | A method parameter.                      |
| `@return`     | The value returned.                      |
| `@throws`     | An exception that may be thrown.         |
| `@see`        | Cross-reference to another class/method. |
| `@since`      | The version when this was added.         |
| `@deprecated` | This API should no longer be used.       |

Generate the docs with:

```bash
javadoc -d docs *.java
```

## Style tips

- Use comments to explain **why**, not **what**. The code already says _what_ it does.
- Keep comments **up to date**. A wrong comment is worse than no comment.
- Prefer good names and small methods over long comments.

## Commenting-out code

A quick way to disable code while debugging:

```java
// System.out.println("debug: " + x);
```

For a whole block:

```java
/*
runExpensiveTask();
runAnotherExpensiveTask();
*/
```

> **Note**: Java's `/* ... */` comments do **not** nest. Putting `/*` inside a block comment and another `*/` later will close the comment at the first `*/`.

Next up: **variables**.
