---
title: Rust File I/O
---

# Rust File I/O

Rust provides file I/O operations through the `std::fs` and `std::io` modules.

---

## Reading Files

### Read Entire File to String

```rust
use std::fs;

fn main() {
    match fs::read_to_string("hello.txt") {
        Ok(contents) => println!("{}", contents),
        Err(e) => println!("Error: {}", e),
    }
}
```

### Read to Bytes

```rust
use std::fs;

fn main() {
    let bytes = fs::read("image.png").expect("Failed to read file");
    println!("File size: {} bytes", bytes.len());
}
```

### Read Line by Line

```rust
use std::fs::File;
use std::io::{self, BufRead, BufReader};

fn main() -> io::Result<()> {
    let file = File::open("data.txt")?;
    let reader = BufReader::new(file);

    for (i, line) in reader.lines().enumerate() {
        println!("{}: {}", i + 1, line?);
    }
    Ok(())
}
```

---

## Writing Files

### Write Entire Content

```rust
use std::fs;

fn main() {
    fs::write("output.txt", "Hello, Rust!\nSecond line.")
        .expect("Failed to write file");
    println!("File written!");
}
```

### Append to File

```rust
use std::fs::OpenOptions;
use std::io::Write;

fn main() {
    let mut file = OpenOptions::new()
        .append(true)
        .create(true)
        .open("log.txt")
        .expect("Failed to open file");

    writeln!(file, "Log entry: {}", "something happened")
        .expect("Failed to write");
}
```

---

## File Metadata

```rust
use std::fs;

fn main() {
    let metadata = fs::metadata("Cargo.toml").expect("Failed to read metadata");

    println!("Size: {} bytes", metadata.len());
    println!("Is file: {}", metadata.is_file());
    println!("Is dir: {}", metadata.is_dir());
    println!("Modified: {:?}", metadata.modified().unwrap());
}
```

---

## Working with Directories

```rust
use std::fs;

fn main() {
    // Create directory
    fs::create_dir_all("output/data").expect("Failed to create dir");

    // List directory contents
    let entries = fs::read_dir(".").expect("Failed to read dir");
    for entry in entries {
        let entry = entry.unwrap();
        let file_type = if entry.file_type().unwrap().is_dir() {
            "DIR"
        } else {
            "FILE"
        };
        println!("[{}] {}", file_type, entry.path().display());
    }

    // Remove directory
    // fs::remove_dir_all("output").expect("Failed to remove");
}
```

---

## Using Path and PathBuf

```rust
use std::path::{Path, PathBuf};

fn main() {
    let path = Path::new("/home/user/docs/file.txt");

    println!("File name: {:?}", path.file_name());
    println!("Extension: {:?}", path.extension());
    println!("Parent: {:?}", path.parent());
    println!("Exists: {}", path.exists());

    // Building paths
    let mut buf = PathBuf::from("/home/user");
    buf.push("documents");
    buf.push("notes.md");
    println!("Built path: {}", buf.display());
}
```

> [!TIP]
> Use `BufReader` and `BufWriter` for performance when reading or writing many small chunks. They batch I/O operations to reduce system calls.
