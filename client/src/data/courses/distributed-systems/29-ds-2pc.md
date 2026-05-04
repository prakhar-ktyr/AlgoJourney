---
title: "Two-Phase Commit"
---

# Two-Phase Commit (2PC)

In distributed systems, when a transaction spans multiple nodes, we need a way to ensure that **all nodes agree** on whether to commit or abort. The Two-Phase Commit (2PC) protocol solves this atomic commit problem.

---

## The Atomic Commit Problem

When a distributed transaction involves multiple participants (databases, services, or nodes), we face a fundamental challenge:

- Either **all participants commit** the transaction, or
- **All participants abort** the transaction

No partial commits are allowed — this would leave the system in an inconsistent state.

### Why Is This Hard?

| Challenge | Description |
|-----------|-------------|
| Network failures | Messages between nodes can be lost or delayed |
| Node crashes | Any participant or coordinator can fail at any time |
| Partial failures | Some nodes may succeed while others fail |
| No global clock | Nodes cannot agree on a single point in time |

---

## 2PC Architecture

The protocol involves two roles:

### Coordinator

- Initiates the commit protocol
- Collects votes from all participants
- Makes the final commit/abort decision
- Notifies all participants of the decision

### Participants

- Execute the transaction locally
- Vote on whether they can commit
- Follow the coordinator's final decision

```
┌─────────────┐
│ Coordinator │
└──────┬──────┘
       │
  ┌────┼────┐
  │    │    │
  ▼    ▼    ▼
┌───┐┌───┐┌───┐
│ P1││ P2││ P3│
└───┘└───┘└───┘
Participants
```

---

## Phase 1: Prepare (Voting Phase)

In the first phase, the coordinator asks all participants if they are ready to commit.

### Steps

1. **Coordinator sends PREPARE** to all participants
2. Each participant **executes the transaction** up to the point of committing
3. Each participant **writes to its local log** (undo and redo information)
4. Each participant responds with either:
   - **VOTE-COMMIT** ("Yes, I can commit")
   - **VOTE-ABORT** ("No, I cannot commit")

### Participant Decision Rules

A participant votes COMMIT only if:

- The transaction executed successfully locally
- It has written all necessary log records to stable storage
- It is prepared to commit even after a crash and recovery

```
Coordinator                    Participant
    │                              │
    │──── PREPARE ────────────────▶│
    │                              │ (execute transaction)
    │                              │ (write to WAL)
    │                              │ (acquire locks)
    │◀─── VOTE-COMMIT ────────────│
    │                              │
```

---

## Phase 2: Commit/Abort (Decision Phase)

Based on the votes received, the coordinator makes a global decision.

### Commit Path (All Voted Yes)

1. Coordinator writes **COMMIT record** to its log
2. Coordinator sends **GLOBAL-COMMIT** to all participants
3. Each participant **commits** the transaction locally
4. Each participant sends **ACK** to the coordinator
5. Coordinator completes the transaction after receiving all ACKs

### Abort Path (Any Voted No or Timeout)

1. Coordinator writes **ABORT record** to its log
2. Coordinator sends **GLOBAL-ABORT** to all participants
3. Each participant **rolls back** the transaction locally
4. Each participant sends **ACK** to the coordinator

```
── COMMIT PATH ──                  ── ABORT PATH ──

Coordinator    Participant         Coordinator    Participant
    │              │                   │              │
    │── COMMIT ──▶│                   │── ABORT ───▶│
    │              │ (commit)          │              │ (rollback)
    │◀──── ACK ───│                   │◀──── ACK ───│
    │              │                   │              │
```

---

## Complete 2PC Message Flow

Here is the full protocol with timing:

```
Time  Coordinator              Participant A         Participant B
─────────────────────────────────────────────────────────────────
 t0   BEGIN transaction
 t1   Send PREPARE ──────────▶ Receive PREPARE
 t2   Send PREPARE ─────────────────────────────────▶ Receive PREPARE
 t3                            Execute locally        Execute locally
 t4                            Write WAL              Write WAL
 t5   Receive VOTE-COMMIT ◀── Send VOTE-COMMIT
 t6   Receive VOTE-COMMIT ◀─────────────────────────── Send VOTE-COMMIT
 t7   Decision: COMMIT
      Write COMMIT to log
 t8   Send GLOBAL-COMMIT ───▶ Receive COMMIT
 t9   Send GLOBAL-COMMIT ──────────────────────────▶ Receive COMMIT
t10                            Commit locally         Commit locally
t11   Receive ACK ◀────────── Send ACK
t12   Receive ACK ◀─────────────────────────────────── Send ACK
t13   Transaction complete
```

---

## Failure Scenarios

### Scenario 1: Participant Crash Before Voting

| Event | Action |
|-------|--------|
| Participant crashes before sending vote | Coordinator times out waiting for vote |
| Coordinator decision | ABORT (missing vote = no) |
| Recovery | Participant rolls back on restart |

### Scenario 2: Participant Crash After Voting COMMIT

| Event | Action |
|-------|--------|
| Participant voted COMMIT, then crashes | Coordinator proceeds with decision |
| On recovery | Participant checks log, contacts coordinator for decision |
| Key constraint | Participant **must** follow the coordinator's decision |

### Scenario 3: Coordinator Crash After Sending PREPARE

This is the most problematic scenario:

```
Coordinator crashes here
        ↓
PREPARE sent → Votes received → [CRASH] → Decision never sent
```

**Participants are left in an uncertain state:**

- They voted COMMIT but don't know the global decision
- They **cannot unilaterally abort** (another participant may have committed)
- They **cannot unilaterally commit** (the coordinator may decide to abort)
- They must **hold locks and wait** for the coordinator to recover

### Scenario 4: Network Partition

```
┌─────────────┐         ╳ NETWORK        ┌─────────────┐
│ Coordinator │         ╳ PARTITION       │ Participant │
│             │◀────────╳────────────────▶│  (waiting)  │
└─────────────┘         ╳                 └─────────────┘
```

The participant cannot distinguish between:
- Coordinator crashed
- Network partition
- Slow coordinator

---

## The Blocking Problem

The most significant limitation of 2PC is that it is a **blocking protocol**.

### What Does Blocking Mean?

After a participant votes COMMIT, it enters an **uncertain state** where it:

1. Cannot commit (doesn't know global decision)
2. Cannot abort (may violate atomicity)
3. Must hold all locks
4. Must wait indefinitely for the coordinator

### Impact of Blocking

```javascript
// Pseudocode showing the blocking problem
class Participant {
  async handlePrepare(transaction) {
    // Execute transaction
    await this.executeLocally(transaction);
    await this.writeToWAL(transaction);

    // Send vote
    this.sendVoteCommit();

    // BLOCKING STATE: Cannot proceed without coordinator
    // All locks held, resources unavailable
    const decision = await this.waitForDecision(); // May block forever!

    if (decision === "COMMIT") {
      await this.commit(transaction);
    } else {
      await this.rollback(transaction);
    }
  }
}
```

### Why Blocking Is Dangerous

| Problem | Consequence |
|---------|-------------|
| Lock contention | Other transactions cannot access locked resources |
| Resource exhaustion | Connections and memory held indefinitely |
| Cascading failures | Blocked participant causes upstream timeouts |
| Reduced availability | System partially unavailable during uncertainty |

---

## 2PC in Practice

### Distributed Databases

```sql
-- Example: Distributed transaction across two database shards

-- Coordinator begins
BEGIN DISTRIBUTED TRANSACTION;

-- Operations on Shard A
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- Shard A

-- Operations on Shard B
UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- Shard B

-- Coordinator initiates 2PC
COMMIT;  -- Triggers PREPARE on both shards, then COMMIT/ABORT
```

### XA Transactions (X/Open Standard)

XA is the industry standard interface for 2PC:

```java
// Java XA Transaction Example
import javax.transaction.xa.*;

// Get XA resources from two databases
XAResource xaRes1 = connection1.getXAResource();
XAResource xaRes2 = connection2.getXAResource();

Xid xid = new MyXid();  // Global transaction ID

// Phase 1: Prepare
xaRes1.start(xid, XAResource.TMNOFLAGS);
// ... execute operations on resource 1 ...
xaRes1.end(xid, XAResource.TMSUCCESS);

xaRes2.start(xid, XAResource.TMNOFLAGS);
// ... execute operations on resource 2 ...
xaRes2.end(xid, XAResource.TMSUCCESS);

// Phase 1: Vote
int vote1 = xaRes1.prepare(xid);  // Returns XA_OK or XA_RDONLY
int vote2 = xaRes2.prepare(xid);

// Phase 2: Commit or Rollback
if (vote1 == XAResource.XA_OK && vote2 == XAResource.XA_OK) {
    xaRes1.commit(xid, false);
    xaRes2.commit(xid, false);
} else {
    xaRes1.rollback(xid);
    xaRes2.rollback(xid);
}
```

---

## Performance Overhead

### Message Complexity

| Phase | Messages | Round Trips |
|-------|----------|-------------|
| Phase 1 (Prepare) | 2N (N prepare + N votes) | 1 |
| Phase 2 (Commit) | 2N (N commit + N acks) | 1 |
| **Total** | **4N** | **2** |

Where N = number of participants.

### Latency Impact

```
Normal operation:    |── Phase 1 ──|── Phase 2 ──|
                     |   ~RTT      |   ~RTT      |

With disk fsync:     |── Phase 1 + fsync ──|── Phase 2 + fsync ──|
                     |      ~RTT + disk     |      ~RTT + disk     |
```

### Forced Log Writes

Each decision point requires a **forced write** (fsync) to stable storage:

- Participant: force-write VOTE-COMMIT before sending vote
- Coordinator: force-write COMMIT/ABORT before sending decision
- Participant: force-write COMMIT/ABORT before acknowledging

These fsyncs add significant latency (typically 5-10ms each on HDD).

---

## Why 2PC Is "Anti-Availability"

2PC sacrifices availability for consistency:

| Property | 2PC Behavior |
|----------|--------------|
| Coordinator failure | All participants block |
| Single participant failure | Entire transaction aborts |
| Network partition | Affected participants block |
| Slow participant | All participants wait |

### The CAP Theorem Perspective

2PC chooses **Consistency over Availability**:

- It guarantees atomic commits (consistency)
- But a single failure can make the system unavailable
- This is fundamentally at odds with high-availability designs

```
           Consistency
              /\
             /  \
            / 2PC\
           /______\
          /        \
Availability ──── Partition Tolerance
```

---

## Comparison with Other Commit Protocols

| Protocol | Blocking? | Messages | Fault Tolerance | Complexity |
|----------|-----------|----------|-----------------|------------|
| 2PC | Yes | 4N | Coordinator is SPOF | Low |
| 3PC | No (partially) | 6N | Better than 2PC | Medium |
| Paxos Commit | No | ~5N | Tolerates f failures | High |
| Saga | No | Varies | Compensating transactions | Medium |
| TCC (Try-Confirm-Cancel) | No | 3N | Application-level | Medium |

### Three-Phase Commit (3PC)

Adds a **pre-commit** phase to reduce blocking:

```
Phase 1: PREPARE → VOTE
Phase 2: PRE-COMMIT → ACK      ← New phase
Phase 3: COMMIT → ACK
```

However, 3PC can violate safety under network partitions, making it rarely used in practice.

### Saga Pattern (Alternative Approach)

```
T1 → T2 → T3 → ... → Tn        (forward execution)
C1 ← C2 ← C3 ← ... ← Cn       (compensating transactions on failure)
```

Sagas avoid the blocking problem by using compensating transactions instead of locks.

---

## Real-World Usage

### MySQL (InnoDB)

```sql
-- MySQL internal 2PC for binary log + InnoDB
-- Ensures binlog and storage engine are in sync

-- Coordinator: MySQL server
-- Participants: InnoDB engine + binary log

SET innodb_support_xa = ON;  -- Enable internal 2PC (default)
```

MySQL uses 2PC internally to coordinate between the binary log (for replication) and InnoDB storage engine.

### PostgreSQL

```sql
-- PostgreSQL prepared transactions (manual 2PC)

-- On participant node:
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
PREPARE TRANSACTION 'txn_transfer_001';

-- Later, coordinator decides:
COMMIT PREPARED 'txn_transfer_001';
-- or
ROLLBACK PREPARED 'txn_transfer_001';
```

### Google Spanner

Google Spanner uses 2PC combined with Paxos groups:

- Each participant is a **Paxos group** (not a single node)
- The coordinator is also replicated via Paxos
- TrueTime provides global ordering without traditional locking

This eliminates the single-coordinator failure problem.

### CockroachDB

Uses a variant of 2PC with parallel commits:

- Writes are pipelined with the commit
- Reduces latency from 2 round trips to 1 in the common case
- Falls back to standard 2PC when conflicts are detected

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Atomic commit | All-or-nothing across distributed nodes |
| Phase 1 | Coordinator asks, participants vote |
| Phase 2 | Coordinator decides, participants follow |
| Blocking | Participants stuck if coordinator fails after prepare |
| Performance | 4N messages, 2 round trips, forced disk writes |
| Availability | Single failure can block entire transaction |
| XA | Industry standard interface for 2PC |
| Modern usage | Combined with replication (Spanner, CockroachDB) |

---

## Exercises

1. **Trace the Protocol**: A distributed transaction involves 3 participants. Participant B votes ABORT while A and C vote COMMIT. Draw the complete message flow including the abort path.

2. **Failure Analysis**: The coordinator crashes after receiving all COMMIT votes but before writing the COMMIT decision to its log. What happens when it recovers? What do the participants do?

3. **Calculate Overhead**: A system has 5 participants. Each network round trip takes 2ms, and each forced disk write takes 8ms. Calculate the minimum latency for a successful 2PC commit.

4. **Design Exercise**: You need to transfer money between two banks. Design a system using 2PC. Then redesign it using the Saga pattern with compensating transactions. Compare the trade-offs.

5. **Code Challenge**: Implement a simplified 2PC coordinator in pseudocode that handles:
   - Timeout on participant vote (should abort)
   - Participant crash after voting commit (should retry commit on recovery)
   - Logging decisions to stable storage before sending messages

6. **Critical Thinking**: Why do modern distributed databases like CockroachDB and Spanner still use 2PC despite its blocking nature? What architectural decisions make it acceptable?
