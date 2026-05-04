---
title: "AWS Overview and Core Services"
---

# AWS Overview and Core Services

Amazon Web Services (AWS) is the **world's largest and most widely adopted cloud platform**. It offers over 200 fully featured services from data centers around the globe.

In this lesson, you will get a comprehensive overview of AWS — its history, global infrastructure, core services, and how to get started.

---

## A Brief History of AWS

| Year | Milestone |
|---|---|
| 2002 | Amazon launches amazon.com web services (basic APIs) |
| 2004 | SQS launched — the first standalone AWS service |
| 2006 | S3 (March) and EC2 (August) launched publicly |
| 2009 | Elastic Load Balancing and Auto Scaling introduced |
| 2010 | Amazon.com's retail site fully migrates to AWS |
| 2012 | DynamoDB launched; first re:Invent conference |
| 2014 | Lambda launches — serverless computing begins |
| 2017 | Over 1 million active customers |
| 2018 | Revenue surpasses $25 billion/year |
| 2020 | Over 175 services available |
| 2023 | Generative AI services (Bedrock, CodeWhisperer) |
| 2024 | AWS revenue exceeds $100 billion/year |

> **Fun fact:** AWS started because Amazon wanted to let external developers build on its infrastructure. The internal tools Amazon built for its own e-commerce platform became the foundation of AWS.

---

## AWS Global Infrastructure

AWS's physical infrastructure is organized into **Regions**, **Availability Zones**, **Edge Locations**, and **Local Zones**.

### Regions

A **Region** is a geographic area that contains multiple Availability Zones. AWS has **30+ Regions** worldwide.

| Region Code | Location | AZs |
|---|---|---|
| us-east-1 | N. Virginia, USA | 6 |
| us-west-2 | Oregon, USA | 4 |
| eu-west-1 | Ireland | 3 |
| ap-south-1 | Mumbai, India | 3 |
| ap-northeast-1 | Tokyo, Japan | 4 |
| sa-east-1 | São Paulo, Brazil | 3 |

**How to choose a region:**

| Factor | What to Consider |
|---|---|
| **Latency** | Pick the region closest to your users |
| **Compliance** | Data residency laws may require specific regions |
| **Service availability** | Not all services are available in all regions |
| **Pricing** | Prices vary by region (us-east-1 is often cheapest) |

### Availability Zones (AZs)

Each region has **2–6 Availability Zones**. Each AZ is one or more **physically separate data centers** with redundant power, networking, and connectivity.

```
Region: us-east-1 (N. Virginia)
┌────────────────────────────────────────────────┐
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ AZ 1a    │  │ AZ 1b    │  │ AZ 1c    │ ... │
│  │ (DC 1,2) │  │ (DC 3,4) │  │ (DC 5,6) │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │              │              │           │
│       └──────────────┼──────────────┘           │
│              High-speed private links           │
│              (< 2ms latency between AZs)        │
└────────────────────────────────────────────────┘
```

**Key properties of AZs:**
- Connected via high-bandwidth, low-latency private fiber
- Physically separated (different buildings, flood zones, power grids)
- Designed so that a failure in one AZ does not affect another

### Edge Locations

**Edge Locations** are smaller data centers used by **CloudFront** (CDN) and **Route 53** (DNS) to cache content close to end users.

- **400+ Edge Locations** in 90+ cities across 40+ countries
- Reduce latency by serving cached content from nearby locations
- Also used by AWS Shield (DDoS protection) and AWS WAF

### Local Zones

**Local Zones** bring select AWS services closer to large population centers where no full Region exists.

- Useful for ultra-low-latency applications (gaming, video streaming, real-time ML)
- Example: Los Angeles Local Zone for media and entertainment

### Infrastructure Hierarchy

```
AWS Global Infrastructure
├── Regions (30+)
│   ├── Availability Zones (2-6 per region)
│   │   └── Data Centers (1+ per AZ)
│   └── Local Zones
├── Edge Locations (400+)
│   └── Regional Edge Caches (13)
└── Wavelength Zones (for 5G)
```

---

## AWS Account Setup and IAM Basics

### Creating an AWS Account

1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Provide email, password, and account name
4. Enter payment information (credit card required, even for Free Tier)
5. Verify your identity (phone/SMS)
6. Choose a support plan (Basic = free)

> **Important:** Secure your **root account** immediately — enable MFA (Multi-Factor Authentication) and never use the root account for daily tasks.

### IAM (Identity and Access Management)

IAM lets you manage **who** can access **what** in your AWS account.

| Concept | Description | Example |
|---|---|---|
| **User** | A person or application that interacts with AWS | `developer-jane` |
| **Group** | A collection of users with shared permissions | `Developers`, `Admins` |
| **Role** | Temporary credentials for services or cross-account access | `EC2-S3-ReadOnly` |
| **Policy** | A JSON document that defines permissions | Allow S3 read access |

### IAM Policy Example

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ]
    }
  ]
}
```

### IAM Best Practices

| Practice | Why |
|---|---|
| Enable MFA on root account | Prevents unauthorized access even if password leaks |
| Create individual IAM users | Never share credentials |
| Use groups for permissions | Easier to manage than per-user policies |
| Follow least privilege | Grant only the minimum permissions needed |
| Use roles for applications | Never embed access keys in code |
| Rotate credentials regularly | Reduces risk if keys are compromised |

---

## Core AWS Services Overview

AWS has 200+ services. Here are the **essential ones** every cloud practitioner should know:

### Compute Services

| Service | What It Does | Use Case |
|---|---|---|
| **EC2** | Virtual servers in the cloud | Web servers, APIs, databases |
| **Lambda** | Run code without managing servers | Event-driven processing, APIs |
| **ECS** | Run Docker containers | Microservices |
| **Fargate** | Serverless containers (no EC2 management) | Containers without infrastructure |
| **Elastic Beanstalk** | Deploy apps without managing infra | Quick deployments |
| **Lightsail** | Simple virtual servers | Small websites, dev/test |

### Storage Services

| Service | What It Does | Use Case |
|---|---|---|
| **S3** | Object storage (files, images, backups) | Static websites, data lakes |
| **EBS** | Block storage for EC2 instances | Database volumes, OS disks |
| **EFS** | Shared file system for EC2 | Shared storage across instances |
| **S3 Glacier** | Low-cost archival storage | Backups, compliance archives |

### Database Services

| Service | Type | Use Case |
|---|---|---|
| **RDS** | Relational (MySQL, PostgreSQL, etc.) | Traditional apps, ACID transactions |
| **Aurora** | High-performance relational | Enterprise workloads |
| **DynamoDB** | Key-value / document (NoSQL) | High-scale, low-latency |
| **ElastiCache** | In-memory (Redis, Memcached) | Caching, session stores |
| **Redshift** | Data warehouse | Analytics, BI |

### Networking Services

| Service | What It Does | Use Case |
|---|---|---|
| **VPC** | Isolated virtual network | Network isolation, security |
| **Route 53** | DNS and domain registration | Domain management, routing |
| **CloudFront** | Content Delivery Network (CDN) | Fast content delivery worldwide |
| **ELB** | Load balancing (ALB, NLB, CLB) | Distribute traffic across servers |
| **API Gateway** | Managed API endpoints | REST and WebSocket APIs |

### Security Services

| Service | What It Does | Use Case |
|---|---|---|
| **IAM** | Identity and access management | User/role permissions |
| **KMS** | Key management for encryption | Encrypt data at rest |
| **WAF** | Web Application Firewall | Block SQL injection, XSS |
| **Shield** | DDoS protection | Protect public endpoints |
| **GuardDuty** | Threat detection | Security monitoring |

### Application Integration

| Service | What It Does | Use Case |
|---|---|---|
| **SQS** | Message queue | Decouple microservices |
| **SNS** | Pub/sub messaging and notifications | Fan-out events, alerts |
| **EventBridge** | Event bus | Event-driven architectures |
| **Step Functions** | Workflow orchestration | Multi-step processes |

### Machine Learning

| Service | What It Does | Use Case |
|---|---|---|
| **SageMaker** | Build, train, deploy ML models | Custom ML |
| **Rekognition** | Image and video analysis | Face detection, content moderation |
| **Bedrock** | Foundation models (Gen AI) | AI-powered applications |
| **Comprehend** | Natural language processing | Sentiment analysis |

---

## AWS Free Tier

AWS offers a **Free Tier** so you can try services without cost.

### Three Types of Free Tier Offers

| Type | Duration | Examples |
|---|---|---|
| **Always Free** | Never expires | Lambda (1M requests/month), DynamoDB (25 GB) |
| **12-Month Free** | First 12 months after signup | EC2 (750 hrs/month t2.micro), S3 (5 GB), RDS (750 hrs) |
| **Trials** | Short-term from first use | SageMaker (250 hours), Redshift (2 months) |

### Popular Free Tier Limits

| Service | Free Tier Allowance | Duration |
|---|---|---|
| EC2 | 750 hours/month (t2.micro or t3.micro) | 12 months |
| S3 | 5 GB standard storage | 12 months |
| RDS | 750 hours/month (db.t2.micro or db.t3.micro) | 12 months |
| Lambda | 1 million requests/month | Always free |
| DynamoDB | 25 GB storage, 25 RCU/WCU | Always free |
| CloudWatch | 10 custom metrics, 10 alarms | Always free |
| SNS | 1 million publishes | Always free |
| SQS | 1 million requests | Always free |

> **Warning:** Set up **AWS Budgets** and **billing alerts** immediately. It is easy to accidentally exceed Free Tier limits and incur charges.

### Setting Up a Billing Alarm

```bash
# AWS CLI: Create a billing alarm (triggers at $10)
aws cloudwatch put-metric-alarm \
  --alarm-name "BillingAlarm-10USD" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --threshold 10 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:123456789:BillingAlert \
  --dimensions Name=Currency,Value=USD
```

---

## Ways to Interact with AWS

### 1. AWS Management Console (Web UI)

The browser-based graphical interface. Best for:
- Exploring services
- Learning and experimentation
- One-off manual tasks

### 2. AWS CLI (Command Line Interface)

A unified tool to manage AWS services from the terminal.

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Configure credentials
aws configure
# AWS Access Key ID: AKIAIOSFODNN7EXAMPLE
# AWS Secret Access Key: wJalrXUtnFEMI/K7MDENG/...
# Default region name: us-east-1
# Default output format: json

# Example commands
aws s3 ls                          # List S3 buckets
aws ec2 describe-instances         # List EC2 instances
aws lambda list-functions          # List Lambda functions
```

### 3. AWS SDKs (Software Development Kits)

Libraries for your programming language to interact with AWS programmatically.

| Language | SDK |
|---|---|
| JavaScript/Node.js | `@aws-sdk/client-*` (v3) |
| Python | `boto3` |
| Java | AWS SDK for Java 2.x |
| Go | `aws-sdk-go-v2` |
| .NET | AWS SDK for .NET |
| Ruby | `aws-sdk-ruby` |

**Example: List S3 Buckets with Node.js**

```javascript
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

const client = new S3Client({ region: "us-east-1" });
const response = await client.send(new ListBucketsCommand({}));

console.log("Buckets:");
for (const bucket of response.Buckets) {
  console.log(`  - ${bucket.Name} (created: ${bucket.CreationDate})`);
}
```

**Example: List S3 Buckets with Python (boto3)**

```python
import boto3

s3 = boto3.client("s3")
response = s3.list_buckets()

print("Buckets:")
for bucket in response["Buckets"]:
    print(f"  - {bucket['Name']} (created: {bucket['CreationDate']})")
```

### 4. Infrastructure as Code (IaC)

| Tool | Description |
|---|---|
| **CloudFormation** | AWS-native IaC (JSON/YAML templates) |
| **CDK** | Define infrastructure using programming languages |
| **Terraform** | Multi-cloud IaC (HCL syntax) |
| **Pulumi** | IaC using general-purpose languages |

---

## AWS Service Categories

```
AWS Services (200+)
├── Compute ──────────── EC2, Lambda, ECS, Fargate, Beanstalk
├── Storage ──────────── S3, EBS, EFS, Glacier
├── Database ─────────── RDS, DynamoDB, Aurora, ElastiCache
├── Networking ───────── VPC, Route 53, CloudFront, ELB
├── Security ─────────── IAM, KMS, WAF, Shield, GuardDuty
├── App Integration ──── SQS, SNS, EventBridge, Step Functions
├── Developer Tools ──── CodeCommit, CodeBuild, CodePipeline
├── Management ───────── CloudWatch, CloudTrail, Config, SSM
├── Analytics ────────── Athena, Redshift, Kinesis, Glue
├── Machine Learning ─── SageMaker, Rekognition, Bedrock
├── Containers ───────── ECS, EKS, Fargate, ECR
├── Serverless ───────── Lambda, API Gateway, DynamoDB, S3
└── Migration ────────── DMS, Migration Hub, Snow Family
```

---

## AWS Pricing Models

### Key Pricing Principles

| Principle | Description |
|---|---|
| **Pay-as-you-go** | Pay only for what you use, no upfront commitment |
| **Save when you commit** | Reserved / Savings Plans offer up to 72% discount |
| **Pay less at scale** | Volume discounts on services like S3 |
| **Free Tier** | Try services at no cost within limits |

### Common Pricing Dimensions

| Dimension | Services | Example |
|---|---|---|
| **Compute hours** | EC2, RDS, Fargate | $0.0116/hour for t3.micro |
| **Requests** | Lambda, API Gateway, S3 | $0.20 per 1M Lambda requests |
| **Storage (GB/month)** | S3, EBS, RDS | $0.023/GB for S3 Standard |
| **Data transfer** | All services | Free in → Charges out |
| **Provisioned capacity** | DynamoDB, ElastiCache | Per RCU/WCU for DynamoDB |

> **Cost Tip:** **Data transfer OUT** from AWS to the internet is charged. Data transfer IN is free. Data transfer between services in the same AZ is often free.

### Cost Management Tools

| Tool | What It Does |
|---|---|
| **AWS Pricing Calculator** | Estimate costs before deploying |
| **Cost Explorer** | Visualize and analyze past spending |
| **AWS Budgets** | Set spending alerts and thresholds |
| **Trusted Advisor** | Recommendations for cost optimization |
| **Cost Anomaly Detection** | ML-based alerts for unusual spending |

---

## Getting Started Guide

Here is a step-by-step path for your first day with AWS:

### Step 1: Create and Secure Your Account

```
1. Create AWS account at aws.amazon.com
2. Enable MFA on root account (use an authenticator app)
3. Create an IAM admin user (never use root again)
4. Set up a billing alarm ($5 or $10 threshold)
5. Enable AWS CloudTrail (audit log)
```

### Step 2: Launch Your First EC2 Instance

```
1. Go to EC2 Dashboard → Launch Instance
2. Name: "my-first-server"
3. AMI: Amazon Linux 2023 (Free Tier eligible)
4. Instance type: t2.micro (Free Tier)
5. Create a new key pair (download the .pem file)
6. Allow SSH (port 22) in security group
7. Launch → Connect via SSH
```

### Step 3: Create Your First S3 Bucket

```
1. Go to S3 → Create Bucket
2. Name: "my-first-bucket-<unique-id>"
3. Region: us-east-1
4. Block all public access: ON (default, keep it)
5. Upload a test file
6. Explore versioning, lifecycle rules
```

### Step 4: Install and Configure the CLI

```bash
# Install
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Configure
aws configure

# Verify
aws sts get-caller-identity
```

### Step 5: Explore and Learn

| Resource | URL |
|---|---|
| AWS Documentation | docs.aws.amazon.com |
| AWS Skill Builder | explore.skillbuilder.aws |
| AWS Well-Architected | aws.amazon.com/architecture/well-architected |
| AWS Samples (GitHub) | github.com/aws-samples |

---

## Exercises

### Exercise 1: Service Matching

Match each use case to the best AWS service:

| Use Case | Service |
|---|---|
| 1. Host a static website | ? |
| 2. Run a MySQL database | ? |
| 3. Process images on upload | ? |
| 4. Send email notifications | ? |
| 5. Cache database queries | ? |
| 6. Store application logs | ? |

<details>
<summary>Solution</summary>

| Use Case | Service |
|---|---|
| 1. Host a static website | **S3 + CloudFront** |
| 2. Run a MySQL database | **RDS (MySQL)** |
| 3. Process images on upload | **Lambda** (triggered by S3) |
| 4. Send email notifications | **SNS** or **SES** |
| 5. Cache database queries | **ElastiCache (Redis)** |
| 6. Store application logs | **CloudWatch Logs** or **S3** |

</details>

### Exercise 2: IAM Policy

Write an IAM policy that:
- Allows listing all S3 buckets
- Allows reading objects from only the bucket named `reports-bucket`
- Denies deleting any S3 objects

<details>
<summary>Solution</summary>

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:ListAllMyBuckets",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::reports-bucket",
        "arn:aws:s3:::reports-bucket/*"
      ]
    },
    {
      "Effect": "Deny",
      "Action": "s3:DeleteObject",
      "Resource": "*"
    }
  ]
}
```

</details>

### Exercise 3: Cost Estimation

You want to run a small web application on AWS for one month:
- 1 × t3.micro EC2 instance (24/7) at $0.0104/hour
- 50 GB S3 storage at $0.023/GB
- 100 GB data transfer out at $0.09/GB
- 1 million Lambda invocations (free tier)

Calculate the estimated monthly cost.

<details>
<summary>Solution</summary>

```
EC2:  730 hours × $0.0104 = $7.59
S3:   50 GB × $0.023      = $1.15
Data: 100 GB × $0.09      = $9.00
Lambda: Free (within 1M free tier)

Total: $7.59 + $1.15 + $9.00 = $17.74/month

Note: If still within your 12-month Free Tier,
the EC2 t3.micro cost would be $0 (750 hrs/month free).
Adjusted total: $1.15 + $9.00 = $10.15/month
```

</details>

---

## Key Takeaways

| Concept | Summary |
|---|---|
| **AWS** | Largest cloud provider with 200+ services worldwide |
| **Regions** | Geographic areas with 2–6 Availability Zones each |
| **Availability Zones** | Isolated data centers within a region |
| **Edge Locations** | CDN/DNS endpoints for low-latency content delivery |
| **IAM** | Identity and Access Management — controls who can do what |
| **Core Services** | EC2 (compute), S3 (storage), RDS (database), VPC (networking), Lambda (serverless) |
| **Free Tier** | Always Free + 12-Month Free + Trial offers |
| **Interaction** | Console (web), CLI (terminal), SDKs (code), IaC (templates) |
| **Pricing** | Pay-as-you-go; save with commitments; data transfer out costs money |

> **Remember:** You do not need to learn all 200+ services. Start with the core services (EC2, S3, VPC, IAM, RDS, Lambda) and expand from there.

---

## Next Steps

In the next lesson, you will dive deep into **AWS Compute Services** — starting with EC2 instance types, pricing models, and hands-on instance launching.
