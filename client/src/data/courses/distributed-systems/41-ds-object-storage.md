---
title: "Object Storage and LSM Trees"
---

# Object Storage and LSM Trees

Object storage is the dominant storage paradigm for cloud-native distributed systems. Combined with LSM Trees — the data structure powering most modern write-heavy databases — these technologies form the backbone of scalable storage infrastructure.

---

## Object Storage Model

Object storage organizes data as discrete objects within a flat namespace, unlike hierarchical file systems.

### Core Concepts

| Component | Description | Example |
|-----------|-------------|---------|
| **Bucket** | Top-level container for objects | `my-app-images` |
| **Key** | Unique identifier within a bucket | `users/profile/avatar-123.png` |
| **Value** | The actual data (blob of bytes) | Binary image data |
| **Metadata** | Key-value pairs describing the object | `Content-Type: image/png` |

### Object Anatomy

```
┌─────────────────────────────────────────┐
│  Bucket: my-application-data            │
├─────────────────────────────────────────┤
│  Key: logs/2024/03/15/server-01.json    │
│  Value: { "level": "info", ... }        │
│  Metadata:                              │
│    Content-Type: application/json       │
│    Content-Length: 4096                  │
│    x-amz-meta-server: prod-01           │
│    ETag: "d41d8cd98f00b204e9800998..."  │
│  Version: v3                            │
└─────────────────────────────────────────┘
```

### Key Properties

- **Flat namespace** — no directories, but key prefixes simulate hierarchy
- **Immutable writes** — objects are replaced entirely, not partially updated
- **Eventual consistency** — reads may not immediately reflect writes (varies by implementation)
- **HTTP accessible** — objects retrieved via standard HTTP verbs

---

## Object Storage vs File Storage vs Block Storage

| Feature | Object Storage | File Storage | Block Storage |
|---------|---------------|--------------|---------------|
| **Access method** | HTTP REST API | POSIX file I/O | Raw device I/O |
| **Namespace** | Flat (bucket/key) | Hierarchical (directories) | LBA addresses |
| **Metadata** | Rich, custom | Limited (permissions, timestamps) | None |
| **Scalability** | Exabytes+ | Limited by NAS | Limited by SAN |
| **Latency** | Higher (ms) | Medium | Lowest (μs) |
| **Partial update** | No (full replace) | Yes (seek + write) | Yes (block-level) |
| **Use case** | Media, backups, data lakes | Home dirs, shared docs | Databases, VMs |
| **Protocol** | S3, Swift | NFS, SMB, CIFS | iSCSI, FC |
| **Cost** | Lowest per GB | Medium | Highest |

### When to Use Object Storage

- Unstructured data (images, videos, logs)
- Data lakes and analytics pipelines
- Backup and archival (lifecycle policies)
- Static website hosting
- Machine learning training datasets

---

## S3 API as the Industry Standard

Amazon S3's API has become the de-facto standard for object storage, adopted by virtually all providers.

### Core S3 Operations

```bash
# Create a bucket
PUT /my-bucket HTTP/1.1
Host: s3.amazonaws.com

# Upload an object
PUT /my-bucket/path/to/file.txt HTTP/1.1
Host: s3.amazonaws.com
Content-Type: text/plain

Hello, Object Storage!

# Retrieve an object
GET /my-bucket/path/to/file.txt HTTP/1.1
Host: s3.amazonaws.com

# Delete an object
DELETE /my-bucket/path/to/file.txt HTTP/1.1
Host: s3.amazonaws.com

# List objects with prefix
GET /my-bucket?prefix=path/to/&delimiter=/ HTTP/1.1
Host: s3.amazonaws.com
```

### S3-Compatible Providers

| Provider | Service | Notes |
|----------|---------|-------|
| AWS | S3 | Original, most feature-rich |
| Google Cloud | GCS | S3-compatible interop mode |
| Azure | Blob Storage | Partial S3 compatibility |
| MinIO | MinIO | Self-hosted, full S3 API |
| Cloudflare | R2 | Zero egress fees |
| Backblaze | B2 | Low-cost archival |
| DigitalOcean | Spaces | Simple, S3-compatible |

---

## Erasure Coding vs Replication

Object storage systems must protect data against hardware failures. Two main strategies exist.

### Replication

```
Original Object: [A]

3x Replication:
  Node 1: [A]  ← copy 1
  Node 2: [A]  ← copy 2
  Node 3: [A]  ← copy 3

Storage overhead: 3x (200% overhead)
Fault tolerance: survives 2 node failures
```

### Erasure Coding

```
Original Object: [A] split into k data chunks

Reed-Solomon EC (k=4, m=2):
  Data chunks:    [D1] [D2] [D3] [D4]
  Parity chunks:  [P1] [P2]

  Distributed across 6 nodes:
  Node 1: [D1]
  Node 2: [D2]
  Node 3: [D3]
  Node 4: [D4]
  Node 5: [P1]
  Node 6: [P2]

Storage overhead: 1.5x (50% overhead)
Fault tolerance: survives any 2 node failures
```

### Comparison

| Aspect | Replication (3x) | Erasure Coding (4+2) |
|--------|-------------------|----------------------|
| Storage overhead | 200% | 50% |
| Fault tolerance | 2 failures | 2 failures |
| Read performance | Fast (any copy) | Slower (reconstruct) |
| Write performance | Fast (parallel copy) | Slower (compute parity) |
| Repair cost | Copy full object | Reconstruct from k chunks |
| Best for | Hot data, small objects | Cold data, large objects |

---

## MinIO: Self-Hosted S3-Compatible Storage

MinIO is a high-performance, S3-compatible object storage server designed for private cloud infrastructure.

### Deployment

```bash
# Single-node deployment (development)
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=secretkey \
  minio/minio server /data --console-address ":9001"

# Distributed deployment (production, 4 nodes × 4 drives)
minio server http://node{1...4}/mnt/disk{1...4}/data
```

### Using MinIO with AWS SDK

```javascript
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  endpoint: "http://localhost:9000",
  region: "us-east-1",
  credentials: {
    accessKeyId: "admin",
    secretAccessKey: "secretkey",
  },
  forcePathStyle: true, // Required for MinIO
});

// Upload
await client.send(new PutObjectCommand({
  Bucket: "my-bucket",
  Key: "data/report.json",
  Body: JSON.stringify({ status: "complete" }),
  ContentType: "application/json",
}));

// Download
const response = await client.send(new GetObjectCommand({
  Bucket: "my-bucket",
  Key: "data/report.json",
}));
const body = await response.Body.transformToString();
```

---

## LSM Trees (Log-Structured Merge Trees)

LSM Trees are the write-optimized data structure behind most modern distributed databases. They convert random writes into sequential I/O.

### Architecture Overview

```
         Writes
           │
           ▼
┌──────────────────┐
│    Memtable      │  ← In-memory sorted structure (Red-Black tree / Skip list)
│  (Write Buffer)  │
└────────┬─────────┘
         │ Flush (when full)
         ▼
┌──────────────────┐
│   Level 0        │  ← Immutable SSTables (may overlap)
│  SSTable SSTable │
└────────┬─────────┘
         │ Compaction
         ▼
┌──────────────────┐
│   Level 1        │  ← Non-overlapping sorted runs
│  SSTable SSTable │
└────────┬─────────┘
         │ Compaction
         ▼
┌──────────────────┐
│   Level 2        │  ← Larger, fewer files
│    SSTable ...   │
└──────────────────┘
```

### Memtable

The memtable is the write entry point — an in-memory sorted data structure.

```
Write("user:42", "Alice") → Insert into Memtable
Write("user:17", "Bob")   → Insert into Memtable
Write("user:42", "Alicia") → Update in Memtable (latest wins)
Delete("user:17")         → Insert tombstone marker

Memtable (sorted by key):
┌─────────────────────────────────┐
│ user:17 → TOMBSTONE             │
│ user:42 → "Alicia"             │
│ user:55 → "Charlie"            │
└─────────────────────────────────┘
```

When the memtable reaches a size threshold (e.g., 64 MB), it is frozen and flushed to disk as an SSTable.

### SSTables (Sorted String Tables)

SSTables are immutable, sorted files on disk:

```
┌──────────────────────────────────────────┐
│ SSTable File Layout                       │
├──────────────────────────────────────────┤
│ Data Block 1:  key1→val1, key2→val2 ...  │
│ Data Block 2:  key5→val5, key6→val6 ...  │
│ Data Block 3:  key9→val9, key10→val10... │
├──────────────────────────────────────────┤
│ Index Block:   key1→offset0              │
│                key5→offset1              │
│                key9→offset2              │
├──────────────────────────────────────────┤
│ Bloom Filter:  bit array for membership  │
├──────────────────────────────────────────┤
│ Footer:  index offset, filter offset     │
└──────────────────────────────────────────┘
```

### Compaction Strategies

Compaction merges SSTables to reclaim space, remove tombstones, and reduce read amplification.

#### Size-Tiered Compaction (STCS)

```
Trigger: When N SSTables of similar size accumulate

Level 0:  [4MB] [4MB] [4MB] [4MB]
              │
              ▼  Merge all into one
Level 1:  [16MB]

Level 1:  [16MB] [16MB] [16MB] [16MB]
              │
              ▼  Merge all into one
Level 2:  [64MB]
```

- **Pros**: High write throughput, simple logic
- **Cons**: High space amplification (up to 2x), temporary spikes during compaction

#### Leveled Compaction (LCS)

```
Trigger: When a level exceeds its size limit

Level 0: [SST] [SST]  (overlapping, max 4 files)
              │
              ▼  Pick one SST, merge with overlapping L1 files
Level 1: [SST₁|SST₂|SST₃|SST₄]  (non-overlapping, max 10MB total)
              │
              ▼  Pick one SST, merge with overlapping L2 files
Level 2: [SST₁|SST₂|...|SST₁₀]  (non-overlapping, max 100MB total)
```

- **Pros**: Bounded space amplification (~10%), consistent read performance
- **Cons**: Higher write amplification (10-30x)

| Aspect | Size-Tiered | Leveled |
|--------|-------------|---------|
| Write amplification | Lower (~4-8x) | Higher (~10-30x) |
| Space amplification | Higher (~2x) | Lower (~1.1x) |
| Read amplification | Higher | Lower |
| Best for | Write-heavy | Read-heavy / space-constrained |

---

## Write Amplification

Write amplification (WA) measures how much more data is actually written to disk compared to the logical writes from the application.

```
Write Amplification = Physical Bytes Written / Logical Bytes Written

Example (Leveled Compaction, 10x size ratio):
- User writes 1 GB of data
- Each byte gets rewritten through ~10 levels of compaction
- Total disk writes: ~10 GB
- Write Amplification: 10x
```

### Impact

| WA Factor | Effect |
|-----------|--------|
| 1x | Ideal — no extra writes |
| 5-10x | Acceptable for most SSDs |
| 20-30x | Reduces SSD lifespan significantly |
| 50x+ | Problematic — SSD wear concern |

### Mitigation Strategies

- **Larger memtable** — fewer flushes, but higher memory usage
- **Size-tiered compaction** — fewer rewrites per byte
- **Key-value separation** (WiscKey) — store values in a log, only sort keys
- **Tiered + leveled hybrid** — use STCS for upper levels, LCS for lower

---

## Bloom Filters for Read Optimization

Without optimization, reading a key requires checking every SSTable level. Bloom filters provide a fast "definitely not here" answer.

### How Bloom Filters Work

```
Insert "user:42":
  h1("user:42") = 3   → set bit 3
  h2("user:42") = 7   → set bit 7
  h3("user:42") = 11  → set bit 11

Bit array: [0 0 0 1 0 0 0 1 0 0 0 1 0 0 0 0]
                  ↑           ↑           ↑

Query "user:99":
  h1("user:99") = 3   → bit 3 is SET
  h2("user:99") = 5   → bit 5 is NOT SET  ← Definitely not present!

Query "user:42":
  h1("user:42") = 3   → SET
  h2("user:42") = 7   → SET
  h3("user:42") = 11  → SET
  → Probably present (check SSTable to confirm)
```

### Bloom Filter in LSM Read Path

```
Read("user:42"):

1. Check Memtable → Not found
2. Check Level 0, SSTable A:
   - Bloom filter says NO → Skip (no disk I/O!)
3. Check Level 0, SSTable B:
   - Bloom filter says MAYBE → Read from disk → Not found
4. Check Level 1, SSTable C:
   - Bloom filter says MAYBE → Read from disk → Found!

Without Bloom filters: 4 disk reads
With Bloom filters:    2 disk reads (50% reduction)
```

### False Positive Rate

| Bits per key | False positive rate |
|--------------|---------------------|
| 5 | ~10% |
| 10 | ~1% |
| 15 | ~0.1% |
| 20 | ~0.01% |

Typical setting: 10 bits/key (~1% false positive rate, minimal memory overhead).

---

## LSM Tree vs B-Tree Comparison

| Aspect | LSM Tree | B-Tree |
|--------|----------|--------|
| Write pattern | Sequential (append) | Random (in-place) |
| Write throughput | Higher | Lower |
| Read latency (point) | Higher (check multiple levels) | Lower (single tree traversal) |
| Range scan | Good (sorted runs) | Excellent (leaf links) |
| Space amplification | Lower (with leveled) | Higher (page fragmentation) |
| Write amplification | Higher (compaction) | Lower (~2-4x) |
| Concurrency | Lock-free writes | Page-level locking |
| Recovery | WAL replay | WAL + page recovery |
| Predictable latency | Less (compaction spikes) | More consistent |

### Decision Guide

```
Choose LSM Tree when:
  ✓ Write-heavy workload (>80% writes)
  ✓ Append-mostly data (logs, time-series, events)
  ✓ Need high ingest throughput
  ✓ Storage cost is primary concern
  ✓ Can tolerate occasional latency spikes

Choose B-Tree when:
  ✓ Read-heavy workload (>80% reads)
  ✓ Need consistent low-latency reads
  ✓ Transaction-heavy (OLTP)
  ✓ Update-in-place patterns
  ✓ Need strong isolation guarantees
```

---

## LSM Trees in Practice

### LevelDB and RocksDB

```
LevelDB (Google):
  - Original LSM implementation for embedded use
  - Single-threaded compaction
  - Used in Chrome, Bitcoin Core

RocksDB (Facebook/Meta):
  - Fork of LevelDB with major enhancements
  - Multi-threaded compaction
  - Column families (multiple LSM trees in one DB)
  - Pluggable compaction strategies
  - Rate limiting for compaction I/O
  - Used as storage engine in: TiKV, CockroachDB, MySQL (MyRocks)
```

### Cassandra

```
Write Path:
  Client → Commit Log (WAL) → Memtable → SSTable

Compaction Strategies:
  - SizeTieredCompactionStrategy (STCS) — default, write-optimized
  - LeveledCompactionStrategy (LCS) — read-optimized
  - TimeWindowCompactionStrategy (TWCS) — time-series data

Configuration:
  CREATE TABLE events (
    id UUID PRIMARY KEY,
    data TEXT
  ) WITH compaction = {
    'class': 'LeveledCompactionStrategy',
    'sstable_size_in_mb': 160
  };
```

### HBase

```
HBase Architecture:
  ┌─────────────────────────────────────┐
  │ RegionServer                        │
  │  ┌─────────────┐  ┌─────────────┐  │
  │  │   Region    │  │   Region    │  │
  │  │ ┌─────────┐ │  │ ┌─────────┐ │  │
  │  │ │MemStore │ │  │ │MemStore │ │  │
  │  │ ├─────────┤ │  │ ├─────────┤ │  │
  │  │ │ HFile   │ │  │ │ HFile   │ │  │
  │  │ │ HFile   │ │  │ │ HFile   │ │  │
  │  │ └─────────┘ │  │ └─────────┘ │  │
  │  └─────────────┘  └─────────────┘  │
  └─────────────────────────────────────┘

  HFile = SSTable equivalent
  MemStore = Memtable equivalent
  Major Compaction = merge all HFiles in a region
```

---

## Write-Optimized Workloads

LSM Trees excel in specific workload patterns:

### Time-Series Data

```
Characteristics:
  - Append-only (no updates to historical data)
  - Sequential keys (timestamp-based)
  - High ingest rate (millions of points/second)
  - Range scans for queries (time windows)

Optimization:
  - Time-window compaction (only compact within time buckets)
  - TTL-based expiry (drop entire SSTables past retention)
  - Pre-split by time range
```

### Event Logging

```
Characteristics:
  - Write-once, read-rarely
  - Massive volume (TBs/day)
  - Queries are full scans or key lookups
  - Tolerance for higher read latency

Optimization:
  - Size-tiered compaction (minimize write amp)
  - Large memtable (reduce flush frequency)
  - Aggressive compression (LZ4 for speed, ZSTD for ratio)
```

### Workload Tuning Parameters

| Parameter | Write-Optimized | Balanced | Read-Optimized |
|-----------|-----------------|----------|----------------|
| Memtable size | 256 MB | 64 MB | 32 MB |
| Compaction | Size-tiered | Hybrid | Leveled |
| Bloom filter bits/key | 5 | 10 | 15 |
| Block cache | Small | Medium | Large |
| Compression | LZ4 | LZ4 | None (hot) / ZSTD (cold) |
| Write buffer count | 4-6 | 2-3 | 1-2 |

---

## Exercises

### Exercise 1: Object Storage Design

Design the metadata schema for a video streaming platform's object storage:

1. What bucket structure would you use?
2. What custom metadata would each video object carry?
3. How would you handle multiple resolutions of the same video?
4. Sketch the lifecycle policy (hot → warm → cold → delete).

### Exercise 2: LSM Compaction Analysis

Given the following LSM state:

```
Level 0: [2MB] [2MB] [2MB] [2MB]  (4 overlapping SSTables)
Level 1: [10MB] [10MB] [10MB]     (3 non-overlapping SSTables, 30MB total)
Level 2: [10MB] × 10              (100MB total)
Level 3: [10MB] × 100             (1000MB total)
```

Calculate:
1. Total storage used
2. If Level 1 max is 30MB, what triggers next compaction?
3. Worst-case read amplification (number of SSTables checked)
4. Estimate write amplification with a 10x level size ratio

### Exercise 3: Bloom Filter Sizing

Your database has 10 million keys per SSTable and you want a false positive rate below 1%.

1. How many bits per key are needed?
2. What is the total memory for one SSTable's Bloom filter?
3. If you have 50 SSTables, what is the total Bloom filter memory?
4. What happens to read performance if you halve the bits per key?

### Exercise 4: Storage Engine Selection

For each scenario, recommend LSM or B-Tree and justify:

1. A banking system processing 10K transactions/second with strict latency SLAs
2. An IoT platform ingesting 1M sensor readings/second
3. A social media feed storing posts with frequent updates to like counts
4. A log aggregation system storing 5TB/day with 7-day retention

---

## Summary

| Concept | Key Takeaway |
|---------|--------------|
| Object Storage | Flat namespace (bucket/key/value), HTTP API, immutable objects |
| S3 API | Industry standard, adopted by all major providers |
| Erasure Coding | 50% overhead vs 200% for 3x replication, same fault tolerance |
| MinIO | Self-hosted S3-compatible, distributed erasure-coded storage |
| LSM Tree | Write-optimized: memtable → SSTable → compaction |
| Compaction | Size-tiered (write-friendly) vs Leveled (read-friendly) |
| Write Amplification | Trade-off: more compaction = better reads but more disk writes |
| Bloom Filters | Probabilistic "not here" test, eliminates unnecessary disk reads |
| LSM vs B-Tree | LSM for writes, B-Tree for reads — pick based on workload |

---
