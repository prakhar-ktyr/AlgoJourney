---
title: Rust Booleans
---

# Rust Booleans

The `bool` type in Rust represents a value that is either `true` or `false`. Booleans are fundamental for control flow and logical operations.

---

## Boolean Values

```rust
fn main() {
    let is_rust_fun: bool = true;
    let is_boring = false;

    println!("Rust is fun: {}", is_rust_fun);
    println!("Boring: {}", is_boring);
}
```

A `bool` in Rust is **1 byte** in size.

---

## Comparison Operators

Comparison operators return boolean values:

```rust
fn main() {
    let a = 10;
    let b = 20;

    println!("a == b: {}", a == b);  // false
    println!("a != b: {}", a != b);  // true
    println!("a < b: {}", a < b);    // true
    println!("a >= b: {}", a >= b);  // false
}
```

---

## Logical Operators

| Operator | Name | Description |
|---|---|---|
| `&&` | AND | True if both are true |
| `\|\|` | OR | True if either is true |
| `!` | NOT | Inverts the value |

```rust
fn main() {
    let x = true;
    let y = false;

    println!("AND: {}", x && y);  // false
    println!("OR: {}", x || y);   // true
    println!("NOT: {}", !x);      // false
}
```

> [!NOTE]
> Rust uses **short-circuit evaluation**: `&&` stops if the left side is `false`, and `||` stops if the left side is `true`.

---

## Booleans in Control Flow

```rust
fn main() {
    let temperature = 35;
    let is_hot = temperature > 30;

    if is_hot {
        println!("It's hot outside!");
    } else {
        println!("It's pleasant.");
    }

    // Boolean as an expression
    let status = if is_hot { "hot" } else { "cool" };
    println!("Weather: {}", status);
}
```

---

## Converting Booleans

```rust
fn main() {
    let t = true as i32;   // 1
    let f = false as i32;  // 0
    println!("true={}, false={}", t, f);

    let parsed: bool = "true".parse().unwrap();
    println!("parsed: {}", parsed);
}
```

> [!TIP]
> Rust does **not** allow implicit conversions between booleans and integers. You must use `as` or explicit methods.
