---
title: Rust Type Aliases
---

# Rust Type Aliases

Type aliases create a new name for an existing type, making complex types more readable and maintainable.

---

## Basic Type Aliases

```rust
type Meters = f64;
type Seconds = f64;

fn speed(distance: Meters, time: Seconds) -> f64 {
    distance / time
}

fn main() {
    let d: Meters = 100.0;
    let t: Seconds = 9.58;
    println!("Speed: {:.2} m/s", speed(d, t));
}
```

> [!NOTE]
> Type aliases don't create new types — they're just alternative names. `Meters` and `f64` are fully interchangeable.

---

## Simplifying Complex Types

```rust
use std::collections::HashMap;

type StudentScores = HashMap<String, Vec<i32>>;

fn average_scores(scores: &StudentScores) -> HashMap<String, f64> {
    let mut averages = HashMap::new();
    for (name, grades) in scores {
        let avg = grades.iter().sum::<i32>() as f64 / grades.len() as f64;
        averages.insert(name.clone(), avg);
    }
    averages
}

fn main() {
    let mut scores: StudentScores = HashMap::new();
    scores.insert(String::from("Alice"), vec![90, 85, 92]);
    scores.insert(String::from("Bob"), vec![78, 82, 88]);

    let avgs = average_scores(&scores);
    println!("{:?}", avgs);
}
```

---

## Result Type Aliases

Common in libraries to simplify error handling:

```rust
use std::io;

// Common pattern in std::io
type IoResult<T> = Result<T, io::Error>;

fn read_file(path: &str) -> IoResult<String> {
    std::fs::read_to_string(path)
}
```

---

## Generic Type Aliases

```rust
type Pair<T> = (T, T);
type StringMap<V> = std::collections::HashMap<String, V>;

fn main() {
    let coords: Pair<f64> = (3.0, 4.0);
    println!("Coordinates: {:?}", coords);

    let mut config: StringMap<String> = std::collections::HashMap::new();
    config.insert(String::from("key"), String::from("value"));
    println!("{:?}", config);
}
```

---

## Newtype Pattern (True New Types)

For actual distinct types (not just aliases), use the newtype pattern:

```rust
struct Meters(f64);
struct Seconds(f64);

impl Meters {
    fn value(&self) -> f64 { self.0 }
}

impl Seconds {
    fn value(&self) -> f64 { self.0 }
}

fn speed(distance: Meters, time: Seconds) -> f64 {
    distance.value() / time.value()
}

fn main() {
    let d = Meters(100.0);
    let t = Seconds(9.58);
    println!("Speed: {:.2} m/s", speed(d, t));

    // speed(t, d); // ERROR: wrong types! (compile-time safety)
}
```

> [!TIP]
> Use type aliases for readability. Use the newtype pattern when you need the compiler to treat types as truly distinct (preventing accidental mixing).
