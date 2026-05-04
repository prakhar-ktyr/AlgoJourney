---
title: What Are Distributed Systems
---

## What Are Distributed Systems?

In this lesson, you'll learn what distributed systems are, their key characteristics, common examples you use every day, and the different types and architectures that exist.

---

## Definitions

There are several well-known definitions of distributed systems. Let's look at the two most cited:

### Tanenbaum's Definition

> **"A distributed system is a collection of independent computers that appears to its users as a single coherent system."**
> — Andrew S. Tanenbaum, *Distributed Systems: Principles and Paradigms*

This definition emphasizes two key ideas:

1. **Independent computers** — Each machine (node) operates autonomously. It has its own processor, memory, and clock.
2. **Single coherent system** — Despite being physically separate, the system presents a unified interface to users. Users shouldn't need to know (or care) that multiple machines are involved.

### Lamport's Definition

> **"A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable."**
> — Leslie Lamport

This humorous but profound definition highlights the **hidden dependencies** in distributed systems. When you search on Google, your request may touch dozens of services across multiple data centers — a failure in any one of them could affect your experience.

### A Working Definition

For this course, we'll use this practical definition:

> A **distributed system** is a system whose components are located on different networked computers, which communicate and coordinate their actions by passing messages to one another to achieve a common goal.

---

## Key Characteristics

Every distributed system shares these fundamental characteristics:

### 1. Concurrency

Multiple components execute simultaneously. Unlike a single-threaded program where operations happen one at a time, distributed systems have many processes running in parallel across different machines.

```
Machine A:  ──Task1──►──Task3──►──Task5──►
Machine B:  ──Task2──►──Task4──►──────────►
Machine C:  ──Task6──►──Task7──►──Task8──►
                ▲
                │
         All running simultaneously
```

**Implication**: You must think about race conditions, concurrent access to shared resources, and ordering of operations.

### 2. No Global Clock

There is no single, perfectly synchronized clock that all nodes agree on. Each machine has its own local clock, and these clocks **drift** — they run at slightly different speeds.

```
Node A clock:  10:00:00.000
Node B clock:  10:00:00.023   ← 23ms ahead
Node C clock:   9:59:59.987   ← 13ms behind
```

**Implication**: You cannot rely on timestamps to determine the order of events across machines. This leads to the need for **logical clocks** (covered in Section 3).

### 3. Independent Failures

Components can fail independently. A network cable can be cut, a hard drive can crash, a process can run out of memory — and the rest of the system continues operating (or tries to).

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Node A  │     │  Node B  │     │  Node C  │
│  ✓ OK    │────►│  ✗ FAIL  │────►│  ✓ OK    │
└──────────┘     └──────────┘     └──────────┘
       │                                │
       └──────── still working ─────────┘
```

**Implication**: You must design for **partial failure** — the system should continue to function (perhaps in a degraded mode) even when some components fail.

### 4. Message Passing

Nodes communicate by sending messages over a network. Unlike threads in a single process that share memory, distributed nodes must explicitly send and receive data.

```python
# Node A sends a request
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(("node-b.example.com", 8080))
sock.send(b"GET /data HTTP/1.1\r\nHost: node-b\r\n\r\n")
response = sock.recv(4096)
```

**Implication**: Communication is **unreliable** (messages can be lost, delayed, duplicated, or reordered), **slow** (network latency), and **costly** (bandwidth is limited).

### 5. Heterogeneity

Nodes may differ in hardware, operating systems, programming languages, and network technologies. A distributed system must work across this diversity.

| Node | OS | Language | Hardware |
|------|----|----------|----------|
| Web Server | Linux | Go | 8-core, 32GB RAM |
| Database | Linux | C++ | 64-core, 512GB RAM, NVMe SSD |
| Cache | Linux | C | 4-core, 128GB RAM |
| Mobile Client | iOS | Swift | A15 chip, 6GB RAM |
| Browser Client | Windows | JavaScript | Various |

---

## Real-World Examples

You interact with distributed systems constantly. Here are some you probably used today:

### The Domain Name System (DNS)

DNS is one of the oldest and most successful distributed systems. It translates human-readable domain names into IP addresses.

```
You type: www.google.com

Your computer ──► Local DNS Resolver
                       │
                       ▼
                 Root DNS Server (.)
                       │
                       ▼
                 TLD DNS Server (.com)
                       │
                       ▼
                 Authoritative DNS (google.com)
                       │
                       ▼
                 Answer: 142.250.80.46
```

**Key distributed properties**:
- Hierarchical partitioning of the namespace
- Replication (multiple DNS servers per zone)
- Caching at every level
- No single point of failure

### The World Wide Web

The web itself is a massive distributed system:

- **Web servers** host content across millions of machines worldwide
- **CDNs** (Content Delivery Networks) cache content at edge locations
- **Browsers** act as clients that fetch and render content
- **Load balancers** distribute traffic across server pools

### Email Systems

Email involves multiple distributed protocols and servers:

```
Sender ──► Sender's Mail Server (SMTP)
                    │
                    ▼
           Recipient's Mail Server (SMTP)
                    │
                    ▼
           Recipient reads via IMAP/POP3
```

### Content Delivery Networks (CDNs)

CDNs like Cloudflare, Akamai, and AWS CloudFront distribute content to **edge servers** close to users:

```
                    Origin Server
                    (New York)
                   /    |    \
                  /     |     \
                 ▼      ▼      ▼
            Edge     Edge     Edge
           (London) (Tokyo) (Sydney)
              │       │        │
              ▼       ▼        ▼
           Users    Users    Users
           in EU   in Asia  in AU
```

**Benefit**: A user in Tokyo gets content from a nearby edge server (~20ms) instead of the origin in New York (~200ms).

### Blockchain Networks

Blockchain is a peer-to-peer distributed system where:

- Every node holds a copy of the entire ledger
- Consensus protocols ensure all copies agree
- No central authority controls the network

### Multiplayer Online Games

Games like Fortnite or World of Warcraft are distributed systems:

- **Game servers** simulate the world state
- **Clients** render and send player input
- **Matchmaking services** pair players together
- **Challenges**: Low latency requirements (<50ms), consistency of game state, cheating prevention

---

## Centralized vs Decentralized vs Distributed

These terms are often confused. Let's clarify:

### Centralized

A **centralized** system has a single point of control. All clients connect to one server (or a cluster acting as one logical server).

```
     Client A ──┐
                 │
     Client B ──►  Central Server
                 │
     Client C ──┘
```

**Examples**: Traditional databases, mainframe computing
**Pros**: Simple to manage, strong consistency easy to achieve
**Cons**: Single point of failure, scalability bottleneck

### Decentralized

A **decentralized** system has multiple points of control, but each sub-system may be centralized internally.

```
     ┌─────────┐         ┌─────────┐
     │ Server 1 │         │ Server 2 │
     │  ┌───┐  │         │  ┌───┐  │
     │  │DB │  │◄───────►│  │DB │  │
     │  └───┘  │         │  └───┘  │
     └────┬────┘         └────┬────┘
       ▲    ▲               ▲    ▲
      C1   C2              C3   C4
```

**Examples**: Email (each organization runs its own mail server), federated social networks (Mastodon)
**Pros**: No single point of failure at the top level, autonomy
**Cons**: Coordination between sub-systems is complex

### Distributed

A **distributed** system has no central control at all. All nodes are equal peers that cooperate.

```
     Node A ◄──────► Node B
       ▲  ╲              ▲
       │    ╲             │
       │     ╲            │
       ▼      ╲           ▼
     Node D ◄──╲──► Node C
                ╲
                 ► Node E
```

**Examples**: BitTorrent, Bitcoin, distributed hash tables
**Pros**: Maximum fault tolerance, no single point of failure, censorship resistant
**Cons**: Hardest to build, weakest consistency guarantees, coordination overhead

### Comparison Table

| Property | Centralized | Decentralized | Distributed |
|----------|------------|---------------|-------------|
| Control | Single authority | Multiple authorities | No authority |
| Failure tolerance | Low | Medium | High |
| Scalability | Limited | Moderate | High |
| Consistency | Easy (strong) | Moderate | Hard (eventual) |
| Complexity | Low | Medium | High |
| Examples | Traditional DB | Email, DNS | BitTorrent, Bitcoin |

---

## Types of Distributed Systems

### Client-Server Architecture

The most common distributed architecture. **Clients** request services; **servers** provide them.

```
┌──────────┐     Request      ┌──────────┐
│  Client  │ ───────────────► │  Server  │
│ (Browser)│ ◄─────────────── │  (API)   │
└──────────┘     Response     └──────────┘
```

**Characteristics**:
- Clear role separation
- Server is the authority on data
- Clients are typically stateless
- Server can become a bottleneck

**Modern variants**:
- **Multi-tier**: Client → Web Server → Application Server → Database
- **Microservices**: Client → API Gateway → Many small services

```
Client ──► API Gateway ──┬──► User Service
                         ├──► Order Service
                         ├──► Payment Service
                         └──► Notification Service
```

### Peer-to-Peer (P2P) Architecture

Every node is both a client and a server. Nodes cooperate to provide a service without any central coordination.

```
     ┌──────┐
     │Peer A│◄────────►┌──────┐
     └──┬───┘          │Peer B│
        │              └──┬───┘
        │                 │
        ▼                 ▼
     ┌──────┐          ┌──────┐
     │Peer C│◄────────►│Peer D│
     └──────┘          └──────┘
```

**Characteristics**:
- No central server
- Each peer contributes resources (bandwidth, storage, compute)
- Highly fault-tolerant
- Challenging to maintain consistency

**Examples**:
- **BitTorrent** — File sharing
- **Bitcoin** — Cryptocurrency
- **IPFS** — InterPlanetary File System
- **WebRTC** — Real-time browser communication

### Hybrid Architecture

Combines client-server and P2P elements. A central server handles coordination while peers communicate directly for data transfer.

```
     ┌─────────────────┐
     │  Central Server  │  ← Coordination only
     │  (Directory)     │
     └───┬─────────┬───┘
         │         │
         ▼         ▼
     ┌──────┐  ┌──────┐
     │Peer A│◄─┤Peer B│  ← Direct data transfer
     └──────┘  └──────┘
```

**Examples**:
- **Skype** (original architecture) — Central login server, P2P voice/video
- **Spotify** (original) — Central index, P2P streaming
- **Online gaming** — Matchmaking server, P2P gameplay

---

## Distribution Transparency

A key goal of distributed systems is **transparency** — hiding the distributed nature from users and applications. The ISO Reference Model defines several types:

### Access Transparency

Hide differences in data representation and access methods. A user accesses data the same way regardless of whether it's local or remote.

```python
# The user doesn't need to know where the file is stored
file_content = storage.read("reports/quarterly.pdf")
# Could be local disk, NFS mount, S3, or Google Cloud Storage
```

### Location Transparency

Hide the physical location of resources. Users reference resources by logical names, not network addresses.

```
# Location transparent (good)
https://api.example.com/users/123

# NOT location transparent (bad)
http://192.168.1.42:8080/users/123
```

### Migration Transparency

Resources can be moved to new locations without affecting how they are accessed.

```
Before migration:  File on Server A → User accesses via /shared/report.pdf
After migration:   File on Server B → User still accesses via /shared/report.pdf
```

### Replication Transparency

Hide the fact that multiple copies of a resource exist. The system manages replicas automatically.

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Replica 1│     │ Replica 2│     │ Replica 3│
│  (US)    │     │  (EU)    │     │  (Asia)  │
└──────────┘     └──────────┘     └──────────┘
       ▲                ▲                ▲
       └────────────────┼────────────────┘
                        │
              User sees ONE database
```

### Concurrency Transparency

Multiple users can access the same resource concurrently without interfering with each other.

```python
# Two users update the same bank account simultaneously
# Concurrency transparency ensures correctness

# User A: transfer $100 out
# User B: transfer $50 in
# Final balance must reflect both operations correctly
```

### Failure Transparency

Hide the occurrence and recovery from failures. If a server crashes and restarts, the user shouldn't notice.

```
Request ──► Load Balancer ──► Server 1 (crashed!)
                          └──► Server 2 (handles request)
                               │
                               ▼
                          Response (user never knew)
```

### Summary of Transparency Types

| Type | What It Hides | Example |
|------|--------------|---------|
| Access | How a resource is accessed | Local vs remote file access |
| Location | Where a resource is located | DNS, URL routing |
| Migration | That a resource has moved | VM live migration |
| Replication | That copies exist | Replicated databases |
| Concurrency | That others are using it | Database transactions |
| Failure | That something failed | Automatic failover |

---

## Advantages of Distributed Systems

| Advantage | Description |
|-----------|-------------|
| **Scalability** | Add more machines to handle more load (horizontal scaling) |
| **Fault tolerance** | System continues working despite individual node failures |
| **Low latency** | Place servers close to users geographically |
| **Resource sharing** | Pool CPU, storage, and bandwidth across many machines |
| **Modularity** | Independent services can be developed, deployed, and scaled separately |
| **Cost efficiency** | Many commodity machines can be cheaper than one supercomputer |

---

## Challenges of Distributed Systems

| Challenge | Description |
|-----------|-------------|
| **Partial failure** | Some components fail while others keep running — hard to detect and handle |
| **No global clock** | Ordering events across machines requires special protocols |
| **Network unreliability** | Messages can be lost, delayed, duplicated, or reordered |
| **Consistency** | Keeping data in sync across replicas is fundamentally hard |
| **Security** | More network communication means more attack surface |
| **Debugging** | Reproducing bugs is difficult when behavior depends on timing and network conditions |
| **Complexity** | Much harder to design, test, and operate than single-machine systems |

### The Complexity Cost

A simple operation on a single machine becomes much harder in a distributed setting:

```python
# Single machine — simple!
counter = counter + 1

# Distributed system — what could go wrong?
# 1. Read counter from Node A → got value 5
# 2. Network delay...
# 3. Meanwhile, Node B also reads counter → got value 5
# 4. Node A writes counter = 6
# 5. Node B writes counter = 6
# 6. WRONG! Should be 7 (both incremented)
```

This is the **lost update** problem, and solving it requires distributed locking, consensus protocols, or conflict-free data structures — all of which add complexity.

---

## Try It Yourself

### Exercise 1: Identify the Distributed System

For each of the following, determine: Is it a distributed system? If so, what type (client-server, P2P, hybrid)?

1. A single-player game running on your laptop
2. Google Search
3. BitTorrent downloading a movie
4. A PostgreSQL database on one server
5. Netflix streaming a video
6. A blockchain network

<details>
<summary>Click to see answers</summary>

1. **Not distributed** — Single machine, single process
2. **Distributed (client-server)** — Your browser (client) talks to Google's servers, which involve many internal services
3. **Distributed (P2P)** — Peers share file pieces directly with each other
4. **Not distributed** — Single server (though it could be part of a distributed system)
5. **Distributed (hybrid)** — Central catalog/control, CDN edge servers for content delivery
6. **Distributed (P2P)** — All nodes are equal participants maintaining the ledger

</details>

### Exercise 2: Transparency Analysis

Think about your email system (e.g., Gmail). Which types of transparency does it provide?

<details>
<summary>Click to see answers</summary>

- **Access transparency**: ✓ You access email the same way whether it's on Google's US servers or EU servers
- **Location transparency**: ✓ You use `gmail.com` — you don't know which data center serves you
- **Replication transparency**: ✓ Your emails are replicated across data centers, but you see only one inbox
- **Failure transparency**: ✓ If one server fails, another takes over (usually seamlessly)
- **Concurrency transparency**: ✓ Multiple devices can access your inbox simultaneously
- **Migration transparency**: ✓ Google can move your data between servers without you noticing

</details>

### Exercise 3: Design Thinking

Imagine you're building a chat application for 1 million users. Sketch (on paper or mentally) the architecture:

- Where do messages get stored?
- How do you deliver messages in real-time?
- What happens when the server storing a user's messages crashes?
- How do you scale when you grow to 100 million users?

There's no single right answer — this exercise is about thinking through the challenges.

---

## A Brief History

| Year | Milestone |
|------|-----------|
| 1969 | ARPANET — first packet-switched network (4 nodes) |
| 1971 | First email sent over ARPANET |
| 1973 | Ethernet invented at Xerox PARC |
| 1978 | Lamport's "Time, Clocks, and the Ordering of Events" paper |
| 1982 | Byzantine Generals Problem formulated |
| 1983 | DNS introduced |
| 1985 | Paxos consensus algorithm (published 1998) |
| 1989 | World Wide Web invented by Tim Berners-Lee |
| 1999 | Napster — P2P file sharing goes mainstream |
| 2003 | Google File System (GFS) paper |
| 2004 | MapReduce paper |
| 2006 | Amazon Dynamo paper; AWS launches |
| 2007 | Hadoop released |
| 2009 | Bitcoin whitepaper; Raft consensus algorithm |
| 2012 | Google Spanner paper (globally distributed DB) |
| 2014 | Kubernetes released |
| 2020s | Edge computing, serverless, distributed AI training |

---

## Key Takeaways

- A **distributed system** is a collection of networked computers that coordinate by passing messages to achieve a common goal
- Key characteristics: **concurrency**, **no global clock**, **independent failures**, **message passing**, and **heterogeneity**
- Real-world examples include DNS, the web, email, CDNs, blockchain, and multiplayer games
- Systems can be **centralized** (single control), **decentralized** (multiple control points), or **distributed** (no central control)
- The main architectures are **client-server**, **peer-to-peer**, and **hybrid**
- **Transparency** means hiding the distributed nature from users (access, location, replication, failure, etc.)
- Distributed systems offer **scalability**, **fault tolerance**, and **low latency** but introduce **complexity**, **partial failures**, and **consistency challenges**
- In the next lesson, we'll explore **why** distributed systems are necessary and the fundamental scaling laws that drive their design
