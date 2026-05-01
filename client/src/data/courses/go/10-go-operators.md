---
title: Go Operators
---

# Go Operators

Operators perform operations on values and variables. Go supports arithmetic, comparison, logical, bitwise, and assignment operators.

---

## Arithmetic Operators

| Operator | Name | Example | Result |
|----------|------|---------|--------|
| `+` | Addition | `5 + 3` | `8` |
| `-` | Subtraction | `5 - 3` | `2` |
| `*` | Multiplication | `5 * 3` | `15` |
| `/` | Division | `7 / 2` | `3` (integer division) |
| `%` | Modulus (remainder) | `7 % 2` | `1` |

```go
a, b := 17, 5

fmt.Println(a + b)   // 22
fmt.Println(a - b)   // 12
fmt.Println(a * b)   // 85
fmt.Println(a / b)   // 3  (integer division truncates)
fmt.Println(a % b)   // 2
```

> [!NOTE]
> Integer division **truncates** — `7 / 2` is `3`, not `3.5`. For decimal results, use `float64`:
> ```go
> result := float64(7) / float64(2) // 3.5
> ```

---

## Increment and Decrement

Go has `++` and `--` but they are **statements**, not expressions:

```go
x := 5
x++           // x is now 6
x--           // x is now 5

// y := x++   // ❌ Compile error — not an expression
// ++x        // ❌ No prefix increment in Go
```

---

## Comparison Operators

| Operator | Name | Example | Result |
|----------|------|---------|--------|
| `==` | Equal | `5 == 5` | `true` |
| `!=` | Not equal | `5 != 3` | `true` |
| `<` | Less than | `3 < 5` | `true` |
| `>` | Greater than | `5 > 3` | `true` |
| `<=` | Less or equal | `5 <= 5` | `true` |
| `>=` | Greater or equal | `3 >= 5` | `false` |

```go
x, y := 10, 20

fmt.Println(x == y)   // false
fmt.Println(x != y)   // true
fmt.Println(x < y)    // true
fmt.Println(x >= 10)  // true
```

Comparison operators return a `bool` value.

---

## Logical Operators

| Operator | Name | Description |
|----------|------|-------------|
| `&&` | AND | True if **both** are true |
| `\|\|` | OR | True if **either** is true |
| `!` | NOT | Inverts the boolean |

```go
a, b := true, false

fmt.Println(a && b)   // false
fmt.Println(a || b)   // true
fmt.Println(!a)       // false
fmt.Println(!b)       // true
```

Short-circuit evaluation applies — Go stops evaluating as soon as the result is determined:

```go
// isValid() is only called if x > 0
if x > 0 && isValid() {
    // ...
}
```

---

## Assignment Operators

| Operator | Example | Same As |
|----------|---------|---------|
| `=` | `x = 5` | `x = 5` |
| `+=` | `x += 3` | `x = x + 3` |
| `-=` | `x -= 3` | `x = x - 3` |
| `*=` | `x *= 3` | `x = x * 3` |
| `/=` | `x /= 3` | `x = x / 3` |
| `%=` | `x %= 3` | `x = x % 3` |
| `&=` | `x &= 3` | `x = x & 3` |
| `\|=` | `x \|= 3` | `x = x \| 3` |
| `^=` | `x ^= 3` | `x = x ^ 3` |
| `<<=` | `x <<= 2` | `x = x << 2` |
| `>>=` | `x >>= 2` | `x = x >> 2` |

```go
x := 10
x += 5    // 15
x -= 3    // 12
x *= 2    // 24
x /= 4   // 6
x %= 4   // 2
```

---

## Bitwise Operators

| Operator | Name | Description |
|----------|------|-------------|
| `&` | AND | Both bits must be 1 |
| `\|` | OR | At least one bit is 1 |
| `^` | XOR | Exactly one bit is 1 |
| `&^` | AND NOT (bit clear) | Clear bits |
| `<<` | Left shift | Shift bits left |
| `>>` | Right shift | Shift bits right |

```go
a, b := 0b1100, 0b1010  // 12, 10

fmt.Printf("AND:   %04b\n", a&b)    // 1000
fmt.Printf("OR:    %04b\n", a|b)    // 1110
fmt.Printf("XOR:   %04b\n", a^b)    // 0110
fmt.Printf("CLEAR: %04b\n", a&^b)   // 0100

// Bit shifting
x := 1
fmt.Println(x << 3)   // 8  (1 shifted left by 3)
fmt.Println(16 >> 2)   // 4  (16 shifted right by 2)
```

> [!TIP]
> `&^` (AND NOT) is unique to Go — it clears bits. `a &^ b` is equivalent to `a & (^b)`.

---

## Operator Precedence

From highest to lowest:

| Priority | Operators |
|----------|-----------|
| 5 (highest) | `*`, `/`, `%`, `<<`, `>>`, `&`, `&^` |
| 4 | `+`, `-`, `\|`, `^` |
| 3 | `==`, `!=`, `<`, `<=`, `>`, `>=` |
| 2 | `&&` |
| 1 (lowest) | `\|\|` |

Use parentheses to make intent clear:

```go
result := (a + b) * c    // clear
result := a + b * c      // b*c first, then + a
```

---

## String Concatenation with `+`

The `+` operator also concatenates strings:

```go
first := "Hello"
last := "World"
full := first + ", " + last + "!"
fmt.Println(full)   // Hello, World!
```

---

## Complete Example

```go
package main

import "fmt"

func main() {
    // Arithmetic
    price := 29.99
    quantity := 3
    total := price * float64(quantity)
    tax := total * 0.08
    fmt.Printf("Subtotal: $%.2f\n", total)
    fmt.Printf("Tax:      $%.2f\n", tax)
    fmt.Printf("Total:    $%.2f\n", total+tax)

    // Comparison + Logical
    age := 25
    hasID := true
    canEnter := age >= 18 && hasID
    fmt.Printf("\nAge: %d, Has ID: %t\n", age, hasID)
    fmt.Printf("Can enter: %t\n", canEnter)

    // Bitwise — permissions example
    const (
        Read    = 1 << iota // 1
        Write               // 2
        Execute              // 4
    )
    perms := Read | Write    // 3
    fmt.Printf("\nPermissions: %03b\n", perms)
    fmt.Printf("Can read:    %t\n", perms&Read != 0)
    fmt.Printf("Can execute: %t\n", perms&Execute != 0)
}
```

Output:

```
Subtotal: $89.97
Tax:      $7.20
Total:    $97.17

Age: 25, Has ID: true
Can enter: true

Permissions: 011
Can read:    true
Can execute: false
```

---

Next: control flow with if/else.
