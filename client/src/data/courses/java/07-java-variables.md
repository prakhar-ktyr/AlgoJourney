---
title: Java Variables
---

# Java Variables

A **variable** is a named storage location for a value. In Java, every variable has a fixed **type** decided at declaration time and checked by the compiler.

## Declaring a variable

The basic form is:

```java
type name = value;
```

```java
int age = 25;
double price = 9.99;
String name = "Ada";
boolean isAdmin = true;
char grade = 'A';
```

You can also declare without initializing, then assign later:

```java
int score;
score = 100;
```

> **Local variables must be assigned before use.** The compiler will refuse to compile code that reads an uninitialized local variable.

## Multiple variables

```java
int x = 1, y = 2, z = 3;          // same type
int a = 5, b = 5, c = 5;
int p, q, r;                       // declare without initializing
```

## Reassignment

A variable's value can change, but its type cannot:

```java
int n = 10;
n = 20;          // OK
n = "hello";   // ❌ compile error: incompatible types
```

## `final` — constants

Mark a variable `final` to forbid reassignment:

```java
final double PI = 3.14159;
PI = 3.14;   // ❌ compile error
```

By convention, `final` constants use `UPPER_SNAKE_CASE`.

## `var` — type inference (Java 10+)

For local variables you can let the compiler infer the type from the initializer:

```java
var age = 25;            // inferred as int
var name = "Ada";       // inferred as String
var nums = new int[]{1, 2, 3};  // inferred as int[]
```

`var` is _not_ "any type" — it is still strongly typed. It just saves typing.

Restrictions: `var` only works for local variables that have an initializer (not for fields, parameters, or `null` initializers).

## Naming rules

A variable name:

- May contain letters, digits, `$`, and `_`.
- Must **not** start with a digit.
- Must **not** be a Java keyword (`int`, `class`, `if`, …).
- Is **case-sensitive** (`age` and `Age` are different).

Conventions:

- Variables and methods: `lowerCamelCase` — `userName`, `totalPrice`.
- Constants (`final` and uppercase scope): `UPPER_SNAKE_CASE` — `MAX_RETRIES`.

## Where variables live

| Kind             | Declared where                      | Lifetime                              |
| ---------------- | ----------------------------------- | ------------------------------------- |
| **Local**        | Inside a method or block.           | While the method/block runs.          |
| **Field**        | Inside a class, outside any method. | While the object exists.              |
| **Static field** | `static` field of a class.          | While the class is loaded (~app run). |
| **Parameter**    | In a method's parameter list.       | While the method runs.                |

```java
public class Counter {
    static int totalCounters = 0;   // static field
    int value;                       // instance field

    public void increment(int by) {  // 'by' is a parameter
        int oldValue = value;        // local variable
        value = oldValue + by;
    }
}
```

## A complete example

```java
public class VariablesDemo {
    public static void main(String[] args) {
        String firstName = "Ada";
        String lastName = "Lovelace";
        int birthYear = 1815;
        final int CURRENT_YEAR = 2024;
        var age = CURRENT_YEAR - birthYear;

        System.out.println(firstName + " " + lastName + " — age " + age);
    }
}
```

Output:

```
Ada Lovelace — age 209
```

In the next lesson we'll see all the **data types** Java supports.
