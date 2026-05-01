---
title: Go Packages
---

# Go Packages

Packages organize Go code into reusable units. Every Go file belongs to a package, and every Go program starts from `package main`.

---

## Package Basics

```go
package main    // executable program
package utils   // library package
package models  // library package
```

Rules:
- All files in the same directory must have the **same package name**.
- The package name is the last element of the import path by convention.
- `package main` must contain a `func main()` — it's the entry point.

---

## Creating a Package

Project structure:

```
myproject/
├── go.mod
├── main.go
└── mathutil/
    └── mathutil.go
```

`mathutil/mathutil.go`:

```go
package mathutil

// Add returns the sum of two integers.
func Add(a, b int) int {
    return a + b
}

// Max returns the larger of two integers.
func Max(a, b int) int {
    if a > b {
        return a
    }
    return b
}

// helper is unexported — only usable within this package
func helper() {}
```

`main.go`:

```go
package main

import (
    "fmt"
    "myproject/mathutil"
)

func main() {
    fmt.Println(mathutil.Add(3, 5))  // 8
    fmt.Println(mathutil.Max(10, 7)) // 10
}
```

---

## Exported vs Unexported

- **Uppercase** first letter → exported (usable from other packages)
- **Lowercase** first letter → unexported (package-private)

```go
package user

type User struct {
    Name  string  // exported
    email string  // unexported — can't access from outside
}

func New(name, email string) User {
    return User{Name: name, email: email}
}
```

---

## The `init` Function

Each package can have one or more `init` functions that run automatically when the package is imported:

```go
package config

var DatabaseURL string

func init() {
    DatabaseURL = os.Getenv("DATABASE_URL")
    if DatabaseURL == "" {
        DatabaseURL = "localhost:5432"
    }
}
```

`init` runs:
1. After all package-level variables are initialized
2. Before `main()` starts
3. In dependency order (imported packages initialize first)

> [!NOTE]
> Use `init` sparingly — prefer explicit initialization functions for testability.

---

## The `internal` Package

Packages under an `internal/` directory can only be imported by code in the parent tree:

```
myproject/
├── cmd/
│   └── server/
│       └── main.go      # can import internal/
├── internal/
│   └── auth/
│       └── auth.go       # only accessible within myproject
└── pkg/
    └── api/
        └── api.go        # can be imported by anyone
```

---

## Blank Import

Import a package solely for its side effects (`init` functions):

```go
import (
    _ "image/png"              // registers PNG decoder
    _ "github.com/lib/pq"     // registers PostgreSQL driver
)
```

---

## Import Aliases

```go
import (
    "fmt"
    mymath "myproject/mathutil"  // alias
)

mymath.Add(1, 2)
```

---

## Standard Library Packages

Go has a rich standard library:

| Package | Purpose |
|---------|---------|
| `fmt` | Formatted I/O |
| `os` | OS interaction, files, env vars |
| `io` | I/O primitives |
| `strings` | String manipulation |
| `strconv` | String conversions |
| `math` | Math functions |
| `net/http` | HTTP client and server |
| `encoding/json` | JSON encode/decode |
| `testing` | Unit testing |
| `time` | Time and duration |
| `sync` | Concurrency primitives |
| `context` | Cancellation and deadlines |
| `log` | Simple logging |

---

## Complete Example

Project structure:

```
greetapp/
├── go.mod
├── main.go
└── greeter/
    └── greeter.go
```

`greeter/greeter.go`:

```go
package greeter

import "fmt"

// Formal returns a formal greeting.
func Formal(name string) string {
    return fmt.Sprintf("Good day, %s. How do you do?", name)
}

// Casual returns a casual greeting.
func Casual(name string) string {
    return fmt.Sprintf("Hey %s! What's up?", name)
}
```

`main.go`:

```go
package main

import (
    "fmt"
    "greetapp/greeter"
)

func main() {
    fmt.Println(greeter.Formal("Alice"))
    fmt.Println(greeter.Casual("Bob"))
}
```

---

Next: Go modules — dependency management for real projects.
