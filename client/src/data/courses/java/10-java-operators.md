---
title: Java Operators
---

# Java Operators

Operators perform operations on values. Java has these categories: **arithmetic, assignment, comparison, logical, bitwise, ternary,** and **string concatenation**.

## Arithmetic

| Op   | Meaning            | Example | Result                  |
| ---- | ------------------ | ------- | ----------------------- |
| `+`  | Add                | `5 + 3` | `8`                     |
| `-`  | Subtract           | `5 - 3` | `2`                     |
| `*`  | Multiply           | `5 * 3` | `15`                    |
| `/`  | Divide             | `7 / 2` | `3` (integer division!) |
| `%`  | Modulo (remainder) | `7 % 2` | `1`                     |
| `++` | Increment by 1     | `x++`   | (see below)             |
| `--` | Decrement by 1     | `x--`   | (see below)             |

> **Integer division truncates.** `7 / 2` is `3`, not `3.5`. Use a `double` operand to get a fractional result: `7 / 2.0 == 3.5`.

### `++` and `--`

```java
int x = 5;
int a = x++;   // post-increment: a = 5, then x = 6
int y = 5;
int b = ++y;   // pre-increment:  y = 6, then b = 6
```

## Assignment

| Op                    | Equivalent to |
| --------------------- | ------------- | ---------------- |
| `=`                   | plain assign  |
| `+=`                  | `x = x + y`   |
| `-=`                  | `x = x - y`   |
| `*=`                  | `x = x * y`   |
| `/=`                  | `x = x / y`   |
| `%=`                  | `x = x % y`   |
| `<<=`, `>>=`, `&=`, ` | =`, `^=`      | bitwise variants |

```java
int total = 0;
total += 5;    // 5
total *= 3;    // 15
```

## Comparison (relational)

All return `boolean`.

| Op   | Meaning               |
| ---- | --------------------- |
| `==` | Equal                 |
| `!=` | Not equal             |
| `<`  | Less than             |
| `>`  | Greater than          |
| `<=` | Less than or equal    |
| `>=` | Greater than or equal |

> **Important:** `==` on objects compares **references** (are they the same object?), not contents. Use `.equals(...)` to compare values:
>
> ```java
> String a = new String("hi");
> String b = new String("hi");
> System.out.println(a == b);          // false
> System.out.println(a.equals(b));     // true
> ```

## Logical

| Op   | Meaning     | Notes                       |
| ---- | ----------- | --------------------------- | --------------------------- | -------------- |
| `&&` | Logical AND | Short-circuits              |
| `    |             | `                           | Logical OR                  | Short-circuits |
| `!`  | Logical NOT |                             |
| `&`  | Boolean AND | Always evaluates both sides |
| `    | `           | Boolean OR                  | Always evaluates both sides |
| `^`  | Boolean XOR |                             |

```java
int x = 5;
if (x != 0 && (10 / x) > 1) {  // safe — short-circuits if x == 0
    System.out.println("ok");
}
```

## Bitwise (on integers)

| Op    | Meaning                                  |
| ----- | ---------------------------------------- | ---------- |
| `&`   | Bitwise AND                              |
| `     | `                                        | Bitwise OR |
| `^`   | Bitwise XOR                              |
| `~`   | Bitwise NOT                              |
| `<<`  | Left shift                               |
| `>>`  | Arithmetic right shift (sign-preserving) |
| `>>>` | Logical right shift (zero-fill)          |

```java
int flags = 0b1010;
int mask  = 0b1100;
System.out.println(flags & mask);  // 0b1000 = 8
System.out.println(flags | mask);  // 0b1110 = 14
System.out.println(flags << 1);    // 0b10100 = 20
```

## Ternary `? :`

A compact if-else expression:

```java
int age = 17;
String status = (age >= 18) ? "adult" : "minor";
```

Equivalent to:

```java
String status;
if (age >= 18) status = "adult";
else            status = "minor";
```

## String concatenation with `+`

If either operand of `+` is a `String`, Java converts the other to a string and concatenates:

```java
String greeting = "Hello, " + "World";
String labelled = "x = " + 42;
```

For building strings in a loop, prefer **`StringBuilder`** (covered in the Strings lesson).

## Operator precedence

Higher-priority operators are evaluated first. The most useful order to remember:

1. `()` `[]` `.`
2. `++` `--` `!` `~` (unary)
3. `*` `/` `%`
4. `+` `-`
5. `<<` `>>` `>>>`
6. `<` `<=` `>` `>=` `instanceof`
7. `==` `!=`
8. `&` then `^` then `|` then `&&` then `||`
9. `? :`
10. `=`, `+=`, `-=`, …

When in doubt, **add parentheses** — they cost nothing and prevent bugs:

```java
int z = (a + b) * c;     // clearly intended
```

In the next lesson we look at **strings** in depth.
