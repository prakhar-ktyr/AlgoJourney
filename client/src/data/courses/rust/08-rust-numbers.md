---
title: Rust Numbers
---

# Rust Numbers

Rust provides a rich set of numeric types and operations. This lesson covers integer and floating-point operations, type casting, and numeric methods.

---

## Integer Operations

All standard arithmetic operations work with integers:

```rust
fn main() {
    let a: i32 = 10;
    let b: i32 = 3;

    println!("Add: {}", a + b);       // 13
    println!("Subtract: {}", a - b);  // 7
    println!("Multiply: {}", a * b);  // 30
    println!("Divide: {}", a / b);    // 3 (integer division)
    println!("Remainder: {}", a % b); // 1
}
```

> [!NOTE]
> Integer division **truncates** toward zero. `10 / 3` gives `3`, not `3.333`.

---

## Floating-Point Operations

```rust
fn main() {
    let x: f64 = 10.0;
    let y: f64 = 3.0;

    println!("Add: {}", x + y);       // 13.0
    println!("Subtract: {}", x - y);  // 7.0
    println!("Multiply: {}", x * y);  // 30.0
    println!("Divide: {}", x / y);    // 3.3333333333333335
    println!("Remainder: {}", x % y); // 1.0
}
```

---

## Number Literals

Rust supports various formats for number literals:

```rust
fn main() {
    let decimal = 98_222;        // 98222 (underscores for readability)
    let hex = 0xff;              // 255
    let octal = 0o77;            // 63
    let binary = 0b1111_0000;    // 240
    let byte = b'A';             // 65 (u8 only)

    println!("{} {} {} {} {}", decimal, hex, octal, binary, byte);
}
```

---

## Type Casting with `as`

Rust does not implicitly convert between numeric types. Use `as` for explicit casting:

```rust
fn main() {
    let x: i32 = 42;
    let y: f64 = x as f64;          // i32 → f64
    let z: u8 = 200;
    let w: i8 = z as i8;            // u8 → i8 (may wrap!)

    println!("y = {}", y);           // 42.0
    println!("w = {}", w);           // -56 (overflow wrapping)

    let pi = 3.14159_f64;
    let truncated = pi as i32;       // 3 (truncates decimal part)
    println!("truncated = {}", truncated);
}
```

> [!WARNING]
> Casting with `as` can **silently overflow** or truncate. For safe conversions, use `try_from()` or `try_into()`.

---

## Useful Numeric Methods

Rust's numeric types come with many built-in methods:

```rust
fn main() {
    // Absolute value
    let n: i32 = -15;
    println!("abs: {}", n.abs()); // 15

    // Power
    let base: i32 = 2;
    println!("2^10 = {}", base.pow(10)); // 1024

    // Min and Max
    println!("max: {}", 5_i32.max(10)); // 10
    println!("min: {}", 5_i32.min(10)); // 5

    // Clamp
    println!("clamp: {}", 15_i32.clamp(0, 10)); // 10

    // Float methods
    let x: f64 = 2.0;
    println!("sqrt: {}", x.sqrt());     // 1.4142135623730951
    println!("ceil: {}", 2.3_f64.ceil());  // 3.0
    println!("floor: {}", 2.9_f64.floor()); // 2.0
    println!("round: {}", 2.5_f64.round()); // 3.0
}
```

---

## Checked, Wrapping, and Saturating Arithmetic

Rust provides methods to handle overflow explicitly:

```rust
fn main() {
    let a: u8 = 250;

    // Checked — returns None on overflow
    println!("checked: {:?}", a.checked_add(10)); // None

    // Wrapping — wraps around on overflow
    println!("wrapping: {}", a.wrapping_add(10)); // 4

    // Saturating — clamps at the max value
    println!("saturating: {}", a.saturating_add(10)); // 255
}
```

> [!TIP]
> In debug builds, Rust **panics** on integer overflow. In release builds, it wraps silently. Use `checked_*` methods when overflow matters.
