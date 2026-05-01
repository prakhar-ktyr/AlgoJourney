---
title: Rust Tuples
---

# Rust Tuples

A tuple is a fixed-size collection that can hold values of **different types**. Tuples are useful for grouping related values together.

---

## Creating Tuples

```rust
fn main() {
    let person: (&str, i32, f64) = ("Alice", 30, 5.6);
    println!("{:?}", person);

    // Type inference works too
    let point = (3, 4);
    let rgb = (255, 128, 0);

    println!("Point: {:?}, Color: {:?}", point, rgb);
}
```

---

## Accessing Tuple Elements

Use dot notation with the index:

```rust
fn main() {
    let person = ("Alice", 30, 5.6);

    println!("Name: {}", person.0);
    println!("Age: {}", person.1);
    println!("Height: {}", person.2);
}
```

---

## Destructuring Tuples

```rust
fn main() {
    let person = ("Alice", 30, "Engineer");
    let (name, age, job) = person;

    println!("{} is {} and works as {}", name, age, job);

    // Ignore values with _
    let (_, age_only, _) = person;
    println!("Age: {}", age_only);
}
```

---

## Tuples as Return Values

```rust
fn min_max(list: &[i32]) -> (i32, i32) {
    let mut min = list[0];
    let mut max = list[0];

    for &val in &list[1..] {
        if val < min { min = val; }
        if val > max { max = val; }
    }
    (min, max)
}

fn main() {
    let nums = vec![3, 7, 1, 9, 4, 6];
    let (min, max) = min_max(&nums);
    println!("Min: {}, Max: {}", min, max);
}
```

---

## The Unit Type

The empty tuple `()` is called the **unit type**. It represents "no value":

```rust
fn do_nothing() {
    // implicitly returns ()
}

fn main() {
    let result = do_nothing();
    println!("Result: {:?}", result); // ()
}
```

> [!TIP]
> Tuples are great for returning multiple values from a function. For more complex grouped data with named fields, use **structs** (covered in a later lesson).
