---
title: "Key-Value Stores"
---

# Key-Value Stores

A **key-value store** is the simplest form of a NoSQL database. It stores data as a collection of key-value pairs, where a key serves as a unique identifier to retrieve its associated value.

---

## The Key-Value Store Model

In a key-value store:

- **Key**: A unique identifier (string, integer, or composite)
- **Value**: An opaque blob — the store doesn't interpret it (could be JSON, binary, a serialized object, etc.)

### Basic Operations

| Operation | Description | Example |
|-----------|-------------|---------|
| `PUT(key, value)` | Insert or update a value | `PUT("user:42", "{name: 'Alice'}")` |
| `GET(key)` | Retrieve a value by key | `GET("user:42")` → `"{name: 'Alice'}"` |
| `DELETE(key)` | Remove a key-value pair | `DELETE("user:42")` |

```
┌─────────────────────────────────┐
│        Key-Value Store          │
├──────────────┬──────────────────┤
│     Key      │      Value       │
├──────────────┼──────────────────┤
│ user:42      │ {name: "Alice"}  │
│ session:abc  │ {token: "xyz"}   │
│ cart:99      │ [item1, item2]   │
│ config:app   │ {theme: "dark"}  │
└──────────────┴──────────────────┘
```

---

## Design Considerations

Building a distributed key-value store requires addressing several fundamental challenges:

### 1. Partitioning (Sharding)

How do we distribute data across multiple nodes?

| Strategy | Approach | Trade-off |
|----------|----------|-----------|
| Range partitioning | Keys split by ranges (A-M, N-Z) | Simple but prone to hotspots |
| Hash partitioning | Hash(key) % N determines node | Even distribution, but range queries are hard |
| Consistent hashing | Keys and nodes mapped on a ring | Minimal redistribution on node changes |

### 2. Replication

How do we maintain copies for durability and availability?

- **Single-leader**: One node accepts writes, replicates to followers
- **Multi-leader**: Multiple nodes accept writes (conflict resolution needed)
- **Leaderless**: Any replica accepts reads/writes (quorum-based)

### 3. Consistency

What guarantees do we provide for reads after writes?

- **Strong consistency**: Reads always see the latest write
- **Eventual consistency**: Reads may see stale data temporarily
- **Causal consistency**: Preserves causal ordering of operations

### 4. Failure Handling

How do we handle node failures gracefully?

- **Failure detection**: Gossip protocols, heartbeats
- **Hinted handoff**: Temporarily store writes destined for failed nodes
- **Read repair**: Fix stale replicas during read operations
- **Anti-entropy**: Background processes that synchronize replicas

---

## Dynamo Architecture

Amazon's Dynamo (the paper, not DynamoDB) introduced several influential techniques for building highly available key-value stores.

### Consistent Hashing

Dynamo uses consistent hashing to partition data across nodes:

```
        Node A
       /      \
      /   Ring  \
  Node D ──────── Node B
      \        /
       \      /
        Node C

Key "user:42" → hash → position on ring → assigned to next node clockwise
```

**Virtual nodes**: Each physical node owns multiple positions on the ring, improving load balance:

```python
# Simplified consistent hashing
import hashlib

class ConsistentHashRing:
    def __init__(self, nodes, virtual_nodes=150):
        self.ring = {}
        self.sorted_keys = []

        for node in nodes:
            for i in range(virtual_nodes):
                key = self._hash(f"{node}:{i}")
                self.ring[key] = node
                self.sorted_keys.append(key)

        self.sorted_keys.sort()

    def _hash(self, key):
        return int(hashlib.md5(key.encode()).hexdigest(), 16)

    def get_node(self, key):
        if not self.ring:
            return None
        h = self._hash(key)
        for ring_key in self.sorted_keys:
            if h <= ring_key:
                return self.ring[ring_key]
        return self.ring[self.sorted_keys[0]]  # Wrap around
```

### Vector Clocks

Dynamo uses vector clocks to track causality and detect conflicts:

```
Event timeline:
  Node A: PUT("cart", [item1])        → clock: {A:1}
  Node B: receives replica            → clock: {A:1}
  Node A: PUT("cart", [item1, item2]) → clock: {A:2}
  Node B: PUT("cart", [item1, item3]) → clock: {A:1, B:1}  ← CONFLICT!

Resolution: Application-level merge → [item1, item2, item3]
```

A vector clock is a list of `(node, counter)` pairs:

```python
class VectorClock:
    def __init__(self):
        self.clock = {}

    def increment(self, node_id):
        self.clock[node_id] = self.clock.get(node_id, 0) + 1

    def merge(self, other):
        for node, count in other.clock.items():
            self.clock[node] = max(self.clock.get(node, 0), count)

    def is_concurrent(self, other):
        """Neither clock dominates the other → conflict."""
        dominated = all(
            self.clock.get(n, 0) >= c for n, c in other.clock.items()
        )
        dominates = all(
            other.clock.get(n, 0) >= c for n, c in self.clock.items()
        )
        return not dominated and not dominates
```

### Sloppy Quorums and Hinted Handoff

Dynamo uses quorum parameters **N**, **R**, **W**:

| Parameter | Meaning |
|-----------|---------|
| N | Number of replicas for each key |
| R | Minimum replicas that must respond to a read |
| W | Minimum replicas that must acknowledge a write |

**Rule**: As long as `R + W > N`, you get strong consistency.

Common configurations:

| Config | N | R | W | Trade-off |
|--------|---|---|---|-----------|
| Strong consistency | 3 | 2 | 2 | Consistent but less available |
| Fast reads | 3 | 1 | 3 | Quick reads, slow writes |
| Fast writes | 3 | 3 | 1 | Quick writes, slow reads |
| Eventual consistency | 3 | 1 | 1 | Fast but may read stale data |

**Sloppy quorum**: When preferred nodes are unavailable, writes go to any healthy node (with a "hint" to forward later). This prioritizes availability over strict consistency.

### Gossip Protocol

Nodes discover membership changes and detect failures through gossip:

```
1. Node A picks a random node B
2. A sends its membership list to B
3. B merges A's list with its own
4. B replies with its merged list
5. A merges B's reply

Result: Eventually all nodes converge on the same membership view
```

### Anti-Entropy with Merkle Trees

Background synchronization uses Merkle (hash) trees to efficiently find differences:

```
         Root Hash
        /         \
   Hash(L)      Hash(R)
   /    \       /    \
 H(1)  H(2)  H(3)  H(4)
  |      |     |      |
 K1     K2    K3     K4

If Root hashes differ → traverse children to find divergent keys
Only transfer the keys that actually differ
```

---

## Redis

**Redis** (Remote Dictionary Server) is an in-memory key-value store known for its speed and rich data structure support.

### Core Features

```bash
# Basic key-value
SET user:42 '{"name":"Alice","email":"alice@example.com"}'
GET user:42

# Expiration
SET session:abc "token123" EX 3600  # expires in 1 hour

# Atomic increment
INCR page_views:home
```

### Data Structures

Redis supports far more than simple strings:

| Structure | Commands | Use Case |
|-----------|----------|----------|
| Strings | `SET`, `GET`, `INCR` | Caching, counters |
| Lists | `LPUSH`, `RPUSH`, `LRANGE` | Message queues, activity feeds |
| Sets | `SADD`, `SMEMBERS`, `SINTER` | Tags, unique visitors |
| Sorted Sets | `ZADD`, `ZRANGE`, `ZRANK` | Leaderboards, priority queues |
| Hashes | `HSET`, `HGET`, `HGETALL` | Object storage, user profiles |
| Streams | `XADD`, `XREAD`, `XGROUP` | Event sourcing, log processing |

```bash
# Sorted set for a leaderboard
ZADD leaderboard 1500 "player:alice"
ZADD leaderboard 2300 "player:bob"
ZADD leaderboard 1800 "player:carol"

# Top 3 players
ZREVRANGE leaderboard 0 2 WITHSCORES
# 1) "player:bob"    2300
# 2) "player:carol"  1800
# 3) "player:alice"  1500
```

### Persistence Options

| Mode | Description | Trade-off |
|------|-------------|-----------|
| **RDB** (Snapshotting) | Periodic full snapshots to disk | Fast recovery, potential data loss between snapshots |
| **AOF** (Append-Only File) | Logs every write operation | Durable but larger files, slower recovery |
| **RDB + AOF** | Both combined | Best durability with fast recovery |
| **No persistence** | Pure in-memory | Maximum performance, data lost on restart |

```conf
# redis.conf - RDB configuration
save 900 1      # Snapshot if ≥1 key changed in 900 seconds
save 300 10     # Snapshot if ≥10 keys changed in 300 seconds
save 60 10000   # Snapshot if ≥10000 keys changed in 60 seconds

# AOF configuration
appendonly yes
appendfsync everysec  # fsync every second (good balance)
```

### Redis Cluster

Redis Cluster provides automatic sharding across multiple nodes:

```
┌──────────────────────────────────────────────────┐
│              Redis Cluster (16384 slots)          │
├────────────────┬────────────────┬────────────────┤
│   Node A       │   Node B       │   Node C       │
│ Slots 0-5460   │ Slots 5461-10922│ Slots 10923-16383│
│   + Replica A' │   + Replica B' │   + Replica C' │
└────────────────┴────────────────┴────────────────┘

Key assignment: CRC16(key) mod 16384 → slot → node
```

---

## Memcached

**Memcached** is a simple, high-performance distributed caching system.

### Key Characteristics

- Pure in-memory (no persistence)
- Simple key-value only (no complex data structures)
- Multi-threaded architecture
- LRU eviction when memory is full
- No built-in replication

```python
import memcache

mc = memcache.Client(['10.0.0.1:11211', '10.0.0.2:11211'])

# Cache-aside pattern
def get_user(user_id):
    key = f"user:{user_id}"
    user = mc.get(key)
    if user is None:
        user = db.query("SELECT * FROM users WHERE id = %s", user_id)
        mc.set(key, user, time=300)  # Cache for 5 minutes
    return user
```

### Redis vs Memcached

| Feature | Redis | Memcached |
|---------|-------|-----------|
| Data structures | Rich (strings, lists, sets, etc.) | Strings only |
| Persistence | RDB, AOF | None |
| Replication | Built-in | None (client-side) |
| Threading | Single-threaded (+ I/O threads) | Multi-threaded |
| Memory efficiency | Higher overhead per key | Very efficient |
| Clustering | Redis Cluster | Client-side consistent hashing |
| Pub/Sub | Yes | No |
| Lua scripting | Yes | No |

---

## Riak

**Riak** is a Dynamo-inspired distributed key-value store focused on availability and fault tolerance.

### Key Features

- Masterless architecture (no single point of failure)
- Tunable consistency (N, R, W parameters per request)
- CRDTs (Conflict-free Replicated Data Types) for automatic conflict resolution
- Built-in MapReduce and full-text search

```erlang
%% Riak uses buckets to organize keys
%% PUT request
PUT /buckets/users/keys/alice
Content-Type: application/json

{"name": "Alice", "email": "alice@example.com"}

%% GET request
GET /buckets/users/keys/alice
```

### CRDTs in Riak

Instead of vector clocks with application-level resolution, Riak 2.0+ supports CRDTs:

| CRDT Type | Description | Use Case |
|-----------|-------------|----------|
| Counter | Increment/decrement safely | Page views, likes |
| Set | Add/remove elements | Tags, followers |
| Map | Nested structure with typed fields | User profiles |
| Flag | Boolean with enable/disable | Feature flags |

---

## Amazon DynamoDB

**DynamoDB** is Amazon's fully managed key-value and document database service (distinct from the Dynamo paper).

### Key Concepts

```
Table: Users
├── Partition Key: user_id (required)
├── Sort Key: created_at (optional)
└── Attributes: name, email, age (schemaless)

Primary Key options:
  1. Simple: Partition key only
  2. Composite: Partition key + Sort key
```

### Capacity and Consistency

| Mode | Description |
|------|-------------|
| On-demand | Pay per request, auto-scales |
| Provisioned | Pre-allocate read/write capacity units |

| Read Consistency | Behavior |
|-----------------|----------|
| Eventually consistent | May return stale data (default, cheaper) |
| Strongly consistent | Always returns latest write (2x cost) |

### Global Secondary Indexes (GSI)

```json
{
  "TableName": "Orders",
  "KeySchema": [
    {"AttributeName": "order_id", "KeyType": "HASH"}
  ],
  "GlobalSecondaryIndexes": [
    {
      "IndexName": "CustomerIndex",
      "KeySchema": [
        {"AttributeName": "customer_id", "KeyType": "HASH"},
        {"AttributeName": "order_date", "KeyType": "RANGE"}
      ]
    }
  ]
}
```

---

## Comparison Table

| Feature | Redis | Memcached | Riak | DynamoDB |
|---------|-------|-----------|------|----------|
| **Type** | In-memory + optional persistence | Pure cache | Disk-based + memory | Managed cloud |
| **Data model** | Rich structures | Strings only | Key-value + CRDTs | Key-value + document |
| **Consistency** | Strong (single node) | N/A | Tunable (N,R,W) | Tunable (eventual/strong) |
| **Replication** | Leader-follower | None | Leaderless | Managed multi-AZ |
| **Partitioning** | Hash slots (16384) | Client-side | Consistent hashing | Managed partitioning |
| **Max value size** | 512 MB | 1 MB | Unlimited | 400 KB |
| **Best for** | Caching, real-time | Simple caching | High availability | Serverless, managed |
| **Availability** | High (with Sentinel/Cluster) | Medium | Very high | Very high (SLA 99.999%) |
| **Operational cost** | Self-managed or cloud | Self-managed | Self-managed | Fully managed |

---

## Use Cases

### 1. Caching

```python
# Cache-aside pattern with Redis
import redis
import json

r = redis.Redis(host='localhost', port=6379)

def get_product(product_id):
    cache_key = f"product:{product_id}"

    # Try cache first
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)

    # Cache miss: query database
    product = db.query_product(product_id)

    # Store in cache with TTL
    r.setex(cache_key, 600, json.dumps(product))  # 10 min TTL
    return product
```

### 2. Session Storage

```python
# Store user sessions in Redis
def create_session(user_id):
    session_id = generate_uuid()
    session_data = {
        "user_id": user_id,
        "created_at": time.time(),
        "ip": request.remote_addr
    }
    r.setex(f"session:{session_id}", 86400, json.dumps(session_data))
    return session_id

def get_session(session_id):
    data = r.get(f"session:{session_id}")
    return json.loads(data) if data else None
```

### 3. Shopping Cart (Dynamo-style)

```python
# Shopping cart using a KV store (eventual consistency is acceptable)
def add_to_cart(user_id, item):
    cart_key = f"cart:{user_id}"
    cart = kv_store.get(cart_key) or {"items": [], "version": VectorClock()}
    cart["items"].append(item)
    cart["version"].increment(current_node)
    kv_store.put(cart_key, cart)

def merge_carts(cart_a, cart_b):
    """Resolve conflicts by union of items."""
    merged_items = list(set(cart_a["items"] + cart_b["items"]))
    merged_version = cart_a["version"].merge(cart_b["version"])
    return {"items": merged_items, "version": merged_version}
```

### 4. Rate Limiting

```python
def is_rate_limited(user_id, max_requests=100, window=60):
    key = f"rate:{user_id}:{int(time.time()) // window}"
    current = r.incr(key)
    if current == 1:
        r.expire(key, window)
    return current > max_requests
```

---

## When to Use Key-Value Stores

### KV Stores Shine When:

| Scenario | Why KV Works |
|----------|--------------|
| Simple lookups by ID | O(1) access pattern |
| High throughput needed | Minimal overhead per operation |
| Flexible schema | Values are opaque — no migrations |
| Horizontal scaling | Easy to partition by key |
| Caching layer | Fast reads, TTL support |
| Session management | Simple get/set with expiration |

### Use Relational Instead When:

| Scenario | Why Relational Wins |
|----------|-------------------|
| Complex queries (joins, aggregations) | SQL is purpose-built for this |
| Relationships between entities | Foreign keys, referential integrity |
| ACID transactions across records | Multi-key atomicity is hard in KV |
| Ad-hoc querying | KV only supports primary key lookup |
| Data with strong schema requirements | Relational enforces structure |
| Reporting and analytics | SQL aggregations and window functions |

---

## Exercises

### Exercise 1: Design a URL Shortener

Design a KV store-based URL shortener. Consider:
- What is the key? What is the value?
- How do you generate short URLs?
- What consistency level do you need?
- How do you handle expiration?

<details>
<summary>Solution</summary>

```python
import hashlib
import redis
import time

r = redis.Redis()

def shorten(long_url, ttl_days=30):
    # Generate short code from URL hash
    short_code = hashlib.md5(long_url.encode()).hexdigest()[:7]
    key = f"url:{short_code}"

    # Store with metadata
    r.hset(key, mapping={
        "long_url": long_url,
        "created_at": str(time.time()),
        "clicks": "0"
    })
    r.expire(key, ttl_days * 86400)
    return short_code

def resolve(short_code):
    key = f"url:{short_code}"
    r.hincrby(key, "clicks", 1)  # Atomic counter
    return r.hget(key, "long_url")
```

**Consistency**: Eventual consistency is fine — a newly shortened URL being unavailable for a few milliseconds is acceptable.

</details>

### Exercise 2: Implement a Distributed Counter

Build a counter that works across multiple nodes without coordination:

<details>
<summary>Solution</summary>

```python
# Using a CRDT G-Counter (Grow-only Counter)
class GCounter:
    def __init__(self, node_id):
        self.node_id = node_id
        self.counts = {}  # {node_id: count}

    def increment(self):
        self.counts[self.node_id] = self.counts.get(self.node_id, 0) + 1

    def value(self):
        return sum(self.counts.values())

    def merge(self, other):
        """Merge by taking max of each node's counter."""
        for node, count in other.counts.items():
            self.counts[node] = max(self.counts.get(node, 0), count)

# Usage across nodes:
# Node A: counter_a.increment() → {A: 5}
# Node B: counter_b.increment() → {B: 3}
# After merge: {A: 5, B: 3} → value = 8
```

</details>

### Exercise 3: Quorum Calculator

Given N=5 replicas, determine valid R and W combinations:

<details>
<summary>Solution</summary>

For strong consistency: R + W > N (i.e., R + W > 5)

| R | W | R+W | Consistent? | Notes |
|---|---|-----|-------------|-------|
| 1 | 5 | 6 | Yes | Fastest reads, all nodes must write |
| 2 | 4 | 6 | Yes | Fast reads, most nodes write |
| 3 | 3 | 6 | Yes | Balanced read/write |
| 4 | 2 | 6 | Yes | Slow reads, fast writes |
| 5 | 1 | 6 | Yes | All nodes read, single-node write |
| 1 | 1 | 2 | No | Eventual consistency only |
| 2 | 2 | 4 | No | Not strongly consistent |

**Fault tolerance**: With N=5, you can tolerate `N - W` write failures and `N - R` read failures.

</details>

---

## Summary

- Key-value stores offer the simplest data model: `PUT`, `GET`, `DELETE` on opaque values
- Dynamo introduced consistent hashing, vector clocks, sloppy quorums, and gossip for building highly available distributed KV stores
- Redis excels as an in-memory store with rich data structures and optional persistence
- Memcached is optimized for simple, high-throughput caching with no persistence
- Riak builds on Dynamo's ideas with CRDTs for automatic conflict resolution
- DynamoDB offers a fully managed KV/document store with tunable consistency
- Choose KV stores for simple access patterns and horizontal scalability; choose relational databases for complex queries and strong transactional guarantees

---
