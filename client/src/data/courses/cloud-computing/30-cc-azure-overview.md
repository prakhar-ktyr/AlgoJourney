---
title: "Azure Overview and Core Services"
---

# Azure Overview and Core Services

In this lesson, you will learn about **Microsoft Azure** — the second-largest cloud platform in the world. We will explore Azure's history, global infrastructure, account model, and the core services you need to know to start building on Azure.

---

## What Is Microsoft Azure?

Azure is Microsoft's cloud computing platform, offering **200+ services** spanning compute, storage, databases, networking, AI, DevOps, and more. It was announced in 2008 and launched publicly in **February 2010** as "Windows Azure," later renamed to "Microsoft Azure" in 2014 to reflect its support for Linux and open-source technologies.

### Cloud Market Share (Approximate, 2026)

| Provider | Market Share |
|----------|-------------|
| AWS | ~31% |
| **Microsoft Azure** | ~25% |
| Google Cloud | ~11% |
| Others | ~33% |

### Why Choose Azure?

| Reason | Details |
|--------|---------|
| **Enterprise integration** | Deep integration with Microsoft 365, Active Directory, Windows Server, SQL Server |
| **Hybrid cloud leader** | Azure Arc, Azure Stack let you run Azure services on-premises |
| **Open source friendly** | Supports Linux, Kubernetes, PostgreSQL, MySQL, and many OSS tools |
| **Compliance** | 100+ compliance certifications — more than any other cloud provider |
| **Global reach** | 60+ regions worldwide — more than any other cloud provider |

---

## Azure Global Infrastructure

Azure's infrastructure is organized into a hierarchy:

```
Geographies
  └── Region Pairs
        └── Regions
              └── Availability Zones
                    └── Data Centers
```

### Regions

A **region** is a set of data centers deployed within a specific geographic area and connected through a low-latency network.

**Examples of Azure regions:**

| Region Name | Location |
|-------------|----------|
| East US | Virginia, USA |
| West Europe | Netherlands |
| Southeast Asia | Singapore |
| Japan East | Tokyo |
| Brazil South | São Paulo |
| Central India | Pune |
| UK South | London |

> **How to choose a region:**
> 1. **Proximity** to your users (lower latency)
> 2. **Service availability** — not all services are in all regions
> 3. **Compliance** — data residency laws may require a specific region
> 4. **Pricing** — costs vary between regions

### Availability Zones

An **Availability Zone (AZ)** is one or more physically separate data centers within a region, each with independent power, cooling, and networking.

```
Region: East US
  ├── Availability Zone 1 (Data Center A)
  ├── Availability Zone 2 (Data Center B)
  └── Availability Zone 3 (Data Center C)
```

- Most regions have **3 Availability Zones**
- Deploying across zones gives you **99.99% SLA** for VMs
- Zones are connected with high-bandwidth, low-latency fiber

### Region Pairs

Each Azure region is **paired** with another region in the same geography (at least 300 miles apart) for disaster recovery:

| Primary Region | Paired Region |
|---------------|---------------|
| East US | West US |
| West Europe | North Europe |
| Southeast Asia | East Asia |
| Japan East | Japan West |
| Central India | South India |

**Benefits of region pairs:**
- During planned maintenance, only one region in a pair is updated at a time
- In a widespread outage, one region in each pair is prioritized for recovery
- Data stays within the same geography for compliance

### Geographies

A **geography** is a discrete market containing two or more regions. Geographies preserve data residency and compliance boundaries.

| Geography | Regions (examples) |
|-----------|-------------------|
| United States | East US, West US, Central US, ... |
| Europe | West Europe, North Europe, UK South, ... |
| Asia Pacific | Southeast Asia, East Asia, Japan East, ... |
| Middle East | UAE North, Qatar Central |

---

## Azure Account and Subscription Model

Understanding Azure's organizational hierarchy is essential:

```
Azure AD Tenant (Entra ID)
  └── Management Groups
        └── Subscriptions
              └── Resource Groups
                    └── Resources
```

### Azure Account

An Azure **account** is tied to an identity (email address). When you sign up, you get:

- A **free trial** with $200 credit for 30 days
- **12 months of free services** (VMs, storage, databases with limits)
- **Always-free services** (25+ services including Functions, App Service, Cosmos DB with limits)

### Subscriptions

A **subscription** is a billing and access boundary. One account can have multiple subscriptions.

| Subscription Type | Description |
|-------------------|-------------|
| **Free Trial** | $200 credit, 30 days, limited to certain VM sizes |
| **Pay-As-You-Go** | Standard billing; charged for what you use |
| **Enterprise Agreement (EA)** | Volume licensing for large organizations |
| **CSP (Cloud Solution Provider)** | Purchased through a Microsoft partner |
| **Visual Studio / Dev Essentials** | Monthly credits for MSDN subscribers |

**Why use multiple subscriptions?**
- **Billing separation** — dev, staging, prod have separate bills
- **Access control** — different teams manage different subscriptions
- **Quota management** — each subscription has resource limits

### Resource Groups

A **Resource Group** is a logical container for Azure resources. Every Azure resource must belong to exactly one resource group.

```bash
# Create a resource group using Azure CLI
az group create \
  --name rg-webapp-prod \
  --location eastus

# List all resources in a resource group
az resource list --resource-group rg-webapp-prod --output table
```

**Best practices for resource groups:**
- Group resources that share the **same lifecycle** (deploy and delete together)
- Use a consistent naming convention: `rg-<project>-<environment>`
- Apply **tags** for cost tracking and organization
- Resources in a group can be in **different regions** — the group's region only stores metadata

### Azure Resource Manager (ARM)

**ARM** is the deployment and management layer for Azure. Every request to create, update, or delete a resource goes through ARM.

```
User/App/Script
       │
       ▼
 Azure Resource Manager (ARM)
       │
       ├──▶ Compute (VMs, Functions)
       ├──▶ Storage (Blob, Disks)
       ├──▶ Networking (VNets, LBs)
       └──▶ Databases (SQL, Cosmos DB)
```

**Benefits of ARM:**
- **Declarative templates** — define infrastructure as code (ARM templates, Bicep)
- **Consistent management** — all tools (Portal, CLI, SDKs) use the same API
- **RBAC** — fine-grained role-based access control on any resource
- **Tagging** — organize and track resources by project, environment, cost center
- **Dependency management** — ARM deploys resources in the correct order

---

## Core Compute Services

### Azure Virtual Machines

Azure VMs are **IaaS** (Infrastructure as a Service) — you get full control over the OS.

| VM Series | Optimized For | Example Sizes |
|-----------|--------------|---------------|
| **B-series** | Burstable, light workloads | B1s, B2s |
| **D-series** | General purpose | D2s_v5, D4s_v5 |
| **E-series** | Memory-intensive | E4s_v5, E16s_v5 |
| **F-series** | Compute-intensive | F2s_v2, F8s_v2 |
| **N-series** | GPU (AI/ML, graphics) | NC6s_v3, ND40rs_v2 |
| **L-series** | Storage-intensive | L8s_v3, L32s_v3 |

```bash
# Create a Linux VM
az vm create \
  --resource-group rg-webapp-prod \
  --name vm-web-01 \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys

# Open port 80 for web traffic
az vm open-port --port 80 \
  --resource-group rg-webapp-prod \
  --name vm-web-01
```

### Azure App Service

App Service is a **PaaS** (Platform as a Service) for hosting web apps, REST APIs, and mobile backends — **no infrastructure management required**.

| Feature | Details |
|---------|---------|
| Languages | .NET, Java, Node.js, Python, PHP, Ruby, Go |
| Scaling | Manual, auto-scale based on metrics |
| CI/CD | GitHub Actions, Azure DevOps, local Git |
| SSL/TLS | Free managed certificates |
| Custom domains | Map your own domain names |

```bash
# Create an App Service plan and web app
az appservice plan create \
  --name plan-webapp \
  --resource-group rg-webapp-prod \
  --sku B1 --is-linux

az webapp create \
  --name my-webapp-2026 \
  --resource-group rg-webapp-prod \
  --plan plan-webapp \
  --runtime "NODE:20-lts"

# Deploy from a GitHub repository
az webapp deployment source config \
  --name my-webapp-2026 \
  --resource-group rg-webapp-prod \
  --repo-url https://github.com/user/repo \
  --branch main
```

### Azure Functions

Azure Functions is a **serverless** compute service. You write code; Azure handles the infrastructure.

| Feature | Details |
|---------|---------|
| Trigger types | HTTP, Timer, Queue, Blob, Cosmos DB, Event Hub, ... |
| Languages | C#, JavaScript, Python, Java, PowerShell, TypeScript |
| Pricing | **Consumption plan** — pay only per execution (first 1M free/month) |
| Cold start | Applies on Consumption plan; Premium plan avoids it |

```javascript
// Example: HTTP-triggered Azure Function (Node.js)
module.exports = async function (context, req) {
  const name = req.query.name || "World";
  context.res = {
    body: `Hello, ${name}! Welcome to Azure Functions.`,
  };
};
```

### When to Use What?

| Scenario | Service |
|----------|---------|
| Full OS control needed | Virtual Machines |
| Web app, don't want to manage servers | App Service |
| Event-driven, short-lived code | Azure Functions |
| Containerized workloads | Azure Container Instances / AKS |

---

## Core Storage Services

### Azure Blob Storage

Blob (Binary Large Object) Storage is Azure's **object storage** service — equivalent to AWS S3.

| Tier | Access Pattern | Use Case |
|------|---------------|----------|
| **Hot** | Frequent | Active data, websites |
| **Cool** | Infrequent (30+ days) | Short-term backups |
| **Cold** | Rare (90+ days) | Compliance data |
| **Archive** | Very rare (180+ days) | Long-term regulatory archives |

```bash
# Create a storage account
az storage account create \
  --name stwebappprod2026 \
  --resource-group rg-webapp-prod \
  --location eastus \
  --sku Standard_LRS

# Create a container (similar to an S3 bucket)
az storage container create \
  --name images \
  --account-name stwebappprod2026

# Upload a blob
az storage blob upload \
  --account-name stwebappprod2026 \
  --container-name images \
  --name logo.png \
  --file ./logo.png
```

### Azure Managed Disks

Managed Disks are block storage for VMs — equivalent to AWS EBS.

| Disk Type | Max IOPS | Use Case |
|-----------|----------|----------|
| **Standard HDD** | 500 | Dev/test, non-critical |
| **Standard SSD** | 6,000 | Web servers, light workloads |
| **Premium SSD** | 20,000 | Production databases |
| **Ultra Disk** | 160,000 | SAP HANA, top-tier databases |

---

## Core Database Services

### Azure SQL Database

A fully managed relational database engine based on SQL Server.

| Feature | Details |
|---------|---------|
| Engine | SQL Server (latest stable) |
| Scaling | Serverless auto-scale or provisioned |
| HA | Built-in, 99.99% SLA |
| Backups | Automated, point-in-time restore (up to 35 days) |

```bash
# Create an Azure SQL server and database
az sql server create \
  --name sql-webapp-prod \
  --resource-group rg-webapp-prod \
  --location eastus \
  --admin-user sqladmin \
  --admin-password 'SecurePass123!'

az sql db create \
  --resource-group rg-webapp-prod \
  --server sql-webapp-prod \
  --name db-webapp \
  --service-objective S0
```

### Azure Cosmos DB

A globally distributed, multi-model NoSQL database with **single-digit millisecond** response times.

| API | Data Model | Use Case |
|-----|-----------|----------|
| NoSQL (native) | Document (JSON) | Modern web/mobile apps |
| MongoDB | Document (BSON) | Migrate MongoDB workloads |
| Cassandra | Wide-column | IoT, time-series |
| Gremlin | Graph | Social networks, recommendations |
| Table | Key-value | Simple key-value lookups |

---

## Core Networking Services

### Azure Virtual Network (VNet)

A VNet is your **private network** in Azure. It is the foundation for all networking.

```
VNet: 10.0.0.0/16
  ├── Subnet: web-tier     (10.0.1.0/24)
  ├── Subnet: app-tier     (10.0.2.0/24)
  └── Subnet: db-tier      (10.0.3.0/24)
```

```bash
# Create a VNet with a subnet
az network vnet create \
  --resource-group rg-webapp-prod \
  --name vnet-prod \
  --address-prefix 10.0.0.0/16 \
  --subnet-name web-tier \
  --subnet-prefix 10.0.1.0/24
```

Key networking components:

| Component | Purpose |
|-----------|---------|
| **NSG (Network Security Group)** | Firewall rules for subnets/NICs |
| **Azure Load Balancer** | Layer 4 (TCP/UDP) load balancing |
| **Application Gateway** | Layer 7 (HTTP/HTTPS) load balancing + WAF |
| **VPN Gateway** | Site-to-site VPN to on-premises |
| **ExpressRoute** | Dedicated private connection to Azure |
| **Azure DNS** | Host your DNS zones |
| **Azure Front Door** | Global HTTP load balancer + CDN + WAF |

---

## Identity and Access: Azure AD / Microsoft Entra ID

**Microsoft Entra ID** (formerly Azure Active Directory) is Azure's cloud identity and access management service.

| Feature | Description |
|---------|-------------|
| **Single Sign-On (SSO)** | One identity for Azure, Microsoft 365, and thousands of SaaS apps |
| **Multi-Factor Authentication (MFA)** | Extra security layer beyond passwords |
| **Conditional Access** | Grant or deny access based on conditions (location, device, risk) |
| **RBAC** | Assign granular roles to users, groups, or service principals |
| **B2B/B2C** | External identity management for partners and customers |

### RBAC (Role-Based Access Control)

Azure RBAC controls who can do what on which resources.

| Concept | Description |
|---------|-------------|
| **Security Principal** | Who (user, group, service principal, managed identity) |
| **Role Definition** | What they can do (Owner, Contributor, Reader, custom) |
| **Scope** | Where (management group, subscription, resource group, resource) |

**Built-in roles:**

| Role | Permissions |
|------|------------|
| **Owner** | Full access + can assign roles to others |
| **Contributor** | Full access, but cannot assign roles |
| **Reader** | View-only access |
| **User Access Administrator** | Manage user access (role assignments) |

```bash
# Assign the Contributor role to a user on a resource group
az role assignment create \
  --assignee user@company.com \
  --role Contributor \
  --resource-group rg-webapp-prod
```

---

## Management Tools

### Azure Portal

The **web-based GUI** for managing Azure resources. Access it at [portal.azure.com](https://portal.azure.com).

- Visual resource creation and management
- Dashboard customization
- Cost analysis and budgets
- Cloud Shell (Bash or PowerShell in the browser)

### Azure CLI

A cross-platform command-line tool for managing Azure resources.

```bash
# Install Azure CLI (macOS)
brew install azure-cli

# Login
az login

# List all resource groups
az group list --output table

# Common pattern: az <service> <action> --parameters
az vm list --output table
az storage account list --output table
```

### Azure PowerShell

PowerShell module for Azure management — preferred by Windows admins and for scripting complex workflows.

```powershell
# Install the Az module
Install-Module -Name Az -Scope CurrentUser

# Login
Connect-AzAccount

# Create a resource group
New-AzResourceGroup -Name "rg-demo" -Location "eastus"

# List VMs
Get-AzVM | Format-Table Name, Location, ResourceGroupName
```

### ARM Templates and Bicep

**Infrastructure as Code** for Azure.

**ARM Template (JSON):**

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "resources": [
    {
      "type": "Microsoft.Storage/storageAccounts",
      "apiVersion": "2023-01-01",
      "name": "stdemoaccount2026",
      "location": "eastus",
      "sku": { "name": "Standard_LRS" },
      "kind": "StorageV2"
    }
  ]
}
```

**Bicep (simpler syntax, compiles to ARM):**

```bicep
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'stdemoaccount2026'
  location: 'eastus'
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}
```

```bash
# Deploy a Bicep template
az deployment group create \
  --resource-group rg-demo \
  --template-file main.bicep
```

> **Tip:** Bicep is now the recommended IaC language for Azure — it is cleaner, shorter, and easier to learn than raw ARM JSON.

---

## Pricing and Cost Management

### Azure Pricing Calculator

Use the [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/) to estimate costs before deploying.

**Steps:**
1. Add services (VMs, databases, storage, etc.)
2. Configure each service (size, region, redundancy)
3. Review the monthly estimate
4. Export or share the estimate

### TCO (Total Cost of Ownership) Calculator

The [TCO Calculator](https://azure.microsoft.com/pricing/tco/calculator/) compares the cost of running workloads **on-premises vs. in Azure**.

**It accounts for:**
- Hardware costs (servers, storage, networking)
- Software licensing
- Electricity and cooling
- IT labor for maintenance
- Data center space

### Azure Cost Management

Built-in tools for monitoring and controlling cloud spend:

| Feature | Description |
|---------|-------------|
| **Cost Analysis** | Visualize spending by service, resource group, tag |
| **Budgets** | Set spending limits with alerts |
| **Advisor Recommendations** | Right-size VMs, eliminate idle resources |
| **Reservations** | Save up to 72% with 1-year or 3-year commitments |
| **Spot VMs** | Up to 90% discount for interruptible workloads |

---

## Azure vs AWS: Quick Comparison

| Category | AWS | Azure |
|----------|-----|-------|
| Compute | EC2 | Virtual Machines |
| Serverless | Lambda | Azure Functions |
| PaaS Web Hosting | Elastic Beanstalk | App Service |
| Object Storage | S3 | Blob Storage |
| Block Storage | EBS | Managed Disks |
| Relational DB | RDS | Azure SQL Database |
| NoSQL | DynamoDB | Cosmos DB |
| Virtual Network | VPC | VNet |
| Identity | IAM | Entra ID (Azure AD) |
| IaC | CloudFormation | ARM Templates / Bicep |
| CLI | aws cli | az cli |
| Kubernetes | EKS | AKS |

---

## Exercises

### Exercise 1: Region Selection

A European e-commerce company needs to deploy an application for customers in Germany. Data must stay within the EU due to GDPR. Which Azure region(s) would you recommend, and why?

<details>
<summary>Solution</summary>

**Primary:** Germany West Central (Frankfurt)
**Secondary (paired):** Germany North (Berlin)

**Reasoning:**
1. **Proximity** — Both regions are in Germany, providing low latency for German customers.
2. **Compliance** — Data stays within the EU, satisfying GDPR requirements.
3. **Disaster recovery** — Germany North is the paired region for Germany West Central, giving built-in DR capabilities.

If Germany-specific regions are not required, **West Europe** (Netherlands) and **North Europe** (Ireland) are also popular EU choices with broad service availability.

</details>

### Exercise 2: Service Matching

Match each requirement to the best Azure service:

1. Run a Node.js web API without managing servers.
2. Store 500 TB of video files with infrequent access.
3. Run a SQL Server database with automatic backups.
4. Execute a function every time a file is uploaded.
5. Host a globally distributed NoSQL database with <10ms reads.

<details>
<summary>Solutions</summary>

1. **App Service** — PaaS for web apps with built-in Node.js support.
2. **Blob Storage (Cool tier)** — cost-effective for infrequent access to large objects.
3. **Azure SQL Database** — fully managed SQL Server with automated backups.
4. **Azure Functions** with a **Blob trigger** — runs code in response to new blobs.
5. **Azure Cosmos DB** — globally distributed, multi-model NoSQL with guaranteed low latency.

</details>

### Exercise 3: Organize Resources

You are building a project with three environments: dev, staging, and production. Each environment has a web app, a database, and a storage account. How would you organize these resources using subscriptions and resource groups?

<details>
<summary>Solution</summary>

**Option A — One subscription, multiple resource groups (simplest):**

```
Subscription: MyProject
  ├── rg-myproject-dev
  │     ├── app-myproject-dev
  │     ├── sql-myproject-dev
  │     └── st-myproject-dev
  ├── rg-myproject-staging
  │     ├── app-myproject-staging
  │     ├── sql-myproject-staging
  │     └── st-myproject-staging
  └── rg-myproject-prod
        ├── app-myproject-prod
        ├── sql-myproject-prod
        └── st-myproject-prod
```

**Option B — Separate subscriptions per environment (better isolation):**

```
Subscription: MyProject-Dev     → rg-myproject-dev
Subscription: MyProject-Staging → rg-myproject-staging
Subscription: MyProject-Prod   → rg-myproject-prod
```

Option B provides stronger billing separation and access control but adds management overhead. For small teams, Option A is usually sufficient.

</details>

### Exercise 4: Cost Estimation

Use the Azure Pricing Calculator concept to estimate the monthly cost of:
- 1x Standard_B2s VM (2 vCPUs, 4 GB RAM) running Linux 24/7
- 100 GB of Blob Storage (Hot tier)
- 1x Azure SQL Database (Basic tier, 5 DTU)

<details>
<summary>Approximate Solution (East US, pay-as-you-go)</summary>

| Resource | Approximate Monthly Cost |
|----------|------------------------|
| B2s VM (Linux, 730 hours) | ~$30 |
| Blob Storage (100 GB Hot) | ~$2 |
| Azure SQL Basic (5 DTU) | ~$5 |
| **Total** | **~$37/month** |

> Actual prices vary by region and change over time. Always verify with the official pricing calculator.

</details>

---

## Key Takeaways

- **Azure** is the second-largest cloud platform, with deep enterprise integration, extensive compliance certifications, and 60+ global regions.
- Azure's infrastructure is organized into **Geographies → Region Pairs → Regions → Availability Zones → Data Centers**.
- **Resource Groups** are the fundamental organizational unit — group resources by lifecycle and environment.
- **Azure Resource Manager (ARM)** is the single control plane through which all management operations flow.
- For compute: use **VMs** for full control, **App Service** for managed web hosting, and **Functions** for serverless event-driven code.
- For storage: **Blob Storage** = objects, **Managed Disks** = block storage, **Azure Files** = SMB shares.
- **Entra ID** (Azure AD) handles identity, SSO, MFA, and RBAC across all Azure resources.
- **Bicep** is the modern, recommended way to define Azure infrastructure as code.
- Always use the **Pricing Calculator** and **TCO Calculator** before committing to a cloud architecture.

---

← Previous lesson: **AWS Storage Services** | Next lesson: **Azure Compute Deep Dive** →
