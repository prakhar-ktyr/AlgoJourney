---
title: "Byzantine Fault Tolerance"
---

# Byzantine Fault Tolerance

Byzantine Fault Tolerance (BFT) is the ability of a distributed system to continue operating correctly even when some nodes behave arbitrarily or maliciously. It addresses the hardest class of failures in distributed computing.

---

## The Byzantine Generals Problem

The Byzantine Generals Problem, formulated by Lamport, Shostak, and Pease (1982), illustrates the challenge of achieving consensus when participants may be traitorous.

### The Scenario

Several Byzantine army divisions surround an enemy city. Each division is led by a general who must communicate with others via messengers. They must agree on a common plan: **attack** or **retreat**. Some generals may be traitors who try to prevent agreement.

### Requirements

| Requirement | Description |
|-------------|-------------|
| **Agreement** | All loyal generals decide on the same plan |
| **Validity** | If all loyal generals prefer the same action, that is the decision |
| **Termination** | All loyal generals eventually reach a decision |

### Key Result

> With **f** Byzantine (traitorous) generals, consensus is possible only if the total number of generals **n ≥ 3f + 1**.

This means you need more than two-thirds of participants to be honest.

```
Example: 4 generals, 1 traitor

General A (loyal): "ATTACK"
General B (loyal): "ATTACK"
General C (loyal): "ATTACK"
General D (traitor): sends "ATTACK" to A, "RETREAT" to B and C

With 3f+1 = 4 generals and f=1 traitor:
- Loyal generals can still reach consensus via majority
- They compare messages and identify inconsistencies
```

---

## Byzantine Faults vs Crash Faults

Understanding the difference between fault types is crucial for choosing the right protocol.

| Property | Crash Fault | Byzantine Fault |
|----------|-------------|-----------------|
| **Behavior** | Node stops responding | Node behaves arbitrarily |
| **Detectability** | Easy (timeout) | Difficult (may appear correct) |
| **Tolerance** | n ≥ 2f + 1 nodes | n ≥ 3f + 1 nodes |
| **Examples** | Power failure, OOM | Hacking, bugs, malice |
| **Protocols** | Paxos, Raft | PBFT, Tendermint |
| **Performance** | Lower overhead | Higher overhead |
| **Trust model** | Nodes are honest | Nodes may lie |

### Types of Byzantine Behavior

```
Byzantine node can:
├── Send conflicting messages to different nodes
├── Selectively delay or drop messages
├── Forge messages (if no authentication)
├── Collude with other Byzantine nodes
├── Appear correct for a time, then misbehave
└── Perform any arbitrary computation
```

---

## PBFT: Practical Byzantine Fault Tolerance

PBFT, introduced by Castro and Liskov (1999), was the first practical BFT algorithm for asynchronous systems. It tolerates **f** Byzantine faults with **3f + 1** total nodes.

### System Model

- **Replicas**: 3f + 1 nodes (one primary, rest are backups)
- **Clients**: Send requests to the primary
- **View**: A configuration with a designated primary
- **View change**: Replaces a faulty primary

### The Three Phases

PBFT operates in three phases after the client sends a request:

```
Client → Primary → All Replicas → Client

Phase 1: PRE-PREPARE  (Primary assigns sequence number)
Phase 2: PREPARE      (Replicas agree on order)
Phase 3: COMMIT       (Replicas agree on execution)
```

---

### Phase 1: Pre-Prepare

The primary receives a client request and broadcasts a **pre-prepare** message.

```
PRE-PREPARE message contains:
┌─────────────────────────────────┐
│ view number (v)                 │
│ sequence number (n)             │
│ digest of request (d)           │
│ client request (m)              │
└─────────────────────────────────┘

Primary → all backups: ⟨PRE-PREPARE, v, n, d⟩ + m
```

A backup accepts the pre-prepare if:
- It is in view `v`
- The sequence number `n` is within a valid range
- It has not accepted a different pre-prepare for `v` and `n`

### Phase 2: Prepare

Each backup that accepts the pre-prepare broadcasts a **prepare** message to all other replicas.

```
PREPARE message contains:
┌─────────────────────────────────┐
│ view number (v)                 │
│ sequence number (n)             │
│ digest of request (d)           │
│ replica identifier (i)          │
└─────────────────────────────────┘

Backup i → all replicas: ⟨PREPARE, v, n, d, i⟩
```

A replica is **prepared** when it has:
- The pre-prepare for `(v, n, d)`
- **2f** matching prepare messages from different replicas

### Phase 3: Commit

Once prepared, a replica broadcasts a **commit** message.

```
COMMIT message contains:
┌─────────────────────────────────┐
│ view number (v)                 │
│ sequence number (n)             │
│ digest of request (d)           │
│ replica identifier (i)          │
└─────────────────────────────────┘

Replica i → all replicas: ⟨COMMIT, v, n, d, i⟩
```

A replica **commits** when it has **2f + 1** matching commit messages (including its own).

### Complete PBFT Flow

```
    Client    Primary    Backup1    Backup2    Backup3
      │          │          │          │          │
      │─REQUEST─▶│          │          │          │
      │          │          │          │          │
      │          │──PRE-PREPARE──▶──▶──▶         │  Phase 1
      │          │          │          │          │
      │          │◀─PREPARE─┼──────────┼─────────▶│  Phase 2
      │          │──PREPARE─▶──────────▶─────────▶│
      │          │          │─PREPARE──▶─────────▶│
      │          │          │          │─PREPARE─▶│
      │          │          │          │          │
      │          │◀─COMMIT──┼──────────┼─────────▶│  Phase 3
      │          │──COMMIT──▶──────────▶─────────▶│
      │          │          │──COMMIT──▶─────────▶│
      │          │          │          │──COMMIT─▶│
      │          │          │          │          │
      │◀─REPLY───┼──────────┼──────────┼─────────│  Reply
      │          │          │          │          │
```

The client waits for **f + 1** matching replies from different replicas.

---

## PBFT Message Complexity

| Phase | Messages Sent | Complexity |
|-------|--------------|------------|
| Pre-Prepare | 1 → n-1 | O(n) |
| Prepare | (n-1) → (n-1) | O(n²) |
| Commit | n → (n-1) | O(n²) |
| **Total per request** | — | **O(n²)** |

For `n = 3f + 1` replicas:

```
f=1:  n=4,   messages ≈ 4² = 16
f=2:  n=7,   messages ≈ 7² = 49
f=3:  n=10,  messages ≈ 10² = 100
f=10: n=31,  messages ≈ 31² = 961
f=33: n=100, messages ≈ 100² = 10,000
```

This quadratic complexity limits PBFT to small replica sets (typically < 20 nodes).

---

## View Change Protocol

When the primary is suspected to be faulty, backups trigger a **view change**.

```
View Change Steps:
1. Backup suspects primary (timeout on request)
2. Backup broadcasts VIEW-CHANGE message
3. New primary (replica (v+1) mod n) collects 2f VIEW-CHANGE messages
4. New primary broadcasts NEW-VIEW message
5. Normal operation resumes in view v+1
```

This ensures liveness: a faulty primary cannot permanently block the system.

---

## BFT in Blockchain

Blockchains are fundamentally BFT systems operating in adversarial environments.

### Proof of Work as BFT

Bitcoin's Nakamoto consensus achieves BFT probabilistically:

| Property | Nakamoto Consensus |
|----------|-------------------|
| Fault tolerance | Up to 50% hash power |
| Finality | Probabilistic (6 blocks ≈ 1 hour) |
| Participants | Permissionless (open) |
| Agreement | Longest chain rule |
| Energy cost | Very high |

```
Nakamoto BFT:
- No explicit voting rounds
- "Votes" are proportional to hash power
- Sybil resistance via computational cost
- Tolerates up to 49.9% Byzantine hash power
- Consistency sacrificed for availability (eventual consistency)
```

### Proof of Stake as BFT

Modern PoS protocols embed classical BFT:

```
PoS + BFT:
├── Validators stake tokens (economic Sybil resistance)
├── BFT voting among validator set
├── Slashing for Byzantine behavior (economic punishment)
└── Fast finality (seconds vs minutes)
```

---

## Tendermint BFT

Tendermint (2014) adapts PBFT for blockchain with a rotating proposer.

### Protocol Rounds

```
Tendermint Consensus Round:
┌──────────────────────────────────────────────────┐
│  1. PROPOSE    │ Proposer broadcasts block        │
│  2. PREVOTE    │ Validators vote on proposal      │
│  3. PRECOMMIT  │ Validators lock on block         │
│  4. COMMIT     │ Block is finalized               │
└──────────────────────────────────────────────────┘
```

### Key Properties

| Property | Value |
|----------|-------|
| Fault tolerance | f < n/3 Byzantine validators |
| Finality | Instant (1 block) |
| Block time | ~6 seconds |
| Participants | Permissioned validator set |
| Liveness | Guaranteed with < n/3 faults |

### Tendermint vs PBFT

```
Similarities:
- Both tolerate f < n/3 Byzantine faults
- Both have O(n²) message complexity
- Both provide deterministic finality

Differences:
- Tendermint uses rotating proposers (no view change)
- Tendermint is optimized for blockchain state machines
- Tendermint separates consensus from application (ABCI)
- Tendermint has gossip-based communication
```

---

## HotStuff

HotStuff (2018) achieves **linear** message complexity per phase, making BFT scalable.

### Key Innovation: Linear Communication

```
PBFT:    All-to-all communication → O(n²) per phase
HotStuff: Star topology (leader-based) → O(n) per phase

PBFT Message Pattern:        HotStuff Message Pattern:
  ○──○──○──○                    ○
  │╲ │╲ │╲ │                   /│\
  ○──○──○──○                  ○ ○ ○
  │╲ │╲ │╲ │                   \│/
  ○──○──○──○                    ○ (leader)
```

### HotStuff Phases

HotStuff uses three rounds of voting (like PBFT) but with a leader collecting and broadcasting:

```
Phase 1: PREPARE
  Leader → all: proposal
  All → Leader: votes
  Leader forms QC (Quorum Certificate) from 2f+1 votes

Phase 2: PRE-COMMIT
  Leader → all: QC from Phase 1
  All → Leader: votes
  Leader forms QC

Phase 3: COMMIT
  Leader → all: QC from Phase 2
  All → Leader: votes
  Leader forms QC

Phase 4: DECIDE
  Leader → all: QC from Phase 3
  All: execute and reply to client
```

### Complexity Comparison

| Protocol | Message Complexity | View Change | Responsiveness |
|----------|-------------------|-------------|----------------|
| PBFT | O(n²) | O(n³) | Yes |
| Tendermint | O(n²) | O(n²) | No (timeouts) |
| HotStuff | O(n) | O(n) | Yes |

HotStuff achieves linear complexity using **threshold signatures** to aggregate votes into a single compact proof (Quorum Certificate).

---

## When Is BFT Needed?

| Use Case | Why BFT? | Example |
|----------|----------|---------|
| **Financial systems** | Participants may cheat for profit | Payment networks |
| **Blockchain** | Open/adversarial environment | Bitcoin, Ethereum |
| **Military** | Compromised nodes possible | Battlefield comms |
| **Multi-party computation** | Mutual distrust | Secure voting |
| **Safety-critical** | Hardware faults can be arbitrary | Aviation, nuclear |
| **Supply chain** | Competing organizations | Trade finance |

### When CFT Is Sufficient

```
Use Crash Fault Tolerance (Paxos/Raft) when:
├── All nodes are under your control
├── Network is trusted (private datacenter)
├── Failures are crashes, not attacks
├── Performance is critical (lower overhead)
└── Node software is verified/uniform
```

---

## Performance Overhead

BFT protocols have significant overhead compared to CFT:

| Metric | CFT (Raft) | BFT (PBFT) | BFT (HotStuff) |
|--------|-----------|------------|-----------------|
| Min nodes for f=1 | 3 | 4 | 4 |
| Messages per consensus | O(n) | O(n²) | O(n) |
| Latency (rounds) | 2 | 3 | 4 |
| Crypto operations | None/MAC | Signatures | Threshold sigs |
| Throughput (typical) | 100K+ ops/s | 10K-50K ops/s | 50K-100K ops/s |
| Scalability | 100s of nodes | ~20 nodes | 100s of nodes |

### Optimization Techniques

```
Reducing BFT Overhead:
1. Speculative execution (execute before commit)
2. Batching (amortize consensus over many requests)
3. Threshold cryptography (compact proofs)
4. Pipelining (overlap consensus instances)
5. Trusted hardware (TEEs reduce f requirement)
6. Optimistic protocols (fast path for no-fault case)
```

---

## Modern BFT Protocols

### Protocol Timeline

```
1982: Byzantine Generals Problem (Lamport)
1999: PBFT (Castro & Liskov)
2007: Zyzzyva (speculative BFT)
2014: Tendermint (blockchain BFT)
2016: BFT-SMaRt (library)
2018: HotStuff (linear BFT)
2019: LibraBFT / DiemBFT (Facebook/Meta)
2020: Narwhal & Tusk (DAG-based BFT)
2022: Bullshark (asynchronous DAG BFT)
```

### DAG-Based BFT

Modern protocols separate **data dissemination** from **ordering**:

```
Traditional BFT:
  Leader proposes block → Replicas vote → Commit
  (Leader is bottleneck)

DAG-Based BFT (Narwhal + Bullshark):
  All nodes disseminate transactions (DAG)
  Consensus only orders the DAG vertices
  (No single leader bottleneck)

  Round 1    Round 2    Round 3
   [A1]───────[A2]───────[A3]
    │╲         │╲         │
   [B1]───────[B2]───────[B3]
    │╲         │╲         │
   [C1]───────[C2]───────[C3]
```

### Comparison of Modern Protocols

| Protocol | Year | Complexity | Finality | Used In |
|----------|------|-----------|----------|---------|
| PBFT | 1999 | O(n²) | Instant | Hyperledger |
| Tendermint | 2014 | O(n²) | Instant | Cosmos |
| HotStuff | 2018 | O(n) | Instant | Diem/Aptos |
| Narwhal+Tusk | 2020 | O(n) | Instant | Sui |
| Bullshark | 2022 | O(n) | Instant | Sui/Aptos |

---

## Implementation Example: Simplified PBFT State Machine

```python
class PBFTReplica:
    def __init__(self, replica_id, total_replicas):
        self.id = replica_id
        self.n = total_replicas
        self.f = (total_replicas - 1) // 3
        self.view = 0
        self.sequence = 0
        self.log = []
        self.prepare_counts = {}  # (v, n, d) → set of replica ids
        self.commit_counts = {}   # (v, n, d) → set of replica ids

    @property
    def primary(self):
        return self.view % self.n

    @property
    def is_primary(self):
        return self.id == self.primary

    def on_request(self, request):
        """Primary receives client request."""
        if not self.is_primary:
            return  # forward to primary
        self.sequence += 1
        digest = hash(request)
        msg = ("PRE-PREPARE", self.view, self.sequence, digest)
        self.broadcast(msg, request)

    def on_pre_prepare(self, view, seq, digest, request):
        """Backup receives pre-prepare from primary."""
        if not self.validate_pre_prepare(view, seq, digest):
            return
        # Send prepare to all replicas
        msg = ("PREPARE", view, seq, digest, self.id)
        self.broadcast(msg)

    def on_prepare(self, view, seq, digest, sender):
        """Replica receives prepare message."""
        key = (view, seq, digest)
        self.prepare_counts.setdefault(key, set()).add(sender)
        if len(self.prepare_counts[key]) >= 2 * self.f:
            # Prepared! Send commit
            msg = ("COMMIT", view, seq, digest, self.id)
            self.broadcast(msg)

    def on_commit(self, view, seq, digest, sender):
        """Replica receives commit message."""
        key = (view, seq, digest)
        self.commit_counts.setdefault(key, set()).add(sender)
        if len(self.commit_counts[key]) >= 2 * self.f + 1:
            # Committed! Execute request
            self.execute(seq)
```

---

## Exercises

1. **Calculate replica count**: A system must tolerate 5 Byzantine faults. How many total replicas are needed? What if only crash faults are expected?

2. **Message counting**: In a PBFT system with 13 replicas (f=4), calculate the total number of messages exchanged for a single client request (pre-prepare + prepare + commit + replies).

3. **Identify the vulnerability**: A system uses 6 replicas with PBFT. An attacker compromises 2 replicas. Can the attacker break safety? What about with 3 compromised replicas?

4. **Design decision**: You're building a payment system shared between 5 banks. Would you use Raft or PBFT? Justify considering trust assumptions, performance needs, and failure modes.

5. **Compare finality**: Explain why Bitcoin needs 6 confirmations (~60 minutes) for finality while Tendermint achieves instant finality. What trade-off does each make?

6. **HotStuff optimization**: Explain how threshold signatures reduce HotStuff's communication complexity from O(n²) to O(n). What is a Quorum Certificate and why is it important?

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Byzantine fault | Arbitrary/malicious node behavior |
| Tolerance bound | 3f + 1 nodes for f Byzantine faults |
| PBFT | First practical BFT; O(n²) messages |
| Tendermint | Blockchain-optimized BFT with rotating proposers |
| HotStuff | Linear complexity BFT using threshold signatures |
| PoW/PoS | Probabilistic BFT for permissionless settings |
| CFT vs BFT | Use BFT only when nodes may be adversarial |
| Modern trend | DAG-based protocols separating dissemination from ordering |

Byzantine Fault Tolerance is essential when building systems that must function correctly in adversarial environments — from blockchains to financial networks to military systems.
