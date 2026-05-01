---
title: Rust Traits
---

# Rust Traits

Traits define shared behavior across types — similar to interfaces in other languages. They specify a set of methods that types must implement.

---

## Defining a Trait

```rust
trait Greet {
    fn hello(&self) -> String;
}
```

---

## Implementing a Trait

```rust
trait Greet {
    fn hello(&self) -> String;
}

struct Person {
    name: String,
}

struct Robot {
    id: u32,
}

impl Greet for Person {
    fn hello(&self) -> String {
        format!("Hi, I'm {}!", self.name)
    }
}

impl Greet for Robot {
    fn hello(&self) -> String {
        format!("Beep boop. Unit {} online.", self.id)
    }
}

fn main() {
    let p = Person { name: String::from("Alice") };
    let r = Robot { id: 42 };

    println!("{}", p.hello());
    println!("{}", r.hello());
}
```

---

## Default Implementations

Traits can provide default method bodies:

```rust
trait Summary {
    fn title(&self) -> &str;

    fn summarize(&self) -> String {
        format!("{} — (Read more...)", self.title())
    }
}

struct Article {
    title: String,
    content: String,
}

impl Summary for Article {
    fn title(&self) -> &str {
        &self.title
    }
    // summarize uses the default implementation
}

fn main() {
    let article = Article {
        title: String::from("Rust 2024"),
        content: String::from("Exciting new features..."),
    };
    println!("{}", article.summarize());
}
```

---

## Traits as Parameters

Use `impl Trait` to accept any type implementing a trait:

```rust
trait Describable {
    fn describe(&self) -> String;
}

fn print_description(item: &impl Describable) {
    println!("{}", item.describe());
}
```

Or use trait bounds with generics:

```rust
fn print_description<T: Describable>(item: &T) {
    println!("{}", item.describe());
}
```

---

## Common Standard Library Traits

| Trait | Purpose | Example |
|---|---|---|
| `Display` | User-facing string output | `println!("{}", x)` |
| `Debug` | Developer-facing output | `println!("{:?}", x)` |
| `Clone` | Explicit deep copy | `x.clone()` |
| `Copy` | Implicit bitwise copy | `let y = x;` |
| `PartialEq` | Equality comparison | `x == y` |
| `Default` | Default value | `T::default()` |

---

## Implementing Display

```rust
use std::fmt;

struct Point {
    x: f64,
    y: f64,
}

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

fn main() {
    let p = Point { x: 3.0, y: 4.0 };
    println!("Point: {}", p);
}
```

> [!TIP]
> Use `#[derive(Debug, Clone, PartialEq)]` for automatic implementations. Implement `Display` manually when you need custom formatted output.
