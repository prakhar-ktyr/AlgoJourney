---
title: Rust Lifetime Elision
---

# Rust Lifetime Elision

Lifetime elision rules allow the Rust compiler to infer lifetimes in common patterns, so you don't need to annotate them explicitly every time.

---

## The Three Elision Rules

The compiler applies these rules to function signatures:

**Rule 1**: Each input reference parameter gets its own lifetime parameter.

```rust
// You write:
fn foo(x: &str, y: &str) { }
// Compiler sees:
// fn foo<'a, 'b>(x: &'a str, y: &'b str) { }
```

**Rule 2**: If there's exactly one input lifetime, it's assigned to all output lifetimes.

```rust
// You write:
fn first_char(s: &str) -> &str { &s[..1] }
// Compiler infers:
// fn first_char<'a>(s: &'a str) -> &'a str { &s[..1] }
```

**Rule 3**: If one parameter is `&self` or `&mut self`, the lifetime of `self` is assigned to all output lifetimes.

```rust
struct Parser {
    input: String,
}

impl Parser {
    // You write:
    fn get_input(&self) -> &str { &self.input }
    // Compiler infers:
    // fn get_input<'a>(&'a self) -> &'a str { &self.input }
}
```

---

## When Elision Works

Most common function signatures don't need explicit annotations:

```rust
// No output reference — no annotation needed
fn print_length(s: &str) {
    println!("Length: {}", s.len());
}

// One input, one output — Rule 2 applies
fn trim_whitespace(s: &str) -> &str {
    s.trim()
}

// Method with &self — Rule 3 applies
struct Name {
    value: String,
}

impl Name {
    fn as_str(&self) -> &str {
        &self.value
    }
}
```

---

## When You Must Annotate

Explicit lifetimes are required when the compiler can't figure out the relationship:

```rust
// Two input references, one output — compiler can't decide
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

// Struct holding a reference
struct Config<'a> {
    name: &'a str,
}
```

---

## Common Patterns

Here are patterns you'll encounter frequently:

```rust
// Pattern 1: Return part of the input
fn get_first(s: &str) -> &str {
    s.split_whitespace().next().unwrap_or("")
}

// Pattern 2: Method returning a reference to internal data
struct Buffer {
    data: Vec<u8>,
}

impl Buffer {
    fn contents(&self) -> &[u8] {
        &self.data
    }
}

// Pattern 3: Multiple inputs, only one matters
fn with_prefix<'a>(s: &'a str, _prefix: &str) -> &'a str {
    s
}
```

> [!TIP]
> Start by writing your function without lifetime annotations. If the compiler asks for them, add only the minimum annotations needed. Over time, the elision rules will become second nature.
