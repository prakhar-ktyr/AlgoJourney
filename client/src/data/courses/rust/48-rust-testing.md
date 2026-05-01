---
title: Rust Testing
---

# Rust Testing

Rust has built-in testing support. Write tests alongside your code and run them with `cargo test`.

---

## Unit Tests

Tests are functions annotated with `#[test]`:

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn test_add_negative() {
        assert_eq!(add(-1, 1), 0);
    }
}
```

Run with:

```bash
cargo test
```

---

## Assert Macros

| Macro | Description |
|---|---|
| `assert!(expr)` | Passes if `expr` is true |
| `assert_eq!(a, b)` | Passes if `a == b` |
| `assert_ne!(a, b)` | Passes if `a != b` |

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_assertions() {
        assert!(2 + 2 == 4);
        assert_eq!(vec![1, 2, 3].len(), 3);
        assert_ne!("hello", "world");
    }

    #[test]
    fn test_with_message() {
        let result = 2 + 2;
        assert_eq!(result, 4, "Expected 4 but got {}", result);
    }
}
```

---

## Testing for Panics

```rust
fn divide(a: i32, b: i32) -> i32 {
    if b == 0 {
        panic!("Division by zero!");
    }
    a / b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic]
    fn test_divide_by_zero() {
        divide(10, 0);
    }

    #[test]
    #[should_panic(expected = "Division by zero")]
    fn test_panic_message() {
        divide(10, 0);
    }
}
```

---

## Result-Based Tests

Tests can return `Result` instead of panicking:

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_parse() -> Result<(), String> {
        let num: i32 = "42".parse().map_err(|e| format!("{}", e))?;
        assert_eq!(num, 42);
        Ok(())
    }
}
```

---

## Integration Tests

Place integration tests in the `tests/` directory:

```
my_project/
├── src/
│   └── lib.rs
└── tests/
    └── integration_test.rs
```

```rust
// tests/integration_test.rs
use my_project::add;

#[test]
fn test_add_integration() {
    assert_eq!(add(10, 20), 30);
}
```

---

## Ignoring and Filtering Tests

```rust
#[cfg(test)]
mod tests {
    #[test]
    #[ignore]
    fn slow_test() {
        // This test takes a long time
        std::thread::sleep(std::time::Duration::from_secs(10));
    }
}
```

```bash
cargo test                    # run all (except ignored)
cargo test -- --ignored       # run only ignored tests
cargo test test_add           # run tests matching "test_add"
cargo test -- --show-output   # show println! output
```

> [!TIP]
> Use `#[cfg(test)]` on test modules so test code is only compiled when running tests. This keeps your production binary lean.
