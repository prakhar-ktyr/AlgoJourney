---
title: Threading Issues
---

# Threading Issues

Multithreading introduces subtle complexities that go beyond simply creating threads and dividing work. What happens when a multithreaded program calls `fork()`? Which thread receives a signal? How do you safely cancel a thread mid-execution? In this lesson, we explore the tricky practical issues that arise in real-world multithreaded programming.

---

## fork() and exec() in Multithreaded Programs

The `fork()` system call creates a new process by duplicating the calling process. But when the calling process has multiple threads, a critical question arises:

> **Does `fork()` duplicate all threads, or only the calling thread?**

### Two Semantics of fork()

| Variant      | Behavior                                                   | When Used                                 |
| ------------ | ---------------------------------------------------------- | ----------------------------------------- |
| **Fork-one** | Only the calling thread is duplicated in the child process | POSIX standard (`fork()` in Linux, macOS) |
| **Fork-all** | All threads are duplicated in the child process            | Some older Unix systems (rare today)      |

Modern POSIX systems use **fork-one** semantics: only the thread that called `fork()` exists in the child process.

```text
Parent Process (3 threads)         Child Process (1 thread)
┌──────────────────────────┐       ┌──────────────────────────┐
│  Thread 1 (main)         │       │  Thread 1 (copy of       │
│  Thread 2                │ fork()│    calling thread)        │
│  Thread 3 ←── calls fork │──────→│                          │
└──────────────────────────┘       └──────────────────────────┘
  3 threads continue                Only Thread 3's copy exists
```

### The Danger of fork() in Multithreaded Programs

Fork-one semantics create a dangerous situation: the child process inherits copies of all mutexes in their **current state**. If Thread 1 held a mutex when Thread 3 called `fork()`, the child has a **locked mutex with no thread to unlock it** — a deadlock.

```c
/* DANGEROUS: fork in multithreaded program */
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

void *worker(void *arg) {
    pthread_mutex_lock(&lock);     /* Thread 2 holds lock */
    sleep(10);                      /* Long operation */
    pthread_mutex_unlock(&lock);
    return NULL;
}

int main() {
    pthread_t t;
    pthread_create(&t, NULL, worker, NULL);
    sleep(1);  /* Let worker acquire lock */

    pid_t pid = fork();            /* Main thread forks */
    if (pid == 0) {
        /* Child process: lock is LOCKED, no thread to unlock! */
        pthread_mutex_lock(&lock); /* DEADLOCK! */
        printf("This never prints.\n");
    }
    /* ... */
}
```

### Best Practice: fork() + exec()

| Scenario                              | Recommendation                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| fork() followed immediately by exec() | **Safe** — exec replaces entire address space, so locked mutexes don't matter    |
| fork() without exec()                 | **Dangerous** — child inherits locked mutexes without the threads that hold them |
| Need to create worker processes       | Use `posix_spawn()` or fork+exec                                                 |

> [!WARNING]
> The POSIX standard provides `pthread_atfork()` to register handlers that run before and after `fork()`. These handlers can unlock mutexes before forking and re-lock them after. However, this approach is fragile and error-prone — avoid forking in multithreaded programs when possible.

```c
/* pthread_atfork: register fork handlers */
void prepare(void)  { pthread_mutex_lock(&lock);   }
void parent(void)   { pthread_mutex_unlock(&lock);  }
void child(void)    { pthread_mutex_unlock(&lock);  }

pthread_atfork(prepare, parent, child);
```

---

## Signal Handling in Multithreaded Programs

**Signals** are software interrupts delivered to a process (e.g., `SIGINT` from Ctrl+C, `SIGSEGV` from invalid memory access). In a multithreaded program, the question is: **which thread receives the signal?**

### Signal Delivery Rules

| Signal Type                                     | Delivery Target                         | Example                        |
| ----------------------------------------------- | --------------------------------------- | ------------------------------ |
| **Synchronous** (caused by thread's own action) | The thread that caused it               | `SIGSEGV`, `SIGFPE`, `SIGBUS`  |
| **Asynchronous** (external event)               | Any thread that doesn't have it blocked | `SIGINT`, `SIGTERM`, `SIGALRM` |
| **Directed** (sent to specific thread)          | The targeted thread                     | `pthread_kill(tid, sig)`       |

### Signal Handling Options

| Option                                            | Mechanism                              | Use Case                            |
| ------------------------------------------------- | -------------------------------------- | ----------------------------------- |
| Deliver to the thread to which the signal applies | Default for synchronous signals        | `SIGSEGV` goes to faulting thread   |
| Deliver to every thread                           | `kill()` to process (kernel picks one) | `SIGTERM` for graceful shutdown     |
| Deliver to specific thread(s)                     | `pthread_kill(tid, sig)`               | Send `SIGUSR1` to a specific worker |
| Assign a dedicated signal-handling thread         | Block signal in all threads except one | Clean signal handling pattern       |

### The Dedicated Signal Handler Pattern

The cleanest approach is to block all signals in all threads except one dedicated signal-handling thread:

```c
#include <stdio.h>
#include <signal.h>
#include <pthread.h>

void *signal_handler_thread(void *arg) {
    sigset_t *set = (sigset_t *)arg;
    int sig;

    while (1) {
        sigwait(set, &sig);  /* Block until signal arrives */
        switch (sig) {
            case SIGINT:
                printf("Received SIGINT — shutting down.\n");
                /* Perform cleanup */
                return NULL;
            case SIGUSR1:
                printf("Received SIGUSR1 — reloading config.\n");
                break;
        }
    }
}

int main() {
    sigset_t set;
    pthread_t sig_thread;

    /* Block SIGINT and SIGUSR1 in ALL threads */
    sigemptyset(&set);
    sigaddset(&set, SIGINT);
    sigaddset(&set, SIGUSR1);
    pthread_sigmask(SIG_BLOCK, &set, NULL);

    /* Create dedicated signal handler thread */
    pthread_create(&sig_thread, NULL,
                   signal_handler_thread, &set);

    /* Other worker threads inherit the signal mask,
       so they will never receive SIGINT or SIGUSR1 */
    /* ... create worker threads ... */

    pthread_join(sig_thread, NULL);
    return 0;
}
```

> [!TIP]
> Using `sigwait()` in a dedicated thread is far safer than using `signal()` or `sigaction()` handlers in multithreaded programs, because signal handlers have severe restrictions on which functions they can call (only async-signal-safe functions).

---

## Thread Cancellation

**Thread cancellation** is the act of terminating a thread before it completes its work. This is necessary when a thread is performing an operation that is no longer needed (e.g., a user cancels a search).

### Two Types of Cancellation

| Type                          | Description                                              | Risk Level                                       |
| ----------------------------- | -------------------------------------------------------- | ------------------------------------------------ |
| **Asynchronous cancellation** | Target thread is terminated immediately                  | High — may leave resources in inconsistent state |
| **Deferred cancellation**     | Target thread periodically checks if it should terminate | Low — thread cleans up before exiting            |

### Asynchronous Cancellation

The thread is killed immediately, wherever it happens to be executing.

```text
Thread:  [ ... doing work ... | KILLED HERE | ]
                                    ↑
                          pthread_cancel() received
                          Thread dies immediately
                          - Mutex may be held
                          - Memory may be half-allocated
                          - File may be half-written
```

> [!WARNING]
> Asynchronous cancellation is almost never safe. If the thread holds a mutex, the mutex remains locked forever. If the thread is in the middle of a `malloc()`, the heap may be corrupted.

### Deferred Cancellation (Default)

The thread is flagged for cancellation but only terminates at **cancellation points** — specific functions where the thread checks its cancellation flag.

```text
Thread:  [ work | CHECK | work | CHECK | work | CHECK → cancel ]
                   ↑              ↑              ↑
              Cancellation points (e.g., pthread_testcancel,
              read, write, sleep, pthread_cond_wait, ...)
```

### Pthreads Cancellation API

```c
#include <pthread.h>

/* Set cancellation type */
pthread_setcanceltype(PTHREAD_CANCEL_DEFERRED, NULL);    /* Default */
pthread_setcanceltype(PTHREAD_CANCEL_ASYNCHRONOUS, NULL); /* Dangerous */

/* Set cancellation state */
pthread_setcancelstate(PTHREAD_CANCEL_ENABLE, NULL);     /* Default */
pthread_setcancelstate(PTHREAD_CANCEL_DISABLE, NULL);    /* Ignore cancel */

/* Manual cancellation point */
pthread_testcancel();  /* If cancel is pending, thread exits here */

/* Request cancellation of another thread */
pthread_cancel(target_thread);
```

### Cleanup Handlers

**Cleanup handlers** ensure resources are released even if a thread is cancelled:

```c
void cleanup_mutex(void *arg) {
    pthread_mutex_t *lock = (pthread_mutex_t *)arg;
    pthread_mutex_unlock(lock);
    printf("Cleanup: mutex unlocked.\n");
}

void *worker(void *arg) {
    pthread_mutex_t *lock = (pthread_mutex_t *)arg;

    pthread_cleanup_push(cleanup_mutex, lock);

    pthread_mutex_lock(lock);
    /* ... do work that might be cancelled ... */
    /* If cancelled here, cleanup_mutex runs automatically */
    pthread_mutex_unlock(lock);

    pthread_cleanup_pop(0);  /* 0 = don't execute handler (we unlocked) */
    return NULL;
}
```

### Cancellation Safety Summary

| Approach             | Safety             | Performance            | Use Case                                          |
| -------------------- | ------------------ | ---------------------- | ------------------------------------------------- |
| Asynchronous         | Unsafe             | Fast                   | Never (except pure computation with no resources) |
| Deferred             | Safe with cleanup  | Slight overhead        | Default — use this                                |
| Disable cancellation | Safest (no cancel) | No overhead            | Critical sections that must not be interrupted    |
| Cooperative (flag)   | Safest             | Application-controlled | Modern best practice                              |

---

## Thread-Local Storage (TLS)

**Thread-Local Storage** provides each thread with its own copy of a variable. Unlike local variables (which are per-function-call), TLS variables persist across function calls within the same thread.

### TLS vs Local Variables vs Global Variables

| Storage Type        | Scope           | Lifetime               | Shared?                  |
| ------------------- | --------------- | ---------------------- | ------------------------ |
| **Local variable**  | Within function | Function call duration | No                       |
| **Global variable** | Entire program  | Program lifetime       | Yes (all threads)        |
| **Thread-local**    | Entire program  | Thread lifetime        | No (one copy per thread) |

### TLS in C (GCC/Clang)

```c
#include <stdio.h>
#include <pthread.h>

__thread int thread_counter = 0;  /* Each thread gets its own copy */

void *worker(void *arg) {
    int id = *(int *)arg;

    for (int i = 0; i < 5; i++) {
        thread_counter++;
        printf("Thread %d: counter = %d\n", id, thread_counter);
    }
    return NULL;
}

int main() {
    pthread_t t1, t2;
    int id1 = 1, id2 = 2;

    pthread_create(&t1, NULL, worker, &id1);
    pthread_create(&t2, NULL, worker, &id2);

    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    /* Each thread counts 1..5 independently */
    return 0;
}
```

### TLS Across Languages

| Language      | TLS Syntax                                              |
| ------------- | ------------------------------------------------------- |
| C (GCC/Clang) | `__thread int x;`                                       |
| C11 standard  | `_Thread_local int x;` or `thread_local int x;`         |
| C++ 11        | `thread_local int x;`                                   |
| Java          | `ThreadLocal<Integer> x = new ThreadLocal<>();`         |
| Python        | `threading.local()`                                     |
| Rust          | `thread_local! { static X: Cell<i32> = Cell::new(0); }` |

### Common Uses of TLS

| Use Case                           | Why TLS?                                      |
| ---------------------------------- | --------------------------------------------- |
| `errno`                            | Each thread needs its own error code          |
| Random number generator state      | Avoid lock contention on shared RNG           |
| Thread-specific logging context    | Include thread ID, request ID in log messages |
| Per-thread memory allocator caches | Reduce lock contention in `malloc()`          |
| Database connection per thread     | Avoid connection pool locking                 |

> [!NOTE]
> In modern Linux, `errno` is implemented as a TLS variable: `#define errno (*__errno_location())` returns a pointer to the calling thread's errno. This is why `errno` works correctly in multithreaded programs.

---

## Scheduler Activations

**Scheduler activations** are a mechanism for the kernel to communicate with a user-level thread library, providing the best features of both user-level and kernel-level threading.

### The Problem

In the Many-to-Many model, the kernel doesn't know about user-level threads, and the user-level scheduler doesn't know about kernel events (like a thread blocking on I/O). This disconnect leads to poor decisions by both schedulers.

### The Solution: Upcalls

The kernel provides the thread library with **virtual processors** (Lightweight Processes, LWPs) and notifies the library about events through **upcalls** — kernel-to-user callbacks.

```text
┌────────────────────────────────────────────────┐
│                User Space                       │
│  ┌──────────────────────────────────────────┐   │
│  │        Thread Library                     │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │   │
│  │  │UT1 │ │UT2 │ │UT3 │ │UT4 │ │UT5 │     │   │
│  │  └──┬─┘ └──┬─┘ └──┬─┘ └──┬─┘ └──┬─┘     │   │
│  │     └───┬──┘      └───┬──┘      │        │   │
│  │         ↓             ↓         ↓        │   │
│  │      LWP 1         LWP 2     LWP 3      │   │
│  └──────┬────────────────┬──────────┬───────┘   │
│         │                │          │           │
│  UPCALL ↑        UPCALL ↑   UPCALL ↑           │
├─────────┼────────────────┼──────────┼───────────┤
│  Kernel │                │          │           │
│     ┌───┴───┐      ┌────┴───┐ ┌────┴───┐       │
│     │  KT1  │      │  KT2   │ │  KT3   │       │
│     └───────┘      └────────┘ └────────┘        │
└────────────────────────────────────────────────┘
```

### Upcall Events

| Event                          | Upcall to Thread Library                     |
| ------------------------------ | -------------------------------------------- |
| Thread blocks on I/O           | "UT3 blocked — here's a new LWP, reschedule" |
| Thread unblocks (I/O complete) | "UT3 is ready — you may want to schedule it" |
| New processor available        | "Here's an additional LWP"                   |
| Processor preempted            | "I'm taking back this LWP"                   |

> [!NOTE]
> Scheduler activations were implemented in NetBSD and some research operating systems but were eventually abandoned as the simpler 1:1 model proved sufficient. The concept influenced Go's goroutine scheduler, which uses a similar M:N approach with "P" (processor) abstractions.

---

## Thread Safety and Reentrancy

### Thread-Safe Functions

A function is **thread-safe** if it can be called from multiple threads simultaneously without producing incorrect results.

### Non-Thread-Safe Standard Library Functions

Many classic C library functions are NOT thread-safe:

| Unsafe Function   | Thread-Safe Alternative | Problem                          |
| ----------------- | ----------------------- | -------------------------------- |
| `strtok()`        | `strtok_r()`            | Uses internal static buffer      |
| `asctime()`       | `asctime_r()`           | Returns pointer to static buffer |
| `ctime()`         | `ctime_r()`             | Returns pointer to static buffer |
| `localtime()`     | `localtime_r()`         | Returns pointer to static struct |
| `gethostbyname()` | `getaddrinfo()`         | Uses static internal data        |
| `rand()`          | `rand_r()`              | Uses shared static state         |

The `_r` suffix stands for **reentrant** — these versions take an additional parameter for thread-local storage.

```c
/* Unsafe: shared static buffer */
char *token = strtok(line, ",");   /* Don't use in threads! */

/* Safe: caller provides buffer */
char *saveptr;
char *token = strtok_r(line, ",", &saveptr);  /* Thread-safe */
```

---

## Common Threading Bugs

| Bug                    | Description                                                                   | Example                                                                          | Prevention                           |
| ---------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------ |
| **Race condition**     | Result depends on thread interleaving                                         | Two threads incrementing a counter without synchronization                       | Use mutexes, atomic operations       |
| **Deadlock**           | Two or more threads waiting for each other's locks                            | Thread A holds Lock 1, waits for Lock 2; Thread B holds Lock 2, waits for Lock 1 | Lock ordering, timeout-based locking |
| **Priority inversion** | High-priority thread blocked by low-priority thread holding a needed resource | Mars Pathfinder bug (1997)                                                       | Priority inheritance protocol        |
| **Livelock**           | Threads keep running but make no progress                                     | Two threads repeatedly yielding to each other                                    | Randomized backoff                   |
| **Starvation**         | A thread never gets to run or access a resource                               | Writer never runs because readers keep arriving                                  | Fair scheduling, turn-based access   |
| **Data race**          | Unsynchronized access where at least one is a write                           | Reading a struct while another thread writes to it                               | Memory barriers, synchronization     |
| **ABA problem**        | Value changes A→B→A; compare-and-swap thinks nothing changed                  | Lock-free data structure corruption                                              | Version counters, hazard pointers    |

### The Mars Pathfinder Priority Inversion

```text
Priority:  High ─────────────────────────────────
                 │ Weather Task                  │
                 │ Needs bus lock                 │
                 │ ↓ BLOCKED (bus lock held by   │
                 │           low-priority task)  │
Priority:  Med  ─────────────────────────────────
                 │ Comm Task                     │
                 │ Runs instead of High (preempts│
                 │ Low, doesn't need bus lock)   │
Priority:  Low  ─────────────────────────────────
                 │ Bus Mgmt Task                 │
                 │ HOLDS bus lock                 │
                 │ Can't run (preempted by Med)   │
                 │ Can't release lock!            │
                 ─────────────────────────────────
  Solution: Priority Inheritance — boost Low to High's priority
            while it holds the lock High needs.
```

> [!IMPORTANT]
> The Mars Pathfinder mission nearly failed due to priority inversion. The system kept resetting because a watchdog timer fired when the high-priority task couldn't complete. JPL engineers diagnosed the issue remotely and enabled the VxWorks priority inheritance flag, saving the mission.

---

## Try It Yourself

**Exercise 1:** A multithreaded web server has 8 worker threads. The main thread calls `fork()` to create a child process that will execute a CGI script via `exec()`. Is this safe? Why or why not?

:::details Solution
This is **relatively safe** because `fork()` is immediately followed by `exec()`. The `exec()` call replaces the entire address space of the child, so any locked mutexes in the child are destroyed. However, there are still edge-case risks:

1. File descriptors: the child inherits open file descriptors from all threads. Use `O_CLOEXEC` or `fcntl(fd, F_SETFD, FD_CLOEXEC)`.
2. Signal handlers: the child inherits signal dispositions; `exec()` resets them.
3. Between `fork()` and `exec()`: only async-signal-safe functions should be called in this window.

The safest approach is to use `posix_spawn()`, which combines fork+exec atomically.
:::

**Exercise 2:** Explain the difference between `__thread int x` and `int x` declared inside a thread function. When would you prefer TLS over a local variable?

:::details Solution

- `int x` inside a function is a **local variable**: it exists only during that function call and is stored on the thread's stack. If the function returns, `x` is gone.
- `__thread int x` is a **TLS variable**: it persists for the entire lifetime of the thread, across all function calls. Each thread has its own copy.

You would prefer TLS when:

1. A value must persist across multiple function calls within the same thread (like `errno`).
2. A library function needs per-thread state without changing its API (like thread-safe `strtok_r` but without the extra parameter).
3. You want to avoid lock contention by giving each thread its own copy of frequently accessed data (like a per-thread memory allocator cache).
   :::

**Exercise 3:** Thread A calls `pthread_cancel(threadB)`. Thread B has deferred cancellation enabled and is currently in a tight computational loop with no system calls. Will Thread B ever be cancelled?

:::details Solution
**No, Thread B will not be cancelled** unless it reaches a cancellation point. In deferred mode, cancellation only occurs at specific functions (like `pthread_testcancel()`, `read()`, `write()`, `sleep()`, `pthread_cond_wait()`, etc.). A tight computational loop without any of these calls has no cancellation points, so the cancellation request remains pending indefinitely.

**Fix:** Add `pthread_testcancel()` inside the loop:

```c
for (long i = 0; i < HUGE_NUMBER; i++) {
    /* ... computation ... */
    if (i % 10000 == 0) pthread_testcancel();
}
```

:::

---

## Key Takeaways

- Modern POSIX `fork()` uses **fork-one** semantics — only the calling thread is duplicated, which can leave copied mutexes in a locked state. Always pair `fork()` with `exec()` in multithreaded programs.
- **Signal delivery** in multithreaded programs follows rules: synchronous signals go to the causing thread; asynchronous signals go to any unblocked thread. Use a dedicated signal-handling thread for clean design.
- **Thread cancellation** should use **deferred** mode with cleanup handlers. Asynchronous cancellation is almost always unsafe.
- **Thread-Local Storage (TLS)** provides per-thread copies of variables that persist across function calls — essential for `errno`, RNG state, and thread-specific context.
- **Scheduler activations** use upcalls to coordinate user-level and kernel-level scheduling, though modern systems have largely adopted the simpler 1:1 model.
- Common threading bugs — **race conditions**, **deadlocks**, **priority inversion**, **livelocks**, and **starvation** — require careful design patterns and tools like thread sanitizers to prevent and detect.
- Many classic C library functions (like `strtok`, `ctime`) are not thread-safe; always use their `_r` (reentrant) variants in multithreaded code.
