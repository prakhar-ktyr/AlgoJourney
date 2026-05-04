---
title: "Eventual Consistency"
---

# Eventual Consistency

Eventual consistency is a consistency model guaranteeing that, if no new updates are made to a data item, all replicas will **eventually** converge to the same value. It is the weakest useful consistency guarantee and the most common model in large-scale distributed systems.

---

## Why Eventual Consistency?

The CAP theorem tells us we cannot simultaneously have **Consistency**, **Availability**, and **Partition tolerance**. Many internet-scale systems choose availability over strong consistency, accepting that replicas may temporarily diverge.

| Property | Strong Consistency | Eventual Consistency |
|----------|-------------------|---------------------|
| Latency | Higher (coordination) | Lower (local reads) |
| Availability | May reject requests | Always serves requests |
| Staleness | Never stale | Temporarily stale |
| Complexity | Simpler app logic | Conflict resolution needed |
| Scalability | Limited by coordination | Highly scalable |

---

## Formal Definition

A system provides **eventual consistency** if it satisfies:

1. **Eventual delivery** — Every update applied at one correct replica is eventually applied at every correct replica.
2. **Convergence** — All correct replicas that have received the same set of updates eventually reach the same state.
3. **Termination** — All method executions eventually complete.

Formally, for any data item $x$ with replicas $r_1, r_2, \ldots, r_n$:

$$
\forall\, i,j:\; \lim_{t \to \infty} \text{state}(r_i, t) = \text{state}(r_j, t)
$$

provided no new writes occur after some time $t_0$.

---

## Convergence

Convergence is the core property: given the same set of updates (possibly received in different orders), all replicas reach the **same final state**.

### How Convergence Is Achieved

| Technique | Mechanism | Example |
|-----------|-----------|---------|
| Last-Writer-Wins (LWW) | Timestamp ordering | Cassandra |
| Version vectors | Detect conflicts, app resolves | Riak, DynamoDB |
| CRDTs | Mathematically guaranteed merge | Redis CRDT, Automerge |
| Operational Transform | Transform concurrent ops | Google Docs |

### Last-Writer-Wins Example

```python
class LWWRegister:
    def __init__(self):
        self.value = None
        self.timestamp = 0

    def write(self, value, timestamp):
        if timestamp > self.timestamp:
            self.value = value
            self.timestamp = timestamp

    def merge(self, other):
        """Merge with another replica's state."""
        if other.timestamp > self.timestamp:
            self.value = other.value
            self.timestamp = other.timestamp
```

The merge function is:
- **Commutative**: $\text{merge}(A, B) = \text{merge}(B, A)$
- **Associative**: $\text{merge}(A, \text{merge}(B, C)) = \text{merge}(\text{merge}(A, B), C)$
- **Idempotent**: $\text{merge}(A, A) = A$

These three properties guarantee convergence regardless of message ordering or duplication.

---

## Strong Eventual Consistency (SEC)

Strong eventual consistency strengthens eventual consistency by adding a **deterministic** conflict resolution mechanism:

> Any two replicas that have received the **same set of updates** — regardless of order — are in the **same state** immediately, without requiring additional synchronization.

$$
\text{SEC}: \quad \text{updates}(r_i) = \text{updates}(r_j) \implies \text{state}(r_i) = \text{state}(r_j)
$$

### SEC vs EC

| Property | Eventual Consistency | Strong Eventual Consistency |
|----------|---------------------|----------------------------|
| Convergence timing | Eventually (may need extra rounds) | Immediately upon same updates |
| Conflict resolution | May need coordination | Automatic, deterministic |
| Rollbacks | Possible | Never needed |
| Implementation | General replication | CRDTs, lattice-based |

### CRDTs Enable SEC

Conflict-free Replicated Data Types (CRDTs) are data structures designed for SEC:

```python
class GCounter:
    """Grow-only counter — a state-based CRDT."""

    def __init__(self, node_id, num_nodes):
        self.node_id = node_id
        self.counts = [0] * num_nodes

    def increment(self):
        self.counts[self.node_id] += 1

    def value(self):
        return sum(self.counts)

    def merge(self, other):
        """Take element-wise maximum — guarantees convergence."""
        for i in range(len(self.counts)):
            self.counts[i] = max(self.counts[i], other.counts[i])
```

---

## Eventual Consistency in Practice

### DNS (Domain Name System)

DNS is one of the oldest eventually consistent systems:

- TTL-based caching means stale records are served until expiry
- Propagation of zone changes takes minutes to hours
- Users tolerate this because DNS changes are infrequent

### Apache Cassandra

```sql
-- Cassandra tunable consistency
-- Write to quorum, read from one (eventually consistent read)
INSERT INTO users (id, name, email)
VALUES (uuid(), 'Alice', 'alice@example.com')
USING CONSISTENCY QUORUM;

SELECT * FROM users WHERE id = ?
USING CONSISTENCY ONE;
```

Cassandra uses:
- **Gossip protocol** for cluster membership
- **Anti-entropy repair** for data synchronization
- **Read repair** for on-the-fly correction
- **Hinted handoff** for temporarily unavailable nodes

### Amazon DynamoDB

DynamoDB offers two read modes:

| Mode | Consistency | Cost | Latency |
|------|------------|------|---------|
| Eventually consistent read | May return stale data | 1x | Lower |
| Strongly consistent read | Returns latest write | 2x | Higher |

```javascript
// Eventually consistent read (default)
const result = await dynamodb.getItem({
  TableName: "Users",
  Key: { userId: { S: "user-123" } },
  ConsistentRead: false  // default
}).promise();

// Strongly consistent read
const result = await dynamodb.getItem({
  TableName: "Users",
  Key: { userId: { S: "user-123" } },
  ConsistentRead: true  // 2x cost, higher latency
}).promise();
```

---

## Read-After-Write Scenarios

A common pitfall: a client writes data and immediately reads it back but gets the **old** value.

### The Problem

```
Client → Write to Replica A (success)
Client → Read from Replica B  (stale! hasn't received update yet)
```

### Timeline

```
Time ─────────────────────────────────────────►

Replica A: ──── Write(x=5) ─────────────────────
Replica B: ──────────────── Read(x) → 3 (stale!) ── Sync ── x=5
Replica C: ──────────────────────────── Sync ──────── x=5
```

### Solutions

| Strategy | Mechanism | Trade-off |
|----------|-----------|-----------|
| Read-your-writes | Route reads to same replica that accepted write | Sticky sessions, less load balancing |
| Synchronous replication | Wait for write to propagate before ACK | Higher write latency |
| Version check | Client sends version; retry if stale | Client complexity |
| Quorum reads | Read from majority $R + W > N$ | Higher read latency |

```python
class ReadYourWritesSession:
    def __init__(self, client_id):
        self.client_id = client_id
        self.last_write_timestamp = 0

    def write(self, store, key, value):
        ts = store.write(key, value)
        self.last_write_timestamp = max(self.last_write_timestamp, ts)

    def read(self, store, key):
        """Ensure we read at least our own writes."""
        value, ts = store.read(key, min_timestamp=self.last_write_timestamp)
        return value
```

---

## Anti-Entropy Mechanisms

Anti-entropy mechanisms ensure replicas converge even without client-driven reads or writes.

### Read Repair

When a read detects inconsistency, the system repairs it immediately:

```
Client reads from replicas A, B, C:
  A returns v2 (timestamp 100)
  B returns v1 (timestamp 90)   ← stale!
  C returns v2 (timestamp 100)

Coordinator sends v2 to B → B updated
```

```python
def read_with_repair(key, replicas, quorum_size):
    responses = []
    for replica in replicas[:quorum_size]:
        responses.append(replica.read(key))

    # Find the most recent value
    latest = max(responses, key=lambda r: r.timestamp)

    # Repair stale replicas (async, background)
    for resp in responses:
        if resp.timestamp < latest.timestamp:
            resp.replica.async_write(key, latest.value, latest.timestamp)

    return latest.value
```

### Merkle Trees

Merkle trees efficiently detect which data ranges differ between replicas:

```
         Root Hash
        /         \
    Hash(L)      Hash(R)
    /    \       /    \
  H(A)  H(B)  H(C)  H(D)    ← leaf hashes of data ranges
```

Comparison algorithm:

1. Exchange root hashes — if equal, replicas are synchronized
2. If different, descend: compare child hashes
3. Only transfer data in differing leaf ranges

$$
\text{Communication complexity} = O(\log N \cdot \Delta)
$$

where $N$ is total data items and $\Delta$ is the number of differences.

```python
class MerkleNode:
    def __init__(self, hash_val, left=None, right=None, data_range=None):
        self.hash = hash_val
        self.left = left
        self.right = right
        self.data_range = data_range

def find_differences(local_root, remote_root):
    """Find data ranges that differ between two replicas."""
    differences = []
    stack = [(local_root, remote_root)]

    while stack:
        local, remote = stack.pop()
        if local.hash == remote.hash:
            continue  # subtree is identical
        if local.left is None:  # leaf node
            differences.append(local.data_range)
        else:
            stack.append((local.left, remote.left))
            stack.append((local.right, remote.right))

    return differences
```

### Gossip-Based Anti-Entropy

Nodes periodically exchange state with random peers:

```python
import random
import time

class GossipNode:
    def __init__(self, node_id, peers):
        self.node_id = node_id
        self.peers = peers
        self.data = {}  # key → (value, vector_clock)

    def gossip_round(self):
        """Periodically called (e.g., every 1 second)."""
        target = random.choice(self.peers)
        digest = self.compute_digest()
        diff = target.receive_digest(digest)
        self.apply_updates(diff)

    def compute_digest(self):
        """Summary of local state for comparison."""
        return {key: vc for key, (_, vc) in self.data.items()}

    def receive_digest(self, remote_digest):
        """Return updates the remote is missing."""
        updates = {}
        for key, (value, vc) in self.data.items():
            if key not in remote_digest or vc > remote_digest[key]:
                updates[key] = (value, vc)
        return updates
```

Convergence time with gossip:

$$
T_{\text{converge}} = O(\log N) \text{ rounds}
$$

where $N$ is the number of nodes in the cluster.

---

## Session Guarantees

Session guarantees provide stronger semantics within a single client session without requiring global strong consistency:

| Guarantee | Definition |
|-----------|-----------|
| **Read Your Writes** | A read following a write in the same session sees that write (or a later one) |
| **Monotonic Reads** | Successive reads in a session never return older values |
| **Monotonic Writes** | Writes in a session are applied in order at all replicas |
| **Writes Follow Reads** | A write following a read in the same session is ordered after the read's value |

```python
class SessionGuarantees:
    def __init__(self):
        self.read_set = set()   # versions seen by reads
        self.write_set = set()  # versions produced by writes

    def can_read_from(self, replica):
        """Check if replica satisfies monotonic reads + read-your-writes."""
        return self.write_set.issubset(replica.applied_versions)

    def record_read(self, version):
        self.read_set.add(version)

    def record_write(self, version):
        self.write_set.add(version)
```

---

## Tunable Consistency

Many distributed databases offer **tunable consistency**, letting developers choose the consistency level per operation.

### Quorum Formula

For a system with $N$ replicas:

$$
R + W > N \implies \text{strong consistency}
$$

where $R$ = read replicas, $W$ = write replicas.

| Configuration | R | W | Guarantee |
|--------------|---|---|-----------|
| Strong consistency | $N$ | 1 | Read from all |
| Strong consistency | 1 | $N$ | Write to all |
| Quorum | $\lceil(N+1)/2\rceil$ | $\lceil(N+1)/2\rceil$ | Overlap guaranteed |
| Eventual | 1 | 1 | Fast but stale |

### Cassandra Consistency Levels

```yaml
# Consistency levels in Cassandra (N=3 replicas)
levels:
  ONE:        { reads: 1, writes: 1, guarantee: "eventual" }
  TWO:        { reads: 2, writes: 2, guarantee: "stronger" }
  QUORUM:     { reads: 2, writes: 2, guarantee: "strong (R+W>N)" }
  ALL:        { reads: 3, writes: 3, guarantee: "strongest, least available" }
  LOCAL_ONE:  { reads: 1, writes: 1, guarantee: "eventual, same DC" }
  EACH_QUORUM: { reads: "quorum per DC", guarantee: "strong multi-DC" }
```

---

## BASE vs ACID

| Property | ACID | BASE |
|----------|------|------|
| **B**asically Available / **A**tomicity | All-or-nothing transactions | System always responds |
| **S**oft state / Con**s**istency | Data always valid | State may change without input |
| **E**ventually consistent / **I**solation & **D**urability | Transactions isolated, data persisted | Converges over time |

### When to Use Each

```
ACID (Strong Consistency):
├── Banking transactions
├── Inventory management (prevent overselling)
├── User authentication state
└── Booking systems (prevent double-booking)

BASE (Eventual Consistency):
├── Social media feeds
├── Product recommendations
├── Analytics and counters
├── DNS and CDN caching
└── Shopping cart (merge on checkout)
```

---

## When Eventual Consistency Is Acceptable

### Decision Framework

Ask these questions:

1. **Is temporary staleness harmful?** If showing a 5-second-old like count is fine → EC works.
2. **Can conflicts be resolved automatically?** If merge semantics exist → EC works.
3. **Is availability more important than freshness?** If yes → EC works.
4. **Are operations commutative?** If order doesn't matter → EC works well.

### Acceptable Use Cases

| Use Case | Why EC Works |
|----------|-------------|
| Social media likes/shares | Approximate counts acceptable |
| User profile updates | Last write wins is intuitive |
| Product catalog | Brief staleness tolerable |
| Session data | Per-user, low conflict |
| Event logging | Append-only, commutative |

### Unacceptable Use Cases

| Use Case | Why EC Fails |
|----------|-------------|
| Bank balance | Overdraft possible |
| Seat reservation | Double-booking |
| Unique username | Duplicates possible |
| Distributed lock | Safety violation |

---

## Real-World Examples and Pitfalls

### Pitfall 1: Lost Updates

```
User A reads balance: $100
User B reads balance: $100
User A writes balance: $100 + $50 = $150
User B writes balance: $100 - $30 = $70   ← A's deposit lost!
```

**Fix**: Use conditional writes (compare-and-swap) or CRDTs.

### Pitfall 2: Causal Violations

```
Alice posts: "I got the job!"
Bob replies: "Congratulations!"
Carol sees: "Congratulations!" but not Alice's post  ← confusing!
```

**Fix**: Track causal dependencies with vector clocks.

### Pitfall 3: Conflict Resolution Surprises

```python
# DynamoDB: concurrent writes to same item
# Client A: set color = "red"
# Client B: set color = "blue"
# Result with LWW: one wins silently — the other is lost

# Better: use conditional writes
dynamodb.put_item(
    TableName="Settings",
    Item={"key": "color", "value": "red"},
    ConditionExpression="attribute_not_exists(#k) OR #v = :old",
    ExpressionAttributeNames={"#k": "key", "#v": "value"},
    ExpressionAttributeValues={":old": "blue"}
)
```

### Pitfall 4: Thundering Herd on Repair

When anti-entropy detects many stale replicas, mass repair can overwhelm the network:

```python
def throttled_repair(differences, max_rate=100):
    """Rate-limit repairs to avoid thundering herd."""
    for batch in chunks(differences, max_rate):
        send_repairs(batch)
        time.sleep(1)  # 100 repairs per second max
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Eventual Consistency | All replicas converge given no new writes |
| Strong Eventual Consistency | Same updates → same state immediately |
| Convergence | Achieved via CRDTs, LWW, or OT |
| Anti-entropy | Read repair, Merkle trees, gossip |
| Session guarantees | Per-client stronger semantics |
| Tunable consistency | $R + W > N$ for strong; lower for eventual |
| BASE | Trade consistency for availability |
| Acceptable scenarios | Low-conflict, commutative, staleness-tolerant |

---

## Exercises

1. **Quorum Calculation**: A system has $N = 5$ replicas. What values of $R$ and $W$ give strong consistency while minimizing write latency?

2. **CRDT Design**: Design a state-based CRDT for a "last-writer-wins set" that supports both add and remove operations. What metadata is needed?

3. **Conflict Scenario**: Two users concurrently edit a shopping cart — one adds item A, the other removes item B. With LWW, what problems arise? How would a CRDT solve this?

4. **Merkle Tree Efficiency**: A database has 1 million keys distributed across 2 replicas. If 100 keys differ, how many hash comparisons are needed using a Merkle tree with branching factor 2?

5. **System Design**: You're building a global social media "like" counter. Design a system using eventual consistency that: (a) never loses likes, (b) converges within 5 seconds, and (c) handles network partitions. What CRDT would you use?

6. **Session Guarantees**: A user updates their profile photo and immediately refreshes the page. The old photo appears. Which session guarantee is violated? Propose two different solutions with their trade-offs.
