---
title: Rust For Loops
---

# Rust For Loops

The `for` loop is the most common loop in Rust. It iterates over an **iterator**, making it safe and concise.

---

## Iterating Over a Range

```rust
fn main() {
    // Exclusive range: 1 to 4
    for i in 1..5 {
        println!("{}", i);
    }

    // Inclusive range: 1 to 5
    for i in 1..=5 {
        print!("{} ", i);
    }
    println!();
}
```

---

## Iterating Over Arrays and Vectors

```rust
fn main() {
    let fruits = ["apple", "banana", "cherry"];

    for fruit in fruits {
        println!("I like {}", fruit);
    }

    let numbers = vec![10, 20, 30, 40];

    for num in &numbers {
        println!("Number: {}", num);
    }

    // numbers is still usable here because we borrowed it
    println!("Total items: {}", numbers.len());
}
```

> [!NOTE]
> Use `&collection` to borrow items without consuming the collection. Without `&`, the collection is moved and can't be used afterward.

---

## Enumerate — Getting the Index

```rust
fn main() {
    let colors = vec!["red", "green", "blue"];

    for (index, color) in colors.iter().enumerate() {
        println!("{}: {}", index, color);
    }
}
```

**Output:**

```
0: red
1: green
2: blue
```

---

## Iterating Over Strings

```rust
fn main() {
    let message = "Rust!";

    for ch in message.chars() {
        print!("'{}' ", ch);
    }
    println!();
}
```

---

## Reverse Iteration

```rust
fn main() {
    for i in (1..=5).rev() {
        println!("{}", i);
    }
    // Output: 5, 4, 3, 2, 1
}
```

---

## For with Break and Continue

```rust
fn main() {
    for i in 1..=20 {
        if i % 2 == 0 {
            continue; // skip even numbers
        }
        if i > 10 {
            break; // stop at 10
        }
        println!("{}", i); // 1, 3, 5, 7, 9
    }
}
```

---

## Nested For Loops

```rust
fn main() {
    for row in 1..=3 {
        for col in 1..=3 {
            print!("({},{}) ", row, col);
        }
        println!();
    }
}
```

> [!TIP]
> Rust's `for` loop works with anything that implements the `IntoIterator` trait. This includes ranges, arrays, vectors, hash maps, strings, and custom types.
