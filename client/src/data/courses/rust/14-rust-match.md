---
title: Rust Match
---

# Rust Match

The `match` expression is one of Rust's most powerful features. It allows you to compare a value against a series of patterns and execute code based on which pattern matches.

---

## Basic Match

```rust
fn main() {
    let number = 3;

    match number {
        1 => println!("One"),
        2 => println!("Two"),
        3 => println!("Three"),
        _ => println!("Something else"),
    }
}
```

- Each pattern is called an **arm**.
- `_` is the **wildcard** pattern — it matches anything (like a default case).
- `match` must be **exhaustive** — all possible values must be covered.

---

## Match as an Expression

`match` returns a value, so you can assign the result:

```rust
fn main() {
    let day = "Tuesday";

    let kind = match day {
        "Saturday" | "Sunday" => "Weekend",
        _ => "Weekday",
    };

    println!("{} is a {}", day, kind);
}
```

---

## Matching Multiple Values

Use `|` to match multiple patterns in one arm:

```rust
fn main() {
    let x = 2;

    match x {
        1 | 2 | 3 => println!("One, two, or three"),
        4..=10 => println!("Four through ten"),
        _ => println!("Something else"),
    }
}
```

> [!NOTE]
> `4..=10` is an **inclusive range pattern**. It matches any value from 4 to 10.

---

## Matching with Destructuring

Match can destructure tuples, enums, and structs:

```rust
fn main() {
    let point = (3, -5);

    match point {
        (0, 0) => println!("Origin"),
        (x, 0) => println!("On x-axis at {}", x),
        (0, y) => println!("On y-axis at {}", y),
        (x, y) => println!("At ({}, {})", x, y),
    }
}
```

---

## Match Guards

Add extra conditions with `if`:

```rust
fn main() {
    let num = 4;

    match num {
        n if n < 0 => println!("Negative"),
        n if n % 2 == 0 => println!("{} is even", n),
        n => println!("{} is odd", n),
    }
}
```

---

## Matching Enums

`match` is commonly used with enums:

```rust
enum Direction {
    North,
    South,
    East,
    West,
}

fn main() {
    let dir = Direction::North;

    match dir {
        Direction::North => println!("Going north"),
        Direction::South => println!("Going south"),
        Direction::East => println!("Going east"),
        Direction::West => println!("Going west"),
    }
}
```

---

## If Let (Shorthand)

When you only care about one pattern, use `if let`:

```rust
fn main() {
    let value: Option<i32> = Some(42);

    // Instead of a full match:
    if let Some(v) = value {
        println!("Got: {}", v);
    } else {
        println!("No value");
    }
}
```

> [!TIP]
> Use `match` when you need exhaustive handling of all cases. Use `if let` when you only care about one specific pattern.
