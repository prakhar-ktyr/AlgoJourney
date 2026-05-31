---
title: Deadlock Detection & Recovery
---

# Deadlock Detection & Recovery

What if we don't want to restrict how processes request resources (prevention) or require advance declarations of maximum needs (avoidance)? The third strategy is to **let deadlocks happen**, then **detect and recover** from them. This approach is reactive rather than proactive and is widely used in database management systems.

---

## When to Use Detection vs Prevention/Avoidance

| Approach                 | Restrictions on Processes      | Runtime Overhead               | Resource Utilization | Best For                                  |
| ------------------------ | ------------------------------ | ------------------------------ | -------------------- | ----------------------------------------- |
| **Prevention**           | Severe (ordering, all-at-once) | Low                            | Low                  | Safety-critical systems                   |
| **Avoidance**            | Moderate (declare max needs)   | Medium ($O(mn^2)$ per request) | Medium               | Moderate workloads with predictable needs |
| **Detection & Recovery** | None                           | Periodic detection cost        | **Highest**          | General systems, databases                |
| **Ignorance (Ostrich)**  | None                           | None                           | Highest              | General-purpose OSes (Linux, Windows)     |

> [!TIP]
> If deadlocks are **rare** and the cost of detection/recovery is tolerable, detection is often the best strategy because it imposes **no restrictions** on normal operation and maximizes resource utilization.

---

## Single-Instance Detection: Wait-For Graph

When every resource type has exactly **one instance**, we can use a simplified graph called the **Wait-For Graph** (WFG).

### Construction

The Wait-For Graph is derived from the Resource Allocation Graph by **removing resource nodes** and collapsing edges:

- If $P_i \rightarrow R_q$ and $R_q \rightarrow P_j$ exist in the RAG, add edge $P_i \rightarrow P_j$ in the WFG.
- This edge means "$P_i$ is waiting for $P_j$."

```text
  Resource Allocation Graph:          Wait-For Graph:

  (P1) ──→ [R1] ──→ (P2)             (P1) ──→ (P2)
             ↑                                   │
  (P3) ──→ [R2] ──→ (P4)             (P3) ──→ (P4)
             ↑                                   │
             └── (P2) ──→ [R2]       (P2) ──→ (P3)

  Remove resource nodes              Direct "waits-for"
  and connect processes              relationships
```

### Deadlock Detection

> A deadlock exists in the system **if and only if** the Wait-For Graph contains a **cycle**.

Cycle detection in a directed graph can be done using **DFS** (Depth-First Search):

```python
def detect_cycle_wfg(adj_list, n):
    """
    Detect cycle in Wait-For Graph using DFS.
    adj_list: dict mapping process -> list of processes it waits for
    """
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {p: WHITE for p in range(n)}
    deadlocked = set()

    def dfs(u):
        color[u] = GRAY
        for v in adj_list.get(u, []):
            if color[v] == GRAY:
                # Back edge found → cycle → deadlock!
                deadlocked.add(u)
                deadlocked.add(v)
                return True
            if color[v] == WHITE:
                if dfs(v):
                    deadlocked.add(u)
                    return True
        color[u] = BLACK
        return False

    for p in range(n):
        if color[p] == WHITE:
            dfs(p)

    return deadlocked
```

**Time complexity**: $O(n + e)$ where $n$ = processes, $e$ = edges in the WFG.

---

## Multi-Instance Detection Algorithm

For resource types with **multiple instances**, the Wait-For Graph is insufficient. We use an algorithm similar to the Banker's Safety Algorithm but without the `Max` matrix (since we don't require advance declarations).

### Data Structures

| Structure          | Description                                         |
| ------------------ | --------------------------------------------------- |
| `Available[m]`     | Currently available instances of each resource type |
| `Allocation[n][m]` | Resources currently allocated to each process       |
| `Request[n][m]`    | Resources currently requested by each process       |

> [!NOTE]
> Unlike the Banker's Algorithm, we do **not** need `Max` or `Need`. We only look at what processes have and what they're currently requesting.

### Algorithm Pseudocode

```c
bool detect_deadlock() {
    int Work[m];
    bool Finish[n];

    // Step 1: Initialize
    for (int j = 0; j < m; j++)
        Work[j] = Available[j];
    for (int i = 0; i < n; i++)
        Finish[i] = (Allocation[i] == 0);  // No resources → can't deadlock

    // Step 2: Find process whose request can be satisfied
    bool found;
    do {
        found = false;
        for (int i = 0; i < n; i++) {
            if (!Finish[i]) {
                bool can_proceed = true;
                for (int j = 0; j < m; j++) {
                    if (Request[i][j] > Work[j]) {
                        can_proceed = false;
                        break;
                    }
                }
                if (can_proceed) {
                    for (int j = 0; j < m; j++)
                        Work[j] += Allocation[i][j];
                    Finish[i] = true;
                    found = true;
                }
            }
        }
    } while (found);

    // Step 3: Any process not finished is deadlocked
    bool deadlock = false;
    for (int i = 0; i < n; i++) {
        if (!Finish[i]) {
            printf("Process P%d is deadlocked\n", i);
            deadlock = true;
        }
    }
    return deadlock;
}
```

### Key Difference from Safety Algorithm

| Aspect                       | Safety Algorithm (Avoidance) | Detection Algorithm                           |
| ---------------------------- | ---------------------------- | --------------------------------------------- |
| Uses `Max`/`Need`            | Yes                          | No                                            |
| Uses `Request`               | No (checks `Need`)           | Yes (checks current `Request`)                |
| Purpose                      | Check if state is safe       | Check if deadlock **exists now**              |
| When run                     | Before each allocation       | Periodically or on demand                     |
| Processes with no allocation | Not special                  | Marked `Finish = true` (can't be in deadlock) |

---

## Worked Example: Multi-Instance Detection

**System: 5 processes, 3 resource types**

| Resource | Total | Available |
| -------- | ----- | --------- |
| A        | 7     | 0         |
| B        | 2     | 0         |
| C        | 6     | 0         |

| Process | Allocation (A B C) | Request (A B C) |
| ------- | ------------------ | --------------- |
| $P_0$   | 0 1 0              | 0 0 0           |
| $P_1$   | 2 0 0              | 2 0 2           |
| $P_2$   | 3 0 3              | 0 0 0           |
| $P_3$   | 2 1 1              | 1 0 0           |
| $P_4$   | 0 0 2              | 0 0 2           |

**Available = (7-7, 2-2, 6-6) = (0, 0, 0)**

### Step-by-Step Detection

**Initialize:** Work = (0, 0, 0). Finish: all false initially.

Check Allocation: $P_0$ has allocation (0,1,0) ≠ 0, so Finish[0] = false. Similarly for all.

**Iteration 1:** Find process with Request ≤ Work:

| Process | Request | Work (0,0,0) | Request ≤ Work? |
| ------- | ------- | ------------ | --------------- |
| $P_0$   | (0,0,0) | (0,0,0)      | **Yes** ✓       |

Select $P_0$: Work = (0,0,0) + (0,1,0) = (0,1,0). Finish[0] = true.

**Iteration 2:**

| Process | Request | Work (0,1,0) | Request ≤ Work? |
| ------- | ------- | ------------ | --------------- |
| $P_1$   | (2,0,2) | (0,1,0)      | No (2>0)        |
| $P_2$   | (0,0,0) | (0,1,0)      | **Yes** ✓       |

Select $P_2$: Work = (0,1,0) + (3,0,3) = (3,1,3). Finish[2] = true.

**Iteration 3:**

| Process | Request | Work (3,1,3) | Request ≤ Work? |
| ------- | ------- | ------------ | --------------- |
| $P_1$   | (2,0,2) | (3,1,3)      | **Yes** ✓       |

Select $P_1$: Work = (3,1,3) + (2,0,0) = (5,1,3). Finish[1] = true.

**Iteration 4:**

| Process | Request | Work (5,1,3) | Request ≤ Work? |
| ------- | ------- | ------------ | --------------- |
| $P_3$   | (1,0,0) | (5,1,3)      | **Yes** ✓       |

Select $P_3$: Work = (5,1,3) + (2,1,1) = (7,2,4). Finish[3] = true.

**Iteration 5:**

| Process | Request | Work (7,2,4) | Request ≤ Work? |
| ------- | ------- | ------------ | --------------- |
| $P_4$   | (0,0,2) | (7,2,4)      | **Yes** ✓       |

Select $P_4$: Work = (7,2,6). Finish[4] = true.

**All Finish[i] = true → NO DEADLOCK** ✓

### Now Change $P_2$'s Request to (0, 0, 1):

Re-running with Request[$P_2$] = (0, 0, 1):

Work = (0, 0, 0). Only $P_0$ has Request = (0,0,0) ≤ Work.

After $P_0$: Work = (0, 1, 0).

| Process | Request | Work (0,1,0) | Request ≤ Work? |
| ------- | ------- | ------------ | --------------- |
| $P_1$   | (2,0,2) | No           |
| $P_2$   | (0,0,1) | No (1>0)     |
| $P_3$   | (1,0,0) | No (1>0)     |
| $P_4$   | (0,0,2) | No (2>0)     |

**No more processes can proceed** → **DEADLOCK DETECTED!**

Deadlocked processes: $\{P_1, P_2, P_3, P_4\}$

---

## When to Invoke Detection

The frequency of invoking the detection algorithm involves a cost-benefit tradeoff:

| Strategy                 | When to Invoke                                                 | Cost                              | Benefit                                                  |
| ------------------------ | -------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------- |
| **Every request**        | Each time a resource request cannot be immediately granted     | Very high ($O(mn^2)$ per request) | Deadlocks detected immediately; can identify exact cause |
| **Periodically**         | At fixed intervals (e.g., every 5 minutes, every 100 requests) | Moderate                          | Good balance of detection speed and overhead             |
| **CPU utilization drop** | When CPU utilization falls below a threshold (e.g., < 40%)     | Low                               | Only checks when deadlock symptoms appear                |
| **Manual**               | When administrator suspects a problem                          | Minimal                           | Lowest overhead; highest detection latency               |

> [!TIP]
> A practical heuristic: invoke detection when CPU utilization drops below a threshold **and** there are pending resource requests. This targets the key symptom of deadlock (idle CPU with waiting processes) without unnecessary overhead.

---

## Recovery Strategy 1: Process Termination

Once a deadlock is detected, one approach is to **terminate** processes to break the cycle.

### Option A: Abort All Deadlocked Processes

- **Pros**: Simple, guaranteed to break deadlock.
- **Cons**: Enormous cost — all partial work lost. May disrupt critical processes.

### Option B: Abort One at a Time

Terminate one process at a time, running the detection algorithm after each termination, until the deadlock is resolved.

**Selection criteria — which process to terminate first?**

| Criterion                        | Description                               | Priority                                     |
| -------------------------------- | ----------------------------------------- | -------------------------------------------- |
| **Process priority**             | Lower priority processes terminated first | High-priority = keep                         |
| **Computation time**             | How much work has the process completed?  | Less work done = easier to redo              |
| **Resources held**               | How many and what type?                   | More resources = releasing has bigger impact |
| **Resources needed**             | How many more resources needed to finish? | Almost done = let it finish                  |
| **Process type**                 | Interactive vs batch?                     | Batch processes easier to restart            |
| **Number of processes affected** | How many processes depend on this one?    | Fewer dependents = safer to terminate        |

```text
  Deadlock: {P1, P2, P3, P4}

  Selection: terminate P3 (lowest priority, most resources held)
  ┌─────────────────────────────┐
  │ Kill P3                      │
  │ Release P3's resources       │
  │ Re-run detection algorithm   │
  │ Deadlock still exists?       │
  │ ├── YES → Kill next victim   │
  │ └── NO  → Recovery complete  │
  └─────────────────────────────┘
```

---

## Recovery Strategy 2: Resource Preemption

Instead of terminating processes, **preempt** (forcibly take) resources from some processes and give them to others.

### Three Issues to Address

| Issue                  | Description                                          | Solution                                                                                           |
| ---------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Selecting a victim** | Which process should lose its resources?             | Use cost function based on priority, resources held, computation done                              |
| **Rollback**           | After losing resources, what happens to the process? | **Total rollback** (restart from beginning) or **partial rollback** (roll back to safe checkpoint) |
| **Starvation**         | Same process might be selected as victim repeatedly  | Include **number of rollbacks** in cost function; limit consecutive victimizations                 |

### Rollback Strategies

```text
  Total Rollback:                  Partial Rollback (Checkpointing):

  ┌──Start──┐    ┌──Start──┐      ┌──Start──────Ckpt─────Ckpt──┐
  │ Redo ALL │    │ Discard │      │ Saved  │    │  Redo from   │
  │ work     │    │ all work│      │ state  │    │  last ckpt   │
  └──────────┘    └─────────┘      └────────┘    └──────────────┘

  Expensive but simple             Cheaper but requires checkpointing
```

### Starvation Prevention

To prevent a process from being victimized indefinitely:

$$\text{Cost}(P_i) = f(\text{priority}, \text{resources}, \text{time}, \text{rollback\_count})$$

Including `rollback_count` in the cost function ensures that a process that has been rolled back many times becomes increasingly expensive to preempt, eventually making it a poor victim choice.

---

## Cost of Detection

| Metric                                 | Value                               |
| -------------------------------------- | ----------------------------------- |
| Time complexity (single-instance, WFG) | $O(n + e)$ where $e$ = edges        |
| Time complexity (multi-instance)       | $O(m \times n^2)$ per invocation    |
| Space complexity                       | $O(n \times m)$ for data structures |

For a system with $n = 100$ processes and $m = 10$ resource types, each invocation costs $O(10 \times 10000) = O(100000)$ operations — manageable for periodic checks but expensive if invoked per request.

---

## Combined Approaches

Real systems often combine multiple strategies:

| System Component      | Strategy Used                        | Rationale                                  |
| --------------------- | ------------------------------------ | ------------------------------------------ |
| CPU scheduling        | Prevention (preemption)              | CPU is inherently preemptable              |
| Memory management     | Prevention (preemption via swapping) | Pages can be swapped                       |
| File system locks     | Avoidance or Detection               | Files may have predictable access patterns |
| Database transactions | **Detection & Recovery**             | Transactions can be rolled back            |
| Kernel locks          | **Prevention (ordering)**            | Linux lockdep enforces ordering            |
| Network resources     | **Timeout-based**                    | Connections time out naturally             |

### Combined Strategy Table

| Aspect               | Prevention | Avoidance  | Detection            | Combined                  |
| -------------------- | ---------- | ---------- | -------------------- | ------------------------- |
| Resource utilization | Low        | Medium     | High                 | Optimal per resource type |
| Overhead             | Low        | Medium     | Low (periodic)       | Moderate                  |
| Programmer effort    | High       | Medium     | Low                  | Varies                    |
| Deadlock freedom     | Guaranteed | Guaranteed | Detected & recovered | Best overall              |

---

## Real-World OS Approaches

### The Ostrich Algorithm (Linux, Windows, macOS)

Most general-purpose operating systems simply **ignore** the deadlock problem:

```text
  ┌─────────────────────────────────────────────┐
  │           THE OSTRICH ALGORITHM             │
  │                                              │
  │  "Stick your head in the sand and pretend   │
  │   that deadlocks never happen."             │
  │                                              │
  │  Rationale:                                  │
  │  • Deadlocks are rare in practice            │
  │  • Prevention/avoidance is too expensive     │
  │  • Users can kill hung processes manually    │
  │  • System reboot is an acceptable last       │
  │    resort                                    │
  └─────────────────────────────────────────────┘
```

> [!IMPORTANT]
> The ostrich algorithm is a _deliberate engineering decision_, not laziness. The cost of implementing full deadlock handling in a general-purpose OS exceeds the benefit, given the rarity of deadlocks in practice. The tradeoff favors performance and simplicity.

### Database Systems (PostgreSQL, MySQL, Oracle)

Database systems **must** handle deadlocks because transactions are long-running and lock contention is high:

| DBMS         | Detection Method                         | Recovery Method                           |
| ------------ | ---------------------------------------- | ----------------------------------------- |
| PostgreSQL   | Wait-For Graph with timeout              | Roll back youngest transaction            |
| MySQL/InnoDB | Wait-For Graph                           | Roll back transaction with fewest changes |
| Oracle       | Immediate detection on wait              | Roll back the detecting statement         |
| SQL Server   | Background thread checks every 5 seconds | Roll back least expensive transaction     |

```python
# Simplified database deadlock detection (PostgreSQL-style)
def check_for_deadlock(transaction_id, lock_manager):
    """
    Called when a transaction blocks on a lock.
    Uses DFS on the wait-for graph.
    """
    waiting_for = lock_manager.get_blocker(transaction_id)
    visited = set()

    current = waiting_for
    while current is not None:
        if current == transaction_id:
            # Cycle detected — deadlock!
            rollback(transaction_id)  # Victim = the requesting txn
            raise DeadlockError(
                f"Transaction {transaction_id} rolled back "
                f"due to deadlock"
            )
        if current in visited:
            break  # No cycle through this path
        visited.add(current)
        current = lock_manager.get_blocker(current)
```

### Linux Kernel: lockdep

While Linux uses the ostrich algorithm for user-space, it uses **lockdep** for kernel-space lock ordering:

```text
  lockdep detects POTENTIAL deadlocks at runtime:

  Thread 1:  lock(A) → lock(B)     lockdep records: A → B
  Thread 2:  lock(B) → lock(A)     lockdep records: B → A

  lockdep: "WARNING! Circular dependency: A → B → A"
  (Warning issued even if deadlock hasn't occurred yet)
```

---

## Try It Yourself

**Exercise 1:** Given the following system, use the multi-instance detection algorithm to determine if a deadlock exists:

| Process | Allocation (A B) | Request (A B) |
| ------- | ---------------- | ------------- |
| $P_0$   | (1, 0)           | (0, 1)        |
| $P_1$   | (0, 1)           | (1, 0)        |

Available = (0, 0)

:::details Solution
Work = (0, 0). All processes have non-zero allocation, so Finish = [false, false].

Check $P_0$: Request (0,1) ≤ Work (0,0)? No (1>0). ✗
Check $P_1$: Request (1,0) ≤ Work (0,0)? No (1>0). ✗

No process can proceed. **DEADLOCK DETECTED** involving {$P_0$, $P_1$}.

This is the classic two-process, two-resource deadlock: $P_0$ holds A and wants B; $P_1$ holds B and wants A.
:::

**Exercise 2:** In the deadlock above, which process would you terminate first if:

- $P_0$ has been running for 10 minutes and is 90% complete
- $P_1$ has been running for 2 minutes and is 20% complete
  Justify your answer using the selection criteria.

:::details Solution
Terminate **$P_1$** first:

- **Computation time**: $P_1$ has done only 2 minutes of work (less to redo) vs $P_0$'s 10 minutes.
- **Completion percentage**: $P_0$ is 90% complete — terminating it wastes far more work.
- **Resources needed**: $P_0$ likely needs very few more resources to finish.

By terminating $P_1$, we release resource B. $P_0$ can acquire B, finish (restoring resource A), and then $P_1$ can be restarted — losing only 2 minutes of work instead of 10.
:::

**Exercise 3:** Why don't Linux or Windows use the Banker's Algorithm for deadlock avoidance?

:::details Solution
Several reasons:

1. **Unknown maximum needs**: User processes don't declare their maximum resource requirements upfront — this information is simply not available in a general-purpose OS.
2. **Dynamic process creation**: The number of processes changes constantly; the Banker's Algorithm assumes a fixed, known set.
3. **Performance overhead**: Running $O(mn^2)$ safety checks for every resource request would significantly slow down the system.
4. **Rarity of deadlocks**: In practice, user-space deadlocks are rare enough that the cost of handling them doesn't justify the overhead.
5. **Alternative solutions**: Users can kill hung processes (`kill -9`), and the system can be rebooted as a last resort.
   :::

---

## Key Takeaways

- **Deadlock detection** allows deadlocks to occur, then identifies and resolves them — no restrictions on normal operation.
- For **single-instance** resources, use a **Wait-For Graph** and detect cycles with DFS in $O(n+e)$.
- For **multi-instance** resources, use a detection algorithm similar to the Banker's Safety Algorithm but using `Request` instead of `Need` — complexity $O(m \times n^2)$.
- **Recovery** options: terminate processes (all at once or one at a time) or preempt resources (with rollback).
- **Victim selection** considers priority, computation time, resources held, and rollback count to avoid starvation.
- Detection frequency trades **overhead** for **detection speed** — invoke on every request, periodically, or when CPU utilization drops.
- Most **general-purpose OSes** use the **ostrich algorithm** (ignore deadlocks).
- **Database systems** actively detect and recover from deadlocks by rolling back transactions.
- **Real-world systems** combine prevention, avoidance, and detection for different resource types.
