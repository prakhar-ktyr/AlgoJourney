---
title: "Wide-Column Stores"
---

# Wide-Column Stores

Wide-column stores are a type of NoSQL database that organizes data into rows and dynamic columns. Unlike relational databases with fixed schemas, wide-column stores allow each row to have a different set of columns, making them ideal for storing large-scale, sparse datasets.

---

## What Are Wide-Column Stores?

A wide-column store (also called a column-family store) uses tables, rows, and columns, but unlike a relational database:

- Each row can have a **different number of columns**
- Columns are grouped into **column families**
- Data is stored and retrieved by **row key + column family + column qualifier**

| Feature | Relational DB | Wide-Column Store |
|---------|--------------|-------------------|
| Schema | Fixed, predefined | Dynamic, flexible per row |
| Storage | Row-oriented | Column-family oriented |
| Joins | Supported | Not supported |
| Scale | Vertical (typically) | Horizontal |
| Query | SQL | Custom APIs / CQL |
| Best for | Transactions | Large-scale analytics, time-series |

### Logical Data Model

```
Row Key: "user:1001"
├── Column Family: "profile"
│   ├── "name" → "Alice"
│   ├── "email" → "alice@example.com"
│   └── "city" → "Seattle"
├── Column Family: "activity"
│   ├── "last_login" → "2026-05-01T10:30:00Z"
│   └── "login_count" → "142"
```

Each cell can also store **multiple versions** identified by timestamps.

---

## Google Bigtable

Google Bigtable is the original wide-column store, introduced in a 2006 paper. It powers many Google services including Search, Maps, and Gmail.

### Bigtable Data Model

| Concept | Description |
|---------|-------------|
| Row Key | Unique identifier, sorted lexicographically |
| Column Family | Grouping of related columns (must be predefined) |
| Column Qualifier | Individual column within a family (dynamic) |
| Timestamp | Version identifier for each cell value |
| Cell | Intersection of row key + column family + qualifier + timestamp |

```
// Bigtable logical view
// Table: "webtable"

Row Key: "com.example.www"
  Column Family "contents":
    "html" @ t3 → "<html>...</html>"
    "html" @ t2 → "<html>...</html>"  (older version)
  Column Family "anchor":
    "cnn.com" @ t1 → "CNN Homepage"
    "bbc.co.uk" @ t1 → "BBC News"
```

### Bigtable Architecture

```
┌─────────────────────────────────────────────────┐
│                  Client Library                   │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│              Master Server                        │
│  • Assigns tablets to tablet servers              │
│  • Balances load                                  │
│  • Garbage collection of deleted data             │
└─────────────────────┬───────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼───┐       ┌────▼──┐        ┌────▼──┐
│Tablet  │       │Tablet  │        │Tablet  │
│Server 1│       │Server 2│        │Server 3│
│        │       │        │        │        │
│┌──────┐│       │┌──────┐│        │┌──────┐│
││Tablet ││       ││Tablet ││        ││Tablet ││
││  A    ││       ││  C    ││        ││  E    ││
│├──────┤│       │├──────┤│        │├──────┤│
││Tablet ││       ││Tablet ││        ││Tablet ││
││  B    ││       ││  D    ││        ││  F    ││
│└──────┘│       │└──────┘│        │└──────┘│
└────────┘       └────────┘        └────────┘
     │                │                 │
     └────────────────┼─────────────────┘
                      │
          ┌───────────▼───────────┐
          │   GFS (Google File    │
          │      System)          │
          └───────────────────────┘
```

**Key components:**

| Component | Role |
|-----------|------|
| Tablet | Contiguous range of rows (~100-200 MB) |
| Tablet Server | Manages 10-1000 tablets, handles reads/writes |
| Master | Assigns tablets, detects server failures |
| Chubby | Distributed lock service for coordination |
| GFS | Underlying distributed file system for storage |

**Chubby's role in Bigtable:**

- Ensures only one active master exists
- Stores the bootstrap location of Bigtable metadata
- Discovers tablet servers and finalizes server deaths
- Stores schema information and access control lists

---

## Apache HBase

HBase is the open-source implementation of Bigtable, built on top of the Hadoop ecosystem.

### HBase Architecture

```
┌──────────────┐     ┌──────────────┐
│   HBase      │     │  ZooKeeper   │
│   Client     │────▶│  Ensemble    │
└──────┬───────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│  HMaster     │  (analogous to Bigtable Master)
└──────┬───────┘
       │
  ┌────┼────────────┐
  │    │            │
  ▼    ▼            ▼
┌────┐┌────┐     ┌────┐
│ RS ││ RS │ ... │ RS │   (RegionServers)
└─┬──┘└─┬──┘     └─┬──┘
  │     │          │
  ▼     ▼          ▼
┌─────────────────────┐
│       HDFS          │   (Hadoop Distributed File System)
└─────────────────────┘
```

### Key HBase Concepts

| Concept | Description |
|---------|-------------|
| Region | Contiguous range of rows (like Bigtable tablets) |
| RegionServer | Hosts multiple regions, handles client requests |
| HMaster | Coordinates RegionServers, handles schema changes |
| ZooKeeper | Provides coordination (replaces Chubby) |
| WAL | Write-Ahead Log for durability |
| MemStore | In-memory write buffer per column family |
| HFile | On-disk storage format (based on SSTable) |

### HBase Write Path

```
Client Write Request
       │
       ▼
┌─────────────────┐
│  RegionServer   │
│                 │
│  1. Write WAL   │──▶ HDFS (durability)
│  2. Write       │
│     MemStore    │──▶ In-memory buffer
│  3. Acknowledge │
│     client      │
│                 │
│  [When MemStore │
│   is full:]     │
│  4. Flush to    │
│     HFile       │──▶ HDFS (persistent)
└─────────────────┘
```

### HBase Shell Example

```bash
# Create a table with two column families
create 'users', 'profile', 'activity'

# Insert data
put 'users', 'user:1001', 'profile:name', 'Alice'
put 'users', 'user:1001', 'profile:email', 'alice@example.com'
put 'users', 'user:1001', 'activity:last_login', '2026-05-01'

# Read a full row
get 'users', 'user:1001'

# Scan a range
scan 'users', {STARTROW => 'user:1000', ENDROW => 'user:2000'}
```

---

## Apache Cassandra

Cassandra combines the distributed architecture of Amazon Dynamo with the data model of Google Bigtable. It is designed for high availability with no single point of failure.

### Ring Architecture

```
         Node A
        ╱      ╲
   Node F        Node B
      │    Token   │
      │    Ring    │
   Node E        Node C
        ╲      ╱
         Node D

Token Range Assignment:
  Node A: 0 – 49
  Node B: 50 – 99
  Node C: 100 – 149
  Node D: 150 – 199
  Node E: 200 – 249
  Node F: 250 – 299
```

**Key Cassandra properties:**

| Property | Description |
|----------|-------------|
| Peer-to-peer | No master node, all nodes are equal |
| Consistent hashing | Data distributed via partition key hash |
| Replication | Configurable replication factor (RF) |
| Gossip protocol | Nodes exchange state information |
| Hinted handoff | Temporarily stores writes for down nodes |
| Anti-entropy repair | Merkle trees to detect inconsistencies |

### Tunable Consistency

Cassandra allows you to configure consistency per query:

| Consistency Level | Description |
|-------------------|-------------|
| ONE | Respond after one replica acknowledges |
| QUORUM | Respond after majority (RF/2 + 1) acknowledges |
| ALL | Respond after all replicas acknowledge |
| LOCAL_QUORUM | Quorum within the local data center |
| EACH_QUORUM | Quorum in each data center |

**Consistency formula:**

```
Strong consistency is achieved when:
  R + W > N

Where:
  R = read consistency level
  W = write consistency level
  N = replication factor

Example: RF=3, W=QUORUM(2), R=QUORUM(2)
  2 + 2 > 3 ✓ (strongly consistent)
```

### CQL (Cassandra Query Language)

```sql
-- Create a keyspace (like a database)
CREATE KEYSPACE messaging
WITH replication = {
  'class': 'NetworkTopologyStrategy',
  'dc1': 3,
  'dc2': 2
};

USE messaging;

-- Create a table
CREATE TABLE messages (
  channel_id   UUID,
  sent_at      TIMESTAMP,
  user_id      UUID,
  content      TEXT,
  PRIMARY KEY ((channel_id), sent_at)
) WITH CLUSTERING ORDER BY (sent_at DESC);

-- Insert data
INSERT INTO messages (channel_id, sent_at, user_id, content)
VALUES (uuid(), toTimestamp(now()), uuid(), 'Hello World!');

-- Query recent messages in a channel
SELECT * FROM messages
WHERE channel_id = ?
ORDER BY sent_at DESC
LIMIT 50;
```

---

## ScyllaDB

ScyllaDB is a drop-in replacement for Apache Cassandra, rewritten in C++ for better performance.

| Feature | Cassandra | ScyllaDB |
|---------|-----------|----------|
| Language | Java | C++ |
| Threading | Thread-per-core | Shard-per-core (Seastar) |
| GC Pauses | Yes (JVM) | No (manual memory) |
| Throughput | Baseline | 3-10x higher |
| Latency (p99) | Variable (GC) | Predictable |
| CQL Compatible | Native | Yes |
| Drivers | Native | Cassandra-compatible |

ScyllaDB uses the **Seastar** framework with a shard-per-core architecture:

```
┌─────────────────────────────────────────┐
│           ScyllaDB Node                  │
│                                          │
│  ┌───────┐ ┌───────┐ ┌───────┐         │
│  │Shard 0│ │Shard 1│ │Shard 2│  ...    │
│  │(CPU 0)│ │(CPU 1)│ │(CPU 2)│         │
│  ├───────┤ ├───────┤ ├───────┤         │
│  │MemTable│ │MemTable│ │MemTable│        │
│  │  Cache │ │  Cache │ │  Cache │        │
│  │Compactn│ │Compactn│ │Compactn│        │
│  └───────┘ └───────┘ └───────┘         │
│                                          │
│  No shared memory — message passing only │
└─────────────────────────────────────────┘
```

---

## Data Modeling Best Practices

Wide-column stores require a different approach to data modeling than relational databases.

### Key Principles

| Principle | Description |
|-----------|-------------|
| Denormalization | Duplicate data across tables to avoid joins |
| Query-first design | Model tables around your access patterns |
| Partition key choice | Determines data distribution and query ability |
| Clustering key | Determines sort order within a partition |
| Avoid hot partitions | Distribute writes evenly across nodes |

### Partition Key vs. Clustering Key

```sql
CREATE TABLE sensor_data (
  sensor_id    TEXT,          -- Partition key
  reading_time TIMESTAMP,    -- Clustering key
  temperature  DOUBLE,
  humidity     DOUBLE,
  PRIMARY KEY ((sensor_id), reading_time)
);

-- Partition key: sensor_id
--   → Determines WHICH node stores the data
--   → All data for one sensor lives on the same partition
--
-- Clustering key: reading_time
--   → Determines ORDER within the partition
--   → Enables efficient range scans by time
```

### Compound Partition Keys

```sql
-- Avoid hot partitions by adding date to partition key
CREATE TABLE sensor_data_v2 (
  sensor_id    TEXT,
  day          DATE,
  reading_time TIMESTAMP,
  temperature  DOUBLE,
  humidity     DOUBLE,
  PRIMARY KEY ((sensor_id, day), reading_time)
);

-- Now data is partitioned by sensor AND day
-- Prevents unbounded partition growth
```

### Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Large partitions | > 100MB slows reads | Add time bucket to partition key |
| Unbounded growth | Partition grows forever | Use TTL or time-based partitioning |
| Secondary indexes | Scatter-gather queries | Create a separate denormalized table |
| SELECT * | Full table scan | Always provide partition key in WHERE |
| Too many tombstones | Slow reads after deletes | Use TTL instead of explicit deletes |

---

## Use Cases

### Time-Series Data

```sql
CREATE TABLE metrics (
  host       TEXT,
  metric     TEXT,
  bucket     TEXT,      -- e.g., "2026-05-04T10"
  ts         TIMESTAMP,
  value      DOUBLE,
  PRIMARY KEY ((host, metric, bucket), ts)
) WITH CLUSTERING ORDER BY (ts DESC)
  AND default_time_to_live = 2592000;  -- 30 days TTL
```

### IoT Telemetry

```sql
CREATE TABLE device_telemetry (
  device_id   UUID,
  day         DATE,
  event_time  TIMESTAMP,
  event_type  TEXT,
  payload     MAP<TEXT, TEXT>,
  PRIMARY KEY ((device_id, day), event_time)
) WITH CLUSTERING ORDER BY (event_time DESC);
```

### Messaging / Chat

```sql
CREATE TABLE chat_messages (
  room_id     UUID,
  sent_at     TIMEUUID,
  sender_id   UUID,
  body        TEXT,
  attachments LIST<TEXT>,
  PRIMARY KEY ((room_id), sent_at)
) WITH CLUSTERING ORDER BY (sent_at ASC);
```

---

## Comparison: Wide-Column vs. Other Stores

| Dimension | Relational (PostgreSQL) | Key-Value (Redis) | Wide-Column (Cassandra) |
|-----------|------------------------|-------------------|------------------------|
| Data model | Fixed schema tables | Opaque blobs | Flexible column families |
| Query | Full SQL | GET/SET by key | CQL (subset of SQL) |
| Joins | Yes | No | No |
| Transactions | ACID | Single-key atomic | Lightweight transactions |
| Scale | Vertical / read replicas | Cluster (sharding) | Linear horizontal |
| Consistency | Strong | Eventual | Tunable |
| Latency | Low (single node) | Sub-millisecond | Low-millisecond |
| Best for | Complex queries, transactions | Caching, sessions | Time-series, high-write |

---

## Performance Characteristics

| Operation | Performance | Notes |
|-----------|-------------|-------|
| Point read (by partition key) | O(1) lookup + O(log n) in partition | Very fast |
| Range scan (within partition) | O(n) sequential read | Efficient due to clustering order |
| Full table scan | O(N) across all nodes | Avoid in production |
| Write | O(1) append | Writes are always fast (append-only) |
| Delete | Creates a tombstone | May slow future reads |
| Secondary index query | O(N) scatter-gather | Use materialized views instead |

### Write Amplification

```
Client Write
    │
    ▼
┌──────────┐    ┌──────────┐
│ Commit   │    │ MemTable │
│ Log      │    │(in-memory)│
└──────────┘    └─────┬────┘
                      │ (flush when full)
                      ▼
              ┌──────────────┐
              │  SSTable #1  │
              │  SSTable #2  │  ← Immutable files on disk
              │  SSTable #3  │
              └──────┬───────┘
                     │ (compaction)
                     ▼
              ┌──────────────┐
              │  Merged       │
              │  SSTable      │
              └──────────────┘
```

---

## Exercises

1. **Design a schema** for a social media feed where users follow other users and see posts in reverse chronological order. What would you choose as the partition key and clustering key?

2. **Calculate consistency**: If your replication factor is 5, what read and write consistency levels ensure strong consistency? List all valid combinations.

3. **Identify the problem** with this Cassandra table definition:

```sql
CREATE TABLE user_events (
  user_id UUID,
  event_time TIMESTAMP,
  event_type TEXT,
  data TEXT,
  PRIMARY KEY ((user_id), event_time)
);
```

What happens after a year of high-frequency events? How would you fix it?

4. **Compare and contrast** HBase and Cassandra in terms of: (a) consistency model, (b) failure handling, (c) write path, and (d) ideal workloads.

5. **ScyllaDB migration**: Your team runs a Cassandra cluster with p99 latency spikes due to JVM garbage collection. Draft a migration plan to ScyllaDB, listing compatibility considerations and potential risks.

---

## Summary

| Concept | Key Takeaway |
|---------|--------------|
| Wide-column stores | Flexible schema, column-family oriented storage |
| Bigtable | Google's original; tablets, GFS, Chubby |
| HBase | Open-source Bigtable on Hadoop/HDFS |
| Cassandra | Dynamo + Bigtable; peer-to-peer, tunable consistency |
| ScyllaDB | C++ Cassandra replacement; no GC pauses |
| Data modeling | Query-first, denormalize, choose partition keys carefully |
| Use cases | Time-series, IoT, messaging, high-write workloads |

Wide-column stores excel when you need **high write throughput**, **horizontal scalability**, and **flexible schemas** — but require careful data modeling since you cannot rely on joins or ad-hoc queries across partitions.
