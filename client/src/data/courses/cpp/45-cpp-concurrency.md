---
title: C++ Concurrency
---

# C++ Concurrency

C++11 added a portable threading API. Today the standard library covers threads, mutexes, condition variables, atomics, futures, and (in C++20) coroutines.

> Compile thread-aware code with `-pthread` on GCC/Clang.

## `std::thread`

```cpp
#include <thread>
#include <iostream>

void work(int id) {
    std::cout << "hello from thread " << id << '\n';
}

int main() {
    std::thread t(work, 1);
    t.join();                   // wait for it to finish
}
```

Every `std::thread` must be **joined** or **detached** before its destructor runs, or the program calls `std::terminate`.

C++20 introduces `std::jthread` — joins automatically and supports cancellation:

```cpp
#include <thread>
std::jthread t([](std::stop_token st) {
    while (!st.stop_requested()) { /* loop */ }
});
// t.request_stop() then auto-joins on destruction
```

## Sharing data with `std::mutex`

```cpp
#include <mutex>

std::mutex m;
int counter = 0;

void bump() {
    std::lock_guard<std::mutex> lock(m);    // locks now, unlocks at scope exit
    ++counter;
}
```

`std::scoped_lock` (C++17) handles **multiple** mutexes deadlock-free:

```cpp
std::scoped_lock lock(mutexA, mutexB);
```

For shared/exclusive (read/write) access, use `std::shared_mutex` with `std::shared_lock` for readers and `std::unique_lock` for writers.

## `std::condition_variable`

A producer/consumer wait-and-signal primitive:

```cpp
#include <condition_variable>
#include <queue>

std::mutex m;
std::condition_variable cv;
std::queue<int> q;

void producer() {
    {
        std::lock_guard lock(m);
        q.push(42);
    }
    cv.notify_one();
}

void consumer() {
    std::unique_lock lock(m);
    cv.wait(lock, [] { return !q.empty(); });   // sleep until predicate is true
    int v = q.front(); q.pop();
}
```

Always wait with a predicate to handle spurious wake-ups.

## `std::atomic`

Lock-free primitives for simple counters and flags:

```cpp
#include <atomic>

std::atomic<int> counter = 0;
counter.fetch_add(1, std::memory_order_relaxed);
int now = counter.load();
```

`std::atomic_flag` is a guaranteed lock-free boolean used to implement spinlocks.

## Futures and async

Run a function on another thread and get a result back:

```cpp
#include <future>

int slowSum(int a, int b) { /* ... */ return a + b; }

auto fut = std::async(std::launch::async, slowSum, 2, 3);
// ... do other work ...
int result = fut.get();        // blocks until ready
```

`std::promise<T>` / `std::future<T>` lets one thread hand a value (or exception) to another explicitly.

## Thread pools

The standard library doesn't yet ship a thread pool — for production work use one from your runtime (TBB, Folly, Asio, `std::execution` with parallel algorithms, etc.). C++26 is expected to add `std::thread_pool` and `std::execution`.

Until then, parallel algorithms (C++17) are a nice middle ground:

```cpp
#include <execution>
std::sort(std::execution::par, v.begin(), v.end());
```

## Coroutines (C++20)

Coroutines suspend and resume — perfect for async I/O and generators. The standard provides the language plumbing (`co_await`, `co_yield`, `co_return`) but leaves the higher-level types to libraries (e.g. `cppcoro`, `stdexec`):

```cpp
#include <coroutine>
// Skeleton — real generators need a promise_type.
generator<int> integers() {
    for (int i = 0; ; ++i) co_yield i;
}
```

## Memory model basics

- C++ has a **happens-before** model based on synchronisation operations.
- `std::memory_order` controls ordering: `relaxed`, `acquire`, `release`, `acq_rel`, `seq_cst` (default, strongest).
- Default to `seq_cst`. Only weaken when profiling proves it matters and you understand the implications.

## Common pitfalls

- **Data races** — concurrent unsynchronised access to the same variable is undefined behavior.
- **Deadlocks** — always lock multiple mutexes in a fixed order, or use `std::scoped_lock`.
- **False sharing** — independent atomics on the same cache line slow each other down. Pad them apart.
- **Detached threads outliving needed data** — references can dangle. Prefer `jthread` and explicit ownership.

## Putting it together

```cpp
#include <chrono>
#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

std::mutex io;
void worker(int id) {
    std::this_thread::sleep_for(std::chrono::milliseconds(50 * id));
    std::lock_guard lock(io);
    std::cout << "worker " << id << " done\n";
}

int main() {
    std::vector<std::jthread> pool;
    for (int i = 1; i <= 4; ++i)
        pool.emplace_back(worker, i);
    // jthreads join automatically when 'pool' is destroyed
}
```

This was the final lesson in the C++ tutorial — congratulations! From here, build something real: a small game, a CLI tool, a benchmark harness. Read other people's code (the standard library headers, popular open source projects) and keep an eye on what each new C++ standard brings.
