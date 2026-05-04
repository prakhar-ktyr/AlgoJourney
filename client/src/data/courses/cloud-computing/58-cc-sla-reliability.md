---
title: "SLAs, SLOs, and Reliability Engineering"
---

# SLAs, SLOs, and Reliability Engineering

How do you promise your users that a service will be reliable? How do you measure it? And what happens when things break? This lesson covers the **language of reliability** — SLAs, SLOs, and SLIs — along with the practices of **Site Reliability Engineering (SRE)** that keep systems running at scale.

---

## SLA vs SLO vs SLI

These three terms are often confused, but each serves a distinct purpose.

### Definitions

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  SLI (Service Level Indicator)                           │
│  ─────────────────────────────                           │
│  A quantitative MEASUREMENT of a service attribute.      │
│  "What we measure."                                      │
│  Example: 99.95% of requests completed in < 200ms        │
│                                                          │
│  SLO (Service Level Objective)                           │
│  ─────────────────────────────                           │
│  An internal TARGET for an SLI.                          │
│  "What we aim for."                                      │
│  Example: 99.9% availability over a 30-day window        │
│                                                          │
│  SLA (Service Level Agreement)                           │
│  ─────────────────────────────                           │
│  A contractual PROMISE with consequences for breach.     │
│  "What we guarantee (with penalties)."                   │
│  Example: 99.9% uptime or customer receives credits      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### The Relationship

```
Strictness:    SLI   >   SLO   >   SLA

               ┌─────────────────────────────┐
               │     SLA (External Promise)   │
               │   ┌───────────────────────┐  │
               │   │  SLO (Internal Target) │  │
               │   │  ┌─────────────────┐   │  │
               │   │  │  SLI (Measured)  │   │  │
               │   │  └─────────────────┘   │  │
               │   └───────────────────────┘  │
               └─────────────────────────────┘

Best practice: SLO should be STRICTER than SLA.
If SLA = 99.9%, then SLO should be ≥ 99.95%.
This gives you a buffer before breaching your contract.
```

### Examples in Practice

| Service | SLI | SLO | SLA |
|---------|-----|-----|-----|
| **API** | % of requests returning 2xx within 500ms | 99.95% success rate per month | 99.9% or service credits |
| **Database** | % of queries completing under 100ms | 99.99% availability per quarter | 99.95% or penalty clause |
| **CDN** | % of objects served within 50ms from edge | 99.9% cache hit rate | 99.5% or reduced billing |
| **Storage** | % of read/write operations succeeding | 99.999% durability | 99.99% or data loss coverage |

---

## Calculating Availability (The Nines)

Availability is measured in "nines" — each additional nine dramatically reduces allowed downtime.

### The Nines Table

```
Availability    Downtime/Year    Downtime/Month    Downtime/Week
──────────────────────────────────────────────────────────────────
90%    (1 nine)   36.5 days        72 hours          16.8 hours
99%    (2 nines)  3.65 days        7.2 hours         1.68 hours
99.5%             1.83 days        3.6 hours         50.4 minutes
99.9%  (3 nines)  8.76 hours       43.2 minutes      10.1 minutes
99.95%            4.38 hours       21.6 minutes      5.04 minutes
99.99% (4 nines)  52.6 minutes     4.32 minutes      1.01 minutes
99.999%(5 nines)  5.26 minutes     25.9 seconds      6.05 seconds
99.9999%          31.5 seconds     2.59 seconds      0.60 seconds
```

### Calculating Availability

```
                Uptime
Availability = ──────── × 100%
               Total Time

Example:
  Service was up for 719 hours out of 720 hours in a month.
  Availability = 719/720 × 100% = 99.86%

  This is BELOW 99.9% — the SLO would be breached!
```

### Composite Availability

When services depend on each other, availability **multiplies** (gets worse):

```
Sequential Dependencies (both must work):
──────────────────────────────────────────

  Request → [Service A: 99.9%] → [Service B: 99.9%]

  Combined = 99.9% × 99.9% = 99.8%

  Adding more services makes it worse:
  3 services at 99.9% = 99.7%
  5 services at 99.9% = 99.5%
  10 services at 99.9% = 99.0%

Parallel Dependencies (either can serve):
──────────────────────────────────────────

  Request → ┌ [Instance A: 99.9%] ┐
            └ [Instance B: 99.9%] ┘

  Combined = 1 - (0.001 × 0.001) = 99.9999%

  Redundancy dramatically IMPROVES availability!
```

> **Key insight:** Every dependency you add reduces availability. Design for **fewer sequential dependencies** and **more parallel redundancy**.

---

## Error Budgets

An error budget is the **acceptable amount of unreliability** over a given period.

### How Error Budgets Work

```
If your SLO is 99.9% availability per month (30 days):

Error Budget = 100% - 99.9% = 0.1% of the month

0.1% of 30 days = 0.1% × 43,200 minutes = 43.2 minutes

You have 43.2 minutes of allowed downtime per month.
```

### Error Budget Tracking

```
Month: May 2026

SLO: 99.9% (43.2 min budget)

Week 1: 5 min outage (deploy rollback)
         Budget remaining: 38.2 min  ████████████████░░░░ 88%

Week 2: 12 min outage (DB failover)
         Budget remaining: 26.2 min  ████████████░░░░░░░░ 61%

Week 3: No incidents
         Budget remaining: 26.2 min  ████████████░░░░░░░░ 61%

Week 4: 8 min outage (network issue)
         Budget remaining: 18.2 min  ████████░░░░░░░░░░░░ 42%

Status: Within budget ✓ (but be cautious!)
```

### Error Budget Policies

Define what happens as your error budget depletes:

```
Error Budget Policy:
─────────────────────────────────────────────────────

Budget Remaining    Action
─────────────────────────────────────────────────────
> 50%               Normal development velocity
                    Feature releases proceed as planned

25-50%              Increased caution
                    Extra review for risky changes
                    Prioritize reliability tasks

10-25%              Slow down releases
                    Focus on stability improvements
                    Mandatory canary deployments

< 10%               FREEZE feature releases
                    All engineering effort on reliability
                    Only critical security fixes allowed

0% (exhausted)      Full freeze until next budget period
                    Mandatory postmortem review
                    Remediation plan required
─────────────────────────────────────────────────────
```

> **Philosophy:** Error budgets align incentives. Product teams want to ship features; SRE teams want stability. The error budget gives **both teams a shared, objective measure** to negotiate with.

---

## Site Reliability Engineering (SRE) Principles

SRE is a discipline that applies software engineering principles to operations. Originated at Google.

### Core SRE Principles

```
SRE Principle                 Description
─────────────────────────────────────────────────────────────
Embrace risk                  100% reliability is the wrong target;
                              accept calculated risk via error budgets

Eliminate toil                Automate repetitive operational work;
                              toil should be < 50% of SRE time

Monitor meaningfully          Focus on the Four Golden Signals:
                              latency, traffic, errors, saturation

Simplicity                    Simple systems are more reliable;
                              resist unnecessary complexity

Release engineering           Progressive rollouts, canary deploys,
                              feature flags for safe releases

Postmortems                   Blameless learning from every incident;
                              focus on systemic fixes, not blame
```

### The Four Golden Signals

```
┌───────────────────────────────────────────────────────┐
│            The Four Golden Signals                    │
│                                                       │
│  ┌─────────────┐         ┌─────────────┐              │
│  │   LATENCY   │         │   TRAFFIC   │              │
│  │             │         │             │              │
│  │ How long    │         │ How much    │              │
│  │ requests    │         │ demand is   │              │
│  │ take        │         │ on the      │              │
│  │             │         │ system      │              │
│  │ Metric:     │         │ Metric:     │              │
│  │ p50, p95,   │         │ req/sec,    │              │
│  │ p99         │         │ concurrent  │              │
│  └─────────────┘         │ users       │              │
│                          └─────────────┘              │
│  ┌─────────────┐         ┌─────────────┐              │
│  │   ERRORS    │         │ SATURATION  │              │
│  │             │         │             │              │
│  │ Rate of     │         │ How "full"  │              │
│  │ failed      │         │ the system  │              │
│  │ requests    │         │ is          │              │
│  │             │         │             │              │
│  │ Metric:     │         │ Metric:     │              │
│  │ error rate, │         │ CPU%, mem%, │              │
│  │ 5xx count   │         │ disk%, queue│              │
│  └─────────────┘         │ depth       │              │
│                          └─────────────┘              │
└───────────────────────────────────────────────────────┘
```

---

## Toil Reduction

**Toil** is manual, repetitive, automatable work that scales linearly with service growth and provides no lasting value.

### Identifying Toil

| Activity | Toil? | Why? |
|----------|-------|------|
| Manually restarting crashed services | Yes | Automatable with health checks |
| Rotating SSL certificates by hand | Yes | Automatable with Let's Encrypt |
| Manually scaling for traffic spikes | Yes | Auto-scaling exists |
| Investigating a novel production issue | No | Requires human judgment |
| Writing a postmortem | No | Creative, valuable work |
| Running database migrations manually | Yes | Can be automated in CI/CD |

### Toil Budget

```
SRE Time Allocation (Google's recommendation):
────────────────────────────────────────────

Toil (operational work):     ≤ 50%  ████████████████████
Engineering (projects):      ≥ 50%  ████████████████████

If toil > 50%, the team is understaffed or under-automated.

Goal: Continuously reduce toil through automation,
      freeing up time for engineering improvements.
```

### Toil Reduction Example

```
Before: Manual SSL Certificate Renewal
─────────────────────────────────────────
1. Calendar reminder fires (every 90 days per domain)
2. Engineer generates CSR manually
3. Submits to certificate authority
4. Waits for approval
5. Downloads certificate
6. Uploads to load balancer
7. Tests the new certificate
8. Repeats for each domain

Time per renewal: 30 minutes
Domains: 50
Annual toil: 50 × 4 renewals × 30 min = 100 hours/year

After: Automated with cert-manager + Let's Encrypt
───────────────────────────────────────────────────
1. cert-manager monitors certificate expiry
2. Automatically requests renewal via ACME
3. Installs new certificate
4. Zero human intervention

Time per renewal: 0 minutes
Annual toil: 0 hours/year
Savings: 100 hours/year ✓
```

---

## Incident Management

### On-Call Best Practices

```
On-Call Structure:
──────────────────

Primary On-Call        ← First responder
     │
     ├── Can't resolve in 15 min?
     │
Secondary On-Call      ← Escalation
     │
     ├── Major incident declared?
     │
Incident Commander     ← Coordinates response
     │
     ├── Customer-facing impact?
     │
Communications Lead    ← External updates
```

### On-Call Health Metrics

| Metric | Healthy | Unhealthy |
|--------|---------|-----------|
| Pages per shift | ≤ 2 | > 5 |
| Incidents per week | ≤ 3 | > 7 |
| Time to acknowledge | < 5 min | > 15 min |
| Mean time to resolve | < 1 hour | > 4 hours |
| False alarm rate | < 10% | > 30% |
| Sleep interruptions | ≤ 1/night | > 2/night |

### Escalation Path

```
Severity Levels:
──────────────────────────────────────────────────────

SEV-1 (Critical)
  Impact: Service completely down, revenue loss
  Response: Immediate, all-hands
  Notify: VP Engineering, C-suite
  Cadence: Updates every 15 minutes
  Example: Payment processing failure

SEV-2 (High)
  Impact: Significant degradation, some users affected
  Response: Within 15 minutes
  Notify: Engineering manager
  Cadence: Updates every 30 minutes
  Example: API latency 10x normal

SEV-3 (Medium)
  Impact: Minor degradation, workaround available
  Response: Within 1 hour
  Notify: Team lead
  Cadence: Updates every 2 hours
  Example: Search results slightly delayed

SEV-4 (Low)
  Impact: Cosmetic issue, no user impact
  Response: Next business day
  Notify: Ticket assigned
  Example: Dashboard chart rendering glitch
```

---

## Blameless Postmortems

A postmortem is a structured review **after** an incident. The key word is **blameless**.

### Blameless Culture

```
BLAME-BASED (BAD):                BLAMELESS (GOOD):
──────────────────                ────────────────────
"Who made this mistake?"          "What made this mistake
                                   possible?"

"Bob pushed a bad config"         "Our config pipeline lacked
                                   validation"

"The DBA should have known"       "Our runbook didn't cover
                                   this scenario"

"This was a human error"          "Our system allowed a single
                                   action to cause an outage"
```

### Postmortem Template

```markdown
# Incident Postmortem: [Title]

## Incident Summary
- **Date:** 2026-05-01
- **Duration:** 47 minutes (14:23 - 15:10 UTC)
- **Severity:** SEV-2
- **Impact:** 15% of API requests returned 503 errors
- **Customers affected:** ~2,300

## Timeline (UTC)
| Time  | Event |
|-------|-------|
| 14:20 | Deploy v2.34.1 starts rolling out |
| 14:23 | Error rate increases from 0.1% to 8% |
| 14:25 | PagerDuty alert fires |
| 14:27 | On-call acknowledges, begins investigation |
| 14:35 | Root cause identified: new query missing index |
| 14:40 | Decision: rollback deployment |
| 14:45 | Rollback initiated |
| 15:05 | Rollback complete, error rate returning to normal |
| 15:10 | All clear declared |

## Root Cause
A new database query introduced in v2.34.1 performed a
full table scan on the `orders` table (12M rows). The
query lacked an index on the `status` column, causing
database CPU to spike to 98% and connection pool exhaustion.

## Contributing Factors
1. No load testing in staging with production-scale data
2. Database query review not part of PR checklist
3. Canary deployment only waited 2 minutes (too short)

## What Went Well
- Alerting detected the issue within 2 minutes
- On-call responded quickly
- Rollback procedure worked smoothly

## What Went Wrong
- Issue wasn't caught in staging (smaller dataset)
- Canary period was too short to detect slow degradation

## Action Items
| Action | Owner | Priority | Due Date |
|--------|-------|----------|----------|
| Add production-scale data to staging DB | Platform | P1 | May 15 |
| Add query plan review to PR checklist | DBA Team | P1 | May 8 |
| Increase canary period to 15 minutes | Deploy Team | P2 | May 10 |
| Add DB CPU alert at 70% threshold | SRE | P2 | May 8 |
```

---

## Reliability Patterns

### Circuit Breaker

Prevents cascading failures by stopping requests to a failing service.

```
Circuit Breaker States:
───────────────────────

  CLOSED ──(failures exceed threshold)──▶ OPEN
    ▲                                       │
    │                                       │
    └──(success)── HALF-OPEN ◀──(timeout)──┘

CLOSED:    Requests flow normally.
           Track failure count.

OPEN:      Requests immediately fail.
           No calls to the downstream service.
           Wait for timeout period.

HALF-OPEN: Allow limited test requests.
           If they succeed → CLOSED
           If they fail → OPEN again
```

```
Example Configuration:
─────────────────────
Failure threshold:    5 failures in 60 seconds
Open duration:        30 seconds
Half-open requests:   3 test requests
Success threshold:    2 successes to close
```

### Bulkhead Pattern

Isolate components so a failure in one doesn't sink the entire system.

```
Without Bulkhead:
─────────────────
┌────────────────────────────────────┐
│          Shared Thread Pool        │
│  ┌──────────────────────────────┐  │
│  │ Service A calls ████████████ │  │  ← Service A uses
│  │ Service B calls             │  │     ALL threads
│  │ Service C calls             │  │  ← B and C starved!
│  └──────────────────────────────┘  │
└────────────────────────────────────┘

With Bulkhead:
──────────────
┌────────────────────────────────────┐
│  ┌──────────┐ ┌──────┐ ┌──────┐   │
│  │Service A │ │Svc B │ │Svc C │   │
│  │Pool: 10  │ │Pool:5│ │Pool:5│   │
│  │████████░░│ │█████ │ │█████ │   │
│  └──────────┘ └──────┘ └──────┘   │
│                                    │
│  Service A failure only affects    │
│  its own pool. B and C are fine!   │
└────────────────────────────────────┘
```

### Retry with Exponential Backoff

```
Retry Strategy:
───────────────

Attempt 1: Immediate
Attempt 2: Wait 1 second
Attempt 3: Wait 2 seconds
Attempt 4: Wait 4 seconds
Attempt 5: Wait 8 seconds (give up after this)

With Jitter (randomized delay to prevent thundering herd):

Attempt 1: Immediate
Attempt 2: Wait 1s + random(0, 0.5s) = ~1.3s
Attempt 3: Wait 2s + random(0, 1.0s) = ~2.7s
Attempt 4: Wait 4s + random(0, 2.0s) = ~5.1s
Attempt 5: Wait 8s + random(0, 4.0s) = ~10.2s
```

```javascript
// Exponential backoff with jitter
async function retryWithBackoff(fn, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      const baseDelay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s
      const jitter = Math.random() * baseDelay * 0.5;
      const delay = baseDelay + jitter;

      console.log(
        `Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Usage
const result = await retryWithBackoff(() => fetch("/api/data"));
```

### Timeout Pattern

```
Timeout Best Practices:
───────────────────────

Rule of thumb: timeout = p99 latency × 2

Service          p99 Latency    Timeout Setting
──────────────────────────────────────────────
Database query   50ms           100-200ms
Internal API     200ms          500ms
External API     2s             5-10s
File upload      10s            30s
Background job   60s            120s

NEVER use infinite timeouts. Every external call
needs a timeout. No exceptions.
```

---

## Capacity Planning

### Capacity Planning Process

```
Capacity Planning Cycle:
────────────────────────

  ┌─────────────┐
  │  1. Measure  │  Current utilization,
  │  current     │  growth rate, patterns
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  2. Forecast │  Project future demand
  │  demand      │  based on business plans
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  3. Plan     │  Determine resources
  │  capacity    │  needed to meet demand
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  4. Execute  │  Provision resources
  │  & monitor   │  ahead of demand
  └──────┬──────┘
         │
         └──────▶ (repeat quarterly)
```

### Capacity Planning Spreadsheet

```
Resource Capacity Plan — Q3 2026:
──────────────────────────────────────────────────────────────

Resource      Current    Current    Growth    Q3 Need   Action
              Capacity   Usage      Rate/Qtr
──────────────────────────────────────────────────────────────
API Servers   20         14 (70%)   +15%      ~16       OK
Database CPU  16 vCPU    12 (75%)   +20%      ~14       Upgrade
Database Mem  64 GB      52 (81%)   +20%      ~62       Upgrade!
Redis Cache   32 GB      18 (56%)   +10%      ~20       OK
S3 Storage    10 TB      7.2 TB     +25%      ~9 TB     Monitor
Bandwidth     10 Gbps    6 Gbps     +15%      ~7 Gbps   OK
──────────────────────────────────────────────────────────────

Action Items:
- Database: Upgrade to r5.2xlarge before June
- Storage: Set up lifecycle policies to manage growth
```

---

## Load Testing

Validate your capacity plan with real load tests.

### Load Test Types

| Type | Purpose | Duration |
|------|---------|----------|
| **Smoke test** | Verify system works under minimal load | 1-5 minutes |
| **Load test** | Validate performance at expected load | 15-60 minutes |
| **Stress test** | Find the breaking point | 15-30 minutes |
| **Soak test** | Detect memory leaks, resource exhaustion | 2-24 hours |
| **Spike test** | Test sudden traffic surges | 5-10 minutes |

### Load Test Example (k6)

```javascript
// load-test.js — run with: k6 run load-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 100 },  // Ramp up to 100 users
    { duration: "5m", target: 100 },  // Hold at 100 users
    { duration: "2m", target: 200 },  // Ramp up to 200 users
    { duration: "5m", target: 200 },  // Hold at 200 users
    { duration: "2m", target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],  // 95% under 500ms
    http_req_failed: ["rate<0.01"],    // < 1% errors
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

---

## Game Days

A **Game Day** is a planned exercise where you intentionally inject failures into production (or a production-like environment) to test resilience.

### Game Day Checklist

```
Game Day Preparation:
─────────────────────
□ Define the failure scenario (e.g., "AZ failure")
□ Identify expected system behavior
□ Set up monitoring dashboards
□ Notify stakeholders
□ Prepare rollback plan
□ Schedule during low-traffic period
□ Have all responders available

Game Day Execution:
───────────────────
□ Start recording (timeline, metrics)
□ Inject the failure
□ Observe system behavior
□ Compare against expectations
□ Note any unexpected behaviors
□ Roll back the failure
□ Verify full recovery

Game Day Review:
────────────────
□ Did the system behave as expected?
□ Did alerts fire correctly?
□ Did runbooks cover the scenario?
□ What gaps were discovered?
□ Create action items for improvements
```

### Common Game Day Scenarios

| Scenario | How to Inject | What to Observe |
|----------|---------------|-----------------|
| Instance failure | Terminate random EC2 instances | Auto-scaling, load balancing |
| AZ failure | Block traffic to one AZ | Multi-AZ failover |
| Database failover | Force RDS failover | Connection handling, retry logic |
| Network partition | Block cross-service traffic | Circuit breakers, timeouts |
| DNS failure | Return NXDOMAIN for service | DNS caching, fallback |
| Dependency failure | Block calls to external API | Graceful degradation |
| CPU saturation | Stress test CPU to 100% | Auto-scaling, alerts |
| Disk full | Fill disk to capacity | Log rotation, alerting |

---

## SRE Tools and Practices in Major Clouds

### Monitoring and Observability

```
Cloud Provider Observability Stack:
──────────────────────────────────────────────────────────────

AWS:
  Metrics:    CloudWatch Metrics
  Logs:       CloudWatch Logs
  Traces:     X-Ray
  Dashboards: CloudWatch Dashboards
  Alerts:     CloudWatch Alarms → SNS → PagerDuty

Azure:
  Metrics:    Azure Monitor Metrics
  Logs:       Log Analytics (KQL)
  Traces:     Application Insights
  Dashboards: Azure Dashboards / Grafana
  Alerts:     Azure Monitor Alerts → Action Groups

GCP:
  Metrics:    Cloud Monitoring
  Logs:       Cloud Logging
  Traces:     Cloud Trace
  Dashboards: Cloud Monitoring Dashboards
  Alerts:     Alerting Policies → Notification Channels
```

### Popular Third-Party SRE Tools

| Category | Tools |
|----------|-------|
| **Monitoring** | Datadog, Grafana, Prometheus, New Relic |
| **Alerting** | PagerDuty, OpsGenie, VictorOps |
| **Incident Management** | incident.io, FireHydrant, Rootly |
| **Status Pages** | Statuspage.io, Cachet, Instatus |
| **Chaos Engineering** | Chaos Monkey, Gremlin, Litmus, Chaos Mesh |
| **Load Testing** | k6, Locust, Gatling, Artillery |
| **Logging** | ELK Stack, Splunk, Loki |
| **Tracing** | Jaeger, Zipkin, OpenTelemetry |

---

## SLO Dashboard Design

```
SLO Dashboard Layout:
─────────────────────

┌─────────────────────────────────────────────────┐
│  Service: Payment API          SLO: 99.95%      │
│                                                  │
│  Current: 99.97% ✅    Error Budget: 67% left   │
│  ████████████████████████████████░░░░░░░░░░░░░  │
│                                                  │
│  30-day Trend:                                  │
│  100%─┬──────────────────────────────           │
│       │  ──────────   ─────────────             │
│ 99.9%─┤─ ─ ─ ─ ─ ─ ─SLO─ ─ ─ ─ ─ ─            │
│       │      ╲  ╱                               │
│ 99.8%─┤       ╲╱ incident                       │
│       └────────────────────────────── days       │
│         1    5   10   15   20   25   30         │
│                                                  │
│  Error Budget Burn Rate: 0.8x (healthy)         │
│  Projected Month-End: 99.96% (on track)         │
│  Incidents This Month: 2                        │
└─────────────────────────────────────────────────┘
```

---

## Putting It All Together

### Reliability Maturity Model

```
Level 1: REACTIVE
──────────────────
□ No SLOs defined
□ Alerts based on gut feeling
□ Manual incident response
□ Postmortems are blame-oriented
□ No capacity planning

Level 2: PROACTIVE
──────────────────
□ SLOs defined for critical services
□ Error budgets tracked
□ On-call rotation established
□ Blameless postmortems practiced
□ Basic load testing

Level 3: SYSTEMATIC
───────────────────
□ SLOs/SLIs for all services
□ Error budget policies enforced
□ Toil < 50% of SRE time
□ Regular game days
□ Chaos engineering practiced
□ Capacity planning quarterly

Level 4: OPTIMIZED
──────────────────
□ SLO-driven release decisions
□ Automated incident response
□ Continuous chaos engineering
□ Predictive capacity planning
□ Full observability (metrics + logs + traces)
□ Self-healing systems
```

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| **SLI** | What you measure (e.g., latency, error rate) |
| **SLO** | What you target internally (e.g., 99.95%) |
| **SLA** | What you contractually guarantee (e.g., 99.9% or credits) |
| **The nines** | Each additional nine is 10x harder and more expensive |
| **Error budgets** | Balance innovation velocity with reliability |
| **Four Golden Signals** | Latency, traffic, errors, saturation |
| **Toil** | Automate repetitive ops work — keep it under 50% |
| **Blameless postmortems** | Focus on systems, not people |
| **Circuit breakers** | Stop cascading failures to downstream services |
| **Game days** | Test failure resilience in production regularly |

---

## Exercises

1. **SLI/SLO Design:** Design SLIs and SLOs for an e-commerce platform with these services: product catalog, search, shopping cart, checkout, and order tracking. For each service, define at least 2 SLIs and set appropriate SLO targets.

2. **Error Budget Calculation:** Your API has an SLO of 99.95% availability measured monthly. In the past 30 days, you had three incidents: 8 minutes, 12 minutes, and 3 minutes. (a) What is your total error budget? (b) How much have you consumed? (c) What percentage remains?

3. **Composite Availability:** Your application has a chain of 4 sequential services each with 99.9% availability, plus a caching layer that can serve 60% of requests independently. Calculate the effective end-to-end availability.

4. **Postmortem Writing:** Write a blameless postmortem for this scenario: a developer pushed a configuration change that caused the authentication service to reject all login attempts for 25 minutes during peak traffic hours. Include timeline, root cause, contributing factors, and action items.

5. **Game Day Plan:** Design a Game Day exercise for testing your system's resilience to a database failover. Include the failure scenario, expected behavior, monitoring setup, success criteria, rollback plan, and review process.
