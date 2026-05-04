---
title: "Distributed Hash Tables"
---

# Distributed Hash Tables

A **Distributed Hash Table (DHT)** is a decentralized system that provides a lookup service similar to a hash table — data is stored as key-value pairs, and any participating node can efficiently retrieve the value associated with a given key.

DHTs form the backbone of many peer-to-peer (P2P) systems, enabling scalable, fault-tolerant data storage and retrieval without any central authority.

---

## What is a DHT?

A DHT distributes the responsibility of maintaining key-value mappings across a set of nodes in a network. Each node is responsible for a subset of the total key space.

### Key Properties

| Property | Description |
|----------|-------------|
| **Decentralization** | No single point of control; all nodes are equal participants |
| **Scalability** | System handles millions of nodes with logarithmic routing |
| **Fault Tolerance** | Node failures are handled gracefully via replication |
| **Self-Organization** | Nodes join and leave without global coordination |
| **Load Balancing** | Keys are distributed roughly evenly across nodes |

### How It Differs from a Regular Hash Table

| Aspect | Hash Table | DHT |
|--------|-----------|-----|
| Location | Single machine | Distributed across network |
| Lookup | O(1) direct access | O(log n) network hops |
| Failure | Total loss | Graceful degradation |
| Size limit | RAM of one machine | Aggregate storage of all nodes |
| Coordination | None needed | Protocol-based |

---

## Hash Space and Key Ownership

DHTs operate on a **hash space** — a range of possible hash values (typically 0 to 2^m - 1 for an m-bit identifier space).

### Consistent Hashing

Both **keys** and **node identifiers** are mapped into the same hash space using a cryptographic hash function (e.g., SHA-1):

```
node_id = hash(node_IP_address)
key_id  = hash(data_key)
```

### Key Assignment Rule

A key is assigned to the node whose identifier is **closest** to the key in the hash space. The definition of "closest" varies by DHT protocol:

- **Chord**: The successor node (next node clockwise on the ring)
- **Kademlia**: The node with the smallest XOR distance
- **CAN**: The node whose coordinate zone contains the key's point

---

## Chord: Ring Topology

**Chord** is one of the most well-known DHT protocols. It arranges nodes in a logical ring of size 2^m.

### Ring Structure

Nodes are placed on a circle based on their hash values. Keys are assigned to their **successor** — the first node encountered when moving clockwise from the key's position.

```
        Node 1
       /      \
    Node 56    Node 8
      |          |
    Node 51    Node 14
      |          |
    Node 42    Node 21
       \      /
        Node 38
        
  (m=6, ring size = 64)
```

### Successor and Predecessor

- **Successor(k)**: The first node at or after position k on the ring
- **Predecessor(k)**: The first node before position k on the ring

Each node maintains a pointer to its immediate successor and predecessor for ring maintenance.

### Finger Tables

To avoid O(n) lookups around the ring, each node maintains a **finger table** with m entries:

```
finger[i] = successor(n + 2^(i-1)) mod 2^m
```

For node n with m-bit identifiers:

| Finger | Points to successor of |
|--------|----------------------|
| 1 | n + 1 |
| 2 | n + 2 |
| 3 | n + 4 |
| 4 | n + 8 |
| ... | ... |
| m | n + 2^(m-1) |

### Lookup: O(log n)

Each lookup step jumps at least halfway closer to the target, guaranteeing O(log n) hops:

```python
def find_successor(id):
    """Find the node responsible for key 'id'."""
    if id is between (self.id, self.successor.id]:
        return self.successor
    else:
        # Forward to the closest preceding node in finger table
        n_prime = closest_preceding_finger(id)
        return n_prime.find_successor(id)

def closest_preceding_finger(id):
    """Find the closest finger preceding id."""
    for i in range(m, 0, -1):
        if finger[i] is between (self.id, id):
            return finger[i]
    return self
```

### Practical Example: Chord Lookup

Consider a Chord ring with m=6 (identifiers 0–63) and nodes at positions: **1, 8, 14, 21, 32, 38, 42, 48, 51, 56**.

**Goal**: Node 8 wants to find the value for key 54.

```
Step 1: Node 8 checks — is 54 in (8, 14]? No.
        Finger table of Node 8:
          finger[1] = succ(9)  = 14
          finger[2] = succ(10) = 14
          finger[3] = succ(12) = 14
          finger[4] = succ(16) = 21
          finger[5] = succ(24) = 32
          finger[6] = succ(40) = 42
        
        Closest preceding finger for 54: finger[6] = 42

Step 2: Node 42 checks — is 54 in (42, 48]? No.
        Finger table of Node 42:
          finger[1] = succ(43) = 48
          finger[2] = succ(44) = 48
          finger[3] = succ(46) = 48
          finger[4] = succ(50) = 51
          finger[5] = succ(58) = 1
          finger[6] = succ(6)  = 8
        
        Closest preceding finger for 54: finger[4] = 51

Step 3: Node 51 checks — is 54 in (51, 56]? YES!
        Returns Node 56 (the successor responsible for key 54).

Result: Key 54 is stored at Node 56. Found in 3 hops (O(log n)).
```

---

## Kademlia: XOR Metric

**Kademlia** uses the XOR operation as its distance metric, which has useful mathematical properties.

### XOR Distance

```
distance(a, b) = a XOR b
```

Properties of XOR distance:

| Property | Explanation |
|----------|-------------|
| d(x, x) = 0 | Distance to self is zero |
| d(x, y) > 0 if x ≠ y | Positive for distinct points |
| d(x, y) = d(y, x) | Symmetric |
| d(x, z) ≤ d(x, y) + d(y, z) | Triangle inequality holds |

### k-Buckets

Each node maintains a routing table of **k-buckets**. For a 160-bit ID space, there are 160 buckets:

- Bucket i holds up to k nodes at XOR distance between 2^i and 2^(i+1) from the local node
- k is a system-wide parameter (typically k = 20)

```
Bucket 0: nodes at distance [1, 2)        — very close
Bucket 1: nodes at distance [2, 4)
Bucket 2: nodes at distance [4, 8)
...
Bucket 159: nodes at distance [2^159, 2^160) — very far
```

### Iterative vs. Recursive Lookup

**Iterative lookup** (preferred in Kademlia):

```python
def iterative_find_node(target_id):
    """Find k closest nodes to target_id."""
    shortlist = get_alpha_closest_nodes(target_id)  # alpha = 3
    queried = set()
    
    while True:
        # Pick alpha unqueried nodes closest to target
        to_query = pick_closest_unqueried(shortlist, queried, alpha)
        if not to_query:
            break
        
        for node in to_query:
            # Ask each node for its k closest to target
            results = node.find_node(target_id)
            shortlist.update(results)
            queried.add(node)
    
    return k_closest(shortlist, target_id)
```

**Recursive lookup**: The queried node forwards the request itself rather than returning results to the initiator. Faster but harder to debug and control.

| Approach | Pros | Cons |
|----------|------|------|
| Iterative | Full control, easier timeout handling | Higher latency (sequential) |
| Recursive | Lower latency | Less control, harder failure handling |

---

## Pastry and Tapestry

### Pastry

- Uses a 128-bit circular ID space
- Routing based on **prefix matching** — each hop resolves one more digit of the key
- Maintains a **leaf set** (numerically close nodes) and a **routing table** (prefix-based)
- Lookup complexity: O(log₁₆ n) with base-16 digits
- Locality-aware: prefers physically closer nodes

### Tapestry

- Similar prefix-based routing to Pastry
- Uses **suffix matching** instead of prefix matching
- Provides **object publication and location** rather than just routing
- Supports fault tolerance through redundant routing paths

Both achieve O(log n) lookups and are designed with **network locality** in mind, reducing physical network hops.

---

## CAN: Content Addressable Network

**CAN** uses a d-dimensional Cartesian coordinate space instead of a ring.

### How CAN Works

1. The key space is a d-dimensional torus (wraps around)
2. Each node owns a **zone** (a rectangular region) in this space
3. Keys are mapped to points using d hash functions
4. Routing follows a greedy algorithm toward the destination coordinates

```
+--------+--------+--------+
|        |        |        |
| Node A | Node B | Node C |
|        |        |        |
+--------+--------+--------+
|        |        |        |
| Node D | Node E | Node F |
|        |        |        |
+--------+--------+--------+

2D CAN: each node owns a rectangular zone
Routing: forward to neighbor closest to destination
```

### CAN Properties

| Property | Value |
|----------|-------|
| Lookup hops | O(d · n^(1/d)) |
| Routing table size | O(d) — only immediate neighbors |
| Scalability | Increase d to reduce hops |
| Node join | Split an existing zone in half |

---

## DHT Operations

### Put (Store)

```python
def put(key, value):
    """Store a key-value pair in the DHT."""
    target_id = hash(key)
    responsible_node = lookup(target_id)
    responsible_node.store(key, value)
    
    # Replicate to k successor nodes for fault tolerance
    for replica_node in get_replicas(responsible_node, k):
        replica_node.store(key, value)
```

### Get (Retrieve)

```python
def get(key):
    """Retrieve the value for a key from the DHT."""
    target_id = hash(key)
    responsible_node = lookup(target_id)
    return responsible_node.retrieve(key)
```

### Join

When a new node joins the DHT:

1. **Bootstrap**: Contact a known node already in the network
2. **Get ID**: Hash the new node's address to get its identifier
3. **Find position**: Locate the successor in the ring/space
4. **Transfer keys**: The successor transfers keys that now belong to the new node
5. **Update routing**: Neighbors update their routing tables

```python
def join(known_node):
    """Join the DHT via a known node."""
    self.id = hash(self.address)
    self.successor = known_node.find_successor(self.id)
    self.predecessor = self.successor.predecessor
    
    # Notify successor and predecessor
    self.successor.set_predecessor(self)
    self.predecessor.set_successor(self)
    
    # Transfer keys in range (predecessor.id, self.id]
    self.keys = self.successor.transfer_keys(self.predecessor.id, self.id)
    
    # Build finger table
    self.init_finger_table(known_node)
```

### Leave (Graceful Departure)

```python
def leave():
    """Gracefully leave the DHT."""
    # Transfer all keys to successor
    self.successor.receive_keys(self.keys)
    
    # Update neighbor pointers
    self.successor.set_predecessor(self.predecessor)
    self.predecessor.set_successor(self.successor)
    
    # Notify other nodes to update routing tables
    self.notify_departure()
```

### Failure Handling

When a node **crashes** without graceful departure:

| Mechanism | Description |
|-----------|-------------|
| **Successor lists** | Each node tracks multiple successors; if one fails, use the next |
| **Periodic stabilization** | Nodes periodically verify and fix their successor/predecessor |
| **Replication** | Keys are stored on multiple nodes; loss of one is survivable |
| **Heartbeats** | Detect failed nodes via periodic pings |
| **Lazy repair** | Fix routing entries when lookups fail |

---

## Replication in DHTs

Replication ensures data availability when nodes fail.

### Strategies

| Strategy | How It Works |
|----------|--------------|
| **Successor replication** | Store copies on the next k successors on the ring |
| **Symmetric replication** | Store on nodes both before and after the responsible node |
| **Random replication** | Store on k randomly chosen nodes (requires index) |
| **Path replication** | Cache data on every node along the lookup path |

### Consistency Challenges

```
Write to Key X:
  Primary: Node 42 (responsible)
  Replica 1: Node 48
  Replica 2: Node 51

If Node 42 receives an update but crashes before propagating:
  → Replicas have stale data
  → Need quorum reads/writes for consistency
```

**Quorum approach**: With N replicas, require W writes to succeed and R reads to agree, where W + R > N guarantees reading the latest value.

---

## DHTs in Practice

### BitTorrent (Mainline DHT)

- Uses **Kademlia** for trackerless peer discovery
- Stores mappings: `info_hash → list of peers`
- Millions of nodes participate simultaneously
- Eliminates single point of failure (centralized tracker)

```
# BitTorrent DHT operation
info_hash = SHA1(torrent_metadata)
peers = dht.get_peers(info_hash)  # Find who has the file
dht.announce_peer(info_hash, my_port)  # Announce I have it
```

### IPFS (InterPlanetary File System)

- Uses a **Kademlia-based** DHT for content routing
- Stores mappings: `CID (Content ID) → provider nodes`
- Content-addressed: hash of data IS the key
- Nodes advertise which content they can serve

### Ethereum (Discv5)

- Node discovery protocol based on Kademlia
- Finds peers for the P2P gossip network
- Uses XOR distance for routing table organization
- ENR (Ethereum Node Records) stored in the DHT

| System | DHT Used | Purpose |
|--------|----------|---------|
| BitTorrent | Kademlia | Peer discovery |
| IPFS | Kademlia variant | Content routing |
| Ethereum | Kademlia (Discv5) | Node discovery |
| Amazon Dynamo | Chord-like | Key-value storage |
| Apache Cassandra | Consistent hashing | Data partitioning |

---

## Pros and Cons of DHTs

### Advantages

| Advantage | Explanation |
|-----------|-------------|
| Scalability | O(log n) lookups with O(log n) state per node |
| Decentralization | No single point of failure or control |
| Self-organization | Handles node joins/leaves automatically |
| Load distribution | Consistent hashing spreads keys evenly |
| Fault tolerance | Replication survives node failures |

### Disadvantages

| Disadvantage | Explanation |
|--------------|-------------|
| Lookup latency | Multiple network hops vs. single-hop in centralized systems |
| No range queries | Only exact-match lookups (key → value) |
| Churn overhead | Frequent joins/leaves cause routing table instability |
| Security | Vulnerable to Sybil attacks, eclipse attacks |
| Consistency | Eventual consistency; hard to guarantee strong consistency |
| Complexity | Harder to implement and debug than centralized alternatives |

---

## Comparison of DHT Protocols

| Protocol | Topology | Lookup Hops | State per Node | Distance Metric |
|----------|----------|-------------|----------------|-----------------|
| Chord | Ring | O(log n) | O(log n) | Clockwise distance |
| Kademlia | XOR tree | O(log n) | O(log n) | XOR |
| Pastry | Hybrid (prefix) | O(log n) | O(log n) | Prefix match + numeric |
| CAN | d-dim space | O(d·n^(1/d)) | O(d) | Cartesian distance |
| Tapestry | Plaxton mesh | O(log n) | O(log n) | Suffix match |

---

## Exercises

### Exercise 1: Chord Finger Table

Given a Chord ring with m=4 (IDs 0–15) and nodes at positions {0, 3, 6, 9, 12}, compute the finger table for Node 3.

<details>
<summary>Solution</summary>

```
finger[1] = successor(3 + 1) = successor(4) = 6
finger[2] = successor(3 + 2) = successor(5) = 6
finger[3] = successor(3 + 4) = successor(7) = 9
finger[4] = successor(3 + 8) = successor(11) = 12
```

Finger table for Node 3: [6, 6, 9, 12]

</details>

### Exercise 2: Kademlia XOR Distance

Nodes have 4-bit IDs. Calculate the XOR distance between:
- Node 0101 and Node 1100
- Node 1010 and Node 1001
- Which bucket of Node 0101 would Node 1100 go into?

<details>
<summary>Solution</summary>

```
0101 XOR 1100 = 1001 = 9 (decimal)
1010 XOR 1001 = 0011 = 3 (decimal)

For Node 0101, Node 1100 has distance 9.
9 is in range [8, 16) = [2^3, 2^4)
So Node 1100 goes into bucket 3 of Node 0101.
```

</details>

### Exercise 3: Key Responsibility

In a Chord ring (m=5, IDs 0–31) with nodes at {2, 7, 13, 19, 25}, which node is responsible for each key?
- Key 5
- Key 14
- Key 26
- Key 1

<details>
<summary>Solution</summary>

```
Key 5:  successor(5) = 7   → Node 7 is responsible
Key 14: successor(14) = 19 → Node 19 is responsible
Key 26: successor(26) = 2  → Node 2 is responsible (wraps around)
Key 1:  successor(1) = 2   → Node 2 is responsible
```

</details>

### Exercise 4: Design Question

You need to build a distributed file-sharing system for a university campus with ~10,000 nodes. Which DHT would you choose and why? Consider:
- Lookup latency requirements
- Node churn (students joining/leaving WiFi)
- Network locality (prefer nearby nodes)

<details>
<summary>Solution</summary>

**Pastry or Kademlia** would be good choices:

- **Kademlia**: XOR metric is symmetric (simpler implementation), k-buckets naturally stay fresh due to traffic, iterative lookups provide control over timeout handling during high churn.

- **Pastry**: Locality-aware routing reduces physical network hops on campus (important for a LAN/campus setting), prefix-based routing achieves O(log₁₆ n) ≈ 3-4 hops for 10,000 nodes.

For high churn (students): Kademlia's lazy bucket refresh and its property that lookups themselves maintain routing tables makes it more resilient.

For locality: Pastry's proximity-aware routing table construction is superior.

**Recommendation**: Kademlia for simplicity and churn tolerance, with k=20 and α=3 for parallel lookups.

</details>

---

## Summary

- DHTs provide **decentralized key-value lookup** with O(log n) efficiency
- **Chord** uses a ring topology with finger tables for logarithmic routing
- **Kademlia** uses XOR distance with k-buckets, favored in real-world P2P systems
- **Pastry/Tapestry** add network locality awareness via prefix/suffix routing
- **CAN** offers a multi-dimensional alternative with tunable dimensions
- Core operations (put, get, join, leave) handle the full lifecycle
- **Replication** and **stabilization** protocols handle node failures
- DHTs power BitTorrent, IPFS, Ethereum, and many distributed databases
- Tradeoffs exist between lookup speed, state overhead, churn resilience, and consistency

---

## Further Reading

- Stoica et al., "Chord: A Scalable Peer-to-peer Lookup Service for Internet Applications" (2001)
- Maymounkov & Mazières, "Kademlia: A Peer-to-peer Information System Based on the XOR Metric" (2002)
- Rowstron & Druschel, "Pastry: Scalable, Decentralized Object Location and Routing" (2001)
- Ratnasamy et al., "A Scalable Content-Addressable Network" (2001)
