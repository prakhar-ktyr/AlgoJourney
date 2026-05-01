---
title: Rust Unsafe
---

# Rust Unsafe

The `unsafe` keyword lets you perform operations that the compiler can't verify as safe. It unlocks five superpowers that are not available in safe Rust.

---

## The Five Unsafe Superpowers

1. Dereference a raw pointer
2. Call an unsafe function
3. Access or modify a mutable static variable
4. Implement an unsafe trait
5. Access fields of a `union`

> [!WARNING]
> `unsafe` doesn't disable the borrow checker or other safety checks. It only unlocks the five operations above. You're telling the compiler: "I'll guarantee safety for this code."

---

## Raw Pointers

```rust
fn main() {
    let mut num = 42;

    // Creating raw pointers is safe
    let r1 = &num as *const i32;
    let r2 = &mut num as *mut i32;

    // Dereferencing them requires unsafe
    unsafe {
        println!("r1: {}", *r1);
        println!("r2: {}", *r2);
    }
}
```

---

## Unsafe Functions

```rust
unsafe fn dangerous() {
    println!("This is an unsafe function");
}

fn main() {
    unsafe {
        dangerous();
    }
}
```

---

## Safe Abstraction over Unsafe Code

Wrap unsafe code in a safe API:

```rust
fn split_at_mut(values: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = values.len();
    let ptr = values.as_mut_ptr();

    assert!(mid <= len);

    unsafe {
        (
            std::slice::from_raw_parts_mut(ptr, mid),
            std::slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
}

fn main() {
    let mut v = vec![1, 2, 3, 4, 5, 6];
    let (left, right) = split_at_mut(&mut v, 3);
    println!("Left: {:?}", left);   // [1, 2, 3]
    println!("Right: {:?}", right); // [4, 5, 6]
}
```

---

## FFI — Calling C Code

```rust
extern "C" {
    fn abs(input: i32) -> i32;
}

fn main() {
    unsafe {
        println!("abs(-5) = {}", abs(-5));
    }
}
```

---

## Mutable Static Variables

```rust
static mut COUNTER: u32 = 0;

fn increment() {
    unsafe {
        COUNTER += 1;
    }
}

fn main() {
    increment();
    increment();
    unsafe {
        println!("Counter: {}", COUNTER);
    }
}
```

---

## Best Practices

| Guideline | Why |
|---|---|
| Minimize unsafe blocks | Easier to audit |
| Wrap in safe abstractions | Contain the risk |
| Document safety invariants | Help future maintainers |
| Use `// SAFETY:` comments | Explain why it's safe |

```rust
fn example(ptr: *const i32) -> i32 {
    // SAFETY: caller guarantees ptr is valid and aligned
    unsafe { *ptr }
}
```

> [!TIP]
> Most Rust programs never need `unsafe`. When you do, keep unsafe blocks as small as possible and wrap them in safe APIs. Use `cargo miri` to detect undefined behavior in unsafe code.
