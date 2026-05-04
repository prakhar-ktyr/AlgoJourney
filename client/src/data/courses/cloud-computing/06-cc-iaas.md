---
title: "Infrastructure as a Service (IaaS)"
---

## What Is IaaS?

**Infrastructure as a Service (IaaS)** is a cloud computing model that provides virtualized computing resources over the internet. Instead of buying and maintaining physical servers, storage, and networking equipment, you rent these resources from a cloud provider on a **pay-as-you-go** basis.

Think of IaaS like renting an unfurnished apartment. The landlord provides the building (physical infrastructure), but you bring your own furniture (operating system, applications, data). You have full control over what goes inside, but you don't worry about the foundation, plumbing, or electrical wiring.

### IaaS in Simple Terms

| Traditional IT | IaaS |
|---|---|
| Buy physical servers | Rent virtual servers |
| Maintain a data center | Provider manages the data center |
| Upfront capital expense | Ongoing operational expense |
| Weeks to provision | Minutes to provision |
| Fixed capacity | Elastic capacity |

---

## How IaaS Works

IaaS providers operate massive data centers around the world. They use **virtualization technology** to divide physical hardware into multiple virtual machines (VMs) that customers can use independently.

### The IaaS Architecture

```
┌─────────────────────────────────────────────┐
│              Your Responsibility             │
│  ┌─────────────────────────────────────────┐ │
│  │  Applications                           │ │
│  ├─────────────────────────────────────────┤ │
│  │  Data                                   │ │
│  ├─────────────────────────────────────────┤ │
│  │  Runtime / Middleware                   │ │
│  ├─────────────────────────────────────────┤ │
│  │  Operating System                       │ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│           Provider's Responsibility          │
│  ┌─────────────────────────────────────────┐ │
│  │  Virtualization                         │ │
│  ├─────────────────────────────────────────┤ │
│  │  Servers (Physical)                     │ │
│  ├─────────────────────────────────────────┤ │
│  │  Storage (Physical)                     │ │
│  ├─────────────────────────────────────────┤ │
│  │  Networking (Physical)                  │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### The Provisioning Flow

1. You request resources through a **web console**, **CLI**, or **API**
2. The provider allocates virtual resources from its physical pool
3. An **operating system image** is loaded onto the virtual machine
4. You receive **connection credentials** (SSH key, IP address)
5. You install and configure your software stack
6. You manage everything from the OS upward

---

## Core Components of IaaS

### 1. Compute

Compute is the virtual processing power — your **virtual machines (VMs)**.

| Feature | Description |
|---|---|
| **vCPUs** | Virtual CPU cores allocated to your VM |
| **RAM** | Memory available to your workload |
| **Instance types** | Pre-configured combinations (e.g., compute-optimized, memory-optimized) |
| **Auto-scaling** | Automatically add/remove VMs based on demand |
| **Bare metal** | Dedicated physical servers for maximum performance |

**Common instance families:**

- **General purpose** — balanced CPU, memory, networking (web servers, small databases)
- **Compute optimized** — high CPU-to-memory ratio (batch processing, gaming servers)
- **Memory optimized** — high memory-to-CPU ratio (in-memory databases, real-time analytics)
- **Storage optimized** — high sequential read/write (data warehousing, log processing)
- **GPU instances** — graphics processing units (machine learning, video rendering)

### 2. Storage

Cloud storage replaces physical hard drives and SANs.

| Storage Type | Use Case | Example Services |
|---|---|---|
| **Block storage** | VM boot disks, databases | AWS EBS, Azure Managed Disks, GCP Persistent Disks |
| **Object storage** | Files, backups, media | AWS S3, Azure Blob Storage, GCP Cloud Storage |
| **File storage** | Shared file systems | AWS EFS, Azure Files, GCP Filestore |
| **Archive storage** | Long-term retention | AWS Glacier, Azure Archive, GCP Archive |

### 3. Networking

Networking connects your resources to each other and the internet.

**Key networking components:**

- **Virtual Private Cloud (VPC)** — your isolated network in the cloud
- **Subnets** — subdivisions of your VPC (public and private)
- **Load balancers** — distribute traffic across multiple VMs
- **Firewalls / Security Groups** — control inbound and outbound traffic
- **VPN / Direct Connect** — secure connection to on-premises networks
- **DNS** — domain name resolution (Route 53, Cloud DNS, Azure DNS)
- **CDN** — content delivery network for caching static assets globally

---

## The Shared Responsibility Model

Understanding who is responsible for what is **critical** in IaaS.

| Layer | IaaS Responsibility |
|---|---|
| Physical security | **Provider** |
| Hardware maintenance | **Provider** |
| Virtualization layer | **Provider** |
| Network infrastructure | **Provider** |
| Operating system patches | **You** |
| Application security | **You** |
| Data encryption | **You** |
| Identity & access management | **You** |
| Firewall rules | **You** |
| Backups | **You** |

> **Important:** In IaaS, you have the **most control** but also the **most responsibility** compared to PaaS or SaaS.

---

## Key IaaS Providers

### Amazon Web Services (AWS) EC2

**Amazon Elastic Compute Cloud (EC2)** is the most widely used IaaS compute service.

- Launched in 2006 — pioneered the public cloud market
- 600+ instance types across multiple families
- Available in 30+ regions worldwide
- Supports Linux, Windows, and macOS
- Integrates with 200+ AWS services

### Microsoft Azure Virtual Machines

- Deep integration with Microsoft enterprise products (Active Directory, SQL Server)
- Hybrid cloud capabilities with **Azure Arc**
- Strong presence in enterprise and government sectors
- Supports Windows and Linux workloads
- **Azure Spot VMs** for cost savings up to 90%

### Google Cloud Platform (GCP) Compute Engine

- **Live migration** — VMs move between hosts with zero downtime
- **Sustained use discounts** — automatic discounts for long-running workloads
- **Custom machine types** — choose exact vCPU and memory combinations
- Strong in data analytics and machine learning workloads
- Competitive pricing with **per-second billing**

### Quick Comparison

| Feature | AWS EC2 | Azure VMs | GCP Compute Engine |
|---|---|---|---|
| Market share | ~31% | ~25% | ~11% |
| Regions | 33+ | 60+ | 40+ |
| Instance types | 600+ | 700+ | 50+ (custom) |
| Min billing | Per second | Per second | Per second |
| Free tier | 750 hrs/month (12 mo) | 750 hrs/month (12 mo) | 1 f1-micro (always free) |

---

## IaaS Use Cases

### 1. Development & Testing Environments

Spin up environments quickly, test your code, tear them down when done.

```bash
# Create a dev environment in seconds
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t3.medium \
  --key-name my-dev-key \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Environment,Value=dev}]'

# Terminate when done — stop paying immediately
aws ec2 terminate-instances --instance-ids i-0123456789abcdef0
```

### 2. Web Hosting & Web Applications

Host websites and web applications with full control over the server stack.

### 3. High-Performance Computing (HPC)

Run scientific simulations, financial modeling, or genome sequencing on hundreds of VMs.

### 4. Disaster Recovery

Replicate your on-premises infrastructure in the cloud for failover.

### 5. Big Data Analytics

Process massive datasets using clusters of VMs with tools like Hadoop or Spark.

### 6. Game Hosting

Run multiplayer game servers that scale based on player demand.

---

## Example: Launching a VM on AWS (Step-by-Step)

Let's walk through launching an EC2 instance using the **AWS CLI**.

### Prerequisites

```bash
# Install the AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Configure your credentials
aws configure
# Enter your Access Key ID, Secret Access Key, region, and output format
```

### Step 1: Choose an Amazon Machine Image (AMI)

```bash
# List available Amazon Linux 2023 AMIs
aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-*-x86_64" \
  --query "Images | sort_by(@, &CreationDate) | [-1].ImageId" \
  --output text
```

### Step 2: Create a Key Pair

```bash
# Create an SSH key pair for secure access
aws ec2 create-key-pair \
  --key-name my-cloud-key \
  --query "KeyMaterial" \
  --output text > my-cloud-key.pem

# Set proper permissions
chmod 400 my-cloud-key.pem
```

### Step 3: Create a Security Group

```bash
# Create a security group (firewall rules)
aws ec2 create-security-group \
  --group-name my-web-sg \
  --description "Allow SSH and HTTP"

# Allow SSH access (port 22)
aws ec2 authorize-security-group-ingress \
  --group-name my-web-sg \
  --protocol tcp \
  --port 22 \
  --cidr 203.0.113.0/24  # Replace with YOUR IP range

# Allow HTTP access (port 80)
aws ec2 authorize-security-group-ingress \
  --group-name my-web-sg \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0
```

> **Security Tip:** Never use `0.0.0.0/0` for SSH access in production. Restrict it to your specific IP address.

### Step 4: Launch the Instance

```bash
# Launch the EC2 instance
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t3.micro \
  --key-name my-cloud-key \
  --security-groups my-web-sg \
  --count 1 \
  --tag-specifications \
    'ResourceType=instance,Tags=[{Key=Name,Value=MyWebServer}]'
```

### Step 5: Connect to Your Instance

```bash
# Get the public IP address
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=MyWebServer" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text

# SSH into your instance
ssh -i my-cloud-key.pem ec2-user@<PUBLIC_IP>
```

### Step 6: Install a Web Server

```bash
# Once connected to the VM, install and start Apache
sudo yum update -y
sudo yum install -y httpd
sudo systemctl start httpd
sudo systemctl enable httpd

# Create a simple web page
echo "<h1>Hello from IaaS!</h1>" | sudo tee /var/www/html/index.html
```

### Step 7: Clean Up

```bash
# Terminate the instance when done to stop charges
aws ec2 terminate-instances --instance-ids i-0123456789abcdef0

# Delete the key pair
aws ec2 delete-key-pair --key-name my-cloud-key
rm my-cloud-key.pem
```

---

## IaaS Pricing Models

Understanding pricing is essential to controlling cloud costs.

### 1. On-Demand

- **Pay by the hour or second** — no commitment
- Best for: unpredictable workloads, short-term projects
- Most expensive per unit but most flexible

```
Example: t3.medium on AWS
  $0.0416/hour × 730 hours/month = ~$30.37/month
```

### 2. Reserved Instances

- **Commit for 1 or 3 years** — get significant discounts
- Savings: **30-72%** compared to on-demand
- Best for: steady-state workloads, databases, production servers

```
Example: t3.medium on AWS (1-year reserved)
  ~$19.71/month (35% savings vs on-demand)
```

### 3. Spot / Preemptible Instances

- **Use spare capacity** at steep discounts
- Savings: **60-90%** compared to on-demand
- **Can be interrupted** with short notice (2 minutes on AWS)
- Best for: batch processing, CI/CD, fault-tolerant workloads

```
Example: t3.medium on AWS (spot)
  ~$0.0125/hour = ~$9.13/month (70% savings)
```

### 4. Savings Plans

- Commit to a **consistent usage amount** ($/hour) for 1 or 3 years
- More flexible than reserved instances — applies across instance types
- Savings: **up to 72%**

### Pricing Comparison Table

| Model | Discount | Commitment | Interruption Risk | Best For |
|---|---|---|---|---|
| On-Demand | 0% | None | None | Dev/test, unpredictable |
| Reserved | 30-72% | 1-3 years | None | Steady production |
| Spot | 60-90% | None | **Yes** | Batch, fault-tolerant |
| Savings Plan | Up to 72% | 1-3 years | None | Mixed workloads |

---

## Pros and Cons of IaaS

### Advantages

- **Full control** — choose your OS, runtime, middleware, and applications
- **Scalability** — scale up/down in minutes, not weeks
- **No hardware management** — provider handles physical infrastructure
- **Global reach** — deploy in regions close to your users
- **Pay-as-you-go** — convert capital expense to operational expense
- **Disaster recovery** — replicate infrastructure across regions

### Disadvantages

- **Management overhead** — you must patch OS, manage security, configure networking
- **Complexity** — requires skilled staff to architect and maintain
- **Cost unpredictability** — without monitoring, bills can spike
- **Security responsibility** — misconfigurations are your problem
- **Potential for sprawl** — forgotten resources keep costing money

---

## When to Choose IaaS vs Other Models

### Choose IaaS When:

- You need **full control** over the operating system and runtime
- You have **legacy applications** that can't run on PaaS
- You need **custom networking** configurations (VPNs, firewalls)
- You require **specific OS versions** or kernel configurations
- Your team has strong **system administration** skills
- You need **GPU instances** for machine learning or rendering
- You want to run **containers** with full control (self-managed Kubernetes)

### Choose PaaS Instead When:

- You want to focus on **code, not infrastructure**
- Your app fits standard runtimes (Node.js, Python, Java, .NET)
- You want **automated scaling** without managing VMs
- You prefer **managed databases and services**

### Choose SaaS Instead When:

- You need a **ready-to-use application** (email, CRM, collaboration)
- You don't want to manage **any** infrastructure or development
- You want the **fastest time to value**

### Decision Matrix

| Factor | IaaS | PaaS | SaaS |
|---|---|---|---|
| Control | High | Medium | Low |
| Flexibility | High | Medium | Low |
| Management effort | High | Low | None |
| Time to deploy | Hours | Minutes | Instant |
| Technical skill needed | High | Medium | Low |
| Cost predictability | Low | Medium | High |

---

## IaaS Best Practices

### Cost Optimization

- **Right-size instances** — don't over-provision; monitor CPU and memory usage
- **Use auto-scaling** — scale down during off-peak hours
- **Leverage spot instances** — for fault-tolerant batch workloads
- **Set billing alerts** — get notified before costs exceed budget
- **Tag all resources** — track costs by team, project, or environment
- **Delete unused resources** — unattached volumes, old snapshots, idle load balancers

### Security

- **Use IAM roles** instead of hardcoded credentials
- **Enable encryption** at rest and in transit
- **Implement least-privilege** access policies
- **Regularly patch** your operating systems
- **Use private subnets** for sensitive workloads
- **Enable logging** and monitoring (CloudTrail, Azure Monitor, Cloud Audit Logs)

### Architecture

- **Design for failure** — assume any component can fail
- **Use multiple availability zones** for high availability
- **Automate everything** — use Infrastructure as Code (Terraform, CloudFormation)
- **Implement backups** and test restore procedures regularly

---

## IaaS with Infrastructure as Code

Modern IaaS usage relies heavily on **Infrastructure as Code (IaC)** — defining your infrastructure in configuration files.

### Terraform Example

```hcl
# Define an AWS EC2 instance using Terraform
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web_server" {
  ami           = "ami-0abcdef1234567890"
  instance_type = "t3.micro"

  tags = {
    Name        = "WebServer"
    Environment = "production"
  }

  vpc_security_group_ids = [aws_security_group.web_sg.id]
}

resource "aws_security_group" "web_sg" {
  name        = "web-server-sg"
  description = "Allow HTTP and SSH"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["203.0.113.0/24"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

```bash
# Deploy the infrastructure
terraform init
terraform plan
terraform apply

# Tear it down when done
terraform destroy
```

---

## Try It Yourself

### Exercise 1: Plan an IaaS Architecture

Design the infrastructure for a web application with these requirements:
- 2 web servers behind a load balancer
- 1 database server in a private subnet
- Daily backups to object storage

**Questions to answer:**
1. What instance types would you choose for the web servers? Why?
2. How would you secure the database server?
3. What pricing model would you use for each component?

### Exercise 2: Compare Provider Pricing

Visit the pricing calculators for the three major providers:
- [AWS Pricing Calculator](https://calculator.aws/)
- [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/)
- [GCP Pricing Calculator](https://cloud.google.com/products/calculator)

Configure the same setup on each:
- 2× general-purpose VMs (4 vCPU, 16 GB RAM)
- 100 GB block storage per VM
- 1 TB outbound data transfer

Compare the monthly costs across providers.

### Exercise 3: CLI Practice

If you have an AWS free tier account, try running the VM launch commands from this lesson. Remember to **terminate the instance** when done to avoid charges.

---

## Key Takeaways

- **IaaS** provides virtualized compute, storage, and networking on demand
- You manage everything **from the OS up**; the provider manages the physical infrastructure
- The **three major providers** are AWS (EC2), Azure (VMs), and GCP (Compute Engine)
- **Pricing models** range from flexible on-demand to deeply discounted reserved/spot instances
- IaaS gives you the **most control** but also the **most responsibility**
- Use **Infrastructure as Code** (Terraform, CloudFormation) to manage IaaS resources
- Always follow **security best practices**: least privilege, encryption, patching, monitoring
- Choose IaaS when you need **full control** over the infrastructure stack
- **Right-size and tag** your resources to control costs
- Design for **failure and scalability** from day one
