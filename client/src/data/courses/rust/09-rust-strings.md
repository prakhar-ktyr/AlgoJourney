---
title: Rust Strings
---

# Rust Strings

Rust has two main string types: `String` (owned, growable) and `&str` (borrowed, immutable slice). Understanding the difference is essential.

---

## String Types

| Type | Ownership | Mutability | Stored |
|---|---|---|---|
| `String` | Owned | Growable / mutable | Heap |
| `&str` | Borrowed | Immutable | Stack or static |

```rust
fn main() {
    let s1: &str = "Hello";           // string slice (literal)
    let s2: String = String::from("Hello"); // owned String

    println!("{} {}", s1, s2);
}
```

---

## Creating Strings

```rust
fn main() {
    // From a literal
    let s1 = String::from("Hello");

    // Using .to_string()
    let s2 = "World".to_string();

    // Empty string
    let s3 = String::new();

    // With capacity
    let s4 = String::with_capacity(50);

    println!("{} {} (empty: '{}') (cap: {})", s1, s2, s3, s4.capacity());
}
```

---

## String Operations

### Concatenation

```rust
fn main() {
    let mut greeting = String::from("Hello");
    greeting.push(' ');           // push a single char
    greeting.push_str("World");   // push a string slice

    println!("{}", greeting); // Hello World

    // Using + operator (consumes the first String)
    let hello = String::from("Hello");
    let world = String::from(" World");
    let message = hello + &world; // hello is moved here
    println!("{}", message);

    // Using format! macro (does not consume anything)
    let first = String::from("Rust");
    let second = String::from("Language");
    let combined = format!("{} {}", first, second);
    println!("{}", combined);
}
```

> [!NOTE]
> The `+` operator takes ownership of the left-hand `String`. Use `format!` when you want to keep all original strings.

---

## String Slicing

You can borrow a portion of a string as a `&str`:

```rust
fn main() {
    let s = String::from("Hello, World!");

    let hello = &s[0..5];   // "Hello"
    let world = &s[7..12];  // "World"

    println!("{} {}", hello, world);
}
```

> [!WARNING]
> String slicing uses **byte indices**, not character indices. Slicing in the middle of a multi-byte UTF-8 character will panic.

---

## Iterating Over Strings

```rust
fn main() {
    let s = String::from("Rust 🦀");

    // Iterate over characters
    for ch in s.chars() {
        print!("'{}' ", ch);
    }
    println!();

    // Iterate over bytes
    for b in s.bytes() {
        print!("{} ", b);
    }
    println!();
}
```

---

## Common String Methods

```rust
fn main() {
    let s = String::from("  Hello, Rust!  ");

    println!("len: {}", s.len());             // 16 (bytes)
    println!("is_empty: {}", s.is_empty());   // false
    println!("trim: '{}'", s.trim());         // 'Hello, Rust!'
    println!("contains: {}", s.contains("Rust")); // true
    println!("starts_with: {}", s.starts_with("  H")); // true
    println!("to_upper: {}", s.to_uppercase());
    println!("to_lower: {}", s.to_lowercase());

    let csv = "one,two,three";
    let parts: Vec<&str> = csv.split(',').collect();
    println!("split: {:?}", parts); // ["one", "two", "three"]

    let replaced = s.replace("Rust", "World");
    println!("replaced: {}", replaced);
}
```

---

## Converting Between String and &str

```rust
fn main() {
    // &str → String
    let slice: &str = "hello";
    let owned: String = slice.to_string();
    let also_owned: String = String::from(slice);

    // String → &str
    let borrowed: &str = &owned;

    println!("{} {} {}", owned, also_owned, borrowed);
}
```

> [!TIP]
> Function parameters should generally accept `&str` rather than `String` — this is more flexible since both `String` and `&str` can be passed via borrowing.
