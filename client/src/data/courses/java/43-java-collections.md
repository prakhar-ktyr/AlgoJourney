---
title: Java Collections Framework
---

# Java Collections Framework

Arrays are fixed-size and limited. The **Java Collections Framework** (in `java.util`) gives you dynamic, type-safe data structures — lists, sets, queues, maps, and more — plus algorithms to operate on them.

This lesson is the map of the territory; the next lessons cover the most-used types in depth.

## The core interfaces

```
Iterable
   │
Collection
   ├─ List          — ordered, indexed, allows duplicates
   ├─ Set           — no duplicates
   │     └─ SortedSet → NavigableSet
   ├─ Queue         — FIFO / priority
   │     └─ Deque   — double-ended (use as queue or stack)

Map (separate hierarchy — does NOT extend Collection)
   ├─ key/value pairs, no duplicate keys
   └─ SortedMap → NavigableMap
```

You **program against the interface**, not the implementation:

```java
List<String> names = new ArrayList<>();   // declared as List, instantiated as ArrayList
Map<String, Integer> ages = new HashMap<>();
```

That way you can swap implementations later without rewriting callers.

## The most useful implementations

| Interface          | Pick this by default | Notes / when to choose differently                                                                          |
| ------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `List`             | **`ArrayList`**      | `LinkedList` for very frequent insertions in the middle.                                                    |
| `Set`              | **`HashSet`**        | `LinkedHashSet` for insertion order; `TreeSet` for sorted order.                                            |
| `Map`              | **`HashMap`**        | `LinkedHashMap` for insertion order; `TreeMap` for sorted keys; `ConcurrentHashMap` for multi-threaded use. |
| `Deque`            | **`ArrayDeque`**     | Use as a stack or a fast queue.                                                                             |
| `Queue` (priority) | `PriorityQueue`      | Min-heap by default.                                                                                        |

## Generics

Collections are **generic** — you parameterise them with the element type. The compiler then enforces type-safety:

```java
List<String> names = new ArrayList<>();
names.add("Ada");
names.add(42);                 // ❌ compile error

String first = names.get(0);   // no cast needed
```

The empty `<>` (the _diamond_) lets the compiler infer the type from the variable.

## Iterating

The for-each loop works on any `Iterable`:

```java
for (String name : names) {
    System.out.println(name);
}
```

Lambdas:

```java
names.forEach(System.out::println);
```

## A whirlwind tour

```java
import java.util.*;

List<Integer> nums = new ArrayList<>();
nums.add(3); nums.add(1); nums.add(4);
Collections.sort(nums);          // [1, 3, 4]
nums.contains(2);                 // false
nums.size();                      // 3

Set<String> unique = new HashSet<>(List.of("a", "b", "a", "c"));
System.out.println(unique);       // [a, b, c] — duplicate gone

Map<String, Integer> ages = new HashMap<>();
ages.put("Ada", 30);
ages.put("Linus", 54);
System.out.println(ages.get("Ada"));   // 30

Deque<Integer> stack = new ArrayDeque<>();
stack.push(1); stack.push(2); stack.push(3);
stack.pop();                      // 3 — LIFO
```

## Immutable factory methods (Java 9+)

Quickly create small read-only collections:

```java
List<String> days   = List.of("Mon", "Tue", "Wed");
Set<Integer> primes = Set.of(2, 3, 5, 7);
Map<String, Integer> ages = Map.of("Ada", 30, "Linus", 54);
```

These are **unmodifiable**: calling `.add(...)` throws `UnsupportedOperationException`.

For copies:

```java
List<String> snapshot = List.copyOf(mutableList);
```

## The `Collections` utility class

Static helpers for any collection:

```java
Collections.sort(list);
Collections.reverse(list);
Collections.shuffle(list);
Collections.max(list);
Collections.min(list);
Collections.frequency(list, target);
Collections.unmodifiableList(list);
```

For arrays the equivalent is `Arrays`.

## Picking the right collection

Quick decision guide:

- **Need to keep insertion order and access by index?** → `ArrayList`.
- **Need fast contains/uniqueness?** → `HashSet`.
- **Need fast key→value lookup?** → `HashMap`.
- **Need sorted iteration?** → `TreeSet` / `TreeMap`.
- **Need a stack or queue?** → `ArrayDeque`.
- **Need a priority queue?** → `PriorityQueue`.

## Conversions

```java
String[] arr = list.toArray(new String[0]);
List<String> back = Arrays.asList(arr);     // fixed-size view
List<String> mutable = new ArrayList<>(Arrays.asList(arr));
```

## Performance cheatsheet

| Operation        | `ArrayList`    | `LinkedList`       | `HashMap` get/put | `TreeMap` |
| ---------------- | -------------- | ------------------ | ----------------- | --------- |
| index access     | O(1)           | O(n)               | —                 | —         |
| insert at end    | O(1) amortised | O(1)               | —                 | —         |
| insert at middle | O(n)           | O(1) at known node | —                 | —         |
| `contains`       | O(n)           | O(n)               | O(1) avg          | O(log n)  |

The next lessons drill into `ArrayList`, `LinkedList`, `HashMap`, `HashSet`, and iterators.
