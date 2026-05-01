---
title: Rust Async / Await
---

# Rust Async / Await

Async programming in Rust allows you to write concurrent code that looks synchronous. It's ideal for I/O-bound operations like network requests and file operations.

---

## What is Async?

Async functions return a **Future** — a value that will be computed later. The `await` keyword pauses execution until the future resolves.

```rust
// This function returns a Future, not the value directly
async fn hello() -> String {
    String::from("Hello, async world!")
}
```

---

## Using an Async Runtime

Rust's standard library provides async primitives but **not** a runtime. You need a crate like `tokio`:

```toml
# Cargo.toml
[dependencies]
tokio = { version = "1", features = ["full"] }
```

```rust
use tokio::time::{sleep, Duration};

async fn fetch_data() -> String {
    sleep(Duration::from_secs(1)).await;
    String::from("Data loaded!")
}

#[tokio::main]
async fn main() {
    println!("Fetching...");
    let result = fetch_data().await;
    println!("{}", result);
}
```

---

## Concurrent Tasks

Run multiple async operations concurrently:

```rust
use tokio::time::{sleep, Duration};

async fn task(id: u32, ms: u64) -> String {
    sleep(Duration::from_millis(ms)).await;
    format!("Task {} done", id)
}

#[tokio::main]
async fn main() {
    // Sequential — takes 600ms total
    let a = task(1, 300).await;
    let b = task(2, 300).await;
    println!("{}, {}", a, b);

    // Concurrent — takes 300ms total
    let (c, d) = tokio::join!(
        task(3, 300),
        task(4, 300)
    );
    println!("{}, {}", c, d);
}
```

---

## Spawning Tasks

`tokio::spawn` creates a new async task:

```rust
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    let handle = tokio::spawn(async {
        sleep(Duration::from_millis(500)).await;
        42
    });

    println!("Doing other work...");
    let result = handle.await.unwrap();
    println!("Task returned: {}", result);
}
```

---

## Async vs Threads

| Feature | Threads | Async Tasks |
|---|---|---|
| Overhead | Heavy (OS thread) | Lightweight (few KB) |
| Best for | CPU-bound work | I/O-bound work |
| Count | Hundreds | Millions |
| Scheduling | OS scheduler | Runtime scheduler |

---

## Error Handling in Async

```rust
use std::io;

async fn read_file(path: &str) -> Result<String, io::Error> {
    tokio::fs::read_to_string(path).await
}

#[tokio::main]
async fn main() {
    match read_file("hello.txt").await {
        Ok(contents) => println!("{}", contents),
        Err(e) => println!("Error: {}", e),
    }
}
```

> [!TIP]
> Use async/await for I/O-bound work (network, file system, databases). Use threads for CPU-bound work (computation, image processing). You can mix both in the same application.
