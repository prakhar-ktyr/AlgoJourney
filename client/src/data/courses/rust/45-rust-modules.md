---
title: Rust Modules
---

# Rust Modules

Modules organize code into logical groups and control the visibility (public/private) of items.

---

## Defining Modules

```rust
mod math {
    pub fn add(a: i32, b: i32) -> i32 {
        a + b
    }

    pub fn multiply(a: i32, b: i32) -> i32 {
        a * b
    }

    fn helper() -> i32 {
        42  // private — only accessible within this module
    }
}

fn main() {
    println!("Add: {}", math::add(3, 4));
    println!("Multiply: {}", math::multiply(3, 4));
    // math::helper(); // ERROR: function is private
}
```

---

## Visibility with pub

By default, everything in Rust is **private**. Use `pub` to make items public:

```rust
mod account {
    pub struct User {
        pub name: String,    // public field
        email: String,       // private field
    }

    impl User {
        pub fn new(name: &str, email: &str) -> User {
            User {
                name: String::from(name),
                email: String::from(email),
            }
        }

        pub fn email(&self) -> &str {
            &self.email
        }
    }
}

fn main() {
    let user = account::User::new("Alice", "alice@example.com");
    println!("Name: {}", user.name);        // OK — public field
    println!("Email: {}", user.email());    // OK — public method
    // println!("{}", user.email);           // ERROR: field is private
}
```

---

## Nested Modules

```rust
mod network {
    pub mod http {
        pub fn get(url: &str) -> String {
            format!("GET {}", url)
        }
    }

    pub mod tcp {
        pub fn connect(addr: &str) -> String {
            format!("Connected to {}", addr)
        }
    }
}

fn main() {
    println!("{}", network::http::get("https://example.com"));
    println!("{}", network::tcp::connect("127.0.0.1:8080"));
}
```

---

## The use Keyword

Bring items into scope to avoid long paths:

```rust
mod shapes {
    pub fn circle_area(radius: f64) -> f64 {
        std::f64::consts::PI * radius * radius
    }

    pub fn square_area(side: f64) -> f64 {
        side * side
    }
}

use shapes::circle_area;
use shapes::square_area;

fn main() {
    println!("Circle: {:.2}", circle_area(5.0));
    println!("Square: {:.2}", square_area(4.0));
}
```

---

## Modules in Separate Files

For larger projects, modules live in separate files:

```
src/
├── main.rs
├── math.rs        // mod math
└── utils/
    ├── mod.rs     // mod utils
    └── helpers.rs // mod helpers (inside utils)
```

**main.rs:**
```rust
mod math;       // loads from math.rs
mod utils;      // loads from utils/mod.rs

fn main() {
    println!("{}", math::add(1, 2));
}
```

**math.rs:**
```rust
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

---

## Re-exporting with pub use

```rust
mod internal {
    pub fn secret_function() -> &'static str {
        "revealed!"
    }
}

pub use internal::secret_function;

fn main() {
    // Can call directly without internal::
    println!("{}", secret_function());
}
```

> [!TIP]
> Use `pub use` to create a clean public API that hides internal module structure. This is a common pattern in Rust libraries.
