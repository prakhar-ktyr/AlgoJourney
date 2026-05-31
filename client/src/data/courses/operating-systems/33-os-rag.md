---
title: Resource Allocation Graphs
section: "Deadlocks"
---

# Resource Allocation Graphs

How do we **visualize** and **detect** deadlocks? A Resource Allocation Graph (RAG) is a directed graph that captures the relationships between processes and resources. Introduced by Holt in 1972, the RAG provides a precise, graphical method to determine whether a system is deadlocked.

---

## Graph Notation

A Resource Allocation Graph $G = (V, E)$ consists of:

### Vertices (V)

| Symbol | Shape                 | Represents                                       |
| ------ | --------------------- | ------------------------------------------------ |
| $P_i$  | Circle ○              | A process                                        |
| $R_j$  | Rectangle □ with dots | A resource type with dots representing instances |

### Edges (E)

| Edge                  | Direction          | Meaning                                             | Name                |
| --------------------- | ------------------ | --------------------------------------------------- | ------------------- |
| $P_i \rightarrow R_j$ | Process → Resource | $P_i$ has **requested** $R_j$ and is waiting        | **Request edge**    |
| $R_j \rightarrow P_i$ | Resource → Process | An instance of $R_j$ has been **assigned** to $P_i$ | **Assignment edge** |

### Visual Convention

```text
  Request Edge:              Assignment Edge:

     ○ ─────→ ┌───┐            ┌───┐ ─────→ ○
     P1        │ R1│            │ R1│         P1
               │ • │            │ • │
               └───┘            └───┘

  P1 is waiting for R1       R1 (one instance) is
                              assigned to P1
```

### Drawing Resources with Multiple Instances

Each dot inside the resource rectangle represents one instance:

```text
    ┌─────────┐
    │   R1    │     R1 has 3 instances
    │ • • •   │
    └─────────┘

    ┌─────────┐
    │   R2    │     R2 has 2 instances
    │  • •    │
    └─────────┘

    ┌─────────┐
    │   R3    │     R3 has 1 instance
    │    •    │
    └─────────┘
```

---

## Building a RAG — Example

Consider this system state:

| Process | Holds | Requests |
| ------- | ----- | -------- |
| $P_1$   | $R_1$ | $R_2$    |
| $P_2$   | $R_2$ | $R_3$    |
| $P_3$   | $R_3$ | —        |

Each resource has a single instance. Let us draw the RAG:

```text
    ┌─────┐         ┌─────┐         ┌─────┐
    │ R1  │         │ R2  │         │ R3  │
    │  •  │         │  •  │         │  •  │
    └──┬──┘         └──┬──┘         └──┬──┘
       │               │               │
       │ assigned      │ assigned      │ assigned
       ↓               ↓               ↓
      (P1)───request─→(P2)───request─→(P3)
         waits for R2     waits for R3

  Wait chain: P1 → P2 → P3 (no cycle → NO DEADLOCK)
  P3 can finish, release R3, which unblocks P2, etc.
```

This system has no cycle and therefore **no deadlock**.

---

## RAG Example: Deadlock Present

Now modify the system so $P_3$ requests $R_1$:

| Process | Holds | Requests |
| ------- | ----- | -------- |
| $P_1$   | $R_1$ | $R_2$    |
| $P_2$   | $R_2$ | $R_3$    |
| $P_3$   | $R_3$ | $R_1$    |

```text
    ┌─────┐         ┌─────┐         ┌─────┐
    │ R1  │         │ R2  │         │ R3  │
    │  •  │         │  •  │         │  •  │
    └──┬──┘         └──┬──┘         └──┬──┘
       │               │               │
       ↓               ↓               ↓
      (P1)───req──→   (P2)───req──→   (P3)
       ↑                                │
       │                                │
       └─────────── request ────────────┘

  Cycle: P1 → R2 → P2 → R3 → P3 → R1 → P1
  Single-instance resources + cycle → DEADLOCK!
```

---

## RAG Example: Cycle WITHOUT Deadlock (Multi-Instance)

This is the subtlest case. A cycle in the RAG does **not** always mean deadlock when resources have multiple instances.

| Process | Holds              | Requests |
| ------- | ------------------ | -------- |
| $P_1$   | $R_1$ (instance 1) | $R_2$    |
| $P_2$   | $R_2$ (instance 1) | $R_1$    |
| $P_3$   | $R_1$ (instance 2) | —        |

Resource $R_1$ has **2 instances**, $R_2$ has **1 instance**.

```text
    ┌─────────┐                ┌─────┐
    │   R1    │                │ R2  │
    │  •  •   │  (2 instances) │  •  │
    └──┬──┬───┘                └──┬──┘
       │  │                       │
       │  │ assigned              │ assigned
       │  ↓                       ↓
       │ (P3)                    (P2)───request──→ R1
       │                                          (wants R1)
       ↓
      (P1)─────request────→ R2
                             (wants R2)

  Cycle exists: P1 → R2 → P2 → R1 → P1
  But P3 holds an instance of R1 and requests NOTHING.
  P3 can finish → releases R1 instance → P2 can get R1 → P2 finishes
  → releases R2 → P1 can get R2 → P1 finishes.
  NO DEADLOCK despite the cycle!
```

---

## The RAG Theorem

The relationship between cycles and deadlocks in a RAG is captured by three key results:

| Condition                                                   | Conclusion                        |
| ----------------------------------------------------------- | --------------------------------- |
| **No cycle** in the RAG                                     | **No deadlock** (always true)     |
| **Cycle** + all resource types have **single instance**     | **Deadlock exists** (guaranteed)  |
| **Cycle** + some resource types have **multiple instances** | **Deadlock may or may not exist** |

> [!IMPORTANT]
> The absence of a cycle is both **necessary and sufficient** for the absence of deadlock. However, the presence of a cycle is **necessary** for deadlock but **sufficient** only when all resources are single-instance.

### Formal Statement

Let $G = (V, E)$ be a Resource Allocation Graph.

1. **If $G$ has no cycle**, then no deadlock exists in the system.
2. **If $G$ has a cycle**:
   - If every resource type in the cycle has **exactly one instance**, then deadlock exists.
   - If some resource type has **multiple instances**, then deadlock _may or may not_ exist. Further analysis (e.g., graph reduction) is needed.

---

## Graph Reduction Algorithm

Graph reduction is a technique to determine if a deadlock exists in a RAG with multi-instance resources. The idea is to simulate what happens when processes can complete.

### Algorithm Steps

1. Find a process $P_i$ whose **all** resource requests can be satisfied by currently available instances.
2. **Reduce** the graph: remove all edges to and from $P_i$ (simulating $P_i$ finishing and releasing its resources).
3. Repeat steps 1-2 until either:
   - All processes are reduced → **No deadlock**
   - No more processes can be reduced but some remain → **Deadlock** (remaining processes are deadlocked)

### Step-by-Step Notation

| Step   | Action                                     | Graph State                 |
| ------ | ------------------------------------------ | --------------------------- |
| Check  | Find process whose requests can be granted | Look at available instances |
| Reduce | Remove all edges of that process           | Resources become available  |
| Repeat | Continue until done or stuck               | Termination check           |

---

## Worked Example 1: Graph Reduction — No Deadlock

**System state:**

| Resource | Total Instances | Currently Allocated | Available |
| -------- | --------------- | ------------------- | --------- |
| $R_1$    | 2               | 2 (P1: 1, P3: 1)    | 0         |
| $R_2$    | 2               | 1 (P2: 1)           | 1         |
| $R_3$    | 1               | 1 (P2: 1)           | 0         |

| Process | Holds                                  | Requests           |
| ------- | -------------------------------------- | ------------------ |
| $P_1$   | $R_1$ (1 instance)                     | $R_2$ (1 instance) |
| $P_2$   | $R_2$ (1 instance), $R_3$ (1 instance) | —                  |
| $P_3$   | $R_1$ (1 instance)                     | $R_3$ (1 instance) |

**Available: $R_1 = 0$, $R_2 = 1$, $R_3 = 0$**

**Step 1:** Check each process:

- $P_1$ needs $R_2$ (1 instance). Available $R_2 = 1$. ✓ **Can be reduced!**
- $P_2$ needs nothing. ✓ **Can also be reduced!**
- $P_3$ needs $R_3$ (1 instance). Available $R_3 = 0$. ✗ Cannot be reduced yet.

**Step 2:** Reduce $P_2$ first (requests nothing, easiest):

- Release $P_2$'s resources: $R_2$ (1) and $R_3$ (1)
- Available: $R_1 = 0$, $R_2 = 2$, $R_3 = 1$

**Step 3:** Now check remaining processes:

- $P_1$ needs $R_2$ (1). Available = 2. ✓
- $P_3$ needs $R_3$ (1). Available = 1. ✓

**Step 4:** Reduce $P_1$: Release $R_1$ (1). Available: $R_1 = 1$, $R_2 = 2$, $R_3 = 1$.

**Step 5:** Reduce $P_3$: Release $R_1$ (1). Available: $R_1 = 2$, $R_2 = 2$, $R_3 = 1$.

**All processes reduced → NO DEADLOCK** ✓

---

## Worked Example 2: Graph Reduction — Deadlock Detected

**System state:**

| Resource | Total Instances | Allocated | Available |
| -------- | --------------- | --------- | --------- |
| $R_1$    | 1               | 1 (P1)    | 0         |
| $R_2$    | 1               | 1 (P2)    | 0         |

| Process | Holds | Requests |
| ------- | ----- | -------- |
| $P_1$   | $R_1$ | $R_2$    |
| $P_2$   | $R_2$ | $R_1$    |

**Available: $R_1 = 0$, $R_2 = 0$**

**Step 1:** Check each process:

- $P_1$ needs $R_2$ (1). Available $R_2 = 0$. ✗
- $P_2$ needs $R_1$ (1). Available $R_1 = 0$. ✗

**No process can be reduced → DEADLOCK DETECTED** involving $\{P_1, P_2\}$

```text
   Graph Reduction Outcome:

   ┌──────────────────────────────────────────────┐
   │  All processes reduced?                       │
   │    YES → No deadlock                          │
   │    NO  → Remaining processes are deadlocked   │
   └──────────────────────────────────────────────┘
```

---

## Worked Example 3: Complex Scenario

**System with 4 processes and 3 resource types:**

| Resource | Instances | Allocation ($P_1$, $P_2$, $P_3$, $P_4$) | Available |
| -------- | --------- | --------------------------------------- | --------- |
| $R_1$    | 3         | (1, 1, 0, 1)                            | 0         |
| $R_2$    | 2         | (0, 1, 1, 0)                            | 0         |
| $R_3$    | 2         | (1, 0, 0, 0)                            | 1         |

| Process | Requests           |
| ------- | ------------------ |
| $P_1$   | $R_2$ (1 instance) |
| $P_2$   | $R_3$ (1 instance) |
| $P_3$   | $R_1$ (1 instance) |
| $P_4$   | $R_2$ (1 instance) |

**Available: (0, 0, 1)**

**Step 1: Can any process be satisfied?**

| Process | Needs     | Available (0, 0, 1) | Can satisfy?      |
| ------- | --------- | ------------------- | ----------------- |
| $P_1$   | (0, 1, 0) | (0, 0, 1)           | No ($R_2$: 0 < 1) |
| $P_2$   | (0, 0, 1) | (0, 0, 1)           | **Yes** ✓         |
| $P_3$   | (1, 0, 0) | (0, 0, 1)           | No ($R_1$: 0 < 1) |
| $P_4$   | (0, 1, 0) | (0, 0, 1)           | No ($R_2$: 0 < 1) |

**Step 2: Reduce $P_2$**, release its resources: (1, 1, 0)

- Available becomes: $(0 + 1, 0 + 1, 1 + 0) = (1, 1, 1)$

**Step 3: Check remaining processes:**

| Process | Needs     | Available (1, 1, 1) | Can satisfy? |
| ------- | --------- | ------------------- | ------------ |
| $P_1$   | (0, 1, 0) | (1, 1, 1)           | **Yes** ✓    |
| $P_3$   | (1, 0, 0) | (1, 1, 1)           | **Yes** ✓    |
| $P_4$   | (0, 1, 0) | (1, 1, 1)           | **Yes** ✓    |

**Step 4:** Reduce $P_1$, $P_3$, $P_4$ (any order works).

**All processes reduced → NO DEADLOCK** ✓

---

## RAG Implementation in Python

```python
def detect_deadlock(processes, allocation, request, available):
    """
    Graph reduction algorithm for deadlock detection.

    Args:
        processes: list of process indices
        allocation: dict {pid: {resource: count}}
        request: dict {pid: {resource: count}}
        available: dict {resource: count}

    Returns:
        (is_deadlocked, deadlocked_processes)
    """
    n = len(processes)
    finished = [False] * n
    work = dict(available)  # copy available resources

    changed = True
    while changed:
        changed = False
        for i in range(n):
            if finished[i]:
                continue
            # Check if all requests can be satisfied
            can_finish = all(
                request[i].get(r, 0) <= work.get(r, 0)
                for r in request[i]
            )
            if can_finish:
                # Simulate process finishing: release resources
                for r, count in allocation[i].items():
                    work[r] = work.get(r, 0) + count
                finished[i] = True
                changed = True
                print(f"  Reduced P{i}: work = {work}")

    deadlocked = [i for i in range(n) if not finished[i]]
    return len(deadlocked) > 0, deadlocked
```

---

## RAG vs Wait-For Graph

For single-instance resources, we can simplify the RAG into a **Wait-For Graph** by removing the resource nodes:

```text
  Resource Allocation Graph:        Wait-For Graph:

     (P1)──→[R1]──→(P2)               (P1)──→(P2)
      ↑              │                  ↑        │
      │              ↓                  │        ↓
     [R2]←──(P3)←──[R3]               (P3)←──(P2)
                                         ↓
                                        (P1)

  Remove resource nodes,            Direct edges show
  connect processes directly         "waits for" relation
```

| Feature            | RAG                      | Wait-For Graph            |
| ------------------ | ------------------------ | ------------------------- |
| Nodes              | Processes + Resources    | Processes only            |
| Use case           | Multi-instance resources | Single-instance resources |
| Deadlock detection | Graph reduction          | Simple cycle detection    |
| Complexity         | Higher                   | Lower                     |

---

## Try It Yourself

**Exercise 1:** Draw the RAG for this system and determine if deadlock exists:

- $R_1$: 1 instance, $R_2$: 2 instances, $R_3$: 1 instance
- $P_1$ holds $R_1$, requests $R_2$
- $P_2$ holds one instance of $R_2$, requests $R_3$
- $P_3$ holds $R_3$, requests $R_1$
- One instance of $R_2$ is free

:::details Solution
Available: $R_1 = 0$, $R_2 = 1$, $R_3 = 0$.

Graph reduction:

- $P_1$ needs $R_2$ (1). Available $R_2 = 1$. ✓ Reduce $P_1$.
- Release $P_1$'s resources: $R_1$ becomes available. Available: $R_1 = 1$, $R_2 = 2$, $R_3 = 0$.
- $P_2$ needs $R_3$ (1). Available $R_3 = 0$. ✗ Cannot reduce yet.
- $P_3$ needs $R_1$ (1). Available $R_1 = 1$. ✓ Reduce $P_3$.
- Release $R_3$. Available: $R_1 = 1$, $R_2 = 2$, $R_3 = 1$.
- $P_2$ needs $R_3$ (1). Available $R_3 = 1$. ✓ Reduce $P_2$.

All processes reduced → **No deadlock**, even though a cycle exists ($P_1 \rightarrow R_2 \rightarrow P_2 \rightarrow R_3 \rightarrow P_3 \rightarrow R_1 \rightarrow P_1$) because $R_2$ has 2 instances.
:::

**Exercise 2:** Can a system with only one process ever be in deadlock? Explain using the RAG.

:::details Solution
No. Deadlock requires a **cycle** in the wait-for relationship. With only one process $P_1$, a cycle would require $P_1 \rightarrow R_j \rightarrow P_1$, meaning $P_1$ holds $R_j$ and also requests it. But a process that already holds a resource instance doesn't request that same instance again (under normal semantics). Therefore, no cycle can form with a single process, and **deadlock is impossible**.

Exception: A process _can_ deadlock on itself if it tries to acquire a **non-recursive mutex** it already holds. This is a programming error — a self-loop in the wait-for graph.
:::

---

## Key Takeaways

- A **Resource Allocation Graph (RAG)** uses circles for processes and rectangles (with dots) for resources, with request edges ($P \rightarrow R$) and assignment edges ($R \rightarrow P$).
- **No cycle in the RAG** guarantees **no deadlock**.
- **Cycle + single-instance resources** guarantees **deadlock**.
- **Cycle + multi-instance resources** means deadlock is **possible but not certain** — use graph reduction to determine.
- **Graph reduction** simulates processes finishing: repeatedly find a process whose requests can be satisfied, release its resources, and repeat. If all processes can be reduced, there is no deadlock.
- For single-instance resources, the RAG can be simplified to a **Wait-For Graph** (processes only, no resource nodes).
- RAGs are a powerful diagnostic tool used in database systems and OS kernels for deadlock detection.
