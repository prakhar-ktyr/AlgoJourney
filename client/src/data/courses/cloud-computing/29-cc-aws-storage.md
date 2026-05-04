---
title: "AWS Storage Services"
---

# AWS Storage Services

In this lesson, you will learn about the wide range of **storage services** offered by Amazon Web Services (AWS). Storage is one of the most fundamental building blocks of any cloud architecture, and AWS provides purpose-built storage solutions for virtually every use case — from hosting static websites to archiving petabytes of compliance data.

---

## Why Storage Matters in the Cloud

Before cloud computing, organizations had to purchase and manage their own storage hardware. This meant:

- **Over-provisioning** — buying more storage than needed "just in case"
- **Under-provisioning** — running out of space at the worst possible time
- **Maintenance burden** — replacing failed drives, managing RAID arrays, firmware updates

Cloud storage eliminates these problems by offering:

| Benefit | Description |
|---------|-------------|
| **Elasticity** | Scale from gigabytes to petabytes on demand |
| **Durability** | Data is replicated automatically across multiple facilities |
| **Pay-as-you-go** | Only pay for what you actually use |
| **Managed** | AWS handles hardware, firmware, and infrastructure |
| **Global access** | Access your data from anywhere in the world |

---

## AWS Storage Categories

AWS storage services fall into three broad categories:

| Category | Services | Use Cases |
|----------|----------|-----------|
| **Object Storage** | S3, S3 Glacier | Media files, backups, data lakes, static websites |
| **Block Storage** | EBS | Boot volumes, databases, high-performance apps |
| **File Storage** | EFS, FSx | Shared file systems, home directories, CMS |

---

## Amazon S3 (Simple Storage Service)

Amazon S3 is the most widely used cloud storage service in the world. It stores data as **objects** inside **buckets**.

### Key Concepts

- **Bucket** — A container for objects. Bucket names must be **globally unique** across all AWS accounts.
- **Object** — A file plus its metadata. Each object is identified by a unique **key** (its path within the bucket).
- **Region** — Each bucket is created in a specific AWS Region. Data does not leave the region unless you configure it to.

### Bucket Naming Rules

| Rule | Example |
|------|---------|
| Must be globally unique | `my-company-prod-assets-2026` |
| 3–63 characters long | ✅ `data` / ❌ `ab` |
| Lowercase letters, numbers, hyphens only | ✅ `my-bucket-1` / ❌ `My_Bucket` |
| Must start with a letter or number | ✅ `app-logs` / ❌ `-logs` |
| Cannot be formatted as an IP address | ❌ `192.168.1.1` |

### Creating a Bucket (AWS CLI)

```bash
# Create a bucket in the us-east-1 region
aws s3 mb s3://my-app-assets-2026 --region us-east-1
```

### Uploading and Downloading Objects

```bash
# Upload a file
aws s3 cp ./report.pdf s3://my-app-assets-2026/reports/report.pdf

# Download a file
aws s3 cp s3://my-app-assets-2026/reports/report.pdf ./downloaded-report.pdf

# Sync an entire directory
aws s3 sync ./website s3://my-app-assets-2026/website/
```

### Object URL Structure

Every S3 object has a URL:

```
https://my-app-assets-2026.s3.amazonaws.com/reports/report.pdf
       └─── bucket name ───┘                └──── key ────┘
```

---

## S3 Storage Classes

AWS offers multiple storage classes so you can optimize costs based on how frequently data is accessed.

| Storage Class | Access Pattern | Min Duration | Retrieval Fee | Use Case |
|--------------|----------------|--------------|---------------|----------|
| **S3 Standard** | Frequent | None | None | Active application data |
| **S3 Intelligent-Tiering** | Unknown/changing | None | None | Unpredictable workloads |
| **S3 Standard-IA** | Infrequent | 30 days | Per-GB fee | Backups, disaster recovery |
| **S3 One Zone-IA** | Infrequent | 30 days | Per-GB fee | Reproducible infrequent data |
| **S3 Glacier Instant** | Rare, needs ms access | 90 days | Per-GB fee | Medical images, news archives |
| **S3 Glacier Flexible** | Rare, minutes–hours OK | 90 days | Per-GB fee | Compliance archives |
| **S3 Glacier Deep Archive** | Very rare | 180 days | Per-GB fee | Long-term regulatory archives |

### Cost Comparison (Approximate per GB/month, US East)

```
S3 Standard:            $0.023
S3 Standard-IA:         $0.0125
S3 One Zone-IA:         $0.010
S3 Glacier Instant:     $0.004
S3 Glacier Flexible:    $0.0036
S3 Glacier Deep Archive:$0.00099
```

> **Tip:** Use S3 Intelligent-Tiering when you are unsure about access patterns. AWS will automatically move objects between tiers to save money.

---

## S3 Features

### Versioning

Versioning keeps multiple variants of an object in the same bucket. When enabled:

- Every overwrite creates a **new version** instead of replacing the old one
- Deleted objects get a **delete marker** — the previous version is still recoverable
- Protects against accidental deletions and overwrites

```bash
# Enable versioning on a bucket
aws s3api put-bucket-versioning \
  --bucket my-app-assets-2026 \
  --versioning-configuration Status=Enabled

# List all versions of an object
aws s3api list-object-versions \
  --bucket my-app-assets-2026 \
  --prefix reports/report.pdf
```

### Lifecycle Policies

Lifecycle policies automatically transition or expire objects based on rules you define.

**Example:** Move logs to cheaper storage as they age:

```json
{
  "Rules": [
    {
      "ID": "ArchiveOldLogs",
      "Status": "Enabled",
      "Filter": { "Prefix": "logs/" },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

This rule:
1. After **30 days** → moves to Standard-IA
2. After **90 days** → moves to Glacier
3. After **365 days** → deletes the object

### Replication

S3 supports two types of replication:

| Type | Description |
|------|-------------|
| **Cross-Region Replication (CRR)** | Copies objects to a bucket in a different AWS Region |
| **Same-Region Replication (SRR)** | Copies objects to another bucket in the same Region |

**Requirements:**
- Versioning must be enabled on both source and destination buckets
- An IAM role with appropriate permissions must be configured
- Replication applies to **new objects** after the rule is created

### Encryption

S3 supports multiple encryption options:

| Encryption Type | Key Management | Description |
|----------------|----------------|-------------|
| **SSE-S3** | AWS-managed | Default; Amazon manages keys entirely |
| **SSE-KMS** | AWS KMS | You control key policies, audit with CloudTrail |
| **SSE-C** | Customer-provided | You supply the key with every request |
| **Client-side** | Your application | Data encrypted before upload |

```bash
# Upload with SSE-KMS encryption
aws s3 cp ./secret.txt s3://my-bucket/secret.txt \
  --sse aws:kms \
  --sse-kms-key-id alias/my-key
```

> **Best Practice:** As of January 2023, S3 encrypts all new objects with SSE-S3 by default. You only need to configure encryption explicitly if you require KMS or customer-managed keys.

### Static Website Hosting

S3 can serve a static website directly from a bucket:

```bash
# Enable static website hosting
aws s3 website s3://my-website-bucket/ \
  --index-document index.html \
  --error-document error.html

# Upload website files
aws s3 sync ./dist s3://my-website-bucket/
```

The website is accessible at:
```
http://my-website-bucket.s3-website-us-east-1.amazonaws.com
```

> **Note:** For HTTPS and a custom domain, combine S3 with **Amazon CloudFront** (a CDN).

---

## Amazon EBS (Elastic Block Store)

EBS provides **block-level storage** volumes for use with EC2 instances. Think of it like a virtual hard drive that you attach to a virtual server.

### EBS vs S3

| Feature | EBS | S3 |
|---------|-----|-----|
| Storage type | Block | Object |
| Attach to EC2 | Yes (required) | No (accessed via API) |
| File system | You format it (ext4, NTFS) | No file system needed |
| Latency | Sub-millisecond | Milliseconds |
| Max size | 64 TiB per volume | Virtually unlimited |
| Best for | Databases, boot volumes | Media, backups, data lakes |

### EBS Volume Types

| Volume Type | Code | IOPS (max) | Throughput (max) | Use Case |
|-------------|------|------------|------------------|----------|
| General Purpose SSD | `gp3` | 16,000 | 1,000 MiB/s | Boot volumes, dev/test |
| Provisioned IOPS SSD | `io2` | 256,000 | 4,000 MiB/s | High-performance databases |
| Throughput Optimized HDD | `st1` | 500 | 500 MiB/s | Big data, data warehouses |
| Cold HDD | `sc1` | 250 | 250 MiB/s | Infrequent access, lowest cost |

```bash
# Create a 100 GB gp3 volume
aws ec2 create-volume \
  --volume-type gp3 \
  --size 100 \
  --availability-zone us-east-1a

# Attach a volume to an EC2 instance
aws ec2 attach-volume \
  --volume-id vol-0123456789abcdef0 \
  --instance-id i-0123456789abcdef0 \
  --device /dev/sdf
```

### EBS Snapshots

Snapshots are **point-in-time backups** of EBS volumes stored in S3.

- Snapshots are **incremental** — only changed blocks are stored after the first snapshot
- You can create new volumes from snapshots (even in different Availability Zones or Regions)
- Snapshots can be shared with other AWS accounts or made public

```bash
# Create a snapshot
aws ec2 create-snapshot \
  --volume-id vol-0123456789abcdef0 \
  --description "Database backup 2026-05-04"

# Create a volume from a snapshot in a different AZ
aws ec2 create-volume \
  --snapshot-id snap-0123456789abcdef0 \
  --availability-zone us-east-1b \
  --volume-type gp3
```

---

## Amazon EFS (Elastic File System)

EFS is a **fully managed, serverless** NFS file system that can be shared across multiple EC2 instances simultaneously.

| Feature | EBS | EFS |
|---------|-----|-----|
| Attach to multiple instances | ❌ (one instance per volume*) | ✅ (thousands) |
| Scales automatically | ❌ (fixed size) | ✅ (grows/shrinks) |
| Protocol | Block device | NFS v4.1 |
| Pricing model | Per provisioned GB | Per used GB |
| Availability | Single AZ | Multi-AZ |

\* EBS Multi-Attach exists for `io2` volumes but is limited to up to 16 instances.

```bash
# Create an EFS file system
aws efs create-file-system \
  --performance-mode generalPurpose \
  --throughput-mode bursting \
  --encrypted

# Mount on an EC2 instance (after creating mount targets)
sudo mount -t efs fs-0123456789abcdef0:/ /mnt/efs
```

---

## Amazon FSx

FSx provides fully managed file systems for specialized workloads:

| FSx Variant | Protocol | Best For |
|-------------|----------|----------|
| **FSx for Windows File Server** | SMB | Windows-based applications, Active Directory |
| **FSx for Lustre** | Lustre | HPC, machine learning, media processing |
| **FSx for NetApp ONTAP** | NFS, SMB, iSCSI | Migrating on-premises NetApp workloads |
| **FSx for OpenZFS** | NFS | Linux workloads needing ZFS features |

---

## AWS Storage Gateway

Storage Gateway is a **hybrid cloud storage** service that connects your on-premises environment to AWS cloud storage.

| Gateway Type | Description | Use Case |
|-------------|-------------|----------|
| **S3 File Gateway** | NFS/SMB interface backed by S3 | Replace on-prem NAS with cloud storage |
| **FSx File Gateway** | Low-latency access to FSx for Windows | Hybrid Windows file shares |
| **Volume Gateway** | iSCSI block storage backed by S3 | Block-level cloud backups |
| **Tape Gateway** | Virtual tape library backed by S3/Glacier | Replace physical tape backup systems |

---

## AWS Backup

AWS Backup is a centralized service to automate and manage backups across AWS services:

- Supports EBS, EFS, RDS, DynamoDB, S3, FSx, and more
- Create **backup plans** with schedules and retention policies
- **Cross-Region** and **cross-account** backup copy
- **Backup Vault Lock** for compliance (WORM — Write Once Read Many)

```bash
# Create a backup plan (simplified)
aws backup create-backup-plan --backup-plan '{
  "BackupPlanName": "DailyBackup",
  "Rules": [{
    "RuleName": "DailyRule",
    "ScheduleExpression": "cron(0 5 ? * * *)",
    "TargetBackupVaultName": "Default",
    "Lifecycle": {
      "DeleteAfterDays": 30
    }
  }]
}'
```

---

## Data Transfer Services

Moving large amounts of data to AWS over the internet can be slow. AWS offers several solutions:

### AWS Snow Family

| Device | Storage | Use Case |
|--------|---------|----------|
| **Snowcone** | 8 TB HDD / 14 TB SSD | Edge computing, small migrations |
| **Snowball Edge Storage** | 80 TB | Large data migrations |
| **Snowball Edge Compute** | 80 TB + compute | Data processing at the edge |
| **Snowmobile** | 100 PB (a truck!) | Exabyte-scale data center migrations |

### AWS DataSync

DataSync automates and accelerates moving data between on-premises storage and AWS services:

```
On-Premises NAS  ──DataSync Agent──▶  S3 / EFS / FSx
```

- Transfers up to **10x faster** than open-source tools
- Built-in data integrity validation
- Supports scheduling and bandwidth throttling

### AWS Transfer Family

Managed file transfer service supporting:

- **SFTP** (SSH File Transfer Protocol)
- **FTPS** (FTP over SSL)
- **FTP** (plain — only within VPC)
- **AS2** (B2B data exchange)

Data lands directly in S3 or EFS.

---

## Cost Optimization Strategies

Storage costs can grow quickly. Here are proven strategies to keep them under control:

### 1. Choose the Right Storage Class

```
Frequently accessed?  → S3 Standard
Infrequent access?    → S3 Standard-IA or One Zone-IA
Archive (rarely)?     → Glacier Flexible or Deep Archive
Unknown pattern?      → S3 Intelligent-Tiering
```

### 2. Implement Lifecycle Policies

Automatically transition data to cheaper tiers as it ages.

### 3. Enable S3 Storage Lens

S3 Storage Lens provides organization-wide visibility into storage usage and activity trends. Use it to identify:

- Buckets with no lifecycle policies
- Buckets not using the most cost-effective storage class
- Incomplete multipart uploads (they cost money!)

### 4. Clean Up Incomplete Multipart Uploads

```bash
# List incomplete multipart uploads
aws s3api list-multipart-uploads --bucket my-bucket

# Add a lifecycle rule to auto-abort after 7 days
aws s3api put-bucket-lifecycle-configuration --bucket my-bucket \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "AbortIncompleteUploads",
      "Status": "Enabled",
      "Filter": {},
      "AbortIncompleteMultipartUpload": {
        "DaysAfterInitiation": 7
      }
    }]
  }'
```

### 5. Right-Size EBS Volumes

- Monitor usage with CloudWatch metrics
- Use `gp3` instead of `gp2` — it is cheaper and offers better baseline performance
- Delete unattached (orphaned) EBS volumes

### 6. Use S3 Requester Pays

If others download data from your bucket frequently, enable **Requester Pays** to shift the data transfer cost to the downloader.

---

## Summary Table: Choosing the Right Storage Service

| Requirement | Recommended Service |
|-------------|-------------------|
| Store images, videos, documents | S3 |
| Host a static website | S3 + CloudFront |
| Database storage for EC2 | EBS (gp3 or io2) |
| Shared file system for Linux instances | EFS |
| Shared file system for Windows instances | FSx for Windows |
| Archive data for compliance (7+ years) | S3 Glacier Deep Archive |
| Migrate 50 TB from on-prem data center | Snowball Edge |
| Automated cross-service backups | AWS Backup |
| Hybrid cloud file shares | Storage Gateway |

---

## Exercises

### Exercise 1: Storage Class Selection

For each scenario, choose the best S3 storage class:

1. A mobile app stores user profile pictures that are viewed daily.
2. A hospital keeps MRI scans that must be available within milliseconds but are rarely accessed after the first month.
3. A bank must retain transaction logs for 10 years due to regulations and will almost never access them.
4. A startup is unsure how often their analytics reports will be accessed.

<details>
<summary>Solutions</summary>

1. **S3 Standard** — frequently accessed data needs low latency.
2. **S3 Glacier Instant Retrieval** — rare access but requires millisecond retrieval.
3. **S3 Glacier Deep Archive** — very long retention, almost no access.
4. **S3 Intelligent-Tiering** — automatically optimizes costs for unknown access patterns.

</details>

### Exercise 2: EBS Volume Selection

Match each workload to the best EBS volume type:

1. A PostgreSQL database requiring 50,000 IOPS.
2. A development web server with moderate I/O.
3. A Hadoop cluster processing large sequential reads.
4. An archive server storing cold log files.

<details>
<summary>Solutions</summary>

1. **io2** — Provisioned IOPS SSD for demanding database workloads.
2. **gp3** — General Purpose SSD with good baseline performance.
3. **st1** — Throughput Optimized HDD for sequential big data workloads.
4. **sc1** — Cold HDD for lowest-cost infrequent access.

</details>

### Exercise 3: Design a Storage Architecture

A media company needs to:
- Store raw video files (10 TB/month of new footage)
- Serve edited videos to millions of users worldwide
- Archive raw footage after 60 days (must be retrievable within 12 hours)
- Keep backups of everything for 1 year

Design a storage architecture using AWS services. Which services and storage classes would you use?

<details>
<summary>Solution</summary>

1. **Raw footage upload** → S3 Standard (active editing phase)
2. **Edited video delivery** → S3 Standard + CloudFront CDN (global low-latency delivery)
3. **Archive raw footage** → S3 lifecycle policy to move to Glacier Flexible Retrieval after 60 days (retrievable in 3–5 hours)
4. **Backups** → AWS Backup with a plan that creates daily snapshots and retains them for 365 days
5. **Data transfer** → If on-premises, use DataSync for ongoing uploads or Snowball for the initial bulk migration

</details>

---

## Key Takeaways

- **S3** is the go-to service for object storage — virtually unlimited, highly durable (99.999999999%), and deeply integrated with other AWS services.
- **Storage classes** let you trade access speed for lower cost — always match the class to your access pattern.
- **Lifecycle policies** automate cost savings by transitioning data to cheaper tiers as it ages.
- **EBS** provides high-performance block storage for EC2 — choose `gp3` for most workloads, `io2` for demanding databases.
- **EFS** is ideal when multiple instances need to share a file system concurrently.
- **Snow Family** devices solve the "shipping data is faster than uploading" problem for large migrations.
- **Cost optimization** is an ongoing practice: use Storage Lens, clean up orphaned resources, and right-size volumes regularly.

---

Next lesson: **Azure Overview and Core Services** →
