---
title: "Paxos Consensus"
---

# Paxos Consensus

Paxos is a family of protocols for solving consensus in a network of unreliable processors. Published by Leslie Lamport in 1998, it remains one of the most important—and most misunderstood—algorithms in distributed systems.

---

## Why Consensus Matters

In a distributed system, multiple nodes must agree on a single value (e.g., a log entry, a configuration change, or a leader). Consensus ensures:

- **Safety**: All correct nodes agree on the same value
- **Liveness**: The system eventually makes progress
- **Fault tolerance**: The system continues despite node failures

Without consensus, distributed systems cannot provide strong consistency guarantees.

---

## History and Context

| Year | Event |
|------|-------|
| 1989 | Lamport writes "The Part-Time Parliament" |
| 1998 | Paper finally published in ACM TOCS |
| 2001 | Lamport publishes "Paxos Made Simple" |
| 2006 | Google publishes Chubby lock service (uses Paxos) |
| 2007 | Google publishes Paxos Made Live |
| 2014 | Raft published as an "understandable" alternative |

Lamport originally described Paxos using an analogy of a fictional Greek parliament on the island of Paxos, which contributed to its reputation for being difficult to understand.

---

## Roles in Paxos

Paxos defines three roles that nodes can play:

| Role | Responsibility |
|------|---------------|
| **Proposer** | Proposes values to be chosen; drives the protocol |
| **Acceptor** | Votes on proposals; stores accepted values |
| **Learner** | Learns the chosen value once consensus is reached |

In practice, a single physical node often plays all three roles simultaneously.

### Quorums

A **quorum** is any majority subset of acceptors. For $n$ acceptors, a quorum requires:

$$Q = \left\lfloor \frac{n}{2} \right\rfloor + 1$$

The key insight: **any two quorums must overlap in at least one acceptor**. This guarantees that information about prior decisions is always available.

For $n = 5$ acceptors, $Q = 3$. Any two groups of 3 share at least 1 member.

---

## Basic Paxos: The Protocol

Basic Paxos achieves consensus on a **single value** through two phases.

### Proposal Numbers

Each proposal carries a unique, monotonically increasing **proposal number** $n$. Proposal numbers must be globally unique—typically formed as:

$$\text{proposal\_number} = (\text{round}, \text{server\_id})$$

This ensures ordering: $(r_1, s_1) < (r_2, s_2)$ if $r_1 < r_2$, or $r_1 = r_2$ and $s_1 < s_2$.

---

### Phase 1: Prepare / Promise

**Step 1a — Prepare**: The proposer selects a proposal number $n$ and sends a `Prepare(n)` message to a quorum of acceptors.

**Step 1b — Promise**: Each acceptor receiving `Prepare(n)`:

- If $n$ is **greater than** any proposal number it has already responded to:
  - It **promises** not to accept any proposal with number less than $n$
  - It replies with `Promise(n, accepted_proposal, accepted_value)` — the highest-numbered proposal it has previously accepted (if any)
- If $n$ is **less than or equal to** a previously promised number:
  - It **ignores** the prepare request (or sends a NACK)

```
Proposer                    Acceptor A    Acceptor B    Acceptor C
   |                            |              |              |
   |--- Prepare(n=1) --------->|              |              |
   |--- Prepare(n=1) ------------------------>|              |
   |--- Prepare(n=1) ---------------------------------------->|
   |                            |              |              |
   |<-- Promise(1, null) ------|              |              |
   |<-- Promise(1, null) ----------------------|              |
   |<-- Promise(1, null) --------------------------------------|
```

---

### Phase 2: Accept / Accepted

**Step 2a — Accept**: Once the proposer receives promises from a quorum:

- If **any** promise included a previously accepted value, the proposer **must** propose the value from the highest-numbered accepted proposal
- Otherwise, it may propose **any** value $v$
- It sends `Accept(n, v)` to a quorum of acceptors

**Step 2b — Accepted**: Each acceptor receiving `Accept(n, v)`:

- If it has **not** promised to a proposal number greater than $n$:
  - It **accepts** the proposal and replies `Accepted(n, v)`
  - It notifies all learners
- Otherwise, it **ignores** the accept request

```
Proposer                    Acceptor A    Acceptor B    Acceptor C
   |                            |              |              |
   |--- Accept(1, "X") ------->|              |              |
   |--- Accept(1, "X") ---------------------->|              |
   |--- Accept(1, "X") -------------------------------------->|
   |                            |              |              |
   |<-- Accepted(1, "X") ------|              |              |
   |<-- Accepted(1, "X") ----------------------|              |
   |<-- Accepted(1, "X") --------------------------------------|
   |                            |              |              |
   | Value "X" is CHOSEN (accepted by majority)               |
```

---

## Complete Example Walkthrough

Consider 3 acceptors (A, B, C) and 2 proposers (P1, P2).

### Scenario: No Conflict

```
P1: Prepare(n=1) → A, B, C
A, B, C: Promise(1, null, null) → P1
P1: Accept(1, "alpha") → A, B, C
A, B, C: Accepted(1, "alpha")

Result: "alpha" is chosen
```

### Scenario: Competing Proposers

```
Timeline:
─────────────────────────────────────────────────────────

P1: Prepare(n=1) → A, B         [P1 gets promises from A, B]
P2: Prepare(n=2) → B, C         [P2 gets promises from B, C]
                                  B now promised n=2, won't accept n<2

P1: Accept(1, "alpha") → A, B
    A: Accepted(1, "alpha")      [A hasn't seen n=2]
    B: REJECTED                  [B promised n=2]

P1 fails to get quorum for Accept!

P2: Accept(2, "beta") → B, C
    B: Accepted(2, "beta")
    C: Accepted(2, "beta")

Result: "beta" is chosen (accepted by quorum {B, C})
```

### Scenario: Value Propagation

```
Timeline:
─────────────────────────────────────────────────────────

P1: Prepare(1) → A, B, C → all Promise(1, null)
P1: Accept(1, "alpha") → A, B → both Accepted
    (C never gets the Accept message — network delay)

    "alpha" IS chosen (majority A, B accepted)

P2: Prepare(2) → B, C
    B replies: Promise(2, accepted=(1, "alpha"))
    C replies: Promise(2, null)

P2 MUST propose "alpha" (highest accepted value seen)
P2: Accept(2, "alpha") → B, C → both Accepted

Result: "alpha" remains chosen — safety preserved!
```

This last scenario demonstrates the critical safety mechanism: Phase 1 **discovers** any previously chosen value, and the proposer is **obligated** to re-propose it.

---

## Safety Properties

Paxos guarantees three safety properties:

| Property | Guarantee |
|----------|-----------|
| **Validity** | Only a proposed value can be chosen |
| **Agreement** | At most one value is chosen |
| **Termination** | If a majority of nodes are alive, a value is eventually chosen* |

*Termination requires additional mechanisms (leader election) — see "Liveness" below.

### Proof Sketch of Agreement

1. A value $v$ is chosen only if accepted by a quorum $Q_1$
2. Any future proposer must contact a quorum $Q_2$ in Phase 1
3. $Q_1 \cap Q_2 \neq \emptyset$ (quorum intersection property)
4. At least one acceptor in $Q_2$ knows about $v$
5. The new proposer is forced to propose $v$ (or a value from an even higher proposal)

This creates an unbreakable chain: once a value is chosen, all future rounds will discover and re-propose it.

---

## Liveness and Dueling Proposers

Basic Paxos does **not** guarantee liveness. Two proposers can livelock:

```
P1: Prepare(1) → gets promises
P2: Prepare(2) → invalidates P1's promises
P1: Accept(1) → rejected
P1: Prepare(3) → invalidates P2's promises
P2: Accept(2) → rejected
P2: Prepare(4) → invalidates P1's promises
... (infinite loop)
```

**Solution**: Elect a **distinguished proposer** (leader). Only the leader issues proposals. If the leader fails, elect a new one. This is exactly what Multi-Paxos does.

---

## Multi-Paxos

Basic Paxos decides a single value. Real systems need to decide a **sequence** of values (e.g., a replicated log). Multi-Paxos extends Basic Paxos:

### Key Idea

- Run separate Paxos instances for each log slot (index)
- Use a stable leader to skip Phase 1 for consecutive slots
- Phase 1 is amortized across many slots

### Steady-State Operation

```
Leader (Proposer)           Acceptors
     |                          |
     |--- Accept(slot=1, v1) -->|  (Phase 1 already done)
     |<-- Accepted -------------|
     |                          |
     |--- Accept(slot=2, v2) -->|  (No Phase 1 needed!)
     |<-- Accepted -------------|
     |                          |
     |--- Accept(slot=3, v3) -->|
     |<-- Accepted -------------|
```

In steady state, Multi-Paxos requires only **one round trip** per consensus decision — the same as Raft.

### Message Complexity

| Protocol | Messages per Decision (Steady State) |
|----------|--------------------------------------|
| Basic Paxos | $4n$ (2 phases × $2n$ messages) |
| Multi-Paxos (with leader) | $2n$ (Phase 2 only) |
| Raft | $2n$ (AppendEntries + response) |

Where $n$ is the number of acceptors in the quorum.

---

## Why Paxos Is Notoriously Difficult

### Reasons for Complexity

1. **Abstract presentation**: Lamport's original paper uses a parliament metaphor that obscures the algorithm
2. **Single-decree focus**: Basic Paxos solves one value; building a practical system requires Multi-Paxos, which is underspecified
3. **Implementation gaps**: The paper doesn't address:
   - Log compaction / snapshotting
   - Cluster membership changes
   - Client interaction semantics
   - Exactly-once semantics
4. **Subtle edge cases**: Handling holes in the log, leader crashes mid-phase, network partitions
5. **No reference implementation**: Each implementation makes different design choices

### The "Paxos Made Live" Reality

Google's 2007 paper "Paxos Made Live" documented their experience building Chubby:

> "There are significant gaps between the description of the Paxos algorithm and the needs of a real-world system... the final system will be based on an unproven protocol."

They reported that the implementation took **years** and required solving problems not mentioned in the original paper.

---

## Practical Implementations

### Google Chubby

Chubby is a distributed lock service built on Paxos:

| Aspect | Detail |
|--------|--------|
| Purpose | Coarse-grained locking, leader election |
| Consensus | Multi-Paxos for replicated log |
| Replicas | Typically 5 (tolerates 2 failures) |
| Used by | GFS, Bigtable, MapReduce |

### Other Implementations

| System | Usage of Paxos |
|--------|---------------|
| Apache ZooKeeper | ZAB protocol (Paxos variant) |
| Google Spanner | Multi-Paxos for replication |
| Microsoft Azure Storage | Paxos for metadata replication |
| Amazon DynamoDB | Paxos for leader election |
| Apple FoundationDB | Multi-Paxos for transaction log |

---

## Paxos Optimizations

### Fast Paxos (Lamport, 2006)

Reduces latency when there's no conflict:

- Clients send directly to acceptors (bypassing leader)
- Requires larger quorums: $\lfloor \frac{2n}{3} \rfloor + 1$ instead of $\lfloor \frac{n}{2} \rfloor + 1$
- Falls back to Classic Paxos on conflict

| Metric | Classic Paxos | Fast Paxos (no conflict) |
|--------|--------------|--------------------------|
| Message delays | 4 | 3 |
| Quorum size ($n=5$) | 3 | 4 |
| Fault tolerance | 2 failures | 1 failure (for fast path) |

### Cheap Paxos (Lamport, 2004)

Uses fewer main processors plus auxiliary processors:

- $f + 1$ main processors in steady state
- $f$ auxiliary processors activated only during reconfiguration
- Tolerates $f$ failures with $f + 1$ main + $f$ auxiliary nodes

### Flexible Paxos (Howard et al., 2016)

Relaxes the quorum intersection requirement:

$$|Q_1| + |Q_2| > n$$

Phase 1 quorum and Phase 2 quorum don't need to both be majorities—they just need to overlap. This allows:

- Smaller Phase 2 quorums (faster steady state) with larger Phase 1 quorums
- Example: $n=5$, Phase 1 quorum = 4, Phase 2 quorum = 2

---

## Common Misconceptions

| Misconception | Reality |
|---------------|---------|
| "Paxos requires a leader" | Basic Paxos is leaderless; Multi-Paxos uses a leader for efficiency |
| "Paxos is a single algorithm" | It's a family of protocols (Basic, Multi, Fast, Cheap, etc.) |
| "Paxos guarantees liveness" | Only safety is guaranteed; liveness requires a leader |
| "A value is chosen when the proposer knows" | A value is chosen when a quorum accepts, even if no one has learned yet |
| "Paxos is Byzantine fault tolerant" | Classic Paxos handles only crash failures, not malicious nodes |
| "Each Paxos round must use all acceptors" | Only a quorum (majority) is needed |

---

## Comparison: Paxos vs. Raft

| Aspect | Paxos | Raft |
|--------|-------|------|
| Published | 1998 | 2014 |
| Primary goal | Correctness proof | Understandability |
| Leader requirement | Optional (Multi-Paxos uses one) | Mandatory |
| Log structure | May have holes | No holes (contiguous) |
| Membership changes | Complex / underspecified | Joint consensus protocol |
| Understandability | Notoriously difficult | Designed for clarity |
| Proven correctness | Yes (TLA+ spec) | Yes (TLA+ spec) |
| Performance | Equivalent in steady state | Equivalent in steady state |
| Leader election | Not specified | Randomized timeout |

### Structural Differences

```
Paxos Log (may have holes):
┌───┬───┬───┬───┬───┬───┬───┬───┐
│ 1 │ 2 │   │ 4 │ 5 │   │ 7 │ 8 │
└───┴───┴───┴───┴───┴───┴───┴───┘
         ↑           ↑
       (gap)       (gap)    ← Must be filled eventually

Raft Log (always contiguous):
┌───┬───┬───┬───┬───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │
└───┴───┴───┴───┴───┴───┴───┴───┘
```

---

## Paxos in Pseudocode

### Proposer

```python
class Proposer:
    def __init__(self, id, acceptors):
        self.id = id
        self.acceptors = acceptors
        self.proposal_number = 0

    def propose(self, value):
        # Phase 1: Prepare
        self.proposal_number += 1
        n = (self.proposal_number, self.id)
        promises = []

        for acceptor in self.acceptors:
            response = acceptor.prepare(n)
            if response is not None:
                promises.append(response)

        if len(promises) < majority(self.acceptors):
            return None  # Failed to get quorum

        # Use highest accepted value if any
        accepted = [p for p in promises if p.accepted_value is not None]
        if accepted:
            value = max(accepted, key=lambda p: p.accepted_n).accepted_value

        # Phase 2: Accept
        acceptances = 0
        for acceptor in self.acceptors:
            if acceptor.accept(n, value):
                acceptances += 1

        if acceptances >= majority(self.acceptors):
            return value  # Consensus reached!
        return None
```

### Acceptor

```python
class Acceptor:
    def __init__(self):
        self.promised_n = None      # Highest promised proposal number
        self.accepted_n = None      # Highest accepted proposal number
        self.accepted_value = None  # Value of highest accepted proposal

    def prepare(self, n):
        if self.promised_n is None or n > self.promised_n:
            self.promised_n = n
            return Promise(n, self.accepted_n, self.accepted_value)
        return None  # Reject (already promised higher)

    def accept(self, n, value):
        if self.promised_n is None or n >= self.promised_n:
            self.promised_n = n
            self.accepted_n = n
            self.accepted_value = value
            return True  # Accepted
        return False  # Reject
```

---

## State Machine Diagram

A Paxos acceptor transitions through these states:

```
                    Prepare(n) received
                    n > promised_n
┌──────────┐   ─────────────────────────>   ┌─────────────┐
│  Initial │                                 │  Promised   │
│  State   │                                 │  (n)        │
└──────────┘   <─────────────────────────   └─────────────┘
                    Prepare(n') where               |
                    n' > n (update promise)          |
                                                    | Accept(n, v)
                                                    | n >= promised_n
                                                    v
                                             ┌─────────────┐
                                             │  Accepted   │
                                             │  (n, v)     │
                                             └─────────────┘
```

---

## Durability Requirements

For correctness, acceptors must persist their state to stable storage **before** sending any response:

| State | Must Persist |
|-------|-------------|
| `promised_n` | Before sending Promise |
| `accepted_n` | Before sending Accepted |
| `accepted_value` | Before sending Accepted |

If an acceptor crashes and recovers, it must restore its last persistent state. Forgetting a promise could violate safety.

---

## Exercises

### Exercise 1: Trace the Protocol

Given 5 acceptors (A–E) and proposal $n=3$ with value "commit":

1. Proposer sends `Prepare(3)` to A, B, C
2. A has `promised_n=1`, B has `promised_n=2`, C has `promised_n=4`
3. Which acceptors respond with a Promise?
4. Does the proposer get a quorum?

<details>
<summary>Solution</summary>

- A responds: $3 > 1$ ✓
- B responds: $3 > 2$ ✓
- C does NOT respond: $3 < 4$ ✗

The proposer gets 2 promises. A quorum of 5 requires 3. **No quorum** — the proposer must retry with a higher proposal number (e.g., $n=5$).

</details>

### Exercise 2: Value Selection

Proposer P2 sends `Prepare(5)` and receives:

- Acceptor A: `Promise(5, accepted_n=2, accepted_value="X")`
- Acceptor B: `Promise(5, accepted_n=3, accepted_value="Y")`
- Acceptor C: `Promise(5, null, null)`

What value must P2 propose in Phase 2?

<details>
<summary>Solution</summary>

P2 must propose **"Y"** — the value associated with the highest accepted proposal number ($n=3$ > $n=2$).

Even if P2 originally wanted to propose "Z", it is **obligated** to propose "Y" to preserve safety.

</details>

### Exercise 3: Is the Value Chosen?

3 acceptors (A, B, C). The following events occur:

1. A accepts proposal $(1, "alpha")$
2. B accepts proposal $(1, "alpha")$
3. C has not responded to anything

Is "alpha" chosen? Why or why not?

<details>
<summary>Solution</summary>

**Yes**, "alpha" is chosen. A quorum is $\lfloor 3/2 \rfloor + 1 = 2$. Since A and B (a majority) have accepted $(1, "alpha")$, the value is chosen — even though C is unaware and no learner has been notified yet.

</details>

### Exercise 4: Livelock Scenario

Design a sequence of messages where two proposers prevent each other from completing, demonstrating livelock. Use proposal numbers and specify which acceptors respond.

<details>
<summary>Solution</summary>

With acceptors A, B, C:

1. P1: `Prepare(1)` → A, B, C → all Promise
2. P2: `Prepare(2)` → A, B, C → all Promise (now won't accept $n=1$)
3. P1: `Accept(1, v1)` → **ALL REJECTED** (promised $n=2$)
4. P1: `Prepare(3)` → A, B, C → all Promise (now won't accept $n=2$)
5. P2: `Accept(2, v2)` → **ALL REJECTED** (promised $n=3$)
6. P2: `Prepare(4)` → ... cycle continues

**Fix**: Introduce randomized backoff or elect a single leader.

</details>

---

## Key Takeaways

1. **Paxos solves consensus** — agreeing on a single value despite failures
2. **Two phases** ensure safety: Phase 1 discovers prior decisions, Phase 2 commits new ones
3. **Quorum intersection** is the foundation of correctness
4. **Multi-Paxos** extends to sequences of decisions with an elected leader
5. **Liveness requires a leader** — Basic Paxos alone can livelock
6. **Implementation is hard** — the paper intentionally omits many practical details
7. **Raft is equivalent in power** but designed for understandability
8. **Persistence is critical** — acceptors must write to disk before responding

---

## Further Reading

- Lamport, L. "The Part-Time Parliament" (1998) — original paper
- Lamport, L. "Paxos Made Simple" (2001) — simplified explanation
- Chandra, T. et al. "Paxos Made Live" (2007) — Google's implementation experience
- Ongaro, D. & Ousterhout, J. "In Search of an Understandable Consensus Algorithm" (2014) — Raft
- Howard, H. et al. "Flexible Paxos" (2016) — relaxed quorum requirements
- Van Renesse, R. "Paxos Made Moderately Complex" (2015) — detailed pseudocode
