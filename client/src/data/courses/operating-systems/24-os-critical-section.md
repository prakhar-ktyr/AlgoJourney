---
title: The Critical Section Problem
section: "Process Synchronization"
---

# The Critical Section Problem

Now that we understand race conditions and why synchronization is necessary, we need a systematic framework for reasoning about concurrent access to shared data. The **Critical Section Problem** provides this framework — it defines precisely what constitutes a correct solution to mutual exclusion and gives us criteria to evaluate any proposed solution.

---

## What Is a Critical Section?

> A **critical section** is a segment of code in which a thread or process accesses shared resources (variables, files, data structures) that must not be accessed concurrently by another thread.

Every thread's code can be divided into four sections:

```text
┌──────────────────────────────────────────────┐
│                                              │
│    ┌──────────────────────────────────────┐   │
│    │         Entry Section               │   │
│    │   (Request permission to enter CS)   │   │
│    └──────────────┬───────────────────────┘   │
│                   ↓                          │
│    ┌──────────────────────────────────────┐   │
│    │       Critical Section (CS)         │   │
│    │   (Access shared resource)          │   │
│    │   counter++;                        │   │
│    │   balance += deposit;               │   │
│    └──────────────┬───────────────────────┘   │
│                   ↓                          │
│    ┌──────────────────────────────────────┐   │
│    │         Exit Section                │   │
│    │   (Release permission)              │   │
│    └──────────────┬───────────────────────┘   │
│                   ↓                          │
│    ┌──────────────────────────────────────┐   │
│    │       Remainder Section             │   │
│    │   (Code not involving shared data)  │   │
│    └──────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

### In Code

```c
while (true) {
    /* ----- Entry Section ----- */
    acquire_permission();

    /* ----- Critical Section ----- */
    shared_counter++;   /* Access shared resource */

    /* ----- Exit Section ----- */
    release_permission();

    /* ----- Remainder Section ----- */
    do_other_work();    /* No shared resources accessed */
}
```

---

## The Three Requirements

Any correct solution to the Critical Section Problem must satisfy **all three** of the following requirements:

### 1. Mutual Exclusion

> If process $P_i$ is executing in its critical section, then no other process can be executing in its critical section.

```text
CORRECT (Mutual Exclusion):        VIOLATION:

P1: [===CS===]                     P1: [===CS===]
P2:           [===CS===]           P2:     [===CS===]
                                          ↑
                                    OVERLAP! Both in CS.
```

### 2. Progress

> If no process is executing in its critical section and some processes wish to enter their critical section, then only the processes that are **not** executing in their remainder sections can participate in the decision of which process enters next, and this decision cannot be **postponed indefinitely**.

In simpler terms:

- If the critical section is free and someone wants in, **someone must get in** (no indefinite postponement).
- Only processes trying to enter can influence the decision (processes in their remainder section don't block others).

### 3. Bounded Waiting

> There exists a bound (limit) on the number of times other processes are allowed to enter their critical sections after a process has made a request to enter and before that request is granted.

In simpler terms: a process waiting to enter the CS won't be starved — it will eventually get in.

### Summary Table

| Requirement          | What It Prevents                | Informal Definition                                 |
| -------------------- | ------------------------------- | --------------------------------------------------- |
| **Mutual Exclusion** | Data corruption                 | At most one process in CS at a time                 |
| **Progress**         | Deadlock / unnecessary blocking | If CS is free and someone wants in, someone gets in |
| **Bounded Waiting**  | Starvation                      | Every requester eventually enters                   |

> [!IMPORTANT]
> A solution that provides mutual exclusion but allows starvation is **not** a complete solution. All three requirements must be satisfied simultaneously.

---

## Two-Process Solutions

Let's examine naive attempts at solving the Critical Section Problem for two processes, $P_0$ and $P_1$.

### Algorithm 1: Strict Alternation (Turn Variable)

The idea: use a shared variable `turn` that indicates whose turn it is to enter the CS.

```c
/* Shared variable */
int turn = 0;   /* 0 = P0's turn, 1 = P1's turn */

/* Process P0 */                   /* Process P1 */
while (true) {                     while (true) {
    while (turn != 0)              while (turn != 1)
        ;  /* busy wait */             ;  /* busy wait */

    /* Critical Section */          /* Critical Section */
    critical_section();             critical_section();

    turn = 1;                       turn = 0;

    /* Remainder */                 /* Remainder */
    remainder_section();            remainder_section();
}                                   }
```

### Analysis of Algorithm 1

| Requirement          | Satisfied? | Explanation                                                                                    |
| -------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| **Mutual Exclusion** | ✅ Yes     | `turn` can only be 0 or 1 — both can't be in CS simultaneously                                 |
| **Progress**         | ❌ **No**  | If P0 is in remainder section and never executes, P1 can never enter CS even though CS is free |
| **Bounded Waiting**  | ✅ Yes     | Strict alternation guarantees each process enters after the other                              |

**Why Progress Fails:**

```text
Scenario: P0 has a long remainder section, P1 wants to enter CS repeatedly.

P0:  [CS] [====== long remainder ======]
P1:  wait [CS] wait wait wait wait wait...
     ↑              ↑
  P1 can enter    P1 must wait for P0's turn
  after P0         even though CS is empty!

  → Progress violated: CS is free but P1 can't enter.
```

The problem is that **strict alternation** forces processes to take turns, even when one process doesn't need its turn. P1 can't enter the CS twice in a row even if P0 has no interest in the CS.

---

### Algorithm 2: Flag Array

The idea: each process has a flag indicating its desire to enter the CS.

```c
/* Shared variables */
bool flag[2] = {false, false};

/* Process Pi (i = 0 or 1, j = 1-i) */
while (true) {
    flag[i] = true;           /* I want to enter */
    while (flag[j])           /* Wait if other wants in */
        ;  /* busy wait */

    /* Critical Section */
    critical_section();

    flag[i] = false;          /* I'm done */

    /* Remainder */
    remainder_section();
}
```

### Analysis of Algorithm 2

| Requirement          | Satisfied? | Explanation                                                  |
| -------------------- | ---------- | ------------------------------------------------------------ |
| **Mutual Exclusion** | ✅ Yes     | Both flags can't simultaneously allow entry                  |
| **Progress**         | ❌ **No**  | Both processes can set their flags simultaneously → deadlock |
| **Bounded Waiting**  | —          | Not applicable if deadlock occurs                            |

**Why Progress Fails — Deadlock Scenario:**

```text
Time   P0                              P1
────   ──────────────────────          ──────────────────────
 t0    flag[0] = true
 t1                                    flag[1] = true
 t2    while (flag[1]) → TRUE, wait    while (flag[0]) → TRUE, wait
 t3    wait...                         wait...
 t4    wait...                         wait...

Both processes wait forever. DEADLOCK!
```

```text
  P0: flag[0]=true → wait for flag[1]==false → BLOCKED
                            ↑
                            │ circular dependency
                            ↓
  P1: flag[1]=true → wait for flag[0]==false → BLOCKED
```

> [!WARNING]
> The problem with Algorithm 2 is that setting the flag (declaring intent) and checking the other's flag are two separate operations. Between setting your flag and checking, the other process can also set its flag, creating a deadlock.

---

## Why Naive Approaches Fail

Let's visualize all the possible interleavings and their outcomes:

### Algorithm 1 (Turn Variable)

```text
  ┌─────────────────────────────────────────────────────────┐
  │ Mutual Exclusion: ✅  (turn enforces one-at-a-time)     │
  │ Progress:         ❌  (requires alternation)            │
  │ Bounded Waiting:  ✅  (strict alternation = no starve)  │
  │                                                         │
  │ Problem: A process must wait for the OTHER process      │
  │ to take its turn before entering again.                 │
  └─────────────────────────────────────────────────────────┘
```

### Algorithm 2 (Flags)

```text
  ┌─────────────────────────────────────────────────────────┐
  │ Mutual Exclusion: ✅  (both flags checked)              │
  │ Progress:         ❌  (can deadlock)                    │
  │ Bounded Waiting:  ❌  (deadlock = infinite wait)        │
  │                                                         │
  │ Problem: Setting flag and checking are not atomic.      │
  │ Both can set flags before either checks.                │
  └─────────────────────────────────────────────────────────┘
```

### What's Missing?

| Algorithm           | Has                | Missing                                                    |
| ------------------- | ------------------ | ---------------------------------------------------------- |
| Algorithm 1 (turn)  | Mutual exclusion   | Independence — shouldn't require other's participation     |
| Algorithm 2 (flags) | Intent declaration | Tie-breaking mechanism — who goes first when both want in? |

> [!TIP]
> The insight that leads to Peterson's Solution (next lesson): **combine both approaches** — use flags to declare intent AND a turn variable to break ties.

---

## The Critical Section in Practice

### Interrupt Disabling (Single Processor)

On a **single-processor** system, the simplest solution to the critical section problem is to disable interrupts:

```c
/* Single-processor only! */
void enter_critical_section() {
    disable_interrupts();   /* No context switch possible */
}

void exit_critical_section() {
    enable_interrupts();    /* Resume normal scheduling */
}
```

This works because on a single processor, concurrency arises only from context switches (driven by timer interrupts). Disabling interrupts prevents context switches, ensuring exclusive access.

### Why It Doesn't Scale

| Limitation                 | Explanation                                                                    |
| -------------------------- | ------------------------------------------------------------------------------ |
| **Multiprocessor failure** | Disabling interrupts on one core doesn't stop threads on other cores           |
| **Privileged operation**   | User programs shouldn't disable interrupts (security risk)                     |
| **System responsiveness**  | Disabling interrupts for too long can miss critical events (disk I/O, network) |
| **Real-time impact**       | Long CS can cause missed deadlines                                             |

```text
Single Processor (works):       Multiprocessor (FAILS):

Core 0: [interrupts OFF → CS]   Core 0: [interrupts OFF → CS]
  (no context switch possible)   Core 1: [──── runs freely ────]
                                          ↑ Thread on Core 1 can
                                            still enter CS!
```

> [!NOTE]
> The Linux kernel does use interrupt disabling for very short critical sections on single-processor configurations. On multiprocessor systems, it combines interrupt disabling with **spinlocks** for kernel-level synchronization.

---

## Formal Problem Statement

For $n$ processes $P_0, P_1, \ldots, P_{n-1}$, each with the structure:

```text
while (true) {
    ENTRY SECTION
    CRITICAL SECTION
    EXIT SECTION
    REMAINDER SECTION
}
```

Design the ENTRY and EXIT sections such that:

1. **Mutual Exclusion**: $\forall i, j$ where $i \neq j$: $P_i$ in CS $\implies$ $P_j$ not in CS
2. **Progress**: CS free ∧ some $P_k$ wants to enter $\implies$ some process enters CS in finite time
3. **Bounded Waiting**: $\exists$ bound $B$ such that after $P_i$ requests entry, at most $B$ other entries occur before $P_i$ enters

### Assumptions

| Assumption                             | Meaning                                         |
| -------------------------------------- | ----------------------------------------------- |
| Each process executes at nonzero speed | No process stops forever (unless it terminates) |
| No assumption about relative speed     | We don't know which process is faster           |
| Atomic memory reads and writes         | Single word reads/writes are indivisible        |

---

## The Road Ahead

We've defined the problem and shown that naive solutions fail. The next lessons provide progressively more sophisticated solutions:

```text
  ┌──────────────────────────────────────────┐
  │        Solutions to Critical Section     │
  │                                          │
  │  Software:                               │
  │    ├── Peterson's Solution (2 processes) │
  │    └── Bakery Algorithm (N processes)    │
  │                                          │
  │  Hardware:                               │
  │    ├── Test-and-Set                      │
  │    ├── Compare-and-Swap                  │
  │    └── Fetch-and-Add                     │
  │                                          │
  │  OS/Library:                             │
  │    ├── Mutex Locks                       │
  │    ├── Semaphores                        │
  │    └── Monitors                          │
  └──────────────────────────────────────────┘
```

---

## Try It Yourself

**Exercise 1:** Consider Algorithm 2 (flag array) with a small modification: each process sets its flag _after_ checking the other's flag instead of before. Does this fix the deadlock problem? Does it introduce any new issues?

```c
/* Modified Algorithm 2 */
while (true) {
    while (flag[j])           /* Check if other wants in FIRST */
        ;
    flag[i] = true;           /* Then declare intent */

    /* Critical Section */
    critical_section();

    flag[i] = false;
    remainder_section();
}
```

:::details Solution
This modification **eliminates the deadlock** (both processes can't be stuck waiting forever), but it **violates mutual exclusion**!

Consider this interleaving:

```
t0: P0 checks flag[1] → false (P1 hasn't set it yet)
t1: P1 checks flag[0] → false (P0 hasn't set it yet)
t2: P0 sets flag[0] = true → enters CS
t3: P1 sets flag[1] = true → enters CS ← BOTH IN CS!
```

Both processes see the other's flag as `false`, then both set their own flag and enter the CS simultaneously. This violates mutual exclusion.

**Lesson:** You can't simply reorder the check and set — both orderings have problems. We need a fundamentally different approach (Peterson's combined flag + turn).
:::

**Exercise 2:** A system has 3 processes. Process P0 enters the CS 10 times per second, P1 enters 5 times per second, and P2 enters 1 time per second. If the algorithm uses strict alternation (turn = 0, 1, 2, 0, 1, 2, ...), what problems arise?

:::details Solution
With strict alternation, each process must wait for the other two processes to take their turns before entering the CS again.

- P0 wants to enter 10 times/second but gets only every 3rd turn. If P2 enters once per second, P0 must wait for P2's slow cycle. P0's effective rate drops to ~1 entry/second.
- P2 gets a turn every 3rd cycle even though it rarely needs it. When P2 is in its remainder section, P0 and P1 are blocked waiting for P2's turn.

**Problems:**

1. **Progress violation**: CS sits empty while P0 and P1 wait for P2's turn.
2. **Throughput reduction**: The fastest process (P0) is throttled by the slowest (P2).
3. **Inefficiency**: CPU time is wasted on busy-waiting when the CS is empty.

This demonstrates why strict alternation is unacceptable for processes with different access frequencies.
:::

**Exercise 3:** Can interrupt disabling be used as a mutual exclusion mechanism in a user-level program? Why or why not?

:::details Solution
**No**, for several reasons:

1. **Privilege**: Disabling interrupts is a privileged operation. User programs run in user mode and cannot execute privileged instructions. Attempting to disable interrupts from user space would cause a protection fault.

2. **Security**: If user programs could disable interrupts, a malicious program could disable them and never re-enable them, locking up the entire system.

3. **Multiprocessor**: Even if allowed, disabling interrupts on one core doesn't affect other cores. On a multiprocessor system, another core could still access the shared resource.

4. **Blocking I/O**: Disabling interrupts prevents the OS from servicing I/O devices, network cards, and timers, potentially causing data loss.

Only the **kernel** can safely use interrupt disabling, and only for very short critical sections on single-processor systems.
:::

---

## Key Takeaways

- A **critical section** is code that accesses shared resources and must be protected from concurrent access.
- Every thread's code consists of four parts: **entry section**, **critical section**, **exit section**, and **remainder section**.
- Any correct solution must satisfy three requirements: **Mutual Exclusion** (at most one in CS), **Progress** (no unnecessary blocking when CS is free), and **Bounded Waiting** (no starvation).
- **Strict alternation** (Algorithm 1) provides mutual exclusion but violates progress — processes must take turns even when the other isn't interested.
- **Flag-based** approach (Algorithm 2) can deadlock when both processes set their flags simultaneously — violates progress.
- **Disabling interrupts** works only on single-processor systems and is a privileged operation — not suitable for user programs or multiprocessor systems.
- The key insight for a correct solution is to **combine** intent flags with a tie-breaking mechanism — which leads to Peterson's Solution in the next lesson.
