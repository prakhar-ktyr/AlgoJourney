---
title: "Vector Clocks"
---

## Vector Clocks

In the previous lesson, we learned about **Lamport clocks** — a simple logical clock that assigns a single integer timestamp to every event. While Lamport clocks give us a consistent total ordering, they have a critical limitation: they **cannot detect concurrency**.

Vector clocks solve this problem by giving every process its own counter, creating a vector of timestamps that captures the full causal history of an event.

---

### Limitations of Lamport Clocks

Recall the Lamport clock rule: if event $a$ causally precedes event $b$ (written $a \to b$), then $L(a) < L(b)$.

But the **converse is not true**. If $L(a) < L(b)$, we **cannot** conclude that $a \to b$. The events might be concurrent.

| Lamport Clock Property | Guaranteed? |
|---|---|
| $a \to b \implies L(a) < L(b)$ | Yes |
| $L(a) < L(b) \implies a \to b$ | **No** |
| Can detect if two events are concurrent | **No** |

**Example:**

Consider three processes where $P_1$ sends a message to $P_3$, and $P_2$ performs a local event independently:

```
P1: [1] ---msg---> P3: [2]
P2: [1]  (independent local event)
```

Both $P_2$'s event and $P_1$'s event have Lamport timestamp 1. Are they concurrent? We know they are (no causal link), but Lamport clocks alone can't tell us — two events with the same timestamp might be concurrent or might be causally related through a chain we lost track of.

This inability to distinguish "concurrent" from "causally ordered" is the fundamental gap that vector clocks fill.

---

### Vector Clocks: The Concept

A **vector clock** is a vector (array) of $N$ integers, one per process in the system. Each process $P_i$ maintains its own vector clock $VC_i$, where:

$$VC_i = [c_1, c_2, \ldots, c_N]$$

The $j$-th entry $VC_i[j]$ represents process $P_i$'s **knowledge** of process $P_j$'s logical time — the latest event count from $P_j$ that $P_i$ is aware of.

**Key insight:** A vector clock doesn't just track "what time is it?" — it tracks "what do I know about everyone else's progress?"

---

### Vector Clock Rules

Three rules govern how vector clocks are updated:

#### Rule 1: Local Event

When process $P_i$ executes a local event, increment its own entry:

$$VC_i[i] \leftarrow VC_i[i] + 1$$

#### Rule 2: Send Message

When process $P_i$ sends a message:

1. Increment its own entry: $VC_i[i] \leftarrow VC_i[i] + 1$
2. Attach the entire vector $VC_i$ to the message

#### Rule 3: Receive Message

When process $P_i$ receives a message with attached vector $VC_{msg}$:

1. Merge: $VC_i[j] \leftarrow \max(VC_i[j], VC_{msg}[j])$ for all $j$
2. Increment own entry: $VC_i[i] \leftarrow VC_i[i] + 1$

| Step | Action | Update Rule |
|---|---|---|
| Local event | Increment self | $VC_i[i] + 1$ |
| Send | Increment self, attach VC | $VC_i[i] + 1$, piggyback $VC_i$ |
| Receive | Merge (element-wise max), then increment self | $\max$ then $VC_i[i] + 1$ |

---

### Comparing Vector Timestamps

Given two vector timestamps $V$ and $W$ of length $N$:

**Equal:**

$$V = W \iff V[i] = W[i] \text{ for all } i$$

**Less than or equal:**

$$V \leq W \iff V[i] \leq W[i] \text{ for all } i$$

**Strictly less than (causally before):**

$$V < W \iff V \leq W \text{ and } V \neq W$$

**Concurrent:**

$$V \| W \iff \neg(V \leq W) \text{ and } \neg(W \leq V)$$

Two events are concurrent when neither vector dominates the other — each has at least one entry that is strictly greater.

**Example:**

```
V = [2, 3, 1]
W = [3, 2, 1]

V ≤ W?  V[0]=2 ≤ W[0]=3 ✓, V[1]=3 ≤ W[1]=2 ✗  → No
W ≤ V?  W[0]=3 ≤ V[0]=2 ✗                       → No

Result: V ∥ W  (concurrent)
```

```
V = [1, 2, 0]
W = [1, 3, 1]

V ≤ W?  1≤1 ✓, 2≤3 ✓, 0≤1 ✓  → Yes
V = W?  No (entries differ)

Result: V < W  (V causally precedes W)
```

---

### Practical Example with 3 Processes

Let's trace a complete scenario with processes $P_0$, $P_1$, and $P_2$:

```
Time →

P0: [1,0,0] --send→ [2,0,0] --------recv----→ [3,2,2]
                        |                          ↑
                        ↓                          |
P1:         [0,1,0] --recv→ [2,2,0] --send→ [2,3,0]
                                |
                                ↓
P2:                   [0,0,1]--recv→ [2,2,2] --send→ [2,2,3]
```

**Step-by-step breakdown:**

| Step | Process | Event | Vector Clock | Explanation |
|---|---|---|---|---|
| 1 | $P_0$ | Local event | $[1,0,0]$ | $P_0$ increments its own entry |
| 2 | $P_0$ | Send to $P_1$ | $[2,0,0]$ | Increment, attach $[2,0,0]$ |
| 3 | $P_1$ | Local event | $[0,1,0]$ | $P_1$ increments its own entry |
| 4 | $P_1$ | Recv from $P_0$ | $[2,2,0]$ | $\max([0,1,0],[2,0,0]) = [2,1,0]$, then $P_1$++ → $[2,2,0]$ |
| 5 | $P_2$ | Local event | $[0,0,1]$ | $P_2$ increments its own entry |
| 6 | $P_1$ | Send to $P_2$ | $[2,3,0]$ | Increment $P_1$'s entry |
| 7 | $P_2$ | Recv from $P_1$ | $[2,2,2]$ | $\max([0,0,1],[2,3,0]) = [2,3,1]$, then $P_2$++ → $[2,3,2]$ |

Wait — let me re-trace step 7 more carefully:

$P_2$ has $[0,0,1]$, receives message with $[2,3,0]$:
- $\max(0,2) = 2$, $\max(0,3) = 3$, $\max(1,0) = 1$ → merged = $[2,3,1]$
- Increment $P_2$'s entry: $[2,3,2]$

Now let's check relationships:

- $P_0$'s event at $[1,0,0]$ vs $P_2$'s event at $[0,0,1]$: $1 > 0$ but $0 < 1$ → **concurrent** ✓
- $P_0$'s send at $[2,0,0]$ vs $P_2$'s recv at $[2,3,2]$: $[2,0,0] \leq [2,3,2]$ → **causal** ✓

---

### Detecting Causal Relationships and Concurrent Events

The power of vector clocks comes from this **bi-conditional** property:

$$a \to b \iff VC(a) < VC(b)$$

This means:
- If $VC(a) < VC(b)$, then $a$ **definitely** happened before $b$
- If $VC(a) \| VC(b)$, then $a$ and $b$ are **definitely** concurrent

This is strictly stronger than what Lamport clocks provide.

**Algorithm for detecting the relationship between two events:**

```
function compare(V, W):
    less = false
    greater = false
    
    for i in 0..N-1:
        if V[i] < W[i]:
            less = true
        if V[i] > W[i]:
            greater = true
    
    if less and not greater:
        return BEFORE       # V < W (V happened before W)
    if greater and not less:
        return AFTER        # V > W (V happened after W)
    if not less and not greater:
        return EQUAL        # V = W (same event)
    return CONCURRENT       # V ∥ W
```

---

### Python Implementation

Here is a complete, working implementation of vector clocks:

```python
class VectorClock:
    """A vector clock for a process in a distributed system."""

    def __init__(self, process_id, num_processes):
        self.pid = process_id
        self.clock = [0] * num_processes

    def local_event(self):
        """Record a local event."""
        self.clock[self.pid] += 1
        return self.copy()

    def send(self):
        """Prepare to send a message. Returns the timestamp to attach."""
        self.clock[self.pid] += 1
        return self.copy()

    def receive(self, msg_clock):
        """Process a received message with its attached vector clock."""
        for i in range(len(self.clock)):
            self.clock[i] = max(self.clock[i], msg_clock[i])
        self.clock[self.pid] += 1
        return self.copy()

    def copy(self):
        return list(self.clock)

    def __repr__(self):
        return f"P{self.pid}{self.clock}"


def compare(v, w):
    """Compare two vector timestamps.
    
    Returns:
        'BEFORE'     if v < w
        'AFTER'      if v > w
        'EQUAL'      if v == w
        'CONCURRENT' if v || w
    """
    less = any(vi < wi for vi, wi in zip(v, w))
    greater = any(vi > wi for vi, wi in zip(v, w))

    if less and not greater:
        return "BEFORE"
    if greater and not less:
        return "AFTER"
    if not less and not greater:
        return "EQUAL"
    return "CONCURRENT"


# --- Demonstration with 3 processes ---
if __name__ == "__main__":
    p0 = VectorClock(0, 3)
    p1 = VectorClock(1, 3)
    p2 = VectorClock(2, 3)

    # P0 does a local event
    e1 = p0.local_event()
    print(f"P0 local:    {e1}")           # [1, 0, 0]

    # P0 sends to P1
    msg1 = p0.send()
    print(f"P0 send:     {msg1}")         # [2, 0, 0]

    # P1 does a local event
    e2 = p1.local_event()
    print(f"P1 local:    {e2}")           # [0, 1, 0]

    # P1 receives from P0
    e3 = p1.receive(msg1)
    print(f"P1 recv:     {e3}")           # [2, 2, 0]

    # P2 does a local event (concurrent with P0 and P1)
    e4 = p2.local_event()
    print(f"P2 local:    {e4}")           # [0, 0, 1]

    # P1 sends to P2
    msg2 = p1.send()
    print(f"P1 send:     {msg2}")         # [2, 3, 0]

    # P2 receives from P1
    e5 = p2.receive(msg2)
    print(f"P2 recv:     {e5}")           # [2, 3, 2]

    # Compare events
    print(f"\ne1 vs e4: {compare(e1, e4)}")   # CONCURRENT
    print(f"e1 vs e3: {compare(e1, e3)}")     # BEFORE
    print(f"e4 vs e5: {compare(e4, e5)}")     # BEFORE
    print(f"e1 vs e5: {compare(e1, e5)}")     # BEFORE
    print(f"e4 vs e3: {compare(e4, e3)}")     # CONCURRENT
```

**Output:**

```
P0 local:    [1, 0, 0]
P0 send:     [2, 0, 0]
P1 local:    [0, 1, 0]
P1 recv:     [2, 2, 0]
P2 local:    [0, 0, 1]
P1 send:     [2, 3, 0]
P2 recv:     [2, 3, 2]

e1 vs e4: CONCURRENT
e1 vs e3: BEFORE
e4 vs e5: BEFORE
e1 vs e5: BEFORE
e4 vs e3: CONCURRENT
```

---

### Vector Clocks in Practice: Amazon Dynamo

Amazon's **Dynamo** key-value store (the paper behind DynamoDB's original design) used vector clocks to detect conflicting writes across replicas.

**How Dynamo uses vector clocks:**

1. Each write to a key carries a vector clock
2. When a client reads, it receives all versions with their vector clocks
3. If one version's VC dominates another, the dominated version is discarded (causal supersession)
4. If two versions are **concurrent** (neither dominates), both are returned to the client for **application-level conflict resolution**

**Example — Shopping cart conflict:**

```
Client A reads item:  VC = [A:1]
Client B reads item:  VC = [A:1]

Client A writes:      VC = [A:2]     (adds "milk")
Client B writes:      VC = [A:1,B:1] (adds "eggs")

These are concurrent! Dynamo keeps both versions.

Next read returns both → application merges:
  cart = {"milk", "eggs"}, VC = [A:2, B:1]
```

| Scenario | Vector Clock Comparison | Dynamo Action |
|---|---|---|
| New write causally after old | $VC_{new} > VC_{old}$ | Replace old with new |
| Two writes concurrent | $VC_1 \| VC_2$ | Keep both (sibling versions) |
| Client reconciles siblings | Merged VC | Single version restored |

> **Note:** Later versions of DynamoDB moved away from vector clocks to a "last writer wins" strategy for simplicity, using physical timestamps. The tradeoff is losing the ability to detect all conflicts.

---

### Dotted Version Vectors

Standard vector clocks in Dynamo had a problem: the vector grows with each **coordinating node**, not each client. Over time, vectors can accumulate stale entries.

**Dotted Version Vectors (DVVs)** improve on this by separating the "dot" (the latest event by a specific actor) from the "causal context" (everything that happened before):

$$DVV = (\text{dot}, \text{causal context})$$

Where:
- **dot** = $(actor, counter)$ — identifies the specific write event
- **causal context** = a version vector of everything the write "knew about"

This representation allows:
- More accurate concurrency detection
- Efficient pruning of old entries
- Correct behavior even when the coordinating node changes between writes

**DVVs are used in Riak** (a distributed database) and fix several edge cases where plain vector clocks produce false conflicts.

```
Standard VC might say:    A∥B  (false conflict)
DVV correctly identifies: A→B  (B supersedes A)
```

---

### Space Complexity Concerns

The primary cost of vector clocks is space. For $N$ processes:

$$\text{Space per event} = O(N)$$
$$\text{Message overhead} = O(N)$$

| System Size | Vector Size | Concern Level |
|---|---|---|
| 3–10 nodes | 3–10 integers | Negligible |
| 100 nodes | 100 integers | Manageable |
| 10,000+ nodes | 10,000+ integers | Problematic |
| Per-client tracking | Unbounded | Serious issue |

In large-scale systems, this $O(N)$ per-message overhead becomes a real bottleneck. Several strategies address this:

**1. Truncation / Pruning**

Drop entries older than a threshold. Risk: may falsely detect concurrency.

**2. Hierarchical Clocks**

Organize processes in a tree; only exchange clocks with neighbors.

**3. Plausible Clocks**

Use a fixed-size vector (e.g., $k = 8$) and hash process IDs to entries. Trades accuracy for bounded space.

**4. Interval Tree Clocks** (see next section).

---

### Optimization: Interval Tree Clocks

**Interval Tree Clocks (ITCs)**, proposed by Almeida, Baquero, and Fonte (2008), solve the space problem elegantly.

Instead of assigning each process a fixed slot in the vector, ITCs use an **identity** and **event** pair:

$$ITC = (id, event)$$

The identity space is the interval $[0, 1)$, which can be recursively split (like a binary tree):

```
Initial:  [0, 1)     ← single process owns entire interval

Fork:     [0, 0.5)   and   [0.5, 1)    ← two processes

Fork again: [0, 0.25) and [0.25, 0.5)  ← three processes
```

**Key advantages over vector clocks:**

| Property | Vector Clocks | Interval Tree Clocks |
|---|---|---|
| Size grows with | Number of processes ever seen | Number of **active** processes |
| Dynamic join/leave | Requires new slot | Naturally handled via fork/join |
| Garbage collection | Manual pruning needed | Automatic via join operation |

**Operations:**

- **Fork**: split identity in half → create new participant
- **Join**: merge two identities → retire a participant
- **Event**: increment the event component
- **Compare**: check causal ordering (same semantics as vector clocks)

ITCs are particularly useful in systems where processes dynamically join and leave (e.g., mobile devices, IoT networks).

---

### Conflict Detection with Vector Clocks

A primary use case for vector clocks is **conflict detection** in replicated data stores. Here's a practical algorithm:

```python
def detect_conflicts(versions):
    """Given a list of (value, vector_clock) pairs,
    return the set of conflicting versions."""
    
    surviving = []

    for value, vc in versions:
        dominated = False
        to_remove = []

        for i, (sv, svc) in enumerate(surviving):
            rel = compare(vc, svc)
            if rel == "BEFORE":
                # New version is older → discard it
                dominated = True
                break
            elif rel == "AFTER":
                # New version supersedes → mark old for removal
                to_remove.append(i)
            # CONCURRENT → keep both

        if not dominated:
            # Remove dominated versions (iterate in reverse)
            for i in reversed(to_remove):
                surviving.pop(i)
            surviving.append((value, vc))

    return surviving


# Example: replicated shopping cart
versions = [
    ("cart: [milk]",   [2, 0, 0]),
    ("cart: [eggs]",   [1, 1, 0]),
    ("cart: [bread]",  [1, 0, 1]),
    ("cart: [milk, butter]", [3, 0, 0]),
]

conflicts = detect_conflicts(versions)
print("Surviving versions:")
for val, vc in conflicts:
    print(f"  {vc} → {val}")
```

**Output:**

```
Surviving versions:
  [1, 1, 0] → cart: [eggs]
  [1, 0, 1] → cart: [bread]
  [3, 0, 0] → cart: [milk, butter]
```

Three concurrent versions survive — [milk, butter] superseded the older [milk], but [eggs] and [bread] are concurrent with it and must be reconciled by the application.

---

### Summary

| Concept | Description |
|---|---|
| **Lamport clock limitation** | Can't distinguish concurrent from causally ordered events |
| **Vector clock** | Array of $N$ counters — one per process |
| **Update rules** | Local: inc self; Send: inc + attach; Receive: merge + inc |
| **Comparison** | Element-wise: $<$ = causal, incomparable = concurrent |
| **Key property** | $a \to b \iff VC(a) < VC(b)$ (bi-conditional) |
| **Dynamo** | Used VCs for conflict detection across replicas |
| **Dotted Version Vectors** | Fix false conflicts in coordinator-based systems |
| **Space cost** | $O(N)$ per message — problematic at scale |
| **Interval Tree Clocks** | Dynamic, compact alternative for join/leave-heavy systems |

---

### Exercises

**Exercise 1: Trace the Clocks**

Three processes execute the following events in order:

1. $P_0$: local event
2. $P_1$: local event
3. $P_0$: send message to $P_2$
4. $P_2$: receive message from $P_0$
5. $P_2$: send message to $P_1$
6. $P_1$: receive message from $P_2$
7. $P_1$: local event

Compute the vector clock after each event. Then determine whether step 2 and step 4 are concurrent or causally related.

<details>
<summary>Solution</summary>

| Step | Process | Event | Vector Clock |
|---|---|---|---|
| 1 | $P_0$ | local | $[1, 0, 0]$ |
| 2 | $P_1$ | local | $[0, 1, 0]$ |
| 3 | $P_0$ | send → $P_2$ | $[2, 0, 0]$ |
| 4 | $P_2$ | recv ← $P_0$ | $[2, 0, 1]$ |
| 5 | $P_2$ | send → $P_1$ | $[2, 0, 2]$ |
| 6 | $P_1$ | recv ← $P_2$ | $[2, 2, 2]$ |
| 7 | $P_1$ | local | $[2, 3, 2]$ |

Step 2: $[0, 1, 0]$, Step 4: $[2, 0, 1]$.

$[0, 1, 0] \leq [2, 0, 1]$? → $0 \leq 2$ ✓, $1 \leq 0$ ✗ → No.
$[2, 0, 1] \leq [0, 1, 0]$? → $2 \leq 0$ ✗ → No.

They are **concurrent**. ✓

</details>

---

**Exercise 2: Implement Merge**

Write a function that takes a list of vector timestamps and returns the **least upper bound** (element-wise maximum) — representing "everything that happened in any of these timelines":

$$LUB(V_1, V_2, \ldots, V_k)[i] = \max(V_1[i], V_2[i], \ldots, V_k[i])$$

<details>
<summary>Solution</summary>

```python
def least_upper_bound(timestamps):
    """Compute the element-wise max of multiple vector timestamps."""
    if not timestamps:
        return []
    n = len(timestamps[0])
    return [max(ts[i] for ts in timestamps) for i in range(n)]


# Test
t1 = [2, 0, 1]
t2 = [0, 3, 0]
t3 = [1, 1, 2]
print(least_upper_bound([t1, t2, t3]))  # [2, 3, 2]
```

</details>

---

**Exercise 3: Conflict Resolution**

A distributed key-value store has three replicas. The following writes arrive:

- Replica A: `value="X"`, `VC=[3, 1, 1]`
- Replica B: `value="Y"`, `VC=[2, 2, 1]`
- Replica C: `value="Z"`, `VC=[3, 2, 2]`

1. Which writes are concurrent? Which are causally ordered?
2. Which versions should the system keep?
3. If a client reads and reconciles all surviving versions into value `"XYZ"`, what should the new vector clock be?

<details>
<summary>Solution</summary>

**1. Comparisons:**

- A vs B: $[3,1,1]$ vs $[2,2,1]$ → $3>2$ but $1<2$ → **concurrent**
- A vs C: $[3,1,1]$ vs $[3,2,2]$ → $3=3$, $1<2$, $1<2$ → $A < C$ → **A causally before C**
- B vs C: $[2,2,1]$ vs $[3,2,2]$ → $2<3$, $2=2$, $1<2$ → $B < C$ → **B causally before C**

**2. Surviving versions:**

C ($[3,2,2]$) dominates both A and B. Only **"Z"** survives. No conflict!

**3.** Since only one version survives, the reconciled value is simply "Z" with $VC = [3,2,2]$. The client would increment its own coordinator's entry on the next write.

</details>

---

**Exercise 4: Space Analysis**

A microservices system has 500 services, each exchanging messages. Each message carries a vector clock.

1. How many integers are in each vector clock?
2. If each integer is 4 bytes, what is the overhead per message?
3. Propose two strategies to reduce this overhead.

<details>
<summary>Solution</summary>

1. 500 integers per vector clock
2. $500 \times 4 = 2000$ bytes = ~2 KB per message
3. Strategies:
   - **Interval Tree Clocks**: only track active participants, identity space dynamically splits/merges
   - **Sparse representation**: only transmit non-zero entries as `(index, value)` pairs — if most entries are 0, this drastically reduces size
   - **Hierarchical clocks**: group services into clusters, use two-level vector clocks (inter-cluster + intra-cluster)

</details>
