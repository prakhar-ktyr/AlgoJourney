---
title: Rust Get Started
---

# Rust Get Started

To start writing Rust, you need to install the Rust toolchain on your computer.

---

## Installing Rust

The recommended way to install Rust is through **rustup**, the official Rust toolchain installer.

### On macOS / Linux

Open a terminal and run:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Follow the on-screen instructions. After installation, restart your terminal or run:

```bash
source $HOME/.cargo/env
```

### On Windows

Download and run the installer from [rustup.rs](https://rustup.rs). You may also need the **Visual Studio C++ Build Tools**.

---

## Verify Installation

After installing, verify everything is set up correctly:

```bash
rustc --version
# Example output: rustc 1.76.0 (07dca489a 2024-02-04)

cargo --version
# Example output: cargo 1.76.0 (c84b36747 2024-01-18)
```

The Rust toolchain includes:

- **rustc** — The Rust compiler.
- **cargo** — The build system and package manager.
- **rustup** — The toolchain version manager.

---

## Your First Rust Program

Create a new file called `main.rs` and add the following code:

```rust
fn main() {
    println!("Hello, World!");
}
```

Compile and run it from the terminal:

```bash
rustc main.rs
./main
```

**Output:**

```
Hello, World!
```

---

## Using Cargo (Recommended)

For real projects, use **Cargo** instead of calling `rustc` directly. Cargo handles building, dependencies, and much more.

Create a new project:

```bash
cargo new hello_rust
cd hello_rust
```

This creates a project structure:

```
hello_rust/
├── Cargo.toml
└── src/
    └── main.rs
```

- **Cargo.toml** — The project manifest (name, version, dependencies).
- **src/main.rs** — Your source code.

Build and run:

```bash
cargo run
```

**Output:**

```
Hello, World!
```

> [!TIP]
> Use `cargo run` during development — it compiles and runs in one step. Use `cargo build --release` for optimized production builds.

---

## IDE Support

Rust has excellent editor support. The most popular options are:

- **VS Code** with the **rust-analyzer** extension (recommended).
- **IntelliJ IDEA** with the **Rust plugin**.
- **Neovim / Helix** with LSP support via rust-analyzer.

The **rust-analyzer** language server provides autocompletion, inline type hints, error highlighting, and refactoring tools.
