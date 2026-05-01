---
title: Go Reflection
---

# Go Reflection

The `reflect` package lets you inspect and manipulate types and values at runtime. It powers JSON encoding, ORM libraries, and template engines.

---

## When to Use Reflection

- Building generic serializers (JSON, XML, databases)
- Writing test assertions
- Building dependency injection frameworks
- Reading struct tags at runtime

> [!WARNING]
> Reflection is powerful but slow and loses type safety. Prefer generics or interfaces when possible. Reflection is a last resort.

---

## `reflect.TypeOf` and `reflect.ValueOf`

```go
import "reflect"

x := 42
t := reflect.TypeOf(x)
v := reflect.ValueOf(x)

fmt.Println("Type:", t)          // int
fmt.Println("Value:", v)         // 42
fmt.Println("Kind:", t.Kind())   // int
```

---

## Kind vs Type

```go
type UserID int

var id UserID = 42
t := reflect.TypeOf(id)

fmt.Println("Type:", t)         // main.UserID
fmt.Println("Kind:", t.Kind())  // int
```

`Type` is the specific named type; `Kind` is the underlying category.

---

## Inspecting Structs

```go
type User struct {
    Name  string `json:"name" validate:"required"`
    Age   int    `json:"age"`
    Email string `json:"email,omitempty"`
}

u := User{Name: "Alice", Age: 30, Email: "alice@example.com"}
t := reflect.TypeOf(u)
v := reflect.ValueOf(u)

fmt.Printf("Struct: %s (%d fields)\n", t.Name(), t.NumField())

for i := 0; i < t.NumField(); i++ {
    field := t.Field(i)
    value := v.Field(i)
    tag := field.Tag.Get("json")

    fmt.Printf("  %s (%s) = %v  [json: %s]\n",
        field.Name, field.Type, value, tag)
}
```

Output:

```
Struct: User (3 fields)
  Name (string) = Alice  [json: name]
  Age (int) = 30  [json: age]
  Email (string) = alice@example.com  [json: email,omitempty]
```

---

## Reading Struct Tags

```go
field, _ := reflect.TypeOf(User{}).FieldByName("Email")
jsonTag := field.Tag.Get("json")        // "email,omitempty"
validateTag := field.Tag.Get("validate") // ""
```

---

## Modifying Values

You must use a pointer to modify values through reflection:

```go
x := 42
v := reflect.ValueOf(&x).Elem()  // Elem() gets the pointed-to value

v.SetInt(100)
fmt.Println(x)  // 100
```

---

## Calling Functions

```go
fn := reflect.ValueOf(fmt.Println)
args := []reflect.Value{reflect.ValueOf("Hello via reflection!")}
fn.Call(args)
```

---

## Complete Example

```go
package main

import (
    "fmt"
    "reflect"
)

func printFields(v interface{}) {
    val := reflect.ValueOf(v)
    typ := val.Type()

    if typ.Kind() == reflect.Ptr {
        val = val.Elem()
        typ = val.Type()
    }

    if typ.Kind() != reflect.Struct {
        fmt.Println("Not a struct")
        return
    }

    fmt.Printf("%s:\n", typ.Name())
    for i := 0; i < typ.NumField(); i++ {
        field := typ.Field(i)
        value := val.Field(i)
        fmt.Printf("  %-10s %-10s = %v\n", field.Name, field.Type, value)
    }
}

type Config struct {
    Host    string
    Port    int
    Debug   bool
    Workers int
}

func main() {
    cfg := Config{
        Host:    "localhost",
        Port:    8080,
        Debug:   true,
        Workers: 4,
    }

    printFields(cfg)
}
```

Output:

```
Config:
  Host       string     = localhost
  Port       int        = 8080
  Debug      bool       = true
  Workers    int        = 4
```

---

Next: Go build tools and development workflow.
