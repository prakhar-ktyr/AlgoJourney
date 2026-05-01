---
title: Rust Slices
---

# Rust Slices

Slices let you reference a **contiguous sequence** of elements in a collection rather than the whole collection. A slice is a kind of reference, so it does not have ownership.

---

## String Slices

A string slice (`&str`) is a reference to part of a `String`:

```rust
fn main() {
    let s = String::from("hello world");

    let hello = &s[0..5];   // "hello"
    let world = &s[6..11];  // "world"

    println!("{} {}", hello, world);
}
```

Range syntax shortcuts:

```rust
fn main() {
    let s = String::from("hello");

    let slice1 = &s[0..3];  // "hel"
    let slice2 = &s[..3];   // "hel" (same — start from 0)
    let slice3 = &s[3..];   // "lo"  (to the end)
    let slice4 = &s[..];    // "hello" (entire string)

    println!("{} {} {} {}", slice1, slice2, slice3, slice4);
}
```

---

## String Slices and Functions

Use `&str` in function parameters for maximum flexibility:

```rust
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &byte) in bytes.iter().enumerate() {
        if byte == b' ' {
            return &s[..i];
        }
    }
    s
}

fn main() {
    let owned = String::from("hello world");
    let literal = "foo bar";

    println!("{}", first_word(&owned));   // "hello"
    println!("{}", first_word(literal));  // "foo"
}
```

> [!TIP]
> `&str` is more flexible than `&String` as a parameter type because it accepts both `String` references and string literals.

---

## Array Slices

Slices also work with arrays and vectors:

```rust
fn main() {
    let arr = [1, 2, 3, 4, 5];

    let slice = &arr[1..4]; // [2, 3, 4]
    println!("{:?}", slice);
    println!("Length: {}", slice.len());
}
```

---

## Slices as Function Parameters

```rust
fn sum(numbers: &[i32]) -> i32 {
    let mut total = 0;
    for &n in numbers {
        total += n;
    }
    total
}

fn main() {
    let arr = [10, 20, 30, 40, 50];
    let vec = vec![1, 2, 3];

    println!("Array sum: {}", sum(&arr));       // 150
    println!("Slice sum: {}", sum(&arr[1..4])); // 90
    println!("Vec sum: {}", sum(&vec));          // 6
}
```

---

## Mutable Slices

```rust
fn double_values(slice: &mut [i32]) {
    for val in slice.iter_mut() {
        *val *= 2;
    }
}

fn main() {
    let mut numbers = vec![1, 2, 3, 4, 5];
    double_values(&mut numbers[1..4]);
    println!("{:?}", numbers); // [1, 4, 6, 8, 5]
}
```

> [!NOTE]
> Slices store a pointer to the data and a length. They are a "fat pointer" — 16 bytes on 64-bit systems (8 for the pointer + 8 for the length).
