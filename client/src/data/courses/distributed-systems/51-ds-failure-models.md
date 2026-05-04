---
title: "Failure Models"
---

# Failure Models in Distributed Systems

In distributed systems, **failures are not exceptions — they are the norm**. Understanding and classifying failures is essential to building systems that remain correct and available despite partial outages.

A **failure model** defines the ways in which a component can deviate from its correct behavior. Different models assume different capabilities of faulty components, which directly impacts the protocols and algorithms you choose.

---

## Why Failure Models Matter

| Concern | Impact |
|---|---|
| **Algorithm design** | Stronger failure assumptions require more complex protocols |
| **Redundancy planning** | The failure type determines how many replicas you need |
| **Testing strategy** | You must inject the right kinds of faults |
| **SLA guarantees** | The model bounds what you can promise |
| **Cost** | Tolerating stronger failures costs more resources |

> **Key Insight:** Every distributed protocol is designed against a specific failure model. Using a protocol outside its assumed model voids all guarantees.

---

## Crash Failures

A **crash failure** occurs when a process stops executing and never recovers (or recovers later). This is the simplest and most common failure model.

### Fail-Stop

In the **fail-stop** model, a process halts and **other processes can reliably detect** that it has stopped.

```
Process A: running → running → running → CRASH → (detectable)
                                            ↑
                                    Other nodes are notified
```

**Properties of fail-stop:**

- The process stops permanently
- The failure is **detectable** by other processes
- The process does not produce incorrect output before crashing
- Stable storage survives the crash

```python
# Simulating a fail-stop process
class FailStopProcess:
    def __init__(self, process_id):
        self.process_id = process_id
        self.alive = True
        self.stable_storage = {}  # Survives crash

    def execute(self, operation):
        if not self.alive:
            raise ProcessCrashedError(f"Process {self.process_id} has crashed")
        return operation()

    def crash(self):
        """Process halts permanently — detectable by others."""
        self.alive = False
        # stable_storage remains accessible for recovery

    def is_detectable(self):
        """Other processes can query this."""
        return not self.alive
```

### Fail-Recover (Crash-Recovery)

In the **fail-recover** model, a process may crash and later **restart**, potentially with partial state from stable storage.

```
Process A: running → CRASH → ... → RECOVER → running
                                       ↑
                              Reads from stable storage
```

**Properties of fail-recover:**

- The process may restart after crashing
- Volatile state (memory) is lost; stable storage persists
- The process may crash and recover **multiple times**
- Other processes cannot always distinguish a slow process from a crashed one

```python
class FailRecoverProcess:
    def __init__(self, process_id):
        self.process_id = process_id
        self.alive = True
        self.volatile_state = {}       # Lost on crash
        self.stable_storage = {}       # Persists across crashes
        self.crash_count = 0

    def checkpoint(self):
        """Save critical state to stable storage."""
        self.stable_storage["checkpoint"] = self.volatile_state.copy()

    def crash(self):
        self.alive = False
        self.volatile_state = {}  # Volatile state is lost
        self.crash_count += 1

    def recover(self):
        """Restart from last checkpoint."""
        self.alive = True
        if "checkpoint" in self.stable_storage:
            self.volatile_state = self.stable_storage["checkpoint"].copy()
        # Resume protocol participation
```

### Fail-Stop vs Fail-Recover Comparison

| Property | Fail-Stop | Fail-Recover |
|---|---|---|
| Detection | Reliable | Unreliable (may be slow, not crashed) |
| Recovery | Never | May restart with stable state |
| Protocol complexity | Lower | Higher |
| Replicas needed (for f faults) | f + 1 | 2f + 1 (in many protocols) |
| Real-world example | Hardware decommissioned | Server reboot after kernel panic |

---

## Omission Failures

An **omission failure** occurs when a process fails to send or receive a message that it should have. The process itself continues running — it simply "omits" communication steps.

### Send Omission

The process completes its computation but **fails to send** the outgoing message.

```
Process A:  compute → [send to B] → ✗ message lost
Process B:  waiting...  (never receives)
```

**Causes:**

- Output buffer overflow
- Network interface card (NIC) failure
- Operating system dropping the packet

### Receive Omission

The process **fails to receive** an incoming message, even though the message was correctly delivered to its network layer.

```
Process A:  sends message → network delivers to B
Process B:  [receive buffer] → ✗ message dropped before processing
```

**Causes:**

- Input buffer overflow
- Process too slow to dequeue messages
- Faulty network driver

### Omission Failure Example

```python
import random

class OmissionFailureChannel:
    """A channel that may omit messages."""

    def __init__(self, send_omission_rate=0.0, receive_omission_rate=0.0):
        self.send_omission_rate = send_omission_rate
        self.receive_omission_rate = receive_omission_rate
        self.buffer = []

    def send(self, message):
        # Send omission: message never enters the channel
        if random.random() < self.send_omission_rate:
            return  # Message silently dropped
        self.buffer.append(message)

    def receive(self):
        if not self.buffer:
            return None
        message = self.buffer.pop(0)
        # Receive omission: message lost at receiver side
        if random.random() < self.receive_omission_rate:
            return None  # Message silently dropped
        return message
```

> **Note:** Omission failures are **strictly stronger** than crash failures. A process that crashes can be viewed as one that omits all subsequent messages.

---

## Timing Failures

**Timing failures** occur in **synchronous** systems where processes have known time bounds. A timing failure happens when a process or channel violates its timing guarantee.

### Types of Timing Failures

| Type | Description | Example |
|---|---|---|
| **Too early** | Response arrives before expected window | Clock running fast |
| **Too late** | Response exceeds the deadline | GC pause causing timeout |
| **Clock drift** | Local clock deviates from real time | Quartz oscillator aging |

### Too-Early Failures

```
Expected window:  [100ms ──────── 500ms]
Actual response:  [50ms]  ← Too early
```

Too-early responses can violate **ordering assumptions** in time-based protocols.

### Too-Late Failures

```
Expected window:  [100ms ──────── 500ms]
Actual response:                         [750ms]  ← Too late
```

This is the most common timing failure. Causes include:

- **Garbage collection pauses** (stop-the-world GC)
- **CPU scheduling delays**
- **Network congestion**
- **Disk I/O stalls**

```python
import time

class TimingFailureDetector:
    """Detects timing failures based on expected bounds."""

    def __init__(self, min_delay_ms, max_delay_ms):
        self.min_delay = min_delay_ms / 1000.0
        self.max_delay = max_delay_ms / 1000.0

    def check_response(self, send_time, receive_time):
        elapsed = receive_time - send_time

        if elapsed < self.min_delay:
            return "TOO_EARLY"
        elif elapsed > self.max_delay:
            return "TOO_LATE"
        else:
            return "ON_TIME"

# Usage
detector = TimingFailureDetector(min_delay_ms=100, max_delay_ms=500)
result = detector.check_response(
    send_time=time.time(),
    receive_time=time.time() + 0.25  # 250ms later
)
print(result)  # "ON_TIME"
```

> **Important:** Most real distributed systems are **asynchronous** — they make no timing guarantees. Timing failures only exist in synchronous models.

---

## Byzantine (Arbitrary) Failures

A **Byzantine failure** is the most general failure type. A faulty process can behave **arbitrarily**: it may send wrong values, send conflicting messages to different peers, or act maliciously.

```
Correct process:   input → [correct computation] → correct output
Byzantine process: input → [anything]             → any output (or none)
```

### Examples of Byzantine Behavior

| Behavior | Description |
|---|---|
| **Sending wrong values** | A replica reports a corrupted result |
| **Equivocation** | Sending different values to different peers |
| **Selective silence** | Responding to some processes but not others |
| **Replay attacks** | Re-sending old messages as if they are new |
| **Impersonation** | Claiming to be a different process |

### Byzantine Generals Problem

The classic illustration: generals must agree on a plan (attack or retreat), but some generals are **traitors** who may send conflicting orders.

```
General 1 (loyal):    "Attack" → General 2
                      "Attack" → General 3

General 2 (traitor):  "Attack" → General 1
                      "Retreat" → General 3   ← Equivocation!

General 3 (loyal):    Received "Attack" from G1, "Retreat" from G2
                      What should G3 decide?
```

**Theorem:** To tolerate **f** Byzantine faults, you need at least **3f + 1** processes.

```python
class ByzantineProcess:
    """Simulates a process that may exhibit Byzantine behavior."""

    def __init__(self, process_id, is_byzantine=False):
        self.process_id = process_id
        self.is_byzantine = is_byzantine

    def send_value(self, true_value, recipients):
        """Byzantine process may send different values to each recipient."""
        messages = {}
        for r in recipients:
            if self.is_byzantine:
                # Equivocation: send conflicting values
                import random
                messages[r] = random.choice(["attack", "retreat"])
            else:
                messages[r] = true_value
        return messages

# Example: 4 processes, 1 Byzantine (tolerates f=1)
processes = [
    ByzantineProcess(0),
    ByzantineProcess(1, is_byzantine=True),
    ByzantineProcess(2),
    ByzantineProcess(3),
]
```

---

## The Failure Hierarchy

Failure models form a **strict hierarchy** — each level includes all the behaviors of the levels below it.

```
  Byzantine (arbitrary)
      ⊃
  Timing failures
      ⊃
  Omission failures
      ⊃
  Crash failures
```

| Model | Can produce wrong output? | Can omit messages? | Can violate timing? | Can act arbitrarily? |
|---|---|---|---|---|
| **Crash** | No | Only after crash | No | No |
| **Omission** | No | Yes | No | No |
| **Timing** | No | Yes | Yes | No |
| **Byzantine** | Yes | Yes | Yes | Yes |

### Practical Implications

```
Crash:     Need f + 1 replicas      (e.g., Raft, ZooKeeper)
Omission:  Need f + 1 replicas      (with retransmission)
Timing:    Need f + 1 replicas      (synchronous model only)
Byzantine: Need 3f + 1 replicas     (e.g., PBFT, blockchain)
```

> **Design Principle:** Always choose the **weakest failure model** that matches your actual environment. Designing for Byzantine failures when you only face crash failures wastes resources.

---

## Failure Rates: MTBF and MTTR

Two critical metrics quantify component reliability:

| Metric | Full Name | Definition |
|---|---|---|
| **MTBF** | Mean Time Between Failures | Average time a component runs before failing |
| **MTTR** | Mean Time To Repair | Average time to restore a failed component |

### Availability Calculation

$$\text{Availability} = \frac{\text{MTBF}}{\text{MTBF} + \text{MTTR}}$$

```python
def calculate_availability(mtbf_hours, mttr_hours):
    """Calculate availability from MTBF and MTTR."""
    availability = mtbf_hours / (mtbf_hours + mttr_hours)
    nines = -1 * __import__("math").log10(1 - availability)
    return {
        "availability": availability,
        "percentage": f"{availability * 100:.4f}%",
        "nines": f"{nines:.2f} nines",
        "downtime_per_year": f"{(1 - availability) * 365.25 * 24:.2f} hours",
    }

# Hard drive: MTBF ~1M hours, MTTR ~1 hour
print(calculate_availability(1_000_000, 1))
# {'availability': 0.999999, 'percentage': '99.9999%', 'nines': '6.00 nines', ...}

# Server: MTBF ~8760 hours (1 year), MTTR ~4 hours
print(calculate_availability(8760, 4))
# {'availability': 0.99954, 'percentage': '99.9543%', 'nines': '3.34 nines', ...}
```

### Typical MTBF Values

| Component | Typical MTBF |
|---|---|
| Hard drive (HDD) | 300,000 – 1,200,000 hours |
| SSD | 1,000,000 – 2,000,000 hours |
| Server | 50,000 – 100,000 hours |
| Network switch | 200,000 – 500,000 hours |
| Power supply | 100,000 – 300,000 hours |

---

## Failure Domains

A **failure domain** (or fault domain) is a set of components that can fail together due to a shared dependency. Failures are **correlated** within a domain.

### Failure Domain Hierarchy

```
Region (us-east)
├── Datacenter (us-east-1a)
│   ├── Rack 1
│   │   ├── Node A (power, network, cooling shared)
│   │   │   ├── Process 1
│   │   │   └── Process 2
│   │   └── Node B
│   │       ├── Process 3
│   │       └── Process 4
│   └── Rack 2
│       └── ...
├── Datacenter (us-east-1b)
│   └── ...
└── Datacenter (us-east-1c)
    └── ...
```

| Domain | Shared Dependency | Example Failure |
|---|---|---|
| **Process** | Memory, CPU time | OOM kill, segfault |
| **Node** | OS, hardware | Kernel panic, disk failure |
| **Rack** | Top-of-rack switch, PDU | Switch failure, power strip trip |
| **Datacenter** | Power feed, cooling, network uplink | Power outage, cooling failure |
| **Region** | Geographic area | Natural disaster, regional ISP outage |

### Spreading Replicas Across Domains

```python
def assign_replicas(replicas, failure_domains):
    """
    Distribute replicas across failure domains
    to maximize fault tolerance.
    """
    assignments = {}
    domains = list(failure_domains)
    for i, replica in enumerate(replicas):
        domain = domains[i % len(domains)]
        assignments[replica] = domain
    return assignments

# Spread 5 replicas across 3 availability zones
replicas = ["replica-1", "replica-2", "replica-3", "replica-4", "replica-5"]
zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

print(assign_replicas(replicas, zones))
# {'replica-1': 'us-east-1a', 'replica-2': 'us-east-1b',
#  'replica-3': 'us-east-1c', 'replica-4': 'us-east-1a',
#  'replica-5': 'us-east-1b'}
```

---

## Correlated Failures

**Correlated failures** occur when multiple components fail simultaneously or in rapid succession due to a shared root cause.

### Common Causes

| Cause | Example |
|---|---|
| **Shared infrastructure** | Power outage takes down entire rack |
| **Software bugs** | Same bug triggers on all replicas running identical code |
| **Configuration errors** | Bad config pushed to all instances at once |
| **Overload cascade** | One failure shifts load, causing neighbors to fail |
| **Environmental** | Fire, flood, earthquake affecting a datacenter |

### The Thundering Herd

When many clients detect a failure and simultaneously retry, they can overload the recovering system:

```
Server fails → 10,000 clients detect failure
            → 10,000 clients retry simultaneously
            → Server overwhelmed on recovery
            → Server fails again (cascading failure)
```

**Mitigation: Exponential backoff with jitter**

```python
import random

def retry_with_jitter(base_delay_ms=100, max_delay_ms=30000, attempt=0):
    """Calculate retry delay with exponential backoff and full jitter."""
    exponential = min(base_delay_ms * (2 ** attempt), max_delay_ms)
    delay = random.uniform(0, exponential)  # Full jitter
    return delay

# Each client gets a different delay, spreading the load
for attempt in range(5):
    delay = retry_with_jitter(attempt=attempt)
    print(f"Attempt {attempt}: retry after {delay:.0f}ms")
# Attempt 0: retry after 73ms
# Attempt 1: retry after 142ms
# Attempt 2: retry after 289ms
# Attempt 3: retry after 510ms
# Attempt 4: retry after 1203ms
```

---

## Failure Models in Practice

Real systems rarely face pure theoretical failure models. Here is how major systems classify their assumptions:

| System | Assumed Model | Why |
|---|---|---|
| **Raft / Paxos** | Crash (fail-recover) | Designed for trusted datacenter environments |
| **PBFT** | Byzantine | Designed for untrusted participants |
| **Bitcoin** | Byzantine | Open network, anonymous participants |
| **Cassandra** | Crash (fail-recover) | Datacenter deployment, tunable consistency |
| **Spanner** | Crash + timing (TrueTime) | Uses synchronized clocks with bounded error |
| **ZooKeeper** | Crash (fail-stop) | Coordination service, trusted internal network |

---

## Design for Failure

Building resilient systems requires three core strategies: **redundancy**, **diversity**, and **isolation**.

### Redundancy

Maintain multiple copies so that the loss of one does not affect the whole.

```
Active-Active:    Client → [Load Balancer] → Server A (active)
                                           → Server B (active)

Active-Passive:   Client → Server A (active)
                           Server B (standby, takes over on failure)
```

**Redundancy requirements by failure model:**

| Model | Minimum Replicas for f Faults |
|---|---|
| Crash (fail-stop) | f + 1 |
| Crash (fail-recover) | 2f + 1 (for consensus) |
| Byzantine | 3f + 1 |

### Diversity

Use **different implementations** to avoid correlated software failures.

```
# Avoid: all replicas run the same binary
Replica 1: nginx v1.25   ← Same bug affects all
Replica 2: nginx v1.25
Replica 3: nginx v1.25

# Better: mix implementations
Replica 1: nginx v1.25
Replica 2: HAProxy v2.8   ← Different failure modes
Replica 3: Envoy v1.28
```

### Isolation

Contain failures within a **blast radius** so they cannot propagate.

```python
class BulkheadPattern:
    """
    Isolate resources into separate pools.
    Failure in one pool does not affect others.
    """

    def __init__(self):
        self.pools = {}

    def create_pool(self, name, max_concurrent):
        self.pools[name] = {
            "max": max_concurrent,
            "active": 0,
        }

    def acquire(self, pool_name):
        pool = self.pools[pool_name]
        if pool["active"] >= pool["max"]:
            raise Exception(f"Pool '{pool_name}' exhausted")
        pool["active"] += 1

    def release(self, pool_name):
        self.pools[pool_name]["active"] -= 1

# Separate pools for critical vs non-critical traffic
bulkhead = BulkheadPattern()
bulkhead.create_pool("payments", max_concurrent=50)
bulkhead.create_pool("recommendations", max_concurrent=20)

# If recommendations pool is exhausted, payments are unaffected
```

---

## Gray Failures

A **gray failure** is a subtle, partial failure where a component is **neither fully healthy nor fully failed**. These are the hardest failures to detect and handle.

### Characteristics of Gray Failures

| Property | Description |
|---|---|
| **Differential observability** | Different observers see different health states |
| **Partial degradation** | Component works for some requests but not others |
| **Intermittent** | Failure comes and goes unpredictably |
| **Hard to detect** | Standard health checks may pass |

### Examples

```
Example 1: Network gray failure
  Server A → Server B:  ✓ (works)
  Server A → Server C:  ✗ (fails)
  Server B → Server C:  ✓ (works)
  → Asymmetric partition: only A's view of C is broken

Example 2: Disk gray failure
  Reads from sectors 0–1000:      ✓ fast (< 1ms)
  Reads from sectors 1001–2000:   ✗ slow (> 5000ms)
  → Health check reads sector 0:  "Disk is healthy!"

Example 3: CPU gray failure
  Core 0–3:   ✓ correct computation
  Core 4:     ✗ occasional bit flips
  → Most requests succeed, rare silent data corruption
```

### Detecting Gray Failures

```python
class GrayFailureDetector:
    """
    Detect gray failures by comparing observations
    from multiple vantage points.
    """

    def __init__(self, threshold=0.5):
        self.observations = {}  # target → {observer → status}
        self.threshold = threshold

    def report(self, observer, target, is_healthy):
        if target not in self.observations:
            self.observations[target] = {}
        self.observations[target][observer] = is_healthy

    def diagnose(self, target):
        if target not in self.observations:
            return "UNKNOWN"

        reports = self.observations[target]
        healthy_count = sum(1 for v in reports.values() if v)
        total = len(reports)

        if healthy_count == total:
            return "HEALTHY"
        elif healthy_count == 0:
            return "FAILED"
        else:
            ratio = healthy_count / total
            return f"GRAY_FAILURE (healthy ratio: {ratio:.0%})"

# Multiple observers report on the same target
detector = GrayFailureDetector()
detector.report("monitor-A", "server-X", is_healthy=True)
detector.report("monitor-B", "server-X", is_healthy=False)
detector.report("monitor-C", "server-X", is_healthy=True)

print(detector.diagnose("server-X"))
# "GRAY_FAILURE (healthy ratio: 67%)"
```

---

## Summary

| Failure Model | Behavior | Detection | Replicas for f Faults |
|---|---|---|---|
| **Crash (fail-stop)** | Halts, detectable | Easy | f + 1 |
| **Crash (fail-recover)** | Halts, may restart | Hard | 2f + 1 |
| **Omission** | Drops messages | Moderate | f + 1 (with retries) |
| **Timing** | Violates time bounds | Requires synchronized clocks | f + 1 |
| **Byzantine** | Arbitrary behavior | Very hard | 3f + 1 |
| **Gray** | Partial degradation | Hardest | Multi-observer monitoring |

**Key takeaways:**

- Failure models form a hierarchy: Byzantine ⊃ Timing ⊃ Omission ⊃ Crash
- Choose the **weakest model** that matches your real environment
- Use **MTBF** and **MTTR** to quantify reliability and plan redundancy
- Spread replicas across **failure domains** to survive correlated failures
- Design with **redundancy**, **diversity**, and **isolation**
- Gray failures require **multi-observer** detection — no single health check is enough

---

## Exercises

1. A datacenter has servers with MTBF = 50,000 hours and MTTR = 2 hours. Calculate the per-server availability and the probability that at least one server in a 1,000-server cluster fails on any given day.

2. You are building a replicated key-value store for an internal corporate network. Which failure model should you assume — crash, omission, or Byzantine? Justify your choice and state how many replicas you need to tolerate 2 simultaneous failures.

3. Design a gray failure detector for a database cluster. The detector receives periodic health reports from 5 monitoring agents. Write pseudocode that classifies a node as `HEALTHY`, `GRAY`, or `FAILED` based on the fraction of agents reporting it as healthy.

4. A system has three failure domains (racks A, B, C) and needs to place 7 replicas to survive the loss of any single rack. How would you distribute the replicas? What is the maximum number of replicas lost if rack B fails?

5. Explain why tolerating Byzantine faults requires 3f + 1 nodes while crash faults only require 2f + 1 for consensus. What property of Byzantine processes makes the extra nodes necessary?
