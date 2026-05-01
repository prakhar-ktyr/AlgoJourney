---
title: Rust Message Passing
---

# Rust Message Passing

Channels allow threads to communicate by sending messages. Rust's standard library provides `mpsc` (multiple producer, single consumer) channels.

---

## Basic Channel

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        tx.send("Hello from thread!").unwrap();
    });

    let message = rx.recv().unwrap();
    println!("Received: {}", message);
}
```

- `tx` — transmitter (sender)
- `rx` — receiver
- `send()` — sends a value (moves ownership)
- `recv()` — blocks until a message arrives

---

## Sending Multiple Messages

```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let messages = vec!["hello", "from", "the", "thread"];
        for msg in messages {
            tx.send(msg).unwrap();
            thread::sleep(Duration::from_millis(200));
        }
    });

    // Iterate over received messages
    for received in rx {
        println!("Got: {}", received);
    }
}
```

---

## Multiple Producers

Clone the transmitter for multiple sending threads:

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    for id in 0..3 {
        let tx_clone = tx.clone();
        thread::spawn(move || {
            let msg = format!("Message from thread {}", id);
            tx_clone.send(msg).unwrap();
        });
    }

    drop(tx); // drop original sender

    for received in rx {
        println!("{}", received);
    }
}
```

> [!NOTE]
> The channel closes when all senders are dropped. That's why we `drop(tx)` — without it, the `for` loop on `rx` would wait forever.

---

## Non-Blocking Receive

```rust
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();
    tx.send(42).unwrap();

    // try_recv doesn't block
    match rx.try_recv() {
        Ok(val) => println!("Got: {}", val),
        Err(_) => println!("No message yet"),
    }
}
```

---

## Typed Channels

Channels are typed — you can only send one type of message:

```rust
use std::sync::mpsc;
use std::thread;

enum Command {
    Process(String),
    Quit,
}

fn main() {
    let (tx, rx) = mpsc::channel();

    let worker = thread::spawn(move || {
        loop {
            match rx.recv().unwrap() {
                Command::Process(data) => println!("Processing: {}", data),
                Command::Quit => {
                    println!("Worker shutting down");
                    break;
                }
            }
        }
    });

    tx.send(Command::Process("task 1".into())).unwrap();
    tx.send(Command::Process("task 2".into())).unwrap();
    tx.send(Command::Quit).unwrap();

    worker.join().unwrap();
}
```

> [!TIP]
> Message passing follows the Go proverb: "Don't communicate by sharing memory; share memory by communicating." It's the safest concurrency model in Rust.
