---
title: Java User Input
---

# Java User Input

The standard way to read input from the keyboard is the `Scanner` class.

## Setup

```java
import java.util.Scanner;

Scanner sc = new Scanner(System.in);
```

`System.in` is a stream connected to standard input. `Scanner` wraps it with convenient parsing methods.

## Reading text

```java
import java.util.Scanner;

public class GreetUser {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("What's your name? ");
        String name = sc.nextLine();

        System.out.println("Hello, " + name + "!");
    }
}
```

```
What's your name? Ada
Hello, Ada!
```

## Reading numbers

```java
System.out.print("Enter your age: ");
int age = sc.nextInt();

System.out.print("Enter your height in metres: ");
double height = sc.nextDouble();

System.out.printf("You are %d years old and %.2f m tall.%n", age, height);
```

`Scanner` methods:

| Method                         | Reads                                    |
| ------------------------------ | ---------------------------------------- |
| `nextLine()`                   | An entire line of text.                  |
| `next()`                       | One whitespace-delimited token (a word). |
| `nextInt()`                    | An `int`.                                |
| `nextLong()`                   | A `long`.                                |
| `nextDouble()`                 | A `double`.                              |
| `nextBoolean()`                | A `boolean`.                             |
| `hasNext()`, `hasNextInt()`, … | Test before reading.                     |

## The `nextInt() then nextLine()` pitfall

`nextInt()` reads the number but **leaves the newline character in the buffer**. A following `nextLine()` then reads an empty line:

```java
int age = sc.nextInt();
String name = sc.nextLine();   // ❌ reads the leftover "\n", not the name
```

Fix: consume the leftover newline first:

```java
int age = sc.nextInt();
sc.nextLine();                  // discard the newline
String name = sc.nextLine();
```

## Validating input

```java
System.out.print("Enter a positive number: ");
while (!sc.hasNextInt()) {
    System.out.print("Not an integer. Try again: ");
    sc.next();    // discard the bad token
}
int n = sc.nextInt();
```

## Reading from arguments

You can also receive input on the command line via `args`:

```java
public class Args {
    public static void main(String[] args) {
        if (args.length < 2) {
            System.out.println("Usage: java Args <name> <age>");
            return;
        }
        String name = args[0];
        int age = Integer.parseInt(args[1]);
        System.out.println(name + " is " + age + " years old.");
    }
}
```

```bash
java Args Ada 30
# → Ada is 30 years old.
```

## Reading whole files

For files instead of the keyboard, use `Files.readString` (covered later in the **Files** lesson):

```java
String text = Files.readString(Path.of("notes.txt"));
```

## A complete example

```java
import java.util.Scanner;

public class Calculator {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("First number:  ");
        double a = sc.nextDouble();
        System.out.print("Second number: ");
        double b = sc.nextDouble();

        System.out.printf("Sum:        %.2f%n", a + b);
        System.out.printf("Difference: %.2f%n", a - b);
        System.out.printf("Product:    %.2f%n", a * b);
        if (b != 0) {
            System.out.printf("Quotient:   %.2f%n", a / b);
        } else {
            System.out.println("Quotient:   undefined (division by zero)");
        }
    }
}
```

Next: writing your own **methods**.
