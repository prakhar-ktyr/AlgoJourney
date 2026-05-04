---
title: "Chaos Engineering"
---

# Chaos Engineering

Chaos Engineering is the discipline of experimenting on a distributed system to build confidence in its ability to withstand turbulent conditions in production.

---

## What is Chaos Engineering?

Chaos Engineering involves intentionally injecting failures into a system to discover weaknesses before they cause outages. Rather than waiting for things to break, engineers proactively test how systems respond to unexpected conditions.

| Aspect | Description |
|--------|-------------|
| **Goal** | Build confidence in system resilience |
| **Method** | Controlled experiments with real failures |
| **Scope** | Infrastructure, application, and network layers |
| **Outcome** | Discover weaknesses before customers do |
| **Philosophy** | Embrace failure as inevitable |

```
Traditional Testing:        Chaos Engineering:
┌─────────────┐            ┌─────────────┐
│ Does it work │            │ How does it  │
│ correctly?   │            │ fail?        │
└─────────────┘            └─────────────┘
       │                          │
       ▼                          ▼
 Unit tests,                Inject faults,
 Integration tests          observe behavior
```

Chaos Engineering is NOT about breaking things randomly. It is a disciplined, scientific approach to understanding system behavior under stress.

---

## Netflix and Chaos Monkey History

Netflix pioneered chaos engineering out of necessity when migrating from data centers to AWS in 2010.

### Timeline

| Year | Milestone |
|------|-----------|
| 2010 | Netflix begins AWS migration |
| 2011 | Chaos Monkey created — randomly terminates instances |
| 2012 | Simian Army expanded (Latency Monkey, Conformity Monkey, etc.) |
| 2014 | Chaos Kong — simulates entire region failures |
| 2015 | Netflix open-sources Chaos Monkey |
| 2017 | Principles of Chaos Engineering published |
| 2019 | ChAP (Chaos Automation Platform) announced |

### The Simian Army

```
┌──────────────────────────────────────────────────┐
│                  Simian Army                       │
├──────────────────┬───────────────────────────────┤
│ Chaos Monkey     │ Kills random instances         │
│ Latency Monkey   │ Introduces artificial delays   │
│ Conformity Monkey│ Finds non-conforming instances │
│ Doctor Monkey    │ Detects unhealthy instances    │
│ Janitor Monkey   │ Cleans up unused resources     │
│ Security Monkey  │ Finds security violations      │
│ Chaos Gorilla    │ Simulates AZ outage            │
│ Chaos Kong       │ Simulates region outage        │
└──────────────────┴───────────────────────────────┘
```

Netflix's philosophy: **"The best way to avoid failure is to fail constantly."**

---

## Principles of Chaos Engineering

The four core principles guide every chaos experiment.

### 1. Build a Hypothesis Around Steady State

Define what "normal" looks like using measurable metrics before introducing any chaos.

```
Steady State Hypothesis:
─────────────────────────
"When 100 requests/sec hit the order service,
 p99 latency stays below 200ms and error rate
 remains under 0.1%"
```

### 2. Vary Real-World Events

Inject failures that reflect actual production incidents:

| Event Category | Examples |
|---------------|----------|
| Hardware | Server crash, disk failure, memory exhaustion |
| Network | Partition, packet loss, DNS failure, latency |
| Application | Process crash, dependency timeout, config error |
| Cloud | AZ outage, API throttling, certificate expiry |
| Human | Misdeployment, misconfiguration |

### 3. Run Experiments in Production

Production is the only environment that truly represents real user behavior, traffic patterns, and infrastructure complexity.

```
Why production matters:
┌────────────┐     ┌────────────┐     ┌────────────┐
│  Staging   │     │   Canary   │     │ Production │
│            │     │            │     │            │
│ Synthetic  │ →   │ Limited    │ →   │ Real users │
│ traffic    │     │ real       │     │ Full scale │
│ Simplified │     │ traffic    │     │ Full       │
│ topology   │     │            │     │ complexity │
└────────────┘     └────────────┘     └────────────┘
   Low                Medium              High
   confidence         confidence          confidence
```

### 4. Automate Experiments to Run Continuously

Manual experiments are valuable initially, but automation ensures ongoing resilience validation.

```yaml
# Example: Automated chaos schedule
chaos_schedule:
  - experiment: "kill-random-pod"
    frequency: "daily"
    blast_radius: "single-pod"
    auto_rollback: true
  - experiment: "network-partition"
    frequency: "weekly"
    blast_radius: "single-service"
    auto_rollback: true
  - experiment: "az-failure"
    frequency: "monthly"
    blast_radius: "availability-zone"
    auto_rollback: true
    requires_approval: true
```

---

## Chaos Experiments

### Network Failures

Simulate network problems that commonly occur in distributed systems.

```bash
# Simulate packet loss (Linux tc)
tc qdisc add dev eth0 root netem loss 10%

# Simulate network partition
iptables -A INPUT -s 10.0.1.0/24 -j DROP

# Simulate DNS failure
echo "127.0.0.1 dependency-service.internal" >> /etc/hosts

# Simulate bandwidth throttling
tc qdisc add dev eth0 root tbf rate 1mbit burst 32kbit latency 400ms
```

| Experiment | Target | Expected Behavior |
|-----------|--------|-------------------|
| Packet loss 5% | Service mesh | Retries succeed, no user impact |
| Full partition | Database replica | Failover to primary within 30s |
| DNS failure | External API | Circuit breaker opens, cached response |
| Bandwidth limit | File uploads | Graceful timeout, user notification |

### Node Crashes

```bash
# Kill a random container
docker kill $(docker ps -q | shuf -n 1)

# Terminate a Kubernetes pod
kubectl delete pod <pod-name> --grace-period=0

# Simulate OOM kill
stress-ng --vm 2 --vm-bytes 90% -t 60s
```

### Latency Injection

```python
# Middleware for latency injection
import random
import time

class ChaosLatencyMiddleware:
    def __init__(self, app, probability=0.1, delay_ms=2000):
        self.app = app
        self.probability = probability
        self.delay_ms = delay_ms

    def __call__(self, environ, start_response):
        if random.random() < self.probability:
            time.sleep(self.delay_ms / 1000.0)
        return self.app(environ, start_response)
```

### Resource Exhaustion

| Resource | Tool | Command |
|----------|------|---------|
| CPU | stress-ng | `stress-ng --cpu 4 --timeout 60s` |
| Memory | stress-ng | `stress-ng --vm 2 --vm-bytes 80% -t 60s` |
| Disk I/O | fio | `fio --name=chaos --rw=randwrite --size=1G` |
| File descriptors | ulimit | `ulimit -n 10` |
| Threads | fork bomb (controlled) | Custom script with limits |

---

## Tools

### Chaos Monkey (Netflix)

```
┌─────────────────────────────────────┐
│         Chaos Monkey                 │
├─────────────────────────────────────┤
│ Platform: AWS (Spinnaker)           │
│ Scope: Instance termination         │
│ Schedule: Configurable              │
│ Language: Go                        │
│ License: Apache 2.0                 │
└─────────────────────────────────────┘
```

Configuration example:

```toml
# chaos-monkey.toml
[chaosmonkey]
  enabled = true
  schedule_enabled = true
  leashed = false
  accounts = ["production"]

[chaosmonkey.scheduler]
  frequency = "weekday"
  start_hour = 9
  end_hour = 17
```

### Gremlin

Enterprise chaos engineering platform with a safe, controlled approach.

| Feature | Description |
|---------|-------------|
| Attack types | Resource, network, state |
| Targeting | Tags, labels, percentage |
| Safety | Halt button, magnitude limits |
| Observability | Built-in metrics and dashboards |
| Teams | Role-based access control |

### LitmusChaos (Kubernetes-native)

```yaml
# litmus-chaos-experiment.yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosExperiment
metadata:
  name: pod-delete
spec:
  definition:
    scope: Namespaced
    permissions:
      - apiGroups: [""]
        resources: ["pods"]
        verbs: ["delete", "list"]
    env:
      - name: TOTAL_CHAOS_DURATION
        value: "30"
      - name: CHAOS_INTERVAL
        value: "10"
      - name: FORCE
        value: "false"
```

### AWS Fault Injection Simulator (FIS)

```json
{
  "description": "Terminate 30% of instances in ASG",
  "targets": {
    "myInstances": {
      "resourceType": "aws:ec2:instance",
      "selectionMode": "PERCENT(30)",
      "resourceTags": {
        "Environment": "production"
      }
    }
  },
  "actions": {
    "terminateInstances": {
      "actionId": "aws:ec2:terminate-instances",
      "parameters": {},
      "targets": {
        "Instances": "myInstances"
      }
    }
  },
  "stopConditions": [
    {
      "source": "aws:cloudwatch:alarm",
      "value": "arn:aws:cloudwatch:us-east-1:123456:alarm:HighErrorRate"
    }
  ]
}
```

### Chaos Mesh (Kubernetes)

```yaml
# chaos-mesh-network-delay.yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: network-delay
spec:
  action: delay
  mode: one
  selector:
    namespaces:
      - default
    labelSelectors:
      app: payment-service
  delay:
    latency: "500ms"
    jitter: "100ms"
    correlation: "50"
  duration: "5m"
  scheduler:
    cron: "@every 2h"
```

### Tool Comparison

| Tool | Platform | Open Source | Best For |
|------|----------|-------------|----------|
| Chaos Monkey | AWS/Spinnaker | Yes | Instance termination |
| Gremlin | Any | No (SaaS) | Enterprise, safety-first |
| LitmusChaos | Kubernetes | Yes | K8s-native workflows |
| AWS FIS | AWS | No | AWS infrastructure |
| Chaos Mesh | Kubernetes | Yes | K8s network/IO chaos |

---

## Game Days

A game day is a planned event where teams deliberately inject failures to test system resilience and team response.

### Game Day Structure

```
┌─────────────────────────────────────────────────┐
│              Game Day Workflow                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. Planning (1-2 weeks before)                 │
│     └─ Define scope, hypothesis, participants   │
│                                                  │
│  2. Pre-checks (day of)                         │
│     └─ Verify monitoring, alerting, rollback    │
│                                                  │
│  3. Execution (1-4 hours)                       │
│     └─ Inject failures, observe, respond        │
│                                                  │
│  4. Recovery                                    │
│     └─ Remove injections, verify steady state   │
│                                                  │
│  5. Retrospective (same day or next)            │
│     └─ Document findings, create action items   │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Game Day Checklist

| Phase | Item | Status |
|-------|------|--------|
| Planning | Hypothesis documented | ☐ |
| Planning | Blast radius defined | ☐ |
| Planning | Rollback plan ready | ☐ |
| Planning | Stakeholders notified | ☐ |
| Pre-check | Monitoring dashboards open | ☐ |
| Pre-check | On-call engineer available | ☐ |
| Pre-check | Kill switch tested | ☐ |
| Execution | Steady state baseline captured | ☐ |
| Execution | Failures injected | ☐ |
| Execution | Observations recorded | ☐ |
| Recovery | All injections removed | ☐ |
| Recovery | System returned to steady state | ☐ |
| Retro | Findings documented | ☐ |
| Retro | Action items assigned | ☐ |

---

## Blast Radius Control

Blast radius is the scope of impact from a chaos experiment. Controlling it is critical for safety.

```
Blast Radius Levels:
─────────────────────────────────────────────────
Level 1: Single instance/pod
Level 2: Single service (all replicas)
Level 3: Single availability zone
Level 4: Single region
Level 5: Global (multi-region)
─────────────────────────────────────────────────
     Start at Level 1, expand gradually
```

### Techniques for Controlling Blast Radius

| Technique | How It Works |
|-----------|--------------|
| Percentage targeting | Affect only X% of instances |
| Label-based selection | Target specific tagged resources |
| Time-boxing | Auto-stop after N minutes |
| Canary scope | Affect canary deployment only |
| Stop conditions | Auto-halt if metrics breach thresholds |
| Manual kill switch | Operator can abort immediately |

```yaml
# Blast radius configuration example
experiment:
  name: "pod-failure"
  target:
    service: "checkout-service"
    percentage: 25         # Only 25% of pods
    exclude:
      - "checkout-service-primary-0"  # Protect leader
  safety:
    max_duration: "5m"
    stop_condition:
      metric: "error_rate"
      threshold: "5%"
      action: "abort"
    rollback:
      automatic: true
      timeout: "30s"
```

---

## Steady State Metrics

Steady state metrics define the normal operating behavior of your system. They are the foundation of every chaos hypothesis.

### Key Metric Categories

| Category | Metrics | Example Threshold |
|----------|---------|-------------------|
| Availability | Uptime, success rate | > 99.9% |
| Latency | p50, p95, p99 response time | p99 < 500ms |
| Throughput | Requests/sec, transactions/sec | > 1000 rps |
| Error rate | 4xx, 5xx percentage | < 0.1% |
| Saturation | CPU, memory, disk, connections | < 80% |
| Business | Orders/min, signups/hr | Within ±10% of baseline |

```
Steady State Dashboard:
┌────────────────────────────────────────────┐
│  Metric          │ Baseline │ During Chaos │
├──────────────────┼──────────┼──────────────┤
│  Success Rate    │  99.95%  │   99.91%  ✓  │
│  p99 Latency    │  180ms   │   220ms   ✓  │
│  Error Rate      │  0.05%   │   0.09%   ✓  │
│  Throughput      │  1200rps │   1180rps ✓  │
│  CPU Utilization │  45%     │   62%     ✓  │
└──────────────────┴──────────┴──────────────┘
  ✓ = Within acceptable deviation
  ✗ = Threshold breached (abort experiment)
```

---

## Chaos Engineering Maturity Model

Organizations progress through maturity levels as they adopt chaos engineering.

| Level | Name | Characteristics |
|-------|------|-----------------|
| 0 | **Ad-hoc** | No chaos practice, reactive to failures |
| 1 | **Initial** | Manual experiments in staging, limited scope |
| 2 | **Developing** | Regular game days, some production experiments |
| 3 | **Managed** | Automated experiments, CI/CD integration |
| 4 | **Optimizing** | Continuous chaos in production, full coverage |

### Maturity Progression

```
Level 0          Level 1          Level 2          Level 3          Level 4
─────────────────────────────────────────────────────────────────────────────
No practice  →  Manual in    →  Game days    →  Automated    →  Continuous
                staging          in prod         in CI/CD        everywhere

Indicators:
• No tooling     • Basic tools   • Dedicated     • Platform      • Self-service
• No metrics     • Some metrics    team          • Full metrics  • Culture of
• Reactive       • Ad-hoc        • Runbooks      • Auto-abort      resilience
                   schedule      • Dashboards    • Integration
```

---

## Building a Chaos Engineering Program

### Step-by-Step Approach

```
Phase 1: Foundation (Month 1-2)
├── Identify critical services
├── Define steady state metrics
├── Set up observability
└── Get leadership buy-in

Phase 2: First Experiments (Month 3-4)
├── Start in non-production
├── Simple failure injections
├── Document findings
└── Build confidence

Phase 3: Production Chaos (Month 5-6)
├── Small blast radius in production
├── Automated rollback
├── Game days with team
└── Expand scope gradually

Phase 4: Automation (Month 7-12)
├── Integrate into CI/CD
├── Scheduled experiments
├── Self-service platform
└── Continuous validation
```

### Organizational Requirements

| Requirement | Why It Matters |
|-------------|----------------|
| Observability | Cannot measure impact without metrics |
| Incident response | Must be able to respond if experiment escalates |
| Cultural buy-in | Teams must view failures as learning opportunities |
| Automation baseline | Manual processes break under chaos |
| Runbooks | Documented recovery procedures for known failures |

---

## Practical: Designing Chaos Experiments

### Exercise 1: Write a Chaos Experiment

Design an experiment for a microservices e-commerce system:

```
System: E-commerce checkout flow
Services: Cart → Inventory → Payment → Notification

Experiment Template:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: Payment service latency spike

Hypothesis:
  "When payment service latency increases to 5s,
   the checkout service will timeout gracefully,
   show a retry option to users, and the order
   will eventually complete within 30s."

Steady State:
  - Checkout success rate: > 99%
  - p99 latency: < 2s
  - Payment timeout: 3s configured

Method:
  - Inject 5s latency to payment service
  - Duration: 10 minutes
  - Scope: 50% of payment pods

Expected:
  - Circuit breaker opens after 5 failures
  - Fallback: queue payment for async processing
  - User sees "Processing..." instead of error

Abort Conditions:
  - Checkout success rate drops below 90%
  - Any 5xx errors returned to users
  - Payment data loss detected

Rollback:
  - Remove latency injection
  - Verify circuit breaker resets
  - Confirm queued payments process
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Exercise 2: Blast Radius Planning

Given this architecture, plan increasingly aggressive experiments:

```
┌─────────────────────────────────────────────────┐
│          Multi-Region Architecture               │
│                                                  │
│  Region A              Region B                  │
│  ┌──────────┐         ┌──────────┐             │
│  │ Service  │◄───────►│ Service  │             │
│  │ Cluster  │         │ Cluster  │             │
│  ├──────────┤         ├──────────┤             │
│  │ DB Primary│───────►│DB Replica│             │
│  └──────────┘         └──────────┘             │
│                                                  │
└─────────────────────────────────────────────────┘

Plan your experiments:
━━━━━━━━━━━━━━━━━━━━━━━
Level 1: Kill single pod in Region A
Level 2: Kill all pods of one service in Region A
Level 3: Network partition between services in Region A
Level 4: Simulate Region A database failure
Level 5: Simulate complete Region A outage

For each level, define:
  - Hypothesis
  - Expected failover behavior
  - Acceptable degradation
  - Abort criteria
```

### Exercise 3: Game Day Planning

Create a game day plan for your team:

```
Game Day: "Operation Dark Thursday"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: [Next Thursday, business hours]
Duration: 3 hours
Participants: Engineering team + SRE + Product

Scenario Sequence:
  1. (0:00) Single cache node failure
  2. (0:30) Database replica lag (5 min delay)
  3. (1:00) Third-party payment API timeout
  4. (1:30) 50% pod termination in checkout service
  5. (2:00) Network partition between services

Success Criteria:
  □ All incidents detected within 5 minutes
  □ Automated recovery kicks in for scenarios 1-2
  □ Manual response within 15 min for scenarios 3-5
  □ No customer-facing errors lasting > 2 minutes
  □ All systems recovered within 30 min of injection end

Required Preparation:
  □ Verify monitoring alerts are active
  □ Test kill switches for each injection
  □ Brief all participants on abort procedures
  □ Notify customer support team
  □ Prepare incident communication templates
```

---

## Summary

| Concept | Key Takeaway |
|---------|--------------|
| Chaos Engineering | Proactive failure testing to build confidence |
| Principles | Hypothesis → Real events → Production → Automate |
| Blast radius | Start small, expand gradually with safety controls |
| Steady state | Define "normal" before injecting chaos |
| Game days | Planned team exercises for coordinated chaos |
| Maturity | Progress from ad-hoc to continuous automation |
| Tools | Choose based on platform and organizational needs |

**Remember**: Chaos engineering is not about breaking things — it is about learning how your system behaves when things inevitably break. Start small, measure everything, and build confidence one experiment at a time.

---
