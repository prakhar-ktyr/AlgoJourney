---
title: Rust Iterator Adaptors
---

# Rust Iterator Adaptors

Iterator adaptors transform one iterator into another. They are lazy — they only process elements when consumed.

---

## map — Transform Each Element

```rust
fn main() {
    let names = vec!["alice", "bob", "charlie"];

    let uppercased: Vec<String> = names.iter()
        .map(|name| name.to_uppercase())
        .collect();

    println!("{:?}", uppercased);
    // ["ALICE", "BOB", "CHARLIE"]
}
```

---

## filter — Keep Matching Elements

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    let evens: Vec<&i32> = numbers.iter()
        .filter(|&&x| x % 2 == 0)
        .collect();

    println!("Evens: {:?}", evens);
}
```

---

## Chaining Adaptors

```rust
fn main() {
    let words = vec!["hello", "world", "rust", "is", "great"];

    let result: Vec<String> = words.iter()
        .filter(|w| w.len() > 3)
        .map(|w| w.to_uppercase())
        .collect();

    println!("{:?}", result); // ["HELLO", "WORLD", "RUST", "GREAT"]
}
```

---

## enumerate — Get Index and Value

```rust
fn main() {
    let fruits = vec!["apple", "banana", "cherry"];

    for (i, fruit) in fruits.iter().enumerate() {
        println!("{}: {}", i, fruit);
    }
}
```

---

## zip — Combine Two Iterators

```rust
fn main() {
    let names = vec!["Alice", "Bob", "Charlie"];
    let scores = vec![95, 87, 92];

    let results: Vec<(&str, &i32)> = names.iter()
        .zip(scores.iter())
        .collect();

    for (name, score) in &results {
        println!("{}: {}", name, score);
    }
}
```

---

## take, skip, and chain

```rust
fn main() {
    let nums: Vec<i32> = (1..=10).collect();

    // Take first 3
    let first_three: Vec<&i32> = nums.iter().take(3).collect();
    println!("First 3: {:?}", first_three);

    // Skip first 7
    let last_three: Vec<&i32> = nums.iter().skip(7).collect();
    println!("Last 3: {:?}", last_three);

    // Chain two iterators
    let a = vec![1, 2, 3];
    let b = vec![4, 5, 6];
    let combined: Vec<&i32> = a.iter().chain(b.iter()).collect();
    println!("Combined: {:?}", combined);
}
```

---

## flat_map — Flatten Nested Iterators

```rust
fn main() {
    let sentences = vec!["hello world", "rust is great"];

    let words: Vec<&str> = sentences.iter()
        .flat_map(|s| s.split_whitespace())
        .collect();

    println!("{:?}", words);
    // ["hello", "world", "rust", "is", "great"]
}
```

---

## inspect — Debug Without Consuming

```rust
fn main() {
    let sum: i32 = (1..=5)
        .inspect(|x| println!("Before filter: {}", x))
        .filter(|x| x % 2 == 0)
        .inspect(|x| println!("After filter: {}", x))
        .sum();

    println!("Sum of evens: {}", sum);
}
```

> [!TIP]
> Iterator adaptor chains are compiled into efficient loops by the Rust compiler. Don't be afraid to chain multiple adaptors — it's both idiomatic and performant.
