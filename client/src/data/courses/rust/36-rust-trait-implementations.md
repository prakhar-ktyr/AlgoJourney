---
title: Rust Trait Implementations
---

# Rust Trait Implementations

This lesson covers advanced patterns for implementing and using traits, including multiple traits, supertraits, and operator overloading.

---

## Multiple Trait Bounds

Require a type to implement several traits:

```rust
use std::fmt;

fn print_info<T: fmt::Display + fmt::Debug>(item: &T) {
    println!("Display: {}", item);
    println!("Debug: {:?}", item);
}

fn main() {
    let s = String::from("hello");
    print_info(&s);
}
```

Using `where` clause for cleaner syntax:

```rust
use std::fmt;

fn complex_function<T, U>(t: &T, u: &U) -> String
where
    T: fmt::Display + Clone,
    U: fmt::Debug,
{
    format!("{} — {:?}", t, u)
}
```

---

## Supertraits

A trait can require another trait as a prerequisite:

```rust
use std::fmt;

trait PrettyPrint: fmt::Display {
    fn pretty(&self) -> String {
        format!("✨ {} ✨", self)
    }
}

struct Name(String);

impl fmt::Display for Name {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl PrettyPrint for Name {}

fn main() {
    let n = Name(String::from("Rust"));
    println!("{}", n.pretty()); // ✨ Rust ✨
}
```

---

## Operator Overloading

Implement standard traits to use operators with custom types:

```rust
use std::ops::Add;

#[derive(Debug, Clone, Copy)]
struct Vec2 {
    x: f64,
    y: f64,
}

impl Add for Vec2 {
    type Output = Vec2;

    fn add(self, other: Vec2) -> Vec2 {
        Vec2 {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

fn main() {
    let a = Vec2 { x: 1.0, y: 2.0 };
    let b = Vec2 { x: 3.0, y: 4.0 };
    let c = a + b;
    println!("{:?}", c); // Vec2 { x: 4.0, y: 6.0 }
}
```

---

## Implementing Iterator

```rust
struct Countdown {
    value: i32,
}

impl Countdown {
    fn new(start: i32) -> Self {
        Countdown { value: start }
    }
}

impl Iterator for Countdown {
    type Item = i32;

    fn next(&mut self) -> Option<Self::Item> {
        if self.value > 0 {
            let current = self.value;
            self.value -= 1;
            Some(current)
        } else {
            None
        }
    }
}

fn main() {
    for n in Countdown::new(5) {
        print!("{} ", n);
    }
    println!(); // 5 4 3 2 1
}
```

---

## The Orphan Rule

You can implement a trait for a type only if **either the trait or the type** is defined in your crate:

```rust
// OK — our type, standard trait
// impl fmt::Display for MyStruct { ... }

// OK — standard type, our trait
// impl MyTrait for String { ... }

// NOT OK — both foreign
// impl fmt::Display for Vec<i32> { ... } // ERROR
```

> [!TIP]
> Use the **newtype pattern** to work around the orphan rule: wrap a foreign type in a tuple struct, then implement the trait on your wrapper.
