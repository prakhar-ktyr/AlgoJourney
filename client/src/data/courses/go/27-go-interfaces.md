---
title: Go Interfaces
---

# Go Interfaces

Interfaces are Go's primary abstraction mechanism. They define behavior as a set of method signatures. Any type that implements those methods **automatically** satisfies the interface — no `implements` keyword needed.

---

## Defining an Interface

```go
type Shape interface {
    Area() float64
    Perimeter() float64
}
```

---

## Implementing an Interface

A type implements an interface simply by having the right methods:

```go
type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * math.Pi * c.Radius
}

type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
    return 2 * (r.Width + r.Height)
}
```

Both `Circle` and `Rectangle` satisfy `Shape` — no declaration required.

---

## Using Interfaces

```go
func printInfo(s Shape) {
    fmt.Printf("Area: %.2f, Perimeter: %.2f\n", s.Area(), s.Perimeter())
}

func main() {
    c := Circle{Radius: 5}
    r := Rectangle{Width: 10, Height: 5}

    printInfo(c)  // Area: 78.54, Perimeter: 31.42
    printInfo(r)  // Area: 50.00, Perimeter: 30.00
}
```

> [!IMPORTANT]
> This is **implicit implementation** — one of Go's most powerful features. Types satisfy interfaces without knowing about them. This enables loose coupling and easy testing.

---

## The Empty Interface

`interface{}` (or `any` in Go 1.18+) has no methods, so **every type** satisfies it:

```go
func printAnything(v any) {
    fmt.Printf("Type: %T, Value: %v\n", v, v)
}

printAnything(42)
printAnything("hello")
printAnything(true)
printAnything([]int{1, 2, 3})
```

> [!NOTE]
> `any` is an alias for `interface{}` introduced in Go 1.18. Use `any` for new code.

---

## Type Assertions

Extract the concrete type from an interface:

```go
var s Shape = Circle{Radius: 5}

// Type assertion
c := s.(Circle)
fmt.Println(c.Radius)  // 5

// With comma-ok (safe)
if c, ok := s.(Circle); ok {
    fmt.Println("It's a circle with radius", c.Radius)
}

// This would panic if s is not a Rectangle:
// r := s.(Rectangle)
```

---

## Interface Values

An interface value holds two things:
1. The **concrete type** stored
2. The **concrete value**

```go
var s Shape = Circle{Radius: 5}
fmt.Printf("Type: %T\n", s)   // main.Circle
fmt.Printf("Value: %v\n", s)  // {5}
```

---

## Nil Interface vs Nil Value

```go
var s Shape          // nil interface — no type, no value
fmt.Println(s == nil)  // true

var c *Circle = nil
s = c                 // interface has a type (*Circle) but nil value
fmt.Println(s == nil)  // false!
```

> [!WARNING]
> An interface holding a nil pointer is **not** a nil interface. This is a common source of bugs.

---

## Small Interfaces

Go favors small, focused interfaces:

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type ReadWriter interface {
    Reader
    Writer
}
```

The standard library is full of one- and two-method interfaces.

---

## Complete Example

```go
package main

import (
    "fmt"
    "math"
)

type Shape interface {
    Area() float64
    String() string
}

type Circle struct{ Radius float64 }
type Square struct{ Side float64 }

func (c Circle) Area() float64   { return math.Pi * c.Radius * c.Radius }
func (c Circle) String() string  { return fmt.Sprintf("Circle(r=%.1f)", c.Radius) }

func (s Square) Area() float64   { return s.Side * s.Side }
func (s Square) String() string  { return fmt.Sprintf("Square(s=%.1f)", s.Side) }

func largest(shapes []Shape) Shape {
    best := shapes[0]
    for _, s := range shapes[1:] {
        if s.Area() > best.Area() {
            best = s
        }
    }
    return best
}

func main() {
    shapes := []Shape{
        Circle{Radius: 3},
        Square{Side: 7},
        Circle{Radius: 5},
        Square{Side: 4},
    }

    for _, s := range shapes {
        fmt.Printf("  %s → Area: %.2f\n", s, s.Area())
    }
    fmt.Printf("\nLargest: %s (%.2f)\n", largest(shapes), largest(shapes).Area())
}
```

---

Next: type switches for working with different concrete types.
