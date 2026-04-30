---
title: Java HashSet
---

# Java HashSet

A `Set` is a collection that **never contains duplicates**. `HashSet` is the standard implementation — it's backed by a `HashMap` under the hood and gives you O(1) average `add`, `remove`, and `contains`.

## Creating a set

```java
import java.util.Set;
import java.util.HashSet;

Set<String> seen = new HashSet<>();
Set<Integer> primes = new HashSet<>(Set.of(2, 3, 5, 7, 11));
```

## Adding and checking

```java
seen.add("Ada");
seen.add("Linus");
boolean isNew = seen.add("Ada");    // false — already present, set unchanged
seen.contains("Ada");                // true
seen.size();                          // 2
```

`add` returns `true` only if the element was actually inserted — handy for deduplicating on the fly.

## Removing

```java
seen.remove("Linus");
seen.removeIf(s -> s.length() < 4);
seen.clear();
```

## Iterating

```java
for (String s : seen) {
    System.out.println(s);
}

seen.forEach(System.out::println);
```

`HashSet` does not preserve insertion order. Use `LinkedHashSet` if order matters; use `TreeSet` for sorted order.

## Set algebra

```java
Set<Integer> a = new HashSet<>(Set.of(1, 2, 3, 4));
Set<Integer> b = new HashSet<>(Set.of(3, 4, 5, 6));

Set<Integer> union = new HashSet<>(a);
union.addAll(b);                  // {1,2,3,4,5,6}

Set<Integer> intersection = new HashSet<>(a);
intersection.retainAll(b);        // {3,4}

Set<Integer> difference = new HashSet<>(a);
difference.removeAll(b);          // {1,2}
```

## Using a `Set` to deduplicate

```java
List<String> tags = List.of("java", "jvm", "java", "spring", "jvm");
Set<String> unique = new HashSet<>(tags);
System.out.println(unique);        // [java, jvm, spring]  — order not guaranteed
```

## Sorted sets — `TreeSet`

`TreeSet` keeps elements in their natural order (or by a custom `Comparator`):

```java
import java.util.TreeSet;

TreeSet<Integer> sorted = new TreeSet<>(Set.of(3, 1, 4, 1, 5, 9, 2, 6));
System.out.println(sorted);         // [1, 2, 3, 4, 5, 6, 9]
System.out.println(sorted.first());  // 1
System.out.println(sorted.last());   // 9

// Range / navigation
sorted.headSet(4);                   // [1, 2, 3]
sorted.tailSet(4);                   // [4, 5, 6, 9]
sorted.floor(5);                     // 5    (largest ≤ 5)
sorted.ceiling(5);                   // 5    (smallest ≥ 5)
sorted.higher(5);                    // 6    (strictly greater)
```

`TreeSet` operations are O(log n) — slower than `HashSet`, but with a useful ordering guarantee.

## Insertion-order — `LinkedHashSet`

`LinkedHashSet` is a `HashSet` with predictable iteration order (insertion order):

```java
Set<String> order = new LinkedHashSet<>();
order.add("z"); order.add("a"); order.add("m");
System.out.println(order);          // [z, a, m]
```

## Custom-element sets

For your own classes, override **both** `equals()` and `hashCode()` — otherwise the set won't recognise duplicates correctly. Or just use a `record`:

```java
record User(String email) {}

Set<User> users = new HashSet<>();
users.add(new User("ada@x"));
users.add(new User("ada@x"));      // duplicate — not added
System.out.println(users.size());   // 1
```

## Immutable sets

```java
Set<String> readOnly = Set.of("a", "b", "c");
readOnly.add("d");                  // ❌ UnsupportedOperationException
```

## A complete example

```java
import java.util.*;

public class FirstUnique {
    public static void main(String[] args) {
        String text = "the quick brown fox jumps over the lazy dog the fox";

        Set<String> seen   = new HashSet<>();
        Set<String> repeats = new HashSet<>();

        for (String w : text.split(" ")) {
            if (!seen.add(w)) {
                repeats.add(w);
            }
        }

        Set<String> uniques = new HashSet<>(seen);
        uniques.removeAll(repeats);

        System.out.println("words used once: " + uniques);
    }
}
```

Next: **iterators**.
