---
title: "GCP Overview and Core Services"
---

# GCP Overview and Core Services

In this lesson, you will learn about **Google Cloud Platform (GCP)** — its history, global infrastructure, core services, and how it compares to AWS and Azure. GCP brings the same technology that powers Google Search, YouTube, and Gmail to your cloud applications.

---

## A Brief History of GCP

Google Cloud Platform launched publicly in **2008** with App Engine, one of the first Platform-as-a-Service (PaaS) offerings. Here's how it evolved:

| Year | Milestone |
|------|-----------|
| **2008** | Google App Engine launches (Python only) |
| **2010** | Cloud Storage and BigQuery introduced |
| **2012** | Compute Engine (IaaS VMs) enters preview |
| **2013** | Compute Engine goes GA; PHP and Go support for App Engine |
| **2014** | Kubernetes open-sourced by Google |
| **2015** | Google Kubernetes Engine (GKE) launches; Cloud ML Engine preview |
| **2017** | Cloud Spanner GA; Cloud Functions beta |
| **2018** | Cloud Run announced; Anthos multi-cloud platform |
| **2020** | BigQuery Omni for multi-cloud analytics |
| **2023** | Duet AI for Google Cloud (AI assistant) |
| **2024** | Gemini integration across GCP services |

### Google's Cloud Philosophy

Google's approach to cloud computing is built on several core principles:

1. **Open source first** — Kubernetes, TensorFlow, Go, and many GCP tools are open source
2. **Data and AI leadership** — BigQuery, Vertex AI, and TPUs differentiate GCP
3. **Global network** — Google's private fiber network spans the globe
4. **Security by default** — Encryption at rest and in transit, zero-trust architecture
5. **Sustainability** — Carbon-neutral since 2007, aims for 24/7 carbon-free energy

---

## GCP Global Infrastructure

GCP's infrastructure is organized into a hierarchy of **regions**, **zones**, and **multi-regions**.

### Regions and Zones

```
Multi-region (e.g., US, EU, Asia)
  └── Region (e.g., us-central1)
        ├── Zone (us-central1-a)
        ├── Zone (us-central1-b)
        ├── Zone (us-central1-c)
        └── Zone (us-central1-f)
```

| Concept | Description | Example |
|---------|-------------|---------|
| **Zone** | A single deployment area within a region | `us-central1-a` |
| **Region** | A geographic area containing multiple zones | `us-central1` (Iowa) |
| **Multi-region** | A large geographic area with multiple regions | `US`, `EU`, `ASIA` |

### Key Regions (as of 2025)

| Region | Location | Zones |
|--------|----------|-------|
| `us-central1` | Iowa, USA | 4 |
| `us-east1` | South Carolina, USA | 3 |
| `us-west1` | Oregon, USA | 3 |
| `europe-west1` | Belgium | 3 |
| `europe-west2` | London, UK | 3 |
| `asia-east1` | Taiwan | 3 |
| `asia-south1` | Mumbai, India | 3 |
| `australia-southeast1` | Sydney, Australia | 3 |

GCP has **40+ regions** with **120+ zones** across the globe, and continues to expand.

### Google's Private Network

Unlike most cloud providers, Google owns one of the world's largest private networks:

- **Subsea cables** across the Atlantic, Pacific, and other oceans
- **Edge points of presence (PoPs)** in 180+ locations worldwide
- **Premium tier networking** routes traffic over Google's private backbone
- **Standard tier networking** uses public internet (cheaper but higher latency)

---

## Projects and Resource Hierarchy

GCP organizes resources in a hierarchy:

```
Organization (your-company.com)
  └── Folder (Engineering)
        └── Folder (Backend)
              └── Project (my-app-prod)
                    ├── Compute Engine VMs
                    ├── Cloud Storage buckets
                    └── BigQuery datasets
```

### Projects

A **project** is the fundamental unit of organization in GCP. Every resource belongs to a project.

| Property | Description |
|----------|-------------|
| **Project Name** | Human-readable label (can be changed) |
| **Project ID** | Globally unique identifier (immutable after creation) |
| **Project Number** | Auto-assigned numeric ID |

```bash
# Create a new project
gcloud projects create my-app-prod \
  --name="My App Production"

# Set the active project
gcloud config set project my-app-prod

# List all projects
gcloud projects list
```

### Identity and Access Management (IAM)

GCP IAM controls **who** (identity) has **what access** (role) to **which resource**.

**Key concepts:**

| Concept | Description | Example |
|---------|-------------|---------|
| **Principal** | Who is requesting access | User, service account, group |
| **Role** | Collection of permissions | `roles/storage.admin` |
| **Policy** | Binds principals to roles on a resource | "Alice is Storage Admin on bucket X" |

**Role types:**

| Type | Example | Description |
|------|---------|-------------|
| **Basic** | `roles/owner` | Broad access (Owner, Editor, Viewer) |
| **Predefined** | `roles/compute.instanceAdmin` | Fine-grained, service-specific |
| **Custom** | `roles/myCustomRole` | User-defined permission set |

```bash
# Grant a role to a user
gcloud projects add-iam-policy-binding my-app-prod \
  --member="user:alice@example.com" \
  --role="roles/compute.instanceAdmin.v1"

# List IAM policy
gcloud projects get-iam-policy my-app-prod

# Create a service account
gcloud iam service-accounts create my-service \
  --display-name="My Service Account"
```

> **Best Practice:** Follow the **principle of least privilege** — grant only the permissions needed, prefer predefined roles over basic roles.

---

## GCP Core Services Overview

### Compute Services

| Service | Type | Description | When to Use |
|---------|------|-------------|------------|
| **Compute Engine** | IaaS | Virtual machines | Full OS control, custom software |
| **App Engine** | PaaS | Managed app hosting | Web apps without infra management |
| **Cloud Functions** | FaaS | Event-driven serverless functions | Glue code, webhooks, lightweight APIs |
| **Cloud Run** | CaaS | Serverless containers | Containerized apps, any language/runtime |
| **GKE** | CaaS | Managed Kubernetes | Microservices, complex container orchestration |

```bash
# Compute Engine — create a VM
gcloud compute instances create my-vm \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud

# App Engine — deploy an app
gcloud app deploy app.yaml

# Cloud Functions — deploy a function
gcloud functions deploy helloWorld \
  --runtime=nodejs20 \
  --trigger-http \
  --allow-unauthenticated

# Cloud Run — deploy a container
gcloud run deploy my-service \
  --image=gcr.io/my-project/my-app \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated
```

### Storage Services

| Service | Type | Description | When to Use |
|---------|------|-------------|------------|
| **Cloud Storage** | Object | Scalable object storage | Files, backups, media, data lakes |
| **Persistent Disk** | Block | VM-attached block storage | VM boot/data disks |
| **Filestore** | File | Managed NFS file shares | Shared file systems, HPC |

```bash
# Create a Cloud Storage bucket
gcloud storage buckets create gs://my-unique-bucket \
  --location=us-central1

# Upload a file
gcloud storage cp ./data.csv gs://my-unique-bucket/data/

# List bucket contents
gcloud storage ls gs://my-unique-bucket/
```

### Database Services

| Service | Type | Description | When to Use |
|---------|------|-------------|------------|
| **Cloud SQL** | Relational | Managed MySQL, PostgreSQL, SQL Server | Traditional RDBMS workloads |
| **Cloud Spanner** | Relational | Globally distributed, horizontally scalable | Global apps needing strong consistency |
| **Firestore** | Document | Serverless NoSQL document database | Mobile/web apps, real-time sync |
| **Bigtable** | Wide-column | Petabyte-scale, low-latency NoSQL | IoT, time series, analytics |
| **Memorystore** | In-memory | Managed Redis and Memcached | Caching, session management |

### Analytics and AI

| Service | Description | Differentiator |
|---------|-------------|----------------|
| **BigQuery** | Serverless data warehouse | Analyze petabytes in seconds, SQL-based |
| **Dataflow** | Stream and batch data processing | Based on Apache Beam |
| **Dataproc** | Managed Spark and Hadoop | Easy migration from on-prem |
| **Vertex AI** | ML platform | Train, deploy, manage ML models |
| **Looker** | Business intelligence | Enterprise dashboards and analytics |

### Networking Services

| Service | Description | When to Use |
|---------|-------------|------------|
| **VPC** | Virtual Private Cloud | Isolate and segment networks |
| **Cloud Load Balancing** | Global/regional load balancing | Distribute traffic across instances |
| **Cloud CDN** | Content delivery network | Cache static content at edge |
| **Cloud DNS** | Managed DNS | Domain name resolution |
| **Cloud Armor** | DDoS protection and WAF | Protect internet-facing apps |
| **Cloud Interconnect** | Dedicated/partner connections | Hybrid cloud, low-latency connectivity |

---

## Developer Tools

### gcloud CLI

The `gcloud` CLI is the primary command-line tool for interacting with GCP:

```bash
# Install (macOS)
brew install google-cloud-sdk

# Initialize and authenticate
gcloud init
gcloud auth login

# Set default project and region
gcloud config set project my-project
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a

# View current configuration
gcloud config list

# Get help for any command
gcloud compute instances create --help
```

### Common gcloud Command Structure

```
gcloud [GROUP] [SUBGROUP] [ACTION] [ARGUMENTS] [FLAGS]
```

| Part | Example | Description |
|------|---------|-------------|
| GROUP | `compute` | Service group (compute, storage, sql, etc.) |
| SUBGROUP | `instances` | Resource type within the group |
| ACTION | `create` | What to do (create, list, delete, describe) |
| ARGUMENTS | `my-vm` | Resource name or identifier |
| FLAGS | `--zone=us-central1-a` | Configuration options |

### Cloud Console

The **Google Cloud Console** (console.cloud.google.com) is the web-based UI for managing GCP resources. Key features:

- **Dashboard** — overview of project resources and billing
- **Resource browser** — navigate and manage all services
- **Cloud Shell** — browser-based terminal with pre-installed tools
- **IAM & Admin** — manage users, roles, and permissions
- **Billing** — monitor costs and set budgets

### Cloud Shell

Cloud Shell provides a **free, browser-based terminal** with:

- Pre-installed `gcloud`, `kubectl`, `docker`, `terraform`, and more
- 5 GB of persistent home directory storage
- Built-in code editor (Theia-based)
- Runs on a temporary `e2-small` Compute Engine VM
- Auto-authenticated with your Google account

```bash
# Cloud Shell is accessed from the Console toolbar
# or directly at: shell.cloud.google.com

# It comes pre-configured:
gcloud config list  # Already set to your project
```

---

## GCP vs AWS vs Azure — Service Comparison

One of the biggest challenges when learning multi-cloud is mapping equivalent services across providers. Here's a comprehensive comparison:

### Compute

| Capability | AWS | Azure | GCP |
|-----------|-----|-------|-----|
| Virtual Machines | EC2 | Virtual Machines | Compute Engine |
| Managed App Hosting | Elastic Beanstalk | App Service | App Engine |
| Serverless Functions | Lambda | Functions | Cloud Functions |
| Serverless Containers | Fargate | Container Apps | Cloud Run |
| Kubernetes | EKS | AKS | GKE |
| Batch Processing | Batch | Batch | Batch |

### Storage

| Capability | AWS | Azure | GCP |
|-----------|-----|-------|-----|
| Object Storage | S3 | Blob Storage | Cloud Storage |
| Block Storage | EBS | Managed Disks | Persistent Disk |
| File Storage | EFS | Azure Files | Filestore |
| Archive Storage | S3 Glacier | Archive tier | Archive class |

### Databases

| Capability | AWS | Azure | GCP |
|-----------|-----|-------|-----|
| Managed RDBMS | RDS | Azure SQL / DB for PostgreSQL | Cloud SQL |
| Global Relational | Aurora Global | Cosmos DB (relational) | Cloud Spanner |
| NoSQL Document | DynamoDB | Cosmos DB | Firestore |
| NoSQL Wide-column | — | Cosmos DB (Cassandra) | Bigtable |
| In-memory Cache | ElastiCache | Cache for Redis | Memorystore |
| Data Warehouse | Redshift | Synapse Analytics | **BigQuery** |

### Networking

| Capability | AWS | Azure | GCP |
|-----------|-----|-------|-----|
| Virtual Network | VPC | VNet | VPC |
| Load Balancer | ALB/NLB | Load Balancer | Cloud Load Balancing |
| CDN | CloudFront | Azure CDN | Cloud CDN |
| DNS | Route 53 | Azure DNS | Cloud DNS |
| DDoS Protection | Shield | DDoS Protection | Cloud Armor |

### AI/ML

| Capability | AWS | Azure | GCP |
|-----------|-----|-------|-----|
| ML Platform | SageMaker | Azure ML | Vertex AI |
| Pre-trained AI APIs | Rekognition, Comprehend | Cognitive Services | Vision AI, NL API |
| Custom Chips | Inferentia/Trainium | — | **TPUs** |

---

## BigQuery — GCP's Differentiator

**BigQuery** is arguably GCP's most distinctive service. It's a fully managed, serverless data warehouse that can analyze petabytes of data using standard SQL.

### What Makes BigQuery Special?

| Feature | Description |
|---------|-------------|
| **Serverless** | No infrastructure to manage, no clusters to provision |
| **Separation of storage and compute** | Scale each independently |
| **Columnar storage** | Optimized for analytical queries |
| **Dremel engine** | Parallel query execution across thousands of nodes |
| **Streaming ingestion** | Real-time data loading |
| **ML built-in** | Create ML models with SQL (`CREATE MODEL`) |
| **BI Engine** | In-memory analysis for sub-second dashboards |
| **Free tier** | 1 TB of querying and 10 GB storage per month |

```sql
-- Query a public dataset (no setup needed!)
SELECT
  name,
  SUM(number) AS total
FROM
  `bigquery-public-data.usa_names.usa_1910_2013`
WHERE
  state = 'CA'
GROUP BY
  name
ORDER BY
  total DESC
LIMIT 10;
```

```bash
# Run a query from the command line
bq query --use_legacy_sql=false \
  'SELECT COUNT(*) AS total_rows
   FROM `bigquery-public-data.samples.shakespeare`'

# Load data into BigQuery
bq load \
  --source_format=CSV \
  --autodetect \
  mydataset.mytable \
  gs://my-bucket/data.csv
```

### BigQuery Pricing

| Model | How It Works | Best For |
|-------|-------------|----------|
| **On-demand** | $6.25 per TB scanned | Ad-hoc, unpredictable queries |
| **Capacity (editions)** | Reserved slots (compute units) | Predictable, high-volume workloads |
| **Storage** | $0.02/GB/month (active), $0.01/GB/month (long-term) | All use cases |
| **Free tier** | 1 TB queries + 10 GB storage/month | Learning and small projects |

---

## GCP Pricing and Discounts

GCP offers several pricing mechanisms that can significantly reduce costs:

### Pricing Models

| Model | Discount | How It Works |
|-------|----------|-------------|
| **On-demand** | 0% | Pay per second, no commitment |
| **Sustained Use Discounts (SUDs)** | Up to 30% | **Automatic** — no action needed. Applies when VMs run 25%+ of the month |
| **Committed Use Discounts (CUDs)** | Up to 57% | 1- or 3-year commitment for specific resources |
| **Preemptible/Spot VMs** | Up to 91% | Can be terminated with 30s notice |

> **Key Differentiator:** GCP's **Sustained Use Discounts are automatic**. Unlike AWS Reserved Instances, you don't need to purchase anything upfront — GCP automatically gives you discounts as your usage increases within a billing month.

### Sustained Use Discount Example

```
Usage in a month:     Discount applied:
First 25%             0% (full price)
25% - 50%             20% discount
50% - 75%             40% discount
75% - 100%            60% discount

Average discount for running a VM all month: ~30%
```

### Cost Management Tools

```bash
# Set a budget alert
gcloud billing budgets create \
  --billing-account=012345-ABCDEF-678910 \
  --display-name="Monthly Budget" \
  --budget-amount=1000 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90

# Export billing to BigQuery for analysis
gcloud billing export bigquery enable \
  --billing-account=012345-ABCDEF-678910 \
  --dataset=billing_export
```

---

## Getting Started with GCP

### Step-by-Step Setup

1. **Create a Google Cloud account** at cloud.google.com (free $300 credit for 90 days)
2. **Install the gcloud CLI**:

```bash
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash

# Verify installation
gcloud version
```

3. **Initialize and authenticate**:

```bash
gcloud init
# Follow the prompts to log in and select a project
```

4. **Create your first project**:

```bash
gcloud projects create my-first-project --name="My First Project"
gcloud config set project my-first-project
```

5. **Enable billing** (required for most services):

```bash
gcloud billing accounts list
gcloud billing projects link my-first-project \
  --billing-account=YOUR_BILLING_ACCOUNT_ID
```

---

## Exercises

### Exercise 1: Service Mapping

For each scenario, choose the most appropriate GCP service:

1. You need to run a containerized Python API with auto-scaling and no cluster management.
2. You want to analyze 5 TB of log data using SQL.
3. You need a globally distributed relational database with strong consistency.
4. You want to run a function that processes uploaded images.
5. You need managed MySQL for a WordPress site.

<details>
<summary>Solution</summary>

1. **Cloud Run** — serverless containers, auto-scales to zero
2. **BigQuery** — serverless data warehouse, SQL-based, handles petabytes
3. **Cloud Spanner** — globally distributed, strongly consistent relational DB
4. **Cloud Functions** — event-driven, triggered by Cloud Storage uploads
5. **Cloud SQL** — managed MySQL (also supports PostgreSQL and SQL Server)

</details>

### Exercise 2: IAM Configuration

Write gcloud commands to:
1. Create a service account called `api-backend`
2. Grant it the `roles/cloudsql.client` role on project `my-app-prod`
3. Create and download a key file

<details>
<summary>Solution</summary>

```bash
# 1. Create the service account
gcloud iam service-accounts create api-backend \
  --display-name="API Backend Service Account"

# 2. Grant Cloud SQL Client role
gcloud projects add-iam-policy-binding my-app-prod \
  --member="serviceAccount:api-backend@my-app-prod.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# 3. Create and download key
gcloud iam service-accounts keys create ./api-backend-key.json \
  --iam-account=api-backend@my-app-prod.iam.gserviceaccount.com
```

> **Note:** In production, prefer Workload Identity Federation over downloaded keys.

</details>

### Exercise 3: Cloud Provider Comparison

Fill in the GCP equivalent for each AWS/Azure service:

| AWS | Azure | GCP |
|-----|-------|-----|
| EC2 | Virtual Machines | ? |
| S3 | Blob Storage | ? |
| Lambda | Functions | ? |
| RDS | Azure SQL | ? |
| EKS | AKS | ? |
| Redshift | Synapse | ? |
| CloudFront | Azure CDN | ? |

<details>
<summary>Solution</summary>

| AWS | Azure | GCP |
|-----|-------|-----|
| EC2 | Virtual Machines | **Compute Engine** |
| S3 | Blob Storage | **Cloud Storage** |
| Lambda | Functions | **Cloud Functions** |
| RDS | Azure SQL | **Cloud SQL** |
| EKS | AKS | **GKE** |
| Redshift | Synapse | **BigQuery** |
| CloudFront | Azure CDN | **Cloud CDN** |

</details>

---

## Key Takeaways

- **GCP launched in 2008** with App Engine and has grown to 200+ services, powered by Google's massive global infrastructure.
- GCP's infrastructure uses **regions** (geographic areas), **zones** (isolated data centers), and **multi-regions** (for geo-redundant storage).
- **Projects** are the fundamental organizational unit — every resource belongs to a project.
- **IAM** follows a principal → role → resource model. Always apply the **principle of least privilege**.
- Core compute services span a spectrum: **Compute Engine** (IaaS) → **App Engine** (PaaS) → **Cloud Run** (CaaS) → **Cloud Functions** (FaaS).
- **BigQuery** is GCP's standout service — a serverless data warehouse that makes petabyte-scale analytics accessible via SQL.
- The `gcloud` CLI and **Cloud Shell** provide powerful command-line access to all GCP services.
- GCP offers **automatic Sustained Use Discounts** (up to 30%) — unlike AWS/Azure, no upfront commitment is required.
- When learning multi-cloud, use the **service comparison table** to map equivalent services across AWS, Azure, and GCP.
