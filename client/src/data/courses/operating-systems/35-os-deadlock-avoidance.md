---
title: Deadlock Avoidance & Banker's Algorithm
---

# Deadlock Avoidance & Banker's Algorithm

Deadlock prevention constrains resource allocation so rigidly that it often wastes resources. **Deadlock avoidance** takes a smarter approach: before granting each resource request, the OS checks whether the allocation would leave the system in a **safe state**. If granting the request could lead to deadlock, the request is denied (or deferred) — even if the resource is available.

The most famous avoidance algorithm is Dijkstra's **Banker's Algorithm**, which we will study in complete detail.

---

## Safe and Unsafe States

### Definitions

> **Safe state**: A state in which there exists at least one sequence of process completions (a _safe sequence_) that allows every process to finish, even if each process requests its maximum declared resources.

> **Unsafe state**: A state in which no safe sequence exists. Deadlock is **possible** (but not guaranteed).

> **Deadlocked state**: A state in which processes are actually deadlocked — a subset of unsafe states.

### State Space Diagram

```text
  ┌─────────────────────────────────────────┐
  │              ALL STATES                  │
  │  ┌───────────────────────────────────┐  │
  │  │          SAFE STATES              │  │
  │  │                                   │  │
  │  │    Every process CAN finish.      │  │
  │  │    Deadlock impossible.           │  │
  │  │                                   │  │
  │  └───────────────────────────────────┘  │
  │  ┌───────────────────────────────────┐  │
  │  │        UNSAFE STATES              │  │
  │  │  ┌─────────────────────────┐      │  │
  │  │  │    DEADLOCKED STATES    │      │  │
  │  │  │    (subset of unsafe)   │      │  │
  │  │  └─────────────────────────┘      │  │
  │  │    Deadlock is POSSIBLE           │  │
  │  │    but not certain.               │  │
  │  └───────────────────────────────────┘  │
  └─────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Unsafe ≠ Deadlocked.** An unsafe state means that _some_ sequence of future requests could lead to deadlock. But if processes happen to request less than their maximum, deadlock might not occur. Avoidance algorithms are conservative — they avoid all unsafe states, not just deadlocked ones.

### Example: Safe vs Unsafe

Consider a system with **12 tape drives** and three processes:

| Process | Maximum Need | Currently Allocated |
| ------- | ------------ | ------------------- |
| $P_0$   | 10           | 5                   |
| $P_1$   | 4            | 2                   |
| $P_2$   | 9            | 2                   |

**Available = 12 - (5 + 2 + 2) = 3**

Is this a safe state? We need to find a safe sequence.

| Step                 | Available  | Process | Needs (Max - Alloc) | Can Finish?  |
| -------------------- | ---------- | ------- | ------------------- | ------------ |
| 1                    | 3          | $P_1$   | 4 - 2 = 2           | Yes (2 ≤ 3)  |
| After $P_1$ finishes | 3 + 2 = 5  | —       | —                   | —            |
| 2                    | 5          | $P_0$   | 10 - 5 = 5          | Yes (5 ≤ 5)  |
| After $P_0$ finishes | 5 + 5 = 10 | —       | —                   | —            |
| 3                    | 10         | $P_2$   | 9 - 2 = 7           | Yes (7 ≤ 10) |

Safe sequence: $\langle P_1, P_0, P_2 \rangle$ ✓ — **Safe state!**

---

## Avoidance Approach: RAG with Claim Edges (Single Instance)

For resource types with a **single instance**, we extend the Resource Allocation Graph with a new edge type:

| Edge Type       | Notation                           | Meaning                                   |
| --------------- | ---------------------------------- | ----------------------------------------- |
| Request edge    | $P_i \rightarrow R_j$ (solid)      | $P_i$ is currently requesting $R_j$       |
| Assignment edge | $R_j \rightarrow P_i$ (solid)      | $R_j$ is assigned to $P_i$                |
| **Claim edge**  | $P_i \dashrightarrow R_j$ (dashed) | $P_i$ **may** request $R_j$ in the future |

### Algorithm

1. When $P_i$ requests $R_j$: convert claim edge to request edge.
2. Before granting: temporarily convert request edge to assignment edge.
3. Check if the resulting graph has a **cycle**.
   - **No cycle** → safe → grant the request.
   - **Cycle** → unsafe → deny the request (process must wait).

```text
  Before request:            After granting (check for cycle):

  (P1) ···→ [R1] ──→ (P2)   (P1) ←── [R1] ──→ (P2)
                      │                          │
                      ↓                          ↓
                     [R2] ···→ (P1)             [R2] ──→ (P1)
                                                 ↑
                                              CYCLE! → Unsafe
                                              Deny the request.

  ···→  = claim edge (dashed)
  ──→  = assignment/request edge (solid)
```

> [!NOTE]
> This approach works only for single-instance resource types. For multiple instances, we need the Banker's Algorithm.

---

## Banker's Algorithm (Multiple Instances)

The Banker's Algorithm, proposed by Dijkstra (1965) and refined by Habermann (1969), handles resource types with **multiple instances**. It is named after the analogy of a banker who must ensure they can always satisfy the maximum loan requests of all customers.

### Required Information

Each process must declare its **maximum** resource needs before starting. The OS maintains:

| Data Structure     | Type                 | Description                                                                      |
| ------------------ | -------------------- | -------------------------------------------------------------------------------- |
| `Available[m]`     | Vector of length $m$ | Number of available instances of each resource type                              |
| `Max[n][m]`        | $n \times m$ matrix  | Maximum demand of each process for each resource type                            |
| `Allocation[n][m]` | $n \times m$ matrix  | Number of each resource type currently allocated to each process                 |
| `Need[n][m]`       | $n \times m$ matrix  | Remaining need: $\text{Need}[i][j] = \text{Max}[i][j] - \text{Allocation}[i][j]$ |

Where $n$ = number of processes, $m$ = number of resource types.

---

## Safety Algorithm

The Safety Algorithm determines whether the current state is safe by trying to find a safe sequence.

### Pseudocode

```c
// Safety Algorithm
bool is_safe() {
    int Work[m];          // Copy of Available
    bool Finish[n];       // Track completed processes

    // Step 1: Initialize
    for (int j = 0; j < m; j++)
        Work[j] = Available[j];
    for (int i = 0; i < n; i++)
        Finish[i] = false;

    // Step 2: Find a process that can finish
    bool found;
    do {
        found = false;
        for (int i = 0; i < n; i++) {
            if (!Finish[i]) {
                // Check if Need[i] <= Work
                bool can_finish = true;
                for (int j = 0; j < m; j++) {
                    if (Need[i][j] > Work[j]) {
                        can_finish = false;
                        break;
                    }
                }
                if (can_finish) {
                    // Step 3: Simulate process finishing
                    for (int j = 0; j < m; j++)
                        Work[j] += Allocation[i][j];
                    Finish[i] = true;
                    found = true;
                    // Record safe sequence: add P_i
                }
            }
        }
    } while (found);

    // Step 4: Check if all finished
    for (int i = 0; i < n; i++)
        if (!Finish[i]) return false;  // UNSAFE
    return true;  // SAFE
}
```

### Flow Diagram

```text
  ┌──────────────────────┐
  │ Work = Available     │
  │ Finish[i] = false    │
  └──────────┬───────────┘
             │
             ↓
  ┌──────────────────────────────┐
  │ Find i where:                │ ←─────────────────┐
  │   Finish[i] == false         │                    │
  │   Need[i] <= Work            │                    │
  └──────────┬─────────┬─────────┘                    │
             │         │                              │
           Found    Not Found                         │
             │         │                              │
             ↓         ↓                              │
  ┌──────────────┐  ┌─────────────────┐               │
  │Work += Alloc │  │All Finish[i]==T?│               │
  │Finish[i]=true│  │  YES → SAFE     │               │
  └──────┬───────┘  │  NO  → UNSAFE   │               │
         │          └─────────────────┘               │
         └────────────────────────────────────────────┘
```

---

## Resource Request Algorithm

When process $P_i$ makes a request $\text{Request}_i$:

```c
bool request_resources(int i, int Request[]) {
    // Step 1: Validate request
    for (int j = 0; j < m; j++) {
        if (Request[j] > Need[i][j]) {
            error("Process exceeded maximum claim!");
            return false;
        }
    }

    // Step 2: Check availability
    for (int j = 0; j < m; j++) {
        if (Request[j] > Available[j]) {
            // Resources not available — must wait
            return false;  // P_i blocks
        }
    }

    // Step 3: Pretend to allocate (tentatively)
    for (int j = 0; j < m; j++) {
        Available[j]   -= Request[j];
        Allocation[i][j] += Request[j];
        Need[i][j]     -= Request[j];
    }

    // Step 4: Check safety
    if (is_safe()) {
        return true;  // Grant the request
    } else {
        // UNSAFE — rollback the tentative allocation
        for (int j = 0; j < m; j++) {
            Available[j]   += Request[j];
            Allocation[i][j] -= Request[j];
            Need[i][j]     += Request[j];
        }
        return false;  // P_i must wait
    }
}
```

---

## Worked Example: Banker's Algorithm (5 Processes, 3 Resources)

### Initial State

The system has three resource types: $A$ (10 instances), $B$ (5 instances), $C$ (7 instances).

**Allocation and Maximum matrices:**

| Process | Allocation (A B C) | Max (A B C) | Need (A B C) |
| ------- | ------------------ | ----------- | ------------ |
| $P_0$   | 0 1 0              | 7 5 3       | 7 4 3        |
| $P_1$   | 2 0 0              | 3 2 2       | 1 2 2        |
| $P_2$   | 3 0 2              | 9 0 2       | 6 0 0        |
| $P_3$   | 2 1 1              | 2 2 2       | 0 1 1        |
| $P_4$   | 0 0 2              | 4 3 3       | 4 3 1        |

**Total allocated**: $(0+2+3+2+0, 1+0+0+1+0, 0+0+2+1+2) = (7, 2, 5)$

**Available = Total - Allocated = $(10-7, 5-2, 7-5) = (3, 3, 2)$**

### Step-by-Step Safety Check

We run the Safety Algorithm with $\text{Work} = (3, 3, 2)$ and all $\text{Finish}[i] = \text{false}$.

**Iteration 1:** Find process where $\text{Need}[i] \leq \text{Work}$:

| Process | Need    | Work = (3,3,2) | Need ≤ Work? |
| ------- | ------- | -------------- | ------------ |
| $P_0$   | (7,4,3) | (3,3,2)        | No (7>3)     |
| $P_1$   | (1,2,2) | (3,3,2)        | **Yes** ✓    |

Select $P_1$: $\text{Work} = (3,3,2) + (2,0,0) = (5,3,2)$. Mark $\text{Finish}[1] = \text{true}$.

**Iteration 2:**

| Process | Need    | Work = (5,3,2) | Need ≤ Work? |
| ------- | ------- | -------------- | ------------ |
| $P_0$   | (7,4,3) | (5,3,2)        | No (7>5)     |
| $P_2$   | (6,0,0) | (5,3,2)        | No (6>5)     |
| $P_3$   | (0,1,1) | (5,3,2)        | **Yes** ✓    |

Select $P_3$: $\text{Work} = (5,3,2) + (2,1,1) = (7,4,3)$. Mark $\text{Finish}[3] = \text{true}$.

**Iteration 3:**

| Process | Need    | Work = (7,4,3) | Need ≤ Work? |
| ------- | ------- | -------------- | ------------ |
| $P_0$   | (7,4,3) | (7,4,3)        | **Yes** ✓    |

Select $P_0$: $\text{Work} = (7,4,3) + (0,1,0) = (7,5,3)$. Mark $\text{Finish}[0] = \text{true}$.

**Iteration 4:**

| Process | Need    | Work = (7,5,3) | Need ≤ Work? |
| ------- | ------- | -------------- | ------------ |
| $P_2$   | (6,0,0) | (7,5,3)        | **Yes** ✓    |

Select $P_2$: $\text{Work} = (7,5,3) + (3,0,2) = (10,5,5)$. Mark $\text{Finish}[2] = \text{true}$.

**Iteration 5:**

| Process | Need    | Work = (10,5,5) | Need ≤ Work? |
| ------- | ------- | --------------- | ------------ |
| $P_4$   | (4,3,1) | (10,5,5)        | **Yes** ✓    |

Select $P_4$: $\text{Work} = (10,5,5) + (0,0,2) = (10,5,7)$. Mark $\text{Finish}[4] = \text{true}$.

**All processes finished!** Safe sequence: $\langle P_1, P_3, P_0, P_2, P_4 \rangle$ ✓

### Summary Table

| Step | Process Selected | Work Before | Work After | Finish                      |
| ---- | ---------------- | ----------- | ---------- | --------------------------- |
| 1    | $P_1$            | (3,3,2)     | (5,3,2)    | {$P_1$}                     |
| 2    | $P_3$            | (5,3,2)     | (7,4,3)    | {$P_1, P_3$}                |
| 3    | $P_0$            | (7,4,3)     | (7,5,3)    | {$P_1, P_3, P_0$}           |
| 4    | $P_2$            | (7,5,3)     | (10,5,5)   | {$P_1, P_3, P_0, P_2$}      |
| 5    | $P_4$            | (10,5,5)    | (10,5,7)   | {$P_1, P_3, P_0, P_2, P_4$} |

---

## Worked Example 2: Request That Leads to Unsafe State

Now suppose $P_4$ requests $(3, 3, 0)$.

**Step 1:** Check $\text{Request}_4 \leq \text{Need}_4$: $(3,3,0) \leq (4,3,1)$? Yes ✓

**Step 2:** Check $\text{Request}_4 \leq \text{Available}$: $(3,3,0) \leq (3,3,2)$? Yes ✓

**Step 3:** Tentatively allocate:

|                   | Before  | After Tentative |
| ----------------- | ------- | --------------- |
| Available         | (3,3,2) | (0,0,2)         |
| Allocation[$P_4$] | (0,0,2) | (3,3,2)         |
| Need[$P_4$]       | (4,3,1) | (1,0,1)         |

**Step 4:** Run Safety Algorithm with Work = (0,0,2):

| Process | Need    | Work = (0,0,2) | Need ≤ Work? |
| ------- | ------- | -------------- | ------------ |
| $P_0$   | (7,4,3) | (0,0,2)        | No           |
| $P_1$   | (1,2,2) | (0,0,2)        | No (1>0)     |
| $P_2$   | (6,0,0) | (0,0,2)        | No (6>0)     |
| $P_3$   | (0,1,1) | (0,0,2)        | No (1>0)     |
| $P_4$   | (1,0,1) | (0,0,2)        | No (1>0)     |

**No process can finish!** → **UNSAFE STATE**

**Decision:** Deny $P_4$'s request. Rollback the tentative allocation. $P_4$ must wait.

> [!WARNING]
> Even though the resources $(3,3,0)$ are physically available, granting the request would leave the system in an unsafe state where deadlock is possible. The Banker's Algorithm correctly denies this request.

---

## Time Complexity Analysis

The Banker's Algorithm has the following complexity:

| Component                  | Complexity                                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Safety Algorithm           | $O(m \times n^2)$ — outer loop runs at most $n$ times, inner loop checks $n$ processes, each comparison is $O(m)$ |
| Resource Request Algorithm | $O(m \times n^2)$ — dominated by the safety check                                                                 |

Where $n$ = number of processes, $m$ = number of resource types.

$$T_{\text{safety}} = O(m \times n^2)$$

For each resource request, the OS must run this check. With frequent requests, this overhead can be significant.

---

## Banker's Algorithm in Python

```python
def bankers_algorithm(n, m, available, max_matrix, allocation):
    """
    Full Banker's Algorithm implementation.
    n: number of processes, m: number of resource types
    """
    # Calculate Need matrix
    need = [[max_matrix[i][j] - allocation[i][j]
             for j in range(m)] for i in range(n)]

    # Safety Algorithm
    work = list(available)
    finish = [False] * n
    safe_sequence = []

    for _ in range(n):  # At most n iterations
        found = False
        for i in range(n):
            if not finish[i]:
                if all(need[i][j] <= work[j] for j in range(m)):
                    # Process i can finish
                    for j in range(m):
                        work[j] += allocation[i][j]
                    finish[i] = True
                    safe_sequence.append(f"P{i}")
                    found = True
                    break
        if not found:
            break

    if all(finish):
        print(f"SAFE! Sequence: {' → '.join(safe_sequence)}")
        return True
    else:
        deadlocked = [f"P{i}" for i in range(n) if not finish[i]]
        print(f"UNSAFE! Cannot complete: {deadlocked}")
        return False

# Example from Worked Example 1
available = [3, 3, 2]
max_matrix = [[7,5,3], [3,2,2], [9,0,2], [2,2,2], [4,3,3]]
allocation = [[0,1,0], [2,0,0], [3,0,2], [2,1,1], [0,0,2]]

bankers_algorithm(5, 3, available, max_matrix, allocation)
# Output: SAFE! Sequence: P1 → P3 → P0 → P2 → P4
```

---

## Limitations of the Banker's Algorithm

| Limitation                       | Explanation                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------- |
| **Requires advance declaration** | Processes must declare maximum needs before starting — often unrealistic        |
| **Fixed number of processes**    | Assumes the number of processes is fixed and known                              |
| **Fixed number of resources**    | Resources cannot be added or removed dynamically                                |
| **Overhead**                     | $O(m \times n^2)$ per request — significant for large systems                   |
| **Conservative**                 | Denies requests that might be safe in practice (unsafe ≠ deadlocked)            |
| **No distributed support**       | Works only for single-machine systems                                           |
| **Rarely used in practice**      | General-purpose OSes (Linux, Windows) don't use it due to the above limitations |

> [!NOTE]
> Despite its limitations, the Banker's Algorithm is widely studied because it provides the **theoretical foundation** for understanding safe states and avoidance. It is used in some specialized systems (e.g., certain database transaction managers).

---

## Prevention vs Avoidance Comparison

| Aspect                    | Prevention                                   | Avoidance                                        |
| ------------------------- | -------------------------------------------- | ------------------------------------------------ |
| **Strategy**              | Structurally eliminate one Coffman condition | Dynamically check safety before each allocation  |
| **Information needed**    | Resource ordering or protocol                | Maximum resource needs declared upfront          |
| **When decision is made** | System design time                           | Runtime (per request)                            |
| **Resource utilization**  | Lower (overly conservative)                  | Higher (more flexible)                           |
| **Overhead**              | Low (static rules)                           | Higher (safety check per request)                |
| **Guarantees**            | Deadlock impossible                          | Deadlock impossible (if max claims are accurate) |

---

## Try It Yourself

**Exercise 1:** Given 3 processes and 2 resource types with total $(5, 5)$:

| Process | Allocation | Max    |
| ------- | ---------- | ------ |
| $P_0$   | (1, 0)     | (3, 2) |
| $P_1$   | (2, 1)     | (3, 3) |
| $P_2$   | (1, 1)     | (2, 1) |

Is the system in a safe state? Find the safe sequence.

:::details Solution
**Available = (5-4, 5-2) = (1, 3)**. Need: $P_0$=(2,2), $P_1$=(1,2), $P_2$=(1,0).

- Work=(1,3): $P_1$ needs (1,2)≤(1,3)? Yes. Work=(1+2,3+1)=(3,4). ✓
- Work=(3,4): $P_0$ needs (2,2)≤(3,4)? Yes. Work=(3+1,4+0)=(4,4). ✓
- Work=(4,4): $P_2$ needs (1,0)≤(4,4)? Yes. Work=(5,5). ✓

Safe sequence: $\langle P_1, P_0, P_2 \rangle$. **SAFE** ✓
:::

**Exercise 2:** In the worked example (5 processes, 3 resources), can $P_1$ request $(1, 0, 2)$?

:::details Solution
Check: Request=(1,0,2) ≤ Need[$P_1$]=(1,2,2)? Yes ✓
Check: Request=(1,0,2) ≤ Available=(3,3,2)? Yes ✓

Tentatively allocate:

- Available = (3-1, 3-0, 2-2) = (2, 3, 0)
- Allocation[$P_1$] = (2+1, 0+0, 0+2) = (3, 0, 2)
- Need[$P_1$] = (1-1, 2-0, 2-2) = (0, 2, 0)

Safety check with Work=(2,3,0):

- $P_1$: Need=(0,2,0)≤(2,3,0)? Yes. Work=(2+3,3+0,0+2)=(5,3,2). ✓
- $P_3$: Need=(0,1,1)≤(5,3,2)? Yes. Work=(7,4,3). ✓
- $P_0$: Need=(7,4,3)≤(7,4,3)? Yes. Work=(7,5,3). ✓
- $P_2$: Need=(6,0,0)≤(7,5,3)? Yes. Work=(10,5,5). ✓
- $P_4$: Need=(4,3,1)≤(10,5,5)? Yes. Work=(10,5,7). ✓

Safe sequence exists. **Request GRANTED.** ✓
:::

---

## Key Takeaways

- **Safe state** = a sequence exists where all processes can finish; **unsafe state** ≠ deadlock, but deadlock is possible.
- Deadlock avoidance maintains the system in a **safe state** at all times.
- For **single-instance** resources, extend the RAG with **claim edges** and check for cycles.
- For **multi-instance** resources, use the **Banker's Algorithm** with four data structures: `Available`, `Max`, `Allocation`, `Need`.
- The **Safety Algorithm** simulates process completions to find a safe sequence — complexity $O(m \times n^2)$.
- The **Resource Request Algorithm** tentatively allocates, checks safety, and grants or denies.
- The Banker's Algorithm requires **advance declaration of maximum needs** — its biggest practical limitation.
- Despite being rarely used in modern general-purpose OSes, the Banker's Algorithm provides the theoretical foundation for understanding avoidance.
