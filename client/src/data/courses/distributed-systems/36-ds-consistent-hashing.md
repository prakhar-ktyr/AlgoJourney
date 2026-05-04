---
title: "Consistent Hashing"
---

# Consistent Hashing

Consistent hashing is a distributed hashing technique that minimizes key redistribution when nodes are added or removed from a system. It is foundational to modern distributed databases, caches, and CDNs.

---

## The Problem with Naive Hashing

With traditional hash-based partitioning, you assign keys to nodes using:

```
node = hash(key) % N
```

where `N` is the number of nodes.

**What happens when N changes?**

| Keys | hash(key) % 3 | hash(key) % 4 |
|------|---------------|---------------|
| "user:1" | 2 | 1 |
| "user:2" | 0 | 2 |
| "user:3" | 1 | 3 |
| "user:4" | 2 | 0 |
| "user:5" | 0 | 1 |
| "user:6" | 1 | 2 |

When you add one node (N goes from 3 to 4), almost **every** key maps to a different node. This triggers a massive data migration — a "rehashing storm."

**Impact in production:**

- Cache invalidation across the entire cluster
- Sudden spike in database load (cache miss storm)
- Temporary data unavailability during migration
- Potential cascading failures

---

## Consistent Hashing: The Hash Ring

Consistent hashing solves this by mapping both **nodes** and **keys** onto a circular hash space (a "ring").

### How It Works

1. **Define the ring**: Use a hash function with output range [0, 2^m - 1]. Imagine this range forms a circle.
2. **Place nodes on the ring**: Hash each node's identifier (e.g., IP address) to get its position.
3. **Assign keys**: Hash each key and walk clockwise around the ring until you find the first node. That node owns the key.

```
        0
       /   \
     N3     N1
    /         \
   |           |
    \         /
     N2     N4
       \   /
       2^m/2
```

### Key Assignment Rule

For any key `k`:

```
owner(k) = first node encountered clockwise from hash(k)
```

This means each node is responsible for the arc of the ring between itself and its predecessor.

---

## Adding and Removing Nodes

### Adding a Node

When a new node `N5` is inserted between `N2` and `N3`:

- Only keys in the arc between `N2` and `N5` need to move (from `N3` to `N5`).
- All other keys remain on their current nodes.

**Keys redistributed**: Only ~`K/N` keys move (where K = total keys, N = total nodes).

### Removing a Node

When `N3` is removed:

- Only keys that were assigned to `N3` move to its clockwise successor.
- All other assignments are unchanged.

| Operation | Naive Hashing | Consistent Hashing |
|-----------|--------------|-------------------|
| Add 1 node (N=10→11) | ~90% keys move | ~9% keys move |
| Remove 1 node (N=10→9) | ~90% keys move | ~11% keys move |
| Add 1 node (N=100→101) | ~99% keys move | ~1% keys move |

---

## Virtual Nodes (Vnodes)

With only physical nodes on the ring, load distribution can be uneven — especially with few nodes.

### The Problem

```
Ring with 3 nodes (uneven distribution):

   N1 -------- N2 - N3
   (60% arc)   (10%) (30%)
```

Node N1 owns 60% of the key space — a severe imbalance.

### The Solution: Virtual Nodes

Each physical node creates multiple **virtual nodes** (replicas) placed at different positions on the ring.

```
Physical Node → Virtual Nodes
─────────────────────────────
Node A        → A0, A1, A2, A3, A4
Node B        → B0, B1, B2, B3, B4
Node C        → C0, C1, C2, C3, C4
```

**Benefits:**

| Vnodes per node | Std. deviation of load |
|-----------------|----------------------|
| 1 | ~50% |
| 10 | ~15% |
| 100 | ~5% |
| 200 | ~3.5% |

### Heterogeneous Nodes

Virtual nodes also handle nodes with different capacities:

```
Powerful server (16 GB RAM) → 200 vnodes
Medium server (8 GB RAM)    → 100 vnodes
Small server (4 GB RAM)     →  50 vnodes
```

---

## Consistent Hashing in Practice

### Amazon DynamoDB / Dynamo

- Uses consistent hashing for data partitioning across storage nodes.
- Each node is assigned multiple virtual nodes (tokens).
- Replication: data is copied to the next N-1 nodes clockwise on the ring.
- Preference list: ordered list of nodes responsible for a key.

### Apache Cassandra

- Each node is assigned token ranges on the ring.
- `num_tokens` setting controls virtual nodes per physical node (default: 256).
- Supports rack-aware and datacenter-aware placement.

```yaml
# cassandra.yaml
num_tokens: 256
partitioner: org.apache.cassandra.dht.Murmur3Partitioner
```

### Memcached (libketama)

- Client-side consistent hashing library.
- Distributes cache keys across a pool of memcached servers.
- Adding/removing a server only invalidates ~1/N of cached keys.

### CDNs (Content Delivery Networks)

- Map content to edge servers using consistent hashing on URL/content-ID.
- When a server fails, its content is served by the next node on the ring.
- Akamai was an early adopter of consistent hashing (1997 paper).

### Load Balancers

- Consistent hashing enables sticky sessions without server-side state.
- Hash on client IP or session ID to route to the same backend.
- NGINX and HAProxy support consistent hashing strategies.

```nginx
upstream backend {
    hash $request_uri consistent;
    server backend1.example.com;
    server backend2.example.com;
    server backend3.example.com;
}
```

---

## Jump Consistent Hash

Jump consistent hash (Lamping & Veach, 2014) is a simpler algorithm that uses no memory and produces well-balanced output.

### Algorithm

```python
def jump_consistent_hash(key: int, num_buckets: int) -> int:
    b, j = -1, 0
    while j < num_buckets:
        b = j
        key = ((key * 2862933555777941757) + 1) & 0xFFFFFFFFFFFFFFFF
        j = int((b + 1) * (float(1 << 31) / float((key >> 33) + 1)))
    return b
```

### Properties

| Property | Jump Hash | Ring-based Hash |
|----------|-----------|-----------------|
| Memory | O(1) | O(N × vnodes) |
| Balance | Near-perfect | Depends on vnodes |
| Monotonicity | Yes | Yes |
| Supports named nodes | No (buckets 0..N-1) | Yes |
| Node removal | Only last bucket | Any node |

**Limitation**: Only supports removing/adding the last bucket. Not suitable when arbitrary nodes can fail.

---

## Rendezvous Hashing (HRW)

Highest Random Weight (HRW) hashing assigns each key to the node that gives the highest hash value for the (key, node) pair.

### Algorithm

```python
def rendezvous_hash(key: str, nodes: list[str]) -> str:
    max_weight = -1
    best_node = None
    for node in nodes:
        weight = hash(f"{key}:{node}")
        if weight > max_weight:
            max_weight = weight
            best_node = node
    return best_node
```

### Properties

- **Minimal disruption**: When a node is removed, only its keys are redistributed.
- **Uniform distribution**: Each node gets ~1/N of keys.
- **Simple**: No ring structure, no virtual nodes needed.
- **O(N) per lookup**: Must compute hash for every node (can be optimized with skeleton trees).

### Comparison

| Feature | Consistent Hashing | Rendezvous Hashing |
|---------|-------------------|-------------------|
| Lookup time | O(log N) with sorted ring | O(N) |
| Memory | O(N × vnodes) | O(N) |
| Balance (no vnodes) | Poor | Good |
| Implementation complexity | Medium | Low |
| Arbitrary node removal | Yes | Yes |

---

## Bounded-Load Consistent Hashing

Standard consistent hashing can still create hotspots when certain keys are extremely popular.

### The Idea (Mirrokni et al., 2018)

Set a capacity bound `c = (1 + ε) × (total_load / num_nodes)` for each node. When a node reaches its bound, the key overflows to the next node on the ring.

### Algorithm

```
assign(key):
    node = first_node_clockwise(hash(key))
    while node.load >= capacity_bound:
        node = next_node_clockwise(node)
    node.load += 1
    return node
```

### Properties

- Maximum load on any node ≤ `(1 + ε) × average_load`
- With ε = 0.25, no node gets more than 125% of average load.
- Still achieves minimal key movement on topology changes.
- Used in Google's load balancing systems.

| ε value | Max overload | Key redistribution |
|---------|-------------|-------------------|
| 0.1 | 110% of average | Slightly more |
| 0.25 | 125% of average | Moderate |
| 0.5 | 150% of average | Near minimal |
| 1.0 | 200% of average | Minimal |

---

## Performance Analysis

### Time Complexity

| Operation | Ring (sorted) | Ring (balanced BST) | Jump Hash |
|-----------|--------------|--------------------:|-----------|
| Key lookup | O(log N) | O(log N) | O(ln N) |
| Add node | O(N × K/N) data + O(N) ring | O(log N) ring | N/A |
| Remove node | O(K/N) data + O(N) ring | O(log N) ring | N/A |

### Space Complexity

| Approach | Space |
|----------|-------|
| Ring with V vnodes | O(N × V) |
| Jump hash | O(1) |
| Rendezvous hash | O(N) |

### Hash Function Choice

The hash function significantly impacts distribution quality:

| Hash Function | Speed | Distribution Quality |
|---------------|-------|---------------------|
| MD5 | Slow | Excellent |
| SHA-1 | Slow | Excellent |
| MurmurHash3 | Fast | Very good |
| xxHash | Very fast | Very good |
| FNV-1a | Fast | Good |

For consistent hashing, prefer **MurmurHash3** or **xxHash** — they provide near-uniform distribution with high throughput.

---

## Python Implementation

A complete implementation of consistent hashing with virtual nodes:

```python
import hashlib
import bisect
from collections import defaultdict


class ConsistentHashRing:
    """Consistent hash ring with virtual nodes."""

    def __init__(self, nodes=None, num_vnodes=150):
        self.num_vnodes = num_vnodes
        self.ring = {}          # hash_value -> node
        self.sorted_keys = []   # sorted list of hash values
        self.nodes = set()
        if nodes:
            for node in nodes:
                self.add_node(node)

    def _hash(self, key: str) -> int:
        """Generate a hash value for a key."""
        digest = hashlib.md5(key.encode()).hexdigest()
        return int(digest, 16)

    def add_node(self, node: str):
        """Add a node with virtual nodes to the ring."""
        self.nodes.add(node)
        for i in range(self.num_vnodes):
            vnode_key = f"{node}#vn{i}"
            hash_val = self._hash(vnode_key)
            self.ring[hash_val] = node
            bisect.insort(self.sorted_keys, hash_val)

    def remove_node(self, node: str):
        """Remove a node and its virtual nodes from the ring."""
        self.nodes.discard(node)
        for i in range(self.num_vnodes):
            vnode_key = f"{node}#vn{i}"
            hash_val = self._hash(vnode_key)
            del self.ring[hash_val]
            self.sorted_keys.remove(hash_val)

    def get_node(self, key: str) -> str:
        """Find the node responsible for the given key."""
        if not self.ring:
            return None
        hash_val = self._hash(key)
        idx = bisect.bisect_right(self.sorted_keys, hash_val)
        if idx == len(self.sorted_keys):
            idx = 0  # wrap around the ring
        return self.ring[self.sorted_keys[idx]]

    def get_distribution(self, keys: list[str]) -> dict[str, int]:
        """Analyze key distribution across nodes."""
        distribution = defaultdict(int)
        for key in keys:
            node = self.get_node(key)
            distribution[node] += 1
        return dict(distribution)


# --- Usage Example ---

if __name__ == "__main__":
    # Create ring with 3 nodes
    ring = ConsistentHashRing(["node-A", "node-B", "node-C"], num_vnodes=150)

    # Generate test keys
    keys = [f"user:{i}" for i in range(10000)]

    # Check distribution
    print("=== Initial Distribution (3 nodes) ===")
    dist = ring.get_distribution(keys)
    for node, count in sorted(dist.items()):
        print(f"  {node}: {count} keys ({count/100:.1f}%)")

    # Add a node
    ring.add_node("node-D")
    print("\n=== After Adding node-D (4 nodes) ===")
    dist_after = ring.get_distribution(keys)
    for node, count in sorted(dist_after.items()):
        print(f"  {node}: {count} keys ({count/100:.1f}%)")

    # Count keys that moved
    moved = sum(
        1 for key in keys
        if ring.get_node(key) != ConsistentHashRing(
            ["node-A", "node-B", "node-C"], num_vnodes=150
        ).get_node(key)
    )
    print(f"\n  Keys moved: {moved} ({moved/100:.1f}%)")
    print(f"  Ideal movement: {10000/4:.0f} ({100/4:.1f}%)")
```

### Sample Output

```
=== Initial Distribution (3 nodes) ===
  node-A: 3347 keys (33.5%)
  node-B: 3312 keys (33.1%)
  node-C: 3341 keys (33.4%)

=== After Adding node-D (4 nodes) ===
  node-A: 2510 keys (25.1%)
  node-B: 2485 keys (24.9%)
  node-C: 2512 keys (25.1%)
  node-D: 2493 keys (24.9%)

  Keys moved: 2493 (24.9%)
  Ideal movement: 2500 (25.0%)
```

---

## Summary

| Concept | Key Takeaway |
|---------|-------------|
| Naive mod N hashing | Breaks completely when N changes |
| Hash ring | Maps nodes and keys to circular space |
| Virtual nodes | Ensure balanced load distribution |
| Jump hash | O(1) memory, perfect balance, limited flexibility |
| Rendezvous hash | O(N) lookup, no ring needed, good balance |
| Bounded-load | Prevents hotspots with capacity caps |
| Key redistribution | Only ~K/N keys move on topology change |

---

## Exercises

1. **Ring Visualization**: Implement a visualization of a hash ring showing 5 physical nodes with 3 virtual nodes each. Display which keys (from a set of 20) land on which nodes.

2. **Replication**: Extend the Python implementation to support replication factor R, where each key is stored on R consecutive nodes clockwise.

3. **Failure Simulation**: Simulate removing 2 out of 10 nodes and measure:
   - What percentage of keys actually moved?
   - How close is it to the theoretical minimum?
   - How does the number of virtual nodes affect the result?

4. **Load Balancing**: Implement bounded-load consistent hashing with ε = 0.25. Generate a workload where 10% of keys receive 90% of requests. Compare max node load with and without bounding.

5. **Comparison Benchmark**: Implement all three algorithms (ring-based, jump hash, rendezvous hash) and benchmark:
   - Lookup latency (ns per lookup) for N = 10, 100, 1000 nodes
   - Distribution uniformity (standard deviation of key counts)
   - Memory usage

6. **Rack Awareness**: Modify the consistent hashing implementation so that replicas are always placed on different racks. Given a mapping of nodes to racks, skip nodes on the same rack when walking clockwise for replication.
