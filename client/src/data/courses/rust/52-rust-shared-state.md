---
title: Rust Shared State
---

# Rust Shared State (Mutex and Arc)

When multiple threads need access to the same data, use `Mutex` for mutual exclusion and `Arc` for shared ownership across threads.

---

## Mutex — Mutual Exclusion

`Mutex<T>` ensures only one thread accesses the data at a time:

```rust
use std::sync::Mutex;

fn main() {
    let m = Mutex::new(5);

    {
        let mut num = m.lock().unwrap();
        *num = 10;
    } // lock is released here

    println!("Value: {:?}", m);
}
```

- `lock()` acquires the lock, returning a `MutexGuard`.
- The lock is automatically released when the guard goes out of scope.

---

## Arc — Atomic Reference Counting

`Rc<T>` is not thread-safe. Use `Arc<T>` (Atomic Reference Counting) for shared ownership across threads:

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Final count: {}", *counter.lock().unwrap()); // 10
}
```

---

## RwLock — Read-Write Lock

Allows multiple readers or one writer at a time:

```rust
use std::sync::{Arc, RwLock};
use std::thread;

fn main() {
    let data = Arc::new(RwLock::new(vec![1, 2, 3]));
    let mut handles = vec![];

    // Multiple readers
    for i in 0..3 {
        let data = Arc::clone(&data);
        handles.push(thread::spawn(move || {
            let read = data.read().unwrap();
            println!("Reader {}: {:?}", i, *read);
        }));
    }

    // One writer
    {
        let data = Arc::clone(&data);
        handles.push(thread::spawn(move || {
            let mut write = data.write().unwrap();
            write.push(4);
            println!("Writer: {:?}", *write);
        }));
    }

    for h in handles {
        h.join().unwrap();
    }
}
```

---

## Avoiding Deadlocks

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let a = Arc::new(Mutex::new(1));
    let b = Arc::new(Mutex::new(2));

    // Always lock in the same order to avoid deadlocks
    let a2 = Arc::clone(&a);
    let b2 = Arc::clone(&b);

    let h = thread::spawn(move || {
        let _a = a2.lock().unwrap(); // lock a first
        let _b = b2.lock().unwrap(); // then b
        println!("Thread: got both locks");
    });

    let _a = a.lock().unwrap(); // same order: a first
    let _b = b.lock().unwrap(); // then b
    println!("Main: got both locks");

    h.join().unwrap();
}
```

> [!WARNING]
> `Mutex` can cause deadlocks if two threads lock multiple mutexes in different orders. Always lock in a consistent order, and keep critical sections as short as possible.

---

## When to Use What

| Tool | Use Case |
|---|---|
| `Mutex<T>` | Shared mutable data, write-heavy |
| `RwLock<T>` | Shared data, read-heavy |
| `Arc<T>` | Shared ownership across threads |
| Channels | Communication between threads |

> [!TIP]
> `Arc<Mutex<T>>` is the most common pattern for shared mutable state across threads. Keep the lock held for the shortest time possible.
