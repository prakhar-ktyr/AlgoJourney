---
title: Rust Borrowing and References
---

# Rust Borrowing and References

Borrowing lets you use a value **without taking ownership**. You create a reference using `&`.

---

## Immutable References

```rust
fn calculate_length(s: &String) -> usize {
    s.len()
}

fn main() {
    let s = String::from("hello");
    let len = calculate_length(&s); // borrow s

    println!("'{}' has length {}", s, len); // s is still valid
}
```

- `&s` creates a **reference** to `s` without moving ownership.
- The function parameter `s: &String` indicates it borrows a `String`.

---

## Mutable References

Use `&mut` to borrow a value and modify it:

```rust
fn add_suffix(s: &mut String) {
    s.push_str(" world");
}

fn main() {
    let mut s = String::from("hello");
    add_suffix(&mut s);
    println!("{}", s); // hello world
}
```

---

## Borrowing Rules

Rust enforces two strict rules at compile time:

1. You can have **any number of immutable references** (`&T`).
2. You can have **exactly one mutable reference** (`&mut T`).
3. You **cannot** have both at the same time.

```rust
fn main() {
    let mut s = String::from("hello");

    // Multiple immutable borrows — OK
    let r1 = &s;
    let r2 = &s;
    println!("{} and {}", r1, r2);

    // Mutable borrow — OK (r1 and r2 are no longer used)
    let r3 = &mut s;
    r3.push_str("!");
    println!("{}", r3);
}
```

> [!IMPORTANT]
> These rules prevent **data races** at compile time. A data race occurs when two pointers access the same data simultaneously and at least one is writing.

---

## Dangling References

Rust prevents dangling references at compile time:

```rust
// This will NOT compile:
// fn dangle() -> &String {
//     let s = String::from("hello");
//     &s // s is dropped here — reference would be invalid!
// }

// Instead, return the owned value:
fn no_dangle() -> String {
    let s = String::from("hello");
    s // ownership is moved out
}

fn main() {
    let s = no_dangle();
    println!("{}", s);
}
```

---

## Reference Scope (Non-Lexical Lifetimes)

References are valid from where they're created until their **last use** (not until the end of the block):

```rust
fn main() {
    let mut s = String::from("hello");

    let r1 = &s;
    println!("{}", r1); // last use of r1

    // r1 is no longer in use, so mutable borrow is OK
    let r2 = &mut s;
    r2.push_str(" world");
    println!("{}", r2);
}
```

> [!TIP]
> Think of borrowing like a library book: you can let many people read it (immutable borrows), or let one person edit it (mutable borrow), but not both at the same time.
