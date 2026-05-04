---
title: "Distributed File Systems"
---

# Distributed File Systems

A distributed file system (DFS) stores data across multiple machines, providing a unified namespace and transparent access to files regardless of their physical location.

---

## Why Distributed File Systems?

Traditional single-machine file systems hit fundamental limits:

| Limitation | Problem | DFS Solution |
|---|---|---|
| Storage capacity | Single disk/server can't hold petabytes | Spread data across hundreds of nodes |
| Throughput | One machine's I/O bandwidth is finite | Parallel reads from many servers |
| Fault tolerance | Disk failure = data loss | Replicate data across machines |
| Availability | Server down = files inaccessible | Serve from replicas automatically |
| Cost | Scale-up hardware is expensive | Use commodity hardware at scale |

**Key insight:** Instead of buying one expensive machine, use many cheap machines and software to handle failures.

---

## Google File System (GFS)

GFS (2003) was designed for Google's workloads: large sequential reads/writes, append-heavy, rare random writes.

### Architecture

```
┌─────────────────────────────────────────────────┐
│                   GFS Client                     │
│  (Library linked into application)               │
└──────────┬──────────────────────┬───────────────┘
           │ Control messages     │ Data transfer
           ▼                      ▼
┌──────────────────┐    ┌─────────────────────────┐
│   GFS Master     │    │    Chunkservers          │
│                  │    │  ┌─────┐ ┌─────┐ ┌─────┐│
│ - Namespace      │    │  │Chunk│ │Chunk│ │Chunk││
│ - File→Chunk map │    │  │  A  │ │  B  │ │  C  ││
│ - Chunk locations│    │  └─────┘ └─────┘ └─────┘│
│ - Lease mgmt     │    │  ┌─────┐ ┌─────┐ ┌─────┐│
│ - Garbage collect│    │  │Chunk│ │Chunk│ │Chunk││
│ - Chunk migration│    │  │  D  │ │  E  │ │  F  ││
└──────────────────┘    │  └─────┘ └─────┘ └─────┘│
                        └─────────────────────────┘
```

### Core Design Decisions

**Large Chunk Size (64 MB)**

```
Traditional FS block:   4 KB – 64 KB
GFS chunk size:         64 MB
```

Benefits of large chunks:

- Fewer metadata entries on master (entire namespace fits in RAM)
- Reduced client-master interactions (one lookup covers many operations)
- Persistent TCP connections to chunkservers for large sequential I/O
- Less overhead for network round-trips

Trade-off: Small files occupy one chunk, creating "hot spots" if many clients access the same small file.

**Single Master**

The master maintains all metadata in memory:

```
Metadata stored by GFS Master:
─────────────────────────────────────────
1. File and chunk namespaces (persisted via operation log)
2. File → chunk mapping (persisted via operation log)
3. Chunk → chunkserver locations (NOT persisted; rebuilt at startup)
```

The master never sits on the data path — clients fetch chunk locations, then talk directly to chunkservers.

**Replication**

- Default replication factor: **3 copies**
- Replicas spread across racks for rack-level fault tolerance
- Master re-replicates chunks when copies fall below threshold

### Lease Mechanism

GFS uses leases to maintain consistent mutation order:

```
1. Client asks master: "Which chunkserver has lease for chunk X?"
2. Master grants a 60-second lease to one replica (the "primary")
3. Client pushes data to ALL replicas (decoupled from control flow)
4. Client sends write request to primary
5. Primary assigns serial number, applies mutation locally
6. Primary forwards serial order to secondary replicas
7. Secondaries apply mutations in same order
8. Primary replies to client after all secondaries acknowledge
```

```
Timeline:
─────────────────────────────────────────────────────
Client ──► Push data to all replicas (pipelined)
Client ──► Write request to Primary
Primary ──► Assign serial #, apply locally
Primary ──► Forward to Secondary A, Secondary B
Secondary A ──► Apply, ACK
Secondary B ──► Apply, ACK
Primary ──► Reply success to Client
```

---

## Hadoop Distributed File System (HDFS)

HDFS is the open-source implementation inspired by GFS, designed for batch processing with MapReduce.

### Architecture

| Component | Role | GFS Equivalent |
|---|---|---|
| NameNode | Metadata server, namespace management | Master |
| DataNode | Stores blocks, serves read/write requests | Chunkserver |
| Secondary NameNode | Periodic checkpoint of namespace (NOT a hot standby) | — |
| Block | Unit of storage (default 128 MB) | Chunk (64 MB) |

### Block Replication

```java
// HDFS default configuration
dfs.replication = 3          // Default replication factor
dfs.blocksize = 128MB        // Default block size
dfs.namenode.heartbeat.recheck-interval = 300000  // 5 minutes
```

**Replica Placement Strategy:**

```
Replica 1: Same node as writer (or random node if writer is external)
Replica 2: Different rack from Replica 1
Replica 3: Same rack as Replica 2, different node
```

### Rack Awareness

HDFS uses rack topology to optimize placement and reads:

```
         ┌─── Rack 1 ───┐      ┌─── Rack 2 ───┐
         │ ┌──┐ ┌──┐ ┌──┐│      │ ┌──┐ ┌──┐ ┌──┐│
         │ │DN│ │DN│ │DN││      │ │DN│ │DN│ │DN││
         │ │ 1│ │ 2│ │ 3││      │ │ 4│ │ 5│ │ 6││
         │ └──┘ └──┘ └──┘│      │ └──┘ └──┘ └──┘│
         │    Switch      │      │    Switch      │
         └───────┬────────┘      └───────┬────────┘
                 │                        │
                 └────── Core Switch ─────┘
```

Benefits:

- **Write bandwidth:** Two replicas on same rack minimize cross-rack traffic
- **Fault tolerance:** At least one replica survives a full rack failure
- **Read locality:** Client reads from closest replica (same rack preferred)

### HDFS High Availability (HA)

Modern HDFS overcomes the single-NameNode problem:

```
┌─────────────┐     ┌─────────────┐
│ Active      │     │ Standby     │
│ NameNode    │◄───►│ NameNode    │
└──────┬──────┘     └──────┬──────┘
       │ Shared edit log    │
       ▼                    ▼
┌─────────────────────────────────┐
│    JournalNodes (Quorum)        │
│  (or Shared NFS for edit log)   │
└─────────────────────────────────┘
```

---

## Ceph

Ceph is a unified storage system providing object, block, and file storage with no single point of failure.

### RADOS (Reliable Autonomic Distributed Object Store)

RADOS is the foundation layer:

```
┌──────────────────────────────────────────┐
│           Ceph Clients                    │
│  CephFS │ RBD (Block) │ RADOSGW (S3/Swift)│
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│              LIBRADOS                     │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│               RADOS                       │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ OSD │ │ OSD │ │ OSD │ │ OSD │  ...   │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
│                                           │
│  ┌─────────┐  ┌─────────┐               │
│  │ Monitor │  │ Monitor │  (Paxos)      │
│  └─────────┘  └─────────┘               │
└──────────────────────────────────────────┘
```

### CRUSH Algorithm

CRUSH (Controlled Replication Under Scalable Hashing) eliminates lookup tables:

```
Traditional approach:
  object → lookup table → location    (table = bottleneck)

CRUSH approach:
  object → hash → placement group → CRUSH(PG, cluster map) → OSDs
```

**How CRUSH works:**

1. Object name is hashed to a **placement group (PG)**
2. CRUSH takes the PG ID and the cluster map (topology)
3. Deterministically computes which OSDs store that PG
4. Any client with the cluster map can compute locations independently

```
CRUSH Rule Example (simplified):
─────────────────────────────────
step take root
step chooseleaf firstn 3 type rack   # Pick 3 OSDs in different racks
step emit
```

**No single point of failure:** Monitors maintain cluster state via Paxos consensus. If a monitor fails, others continue. OSDs self-heal and re-replicate.

---

## GlusterFS

GlusterFS is a scale-out network-attached storage file system:

| Feature | Description |
|---|---|
| Architecture | Fully distributed, no metadata server |
| Hashing | Elastic Hash Algorithm (based on consistent hashing) |
| Volumes | Distributed, Replicated, Dispersed (erasure-coded) |
| Translation | Stackable translators (like Unix VFS layers) |
| Scaling | Add "bricks" (storage units) to expand |

```
GlusterFS Volume Types:
─────────────────────────────────────────
Distributed:   Files spread across bricks (no redundancy)
Replicated:    Every file copied to N bricks
Distributed-Replicated:  Stripe across sets of replicas
Dispersed:     Erasure coding (k data + m parity fragments)
```

---

## Comparison Table

| Feature | GFS/Colossus | HDFS | Ceph | GlusterFS |
|---|---|---|---|---|
| **Metadata** | Single master (Colossus: distributed) | NameNode (HA pair) | Monitors (Paxos) | No metadata server |
| **Block/Chunk size** | 64 MB (GFS), 1 MB (Colossus) | 128 MB | 4 MB (objects) | File-level |
| **Replication** | 3x default | 3x default | 3x or erasure coding | Configurable |
| **Consistency** | Relaxed (append-defined) | Strong for single writer | Strong (RADOS) | Eventual / strong |
| **Fault tolerance** | Rack-aware | Rack-aware | CRUSH topology-aware | Replica/EC per volume |
| **Use case** | Google internal | Hadoop ecosystem | Unified storage | NAS replacement |
| **Open source** | No | Yes (Apache) | Yes (Linux Foundation) | Yes (Red Hat) |
| **POSIX compliant** | No | No | CephFS: Yes | Yes |
| **Scalability** | Exabytes | Petabytes | Exabytes | Petabytes |

---

## File System Semantics

### Consistency Models

| Model | Guarantee | Example |
|---|---|---|
| **POSIX (strict)** | Read sees latest write immediately | Local ext4, CephFS (sync) |
| **Close-to-open** | Read sees writes once file is closed | NFS, GlusterFS |
| **Append-defined** | Concurrent appends produce defined result | GFS |
| **Eventual** | All replicas converge eventually | Some GlusterFS configs |

### Metadata Management Approaches

```
Centralized Metadata (GFS, HDFS):
  + Simple consistency
  + Easy namespace operations (rename, list)
  − Single point of failure (mitigated by HA)
  − Scalability ceiling for billions of files

Distributed Metadata (Ceph, GlusterFS):
  + No single bottleneck
  + Scales with cluster size
  − Complex consistency protocols
  − Harder to implement atomic renames across shards

Computation-based (CRUSH):
  + No lookup required
  + No metadata server at all for data placement
  − Cluster map changes require rebalancing
```

### Metadata Operations

```
Operation        HDFS                     Ceph
─────────────────────────────────────────────────────
Create file      NameNode allocates       MDS creates inode
Write block      Pipeline to DataNodes    OSD replication
Read block       NameNode → block locs    CRUSH computes locs
Rename           NameNode atomic          MDS atomic (same dir)
Delete           NameNode marks, lazy GC  MDS unlinks, async GC
List directory   NameNode serves          MDS serves
```

---

## Modern Cloud Alternatives

Cloud providers offer managed object storage that often replaces self-hosted DFS:

| Service | Provider | Durability | Consistency | Access Pattern |
|---|---|---|---|---|
| Amazon S3 | AWS | 99.999999999% (11 nines) | Strong (since 2020) | Object (PUT/GET/DELETE) |
| Azure Blob Storage | Microsoft | 99.999999999% | Strong | Object + append blobs |
| Google Cloud Storage | Google | 99.999999999% | Strong | Object (similar to S3) |
| MinIO | Self-hosted | Configurable | Strong | S3-compatible API |

### Object Storage vs File System

```
Object Storage (S3, GCS, Azure Blob):
─────────────────────────────────────
- Flat namespace (bucket + key)
- Immutable objects (overwrite = new version)
- HTTP API (REST)
- No partial updates (rewrite entire object)
- Virtually unlimited scale
- Built-in CDN integration

Distributed File System (HDFS, CephFS):
─────────────────────────────────────────
- Hierarchical namespace (directories)
- Mutable files (seek + write)
- POSIX or POSIX-like API
- Supports appends and random writes
- Requires cluster management
- Better for compute-local processing
```

---

## When to Use Distributed FS vs Object Storage

### Choose a Distributed File System When:

1. **Compute locality matters** — processing engines (Spark, MapReduce) need data-local scheduling
2. **POSIX semantics required** — legacy applications expect open/read/write/close
3. **Mutable files** — logs that need appending, databases with random writes
4. **Low-latency metadata operations** — millions of small file renames/listings
5. **On-premises** — you manage your own hardware

### Choose Object Storage When:

1. **Immutable data** — write once, read many (data lake, backups, media)
2. **Massive scale** — petabytes without cluster management
3. **HTTP access** — web applications, CDN-served content
4. **Managed infrastructure** — no ops team for storage cluster
5. **Cost optimization** — tiered storage (hot/warm/cold/archive)

### Decision Matrix

```
┌────────────────────────────┬────────────────┬────────────────┐
│ Requirement                │ DFS            │ Object Storage │
├────────────────────────────┼────────────────┼────────────────┤
│ Append to existing file    │ ✓              │ ✗              │
│ Random read/write          │ ✓              │ ✗              │
│ Data locality for compute  │ ✓              │ ✗              │
│ Unlimited scale (managed)  │ ✗              │ ✓              │
│ HTTP REST API access       │ ✗              │ ✓              │
│ Lifecycle policies         │ Manual         │ Built-in       │
│ Cross-region replication   │ Complex        │ One toggle     │
│ Cost per TB (cold data)    │ Higher         │ Much lower     │
│ Sub-millisecond latency    │ ✓ (local)      │ ✗ (network)    │
│ Versioning built-in        │ ✗              │ ✓              │
└────────────────────────────┴────────────────┴────────────────┘
```

---

## Real-World Architecture Patterns

### Pattern 1: Data Lake with Object Storage + Compute

```
Ingestion → Object Storage (S3/GCS) → Spark/Presto reads via connectors
```

### Pattern 2: Traditional Hadoop Cluster

```
Ingestion → HDFS → MapReduce/Spark (data-local) → Results to HDFS/S3
```

### Pattern 3: Hybrid (Lakehouse)

```
Raw data → Object Storage (S3)
              ↓
Delta Lake / Iceberg (table format on object storage)
              ↓
Spark / Trino reads with caching layer
```

---

## Exercises

1. **Design Question:** You need to store 10 PB of log data. Writes are append-only at 100 GB/hour. Reads are batch analytics jobs running nightly. Would you choose HDFS or S3? Justify your answer considering cost, operations, and performance.

2. **Calculation:** A GFS cluster has 1,000 chunkservers, each with 10 TB. Files are stored with replication factor 3. What is the usable storage capacity? If average file size is 500 MB, how many metadata entries does the master need?

3. **CRUSH Exercise:** Given a Ceph cluster with 3 racks, 4 hosts per rack, and 6 OSDs per host, write a CRUSH rule that places 3 replicas on different racks. What happens when an entire rack goes offline?

4. **Comparison:** For each scenario, choose the most appropriate system (GFS, HDFS, Ceph, GlusterFS, or S3):
   - A video streaming platform storing 4K video files
   - A genomics research lab with 500 TB of sequencing data processed by custom C++ tools expecting POSIX semantics
   - A startup with 3 engineers needing to store ML training datasets
   - A bank archiving transaction logs for 7-year regulatory compliance

5. **Consistency Analysis:** A client writes to a file on GFS using the append operation. Two other clients also append concurrently. Draw the timeline showing how the lease mechanism ensures a defined order. What guarantees does GFS provide about the final file contents?

---

## Summary

| Concept | Key Takeaway |
|---|---|
| GFS | Pioneered large-scale DFS; single master, large chunks, append-optimized |
| HDFS | Open-source GFS; NameNode + DataNodes, rack-aware replication |
| Ceph | No single point of failure; CRUSH eliminates metadata lookups for placement |
| GlusterFS | No metadata server; elastic hashing; POSIX-compliant |
| Object Storage | Managed, virtually unlimited, HTTP-based; best for immutable data |
| Choosing | DFS for compute locality and mutability; object storage for scale and cost |
