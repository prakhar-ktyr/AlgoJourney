---
title: Why Distributed Systems
---

## Why Distributed Systems?

In this lesson, you'll learn **why** distributed systems are necessary, the fundamental scaling laws that govern them, the trade-offs they introduce, and when you should (and shouldn't) go distributed.

---

## The Fundamental Problem: Scale

Consider the numbers behind some of the world's largest services:

| Service | Scale |
|---------|-------|
| Google Search | ~8.5 billion searches per day |
| YouTube | 500 hours of video uploaded per minute |
| Amazon | ~1.6 million packages shipped per day |
| WhatsApp | 100 billion messages per day |
| Netflix | 238 million subscribers streaming simultaneously |

**No single machine — no matter how powerful — can handle this load.** Even the most advanced server you can buy today has limits:

```
Top-of-the-line single server (2024):
  CPU:      256 cores
  RAM:      12 TB
  Storage:  100 TB NVMe
  Network:  100 Gbps

Google Search requirements:
  ~100,000 queries/second (average)
  ~100+ PB of indexed data
  <500ms response time globally

  → Impossible on one machine!
```

This is the fundamental motivation: **the demand exceeds what any single computer can provide**.

---

## Motivation 1: Scalability

**Scalability** is the ability of a system to handle increased load by adding resources.

### Vertical Scaling (Scale Up)

Add more power to a **single machine**: more CPU cores, more RAM, faster disks.

```
Before:   [4 cores, 16 GB RAM] → handles 1,000 req/s
After:    [64 cores, 512 GB RAM] → handles 10,000 req/s
```

**Advantages**:
- Simple — no code changes needed
- No network overhead
- Strong consistency is easy

**Disadvantages**:
- **Hard limit** — You can't add infinite CPU/RAM to one machine
- **Expensive** — High-end hardware costs exponentially more
- **Single point of failure** — If that machine dies, everything stops
- **Diminishing returns** — Going from 4→8 cores doesn't double performance due to contention

### Horizontal Scaling (Scale Out)

Add more **machines** to the system and distribute the work.

```
Before:   [Server A] → handles 1,000 req/s

After:    [Server A] ──┐
          [Server B] ──┼──► handles 4,000 req/s
          [Server C] ──┤
          [Server D] ──┘
```

**Advantages**:
- **Near-unlimited scaling** — Just add more machines
- **Cost-effective** — Commodity hardware is cheap
- **Fault-tolerant** — Losing one machine doesn't bring down the system
- **Geographic distribution** — Place machines near users

**Disadvantages**:
- **Complexity** — Must manage data partitioning, replication, coordination
- **Network overhead** — Communication between machines adds latency
- **Consistency challenges** — Keeping data in sync is hard

### Comparison

| Aspect | Vertical (Scale Up) | Horizontal (Scale Out) |
|--------|-------------------|----------------------|
| Cost curve | Exponential | Linear |
| Upper limit | Hardware limit | Practically unlimited |
| Complexity | Low | High |
| Fault tolerance | None (SPOF) | Built-in |
| Consistency | Easy | Hard |
| Downtime to scale | Yes (hardware swap) | No (add machines live) |

### The Cost Curve

The cost of vertical scaling grows superlinearly, while horizontal scaling grows linearly:

```
Cost ($)
  │
  │                                    ╱ Vertical
  │                                  ╱   (scale up)
  │                                ╱
  │                             ╱
  │                          ╱
  │                       ╱
  │                   ╱
  │              ╱
  │         ╱  ╱ Horizontal
  │      ╱  ╱   (scale out)
  │   ╱  ╱
  │ ╱ ╱
  │╱╱
  └──────────────────────────────────── Capacity
```

At some point, vertical scaling becomes **prohibitively expensive** or simply **impossible** (you can't buy a computer with 1 PB of RAM). Horizontal scaling is the only option.

---

## Motivation 2: Reliability and Fault Tolerance

Hardware fails. It's not a question of **if**, but **when**.

### Failure Rates in Practice

| Component | Annual Failure Rate | In a 10,000-node cluster |
|-----------|-------------------|-------------------------|
| Hard drive | 2-4% | 200-400 failures/year |
| Server | 2-10% | 200-1,000 failures/year |
| Network switch | 1-5% | 100-500 failures/year |
| Power supply | 1-2% | 100-200 failures/year |

In a large data center with 10,000 servers, you can expect **multiple failures every day**.

### Probability of Failure

If a single server has availability $A = 0.999$ (99.9% uptime, or ~8.7 hours downtime per year), the probability that it's **available** at any given time is $0.999$.

For a system to be available, at least **one** of $n$ replicas must be up. The probability that **all** $n$ replicas are down simultaneously:

$$P(\text{all down}) = (1 - A)^n$$

With 3 replicas at 99.9% individual availability:

$$P(\text{all down}) = (0.001)^3 = 0.000000001 = 10^{-9}$$

$$P(\text{system available}) = 1 - 10^{-9} = 99.9999999\%$$

That's **nine nines** of availability — about 0.03 seconds of downtime per year!

### Availability Levels

| Nines | Availability | Downtime/Year | Typical Use |
|-------|-------------|---------------|-------------|
| 2 | 99% | 3.65 days | Internal tools |
| 3 | 99.9% | 8.76 hours | Business apps |
| 4 | 99.99% | 52.6 minutes | E-commerce |
| 5 | 99.999% | 5.26 minutes | Financial systems |
| 6 | 99.9999% | 31.5 seconds | Life-critical systems |

**Key insight**: Achieving high availability requires **redundancy**, which inherently means distributing across multiple machines (and ideally multiple data centers and regions).

---

## Motivation 3: Performance

### Latency

The speed of light imposes hard physical limits on network communication:

| Route | Distance | Minimum Round-Trip Time |
|-------|----------|------------------------|
| Same data center | ~1 km | ~0.01 ms |
| Same region | ~100 km | ~1 ms |
| Cross-continent (US) | ~4,000 km | ~40 ms |
| Cross-Atlantic | ~6,000 km | ~60 ms |
| Cross-Pacific | ~10,000 km | ~100 ms |
| Around the world | ~40,000 km | ~200 ms |

**Note**: These are theoretical minimums. Real-world latencies are 2-5x higher due to routing, switching, and processing.

If your servers are only in New York and a user in Tokyo makes a request:

```
Tokyo user ──── ~200ms ────► New York server
            ◄─── ~200ms ────
Total: ~400ms round trip (just for network!)
```

By placing servers in Tokyo:

```
Tokyo user ──── ~2ms ────► Tokyo server
            ◄─── ~2ms ────
Total: ~4ms round trip (100x faster!)
```

### Throughput

A single machine has limited throughput (requests per second). Distributing across $N$ machines ideally gives $N \times$ throughput:

```python
# Single server
throughput_single = 1000  # requests/second

# Distributed across 10 servers (ideal case)
throughput_distributed = 10 * 1000  # = 10,000 requests/second
```

In practice, throughput doesn't scale perfectly linearly due to coordination overhead — but it gets close for well-designed systems.

---

## Motivation 4: Geographic Distribution

Some applications **inherently** require geographic distribution:

- **Data sovereignty laws** — GDPR requires EU user data to be stored in the EU
- **Low-latency requirements** — Gaming and video streaming need servers near users
- **Disaster recovery** — If an earthquake destroys a data center in Region A, data in Region B survives
- **24/7 operations** — "Follow the sun" support across time zones

```
┌──────────────────────────────────────────────────┐
│              Global Distribution                  │
│                                                  │
│    US-East ●──────────● EU-West                  │
│       │    ╲        ╱    │                        │
│       │     ╲      ╱     │                        │
│       │      ╲    ╱      │                        │
│       │       ╲  ╱       │                        │
│    US-West ●──────────● Asia-East                │
│                                                  │
│    Each region: independent but synchronized     │
└──────────────────────────────────────────────────┘
```

---

## Motivation 5: Cost Efficiency

### Commodity Hardware vs Supercomputers

| Approach | Configuration | Cost |
|----------|--------------|------|
| 1 supercomputer | 256 cores, 12 TB RAM | ~$500,000 |
| 50 commodity servers | 8 cores, 64 GB RAM each = 400 cores, 3.2 TB total | ~$100,000 |

The commodity cluster provides **more total compute power** at **1/5 the cost** — but requires distributed systems software to manage.

### Cloud Economics

Cloud computing (AWS, GCP, Azure) makes horizontal scaling **elastic** — you can add or remove machines in minutes, paying only for what you use:

```python
# Auto-scaling example
if current_load > 80%:
    add_servers(count=5)   # Scale up in minutes
elif current_load < 20%:
    remove_servers(count=3) # Scale down, stop paying

# vs. vertical scaling:
# "We need a bigger server"
# → Order hardware: 6 weeks
# → Install and configure: 1 week
# → Total: ~2 months
```

---

## Motivation 6: Data Locality

Processing data **where it lives** is often faster than moving it to a central location.

```
Bad:  Move 1 PB of data to the compute ← Takes hours/days!
Good: Move the compute to the data     ← Start immediately

Example: MapReduce processes data on the nodes where it's stored
```

The principle of **data locality** is fundamental to distributed computing frameworks like Hadoop, Spark, and Flink.

---

## Scaling Laws

Understanding the theoretical limits of scaling helps you make better design decisions.

### Amdahl's Law

Not all parts of a program can be parallelized. **Amdahl's Law** gives the theoretical maximum speedup when parallelizing a program:

$$S(N) = \frac{1}{(1 - P) + \frac{P}{N}}$$

Where:
- $S(N)$ = speedup with $N$ processors
- $P$ = fraction of the program that can be parallelized
- $N$ = number of processors

**Example**: If 95% of a program is parallelizable ($P = 0.95$):

| Processors ($N$) | Speedup $S(N)$ |
|-------------------|-----------------|
| 1 | 1.0x |
| 2 | 1.9x |
| 4 | 3.5x |
| 10 | 6.9x |
| 100 | 16.8x |
| 1,000 | 19.6x |
| ∞ | 20.0x |

Even with **infinite** processors, the maximum speedup is $\frac{1}{1-P} = \frac{1}{0.05} = 20\times$!

```
Speedup
  20 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ← theoretical max
  │                        ╱────────────────
  │                    ╱──╱
  │                ╱──╱
  │             ╱─╱
  │          ╱─╱
  │       ╱─╱
  │     ╱╱
  │   ╱╱
  │  ╱╱
  │ ╱╱  ← P = 0.95
  │╱
  └──────────────────────────────────── N
  1    10    100   1000  10000
```

**Lesson**: The serial portion of your code is the bottleneck. Even a tiny serial fraction severely limits scalability.

### Gustafson's Law

Gustafson offers a more optimistic view: as you add processors, you can also **increase the problem size** (process more data):

$$S(N) = N - \sigma(N - 1)$$

Where:
- $S(N)$ = scaled speedup
- $N$ = number of processors
- $\sigma$ = serial fraction of the **parallel** workload

**Key insight**: Instead of asking "how much faster with more processors?", ask "how much more work with more processors?" This perspective better fits distributed systems where data size grows with capacity.

### Universal Scalability Law (USL)

The **USL** (by Neil Gunther) adds a crucial missing factor: **coherence** (the cost of keeping data consistent across nodes).

$$S(N) = \frac{N}{1 + \sigma(N - 1) + \kappa N(N - 1)}$$

Where:
- $\sigma$ = contention penalty (serialization)
- $\kappa$ = coherence penalty (communication/consistency)

The USL predicts that beyond a certain number of nodes, adding more nodes **decreases** throughput due to coherence overhead:

```
Throughput
  │              ╱╲
  │            ╱    ╲  ← USL: throughput DROPS
  │          ╱        ╲    after optimal N
  │        ╱            ╲
  │      ╱                ╲
  │    ╱   ╱───── Amdahl (levels off)
  │   ╱  ╱
  │  ╱ ╱
  │ ╱╱────── Linear (ideal)
  │╱
  └────────────────────────────── N (nodes)
```

**Practical lesson**: There's an **optimal** number of nodes. Beyond that, the coordination overhead dominates. This is why systems like databases have practical limits on the number of replicas.

---

## Trade-offs: The Cost of Distribution

Going distributed is not free. Here are the major trade-offs:

### 1. Complexity

Distributed code is **orders of magnitude** more complex than single-machine code:

```python
# Single machine: simple function call
result = database.query("SELECT * FROM users WHERE id = 42")

# Distributed: what could go wrong?
try:
    result = remote_database.query("SELECT * FROM users WHERE id = 42")
except ConnectionTimeout:
    # Network was slow — did the query execute or not?
    retry_or_failover()
except ConnectionRefused:
    # Server is down — try another replica
    result = backup_database.query("SELECT * FROM users WHERE id = 42")
except PartialResponse:
    # Got some data but connection dropped
    # Is the data complete? Should we retry?
    handle_partial_result()
```

### 2. Debugging Difficulty

Distributed bugs are notoriously hard to reproduce and diagnose:

- **Non-determinism** — Behavior depends on timing, network conditions, and the order messages arrive
- **Heisenbugs** — Bugs that disappear when you try to observe them (adding logging changes timing)
- **Partial failures** — Some nodes work fine, others don't — and the line between "working" and "failed" can be blurry
- **Log correlation** — Tracing a single request across 20 services requires distributed tracing (Jaeger, Zipkin)

### 3. Partial Failure

In a single machine, things either work or they don't. In a distributed system, some parts can fail while others continue:

```
Service A: ✓ Working
Service B: ✗ Crashed
Service C: ✓ Working
Service D: ? Slow (is it failed or just overloaded?)
Network A↔C: ✓ Working
Network A↔B: ✗ Partitioned
```

Designing for partial failure is one of the hardest aspects of distributed systems.

### 4. Network Unreliability

The network is the weakest link. Messages can be:

| Problem | Description | Example |
|---------|-------------|---------|
| **Lost** | Message never arrives | Packet dropped by overloaded router |
| **Delayed** | Message arrives much later than expected | Network congestion, routing changes |
| **Duplicated** | Same message arrives multiple times | Retransmission after false timeout |
| **Reordered** | Messages arrive in different order than sent | Different network paths |
| **Corrupted** | Message content is altered | Bit flips (rare but possible) |

### 5. Consistency-Availability Trade-off

The **CAP theorem** (covered in detail in Section 4) states that during a network partition, a distributed system must choose between:

- **Consistency** — All nodes see the same data at the same time
- **Availability** — Every request receives a response (possibly stale)

You **cannot have both** during a partition. This fundamental trade-off shapes every distributed system design.

---

## When NOT to Go Distributed

Distribution is not always the answer. Here's when a single machine (or simpler architecture) is better:

### Signs You Don't Need Distribution

| Situation | Why Stay Simple |
|-----------|----------------|
| Low traffic | A single server handles thousands of req/s |
| Small data | If your data fits on one machine, keep it there |
| Strong consistency needed | ACID transactions are trivial on one machine |
| Small team | Distributed systems require ops expertise |
| Early-stage product | Focus on product-market fit, not scale |
| Computation is CPU-bound | Vertical scaling (bigger CPU) may be simpler |

### The "You Aren't Gonna Need It" Principle

A classic mistake is building a distributed system before you need one:

```
Startup with 100 users:
  ✗ "Let's use Kubernetes with 50 microservices!"
  ✓ "Let's use a single server with a monolith."

Growth from 100 → 100,000 users:
  ✓ "Now let's add a database replica and a CDN."

Growth from 100,000 → 10,000,000 users:
  ✓ "Now we need proper sharding and multiple services."
```

**Start simple. Distribute when you must.**

### The Decision Framework

```
Do you need to handle more traffic than one server can manage?
  └─ No → Stay single-server
  └─ Yes ↓

Do you need high availability (99.99%+)?
  └─ No → Consider primary-backup setup
  └─ Yes ↓

Do you need low latency globally?
  └─ No → Consider multi-server in one region
  └─ Yes ↓

You need a distributed system.
Plan for: partitioning, replication, consensus, monitoring.
```

---

## Real-World Case Study: Scaling a Web Application

Let's trace how a typical web application evolves as it grows:

### Stage 1: Single Server (0-1,000 users)

```
Users ──► [Web App + Database]
              (one server)
```

- Everything runs on one machine
- Simple to develop, deploy, debug
- Cost: ~$50/month

### Stage 2: Separate Database (1,000-10,000 users)

```
Users ──► [Web App Server] ──► [Database Server]
```

- Web server and database on separate machines
- Database can have more RAM for caching
- Still relatively simple

### Stage 3: Load Balancer + Multiple Web Servers (10,000-100,000 users)

```
Users ──► [Load Balancer] ──┬──► [Web Server 1] ──►
                            ├──► [Web Server 2] ──► [Database]
                            └──► [Web Server 3] ──►
```

- Horizontal scaling of stateless web servers
- Requires session management (sticky sessions or external store)
- Database becomes the bottleneck

### Stage 4: Database Replication + Caching (100,000-1M users)

```
Users ──► [LB] ──► [Web Servers] ──► [Cache (Redis)]
                                          │
                                     [DB Primary]
                                      ╱        ╲
                                [DB Replica] [DB Replica]
```

- Read replicas offload the primary database
- Caching layer reduces database load
- Writes still go to one primary — potential bottleneck

### Stage 5: Sharding + Microservices (1M-100M users)

```
Users ──► [API Gateway] ──┬──► [User Service] ──► [User DB Shard 1-4]
                          ├──► [Order Service] ──► [Order DB Shard 1-8]
                          ├──► [Search Service] ──► [Elasticsearch Cluster]
                          └──► [Message Queue] ──► [Async Workers]
```

- Database sharded across multiple machines
- Monolith broken into microservices
- Async processing for non-critical paths
- **Now you have a full distributed system!**

---

## Try It Yourself

### Exercise 1: Amdahl's Law Calculator

Calculate the maximum speedup for different parallelizable fractions:

```python
def amdahls_law(P, N):
    """
    Calculate speedup using Amdahl's Law.
    P: parallelizable fraction (0 to 1)
    N: number of processors
    """
    return 1 / ((1 - P) + P / N)

# Try these:
fractions = [0.5, 0.75, 0.9, 0.95, 0.99]
processors = [2, 4, 8, 16, 64, 256, 1024]

print(f"{'P':>6} | ", end="")
for n in processors:
    print(f"N={n:>4} | ", end="")
print()
print("-" * 70)

for p in fractions:
    print(f"{p:>6.2f} | ", end="")
    for n in processors:
        speedup = amdahls_law(p, n)
        print(f"{speedup:>6.2f} | ", end="")
    print()
```

**Questions**:
1. What is the maximum speedup when $P = 0.99$ and $N \to \infty$?
2. If your application's serial fraction is 10%, is it worth adding more than 20 nodes?

<details>
<summary>Click to see answers</summary>

1. Maximum speedup = $\frac{1}{1-0.99} = \frac{1}{0.01} = 100\times$
2. With $P = 0.9$, at $N = 20$: $S = \frac{1}{0.1 + 0.9/20} = \frac{1}{0.145} = 6.9\times$. At $N = 100$: $S = \frac{1}{0.1 + 0.009} = 9.2\times$. The marginal gain from 20→100 nodes is only 2.3x. It may not be worth the complexity unless you also reduce the serial fraction.

</details>

### Exercise 2: Availability Calculation

A service has three replicas, each with 99.5% availability. Calculate:

1. The probability that **all three** replicas are down simultaneously
2. The overall system availability (assuming the system is available if at least one replica is up)
3. The annual downtime in minutes

<details>
<summary>Click to see answers</summary>

1. $P(\text{all down}) = (1 - 0.995)^3 = (0.005)^3 = 1.25 \times 10^{-7}$
2. $P(\text{available}) = 1 - 1.25 \times 10^{-7} = 99.9999875\%$
3. Annual downtime = $1.25 \times 10^{-7} \times 365.25 \times 24 \times 60 \approx 0.066$ minutes ≈ 4 seconds/year

</details>

### Exercise 3: Scaling Decision

Your e-commerce app currently runs on a single server handling 500 requests/second. Traffic analysis shows:

- Normal traffic: 800 req/s
- Black Friday peak: 15,000 req/s
- Data size: 200 GB and growing 50 GB/year

Design your scaling strategy. Consider:
- When do you need to scale?
- Vertical or horizontal first?
- What components need distribution?

---

## Key Takeaways

- **No single machine can handle web-scale workloads** — distribution is a necessity, not a luxury
- **Horizontal scaling** (more machines) beats **vertical scaling** (bigger machine) for cost and fault tolerance
- **Fault tolerance** requires redundancy across multiple machines, data centers, and regions
- **Geographic distribution** reduces latency and satisfies data sovereignty requirements
- **Amdahl's Law**: the serial fraction of your code limits maximum speedup
- **Gustafson's Law**: scaling the problem size with processors is more realistic
- **Universal Scalability Law**: coherence overhead means there's an optimal number of nodes — more isn't always better
- Distribution introduces **complexity**, **debugging difficulty**, **partial failures**, and **consistency challenges**
- **Don't distribute prematurely** — start simple and scale when needed
- In the next lesson, we'll learn about the **8 Fallacies of Distributed Computing** — the false assumptions that trip up even experienced engineers
