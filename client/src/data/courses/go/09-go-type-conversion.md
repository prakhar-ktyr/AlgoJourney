---
title: Go Type Conversion
---

# Go Type Conversion

Go has **no implicit type conversions**. You must explicitly convert between types. This prevents subtle bugs that plague languages with automatic coercion.

---

## Basic Type Conversion

The syntax is `T(value)` where `T` is the target type:

```go
var i int = 42
var f float64 = float64(i)   // int → float64
var u uint = uint(f)         // float64 → uint

fmt.Println(i, f, u)         // 42 42 42
```

---

## Integer Conversions

```go
var a int32 = 100
var b int64 = int64(a)   // smaller → larger (safe)
var c int16 = int16(b)   // larger → smaller (may truncate!)

fmt.Println(a, b, c)     // 100 100 100
```

> [!WARNING]
> Converting a larger integer type to a smaller one can **silently truncate** the value:
> ```go
> var big int64 = 300
> var small int8 = int8(big)
> fmt.Println(small) // 44 (truncated, not 300!)
> ```

---

## Float ↔ Integer

```go
// Float to int — truncates (does NOT round)
f := 3.99
i := int(f)
fmt.Println(i)   // 3

// Int to float
n := 7
r := float64(n) / 2.0
fmt.Println(r)   // 3.5
```

> [!NOTE]
> Float-to-int conversion **truncates toward zero**, it does not round. Use `math.Round()` if you need rounding.

---

## Why No Implicit Conversion?

In many languages, this works silently:

```python
# Python
x = 5 + 3.14  # int is implicitly promoted to float
```

In Go, this is a **compile error**:

```go
var x int = 5
var y float64 = 3.14
// z := x + y   // ❌ Error: mismatched types int and float64

z := float64(x) + y   // ✅ Explicit conversion
fmt.Println(z)         // 8.14
```

This strictness catches type-related bugs at compile time.

---

## String Conversions with `strconv`

The `strconv` package handles string ↔ number conversions:

### Number to String

```go
import "strconv"

s1 := strconv.Itoa(42)              // int → string: "42"
s2 := strconv.FormatFloat(3.14, 'f', 2, 64)  // float → string: "3.14"
s3 := strconv.FormatBool(true)       // bool → string: "true"
```

### String to Number

```go
i, err := strconv.Atoi("42")         // string → int
f, err := strconv.ParseFloat("3.14", 64)  // string → float64
b, err := strconv.ParseBool("true")  // string → bool
```

> [!IMPORTANT]
> String-to-number conversions return an **error** as the second value. Always check it:
> ```go
> n, err := strconv.Atoi("hello")
> if err != nil {
>     fmt.Println("Not a number:", err)
> }
> ```

---

## `string()` and `[]byte`

Converting between strings and byte slices:

```go
s := "Hello"
b := []byte(s)        // string → byte slice
s2 := string(b)       // byte slice → string

fmt.Println(b)         // [72 101 108 108 111]
fmt.Println(s2)        // Hello
```

Converting an integer with `string()` gives the **Unicode character**, not the number:

```go
fmt.Println(string(65))   // A (not "65"!)
fmt.Println(string(9731)) // ☃
```

Use `strconv.Itoa()` to convert an integer to its string representation.

---

## `[]rune` for Unicode

```go
s := "Hello, 世界"
runes := []rune(s)

fmt.Println(len(s))       // 13 (bytes)
fmt.Println(len(runes))   // 9  (characters)

for i, r := range runes {
    fmt.Printf("%d: %c\n", i, r)
}
```

---

## Using `fmt.Sprintf` for Quick Conversions

`fmt.Sprintf` is a convenient (though slower) way to convert anything to a string:

```go
s := fmt.Sprintf("%d", 42)       // "42"
s2 := fmt.Sprintf("%.2f", 3.14)  // "3.14"
s3 := fmt.Sprintf("%v", true)    // "true"
```

---

## Type Assertion (Preview)

For interface values, Go uses **type assertions** instead of conversions. We'll cover this in detail in the interfaces lesson:

```go
var x interface{} = "hello"
s := x.(string)       // type assertion
fmt.Println(s)         // hello
```

---

## Complete Example

```go
package main

import (
    "fmt"
    "strconv"
)

func main() {
    // Numeric conversions
    celsius := 37.5
    fahrenheit := celsius*9/5 + 32
    fmt.Printf("%.1f°C = %.1f°F\n", celsius, fahrenheit)

    // Int ↔ Float
    items := 7
    perBox := 3
    boxes := float64(items) / float64(perBox)
    fmt.Printf("%d items ÷ %d per box = %.2f boxes\n", items, perBox, boxes)

    // String ↔ Number
    input := "256"
    value, err := strconv.Atoi(input)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    doubled := value * 2
    result := strconv.Itoa(doubled)
    fmt.Printf("%s × 2 = %s\n", input, result)

    // String ↔ Bytes
    message := "Go! 🚀"
    bytes := []byte(message)
    runes := []rune(message)
    fmt.Printf("Bytes: %d, Runes: %d\n", len(bytes), len(runes))
}
```

Output:

```
37.5°C = 99.5°F
7 items ÷ 3 per box = 2.33 boxes
256 × 2 = 512
Bytes: 8, Runes: 5
```

---

Next: operators in Go.
