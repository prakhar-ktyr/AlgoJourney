---
title: "Chain Replication"
---

# Chain Replication

Chain replication is a replication protocol that provides **strong consistency** and **high throughput** by organizing replica nodes into a linear chain. It simplifies the design of fault-tolerant storage systems while achieving excellent performance.

---

## What is Chain Replication?

Chain replication is a technique for replicating data across multiple servers arranged in a **sequential chain**. It was introduced by Robbert van Renesse and Fred B. Schneider in 2004 as an alternative to quorum-based and leader-based replication protocols.

The key idea is simple: arrange replicas in a linear order and route writes through the chain from head to tail, while reads are served exclusively by the tail.

### Core Properties

| Property | Description |
|----------|-------------|
| **Strong Consistency** | Linearizable reads and writes |
| **High Throughput** | Separates read and write workloads |
| **Simplicity** | Straightforward failure handling |
| **Ordered Updates** | All replicas see updates in the same order |

### Formal Definition

Given a chain of $n$ replicas $R_1, R_2, \ldots, R_n$:

- $R_1$ is the **head** (accepts writes)
- $R_n$ is the **tail** (serves reads)
- $R_i$ for $1 < i < n$ are **middle nodes** (forward updates)

A write $w$ is considered **committed** only when it reaches $R_n$.

---

## Architecture

Chain replication organizes nodes into three distinct roles:

```
┌──────┐     ┌────────┐     ┌────────┐     ┌──────┐
│ HEAD │────▶│ MIDDLE │────▶│ MIDDLE │────▶│ TAIL │
│  R₁  │     │   R₂   │     │   R₃   │     │  R₄  │
└──────┘     └────────┘     └────────┘     └──────┘
   ▲                                           ▲
   │                                           │
 Writes                                      Reads
```

### Head Node

The head is the **entry point for all write operations**:

- Receives client write requests
- Applies the update locally
- Forwards the update to the next node in the chain
- Does **not** send acknowledgments to clients

```javascript
// Head node pseudocode
class HeadNode {
  constructor(next) {
    this.next = next;
    this.store = new Map();
    this.pendingWrites = [];
  }

  handleWrite(key, value, requestId) {
    // Apply locally
    this.store.set(key, value);
    this.pendingWrites.push(requestId);

    // Forward to next node in chain
    this.next.propagate(key, value, requestId);
  }
}
```

### Middle Nodes

Middle nodes act as **relay and storage nodes**:

- Receive updates from the predecessor
- Apply the update locally
- Forward the update to the successor
- Do not interact with clients directly

```javascript
// Middle node pseudocode
class MiddleNode {
  constructor(next) {
    this.next = next;
    this.store = new Map();
  }

  propagate(key, value, requestId) {
    // Apply locally
    this.store.set(key, value);

    // Forward to next node
    this.next.propagate(key, value, requestId);
  }
}
```

### Tail Node

The tail is the **only node that serves reads** and **acknowledges writes**:

- Receives propagated updates from the predecessor
- Applies the update locally
- Sends acknowledgment back to the client
- Serves all read requests

```javascript
// Tail node pseudocode
class TailNode {
  constructor() {
    this.store = new Map();
  }

  propagate(key, value, requestId) {
    // Apply locally — write is now committed
    this.store.set(key, value);

    // Acknowledge to client
    this.sendAck(requestId);
  }

  handleRead(key) {
    // Reads always reflect committed state
    return this.store.get(key);
  }
}
```

---

## Write Path: Head → Middle → Tail

The write path flows linearly through the chain:

```
Client          Head          Middle₁       Middle₂        Tail
  │               │              │              │             │
  │──write(k,v)─▶│              │              │             │
  │               │──propagate──▶│              │             │
  │               │              │──propagate──▶│             │
  │               │              │              │──propagate─▶│
  │               │              │              │             │
  │◀──────────────────────────── ack ────────────────────────│
```

### Write Latency

The write latency is the sum of propagation delays across the entire chain:

$$T_{write} = \sum_{i=1}^{n-1} d(R_i, R_{i+1})$$

where $d(R_i, R_{i+1})$ is the network delay between consecutive nodes.

For a chain of length $n$ with uniform network delay $d$:

$$T_{write} = (n - 1) \cdot d$$

### Write Throughput

Despite sequential propagation, write throughput can be high because:

1. **Pipelining**: Multiple writes can be in-flight simultaneously
2. Each node processes one write at a time, but different writes occupy different stages

The maximum write throughput is:

$$\text{Throughput}_{write} = \frac{1}{\max(T_{head}, T_{middle}, T_{tail})}$$

where $T_x$ is the processing time at each node.

---

## Read Path: Tail Only

Reads are served **exclusively by the tail node**:

```
Client          Tail
  │               │
  │──read(k)────▶│
  │               │
  │◀──value(v)───│
```

### Why Only the Tail?

The tail holds the **last committed state**. Since updates flow sequentially and a write is only committed once it reaches the tail:

- Any value at the tail is guaranteed to reflect all committed writes
- This provides **linearizability** without coordination
- No read quorums or version checks are needed

### Read Throughput

$$\text{Throughput}_{read} = \frac{1}{T_{tail\_read}}$$

The tail can serve reads at its full local read capacity since it never needs to coordinate with other nodes.

---

## Advantages

### 1. Strong Consistency

Chain replication provides **linearizability** — the strongest single-object consistency guarantee:

| Guarantee | How Chain Replication Achieves It |
|-----------|-----------------------------------|
| All reads see latest write | Reads served only by tail (commit point) |
| Write ordering | Sequential propagation ensures total order |
| No stale reads | Tail state = committed state |
| No phantom reads | Single read endpoint eliminates divergence |

### 2. Simplicity

Compared to Paxos or Raft:

- No leader election within the chain
- No voting or quorum logic
- No log reconciliation between replicas
- Failure handling is straightforward (see below)

### 3. High Throughput

The separation of read and write endpoints allows:

- **Write load** distributed across all nodes (pipelining)
- **Read load** concentrated at the tail (no coordination overhead)
- In practice, read throughput is limited only by the tail's capacity

### 4. Separation of Concerns

```
┌─────────────────────────────────────────────────┐
│              Chain Replication                    │
├─────────────────────────────────────────────────┤
│  Writes: Head handles admission control          │
│  Propagation: Middle nodes handle durability     │
│  Reads + Commits: Tail handles consistency       │
└─────────────────────────────────────────────────┘
```

---

## Failure Handling

Chain replication requires an external **configuration manager** (sometimes called a master or control plane) that monitors node health and reconfigures the chain on failures.

### Head Failure

When the head fails:

1. Configuration manager detects the failure
2. The **next node** (first middle node) becomes the new head
3. No data is lost — pending uncommitted writes are simply retried by the client

```
Before:  [HEAD*] → [M₁] → [M₂] → [TAIL]
                     ↓
After:           [HEAD] → [M₂] → [TAIL]
                  (was M₁)
```

**Key insight**: Uncommitted writes (those that haven't reached the tail) may be lost, but this is safe because clients haven't received acknowledgment.

### Tail Failure

When the tail fails:

1. Configuration manager detects the failure
2. The **predecessor** of the old tail becomes the new tail
3. All committed writes are safe (they were propagated through the chain)
4. Writes in-flight between the old predecessor and old tail are now committed at the new tail

```
Before:  [HEAD] → [M₁] → [M₂] → [TAIL*]
                            ↓
After:   [HEAD] → [M₁] → [TAIL]
                          (was M₂)
```

**Key insight**: The new tail may have slightly fewer writes than the old tail had at the moment of failure, but since those writes hadn't been acknowledged, clients will retry them.

### Middle Node Failure

When a middle node fails:

1. Configuration manager detects the failure
2. The predecessor of the failed node is linked to the successor
3. The predecessor **replays** any updates that the failed node may not have forwarded

```
Before:  [HEAD] → [M₁*] → [M₂] → [TAIL]
                     ↓
After:   [HEAD] ──────────▶ [M₂] → [TAIL]
```

**Recovery logic**: The predecessor keeps a log of sent updates. After reconfiguration, it replays updates from the point where the successor last acknowledged receipt.

```javascript
// Predecessor recovery after middle node failure
class NodeWithRecovery {
  constructor() {
    this.sentLog = []; // Track forwarded updates
  }

  onSuccessorChange(newSuccessor, lastAckedSeq) {
    // Replay updates the new successor hasn't seen
    for (const update of this.sentLog) {
      if (update.seq > lastAckedSeq) {
        newSuccessor.propagate(update.key, update.value, update.requestId);
      }
    }
  }
}
```

---

## Chain Replication vs Leader-Based Replication

| Aspect | Chain Replication | Leader-Based (e.g., Raft) |
|--------|-------------------|---------------------------|
| **Write path** | Sequential: head → tail | Leader broadcasts to followers |
| **Read path** | Tail only | Leader only (or read leases) |
| **Write latency** | $O(n)$ hops | $O(1)$ broadcast + majority ack |
| **Read latency** | Single hop to tail | Single hop to leader |
| **Throughput** | High (pipelined, separated R/W) | Moderate (leader bottleneck) |
| **Consistency** | Linearizable by design | Linearizable with care |
| **Failure handling** | Chain reconfiguration | Leader election |
| **Complexity** | Low | Moderate to high |
| **Network usage** | Each update sent once per hop | Leader sends to all followers |

### When to Choose Chain Replication

- Read-heavy workloads (tail handles all reads)
- Need for simple strong consistency
- Workloads where write latency tolerance is higher
- Systems where pipelining can saturate throughput

### When to Choose Leader-Based

- Write-latency-sensitive workloads
- Need for faster failover
- Highly dynamic membership changes
- Workloads requiring flexible quorum sizes

---

## CRAQ: Chain Replication with Apportioned Queries

**CRAQ** (Chain Replication with Apportioned Queries) extends chain replication to allow **reads from any node** while preserving strong consistency.

### The Problem with Basic Chain Replication

In basic chain replication, the tail is the **read bottleneck**. As read load increases, the tail becomes a single point of contention.

### CRAQ Solution: Dirty and Clean Reads

CRAQ introduces the concept of **clean** and **dirty** versions:

```javascript
class CRAQNode {
  constructor() {
    // Each key stores a list of versions
    this.versions = new Map(); // key → [{value, committed: bool}]
  }

  propagate(key, value, requestId) {
    // Mark new version as dirty (uncommitted)
    this.addVersion(key, { value, committed: false });
    this.next.propagate(key, value, requestId);
  }

  markCommitted(key, version) {
    // Tail sends back commit notification
    this.setCommitted(key, version);
    // Clean up older versions
    this.gcOldVersions(key, version);
  }

  handleRead(key) {
    const versions = this.versions.get(key);
    const latest = versions[versions.length - 1];

    if (latest.committed) {
      // Clean read — return immediately
      return latest.value;
    } else {
      // Dirty — ask the tail for the committed version
      return this.queryTail(key);
    }
  }
}
```

### CRAQ Read Modes

| Mode | Behavior | Consistency |
|------|----------|-------------|
| **Strong** | If latest version is dirty, query tail | Linearizable |
| **Eventual** | Always return latest local version | Eventual consistency |
| **Bounded** | Return local if within staleness bound | Bounded staleness |

### CRAQ Performance

For read-heavy workloads with $n$ nodes:

$$\text{Throughput}_{CRAQ} \approx n \cdot \text{Throughput}_{tail}$$

This is because reads are distributed across all nodes (when versions are clean).

### Commit Notification Flow

```
Write:    HEAD → M₁ → M₂ → TAIL
Commit:   HEAD ← M₁ ← M₂ ← TAIL (commit notification)
```

After the tail commits a write, it sends a **commit notification** back through the chain, allowing each node to mark its version as clean.

---

## Microsoft Azure Storage and Chain Replication

Microsoft Azure Storage uses a variant of chain replication in its **stream layer** for intra-stamp replication.

### Azure Storage Architecture

```
┌─────────────────────────────────────────┐
│           Azure Storage Stamp            │
├─────────────────────────────────────────┤
│  Front-End Layer (load balancing)        │
│  Partition Layer (indexing, caching)     │
│  Stream Layer (chain replication)        │
│  ┌───────┐   ┌───────┐   ┌───────┐     │
│  │Extent │──▶│Extent │──▶│Extent │     │
│  │Node 1 │   │Node 2 │   │Node 3 │     │
│  └───────┘   └───────┘   └───────┘     │
└─────────────────────────────────────────┘
```

### Key Design Choices in Azure

| Feature | Azure's Approach |
|---------|-----------------|
| Chain length | Typically 3 replicas |
| Write acknowledgment | After all replicas confirm |
| Failure detection | Distributed lease mechanism |
| Recovery | Extent sealing + re-replication |
| Consistency | Strong within a stamp |

### Why Azure Chose Chain Replication

1. **Predictable latency**: Sequential propagation has bounded latency
2. **Network efficiency**: Each byte transmitted exactly twice (receive + send)
3. **CPU efficiency**: No voting or consensus protocol overhead
4. **Simplicity**: Easier to debug and operate at scale

---

## Comparison with Raft/Paxos

### Protocol Mechanics

| Mechanism | Chain Replication | Raft | Paxos |
|-----------|-------------------|------|-------|
| **Agreement** | Sequential propagation | Log replication + commit index | Prepare/Accept phases |
| **Message complexity (write)** | $O(n)$ sequential | $O(n)$ parallel | $O(n)$ parallel (2 rounds) |
| **Commit condition** | Reaches tail | Majority acknowledge | Majority accept |
| **Leader/head election** | External config manager | Internal (RequestVote) | External or internal |
| **Read optimization** | Tail serves reads | Read leases / read index | Read quorums |

### Failure Tolerance

For $n$ replicas:

- **Chain Replication**: Tolerates $n - 1$ failures (any single failure is recoverable)
- **Raft/Paxos**: Tolerates $\lfloor (n-1)/2 \rfloor$ failures (need majority)

However, chain replication requires an **available configuration manager** — itself often implemented using Paxos or Raft.

### Latency Comparison

For $n = 5$ replicas with uniform network delay $d$:

$$T_{chain} = 4d \quad \text{(sequential: 4 hops)}$$

$$T_{raft} = d \quad \text{(parallel broadcast, wait for majority)}$$

$$T_{paxos} = 2d \quad \text{(two round trips to majority)}$$

### Throughput Comparison (Pipelined)

With pipelining and high load:

$$\text{Throughput}_{chain} \approx \frac{1}{T_{node}} \quad \text{(limited by slowest node)}$$

$$\text{Throughput}_{raft} \approx \frac{1}{(n-1) \cdot T_{leader\_send}} \quad \text{(leader fan-out bottleneck)}$$

Chain replication can achieve **higher sustained throughput** because the write load is distributed across the chain rather than concentrated at a single leader.

---

## Performance Analysis

### Throughput Model

Let:
- $\mu$ = processing rate of each node (ops/sec)
- $n$ = chain length
- $r$ = fraction of operations that are reads

**Basic Chain Replication:**

$$\text{Max throughput} = \min\left(\mu, \frac{\mu}{1 - r}\right)$$

The tail is the bottleneck since it handles all reads plus write commits.

**CRAQ:**

$$\text{Max throughput} \approx n \cdot \mu \cdot r + \mu \cdot (1 - r)$$

Reads scale with $n$ while writes remain limited by per-node capacity.

### Latency Distribution

Write latency follows a **sum of exponentials** if network delays are exponentially distributed:

$$f_{T_{write}}(t) = \text{Erlang}(n-1, \lambda)$$

where $\lambda$ is the rate parameter of network delay.

The expected write latency:

$$E[T_{write}] = \frac{n-1}{\lambda}$$

The variance:

$$\text{Var}(T_{write}) = \frac{n-1}{\lambda^2}$$

### Bandwidth Utilization

Each node uses bandwidth for:
- Receiving from predecessor: $B_{in}$
- Sending to successor: $B_{out}$

Total network bandwidth per write:

$$B_{total} = 2(n-1) \cdot S$$

where $S$ is the size of each update. Compare with leader-based:

$$B_{leader} = 2(n-1) \cdot S$$

Both use the same total bandwidth, but chain replication distributes it evenly.

### Benchmark Results (Typical)

| Metric | Chain (n=3) | Raft (n=3) | CRAQ (n=3) |
|--------|-------------|------------|------------|
| Write latency (ms) | 2.1 | 1.2 | 2.1 |
| Read latency (ms) | 0.5 | 0.5 | 0.5 |
| Write throughput (Kops/s) | 85 | 65 | 85 |
| Read throughput (Kops/s) | 120 | 120 | 340 |
| Read throughput at 95% reads | 120 | 120 | 340 |

*Note: Numbers are illustrative; actual performance depends on hardware and workload.*

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Architecture | Linear chain: head → middle → tail |
| Write path | Head receives, propagates sequentially to tail |
| Read path | Tail only (committed state) |
| Consistency | Linearizable by construction |
| Head failure | Next node becomes head |
| Tail failure | Predecessor becomes tail |
| Middle failure | Skip failed node, replay pending updates |
| CRAQ | Allows reads from any node (dirty/clean mechanism) |
| Azure Storage | Uses chain replication in stream layer |
| vs Raft/Paxos | Higher throughput, higher write latency |
| Best for | Read-heavy, strong consistency, simple operations |

---

## Exercises

1. **Chain Length Trade-off**: A system has 5 nodes in a chain with 1ms inter-node latency. Calculate the write latency. If you reduce the chain to 3 nodes, what is the new write latency? What do you lose by shortening the chain?

2. **CRAQ Clean Read Ratio**: In a CRAQ system with 100 writes/sec and an average commit notification propagation time of 5ms across 5 nodes, estimate what fraction of reads at middle nodes will be "dirty" (requiring a tail query) vs "clean."

3. **Failure Scenario**: Consider a chain `[H] → [M₁] → [M₂] → [T]`. Node M₁ fails after forwarding a write to M₂ but before acknowledging receipt to H. Describe the recovery steps. Will the write be committed? Will it be duplicated?

4. **Throughput Calculation**: A chain of 3 nodes each processes 100K ops/sec. The workload is 80% reads, 20% writes. Calculate the maximum throughput for (a) basic chain replication and (b) CRAQ.

5. **Design Challenge**: You need to build a strongly consistent key-value store that handles 1M reads/sec and 100K writes/sec with 3-way replication. Would you choose chain replication, CRAQ, or Raft? Justify your answer with throughput calculations.

6. **Azure-Style Sealing**: In Azure Storage, when a chain member fails, the extent is "sealed" (made immutable) and a new extent is created. Why is sealing beneficial compared to in-place chain repair? What are the trade-offs?
