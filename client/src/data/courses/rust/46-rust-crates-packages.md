---
title: Rust Crates and Packages
---

# Rust Crates and Packages

Rust organizes code into **crates** (compilation units) and **packages** (one or more crates managed by Cargo).

---

## What is a Crate?

A crate is the smallest unit of compilation. There are two types:

| Type | Description | Entry Point |
|---|---|---|
| **Binary crate** | Produces an executable | `src/main.rs` |
| **Library crate** | Produces a library | `src/lib.rs` |

---

## What is a Package?

A package is a bundle of one or more crates, defined by `Cargo.toml`:

```toml
[package]
name = "my_project"
version = "0.1.0"
edition = "2021"

[dependencies]
```

A package can contain:
- **At most one** library crate (`src/lib.rs`)
- **Any number** of binary crates (`src/main.rs` + `src/bin/*.rs`)

---

## Package Structure

```
my_project/
├── Cargo.toml
├── Cargo.lock
├── src/
│   ├── main.rs       # default binary crate
│   ├── lib.rs         # library crate (optional)
│   └── bin/
│       ├── tool1.rs   # additional binary
│       └── tool2.rs   # additional binary
├── tests/             # integration tests
├── benches/           # benchmarks
└── examples/          # example programs
```

---

## Adding Dependencies

Add external crates via `Cargo.toml`:

```toml
[dependencies]
serde = "1.0"
serde_json = "1.0"
rand = "0.8"
```

Or use `cargo add`:

```bash
cargo add serde --features derive
cargo add rand
```

Then use them in your code:

```rust
use rand::Rng;

fn main() {
    let mut rng = rand::thread_rng();
    let n: u32 = rng.gen_range(1..=100);
    println!("Random number: {}", n);
}
```

---

## crates.io

[crates.io](https://crates.io) is Rust's official package registry. Popular crates:

| Crate | Purpose |
|---|---|
| `serde` | Serialization/deserialization |
| `tokio` | Async runtime |
| `clap` | CLI argument parsing |
| `reqwest` | HTTP client |
| `rand` | Random numbers |
| `regex` | Regular expressions |

---

## Using Items from the Standard Library

The standard library (`std`) is always available:

```rust
use std::collections::HashMap;
use std::fs;
use std::io::{self, Read};

fn main() {
    let mut map = HashMap::new();
    map.insert("key", "value");
    println!("{:?}", map);
}
```

> [!TIP]
> Use `cargo doc --open` to generate and browse documentation for your project and all its dependencies locally.
