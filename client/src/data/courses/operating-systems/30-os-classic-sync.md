---
title: Classic Synchronization Problems
section: "Process Synchronization"
---

# Classic Synchronization Problems

Throughout computing history, certain synchronization scenarios have become canonical — they appear repeatedly in different forms across real systems. Mastering these **classic problems** means you can recognize and solve synchronization challenges wherever they arise. In this lesson, we study the three most important problems in depth: **Bounded-Buffer (Producer-Consumer)**, **Readers-Writers**, and **Dining Philosophers**, complete with multiple solutions and starvation analysis.

---

## Why Classic Problems Matter

These problems aren't just textbook exercises — they model real synchronization challenges:

| Classic Problem         | Real-World Analog                                                        |
| ----------------------- | ------------------------------------------------------------------------ |
| **Producer-Consumer**   | Network socket buffers, print queues, message queues, logging systems    |
| **Readers-Writers**     | Database read/write locks, file system access, cache invalidation        |
| **Dining Philosophers** | Competing for multiple shared resources, deadlock in distributed systems |

> "If you can solve the Dining Philosophers problem, you can solve most synchronization challenges you'll encounter in practice."
> — Common wisdom in OS courses

---

## Problem 1: Bounded-Buffer (Producer-Consumer)

### Problem Statement

One or more **producers** generate data items and place them into a fixed-size buffer. One or more **consumers** remove items from the buffer and process them. The challenge is to ensure:

1. **Producers wait** when the buffer is full
2. **Consumers wait** when the buffer is empty
3. **Only one thread** accesses the buffer at a time (mutual exclusion)

### Buffer Diagram

```text
  Producer(s)                                     Consumer(s)
      │                                               ↑
      ↓                                               │
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
  │ A │ B │ C │ D │   │   │   │   │    N = 8 slots
  └───┴───┴───┴───┴───┴───┴───┴───┘
    ↑               ↑
    out             in
    (consumer       (producer
     reads here)     writes here)

  Circular buffer: in = (in + 1) % N
                   out = (out + 1) % N
```

### Solution with Semaphores

```c
#define N 8  /* Buffer size */

int buffer[N];
int in = 0, out = 0;

semaphore_t mutex = 1;    /* Mutual exclusion for buffer access */
semaphore_t empty = N;    /* Counts empty slots (initially N) */
semaphore_t full  = 0;    /* Counts full slots (initially 0) */

/* Producer */
void producer() {
    while (true) {
        int item = produce_item();

        wait(&empty);          /* Decrement empty count; block if 0 */
        wait(&mutex);          /* Enter critical section */

        buffer[in] = item;
        in = (in + 1) % N;

        signal(&mutex);        /* Exit critical section */
        signal(&full);         /* Increment full count; wake consumer */
    }
}

/* Consumer */
void consumer() {
    while (true) {
        wait(&full);           /* Decrement full count; block if 0 */
        wait(&mutex);          /* Enter critical section */

        int item = buffer[out];
        out = (out + 1) % N;

        signal(&mutex);        /* Exit critical section */
        signal(&empty);        /* Increment empty count; wake producer */

        consume_item(item);
    }
}
```

### Semaphore Value Trace

```text
Action              empty  full  mutex  Buffer State
─────────────────   ─────  ────  ─────  ────────────────
Initial               8     0     1     [_,_,_,_,_,_,_,_]
Producer: wait(empty) 7     0     1
Producer: wait(mutex) 7     0     0
Producer: insert A    7     0     0     [A,_,_,_,_,_,_,_]
Producer: signal(mu)  7     0     1
Producer: signal(full)7     1     1
Consumer: wait(full)  7     0     1
Consumer: wait(mutex) 7     0     0
Consumer: remove A    7     0     0     [_,_,_,_,_,_,_,_]
Consumer: signal(mu)  7     0     1
Consumer: signal(emp) 8     0     1
```

### Solution with Monitors / Condition Variables

```c
typedef struct {
    int buffer[N];
    int count, in, out;
    pthread_mutex_t lock;
    pthread_cond_t not_full;
    pthread_cond_t not_empty;
} BoundedBuffer;

void bb_produce(BoundedBuffer *bb, int item) {
    pthread_mutex_lock(&bb->lock);

    while (bb->count == N)
        pthread_cond_wait(&bb->not_full, &bb->lock);

    bb->buffer[bb->in] = item;
    bb->in = (bb->in + 1) % N;
    bb->count++;

    pthread_cond_signal(&bb->not_empty);
    pthread_mutex_unlock(&bb->lock);
}

int bb_consume(BoundedBuffer *bb) {
    pthread_mutex_lock(&bb->lock);

    while (bb->count == 0)
        pthread_cond_wait(&bb->not_empty, &bb->lock);

    int item = bb->buffer[bb->out];
    bb->out = (bb->out + 1) % N;
    bb->count--;

    pthread_cond_signal(&bb->not_full);
    pthread_mutex_unlock(&bb->lock);
    return item;
}
```

> [!TIP]
> The monitor solution is often considered cleaner because mutual exclusion is handled by the mutex automatically, and condition variables make the waiting conditions explicit and readable.

---

## Problem 2: Readers-Writers

### Problem Statement

A shared resource (e.g., a database) is accessed by two types of threads:

- **Readers** — only read the data; multiple readers can read simultaneously
- **Writers** — modify the data; a writer needs exclusive access

The rules:

| Condition                         | Allowed? |
| --------------------------------- | :------: |
| Multiple readers, no writer       |    ✅    |
| One writer, no readers            |    ✅    |
| Readers and writer simultaneously |    ❌    |
| Multiple writers simultaneously   |    ❌    |

```text
  ┌──────────────────────────────────────┐
  │          Shared Database             │
  ├──────────────────────────────────────┤
  │                                      │
  │  Reader 1 ──→  READ   ←── Reader 2  │  ✅ OK (concurrent reads)
  │  Reader 3 ──→  READ                 │
  │                                      │
  │  Writer 1 ──→  WRITE               │  ✅ OK (exclusive write)
  │  (no readers allowed)               │
  │                                      │
  │  Reader 1 ──→  READ                 │
  │  Writer 1 ──→  WRITE  ← CONFLICT!  │  ❌ NOT OK
  └──────────────────────────────────────┘
```

### First Readers-Writers Solution (Readers Preference)

In this solution, **readers have priority**: no reader is kept waiting unless a writer is actively writing. As long as a reader is in the database, additional readers can enter freely.

```c
/* Shared variables */
semaphore_t rw_mutex = 1;   /* Controls access for writers (and first/last reader) */
semaphore_t mutex = 1;      /* Protects read_count */
int read_count = 0;         /* Number of active readers */

/* Writer */
void writer() {
    while (true) {
        wait(&rw_mutex);        /* Exclusive access */
        /* --- Write to database --- */
        write_data();
        signal(&rw_mutex);      /* Release */
    }
}

/* Reader */
void reader() {
    while (true) {
        wait(&mutex);              /* Protect read_count */
        read_count++;
        if (read_count == 1)       /* First reader locks out writers */
            wait(&rw_mutex);
        signal(&mutex);

        /* --- Read from database --- */
        read_data();

        wait(&mutex);              /* Protect read_count */
        read_count--;
        if (read_count == 0)       /* Last reader unlocks for writers */
            signal(&rw_mutex);
        signal(&mutex);
    }
}
```

### Execution Trace

```text
Time   Action                     read_count  rw_mutex  mutex
────   ─────────────────────      ──────────  ────────  ─────
 t0    Reader1 enters             1           0 (held)  1
 t1    Reader2 enters             2           0 (held)  1
 t2    Writer tries to enter      2           0 BLOCKED 1
 t3    Reader3 enters             3           0 (held)  1  ← Writer still blocked!
 t4    Reader1 exits              2           0 (held)  1
 t5    Reader2 exits              1           0 (held)  1
 t6    Reader3 exits              0           1 (free)  1  ← Last reader releases
 t7    Writer enters              0           0 (held)  1  ← Writer finally runs
```

### Starvation Analysis

| Solution               | Who Can Starve?                | How?                                                   |
| ---------------------- | ------------------------------ | ------------------------------------------------------ |
| **Readers preference** | **Writers starve**             | If readers keep arriving, the writer never gets access |
| **Writers preference** | **Readers starve**             | Once a writer is waiting, no new readers are admitted  |
| **Fair**               | Neither (but lower throughput) | Requests served in FIFO order                          |

### Second Readers-Writers Solution (Writers Preference)

```c
/* Additional shared variables */
semaphore_t read_try = 1;     /* Readers check this before entering */
semaphore_t resource = 1;     /* Actual resource access */
semaphore_t rmutex = 1;       /* Protect read_count */
semaphore_t wmutex = 1;       /* Protect write_count */
int read_count = 0;
int write_count = 0;

/* Writer */
void writer() {
    while (true) {
        wait(&wmutex);
        write_count++;
        if (write_count == 1)
            wait(&read_try);       /* Block new readers */
        signal(&wmutex);

        wait(&resource);           /* Exclusive write access */
        write_data();
        signal(&resource);

        wait(&wmutex);
        write_count--;
        if (write_count == 0)
            signal(&read_try);     /* Allow readers again */
        signal(&wmutex);
    }
}

/* Reader */
void reader() {
    while (true) {
        wait(&read_try);           /* Check if writers are waiting */
        wait(&rmutex);
        read_count++;
        if (read_count == 1)
            wait(&resource);
        signal(&rmutex);
        signal(&read_try);

        read_data();

        wait(&rmutex);
        read_count--;
        if (read_count == 0)
            signal(&resource);
        signal(&rmutex);
    }
}
```

> [!WARNING]
> Writers preference can cause **reader starvation** — if writers keep arriving, readers may wait indefinitely. In practice, most systems use a fair read-write lock or a timeout mechanism.

### Real-World Read-Write Lock (Pthread)

```c
#include <pthread.h>

pthread_rwlock_t rwlock;
pthread_rwlock_init(&rwlock, NULL);

/* Reader */
pthread_rwlock_rdlock(&rwlock);     /* Multiple readers allowed */
read_data();
pthread_rwlock_unlock(&rwlock);

/* Writer */
pthread_rwlock_wrlock(&rwlock);     /* Exclusive access */
write_data();
pthread_rwlock_unlock(&rwlock);

pthread_rwlock_destroy(&rwlock);
```

---

## Problem 3: Dining Philosophers

### Problem Statement

Five philosophers sit around a circular table. Each philosopher alternates between **thinking** and **eating**. Between each pair of adjacent philosophers lies a single **chopstick** (fork). To eat, a philosopher needs **both** the left and right chopsticks.

```text
             [P0]
           /      \
        (C4)      (C0)
        /              \
     [P4]              [P1]
       |                |
     (C3)              (C1)
       |                |
     [P3]──────(C2)──[P2]

  P0..P4 = Philosophers
  C0..C4 = Chopsticks (one between each pair)

  Pi needs chopstick[i] (left) and chopstick[(i+1)%5] (right)
```

### The Challenge

The problem illustrates the difficulty of allocating several shared resources among competing processes without deadlock and starvation.

### Naive Solution — DEADLOCK!

```c
semaphore_t chopstick[5];  /* All initialized to 1 */

/* Philosopher i */
void philosopher(int i) {
    while (true) {
        think();

        wait(&chopstick[i]);           /* Pick up LEFT chopstick */
        wait(&chopstick[(i+1) % 5]);   /* Pick up RIGHT chopstick */

        eat();

        signal(&chopstick[i]);         /* Put down LEFT */
        signal(&chopstick[(i+1) % 5]); /* Put down RIGHT */
    }
}
```

**Why this deadlocks:**

```text
All 5 philosophers simultaneously pick up their LEFT chopstick:

  P0: wait(C0) → acquired
  P1: wait(C1) → acquired
  P2: wait(C2) → acquired
  P3: wait(C3) → acquired
  P4: wait(C4) → acquired

Now all try to pick up their RIGHT chopstick:

  P0: wait(C1) → BLOCKED (held by P1)
  P1: wait(C2) → BLOCKED (held by P2)
  P2: wait(C3) → BLOCKED (held by P3)
  P3: wait(C4) → BLOCKED (held by P4)
  P4: wait(C0) → BLOCKED (held by P0)

  ┌───→ P0 waits for P1 ───→ P1 waits for P2 ──┐
  │                                               │
  └── P4 waits for P0 ←── P3 waits for P4 ←──────┘

  CIRCULAR WAIT → DEADLOCK!
```

### Solution 1: Limit Diners

Allow at most 4 philosophers to sit at the table simultaneously (using a counting semaphore):

```c
semaphore_t table = 4;  /* At most 4 can try to eat */

void philosopher(int i) {
    while (true) {
        think();
        wait(&table);                     /* Sit at table (max 4) */
        wait(&chopstick[i]);
        wait(&chopstick[(i+1) % 5]);
        eat();
        signal(&chopstick[(i+1) % 5]);
        signal(&chopstick[i]);
        signal(&table);                   /* Leave table */
    }
}
```

With at most 4 philosophers competing for 5 chopsticks, at least one philosopher can always get both chopsticks.

### Solution 2: Asymmetric (Resource Ordering)

Break the circular wait by making one philosopher pick up chopsticks in the **opposite order**:

```c
void philosopher(int i) {
    while (true) {
        think();
        if (i % 2 == 0) {
            /* Even philosophers: left first, then right */
            wait(&chopstick[i]);
            wait(&chopstick[(i+1) % 5]);
        } else {
            /* Odd philosophers: right first, then left */
            wait(&chopstick[(i+1) % 5]);
            wait(&chopstick[i]);
        }
        eat();
        signal(&chopstick[i]);
        signal(&chopstick[(i+1) % 5]);
    }
}
```

### Solution 3: Resource Ordering (Always Pick Lower-Numbered First)

```c
void philosopher(int i) {
    while (true) {
        think();
        int left = i;
        int right = (i + 1) % 5;
        /* Always pick up lower-numbered chopstick first */
        if (left < right) {
            wait(&chopstick[left]);
            wait(&chopstick[right]);
        } else {
            wait(&chopstick[right]);
            wait(&chopstick[left]);
        }
        eat();
        signal(&chopstick[left]);
        signal(&chopstick[right]);
    }
}
```

This breaks the circular wait: P4 tries to pick up C0 before C4, so the cycle is broken.

### Solution 4: Monitor-Based

```c
typedef enum { THINKING, HUNGRY, EATING } PhilState;

PhilState state[5];
pthread_mutex_t monitor_lock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t self[5];

void test(int i) {
    /* A philosopher can eat if they're hungry and
       neither neighbor is eating */
    if (state[i] == HUNGRY &&
        state[(i + 4) % 5] != EATING &&
        state[(i + 1) % 5] != EATING) {
        state[i] = EATING;
        pthread_cond_signal(&self[i]);
    }
}

void pickup(int i) {
    pthread_mutex_lock(&monitor_lock);
    state[i] = HUNGRY;
    test(i);                                /* Try to eat */
    while (state[i] != EATING)
        pthread_cond_wait(&self[i], &monitor_lock);
    pthread_mutex_unlock(&monitor_lock);
}

void putdown(int i) {
    pthread_mutex_lock(&monitor_lock);
    state[i] = THINKING;
    test((i + 4) % 5);   /* Check if left neighbor can eat now */
    test((i + 1) % 5);   /* Check if right neighbor can eat now */
    pthread_mutex_unlock(&monitor_lock);
}

void philosopher(int i) {
    while (true) {
        think();
        pickup(i);
        eat();
        putdown(i);
    }
}
```

This monitor-based solution ensures deadlock freedom and ensures a philosopher only picks up both chopsticks atomically (never holds just one).

### Solution 5: Chandy/Misra (1984) — Distributed Solution

The Chandy/Misra solution works in distributed systems where there is no shared memory:

| Step | Description                                                             |
| ---- | ----------------------------------------------------------------------- |
| 1    | Each chopstick is a token shared between two neighbors                  |
| 2    | Initially, chopstick goes to the philosopher with the lower ID          |
| 3    | A chopstick is **dirty** after eating, **clean** when passed            |
| 4    | A philosopher requests a chopstick from a neighbor by sending a message |
| 5    | A neighbor must give up a **dirty** chopstick (after cleaning it)       |
| 6    | A neighbor keeps a **clean** chopstick                                  |

This solution is **deadlock-free** and **starvation-free** — the dirty/clean mechanism ensures that a philosopher who has eaten recently (dirty chopsticks) yields to one who hasn't.

### Comparison of Dining Philosopher Solutions

| Solution          | Deadlock-Free | Starvation-Free | Concurrency | Complexity |
| ----------------- | :-----------: | :-------------: | :---------: | :--------: |
| Naive             |      ❌       |       ❌        |     Max     |  Trivial   |
| Limit to N-1      |      ✅       |   ⚠️ Possible   |   Reduced   |   Simple   |
| Asymmetric        |      ✅       |   ⚠️ Possible   |    Good     |   Simple   |
| Resource ordering |      ✅       |   ⚠️ Possible   |    Good     |   Simple   |
| Monitor-based     |      ✅       |   ⚠️ Possible   |    Good     |   Medium   |
| Chandy/Misra      |      ✅       |       ✅        |    Good     |  Complex   |

---

## Comparison of All Three Classic Problems

| Feature                      |       Bounded-Buffer        |        Readers-Writers         |      Dining Philosophers      |
| ---------------------------- | :-------------------------: | :----------------------------: | :---------------------------: |
| **Number of resource types** |      1 (buffer slots)       |          1 (database)          |        N (chopsticks)         |
| **Relationship**             |     Producer ↔ Consumer     |        Reader ↔ Writer         |          Peer ↔ Peer          |
| **Key synchronization**      | Ordering + mutual exclusion |   Shared vs exclusive access   | Multiple resource acquisition |
| **Main risk**                | Deadlock (wrong sem order)  |           Starvation           |   Deadlock (circular wait)    |
| **Semaphores needed**        |   3 (mutex, empty, full)    | 2-3 (rw_mutex, mutex, ±others) | N+1 (N chopsticks + limiter)  |
| **Real-world example**       | Message queue, pipe buffer  |       Database RW locks        |   Multi-resource allocation   |

---

## Why These Problems Matter in Real Systems

### Bounded-Buffer in Practice

| System        | Buffer                     | Producer         | Consumer           |
| ------------- | -------------------------- | ---------------- | ------------------ |
| Unix pipes    | Kernel pipe buffer (64 KB) | Writing process  | Reading process    |
| TCP sockets   | Send/receive buffers       | Sender           | Receiver           |
| Kafka         | Topic partitions           | Event publishers | Subscriber groups  |
| GPU rendering | Frame buffer               | Render thread    | Display controller |

### Readers-Writers in Practice

| System                  | Resource       | Readers             | Writers              |
| ----------------------- | -------------- | ------------------- | -------------------- |
| Database (MySQL InnoDB) | Table rows     | SELECT queries      | INSERT/UPDATE/DELETE |
| DNS cache               | DNS entries    | DNS lookups         | Cache updates        |
| Linux kernel            | VMA structures | Page fault handlers | mmap/munmap calls    |
| Web cache               | Cached pages   | HTTP GET requests   | Cache invalidation   |

### Dining Philosophers in Practice

| System                | Resources                              | Competitors             |
| --------------------- | -------------------------------------- | ----------------------- |
| Database transactions | Row-level locks on multiple tables     | Concurrent transactions |
| Network routing       | Link bandwidth on multiple links       | Routing protocols       |
| Distributed systems   | Distributed locks on multiple services | Microservice instances  |
| Multi-GPU training    | GPU memory + PCIe bandwidth            | Training workers        |

---

## Try It Yourself

**Exercise 1:** In the first Readers-Writers solution, prove that a writer can starve by constructing a specific sequence of reader arrivals.

:::details Solution
Consider a continuous stream of readers arriving at overlapping times:

```text
Time:    0    1    2    3    4    5    6    7    8    ...
R1:     [==========]
R2:          [==========]
R3:               [==========]
R4:                    [==========]
Writer:      W arrives → waits... waits... waits... FOREVER

read_count: 1  2  2  2  2  2  2  2  2...
            (never reaches 0!)
```

As long as at least one reader is always active, `read_count` never reaches 0, so `rw_mutex` is never signaled. The writer waits on `rw_mutex` indefinitely.

Specifically:

- t=0: R1 enters, read_count=1, acquires rw_mutex
- t=1: R2 enters, read_count=2; Writer arrives, blocks on rw_mutex
- t=2: R1 exits, read_count=1 (still > 0, rw_mutex not released)
- t=2: R3 enters, read_count=2
- t=3: R2 exits, read_count=1; R4 enters, read_count=2
- ...and so on. Writer never gets in.
  :::

**Exercise 2:** Modify the Dining Philosophers monitor-based solution to add starvation prevention. (Hint: track how long each philosopher has been hungry.)

:::details Solution
Add a hunger counter that increases each time a neighbor eats while a philosopher is hungry. Give priority to the hungriest philosopher:

```c
int hunger_count[5] = {0};
#define MAX_HUNGER 3  /* Max times neighbors eat while I'm hungry */

void test(int i) {
    if (state[i] == HUNGRY &&
        state[(i + 4) % 5] != EATING &&
        state[(i + 1) % 5] != EATING) {
        state[i] = EATING;
        hunger_count[i] = 0;
        pthread_cond_signal(&self[i]);
    }
}

void putdown(int i) {
    pthread_mutex_lock(&monitor_lock);
    state[i] = THINKING;

    /* Increase hunger count of hungry neighbors */
    int left = (i + 4) % 5;
    int right = (i + 1) % 5;
    if (state[left] == HUNGRY) hunger_count[left]++;
    if (state[right] == HUNGRY) hunger_count[right]++;

    /* Prioritize the hungrier neighbor */
    if (hunger_count[left] >= hunger_count[right]) {
        test(left);
        test(right);
    } else {
        test(right);
        test(left);
    }

    pthread_mutex_unlock(&monitor_lock);
}
```

When `hunger_count` exceeds `MAX_HUNGER`, we could also add logic to prevent the philosopher's neighbors from eating until the starving philosopher gets a turn.
:::

**Exercise 3:** A web server uses a connection pool of 10 database connections. Multiple request handlers need a connection. Model this as one of the classic problems and describe your solution.

:::details Solution
This is a **Bounded-Buffer / Resource Pool** problem, best modeled with a **counting semaphore**:

```c
#define POOL_SIZE 10
semaphore_t pool = POOL_SIZE;    /* Available connections */
semaphore_t pool_mutex = 1;      /* Protect the connection array */
Connection *connections[POOL_SIZE];
bool in_use[POOL_SIZE] = {false};

Connection *acquire_connection() {
    wait(&pool);                 /* Wait for available connection */
    wait(&pool_mutex);
    int i;
    for (i = 0; i < POOL_SIZE; i++) {
        if (!in_use[i]) {
            in_use[i] = true;
            break;
        }
    }
    signal(&pool_mutex);
    return connections[i];
}

void release_connection(Connection *conn, int i) {
    wait(&pool_mutex);
    in_use[i] = false;
    signal(&pool_mutex);
    signal(&pool);               /* Increment available count */
}
```

The counting semaphore (`pool`) ensures no more than 10 handlers have connections simultaneously. The mutex (`pool_mutex`) protects the `in_use` array from concurrent modification.
:::

---

## Key Takeaways

- The **Bounded-Buffer (Producer-Consumer)** problem requires three semaphores: `mutex` for mutual exclusion, `empty` to track free slots, and `full` to track filled slots. Always acquire counting semaphores before the mutex to prevent deadlock.
- The **Readers-Writers** problem allows concurrent readers but exclusive writers. The first solution (readers-preference) can starve writers; the second (writers-preference) can starve readers. Real systems use fair read-write locks.
- The **Dining Philosophers** problem models deadlock when processes compete for multiple shared resources. The naive solution deadlocks via circular wait. Solutions include limiting diners, asymmetric ordering, resource ordering, and monitor-based approaches.
- These three problems serve as **patterns** — once you recognize a real-world scenario as a variant of one of these, you can apply known solutions rather than inventing from scratch.
- **Starvation** is a recurring concern across all three problems. True starvation-free solutions require explicit fairness mechanisms (FIFO ordering, hunger tracking, dirty/clean tokens).
- Real-world systems (databases, web servers, operating systems) encounter these problems constantly — mastering them is essential for building correct concurrent software.
