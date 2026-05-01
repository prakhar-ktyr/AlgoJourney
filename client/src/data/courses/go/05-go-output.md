---
title: Go Output
---

# Go Output

The `fmt` package is Go's primary tool for formatted output. This lesson covers every way to print text in Go.

---

## `fmt.Println` — Print with Newline

The most common way to print:

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    fmt.Println("Go is", "awesome")
    fmt.Println(42)
    fmt.Println(3.14, true)
}
```

Output:

```
Hello, World!
Go is awesome
42
3.14 true
```

`Println` adds a **newline** at the end and puts **spaces** between arguments.

---

## `fmt.Print` — Print without Newline

```go
fmt.Print("Hello, ")
fmt.Print("World!")
fmt.Print("\n")
```

Output:

```
Hello, World!
```

`Print` does **not** add a newline. It only adds spaces between arguments when neither is a string.

---

## `fmt.Printf` — Formatted Output

`Printf` uses **format verbs** (placeholders) to control output:

```go
name := "Alice"
age := 30
height := 5.7

fmt.Printf("Name: %s\n", name)
fmt.Printf("Age: %d\n", age)
fmt.Printf("Height: %.1f ft\n", height)
fmt.Printf("%s is %d years old\n", name, age)
```

Output:

```
Name: Alice
Age: 30
Height: 5.7 ft
Alice is 30 years old
```

---

## Common Format Verbs

| Verb | Description | Example |
|------|------------|---------|
| `%s` | String | `fmt.Printf("%s", "Go")` → `Go` |
| `%d` | Integer (decimal) | `fmt.Printf("%d", 42)` → `42` |
| `%f` | Float | `fmt.Printf("%f", 3.14)` → `3.140000` |
| `%.2f` | Float with precision | `fmt.Printf("%.2f", 3.14)` → `3.14` |
| `%t` | Boolean | `fmt.Printf("%t", true)` → `true` |
| `%v` | Default format (any type) | `fmt.Printf("%v", 42)` → `42` |
| `%+v` | Struct with field names | Shows field names in structs |
| `%#v` | Go-syntax representation | `fmt.Printf("%#v", "hi")` → `"hi"` |
| `%T` | Type of the value | `fmt.Printf("%T", 42)` → `int` |
| `%p` | Pointer address | Shows memory address |
| `%b` | Binary | `fmt.Printf("%b", 10)` → `1010` |
| `%o` | Octal | `fmt.Printf("%o", 10)` → `12` |
| `%x` | Hexadecimal (lowercase) | `fmt.Printf("%x", 255)` → `ff` |
| `%X` | Hexadecimal (uppercase) | `fmt.Printf("%X", 255)` → `FF` |
| `%c` | Character (rune) | `fmt.Printf("%c", 65)` → `A` |
| `%%` | Literal percent sign | `fmt.Printf("100%%")` → `100%` |

---

## The `%v` Verb — The Universal Formatter

`%v` prints any value in its default format. It's your go-to when you don't know or care about the specific type:

```go
fmt.Printf("%v\n", 42)          // 42
fmt.Printf("%v\n", 3.14)        // 3.14
fmt.Printf("%v\n", "hello")     // hello
fmt.Printf("%v\n", true)        // true
fmt.Printf("%v\n", []int{1,2})  // [1 2]
```

---

## Width and Padding

Control alignment with width specifiers:

```go
// Right-align in a field of width 10
fmt.Printf("|%10s|\n", "Go")        // |        Go|

// Left-align with -
fmt.Printf("|%-10s|\n", "Go")       // |Go        |

// Pad numbers with zeros
fmt.Printf("|%06d|\n", 42)          // |000042|

// Float width and precision
fmt.Printf("|%10.2f|\n", 3.14159)   // |      3.14|
```

---

## `fmt.Sprintf` — Format to a String

`Sprintf` works like `Printf` but **returns** the string instead of printing it:

```go
name := "Alice"
age := 30

greeting := fmt.Sprintf("Hello, %s! You are %d.", name, age)
fmt.Println(greeting)    // Hello, Alice! You are 30.
```

This is extremely useful for building strings dynamically.

---

## `fmt.Fprintf` — Write to Any Writer

`Fprintf` writes to any `io.Writer`, not just stdout:

```go
import (
    "fmt"
    "os"
)

fmt.Fprintf(os.Stderr, "Error: %s\n", "something went wrong")
```

---

## Printing Multiple Values

```go
x, y, z := 1, 2, 3

// Println separates with spaces
fmt.Println(x, y, z)              // 1 2 3

// Printf gives you full control
fmt.Printf("%d + %d = %d\n", x, y, z)  // 1 + 2 = 3
```

---

## Printing Special Characters

```go
fmt.Println("Tab:\tindented")
fmt.Println("Newline:\nNext line")
fmt.Println("Quote: \"hello\"")
fmt.Println("Backslash: \\")
```

Output:

```
Tab:	indented
Newline:
Next line
Quote: "hello"
Backslash: \
```

---

## Complete Example

```go
package main

import "fmt"

func main() {
    product := "Widget"
    price := 19.99
    quantity := 150
    inStock := true

    fmt.Println("=== Inventory Report ===")
    fmt.Printf("Product:    %s\n", product)
    fmt.Printf("Price:      $%.2f\n", price)
    fmt.Printf("Quantity:   %d\n", quantity)
    fmt.Printf("In Stock:   %t\n", inStock)
    fmt.Printf("Total Value: $%.2f\n", price*float64(quantity))

    summary := fmt.Sprintf("%d units of %s @ $%.2f", quantity, product, price)
    fmt.Println("\nSummary:", summary)
}
```

Output:

```
=== Inventory Report ===
Product:    Widget
Price:      $19.99
Quantity:   150
In Stock:   true
Total Value: $2998.50

Summary: 150 units of Widget @ $19.99
```

---

## Key Takeaways

- `Println` — quick printing with newline and spaces between args.
- `Printf` — formatted output with verbs (`%s`, `%d`, `%f`, `%v`).
- `Sprintf` — same as `Printf` but returns a string.
- `%v` is the universal verb — works with any type.
- Always end `Printf` format strings with `\n` (it doesn't add one automatically).
