---
title: Go Data Types
---

# Go Data Types

Go is statically typed — every value has a specific type. This lesson covers all of Go's built-in types.

---

## Basic Types Overview

| Category | Types |
|----------|-------|
| Boolean | `bool` |
| Integer | `int`, `int8`, `int16`, `int32`, `int64` |
| Unsigned Integer | `uint`, `uint8`, `uint16`, `uint32`, `uint64`, `uintptr` |
| Float | `float32`, `float64` |
| Complex | `complex64`, `complex128` |
| String | `string` |
| Byte & Rune | `byte` (alias for `uint8`), `rune` (alias for `int32`) |

---

## Boolean — `bool`

A boolean holds `true` or `false`:

```go
var isReady bool = true
loggedIn := false

fmt.Println(isReady)         // true
fmt.Println(!loggedIn)       // true
fmt.Println(isReady && loggedIn)  // false
```

---

## Integer Types

### Sized Integers

| Type | Size | Range |
|------|------|-------|
| `int8` | 8 bits | -128 to 127 |
| `int16` | 16 bits | -32,768 to 32,767 |
| `int32` | 32 bits | -2.1B to 2.1B |
| `int64` | 64 bits | ±9.2 quintillion |
| `uint8` | 8 bits | 0 to 255 |
| `uint16` | 16 bits | 0 to 65,535 |
| `uint32` | 32 bits | 0 to 4.2B |
| `uint64` | 64 bits | 0 to 18.4 quintillion |

### Platform-Dependent Integers

| Type | Size |
|------|------|
| `int` | 32 or 64 bits (matches platform) |
| `uint` | 32 or 64 bits (matches platform) |
| `uintptr` | Large enough to hold a pointer |

```go
var a int = 42
var b int64 = 9_000_000_000
var c uint8 = 255

fmt.Printf("a=%d, b=%d, c=%d\n", a, b, c)
```

> [!TIP]
> Use `int` as your default integer type. Only use sized types when you need a specific size (e.g., binary protocols, memory optimization).

---

## Floating-Point Types

| Type | Size | Precision |
|------|------|-----------|
| `float32` | 32 bits | ~7 decimal digits |
| `float64` | 64 bits | ~15 decimal digits |

```go
var pi float64 = 3.14159265358979
var rate float32 = 0.05

fmt.Printf("Pi: %.10f\n", pi)     // 3.1415926536
fmt.Printf("Rate: %.2f%%\n", rate*100)  // 5.00%
```

> [!NOTE]
> Use `float64` by default. `float32` is only needed for memory-constrained situations or compatibility with specific APIs.

---

## Complex Types

Go has built-in complex number support:

```go
var c1 complex128 = 3 + 4i
c2 := complex(5, 6)  // 5 + 6i

fmt.Println(c1 + c2)      // (8+10i)
fmt.Println(real(c1))      // 3
fmt.Println(imag(c1))      // 4
```

---

## Strings

Strings are **immutable** sequences of bytes (typically UTF-8 encoded):

```go
greeting := "Hello, World!"
multiline := `This is a
raw string literal.
It preserves \n literally.`

fmt.Println(greeting)
fmt.Println(len(greeting))       // 13 (bytes, not characters)
fmt.Println(greeting[0])         // 72 (byte value of 'H')
fmt.Println(string(greeting[0])) // H
```

Two kinds of string literals:

| Type | Syntax | Escapes |
|------|--------|---------|
| Interpreted | `"hello\n"` | `\n`, `\t`, `\\`, `\"` processed |
| Raw | `` `hello\n` `` | No escape processing, can span lines |

---

## Byte and Rune

```go
var b byte = 'A'     // byte is an alias for uint8
var r rune = '🚀'    // rune is an alias for int32

fmt.Printf("byte: %c (%d)\n", b, b)  // byte: A (65)
fmt.Printf("rune: %c (%d)\n", r, r)  // rune: 🚀 (128640)
```

- **`byte`** represents a single ASCII byte.
- **`rune`** represents a Unicode code point. Use `rune` when working with international text or emoji.

---

## Checking Types

Use `%T` with `Printf` to check a value's type:

```go
x := 42
y := 3.14
z := "hello"
w := true

fmt.Printf("%T\n", x)  // int
fmt.Printf("%T\n", y)  // float64
fmt.Printf("%T\n", z)  // string
fmt.Printf("%T\n", w)  // bool
```

---

## Numeric Literals

Go supports readable numeric literals:

```go
decimal := 1_000_000          // underscores for readability
hex     := 0xFF               // hexadecimal
octal   := 0o77               // octal
binary  := 0b1010_1100        // binary
sci     := 6.022e23           // scientific notation
```

---

## Complete Example

```go
package main

import "fmt"

func main() {
    // Integer types
    var age int = 25
    var bigNum int64 = 9_876_543_210

    // Float types
    var price float64 = 49.99
    var discount float32 = 0.15

    // Boolean
    var inStock bool = true

    // String
    name := "Go Programming"

    // Byte and Rune
    var initial byte = 'G'
    var emoji rune = '✅'

    fmt.Printf("Product: %s\n", name)
    fmt.Printf("Price: $%.2f (%.0f%% off)\n", price, float64(discount)*100)
    fmt.Printf("Age: %d, Big: %d\n", age, bigNum)
    fmt.Printf("In Stock: %t\n", inStock)
    fmt.Printf("Initial: %c, Emoji: %c\n", initial, emoji)
}
```

Output:

```
Product: Go Programming
Price: $49.99 (15% off)
Age: 25, Big: 9876543210
In Stock: true
Initial: G, Emoji: ✅
```

---

Next: type conversion between Go's types.
