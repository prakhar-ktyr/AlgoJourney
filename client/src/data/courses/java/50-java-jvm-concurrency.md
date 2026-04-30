---
title: Java Threads, Concurrency, and the JVM
---

# Java Threads, Concurrency, and the JVM

Modern programs do many things at once: serve thousands of requests, fetch from disk while painting the screen, parallelise CPU-heavy work. Java has had built-in concurrency since day one, and it has matured dramatically. This final lesson is a guided tour of threads, the high-level concurrency tools, and the JVM that runs it all.

## Threads

A **thread** is an independent flow of execution. Every JVM starts with one — the _main_ thread — that runs `main()`. You can create more.

```java
public class HelloThread {
    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                System.out.println("worker " + i);
            }
        });

        t.start();                  // run the lambda on a new thread
        for (int i = 0; i < 3; i++) {
            System.out.println("main " + i);
        }
        t.join();                    // wait for t to finish
    }
}
```

Output is interleaved — the OS scheduler decides the order:

```
main 0
worker 0
main 1
worker 1
worker 2
main 2
```

`start()` runs the runnable on a new thread. `run()` (don't call it directly) runs it on the current thread.

## The trouble with shared mutable state

```java
class Counter {
    int value;
    void increment() { value++; }
}

Counter c = new Counter();
Thread a = new Thread(() -> { for (int i = 0; i < 100_000; i++) c.increment(); });
Thread b = new Thread(() -> { for (int i = 0; i < 100_000; i++) c.increment(); });
a.start(); b.start(); a.join(); b.join();
System.out.println(c.value);    // probably NOT 200000
```

`value++` is **read, modify, write** — three steps. Two threads can interleave their reads and overwrite each other. This is a **race condition**.

## Synchronization

The simplest fix is `synchronized` — each method or block locks the object's intrinsic lock so only one thread runs at a time.

```java
class Counter {
    int value;
    synchronized void increment() { value++; }
}
```

Now `value` always reaches 200 000.

You can also synchronise an explicit block:

```java
synchronized (lockObject) {
    // critical section
}
```

## `volatile`

Use `volatile` for simple visibility — when one thread sets a flag and another reads it:

```java
class Worker implements Runnable {
    private volatile boolean running = true;
    public void stop() { running = false; }
    public void run() {
        while (running) { /* work */ }
    }
}
```

Without `volatile`, the reader thread might cache the old value forever and never see the change.

For anything more complex (counters, increments, compare-and-set) use the **`java.util.concurrent.atomic`** classes.

## Atomic classes

Lock-free, thread-safe primitives:

```java
import java.util.concurrent.atomic.AtomicInteger;

AtomicInteger counter = new AtomicInteger();
counter.incrementAndGet();
counter.compareAndSet(5, 6);
```

## Higher-level concurrency: `ExecutorService`

Creating threads by hand is rarely the right answer. A thread pool reuses a fixed set of threads and queues tasks:

```java
import java.util.concurrent.*;

ExecutorService pool = Executors.newFixedThreadPool(4);

for (int i = 0; i < 10; i++) {
    int id = i;
    pool.submit(() -> System.out.println("task " + id + " on " + Thread.currentThread().getName()));
}

pool.shutdown();
pool.awaitTermination(1, TimeUnit.MINUTES);
```

Common factories:

| Factory                                       | What you get                              |
| --------------------------------------------- | ----------------------------------------- |
| `Executors.newFixedThreadPool(n)`             | n threads, queues extra tasks.            |
| `Executors.newCachedThreadPool()`             | Grows as needed, recycles idle threads.   |
| `Executors.newSingleThreadExecutor()`         | Sequential task queue (one worker).       |
| `Executors.newScheduledThreadPool(n)`         | Run tasks after a delay or on a schedule. |
| `Executors.newVirtualThreadPerTaskExecutor()` | One _virtual_ thread per task (Java 21+). |

## Returning values: `Future` and `Callable`

```java
Future<Integer> f = pool.submit(() -> {
    Thread.sleep(500);
    return 42;
});

int result = f.get();           // blocks until ready
```

## `CompletableFuture` — async pipelines

`CompletableFuture` lets you chain asynchronous operations without blocking:

```java
CompletableFuture
    .supplyAsync(() -> fetchUser(id))
    .thenApply(User::email)
    .thenAccept(System.out::println)
    .exceptionally(err -> { err.printStackTrace(); return null; });
```

This is the modern way to write non-blocking code.

## Virtual threads (Java 21+)

`Thread.startVirtualThread(Runnable)` (or `Executors.newVirtualThreadPerTaskExecutor()`) creates a **virtual thread** — a lightweight thread managed by the JVM. You can have _millions_ of virtual threads concurrently:

```java
Thread.startVirtualThread(() -> handleRequest(socket));
```

Virtual threads make blocking I/O cheap again — a big deal for servers.

## Concurrent collections

Don't share `HashMap` between threads. Use:

- `ConcurrentHashMap<K, V>` — thread-safe map with very high concurrency.
- `CopyOnWriteArrayList<T>` — good for read-heavy lists.
- `BlockingQueue<T>` (e.g. `LinkedBlockingQueue`) — producer/consumer queues.

## The JVM in two minutes

Your code runs _inside_ the **Java Virtual Machine**. A few things worth knowing:

- **Class loading**: classes are loaded on first use, not all at startup.
- **Memory model**:
  - **Stack** — one per thread. Holds method frames and local primitive variables.
  - **Heap** — shared by all threads. Holds every object.
  - **Metaspace** — class metadata.
- **Garbage collection**: the JVM periodically reclaims heap memory that's no longer referenced. You don't `free()` anything.
- **JIT compilation**: hot methods are compiled from bytecode to native machine code at runtime, often faster than ahead-of-time C compiles.

Useful flags:

```bash
java -Xmx512m MyApp           # max heap = 512 MB
java -Xss1m   MyApp           # stack size per thread = 1 MB
java -XX:+PrintFlagsFinal -version | grep Heap
java -verbose:gc MyApp        # log GC events
```

## Memory leaks in a managed language?

Yes — when objects are still **reachable** but no longer needed:

- Static collections that grow forever.
- Listeners registered but never removed.
- Caches without an eviction policy.
- Inner classes that hold a reference to their outer instance longer than expected.

Use a profiler (VisualVM, JFR, async-profiler, IntelliJ's profiler) when in doubt.

## A complete example: parallel sum

```java
import java.util.*;
import java.util.concurrent.*;

public class ParallelSum {
    public static long sum(long[] xs) throws Exception {
        int chunks = Runtime.getRuntime().availableProcessors();
        ExecutorService pool = Executors.newFixedThreadPool(chunks);
        int chunkSize = (xs.length + chunks - 1) / chunks;

        List<Future<Long>> futures = new ArrayList<>();
        for (int i = 0; i < chunks; i++) {
            final int from = i * chunkSize;
            final int to   = Math.min(xs.length, from + chunkSize);
            futures.add(pool.submit(() -> {
                long s = 0;
                for (int k = from; k < to; k++) s += xs[k];
                return s;
            }));
        }

        long total = 0;
        for (Future<Long> f : futures) total += f.get();
        pool.shutdown();
        return total;
    }

    public static void main(String[] args) throws Exception {
        long[] data = new long[10_000_000];
        Arrays.fill(data, 1);
        System.out.println(sum(data));     // 10000000
    }
}
```

## You made it 🎉

You've gone from `System.out.println("Hello, World!")` to virtual threads, lambdas, generics, records, and pattern matching. From here, the best next steps are:

- Pick a real project: a small REST service with **Spring Boot** or **Javalin**, a desktop app with **JavaFX**, or a CLI with **picocli**.
- Learn a build tool: **Maven** or **Gradle**.
- Read **Effective Java** by Joshua Bloch — the canonical book on writing idiomatic Java.
- Browse the [JDK API docs](https://docs.oracle.com/en/java/javase/) for the modules you use most.
- Subscribe to release notes — Java now ships every 6 months and keeps getting better.

Happy coding!
