---
title: Cloud vs Traditional IT
---

## Cloud vs Traditional IT

Choosing between cloud computing and traditional on-premises IT is one of the most important technology decisions an organization can make. This lesson provides a **detailed, side-by-side comparison** to help you understand the differences and make informed decisions.

---

## Infrastructure Ownership

The most fundamental difference between cloud and traditional IT is **who owns and operates the infrastructure**.

```
Traditional IT — You Own Everything:

┌─────────────────────────────────────────────────┐
│  YOUR DATA CENTER                                │
│                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Server  │ │ Server  │ │ Server  │  YOUR      │
│  │ Rack 1  │ │ Rack 2  │ │ Rack 3  │  hardware  │
│  └─────────┘ └─────────┘ └─────────┘           │
│                                                  │
│  ┌─────────┐ ┌─────────┐                        │
│  │ Network │ │ Storage │  YOUR                   │
│  │ Switches│ │ Arrays  │  networking & storage   │
│  └─────────┘ └─────────┘                        │
│                                                  │
│  Power, cooling, physical security — YOUR cost   │
└─────────────────────────────────────────────────┘


Cloud — Provider Owns It, You Rent It:

┌─────────────────────────────────────────────────┐
│  PROVIDER'S DATA CENTER (you never see this)     │
│                                                  │
│  Your resources are somewhere in here:           │
│  ┌──────────────────────────────────────────┐   │
│  │  ┌─────┐ ┌─────┐                        │   │
│  │  │Your │ │Your │  Virtual resources      │   │
│  │  │ VM  │ │ DB  │  allocated on demand    │   │
│  │  └─────┘ └─────┘                        │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Power, cooling, security — PROVIDER'S cost      │
└─────────────────────────────────────────────────┘
```

### Ownership Comparison

| Aspect | Traditional IT | Cloud |
|--------|---------------|-------|
| **Servers** | You purchase and own | Provider owns; you rent capacity |
| **Storage** | You buy SANs, NAS, drives | Provider manages; you pay per GB |
| **Networking** | You buy routers, switches, cables | Software-defined, provider-managed |
| **Physical space** | Your data center or server room | Provider's data centers |
| **Power & cooling** | Your electricity bill | Included in cloud pricing |
| **Physical security** | Your guards, cameras, locks | Provider's responsibility |
| **Depreciation** | Assets depreciate (3-5 years) | No assets to depreciate |

---

## Capital vs Operational Expenses

### Detailed Cost Breakdown

```
Traditional IT — Cost Structure:

Year 0 (Initial):
┌──────────────────────────────────────────────┐
│ Servers (5x):                      $50,000   │
│ Storage system:                    $30,000   │
│ Network equipment:                 $15,000   │
│ Software licenses:                 $25,000   │
│ Data center build-out:             $40,000   │
│ Installation & configuration:      $20,000   │
│ ─────────────────────────────────────────     │
│ TOTAL INITIAL:                    $180,000   │
└──────────────────────────────────────────────┘

Years 1-5 (Annual Operating):
┌──────────────────────────────────────────────┐
│ IT staff (2 FTEs):                $200,000   │
│ Maintenance contracts:             $15,000   │
│ Power & cooling:                   $12,000   │
│ Software renewals:                 $10,000   │
│ Internet connectivity:              $6,000   │
│ Insurance:                          $3,000   │
│ ─────────────────────────────────────────     │
│ ANNUAL OPERATING:                 $246,000   │
└──────────────────────────────────────────────┘

5-Year Total: $180,000 + (5 × $246,000) = $1,410,000


Cloud — Cost Structure:

Year 0 (Initial):
┌──────────────────────────────────────────────┐
│ Migration planning & execution:    $30,000   │
│ Training:                          $10,000   │
│ ─────────────────────────────────────────     │
│ TOTAL INITIAL:                     $40,000   │
└──────────────────────────────────────────────┘

Years 1-5 (Annual Operating):
┌──────────────────────────────────────────────┐
│ Cloud services (compute, storage): $96,000   │
│ IT staff (1.5 FTEs — less ops):   $175,000   │
│ Internet connectivity:              $6,000   │
│ ─────────────────────────────────────────     │
│ ANNUAL OPERATING:                 $277,000   │
└──────────────────────────────────────────────┘

5-Year Total: $40,000 + (5 × $277,000) = $1,425,000
```

> **Notice:** The 5-year totals can be similar! The difference is in **when** you pay. Cloud has lower upfront cost, while traditional IT frontloads the investment.

---

## Scalability: Vertical vs Horizontal

### Traditional Scaling

```
Traditional IT — Scaling is Painful:

Current State:            Need More Capacity:
┌───────────────┐         ┌───────────────┐
│   Server      │    1.   │  Submit       │
│   (maxed out) │  ──►    │  purchase     │
│   100% CPU    │         │  request      │
└───────────────┘         └───────┬───────┘
                                  │  2-4 weeks
                          ┌───────▼───────┐
                          │  Receive &    │
                          │  install new  │
                          │  hardware     │
                          └───────┬───────┘
                                  │  1-2 weeks
                          ┌───────▼───────┐
                          │  Configure &  │
                          │  deploy       │
                          └───────┬───────┘
                                  │  1 week
                          ┌───────▼───────┐
                          │  NEW CAPACITY │
                          │  (finally!)   │
                          └───────────────┘

Total time: 4-7 weeks
What if demand drops? You still own the hardware.
```

### Cloud Scaling

```
Cloud — Scaling is Instant:

Auto-scaling example:

Normal Load (2 AM):        Peak Load (Black Friday):
┌────┐ ┌────┐              ┌────┐ ┌────┐ ┌────┐ ┌────┐
│ VM │ │ VM │              │ VM │ │ VM │ │ VM │ │ VM │
└────┘ └────┘              └────┘ └────┘ └────┘ └────┘
2 instances                ┌────┐ ┌────┐ ┌────┐ ┌────┐
$0.20/hour                 │ VM │ │ VM │ │ VM │ │ VM │
                           └────┘ └────┘ └────┘ └────┘
                           8 instances (auto-scaled)
                           $0.80/hour

After Peak (next day):
┌────┐ ┌────┐
│ VM │ │ VM │
└────┘ └────┘
Back to 2 instances
$0.20/hour
```

### Scaling Comparison

| Factor | Traditional IT | Cloud |
|--------|---------------|-------|
| **Scale up time** | Weeks to months | Minutes |
| **Scale down** | Sell/repurpose hardware (if possible) | Click a button or auto-scale |
| **Maximum scale** | Limited by budget and space | Virtually unlimited |
| **Cost of over-provisioning** | Pay for idle hardware forever | Pay only when running |
| **Auto-scaling** | Manual process | Automatic, policy-based |
| **Global scaling** | Build new data centers (months/years) | Deploy to new regions (hours) |

---

## Deployment Speed

### Feature Deployment Comparison

```
Traditional IT — Deploying a New Feature:

Week 1  │ Week 2  │ Week 3  │ Week 4  │ Week 5  │ Week 6
────────┼─────────┼─────────┼─────────┼─────────┼────────
Request │ Procure │ Install │Configure│ Test    │ Deploy
infra   │hardware │& rack   │services │in staging│to prod
────────┴─────────┴─────────┴─────────┴─────────┴────────


Cloud — Deploying a New Feature:

Day 1           │ Day 2          │ Day 3
────────────────┼────────────────┼────────────────
Provision infra │ Test in staging│ Deploy to prod
(via code, mins)│                │
────────────────┴────────────────┴────────────────
```

### Infrastructure as Code Example

With cloud, you can define your entire infrastructure in code:

```yaml
# cloud-formation-template.yaml
# This creates a complete web application stack in minutes

Resources:
  WebServer:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t3.small
      ImageId: ami-0abcdef1234567890

  Database:
    Type: AWS::RDS::DBInstance
    Properties:
      Engine: postgres
      DBInstanceClass: db.t3.micro
      AllocatedStorage: 20

  LoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Type: application
      Scheme: internet-facing
```

```bash
# Deploy the entire stack with one command:
aws cloudformation create-stack \
  --stack-name my-web-app \
  --template-body file://cloud-formation-template.yaml

# Output: Stack creation initiated
# Time: Infrastructure ready in ~10 minutes
```

Compare this to the traditional process of ordering servers, waiting for delivery, racking them, cabling, installing the OS, configuring networking, setting up the database...

---

## Maintenance Responsibility

### Who Does What?

```
Traditional IT — You Do Everything:

┌──────────────────────────────────────────┐
│  YOUR TEAM HANDLES:                       │
│                                          │
│  ☐ Hardware failures (replace drives,    │
│    memory, power supplies)               │
│  ☐ OS patching and updates               │
│  ☐ Security patches (urgent at 2 AM)     │
│  ☐ Database maintenance                  │
│  ☐ Network configuration                 │
│  ☐ Backup management                     │
│  ☐ Monitoring setup                      │
│  ☐ Capacity planning                     │
│  ☐ Physical security                     │
│  ☐ Power and cooling                     │
│  ☐ Compliance audits                     │
│  ☐ Disaster recovery testing             │
│  ☐ Software licensing                    │
│  ☐ Vendor management                     │
│                                          │
│  Estimated team: 3-5 full-time IT staff  │
└──────────────────────────────────────────┘


Cloud (Managed Services) — Provider Does Most:

┌──────────────────────┐  ┌──────────────────────┐
│  YOUR TEAM HANDLES:  │  │  PROVIDER HANDLES:   │
│                      │  │                      │
│  ☐ Application code  │  │  ☐ Hardware          │
│  ☐ Data management   │  │  ☐ OS patching       │
│  ☐ Access control    │  │  ☐ Security patches  │
│  ☐ Cost optimization │  │  ☐ Database engine   │
│                      │  │  ☐ Networking        │
│                      │  │  ☐ Backups           │
│  Estimated team:     │  │  ☐ Monitoring        │
│  1-2 cloud engineers │  │  ☐ Physical security │
│                      │  │  ☐ Power & cooling   │
│                      │  │  ☐ Compliance certs  │
└──────────────────────┘  └──────────────────────┘
```

---

## Disaster Recovery Approaches

### Traditional DR

```
Traditional Disaster Recovery:

Primary Site                     DR Site
(New York)                       (Chicago)
┌──────────────────┐            ┌──────────────────┐
│  Production      │   Daily    │  Standby         │
│  Servers         │   backup   │  Servers         │
│  ┌────┐ ┌────┐  │ ────────► │  ┌────┐ ┌────┐  │
│  │ S1 │ │ S2 │  │   (tape   │  │ S1 │ │ S2 │  │
│  └────┘ └────┘  │    or     │  └────┘ └────┘  │
│  ┌────┐ ┌────┐  │  network) │  ┌────┐ ┌────┐  │
│  │ S3 │ │ DB │  │           │  │ S3 │ │ DB │  │
│  └────┘ └────┘  │           │  └────┘ └────┘  │
└──────────────────┘            └──────────────────┘

Cost: ~100% duplication of infrastructure
RTO:  4-24 hours (manual failover)
RPO:  Up to 24 hours of data loss (daily backups)
Testing: Once a year (if that)
```

### Cloud DR

```
Cloud Disaster Recovery:

Primary Region                   DR Region
(us-east-1)                      (us-west-2)
┌──────────────────┐            ┌──────────────────┐
│  Production      │  Real-time │  Standby (pilot  │
│  ┌────┐ ┌────┐  │  replica-  │  light or warm)  │
│  │EC2 │ │EC2 │  │  tion      │  ┌────┐          │
│  └────┘ └────┘  │ ────────► │  │ DB │ (replica)│
│  ┌────┐ ┌────┐  │           │  └────┘          │
│  │EC2 │ │RDS │  │           │  Auto-scaling    │
│  └────┘ └────┘  │           │  launches VMs    │
└──────────────────┘            │  only if needed  │
                                └──────────────────┘

Cost: 10-30% of primary (only DB replica runs)
RTO:  Minutes to 1 hour (automated failover)
RPO:  Seconds (real-time replication)
Testing: Anytime, on demand
```

### DR Comparison Table

| DR Aspect | Traditional | Cloud |
|-----------|------------|-------|
| **Cost** | 80-100% duplication | 10-30% of primary |
| **Recovery time (RTO)** | 4-24 hours | Minutes to 1 hour |
| **Data loss (RPO)** | Hours (daily backups) | Seconds (real-time sync) |
| **Failover** | Manual, error-prone | Automated or semi-automated |
| **Testing** | Annual, disruptive | Any time, non-disruptive |
| **Geographic distance** | Expensive to maintain far sites | Free to choose any global region |
| **Complexity** | High — duplicate everything | Moderate — managed services help |

---

## Security Models

### Traditional Security

```
Traditional Security — Castle and Moat:

                    ┌─── Firewall (moat)
                    │
         ┌──────────▼──────────┐
         │  ┌───────────────┐  │
         │  │ Internal      │  │
         │  │ Network       │  │
         │  │               │  │
Internet │  │ Everything    │  │
────────►│  │ inside is     │  │
         │  │ "trusted"     │  │
         │  │               │  │
         │  └───────────────┘  │
         │                     │
         │  Physical perimeter │
         └─────────────────────┘
```

### Cloud Security

```
Cloud Security — Zero Trust:

┌─────────────────────────────────────────────┐
│                                             │
│  Every request is verified:                 │
│                                             │
│  User ──► Identity ──► Policy ──► Resource │
│           Check        Check      Access    │
│                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ IAM     │  │ Network │  │ Data    │   │
│  │ Roles & │  │ Security│  │ Encrypt-│   │
│  │ Policies│  │ Groups  │  │ ion     │   │
│  └─────────┘  └─────────┘  └─────────┘   │
│                                             │
│  Every layer has its own security           │
│  "Never trust, always verify"               │
└─────────────────────────────────────────────┘
```

### Security Comparison

| Security Aspect | Traditional | Cloud |
|----------------|------------|-------|
| **Physical security** | You manage (guards, cameras, badges) | Provider manages (world-class facilities) |
| **Network security** | Hardware firewalls, IDS/IPS | Software-defined, security groups, WAF |
| **Identity management** | Active Directory, on-prem | IAM, SSO, MFA (built-in) |
| **Encryption** | You implement | Built-in, often automatic |
| **Compliance certifications** | You obtain and maintain | Provider maintains many (SOC2, ISO, etc.) |
| **Patch management** | Your responsibility, manual | Automated for managed services |
| **DDoS protection** | Expensive dedicated appliances | Built-in (AWS Shield, Azure DDoS, etc.) |
| **Audit logging** | You set up | Built-in (CloudTrail, Activity Log) |

---

## Staffing Needs

```
Traditional IT Team (medium company):

┌──────────────────────────────────────────────┐
│  IT Department (8-12 people)                  │
│                                              │
│  ├── IT Manager (1)                          │
│  ├── System Administrators (2-3)             │
│  │   └── Servers, OS, patching               │
│  ├── Network Engineers (1-2)                 │
│  │   └── Routers, switches, firewalls        │
│  ├── Database Administrators (1-2)           │
│  │   └── Backup, tuning, recovery            │
│  ├── Storage Engineers (1)                   │
│  │   └── SAN/NAS management                  │
│  ├── Security Specialist (1)                 │
│  │   └── Firewalls, IDS, compliance          │
│  └── Help Desk (2-3)                         │
│      └── End-user support                    │
│                                              │
│  Focus: Keeping the lights on                │
└──────────────────────────────────────────────┘


Cloud IT Team (same company):

┌──────────────────────────────────────────────┐
│  Cloud Team (4-6 people)                      │
│                                              │
│  ├── Cloud Architect (1)                     │
│  │   └── Design, best practices              │
│  ├── Cloud/DevOps Engineers (2-3)            │
│  │   └── IaC, CI/CD, automation              │
│  ├── Security Engineer (1)                   │
│  │   └── IAM, compliance, monitoring         │
│  └── Help Desk (1-2)                         │
│      └── End-user support                    │
│                                              │
│  Focus: Building and improving               │
└──────────────────────────────────────────────┘
```

---

## Total Cost of Ownership (TCO) Analysis

A proper TCO analysis should consider **all costs** over the lifetime of the solution:

### TCO Framework

```
Total Cost of Ownership:

┌─────────────────────────────────────────────────────┐
│  DIRECT COSTS                                        │
│  ├── Hardware (servers, storage, network)            │
│  ├── Software (licenses, subscriptions)              │
│  ├── Cloud service fees                              │
│  ├── Data center (rent, power, cooling)             │
│  └── Network connectivity                           │
│                                                      │
│  INDIRECT COSTS                                      │
│  ├── IT staff salaries and benefits                  │
│  ├── Training and certifications                     │
│  ├── Recruiting and retention                        │
│  └── Opportunity cost (time spent on maintenance     │
│       vs innovation)                                 │
│                                                      │
│  HIDDEN COSTS                                        │
│  ├── Downtime and lost productivity                  │
│  ├── Over-provisioning waste                         │
│  ├── Migration and transition costs                  │
│  ├── Compliance and audit overhead                   │
│  └── End-of-life hardware disposal                   │
└─────────────────────────────────────────────────────┘
```

### TCO Walkthrough Example

**Scenario:** Company needs to run a web application serving 10,000 users.

**Step 1: Define requirements**

| Requirement | Specification |
|-------------|--------------|
| Web servers | 4 vCPU, 16 GB RAM each |
| Database | PostgreSQL, 500 GB storage |
| Availability | 99.9% uptime |
| Backup | Daily, 30-day retention |
| DR | Recovery within 4 hours |
| Timeline | 3-year analysis |

**Step 2: Calculate on-premises costs**

| Category | Year 0 | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|--------|
| Hardware | $60,000 | $0 | $0 | $0 |
| Software licenses | $15,000 | $5,000 | $5,000 | $5,000 |
| Data center | $20,000 | $12,000 | $12,000 | $12,000 |
| IT staff (1.5 FTEs) | $0 | $150,000 | $150,000 | $150,000 |
| Maintenance | $0 | $8,000 | $8,000 | $8,000 |
| DR infrastructure | $30,000 | $6,000 | $6,000 | $6,000 |
| **Annual Total** | **$125,000** | **$181,000** | **$181,000** | **$181,000** |
| **Cumulative** | **$125,000** | **$306,000** | **$487,000** | **$668,000** |

**Step 3: Calculate cloud costs**

| Category | Year 0 | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|--------|
| Migration | $15,000 | $0 | $0 | $0 |
| Compute (3-yr reserved) | $0 | $24,000 | $24,000 | $24,000 |
| Database (managed) | $0 | $18,000 | $18,000 | $18,000 |
| Storage & backup | $0 | $3,600 | $3,600 | $3,600 |
| Networking & transfer | $0 | $6,000 | $6,000 | $6,000 |
| IT staff (0.5 FTE) | $0 | $60,000 | $60,000 | $60,000 |
| DR (cross-region) | $0 | $4,800 | $4,800 | $4,800 |
| **Annual Total** | **$15,000** | **$116,400** | **$116,400** | **$116,400** |
| **Cumulative** | **$15,000** | **$131,400** | **$247,800** | **$364,200** |

**Result:** Cloud saves approximately **$303,800 (45%)** over 3 years in this scenario, primarily due to lower staffing needs and no hardware investment.

---

## Migration Considerations

### The 6 R's of Cloud Migration

When moving from traditional IT to cloud, applications typically follow one of six strategies:

```
The 6 R's:

┌──────────────┐  Easiest, but no cloud benefits
│  Rehost      │  "Lift and shift" — move as-is
│  (Lift &     │
│   Shift)     │
├──────────────┤
│  Replatform  │  Minor optimizations (e.g., use managed DB)
│  (Lift &     │
│   Reshape)   │
├──────────────┤
│  Repurchase  │  Replace with SaaS (e.g., Exchange → Microsoft 365)
│  (Drop &     │
│   Shop)      │
├──────────────┤
│  Refactor    │  Rewrite for cloud-native (containers, serverless)
│  (Re-        │
│  architect)  │
├──────────────┤
│  Retire      │  Turn off applications no longer needed
│              │
├──────────────┤
│  Retain      │  Keep on-premises (not everything should migrate)
│              │
└──────────────┘  Most effort, but maximum cloud benefits
```

### Migration Complexity by Application Type

| Application Type | Recommended Strategy | Complexity | Timeline |
|-----------------|---------------------|-----------|----------|
| Static website | Rehost or Replatform | Low | Days |
| Simple web app | Rehost | Low-Medium | Weeks |
| Database-backed app | Replatform | Medium | Weeks-Months |
| Legacy enterprise app | Refactor or Retain | High | Months |
| Custom hardware-dependent | Retain | N/A | N/A |
| Commercial software | Repurchase | Low | Weeks |

---

## Hybrid Approaches

Many organizations don't go all-in on cloud or all-in on-premises. **Hybrid cloud** combines both:

```
Hybrid Cloud Architecture:

┌──────────────────────────────────────────────────────┐
│                                                      │
│  On-Premises                    Public Cloud         │
│  ┌─────────────────┐          ┌─────────────────┐   │
│  │ Sensitive data   │          │ Web servers     │   │
│  │ Legacy apps      │◄────────►│ Dev/test envs   │   │
│  │ Compliance-      │  Secure  │ Burst capacity  │   │
│  │ restricted       │  link    │ AI/ML workloads │   │
│  │ workloads        │ (VPN or  │ SaaS apps       │   │
│  └─────────────────┘  Direct  └─────────────────┘   │
│                       Connect)                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### When to Use Hybrid

| Scenario | Keep On-Prem | Put in Cloud |
|----------|-------------|-------------|
| Banking application | Customer financial data | Web portal, mobile app |
| Hospital system | Patient medical records | Appointment scheduling, analytics |
| Manufacturing | Production control systems | Supply chain analytics, ERP |
| Government | Classified systems | Public-facing websites, email |

---

## Decision Framework

Use this framework to decide whether cloud, on-premises, or hybrid is right for your workload:

### Step 1: Score Your Requirements

Rate each factor 1-5 for your specific situation:

| Factor | Favors On-Prem (1-2) | Neutral (3) | Favors Cloud (4-5) | Your Score |
|--------|----------------------|-------------|--------------------|----|
| **Workload variability** | Constant, predictable | Moderate variation | Highly variable, spiky | |
| **Speed to market** | Not a priority | Somewhat important | Critical differentiator | |
| **Existing infrastructure** | Large recent investment | Aging, needs refresh | Minimal/none | |
| **Compliance requirements** | Strict data sovereignty | Standard regulations | Flexible requirements | |
| **IT staff expertise** | Strong traditional IT team | Mixed skills | Cloud-skilled or small team | |
| **Budget structure** | Prefers CapEx | Either works | Prefers OpEx | |
| **Geographic reach** | Single location | Few locations | Global presence needed | |
| **Innovation pace** | Stable, low change | Moderate changes | Rapid, frequent changes | |

### Step 2: Interpret Your Score

| Total Score | Recommendation |
|-------------|---------------|
| 8-16 | **On-premises** is likely the better fit |
| 17-24 | **Hybrid** approach — mix of cloud and on-prem |
| 25-32 | **Hybrid** leaning cloud — most workloads in cloud |
| 33-40 | **Cloud-first** — cloud for nearly everything |

### Step 3: Consider Deal-Breakers

Some factors override the scoring:

- **No internet reliability** → On-premises (offline operation required)
- **Ultra-low latency (<1ms)** → On-premises or edge
- **Startup with no existing infrastructure** → Cloud (almost always)
- **Regulatory prohibition on cloud** → On-premises (for that workload)
- **Hardware refresh coming** → Perfect time to evaluate cloud migration

---

## Try It Yourself

### Exercise 1: TCO Comparison

A small company currently runs:
- 2 physical servers (3 years old, need replacement soon)
- 1 on-premises database server
- 1 backup solution
- 1 part-time IT person ($60,000/year)

Annual costs: power ($2,400), internet ($3,600), maintenance ($4,000).

The servers need replacement at $15,000 each.

**Task:** Calculate the 3-year TCO for:
1. Replacing the servers with new hardware
2. Migrating to cloud (estimate ~$800/month for equivalent cloud services)

Which option is cheaper? What non-financial factors might influence the decision?

<details>
<summary><strong>Click to see the solution</strong></summary>

**Option 1: Replace Hardware**
- New servers: $30,000 (Year 0)
- Annual operating: $60,000 (staff) + $2,400 (power) + $3,600 (internet) + $4,000 (maintenance) = $70,000/year
- 3-Year Total: $30,000 + (3 × $70,000) = **$240,000**

**Option 2: Migrate to Cloud**
- Migration cost: ~$5,000 (Year 0)
- Annual: $9,600 (cloud services) + $30,000 (staff, reduced role) + $3,600 (internet) = $43,200/year
- 3-Year Total: $5,000 + (3 × $43,200) = **$134,600**

Cloud saves approximately **$105,400** over 3 years.

Non-financial factors: scalability, no hardware to manage, automatic backups, but also vendor dependency and need for cloud skills.

</details>

### Exercise 2: Migration Strategy

For each application below, recommend a migration strategy (Rehost, Replatform, Repurchase, Refactor, Retire, or Retain) and explain your reasoning:

| Application | Strategy | Reasoning |
|-------------|----------|-----------|
| Company blog (WordPress) | | |
| Custom-built inventory system (Java, Oracle DB) | | |
| On-premises Microsoft Exchange email | | |
| Internal wiki that nobody uses anymore | | |
| Real-time trading system (latency-critical) | | |

<details>
<summary><strong>Click to see suggested answers</strong></summary>

| Application | Strategy | Reasoning |
|-------------|----------|-----------|
| Company blog (WordPress) | **Rehost** or **Replatform** | Easy to move to cloud VM or managed WordPress hosting |
| Custom inventory system | **Replatform** | Move Java app to cloud VM, switch Oracle to managed PostgreSQL |
| Microsoft Exchange | **Repurchase** | Replace with Microsoft 365 (SaaS) |
| Internal wiki nobody uses | **Retire** | Just turn it off — archive the data |
| Real-time trading system | **Retain** | Latency-critical, keep on-premises |

</details>

### Exercise 3: Decision Framework

Apply the decision framework from this lesson to your own situation (or a hypothetical company). Score each of the 8 factors, calculate the total, and determine the recommendation. Share your reasoning for each score.

---

## Comprehensive Comparison Table

Here's the complete side-by-side reference:

| Category | Traditional IT | Cloud Computing |
|----------|---------------|-----------------|
| **Ownership** | You own hardware | Provider owns; you rent |
| **Cost model** | CapEx (large upfront) | OpEx (pay-as-you-go) |
| **Scaling** | Weeks-months, manual | Minutes, automatic |
| **Deployment** | Weeks | Minutes to hours |
| **Maintenance** | Your team, 24/7 | Provider handles most |
| **DR/Backup** | Expensive, complex | Built-in, affordable |
| **Security** | Full control, full responsibility | Shared responsibility |
| **Compliance** | You obtain certifications | Provider helps, you configure |
| **Staffing** | Large IT team needed | Smaller, different skills |
| **Global reach** | Build data centers globally | Deploy to any region |
| **Innovation** | Limited by procurement | Experiment freely |
| **Vendor dependency** | Hardware vendor | Cloud provider |
| **Internet dependency** | Low | High |
| **Latency** | Very low (local) | Variable (network-dependent) |
| **Customization** | Full control | Limited to provider offerings |

---

## Key Takeaways

- Traditional IT requires **large upfront investment** (CapEx) while cloud uses **pay-as-you-go** (OpEx)
- Cloud scaling is **instant and automatic**; traditional scaling takes **weeks to months**
- Cloud **dramatically simplifies disaster recovery** at a fraction of the cost
- Traditional IT gives you **full control** but demands **full responsibility**
- A proper **TCO analysis** should include direct costs, indirect costs (staff), and hidden costs (downtime, opportunity cost)
- The **6 R's framework** (Rehost, Replatform, Repurchase, Refactor, Retire, Retain) guides migration decisions
- **Hybrid cloud** is often the most practical approach, combining the best of both worlds
- Use the **decision framework** (scoring 8 factors) to determine the best approach for your specific situation
- There is **no one-size-fits-all answer** — the right choice depends on your workload, budget, compliance needs, and team skills

---

## What's Next?

With a solid understanding of cloud fundamentals, history, benefits, challenges, and how cloud compares to traditional IT, you're ready to dive into the **service models**. In the next section, we'll explore **Infrastructure as a Service (IaaS)** in detail — the foundation of cloud computing.

**Next lesson: "Infrastructure as a Service (IaaS)"** →
