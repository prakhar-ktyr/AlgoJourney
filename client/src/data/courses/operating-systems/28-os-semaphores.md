---
title: Semaphores
section: "Process Synchronization"
---

# Semaphores

Mutexes solve the mutual exclusion problem elegantly, but they can't easily handle more complex synchronization patterns — like coordinating the order of operations between threads, or managing access to a pool of identical resources. **Semaphores**, invented by Edsger Dijkstra in 1965, are a more powerful and general synchronization primitive. In this lesson, we explore semaphore theory, implementation, and practical applications including the Producer-Consumer problem.

---

## Dijkstra's Semaphore Concept

> A **semaphore** $S$ is an integer variable that, apart from initialization, is accessed only through two standard atomic operations: **wait** (P) and **signal** (V).

The names P and V come from Dutch: **Proberen** (to test/try) and **Verhogen** (to increment).

> "I owe the invention of semaphores to the needs of the THE Multiprogramming System."
> — _Edsger W. Dijkstra_

### Semaphore Operations

```c
/* wait() — also called P(), down(), acquire() */
wait(S) {
    while (S <= 0)
        ;  /* wait — block until S > 0 */
    S--;   /* Decrement (consume one unit) */
}

/* signal() — also called V(), up(), release() */
signal(S) {
    S++;   /* Increment (produce one unit) */
}
```

> [!IMPORTANT]
> Both `wait()` and `signal()` must be **atomic** — the test-and-decrement in `wait()` and the increment in `signal()` cannot be interrupted. This is enforced by the OS or hardware.

### Naming Conventions Across Textbooks

| Operation        | Dijkstra     | POSIX        | Java        | This Lesson |
| ---------------- | ------------ | ------------ | ----------- | ----------- |
| Decrease/acquire | P (Proberen) | `sem_wait()` | `acquire()` | `wait()`    |
| Increase/release | V (Verhogen) | `sem_post()` | `release()` | `signal()`  |

---

## Counting Semaphore vs Binary Semaphore

| Feature            |          Binary Semaphore          |        Counting Semaphore         |
| ------------------ | :--------------------------------: | :-------------------------------: |
| **Value range**    |               0 or 1               | 0 to N (any non-negative integer) |
| **Purpose**        |  Mutual exclusion (like a mutex)   |    Resource counting, ordering    |
| **Analogy**        | Bathroom door lock (one occupant)  |     Parking lot with N spaces     |
| **Initial value**  | 1 (for mutex) or 0 (for signaling) | N (number of available resources) |
| **When value = 0** |         Resource is locked         |     All resources are in use      |

```text
Binary Semaphore (S=1):        Counting Semaphore (S=3):

  ┌─────┐                      ┌─────┐
  │ S=1 │ → wait → S=0         │ S=3 │ → wait → S=2
  └─────┘                      └─────┘
  Thread A in CS                Thread A enters
  Thread B waits (S=0)          → wait → S=1
                                Thread B enters
  Thread A signals → S=1       → wait → S=0
  Thread B enters (S=0)         Thread C enters
                                Thread D waits (S=0)
```

---

## Implementation WITHOUT Busy Waiting

The pseudocode above uses busy waiting (`while (S <= 0)`), which wastes CPU. A proper implementation uses **blocking** with a wait queue:

### Semaphore Data Structure

```c
typedef struct {
    int value;                    /* Semaphore value */
    struct list_head wait_queue;  /* Queue of blocked threads */
    spinlock_t lock;              /* Protect the semaphore itself */
} semaphore_t;
```

### Blocking wait() and signal()

```c
void wait(semaphore_t *S) {
    spin_lock(&S->lock);
    S->value--;
    if (S->value < 0) {
        /* Add current thread to wait queue */
        add_to_queue(&S->wait_queue, current_thread);
        spin_unlock(&S->lock);
        block();   /* Put thread to sleep */
    } else {
        spin_unlock(&S->lock);
    }
}

void signal(semaphore_t *S) {
    spin_lock(&S->lock);
    S->value++;
    if (S->value <= 0) {
        /* Wake up one thread from wait queue */
        thread_t *t = remove_from_queue(&S->wait_queue);
        spin_unlock(&S->lock);
        wakeup(t);
    } else {
        spin_unlock(&S->lock);
    }
}
```

### How the Value Encodes State

| Value of S | Meaning                                      |
| :--------: | -------------------------------------------- | --- | ------------------------------------- |
|   S > 0    | S resources are available; no one is waiting |
|   S = 0    | No resources available; no one waiting yet   |
|   S < 0    |                                              | S   | threads are blocked in the wait queue |

```text
S = 3:  Three resources free, zero waiting
S = 0:  Zero resources free, zero waiting
S = -2: Zero resources free, two threads blocked
```

> [!NOTE]
> When `S->value` goes negative, its absolute value equals the number of waiting threads. This is a clever encoding: the semaphore value simultaneously tracks available resources and waiting threads.

---

## Using Semaphores for Mutual Exclusion

A binary semaphore initialized to 1 can be used as a mutex:

```c
semaphore_t mutex;
sem_init(&mutex, 1);  /* Initialize to 1 */

/* Thread A */                      /* Thread B */
wait(&mutex);  /* S: 1→0 */        wait(&mutex);  /* blocks (S=0→-1) */
/* Critical Section */              /* ... waiting ... */
signal(&mutex); /* S: -1→0, wake */ /* Critical Section (woken up) */
                                    signal(&mutex); /* S: 0→1 */
```

---

## Using Semaphores for Process Ordering

Semaphores can enforce that one operation happens before another:

```c
semaphore_t sync_sem;
sem_init(&sync_sem, 0);  /* Initialize to 0 — no "permits" yet */

/* Thread A: must execute statement1 before Thread B's statement2 */
/* Thread A */                        /* Thread B */
execute(statement1);                  wait(&sync_sem);  /* Block until signal */
signal(&sync_sem);  /* S: 0→1 */     execute(statement2); /* Only after statement1 */
```

```text
Scenario 1 (A runs first):         Scenario 2 (B runs first):

A: statement1                       B: wait(sync) → blocks (S=0→-1)
A: signal(sync) → S=1              A: statement1
B: wait(sync) → S=0, proceeds      A: signal(sync) → S=-1→0, wake B
B: statement2  ✓                    B: statement2  ✓

Either way, statement1 happens before statement2!
```

---

## Using Counting Semaphores for Resource Counting

A counting semaphore manages a pool of identical resources:

```c
#define POOL_SIZE 5
semaphore_t connection_pool;
sem_init(&connection_pool, POOL_SIZE);  /* 5 available connections */

void use_connection() {
    wait(&connection_pool);        /* Acquire a connection (S--) */
    /* Use the database connection */
    connection_t *conn = get_from_pool();
    execute_query(conn);
    return_to_pool(conn);
    signal(&connection_pool);      /* Release connection (S++) */
}
```

```text
  Initially: S = 5 (5 connections available)

  Thread 1: wait → S=4   (gets connection)
  Thread 2: wait → S=3   (gets connection)
  Thread 3: wait → S=2   (gets connection)
  Thread 4: wait → S=1   (gets connection)
  Thread 5: wait → S=0   (gets connection)
  Thread 6: wait → S=-1  (BLOCKS — no connections!)

  Thread 2: signal → S=0 (returns connection, wakes Thread 6)
  Thread 6: gets connection and proceeds
```

---

## Producer-Consumer Problem with Semaphores

The **Producer-Consumer** (or **Bounded-Buffer**) problem is a classic synchronization problem where producers generate data items and place them into a fixed-size buffer, while consumers remove and process items.

### The Setup

```text
  ┌──────────┐    ┌───┬───┬───┬───┬───┐    ┌──────────┐
  │ Producer │───→│ 0 │ 1 │ 2 │ 3 │ 4 │───→│ Consumer │
  │          │    └───┴───┴───┴───┴───┘    │          │
  │ Produces │     Buffer (size = 5)       │ Consumes │
  │ items    │                              │ items    │
  └──────────┘                              └──────────┘
```

### Three Synchronization Requirements

| Requirement          | Semaphore        | Purpose                                   |
| -------------------- | ---------------- | ----------------------------------------- |
| **Mutual exclusion** | `mutex` (init=1) | Only one thread accesses buffer at a time |
| **Buffer not full**  | `empty` (init=N) | Producer waits when buffer is full        |
| **Buffer not empty** | `full` (init=0)  | Consumer waits when buffer is empty       |

### Solution

```c
#define BUFFER_SIZE 5

int buffer[BUFFER_SIZE];
int in = 0, out = 0;

semaphore_t mutex;   /* Binary semaphore for mutual exclusion */
semaphore_t empty;   /* Counts empty slots */
semaphore_t full;    /* Counts filled slots */

void init() {
    sem_init(&mutex, 1);
    sem_init(&empty, BUFFER_SIZE);  /* All slots empty initially */
    sem_init(&full, 0);             /* No items initially */
}

/* Producer */
void *producer(void *arg) {
    while (true) {
        int item = produce_item();

        wait(&empty);          /* Wait for empty slot (empty--) */
        wait(&mutex);          /* Enter critical section */

        buffer[in] = item;
        in = (in + 1) % BUFFER_SIZE;

        signal(&mutex);        /* Exit critical section */
        signal(&full);         /* Signal that item is available (full++) */
    }
}

/* Consumer */
void *consumer(void *arg) {
    while (true) {
        wait(&full);           /* Wait for available item (full--) */
        wait(&mutex);          /* Enter critical section */

        int item = buffer[out];
        out = (out + 1) % BUFFER_SIZE;

        signal(&mutex);        /* Exit critical section */
        signal(&empty);        /* Signal that slot is free (empty++) */

        consume_item(item);
    }
}
```

### Trace Through Execution

```text
Initial: empty=5, full=0, mutex=1, buffer=[_,_,_,_,_]

Producer produces item A:
  wait(empty): 5→4     (one less empty slot)
  wait(mutex): 1→0     (enter CS)
  buffer[0] = A → [A,_,_,_,_], in=1
  signal(mutex): 0→1   (exit CS)
  signal(full): 0→1    (one item available)

Consumer consumes:
  wait(full): 1→0      (one less item)
  wait(mutex): 1→0     (enter CS)
  item = buffer[0] = A → [_,_,_,_,_], out=1
  signal(mutex): 0→1   (exit CS)
  signal(empty): 4→5   (one more empty slot)
```

---

## Common Mistake: Deadlock with Incorrect Semaphore Ordering

> [!WARNING]
> The order of `wait()` calls matters! Swapping the order of `wait(&empty)` and `wait(&mutex)` in the producer can cause **deadlock**.

### The Deadlock

```c
/* WRONG — causes deadlock! */
void *producer_wrong(void *arg) {
    while (true) {
        int item = produce_item();
        wait(&mutex);          /* Lock FIRST (wrong order!) */
        wait(&empty);          /* Wait for empty slot WHILE HOLDING mutex */
        /* If buffer is full, we block here holding mutex.
           Consumer can't acquire mutex to consume → DEADLOCK! */
        buffer[in] = item;
        in = (in + 1) % BUFFER_SIZE;
        signal(&mutex);
        signal(&full);
    }
}
```

```text
  Producer: wait(mutex) → acquired
  Producer: wait(empty) → BLOCKS (buffer full, empty=0)

  Consumer: wait(full) → can proceed (full > 0)
  Consumer: wait(mutex) → BLOCKS (held by producer!)

  ┌────────────────────────────────────────────┐
  │ Producer waits for empty slot              │
  │   ↑ (needs consumer to consume)            │
  │   │                                        │
  │   └── Consumer waits for mutex ←───────────┤
  │        (held by producer)                  │
  │                                            │
  │  CIRCULAR DEPENDENCY → DEADLOCK!           │
  └────────────────────────────────────────────┘
```

**Rule:** Always acquire the counting semaphore (empty/full) BEFORE the mutex, so you don't hold the mutex while waiting for a condition.

---

## POSIX Semaphore API

POSIX provides two types of semaphores:

### Named vs Unnamed Semaphores

| Type        | Created With | Scope                               | Use Case                |
| ----------- | ------------ | ----------------------------------- | ----------------------- |
| **Unnamed** | `sem_init()` | Within a process (or shared memory) | Thread synchronization  |
| **Named**   | `sem_open()` | Between processes                   | Process synchronization |

### Core API

| Function                         | Purpose                      |
| -------------------------------- | ---------------------------- |
| `sem_init(&sem, pshared, value)` | Initialize unnamed semaphore |
| `sem_destroy(&sem)`              | Destroy unnamed semaphore    |
| `sem_wait(&sem)`                 | Decrement (block if zero)    |
| `sem_post(&sem)`                 | Increment (wake one waiter)  |
| `sem_trywait(&sem)`              | Non-blocking wait            |
| `sem_getvalue(&sem, &val)`       | Read current value           |

### Complete POSIX Semaphore Example

```c
#include <stdio.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>

#define BUFFER_SIZE 3

int buffer[BUFFER_SIZE];
int in = 0, out = 0;

sem_t mutex, empty_slots, full_slots;

void *producer(void *arg) {
    for (int i = 1; i <= 10; i++) {
        sem_wait(&empty_slots);
        sem_wait(&mutex);

        buffer[in] = i;
        printf("Produced: %d at position %d\n", i, in);
        in = (in + 1) % BUFFER_SIZE;

        sem_post(&mutex);
        sem_post(&full_slots);

        usleep(100000);  /* Simulate production time */
    }
    return NULL;
}

void *consumer(void *arg) {
    for (int i = 0; i < 10; i++) {
        sem_wait(&full_slots);
        sem_wait(&mutex);

        int item = buffer[out];
        printf("Consumed: %d from position %d\n", item, out);
        out = (out + 1) % BUFFER_SIZE;

        sem_post(&mutex);
        sem_post(&empty_slots);

        usleep(150000);  /* Simulate consumption time */
    }
    return NULL;
}

int main() {
    sem_init(&mutex, 0, 1);
    sem_init(&empty_slots, 0, BUFFER_SIZE);
    sem_init(&full_slots, 0, 0);

    pthread_t prod, cons;
    pthread_create(&prod, NULL, producer, NULL);
    pthread_create(&cons, NULL, consumer, NULL);

    pthread_join(prod, NULL);
    pthread_join(cons, NULL);

    sem_destroy(&mutex);
    sem_destroy(&empty_slots);
    sem_destroy(&full_slots);

    return 0;
}
```

Compile: `gcc -pthread semaphore_pc.c -o semaphore_pc`

> [!TIP]
> On macOS, unnamed semaphores (`sem_init`) are deprecated. Use named semaphores (`sem_open`) or GCD dispatch semaphores instead.

---

## Semaphore vs Mutex: When to Use Which

| Feature                  | Mutex                           | Semaphore                       |
| ------------------------ | ------------------------------- | ------------------------------- |
| **Value range**          | 0 or 1 (locked/unlocked)        | 0 to N                          |
| **Ownership**            | Yes — only the owner can unlock | No — any thread can signal      |
| **Use case**             | Protecting a critical section   | Signaling, resource counting    |
| **Priority inheritance** | Supported on some OSes          | Not supported                   |
| **Multiple resources**   | One lock = one resource         | Count tracks multiple resources |
| **Ordering**             | Not designed for ordering       | Excellent for ordering          |

---

## Try It Yourself

**Exercise 1:** Using semaphores, implement a solution where three threads must execute in the order: Thread A → Thread B → Thread C, regardless of creation order.

:::details Solution

```c
#include <stdio.h>
#include <pthread.h>
#include <semaphore.h>

sem_t sem_ab;  /* A signals B */
sem_t sem_bc;  /* B signals C */

void *thread_a(void *arg) {
    printf("Thread A executing\n");
    sem_post(&sem_ab);  /* Signal B to proceed */
    return NULL;
}

void *thread_b(void *arg) {
    sem_wait(&sem_ab);  /* Wait for A */
    printf("Thread B executing\n");
    sem_post(&sem_bc);  /* Signal C to proceed */
    return NULL;
}

void *thread_c(void *arg) {
    sem_wait(&sem_bc);  /* Wait for B */
    printf("Thread C executing\n");
    return NULL;
}

int main() {
    sem_init(&sem_ab, 0, 0);
    sem_init(&sem_bc, 0, 0);

    pthread_t ta, tb, tc;
    /* Create in reverse order to prove ordering works */
    pthread_create(&tc, NULL, thread_c, NULL);
    pthread_create(&tb, NULL, thread_b, NULL);
    pthread_create(&ta, NULL, thread_a, NULL);

    pthread_join(ta, NULL);
    pthread_join(tb, NULL);
    pthread_join(tc, NULL);

    sem_destroy(&sem_ab);
    sem_destroy(&sem_bc);
    return 0;
}
/* Always prints: A, B, C regardless of creation order */
```

:::

**Exercise 2:** A system has 3 printers managed by a counting semaphore initialized to 3. Five jobs arrive. Trace the semaphore value and which jobs are printing/waiting.

:::details Solution

```text
Initial: S = 3 (3 printers available)

Job 1: wait(S): S = 3→2   Job 1 printing on Printer 1
Job 2: wait(S): S = 2→1   Job 2 printing on Printer 2
Job 3: wait(S): S = 1→0   Job 3 printing on Printer 3
Job 4: wait(S): S = 0→-1  Job 4 BLOCKED (no printer free)
Job 5: wait(S): S = -1→-2 Job 5 BLOCKED (no printer free)

Job 1 finishes: signal(S): S = -2→-1   Job 4 wakes, gets Printer 1
Job 3 finishes: signal(S): S = -1→0    Job 5 wakes, gets Printer 3
Job 2 finishes: signal(S): S = 0→1     No one waiting, printer free
Job 4 finishes: signal(S): S = 1→2     Printer 1 free
Job 5 finishes: signal(S): S = 2→3     All printers free
```

:::

---

## Key Takeaways

- **Semaphores**, invented by Dijkstra (1965), are integer variables accessed only through atomic `wait()` (P/down) and `signal()` (V/up) operations.
- A **binary semaphore** (value 0 or 1) can serve as a mutex for mutual exclusion.
- A **counting semaphore** (value 0 to N) manages access to a pool of N identical resources or coordinates ordering between threads.
- Proper semaphore implementations use **blocking** (wait queues) instead of busy waiting — the thread sleeps when `S ≤ 0`.
- Semaphores excel at **process ordering** — initializing to 0 and having one thread `wait()` while another `signal()` guarantees execution order.
- The **Producer-Consumer** problem uses three semaphores: `mutex` (mutual exclusion), `empty` (tracks empty slots), and `full` (tracks filled slots).
- **Ordering of wait() calls matters** — always acquire counting semaphores before the mutex to avoid deadlock.
- POSIX provides `sem_init()`, `sem_wait()`, `sem_post()`, and `sem_destroy()` for semaphore management.
- Semaphores are more general than mutexes (any thread can signal, no ownership), but this flexibility makes them **easier to misuse** — which motivates the monitor abstraction in the next lesson.
