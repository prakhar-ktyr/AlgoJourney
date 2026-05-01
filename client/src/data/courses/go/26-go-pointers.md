---
title: Go Pointers
---

# Go Pointers

A pointer holds the **memory address** of a value. Pointers let you share data efficiently and modify values in-place.

---

## Pointer Basics

```go
x := 42
p := &x   // p holds the address of x

fmt.Println(x)    // 42       — the value
fmt.Println(p)    // 0xc000... — the address
fmt.Println(*p)   // 42       — dereference: value at the address
```

- `&x` — "address of" x (creates a pointer)
- `*p` — "value at" p (dereferences the pointer)

---

## Modifying Values Through Pointers

```go
x := 10
p := &x

*p = 20
fmt.Println(x)   // 20 — x changed!
```

---

## Pointers as Function Parameters

```go
func increment(n *int) {
    *n++
}

func main() {
    x := 5
    increment(&x)
    fmt.Println(x)  // 6
}
```

Without a pointer, the function receives a **copy** and can't modify the original.

---

## Zero Value: `nil`

The zero value of a pointer is `nil`:

```go
var p *int
fmt.Println(p)        // <nil>
fmt.Println(p == nil) // true

// *p would panic — never dereference a nil pointer
```

> [!WARNING]
> Dereferencing a `nil` pointer causes a **runtime panic**. Always check for `nil` before dereferencing.

---

## The `new` Function

`new(T)` allocates memory for a value of type `T` and returns a pointer:

```go
p := new(int)    // *int pointing to 0
*p = 42
fmt.Println(*p)  // 42
```

Equivalent to:

```go
x := 0
p := &x
```

---

## Pointers to Structs

Go automatically dereferences struct pointers — no `->` operator needed:

```go
type Point struct {
    X, Y int
}

p := &Point{10, 20}
fmt.Println(p.X)     // 10 — Go dereferences automatically
// Same as (*p).X
```

Creating struct pointers directly:

```go
p := &Point{X: 5, Y: 10}
```

---

## When to Use Pointers

| Use pointers | Use values |
|-------------|------------|
| Modify the original data | Only reading data |
| Avoid copying large structs | Small types (int, bool, small structs) |
| Represent "absent" with `nil` | Always has a value |
| Consistency (all methods on a type) | Simple, immutable data |

---

## Pointers and Slices

Slices already contain an internal pointer to an array, so you rarely need a pointer to a slice:

```go
func addItem(s []string, item string) []string {
    return append(s, item)  // returns a new slice header
}
```

---

## No Pointer Arithmetic

Unlike C/C++, Go **does not allow** pointer arithmetic:

```go
p := &x
// p++      // ❌ Compile error
// p + 1    // ❌ Compile error
```

This eliminates a huge class of bugs.

---

## Complete Example

```go
package main

import "fmt"

type BankAccount struct {
    Owner   string
    Balance float64
}

func (a *BankAccount) Deposit(amount float64) {
    a.Balance += amount
}

func (a *BankAccount) Withdraw(amount float64) bool {
    if amount > a.Balance {
        return false
    }
    a.Balance -= amount
    return true
}

func swap(a, b *int) {
    *a, *b = *b, *a
}

func main() {
    acc := &BankAccount{Owner: "Alice", Balance: 100}
    acc.Deposit(50)
    fmt.Printf("%s: $%.2f\n", acc.Owner, acc.Balance)  // $150.00

    if ok := acc.Withdraw(200); !ok {
        fmt.Println("Insufficient funds!")
    }

    x, y := 1, 2
    swap(&x, &y)
    fmt.Printf("x=%d, y=%d\n", x, y)  // x=2, y=1
}
```

---

Next: interfaces — Go's most powerful abstraction mechanism.
