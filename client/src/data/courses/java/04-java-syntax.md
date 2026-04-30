---
title: Java Syntax
---

# Java Syntax

Let's revisit the "Hello, World" program, line by line.

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

## `public class Hello`

Every Java program is built out of **classes**. A class is a named container for code. The keyword **`class`** declares one; **`Hello`** is the name we picked.

- The class name must match the file name when the class is `public`. So this code must be saved in **`Hello.java`**.
- **`public`** is an _access modifier_ — it means "any other class can see this one". (We'll cover modifiers in detail later.)
- The `{ ... }` braces enclose the **class body** — everything that belongs to the class.

## `public static void main(String[] args)`

This is the **entry point**. When you type `java Hello`, the JVM looks for a method with this exact signature and calls it.

Each piece matters:

| Token           | Meaning                                                            |
| --------------- | ------------------------------------------------------------------ |
| `public`        | Visible to the JVM (which is "outside" the class).                 |
| `static`        | Belongs to the class itself — no object needs to exist to call it. |
| `void`          | Does not return a value.                                           |
| `main`          | The conventional entry-point name.                                 |
| `String[] args` | An array of command-line arguments passed to the program.          |

If you mistype any of these (`Main`, `Static`, `string[]`...) the JVM will not find your entry point and will refuse to run.

## `System.out.println("Hello, World!");`

Three things are happening here:

1. **`System`** is a built-in class.
2. **`System.out`** is a `static` field of `System` — a `PrintStream` connected to standard output.
3. **`println(...)`** is a method on `PrintStream` that prints its argument **and a newline**.

The line ends with a semicolon **`;`**. Forgetting the semicolon is the #1 beginner compile error.

## Curly braces and blocks

Anywhere a single statement is expected, you can use a `{ ... }` block of multiple statements. Classes, methods, `if`, `while`, and `for` all use blocks:

```java
if (x > 0) {
    System.out.println("positive");
    x = 0;
}
```

## Java is case-sensitive

`Main`, `main`, and `MAIN` are three different identifiers. Conventions:

- **Classes & interfaces**: `UpperCamelCase` — `Hello`, `BankAccount`.
- **Methods & variables**: `lowerCamelCase` — `printLine`, `userName`.
- **Constants**: `UPPER_SNAKE_CASE` — `MAX_RETRIES`.
- **Packages**: `all.lowercase.dotted` — `com.example.app`.

## Statements end in `;`

Every statement is terminated with a semicolon. Whitespace is otherwise ignored — you could legally write the whole program on one line, but please don't.

## Comments

```java
// Single-line comment.

/*
 * Multi-line comment.
 * Useful for explaining a block.
 */

/**
 * Javadoc comment — used to generate API docs.
 */
```

## A slightly bigger example

```java
public class Sum {
    public static void main(String[] args) {
        int a = 10;
        int b = 32;
        int sum = a + b;
        System.out.println(a + " + " + b + " = " + sum);
    }
}
```

Compile and run:

```
10 + 32 = 42
```

Next we'll dive into output: `print`, `println`, and `printf`.
