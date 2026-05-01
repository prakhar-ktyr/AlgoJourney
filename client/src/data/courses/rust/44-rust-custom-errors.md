---
title: Rust Custom Errors
---

# Rust Custom Errors

For robust applications, define your own error types that provide meaningful context about what went wrong.

---

## Simple Custom Error with Enum

```rust
use std::fmt;

#[derive(Debug)]
enum AppError {
    NotFound(String),
    PermissionDenied,
    ParseError(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AppError::NotFound(name) => write!(f, "'{}' not found", name),
            AppError::PermissionDenied => write!(f, "Permission denied"),
            AppError::ParseError(msg) => write!(f, "Parse error: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

fn find_user(id: u32) -> Result<String, AppError> {
    if id == 0 {
        Err(AppError::NotFound(String::from("user")))
    } else {
        Ok(format!("User_{}", id))
    }
}

fn main() {
    match find_user(0) {
        Ok(user) => println!("Found: {}", user),
        Err(e) => println!("Error: {}", e),
    }
}
```

---

## Converting from Other Errors

Implement `From` to convert standard errors into your custom type:

```rust
use std::fmt;
use std::io;
use std::num::ParseIntError;

#[derive(Debug)]
enum ConfigError {
    IoError(io::Error),
    ParseError(ParseIntError),
    MissingField(String),
}

impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ConfigError::IoError(e) => write!(f, "IO error: {}", e),
            ConfigError::ParseError(e) => write!(f, "Parse error: {}", e),
            ConfigError::MissingField(name) => write!(f, "Missing field: {}", name),
        }
    }
}

impl std::error::Error for ConfigError {}

impl From<io::Error> for ConfigError {
    fn from(e: io::Error) -> Self {
        ConfigError::IoError(e)
    }
}

impl From<ParseIntError> for ConfigError {
    fn from(e: ParseIntError) -> Self {
        ConfigError::ParseError(e)
    }
}

// Now ? automatically converts errors:
fn load_port() -> Result<u16, ConfigError> {
    let contents = std::fs::read_to_string("config.txt")?; // io::Error → ConfigError
    let port: u16 = contents.trim().parse()?;               // ParseIntError → ConfigError
    Ok(port)
}
```

---

## Error with Source (Cause Chain)

```rust
use std::fmt;

#[derive(Debug)]
struct DatabaseError {
    message: String,
    source: Option<Box<dyn std::error::Error>>,
}

impl fmt::Display for DatabaseError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Database error: {}", self.message)
    }
}

impl std::error::Error for DatabaseError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.source.as_deref()
    }
}
```

---

## Best Practices

| Scenario | Approach |
|---|---|
| Quick scripts / prototyping | `Box<dyn Error>` or `anyhow` |
| Libraries | Custom enum error types |
| Applications | `thiserror` or `anyhow` crate |
| Internal bugs | `panic!` / `unreachable!` |

> [!TIP]
> In real projects, consider the `thiserror` crate for deriving error types with less boilerplate, and `anyhow` for easy error handling in application code.
