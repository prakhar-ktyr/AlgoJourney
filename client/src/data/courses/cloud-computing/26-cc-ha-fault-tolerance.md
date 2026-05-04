---
title: "High Availability and Fault Tolerance"
---

# High Availability and Fault Tolerance

When you deploy applications to the cloud, your users expect them to **always be available**. A few minutes of downtime can mean lost revenue, frustrated customers, and damaged reputation.

In this lesson, you will learn how to design systems that stay up even when things go wrong — and in the cloud, things **will** go wrong.

---

## What Is High Availability?

**High Availability (HA)** means designing a system so that it remains operational and accessible for the maximum possible time.

An HA system minimizes **downtime** — the period when the system is unavailable.

> **Think of it like this:** A hospital emergency room is designed for high availability. It must be open 24/7, with backup generators, extra staff on call, and redundant equipment.

### Measuring Availability: The Nines

Availability is expressed as a **percentage of uptime** over a given period (usually a year).

| Availability | Common Name | Downtime per Year | Downtime per Month | Downtime per Week |
|---|---|---|---|---|
| 99% | "Two nines" | 3.65 days | 7.31 hours | 1.68 hours |
| 99.9% | "Three nines" | 8.77 hours | 43.83 minutes | 10.08 minutes |
| 99.95% | "Three and a half nines" | 4.38 hours | 21.92 minutes | 5.04 minutes |
| 99.99% | "Four nines" | 52.60 minutes | 4.38 minutes | 1.01 minutes |
| 99.999% | "Five nines" | 5.26 minutes | 26.30 seconds | 6.05 seconds |
| 99.9999% | "Six nines" | 31.56 seconds | 2.63 seconds | 0.60 seconds |

> **Key Point:** Each additional "nine" is **10x harder** and **10x more expensive** to achieve than the previous one.

### How to Calculate Availability

```
Availability = (Total Time - Downtime) / Total Time × 100%
```

**Example:**

Your service was down for 4 hours in a 30-day month:

```
Total minutes in 30 days = 30 × 24 × 60 = 43,200
Downtime = 4 × 60 = 240 minutes

Availability = (43,200 - 240) / 43,200 × 100%
Availability = 42,960 / 43,200 × 100%
Availability = 99.44%
```

That is below "three nines" (99.9%) — which many SLAs require.

---

## Service Level Agreements (SLAs)

An **SLA** is a formal contract between a service provider and a customer that defines the expected level of service.

### What an SLA Includes

| Component | Description | Example |
|---|---|---|
| **Uptime guarantee** | Minimum availability percentage | 99.99% monthly uptime |
| **Response time** | Maximum time to respond to requests | API latency < 200ms (p99) |
| **Support response** | Time to acknowledge incidents | Critical: 15 minutes |
| **Penalties** | Credits or refunds for violations | 10% credit per 0.1% below SLA |
| **Exclusions** | What is NOT covered | Scheduled maintenance windows |

### Real-World Cloud SLAs

| Service | SLA | What Happens If Breached |
|---|---|---|
| AWS EC2 (single instance) | 99.5% | Service credits |
| AWS EC2 (Multi-AZ) | 99.99% | Service credits |
| AWS S3 | 99.9% | Service credits |
| Azure VMs (Availability Zones) | 99.99% | Service credits |
| Google Cloud Compute (multi-zone) | 99.99% | Financial credits |

> **Warning:** Cloud provider SLAs typically offer **service credits**, not cash refunds. A 10% credit on your cloud bill does NOT compensate for the revenue you lost during an outage.

---

## Fault Tolerance vs. High Availability

These terms are related but **not the same**.

| Aspect | High Availability | Fault Tolerance |
|---|---|---|
| **Goal** | Minimize downtime | Zero downtime, even during failures |
| **Approach** | Quick recovery from failure | Continue operating despite failure |
| **Downtime allowed** | Small amount (seconds to minutes) | None |
| **Cost** | Moderate | High |
| **Example** | A web server with auto-restart | An airplane with redundant engines |

### Analogy

- **High Availability** = A restaurant with a backup chef. If the main chef gets sick, the backup steps in within an hour.
- **Fault Tolerance** = A restaurant with two chefs cooking every dish simultaneously. If one chef stops, the food keeps coming without any delay.

---

## Redundancy Patterns

Redundancy is the foundation of both HA and fault tolerance. It means having **duplicate components** so that if one fails, another takes over.

### Active-Active

Both (or all) instances are **actively serving traffic** at the same time.

```
         ┌─────────────┐
         │ Load Balancer│
         └──────┬───────┘
           ┌────┴────┐
           ▼         ▼
      ┌─────────┐ ┌─────────┐
      │ Server A │ │ Server B │
      │ (active) │ │ (active) │
      └─────────┘ └─────────┘
```

**Pros:**
- Better resource utilization (both servers handle requests)
- Higher throughput
- Seamless failover (traffic shifts to remaining servers)

**Cons:**
- More complex to manage (state synchronization)
- Both servers must handle the full dataset
- Potential data consistency challenges

**When to use:** Web servers, API servers, read-heavy databases.

### Active-Passive

One instance serves traffic; the other **stands by** and takes over only if the active one fails.

```
         ┌─────────────┐
         │ Load Balancer│
         └──────┬───────┘
                │
                ▼
      ┌─────────────────┐
      │   Server A       │  ◄── Serving traffic
      │   (active)       │
      └─────────────────┘
      ┌─────────────────┐
      │   Server B       │  ◄── Standing by (idle)
      │   (passive)      │
      └─────────────────┘
```

**Pros:**
- Simpler to manage
- No data synchronization conflicts
- Passive server can be a lower-cost instance

**Cons:**
- Wasted resources (passive server is idle)
- Failover is not instant (switchover takes time)
- Lower throughput (only one server handles requests)

**When to use:** Databases (primary-standby), legacy applications, stateful workloads.

### N+1 Redundancy

You run **N** servers to handle your load, plus **1 extra** as a spare.

```
Normal load requires 3 servers → Deploy 4 servers (3+1)
```

| Pattern | Servers for Load | Spare Servers | Total |
|---|---|---|---|
| N+1 | 3 | 1 | 4 |
| N+2 | 3 | 2 | 5 |
| 2N | 3 | 3 | 6 |
| 2N+1 | 3 | 4 | 7 |

> **Rule of Thumb:** N+1 is the most common and cost-effective approach. Use 2N for mission-critical systems where you need to survive multiple simultaneous failures.

---

## Multi-AZ Deployments

An **Availability Zone (AZ)** is an isolated data center (or cluster of data centers) within a cloud region. Each AZ has independent power, cooling, and networking.

### Why Multi-AZ Matters

If your application runs in a single AZ and that AZ goes down (fire, power outage, network failure), your application goes down too.

```
Single-AZ Deployment (RISKY):
┌────────────────────────────┐
│       Region: us-east-1    │
│  ┌──────────────────────┐  │
│  │     AZ: us-east-1a   │  │
│  │  ┌────┐  ┌────┐      │  │
│  │  │ EC2│  │ RDS│      │  │
│  │  └────┘  └────┘      │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │     AZ: us-east-1b   │  │
│  │       (empty)        │  │
│  └──────────────────────┘  │
└────────────────────────────┘

Multi-AZ Deployment (RESILIENT):
┌────────────────────────────┐
│       Region: us-east-1    │
│  ┌──────────────────────┐  │
│  │     AZ: us-east-1a   │  │
│  │  ┌────┐  ┌────────┐  │  │
│  │  │ EC2│  │RDS Pri │  │  │
│  │  └────┘  └────────┘  │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │     AZ: us-east-1b   │  │
│  │  ┌────┐  ┌────────┐  │  │
│  │  │ EC2│  │RDS Stby│  │  │
│  │  └────┘  └────────┘  │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

### Multi-AZ Services on AWS

| Service | Multi-AZ Behavior |
|---|---|
| **ELB** | Automatically distributes across AZs |
| **RDS Multi-AZ** | Synchronous standby replica in another AZ; automatic failover |
| **Aurora** | Storage spans 3 AZs with 6 copies of data |
| **S3** | Data automatically stored across ≥ 3 AZs |
| **DynamoDB** | Data replicated across 3 AZs by default |
| **EFS** | File system spans all AZs in a region |

---

## Multi-Region Architectures

Multi-AZ protects you from a single data center failure. **Multi-region** protects you from an entire region going down — and brings your application closer to users worldwide.

### Multi-Region Patterns

#### Active-Passive (Pilot Light)

One region serves all traffic. A second region has the minimum infrastructure running (like a pilot light on a gas stove — ready to ignite).

```
Primary Region (us-east-1):    DR Region (eu-west-1):
  ┌──────────────────┐           ┌──────────────────┐
  │ Full application │           │ DB replica only   │
  │ stack running    │    ───►   │ (pilot light)     │
  │ Serves all users │  replicate│ Infra OFF         │
  └──────────────────┘           └──────────────────┘
```

- **RTO:** Hours (need to spin up compute)
- **RPO:** Minutes (async replication lag)
- **Cost:** Low (minimal standby resources)

#### Warm Standby

The secondary region runs a **scaled-down** version of your full production environment.

- **RTO:** Minutes (scale up the standby)
- **RPO:** Seconds to minutes
- **Cost:** Medium

#### Active-Active (Multi-Region)

Both regions serve traffic simultaneously. A global load balancer (e.g., Route 53, CloudFront) routes users to the nearest region.

- **RTO:** Near zero
- **RPO:** Near zero (with synchronous or conflict-free replication)
- **Cost:** High (full infrastructure in both regions)

### Recovery Objectives

| Term | Full Name | Meaning | Question It Answers |
|---|---|---|---|
| **RTO** | Recovery Time Objective | Max acceptable downtime | "How fast must we recover?" |
| **RPO** | Recovery Point Objective | Max acceptable data loss | "How much data can we lose?" |

**Example:** RTO = 1 hour, RPO = 15 minutes means:
- You must be back online within 1 hour of failure.
- You can afford to lose at most the last 15 minutes of data.

---

## Failover Strategies

### DNS Failover

Route 53 (AWS) can detect when an endpoint is unhealthy and automatically route traffic to a healthy one.

```
Route 53 Health Check Configuration:
┌────────────────────────────────────────┐
│ Record: app.example.com               │
│ Type: Failover                        │
│ Primary: us-east-1 ALB (10.0.1.100)  │
│ Secondary: eu-west-1 ALB (10.0.2.200)│
│ Health Check: HTTP 200 on /health     │
│ Interval: 30 seconds                  │
│ Failure Threshold: 3                  │
└────────────────────────────────────────┘
```

> **Note:** DNS failover has a limitation: DNS records are **cached** by clients. Even after Route 53 updates, some users may continue hitting the failed endpoint until their DNS cache expires (TTL).

### Database Failover

#### RDS Multi-AZ Failover

```
Normal Operation:
  App → Primary DB (AZ-1) ←sync replication→ Standby DB (AZ-2)

After Primary Fails:
  App → Standby DB (AZ-2) [promoted to primary]
        New standby launched in another AZ
```

Failover is **automatic** and typically completes in **60–120 seconds**. The DNS endpoint stays the same — your application does not need code changes.

#### Aurora Failover

Aurora is faster because it separates compute from storage:

- Storage spans 3 AZs with 6 copies of data
- Failover to a read replica takes **< 30 seconds**
- If no replica exists, Aurora creates a new instance (~10 minutes)

---

## Health Checks and Self-Healing

Health checks are the **nervous system** of an HA architecture. They detect failures so the system can react.

### Types of Health Checks

| Type | What It Checks | Example |
|---|---|---|
| **TCP** | Can we connect to the port? | Port 443 open |
| **HTTP** | Does the app return 200 OK? | GET /health → 200 |
| **Deep health** | Are all dependencies healthy? | DB connected, cache available, disk < 90% |
| **Custom** | Application-specific logic | Can process a test transaction |

### Health Check Endpoint Example

```javascript
// Express.js health check endpoint
app.get("/health", async (req, res) => {
  const checks = {
    server: "ok",
    database: "unknown",
    cache: "unknown",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  try {
    // Check database connection
    await db.query("SELECT 1");
    checks.database = "ok";
  } catch (err) {
    checks.database = "error";
  }

  try {
    // Check cache connection
    await redis.ping();
    checks.cache = "ok";
  } catch (err) {
    checks.cache = "error";
  }

  const isHealthy = checks.database === "ok" && checks.cache === "ok";

  res.status(isHealthy ? 200 : 503).json(checks);
});
```

### Self-Healing with Auto Scaling Groups

AWS Auto Scaling Groups (ASG) replace unhealthy instances automatically:

1. ASG performs health checks on each instance
2. If an instance fails the health check, ASG terminates it
3. ASG launches a new instance to maintain the desired count

```
ASG Configuration:
  Minimum: 2 instances
  Desired: 3 instances
  Maximum: 6 instances
  Health Check: ELB health check
  Grace Period: 300 seconds

Timeline:
  t=0    Instance C fails health check
  t=60   ASG marks Instance C as unhealthy
  t=90   ASG terminates Instance C
  t=120  ASG launches Instance D
  t=420  Instance D passes health check → healthy
```

---

## Chaos Engineering

> "The best way to avoid failure is to fail constantly." — Netflix

**Chaos Engineering** is the practice of intentionally injecting failures into a system to test its resilience.

### Why Practice Chaos?

- Verify that failover works **before** a real outage
- Find weaknesses you did not anticipate
- Build confidence in your system's resilience
- Train your team to respond to incidents

### Chaos Monkey (Netflix)

Netflix created **Chaos Monkey** in 2011. It randomly terminates production instances during business hours.

```
Chaos Monkey Rules:
  ✓ Only runs during business hours
  ✓ Only targets non-critical services initially
  ✓ Team is aware and monitoring
  ✓ Kill switch available
  ✗ Never targets all instances at once
```

### AWS Fault Injection Service (FIS)

AWS FIS is a managed service for running chaos experiments.

**Experiments you can run:**

| Experiment | What It Does | Tests |
|---|---|---|
| Terminate instances | Kills EC2 instances | Auto Scaling, failover |
| Throttle API | Adds latency to API calls | Timeout handling |
| Network disruption | Blocks traffic between AZs | Multi-AZ resilience |
| CPU stress | Spikes CPU to 100% | Auto Scaling policies |
| Disk stress | Fills disk space | Monitoring and alerts |
| AZ power interruption | Simulates AZ outage | Multi-AZ architecture |

### Running a Chaos Experiment

```bash
# AWS CLI: Create an FIS experiment template
aws fis create-experiment-template \
  --description "Terminate random instance in ASG" \
  --targets '{
    "myInstances": {
      "resourceType": "aws:ec2:instance",
      "resourceTags": {"env": "staging"},
      "selectionMode": "COUNT(1)"
    }
  }' \
  --actions '{
    "terminateInstance": {
      "actionId": "aws:ec2:terminate-instances",
      "targets": {"Instances": "myInstances"}
    }
  }' \
  --stop-conditions '[{
    "source": "aws:cloudwatch:alarm",
    "value": "arn:aws:cloudwatch:us-east-1:123456:alarm:HighErrorRate"
  }]' \
  --role-arn arn:aws:iam::123456:role/FISRole
```

> **Best Practice:** Always start chaos experiments in **staging**, define **stop conditions** (blast radius limits), and have a **rollback plan**.

---

## Designing for Failure

The cloud-native mindset assumes that **everything can and will fail**. Design accordingly.

### Design Principles

| Principle | Description | Implementation |
|---|---|---|
| **Assume failure** | Any component can fail at any time | Redundancy, retries, circuit breakers |
| **Fail gracefully** | Degrade, don't crash | Show cached data when DB is down |
| **Fail fast** | Detect and respond quickly | Health checks, circuit breakers |
| **Blast radius** | Limit the impact of failure | Microservices, bulkheads, cell architecture |
| **Automate recovery** | Remove humans from the recovery path | Auto Scaling, self-healing |

### Circuit Breaker Pattern

A circuit breaker prevents your application from repeatedly calling a failing service.

```
States:
  CLOSED → calls pass through normally
  OPEN   → calls fail immediately (don't bother the broken service)
  HALF-OPEN → allow a few test calls to check recovery

Flow:
  ┌──────────┐  failures > threshold  ┌──────────┐
  │  CLOSED  │ ──────────────────────► │   OPEN   │
  └──────────┘                         └────┬─────┘
       ▲                                    │
       │ test call succeeds            timeout expires
       │                                    │
  ┌────┴──────┐                        ┌────▼─────┐
  │           │ ◄────────────────────  │HALF-OPEN │
  └───────────┘                        └──────────┘
```

### Retry with Exponential Backoff

```javascript
async function callWithRetry(fn, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
      const jitter = delay * (0.5 + Math.random() * 0.5);
      console.log(`Retry ${attempt + 1} in ${Math.round(jitter)}ms`);
      await new Promise((resolve) => setTimeout(resolve, jitter));
    }
  }
}
```

> **Why jitter?** Without jitter, all retrying clients hit the server at the same time (a "thundering herd"). Adding randomness spreads the load.

---

## Calculating Availability for Distributed Systems

In a distributed system, the overall availability depends on how components are connected.

### Components in Series (All Must Work)

If components are in series, **all** must be available for the system to work.

```
A → B → C
```

**Formula:**

```
Availability = A_a × A_b × A_c
```

**Example:** Three services each with 99.9% availability:

```
System Availability = 0.999 × 0.999 × 0.999
                    = 0.997 (99.7%)
                    = ~26 hours downtime/year
```

> **Key Insight:** Adding more components in series **always decreases** overall availability.

### Components in Parallel (Any Can Work)

If components are in parallel, the system works as long as **at least one** is available.

```
    ┌── A ──┐
    │       │
────┤       ├────
    │       │
    └── B ──┘
```

**Formula:**

```
Unavailability = (1 - A_a) × (1 - A_b)
Availability = 1 - Unavailability
```

**Example:** Two servers each with 99.9% availability in parallel:

```
Unavailability = (1 - 0.999) × (1 - 0.999)
               = 0.001 × 0.001
               = 0.000001

Availability = 1 - 0.000001
             = 0.999999 (99.9999% — six nines!)
```

### Combined Example

```
             ┌── Web A ──┐
Internet → LB┤           ├── App Server → DB
             └── Web B ──┘
```

| Component | Availability |
|---|---|
| Load Balancer | 99.99% |
| Web A | 99.9% |
| Web B | 99.9% |
| App Server | 99.9% |
| Database (Multi-AZ) | 99.99% |

```
Web tier (parallel): 1 - (0.001 × 0.001) = 99.9999%
Series: 0.9999 × 0.999999 × 0.999 × 0.9999
      = 0.9988 (99.88%)
      ≈ 10.5 hours downtime/year
```

To improve this, you would add redundancy to the **App Server** (the weakest link in the chain).

---

## Exercises

### Exercise 1: Calculate Availability

Your system was down for the following durations in a 30-day month:
- Incident 1: 45 minutes
- Incident 2: 2 hours 15 minutes
- Incident 3: 30 minutes

**Questions:**
1. What is the total downtime in minutes?
2. What is the availability percentage?
3. Does it meet a 99.9% SLA?

<details>
<summary>Solution</summary>

```
1. Total downtime = 45 + 135 + 30 = 210 minutes

2. Total minutes in 30 days = 43,200
   Availability = (43,200 - 210) / 43,200 × 100%
   Availability = 99.51%

3. No — 99.51% is below the 99.9% SLA threshold.
   Maximum allowed downtime for 99.9% = 43.2 minutes
   You exceeded it by 166.8 minutes.
```

</details>

### Exercise 2: Design for High Availability

You are building an e-commerce site that must achieve **99.99% availability**. Currently:

- 2 web servers behind a load balancer (single AZ)
- 1 database (single AZ, no standby)
- 1 Redis cache (single AZ)

List at least 5 changes you would make.

<details>
<summary>Solution</summary>

1. Deploy web servers across **multiple AZs** (at least 2)
2. Enable **RDS Multi-AZ** for automatic database failover
3. Use **ElastiCache Multi-AZ** with automatic failover for Redis
4. Add **Auto Scaling** to replace failed instances automatically
5. Set up **health checks** on the load balancer
6. Configure **CloudWatch alarms** for monitoring
7. Use **Route 53** with health checks for DNS failover
8. Implement **circuit breakers** for external dependencies
9. Deploy a **CDN** (CloudFront) to reduce load on origin servers
10. Run **chaos experiments** to verify the setup works

</details>

### Exercise 3: Parallel Availability Calculation

You have a system with 3 web servers in parallel, each with 99% availability, connected in series to a database with 99.95% availability.

Calculate the overall system availability.

<details>
<summary>Solution</summary>

```
Web tier (3 in parallel):
  Unavailability = (1 - 0.99)^3 = (0.01)^3 = 0.000001
  Availability = 1 - 0.000001 = 99.9999%

Overall (series with DB):
  Availability = 0.999999 × 0.9995 = 0.9995 (99.95%)

The database is now the bottleneck. To improve further,
add a standby database (Multi-AZ) to raise DB availability.
```

</details>

---

## Key Takeaways

| Concept | Summary |
|---|---|
| **High Availability** | Minimize downtime; measured in "nines" of uptime |
| **Fault Tolerance** | Continue operating despite failures (zero downtime) |
| **SLAs** | Formal agreements defining uptime guarantees and penalties |
| **Redundancy** | Active-Active, Active-Passive, N+1 — duplicate components |
| **Multi-AZ** | Deploy across Availability Zones for data center resilience |
| **Multi-Region** | Deploy across regions for regional disaster recovery |
| **RTO / RPO** | Recovery Time Objective / Recovery Point Objective |
| **Health Checks** | Monitor component health; enable self-healing |
| **Chaos Engineering** | Intentionally inject failures to test resilience |
| **Series vs. Parallel** | Series decreases availability; parallel increases it |

> **Golden Rule:** "Everything fails, all the time." — Werner Vogels, CTO of Amazon. Design your systems to embrace this reality.

---

## Next Steps

In the next lesson, you will explore **AWS** — starting with a broad overview of AWS's global infrastructure and core services.
