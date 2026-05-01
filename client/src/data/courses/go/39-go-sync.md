---
title: Go Sync Primitives
---

# Go Sync Primitives

The `sync` package provides low-level synchronization primitives for when channels aren't the right fit.

---

## `sync.Mutex` — Mutual Exclusion

Protects shared data from concurrent access:

```go
type SafeCounter struct {
    mu    sync.Mutex
    count int
}

func (c *SafeCounter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.count++
}

func (c *SafeCounter) Value() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.count
}
```

```go
counter := &SafeCounter{}
var wg sync.WaitGroup

for i := 0; i < 1000; i++ {
    wg.Add(1)
    go func() {
        defer wg.Done()
        counter.Increment()
    }()
}

wg.Wait()
fmt.Println(counter.Value())  // 1000 (always correct)
```

---

## `sync.RWMutex` — Read/Write Mutex

Allows multiple readers OR one writer:

```go
type Cache struct {
    mu   sync.RWMutex
    data map[string]string
}

func (c *Cache) Get(key string) (string, bool) {
    c.mu.RLock()         // multiple readers OK
    defer c.mu.RUnlock()
    val, ok := c.data[key]
    return val, ok
}

func (c *Cache) Set(key, value string) {
    c.mu.Lock()          // exclusive write
    defer c.mu.Unlock()
    c.data[key] = value
}
```

> [!TIP]
> Use `RWMutex` when reads vastly outnumber writes — it allows concurrent reads for better performance.

---

## `sync.WaitGroup`

Wait for a group of goroutines to finish:

```go
var wg sync.WaitGroup

for i := 0; i < 5; i++ {
    wg.Add(1)
    go func(id int) {
        defer wg.Done()
        fmt.Printf("Worker %d done\n", id)
    }(i)
}

wg.Wait()  // blocks until counter reaches 0
```

- `Add(n)` — increment by n
- `Done()` — decrement by 1
- `Wait()` — block until counter is 0

---

## `sync.Once`

Execute a function exactly once, regardless of how many goroutines call it:

```go
var once sync.Once
var config *Config

func loadConfig() *Config {
    once.Do(func() {
        config = &Config{/* ... */}
        fmt.Println("Config loaded")
    })
    return config
}
```

```go
// All goroutines get the same config
var wg sync.WaitGroup
for i := 0; i < 10; i++ {
    wg.Add(1)
    go func() {
        defer wg.Done()
        cfg := loadConfig()  // "Config loaded" prints only once
        _ = cfg
    }()
}
wg.Wait()
```

---

## `sync.Map`

A concurrent-safe map (use instead of `map` + `Mutex` for certain patterns):

```go
var m sync.Map

m.Store("key1", "value1")
m.Store("key2", "value2")

val, ok := m.Load("key1")
if ok {
    fmt.Println(val)  // value1
}

m.Range(func(key, value any) bool {
    fmt.Printf("%s: %s\n", key, value)
    return true  // continue iteration
})
```

> [!NOTE]
> `sync.Map` is optimized for cases where keys are written once and read many times, or when goroutines access disjoint sets of keys. For other cases, use a regular map with `Mutex`.

---

## Channels vs Mutexes

| Use channels when... | Use mutexes when... |
|---------------------|---------------------|
| Transferring ownership of data | Protecting shared state |
| Coordinating goroutines | Simple counter/flag updates |
| Building pipelines | Cache or map access |

---

## Complete Example

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

type Stats struct {
    mu       sync.RWMutex
    counters map[string]int
}

func NewStats() *Stats {
    return &Stats{counters: make(map[string]int)}
}

func (s *Stats) Record(event string) {
    s.mu.Lock()
    defer s.mu.Unlock()
    s.counters[event]++
}

func (s *Stats) Get(event string) int {
    s.mu.RLock()
    defer s.mu.RUnlock()
    return s.counters[event]
}

func (s *Stats) Report() {
    s.mu.RLock()
    defer s.mu.RUnlock()
    for event, count := range s.counters {
        fmt.Printf("  %-12s %d\n", event, count)
    }
}

func main() {
    stats := NewStats()
    var wg sync.WaitGroup

    events := []string{"pageview", "click", "signup", "pageview", "click"}

    for _, event := range events {
        for i := 0; i < 100; i++ {
            wg.Add(1)
            go func(e string) {
                defer wg.Done()
                stats.Record(e)
                time.Sleep(time.Millisecond)
            }(event)
        }
    }

    wg.Wait()

    fmt.Println("Event Stats:")
    stats.Report()
}
```

---

Next: concurrency patterns — fan-in, fan-out, pipelines, and worker pools.
