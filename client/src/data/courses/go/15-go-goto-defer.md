---
title: Go Defer
---

# Go Defer

`defer` is one of Go's most distinctive features. It schedules a function call to run just before the surrounding function returns. It's essential for cleanup operations.

---

## Basic Defer

```go
func main() {
    fmt.Println("Start")
    defer fmt.Println("Deferred")
    fmt.Println("End")
}
```

Output:

```
Start
End
Deferred
```

The deferred call runs **after** `End` is printed, right before `main` returns.

---

## Why Use Defer?

Defer ensures cleanup code runs no matter how the function exits — even if it returns early or panics.

### File Handling

```go
func readFile(path string) error {
    f, err := os.Open(path)
    if err != nil {
        return err
    }
    defer f.Close()  // guaranteed to run

    // ... read the file ...
    // Close will happen automatically when function returns
    return nil
}
```

### Mutex Unlock

```go
func updateCounter() {
    mu.Lock()
    defer mu.Unlock()

    counter++
    // unlock happens automatically
}
```

> [!TIP]
> Place `defer` immediately after acquiring a resource. This keeps the "open" and "close" visually together and prevents forgetting to clean up.

---

## Defer Stack (LIFO)

Multiple defers execute in **Last In, First Out** order:

```go
func main() {
    defer fmt.Println("First deferred")
    defer fmt.Println("Second deferred")
    defer fmt.Println("Third deferred")
    fmt.Println("Main body")
}
```

Output:

```
Main body
Third deferred
Second deferred
First deferred
```

---

## Defer Evaluates Arguments Immediately

Arguments to deferred functions are evaluated **when the defer statement executes**, not when the deferred function runs:

```go
x := 10
defer fmt.Println("Deferred x =", x)  // captures x=10
x = 20
fmt.Println("Current x =", x)
```

Output:

```
Current x = 20
Deferred x = 10
```

To capture the value at execution time, use a closure:

```go
x := 10
defer func() {
    fmt.Println("Deferred x =", x)  // captures x by reference
}()
x = 20
```

Output: `Deferred x = 20`

---

## Defer in Loops

Be careful with defer in loops — defers don't run until the function returns:

```go
// ❌ Bad — all files stay open until function returns
func processFiles(paths []string) {
    for _, path := range paths {
        f, _ := os.Open(path)
        defer f.Close()  // won't close until function ends!
    }
}

// ✅ Good — wrap in a helper function
func processFiles(paths []string) {
    for _, path := range paths {
        processOne(path)
    }
}

func processOne(path string) {
    f, _ := os.Open(path)
    defer f.Close()  // closes when processOne returns
}
```

---

## Goto

Go supports `goto` but it's rarely used. It jumps to a labeled statement:

```go
func main() {
    i := 0
loop:
    if i >= 5 {
        goto done
    }
    fmt.Println(i)
    i++
    goto loop
done:
    fmt.Println("Finished")
}
```

> [!WARNING]
> Avoid `goto` in almost all cases. Use `for`, `break`, and `continue` instead. `goto` cannot jump over variable declarations.

---

## Complete Example

```go
package main

import "fmt"

func countdown() {
    fmt.Println("Starting countdown...")
    for i := 5; i > 0; i-- {
        defer fmt.Printf("  %d\n", i)
    }
    fmt.Println("Deferred numbers (reverse order):")
}

func divide(a, b float64) float64 {
    defer fmt.Println("  divide() completed")
    if b == 0 {
        fmt.Println("  Cannot divide by zero")
        return 0
    }
    return a / b
}

func main() {
    countdown()

    fmt.Println("\nDivision results:")
    fmt.Printf("  10 / 3 = %.2f\n", divide(10, 3))
    fmt.Printf("  10 / 0 = %.2f\n", divide(10, 0))
}
```

Output:

```
Starting countdown...
Deferred numbers (reverse order):
  1
  2
  3
  4
  5

Division results:
  divide() completed
  10 / 3 = 3.33
  Cannot divide by zero
  divide() completed
  10 / 0 = 0.00
```

---

## Key Takeaways

- `defer` schedules cleanup code to run when the function returns.
- Defers execute in LIFO (stack) order.
- Arguments are evaluated immediately; use closures for late binding.
- Always `defer` resource cleanup right after acquisition.
- Avoid `goto` — use structured control flow instead.

Next: Go's data structures, starting with arrays.
