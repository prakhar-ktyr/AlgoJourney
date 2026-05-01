---
title: Rust Iterators
---

# Rust Iterators

Iterators are a core abstraction in Rust for processing sequences of elements lazily and efficiently.

---

## The Iterator Trait

All iterators implement the `Iterator` trait:

```rust
// Simplified definition:
// trait Iterator {
//     type Item;
//     fn next(&mut self) -> Option<Self::Item>;
// }
```

---

## Creating Iterators

```rust
fn main() {
    let v = vec![1, 2, 3, 4, 5];

    // .iter() — borrows elements (&T)
    let iter = v.iter();
    for val in iter {
        print!("{} ", val);
    }
    println!();

    // .iter_mut() — mutable borrows (&mut T)
    let mut v2 = vec![1, 2, 3];
    for val in v2.iter_mut() {
        *val *= 2;
    }
    println!("{:?}", v2); // [2, 4, 6]

    // .into_iter() — takes ownership (T)
    let v3 = vec![1, 2, 3];
    for val in v3.into_iter() {
        print!("{} ", val);
    }
    println!();
    // v3 is no longer usable
}
```

---

## Using next() Manually

```rust
fn main() {
    let v = vec![10, 20, 30];
    let mut iter = v.iter();

    println!("{:?}", iter.next()); // Some(10)
    println!("{:?}", iter.next()); // Some(20)
    println!("{:?}", iter.next()); // Some(30)
    println!("{:?}", iter.next()); // None
}
```

---

## Consuming Adaptors

Methods that consume the iterator and produce a single value:

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);

    let count = numbers.iter().count();
    println!("Count: {}", count);

    let min = numbers.iter().min().unwrap();
    let max = numbers.iter().max().unwrap();
    println!("Min: {}, Max: {}", min, max);

    let product: i32 = numbers.iter().product();
    println!("Product: {}", product);

    // Collecting into a different collection
    let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();
    println!("Doubled: {:?}", doubled);
}
```

---

## Common Iterator Methods

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // any / all
    let has_even = numbers.iter().any(|&x| x % 2 == 0);
    let all_positive = numbers.iter().all(|&x| x > 0);
    println!("Has even: {}, All positive: {}", has_even, all_positive);

    // find
    let first_even = numbers.iter().find(|&&x| x % 2 == 0);
    println!("First even: {:?}", first_even);

    // position
    let pos = numbers.iter().position(|&x| x == 5);
    println!("Position of 5: {:?}", pos);

    // fold (reduce)
    let sum = numbers.iter().fold(0, |acc, &x| acc + x);
    println!("Fold sum: {}", sum);
}
```

---

## Range Iterators

```rust
fn main() {
    let sum: i32 = (1..=100).sum();
    println!("Sum 1-100: {}", sum);

    let evens: Vec<i32> = (0..20).filter(|x| x % 2 == 0).collect();
    println!("Evens: {:?}", evens);
}
```

> [!TIP]
> Iterators in Rust are **lazy** — they do nothing until consumed. They are also **zero-cost**: the compiler optimizes iterator chains into loops as efficient as hand-written code.
