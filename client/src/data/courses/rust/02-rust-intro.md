---
title: Rust Introduction
---

# Rust Introduction

Rust is a compiled, statically-typed systems programming language designed for performance and safety, particularly safe concurrency.

---

## What is Rust?

Rust was originally developed by Graydon Hoare at Mozilla Research, with its first stable release (1.0) in **May 2015**. It is now maintained by the independent **Rust Foundation**.

Key characteristics of Rust:

- **Compiled** — Rust code is compiled directly to machine code using the LLVM backend, producing fast executables.
- **Statically Typed** — Every variable has a known type at compile time. The compiler infers types when possible.
- **No Garbage Collector** — Memory is managed through the ownership system, checked at compile time.
- **Expression-Based** — Almost everything in Rust is an expression that returns a value.

---

## What Can Rust Do?

Rust is used across a wide range of domains:

- **Systems Programming** — Operating systems, device drivers, embedded systems.
- **Web Development** — Backend services with frameworks like Actix Web, Axum, and Rocket.
- **WebAssembly** — Compile Rust to Wasm for high-performance browser applications.
- **Command-Line Tools** — Fast, reliable CLI applications (ripgrep, bat, exa).
- **Game Development** — Game engines and real-time simulations (Bevy, Amethyst).
- **Networking** — Async networking with Tokio and other runtimes.
- **Blockchain & Cryptography** — Used by Solana, Polkadot, and many crypto projects.

---

## Rust vs Other Languages

| Feature | Rust | C/C++ | Go | Python |
|---|---|---|---|---|
| Memory Safety | ✅ Compile-time | ❌ Manual | ✅ GC | ✅ GC |
| Performance | ⚡ Native | ⚡ Native | 🔶 Fast | 🐢 Slow |
| Concurrency | ✅ Fearless | ❌ Risky | ✅ Goroutines | 🔶 GIL |
| Learning Curve | 📈 Steep | 📈 Steep | 📉 Easy | 📉 Easy |
| Package Manager | ✅ Cargo | ❌ Varied | ✅ Go Modules | ✅ pip |

> [!TIP]
> Rust gives you C/C++ performance with memory safety guarantees that would otherwise require a garbage collector.

---

## Hello, World!

Here is the simplest Rust program:

```rust
fn main() {
    println!("Hello, World!");
}
```

- `fn main()` defines the entry point of the program.
- `println!` is a **macro** (note the `!`) that prints text to the console.
- Statements end with a semicolon `;`.

You will learn much more about Rust syntax in the upcoming chapters!
