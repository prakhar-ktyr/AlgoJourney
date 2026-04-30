---
title: Java Class Attributes
---

# Java Class Attributes

In Java, the variables defined inside a class are called **fields** (or _attributes_ / _instance variables_). They store the state of each object.

## Declaring fields

```java
public class Person {
    String name;        // instance field
    int age;             // instance field
    static int count;   // static field (shared by all Person objects)
}
```

## Default values

If you don't initialize a field, it gets the default value for its type:

| Type      | Default     |
| --------- | ----------- |
| Numeric   | `0` / `0.0` |
| `boolean` | `false`     |
| `char`    | `'\u0000'`  |
| Reference | `null`      |

```java
Person p = new Person();
System.out.println(p.name);    // null
System.out.println(p.age);     // 0
```

## Initialising at declaration

You can give a field an initial value right where you declare it:

```java
public class Settings {
    String theme = "light";
    int    fontSize = 14;
    boolean spellCheck = true;
}
```

Every new object starts with these values. (Constructors, covered later, can override them.)

## Accessing and modifying fields

From outside the class:

```java
Person p = new Person();
p.name = "Ada";
p.age = 30;
System.out.println(p.name);
```

From inside the class (no qualifier needed unless shadowed):

```java
public class Person {
    String name;
    int age;

    void birthday() {
        age++;                   // refers to this object's age
        System.out.println(name + " is now " + age);
    }
}
```

## `this.field`

Use `this.field` to disambiguate when a parameter or local variable has the same name:

```java
public class Person {
    String name;

    void rename(String name) {
        this.name = name;        // field ← parameter
    }
}
```

## `static` fields

A `static` field is **per class**, not per object — every instance shares the same value.

```java
public class Counter {
    static int total = 0;     // shared
    int id;                    // per-object

    Counter() {
        total++;
        id = total;
    }
}

Counter a = new Counter();   // a.id = 1, total = 1
Counter b = new Counter();   // b.id = 2, total = 2
System.out.println(Counter.total);  // 2
```

Access static fields through the **class name**, not an instance.

## `final` fields

`final` means _cannot be reassigned after initialization_.

```java
public class Person {
    final String id;            // must be set in the constructor

    Person(String id) {
        this.id = id;
    }
}
```

Combined with `static`, you get the standard pattern for **constants**:

```java
public class Math2 {
    public static final double PI = 3.14159265358979;
    public static final int MAX_RETRIES = 3;
}
```

## Field access modifiers (preview)

Most real-world fields should be **`private`** — only the class itself can read or write them. Other classes call **getter** and **setter** methods instead. We cover this in detail in the **Encapsulation** lesson.

```java
public class Person {
    private String name;     // hidden

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
```

## A complete example

```java
public class BankAccount {
    static final double STARTING_BONUS = 10.0;
    static int totalAccounts = 0;

    String owner;
    double balance;

    BankAccount(String owner) {
        this.owner = owner;
        this.balance = STARTING_BONUS;
        totalAccounts++;
    }

    public static void main(String[] args) {
        BankAccount a = new BankAccount("Ada");
        BankAccount b = new BankAccount("Linus");

        System.out.println(a.owner + ": " + a.balance);
        System.out.println(b.owner + ": " + b.balance);
        System.out.println("Total accounts: " + BankAccount.totalAccounts);
    }
}
```

Next: **class methods** — adding behaviour.
