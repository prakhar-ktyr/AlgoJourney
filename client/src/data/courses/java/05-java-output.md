---
title: Java Output
---

# Java Output

Java has three core ways of printing to standard output:

| Method                        | Adds newline?                         | Formatted? |
| ----------------------------- | ------------------------------------- | ---------- |
| `System.out.print(x)`         | No                                    | No         |
| `System.out.println(x)`       | Yes                                   | No         |
| `System.out.printf(fmt, ...)` | No (unless `%n` in the format string) | Yes        |

## `println` — print a line

```java
System.out.println("Hello");
System.out.println("World");
```

```
Hello
World
```

`println` works for any type — numbers, booleans, even objects (it calls their `toString()`):

```java
System.out.println(42);
System.out.println(3.14);
System.out.println(true);
```

## `print` — no newline

```java
System.out.print("Hello, ");
System.out.print("World!");
```

```
Hello, World!
```

## String concatenation with `+`

Use `+` to glue values together:

```java
String name = "Ada";
int age = 30;
System.out.println("Name: " + name + ", age: " + age);
```

```
Name: Ada, age: 30
```

When one operand of `+` is a `String`, Java converts the other operand to a string automatically.

## `printf` — formatted output

`printf` (print **f**ormatted) is the most powerful option, modelled after C's `printf`:

```java
System.out.printf("Name: %s, age: %d%n", "Ada", 30);
```

```
Name: Ada, age: 30
```

### Common format specifiers

| Specifier | Meaning             | Example input → output    |
| --------- | ------------------- | ------------------------- |
| `%s`      | String              | `"hi"` → `hi`             |
| `%d`      | Integer             | `42` → `42`               |
| `%f`      | Floating point      | `3.14159` → `3.141590`    |
| `%.2f`    | Float, 2 decimals   | `3.14159` → `3.14`        |
| `%e`      | Scientific notation | `1234.5` → `1.234500e+03` |
| `%b`      | Boolean             | `true` → `true`           |
| `%c`      | Character           | `'A'` → `A`               |
| `%x`      | Hexadecimal         | `255` → `ff`              |
| `%n`      | Platform newline    | (newline)                 |
| `%%`      | A literal `%`       | `%`                       |

### Width and alignment

```java
System.out.printf("|%10s|%n", "hi");   // |        hi|  (right-padded)
System.out.printf("|%-10s|%n", "hi");  // |hi        |  (left-padded)
System.out.printf("|%05d|%n", 42);     // |00042|       (zero-padded)
```

## Escape sequences

Inside a string literal:

| Sequence | Meaning           |
| -------- | ----------------- |
| `\n`     | Newline           |
| `\t`     | Tab               |
| `\\`     | Literal backslash |
| `\"`     | Double quote      |
| `\'`     | Single quote      |

```java
System.out.println("Line1\nLine2\tindented");
System.out.println("Quote: \"hi\"");
```

## `System.err` for errors

`System.err` works the same as `System.out` but writes to standard error. Use it for diagnostics that shouldn't mix with normal output.

```java
System.err.println("Something went wrong!");
```

## Text blocks (multi-line strings)

Since Java 15, you can write multi-line strings with `"""`:

```java
String html = """
        <html>
            <body>Hello</body>
        </html>
        """;
System.out.println(html);
```

Indentation common to all lines is automatically stripped — very handy for SQL, JSON, HTML, and docs.

In the next lesson we'll cover **comments**.
