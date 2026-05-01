---
title: Rust Variables
---

# Rust Variables

Variables in Rust are declared with the `let` keyword. By default, variables are **immutable** — this is one of Rust's key safety features.

---

## Declaring Variables

```rust
fn main() {
    let x = 5;
    println!("x = {}", x);
}
```

The compiler automatically **infers** the type. You can also annotate types explicitly:

```rust
fn main() {
    let x: i32 = 5;
    let name: &str = "Alice";
    println!("{} is {}", name, x);
}
```

---

## Immutability by Default

Variables are immutable by default. Trying to reassign will cause a compile error:

```rust
fn main() {
    let x = 5;
    // x = 10; // ERROR: cannot assign twice to immutable variable
    println!("x = {}", x);
}
```

> [!IMPORTANT]
> Immutability is a deliberate design choice. It helps prevent bugs and makes code easier to reason about, especially in concurrent contexts.

---

## Mutable Variables

Use `mut` to make a variable mutable:

```rust
fn main() {
    let mut x = 5;
    println!("x = {}", x);

    x = 10; // OK — x is mutable
    println!("x = {}", x);
}
```

---

## Shadowing

Rust allows you to declare a new variable with the same name, effectively **shadowing** the previous one:

```rust
fn main() {
    let x = 5;
    let x = x + 1;     // shadows the first x
    let x = x * 2;     // shadows the second x

    println!("x = {}", x); // x = 12
}
```

Shadowing is different from `mut` because:

- You can change the **type** of the value.
- The new variable is still **immutable** (unless declared with `mut`).

```rust
fn main() {
    let spaces = "   ";         // &str
    let spaces = spaces.len();  // usize — different type!

    println!("spaces = {}", spaces); // 3
}
```

> [!NOTE]
> With `mut`, you cannot change the type:
> ```rust
> let mut spaces = "   ";
> // spaces = spaces.len(); // ERROR: mismatched types
> ```

---

## Variable Scope

Variables are valid from the point of declaration until the end of the current block:

```rust
fn main() {
    // x is not yet valid here

    let x = "hello";  // x is valid from here

    {
        let y = "world"; // y is valid from here
        println!("{} {}", x, y);
    } // y goes out of scope here

    // println!("{}", y); // ERROR: y is not in scope
    println!("{}", x);    // OK
} // x goes out of scope here
```
