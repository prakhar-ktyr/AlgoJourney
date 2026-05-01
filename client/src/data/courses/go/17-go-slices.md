---
title: Go Slices
---

# Go Slices

Slices are Go's most important data structure. They are **dynamic, flexible views** into arrays and are used everywhere arrays are used in other languages.

---

## Creating Slices

### From a Literal

```go
nums := []int{1, 2, 3, 4, 5}
names := []string{"Alice", "Bob", "Carol"}

fmt.Println(nums)   // [1 2 3 4 5]
fmt.Println(names)  // [Alice Bob Carol]
```

Note: `[]int` (no size) is a slice; `[5]int` (with size) is an array.

### With `make`

```go
// make([]T, length, capacity)
s := make([]int, 5)       // len=5, cap=5, all zeros
s2 := make([]int, 3, 10)  // len=3, cap=10

fmt.Println(s)             // [0 0 0 0 0]
fmt.Println(len(s2), cap(s2))  // 3 10
```

### From an Array

```go
arr := [5]int{10, 20, 30, 40, 50}
sl := arr[1:4]   // elements at index 1, 2, 3
fmt.Println(sl)   // [20 30 40]
```

---

## Length and Capacity

- **`len(s)`** — number of elements in the slice.
- **`cap(s)`** — number of elements in the underlying array from the slice's start.

```go
s := make([]int, 3, 6)
fmt.Println(len(s), cap(s))  // 3 6
```

---

## Slicing Syntax

```go
s := []int{0, 1, 2, 3, 4, 5}

fmt.Println(s[2:5])   // [2 3 4]   — from index 2 to 4
fmt.Println(s[:3])     // [0 1 2]   — first 3
fmt.Println(s[3:])     // [3 4 5]   — from index 3 to end
fmt.Println(s[:])      // [0 1 2 3 4 5] — full slice
```

---

## Append

`append` adds elements to a slice and returns a new slice:

```go
s := []int{1, 2, 3}
s = append(s, 4)          // add one
s = append(s, 5, 6, 7)    // add multiple

fmt.Println(s)  // [1 2 3 4 5 6 7]
```

Append one slice to another:

```go
a := []int{1, 2}
b := []int{3, 4}
a = append(a, b...)  // spread operator

fmt.Println(a)  // [1 2 3 4]
```

> [!NOTE]
> When `append` exceeds the capacity, Go allocates a new, larger underlying array and copies the data. This is handled automatically.

---

## Copy

```go
src := []int{1, 2, 3}
dst := make([]int, len(src))
n := copy(dst, src)

fmt.Println(dst)  // [1 2 3]
fmt.Println(n)    // 3 (number of elements copied)
```

---

## Nil Slices

A slice with no underlying array is `nil`:

```go
var s []int

fmt.Println(s == nil)   // true
fmt.Println(len(s))     // 0
fmt.Println(cap(s))     // 0

s = append(s, 1)        // works fine!
fmt.Println(s)           // [1]
```

> [!TIP]
> `nil` slices work with `len`, `cap`, `append`, and `range`. You don't need to initialize them before use.

---

## Removing Elements

Go has no built-in `delete` for slices. Use slicing:

```go
s := []string{"a", "b", "c", "d", "e"}

// Remove element at index 2 ("c")
s = append(s[:2], s[3:]...)
fmt.Println(s)  // [a b d e]
```

---

## Slices Are References

Unlike arrays, slices share the same underlying array:

```go
original := []int{1, 2, 3, 4, 5}
slice := original[1:4]

slice[0] = 99
fmt.Println(original)  // [1 99 3 4 5] — original changed!
```

> [!WARNING]
> Modifying a slice can affect the original array and other slices sharing the same backing array. Use `copy` to create an independent copy.

---

## Complete Example

```go
package main

import "fmt"

func main() {
    // Build a dynamic list
    var tasks []string
    tasks = append(tasks, "Write code")
    tasks = append(tasks, "Write tests")
    tasks = append(tasks, "Review PR")
    tasks = append(tasks, "Deploy")

    fmt.Println("All tasks:")
    for i, t := range tasks {
        fmt.Printf("  %d. %s\n", i+1, t)
    }

    // Remove "Review PR" (index 2)
    tasks = append(tasks[:2], tasks[3:]...)
    fmt.Println("\nAfter removing 'Review PR':")
    for i, t := range tasks {
        fmt.Printf("  %d. %s\n", i+1, t)
    }

    // Slice statistics
    scores := []float64{92, 87, 95, 78, 88, 91, 84}
    sum := 0.0
    for _, s := range scores {
        sum += s
    }
    fmt.Printf("\nAverage score: %.1f\n", sum/float64(len(scores)))
    fmt.Printf("Len: %d, Cap: %d\n", len(scores), cap(scores))
}
```

---

Next: maps — Go's built-in hash table.
