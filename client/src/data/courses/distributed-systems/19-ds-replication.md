---
title: "Data Replication Strategies"
---

# Data Replication Strategies

Replication means keeping copies of the same data on multiple machines connected via a network. It is one of the most fundamental techniques in distributed systems for achieving fault tolerance, scalability, and low latency.

---

## Why Replicate Data?

| Goal | Explanation |
|------|-------------|
| **Fault tolerance** | If one node fails, others can continue serving requests |
| **Read scalability** | Distribute read load across multiple replicas |
| **Geographic locality** | Place data closer to users to reduce latency |
| **High availability** | System remains operational even during partial failures |

Without replication, a single node failure means data loss or unavailability. With $n$ replicas, the system can tolerate up to $n - 1$ failures (depending on the protocol).

---

## Replication Architectures Overview

There are three main approaches to replicating data across nodes:

```
┌─────────────────────────────────────────────────────┐
│           Replication Architectures                  │
├─────────────────┬──────────────────┬────────────────┤
│  Single-Leader  │  Multi-Leader    │  Leaderless    │
│  (Primary-      │  (Active-Active) │  (Dynamo-      │
│   Backup)       │                  │   style)       │
└─────────────────┴──────────────────┴────────────────┘
```

| Architecture | Writes handled by | Conflict handling | Example systems |
|---|---|---|---|
| Single-leader | One designated node | No write conflicts | PostgreSQL, MySQL, MongoDB |
| Multi-leader | Multiple designated nodes | Must resolve conflicts | CockroachDB, Cassandra (multi-DC) |
| Leaderless | Any node | Quorum-based resolution | Amazon DynamoDB, Riak, Cassandra |

---

## Single-Leader Replication

### How It Works

1. One replica is designated the **leader** (primary/master)
2. All writes go to the leader
3. The leader sends a **replication stream** to followers (secondaries/replicas)
4. Followers apply changes in the same order as the leader

```
Client Write Request
        │
        ▼
   ┌─────────┐    Replication Log
   │  Leader  │ ──────────────────┐
   └─────────┘                    │
        │                         │
        ▼                         ▼
   ┌──────────┐            ┌──────────┐
   │Follower 1│            │Follower 2│
   └──────────┘            └──────────┘
```

### Synchronous vs Asynchronous Replication

**Synchronous replication:**
- Leader waits for follower acknowledgment before confirming write
- Guarantees follower has up-to-date copy
- Increases write latency

**Asynchronous replication:**
- Leader confirms write immediately after local persistence
- Followers replicate in the background
- Lower latency but risk of data loss on leader failure

```javascript
// Pseudocode: Synchronous replication
async function handleWrite(data) {
  await leader.write(data);
  // Wait for ALL followers to acknowledge
  await Promise.all(followers.map(f => f.replicate(data)));
  return { status: "committed" };
}

// Pseudocode: Asynchronous replication
async function handleWrite(data) {
  await leader.write(data);
  // Fire-and-forget to followers
  followers.forEach(f => f.replicate(data));
  return { status: "committed" };
}
```

**Semi-synchronous** is a common compromise: one follower is synchronous (guaranteeing at least one backup), while others are asynchronous.

### Read Replicas

Followers can serve read requests to distribute load:

$$\text{Read Throughput} = \text{Leader Throughput} + \sum_{i=1}^{n} \text{Follower}_i\text{ Throughput}$$

However, reading from followers introduces **replication lag** — a follower may return stale data if it hasn't yet applied recent writes.

### Failover

When the leader fails, one follower must be promoted:

1. **Detect failure** — Usually via timeout (heartbeat missed for $t$ seconds)
2. **Choose new leader** — Follower with most up-to-date data, or via consensus
3. **Reconfigure system** — Clients redirect writes to new leader, other followers follow new leader

**Failover pitfalls:**

| Problem | Description |
|---------|-------------|
| Split-brain | Two nodes both believe they are leader |
| Lost writes | Async followers may lack recent writes from old leader |
| Stale reads | Clients reading from old leader that is now a follower |
| ID conflicts | New leader may reuse auto-increment IDs from lost writes |

---

## Multi-Leader Replication

### When to Use Multi-Leader

- **Multi-datacenter operation** — Each datacenter has its own leader for low-latency local writes
- **Offline clients** — Each device acts as a leader (e.g., calendar apps)
- **Collaborative editing** — Multiple users edit the same document concurrently

```
Datacenter A              Datacenter B
┌──────────┐              ┌──────────┐
│ Leader A │◄────────────►│ Leader B │
│          │  Async       │          │
│Follower  │  Replication │Follower  │
│Follower  │              │Follower  │
└──────────┘              └──────────┘
```

### Conflict Resolution

With multiple leaders accepting writes concurrently, **write conflicts** are inevitable:

```
Timeline:
  User A (Leader 1): UPDATE title = "A" WHERE id = 1   (t=1)
  User B (Leader 2): UPDATE title = "B" WHERE id = 1   (t=1)
  
  Both succeed locally → Conflict detected during replication
```

**Conflict resolution strategies:**

| Strategy | Description | Trade-off |
|----------|-------------|-----------|
| Last-writer-wins (LWW) | Highest timestamp wins | Simple but lossy — discards concurrent writes |
| Merge values | Combine conflicting values (e.g., union of sets) | Application-specific logic required |
| Custom handler | Application code resolves on read or write | Most flexible, most complex |
| CRDTs | Conflict-free replicated data types | Automatic resolution for supported types |

**Last-Writer-Wins with Lamport timestamps:**

$$\text{Winner} = \arg\max_{w \in \text{conflicts}} \text{timestamp}(w)$$

> ⚠️ LWW achieves convergence but at the cost of durability — some acknowledged writes are silently dropped.

---

## Leaderless Replication (Dynamo-Style)

### Core Concept

Any replica can accept writes directly. The client sends writes to multiple replicas in parallel and reads from multiple replicas to detect stale values.

```
         Client
        /  |  \
       ▼   ▼   ▼
   ┌───┐ ┌───┐ ┌───┐
   │ A │ │ B │ │ C │
   └───┘ └───┘ └───┘
   
   Write to all, read from multiple
```

### Read and Write Quorums

For a system with $n$ replicas:
- **Write quorum** $w$: number of nodes that must acknowledge a write
- **Read quorum** $r$: number of nodes that must respond to a read

The fundamental quorum condition:

$$w + r > n$$

This guarantees that any read will overlap with at least one node that has the latest write.

**Common configurations:**

| $n$ | $w$ | $r$ | Properties |
|-----|-----|-----|------------|
| 3 | 2 | 2 | Balanced read/write performance |
| 3 | 3 | 1 | Fast reads, slow writes |
| 3 | 1 | 3 | Fast writes, slow reads |
| 5 | 3 | 3 | Higher fault tolerance |

**Example:** With $n=3, w=2, r=2$:

```javascript
// Write operation
async function quorumWrite(key, value, replicas) {
  const n = replicas.length;  // 3
  const w = 2;  // write quorum

  const results = await Promise.allSettled(
    replicas.map(r => r.write(key, value))
  );
  
  const acks = results.filter(r => r.status === "fulfilled").length;
  
  if (acks >= w) {
    return { status: "success", acks };
  } else {
    throw new Error(`Quorum not reached: ${acks}/${w}`);
  }
}

// Read operation - return value with highest version
async function quorumRead(key, replicas) {
  const r = 2;  // read quorum
  
  const responses = await Promise.allSettled(
    replicas.map(node => node.read(key))
  );
  
  const successful = responses
    .filter(res => res.status === "fulfilled")
    .map(res => res.value);
  
  if (successful.length >= r) {
    // Return the value with the highest version number
    return successful.reduce((latest, current) =>
      current.version > latest.version ? current : latest
    );
  }
  throw new Error("Read quorum not reached");
}
```

### Sloppy Quorums and Hinted Handoff

In a strict quorum, if fewer than $w$ of the designated nodes are reachable, writes fail. **Sloppy quorums** relax this:

- Writes can be accepted by *any* $w$ reachable nodes (even non-designated ones)
- The receiving node stores the write with a **hint** indicating the intended recipient
- When the intended node comes back online, the data is **handed off** to it

```
Normal:    Write → [Node1, Node2, Node3]  (designated)

Node3 down, sloppy quorum:
           Write → [Node1, Node2, Node4]  (Node4 accepts with hint)

Node3 recovers:
           Node4 → hands off data → Node3
           Node4 deletes the hinted copy
```

> Sloppy quorums increase write availability but do **not** guarantee the quorum condition $w + r > n$ for reads from the designated nodes.

### Anti-Entropy

Over time, replicas can diverge. **Anti-entropy** is the background process that detects and repairs inconsistencies:

**Read repair:**
- During a quorum read, if stale values are detected, the client writes the latest value back to out-of-date replicas

**Merkle trees (hash trees):**
- Each replica maintains a Merkle tree of its data
- Replicas compare tree roots — if they differ, they recursively compare subtrees to find divergent keys

```
        Root Hash
       /         \
   Hash(L)      Hash(R)
   /    \       /    \
 H(A)  H(B)  H(C)  H(D)
  |      |     |      |
Key A  Key B  Key C  Key D
```

If `Root Hash` differs between two replicas, they compare children until they find exactly which keys are inconsistent — requiring only $O(\log n)$ comparisons.

---

## Replication Lag and Its Effects

Asynchronous replication introduces a delay between a write on the leader and its visibility on followers. This **replication lag** causes several anomalies:

### Read-After-Write Inconsistency

A user writes data, then reads from a follower that hasn't received the update yet:

```
User writes → Leader (success)
User reads  → Follower (stale — write not yet replicated)
```

**Solution:** Read-your-writes consistency — route reads for recently-written data to the leader.

### Monotonic Read Violations

A user reads from a fresh replica, then reads from a stale replica and sees older data:

```
Read 1 → Follower A (version 5) ✓
Read 2 → Follower B (version 3) — time appears to go backward!
```

**Solution:** Pin each user's reads to the same replica (session stickiness).

### Consistent Prefix Violations

Causally related writes appear out of order:

```
Leader:     A: "What's the score?"  →  B: "It's 2-1"
Follower:   B: "It's 2-1"  →  A: "What's the score?"  (wrong order!)
```

**Solution:** Track causal dependencies and ensure followers apply writes in causal order.

### Quantifying Replication Lag

$$\text{Lag} = t_{\text{follower apply}} - t_{\text{leader commit}}$$

Typical values:
- Same-datacenter: 1–100 ms
- Cross-datacenter: 100 ms – several seconds
- Under heavy load: seconds to minutes

---

## State Machine Replication

State Machine Replication (SMR) is a more rigorous approach where every replica is a deterministic state machine that processes the same sequence of commands:

$$S_{i+1} = \text{apply}(S_i, \text{command}_{i+1})$$

If all replicas start from the same initial state $S_0$ and apply the same commands in the same order, they all reach the same final state.

```
Command Log (total order):
  cmd1 → cmd2 → cmd3 → cmd4 → ...

Replica A:  S0 → S1 → S2 → S3 → S4
Replica B:  S0 → S1 → S2 → S3 → S4
Replica C:  S0 → S1 → S2 → S3 → S4

All replicas are identical!
```

**Requirements for SMR:**
1. **Total order broadcast** — All replicas receive commands in the same order
2. **Deterministic execution** — Same input always produces same output
3. **Consensus** — Nodes agree on the order (typically via Raft or Paxos)

**Comparison with leader-based replication:**

| Aspect | Leader-Based | State Machine Replication |
|--------|-------------|--------------------------|
| Ordering | Leader determines order | Consensus determines order |
| Consistency | Eventual (async) or linearizable (sync) | Linearizable |
| Performance | Higher throughput (single writer) | Lower throughput (consensus overhead) |
| Fault tolerance | Requires failover | Automatic with consensus |

---

## Practical Considerations

### Choosing a Replication Strategy

| Factor | Single-Leader | Multi-Leader | Leaderless |
|--------|--------------|-------------|------------|
| Write latency | Low (one node) | Low (local leader) | Moderate (quorum) |
| Read scalability | High (add followers) | High | High |
| Write availability | Leader is SPOF | Tolerates DC failure | Tolerates minority failure |
| Consistency | Strong possible | Eventual | Eventual (tunable) |
| Complexity | Low | High (conflicts) | Medium |
| Best for | Most applications | Multi-DC, offline | High availability, low latency |

### Replication in Practice

```javascript
// MongoDB replica set configuration
const config = {
  _id: "myReplicaSet",
  members: [
    { _id: 0, host: "node1:27017", priority: 2 },  // Preferred primary
    { _id: 1, host: "node2:27017", priority: 1 },
    { _id: 2, host: "node3:27017", priority: 1 },
  ],
  settings: {
    getLastErrorDefaults: { w: "majority", wtimeout: 5000 }
  }
};

// Write with write concern
await collection.insertOne(
  { name: "Alice", balance: 100 },
  { writeConcern: { w: "majority", j: true } }
);

// Read from secondary with max staleness
await collection.find({}).readPref("secondary", [
  { maxStalenessSeconds: 10 }
]);
```

### Monitoring Replication Health

Key metrics to track:

| Metric | Description | Alert threshold |
|--------|-------------|-----------------|
| Replication lag | Seconds behind leader | > 30s |
| Replication throughput | Ops/second replicated | Sustained drop > 50% |
| Follower status | Connected/disconnected | Any disconnection |
| Write concern errors | Failed quorum writes | Any occurrence |

---

## Summary

| Concept | Key Takeaway |
|---------|-------------|
| Replication purpose | Fault tolerance, scalability, locality |
| Single-leader | Simple, strong consistency possible, leader is SPOF |
| Multi-leader | Multi-DC writes, must handle conflicts |
| Leaderless | High availability via quorums, tunable consistency |
| Quorum condition | $w + r > n$ guarantees overlap |
| Replication lag | Causes read anomalies in async systems |
| State machine replication | Strongest guarantee via consensus |
| Sloppy quorum | Trades consistency for availability |
| Anti-entropy | Background repair of divergent replicas |

---

## Exercises

1. **Quorum Calculation:** A system has $n = 5$ replicas. You need to tolerate 2 node failures for both reads and writes. What values of $w$ and $r$ would you choose? Verify that $w + r > n$.

2. **Conflict Resolution:** Two users simultaneously update the same record in a multi-leader setup:
   - Leader A: `SET balance = balance - 50` (at timestamp 100)
   - Leader B: `SET balance = balance + 30` (at timestamp 101)
   
   What happens with LWW? Design a better resolution strategy.

3. **Failover Analysis:** A single-leader system uses asynchronous replication. The leader has processed writes up to LSN (Log Sequence Number) 1000, but the most up-to-date follower has only applied up to LSN 985. If the leader fails now, what are the implications?

4. **System Design:** You are building a global e-commerce platform with datacenters in US, EU, and Asia. Users should see their own writes immediately. Which replication architecture would you choose, and how would you handle:
   - Product catalog reads
   - Shopping cart updates
   - Order placement

5. **Anti-Entropy:** Two replicas have the following key-value pairs:
   ```
   Replica A: {a:1, b:2, c:3, d:4}
   Replica B: {a:1, b:5, c:3, e:6}
   ```
   Describe step-by-step how a Merkle tree comparison would identify the differences. How many hash comparisons are needed?
