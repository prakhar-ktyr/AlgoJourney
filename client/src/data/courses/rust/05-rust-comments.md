---
title: Rust Comments
---

# Rust Comments

Comments are used to explain code and are ignored by the compiler. Rust supports several types of comments.

---

## Line Comments

Use `//` for single-line comments:

```rust
fn main() {
    // This is a single-line comment
    let x = 5; // This comment is at the end of a line

    // You can use multiple lines
    // of single-line comments
    println!("x = {}", x);
}
```

---

## Block Comments

Use `/* */` for multi-line block comments:

```rust
fn main() {
    /* This is a
       block comment that spans
       multiple lines */
    let y = 10;

    let z = /* inline comment */ 15;

    println!("y = {}, z = {}", y, z);
}
```

> [!NOTE]
> Unlike C/C++, Rust block comments **can be nested**:
> ```rust
> /* outer /* inner */ still in outer */
> ```

---

## Documentation Comments

Rust has special documentation comments that generate HTML documentation via `cargo doc`.

### Outer Doc Comments (`///`)

Used to document the item that follows (functions, structs, etc.):

```rust
/// Adds two numbers together.
///
/// # Examples
///
/// ```
/// let result = add(2, 3);
/// assert_eq!(result, 5);
/// ```
fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

### Inner Doc Comments (`//!`)

Used to document the enclosing item (usually a module or crate):

```rust
//! # My Awesome Crate
//!
//! This crate provides utility functions
//! for working with numbers.

/// Multiplies two numbers.
fn multiply(a: i32, b: i32) -> i32 {
    a * b
}
```

---

## Generating Documentation

Run the following command to generate and open documentation:

```bash
cargo doc --open
```

This builds HTML documentation from your doc comments and opens it in your browser.

> [!TIP]
> Documentation comments support full Markdown syntax including headings, code blocks, lists, and links. Common sections include `# Examples`, `# Panics`, `# Errors`, and `# Safety`.
