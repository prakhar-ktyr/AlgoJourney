---
title: Java ArrayList and LinkedList
---

# Java ArrayList and LinkedList

`ArrayList` and `LinkedList` are the two everyday `List` implementations.

- **`ArrayList`** — backed by a resizable array. Fast random access and append; slow inserts/removals in the middle.
- **`LinkedList`** — a doubly-linked list. Slow random access; fast inserts/removals when you already have a reference to the node.

For 95 % of code, `ArrayList` is what you want. Reach for `LinkedList` only when profiling shows it actually helps (it almost never does in practice).

## Creating a list

```java
import java.util.ArrayList;
import java.util.List;
import java.util.LinkedList;

List<String> names = new ArrayList<>();
List<String> queue = new LinkedList<>();

// Pre-populated:
List<Integer> primes = new ArrayList<>(List.of(2, 3, 5, 7, 11));
```

## Adding and removing elements

```java
names.add("Ada");           // append
names.add("Linus");
names.add(0, "Grace");      // insert at index 0

names.remove("Ada");        // remove by value (first occurrence)
names.remove(0);            // remove by index

names.set(0, "Bjarne");     // replace at index 0

names.size();                // current size
names.isEmpty();             // true if size == 0
names.clear();               // empty the list
```

## Reading elements

```java
String first = names.get(0);
String last  = names.get(names.size() - 1);

names.contains("Ada");       // true / false
names.indexOf("Linus");      // index, or -1
```

## Iterating

```java
for (int i = 0; i < names.size(); i++) {
    System.out.println(i + ": " + names.get(i));
}

for (String name : names) {       // for-each
    System.out.println(name);
}

names.forEach(System.out::println); // lambda
```

## Modifying while iterating

This is a common bug:

```java
for (String s : names) {
    if (s.isEmpty()) names.remove(s);   // ❌ ConcurrentModificationException
}
```

Use one of these instead:

```java
names.removeIf(String::isEmpty);                    // best

Iterator<String> it = names.iterator();
while (it.hasNext()) {
    if (it.next().isEmpty()) it.remove();
}
```

## Sorting

```java
import java.util.Collections;
Collections.sort(names);                          // natural order
names.sort(null);                                  // same as above
names.sort((a, b) -> a.length() - b.length());    // by length

Collections.reverse(names);
Collections.shuffle(names);
```

For sorting by a property, `Comparator.comparing` is cleaner:

```java
people.sort(Comparator.comparing(Person::age));
people.sort(Comparator.comparing(Person::age).reversed());
people.sort(Comparator.comparing(Person::lastName).thenComparing(Person::firstName));
```

## Sub-list view

```java
List<Integer> nums = new ArrayList<>(List.of(0, 1, 2, 3, 4, 5));
List<Integer> middle = nums.subList(2, 5);   // [2, 3, 4]
```

`subList` returns a **view** — modifying it modifies the original.

## Conversion to/from arrays

```java
String[] arr = names.toArray(new String[0]);
List<String> back = new ArrayList<>(Arrays.asList(arr));
```

`Arrays.asList(arr)` returns a fixed-size list backed by the array — `add` and `remove` will fail. Wrap it in a `new ArrayList<>(...)` if you need to modify it.

## `LinkedList` extras

`LinkedList` also implements `Deque`, so it can be used as a queue or stack:

```java
LinkedList<String> q = new LinkedList<>();
q.addLast("a");          // enqueue
q.addLast("b");
q.removeFirst();         // dequeue → "a"
```

In modern code prefer `ArrayDeque` for these operations — it's faster.

## Pitfall: `List` is generic in **reference** types

You can't write `List<int>`. Use `List<Integer>` and let autoboxing convert:

```java
List<Integer> xs = new ArrayList<>();
xs.add(1);
int v = xs.get(0);     // auto-unboxed
```

If high performance over millions of ints matters, use a primitive array (`int[]`) or a third-party library like Eclipse Collections.

## A complete example

```java
import java.util.*;

public class TodoApp {
    private final List<String> tasks = new ArrayList<>();

    public void add(String task)    { tasks.add(task); }
    public void done(int index)     { tasks.remove(index); }
    public int  remaining()          { return tasks.size(); }

    public void show() {
        if (tasks.isEmpty()) {
            System.out.println("Nothing to do!");
            return;
        }
        for (int i = 0; i < tasks.size(); i++) {
            System.out.println((i + 1) + ". " + tasks.get(i));
        }
    }

    public static void main(String[] args) {
        TodoApp app = new TodoApp();
        app.add("Learn Java collections");
        app.add("Write some tests");
        app.add("Take a break");
        app.show();
        app.done(0);
        System.out.println("---");
        app.show();
    }
}
```

Next: **`HashMap`**.
