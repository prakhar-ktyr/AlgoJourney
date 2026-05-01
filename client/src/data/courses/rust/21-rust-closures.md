---
title: Rust Closures
---

# Rust Closures

Closures are anonymous functions that can capture variables from their surrounding scope. They're Rust's equivalent of lambdas.

---

## Defining Closures

```rust
fn main() {
    // Closure with type annotations
    let add = |a: i32, b: i32| -> i32 { a + b };

    // Types can be inferred
    let multiply = |a, b| a * b;

    // Single expression — no braces needed
    let square = |x| x * x;

    println!("add: {}", add(3, 4));         // 7
    println!("multiply: {}", multiply(3, 4)); // 12
    println!("square: {}", square(5));        // 25
}
```

---

## Capturing Variables

Closures can capture variables from their enclosing scope:

```rust
fn main() {
    let greeting = String::from("Hello");
    let name = String::from("Rust");

    // Borrow by reference (immutable)
    let greet = || println!("{}, {}!", greeting, name);
    greet();

    println!("Still have: {} {}", greeting, name); // still valid
}
```

---

## Capture Modes

Closures capture variables in three ways, chosen automatically by the compiler:

| Mode | Keyword | Description |
|---|---|---|
| Borrow immutably | `&T` | Default when only reading |
| Borrow mutably | `&mut T` | When modifying the captured value |
| Move ownership | `T` | When taking ownership |

```rust
fn main() {
    // Immutable borrow
    let x = 10;
    let read = || println!("x = {}", x);
    read();

    // Mutable borrow
    let mut count = 0;
    let mut increment = || { count += 1; };
    increment();
    increment();
    println!("count = {}", count); // 2

    // Move
    let name = String::from("Alice");
    let greet = move || println!("Hello, {}", name);
    greet();
    // println!("{}", name); // ERROR: name was moved
}
```

> [!NOTE]
> Use the `move` keyword to force the closure to take ownership of all captured variables. This is commonly needed when passing closures to threads.

---

## Closures as Parameters

Functions can accept closures using trait bounds:

```rust
fn apply<F: Fn(i32) -> i32>(f: F, value: i32) -> i32 {
    f(value)
}

fn main() {
    let double = |x| x * 2;
    let result = apply(double, 5);
    println!("Result: {}", result); // 10
}
```

The three closure traits:

| Trait | Description |
|---|---|
| `Fn` | Borrows captured values immutably |
| `FnMut` | Borrows captured values mutably |
| `FnOnce` | Takes ownership of captured values (can only be called once) |

---

## Returning Closures

Use `impl Fn` to return closures from functions:

```rust
fn make_adder(x: i32) -> impl Fn(i32) -> i32 {
    move |y| x + y
}

fn main() {
    let add_five = make_adder(5);
    println!("{}", add_five(3));  // 8
    println!("{}", add_five(10)); // 15
}
```

> [!TIP]
> Closures are zero-cost abstractions in Rust — the compiler can often inline them, making them as fast as regular function calls.
