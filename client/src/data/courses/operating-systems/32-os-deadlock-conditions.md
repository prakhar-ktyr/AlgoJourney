---
title: Deadlock Characterization
---

# Deadlock Characterization

In 1971, Coffman, Elphick, and Shoshani formalized four conditions that must hold **simultaneously** for a deadlock to exist. These are known as the **Coffman Conditions** (or necessary conditions for deadlock). Understanding each condition deeply is essential because every deadlock handling strategy works by ensuring at least one condition cannot hold.

---

## The Four Coffman Conditions — Overview

| #   | Condition            | Informal Statement                                                                 |
| --- | -------------------- | ---------------------------------------------------------------------------------- |
| 1   | **Mutual Exclusion** | At least one resource is held in a non-sharable mode                               |
| 2   | **Hold and Wait**    | A process holding resources can request additional ones                            |
| 3   | **No Preemption**    | Resources cannot be forcibly taken from a process                                  |
| 4   | **Circular Wait**    | A circular chain of processes exists, each waiting for a resource held by the next |

> **All four conditions must hold simultaneously for a deadlock to occur.** If any one condition is absent, deadlock is impossible.

---

## Condition 1: Mutual Exclusion

> **Mutual Exclusion**: At least one resource must be held in a non-sharable mode — only one process at a time can use the resource. If another process requests it, the requester must wait.

### Why It Matters

Not all resources require mutual exclusion. **Read-only files**, for example, can be shared by any number of processes simultaneously. If all resources were sharable, no process would ever need to wait — and deadlock would be impossible.

### Examples

| Resource        | Sharable?                    | Mutual Exclusion Required? |
| --------------- | ---------------------------- | -------------------------- |
| Printer         | No — output would interleave | Yes                        |
| Read-only file  | Yes — multiple readers fine  | No                         |
| Mutex lock      | No — by definition           | Yes                        |
| Read-write file | Depends on mode              | Yes for writers            |
| CPU core        | No — one thread at a time    | Yes (per core)             |

```text
  Resource: Printer
  ┌───────────┐
  │  PRINTER  │ ← Only ONE process can use at a time
  └─────┬─────┘
        │
   ┌────┴────┐
   │ P1 uses │   P2 must WAIT
   └─────────┘
```

> [!NOTE]
> Mutual exclusion is inherent to certain resources — you cannot "share" a mutex lock. This condition is often the hardest to break because it is a fundamental property of the resource itself.

---

## Condition 2: Hold and Wait

> **Hold and Wait**: A process must be holding at least one resource while simultaneously waiting to acquire additional resources that are currently held by other processes.

### The Problem

If a process could only request resources when it held nothing, it would never be part of a deadlock. The danger arises when a process **accumulates** resources incrementally.

### Example

```text
  Process P1:
  ┌──────────────────────────────────────────┐
  │  Step 1: Acquire Disk     ✓ (holds)      │
  │  Step 2: Acquire Printer  ✗ (waits)      │
  │         └─── P1 is HOLDING disk          │
  │              while WAITING for printer   │
  └──────────────────────────────────────────┘
```

### In Code

```c
// Hold and Wait: P1 holds lock_A while waiting for lock_B
pthread_mutex_lock(&lock_A);   // HOLD
// ... some work with resource A ...
pthread_mutex_lock(&lock_B);   // WAIT (if lock_B is held by another)
```

### Breaking Hold and Wait

There are two classical approaches:

| Strategy                      | Description                                                    | Drawback                                                         |
| ----------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Request all at once**       | Process requests all needed resources before starting          | Low resource utilization; process may not know all needs upfront |
| **Release before requesting** | Process releases all held resources before requesting new ones | May lose partial work; requires saving state                     |

---

## Condition 3: No Preemption

> **No Preemption**: Resources already allocated to a process cannot be forcibly taken away. They can only be released voluntarily by the process holding them, after it has completed its task.

### Why It's Important

If the operating system could **preempt** (forcibly take back) a resource from a process, it could break potential deadlock cycles. But preemption is not always feasible — you cannot yank a half-printed document from a printer.

### Preemptable vs Non-Preemptable Resources

| Resource               | Preemptable? | Reason                                              |
| ---------------------- | ------------ | --------------------------------------------------- |
| CPU                    | Yes          | Context switch saves/restores state perfectly       |
| Memory pages           | Yes          | Pages can be swapped to disk                        |
| Printer                | No           | Partial printout is useless                         |
| Mutex lock             | No           | Preempting would violate mutual exclusion semantics |
| Tape drive (mid-write) | No           | Data corruption                                     |

```text
  Preemptable:                    Non-preemptable:
  ┌──────┐                        ┌──────────┐
  │ CPU  │ ← OS can take it       │ PRINTER  │ ← Can't yank mid-print
  │      │   back anytime          │          │
  └──────┘   (context switch)      └──────────┘
```

### Breaking No Preemption

If a process holding resources $R_1, R_2$ requests $R_3$ and is denied:

1. **Release** all currently held resources ($R_1, R_2$).
2. Add all three ($R_1, R_2, R_3$) to the process's request list.
3. The process restarts only when **all** resources can be allocated simultaneously.

> [!WARNING]
> This approach works only for resources whose state can be saved and restored (like CPU registers or memory). It is impractical for resources like printers or database locks.

---

## Condition 4: Circular Wait

> **Circular Wait**: There exists a set $\{P_0, P_1, \ldots, P_n\}$ of waiting processes such that $P_0$ is waiting for a resource held by $P_1$, $P_1$ is waiting for a resource held by $P_2$, ..., and $P_n$ is waiting for a resource held by $P_0$.

### ASCII Diagram

```text
        P0 ──waits for──→ P1
        ↑                  │
        │                  │ waits for
        │                  ↓
        P3 ←──waits for── P2

   P0 → P1 → P2 → P3 → P0   (Circular chain)
```

### With Resources Shown

```text
   P0 ─→ R1 ─→ P1 ─→ R2 ─→ P2 ─→ R3 ─→ P0
   │      ↑     │      ↑     │      ↑     │
   │  holds     │  holds     │  holds     │
   └──wants─────┘──wants─────┘──wants─────┘
```

### Mathematical Formulation

A circular wait can be expressed as a cycle in a **wait-for** relation:

$$P_0 \rightarrow P_1 \rightarrow P_2 \rightarrow \cdots \rightarrow P_n \rightarrow P_0$$

where $P_i \rightarrow P_j$ means "$P_i$ is waiting for a resource held by $P_j$."

Formally, define a binary relation $W$ on processes:

$$(P_i, P_j) \in W \iff P_i \text{ is waiting for a resource currently held by } P_j$$

Circular wait exists if and only if $W$ contains a **cycle** — i.e., there exists a sequence $P_{i_0}, P_{i_1}, \ldots, P_{i_k}$ where $(P_{i_j}, P_{i_{j+1}}) \in W$ for all $j$ and $P_{i_k} = P_{i_0}$.

### Breaking Circular Wait

Impose a **total ordering** $F$ on all resource types: $F(R_i) < F(R_j)$ means $R_i$ has a lower order than $R_j$. Then require:

> A process may request resource $R_j$ only if $F(R_j) > F(R_k)$ for all resources $R_k$ that the process currently holds.

**Why does this work?** Proof by contradiction:

Assume a circular wait exists: $P_0 \rightarrow P_1 \rightarrow \cdots \rightarrow P_n \rightarrow P_0$.

- $P_0$ holds some resource $R_a$ and requests $R_b$ held by $P_1$. By the rule: $F(R_b) > F(R_a)$.
- $P_1$ holds $R_b$ and requests $R_c$ held by $P_2$. By the rule: $F(R_c) > F(R_b)$.
- Continuing: $F(R_a) < F(R_b) < F(R_c) < \cdots < F(R_z)$.
- But $P_n$ holds $R_z$ and requests $R_a$ held by $P_0$. By the rule: $F(R_a) > F(R_z)$.
- **Contradiction**: $F(R_a) < F(R_b) < \cdots < F(R_z) < F(R_a)$ is impossible.

Therefore, circular wait **cannot** exist under total ordering. $\blacksquare$

---

## Why ALL FOUR Conditions Are Necessary

A common misconception is that any one condition is _sufficient_ for deadlock. In fact, all four must hold **simultaneously**. Removing any single condition prevents deadlock:

| Condition Removed | Why Deadlock Cannot Occur                               |
| ----------------- | ------------------------------------------------------- |
| Mutual Exclusion  | Resources are sharable → no waiting → no deadlock       |
| Hold and Wait     | Processes never hold while waiting → no cycles can form |
| No Preemption     | OS can forcibly reclaim resources → breaks any cycle    |
| Circular Wait     | No cycle → no deadlock (requires at least a chain)      |

### Demonstrating Necessity: Remove Hold and Wait

```text
  Scenario: All resources requested at once (no Hold and Wait)

  P1 requests {R1, R2}:
    - If both available → P1 gets both, does work, releases both
    - If not both available → P1 waits, holding NOTHING

  P2 requests {R2, R3}:
    - Same logic — P2 waits holding nothing if R2 unavailable

  Result: No process ever holds a resource while waiting.
  Even if P1 is waiting for R2 (held by P2), P1 holds nothing.
  P2 has no reason to wait for P1 → NO CIRCULAR DEPENDENCY.
```

### Demonstrating Necessity: Remove Circular Wait (via Ordering)

```text
  Resource ordering: F(R1) = 1, F(R2) = 2, F(R3) = 3

  P1 can hold R1, then request R2 ✓ (2 > 1)
  P2 can hold R2, then request R3 ✓ (3 > 2)
  P3 holds R3, tries to request R1 ✗ (1 < 3, violates ordering)

  The cycle P1→P2→P3→P1 is IMPOSSIBLE under this ordering.
```

---

## Summary Table: Four Conditions Deep Dive

| Condition            | Formal Definition                                | Real-World Example                                 | How to Break It                                       | Cost of Breaking                                                 |
| -------------------- | ------------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| **Mutual Exclusion** | Only one process uses resource at a time         | Only one person uses a restroom stall              | Make resources sharable (spooling, read-only copies)  | Not always possible — some resources are inherently non-sharable |
| **Hold and Wait**    | Process holds ≥1 resource while waiting for more | Holding a fork while waiting for a knife at dinner | Request all at once or release all before new request | Low utilization; may not know future needs                       |
| **No Preemption**    | Resources cannot be forcibly taken               | Cannot take someone's seat on a bus                | Allow OS to preempt resources                         | Only feasible for resources with saveable state                  |
| **Circular Wait**    | $P_0 → P_1 → \cdots → P_n → P_0$                 | Cars at a gridlocked intersection                  | Impose total ordering on resource requests            | Requires programmer discipline; may be inconvenient              |

---

## Necessary vs Sufficient Conditions

> [!IMPORTANT]
> The four Coffman conditions are **necessary** for deadlock — deadlock cannot exist unless all four hold. However, they may not be **sufficient** in every context. With multi-instance resource types, all four conditions can hold without deadlock actually occurring (we will see this with Resource Allocation Graphs in the next lesson). For **single-instance** resource types, the four conditions are both necessary and sufficient.

| Resource Instances          | Four Conditions               | Deadlock?                                  |
| --------------------------- | ----------------------------- | ------------------------------------------ |
| Single instance per type    | All four hold                 | **Always** deadlock                        |
| Multiple instances per type | All four hold                 | **Maybe** deadlock (depends on allocation) |
| Any                         | One or more conditions absent | **Never** deadlock                         |

---

## Real-World Examples of Coffman Conditions

### Database Transactions

Consider two bank transactions running concurrently:

```text
  Transaction T1:                   Transaction T2:
  ┌──────────────────────┐          ┌──────────────────────┐
  │ LOCK Account A (ME)  │          │ LOCK Account B (ME)  │
  │ READ Account A       │          │ READ Account B       │
  │ LOCK Account B (HW)  │          │ LOCK Account A (HW)  │
  │ TRANSFER A→B         │          │ TRANSFER B→A         │
  │ UNLOCK both          │          │ UNLOCK both          │
  └──────────────────────┘          └──────────────────────┘

  ME = Mutual Exclusion (exclusive lock)
  HW = Hold and Wait (holds one lock, requests another)
  No Preemption = DB doesn't revoke locks mid-transaction
  Circular Wait = T1 waits for B (held by T2), T2 waits for A (held by T1)
```

### Operating System: Disk and Tape

```text
  Process A:
    1. Acquires disk drive
    2. Requests tape drive (held by B) → waits

  Process B:
    1. Acquires tape drive
    2. Requests disk drive (held by A) → waits

  All four conditions present → DEADLOCK
```

---

## Detecting the Conditions in Code

A practical exercise for concurrent programmers is to audit code for the four conditions:

```python
import threading

lock_x = threading.Lock()   # Resource X (Mutual Exclusion ✓)
lock_y = threading.Lock()   # Resource Y (Mutual Exclusion ✓)

def process_alpha():
    lock_x.acquire()         # Hold lock_x
    # ... work ...
    lock_y.acquire()         # Wait for lock_y (Hold and Wait ✓)
    # No Preemption ✓ (threading.Lock cannot be preempted)
    # Circular Wait ✓ (if process_beta acquires in reverse order)
    lock_y.release()
    lock_x.release()

def process_beta():
    lock_y.acquire()         # Hold lock_y
    lock_x.acquire()         # Wait for lock_x → POTENTIAL DEADLOCK
    lock_x.release()
    lock_y.release()
```

**Checklist for deadlock auditing:**

| ✓   | Question                                           | If "Yes"                      |
| --- | -------------------------------------------------- | ----------------------------- |
| ☐   | Are any resources used exclusively (not shared)?   | Mutual Exclusion present      |
| ☐   | Do processes hold resources while requesting more? | Hold and Wait present         |
| ☐   | Can the OS revoke allocated resources?             | If No → No Preemption present |
| ☐   | Is there a cycle in the wait-for relationships?    | Circular Wait present         |
| ☐   | All four checked?                                  | **DEADLOCK POSSIBLE**         |

---

## Try It Yourself

**Exercise 1:** For each scenario below, identify which Coffman conditions are present and whether deadlock can occur:
(a) Five threads each need two mutex locks from a pool of five. Each thread acquires one lock, then requests a second.
(b) A process requests all needed memory pages at once before starting computation.

:::details Solution
**(a)** All four conditions are present:

- **Mutual Exclusion**: Mutex locks are non-sharable by definition.
- **Hold and Wait**: Each thread holds one lock while requesting another.
- **No Preemption**: Mutex locks cannot be preempted.
- **Circular Wait**: With 5 threads and 5 locks, a cycle can form (e.g., T1→T2→T3→T4→T5→T1 if each holds the lock the next needs).
- **Deadlock CAN occur** (this is the Dining Philosophers problem).

**(b)** Hold and Wait is **broken** — the process requests all resources before starting and holds nothing while waiting. Even if mutual exclusion, no preemption, and circular wait conditions exist among _other_ processes, this particular process cannot be part of a deadlock cycle because it never holds while waiting.
:::

**Exercise 2:** Design a resource ordering for a system with four resource types: Disk ($D$), Printer ($P$), Scanner ($S$), and Network ($N$). Then show that with your ordering, the circular wait $P_1 \rightarrow P_2 \rightarrow P_3 \rightarrow P_1$ cannot form when each process needs two resources.

:::details Solution
Define the ordering: $F(D) = 1$, $F(N) = 2$, $F(P) = 3$, $F(S) = 4$.

Every process must request resources in increasing order:

- A process needing Disk and Printer must request Disk first, then Printer ($1 < 3$ ✓).
- A process needing Printer and Scanner must request Printer first, then Scanner ($3 < 4$ ✓).
- A process needing Scanner and Disk must request Disk first, then Scanner ($1 < 4$ ✓).

Now suppose circular wait: $P_1 \rightarrow P_2 \rightarrow P_3 \rightarrow P_1$.

- $P_1$ holds $R_a$ and wants $R_b$ (held by $P_2$): $F(R_b) > F(R_a)$.
- $P_2$ holds $R_b$ and wants $R_c$ (held by $P_3$): $F(R_c) > F(R_b)$.
- $P_3$ holds $R_c$ and wants $R_a$ (held by $P_1$): $F(R_a) > F(R_c)$.
- But $F(R_a) < F(R_b) < F(R_c) < F(R_a)$ — **contradiction!** ∎

The circular wait is impossible under this ordering.
:::

---

## Key Takeaways

- The **four Coffman Conditions** — Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait — must **all** hold simultaneously for deadlock to occur.
- Removing **any one** condition is sufficient to prevent deadlock.
- **Mutual Exclusion** is inherent to many resources and often the hardest condition to break.
- **Hold and Wait** can be broken by requesting all resources at once, at the cost of reduced utilization.
- **No Preemption** can be broken only for resources whose state is easily saved and restored (CPU, memory), not for printers or locks.
- **Circular Wait** is most practically broken by imposing a **total ordering** on resource types — a proof by contradiction shows no cycle can form.
- For **single-instance** resource types, the four conditions are both necessary and sufficient for deadlock.
- For **multi-instance** resources, all four conditions can hold without deadlock — further analysis (Resource Allocation Graphs) is needed.
