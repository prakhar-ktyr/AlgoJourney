---
title: Go Variables
---

# Go Variables

Variables store data that your program uses. Go is **statically typed** — every variable has a fixed type determined at compile time.

---

## Declaring Variables with `var`

```go
var name string = "Alice"
var age int = 30
var isActive bool = true
```

You can omit the type when an initial value is provided — Go **infers** it:

```go
var name = "Alice"     // inferred as string
var age = 30           // inferred as int
var rate = 3.14        // inferred as float64
```

You can also declare without initializing. The variable gets its **zero value**:

```go
var name string   // ""
var count int     // 0
var rate float64  // 0.0
var active bool   // false
```

---

## Short Declaration with `:=`

Inside functions, use `:=` for short, concise declarations:

```go
func main() {
    name := "Alice"
    age := 30
    height := 5.7
    fmt.Println(name, age, height)
}
```

> [!IMPORTANT]
> `:=` can only be used **inside functions**. At the package level, you must use `var`.

---

## Multiple Variable Declaration

Declare several variables at once:

```go
// With var
var x, y, z int = 1, 2, 3

// With short declaration
a, b, c := "hello", 42, true

// Block declaration (good for package-level variables)
var (
    host     = "localhost"
    port     = 8080
    maxConns = 100
)
```

---

## Zero Values

In Go, every variable is automatically initialized to its **zero value** if you don't provide one:

| Type | Zero Value |
|------|-----------|
| `int`, `float64` | `0` |
| `string` | `""` (empty string) |
| `bool` | `false` |
| Pointers, slices, maps, channels, functions, interfaces | `nil` |

```go
var i int       // 0
var f float64   // 0
var s string    // ""
var b bool      // false
```

> [!NOTE]
> Go has no concept of "uninitialized" variables. This eliminates an entire class of bugs.

---

## Constants

Constants are declared with `const` and cannot be changed:

```go
const Pi = 3.14159
const AppName = "MyApp"
const MaxRetries = 5
```

Block syntax:

```go
const (
    StatusOK    = 200
    StatusError = 500
    Version     = "1.0.0"
)
```

Constants can be **untyped** — they have higher precision and adapt to context:

```go
const x = 1_000_000_000_000   // untyped, works with any numeric type
var a int64 = x                 // fine
var b float64 = x               // also fine
```

---

## `iota` — The Constant Generator

`iota` auto-increments within a `const` block, starting at 0:

```go
const (
    Sunday    = iota   // 0
    Monday             // 1
    Tuesday            // 2
    Wednesday          // 3
    Thursday           // 4
    Friday             // 5
    Saturday           // 6
)
```

You can use expressions with `iota`:

```go
const (
    _  = iota             // skip 0
    KB = 1 << (10 * iota) // 1024
    MB                    // 1048576
    GB                    // 1073741824
)
```

---

## Reassignment vs Redeclaration

```go
x := 10    // declare and assign
x = 20     // reassign (no colon)

// x := 30  // ❌ Error: x already declared in this scope
```

However, `:=` can be used if **at least one** variable on the left is new:

```go
x := 10
x, y := 20, 30   // ✅ y is new, x is reassigned
```

---

## Variable Scope

Variables are scoped to the block they're declared in:

```go
func main() {
    x := 10

    if true {
        y := 20
        fmt.Println(x, y) // ✅ both accessible
    }

    // fmt.Println(y) // ❌ y is not accessible here
}
```

---

## Blank Identifier `_`

Use `_` to discard values you don't need:

```go
value, _ := strconv.Atoi("42")  // discard the error
```

> [!TIP]
> The blank identifier is common in Go when a function returns multiple values and you only need some of them.

---

## Complete Example

```go
package main

import "fmt"

const AppVersion = "2.1.0"

var (
    defaultHost = "localhost"
    defaultPort = 8080
)

func main() {
    name := "Server"
    requests := 0
    isRunning := true

    fmt.Printf("%s v%s\n", name, AppVersion)
    fmt.Printf("Listening on %s:%d\n", defaultHost, defaultPort)
    fmt.Printf("Running: %t, Requests: %d\n", isRunning, requests)
}
```

Output:

```
Server v2.1.0
Listening on localhost:8080
Running: true, Requests: 0
```

---

Next: Go's data types in detail.
