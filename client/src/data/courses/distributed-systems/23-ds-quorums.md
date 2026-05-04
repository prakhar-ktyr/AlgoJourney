---
title: "Quorum Systems"
---

# Quorum Systems

A **quorum** is the minimum number of nodes that must participate in a distributed operation for it to be considered successful. Quorum systems provide a principled way to balance consistency, availability, and performance in replicated data stores.

---

## What Is a Quorum?

In a distributed system with $N$ replicas, a quorum is a subset of nodes whose agreement is required to complete a read or write operation. The key insight is that if read and write quorums **overlap**, every read is guaranteed to see the most recent write.

### Analogy

Think of a quorum like a voting system. If you need a majority to pass a law (write) and a majority to confirm it exists (read), at least one voter must have participated in both — guaranteeing the reader always finds the latest decision.

---

## Read/Write Quorums

In a system with $N$ replicas:

- **$W$** = number of nodes that must acknowledge a **write**
- **$R$** = number of nodes that must respond to a **read**

### The Fundamental Quorum Rule

$$
W + R > N
$$

This guarantees that the set of nodes involved in any write and any subsequent read must **overlap** by at least one node. That overlapping node has the latest value, ensuring the read returns fresh data.

### Why It Works

If $W + R > N$, then the write set and read set cannot be disjoint:

$$
|W \cap R| \geq W + R - N > 0
$$

At least one node in the read quorum participated in the most recent write — it can supply the latest value.

---

## Quorum Configurations

| Configuration | $W$ | $R$ | Property | Use Case |
|---|---|---|---|---|
| Majority | $\lceil(N+1)/2\rceil$ | $\lceil(N+1)/2\rceil$ | Balanced | General purpose |
| Read-heavy | $N$ | $1$ | Fast reads | Read-dominated workloads |
| Write-heavy | $1$ | $N$ | Fast writes | Write-dominated workloads |
| Read-one-write-all | $N$ | $1$ | Strongest read | Caching layers |
| Flexible | $2$ | $N-1$ | Tunable | Mixed workloads |

### Example: $N = 3$

| Config | $W$ | $R$ | $W + R$ | Overlap |
|---|---|---|---|---|
| Majority | 2 | 2 | 4 > 3 | ✓ |
| Read-optimized | 3 | 1 | 4 > 3 | ✓ |
| Write-optimized | 1 | 3 | 4 > 3 | ✓ |
| **Invalid** | 1 | 2 | 3 = 3 | ✗ |

---

## Strict Quorums

A **strict quorum** system enforces $W + R > N$ at all times. Every successful operation must contact the required number of nodes — if too many nodes are unavailable, the operation fails.

### Properties

- **Linearizability**: With proper conflict resolution, strict quorums can achieve linearizable reads and writes.
- **Availability trade-off**: If $N - W + 1$ or more nodes are down, writes are blocked. If $N - R + 1$ or more nodes are down, reads are blocked.

### Fault Tolerance

With strict quorums, the system can tolerate:

- Write failures of up to $N - W$ nodes
- Read failures of up to $N - R$ nodes
- Combined: up to $\min(N - W, N - R)$ failures without blocking either operation

For a majority quorum with $N = 5$, $W = R = 3$:

$$
\text{Tolerated failures} = N - W = 5 - 3 = 2
$$

---

## Sloppy Quorums

A **sloppy quorum** relaxes the strict requirement by allowing operations to succeed even when the designated nodes are unreachable. Writes can be sent to **any** $W$ reachable nodes, not necessarily the $N$ home nodes for that key.

### How Sloppy Quorums Work

```
Normal operation (strict):
  Key K → Nodes {A, B, C}   (N=3)
  Write to any W=2 of {A, B, C}

Network partition (sloppy):
  Node C unreachable
  Write to {A, B} ✓  (still strict, W=2 met)

  Nodes B and C unreachable:
  Write to {A, D, E}  ← D, E are NOT home nodes for K
  Sloppy quorum satisfied (W=2 of reachable nodes)
```

### Trade-off

| Aspect | Strict Quorum | Sloppy Quorum |
|---|---|---|
| Consistency | Strong (overlap guaranteed) | Weaker (overlap not guaranteed) |
| Availability | Lower during partitions | Higher during partitions |
| Durability | Guaranteed on home nodes | Temporarily on non-home nodes |
| Complexity | Simpler | Requires hinted handoff |

---

## Hinted Handoff

When a sloppy quorum writes to a non-home node, that node stores the data as a **hint** — a temporary record tagged with the intended destination.

### Mechanism

```
1. Client writes key K (home nodes: A, B, C)
2. Node C is unreachable → write goes to node D
3. Node D stores: {key: K, value: V, hint: "for node C"}
4. When C recovers, D sends the hinted data to C
5. D deletes the hint after confirmation
```

### Hinted Handoff Timeline

```
Time ─────────────────────────────────────────►

t0: C goes down
t1: Write to D (with hint for C)
t2: C recovers
t3: D sends hint to C
t4: D deletes hint
t5: System back to normal (K on A, B, C)
```

> **Note**: During the window between t1 and t3, a strict read quorum on {A, B, C} might miss the write stored on D. This is why sloppy quorums sacrifice consistency for availability.

---

## Quorum Math: Trade-offs

### Latency Analysis

The latency of a quorum operation is determined by the **slowest** responding node in the quorum set:

$$
\text{Latency}_{write} = \text{percentile}_{W}(\text{node latencies})
$$

$$
\text{Latency}_{read} = \text{percentile}_{R}(\text{node latencies})
$$

With $N = 5$ and $W = 3$: you wait for the 3rd-fastest response out of 5.

### Tuning for Workloads

**Read-heavy workload** (e.g., 95% reads):

$$
R = 1, \quad W = N \quad \Rightarrow \quad \text{Fast reads, slow writes}
$$

**Write-heavy workload** (e.g., 95% writes):

$$
W = 1, \quad R = N \quad \Rightarrow \quad \text{Fast writes, slow reads}
$$

**Balanced workload** (50/50):

$$
W = R = \lceil(N+1)/2\rceil \quad \Rightarrow \quad \text{Equal latency for both}
$$

### Availability vs Consistency Spectrum

```
More Available                          More Consistent
◄─────────────────────────────────────────────────────►
W=1, R=N          W=R=⌈(N+1)/2⌉          W=N, R=1
(sloppy quorum)   (majority quorum)       (read-one)
```

---

## Quorum Consistency Guarantees

Quorums alone do **not** guarantee linearizability. Additional mechanisms are needed:

### What Quorums Provide

1. **Overlap guarantee**: At least one node has seen the latest write
2. **No guarantee of recency**: The reader must identify which value is newest

### Achieving Strong Consistency

| Mechanism | Purpose |
|---|---|
| Version vectors | Detect concurrent writes |
| Timestamps (Lamport/vector) | Order writes |
| Read repair | Fix stale replicas during reads |
| Anti-entropy | Background synchronization |
| Last-writer-wins (LWW) | Simple conflict resolution |

### Read Repair

```javascript
async function quorumRead(key, R, N) {
  const responses = await queryNodes(key, N);
  const quorum = responses.slice(0, R);  // first R responses

  // Find the newest version
  const newest = quorum.reduce((a, b) =>
    a.version > b.version ? a : b
  );

  // Repair stale nodes (background)
  for (const resp of responses) {
    if (resp.version < newest.version) {
      repairNode(resp.node, key, newest);
    }
  }

  return newest.value;
}
```

---

## Dynamo-Style Quorums

Amazon's Dynamo (2007) popularized quorum-based replication with configurable $N$, $W$, $R$ per operation.

### Key Design Choices

1. **Consistent hashing** distributes keys to $N$ successor nodes on the ring
2. **Sloppy quorums** with hinted handoff for high availability
3. **Vector clocks** for versioning and conflict detection
4. **Client-side conflict resolution** (or LWW as default)

### Dynamo Configuration

```
┌─────────────────────────────────────────────┐
│           Dynamo-Style System                │
├─────────────────────────────────────────────┤
│  N = 3  (replication factor)                │
│  W = 2  (write quorum)                      │
│  R = 2  (read quorum)                       │
│  W + R = 4 > 3 = N  ✓                      │
├─────────────────────────────────────────────┤
│  Tolerates: 1 node failure for R/W          │
│  Conflict resolution: Vector clocks + LWW   │
│  Consistency: Eventual (default)            │
│  Anti-entropy: Merkle trees                 │
└─────────────────────────────────────────────┘
```

### Write Path

```
Client
  │
  ▼
Coordinator (any node)
  │
  ├──► Node A  ──► ACK ─┐
  ├──► Node B  ──► ACK ─┼──► W=2 ACKs received → SUCCESS
  └──► Node C  ──► ...   │
                          ▼
              Return success to client
```

---

## Flexible Quorums

Recent research shows that the constraint $W + R > N$ can be relaxed if we separate **write quorum intersection** from **read quorum intersection**.

### The Flexible Quorum Insight

Instead of requiring $W + R > N$, flexible quorums require:

$$
W_1 + W_2 > N \quad \text{(any two writes overlap)}
$$

This means writes always intersect with other writes — ensuring a total order can be established. Reads can then be served from **any single node** if we piggyback on the write ordering.

### Comparison

| Property | Classic Quorum | Flexible Quorum |
|---|---|---|
| Write-write overlap | $W + W > N$ (if $W > N/2$) | $W + W > N$ (enforced) |
| Write-read overlap | $W + R > N$ (enforced) | Not required |
| Read latency | Depends on $R$ | Can be $R = 1$ |
| Consistency model | Per-operation | Requires additional protocol |

---

## Grid Quorums

A **grid quorum** arranges $N$ nodes in a $\sqrt{N} \times \sqrt{N}$ grid. A write quorum is one full column plus one full row; a read quorum is one full row.

### Structure (N = 9)

```
     Col1  Col2  Col3
Row1 [ A ] [ B ] [ C ]
Row2 [ D ] [ E ] [ F ]
Row3 [ G ] [ H ] [ I ]

Write quorum: 1 full column + 1 node from each other row
  Example: {A, D, G} (col1) + {E} + {I} = 5 nodes

Read quorum: 1 full row
  Example: {A, B, C} = 3 nodes
```

### Grid Quorum Sizes

For an $n \times n$ grid ($N = n^2$ nodes):

$$
W = 2n - 1, \quad R = n
$$

$$
W + R = 3n - 1 > n^2 = N \quad \text{(for } n \geq 3\text{)}
$$

Wait — that's not quite right. Let's verify:

For $n = 3$: $W = 5$, $R = 3$, $W + R = 8 > 9$? No, $8 < 9$.

The correct grid quorum: write = full column ($n$ nodes), read = full row ($n$ nodes). Overlap is guaranteed because any column intersects any row at exactly one node:

$$
|W_{col} \cap R_{row}| = 1 \geq 1
$$

So $W = R = \sqrt{N}$, which is more efficient than majority quorums for large $N$:

| $N$ | Majority $W = R$ | Grid $W = R$ |
|---|---|---|
| 9 | 5 | 3 |
| 25 | 13 | 5 |
| 100 | 51 | 10 |

---

## Quorum Systems in Practice

### Apache Cassandra

```yaml
# cassandra.yaml (per keyspace)
replication_factor: 3    # N = 3

# Per-query consistency levels:
# ONE        → R=1 or W=1
# QUORUM     → R=⌈(N+1)/2⌉ = 2, W=2
# ALL        → R=N=3 or W=N=3
# LOCAL_QUORUM → majority in local datacenter
# EACH_QUORUM → majority in each datacenter
```

**Cassandra query example:**

```cql
-- Write with quorum consistency
INSERT INTO users (id, name, email)
VALUES (uuid(), 'Alice', 'alice@example.com')
USING CONSISTENCY QUORUM;

-- Read with quorum consistency
SELECT * FROM users WHERE id = ?
USING CONSISTENCY QUORUM;

-- Tune per-query for read-heavy table
SELECT * FROM cache_table WHERE key = ?
USING CONSISTENCY ONE;
```

### Amazon DynamoDB

DynamoDB uses quorums internally but abstracts them away:

| DynamoDB Mode | Equivalent | Guarantee |
|---|---|---|
| Eventually consistent read | $R = 1$ | May return stale data |
| Strongly consistent read | $R = 2$ (majority) | Returns latest write |
| Standard write | $W = 2$ (majority) | Durable on quorum |

### Riak

```erlang
%% Riak bucket properties
{n_val, 3},         %% N = 3 replicas
{r, quorum},        %% R = ⌈(N+1)/2⌉ = 2
{w, quorum},        %% W = ⌈(N+1)/2⌉ = 2
{pr, 1},            %% Primary read (strict, not sloppy)
{pw, 1},            %% Primary write (strict, not sloppy)
{dw, quorum}        %% Durable write quorum
```

---

## Practical: Configuring Quorums for Different Workloads

### Scenario 1: User Session Store (Read-Heavy)

```
Requirements:
- 99% reads, 1% writes
- Acceptable: slightly stale reads
- Priority: low read latency

Configuration:
  N = 3, W = 3, R = 1
  W + R = 4 > 3 ✓

  Read latency: fastest single node
  Write latency: slowest of all 3 nodes
  Fault tolerance (reads): 2 nodes can fail
  Fault tolerance (writes): 0 nodes can fail
```

### Scenario 2: Financial Ledger (Write-Heavy, Strong Consistency)

```
Requirements:
- 80% writes, 20% reads
- Must never lose a write
- Strong consistency required

Configuration:
  N = 5, W = 3, R = 3
  W + R = 6 > 5 ✓

  Write latency: 3rd-fastest of 5
  Read latency: 3rd-fastest of 5
  Fault tolerance: 2 nodes can fail for either operation
```

### Scenario 3: Social Media Feed (Availability-First)

```
Requirements:
- High availability, even during partitions
- Eventual consistency acceptable
- Mixed read/write workload

Configuration:
  N = 3, W = 1, R = 1 (sloppy quorum)
  W + R = 2 ≤ 3 (does NOT satisfy strict quorum!)

  This sacrifices consistency for availability.
  Use anti-entropy + read repair for convergence.
```

### Decision Matrix

```javascript
function selectQuorumConfig(workload) {
  const { readPercent, consistencyLevel, availabilityTarget } = workload;
  const N = workload.replicationFactor;

  if (consistencyLevel === "strong") {
    // Majority quorums
    const majority = Math.ceil((N + 1) / 2);
    return { N, W: majority, R: majority };
  }

  if (readPercent > 90) {
    // Optimize for reads
    return { N, W: N, R: 1 };
  }

  if (readPercent < 10) {
    // Optimize for writes
    return { N, W: 1, R: N };
  }

  if (availabilityTarget > 0.999) {
    // Sloppy quorum with low W and R
    return { N, W: 1, R: 1, sloppy: true };
  }

  // Default: majority
  const majority = Math.ceil((N + 1) / 2);
  return { N, W: majority, R: majority };
}
```

---

## Summary

| Concept | Key Point |
|---|---|
| Quorum rule | $W + R > N$ ensures read/write overlap |
| Strict quorum | Operations fail if quorum unmet |
| Sloppy quorum | Use non-home nodes for availability |
| Hinted handoff | Temporary storage for unavailable nodes |
| Read repair | Fix stale replicas opportunistically |
| Grid quorum | $O(\sqrt{N})$ quorum size |
| Flexible quorum | Relax $W + R > N$ with write-write overlap |

---

## Exercises

1. **Calculate quorum parameters**: For a system with $N = 7$ replicas, what are the minimum values of $W$ and $R$ to ensure strong consistency with a majority quorum? How many simultaneous node failures can the system tolerate?

2. **Design trade-off**: A system has $N = 5$, $W = 2$, $R = 2$. Does this satisfy the quorum intersection property? What consistency issues might arise?

3. **Sloppy quorum scenario**: Node C in a 3-node cluster goes down. A write with $W = 2$ is redirected to node D (not a home node). Describe the sequence of events when C recovers. What happens if D also fails before handoff?

4. **Grid quorum**: Design a grid quorum for $N = 16$ nodes. What are the read and write quorum sizes? Compare with a majority quorum for the same $N$.

5. **Real-world configuration**: You're designing a global e-commerce product catalog with:
   - 100:1 read-to-write ratio
   - 3 datacenters, 3 replicas per datacenter ($N = 9$)
   - Reads must complete in < 10ms (single datacenter)
   - Writes can take up to 200ms

   Propose $W$ and $R$ values and justify your choice. Would you use strict or sloppy quorums?

---

## Further Reading

- DeCandia et al., "Dynamo: Amazon's Highly Available Key-Value Store" (2007)
- Vukolic, "Quorum Systems: With Applications to Storage and Consensus" (2012)
- Howard et al., "Flexible Paxos: Quorum Intersection Revisited" (2016)
- Cassandra documentation on consistency levels
- Kleppmann, "Designing Data-Intensive Applications" — Chapter 5
