---
title: System Models and Properties
---

## System Models and Properties

In this lesson, you'll learn the **formal models** used to reason about distributed systems — how we classify networks, nodes, and timing, and the fundamental properties and impossibility results that constrain every distributed system design.

---

## Why System Models Matter

When designing a distributed algorithm (like consensus or replication), you need to specify **what assumptions you're making** about the system. These assumptions form your **system model**.

Different models lead to different solutions:

```
Assumption: "Nodes never crash"
  → Simple algorithms work, no need for recovery

Assumption: "Nodes can crash and restart"
  → Need write-ahead logs, state recovery

Assumption: "Nodes can lie and send false data"
  → Need Byzantine fault tolerance (BFT) — much harder!
```

A system model has three components:

| Component | Question | Options |
|-----------|----------|---------|
| **Network model** | How do messages behave? | Reliable, fair-loss, arbitrary |
| **Node failure model** | How can nodes fail? | Crash-stop, crash-recovery, Byzantine |
| **Timing model** | What timing guarantees exist? | Synchronous, asynchronous, partially synchronous |

---

## Timing Models

The timing model defines what assumptions we make about **how long things take**.

### Synchronous Model

In a **synchronous** system, there are **known upper bounds** on:

1. **Message delivery time** — Every message is delivered within $\Delta$ time units
2. **Processing time** — Every computation step completes within $\Phi$ time units
3. **Clock drift** — Clocks don't drift more than $\rho$ per time unit

```
Synchronous Model:

Node A ──message──► Node B

Guarantee: message arrives within Δ time units
           (e.g., Δ = 100ms)

If no response within Δ, the receiver has CRASHED.
```

**Advantages**:
- Failure detection is simple — if no response within $\Delta$, the node is dead
- Algorithms are easier to design and reason about
- Total ordering of events is straightforward

**Disadvantages**:
- **Unrealistic** for most real networks (especially the internet)
- Must set $\Delta$ conservatively (very large) to avoid false positives
- Performance suffers because you wait for the worst case

**Where it applies**: Local networks with quality-of-service guarantees, hard real-time systems, some industrial control systems.

### Asynchronous Model

In an **asynchronous** system, there are **no timing guarantees** whatsoever:

1. Messages can take **arbitrarily long** to deliver
2. Processing can take **arbitrarily long**
3. There are **no clocks** (or clocks are unreliable)

```
Asynchronous Model:

Node A ──message──► Node B

Guarantee: message will EVENTUALLY arrive (if the network is fair-loss)
           but could take 1ms or 1 hour — no bound!

Cannot distinguish:
  - Slow node from crashed node
  - Slow network from partitioned network
```

**Advantages**:
- Most **realistic** model for the internet and cloud
- Algorithms proven correct in this model work in any real system
- No false failure detections (because you never declare failure based on timing)

**Disadvantages**:
- **Very hard** to build algorithms — many problems are impossible (see FLP result below)
- Cannot detect failures (is the node slow or dead?)
- Cannot use timeouts for correctness (only for performance)

**Where it applies**: Internet, cloud computing, any system where you can't bound delays.

### Partially Synchronous Model

The **partially synchronous** model is the pragmatic middle ground. It says:

> The system behaves **asynchronously** most of the time, but **eventually** becomes synchronous. There exists a **Global Stabilization Time (GST)** after which all messages are delivered within bound $\Delta$.

```
Partially Synchronous Model:

Time ──────────────────────────────────────────────►
      |← asynchronous →|← synchronous (after GST) →|
                        ↑
                       GST
                   (unknown when)

Before GST: messages can be delayed arbitrarily
After GST:  messages arrive within Δ
```

**Key insight**: We don't know **when** GST occurs, but we assume it **eventually** happens.

**Advantages**:
- Realistic for most real systems (network delays are usually bounded, but not always)
- Algorithms can be designed to be **safe** during async periods and make **progress** during sync periods
- Most practical consensus algorithms (Paxos, Raft, PBFT) use this model

**Disadvantages**:
- More complex than pure synchronous
- Must handle arbitrary delays before GST

### Comparison

| Property | Synchronous | Asynchronous | Partially Synchronous |
|----------|------------|-------------|---------------------|
| Message delay bound | Known ($\Delta$) | None | Eventually ($\Delta$ after GST) |
| Failure detection | Perfect | Impossible | Eventually perfect |
| Algorithm design | Easiest | Hardest | Moderate |
| Realism | Low | High | High |
| Consensus | Solvable | Impossible (FLP) | Solvable |
| Used in practice | Rarely | Model only | Most real systems |

---

## Network Models

The network model defines how **messages behave** in the system.

### Reliable Links

**Assumption**: If a correct (non-crashed) node sends a message to another correct node, the message is **eventually delivered**, exactly **once**, and **in order**.

```
Reliable Link:

Node A ──► Message 1 ──► Node B receives Message 1
Node A ──► Message 2 ──► Node B receives Message 2

Properties:
  ✓ No message loss
  ✓ No duplication
  ✓ No reordering
  ✓ Delivery guaranteed (if sender and receiver are correct)
```

**Realistic?** TCP provides reliable, ordered delivery between two endpoints — so this is approximately realistic for point-to-point communication over TCP.

### Fair-Loss Links

**Assumption**: Messages **may be lost**, but if a message is sent **infinitely often**, it is **eventually delivered**. Messages are not duplicated or corrupted.

```
Fair-Loss Link:

Node A ──► Message (attempt 1) ──► LOST
Node A ──► Message (attempt 2) ──► LOST
Node A ──► Message (attempt 3) ──► Node B receives it!

Properties:
  ✓ If you keep retrying, eventually succeeds
  ✗ Individual messages may be lost
  ✓ No corruption
```

**Realistic?** This models UDP and unreliable networks. You can build reliable links on top of fair-loss links by adding retries and acknowledgments (which is essentially what TCP does).

### Arbitrary (Byzantine) Links

**Assumption**: Messages can be **lost**, **duplicated**, **reordered**, **corrupted**, or even **fabricated** by a malicious adversary.

```
Arbitrary Link:

Node A ──► "transfer $100 to Bob"

What Node B might receive:
  • "transfer $100 to Bob"     (correct)
  • "transfer $1000 to Eve"    (modified by attacker)
  • Nothing                    (dropped)
  • Same message 5 times       (duplicated)
  • A completely fabricated message
```

**Realistic?** Models networks where an attacker controls some links — relevant for blockchain, military systems, and public internet without TLS.

### Building Reliable Links from Fair-Loss Links

```python
class ReliableLink:
    """Build reliable delivery on top of fair-loss links."""

    def __init__(self, fair_loss_link):
        self.link = fair_loss_link
        self.delivered = set()       # Messages already delivered
        self.pending = {}            # Messages awaiting acknowledgment

    def send(self, message, destination):
        """Keep retrying until acknowledged."""
        msg_id = generate_unique_id()
        self.pending[msg_id] = (message, destination)

        while msg_id in self.pending:
            self.link.send(
                {"id": msg_id, "payload": message},
                destination
            )
            wait(timeout=1)  # Retry after timeout

    def receive(self, message):
        """Deduplicate received messages."""
        msg_id = message["id"]

        # Send acknowledgment
        self.link.send({"ack": msg_id}, message.sender)

        # Deliver only once
        if msg_id not in self.delivered:
            self.delivered.add(msg_id)
            deliver_to_application(message["payload"])
```

---

## Node Failure Models

The failure model defines **how nodes can fail**.

### Crash-Stop

A node either operates correctly or **crashes permanently**. Once crashed, it never recovers.

```
Crash-Stop:

Node A: ──running──running──running──CRASH──(gone forever)

Properties:
  ✓ Before crash: behaves correctly
  ✗ After crash: never responds again
  ✓ No "Byzantine" behavior (never lies)
```

**Where used**: Theoretical analysis, some embedded systems

### Crash-Recovery

A node can **crash and restart**. After restart, it loses all in-memory state but may have **persistent state** on disk (e.g., write-ahead log).

```
Crash-Recovery:

Node A: ──running──CRASH──(down)──RECOVER──running──CRASH──RECOVER──

Properties:
  ✓ Can crash at any time
  ✓ Can restart after crash
  ✓ In-memory state lost, disk state preserved
  ✓ No Byzantine behavior
```

**Where used**: Most real distributed systems. Databases, consensus protocols, replicated services.

```python
class CrashRecoveryNode:
    """Node that persists state to survive crashes."""

    def __init__(self):
        # Recover state from disk on startup
        self.state = self.load_from_disk()

    def process(self, request):
        # 1. Write intention to disk FIRST (write-ahead log)
        self.write_ahead_log.append(request)
        self.write_ahead_log.flush()  # Force to disk

        # 2. Now process the request
        result = self.compute(request)
        self.state.update(result)

        # 3. Save updated state
        self.save_to_disk(self.state)

        return result

    def recover(self):
        """Called on restart after crash."""
        self.state = self.load_from_disk()
        # Replay any log entries not yet applied to state
        for entry in self.write_ahead_log.unprocessed():
            result = self.compute(entry)
            self.state.update(result)
```

### Byzantine Failures

A node can behave **arbitrarily** — it can crash, send wrong data, send conflicting data to different nodes, or act maliciously.

```
Byzantine Failure:

Node A (honest):    "The value is 42"
Node B (Byzantine): "The value is 42" (to Node A)
                    "The value is 99" (to Node C)  ← LIES!
Node C (honest):    "The value is 42"

Node B tells different nodes different things!
```

**Where used**: Blockchain networks, military systems, any system where nodes might be compromised or have bugs that cause arbitrary behavior.

### Comparison

| Property | Crash-Stop | Crash-Recovery | Byzantine |
|----------|-----------|----------------|-----------|
| Can crash? | Yes (permanent) | Yes (temporary) | Yes |
| Can restart? | No | Yes | Yes |
| Can send wrong data? | No | No | **Yes** |
| Can be inconsistent? | No | No | **Yes** |
| Difficulty to handle | Low | Medium | **Very High** |
| Tolerance threshold | $f < n/2$ | $f < n/2$ | $f < n/3$ |
| Real-world example | Simple sensors | Databases, servers | Blockchain nodes |

### Fault Tolerance Thresholds

A critical result in distributed systems theory:

- **Crash faults**: A system of $n$ nodes can tolerate up to $f$ crash faults where $f < \frac{n}{2}$ (need a majority of honest nodes)
- **Byzantine faults**: A system of $n$ nodes can tolerate up to $f$ Byzantine faults where $f < \frac{n}{3}$ (need more than 2/3 honest nodes)

$$\text{Crash tolerance: } n \geq 2f + 1$$
$$\text{Byzantine tolerance: } n \geq 3f + 1$$

| Faults to tolerate ($f$) | Nodes needed (crash) | Nodes needed (Byzantine) |
|--------------------------|---------------------|-------------------------|
| 1 | 3 | 4 |
| 2 | 5 | 7 |
| 3 | 7 | 10 |
| 5 | 11 | 16 |
| 10 | 21 | 31 |

---

## Safety and Liveness Properties

Every correctness property of a distributed system falls into one of two categories:

### Safety Properties

**Safety** = "nothing bad happens"

A safety property states that some **bad thing never occurs**. If violated, there is a specific point in time when the violation happened.

| Example | Safety Property |
|---------|----------------|
| Mutual exclusion | At most one process holds the lock at any time |
| Consistency | A read always returns the most recent write |
| No overdraft | Bank account balance never goes negative |
| Agreement | All correct nodes decide the same value |

**Formal definition**: A property is **safe** if every finite prefix of an execution that violates it is itself a violation. In other words, once safety is violated, it can never be "un-violated."

```
Safety violation example (mutual exclusion):

Time:  t1    t2    t3    t4    t5
Node A: lock  ────────── unlock
Node B:       lock ← VIOLATION! Two nodes hold the lock at t2
```

### Liveness Properties

**Liveness** = "something good eventually happens"

A liveness property states that some **good thing eventually occurs**. No matter how bad the current state is, there's still hope — the good thing might happen in the future.

| Example | Liveness Property |
|---------|------------------|
| Termination | Every correct node eventually decides a value |
| Progress | Every request eventually receives a response |
| Eventual delivery | Every sent message is eventually delivered |
| Starvation freedom | Every waiting process eventually gets the resource |

**Formal definition**: Every finite execution can be extended to satisfy the property. You can never "permanently violate" a liveness property in finite time.

```
Liveness satisfaction example (termination):

Time:  t1    t2    t3    t4    ...   t100
Node A: thinking... thinking... DECIDE!  ← Eventually decides
```

### The Safety-Liveness Trade-off

In distributed systems, there's a fundamental tension:

- **Prioritize safety**: System might stop making progress (sacrifice liveness) to avoid unsafe states
- **Prioritize liveness**: System might allow inconsistent states (sacrifice safety) to ensure progress

```
Example: Database with network partition

Safety-first (CP system):
  - Refuse writes during partition
  - Data stays consistent
  - Some users get errors (unavailable)

Liveness-first (AP system):
  - Accept writes during partition
  - Data may become inconsistent
  - All users get responses (available)
```

> **Practical wisdom**: In most real systems, **safety is non-negotiable** and liveness is a best-effort goal. You'd rather have a banking system be temporarily unavailable than allow double-spending.

---

## The FLP Impossibility Result

One of the most important theoretical results in distributed systems.

### The Result

In 1985, **Fischer, Lynch, and Paterson** proved:

> **It is impossible for a deterministic asynchronous system to achieve consensus if even a single node can crash.**

This is known as the **FLP impossibility result**.

### What It Means

| Term | Meaning |
|------|---------|
| Deterministic | No randomness allowed |
| Asynchronous | No timing bounds |
| Consensus | All correct nodes agree on a value |
| Single crash | Just ONE node might fail |

Even in the simplest failure scenario (one crash, no Byzantine behavior), consensus is **impossible** in a purely asynchronous system!

### Intuition

The core problem is that in an asynchronous system, you **cannot distinguish a crashed node from a very slow one**:

```
Scenario 1: Node B crashed
  Node A ──message──►  Node B (dead, no response)
  Node A waits... and waits... forever?

Scenario 2: Node B is just slow
  Node A ──message──►  Node B (alive, but slow)
  Node A waits... response arrives after 10 minutes

From Node A's perspective, these look identical!
```

If the algorithm makes a decision without waiting for B, it might violate **agreement** (if B was alive and decided differently). If it waits, it might violate **termination** (if B is actually dead).

### How Real Systems Work Despite FLP

FLP seems devastating, but real systems solve consensus all the time! The trick is that FLP assumes a **pure asynchronous model**. Real systems escape by:

| Escape Hatch | How It Helps |
|-------------|-------------|
| **Partial synchrony** | Assume messages are eventually timely (after GST) |
| **Randomization** | Use coin flips to break symmetry (probabilistic consensus) |
| **Failure detectors** | Use timeouts (unreliable failure detection) |
| **Weaker guarantees** | Settle for probabilistic correctness |

**Paxos and Raft** work in the partially synchronous model — they guarantee **safety** always but may sacrifice **liveness** during asynchronous periods. Once the network stabilizes, they make progress.

---

## The Two Generals Problem

### Setup

Two generals, each commanding an army, must coordinate an attack on a city. They can only communicate by sending messengers through enemy territory. Messengers **may be captured** (messages may be lost).

```
        ┌─────────────────────────┐
        │     Enemy City          │
        │                         │
        └─────────────────────────┘
             ▲              ▲
             │   (enemy)    │
    ┌────────┴──┐      ┌───┴────────┐
    │ General A │ ───► │ General B  │
    │ (army 1)  │ ◄─── │ (army 2)  │
    └───────────┘      └────────────┘

    Messenger might be captured!
```

**Goal**: Both generals must agree to attack at the same time. If only one attacks, they lose.

### The Impossibility

General A sends: "Attack at dawn!"

**Case 1**: Messenger arrives. B knows to attack. But **A doesn't know B received the message**. So A might not attack.

**Solution attempt**: B sends an acknowledgment back.

**Case 2**: B's acknowledgment might be captured! Now **B doesn't know A received the ack**. B might not attack.

**This recurse infinitely** — no finite number of messages can establish **common knowledge** over an unreliable channel.

```
A sends: "Attack at dawn"         → might be lost
B sends: "Got it, will attack"     → might be lost
A sends: "Got your ack"            → might be lost
B sends: "Got your ack-ack"        → might be lost
...

No matter how many acks, the LAST sender is never sure!
```

### The Proof

The Two Generals Problem is **provably unsolvable**. No protocol can guarantee agreement over unreliable communication in finite time.

### Practical Implications

This is why real distributed systems use **timeouts and retries** with **at-least-once** or **at-most-once** semantics rather than trying to achieve perfect agreement over unreliable links. TCP uses three-way handshakes with timeouts — practical but not mathematically perfect.

---

## The Byzantine Generals Problem

### Setup

An extension of the Two Generals Problem to $n$ generals, where some generals might be **traitors** (Byzantine). Loyal generals must agree on a plan (attack or retreat), but traitors can send conflicting messages to different generals.

```
           General 1 (Loyal)
          ╱         │         ╲
    "Attack"    "Attack"    "Attack"
       ╱            │            ╲
General 2      General 3      General 4
 (Loyal)       (TRAITOR)       (Loyal)
                   │
          Sends "Attack" to Gen 2
          Sends "Retreat" to Gen 4
```

### Requirements

1. **Agreement**: All loyal generals decide on the same plan
2. **Validity**: If the commanding general is loyal, all loyal generals follow the commander's plan

### Key Result

**Theorem** (Lamport, Shostak, Pease, 1982):

> The Byzantine Generals Problem is solvable **if and only if** fewer than one-third of the generals are traitors.

$$n \geq 3f + 1$$

Where $n$ is the total number of generals and $f$ is the number of traitors.

### Why $\frac{n}{3}$? An Intuitive Example

With 3 generals and 1 traitor — it's impossible:

```
Case 1: General 1 (Commander) is the traitor

  Gen 1 (Traitor Commander):
    → Sends "Attack" to Gen 2
    → Sends "Retreat" to Gen 3

  Gen 2 (Loyal): heard "Attack" from commander
  Gen 3 (Loyal): heard "Retreat" from commander

  Gen 2 and 3 exchange messages, but Gen 2 says
  "commander said attack" and Gen 3 says
  "commander said retreat" — who's lying?
  They CAN'T tell if the commander lied or
  the other general is lying!

Case 2: General 3 is the traitor

  Gen 1 (Loyal Commander):
    → Sends "Attack" to Gen 2 and Gen 3

  Gen 3 (Traitor): tells Gen 2 "commander said retreat"

  Gen 2 hears "Attack" from Gen 1, "Retreat" from Gen 3
  Same situation as Case 1 — indistinguishable!
```

With 4 generals and 1 traitor — it IS solvable (each loyal general has 2 other loyal generals to corroborate, forming a majority).

### Real-World Applications

| Application | Byzantine Threat |
|-------------|-----------------|
| Blockchain (Bitcoin, Ethereum) | Malicious nodes trying to double-spend |
| Aircraft control systems | Hardware faults producing arbitrary output |
| Military communication | Compromised communication channels |
| Distributed databases (BFT) | Compromised or buggy replicas |

---

## How Models Guide Design Decisions

When designing a distributed system, you **choose** your model based on your environment:

### Decision Framework

```
What kind of failures do you need to tolerate?

  Only crashes (trusted environment)?
    └── Use crash-recovery model
        └── Algorithms: Paxos, Raft, ZAB
        └── Need: n ≥ 2f + 1 nodes

  Arbitrary/malicious behavior?
    └── Use Byzantine model
        └── Algorithms: PBFT, Tendermint, HotStuff
        └── Need: n ≥ 3f + 1 nodes

What timing guarantees can you make?

  Bounded delays (LAN, real-time)?
    └── Use synchronous model
        └── Simpler algorithms, timeouts for detection

  No guarantees (internet, cloud)?
    └── Use partially synchronous model
        └── Safety always, liveness after GST

What network guarantees exist?

  TCP connections?
    └── Model as reliable links
  
  UDP / unreliable connections?
    └── Model as fair-loss links, add retries
  
  Adversarial network?
    └── Model as arbitrary links, add authentication
```

### Common Model Choices in Practice

| System | Failure Model | Timing Model | Network Model |
|--------|--------------|-------------|---------------|
| ZooKeeper | Crash-recovery | Partial sync | Reliable (TCP) |
| etcd (Raft) | Crash-recovery | Partial sync | Reliable (TCP) |
| Bitcoin | Byzantine | Synchronous* | Fair-loss |
| PBFT | Byzantine | Partial sync | Reliable |
| Google Spanner | Crash-recovery | Partial sync** | Reliable |
| Cassandra | Crash-recovery | Asynchronous | Fair-loss |

*Bitcoin assumes synchrony for safety (bounded network delay for confirmations)
**Spanner uses TrueTime to bound clock uncertainty

---

## Putting It All Together

Here's a comprehensive diagram of how all the concepts relate:

```
┌──────────────────────────────────────────────────────┐
│                   SYSTEM MODEL                        │
│                                                      │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │   Timing    │ │    Node      │ │   Network    │  │
│  │   Model     │ │   Failure    │ │   Model      │  │
│  ├─────────────┤ ├──────────────┤ ├──────────────┤  │
│  │ Synchronous │ │ Crash-stop   │ │ Reliable     │  │
│  │ Async       │ │ Crash-recover│ │ Fair-loss    │  │
│  │ Partial sync│ │ Byzantine    │ │ Arbitrary    │  │
│  └─────────────┘ └──────────────┘ └──────────────┘  │
│                         │                            │
│                         ▼                            │
│              ┌──────────────────┐                    │
│              │   PROPERTIES     │                    │
│              ├──────────────────┤                    │
│              │ Safety           │                    │
│              │  (nothing bad)   │                    │
│              │ Liveness         │                    │
│              │  (something good)│                    │
│              └──────────────────┘                    │
│                         │                            │
│                         ▼                            │
│           ┌────────────────────────┐                 │
│           │  IMPOSSIBILITY RESULTS │                 │
│           ├────────────────────────┤                 │
│           │ FLP: No deterministic  │                 │
│           │  async consensus       │                 │
│           │ Two Generals: No       │                 │
│           │  agreement over        │                 │
│           │  unreliable links      │                 │
│           │ Byzantine: Need n≥3f+1 │                 │
│           └────────────────────────┘                 │
│                         │                            │
│                         ▼                            │
│              ┌──────────────────┐                    │
│              │  PRACTICAL       │                    │
│              │  ALGORITHMS      │                    │
│              ├──────────────────┤                    │
│              │ Paxos, Raft      │                    │
│              │ PBFT, Tendermint │                    │
│              │ Gossip protocols │                    │
│              └──────────────────┘                    │
└──────────────────────────────────────────────────────┘
```

---

## Try It Yourself

### Exercise 1: Model Classification

For each real-world system, identify the most appropriate system model:

| System | Failure Model? | Timing Model? | Network Model? |
|--------|---------------|---------------|----------------|
| A corporate database cluster on a LAN | ? | ? | ? |
| Bitcoin blockchain | ? | ? | ? |
| A microservice on AWS | ? | ? | ? |
| A military communication system | ? | ? | ? |
| An IoT sensor network | ? | ? | ? |

<details>
<summary>Click to see answers</summary>

| System | Failure Model | Timing Model | Network Model |
|--------|--------------|-------------|---------------|
| Corporate DB cluster | Crash-recovery | Partially synchronous | Reliable (TCP on LAN) |
| Bitcoin blockchain | Byzantine | Synchronous (bounded delay assumption) | Fair-loss |
| Microservice on AWS | Crash-recovery | Partially synchronous | Reliable (TCP) |
| Military comms | Byzantine | Partially synchronous | Arbitrary |
| IoT sensor network | Crash-recovery | Asynchronous | Fair-loss |

</details>

### Exercise 2: Safety or Liveness?

Classify each property as **safety** or **liveness**:

1. "No two processes hold the lock simultaneously"
2. "Every request eventually receives a response"
3. "The balance never goes below zero"
4. "The system eventually reaches a consistent state"
5. "Once a value is decided, it cannot be changed"
6. "Every message is eventually delivered"

<details>
<summary>Click to see answers</summary>

1. **Safety** — "nothing bad" (no concurrent lock holding)
2. **Liveness** — "something good eventually happens" (response)
3. **Safety** — "nothing bad" (no negative balance)
4. **Liveness** — "something good eventually happens" (consistency)
5. **Safety** — "nothing bad" (no decision change)
6. **Liveness** — "something good eventually happens" (delivery)

</details>

### Exercise 3: Byzantine Generals Calculation

A blockchain network wants to tolerate up to 100 Byzantine nodes. How many total nodes does the network need?

<details>
<summary>Click to see answer</summary>

Using the formula $n \geq 3f + 1$:

$$n \geq 3(100) + 1 = 301$$

The network needs **at least 301 nodes** to tolerate 100 Byzantine faults.

Verification: With 301 nodes and 100 traitors, there are 201 loyal nodes. A 2/3 majority of 301 is 201 (which is $> 200.67$), so the loyal nodes can outvote the traitors.

</details>

### Exercise 4: Thought Experiment

Consider this scenario: You're building a distributed lock service. A client requests a lock, but the response gets lost:

```
Client ──► "Acquire lock" ──► Lock Service
Client ◄── (response lost) ──◄ Lock Service: "Lock granted"
```

1. Does the client have the lock?
2. What happens if the client retries the request?
3. How would you design the system to handle this?

<details>
<summary>Click to see answer</summary>

1. **Yes**, the lock service granted the lock — the client just doesn't know it. This is the Two Generals Problem in action!

2. If the client retries:
   - If the lock service remembers the grant, it can re-send "Lock granted" (idempotent)
   - If the lock service treats it as a new request, it might say "Lock busy" (the client itself holds it!)

3. Design solutions:
   - **Lease-based locks**: Locks auto-expire after a timeout. If the client doesn't hear back, the lock eventually releases itself
   - **Fencing tokens**: Each lock grant includes a monotonically increasing token. Even if a stale client thinks it has the lock, the newer token wins
   - **Client IDs**: Associate locks with client IDs so retries can be recognized

</details>

---

## Key Takeaways

- **System models** define the assumptions under which distributed algorithms operate: timing, failure, and network models
- **Timing models**: synchronous (bounded delays), asynchronous (no bounds), partially synchronous (eventually bounded) — most real systems are partially synchronous
- **Network models**: reliable, fair-loss, and arbitrary — TCP gives reliable links; build reliability on top of fair-loss with retries
- **Node failure models**: crash-stop (crash forever), crash-recovery (crash and restart), Byzantine (arbitrary behavior) — crash-recovery is most common in practice
- **Safety** = "nothing bad happens"; **Liveness** = "something good eventually happens" — there's often a trade-off between the two
- **FLP impossibility**: deterministic consensus is impossible in a fully asynchronous system with even one crash — escaped via partial synchrony or randomization
- **Two Generals Problem**: perfect agreement over unreliable links is impossible — practical systems use timeouts and retries
- **Byzantine Generals**: tolerating $f$ Byzantine faults requires $n \geq 3f + 1$ nodes — much more expensive than crash fault tolerance ($n \geq 2f + 1$)
- Your choice of system model directly determines which algorithms you can use and what guarantees you can provide
- In the next section, we'll dive into **Communication** — how nodes actually send messages to each other in practice
