---
title: "Causal Ordering"
---

# Causal Ordering

Causal ordering is one of the most important concepts in distributed systems. It captures the intuition that **some events influence other events**, and a correct system must respect those influences.

In this lesson, you will learn the different ordering guarantees — FIFO, causal, and total — and how to implement causal ordering using vector clocks and causal broadcast algorithms.

---

## Why Ordering Matters

In a centralized system, every event happens on one machine with a single clock. The order is obvious. In a distributed system, **there is no global clock**, so we must carefully define what "order" means.

Consider a simple chat application with three users — Alice, Bob, and Carol — on different servers:

```
Alice:  "Does anyone know a good pizza place?"
Bob:    "Try Mario's on 5th Street!"
Carol:  "Thanks, I'll check it out!"
```

Carol's reply only makes sense **after** Bob's suggestion. If Carol's message arrives before Bob's, the conversation looks nonsensical. This is the problem causal ordering solves.

---

## Three Kinds of Ordering

Distributed systems define three progressively stronger ordering guarantees:

| Property | Guarantee | Strength |
|----------|-----------|----------|
| **FIFO Order** | Messages from the *same* sender arrive in send order | Weakest |
| **Causal Order** | If event $a$ causally precedes event $b$, then $a$ is delivered before $b$ | Medium |
| **Total Order** | All processes deliver *all* messages in the *same* global order | Strongest |

### FIFO Order

FIFO (First-In, First-Out) ordering guarantees that messages sent by a **single process** are delivered in the order they were sent.

```
Process P1 sends: m1, m2, m3
Process P2 receives: m1, m2, m3  ✓  (FIFO preserved)
Process P2 receives: m1, m3, m2  ✗  (FIFO violated)
```

FIFO says nothing about the relative order of messages from **different** senders. TCP provides FIFO ordering per connection, but not across connections.

### Causal Order

Causal ordering extends FIFO by also ordering messages across different senders when there is a **causal dependency**.

Formally, message $m_1$ causally precedes message $m_2$ (written $m_1 \rightarrow m_2$) if:

1. **Same process**: $m_1$ and $m_2$ are sent by the same process, and $m_1$ is sent before $m_2$
2. **Message receipt**: $m_1$ is received by a process before that process sends $m_2$
3. **Transitivity**: There exists $m_3$ such that $m_1 \rightarrow m_3$ and $m_3 \rightarrow m_2$

> **Key insight:** Causal order is strictly stronger than FIFO order. Every causally ordered delivery is also FIFO ordered, but not vice versa.

### Total Order

Total ordering guarantees that **all processes deliver all messages in exactly the same order**. This is the strongest guarantee and is required for protocols like state machine replication.

If processes $P_1$ and $P_2$ both deliver messages $m_a$ and $m_b$, then either both deliver $m_a$ before $m_b$, or both deliver $m_b$ before $m_a$.

---

## The Happened-Before Relation

Leslie Lamport's **happened-before** relation ($\rightarrow$) formalizes causality. For events $a$ and $b$:

$$
a \rightarrow b \iff \text{event } a \text{ could have influenced event } b
$$

Two events are **concurrent** (written $a \| b$) if neither causally precedes the other:

$$
a \| b \iff \neg(a \rightarrow b) \land \neg(b \rightarrow a)
$$

Concurrent events have no causal relationship — the system is free to deliver them in any order.

---

## Causal Ordering: The Social Media Example

Consider a social media platform with three users on different servers:

```
Time →

Server A (Alice):   Post("Is Python good for ML?")
                          |
                          v
Server B (Bob):     [receives Alice's post]
                    Reply("Yes! Use scikit-learn.")
                          |
                          v
Server C (Carol):   [receives Bob's reply]
                    Reply("I prefer PyTorch actually.")
```

**Without causal ordering**, Carol might see:

```
Carol's Reply: "I prefer PyTorch actually."
Alice's Post:  "Is Python good for ML?"
Bob's Reply:   "Yes! Use scikit-learn."
```

This is confusing — Carol's reply appears before the message she is replying to.

**With causal ordering**, every user sees:

```
Alice's Post:  "Is Python good for ML?"
Bob's Reply:   "Yes! Use scikit-learn."
Carol's Reply: "I prefer PyTorch actually."
```

The causal chain Alice → Bob → Carol is preserved everywhere.

---

## Vector Clocks Recap

Causal ordering relies on **vector clocks** to track causality. Each process $P_i$ in a system of $n$ processes maintains a vector clock $VC_i[0..n-1]$:

- $VC_i[i]$ = number of events process $i$ has executed
- $VC_i[j]$ = the latest event count of process $j$ that process $i$ knows about

**Rules:**

1. **Local event**: $VC_i[i] \leftarrow VC_i[i] + 1$
2. **Send message**: increment $VC_i[i]$, attach $VC_i$ to the message
3. **Receive message** with timestamp $VC_{msg}$: $VC_i[j] \leftarrow \max(VC_i[j], VC_{msg}[j])$ for all $j$, then increment $VC_i[i]$

**Comparison:**

$$
VC_a \leq VC_b \iff \forall k: VC_a[k] \leq VC_b[k]
$$

$$
VC_a < VC_b \iff VC_a \leq VC_b \land \exists k: VC_a[k] < VC_b[k]
$$

If $VC_a < VC_b$, then event $a$ causally precedes event $b$.

---

## Causal Broadcast Algorithm

Causal broadcast ensures that if a process delivers message $m_2$ and $m_1 \rightarrow m_2$, then the process has already delivered $m_1$.

### Algorithm Using Vector Clocks

Each process $P_i$ maintains:

- A vector clock $VC_i[0..n-1]$, initialized to all zeros
- A **delivery queue** (buffer) for messages waiting to be delivered

```
=== Process Pi: Causal Broadcast ===

on broadcast(m):
    VC_i[i] ← VC_i[i] + 1
    send (m, VC_i) to all processes (including self)

on receive(m, VC_msg) from Pj:
    place (m, VC_msg, j) in delivery queue
    check_delivery_queue()

procedure check_delivery_queue():
    while ∃ (m, VC_msg, j) in queue such that:
        VC_msg[j] == VC_i[j] + 1          // next expected from Pj
        AND
        ∀ k ≠ j: VC_msg[k] ≤ VC_i[k]     // seen all causal deps
    do:
        deliver(m)
        VC_i[j] ← VC_i[j] + 1
        remove (m, VC_msg, j) from queue
```

### Delivery Condition Explained

A message $(m, VC_{msg})$ from process $P_j$ is **deliverable** at $P_i$ when:

| Condition | Meaning |
|-----------|---------|
| $VC_{msg}[j] = VC_i[j] + 1$ | This is the next message expected from $P_j$ (FIFO from $P_j$) |
| $\forall k \neq j: VC_{msg}[k] \leq VC_i[k]$ | All messages that $P_j$ delivered before sending $m$ have also been delivered at $P_i$ |

Together, these two conditions guarantee causal delivery.

---

## Worked Example

Three processes $P_0$, $P_1$, $P_2$ with vector clocks initialized to $[0, 0, 0]$:

```
Step 1: P0 broadcasts m1
        P0: VC = [1, 0, 0]
        m1 carries timestamp [1, 0, 0]

Step 2: P1 receives m1 from P0
        Check: VC_msg[0]=1 == VC_1[0]+1=1 ✓
               VC_msg[1]=0 ≤ VC_1[1]=0  ✓
               VC_msg[2]=0 ≤ VC_1[2]=0  ✓
        Deliver m1. P1: VC = [1, 0, 0]

Step 3: P1 broadcasts m2
        P1: VC = [1, 1, 0]
        m2 carries timestamp [1, 1, 0]

Step 4: P2 receives m2 from P1 (m1 not yet received!)
        Check: VC_msg[1]=1 == VC_2[1]+1=1 ✓
               VC_msg[0]=1 ≤ VC_2[0]=0  ✗  ← BLOCKED
        m2 is buffered. P2 waits.

Step 5: P2 receives m1 from P0
        Check: VC_msg[0]=1 == VC_2[0]+1=1 ✓
               VC_msg[1]=0 ≤ VC_2[1]=0  ✓
               VC_msg[2]=0 ≤ VC_2[2]=0  ✓
        Deliver m1. P2: VC = [1, 0, 0]
        Re-check queue → m2 now deliverable!
        Deliver m2. P2: VC = [1, 1, 0]
```

**Result:** Even though $P_2$ received $m_2$ before $m_1$, causal ordering ensured $m_1$ was delivered first because $m_1 \rightarrow m_2$.

---

## ISIS/ABCAST: Total Order Broadcast

While causal broadcast orders only causally related messages, **total order broadcast** (also called atomic broadcast) ensures all processes deliver messages in the **exact same order**, even for concurrent messages.

### The ISIS Algorithm (ABCAST)

The ISIS system (developed at Cornell by Ken Birman) uses an **agreement protocol** to assign sequence numbers:

```
=== ISIS Total Order Broadcast ===

Sender S wants to broadcast message m:
  1. S sends m to all processes in the group
  2. Each process Pi:
     a. Proposes a sequence number:
        proposed_seq = max(agreed_seq, proposed_seq) + 1
     b. Sends proposed_seq back to S
     c. Buffers m, marked as "undeliverable"
  3. S collects all proposed sequence numbers
  4. S computes: agreed_seq = max(all proposed_seq)
  5. S sends agreed_seq to all processes
  6. Each process Pi:
     a. Updates m's sequence number to agreed_seq
     b. Re-sorts delivery queue by sequence number
     c. Delivers all consecutive deliverable messages
```

### Properties of ISIS/ABCAST

| Property | Guaranteed? |
|----------|-------------|
| Total Order | Yes — all processes use the same agreed sequence numbers |
| Causal Order | Yes — if integrated with vector clocks |
| FIFO Order | Yes — subsumed by total order |
| Fault Tolerance | Requires additional view-change protocol |

### Cost Analysis

$$
\text{Messages per broadcast} = 3(n - 1)
$$

- Phase 1: Sender → all ($n - 1$ messages)
- Phase 2: All → sender ($n - 1$ proposals)
- Phase 3: Sender → all ($n - 1$ agreements)

This is more expensive than causal broadcast (which needs only $n - 1$ messages) but provides a stronger guarantee.

---

## Causal Consistency Model

Causal consistency is a **consistency model** for distributed data stores. It guarantees:

> If operation $a$ causally precedes operation $b$, then every process observes $a$ before $b$.

### Formal Definition

A data store is **causally consistent** if it satisfies:

$$
\text{If } W(x, v_1) \rightarrow W(x, v_2), \text{ then no process reads } v_1 \text{ after reading } v_2
$$

### Causal Consistency vs Other Models

| Model | Strength | Description |
|-------|----------|-------------|
| **Linearizability** | Strongest | Real-time order preserved; behaves like a single copy |
| **Sequential Consistency** | Strong | All processes see the same total order (may not match real time) |
| **Causal Consistency** | Medium | Only causally related operations are ordered |
| **Eventual Consistency** | Weakest | All replicas converge eventually; no ordering guarantee |

### Why Causal Consistency?

Causal consistency is attractive because:

1. **It is achievable without coordination** — unlike linearizability, which requires consensus
2. **It matches user expectations** — responses appear after the messages they respond to
3. **It allows high availability** — by the CAP theorem, it does not sacrifice availability during partitions (it is not a "strong" consistency model)

---

## Implementing Causal Ordering in Practice

### Approach 1: Full Vector Clocks

Attach the full vector clock to every message. This is the textbook approach.

```python
class CausalBroadcast:
    def __init__(self, process_id, num_processes):
        self.id = process_id
        self.n = num_processes
        self.vc = [0] * num_processes  # vector clock
        self.buffer = []               # delivery queue

    def broadcast(self, message):
        self.vc[self.id] += 1
        packet = {
            "sender": self.id,
            "msg": message,
            "vc": self.vc.copy()
        }
        # Send packet to all processes
        for pid in range(self.n):
            self.send(pid, packet)

    def on_receive(self, packet):
        self.buffer.append(packet)
        self._try_deliver()

    def _can_deliver(self, packet):
        j = packet["sender"]
        vc_msg = packet["vc"]
        # Next expected from sender
        if vc_msg[j] != self.vc[j] + 1:
            return False
        # All causal dependencies met
        for k in range(self.n):
            if k != j and vc_msg[k] > self.vc[k]:
                return False
        return True

    def _try_deliver(self):
        delivered = True
        while delivered:
            delivered = False
            for packet in list(self.buffer):
                if self._can_deliver(packet):
                    self._deliver(packet)
                    self.buffer.remove(packet)
                    delivered = True

    def _deliver(self, packet):
        j = packet["sender"]
        self.vc[j] += 1
        print(f"Deliver: {packet['msg']}")
```

**Drawback**: Vector clock size grows as $O(n)$ where $n$ is the number of processes. For large systems, this overhead becomes significant.

### Approach 2: Causal History (Dependency Tracking)

Instead of a full vector clock, attach only the **set of message identifiers** that causally precede the current message.

```python
class DependencyTracker:
    def __init__(self, process_id):
        self.id = process_id
        self.delivered = set()  # set of delivered message IDs
        self.seq = 0
        self.buffer = []

    def broadcast(self, message):
        self.seq += 1
        msg_id = (self.id, self.seq)
        packet = {
            "id": msg_id,
            "msg": message,
            "deps": self.delivered.copy()
        }
        self.delivered.add(msg_id)
        # Send to all
        return packet

    def on_receive(self, packet):
        self.buffer.append(packet)
        self._try_deliver()

    def _try_deliver(self):
        delivered = True
        while delivered:
            delivered = False
            for pkt in list(self.buffer):
                if pkt["deps"].issubset(self.delivered):
                    self.delivered.add(pkt["id"])
                    self.buffer.remove(pkt)
                    print(f"Deliver: {pkt['msg']}")
                    delivered = True
```

**Trade-off**: The dependency set can grow unboundedly. In practice, systems **prune** dependencies that are known to be delivered everywhere (using protocol-level garbage collection).

### Approach 3: Causal Timestamps with Pruning

Real systems like **COPS** (Cluster of Order-Preserving Servers) track only the **nearest dependencies** — the most recent operation at each site that causally precedes the current one. This keeps metadata compact.

---

## Relationship to Vector Clocks

Vector clocks and causal ordering are deeply connected:

| Concept | Role |
|---------|------|
| **Vector Clocks** | The *mechanism* — a data structure that encodes the happened-before relation |
| **Causal Ordering** | The *property* — messages are delivered respecting the happened-before order |
| **Causal Broadcast** | The *algorithm* — uses vector clocks to buffer and deliver messages in causal order |
| **Causal Consistency** | The *guarantee* — a consistency model built on causal delivery |

The fundamental theorem connecting them:

$$
VC(a) < VC(b) \iff a \rightarrow b
$$

Vector clocks **perfectly capture** causality — unlike Lamport timestamps, which only give:

$$
a \rightarrow b \implies L(a) < L(b)
$$

The converse ($L(a) < L(b) \implies a \rightarrow b$) does **not** hold for Lamport timestamps.

---

## Real-World Systems Using Causal Ordering

| System | How It Uses Causality |
|--------|-----------------------|
| **COPS** (SOSP 2011) | Causal+ consistency for wide-area key-value stores; tracks nearest dependencies |
| **Eiger** (NSDI 2013) | Read-only and write-only causal transactions across data centers |
| **MongoDB** (v3.6+) | Causal sessions with causal consistency using Lamport timestamps + session tracking |
| **Riak** (Basho) | Vector clocks (later dotted version vectors) for conflict detection |
| **Kafka** | Per-partition FIFO; causal ordering across partitions requires application-level tracking |
| **ZooKeeper** | Total order via Zab protocol; causal order is a byproduct |
| **ISIS / Horus** | Pioneered ABCAST (total order) and CBCAST (causal broadcast) |
| **SwiftCloud** | Causal consistency with client-side caching for geo-replication |

### MongoDB Causal Sessions

MongoDB provides **causal consistency** within a client session:

```javascript
// MongoDB causal session example
const session = client.startSession({ causalConsistency: true });
const coll = client.db("app").collection("posts");

// Write
await coll.insertOne(
  { text: "Hello!", author: "Alice" },
  { session }
);

// Subsequent read in same session sees the write
const post = await coll.findOne(
  { author: "Alice" },
  { session }
);
// post is guaranteed to reflect the insertOne above
```

MongoDB tracks an **operation time** and **cluster time** for each session. A read in a causal session waits until the server has applied all operations up to the session's last write time.

---

## FIFO vs Causal vs Total Order: Comparison

| Aspect | FIFO | Causal | Total |
|--------|------|--------|-------|
| **Orders messages from** | Same sender | Causally related senders | All senders |
| **Concurrent messages** | Any order | Any order | Fixed global order |
| **Implementation** | Sequence numbers per sender | Vector clocks | Consensus / sequencer |
| **Message overhead** | $O(1)$ per message | $O(n)$ per message | $O(n)$ messages per broadcast |
| **Latency** | Low | Low-Medium | High (agreement round) |
| **Examples** | TCP, Kafka partitions | COPS, MongoDB sessions | ZooKeeper, Raft, Paxos |
| **Availability under partition** | High | High | Low (requires majority) |

### Visual Comparison

```
=== FIFO Order ===
P1 sends: A, B        → All deliver A before B from P1
P2 sends: X, Y        → All deliver X before Y from P2
But P3 might see: X, A, Y, B  (interleaving is OK)

=== Causal Order ===
P1 sends: A
P2 receives A, then sends B    (A → B)
P3 must deliver A before B      (causal dep respected)
But if P1 sends C concurrently with B (C ∥ B):
P3 may deliver C before or after B

=== Total Order ===
P1 sends: A
P2 sends: X
ALL processes deliver either (A, X) or (X, A)
— everyone agrees on the same order
```

---

## The Cost of Ordering

Stronger ordering comes with higher cost:

$$
\text{FIFO} \xrightarrow{\text{+ cross-sender deps}} \text{Causal} \xrightarrow{\text{+ concurrent ordering}} \text{Total}
$$

| Ordering | Messages | Metadata | Latency | Availability |
|----------|----------|----------|---------|--------------|
| FIFO | $n - 1$ | Sequence number ($O(1)$) | 1 hop | Full |
| Causal | $n - 1$ | Vector clock ($O(n)$) | 1 hop + possible buffering | Full |
| Total | $3(n - 1)$ | Sequence number ($O(1)$) | 2+ hops (agreement) | Requires majority |

In practice, **causal ordering** is often the sweet spot — it provides meaningful guarantees without the coordination overhead of total ordering.

---

## Exercises

### Exercise 1: Identify the Order

Three processes exchange messages. Classify each scenario as FIFO, causal, or total order:

```
Scenario A:
  P1 sends m1, m2.
  P2 delivers m1 then m2.
  P3 delivers m2 then m1.

Scenario B:
  P1 sends m1.
  P2 receives m1, sends m2.
  P3 delivers m1 before m2.
  P4 delivers m1 before m2.

Scenario C:
  P1 sends m1, P2 sends m2 (concurrent).
  P3 delivers m1 then m2.
  P4 delivers m1 then m2.
```

<details>
<summary>Answer</summary>

- **Scenario A**: FIFO violated (P3 delivers m2 before m1, both from P1).
- **Scenario B**: Causal order satisfied — $m_1 \rightarrow m_2$ and both P3, P4 deliver m1 first.
- **Scenario C**: Total order satisfied — concurrent messages delivered in the same order at both processes.

</details>

---

### Exercise 2: Vector Clock Delivery

Process $P_0$, $P_1$, $P_2$ start with $VC = [0, 0, 0]$. Messages arrive at $P_2$ in this order:

1. Message $m_b$ from $P_1$ with $VC_{msg} = [1, 1, 0]$
2. Message $m_a$ from $P_0$ with $VC_{msg} = [1, 0, 0]$

In what order does $P_2$ deliver them?

<details>
<summary>Answer</summary>

1. $m_b$ arrives: Check $VC_{msg}[1] = 1 = VC_2[1] + 1$? Yes. Check $VC_{msg}[0] = 1 \leq VC_2[0] = 0$? No! **Buffer $m_b$.**
2. $m_a$ arrives: Check $VC_{msg}[0] = 1 = VC_2[0] + 1$? Yes. Check $VC_{msg}[1] = 0 \leq VC_2[1] = 0$? Yes. **Deliver $m_a$**. $VC_2 = [1, 0, 0]$.
3. Re-check buffer: $m_b$: $VC_{msg}[1] = 1 = VC_2[1] + 1$? Yes. $VC_{msg}[0] = 1 \leq VC_2[0] = 1$? Yes. **Deliver $m_b$**. $VC_2 = [1, 1, 0]$.

**Delivery order: $m_a$, then $m_b$** — even though $m_b$ arrived first.

</details>

---

### Exercise 3: ISIS Sequence Numbers

Three processes run the ISIS algorithm. Process $P_0$ broadcasts message $m$:

- $P_0$ proposes sequence 5
- $P_1$ proposes sequence 7
- $P_2$ proposes sequence 3

What is the agreed sequence number? Why does ISIS pick the maximum?

<details>
<summary>Answer</summary>

The agreed sequence number is $\max(5, 7, 3) = 7$.

ISIS picks the maximum to ensure the agreed number is **higher than any previously proposed number** at any process. This prevents conflicts with previously agreed messages and ensures a consistent total order across all processes.

</details>

---

### Exercise 4: Design a Causal Chat

Design a simple causal chat system for 3 servers. Each server hosts some users. When a user posts a message, it should be broadcast to all servers with causal ordering.

Specify:
1. What metadata each message carries
2. The delivery condition at each server
3. How to handle a message that arrives "too early"

<details>
<summary>Answer</summary>

1. **Metadata**: Each message carries `(sender_server_id, message_text, vector_clock[3])` where the vector clock has one entry per server.

2. **Delivery condition**: Message from server $j$ with timestamp $VC_{msg}$ is deliverable at server $i$ when:
   - $VC_{msg}[j] = VC_i[j] + 1$ (next expected from server $j$)
   - $\forall k \neq j: VC_{msg}[k] \leq VC_i[k]$ (all causal deps satisfied)

3. **Early messages**: Buffer the message in a queue. After each successful delivery, re-scan the buffer for newly deliverable messages.

</details>

---

### Exercise 5: Causal vs Total

Give an example of a message delivery sequence that satisfies causal ordering but **violates** total ordering.

<details>
<summary>Answer</summary>

Let $P_1$ send $m_1$ and $P_2$ send $m_2$ concurrently ($m_1 \| m_2$):

- $P_3$ delivers: $m_1$, then $m_2$
- $P_4$ delivers: $m_2$, then $m_1$

This satisfies **causal ordering** because $m_1$ and $m_2$ are concurrent — there is no causal dependency, so either order is acceptable.

This violates **total ordering** because $P_3$ and $P_4$ deliver the messages in different orders. Total order requires all processes to agree on one global sequence.

</details>

---

## Summary

- **FIFO order** preserves send order per sender; the simplest and cheapest guarantee.
- **Causal order** preserves the happened-before relation; implemented with vector clocks and message buffering.
- **Total order** provides a single global sequence; requires agreement protocols like ISIS/ABCAST.
- **Causal broadcast** buffers messages until all causal dependencies are satisfied before delivery.
- **Vector clocks perfectly capture causality**: $VC(a) < VC(b) \iff a \rightarrow b$.
- **Causal consistency** is a practical consistency model — stronger than eventual but achievable without consensus.
- Real systems (MongoDB, COPS, ZooKeeper) use these ordering primitives as building blocks for consistent distributed storage.

In the next lesson, we will explore **distributed consensus** — the problem of getting all processes to agree on a single value, even when some of them fail.
