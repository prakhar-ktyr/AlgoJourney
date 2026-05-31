---
title: Deadlock Prevention
---

# Deadlock Prevention

Deadlock prevention takes a **proactive** approach: constrain how processes request resources so that at least one of the four Coffman conditions can **never** hold. If even one condition is structurally impossible, deadlock cannot occur — guaranteed. The price is often reduced resource utilization or increased complexity for the programmer.

---

## Strategy Overview

Recall the four necessary conditions for deadlock:

| #   | Condition        | Prevention Strategy                                    |
| --- | ---------------- | ------------------------------------------------------ |
| 1   | Mutual Exclusion | Make resources sharable                                |
| 2   | Hold and Wait    | Require all-at-once requests or release-before-request |
| 3   | No Preemption    | Allow OS to preempt resources                          |
| 4   | Circular Wait    | Impose total ordering on resource types                |

We will examine each strategy in detail, with examples, code, and an honest assessment of practicality.

---

## Breaking Mutual Exclusion

> **Idea**: If all resources are sharable, no process ever needs to wait — and deadlock cannot occur.

### How It Works

Some resources can be made inherently sharable:

| Resource        | Can Be Made Sharable? | Technique                                                              |
| --------------- | --------------------- | ---------------------------------------------------------------------- |
| Read-only files | Already sharable      | Multiple readers allowed                                               |
| Printer         | Yes, via **spooling** | Print jobs written to spool file; only spooler daemon accesses printer |
| Mutex lock      | No                    | Mutual exclusion is the _purpose_ of a mutex                           |
| Read-write file | Partially             | Readers-writers lock: multiple readers OR one writer                   |
| Memory pages    | Partially             | Copy-on-Write (COW) — share until written                              |

### Spooling Example

```text
  Without spooling:                With spooling:

  P1 ──→ PRINTER ←── P2           P1 ──→ SPOOL ──→ PRINTER
  (conflict! one must wait)        P2 ──→ SPOOL     (no conflict)

                                   Spool daemon handles
                                   actual printing sequentially
```

### Limitations

> [!WARNING]
> Mutual exclusion **cannot** be broken for inherently non-sharable resources. You cannot share a mutex lock — the entire purpose of a mutex is mutual exclusion. This condition is determined by the nature of the resource, not by OS policy.

**Verdict**: Applicable only in limited cases. Not a general-purpose solution.

---

## Breaking Hold and Wait

> **Idea**: Ensure a process never holds resources while waiting for additional ones.

### Protocol 1: Request All at Once

Before execution begins, a process must request **all** resources it will need. The system either grants all of them or none.

```c
// Protocol 1: Request all resources upfront
void process_work() {
    // Request all needed resources atomically
    request_all(DISK, PRINTER, SCANNER);  // Blocks until ALL are free

    // Now guaranteed to have everything
    use_disk();
    use_printer();
    use_scanner();

    release_all(DISK, PRINTER, SCANNER);
}
```

```text
  ┌────────────────────────────────┐
  │ Process requests {R1, R2, R3}  │
  │                                │
  │ All available? ─── YES ──→ GRANT all, start working │
  │       │                                              │
  │      NO                                              │
  │       │                                              │
  │       ↓                                              │
  │ Wait (holding NOTHING)                               │
  └────────────────────────────────┘
```

### Protocol 2: Release Before Requesting

A process must release **all** currently held resources before requesting any new ones.

```c
// Protocol 2: Release before new request
void process_work() {
    request(DISK);
    read_data_from_disk();
    release(DISK);        // Must release before next request

    request(PRINTER);
    print_results();
    release(PRINTER);
}
```

### Comparison of Protocols

| Aspect                   | Protocol 1 (All at Once)                                        | Protocol 2 (Release First)                      |
| ------------------------ | --------------------------------------------------------------- | ----------------------------------------------- |
| **Simplicity**           | Simple to implement                                             | More complex logic                              |
| **Resource utilization** | Poor — holds resources before needing them                      | Better — resources freed when not actively used |
| **Starvation risk**      | High — process may wait forever if some resource is always busy | Moderate                                        |
| **Feasibility**          | Process may not know all future needs                           | Must be able to save/restore partial progress   |
| **Programmer burden**    | Must declare all resources upfront                              | Must restructure code around release points     |

### Disadvantages

1. **Low resource utilization**: A process may hold a printer for its entire execution even though it only prints at the very end.
2. **Starvation**: A process needing many popular resources may never get all of them simultaneously.
3. **Unpredictability**: Many processes don't know all their resource needs at startup — needs depend on input data and runtime conditions.

**Verdict**: Practical in batch systems where resource needs are known in advance. Impractical for interactive or dynamic applications.

---

## Breaking No Preemption

> **Idea**: If a process cannot get a resource it requests, force it to release all resources it currently holds.

### Protocol

```text
  Process P holds {R1, R2}
  P requests R3

  Is R3 available?
  ├── YES → Grant R3, continue
  └── NO  → P must RELEASE R1 and R2
            P is added to wait queue for {R1, R2, R3}
            P restarts when ALL THREE are available
```

### Alternative Variant

If $P_1$ requests resource $R$ held by $P_2$, and $P_2$ is **also waiting** for some resource:

- Preempt $R$ from $P_2$ and give it to $P_1$.
- $P_2$ must now wait for $R$ as well.

### When Preemption is Feasible

| Resource           | Preemptable? | Why?                                    |
| ------------------ | ------------ | --------------------------------------- |
| CPU registers      | Yes          | State saved/restored via context switch |
| Memory pages       | Yes          | Pages swapped to disk, reloaded later   |
| Database locks     | Sometimes    | Rollback transaction, restart           |
| Printer mid-job    | No           | Partial output is useless               |
| Network connection | No           | State cannot be easily saved            |

### Implementation Example

```python
def request_resource(process, requested_resource, held_resources):
    if is_available(requested_resource):
        allocate(requested_resource, process)
    else:
        # Preemption protocol: release everything
        for resource in held_resources:
            release(resource, process)
            add_to_wait_list(resource, process)

        add_to_wait_list(requested_resource, process)
        # Process restarts when all resources are available
        wait_for_all(held_resources + [requested_resource], process)
```

### Drawbacks

- Only works for resources whose state can be **saved and restored** cheaply.
- Can lead to **starvation** if a process is repeatedly preempted.
- High overhead for saving/restoring state.
- Increases total system work (wasted partial computation).

**Verdict**: Works well for CPU and memory. Impractical for I/O devices and locks.

---

## Breaking Circular Wait

> **Idea**: Impose a **total ordering** on all resource types, and require every process to request resources in strictly increasing order.

This is the **most practical and widely used** deadlock prevention technique.

### Total Ordering

Define a function $F: \text{ResourceTypes} \rightarrow \mathbb{N}$ that assigns a unique number to each resource type:

| Resource Type | $F$ Value |
| ------------- | --------- |
| Mutex Lock A  | 1         |
| Mutex Lock B  | 2         |
| Disk          | 3         |
| Printer       | 4         |
| Scanner       | 5         |

### The Rule

> A process holding resource $R_i$ may only request resource $R_j$ if $F(R_j) > F(R_i)$.

Equivalently: always acquire locks/resources in increasing order of $F$.

### Correct Code Example

```c
// Resource ordering: F(lock_A) = 1, F(lock_B) = 2
// Always acquire in increasing order

void *thread_1(void *arg) {
    pthread_mutex_lock(&lock_A);    // F = 1 (lowest first)
    pthread_mutex_lock(&lock_B);    // F = 2 > 1 ✓
    // ... critical section ...
    pthread_mutex_unlock(&lock_B);
    pthread_mutex_unlock(&lock_A);
    return NULL;
}

void *thread_2(void *arg) {
    pthread_mutex_lock(&lock_A);    // F = 1 (same order!)
    pthread_mutex_lock(&lock_B);    // F = 2 > 1 ✓
    // ... critical section ...
    pthread_mutex_unlock(&lock_B);
    pthread_mutex_unlock(&lock_A);
    return NULL;
}
// Both threads acquire A before B → no circular wait possible
```

### Proof That Circular Wait Is Impossible

We prove by contradiction. Assume a circular wait exists under total ordering:

$$P_0 \xrightarrow{R_{a_0}} P_1 \xrightarrow{R_{a_1}} P_2 \xrightarrow{R_{a_2}} \cdots P_n \xrightarrow{R_{a_n}} P_0$$

where $P_i$ holds some resource and requests $R_{a_i}$ held by $P_{i+1}$.

Each $P_i$ holds a resource $R_{b_i}$ and requests $R_{a_i}$. By the ordering rule:

$$F(R_{a_i}) > F(R_{b_i}) \quad \forall i$$

Since $R_{a_i}$ is held by $P_{i+1}$, we have $R_{b_{i+1}} = R_{a_i}$ (or at least $F(R_{b_{i+1}}) \geq F(R_{a_i})$). Following the chain:

$$F(R_{b_0}) < F(R_{a_0}) \leq F(R_{b_1}) < F(R_{a_1}) \leq F(R_{b_2}) < \cdots < F(R_{a_n}) \leq F(R_{b_0})$$

This gives $F(R_{b_0}) < F(R_{b_0})$ — a **contradiction**. $\blacksquare$

### Practical Considerations

```text
  Linux kernel lock ordering example:

  ┌──────────────────────────────────────────┐
  │  Lock Ordering (simplified hierarchy)    │
  │                                          │
  │  1. rq->lock (runqueue lock)             │
  │  2. p->pi_lock (PI lock)                 │
  │  3. p->alloc_lock                        │
  │  4. mm->mmap_lock                        │
  │  5. inode->i_mutex                       │
  │  6. ...                                  │
  │                                          │
  │  Always acquire in this order!           │
  │  lockdep warns if violated.              │
  └──────────────────────────────────────────┘
```

> [!TIP]
> The Linux kernel uses a tool called **lockdep** that dynamically checks lock ordering at runtime. If a thread acquires locks in an order that could lead to deadlock, lockdep prints a warning — even if no deadlock actually occurs. This is invaluable for kernel development.

### Drawbacks

- Requires programmer discipline — all developers must agree on and follow the ordering.
- The ordering may be **inconvenient**: sometimes the natural logic of the program suggests acquiring resources in a different order.
- Assigning a total ordering to dynamically created resources (e.g., per-object locks) can be tricky — address-based ordering is one solution.

**Verdict**: The most practical prevention technique. Widely used in operating system kernels and database systems.

---

## Practicality Analysis

| Prevention Strategy     | Deadlock Freedom | Resource Utilization | Throughput      | Implementation Difficulty | Practical?           |
| ----------------------- | ---------------- | -------------------- | --------------- | ------------------------- | -------------------- |
| Break Mutual Exclusion  | ✓                | High                 | High            | Varies                    | Limited cases only   |
| Break Hold and Wait     | ✓                | Low                  | Low-Medium      | Medium                    | Batch systems        |
| Break No Preemption     | ✓                | Medium               | Medium          | High                      | CPU/memory only      |
| **Break Circular Wait** | **✓**            | **Medium-High**      | **Medium-High** | **Medium**                | **Most widely used** |

### Decision Flowchart

```text
  Can you make resources sharable?
  ├── YES → Break Mutual Exclusion (easiest)
  └── NO
      │
      Can processes declare all needs upfront?
      ├── YES → Break Hold and Wait (all-at-once)
      └── NO
          │
          Can resource state be saved/restored?
          ├── YES → Break No Preemption
          └── NO
              │
              Can you define a total ordering?
              ├── YES → Break Circular Wait ★ RECOMMENDED
              └── NO  → Consider avoidance or detection instead
```

---

## Prevention vs System Performance

Deadlock prevention comes at a cost. By constraining resource allocation, we reduce the system's ability to fully utilize resources:

| Metric               | Without Prevention | With Prevention                                  |
| -------------------- | ------------------ | ------------------------------------------------ |
| Maximum parallelism  | High               | Reduced (resources held longer or underused)     |
| Resource utilization | Optimal            | Sub-optimal (resources reserved "just in case")  |
| Throughput           | Highest possible   | Lower (processes may wait unnecessarily)         |
| Response time        | Optimal            | May increase (waiting for all resources at once) |
| Deadlock risk        | Present            | **Eliminated**                                   |

The key insight is that **prevention trades performance for safety**. In the next lesson, we will study **deadlock avoidance**, which takes a more nuanced approach — allowing more flexibility while still preventing deadlock.

---

## Try It Yourself

**Exercise 1:** A system has four resource types: $A$, $B$, $C$, $D$. Three processes need:

- $P_1$: needs $A$ and $C$
- $P_2$: needs $B$ and $D$
- $P_3$: needs $C$ and $D$

Assign a total ordering $F$ to prevent circular wait and show the acquisition order each process must follow.

:::details Solution
One valid ordering: $F(A) = 1$, $F(B) = 2$, $F(C) = 3$, $F(D) = 4$.

- $P_1$ needs $A$ and $C$: acquire $A$ first ($F=1$), then $C$ ($F=3$). ✓
- $P_2$ needs $B$ and $D$: acquire $B$ first ($F=2$), then $D$ ($F=4$). ✓
- $P_3$ needs $C$ and $D$: acquire $C$ first ($F=3$), then $D$ ($F=4$). ✓

Circular wait is impossible because all processes acquire in increasing $F$ order.
:::

**Exercise 2:** Explain why breaking mutual exclusion cannot prevent deadlock for a system of mutex locks. What alternative approach would you recommend?

:::details Solution
Mutex locks are, by definition, non-sharable — that is their entire purpose. If you allow multiple processes to "share" a mutex, it is no longer a mutex and fails to provide the synchronization guarantee it was designed for.

The recommended alternative is to **break the circular wait** condition by imposing a total ordering on mutex locks. For example, if you have `lock_A` and `lock_B`, define $F(\text{lock\_A}) = 1$ and $F(\text{lock\_B}) = 2$, and always acquire `lock_A` before `lock_B`. This is simple, effective, and widely used in practice.
:::

**Exercise 3:** A process needs a printer and a scanner. Using the "release before requesting" protocol (breaking Hold and Wait), write pseudocode showing how the process should work. What is the main disadvantage?

:::details Solution

```c
void process_work() {
    // Phase 1: Use scanner
    request(SCANNER);
    scan_document();
    save_scan_to_file();   // Must save progress!
    release(SCANNER);      // Release before next request

    // Phase 2: Use printer
    request(PRINTER);
    load_scan_from_file(); // Restore saved progress
    print_document();
    release(PRINTER);
}
```

The main disadvantage is that the process must **save and restore intermediate state** (the scanned document) between releasing the scanner and acquiring the printer. This adds overhead and complexity. Additionally, between the release and the next request, another process could grab the scanner — if the process needs the scanner again, it would have to wait.
:::

---

## Key Takeaways

- **Deadlock prevention** ensures at least one Coffman condition can never hold, guaranteeing deadlock freedom at the cost of reduced flexibility.
- **Breaking Mutual Exclusion** works only for resources that can be made sharable (e.g., spooling for printers). Not applicable to locks.
- **Breaking Hold and Wait** via "request all at once" or "release before requesting" leads to low resource utilization and possible starvation.
- **Breaking No Preemption** is feasible only for resources with saveable state (CPU, memory), not I/O devices.
- **Breaking Circular Wait** via total ordering is the **most practical technique** — used in the Linux kernel (`lockdep`), database systems, and application-level concurrent code.
- A mathematical **proof by contradiction** shows that total ordering makes circular wait impossible.
- Prevention trades **system performance** (utilization, throughput) for **safety** (deadlock freedom).
- When prevention is too restrictive, **deadlock avoidance** offers a more flexible alternative.
