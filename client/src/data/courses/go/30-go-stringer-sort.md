---
title: Go Standard Interfaces
---

# Go Standard Interfaces

Go's standard library defines several key interfaces that are used everywhere. Understanding them is essential for writing idiomatic Go.

---

## `fmt.Stringer`

Controls how your type is printed:

```go
type Stringer interface {
    String() string
}
```

```go
type Point struct {
    X, Y int
}

func (p Point) String() string {
    return fmt.Sprintf("(%d, %d)", p.X, p.Y)
}

p := Point{3, 4}
fmt.Println(p)           // (3, 4)
fmt.Printf("Point: %s\n", p)  // Point: (3, 4)
```

> [!TIP]
> Implement `String()` on any type you'll print. It's Go's equivalent of `toString()` in Java or `__str__` in Python.

---

## `error` Interface

The most important interface in Go:

```go
type error interface {
    Error() string
}
```

Any type with an `Error() string` method is an error:

```go
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed on %s: %s", e.Field, e.Message)
}

func validate(age int) error {
    if age < 0 {
        return &ValidationError{Field: "age", Message: "must be positive"}
    }
    return nil
}
```

---

## `io.Reader` and `io.Writer`

The foundation of Go's I/O system:

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}
```

Files, network connections, HTTP bodies, buffers — they all implement these:

```go
import (
    "io"
    "os"
    "strings"
)

// strings.Reader implements io.Reader
r := strings.NewReader("Hello, Go!")

// os.Stdout implements io.Writer
io.Copy(os.Stdout, r)  // Hello, Go!
```

---

## `sort.Interface`

Sort any collection by implementing three methods:

```go
type Interface interface {
    Len() int
    Less(i, j int) bool
    Swap(i, j int)
}
```

```go
type ByAge []Person

func (a ByAge) Len() int           { return len(a) }
func (a ByAge) Less(i, j int) bool { return a[i].Age < a[j].Age }
func (a ByAge) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

people := []Person{
    {"Alice", 30},
    {"Bob", 25},
    {"Carol", 35},
}

sort.Sort(ByAge(people))
```

Modern alternative — `sort.Slice` (no interface needed):

```go
sort.Slice(people, func(i, j int) bool {
    return people[i].Age < people[j].Age
})
```

---

## `io.Closer`

```go
type Closer interface {
    Close() error
}
```

Used by files, connections, HTTP response bodies. Always defer `Close()`:

```go
f, err := os.Open("file.txt")
if err != nil {
    return err
}
defer f.Close()
```

---

## `encoding.Marshaler` / `encoding.Unmarshaler`

Customize JSON encoding:

```go
type Marshaler interface {
    MarshalJSON() ([]byte, error)
}

type Unmarshaler interface {
    UnmarshalJSON([]byte) error
}
```

---

## Interface Composition in the Standard Library

The standard library composes small interfaces:

```go
// io.ReadWriter = Reader + Writer
type ReadWriter interface {
    Reader
    Writer
}

// io.ReadWriteCloser = Reader + Writer + Closer
type ReadWriteCloser interface {
    Reader
    Writer
    Closer
}
```

---

## Complete Example

```go
package main

import (
    "fmt"
    "sort"
    "strings"
)

type Student struct {
    Name  string
    Grade float64
}

func (s Student) String() string {
    return fmt.Sprintf("%s (%.1f)", s.Name, s.Grade)
}

type ByGrade []Student

func (g ByGrade) Len() int           { return len(g) }
func (g ByGrade) Less(i, j int) bool { return g[i].Grade > g[j].Grade }
func (g ByGrade) Swap(i, j int)      { g[i], g[j] = g[j], g[i] }

func main() {
    students := []Student{
        {"Alice", 92.5},
        {"Bob", 87.3},
        {"Carol", 95.1},
        {"Dave", 89.8},
    }

    sort.Sort(ByGrade(students))

    fmt.Println("Rankings (highest first):")
    for i, s := range students {
        fmt.Printf("  %d. %s\n", i+1, s)
    }

    // Using io.Reader
    r := strings.NewReader("Go interfaces are powerful!")
    buf := make([]byte, 8)
    fmt.Println("\nReading in chunks:")
    for {
        n, err := r.Read(buf)
        if n > 0 {
            fmt.Printf("  [%s]\n", string(buf[:n]))
        }
        if err != nil {
            break
        }
    }
}
```

---

Next: error handling — Go's explicit approach to dealing with errors.
