---
title: Rust Concurrency
---

# Rust Concurrency

Rust's ownership system enables **fearless concurrency** — the compiler prevents data races at compile time, making concurrent programming safe.

---

## Why Fearless Concurrency?

In most languages, concurrency bugs (data races, deadlocks) are runtime errors that are hard to reproduce. Rust catches them at **compile time**:

- The ownership system prevents two threads from accessing the same mutable data simultaneously.
- The type system enforces thread-safety through `Send` and `Sync` traits.

---

## Send and Sync Traits

| Trait | Meaning |
|---|---|
| `Send` | A type can be transferred to another thread |
| `Sync` | A type can be referenced from multiple threads |

Most types are `Send + Sync` automatically. Notable exceptions:

- `Rc<T>` — not `Send` or `Sync` (use `Arc<T>` instead)
- `RefCell<T>` — not `Sync` (use `Mutex<T>` instead)
- Raw pointers — not `Send` or `Sync`

---

## Concurrency Models in Rust

Rust supports multiple concurrency approaches:

1. **Threads** — OS-level parallelism (next lesson)
2. **Message passing** — Channels for thread communication
3. **Shared state** — Mutex and Arc for shared data
4. **Async/await** — Lightweight concurrent tasks

```rust
use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        println!("Hello from a thread!");
    });

    println!("Hello from main!");
    handle.join().unwrap();
}
```

---

## Data Race Prevention

The compiler prevents data races:

```rust
use std::thread;

fn main() {
    let mut data = vec![1, 2, 3];

    // This would NOT compile:
    // thread::spawn(|| {
    //     data.push(4); // can't borrow mutably in another thread
    // });
    // println!("{:?}", data); // while main thread still uses it

    // Instead, move ownership:
    let handle = thread::spawn(move || {
        data.push(4);
        println!("Thread data: {:?}", data);
    });

    handle.join().unwrap();
    // data is no longer accessible here
}
```

> [!IMPORTANT]
> The Rust compiler won't let you create a data race. If your concurrent code compiles, it's free from data races. This is a powerful guarantee that no other mainstream systems language provides.

---

## Choosing a Concurrency Strategy

| Need | Use |
|---|---|
| CPU-bound parallelism | `std::thread` or `rayon` |
| Thread communication | Channels (`mpsc`) |
| Shared mutable state | `Arc<Mutex<T>>` |
| I/O-bound concurrency | `async`/`await` with `tokio` |

> [!TIP]
> Start with message passing (channels) — it's the simplest and safest model. Only reach for shared state when message passing isn't practical.
