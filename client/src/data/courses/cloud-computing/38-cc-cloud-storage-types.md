---
title: "Cloud Storage Types"
---

# Cloud Storage Types

Choosing the right storage type is one of the most important decisions in cloud architecture. Pick the wrong one, and you'll face performance bottlenecks, high costs, or architectural headaches.

There are **three fundamental types** of cloud storage: **block**, **object**, and **file**. Each is designed for different workloads, and understanding their differences is essential for every cloud practitioner.

---

## The Three Storage Types at a Glance

| Feature | Block Storage | Object Storage | File Storage |
|---------|--------------|----------------|--------------|
| **Analogy** | A hard drive | A filing cabinet | A shared network folder |
| **Access** | Attached to one instance | HTTP/HTTPS API | NFS or SMB protocol |
| **Data unit** | Fixed-size blocks | Objects (files + metadata) | Files in directories |
| **Performance** | Fastest (low latency) | Moderate (higher latency) | Moderate |
| **Best for** | Databases, boot volumes | Media, backups, data lakes | Shared file access |
| **Scalability** | Limited by volume size | Virtually unlimited | High, but with limits |
| **Cost** | Highest per GB | Lowest per GB | Moderate |

Let's explore each type in detail.

---

## Block Storage

### How Block Storage Works

Block storage divides data into fixed-size chunks called **blocks** (typically 512 bytes or 4 KB). Each block gets a unique address, and the storage system reassembles them when data is read.

```
File: database.db (1 MB)

Block Storage breaks it into:
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Block 1 │ │ Block 2 │ │ Block 3 │ │ Block 4 │  ...
│ 4 KB    │ │ 4 KB    │ │ 4 KB    │ │ 4 KB    │
│ Addr: 0 │ │ Addr: 1 │ │ Addr: 2 │ │ Addr: 3 │
└─────────┘ └─────────┘ └─────────┘ └─────────┘

To update a single byte:
  → Only the block containing that byte is rewritten
  → Other blocks are untouched
  → This is WHY block storage is fast for databases
```

Think of it like a physical hard drive — the OS formats it with a file system (ext4, NTFS) and manages files on top of the raw blocks.

### Key Characteristics

- **Low latency**: Microsecond-level response times with SSD-based storage
- **Single attachment**: Typically attached to one compute instance at a time
- **Requires formatting**: You must create a file system before use
- **Persistent**: Data survives instance restarts (unlike instance store)
- **Snapshots**: Point-in-time backups stored as incremental snapshots

### Block Storage Use Cases

| Use Case | Why Block Storage? |
|----------|--------------------|
| **Boot volumes** | OS needs a formatted disk to boot from |
| **Relational databases** | Low latency random I/O for reads and writes |
| **Transaction processing** | Consistent sub-millisecond performance |
| **High-performance apps** | IOPS-intensive workloads |
| **Containers** | Persistent volumes for stateful containers |

### Cloud Block Storage Services

#### AWS Elastic Block Store (EBS)

```
EBS Volume Types:
┌─────────────────────┬──────────┬────────────┬──────────────┐
│ Volume Type         │ Max IOPS │ Throughput  │ Use Case     │
├─────────────────────┼──────────┼────────────┼──────────────┤
│ gp3 (General SSD)   │ 16,000   │ 1,000 MB/s │ Most workloads│
│ io2 (Provisioned)   │ 256,000  │ 4,000 MB/s │ Critical DBs │
│ st1 (Throughput HDD)│ 500      │ 500 MB/s   │ Big data     │
│ sc1 (Cold HDD)      │ 250      │ 250 MB/s   │ Archives     │
└─────────────────────┴──────────┴────────────┴──────────────┘
```

**Example: Creating and attaching an EBS volume (AWS CLI):**

```bash
# Create a 100 GB gp3 volume
aws ec2 create-volume \
  --volume-type gp3 \
  --size 100 \
  --availability-zone us-east-1a \
  --iops 3000 \
  --throughput 125

# Attach to an instance
aws ec2 attach-volume \
  --volume-id vol-0123456789abcdef0 \
  --instance-id i-0123456789abcdef0 \
  --device /dev/xvdf

# On the instance: format and mount
sudo mkfs -t ext4 /dev/xvdf
sudo mkdir /data
sudo mount /dev/xvdf /data
```

#### Azure Managed Disks

```
Disk Types:
┌─────────────────────┬──────────┬────────────┬──────────────┐
│ Disk Type           │ Max IOPS │ Throughput  │ Use Case     │
├─────────────────────┼──────────┼────────────┼──────────────┤
│ Premium SSD v2      │ 80,000   │ 1,200 MB/s │ Databases    │
│ Premium SSD         │ 20,000   │ 900 MB/s   │ Production   │
│ Standard SSD        │ 6,000    │ 750 MB/s   │ Web servers  │
│ Standard HDD        │ 2,000    │ 500 MB/s   │ Backups      │
└─────────────────────┴──────────┴────────────┴──────────────┘
```

#### GCP Persistent Disk

```
Disk Types:
┌─────────────────────┬──────────┬────────────┬──────────────┐
│ Disk Type           │ Max IOPS │ Throughput  │ Use Case     │
├─────────────────────┼──────────┼────────────┼──────────────┤
│ pd-ssd              │ 100,000  │ 1,200 MB/s │ Databases    │
│ pd-balanced         │ 80,000   │ 1,200 MB/s │ Most work    │
│ pd-standard (HDD)   │ 7,500    │ 400 MB/s   │ Cold data    │
│ pd-extreme           │ 120,000  │ 2,400 MB/s │ SAP HANA     │
└─────────────────────┴──────────┴────────────┴──────────────┘
```

### Block Storage Snapshots

Snapshots are **incremental backups** of your volume:

```
Day 1: Full snapshot (10 GB used → 10 GB snapshot)
Day 2: Only changed blocks (500 MB changed → 500 MB stored)
Day 3: Only changed blocks (200 MB changed → 200 MB stored)

Total storage: 10.7 GB (not 30 GB!)
```

**Snapshot best practices:**

```
1. Schedule regular snapshots (daily, hourly for critical data)
2. Use lifecycle policies to delete old snapshots
3. Copy snapshots to another region for disaster recovery
4. Test restoring from snapshots periodically
5. Tag snapshots with purpose and retention policy
```

---

## Object Storage

### How Object Storage Works

Object storage stores data as **objects** — each object contains the data itself, metadata, and a unique identifier (key). There are no folders or hierarchy — it's a flat namespace (though you can use key prefixes to simulate folders).

```
Object:
┌─────────────────────────────────────────────────┐
│ Key:      photos/vacation/sunset.jpg             │
│ Data:     [binary image data — 2.4 MB]           │
│ Metadata: {                                      │
│   "Content-Type": "image/jpeg",                  │
│   "uploaded-by": "jane",                         │
│   "resolution": "4032x3024",                     │
│   "Content-Length": 2516582                       │
│ }                                                │
│ Version:  v3 (if versioning enabled)             │
│ Storage Class: STANDARD                          │
└─────────────────────────────────────────────────┘

Accessed via HTTP:
  GET https://my-bucket.s3.amazonaws.com/photos/vacation/sunset.jpg
```

### Key Characteristics

- **Flat namespace**: No directory hierarchy — "folders" are simulated by key prefixes
- **Immutable**: You replace the entire object — can't modify a byte in the middle
- **HTTP access**: Read and write via REST API (PUT, GET, DELETE)
- **Unlimited scale**: Store petabytes of data without capacity planning
- **Rich metadata**: Attach custom key-value metadata to every object
- **Versioning**: Keep every version of every object
- **Access control**: Bucket policies, ACLs, pre-signed URLs

### Object Storage Use Cases

| Use Case | Why Object Storage? |
|----------|---------------------|
| **Media files** | Unlimited storage, HTTP delivery, CDN integration |
| **Backups** | Cheap, durable (11 nines), lifecycle policies |
| **Data lakes** | Store raw data at scale, query with Athena/BigQuery |
| **Static websites** | Host HTML/CSS/JS directly from a bucket |
| **Log storage** | Ingest massive log files, analyze with Athena |
| **Machine learning** | Store training datasets, model artifacts |

### Cloud Object Storage Services

#### AWS S3 (Simple Storage Service)

```
S3 Storage Classes:
┌──────────────────────┬──────────────┬────────────┬──────────────┐
│ Storage Class        │ Cost/GB/mo   │ Retrieval  │ Use Case     │
├──────────────────────┼──────────────┼────────────┼──────────────┤
│ S3 Standard          │ $0.023       │ Instant    │ Frequent access│
│ S3 Intelligent-Tier  │ $0.023 + fee │ Instant    │ Unknown patterns│
│ S3 Standard-IA       │ $0.0125      │ Instant    │ Infrequent    │
│ S3 One Zone-IA       │ $0.01        │ Instant    │ Reproducible  │
│ S3 Glacier Instant   │ $0.004       │ Instant    │ Archives (fast)│
│ S3 Glacier Flexible  │ $0.0036      │ Minutes-hrs│ Archives      │
│ S3 Glacier Deep      │ $0.00099     │ 12-48 hrs  │ Compliance    │
└──────────────────────┴──────────────┴────────────┴──────────────┘
```

**Example: S3 bucket operations (AWS CLI):**

```bash
# Create a bucket
aws s3 mb s3://my-app-data-2024

# Upload a file
aws s3 cp backup.tar.gz s3://my-app-data-2024/backups/

# List objects
aws s3 ls s3://my-app-data-2024/backups/

# Generate a pre-signed URL (expires in 1 hour)
aws s3 presign s3://my-app-data-2024/backups/backup.tar.gz \
  --expires-in 3600

# Sync a directory
aws s3 sync ./dist/ s3://my-app-data-2024/website/ --delete
```

#### Azure Blob Storage

```
Access Tiers:
┌──────────────┬──────────────┬────────────────┐
│ Tier         │ Cost/GB/mo   │ Retrieval      │
├──────────────┼──────────────┼────────────────┤
│ Hot          │ $0.018       │ Instant        │
│ Cool         │ $0.01        │ Instant        │
│ Cold         │ $0.0036      │ Instant        │
│ Archive      │ $0.00099     │ Hours          │
└──────────────┴──────────────┴────────────────┘
```

#### Google Cloud Storage

```
Storage Classes:
┌──────────────────┬──────────────┬────────────────┐
│ Class            │ Cost/GB/mo   │ Min Duration   │
├──────────────────┼──────────────┼────────────────┤
│ Standard         │ $0.020       │ None           │
│ Nearline         │ $0.010       │ 30 days        │
│ Coldline         │ $0.004       │ 90 days        │
│ Archive          │ $0.0012      │ 365 days       │
└──────────────────┴──────────────┴────────────────┘
```

---

## File Storage

### How File Storage Works

File storage provides a **shared file system** that multiple compute instances can access simultaneously using standard protocols like NFS (Linux) or SMB (Windows).

```
File Storage (shared):
┌──────────────────────────────────┐
│  Shared File System (/shared/)   │
│  ├── config/                     │
│  │   ├── app.conf                │
│  │   └── db.conf                 │
│  ├── uploads/                    │
│  │   ├── image001.jpg            │
│  │   └── document.pdf            │
│  └── logs/                       │
│      ├── app.log                 │
│      └── error.log               │
└──────────┬───────────┬───────────┘
           │           │
      ┌────┴────┐ ┌────┴────┐
      │ Server  │ │ Server  │
      │    A    │ │    B    │
      │ (read/  │ │ (read/  │
      │  write) │ │  write) │
      └─────────┘ └─────────┘

Both servers see the same files simultaneously!
```

### Key Characteristics

- **Shared access**: Multiple instances mount the same file system concurrently
- **POSIX-compliant**: Standard file operations (open, read, write, close, lock)
- **Directory hierarchy**: Real folders and files (not simulated like object storage)
- **File locking**: Support for concurrent access control
- **Elastic**: Automatically grows and shrinks (with managed services)

### File Storage Use Cases

| Use Case | Why File Storage? |
|----------|-------------------|
| **Shared application data** | Multiple servers need the same config or uploads |
| **CMS content** | WordPress media library shared across instances |
| **Home directories** | User home folders on shared infrastructure |
| **Machine learning** | Training data shared across GPU instances |
| **Legacy applications** | Apps that require a POSIX file system |
| **Container storage** | Shared persistent volumes for Kubernetes pods |

### Cloud File Storage Services

#### AWS Elastic File System (EFS)

```
EFS Features:
├── Protocol: NFSv4.1
├── Scaling: Automatic (petabyte scale)
├── Performance Modes:
│   ├── General Purpose (default) — low latency
│   └── Max I/O — higher throughput, higher latency
├── Throughput Modes:
│   ├── Bursting — scales with file system size
│   ├── Provisioned — set specific throughput
│   └── Elastic — automatically scales throughput
├── Storage Classes:
│   ├── Standard — frequent access ($0.30/GB/mo)
│   ├── Standard-IA — infrequent ($0.025/GB/mo)
│   ├── One Zone — single AZ ($0.16/GB/mo)
│   └── One Zone-IA — single AZ infrequent ($0.0133/GB/mo)
└── Access: Multiple AZs, multiple instances
```

**Example: Creating and mounting EFS:**

```bash
# Create EFS file system
aws efs create-file-system \
  --performance-mode generalPurpose \
  --throughput-mode elastic \
  --encrypted

# Create mount target in each subnet
aws efs create-mount-target \
  --file-system-id fs-0123456789abcdef0 \
  --subnet-id subnet-abc123 \
  --security-groups sg-xyz789

# Mount on EC2 instance
sudo yum install -y amazon-efs-utils
sudo mkdir /shared
sudo mount -t efs fs-0123456789abcdef0:/ /shared

# Add to /etc/fstab for persistence
echo "fs-0123456789abcdef0:/ /shared efs defaults,_netdev 0 0" \
  | sudo tee -a /etc/fstab
```

#### Azure Files

```
Azure Files Features:
├── Protocols: SMB 3.0, NFS 4.1, REST API
├── Tiers:
│   ├── Premium (SSD) — low latency
│   ├── Transaction Optimized (HDD)
│   ├── Hot (HDD)
│   └── Cool (HDD)
├── Max size: 100 TiB per share
├── Snapshots: Share-level snapshots
└── Azure File Sync: Sync with on-premises servers
```

#### Google Cloud Filestore

```
Filestore Features:
├── Protocol: NFSv3
├── Tiers:
│   ├── Basic HDD — development, testing
│   ├── Basic SSD — general purpose
│   ├── High Scale SSD — high-performance
│   └── Enterprise — mission-critical, multi-zone
├── Scaling: Manual (choose capacity at creation)
└── Backups: Scheduled or on-demand
```

---

## Choosing the Right Storage Type

### Decision Flowchart

```
What does your application need?
│
├── Low-latency random I/O?
│   └── YES → Block Storage (EBS, Managed Disks, Persistent Disk)
│
├── Shared access from multiple servers?
│   └── YES → File Storage (EFS, Azure Files, Filestore)
│
├── HTTP-based access / unlimited scale?
│   └── YES → Object Storage (S3, Azure Blob, Cloud Storage)
│
├── Database storage?
│   └── YES → Block Storage
│
├── Static website / media files?
│   └── YES → Object Storage
│
├── Backups / archives?
│   └── YES → Object Storage (cheapest per GB)
│
└── Not sure?
    └── Start with Object Storage (most versatile, cheapest)
```

### Detailed Comparison Table

| Criteria | Block | Object | File |
|----------|-------|--------|------|
| **Latency** | Sub-millisecond | Milliseconds | Low millisecond |
| **Throughput** | Very high (GB/s) | High (GB/s) | Moderate |
| **Max size** | 64 TB per volume | Unlimited | 100+ TB |
| **Access pattern** | Random read/write | Sequential read, full write | Random read/write |
| **Protocol** | iSCSI / NVMe | HTTP/HTTPS REST | NFS / SMB |
| **Concurrent access** | Single instance* | Unlimited | Multiple instances |
| **File system** | You manage (ext4, XFS) | No file system | Managed for you |
| **Cost (per GB/mo)** | $0.08–$0.125 | $0.004–$0.023 | $0.025–$0.30 |
| **Durability** | 99.999% | 99.999999999% (11 nines) | 99.999999999% |
| **Snapshots** | Yes | Versioning | Yes |
| **Encryption** | At rest + in transit | At rest + in transit | At rest + in transit |

> *Multi-attach is available for io2 EBS volumes and GCP PD in read-only mode, but with limitations.

---

## Performance Tiers

Each storage type offers different performance levels at different price points.

### Block Storage Performance

```
                    IOPS
                     ↑
   io2 Block Express │ ██████████████████████  256,000
                     │
   io2              │ ████████████████        64,000
                     │
   gp3              │ ████████                16,000
                     │
   gp2              │ ████████                16,000
                     │
   st1 (HDD)        │ ██                      500
                     │
   sc1 (HDD)        │ █                       250
                     └────────────────────────→ Cost

Rule of thumb:
  - Dev/test:   gp3 (default 3,000 IOPS)
  - Production: gp3 with custom IOPS or io2
  - Critical:   io2 Block Express
  - Big data:   st1 (throughput, not IOPS)
  - Archive:    sc1 (cheapest HDD)
```

### Object Storage Performance

```
S3 Performance:
  - 3,500 PUT/second per prefix
  - 5,500 GET/second per prefix
  - Unlimited prefixes

To maximize throughput:
  - Distribute objects across prefixes
  - Use S3 Transfer Acceleration for uploads
  - Use multipart upload for files > 100 MB
  - Use byte-range fetches for parallel reads
```

**Example: Multipart upload for large files:**

```bash
# Automatically uses multipart for large files
aws s3 cp large-dataset.tar.gz s3://my-bucket/ \
  --expected-size 10737418240

# Configure multipart threshold
aws configure set s3.multipart_threshold 64MB
aws configure set s3.multipart_chunksize 16MB
```

### File Storage Performance

```
EFS Performance (Elastic Throughput Mode):
  - Read:  Up to 10 GB/s
  - Write: Up to 3 GB/s
  - IOPS:  Up to 55,000 read / 25,000 write

Cost trade-off:
  - Bursting: Free (included), but limited by file system size
  - Provisioned: Pay for guaranteed throughput
  - Elastic: Pay only for what you use (recommended)
```

---

## Data Lifecycle Management

As data ages, it typically needs less frequent access. **Lifecycle policies** automatically move data to cheaper storage tiers.

### Object Storage Lifecycle

```
S3 Lifecycle Rule Example:
┌────────────┬─────────────────────────────────┐
│ Age        │ Action                          │
├────────────┼─────────────────────────────────┤
│ Day 0      │ Store in S3 Standard            │
│ Day 30     │ Move to S3 Standard-IA          │
│ Day 90     │ Move to S3 Glacier Instant       │
│ Day 365    │ Move to S3 Glacier Deep Archive  │
│ Day 730    │ Delete permanently              │
└────────────┴─────────────────────────────────┘
```

**AWS CLI lifecycle configuration:**

```json
{
  "Rules": [
    {
      "ID": "ArchiveOldData",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "logs/"
      },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER_IR"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 730
      }
    }
  ]
}
```

### File Storage Lifecycle

EFS supports **Intelligent-Tiering** (automatic) or lifecycle policies:

```
EFS Lifecycle Policy:
  - Files not accessed for 30 days → Infrequent Access (IA) tier
  - Files accessed again → automatically moved back to Standard

Savings: IA tier costs 92% less than Standard tier
```

### Block Storage Lifecycle

Block storage doesn't have built-in tiering. Instead, manage lifecycle through:

```
Block Storage Lifecycle:
  1. Take daily snapshots
  2. Delete snapshots older than 30 days
  3. Copy critical snapshots to another region
  4. Convert unused volumes from gp3 → sc1 (cold HDD)
  5. Delete detached volumes after a grace period
```

**AWS Data Lifecycle Manager (DLM) policy:**

```json
{
  "PolicyType": "EBS_SNAPSHOT_MANAGEMENT",
  "ResourceTypes": ["VOLUME"],
  "TargetTags": [{"Key": "Backup", "Value": "daily"}],
  "Schedules": [{
    "Name": "DailySnapshots",
    "CreateRule": {"Interval": 24, "IntervalUnit": "HOURS"},
    "RetainRule": {"Count": 30},
    "CopyTags": true
  }]
}
```

---

## Cost Comparison: Real-World Example

Storing **1 TB** of data for one month across providers and storage types:

| Storage Type | AWS | Azure | GCP |
|-------------|-----|-------|-----|
| **Block (SSD)** | $80 (gp3) | $73 (Premium SSD) | $68 (pd-ssd) |
| **Block (HDD)** | $45 (st1) | $32 (Standard HDD) | $40 (pd-standard) |
| **Object (Standard)** | $23 (S3) | $18 (Blob Hot) | $20 (Standard) |
| **Object (Archive)** | $1 (Deep Archive) | $1 (Archive) | $1.20 (Archive) |
| **File (Standard)** | $300 (EFS) | $60 (Azure Files) | $204 (Filestore) |

> Prices are approximate and vary by region. Always check the latest pricing.

**Key insight:** Object storage is 3–10x cheaper than block storage, and archive tiers are 20–80x cheaper than standard object storage.

---

## Exercises

### Exercise 1: Storage Selection

For each workload, choose the best storage type and explain why:

1. A PostgreSQL database with high write throughput
2. A media company storing 500 TB of video files
3. A web application where 5 servers share uploaded user photos
4. Archive of compliance documents accessed once per year
5. Boot volume for an EC2 instance

<details>
<summary>Solution</summary>

1. **Block Storage (io2/gp3)** — Databases need low-latency random I/O
2. **Object Storage (S3 Standard)** — Unlimited scale, HTTP delivery, CDN-friendly
3. **File Storage (EFS)** — Multiple servers need concurrent read/write access to the same files
4. **Object Storage (S3 Glacier Deep Archive)** — Cheapest option, accessed very rarely
5. **Block Storage (gp3)** — Only block storage can be used as a boot volume

</details>

### Exercise 2: Lifecycle Policy

Design a lifecycle policy for an e-commerce company's product images stored in S3:

- Images are accessed frequently for 7 days after upload
- Accessed occasionally for the next 60 days
- Rarely accessed after 60 days
- Must be kept for 2 years for legal reasons
- Can be deleted after 2 years

<details>
<summary>Solution</summary>

```
S3 Lifecycle Rule:
  Prefix: product-images/

  Day 0:    S3 Standard (frequent access)
  Day 7:    S3 Standard-IA (cheaper, occasional access)
  Day 60:   S3 Glacier Instant Retrieval (rare, but instant when needed)
  Day 730:  Delete (2 years = 730 days)

Estimated savings vs. keeping everything in Standard:
  - Days 7-60:   ~45% cheaper (Standard-IA)
  - Days 60-730: ~83% cheaper (Glacier Instant)
```

</details>

### Exercise 3: Architecture Design

Your company is building a machine learning platform. It needs:
- **Training data**: 50 TB of images, read by 8 GPU instances simultaneously
- **Model artifacts**: 200 GB, accessed occasionally after training
- **Active database**: 500 GB PostgreSQL with high IOPS
- **Logs**: 2 TB/month, queried weekly, retained for 1 year

Design the storage architecture specifying the type and service for each component.

<details>
<summary>Solution</summary>

```
1. Training Data: File Storage (EFS or FSx for Lustre)
   - EFS: Easy setup, 8 instances mount simultaneously
   - FSx for Lustre: Better performance for ML training
   - Tier: EFS Standard or FSx (linked to S3 for cold data)

2. Model Artifacts: Object Storage (S3)
   - S3 Standard-IA after 30 days
   - Versioning enabled (track model versions)
   - Cost: ~$2.50/month for 200 GB in Standard-IA

3. Active Database: Block Storage (EBS io2)
   - io2: Provisioned IOPS for predictable performance
   - Size: 500 GB with 10,000+ IOPS
   - Multi-AZ snapshot replication for disaster recovery

4. Logs: Object Storage (S3 with lifecycle)
   - Ingest to S3 Standard
   - Move to S3 Standard-IA after 30 days
   - Move to S3 Glacier after 90 days
   - Delete after 365 days
   - Query with Athena (no server needed)
   - Cost: ~$10-15/month per TB (blended across tiers)
```

</details>

---

## Key Takeaways

| Concept | Remember |
|---------|----------|
| **Block storage** | Like a hard drive — fastest, for databases and boot volumes |
| **Object storage** | HTTP-accessible, unlimited scale — cheapest per GB, for media and backups |
| **File storage** | Shared file system — for multi-server access via NFS/SMB |
| **Choose block** | When you need low latency, random I/O, or a formatted disk |
| **Choose object** | When you need scale, HTTP access, or cheap archival |
| **Choose file** | When multiple servers need the same files simultaneously |
| **Lifecycle policies** | Automate data movement to cheaper tiers as it ages |
| **Performance tiers** | Match the storage tier to your IOPS and throughput needs |
| **Cost awareness** | Object archive can be 80x cheaper than block SSD |
| **Durability** | Object storage wins at 11 nines; block and file are also very durable |

---

## What's Next?

Now that you understand networking (VPC, DNS, CDN) and storage in the cloud, the next lessons will cover **compute services** — the engines that run your applications, from virtual machines to containers to serverless functions.
