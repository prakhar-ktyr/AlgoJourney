---
title: Rust Macros
---

# Rust Macros

Macros are a way to write code that generates other code (metaprogramming). Rust has two kinds: **declarative macros** and **procedural macros**.

---

## Declarative Macros (macro_rules!)

The most common type. They match patterns and expand to code:

```rust
macro_rules! say_hello {
    () => {
        println!("Hello!");
    };
}

fn main() {
    say_hello!(); // expands to println!("Hello!");
}
```

---

## Macros with Parameters

```rust
macro_rules! create_function {
    ($name:ident) => {
        fn $name() {
            println!("Function: {}", stringify!($name));
        }
    };
}

create_function!(foo);
create_function!(bar);

fn main() {
    foo(); // Function: foo
    bar(); // Function: bar
}
```

---

## Variadic Macros

Accept a variable number of arguments:

```rust
macro_rules! my_vec {
    ( $( $x:expr ),* ) => {
        {
            let mut temp = Vec::new();
            $(
                temp.push($x);
            )*
            temp
        }
    };
}

fn main() {
    let v = my_vec![1, 2, 3, 4, 5];
    println!("{:?}", v);
}
```

---

## Pattern Matching in Macros

```rust
macro_rules! calculate {
    (add $a:expr, $b:expr) => { $a + $b };
    (mul $a:expr, $b:expr) => { $a * $b };
}

fn main() {
    println!("Add: {}", calculate!(add 5, 3));  // 8
    println!("Mul: {}", calculate!(mul 5, 3));  // 15
}
```

---

## Common Built-in Macros

| Macro | Purpose |
|---|---|
| `println!` | Print to stdout |
| `vec!` | Create a Vec |
| `format!` | Format a string |
| `assert!` | Assert condition |
| `todo!` | Mark unfinished code |
| `unimplemented!` | Mark unimplemented code |
| `dbg!` | Debug print with file/line |
| `include_str!` | Include file as string |

```rust
fn main() {
    let x = 42;
    dbg!(x); // [src/main.rs:3] x = 42

    let _future_work = todo!(); // panics with "not yet implemented"
}
```

---

## Procedural Macros (Overview)

Procedural macros are more powerful — they operate on the token stream. Three types:

1. **Derive macros** — `#[derive(MyMacro)]`
2. **Attribute macros** — `#[my_attribute]`
3. **Function-like macros** — `my_macro!(...)`

```rust
// Using a derive macro (from serde crate):
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct User {
    name: String,
    age: u32,
}
```

> [!TIP]
> Use `macro_rules!` for simple pattern-matching code generation. Use procedural macros (in a separate crate) for complex code generation like custom derives. Use `cargo expand` to see what your macros expand to.
