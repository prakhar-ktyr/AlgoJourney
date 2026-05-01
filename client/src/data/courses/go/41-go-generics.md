---
title: Go Generics
---

# Go Generics

Generics (added in Go 1.18) let you write functions and types that work with **any type** while maintaining type safety. No more `interface{}` and type assertions.

---

## Before Generics

```go
// Without generics — need separate functions for each type
func maxInt(a, b int) int {
    if a > b { return a }
    return b
}

func maxFloat(a, b float64) float64 {
    if a > b { return a }
    return b
}
```

---

## Generic Functions

```go
func Max[T int | float64 | string](a, b T) T {
    if a > b {
        return a
    }
    return b
}

func main() {
    fmt.Println(Max(3, 5))        // 5
    fmt.Println(Max(3.14, 2.71))  // 3.14
    fmt.Println(Max("go", "rust")) // rust
}
```

`[T int | float64 | string]` is a **type parameter** with a **constraint**.

---

## Constraints

### Built-in Constraints

| Constraint | Meaning |
|-----------|---------|
| `any` | Any type (alias for `interface{}`) |
| `comparable` | Types that support `==` and `!=` |

```go
func contains[T comparable](slice []T, target T) bool {
    for _, v := range slice {
        if v == target {
            return true
        }
    }
    return false
}

fmt.Println(contains([]int{1, 2, 3}, 2))        // true
fmt.Println(contains([]string{"a", "b"}, "c"))   // false
```

### Using `constraints` Package

```go
import "golang.org/x/exp/constraints"

func Min[T constraints.Ordered](a, b T) T {
    if a < b {
        return a
    }
    return b
}
```

`constraints.Ordered` includes all types that support `<`, `>`, `<=`, `>=`.

### `cmp.Ordered` (Go 1.21+)

```go
import "cmp"

func Min[T cmp.Ordered](a, b T) T {
    if a < b {
        return a
    }
    return b
}
```

---

## Custom Constraints

Define your own constraints as interfaces:

```go
type Number interface {
    int | int8 | int16 | int32 | int64 |
    float32 | float64
}

func Sum[T Number](nums []T) T {
    var total T
    for _, n := range nums {
        total += n
    }
    return total
}

fmt.Println(Sum([]int{1, 2, 3}))        // 6
fmt.Println(Sum([]float64{1.5, 2.5}))   // 4.0
```

---

## The `~` Operator

`~T` matches T **and any type with T as its underlying type**:

```go
type Celsius float64
type Fahrenheit float64

type Float interface {
    ~float32 | ~float64
}

func Abs[T Float](x T) T {
    if x < 0 {
        return -x
    }
    return x
}

var temp Celsius = -10.5
fmt.Println(Abs(temp))  // 10.5 — works because Celsius's underlying type is float64
```

---

## Generic Slices

```go
func Filter[T any](slice []T, test func(T) bool) []T {
    var result []T
    for _, v := range slice {
        if test(v) {
            result = append(result, v)
        }
    }
    return result
}

func Map[T, U any](slice []T, f func(T) U) []U {
    result := make([]U, len(slice))
    for i, v := range slice {
        result[i] = f(v)
    }
    return result
}

// Usage
nums := []int{1, 2, 3, 4, 5}
evens := Filter(nums, func(n int) bool { return n%2 == 0 })
doubled := Map(nums, func(n int) int { return n * 2 })
```

---

## Complete Example

```go
package main

import (
    "cmp"
    "fmt"
)

func Max[T cmp.Ordered](vals ...T) T {
    m := vals[0]
    for _, v := range vals[1:] {
        if v > m {
            m = v
        }
    }
    return m
}

func Keys[K comparable, V any](m map[K]V) []K {
    keys := make([]K, 0, len(m))
    for k := range m {
        keys = append(keys, k)
    }
    return keys
}

func main() {
    fmt.Println(Max(3, 1, 4, 1, 5, 9))           // 9
    fmt.Println(Max("go", "rust", "python"))       // rust
    fmt.Println(Max(3.14, 2.71, 1.41))            // 3.14

    ages := map[string]int{"Alice": 30, "Bob": 25}
    fmt.Println(Keys(ages))  // [Alice Bob] (order varies)
}
```

---

Next: generic types and advanced constraints.
