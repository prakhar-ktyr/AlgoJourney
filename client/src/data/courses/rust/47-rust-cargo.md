---
title: Rust Cargo
---

# Rust Cargo

Cargo is Rust's build system and package manager. It handles building code, downloading dependencies, and much more.

---

## Essential Cargo Commands

| Command | Description |
|---|---|
| `cargo new project_name` | Create a new project |
| `cargo build` | Compile the project |
| `cargo run` | Compile and run |
| `cargo test` | Run tests |
| `cargo check` | Check for errors (fast, no binary) |
| `cargo doc --open` | Generate and view docs |
| `cargo fmt` | Format code |
| `cargo clippy` | Run lints |
| `cargo update` | Update dependencies |
| `cargo build --release` | Optimized production build |

---

## Creating a Project

```bash
# New binary project
cargo new my_app
cd my_app

# New library project
cargo new my_lib --lib
```

---

## Cargo.toml Configuration

```toml
[package]
name = "my_app"
version = "0.1.0"
edition = "2021"
authors = ["Your Name <you@example.com>"]
description = "A cool Rust application"
license = "MIT"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1", features = ["full"] }

[dev-dependencies]
criterion = "0.5"    # only for tests and benchmarks

[build-dependencies]
cc = "1.0"           # only for build scripts

[[bin]]
name = "my_tool"
path = "src/bin/tool.rs"
```

---

## Build Profiles

```toml
# Development (fast compile, slow runtime)
# cargo build
[profile.dev]
opt-level = 0

# Release (slow compile, fast runtime)
# cargo build --release
[profile.release]
opt-level = 3
lto = true
```

---

## Workspaces

For multi-crate projects, use workspaces:

```toml
# Root Cargo.toml
[workspace]
members = [
    "core",
    "cli",
    "web",
]
```

```
my_workspace/
├── Cargo.toml          # workspace root
├── core/
│   ├── Cargo.toml
│   └── src/lib.rs
├── cli/
│   ├── Cargo.toml
│   └── src/main.rs
└── web/
    ├── Cargo.toml
    └── src/main.rs
```

---

## Useful Cargo Plugins

Install with `cargo install`:

```bash
cargo install cargo-watch   # auto-rebuild on file changes
cargo install cargo-edit    # add/remove deps from CLI
cargo install cargo-expand  # expand macros
```

Use them:

```bash
cargo watch -x run          # rebuild and run on changes
cargo add serde             # add dependency
cargo expand                # see expanded macro output
```

> [!TIP]
> Run `cargo clippy` regularly — it catches common mistakes and suggests more idiomatic Rust code. Run `cargo fmt` to auto-format your code to the community standard style.
