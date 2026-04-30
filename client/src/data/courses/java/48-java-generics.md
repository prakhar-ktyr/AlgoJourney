---
title: Java Generics
---

# Java Generics

**Generics** let you write a class or method once and use it with many different types — while still letting the compiler verify type correctness. Every collection in Java is generic: `List<String>`, `Map<String, Integer>`, `Optional<User>`, …

## Why generics?

Before generics, collections held `Object`s and required casting:

```java
List names = new ArrayList();    // legacy, raw type
names.add("Ada");
String first = (String) names.get(0);   // cast — could throw ClassCastException
```

With generics:

```java
List<String> names = new ArrayList<>();
names.add("Ada");
String first = names.get(0);     // no cast, compile-time safety
```

The mistake `names.add(42)` is now a compile error.

## Generic methods

A method can introduce its own type parameter in `< >` before the return type:

```java
public static <T> T firstOrDefault(List<T> list, T fallback) {
    return list.isEmpty() ? fallback : list.get(0);
}

String s = firstOrDefault(List.of("a", "b"), "?");        // T inferred as String
Integer n = firstOrDefault(List.of(), 42);                 // T inferred as Integer
```

The `<T>` says "this method introduces a new type parameter named T".

## Generic classes

```java
public class Pair<A, B> {
    private final A first;
    private final B second;

    public Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }

    public A first()  { return first; }
    public B second() { return second; }

    @Override public String toString() {
        return "(" + first + ", " + second + ")";
    }
}

Pair<String, Integer> p = new Pair<>("Ada", 30);
System.out.println(p.first());   // Ada
```

## The diamond `<>`

Since Java 7, the type arguments on the right of `=` can be inferred:

```java
List<Map<String, Integer>> data = new ArrayList<>();   // not new ArrayList<Map<String, Integer>>()
```

## Bounded type parameters

Restrict a type parameter to a hierarchy with `extends`:

```java
public static <T extends Comparable<T>> T max(List<T> xs) {
    T best = xs.get(0);
    for (T x : xs) if (x.compareTo(best) > 0) best = x;
    return best;
}

max(List.of(3, 1, 4, 1, 5));     // works because Integer is Comparable
```

`T extends Comparable<T>` reads as "T must be a type that is comparable to itself."

For multiple bounds: `<T extends Number & Comparable<T>>`.

## Wildcards `?`

Wildcards let you write APIs that work with **families** of generic types.

### `? extends T` — covariant (read-only)

```java
public static double sumAll(List<? extends Number> nums) {
    double total = 0;
    for (Number n : nums) total += n.doubleValue();
    return total;
}

sumAll(List.of(1, 2, 3));            // List<Integer> ✅
sumAll(List.of(1.0, 2.0, 3.0));      // List<Double>  ✅
```

You can **read** `Number` from such a list, but you can't safely **add** anything (except `null`) — the compiler doesn't know whether the list is `List<Integer>` or `List<Double>`.

### `? super T` — contravariant (write-only)

```java
public static void addNumbers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
}

addNumbers(new ArrayList<Integer>());
addNumbers(new ArrayList<Number>());
addNumbers(new ArrayList<Object>());
```

You can **add** `Integer`s but reading gives only `Object`.

The mnemonic is **PECS** — _Producer Extends, Consumer Super_. If your method _produces_ T values for the caller, use `extends`; if it _consumes_ T values from the caller, use `super`.

## Type erasure

At runtime, generic type parameters are **erased**. `List<String>` and `List<Integer>` are the same `List` to the JVM. This has practical consequences:

- You can't write `new T()` or `new T[10]` — there's no T at runtime.
- `if (x instanceof List<String>)` is illegal — write `instanceof List<?>`.
- `List<String>.class` doesn't compile; only `List.class` does.

This design preserved backward compatibility with pre-generics Java but is the source of most generics quirks.

## Common generic interfaces

| Interface                                                        | Used for                                |
| ---------------------------------------------------------------- | --------------------------------------- |
| `Comparable<T>`                                                  | Natural ordering of T.                  |
| `Comparator<T>`                                                  | Custom ordering.                        |
| `Iterable<T>` / `Iterator<T>`                                    | Walking through values.                 |
| `Function<T,R>` / `Predicate<T>` / `Consumer<T>` / `Supplier<T>` | Common functional types (next lessons). |

## A complete example

```java
import java.util.*;

public class Box<T> {
    private T value;
    public void   set(T v)     { this.value = v; }
    public T      get()        { return value; }
    public boolean isEmpty()    { return value == null; }

    public static <T> Box<T> of(T value) {
        Box<T> box = new Box<>();
        box.set(value);
        return box;
    }

    public static void main(String[] args) {
        Box<String> name = Box.of("Ada");
        Box<Integer> age = Box.of(30);

        System.out.println(name.get() + " is " + age.get());
    }
}
```

Next: **lambda expressions**.
