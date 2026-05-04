---
title: "Raft Consensus"
---

# Raft Consensus

Raft is a consensus algorithm designed to be **understandable**. It was introduced by Diego Ongaro and John Ousterhout in 2014 as an alternative to Paxos, providing equivalent fault tolerance and performance while being significantly easier to comprehend and implement.

---

## Why Raft?

Paxos had been the dominant consensus algorithm for decades, but it suffered from two major problems:

| Problem | Description |
|---------|-------------|
| Difficult to understand | Paxos is notoriously hard to grasp even for experienced engineers |
| Hard to implement | The gap between the theoretical algorithm and a practical system is enormous |
| Poor decomposition | Paxos doesn't naturally decompose into independent sub-problems |

Raft addresses these issues by decomposing consensus into **three relatively independent sub-problems** and using a strong leader model.

---

## Three Sub-Problems

Raft decomposes consensus into:

| Sub-Problem | Purpose |
|-------------|---------|
| **Leader Election** | Select one server as leader; elect a new leader if the current one fails |
| **Log Replication** | Leader accepts log entries from clients and replicates them across the cluster |
| **Safety** | Ensure that if any server has applied a log entry at a given index, no other server will apply a different entry at that index |

---

## Node States

Every server in a Raft cluster is in one of three states at any given time:

```
                times out,          receives votes from
                starts election     majority of servers
    ┌─────────┐            ┌───────────┐            ┌────────┐
    │ Follower │──────────▶│ Candidate │──────────▶│ Leader │
    └─────────┘            └───────────┘            └────────┘
         ▲                       │                       │
         │    discovers current  │                       │
         │    leader or new term │   discovers server    │
         │◀──────────────────────┘   with higher term   │
         │◀─────────────────────────────────────────────┘
```

### State Descriptions

| State | Behavior |
|-------|----------|
| **Follower** | Passive; responds to RPCs from leaders and candidates |
| **Candidate** | Used to elect a new leader; transitions from follower after election timeout |
| **Leader** | Handles all client requests; replicates log entries to followers |

---

## Terms

Raft divides time into **terms** of arbitrary length. Terms are numbered with consecutive integers and act as a logical clock.

```
┌─────────┐  ┌─────────────────────┐  ┌──────────────────┐  ┌─────────┐
│  Term 1 │  │       Term 2        │  │      Term 3      │  │ Term 4  │
│Elections │  │Elections │  Normal  │  │Elections│ Normal  │  │  ...    │
│  + Normal│  │          Operation  │  │         Operation │  │         │
│ Operation│  │                     │  │                   │  │         │
└─────────┘  └─────────────────────┘  └──────────────────┘  └─────────┘
```

Key rules about terms:

- Each term begins with an **election**
- If a candidate wins the election, it serves as leader for the rest of the term
- If the election results in a split vote, the term ends with no leader (a new term starts)
- Terms act as a logical clock — if a server discovers its term is out of date, it immediately reverts to follower

---

## Leader Election

### Election Timeout

Each follower has a randomized **election timeout** (typically 150–300ms). If a follower receives no communication from a leader before the timeout expires, it assumes no viable leader exists and begins an election.

### RequestVote RPC

When a follower becomes a candidate:

1. Increments its current term
2. Votes for itself
3. Sends `RequestVote` RPCs to all other servers in parallel

```javascript
// RequestVote RPC structure
const RequestVoteArgs = {
  term: 3,             // candidate's term
  candidateId: "s2",   // candidate requesting vote
  lastLogIndex: 7,     // index of candidate's last log entry
  lastLogTerm: 2       // term of candidate's last log entry
};

const RequestVoteReply = {
  term: 3,             // currentTerm, for candidate to update itself
  voteGranted: true    // true means candidate received vote
};
```

### Voting Rules

A server grants its vote if:

1. The candidate's term is at least as large as the voter's current term
2. The voter has not already voted for another candidate in this term
3. The candidate's log is at least as up-to-date as the voter's log

### Election Outcomes

| Outcome | Condition | Result |
|---------|-----------|--------|
| Win | Receives votes from a majority of servers | Becomes leader, sends heartbeats |
| Lose | Receives AppendEntries from a valid leader | Reverts to follower |
| Split Vote | Neither candidate gets a majority | New term, new election |

### Split Vote Prevention

Raft uses **randomized election timeouts** to minimize split votes:

```javascript
function getElectionTimeout() {
  const BASE_TIMEOUT = 150;  // milliseconds
  const TIMEOUT_RANGE = 150; // milliseconds
  return BASE_TIMEOUT + Math.floor(Math.random() * TIMEOUT_RANGE);
}
// Each server gets a timeout between 150ms and 300ms
```

In practice, split votes are rare because timeouts are spread across a window, making it unlikely that two servers time out simultaneously.

---

## Log Replication

Once a leader is elected, it begins servicing client requests. Each client request contains a command to be executed by the replicated state machines.

### AppendEntries RPC

The leader appends the command as a new entry in its log, then issues `AppendEntries` RPCs in parallel to all followers:

```javascript
// AppendEntries RPC structure
const AppendEntriesArgs = {
  term: 3,              // leader's term
  leaderId: "s1",       // so followers can redirect clients
  prevLogIndex: 6,      // index of log entry immediately preceding new ones
  prevLogTerm: 2,       // term of prevLogIndex entry
  entries: [            // log entries to store (empty for heartbeat)
    { term: 3, index: 7, command: "SET x = 5" }
  ],
  leaderCommit: 5       // leader's commitIndex
};

const AppendEntriesReply = {
  term: 3,              // currentTerm, for leader to update itself
  success: true         // true if follower matched prevLogIndex/prevLogTerm
};
```

### Log Structure

Each log entry contains:

| Field | Description |
|-------|-------------|
| `index` | Position in the log (1-indexed) |
| `term` | The term when the entry was received by the leader |
| `command` | The state machine command |

Example log:

```
Index:   1     2     3     4     5     6     7
Term:    1     1     1     2     3     3     3
Command: x←1   y←2   x←3   y←4   x←5   y←6   z←7
```

### Log Matching Property

Raft maintains two guarantees that together form the **Log Matching Property**:

1. If two entries in different logs have the same index and term, they store the same command
2. If two entries in different logs have the same index and term, all preceding entries are identical

The leader enforces consistency by including `prevLogIndex` and `prevLogTerm` in each `AppendEntries` RPC. If a follower's log doesn't match, it rejects the request, and the leader retries with an earlier entry.

### Commitment

A log entry is **committed** once the leader has replicated it on a majority of servers:

```
Server 1 (Leader): [1][1][2][3][3][3][3]  ← committed through index 5
Server 2:          [1][1][2][3][3]
Server 3:          [1][1][2][3][3]          majority (3/5) have index 5
Server 4:          [1][1][2][3]
Server 5:          [1][1][2]
```

Once committed, the leader applies the entry to its state machine and returns the result to the client. Followers learn about committed entries via `leaderCommit` in subsequent `AppendEntries` RPCs.

---

## Safety

### Election Restriction

Raft guarantees that the leader for any given term contains all entries committed in previous terms. This is enforced during voting — a candidate must have a log that is at least as up-to-date as the voter's:

```javascript
function isLogUpToDate(candidateLastIndex, candidateLastTerm,
                       voterLastIndex, voterLastTerm) {
  // Compare last log terms first
  if (candidateLastTerm !== voterLastTerm) {
    return candidateLastTerm > voterLastTerm;
  }
  // If terms are equal, longer log is more up-to-date
  return candidateLastIndex >= voterLastIndex;
}
```

### Commit Rule

A leader cannot determine commitment using log entries from **previous terms**. A leader only commits entries from its current term by counting replicas. Once a current-term entry is committed, all prior entries are also committed indirectly (by the Log Matching Property).

This prevents the following dangerous scenario:

```
Time 1: S1 (leader, term 2) replicates entry at index 2 to S2
Time 2: S1 crashes; S5 elected leader in term 3 (votes from S3, S4, S5)
Time 3: S5 crashes; S1 elected leader in term 4
Time 4: S1 replicates term-2 entry to S3 (now on majority)

WITHOUT commit rule: S1 might commit the term-2 entry
         → but S5 could still be elected and overwrite it!
WITH commit rule: S1 only commits once a term-4 entry reaches majority
         → this guarantees the term-2 entry is safe too
```

---

## Cluster Membership Changes

Changing the cluster configuration (adding/removing servers) must be done safely to avoid having two leaders for the same term.

### Joint Consensus

Raft uses a **two-phase approach** for configuration changes:

```
Phase 1: Switch to joint consensus (C_old,new)
         - Log entries replicated to majorities of BOTH old and new configs
         - Either config's servers may serve as leader
         
Phase 2: Switch to new configuration (C_new)
         - Only the new configuration's rules apply
```

```
Time ─────────────────────────────────────────────▶

│  C_old  │    C_old,new (joint)    │   C_new    │
│ commits │                         │  commits   │
│ using   │  commits using both     │  using     │
│ old     │  old AND new majorities │  new       │
│ majority│                         │  majority  │
```

### Single-Server Changes

For simpler cases (adding or removing one server at a time), Raft can use **single-server membership changes** that don't require joint consensus, since any majority of the old cluster overlaps with any majority of the new cluster when sizes differ by at most one.

---

## Log Compaction (Snapshots)

As the log grows indefinitely, Raft uses **snapshots** to compact it:

```
Before Snapshot:
Log: [1][1][2][2][3][3][3][3][3][4][4][4]
      ↑                          ↑
      index 1                    index 12

After Snapshot (through index 8):
Snapshot: { lastIndex: 8, lastTerm: 3, state: {...} }
Log: [3][3][4][4][4]
      ↑
      index 9
```

### Snapshot Contents

| Field | Description |
|-------|-------------|
| `lastIncludedIndex` | Index of the last entry in the snapshot |
| `lastIncludedTerm` | Term of the last entry in the snapshot |
| `state` | Serialized state machine state at that point |

### InstallSnapshot RPC

If a leader needs to send entries that have been compacted, it sends the snapshot instead:

```javascript
const InstallSnapshotArgs = {
  term: 4,
  leaderId: "s1",
  lastIncludedIndex: 8,
  lastIncludedTerm: 3,
  offset: 0,          // byte offset for chunked transfer
  data: "...",        // raw bytes of snapshot chunk
  done: true          // true if this is the last chunk
};
```

---

## Raft Implementations

Raft is widely used in production systems:

| System | Language | Use Case |
|--------|----------|----------|
| **etcd** | Go | Kubernetes configuration store, service discovery |
| **CockroachDB** | Go | Distributed SQL database; each range uses a Raft group |
| **TiKV** | Rust | Distributed key-value store (TiDB's storage layer) |
| **Consul** | Go | Service mesh, configuration, service discovery |
| **RethinkDB** | C++ | Distributed document database |
| **ScyllaDB** | C++ | High-performance distributed NoSQL database |
| **Hashicorp Raft** | Go | Standalone Raft library used by Nomad, Vault |

### etcd Example

```go
// Simplified etcd Raft usage
import "go.etcd.io/raft/v3"

// Create a Raft node
storage := raft.NewMemoryStorage()
c := &raft.Config{
    ID:              0x01,
    ElectionTick:    10,
    HeartbeatTick:   1,
    Storage:         storage,
    MaxSizePerMsg:   4096,
    MaxInflightMsgs: 256,
}
node := raft.StartNode(c, peers)

// Process Raft messages in a loop
for {
    select {
    case rd := <-node.Ready():
        saveToStorage(rd.HardState, rd.Entries, rd.Snapshot)
        sendMessages(rd.Messages)
        applyCommittedEntries(rd.CommittedEntries)
        node.Advance()
    }
}
```

---

## Raft Visualization

Understanding Raft is much easier with a visual model. The key state transitions:

```
┌───────────────────────────────────────────────────────────┐
│                     LEADER (Term 3)                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Log: [1][1][2][3][3][3]   commitIndex: 5            │  │
│  │ nextIndex:  {S2:7, S3:7, S4:5, S5:4}               │  │
│  │ matchIndex: {S2:6, S3:6, S4:4, S5:3}               │  │
│  └─────────────────────────────────────────────────────┘  │
│       │ AppendEntries          │ AppendEntries             │
│       ▼                        ▼                           │
│  ┌──────────┐            ┌──────────┐                     │
│  │ Follower │            │ Follower │                     │
│  │ S2       │            │ S3       │                     │
│  │ [1][1]   │            │ [1][1]   │                     │
│  │ [2][3]   │            │ [2][3]   │                     │
│  │ [3][3]   │            │ [3][3]   │                     │
│  └──────────┘            └──────────┘                     │
└───────────────────────────────────────────────────────────┘
```

### Recommended Visualization Tools

- **The Secret Lives of Data** — Interactive Raft visualization (thesecretlivesofdata.com/raft)
- **Raft Scope** — Real-time cluster simulation
- **Raft Consensus Simulator** — Step-through animation of elections and replication

---

## Comparison with Paxos

| Aspect | Raft | Paxos |
|--------|------|-------|
| **Understandability** | Designed for clarity; strong leader simplifies reasoning | Notoriously difficult to understand |
| **Leader** | Strong leader required; all writes go through leader | Multi-decree Paxos often uses a leader but it's not required |
| **Log Ordering** | Entries committed in order; no gaps | Entries can be committed out of order; gaps possible |
| **Membership Changes** | Joint consensus or single-server changes | Separate protocol needed |
| **Implementation Gap** | Small gap between paper and implementation | Large gap; many undocumented details |
| **Performance** | Comparable to Multi-Paxos in practice | Comparable to Raft in practice |
| **Publications** | Single clear paper | Many variants, clarifications, and extensions |
| **Formal Proof** | TLA+ specification available | TLA+ specification available |

### When to Choose Raft

- You need an understandable consensus implementation
- Your team must maintain and debug the consensus layer
- You want an algorithm that maps directly to a practical system
- Strong leader semantics fit your workload

### When Paxos Variants May Be Better

- Leaderless operation is important (e.g., Flexible Paxos)
- You need weaker quorum requirements (e.g., EPaxos)
- You're building on an existing Paxos-based system

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **Design Goal** | Understandability over novelty |
| **Sub-problems** | Leader election, log replication, safety |
| **Node States** | Follower → Candidate → Leader |
| **Terms** | Logical clock; each begins with an election |
| **Election Timeout** | Randomized (150–300ms) to prevent split votes |
| **Commitment** | Entry is committed when replicated on a majority |
| **Safety** | Election restriction + commit rule prevent stale commits |
| **Membership** | Joint consensus for safe configuration changes |
| **Compaction** | Snapshots replace prefix of the log |
| **Production** | etcd, CockroachDB, TiKV, Consul |

---

## Exercises

1. **Election Simulation**: A 5-node Raft cluster has servers S1–S5. S1 is the current leader in term 4. S1 crashes. S3 and S4 both time out simultaneously and start elections for term 5. S3 receives votes from S2 and itself; S4 receives votes from S5 and itself. What happens next?

2. **Log Divergence**: After a series of leader crashes, a cluster has these logs:
   ```
   S1: [1][1][3][3]
   S2: [1][1][2][2][2]
   S3: [1][1][3]
   ```
   If S1 becomes leader in term 4, describe step by step how it brings S2 and S3 into consistency.

3. **Commit Safety**: Explain why a leader cannot safely commit entries from a previous term by counting replicas. Provide a specific scenario where this would lead to data loss.

4. **Snapshot Design**: A key-value store uses Raft for replication. The state machine holds 10 million keys. Design a snapshot strategy that minimizes both disk usage and impact on serving reads.

5. **Cluster Expansion**: You need to expand a 3-node Raft cluster to 5 nodes. Explain the difference between adding nodes one at a time vs. using joint consensus. What are the safety implications?

---

## Further Reading

- Ongaro, D. & Ousterhout, J. — "In Search of an Understandable Consensus Algorithm" (2014)
- The Raft paper's extended version (Ongaro's PhD dissertation)
- etcd Raft implementation: github.com/etcd-io/raft
- TLA+ specification of Raft
