---
title: "Consistency Models Spectrum"
---

# Consistency Models Spectrum

A **consistency model** defines the contract between a distributed data store and its clients — specifying what values a read operation may return given a history of writes. Understanding the full spectrum from strongest to weakest is essential for designing and reasoning about distributed systems.

---

## Why Consistency Models Matter

In a single-machine system, consistency is trivial: there is one copy of data, and every read returns the latest write. In a distributed system with **replication**, data exists in multiple locations, and the system must decide:

- When does a write become visible to readers?
- Can different readers see different values at the same time?
- What ordering guarantees do operations have?

The **CAP theorem** tells us we cannot have all three of Consistency, Availability, and Partition tolerance simultaneously. Consistency models formalize exactly *how much* consistency we are willing to sacrifice.

---

## The Consistency Spectrum

From strongest (most restrictive, hardest to implement) to weakest (most permissive, easiest to scale):

```
Strict Consistency
       ↓
Linearizability
       ↓
Sequential Consistency
       ↓
Causal Consistency
       ↓
PRAM / FIFO Consistency
       ↓
Eventual Consistency
```

Each level relaxes some constraint of the level above, enabling better performance, availability, or partition tolerance.

---

## 1. Strict Consistency

### Definition

Strict consistency requires that any read to a memory location $x$ returns the value of the most recent write to $x$ in **absolute (real) time**.

$$
\text{Read}(x) = \text{value written by the most recent Write}(x) \text{ in global real time}
$$

### Guarantees

- Every operation is instantly visible to all processes
- A single global timeline exists for all operations
- No stale reads are ever possible

### Trade-offs

| Aspect | Impact |
|--------|--------|
| Latency | Requires instantaneous propagation — physically impossible across distances |
| Availability | Any network delay violates the model |
| Scalability | Cannot be implemented in practice |

### Practical Status

Strict consistency is a **theoretical ideal**. The speed of light imposes a fundamental limit — information cannot propagate instantaneously. No real distributed system implements strict consistency.

> **Note:** Even a single-core CPU with caches does not provide strict consistency without memory barriers.

---

## 2. Linearizability

### Definition

Linearizability (also called **atomic consistency**) requires that all operations appear to execute atomically at some point between their invocation and response, and that this ordering respects the real-time ordering of non-overlapping operations.

Formally, a history $H$ is linearizable if there exists a legal sequential history $S$ such that:

1. $S$ is a permutation of the completed operations in $H$
2. If operation $op_1$ completes before $op_2$ starts in $H$, then $op_1$ appears before $op_2$ in $S$

### Guarantees

- Operations appear to happen at a single instant (linearization point)
- Real-time ordering is preserved for non-concurrent operations
- Each object is individually linearizable (composable)

### Example

```
Process P1: |--- Write(x, 1) ---|
Process P2:                          |--- Read(x) → 1 ---|

Since Write completes before Read starts, Read MUST return 1.
```

For overlapping operations:

```
Process P1: |--- Write(x, 1) ---------|
Process P2:        |--- Read(x) → ? ---|

Read may return 0 or 1 (either linearization order is valid).
```

### Trade-offs

| Aspect | Impact |
|--------|--------|
| Latency | Requires coordination (consensus) — typically 1-2 RTTs |
| Availability | Cannot be available during partitions (CAP) |
| Scalability | Limited by coordination overhead |
| Composability | Local property — combining linearizable objects yields a linearizable system |

### Real Systems

- **ZooKeeper** (writes only)
- **etcd** (Raft-based consensus)
- **Spanner** (TrueTime + Paxos)
- **CockroachDB** (serializable + linearizable reads)

---

## 3. Sequential Consistency

### Definition

Sequential consistency requires that the result of any execution is the same as if all operations were executed in **some** sequential order, and the operations of each individual process appear in this sequence in the order specified by their program.

$$
\exists \text{ total order } S : \forall \text{ process } P_i, \text{ operations of } P_i \text{ in } S \text{ preserve program order}
$$

### Key Difference from Linearizability

Sequential consistency does **not** require respecting real-time ordering between different processes. Two operations on different processes can be reordered even if one finished before the other started.

### Example

```
Process P1: Write(x, 1)    Write(x, 3)
Process P2: Write(x, 2)    Read(x) → ?

Valid sequential orders:
  W(x,1), W(x,2), W(x,3), R(x)→3  ✓
  W(x,2), W(x,1), W(x,3), R(x)→3  ✓
  W(x,1), W(x,3), W(x,2), R(x)→2  ✓ (P2's ops in order)

Invalid:
  W(x,3), W(x,1), ...  ✗ (violates P1's program order)
```

### Guarantees

- All processes see the same interleaving of operations
- Each process's operations maintain their program order
- No real-time ordering requirement across processes

### Trade-offs

| Aspect | Impact |
|--------|--------|
| Latency | Lower than linearizability — no real-time constraint |
| Availability | Still requires global agreement on ordering |
| Composability | **NOT** composable — combining sequentially consistent objects may not be sequentially consistent |
| Hardware | Used in CPU memory models (with fences) |

### Real Systems

- **CPU memory models** (x86-TSO approximates this)
- **HDFS** (single-writer sequential consistency)

---

## 4. Causal Consistency

### Definition

Causal consistency requires that operations that are **causally related** are seen by all processes in the same order. Concurrent operations (those with no causal relationship) may be seen in different orders by different processes.

Two operations are causally related if:

1. They are by the same process (program order), OR
2. A read returns a value written by a write (read-from), OR
3. Transitivity: if $a \to b$ and $b \to c$, then $a \to c$

This is based on Lamport's **happens-before** relation ($\to$).

### Example

```
Process P1: Write(x, 1)
Process P2: Read(x) → 1    Write(x, 2)    [causal: read of 1 influences write of 2]
Process P3: Read(x) → ?

P3 must see Write(x,1) before Write(x,2) because they are causally related.
But if P1 also does Write(y, 7) concurrently, P3 may see it in any order relative to x.
```

### Guarantees

- Causally related operations are seen in consistent order everywhere
- Concurrent operations may diverge across replicas
- Respects the "if you saw it, you saw its causes" principle

### Trade-offs

| Aspect | Impact |
|--------|--------|
| Latency | Can be implemented without synchronous coordination |
| Availability | Can remain available during partitions |
| Scalability | Requires tracking causal dependencies (vector clocks, version vectors) |
| Complexity | Metadata overhead grows with number of writers |

### Tracking Causality

Systems typically use **vector clocks** or **dotted version vectors**:

```
Vector Clock for 3 nodes: [P1:3, P2:1, P3:5]

Event at P1: increment P1's entry → [P1:4, P2:1, P3:5]
Send message: attach current vector clock
Receive message: merge (element-wise max) + increment local
```

### Real Systems

- **COPS** (Clusters of Order-Preserving Servers)
- **MongoDB** (causal consistency sessions since 3.6)
- **AntidoteDB**
- **Riak** (with causal context)

---

## 5. PRAM / FIFO Consistency

### Definition

**Pipeline RAM (PRAM)** consistency, also called **FIFO consistency**, requires that writes done by a single process are seen by all other processes in the order they were issued. However, writes from different processes may be seen in different orders.

$$
\forall P_i, P_j : \text{writes by } P_i \text{ are observed by } P_j \text{ in } P_i\text{'s issue order}
$$

### Key Difference from Causal

PRAM does not require read-from causality. If $P_2$ reads a value written by $P_1$ and then writes, PRAM does not enforce that $P_1$'s write is seen before $P_2$'s write by other processes.

### Example

```
P1: Write(x, 1)    Write(x, 2)
P2: Write(x, 3)    Write(x, 4)

P3 sees: W(x,1) before W(x,2)  ✓ (P1's order preserved)
         W(x,3) before W(x,4)  ✓ (P2's order preserved)
         But W(x,3) could appear before W(x,1) — allowed!

P4 sees: W(x,1) before W(x,2)  ✓
         W(x,3) before W(x,4)  ✓
         But P4's interleaving may differ from P3's — also allowed!
```

### Guarantees

- Per-source ordering is preserved
- No global ordering of writes from different sources
- Simple to implement with per-source sequence numbers

### Trade-offs

| Aspect | Impact |
|--------|--------|
| Latency | Very low — no cross-process coordination |
| Availability | Fully available during partitions |
| Scalability | Excellent — each source maintains its own sequence |
| Consistency | Weak — different observers may disagree on interleaving |

### Real Systems

- **Bayou** (session guarantees layer)
- **TCP** (per-connection FIFO is essentially this model)
- Many messaging systems (per-partition ordering in Kafka)

---

## 6. Eventual Consistency

### Definition

Eventual consistency guarantees that if no new updates are made to a data item, **eventually** all replicas will converge to the same value.

$$
\forall x : \text{if no new writes after time } t, \text{ then } \exists T > t : \forall t' > T, \text{ all reads return same value}
$$

### Guarantees

- Convergence: replicas will eventually agree
- No ordering guarantees during convergence
- No bound on convergence time (in basic form)

### What It Does NOT Guarantee

- When convergence happens
- What intermediate values may be read
- That all replicas see the same sequence of states

### Trade-offs

| Aspect | Impact |
|--------|--------|
| Latency | Minimal — writes are local, async propagation |
| Availability | Maximum — always writable |
| Scalability | Excellent — no coordination |
| Conflicts | Must handle concurrent writes (LWW, CRDTs, application-level) |

### Conflict Resolution Strategies

```
1. Last-Writer-Wins (LWW):
   - Use timestamps to pick "latest" write
   - Simple but may lose updates
   
2. CRDTs (Conflict-free Replicated Data Types):
   - Mathematically guaranteed convergence
   - No coordination needed
   - Examples: G-Counter, OR-Set, LWW-Register

3. Application-level resolution:
   - Present conflicts to user (e.g., Git merge conflicts)
   - Domain-specific merge logic
```

### Real Systems

- **Amazon DynamoDB** (default mode)
- **Apache Cassandra** (tunable, but eventual by default)
- **DNS** (TTL-based propagation)
- **Amazon S3** (read-after-write for new objects, eventual for overwrites)
- **CouchDB** (with conflict detection)

---

## Comparison Table

| Model | Real-time Order | Global Order | Per-process Order | Causal Order | Convergence |
|-------|:-:|:-:|:-:|:-:|:-:|
| Strict | ✓ | ✓ | ✓ | ✓ | Immediate |
| Linearizability | ✓ | ✓ | ✓ | ✓ | Immediate |
| Sequential | ✗ | ✓ | ✓ | ✓ | Immediate |
| Causal | ✗ | ✗ | ✓ | ✓ | Immediate (for causal) |
| PRAM/FIFO | ✗ | ✗ | ✓ | ✗ | Eventual |
| Eventual | ✗ | ✗ | ✗ | ✗ | Eventually |

### Performance vs. Consistency Trade-off

| Model | Coordination Required | Typical Latency | Availability under Partitions |
|-------|----------------------|-----------------|-------------------------------|
| Linearizability | Consensus (Paxos/Raft) | 10-100ms | No |
| Sequential | Total-order broadcast | 5-50ms | No |
| Causal | Vector clocks / dependency tracking | 1-10ms | Yes |
| PRAM | Per-source sequencing | <1ms | Yes |
| Eventual | None | <1ms | Yes |

---

## Database Consistency Mapping

| Database | Default Model | Strongest Available |
|----------|--------------|-------------------|
| Spanner | External consistency (≈ linearizability) | Linearizable |
| CockroachDB | Serializable | Linearizable reads |
| etcd | Linearizable writes | Linearizable |
| ZooKeeper | Sequential (reads), Linearizable (writes) | Linearizable (sync) |
| MongoDB | Eventual | Causal (with sessions) |
| Cassandra | Eventual | Linearizable (LWT) |
| DynamoDB | Eventual | Strong (per-table) |
| Redis | Eventual (replicas) | Linearizable (single node) |
| Riak | Eventual | — |
| CouchDB | Eventual | — |

---

## Client-Centric vs. Data-Centric Models

### Data-Centric Models

Data-centric models define consistency from the **system's perspective** — what orderings are guaranteed across all replicas.

All models discussed above (linearizability, sequential, causal, etc.) are data-centric.

### Client-Centric Models

Client-centric models define guarantees from an **individual client's perspective**, regardless of which replica it contacts:

| Guarantee | Definition |
|-----------|-----------|
| **Read Your Writes** | A client always sees its own previous writes |
| **Monotonic Reads** | Once a client reads value $v$, subsequent reads return $v$ or a newer value |
| **Monotonic Writes** | A client's writes are applied in the order they were issued |
| **Writes Follow Reads** | If a client reads $v$ and then writes $w$, the write is ordered after the write that produced $v$ |

### Session Guarantees in Practice

```javascript
// MongoDB session guarantees example
const session = client.startSession({ causalConsistency: true });

// Within this session:
// - Read your writes: guaranteed
// - Monotonic reads: guaranteed
// - Monotonic writes: guaranteed
// - Writes follow reads: guaranteed

await collection.insertOne({ x: 1 }, { session });
const doc = await collection.findOne({ x: 1 }, { session });
// doc is guaranteed to exist (read your writes)
```

These guarantees can be implemented **on top of** eventual consistency by tracking per-client state (session tokens, vector timestamps).

---

## Consistency in Practice

### Real Systems Rarely Use One Pure Model

Modern databases offer **tunable consistency** — different operations can use different models:

```
Cassandra: consistency level per query
  - ONE: eventual consistency (fastest)
  - QUORUM: linearizable for that key (R + W > N)
  - ALL: strongest but lowest availability

DynamoDB:
  - Default reads: eventual
  - Strongly consistent reads: linearizable (2x cost)
  - Transactions: serializable

MongoDB:
  - Default: eventual (secondary reads)
  - Primary reads: read-your-writes
  - Causal sessions: causal consistency
  - Transactions: snapshot isolation
```

### Mixed Consistency Architectures

Real applications often use **different consistency levels for different data**:

```
User authentication → Linearizable (correctness critical)
Shopping cart       → Eventual + CRDTs (availability critical)
Inventory count    → Serializable (prevent overselling)
Product reviews    → Eventual (staleness acceptable)
Bank transfers     → Linearizable (safety critical)
Social media feed  → Causal (see replies after original post)
```

### The Cost of Stronger Consistency

Coordination cost scales with:

$$
\text{Latency} \geq \frac{d}{c} \quad \text{(speed of light bound between replicas)}
$$

For geographically distributed systems:

| Route | Min RTT | Linearizable Write |
|-------|---------|-------------------|
| Same datacenter | <1ms | ~2ms |
| US East ↔ West | ~60ms | ~120ms |
| US ↔ Europe | ~80ms | ~160ms |
| US ↔ Asia | ~150ms | ~300ms |

---

## Jepsen Project and Consistency Testing

### What is Jepsen?

**Jepsen** (created by Kyle Kingsbury / "Aphyr") is an open-source framework for testing the consistency guarantees of distributed databases under real failure conditions.

### How Jepsen Works

```
1. Deploy database cluster (typically 5 nodes)
2. Run concurrent client operations (reads, writes, CAS)
3. Inject failures ("nemeses"):
   - Network partitions
   - Clock skew
   - Node crashes
   - Disk corruption
4. Collect history of all operations
5. Check if history satisfies claimed consistency model
```

### Consistency Checking: Linearizability

Jepsen uses the **Knossos** checker (and later **Elle**) for linearizability verification:

```
Given: History H = [invoke(write x=1), ok(write x=1), 
                    invoke(read x), ok(read x → 1)]

Check: Does there exist a linearization?
  - NP-complete in general
  - Practical with bounded concurrency
  - Uses WGL algorithm with optimizations
```

### Notable Jepsen Findings

| Database | Issue Found | Year |
|----------|------------|------|
| MongoDB | Stale reads under partitions | 2015 |
| Cassandra | LWT could lose acknowledged writes | 2015 |
| CockroachDB | Serialization anomalies | 2017 |
| Redis (Sentinel) | Split-brain data loss | 2013 |
| Elasticsearch | Acknowledged writes lost | 2014 |
| etcd | Stale reads on leader election | 2020 |
| PostgreSQL | Serializable isolation gaps | 2020 |

### Writing Your Own Consistency Tests

```clojure
;; Simplified Jepsen test structure
(deftest linearizable-register-test
  (let [test (jepsen/run!
               {:nodes ["n1" "n2" "n3" "n4" "n5"]
                :concurrency 10
                :generator (gen/mix [read-op write-op cas-op])
                :nemesis (nemesis/partition-random-halves)
                :checker (checker/linearizable 
                           {:model (model/register)})
                :time-limit 60})]
    (is (:valid? (:results test)))))
```

### Key Lessons from Jepsen

1. **Documentation ≠ Implementation**: Many databases claim stronger consistency than they deliver
2. **Default configurations are often weak**: Stronger consistency requires explicit opt-in
3. **Failures compound**: Clock skew + partition = unexpected behavior
4. **Test under failure**: Systems behave differently under stress

---

## Exercises

### Exercise 1: Classify the History

Given the following history, what is the **weakest** consistency model it satisfies?

```
P1: Write(x, 1) at t=0,  Write(y, 2) at t=5
P2: Read(y) → 2 at t=3,  Read(x) → 0 at t=7
```

<details>
<summary>Solution</summary>

This history violates **linearizability** because P2 reads $y=2$ (written at $t=5$) at $t=3$ (before the write in real time — impossible). This history is actually **invalid under any model** if we assume real-time timestamps are accurate.

If we relax to logical time: P2 sees P1's second write but not the first. This violates **PRAM** (P1's writes must be seen in order). It satisfies only **eventual consistency** (if we assume convergence will happen later).

</details>

### Exercise 2: Design a Consistency Level

A social media application has these requirements:
- Users must always see their own posts immediately after posting
- A user's followers should see posts in the order they were published
- Users in different regions may see the global feed in different orders

What consistency model fits each requirement?

<details>
<summary>Solution</summary>

1. **Read Your Writes** (client-centric) — ensures the posting user sees their own content
2. **PRAM/FIFO consistency** — per-source ordering preserves publication order from one author
3. **Eventual consistency** — cross-region feeds may temporarily diverge

A system like this could use **causal consistency** (which subsumes read-your-writes and PRAM) for the core, with eventual consistency for cross-region aggregation.

</details>

### Exercise 3: Quorum Calculation

A system has $N = 5$ replicas. For linearizable reads and writes using quorum:

1. What values of $R$ (read quorum) and $W$ (write quorum) ensure linearizability?
2. If $W = 3$, what is the minimum $R$?
3. What happens if a node fails with $R = 3, W = 3$?

<details>
<summary>Solution</summary>

1. The condition for linearizability is $R + W > N$, so $R + W > 5$. Examples: $R=3, W=3$ or $R=2, W=4$.

2. If $W = 3$: $R + 3 > 5 \Rightarrow R > 2 \Rightarrow R_{\min} = 3$.

3. With $R=3, W=3, N=5$: one node failure means $N_{\text{live}}=4$. Both reads and writes still achieve quorum (3 out of 4 available). The system tolerates $f = N - \max(R, W) = 5 - 3 = 2$ failures.

</details>

### Exercise 4: Vector Clock Ordering

Given these vector clocks, determine the causal relationships:

```
Event A: [2, 0, 0]
Event B: [1, 1, 0]
Event C: [2, 1, 0]
Event D: [0, 0, 1]
```

<details>
<summary>Solution</summary>

Comparison rules: $VC_1 \leq VC_2$ iff every component of $VC_1 \leq$ corresponding component of $VC_2$.

- $A$ vs $B$: $[2,0,0]$ vs $[1,1,0]$ — neither dominates → **concurrent** ($A \| B$)
- $A$ vs $C$: $[2,0,0] \leq [2,1,0]$ — A happened before C → $A \to C$
- $B$ vs $C$: $[1,1,0] \leq [2,1,0]$ — B happened before C → $B \to C$
- $D$ vs all others: $[0,0,1]$ — neither dominates nor is dominated by any → $D \| A$, $D \| B$, $D \| C$

So $C$ is causally after both $A$ and $B$, while $D$ is concurrent with everything else.

</details>

---

## Summary

- **Consistency models** form a spectrum from impossible-to-implement (strict) to trivially-achievable (eventual)
- **Linearizability** is the gold standard for strong consistency — atomic operations respecting real time
- **Sequential consistency** relaxes real-time ordering but maintains a global sequence
- **Causal consistency** is the strongest model achievable with high availability during partitions
- **Eventual consistency** maximizes availability and performance at the cost of temporary divergence
- **Client-centric models** provide per-session guarantees that are often sufficient for applications
- Real systems use **tunable consistency** — mixing models based on data criticality
- **Jepsen** testing reveals that claimed guarantees often differ from actual behavior under failure
- The right consistency model depends on your **correctness requirements** vs. **performance budget**

---

## References

- Lamport, L. "How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs" (1979) — Sequential consistency
- Herlihy, M. & Wing, J. "Linearizability: A Correctness Condition for Concurrent Objects" (1990)
- Ahamad, M. et al. "Causal Memory: Definitions, Implementation, and Programming" (1995)
- Vogels, W. "Eventually Consistent" (2009)
- Kingsbury, K. "Jepsen" — https://jepsen.io
- Viotti, P. & Vukolić, M. "Consistency in Non-Transactional Distributed Storage Systems" (2016) — comprehensive survey
