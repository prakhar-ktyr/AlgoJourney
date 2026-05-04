---
title: "Azure Compute and Storage"
---

# Azure Compute and Storage

In this lesson, you will learn about Microsoft Azure's compute and storage services — the building blocks for running applications and managing data in the Azure cloud.

Azure offers a wide range of compute options (from virtual machines to serverless functions) and storage services (from blob storage to data lakes). Understanding when to use each service is key to building efficient, cost-effective cloud solutions.

---

## Azure Virtual Machines (VMs)

Azure Virtual Machines provide on-demand, scalable computing resources. A VM gives you the flexibility of virtualization without having to buy and maintain physical hardware.

### VM Sizes and Series

Azure organizes VM sizes into **series**, each optimized for different workloads:

| Series | Optimized For | Example Use Cases |
|--------|--------------|-------------------|
| **B** | Burstable | Dev/test, small databases, low-traffic web servers |
| **D** | General purpose | Enterprise apps, mid-tier databases, gaming servers |
| **E** | Memory optimized | In-memory analytics, large caches, SAP HANA |
| **F** | Compute optimized | Batch processing, gaming, CPU-intensive analytics |
| **N** | GPU enabled | Machine learning, 3D rendering, video encoding |
| **L** | Storage optimized | Big data, large databases, data warehousing |
| **M** | Memory intensive | Very large in-memory databases (up to 4 TB RAM) |

### VM Naming Convention

Azure VM names follow a pattern:

```
[Family] + [Sub-family]* + [# of vCPUs] + [Constrained vCPUs]* + [Additive Features] + [Accelerator Type]* + [Version]
```

**Example:** `Standard_D8s_v5`

- **D** = General purpose family
- **8** = 8 vCPUs
- **s** = Premium storage capable
- **v5** = Version 5

### Creating a VM with Azure CLI

```bash
# Create a resource group
az group create \
  --name myResourceGroup \
  --location eastus

# Create a VM
az vm create \
  --resource-group myResourceGroup \
  --name myVM \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys

# Open port 80 for web traffic
az vm open-port \
  --resource-group myResourceGroup \
  --name myVM \
  --port 80
```

### Managed Disks

Azure Managed Disks handle storage account management for you. They come in several performance tiers:

| Disk Type | Max IOPS | Max Throughput | Best For |
|-----------|----------|----------------|----------|
| **Ultra Disk** | 160,000 | 4,000 MB/s | SAP HANA, top-tier databases |
| **Premium SSD v2** | 80,000 | 1,200 MB/s | Production workloads needing tunable performance |
| **Premium SSD** | 20,000 | 900 MB/s | Production and performance-sensitive workloads |
| **Standard SSD** | 6,000 | 750 MB/s | Web servers, light enterprise apps |
| **Standard HDD** | 2,000 | 500 MB/s | Backup, non-critical, infrequent access |

```bash
# Create a managed disk
az disk create \
  --resource-group myResourceGroup \
  --name myDataDisk \
  --size-gb 128 \
  --sku Premium_LRS

# Attach disk to VM
az vm disk attach \
  --resource-group myResourceGroup \
  --vm-name myVM \
  --name myDataDisk
```

---

## VM Scale Sets

**Virtual Machine Scale Sets (VMSS)** let you create and manage a group of identical, load-balanced VMs. The number of VM instances can automatically increase or decrease in response to demand.

### Key Features

- **Auto-scaling** based on metrics (CPU, memory, custom metrics)
- **Load balancing** built in
- **High availability** across availability zones
- **Rolling upgrades** with no downtime

```bash
# Create a VM Scale Set
az vmss create \
  --resource-group myResourceGroup \
  --name myScaleSet \
  --image Ubuntu2204 \
  --upgrade-policy-mode automatic \
  --instance-count 2 \
  --admin-username azureuser \
  --generate-ssh-keys

# Enable autoscale
az monitor autoscale create \
  --resource-group myResourceGroup \
  --resource myScaleSet \
  --resource-type Microsoft.Compute/virtualMachineScaleSets \
  --name autoscale-config \
  --min-count 2 \
  --max-count 10 \
  --count 2

# Add a scale-out rule (CPU > 70%)
az monitor autoscale rule create \
  --resource-group myResourceGroup \
  --autoscale-name autoscale-config \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 2
```

### Availability Sets vs. Availability Zones

| Feature | Availability Sets | Availability Zones |
|---------|------------------|--------------------|
| **Scope** | Single data center | Across data centers |
| **Fault domains** | Up to 3 | Each zone is a fault domain |
| **Update domains** | Up to 20 | Managed per zone |
| **SLA** | 99.95% | 99.99% |
| **Use case** | Protect from rack failures | Protect from data center failures |

```bash
# Create an availability set
az vm availability-set create \
  --resource-group myResourceGroup \
  --name myAvailabilitySet \
  --platform-fault-domain-count 3 \
  --platform-update-domain-count 5
```

---

## Azure App Service

Azure App Service is a fully managed platform for building, deploying, and scaling web apps. It supports multiple languages: .NET, Java, Node.js, Python, PHP, and Ruby.

### App Service Plans

An App Service Plan defines the compute resources for your app:

| Tier | Features | Use Case |
|------|----------|----------|
| **Free (F1)** | Shared infrastructure, 1 GB disk, no custom domain | Testing and exploration |
| **Basic (B1-B3)** | Dedicated compute, custom domains, manual scale | Dev/test environments |
| **Standard (S1-S3)** | Auto-scale, deployment slots, VNet integration | Production workloads |
| **Premium (P1-P3v3)** | Enhanced performance, more slots, zone redundancy | High-traffic production |
| **Isolated (I1-I3v2)** | Private environment (ASE), network isolation | Enterprise compliance |

```bash
# Create an App Service Plan
az appservice plan create \
  --name myAppServicePlan \
  --resource-group myResourceGroup \
  --sku S1 \
  --is-linux

# Create a web app
az webapp create \
  --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name myUniqueAppName \
  --runtime "NODE:18-lts"
```

### Deployment Slots

Deployment slots let you run different versions of your app side by side and swap them instantly:

```bash
# Create a staging slot
az webapp deployment slot create \
  --name myUniqueAppName \
  --resource-group myResourceGroup \
  --slot staging

# Deploy to staging
az webapp deploy \
  --name myUniqueAppName \
  --resource-group myResourceGroup \
  --slot staging \
  --src-path ./app.zip

# Swap staging to production
az webapp deployment slot swap \
  --name myUniqueAppName \
  --resource-group myResourceGroup \
  --slot staging \
  --target-slot production
```

### Custom Domains

```bash
# Add a custom domain
az webapp config hostname add \
  --webapp-name myUniqueAppName \
  --resource-group myResourceGroup \
  --hostname www.example.com

# Bind an SSL certificate
az webapp config ssl bind \
  --name myUniqueAppName \
  --resource-group myResourceGroup \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

---

## Azure Functions

Azure Functions is a **serverless** compute service that lets you run event-driven code without managing infrastructure. You only pay for the compute time your code consumes.

### Triggers and Bindings

**Triggers** cause a function to run. Each function must have exactly one trigger:

| Trigger Type | Description | Example |
|-------------|-------------|---------|
| **HTTP** | Runs on HTTP request | REST API endpoints |
| **Timer** | Runs on a schedule (CRON) | Scheduled cleanup jobs |
| **Blob** | Runs when a blob is added/modified | Image processing pipeline |
| **Queue** | Runs when a queue message arrives | Order processing |
| **Event Hub** | Runs on event stream data | IoT telemetry ingestion |
| **Cosmos DB** | Runs on document changes | Change feed processing |

**Bindings** connect your function to other resources (input or output) without writing boilerplate:

```javascript
// function.json — Queue trigger with Blob output binding
{
  "bindings": [
    {
      "name": "orderMessage",
      "type": "queueTrigger",
      "direction": "in",
      "queueName": "orders",
      "connection": "AzureStorageConnection"
    },
    {
      "name": "receipt",
      "type": "blob",
      "direction": "out",
      "path": "receipts/{id}.json",
      "connection": "AzureStorageConnection"
    }
  ]
}
```

```javascript
// index.js — Process order and output receipt
export default async function (context, orderMessage) {
  context.log("Processing order:", orderMessage.id);

  const receipt = {
    orderId: orderMessage.id,
    processedAt: new Date().toISOString(),
    total: orderMessage.total,
    status: "completed",
  };

  // Output binding writes to blob automatically
  context.bindings.receipt = JSON.stringify(receipt);
}
```

### Durable Functions

Durable Functions extend Azure Functions to let you write **stateful** workflows in a serverless environment:

```javascript
// Orchestrator function — defines the workflow
import * as df from "durable-functions";

df.app.orchestration("orderWorkflow", function* (context) {
  // Step 1: Validate the order
  const validated = yield context.df.callActivity("validateOrder", order);

  // Step 2: Process payment
  const payment = yield context.df.callActivity("processPayment", validated);

  // Step 3: Ship the order
  const shipment = yield context.df.callActivity("shipOrder", payment);

  return shipment;
});
```

Durable Functions patterns include:
- **Function chaining** — sequential steps
- **Fan-out/fan-in** — parallel processing
- **Async HTTP APIs** — long-running operations
- **Monitor** — polling patterns
- **Human interaction** — approval workflows

---

## Azure Blob Storage

Azure Blob Storage is optimized for storing massive amounts of unstructured data — text, binary data, images, videos, logs, backups, and more.

### Access Tiers

| Tier | Storage Cost | Access Cost | Min Retention | Use Case |
|------|-------------|-------------|---------------|----------|
| **Hot** | Highest | Lowest | None | Frequently accessed data |
| **Cool** | Lower | Higher | 30 days | Infrequently accessed, stored 30+ days |
| **Cold** | Even lower | Even higher | 90 days | Rarely accessed, stored 90+ days |
| **Archive** | Lowest | Highest | 180 days | Compliance, long-term backup |

> **Note:** Archive tier data is offline. Rehydrating to Hot or Cool can take up to 15 hours (standard) or 1 hour (high priority).

```bash
# Create a storage account
az storage account create \
  --name mystorageaccount \
  --resource-group myResourceGroup \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2

# Create a blob container
az storage container create \
  --name mycontainer \
  --account-name mystorageaccount

# Upload a file
az storage blob upload \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --name myfile.txt \
  --file ./myfile.txt \
  --tier Hot

# Change blob tier
az storage blob set-tier \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --name myfile.txt \
  --tier Cool
```

### Lifecycle Management

Automatically move or delete blobs based on rules:

```json
{
  "rules": [
    {
      "name": "moveToCool",
      "type": "Lifecycle",
      "definition": {
        "filters": {
          "blobTypes": ["blockBlob"],
          "prefixMatch": ["logs/"]
        },
        "actions": {
          "baseBlob": {
            "tierToCool": { "daysAfterModificationGreaterThan": 30 },
            "tierToArchive": { "daysAfterModificationGreaterThan": 90 },
            "delete": { "daysAfterModificationGreaterThan": 365 }
          }
        }
      }
    }
  ]
}
```

---

## Azure Files

Azure Files offers fully managed file shares in the cloud, accessible via **SMB** and **NFS** protocols. Great for lift-and-shift migrations of apps that use file shares.

```bash
# Create a file share
az storage share-rm create \
  --storage-account mystorageaccount \
  --name myfileshare \
  --quota 100

# Mount on Linux
sudo mount -t cifs \
  //mystorageaccount.file.core.windows.net/myfileshare \
  /mnt/myfileshare \
  -o vers=3.0,username=mystorageaccount,password=<key>,dir_mode=0777,file_mode=0777
```

---

## Table Storage and Queue Storage

### Table Storage

A NoSQL key-value store for semi-structured data. Simple and cheap for storing large volumes of structured, non-relational data.

```bash
# Create a table
az storage table create \
  --name Customers \
  --account-name mystorageaccount

# Insert an entity
az storage entity insert \
  --account-name mystorageaccount \
  --table-name Customers \
  --entity PartitionKey=US RowKey=001 Name="Alice Smith" Email="alice@example.com"
```

| Feature | Table Storage | Cosmos DB Table API |
|---------|--------------|---------------------|
| **Latency** | Variable | < 10 ms guaranteed |
| **Throughput** | Up to 20,000 ops/s | Unlimited (with RUs) |
| **Global distribution** | Single region | Multi-region |
| **Indexing** | Primary key only | Automatic secondary |
| **Cost** | Very low | Higher |

### Queue Storage

Simple message queuing for decoupling application components:

```bash
# Create a queue
az storage queue create \
  --name myqueue \
  --account-name mystorageaccount

# Add a message
az storage message put \
  --queue-name myqueue \
  --account-name mystorageaccount \
  --content "Process order #12345"

# Peek at messages
az storage message peek \
  --queue-name myqueue \
  --account-name mystorageaccount
```

---

## Azure Data Lake Storage Gen2

Azure Data Lake Storage Gen2 combines the scalability of Blob Storage with a **hierarchical file system**, making it ideal for big data analytics.

### Key Capabilities

- **Hierarchical namespace** — real directories and file-level permissions
- **Hadoop-compatible** — works with Azure Databricks, HDInsight, Synapse
- **Fine-grained ACLs** — POSIX-style access control
- **Optimized for analytics** — high throughput for parallel reads

```bash
# Create a storage account with hierarchical namespace
az storage account create \
  --name mydatalake \
  --resource-group myResourceGroup \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2 \
  --hns true

# Create a filesystem (container)
az storage fs create \
  --name analytics \
  --account-name mydatalake

# Upload data
az storage fs file upload \
  --file-system analytics \
  --source ./data.csv \
  --path raw/2025/data.csv \
  --account-name mydatalake
```

---

## Azure Storage Comparison Summary

| Service | Data Type | Protocol | Best For |
|---------|-----------|----------|----------|
| **Blob Storage** | Unstructured (files, images, videos) | REST/HTTP | Media, backups, static content |
| **Azure Files** | File shares | SMB, NFS | Lift-and-shift, shared config files |
| **Disk Storage** | Block storage (VHDs) | Attached to VM | VM OS and data disks |
| **Table Storage** | Semi-structured (key-value) | REST/HTTP | IoT data, user profiles, metadata |
| **Queue Storage** | Messages (up to 64 KB) | REST/HTTP | Decoupling, task queues |
| **Data Lake Gen2** | Analytics data (big data) | REST/HTTP, HDFS | Data lakes, big data pipelines |

---

## Exercises

### Exercise 1: VM Deployment

Using Azure CLI, write the commands to:
1. Create a resource group named `webapp-rg` in `westus2`
2. Create a `Standard_D2s_v5` VM named `webserver` running Ubuntu
3. Open ports 80 and 443
4. Attach a 64 GB Premium SSD data disk

<details>
<summary>Solution</summary>

```bash
# 1. Resource group
az group create --name webapp-rg --location westus2

# 2. Create VM
az vm create \
  --resource-group webapp-rg \
  --name webserver \
  --image Ubuntu2204 \
  --size Standard_D2s_v5 \
  --admin-username azureuser \
  --generate-ssh-keys

# 3. Open ports
az vm open-port --resource-group webapp-rg --name webserver --port 80 --priority 100
az vm open-port --resource-group webapp-rg --name webserver --port 443 --priority 200

# 4. Attach disk
az disk create --resource-group webapp-rg --name webserver-data --size-gb 64 --sku Premium_LRS
az vm disk attach --resource-group webapp-rg --vm-name webserver --name webserver-data
```

</details>

### Exercise 2: Storage Lifecycle

Design a lifecycle management policy that:
- Moves blobs in the `logs/` prefix to Cool tier after 14 days
- Moves them to Archive tier after 60 days
- Deletes them after 180 days

<details>
<summary>Solution</summary>

```json
{
  "rules": [
    {
      "name": "logLifecycle",
      "type": "Lifecycle",
      "definition": {
        "filters": {
          "blobTypes": ["blockBlob"],
          "prefixMatch": ["logs/"]
        },
        "actions": {
          "baseBlob": {
            "tierToCool": { "daysAfterModificationGreaterThan": 14 },
            "tierToArchive": { "daysAfterModificationGreaterThan": 60 },
            "delete": { "daysAfterModificationGreaterThan": 180 }
          }
        }
      }
    }
  ]
}
```

</details>

### Exercise 3: Serverless Function

Write an Azure Function (Node.js) that:
- Triggers on HTTP POST requests
- Accepts a JSON body with `{ "name": "...", "email": "..." }`
- Validates the input
- Returns a 201 response with a welcome message

<details>
<summary>Solution</summary>

```javascript
export default async function (context, req) {
  const { name, email } = req.body || {};

  if (!name || !email) {
    context.res = {
      status: 400,
      body: { error: "Both 'name' and 'email' are required." },
    };
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    context.res = {
      status: 400,
      body: { error: "Invalid email format." },
    };
    return;
  }

  context.res = {
    status: 201,
    body: {
      message: `Welcome, ${name}! Your account with ${email} has been registered.`,
      timestamp: new Date().toISOString(),
    },
  };
}
```

</details>

---

## Key Takeaways

- **Azure VMs** come in multiple series (B, D, E, F, N) optimized for different workloads — choose based on your CPU, memory, and GPU needs.
- **VM Scale Sets** provide auto-scaling groups of identical VMs with built-in load balancing.
- **Availability Sets** protect against rack failures; **Availability Zones** protect against data center failures.
- **App Service** is a PaaS for web apps with deployment slots for zero-downtime deployments.
- **Azure Functions** offer serverless, event-driven compute with triggers and bindings for integration.
- **Durable Functions** add stateful orchestration workflows on top of serverless functions.
- **Blob Storage** has four access tiers (Hot, Cool, Cold, Archive) — use lifecycle policies to automate tier transitions.
- **Azure Files** provides managed SMB/NFS file shares for lift-and-shift scenarios.
- **Table Storage** and **Queue Storage** offer simple, low-cost NoSQL and messaging solutions.
- **Data Lake Storage Gen2** adds a hierarchical namespace to Blob Storage for big data analytics workloads.
