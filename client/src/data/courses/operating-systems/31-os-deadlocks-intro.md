---
title: Introduction to Deadlocks
section: "Deadlocks"
---

# Introduction to Deadlocks

Every computing system shares finite resources among competing processes. When two or more processes each hold a resource the other needs — and none is willing to release what it has — the system enters a **deadlock**: a frozen state where no forward progress is possible. Understanding deadlocks is the first step toward building reliable, high-throughput operating systems.

---

## Real-World Analogies

Before we dive into formal definitions, let us build intuition with everyday situations that mirror deadlock perfectly.

### Traffic Gridlock

Imagine a four-way intersection where every lane is packed. Each car must wait for the lane ahead to clear, but that lane is blocked by another car waiting for the _next_ lane, and so on in a circle.

```text
             |   |   |
             | ↓ |   |
             |   |   |
        ─────┼───┼───┼─────
          →  | A | B |  →
        ─────┼───┼───┼─────
          ←  | D | C |  ←
        ─────┼───┼───┼─────
             |   |   |
             |   | ↑ |
             |   |   |

   A waits for B's lane to clear
   B waits for C's lane to clear
   C waits for D's lane to clear
   D waits for A's lane to clear
   → DEADLOCK: No car can move!
```

### Two Trains on a Single Track

> _"When two trains approach each other at a crossing, both shall come to a full stop and neither shall start up again until the other has gone."_
> — Apocryphal Kansas legislature statute, often cited in OS textbooks

This humorously illustrates the logical impossibility of a circular dependency: each train waits for the other to move first.

### The Dining Philosophers (Preview)

Five philosophers sit around a table with five chopsticks. Each needs two chopsticks to eat. If every philosopher picks up the chopstick to their left simultaneously, all five wait forever for the right chopstick — classic deadlock.

---

## Formal Definition

> **Deadlock**: A set of processes $\{P_1, P_2, \ldots, P_n\}$ is deadlocked if every process $P_i$ in the set is waiting for an event (typically a resource release) that can only be caused by another process in the same set.

Because every member of the set is waiting, none can produce the event that unblocks another. The system is permanently stuck unless external intervention occurs.

---

## System Model

To reason about deadlocks precisely, we define a **system model** describing how processes interact with resources.

### Resource Types and Instances

| Concept                 | Description                                 | Examples                                                              |
| ----------------------- | ------------------------------------------- | --------------------------------------------------------------------- |
| **Resource type** $R_j$ | A category of equivalent resources          | CPU cycles, printers, memory pages, mutex locks                       |
| **Instance**            | A single unit within a resource type        | If the system has 3 printers, then $R_\text{printer}$ has 3 instances |
| **Reusable resource**   | Used, then released for others              | CPU, memory, I/O devices, files                                       |
| **Consumable resource** | Created by one process, consumed by another | Signals, messages, interrupts                                         |

### Resource Lifecycle

Every process interacts with a resource through a strict three-phase lifecycle:

```text
  ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ REQUEST  │ ──→ │   USE    │ ──→ │ RELEASE  │
  └──────────┘     └──────────┘     └──────────┘
       │                                   │
       │  Process blocks if                │  Resource returned
       │  resource unavailable             │  to available pool
       └───────────────────────────────────┘
```

1. **Request**: The process asks the OS for a resource. If unavailable, the process blocks (waits).
2. **Use**: The process operates on the resource (e.g., prints to a printer, writes to a file).
3. **Release**: The process relinquishes the resource, making it available for others.

In code, these phases correspond to system calls:

| Phase   | Typical System Calls                        |
| ------- | ------------------------------------------- |
| Request | `open()`, `allocate()`, `lock()`, `wait()`  |
| Use     | `read()`, `write()`, `print()`              |
| Release | `close()`, `free()`, `unlock()`, `signal()` |

---

## A Simple Deadlock Example

Consider two processes that each need two mutex locks to perform their work:

```c
#include <pthread.h>

pthread_mutex_t lock_A = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t lock_B = PTHREAD_MUTEX_INITIALIZER;

void *thread_1(void *arg) {
    pthread_mutex_lock(&lock_A);      // Step 1: Acquire lock A
    printf("Thread 1: Holding A, requesting B...\n");
    sleep(1);                          // Simulates some work
    pthread_mutex_lock(&lock_B);      // Step 2: Request lock B → BLOCKS
    // ... critical section ...
    pthread_mutex_unlock(&lock_B);
    pthread_mutex_unlock(&lock_A);
    return NULL;
}

void *thread_2(void *arg) {
    pthread_mutex_lock(&lock_B);      // Step 1: Acquire lock B
    printf("Thread 2: Holding B, requesting A...\n");
    sleep(1);                          // Simulates some work
    pthread_mutex_lock(&lock_A);      // Step 2: Request lock A → BLOCKS
    // ... critical section ...
    pthread_mutex_unlock(&lock_A);
    pthread_mutex_unlock(&lock_B);
    return NULL;
}
```

**Timeline of execution:**

| Time   | Thread 1              | Thread 2              | Lock A Owner | Lock B Owner |
| ------ | --------------------- | --------------------- | ------------ | ------------ |
| $t_0$  | Acquires A            | —                     | Thread 1     | Free         |
| $t_1$  | —                     | Acquires B            | Thread 1     | Thread 2     |
| $t_2$  | Requests B → _blocks_ | —                     | Thread 1     | Thread 2     |
| $t_3$  | _blocked_             | Requests A → _blocks_ | Thread 1     | Thread 2     |
| $t_4+$ | **DEADLOCK**          | **DEADLOCK**          | Thread 1     | Thread 2     |

```text
  Thread 1          Thread 2
  ┌──────┐          ┌──────┐
  │Holds │── A ──→  │Wants │
  │      │          │      │
  │Wants │←── B ──  │Holds │
  └──────┘          └──────┘
     Circular dependency → DEADLOCK
```

> [!WARNING]
> The `sleep(1)` call in the example above increases the probability of deadlock but is not strictly necessary. On a multi-core system, the two threads can reach their respective `lock()` calls in any interleaving.

---

## Deadlock vs Starvation vs Livelock

These three terms describe different forms of **lack of progress**, but they are fundamentally distinct:

| Property                 | Deadlock                                             | Starvation                                                                        | Livelock                                                                |
| ------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Definition**           | Processes permanently blocked waiting for each other | A process is indefinitely denied resources because others keep being served first | Processes continuously change state but make no useful progress         |
| **Blocked?**             | Yes — all processes are blocked                      | Partially — the starved process never gets scheduled                              | No — processes are running but doing nothing useful                     |
| **Circular dependency?** | Yes — always                                         | No                                                                                | No                                                                      |
| **Can resolve itself?**  | Never without intervention                           | Possibly, if scheduling changes                                                   | Possibly, if random delays break the pattern                            |
| **Example**              | Two threads holding each other's locks               | Low-priority process never scheduled under strict priority scheduling             | Two people in a hallway stepping aside in the same direction repeatedly |
| **Involves resources?**  | Always                                               | Sometimes                                                                         | May or may not                                                          |

### Starvation: A Closer Look

Starvation occurs when a process waits indefinitely, not because of a circular dependency, but because the scheduler or resource allocator perpetually favors other processes. In a priority-based system, a low-priority process may _never_ run if higher-priority processes keep arriving.

### Livelock: A Closer Look

```text
  Person A        Person B
  ────→              ←────
    steps left       steps left
  ←────              ────→
    steps right      steps right
  ────→              ←────
    ... repeats forever ...
```

In computing, livelock can happen when two processes keep retrying an operation in response to each other. For instance, two Ethernet devices that collide and retransmit simultaneously, then collide again. The Ethernet protocol addresses this with **exponential backoff** — adding random delays to break the symmetry.

---

## Impact of Deadlocks on System Performance

Deadlocks have severe consequences that extend beyond the immediately blocked processes:

| Impact                 | Description                                                               |
| ---------------------- | ------------------------------------------------------------------------- |
| **Resource waste**     | Deadlocked processes hold resources they will never use productively      |
| **Reduced throughput** | Other processes may be blocked waiting for deadlocked resources           |
| **CPU idle time**      | If enough processes are deadlocked, the CPU has nothing useful to execute |
| **Cascading blocks**   | Non-deadlocked processes may depend on deadlocked ones and also stall     |
| **User frustration**   | Interactive systems become unresponsive; servers stop serving requests    |
| **System reboot**      | In severe cases, the only recovery is a full system restart               |

### Cost of Deadlock Handling

Operating systems must choose from four strategies for dealing with deadlocks, each with its own tradeoffs:

```text
  ┌──────────────────────────────────────────────────┐
  │            Deadlock Handling Strategies           │
  ├────────────────┬─────────────────────────────────┤
  │  Prevention    │  Ensure one Coffman condition    │
  │                │  never holds. Conservative.      │
  ├────────────────┼─────────────────────────────────┤
  │  Avoidance     │  Dynamically check if granting   │
  │                │  a request is safe. Moderate.    │
  ├────────────────┼─────────────────────────────────┤
  │  Detection &   │  Allow deadlocks, detect them,  │
  │  Recovery      │  then break them. Reactive.      │
  ├────────────────┼─────────────────────────────────┤
  │  Ignorance     │  Pretend deadlocks don't happen. │
  │  (Ostrich)     │  Used by Linux, Windows, most    │
  │                │  general-purpose OSes.            │
  └────────────────┴─────────────────────────────────┘
```

> [!NOTE]
> Most general-purpose operating systems (Linux, Windows, macOS) use the **ostrich algorithm** — they simply ignore deadlocks. The reasoning is that the cost of prevention, avoidance, or detection outweighs the rare occurrences of deadlock in practice. When deadlocks do occur, users reboot or kill processes manually.

The upcoming lessons will explore each strategy in detail.

---

## Conditions for Deadlock — A Preview

In 1971, Coffman, Elphick, and Shoshani identified four conditions that must **all** hold simultaneously for a deadlock to occur:

| #   | Condition            | One-Line Summary                                         |
| --- | -------------------- | -------------------------------------------------------- |
| 1   | **Mutual Exclusion** | At least one resource must be non-sharable               |
| 2   | **Hold and Wait**    | A process holds resources while waiting for more         |
| 3   | **No Preemption**    | Resources cannot be forcibly taken away                  |
| 4   | **Circular Wait**    | A circular chain of processes, each waiting for the next |

We will study each in depth in the next lesson.

---

## Deadlocks in Python (Demonstration)

Python's `threading` module provides locks that can exhibit the same deadlock behavior:

```python
import threading
import time

lock_a = threading.Lock()
lock_b = threading.Lock()

def worker_1():
    with lock_a:
        print("Worker 1: acquired lock A")
        time.sleep(0.5)
        print("Worker 1: waiting for lock B...")
        with lock_b:
            print("Worker 1: acquired both locks!")

def worker_2():
    with lock_b:
        print("Worker 2: acquired lock B")
        time.sleep(0.5)
        print("Worker 2: waiting for lock A...")
        with lock_a:
            print("Worker 2: acquired both locks!")

t1 = threading.Thread(target=worker_1)
t2 = threading.Thread(target=worker_2)
t1.start()
t2.start()
t1.join()  # This will hang — deadlock!
t2.join()
```

> [!TIP]
> You can detect this deadlock using Python's `faulthandler` module. Adding `faulthandler.enable()` at the start of your program lets you press Ctrl+\ (SIGQUIT) to get a traceback showing where each thread is stuck.

---

## Historical Context

The concept of deadlock has been studied since the early days of multiprogramming:

| Year  | Milestone                                                                          |
| ----- | ---------------------------------------------------------------------------------- |
| 1965  | Dijkstra describes the "Deadly Embrace" problem in the THE multiprogramming system |
| 1968  | Havender proposes deadlock prevention strategies at IBM                            |
| 1969  | Habermann introduces the Banker's Algorithm concept                                |
| 1971  | Coffman, Elphick, and Shoshani publish the four necessary conditions               |
| 1972  | Holt introduces Resource Allocation Graphs                                         |
| 1980s | Database systems develop deadlock detection for transaction management             |
| Today | Distributed deadlocks remain an active research area                               |

---

## Try It Yourself

**Exercise 1:** Consider three processes $P_1$, $P_2$, $P_3$ and three resource types $R_1$, $R_2$, $R_3$ (each with one instance). $P_1$ holds $R_1$ and wants $R_2$. $P_2$ holds $R_2$ and wants $R_3$. $P_3$ holds $R_3$ and wants $R_1$. Is this a deadlock? Explain why.

:::details Solution
Yes, this is a deadlock. All four Coffman conditions are met:

1. **Mutual Exclusion**: Each resource has one instance and is non-sharable.
2. **Hold and Wait**: Each process holds one resource while waiting for another.
3. **No Preemption**: No process is forced to release its resource.
4. **Circular Wait**: $P_1 \rightarrow R_2 \rightarrow P_2 \rightarrow R_3 \rightarrow P_3 \rightarrow R_1 \rightarrow P_1$ — a perfect cycle.

No process can proceed, so all are permanently blocked.
:::

**Exercise 2:** Modify the C pseudocode example in this lesson so that deadlock is **impossible** while still having both threads acquire both locks. (Hint: think about ordering.)

:::details Solution
Have both threads acquire locks in the **same order** (e.g., always A before B):

```c
void *thread_1(void *arg) {
    pthread_mutex_lock(&lock_A);
    pthread_mutex_lock(&lock_B);
    // ... critical section ...
    pthread_mutex_unlock(&lock_B);
    pthread_mutex_unlock(&lock_A);
    return NULL;
}

void *thread_2(void *arg) {
    pthread_mutex_lock(&lock_A);   // Same order as thread_1
    pthread_mutex_lock(&lock_B);
    // ... critical section ...
    pthread_mutex_unlock(&lock_B);
    pthread_mutex_unlock(&lock_A);
    return NULL;
}
```

By imposing a **total ordering** on lock acquisition (always A before B), the circular wait condition is broken. This is the simplest deadlock prevention technique for lock-based code.
:::

**Exercise 3:** Classify each scenario as deadlock, starvation, or livelock:
(a) Two database transactions each hold a lock the other needs.
(b) A background print job never gets CPU time because interactive tasks always have higher priority.
(c) Two network routers keep bouncing a packet between each other.

:::details Solution
(a) **Deadlock** — circular dependency on locks, both transactions are blocked.
(b) **Starvation** — the print job is ready to run but never gets scheduled.
(c) **Livelock** — the routers are actively processing (forwarding the packet) but no useful progress is made.
:::

---

## Key Takeaways

- A **deadlock** is a permanent state where a set of processes are each waiting for a resource held by another process in the set — no process can proceed.
- Deadlocks require the simultaneous occurrence of four conditions (Coffman Conditions): Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.
- **Deadlock ≠ Starvation ≠ Livelock** — blocked vs. indefinitely delayed vs. busy but unproductive.
- The **system model** consists of resource types with multiple instances, and processes follow a request → use → release lifecycle.
- Deadlocks waste resources, reduce throughput, and can cascade to affect non-deadlocked processes.
- Most general-purpose OSes use the **ostrich algorithm** — they ignore deadlocks entirely because prevention/detection is too expensive for the rarity of occurrence.
- In concurrent programming, careful **lock ordering** is the simplest way to prevent deadlocks in practice.
