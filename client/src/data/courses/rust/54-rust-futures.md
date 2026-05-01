---
title: Rust Futures
---

# Rust Futures

A `Future` is a value that represents an asynchronous computation that may not have finished yet. Understanding futures is key to mastering async Rust.

---

## The Future Trait

```rust
// Simplified definition:
// trait Future {
//     type Output;
//     fn poll(self: Pin<&mut Self>, cx: &mut Context) -> Poll<Self::Output>;
// }
//
// enum Poll<T> {
//     Ready(T),
//     Pending,
// }
```

- `Ready(T)` — the future has completed with value `T`.
- `Pending` — the future is not yet complete.

---

## Futures are Lazy

Futures do **nothing** until polled (awaited):

```rust
async fn compute() -> i32 {
    println!("Computing...");
    42
}

#[tokio::main]
async fn main() {
    let future = compute(); // nothing happens yet!
    println!("Future created");

    let result = future.await; // now it runs
    println!("Result: {}", result);
}
```

---

## Combining Futures

### join! — Run Concurrently, Wait for All

```rust
use tokio::time::{sleep, Duration};

async fn step(name: &str, ms: u64) -> String {
    sleep(Duration::from_millis(ms)).await;
    format!("{} done", name)
}

#[tokio::main]
async fn main() {
    let (a, b, c) = tokio::join!(
        step("A", 100),
        step("B", 200),
        step("C", 150)
    );
    println!("{}, {}, {}", a, b, c);
}
```

### select! — Wait for First to Complete

```rust
use tokio::time::{sleep, Duration};

async fn fast() -> &'static str {
    sleep(Duration::from_millis(100)).await;
    "fast"
}

async fn slow() -> &'static str {
    sleep(Duration::from_millis(500)).await;
    "slow"
}

#[tokio::main]
async fn main() {
    tokio::select! {
        val = fast() => println!("First: {}", val),
        val = slow() => println!("First: {}", val),
    }
    // Prints: First: fast
}
```

---

## Streams — Async Iterators

Streams are the async equivalent of iterators:

```rust
use tokio_stream::StreamExt;

#[tokio::main]
async fn main() {
    let mut stream = tokio_stream::iter(vec![1, 2, 3, 4, 5]);

    while let Some(value) = stream.next().await {
        println!("Got: {}", value);
    }
}
```

---

## Pinning

Some futures need to be **pinned** to a fixed memory location:

```rust
use std::pin::Pin;
use std::future::Future;

fn make_future() -> Pin<Box<dyn Future<Output = i32>>> {
    Box::pin(async {
        42
    })
}

#[tokio::main]
async fn main() {
    let result = make_future().await;
    println!("Result: {}", result);
}
```

> [!NOTE]
> `Pin` prevents a value from being moved in memory. This is necessary for self-referential futures (futures that contain references to their own data).

---

## Async Traits

As of Rust 1.75+, you can use async functions in traits:

```rust
trait DataStore {
    async fn get(&self, key: &str) -> Option<String>;
    async fn set(&mut self, key: &str, value: &str);
}
```

> [!TIP]
> You rarely need to implement the `Future` trait manually. Use `async fn` and `async {}` blocks — the compiler generates the `Future` implementation for you.
