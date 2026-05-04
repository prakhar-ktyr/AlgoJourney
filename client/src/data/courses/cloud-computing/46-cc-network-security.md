---
title: "Cloud Network Security"
---

# Cloud Network Security

In this lesson, you will learn how to **protect your cloud infrastructure** at the network level — the first and most critical line of defense against cyberattacks.

Cloud network security is like building a fortress: you need walls, gates, guards, and surveillance cameras — all working together to keep your resources safe.

---

## Why Cloud Network Security Matters

Traditional on-premises networks had a clear boundary: a firewall at the edge, and everything inside was "trusted."

In the cloud, there is **no single perimeter**. Resources are distributed, APIs are exposed, and attackers are constantly probing for weaknesses.

**Key reasons cloud network security is critical:**

- Data breaches can cost millions of dollars
- Regulatory compliance requires network controls
- Cloud resources are accessible from the internet by default
- Misconfigurations are the #1 cause of cloud security incidents

---

## Network Security Layers

Cloud network security follows a **defense-in-depth** approach — multiple layers of protection so that if one layer fails, others still protect your resources.

### The Four Security Layers

| Layer | What It Protects | Examples |
|-------|-----------------|----------|
| **Perimeter** | The outer boundary of your cloud network | Firewalls, DDoS protection, WAF |
| **Network** | Communication between subnets and VPCs | Network ACLs, route tables, VPC peering rules |
| **Host** | Individual VMs and containers | Security groups, OS firewalls, endpoint protection |
| **Application** | Your running applications and APIs | TLS/SSL, API gateways, input validation |

Think of it like airport security:

- **Perimeter** = Airport fence and entrance gates
- **Network** = Passport control and customs
- **Host** = Boarding pass check at the gate
- **Application** = Checking carry-on bags at the scanner

### Defense in Depth Diagram

```
┌─────────────────────────────────────────────┐
│              PERIMETER LAYER                │
│   WAF ─── DDoS Protection ─── Edge FW      │
│  ┌───────────────────────────────────────┐  │
│  │          NETWORK LAYER                │  │
│  │   NACLs ─── Route Tables ─── Peering │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │        HOST LAYER               │  │  │
│  │  │   Security Groups ─── OS FW     │  │  │
│  │  │  ┌───────────────────────────┐  │  │  │
│  │  │  │   APPLICATION LAYER       │  │  │  │
│  │  │  │   TLS ─── API Gateway     │  │  │  │
│  │  │  └───────────────────────────┘  │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## Security Groups

A **security group** acts as a virtual firewall for your cloud resources (like EC2 instances, RDS databases, etc.). It controls **inbound** and **outbound** traffic at the instance level.

### Key Characteristics

| Feature | Behavior |
|---------|----------|
| **Level** | Instance (host) level |
| **State** | **Stateful** — return traffic is automatically allowed |
| **Default inbound** | Deny all |
| **Default outbound** | Allow all |
| **Rule type** | Allow rules only (no deny rules) |
| **Evaluation** | All rules evaluated together |

### What Does "Stateful" Mean?

If you allow **inbound** traffic on port 443, the **response** traffic is automatically allowed out — you don't need a separate outbound rule for it.

```
Client ──── Request (port 443) ────▶ Server
       ◀─── Response (auto-allowed) ── Server

Inbound rule: Allow port 443  ✅
Outbound rule: Not needed!    ✅ (stateful behavior)
```

### Security Group Rules

Each rule specifies:

- **Direction**: Inbound or Outbound
- **Protocol**: TCP, UDP, ICMP, or All
- **Port range**: Single port or range (e.g., 80 or 1024-65535)
- **Source/Destination**: CIDR block, another security group, or prefix list

### Example: Web Server Security Group

```
# Inbound Rules
┌──────────┬──────────┬────────────────┬─────────────────┐
│ Protocol │ Port     │ Source         │ Description     │
├──────────┼──────────┼────────────────┼─────────────────┤
│ TCP      │ 443      │ 0.0.0.0/0     │ HTTPS from all  │
│ TCP      │ 80       │ 0.0.0.0/0     │ HTTP from all   │
│ TCP      │ 22       │ 10.0.0.0/16   │ SSH from VPC    │
└──────────┴──────────┴────────────────┴─────────────────┘

# Outbound Rules
┌──────────┬──────────┬────────────────┬─────────────────┐
│ Protocol │ Port     │ Destination    │ Description     │
├──────────┼──────────┼────────────────┼─────────────────┤
│ All      │ All      │ 0.0.0.0/0     │ Allow all out   │
└──────────┴──────────┴────────────────┴─────────────────┘
```

### AWS Security Group (Terraform)

```hcl
resource "aws_security_group" "web_server" {
  name        = "web-server-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id

  # Allow HTTPS from anywhere
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }

  # Allow HTTP from anywhere
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }

  # Allow SSH from VPC only
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "SSH from VPC"
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "web-server-sg"
  }
}
```

### Security Group Best Practices

1. **Least privilege**: Only open ports that are absolutely necessary
2. **Use security group references**: Instead of CIDR blocks, reference other security groups
3. **No `0.0.0.0/0` for SSH/RDP**: Restrict management ports to known IPs
4. **Separate security groups by role**: Web servers, app servers, and databases should have different groups
5. **Document every rule**: Use the description field to explain why a rule exists

---

## Network ACLs (NACLs)

A **Network Access Control List (NACL)** is a firewall at the **subnet** level. It controls traffic entering and leaving an entire subnet.

### Security Groups vs. NACLs

| Feature | Security Group | NACL |
|---------|---------------|------|
| **Level** | Instance | Subnet |
| **State** | Stateful | **Stateless** |
| **Rules** | Allow only | Allow **and** Deny |
| **Evaluation** | All rules together | Rules in **order** (by number) |
| **Default** | Deny inbound, allow outbound | Allow all |
| **Association** | Multiple per instance | One per subnet |

### What Does "Stateless" Mean?

Unlike security groups, NACLs **don't remember** connections. You must explicitly allow **both** inbound and outbound traffic.

```
Client ──── Request (port 443) ────▶ Server
       ◀─── Response (port 49152) ── Server

Inbound rule:  Allow port 443        ✅
Outbound rule: Allow port 1024-65535 ✅ (MUST add this!)
```

> **Note:** Response traffic uses **ephemeral ports** (1024-65535). You must allow these in your outbound NACL rules.

### Rule Ordering

NACLs evaluate rules **in order**, starting from the lowest rule number. The first matching rule wins.

```
# NACL Inbound Rules (evaluated top to bottom)
┌──────┬────────┬──────┬────────────────┬────────┐
│ Rule │ Proto  │ Port │ Source         │ Action │
├──────┼────────┼──────┼────────────────┼────────┤
│ 100  │ TCP    │ 443  │ 0.0.0.0/0     │ ALLOW  │
│ 110  │ TCP    │ 80   │ 0.0.0.0/0     │ ALLOW  │
│ 120  │ TCP    │ 22   │ 10.0.0.0/16   │ ALLOW  │
│ 200  │ TCP    │ 22   │ 0.0.0.0/0     │ DENY   │
│ *    │ All    │ All  │ 0.0.0.0/0     │ DENY   │
└──────┴────────┴──────┴────────────────┴────────┘
```

In this example:
- Rule 120 allows SSH from the VPC (10.0.0.0/16)
- Rule 200 denies SSH from everywhere else
- Rule `*` is the default deny (catches everything not matched)

### NACL Best Practices

- Use **increments of 10 or 100** for rule numbers (100, 200, 300) so you can insert rules later
- Always remember to allow **ephemeral ports** (1024-65535) for outbound
- Use NACLs as a **coarse-grained** filter, and security groups for **fine-grained** control
- Keep NACL rules simple — complexity leads to mistakes

---

## Web Application Firewalls (WAF)

A **WAF** protects your web applications from common attacks like SQL injection, cross-site scripting (XSS), and bot traffic.

It operates at **Layer 7** (the application layer), inspecting HTTP/HTTPS requests before they reach your application.

### How WAF Works

```
User Request ──▶ WAF ──▶ Load Balancer ──▶ Application
                  │
                  ▼
         ┌───────────────┐
         │  Rule Engine   │
         │  - SQL Injection│
         │  - XSS          │
         │  - Rate Limiting│
         │  - Geo Blocking │
         └───────────────┘
         Block / Allow / Count
```

### WAF Services by Provider

| Provider | Service | Integrates With |
|----------|---------|-----------------|
| **AWS** | AWS WAF | CloudFront, ALB, API Gateway |
| **Azure** | Azure WAF | Application Gateway, Front Door |
| **GCP** | Cloud Armor | Cloud Load Balancing |

### AWS WAF Example

```json
{
  "Name": "block-sql-injection",
  "Priority": 1,
  "Action": { "Block": {} },
  "Statement": {
    "SqliMatchStatement": {
      "FieldToMatch": {
        "Body": {}
      },
      "TextTransformations": [
        {
          "Priority": 0,
          "Type": "URL_DECODE"
        },
        {
          "Priority": 1,
          "Type": "HTML_ENTITY_DECODE"
        }
      ]
    }
  },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "BlockSQLInjection"
  }
}
```

### Common WAF Rules

| Rule Type | Protects Against | Example |
|-----------|-----------------|---------|
| **SQL Injection** | Database attacks | `' OR 1=1 --` |
| **XSS** | Script injection | `<script>alert('xss')</script>` |
| **Rate Limiting** | Brute force / DDoS | >1000 requests/5 min |
| **Geo Blocking** | Unwanted regions | Block traffic from specific countries |
| **IP Reputation** | Known bad actors | AWS/Azure managed threat intelligence lists |
| **Bot Control** | Automated attacks | Block scrapers, credential stuffers |

---

## DDoS Protection

A **Distributed Denial of Service (DDoS)** attack floods your application with traffic to make it unavailable.

### DDoS Protection Services

| Provider | Service | Tier |
|----------|---------|------|
| **AWS** | AWS Shield Standard | Free (automatic) |
| **AWS** | AWS Shield Advanced | Paid ($3,000/month) |
| **Azure** | Azure DDoS Protection Basic | Free (automatic) |
| **Azure** | Azure DDoS Protection Standard | Paid |
| **GCP** | Cloud Armor Standard | Included |
| **GCP** | Cloud Armor Managed Protection Plus | Paid |

### What Each Tier Provides

```
Shield Standard (Free)           Shield Advanced (Paid)
─────────────────────           ──────────────────────
✅ Layer 3/4 protection          ✅ Layer 3/4/7 protection
✅ Automatic detection           ✅ Real-time visibility
✅ Inline mitigation             ✅ 24/7 DDoS Response Team
❌ No cost protection            ✅ Cost protection (credits)
❌ No visibility                 ✅ Advanced metrics
❌ No support                    ✅ WAF included at no cost
```

### Types of DDoS Attacks

| Layer | Attack Type | Example | Mitigation |
|-------|------------|---------|------------|
| **Layer 3** | Volumetric | UDP flood, ICMP flood | Shield/Armor automatic |
| **Layer 4** | Protocol | SYN flood, TCP reset | Shield/Armor automatic |
| **Layer 7** | Application | HTTP flood, slowloris | WAF rules, rate limiting |

---

## VPN Security

A **Virtual Private Network (VPN)** creates an encrypted tunnel between your on-premises network and your cloud VPC.

### VPN Types

| Type | Use Case | Connection |
|------|----------|------------|
| **Site-to-Site VPN** | Connect office network to cloud | IPsec tunnel over internet |
| **Client VPN** | Remote employees access cloud | OpenVPN/IKEv2 client software |
| **Transit VPN** | Connect multiple VPCs | Hub-and-spoke through transit gateway |

### Site-to-Site VPN Architecture

```
On-Premises                          Cloud VPC
┌──────────────┐     IPsec Tunnel    ┌──────────────┐
│              │ ═══════════════════ │              │
│  Customer    │     Encrypted       │  Virtual     │
│  Gateway     │     Connection      │  Private     │
│  Device      │                     │  Gateway     │
│              │ ═══════════════════ │              │
└──────────────┘   (Redundant)       └──────────────┘
  10.0.0.0/16                          172.16.0.0/16
```

### VPN Security Best Practices

1. **Use IKEv2** instead of IKEv1 for stronger encryption
2. **Enable Perfect Forward Secrecy (PFS)** to protect past sessions
3. **Use AES-256-GCM** encryption
4. **Rotate pre-shared keys** regularly
5. **Monitor VPN tunnel status** and set up alerts for tunnel failures
6. **Use redundant tunnels** for high availability

---

## Private Endpoints and PrivateLink

By default, many cloud services are accessed over the **public internet**. Private endpoints let you access them over your **private network** instead.

### The Problem

```
Without Private Endpoint:
EC2 Instance ──▶ Internet Gateway ──▶ Public Internet ──▶ S3 Bucket
                 (Traffic leaves your VPC!)

With Private Endpoint:
EC2 Instance ──▶ VPC Endpoint ──▶ S3 Bucket
                 (Traffic stays in AWS network!)
```

### Private Endpoint Services

| Provider | Service | Types |
|----------|---------|-------|
| **AWS** | VPC Endpoints | Gateway (S3, DynamoDB), Interface (most services) |
| **Azure** | Private Endpoints | Private Link for Azure services |
| **GCP** | Private Service Connect | Access Google APIs privately |

### AWS VPC Endpoint (Terraform)

```hcl
# Gateway endpoint for S3 (free)
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.us-east-1.s3"

  route_table_ids = [
    aws_route_table.private.id
  ]

  tags = {
    Name = "s3-vpc-endpoint"
  }
}

# Interface endpoint for Secrets Manager (charges apply)
resource "aws_vpc_endpoint" "secrets_manager" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.us-east-1.secretsmanager"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true

  subnet_ids = [
    aws_subnet.private_a.id,
    aws_subnet.private_b.id
  ]

  security_group_ids = [
    aws_security_group.vpc_endpoint.id
  ]

  tags = {
    Name = "secrets-manager-endpoint"
  }
}
```

---

## Network Segmentation

**Network segmentation** divides your cloud network into smaller, isolated segments to limit the blast radius of a security breach.

### Segmentation Strategies

| Strategy | How It Works | Example |
|----------|-------------|---------|
| **Subnet isolation** | Separate subnets for each tier | Public, private, database subnets |
| **VPC separation** | Separate VPCs for each environment | Dev VPC, Staging VPC, Prod VPC |
| **Account separation** | Separate cloud accounts | Security account, Shared Services account |
| **Region separation** | Resources in different regions | US data in us-east-1, EU data in eu-west-1 |

### Three-Tier Architecture Example

```
┌─────────────────────────────────────────────────┐
│                    VPC (10.0.0.0/16)            │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Public Subnet (10.0.1.0/24)             │   │
│  │  ┌─────────┐  ┌─────────┐               │   │
│  │  │  ALB    │  │  NAT GW │               │   │
│  │  └─────────┘  └─────────┘               │   │
│  └──────────────────────────────────────────┘   │
│                      │                           │
│  ┌──────────────────────────────────────────┐   │
│  │  Private Subnet (10.0.2.0/24)            │   │
│  │  ┌─────────┐  ┌─────────┐               │   │
│  │  │  App 1  │  │  App 2  │               │   │
│  │  └─────────┘  └─────────┘               │   │
│  └──────────────────────────────────────────┘   │
│                      │                           │
│  ┌──────────────────────────────────────────┐   │
│  │  Database Subnet (10.0.3.0/24)           │   │
│  │  ┌─────────┐  ┌─────────┐               │   │
│  │  │  RDS    │  │  Redis  │               │   │
│  │  └─────────┘  └─────────┘               │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## Micro-Segmentation

**Micro-segmentation** goes beyond network segmentation by applying security policies at the **workload level** — controlling traffic between individual applications, containers, or services.

### Network Segmentation vs. Micro-Segmentation

| Feature | Network Segmentation | Micro-Segmentation |
|---------|---------------------|-------------------|
| **Scope** | Subnet / VPC level | Workload / container level |
| **Granularity** | Coarse | Fine-grained |
| **Policy basis** | IP addresses, ports | Identity, labels, tags |
| **East-west traffic** | Limited control | Full control |
| **Dynamic workloads** | Hard to manage | Adapts automatically |

### Example: Kubernetes Network Policy

```yaml
# Only allow web pods to talk to API pods on port 8080
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web-to-api
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api-server
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: web-frontend
      ports:
        - protocol: TCP
          port: 8080
```

### Zero Trust Networking

Micro-segmentation is a key component of **Zero Trust Architecture**:

- **Never trust, always verify** — even traffic inside the network
- **Verify every connection** based on identity, not network location
- **Least privilege access** — only allow what is explicitly needed
- **Assume breach** — limit blast radius with segmentation

---

## Network Monitoring and Threat Detection

You can't protect what you can't see. **Network monitoring** gives you visibility into traffic patterns and helps detect threats.

### Flow Logs

Flow logs capture information about IP traffic going to and from network interfaces.

| Provider | Service | What It Captures |
|----------|---------|-----------------|
| **AWS** | VPC Flow Logs | Source/dest IP, ports, protocol, action, bytes |
| **Azure** | NSG Flow Logs | Similar to AWS, plus MAC addresses |
| **GCP** | VPC Flow Logs | Sampled network flows with metadata |

### AWS VPC Flow Log Example

```
# Format: version account-id interface-id srcaddr dstaddr srcport dstport protocol packets bytes start end action log-status

2 123456789012 eni-abc123 10.0.1.5 10.0.2.10 49152 443 6 25 5000 1620140661 1620140721 ACCEPT OK
2 123456789012 eni-abc123 203.0.113.5 10.0.1.5 12345 22 6 5 300 1620140661 1620140721 REJECT OK
```

Reading the log:
- **Line 1**: Internal traffic from 10.0.1.5 to 10.0.2.10 on port 443 — **ACCEPTED**
- **Line 2**: External traffic from 203.0.113.5 to 10.0.1.5 on port 22 (SSH) — **REJECTED** ✅

### Enabling VPC Flow Logs (Terraform)

```hcl
resource "aws_flow_log" "vpc_flow_log" {
  vpc_id                = aws_vpc.main.id
  traffic_type          = "ALL"
  log_destination       = aws_s3_bucket.flow_logs.arn
  log_destination_type  = "s3"
  max_aggregation_interval = 60

  tags = {
    Name = "vpc-flow-logs"
  }
}

resource "aws_s3_bucket" "flow_logs" {
  bucket = "my-vpc-flow-logs-bucket"

  tags = {
    Name = "VPC Flow Logs"
  }
}
```

### Threat Detection Services

| Provider | Service | What It Detects |
|----------|---------|----------------|
| **AWS** | GuardDuty | Malicious IPs, crypto mining, compromised instances |
| **Azure** | Microsoft Defender for Cloud | Vulnerabilities, threats, misconfigurations |
| **GCP** | Security Command Center | Threats, vulnerabilities, misconfigurations |

---

## Putting It All Together

Here's how all the network security layers work together:

```
Internet
    │
    ▼
┌─── DDoS Protection (Shield/Armor) ───┐
│                                        │
│   ┌─── WAF (SQL injection, XSS) ───┐ │
│   │                                  │ │
│   │   ┌─── NACL (Subnet level) ──┐  │ │
│   │   │                          │  │ │
│   │   │  ┌─── Security Group ─┐  │  │ │
│   │   │  │                    │  │  │ │
│   │   │  │   Your Application │  │  │ │
│   │   │  │                    │  │  │ │
│   │   │  └────────────────────┘  │  │ │
│   │   └──────────────────────────┘  │ │
│   └──────────────────────────────────┘ │
└────────────────────────────────────────┘
         │
    ┌────┴────┐
    │ Flow    │
    │ Logs    │──▶ Threat Detection
    └─────────┘
```

---

## Exercises

### Exercise 1: Design Security Groups

Design security groups for a three-tier web application:

1. **Web tier**: Receives HTTPS traffic from the internet
2. **App tier**: Receives traffic only from the web tier on port 8080
3. **Database tier**: Receives traffic only from the app tier on port 5432 (PostgreSQL)

Write the inbound rules for each security group.

<details>
<summary>Solution</summary>

```
Web Tier SG (Inbound):
  - TCP 443 from 0.0.0.0/0  (HTTPS from internet)
  - TCP 80  from 0.0.0.0/0  (HTTP from internet)

App Tier SG (Inbound):
  - TCP 8080 from Web-Tier-SG  (App traffic from web tier)

Database Tier SG (Inbound):
  - TCP 5432 from App-Tier-SG  (PostgreSQL from app tier)
```

Key points:
- Use **security group references** instead of CIDR blocks for internal traffic
- Each tier only allows traffic from the tier above it
- The database is **never** directly accessible from the internet
</details>

### Exercise 2: NACL Rule Ordering

Given these NACL rules, determine if SSH traffic from `10.0.1.50` is allowed:

```
Rule 100: ALLOW TCP 443 from 0.0.0.0/0
Rule 150: DENY  TCP 22  from 10.0.0.0/8
Rule 200: ALLOW TCP 22  from 10.0.1.0/24
Rule *:   DENY  All     from 0.0.0.0/0
```

<details>
<summary>Solution</summary>

**SSH is DENIED.**

NACLs evaluate rules in order. Rule 150 (DENY TCP 22 from 10.0.0.0/8) matches first because:
- 10.0.1.50 is within 10.0.0.0/8
- Rule 150 comes before Rule 200

Rule 200 never gets evaluated. To fix this, **reorder** the rules so Rule 200 comes before Rule 150.
</details>

### Exercise 3: Security Audit

Your team discovers the following security group rule on a production database:

```
Inbound: TCP 3306 from 0.0.0.0/0 (MySQL)
```

1. What is wrong with this rule?
2. What risks does it create?
3. How would you fix it?

<details>
<summary>Solution</summary>

1. **Problem**: MySQL (port 3306) is open to the **entire internet**
2. **Risks**: Brute-force attacks, data exfiltration, unauthorized access, compliance violations
3. **Fix**:
   - Change source to the **application security group** only
   - Move the database to a **private subnet** with no internet gateway
   - Enable **VPC Flow Logs** to monitor access attempts
   - Consider adding a **VPC endpoint** for any AWS services that need access
</details>

---

## Key Takeaways

| Concept | Remember |
|---------|----------|
| **Security Groups** | Stateful, instance-level, allow-only rules |
| **NACLs** | Stateless, subnet-level, allow and deny, order matters |
| **WAF** | Layer 7 protection against SQL injection, XSS, bots |
| **DDoS Protection** | AWS Shield / Azure DDoS / Cloud Armor |
| **Private Endpoints** | Keep traffic off the public internet |
| **Network Segmentation** | Isolate tiers into separate subnets |
| **Micro-Segmentation** | Workload-level policies, Zero Trust |
| **Flow Logs** | Visibility into all network traffic |
| **Defense in Depth** | Multiple layers — never rely on just one |

---

## Summary

- Cloud network security requires **multiple layers** of defense working together
- **Security groups** are your primary instance-level firewall (stateful, allow-only)
- **NACLs** provide subnet-level filtering (stateless, rule ordering matters)
- **WAFs** protect against application-layer attacks like SQL injection and XSS
- **DDoS protection** services are available at free and paid tiers
- **Private endpoints** keep traffic on the cloud provider's backbone network
- **Network segmentation** limits the blast radius of breaches
- **Micro-segmentation** brings Zero Trust to the workload level
- **Flow Logs** and **threat detection** services provide visibility and alerting
- Always follow the principle of **least privilege** in your network rules
