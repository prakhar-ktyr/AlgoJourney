---
title: Concurrency in OOP
---

# Concurrency in OOP

**Concurrency** means multiple tasks executing overlapping in time. In OOP, this means multiple threads can access and modify the same objects, creating potential issues that require careful design.

---

## The Problem: Shared Mutable State

When multiple threads access the same object, things can go wrong:

```cpp
#include <iostream>
#include <thread>

class Counter {
public:
    int count = 0;

    void increment() {
        count++;  // NOT atomic! Read → modify → write
    }

    int getCount() { return count; }
};

// Two threads incrementing simultaneously
// Thread 1: counter.increment()  →  reads 5, writes 6
// Thread 2: counter.increment()  →  reads 5, writes 6 (lost update!)
// Expected: 7, Actual: 6
```

```csharp
class Counter {
    public int Count { get; private set; }

    public void Increment() {
        Count++;  // NOT atomic! Read → modify → write
    }

    public int GetCount() => Count;
}

// Two threads incrementing simultaneously
// Thread 1: counter.Increment()  →  reads 5, writes 6
// Thread 2: counter.Increment()  →  reads 5, writes 6 (lost update!)
// Expected: 7, Actual: 6
```

```java
class Counter {
    private int count = 0;

    void increment() {
        count++;  // NOT atomic! Read → modify → write
    }

    int getCount() {
        return count;
    }
}

// Two threads incrementing simultaneously
Counter counter = new Counter();
// Thread 1: counter.increment()  →  reads 5, writes 6
// Thread 2: counter.increment()  →  reads 5, writes 6 (lost update!)
// Expected: 7, Actual: 6
```

```python
import threading

class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1  # NOT atomic! Read → modify → write

    def get_count(self):
        return self.count

# Two threads incrementing simultaneously
# Thread 1: counter.increment()  →  reads 5, writes 6
# Thread 2: counter.increment()  →  reads 5, writes 6 (lost update!)
# Expected: 7, Actual: 6
```

```javascript
// JavaScript is single-threaded, but shared state issues arise with
// async operations or Web Workers
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count++;  // Safe in single-threaded JS
  }

  getCount() {
    return this.count;
  }
}

// In Web Workers with SharedArrayBuffer, race conditions CAN occur:
// const shared = new SharedArrayBuffer(4);
// const view = new Int32Array(shared);
// Use Atomics.add(view, 0, 1) for thread-safe operations
```

This is called a **race condition**.

---

## Thread Safety Strategies

| Strategy | How | When |
|----------|-----|------|
| **Synchronization** | Lock access to shared data | Mutable shared state |
| **Immutability** | Objects can't change | When practical |
| **Thread confinement** | Each thread has its own copy | Isolated tasks |
| **Atomic operations** | Hardware-level atomic instructions | Simple counters/flags |

---

## 1. Synchronization (Locks)

Ensure only one thread can access a method/block at a time:

```cpp
#include <iostream>
#include <thread>
#include <mutex>
#include <vector>

class SafeCounter {
private:
    int count = 0;
    std::mutex mtx;

public:
    void increment() {
        std::lock_guard<std::mutex> lock(mtx); // RAII lock
        count++;
    }

    int getCount() {
        std::lock_guard<std::mutex> lock(mtx);
        return count;
    }
};

int main() {
    SafeCounter counter;
    std::vector<std::thread> threads;

    for (int i = 0; i < 4; i++) {
        threads.emplace_back([&counter]() {
            for (int j = 0; j < 100000; j++)
                counter.increment();
        });
    }
    for (auto& t : threads) t.join();

    std::cout << counter.getCount() << "\n";  // 400000 (correct!)
    return 0;
}
```

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

class SafeCounter {
    private int _count;
    private readonly object _lock = new();

    public void Increment() {
        lock (_lock) {  // Only one thread at a time
            _count++;
        }
    }

    public int GetCount() {
        lock (_lock) {
            return _count;
        }
    }
}

// Usage
var counter = new SafeCounter();
var tasks = Enumerable.Range(0, 4).Select(_ =>
    Task.Run(() => {
        for (int i = 0; i < 100000; i++)
            counter.Increment();
    })
).ToArray();

Task.WaitAll(tasks);
Console.WriteLine(counter.GetCount());  // 400000 (correct!)
```

```java
class SafeCounter {
    private int count = 0;

    // Only one thread can execute this at a time
    synchronized void increment() {
        count++;
    }

    synchronized int getCount() {
        return count;
    }
}

// Synchronized blocks for finer control
class BankAccount {
    private double balance;
    private final Object lock = new Object();

    void transfer(BankAccount target, double amount) {
        synchronized (lock) {
            if (balance >= amount) {
                balance -= amount;
                target.deposit(amount);
            }
        }
    }

    synchronized void deposit(double amount) {
        balance += amount;
    }
}
```

```python
import threading

class SafeCounter:
    def __init__(self):
        self._count = 0
        self._lock = threading.Lock()

    def increment(self):
        with self._lock:  # Acquire lock, release automatically
            self._count += 1

    def get_count(self):
        with self._lock:
            return self._count

counter = SafeCounter()

def worker():
    for _ in range(100000):
        counter.increment()

threads = [threading.Thread(target=worker) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(counter.get_count())  # 400000 (correct!)
```

```javascript
// JavaScript uses async/await for concurrency (single-threaded event loop)
// For Web Workers with shared memory, use Atomics

// Mutex-like pattern using async/await
class AsyncLock {
  constructor() {
    this._locked = false;
    this._waiting = [];
  }

  async acquire() {
    while (this._locked) {
      await new Promise(resolve => this._waiting.push(resolve));
    }
    this._locked = true;
  }

  release() {
    this._locked = false;
    if (this._waiting.length > 0) {
      this._waiting.shift()();
    }
  }
}

class SafeCounter {
  constructor() {
    this.count = 0;
    this.lock = new AsyncLock();
  }

  async increment() {
    await this.lock.acquire();
    try {
      this.count++;
    } finally {
      this.lock.release();
    }
  }

  getCount() {
    return this.count;
  }
}
```

---

## 2. Immutability (Best Strategy)

If objects can't be modified, there are no race conditions:

```cpp
// Immutable — inherently thread-safe
class ImmutablePoint {
private:
    const int x;
    const int y;

public:
    ImmutablePoint(int x, int y) : x(x), y(y) {}

    int getX() const { return x; }
    int getY() const { return y; }

    // "Modification" creates a new object
    ImmutablePoint translate(int dx, int dy) const {
        return ImmutablePoint(x + dx, y + dy);
    }
};

// Safe to share across threads without any synchronization
ImmutablePoint p(3, 4);
```

```csharp
// Immutable — inherently thread-safe (using record)
record ImmutablePoint(int X, int Y) {
    // "Modification" creates a new object
    public ImmutablePoint Translate(int dx, int dy) =>
        new(X + dx, Y + dy);
}

// Safe to share across threads without any synchronization
var p = new ImmutablePoint(3, 4);
```

```java
// Immutable — inherently thread-safe
final class ImmutablePoint {
    private final int x;
    private final int y;

    ImmutablePoint(int x, int y) {
        this.x = x;
        this.y = y;
    }

    int getX() { return x; }
    int getY() { return y; }

    // "Modification" creates a new object
    ImmutablePoint translate(int dx, int dy) {
        return new ImmutablePoint(x + dx, y + dy);
    }
}

// Safe to share across threads without any synchronization
ImmutablePoint p = new ImmutablePoint(3, 4);
```

```python
from dataclasses import dataclass

# Immutable — inherently thread-safe
@dataclass(frozen=True)
class ImmutablePoint:
    x: int
    y: int

    def translate(self, dx, dy):
        # "Modification" creates a new object
        return ImmutablePoint(self.x + dx, self.y + dy)

# Safe to share across threads without any synchronization
p = ImmutablePoint(3, 4)
```

```javascript
// Immutable — inherently thread-safe (no mutation possible)
class ImmutablePoint {
  #x;
  #y;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;
    Object.freeze(this);
  }

  get x() { return this.#x; }
  get y() { return this.#y; }

  // "Modification" creates a new object
  translate(dx, dy) {
    return new ImmutablePoint(this.#x + dx, this.#y + dy);
  }
}

// Safe to share across workers without any synchronization
const p = new ImmutablePoint(3, 4);
```

---

## 3. Atomic Operations

For simple counters and flags, use atomic classes:

```cpp
#include <atomic>

class AtomicCounter {
private:
    std::atomic<int> count{0};

public:
    void increment() {
        count.fetch_add(1);  // Atomic — no lock needed
    }

    int getCount() {
        return count.load();
    }
};
```

```csharp
using System.Threading;

class AtomicCounter {
    private int _count;

    public void Increment() {
        Interlocked.Increment(ref _count);  // Atomic — no lock needed
    }

    public int GetCount() => Interlocked.CompareExchange(ref _count, 0, 0);
}
```

```java
import java.util.concurrent.atomic.AtomicInteger;

class AtomicCounter {
    private AtomicInteger count = new AtomicInteger(0);

    void increment() {
        count.incrementAndGet();  // Atomic — no synchronization needed
    }

    int getCount() {
        return count.get();
    }
}
```

```python
# Python doesn't have built-in atomic integers, but the GIL helps
# For explicit atomic-like behaviour, use threading.Lock or queue
import threading

class AtomicCounter:
    def __init__(self):
        self._count = 0
        self._lock = threading.Lock()

    def increment(self):
        with self._lock:
            self._count += 1

    def get_count(self):
        return self._count  # Single read is atomic under GIL
```

```javascript
// Using Atomics with SharedArrayBuffer (for Web Workers)
// const shared = new SharedArrayBuffer(4);
// const counter = new Int32Array(shared);

// Atomics.add(counter, 0, 1);     // Atomic increment
// Atomics.load(counter, 0);       // Atomic read

// Simple single-threaded atomic-like counter
class AtomicCounter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count++;  // Safe in single-threaded JS
  }

  getCount() {
    return this.count;
  }
}
```

---

## Thread-Safe OOP Patterns

### Thread-Safe Singleton

```cpp
#include <mutex>

class ThreadSafeSingleton {
private:
    static ThreadSafeSingleton* instance;
    static std::mutex mtx;

    ThreadSafeSingleton() {}

public:
    static ThreadSafeSingleton* getInstance() {
        std::lock_guard<std::mutex> lock(mtx);
        if (!instance) {
            instance = new ThreadSafeSingleton();
        }
        return instance;
    }
};

ThreadSafeSingleton* ThreadSafeSingleton::instance = nullptr;
std::mutex ThreadSafeSingleton::mtx;
```

```csharp
using System;

class ThreadSafeSingleton {
    private static readonly Lazy<ThreadSafeSingleton> _instance =
        new(() => new ThreadSafeSingleton());

    private ThreadSafeSingleton() { }

    public static ThreadSafeSingleton Instance => _instance.Value;
}
```

```java
class ThreadSafeSingleton {
    private static volatile ThreadSafeSingleton instance;

    private ThreadSafeSingleton() { }

    static ThreadSafeSingleton getInstance() {
        if (instance == null) {
            synchronized (ThreadSafeSingleton.class) {
                if (instance == null) {
                    instance = new ThreadSafeSingleton();
                }
            }
        }
        return instance;
    }
}
```

```python
import threading

class ThreadSafeSingleton:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
```

```javascript
// Module-level singleton (naturally thread-safe in JS)
class Singleton {
  static #instance = null;

  constructor() {
    if (Singleton.#instance) {
      return Singleton.#instance;
    }
    Singleton.#instance = this;
  }

  static getInstance() {
    if (!Singleton.#instance) {
      Singleton.#instance = new Singleton();
    }
    return Singleton.#instance;
  }
}
```

---

## Common Concurrency Problems

| Problem | Description | Prevention |
|---------|-------------|------------|
| **Race condition** | Two threads modify same data simultaneously | Synchronization, immutability |
| **Deadlock** | Two threads each wait for the other's lock | Lock ordering, timeout |
| **Starvation** | A thread never gets CPU time | Fair locks |
| **Livelock** | Threads keep responding to each other without progress | Randomized backoff |

---

## Async/Await and Task (C#)

C# has first-class `async`/`await` support with `Task` for concurrent programming:

```csharp
using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

class DataService {
    private readonly HttpClient _client = new();
    private readonly SemaphoreSlim _semaphore = new(1, 1);
    private string _cachedData;

    // Async method using Task
    public async Task<string> FetchDataAsync(string url) {
        await _semaphore.WaitAsync();  // Async lock
        try {
            if (_cachedData != null) return _cachedData;
            _cachedData = await _client.GetStringAsync(url);
            return _cachedData;
        } finally {
            _semaphore.Release();
        }
    }

    // Parallel execution
    public async Task<string[]> FetchMultipleAsync(string[] urls) {
        var tasks = urls.Select(url => _client.GetStringAsync(url));
        return await Task.WhenAll(tasks);  // Run all in parallel
    }
}

// Usage
var service = new DataService();
var data = await service.FetchDataAsync("https://api.example.com/data");
```

---

## Event Loop and Async Patterns (JavaScript)

JavaScript is **single-threaded** — it uses an event loop instead of OS threads for concurrency. Async work is handled via callbacks, Promises, and `async/await`.

```javascript
class DataService {
  #cache = new Map();

  async fetchJSON(url) {
    if (this.#cache.has(url)) {
      return this.#cache.get(url);
    }
    const response = await fetch(url);      // yields to event loop
    const data = await response.json();     // yields again
    this.#cache.set(url, data);
    return data;
  }

  async fetchMany(urls) {
    // Run requests concurrently (not in parallel threads)
    const results = await Promise.all(
      urls.map(url => this.fetchJSON(url))
    );
    return results;
  }
}

const service = new DataService();
const [users, posts] = await service.fetchMany(["/api/users", "/api/posts"]);
```

Because there's only one thread, you don't need mutexes — but you must avoid blocking the event loop with synchronous CPU-heavy work.

---

## Synchronized and Concurrent Collections (Java)

Java's `java.util.concurrent` package provides high-performance thread-safe data structures and executor services:

```java
import java.util.concurrent.*;

// ConcurrentHashMap — lock-free reads, segment-level locks for writes
ConcurrentHashMap<String, Integer> scores = new ConcurrentHashMap<>();
scores.put("Alice", 100);
scores.computeIfAbsent("Bob", k -> 0);  // atomic check-and-insert

// ExecutorService — managed thread pool
ExecutorService pool = Executors.newFixedThreadPool(4);

for (int i = 0; i < 10; i++) {
    final int task = i;
    pool.submit(() -> {
        scores.merge("Alice", 1, Integer::sum); // atomic increment
        System.out.println("Task " + task + " on " + Thread.currentThread().getName());
    });
}

pool.shutdown();
pool.awaitTermination(5, TimeUnit.SECONDS);
System.out.println("Final Alice score: " + scores.get("Alice")); // 110
```

---

## Key Takeaways

- **Shared mutable state** + **multiple threads** = potential bugs
- **Immutability** is the best defence — no mutations, no race conditions
- Use `std::mutex` (C++), `synchronized` (Java), `lock` (C#), `Lock` (Python) for mutable shared state
- C# uses `async`/`await`, `Task`, `lock`, `Interlocked`, and `SemaphoreSlim`
- JavaScript is single-threaded but uses `async/await`; use `Atomics` for shared memory with Workers
- Prefer **atomic operations** for simple counters
- Python's GIL limits true threading — use multiprocessing for CPU tasks
- Thread-safe design is a critical skill for production OOP applications

Next: **Serialization and Persistence** — saving and loading objects.
