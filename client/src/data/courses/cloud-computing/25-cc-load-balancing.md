---
title: "Load Balancing and Auto-Scaling"
---

# Load Balancing and Auto-Scaling

Your application works perfectly on one server — until 10 000 users show up at once. **Load balancing** distributes traffic across multiple servers so no single machine is overwhelmed. **Auto-scaling** adds or removes those servers automatically based on demand.

Together, they are the foundation of every highly available, cost-efficient cloud deployment.

---

## What Is Load Balancing?

A **load balancer** sits in front of a group of servers and decides which server should handle each incoming request.

```
                         ┌────────────┐
                    ┌───▶│  Server 1  │
                    │    └────────────┘
┌────────┐    ┌────┴────┐┌────────────┐
│ Client │───▶│  Load   ││  Server 2  │
└────────┘    │ Balancer│├────────────┘
              └────┬────┘┌────────────┐
                    └───▶│  Server 3  │
                         └────────────┘
```

### Goals of Load Balancing

| Goal | How the LB Achieves It |
|---|---|
| **High availability** | If a server fails, traffic goes to healthy ones |
| **Scalability** | Add more servers behind the LB as traffic grows |
| **Performance** | Spread load evenly so no single server is a bottleneck |
| **Flexibility** | Deploy, upgrade, or restart servers without downtime |

---

## Load-Balancing Algorithms

### 1. Round Robin

Requests are distributed **in order**, cycling through the server list.

```
Request 1 → Server A
Request 2 → Server B
Request 3 → Server C
Request 4 → Server A   (cycle repeats)
Request 5 → Server B
...
```

| Pros | Cons |
|---|---|
| Dead simple | Ignores server capacity differences |
| Even distribution if servers are identical | Ignores current load |

---

### 2. Weighted Round Robin

Like round robin, but servers with higher **weight** receive more requests.

```
Weights:  Server A = 5,  Server B = 3,  Server C = 2

Cycle (10 requests):
  A A A A A B B B C C → repeat
```

Use this when servers have **different hardware specs** (e.g., one has 8 cores, another has 4).

---

### 3. Least Connections

Each request goes to the server with the **fewest active connections** right now.

```
Active connections:
  Server A: 12
  Server B: 5   ◀── next request goes here
  Server C: 8
```

| Pros | Cons |
|---|---|
| Adapts to real-time load | Slightly more overhead (must track connections) |
| Handles slow requests well | May not account for request "weight" |

---

### 4. Weighted Least Connections

Combines **weights** with **active connections**:

```
Score = active_connections / weight

Server A:  12 / 5 = 2.4
Server B:   5 / 3 = 1.67  ◀── lowest score, gets next request
Server C:   8 / 2 = 4.0
```

---

### 5. IP Hash

A hash of the client's IP address determines which server handles the request. The **same client always reaches the same server** (sticky sessions).

```python
def ip_hash(client_ip, num_servers):
    hash_value = hash(client_ip)
    return hash_value % num_servers
```

| Pros | Cons |
|---|---|
| Session persistence without cookies | Uneven distribution if IPs are clustered |
| Simple to implement | Adding/removing servers remaps many clients |

---

### 6. Least Response Time

Requests go to the server with the **lowest average response time + fewest connections**.

This is the most "intelligent" algorithm but requires constant measurement.

---

### Algorithm Comparison Summary

| Algorithm | Best For | Sticky? | Complexity |
|---|---|---|---|
| Round Robin | Identical servers, stateless apps | No | Low |
| Weighted Round Robin | Mixed-capacity servers | No | Low |
| Least Connections | Long-lived connections (WebSocket) | No | Medium |
| IP Hash | Session-dependent apps | Yes | Low |
| Least Response Time | Latency-sensitive apps | No | High |
| Random | Simple, low overhead | No | Low |

---

## Layer 4 vs Layer 7 Load Balancing

Load balancers operate at different layers of the OSI model:

### Layer 4 (Transport Layer)

Operates on **TCP/UDP** packets. The LB sees source IP, destination IP, and port numbers — but **not** the HTTP content.

```
Client ──TCP──▶ LB ──TCP──▶ Server
                │
           Sees: IP + port
           Does NOT see: URL, headers, cookies
```

| Pros | Cons |
|---|---|
| Very fast (no packet inspection) | Cannot route by URL or header |
| Protocol-agnostic (HTTP, gRPC, DB) | No content-based decisions |
| Lower latency | No SSL termination (usually) |

---

### Layer 7 (Application Layer)

Operates on **HTTP/HTTPS** content. The LB can inspect URLs, headers, cookies, and even request bodies.

```
Client ──HTTPS──▶ LB ──HTTP──▶ Server
                   │
              Sees: URL path, Host header,
                    cookies, query params
```

| Pros | Cons |
|---|---|
| Route by path: `/api/*` → API server | Slower (must parse HTTP) |
| Route by header: mobile vs desktop | Higher resource usage |
| SSL termination at the LB | More complex configuration |
| Content-based health checks | |

### When to Use Which

| Scenario | Layer |
|---|---|
| Simple TCP load balancing for databases | Layer 4 |
| Route `/api` and `/static` to different backends | Layer 7 |
| gRPC or non-HTTP protocols | Layer 4 |
| SSL termination + header inspection | Layer 7 |
| Maximum performance, minimum latency | Layer 4 |

---

## Cloud Load Balancers

### AWS Load Balancers

| Type | Layer | Protocol | Best For |
|---|---|---|---|
| **ALB** (Application) | 7 | HTTP/HTTPS, gRPC | Web apps, microservices, containers |
| **NLB** (Network) | 4 | TCP, UDP, TLS | Ultra-low latency, static IPs |
| **CLB** (Classic) | 4 + 7 | HTTP/HTTPS, TCP | Legacy (not recommended for new apps) |
| **GWLB** (Gateway) | 3 | IP | Third-party virtual appliances |

**ALB Example — Path-Based Routing:**

```
          ┌─────────┐
     ────▶│   ALB   │
          └────┬────┘
               │
     ┌─────────┼──────────┐
     │         │          │
     ▼         ▼          ▼
  /api/*    /static/*   /*
  ┌─────┐  ┌────────┐  ┌──────┐
  │ API │  │  CDN   │  │ Web  │
  │ TG  │  │  TG    │  │ TG   │
  └─────┘  └────────┘  └──────┘
  (TG = Target Group)
```

```json
// ALB Listener Rule (AWS CLI JSON)
{
  "Conditions": [
    {
      "Field": "path-pattern",
      "Values": ["/api/*"]
    }
  ],
  "Actions": [
    {
      "Type": "forward",
      "TargetGroupArn": "arn:aws:elasticloadbalancing:...:targetgroup/api-tg/..."
    }
  ],
  "Priority": 10
}
```

---

### Azure Load Balancers

| Type | Layer | Best For |
|---|---|---|
| **Azure Load Balancer** | 4 | VM traffic, internal/external |
| **Application Gateway** | 7 | Web apps, WAF, SSL offload |
| **Front Door** | 7 | Global HTTP routing, CDN, WAF |
| **Traffic Manager** | DNS | DNS-based global routing |

---

### GCP Cloud Load Balancing

| Type | Scope | Layer | Best For |
|---|---|---|---|
| **External HTTP(S) LB** | Global | 7 | Web apps, CDN integration |
| **Internal HTTP(S) LB** | Regional | 7 | Internal microservices |
| **TCP/SSL Proxy LB** | Global | 4 | Non-HTTP TCP traffic |
| **Network LB** | Regional | 4 | UDP, non-proxied TCP |

---

## Health Checks

A load balancer must know which servers are **healthy**. It does this by sending periodic health check requests.

### Types of Health Checks

| Type | How It Works | Example |
|---|---|---|
| **TCP** | Try to open a TCP connection | Connect to port 80 |
| **HTTP** | Send an HTTP request, check status code | `GET /health` → expect `200` |
| **HTTPS** | Same as HTTP but over TLS | `GET /health` → expect `200` |
| **gRPC** | Call a gRPC health service | `grpc.health.v1.Health/Check` |
| **Command** | Run a script inside the container | `pg_isready` for PostgreSQL |

### Health Check Configuration

```json
{
  "healthCheck": {
    "protocol": "HTTP",
    "path": "/health",
    "port": 8080,
    "interval": 30,
    "timeout": 5,
    "healthyThreshold": 3,
    "unhealthyThreshold": 2
  }
}
```

| Setting | Meaning |
|---|---|
| `interval: 30` | Check every 30 seconds |
| `timeout: 5` | Wait 5 seconds for a response |
| `healthyThreshold: 3` | Server must pass 3 checks to be marked healthy |
| `unhealthyThreshold: 2` | Server is marked unhealthy after 2 failures |

### Implementing a Health Endpoint (Node.js)

```js
app.get("/health", async (req, res) => {
  try {
    // Check database connectivity
    await db.query("SELECT 1");

    // Check external dependency
    const cacheOk = await redis.ping();

    res.status(200).json({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks: {
        database: "ok",
        cache: cacheOk ? "ok" : "degraded",
      },
    });
  } catch (err) {
    res.status(503).json({
      status: "unhealthy",
      error: err.message,
    });
  }
});
```

---

## SSL/TLS Termination

**SSL termination** means the load balancer handles the TLS handshake and decrypts traffic so backend servers receive plain HTTP.

```
Client ──HTTPS──▶ Load Balancer ──HTTP──▶ Backend Server
                      │
                 Decrypts here
```

### Benefits

| Benefit | Why It Matters |
|---|---|
| Offloads CPU-heavy TLS from backends | Backends can be smaller/cheaper |
| Centralised certificate management | One place to renew certs |
| Enables content inspection | LB can route by URL/header |
| Simplifies backend config | No TLS setup on each server |

### SSL Pass-Through (Alternative)

The LB forwards encrypted traffic directly to the backend — the backend handles TLS.

```
Client ──HTTPS──▶ Load Balancer ──HTTPS──▶ Backend Server
                      │
                  Does NOT decrypt
```

Use pass-through when end-to-end encryption is a regulatory requirement and you cannot decrypt at the LB.

---

## What Is Auto-Scaling?

**Auto-scaling** automatically adjusts the number of server instances based on current demand.

```
Low traffic (2 AM):        High traffic (Black Friday):
┌────┐ ┌────┐              ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│ S1 │ │ S2 │              │ S1 │ │ S2 │ │ S3 │ │ S4 │ │ S5 │
└────┘ └────┘              └────┘ └────┘ └────┘ └────┘ └────┘
    2 instances                       5 instances
```

### Horizontal vs Vertical Scaling

| Aspect | Horizontal (Scale Out/In) | Vertical (Scale Up/Down) |
|---|---|---|
| **What changes** | Number of instances | Size of each instance |
| **Example** | 2 servers → 5 servers | 4 GB RAM → 16 GB RAM |
| **Downtime** | None (add/remove instances) | Usually requires restart |
| **Cost** | Pay per instance | Pay for bigger machine |
| **Limit** | Virtually unlimited | Hardware maximum |
| **Complexity** | App must be stateless | Simple (no code changes) |
| **Cloud term** | Auto-scaling groups | Instance resizing |

**Horizontal scaling is the standard approach in cloud-native architectures.**

---

## Scaling Policies

Scaling policies define **when** and **how** to scale.

### 1. Target Tracking

Maintain a specific metric at a target value. The auto-scaler adds or removes instances to keep the metric near the target.

```
Target: CPU Utilization = 60%

Current CPU: 85%  →  Scale OUT (add instances)
Current CPU: 30%  →  Scale IN  (remove instances)
Current CPU: 58%  →  No change (within target)
```

```json
{
  "PolicyType": "TargetTrackingScaling",
  "TargetTrackingConfiguration": {
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ASGAverageCPUUtilization"
    },
    "TargetValue": 60.0
  }
}
```

---

### 2. Step Scaling

Define **steps** — different scaling actions for different metric ranges.

| CPU Utilization | Action |
|---|---|
| 60–70 % | Add 1 instance |
| 70–80 % | Add 2 instances |
| 80–90 % | Add 3 instances |
| > 90 % | Add 5 instances |
| < 30 % | Remove 2 instances |
| < 20 % | Remove 3 instances |

Step scaling gives you more control but requires more tuning.

---

### 3. Scheduled Scaling

Scale based on a **known schedule** — useful for predictable traffic patterns.

```json
{
  "ScheduledActionName": "morning-scale-up",
  "Recurrence": "0 8 * * MON-FRI",
  "MinSize": 5,
  "MaxSize": 20,
  "DesiredCapacity": 10
}
```

| Time | Desired Capacity |
|---|---|
| 8 AM Mon–Fri | 10 instances |
| 6 PM Mon–Fri | 4 instances |
| Weekends | 2 instances |

---

### 4. Predictive Scaling

Uses **machine learning** to forecast traffic and pre-scale before demand arrives.

```
         Predicted ─ ─ ─ ─ ─ ─ ┐
        /                        \
       /   Actual ───────┐        \
      /   /               \        \
─────/───/─────────────────\────────\──▶ time
    8AM  10AM              4PM     8PM

Instances are added BEFORE the spike, not after.
```

AWS Auto Scaling supports predictive scaling out of the box.

---

## AWS Auto Scaling Groups (ASG)

An **Auto Scaling Group** is a collection of EC2 instances managed as a unit.

### Key Components

```
┌──────────────────────────────────────┐
│          Auto Scaling Group          │
│                                      │
│  Min: 2    Desired: 4    Max: 10     │
│                                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │ i1 │ │ i2 │ │ i3 │ │ i4 │       │
│  └────┘ └────┘ └────┘ └────┘       │
│                                      │
│  Launch Template: t3.medium,         │
│    AMI: ami-0abc123, SG: sg-xyz      │
│                                      │
│  Scaling Policy: Target CPU = 60%    │
└──────────────────────────────────────┘
```

| Setting | Purpose |
|---|---|
| **Min size** | Never go below this many instances |
| **Max size** | Never exceed this many instances |
| **Desired capacity** | The target number right now |
| **Launch template** | Defines instance type, AMI, security groups |
| **Scaling policies** | Rules for when to add/remove instances |

### ASG with ALB — Terraform Example

```hcl
resource "aws_launch_template" "app" {
  name_prefix   = "app-"
  image_id      = "ami-0abc123def456"
  instance_type = "t3.medium"

  network_interfaces {
    security_groups = [aws_security_group.app.id]
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum update -y
    yum install -y docker
    systemctl start docker
    docker run -d -p 80:3000 my-app:latest
  EOF
  )
}

resource "aws_autoscaling_group" "app" {
  name                = "app-asg"
  min_size            = 2
  max_size            = 10
  desired_capacity    = 4
  vpc_zone_identifier = var.private_subnet_ids
  target_group_arns   = [aws_lb_target_group.app.arn]

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "app-instance"
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_policy" "cpu_target" {
  name                   = "cpu-target-tracking"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 60.0
  }
}
```

---

## Azure Virtual Machine Scale Sets (VMSS)

Azure's equivalent of AWS ASG.

```json
{
  "sku": {
    "name": "Standard_DS2_v2",
    "capacity": 4
  },
  "properties": {
    "upgradePolicy": { "mode": "Rolling" },
    "overprovision": true,
    "automaticRepairsPolicy": {
      "enabled": true,
      "gracePeriod": "PT30M"
    }
  }
}
```

### Azure Autoscale Rule

```json
{
  "metricTrigger": {
    "metricName": "Percentage CPU",
    "operator": "GreaterThan",
    "threshold": 70,
    "timeAggregation": "Average",
    "timeWindow": "PT5M"
  },
  "scaleAction": {
    "direction": "Increase",
    "type": "ChangeCount",
    "value": "2",
    "cooldown": "PT10M"
  }
}
```

---

## Cooldown Periods

A **cooldown period** is a pause after a scaling action during which no further scaling occurs.

### Why Cooldowns Matter

```
Without cooldown:
  CPU spikes → add 3 instances → still high (instances booting) →
  add 3 MORE → 6 extra instances → CPU drops → remove 5 →
  CPU spikes again → THRASHING

With cooldown (5 min):
  CPU spikes → add 3 instances → WAIT 5 min →
  new instances absorb load → CPU normalises → stable
```

| Setting | Typical Value | Purpose |
|---|---|---|
| **Scale-out cooldown** | 3–5 minutes | Wait for new instances to boot |
| **Scale-in cooldown** | 10–15 minutes | Avoid removing instances too soon |

### Best Practices

1. **Scale out fast, scale in slow** — it's better to have extra capacity than not enough.
2. Set scale-in cooldown **longer** than scale-out cooldown.
3. Account for **instance boot time** in the cooldown (if boot takes 3 min, cooldown should be ≥ 3 min).

---

## Scaling Strategies for Different Workloads

| Workload | Strategy | Why |
|---|---|---|
| **Web application** | Target tracking (CPU 60 %) | General purpose, self-adjusting |
| **API server** | Target tracking (request count per target) | Scales with traffic directly |
| **Batch processing** | Queue-based scaling (SQS queue depth) | Scale with backlog size |
| **E-commerce (sale event)** | Scheduled + predictive | Pre-scale before known spikes |
| **Real-time gaming** | Step scaling (connections) | Rapid response to player surges |
| **ML inference** | Target tracking (GPU utilization) | Match compute to demand |
| **Database read replicas** | Target tracking (CPU/connections) | Add replicas under read load |

### Queue-Based Scaling Example

```
                                     ┌────────────┐
  Producers ──▶ ┌────────────┐ ────▶ │ Consumer 1 │
                │  Message    │       └────────────┘
                │  Queue      │       ┌────────────┐
                │  (500 msgs) │ ────▶ │ Consumer 2 │
                └────────────┘       └────────────┘

  Scaling rule:
    Queue depth > 1000 → add 2 consumers
    Queue depth < 100  → remove 1 consumer
```

```json
{
  "PolicyType": "TargetTrackingScaling",
  "TargetTrackingConfiguration": {
    "CustomizedMetricSpecification": {
      "MetricName": "ApproximateNumberOfMessagesVisible",
      "Namespace": "AWS/SQS",
      "Statistic": "Average",
      "Dimensions": [
        {
          "Name": "QueueName",
          "Value": "my-work-queue"
        }
      ]
    },
    "TargetValue": 100.0
  }
}
```

---

## Stress Testing Your Scaling Setup

Before going to production, test that your auto-scaling actually works.

### Tools for Load Testing

| Tool | Language | Highlights |
|---|---|---|
| **k6** | JavaScript | Modern, scriptable, cloud-ready |
| **Locust** | Python | Distributed, web UI |
| **Apache JMeter** | Java | GUI-based, protocol support |
| **wrk** | C | Ultra-fast, simple |
| **Artillery** | JavaScript | YAML config, multiple protocols |
| **hey** | Go | Simple HTTP load generator |

### k6 Load Test Script

```js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 100 },   // Ramp up to 100 users
    { duration: "5m", target: 100 },   // Hold at 100
    { duration: "2m", target: 500 },   // Spike to 500
    { duration: "5m", target: 500 },   // Hold at 500
    { duration: "2m", target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],   // 95% of requests < 500ms
    http_req_failed: ["rate<0.01"],     // < 1% error rate
  },
};

export default function () {
  const res = http.get("https://api.example.com/health");

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### What to Watch During the Test

| Metric | What to Look For |
|---|---|
| **Instance count** | Does it scale out when load increases? |
| **Response time** | Does latency stay acceptable? |
| **Error rate** | Do errors spike during scaling? |
| **CPU/Memory** | Do instances hit 100% before new ones join? |
| **Boot time** | How long until new instances serve traffic? |
| **Scale-in** | Does it scale back down after load drops? |

---

## Hands-On Exercises

### Exercise 1 — Choose the Algorithm

For each scenario, pick the best load-balancing algorithm:

| # | Scenario | Best Algorithm |
|---|---|---|
| 1 | 4 identical web servers, stateless REST API | ? |
| 2 | 3 servers (8-core, 4-core, 2-core), stateless app | ? |
| 3 | WebSocket chat app with long-lived connections | ? |
| 4 | Shopping cart app that stores sessions in server memory | ? |
| 5 | Latency-critical financial trading API | ? |

<details>
<summary>View Answers</summary>

| # | Best Algorithm | Why |
|---|---|---|
| 1 | **Round Robin** | Simple, servers are identical |
| 2 | **Weighted Round Robin** | Different capacities |
| 3 | **Least Connections** | Distributes long-lived connections |
| 4 | **IP Hash** | Sticky sessions needed |
| 5 | **Least Response Time** | Latency is the priority |

</details>

---

### Exercise 2 — Design a Scaling Policy

You run an e-commerce API. Normal traffic: 200 req/s. During flash sales: 2 000 req/s. Flash sales happen every Friday at 6 PM and last 2 hours.

**Design a scaling strategy using at least two policy types.**

<details>
<summary>View Solution</summary>

```
1. SCHEDULED SCALING
   - Every Friday at 5:45 PM: set desired capacity = 15 (pre-warm)
   - Every Friday at 8:15 PM: set desired capacity = 4 (scale back)

2. TARGET TRACKING (always active)
   - Metric: ALBRequestCountPerTarget
   - Target: 50 requests/target
   - This handles unexpected traffic outside flash sales

3. COOLDOWN
   - Scale-out cooldown: 2 minutes
   - Scale-in cooldown: 10 minutes

4. CAPACITY
   - Min: 2
   - Max: 25
   - Normal desired: 4
```

This approach uses scheduled scaling for the **predictable** part and target tracking for the **unpredictable** part.

</details>

---

### Exercise 3 — Layer 4 vs Layer 7

Classify each use case as Layer 4 or Layer 7:

| # | Use Case | Layer |
|---|---|---|
| 1 | Route `/images/*` to a CDN origin | ? |
| 2 | Load-balance PostgreSQL read replicas | ? |
| 3 | Terminate SSL and add `X-Forwarded-For` header | ? |
| 4 | Distribute UDP game server traffic | ? |
| 5 | A/B test by sending 10% of traffic to a new UI | ? |

<details>
<summary>View Answers</summary>

| # | Layer | Why |
|---|---|---|
| 1 | **Layer 7** | Path-based routing |
| 2 | **Layer 4** | TCP protocol, no HTTP |
| 3 | **Layer 7** | SSL termination + header manipulation |
| 4 | **Layer 4** | UDP protocol |
| 5 | **Layer 7** | Content/header-based routing |

</details>

---

### Exercise 4 — Write a Health Check Endpoint

Write a `/health` endpoint in Express.js that:

1. Checks database connectivity
2. Returns `200` with `{ status: "healthy" }` if everything is OK
3. Returns `503` with `{ status: "unhealthy", error: "..." }` if the DB is down
4. Includes uptime and a timestamp

<details>
<summary>View Solution</summary>

```js
import express from "express";
import mongoose from "mongoose";

const app = express();

app.get("/health", async (req, res) => {
  try {
    // Check MongoDB connection state
    // 1 = connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database not connected");
    }

    // Ping the database
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks: {
        database: "ok",
      },
    });
  } catch (err) {
    res.status(503).json({
      status: "unhealthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      error: err.message,
    });
  }
});
```

</details>

---

### Exercise 5 — Stress Test Plan

You are launching a new API. Write a load test plan (in plain English) that tests:

1. Normal load (100 concurrent users)
2. Peak load (500 concurrent users)
3. Spike test (0 → 1 000 users in 30 seconds)
4. Soak test (200 users for 2 hours)

What metrics will you monitor, and what are your pass/fail criteria?

<details>
<summary>View Solution</summary>

```
LOAD TEST PLAN
==============

Phase 1 — Normal Load (10 min)
  100 concurrent users, ramp up over 2 min
  Pass: p95 latency < 200ms, error rate < 0.1%

Phase 2 — Peak Load (10 min)
  500 concurrent users, ramp up over 3 min
  Pass: p95 latency < 500ms, error rate < 0.5%
  Expect: auto-scaler adds 3-5 instances

Phase 3 — Spike Test (5 min)
  0 → 1000 users in 30 seconds
  Pass: no 5xx errors > 2%, recovery within 3 min
  Expect: auto-scaler reacts within 2 min

Phase 4 — Soak Test (2 hours)
  200 concurrent users, constant
  Pass: no memory leaks, latency stable, no instance replacement

METRICS TO MONITOR:
  - Response time (p50, p95, p99)
  - Error rate (4xx, 5xx)
  - Instance count over time
  - CPU / Memory per instance
  - Auto-scaler events (scale out/in timestamps)
  - Queue depth (if applicable)

FAIL CRITERIA:
  - p99 latency > 2 seconds
  - Error rate > 5% for more than 1 minute
  - Auto-scaler fails to add instances
  - Memory usage grows continuously (leak)
```

</details>

---

## Key Takeaways

1. **Load balancing** distributes traffic across multiple servers to ensure high availability and performance.
2. Common algorithms: **Round Robin** (simple), **Least Connections** (adaptive), **IP Hash** (sticky sessions), **Least Response Time** (latency-sensitive).
3. **Layer 4** LBs are fast but content-blind; **Layer 7** LBs can route by URL, header, and cookie.
4. Cloud providers offer managed LBs: **AWS ALB/NLB**, **Azure App Gateway/Load Balancer**, **GCP Cloud Load Balancing**.
5. **Health checks** let the LB detect and remove unhealthy servers automatically.
6. **SSL termination** at the LB offloads crypto from backend servers and centralises certificate management.
7. **Auto-scaling** adds/removes instances based on demand — prefer **horizontal** scaling for cloud-native apps.
8. Scaling policies: **Target tracking** (simplest), **Step scaling** (fine-grained), **Scheduled** (predictable), **Predictive** (ML-based).
9. **Cooldown periods** prevent thrashing — scale out fast, scale in slow.
10. Always **stress test** your scaling setup before production using tools like k6 or Locust.

---

## Further Reading

- [AWS Elastic Load Balancing Docs](https://docs.aws.amazon.com/elasticloadbalancing/)
- [AWS Auto Scaling Docs](https://docs.aws.amazon.com/autoscaling/)
- [Azure Load Balancer Overview](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview)
- [GCP Cloud Load Balancing](https://cloud.google.com/load-balancing/docs)
- [k6 Load Testing](https://k6.io/docs/)
- [NGINX Load Balancing Guide](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/)
