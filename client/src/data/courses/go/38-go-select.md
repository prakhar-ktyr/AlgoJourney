---
title: Go Select
---

# Go Select

`select` lets a goroutine wait on multiple channel operations simultaneously. It's like a `switch` for channels.

---

## Basic Select

```go
ch1 := make(chan string)
ch2 := make(chan string)

go func() {
    time.Sleep(100 * time.Millisecond)
    ch1 <- "one"
}()

go func() {
    time.Sleep(200 * time.Millisecond)
    ch2 <- "two"
}()

select {
case msg := <-ch1:
    fmt.Println("Received from ch1:", msg)
case msg := <-ch2:
    fmt.Println("Received from ch2:", msg)
}
// Receives from whichever channel is ready first
```

---

## Select Rules

- If **multiple** cases are ready, one is chosen **randomly**.
- If **no** case is ready, `select` blocks until one becomes ready.
- `default` makes it non-blocking.

---

## Default Case (Non-Blocking)

```go
select {
case msg := <-ch:
    fmt.Println("Received:", msg)
default:
    fmt.Println("No message available")
}
```

---

## Timeouts

```go
select {
case result := <-ch:
    fmt.Println("Got:", result)
case <-time.After(2 * time.Second):
    fmt.Println("Timeout!")
}
```

> [!TIP]
> `time.After` returns a channel that sends after the specified duration — perfect for timeouts.

---

## Select in a Loop

```go
func main() {
    tick := time.NewTicker(500 * time.Millisecond)
    done := make(chan bool)

    go func() {
        time.Sleep(2 * time.Second)
        done <- true
    }()

    for {
        select {
        case <-done:
            fmt.Println("Done!")
            tick.Stop()
            return
        case t := <-tick.C:
            fmt.Println("Tick at", t.Format("15:04:05.000"))
        }
    }
}
```

---

## Nil Channels in Select

A nil channel always blocks. Use this to disable a case:

```go
var ch1, ch2 chan int
ch1 = make(chan int, 1)
ch1 <- 42

select {
case v := <-ch1:
    fmt.Println("ch1:", v)
case v := <-ch2:  // ch2 is nil — this case is never selected
    fmt.Println("ch2:", v)
}
```

---

## Complete Example

```go
package main

import (
    "fmt"
    "math/rand"
    "time"
)

func search(query string, ch chan<- string) {
    delay := time.Duration(rand.Intn(500)) * time.Millisecond
    time.Sleep(delay)
    ch <- fmt.Sprintf("Result for %q (took %v)", query, delay)
}

func main() {
    ch1 := make(chan string, 1)
    ch2 := make(chan string, 1)
    ch3 := make(chan string, 1)

    go search("web", ch1)
    go search("images", ch2)
    go search("videos", ch3)

    timeout := time.After(300 * time.Millisecond)
    results := 0

    for results < 3 {
        select {
        case r := <-ch1:
            fmt.Println(" ", r)
            results++
            ch1 = nil // disable this case
        case r := <-ch2:
            fmt.Println(" ", r)
            results++
            ch2 = nil
        case r := <-ch3:
            fmt.Println(" ", r)
            results++
            ch3 = nil
        case <-timeout:
            fmt.Println("  ⏰ Timeout — returning partial results")
            goto done
        }
    }
done:
    fmt.Printf("\nGot %d/3 results\n", results)
}
```

---

Next: sync primitives — mutexes, WaitGroup, and Once.
