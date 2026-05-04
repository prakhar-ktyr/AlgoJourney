---
title: "AWS Compute Services"
---

# AWS Compute Services

Compute is the **heartbeat** of cloud infrastructure. Every application needs processing power — whether it is a web server handling requests, a batch job crunching data, or a function running for 100 milliseconds.

In this lesson, you will learn about AWS compute services in depth — from EC2 virtual machines to serverless Lambda functions.

---

## The AWS Compute Spectrum

AWS offers compute services across a spectrum from **full control** to **fully managed**:

```
More Control                                         Less Control
◄──────────────────────────────────────────────────────────────►

EC2          ECS/EKS        Fargate         Lambda       Lightsail
(VMs)       (Containers    (Serverless     (Serverless   (Simple
             on EC2)        Containers)     Functions)    VMs)

You manage:  You manage:    You manage:    You manage:   AWS manages:
- OS         - Containers   - Containers   - Code only   - Almost
- Patches    - App          - App                          everything
- App        - Scaling
- Scaling
```

---

## EC2 (Elastic Compute Cloud)

EC2 is the foundational compute service. It lets you launch **virtual servers** (called **instances**) in the cloud.

### EC2 Instance Types

Instance types are optimized for different workloads. The naming convention is:

```
Instance Type: m5.xlarge

m  = Family (General Purpose)
5  = Generation (5th)
.  = Separator
xlarge = Size
```

### Instance Families

| Family | Optimized For | Use Cases | Example Types |
|---|---|---|---|
| **T** (General — burstable) | Variable workloads | Dev/test, small apps | t3.micro, t3.small |
| **M** (General — steady) | Balanced compute/memory | Web servers, app servers | m5.large, m6i.xlarge |
| **C** (Compute) | CPU-intensive tasks | Batch processing, ML inference, gaming | c5.xlarge, c6g.2xlarge |
| **R** (Memory) | Memory-intensive tasks | In-memory databases, caching | r5.large, r6g.xlarge |
| **I** (Storage) | High I/O operations | NoSQL databases, data warehouses | i3.large, i3en.xlarge |
| **G / P** (Accelerated) | GPU workloads | ML training, video rendering | g4dn.xlarge, p4d.24xlarge |
| **D** (Dense storage) | Large local storage | Hadoop, distributed file systems | d2.xlarge |
| **Hpc** (HPC) | High-performance computing | Simulations, modeling | hpc6a.48xlarge |

### Instance Sizes

| Size | vCPUs | Memory (GiB) | Example Price (us-east-1) |
|---|---|---|---|
| nano | 2 | 0.5 | ~$0.0042/hr |
| micro | 2 | 1 | ~$0.0104/hr |
| small | 2 | 2 | ~$0.0208/hr |
| medium | 2 | 4 | ~$0.0416/hr |
| large | 2 | 8 | ~$0.0832/hr |
| xlarge | 4 | 16 | ~$0.1664/hr |
| 2xlarge | 8 | 32 | ~$0.3328/hr |
| 4xlarge | 16 | 64 | ~$0.6656/hr |

> **Note:** Sizes above are approximate for t3 instances. Actual specs vary by family and generation.

### How to Choose an Instance Type

```
Start here:
  │
  ├─ Need GPU? ──────────────────► G or P family
  │
  ├─ CPU-intensive? ─────────────► C family
  │
  ├─ Memory-intensive? ──────────► R family
  │
  ├─ Storage-intensive? ─────────► I or D family
  │
  ├─ Variable/bursty workload? ──► T family (burstable)
  │
  └─ Balanced workload? ─────────► M family (general)
```

---

## Amazon Machine Images (AMIs)

An **AMI** is a template that contains the OS, application server, and applications needed to launch an instance.

### Types of AMIs

| Type | Description | Examples |
|---|---|---|
| **AWS-provided** | Official, maintained by AWS | Amazon Linux 2023, Ubuntu, Windows Server |
| **Marketplace** | Third-party vendor images | Nginx, WordPress, Deep Learning AMI |
| **Community** | Shared by other users | Custom Linux builds |
| **Custom** | Created by you from a running instance | Your app pre-installed and configured |

### Creating a Custom AMI

```bash
# Step 1: Launch and configure an instance
# (install your app, configure settings, etc.)

# Step 2: Create an AMI from the running instance
aws ec2 create-image \
  --instance-id i-0abcd1234efgh5678 \
  --name "my-app-v1.0" \
  --description "My application with Node.js 20 and Nginx" \
  --no-reboot

# Step 3: Use the AMI to launch new instances
aws ec2 run-instances \
  --image-id ami-0123456789abcdef0 \
  --instance-type t3.micro \
  --key-name my-key
```

> **Best Practice:** Use custom AMIs to speed up deployments. Pre-bake your application and dependencies into an AMI so new instances start fast — this is called the **golden AMI** pattern.

---

## Key Pairs and SSH Access

A **key pair** consists of a public key (stored by AWS) and a private key (downloaded by you). It is used to securely SSH into your instances.

```bash
# Create a key pair
aws ec2 create-key-pair \
  --key-name my-key \
  --query "KeyMaterial" \
  --output text > my-key.pem

# Set permissions (required on Linux/macOS)
chmod 400 my-key.pem

# Connect to your instance
ssh -i my-key.pem ec2-user@<public-ip>
```

> **Security:** Never share your private key file. If compromised, delete the key pair and create a new one. Consider using **EC2 Instance Connect** or **SSM Session Manager** instead of managing SSH keys.

---

## Security Groups

A **Security Group** acts as a virtual firewall for your EC2 instance, controlling inbound and outbound traffic.

### Key Rules

| Property | Detail |
|---|---|
| **Default inbound** | All traffic DENIED |
| **Default outbound** | All traffic ALLOWED |
| **Stateful** | If you allow inbound traffic, the response is automatically allowed |
| **Rules** | Allow only (no explicit deny rules) |

### Common Security Group Configuration

```
Web Server Security Group:
┌────────────────────────────────────────────────────────┐
│ Inbound Rules:                                         │
│   HTTP    (80)   from 0.0.0.0/0    ← Public web       │
│   HTTPS   (443)  from 0.0.0.0/0    ← Public web       │
│   SSH     (22)   from 203.0.113.0/24 ← Office IP only │
│                                                        │
│ Outbound Rules:                                        │
│   All traffic    to 0.0.0.0/0      ← Allow all out    │
└────────────────────────────────────────────────────────┘
```

```bash
# Create a security group
aws ec2 create-security-group \
  --group-name web-server-sg \
  --description "Web server security group" \
  --vpc-id vpc-0abcd1234

# Allow HTTP
aws ec2 authorize-security-group-ingress \
  --group-id sg-0abcd1234 \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Allow SSH from a specific IP
aws ec2 authorize-security-group-ingress \
  --group-id sg-0abcd1234 \
  --protocol tcp \
  --port 22 \
  --cidr 203.0.113.10/32
```

---

## EC2 Pricing Models

Choosing the right pricing model can save you **up to 90%** compared to On-Demand pricing.

### Comparison

| Model | Discount | Commitment | Best For |
|---|---|---|---|
| **On-Demand** | 0% (full price) | None | Unpredictable workloads, testing |
| **Reserved (RI)** | Up to 72% | 1 or 3 years | Steady-state workloads |
| **Savings Plans** | Up to 72% | 1 or 3 years | Flexible commitment across services |
| **Spot** | Up to 90% | None (can be interrupted) | Fault-tolerant, flexible workloads |
| **Dedicated Hosts** | Varies | On-demand or reserved | Compliance, licensing requirements |

### On-Demand

- Pay by the second (Linux) or by the hour (Windows)
- No upfront commitment
- Full price — the "default" option

```
Example: t3.micro in us-east-1
  $0.0104/hour × 730 hours/month = $7.59/month
```

### Reserved Instances

- Commit to 1 or 3 years
- Choose payment: All Upfront, Partial Upfront, or No Upfront
- Bigger discount for longer term and more upfront payment

| Payment Option | 1-Year Discount | 3-Year Discount |
|---|---|---|
| No Upfront | ~36% | ~56% |
| Partial Upfront | ~40% | ~60% |
| All Upfront | ~42% | ~62% |

### Savings Plans

- Commit to a **dollar amount per hour** (e.g., $10/hour)
- Applies across EC2, Fargate, and Lambda
- More flexible than Reserved Instances

```
Example:
  You commit to $10/hour for 1 year (All Upfront)
  Any usage up to $10/hour is discounted
  Usage above $10/hour is charged at On-Demand rates
```

### Spot Instances

- Use **unused EC2 capacity** at up to 90% discount
- AWS can reclaim (interrupt) your instance with a **2-minute warning**
- Best for: batch processing, data analysis, CI/CD, distributed workloads

```bash
# Request a spot instance
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type c5.xlarge \
  --instance-market-options '{"MarketType":"spot","SpotOptions":{"SpotInstanceType":"one-time"}}' \
  --count 1
```

> **Warning:** Never run critical, stateful workloads on Spot Instances. Always design for interruption — save state frequently, use checkpointing, and have a fallback plan.

### Pricing Comparison Example

Running a `c5.xlarge` in us-east-1 for 1 year:

| Model | Monthly Cost | Annual Cost | Savings |
|---|---|---|---|
| On-Demand | ~$124 | ~$1,489 | 0% |
| Reserved (1yr, All Upfront) | ~$74 | ~$887 | 40% |
| Reserved (3yr, All Upfront) | ~$49 | ~$592 | 60% |
| Spot (average) | ~$37 | ~$447 | 70% |

---

## Launching an EC2 Instance

### Using the AWS Console

```
Step-by-step:

1. Go to EC2 Dashboard → "Launch Instance"

2. Name and Tags
   └── Name: "my-web-server"

3. Application and OS Image (AMI)
   └── Amazon Linux 2023 (Free Tier eligible)

4. Instance Type
   └── t2.micro (Free Tier eligible)

5. Key Pair
   └── Create or select an existing key pair

6. Network Settings
   └── VPC: default
   └── Subnet: default (any AZ)
   └── Auto-assign public IP: Enable
   └── Security group: Create new
       ├── SSH (22) from My IP
       └── HTTP (80) from Anywhere

7. Configure Storage
   └── 8 GiB gp3 (default, Free Tier eligible)

8. Advanced Details
   └── User Data: (optional startup script)

9. Review and Launch
```

### Using the AWS CLI

```bash
# Launch an EC2 instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t2.micro \
  --key-name my-key \
  --security-group-ids sg-0abcd1234efgh5678 \
  --subnet-id subnet-0abcd1234 \
  --associate-public-ip-address \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=my-web-server}]' \
  --user-data file://startup.sh \
  --count 1

# Check instance status
aws ec2 describe-instances \
  --instance-ids i-0abcd1234efgh5678 \
  --query "Reservations[].Instances[].{ID:InstanceId,State:State.Name,IP:PublicIpAddress}"

# Connect via SSH
ssh -i my-key.pem ec2-user@<public-ip>

# Terminate when done
aws ec2 terminate-instances --instance-ids i-0abcd1234efgh5678
```

---

## User Data Scripts

**User Data** is a script that runs automatically when an EC2 instance first starts. It is used to automate setup tasks.

```bash
#!/bin/bash
# startup.sh — EC2 User Data script

# Update system packages
yum update -y

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# Install and start Nginx
yum install -y nginx
systemctl start nginx
systemctl enable nginx

# Create a simple web page
cat > /usr/share/nginx/html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>My EC2 Instance</title></head>
<body>
  <h1>Hello from EC2!</h1>
  <p>Instance launched successfully.</p>
</body>
</html>
EOF

# Log completion
echo "User data script completed at $(date)" >> /var/log/user-data.log
```

> **Tip:** User data scripts run as `root`. Check `/var/log/cloud-init-output.log` for debugging if your script does not work as expected.

---

## Auto Scaling Groups (ASG)

An **Auto Scaling Group** automatically adjusts the number of EC2 instances based on demand.

### ASG Components

```
┌───────────────────────────────────────────────────┐
│                Auto Scaling Group                  │
│                                                    │
│  Launch Template:                                  │
│    AMI: ami-0abcdef                                │
│    Type: t3.micro                                  │
│    Security Group: sg-web                          │
│    User Data: startup.sh                           │
│                                                    │
│  Scaling Configuration:                            │
│    Minimum: 2                                      │
│    Desired: 3                                      │
│    Maximum: 10                                     │
│                                                    │
│  Scaling Policies:                                 │
│    Scale Out: CPU > 70% for 5 min → add 2          │
│    Scale In:  CPU < 30% for 10 min → remove 1      │
│                                                    │
│  Health Check: ELB (HTTP /health)                  │
│  Cooldown: 300 seconds                             │
└───────────────────────────────────────────────────┘
```

### Scaling Policies

| Policy Type | How It Works | Example |
|---|---|---|
| **Target Tracking** | Maintain a target metric value | Keep average CPU at 50% |
| **Step Scaling** | Add/remove based on alarm thresholds | CPU > 70% → add 2; CPU > 90% → add 4 |
| **Scheduled** | Scale at specific times | Add 5 instances weekdays 9am–5pm |
| **Predictive** | ML-based forecasting | Scale based on predicted traffic patterns |

### Creating an ASG with the CLI

```bash
# Step 1: Create a launch template
aws ec2 create-launch-template \
  --launch-template-name my-app-template \
  --version-description "v1" \
  --launch-template-data '{
    "ImageId": "ami-0abcdef1234567890",
    "InstanceType": "t3.micro",
    "SecurityGroupIds": ["sg-0abcd1234"],
    "UserData": "'$(base64 -w 0 startup.sh)'"
  }'

# Step 2: Create the ASG
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name my-app-asg \
  --launch-template LaunchTemplateName=my-app-template,Version='$Latest' \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 3 \
  --availability-zones us-east-1a us-east-1b \
  --target-group-arns arn:aws:elasticloadbalancing:us-east-1:123456:targetgroup/my-app/abcdef

# Step 3: Add a target tracking scaling policy
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name my-app-asg \
  --policy-name cpu-target-tracking \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration '{
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ASGAverageCPUUtilization"
    },
    "TargetValue": 50.0
  }'
```

---

## Placement Groups

**Placement Groups** control how instances are placed on the underlying hardware.

| Strategy | Behavior | Use Case |
|---|---|---|
| **Cluster** | All instances in the same rack in one AZ | Low-latency HPC, big data (10 Gbps between instances) |
| **Spread** | Each instance on different hardware (max 7 per AZ) | Critical apps that need isolation |
| **Partition** | Instances in logical partitions on separate racks | Large distributed systems (Hadoop, Kafka, Cassandra) |

```
Cluster:                    Spread:                    Partition:
┌──────────────┐     ┌──────────────────────┐   ┌─────────────────────┐
│  Same Rack   │     │ Rack1  Rack2  Rack3  │   │ Part1   Part2       │
│ ┌──┐┌──┐┌──┐ │     │ ┌──┐   ┌──┐   ┌──┐  │   │ ┌──┐┌──┐ ┌──┐┌──┐ │
│ │i1││i2││i3│ │     │ │i1│   │i2│   │i3│  │   │ │i1││i2│ │i3││i4│ │
│ └──┘└──┘└──┘ │     │ └──┘   └──┘   └──┘  │   │ └──┘└──┘ └──┘└──┘ │
└──────────────┘     └──────────────────────┘   └─────────────────────┘
  ↑ Low latency        ↑ Max isolation            ↑ Balanced
```

---

## Elastic IP Addresses

An **Elastic IP** is a static public IPv4 address that you can associate with any instance in your account.

```bash
# Allocate an Elastic IP
aws ec2 allocate-address --domain vpc

# Associate with an instance
aws ec2 associate-address \
  --instance-id i-0abcd1234efgh5678 \
  --allocation-id eipalloc-0abcd1234

# Disassociate
aws ec2 disassociate-address \
  --association-id eipassoc-0abcd1234

# Release (free it)
aws ec2 release-address \
  --allocation-id eipalloc-0abcd1234
```

> **Cost:** Elastic IPs are **free while associated** with a running instance. You are charged ~$0.005/hour for each Elastic IP that is NOT associated with a running instance. Always release unused Elastic IPs.

---

## Other AWS Compute Services

### Elastic Beanstalk

A **PaaS** (Platform as a Service) that automatically handles deployment, scaling, and monitoring.

```bash
# Install the EB CLI
pip install awsebcli

# Initialize and deploy a Node.js app
cd my-app
eb init -p node.js my-app --region us-east-1
eb create my-app-env
eb open   # Opens your app in a browser
```

**You provide:** Your application code
**Beanstalk manages:** EC2 instances, load balancers, auto scaling, health monitoring, OS patching

### ECS (Elastic Container Service)

Run Docker containers on AWS. Two launch modes:

| Mode | You Manage | AWS Manages |
|---|---|---|
| **EC2 launch type** | EC2 instances (cluster) | Container orchestration |
| **Fargate launch type** | Nothing (serverless) | EC2 instances + orchestration |

```
ECS Architecture:
┌─────────────────────────────────────────────┐
│                 ECS Cluster                  │
│  ┌──────────────────────────────────────┐   │
│  │           ECS Service                 │   │
│  │  ┌─────────┐  ┌─────────┐            │   │
│  │  │  Task   │  │  Task   │  ← Desired │   │
│  │  │(container)│ │(container)│    count=2│   │
│  │  └─────────┘  └─────────┘            │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Running on: EC2 instances OR Fargate        │
└─────────────────────────────────────────────┘
```

### Fargate

Serverless containers — you define your container and Fargate runs it without managing servers.

```bash
# Example: Run a container on Fargate
aws ecs run-task \
  --cluster my-cluster \
  --task-definition my-task:1 \
  --launch-type FARGATE \
  --network-configuration '{
    "awsvpcConfiguration": {
      "subnets": ["subnet-0abcd1234"],
      "securityGroups": ["sg-0abcd1234"],
      "assignPublicIp": "ENABLED"
    }
  }'
```

### Lambda

Run code without managing any servers. You pay only for the compute time you consume.

```javascript
// Lambda function: Process S3 uploads
export const handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  console.log(`New file uploaded: s3://${bucket}/${key}`);

  // Process the file...

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Processed successfully" }),
  };
};
```

**Lambda Limits:**

| Limit | Value |
|---|---|
| Max execution time | 15 minutes |
| Max memory | 10 GB |
| Max deployment package | 50 MB (zipped), 250 MB (unzipped) |
| Max concurrent executions | 1,000 (default, can increase) |
| Ephemeral storage (/tmp) | 10 GB |

### Lightsail

The **simplest** way to run a virtual server on AWS. Fixed monthly pricing, includes compute, storage, and data transfer.

| Plan | vCPUs | RAM | Storage | Transfer | Price |
|---|---|---|---|---|---|
| Nano | 2 | 0.5 GB | 20 GB SSD | 1 TB | $3.50/month |
| Micro | 2 | 1 GB | 40 GB SSD | 2 TB | $5/month |
| Small | 2 | 2 GB | 60 GB SSD | 3 TB | $10/month |
| Medium | 2 | 4 GB | 80 GB SSD | 4 TB | $20/month |

**When to use Lightsail:** Simple websites, blogs, dev/test environments, small business applications. When your needs grow, you can migrate to EC2.

### AWS Batch

Run **batch computing jobs** at any scale. AWS Batch dynamically provisions the optimal quantity and type of compute resources.

**Use cases:** Scientific simulations, financial modeling, video rendering, genomics processing.

---

## Choosing the Right Compute Service

```
Decision Tree:

Need full OS control?
  ├── Yes → EC2
  └── No
      ├── Running containers?
      │   ├── Want serverless? → Fargate
      │   └── Need cluster control? → ECS on EC2 (or EKS)
      ├── Event-driven / short tasks?
      │   └── → Lambda (if < 15 min)
      ├── Simple web app, don't want to manage infra?
      │   └── → Elastic Beanstalk
      ├── Simple, predictable pricing?
      │   └── → Lightsail
      └── Large batch workloads?
          └── → AWS Batch
```

### Quick Comparison

| Service | Server Mgmt | Scaling | Pricing | Best For |
|---|---|---|---|---|
| **EC2** | You manage | Manual or Auto Scaling | Per second | Full control |
| **Beanstalk** | AWS manages | Automatic | Per underlying resource | Quick deployment |
| **ECS (EC2)** | You manage cluster | Service auto scaling | Per EC2 instance | Containers, control |
| **Fargate** | None | Automatic | Per vCPU + memory/sec | Containers, no ops |
| **Lambda** | None | Automatic (instant) | Per request + duration | Event-driven, APIs |
| **Lightsail** | Minimal | Manual | Fixed monthly | Simple apps |
| **Batch** | None | Automatic | Per underlying resource | Batch processing |

---

## Exercises

### Exercise 1: Instance Type Selection

For each scenario, choose the best EC2 instance family:

| Scenario | Best Family |
|---|---|
| 1. Machine learning model training with GPUs | ? |
| 2. A web server with unpredictable traffic spikes | ? |
| 3. An in-memory Redis cache with 256 GB RAM | ? |
| 4. A balanced web application server | ? |
| 5. A batch job doing heavy number crunching | ? |

<details>
<summary>Solution</summary>

| Scenario | Best Family | Reason |
|---|---|---|
| 1. ML training with GPUs | **P family** (p4d, p5) | GPU-optimized for ML |
| 2. Unpredictable traffic | **T family** (t3, t3a) | Burstable, cost-effective |
| 3. 256 GB in-memory cache | **R family** (r5, r6g) | Memory-optimized |
| 4. Balanced web app | **M family** (m5, m6i) | General purpose, steady |
| 5. Heavy computation | **C family** (c5, c6i) | Compute-optimized |

</details>

### Exercise 2: Cost Comparison

You need to run a `m5.large` instance 24/7 for 1 year in us-east-1.
On-Demand price: $0.096/hour.

Calculate the cost for:
1. On-Demand (full year)
2. Reserved Instance (1-year, All Upfront, 40% discount)
3. If your workload can tolerate interruptions, Spot Instance (average 70% discount)

<details>
<summary>Solution</summary>

```
1. On-Demand:
   $0.096/hr × 8,760 hrs = $840.96/year

2. Reserved (1yr, All Upfront, 40% off):
   $840.96 × 0.60 = $504.58/year
   Savings: $336.38

3. Spot (70% off):
   $840.96 × 0.30 = $252.29/year
   Savings: $588.67

But remember: Spot can be interrupted!
Use it only for fault-tolerant workloads.
```

</details>

### Exercise 3: Launch an EC2 Instance

Write the AWS CLI command to:
1. Launch a `t3.micro` instance
2. Using the Amazon Linux 2023 AMI (`ami-0c02fb55956c7d316`)
3. In the `us-east-1a` availability zone
4. With a key pair named `dev-key`
5. With a tag `Environment=Development`
6. With a user data script that installs and starts Apache

<details>
<summary>Solution</summary>

```bash
# Create the user data script
cat > user-data.sh << 'EOF'
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd
echo "<h1>Hello from $(hostname)</h1>" > /var/www/html/index.html
EOF

# Launch the instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.micro \
  --key-name dev-key \
  --placement AvailabilityZone=us-east-1a \
  --tag-specifications \
    'ResourceType=instance,Tags=[{Key=Name,Value=dev-server},{Key=Environment,Value=Development}]' \
  --user-data file://user-data.sh \
  --count 1
```

</details>

### Exercise 4: Auto Scaling Design

Design an Auto Scaling Group for a web application that:
- Normally handles 1,000 requests/second
- Peaks at 5,000 requests/second during sales events
- Must always have at least 2 healthy instances
- Each instance handles ~500 requests/second

What would you set for: minimum, desired, maximum, and what scaling policy would you use?

<details>
<summary>Solution</summary>

```
Capacity:
  Normal load: 1,000 rps ÷ 500 rps/instance = 2 instances
  Peak load:   5,000 rps ÷ 500 rps/instance = 10 instances

ASG Configuration:
  Minimum:  2  (always have 2 healthy instances)
  Desired:  3  (2 + 1 buffer for normal operation)
  Maximum: 12  (10 + 2 buffer for unexpected spikes)

Scaling Policy: Target Tracking
  Metric: ALBRequestCountPerTarget
  Target: 500 requests per target
  Scale-out cooldown: 60 seconds
  Scale-in cooldown: 300 seconds

For scheduled sales events, add a Scheduled Action:
  Scale to desired=10 before the event starts
  Scale back to desired=3 after the event ends
```

</details>

---

## Key Takeaways

| Concept | Summary |
|---|---|
| **EC2** | Virtual servers with full OS control; choose instance type for your workload |
| **Instance Families** | T (burstable), M (general), C (compute), R (memory), G/P (GPU) |
| **AMIs** | Templates for launching instances; use golden AMIs for consistency |
| **Security Groups** | Virtual firewalls; stateful, allow-only rules |
| **Pricing** | On-Demand (flexible), Reserved (committed savings), Spot (cheapest, interruptible) |
| **User Data** | Startup scripts that run on first boot |
| **Auto Scaling** | Automatically adjust instance count based on demand |
| **Placement Groups** | Control hardware placement: Cluster, Spread, Partition |
| **Elastic IP** | Static public IP you can move between instances |
| **Beanstalk** | PaaS — deploy without managing infrastructure |
| **ECS / Fargate** | Container orchestration — EC2 launch or serverless |
| **Lambda** | Serverless functions — pay per invocation, max 15 minutes |
| **Lightsail** | Simple fixed-price VMs for small workloads |

> **Remember:** Start with the simplest compute option that meets your needs. You can always migrate to more powerful or flexible services as your application grows.

---

## Next Steps

In the next lesson, you will explore **AWS Storage Services** — S3, EBS, EFS, and Glacier — and learn how to store, manage, and protect your data in the cloud.
