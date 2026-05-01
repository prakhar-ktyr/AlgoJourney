---
title: Go Goroutines
---

# Go Goroutines

Goroutines are lightweight threads managed by the Go runtime. They're the foundation of Go's concurrency model and what makes Go uniquely suited for concurrent programming.

---

## Launching a Goroutine

Simply prefix a function call with `go`:

```go
func sayHello() {
    fmt.Println("Hello from goroutine!")
}

func main() {
    go sayHello()            // runs concurrently
    fmt.Println("Hello from main!")
    time.Sleep(time.Second)  // wait for goroutine to finish
}
```

Output (order may vary):

```
Hello from main!
Hello from goroutine!
```

---

## Anonymous Goroutines

```go
go func() {
    fmt.Println("Anonymous goroutine!")
}()

go func(msg string) {
    fmt.Println(msg)
}("Hello!")
```

---

## Goroutines Are Lightweight

Goroutines start with just a few KB of stack (vs ~1 MB for OS threads). You can run **millions** of them:

```go
for i := 0; i < 100_000; i++ {
    go func(n int) {
        _ = n * n
    }(i)
}
```

> [!NOTE]
> Goroutines are multiplexed onto OS threads by the Go runtime scheduler. This is called **M:N scheduling** — M goroutines on N OS threads.

---

## The Problem with `time.Sleep`

Using `time.Sleep` to wait for goroutines is fragile. Use `sync.WaitGroup` instead:

```go
import "sync"

func main() {
    var wg sync.WaitGroup

    for i := 0; i < 5; i++ {
        wg.Add(1)
        go func(n int) {
            defer wg.Done()
            fmt.Printf("Worker %d done\n", n)
        }(i)
    }

    wg.Wait()  // blocks until all goroutines call Done()
    fmt.Println("All workers finished")
}
```

---

## Goroutines and Closures

Be careful with loop variables:

```go
// ❌ Bug in Go < 1.22
for i := 0; i < 5; i++ {
    go func() {
        fmt.Println(i)  // may print 5 five times
    }()
}

// ✅ Fixed — pass as argument
for i := 0; i < 5; i++ {
    go func(n int) {
        fmt.Println(n)
    }(i)
}
```

> [!TIP]
> Go 1.22+ creates a new loop variable per iteration, fixing this issue. For older versions, always pass loop variables as arguments.

---

## Main Goroutine

`main()` itself runs in a goroutine. When `main` returns, **all goroutines are killed** — even if they haven't finished:

```go
func main() {
    go func() {
        time.Sleep(5 * time.Second)
        fmt.Println("This never prints")
    }()
    // main exits immediately → goroutine is killed
}
```

---

## Complete Example

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

func worker(id int, wg *sync.WaitGroup) {
    defer wg.Done()

    start := time.Now()
    // Simulate work
    time.Sleep(time.Duration(id*100) * time.Millisecond)
    fmt.Printf("Worker %d finished in %v\n", id, time.Since(start))
}

func main() {
    start := time.Now()
    var wg sync.WaitGroup

    for i := 1; i <= 5; i++ {
        wg.Add(1)
        go worker(i, &wg)
    }

    wg.Wait()
    fmt.Printf("\nAll done in %v\n", time.Since(start))
}
```

Output:

```
Worker 1 finished in 100ms
Worker 2 finished in 200ms
Worker 3 finished in 300ms
Worker 4 finished in 400ms
Worker 5 finished in 500ms

All done in 500ms
```

All workers ran concurrently — total time ≈ longest worker, not the sum.

---

Next: channels — how goroutines communicate safely.
