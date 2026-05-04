---
title: Distributed Systems
---

## Welcome to Distributed Systems

Welcome to the **Distributed Systems** course! This comprehensive guide will take you from the fundamentals of distributed computing to advanced topics like consensus protocols, distributed storage, and fault tolerance.

Distributed systems are the backbone of modern computing. Every time you search on Google, stream a video on Netflix, send a message on WhatsApp, or make a purchase on Amazon, you're interacting with a distributed system. Understanding how these systems work is essential for any software engineer building scalable, reliable applications.

---

## What You'll Learn

This course covers the full breadth of distributed systems theory and practice, organized into **9 sections**:

### Course Outline

| Section | Topic | Description |
|---------|-------|-------------|
| 1 | **Foundations** | What distributed systems are, why they matter, fallacies, and system models |
| 2 | **Communication** | RPC, message passing, serialization, HTTP, gRPC, and message queues |
| 3 | **Time & Ordering** | Physical clocks, logical clocks, vector clocks, and happens-before |
| 4 | **Consistency & Replication** | Strong consistency, eventual consistency, CAP theorem, CRDTs |
| 5 | **Consensus** | Paxos, Raft, Byzantine fault tolerance, leader election |
| 6 | **Distributed Storage** | Partitioning, sharding, DHTs, distributed databases, file systems |
| 7 | **Distributed Computing** | MapReduce, stream processing, coordination services, scheduling |
| 8 | **Fault Tolerance** | Failure detection, replication strategies, recovery, chaos engineering |
| 9 | **Advanced Topics** | Microservices, blockchain, edge computing, CRDTs, formal verification |

---

## Why Study Distributed Systems?

Distributed systems are everywhere. Here's why understanding them is critical:

- **Scale demands it** — No single machine can handle billions of requests per day. Companies like Google, Amazon, and Meta operate millions of servers working together.
- **Reliability requires it** — Users expect 99.99% uptime. Achieving this means designing systems that tolerate hardware failures, network partitions, and software bugs.
- **Performance expectations** — Users expect sub-second response times regardless of their location. Distributed caching, CDNs, and geo-replicated databases make this possible.
- **Career growth** — Distributed systems knowledge is highly valued in software engineering interviews and senior engineering roles.
- **Intellectual depth** — The field combines networking, operating systems, databases, algorithms, and formal methods into a rich and challenging discipline.

### Industry Demand

```
┌─────────────────────────────────────────────────────┐
│          Where Distributed Systems Are Used          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Cloud Computing ████████████████████████████  95%   │
│  Web Services    ███████████████████████████   90%   │
│  Databases       ██████████████████████████    85%   │
│  AI/ML Pipelines ████████████████████████      80%   │
│  IoT             ██████████████████████        70%   │
│  Gaming          ████████████████████          65%   │
│  Finance         ████████████████████          65%   │
│  Healthcare      ██████████████████            60%   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before starting this course, you should have:

### Required Knowledge

- **Basic programming** — Familiarity with at least one programming language (Python, Java, Go, or similar). Code examples in this course use Python and Java.
- **Networking basics** — Understanding of TCP/IP, HTTP, DNS, and client-server architecture.
- **Operating systems fundamentals** — Processes, threads, concurrency, and basic I/O.

### Helpful but Not Required

- **Database basics** — SQL, CRUD operations, and basic database concepts.
- **Data structures and algorithms** — Hash tables, trees, graphs, and complexity analysis.
- **Command-line comfort** — Ability to run programs from a terminal.

### Self-Check: Are You Ready?

Answer these questions to gauge your readiness:

| Question | Expected Answer |
|----------|----------------|
| What does HTTP stand for? | HyperText Transfer Protocol |
| What is a process vs a thread? | A process is an independent execution unit; threads share memory within a process |
| What is TCP vs UDP? | TCP is reliable/ordered; UDP is unreliable/unordered but faster |
| What is a hash table? | A data structure mapping keys to values with O(1) average lookup |
| Can you write a simple client-server program? | Yes — using sockets or HTTP libraries |

If you can answer most of these, you're ready to begin!

---

## How to Use This Course

### Learning Path

This course is designed to be followed **sequentially**. Each section builds on concepts from previous sections:

```
Foundations ──► Communication ──► Time & Ordering
                                        │
                                        ▼
        Distributed Computing ◄── Consistency & Replication
                │                       │
                ▼                       ▼
        Fault Tolerance ◄──────── Consensus
                │
                ▼
        Advanced Topics
```

### Each Lesson Includes

- **Clear explanations** with real-world analogies
- **Diagrams and tables** to visualize complex concepts
- **Code examples** in Python and Java
- **"Try It Yourself" exercises** to reinforce learning
- **Key takeaways** summarizing the most important points

### Study Tips

1. **Read actively** — Don't just skim. Pause and think about each concept.
2. **Draw diagrams** — Distributed systems are visual. Sketch network topologies, message flows, and state diagrams.
3. **Build small projects** — Implement a simple key-value store, a chat system, or a basic consensus protocol.
4. **Discuss with peers** — Distributed systems have many subtleties. Discussing helps solidify understanding.
5. **Revisit fundamentals** — When confused by an advanced topic, go back to the foundations.

---

## Section 1: Foundations

The first section (where you are now) covers the essential groundwork:

| Lesson | Title | What You'll Learn |
|--------|-------|-------------------|
| 1 | Distributed Systems (Home) | Course overview, structure, and prerequisites |
| 2 | What Are Distributed Systems | Definitions, characteristics, types, and examples |
| 3 | Why Distributed Systems | Motivation, scaling laws, trade-offs |
| 4 | Fallacies of Distributed Computing | The 8 fallacies every engineer must know |
| 5 | System Models and Properties | Synchronous vs async models, failure modes, impossibility results |

---

## Section 2: Communication

How do nodes in a distributed system talk to each other?

| Lesson | Title | What You'll Learn |
|--------|-------|-------------------|
| 6 | Remote Procedure Calls (RPC) | RPC semantics, stubs, marshalling, gRPC |
| 7 | Message Passing | Synchronous vs asynchronous, message queues |
| 8 | Serialization & Protocols | JSON, Protocol Buffers, Avro, Thrift |
| 9 | Communication Patterns | Request-reply, publish-subscribe, gossip protocols |

---

## Section 3: Time & Ordering

One of the deepest challenges in distributed systems — how do you order events when there's no global clock?

| Lesson | Title | What You'll Learn |
|--------|-------|-------------------|
| 10 | Physical Time & Clock Sync | NTP, GPS clocks, clock drift, clock skew |
| 11 | Logical Clocks | Lamport clocks, happens-before relation |
| 12 | Vector Clocks | Detecting causality and concurrency |
| 13 | Hybrid Clocks & Ordering | HLC, TrueTime, total ordering in practice |

---

## Section 4: Consistency & Replication

When data is copied across multiple nodes, how do you keep it consistent?

| Lesson | Title | What You'll Learn |
|--------|-------|-------------------|
| 14 | Replication Strategies | Single-leader, multi-leader, leaderless |
| 15 | Consistency Models | Strong, sequential, causal, eventual |
| 16 | The CAP Theorem | Consistency, availability, partition tolerance |
| 17 | Consistency in Practice | Quorum reads/writes, read-your-writes, CRDTs |

---

## Section 5: Consensus

How do multiple nodes agree on a single value — even when some nodes fail?

| Lesson | Title | What You'll Learn |
|--------|-------|-------------------|
| 18 | The Consensus Problem | Definition, requirements, impossibility results |
| 19 | Paxos | Proposers, acceptors, learners, multi-Paxos |
| 20 | Raft | Leader election, log replication, safety |
| 21 | Byzantine Fault Tolerance | PBFT, blockchain consensus, Tendermint |

---

## Section 6: Distributed Storage

How do you store and retrieve data efficiently across many machines?

| Lesson | Title | What You'll Learn |
|--------|-------|-------------------|
| 22 | Partitioning & Sharding | Range, hash, consistent hashing |
| 23 | Distributed Hash Tables | Chord, Kademlia, BitTorrent DHT |
| 24 | Distributed Databases | Spanner, CockroachDB, Cassandra, DynamoDB |
| 25 | Distributed File Systems | GFS, HDFS, object storage (S3) |

---

## Section 7: Distributed Computing

How do you process massive amounts of data across a cluster?

| Lesson | Title | What You'll Learn |
|--------|-------|-------------------|
| 26 | MapReduce | Map, shuffle, reduce, Hadoop |
| 27 | Stream Processing | Kafka Streams, Flink, event-driven architecture |
| 28 | Coordination Services | ZooKeeper, etcd, distributed locking |
| 29 | Task Scheduling | Borg, Kubernetes, Mesos, resource management |

---

## Section 8: Fault Tolerance

How do you build systems that keep working when things go wrong?

| Lesson | Title | What You'll Learn |
|--------|-------|-------------------|
| 30 | Failure Detection | Heartbeats, Phi accrual detector, SWIM |
| 31 | Replication for Fault Tolerance | Chain replication, state machine replication |
| 32 | Recovery & Checkpointing | Write-ahead logs, snapshots, log compaction |
| 33 | Testing Resilience | Chaos engineering, fault injection, Jepsen |

---

## Section 9: Advanced Topics

Cutting-edge topics and real-world system design:

| Lesson | Title | What You'll Learn |
|--------|-------|-------------------|
| 34 | Microservices Architecture | Service mesh, API gateways, circuit breakers |
| 35 | Blockchain & Decentralized Systems | Consensus in open networks, smart contracts |
| 36 | Edge Computing & CDNs | Caching, geo-distribution, latency optimization |
| 37 | Formal Methods | TLA+, model checking, verifying distributed protocols |

---

## A Note on Complexity

Distributed systems are inherently complex. Leslie Lamport, one of the pioneers of the field, famously said:

> **"A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable."**

This course will help you understand **why** distributed systems are hard and give you the tools to design, build, and debug them effectively.

---

## The Mathematics You'll Encounter

Some lessons include mathematical notation. Here's a preview of the kinds of math you'll see:

- **Probability**: The probability of $k$ independent failures in $n$ nodes is $P(k) = \binom{n}{k} p^k (1-p)^{n-k}$

- **Latency percentiles**: If the 99th percentile latency is $p_{99} = 200\text{ms}$, then 99% of requests complete within 200ms.

- **Scaling**: If a system handles $T$ throughput with 1 node, ideal linear scaling gives $T \times N$ with $N$ nodes, but real scaling follows:

$$S(N) = \frac{N}{1 + \sigma(N - 1) + \kappa N(N - 1)}$$

where $\sigma$ is the serialization fraction and $\kappa$ is the coherence penalty (Universal Scalability Law).

Don't worry if this looks intimidating — each formula will be explained step by step when it appears!

---

## Tools & Technologies Referenced

Throughout this course, you'll encounter references to real-world systems and tools:

| Category | Tools & Systems |
|----------|----------------|
| **Message Queues** | Apache Kafka, RabbitMQ, Amazon SQS |
| **Databases** | Cassandra, DynamoDB, CockroachDB, Spanner |
| **Coordination** | ZooKeeper, etcd, Consul |
| **Computing** | Hadoop, Spark, Flink, Kubernetes |
| **RPC Frameworks** | gRPC, Thrift, JSON-RPC |
| **Monitoring** | Prometheus, Jaeger, Zipkin |
| **Testing** | Jepsen, Chaos Monkey, Toxiproxy |

---

## Let's Get Started!

You're about to embark on a journey through one of the most fascinating and practical areas of computer science. Distributed systems are challenging, but mastering them will make you a significantly stronger engineer.

**Start with the next lesson: "What Are Distributed Systems"** to learn the fundamental definitions and characteristics that define this field.

---

## Key Takeaways

- Distributed systems power virtually all modern internet services
- This course covers **9 sections** from foundations to advanced topics
- Prerequisites: basic programming, networking, and OS fundamentals
- Follow the lessons **sequentially** for the best learning experience
- Each lesson includes explanations, code examples, exercises, and key takeaways
- The field is challenging but deeply rewarding — let's begin!
