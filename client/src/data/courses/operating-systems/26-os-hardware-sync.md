---
title: Hardware Synchronization
section: "Process Synchronization"
---

# Hardware Synchronization

Software-only solutions like Peterson's Algorithm are elegant but fragile on modern hardware due to instruction reordering, cache coherency complexities, and performance limitations. Modern processors provide **hardware atomic instructions** that make synchronization both simpler and more efficient. In this lesson, we explore memory barriers, atomic instructions (Test-and-Set, Compare-and-Swap, Fetch-and-Add), spinlock implementations, and their performance characteristics.

---

## Why Software-Only Solutions Are Insufficient

| Limitation                     | Explanation                                                                |
| ------------------------------ | -------------------------------------------------------------------------- |
| **CPU instruction reordering** | Modern out-of-order CPUs reorder loads and stores for performance          |
| **Compiler optimization**      | Compilers may reorder, eliminate, or combine memory accesses               |
| **Cache coherence delays**     | Writes to shared variables may not be immediately visible to other cores   |
| **Busy waiting overhead**      | Software solutions spin on shared variables, wasting CPU and bus bandwidth |
| **Scalability**                | Software solutions for N processes become complex and slow                 |

> [!IMPORTANT]
> Modern CPUs provide specialized instructions that atomically read-modify-write a memory location in a single bus transaction. These are the building blocks of all practical synchronization primitives.

---

## Memory Barriers

A **memory barrier** (or **fence**) is a hardware instruction that enforces ordering constraints on memory operations.

### The Problem: Memory Ordering

Without barriers, the CPU and compiler can reorder memory operations:

```text
Program order:              CPU execution order (possible):
1. x = 1;                  1. y = 1;       ← reordered!
2. y = 1;                  2. x = 1;
```

This reordering is invisible to a single-threaded program (the final values are the same), but in a multithreaded program, another thread might observe `y = 1` before `x = 1`, leading to incorrect behavior.

### Types of Memory Barriers

| Barrier         | x86 Instruction | Effect                                                             |
| --------------- | --------------- | ------------------------------------------------------------------ |
| **Store Fence** | `SFENCE`        | All stores before the fence are visible before any store after it  |
| **Load Fence**  | `LFENCE`        | All loads before the fence complete before any load after it       |
| **Full Fence**  | `MFENCE`        | All loads AND stores before the fence complete before any after it |

### Memory Ordering Models

| Architecture | Memory Model                                | Barrier Needed?                     |
| ------------ | ------------------------------------------- | ----------------------------------- |
| x86/x86-64   | Total Store Order (TSO) — relatively strong | Rarely (only for specific patterns) |
| ARM          | Weakly ordered                              | Frequently                          |
| RISC-V       | Weakly ordered (RVWMO)                      | Frequently                          |
| PowerPC      | Weakly ordered                              | Frequently                          |

### Using Barriers in C

```c
/* GCC built-in full barrier */
__sync_synchronize();

/* C11 atomic fence */
#include <stdatomic.h>
atomic_thread_fence(memory_order_seq_cst);

/* x86 inline assembly */
__asm__ __volatile__ ("mfence" ::: "memory");
```

> [!TIP]
> On x86, the `LOCK` prefix on instructions (like `LOCK CMPXCHG`) implicitly acts as a full memory barrier. This is why x86 spinlocks don't usually need explicit `MFENCE` instructions.

---

## Test-and-Set (TAS)

**Test-and-Set** atomically reads a memory location, returns the old value, and sets it to `true` — all in a single indivisible operation.

### Pseudocode Definition

```c
/* This ENTIRE function executes atomically (as one instruction) */
bool test_and_set(bool *target) {
    bool old = *target;
    *target = true;
    return old;
}
```

### How It Works

```text
Before: lock = false

Thread A calls test_and_set(&lock):
  1. Read lock → false (old value)
  2. Set lock = true
  3. Return false
  ↑ All three happen as ONE atomic operation

Thread B calls test_and_set(&lock):
  1. Read lock → true (old value, set by A)
  2. Set lock = true (already true)
  3. Return true → B knows someone else holds the lock
```

### Implementing Mutual Exclusion with TAS

```c
bool lock = false;  /* Shared lock variable */

/* Entry section */
while (test_and_set(&lock))
    ;  /* Spin until we acquire the lock (TAS returns false) */

/* Critical Section */
critical_section();

/* Exit section */
lock = false;
```

### Analysis

| Property         | Satisfied? | Explanation                                      |
| ---------------- | ---------- | ------------------------------------------------ |
| Mutual Exclusion | ✅         | Only one TAS can return `false` for a given lock |
| Progress         | ✅         | If lock is free, next TAS call succeeds          |
| Bounded Waiting  | ❌         | No fairness guarantee — one thread could starve  |

### x86 Implementation

On x86, TAS is implemented using the `XCHG` instruction (which has an implicit `LOCK` prefix):

```c
/* GCC built-in */
bool old = __sync_lock_test_and_set(&lock, 1);

/* GCC atomic */
bool expected = false;
bool acquired = atomic_exchange(&lock, true);
```

---

## Compare-and-Swap (CAS)

**Compare-and-Swap** (also called **Compare-and-Exchange**) is a more versatile atomic instruction. It atomically compares a memory location to an expected value and, only if they match, replaces it with a new value.

### Pseudocode Definition

```c
/* This ENTIRE function executes atomically */
bool compare_and_swap(int *value, int expected, int new_value) {
    if (*value == expected) {
        *value = new_value;
        return true;     /* Swap succeeded */
    }
    return false;        /* Value was different; no swap */
}
```

### Implementing Mutual Exclusion with CAS

```c
int lock = 0;  /* 0 = free, 1 = held */

/* Entry section */
while (!compare_and_swap(&lock, 0, 1))
    ;  /* Spin until lock is free AND we successfully acquire it */

/* Critical Section */
critical_section();

/* Exit section */
lock = 0;
```

### CAS vs TAS

| Feature              | Test-and-Set              | Compare-and-Swap                         |
| -------------------- | ------------------------- | ---------------------------------------- |
| **Operation**        | Read old, set to true     | Compare expected, conditionally set new  |
| **Return value**     | Old value                 | Success/failure                          |
| **Versatility**      | Can only set to one value | Can swap to any value based on condition |
| **Use beyond locks** | Limited                   | Lock-free data structures, counters      |
| **x86 instruction**  | `XCHG`                    | `LOCK CMPXCHG`                           |
| **ARM instruction**  | Via `LDREX/STREX`         | Via `LDREX/STREX`                        |

### CAS for Atomic Increment (Lock-Free)

CAS enables **lock-free** algorithms — operations that complete without holding any lock:

```c
#include <stdatomic.h>

void atomic_increment(atomic_int *counter) {
    int old_val, new_val;
    do {
        old_val = atomic_load(counter);
        new_val = old_val + 1;
    } while (!atomic_compare_exchange_weak(counter,
                                            &old_val, new_val));
}
```

```text
Thread A:                          Thread B:
  old = load(counter) = 5           old = load(counter) = 5
  new = 6                           new = 6
  CAS(counter, 5, 6) → SUCCESS     CAS(counter, 5, 6) → FAIL
  (counter is now 6)                (counter is 6, expected 5)
                                     Retry:
                                     old = load(counter) = 6
                                     new = 7
                                     CAS(counter, 6, 7) → SUCCESS
                                     (counter is now 7) ✓
```

### The ABA Problem

CAS has a subtle vulnerability called the **ABA problem**:

```text
Time   Thread A                    Thread B               Value
────   ─────────────────────       ─────────────────────   ─────
 t0    Read value = A                                      A
 t1    (preempted)                 Change value A → B      B
 t2                                Change value B → A      A
 t3    CAS(A, A, C) → SUCCESS!    (done)                   C
       But the value changed
       underneath us!
```

Thread A's CAS succeeds because the value is `A` (same as expected), but the value went through A→B→A. This matters when the meaning of the data has changed (e.g., in a lock-free stack, a node was removed and re-added, but with different data).

**Solutions to ABA:**

| Solution             | Description                                                                     |
| -------------------- | ------------------------------------------------------------------------------- |
| **Version counter**  | Pair the value with a monotonically increasing counter. CAS on (value, version) |
| **Hazard pointers**  | Track which pointers are being accessed by which threads                        |
| **Tagged pointers**  | Use unused bits in pointers as version stamps                                   |
| **Double-width CAS** | CAS on 128-bit value (64-bit pointer + 64-bit counter)                          |

---

## Fetch-and-Add

**Fetch-and-Add** atomically increments a value and returns the old value.

```c
/* Executes atomically */
int fetch_and_add(int *value, int increment) {
    int old = *value;
    *value = old + increment;
    return old;
}
```

### x86 Implementation

```c
/* GCC built-in */
int old = __sync_fetch_and_add(&counter, 1);

/* C11 */
int old = atomic_fetch_add(&counter, 1);
```

### Using Fetch-and-Add for Ticket Locks

A **ticket lock** provides bounded waiting (FIFO ordering), unlike basic TAS/CAS spinlocks:

```c
typedef struct {
    atomic_int next_ticket;    /* Next ticket to dispense */
    atomic_int now_serving;    /* Currently serving ticket number */
} TicketLock;

void ticket_lock_acquire(TicketLock *lock) {
    int my_ticket = atomic_fetch_add(&lock->next_ticket, 1);
    while (atomic_load(&lock->now_serving) != my_ticket)
        ;  /* Spin until our number is called */
}

void ticket_lock_release(TicketLock *lock) {
    atomic_fetch_add(&lock->now_serving, 1);
}
```

```text
Ticket Lock Operation:

  next_ticket: 5 → 6 → 7 → 8
  now_serving: 5

  Thread A: my_ticket=5 → now_serving==5 → ENTER CS
  Thread B: my_ticket=6 → spin (waiting for now_serving==6)
  Thread C: my_ticket=7 → spin (waiting for now_serving==7)

  Thread A releases: now_serving = 6
  Thread B: now_serving==6 → ENTER CS (FIFO!)
```

| Property         | TAS Spinlock                 | CAS Spinlock | Ticket Lock                       |
| ---------------- | ---------------------------- | ------------ | --------------------------------- |
| Mutual Exclusion | ✅                           | ✅           | ✅                                |
| Progress         | ✅                           | ✅           | ✅                                |
| Bounded Waiting  | ❌                           | ❌           | ✅ (FIFO)                         |
| Fairness         | None                         | None         | FIFO                              |
| Cache behavior   | Poor (all spin on same line) | Poor         | Better (each spins on own ticket) |

---

## Spinlock Implementation

### Basic TAS Spinlock

```c
#include <stdatomic.h>

typedef atomic_flag spinlock_t;

void spin_lock(spinlock_t *lock) {
    while (atomic_flag_test_and_set(lock))
        ;  /* Spin */
}

void spin_unlock(spinlock_t *lock) {
    atomic_flag_clear(lock);
}
```

### TAS with Backoff (Performance Optimization)

Spinning aggressively on a lock generates heavy bus traffic. **Exponential backoff** reduces contention:

```c
void spin_lock_backoff(spinlock_t *lock) {
    int delay = 1;
    while (atomic_flag_test_and_set(lock)) {
        for (int i = 0; i < delay; i++)
            __asm__ __volatile__("pause");  /* x86 spin hint */
        if (delay < MAX_DELAY)
            delay *= 2;  /* Exponential backoff */
    }
}
```

### Test-and-Test-and-Set (TTAS)

An optimization that reduces bus traffic by first **reading** (test) the lock value before attempting TAS:

```c
void spin_lock_ttas(atomic_bool *lock) {
    while (true) {
        /* Test: spin locally on cached copy (no bus traffic) */
        while (atomic_load_explicit(lock, memory_order_relaxed))
            ;  /* Read from cache — cheap */

        /* Test-and-Set: try to acquire */
        if (!atomic_exchange(lock, true))
            return;  /* Acquired! */
        /* Failed — someone else got it. Go back to spinning */
    }
}
```

```text
TAS Spinlock:              TTAS Spinlock:
Every iteration:           Inner loop:
  atomic XCHG (bus lock)     local READ (cache hit, no bus traffic)
  → Heavy bus traffic       Outer attempt:
                              atomic XCHG (only when lock might be free)
                              → Much less bus traffic
```

---

## The Busy Waiting Problem

All spinlock variants share a fundamental issue: **busy waiting** — the thread consumes CPU cycles while waiting for the lock.

```text
Thread A (holds lock):     Thread B (spinning):
┌─────────────────┐        ┌─────────────────┐
│ Doing work      │        │ while(TAS(&lock))│
│ in critical     │        │   ; /* SPIN */   │
│ section         │        │ CPU cycles wasted│
│                 │        │ no useful work   │
└─────────────────┘        └─────────────────┘
```

### When Busy Waiting Is Acceptable

| Scenario                              | Busy Wait OK? | Reason                                          |
| ------------------------------------- | :-----------: | ----------------------------------------------- |
| Very short critical sections (< 1 μs) |      ✅       | Spinning is cheaper than context switch         |
| Multiprocessor system                 |      ✅       | Other cores do useful work while one spins      |
| Real-time / kernel code               |      ✅       | Predictable latency, no scheduler overhead      |
| Long critical sections                |      ❌       | Wasted CPU adds up; use blocking lock           |
| Single processor                      |      ❌       | Spinning delays the lock holder, extending wait |

> [!WARNING]
> On a **single-processor** system, spinlocks are particularly wasteful: the spinning thread prevents the lock-holding thread from running, which prevents the lock from being released, which keeps the spinner spinning. This is a performance disaster.

---

## Hardware Atomic Instructions on x86

### Key x86 Instructions

| Instruction      | Description                 | Use              |
| ---------------- | --------------------------- | ---------------- |
| `LOCK XCHG`      | Atomic exchange             | Test-and-Set     |
| `LOCK CMPXCHG`   | Atomic compare-and-exchange | Compare-and-Swap |
| `LOCK XADD`      | Atomic exchange-and-add     | Fetch-and-Add    |
| `LOCK INC`/`DEC` | Atomic increment/decrement  | Counters         |
| `LOCK BTS`       | Atomic bit test and set     | Bitfield locks   |

The `LOCK` prefix tells the CPU to **lock the bus** (or use cache-locking protocols) during the instruction, ensuring atomicity.

```text
Without LOCK prefix:                 With LOCK prefix:
Core 0: CMPXCHG [addr]              Core 0: LOCK CMPXCHG [addr]
Core 1: could read/write [addr]     Core 1: BLOCKED until LOCK completes
  → Race condition!                    → Atomic!
```

### C11 Atomic Operations

Modern C provides portable atomic operations:

```c
#include <stdatomic.h>

atomic_int counter = ATOMIC_VAR_INIT(0);

/* Atomic fetch-and-add */
int old = atomic_fetch_add(&counter, 1);

/* Atomic compare-and-swap */
int expected = 5;
bool success = atomic_compare_exchange_strong(
    &counter, &expected, 10);

/* Atomic load and store */
int val = atomic_load(&counter);
atomic_store(&counter, 42);
```

---

## Performance Characteristics

| Mechanism               | Latency (approx.) |        Scalability        |   Fairness    | Use Case                      |
| ----------------------- | :---------------: | :-----------------------: | :-----------: | ----------------------------- |
| **Interrupt disabling** |      ~10 ns       |      Single CPU only      |      N/A      | Kernel, uniprocessor          |
| **TAS spinlock**        |    ~50-100 ns     |  Poor (cache thrashing)   |     None      | Very short CS                 |
| **TTAS spinlock**       |    ~50-100 ns     | Better (less bus traffic) |     None      | Short CS                      |
| **TAS + backoff**       |      ~100 ns      |           Good            | Probabilistic | Short CS, moderate contention |
| **Ticket lock**         |      ~100 ns      |        Good (FIFO)        |     FIFO      | Short CS, fairness needed     |
| **CAS retry loop**      |    ~50-200 ns     |  Good for low contention  |     None      | Lock-free algorithms          |
| **Blocking mutex**      |      ~1-5 μs      |   Excellent (sleeping)    |    Varies     | Long CS, any contention       |

> [!NOTE]
> These numbers are approximate and vary significantly by CPU architecture, cache topology, and contention level. Always benchmark for your specific use case.

---

## Try It Yourself

**Exercise 1:** Implement mutual exclusion using Compare-and-Swap that satisfies bounded waiting. (Hint: combine CAS with a waiting array.)

:::details Solution

```c
#include <stdatomic.h>
#include <stdbool.h>

#define N 5  /* Number of processes */

atomic_int lock = 0;
bool waiting[N] = {false};

void lock_acquire(int i) {
    waiting[i] = true;
    int key = 1;
    while (waiting[i] && key == 1) {
        int expected = 0;
        key = !atomic_compare_exchange_strong(&lock, &expected, 1);
        /* key=0 if CAS succeeded (we got the lock) */
        /* key=1 if CAS failed (lock was held) */
    }
    waiting[i] = false;
}

void lock_release(int i) {
    /* Find next waiting process */
    int j = (i + 1) % N;
    while (j != i && !waiting[j])
        j = (j + 1) % N;

    if (j == i) {
        /* No one waiting — release lock */
        atomic_store(&lock, 0);
    } else {
        /* Hand lock to next waiting process */
        waiting[j] = false;
    }
}
```

This provides bounded waiting because on release, we scan for the next waiting process in round-robin order, ensuring every process gets a turn within N-1 entries by others.
:::

**Exercise 2:** Explain why the `PAUSE` instruction is used inside spin loops on x86 processors. What happens without it?

:::details Solution
The `PAUSE` instruction (introduced in Pentium 4) serves two purposes:

1. **Pipeline optimization**: Without `PAUSE`, the CPU's out-of-order execution engine speculatively executes many iterations of the spin loop. When the lock is finally released, all those speculative iterations must be discarded (pipeline flush), which is expensive. `PAUSE` tells the CPU "this is a spin loop" so it doesn't speculate aggressively.

2. **Power saving**: `PAUSE` introduces a small delay (~100 cycles), reducing the rate at which the thread hammers the memory bus with cache-line reads. This reduces power consumption and bus contention.

Without `PAUSE`, spin loops cause:

- Excessive pipeline flushes when the lock becomes available
- Higher power consumption
- Increased memory bus traffic that slows down the lock holder
- On hyperthreaded cores, the spinning thread consumes execution resources that could benefit the lock-holding sibling thread
  :::

---

## Key Takeaways

- **Memory barriers** (`MFENCE`, `SFENCE`, `LFENCE`) enforce ordering constraints that prevent CPUs from reordering memory operations across the fence.
- **Test-and-Set (TAS)** atomically reads and sets a flag — the simplest atomic synchronization primitive.
- **Compare-and-Swap (CAS)** atomically compares and conditionally updates a value — the most versatile primitive, enabling lock-free algorithms.
- **Fetch-and-Add** atomically increments and returns the old value — used for counters and ticket locks.
- The **ABA problem** is a CAS vulnerability where a value changes A→B→A and CAS doesn't detect the intermediate change. Solutions include version counters and tagged pointers.
- **Spinlocks** use busy waiting and are appropriate only for short critical sections on multiprocessor systems.
- **TTAS** (Test-and-Test-and-Set) reduces bus traffic by reading cached values before attempting atomic operations.
- **Ticket locks** provide FIFO fairness using fetch-and-add, solving the starvation problem of basic spinlocks.
- Modern CPUs provide `LOCK`-prefixed instructions (x86) or load-exclusive/store-conditional pairs (ARM, RISC-V) for hardware atomicity.
- **C11 atomics** (`<stdatomic.h>`) provide portable access to hardware atomic operations without platform-specific assembly.
