---
title: Java Iterators
---

# Java Iterators

An **iterator** lets you walk through a collection one element at a time. The for-each loop, lambdas, and streams all use iterators under the hood — but knowing how to use one directly unlocks safe in-place modification and gives you a uniform tool that works on any `Iterable`.

## The `Iterator<E>` interface

```java
public interface Iterator<E> {
    boolean hasNext();
    E       next();
    default void remove() { throw new UnsupportedOperationException(); }
}
```

Every collection (`List`, `Set`, `Queue`, …) provides one via `.iterator()`.

## Manual iteration

```java
import java.util.*;

List<String> names = new ArrayList<>(List.of("Ada", "Linus", "Grace"));

Iterator<String> it = names.iterator();
while (it.hasNext()) {
    String name = it.next();
    System.out.println(name);
}
```

The for-each loop is just sugar for the same thing:

```java
for (String name : names) { ... }
```

## Safe removal during iteration

This is the **only** safe way to remove elements while iterating — calling `list.remove(...)` directly inside a for-each throws `ConcurrentModificationException`.

```java
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    if (it.next().startsWith("L")) {
        it.remove();
    }
}
```

For most cases, `removeIf` is even nicer:

```java
names.removeIf(s -> s.startsWith("L"));
```

## `ListIterator` — bidirectional and editable

`List` also exposes `ListIterator`, which can move forward _and_ backward and replace or insert elements:

```java
ListIterator<String> li = names.listIterator();
while (li.hasNext()) {
    String n = li.next();
    if (n.equals("Ada")) {
        li.set("Augusta Ada");
    }
}

while (li.hasPrevious()) {
    System.out.println(li.previous());
}
```

## Making your own class iterable

Implement `Iterable<E>` so your class can be used in a for-each loop and with streams:

```java
import java.util.Iterator;
import java.util.NoSuchElementException;

public class Range implements Iterable<Integer> {
    private final int from, to;
    public Range(int from, int to) { this.from = from; this.to = to; }

    @Override
    public Iterator<Integer> iterator() {
        return new Iterator<>() {
            int next = from;

            @Override public boolean hasNext() { return next < to; }
            @Override public Integer next() {
                if (!hasNext()) throw new NoSuchElementException();
                return next++;
            }
        };
    }
}

for (int i : new Range(0, 5)) System.out.println(i);   // 0 1 2 3 4
```

## Iterating maps

A `Map` is not itself iterable, but its three views are:

```java
Map<String, Integer> ages = Map.of("Ada", 30, "Linus", 54);

for (String key : ages.keySet())             { ... }
for (int    v   : ages.values())             { ... }
for (var entry  : ages.entrySet())           { ... }
ages.forEach((k, v) -> System.out.println(k + ": " + v));
```

## `Iterable` vs `Stream`

- An **iterator** is _pull-based_: you ask for the next element.
- A **stream** is _push-based_: you describe a pipeline of operations and the stream runs them.

For declarative transformations (`map`, `filter`, `reduce`) prefer streams. For low-level walking with side effects, an iterator is fine.

## A complete example: filter + remove

```java
import java.util.*;

public class IteratorDemo {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6, 7, 8));

        // Print, remove evens
        Iterator<Integer> it = nums.iterator();
        while (it.hasNext()) {
            int n = it.next();
            System.out.println(n);
            if (n % 2 == 0) it.remove();
        }

        System.out.println("after: " + nums);   // [1, 3, 5, 7]
    }
}
```

Next: **generics**.
