---
title: Rust Constants
---

# Rust Constants

Constants are values that are bound to a name and **cannot be changed**. They differ from immutable variables in important ways.

---

## Declaring Constants

Use the `const` keyword. The type **must** be annotated:

```rust
const MAX_POINTS: u32 = 100_000;
const PI: f64 = 3.14159265358979;
const APP_NAME: &str = "MyApp";

fn main() {
    println!("Max: {}", MAX_POINTS);
    println!("Pi: {}", PI);
    println!("App: {}", APP_NAME);
}
```

---

## Constants vs Variables

| Feature | `const` | `let` (immutable) |
|---|---|---|
| Mutability | Never | Never (unless `mut`) |
| Type annotation | Required | Optional |
| Scope | Any scope (incl. global) | Block scope only |
| Shadowing | Not allowed | Allowed |
| Computed at | Compile time | Runtime |

```rust
const LIMIT: i32 = 50;

fn main() {
    let x = 10; // runtime variable

    // const values are inlined at compile time
    if x < LIMIT {
        println!("{} is under the limit", x);
    }
}
```

> [!IMPORTANT]
> Constants must be set to a **constant expression** — they cannot be the result of a function call or any value computed at runtime.

---

## Static Variables

For global variables that need a fixed memory address, use `static`:

```rust
static GREETING: &str = "Hello, World!";
static mut COUNTER: i32 = 0;

fn main() {
    println!("{}", GREETING);

    // Mutable statics require unsafe blocks
    unsafe {
        COUNTER += 1;
        println!("Counter: {}", COUNTER);
    }
}
```

> [!WARNING]
> Mutable `static` variables are **unsafe** because they can cause data races in concurrent code. Prefer other synchronization methods.

---

## Naming Convention

Constants use `SCREAMING_SNAKE_CASE` by convention:

```rust
const MAX_RETRIES: u32 = 3;
const DEFAULT_TIMEOUT_MS: u64 = 5000;
const BASE_URL: &str = "https://api.example.com";
```

> [!TIP]
> Use constants for values that are truly fixed and known at compile time. Use `let` bindings for everything else.
