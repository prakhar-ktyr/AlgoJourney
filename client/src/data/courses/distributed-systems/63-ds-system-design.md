---
title: "System Design for Interviews"
---

# System Design for Interviews

Distributed systems knowledge is the backbone of system design interviews. This lesson provides a comprehensive framework for tackling these interviews, covering common patterns, classic problems, estimation techniques, and communication strategies.

---

## Why Distributed Systems Matter in Interviews

System design interviews test your ability to design large-scale systems that are:

- **Scalable** — handle growing traffic
- **Reliable** — tolerate failures gracefully
- **Available** — serve users with minimal downtime
- **Performant** — respond within acceptable latency

| Skill Tested | What Interviewers Look For |
|---|---|
| Requirements gathering | Clarifying ambiguity, identifying constraints |
| High-level architecture | Component selection, data flow |
| Deep technical knowledge | Trade-offs, distributed concepts |
| Communication | Structured thinking, collaboration |
| Estimation | Reasonable capacity calculations |

---

## The 5-Step Framework

Use this structured approach for every system design interview:

### Step 1: Requirements Gathering (3-5 minutes)

```text
Functional Requirements:
- What does the system DO?
- Who are the users?
- What are the core features (MVP)?

Non-Functional Requirements:
- Scale: How many users? QPS?
- Latency: What response time is acceptable?
- Availability: What uptime is required?
- Consistency: Strong or eventual?

Constraints:
- Budget, team size, timeline
- Existing infrastructure
- Regulatory/compliance needs
```

**Example questions to ask:**

- "How many daily active users should we design for?"
- "Is read-heavy or write-heavy traffic expected?"
- "What's the acceptable latency for the core operation?"
- "Do we need strong consistency or is eventual consistency okay?"

### Step 2: Back-of-Envelope Estimation (3-5 minutes)

```text
Traffic Estimation:
- DAU × actions/user/day = total requests/day
- Total requests / 86400 = average QPS
- Peak QPS ≈ 2-5× average QPS

Storage Estimation:
- Size per record × records/day × retention period
- Account for replication factor (typically 3×)

Bandwidth Estimation:
- QPS × average response size = bandwidth
```

### Step 3: High-Level Design (10-15 minutes)

Draw the major components and their interactions:

```text
┌────────┐     ┌─────────────┐     ┌──────────┐
│ Client │────▶│ Load Balancer│────▶│ API Server│
└────────┘     └─────────────┘     └──────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              ┌──────────┐      ┌────────────┐      ┌───────────┐
              │  Cache   │      │  Database  │      │ Message Q  │
              └──────────┘      └────────────┘      └───────────┘
```

### Step 4: Deep Dive (10-15 minutes)

Pick 2-3 components to detail based on interviewer interest:

- Database schema and indexing strategy
- Caching layer design
- Sharding/partitioning approach
- Consistency guarantees
- Failure handling

### Step 5: Wrap Up (3-5 minutes)

- Summarize key design decisions
- Discuss trade-offs made
- Mention potential improvements
- Address bottlenecks and how to monitor them

---

## Common Patterns by Workload Type

### Read-Heavy Systems

Systems where reads vastly outnumber writes (e.g., social media feeds, product catalogs).

| Pattern | Description | Use When |
|---|---|---|
| Caching | Store frequently accessed data in memory | Read:Write ratio > 10:1 |
| CDN | Serve static content from edge locations | Global user base, static assets |
| Read Replicas | Replicate database for read distribution | DB is the bottleneck |
| Denormalization | Pre-compute and store derived data | Complex joins slow reads |
| Materialized Views | Pre-computed query results | Expensive aggregations |

```text
Architecture for Read-Heavy System:

Client → CDN (static assets)
     ↓
Load Balancer → API Servers → Cache (Redis/Memcached)
                                  ↓ (cache miss)
                              Read Replicas (MySQL/PostgreSQL)
                                  ↑ (replication)
                              Primary DB (writes only)
```

**Key considerations:**

- Cache invalidation strategy (TTL, write-through, write-behind)
- Eventual consistency between replicas and primary
- Cache warming on cold starts
- Thundering herd problem mitigation

### Write-Heavy Systems

Systems with high write throughput (e.g., logging, analytics, IoT).

| Pattern | Description | Use When |
|---|---|---|
| Write-Ahead Log (WAL) | Log writes before applying | Durability needed |
| Sharding | Partition data across nodes | Single node can't handle writes |
| Async Processing | Queue writes for batch processing | Writes can be eventually consistent |
| LSM Trees | Append-only storage structure | High write throughput needed |
| Event Sourcing | Store events, not state | Audit trail required |

```text
Architecture for Write-Heavy System:

Client → Load Balancer → API Servers → Message Queue (Kafka)
                                            ↓
                                     Stream Processors
                                            ↓
                                     Sharded Database
                                     (partition by key)
```

**Key considerations:**

- Choosing the right shard key (avoid hot spots)
- Handling cross-shard queries
- Write amplification in LSM trees
- Backpressure when queues fill up

### Real-Time Systems

Systems requiring instant updates (e.g., chat, live dashboards, gaming).

| Pattern | Description | Use When |
|---|---|---|
| WebSocket | Persistent bidirectional connection | Two-way real-time communication |
| Server-Sent Events | Server pushes to client | One-way updates (notifications) |
| Pub/Sub | Publishers broadcast to subscribers | Fan-out to many consumers |
| Long Polling | Client polls with long timeout | WebSocket not available |
| CRDT | Conflict-free replicated data types | Collaborative editing |

```text
Architecture for Real-Time System:

Client ←──WebSocket──→ WebSocket Server (stateful)
                              ↓
                        Pub/Sub (Redis Pub/Sub or Kafka)
                              ↓
                        Other WebSocket Servers
                              ↓
                        Persistence Layer (eventual)
```

**Key considerations:**

- Connection management at scale (millions of connections)
- Heartbeat and reconnection strategies
- Message ordering guarantees
- Presence detection and session management

---

## Classic Interview Problems

### 1. URL Shortener

```text
Requirements:
- Shorten long URLs → short alias
- Redirect short URL → original URL
- Analytics (click count, geography)
- Custom aliases (optional)
- Expiration (optional)

Key Decisions:
- ID generation: Base62 encoding of auto-increment ID or hash
- Storage: Key-value store (short_url → long_url)
- Scale: Read-heavy (100:1 read/write ratio)
- Caching: Hot URLs in Redis

Estimation (100M URLs/day):
- Write QPS: 100M / 86400 ≈ 1200 QPS
- Read QPS: 1200 × 100 = 120K QPS
- Storage: 100M × 500 bytes × 365 days × 5 years ≈ 90 TB
```

### 2. Rate Limiter

```text
Requirements:
- Limit requests per user/IP/API key
- Multiple rate limiting rules (per second, minute, hour)
- Distributed (works across multiple servers)
- Low latency overhead

Key Decisions:
- Algorithm: Token bucket, sliding window, fixed window
- Storage: Redis (atomic operations, TTL support)
- Placement: API gateway or middleware
- Response: 429 Too Many Requests + Retry-After header

Algorithm Comparison:
┌────────────────┬──────────────┬────────────────┬──────────────┐
│ Algorithm      │ Memory       │ Accuracy       │ Burst Allow  │
├────────────────┼──────────────┼────────────────┼──────────────┤
│ Token Bucket   │ Low          │ Medium         │ Yes          │
│ Sliding Window │ Medium       │ High           │ No           │
│ Fixed Window   │ Low          │ Low (boundary) │ Yes          │
│ Leaky Bucket   │ Low          │ Medium         │ No           │
└────────────────┴──────────────┴────────────────┴──────────────┘
```

### 3. News Feed / Timeline

```text
Requirements:
- Users see posts from people they follow
- Sorted by relevance/time
- Support millions of users
- Low latency feed generation

Key Decisions:
- Fan-out on write vs fan-out on read
- Celebrity problem (users with millions of followers)
- Hybrid approach for optimal performance

Fan-out on Write:
- Pre-compute feeds when post is created
- Fast reads, expensive writes
- Good for users with few followers

Fan-out on Read:
- Compute feed at read time
- Slow reads, cheap writes
- Good for celebrities

Hybrid:
- Fan-out on write for normal users
- Fan-out on read for celebrities (>10K followers)
```

### 4. Chat System

```text
Requirements:
- 1-on-1 and group messaging
- Online/offline status
- Message delivery guarantees
- Read receipts
- Media support

Key Decisions:
- WebSocket for real-time delivery
- Message queue for offline users
- Message storage: per-chat partition
- Ordering: Snowflake ID or vector clock

Architecture:
Client → WebSocket Gateway → Chat Service → Message Queue
                                    ↓
                              Message Store (Cassandra)
                                    ↓
                              Push Notification Service
```

### 5. Distributed Cache

```text
Requirements:
- Sub-millisecond latency
- High throughput (millions of ops/sec)
- Horizontal scalability
- Fault tolerance

Key Decisions:
- Consistent hashing for data distribution
- Replication for fault tolerance
- Eviction policy (LRU, LFU, TTL)
- Cache-aside vs write-through vs write-behind

Consistent Hashing:
- Virtual nodes for balanced distribution
- Minimal key redistribution on node add/remove
- Handle hotspots with replication
```

### 6. Search Engine

```text
Requirements:
- Full-text search across documents
- Relevance ranking
- Auto-complete / suggestions
- Typo tolerance
- Low latency (<200ms)

Key Decisions:
- Inverted index for fast lookups
- Sharding by document ID or term
- Ranking: TF-IDF, BM25, or ML-based
- Trie for auto-complete

Architecture:
Query → Query Parser → Index Shards (parallel search)
                              ↓
                        Result Merger + Ranker
                              ↓
                        Response to Client

Indexing Pipeline:
Documents → Tokenizer → Index Builder → Sharded Index
```

---

## Key Concepts Checklist

Before your interview, ensure you can explain each concept:

| Category | Concepts |
|---|---|
| Scaling | Horizontal vs vertical, load balancing, auto-scaling |
| Data | Sharding, replication, partitioning, consistent hashing |
| Caching | Cache strategies, invalidation, CDN, cache stampede |
| Messaging | Message queues, pub/sub, event-driven architecture |
| Consistency | CAP theorem, PACELC, eventual consistency, linearizability |
| Availability | Redundancy, failover, health checks, circuit breaker |
| Storage | SQL vs NoSQL, object storage, time-series DB, graph DB |
| Networking | DNS, CDN, TCP/UDP, HTTP/2, gRPC, WebSocket |
| Security | Authentication, authorization, encryption, rate limiting |
| Monitoring | Metrics, logging, tracing, alerting, SLO/SLI/SLA |

---

## Estimation Techniques

### Common Numbers to Memorize

```text
Latency Numbers:
- L1 cache reference:           0.5 ns
- L2 cache reference:             7 ns
- Main memory reference:        100 ns
- SSD random read:          150,000 ns (150 μs)
- HDD seek:              10,000,000 ns (10 ms)
- Network round trip (same DC):      500,000 ns (0.5 ms)
- Network round trip (cross-continent): 150,000,000 ns (150 ms)

Throughput:
- SSD sequential read:   1 GB/s
- HDD sequential read: 100 MB/s
- Network (1 Gbps):   125 MB/s
- Network (10 Gbps): 1.25 GB/s

Scale:
- 1 million seconds ≈ 11.5 days
- 1 billion seconds ≈ 31.7 years
- 86,400 seconds/day ≈ 100K (for quick math)
- 2.5 million seconds/month ≈ 2.5M
```

### Quick Estimation Template

```text
Given: X million DAU, Y actions per user per day

Step 1 - QPS:
  Total requests/day = X × 10^6 × Y
  Average QPS = Total / 86400 ≈ Total / 10^5
  Peak QPS = Average × 3 (safety factor)

Step 2 - Storage:
  Per record: estimate bytes (ID=8, timestamp=8, text=varies)
  Daily storage = QPS × 86400 × record_size
  5-year storage = Daily × 365 × 5
  With replication = Total × 3

Step 3 - Bandwidth:
  Incoming = Write QPS × request_size
  Outgoing = Read QPS × response_size

Step 4 - Machines:
  If single server handles 10K QPS
  Servers needed = Peak QPS / 10K
```

### Power of Two Table

| Power | Exact Value | Approx Size |
|---|---|---|
| 10 | 1,024 | 1 Thousand (KB) |
| 20 | 1,048,576 | 1 Million (MB) |
| 30 | 1,073,741,824 | 1 Billion (GB) |
| 40 | 1,099,511,627,776 | 1 Trillion (TB) |
| 50 | — | 1 Quadrillion (PB) |

---

## Communication Tips

### Do's

1. **Start with clarifying questions** — Never jump straight into design
2. **Think out loud** — Share your reasoning process
3. **Drive the conversation** — Don't wait for the interviewer to guide you
4. **Discuss trade-offs** — Every decision has pros and cons
5. **Use concrete numbers** — "This gives us 10K QPS" not "this is fast"
6. **Draw diagrams** — Visual communication is more effective
7. **Check in with the interviewer** — "Should I dive deeper here?"
8. **Acknowledge limitations** — "In production, we'd also need..."

### Don'ts

1. **Don't over-engineer** — Start simple, add complexity as needed
2. **Don't use buzzwords without understanding** — Be ready to explain anything you mention
3. **Don't ignore the interviewer's hints** — They're steering you toward what they want to hear
4. **Don't spend too long on one area** — Balance breadth and depth
5. **Don't be silent** — Even when thinking, narrate your thought process

### Structured Response Template

```text
"Let me break this down..."

1. "First, I want to clarify the requirements..."
2. "Based on these numbers, we're looking at approximately..."
3. "At a high level, the system would look like..."
4. "Let me dive deeper into [component]..."
5. "The key trade-off here is [X] vs [Y]. I'd choose [X] because..."
6. "To handle failures, we would..."
7. "If we had more time, I'd also consider..."
```

---

## Common Mistakes

| Mistake | Why It Hurts | How to Avoid |
|---|---|---|
| Jumping to solution immediately | Misses requirements, looks unstructured | Always spend 3-5 min on requirements |
| Designing for current scale only | Shows lack of forward thinking | Ask about growth, design for 10× |
| Ignoring failure scenarios | Real systems fail constantly | Discuss what happens when X goes down |
| Single point of failure | Shows inexperience | Add redundancy to every critical path |
| Not discussing data model | Data drives architecture | Define schema early, discuss access patterns |
| Choosing tech without justification | Looks like resume-driven design | Explain WHY you chose each technology |
| Forgetting about operations | Systems need monitoring | Mention logging, metrics, alerting |
| Premature optimization | Over-complicates the design | Start simple, optimize bottlenecks |
| Not considering cost | Real systems have budgets | Mention cost trade-offs occasionally |
| Monolithic thinking | Doesn't scale | Design for independent scaling of components |

---

## Exercises

1. **Framework Practice**: Pick any product you use daily. Spend 5 minutes gathering requirements, 5 minutes estimating scale, and 10 minutes sketching architecture. Do this daily.

2. **Estimation Drill**: Calculate the storage needed for Twitter storing 500M tweets/day, average 280 characters, with metadata, for 5 years with 3× replication.

3. **Pattern Matching**: For each scenario below, identify which pattern (read-heavy, write-heavy, or real-time) applies and name two relevant architectural patterns:
   - Instagram photo feed
   - IoT sensor data collection
   - Multiplayer game server
   - E-commerce product catalog
   - Stock trading platform

4. **Deep Dive**: Choose one classic problem (URL shortener, rate limiter, etc.) and write out the complete design including API design, database schema, and failure handling.

5. **Trade-off Analysis**: For a social media notification system, compare push (fan-out on write) vs pull (fan-out on read). List 3 pros and 3 cons for each approach.

---

## Resources for Practice

### Books

| Book | Focus Area |
|---|---|
| *Designing Data-Intensive Applications* (Kleppmann) | Core distributed systems concepts |
| *System Design Interview Vol 1 & 2* (Alex Xu) | Interview-focused problems |
| *Building Microservices* (Newman) | Service architecture |
| *Web Scalability for Startup Engineers* (Ejsmont) | Practical scaling |

### Online Resources

| Resource | Description |
|---|---|
| System Design Primer (GitHub) | Comprehensive open-source guide |
| Grokking System Design | Structured interview course |
| High Scalability Blog | Real-world architecture case studies |
| Engineering Blogs (Netflix, Uber, etc.) | Production system insights |
| ByteByteGo Newsletter | Weekly system design content |

### Practice Strategy

```text
Week 1-2: Learn fundamentals
  - Read DDIA chapters 1-9
  - Memorize estimation numbers
  - Practice the 5-step framework

Week 3-4: Study classic problems
  - Design 2 systems per week
  - Time yourself (35-45 minutes)
  - Write up your designs

Week 5-6: Mock interviews
  - Practice with peers
  - Use random problem generators
  - Get feedback on communication

Week 7-8: Refinement
  - Review weak areas
  - Study company-specific systems
  - Polish estimation speed
```

---

## Summary

System design interviews test your ability to apply distributed systems knowledge practically. Remember:

- **Follow the framework** — Requirements → Estimation → High-Level → Deep Dive → Wrap Up
- **Know the patterns** — Read-heavy (cache, CDN, replicas), Write-heavy (WAL, sharding, async), Real-time (WebSocket, pub/sub)
- **Practice estimation** — Quick, reasonable numbers show experience
- **Communicate clearly** — Structure, trade-offs, and collaboration matter as much as technical depth
- **Stay calm** — There's no single "correct" answer; interviewers want to see how you think

The best preparation combines studying concepts, practicing designs, and doing mock interviews. Aim for breadth across many problems rather than perfect depth in one.
