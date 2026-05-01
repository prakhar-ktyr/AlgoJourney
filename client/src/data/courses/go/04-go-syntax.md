---
title: Go Syntax
---

# Go Syntax

Go has a deliberately small and clean syntax. This lesson covers the structural rules every Go program follows.

---

## Basic Structure

Every Go program follows this structure:

```go
package main          // 1. Package declaration

import "fmt"          // 2. Import statements

func main() {         // 3. Functions
    fmt.Println("Go!")
}
```

---

## Package Declaration

Every Go file starts with `package`:

```go
package main
```

- `package main` defines an executable program. The `main` function is the entry point.
- Library packages use other names (e.g., `package math`, `package utils`).
- All files in the same directory must belong to the same package.

---

## Import Statements

```go
// Single import
import "fmt"

// Multiple imports (preferred style)
import (
    "fmt"
    "math"
    "strings"
)
```

- Only **used** packages can be imported — Go refuses to compile if you import something unused.
- Standard library packages use short names (`"fmt"`).
- Third-party packages use their full module path (`"github.com/gin-gonic/gin"`).

> [!NOTE]
> The `goimports` tool (and most editors) automatically add and remove imports for you.

---

## Functions

```go
func greet(name string) string {
    return "Hello, " + name
}
```

- Parameter types come **after** the name: `name string`, not `String name`.
- Return type comes after the parentheses.
- The opening brace `{` **must** be on the same line — putting it on the next line is a syntax error.

```go
// ✅ Correct
func main() {
}

// ❌ Compile error!
func main()
{
}
```

---

## Semicolons

Go uses semicolons to terminate statements, but you **never write them**. The compiler inserts them automatically. This is why the opening brace must be on the same line.

---

## Curly Braces

Braces are **required** for all control structures:

```go
// ✅ Correct
if x > 0 {
    fmt.Println("positive")
}

// ❌ Compile error — no braces
if x > 0
    fmt.Println("positive")
```

---

## Exported Names

Capitalization controls visibility:

- **Uppercase** first letter = **exported** (public)
- **Lowercase** first letter = **unexported** (private)

```go
fmt.Println()    // Println is exported from fmt
math.Pi          // Pi is exported from math
```

> [!IMPORTANT]
> There are no `public`/`private` keywords. Visibility is entirely determined by the first letter.

---

## Naming Conventions

| Convention | Example | Notes |
|-----------|---------|-------|
| camelCase for locals | `userName`, `maxRetries` | Never snake_case |
| PascalCase for exports | `ParseJSON`, `HTTPClient` | Uppercase = exported |
| Short names, short scopes | `i`, `n`, `err`, `ctx` | Idiomatic Go favors brevity |
| Acronyms stay uppercase | `HTTP`, `URL`, `ID` | Not `Http`, `Url`, `Id` |

---

## Formatting with `gofmt`

Go has one official style enforced by `gofmt`:

```bash
gofmt -w main.go      # format and overwrite
go fmt ./...           # format all files
```

> [!TIP]
> You never argue about code style in Go. Run `gofmt` and move on.

---

## Complete Example

```go
package main

import (
    "fmt"
    "strings"
)

func greet(name string) string {
    return "Hello, " + strings.ToUpper(name) + "!"
}

func main() {
    message := greet("world")
    fmt.Println(message)        // Hello, WORLD!
}
```

---

## Key Takeaways

- Every file: `package` → `import` → declarations.
- Opening braces on the same line — always.
- Unused imports are compile errors.
- Capitalization controls export visibility.
- Use `gofmt` — always.

Next: how Go handles output with the `fmt` package.
