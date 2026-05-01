---
title: Go Methods
---

# Go Methods

A method is a function with a **receiver** — it's attached to a type. Methods let you define behavior on your own types, similar to methods on classes in other languages.

---

## Defining Methods

```go
type Rectangle struct {
    Width, Height float64
}

// Method with a value receiver
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
    return 2 * (r.Width + r.Height)
}

func main() {
    rect := Rectangle{Width: 10, Height: 5}
    fmt.Println(rect.Area())       // 50
    fmt.Println(rect.Perimeter())  // 30
}
```

The `(r Rectangle)` before the function name is the **receiver**. It binds the method to the `Rectangle` type.

---

## Value Receivers vs Pointer Receivers

### Value Receiver — gets a copy

```go
func (r Rectangle) Scale(factor float64) Rectangle {
    return Rectangle{
        Width:  r.Width * factor,
        Height: r.Height * factor,
    }
}

rect := Rectangle{10, 5}
scaled := rect.Scale(2)
fmt.Println(rect)    // {10 5} — unchanged
fmt.Println(scaled)  // {20 10}
```

### Pointer Receiver — modifies the original

```go
func (r *Rectangle) ScaleInPlace(factor float64) {
    r.Width *= factor
    r.Height *= factor
}

rect := Rectangle{10, 5}
rect.ScaleInPlace(2)
fmt.Println(rect)    // {20 10} — modified!
```

---

## When to Use Pointer Receivers

| Use pointer receiver when... | Use value receiver when... |
|------------------------------|----------------------------|
| Method modifies the receiver | Method only reads data |
| Receiver is a large struct | Receiver is small (a few fields) |
| Consistency — if any method uses pointer, all should | Type is a simple value (e.g., `time.Duration`) |

> [!TIP]
> When in doubt, use a pointer receiver. It avoids copying and allows mutation. The Go standard library uses this convention extensively.

---

## Methods on Non-Struct Types

You can define methods on **any named type** in the same package:

```go
type Celsius float64
type Fahrenheit float64

func (c Celsius) ToFahrenheit() Fahrenheit {
    return Fahrenheit(c*9/5 + 32)
}

func main() {
    temp := Celsius(100)
    fmt.Printf("%.1f°C = %.1f°F\n", temp, temp.ToFahrenheit())
    // 100.0°C = 212.0°F
}
```

> [!NOTE]
> You cannot define methods on types from other packages, including built-in types. Wrap them in a named type first.

---

## Go Automatically Dereferences

Go lets you call pointer-receiver methods on values and vice versa:

```go
rect := Rectangle{10, 5}
rect.ScaleInPlace(2)  // Go converts to (&rect).ScaleInPlace(2)

ptr := &Rectangle{10, 5}
fmt.Println(ptr.Area())  // Go converts to (*ptr).Area()
```

---

## Method Sets

The **method set** of a type determines which interfaces it satisfies:

- Type `T` → methods with receiver `T`
- Type `*T` → methods with receiver `T` **or** `*T`

This means a pointer can call all methods, but a value can only call value-receiver methods.

---

## Methods vs Functions

```go
// Function
func AreaFunc(r Rectangle) float64 {
    return r.Width * r.Height
}

// Method
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

// Both called differently
rect := Rectangle{10, 5}
AreaFunc(rect)   // function call
rect.Area()      // method call
```

Methods are cleaner and enable interfaces (covered next).

---

## Complete Example

```go
package main

import (
    "fmt"
    "math"
)

type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

func (c Circle) Circumference() float64 {
    return 2 * math.Pi * c.Radius
}

func (c Circle) String() string {
    return fmt.Sprintf("Circle(r=%.2f)", c.Radius)
}

func (c *Circle) Grow(factor float64) {
    c.Radius *= factor
}

func main() {
    c := Circle{Radius: 5}

    fmt.Println(c)                              // Circle(r=5.00)
    fmt.Printf("Area: %.2f\n", c.Area())        // 78.54
    fmt.Printf("Circumference: %.2f\n", c.Circumference())  // 31.42

    c.Grow(2)
    fmt.Println("\nAfter Grow(2):")
    fmt.Println(c)                              // Circle(r=10.00)
    fmt.Printf("Area: %.2f\n", c.Area())        // 314.16
}
```

---

Next: pointers in depth, then interfaces — Go's most powerful abstraction.
