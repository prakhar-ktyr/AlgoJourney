---
title: "VPC and Subnets"
---

# VPC and Subnets

A **Virtual Private Cloud (VPC)** is your own isolated section of the cloud where you launch resources in a virtual network that you define. Think of it as your private data center in the cloud — you control the IP addresses, subnets, route tables, and network gateways.

In this lesson, you'll learn how to design production-ready VPCs with proper subnet strategies, routing, and connectivity.

---

## Why Do You Need a VPC?

Without a VPC, your cloud resources would share network space with everyone else. A VPC gives you:

| Benefit | Description |
|---------|-------------|
| **Isolation** | Your resources are logically separated from other customers |
| **Security** | You control inbound and outbound traffic with fine-grained rules |
| **Customization** | You choose your own IP address range, create subnets, and configure route tables |
| **Connectivity** | You can connect your VPC to on-premises networks or other VPCs |

---

## VPC Basics

When you create a VPC, you assign it a **CIDR block** — a range of IP addresses.

### What Is a CIDR Block?

CIDR stands for **Classless Inter-Domain Routing**. It defines a range of IP addresses using a base IP and a prefix length.

```
10.0.0.0/16
│         │
│         └── Prefix length (how many bits are fixed)
└── Base IP address
```

The prefix length determines how many IP addresses are available:

| CIDR Block | Prefix | Available IPs | Usable IPs* |
|------------|--------|---------------|-------------|
| `10.0.0.0/16` | /16 | 65,536 | 65,531 |
| `10.0.0.0/20` | /20 | 4,096 | 4,091 |
| `10.0.0.0/24` | /24 | 256 | 251 |
| `10.0.0.0/28` | /28 | 16 | 11 |

> *AWS reserves 5 IPs in each subnet (first 4 + last 1). Azure and GCP also reserve addresses.

### CIDR Block Planning Rules

1. **VPC CIDR range**: AWS allows `/16` (largest) to `/28` (smallest)
2. **Don't overlap**: If you plan to connect VPCs or on-premises networks, use non-overlapping ranges
3. **Plan for growth**: Choose a larger range than you need today

**Common private IP ranges (RFC 1918):**

```
10.0.0.0/8       → 16,777,216 addresses
172.16.0.0/12    → 1,048,576 addresses
192.168.0.0/16   → 65,536 addresses
```

### Example: Planning CIDR Blocks

```
Production VPC:   10.0.0.0/16
Staging VPC:      10.1.0.0/16
Development VPC:  10.2.0.0/16
On-Premises:      172.16.0.0/16
```

Each VPC uses a distinct `/16` range — no overlaps, easy to connect later.

---

## Subnets

A **subnet** is a subdivision of your VPC's IP range. You place resources (like servers and databases) into subnets.

### Subnet Types

There are three types of subnets based on their connectivity:

| Subnet Type | Internet Access | Use Case |
|-------------|----------------|----------|
| **Public** | Yes — has a route to an Internet Gateway | Web servers, load balancers, bastion hosts |
| **Private** | Outbound only — via NAT Gateway | Application servers, backend services |
| **Isolated** | None — no internet access at all | Databases, sensitive workloads |

### How a Subnet Becomes "Public" or "Private"

A subnet is **not** inherently public or private. What makes it public or private is its **route table**:

```
Public Subnet Route Table:
┌──────────────────┬─────────────────┐
│ Destination      │ Target          │
├──────────────────┼─────────────────┤
│ 10.0.0.0/16      │ local           │
│ 0.0.0.0/0        │ igw-abc123      │  ← Internet Gateway
└──────────────────┴─────────────────┘

Private Subnet Route Table:
┌──────────────────┬─────────────────┐
│ Destination      │ Target          │
├──────────────────┼─────────────────┤
│ 10.0.0.0/16      │ local           │
│ 0.0.0.0/0        │ nat-xyz789      │  ← NAT Gateway
└──────────────────┴─────────────────┘

Isolated Subnet Route Table:
┌──────────────────┬─────────────────┐
│ Destination      │ Target          │
├──────────────────┼─────────────────┤
│ 10.0.0.0/16      │ local           │
│                  │ (no default)    │  ← No internet route
└──────────────────┴─────────────────┘
```

---

## Multi-AZ Subnet Layout

For high availability, you should spread your subnets across multiple **Availability Zones (AZs)**.

### What Is an Availability Zone?

An AZ is a physically separate data center within a cloud region. If one AZ goes down, others keep running.

```
Region: us-east-1
├── AZ: us-east-1a
├── AZ: us-east-1b
└── AZ: us-east-1c
```

### Standard Multi-AZ Design

Create one subnet of each type in each AZ:

```
VPC: 10.0.0.0/16
│
├── us-east-1a
│   ├── Public Subnet:   10.0.1.0/24
│   ├── Private Subnet:  10.0.10.0/24
│   └── Isolated Subnet: 10.0.20.0/24
│
├── us-east-1b
│   ├── Public Subnet:   10.0.2.0/24
│   ├── Private Subnet:  10.0.11.0/24
│   └── Isolated Subnet: 10.0.21.0/24
│
└── us-east-1c
    ├── Public Subnet:   10.0.3.0/24
    ├── Private Subnet:  10.0.12.0/24
    └── Isolated Subnet: 10.0.22.0/24
```

> **Tip:** Use a consistent numbering scheme. Group public subnets in one range (1–9), private in another (10–19), and isolated in another (20–29).

---

## Route Tables and Associations

A **route table** contains rules (routes) that determine where network traffic is directed.

### Key Concepts

- Every VPC has a **main route table** (created automatically)
- You can create **custom route tables** for different subnet types
- Each subnet must be **associated** with exactly one route table
- If you don't explicitly associate a subnet, it uses the main route table

### Creating and Associating Route Tables

**Best practice:** Create separate route tables for each subnet type:

```
Route Table: "public-rt"
  Routes:
    10.0.0.0/16 → local
    0.0.0.0/0   → Internet Gateway
  Associated subnets: all public subnets

Route Table: "private-rt"
  Routes:
    10.0.0.0/16 → local
    0.0.0.0/0   → NAT Gateway
  Associated subnets: all private subnets

Route Table: "isolated-rt"
  Routes:
    10.0.0.0/16 → local
  Associated subnets: all isolated subnets
```

---

## Internet Gateway vs NAT Gateway

These two gateways serve different purposes:

### Internet Gateway (IGW)

An IGW allows resources in **public subnets** to communicate with the internet — both inbound and outbound.

```
Internet ←→ Internet Gateway ←→ Public Subnet (web server)
```

- **Free** to create (you pay for data transfer)
- Highly available by default
- One per VPC

### NAT Gateway

A NAT (Network Address Translation) Gateway allows resources in **private subnets** to reach the internet for outbound traffic only (e.g., downloading updates), while blocking inbound connections.

```
Internet ← NAT Gateway ← Private Subnet (app server)
         (outbound only)
```

- **Costs money** (~$0.045/hour + data processing charges)
- Deploy one per AZ for high availability
- Placed in a public subnet

### Comparison Table

| Feature | Internet Gateway | NAT Gateway |
|---------|-----------------|-------------|
| Direction | Bidirectional | Outbound only |
| Placed in | VPC level | Public subnet |
| Cost | Free (data transfer charges) | Hourly + data charges |
| High availability | Built-in | One per AZ recommended |
| Use case | Public-facing resources | Private resources needing internet |

---

## VPC Endpoints

VPC endpoints let you connect to AWS services **without going through the internet**. Traffic stays within the AWS network.

### Why Use VPC Endpoints?

- **Security**: Traffic never leaves the AWS backbone
- **Performance**: Lower latency than going through the internet
- **Cost savings**: No NAT Gateway data processing charges for AWS service traffic

### Two Types of VPC Endpoints

#### 1. Gateway Endpoints (Free)

Available for **S3** and **DynamoDB** only. Added as a route in your route table.

```
Route Table Entry:
  Destination: com.amazonaws.us-east-1.s3
  Target: vpce-abc123 (Gateway Endpoint)
```

#### 2. Interface Endpoints (Paid)

Available for most AWS services. Creates an **Elastic Network Interface (ENI)** in your subnet with a private IP.

```
Your Subnet
  └── ENI (10.0.10.55) → SQS service
```

| Feature | Gateway Endpoint | Interface Endpoint |
|---------|-----------------|-------------------|
| Cost | Free | ~$0.01/hour + data |
| Services | S3, DynamoDB | 100+ services |
| How it works | Route table entry | ENI in your subnet |
| DNS | Uses prefix lists | Private DNS names |

---

## VPC Flow Logs

**Flow logs** capture information about IP traffic going to and from network interfaces in your VPC.

### What Do Flow Logs Capture?

```
version account-id interface-id srcaddr dstaddr srcport dstport
protocol packets bytes start end action log-status

Example:
2 123456789 eni-abc123 10.0.1.15 52.94.76.5 49152 443
6 20 4000 1620140661 1620140721 ACCEPT OK
```

### Where to Send Flow Logs

| Destination | Best For |
|-------------|----------|
| **CloudWatch Logs** | Real-time monitoring, metric filters, alarms |
| **S3** | Long-term storage, cost-effective, Athena queries |
| **Kinesis Firehose** | Streaming analytics, third-party tools |

### Enabling Flow Logs

You can enable flow logs at three levels:

1. **VPC level** — captures all traffic in the VPC
2. **Subnet level** — captures traffic in a specific subnet
3. **ENI level** — captures traffic for a specific network interface

---

## Practical: Designing a Production-Ready VPC

Let's design a VPC for a typical three-tier web application:

### Architecture

```
                    Internet
                       │
                 ┌─────┴─────┐
                 │    IGW     │
                 └─────┬─────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────┴────┐   ┌────┴────┐   ┌────┴────┐
   │ Public  │   │ Public  │   │ Public  │
   │ Subnet  │   │ Subnet  │   │ Subnet  │
   │  AZ-a   │   │  AZ-b   │   │  AZ-c   │
   │ (ALB)   │   │ (ALB)   │   │ (ALB)   │
   │ (NAT)   │   │ (NAT)   │   │ (NAT)   │
   └────┬────┘   └────┬────┘   └────┬────┘
        │              │              │
   ┌────┴────┐   ┌────┴────┐   ┌────┴────┐
   │ Private │   │ Private │   │ Private │
   │ Subnet  │   │ Subnet  │   │ Subnet  │
   │  AZ-a   │   │  AZ-b   │   │  AZ-c   │
   │ (App)   │   │ (App)   │   │ (App)   │
   └────┬────┘   └────┬────┘   └────┬────┘
        │              │              │
   ┌────┴────┐   ┌────┴────┐   ┌────┴────┐
   │Isolated │   │Isolated │   │Isolated │
   │ Subnet  │   │ Subnet  │   │ Subnet  │
   │  AZ-a   │   │  AZ-b   │   │  AZ-c   │
   │  (DB)   │   │  (DB)   │   │  (DB)   │
   └─────────┘   └─────────┘   └─────────┘
```

### IP Addressing Plan

```
VPC CIDR: 10.0.0.0/16 (65,536 IPs)

Public Subnets (/24 each — 251 usable IPs):
  10.0.1.0/24   → us-east-1a
  10.0.2.0/24   → us-east-1b
  10.0.3.0/24   → us-east-1c

Private Subnets (/20 each — 4,091 usable IPs):
  10.0.16.0/20  → us-east-1a
  10.0.32.0/20  → us-east-1b
  10.0.48.0/20  → us-east-1c

Isolated Subnets (/24 each — 251 usable IPs):
  10.0.100.0/24 → us-east-1a
  10.0.101.0/24 → us-east-1b
  10.0.102.0/24 → us-east-1c
```

> **Why larger private subnets?** Application servers (ECS tasks, EC2 instances) consume the most IPs. Databases need fewer.

---

## AWS VPC Wizard Walkthrough

The AWS Console provides a VPC Wizard that simplifies creation.

### Step-by-Step

1. Go to **VPC Dashboard** → **Create VPC**
2. Choose **VPC and more** (creates subnets, route tables, and gateways)
3. Configure:
   - Name: `production`
   - IPv4 CIDR: `10.0.0.0/16`
   - Number of AZs: `3`
   - Number of public subnets: `3`
   - Number of private subnets: `3`
   - NAT Gateways: `1 per AZ` (for production) or `In 1 AZ` (for dev)
   - VPC endpoints: `S3 Gateway`
4. Review the preview diagram
5. Click **Create VPC**

The wizard creates all resources with consistent naming:

```
production-vpc
production-subnet-public1-us-east-1a
production-subnet-private1-us-east-1a
production-rtb-public
production-rtb-private1-us-east-1a
production-igw
production-nat-public1-us-east-1a
```

---

## Terraform VPC Example

Here's a production-ready VPC defined with Terraform:

```hcl
# --- Provider ---
provider "aws" {
  region = "us-east-1"
}

# --- Variables ---
variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "azs" {
  default = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "public_subnets" {
  default = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnets" {
  default = ["10.0.16.0/20", "10.0.32.0/20", "10.0.48.0/20"]
}

variable "isolated_subnets" {
  default = ["10.0.100.0/24", "10.0.101.0/24", "10.0.102.0/24"]
}

# --- VPC ---
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "production-vpc"
  }
}

# --- Internet Gateway ---
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "production-igw"
  }
}

# --- Public Subnets ---
resource "aws_subnet" "public" {
  count                   = length(var.public_subnets)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "public-${var.azs[count.index]}"
  }
}

# --- Private Subnets ---
resource "aws_subnet" "private" {
  count             = length(var.private_subnets)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.azs[count.index]

  tags = {
    Name = "private-${var.azs[count.index]}"
  }
}

# --- Isolated Subnets ---
resource "aws_subnet" "isolated" {
  count             = length(var.isolated_subnets)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.isolated_subnets[count.index]
  availability_zone = var.azs[count.index]

  tags = {
    Name = "isolated-${var.azs[count.index]}"
  }
}

# --- NAT Gateway (one per AZ for HA) ---
resource "aws_eip" "nat" {
  count  = length(var.azs)
  domain = "vpc"
}

resource "aws_nat_gateway" "nat" {
  count         = length(var.azs)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "nat-${var.azs[count.index]}"
  }
}

# --- Route Tables ---
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "public-rt"
  }
}

resource "aws_route_table" "private" {
  count  = length(var.azs)
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat[count.index].id
  }

  tags = {
    Name = "private-rt-${var.azs[count.index]}"
  }
}

resource "aws_route_table" "isolated" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "isolated-rt"
  }
}

# --- Route Table Associations ---
resource "aws_route_table_association" "public" {
  count          = length(var.public_subnets)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = length(var.private_subnets)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

resource "aws_route_table_association" "isolated" {
  count          = length(var.isolated_subnets)
  subnet_id      = aws_subnet.isolated[count.index].id
  route_table_id = aws_route_table.isolated.id
}
```

> **Pro tip:** In real projects, use the [terraform-aws-modules/vpc](https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws) module instead of writing all this from scratch.

---

## Common Mistakes and Troubleshooting

### Mistake 1: Instance Can't Reach the Internet

**Symptoms:** Timeouts when downloading packages, can't reach external APIs.

**Checklist:**

```
□ Is the instance in a public subnet?
  → Does the route table have 0.0.0.0/0 → IGW?
  → Does the instance have a public IP or Elastic IP?

□ Is the instance in a private subnet?
  → Does the route table have 0.0.0.0/0 → NAT Gateway?
  → Is the NAT Gateway in a public subnet?
  → Does the NAT Gateway's subnet route table have 0.0.0.0/0 → IGW?

□ Check Security Groups:
  → Outbound rule allows traffic (default: allow all outbound)

□ Check NACLs:
  → Both inbound AND outbound rules must allow the traffic
  → NACLs are stateless — you need rules in both directions
```

### Mistake 2: Overlapping CIDR Blocks

**Problem:** You can't peer two VPCs if their CIDR blocks overlap.

```
VPC A: 10.0.0.0/16
VPC B: 10.0.0.0/16  ← OVERLAP! Cannot peer.

Fix:
VPC A: 10.0.0.0/16
VPC B: 10.1.0.0/16  ← No overlap. Peering works.
```

### Mistake 3: Running Out of IPs

**Problem:** Subnet is too small, can't launch new instances.

```
/28 subnet = 16 IPs - 5 reserved = 11 usable
Running 11 containers? Subnet is FULL.

Solution: Plan subnets with room to grow.
Use /20 for private subnets where containers run.
```

### Mistake 4: Single NAT Gateway

**Problem:** One NAT Gateway = single point of failure.

```
❌ One NAT Gateway in us-east-1a
   If AZ-a goes down, private subnets in AZ-b and AZ-c lose internet.

✅ One NAT Gateway per AZ
   Each AZ has its own NAT Gateway → truly independent.
```

### Mistake 5: Using the Default VPC for Production

**Problem:** The default VPC has all-public subnets with permissive settings.

```
Default VPC:
  - All subnets are public
  - Instances get public IPs by default
  - Not designed for production workloads

Always create a custom VPC for production.
```

---

## VPC Across Cloud Providers

| Feature | AWS | Azure | GCP |
|---------|-----|-------|-----|
| VPC equivalent | VPC | VNet | VPC |
| Max CIDR | /16 | /8 | Custom |
| Subnets | Per-AZ | Per-region | Per-region |
| NAT | NAT Gateway | NAT Gateway | Cloud NAT |
| Endpoints | VPC Endpoints | Private Endpoints | Private Service Connect |
| Flow logs | VPC Flow Logs | NSG Flow Logs | VPC Flow Logs |
| Peering | VPC Peering | VNet Peering | VPC Peering |

---

## Exercises

### Exercise 1: CIDR Calculation

Given a VPC with CIDR `172.16.0.0/16`, plan subnets for:
- 3 public subnets (small — for load balancers)
- 3 private subnets (large — for application servers)
- 3 isolated subnets (small — for databases)

Write out the CIDR block for each subnet.

<details>
<summary>Solution</summary>

```
Public Subnets (/24 — 251 usable IPs each):
  172.16.1.0/24  → AZ-a
  172.16.2.0/24  → AZ-b
  172.16.3.0/24  → AZ-c

Private Subnets (/20 — 4,091 usable IPs each):
  172.16.16.0/20 → AZ-a
  172.16.32.0/20 → AZ-b
  172.16.48.0/20 → AZ-c

Isolated Subnets (/24 — 251 usable IPs each):
  172.16.100.0/24 → AZ-a
  172.16.101.0/24 → AZ-b
  172.16.102.0/24 → AZ-c
```

</details>

### Exercise 2: Troubleshooting

An EC2 instance in a private subnet cannot reach `https://api.github.com`. The instance can reach other instances in the VPC. What would you check?

<details>
<summary>Solution</summary>

1. **Route table**: Does the private subnet's route table have `0.0.0.0/0 → NAT Gateway`?
2. **NAT Gateway status**: Is the NAT Gateway in an `Available` state?
3. **NAT Gateway subnet**: Is the NAT Gateway placed in a **public** subnet with a route to the IGW?
4. **Security Group**: Does the instance's security group allow **outbound** traffic on port 443?
5. **NACL**: Do the subnet NACLs allow outbound 443 and inbound ephemeral ports (1024–65535)?

</details>

### Exercise 3: Design Challenge

Design a VPC for a microservices application with:
- A public-facing API Gateway
- 5 microservices (internal only)
- A shared Redis cache
- An RDS PostgreSQL database
- Expected to scale to 200 containers

Decide: VPC CIDR, subnet types, subnet sizes, NAT Gateway strategy, and VPC endpoints needed.

<details>
<summary>Solution</summary>

```
VPC CIDR: 10.0.0.0/16

Public Subnets (/24 each) — for ALB and NAT Gateways:
  10.0.1.0/24, 10.0.2.0/24, 10.0.3.0/24

Private Subnets (/19 each — 8,187 usable IPs) — for 200+ containers:
  10.0.32.0/19, 10.0.64.0/19, 10.0.96.0/19

Isolated Subnets (/24 each) — for RDS and ElastiCache:
  10.0.200.0/24, 10.0.201.0/24, 10.0.202.0/24

NAT Gateways: 1 per AZ (3 total) for high availability

VPC Endpoints:
  - S3 Gateway Endpoint (free — for logs, artifacts)
  - ECR Interface Endpoints (for container image pulls)
  - CloudWatch Interface Endpoint (for logging)
  - Secrets Manager Interface Endpoint (for credentials)
```

</details>

---

## Key Takeaways

| Concept | Remember |
|---------|----------|
| **VPC** | Your isolated virtual network in the cloud |
| **CIDR blocks** | Plan carefully — you can't easily change them later |
| **Public subnets** | Route table has a route to an Internet Gateway |
| **Private subnets** | Route table routes through a NAT Gateway (outbound only) |
| **Isolated subnets** | No internet route at all — maximum security |
| **Multi-AZ** | Spread subnets across AZs for high availability |
| **NAT Gateway** | One per AZ in production; costs money |
| **VPC Endpoints** | Keep AWS service traffic off the internet — use Gateway endpoints (free) when possible |
| **Flow Logs** | Enable them — essential for security and troubleshooting |
| **Plan ahead** | Use non-overlapping CIDRs and size subnets for growth |

---

## What's Next?

In the next lesson, you'll learn about **DNS and CDN in the Cloud** — how domain names are resolved, how content is cached at the edge, and how to configure cloud DNS and CDN services for your applications.
