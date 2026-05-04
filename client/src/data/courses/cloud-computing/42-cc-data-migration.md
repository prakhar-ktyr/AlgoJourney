---
title: "Cloud Data Migration"
---

# Cloud Data Migration

Migrating data and applications to the cloud is one of the most critical — and complex — tasks in a cloud journey. In this lesson, you'll learn the major migration strategies, planning frameworks, cloud-native tools, and best practices for executing a successful cloud migration.

---

## Why Migrate to the Cloud?

Organizations move to the cloud for a variety of reasons:

| Driver                | Explanation                                                |
|-----------------------|------------------------------------------------------------|
| Cost optimization     | Replace CapEx (hardware) with OpEx (pay-as-you-go)         |
| Scalability           | Scale up/down based on demand without over-provisioning    |
| Agility               | Deploy new services in minutes instead of months           |
| Global reach          | Serve users worldwide from edge locations                  |
| Innovation            | Access AI/ML, IoT, serverless, and managed services        |
| Disaster recovery     | Built-in redundancy across multiple regions                |
| Security              | Leverage cloud provider security investments               |
| End of life hardware  | Aging data centers with increasing maintenance costs       |

---

## The 7 R's of Migration

AWS originally proposed the "6 R's," later expanded to 7. These strategies form a framework for deciding how to move each workload.

### Overview Table

| Strategy      | Description                         | Effort | Risk  | Benefit              |
|---------------|-------------------------------------|--------|-------|----------------------|
| **Rehost**    | Lift and shift                      | Low    | Low   | Quick migration      |
| **Replatform**| Lift, tinker, and shift             | Medium | Low   | Some optimization    |
| **Repurchase**| Move to a different product (SaaS)  | Medium | Medium| Modern solution      |
| **Refactor**  | Re-architect for cloud-native       | High   | High  | Maximum benefit      |
| **Retire**    | Decommission                        | Low    | Low   | Cost reduction       |
| **Retain**    | Keep on-premises (for now)          | None   | None  | Defer complexity     |
| **Relocate**  | Move to another cloud or region     | Low    | Low   | Infrastructure shift |

### 1. Rehost (Lift and Shift)

Move applications as-is to cloud infrastructure with minimal changes.

```
On-Premises                          Cloud (IaaS)
┌──────────────┐                     ┌──────────────┐
│  Web Server  │  ──── move ────→    │   EC2 / VM   │
│  (Apache)    │                     │  (Apache)    │
├──────────────┤                     ├──────────────┤
│  App Server  │  ──── move ────→    │   EC2 / VM   │
│  (Tomcat)    │                     │  (Tomcat)    │
├──────────────┤                     ├──────────────┤
│  Database    │  ──── move ────→    │   EC2 / VM   │
│  (MySQL)     │                     │  (MySQL)     │
└──────────────┘                     └──────────────┘
```

**When to use:** Large legacy portfolios, tight timelines, limited cloud expertise.

**Example:** A company migrates 200 VMs from VMware to AWS EC2 using AWS Application Migration Service.

### 2. Replatform (Lift, Tinker, and Shift)

Make a few cloud optimizations without changing the core architecture.

```
On-Premises                          Cloud (Optimized)
┌──────────────┐                     ┌──────────────┐
│  Web Server  │  ──── move ────→    │  App Service  │  ← Managed platform
├──────────────┤                     ├──────────────┤
│  Database    │  ──── move ────→    │  RDS / Cloud  │  ← Managed database
│  (self-mgd)  │                     │  SQL          │
└──────────────┘                     └──────────────┘
```

**When to use:** Quick wins available (managed DB, managed containers) without a full rewrite.

**Example:** Move a self-managed MySQL database to Amazon RDS — same schema, but AWS handles backups, patching, and failover.

### 3. Repurchase (Drop and Shop)

Replace an existing application with a cloud-native SaaS solution.

| On-Premises Solution         | SaaS Replacement            |
|------------------------------|-----------------------------|
| Self-hosted email (Exchange) | Microsoft 365 / Gmail       |
| Custom CRM                   | Salesforce                  |
| Self-hosted HR system        | Workday                     |
| On-prem ERP                  | SAP S/4HANA Cloud           |
| Custom helpdesk              | Zendesk / Freshdesk         |

**When to use:** The custom solution is expensive to maintain and a mature SaaS alternative exists.

### 4. Refactor (Re-architect)

Redesign the application to be cloud-native, taking full advantage of cloud services.

```
Monolith                             Cloud-Native
┌──────────────┐                     ┌─────────┐ ┌─────────┐
│              │                     │ Auth µ  │ │ Order µ │
│  Monolithic  │                     │ Service │ │ Service │
│  Application │  ──  rethink  ──→   └────┬────┘ └────┬────┘
│              │                          │           │
│              │                     ┌────┴───────────┴────┐
└──────┬───────┘                     │   API Gateway       │
       │                             ├─────────────────────┤
┌──────┴───────┐                     │ Lambda / Functions   │
│  Single DB   │                     ├──────┬──────────────┤
└──────────────┘                     │ DynamoDB│ S3  │ SQS │
                                     └────────┴─────┴─────┘
```

**When to use:** Applications that need to scale massively, adopt microservices, or leverage serverless.

### 5. Retire

Identify and decommission applications that are no longer needed.

**Typical candidates:**
- Redundant applications doing the same thing
- Applications with zero or very few active users
- Legacy systems replaced by newer solutions
- Test/dev environments that were never cleaned up

> **Tip:** Organizations often discover 10–20% of their portfolio can be retired during a migration assessment.

### 6. Retain

Keep the application on-premises, at least for now.

**Reasons to retain:**
- Compliance or regulatory requirements
- Recent on-prem hardware investment
- Deep dependency on legacy protocols
- Not ready to migrate (too complex, too risky)
- Planned for retirement within 1–2 years anyway

### 7. Relocate

Move infrastructure to a different cloud environment without modification (e.g., VMware Cloud on AWS).

**When to use:** Exiting a data center quickly, moving between cloud providers, or shifting to a cloud-adjacent environment.

---

## Migration Planning Framework

A structured migration follows these phases:

```
┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
│  Assess    │──→│  Discover  │──→│   Plan     │──→│  Execute   │──→│  Validate  │
│            │   │            │   │            │   │            │   │ & Optimize │
└────────────┘   └────────────┘   └────────────┘   └────────────┘   └────────────┘
```

### Phase 1: Assess

Evaluate the current environment and business goals.

**Key activities:**
- Identify business drivers and success criteria
- Assess organizational readiness (skills, processes, culture)
- Estimate total cost of ownership (TCO) comparison
- Define compliance and security requirements
- Build the business case for stakeholders

```
TCO Comparison Worksheet:
─────────────────────────────────────────────────
Category            On-Prem (3yr)    Cloud (3yr)
─────────────────────────────────────────────────
Hardware            $500,000         $0
Software licenses   $200,000         $50,000
Data center costs   $300,000         $0
Staff (ops)         $600,000         $200,000
Cloud services      $0               $400,000
Migration (1-time)  $0               $150,000
─────────────────────────────────────────────────
TOTAL               $1,600,000       $800,000
Savings                              $800,000 (50%)
```

### Phase 2: Discover

Build a complete inventory of your current environment.

**What to discover:**
- Servers and VMs (OS, CPU, RAM, storage, utilization)
- Applications and their dependencies
- Databases (engine, size, connections, dependencies)
- Network topology and firewall rules
- Data flows between systems
- Peak usage patterns and performance baselines

```bash
# Example: AWS Application Discovery Agent collects data
# Install on each server to collect configuration and usage
sudo yum install -y aws-discovery-agent
sudo systemctl start aws-discovery-agent
```

### Phase 3: Plan

Design the target architecture and create a detailed migration plan.

**Key deliverables:**
- Migration strategy per application (which R?)
- Target architecture diagrams
- Migration wave plan (grouping related apps)
- Risk register and mitigation plan
- Runbook for each migration wave
- Rollback procedures

#### Migration Wave Planning

Group related applications into waves:

```
Wave 1 (Pilot):     Simple, low-risk apps
                    ├── Static website → S3 + CloudFront
                    └── Dev/test servers → EC2

Wave 2 (Foundation): Core infrastructure
                    ├── Active Directory → AWS Managed AD
                    ├── DNS → Route 53
                    └── Monitoring → CloudWatch

Wave 3 (Apps):      Business applications
                    ├── CRM → Replatform to ECS
                    ├── Inventory → Rehost to EC2
                    └── Analytics → Refactor to Redshift

Wave 4 (Data):      Databases and storage
                    ├── Oracle DB → RDS PostgreSQL
                    ├── File shares → EFS / S3
                    └── Data warehouse → Redshift
```

### Phase 4: Execute

Perform the actual migration.

**Steps:**
1. Set up the landing zone (VPC, IAM, networking)
2. Configure connectivity (VPN, Direct Connect)
3. Migrate data (initial sync)
4. Migrate applications
5. Perform delta sync (catch changes since initial)
6. Execute cutover
7. Verify functionality

### Phase 5: Validate and Optimize

Confirm everything works and optimize for cost and performance.

**Validation checklist:**
- [ ] All application functions work correctly
- [ ] Performance meets or exceeds baselines
- [ ] Data integrity verified (row counts, checksums)
- [ ] Security controls in place (encryption, access, logging)
- [ ] Monitoring and alerting configured
- [ ] Backup and DR procedures tested
- [ ] Documentation updated
- [ ] Old environment decommissioned (after bake period)

---

## Cloud Migration Tools

### AWS Migration Tools

| Tool                          | Purpose                                  |
|-------------------------------|------------------------------------------|
| AWS Migration Hub             | Central tracking for all migrations      |
| Application Migration Service | Server replication (lift and shift)       |
| Database Migration Service    | Database migration with schema conversion|
| DataSync                      | Data transfer to/from AWS                |
| Snow Family                   | Physical data transfer devices           |
| Transfer Family               | SFTP/FTP to S3                           |

### Azure Migration Tools

| Tool                     | Purpose                                  |
|--------------------------|------------------------------------------|
| Azure Migrate            | Discovery, assessment, migration hub     |
| Azure Site Recovery      | Server replication and DR                |
| Azure Database Migration | Database migration service               |
| Azure Data Box           | Physical data transfer devices           |
| Azure File Sync          | File server migration to Azure Files     |

### GCP Migration Tools

| Tool                     | Purpose                                  |
|--------------------------|------------------------------------------|
| Migration Center         | Discovery and assessment                 |
| Migrate to VMs           | VM migration to Compute Engine           |
| Database Migration Service| Database migration                      |
| Transfer Appliance       | Physical data transfer                   |
| Storage Transfer Service | Online data transfer to Cloud Storage    |

---

## Database Migration

Database migration is often the most complex and risky part of a cloud migration.

### Migration Approaches

```
┌─────────────────────────────────────────────────────┐
│                Database Migration                    │
├──────────────────┬──────────────────────────────────┤
│  Homogeneous     │  Heterogeneous                   │
│  (same engine)   │  (different engine)              │
│                  │                                  │
│  MySQL → RDS     │  Oracle → PostgreSQL             │
│  PostgreSQL →    │  SQL Server → Aurora             │
│  Cloud SQL       │  MongoDB → DynamoDB              │
│                  │                                  │
│  Simpler:        │  Complex:                        │
│  - Dump/restore  │  - Schema conversion             │
│  - Replication   │  - Data type mapping             │
│                  │  - Query rewriting               │
│                  │  - Application changes           │
└──────────────────┴──────────────────────────────────┘
```

### AWS Database Migration Service (DMS)

```bash
# Create a replication instance
aws dms create-replication-instance \
  --replication-instance-identifier my-dms \
  --replication-instance-class dms.r5.large \
  --allocated-storage 100

# Create source endpoint (on-premises MySQL)
aws dms create-endpoint \
  --endpoint-identifier source-mysql \
  --endpoint-type source \
  --engine-name mysql \
  --server-name 10.0.1.50 \
  --port 3306 \
  --username admin \
  --password "$DB_SOURCE_PASSWORD"

# Create target endpoint (RDS PostgreSQL)
aws dms create-endpoint \
  --endpoint-identifier target-postgres \
  --endpoint-type target \
  --engine-name postgres \
  --server-name mydb.xxxxx.rds.amazonaws.com \
  --port 5432 \
  --username admin \
  --password "$DB_TARGET_PASSWORD"
```

### Schema Conversion

When migrating between different database engines, you need to convert the schema.

```sql
-- Oracle source
CREATE TABLE employees (
  emp_id    NUMBER(10)    PRIMARY KEY,
  name      VARCHAR2(100) NOT NULL,
  hire_date DATE          DEFAULT SYSDATE,
  salary    NUMBER(10,2),
  dept_id   NUMBER(10)    REFERENCES departments(dept_id)
);

-- PostgreSQL target (after conversion)
CREATE TABLE employees (
  emp_id    INTEGER       PRIMARY KEY,
  name      VARCHAR(100)  NOT NULL,
  hire_date DATE          DEFAULT CURRENT_DATE,
  salary    NUMERIC(10,2),
  dept_id   INTEGER       REFERENCES departments(dept_id)
);
```

### Common Data Type Mappings

| Oracle          | PostgreSQL       | MySQL            | SQL Server       |
|-----------------|------------------|------------------|------------------|
| NUMBER(10)      | INTEGER          | INT              | INT              |
| NUMBER(10,2)    | NUMERIC(10,2)    | DECIMAL(10,2)    | DECIMAL(10,2)    |
| VARCHAR2(100)   | VARCHAR(100)     | VARCHAR(100)     | NVARCHAR(100)    |
| CLOB            | TEXT             | LONGTEXT         | NVARCHAR(MAX)    |
| BLOB            | BYTEA            | LONGBLOB         | VARBINARY(MAX)   |
| DATE            | TIMESTAMP        | DATETIME         | DATETIME2        |
| SYSDATE         | CURRENT_TIMESTAMP| NOW()            | GETDATE()        |

---

## Physical Data Transfer

For very large datasets (terabytes to petabytes), transferring over the network is impractical. Physical transfer devices solve this.

### AWS Snow Family

| Device          | Capacity     | Use Case                          |
|-----------------|--------------|-----------------------------------|
| Snowcone        | 8 TB / 14 TB | Edge computing, small transfers   |
| Snowball Edge   | 80 TB        | Medium data center migrations     |
| Snowmobile      | 100 PB       | Exabyte-scale data center moves   |

```
Transfer time comparison for 100 TB:
─────────────────────────────────────────────
Connection         Speed       Transfer Time
─────────────────────────────────────────────
100 Mbps           ~12.5 MB/s  ~93 days
1 Gbps             ~125 MB/s   ~9 days
10 Gbps            ~1.25 GB/s  ~1 day
Snowball Edge      Ship + load  ~1 week
─────────────────────────────────────────────
```

### Azure Data Box

| Device           | Capacity    | Use Case                          |
|------------------|-------------|-----------------------------------|
| Data Box Disk    | 8 TB × 5    | Small to medium transfers         |
| Data Box         | 100 TB      | Medium data center migrations     |
| Data Box Heavy   | 1 PB        | Large-scale migrations            |

---

## Cutover Strategies

The cutover is the critical moment when you switch from the old system to the new one.

### 1. Big Bang Cutover

Switch everything at once during a maintenance window.

```
Timeline:
  Friday 10 PM:  Freeze source systems
  Friday 11 PM:  Final data sync
  Saturday 2 AM: Switch DNS / load balancer to cloud
  Saturday 3 AM: Smoke testing
  Saturday 6 AM: Declare success or rollback
  Sunday:        Monitor and support
  Monday:        Business resumes on cloud
```

**Pros:** Clean cut, no parallel running costs.

**Cons:** High risk, requires maintenance window, all-or-nothing.

### 2. Phased / Rolling Cutover

Migrate users or features in stages.

```
Week 1:  Migrate 10% of users (canary group)
Week 2:  Migrate 25% of users
Week 3:  Migrate 50% of users
Week 4:  Migrate remaining 100%
```

**Pros:** Lower risk, issues affect fewer users, can pause and fix.

**Cons:** Longer duration, more complex, may need both systems running.

### 3. Blue-Green Cutover

Run both environments simultaneously, switch traffic via DNS or load balancer.

```
                    ┌──────────────┐
                    │ Load Balancer│
                    │   / DNS      │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
     ┌────────┴────────┐      ┌────────┴────────┐
     │   Blue (Old)    │      │  Green (New)    │
     │   On-Premises   │      │  Cloud          │
     │   100% traffic  │      │  0% traffic     │
     └─────────────────┘      └─────────────────┘

     After cutover:
     Blue: 0% traffic          Green: 100% traffic
```

**Pros:** Instant rollback (switch back to blue), no downtime.

**Cons:** Expensive (double infrastructure), data sync complexity.

---

## Post-Migration Optimization

After migration, optimize your cloud environment:

### 1. Right-Sizing

```bash
# AWS: Check instance utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --start-time 2026-04-01T00:00:00Z \
  --end-time 2026-05-01T00:00:00Z \
  --period 86400 \
  --statistics Average
```

| CPU Avg  | Action                                    |
|----------|-------------------------------------------|
| < 10%    | Downsize by 2 levels (e.g., xlarge → small)|
| 10–40%   | Downsize by 1 level                        |
| 40–70%   | Properly sized                             |
| > 70%    | Consider upsizing or auto-scaling          |

### 2. Cost Optimization

- **Reserved Instances / Savings Plans** — commit for 1–3 years for 30–72% savings
- **Spot Instances** — use for fault-tolerant workloads at 60–90% discount
- **Auto-scaling** — scale down during off-peak hours
- **Storage tiering** — move cold data to cheaper storage classes
- **Delete unused resources** — orphaned EBS volumes, old snapshots, idle load balancers

### 3. Modernization Roadmap

```
Post-Migration Modernization Path:
──────────────────────────────────────────────────────────
Phase 1 (Month 1-3):   Stabilize and optimize
  → Right-size instances
  → Implement auto-scaling
  → Set up monitoring and alerting

Phase 2 (Month 3-6):   Adopt managed services
  → Move to managed databases (RDS, Cloud SQL)
  → Use managed Kubernetes (EKS, AKS, GKE)
  → Implement CI/CD pipelines

Phase 3 (Month 6-12):  Cloud-native transformation
  → Decompose monoliths into microservices
  → Adopt serverless where appropriate
  → Implement event-driven architectures
```

---

## Exercises

### Exercise 1: Strategy Selection

For each application, choose the most appropriate migration strategy (from the 7 R's) and justify your choice:

1. A 15-year-old COBOL payroll system with 2 active users
2. A Java web app running on Tomcat with a MySQL database
3. A custom-built helpdesk system that nobody likes
4. A real-time trading platform requiring sub-millisecond latency
5. A WordPress blog running on a dedicated server

**Answers:**

1. **Retire** — Only 2 users, likely replaceable by a modern SaaS payroll service.
2. **Replatform** — Move Tomcat to a managed container service and MySQL to RDS.
3. **Repurchase** — Replace with Zendesk or Freshdesk SaaS.
4. **Retain** — Sub-millisecond latency requirements may not be met in the cloud; assess carefully.
5. **Rehost** — Lift and shift to a VM; or **Repurchase** → managed WordPress hosting.

### Exercise 2: Migration Wave Design

Given these applications with dependencies, design a 4-wave migration plan:

- **App A:** Web frontend (depends on B, C)
- **App B:** API backend (depends on D)
- **App C:** Authentication service (depends on D)
- **App D:** PostgreSQL database (no dependencies)
- **App E:** Static marketing site (no dependencies)
- **App F:** Monitoring dashboard (depends on all)

### Exercise 3: Estimate Data Transfer Time

Calculate how long it would take to transfer a 50 TB database:
- Over a 1 Gbps dedicated connection
- Over a 10 Gbps connection
- Using AWS Snowball Edge (including 5 days shipping)

---

## Key Takeaways

- **The 7 R's provide a decision framework** — not every application should be refactored; some should be rehosted, retired, or retained.
- **Migration is a project, not a task** — it requires careful assessment, discovery, planning, execution, and validation phases.
- **Start with a pilot** — migrate low-risk applications first to build confidence and refine processes.
- **Database migration is the hardest part** — plan extra time for schema conversion, data validation, and application testing.
- **Physical transfer devices exist for a reason** — don't try to move petabytes over the network.
- **Cutover strategy depends on risk tolerance** — big-bang is faster but riskier; phased and blue-green are safer but more complex.
- **Migration is not the end** — post-migration optimization (right-sizing, reserved instances, modernization) is where the real cloud benefits emerge.
- **Always have a rollback plan** — no matter how confident you are, things can go wrong during cutover.

---

## Further Reading

- AWS Migration Hub documentation
- Azure Migration Guide
- Google Cloud Migration Center
- AWS Well-Architected Framework — Migration Lens
- "Cloud Migration: A Practical Guide" by Prasad Rao
