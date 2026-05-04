---
title: "Cloud Networking Fundamentals"
---

# Cloud Networking Fundamentals

Networking is the **backbone of every cloud architecture**. Whether you're deploying a simple web app or a complex microservices platform, understanding how cloud networking works is essential.

In this lesson, we review core networking concepts, then explore how they translate to **cloud-native networking** with VPCs, subnets, security groups, peering, and hybrid connectivity.

---

## Networking Basics Review

Before diving into cloud networking, let's ensure you understand the fundamentals.

### IP Addresses

Every device on a network has an **IP address** — a unique identifier used to route traffic.

| Version | Format | Example | Address Space |
|---------|--------|---------|---------------|
| IPv4 | 4 octets (32 bits) | `192.168.1.10` | ~4.3 billion |
| IPv6 | 8 groups of hex (128 bits) | `2001:0db8:85a3::8a2e:0370:7334` | ~340 undecillion |

**Public vs. Private IP Addresses:**

| Type | Range (IPv4) | Use |
|------|-------------|-----|
| Public | Routable on the internet | Web servers, APIs |
| Private (Class A) | `10.0.0.0` – `10.255.255.255` | Large networks |
| Private (Class B) | `172.16.0.0` – `172.31.255.255` | Medium networks |
| Private (Class C) | `192.168.0.0` – `192.168.255.255` | Small / home networks |

> **Key Rule:** Private IP addresses are **not routable** on the public internet. You need a NAT gateway or public IP to reach the internet from a private address.

---

### Subnets and CIDR Notation

A **subnet** divides a network into smaller segments. **CIDR (Classless Inter-Domain Routing)** notation specifies the size of a subnet.

```
CIDR Format:  <network address> / <prefix length>

Example:  10.0.0.0/16

  10.0.0.0   = Network address
  /16        = First 16 bits are the network portion
             = Remaining 16 bits for host addresses
             = 2^16 = 65,536 possible addresses
```

**Common CIDR Blocks:**

| CIDR | Subnet Mask | Available IPs | Use Case |
|------|-------------|---------------|----------|
| `/8` | 255.0.0.0 | 16,777,216 | Very large networks |
| `/16` | 255.255.0.0 | 65,536 | VPC-level networks |
| `/24` | 255.255.255.0 | 256 | Individual subnets |
| `/28` | 255.255.255.240 | 16 | Small subnets |
| `/32` | 255.255.255.255 | 1 | Single host |

**Calculating available hosts:**

```
Available IPs = 2^(32 - prefix) - reserved addresses

Example: 10.0.1.0/24
  Total IPs = 2^(32-24) = 2^8 = 256
  Reserved  = 5 (in AWS: network, gateway, DNS, future, broadcast)
  Usable    = 251 host addresses
```

> **Cloud Gotcha:** Cloud providers reserve several IPs per subnet (typically 5 in AWS, 5 in Azure, 4 in GCP). Always account for this when sizing subnets.

---

### TCP, UDP, and Ports

**TCP (Transmission Control Protocol)** and **UDP (User Datagram Protocol)** are the primary transport protocols.

| Feature | TCP | UDP |
|---------|-----|-----|
| Connection | Connection-oriented (handshake) | Connectionless |
| Reliability | Guaranteed delivery, ordering | Best-effort, no guarantees |
| Speed | Slower (overhead) | Faster (minimal overhead) |
| Use Cases | HTTP, SSH, databases, email | DNS, streaming, gaming, VoIP |

**Common Port Numbers:**

| Port | Protocol | Service |
|------|----------|---------|
| 22 | TCP | SSH |
| 53 | TCP/UDP | DNS |
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |
| 3306 | TCP | MySQL |
| 5432 | TCP | PostgreSQL |
| 6379 | TCP | Redis |
| 27017 | TCP | MongoDB |

---

### DNS (Domain Name System)

DNS translates **human-readable domain names** to IP addresses.

```
DNS Resolution Flow:

User types: www.example.com
     │
     ▼
┌──────────────┐     ┌──────────────┐
│  Browser     │────►│ Recursive    │
│  Cache       │     │ DNS Resolver │
└──────────────┘     └──────┬───────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                  ▼
    ┌───────────┐   ┌──────────────┐   ┌────────────┐
    │ Root DNS  │   │ TLD Server   │   │ Auth DNS   │
    │ Server    │──►│ (.com)       │──►│ Server     │
    │ (.)       │   │              │   │            │
    └───────────┘   └──────────────┘   └──────┬─────┘
                                              │
                                    Returns: 93.184.216.34
```

**DNS Record Types:**

| Type | Purpose | Example |
|------|---------|---------|
| A | Maps domain to IPv4 | `example.com → 93.184.216.34` |
| AAAA | Maps domain to IPv6 | `example.com → 2606:2800:...` |
| CNAME | Alias to another domain | `www.example.com → example.com` |
| MX | Mail server | `example.com → mail.example.com` |
| TXT | Text records (SPF, DKIM) | `v=spf1 include:_spf.google.com` |
| NS | Name server | `example.com → ns1.provider.com` |

---

### HTTP and HTTPS

| Feature | HTTP | HTTPS |
|---------|------|-------|
| Port | 80 | 443 |
| Encryption | None | TLS/SSL |
| Security | Insecure (data in plaintext) | Encrypted (data protected) |
| Certificate | Not required | TLS certificate required |

> **Best Practice:** Always use HTTPS in cloud environments. Cloud providers offer free or low-cost TLS certificates (AWS ACM, Azure App Service Managed Certs, GCP-managed SSL).

---

## Cloud Networking Concepts

Now let's see how these fundamentals apply in the cloud.

### VPC / VNet — Your Private Cloud Network

A **Virtual Private Cloud (VPC)** is an isolated, private network within the cloud provider's infrastructure. You have full control over IP ranges, subnets, routing, and security.

| Provider | Name | Key Feature |
|----------|------|-------------|
| AWS | VPC | Most mature, very flexible |
| Azure | VNet (Virtual Network) | Integrates with Azure AD and on-prem |
| GCP | VPC | Global by default (subnets are regional) |

```
VPC Structure:

┌─────────────────────────────────────────────────┐
│                  VPC: 10.0.0.0/16               │
│                                                  │
│  ┌─────────────────────┐ ┌─────────────────────┐ │
│  │  Availability Zone A │ │  Availability Zone B │ │
│  │                     │ │                      │ │
│  │  ┌───────────────┐  │ │  ┌───────────────┐   │ │
│  │  │ Public Subnet │  │ │  │ Public Subnet │   │ │
│  │  │ 10.0.1.0/24   │  │ │  │ 10.0.3.0/24   │   │ │
│  │  └───────────────┘  │ │  └───────────────┘   │ │
│  │                     │ │                      │ │
│  │  ┌───────────────┐  │ │  ┌───────────────┐   │ │
│  │  │ Private Subnet│  │ │  │ Private Subnet│   │ │
│  │  │ 10.0.2.0/24   │  │ │  │ 10.0.4.0/24   │   │ │
│  │  └───────────────┘  │ │  └───────────────┘   │ │
│  └─────────────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

### Public vs. Private Subnets

The distinction between **public** and **private** subnets is one of the most important networking concepts in the cloud.

| Feature | Public Subnet | Private Subnet |
|---------|---------------|----------------|
| Internet Access | Direct (via Internet Gateway) | Indirect (via NAT Gateway) or none |
| Public IP | Instances can have public IPs | Instances have private IPs only |
| Typical Resources | Load balancers, bastion hosts, NAT gateways | App servers, databases, caches |
| Security | More exposed | More isolated |

> **Best Practice:** Place databases, application servers, and sensitive workloads in **private subnets**. Only expose load balancers and bastion hosts in public subnets.

---

### Internet Gateways and NAT Gateways

**Internet Gateway (IGW):**

- Allows resources in **public subnets** to communicate with the internet
- Provides a target in your route table for internet-bound traffic
- Performs NAT for instances with public IP addresses
- One IGW per VPC

**NAT Gateway:**

- Allows resources in **private subnets** to initiate outbound connections to the internet
- Prevents unsolicited inbound connections from the internet
- Placed in a **public subnet** but serves private subnets
- Managed service (no patching required)

```
Traffic Flow:

Internet ◄──► Internet Gateway ◄──► Public Subnet (Web Servers)
                                          │
                                     NAT Gateway
                                          │
                                    Private Subnet (App Servers, DBs)
```

```
Route Tables:

Public Subnet Route Table:
┌──────────────────┬───────────────────┐
│   Destination    │   Target          │
├──────────────────┼───────────────────┤
│   10.0.0.0/16    │   local           │
│   0.0.0.0/0      │   igw-xxxxxxxx    │
└──────────────────┴───────────────────┘

Private Subnet Route Table:
┌──────────────────┬───────────────────┐
│   Destination    │   Target          │
├──────────────────┼───────────────────┤
│   10.0.0.0/16    │   local           │
│   0.0.0.0/0      │   nat-xxxxxxxx    │
└──────────────────┴───────────────────┘
```

---

### Network Security: ACLs vs. Security Groups

Cloud providers offer **two layers** of network security:

| Feature | Network ACL (NACL) | Security Group (SG) |
|---------|--------------------|---------------------|
| Level | Subnet level | Instance / resource level |
| State | **Stateless** (must define inbound AND outbound rules) | **Stateful** (return traffic auto-allowed) |
| Rules | Allow AND Deny rules | Allow rules only (implicit deny) |
| Evaluation | Rules processed in order (by number) | All rules evaluated together |
| Default | Allow all inbound/outbound | Deny all inbound, allow all outbound |

**Security Group Example:**

```
Web Server Security Group:

Inbound Rules:
┌──────────┬──────────┬────────────┬───────────────┐
│  Type    │ Protocol │ Port Range │  Source        │
├──────────┼──────────┼────────────┼───────────────┤
│  HTTP    │  TCP     │  80        │  0.0.0.0/0    │
│  HTTPS   │  TCP     │  443       │  0.0.0.0/0    │
│  SSH     │  TCP     │  22        │  10.0.0.0/16  │
└──────────┴──────────┴────────────┴───────────────┘

Outbound Rules:
┌──────────┬──────────┬────────────┬───────────────┐
│  Type    │ Protocol │ Port Range │  Destination   │
├──────────┼──────────┼────────────┼───────────────┤
│  All     │  All     │  All       │  0.0.0.0/0    │
└──────────┴──────────┴────────────┴───────────────┘

Database Security Group:

Inbound Rules:
┌──────────┬──────────┬────────────┬───────────────┐
│  Type    │ Protocol │ Port Range │  Source        │
├──────────┼──────────┼────────────┼───────────────┤
│ PostgreSQL│  TCP    │  5432      │  sg-webserver  │
└──────────┴──────────┴────────────┴───────────────┘
```

> **Best Practice:** Use security groups as your primary firewall. Reference other security groups as sources (e.g., allow traffic from the "web server" SG to the "database" SG) instead of hard-coding IP addresses.

---

### VPC Peering

**VPC Peering** creates a private network connection between two VPCs, allowing resources in each to communicate using private IP addresses.

```
VPC Peering:

┌─────────────────┐          ┌─────────────────┐
│ VPC A           │          │ VPC B           │
│ 10.0.0.0/16     │◄────────►│ 10.1.0.0/16     │
│                 │  Peering │                 │
│ ┌─────────────┐ │Connection│ ┌─────────────┐ │
│ │ App Server  │ │          │ │ Database    │ │
│ │ 10.0.1.10   │─┼──────────┼─│ 10.1.2.20  │ │
│ └─────────────┘ │          │ └─────────────┘ │
└─────────────────┘          └─────────────────┘
```

**Key Rules:**

- CIDR blocks must **not overlap** between peered VPCs
- Peering is **not transitive** — if VPC A peers with B, and B peers with C, A cannot reach C through B
- Works **cross-account** and **cross-region** (with some limitations)

---

### Transit Gateways

For complex architectures with many VPCs, **Transit Gateway** acts as a central hub.

```
Without Transit Gateway:          With Transit Gateway:

  A ◄──► B                          A ──┐
  A ◄──► C                          B ──┤
  A ◄──► D                          C ──┼──► Transit Gateway
  B ◄──► C                          D ──┤
  B ◄──► D                          E ──┘
  C ◄──► D
                                   All VPCs connect through
  (10 peering connections           one central hub
   for 5 VPCs!)                    (5 connections for 5 VPCs)
```

| Provider | Service |
|----------|---------|
| AWS | Transit Gateway |
| Azure | Virtual WAN / VNet Hub |
| GCP | Network Connectivity Center |

---

## Hybrid Connectivity

Most enterprises need to connect their cloud environment to **on-premises data centers**.

### VPN (Virtual Private Network)

Creates an **encrypted tunnel** over the public internet between your on-premises network and your cloud VPC.

| Feature | Details |
|---------|---------|
| Bandwidth | Limited by internet connection (typically < 1 Gbps) |
| Latency | Variable (depends on internet path) |
| Encryption | IPsec |
| Setup Time | Minutes to hours |
| Cost | Low (no physical infrastructure) |
| Redundancy | Set up two tunnels for failover |

```
VPN Connection:

On-Premises                          Cloud VPC
┌────────────┐    Encrypted Tunnel    ┌────────────┐
│            │   ╔════════════════╗   │            │
│  Customer  │───║  IPsec VPN     ║───│  Virtual   │
│  Gateway   │   ║  (over public  ║   │  Private   │
│            │   ║   internet)    ║   │  Gateway   │
└────────────┘   ╚════════════════╝   └────────────┘
```

### Direct Connect / ExpressRoute / Cloud Interconnect

A **dedicated, private connection** between your on-premises data center and the cloud provider — bypassing the public internet entirely.

| Feature | AWS Direct Connect | Azure ExpressRoute | GCP Cloud Interconnect |
|---------|--------------------|--------------------|------------------------|
| Bandwidth | 1 – 100 Gbps | 50 Mbps – 100 Gbps | 10 – 200 Gbps |
| Latency | Consistent, low | Consistent, low | Consistent, low |
| Encryption | Not encrypted by default | Not encrypted by default | Not encrypted by default |
| Setup Time | Weeks to months | Weeks to months | Weeks to months |
| Cost | Higher (dedicated line) | Higher (dedicated line) | Higher (dedicated line) |

> **Tip:** Layer a VPN on top of Direct Connect/ExpressRoute for **encryption** — the dedicated connection itself is private but not encrypted.

### When to Use VPN vs. Dedicated Connection

| Scenario | Recommendation |
|----------|----------------|
| Proof of concept / dev environment | VPN |
| Low bandwidth needs (< 500 Mbps) | VPN |
| Latency-sensitive production workloads | Dedicated connection |
| High bandwidth (> 1 Gbps sustained) | Dedicated connection |
| Compliance requiring private connectivity | Dedicated connection |
| Budget-conscious with moderate needs | VPN with failover |

---

## Cloud DNS Services

Each cloud provider offers a managed DNS service:

| Provider | Service | Key Features |
|----------|---------|-------------|
| AWS | Route 53 | Health checks, routing policies (latency, geolocation, weighted, failover) |
| Azure | Azure DNS | Private DNS zones, alias records, Azure integration |
| GCP | Cloud DNS | 100% SLA, DNSSEC support, global anycast |

**Common DNS Patterns in the Cloud:**

```
Public DNS:
  www.myapp.com → Load Balancer public IP → Web servers

Private DNS:
  db.internal.myapp.com → Private IP of database (10.0.2.50)
  cache.internal.myapp.com → Private IP of Redis (10.0.2.60)

Split-horizon DNS:
  Internal query: api.myapp.com → 10.0.1.100 (private)
  External query: api.myapp.com → 52.xxx.xxx.xxx (public)
```

---

## Network Design Best Practices

### 1. Plan Your CIDR Blocks Carefully

```
Good CIDR Planning:

Production VPC:  10.0.0.0/16   (65,536 IPs)
  ├── Public:    10.0.0.0/20   (4,096 IPs)
  ├── App:       10.0.16.0/20  (4,096 IPs)
  ├── Database:  10.0.32.0/20  (4,096 IPs)
  └── Reserved:  10.0.48.0/20  (future use)

Staging VPC:     10.1.0.0/16
Dev VPC:         10.2.0.0/16
On-Premises:     172.16.0.0/12

⚠️ No overlapping ranges!
```

### 2. Use Multiple Availability Zones

Deploy subnets across at least **two AZs** for high availability.

### 3. Apply the Principle of Least Privilege

- Default deny all inbound traffic
- Open only required ports to required sources
- Use security group references instead of IP ranges where possible

### 4. Use Private Subnets for Sensitive Resources

Databases, caches, and application servers should **never** be directly accessible from the internet.

### 5. Enable VPC Flow Logs

Monitor and audit all network traffic for security and troubleshooting:

```
VPC Flow Log Entry Example:

2 123456789012 eni-abc123 10.0.1.10 52.94.76.5 443 49152 6 25 5000 1620140661 1620140721 ACCEPT OK

Fields: version account-id interface source-ip dest-ip dest-port src-port protocol packets bytes start end action log-status
```

### 6. Use Endpoints for Cloud Services

Instead of routing traffic to cloud services (S3, DynamoDB) through the internet, use **VPC Endpoints** / **Private Links** to keep traffic within the cloud provider's network.

```
Without VPC Endpoint:
  EC2 → NAT Gateway → Internet → S3  (slower, costs more)

With VPC Endpoint:
  EC2 → VPC Endpoint → S3  (private, faster, cheaper)
```

---

## Practical Exercise: Design a VPC

### Scenario

You need to design a VPC for a three-tier web application:

- **Web Tier** — Load balancer + web servers (internet-facing)
- **App Tier** — Application servers (no direct internet access)
- **Data Tier** — PostgreSQL database + Redis cache (most restricted)

Requirements:
- Deploy across 2 availability zones for high availability
- Web servers need internet access (inbound and outbound)
- App servers need outbound internet access only (for package updates)
- Database should have no internet access at all

### Solution

```
VPC: 10.0.0.0/16

┌─────────────────────────────────────────────────────────────┐
│                         VPC                                  │
│                                                              │
│  ┌───────────────────────────┐ ┌───────────────────────────┐ │
│  │     Availability Zone A   │ │     Availability Zone B   │ │
│  │                           │ │                           │ │
│  │  ┌─────────────────────┐  │ │  ┌─────────────────────┐  │ │
│  │  │  Public Subnet      │  │ │  │  Public Subnet      │  │ │
│  │  │  10.0.1.0/24        │  │ │  │  10.0.2.0/24        │  │ │
│  │  │  [ALB] [NAT GW]     │  │ │  │  [ALB] [NAT GW]     │  │ │
│  │  └─────────────────────┘  │ │  └─────────────────────┘  │ │
│  │                           │ │                           │ │
│  │  ┌─────────────────────┐  │ │  ┌─────────────────────┐  │ │
│  │  │  App Subnet         │  │ │  │  App Subnet         │  │ │
│  │  │  10.0.11.0/24       │  │ │  │  10.0.12.0/24       │  │ │
│  │  │  [App Server]       │  │ │  │  [App Server]       │  │ │
│  │  └─────────────────────┘  │ │  └─────────────────────┘  │ │
│  │                           │ │                           │ │
│  │  ┌─────────────────────┐  │ │  ┌─────────────────────┐  │ │
│  │  │  Data Subnet        │  │ │  │  Data Subnet        │  │ │
│  │  │  10.0.21.0/24       │  │ │  │  10.0.22.0/24       │  │ │
│  │  │  [PostgreSQL]       │  │ │  │  [Redis Replica]    │  │ │
│  │  │  [Redis Primary]    │  │ │  │  [PostgreSQL Stdby] │  │ │
│  │  └─────────────────────┘  │ │  └─────────────────────┘  │ │
│  └───────────────────────────┘ └───────────────────────────┘ │
│                                                              │
│  Internet Gateway: igw-xxxxxxxx                              │
└─────────────────────────────────────────────────────────────┘
```

### Security Groups

```
SG: web-alb-sg
  Inbound:  TCP 80  from 0.0.0.0/0
            TCP 443 from 0.0.0.0/0
  Outbound: All traffic

SG: app-server-sg
  Inbound:  TCP 8080 from web-alb-sg
            TCP 22   from bastion-sg
  Outbound: All traffic

SG: database-sg
  Inbound:  TCP 5432 from app-server-sg
  Outbound: All traffic (to same VPC only)

SG: cache-sg
  Inbound:  TCP 6379 from app-server-sg
  Outbound: All traffic (to same VPC only)
```

### Route Tables

```
Public Subnet Route Table:
  10.0.0.0/16  → local
  0.0.0.0/0    → igw-xxxxxxxx     (Internet Gateway)

App Subnet Route Table:
  10.0.0.0/16  → local
  0.0.0.0/0    → nat-xxxxxxxx     (NAT Gateway)

Data Subnet Route Table:
  10.0.0.0/16  → local
  (No default route — no internet access)
```

---

## Exercises

### Exercise 1: CIDR Calculation

Calculate the following:

1. How many usable IPs in a `/24` subnet (after reserving 5 for AWS)?
2. How many usable IPs in a `/20` subnet?
3. Can `10.0.0.0/16` and `10.0.5.0/24` overlap? Why?
4. Design a CIDR scheme for 3 VPCs that can be peered (no overlapping ranges).

<details>
<summary>View Answers</summary>

1. `2^(32-24) - 5 = 256 - 5 = 251` usable IPs
2. `2^(32-20) - 5 = 4096 - 5 = 4091` usable IPs
3. **Yes**, they overlap. `10.0.5.0/24` is a subset of `10.0.0.0/16` — the `/16` range covers `10.0.0.0` to `10.0.255.255`, which includes `10.0.5.0/24`.
4. Example:
   - VPC-1: `10.0.0.0/16` (10.0.0.0 – 10.0.255.255)
   - VPC-2: `10.1.0.0/16` (10.1.0.0 – 10.1.255.255)
   - VPC-3: `10.2.0.0/16` (10.2.0.0 – 10.2.255.255)

</details>

### Exercise 2: Security Group Rules

Write security group rules for this scenario:

- A Node.js API server (port 3000) that should only accept traffic from an ALB
- The ALB accepts HTTPS (443) from anywhere
- A MongoDB database (port 27017) that only the API server can access
- SSH (port 22) access to the API server from a bastion host in `10.0.0.0/24`

<details>
<summary>View Answers</summary>

```
SG: alb-sg
  Inbound:  TCP 443 from 0.0.0.0/0
  Outbound: TCP 3000 to api-sg

SG: api-sg
  Inbound:  TCP 3000 from alb-sg
            TCP 22   from 10.0.0.0/24
  Outbound: TCP 27017 to mongo-sg
            TCP 443  to 0.0.0.0/0 (for external API calls)

SG: mongo-sg
  Inbound:  TCP 27017 from api-sg
  Outbound: None needed (stateful — responses auto-allowed)
```

</details>

### Exercise 3: Network Troubleshooting

Your application in a private subnet can't reach the internet to download packages. What should you check? List 5 potential causes.

<details>
<summary>View Answers</summary>

1. **NAT Gateway missing** — Is there a NAT Gateway in the public subnet?
2. **Route table** — Does the private subnet's route table have `0.0.0.0/0 → nat-gateway`?
3. **NAT Gateway subnet** — Is the NAT Gateway in a public subnet with a route to an Internet Gateway?
4. **Security group outbound rules** — Do the instance's SG outbound rules allow traffic on ports 80/443?
5. **Network ACL** — Does the subnet's NACL allow outbound traffic AND the return inbound traffic (NACLs are stateless)?

</details>

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| **VPC/VNet** | Your isolated private network in the cloud; you control CIDR, subnets, and routing |
| **Public vs. Private Subnets** | Public subnets route to an Internet Gateway; private subnets use NAT or have no internet |
| **Security Groups** | Stateful instance-level firewalls; allow rules only, implicit deny |
| **Network ACLs** | Stateless subnet-level firewalls; allow AND deny rules, processed in order |
| **VPC Peering** | Private connectivity between VPCs; non-transitive, CIDRs must not overlap |
| **Transit Gateway** | Hub-and-spoke model for connecting many VPCs |
| **VPN** | Encrypted tunnel over the internet; quick setup, variable performance |
| **Direct Connect** | Dedicated private line; consistent performance, higher cost, longer setup |
| **VPC Endpoints** | Keep traffic to cloud services private (no internet traversal) |
| **CIDR Planning** | Plan non-overlapping ranges upfront; leave room for growth |

---

## What's Next?

In the next lesson, we'll explore **Cloud Storage Services** — learning about object storage, block storage, file storage, and how to choose the right storage type for your workload.
