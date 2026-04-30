---
title: Java Inner Classes
---

# Java Inner Classes

A class declared inside another class is a **nested class**. Java has four flavours.

| Flavour                      | Declared with                           | Has access to enclosing instance?                  |
| ---------------------------- | --------------------------------------- | -------------------------------------------------- |
| **Static nested class**      | `static class Foo` inside another class | No                                                 |
| **Inner class** (non-static) | `class Foo` inside another class        | Yes                                                |
| **Local class**              | `class Foo` inside a method             | Yes (and to local vars that are effectively final) |
| **Anonymous class**          | `new SomeType() { ... }`                | Yes                                                |

## 1. Static nested class

A self-contained helper that just happens to live inside another class. It has no implicit reference to an enclosing object — you can use it without creating an instance of the outer class.

```java
public class Outer {
    static class Pair {
        final int a, b;
        Pair(int a, int b) { this.a = a; this.b = b; }
    }

    public static void main(String[] args) {
        Pair p = new Outer.Pair(1, 2);
        System.out.println(p.a + ", " + p.b);
    }
}
```

Use this when the nested class is logically part of the outer class but doesn't need its data. It's the most common nested-class form.

## 2. Inner (non-static) class

Bound to an instance of the outer class. It can access _all_ members of that instance, including private ones.

```java
public class LinkedList {
    private Node head;

    private class Node {           // inner — needs an outer instance
        Object value;
        Node   next;
    }

    public void prepend(Object v) {
        Node n = new Node();        // uses 'this' (the outer LinkedList) implicitly
        n.value = v;
        n.next = head;
        head = n;
    }
}
```

To create an inner class instance from outside the enclosing class, you need an outer instance:

```java
LinkedList list = new LinkedList();
LinkedList.Node n = list.new Node();   // unusual syntax — rarely needed
```

## 3. Local class

Declared inside a method. Useful for one-off helpers that need access to the method's local variables.

```java
public List<Runnable> tasks(int n) {
    class PrintTask implements Runnable {
        @Override public void run() { System.out.println(n); }
    }
    return List.of(new PrintTask(), new PrintTask());
}
```

A local class can capture local variables that are **`final` or effectively final** (never reassigned).

## 4. Anonymous class

A class definition and a single instance combined into one expression. Pre-Java-8, this was the standard way to provide a callback or implement a small interface.

```java
button.addActionListener(new ActionListener() {
    @Override public void actionPerformed(ActionEvent e) {
        System.out.println("clicked");
    }
});
```

Modern Java often replaces these with **lambdas** (covered later):

```java
button.addActionListener(e -> System.out.println("clicked"));
```

Lambdas only work for **functional interfaces** (one abstract method). Anonymous classes are still useful when you need to override several methods or extend a class.

## When to use which

- **Static nested class** → for a helper type that's logically scoped to its outer class.
- **Inner class** → when the helper genuinely needs the outer object's state (e.g. a custom iterator).
- **Local class** → rare; usually a private helper method or a lambda is cleaner.
- **Anonymous class** → when you need to override more than one method or extend a class for a one-off use; otherwise prefer a lambda.

## A complete example

```java
public class Counter {
    private int value;

    // Inner class — sees Counter's private 'value'
    public class Snapshot {
        private final int captured = value;
        public int captured() { return captured; }
    }

    public Snapshot snapshot() { return new Snapshot(); }
    public void increment()    { value++; }

    public static void main(String[] args) {
        Counter c = new Counter();
        c.increment();
        c.increment();

        Counter.Snapshot s = c.snapshot();
        c.increment();

        System.out.println(s.captured());   // 2 (snapshot is unaffected)
    }
}
```

Next: **abstract classes**.
