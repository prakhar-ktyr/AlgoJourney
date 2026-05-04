---
title: "Public Cloud"
---

# Public Cloud

The **public cloud** is the most widely adopted cloud deployment model. When most people say "the cloud," they mean the public cloud — infrastructure and services offered by third-party providers over the public internet, available to anyone who wants to sign up.

In this lesson, you'll learn how public cloud works, who the major providers are, how their global infrastructure is organized, and when public cloud is (and isn't) the right choice.

---

## What Is the Public Cloud?

A **public cloud** is a computing environment where a third-party provider owns, operates, and maintains shared infrastructure. Multiple customers (called **tenants**) use the same physical hardware, but their data and workloads are logically isolated.

```
Public Cloud Characteristics:

  ✔ Owned and operated by a third-party provider
  ✔ Shared infrastructure (multi-tenant)
  ✔ Accessed over the public internet
  ✔ Pay-as-you-go pricing
  ✔ Self-service provisioning
  ✔ Elastic scaling (up and down)
  ✔ Global availability
```

### The Apartment Building Analogy

Think of public cloud like an apartment building:

```
Apartment Building (Public Cloud)
  │
  ├── The building owner (Provider):
  │     ✔ Owns the building and land
  │     ✔ Maintains structure, plumbing, electricity
  │     ✔ Provides security (locks, cameras)
  │     ✔ Handles repairs and upgrades
  │
  ├── Each tenant (Customer):
  │     ✔ Has their own private apartment (isolated resources)
  │     ✔ Pays monthly rent (pay-as-you-go)
  │     ✔ Can't see into other apartments (data isolation)
  │     ✔ Shares common areas (network, physical hardware)
  │     ✔ Can upgrade to a bigger apartment (scale up)
  │
  └── Shared resources:
        ✔ Elevator, hallways (network backbone)
        ✔ Water supply (bandwidth)
        ✔ Parking garage (storage systems)
        ✔ Security system (firewalls, DDoS protection)
```

---

## Multi-Tenancy: How Sharing Works

**Multi-tenancy** means multiple customers share the same physical infrastructure while remaining logically isolated. This is the foundation of public cloud economics.

### How Isolation Works

```
Physical Server (Host Machine)
┌─────────────────────────────────────────┐
│  Hypervisor (e.g., Xen, KVM, Hyper-V)  │
│  ┌───────────┐  ┌───────────┐          │
│  │ VM - Co A │  │ VM - Co B │          │
│  │ ┌───────┐ │  │ ┌───────┐ │          │
│  │ │  App  │ │  │ │  App  │ │          │
│  │ │  OS   │ │  │ │  OS   │ │          │
│  │ │ vCPU  │ │  │ │ vCPU  │ │          │
│  │ │ vRAM  │ │  │ │ vRAM  │ │          │
│  │ └───────┘ │  │ └───────┘ │          │
│  └───────────┘  └───────────┘          │
│                                         │
│  Physical CPU | Physical RAM | Storage  │
└─────────────────────────────────────────┘

Company A cannot see or access Company B's VM.
Both share the same physical CPU, RAM, and storage.
The hypervisor enforces isolation.
```

### Isolation Layers

| Layer              | Isolation Mechanism                        |
|--------------------|--------------------------------------------|
| **Compute**        | Hypervisor, dedicated vCPU/RAM allocation  |
| **Storage**        | Encrypted volumes, separate logical disks  |
| **Network**        | Virtual Private Clouds (VPCs), VLANs       |
| **Data**           | Encryption at rest, separate encryption keys|
| **Identity**       | Separate IAM tenants/accounts              |
| **Billing**        | Separate billing accounts and metering     |

### Multi-Tenancy Concerns and Mitigations

```
Concern: "Can another tenant access my data?"
  → Mitigation: Encryption at rest with customer-managed keys
  → Provider audits: SOC 2 Type II verifies isolation

Concern: "Can a noisy neighbor affect my performance?"
  → Mitigation: Dedicated instances/hosts available
  → Provider QoS: Resource allocation guarantees

Concern: "Are resources truly isolated after I delete them?"
  → Mitigation: Cryptographic erasure (destroy encryption keys)
  → Provider process: Disk wiping procedures documented

Concern: "Can government subpoenas access my data?"
  → Mitigation: Customer-managed encryption (you hold keys)
  → Legal: Providers publish transparency reports
```

---

## Major Public Cloud Providers

### Market Share Overview (2025)

| Provider                   | Market Share | Annual Revenue | Strengths                          |
|----------------------------|-------------|----------------|------------------------------------|
| **Amazon Web Services (AWS)** | ~31%      | ~$100B+        | Broadest service catalog           |
| **Microsoft Azure**         | ~25%       | ~$80B+         | Enterprise/hybrid integration      |
| **Google Cloud Platform (GCP)** | ~11%   | ~$40B+         | Data/AI/ML, Kubernetes             |
| **Alibaba Cloud**           | ~4%        | ~$15B+         | Dominant in China/Asia-Pacific     |
| **Oracle Cloud (OCI)**      | ~3%        | ~$8B+          | Database workloads, enterprise     |
| **IBM Cloud**               | ~2%        | ~$6B+          | Hybrid cloud, mainframe migration  |
| Others (DigitalOcean, Linode/Akamai, etc.) | ~24% | Varies | Niche, developer-friendly   |

### AWS (Amazon Web Services)

```
Founded:   2006
Regions:   33+ geographic regions
Services:  200+ fully featured services

Key Services:
  ├── Compute:     EC2, Lambda, ECS, EKS, Fargate
  ├── Storage:     S3, EBS, EFS, Glacier
  ├── Database:    RDS, DynamoDB, Aurora, Redshift
  ├── Networking:  VPC, CloudFront, Route 53, ELB
  ├── AI/ML:       SageMaker, Bedrock, Rekognition
  └── Security:    IAM, KMS, GuardDuty, WAF

Strengths:
  ✔ Most mature platform (18+ years)
  ✔ Largest service catalog
  ✔ Biggest partner ecosystem
  ✔ Most availability zones globally
  ✔ Strongest serverless offerings

Best for:
  → Startups needing breadth of services
  → Organizations wanting maximum flexibility
  → Serverless and microservices architectures
```

### Microsoft Azure

```
Founded:   2010
Regions:   60+ geographic regions
Services:  200+ services

Key Services:
  ├── Compute:     Virtual Machines, Functions, AKS, App Service
  ├── Storage:     Blob Storage, Disk Storage, Files
  ├── Database:    SQL Database, Cosmos DB, PostgreSQL
  ├── Networking:  Virtual Network, Front Door, CDN, ExpressRoute
  ├── AI/ML:       Azure AI Services, OpenAI Service, ML Studio
  └── Security:    Entra ID (Azure AD), Key Vault, Sentinel

Strengths:
  ✔ Deepest enterprise integration (Active Directory, Office 365)
  ✔ Strongest hybrid cloud story (Azure Arc, Stack)
  ✔ Government cloud (Azure Government, Azure DoD)
  ✔ Most compliance certifications
  ✔ OpenAI partnership (GPT-4, DALL-E)

Best for:
  → Enterprises with Microsoft ecosystem
  → Hybrid cloud deployments
  → Government and regulated industries
  → AI workloads using OpenAI models
```

### Google Cloud Platform (GCP)

```
Founded:   2008 (App Engine), 2011 (IaaS)
Regions:   40+ geographic regions
Services:  150+ services

Key Services:
  ├── Compute:     Compute Engine, Cloud Run, GKE, Cloud Functions
  ├── Storage:     Cloud Storage, Persistent Disk, Filestore
  ├── Database:    Cloud SQL, Firestore, Spanner, BigQuery
  ├── Networking:  VPC, Cloud CDN, Cloud DNS, Cloud Load Balancing
  ├── AI/ML:       Vertex AI, Gemini, TensorFlow, TPUs
  └── Security:    IAM, KMS, Security Command Center

Strengths:
  ✔ Best-in-class data analytics (BigQuery)
  ✔ Leading Kubernetes platform (invented K8s)
  ✔ Strong AI/ML capabilities (Gemini, TPUs)
  ✔ Premium global network (private fiber)
  ✔ Competitive pricing (sustained use discounts)

Best for:
  → Data-intensive workloads
  → Machine learning and AI projects
  → Kubernetes-native applications
  → Organizations prioritizing open-source
```

### Other Notable Providers

| Provider         | Best For                              | Notable Feature                    |
|------------------|---------------------------------------|------------------------------------|
| **DigitalOcean** | Developers, small businesses          | Simplicity, flat pricing           |
| **Linode (Akamai)** | Developers, edge computing         | Developer-friendly, CDN backbone   |
| **Vultr**        | Developers needing global VMs         | Bare metal, GPU instances          |
| **Hetzner**      | European-based, budget-conscious      | Low-cost, strong EU presence       |
| **OVHcloud**     | European data sovereignty             | EU-owned, GDPR focus               |
| **Oracle Cloud** | Enterprise databases, Oracle workloads| Always Free tier, competitive VMs  |

---

## Global Infrastructure: Regions, Zones, and Edges

Public cloud providers organize their infrastructure into a hierarchy:

### Regions

A **region** is a geographic area containing one or more data centers. Each provider has multiple regions worldwide.

```
Example: AWS Regions
  ├── us-east-1      (N. Virginia)     ← Oldest, most services
  ├── us-west-2      (Oregon)          ← Popular for dev/test
  ├── eu-west-1      (Ireland)         ← European hub
  ├── ap-southeast-1 (Singapore)       ← Asia-Pacific hub
  ├── me-south-1     (Bahrain)         ← Middle East
  └── af-south-1     (Cape Town)       ← Africa
```

**How to choose a region:**

| Factor               | Consideration                                    |
|----------------------|--------------------------------------------------|
| **Latency**          | Pick the region closest to your users            |
| **Compliance**       | Some regulations require data in specific regions|
| **Service availability** | Not all services are in all regions          |
| **Cost**             | Pricing varies by region (up to 20% difference)  |
| **Disaster recovery**| Use a second region for failover                 |

### Availability Zones (AZs)

An **Availability Zone** is one or more discrete data centers within a region, each with independent power, cooling, and networking.

```
Region: us-east-1 (N. Virginia)
  │
  ├── AZ: us-east-1a  ──── Data Center(s)
  │     └── Independent power, cooling, network
  │
  ├── AZ: us-east-1b  ──── Data Center(s)
  │     └── Independent power, cooling, network
  │
  ├── AZ: us-east-1c  ──── Data Center(s)
  │     └── Independent power, cooling, network
  │
  └── AZ: us-east-1d  ──── Data Center(s)
        └── Independent power, cooling, network

  ← Connected by low-latency private fiber →
  ← Physically separated (miles apart) →
  ← If one AZ fails, others keep running →
```

**Why AZs matter:**

```
Single AZ deployment:
  ┌─────────┐
  │  AZ-1a  │  ← If this AZ goes down,
  │  App     │     your app is DOWN
  │  DB      │
  └─────────┘

Multi-AZ deployment:
  ┌─────────┐    ┌─────────┐
  │  AZ-1a  │    │  AZ-1b  │  ← If AZ-1a goes down,
  │  App     │←──│  App     │     AZ-1b keeps running
  │  DB-Primary│ │  DB-Standby│
  └─────────┘    └─────────┘
```

### Edge Locations and CDN

**Edge locations** are smaller facilities placed close to end users, used for caching content and reducing latency.

```
Content Delivery Flow:

  User in Tokyo
       │
       ▼
  Edge Location (Tokyo)     ← Cache hit? Serve immediately!
       │
       │ (cache miss)
       ▼
  Region (ap-northeast-1)   ← Fetch from origin
       │
       ▼
  Origin Server              ← Generate response
```

| Provider   | Edge Locations | CDN Service     |
|------------|---------------|-----------------|
| **AWS**    | 600+          | CloudFront      |
| **Azure**  | 190+          | Azure CDN       |
| **GCP**    | 200+          | Cloud CDN       |

---

## Economics of Public Cloud

### Pricing Models

| Model                  | Description                               | Savings  | Best For                    |
|------------------------|-------------------------------------------|----------|-----------------------------|
| **On-Demand**          | Pay by the hour/second, no commitment     | 0%       | Variable, unpredictable work|
| **Reserved/Committed** | 1-3 year commitment for lower rates       | 30-72%   | Steady-state workloads      |
| **Spot/Preemptible**   | Bid on spare capacity, can be interrupted  | 60-90%   | Batch jobs, fault-tolerant  |
| **Free Tier**          | Limited resources at no cost              | 100%     | Learning, prototyping       |

### Cost Comparison Example

Running a moderate web application for one year:

```
On-Premises:
  ├── Server hardware:       $8,000 (amortized over 3 years)
  ├── Networking equipment:  $2,000 (amortized)
  ├── Data center space:     $1,200/year (co-location)
  ├── Electricity:           $1,800/year
  ├── Staff (sysadmin):      $40,000/year (part-time allocation)
  ├── Software licenses:     $3,000/year
  └── Total Year 1:          ~$48,000
      Total Year 3:          ~$86,000

Public Cloud (On-Demand):
  ├── Compute (2x m5.large):  $8,400/year
  ├── Storage (500 GB):       $1,380/year
  ├── Database (RDS):         $4,200/year
  ├── Network (1 TB/mo):      $1,080/year
  ├── Monitoring/logging:     $600/year
  └── Total Year 1:           ~$15,660
      Total Year 3:           ~$46,980

Public Cloud (Reserved 3-year):
  ├── Compute (reserved):     $4,200/year (50% savings)
  ├── Storage:                $1,380/year
  ├── Database (reserved):    $2,520/year (40% savings)
  ├── Network:                $1,080/year
  ├── Monitoring:             $600/year
  └── Total Year 1:           ~$9,780
      Total Year 3:           ~$29,340
```

### Hidden Costs to Watch

```
Common surprises on your cloud bill:

  1. Data Transfer (Egress)
     └── Free to upload, charges to download
     └── Inter-region transfer costs add up
     └── Can be 5-15% of total bill

  2. Idle Resources
     └── Forgotten VMs running 24/7
     └── Unattached storage volumes
     └── Unused Elastic IPs ($3.65/month each!)

  3. Logging and Monitoring
     └── CloudWatch/Azure Monitor costs scale with data
     └── Log storage accumulates over time

  4. NAT Gateway / Load Balancer
     └── Per-hour charges + data processing fees
     └── Can cost $30-100+/month even for small apps

  5. Support Plans
     └── AWS Business Support: 10% of monthly spend
     └── Enterprise support: $15,000+/month minimum
```

---

## Security in the Public Cloud

### Built-in Security Features

| Feature                  | AWS                  | Azure                | GCP                    |
|--------------------------|----------------------|----------------------|------------------------|
| **Identity & Access**    | IAM                  | Entra ID             | Cloud IAM              |
| **Encryption at Rest**   | KMS, SSE             | Azure Key Vault      | Cloud KMS              |
| **Encryption in Transit**| TLS/SSL, ACM         | App Gateway, TLS     | Managed SSL            |
| **DDoS Protection**      | Shield               | DDoS Protection      | Cloud Armor            |
| **Firewall**             | Security Groups, WAF | NSG, Azure Firewall  | Cloud Firewall, WAF    |
| **Threat Detection**     | GuardDuty            | Sentinel             | Security Command Center|
| **Secrets Management**   | Secrets Manager      | Key Vault            | Secret Manager         |

### Security Best Practices

```
1. Identity and Access:
   ✔ Enable MFA for all accounts
   ✔ Use roles instead of long-term credentials
   ✔ Implement least-privilege access
   ✔ Regular access reviews

2. Network:
   ✔ Use private subnets for backend services
   ✔ Implement network segmentation
   ✔ Enable flow logs
   ✔ Use VPN/private connectivity for hybrid

3. Data:
   ✔ Encrypt everything at rest and in transit
   ✔ Use customer-managed encryption keys for sensitive data
   ✔ Enable versioning and cross-region replication
   ✔ Implement data classification

4. Monitoring:
   ✔ Enable all audit logs (CloudTrail, Activity Log)
   ✔ Set up alerting for suspicious activity
   ✔ Use SIEM integration
   ✔ Regular security assessments

5. Compliance:
   ✔ Use compliance-certified services
   ✔ Implement automated compliance checks
   ✔ Document your shared responsibility coverage
   ✔ Regular third-party audits
```

---

## Compliance Certifications

Major public cloud providers maintain extensive compliance certifications:

### Common Certifications

| Certification | What It Covers                          | Who Needs It                    |
|---------------|------------------------------------------|---------------------------------|
| **SOC 2 Type II** | Security, availability, confidentiality | Most businesses              |
| **ISO 27001** | Information security management system   | International businesses        |
| **ISO 27017** | Cloud-specific security controls         | Cloud-first organizations       |
| **ISO 27018** | Protection of personal data in cloud     | Organizations handling PII      |
| **HIPAA**     | Protected health information             | Healthcare organizations (US)   |
| **PCI DSS**   | Payment card data security               | Anyone processing payments      |
| **FedRAMP**   | US federal government security           | US government contractors       |
| **GDPR**      | EU data protection regulation            | Organizations serving EU users  |
| **SOX**       | Financial reporting integrity            | Publicly traded companies       |
| **CSA STAR**  | Cloud-specific security assurance        | Security-conscious organizations|

### Provider Certification Comparison

```
AWS Compliance Programs:    140+
  ├── SOC 1, 2, 3        ✔
  ├── ISO 27001/17/18    ✔
  ├── HIPAA              ✔ (BAA available)
  ├── PCI DSS Level 1    ✔
  ├── FedRAMP High       ✔
  ├── GDPR               ✔
  └── GovCloud regions   ✔ (US-only personnel)

Azure Compliance Programs:  100+
  ├── SOC 1, 2, 3        ✔
  ├── ISO 27001/17/18    ✔
  ├── HIPAA              ✔ (BAA available)
  ├── PCI DSS Level 1    ✔
  ├── FedRAMP High       ✔
  ├── GDPR               ✔
  └── Government regions ✔ (US, China, Germany)

GCP Compliance Programs:    90+
  ├── SOC 1, 2, 3        ✔
  ├── ISO 27001/17/18    ✔
  ├── HIPAA              ✔ (BAA available)
  ├── PCI DSS Level 1    ✔
  ├── FedRAMP High       ✔ (Assured Workloads)
  ├── GDPR               ✔
  └── Assured Workloads  ✔ (compliance controls)
```

> **Important:** The provider's certification covers **their** infrastructure. You must still ensure **your** usage is compliant. A SOC 2 certified cloud doesn't make your application SOC 2 compliant automatically.

---

## Pros and Cons of Public Cloud

### Advantages

| Advantage               | Description                                              |
|--------------------------|----------------------------------------------------------|
| **No CapEx**             | No upfront hardware investment                           |
| **Elastic Scaling**      | Scale up or down in minutes, not months                  |
| **Global Reach**         | Deploy worldwide without building data centers           |
| **Innovation Speed**     | Access to latest technologies (AI, IoT, blockchain)      |
| **Reliability**          | Built-in redundancy across availability zones            |
| **Security Investment**  | Providers spend billions on security annually            |
| **Managed Services**     | Offload undifferentiated heavy lifting                   |
| **Pay-as-You-Go**        | Pay only for what you consume                            |

### Disadvantages

| Disadvantage             | Description                                              |
|--------------------------|----------------------------------------------------------|
| **Vendor Lock-in**       | Migration between providers is complex and costly        |
| **Data Transfer Costs**  | Egress charges can be significant at scale               |
| **Limited Control**      | Less control vs. on-premises infrastructure              |
| **Compliance Complexity**| Shared responsibility adds compliance burden             |
| **Internet Dependency**  | Requires reliable internet connectivity                  |
| **Cost Unpredictability**| Bills can spike unexpectedly without guardrails          |
| **Multi-Tenancy Risks**  | Potential for noisy neighbor issues                      |
| **Latency**              | Added network hops vs. local deployment                  |

---

## When NOT to Use Public Cloud

Public cloud isn't always the right answer. Here are scenarios where alternatives may be better:

### 1. Ultra-Low Latency Requirements

```
Scenario:
  High-frequency trading platform requiring < 100 microsecond
  latency between components.

Why not public cloud:
  → Network virtualization adds latency
  → Shared infrastructure can introduce jitter
  → Co-located hardware with direct connections is faster

Alternative:
  → Co-located bare metal servers
  → On-premises with FPGA-based networking
```

### 2. Data Sovereignty with Strict Requirements

```
Scenario:
  Government defense agency requiring air-gapped networks
  with no internet connectivity.

Why not public cloud:
  → Public cloud requires internet access
  → Even GovCloud regions connect through the internet
  → Some classifications forbid third-party infrastructure

Alternative:
  → On-premises data center
  → Private cloud (OpenStack, VMware)
  → Government-specific clouds (when available)
```

### 3. Predictable, Maximum Utilization Workloads

```
Scenario:
  A rendering farm running GPU workloads 24/7/365
  at 95%+ utilization.

Why not public cloud:
  → On-demand pricing is expensive at full utilization
  → Even reserved pricing may cost more than owned hardware
  → Amortized hardware costs are lower over 3-5 years

Alternative:
  → Own your hardware for baseline load
  → Use cloud for burst capacity (hybrid approach)
```

### 4. Massive Data Gravity

```
Scenario:
  A research organization with 50 PB of data that needs
  to be processed locally.

Why not public cloud:
  → Uploading 50 PB over the internet takes years
  → Egress costs for retrieving data are enormous
  → Storage costs at that scale exceed owned storage

Cost example:
  50 PB in S3 Standard = ~$1.15M/month
  50 PB on owned storage = ~$500K one-time
    (with $50K/year maintenance)
```

### 5. Simple, Static Workloads

```
Scenario:
  A small business running a single file server and
  email for 10 employees.

Why not public cloud:
  → Overhead of cloud management for simple needs
  → A NAS device + Google Workspace may be simpler
  → Total cost may be lower with on-premises hardware

Alternative:
  → SaaS for email (Google Workspace, Microsoft 365)
  → Simple NAS for file storage
  → Consumer-grade router with VPN
```

### Decision Checklist: Public Cloud or Not?

```
Answer these questions:

  1. Is your workload variable or unpredictable?
     → Yes: Public cloud (elastic scaling)
     → No:  Consider owned infrastructure

  2. Do you need global deployment?
     → Yes: Public cloud (instant global reach)
     → No:  Single location may suffice

  3. Is your team experienced with cloud?
     → Yes: Public cloud (leverage skills)
     → No:  Consider managed services or SaaS

  4. Are there strict data residency requirements?
     → Yes: Verify provider has compliant regions
     → No:  Public cloud is fine

  5. Is your budget model OpEx-friendly?
     → Yes: Public cloud (pay-as-you-go)
     → No:  Consider CapEx with owned hardware

  6. Do you need internet-independent operation?
     → Yes: On-premises or private cloud
     → No:  Public cloud works

  Score: 4+ "Yes" answers → Public cloud is likely right
         2-3 "Yes" answers → Evaluate hybrid approach
         0-1 "Yes" answers → Consider on-prem or private cloud
```

---

## Public Cloud vs. Other Deployment Models

| Feature                | Public Cloud     | Private Cloud     | Hybrid Cloud      | Multi-Cloud       |
|------------------------|------------------|-------------------|--------------------|-------------------|
| **Ownership**          | Provider         | You/dedicated     | Mix                | Multiple providers|
| **Cost Model**         | OpEx             | CapEx + OpEx      | Both               | OpEx              |
| **Scaling**            | Instant, elastic | Limited by hardware| Burst to public   | Distributed       |
| **Control**            | Limited          | Full              | Balanced           | Complex           |
| **Security**           | Shared           | You own it        | Mixed              | Complex           |
| **Compliance**         | Shared           | Full control      | Flexible           | Complex           |
| **Best For**           | Most workloads   | Highly regulated  | Legacy + modern    | Avoid lock-in     |

---

## Summary

| Concept | Description |
|---------|-------------|
| **Public Cloud** | Third-party-owned shared infrastructure over the internet |
| **Multi-Tenancy** | Multiple customers share physical resources securely |
| **Top 3 Providers** | AWS (~31%), Azure (~25%), GCP (~11%) |
| **Regions** | Geographic areas with one or more data centers |
| **Availability Zones** | Independent facilities within a region for redundancy |
| **Edge Locations** | CDN nodes close to users for low latency |
| **Pricing Models** | On-Demand, Reserved, Spot/Preemptible, Free Tier |
| **Key Certifications** | SOC 2, ISO 27001, HIPAA, PCI DSS, FedRAMP, GDPR |
| **When Not to Use** | Ultra-low latency, air-gapped, 100% utilized, massive data |

---

## Practice Exercises

**Exercise 1: Provider Comparison**

You're the CTO of a mid-size company. Compare AWS, Azure, and GCP for the following workload and recommend one:

```
Workload:
  - E-commerce platform serving customers globally
  - 10 million monthly active users
  - Machine learning-powered product recommendations
  - Must comply with GDPR (EU users) and PCI DSS
  - Team is proficient in Python and Kubernetes
  - Budget: $50,000/month for cloud infrastructure

For each provider, consider:
  1. Which compute services would you use?
  2. Which database services?
  3. Which ML services?
  4. How would you handle GDPR compliance?
  5. Estimated monthly cost breakdown
```

<details>
<summary>Click to see a sample answer</summary>

```
Recommended: GCP (based on K8s + ML strengths)

  Compute:   GKE (Kubernetes-native team)
  Database:  Cloud SQL (PostgreSQL) + Firestore (sessions)
  ML:        Vertex AI for recommendations
  GDPR:      EU regions (europe-west1), data processing
             agreement, customer-managed encryption keys
  CDN:       Cloud CDN for global content delivery

  Cost estimate:
    GKE cluster:          $8,000/month
    Cloud SQL (HA):       $5,000/month
    Vertex AI:            $10,000/month
    Cloud Storage:        $2,000/month
    Cloud CDN + Network:  $5,000/month
    Monitoring/Security:  $3,000/month
    Total:                ~$33,000/month (under budget)

  AWS and Azure are also strong choices — AWS for broadest
  services, Azure for enterprise integrations.
```

</details>

**Exercise 2: Region Selection**

Your application serves users in these locations. Choose the best regions and justify:

```
User Distribution:
  - 40% North America (mostly US East Coast)
  - 30% Europe (UK, Germany, France)
  - 20% Asia-Pacific (Japan, Australia)
  - 10% South America (Brazil)

Requirements:
  - Latency < 100ms for 95% of users
  - GDPR compliance for EU data
  - Cost-effective (avoid expensive regions if possible)
  - Disaster recovery with RPO < 1 hour

Select primary and DR regions for each geographic area.
```

<details>
<summary>Click to see a sample answer</summary>

```
AWS Region Selection:

  North America:
    Primary:  us-east-1 (N. Virginia) — lowest cost, most services
    DR:       us-east-2 (Ohio) — close, low latency failover

  Europe:
    Primary:  eu-west-1 (Ireland) — GDPR, broad services
    DR:       eu-central-1 (Frankfurt) — GDPR, low latency

  Asia-Pacific:
    Primary:  ap-northeast-1 (Tokyo) — serves Japan
    Secondary: ap-southeast-2 (Sydney) — serves Australia

  South America:
    Primary:  sa-east-1 (São Paulo) — only SA region
    DR:       us-east-1 — closest alternative
```

</details>

**Exercise 3: Cost Optimization**

Your team received this monthly AWS bill. Identify optimization opportunities:

```
Service                  Monthly Cost    Utilization
─────────────────────────────────────────────────────
EC2 (10x m5.xlarge)      $14,016         35% average CPU
RDS (db.r5.2xlarge)       $5,520         20% average CPU
S3 (50 TB)                $1,150         80% infrequent access
NAT Gateway               $3,200         Standard usage
Data Transfer (10 TB out) $900           Standard usage
EBS (20 TB gp3)           $1,600         50% allocated unused
CloudWatch Logs (500 GB)  $250           No retention policy
Elastic IPs (5 unused)    $18            Not attached
─────────────────────────────────────────────────────
Total:                    $26,654

Identify at least 5 optimizations and estimate savings.
```

<details>
<summary>Click to see answers</summary>

```
Optimization                          Est. Savings

1. Right-size EC2 to m5.large         $7,008/month
   (35% CPU → half the instance size)

2. Right-size RDS to db.r5.large      $3,864/month
   (20% CPU → quarter the instance)

3. Move 80% of S3 to Infrequent       $460/month
   Access tier

4. Use VPC endpoints instead of        $2,000/month
   NAT Gateway where possible

5. Delete 10 TB unused EBS volumes     $800/month

6. Set CloudWatch log retention to     $150/month
   30 days

7. Release 5 unused Elastic IPs        $18/month

8. Purchase Reserved Instances for     $2,100/month
   remaining steady-state EC2 (1-yr)

Total potential savings:               ~$16,400/month (62%)
Optimized monthly bill:                ~$10,254/month
```

</details>

---

## Further Reading

- AWS Global Infrastructure documentation
- Azure Regions and availability zones documentation
- Google Cloud Locations documentation
- Gartner Magic Quadrant for Cloud Infrastructure and Platform Services
- Flexera State of the Cloud Report (annual survey)
