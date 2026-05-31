---
title: Mutex Locks
section: "Process Synchronization"
---

# Mutex Locks

While hardware atomic instructions provide the foundation for synchronization, programming directly with test-and-set and compare-and-swap is tedious and error-prone. **Mutex locks** (short for _mutual exclusion_ locks) are the simplest and most widely used high-level synchronization tool. A mutex protects a critical section by allowing only one thread to hold the lock at a time. In this lesson, we explore mutex concepts, implementations, the Pthreads mutex API, and best practices.

---

## The Mutex Concept

> A **mutex** (mutual exclusion lock) is a synchronization primitive that provides two operations: **acquire** (lock) and **release** (unlock). Only one thread can hold the mutex at a time.

Think of a mutex as a **bathroom lock**. When someone enters and locks the door, others must wait outside. When the person exits and unlocks the door, the next waiting person can enter.

### Basic API

```c
acquire(mutex);       /* Wait until mutex is free, then lock it */

/* Critical Section — only one thread at a time */
access_shared_resource();

release(mutex);       /* Unlock the mutex, allowing others to enter */
```

### Formal Semantics

```c
/* acquire() — must be atomic */
void acquire(mutex_t *m) {
    while (m->locked)
        ;  /* Wait (spin or block) */
    m->locked = true;
}

/* release() — must be atomic */
void release(mutex_t *m) {
    m->locked = false;
}
```

> [!WARNING]
> The pseudocode above is NOT correct as written — the check-and-set in `acquire()` is not atomic. Real implementations use hardware atomic instructions (CAS/TAS) to make it atomic.

---

## Implementation Using Atomic Instructions

### CAS-Based Mutex

```c
#include <stdatomic.h>

typedef struct {
    atomic_int state;   /* 0 = unlocked, 1 = locked */
} mutex_t;

void mutex_init(mutex_t *m) {
    atomic_store(&m->state, 0);
}

void mutex_lock(mutex_t *m) {
    int expected = 0;
    while (!atomic_compare_exchange_weak(&m->state, &expected, 1)) {
        expected = 0;  /* Reset expected for next attempt */
        /* Spin or yield */
    }
}

void mutex_unlock(mutex_t *m) {
    atomic_store(&m->state, 0);
}
```

### The Lifecycle of a Mutex

```text
  ┌─────────────┐
  │  UNLOCKED   │ ←──── Initial state
  └──────┬──────┘
         │ Thread A calls acquire()
         ↓
  ┌─────────────┐
  │   LOCKED    │ ←──── Thread A holds the lock
  │  (owner: A) │
  └──────┬──────┘
         │         Thread B calls acquire() → BLOCKS
         │         Thread C calls acquire() → BLOCKS
         │
         │ Thread A calls release()
         ↓
  ┌─────────────┐
  │  UNLOCKED   │ ←──── One waiting thread wakes up
  └──────┬──────┘
         │ Thread B acquires
         ↓
  ┌─────────────┐
  │   LOCKED    │ ←──── Thread B holds the lock
  │  (owner: B) │
  └─────────────┘
```

---

## Spinlock vs Blocking Mutex

There are two fundamental approaches to what a thread does when it can't acquire a mutex:

### Spinlock (Busy Waiting)

The thread **spins** in a loop, continuously checking if the lock is available.

```c
void spinlock_acquire(spinlock_t *lock) {
    while (atomic_flag_test_and_set(lock))
        ;  /* Burn CPU cycles waiting */
}
```

### Blocking Mutex (Sleep Waiting)

The thread is put to **sleep** by the OS. When the lock becomes available, the OS wakes up a waiting thread.

```c
void blocking_mutex_acquire(mutex_t *m) {
    if (!try_lock(m)) {
        add_to_wait_queue(m);
        sleep();   /* Yield CPU — OS schedules other threads */
    }
}
```

### Comparison

| Feature                         | Spinlock                          | Blocking Mutex                      |
| ------------------------------- | --------------------------------- | ----------------------------------- |
| **Wait mechanism**              | Busy-wait (spin in loop)          | Sleep (yield CPU to OS)             |
| **CPU usage while waiting**     | 100% (wasted)                     | 0% (sleeping)                       |
| **Context switch**              | None                              | Required (expensive)                |
| **Best for**                    | Very short CS (< 1 μs)            | Long CS or I/O in CS                |
| **Processor requirement**       | Multiprocessor                    | Any                                 |
| **Latency**                     | Very low (no OS involvement)      | Higher (OS scheduler delay)         |
| **Throughput under contention** | Poor (CPU wasted on spinning)     | Good (CPU available for other work) |
| **Fairness**                    | None (depends on implementation)  | Usually FIFO wait queue             |
| **Where used**                  | Kernel, real-time, lock-free code | Application-level locking           |

### Hybrid: Adaptive Mutex

Many modern implementations use an **adaptive** approach: spin for a short time, then sleep if the lock isn't acquired.

```text
  acquire(mutex):
    ┌─────────────────────────────────────┐
    │  Spin for up to N iterations        │
    │  (hoping lock becomes free quickly) │
    └────────────┬────────────────────────┘
                 │ Still locked?
          ┌──────┴──────┐
          │Yes          │No
          ↓             ↓
    ┌───────────┐  ┌───────────┐
    │ Block     │  │ Acquired! │
    │ (sleep)   │  │           │
    └───────────┘  └───────────┘
```

> [!TIP]
> Linux's `pthread_mutex` uses an adaptive approach via **futexes** (Fast Userspace Mutexes). The fast path (uncontended lock) runs entirely in user space with a single atomic instruction. Only when contention is detected does it make a system call to sleep.

---

## Lock Contention

**Contention** occurs when multiple threads try to acquire the same lock simultaneously.

### Low Contention vs High Contention

```text
Low Contention:                    High Contention:
  T1: [lock──CS──unlock]           T1: [lock──CS──unlock]
  T2:        [lock──CS──unlock]    T2: [wait][lock──CS──unlock]
  T3:                [lock─CS─un]  T3: [wait][wait][lock──CS──unlock]
                                   T4: [wait][wait][wait][lock──CS──un]
  Little waiting → good throughput  Lots of waiting → poor throughput
```

### The Convoy Problem

When a thread holding a lock is preempted by the OS scheduler, all other threads waiting for that lock form a **convoy** — they pile up waiting, are all woken simultaneously when the lock is released, and then contend again.

```text
  Thread A holds lock → gets preempted (time slice expired)
  ┌──────────────────────────────────────────────┐
  │ Thread B: waiting... waiting... waiting...   │
  │ Thread C: waiting... waiting... waiting...   │  CONVOY
  │ Thread D: waiting... waiting... waiting...   │
  └──────────────────────────────────────────────┘
  Thread A resumes → releases lock → ALL wake up → thundering herd
```

### Reducing Contention

| Strategy                 | Description                                                |
| ------------------------ | ---------------------------------------------------------- |
| **Fine-grained locking** | Use multiple locks for different data partitions           |
| **Lock-free algorithms** | Use CAS instead of locks where possible                    |
| **Read-write locks**     | Allow multiple readers; lock only for writers              |
| **Minimize CS duration** | Keep critical sections as short as possible                |
| **Per-thread data**      | Use TLS to avoid sharing when possible                     |
| **Lock striping**        | Hash-based distribution of locks (e.g., ConcurrentHashMap) |

---

## Pthreads Mutex API

The POSIX Threads library provides a complete mutex API:

### Core Functions

| Function                        | Purpose                          |
| ------------------------------- | -------------------------------- |
| `pthread_mutex_init(&m, &attr)` | Initialize a mutex               |
| `pthread_mutex_destroy(&m)`     | Destroy a mutex                  |
| `pthread_mutex_lock(&m)`        | Acquire (blocks if already held) |
| `pthread_mutex_unlock(&m)`      | Release                          |
| `pthread_mutex_trylock(&m)`     | Non-blocking acquire attempt     |

### Complete Example: Thread-Safe Counter

```c
#include <stdio.h>
#include <pthread.h>
#include <stdlib.h>

typedef struct {
    int value;
    pthread_mutex_t lock;
} SafeCounter;

void counter_init(SafeCounter *c) {
    c->value = 0;
    pthread_mutex_init(&c->lock, NULL);
}

void counter_increment(SafeCounter *c) {
    pthread_mutex_lock(&c->lock);
    c->value++;
    pthread_mutex_unlock(&c->lock);
}

int counter_get(SafeCounter *c) {
    pthread_mutex_lock(&c->lock);
    int val = c->value;
    pthread_mutex_unlock(&c->lock);
    return val;
}

void counter_destroy(SafeCounter *c) {
    pthread_mutex_destroy(&c->lock);
}

/* Worker thread function */
void *worker(void *arg) {
    SafeCounter *c = (SafeCounter *)arg;
    for (int i = 0; i < 500000; i++) {
        counter_increment(c);
    }
    return NULL;
}

int main() {
    SafeCounter counter;
    counter_init(&counter);

    pthread_t threads[4];
    for (int i = 0; i < 4; i++)
        pthread_create(&threads[i], NULL, worker, &counter);

    for (int i = 0; i < 4; i++)
        pthread_join(threads[i], NULL);

    printf("Final value: %d\n", counter_get(&counter));
    printf("Expected:    2000000\n");

    counter_destroy(&counter);
    return 0;
}
```

Compile: `gcc -pthread safe_counter.c -o safe_counter`

### Static Initialization

For statically allocated mutexes, use the initializer macro:

```c
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
/* No need to call pthread_mutex_init() or _destroy() */
```

---

## Recursive / Reentrant Mutexes

A **recursive mutex** (or reentrant mutex) allows the **same thread** to lock it multiple times without deadlocking. An internal counter tracks the number of lock acquisitions; the mutex is only released when the counter reaches zero.

```c
pthread_mutexattr_t attr;
pthread_mutex_t recursive_lock;

pthread_mutexattr_init(&attr);
pthread_mutexattr_settype(&attr, PTHREAD_MUTEX_RECURSIVE);
pthread_mutex_init(&recursive_lock, &attr);
pthread_mutexattr_destroy(&attr);

/* Same thread can lock multiple times */
pthread_mutex_lock(&recursive_lock);    /* count = 1 */
pthread_mutex_lock(&recursive_lock);    /* count = 2 (no deadlock!) */

/* ... critical section ... */

pthread_mutex_unlock(&recursive_lock);  /* count = 1 */
pthread_mutex_unlock(&recursive_lock);  /* count = 0 → actually unlocked */
```

### When to Use Recursive Mutexes

| Scenario                                 |               Normal Mutex                |     Recursive Mutex     |
| ---------------------------------------- | :---------------------------------------: | :---------------------: |
| Simple critical section                  |               ✅ Preferred                |   Works but overkill    |
| Recursive function accessing shared data |               ❌ Deadlocks!               |       ✅ Required       |
| Callback invocation while holding lock   | ❌ Deadlocks if callback locks same mutex |         ✅ Safe         |
| General best practice                    |               ✅ Start here               | Use only when necessary |

> [!WARNING]
> Recursive mutexes can mask design flaws. If you find yourself needing one, consider refactoring to separate the locking logic from the business logic.

---

## Try-Lock: Non-Blocking Acquire

`pthread_mutex_trylock()` attempts to acquire the mutex **without blocking**. If the mutex is already held, it returns immediately with an error.

```c
int result = pthread_mutex_trylock(&lock);
if (result == 0) {
    /* Lock acquired — do work */
    critical_section();
    pthread_mutex_unlock(&lock);
} else if (result == EBUSY) {
    /* Lock is held by someone else — do something else */
    do_alternative_work();
}
```

### Use Cases for Try-Lock

| Use Case                  | Description                                                                    |
| ------------------------- | ------------------------------------------------------------------------------ |
| **Avoiding deadlock**     | Try multiple locks; if one fails, release all and retry                        |
| **Polling pattern**       | Periodically check if a resource is available                                  |
| **Priority-based access** | High-priority thread tries lock; falls back if held                            |
| **Lock ordering**         | When you can't guarantee lock order, use trylock to detect potential deadlocks |

---

## Mutex Types in Pthreads

| Type                 | Constant                   | Behavior on Double Lock | Behavior on Wrong Unlock |
| -------------------- | -------------------------- | :---------------------: | :----------------------: |
| **Normal** (default) | `PTHREAD_MUTEX_NORMAL`     |        Deadlock         |        Undefined         |
| **Error-checking**   | `PTHREAD_MUTEX_ERRORCHECK` |    Returns `EDEADLK`    |     Returns `EPERM`      |
| **Recursive**        | `PTHREAD_MUTEX_RECURSIVE`  |    Increments count     |     Returns `EPERM`      |

> [!TIP]
> During development, use `PTHREAD_MUTEX_ERRORCHECK` to catch bugs like double-locking and unlocking from the wrong thread. Switch to `PTHREAD_MUTEX_NORMAL` in production for maximum performance.

```c
pthread_mutexattr_t attr;
pthread_mutex_t debug_lock;

pthread_mutexattr_init(&attr);
pthread_mutexattr_settype(&attr, PTHREAD_MUTEX_ERRORCHECK);
pthread_mutex_init(&debug_lock, &attr);

int rc = pthread_mutex_lock(&debug_lock);   /* OK */
rc = pthread_mutex_lock(&debug_lock);       /* rc = EDEADLK (instead of deadlock!) */
```

---

## Best Practices and Common Mistakes

### Best Practices

| Practice                         | Reason                                          |
| -------------------------------- | ----------------------------------------------- |
| **Always pair lock/unlock**      | Forgetting unlock → deadlock; use RAII in C++   |
| **Keep CS as short as possible** | Reduces contention and waiting time             |
| **Don't hold locks during I/O**  | I/O is slow; other threads wait unnecessarily   |
| **Use consistent lock ordering** | Prevents deadlock when acquiring multiple locks |
| **Initialize before use**        | Uninitialized mutex → undefined behavior        |
| **Destroy when done**            | Release OS resources associated with the mutex  |

### Common Mistakes

| Mistake                                     | Consequence                           | Fix                                      |
| ------------------------------------------- | ------------------------------------- | ---------------------------------------- |
| Forgetting to unlock                        | Other threads wait forever (deadlock) | Use RAII wrappers or cleanup handlers    |
| Unlocking a mutex you don't own             | Undefined behavior                    | Use error-checking mutex                 |
| Locking inside a loop unnecessarily         | Poor performance                      | Lock outside the loop if possible        |
| Holding lock across `sleep()` or `printf()` | Long CS → high contention             | Move I/O outside CS                      |
| Using different mutexes for the same data   | No actual protection                  | Document which mutex protects which data |
| Not checking return values                  | Silent failures                       | Always check for `EDEADLK`, `EINVAL`     |

### Lock Ordering Example

```text
DEADLOCK:                              SAFE (consistent ordering):

Thread 1:                              Thread 1:
  lock(A)  ←──┐                          lock(A)
  lock(B)     │ circular                  lock(B)
              │ dependency                ...
Thread 2:     │                         Thread 2:
  lock(B)     │                           lock(A) ← same order!
  lock(A)  ───┘                           lock(B)
```

```c
/* Rule: Always acquire lock_a before lock_b */
pthread_mutex_lock(&lock_a);
pthread_mutex_lock(&lock_b);
/* ... critical section ... */
pthread_mutex_unlock(&lock_b);
pthread_mutex_unlock(&lock_a);
```

---

## Futex: Linux's Fast Mutex Implementation

Linux's Pthreads mutexes are built on **futexes** (Fast Userspace Mutexes), which optimize the common case:

```text
  Uncontended case (fast path):       Contended case (slow path):
  ┌──────────────────────────┐        ┌──────────────────────────┐
  │  User space only          │        │  User space atomic fails  │
  │  atomic CAS succeeds     │        │  → System call: futex()  │
  │  → Lock acquired!        │        │  → Thread sleeps in      │
  │  No system call needed   │        │    kernel wait queue     │
  └──────────────────────────┘        └──────────────────────────┘
```

| Path                        | Operations                          | Cost    |
| --------------------------- | ----------------------------------- | ------- |
| **Uncontended acquire**     | One CAS instruction                 | ~20 ns  |
| **Contended acquire**       | CAS + `futex(FUTEX_WAIT)` syscall   | ~1-5 μs |
| **Release with waiters**    | Store + `futex(FUTEX_WAKE)` syscall | ~1-5 μs |
| **Release without waiters** | One store instruction               | ~10 ns  |

> [!NOTE]
> The genius of futexes is that the fast path (no contention — the common case) requires **zero system calls**. The kernel is involved only when contention actually occurs.

---

## Try It Yourself

**Exercise 1:** What happens if Thread A locks a `PTHREAD_MUTEX_NORMAL` mutex and Thread B (a different thread) tries to unlock it? Is this safe?

:::details Solution
This is **undefined behavior** with a normal mutex. The POSIX standard says that unlocking a mutex that the calling thread does not own results in undefined behavior. In practice:

- Some implementations silently unlock it (dangerous — breaks mutual exclusion assumptions).
- Some implementations ignore the unlock call.
- Using `PTHREAD_MUTEX_ERRORCHECK` would return `EPERM` (operation not permitted).

**Rule:** Only the thread that locked a mutex should unlock it.
:::

**Exercise 2:** A program has two shared resources (A and B) protected by two mutexes (`mutex_a` and `mutex_b`). Thread 1 sometimes needs both resources; Thread 2 also sometimes needs both. How would you prevent deadlock?

:::details Solution
**Lock ordering:** Establish a global order (e.g., always lock `mutex_a` before `mutex_b`):

```c
/* Thread 1 */
pthread_mutex_lock(&mutex_a);
pthread_mutex_lock(&mutex_b);
/* ... use A and B ... */
pthread_mutex_unlock(&mutex_b);
pthread_mutex_unlock(&mutex_a);

/* Thread 2 — SAME ORDER */
pthread_mutex_lock(&mutex_a);
pthread_mutex_lock(&mutex_b);
/* ... use A and B ... */
pthread_mutex_unlock(&mutex_b);
pthread_mutex_unlock(&mutex_a);
```

Alternative: **trylock with backoff**:

```c
while (1) {
    pthread_mutex_lock(&mutex_a);
    if (pthread_mutex_trylock(&mutex_b) == 0)
        break;  /* Got both locks */
    pthread_mutex_unlock(&mutex_a);
    usleep(rand() % 1000);  /* Random backoff */
}
```

:::

---

## Key Takeaways

- A **mutex** is the simplest synchronization tool — `acquire()` to enter a critical section, `release()` to leave.
- **Spinlocks** (busy-wait) are fast for very short critical sections on multiprocessors; **blocking mutexes** (sleep-wait) are better for longer critical sections or single-processor systems.
- **Adaptive mutexes** (like Linux futexes) spin briefly, then block — combining the best of both approaches.
- **Lock contention** degrades performance; reduce it through fine-grained locking, shorter critical sections, and lock-free alternatives.
- The Pthreads API provides `pthread_mutex_lock()`, `unlock()`, `trylock()`, and `init()`/`destroy()` for complete mutex management.
- **Recursive mutexes** allow the same thread to lock multiple times without deadlocking — useful for recursive functions but may mask design issues.
- **Try-lock** provides non-blocking lock attempts, useful for deadlock avoidance and polling patterns.
- **Lock ordering** (always acquiring locks in the same global order) is the primary technique for preventing deadlocks with multiple mutexes.
- Linux **futexes** optimize the common uncontended case to require zero system calls, making mutex operations extremely fast when there's no contention.
