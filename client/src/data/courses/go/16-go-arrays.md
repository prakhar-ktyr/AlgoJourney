---
title: Go Arrays
---

# Go Arrays

An array in Go is a **fixed-size**, **numbered** sequence of elements of a single type. The size is part of the type — `[3]int` and `[5]int` are different types.

---

## Declaring Arrays

```go
// Declare with a size and type
var numbers [5]int
fmt.Println(numbers)  // [0 0 0 0 0] — zero values

// Declare and initialize
colors := [3]string{"red", "green", "blue"}
fmt.Println(colors)   // [red green blue]

// Let the compiler count
primes := [...]int{2, 3, 5, 7, 11}
fmt.Println(primes)   // [2 3 5 7 11]
```

> [!NOTE]
> `[...]` counts the initializer values at compile time. It still creates a fixed-size array.

---

## Accessing and Modifying Elements

Arrays are zero-indexed:

```go
fruits := [3]string{"apple", "banana", "cherry"}

fmt.Println(fruits[0])  // apple
fmt.Println(fruits[2])  // cherry

fruits[1] = "blueberry"
fmt.Println(fruits)     // [apple blueberry cherry]
```

Accessing an out-of-bounds index is a **compile-time error** (if the index is a constant) or a **runtime panic**:

```go
// fmt.Println(fruits[5])  // compile error: index out of range
```

---

## Array Length

```go
arr := [4]int{10, 20, 30, 40}
fmt.Println(len(arr))  // 4
```

---

## Iterating Over Arrays

### With a Classic For Loop

```go
arr := [4]int{10, 20, 30, 40}

for i := 0; i < len(arr); i++ {
    fmt.Printf("arr[%d] = %d\n", i, arr[i])
}
```

### With Range

```go
for index, value := range arr {
    fmt.Printf("arr[%d] = %d\n", index, value)
}
```

---

## Arrays Are Values

In Go, arrays are **values**, not references. Assigning or passing an array **copies** the entire array:

```go
a := [3]int{1, 2, 3}
b := a        // b is a copy
b[0] = 99

fmt.Println(a) // [1 2 3]   — unchanged
fmt.Println(b) // [99 2 3]  — only copy changed
```

> [!IMPORTANT]
> This is different from most languages where arrays are references. For large arrays, copying is expensive — use **slices** instead.

---

## Multi-Dimensional Arrays

```go
matrix := [2][3]int{
    {1, 2, 3},
    {4, 5, 6},
}

for i, row := range matrix {
    for j, val := range row {
        fmt.Printf("matrix[%d][%d] = %d  ", i, j, val)
    }
    fmt.Println()
}
```

Output:

```
matrix[0][0] = 1  matrix[0][1] = 2  matrix[0][2] = 3  
matrix[1][0] = 4  matrix[1][1] = 5  matrix[1][2] = 6  
```

---

## Comparing Arrays

Arrays of the same type can be compared with `==` and `!=`:

```go
a := [3]int{1, 2, 3}
b := [3]int{1, 2, 3}
c := [3]int{3, 2, 1}

fmt.Println(a == b) // true
fmt.Println(a == c) // false
```

---

## Initialized at Specific Indices

```go
arr := [5]int{1: 10, 3: 30}
fmt.Println(arr)  // [0 10 0 30 0]
```

---

## Complete Example

```go
package main

import "fmt"

func main() {
    // Temperature readings for a week
    temps := [7]float64{22.5, 24.1, 19.8, 21.3, 25.7, 23.4, 20.6}

    // Find min, max, and average
    min, max := temps[0], temps[0]
    sum := 0.0

    for _, t := range temps {
        sum += t
        if t < min {
            min = t
        }
        if t > max {
            max = t
        }
    }

    avg := sum / float64(len(temps))

    fmt.Println("Weekly Temperatures:")
    days := [7]string{"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"}
    for i, t := range temps {
        fmt.Printf("  %s: %.1f°C\n", days[i], t)
    }
    fmt.Printf("\nMin: %.1f°C, Max: %.1f°C, Avg: %.1f°C\n", min, max, avg)
}
```

---

## Arrays vs Slices

Arrays are rarely used directly in Go. **Slices** are much more common because they're dynamic and more flexible. The next lesson covers slices — the workhorse data structure of Go.
