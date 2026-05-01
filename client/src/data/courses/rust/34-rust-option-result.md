---
title: Rust Option and Result
---

# Rust Option and Result

`Option` and `Result` are two of the most important enums in Rust. They replace null values and exceptions found in other languages.

---

## Option — Handling Absence

`Option<T>` represents a value that may or may not exist:

```rust
enum Option<T> {
    Some(T),  // contains a value
    None,     // no value
}
```

```rust
fn find_item(items: &[&str], target: &str) -> Option<usize> {
    for (i, &item) in items.iter().enumerate() {
        if item == target {
            return Some(i);
        }
    }
    None
}

fn main() {
    let fruits = vec!["apple", "banana", "cherry"];

    match find_item(&fruits, "banana") {
        Some(idx) => println!("Found at index {}", idx),
        None => println!("Not found"),
    }
}
```

---

## Option Methods

```rust
fn main() {
    let some_val: Option<i32> = Some(42);
    let no_val: Option<i32> = None;

    // unwrap — panics if None
    println!("Unwrap: {}", some_val.unwrap());

    // unwrap_or — default value
    println!("Default: {}", no_val.unwrap_or(0));

    // unwrap_or_else — computed default
    println!("Computed: {}", no_val.unwrap_or_else(|| 10 * 5));

    // map — transform the inner value
    let doubled = some_val.map(|v| v * 2);
    println!("Doubled: {:?}", doubled); // Some(84)

    // is_some / is_none
    println!("Has value: {}", some_val.is_some());
    println!("Is empty: {}", no_val.is_none());
}
```

---

## Result — Handling Errors

`Result<T, E>` represents either success or failure:

```rust
use std::num::ParseIntError;

fn parse_number(s: &str) -> Result<i32, ParseIntError> {
    s.parse::<i32>()
}

fn main() {
    match parse_number("42") {
        Ok(n) => println!("Parsed: {}", n),
        Err(e) => println!("Error: {}", e),
    }

    match parse_number("abc") {
        Ok(n) => println!("Parsed: {}", n),
        Err(e) => println!("Error: {}", e),
    }
}
```

---

## The ? Operator

The `?` operator propagates errors automatically:

```rust
use std::num::ParseIntError;

fn add_strings(a: &str, b: &str) -> Result<i32, ParseIntError> {
    let x = a.parse::<i32>()?;  // returns Err early if parsing fails
    let y = b.parse::<i32>()?;
    Ok(x + y)
}

fn main() {
    match add_strings("10", "20") {
        Ok(sum) => println!("Sum: {}", sum),
        Err(e) => println!("Error: {}", e),
    }

    match add_strings("10", "abc") {
        Ok(sum) => println!("Sum: {}", sum),
        Err(e) => println!("Error: {}", e),
    }
}
```

---

## Result Methods

```rust
fn main() {
    let ok: Result<i32, &str> = Ok(42);
    let err: Result<i32, &str> = Err("something failed");

    println!("{}", ok.unwrap_or(0));       // 42
    println!("{}", err.unwrap_or(0));      // 0

    let mapped = ok.map(|v| v * 2);
    println!("{:?}", mapped);              // Ok(84)

    println!("Is ok: {}", ok.is_ok());
    println!("Is err: {}", err.is_err());
}
```

---

## Converting Between Option and Result

```rust
fn main() {
    // Option → Result
    let opt: Option<i32> = Some(42);
    let res: Result<i32, &str> = opt.ok_or("no value");
    println!("{:?}", res); // Ok(42)

    // Result → Option
    let res: Result<i32, &str> = Ok(42);
    let opt: Option<i32> = res.ok();
    println!("{:?}", opt); // Some(42)
}
```

> [!TIP]
> Rust has **no null** and **no exceptions**. Use `Option` when a value might be absent, and `Result` when an operation might fail. The `?` operator makes error propagation concise and clean.
