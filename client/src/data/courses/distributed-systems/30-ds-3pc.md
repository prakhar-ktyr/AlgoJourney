---
title: "Three-Phase Commit"
---

# Three-Phase Commit (3PC)

The **Three-Phase Commit (3PC)** protocol was designed to solve the fundamental blocking problem of Two-Phase Commit (2PC). By adding an extra phase, 3PC ensures that participants can make progress even when the coordinator fails.

---

## Why 3PC Was Created

### The 2PC Blocking Problem

In 2PC, participants can get stuck in an **uncertain state**:

```
Scenario: Coordinator fails after sending "prepare"

Participant A: voted YES → waiting for decision
Participant B: voted YES → waiting for decision

Both participants are BLOCKED:
- Cannot commit (don't know if all voted YES)
- Cannot abort (coordinator might have decided COMMIT)
- Must wait indefinitely for coordinator recovery
```

This blocking occurs because participants have **no way to distinguish** between:
- Coordinator crashed before deciding
- Coordinator decided COMMIT but message was lost
- Coordinator decided ABORT but message was lost

### The Core Insight

The key insight behind 3PC is to add an intermediate phase that ensures:

> **No participant can be in an uncertain state while another participant has already committed or aborted.**

This property is called the **non-blocking** guarantee.

---

## The Three Phases

### Phase Overview

| Phase | Coordinator Action | Participant Action | Purpose |
|-------|-------------------|-------------------|---------|
| **canCommit** | Send VOTE-REQUEST | Reply YES/NO | Gather votes |
| **preCommit** | Send PRE-COMMIT | Acknowledge | Prepare to commit |
| **doCommit** | Send DO-COMMIT | Commit | Execute commit |

### Phase 1: canCommit (Voting Phase)

```
┌─────────────┐                    ┌─────────────┐
│ Coordinator │                    │ Participant │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │──── VOTE-REQUEST ───────────────>│
       │                                  │
       │<─── YES (or NO) ────────────────│
       │                                  │
```

**Coordinator:**
1. Sends `VOTE-REQUEST` to all participants
2. Waits for responses (with timeout)
3. If any participant votes NO or times out → ABORT

**Participant:**
1. Receives `VOTE-REQUEST`
2. Checks if it can commit the transaction
3. Replies `YES` (can commit) or `NO` (cannot commit)
4. If votes YES → enters **UNCERTAIN** state

### Phase 2: preCommit (Pre-Commit Phase)

```
┌─────────────┐                    ┌─────────────┐
│ Coordinator │                    │ Participant │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │──── PRE-COMMIT ────────────────>│
       │                                  │
       │<─── ACK ───────────────────────│
       │                                  │
```

**Coordinator (if all voted YES):**
1. Sends `PRE-COMMIT` to all participants
2. Waits for acknowledgments (with timeout)
3. Records decision in stable storage

**Participant:**
1. Receives `PRE-COMMIT`
2. Writes commit record to log (but does NOT commit yet)
3. Sends `ACK` to coordinator
4. Enters **PREPARED-TO-COMMIT** state

### Phase 3: doCommit (Commit Phase)

```
┌─────────────┐                    ┌─────────────┐
│ Coordinator │                    │ Participant │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │──── DO-COMMIT ─────────────────>│
       │                                  │
       │<─── COMMITTED ─────────────────│
       │                                  │
```

**Coordinator (if all ACKed):**
1. Sends `DO-COMMIT` to all participants
2. Waits for confirmation

**Participant:**
1. Receives `DO-COMMIT`
2. Commits the transaction
3. Sends `COMMITTED` confirmation
4. Releases all locks and resources

---

## How 3PC Avoids Blocking

### The Key Difference from 2PC

In 3PC, the states are arranged so that:

```
State Transitions:

2PC States:          3PC States:
─────────────        ─────────────────────────
INITIAL              INITIAL
    ↓                    ↓
UNCERTAIN ←(blocked) canCommit (UNCERTAIN)
    ↓                    ↓
COMMITTED/ABORTED    preCommit (PREPARED-TO-COMMIT)
                         ↓
                     doCommit (COMMITTED/ABORTED)
```

### The Non-Blocking Property

The extra phase creates a **buffer zone** between uncertainty and commitment:

| If coordinator fails... | Participant State | Safe Action |
|------------------------|-------------------|-------------|
| Before PRE-COMMIT sent | UNCERTAIN | **ABORT** (safe: no one committed) |
| After PRE-COMMIT, before DO-COMMIT | PREPARED-TO-COMMIT | **COMMIT** (safe: all agreed) |
| After DO-COMMIT | COMMITTED | Already done |

### Why This Works

```javascript
// 3PC Recovery Logic (simplified)
function recoverFromCoordinatorFailure(participantState, peerStates) {
  if (participantState === "UNCERTAIN") {
    // No one could have committed yet (PRE-COMMIT not sent)
    return "ABORT";
  }

  if (participantState === "PREPARED-TO-COMMIT") {
    // All participants voted YES and received PRE-COMMIT
    // Safe to elect new coordinator and proceed
    if (anyPeerHasCommitted(peerStates)) {
      return "COMMIT";
    }
    if (anyPeerIsUncertain(peerStates)) {
      return "ABORT";
    }
    return "COMMIT"; // All peers are PREPARED-TO-COMMIT
  }

  if (participantState === "COMMITTED") {
    return "COMMIT"; // Already committed
  }
}
```

---

## Timeout-Based Decisions

### Timeouts at Each Phase

3PC relies heavily on timeouts to make progress without the coordinator:

```
Phase 1 Timeout (Coordinator):
  - Waiting for votes
  - Action: ABORT (safe, no one committed)
  - Timeout duration: T1

Phase 1 Timeout (Participant):
  - Waiting for VOTE-REQUEST
  - Action: ABORT (haven't voted yet)
  - Timeout duration: T1

Phase 2 Timeout (Coordinator):
  - Waiting for ACKs
  - Action: Abort or retry PRE-COMMIT
  - Timeout duration: T2

Phase 2 Timeout (Participant):
  - Waiting for PRE-COMMIT or ABORT
  - State: UNCERTAIN
  - Action: ABORT (no PRE-COMMIT means no one committed)
  - Timeout duration: T2

Phase 3 Timeout (Participant):
  - Waiting for DO-COMMIT
  - State: PREPARED-TO-COMMIT
  - Action: Elect new coordinator, then COMMIT
  - Timeout duration: T3
```

### Timeout Decision Table

| Participant State | Timeout Event | Decision | Reasoning |
|------------------|---------------|----------|-----------|
| INITIAL | No VOTE-REQUEST | ABORT | Transaction never started |
| UNCERTAIN | No PRE-COMMIT | ABORT | Coordinator may have aborted |
| PREPARED-TO-COMMIT | No DO-COMMIT | COMMIT | All voted YES, safe to proceed |

---

## 3PC Message Flow

### Successful Commit

```
Coordinator          Participant A       Participant B
    │                     │                    │
    │── VOTE-REQ ────────>│                    │
    │── VOTE-REQ ─────────────────────────────>│
    │                     │                    │
    │<── YES ─────────────│                    │
    │<── YES ──────────────────────────────────│
    │                     │                    │
    │── PRE-COMMIT ──────>│                    │
    │── PRE-COMMIT ────────────────────────────>│
    │                     │                    │
    │<── ACK ─────────────│                    │
    │<── ACK ──────────────────────────────────│
    │                     │                    │
    │── DO-COMMIT ───────>│                    │
    │── DO-COMMIT ─────────────────────────────>│
    │                     │                    │
    │<── COMMITTED ───────│                    │
    │<── COMMITTED ────────────────────────────│
```

### Abort Scenario (Participant Votes NO)

```
Coordinator          Participant A       Participant B
    │                     │                    │
    │── VOTE-REQ ────────>│                    │
    │── VOTE-REQ ─────────────────────────────>│
    │                     │                    │
    │<── YES ─────────────│                    │
    │<── NO ───────────────────────────────────│
    │                     │                    │
    │── ABORT ───────────>│                    │
    │── ABORT ─────────────────────────────────>│
    │                     │                    │
    │   (Transaction Aborted)                  │
```

### Coordinator Failure and Recovery

```
Coordinator          Participant A       Participant B
    │                     │                    │
    │── VOTE-REQ ────────>│                    │
    │── VOTE-REQ ─────────────────────────────>│
    │<── YES ─────────────│                    │
    │<── YES ──────────────────────────────────│
    │── PRE-COMMIT ──────>│                    │
    │── PRE-COMMIT ────────────────────────────>│
    │<── ACK ─────────────│                    │
    ╳ (Coordinator crashes)                    │
    │                     │                    │
    │              [Timeout expires]            │
    │                     │                    │
    │         ┌───────────┤                    │
    │         │ A elected │                    │
    │         │ new coord │                    │
    │         └───────────┤                    │
    │                     │── DO-COMMIT ──────>│
    │                     │<── COMMITTED ──────│
    │                     │                    │
    │          (Transaction committed)         │
```

---

## Failure Handling Improvements Over 2PC

### Comparison of Failure Scenarios

| Failure Scenario | 2PC Behavior | 3PC Behavior |
|-----------------|-------------|-------------|
| Coordinator fails before decision | **Blocked** until recovery | Participants timeout and ABORT |
| Coordinator fails after decision | **Blocked** until recovery | Participants elect new coordinator |
| Participant fails before voting | Coordinator aborts (timeout) | Same as 2PC |
| Participant fails after voting YES | Coordinator proceeds | Same as 2PC |
| Both coordinator + participant fail | **May be permanently blocked** | Remaining nodes can decide |

### Recovery Protocol

```python
class ThreePhaseCommitRecovery:
    def elect_new_coordinator(self, surviving_participants):
        """Elect new coordinator from surviving participants."""
        # Choose participant with highest ID (or any deterministic rule)
        new_coordinator = max(surviving_participants, key=lambda p: p.id)
        return new_coordinator

    def termination_protocol(self, participants):
        """
        Run by newly elected coordinator to reach a decision.
        Queries all surviving participants for their states.
        """
        states = [p.get_state() for p in participants]

        # If anyone has committed → everyone commits
        if any(s == "COMMITTED" for s in states):
            return "COMMIT"

        # If anyone has aborted → everyone aborts
        if any(s == "ABORTED" for s in states):
            return "ABORT"

        # If anyone is still UNCERTAIN → abort
        # (PRE-COMMIT wasn't sent to everyone)
        if any(s == "UNCERTAIN" for s in states):
            return "ABORT"

        # All are PREPARED-TO-COMMIT → safe to commit
        if all(s == "PREPARED_TO_COMMIT" for s in states):
            return "COMMIT"

        return "ABORT"  # Default safe action
```

### State Machine

```
┌─────────┐  VOTE-REQ   ┌───────────┐
│ INITIAL │────────────>│ UNCERTAIN │
└─────────┘             └─────┬─────┘
                              │
                 ┌────────────┼────────────┐
                 │ PRE-COMMIT │            │ ABORT/Timeout
                 ▼            │            ▼
        ┌────────────────┐    │     ┌──────────┐
        │ PREPARED-TO-   │    │     │ ABORTED  │
        │ COMMIT         │    │     └──────────┘
        └───────┬────────┘    │
                │ DO-COMMIT   │
                ▼             │
        ┌────────────┐       │
        │ COMMITTED  │       │
        └────────────┘       │
```

---

## Limitations: Network Partitions

### The Fatal Flaw

3PC assumes a **fail-stop** model (nodes either work correctly or crash). It does **NOT** handle **network partitions**:

```
Network Partition Scenario:

    Partition A              │          Partition B
    ─────────────────────────│──────────────────────
    Participant 1: PREPARED  │  Participant 3: UNCERTAIN
    Participant 2: PREPARED  │  Participant 4: UNCERTAIN
                             │
    Decision: COMMIT         │  Decision: ABORT
    (all are PREPARED)       │  (some are UNCERTAIN)

    RESULT: INCONSISTENCY! 💥
```

### Why Partitions Break 3PC

```
Timeline of partition failure:

1. Coordinator sends PRE-COMMIT to participants 1, 2
2. Network partitions before PRE-COMMIT reaches 3, 4
3. Coordinator crashes

Partition A (has participants 1, 2):
  - Both in PREPARED-TO-COMMIT state
  - Elect new coordinator
  - Termination protocol: all PREPARED → COMMIT ✓

Partition B (has participants 3, 4):
  - Both in UNCERTAIN state
  - Elect new coordinator
  - Termination protocol: some UNCERTAIN → ABORT ✗

VIOLATION: Safety property broken!
```

### Formal Impossibility

This relates to the **FLP Impossibility Result** (Fischer, Lynch, Paterson 1985):

> No deterministic consensus protocol can guarantee both safety and liveness in an asynchronous system with even one possible crash failure.

3PC trades partition tolerance for non-blocking behavior — the opposite trade-off from 2PC.

---

## Why 3PC Is Rarely Used in Practice

### Practical Problems

| Issue | Explanation |
|-------|-------------|
| Network partitions are common | Real networks partition frequently |
| Extra round trip | 3 message rounds vs 2 in 2PC |
| Higher latency | Each phase adds network delay |
| Complex implementation | More states, more failure modes |
| Timeout tuning | Wrong timeouts cause incorrect decisions |
| Better alternatives exist | Paxos/Raft solve the problem properly |

### Cost Analysis

```
Message Complexity:
  2PC: 3n messages (n = participants)
       - n VOTE-REQ + n VOTE + n DECISION

  3PC: 5n messages
       - n VOTE-REQ + n VOTE + n PRE-COMMIT + n ACK + n DO-COMMIT

Latency:
  2PC: 2 round trips (vote + decide)
  3PC: 3 round trips (vote + pre-commit + commit)

For n = 5 participants:
  2PC: 15 messages, 2 RTT
  3PC: 25 messages, 3 RTT
  Overhead: 67% more messages, 50% more latency
```

### Real-World Preference

```
Production Systems and Their Choice:
─────────────────────────────────────
MySQL/PostgreSQL:     2PC (with coordinator recovery)
Google Spanner:       Paxos-based commit
CockroachDB:         Parallel Commits (Raft-based)
Amazon DynamoDB:     Paxos
Apache Kafka:        Raft (KRaft)
MongoDB:             Raft-based replication + 2PC for sharded txns

None use 3PC in production!
```

---

## Comparison: 2PC vs 3PC vs Paxos Commit

### Protocol Comparison Table

| Property | 2PC | 3PC | Paxos Commit |
|----------|-----|-----|--------------|
| Message rounds | 2 | 3 | 3+ |
| Messages (n participants) | 3n | 5n | O(n²) |
| Blocking on coordinator failure | **Yes** | No | No |
| Handles network partitions | No | **No** | **Yes** |
| Safety guaranteed | Yes | Only without partitions | **Yes** |
| Liveness guaranteed | No (blocks) | Yes (without partitions) | Yes (probabilistic) |
| Implementation complexity | Low | Medium | High |
| Used in production | Yes | Rarely | Yes |

### When to Use Each

```
Decision Guide:
─────────────────────────────────────────────────────────

Use 2PC when:
  ✓ Coordinator rarely fails
  ✓ Low latency is critical
  ✓ You have coordinator recovery mechanisms
  ✓ Network is reliable (single datacenter)

Use 3PC when:
  ✓ Network is reliable (no partitions)
  ✓ Coordinator failures are common
  ✓ Cannot tolerate blocking
  ✓ Theoretical/academic contexts

Use Paxos Commit when:
  ✓ Network partitions are possible
  ✓ Must never block
  ✓ Safety is paramount
  ✓ Can tolerate higher latency and complexity
  ✓ Multi-datacenter deployments
```

### Paxos Commit Overview

```
Paxos Commit replaces the single coordinator with a Paxos group:

Traditional 2PC:
  Coordinator (single point of failure)
       │
  ┌────┼────┐
  P1   P2   P3

Paxos Commit:
  Paxos Group (replicated, fault-tolerant)
  ┌─────────────────┐
  │ Leader │ Replica │ Replica │
  └────────┼────────┘
       │
  ┌────┼────┐
  P1   P2   P3

Each participant's vote is decided by a Paxos instance,
so even if participants or coordinator replicas crash,
the system makes progress.
```

---

## Modern Alternatives

### Practical Solutions Used Today

**1. 2PC + Coordinator Replication**

```
Most common approach in practice:

┌─────────────────────────────┐
│ Replicated Coordinator      │
│ (Raft/Paxos internally)     │
│ ┌───────┐ ┌───────┐ ┌───┐  │
│ │Leader │ │Follow │ │F  │  │
│ └───────┘ └───────┘ └───┘  │
└──────────────┬──────────────┘
               │ 2PC externally
          ┌────┼────┐
          P1   P2   P3

Examples: Google Spanner, CockroachDB
```

**2. Saga Pattern (Compensating Transactions)**

```javascript
// Instead of distributed commit, use compensating actions
class TransferSaga {
  async execute(fromAccount, toAccount, amount) {
    // Step 1: Debit source
    const debitId = await debit(fromAccount, amount);

    try {
      // Step 2: Credit destination
      await credit(toAccount, amount);
    } catch (error) {
      // Compensate: reverse the debit
      await reverseDebit(fromAccount, debitId);
      throw new Error("Transfer failed, compensated");
    }
  }
}
```

**3. Consensus-Based Commit (Raft/Paxos)**

```
Raft-based transaction commit:

1. Transaction coordinator proposes commit to Raft group
2. Raft replicates the decision to majority
3. Once committed in Raft log → decision is durable
4. Coordinator notifies participants of decision
5. If coordinator fails, new leader reads decision from log
```

**4. Parallel Commits (CockroachDB approach)**

```
Optimization: don't wait for coordinator to write decision

1. Participants write their prepared state (STAGING)
2. Coordinator returns success to client immediately
3. Decision is implicitly: COMMIT if all are STAGING
4. Any reader can determine the outcome by checking
   all participant states directly
```

---

## When 3PC Might Still Be Relevant

### Valid Use Cases

Despite its limitations, 3PC concepts appear in:

**1. Synchronous Networks**

```
In truly synchronous networks (bounded message delay):
- Network partitions are detectable
- Timeouts reliably indicate crashes
- 3PC works correctly

Examples:
- Shared-memory multiprocessor systems
- Tightly-coupled cluster interconnects
- Some real-time embedded systems
```

**2. Educational Value**

Understanding 3PC teaches important distributed systems concepts:
- Why extra phases help with non-blocking
- The fundamental trade-off between safety and liveness
- Why network partition handling is hard
- How state machine design affects recovery

**3. Building Blocks**

```
3PC ideas influence modern protocols:

┌────────────────────────────────────────────┐
│ 3PC Concept          │ Modern Application  │
├──────────────────────┼─────────────────────┤
│ Pre-commit phase     │ Raft's AppendEntries│
│ Timeout-based abort  │ Lease-based systems │
│ State separation     │ Multi-version CC    │
│ New coord election   │ Leader election     │
└──────────────────────┴─────────────────────┘
```

**4. Hybrid Approaches**

```python
class EnhancedCommitProtocol:
    """
    Combines 3PC non-blocking with partition detection.
    Used in some research systems.
    """

    def decide(self, participant_states, network_status):
        if network_status == "PARTITIONED":
            # Fall back to 2PC (safe but blocking)
            return self.run_2pc(participant_states)
        else:
            # Use 3PC (non-blocking when no partition)
            return self.run_3pc(participant_states)
```

---

## Exercises

### Exercise 1: State Analysis

Given the following 3PC scenario, determine the correct outcome:

```
Participants: A, B, C, D
Coordinator sends PRE-COMMIT to all
A receives PRE-COMMIT → state: PREPARED-TO-COMMIT
B receives PRE-COMMIT → state: PREPARED-TO-COMMIT
C does NOT receive PRE-COMMIT → state: UNCERTAIN
D does NOT receive PRE-COMMIT → state: UNCERTAIN
Coordinator crashes.

Question: What should the termination protocol decide?
```

<details>
<summary>Solution</summary>

**ABORT**. The termination protocol queries all surviving participants. Since C and D are in the UNCERTAIN state, the protocol cannot safely commit (they never received PRE-COMMIT, meaning not all participants acknowledged readiness). The correct decision is ABORT.

Key rule: If ANY participant is UNCERTAIN, the decision must be ABORT.

</details>

### Exercise 2: Partition Scenario

```
5 participants: P1, P2, P3, P4, P5
All received PRE-COMMIT and are in PREPARED-TO-COMMIT state
Network partitions into: {P1, P2} and {P3, P4, P5}
Coordinator was in partition {P1, P2} and crashes.

What happens in each partition?
Why is this problematic?
```

<details>
<summary>Solution</summary>

**Partition {P1, P2}:** Elects new coordinator. All visible participants are PREPARED-TO-COMMIT → decides COMMIT.

**Partition {P3, P4, P5}:** Elects new coordinator. All visible participants are PREPARED-TO-COMMIT → decides COMMIT.

In this specific case, both partitions reach the same decision (COMMIT), so there's no inconsistency. However, this is only safe because ALL participants had already received PRE-COMMIT.

The problematic case is when PRE-COMMIT was only partially delivered before the partition, leading to mixed states across partitions (as shown in Exercise 1 but with a partition instead of just a crash).

</details>

### Exercise 3: Implementation

Implement the 3PC coordinator state machine:

```javascript
class ThreePhaseCoordinator {
  constructor(participants) {
    this.participants = participants;
    this.state = "INIT";
    this.votes = new Map();
    this.acks = new Map();
  }

  // TODO: Implement startTransaction()
  // TODO: Implement handleVote(participantId, vote)
  // TODO: Implement handleAck(participantId)
  // TODO: Implement handleTimeout(phase)
}
```

<details>
<summary>Solution</summary>

```javascript
class ThreePhaseCoordinator {
  constructor(participants) {
    this.participants = participants;
    this.state = "INIT";
    this.votes = new Map();
    this.acks = new Map();
  }

  startTransaction() {
    this.state = "WAITING_VOTES";
    for (const p of this.participants) {
      p.send("VOTE-REQUEST");
    }
    this.startTimeout("VOTE", 5000);
  }

  handleVote(participantId, vote) {
    if (this.state !== "WAITING_VOTES") return;

    this.votes.set(participantId, vote);

    if (vote === "NO") {
      this.abort();
      return;
    }

    if (this.votes.size === this.participants.length) {
      if ([...this.votes.values()].every(v => v === "YES")) {
        this.sendPreCommit();
      } else {
        this.abort();
      }
    }
  }

  sendPreCommit() {
    this.state = "WAITING_ACKS";
    for (const p of this.participants) {
      p.send("PRE-COMMIT");
    }
    this.startTimeout("ACK", 5000);
  }

  handleAck(participantId) {
    if (this.state !== "WAITING_ACKS") return;

    this.acks.set(participantId, true);

    if (this.acks.size === this.participants.length) {
      this.doCommit();
    }
  }

  doCommit() {
    this.state = "COMMITTED";
    for (const p of this.participants) {
      p.send("DO-COMMIT");
    }
  }

  abort() {
    this.state = "ABORTED";
    for (const p of this.participants) {
      p.send("ABORT");
    }
  }

  handleTimeout(phase) {
    if (phase === "VOTE" && this.state === "WAITING_VOTES") {
      this.abort();
    }
    if (phase === "ACK" && this.state === "WAITING_ACKS") {
      this.abort();
    }
  }
}
```

</details>

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Purpose of 3PC | Eliminate blocking when coordinator fails |
| Three phases | canCommit → preCommit → doCommit |
| Non-blocking property | No uncertain participant while another committed |
| Timeout decisions | UNCERTAIN → ABORT; PREPARED → COMMIT |
| Fatal limitation | Breaks under network partitions |
| Practice | Rarely used; 2PC + replication or Paxos preferred |
| Legacy | Concepts live on in modern protocol design |

### Key Takeaways

1. **3PC adds a buffer phase** between voting and committing
2. **Timeouts enable progress** when the coordinator is unavailable
3. **Network partitions break 3PC** — the protocol assumes fail-stop
4. **Modern systems prefer** replicated coordinators over extra phases
5. **Understanding 3PC** illuminates fundamental distributed systems trade-offs

---

## Further Reading

- Skeen, D. "Nonblocking Commit Protocols" (1981) — original 3PC paper
- Bernstein, Hadzilacos, Goodman. "Concurrency Control and Recovery in Database Systems"
- Fischer, Lynch, Paterson. "Impossibility of Distributed Consensus with One Faulty Process" (1985)
- Gray, J. & Lamport, L. "Consensus on Transaction Commit" (2006) — Paxos Commit
