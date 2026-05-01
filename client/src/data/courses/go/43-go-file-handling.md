---
title: Go File Handling
---

# Go File Handling

Go's `os`, `io`, and `bufio` packages provide everything you need for file operations.

---

## Reading a File

### Read Entire File

```go
data, err := os.ReadFile("config.txt")
if err != nil {
    log.Fatal(err)
}
fmt.Println(string(data))
```

### Read Line by Line

```go
f, err := os.Open("data.txt")
if err != nil {
    log.Fatal(err)
}
defer f.Close()

scanner := bufio.NewScanner(f)
for scanner.Scan() {
    fmt.Println(scanner.Text())
}

if err := scanner.Err(); err != nil {
    log.Fatal(err)
}
```

---

## Writing to a File

### Write Entire File

```go
data := []byte("Hello, Go!\n")
err := os.WriteFile("output.txt", data, 0644)
if err != nil {
    log.Fatal(err)
}
```

### Write with More Control

```go
f, err := os.Create("output.txt")
if err != nil {
    log.Fatal(err)
}
defer f.Close()

fmt.Fprintln(f, "Line 1")
fmt.Fprintln(f, "Line 2")
f.WriteString("Line 3\n")
```

---

## Appending to a File

```go
f, err := os.OpenFile("log.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
if err != nil {
    log.Fatal(err)
}
defer f.Close()

fmt.Fprintln(f, "New log entry")
```

---

## File Flags

| Flag | Meaning |
|------|---------|
| `os.O_RDONLY` | Read only |
| `os.O_WRONLY` | Write only |
| `os.O_RDWR` | Read and write |
| `os.O_CREATE` | Create if not exists |
| `os.O_APPEND` | Append to end |
| `os.O_TRUNC` | Truncate on open |

---

## Buffered Writing

```go
f, _ := os.Create("large.txt")
defer f.Close()

w := bufio.NewWriter(f)
for i := 0; i < 10000; i++ {
    fmt.Fprintf(w, "Line %d\n", i)
}
w.Flush()  // don't forget to flush!
```

> [!IMPORTANT]
> Always call `Flush()` on a buffered writer before closing the file, or data may be lost.

---

## Checking if a File Exists

```go
if _, err := os.Stat("config.txt"); errors.Is(err, os.ErrNotExist) {
    fmt.Println("File does not exist")
} else {
    fmt.Println("File exists")
}
```

---

## File Info

```go
info, err := os.Stat("main.go")
if err != nil {
    log.Fatal(err)
}

fmt.Println("Name:", info.Name())
fmt.Println("Size:", info.Size(), "bytes")
fmt.Println("Modified:", info.ModTime())
fmt.Println("Is Dir:", info.IsDir())
```

---

## Directories

```go
// Create a directory
os.Mkdir("data", 0755)
os.MkdirAll("data/logs/2024", 0755)  // nested

// Read directory contents
entries, _ := os.ReadDir(".")
for _, e := range entries {
    fmt.Printf("%-20s dir=%t\n", e.Name(), e.IsDir())
}

// Remove
os.Remove("file.txt")          // single file
os.RemoveAll("data/logs")      // recursive
```

---

## Copying Files

```go
func copyFile(src, dst string) error {
    in, err := os.Open(src)
    if err != nil {
        return err
    }
    defer in.Close()

    out, err := os.Create(dst)
    if err != nil {
        return err
    }
    defer out.Close()

    _, err = io.Copy(out, in)
    return err
}
```

---

## Complete Example

```go
package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

func main() {
    // Write a CSV file
    f, _ := os.Create("scores.csv")
    fmt.Fprintln(f, "name,score")
    fmt.Fprintln(f, "Alice,95")
    fmt.Fprintln(f, "Bob,87")
    fmt.Fprintln(f, "Carol,92")
    f.Close()

    // Read and process it
    file, _ := os.Open("scores.csv")
    defer file.Close()

    scanner := bufio.NewScanner(file)
    scanner.Scan() // skip header

    fmt.Println("Results:")
    for scanner.Scan() {
        parts := strings.Split(scanner.Text(), ",")
        fmt.Printf("  %s scored %s\n", parts[0], parts[1])
    }

    // Clean up
    os.Remove("scores.csv")
}
```

---

Next: working with JSON in Go.
