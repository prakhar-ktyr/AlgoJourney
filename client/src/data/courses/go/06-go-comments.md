---
title: Go Comments
---

# Go Comments

Comments explain your code to other developers (and to future you). Go supports two styles of comments.

---

## Single-Line Comments

Use `//` for single-line comments:

```go
package main

import "fmt"

func main() {
    // This prints a greeting
    fmt.Println("Hello!")

    fmt.Println("Go is fast") // inline comment
}
```

Everything after `//` until the end of the line is ignored by the compiler.

---

## Multi-Line Comments

Use `/* */` for comments that span multiple lines:

```go
/*
   This program demonstrates
   multi-line comments in Go.
   It prints two numbers.
*/
package main

import "fmt"

func main() {
    fmt.Println(1)
    fmt.Println(2)
}
```

> [!NOTE]
> Multi-line comments cannot be nested. `/* /* inner */ */` is a syntax error.

---

## Using Comments to Disable Code

Comments are handy for temporarily disabling code during debugging:

```go
func main() {
    fmt.Println("This runs")
    // fmt.Println("This is disabled")

    /*
    fmt.Println("This is also")
    fmt.Println("disabled")
    */
}
```

---

## Doc Comments (Godoc)

Go has a built-in documentation system called **Godoc**. Any comment that immediately precedes a top-level declaration becomes its documentation:

```go
// Add returns the sum of two integers.
// It does not check for overflow.
func Add(a, b int) int {
    return a + b
}

// Pi is the ratio of a circle's circumference to its diameter.
const Pi = 3.14159265
```

Godoc conventions:

- Start with the **name** of the thing being documented: `// Add returns...`
- Use complete sentences.
- Leave **no blank line** between the comment and the declaration.
- Only exported names (uppercase) appear in generated docs.

View docs with:

```bash
go doc fmt.Println
go doc -all fmt
```

> [!TIP]
> Write doc comments for every exported function, type, and constant. Tools like `pkg.go.dev` render them automatically.

---

## Package Comments

Each package should have a comment that describes what it does. Place it before the `package` declaration in any one file (often `doc.go`):

```go
// Package mathutil provides helper functions for
// common mathematical operations not found in the
// standard math package.
package mathutil
```

---

## Comment Best Practices

| Do | Don't |
|----|-------|
| Explain **why**, not **what** | Restate the code in English |
| Use doc comments for exports | Leave exported names undocumented |
| Keep comments up to date | Let comments become stale |
| Use `//` for most comments | Overuse `/* */` blocks |

```go
// ❌ Bad — restates the code
// increment x by 1
x++

// ✅ Good — explains the reason
// Retry count starts at 1 because the first attempt is not a retry.
x++
```

---

## Complete Example

```go
// Package main demonstrates Go comment styles.
package main

import "fmt"

// MaxRetries is the upper limit for connection attempts.
const MaxRetries = 5

// Connect attempts to establish a connection.
// It returns an error if all retries are exhausted.
func Connect(address string) error {
    for i := 0; i < MaxRetries; i++ {
        // TODO: implement actual connection logic
        fmt.Printf("Attempt %d to %s\n", i+1, address)
    }
    return nil
}

func main() {
    Connect("localhost:8080")
}
```

---

Next, we'll learn how to declare and use variables in Go.
