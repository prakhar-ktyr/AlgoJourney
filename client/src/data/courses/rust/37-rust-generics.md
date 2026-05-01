---
title: Rust Generics
---

# Rust Generics

Generics let you write code that works with **any type**, avoiding duplication while maintaining type safety.

---

## Generic Functions

```rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut max = &list[0];
    for item in &list[1..] {
        if item > max {
            max = item;
        }
    }
    max
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("Largest number: {}", largest(&numbers));

    let chars = vec!['y', 'm', 'a', 'q'];
    println!("Largest char: {}", largest(&chars));
}
```

---

## Generic Structs

```rust
#[derive(Debug)]
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let int_point = Point { x: 5, y: 10 };
    let float_point = Point { x: 1.5, y: 2.7 };

    println!("{:?}", int_point);
    println!("{:?}", float_point);
}
```

Multiple generic types:

```rust
#[derive(Debug)]
struct Pair<T, U> {
    first: T,
    second: U,
}

fn main() {
    let p = Pair { first: "hello", second: 42 };
    println!("{:?}", p);
}
```

---

## Generic Methods

```rust
#[derive(Debug)]
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn new(x: T, y: T) -> Self {
        Point { x, y }
    }

    fn x(&self) -> &T {
        &self.x
    }
}

// Methods only for f64 points
impl Point<f64> {
    fn distance_from_origin(&self) -> f64 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}

fn main() {
    let p = Point::new(3.0, 4.0);
    println!("x = {}", p.x());
    println!("Distance: {}", p.distance_from_origin()); // 5.0
}
```

---

## Generic Enums

`Option` and `Result` are generic enums:

```rust
// These are in the standard library:
// enum Option<T> {
//     Some(T),
//     None,
// }
//
// enum Result<T, E> {
//     Ok(T),
//     Err(E),
// }

// Your own generic enum:
#[derive(Debug)]
enum Either<L, R> {
    Left(L),
    Right(R),
}

fn main() {
    let a: Either<i32, String> = Either::Left(42);
    let b: Either<i32, String> = Either::Right(String::from("hello"));

    println!("{:?}", a);
    println!("{:?}", b);
}
```

---

## Zero-Cost Abstractions

Rust generics use **monomorphization** — the compiler generates specialized code for each concrete type used. There is **no runtime overhead**:

```rust
// When you write:
fn double<T: std::ops::Mul<Output = T> + Copy>(x: T) -> T {
    x * x
}

// The compiler generates separate functions:
// fn double_i32(x: i32) -> i32 { x * x }
// fn double_f64(x: f64) -> f64 { x * x }
```

> [!TIP]
> Generics in Rust are zero-cost — they're as fast as writing separate functions for each type. The compiler does the duplication for you.
