---
title: Rust Ownership
---

# Rust Ownership

Ownership is Rust's most unique feature and the foundation of its memory safety guarantees. It enables Rust to make memory safety guarantees **without a garbage collector**.

---

## The Three Rules of Ownership

1. Each value in Rust has an **owner** (a variable).
2. There can only be **one owner** at a time.
3. When the owner goes out of scope, the value is **dropped** (freed).

```rust
fn main() {
    {
        let s = String::from("hello"); // s is the owner
        println!("{}", s);
    } // s goes out of scope → memory is freed automatically
}
```

---

## Stack vs Heap

Understanding where data lives is key to understanding ownership:

| Stack | Heap |
|---|---|
| Fixed-size data | Dynamic-size data |
| Fast allocation | Slower allocation |
| Auto-cleaned on scope exit | Managed by ownership |
| Examples: `i32`, `bool`, `char` | Examples: `String`, `Vec<T>` |

```rust
fn main() {
    let x = 5;                        // stack (i32 is fixed-size)
    let s = String::from("hello");    // heap (String is dynamic)

    println!("{} {}", x, s);
}
```

---

## Move Semantics

When you assign a heap-allocated value to another variable, ownership **moves**:

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // ownership moves from s1 to s2

    // println!("{}", s1); // ERROR: s1 is no longer valid
    println!("{}", s2);    // OK
}
```

This is different from a shallow copy — Rust **invalidates** the original variable to prevent double-free bugs.

---

## Copy Types

Simple scalar types implement the `Copy` trait. They are copied instead of moved:

```rust
fn main() {
    let x = 5;
    let y = x; // x is copied (not moved)

    println!("x={}, y={}", x, y); // both are valid
}
```

Types that implement `Copy`: all integers, `f32`, `f64`, `bool`, `char`, tuples of `Copy` types.

---

## Clone (Deep Copy)

For heap data, use `.clone()` to explicitly create a deep copy:

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1.clone(); // deep copy

    println!("s1={}, s2={}", s1, s2); // both are valid
}
```

> [!WARNING]
> `.clone()` copies all heap data, which can be expensive for large values. Use it intentionally.

---

## Ownership and Functions

Passing a value to a function moves it (just like assignment):

```rust
fn takes_ownership(s: String) {
    println!("Got: {}", s);
} // s is dropped here

fn makes_copy(n: i32) {
    println!("Got: {}", n);
} // n is just a copy, original is unaffected

fn main() {
    let s = String::from("hello");
    takes_ownership(s);
    // println!("{}", s); // ERROR: s was moved

    let x = 5;
    makes_copy(x);
    println!("x is still: {}", x); // OK — i32 is Copy
}
```

---

## Returning Ownership

Functions can transfer ownership back to the caller:

```rust
fn create_string() -> String {
    String::from("hello")
}

fn main() {
    let s = create_string(); // ownership transferred to s
    println!("{}", s);
}
```

> [!TIP]
> Ownership is Rust's alternative to garbage collection. The compiler tracks ownership at compile time with zero runtime cost. In the next lesson, you'll learn about **borrowing** — a way to use values without taking ownership.
