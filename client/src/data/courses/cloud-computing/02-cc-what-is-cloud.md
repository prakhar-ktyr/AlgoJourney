---
title: What is Cloud Computing
---

## What is Cloud Computing?

**Cloud computing** is the delivery of computing services — servers, storage, databases, networking, software, analytics, and intelligence — over the **internet** ("the cloud") to offer faster innovation, flexible resources, and economies of scale.

Instead of owning and maintaining physical data centers and servers, you can access technology services on an **as-needed basis** from a cloud provider like Amazon Web Services (AWS), Microsoft Azure, or Google Cloud Platform (GCP).

---

## The NIST Definition

The **National Institute of Standards and Technology (NIST)** provides the most widely accepted definition of cloud computing:

> "Cloud computing is a model for enabling ubiquitous, convenient, **on-demand network access** to a shared pool of configurable computing resources (e.g., networks, servers, storage, applications, and services) that can be rapidly provisioned and released with minimal management effort or service provider interaction."
>
> — NIST Special Publication 800-145

Let's break this definition down into its key parts:

| Part of Definition | What It Means |
|-------------------|---------------|
| On-demand network access | Get resources whenever you need them, via the internet |
| Shared pool | Resources are shared across many customers |
| Configurable | You choose exactly what you need |
| Rapidly provisioned | Resources are available in minutes, not months |
| Minimal management effort | The provider handles most of the heavy lifting |

---

## Five Essential Characteristics

NIST identifies **five essential characteristics** that define true cloud computing. If a service doesn't meet all five, it's not truly "cloud."

### 1. On-Demand Self-Service

You can provision computing resources (servers, storage, etc.) **automatically** without needing to talk to a human at the service provider.

```
Traditional IT:
  1. Submit a ticket to IT department
  2. Wait for approval (days/weeks)
  3. IT team orders hardware (weeks)
  4. Hardware arrives and is installed (weeks)
  5. Server is configured and ready
  Total time: 4-12 weeks

Cloud Computing:
  1. Log into cloud console
  2. Click "Create Server"
  3. Choose specs (CPU, RAM, storage)
  4. Server is running
  Total time: 2-5 minutes
```

**Example:** You log into the AWS console at 2 AM, spin up 10 servers for a load test, and shut them down an hour later. No phone calls, no tickets, no waiting.

### 2. Broad Network Access

Cloud services are available over the **network** (typically the internet) and can be accessed through standard mechanisms — a web browser, a mobile app, a command-line tool, or an API.

```
Access From Anywhere:

  ┌──────────┐     ┌──────────┐     ┌──────────┐
  │  Laptop  │     │  Phone   │     │  Tablet  │
  └────┬─────┘     └────┬─────┘     └────┬─────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                   ┌────▼────┐
                   │ Internet │
                   └────┬────┘
                        │
                  ┌─────▼──────┐
                  │   Cloud    │
                  │  Services  │
                  └────────────┘
```

**Example:** A developer in Tokyo, a designer in London, and a manager in New York all access the same cloud-hosted application simultaneously.

### 3. Resource Pooling

The provider's computing resources are **pooled** to serve multiple customers using a **multi-tenant model**. Physical and virtual resources are dynamically assigned and reassigned based on demand.

```
Resource Pooling (Multi-Tenant):

  ┌──────────────────────────────────────┐
  │          Cloud Provider              │
  │                                      │
  │  ┌─────────┐  ┌─────────┐          │
  │  │Company A │  │Company B │          │
  │  │ (uses 3  │  │ (uses 5  │          │
  │  │  VMs)    │  │  VMs)    │          │
  │  └─────────┘  └─────────┘          │
  │                                      │
  │  ┌─────────┐  ┌─────────┐          │
  │  │Company C │  │Company D │          │
  │  │ (uses 2  │  │ (uses 8  │          │
  │  │  VMs)    │  │  VMs)    │          │
  │  └─────────┘  └─────────┘          │
  │                                      │
  │  Shared Physical Infrastructure      │
  └──────────────────────────────────────┘
```

The customer generally has **no control or knowledge** of the exact location of the resources, but may be able to specify the region or country.

### 4. Rapid Elasticity

Resources can be **elastically provisioned and released**, in some cases automatically, to scale rapidly with demand. To the customer, the resources available often appear to be **unlimited**.

```
Rapid Elasticity:

Traffic ▲
       │          ┌───────┐
       │         ┌┘       └┐
       │        ┌┘         └┐
       │       ┌┘           └┐
       │      ┌┘             └┐
       │     ┌┘               └┐
       │    ┌┘                 └───────
       │───┘
       └─────────────────────────────── Time
              Black Friday
              Sales Event

Resources automatically scale UP during peak
and scale DOWN when traffic decreases.
```

**Example:** An e-commerce site handles 100 users on a normal day but scales to 100,000 during Black Friday — automatically, with no manual intervention.

### 5. Measured Service

Cloud systems automatically **control and optimize** resource use by leveraging a metering capability. Resource usage is **monitored, controlled, and reported**, providing transparency for both the provider and the customer.

```
Measured Service — Pay for What You Use:

┌───────────────────────────────────────┐
│  Monthly Cloud Bill                    │
├───────────────────────────────────────┤
│  Compute (EC2):    142 hours  $34.08  │
│  Storage (S3):     50 GB      $ 1.15  │
│  Data Transfer:    100 GB     $ 8.50  │
│  Database (RDS):   720 hours  $48.00  │
│                                       │
│  Total:                       $91.73  │
└───────────────────────────────────────┘
```

**Think of it like your electricity bill** — you pay for the kilowatt-hours you consume, not for owning the power plant.

---

## Cloud vs Traditional On-Premises

Here's how cloud computing compares to the traditional approach of owning your own servers:

| Aspect | Traditional On-Premises | Cloud Computing |
|--------|------------------------|-----------------|
| **Hardware** | You buy and own it | Provider owns it; you rent it |
| **Upfront Cost** | High (servers, networking, space) | Low or none |
| **Ongoing Cost** | Fixed (even if underutilized) | Variable (pay per use) |
| **Scaling** | Buy more hardware (weeks) | Click a button (minutes) |
| **Maintenance** | Your team handles everything | Provider handles hardware |
| **Location** | Your data center | Provider's data centers worldwide |
| **Disaster Recovery** | Complex and expensive | Built-in options available |
| **Updates** | Manual, scheduled downtime | Often automatic |
| **Expertise Needed** | Hardware + software + networking | Mostly software + cloud skills |

---

## Real-World Analogies

Cloud computing can feel abstract, so let's use some everyday analogies.

### The Electricity Grid Analogy

```
Before Electricity Grids:           After Electricity Grids:
┌─────────────────────┐            ┌─────────────────────┐
│ Every factory had    │            │ Factories plug into  │
│ its OWN generator    │            │ the SHARED grid      │
│                      │            │                      │
│ • Expensive to buy   │            │ • Pay per kWh used   │
│ • Expensive to       │            │ • No maintenance     │
│   maintain           │            │   needed             │
│ • Needed specialists │            │ • Always available   │
│ • Wasteful when idle │            │ • Scales instantly   │
└─────────────────────┘            └─────────────────────┘

Same idea: Cloud = the "computing grid"
```

Just as factories stopped building their own power generators and started using the electricity grid, businesses are moving from running their own servers to using the cloud.

### The Water Utility Analogy

| Aspect | Own Well (On-Prem) | City Water (Cloud) |
|--------|-------------------|-------------------|
| Setup | Dig a well, install pump | Turn on the tap |
| Cost | Big upfront investment | Monthly bill based on usage |
| Maintenance | You fix everything | The city handles it |
| Capacity | Limited by your well | Virtually unlimited |
| Reliability | What if your well dries up? | Redundant systems |

### The Taxi vs Car Ownership Analogy

- **Owning a car** = On-premises: High upfront cost, ongoing maintenance, insurance, parking — but always available
- **Taking a taxi/Uber** = Cloud: Pay per ride, no maintenance worries, available on demand — but costs add up with heavy use

> **Key insight:** Just like you might own a car for daily commuting but take a taxi to the airport, many businesses use a **hybrid** approach — some on-premises, some cloud.

---

## Cloud Services You Already Use

You're probably using cloud computing every day without realizing it!

| Service | What It Is | Cloud Feature |
|---------|-----------|---------------|
| **Gmail / Outlook** | Email | SaaS — software over the internet |
| **Google Drive / Dropbox** | File storage | Cloud storage, accessible anywhere |
| **Netflix / Disney+** | Video streaming | Massive scalable infrastructure |
| **Spotify / Apple Music** | Music streaming | Content delivery, personalization |
| **Zoom / Teams** | Video conferencing | Real-time communication at scale |
| **Instagram / TikTok** | Social media | Global content distribution |
| **iCloud / Google Photos** | Photo backup | Automatic sync and storage |
| **ChatGPT / AI assistants** | AI services | Massive GPU cloud computing |

Every time you:
- Send an email → **cloud computing**
- Stream a video → **cloud computing**
- Back up your photos → **cloud computing**
- Use a voice assistant → **cloud computing**
- Play an online game → **cloud computing**

---

## A Brief Look at Service Models

Cloud services are typically categorized into **three main models**. We'll cover each in depth in later lessons, but here's a quick overview:

```
┌─────────────────────────────────────────────────────┐
│                    YOU MANAGE                         │
│                                                      │
│  On-Premises    IaaS          PaaS         SaaS     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐│
│  │Application│  │Application│  │Application│  │      ││
│  │Data      │  │Data      │  │          │  │      ││
│  │Runtime   │  │Runtime   │  │          │  │      ││
│  │Middleware │  │          │  │          │  │      ││
│  │OS        │  │          │  │          │  │      ││
│  │Virtualiz.│  │          │  │          │  │      ││
│  │Servers   │  │          │  │          │  │      ││
│  │Storage   │  │          │  │          │  │      ││
│  │Networking│  │          │  │          │  │      ││
│  └──────────┘  └──────────┘  └──────────┘  └──────┘│
│                                                      │
│               PROVIDER MANAGES (shaded)              │
└─────────────────────────────────────────────────────┘
```

| Model | What You Get | Examples | You Manage | Provider Manages |
|-------|-------------|----------|------------|-----------------|
| **IaaS** | Virtual hardware | AWS EC2, Azure VMs | OS, runtime, app, data | Hardware, networking, virtualization |
| **PaaS** | Platform to build on | Heroku, Google App Engine | App and data only | Everything else |
| **SaaS** | Ready-to-use software | Gmail, Salesforce, Slack | Just use it | Everything |

### Quick Analogy: Pizza as a Service

```
Making Pizza at Home     │  Take & Bake        │  Pizza Delivery     │  Dining Out
(On-Premises)            │  (IaaS)             │  (PaaS)             │  (SaaS)
─────────────────────────┼──────────────────────┼─────────────────────┼──────────────
You make the dough       │  You bake the pizza  │  You eat the pizza  │  You eat the
You add toppings         │  You add toppings    │                     │  pizza
You bake it              │                      │                     │
You set the table        │  You set the table   │  You set the table  │
You eat                  │  You eat             │  You eat            │  You eat
You clean up             │  You clean up        │  You clean up       │
```

---

## How Cloud Computing Works (Simplified)

At a high level, here's what happens when you use a cloud service:

```
Step 1: You request resources
┌──────────┐    "I need a server"    ┌──────────────┐
│   You    │ ──────────────────────► │   Cloud      │
│  (User)  │                         │   Provider   │
└──────────┘                         └──────┬───────┘
                                            │
Step 2: Provider allocates from shared pool  │
                                            ▼
                                     ┌──────────────┐
                                     │  Data Center  │
                                     │  ┌────┐┌────┐ │
                                     │  │ VM ││ VM │ │
                                     │  └────┘└────┘ │
                                     │  ┌────┐┌────┐ │
                                     │  │ VM ││ VM │ │ ← Your VM is here
                                     │  └────┘└────┘ │
                                     └──────┬───────┘
                                            │
Step 3: You access via internet              │
┌──────────┐    SSH / HTTPS / API    ┌──────┘
│   You    │ ◄──────────────────────
└──────────┘
```

### Behind the Scenes

1. **Data Centers** — Cloud providers operate massive data centers around the world
2. **Virtualization** — Physical servers are divided into many virtual machines
3. **Networking** — Software-defined networking connects everything
4. **Automation** — Orchestration software manages resource allocation
5. **APIs** — Everything is programmable through application programming interfaces

---

## Try It Yourself

### Exercise 1: Identify Cloud Services

Look at the apps on your phone or computer. List **5 services** you use that are cloud-based, and for each one, identify:
- What type of cloud service it is (storage, compute, application, etc.)
- What would happen if the cloud servers went down

### Exercise 2: Cloud vs Non-Cloud

For each item below, decide whether it's a cloud service or not, and explain why:

| Service | Cloud? | Why? |
|---------|--------|------|
| Microsoft Word installed on your PC | | |
| Google Docs in your browser | | |
| A file saved to your USB drive | | |
| A file saved to Google Drive | | |
| A game running on your PlayStation | | |
| A game running on Xbox Cloud Gaming | | |

<details>
<summary><strong>Click to see answers</strong></summary>

| Service | Cloud? | Why? |
|---------|--------|------|
| Microsoft Word installed on your PC | ❌ No | Runs locally, doesn't need internet |
| Google Docs in your browser | ✅ Yes | Runs on Google's servers, accessed via internet |
| A file saved to your USB drive | ❌ No | Stored locally on physical media |
| A file saved to Google Drive | ✅ Yes | Stored on Google's cloud servers |
| A game running on your PlayStation | ❌ No | Runs on local hardware |
| A game running on Xbox Cloud Gaming | ✅ Yes | Game runs on Microsoft's servers, streamed to you |

</details>

### Exercise 3: The Elevator Pitch

Write a **2-sentence explanation** of cloud computing that you could tell a non-technical friend or family member. Try to use one of the analogies from this lesson.

---

## A Brief History Timeline

Cloud computing didn't appear overnight. Here's a quick peek at its evolution (covered in detail in the next lesson):

```
1960s ──── Mainframe time-sharing (the original "cloud")
  │
1990s ──── Internet boom, web hosting services
  │
1999 ───── Salesforce launches (SaaS pioneer)
  │
2002 ───── AWS begins (internal infrastructure as a service)
  │
2006 ───── AWS launches S3 and EC2 publicly
  │
2008 ───── Google App Engine (PaaS)
  │
2010 ───── Microsoft Azure goes live
  │
2013 ───── Docker makes containers mainstream
  │
2014 ───── Kubernetes released by Google
  │
2020s ──── AI/ML cloud services, edge computing, serverless maturity
```

---

## Key Takeaways

- **Cloud computing** is the on-demand delivery of computing resources over the internet
- The **NIST definition** identifies five essential characteristics: on-demand self-service, broad network access, resource pooling, rapid elasticity, and measured service
- Cloud replaces **large upfront costs** (CapEx) with **pay-as-you-go pricing** (OpEx)
- You already use cloud computing daily — Gmail, Netflix, Spotify, and more
- Three main **service models** exist: IaaS (rent hardware), PaaS (rent a platform), SaaS (rent software)
- Cloud computing is like the **electricity grid** — you pay for what you use instead of building your own power plant
- Cloud didn't replace everything overnight — it's an **evolution**, not a revolution

---

## What's Next?

In the next lesson, we'll explore the **History of Cloud Computing** — from 1960s mainframes to today's trillion-dollar industry. Understanding the history helps you appreciate why cloud computing works the way it does today.

**Next lesson: "History of Cloud Computing"** →
