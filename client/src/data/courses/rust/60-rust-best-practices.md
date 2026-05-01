---
title: Rust Best Practices
---

# Rust Best Practices

A collection of best practices and patterns to write idiomatic, maintainable, and performant Rust code.

---

## Code Organization

- Use **modules** to organize code by feature or domain.
- Keep `main.rs` minimal — delegate to library code in `lib.rs`.
- Use `pub use` to create clean public APIs.
- Follow the standard project layout (`src/`, `tests/`, `examples/`, `benches/`).

```rust
// lib.rs — clean public API
mod auth;
mod database;
mod handlers;

pub use auth::authenticate;
pub use database::Database;
pub use handlers::Router;
```

---

## Error Handling

- Use `Result` for recoverable errors, `panic!` for bugs.
- Create custom error types for libraries.
- Use `?` for error propagation.
- Use `anyhow` in applications, `thiserror` in libraries.

```rust
// Good — custom error with thiserror
use thiserror::Error;

#[derive(Error, Debug)]
enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] std::io::Error),
    #[error("Not found: {0}")]
    NotFound(String),
}
```

---

## Ownership and Borrowing

- Prefer borrowing (`&T`) over ownership when you don't need to own data.
- Accept `&str` instead of `&String`, `&[T]` instead of `&Vec<T>`.
- Use `Clone` sparingly — understand why you're cloning.
- Use `Cow<str>` when you sometimes need to allocate.

```rust
// Good — accepts both &String and &str
fn process(data: &str) { /* ... */ }

// Avoid — unnecessarily restrictive
fn process_bad(data: &String) { /* ... */ }
```

---

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Variables, functions | snake_case | `my_variable` |
| Types, traits | PascalCase | `MyStruct` |
| Constants | SCREAMING_SNAKE | `MAX_SIZE` |
| Modules | snake_case | `my_module` |
| Lifetimes | short lowercase | `'a`, `'input` |

---

## Iteration Patterns

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    // Prefer iterator methods over manual loops
    let sum: i32 = numbers.iter().sum();
    let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();
    let evens: Vec<&i32> = numbers.iter().filter(|x| **x % 2 == 0).collect();

    // Use enumerate for index + value
    for (i, val) in numbers.iter().enumerate() {
        println!("{}: {}", i, val);
    }
}
```

---

## Struct Design

- Derive `Debug` on every struct.
- Implement `Display` for user-facing output.
- Use builder pattern for complex construction.
- Use `Default` for structs with sensible defaults.

```rust
#[derive(Debug, Default, Clone)]
struct Config {
    host: String,
    port: u16,
    max_retries: u32,
}

impl Config {
    fn new() -> Self {
        Config {
            host: String::from("localhost"),
            port: 8080,
            max_retries: 3,
        }
    }
}
```

---

## Testing

- Write unit tests in the same file with `#[cfg(test)]`.
- Write integration tests in `tests/`.
- Test edge cases and error paths.
- Use `cargo clippy` for additional linting.
- Use `cargo fmt` for consistent formatting.

---

## Performance

- Profile before optimizing (`cargo flamegraph`).
- Use `&str` instead of `String` when possible.
- Preallocate with `Vec::with_capacity()`.
- Use iterators — they're zero-cost abstractions.
- Build with `--release` for production.

---

## Essential Crates

| Category | Crate | Purpose |
|---|---|---|
| Errors | `anyhow`, `thiserror` | Error handling |
| Serialization | `serde`, `serde_json` | Data formats |
| HTTP | `reqwest`, `axum` | Client/server |
| Async | `tokio` | Async runtime |
| CLI | `clap` | Argument parsing |
| Logging | `tracing`, `log` | Structured logging |
| Testing | `proptest`, `criterion` | Property testing, benchmarks |

> [!TIP]
> Run `cargo clippy` on every project. It catches hundreds of common mistakes and teaches you idiomatic Rust patterns. Treat its suggestions as learning opportunities!
