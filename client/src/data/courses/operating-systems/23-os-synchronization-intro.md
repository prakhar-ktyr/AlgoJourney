---
title: Introduction to Synchronization
---

# Introduction to Synchronization

When multiple threads or processes share data, the results can be catastrophically unpredictable. A bank balance that should be $1,000 might read $500 — or $1,500 — depending on the precise microsecond timing of concurrent operations. **Synchronization** is the set of mechanisms that ensure concurrent access to shared data produces correct and predictable results. This lesson introduces the fundamental problem, demonstrates it with concrete examples, and sets the stage for the solutions we'll explore in subsequent lessons.

---

## The Need for Synchronization

Imagine two people editing the same Google Doc simultaneously. Person A changes a sentence while Person B deletes the same paragraph. Without coordination, the document could end up in an inconsistent state — the sentence is changed but then the paragraph (including the changed sentence) is deleted, or the paragraph is deleted and then the system tries to change a sentence that no longer exists.

In computing, this problem is everywhere:

| Scenario                                 | Shared Resource          | Risk                                |
| ---------------------------------------- | ------------------------ | ----------------------------------- |
| Two threads updating a bank balance      | Account balance variable | Money appears or disappears         |
| Web server threads updating session data | Session object in memory | Corrupted user state                |
| Database threads writing to the same row | Database record          | Lost updates, inconsistent reads    |
| Producer and consumer accessing a buffer | Shared buffer + pointers | Buffer overflow, reading stale data |
| Two processes writing to a log file      | Log file                 | Interleaved, garbled output         |

> [!IMPORTANT]
> Any time two or more threads access the same memory location and at least one of them writes, you have a potential **data race**. Without proper synchronization, the program's behavior is **undefined** — it may work correctly 99.99% of the time and silently corrupt data the remaining 0.01%.

---

## Race Conditions

> A **race condition** occurs when the outcome of a computation depends on the relative timing or interleaving of multiple threads' operations on shared data.

The name comes from the idea that threads are "racing" to access shared data, and the result depends on who "wins" the race.

### Real-World Analogy

Two friends, Alice and Bob, share a bank account with a balance of $1,000.

1. Alice checks the balance: $1,000
2. Bob checks the balance: $1,000
3. Alice withdraws $800 → sets balance to $200
4. Bob withdraws $700 → sets balance to $300 (based on stale $1,000 reading)

The bank now shows $300, but $1,500 was withdrawn from a $1,000 account! This happened because Bob read the balance _before_ Alice's withdrawal took effect.

```text
Timeline:                Alice              Bob              Balance
  t=0                                                        $1,000
  t=1     Read balance: $1,000                                $1,000
  t=2                             Read balance: $1,000        $1,000
  t=3     Withdraw $800                                       $1,000
  t=4     Write balance: $200                                 $200
  t=5                             Withdraw $700               $200
  t=6                             Write balance: $300         $300
                                  (1000 - 700 = 300)
                                  ← WRONG! Should be -$500
```

---

## The Bank Account Problem in Code

Let's see this race condition in actual C code:

```c
#include <stdio.h>
#include <pthread.h>

int balance = 1000;  /* Shared variable */

void *deposit(void *arg) {
    int amount = *(int *)arg;
    for (int i = 0; i < 100000; i++) {
        int temp = balance;      /* READ balance */
        temp = temp + amount;    /* Compute new value */
        balance = temp;          /* WRITE balance */
    }
    return NULL;
}

void *withdraw(void *arg) {
    int amount = *(int *)arg;
    for (int i = 0; i < 100000; i++) {
        int temp = balance;      /* READ balance */
        temp = temp - amount;    /* Compute new value */
        balance = temp;          /* WRITE balance */
    }
    return NULL;
}

int main() {
    pthread_t t1, t2;
    int dep_amount = 10;
    int wdr_amount = 10;

    pthread_create(&t1, NULL, deposit, &dep_amount);
    pthread_create(&t2, NULL, withdraw, &wdr_amount);

    pthread_join(t1, NULL);
    pthread_join(t2, NULL);

    printf("Final balance: %d\n", balance);
    printf("Expected:      1000\n");
    /* Result varies on each run! Could be 1000, 960, 1040, or anything */
    return 0;
}
```

If we run this program multiple times, we get different results:

| Run | Final Balance | Expected |
| --- | ------------- | -------- |
| 1   | 1,000         | 1,000    |
| 2   | 980           | 1,000    |
| 3   | 1,040         | 1,000    |
| 4   | -20           | 1,000    |
| 5   | 1,000         | 1,000    |

The program is **non-deterministic** — its output depends on thread scheduling, which varies across runs.

---

## The Counter Increment Problem

Let's zoom into the simplest possible race condition: two threads each incrementing a shared counter.

### C Code

```c
#include <stdio.h>
#include <pthread.h>

int counter = 0;  /* Shared counter */

void *increment(void *arg) {
    for (int i = 0; i < 1000000; i++) {
        counter++;    /* This is NOT atomic! */
    }
    return NULL;
}

int main() {
    pthread_t t1, t2;
    pthread_create(&t1, NULL, increment, NULL);
    pthread_create(&t2, NULL, increment, NULL);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);

    printf("Counter: %d\n", counter);
    printf("Expected: 2000000\n");
    return 0;
}
```

### Assembly-Level Analysis

The statement `counter++` looks like a single operation, but it compiles to **three** machine instructions:

```text
  1. LOAD:   Register ← Memory[counter]     (read current value)
  2. ADD:    Register ← Register + 1         (increment)
  3. STORE:  Memory[counter] ← Register      (write back)
```

### The Interleaving Problem

Here's how thread interleaving causes the bug. Assume `counter = 5`:

```text
Time   Thread 1                   Thread 2              counter (memory)
────   ──────────────────────     ──────────────────     ────────────────
 t0    LOAD R1 ← counter (5)                            5
 t1                                LOAD R2 ← counter (5) 5
 t2    ADD R1 ← R1 + 1 = 6                              5
 t3                                ADD R2 ← R2 + 1 = 6   5
 t4    STORE counter ← R1 (6)                            6
 t5                                STORE counter ← R2 (6) 6

Result: counter = 6 (should be 7!)
One increment was LOST.
```

Both threads read `5`, both compute `6`, and both write `6`. Instead of incrementing twice (5 → 6 → 7), we only see one increment (5 → 6).

### Correct Interleaving

If the instructions happen to execute without interleaving:

```text
Time   Thread 1                   Thread 2              counter (memory)
────   ──────────────────────     ──────────────────     ────────────────
 t0    LOAD R1 ← counter (5)                            5
 t1    ADD R1 ← R1 + 1 = 6                              5
 t2    STORE counter ← R1 (6)                            6
 t3                                LOAD R2 ← counter (6) 6
 t4                                ADD R2 ← R2 + 1 = 7   6
 t5                                STORE counter ← R2 (7) 7

Result: counter = 7 ✓ (correct!)
```

> [!WARNING]
> The fact that `counter++` looks like one operation in C but compiles to multiple machine instructions is the root cause. This is why we cannot rely on "simple" operations being safe without synchronization.

---

## Understanding Atomicity

> An **atomic operation** is one that completes entirely without interruption. No other thread can observe the operation in a partially completed state.

### What Makes an Operation Atomic?

| Level                                  | Atomic?                     | Example                                          |
| -------------------------------------- | --------------------------- | ------------------------------------------------ |
| Single CPU instruction on aligned data | Usually yes                 | `MOV [address], value` (on x86 for aligned word) |
| Multi-instruction operation            | No                          | `counter++` (LOAD + ADD + STORE)                 |
| Single-byte write                      | Yes (on most architectures) | Writing one byte to memory                       |
| 64-bit write on 32-bit CPU             | No                          | Two 32-bit writes (can be observed half-done)    |

### Hardware Atomic Instructions

Modern CPUs provide special atomic instructions:

| Instruction    | Description                      | Architecture |
| -------------- | -------------------------------- | ------------ |
| `LOCK INC`     | Atomic increment                 | x86          |
| `LOCK CMPXCHG` | Atomic compare-and-swap          | x86          |
| `LDREX/STREX`  | Load-exclusive / Store-exclusive | ARM          |
| `LL/SC`        | Load-linked / Store-conditional  | MIPS, RISC-V |

Using atomic instructions in C11:

```c
#include <stdatomic.h>

atomic_int counter = 0;

void *increment(void *arg) {
    for (int i = 0; i < 1000000; i++) {
        atomic_fetch_add(&counter, 1);  /* Truly atomic */
    }
    return NULL;
}
```

With this change, the program always produces `2000000` — guaranteed.

### Atomicity Alone Is Not Enough

Even with atomic operations on individual variables, complex operations involving multiple variables or multiple steps still need synchronization:

```c
/* Atomic operations, but still a race condition! */
atomic_int x = 0, y = 0;

/* Thread 1 */                    /* Thread 2 */
atomic_store(&x, 1);             int b = atomic_load(&y);
atomic_store(&y, 1);             int a = atomic_load(&x);
                                  /* Can b=1, a=0? YES on some CPUs! */
```

> [!NOTE]
> Memory ordering (visibility of writes across cores) is a separate problem from atomicity. We'll explore this in the Hardware Synchronization lesson.

---

## Types of Synchronization

Synchronization serves two distinct purposes:

### 1. Mutual Exclusion

**Mutual exclusion** ensures that only one thread at a time can access a shared resource (the "critical section").

```text
Without Mutual Exclusion:          With Mutual Exclusion:

Thread 1: [--write--]              Thread 1: [--write--]
Thread 2:     [--write--]          Thread 2:            [--write--]
              ↑                                         ↑
          OVERLAP! Data corruption.                No overlap. Safe.
```

### 2. Ordering / Coordination

**Ordering** ensures that operations happen in a specific sequence — for example, a consumer must wait until a producer has placed data in the buffer.

```text
Without Ordering:                  With Ordering:

Producer: [produce]                Producer: [produce]──signal──→
Consumer: [consume (empty!)]       Consumer:            wait ←──[consume]
              ↑                                                  ↑
          Consumer reads nothing.                      Consumer waits for data.
```

### Comparison

| Type                 | Goal                    | Mechanism                       | Example                               |
| -------------------- | ----------------------- | ------------------------------- | ------------------------------------- |
| **Mutual Exclusion** | Protect shared data     | Locks, mutexes                  | Only one thread updates the balance   |
| **Ordering**         | Ensure correct sequence | Semaphores, condition variables | Consumer waits for producer           |
| **Both together**    | Complex coordination    | Monitors, barriers              | Producer-consumer with bounded buffer |

---

## Visualizing the Problem Space

```text
┌───────────────────────────────────────────────────┐
│              Concurrent Access                    │
│                                                   │
│  Thread A ──→ ┌──────────┐ ←── Thread B           │
│               │  Shared  │                        │
│  Thread C ──→ │   Data   │ ←── Thread D           │
│               └──────────┘                        │
│                                                   │
│  Without synchronization:                         │
│    → Race conditions                              │
│    → Data corruption                              │
│    → Non-deterministic behavior                   │
│                                                   │
│  With synchronization:                            │
│    → Mutual exclusion (one writer at a time)      │
│    → Ordering (producer before consumer)          │
│    → Predictable, correct results                 │
└───────────────────────────────────────────────────┘
```

---

## A Python Demonstration

Python makes it easy to demonstrate race conditions (despite the GIL, race conditions still occur at the Python bytecode level):

```python
import threading

counter = 0

def increment():
    global counter
    for _ in range(1000000):
        counter += 1  # NOT atomic at bytecode level

threads = [threading.Thread(target=increment) for _ in range(2)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(f"Counter: {counter}")     # Often less than 2000000
print(f"Expected: 2000000")
```

Fix with a lock:

```python
import threading

counter = 0
lock = threading.Lock()

def increment():
    global counter
    for _ in range(1000000):
        with lock:
            counter += 1

threads = [threading.Thread(target=increment) for _ in range(2)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(f"Counter: {counter}")     # Always 2000000
```

---

## Historical Context

| Year  | Milestone                                                   |
| ----- | ----------------------------------------------------------- |
| 1965  | Edsger Dijkstra introduces the semaphore concept            |
| 1966  | Dijkstra describes the "deadly embrace" (deadlock)          |
| 1971  | Dijkstra publishes the Dining Philosophers problem          |
| 1974  | Per Brinch Hansen and Tony Hoare introduce monitors         |
| 1981  | Leslie Lamport describes the Bakery Algorithm               |
| 1990s | Lock-free and wait-free algorithms gain attention           |
| 2011  | C11 and C++11 add formal memory model and atomic operations |

> "The question of whether a computer can think is no more interesting than the question of whether a submarine can swim."
> — _Edsger W. Dijkstra_

---

## Try It Yourself

**Exercise 1:** Consider the following code. Two threads execute `swap()` concurrently. Can the final values of `x` and `y` be the original values (i.e., the swap "didn't happen")? Explain.

```c
int x = 1, y = 2;

void swap() {
    int temp = x;
    x = y;
    y = temp;
}
```

:::details Solution
Yes! If both threads interleave perfectly, the swap can appear to not happen:

```
Thread 1:  temp1 = x     → temp1 = 1
Thread 2:  temp2 = x     → temp2 = 1
Thread 1:  x = y         → x = 2
Thread 2:  x = y         → x = 2
Thread 1:  y = temp1     → y = 1
Thread 2:  y = temp2     → y = 1
```

Final: x = 2, y = 1 — which is the same as one swap. But consider:

```
Thread 1:  temp1 = x     → temp1 = 1
Thread 1:  x = y         → x = 2
Thread 2:  temp2 = x     → temp2 = 2
Thread 2:  x = y         → x = 2
Thread 2:  y = temp2     → y = 2
Thread 1:  y = temp1     → y = 1
```

Final: x = 2, y = 1 — again just one swap. Other interleavings can yield x = 1, y = 2 (no swap happened) or x = 2, y = 2 (data corruption).
:::

**Exercise 2:** Compile and run the counter increment program from this lesson 10 times. Record the output each time. What is the range of values you observe?

:::details Solution
You should observe different values on different runs. Typical results:

- Values will range from approximately 1,000,000 to 2,000,000
- The correct answer (2,000,000) may appear occasionally by luck
- Values below 1,000,000 are theoretically possible but rare

The variation proves that `counter++` is not atomic and that the program has a race condition. The fix is to use a mutex or atomic operations.
:::

**Exercise 3:** Is reading a single `int` variable atomic on a 64-bit x86 machine? What about reading a `struct` with two `int` fields?

:::details Solution

- **Reading a single aligned `int`**: Yes, on x86 this is atomic. The CPU reads/writes naturally-aligned words atomically.
- **Reading a struct with two `int` fields**: No. Reading two separate memory locations requires two load instructions. Another thread could modify one field between the two loads, giving you a "torn read" — field 1 from before an update and field 2 from after.

Even for single `int` reads, while the read itself is atomic, without proper memory ordering (barriers), you might read a stale cached value. Always use proper synchronization for shared data.
:::

---

## Key Takeaways

- **Synchronization** is necessary whenever multiple threads access shared data and at least one of them writes.
- A **race condition** occurs when program correctness depends on the unpredictable timing of thread interleaving.
- The `counter++` operation is **not atomic** — it compiles to three instructions (load, add, store), and interleaving between threads can cause lost updates.
- **Atomic operations** complete entirely without interruption, but atomicity alone doesn't solve all synchronization problems (memory ordering, multi-variable invariants).
- Synchronization serves two purposes: **mutual exclusion** (protect shared data) and **ordering** (ensure correct operation sequence).
- Race conditions are insidious — programs may work correctly thousands of times and then fail unpredictably. Always use proper synchronization for shared data.
- The next several lessons will systematically build up solutions: critical sections, Peterson's algorithm, hardware support, mutexes, semaphores, and monitors.
