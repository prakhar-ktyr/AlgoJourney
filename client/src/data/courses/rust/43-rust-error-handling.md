---
title: Rust Error Handling
---

# Rust Error Handling

Rust has no exceptions. Instead, it uses `Result<T, E>` for recoverable errors and `panic!` for unrecoverable errors.

---

## Unrecoverable Errors with panic!

```rust
fn main() {
    // panic! immediately stops the program
    // panic!("Something went terribly wrong!");

    // Common causes of panics:
    let v = vec![1, 2, 3];
    // let x = v[99]; // index out of bounds — panics!

    println!("Program continues normally");
}
```

> [!WARNING]
> Use `panic!` only for truly unrecoverable situations — bugs, violated invariants, or during prototyping. For expected failures, use `Result`.

---

## Recoverable Errors with Result

```rust
use std::fs;

fn main() {
    let result = fs::read_to_string("config.txt");

    match result {
        Ok(contents) => println!("File contents: {}", contents),
        Err(error) => println!("Error reading file: {}", error),
    }
}
```

---

## The ? Operator

`?` propagates errors automatically — shorthand for match + return Err:

```rust
use std::fs;
use std::io;

fn read_config() -> Result<String, io::Error> {
    let contents = fs::read_to_string("config.txt")?;
    Ok(contents.trim().to_string())
}

fn main() {
    match read_config() {
        Ok(config) => println!("Config: {}", config),
        Err(e) => println!("Failed: {}", e),
    }
}
```

---

## Chaining with ?

```rust
use std::fs;
use std::io;

fn get_first_line(path: &str) -> Result<String, io::Error> {
    let contents = fs::read_to_string(path)?;
    let first = contents.lines().next().unwrap_or("").to_string();
    Ok(first)
}
```

---

## unwrap and expect

Quick methods for prototyping (will panic on Err):

```rust
fn main() {
    // unwrap — panics with default message
    let num: i32 = "42".parse().unwrap();

    // expect — panics with custom message
    let num2: i32 = "42".parse().expect("Failed to parse number");

    println!("{} {}", num, num2);
}
```

---

## Handling Multiple Error Types

Use `Box<dyn Error>` for functions that can return different error types:

```rust
use std::error::Error;
use std::fs;

fn process() -> Result<i32, Box<dyn Error>> {
    let contents = fs::read_to_string("number.txt")?; // io::Error
    let num: i32 = contents.trim().parse()?;           // ParseIntError
    Ok(num * 2)
}

fn main() {
    match process() {
        Ok(result) => println!("Result: {}", result),
        Err(e) => println!("Error: {}", e),
    }
}
```

---

## Result Methods

```rust
fn main() {
    let ok: Result<i32, &str> = Ok(10);
    let err: Result<i32, &str> = Err("fail");

    // unwrap_or — provide default
    println!("{}", err.unwrap_or(0));

    // map — transform Ok value
    let doubled = ok.map(|v| v * 2);
    println!("{:?}", doubled); // Ok(20)

    // and_then — chain operations
    let result = ok.and_then(|v| {
        if v > 5 { Ok(v * 10) } else { Err("too small") }
    });
    println!("{:?}", result); // Ok(100)
}
```

> [!TIP]
> Follow this pattern: use `?` in library code to propagate errors, and handle them with `match` in application code (like `main`).
