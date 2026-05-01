---
title: Rust HashMaps
---

# Rust HashMaps

`HashMap<K, V>` stores key-value pairs. Keys must be unique and implement `Eq` and `Hash` traits.

---

## Creating HashMaps

```rust
use std::collections::HashMap;

fn main() {
    // Empty HashMap
    let mut scores: HashMap<String, i32> = HashMap::new();
    scores.insert(String::from("Alice"), 95);
    scores.insert(String::from("Bob"), 87);

    println!("{:?}", scores);

    // From arrays of tuples
    let colors = HashMap::from([
        ("red", "#FF0000"),
        ("green", "#00FF00"),
        ("blue", "#0000FF"),
    ]);

    println!("{:?}", colors);
}
```

---

## Accessing Values

```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert("name", "Alice");
    map.insert("city", "Paris");

    // Direct access (returns Option)
    if let Some(name) = map.get("name") {
        println!("Name: {}", name);
    }

    // With default
    let country = map.get("country").unwrap_or(&"Unknown");
    println!("Country: {}", country);
}
```

---

## Updating Values

```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();

    // Insert or overwrite
    map.insert("key", 1);
    map.insert("key", 2); // overwrites
    println!("Overwrite: {:?}", map);

    // Insert only if key doesn't exist
    map.entry("key").or_insert(99);   // ignored (key exists)
    map.entry("new").or_insert(42);   // inserted
    println!("Entry: {:?}", map);

    // Update based on old value
    let mut word_count = HashMap::new();
    let text = "hello world hello rust hello";

    for word in text.split_whitespace() {
        let count = word_count.entry(word).or_insert(0);
        *count += 1;
    }
    println!("Counts: {:?}", word_count);
}
```

---

## Iterating

```rust
use std::collections::HashMap;

fn main() {
    let map = HashMap::from([
        ("Alice", 95),
        ("Bob", 87),
        ("Charlie", 92),
    ]);

    for (name, score) in &map {
        println!("{}: {}", name, score);
    }

    // Keys only
    let keys: Vec<&&str> = map.keys().collect();
    println!("Keys: {:?}", keys);

    // Values only
    let values: Vec<&i32> = map.values().collect();
    println!("Values: {:?}", values);
}
```

---

## Removing Entries

```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::from([
        ("a", 1), ("b", 2), ("c", 3),
    ]);

    map.remove("b");
    println!("After remove: {:?}", map);

    // Retain only entries matching a condition
    map.retain(|_, v| *v > 1);
    println!("After retain: {:?}", map);
}
```

> [!TIP]
> `HashMap` does not preserve insertion order. If you need ordered keys, use `BTreeMap` from `std::collections`.
