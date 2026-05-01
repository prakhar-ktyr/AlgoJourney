---
title: Rust Threads
---

# Rust Threads

Rust uses OS threads for true parallelism. The `std::thread` module provides the tools to spawn and manage threads.

---

## Spawning Threads

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..=5 {
            println!("Thread: count {}", i);
            thread::sleep(Duration::from_millis(100));
        }
    });

    for i in 1..=3 {
        println!("Main: count {}", i);
        thread::sleep(Duration::from_millis(150));
    }

    handle.join().unwrap(); // wait for thread to finish
    println!("Both done!");
}
```

---

## Moving Data into Threads

Use `move` to transfer ownership to a thread:

```rust
use std::thread;

fn main() {
    let name = String::from("Alice");

    let handle = thread::spawn(move || {
        println!("Hello, {}!", name);
    });

    // name is no longer available here
    handle.join().unwrap();
}
```

---

## Getting Return Values

`join()` returns the thread's return value:

```rust
use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        let sum: i32 = (1..=100).sum();
        sum
    });

    let result = handle.join().unwrap();
    println!("Sum: {}", result); // 5050
}
```

---

## Multiple Threads

```rust
use std::thread;

fn main() {
    let mut handles = vec![];

    for id in 0..5 {
        let handle = thread::spawn(move || {
            println!("Thread {} is running", id);
            id * id
        });
        handles.push(handle);
    }

    let results: Vec<i32> = handles
        .into_iter()
        .map(|h| h.join().unwrap())
        .collect();

    println!("Results: {:?}", results);
}
```

---

## Thread Builder

Customize thread properties:

```rust
use std::thread;

fn main() {
    let builder = thread::Builder::new()
        .name("worker-1".into())
        .stack_size(4 * 1024 * 1024); // 4 MB stack

    let handle = builder.spawn(|| {
        let name = thread::current().name().unwrap_or("unknown").to_string();
        println!("Running on thread: {}", name);
    }).unwrap();

    handle.join().unwrap();
}
```

---

## Scoped Threads

Scoped threads can borrow data from the parent without `move`:

```rust
use std::thread;

fn main() {
    let data = vec![1, 2, 3, 4, 5];

    thread::scope(|s| {
        s.spawn(|| {
            println!("Thread 1: {:?}", &data[..3]);
        });
        s.spawn(|| {
            println!("Thread 2: {:?}", &data[3..]);
        });
    }); // all scoped threads are joined here

    println!("Data is still usable: {:?}", data);
}
```

> [!TIP]
> Use `thread::scope` (Rust 1.63+) when threads need to borrow data from the parent. It guarantees all spawned threads finish before the scope exits, making borrowing safe.
