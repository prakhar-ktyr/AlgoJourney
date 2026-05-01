---
title: Go Structs
---

# Go Structs

Structs are Go's way of grouping related data together. They're Go's answer to classes in other languages — but without inheritance.

---

## Defining a Struct

```go
type Person struct {
    Name string
    Age  int
    City string
}
```

---

## Creating Struct Instances

```go
// Named fields (preferred)
p1 := Person{Name: "Alice", Age: 30, City: "NYC"}

// Positional (fragile — avoid)
p2 := Person{"Bob", 25, "London"}

// Zero value struct
var p3 Person
fmt.Println(p3)  // { 0 } — empty string, 0, empty string

// Using new (returns a pointer)
p4 := new(Person)
p4.Name = "Carol"
```

---

## Accessing Fields

```go
p := Person{Name: "Alice", Age: 30, City: "NYC"}

fmt.Println(p.Name)  // Alice
fmt.Println(p.Age)   // 30

p.Age = 31           // modify a field
fmt.Println(p.Age)   // 31
```

---

## Structs Are Values

Like arrays, structs are **copied** on assignment:

```go
p1 := Person{Name: "Alice", Age: 30}
p2 := p1       // copy
p2.Name = "Bob"

fmt.Println(p1.Name)  // Alice (unchanged)
fmt.Println(p2.Name)  // Bob
```

---

## Pointers to Structs

Use pointers to avoid copying and to share data:

```go
p := &Person{Name: "Alice", Age: 30}

// Go automatically dereferences struct pointers
fmt.Println(p.Name)    // Alice (no need for (*p).Name)
p.Age = 31
```

---

## Anonymous Structs

Quick, one-off structs without defining a type:

```go
point := struct {
    X, Y int
}{10, 20}

fmt.Println(point.X, point.Y)  // 10 20
```

Useful for test data, JSON decoding, and template data.

---

## Struct Embedding

Go doesn't have inheritance — it uses **embedding** for composition:

```go
type Address struct {
    Street string
    City   string
}

type Employee struct {
    Name    string
    Address // embedded — fields are promoted
}

e := Employee{
    Name: "Alice",
    Address: Address{
        Street: "123 Main St",
        City:   "NYC",
    },
}

// Access promoted fields directly
fmt.Println(e.City)       // NYC
fmt.Println(e.Street)     // 123 Main St
fmt.Println(e.Address.City) // NYC (also works)
```

---

## Struct Tags

Tags attach metadata to fields. They're most commonly used with JSON:

```go
type User struct {
    ID       int    `json:"id"`
    Username string `json:"username"`
    Email    string `json:"email,omitempty"`
    Password string `json:"-"` // never include in JSON
}
```

> [!NOTE]
> Tags are just strings — they have no effect at compile time. Packages like `encoding/json` read them at runtime using reflection.

---

## Comparing Structs

Structs are comparable if all their fields are comparable:

```go
a := Person{Name: "Alice", Age: 30}
b := Person{Name: "Alice", Age: 30}
c := Person{Name: "Bob", Age: 25}

fmt.Println(a == b)  // true
fmt.Println(a == c)  // false
```

---

## Complete Example

```go
package main

import "fmt"

type Rectangle struct {
    Width  float64
    Height float64
}

func area(r Rectangle) float64 {
    return r.Width * r.Height
}

func perimeter(r Rectangle) float64 {
    return 2 * (r.Width + r.Height)
}

func scale(r *Rectangle, factor float64) {
    r.Width *= factor
    r.Height *= factor
}

func main() {
    rect := Rectangle{Width: 10, Height: 5}

    fmt.Printf("Rectangle: %.0fx%.0f\n", rect.Width, rect.Height)
    fmt.Printf("Area: %.1f\n", area(rect))
    fmt.Printf("Perimeter: %.1f\n", perimeter(rect))

    scale(&rect, 2)
    fmt.Printf("\nAfter 2x scale: %.0fx%.0f\n", rect.Width, rect.Height)
    fmt.Printf("Area: %.1f\n", area(rect))
}
```

Output:

```
Rectangle: 10x5
Area: 50.0
Perimeter: 30.0

After 2x scale: 20x10
Area: 200.0
```

---

Next: functions in depth — parameters, return values, and more.
