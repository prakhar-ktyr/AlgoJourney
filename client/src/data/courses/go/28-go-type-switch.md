---
title: Go Type Switch
---

# Go Type Switch & Assertions

Type switches let you branch based on the **concrete type** inside an interface value. They're essential when working with heterogeneous data.

---

## Type Assertion (Recap)

```go
var i interface{} = "hello"

// Extract the concrete type
s := i.(string)
fmt.Println(s)  // hello

// Safe version with comma-ok
s, ok := i.(string)
if ok {
    fmt.Println("String:", s)
}

// Fails at runtime if wrong type
// n := i.(int)  // panic!
```

---

## Type Switch

A type switch tests an interface value against multiple types:

```go
func describe(i interface{}) {
    switch v := i.(type) {
    case int:
        fmt.Printf("Integer: %d\n", v)
    case float64:
        fmt.Printf("Float: %.2f\n", v)
    case string:
        fmt.Printf("String: %q (len %d)\n", v, len(v))
    case bool:
        fmt.Printf("Boolean: %t\n", v)
    case nil:
        fmt.Println("Nil value")
    default:
        fmt.Printf("Unknown type: %T\n", v)
    }
}

func main() {
    describe(42)        // Integer: 42
    describe(3.14)      // Float: 3.14
    describe("hello")   // String: "hello" (len 5)
    describe(true)      // Boolean: true
    describe(nil)       // Nil value
    describe([]int{})   // Unknown type: []int
}
```

> [!NOTE]
> `v := i.(type)` is special syntax that only works inside a `switch`. The variable `v` is automatically typed to the matched case.

---

## Multiple Types Per Case

```go
switch v := i.(type) {
case int, int64:
    fmt.Printf("Some integer: %v\n", v)
case float32, float64:
    fmt.Printf("Some float: %v\n", v)
}
```

When matching multiple types, `v` is typed as `interface{}`.

---

## Practical Example: JSON-Like Data

```go
func printJSON(data map[string]interface{}) {
    for key, val := range data {
        switch v := val.(type) {
        case string:
            fmt.Printf("  %s: %q\n", key, v)
        case float64:
            fmt.Printf("  %s: %.0f\n", key, v)
        case bool:
            fmt.Printf("  %s: %t\n", key, v)
        case []interface{}:
            fmt.Printf("  %s: [%d items]\n", key, len(v))
        case nil:
            fmt.Printf("  %s: null\n", key)
        default:
            fmt.Printf("  %s: (%T) %v\n", key, v, v)
        }
    }
}
```

---

## Type Assertion vs Type Switch

| Feature | Type Assertion | Type Switch |
|---------|---------------|-------------|
| Syntax | `x.(T)` | `switch x.(type)` |
| Single type check | ✅ | Overkill |
| Multiple type checks | Verbose | ✅ |
| Returns typed value | Yes | Yes (per case) |
| Can panic | Yes (without comma-ok) | No |

---

## Complete Example

```go
package main

import "fmt"

type Dog struct{ Name string }
type Cat struct{ Name string }

func (d Dog) Speak() string { return d.Name + " says Woof!" }
func (c Cat) Speak() string { return c.Name + " says Meow!" }

type Speaker interface {
    Speak() string
}

func react(s Speaker) {
    fmt.Println(s.Speak())

    switch animal := s.(type) {
    case Dog:
        fmt.Printf("  🐕 Good dog, %s!\n", animal.Name)
    case Cat:
        fmt.Printf("  🐱 Nice kitty, %s!\n", animal.Name)
    }
}

func main() {
    animals := []Speaker{
        Dog{Name: "Rex"},
        Cat{Name: "Whiskers"},
        Dog{Name: "Buddy"},
    }

    for _, a := range animals {
        react(a)
    }
}
```

Output:

```
Rex says Woof!
  🐕 Good dog, Rex!
Whiskers says Meow!
  🐱 Nice kitty, Whiskers!
Buddy says Woof!
  🐕 Good dog, Buddy!
```

---

Next: embedding and composition — Go's alternative to inheritance.
