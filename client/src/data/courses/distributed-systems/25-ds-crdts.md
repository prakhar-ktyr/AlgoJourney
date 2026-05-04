---
title: "Conflict Resolution and CRDTs"
---

# Conflict Resolution and CRDTs

In distributed systems, multiple replicas of the same data can be modified concurrently. When these modifications conflict, the system must **resolve** them — ideally without coordination. **CRDTs** (Conflict-free Replicated Data Types) provide a mathematically rigorous way to achieve this.

---

## The Conflict Problem

When two nodes update the same data item simultaneously, a **write conflict** arises:

```
Node A: x = 5  →  x = 7  (increment by 2)
Node B: x = 5  →  x = 8  (increment by 3)

After sync: x = ???
```

Without a resolution strategy, the system enters an inconsistent state.

---

## Conflict Resolution Strategies

| Strategy | Description | Pros | Cons |
|----------|-------------|------|------|
| Last-Writer-Wins (LWW) | Highest timestamp wins | Simple, fast | Data loss, clock skew |
| Merge Functions | Custom logic combines values | Preserves intent | Complex to implement |
| Application-Level | App resolves at read time | Flexible | Pushes complexity to client |
| Vector Clocks + Manual | Detect conflicts, ask user | Accurate | Poor UX for auto-resolution |
| CRDTs | Mathematically guaranteed merge | No conflicts ever | Limited data structures |

---

## Last-Writer-Wins (LWW)

The simplest strategy — attach a timestamp to each write and keep the latest:

```python
class LWWRegister:
    def __init__(self, value=None):
        self.value = value
        self.timestamp = 0

    def write(self, value, timestamp):
        if timestamp > self.timestamp:
            self.value = value
            self.timestamp = timestamp

    def merge(self, other):
        """Merge with a remote replica."""
        if other.timestamp > self.timestamp:
            self.value = other.value
            self.timestamp = other.timestamp
```

**Problems with LWW:**

- Requires synchronized clocks (hard in distributed systems)
- Silently discards concurrent writes — data loss is inherent
- No way to detect that a conflict occurred

---

## Merge Functions

Custom logic that combines conflicting values:

```python
def merge_shopping_carts(cart_a, cart_b):
    """Merge two shopping carts by taking max quantity for each item."""
    merged = {}
    all_items = set(cart_a.keys()) | set(cart_b.keys())
    for item in all_items:
        merged[item] = max(cart_a.get(item, 0), cart_b.get(item, 0))
    return merged

# Example
cart_a = {"apples": 3, "bread": 1}
cart_b = {"apples": 2, "milk": 2}
result = merge_shopping_carts(cart_a, cart_b)
# {"apples": 3, "bread": 1, "milk": 2}
```

Merge functions work well when domain semantics allow meaningful combination.

---

## Application-Level Resolution

Systems like Amazon DynamoDB and Riak can return **all conflicting versions** (siblings) and let the application decide:

```python
class MultiValueRegister:
    def __init__(self):
        self.versions = []  # list of (value, vector_clock) pairs

    def read(self):
        """Return all concurrent versions."""
        return [v for v, _ in self.versions]

    def resolve(self, resolver_fn):
        """Application provides resolution logic."""
        if len(self.versions) > 1:
            values = [v for v, _ in self.versions]
            resolved = resolver_fn(values)
            self.versions = [(resolved, self._new_clock())]
```

---

## What Are CRDTs?

A **CRDT** (Conflict-free Replicated Data Type) is a data structure that can be replicated across multiple nodes, updated independently and concurrently, and **always** merged into a consistent state — without coordination.

> **Key Insight:** CRDTs are designed so that *all possible merge orders* produce the same result. Conflicts are impossible by construction.

### Why CRDTs Matter

1. **Strong Eventual Consistency** — all replicas that have received the same set of updates will be in the same state
2. **No coordination needed** — updates are purely local
3. **Always available** — no need to wait for other nodes
4. **Partition tolerant** — works perfectly during network splits

---

## Mathematical Foundation: Join Semilattice

CRDTs are built on the algebraic structure of a **join semilattice**.

A set $S$ with a binary operation $\sqcup$ (join/merge) forms a join semilattice if:

$$\text{Commutativity: } a \sqcup b = b \sqcup a$$

$$\text{Associativity: } (a \sqcup b) \sqcup c = a \sqcup (b \sqcup c)$$

$$\text{Idempotency: } a \sqcup a = a$$

These three properties guarantee that:

- **Order doesn't matter** (commutativity) — messages can arrive in any order
- **Grouping doesn't matter** (associativity) — partial merges produce the same result
- **Duplicates are safe** (idempotency) — replaying messages causes no harm

The partial order $\leq$ is defined as:

$$a \leq b \iff a \sqcup b = b$$

This means the state can only **grow** (move "up" in the lattice) — it never goes backward.

---

## Types of CRDTs

### State-Based CRDTs (CvRDTs)

**Convergent Replicated Data Types** — replicas periodically send their **full state** to other replicas, which merge it:

```
Node A state: {a: 3, b: 1}
Node B state: {a: 2, b: 4}

After merge at both nodes: {a: 3, b: 4}  (element-wise max)
```

**Requirements:**
- The state must form a join semilattice
- The merge function must be the lattice join ($\sqcup$)
- Local updates must be *inflationary* (state only grows)

### Operation-Based CRDTs (CmRDTs)

**Commutative Replicated Data Types** — replicas broadcast **operations** to other replicas, which apply them locally:

```
Node A broadcasts: increment(a)
Node B broadcasts: increment(b)

Both apply both ops → same final state
```

**Requirements:**
- Operations must be commutative
- Delivery must be causal (or operations must also be idempotent)
- The communication layer must guarantee at-least-once delivery

### Comparison

| Aspect | State-Based (CvRDT) | Operation-Based (CmRDT) |
|--------|---------------------|------------------------|
| Network payload | Full state (large) | Single operation (small) |
| Network requirement | Unreliable OK | Causal delivery needed |
| Merge complexity | Defined on full state | Defined per operation |
| Idempotent delivery | Built-in | Must be ensured |
| Bandwidth | Higher | Lower |

---

## Common CRDTs

### G-Counter (Grow-Only Counter)

Each node maintains its own counter. The global value is the sum of all node counters.

```python
class GCounter:
    def __init__(self, node_id, num_nodes):
        self.node_id = node_id
        self.counts = [0] * num_nodes  # one slot per node

    def increment(self):
        self.counts[self.node_id] += 1

    def value(self):
        return sum(self.counts)

    def merge(self, other):
        """Join semilattice: element-wise max."""
        for i in range(len(self.counts)):
            self.counts[i] = max(self.counts[i], other.counts[i])

# Example
counter_a = GCounter(node_id=0, num_nodes=3)
counter_b = GCounter(node_id=1, num_nodes=3)

counter_a.increment()  # [1, 0, 0]
counter_a.increment()  # [2, 0, 0]
counter_b.increment()  # [0, 1, 0]

counter_a.merge(counter_b)
print(counter_a.value())  # 3
```

**Merge is a valid join:** $\text{max}$ is commutative, associative, and idempotent.

---

### PN-Counter (Positive-Negative Counter)

Supports both increment and decrement by combining two G-Counters:

```python
class PNCounter:
    def __init__(self, node_id, num_nodes):
        self.p = GCounter(node_id, num_nodes)  # positive
        self.n = GCounter(node_id, num_nodes)  # negative

    def increment(self):
        self.p.increment()

    def decrement(self):
        self.n.increment()

    def value(self):
        return self.p.value() - self.n.value()

    def merge(self, other):
        self.p.merge(other.p)
        self.n.merge(other.n)

# Example
c = PNCounter(node_id=0, num_nodes=2)
c.increment()   # value = 1
c.increment()   # value = 2
c.decrement()   # value = 1
```

The value $v = P - N$ where $P = \sum p_i$ and $N = \sum n_i$.

---

### G-Set (Grow-Only Set)

Elements can only be added, never removed:

```python
class GSet:
    def __init__(self):
        self.elements = set()

    def add(self, element):
        self.elements.add(element)

    def lookup(self, element):
        return element in self.elements

    def merge(self, other):
        """Join = set union."""
        self.elements = self.elements | other.elements

# Set union is commutative, associative, and idempotent ✓
```

---

### OR-Set (Observed-Remove Set)

Supports both add and remove. Each addition is tagged with a unique identifier:

```python
import uuid

class ORSet:
    def __init__(self):
        self.elements = {}  # element -> set of unique tags

    def add(self, element):
        tag = str(uuid.uuid4())
        if element not in self.elements:
            self.elements[element] = set()
        self.elements[element].add(tag)

    def remove(self, element):
        """Remove all currently observed tags for this element."""
        if element in self.elements:
            del self.elements[element]

    def lookup(self, element):
        return element in self.elements and len(self.elements[element]) > 0

    def value(self):
        return {e for e, tags in self.elements.items() if len(tags) > 0}

    def merge(self, other):
        """Merge by taking union of tags for each element."""
        all_elements = set(self.elements.keys()) | set(other.elements.keys())
        merged = {}
        for elem in all_elements:
            tags_self = self.elements.get(elem, set())
            tags_other = other.elements.get(elem, set())
            combined = tags_self | tags_other
            if combined:
                merged[elem] = combined
        self.elements = merged

# Semantics: add wins over concurrent remove
```

**Add-wins semantics:** If one node adds an element while another removes it concurrently, the add wins (because the new tag wasn't observed by the remover).

---

### LWW-Register (Last-Writer-Wins Register)

A register that resolves conflicts using timestamps:

```python
class LWWRegister:
    def __init__(self):
        self.value = None
        self.timestamp = 0

    def assign(self, value, timestamp):
        if timestamp > self.timestamp:
            self.value = value
            self.timestamp = timestamp

    def merge(self, other):
        if other.timestamp > self.timestamp:
            self.value = other.value
            self.timestamp = other.timestamp
        # On tie: use node_id as tiebreaker (deterministic)
```

Forms a lattice ordered by timestamp: $r_1 \leq r_2 \iff r_1.ts \leq r_2.ts$.

---

### MV-Register (Multi-Value Register)

Instead of picking one winner, keeps **all concurrent values** (like Amazon's shopping cart):

```python
class MVRegister:
    def __init__(self, node_id):
        self.node_id = node_id
        self.clock = {}     # vector clock
        self.values = set()  # concurrent values

    def assign(self, value):
        # Increment own clock entry
        self.clock[self.node_id] = self.clock.get(self.node_id, 0) + 1
        self.values = {value}

    def merge(self, other):
        """Keep values from both sides that aren't dominated."""
        # Simplified: keep all concurrent values
        if self._dominates(other):
            pass  # keep self
        elif other._dominates_register(self):
            self.values = other.values.copy()
            self.clock = other.clock.copy()
        else:
            # Concurrent — keep both
            self.values = self.values | other.values
            # Merge clocks
            for k in set(self.clock.keys()) | set(other.clock.keys()):
                self.clock[k] = max(
                    self.clock.get(k, 0),
                    other.clock.get(k, 0)
                )

    def _dominates(self, other):
        return all(
            self.clock.get(k, 0) >= v
            for k, v in other.clock.items()
        )
```

---

## CRDTs in Practice

| System | CRDT Types Used | Use Case |
|--------|----------------|----------|
| **Riak** | Counters, Sets, Maps, Flags | Distributed KV store |
| **Redis (CRDTs)** | Counters, Sets, Registers | Multi-master replication |
| **Automerge** | JSON-like CRDT document | Collaborative editing |
| **Yjs** | Text, Array, Map CRDTs | Real-time collaboration |
| **OrbitDB** | Log, KV, Counter, Docstore | Peer-to-peer databases |
| **Apple (CoreData)** | Custom CRDTs | CloudKit sync |
| **SoundCloud** | Counters (Roshi) | Activity feeds |

### Automerge Example (Conceptual)

```python
# Automerge-style document CRDT (simplified concept)
class CRDTDocument:
    def __init__(self, actor_id):
        self.actor_id = actor_id
        self.ops = []  # operation log
        self.state = {}

    def set(self, key, value):
        op = {
            "actor": self.actor_id,
            "seq": len(self.ops) + 1,
            "action": "set",
            "key": key,
            "value": value,
        }
        self.ops.append(op)
        self._apply(op)

    def merge(self, remote_ops):
        """Apply remote operations respecting causal order."""
        for op in remote_ops:
            if op not in self.ops:
                self.ops.append(op)
                self._apply(op)

    def _apply(self, op):
        if op["action"] == "set":
            self.state[op["key"]] = op["value"]
```

### Yjs for Collaborative Text Editing

Yjs uses a CRDT approach for text where each character has a unique ID based on (clientID, clock). Insertions between two positions are unambiguous regardless of order.

---

## Practical Implementation: Distributed Counter Service

```python
import time
import json
from typing import Dict

class DistributedCounter:
    """
    A production-style PN-Counter with:
    - Serialization for network transfer
    - Garbage collection of tombstones
    - Consistency checking
    """

    def __init__(self, node_id: str):
        self.node_id = node_id
        self.increments: Dict[str, int] = {node_id: 0}
        self.decrements: Dict[str, int] = {node_id: 0}
        self.last_updated = time.time()

    def increment(self, amount: int = 1):
        assert amount > 0, "Use decrement for negative values"
        self.increments[self.node_id] = (
            self.increments.get(self.node_id, 0) + amount
        )
        self.last_updated = time.time()

    def decrement(self, amount: int = 1):
        assert amount > 0, "Amount must be positive"
        self.decrements[self.node_id] = (
            self.decrements.get(self.node_id, 0) + amount
        )
        self.last_updated = time.time()

    def value(self) -> int:
        total_inc = sum(self.increments.values())
        total_dec = sum(self.decrements.values())
        return total_inc - total_dec

    def merge(self, other: "DistributedCounter"):
        """Merge remote state — element-wise max on both maps."""
        for node, count in other.increments.items():
            self.increments[node] = max(
                self.increments.get(node, 0), count
            )
        for node, count in other.decrements.items():
            self.decrements[node] = max(
                self.decrements.get(node, 0), count
            )
        self.last_updated = time.time()

    def serialize(self) -> str:
        return json.dumps({
            "node_id": self.node_id,
            "increments": self.increments,
            "decrements": self.decrements,
        })

    @classmethod
    def deserialize(cls, data: str) -> "DistributedCounter":
        obj = json.loads(data)
        counter = cls(obj["node_id"])
        counter.increments = obj["increments"]
        counter.decrements = obj["decrements"]
        return counter


# --- Simulation ---
if __name__ == "__main__":
    # Three nodes updating independently
    node_a = DistributedCounter("A")
    node_b = DistributedCounter("B")
    node_c = DistributedCounter("C")

    # Concurrent updates (no communication)
    node_a.increment(5)
    node_b.increment(3)
    node_b.decrement(1)
    node_c.increment(2)

    # Sync: A merges with B and C
    node_a.merge(node_b)
    node_a.merge(node_c)

    # Sync: B merges with A (which already has C's state)
    node_b.merge(node_a)

    # Sync: C merges with B (which already has A's state)
    node_c.merge(node_b)

    # All converge to the same value
    assert node_a.value() == node_b.value() == node_c.value() == 9
    print(f"All nodes converged to: {node_a.value()}")  # 9
```

---

## Limitations of CRDTs

| Limitation | Description |
|-----------|-------------|
| **Space overhead** | State grows with number of nodes (e.g., vector per node in G-Counter) |
| **Limited expressiveness** | Not all data structures have natural CRDT equivalents |
| **No invariant preservation** | Cannot enforce global invariants (e.g., "balance ≥ 0") |
| **Garbage collection** | Tombstones and metadata accumulate, requiring periodic GC |
| **Semantic gaps** | Mathematical merge may not match user intent |
| **Complexity** | Correct implementations are subtle and error-prone |

### The Invariant Problem

CRDTs cannot enforce **global invariants** because each node operates independently:

```python
# PROBLEM: Ensuring stock never goes negative
# Node A sees: stock = 5, sells 3 → stock = 2  ✓
# Node B sees: stock = 5, sells 4 → stock = 1  ✓
# After merge: stock = 5 - 3 - 4 = -2  ✗ (violated!)
```

For invariants that require coordination, you need techniques like:
- **Escrow** — pre-allocate portions of a value to each node
- **Bounded counters** — limit decrements per node
- **Reservation protocols** — request permission before critical updates

---

## When to Use CRDTs

**Good fit:**
- Collaborative editing (text, documents)
- Distributed counters (likes, views, metrics)
- Shopping carts and wishlists
- Presence and status indicators
- Offline-first applications
- Edge computing with intermittent connectivity

**Poor fit:**
- Financial transactions (need strong consistency)
- Inventory management (need invariants)
- Sequential workflows (need ordering)
- Access control changes (need immediate propagation)

---

## CRDT Design Decision Tree

```
Is strong consistency required?
├── Yes → Use consensus (Paxos/Raft), not CRDTs
└── No → Can data only grow (never delete)?
    ├── Yes → Use G-Counter or G-Set
    └── No → Are concurrent updates commutative?
        ├── Yes → Use operation-based CRDT
        └── No → Can you tolerate data loss?
            ├── Yes → Use LWW-Register
            └── No → Use OR-Set or MV-Register
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Conflict resolution | Multiple strategies exist; trade-off between simplicity and correctness |
| LWW | Simple but lossy; requires synchronized clocks |
| CRDTs | Mathematically guaranteed convergence without coordination |
| Join semilattice | Foundation: commutative, associative, idempotent merge |
| CvRDT vs CmRDT | State-based (send full state) vs operation-based (send ops) |
| G-Counter | Per-node counters, sum for value, max for merge |
| PN-Counter | Two G-Counters (positive - negative) |
| OR-Set | Tagged additions; add wins over concurrent remove |
| Limitations | Space overhead, no invariants, GC needed |

---

## Exercises

1. **Implement a G-Set CRDT** that supports `add`, `lookup`, `merge`, and `value` operations. Write tests showing that two replicas converge after merging in either order.

2. **Prove** that the G-Counter merge (element-wise max) satisfies all three semilattice properties: commutativity, associativity, and idempotency.

3. **Build an OR-Set** and demonstrate the "add wins" semantics: Node A adds element "x", Node B removes "x" concurrently, and after merge "x" is present.

4. **Design a CRDT shopping cart** where items can be added and removed, and quantities can be updated. Handle the case where one user adds an item while another removes it concurrently.

5. **Calculate the space complexity** of a G-Counter with $n$ nodes and compare it to a PN-Counter. If a cluster has 1000 nodes, how much metadata overhead does each counter value carry?

6. **Implement a bounded counter** CRDT that enforces a minimum value of 0. Use the escrow technique to pre-allocate decrements among nodes.

7. **Compare** Automerge and Yjs in terms of their CRDT approaches to collaborative text editing. What trade-offs does each make regarding memory usage, operation size, and merge semantics?
