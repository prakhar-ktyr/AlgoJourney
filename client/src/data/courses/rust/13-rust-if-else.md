---
title: Rust If / Else
---

# Rust If / Else

Rust uses `if`, `else if`, and `else` for conditional branching. Unlike many languages, conditions do **not** need parentheses, and `if` is an **expression** that returns a value.

---

## Basic If Statement

```rust
fn main() {
    let number = 7;

    if number > 5 {
        println!("Greater than 5");
    }
}
```

> [!IMPORTANT]
> The condition must be a `bool`. Rust does **not** implicitly convert integers or other types to booleans.
> ```rust
> // if number { } // ERROR: expected `bool`, found `i32`
> ```

---

## If / Else

```rust
fn main() {
    let temperature = 15;

    if temperature > 30 {
        println!("Hot!");
    } else {
        println!("Not hot.");
    }
}
```

---

## Else If

```rust
fn main() {
    let score = 85;

    if score >= 90 {
        println!("Grade: A");
    } else if score >= 80 {
        println!("Grade: B");
    } else if score >= 70 {
        println!("Grade: C");
    } else {
        println!("Grade: F");
    }
}
```

---

## If as an Expression

Since `if` is an expression, you can use it on the right side of a `let` statement:

```rust
fn main() {
    let condition = true;
    let number = if condition { 5 } else { 10 };

    println!("number = {}", number); // 5
}
```

> [!NOTE]
> Both branches of an `if` expression must return the **same type**:
> ```rust
> // let x = if true { 5 } else { "six" }; // ERROR: mismatched types
> ```

---

## Nested If

```rust
fn main() {
    let age = 25;
    let has_id = true;

    if age >= 18 {
        if has_id {
            println!("Entry allowed.");
        } else {
            println!("Show your ID first.");
        }
    } else {
        println!("Too young.");
    }
}
```

> [!TIP]
> For complex branching with many conditions, consider using `match` instead — it's Rust's powerful pattern matching construct covered in the next lesson.
