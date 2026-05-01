---
title: Rust Data Types
---

# Rust Data Types

Rust is a **statically typed** language, which means every variable must have a known type at compile time. Rust has two categories of data types: **scalar** and **compound**.

---

## Scalar Types

Scalar types represent a single value. Rust has four primary scalar types:

### Integer Types

| Length | Signed | Unsigned |
|---|---|---|
| 8-bit | `i8` | `u8` |
| 16-bit | `i16` | `u16` |
| 32-bit | `i32` | `u32` |
| 64-bit | `i64` | `u64` |
| 128-bit | `i128` | `u128` |
| arch | `isize` | `usize` |

- **Signed** (`i`) can hold negative and positive values.
- **Unsigned** (`u`) can only hold positive values (and zero).
- `isize` / `usize` depend on the architecture (32 or 64 bits).

```rust
fn main() {
    let a: i32 = -42;
    let b: u64 = 1_000_000; // underscores for readability
    let c: u8 = 255;

    println!("a={}, b={}, c={}", a, b, c);
}
```

> [!NOTE]
> The default integer type is `i32`, which is generally the fastest even on 64-bit systems.

### Floating-Point Types

Rust has two floating-point types: `f32` and `f64` (default).

```rust
fn main() {
    let x = 2.5;        // f64 by default
    let y: f32 = 3.14;  // explicit f32

    println!("x={}, y={}", x, y);
}
```

### Boolean Type

The `bool` type has two values: `true` and `false`.

```rust
fn main() {
    let is_active: bool = true;
    let is_done = false; // type inferred

    println!("active={}, done={}", is_active, is_done);
}
```

### Character Type

The `char` type represents a single Unicode character (4 bytes):

```rust
fn main() {
    let letter = 'A';
    let emoji = '🦀';
    let chinese = '中';

    println!("{} {} {}", letter, emoji, chinese);
}
```

> [!TIP]
> Rust's `char` is 4 bytes and represents a **Unicode Scalar Value**, so it can hold much more than just ASCII.

---

## Compound Types

Compound types group multiple values into one type.

### Tuples

A tuple groups values of **different types** with a fixed length:

```rust
fn main() {
    let tup: (i32, f64, char) = (500, 6.4, 'R');

    // Destructuring
    let (x, y, z) = tup;
    println!("x={}, y={}, z={}", x, y, z);

    // Access by index
    println!("First: {}", tup.0);
}
```

### Arrays

An array holds multiple values of the **same type** with a fixed length:

```rust
fn main() {
    let arr = [1, 2, 3, 4, 5];
    let months: [&str; 3] = ["Jan", "Feb", "Mar"];

    println!("First month: {}", months[0]);
    println!("Array length: {}", arr.len());

    // Initialize with same value
    let zeros = [0; 5]; // [0, 0, 0, 0, 0]
    println!("{:?}", zeros);
}
```

---

## Type Inference

Rust's compiler is smart about inferring types, so you don't always need annotations:

```rust
fn main() {
    let x = 42;          // i32
    let y = 3.14;        // f64
    let z = true;        // bool
    let s = "hello";     // &str
    let arr = [1, 2, 3]; // [i32; 3]

    println!("All types inferred: {} {} {} {} {:?}", x, y, z, s, arr);
}
```

When the compiler can't infer the type (e.g., parsing a string to a number), you must provide an annotation:

```rust
fn main() {
    let guess: u32 = "42".parse().expect("Not a number!");
    println!("Parsed: {}", guess);
}
```
