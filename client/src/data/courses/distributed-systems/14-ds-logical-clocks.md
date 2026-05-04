---
title: "Logical Clocks"
---

# Logical Clocks

In distributed systems, events happen across multiple machines with no shared memory or global clock. **Logical clocks** provide a mechanism to order events without relying on synchronized physical clocks.

This lesson covers Lamport clocks — the foundational logical clock algorithm — their properties, limitations, and practical applications.

---

## Why Physical Clocks Aren't Enough

In a single-machine program, you can timestamp every event with the local clock and sort events by time. In a distributed system, this breaks down for several reasons:

| Problem | Description |
|---|---|
| **Clock drift** | Each machine's hardware clock runs at a slightly different rate |
| **Clock skew** | At any instant, two machines' clocks may show different times |
| **No instant synchronization** | Network messages take variable time, so clocks can't be perfectly synced |
| **Relativity** | There is no single "true" global time across distant machines |

### Example: The Ordering Problem

Consider two servers, $A$ and $B$:

1. Server $A$ writes `x = 5` at its local time $t_A = 100$
2. Server $B$ reads `x` at its local time $t_B = 99$

If $B$'s clock is slightly behind $A$'s, we might conclude that the read happened *before* the write — even if it actually happened *after*. This can lead to:

- **Stale reads** being treated as fresh
- **Causal violations** where an effect appears before its cause
- **Inconsistent replicas** across the system

Physical clock synchronization protocols (like NTP) reduce skew to milliseconds, but they can never eliminate it entirely. For many distributed algorithms, we need **certainty** about event ordering, not approximations.

> **Key insight:** We don't always need to know *when* something happened. We need to know *in what order* things happened relative to each other.

---

## The Happens-Before Relation

Leslie Lamport introduced the **happens-before** relation (denoted $\rightarrow$) in his 1978 paper. It captures causal ordering without reference to physical time.

### Definition

The relation $a \rightarrow b$ ("$a$ happens before $b$") holds if any of these conditions is true:

| Rule | Condition |
|---|---|
| **Process order** | $a$ and $b$ are events in the same process, and $a$ occurs before $b$ |
| **Message passing** | $a$ is the sending of a message and $b$ is the receipt of that same message |
| **Transitivity** | There exists an event $c$ such that $a \rightarrow c$ and $c \rightarrow b$ |

### Concurrent Events

If neither $a \rightarrow b$ nor $b \rightarrow a$, then $a$ and $b$ are **concurrent**, written $a \| b$.

Concurrent events are causally independent — neither could have influenced the other.

### Happens-Before as a Partial Order

The happens-before relation is a **strict partial order**:

- **Irreflexive:** $\neg(a \rightarrow a)$ — an event does not happen before itself
- **Antisymmetric:** if $a \rightarrow b$, then $\neg(b \rightarrow a)$
- **Transitive:** if $a \rightarrow b$ and $b \rightarrow c$, then $a \rightarrow c$

It is *partial* because not all pairs of events are comparable (concurrent events exist).

---

## Lamport Clocks

A **Lamport clock** assigns a logical timestamp $L(e)$ to every event $e$ such that:

$$a \rightarrow b \implies L(a) < L(b)$$

### The Algorithm

Each process $P_i$ maintains a local counter $C_i$, initialized to $0$.

**Rules:**

1. **Internal event or send:** Before executing an internal event or sending a message, increment the counter:

$$C_i \leftarrow C_i + 1$$

Assign $L(e) = C_i$ to the event.

2. **Receive:** When process $P_j$ receives a message with timestamp $t$:

$$C_j \leftarrow \max(C_j, t) + 1$$

Assign $L(e) = C_j$ to the receive event.

### Step-by-Step Example

Consider three processes $P_1$, $P_2$, $P_3$:

```
P1: a(1) ----send m1----> b(2)         e(5)
                            |             ^
P2:          c(1)          d(3) --send m2--|
                                          
P3:                   f(1)      g(2)
```

| Event | Process | Rule Applied | Timestamp |
|---|---|---|---|
| $a$ | $P_1$ | Internal: $C_1 = 0 + 1 = 1$ | $L(a) = 1$ |
| $c$ | $P_2$ | Internal: $C_2 = 0 + 1 = 1$ | $L(c) = 1$ |
| $f$ | $P_3$ | Internal: $C_3 = 0 + 1 = 1$ | $L(f) = 1$ |
| $b$ | $P_2$ | Receive $m_1$ with $t=1$: $C_2 = \max(1,1)+1 = 2$ | $L(b) = 2$ |
| $d$ | $P_2$ | Send: $C_2 = 2 + 1 = 3$ | $L(d) = 3$ |
| $g$ | $P_3$ | Internal: $C_3 = 1 + 1 = 2$ | $L(g) = 2$ |
| $e$ | $P_1$ | Receive $m_2$ with $t=3$: $C_1 = \max(1,3)+1 = 4+1 = 5$ | $L(e) = 5$ |

---

## Lamport Clock Properties

### The Clock Condition (What It Guarantees)

$$a \rightarrow b \implies L(a) < L(b)$$

If event $a$ causally precedes event $b$, then $a$'s timestamp is strictly less than $b$'s.

### The Converse Does NOT Hold

$$L(a) < L(b) \;\not\!\!\!\implies a \rightarrow b$$

This is a critical limitation. In the example above:

- $L(c) = 1$ and $L(g) = 2$, so $L(c) < L(g)$
- But $c$ and $g$ are on different processes with no message path between them
- Therefore $c \| g$ — they are concurrent, not causally related

> **Remember:** Lamport clocks can tell you "these events are **not** in this order" (by contrapositive: $L(a) \geq L(b) \implies \neg(a \rightarrow b)$), but they **cannot** confirm that a causal relationship exists just because timestamps are ordered.

### Formal Summary

| Statement | True? |
|---|---|
| $a \rightarrow b \implies L(a) < L(b)$ | Yes (clock condition) |
| $L(a) < L(b) \implies a \rightarrow b$ | **No** (converse fails) |
| $L(a) \geq L(b) \implies \neg(a \rightarrow b)$ | Yes (contrapositive) |
| $a \| b \implies L(a) = L(b)$ is possible | Yes (concurrent events may share timestamps) |

---

## Total Ordering with Lamport Timestamps

Lamport clocks provide a **partial order**. Sometimes we need a **total order** — a way to sort *every* pair of events, including concurrent ones.

### Construction

Define a total order $\prec$ by breaking ties with process IDs:

$$a \prec b \iff L(a) < L(b) \;\text{or}\; (L(a) = L(b) \;\text{and}\; \text{pid}(a) < \text{pid}(b))$$

This is an **arbitrary but consistent** ordering of concurrent events.

### Example

| Event | Timestamp | Process | Total Order Key |
|---|---|---|---|
| $a$ | 1 | $P_1$ | $(1, 1)$ |
| $c$ | 1 | $P_2$ | $(1, 2)$ |
| $f$ | 1 | $P_3$ | $(1, 3)$ |
| $b$ | 2 | $P_2$ | $(2, 2)$ |
| $g$ | 2 | $P_3$ | $(2, 3)$ |
| $d$ | 3 | $P_2$ | $(3, 2)$ |
| $e$ | 5 | $P_1$ | $(5, 1)$ |

Total order: $a \prec c \prec f \prec b \prec g \prec d \prec e$

> **Note:** The total order is consistent with causality ($a \rightarrow b \implies a \prec b$), but it imposes an artificial ordering on concurrent events that may differ from the physical order.

---

## Python Implementation

```python
class LamportClock:
    """Lamport logical clock implementation."""

    def __init__(self, pid):
        self.time = 0
        self.pid = pid

    def tick(self):
        """Increment clock for an internal event or before sending."""
        self.time += 1
        return self.time

    def send(self):
        """Record a send event and return the timestamp to attach."""
        self.time += 1
        return self.time

    def receive(self, msg_timestamp):
        """Update clock upon receiving a message."""
        self.time = max(self.time, msg_timestamp) + 1
        return self.time

    def __repr__(self):
        return f"LamportClock(pid={self.pid}, time={self.time})"


# --- Simulation ---
p1 = LamportClock(pid=1)
p2 = LamportClock(pid=2)
p3 = LamportClock(pid=3)

# P1: internal event a
ts_a = p1.tick()
print(f"P1 event a: L={ts_a}")          # L=1

# P2: internal event c
ts_c = p2.tick()
print(f"P2 event c: L={ts_c}")          # L=1

# P3: internal event f
ts_f = p3.tick()
print(f"P3 event f: L={ts_f}")          # L=1

# P1 sends message m1 to P2
ts_send_m1 = p1.send()                  # P1 increments before send
# but in our example, a IS the send, so let's use ts_a
# P2 receives m1
ts_b = p2.receive(ts_a)
print(f"P2 event b (recv m1): L={ts_b}")  # L=max(1,1)+1=2

# P2: send event d
ts_d = p2.send()
print(f"P2 event d (send m2): L={ts_d}")  # L=3

# P3: internal event g
ts_g = p3.tick()
print(f"P3 event g: L={ts_g}")          # L=2

# P1 receives m2 from P2
ts_e = p1.receive(ts_d)
print(f"P1 event e (recv m2): L={ts_e}")  # L=max(1,3)+1=5
```

**Output:**

```
P1 event a: L=1
P2 event c: L=1
P3 event f: L=1
P2 event b (recv m1): L=2
P2 event d (send m2): L=3
P3 event g: L=2
P1 event e (recv m2): L=5
```

---

## Java Implementation

```java
public class LamportClock {
    private int time;
    private final int pid;

    public LamportClock(int pid) {
        this.time = 0;
        this.pid = pid;
    }

    /** Increment for an internal event. */
    public synchronized int tick() {
        return ++time;
    }

    /** Record a send event; returns timestamp to attach to the message. */
    public synchronized int send() {
        return ++time;
    }

    /** Update clock on message receipt. */
    public synchronized int receive(int msgTimestamp) {
        time = Math.max(time, msgTimestamp) + 1;
        return time;
    }

    public int getTime() { return time; }
    public int getPid()  { return pid; }

    @Override
    public String toString() {
        return "LamportClock(pid=" + pid + ", time=" + time + ")";
    }

    // --- Demo ---
    public static void main(String[] args) {
        LamportClock p1 = new LamportClock(1);
        LamportClock p2 = new LamportClock(2);

        int tsA = p1.tick();
        System.out.println("P1 event a: L=" + tsA);   // 1

        int tsB = p2.tick();
        System.out.println("P2 event b: L=" + tsB);   // 1

        // P1 sends to P2
        int tsSend = p1.send();                        // 2
        int tsRecv = p2.receive(tsSend);
        System.out.println("P2 recv from P1: L=" + tsRecv); // max(1,2)+1=3

        int tsC = p1.tick();
        System.out.println("P1 event c: L=" + tsC);   // 3

        // P2 sends to P1
        int tsSend2 = p2.send();                       // 4
        int tsRecv2 = p1.receive(tsSend2);
        System.out.println("P1 recv from P2: L=" + tsRecv2); // max(3,4)+1=5
    }
}
```

**Output:**

```
P1 event a: L=1
P2 event b: L=1
P2 recv from P1: L=3
P1 event c: L=3
P1 recv from P2: L=5
```

> **Thread safety:** The Java version uses `synchronized` because in real systems, send/receive may be called from different threads handling network I/O.

---

## Limitations of Lamport Clocks

| Limitation | Explanation |
|---|---|
| **Cannot detect concurrency** | If $L(a) < L(b)$, you cannot tell whether $a \rightarrow b$ or $a \| b$ |
| **No causal inference from timestamps** | The converse of the clock condition fails |
| **Over-counting** | Counters grow monotonically; with many messages, timestamps can become very large |
| **No gap detection** | You cannot look at two timestamps and determine how many events occurred between them |
| **Single scalar** | All causal history is compressed into one integer — information loss is inevitable |

### When Lamport Clocks Are Insufficient

If your application needs to answer the question:

> "Are events $a$ and $b$ causally related, or are they concurrent?"

Lamport clocks **cannot answer this**. You need **vector clocks**, which we cover in a later lesson.

**Vector clocks** provide the stronger property:

$$a \rightarrow b \iff V(a) < V(b)$$

Both directions hold, allowing you to detect concurrency.

---

## Practical Use Cases

### 1. Distributed Debugging

When debugging a distributed system, you need to reconstruct the order of events across processes.

```
# Typical distributed log (with Lamport timestamps)
[P1, L=1] User submits order #42
[P2, L=1] Inventory check started
[P1, L=2] Send order to P2          ──── m1 ────>
[P2, L=3] Receive order (via m1)
[P2, L=4] Inventory reserved
[P2, L=5] Send confirmation to P1   ──── m2 ────>
[P1, L=6] Receive confirmation
[P1, L=7] Order confirmed to user
```

Sorting by $(L, \text{pid})$ gives a total order consistent with causality, making logs readable.

### 2. Event Ordering in Distributed Databases

In systems like Apache Kafka or event sourcing architectures, Lamport timestamps help order events when multiple producers write to the same log:

```
Producer A (pid=1): write("x=1")  → L=3
Producer B (pid=2): write("x=2")  → L=3
```

Total order: $(3, 1) \prec (3, 2)$, so $A$'s write is ordered first. Both consumers see the same order.

### 3. Distributed Mutual Exclusion

Lamport's original paper used logical clocks to build a **distributed mutex** algorithm:

1. To request the lock, a process broadcasts a `REQUEST` with its Lamport timestamp
2. Other processes reply with `ACK`
3. A process enters the critical section when:
   - Its request has the smallest timestamp among all known requests
   - It has received `ACK` from every other process

The total ordering of timestamps ensures all processes agree on who goes first.

```
P1 requests lock at L=5    →  broadcast REQUEST(5, P1)
P2 requests lock at L=5    →  broadcast REQUEST(5, P2)

Total order: (5,1) < (5,2)  →  P1 enters first
```

### 4. Consistent Snapshots

Lamport timestamps help define **consistent cuts** — snapshots of the distributed system that respect causality. A cut is consistent if:

$$\text{For every received message in the cut, the corresponding send is also in the cut}$$

Lamport timestamps provide a necessary (but not sufficient) condition: if event $e$ is in the cut and $L(e') < L(e)$ with $e' \rightarrow e$, then $e'$ must also be in the cut.

---

## Comparison: Logical vs. Physical Clocks

| Property | Physical Clocks | Lamport Clocks |
|---|---|---|
| **What they measure** | Wall-clock time (seconds) | Causal ordering (count) |
| **Synchronization needed** | Yes (NTP, PTP, GPS) | No |
| **Precision** | Bounded by sync protocol (~ms with NTP) | Exact for causal ordering |
| **Clock condition** | Approximated (skew may violate) | Guaranteed: $a \rightarrow b \implies L(a) < L(b)$ |
| **Detect concurrency** | Cannot reliably | Cannot (need vector clocks) |
| **Timestamp size** | Fixed (e.g., 64-bit ns) | Unbounded (grows with events) |
| **Real-time correlation** | Yes | No |
| **Use case** | Timeouts, TTLs, human-readable logs | Causal ordering, distributed algorithms |

### When to Use Which

- **Physical clocks**: When you need real-time durations (timeouts, TTLs, rate limiting) or human-readable timestamps
- **Lamport clocks**: When you need causal ordering guarantees for correctness (mutex, event ordering, debugging)
- **Hybrid (e.g., HLC)**: When you need both real-time approximation and causal guarantees (some databases use Hybrid Logical Clocks)

---

## Summary

| Concept | Key Point |
|---|---|
| **Problem** | Physical clocks can't reliably order events across machines |
| **Happens-before ($\rightarrow$)** | Partial order defined by process order, messages, and transitivity |
| **Lamport clock** | Single counter per process; increment on events, $\max + 1$ on receive |
| **Clock condition** | $a \rightarrow b \implies L(a) < L(b)$ (guaranteed) |
| **Converse** | $L(a) < L(b) \;\not\!\!\!\implies a \rightarrow b$ (fails — critical limitation) |
| **Total order** | Break ties with process ID: $(L, \text{pid})$ |
| **Limitation** | Cannot distinguish causal ordering from concurrency |
| **Fix** | Vector clocks (covered later) provide both directions |

---

## Exercises

1. **Trace a Lamport Clock**
   Three processes exchange messages as shown below. Compute the Lamport timestamp for every event.

   ```
   P1:  a ──send──>  .        .        d
   P2:  .        b(recv)  c ──send──>  .
   P3:  .        .        .        e(recv)
   ```

2. **Identify Concurrent Events**
   Using your timestamps from Exercise 1, list all pairs of concurrent events. Verify that for each concurrent pair $(x, y)$, knowing $L(x) < L(y)$ does NOT mean $x \rightarrow y$.

3. **Implement Total Ordering**
   Extend the Python `LamportClock` class to support comparison. Implement `__lt__` using the $(L, \text{pid})$ rule:

   ```python
   def __lt__(self, other):
       # Your implementation here
       pass
   ```

4. **Distributed Mutex Simulation**
   Using Lamport clocks, simulate three processes requesting a shared lock. Each process sends a `REQUEST` message to the others. Determine the order in which processes enter the critical section using total ordering.

5. **Prove the Contrapositive**
   Formally prove that the clock condition $a \rightarrow b \implies L(a) < L(b)$ is equivalent to its contrapositive $L(a) \geq L(b) \implies \neg(a \rightarrow b)$. Explain why this is useful in practice.

6. **Counter Growth Analysis**
   In a system of $n$ processes where each process performs $k$ internal events between every message send/receive, what is the maximum Lamport timestamp after $m$ total messages have been exchanged? Express your answer in terms of $n$, $k$, and $m$.

7. **Physical vs. Logical**
   Give a concrete scenario where using physical timestamps (with NTP synchronization accurate to 10ms) would produce an incorrect event ordering, but Lamport timestamps would produce the correct ordering.
