---
title: Go Embedding
---

# Go Embedding & Composition

Go doesn't have inheritance. Instead, it uses **embedding** — you include one type inside another and its fields and methods are "promoted." This is **composition over inheritance**.

---

## Struct Embedding

```go
type Address struct {
    Street string
    City   string
    State  string
}

type Person struct {
    Name    string
    Age     int
    Address // embedded (no field name)
}

func main() {
    p := Person{
        Name: "Alice",
        Age:  30,
        Address: Address{
            Street: "123 Main St",
            City:   "Springfield",
            State:  "IL",
        },
    }

    // Promoted fields — access directly
    fmt.Println(p.City)      // Springfield
    fmt.Println(p.Street)    // 123 Main St

    // Also works through the embedded type
    fmt.Println(p.Address.City)  // Springfield
}
```

---

## Method Promotion

When you embed a type, its methods are promoted to the outer type:

```go
type Logger struct {
    Prefix string
}

func (l Logger) Log(msg string) {
    fmt.Printf("[%s] %s\n", l.Prefix, msg)
}

type Server struct {
    Host string
    Port int
    Logger  // embed Logger
}

func main() {
    s := Server{
        Host:   "localhost",
        Port:   8080,
        Logger: Logger{Prefix: "SERVER"},
    }

    s.Log("Starting...")  // promoted method
    // [SERVER] Starting...
}
```

---

## Overriding Promoted Methods

The outer type can define its own method with the same name:

```go
func (s Server) Log(msg string) {
    fmt.Printf("[%s:%d] %s\n", s.Host, s.Port, msg)
}

s.Log("Request received")
// [localhost:8080] Request received

// Still access the embedded method
s.Logger.Log("Direct logger call")
// [SERVER] Direct logger call
```

---

## Interface Embedding

Compose interfaces from smaller ones:

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type Closer interface {
    Close() error
}

// Composed interfaces
type ReadWriter interface {
    Reader
    Writer
}

type ReadWriteCloser interface {
    Reader
    Writer
    Closer
}
```

This is how the standard library builds complex interfaces from simple ones.

---

## Embedding for Interface Satisfaction

Embedding can make a type satisfy an interface through composition:

```go
type Animal interface {
    Name() string
    Sound() string
}

type BaseAnimal struct {
    AnimalName string
}

func (b BaseAnimal) Name() string {
    return b.AnimalName
}

type Dog struct {
    BaseAnimal // inherits Name()
}

func (d Dog) Sound() string {
    return "Woof!"
}

// Dog satisfies Animal through embedding + its own method
var _ Animal = Dog{BaseAnimal{"Rex"}}
```

---

## Multiple Embedding

```go
type Dimensions struct {
    Width, Height float64
}

type Style struct {
    Color string
    Bold  bool
}

type Widget struct {
    Dimensions
    Style
    Label string
}

w := Widget{
    Dimensions: Dimensions{100, 50},
    Style:      Style{Color: "blue", Bold: true},
    Label:      "Submit",
}

fmt.Println(w.Width, w.Color, w.Label)  // 100 blue Submit
```

If two embedded types have a field with the same name, you must qualify it:

```go
// If both had a "Name" field:
// w.Name          // ❌ ambiguous
// w.Dimensions.Name  // ✅ explicit
```

---

## Embedding vs Named Fields

```go
// Embedding (promotes fields and methods)
type Server struct {
    Logger  // embedded
}

// Named field (no promotion)
type Server struct {
    Log Logger  // named field
}
```

Use embedding when you want promotion; use named fields when you want explicit access.

---

## Complete Example

```go
package main

import "fmt"

type Notifier interface {
    Notify(msg string)
}

type EmailSender struct {
    From string
}

func (e EmailSender) Notify(msg string) {
    fmt.Printf("📧 Email from %s: %s\n", e.From, msg)
}

type SMSSender struct {
    Phone string
}

func (s SMSSender) Notify(msg string) {
    fmt.Printf("📱 SMS to %s: %s\n", s.Phone, msg)
}

type AlertSystem struct {
    EmailSender
    SMSSender
}

func (a AlertSystem) NotifyAll(msg string) {
    a.EmailSender.Notify(msg)
    a.SMSSender.Notify(msg)
}

func main() {
    alert := AlertSystem{
        EmailSender: EmailSender{From: "admin@example.com"},
        SMSSender:   SMSSender{Phone: "+1-555-0100"},
    }

    alert.NotifyAll("Server is down!")
}
```

Output:

```
📧 Email from admin@example.com: Server is down!
📱 SMS to +1-555-0100: Server is down!
```

---

Next: standard interfaces like `Stringer`, `error`, and `sort.Interface`.
