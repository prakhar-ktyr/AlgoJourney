---
title: "Leader Election"
---

# Leader Election

Leader election is a fundamental problem in distributed systems where a group of nodes must agree on one node to act as the coordinator or "leader" for a given task.

---

## Why Leader Election Is Needed

In many distributed systems, certain operations require a single point of coordination:

| Reason | Example |
|--------|---------|
| Avoid conflicts | Only one node writes to a shared resource |
| Reduce duplication | Single node assigns work to others |
| Simplify consensus | Leader drives agreement among replicas |
| Ordering guarantees | Leader serializes operations |
| Failure recovery | New leader takes over when current one fails |

Without leader election, systems must use more expensive multi-node consensus for every operation, or risk split-brain scenarios where multiple nodes believe they are the leader.

---

## Bully Algorithm

The **Bully Algorithm** (Garcia-Molina, 1982) elects the node with the highest ID as the leader.

### How It Works

1. A node that detects the leader has failed initiates an **election message** to all nodes with higher IDs.
2. If no higher-ID node responds, the initiator declares itself the leader.
3. If a higher-ID node responds, it takes over the election process.
4. The highest-ID node that is alive becomes the new leader and broadcasts a **coordinator message**.

### Message Types

| Message | Purpose |
|---------|---------|
| Election | Sent to higher-ID nodes to start election |
| OK (Alive) | Response from a higher-ID node that is alive |
| Coordinator | Broadcast by the new leader to announce victory |

### Pseudocode

```
function startElection(self):
    higherNodes = allNodes.filter(n => n.id > self.id)

    if higherNodes is empty:
        broadcast(CoordinatorMessage(self.id))
        self.isLeader = true
        return

    for node in higherNodes:
        send(ElectionMessage, node)

    wait for OK responses with timeout

    if no OK received:
        broadcast(CoordinatorMessage(self.id))
        self.isLeader = true
    // else: a higher node will take over
```

### Characteristics

- **Advantage**: Simple to understand and implement.
- **Disadvantage**: High message complexity O(n²) in worst case.
- **Disadvantage**: The highest-ID node always wins, even if it is slow or overloaded.

---

## Ring Algorithm

The **Ring Algorithm** arranges nodes in a logical ring and passes election messages around it.

### How It Works

1. A node that detects the leader has failed creates an **election message** containing its own ID.
2. The message is passed to the next alive node in the ring.
3. Each node appends its own ID to the message and forwards it.
4. When the message returns to the initiator, the node with the highest ID in the list is elected leader.
5. A **coordinator message** is circulated to inform all nodes.

### Example

```
Nodes in ring: [3] -> [5] -> [2] -> [7] -> [1]

Node 3 detects failure, starts election:
  Message: [3] -> Node 5 appends -> [3,5]
  [3,5] -> Node 2 appends -> [3,5,2]
  [3,5,2] -> Node 7 appends -> [3,5,2,7]
  [3,5,2,7] -> Node 1 appends -> [3,5,2,7,1]
  Message returns to Node 3

  max([3,5,2,7,1]) = 7 → Node 7 is leader
```

### Characteristics

- Messages: exactly 2n (one election round, one coordinator round).
- Tolerates multiple simultaneous elections.
- Requires knowledge of ring topology.

---

## Leader Election in Raft

Raft uses a **term-based** leader election mechanism that integrates with its consensus protocol.

### Key Concepts

| Concept | Description |
|---------|-------------|
| Term | Monotonically increasing integer representing an election epoch |
| Candidate | A follower that starts an election |
| RequestVote RPC | Message sent by candidate to request votes |
| Vote | Each node grants at most one vote per term |
| Majority | Candidate must receive votes from a majority of nodes |

### Election Process

```
function onElectionTimeout(self):
    self.currentTerm += 1
    self.state = CANDIDATE
    self.votedFor = self.id
    votesReceived = 1  // vote for self

    for peer in peers:
        response = send(RequestVote {
            term: self.currentTerm,
            candidateId: self.id,
            lastLogIndex: self.log.lastIndex(),
            lastLogTerm: self.log.lastTerm()
        }, peer)

        if response.voteGranted:
            votesReceived += 1

        if votesReceived > (totalNodes / 2):
            self.state = LEADER
            sendHeartbeats()
            return

    // If not elected, revert to follower
    self.state = FOLLOWER
```

### Vote Granting Rules

A node grants a vote only if:

1. The candidate's term is greater than or equal to the voter's current term.
2. The voter has not already voted in this term (or voted for this candidate).
3. The candidate's log is at least as up-to-date as the voter's log.

### Randomized Timeouts

Raft uses **randomized election timeouts** (e.g., 150–300 ms) to reduce the chance of split votes where no candidate achieves a majority.

---

## Leader Election in ZooKeeper

ZooKeeper provides leader election through **ephemeral sequential znodes**.

### How It Works

1. Each candidate creates an ephemeral sequential znode under a designated path:

```
/election/candidate-0000000001
/election/candidate-0000000002
/election/candidate-0000000003
```

2. The node with the **lowest sequence number** becomes the leader.
3. Other nodes set a **watch** on the znode with the next-lower sequence number.
4. When the leader fails, its ephemeral znode is automatically deleted.
5. The next node in sequence is notified and becomes the new leader.

### Advantages

- Avoids herd effect (only one node is notified on leader failure).
- Ephemeral znodes ensure automatic cleanup on session expiry.
- Sequential ordering prevents race conditions.

### Example Code (Java)

```java
public class LeaderElection implements Watcher {
    private ZooKeeper zk;
    private String znodePath;

    public void volunteer() throws Exception {
        znodePath = zk.create(
            "/election/candidate-",
            new byte[0],
            ZooDefs.Ids.OPEN_ACL_UNSAFE,
            CreateMode.EPHEMERAL_SEQUENTIAL
        );
        electLeader();
    }

    private void electLeader() throws Exception {
        List<String> children = zk.getChildren("/election", false);
        Collections.sort(children);
        String smallest = children.get(0);

        if (znodePath.endsWith(smallest)) {
            System.out.println("I am the leader!");
        } else {
            // Watch the predecessor
            int index = children.indexOf(znodePath.substring("/election/".length()));
            String predecessor = children.get(index - 1);
            zk.exists("/election/" + predecessor, this);
        }
    }
}
```

---

## Leader Election in etcd

etcd provides built-in leader election through its **concurrency** package, built on top of its lease and watch primitives.

### Mechanism

1. Candidates create a key with a **lease** attached.
2. The key with the lowest **create revision** wins the election.
3. Other candidates watch for deletion of the leader's key.
4. Leases must be periodically renewed via keepalive.

### Example (Go)

```go
import (
    "go.etcd.io/etcd/client/v3"
    "go.etcd.io/etcd/client/v3/concurrency"
)

func electLeader(client *clientv3.Client) {
    session, _ := concurrency.NewSession(client, concurrency.WithTTL(10))
    defer session.Close()

    election := concurrency.NewElection(session, "/my-service/leader")

    // Block until elected
    err := election.Campaign(context.Background(), "node-1")
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println("I am the leader!")

    // Resign when done
    election.Resign(context.Background())
}
```

---

## Challenges in Leader Election

### Split Brain

Split brain occurs when **two or more nodes believe they are the leader** simultaneously.

| Cause | Consequence |
|-------|-------------|
| Network partition | Nodes on both sides elect a leader |
| Slow heartbeats | Followers assume leader is dead prematurely |
| Clock skew | Lease expiry disagreements |
| Long GC pauses | Leader appears dead during garbage collection |

### Network Partitions

```
Before partition:
  [A] [B] [C] [D] [E]  ← A is leader

After partition:
  [A] [B] | [C] [D] [E]  ← C may become leader of right partition

Result: Two leaders serving conflicting writes!
```

### Zombie Leaders

A zombie leader is a node that **was the leader** but has been replaced, yet still believes it is the leader (e.g., due to a long GC pause or network delay).

---

## Fencing Tokens

Fencing tokens prevent stale leaders from causing damage.

### How They Work

1. Each new leader receives a **monotonically increasing token** (e.g., the Raft term number).
2. The leader includes this token in every request to shared resources.
3. The resource rejects any request with a token **lower** than the highest token it has seen.

```
Leader A (token=33) → acquires lock
Leader A pauses (GC)...
Leader B elected (token=34) → acquires lock, writes to storage

Leader A resumes, tries to write with token=33
Storage rejects: 33 < 34 (stale leader!)
```

### Implementation

```python
class FencedStorage:
    def __init__(self):
        self.max_token = 0
        self.data = {}

    def write(self, key, value, token):
        if token < self.max_token:
            raise StaleLeaderError(
                f"Token {token} is stale (current: {self.max_token})"
            )
        self.max_token = token
        self.data[key] = value
```

---

## Lease-Based Leadership

A **lease** is a time-bounded grant of leadership. The leader must periodically renew its lease; if it fails to do so, other nodes may assume leadership.

### Properties

| Property | Description |
|----------|-------------|
| Duration | Fixed time window (e.g., 10 seconds) |
| Renewal | Leader must renew before expiry |
| Expiry | If not renewed, lease expires and election restarts |
| Clock dependency | Requires roughly synchronized clocks |

### Pseudocode

```
function leaseBasedLeadership(self):
    while true:
        granted = tryAcquireLease(duration=10s)

        if granted:
            self.isLeader = true
            while self.isLeader:
                doLeaderWork()
                renewed = renewLease(duration=10s)
                if not renewed:
                    self.isLeader = false
                    break
                sleep(leaseDuration / 3)  // renew well before expiry
        else:
            sleep(1s)  // retry later
```

### Safety Margin

Leaders should stop acting as leader **before** the lease actually expires to account for clock drift and network delays:

```
effectiveLeadership = leaseExpiry - safetyMargin
```

---

## Leader Election in the Cloud

### DynamoDB Lock (AWS)

AWS provides a **DynamoDB Lock Client** for leader election:

```java
AmazonDynamoDBLockClient lockClient = new AmazonDynamoDBLockClient(
    AmazonDynamoDBLockClientOptions.builder(dynamoDB, "locks-table")
        .withLeaseDuration(10L)
        .withHeartbeatPeriod(3L)
        .withTimeUnit(TimeUnit.SECONDS)
        .build()
);

LockItem lock = lockClient.acquireLock(
    AcquireLockOptions.builder("leader-lock").build()
);

if (lock != null) {
    // I am the leader
    doLeaderWork();
    lockClient.releaseLock(lock);
}
```

### Redis Redlock

Redlock attempts distributed locking across multiple independent Redis instances:

1. Get current time.
2. Attempt to acquire lock on N/2+1 Redis instances with a short timeout.
3. If majority acquired and total elapsed time < lock TTL, the lock is held.
4. Otherwise, release all acquired locks and retry.

```python
import redis
from redlock import Redlock

dlm = Redlock([
    {"host": "redis1", "port": 6379},
    {"host": "redis2", "port": 6379},
    {"host": "redis3", "port": 6379},
])

lock = dlm.lock("leader-resource", ttl=10000)  # 10 seconds

if lock:
    try:
        do_leader_work()
    finally:
        dlm.unlock(lock)
```

> **Caution**: Redlock has been criticized (notably by Martin Kleppmann) for relying on timing assumptions. Use it only when approximate correctness is acceptable.

---

## Practical Considerations

### Heartbeats

Leaders send periodic heartbeats to followers to maintain authority:

```
Leader sends heartbeat every T milliseconds
Followers reset election timer on heartbeat receipt
If no heartbeat received within timeout → start new election
```

**Guideline**: Heartbeat interval should be much less than the election timeout:

```
heartbeatInterval << electionTimeout

Example: heartbeat = 100ms, electionTimeout = 300-500ms
```

### Timeout Configuration

| Factor | Impact |
|--------|--------|
| Too short timeout | Unnecessary elections, instability |
| Too long timeout | Slow failure detection |
| Network latency | Must exceed typical round-trip time |
| Node count | More nodes → more potential for split votes |

### Monitoring

Essential metrics for leader election health:

- Number of elections triggered per time period
- Time between leader failure and new leader election
- Leader tenure duration
- Number of failed election attempts

---

## When to Avoid Leader Election

Leader election is not always the best approach:

| Scenario | Alternative |
|----------|-------------|
| All nodes can handle requests equally | Leaderless replication (e.g., Dynamo-style) |
| Writes are infrequent | Multi-Paxos without stable leader |
| High availability is paramount | CRDTs for conflict-free concurrent updates |
| Simple coordination needed | Distributed locks or semaphores |
| Stateless workloads | Load balancer with health checks |

### Trade-offs Summary

```
Leader-based systems:
  ✓ Simpler reasoning about ordering
  ✓ Efficient for write-heavy workloads
  ✗ Single point of failure (temporary)
  ✗ Bottleneck under high load
  ✗ Election disruption during transitions

Leaderless systems:
  ✓ No single point of failure
  ✓ Lower latency (no routing to leader)
  ✗ Complex conflict resolution
  ✗ Harder to reason about consistency
```

---

## Exercises

1. **Bully Algorithm Simulation**: Given nodes with IDs [2, 5, 8, 11, 14] where node 14 (the leader) crashes, trace the messages exchanged during the bully algorithm when node 5 detects the failure.

2. **Raft Election**: In a 5-node Raft cluster, nodes A–E, the current leader (A, term=3) becomes partitioned from B and C. Describe what happens next, including the term numbers and vote outcomes.

3. **Fencing Token Design**: Design a fencing token system for a distributed job scheduler where the leader assigns tasks to workers. What happens when a zombie leader tries to reassign a task?

4. **Lease Calculation**: If your network has a maximum one-way latency of 50ms and clock drift of 1ms/s, what is the minimum safety margin you should use for a 10-second lease?

5. **ZooKeeper Election**: Explain why ZooKeeper's approach of watching only the predecessor znode is more efficient than having all candidates watch the leader's znode.

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Bully Algorithm | Highest-ID node wins; simple but expensive |
| Ring Algorithm | Passes messages in ring; O(n) messages |
| Raft | Term-based, majority votes, randomized timeouts |
| ZooKeeper | Ephemeral sequential znodes, watch predecessor |
| etcd | Lease + lowest create revision wins |
| Fencing tokens | Prevent stale leaders from causing harm |
| Leases | Time-bounded leadership with renewal |
| Split brain | Multiple leaders due to partitions |
| Cloud solutions | DynamoDB locks, Redis Redlock |

Leader election is a critical building block, but it introduces complexity. Choose it when you need strong ordering guarantees and a single coordinator, and prefer leaderless designs when availability and partition tolerance are more important than strict consistency.
