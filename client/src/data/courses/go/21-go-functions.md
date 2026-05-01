---
title: Go Functions
---

# Go Functions

Functions are the building blocks of Go programs. Go functions support multiple return values, named returns, and first-class function values.

---

## Basic Functions

```go
func add(a int, b int) int {
    return a + b
}

func main() {
    result := add(3, 5)
    fmt.Println(result)  // 8
}
```

When consecutive parameters share a type, you can shorten:

```go
func add(a, b int) int {
    return a + b
}
```

---

## Multiple Return Values

Go functions can return multiple values — this is used extensively for error handling:

```go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("division by zero")
    }
    return a / b, nil
}

func main() {
    result, err := divide(10, 3)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    fmt.Printf("Result: %.2f\n", result)  // 3.33
}
```

---

## Named Return Values

You can name return values — they act as pre-declared variables:

```go
func rectProps(width, height float64) (area, perimeter float64) {
    area = width * height
    perimeter = 2 * (width + height)
    return  // "naked return" — returns the named values
}

func main() {
    a, p := rectProps(10, 5)
    fmt.Printf("Area: %.1f, Perimeter: %.1f\n", a, p)
}
```

> [!TIP]
> Named returns are useful for documentation, but use naked returns sparingly — they can reduce readability in longer functions.

---

## Functions with No Return Value

```go
func greet(name string) {
    fmt.Printf("Hello, %s!\n", name)
}
```

---

## Passing Values vs Pointers

Go is **pass-by-value** — function parameters receive copies:

```go
func double(x int) {
    x *= 2  // modifies the copy, not the original
}

func doublePtr(x *int) {
    *x *= 2  // modifies the original
}

func main() {
    n := 10
    double(n)
    fmt.Println(n)    // 10 (unchanged)

    doublePtr(&n)
    fmt.Println(n)    // 20 (changed!)
}
```

Use pointers when you need to modify the caller's data or to avoid copying large structs.

---

## Functions as Values

Functions are first-class values in Go — you can assign them to variables, pass them as arguments, and return them:

```go
// Assign to a variable
multiply := func(a, b int) int {
    return a * b
}
fmt.Println(multiply(3, 4))  // 12

// Pass as an argument
func apply(f func(int, int) int, a, b int) int {
    return f(a, b)
}
fmt.Println(apply(multiply, 5, 6))  // 30
```

---

## Function Types

You can define a named function type:

```go
type MathFunc func(int, int) int

func operate(f MathFunc, a, b int) int {
    return f(a, b)
}
```

---

## Complete Example

```go
package main

import (
    "fmt"
    "math"
)

func distance(x1, y1, x2, y2 float64) float64 {
    dx := x2 - x1
    dy := y2 - y1
    return math.Sqrt(dx*dx + dy*dy)
}

func minMax(nums []int) (min, max int) {
    min, max = nums[0], nums[0]
    for _, n := range nums[1:] {
        if n < min {
            min = n
        }
        if n > max {
            max = n
        }
    }
    return
}

func main() {
    d := distance(0, 0, 3, 4)
    fmt.Printf("Distance: %.2f\n", d)  // 5.00

    nums := []int{3, 1, 4, 1, 5, 9, 2, 6}
    lo, hi := minMax(nums)
    fmt.Printf("Min: %d, Max: %d\n", lo, hi)  // 1, 9
}
```

---

Next: variadic functions that accept any number of arguments.
