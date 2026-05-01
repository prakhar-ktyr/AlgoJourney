---
title: Rust Struct Methods
---

# Rust Struct Methods

Methods are functions defined inside an `impl` block that are associated with a struct. The first parameter is always `self`.

---

## Defining Methods

```rust
#[derive(Debug)]
struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    fn area(&self) -> f64 {
        self.width * self.height
    }

    fn perimeter(&self) -> f64 {
        2.0 * (self.width + self.height)
    }

    fn is_square(&self) -> bool {
        self.width == self.height
    }
}

fn main() {
    let rect = Rectangle { width: 10.0, height: 5.0 };

    println!("Area: {}", rect.area());
    println!("Perimeter: {}", rect.perimeter());
    println!("Is square: {}", rect.is_square());
}
```

---

## The Self Parameter

| Signature | Meaning |
|---|---|
| `&self` | Borrows the instance immutably |
| `&mut self` | Borrows the instance mutably |
| `self` | Takes ownership of the instance |

```rust
struct Counter {
    value: i32,
}

impl Counter {
    fn get(&self) -> i32 {
        self.value
    }

    fn increment(&mut self) {
        self.value += 1;
    }

    fn into_value(self) -> i32 {
        self.value // consumes the Counter
    }
}

fn main() {
    let mut c = Counter { value: 0 };
    c.increment();
    c.increment();
    println!("Value: {}", c.get()); // 2

    let final_value = c.into_value();
    println!("Final: {}", final_value);
    // c is no longer usable here
}
```

---

## Associated Functions (Static Methods)

Functions in `impl` that don't take `self` are called **associated functions**. They're like static methods:

```rust
struct Circle {
    radius: f64,
}

impl Circle {
    // Associated function (constructor)
    fn new(radius: f64) -> Self {
        Circle { radius }
    }

    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

fn main() {
    let c = Circle::new(5.0); // called with ::
    println!("Area: {:.2}", c.area());
}
```

> [!NOTE]
> `Self` (capital S) is an alias for the type being implemented. `Circle::new()` returns `Self`, which is `Circle`.

---

## Multiple impl Blocks

You can split methods across multiple `impl` blocks:

```rust
struct Player {
    name: String,
    health: i32,
}

impl Player {
    fn new(name: &str) -> Self {
        Player {
            name: String::from(name),
            health: 100,
        }
    }
}

impl Player {
    fn take_damage(&mut self, amount: i32) {
        self.health = (self.health - amount).max(0);
    }

    fn is_alive(&self) -> bool {
        self.health > 0
    }
}

fn main() {
    let mut p = Player::new("Hero");
    p.take_damage(30);
    println!("{}: {} HP (alive: {})", p.name, p.health, p.is_alive());
}
```

> [!TIP]
> By convention, use `new` as the name for constructor-like associated functions. Rust doesn't have built-in constructors, so `Type::new()` is the standard pattern.
