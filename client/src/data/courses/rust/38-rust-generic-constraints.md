---
title: Rust Generic Constraints
---

# Rust Generic Constraints

Generic constraints (trait bounds) restrict which types can be used with generic functions and structs, ensuring the type has the capabilities you need.

---

## Basic Trait Bounds

```rust
use std::fmt::Display;

fn print_item<T: Display>(item: T) {
    println!("Item: {}", item);
}

fn main() {
    print_item(42);
    print_item("hello");
    print_item(3.14);
}
```

---

## Multiple Bounds

Use `+` to require multiple traits:

```rust
use std::fmt::{Display, Debug};

fn inspect<T: Display + Debug + Clone>(item: T) {
    let copy = item.clone();
    println!("Display: {}", item);
    println!("Debug: {:?}", copy);
}

fn main() {
    inspect(String::from("hello"));
}
```

---

## Where Clauses

For complex bounds, use `where` for readability:

```rust
use std::fmt::Display;

fn process<T, U>(t: T, u: U) -> String
where
    T: Display + Clone,
    U: Display + Into<String>,
{
    format!("{} and {}", t, u)
}
```

---

## Bounds on Struct Implementations

```rust
use std::fmt::Display;

struct Wrapper<T> {
    value: T,
}

// Methods available for ALL T
impl<T> Wrapper<T> {
    fn new(value: T) -> Self {
        Wrapper { value }
    }
}

// Methods only when T: Display
impl<T: Display> Wrapper<T> {
    fn show(&self) {
        println!("Value: {}", self.value);
    }
}

fn main() {
    let w = Wrapper::new(42);
    w.show(); // Works because i32: Display

    let w2 = Wrapper::new(vec![1, 2, 3]);
    // w2.show(); // ERROR: Vec<i32> doesn't implement Display
}
```

---

## The Sized Trait

By default, all generic types must be `Sized` (known size at compile time). Use `?Sized` to relax this:

```rust
fn print_ref<T: std::fmt::Display + ?Sized>(item: &T) {
    println!("{}", item);
}

fn main() {
    let s = String::from("hello");
    print_ref(&s);        // &String
    print_ref("world");   // &str (unsized)
}
```

---

## Conditional Trait Implementation

Implement traits conditionally based on bounds:

```rust
use std::fmt;

struct Pair<T> {
    a: T,
    b: T,
}

// Display only if T: Display
impl<T: fmt::Display> fmt::Display for Pair<T> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "({}, {})", self.a, self.b)
    }
}

fn main() {
    let p = Pair { a: 1, b: 2 };
    println!("{}", p); // Works: i32 implements Display
}
```

> [!TIP]
> Start with minimal bounds and add more only when the compiler asks for them. This keeps your APIs as flexible as possible.
