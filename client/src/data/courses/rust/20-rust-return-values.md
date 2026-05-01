---
title: Rust Return Values
---

# Rust Return Values

Rust functions use the last expression as the return value, or the `return` keyword for early exits. Understanding expression-based returns is key to idiomatic Rust.

---

## Implicit Returns

The last expression in a function body (without a semicolon) is the return value:

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn is_positive(n: i32) -> bool {
    n > 0
}

fn main() {
    println!("{}", add(3, 4));        // 7
    println!("{}", is_positive(-5));  // false
}
```

---

## Explicit Returns

Use `return` for early exits or for clarity:

```rust
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        return Err(String::from("Cannot divide by zero"));
    }
    Ok(a / b)
}

fn main() {
    match divide(10.0, 3.0) {
        Ok(result) => println!("Result: {:.2}", result),
        Err(e) => println!("Error: {}", e),
    }
}
```

---

## Returning Tuples

Return multiple values with tuples:

```rust
fn swap(a: i32, b: i32) -> (i32, i32) {
    (b, a)
}

fn divide_with_remainder(a: i32, b: i32) -> (i32, i32) {
    (a / b, a % b)
}

fn main() {
    let (x, y) = swap(1, 2);
    println!("Swapped: {}, {}", x, y);

    let (quotient, remainder) = divide_with_remainder(17, 5);
    println!("17 / 5 = {} remainder {}", quotient, remainder);
}
```

---

## Returning References

You can return references, but the lifetime must be valid:

```rust
fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}

fn main() {
    let s1 = String::from("long string");
    let result;
    {
        let s2 = String::from("short");
        result = longest(&s1, &s2);
        println!("Longest: {}", result);
    }
}
```

> [!NOTE]
> The `'a` syntax is a **lifetime annotation**. It tells Rust that the returned reference will live as long as the shortest-lived input reference. You'll learn more about lifetimes in a later lesson.

---

## Never Type

Functions that never return use `!` (the never type):

```rust
fn infinite_loop() -> ! {
    loop {
        // runs forever
    }
}

fn crash(msg: &str) -> ! {
    panic!("Fatal error: {}", msg);
}
```

> [!TIP]
> The never type `!` is useful for functions that always panic, loop forever, or call `std::process::exit()`. The compiler uses it to understand unreachable code.
