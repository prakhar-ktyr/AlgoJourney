---
title: Rust Loops
---

# Rust Loops

The `loop` keyword creates an **infinite loop** in Rust. You use `break` to exit and `continue` to skip to the next iteration.

---

## Basic Loop

```rust
fn main() {
    let mut count = 0;

    loop {
        count += 1;
        println!("count = {}", count);

        if count >= 5 {
            break;
        }
    }
}
```

---

## Returning Values from Loop

`loop` is an expression — you can return a value with `break`:

```rust
fn main() {
    let mut counter = 0;

    let result = loop {
        counter += 1;

        if counter == 10 {
            break counter * 2;
        }
    };

    println!("Result: {}", result); // 20
}
```

---

## Loop Labels

When you have nested loops, use labels to `break` or `continue` a specific loop:

```rust
fn main() {
    let mut outer_count = 0;

    'outer: loop {
        let mut inner_count = 0;
        outer_count += 1;

        loop {
            inner_count += 1;

            if inner_count == 3 {
                break; // breaks inner loop only
            }
            if outer_count == 2 {
                break 'outer; // breaks the outer loop
            }
        }

        println!("Outer: {}", outer_count);
    }

    println!("Done! outer_count = {}", outer_count);
}
```

---

## Continue

Use `continue` to skip the rest of the current iteration:

```rust
fn main() {
    let mut i = 0;

    loop {
        i += 1;
        if i > 10 {
            break;
        }
        if i % 2 == 0 {
            continue; // skip even numbers
        }
        println!("{}", i); // prints 1, 3, 5, 7, 9
    }
}
```

> [!TIP]
> Use `loop` when you don't know in advance how many iterations you need. For counted or conditional loops, use `while` or `for` (covered in the next lessons).
