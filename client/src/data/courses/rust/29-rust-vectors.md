---
title: Rust Vectors
---

# Rust Vectors

`Vec<T>` is Rust's dynamically-sized, heap-allocated array. It's the most commonly used collection type.

---

## Creating Vectors

```rust
fn main() {
    // Empty vector with type annotation
    let v1: Vec<i32> = Vec::new();

    // Using the vec! macro
    let v2 = vec![1, 2, 3, 4, 5];

    // With initial capacity
    let v3: Vec<String> = Vec::with_capacity(10);

    println!("{:?} {:?} cap={}", v1, v2, v3.capacity());
}
```

---

## Adding and Removing Elements

```rust
fn main() {
    let mut v = vec![1, 2, 3];

    v.push(4);            // add to end
    v.push(5);
    println!("After push: {:?}", v);

    v.pop();              // remove last element
    println!("After pop: {:?}", v);

    v.insert(1, 10);     // insert at index 1
    println!("After insert: {:?}", v);

    v.remove(0);          // remove at index 0
    println!("After remove: {:?}", v);
}
```

---

## Accessing Elements

```rust
fn main() {
    let v = vec![10, 20, 30, 40, 50];

    // Direct indexing (panics if out of bounds)
    println!("Index 2: {}", v[2]);

    // Safe access with .get() (returns Option)
    match v.get(10) {
        Some(val) => println!("Got: {}", val),
        None => println!("Index out of bounds!"),
    }

    // First and last
    println!("First: {:?}", v.first());
    println!("Last: {:?}", v.last());
}
```

---

## Iterating

```rust
fn main() {
    let v = vec![1, 2, 3, 4, 5];

    // Immutable iteration
    for val in &v {
        print!("{} ", val);
    }
    println!();

    // Mutable iteration
    let mut v2 = vec![1, 2, 3];
    for val in &mut v2 {
        *val *= 2;
    }
    println!("{:?}", v2); // [2, 4, 6]
}
```

---

## Useful Methods

```rust
fn main() {
    let mut v = vec![3, 1, 4, 1, 5, 9, 2, 6];

    println!("Length: {}", v.len());
    println!("Is empty: {}", v.is_empty());
    println!("Contains 5: {}", v.contains(&5));

    v.sort();
    println!("Sorted: {:?}", v);

    v.dedup();
    println!("Deduped: {:?}", v);

    v.reverse();
    println!("Reversed: {:?}", v);

    // Retain only even numbers
    v.retain(|&x| x % 2 == 0);
    println!("Evens: {:?}", v);
}
```

---

## Slicing Vectors

```rust
fn sum(slice: &[i32]) -> i32 {
    slice.iter().sum()
}

fn main() {
    let v = vec![10, 20, 30, 40, 50];

    println!("Total: {}", sum(&v));       // all elements
    println!("Partial: {}", sum(&v[1..4])); // elements 1-3
}
```

> [!TIP]
> `Vec<T>` automatically manages memory. When a vector grows beyond its capacity, it allocates a new, larger buffer and moves the elements. Use `with_capacity()` when you know the approximate size to avoid reallocations.
