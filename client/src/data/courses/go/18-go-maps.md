---
title: Go Maps
---

# Go Maps

A map is Go's built-in **hash table** — an unordered collection of key-value pairs. Keys must be comparable types; values can be any type.

---

## Creating Maps

```go
// Literal syntax
ages := map[string]int{
    "Alice": 30,
    "Bob":   25,
    "Carol": 35,
}

// Using make
scores := make(map[string]int)

// Empty map literal
config := map[string]string{}
```

---

## Accessing Values

```go
ages := map[string]int{"Alice": 30, "Bob": 25}

fmt.Println(ages["Alice"])  // 30
fmt.Println(ages["Bob"])    // 25
fmt.Println(ages["Unknown"]) // 0 (zero value for int)
```

---

## The Comma-Ok Idiom

When a key doesn't exist, you get the zero value. To distinguish "key not found" from "key exists with zero value," use the two-value form:

```go
age, ok := ages["Alice"]
if ok {
    fmt.Printf("Alice is %d\n", age)
}

age, ok = ages["Unknown"]
if !ok {
    fmt.Println("Unknown not found")
}

// Common shorthand
if age, ok := ages["Bob"]; ok {
    fmt.Printf("Bob is %d\n", age)
}
```

> [!TIP]
> Always use the comma-ok idiom when the zero value is a valid value (e.g., `0` for int, `""` for string).

---

## Adding and Updating

```go
m := map[string]int{}

m["x"] = 10    // add
m["y"] = 20    // add
m["x"] = 15    // update (overwrite)

fmt.Println(m)  // map[x:15 y:20]
```

---

## Deleting Keys

```go
m := map[string]int{"a": 1, "b": 2, "c": 3}

delete(m, "b")
fmt.Println(m)  // map[a:1 c:3]

delete(m, "z")  // no-op, no error
```

---

## Iterating Over Maps

```go
capitals := map[string]string{
    "France":  "Paris",
    "Japan":   "Tokyo",
    "Germany": "Berlin",
}

for country, capital := range capitals {
    fmt.Printf("%s → %s\n", country, capital)
}
```

> [!WARNING]
> Map iteration order is **randomized**. Don't depend on any specific order.

---

## Map Length

```go
m := map[string]int{"a": 1, "b": 2}
fmt.Println(len(m))  // 2
```

---

## Nil Maps

A `nil` map can be read from but **not written to**:

```go
var m map[string]int

fmt.Println(m["key"])  // 0 (safe to read)
fmt.Println(len(m))    // 0
// m["key"] = 1        // ❌ runtime panic!
```

Always initialize a map before writing to it.

---

## Maps Are References

Assigning a map to a new variable doesn't copy it — they share the same data:

```go
a := map[string]int{"x": 1}
b := a
b["x"] = 99

fmt.Println(a["x"])  // 99 — a is affected!
```

---

## Maps as Sets

Go has no built-in set type. Use `map[T]bool` or `map[T]struct{}`:

```go
seen := map[string]bool{}
words := []string{"hello", "world", "hello", "go"}

for _, w := range words {
    if !seen[w] {
        seen[w] = true
        fmt.Println(w)
    }
}
// Prints: hello, world, go (no duplicates)
```

> [!TIP]
> `map[T]struct{}` uses less memory than `map[T]bool` since `struct{}` takes zero bytes. But `map[T]bool` is simpler to use.

---

## Complete Example

```go
package main

import "fmt"

func wordCount(text string) map[string]int {
    counts := make(map[string]int)
    word := ""
    for _, ch := range text + " " {
        if ch == ' ' || ch == '\n' {
            if word != "" {
                counts[word]++
                word = ""
            }
        } else {
            word += string(ch)
        }
    }
    return counts
}

func main() {
    text := "go is fast go is fun go is simple"
    counts := wordCount(text)

    fmt.Println("Word frequencies:")
    for word, count := range counts {
        fmt.Printf("  %-8s %d\n", word, count)
    }

    // Check for a specific word
    if n, ok := counts["go"]; ok {
        fmt.Printf("\n'go' appears %d times\n", n)
    }
}
```

---

Next: Go strings and the `strings` package.
