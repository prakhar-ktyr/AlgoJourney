---
title: Rust Enums
---

# Rust Enums

Enums (enumerations) let you define a type that can be one of several **variants**. Rust enums are much more powerful than enums in most other languages because each variant can hold data.

---

## Basic Enums

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
        Direction::North => println!("Going north!"),
        Direction::South => println!("Going south!"),
        Direction::East => println!("Going east!"),
        Direction::West => println!("Going west!"),
    }
}
```

---

## Enums with Data

Each variant can hold different types of data:

```rust
#[derive(Debug)]
enum Message {
    Quit,                        // no data
    Echo(String),                // single value
    Move { x: i32, y: i32 },    // named fields (struct-like)
    Color(u8, u8, u8),           // tuple-like
}

fn main() {
    let messages = vec![
        Message::Quit,
        Message::Echo(String::from("hello")),
        Message::Move { x: 10, y: 20 },
        Message::Color(255, 0, 128),
    ];

    for msg in &messages {
        println!("{:?}", msg);
    }
}
```

---

## Methods on Enums

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

impl Coin {
    fn value(&self) -> f64 {
        match self {
            Coin::Penny => 0.01,
            Coin::Nickel => 0.05,
            Coin::Dime => 0.10,
            Coin::Quarter => 0.25,
        }
    }
}

fn main() {
    let coin = Coin::Quarter;
    println!("Value: ${:.2}", coin.value());
}
```

---

## Pattern Matching with Enums

```rust
#[derive(Debug)]
enum Shape {
    Circle(f64),
    Rectangle(f64, f64),
    Triangle(f64, f64),
}

fn area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle(r) => std::f64::consts::PI * r * r,
        Shape::Rectangle(w, h) => w * h,
        Shape::Triangle(b, h) => 0.5 * b * h,
    }
}

fn main() {
    let shapes = vec![
        Shape::Circle(5.0),
        Shape::Rectangle(4.0, 6.0),
        Shape::Triangle(3.0, 8.0),
    ];

    for s in &shapes {
        println!("{:?} → area = {:.2}", s, area(s));
    }
}
```

---

## Using Enums for State

```rust
#[derive(Debug)]
enum Status {
    Active,
    Inactive,
    Suspended { reason: String },
}

fn describe(status: &Status) -> &str {
    match status {
        Status::Active => "User is active",
        Status::Inactive => "User is inactive",
        Status::Suspended { .. } => "User is suspended",
    }
}

fn main() {
    let s = Status::Suspended {
        reason: String::from("Terms violation"),
    };
    println!("{}", describe(&s));
}
```

> [!TIP]
> Rust enums are **algebraic data types** (sum types). Combined with `match`, they enable powerful and type-safe data modeling. The next lesson covers two of the most important enums in Rust: `Option` and `Result`.
