---
title: Java HashMap
---

# Java HashMap

A `HashMap` stores **key → value** pairs and lets you look up the value for a key in (amortised) constant time. It is the workhorse for indexes, caches, frequency counts, configuration, and a hundred other things.

## Creating a map

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> ages = new HashMap<>();
```

`Map<K, V>` is the interface; `HashMap` is the most common implementation. The keys and values can be any reference types.

## Adding and reading

```java
ages.put("Ada", 30);
ages.put("Linus", 54);
ages.put("Grace", 90);

ages.get("Ada");                 // 30
ages.get("Bjarne");              // null — not present

ages.getOrDefault("Bjarne", 0);  // 0

ages.containsKey("Linus");       // true
ages.containsValue(90);          // true
```

If you `put` a value with an existing key, the old value is replaced and returned:

```java
Integer prev = ages.put("Ada", 31);   // prev == 30
```

## Removing

```java
ages.remove("Ada");          // returns the old value (or null)
ages.clear();                 // empty the map
ages.size();                  // 0
ages.isEmpty();               // true
```

## Iterating

```java
for (Map.Entry<String, Integer> e : ages.entrySet()) {
    System.out.println(e.getKey() + " → " + e.getValue());
}

ages.forEach((k, v) -> System.out.println(k + " → " + v));

for (String k : ages.keySet())   System.out.println(k);
for (int v : ages.values())      System.out.println(v);
```

`HashMap` does **not** preserve insertion order. Use `LinkedHashMap` if order matters; use `TreeMap` for sorted keys.

## Modify-if-present and absent-only

These methods make common patterns one-liners:

```java
ages.putIfAbsent("Ada", 0);                           // only if not already there
ages.computeIfAbsent("Ada", k -> 0);                  // same, but compute
ages.computeIfPresent("Ada", (k, v) -> v + 1);        // only if present
ages.compute("Ada", (k, v) -> v == null ? 1 : v + 1); // always
ages.merge("Ada", 1, Integer::sum);                   // increment / insert
```

`merge` is the idiomatic way to count occurrences:

```java
Map<String, Integer> counts = new HashMap<>();
for (String w : words) {
    counts.merge(w, 1, Integer::sum);
}
```

## Map-of-list pattern

When you need to group values by key:

```java
Map<String, List<Order>> ordersByCustomer = new HashMap<>();
for (Order o : orders) {
    ordersByCustomer
        .computeIfAbsent(o.customer(), k -> new ArrayList<>())
        .add(o);
}
```

## Immutable maps

```java
Map<String, Integer> roles = Map.of(
    "admin", 1,
    "editor", 2,
    "viewer", 3
);
```

`Map.of` accepts up to 10 entries. For more, use `Map.ofEntries(Map.entry(...), ...)`. These maps cannot be modified.

## How `HashMap` works (the short version)

A `HashMap` keeps an internal array of "buckets". When you `put(k, v)`:

1. It computes `k.hashCode()`.
2. Reduces it to a bucket index.
3. Stores the entry there. If multiple keys land in the same bucket, they form a small linked list (or tree, when many).

Lookups are O(1) on average — provided your keys have a good `hashCode()` and a correct `equals()`. **For custom key classes, override both** (records do it automatically).

```java
public final class CityKey {
    private final String name;
    private final String country;
    public CityKey(String n, String c) { this.name = n; this.country = c; }

    @Override public boolean equals(Object o) {
        if (!(o instanceof CityKey k)) return false;
        return name.equals(k.name) && country.equals(k.country);
    }
    @Override public int hashCode() {
        return java.util.Objects.hash(name, country);
    }
}
```

Or just use a record:

```java
public record CityKey(String name, String country) {}
```

## When to use which `Map`

| Need                                   | Pick                |
| -------------------------------------- | ------------------- |
| Plain hash lookups                     | `HashMap`           |
| Preserve insertion order               | `LinkedHashMap`     |
| Keys sorted (natural or by Comparator) | `TreeMap`           |
| Thread-safe shared map                 | `ConcurrentHashMap` |
| Tiny, fixed contents                   | `Map.of(...)`       |

`null` keys/values are allowed in `HashMap` and `LinkedHashMap` but **not** in `TreeMap` or `ConcurrentHashMap`.

## A complete example: word frequency

```java
import java.util.*;

public class WordFreq {
    public static void main(String[] args) {
        String text = "to be or not to be that is the question";
        Map<String, Integer> counts = new HashMap<>();

        for (String w : text.split(" ")) {
            counts.merge(w, 1, Integer::sum);
        }

        counts.entrySet().stream()
              .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
              .forEach(e -> System.out.println(e.getKey() + ": " + e.getValue()));
    }
}
```

Next: **`HashSet`** and friends.
