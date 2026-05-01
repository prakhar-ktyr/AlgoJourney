---
title: Rust While Loops
---

# Rust While Loops

A `while` loop runs as long as a condition is `true`. It checks the condition before each iteration.

---

## Basic While Loop

```rust
fn main() {
    let mut count = 0;

    while count < 5 {
        println!("count = {}", count);
        count += 1;
    }

    println!("Done!");
}
```

**Output:**

```
count = 0
count = 1
count = 2
count = 3
count = 4
Done!
```

---

## While with Complex Conditions

```rust
fn main() {
    let mut sum = 0;
    let mut n = 1;

    while n <= 100 && sum < 200 {
        sum += n;
        n += 1;
    }

    println!("Sum: {}, stopped at n={}", sum, n);
}
```

---

## While with Break and Continue

```rust
fn main() {
    let mut i = 0;

    while i < 20 {
        i += 1;

        if i % 3 == 0 {
            continue; // skip multiples of 3
        }
        if i > 15 {
            break; // stop early
        }

        println!("{}", i);
    }
}
```

---

## While Let

`while let` continues looping as long as a pattern matches — great for working with `Option` or iterators:

```rust
fn main() {
    let mut stack = vec![1, 2, 3, 4, 5];

    while let Some(top) = stack.pop() {
        println!("Popped: {}", top);
    }

    println!("Stack is empty!");
}
```

**Output:**

```
Popped: 5
Popped: 4
Popped: 3
Popped: 2
Popped: 1
Stack is empty!
```

> [!TIP]
> Prefer `for` loops when iterating over collections. Use `while` when the number of iterations depends on a runtime condition, and `while let` when consuming values from an `Option` or pattern.
