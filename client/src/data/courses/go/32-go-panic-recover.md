---
title: Go Panic and Recover
---

# Go Panic & Recover

`panic` and `recover` handle truly exceptional situations in Go — things that should never happen during normal operation.

---

## Panic

`panic` stops normal execution, runs deferred functions, then crashes:

```go
func main() {
    fmt.Println("Start")
    panic("something terrible happened")
    fmt.Println("End")  // never reached
}
```

Output:

```
Start
panic: something terrible happened

goroutine 1 [running]:
main.main()
    /path/main.go:4 +0x...
```

---

## When Does Panic Happen?

Built-in panics:
- **Index out of range** — `arr[10]` on a 5-element slice
- **Nil pointer dereference** — calling a method on a nil pointer
- **Sending on a closed channel**
- **Type assertion failure** — `x.(int)` when x is a string

---

## Recover

`recover` catches a panic and lets the program continue. It only works inside a **deferred function**:

```go
func safeDivide(a, b int) (result int, err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("recovered: %v", r)
        }
    }()

    return a / b, nil  // panics if b == 0
}

func main() {
    result, err := safeDivide(10, 0)
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("Result:", result)
    }
}
```

Output: `Error: recovered: runtime error: integer divide by zero`

---

## Panic vs Errors

| Use `error` when... | Use `panic` when... |
|---------------------|---------------------|
| Failure is expected (file not found, bad input) | Something impossible happened (programmer bug) |
| Caller should decide what to do | Continuing would corrupt data |
| It's part of the public API | Unrecoverable state |

> [!IMPORTANT]
> In Go, **errors are the norm**, panic is the exception. Most Go programs never use `panic` explicitly. Prefer returning `error` values.

---

## Recover in HTTP Servers

A common use: prevent one bad request from crashing the entire server:

```go
func recoveryMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                http.Error(w, "Internal Server Error", 500)
                log.Printf("panic: %v", err)
            }
        }()
        next.ServeHTTP(w, r)
    })
}
```

---

## Complete Example

```go
package main

import "fmt"

func mustParse(s string) int {
    var result int
    for _, ch := range s {
        if ch < '0' || ch > '9' {
            panic(fmt.Sprintf("invalid character: %c", ch))
        }
        result = result*10 + int(ch-'0')
    }
    return result
}

func tryParse(s string) (n int, err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("%v", r)
        }
    }()
    return mustParse(s), nil
}

func main() {
    // Safe wrapper
    inputs := []string{"123", "45x", "789"}
    for _, s := range inputs {
        n, err := tryParse(s)
        if err != nil {
            fmt.Printf("  %q → Error: %v\n", s, err)
        } else {
            fmt.Printf("  %q → %d\n", s, n)
        }
    }
}
```

Output:

```
  "123" → 123
  "45x" → Error: invalid character: x
  "789" → 789
```

---

## Key Takeaways

- `panic` is for truly exceptional, unrecoverable situations.
- `recover` only works in deferred functions.
- Prefer returning `error` over panicking.
- Use `recover` in server middleware to prevent crashes.
- Never use panic for normal control flow.

Next: organizing code with packages.
