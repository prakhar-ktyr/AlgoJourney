---
title: Rust Syntax
---

# Rust Syntax

Understanding Rust syntax is the first step to writing Rust programs. Rust's syntax is inspired by C and C++ but introduces unique features.

---

## The main Function

Every Rust program starts with a `main` function:

```rust
fn main() {
    println!("Hello from Rust!");
}
```

- `fn` declares a function.
- `main` is the entry point — it runs when the program starts.
- Curly braces `{}` define the function body.
- `println!` is a macro for printing to the console.

---

## Statements and Expressions

Rust distinguishes between **statements** and **expressions**:

- A **statement** performs an action and does not return a value. It ends with `;`.
- An **expression** evaluates to a value. It does **not** end with `;`.

```rust
fn main() {
    let x = 5;          // statement (variable binding)
    let y = {
        let temp = 3;
        temp + 1         // expression — returns 4 (no semicolon!)
    };
    println!("x = {}, y = {}", x, y);
}
```

> [!IMPORTANT]
> If you add a semicolon to the last line in a block, it becomes a statement and the block returns `()` (unit type) instead of a value.

---

## Printing Output

Rust uses macros for formatted printing:

```rust
fn main() {
    let name = "Rust";
    let version = 2024;

    println!("Hello, {}!", name);             // positional
    println!("{} edition: {}", name, version); // multiple values
    println!("{name} is great!");              // inline variable (Rust 1.58+)
    
    // Debug printing with {:?}
    let nums = vec![1, 2, 3];
    println!("Debug: {:?}", nums);
    
    // Pretty debug with {:#?}
    println!("Pretty: {:#?}", nums);
}
```

Common print macros:

| Macro | Description |
|---|---|
| `println!` | Print with newline |
| `print!` | Print without newline |
| `eprintln!` | Print to stderr with newline |
| `format!` | Return a formatted `String` (no printing) |

---

## Code Blocks and Scope

Curly braces `{}` create a new scope. Variables defined inside a block are not accessible outside:

```rust
fn main() {
    let outer = 10;

    {
        let inner = 20;
        println!("inner = {}", inner); // OK
        println!("outer = {}", outer); // OK — outer is accessible
    }

    // println!("inner = {}", inner); // ERROR — inner is out of scope
    println!("outer = {}", outer);     // OK
}
```

---

## Semicolons

In Rust, semicolons are **required** at the end of statements. Omitting the semicolon on the last line of a block makes it an expression that returns a value:

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b   // no semicolon — this is the return value
}

fn main() {
    let result = add(3, 4);
    println!("Result: {}", result); // Result: 7
}
```
