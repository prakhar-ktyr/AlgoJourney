---
title: Go Context
---

# Go Context

The `context` package manages cancellation signals, deadlines, and request-scoped values across API boundaries and goroutines.

---

## Why Context?

When a user cancels an HTTP request, you want to stop all downstream work — database queries, API calls, goroutines. Context propagates that "stop" signal.

---

## Creating Contexts

```go
// Root context — never cancelled
ctx := context.Background()

// For uncertain/placeholder situations
ctx := context.TODO()
```

---

## WithCancel

```go
ctx, cancel := context.WithCancel(context.Background())
defer cancel()  // always call cancel to release resources

go func(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            fmt.Println("Worker stopped:", ctx.Err())
            return
        default:
            fmt.Println("Working...")
            time.Sleep(500 * time.Millisecond)
        }
    }
}(ctx)

time.Sleep(2 * time.Second)
cancel()  // signal all goroutines to stop
time.Sleep(100 * time.Millisecond)
```

---

## WithTimeout

```go
ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
defer cancel()

select {
case result := <-doWork(ctx):
    fmt.Println("Result:", result)
case <-ctx.Done():
    fmt.Println("Timed out:", ctx.Err())
}
```

---

## WithDeadline

```go
deadline := time.Now().Add(5 * time.Second)
ctx, cancel := context.WithDeadline(context.Background(), deadline)
defer cancel()
```

`WithTimeout(ctx, d)` is shorthand for `WithDeadline(ctx, time.Now().Add(d))`.

---

## WithValue

Attach request-scoped values (use sparingly):

```go
type contextKey string

const userKey contextKey = "user"

ctx := context.WithValue(context.Background(), userKey, "Alice")

// Retrieve
user := ctx.Value(userKey).(string)
fmt.Println(user)  // Alice
```

> [!WARNING]
> Don't use `WithValue` for optional function parameters. It's for cross-cutting concerns like request IDs, user info, and tracing data.

---

## Context in HTTP Servers

Every HTTP request carries a context:

```go
func handler(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()

    result, err := fetchData(ctx)
    if err != nil {
        if ctx.Err() == context.Canceled {
            return  // client disconnected
        }
        http.Error(w, err.Error(), 500)
        return
    }

    json.NewEncoder(w).Encode(result)
}
```

---

## Passing Context Down

Context should flow through your call chain:

```go
func handleOrder(ctx context.Context, orderID int) error {
    user, err := getUser(ctx, orderID)
    if err != nil {
        return err
    }

    items, err := getItems(ctx, orderID)
    if err != nil {
        return err
    }

    return processPayment(ctx, user, items)
}
```

> [!TIP]
> Context should be the **first parameter** of every function that does I/O or might need cancellation. This is a strong Go convention.

---

## Complete Example

```go
package main

import (
    "context"
    "fmt"
    "time"
)

func fetchAPI(ctx context.Context, url string) (string, error) {
    // Simulate slow API call
    select {
    case <-time.After(2 * time.Second):
        return fmt.Sprintf("Data from %s", url), nil
    case <-ctx.Done():
        return "", fmt.Errorf("fetch %s: %w", url, ctx.Err())
    }
}

func main() {
    // With enough time
    ctx1, cancel1 := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel1()

    result, err := fetchAPI(ctx1, "https://api.example.com")
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("Success:", result)
    }

    // With too little time
    ctx2, cancel2 := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel2()

    result, err = fetchAPI(ctx2, "https://api.slow.com")
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("Success:", result)
    }
}
```

Output:

```
Success: Data from https://api.example.com
Error: fetch https://api.slow.com: context deadline exceeded
```

---

Next: reflection — inspecting types at runtime.
