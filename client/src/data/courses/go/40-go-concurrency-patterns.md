---
title: Go Concurrency Patterns
---

# Go Concurrency Patterns

This lesson covers the most important concurrency patterns in Go: pipelines, fan-out/fan-in, worker pools, and context-based cancellation.

---

## Pipeline Pattern

A pipeline is a series of stages connected by channels. Each stage receives values, processes them, and sends results downstream:

```go
// Stage 1: Generate numbers
func generate(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums {
            out <- n
        }
        close(out)
    }()
    return out
}

// Stage 2: Square each number
func square(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            out <- n * n
        }
        close(out)
    }()
    return out
}

func main() {
    // Connect stages
    nums := generate(2, 3, 4, 5)
    results := square(nums)

    for r := range results {
        fmt.Println(r)  // 4, 9, 16, 25
    }
}
```

---

## Fan-Out

Start multiple goroutines reading from the same channel:

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        results <- j * j  // process
    }
}

func main() {
    jobs := make(chan int, 10)
    results := make(chan int, 10)

    // Fan-out: 3 workers read from the same channel
    for w := 0; w < 3; w++ {
        go worker(w, jobs, results)
    }

    for i := 1; i <= 9; i++ {
        jobs <- i
    }
    close(jobs)

    for i := 0; i < 9; i++ {
        fmt.Println(<-results)
    }
}
```

---

## Fan-In

Merge multiple channels into one:

```go
func fanIn(channels ...<-chan string) <-chan string {
    var wg sync.WaitGroup
    merged := make(chan string)

    for _, ch := range channels {
        wg.Add(1)
        go func(c <-chan string) {
            defer wg.Done()
            for val := range c {
                merged <- val
            }
        }(ch)
    }

    go func() {
        wg.Wait()
        close(merged)
    }()

    return merged
}
```

---

## Worker Pool

A fixed number of workers process jobs from a shared queue:

```go
func workerPool(numWorkers int, jobs <-chan int) <-chan int {
    results := make(chan int, len(jobs))
    var wg sync.WaitGroup

    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            for job := range jobs {
                // Simulate work
                time.Sleep(100 * time.Millisecond)
                results <- job * 2
            }
        }(i)
    }

    go func() {
        wg.Wait()
        close(results)
    }()

    return results
}
```

---

## Context Cancellation

Use `context.Context` to cancel goroutines:

```go
func longTask(ctx context.Context, id int) {
    for {
        select {
        case <-ctx.Done():
            fmt.Printf("Worker %d cancelled\n", id)
            return
        default:
            fmt.Printf("Worker %d working...\n", id)
            time.Sleep(500 * time.Millisecond)
        }
    }
}

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel()

    for i := 0; i < 3; i++ {
        go longTask(ctx, i)
    }

    <-ctx.Done()
    time.Sleep(100 * time.Millisecond) // let workers print
    fmt.Println("All workers stopped")
}
```

---

## Rate Limiting

Control how fast operations execute:

```go
limiter := time.NewTicker(200 * time.Millisecond)
defer limiter.Stop()

requests := []int{1, 2, 3, 4, 5}
for _, req := range requests {
    <-limiter.C  // wait for the next tick
    fmt.Printf("Processing request %d at %s\n", req,
        time.Now().Format("15:04:05.000"))
}
```

---

## Complete Example: Parallel URL Fetcher

```go
package main

import (
    "context"
    "fmt"
    "sync"
    "time"
)

type Result struct {
    URL      string
    Duration time.Duration
    Error    error
}

func fetch(ctx context.Context, url string) Result {
    start := time.Now()
    // Simulate HTTP request
    delay := time.Duration(len(url)*50) * time.Millisecond

    select {
    case <-time.After(delay):
        return Result{URL: url, Duration: time.Since(start)}
    case <-ctx.Done():
        return Result{URL: url, Error: ctx.Err()}
    }
}

func main() {
    urls := []string{
        "https://example.com",
        "https://golang.org",
        "https://github.com",
        "https://google.com",
    }

    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel()

    results := make(chan Result, len(urls))
    var wg sync.WaitGroup

    for _, url := range urls {
        wg.Add(1)
        go func(u string) {
            defer wg.Done()
            results <- fetch(ctx, u)
        }(url)
    }

    go func() {
        wg.Wait()
        close(results)
    }()

    fmt.Println("Fetch Results:")
    for r := range results {
        if r.Error != nil {
            fmt.Printf("  ❌ %s — %v\n", r.URL, r.Error)
        } else {
            fmt.Printf("  ✅ %s — %v\n", r.URL, r.Duration)
        }
    }
}
```

---

## Pattern Summary

| Pattern | Use Case |
|---------|----------|
| Pipeline | Sequential data transformation stages |
| Fan-Out | Parallelize CPU-bound work |
| Fan-In | Merge results from multiple sources |
| Worker Pool | Bounded concurrency for many tasks |
| Context | Cancellation and timeouts |
| Rate Limiter | Throttle operations |

---

Next: generics — writing type-safe, reusable code.
