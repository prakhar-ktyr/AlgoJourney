---
title: Rust Functions
---

# Rust Functions

Functions are defined with the `fn` keyword. Rust uses **snake_case** for function names by convention.

---

## Defining Functions

```rust
fn greet() {
    println!("Hello, World!");
}

fn main() {
    greet(); // calling the function
    greet(); // can call multiple times
}
```

---

## Functions with Parameters

Specify parameter types in the function signature:

```rust
fn greet_user(name: &str) {
    println!("Hello, {}!", name);
}

fn add(a: i32, b: i32) {
    println!("{} + {} = {}", a, b, a + b);
}

fn main() {
    greet_user("Alice");
    add(3, 7);
}
```

> [!IMPORTANT]
> In Rust, you **must** declare the type of every function parameter. Type inference does not apply to function signatures.

---

## Functions with Return Values

Use `->` to specify the return type. The last expression (without a semicolon) is the return value:

```rust
fn square(x: i32) -> i32 {
    x * x  // no semicolon — this is the return value
}

fn main() {
    let result = square(5);
    println!("5 squared = {}", result); // 25
}
```

You can also use the `return` keyword for early returns:

```rust
fn absolute(x: i32) -> i32 {
    if x < 0 {
        return -x; // early return
    }
    x // implicit return
}

fn main() {
    println!("{}", absolute(-5));  // 5
    println!("{}", absolute(3));   // 3
}
```

---

## Multiple Return Values (Tuples)

Return multiple values using a tuple:

```rust
fn min_max(list: &[i32]) -> (i32, i32) {
    let mut min = list[0];
    let mut max = list[0];

    for &val in list {
        if val < min { min = val; }
        if val > max { max = val; }
    }

    (min, max)
}

fn main() {
    let numbers = vec![3, 7, 1, 9, 4];
    let (min, max) = min_max(&numbers);
    println!("Min: {}, Max: {}", min, max);
}
```

---

## The Unit Type

Functions that don't return a value implicitly return `()` (the unit type):

```rust
fn say_hello() {
    println!("Hello!");
    // implicitly returns ()
}

fn main() {
    let result = say_hello();
    println!("Returned: {:?}", result); // ()
}
```

> [!TIP]
> Functions are defined at the module level. Unlike some languages, Rust does not require forward declarations — you can call a function defined later in the file.
