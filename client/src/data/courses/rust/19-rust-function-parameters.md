---
title: Rust Function Parameters
---

# Rust Function Parameters

Rust function parameters have specific rules around ownership, borrowing, and mutability. Understanding these patterns is key to writing idiomatic Rust.

---

## Pass by Value (Move)

By default, passing a value to a function **moves** ownership:

```rust
fn take_ownership(s: String) {
    println!("Got: {}", s);
} // s is dropped here

fn main() {
    let message = String::from("hello");
    take_ownership(message);
    // println!("{}", message); // ERROR: message was moved
}
```

> [!NOTE]
> Types that implement the `Copy` trait (like integers, booleans, floats) are **copied** instead of moved.

```rust
fn print_number(n: i32) {
    println!("Number: {}", n);
}

fn main() {
    let x = 42;
    print_number(x);
    println!("x is still: {}", x); // OK — i32 is Copy
}
```

---

## Pass by Reference (Borrowing)

Use `&` to borrow a value without taking ownership:

```rust
fn calculate_length(s: &String) -> usize {
    s.len()
} // s goes out of scope but nothing is dropped (we don't own it)

fn main() {
    let message = String::from("hello");
    let len = calculate_length(&message);
    println!("'{}' has {} bytes", message, len); // message is still valid
}
```

---

## Mutable References

Use `&mut` to borrow mutably — allowing the function to modify the value:

```rust
fn append_exclaim(s: &mut String) {
    s.push_str("!!!");
}

fn main() {
    let mut greeting = String::from("Hello");
    append_exclaim(&mut greeting);
    println!("{}", greeting); // Hello!!!
}
```

> [!IMPORTANT]
> You can have **either** one mutable reference **or** any number of immutable references to the same data at a time — never both. This prevents data races.

---

## Slice Parameters

Functions often accept slices (`&str`, `&[T]`) instead of owned types for maximum flexibility:

```rust
// Accepts both &String and &str
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &byte) in bytes.iter().enumerate() {
        if byte == b' ' {
            return &s[..i];
        }
    }
    s
}

fn main() {
    let owned = String::from("hello world");
    let literal = "foo bar";

    println!("{}", first_word(&owned));   // hello
    println!("{}", first_word(literal));  // foo
}
```

---

## Default-Like Patterns

Rust doesn't have default parameters, but you can use `Option` or builder patterns:

```rust
fn greet(name: &str, greeting: Option<&str>) {
    let g = greeting.unwrap_or("Hello");
    println!("{}, {}!", g, name);
}

fn main() {
    greet("Alice", None);              // Hello, Alice!
    greet("Bob", Some("Good morning")); // Good morning, Bob!
}
```

> [!TIP]
> Prefer `&str` over `&String` and `&[T]` over `&Vec<T>` in function parameters. This makes your functions more flexible by accepting both owned and borrowed values.
