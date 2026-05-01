---
title: Go Closures
---

# Go Closures & Anonymous Functions

Go supports **anonymous functions** (functions without names) and **closures** (functions that capture variables from their enclosing scope).

---

## Anonymous Functions

```go
func main() {
    // Define and call immediately
    func() {
        fmt.Println("I'm anonymous!")
    }()

    // Assign to a variable
    greet := func(name string) {
        fmt.Printf("Hello, %s!\n", name)
    }

    greet("Alice")
    greet("Bob")
}
```

---

## Closures

A closure is a function that references variables from outside its body. The function "closes over" those variables:

```go
func counter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}

func main() {
    next := counter()

    fmt.Println(next())  // 1
    fmt.Println(next())  // 2
    fmt.Println(next())  // 3

    // A new counter has its own state
    other := counter()
    fmt.Println(other()) // 1
}
```

Each call to `counter()` creates a new `count` variable. The returned function has exclusive access to it.

---

## Closures Capture by Reference

Closures hold a **reference** to the outer variable, not a copy:

```go
x := 10
modify := func() {
    x = 20
}
modify()
fmt.Println(x)  // 20 — x was modified
```

---

## Common Closure Pitfall with Loops

```go
// ❌ Bug — all closures share the same variable
funcs := []func(){}
for i := 0; i < 3; i++ {
    funcs = append(funcs, func() {
        fmt.Println(i)  // captures loop variable by reference
    })
}
for _, f := range funcs {
    f()  // prints: 3, 3, 3 (not 0, 1, 2!)
}
```

Fix by shadowing the variable:

```go
// ✅ Fixed — each closure gets its own copy
for i := 0; i < 3; i++ {
    i := i  // shadow with a new variable
    funcs = append(funcs, func() {
        fmt.Println(i)
    })
}
```

> [!NOTE]
> Starting with Go 1.22, the `for` loop creates a new variable per iteration by default, fixing this issue.

---

## Higher-Order Functions

Functions that take or return other functions:

```go
func filter(nums []int, test func(int) bool) []int {
    var result []int
    for _, n := range nums {
        if test(n) {
            result = append(result, n)
        }
    }
    return result
}

func main() {
    nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

    evens := filter(nums, func(n int) bool {
        return n%2 == 0
    })
    fmt.Println(evens)  // [2 4 6 8 10]

    big := filter(nums, func(n int) bool {
        return n > 5
    })
    fmt.Println(big)  // [6 7 8 9 10]
}
```

---

## Complete Example

```go
package main

import "fmt"

// Multiplier returns a closure that multiplies by n
func multiplier(n int) func(int) int {
    return func(x int) int {
        return x * n
    }
}

// Accumulator returns a closure that keeps a running sum
func accumulator() func(int) int {
    sum := 0
    return func(n int) int {
        sum += n
        return sum
    }
}

func main() {
    double := multiplier(2)
    triple := multiplier(3)

    fmt.Println(double(5))  // 10
    fmt.Println(triple(5))  // 15

    acc := accumulator()
    fmt.Println(acc(10))  // 10
    fmt.Println(acc(20))  // 30
    fmt.Println(acc(5))   // 35
}
```

---

Next: recursion in Go.
