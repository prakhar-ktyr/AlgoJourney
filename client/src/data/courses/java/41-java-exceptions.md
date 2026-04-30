---
title: Java Exceptions
---

# Java Exceptions

When something goes wrong at runtime — division by zero, file not found, network down — Java throws an **exception**. The exception travels up the call stack until somebody catches it. If nobody does, the program crashes and prints a stack trace.

## A typical stack trace

```java
public class Crash {
    public static void main(String[] args) {
        int[] xs = new int[3];
        System.out.println(xs[10]);
    }
}
```

```
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException:
        Index 10 out of bounds for length 3
    at Crash.main(Crash.java:4)
```

The trace shows the exception type, the message, and _where_ it happened — the most useful debugging tool you have.

## `try`, `catch`, `finally`

To handle an exception:

```java
try {
    int n = Integer.parseInt("oops");      // throws NumberFormatException
    System.out.println(n);
} catch (NumberFormatException e) {
    System.out.println("not a number: " + e.getMessage());
} finally {
    System.out.println("always runs");
}
```

- The `try` block contains code that _may_ throw.
- The `catch` block runs if a matching exception is thrown.
- The `finally` block runs **whether or not** an exception happened — perfect for cleanup.

## Multiple `catch` blocks

You can handle different exception types separately. Order from **most specific** to **most general**.

```java
try {
    process(file);
} catch (FileNotFoundException e) {
    System.out.println("file missing: " + e.getMessage());
} catch (IOException e) {
    System.out.println("I/O error: " + e.getMessage());
} catch (Exception e) {
    System.out.println("unexpected: " + e);
}
```

### Multi-catch

If the handlers do the same thing, combine them with `|`:

```java
try {
    ...
} catch (IOException | NumberFormatException e) {
    log(e);
}
```

## The exception hierarchy

```
Throwable
  ├─ Error           ← serious JVM problems (OutOfMemoryError, ...) — don't catch
  └─ Exception
       ├─ RuntimeException   ← unchecked
       │    ├─ NullPointerException
       │    ├─ IllegalArgumentException
       │    ├─ ArithmeticException
       │    └─ ...
       └─ ... checked exceptions ...
            ├─ IOException
            ├─ SQLException
            └─ ...
```

- **Errors**: thrown by the JVM. Almost never caught.
- **Checked exceptions** (everything under `Exception` _except_ `RuntimeException`): the compiler forces you to declare or handle them. Used for _recoverable_ failures like I/O.
- **Unchecked exceptions** (`RuntimeException` and subclasses): the compiler doesn't force handling. Used for _programming errors_ — invalid arguments, null dereferences, bad state.

## Throwing exceptions

Use `throw` to raise an exception yourself:

```java
public static int divide(int a, int b) {
    if (b == 0) {
        throw new ArithmeticException("cannot divide by zero");
    }
    return a / b;
}
```

For invalid arguments, prefer the standard `IllegalArgumentException`:

```java
if (age < 0) throw new IllegalArgumentException("age must be ≥ 0");
```

## Declaring checked exceptions — `throws`

Methods that may throw a _checked_ exception must declare it:

```java
import java.io.*;

public static String firstLine(String path) throws IOException {
    try (BufferedReader r = new BufferedReader(new FileReader(path))) {
        return r.readLine();
    }
}
```

The caller must either handle the `IOException` or also declare `throws IOException`.

## try-with-resources

Anything that implements `AutoCloseable` (files, sockets, scanners, JDBC connections, …) should be opened in a **try-with-resources** so the JVM closes it for you, even if an exception fires:

```java
try (BufferedReader r = new BufferedReader(new FileReader("notes.txt"))) {
    String line;
    while ((line = r.readLine()) != null) {
        System.out.println(line);
    }
}
```

Multiple resources are separated by semicolons:

```java
try (var in  = new FileReader("in.txt");
     var out = new FileWriter("out.txt")) {
    // ...
}
```

## Custom exception classes

For domain errors, define your own:

```java
public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String msg) { super(msg); }
}
```

Subclass `RuntimeException` for unchecked, or `Exception` for checked. Most modern code prefers unchecked — it leads to less ceremony.

## Don't swallow exceptions

The cardinal sin:

```java
try {
    ...
} catch (Exception e) {
    // empty — bug now invisible
}
```

At minimum, log the exception with its stack trace so you have a chance to find the bug:

```java
catch (Exception e) {
    e.printStackTrace();        // for quick scripts
    // or use a real logger:
    // logger.error("processing failed", e);
}
```

## A complete example

```java
import java.util.Scanner;

public class SafeDivide {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        try {
            System.out.print("Numerator:   "); int a = sc.nextInt();
            System.out.print("Denominator: "); int b = sc.nextInt();
            System.out.println(a + " / " + b + " = " + (a / b));
        } catch (ArithmeticException e) {
            System.out.println("Cannot divide by zero.");
        } catch (Exception e) {
            System.out.println("Bad input: " + e.getMessage());
        } finally {
            sc.close();
            System.out.println("done");
        }
    }
}
```

Next: reading and writing **files**.
