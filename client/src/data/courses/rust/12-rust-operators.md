---
title: Rust Operators
---

# Rust Operators

Operators are used to perform operations on values and variables. Rust supports arithmetic, comparison, logical, bitwise, and assignment operators.

---

## Arithmetic Operators

```rust
fn main() {
    let a = 15;
    let b = 4;

    println!("a + b = {}", a + b);   // 19
    println!("a - b = {}", a - b);   // 11
    println!("a * b = {}", a * b);   // 60
    println!("a / b = {}", a / b);   // 3 (integer division)
    println!("a % b = {}", a % b);   // 3 (remainder)
}
```

---

## Assignment Operators

```rust
fn main() {
    let mut x = 10;

    x += 5;   // x = x + 5 → 15
    x -= 3;   // x = x - 3 → 12
    x *= 2;   // x = x * 2 → 24
    x /= 4;   // x = x / 4 → 6
    x %= 4;   // x = x % 4 → 2

    println!("x = {}", x);
}
```

---

## Comparison Operators

All comparison operators return a `bool`:

| Operator | Meaning |
|---|---|
| `==` | Equal to |
| `!=` | Not equal to |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal to |
| `<=` | Less than or equal to |

```rust
fn main() {
    let a = 10;
    let b = 20;

    println!("{}", a == b);  // false
    println!("{}", a != b);  // true
    println!("{}", a < b);   // true
}
```

---

## Logical Operators

| Operator | Name | Description |
|---|---|---|
| `&&` | AND | Both must be true |
| `\|\|` | OR | At least one must be true |
| `!` | NOT | Inverts the boolean |

```rust
fn main() {
    let age = 25;
    let has_license = true;

    let can_drive = age >= 18 && has_license;
    let needs_test = age < 18 || !has_license;

    println!("Can drive: {}", can_drive);
    println!("Needs test: {}", needs_test);
}
```

---

## Bitwise Operators

| Operator | Name |
|---|---|
| `&` | AND |
| `\|` | OR |
| `^` | XOR |
| `!` | NOT (bitwise) |
| `<<` | Left shift |
| `>>` | Right shift |

```rust
fn main() {
    let a: u8 = 0b1100;
    let b: u8 = 0b1010;

    println!("AND:   {:04b}", a & b);   // 1000
    println!("OR:    {:04b}", a | b);   // 1110
    println!("XOR:   {:04b}", a ^ b);   // 0110
    println!("NOT a: {:08b}", !a);       // 11110011
    println!("Shift: {:04b}", a << 1);  // 11000
}
```

---

## Range Operators

Rust has special range operators used with iterators and slices:

```rust
fn main() {
    // Exclusive range: 1, 2, 3, 4
    for i in 1..5 {
        print!("{} ", i);
    }
    println!();

    // Inclusive range: 1, 2, 3, 4, 5
    for i in 1..=5 {
        print!("{} ", i);
    }
    println!();
}
```

> [!TIP]
> Rust does **not** support operator overloading with custom symbols, but you can implement traits like `Add`, `Sub`, `Mul` etc. to use `+`, `-`, `*` with your own types.
