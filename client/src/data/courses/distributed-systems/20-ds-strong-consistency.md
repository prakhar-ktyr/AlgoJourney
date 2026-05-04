---
title: "Strong Consistency"
---

# Strong Consistency

Strong consistency (linearizability) is the strongest single-object consistency model. It guarantees that every operation appears to take effect instantaneously at some point between its invocation and response, making a distributed system behave as if it were a single machine.

---

## What Is Strong Consistency?

In a distributed system, data is replicated across multiple nodes. Strong consistency ensures that **all nodes see the same data at the same time** — every read returns the most recent write, regardless of which replica serves the request.

| Property | Description |
|----------|-------------|
| Freshness | Every read sees the latest write |
| Total order | All operations appear in a single global order |
| Real-time | The order respects real-time precedence |
| Single-copy illusion | System appears as one node to clients |

Strong consistency eliminates anomalies like stale reads, lost updates, and conflicting views of data across clients.

---

## Linearizability: The Formal Definition

**Linearizability** is the formal name for strong consistency on individual objects. It was defined by Herlihy and Wing (1990).

### Definition

A history $H$ of operations is **linearizable** if there exists a sequential history $S$ such that:

1. $S$ is a permutation of the completed operations in $H$ (plus a subset of pending operations)
2. $S$ is legal (respects the object's sequential specification)
3. If operation $op_1$ completes before $op_2$ starts in $H$, then $op_1$ appears before $op_2$ in $S$

### Real-Time Ordering

The key constraint is **real-time ordering**: if operation $A$ finishes before operation $B$ begins (in wall-clock time), then $A$ must appear before $B$ in the linearization.

```
Client 1:  |--- write(x=1) ---|
Client 2:                          |--- read(x) ---|

Timeline:  ─────────────────────────────────────────►

Because write(x=1) completes before read(x) starts,
linearizability requires read(x) = 1.
```

### Linearization Point

Every operation has a **linearization point** — the instant when the operation "takes effect." This point must lie between the operation's invocation and response:

$$t_{invoke} \leq t_{linearization} \leq t_{response}$$

### Single-Copy Illusion

Linearizability makes a replicated object indistinguishable from a non-replicated one. Clients can reason about the system as if there is only a single copy of the data:

```
┌─────────────────────────────────────────┐
│         Linearizable System             │
│                                         │
│  Client A ──┐                           │
│             ├──► Appears as single      │
│  Client B ──┤    shared register        │
│             │                           │
│  Client C ──┘                           │
└─────────────────────────────────────────┘
```

---

## Sequential Consistency vs Linearizability

Both models impose a total order on operations, but they differ in how that order relates to real time.

| Property | Sequential Consistency | Linearizability |
|----------|----------------------|-----------------|
| Total order exists | Yes | Yes |
| Respects per-process order | Yes | Yes |
| Respects real-time order | **No** | **Yes** |
| Composable | No | Yes |
| Strength | Weaker | Stronger |

### Example: The Difference

```
Client 1: write(x=1)  ───────────────────  read(y)=0
Client 2: write(y=1)  ───────────────────  read(x)=0

Sequential consistency: ALLOWED
  (reorder: read(y)=0, read(x)=0, write(x=1), write(y=1))

Linearizability: FORBIDDEN
  (real-time ordering prevents both reads from missing both writes
   if the writes complete before the reads start)
```

### Composability

A critical advantage of linearizability: if each object in a system is individually linearizable, the entire system is linearizable. Sequential consistency does **not** have this property.

$$\text{Linearizable}(O_1) \wedge \text{Linearizable}(O_2) \implies \text{Linearizable}(O_1 \cup O_2)$$

---

## How to Implement Strong Consistency

### Approach 1: Single Node

The simplest approach — all reads and writes go to a single node:

```javascript
// Single-node linearizable register
class LinearizableRegister {
  constructor() {
    this.value = null;
    this.lock = new Mutex();
  }

  async write(val) {
    await this.lock.acquire();
    try {
      this.value = val;
    } finally {
      this.lock.release();
    }
  }

  async read() {
    await this.lock.acquire();
    try {
      return this.value;
    } finally {
      this.lock.release();
    }
  }
}
```

**Drawback**: no fault tolerance. If the node crashes, the data is unavailable.

### Approach 2: Consensus-Based Replication

Use a consensus protocol to replicate a log of operations. Every write is committed only after a majority agrees.

#### Raft-Based Linearizable Reads

```
┌──────────────────────────────────────────────────┐
│                  Raft Cluster                     │
│                                                  │
│  Client ──► Leader ──► AppendEntries ──► Followers│
│                │                                 │
│                ▼                                  │
│         Commit (majority)                        │
│                │                                  │
│                ▼                                  │
│         Apply to state machine                   │
│                │                                  │
│                ▼                                  │
│         Respond to client                        │
└──────────────────────────────────────────────────┘
```

For **linearizable reads** in Raft:

| Method | How It Works | Trade-off |
|--------|-------------|-----------|
| Read through log | Treat reads as log entries | High latency |
| ReadIndex | Leader confirms leadership, then reads | Lower latency |
| Lease-based reads | Leader uses time-based lease | Depends on clock accuracy |

#### Paxos-Based Approach

```
Phase 1 (Prepare):
  Proposer → Acceptors: Prepare(n)
  Acceptors → Proposer: Promise(n, accepted_value)

Phase 2 (Accept):
  Proposer → Acceptors: Accept(n, value)
  Acceptors → Proposer: Accepted(n, value)

Committed when majority accepts.
```

### Approach 3: Quorum Reads and Writes

With $N$ replicas, choose write quorum $W$ and read quorum $R$ such that:

$$W + R > N$$

This ensures every read overlaps with the most recent write:

```
N = 5 replicas

Write quorum W = 3:  [✓] [✓] [✓] [ ] [ ]
Read  quorum R = 3:  [ ] [ ] [✓] [✓] [✓]
                              ^^^
                          Overlap guarantees
                          freshest value seen
```

**Important**: Quorum intersection alone is **not sufficient** for linearizability. You also need:

1. Read-repair or anti-entropy to propagate values
2. Version numbers or timestamps to identify the latest write
3. Handling of concurrent/in-progress writes

```javascript
// Quorum read with version resolution
async function quorumRead(key, replicas, R) {
  const responses = await queryReplicas(replicas, key, R);

  // Find the response with the highest version
  const latest = responses.reduce((max, resp) =>
    resp.version > max.version ? resp : max
  );

  // Read-repair: propagate latest to stale replicas
  for (const resp of responses) {
    if (resp.version < latest.version) {
      await repair(resp.replica, key, latest);
    }
  }

  return latest.value;
}
```

---

## The Cost of Strong Consistency

### Performance Cost

Linearizability requires coordination, which adds latency:

| Operation | Without Coordination | With Linearizability |
|-----------|---------------------|---------------------|
| Write | Local write (~1ms) | Consensus round (~5-50ms) |
| Read | Local read (~0.1ms) | Leader read or quorum (~2-20ms) |
| Cross-datacenter | N/A | Consensus across DCs (~100-300ms) |

The minimum latency for a linearizable operation across two datacenters separated by distance $d$ is bounded by:

$$t_{min} \geq \frac{d}{c}$$

where $c$ is the speed of light. No protocol can beat physics.

### Availability Cost (CAP Theorem)

The **CAP theorem** states that during a network partition, a system must choose between:

- **Consistency** (linearizability): reject operations that cannot be confirmed
- **Availability**: respond to every request, possibly with stale data

$$\text{Partition} \implies \neg(\text{Linearizability} \wedge \text{Availability})$$

```
Normal operation:      Partition:
┌───┐    ┌───┐        ┌───┐  ╳  ┌───┐
│ A │◄──►│ B │        │ A │     │ B │
└───┘    └───┘        └───┘     └───┘

                       Choose:
                       A) Reject writes → Consistent
                       B) Accept writes → Available
                          (but possibly divergent)
```

### The PACELC Extension

PACELC extends CAP: even when there is **no partition**, there is a trade-off between **latency** and **consistency**:

| Scenario | Trade-off |
|----------|-----------|
| Partition (P) | Availability vs Consistency |
| Else (E) | Latency vs Consistency |

Systems like DynamoDB choose availability and low latency (PA/EL), while systems like ZooKeeper choose consistency (PC/EC).

---

## Linearizability Testing with Jepsen

[Jepsen](https://jepsen.io) is the industry-standard tool for testing linearizability of distributed systems.

### How Jepsen Works

```
┌─────────────────────────────────────────────┐
│              Jepsen Test                     │
│                                             │
│  1. Set up cluster                          │
│  2. Run concurrent operations (clients)     │
│  3. Inject faults (partitions, crashes)     │
│  4. Record history of invocations/responses │
│  5. Check if history is linearizable        │
└─────────────────────────────────────────────┘
```

### The Verification Problem

Checking whether a history is linearizable is **NP-complete** in general. Practical checkers like **Knossos** and **Porcupine** use heuristics:

```
History:
  invoke read()         @ t=0   client-1
  invoke write(1)       @ t=1   client-2
  ok     write(1)       @ t=3   client-2
  ok     read() => 0    @ t=4   client-1  ← VIOLATION!

The read started before the write but returned after it.
Since write(1) completed before read() returned,
linearizability requires read() = 1.
```

### Notable Jepsen Findings

| System | Issue Found |
|--------|-------------|
| MongoDB | Stale reads from secondaries violated linearizability |
| Redis Cluster | Data loss during failover |
| etcd | Lease-based reads could read stale data |
| CockroachDB | Serializable anomaly under clock skew |
| PostgreSQL | Serializable isolation wasn't always serializable |

---

## Systems with Strong Consistency

| System | Mechanism | Scope |
|--------|-----------|-------|
| **ZooKeeper** | ZAB protocol (leader-based) | Single object (znode) |
| **etcd** | Raft consensus | Key-value operations |
| **Google Spanner** | Paxos + TrueTime | Global transactions |
| **CockroachDB** | Raft + hybrid-logical clocks | Serializable transactions |
| **FoundationDB** | OCC + Paxos | Serializable transactions |
| **TiKV** | Raft consensus | Key-value operations |

### Google Spanner: Global Linearizability

Spanner achieves external consistency (linearizability for transactions) across global datacenters using TrueTime:

```
TrueTime API:
  TT.now()  → [earliest, latest]  (bounded uncertainty)
  TT.after(t)  → true if t has definitely passed
  TT.before(t) → true if t has definitely not arrived

Commit protocol:
  1. Acquire locks
  2. Choose commit timestamp s ≥ TT.now().latest
  3. Wait until TT.after(s) is true  ← "commit wait"
  4. Release locks and apply
```

The commit-wait ensures that if transaction $T_1$ commits before $T_2$ starts, then $s_1 < s_2$:

$$\text{commit}(T_1) < \text{start}(T_2) \implies s_1 < s_2$$

---

## Use Cases Where Strong Consistency Is Essential

### 1. Distributed Locks and Leader Election

```javascript
// Distributed lock using linearizable compare-and-swap
async function acquireLock(etcdClient, lockKey, owner, ttl) {
  const txn = etcdClient.transaction();
  // Only acquire if key doesn't exist (CAS)
  const result = await txn
    .if(lockKey, 'Create', '==', 0)  // key doesn't exist
    .then(put(lockKey, owner, { lease: ttl }))
    .else(get(lockKey))
    .commit();

  return result.succeeded;
}
```

### 2. Unique Constraints

Ensuring uniqueness (e.g., usernames, account numbers) requires linearizable reads:

```
Without linearizability:
  Client A: read(username="alice") → not found
  Client B: read(username="alice") → not found
  Client A: write(username="alice", user=A) → OK
  Client B: write(username="alice", user=B) → OK  ← DUPLICATE!
```

### 3. Financial Transactions

Account balances must reflect all prior operations:

```
Balance = $100

Without linearizability:
  T1: withdraw($80) → success (sees $100)
  T2: withdraw($80) → success (sees $100, stale!)
  Result: balance = -$60  ← OVERDRAFT!
```

### 4. Configuration Management

Distributed systems rely on configuration (membership, feature flags) that must be consistent:

| Application | Consequence of Inconsistency |
|-------------|------------------------------|
| Service discovery | Requests routed to dead nodes |
| Feature flags | Different behavior for same user |
| Schema changes | Data corruption |
| Access control | Security violations |

---

## Weaker Guarantees: Session Consistency Models

When full linearizability is too expensive, **session guarantees** offer useful middle ground:

### Read-Your-Writes

A client always sees its own writes, even if reading from a different replica:

```
Client writes x=5 to Replica A
Client reads x from Replica B → must see x=5 (or later)

Implementation: track write version, route reads to
replicas that have caught up to that version.
```

```javascript
// Read-your-writes with version tracking
class SessionClient {
  constructor(replicas) {
    this.replicas = replicas;
    this.lastWriteVersion = 0;
  }

  async write(key, value) {
    const result = await this.primary.write(key, value);
    this.lastWriteVersion = result.version;
    return result;
  }

  async read(key) {
    // Find a replica caught up to our last write
    for (const replica of this.replicas) {
      if (replica.version >= this.lastWriteVersion) {
        return replica.read(key);
      }
    }
    // Fall back to primary
    return this.primary.read(key);
  }
}
```

### Monotonic Reads

Once a client reads a value at version $v$, subsequent reads will never return a version $v' < v$:

$$\text{read}_i \text{ returns version } v \implies \forall j > i: \text{read}_j \text{ returns version } v' \geq v$$

### Comparison of Session Guarantees

| Guarantee | Ensures | Does NOT Ensure |
|-----------|---------|-----------------|
| Read-your-writes | See own writes | See others' writes |
| Monotonic reads | No "going back in time" | See latest value |
| Monotonic writes | Own writes ordered | Global ordering |
| Writes-follow-reads | Causal ordering | Real-time ordering |
| **Linearizability** | All of the above + real-time | — (strongest) |

---

## Exercises

### Exercise 1: Identify Linearizability Violations

Given the following history, determine if it is linearizable:

```
Client A: |── write(x=1) ──|
Client B:          |── write(x=2) ──|
Client C:                               |── read(x) → 1 ──|
```

<details>
<summary>Solution</summary>

This history is **NOT linearizable**.

Since `write(x=2)` completes before `read(x)` starts, linearizability requires `read(x)` to return 2 (or a later value). Returning 1 violates real-time ordering because it reflects a state that was superseded before the read began.

</details>

### Exercise 2: Quorum Arithmetic

A system has $N = 7$ replicas. What are the minimum values of $W$ and $R$ to guarantee linearizable reads (assuming proper implementation)?

<details>
<summary>Solution</summary>

We need $W + R > N$, so $W + R > 7$.

Common configurations:
- $W = 4, R = 4$ (balanced)
- $W = 5, R = 3$ (write-heavy optimization)
- $W = 3, R = 5$ (read-heavy optimization)

Any combination where $W + R \geq 8$ ensures quorum intersection. Note: quorum intersection is necessary but not sufficient — you also need proper conflict resolution and read-repair.

</details>

### Exercise 3: Design Decision

You are building a distributed counter that tracks ad impressions. The counter is incremented millions of times per second across 5 datacenters. Do you need linearizability? What consistency model would you choose?

<details>
<summary>Solution</summary>

**Linearizability is NOT needed** for this use case because:
- Approximate counts are acceptable for ad impressions
- The write rate makes consensus per-increment prohibitively expensive
- No operation depends on reading the exact current value

**Recommended approach**: Eventual consistency with CRDTs (G-Counter):
- Each datacenter maintains a local counter
- Counters merge using max per-node values
- Global count = sum of all node counters
- No coordination needed, scales linearly

Trade-off: counts may lag by seconds, but total is eventually accurate.

</details>

### Exercise 4: Jepsen History Analysis

```
Process 0: invoke write(1)
Process 1: invoke read()
Process 0: ok write(1)
Process 1: ok read() → nil
Process 2: invoke read()
Process 2: ok read() → 1
```

Is this history linearizable? Find a valid linearization or prove it is not.

<details>
<summary>Solution</summary>

This history **IS linearizable**. A valid linearization:

1. `Process 1: read() → nil` (linearization point before write)
2. `Process 0: write(1)` (linearization point during its execution window)
3. `Process 2: read() → 1` (linearization point after write)

This works because Process 1's read overlaps with Process 0's write — it is allowed to linearize before the write. Process 2's read starts after the write completes, so it must see 1 (which it does).

</details>

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Strong consistency | System behaves as single copy |
| Linearizability | Real-time ordering of operations |
| Sequential consistency | Total order without real-time constraint |
| Implementation | Single node, consensus, or quorums |
| CAP trade-off | Cannot have linearizability + availability during partition |
| Testing | Jepsen verifies linearizability under faults |
| Session guarantees | Weaker but cheaper alternatives |

Strong consistency is the gold standard for correctness but comes at the cost of performance and availability. Use it when **correctness is non-negotiable** (locks, financial data, unique constraints) and prefer weaker models when **approximate or eventual answers suffice** (analytics, caches, social feeds).

---

## Further Reading

- Herlihy & Wing, "Linearizability: A Correctness Condition for Concurrent Objects" (1990)
- Jepsen analyses: [jepsen.io/analyses](https://jepsen.io/analyses)
- Corbett et al., "Spanner: Google's Globally-Distributed Database" (2012)
- Kleppmann, *Designing Data-Intensive Applications*, Chapter 9
