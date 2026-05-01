---
title: Rust Trait Objects
---

# Rust Trait Objects

Trait objects enable **dynamic dispatch** — calling methods on types determined at runtime rather than compile time.

---

## Static vs Dynamic Dispatch

```rust
trait Animal {
    fn speak(&self) -> &str;
}

struct Dog;
struct Cat;

impl Animal for Dog {
    fn speak(&self) -> &str { "Woof!" }
}

impl Animal for Cat {
    fn speak(&self) -> &str { "Meow!" }
}

// Static dispatch — monomorphized at compile time
fn static_speak(animal: &impl Animal) {
    println!("{}", animal.speak());
}

// Dynamic dispatch — resolved at runtime
fn dynamic_speak(animal: &dyn Animal) {
    println!("{}", animal.speak());
}

fn main() {
    let dog = Dog;
    let cat = Cat;

    static_speak(&dog);
    dynamic_speak(&cat);
}
```

---

## Using dyn Trait

`dyn Trait` creates a trait object — a fat pointer containing a data pointer and a vtable pointer:

```rust
trait Shape {
    fn area(&self) -> f64;
    fn name(&self) -> &str;
}

struct Circle { radius: f64 }
struct Square { side: f64 }

impl Shape for Circle {
    fn area(&self) -> f64 { std::f64::consts::PI * self.radius * self.radius }
    fn name(&self) -> &str { "Circle" }
}

impl Shape for Square {
    fn area(&self) -> f64 { self.side * self.side }
    fn name(&self) -> &str { "Square" }
}

fn main() {
    // Heterogeneous collection using trait objects
    let shapes: Vec<Box<dyn Shape>> = vec![
        Box::new(Circle { radius: 5.0 }),
        Box::new(Square { side: 4.0 }),
        Box::new(Circle { radius: 2.0 }),
    ];

    for shape in &shapes {
        println!("{}: area = {:.2}", shape.name(), shape.area());
    }
}
```

---

## When to Use Trait Objects

| Use Case | Approach |
|---|---|
| Known types at compile time | Generics (`impl Trait`) |
| Heterogeneous collections | Trait objects (`dyn Trait`) |
| Plugin systems | Trait objects |
| Performance critical | Generics |

---

## Object Safety

Not all traits can be used as trait objects. A trait is **object-safe** if:

- All methods have `&self` or `&mut self` receiver
- No method returns `Self`
- No method has generic type parameters

```rust
// Object-safe
trait Drawable {
    fn draw(&self);
}

// NOT object-safe (returns Self)
trait Clonable {
    fn clone_self(&self) -> Self;
}
```

> [!TIP]
> Prefer generics (`impl Trait`) for performance. Use trait objects (`dyn Trait`) when you need runtime polymorphism, like storing different types in the same collection.
