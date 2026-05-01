---
title: Go Channels
---

# Go Channels

Channels are Go's primary mechanism for communication between goroutines. They provide a way to send and receive values safely.

> "Don't communicate by sharing memory; share memory by communicating." — Go Proverb

---

## Creating Channels

```go
ch := make(chan int)          // unbuffered channel of ints
ch2 := make(chan string, 5)   // buffered channel with capacity 5
```

---

## Sending and Receiving

```go
ch := make(chan string)

// Send (in a goroutine — unbuffered channels block)
go func() {
    ch <- "hello"    // send
}()

msg := <-ch          // receive
fmt.Println(msg)     // hello
```

- `ch <- value` — send a value to the channel
- `value := <-ch` — receive a value from the channel

---

## Unbuffered Channels

An unbuffered channel **blocks** until both sender and receiver are ready:

```go
ch := make(chan int)

go func() {
    ch <- 42     // blocks until someone receives
}()

val := <-ch      // blocks until someone sends
fmt.Println(val) // 42
```

This creates a **synchronization point** between goroutines.

---

## Buffered Channels

Buffered channels hold values without blocking until the buffer is full:

```go
ch := make(chan int, 3)

ch <- 1  // doesn't block
ch <- 2  // doesn't block
ch <- 3  // doesn't block
// ch <- 4  // would block — buffer is full!

fmt.Println(<-ch)  // 1
fmt.Println(<-ch)  // 2
```

---

## Channel Direction

Restrict channels to send-only or receive-only in function signatures:

```go
func producer(ch chan<- int) {   // send-only
    ch <- 42
}

func consumer(ch <-chan int) {   // receive-only
    val := <-ch
    fmt.Println(val)
}
```

> [!TIP]
> Use directional channels in function parameters to document intent and prevent misuse.

---

## Closing Channels

Close a channel to signal no more values will be sent:

```go
ch := make(chan int, 5)

go func() {
    for i := 0; i < 5; i++ {
        ch <- i
    }
    close(ch)  // signal done
}()

for val := range ch {
    fmt.Println(val)  // 0, 1, 2, 3, 4
}
```

Check if a channel is closed:

```go
val, ok := <-ch
if !ok {
    fmt.Println("Channel closed")
}
```

> [!WARNING]
> Only the **sender** should close a channel. Sending on a closed channel causes a panic.

---

## Range Over Channels

`for range` reads until the channel is closed:

```go
for msg := range ch {
    fmt.Println(msg)
}
// Loop exits when ch is closed
```

---

## Complete Example

```go
package main

import (
    "fmt"
    "time"
)

func produce(ch chan<- int) {
    for i := 1; i <= 5; i++ {
        fmt.Printf("Producing: %d\n", i)
        ch <- i
        time.Sleep(200 * time.Millisecond)
    }
    close(ch)
}

func main() {
    ch := make(chan int, 2)

    go produce(ch)

    for val := range ch {
        fmt.Printf("  Consumed: %d\n", val)
    }

    fmt.Println("Done!")
}
```

Output:

```
Producing: 1
Producing: 2
  Consumed: 1
  Consumed: 2
Producing: 3
Producing: 4
  Consumed: 3
  Consumed: 4
Producing: 5
  Consumed: 5
Done!
```

---

Next: `select` — multiplexing across multiple channels.
