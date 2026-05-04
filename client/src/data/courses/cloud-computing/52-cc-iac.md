---
title: "Infrastructure as Code"
---

# Infrastructure as Code

In this lesson, you will learn how **Infrastructure as Code (IaC)** lets you define, provision, and manage cloud infrastructure using code instead of manual processes.

IaC is one of the most transformative practices in cloud computing — it turns infrastructure from something you click together in a console into something you version, review, test, and automate.

---

## What is Infrastructure as Code?

**Infrastructure as Code** means managing your servers, networks, databases, and other infrastructure resources by writing code in definition files, rather than configuring them manually through a cloud console.

### Before IaC (Manual Process)

```
1. Log in to AWS Console
2. Click "Create VPC" → fill in form → click "Create"
3. Click "Create Subnet" → fill in form → click "Create"
4. Click "Launch Instance" → pick AMI → pick size → click "Launch"
5. Repeat 50 more times...
6. Hope you remember what you did when something breaks
```

### After IaC (Automated Process)

```hcl
# main.tf — your entire infrastructure in a file
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "web" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.web.id
}
```

```bash
terraform apply    # Creates everything automatically
```

---

## Why IaC Matters

| Benefit | Description |
|---------|-------------|
| **Repeatability** | Create identical environments every time |
| **Version control** | Track every infrastructure change in Git |
| **Collaboration** | Team members can review infrastructure changes via pull requests |
| **Speed** | Provision complex environments in minutes, not days |
| **Documentation** | The code *is* the documentation of your infrastructure |
| **Disaster recovery** | Rebuild entire environments from code |
| **Cost tracking** | See exactly what resources you're paying for |
| **Testing** | Validate infrastructure before deploying it |

### The Cost of Manual Infrastructure

```
Manual:    2 hours to set up    → 2 hours to do it again
           No record of what was done
           "Works on my environment" problems
           Drift between environments

IaC:       2 hours to write code → 2 minutes to run it again
           Full Git history
           Identical environments guaranteed
           Drift is detected and corrected
```

---

## Declarative vs Imperative

There are two approaches to writing IaC:

### Declarative (What)

You describe the **desired end state**, and the tool figures out how to get there:

```hcl
# Terraform (Declarative)
# "I want 3 web servers"
resource "aws_instance" "web" {
  count         = 3
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
}
```

The tool compares the desired state to the current state and makes only the necessary changes.

### Imperative (How)

You write **step-by-step instructions** for what to do:

```python
# Pulumi / CDK (Imperative)
# "Create a server, then create another, then another"
for i in range(3):
    server = ec2.Instance(
        f"web-{i}",
        instance_type="t3.micro",
        ami="ami-0c55b159cbfafe1f0"
    )
```

You tell the tool exactly which steps to execute and in what order.

### Comparison

| Aspect | Declarative | Imperative |
|--------|------------|------------|
| **You specify** | What you want | How to do it |
| **Examples** | Terraform, CloudFormation | Pulumi, CDK, scripts |
| **Learning curve** | Lower (for infrastructure) | Higher (general programming) |
| **Flexibility** | Moderate | High |
| **State management** | Built-in | Varies |
| **Idempotency** | Automatic | Must be implemented |

> **Idempotency** means running the same code twice produces the same result. Declarative tools handle this automatically — if the resource already exists, it won't create a duplicate.

---

## IaC Tools Overview

### Cloud-Specific Tools

| Tool | Cloud | Language | Type |
|------|-------|----------|------|
| **CloudFormation** | AWS | JSON/YAML | Declarative |
| **CDK** | AWS (multi-cloud via cdktf) | TypeScript, Python, etc. | Imperative |
| **Bicep** | Azure | Bicep DSL | Declarative |
| **ARM Templates** | Azure | JSON | Declarative |
| **Deployment Manager** | GCP | YAML/Jinja2/Python | Declarative |

### Multi-Cloud Tools

| Tool | Language | Type | Best For |
|------|----------|------|----------|
| **Terraform** | HCL | Declarative | Multi-cloud, most popular |
| **Pulumi** | TypeScript, Python, Go, etc. | Imperative | Developers who prefer real languages |
| **Crossplane** | YAML (Kubernetes) | Declarative | Kubernetes-native infrastructure |

---

## AWS CloudFormation

CloudFormation is AWS's native IaC tool:

```yaml
# cloudformation-template.yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: Simple web server

Resources:
  WebServerVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: WebServerVPC

  WebServerSubnet:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref WebServerVPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: us-east-1a

  WebServer:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t3.micro
      ImageId: ami-0c55b159cbfafe1f0
      SubnetId: !Ref WebServerSubnet

Outputs:
  ServerIP:
    Value: !GetAtt WebServer.PublicIp
    Description: Web server public IP
```

```bash
# Deploy with AWS CLI
aws cloudformation create-stack \
  --stack-name my-web-server \
  --template-body file://cloudformation-template.yaml
```

---

## Azure Bicep

Bicep is Azure's modern IaC language (replaces ARM templates):

```bicep
// main.bicep
param location string = resourceGroup().location
param vmName string = 'myWebServer'

resource vnet 'Microsoft.Network/virtualNetworks@2023-05-01' = {
  name: 'myVNet'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: ['10.0.0.0/16']
    }
    subnets: [
      {
        name: 'default'
        properties: {
          addressPrefix: '10.0.1.0/24'
        }
      }
    ]
  }
}

resource vm 'Microsoft.Compute/virtualMachines@2023-07-01' = {
  name: vmName
  location: location
  properties: {
    hardwareProfile: {
      vmSize: 'Standard_B1s'
    }
    // ... additional VM configuration
  }
}
```

```bash
# Deploy with Azure CLI
az deployment group create \
  --resource-group myResourceGroup \
  --template-file main.bicep
```

---

## Terraform Deep Dive

Terraform by HashiCorp is the most widely used multi-cloud IaC tool. Let's explore it in depth.

### How Terraform Works

```
┌─────────────────┐     ┌──────────────┐     ┌───────────────┐
│  .tf files       │────▶│  Terraform   │────▶│ Cloud Provider│
│  (your code)     │     │  Engine      │     │ API           │
└─────────────────┘     └──────┬───────┘     └───────────────┘
                               │
                        ┌──────▼───────┐
                        │  State File  │
                        │  (.tfstate)  │
                        └──────────────┘
```

1. You write `.tf` files describing your infrastructure
2. Terraform compares your code to the current state
3. Terraform calculates what changes are needed
4. Terraform calls cloud provider APIs to make those changes
5. Terraform updates the state file

### Providers

Providers are plugins that let Terraform interact with cloud platforms:

```hcl
# Tell Terraform which providers to use
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS provider
provider "aws" {
  region = "us-east-1"
}
```

### Resources

Resources are the actual infrastructure objects you want to create:

```hcl
# Create an S3 bucket
resource "aws_s3_bucket" "website" {
  bucket = "my-website-bucket-unique-name"

  tags = {
    Environment = "production"
    Project     = "website"
  }
}

# Create a security group
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Allow HTTP and HTTPS"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

### Variables

Variables make your Terraform code reusable:

```hcl
# variables.tf
variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "instance_count" {
  description = "Number of instances to create"
  type        = number
  default     = 1
}

# Use variables in resources
resource "aws_instance" "web" {
  count         = var.instance_count
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type

  tags = {
    Name        = "web-${var.environment}-${count.index}"
    Environment = var.environment
  }
}
```

### Outputs

Outputs expose values after `terraform apply`:

```hcl
# outputs.tf
output "instance_ids" {
  description = "IDs of the created instances"
  value       = aws_instance.web[*].id
}

output "public_ips" {
  description = "Public IP addresses"
  value       = aws_instance.web[*].public_ip
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}
```

```bash
$ terraform output
instance_ids = ["i-0abc123", "i-0def456"]
public_ips   = ["54.23.45.67", "54.23.45.68"]
vpc_id       = "vpc-0abc123def456"
```

### Modules

Modules are reusable packages of Terraform code:

```hcl
# modules/vpc/main.tf
variable "cidr_block" {
  type = string
}

variable "name" {
  type = string
}

resource "aws_vpc" "this" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true

  tags = {
    Name = var.name
  }
}

output "vpc_id" {
  value = aws_vpc.this.id
}

# -----------------------------------
# main.tf (root module — uses the vpc module)
module "production_vpc" {
  source     = "./modules/vpc"
  cidr_block = "10.0.0.0/16"
  name       = "production"
}

module "staging_vpc" {
  source     = "./modules/vpc"
  cidr_block = "10.1.0.0/16"
  name       = "staging"
}
```

---

## State Management

Terraform's **state file** tracks what resources exist and their current configuration. It is critical to manage state properly.

### Local State (Default)

```bash
# State is stored locally in terraform.tfstate
$ ls
main.tf  terraform.tfstate  terraform.tfstate.backup
```

**Problem:** Only one person can work on infrastructure at a time, and losing the state file means losing track of your resources.

### Remote State (Production)

Store state in a shared, locked backend:

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"   # Prevents concurrent modifications
    encrypt        = true
  }
}
```

### State Locking

When someone runs `terraform apply`, the state is **locked** so no one else can make changes at the same time:

```
Developer A: terraform apply → LOCK acquired → making changes...
Developer B: terraform apply → ERROR: State is locked by Developer A
Developer A: ...changes complete → LOCK released
Developer B: terraform apply → LOCK acquired → making changes...
```

### Remote Backend Options

| Backend | Locking | Encryption | Best For |
|---------|---------|-----------|----------|
| **S3 + DynamoDB** | Yes | Yes | AWS users |
| **Azure Blob Storage** | Yes | Yes | Azure users |
| **GCS** | Yes | Yes | GCP users |
| **Terraform Cloud** | Yes | Yes | Any cloud, managed service |
| **Consul** | Yes | Optional | HashiCorp stack |

---

## Terraform Workflow

### Core Commands

```bash
# Initialize: download providers and set up backend
terraform init

# Format: auto-format your .tf files
terraform fmt

# Validate: check syntax and configuration
terraform validate

# Plan: preview what changes will be made
terraform plan

# Apply: create/update infrastructure
terraform apply

# Destroy: tear down all resources
terraform destroy
```

### The Plan-Apply Cycle

```bash
$ terraform plan
# Terraform shows what it will do:
# + aws_instance.web        (create)
# ~ aws_security_group.web  (modify: add port 443)
# - aws_s3_bucket.old       (destroy)

# Review the plan, then apply
$ terraform apply
# Type "yes" to confirm
```

| Symbol | Meaning |
|--------|---------|
| `+` | Resource will be **created** |
| `~` | Resource will be **modified** in place |
| `-` | Resource will be **destroyed** |
| `-/+` | Resource will be **replaced** (destroy then create) |

---

## Best Practices

### 1. Modular Design

```
infrastructure/
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── database/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   │   ├── main.tf
│   │   └── terraform.tfvars
│   └── prod/
│       ├── main.tf
│       └── terraform.tfvars
└── backend.tf
```

### 2. DRY (Don't Repeat Yourself)

```hcl
# Use variables and locals to avoid repetition
locals {
  common_tags = {
    Project     = "myapp"
    Environment = var.environment
    ManagedBy   = "terraform"
    Owner       = "platform-team"
  }
}

resource "aws_instance" "web" {
  # ...
  tags = merge(local.common_tags, {
    Name = "web-server"
    Role = "web"
  })
}

resource "aws_instance" "api" {
  # ...
  tags = merge(local.common_tags, {
    Name = "api-server"
    Role = "api"
  })
}
```

### 3. Testing IaC

```bash
# Validate syntax
terraform validate

# Check formatting
terraform fmt -check

# Use Terratest for integration testing (Go)
# Use Checkov for security policy scanning
checkov -d .

# Use tflint for linting
tflint
```

---

## Drift Detection

**Drift** occurs when real infrastructure differs from what your code defines — for example, someone manually changes a setting in the console.

```bash
# Detect drift: compare state to real infrastructure
terraform plan

# If drift is detected, you'll see changes you didn't make:
# ~ aws_security_group.web
#     ingress.0.from_port: 80 -> 8080   ← someone changed this manually!

# Fix drift: bring infrastructure back to match your code
terraform apply
```

### Preventing Drift

1. **Never make manual changes** — always change the code
2. **Run periodic drift detection** (scheduled `terraform plan`)
3. **Use service control policies** to restrict console access
4. **Set up alerts** for out-of-band changes

---

## GitOps with IaC

**GitOps** means using Git as the single source of truth for both application code and infrastructure:

```
Developer pushes IaC change
        │
        ▼
  Pull Request created
        │
        ▼
  Automated plan runs (terraform plan)
        │
        ▼
  Team reviews plan + code
        │
        ▼
  PR merged to main
        │
        ▼
  Automated apply runs (terraform apply)
        │
        ▼
  Infrastructure updated
```

### GitOps Workflow with Atlantis

```yaml
# atlantis.yaml
version: 3
projects:
  - name: production
    dir: environments/prod
    workflow: default
    autoplan:
      when_modified: ["*.tf", "*.tfvars"]
      enabled: true
```

---

## Practical: Terraform VPC + EC2 Example

Let's build a complete example — a VPC with public subnet and a web server:

```hcl
# main.tf

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# --- VPC ---
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project}-vpc"
  }
}

# --- Public Subnet ---
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project}-public-subnet"
  }
}

# --- Internet Gateway ---
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project}-igw"
  }
}

# --- Route Table ---
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# --- Security Group ---
resource "aws_security_group" "web" {
  name        = "${var.project}-web-sg"
  description = "Allow HTTP and SSH"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- EC2 Instance ---
resource "aws_instance" "web" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = var.key_name

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y httpd
    systemctl start httpd
    systemctl enable httpd
    echo "<h1>Hello from Terraform!</h1>" > /var/www/html/index.html
  EOF

  tags = {
    Name = "${var.project}-web-server"
  }
}
```

```hcl
# variables.tf
variable "aws_region" {
  default = "us-east-1"
}

variable "project" {
  default = "demo"
}

variable "instance_type" {
  default = "t3.micro"
}

variable "ami_id" {
  description = "Amazon Linux 2 AMI ID"
  type        = string
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
}

variable "my_ip" {
  description = "Your IP for SSH access (CIDR format)"
  type        = string
}
```

```hcl
# outputs.tf
output "web_server_ip" {
  value       = aws_instance.web.public_ip
  description = "Public IP of the web server"
}

output "web_url" {
  value       = "http://${aws_instance.web.public_ip}"
  description = "URL of the web server"
}
```

```bash
# Deploy the infrastructure
terraform init
terraform plan -var="ami_id=ami-0c55b159cbfafe1f0" \
               -var="key_name=mykey" \
               -var="my_ip=203.0.113.50/32"
terraform apply
```

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| **IaC** | Manage infrastructure through code, not clicks |
| **Declarative** | Describe *what* you want; the tool figures out *how* |
| **Terraform** | Most popular multi-cloud IaC tool using HCL |
| **State** | Terraform tracks resources in a state file |
| **Remote state** | Store state in S3/Azure Blob/GCS with locking |
| **Modules** | Reusable, composable packages of Terraform code |
| **Drift** | When real infra differs from code — detect and fix it |
| **GitOps** | Use Git as the source of truth for infrastructure |

---

## Exercises

1. **Write a Terraform configuration** that creates an S3 bucket with versioning enabled and a bucket policy that allows public read access to objects.

2. **Create a reusable module** for a VPC with configurable CIDR block, number of subnets, and tags. Use it to create both a `dev` and `prod` VPC.

3. **Set up remote state** using S3 and DynamoDB. Verify that state locking works by trying to run `terraform apply` from two terminals simultaneously.

4. **Convert a CloudFormation template** to Terraform. Compare the two and note the differences in syntax and approach.

5. **Implement drift detection** by creating infrastructure with Terraform, making a manual change in the AWS Console, and running `terraform plan` to detect the drift.

---

## Further Reading

- Terraform Documentation — providers, resources, and modules reference
- AWS CloudFormation User Guide — templates, stacks, and best practices
- Azure Bicep Documentation — syntax, modules, and deployment
- "Terraform: Up & Running" by Yevgeniy Brikman — comprehensive Terraform guide
- Spacelift / Terraform Cloud — managed Terraform platforms

---
