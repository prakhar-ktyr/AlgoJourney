---
title: "Disaster Recovery and Backup"
---

# Disaster Recovery and Backup

What happens when an entire data center goes down? When a database gets corrupted? When a ransomware attack encrypts all your files? **Disaster Recovery (DR)** is the practice of preparing for and recovering from these worst-case scenarios. In this lesson, you'll learn DR concepts, strategies, tools, and how to build resilient systems that survive real-world failures.

---

## What Is Disaster Recovery?

Disaster Recovery is the set of **policies, tools, and procedures** to recover technology infrastructure and systems after a natural or human-made disaster.

### Types of Disasters

| Category | Examples |
|----------|----------|
| **Natural** | Earthquakes, floods, hurricanes, wildfires |
| **Hardware** | Disk failures, server crashes, network outages |
| **Software** | Bugs, corrupted databases, failed deployments |
| **Human** | Accidental deletion, misconfigurations |
| **Security** | Ransomware, data breaches, DDoS attacks |
| **Provider** | Cloud region outage, service degradation |

> **Real-world example:** In 2017, an AWS S3 outage in `us-east-1` took down thousands of websites and services for hours — including some that had no DR plan.

---

## Core DR Concepts: RPO and RTO

The two most important metrics in disaster recovery:

### RPO — Recovery Point Objective

**"How much data can you afford to lose?"**

RPO defines the maximum acceptable amount of data loss measured in time.

```
RPO Examples:
──────────────────────────────────────────────────────
RPO          Meaning                    Backup Method
──────────────────────────────────────────────────────
0 (zero)     No data loss tolerated     Synchronous replication
15 min       Lose ≤ 15 min of data      Continuous replication
1 hour       Lose ≤ 1 hour of data      Hourly snapshots
24 hours     Lose ≤ 1 day of data       Daily backups
1 week       Lose ≤ 1 week of data      Weekly backups
```

### RTO — Recovery Time Objective

**"How quickly must you be back online?"**

RTO defines the maximum acceptable downtime after a disaster.

```
RTO Examples:
──────────────────────────────────────────────────────
RTO          Meaning                    DR Strategy
──────────────────────────────────────────────────────
0 (zero)     No downtime tolerated      Multi-site active-active
< 1 min      Near-instant failover      Hot standby
< 1 hour     Quick recovery             Warm standby
< 4 hours    Same-day recovery          Pilot light
< 24 hours   Next-day recovery          Backup & restore
< 1 week     Slow recovery              Offsite backups
```

### The RPO-RTO Diagram

```
                    Data Loss ◀──── RPO ────▶ Downtime
                         │                      │
  ─────────┬─────────────┼──────────────────────┼──────────▶ Time
           │             │                      │
       Last Backup    Disaster              Recovery
                      Occurs               Complete

  ◀── RPO = time since last backup ──▶
                      ◀── RTO = time to recover ──▶
```

---

## DR Strategies

There are four main DR strategies, each with different cost and recovery characteristics.

### Strategy Comparison

```
                Cost ▲
                     │
  Multi-Site ●       │  ◀── Highest cost, fastest recovery
  Active-Active      │
                     │
  Warm       ●       │
  Standby            │
                     │
  Pilot      ●       │
  Light              │
                     │
  Backup &   ●       │  ◀── Lowest cost, slowest recovery
  Restore            │
                     └──────────────────────────────▶ RTO
                         Slow                    Fast
```

### 1. Backup and Restore

The simplest and cheapest strategy. Back up your data and restore it when disaster strikes.

```
How Backup & Restore Works:
───────────────────────────

Normal Operation:
┌──────────┐     backup      ┌──────────────┐
│ Primary  │ ──────────────▶ │  Backup      │
│ Region   │   (scheduled)   │  Storage     │
└──────────┘                 │  (S3/GCS)    │
                             └──────────────┘

During Disaster:
┌──────────┐                 ┌──────────────┐
│ Primary  │  ✗ DOWN         │  Backup      │
│ Region   │                 │  Storage     │
└──────────┘                 └──────┬───────┘
                                    │ restore
                             ┌──────▼───────┐
                             │  Recovery    │
                             │  Region      │
                             └──────────────┘
```

| Attribute | Value |
|-----------|-------|
| **RTO** | Hours to days |
| **RPO** | Hours (depends on backup frequency) |
| **Cost** | Very low (storage only) |
| **Complexity** | Low |
| **Best for** | Non-critical systems, dev/test |

### 2. Pilot Light

A minimal version of your environment is always running in the DR region. Core services (like databases) are replicated, but application servers are stopped.

```
Normal Operation:
┌──────────────────┐          ┌──────────────────┐
│  Primary Region  │          │   DR Region      │
│                  │          │   (Pilot Light)  │
│  ┌─────┐ ┌────┐ │  async   │   ┌─────┐       │
│  │ App │ │ DB │──┼─────────▶│   │ DB  │       │
│  └─────┘ └────┘ │  replic. │   │(rep)│       │
│  ┌─────┐        │          │   └─────┘       │
│  │ Web │        │          │                  │
│  └─────┘        │          │  (servers OFF)   │
└──────────────────┘          └──────────────────┘

During Disaster:
┌──────────────────┐          ┌──────────────────┐
│  Primary Region  │          │   DR Region      │
│  ✗ DOWN          │          │                  │
│                  │          │  ┌─────┐ ┌─────┐│
│                  │          │  │ App │ │ DB  ││
│                  │          │  └─────┘ │(rep)││
│                  │          │  ┌─────┐ └─────┘│
│                  │          │  │ Web │        │
│                  │          │  └─────┘        │
└──────────────────┘          └──────────────────┘
                               (servers started)
```

| Attribute | Value |
|-----------|-------|
| **RTO** | 30 minutes to 2 hours |
| **RPO** | Minutes (async replication) |
| **Cost** | Low-moderate (DB replication + minimal infra) |
| **Complexity** | Medium |
| **Best for** | Business-critical apps with moderate RTO |

### 3. Warm Standby

A scaled-down but fully functional copy of your production environment runs in the DR region. During failover, you scale it up to handle production traffic.

```
Normal Operation:
┌──────────────────┐          ┌──────────────────┐
│  Primary Region  │          │   DR Region      │
│  (Full Scale)    │          │  (Scaled Down)   │
│                  │          │                  │
│  App: 10 servers │  async   │  App: 2 servers  │
│  DB: Multi-AZ   │─────────▶│  DB: Replica     │
│  Cache: 3 nodes  │          │  Cache: 1 node   │
└──────────────────┘          └──────────────────┘

During Disaster:                  SCALE UP!
┌──────────────────┐          ┌──────────────────┐
│  Primary Region  │          │   DR Region      │
│  ✗ DOWN          │          │  (Full Scale)    │
│                  │          │                  │
│                  │          │  App: 10 servers │
│                  │          │  DB: Promoted    │
│                  │          │  Cache: 3 nodes  │
└──────────────────┘          └──────────────────┘
```

| Attribute | Value |
|-----------|-------|
| **RTO** | 10-30 minutes |
| **RPO** | Seconds to minutes |
| **Cost** | Moderate-high (running reduced infrastructure) |
| **Complexity** | High |
| **Best for** | Critical business applications |

### 4. Multi-Site Active-Active

Your application runs simultaneously in multiple regions, each handling a portion of traffic. If one region fails, the others absorb the load.

```
Normal Operation:
        ┌────────────────┐
        │  Global Load   │
        │   Balancer     │
        └───┬────────┬───┘
            │        │
     ┌──────▼──┐  ┌──▼──────┐
     │Region A │  │Region B │
     │ 50%     │  │ 50%     │
     │traffic  │  │traffic  │
     │         │  │         │
     │App + DB │◀▶│App + DB │
     │(primary)│  │(primary)│
     └─────────┘  └─────────┘
       bi-directional sync

During Regional Failure:
        ┌────────────────┐
        │  Global Load   │
        │   Balancer     │
        └───┬────────┬───┘
            │        ✗
     ┌──────▼──┐  ┌────────┐
     │Region A │  │Region B│
     │ 100%    │  │ DOWN   │
     │traffic  │  │        │
     │         │  │        │
     │App + DB │  │        │
     └─────────┘  └────────┘
```

| Attribute | Value |
|-----------|-------|
| **RTO** | Near-zero (seconds) |
| **RPO** | Near-zero |
| **Cost** | Very high (2x+ infrastructure) |
| **Complexity** | Very high |
| **Best for** | Mission-critical, zero-downtime requirements |

### Strategy Selection Guide

```
What is your acceptable downtime?

More than 4 hours?    → Backup & Restore     ($)
1-4 hours?            → Pilot Light          ($$)
10-60 minutes?        → Warm Standby         ($$$)
Near-zero?            → Multi-Site Active    ($$$$)
```

---

## Cloud Backup Services

### AWS Backup

```
AWS Backup Features:
─────────────────────
✓ Centralized backup management
✓ Supports: EC2, EBS, RDS, DynamoDB, EFS, S3
✓ Cross-region and cross-account backup
✓ Backup policies via AWS Organizations
✓ Point-in-time recovery for databases
✓ Vault Lock for immutable backups (ransomware protection)
```

```bash
# Create a backup plan using AWS CLI
aws backup create-backup-plan \
  --backup-plan '{
    "BackupPlanName": "DailyBackupPlan",
    "Rules": [
      {
        "RuleName": "DailyRule",
        "TargetBackupVaultName": "Default",
        "ScheduleExpression": "cron(0 3 * * ? *)",
        "StartWindowMinutes": 60,
        "CompletionWindowMinutes": 180,
        "Lifecycle": {
          "MoveToColdStorageAfterDays": 30,
          "DeleteAfterDays": 365
        },
        "CopyActions": [
          {
            "DestinationBackupVaultArn": "arn:aws:backup:eu-west-1:123456789012:backup-vault:DR-Vault",
            "Lifecycle": {
              "DeleteAfterDays": 365
            }
          }
        ]
      }
    ]
  }'
```

### Azure Backup

```
Azure Backup Features:
──────────────────────
✓ Azure VMs, SQL, Files, Blobs, Disks
✓ Application-consistent snapshots
✓ Geo-redundant storage (GRS)
✓ Soft delete (14-day retention)
✓ Cross-region restore
✓ Backup Center dashboard
```

### GCP Backup and DR

```
GCP Backup Features:
────────────────────
✓ Compute Engine VM backups
✓ Cloud SQL automated backups
✓ Persistent disk snapshots
✓ Cross-region snapshot copies
✓ Backup plans and schedules
✓ Backup vault for immutability
```

---

## Cross-Region Replication

Replicate data across regions for disaster resilience.

### Database Cross-Region Replication

```bash
# AWS RDS: Create a cross-region read replica
aws rds create-db-instance-read-replica \
  --db-instance-identifier mydb-dr-replica \
  --source-db-instance-identifier arn:aws:rds:us-east-1:123456789012:db:mydb-primary \
  --region eu-west-1 \
  --db-instance-class db.r5.large
```

### Storage Cross-Region Replication

```bash
# AWS S3: Enable cross-region replication
aws s3api put-bucket-replication \
  --bucket my-source-bucket \
  --replication-configuration '{
    "Role": "arn:aws:iam::123456789012:role/s3-replication-role",
    "Rules": [
      {
        "ID": "ReplicateAll",
        "Status": "Enabled",
        "Prefix": "",
        "Destination": {
          "Bucket": "arn:aws:s3:::my-dr-bucket",
          "StorageClass": "STANDARD_IA"
        }
      }
    ]
  }'
```

### Replication Comparison

| Type | RPO | Consistency | Cost | Use Case |
|------|-----|-------------|------|----------|
| **Synchronous** | 0 | Strong | High | Financial transactions |
| **Asynchronous** | Seconds-minutes | Eventual | Medium | Most applications |
| **Scheduled** | Hours | Point-in-time | Low | Batch workloads |

---

## Database Backup Strategies

### The 3-2-1 Backup Rule

```
The 3-2-1 Rule:
────────────────
  3 copies of your data
  2 different storage media/types
  1 copy offsite (different region/provider)

Example Implementation:
  Copy 1: Production database (primary region)
  Copy 2: Automated snapshot (same region, different AZ)
  Copy 3: Cross-region replica (DR region)
```

### Database-Specific Strategies

```
Database Backup Methods:
──────────────────────────────────────────────────────────────
Database        Method                  RPO          Notes
──────────────────────────────────────────────────────────────
PostgreSQL      WAL archiving +         Minutes      PITR capable
                pg_basebackup
MySQL           Binary log replication  Seconds      Near-real-time
MongoDB         Continuous backup       Point-in-    Atlas feature
                (oplog)                 time
DynamoDB        PITR + on-demand        Seconds      Automatic
                backups
Redis           RDB snapshots +         Configurable AOF for
                AOF append-only file                 durability
```

### Automated Database Backup Script

```bash
#!/bin/bash
# PostgreSQL backup with rotation and cross-region copy

DB_NAME="production_db"
BACKUP_DIR="/backups"
S3_BUCKET="s3://db-backups-primary"
S3_DR_BUCKET="s3://db-backups-dr"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
echo "Starting backup of $DB_NAME..."
pg_dump -Fc "$DB_NAME" > "$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

# Verify backup integrity
pg_restore --list "$BACKUP_DIR/${DB_NAME}_${DATE}.dump" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "ERROR: Backup verification failed!"
  exit 1
fi

echo "Backup verified successfully."

# Upload to primary region
aws s3 cp "$BACKUP_DIR/${DB_NAME}_${DATE}.dump" \
  "$S3_BUCKET/${DB_NAME}_${DATE}.dump" \
  --storage-class STANDARD_IA

# Copy to DR region
aws s3 cp "$S3_BUCKET/${DB_NAME}_${DATE}.dump" \
  "$S3_DR_BUCKET/${DB_NAME}_${DATE}.dump"

# Clean up old local backups
find "$BACKUP_DIR" -name "*.dump" -mtime +$RETENTION_DAYS -delete

echo "Backup complete: ${DB_NAME}_${DATE}.dump"
```

---

## DR Testing and Runbooks

A DR plan that hasn't been tested is just a hope. Regular testing is essential.

### Types of DR Tests

| Test Type | Description | Frequency | Impact |
|-----------|-------------|-----------|--------|
| **Tabletop** | Walk through the plan verbally | Quarterly | None |
| **Walkthrough** | Simulate steps without executing | Quarterly | None |
| **Simulation** | Simulate a failure, execute partial recovery | Semi-annually | Low |
| **Parallel** | Run recovery alongside production | Annually | Low |
| **Full Cutover** | Actually fail over to DR | Annually | Medium |

### DR Runbook Template

```markdown
# DR Runbook: [Application Name]

## Overview
- Application: Payment Service
- RPO: 15 minutes
- RTO: 30 minutes
- DR Region: eu-west-1

## Pre-requisites
- [ ] VPN access to DR region
- [ ] Database credentials for DR replicas
- [ ] DNS management access
- [ ] Communication channel established

## Detection
1. Alert received from monitoring (PagerDuty/CloudWatch)
2. Confirm outage is not a false alarm
3. Estimate severity and expected duration
4. Decide: wait for recovery OR initiate DR failover

## Decision Criteria for Failover
Initiate DR if ANY of the following:
- Primary region confirmed down for > 15 minutes
- Cloud provider reports extended outage (no ETA)
- Data corruption detected in primary

## Failover Steps

### Step 1: Notify Stakeholders (2 min)
- Post in #incident-response Slack channel
- Notify on-call engineering manager
- Start incident timeline document

### Step 2: Promote DR Database (5 min)
- Promote read replica to primary
- Verify data consistency
- Update connection strings

### Step 3: Scale DR Application (10 min)
- Scale application servers to production capacity
- Verify health checks pass
- Run smoke tests

### Step 4: Update DNS (5 min)
- Switch DNS to DR region endpoints
- Verify DNS propagation
- Test end-to-end user flow

### Step 5: Verify (5 min)
- Confirm all services healthy
- Monitor error rates
- Confirm customer-facing functionality

## Failback Steps (After Primary Recovers)
1. Verify primary region is stable
2. Resync data from DR to primary
3. Run validation queries
4. Gradually shift traffic back
5. Scale down DR resources

## Contacts
| Role              | Name         | Phone        |
|-------------------|-------------|--------------|
| Incident Lead     | Jane Smith  | 555-0101     |
| Database DBA      | Bob Chen    | 555-0102     |
| Platform Engineer | Sarah Park  | 555-0103     |
| VP Engineering    | Mike Johnson| 555-0104     |
```

---

## DR Automation with IaC

Automate your DR environment using Infrastructure as Code.

### Terraform DR Module

```hcl
# modules/dr-environment/main.tf

variable "enable_dr" {
  description = "Enable disaster recovery resources"
  type        = bool
  default     = true
}

variable "dr_region" {
  description = "DR region"
  type        = string
  default     = "eu-west-1"
}

# DR provider
provider "aws" {
  alias  = "dr"
  region = var.dr_region
}

# Cross-region DB replica
resource "aws_db_instance" "dr_replica" {
  count    = var.enable_dr ? 1 : 0
  provider = aws.dr

  replicate_source_db = var.primary_db_arn
  instance_class      = var.dr_instance_class
  storage_encrypted   = true

  tags = {
    Environment = "dr"
    ManagedBy   = "terraform"
  }
}

# DR application (scaled down)
resource "aws_autoscaling_group" "dr_app" {
  count    = var.enable_dr ? 1 : 0
  provider = aws.dr

  min_size         = var.dr_min_instances  # e.g., 1
  max_size         = var.prod_max_instances # scale up when needed
  desired_capacity = var.dr_min_instances

  launch_template {
    id      = aws_launch_template.app[0].id
    version = "$Latest"
  }

  tag {
    key                 = "Environment"
    value               = "dr"
    propagate_at_launch = true
  }
}

# Failover script to scale up
resource "null_resource" "failover_script" {
  count = var.enable_dr ? 1 : 0

  provisioner "local-exec" {
    command = <<-EOT
      cat > failover.sh << 'EOF'
      #!/bin/bash
      # Scale up DR environment
      aws autoscaling update-auto-scaling-group \
        --auto-scaling-group-name ${aws_autoscaling_group.dr_app[0].name} \
        --desired-capacity ${var.prod_desired_instances} \
        --region ${var.dr_region}

      # Promote DB replica
      aws rds promote-read-replica \
        --db-instance-identifier ${aws_db_instance.dr_replica[0].id} \
        --region ${var.dr_region}

      echo "Failover initiated. Monitor progress in AWS Console."
      EOF
      chmod +x failover.sh
    EOT
  }
}
```

---

## Business Continuity Planning

DR is part of a broader **Business Continuity Plan (BCP)**.

```
Business Continuity Plan Components:
─────────────────────────────────────

┌─────────────────────────────────────────────┐
│          Business Continuity Plan           │
│                                             │
│  ┌──────────────┐  ┌──────────────────┐     │
│  │  Risk        │  │  Business Impact │     │
│  │  Assessment  │  │  Analysis (BIA)  │     │
│  └──────┬───────┘  └────────┬─────────┘     │
│         │                   │               │
│         ▼                   ▼               │
│  ┌──────────────────────────────────┐       │
│  │     Recovery Strategies          │       │
│  │  ┌─────┐ ┌─────┐ ┌───────────┐  │       │
│  │  │ DR  │ │ HA  │ │ Backup &  │  │       │
│  │  │Plan │ │Plan │ │ Restore   │  │       │
│  │  └─────┘ └─────┘ └───────────┘  │       │
│  └──────────────────────────────────┘       │
│                   │                         │
│                   ▼                         │
│  ┌──────────────────────────────────┐       │
│  │  Testing, Training, Maintenance  │       │
│  └──────────────────────────────────┘       │
└─────────────────────────────────────────────┘
```

### Business Impact Analysis (BIA)

| Application | Business Impact | RPO | RTO | DR Strategy |
|-------------|----------------|-----|-----|-------------|
| Payment Gateway | Revenue loss: $50K/hr | 0 | < 1 min | Multi-site active-active |
| Customer Portal | User experience impact | 15 min | 30 min | Warm standby |
| Internal Wiki | Low productivity impact | 24 hrs | 8 hrs | Backup & restore |
| Analytics Dashboard | Delayed reporting | 1 hr | 4 hrs | Pilot light |
| Dev Environment | No business impact | 24 hrs | 24 hrs | Backup & restore |

---

## Real-World DR Scenarios

### Scenario 1: Region Outage

```
Problem:  AWS us-east-1 is experiencing a major outage
Impact:   All services in the region are unreachable
RPO:      5 minutes (async replication lag)
RTO Goal: 30 minutes

Response:
1. [T+0 min]  Monitoring alert fires
2. [T+2 min]  On-call engineer confirms regional outage
3. [T+5 min]  Decision: initiate DR failover
4. [T+7 min]  Promote DR database replica in eu-west-1
5. [T+15 min] Scale up application servers
6. [T+20 min] Update DNS to point to DR region
7. [T+25 min] Smoke tests pass
8. [T+28 min] Traffic flowing through DR region ✓
```

### Scenario 2: Ransomware Attack

```
Problem:  Ransomware encrypted production databases
Impact:   All data inaccessible
RPO:      0 (immutable backups from 6 hours ago available)
RTO Goal: 4 hours

Response:
1. [T+0 min]   Alert: database connection failures
2. [T+10 min]  Confirm ransomware — isolate affected systems
3. [T+30 min]  Activate incident response team
4. [T+45 min]  Identify last clean backup (immutable vault)
5. [T+1 hr]    Begin restore to clean environment
6. [T+2.5 hr]  Databases restored from immutable backup
7. [T+3 hr]    Application servers rebuilt from IaC
8. [T+3.5 hr]  Security sweep of restored environment
9. [T+4 hr]    Services restored with clean data ✓

Key: Immutable backups (Vault Lock) prevented
     the ransomware from encrypting backups too!
```

### Scenario 3: Accidental Data Deletion

```
Problem:  Engineer ran DELETE without WHERE clause
Impact:   Customer orders table wiped
RPO:      Point-in-time (continuous backups)
RTO Goal: 15 minutes

Response:
1. [T+0 min]  Alert: zero rows in orders table
2. [T+2 min]  Identify the accidental DELETE query
3. [T+3 min]  Initiate point-in-time recovery (PITR)
4. [T+5 min]  Restore to 1 minute before the DELETE
5. [T+12 min] Verify data integrity
6. [T+15 min] Application reconnected ✓

Prevention:
- Require WHERE clause in production DELETE/UPDATE
- Use database audit logging
- Restrict production access with MFA
```

---

## DR Cost vs Recovery Time Tradeoff

```
Annual DR Cost vs Recovery Time:
────────────────────────────────────────────────

Strategy            Annual Cost    RTO        RPO
──────────────────────────────────────────────────
Backup & Restore    $1,000-5K     Hours-Days  Hours
Pilot Light         $5K-20K       30min-2hr   Minutes
Warm Standby        $20K-100K     10-30min    Seconds
Active-Active       $100K-500K+   ~Zero       ~Zero

The right choice depends on the COST OF DOWNTIME.

If downtime costs $10,000/hour → invest in warm standby
If downtime costs $1,000,000/hour → active-active is cheap
```

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| **RPO** | Maximum acceptable data loss — drives backup frequency |
| **RTO** | Maximum acceptable downtime — drives DR strategy choice |
| **Backup & Restore** | Cheapest, slowest; good for non-critical systems |
| **Pilot Light** | Core replicated, compute off; moderate cost and recovery |
| **Warm Standby** | Scaled-down copy running; fast failover |
| **Active-Active** | Full redundancy; near-zero downtime, highest cost |
| **3-2-1 Rule** | 3 copies, 2 media types, 1 offsite |
| **Immutable Backups** | Critical defense against ransomware |
| **DR Testing** | Untested plans are unreliable — test at least annually |
| **IaC for DR** | Automate DR environment provisioning for consistency |

---

## Exercises

1. **RPO/RTO Analysis:** A company has these applications: (a) e-commerce checkout, (b) employee blog, (c) fraud detection system, (d) marketing website. Assign appropriate RPO and RTO values to each and justify your choices.

2. **DR Strategy Design:** You manage a SaaS platform with 99.9% SLA. The primary region is `us-east-1`. Design a DR strategy specifying: DR region, replication method, failover process, estimated cost, and testing schedule.

3. **Backup Script:** Write a backup script for a MongoDB database that: takes a mongodump, compresses it, uploads to cloud storage, copies to a DR region, sends a notification on success/failure, and cleans up backups older than 30 days.

4. **DR Runbook:** Create a complete DR runbook for a three-tier web application (load balancer → app servers → database). Include detection, decision criteria, step-by-step failover, validation, and failback procedures.

5. **Cost-Benefit Analysis:** Your application generates $500K/day in revenue. Calculate the annual cost of downtime at different SLA levels (99%, 99.9%, 99.99%). Then determine which DR strategy is cost-justified for each level.
