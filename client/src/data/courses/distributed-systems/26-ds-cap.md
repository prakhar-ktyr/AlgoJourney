---
title: "CAP Theorem and PACELC"
---

# CAP Theorem and PACELC

The CAP theorem is one of the most fundamental results in distributed systems theory. It defines the inherent trade-offs every distributed system must make when network partitions occur, shaping architectural decisions across the entire industry.

---

## The CAP Theorem

The CAP theorem states that a distributed data store can provide at most **two out of three** guarantees simultaneously:

| Property | Definition |
|----------|-----------|
| **Consistency (C)** | Every read receives the most recent write or an error |
| **Availability (A)** | Every request receives a non-error response (without guarantee it contains the most recent write) |
| **Partition Tolerance (P)** | The system continues to operate despite arbitrary message loss or failure of part of the network |

---

## Historical Context

### Eric Brewer's Conjecture (2000)

In his keynote at the ACM Symposium on Principles of Distributed Computing (PODC), Eric Brewer presented the CAP conjecture:

> "Of three properties of shared-data systems — data consistency, system availability, and tolerance to network partitions — only two can be achieved at any given time."

This was initially presented as a rule of thumb for practitioners designing large-scale web services at Inktomi (an early search engine company).

### Gilbert-Lynch Proof (2002)

Seth Gilbert and Nancy Lynch of MIT formally proved the conjecture in their paper *"Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services"*.

The proof demonstrates that in an asynchronous network model:

- No algorithm can guarantee both consistency and availability in a system that tolerates partitions
- Even in a partially synchronous model, the result holds with timing constraints

```
Theorem (informal):
In an asynchronous network, it is impossible to implement a read/write
data object that guarantees:
  (1) Availability — every request eventually receives a response
  (2) Atomic consistency — linearizable reads/writes
in all fair executions (including those with message loss).
```

---

## Why You Can't Have All Three

### Understanding Partition Tolerance

In any real distributed system, network partitions **will** happen. Cables get cut, switches fail, data centers lose connectivity. Therefore, partition tolerance is not optional — it's a given.

The real choice becomes: **during a partition, do you sacrifice Consistency or Availability?**

### The Partition Scenario

Consider two nodes, $N_1$ and $N_2$, that cannot communicate:

```
  Client A          Client B
     |                  |
     v                  v
  +------+          +------+
  |  N1  |  X----X  |  N2  |
  +------+          +------+
   (has latest       (has stale
    write)            data)
```

When Client B reads from $N_2$:

- **If we choose Consistency**: $N_2$ must refuse the read (it can't confirm it has the latest data) → Availability is sacrificed
- **If we choose Availability**: $N_2$ returns its (potentially stale) data → Consistency is sacrificed

### Formal Argument

Let a write $w$ occur on node $N_1$. A subsequent read $r$ arrives at node $N_2$.

$$
\text{If partition } P \text{ separates } N_1 \text{ and } N_2\text{:}
$$

$$
\text{Consistent} \implies N_2 \text{ cannot respond to } r \text{ (unavailable)}
$$

$$
\text{Available} \implies N_2 \text{ responds with stale value (inconsistent)}
$$

---

## CP Systems: Sacrificing Availability

CP systems prioritize consistency over availability during network partitions. When a partition occurs, nodes that cannot confirm they have the latest data will reject requests.

### Characteristics

| Aspect | Behaviour |
|--------|-----------|
| During partition | Some nodes refuse reads/writes |
| After partition heals | Full service resumes immediately |
| Consistency model | Strong (linearizable or sequential) |
| Typical use case | Financial systems, coordination services |

### Examples of CP Systems

#### ZooKeeper

Apache ZooKeeper uses the ZAB (ZooKeeper Atomic Broadcast) protocol:

```
Leader Election:
1. Nodes elect a single leader
2. All writes go through the leader
3. Leader replicates to a quorum (majority)
4. If leader is partitioned from majority → cluster becomes read-only

Quorum requirement: ⌊N/2⌋ + 1 nodes must acknowledge
```

During a partition, the minority side **cannot** serve writes:

```python
# Pseudocode for ZooKeeper write handling
def handle_write(request):
    if not self.is_leader:
        forward_to_leader(request)
        return

    # Propose to followers
    ack_count = 1  # leader counts itself
    for follower in self.followers:
        try:
            response = follower.propose(request, timeout=2000)
            if response.success:
                ack_count += 1
        except NetworkError:
            continue

    quorum_size = (len(self.cluster) // 2) + 1
    if ack_count >= quorum_size:
        self.commit(request)
        return Success
    else:
        return Error("Cannot achieve quorum")
```

#### HBase

HBase relies on a single RegionServer owning each region. If that server is partitioned, the region becomes unavailable until failover completes.

#### MongoDB (with majority write concern)

```javascript
// CP behaviour with majority write concern
db.collection.insertOne(
  { item: "critical_record", value: 42 },
  { writeConcern: { w: "majority", wtimeout: 5000 } }
);
// Fails if majority of replica set is unreachable
```

---

## AP Systems: Sacrificing Consistency

AP systems prioritize availability over consistency during partitions. Every node responds to requests, even if it cannot guarantee it has the most recent data.

### Characteristics

| Aspect | Behaviour |
|--------|-----------|
| During partition | All nodes continue serving requests |
| After partition heals | Conflict resolution / reconciliation needed |
| Consistency model | Eventual consistency |
| Typical use case | Shopping carts, social media feeds, DNS |

### Examples of AP Systems

#### Cassandra

Cassandra uses a peer-to-peer architecture with tunable consistency:

```
Write path (AP mode with CL=ONE):
1. Client sends write to any coordinator node
2. Coordinator forwards to all replicas
3. Returns success after ONE replica acknowledges
4. Remaining replicas receive write asynchronously

During partition:
- Both sides of partition accept writes
- Conflicts resolved via Last-Write-Wins (LWW) using timestamps
```

```sql
-- Cassandra with eventual consistency
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY,
    name TEXT,
    email TEXT,
    last_login TIMESTAMP
) WITH replication = {
    'class': 'NetworkTopologyStrategy',
    'dc1': 3, 'dc2': 3
};

-- Read with ONE consistency (AP behaviour)
SELECT * FROM user_profiles
WHERE user_id = ?
CONSISTENCY ONE;
```

#### DynamoDB

Amazon DynamoDB defaults to eventually consistent reads:

```python
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('UserSessions')

# Eventually consistent read (AP) - default
response = table.get_item(
    Key={'session_id': 'abc123'}
)

# Strongly consistent read (CP behaviour)
response = table.get_item(
    Key={'session_id': 'abc123'},
    ConsistentRead=True
)
```

#### CouchDB

CouchDB uses Multi-Version Concurrency Control (MVCC) and stores conflicting revisions:

```json
// Two conflicting writes during a partition
// Node A receives:
{"_id": "doc1", "_rev": "2-abc", "status": "active"}

// Node B receives:
{"_id": "doc1", "_rev": "2-xyz", "status": "inactive"}

// After partition heals, CouchDB stores both as conflicts
// Application must resolve via conflict resolution logic
```

---

## The PACELC Extension

The CAP theorem only describes behaviour **during partitions**. But what about normal operation? Daniel Abadi proposed PACELC (2010) to address this gap.

### PACELC Definition

$$
\text{PACELC} = \begin{cases}
\text{if } P \text{ (Partition):} & \text{choose } A \text{ or } C \\
\text{else } E \text{ (normal operation):} & \text{choose } L\text{(atency) or } C\text{(onsistency)}
\end{cases}
$$

> "During a **P**artition, choose **A**vailability or **C**onsistency; **E**lse (normal operation), choose **L**atency or **C**onsistency."

### Why PACELC Matters

Even when no partition exists, replicating data across nodes introduces a trade-off:

- **Low latency**: respond immediately from the nearest replica (may be stale)
- **Strong consistency**: wait for acknowledgement from multiple replicas (adds latency)

The latency cost of consistency in normal operation is:

$$
T_{\text{consistent}} = T_{\text{local}} + T_{\text{replication}} \cdot \lceil N/2 \rceil
$$

Where $N$ is the number of replicas and $T_{\text{replication}}$ is the round-trip time to remote replicas.

### PACELC Classification of Real Systems

| System | P+A/P+C | E+L/E+C | Classification |
|--------|---------|---------|----------------|
| Cassandra | PA | EL | PA/EL |
| DynamoDB | PA | EL | PA/EL |
| CouchDB | PA | EL | PA/EL |
| MongoDB | PC | EC | PC/EC |
| ZooKeeper | PC | EC | PC/EC |
| HBase | PC | EC | PC/EC |
| PNUTS (Yahoo) | PC | EL | PC/EL |
| Cosmos DB | PA/PC | EL/EC | Configurable |
| CockroachDB | PC | EC | PC/EC |
| Spanner | PC | EC | PC/EC (with TrueTime) |

### PC/EL: An Interesting Trade-off

Some systems sacrifice availability during partitions (PC) but prefer latency over consistency in normal operation (EL). Yahoo's PNUTS is a classic example:

```
PNUTS behaviour:
- Normal: reads served from local replica (low latency, eventual consistency)
- Partition: writes to partitioned records are rejected (consistency preserved)
```

---

## CAP Misconceptions

### Misconception 1: "Pick Two"

The original "pick two" framing is misleading. You don't design a system and permanently choose two properties. The trade-off only manifests **during partitions**.

```
Reality:
- When network is healthy: you can have BOTH consistency AND availability
- When partition occurs: you must choose ONE to sacrifice
- The choice can be made per-operation, not per-system
```

### Misconception 2: "Partitions Are Rare"

Network partitions are more common than many assume:

| Study | Finding |
|-------|---------|
| Bailis & Kingsbury (2014) | Partitions in cloud environments occur regularly |
| Google (Spanner paper) | Cross-datacenter links experience outages |
| Aphyr/Jepsen testing | Many databases fail under partition conditions |

### Misconception 3: "C in CAP = C in ACID"

| CAP Consistency | ACID Consistency |
|-----------------|------------------|
| Linearizability (all nodes see the same data at the same time) | Database invariants hold (constraints, triggers, cascades) |
| About replication agreement | About data integrity rules |
| Distributed systems concept | Single-node database concept |

### Misconception 4: "Binary Choice"

In practice, systems offer tunable consistency:

```python
# Cassandra tunable consistency levels
CONSISTENCY_LEVELS = {
    'ONE': 1,          # Fast, least consistent
    'TWO': 2,
    'THREE': 3,
    'QUORUM': 'N/2+1', # Balanced
    'ALL': 'N',        # Slowest, most consistent
    'LOCAL_QUORUM': 'local N/2+1',
    'EACH_QUORUM': 'quorum in each DC',
}

# Strong consistency when: R + W > N
# Where R = read replicas, W = write replicas, N = total replicas
# Example: N=3, W=2, R=2 → 2+2=4 > 3 ✓ (strongly consistent)
```

---

## Beyond CAP: Harvest and Yield

Armando Fox and Eric Brewer proposed **Harvest and Yield** (1999) as a more nuanced way to think about trade-offs:

$$
\text{Harvest} = \frac{\text{data in response}}{\text{total data available}}
$$

$$
\text{Yield} = \frac{\text{successful requests}}{\text{total requests attempted}}
$$

### Harvest vs. Yield Trade-offs

| Strategy | Harvest | Yield | Example |
|----------|---------|-------|---------|
| Full consistency | 100% | Reduced during partitions | CP system |
| Full availability | Potentially < 100% | ~100% | AP system |
| Graceful degradation | Partial | High | Search with fewer shards |

### Practical Application

```python
# Search engine example: graceful degradation
def search(query, available_shards, total_shards):
    """
    Returns partial results from available shards
    rather than failing entirely.
    """
    results = []
    for shard in available_shards:
        results.extend(shard.search(query))

    harvest = len(available_shards) / total_shards
    return SearchResponse(
        results=results,
        harvest=harvest,  # e.g., 0.8 = results from 80% of data
        complete=(harvest == 1.0)
    )
```

---

## Real-World Trade-Off Decisions

### Decision Framework

When designing a distributed system, ask:

```
1. What is the cost of inconsistency?
   - Financial loss → prefer CP
   - User inconvenience → AP may be acceptable

2. What is the cost of unavailability?
   - Revenue loss per minute → prefer AP
   - Can tolerate brief outages → CP is viable

3. What consistency do users actually perceive?
   - Real-time financial data → strong consistency
   - Social media likes count → eventual is fine

4. What is the geographic distribution?
   - Single region → CP is cheaper
   - Multi-region → AP often necessary for latency
```

### Case Study: Banking Transfer

```python
# CP approach: sacrifice availability for correctness
def transfer(from_account, to_account, amount):
    # Requires quorum write across replicas
    with distributed_transaction(isolation='serializable'):
        balance = read_balance(from_account)  # consistent read
        if balance < amount:
            raise InsufficientFunds()
        debit(from_account, amount)
        credit(to_account, amount)
    # If partition prevents quorum → transaction fails (unavailable)
    # But never produces incorrect balances
```

### Case Study: Shopping Cart

```python
# AP approach: sacrifice consistency for availability
def add_to_cart(user_id, item):
    # Write to local replica, replicate asynchronously
    local_replica.append_to_cart(user_id, item)
    async_replicate(user_id, operation='add', item=item)
    # During partition: both sides accept additions
    # After partition: merge with union (no items lost)
    # Trade-off: user might see stale cart briefly

def merge_carts(cart_a, cart_b):
    """CRDT-based merge: union of items"""
    return cart_a.union(cart_b)
```

### Case Study: DNS

DNS is a classic AP system:

$$
\text{TTL expiry} \implies \text{bounded staleness} \leq T_{\text{TTL}}
$$

- Always available (cached responses)
- Eventually consistent (TTL-based propagation)
- Partition tolerant (distributed hierarchy)

---

## Summary Table

| Concept | Key Insight |
|---------|------------|
| CAP Theorem | During partitions, choose consistency or availability |
| CP Systems | Reject requests during partitions to maintain correctness |
| AP Systems | Serve potentially stale data to remain available |
| PACELC | Extends CAP to normal operation: latency vs. consistency |
| Harvest & Yield | Quantifies partial availability and degradation |
| Tunable Consistency | Most real systems allow per-operation trade-offs |

---

## Exercises

### Exercise 1: Classify the System

For each scenario, determine if the system should be CP or AP:

1. A stock trading platform executing market orders
2. A "likes" counter on social media posts
3. A distributed lock service
4. A content delivery network (CDN)
5. A medical records system

<details>
<summary>Solution</summary>

1. **CP** — Incorrect trades can cause financial loss; better to reject than execute wrong
2. **AP** — Showing 1,042 vs 1,043 likes briefly is acceptable
3. **CP** — A lock must have exactly one holder; incorrect grants cause corruption
4. **AP** — Serving slightly stale content is better than being unavailable
5. **CP** — Patient safety requires accurate, consistent data

</details>

### Exercise 2: PACELC Classification

Given the following system behaviours, classify each as PA/EL, PA/EC, PC/EL, or PC/EC:

1. During partition: all replicas accept writes. Normal operation: reads from nearest replica without checking freshness.
2. During partition: minority side stops accepting writes. Normal operation: all reads go through the leader.
3. During partition: minority side stops accepting writes. Normal operation: reads served from any replica without leader involvement.

<details>
<summary>Solution</summary>

1. **PA/EL** — Available during partition + low-latency reads normally (e.g., Cassandra)
2. **PC/EC** — Consistent during partition + consistent normally (e.g., ZooKeeper)
3. **PC/EL** — Consistent during partition + low-latency normally (e.g., PNUTS)

</details>

### Exercise 3: Quorum Calculation

A system has $N = 5$ replicas. Calculate the minimum values of $R$ (read replicas) and $W$ (write replicas) to ensure strong consistency, given the constraint $R + W > N$.

Find three valid $(R, W)$ combinations and discuss their trade-offs.

<details>
<summary>Solution</summary>

The constraint is $R + W > 5$, so $R + W \geq 6$.

| R | W | Read Latency | Write Latency | Fault Tolerance |
|---|---|-------------|--------------|-----------------|
| 3 | 3 | Medium | Medium | Tolerates 2 failures for both |
| 2 | 4 | Low | High | Tolerates 3 read failures, 1 write failure |
| 5 | 1 | High | Low | Tolerates 0 read failures, 4 write failures |

- $(3, 3)$: Balanced — good general-purpose choice
- $(2, 4)$: Read-optimised — good for read-heavy workloads
- $(5, 1)$: Write-optimised — rarely used (reads require all replicas)

</details>

### Exercise 4: Design Challenge

Design the consistency strategy for a ride-sharing app that has:
- Driver location updates (high frequency, geo-distributed)
- Payment processing (financial transactions)
- Ride matching (time-sensitive, regional)

Specify CP vs AP for each component and justify your choice.

<details>
<summary>Solution</summary>

| Component | Choice | Justification |
|-----------|--------|---------------|
| Driver location | **AP** (PA/EL) | High frequency updates; showing a driver 2 seconds behind is acceptable; availability is critical for UX |
| Payment processing | **CP** (PC/EC) | Financial correctness is paramount; better to delay a charge than double-charge or lose revenue |
| Ride matching | **AP with bounded staleness** | Must respond quickly; a slightly outdated driver list is acceptable; can validate match with a consistent read before confirming |

This demonstrates that real systems are **not** uniformly CP or AP — different components within the same application make different trade-offs.

</details>

---

## Key Takeaways

1. The CAP theorem is about **partitions** — in normal operation, you can have both consistency and availability
2. Since partitions are inevitable, the real question is: **what do you sacrifice when they occur?**
3. PACELC extends the discussion to **normal operation**, where latency vs. consistency is the core trade-off
4. Most modern systems offer **tunable consistency** — the choice is per-operation, not per-system
5. **Harvest and Yield** provide quantitative measures for reasoning about partial failures
6. Real architectures use **different strategies for different components** based on business requirements
