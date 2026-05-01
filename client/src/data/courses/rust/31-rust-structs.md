---
title: Rust Structs
---

# Rust Structs

Structs let you create custom data types by grouping related values with **named fields**.

---

## Defining and Creating Structs

```rust
struct User {
    name: String,
    email: String,
    age: u32,
    active: bool,
}

fn main() {
    let user = User {
        name: String::from("Alice"),
        email: String::from("alice@example.com"),
        age: 30,
        active: true,
    };

    println!("{} ({}) — age {}", user.name, user.email, user.age);
}
```

---

## Mutable Structs

The entire struct must be mutable — you can't mark individual fields:

```rust
struct Point {
    x: f64,
    y: f64,
}

fn main() {
    let mut p = Point { x: 0.0, y: 0.0 };
    p.x = 3.0;
    p.y = 4.0;
    println!("({}, {})", p.x, p.y);
}
```

---

## Field Init Shorthand

When variable names match field names:

```rust
struct Color {
    r: u8,
    g: u8,
    b: u8,
}

fn new_color(r: u8, g: u8, b: u8) -> Color {
    Color { r, g, b } // shorthand
}

fn main() {
    let c = new_color(255, 128, 0);
    println!("RGB({}, {}, {})", c.r, c.g, c.b);
}
```

---

## Struct Update Syntax

Create a new struct from an existing one, changing only some fields:

```rust
struct User {
    name: String,
    email: String,
    age: u32,
}

fn main() {
    let user1 = User {
        name: String::from("Alice"),
        email: String::from("alice@example.com"),
        age: 30,
    };

    let user2 = User {
        email: String::from("bob@example.com"),
        ..user1 // remaining fields from user1
    };

    println!("{} — {}", user2.name, user2.email);
}
```

---

## Tuple Structs

Structs without named fields — useful for simple wrappers:

```rust
struct Color(u8, u8, u8);
struct Meters(f64);

fn main() {
    let red = Color(255, 0, 0);
    let distance = Meters(42.5);

    println!("Red: ({}, {}, {})", red.0, red.1, red.2);
    println!("Distance: {} m", distance.0);
}
```

---

## Deriving Traits

Use `#[derive]` to auto-implement common traits:

```rust
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: f64,
    y: f64,
}

fn main() {
    let p1 = Point { x: 1.0, y: 2.0 };
    let p2 = p1.clone();

    println!("Debug: {:?}", p1);
    println!("Equal: {}", p1 == p2);
}
```

> [!TIP]
> Common derived traits: `Debug` (for printing), `Clone` (for copying), `PartialEq` (for comparing), `Default` (for default values). Use `#[derive(Debug)]` on almost every struct.
