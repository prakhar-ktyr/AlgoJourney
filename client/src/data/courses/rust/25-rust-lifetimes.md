---
title: Rust Lifetimes
---

# Rust Lifetimes

Lifetimes are Rust's way of ensuring that references are always valid. Every reference has a lifetime — the scope for which that reference is valid.

---

## Why Lifetimes?

The compiler needs to know how long references are valid to prevent dangling references:

```rust
fn main() {
    let r;
    {
        let x = 5;
        r = &x;
    } // x is dropped here
    // println!("{}", r); // ERROR: r references dropped value
}
```

The Rust compiler (the **borrow checker**) catches this at compile time.

---

## Lifetime Annotations

When a function returns a reference, Rust needs to know how long it lives. Lifetime annotations use an apostrophe: `'a`.

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("long string");
    let result;
    {
        let s2 = String::from("hi");
        result = longest(&s1, &s2);
        println!("Longest: {}", result);
    }
}
```

- `'a` is a **lifetime parameter** — it's a name for the lifetime.
- `&'a str` means "a reference to a `str` that lives at least as long as `'a`".
- The return type `&'a str` tells the compiler the result lives as long as the shortest input lifetime.

---

## Lifetime Annotations Don't Change Lifetimes

Annotations don't change how long references live. They help the compiler verify that references are valid:

```rust
// This tells the compiler: the returned reference will be valid
// as long as BOTH input references are valid
fn first<'a>(x: &'a str, _y: &'a str) -> &'a str {
    x
}
```

---

## Struct Lifetimes

Structs that hold references need lifetime annotations:

```rust
struct Excerpt<'a> {
    text: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().unwrap();

    let excerpt = Excerpt {
        text: first_sentence,
    };

    println!("Excerpt: {}", excerpt.text);
}
```

> [!IMPORTANT]
> The `Excerpt` struct can't outlive the reference it holds. The lifetime `'a` ensures the `text` reference stays valid as long as the struct exists.

---

## The Static Lifetime

`'static` means the reference lives for the entire program duration:

```rust
fn main() {
    let s: &'static str = "I live forever!";
    println!("{}", s);
}
```

String literals have `'static` lifetime because they're stored in the program's binary.

> [!WARNING]
> Don't use `'static` as a quick fix for lifetime errors. It's rarely the right solution and may hide real bugs.

---

## Multiple Lifetime Parameters

Functions can have multiple lifetime parameters:

```rust
fn first_or_default<'a, 'b>(x: &'a str, default: &'b str) -> &'a str {
    if x.is_empty() {
        // Can't return 'default' here — different lifetime
        // return default; // ERROR
        x
    } else {
        x
    }
}
```

> [!TIP]
> Most of the time, you won't need to write lifetime annotations explicitly — Rust's lifetime elision rules handle the common cases automatically. The next lesson covers these rules.
