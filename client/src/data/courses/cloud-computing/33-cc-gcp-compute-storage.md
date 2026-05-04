---
title: "GCP Compute and Storage"
---

# GCP Compute and Storage

In this lesson, you will dive deep into Google Cloud Platform's compute and storage services. You'll learn how to choose the right machine types, run containers serverlessly, and pick the optimal storage class for your data.

---

## Compute Engine

Compute Engine is GCP's **Infrastructure-as-a-Service (IaaS)** offering — virtual machines running on Google's global infrastructure. It gives you full control over the operating system, networking, and installed software.

### Machine Type Families

GCP organizes machine types into families optimized for different workloads:

| Family | Prefix | Optimized For | vCPUs | Memory |
|--------|--------|--------------|-------|--------|
| **General Purpose** | `e2`, `n2`, `n2d`, `t2d`, `c4` | Balanced workloads | 2–224 | Up to 896 GB |
| **Compute Optimized** | `c2`, `c2d`, `h3` | CPU-intensive tasks | 4–360 | Up to 1.4 TB |
| **Memory Optimized** | `m1`, `m2`, `m3` | In-memory databases | 96–416 | Up to 12 TB |
| **Accelerator Optimized** | `a2`, `a3`, `g2` | ML training, GPUs/TPUs | 12–208 | Up to 1.9 TB |
| **Storage Optimized** | `z3` | High disk throughput | 88–176 | Up to 1.4 TB |

### Machine Type Naming Convention

```
[family]-[type]-[vCPUs]
```

**Examples:**

| Machine Type | Family | vCPUs | Memory |
|-------------|--------|-------|--------|
| `e2-micro` | General (economy) | 0.25–2 shared | 1 GB |
| `e2-medium` | General (economy) | 1–2 shared | 4 GB |
| `e2-standard-4` | General (economy) | 4 | 16 GB |
| `n2-standard-8` | General (2nd gen) | 8 | 32 GB |
| `n2-highmem-16` | General (high memory) | 16 | 128 GB |
| `n2-highcpu-32` | General (high CPU) | 32 | 32 GB |
| `c2-standard-60` | Compute optimized | 60 | 240 GB |
| `m2-megamem-416` | Memory optimized | 416 | 5.8 TB |
| `a2-highgpu-8g` | Accelerator (8× A100 GPUs) | 96 | 680 GB |

### Custom Machine Types

If predefined types don't fit, create custom configurations:

```bash
# Custom machine type: 6 vCPUs, 24 GB RAM
gcloud compute instances create my-custom-vm \
  --zone=us-central1-a \
  --custom-cpu=6 \
  --custom-memory=24GB \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud
```

### Creating and Managing VMs

```bash
# Create a standard VM
gcloud compute instances create web-server \
  --zone=us-central1-a \
  --machine-type=e2-standard-4 \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --tags=http-server,https-server

# SSH into the VM
gcloud compute ssh web-server --zone=us-central1-a

# List all instances
gcloud compute instances list

# Stop a VM (to save cost)
gcloud compute instances stop web-server --zone=us-central1-a

# Resize (change machine type — must be stopped first)
gcloud compute instances set-machine-type web-server \
  --zone=us-central1-a \
  --machine-type=e2-standard-8

# Delete a VM
gcloud compute instances delete web-server --zone=us-central1-a
```

### Preemptible and Spot VMs

**Spot VMs** (successor to Preemptible VMs) offer up to **91% discounts** but can be reclaimed by Google at any time with 30 seconds notice.

| Feature | Standard VM | Preemptible VM | Spot VM |
|---------|------------|----------------|---------|
| **Max lifetime** | Unlimited | 24 hours | Unlimited |
| **Preemption** | No | Yes (after 24h or on demand) | Yes (any time) |
| **Discount** | 0% | Up to 80% | Up to 91% |
| **Availability** | Guaranteed | Best effort | Best effort |
| **Use case** | Production workloads | Batch processing, CI/CD | Fault-tolerant, stateless workloads |

```bash
# Create a Spot VM
gcloud compute instances create batch-worker \
  --zone=us-central1-a \
  --machine-type=e2-standard-4 \
  --provisioning-model=SPOT \
  --instance-termination-action=STOP \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud
```

### Sole-Tenant Nodes

For workloads requiring **physical isolation** (compliance, licensing, or performance), sole-tenant nodes give you a dedicated physical server:

```bash
# Create a sole-tenant node template
gcloud compute sole-tenancy node-templates create my-template \
  --node-type=n2-node-80-640 \
  --region=us-central1

# Create a sole-tenant node group
gcloud compute sole-tenancy node-groups create my-node-group \
  --zone=us-central1-a \
  --node-template=my-template \
  --target-size=1

# Launch a VM on the sole-tenant node
gcloud compute instances create isolated-vm \
  --zone=us-central1-a \
  --machine-type=n2-standard-8 \
  --node-group=my-node-group \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud
```

**Use cases for sole-tenant nodes:**
- BYOL (Bring Your Own License) for Windows Server or Oracle
- Compliance requirements mandating physical separation
- Workloads sensitive to noisy-neighbor effects
- GPU or hardware-specific configurations

---

## App Engine

App Engine is GCP's fully managed **Platform-as-a-Service (PaaS)**. It handles infrastructure, scaling, and load balancing so you can focus on code.

### Standard vs. Flexible Environment

| Feature | Standard | Flexible |
|---------|----------|----------|
| **Startup time** | Seconds | Minutes |
| **Scale to zero** | Yes | No (minimum 1 instance) |
| **Languages** | Python, Java, Node.js, Go, PHP, Ruby | Any (via custom Docker image) |
| **SSH access** | No | Yes |
| **Write to disk** | No (use Cloud Storage) | Yes (ephemeral) |
| **Pricing** | Per instance-hour (free tier available) | Per vCPU + memory per hour |
| **Max request timeout** | 10 minutes | 60 minutes |
| **Background threads** | Limited | Yes |
| **Network** | No VPC by default | VPC-native |
| **Use case** | Web apps, APIs, microservices | Custom runtimes, legacy apps |

### App Engine Configuration (app.yaml)

**Standard Environment:**

```yaml
runtime: python312
instance_class: F2

automatic_scaling:
  target_cpu_utilization: 0.65
  min_instances: 1
  max_instances: 10
  min_pending_latency: 30ms
  max_pending_latency: automatic

handlers:
  - url: /static
    static_dir: static
  - url: /.*
    script: auto

env_variables:
  DATABASE_URL: "your-database-url"
```

**Flexible Environment:**

```yaml
runtime: custom
env: flex

automatic_scaling:
  min_num_instances: 2
  max_num_instances: 20
  cool_down_period_sec: 120
  cpu_utilization:
    target_utilization: 0.6

resources:
  cpu: 2
  memory_gb: 4
  disk_size_gb: 20

network:
  name: default
```

### Deploying to App Engine

```bash
# Deploy the application
gcloud app deploy app.yaml

# Deploy with a specific version
gcloud app deploy --version=v2 --no-promote

# Split traffic between versions (canary deployment)
gcloud app services set-traffic default \
  --splits=v1=0.9,v2=0.1

# View application logs
gcloud app logs tail -s default

# Browse the deployed app
gcloud app browse
```

---

## Cloud Run

Cloud Run is a fully managed platform for running **stateless containers**. It abstracts away all infrastructure — you just provide a container image, and Cloud Run handles scaling, networking, and HTTPS.

### Key Features

| Feature | Details |
|---------|---------|
| **Scale to zero** | No charge when no requests |
| **Auto-scaling** | 0 to 1,000+ instances |
| **Any language** | Anything that runs in a container |
| **HTTPS** | Automatic TLS certificates |
| **Concurrency** | Up to 1,000 requests per instance |
| **CPU allocation** | Always-on or request-only |
| **Max timeout** | Up to 60 minutes |
| **VPC access** | Connect to private resources |

### Deploying to Cloud Run

```bash
# Build the container image
gcloud builds submit --tag gcr.io/my-project/my-app

# Deploy to Cloud Run
gcloud run deploy my-service \
  --image=gcr.io/my-project/my-app \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=100 \
  --concurrency=80

# Update environment variables
gcloud run services update my-service \
  --update-env-vars="DB_HOST=10.0.0.1,DB_NAME=mydb"

# View service details
gcloud run services describe my-service --region=us-central1

# Get the service URL
gcloud run services describe my-service \
  --region=us-central1 \
  --format="value(status.url)"
```

### Example Dockerfile for Cloud Run

```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Cloud Run sets the PORT environment variable
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
```

> **Important:** Cloud Run requires your container to listen on the port specified by the `PORT` environment variable (default 8080).

---

## Cloud Functions (2nd Gen)

Cloud Functions (2nd gen) is built on Cloud Run and Eventarc, providing a serverless Functions-as-a-Service experience with enhanced capabilities.

### 1st Gen vs. 2nd Gen

| Feature | 1st Gen | 2nd Gen |
|---------|---------|---------|
| **Max timeout** | 9 minutes | 60 minutes |
| **Max instances** | 3,000 | 1,000 (configurable) |
| **Concurrency** | 1 request/instance | Up to 1,000 requests/instance |
| **Min instances** | Not supported | Supported (reduce cold starts) |
| **Event sources** | Limited set | 125+ via Eventarc |
| **Traffic splitting** | No | Yes (via Cloud Run revisions) |
| **Infrastructure** | Custom | Cloud Run |

### Deploying a 2nd Gen Function

```bash
# HTTP-triggered function
gcloud functions deploy processOrder \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=. \
  --entry-point=processOrder \
  --trigger-http \
  --allow-unauthenticated \
  --memory=256Mi \
  --timeout=60s \
  --min-instances=1

# Cloud Storage trigger
gcloud functions deploy processImage \
  --gen2 \
  --runtime=python312 \
  --region=us-central1 \
  --source=. \
  --entry-point=process_image \
  --trigger-event-filters="type=google.cloud.storage.object.v1.finalized" \
  --trigger-event-filters="bucket=my-upload-bucket"

# Pub/Sub trigger
gcloud functions deploy handleMessage \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=. \
  --entry-point=handleMessage \
  --trigger-topic=my-topic
```

### Example Function (Node.js)

```javascript
import functions from "@google-cloud/functions-framework";

functions.http("processOrder", (req, res) => {
  const { orderId, items, total } = req.body;

  if (!orderId || !items || !total) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  console.log(`Processing order ${orderId}: ${items.length} items, $${total}`);

  res.status(201).json({
    orderId,
    status: "processing",
    estimatedDelivery: "2-3 business days",
    timestamp: new Date().toISOString(),
  });
});
```

---

## GKE (Google Kubernetes Engine) — Overview

GKE is Google's managed Kubernetes service. Since Google created Kubernetes, GKE is often considered the most feature-rich and well-integrated managed K8s offering.

### GKE Modes

| Mode | Description | Best For |
|------|-------------|----------|
| **Autopilot** | Fully managed — Google manages nodes, scaling, security | Most workloads, hands-off management |
| **Standard** | You manage node pools and configuration | Fine-grained control, GPU workloads |

```bash
# Create an Autopilot cluster
gcloud container clusters create-auto my-cluster \
  --region=us-central1

# Create a Standard cluster
gcloud container clusters create my-cluster \
  --zone=us-central1-a \
  --num-nodes=3 \
  --machine-type=e2-standard-4

# Get cluster credentials (for kubectl)
gcloud container clusters get-credentials my-cluster \
  --region=us-central1

# Deploy a workload
kubectl create deployment my-app \
  --image=gcr.io/my-project/my-app

# Expose with a load balancer
kubectl expose deployment my-app \
  --type=LoadBalancer \
  --port=80 \
  --target-port=8080
```

> **Tip:** For most use cases, start with **Autopilot mode**. It's simpler, more cost-effective (pay per pod), and follows Google's best practices automatically.

---

## Cloud Storage

Cloud Storage is GCP's **object storage** service — the equivalent of AWS S3 or Azure Blob Storage. It stores data as objects in buckets and is designed for durability, availability, and scale.

### Storage Classes

| Class | Min Storage Duration | Use Case | Availability SLA |
|-------|---------------------|----------|-----------------|
| **Standard** | None | Frequently accessed data (hot data) | 99.95% (multi-region: 99.99%) |
| **Nearline** | 30 days | Accessed less than once a month | 99.9% |
| **Coldline** | 90 days | Accessed less than once a quarter | 99.9% |
| **Archive** | 365 days | Accessed less than once a year | 99.9% |

**Pricing comparison (per GB/month, us-multi-region):**

| Class | Storage | Class A ops (per 10K) | Class B ops (per 10K) | Retrieval (per GB) |
|-------|---------|----------------------|----------------------|-------------------|
| **Standard** | $0.026 | $0.05 | $0.004 | Free |
| **Nearline** | $0.010 | $0.10 | $0.01 | $0.01 |
| **Coldline** | $0.004 | $0.10 | $0.05 | $0.02 |
| **Archive** | $0.0012 | $0.50 | $0.50 | $0.05 |

> **Key insight:** Colder classes have lower storage costs but higher retrieval costs. Choose based on your access pattern.

### Bucket Operations with gsutil and gcloud

```bash
# Create a bucket (must be globally unique)
gcloud storage buckets create gs://my-company-data-2025 \
  --location=us-central1 \
  --default-storage-class=standard \
  --uniform-bucket-level-access

# Upload files
gcloud storage cp ./data.csv gs://my-company-data-2025/raw/
gcloud storage cp -r ./images/ gs://my-company-data-2025/images/

# Download files
gcloud storage cp gs://my-company-data-2025/raw/data.csv ./local-data.csv

# List bucket contents
gcloud storage ls gs://my-company-data-2025/
gcloud storage ls -l gs://my-company-data-2025/raw/  # detailed listing

# Sync a local directory to a bucket
gcloud storage rsync -r ./local-folder/ gs://my-company-data-2025/synced/

# Delete objects
gcloud storage rm gs://my-company-data-2025/raw/old-data.csv

# Using legacy gsutil (still widely used)
gsutil cp file.txt gs://my-bucket/
gsutil ls gs://my-bucket/
gsutil rsync -r ./local/ gs://my-bucket/backup/
```

### Lifecycle Rules

Automatically manage object transitions and deletions:

```json
{
  "lifecycle": {
    "rule": [
      {
        "action": { "type": "SetStorageClass", "storageClass": "NEARLINE" },
        "condition": { "age": 30, "matchesStorageClass": ["STANDARD"] }
      },
      {
        "action": { "type": "SetStorageClass", "storageClass": "COLDLINE" },
        "condition": { "age": 90, "matchesStorageClass": ["NEARLINE"] }
      },
      {
        "action": { "type": "SetStorageClass", "storageClass": "ARCHIVE" },
        "condition": { "age": 365, "matchesStorageClass": ["COLDLINE"] }
      },
      {
        "action": { "type": "Delete" },
        "condition": { "age": 730 }
      }
    ]
  }
}
```

```bash
# Apply lifecycle rules
gcloud storage buckets update gs://my-company-data-2025 \
  --lifecycle-file=lifecycle.json
```

### Versioning and Retention

```bash
# Enable object versioning
gcloud storage buckets update gs://my-company-data-2025 \
  --versioning

# List object versions
gcloud storage ls -a gs://my-company-data-2025/

# Set a retention policy (objects cannot be deleted for 90 days)
gcloud storage buckets update gs://my-company-data-2025 \
  --retention-period=90d
```

---

## Persistent Disks

Persistent Disks provide durable, high-performance **block storage** for Compute Engine VMs. Unlike local SSDs, data persists when the VM is stopped.

### Disk Types

| Disk Type | IOPS (read/write) | Throughput | Use Case |
|-----------|-------------------|------------|----------|
| **pd-standard** | Up to 7,500 / 15,000 | 180 / 240 MB/s | Cost-effective, bulk storage |
| **pd-balanced** | Up to 80,000 / 80,000 | 1,200 / 1,200 MB/s | General workloads (best value) |
| **pd-ssd** | Up to 100,000 / 100,000 | 1,200 / 1,200 MB/s | High-performance databases |
| **pd-extreme** | Up to 120,000 / 120,000 | 2,400 / 2,400 MB/s | Mission-critical, lowest latency |
| **Hyperdisk Extreme** | Up to 350,000 / 350,000 | 5,000 / 5,000 MB/s | Highest performance tier |
| **Local SSD** | 900,000 / 800,000 | 9,400 / 6,600 MB/s | Caching, temp data (ephemeral!) |

```bash
# Create a persistent disk
gcloud compute disks create my-data-disk \
  --zone=us-central1-a \
  --size=200GB \
  --type=pd-ssd

# Attach to a VM
gcloud compute instances attach-disk my-vm \
  --disk=my-data-disk \
  --zone=us-central1-a

# Create a snapshot (for backup)
gcloud compute disks snapshot my-data-disk \
  --zone=us-central1-a \
  --snapshot-names=my-backup-snapshot

# Resize a disk (can only increase)
gcloud compute disks resize my-data-disk \
  --zone=us-central1-a \
  --size=500GB
```

> **Tip:** Persistent Disks can be attached to multiple VMs in **read-only** mode — useful for sharing data across instances.

---

## Filestore

Filestore is a managed **NFS file share** service for applications that need a file system interface.

| Tier | Min Capacity | IOPS | Throughput | Use Case |
|------|-------------|------|------------|----------|
| **Basic HDD** | 1 TB | 600 | 100 MB/s | General file sharing |
| **Basic SSD** | 2.5 TB | 60,000 | 1,200 MB/s | Low-latency workloads |
| **Zonal** | 1 TB | Up to 160,000 | Up to 2,560 MB/s | Performance-sensitive apps |
| **Enterprise** | 1 TB | Up to 120,000 | Up to 1,920 MB/s | Business-critical, multi-zone |

```bash
# Create a Filestore instance
gcloud filestore instances create my-filestore \
  --zone=us-central1-a \
  --tier=BASIC_SSD \
  --file-share=name=vol1,capacity=2560GB \
  --network=name=default

# Mount on a VM (after SSH-ing in)
sudo mkdir -p /mnt/filestore
sudo mount 10.0.0.2:/vol1 /mnt/filestore

# Verify the mount
df -h /mnt/filestore
```

---

## Cloud SQL and AlloyDB

### Cloud SQL

Cloud SQL is a fully managed relational database supporting **MySQL**, **PostgreSQL**, and **SQL Server**.

| Feature | Details |
|---------|---------|
| **Engines** | MySQL 8.0+, PostgreSQL 14+, SQL Server 2019+ |
| **Max storage** | 64 TB |
| **High availability** | Regional (automatic failover) |
| **Backups** | Automated daily + on-demand |
| **Read replicas** | Up to 10 per instance |
| **Maintenance** | Automatic patching with configurable window |

```bash
# Create a PostgreSQL instance
gcloud sql instances create my-db \
  --database-version=POSTGRES_16 \
  --tier=db-custom-2-8192 \
  --region=us-central1 \
  --availability-type=REGIONAL \
  --storage-size=100GB \
  --storage-type=SSD

# Set the root password
gcloud sql users set-password postgres \
  --instance=my-db \
  --password=YOUR_SECURE_PASSWORD

# Create a database
gcloud sql databases create myapp \
  --instance=my-db

# Connect via Cloud SQL Proxy (recommended for applications)
cloud-sql-proxy my-project:us-central1:my-db

# Create a read replica
gcloud sql instances create my-db-replica \
  --master-instance-name=my-db \
  --region=us-east1
```

### AlloyDB

AlloyDB is Google's **PostgreSQL-compatible** database built for demanding workloads. It combines the familiarity of PostgreSQL with Google's infrastructure.

| Feature | Cloud SQL PostgreSQL | AlloyDB |
|---------|---------------------|---------|
| **Performance** | Standard | Up to 4× faster than standard PostgreSQL |
| **Analytics** | Separate tool needed | Built-in columnar engine |
| **AI integration** | Manual | Built-in vector search, pgvector |
| **Availability** | 99.95% (regional) | 99.99% (with multi-zone) |
| **Storage** | Attached disk | Distributed, auto-scaling |
| **Use case** | Standard OLTP | High-performance OLTP + analytics |

```bash
# Create an AlloyDB cluster
gcloud alloydb clusters create my-alloydb \
  --region=us-central1 \
  --password=YOUR_SECURE_PASSWORD

# Create a primary instance
gcloud alloydb instances create primary \
  --cluster=my-alloydb \
  --region=us-central1 \
  --instance-type=PRIMARY \
  --cpu-count=4
```

---

## Memorystore

Memorystore provides fully managed **in-memory data stores** for caching and real-time data processing.

### Redis vs. Memcached

| Feature | Memorystore for Redis | Memorystore for Memcached |
|---------|----------------------|--------------------------|
| **Data structures** | Strings, hashes, lists, sets, sorted sets | Key-value only |
| **Persistence** | Optional (RDB snapshots) | No |
| **Replication** | Yes (read replicas, HA) | No |
| **Max size** | 300 GB | 5 TB (distributed) |
| **Use case** | Caching, session store, pub/sub, leaderboards | Simple caching, large-scale cache layer |

```bash
# Create a Redis instance
gcloud redis instances create my-cache \
  --size=5 \
  --region=us-central1 \
  --redis-version=redis_7_2 \
  --tier=STANDARD_HA

# Get connection details
gcloud redis instances describe my-cache \
  --region=us-central1 \
  --format="value(host, port)"

# Create a Memcached instance
gcloud memcache instances create my-memcached \
  --node-count=3 \
  --node-cpu=2 \
  --node-memory=4GB \
  --region=us-central1
```

---

## GCP Compute Decision Tree

Choosing the right compute service can be overwhelming. Use this decision guide:

```
Do you need full control over the OS?
├── YES → Compute Engine (VMs)
│         Need physical isolation? → Sole-Tenant Nodes
│         Need GPUs/TPUs? → Accelerator-optimized VMs
└── NO
    ├── Is your app containerized?
    │   ├── YES
    │   │   ├── Need complex orchestration? → GKE
    │   │   └── Simple stateless service? → Cloud Run
    │   └── NO
    │       ├── Need zero infra management? → App Engine (Standard)
    │       ├── Need custom runtime? → App Engine (Flexible)
    │       └── Event-driven / glue code? → Cloud Functions
    └── ...
```

### Quick Comparison

| Service | Abstraction | Scale to Zero | Cold Start | Best For |
|---------|------------|---------------|------------|----------|
| **Compute Engine** | VM | No | N/A | Full control, legacy apps |
| **GKE** | Container cluster | No | N/A | Microservices, K8s ecosystem |
| **Cloud Run** | Container | Yes | ~1–2s | Stateless APIs, async workers |
| **App Engine Standard** | App code | Yes | ~0.5–2s | Web apps, rapid prototyping |
| **App Engine Flexible** | Container | No | ~1–5 min | Custom runtimes, long requests |
| **Cloud Functions** | Function | Yes | ~0.5–3s | Event handling, glue logic |

---

## GCP Storage Decision Tree

```
What type of data?
├── Unstructured (files, images, videos, backups)
│   └── Cloud Storage
│       ├── Frequently accessed → Standard class
│       ├── Monthly access → Nearline
│       ├── Quarterly access → Coldline
│       └── Annual access → Archive
├── Block storage (VM disks)
│   ├── Persistent data → Persistent Disk (pd-balanced or pd-ssd)
│   └── Temp/cache data → Local SSD
├── Shared file system (NFS)
│   └── Filestore
├── Relational data
│   ├── Standard workload → Cloud SQL
│   ├── High-performance → AlloyDB
│   └── Global scale → Cloud Spanner
└── Cache / in-memory
    ├── Advanced features → Memorystore for Redis
    └── Simple caching → Memorystore for Memcached
```

---

## Exercises

### Exercise 1: VM Configuration

For each scenario, choose the best machine type family and specify whether you'd use a standard, spot, or sole-tenant VM:

1. Training a deep learning model with GPU acceleration
2. Running a CI/CD pipeline that can tolerate interruptions
3. Hosting an Oracle database that requires dedicated hardware for licensing
4. Running a web application with moderate, balanced resource needs
5. Processing large in-memory datasets for real-time analytics

<details>
<summary>Solution</summary>

1. **Accelerator-optimized (a2/a3)**, Standard VM — GPU workloads need reliability
2. **General purpose (e2)**, Spot VM — CI/CD is fault-tolerant, save up to 91%
3. **Memory-optimized (m2/m3)**, Sole-tenant node — Oracle BYOL requires physical isolation
4. **General purpose (e2 or n2)**, Standard VM — balanced compute/memory ratio
5. **Memory-optimized (m2)**, Standard VM — needs large amounts of RAM for in-memory processing

</details>

### Exercise 2: Storage Class Selection

Match each data type to the most cost-effective Cloud Storage class:

1. Application log files accessed for debugging within the first week
2. Medical imaging data that must be retained for 7 years (rarely accessed)
3. User profile pictures served on a social media platform
4. Monthly financial reports accessed during quarterly audits
5. Database backups retained for disaster recovery (accessed if primary fails)

<details>
<summary>Solution</summary>

1. **Standard** — actively accessed during the first week; use lifecycle rules to transition to Nearline after 30 days
2. **Archive** — 365-day minimum retention fits 7-year requirement, rarely accessed
3. **Standard** — frequently accessed, low-latency serving needed
4. **Coldline** — accessed quarterly (every 90 days), 90-day minimum retention matches
5. **Nearline** — infrequently accessed but must be available within hours if needed

</details>

### Exercise 3: Practical gcloud Commands

Write gcloud commands to:
1. Create an `e2-standard-4` VM in `us-west1-a` with a 100 GB SSD boot disk
2. Create a Cloud Storage bucket with Nearline default class in `us-west1`
3. Deploy a Node.js 20 Cloud Function triggered by HTTP
4. Create a Cloud SQL PostgreSQL 16 instance with high availability

<details>
<summary>Solution</summary>

```bash
# 1. Create VM
gcloud compute instances create my-vm \
  --zone=us-west1-a \
  --machine-type=e2-standard-4 \
  --boot-disk-size=100GB \
  --boot-disk-type=pd-ssd \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud

# 2. Create Cloud Storage bucket
gcloud storage buckets create gs://my-nearline-bucket-2025 \
  --location=us-west1 \
  --default-storage-class=nearline \
  --uniform-bucket-level-access

# 3. Deploy Cloud Function
gcloud functions deploy myFunction \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-west1 \
  --source=. \
  --entry-point=myFunction \
  --trigger-http \
  --allow-unauthenticated

# 4. Create Cloud SQL instance
gcloud sql instances create my-postgres \
  --database-version=POSTGRES_16 \
  --tier=db-custom-4-16384 \
  --region=us-west1 \
  --availability-type=REGIONAL \
  --storage-size=100GB \
  --storage-type=SSD \
  --storage-auto-increase
```

</details>

---

## Key Takeaways

- **Compute Engine** machine types are organized by family (general, compute, memory, accelerator, storage) — choose based on workload characteristics.
- **Spot VMs** save up to 91% but can be preempted; use for fault-tolerant batch jobs, not production servers.
- **Sole-tenant nodes** provide physical isolation for compliance and BYOL licensing requirements.
- **App Engine Standard** scales to zero and starts in seconds; **Flexible** supports custom runtimes but takes minutes to start.
- **Cloud Run** is the go-to for stateless containers — serverless, auto-scaling, and pay-per-use.
- **Cloud Functions (2nd gen)** extends Cloud Run with event-driven triggers and supports up to 60-minute timeouts.
- **GKE Autopilot** is the recommended starting point for Kubernetes — it manages nodes and security automatically.
- **Cloud Storage** has four classes (Standard, Nearline, Coldline, Archive) — use lifecycle rules to automate transitions and minimize costs.
- **Cloud SQL** handles standard relational workloads; **AlloyDB** offers up to 4× better performance with built-in analytics.
- **Memorystore** provides managed Redis (feature-rich) and Memcached (simple, large-scale caching).
- Use the **compute and storage decision trees** to quickly identify the right service for your use case.
