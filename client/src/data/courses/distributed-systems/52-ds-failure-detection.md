---
title: "Failure Detection"
---

# Failure Detection in Distributed Systems

In a distributed system, **failure detection** answers one seemingly simple question: _is that remote process still alive?_ In practice, this question is impossibly hard to answer with certainty — and getting it wrong has serious consequences.

---

## Why Failure Detection Is Hard

In a local system you can check if a process is alive by inspecting its PID. In a distributed system, the only way to know if a remote node is alive is to **communicate** with it — and communication itself can fail.

| Local System | Distributed System |
|---|---|
| Shared memory, OS signals | Messages over unreliable network |
| Crash is immediately observable | Crash is **indistinguishable** from slow response |
| Deterministic detection | Probabilistic detection |

The fundamental difficulty boils down to:

- **You cannot distinguish a crashed node from a slow node.**
- **You cannot distinguish a network partition from a node failure.**

---

## The FLP Impossibility Result

In 1985, Fischer, Lynch, and Paterson proved a landmark result known as the **FLP impossibility theorem**:

> In an asynchronous distributed system where even **one** process can crash, there is **no deterministic algorithm** that solves consensus.

### What This Means for Failure Detection

- In a purely **asynchronous** model (no timing assumptions), you **cannot build a perfect failure detector**.
- Any message could take arbitrarily long to arrive — you can never be sure a node has crashed.
- This is why every practical failure detector makes **timing assumptions** or accepts **mistakes**.

```
Asynchronous Model:
  - No upper bound on message delay
  - No upper bound on processing time
  - No global clock

  => Perfect failure detection is IMPOSSIBLE
```

### Circumventing FLP

Practical systems get around FLP by:

1. **Partial synchrony** — assuming the system is eventually synchronous (messages arrive within some bound _eventually_).
2. **Randomization** — probabilistic algorithms that terminate with high probability.
3. **Unreliable failure detectors** — detectors that can make mistakes but still enable consensus.

---

## Heartbeat-Based Detection

The most common approach to failure detection is **heartbeating**: nodes periodically send "I'm alive" messages.

### How It Works

```
Node A                          Node B
  |                                |
  |--- heartbeat (seq=1) -------->|
  |                                |  (timer starts)
  |--- heartbeat (seq=2) -------->|
  |                                |  (timer resets)
  |                                |
  |        (Node A crashes)        |
  |                                |  (timer expires)
  |                                |  => SUSPECT A
```

### Fixed Timeout

The simplest variant uses a **constant timeout** value:

```python
class FixedTimeoutDetector:
    def __init__(self, timeout_ms=5000):
        self.timeout_ms = timeout_ms
        self.last_heartbeat = {}

    def on_heartbeat(self, node_id):
        """Record when we last heard from a node."""
        self.last_heartbeat[node_id] = current_time_ms()

    def is_alive(self, node_id):
        """Check if a node is considered alive."""
        if node_id not in self.last_heartbeat:
            return False
        elapsed = current_time_ms() - self.last_heartbeat[node_id]
        return elapsed < self.timeout_ms
```

**Pros and cons of fixed timeout:**

| Aspect | Detail |
|---|---|
| Simplicity | Very easy to implement |
| Short timeout | Fast detection, but **more false positives** |
| Long timeout | Fewer false positives, but **slow detection** |
| Network jitter | Cannot adapt to changing conditions |

### Adaptive Timeout

An **adaptive timeout** adjusts based on observed network behavior — similar to how TCP computes retransmission timeouts.

```python
class AdaptiveTimeoutDetector:
    def __init__(self, alpha=0.125, beta=0.25, safety_margin=4):
        self.alpha = alpha          # smoothing factor for mean
        self.beta = beta            # smoothing factor for deviation
        self.estimated_rtt = 1000   # initial estimate (ms)
        self.deviation = 500        # initial deviation
        self.safety_margin = safety_margin

    def on_heartbeat(self, measured_rtt):
        """Update estimates using exponential moving average."""
        error = measured_rtt - self.estimated_rtt
        self.estimated_rtt += self.alpha * error
        self.deviation += self.beta * (abs(error) - self.deviation)

    @property
    def timeout(self):
        """Compute adaptive timeout."""
        return self.estimated_rtt + self.safety_margin * self.deviation
```

**The formula mirrors TCP's Jacobson/Karels algorithm:**

$$T_{timeout} = \overline{RTT} + k \cdot \sigma_{RTT}$$

Where $\overline{RTT}$ is the smoothed round-trip time, $\sigma_{RTT}$ is the RTT deviation, and $k$ is a safety multiplier (typically 4).

---

## Phi Accrual Failure Detector

The **Phi (φ) Accrual Failure Detector** was introduced by Hayashibara et al. (2004) and is used in **Apache Cassandra** and **Akka**.

### Key Idea

Instead of outputting a binary **alive/dead** decision, the phi accrual detector outputs a **suspicion level** — a continuous value that represents how likely a node has failed.

```
Traditional detector:   alive | dead      (binary)
Phi accrual detector:   φ = 0.5 | 1.2 | 3.8 | 12.1   (continuous)
```

### How It Works

1. **Collect** inter-arrival times of heartbeats into a sliding window.
2. **Model** the arrival distribution (typically as a normal distribution).
3. **Compute φ** based on how long it has been since the last heartbeat.

```python
import math

class PhiAccrualDetector:
    def __init__(self, window_size=100, threshold=8.0):
        self.arrival_intervals = []  # sliding window
        self.window_size = window_size
        self.threshold = threshold   # φ above this => suspect
        self.last_arrival = None

    def on_heartbeat(self):
        now = current_time_ms()
        if self.last_arrival is not None:
            interval = now - self.last_arrival
            self.arrival_intervals.append(interval)
            if len(self.arrival_intervals) > self.window_size:
                self.arrival_intervals.pop(0)
        self.last_arrival = now

    def phi(self):
        """Compute the suspicion level φ."""
        if not self.arrival_intervals or self.last_arrival is None:
            return 0.0

        elapsed = current_time_ms() - self.last_arrival
        mean = sum(self.arrival_intervals) / len(self.arrival_intervals)
        variance = sum((x - mean) ** 2 for x in self.arrival_intervals)
        variance /= len(self.arrival_intervals)
        std_dev = max(math.sqrt(variance), 1e-6)

        # P(next heartbeat has not arrived yet)
        # Using normal distribution CDF
        y = (elapsed - mean) / std_dev
        prob_late = 1.0 - 0.5 * (1 + math.erf(y / math.sqrt(2)))

        if prob_late < 1e-12:
            return float("inf")
        return -math.log10(prob_late)

    def is_suspect(self):
        return self.phi() >= self.threshold
```

### Interpreting φ Values

| φ Value | Meaning | Probability of Mistake |
|---|---|---|
| 1 | Low suspicion | 10% chance of false positive |
| 2 | Moderate suspicion | 1% chance |
| 4 | High suspicion | 0.01% chance |
| 8 | Very high suspicion | 0.000001% chance |
| 12+ | Almost certain failure | Negligible |

**Cassandra default threshold:** φ = 8

The beauty of this approach is that the **application chooses the threshold** based on its tolerance for false positives.

---

## SWIM Protocol

**SWIM** (Scalable Weakly-consistent Infection-style process group Membership) is a failure detection and membership protocol designed for **large clusters**.

### Three Mechanisms

#### 1. Direct Ping

```
Node A ----ping----> Node B
Node A <---ack------ Node B
```

If B responds within a timeout, it is alive.

#### 2. Indirect Ping (ping-req)

If B does **not** respond to A's direct ping, A does not immediately suspect B. Instead:

```
Node A ----ping----> Node B   (no response)

Node A --ping-req--> Node C
Node A --ping-req--> Node D
                     Node C ----ping----> Node B
                     Node D ----ping----> Node B
                     Node C <---ack------ Node B
Node A <---ack------ Node C

=> B is reachable through C, so A does NOT suspect B
```

This avoids false positives caused by **asymmetric network issues** between A and B.

#### 3. Suspicion Mechanism

Instead of immediately marking a node as failed, SWIM uses a **suspicion sub-protocol**:

```
States:  ALIVE  →  SUSPECT  →  CONFIRMED (failed)
                      ↓
                    ALIVE    (if refuted)
```

```python
class SWIMDetector:
    ALIVE = "alive"
    SUSPECT = "suspect"
    CONFIRMED = "confirmed"

    def __init__(self, nodes, k_indirect=3, suspect_timeout=10000):
        self.members = {n: self.ALIVE for n in nodes}
        self.k_indirect = k_indirect          # number of indirect probes
        self.suspect_timeout = suspect_timeout
        self.suspect_timers = {}

    def on_ping_timeout(self, target):
        """Direct ping to target timed out."""
        # Try indirect ping through k random members
        helpers = random.sample(
            [n for n in self.members if n != target],
            min(self.k_indirect, len(self.members) - 1),
        )
        for helper in helpers:
            send_ping_req(helper, target)

    def on_indirect_timeout(self, target):
        """No indirect ack received either — suspect the node."""
        if self.members.get(target) == self.ALIVE:
            self.members[target] = self.SUSPECT
            self.suspect_timers[target] = current_time_ms()
            gossip_suspicion(target)

    def on_suspect_timeout(self, target):
        """Suspicion period expired without refutation."""
        if self.members.get(target) == self.SUSPECT:
            self.members[target] = self.CONFIRMED
            gossip_failure(target)

    def on_alive_message(self, target, incarnation):
        """Target refutes suspicion with a higher incarnation number."""
        if self.members.get(target) == self.SUSPECT:
            self.members[target] = self.ALIVE
            del self.suspect_timers[target]
```

### SWIM Properties

| Property | Detail |
|---|---|
| Detection time | O(log n) protocol periods |
| Message load per node | O(1) per period — constant! |
| False positive rate | Low, thanks to indirect probing + suspicion |
| Scalability | Designed for thousands of nodes |

---

## Gossip-Based Failure Detection

In **gossip-based** (or epidemic-style) failure detection, nodes periodically share their **heartbeat counters** with random peers.

### How It Works

```
Every T seconds, each node:
  1. Increments its own heartbeat counter
  2. Picks a random peer
  3. Sends its full heartbeat table to that peer
  4. Merges the received table (keep max counters)
```

```python
class GossipFailureDetector:
    def __init__(self, my_id, all_nodes, gossip_interval=1000,
                 failure_timeout=10000):
        self.my_id = my_id
        self.heartbeats = {n: 0 for n in all_nodes}
        self.last_updated = {n: current_time_ms() for n in all_nodes}
        self.gossip_interval = gossip_interval
        self.failure_timeout = failure_timeout

    def gossip_round(self):
        """Execute one gossip round."""
        # Increment own heartbeat
        self.heartbeats[self.my_id] += 1
        self.last_updated[self.my_id] = current_time_ms()

        # Pick a random peer and exchange tables
        peer = random.choice(
            [n for n in self.heartbeats if n != self.my_id]
        )
        send_heartbeat_table(peer, self.heartbeats)

    def on_receive_table(self, remote_table):
        """Merge a received heartbeat table."""
        now = current_time_ms()
        for node, count in remote_table.items():
            if count > self.heartbeats.get(node, 0):
                self.heartbeats[node] = count
                self.last_updated[node] = now

    def get_failed_nodes(self):
        """Return nodes whose heartbeats have not been updated recently."""
        now = current_time_ms()
        return [
            n for n in self.heartbeats
            if n != self.my_id
            and (now - self.last_updated[n]) > self.failure_timeout
        ]
```

### Gossip vs Direct Heartbeating

| Aspect | Direct Heartbeat | Gossip |
|---|---|---|
| Message pattern | Point-to-point | Random peer exchange |
| Load on any single node | O(n) for a central monitor | O(1) per node |
| Consistency | Immediate (within timeout) | **Eventually** consistent |
| Scalability | Limited | Excellent |
| Detection speed | Fast | Slower (logarithmic dissemination) |

---

## Failure Detector Properties

Chandra and Toueg (1996) formalized failure detector properties along two axes: **completeness** and **accuracy**.

### Completeness

Completeness ensures that **failed nodes are eventually detected**.

| Type | Definition |
|---|---|
| **Strong completeness** | Every crashed process is **eventually** suspected by **every** correct process |
| **Weak completeness** | Every crashed process is **eventually** suspected by **some** correct process |

> Weak completeness can be upgraded to strong completeness by having processes **gossip** their suspicions.

### Accuracy

Accuracy constrains **false positives** — suspecting correct (alive) processes.

| Type | Definition |
|---|---|
| **Strong accuracy** | No correct process is **ever** suspected |
| **Weak accuracy** | **Some** correct process is **never** suspected |
| **Eventual strong accuracy** | After some time, no correct process is suspected |
| **Eventual weak accuracy** | After some time, some correct process is never suspected |

### Failure Detector Classes

| Class | Completeness | Accuracy |
|---|---|---|
| **Perfect (P)** | Strong | Strong |
| **Strong (S)** | Strong | Weak |
| **Eventually Perfect (◇P)** | Strong | Eventual strong |
| **Eventually Strong (◇S)** | Strong | Eventual weak |

---

## Perfect Failure Detector

A **perfect failure detector** (class P) satisfies:

- **Strong completeness:** every crash is detected by everyone.
- **Strong accuracy:** no alive node is ever falsely suspected.

### When Is It Possible?

**Only in synchronous systems** where:

- There is a known **upper bound** on message delay ($\Delta$).
- There is a known **upper bound** on processing time ($\Phi$).
- A timeout of $\Delta + \Phi$ guarantees: no response = crashed.

```
Synchronous system guarantees:
  - Message delivered within Δ time units
  - Process step completes within Φ time units

  Timeout = Δ + Φ  =>  PERFECT failure detection
```

**In practice**, real networks are **not** synchronous — so perfect failure detectors do not exist in production systems.

---

## Eventually Perfect Failure Detector (◇P)

The **eventually perfect** failure detector is the weakest detector that can still solve consensus:

- **Strong completeness:** every crash is eventually detected.
- **Eventual strong accuracy:** there exists a time after which **no correct process is suspected**.

### Why This Is Practical

- It **may** make mistakes (false positives) for a while.
- Eventually, it **stops** making mistakes.
- This maps naturally to **adaptive timeout** detectors in partially synchronous networks.

```
Timeline:
  t=0       t=50       t=100      t=150  ...
  |----------|----------|----------|----->
  [  may make mistakes  ][ accurate from here on ]
              ^
     Network stabilizes (partial synchrony kicks in)
```

---

## False Positives vs False Negatives

Every practical failure detector must navigate a fundamental trade-off:

| Error Type | Meaning | Consequence |
|---|---|---|
| **False positive** | Suspect an **alive** node | Unnecessary failover, load spikes, split-brain |
| **False negative** | Miss a **crashed** node | Requests sent to dead node, timeouts for clients |

### The Timeout Dilemma

```
         Short timeout                   Long timeout
         ─────────────                   ─────────────
    ✓ Fast detection                ✓ Fewer false positives
    ✗ Many false positives          ✗ Slow detection
    ✗ Thrashing, unnecessary        ✗ Prolonged unavailability
      failovers                       for failed nodes
```

### Practical Guidance

| Scenario | Prefer |
|---|---|
| Stateless services (web frontends) | Shorter timeout — false positive cost is low |
| Stateful services (databases, leaders) | Longer timeout — false positive triggers expensive failover |
| Financial transactions | Much longer timeout — correctness > speed |

---

## Timeout Tuning

Choosing the right timeout is both art and science.

### Factors to Consider

1. **Network RTT** — measure P99 latency, not just the average.
2. **GC pauses** — Java/Go stop-the-world pauses can last seconds.
3. **Disk I/O** — a node under heavy I/O may be slow but not dead.
4. **CPU saturation** — overloaded nodes respond slowly.

### A Tuning Methodology

```
Step 1: Measure baseline RTT distribution
          P50 = 2ms, P99 = 15ms, P99.9 = 80ms

Step 2: Account for GC pauses
          Max observed GC pause = 200ms

Step 3: Set timeout
          timeout = P99.9 + max_GC + safety_buffer
          timeout = 80ms + 200ms + 220ms = 500ms

Step 4: Monitor false positive rate in production
          Target: < 0.1% per detection period

Step 5: Adjust iteratively
```

### Common Timeout Values in Real Systems

| System | Default Timeout | Notes |
|---|---|---|
| Apache Cassandra | φ = 8 (phi accrual) | ~10-30s effective |
| Apache ZooKeeper | `tickTime × syncLimit` | Typically 4-10s |
| Kubernetes | 40s (node) | `node-monitor-grace-period` |
| etcd | 1000ms heartbeat, 5s election | Raft-based |
| Consul | 5s gossip, 72h reap | SWIM-based |

---

## Implementation in Practice

### Real-World Considerations

**1. Combine multiple signals:**

```python
class PracticalFailureDetector:
    """Combine heartbeat + application-level health checks."""

    def __init__(self, node_id):
        self.heartbeat_detector = PhiAccrualDetector(threshold=8)
        self.health_check_ok = True
        self.node_id = node_id

    def is_healthy(self):
        """A node is healthy only if BOTH checks pass."""
        heartbeat_ok = not self.heartbeat_detector.is_suspect()
        return heartbeat_ok and self.health_check_ok

    def run_health_check(self):
        """Application-level check (e.g., can the node serve reads?)."""
        try:
            response = send_health_probe(self.node_id)
            self.health_check_ok = response.status == "ok"
        except TimeoutError:
            self.health_check_ok = False
```

**2. Use quorum-based decisions:**

Do not let a **single** detector decide a node is dead. Require multiple observers to agree:

```python
def is_node_failed(node_id, all_detectors, quorum_size):
    """Require a quorum of detectors to suspect a node."""
    suspect_count = sum(
        1 for d in all_detectors if d.suspects(node_id)
    )
    return suspect_count >= quorum_size
```

**3. Implement crashing node self-awareness:**

```python
def self_check():
    """If I suspect I might be the problem, step down gracefully."""
    if cannot_reach_majority():
        # I am likely partitioned — step down as leader
        step_down()
        log("Stepped down: cannot reach majority of peers")
```

---

## Summary

| Concept | Key Takeaway |
|---|---|
| FLP impossibility | Perfect detection is impossible in async systems |
| Fixed timeout | Simple but cannot adapt to conditions |
| Adaptive timeout | Adjusts like TCP RTT estimation |
| Phi accrual (Cassandra) | Outputs continuous suspicion level, not binary |
| SWIM | Ping + ping-req + suspicion; O(1) message load |
| Gossip detection | Scalable, eventually consistent |
| Completeness | "Every crash is detected" |
| Accuracy | "No alive node is falsely suspected" |
| Perfect detector (P) | Only in synchronous systems |
| Eventually perfect (◇P) | Practical — allows temporary mistakes |
| Timeout tuning | Balance: P99 latency + GC + safety margin |

---

## Exercises

1. **You set a heartbeat timeout of 100ms. The network P99 latency is 80ms and your JVM has GC pauses up to 150ms. What happens? What timeout would you choose instead?**

2. **Explain why weak completeness + gossip of suspicions gives you strong completeness.**

3. **A Cassandra cluster uses the phi accrual detector with threshold 8. Node X has been sending heartbeats every 1s (std dev 50ms). The last heartbeat was 5 seconds ago. Estimate φ and determine whether X is suspected.**

4. **In the SWIM protocol, why is the indirect ping (ping-req) step important? Give a concrete scenario where skipping it causes a false positive.**

5. **Design a failure detector for a system with these requirements:**
   - 5 database replicas
   - Leader handles all writes
   - False positive on the leader triggers a 30-second re-election
   - P99 network latency is 10ms, max GC pause is 500ms

   What detector type, timeout, and quorum would you use?

6. **Classify each failure detector and state whether it can solve consensus:**
   - (a) Strong completeness, strong accuracy
   - (b) Strong completeness, eventual weak accuracy
   - (c) Weak completeness, weak accuracy

7. **Implement a simple gossip-based failure detector (pseudocode or real code) that detects failures within O(log n) gossip rounds for a cluster of n nodes.**
