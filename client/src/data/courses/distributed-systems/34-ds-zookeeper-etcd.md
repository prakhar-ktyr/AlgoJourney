---
title: "ZooKeeper and etcd"
---

# ZooKeeper and etcd

Coordination services solve one of the hardest problems in distributed systems: getting multiple nodes to agree on shared state. ZooKeeper and etcd are the two most widely deployed solutions.

---

## Why Coordination Services Exist

Distributed systems face fundamental challenges when nodes must cooperate:

| Problem | Description | Without Coordination |
|---------|-------------|---------------------|
| Leader Election | Choosing one node to act as primary | Split-brain, multiple leaders |
| Configuration | Sharing settings across nodes | Inconsistent configs, stale data |
| Service Discovery | Finding which nodes are alive | Stale endpoints, failed connections |
| Distributed Locks | Mutual exclusion across machines | Race conditions, data corruption |
| Barrier Sync | Waiting for all nodes before proceeding | Partial execution, deadlocks |

Building these primitives from scratch is error-prone. Coordination services provide **linearizable**, **highly available** primitives that applications build upon.

---

## ZooKeeper Overview

Apache ZooKeeper was developed at Yahoo! Research and became a foundational component of the Hadoop ecosystem.

### Core Design Principles

- **Simple API** — a small set of operations on a hierarchical namespace
- **Replicated** — data replicated across an ensemble of servers
- **Ordered** — strict ordering of all updates
- **Fast** — optimized for read-heavy workloads (10:1 read/write ratio)

---

## ZooKeeper Data Model: Znodes

ZooKeeper organizes data in a **hierarchical namespace** similar to a file system. Each node is called a **znode**.

```
/
├── /app1
│   ├── /app1/leader
│   ├── /app1/config
│   └── /app1/members
│       ├── /app1/members/node-001
│       └── /app1/members/node-002
├── /app2
│   └── /app2/locks
│       └── /app2/locks/resource-A
└── /zookeeper
    └── /zookeeper/quota
```

Each znode can store up to **1 MB** of data and has associated metadata:

```
cZxid = 0x100000002        # Transaction ID when created
ctime = Mon Jan 15 10:30:00 UTC 2024
mZxid = 0x100000005        # Transaction ID of last modification
mtime = Mon Jan 15 11:45:00 UTC 2024
pZxid = 0x100000004        # Transaction ID of last child change
cversion = 3               # Number of child changes
dataVersion = 2            # Number of data changes
aclVersion = 0             # Number of ACL changes
ephemeralOwner = 0x0       # Session ID if ephemeral, 0 otherwise
dataLength = 42            # Length of data
numChildren = 2            # Number of children
```

---

## Types of Znodes

### Persistent Nodes

Persist until explicitly deleted. Survive client disconnection and server restarts.

```bash
# Create a persistent znode
create /app1/config "database_url=postgres://db:5432"
```

### Ephemeral Nodes

Automatically deleted when the creating client's session ends (disconnects or times out).

```bash
# Create an ephemeral znode
create -e /app1/members/node-001 "host=192.168.1.10:8080"
```

**Key properties:**
- Cannot have children
- Tied to the session that created them
- Perfect for representing liveness (heartbeats)

### Sequential Nodes

ZooKeeper appends a monotonically increasing counter to the node name.

```bash
# Create sequential nodes
create -s /app1/locks/lock- "owner=client-A"
# Result: /app1/locks/lock-0000000001

create -s /app1/locks/lock- "owner=client-B"
# Result: /app1/locks/lock-0000000002
```

### Ephemeral Sequential Nodes

Combines both properties — auto-deleted on disconnect, with sequential numbering. This is the building block for distributed locks and leader election.

```bash
create -e -s /app1/election/candidate- "node=server-3"
# Result: /app1/election/candidate-0000000007
```

---

## Watches

Watches allow clients to receive notifications when a znode changes. They are **one-time triggers** — after firing, the client must set a new watch.

```bash
# Set a watch on data changes
get -w /app1/config

# Set a watch on children changes
ls -w /app1/members
```

### Watch Events

| Event Type | Trigger |
|-----------|---------|
| NodeCreated | A watched znode is created |
| NodeDeleted | A watched znode is deleted |
| NodeDataChanged | Data of a watched znode changes |
| NodeChildrenChanged | Children of a watched znode change |

### Watch Guarantees

1. **Ordered** — events delivered in the order they occurred
2. **Consistent** — client sees the watch event before seeing the new data
3. **No missed updates** — between getting a watch event and setting a new watch, all changes are visible via the version number

---

## Sessions

A ZooKeeper session is a connection between a client and the ensemble.

```
Client ──── Session (timeout=30s) ────► ZooKeeper Ensemble
                    │
                    ├── Heartbeats every tick (2s default)
                    ├── Ephemeral nodes tied to this session
                    └── Session ID assigned by leader
```

**Session states:**

| State | Description |
|-------|-------------|
| CONNECTING | Client attempting to connect |
| CONNECTED | Active session, operations allowed |
| RECONNECTING | Lost connection, trying to reconnect |
| RECONNECTED | Session restored after reconnection |
| EXPIRED | Session timed out, all ephemeral nodes deleted |

---

## ZooKeeper Recipes

### Leader Election

```
Algorithm:
1. Each candidate creates an ephemeral sequential node under /election
2. Get all children of /election, sort them
3. If your node has the smallest sequence number → you are the leader
4. Otherwise, set a watch on the node with the next-smaller number
5. If that node disappears (watch fires), repeat from step 2
```

```bash
# Node A joins
create -e -s /election/candidate- ""
# → /election/candidate-0000000001 (leader!)

# Node B joins
create -e -s /election/candidate- ""
# → /election/candidate-0000000002 (watches 0000000001)

# Node C joins
create -e -s /election/candidate- ""
# → /election/candidate-0000000003 (watches 0000000002)

# Node A crashes → ephemeral node deleted
# Node B's watch fires → Node B becomes leader
```

**Why watch only the predecessor?** Avoids the "herd effect" where all nodes wake up simultaneously.

### Distributed Locks

```
Algorithm:
1. Create ephemeral sequential node under /locks/resource-name
2. Get all children, sort them
3. If your node is the smallest → lock acquired
4. Otherwise, watch the next-smaller node
5. On watch notification, check if you are now the smallest
6. Delete your node to release the lock
```

### Read-Write Locks

```
Write Lock:
1. Create /locks/resource/write-XXXX (ephemeral sequential)
2. Get children; if yours is smallest → acquired
3. Else watch predecessor

Read Lock:
1. Create /locks/resource/read-XXXX (ephemeral sequential)
2. Get children; if no write-node with smaller number → acquired
3. Else watch the largest write-node smaller than yours
```

### Barriers

A barrier blocks all processes until a condition is met (e.g., N nodes ready).

```
Algorithm:
1. Each process creates /barrier/ready-N
2. Each process checks: ls /barrier | count == N?
3. If not, watch /barrier for children changes
4. When count == N, all proceed
```

### Group Membership

```bash
# Node joins group
create -e /groups/my-app/member-A "host=10.0.0.1:8080"

# Monitor group
ls -w /groups/my-app
# Returns: [member-A, member-B, member-C]

# When a node crashes, its ephemeral node disappears
# Watch fires → remaining members notified
```

---

## ZooKeeper Ensemble and ZAB Protocol

ZooKeeper runs as a **replicated state machine** across an odd number of servers (3, 5, or 7 typically).

### Architecture

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Server 1│     │ Server 2│     │ Server 3│
│ (Leader)│◄───►│(Follower)│◄───►│(Follower)│
└────┬────┘     └────┬────┘     └────┬────┘
     │               │               │
     └───────────────┴───────────────┘
              Quorum (2 of 3)
```

### ZAB (ZooKeeper Atomic Broadcast)

ZAB ensures all servers agree on the order of updates:

**Phase 1: Leader Election**
- Servers exchange votes (epoch, zxid, server-id)
- Server with highest (epoch, zxid) wins
- Requires a quorum (majority)

**Phase 2: Discovery/Synchronization**
- New leader collects latest state from followers
- Ensures all followers have the same committed history

**Phase 3: Broadcast**
- Leader assigns a unique zxid to each write
- Proposes write to all followers
- Waits for quorum of ACKs
- Commits and notifies followers to commit

```
Client          Leader          Follower1       Follower2
  │── write ──────►│                │               │
  │                │── propose ────►│               │
  │                │── propose ───────────────────►│
  │                │◄──── ACK ─────│               │
  │                │◄──── ACK ──────────────────── │
  │                │── commit ─────►│               │
  │                │── commit ───────────────────►│
  │◄── response ──│                │               │
```

### Quorum Requirements

| Ensemble Size | Quorum | Tolerated Failures |
|:---:|:---:|:---:|
| 3 | 2 | 1 |
| 5 | 3 | 2 |
| 7 | 4 | 3 |

---

## etcd Overview

etcd is a strongly consistent, distributed key-value store built on the **Raft** consensus algorithm. Originally created for CoreOS, it became the backbone of Kubernetes.

### Key Properties

- **Linearizable reads and writes** (with appropriate options)
- **Multi-Version Concurrency Control (MVCC)** — retains history
- **Watch** — streaming notifications on key changes
- **Lease** — TTL-based key expiration
- **Transactions** — atomic compare-and-swap operations

---

## etcd Key-Value Operations

### Basic CRUD

```bash
# Put a key
etcdctl put /services/web/config '{"port": 8080, "workers": 4}'

# Get a key
etcdctl get /services/web/config

# Get with prefix (range query)
etcdctl get /services/ --prefix

# Delete a key
etcdctl del /services/web/config

# Delete with prefix
etcdctl del /services/ --prefix
```

### Versioning and History

```bash
# Get a key at a specific revision
etcdctl get /services/web/config --rev=15

# Watch from a specific revision (replay history)
etcdctl watch /services/ --prefix --rev=10

# Compact old revisions to reclaim space
etcdctl compaction 1000
```

---

## etcd Watch

Watches in etcd are **persistent streams** (unlike ZooKeeper's one-time watches).

```bash
# Watch a single key
etcdctl watch /services/web/config

# Watch a prefix
etcdctl watch /services/ --prefix

# Watch starting from a revision
etcdctl watch /services/ --prefix --rev=42

# Watch with progress notifications (heartbeats)
etcdctl watch /services/ --prefix --progress-notify
```

Output format:

```
PUT
/services/web/config
{"port": 9090, "workers": 8}

DELETE
/services/web/config
```

---

## etcd Leases

Leases provide TTL-based automatic key expiration — the equivalent of ZooKeeper's ephemeral nodes.

```bash
# Grant a lease with 30-second TTL
etcdctl lease grant 30
# lease 694d8257013e211a granted with TTL(30s)

# Put a key attached to the lease
etcdctl put /services/web/node-1 "alive" --lease=694d8257013e211a

# Keep the lease alive (heartbeat)
etcdctl lease keep-alive 694d8257013e211a

# Revoke a lease (deletes all attached keys)
etcdctl lease revoke 694d8257013e211a

# Check lease TTL remaining
etcdctl lease timetolive 694d8257013e211a --keys
```

### Service Registration Pattern

```bash
# Service registers itself with a lease
LEASE=$(etcdctl lease grant 10 | awk '{print $2}')
etcdctl put /services/web/node-1 '{"host":"10.0.0.1","port":8080}' --lease=$LEASE

# Keep-alive in background (renews every ~TTL/3)
etcdctl lease keep-alive $LEASE &

# If the service crashes, lease expires → key deleted
# Watchers on /services/web/ are notified
```

---

## etcd Transactions

Transactions provide atomic compare-and-swap semantics: `if (conditions) then (ops) else (ops)`.

```bash
# Atomic compare-and-swap
etcdctl txn <<EOF
compares:
  value("/services/web/leader") = "node-1"

success requests:
  put /services/web/leader node-2

failure requests:
  get /services/web/leader
EOF
```

### Leader Election with Transactions

```bash
# Try to become leader (only succeeds if key doesn't exist)
etcdctl txn <<EOF
compares:
  create_revision("/leader") = 0

success requests:
  put /leader "node-A" --lease=$MY_LEASE

failure requests:
  get /leader
EOF
```

---

## etcd and Kubernetes

Kubernetes uses etcd as its **single source of truth** for all cluster state.

```
┌──────────────────────────────────────────┐
│             Kubernetes Cluster            │
│                                          │
│  ┌──────────┐    ┌──────────────────┐   │
│  │API Server │───►│      etcd        │   │
│  └──────────┘    │  /registry/pods   │   │
│       │          │  /registry/svcs   │   │
│       ▼          │  /registry/nodes  │   │
│  ┌──────────┐   │  /registry/...    │   │
│  │Controller │   └──────────────────┘   │
│  │ Manager   │                           │
│  └──────────┘                            │
│  ┌──────────┐                            │
│  │Scheduler  │                            │
│  └──────────┘                            │
└──────────────────────────────────────────┘
```

### What Kubernetes Stores in etcd

| Key Pattern | Data |
|-------------|------|
| `/registry/pods/{ns}/{name}` | Pod specifications and status |
| `/registry/services/{ns}/{name}` | Service definitions |
| `/registry/deployments/{ns}/{name}` | Deployment configs |
| `/registry/secrets/{ns}/{name}` | Encrypted secrets |
| `/registry/configmaps/{ns}/{name}` | ConfigMaps |
| `/registry/leases/{ns}/{name}` | Leader election leases |

### Why etcd for Kubernetes?

- **Watch API** enables controllers to react to state changes
- **Consistency** ensures no split-brain scheduling
- **Revision history** supports optimistic concurrency (resourceVersion)
- **Compact binary protocol** (gRPC + protobuf) for performance

---

## Comparison: ZooKeeper vs etcd vs Consul

| Feature | ZooKeeper | etcd | Consul |
|---------|-----------|------|--------|
| **Consensus** | ZAB | Raft | Raft |
| **Data Model** | Hierarchical (znodes) | Flat key-value | Key-value + service catalog |
| **Watch** | One-time triggers | Persistent streams | Long-polling / streaming |
| **TTL/Expiry** | Ephemeral nodes (session) | Leases | Session-based TTL |
| **Transactions** | Multi-op | Txn (if/then/else) | Check-and-set |
| **Max Data/Key** | 1 MB per znode | ~1.5 MB per key | 512 KB per value |
| **Language** | Java | Go | Go |
| **Protocol** | Custom TCP | gRPC + HTTP/JSON | HTTP + gRPC |
| **Auth** | ACLs (SASL/Digest) | RBAC + TLS certs | ACL tokens + TLS |
| **Typical Use** | Hadoop, Kafka, HBase | Kubernetes, CoreDNS | Service mesh, Nomad |
| **Linearizable Reads** | Sync reads only | Default (serializable also available) | Consistent mode |
| **Multi-DC** | Not built-in | Not built-in | Native WAN federation |

### Performance Characteristics

| Metric | ZooKeeper | etcd |
|--------|-----------|------|
| Write latency | 2-10 ms | 2-15 ms |
| Read latency (local) | <1 ms | <1 ms |
| Throughput (reads) | ~100K ops/s | ~30K ops/s |
| Throughput (writes) | ~20K ops/s | ~15K ops/s |
| Recommended ensemble | 3-7 nodes | 3-5 nodes |

---

## When to Use Coordination Services

### Use a Coordination Service When:

- Multiple services must elect a single leader
- Distributed locks are needed for shared resources
- Configuration must be consistent across all nodes
- Service discovery needs strong consistency guarantees
- You need ordered, reliable event notifications

### Do NOT Use for:

- General-purpose data storage (use a database)
- High-throughput message queuing (use Kafka, RabbitMQ)
- Large data blobs (use object storage)
- Caching (use Redis, Memcached)
- Analytics or time-series data

### Choosing Between Them

| Choose... | When... |
|-----------|---------|
| **ZooKeeper** | Existing Hadoop/Kafka ecosystem; need high read throughput |
| **etcd** | Kubernetes environment; prefer gRPC; need persistent watches |
| **Consul** | Need built-in service mesh; multi-datacenter; health checking |

---

## Practical Examples

### Example 1: Service Discovery with etcd

```bash
# Register service instances
etcdctl put /services/payment/node-1 '{"host":"10.0.1.1","port":8080}'
etcdctl put /services/payment/node-2 '{"host":"10.0.1.2","port":8080}'
etcdctl put /services/payment/node-3 '{"host":"10.0.1.3","port":8080}'

# Discover all instances
etcdctl get /services/payment/ --prefix
# Returns all 3 entries

# Watch for changes (in another terminal)
etcdctl watch /services/payment/ --prefix
```

### Example 2: Distributed Lock with etcd

```bash
# Acquire lock (built-in command)
etcdctl lock /locks/database-migration
# Holds lock until process exits or Ctrl+C

# With a command to execute while holding the lock
etcdctl lock /locks/database-migration -- ./run-migration.sh
```

### Example 3: Leader Election with ZooKeeper CLI

```bash
# Connect to ZooKeeper
zkCli.sh -server localhost:2181

# Create election parent
create /election ""

# Each candidate creates an ephemeral sequential node
create -e -s /election/candidate- "node-1-data"
# Created /election/candidate-0000000001

# List candidates (sorted)
ls /election
# [candidate-0000000001, candidate-0000000002]

# Check who is leader (smallest sequence)
get /election/candidate-0000000001
```

### Example 4: Configuration Management with etcd

```bash
# Store application config
etcdctl put /config/app/database_url "postgres://db:5432/prod"
etcdctl put /config/app/cache_ttl "300"
etcdctl put /config/app/max_connections "100"

# Application watches for config changes
etcdctl watch /config/app/ --prefix
# When an admin updates:
etcdctl put /config/app/max_connections "200"
# Watch outputs the change → app reloads config
```

---

## Exercise 1: Design a Distributed Lock

Given an etcd cluster, design a distributed lock that:
1. Has a TTL (auto-releases if holder crashes)
2. Supports lock contention (queuing)
3. Is fair (first-come, first-served)

**Hint:** Combine leases, sequential keys (prefix-based), and watches.

<details>
<summary>Solution</summary>

```bash
# Step 1: Create a lease
LEASE=$(etcdctl lease grant 30 | grep -oP 'lease \K[a-f0-9]+')

# Step 2: Create a sequential key under the lock prefix
etcdctl put /locks/mylock/$(uuidgen) "my-id" --lease=$LEASE

# Step 3: List all keys under the prefix, sort by create_revision
etcdctl get /locks/mylock/ --prefix --sort-by=CREATE --sort-order=ASCEND

# Step 4: If your key has the smallest create_revision → lock acquired
# Otherwise, watch the key with the next-smaller revision

# Step 5: Keep lease alive while holding lock
etcdctl lease keep-alive $LEASE

# Step 6: Delete your key to release
etcdctl del /locks/mylock/<your-key>
```

</details>

---

## Exercise 2: Implement Group Membership

Design a group membership system using ZooKeeper where:
- Nodes announce themselves when joining
- All members are notified when membership changes
- A crashed node is automatically removed

<details>
<summary>Solution</summary>

```
1. Create a persistent parent: create /groups/my-service ""

2. Each member creates an ephemeral node:
   create -e /groups/my-service/member-{hostname} "{host, port, metadata}"

3. Each member watches the parent:
   ls -w /groups/my-service

4. On NodeChildrenChanged event:
   - Re-list children: ls -w /groups/my-service
   - Compare with previous list to detect joins/leaves
   - Update local routing table

5. When a member crashes:
   - Session expires → ephemeral node deleted
   - Watch fires on all other members
   - Members update their view of the group
```

</details>

---

## Exercise 3: ZooKeeper vs etcd Trade-offs

For each scenario, choose the best coordination service and explain why:

1. You are running Apache Kafka and need a metadata store
2. You are building a new microservices platform on Kubernetes
3. You need multi-datacenter service discovery with health checks
4. You have a read-heavy workload with 100K reads/second

<details>
<summary>Solution</summary>

1. **ZooKeeper** — Kafka was built on ZooKeeper (though newer versions use KRaft). Existing integration is battle-tested.

2. **etcd** — Native Kubernetes integration. Controllers already use etcd watches. gRPC protocol matches the ecosystem.

3. **Consul** — Built-in multi-DC federation and health checking. Neither ZooKeeper nor etcd natively supports cross-datacenter replication.

4. **ZooKeeper** — Optimized for read-heavy workloads. Followers serve reads locally without contacting the leader, achieving higher read throughput than etcd.

</details>

---

## Summary

| Concept | Key Takeaway |
|---------|-------------|
| Coordination services | Provide consistent distributed primitives (locks, election, config) |
| ZooKeeper znodes | Hierarchical; persistent, ephemeral, sequential variants |
| ZooKeeper watches | One-time triggers; must re-register after firing |
| ZAB protocol | Leader-based; quorum writes; ordered broadcasts |
| etcd key-value | Flat namespace; MVCC with revision history |
| etcd watches | Persistent streams; can replay from any revision |
| etcd leases | TTL-based expiration; equivalent to ephemeral nodes |
| etcd transactions | Atomic if/then/else; enables lock-free algorithms |
| Kubernetes + etcd | All cluster state stored in etcd; watch API drives controllers |
| Choosing | ZooKeeper for Hadoop ecosystem; etcd for K8s; Consul for service mesh |

---
