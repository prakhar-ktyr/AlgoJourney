---
title: "Distributed Databases"
---

# Distributed Databases

A **distributed database** stores data across multiple nodes while presenting a unified interface to applications. Modern distributed databases aim to combine the scalability of NoSQL with the transactional guarantees of traditional SQL.

---

## The NewSQL Movement

NewSQL databases bridge the gap between traditional SQL databases and distributed NoSQL systems.

| Property | Traditional SQL | NoSQL | NewSQL |
|----------|----------------|-------|--------|
| ACID Transactions | Yes | Limited | Yes |
| Horizontal Scaling | Difficult | Yes | Yes |
| SQL Interface | Yes | No | Yes |
| Strong Consistency | Yes | Eventually | Yes |
| Schema Enforcement | Strict | Flexible | Strict/Flexible |

### Why NewSQL?

```
Traditional SQL (single-node)
├── Strong consistency ✓
├── ACID transactions ✓
├── SQL queries ✓
└── Horizontal scaling ✗  ← bottleneck

NoSQL (distributed)
├── Horizontal scaling ✓
├── High availability ✓
├── ACID transactions ✗  ← limitation
└── SQL queries ✗         ← limitation

NewSQL (distributed + SQL)
├── Strong consistency ✓
├── ACID transactions ✓
├── SQL queries ✓
└── Horizontal scaling ✓  ← best of both worlds
```

---

## Google Spanner

Google Spanner is the first globally distributed database to provide externally consistent transactions at scale.

### TrueTime API

Spanner's core innovation is **TrueTime** — a globally synchronized clock API that returns a time interval rather than a single timestamp.

```
TrueTime API:
┌─────────────────────────────────────┐
│  TT.now() → [earliest, latest]      │
│  TT.after(t) → true if t has passed │
│  TT.before(t) → true if t hasn't    │
└─────────────────────────────────────┘

Time uncertainty interval:
|←── ε (typically 1-7ms) ──→|
[earliest]              [latest]
```

TrueTime relies on:
- GPS receivers in each data center
- Atomic clocks as backup
- A daemon that cross-references multiple time sources

### External Consistency

External consistency guarantees that if transaction T1 commits before T2 starts, T1's commit timestamp is less than T2's.

```
Transaction T1: [───────commit(ts=10)──]
                                        wait(ε)
Transaction T2:                              [─────start(ts=12)───]

Guarantee: ts(T1) < ts(T2) always holds
```

Spanner achieves this through **commit-wait**: after assigning a timestamp, the leader waits for TrueTime uncertainty to pass before releasing the commit.

### Sharding in Spanner

```
Spanner Hierarchy:
┌─────────────────────────────────┐
│           Universe               │
├─────────────────────────────────┤
│  Zone A      Zone B      Zone C  │
│  ┌─────┐   ┌─────┐   ┌─────┐  │
│  │Span-│   │Span-│   │Span-│  │
│  │server│   │server│   │server│  │
│  └─────┘   └─────┘   └─────┘  │
│                                  │
│  Data split into "splits"        │
│  Each split → Paxos group       │
└─────────────────────────────────┘
```

- Data is divided into **splits** (contiguous key ranges)
- Each split is replicated via **Paxos** across zones
- A split can move between spanservers for load balancing

---

## CockroachDB

CockroachDB is an open-source distributed SQL database inspired by Spanner but designed to run without specialized hardware.

### Architecture

```
┌────────────────────────────────────────────┐
│              SQL Layer                       │
│  (Parser → Optimizer → Executor)            │
├────────────────────────────────────────────┤
│          Transaction Layer (KV)             │
│  (MVCC, Timestamp ordering, 2PC)           │
├────────────────────────────────────────────┤
│          Distribution Layer                 │
│  (Range descriptors, Lease holders)         │
├────────────────────────────────────────────┤
│          Replication Layer (Raft)           │
│  (Consensus, Log replication)              │
├────────────────────────────────────────────┤
│          Storage Layer (Pebble)            │
│  (LSM tree, SSTs, Compaction)              │
└────────────────────────────────────────────┘
```

### Raft-Based Replication

CockroachDB uses **Raft consensus** instead of Paxos:

```
Raft Group for Range [a-f]:
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Node 1  │     │ Node 2  │     │ Node 3  │
│ LEADER  │────▶│FOLLOWER │     │FOLLOWER │
│         │────▶│         │     │         │
└─────────┘     └─────────┘     └─────────┘
     │                                ▲
     └────────────────────────────────┘

Write path:
1. Client → Leaseholder (leader)
2. Leader appends to Raft log
3. Leader replicates to followers
4. Majority acknowledgment → commit
5. Apply to state machine
```

### Range Partitioning

Data is split into **ranges** (default 512 MB each):

```sql
-- CockroachDB automatically splits ranges
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id INT,
  total DECIMAL,
  region STRING
);

-- Explicit geo-partitioning
ALTER TABLE orders PARTITION BY LIST (region) (
  PARTITION us_east VALUES IN ('us-east-1', 'us-east-2'),
  PARTITION us_west VALUES IN ('us-west-1', 'us-west-2'),
  PARTITION eu VALUES IN ('eu-west-1', 'eu-central-1')
);
```

---

## TiDB

TiDB is a MySQL-compatible distributed database that separates compute from storage.

### Architecture

```
┌──────────────────────────────────────────┐
│          TiDB Server (SQL Layer)          │
│   MySQL Protocol │ SQL Parser │ Optimizer │
├──────────────────────────────────────────┤
│              Placement Driver (PD)        │
│   Cluster metadata │ TSO │ Scheduling     │
├──────────────────────────────────────────┤
│           TiKV (Storage Layer)            │
│   Raft │ MVCC │ Transactions │ RocksDB    │
└──────────────────────────────────────────┘

Optional:
┌──────────────────────────────────────────┐
│           TiFlash (Analytics)             │
│   Columnar storage │ OLAP acceleration    │
└──────────────────────────────────────────┘
```

### TiKV Storage Engine

```
TiKV Region (default 96MB):
┌─────────────────────────────────┐
│ Region 1: [key_a, key_m)        │
│   └── Raft Group (3 replicas)   │
├─────────────────────────────────┤
│ Region 2: [key_m, key_z)        │
│   └── Raft Group (3 replicas)   │
└─────────────────────────────────┘

Each TiKV node:
┌────────────────────┐
│   Raft Store       │
│   ┌──────────────┐ │
│   │   RocksDB    │ │  ← Raft logs
│   └──────────────┘ │
│   ┌──────────────┐ │
│   │   RocksDB    │ │  ← Actual KV data
│   └──────────────┘ │
└────────────────────┘
```

Key features:
- **MySQL compatibility**: drop-in replacement for many MySQL workloads
- **Horizontal scaling**: add TiKV nodes without downtime
- **HTAP**: combine TiKV (row) + TiFlash (columnar) for mixed workloads

---

## YugabyteDB

YugabyteDB is a PostgreSQL-compatible distributed database.

```
┌──────────────────────────────────────┐
│     YSQL (PostgreSQL-compatible)      │
│     YCQL (Cassandra-compatible)       │
├──────────────────────────────────────┤
│         Query Layer                   │
│  (Reuses PostgreSQL query engine)     │
├──────────────────────────────────────┤
│         DocDB (Storage)              │
│  ┌─────────────────────────────────┐ │
│  │  Raft consensus per tablet      │ │
│  │  LSM-based storage (RocksDB)    │ │
│  │  MVCC + Hybrid logical clocks   │ │
│  └─────────────────────────────────┘ │
└──────────────────────────────────────┘
```

Key advantages:
- Full PostgreSQL compatibility (extensions, stored procedures)
- Multi-region deployments with low-latency reads
- Tablet-based sharding with automatic splitting

---

## Vitess

Vitess is a database clustering system for horizontal scaling of MySQL.

```
┌─────────────────────────────────────────┐
│             Application                  │
├─────────────────────────────────────────┤
│              VTGate                       │
│  (Query routing, scatter-gather)         │
├────────┬────────┬────────┬──────────────┤
│VTTablet│VTTablet│VTTablet│  VTTablet    │
│Shard 0 │Shard 1 │Shard 2 │  Shard 3    │
├────────┼────────┼────────┼──────────────┤
│ MySQL  │ MySQL  │ MySQL  │  MySQL       │
│Primary │Primary │Primary │  Primary     │
│+Replica│+Replica│+Replica│  +Replica    │
└────────┴────────┴────────┴──────────────┘
```

Vitess features:
- **Connection pooling**: multiplexes thousands of connections
- **Query rewriting**: translates complex queries for sharded execution
- **Schema management**: online DDL across shards
- **Used by**: YouTube, Slack, GitHub, Square

---

## Distributed Transaction Handling

### Two-Phase Commit (2PC)

```
Coordinator                    Participants
    │                          │         │
    │──── PREPARE ────────────▶│         │
    │──── PREPARE ───────────────────────▶│
    │                          │         │
    │◀─── VOTE YES ───────────│         │
    │◀─── VOTE YES ──────────────────────│
    │                          │         │
    │──── COMMIT ─────────────▶│         │
    │──── COMMIT ────────────────────────▶│
    │                          │         │
    │◀─── ACK ────────────────│         │
    │◀─── ACK ───────────────────────────│
```

### Parallel Commit (CockroachDB optimization)

```
Traditional 2PC:    Client → Coordinator → Participants → Coordinator → Client
                    (2 round trips)

Parallel Commit:    Client → Coordinator + Participants (parallel)
                    (1 round trip for common case)

Mechanism:
1. Write intents to all participants in parallel
2. Mark transaction record as STAGING
3. Client can return once all writes acknowledged
4. Async: resolve intents → mark COMMITTED
```

---

## Partitioning Strategies

### Range Partitioning

```
Key space: [0 ─────────────────────── MAX]

Range partitions:
│  Shard 1   │  Shard 2   │  Shard 3   │
│ [0, 1000)  │[1000, 5000)│[5000, MAX) │

Pros: Efficient range scans, ordered iteration
Cons: Hotspots on sequential writes (auto-increment IDs)
```

### Hash Partitioning

```
Key: "user_12345"
Hash: SHA256("user_12345") mod num_shards = 2

│  Shard 0   │  Shard 1   │  Shard 2   │  Shard 3  │
│ hash%4==0  │ hash%4==1  │ hash%4==2  │ hash%4==3 │

Pros: Even distribution, no hotspots
Cons: Range scans require scatter-gather across all shards
```

### Geographic Partitioning

```
┌─────────────────────────────────────────────────┐
│                  Global Table                     │
├────────────────┬────────────────┬───────────────┤
│   US Region    │   EU Region    │  APAC Region  │
│                │                │               │
│ Users where    │ Users where    │ Users where   │
│ country IN     │ country IN     │ country IN    │
│ ('US','CA')    │ ('DE','FR'..)  │ ('JP','AU'..) │
│                │                │               │
│ Nodes: us-east │ Nodes: eu-west │ Nodes: ap-se │
│        us-west │        eu-cent │        ap-ne │
└────────────────┴────────────────┴───────────────┘

Benefits:
- Data locality → low-latency reads
- Compliance with data residency laws (GDPR)
- Fault isolation per region
```

---

## Cross-Shard Queries

Cross-shard queries are expensive because they require coordination across multiple nodes.

```sql
-- Single-shard query (fast):
SELECT * FROM orders WHERE customer_id = 42;
-- Routes to one shard if partitioned by customer_id

-- Cross-shard query (expensive):
SELECT c.name, SUM(o.total)
FROM customers c JOIN orders o ON c.id = o.customer_id
GROUP BY c.name;
-- Requires scatter-gather across all shards
```

### Optimization Strategies

| Strategy | Description | Use Case |
|----------|-------------|----------|
| Co-location | Store related data on same shard | Parent-child tables |
| Denormalization | Duplicate data to avoid joins | Read-heavy workloads |
| Global tables | Replicate small tables everywhere | Reference/lookup tables |
| Materialized views | Pre-compute cross-shard aggregates | Analytics dashboards |
| Query routing | Direct queries to single shard | Partition-aware applications |

```sql
-- CockroachDB: Interleaved tables (co-location)
CREATE TABLE customers (
  id INT PRIMARY KEY,
  name STRING
);

CREATE TABLE orders (
  customer_id INT,
  order_id INT,
  total DECIMAL,
  PRIMARY KEY (customer_id, order_id)
) INTERLEAVE IN PARENT customers (customer_id);
-- Orders stored with their parent customer → fast joins
```

---

## Comparison: Spanner vs CockroachDB vs TiDB

| Feature | Google Spanner | CockroachDB | TiDB |
|---------|---------------|-------------|------|
| **SQL Compatibility** | GoogleSQL | PostgreSQL | MySQL |
| **Consensus** | Paxos | Raft | Raft |
| **Clock Mechanism** | TrueTime (GPS+Atomic) | Hybrid Logical Clocks | Timestamp Oracle (TSO) |
| **Storage Engine** | Colossus (proprietary) | Pebble (LSM) | RocksDB (LSM) |
| **Deployment** | Cloud-only (GCP) | Self-hosted / Cloud | Self-hosted / Cloud |
| **Min Nodes** | 3 (managed) | 3 | 3 (TiKV) + 3 (PD) + 1 (TiDB) |
| **Consistency** | External | Serializable | Snapshot Isolation / Serializable |
| **Geo-Distribution** | Native (global) | Native (multi-region) | Via TiDB Operator |
| **HTAP Support** | Limited | Limited | Yes (TiFlash) |
| **License** | Proprietary | BSL / Cockroach Community | Apache 2.0 |
| **Latency (single region)** | ~5ms writes | ~10ms writes | ~10ms writes |
| **Best For** | Global-scale, GCP-native | Multi-cloud, PostgreSQL apps | MySQL migrations, HTAP |

---

## OLTP vs OLAP in Distributed Context

```
OLTP (Online Transaction Processing)
├── Short transactions (ms)
├── Point reads/writes
├── Row-oriented storage
├── High concurrency
├── Examples: CockroachDB, Spanner, TiDB (TiKV)
│
OLAP (Online Analytical Processing)
├── Long-running queries (seconds-minutes)
├── Full table scans, aggregations
├── Columnar storage
├── Lower concurrency, high throughput
├── Examples: BigQuery, Snowflake, TiDB (TiFlash)
│
HTAP (Hybrid Transactional/Analytical)
├── Both workloads on same system
├── Real-time analytics on live data
├── Avoids ETL pipeline delays
├── Examples: TiDB, AlloyDB, SingleStore
```

| Characteristic | OLTP (Distributed) | OLAP (Distributed) |
|---------------|--------------------|--------------------|
| Query type | INSERT, UPDATE, point SELECT | Aggregations, JOINs, scans |
| Data model | Normalized (3NF) | Denormalized (star/snowflake) |
| Storage format | Row-oriented | Columnar |
| Partitioning | Hash or range by PK | Time-based or dimension-based |
| Replication | Synchronous (Raft/Paxos) | Asynchronous often sufficient |
| Consistency | Strong (serializable) | Eventual often acceptable |
| Scaling priority | Write throughput | Read throughput |

---

## Choosing a Distributed Database

### Decision Framework

```
Start
  │
  ▼
Need SQL? ──── No ───▶ Consider NoSQL (Cassandra, DynamoDB)
  │ Yes
  ▼
Existing app? ──── MySQL ───▶ TiDB or Vitess
  │                 PostgreSQL ──▶ YugabyteDB or CockroachDB
  │ New app
  ▼
Global distribution needed?
  │ Yes ──▶ Google Spanner (GCP) or CockroachDB (multi-cloud)
  │ No
  ▼
Need HTAP? ──── Yes ───▶ TiDB or SingleStore
  │ No
  ▼
Scale of deployment?
  │ Small-medium ──▶ CockroachDB (simpler ops)
  │ Large ──────────▶ Evaluate based on workload
```

### Key Selection Criteria

| Criterion | Questions to Ask |
|-----------|-----------------|
| Compatibility | Which SQL dialect? Existing application? |
| Scale | Peak transactions/sec? Data volume? |
| Geography | Single-region or multi-region? Latency requirements? |
| Consistency | Can you tolerate eventual consistency? |
| Operations | Self-hosted or managed? Team expertise? |
| Cost | License model? Infrastructure requirements? |
| Workload | OLTP, OLAP, or mixed? Read/write ratio? |

---

## Exercises

1. **TrueTime Analysis**: If TrueTime reports an uncertainty interval of 5ms, what is the maximum commit-wait time? How does this affect write throughput compared to a system with 1ms uncertainty?

2. **Partitioning Design**: You have a multi-tenant SaaS application with 10,000 tenants. The largest tenant has 100x more data than the median. Design a partitioning strategy that avoids hotspots while keeping tenant data co-located. Which database would you choose?

3. **Cross-Shard Query Optimization**: Given this schema partitioned by `user_id`:
   ```sql
   CREATE TABLE posts (user_id INT, post_id INT, content TEXT, created_at TIMESTAMP);
   CREATE TABLE likes (user_id INT, post_id INT, liker_id INT);
   ```
   Rewrite or restructure to make "show all likes on my posts" efficient without scatter-gather.

4. **Comparison Exercise**: A fintech company needs a database for payment processing with these requirements: 99.99% uptime, <10ms read latency, global presence in US/EU/APAC, strict ACID compliance, and PostgreSQL compatibility. Compare CockroachDB, YugabyteDB, and Spanner. Which would you recommend and why?

5. **HTAP Architecture**: Design a system using TiDB where OLTP writes go to TiKV and analytics queries are served by TiFlash. Draw the data flow from write to analytical query result. What is the replication lag between TiKV and TiFlash?

---

## Summary

| Concept | Key Takeaway |
|---------|-------------|
| NewSQL | Combines SQL + ACID + horizontal scaling |
| Spanner | TrueTime enables global external consistency |
| CockroachDB | Raft-based, PostgreSQL-compatible, multi-cloud |
| TiDB | MySQL-compatible with HTAP via TiFlash |
| YugabyteDB | PostgreSQL-compatible with DocDB storage |
| Vitess | MySQL sharding layer (YouTube-proven) |
| Partitioning | Range (ordered), Hash (uniform), Geo (locality) |
| Cross-shard | Expensive; mitigate with co-location/denormalization |
| OLTP vs OLAP | Row vs columnar; HTAP bridges both |

Distributed databases represent the convergence of decades of research in distributed systems and database theory. The right choice depends on your compatibility needs, scale requirements, consistency guarantees, and operational capabilities.
