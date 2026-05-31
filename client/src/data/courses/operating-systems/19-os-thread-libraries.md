---
title: Thread Libraries
section: "Threads & Concurrency"
---

# Thread Libraries

A **thread library** provides the programmer with an API for creating and managing threads. It's the bridge between your application code and the underlying threading model. In this lesson, we explore the major thread libraries across platforms — POSIX Threads (Pthreads), Windows Threads, Java Threads, and Python's threading module — with complete working examples.

---

## What Is a Thread Library?

> A **thread library** is a set of functions (an API) that allows a programmer to create, synchronize, and manage threads within a process.

Thread libraries can be implemented in two ways:

| Implementation           | Description                                       | Example                        |
| ------------------------ | ------------------------------------------------- | ------------------------------ |
| **User-level library**   | Entirely in user space; no kernel support needed  | GNU Pth                        |
| **Kernel-level library** | Backed by kernel system calls; OS manages threads | Pthreads (NPTL), Win32 Threads |

Most modern thread libraries are kernel-level, meaning each library call translates into one or more system calls that create real kernel threads.

```text
┌─────────────────────────────────────────────┐
│              Application Code               │
│         pthread_create(), join()...          │
├─────────────────────────────────────────────┤
│           Thread Library (e.g., NPTL)       │
│         Wraps system calls into API         │
├─────────────────────────────────────────────┤
│              System Calls                   │
│        clone(), futex(), exit()             │
├─────────────────────────────────────────────┤
│              Kernel                         │
│    Thread scheduling, context switching     │
└─────────────────────────────────────────────┘
```

---

## Pthreads (POSIX Threads)

**Pthreads** is the most widely used thread library in Unix/Linux systems. It is defined by the **POSIX.1c** standard (IEEE 1003.1c-1995) and provides a portable, C-language API for thread management.

> [!IMPORTANT]
> Pthreads is a _specification_, not an implementation. Different operating systems provide their own implementations — Linux uses NPTL, macOS uses a Mach-based implementation, and FreeBSD has its own.

### Core Pthreads Functions

| Function           | Purpose                          | Signature                                                                                         |
| ------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| `pthread_create()` | Create a new thread              | `int pthread_create(pthread_t *tid, const pthread_attr_t *attr, void *(*func)(void*), void *arg)` |
| `pthread_join()`   | Wait for a thread to finish      | `int pthread_join(pthread_t tid, void **retval)`                                                  |
| `pthread_exit()`   | Terminate the calling thread     | `void pthread_exit(void *retval)`                                                                 |
| `pthread_cancel()` | Request cancellation of a thread | `int pthread_cancel(pthread_t tid)`                                                               |
| `pthread_self()`   | Get the calling thread's ID      | `pthread_t pthread_self(void)`                                                                    |
| `pthread_detach()` | Detach a thread (auto-cleanup)   | `int pthread_detach(pthread_t tid)`                                                               |
| `pthread_equal()`  | Compare two thread IDs           | `int pthread_equal(pthread_t t1, pthread_t t2)`                                                   |

### Thread Lifecycle

```text
pthread_create()          pthread_exit()
      │                        │
      ↓                        ↓
  ┌────────┐  scheduled  ┌──────────┐  terminates  ┌────────────┐
  │  New   │────────────→│ Running  │─────────────→│ Terminated │
  └────────┘             └──────────┘               └────────────┘
                           │     ↑
                blocked    │     │  unblocked
                           ↓     │
                         ┌──────────┐
                         │ Blocked  │
                         │(I/O,lock)│
                         └──────────┘
```

### Complete Pthreads Example: Parallel Sum

This program divides an array among multiple threads, each computing a partial sum, then combines the results:

```c
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>

#define NUM_THREADS 4
#define ARRAY_SIZE  1000000

int array[ARRAY_SIZE];

/* Structure to pass data to each thread */
typedef struct {
    int thread_id;
    int start;
    int end;
    long partial_sum;
} ThreadData;

void *compute_sum(void *arg) {
    ThreadData *data = (ThreadData *)arg;
    data->partial_sum = 0;

    for (int i = data->start; i < data->end; i++) {
        data->partial_sum += array[i];
    }

    printf("Thread %d: sum of [%d..%d) = %ld\n",
           data->thread_id, data->start, data->end,
           data->partial_sum);

    pthread_exit(NULL);
}

int main() {
    pthread_t threads[NUM_THREADS];
    ThreadData thread_data[NUM_THREADS];

    /* Initialize array with values 1 to ARRAY_SIZE */
    for (int i = 0; i < ARRAY_SIZE; i++) {
        array[i] = i + 1;
    }

    /* Divide work among threads */
    int chunk_size = ARRAY_SIZE / NUM_THREADS;

    for (int i = 0; i < NUM_THREADS; i++) {
        thread_data[i].thread_id = i;
        thread_data[i].start = i * chunk_size;
        thread_data[i].end = (i == NUM_THREADS - 1)
                             ? ARRAY_SIZE
                             : (i + 1) * chunk_size;

        int rc = pthread_create(&threads[i], NULL,
                                compute_sum, &thread_data[i]);
        if (rc) {
            fprintf(stderr, "Error creating thread %d: %d\n", i, rc);
            exit(EXIT_FAILURE);
        }
    }

    /* Wait for all threads and accumulate results */
    long total_sum = 0;
    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
        total_sum += thread_data[i].partial_sum;
    }

    printf("Total sum: %ld\n", total_sum);
    printf("Expected:  %ld\n",
           (long)ARRAY_SIZE * (ARRAY_SIZE + 1) / 2);

    return 0;
}
```

Compile and run:

```bash
gcc -pthread parallel_sum.c -o parallel_sum
./parallel_sum
```

> [!TIP]
> Always pass the `-pthread` flag when compiling Pthreads programs. This flag links the pthread library AND defines necessary preprocessor macros. Using `-lpthread` alone may not set all required flags.

### Thread Return Values

Threads can return values to the joining thread:

```c
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>

void *compute_factorial(void *arg) {
    int n = *(int *)arg;
    long *result = malloc(sizeof(long));
    *result = 1;

    for (int i = 2; i <= n; i++) {
        *result *= i;
    }
    return (void *)result;     /* Return pointer to result */
}

int main() {
    pthread_t tid;
    int n = 10;
    long *result;

    pthread_create(&tid, NULL, compute_factorial, &n);
    pthread_join(tid, (void **)&result);

    printf("%d! = %ld\n", n, *result);  /* 10! = 3628800 */
    free(result);
    return 0;
}
```

### Detached Threads

A **detached** thread releases its resources automatically upon termination. You cannot `join()` a detached thread.

```c
pthread_t tid;
pthread_attr_t attr;

pthread_attr_init(&attr);
pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);
pthread_create(&tid, &attr, worker_function, NULL);
pthread_attr_destroy(&attr);
/* No pthread_join needed — resources freed automatically */
```

---

## Windows Threads API

The Windows threading API uses Win32 functions from `<windows.h>`.

### Core Windows Thread Functions

| Function                   | Purpose                   | Pthreads Equivalent             |
| -------------------------- | ------------------------- | ------------------------------- |
| `CreateThread()`           | Create a new thread       | `pthread_create()`              |
| `WaitForSingleObject()`    | Wait for thread to finish | `pthread_join()`                |
| `WaitForMultipleObjects()` | Wait for multiple threads | Multiple `pthread_join()` calls |
| `ExitThread()`             | Terminate calling thread  | `pthread_exit()`                |
| `TerminateThread()`        | Force-kill a thread       | `pthread_cancel()`              |
| `GetCurrentThreadId()`     | Get calling thread's ID   | `pthread_self()`                |

### Windows Thread Example

```c
#include <windows.h>
#include <stdio.h>

typedef struct {
    int thread_id;
    int value;
} ThreadParam;

DWORD WINAPI worker(LPVOID lpParam) {
    ThreadParam *p = (ThreadParam *)lpParam;
    printf("Thread %d: computing square of %d = %d\n",
           p->thread_id, p->value, p->value * p->value);
    return 0;
}

int main() {
    HANDLE threads[3];
    ThreadParam params[3];
    DWORD threadIds[3];

    for (int i = 0; i < 3; i++) {
        params[i].thread_id = i;
        params[i].value = (i + 1) * 10;
        threads[i] = CreateThread(
            NULL,           /* Default security attributes */
            0,              /* Default stack size */
            worker,         /* Thread function */
            &params[i],     /* Parameter */
            0,              /* Start immediately */
            &threadIds[i]   /* Receive thread ID */
        );
    }

    /* Wait for all threads to complete */
    WaitForMultipleObjects(3, threads, TRUE, INFINITE);

    /* Clean up handles */
    for (int i = 0; i < 3; i++) {
        CloseHandle(threads[i]);
    }
    return 0;
}
```

> [!WARNING]
> Never use `TerminateThread()` unless absolutely necessary — it does not clean up the thread's stack, release locks, or run cleanup handlers. Always prefer cooperative cancellation.

---

## Java Threads

Java provides built-in thread support as part of the language, making multithreading more accessible than C-based APIs.

### Two Ways to Create Threads in Java

**Method 1: Extending the Thread class**

```java
class MyThread extends Thread {
    private int id;

    public MyThread(int id) {
        this.id = id;
    }

    @Override
    public void run() {
        System.out.println("Thread " + id + " is running");
        for (int i = 0; i < 5; i++) {
            System.out.println("Thread " + id + ": count = " + i);
        }
    }
}

public class ThreadDemo {
    public static void main(String[] args) throws InterruptedException {
        MyThread t1 = new MyThread(1);
        MyThread t2 = new MyThread(2);

        t1.start();    // start() creates new thread and calls run()
        t2.start();

        t1.join();     // Wait for t1 to finish
        t2.join();     // Wait for t2 to finish

        System.out.println("Both threads completed.");
    }
}
```

**Method 2: Implementing the Runnable interface (preferred)**

```java
class SumTask implements Runnable {
    private int[] array;
    private int start, end;
    private long result;

    public SumTask(int[] array, int start, int end) {
        this.array = array;
        this.start = start;
        this.end = end;
    }

    @Override
    public void run() {
        result = 0;
        for (int i = start; i < end; i++) {
            result += array[i];
        }
    }

    public long getResult() { return result; }
}
```

> [!NOTE]
> The `Runnable` interface is preferred because Java doesn't support multiple inheritance. Using `Runnable` allows the class to extend another class while still being usable as a thread task.

### Java Thread Lifecycle

| State           | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `NEW`           | Thread object created but `start()` not yet called           |
| `RUNNABLE`      | Thread is executing or ready to execute                      |
| `BLOCKED`       | Waiting to acquire a monitor lock                            |
| `WAITING`       | Waiting indefinitely for another thread (`join()`, `wait()`) |
| `TIMED_WAITING` | Waiting for a specified time (`sleep()`, timed `join()`)     |
| `TERMINATED`    | Thread has completed execution                               |

---

## Python Threading Module

Python's `threading` module provides a high-level threading API, but with an important caveat — the **Global Interpreter Lock (GIL)**.

### Basic Python Threading Example

```python
import threading
import time

def worker(thread_id, duration):
    """Simulates work by sleeping."""
    print(f"Thread {thread_id}: starting")
    time.sleep(duration)
    print(f"Thread {thread_id}: finished after {duration}s")

# Create threads
threads = []
for i in range(4):
    t = threading.Thread(target=worker, args=(i, i + 1))
    threads.append(t)
    t.start()

# Wait for all threads to complete
for t in threads:
    t.join()

print("All threads completed.")
```

### Python Threading with Shared Data

```python
import threading

class Counter:
    def __init__(self):
        self.value = 0
        self.lock = threading.Lock()

    def increment(self, n):
        for _ in range(n):
            with self.lock:    # Acquire and release lock automatically
                self.value += 1

counter = Counter()
threads = []

for _ in range(4):
    t = threading.Thread(target=counter.increment, args=(250000,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print(f"Final count: {counter.value}")   # Always 1000000
print(f"Expected:    1000000")
```

> [!WARNING]
> Python's **GIL (Global Interpreter Lock)** means that only one thread can execute Python bytecode at a time in CPython. This makes Python threads ineffective for CPU-bound tasks but still useful for I/O-bound tasks. For true CPU parallelism in Python, use `multiprocessing` instead.

---

## Thread Safety Concepts

**Thread safety** means that a piece of code functions correctly during simultaneous execution by multiple threads.

### What Makes Code Thread-Unsafe?

| Problem            | Description                                                                           | Example                                                                          |
| ------------------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Race condition** | Multiple threads access shared data and at least one writes                           | Counter increment without lock                                                   |
| **Data race**      | Two threads access same memory location, at least one writes, with no synchronization | Reading half-updated struct                                                      |
| **Deadlock**       | Two or more threads waiting for each other's locks                                    | Thread A holds Lock 1, waits for Lock 2; Thread B holds Lock 2, waits for Lock 1 |
| **Starvation**     | A thread never gets CPU time or resource access                                       | Low-priority thread never runs                                                   |

### Making Code Thread-Safe

| Technique                | Description                                        |
| ------------------------ | -------------------------------------------------- |
| **Mutual exclusion**     | Use locks/mutexes to protect shared data           |
| **Atomic operations**    | Use hardware-supported atomic instructions         |
| **Thread-local storage** | Give each thread its own copy of data              |
| **Immutability**         | Use read-only data that never changes              |
| **Reentrant functions**  | Write functions that don't use global/static state |

### Reentrant vs Thread-Safe

A **reentrant** function can be safely called simultaneously by multiple threads because it does not use any shared state. All reentrant functions are thread-safe, but not all thread-safe functions are reentrant.

```c
/* Reentrant: uses only local variables */
int add(int a, int b) {
    return a + b;
}

/* NOT reentrant: uses static variable */
int counter() {
    static int count = 0;   /* Shared across calls! */
    return ++count;
}

/* Thread-safe but NOT reentrant: uses a lock */
int safe_counter() {
    static int count = 0;
    static pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
    pthread_mutex_lock(&lock);
    int result = ++count;
    pthread_mutex_unlock(&lock);
    return result;
}
```

---

## Comparison Table of Thread APIs

| Feature              | Pthreads                  | Windows Threads         | Java Threads           | Python threading   |
| -------------------- | ------------------------- | ----------------------- | ---------------------- | ------------------ |
| **Language**         | C                         | C                       | Java                   | Python             |
| **Platform**         | POSIX (Linux, macOS, BSD) | Windows                 | Cross-platform (JVM)   | Cross-platform     |
| **Create**           | `pthread_create()`        | `CreateThread()`        | `new Thread().start()` | `Thread().start()` |
| **Join**             | `pthread_join()`          | `WaitForSingleObject()` | `thread.join()`        | `thread.join()`    |
| **Exit**             | `pthread_exit()`          | `ExitThread()`          | return from `run()`    | return from target |
| **Cancel**           | `pthread_cancel()`        | `TerminateThread()`     | `thread.interrupt()`   | No direct cancel   |
| **Mutex**            | `pthread_mutex_t`         | `CRITICAL_SECTION`      | `synchronized`         | `threading.Lock()` |
| **Detach**           | `pthread_detach()`        | Thread handle auto      | Daemon thread          | `daemon=True`      |
| **True parallelism** | Yes                       | Yes                     | Yes                    | No (GIL) for CPU   |
| **Error handling**   | Return codes              | Return codes            | Exceptions             | Exceptions         |

---

## Best Practices for Using Thread Libraries

| Practice                                               | Reason                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| Always join or detach threads                          | Prevents resource leaks (zombie threads)                     |
| Check return values of thread API calls                | Catch creation failures, invalid operations                  |
| Minimize shared mutable state                          | Reduces need for synchronization                             |
| Use the highest-level abstraction available            | Prefer thread pools, executors over raw threads              |
| Avoid `TerminateThread`/`pthread_cancel` when possible | Forced termination can leave resources in inconsistent state |
| Keep critical sections short                           | Reduces lock contention, improves throughput                 |

---

## Try It Yourself

**Exercise 1:** Write a Pthreads program that creates 3 threads, each computing the factorial of a different number (5!, 7!, and 10!). Each thread should return its result, and the main thread should print all results after joining.

:::details Solution

```c
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>

void *factorial(void *arg) {
    int n = *(int *)arg;
    long *result = malloc(sizeof(long));
    *result = 1;
    for (int i = 2; i <= n; i++)
        *result *= i;
    return (void *)result;
}

int main() {
    pthread_t threads[3];
    int nums[] = {5, 7, 10};

    for (int i = 0; i < 3; i++)
        pthread_create(&threads[i], NULL, factorial, &nums[i]);

    for (int i = 0; i < 3; i++) {
        long *result;
        pthread_join(threads[i], (void **)&result);
        printf("%d! = %ld\n", nums[i], *result);
        free(result);
    }
    return 0;
}
/* Output:
   5! = 120
   7! = 5040
   10! = 3628800
*/
```

:::

**Exercise 2:** Explain what would happen if you call `thread.run()` instead of `thread.start()` in Java. Why is this a common beginner mistake?

:::details Solution
Calling `thread.run()` executes the `run()` method in the **current thread** — no new thread is created. It's just a regular method call. The caller blocks until `run()` finishes, defeating the purpose of threading.

Calling `thread.start()` tells the JVM to create a **new OS thread** and execute `run()` in that new thread. The caller continues executing concurrently.

This is a common mistake because both compile and run without errors, but `run()` gives sequential behavior instead of concurrent behavior.
:::

---

## Key Takeaways

- A **thread library** provides the API for creating and managing threads; modern implementations are backed by kernel system calls.
- **Pthreads** is the standard thread library for POSIX systems, providing `pthread_create()`, `pthread_join()`, `pthread_exit()`, and synchronization primitives.
- **Windows threads** use `CreateThread()` and `WaitForSingleObject()` with handle-based resource management.
- **Java** provides built-in thread support via the `Thread` class and `Runnable` interface, with automatic garbage collection of thread resources.
- **Python's threading** module is useful for I/O-bound tasks but is limited by the **GIL** for CPU-bound work.
- **Thread safety** requires careful management of shared mutable state through locks, atomic operations, or thread-local storage.
- **Reentrant** functions (no shared state) are the gold standard for thread safety.
- Always compile Pthreads programs with the `-pthread` flag, always `join()` or `detach()` threads, and always check API return codes.
