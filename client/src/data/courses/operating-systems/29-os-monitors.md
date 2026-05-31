---
title: Monitors
---

# Monitors

Semaphores are powerful but dangerous — a single misplaced `wait()` or `signal()` can cause deadlocks, missed wake-ups, or race conditions. **Monitors** are a higher-level synchronization abstraction that encapsulates shared data, operations, and synchronization into a single construct, making correct synchronization much easier. In this lesson, we explore the monitor concept, condition variables, Hoare vs Mesa semantics, and practical implementations in Java and Pthreads.

---

## Why Semaphores Are Error-Prone

Semaphores place the entire burden of correctness on the programmer. A single mistake can have catastrophic consequences:

| Mistake                | Code                                | Consequence                           |
| ---------------------- | ----------------------------------- | ------------------------------------- |
| **Swapped operations** | `signal(mutex)` ... `wait(mutex)`   | Multiple threads in CS simultaneously |
| **Missing signal**     | `wait(mutex)` ... (forgot `signal`) | Deadlock — no one can enter CS again  |
| **Missing wait**       | (forgot `wait`) ... `signal(mutex)` | No mutual exclusion — race condition  |
| **Wrong semaphore**    | `wait(A)` instead of `wait(B)`      | Wrong resource controlled             |
| **Wrong order**        | `wait(mutex)` before `wait(empty)`  | Deadlock in producer-consumer         |

> "With semaphores, the correctness of the entire program depends on each programmer getting every `wait` and `signal` exactly right. This is unreasonable for large programs."
> — _Per Brinch Hansen_

---

## The Monitor Concept

A **monitor** is a high-level synchronization construct that groups together:

1. **Shared data** (variables)
2. **Procedures** (functions) that operate on the data
3. **Synchronization** — automatic mutual exclusion for all procedures

> A monitor guarantees that **only one thread can be active inside the monitor at any time**. All other threads attempting to enter are automatically blocked.

### Monitor Structure

```text
┌───────────────────────────────────────────────┐
│                  MONITOR                      │
│                                               │
│  ┌───────────────────────────────────────┐    │
│  │         Shared Data                   │    │
│  │  int count;                           │    │
│  │  int buffer[N];                       │    │
│  └───────────────────────────────────────┘    │
│                                               │
│  ┌───────────────────────────────────────┐    │
│  │         Condition Variables           │    │
│  │  condition not_full;                  │    │
│  │  condition not_empty;                 │    │
│  └───────────────────────────────────────┘    │
│                                               │
│  ┌───────────────────────────────────────┐    │
│  │         Procedures                    │    │
│  │  void insert(int item) { ... }        │    │
│  │  int remove() { ... }                 │    │
│  └───────────────────────────────────────┘    │
│                                               │
│  ┌───────────────────────────────────────┐    │
│  │     Initialization Code               │    │
│  │  count = 0;                           │    │
│  └───────────────────────────────────────┘    │
│                                               │
│  ════════════════════════════════════════     │
│       Entry Queue                             │
│  [Thread C] [Thread B] → waiting to enter     │
└───────────────────────────────────────────────┘
         ↑
    Thread A is inside
    (only one at a time)
```

The monitor automatically provides mutual exclusion — the programmer doesn't write `lock()` / `unlock()` calls.

---

## Condition Variables

Mutual exclusion alone isn't enough — we also need threads to **wait for specific conditions**. A **condition variable** provides two operations:

| Operation           | Action                                                          |
| ------------------- | --------------------------------------------------------------- |
| `wait(condition)`   | Release the monitor lock, block until signaled, re-acquire lock |
| `signal(condition)` | Wake up one thread waiting on this condition                    |

### How Condition Variables Work

```text
Thread A is inside monitor:
  - Checks condition: "buffer is full?"
  - YES → calls wait(not_full)
    1. Release monitor lock
    2. A goes to sleep on not_full queue
    3. Another thread can enter monitor

Thread B enters monitor:
  - Removes item from buffer
  - Calls signal(not_full)
    → Wakes up Thread A

Thread A wakes up:
  - Re-acquires monitor lock
  - Continues from where it called wait()
```

> [!IMPORTANT]
> Condition variable `wait()` is fundamentally different from semaphore `wait()`:
>
> - Semaphore `wait()` decrements a counter — it has "memory" (accumulated signals count).
> - Condition `wait()` **always** blocks — a signal with no waiter is **lost**.

### Condition Variable vs Semaphore

| Feature                   |           Condition Variable            |         Semaphore          |
| ------------------------- | :-------------------------------------: | :------------------------: |
| **Remembers signals**     |    No — signal is lost if no waiter     | Yes — value is incremented |
| **Always blocks on wait** |                   Yes                   |     Only if value ≤ 0      |
| **Associated lock**       |    Must be used with a mutex/monitor    |       Self-contained       |
| **Wakeup**                | Signaled thread must re-check condition |  Signaled thread proceeds  |
| **Spurious wakeup**       |       Possible (use `while` loop)       |             No             |

---

## Hoare vs Mesa Monitor Semantics

When Thread A signals Thread B (which is waiting on a condition variable), both threads want to be inside the monitor — but only one can be active. This creates a design choice:

### Hoare Monitors (Signal-and-Switch)

When Thread A calls `signal()`:

1. Thread A is **immediately suspended**
2. Thread B wakes up and runs **immediately inside the monitor**
3. When Thread B exits or waits, Thread A resumes

```text
Hoare Semantics:

Thread A (signaler):  [──in monitor──signal──SUSPEND──resume──]
Thread B (waiter):                         [──RUNS──exits──]
                                            ↑
                                    B runs IMMEDIATELY
                                    Condition is guaranteed true
```

### Mesa Monitors (Signal-and-Continue)

When Thread A calls `signal()`:

1. Thread A **continues running** inside the monitor
2. Thread B is moved to the "ready" queue but doesn't run yet
3. Thread B runs later when it re-acquires the monitor lock

```text
Mesa Semantics:

Thread A (signaler):  [──in monitor──signal──continues──exits──]
Thread B (waiter):                                        [──RUNS──]
                                                           ↑
                                              B runs LATER, must
                                              RE-CHECK condition!
```

### Comparison

| Feature                 | Hoare                              | Mesa                                        |
| ----------------------- | ---------------------------------- | ------------------------------------------- |
| **After signal()**      | Signaler suspends                  | Signaler continues                          |
| **Condition guarantee** | Condition is TRUE when waiter runs | Condition MIGHT be false (re-check!)        |
| **Wait pattern**        | `if (condition) wait(cv);`         | `while (condition) wait(cv);`               |
| **Implementation**      | Complex (extra context switch)     | Simpler (just move to ready queue)          |
| **Efficiency**          | Less efficient (extra switches)    | More efficient                              |
| **Used in practice**    | Rare (original academic concept)   | **Nearly universal** (Java, Pthreads, etc.) |

> [!WARNING]
> In Mesa semantics (which is what Java, Pthreads, and almost all real systems use), you **must** use a `while` loop to re-check the condition after waking up:
>
> ```c
> while (buffer_is_empty)     /* NOT if! */
>     wait(not_empty);
> ```
>
> Between the signal and the waiter actually running, another thread might have already consumed the item.

---

## Implementing Monitors with Semaphores

We can build a monitor from semaphores:

```c
semaphore_t monitor_lock;   /* Binary semaphore for mutual exclusion */
sem_init(&monitor_lock, 1);

/* Condition variable implemented with semaphore + counter */
typedef struct {
    semaphore_t sem;
    int waiters;
} condition_t;

void cond_init(condition_t *c) {
    sem_init(&c->sem, 0);
    c->waiters = 0;
}

void cond_wait(condition_t *c, semaphore_t *lock) {
    c->waiters++;
    signal(lock);          /* Release monitor lock */
    wait(&c->sem);         /* Block on condition */
    wait(lock);            /* Re-acquire monitor lock */
}

void cond_signal(condition_t *c) {
    if (c->waiters > 0) {
        c->waiters--;
        signal(&c->sem);  /* Wake one waiter */
    }
    /* If no waiters, signal is lost (unlike semaphore) */
}
```

```text
  Monitor entry:
    wait(monitor_lock)    → acquire exclusive access

  Condition wait:
    signal(monitor_lock)  → release monitor
    wait(cond_sem)        → sleep on condition
    wait(monitor_lock)    → re-acquire monitor

  Condition signal:
    signal(cond_sem)      → wake one waiter (if any)

  Monitor exit:
    signal(monitor_lock)  → release exclusive access
```

---

## Java synchronized Keyword

Java provides built-in monitor support through the `synchronized` keyword. Every Java object has an intrinsic lock (monitor) and can have threads waiting on it.

### Basic Synchronized Block

```java
public class BoundedBuffer {
    private int[] buffer;
    private int count, in, out;
    private final int size;

    public BoundedBuffer(int size) {
        this.size = size;
        buffer = new int[size];
        count = 0; in = 0; out = 0;
    }

    public synchronized void insert(int item) throws InterruptedException {
        while (count == size)        /* Buffer full — wait */
            wait();                   /* Release lock, sleep */

        buffer[in] = item;
        in = (in + 1) % size;
        count++;

        notifyAll();                  /* Wake consumers */
    }

    public synchronized int remove() throws InterruptedException {
        while (count == 0)           /* Buffer empty — wait */
            wait();                   /* Release lock, sleep */

        int item = buffer[out];
        out = (out + 1) % size;
        count--;

        notifyAll();                  /* Wake producers */
        return item;
    }
}
```

### Java Monitor Methods

| Method                   | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| `synchronized` (keyword) | Acquires the object's intrinsic lock                  |
| `wait()`                 | Release lock, block until notified, re-acquire lock   |
| `notify()`               | Wake up ONE waiting thread (which one is unspecified) |
| `notifyAll()`            | Wake up ALL waiting threads (recommended)             |

> [!TIP]
> Always prefer `notifyAll()` over `notify()` in Java. With `notify()`, the JVM picks an arbitrary waiting thread — if that thread's condition isn't satisfied, it goes back to sleep, and a thread whose condition IS satisfied remains asleep. Using `notifyAll()` ensures all threads get a chance to check their conditions.

### Java Producer-Consumer

```java
public class ProducerConsumer {
    public static void main(String[] args) {
        BoundedBuffer buffer = new BoundedBuffer(5);

        Thread producer = new Thread(() -> {
            for (int i = 0; i < 20; i++) {
                try {
                    buffer.insert(i);
                    System.out.println("Produced: " + i);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });

        Thread consumer = new Thread(() -> {
            for (int i = 0; i < 20; i++) {
                try {
                    int item = buffer.remove();
                    System.out.println("Consumed: " + item);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });

        producer.start();
        consumer.start();
    }
}
```

---

## Pthreads Condition Variables

POSIX Threads provide condition variables that work with mutexes to implement monitor-like behavior.

### API

| Function                               | Purpose                                               |
| -------------------------------------- | ----------------------------------------------------- |
| `pthread_cond_init(&cv, &attr)`        | Initialize condition variable                         |
| `pthread_cond_destroy(&cv)`            | Destroy condition variable                            |
| `pthread_cond_wait(&cv, &mutex)`       | Atomically release mutex and wait; re-acquire on wake |
| `pthread_cond_signal(&cv)`             | Wake one waiting thread                               |
| `pthread_cond_broadcast(&cv)`          | Wake all waiting threads                              |
| `pthread_cond_timedwait(&cv, &m, &ts)` | Wait with timeout                                     |

### Complete Pthreads Bounded Buffer

```c
#include <stdio.h>
#include <pthread.h>

#define BUFFER_SIZE 5

typedef struct {
    int buffer[BUFFER_SIZE];
    int count, in, out;
    pthread_mutex_t lock;
    pthread_cond_t not_full;
    pthread_cond_t not_empty;
} BoundedBuffer;

void bb_init(BoundedBuffer *bb) {
    bb->count = 0;
    bb->in = 0;
    bb->out = 0;
    pthread_mutex_init(&bb->lock, NULL);
    pthread_cond_init(&bb->not_full, NULL);
    pthread_cond_init(&bb->not_empty, NULL);
}

void bb_insert(BoundedBuffer *bb, int item) {
    pthread_mutex_lock(&bb->lock);

    while (bb->count == BUFFER_SIZE)                /* Buffer full */
        pthread_cond_wait(&bb->not_full, &bb->lock); /* Wait */

    bb->buffer[bb->in] = item;
    bb->in = (bb->in + 1) % BUFFER_SIZE;
    bb->count++;

    pthread_cond_signal(&bb->not_empty);  /* Signal consumer */
    pthread_mutex_unlock(&bb->lock);
}

int bb_remove(BoundedBuffer *bb) {
    pthread_mutex_lock(&bb->lock);

    while (bb->count == 0)                            /* Buffer empty */
        pthread_cond_wait(&bb->not_empty, &bb->lock); /* Wait */

    int item = bb->buffer[bb->out];
    bb->out = (bb->out + 1) % BUFFER_SIZE;
    bb->count--;

    pthread_cond_signal(&bb->not_full);   /* Signal producer */
    pthread_mutex_unlock(&bb->lock);
    return item;
}

void *producer(void *arg) {
    BoundedBuffer *bb = (BoundedBuffer *)arg;
    for (int i = 1; i <= 15; i++) {
        bb_insert(bb, i);
        printf("Produced: %d\n", i);
    }
    return NULL;
}

void *consumer(void *arg) {
    BoundedBuffer *bb = (BoundedBuffer *)arg;
    for (int i = 0; i < 15; i++) {
        int item = bb_remove(bb);
        printf("Consumed: %d\n", item);
    }
    return NULL;
}

int main() {
    BoundedBuffer bb;
    bb_init(&bb);

    pthread_t prod, cons;
    pthread_create(&prod, NULL, producer, &bb);
    pthread_create(&cons, NULL, consumer, &bb);

    pthread_join(prod, NULL);
    pthread_join(cons, NULL);

    pthread_mutex_destroy(&bb.lock);
    pthread_cond_destroy(&bb.not_full);
    pthread_cond_destroy(&bb.not_empty);
    return 0;
}
```

Compile: `gcc -pthread bounded_buffer.c -o bounded_buffer`

### The Critical Pattern

```c
/* THE standard pattern for condition variables */
pthread_mutex_lock(&mutex);

while (!condition)                              /* WHILE, not IF! */
    pthread_cond_wait(&cond_var, &mutex);        /* Atomically unlock + sleep */

/* Condition is now true — do work */
do_something();

pthread_cond_signal(&other_cond_var);           /* Signal other waiters */
pthread_mutex_unlock(&mutex);
```

> [!IMPORTANT]
> Always use `while (!condition)` instead of `if (!condition)` before `pthread_cond_wait()`. This handles:
>
> 1. **Spurious wakeups** — POSIX allows `pthread_cond_wait` to return without being signaled
> 2. **Mesa semantics** — the condition might become false again between the signal and the waiter running
> 3. **Multiple waiters** — only one can proceed; others must re-check

---

## Monitor vs Semaphore Summary

| Feature               | Monitor                                | Semaphore                             |
| --------------------- | -------------------------------------- | ------------------------------------- |
| **Abstraction level** | High (encapsulates data + operations)  | Low (just a counter + operations)     |
| **Mutual exclusion**  | Automatic (compiler/language enforced) | Manual (programmer must get it right) |
| **Condition waiting** | Condition variables with wait/signal   | Counter-based wait/signal             |
| **Signal memory**     | Lost if no waiter                      | Remembered (counter incremented)      |
| **Error proneness**   | Low (structure prevents many errors)   | High (wrong order, missing ops)       |
| **Language support**  | Java (`synchronized`), C# (`lock`)     | POSIX (`sem_wait`, `sem_post`)        |
| **Flexibility**       | Less flexible (structured)             | More flexible (unstructured)          |
| **Best for**          | Application-level synchronization      | OS-level, inter-process sync          |

```text
  Error risk spectrum:

  Low risk ─────────────────────────────── High risk
  Monitors    Mutexes    Semaphores    Raw atomics
     │           │           │              │
  Language     Library     Library       Hardware
  enforced     enforced    (manual)      (manual)
```

---

## Try It Yourself

**Exercise 1:** In Java, what happens if you call `wait()` or `notify()` outside a `synchronized` block? Why does Java enforce this restriction?

:::details Solution
Java throws an `IllegalMonitorStateException` at runtime. You MUST hold the object's intrinsic lock (be inside a `synchronized` block for that object) before calling `wait()`, `notify()`, or `notifyAll()`.

Java enforces this because:

1. `wait()` needs to atomically release the lock and block the thread. If you don't hold the lock, there's nothing to release.
2. Without the lock, there would be a race condition between checking a condition and calling `wait()` — another thread could change the condition and call `notify()` between the check and the wait, causing a **lost wakeup**.

```java
// WRONG — throws IllegalMonitorStateException
void broken() {
    wait();  // Not in synchronized block!
}

// CORRECT
synchronized void correct() {
    while (!condition)
        wait();   // Lock is held → can safely release + wait
}
```

:::

**Exercise 2:** Implement a `print_in_order` solution using Pthreads condition variables where three threads print "first", "second", "third" in order.

:::details Solution

```c
#include <stdio.h>
#include <pthread.h>

int state = 1;
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t cond = PTHREAD_COND_INITIALIZER;

void *print_first(void *arg) {
    pthread_mutex_lock(&lock);
    while (state != 1)
        pthread_cond_wait(&cond, &lock);
    printf("first\n");
    state = 2;
    pthread_cond_broadcast(&cond);
    pthread_mutex_unlock(&lock);
    return NULL;
}

void *print_second(void *arg) {
    pthread_mutex_lock(&lock);
    while (state != 2)
        pthread_cond_wait(&cond, &lock);
    printf("second\n");
    state = 3;
    pthread_cond_broadcast(&cond);
    pthread_mutex_unlock(&lock);
    return NULL;
}

void *print_third(void *arg) {
    pthread_mutex_lock(&lock);
    while (state != 3)
        pthread_cond_wait(&cond, &lock);
    printf("third\n");
    pthread_mutex_unlock(&lock);
    return NULL;
}

int main() {
    pthread_t t1, t2, t3;
    /* Create in reverse order */
    pthread_create(&t3, NULL, print_third, NULL);
    pthread_create(&t2, NULL, print_second, NULL);
    pthread_create(&t1, NULL, print_first, NULL);

    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    pthread_join(t3, NULL);
    return 0;
}
/* Always prints: first, second, third */
```

:::

---

## Key Takeaways

- **Monitors** are high-level synchronization constructs that encapsulate shared data, operations, and automatic mutual exclusion in a single abstraction.
- Monitors prevent many common semaphore errors by ensuring only **one thread is active inside the monitor** at any time.
- **Condition variables** allow threads to wait for specific conditions (`wait()`) and notify others when conditions change (`signal()` / `broadcast()`).
- **Hoare semantics** (signal-and-switch) guarantee the condition is true when the waiter runs; **Mesa semantics** (signal-and-continue) require the waiter to re-check. Nearly all real systems use Mesa semantics.
- **Always use `while` (not `if`)** before `pthread_cond_wait()` or Java's `wait()` to handle spurious wakeups and Mesa semantics.
- Java provides built-in monitors via `synchronized`, `wait()`, `notify()`, and `notifyAll()`.
- Pthreads provides condition variables via `pthread_cond_wait()`, `pthread_cond_signal()`, and `pthread_cond_broadcast()`, used together with a `pthread_mutex_t`.
- Monitors are less flexible than semaphores but significantly **safer** — they make incorrect usage much harder by design.
