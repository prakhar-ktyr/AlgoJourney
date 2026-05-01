---
title: Go For Loop
---

# Go For Loop

Go has only **one** looping construct: the `for` loop. But it's flexible enough to cover `while`, `do-while`, `foreach`, and infinite loops from other languages.

---

## Classic For Loop

```go
for i := 0; i < 5; i++ {
    fmt.Println(i)
}
// Output: 0, 1, 2, 3, 4
```

Three components separated by semicolons:
1. **Init statement** — runs once before the loop
2. **Condition** — checked before each iteration
3. **Post statement** — runs after each iteration

---

## While-Style Loop

Omit the init and post statements to get a `while` loop:

```go
n := 1
for n < 100 {
    n *= 2
}
fmt.Println(n)  // 128
```

---

## Infinite Loop

Omit everything for an infinite loop:

```go
for {
    fmt.Println("Running forever...")
    // Use break or return to exit
}
```

> [!TIP]
> Infinite loops are common for servers, game loops, and event processing. Use `break` or `return` to exit.

---

## `range` — Iterating Over Collections

The `range` keyword iterates over arrays, slices, maps, strings, and channels:

### Over a Slice

```go
fruits := []string{"apple", "banana", "cherry"}

for index, value := range fruits {
    fmt.Printf("%d: %s\n", index, value)
}
```

Output:

```
0: apple
1: banana
2: cherry
```

### Index Only

```go
for i := range fruits {
    fmt.Println(i)  // 0, 1, 2
}
```

### Value Only (ignore index)

```go
for _, fruit := range fruits {
    fmt.Println(fruit)
}
```

### Over a Map

```go
ages := map[string]int{"Alice": 30, "Bob": 25}

for name, age := range ages {
    fmt.Printf("%s is %d\n", name, age)
}
```

> [!NOTE]
> Map iteration order is **randomized** in Go — don't depend on it.

### Over a String

Iterating over a string with `range` gives you **runes** (Unicode code points), not bytes:

```go
for i, ch := range "Go 🚀" {
    fmt.Printf("byte %d: %c (U+%04X)\n", i, ch, ch)
}
```

### Over an Integer (Go 1.22+)

```go
for i := range 5 {
    fmt.Println(i)  // 0, 1, 2, 3, 4
}
```

---

## Nested Loops

```go
for i := 1; i <= 3; i++ {
    for j := 1; j <= 3; j++ {
        fmt.Printf("%d×%d=%d  ", i, j, i*j)
    }
    fmt.Println()
}
```

Output:

```
1×1=1  1×2=2  1×3=3  
2×1=2  2×2=4  2×3=6  
3×1=3  3×2=6  3×3=9  
```

---

## Complete Example

```go
package main

import "fmt"

func main() {
    // Classic for
    fmt.Println("Countdown:")
    for i := 5; i > 0; i-- {
        fmt.Printf("  %d...\n", i)
    }
    fmt.Println("  Liftoff!")

    // While-style — find first power of 3 over 1000
    n := 1
    for n <= 1000 {
        n *= 3
    }
    fmt.Printf("\nFirst power of 3 > 1000: %d\n", n)

    // Range over slice
    languages := []string{"Go", "Rust", "Python", "TypeScript"}
    fmt.Println("\nLanguages:")
    for i, lang := range languages {
        fmt.Printf("  %d. %s\n", i+1, lang)
    }

    // Range over map
    scores := map[string]int{
        "Alice": 95,
        "Bob":   87,
        "Carol": 92,
    }
    fmt.Println("\nScores:")
    for name, score := range scores {
        fmt.Printf("  %s: %d\n", name, score)
    }
}
```

---

Next: `break`, `continue`, and labeled loops.
