---
title: Rust Serde and JSON
---

# Rust Serde and JSON

Serde is Rust's most popular serialization framework. Combined with `serde_json`, it makes working with JSON effortless.

---

## Setup

Add to `Cargo.toml`:

```toml
[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

---

## Serialize (Struct → JSON)

```rust
use serde::Serialize;

#[derive(Serialize)]
struct User {
    name: String,
    age: u32,
    email: String,
}

fn main() {
    let user = User {
        name: String::from("Alice"),
        age: 30,
        email: String::from("alice@example.com"),
    };

    let json = serde_json::to_string(&user).unwrap();
    println!("{}", json);
    // {"name":"Alice","age":30,"email":"alice@example.com"}

    // Pretty print
    let pretty = serde_json::to_string_pretty(&user).unwrap();
    println!("{}", pretty);
}
```

---

## Deserialize (JSON → Struct)

```rust
use serde::Deserialize;

#[derive(Deserialize, Debug)]
struct User {
    name: String,
    age: u32,
    email: String,
}

fn main() {
    let json = r#"
    {
        "name": "Bob",
        "age": 25,
        "email": "bob@example.com"
    }
    "#;

    let user: User = serde_json::from_str(json).unwrap();
    println!("{:?}", user);
    println!("Name: {}", user.name);
}
```

---

## Working with Dynamic JSON

Use `serde_json::Value` for unstructured JSON:

```rust
use serde_json::{json, Value};

fn main() {
    // Create JSON dynamically
    let data = json!({
        "name": "Alice",
        "age": 30,
        "hobbies": ["reading", "coding"]
    });

    println!("{}", data["name"]);     // "Alice"
    println!("{}", data["hobbies"][0]); // "reading"

    // Parse unknown JSON
    let raw = r#"{"key": "value", "count": 42}"#;
    let parsed: Value = serde_json::from_str(raw).unwrap();

    if let Some(key) = parsed.get("key") {
        println!("Key: {}", key);
    }
}
```

---

## Serde Attributes

Customize serialization with attributes:

```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct Config {
    #[serde(rename = "serverName")]
    server_name: String,

    #[serde(default)]
    port: u16,

    #[serde(skip_serializing_if = "Option::is_none")]
    description: Option<String>,
}

fn main() {
    let json = r#"{"serverName": "api-1"}"#;
    let config: Config = serde_json::from_str(json).unwrap();

    println!("{:?}", config);
    // Config { server_name: "api-1", port: 0, description: None }
}
```

---

## Enums with Serde

```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
enum Message {
    #[serde(rename = "text")]
    Text { content: String },
    #[serde(rename = "image")]
    Image { url: String, width: u32 },
}

fn main() {
    let msg = Message::Text {
        content: String::from("Hello!"),
    };

    let json = serde_json::to_string(&msg).unwrap();
    println!("{}", json);
    // {"type":"text","content":"Hello!"}
}
```

> [!TIP]
> Serde supports many formats beyond JSON: TOML, YAML, MessagePack, CSV, and more. Just swap `serde_json` for the appropriate crate — your `#[derive(Serialize, Deserialize)]` annotations stay the same.
