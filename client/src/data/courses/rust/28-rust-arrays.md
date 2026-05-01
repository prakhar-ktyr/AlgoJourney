---
title: Rust Arrays
---

# Rust Arrays

Arrays in Rust have a **fixed length** and hold elements of the **same type**. They are stack-allocated, making them very efficient.

---

## Creating Arrays

```rust
fn main() {
    let numbers: [i32; 5] = [1, 2, 3, 4, 5];
    let names = ["Alice", "Bob", "Charlie"]; // type inferred

    // Initialize all elements to the same value
    let zeros = [0; 10]; // ten zeros

    println!("{:?}", numbers);
    println!("{:?}", names);
    println!("{:?}", zeros);
}
```

The type `[i32; 5]` means "an array of 5 `i32` values". The length is part of the type.

---

## Accessing Elements

```rust
fn main() {
    let arr = [10, 20, 30, 40, 50];

    println!("First: {}", arr[0]);
    println!("Last: {}", arr[4]);
    println!("Length: {}", arr.len());
}
```

> [!WARNING]
> Accessing an index out of bounds causes a **panic** at runtime. Rust does bounds checking on every array access.

---

## Iterating Over Arrays

```rust
fn main() {
    let arr = [10, 20, 30, 40, 50];

    // By reference
    for val in &arr {
        print!("{} ", val);
    }
    println!();

    // With index
    for (i, val) in arr.iter().enumerate() {
        println!("[{}] = {}", i, val);
    }
}
```

---

## Mutable Arrays

```rust
fn main() {
    let mut arr = [1, 2, 3, 4, 5];

    arr[0] = 10;
    arr[4] = 50;

    println!("{:?}", arr); // [10, 2, 3, 4, 50]
}
```

---

## Array Methods

```rust
fn main() {
    let arr = [3, 1, 4, 1, 5, 9, 2, 6];

    println!("Length: {}", arr.len());
    println!("Contains 5: {}", arr.contains(&5));
    println!("Is empty: {}", arr.is_empty());

    // Slicing
    let slice = &arr[2..5];
    println!("Slice: {:?}", slice); // [4, 1, 5]

    // Sorting (needs mutable copy)
    let mut sorted = arr;
    sorted.sort();
    println!("Sorted: {:?}", sorted);
}
```

---

## Arrays vs Vectors

| Feature | Array `[T; N]` | Vector `Vec<T>` |
|---|---|---|
| Size | Fixed at compile time | Dynamic (growable) |
| Storage | Stack | Heap |
| Performance | Slightly faster | Very fast |
| Use case | Known, fixed size | Unknown or changing size |

> [!TIP]
> Use arrays when the size is known at compile time. Use `Vec<T>` (covered next lesson) when you need a dynamically sized collection.
