---
title: Go Strings
---

# Go Strings

Strings in Go are **immutable sequences of bytes**, typically holding UTF-8 text. This lesson covers string operations and the powerful `strings` package.

---

## String Basics

```go
s := "Hello, World!"

fmt.Println(s)          // Hello, World!
fmt.Println(len(s))     // 13 (bytes, not characters)
fmt.Println(s[0])       // 72 (byte value of 'H')
fmt.Println(string(s[0])) // H
```

---

## String Literals

| Type | Syntax | Behavior |
|------|--------|----------|
| Interpreted | `"hello\nworld"` | Processes escape sequences |
| Raw | `` `hello\nworld` `` | Preserves everything literally |

```go
s1 := "Line1\nLine2"
s2 := `Line1\nLine2`

fmt.Println(s1)
// Line1
// Line2

fmt.Println(s2)
// Line1\nLine2
```

Raw strings are great for regex, file paths, and multiline text.

---

## Strings Are Immutable

You cannot modify a string in place:

```go
s := "hello"
// s[0] = 'H'  // ❌ Compile error

// Create a new string instead
s = "H" + s[1:]
fmt.Println(s)  // Hello
```

---

## UTF-8 and Runes

Go strings are UTF-8 encoded. Non-ASCII characters use multiple bytes:

```go
s := "Hello, 世界"

fmt.Println(len(s))           // 13 (bytes)
fmt.Println(len([]rune(s)))   // 9  (characters)

// Iterate by rune (character)
for i, r := range s {
    fmt.Printf("byte %2d: %c\n", i, r)
}
```

> [!IMPORTANT]
> `len(s)` returns **bytes**, not characters. Use `len([]rune(s))` or `utf8.RuneCountInString(s)` for character count.

---

## The `strings` Package

The standard library `strings` package has everything you need:

### Searching

```go
import "strings"

s := "Hello, World!"

fmt.Println(strings.Contains(s, "World"))    // true
fmt.Println(strings.HasPrefix(s, "Hello"))   // true
fmt.Println(strings.HasSuffix(s, "!"))       // true
fmt.Println(strings.Index(s, "World"))       // 7
fmt.Println(strings.Count(s, "l"))           // 3
```

### Transforming

```go
fmt.Println(strings.ToUpper("hello"))         // HELLO
fmt.Println(strings.ToLower("HELLO"))         // hello
fmt.Println(strings.TrimSpace("  hi  "))      // hi
fmt.Println(strings.Trim("**hi**", "*"))      // hi
fmt.Println(strings.Replace("aaa", "a", "b", 2)) // bba
fmt.Println(strings.ReplaceAll("aaa", "a", "b")) // bbb
```

### Splitting and Joining

```go
parts := strings.Split("a,b,c", ",")
fmt.Println(parts)  // [a b c]

joined := strings.Join([]string{"Go", "is", "fun"}, " ")
fmt.Println(joined)  // Go is fun
```

### Repeating

```go
fmt.Println(strings.Repeat("Go! ", 3))  // Go! Go! Go! 
```

---

## String Concatenation

### Using `+`

```go
s := "Hello" + ", " + "World!"
```

Simple, but inefficient in loops (creates new strings each time).

### Using `fmt.Sprintf`

```go
name := "Alice"
age := 30
s := fmt.Sprintf("%s is %d years old", name, age)
```

### Using `strings.Builder` (efficient)

```go
var b strings.Builder
for i := 0; i < 5; i++ {
    fmt.Fprintf(&b, "item %d, ", i)
}
fmt.Println(b.String())  // item 0, item 1, item 2, item 3, item 4, 
```

> [!TIP]
> Use `strings.Builder` when building strings in a loop. It avoids repeated allocations.

---

## String Conversion

```go
// String ↔ byte slice
s := "hello"
bytes := []byte(s)
s2 := string(bytes)

// String ↔ rune slice
runes := []rune("Hello, 世界")
s3 := string(runes)

// Number ↔ string
import "strconv"
n, _ := strconv.Atoi("42")     // string → int
s4 := strconv.Itoa(42)         // int → string
```

---

## Comparing Strings

```go
fmt.Println("abc" == "abc")  // true
fmt.Println("abc" < "abd")   // true (lexicographic)
fmt.Println("ABC" == "abc")  // false (case-sensitive)

// Case-insensitive comparison
fmt.Println(strings.EqualFold("ABC", "abc"))  // true
```

---

## Complete Example

```go
package main

import (
    "fmt"
    "strings"
)

func main() {
    // Text processing
    csv := "Alice,30,Engineer;Bob,25,Designer;Carol,35,Manager"

    rows := strings.Split(csv, ";")
    fmt.Println("Parsed CSV:")
    for _, row := range rows {
        fields := strings.Split(row, ",")
        fmt.Printf("  Name: %-8s Age: %-4s Role: %s\n",
            fields[0], fields[1], fields[2])
    }

    // String builder
    var b strings.Builder
    b.WriteString("Languages: ")
    langs := []string{"Go", "Rust", "Python"}
    b.WriteString(strings.Join(langs, ", "))
    fmt.Println("\n" + b.String())

    // Character analysis
    text := "Hello, 世界! 🚀"
    fmt.Printf("\nText: %s\n", text)
    fmt.Printf("Bytes: %d, Runes: %d\n", len(text), len([]rune(text)))
}
```

---

Next: structs — Go's way of grouping related data.
