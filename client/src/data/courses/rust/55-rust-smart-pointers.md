---
title: Rust Smart Pointers
---

# Rust Smart Pointers

Smart pointers are data structures that act like pointers but have additional metadata and capabilities. They manage memory through ownership rules.

---

## Box — Heap Allocation

`Box<T>` allocates data on the heap:

```rust
fn main() {
    let b = Box::new(5);
    println!("b = {}", b);

    // Useful for recursive types
    // Without Box, this would have infinite size
}

#[derive(Debug)]
enum List {
    Cons(i32, Box<List>),
    Nil,
}

fn main() {
    use List::{Cons, Nil};

    let list = Cons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));
    println!("{:?}", list);
}
```

---

## Rc — Reference Counting

`Rc<T>` enables multiple ownership (single-threaded):

```rust
use std::rc::Rc;

fn main() {
    let a = Rc::new(String::from("shared data"));
    let b = Rc::clone(&a);
    let c = Rc::clone(&a);

    println!("a: {}", a);
    println!("b: {}", b);
    println!("Reference count: {}", Rc::strong_count(&a)); // 3
}
```

> [!NOTE]
> `Rc<T>` is **not** thread-safe. For multi-threaded scenarios, use `Arc<T>` (Atomic Reference Counting).

---

## RefCell — Interior Mutability

`RefCell<T>` enforces borrowing rules at **runtime** instead of compile time:

```rust
use std::cell::RefCell;

fn main() {
    let data = RefCell::new(vec![1, 2, 3]);

    // Borrow mutably at runtime
    data.borrow_mut().push(4);

    // Borrow immutably
    println!("{:?}", data.borrow());
}
```

---

## Combining Rc and RefCell

```rust
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug)]
struct Node {
    value: i32,
    children: RefCell<Vec<Rc<Node>>>,
}

fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        children: RefCell::new(vec![]),
    });

    let branch = Rc::new(Node {
        value: 5,
        children: RefCell::new(vec![Rc::clone(&leaf)]),
    });

    println!("Branch: {:?}", branch);
    println!("Leaf refs: {}", Rc::strong_count(&leaf)); // 2
}
```

---

## Cow — Clone on Write

`Cow<T>` avoids unnecessary cloning:

```rust
use std::borrow::Cow;

fn process(input: &str) -> Cow<str> {
    if input.contains("bad") {
        Cow::Owned(input.replace("bad", "good"))
    } else {
        Cow::Borrowed(input) // no allocation needed
    }
}

fn main() {
    let a = process("this is fine");    // borrowed
    let b = process("this is bad");     // owned (new allocation)
    println!("{}", a);
    println!("{}", b);
}
```

---

## Summary

| Pointer | Ownership | Thread-Safe | Mutability |
|---|---|---|---|
| `Box<T>` | Single | Yes | Through owner |
| `Rc<T>` | Shared | No | Immutable |
| `Arc<T>` | Shared | Yes | Immutable |
| `RefCell<T>` | Single | No | Runtime-checked |
| `Mutex<T>` | Shared | Yes | Lock-based |

> [!TIP]
> Start with regular references (`&T`, `&mut T`). Only reach for smart pointers when you need heap allocation (`Box`), shared ownership (`Rc`/`Arc`), or interior mutability (`RefCell`/`Mutex`).
