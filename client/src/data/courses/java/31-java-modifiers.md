---
title: Java Modifiers
---

# Java Modifiers

Modifiers are keywords that change how a class, field, or method behaves. They fall into two groups:

1. **Access modifiers** — control _who_ can see the member.
2. **Non-access modifiers** — control _how_ it behaves (`static`, `final`, `abstract`, …).

## Access modifiers

| Modifier                     | Class itself | Same package | Subclass (any package) | Anywhere |
| ---------------------------- | :----------: | :----------: | :--------------------: | :------: |
| `public`                     |      ✅      |      ✅      |           ✅           |    ✅    |
| `protected`                  |      ✅      |      ✅      |           ✅           |    ❌    |
| _(none)_ — _package-private_ |      ✅      |      ✅      |           ❌           |    ❌    |
| `private`                    |      ✅      |      ❌      |           ❌           |    ❌    |

```java
public class Account {
    public    String owner;       // visible everywhere
    protected double balance;     // visible to subclasses & same package
              int    branch;      // package-private (no modifier)
    private   String pinHash;    // visible only inside Account
}
```

### Rule of thumb

Make members **as private as possible**. Expose only what callers truly need. This keeps the class's surface small and lets you change internals freely.

For top-level classes, only `public` and _(no modifier)_ are allowed. A class without `public` is package-private — visible only inside its own package.

## Non-access modifiers

### `static`

Belongs to the **class**, not to instances. Already covered: shared state, utility methods, constants.

```java
public class MathUtil {
    public static final double PI = 3.14159;
    public static int square(int n) { return n * n; }
}
```

### `final`

Means "no further changes allowed."

| Applied to                     | Meaning                                                                   |
| ------------------------------ | ------------------------------------------------------------------------- |
| **Field**                      | Can be assigned exactly once. Often combined with `static` for constants. |
| **Method**                     | Cannot be overridden by subclasses.                                       |
| **Class**                      | Cannot be subclassed (e.g. `String`, `Integer`).                          |
| **Local variable / parameter** | Cannot be reassigned.                                                     |

```java
public final class ImmutablePoint {
    private final int x, y;
    public ImmutablePoint(int x, int y) { this.x = x; this.y = y; }
    public int getX() { return x; }
    public int getY() { return y; }
}
```

### `abstract`

Marks a class or method as **incomplete**. Abstract classes cannot be instantiated; abstract methods have no body and must be implemented by subclasses.

```java
public abstract class Shape {
    public abstract double area();      // no body
}
```

Covered in detail in the **Abstract Classes** lesson.

### `synchronized`

Applied to a method or block to make it thread-safe by acquiring the object's monitor lock. Covered in **Concurrency**.

### `volatile`

Field-only. Tells the JVM that this field may be modified by multiple threads — every read goes to main memory, not a cached copy. Also covered in **Concurrency**.

### `transient`

Field-only. The field is **skipped** when the object is serialised. Useful for fields you don't want written to disk or sent over the network.

### `default` (interfaces)

In an interface, `default` introduces a method _with_ a body that implementing classes inherit. Covered in **Interfaces**.

## Putting modifiers together

Java requires a fixed order, though the compiler is forgiving:

```
[access] [static] [final] [abstract] [synchronized] [native] [strictfp]
```

```java
public static final int MAX_RETRIES = 3;
public abstract void render();
private synchronized void process() { ... }
```

## A complete example

```java
public class BankAccount {
    public  static final double STARTING_BONUS = 10.0;     // constant
    private static int totalAccounts = 0;                  // shared, hidden

    public  final String owner;                            // immutable per object
    private double balance;                                // mutable, hidden

    public BankAccount(String owner) {
        this.owner = owner;
        this.balance = STARTING_BONUS;
        totalAccounts++;
    }

    public double getBalance() { return balance; }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount must be > 0");
        balance += amount;
    }

    public static int totalAccounts() { return totalAccounts; }

    public static void main(String[] args) {
        BankAccount a = new BankAccount("Ada");
        a.deposit(100);
        System.out.println(a.owner + ": " + a.getBalance());
        System.out.println("total = " + BankAccount.totalAccounts());
    }
}
```

Next: how to use these modifiers to enforce **encapsulation**.
