---
title: "Distributed Mutual Exclusion"
---

# Distributed Mutual Exclusion

In a single-machine system, mutual exclusion is straightforward — use a mutex or semaphore backed by shared memory. In distributed systems, there is no shared memory, no global clock, and messages may be delayed or lost. Achieving mutual exclusion across networked nodes is fundamentally harder.

---

## Why Mutual Exclusion Matters

When multiple processes on different machines access a shared resource (a file, a database record, a printer), **only one** should be in the critical section at any time.

| Problem | Consequence Without Mutual Exclusion |
|---------|--------------------------------------|
| Bank transfer | Double-spending, inconsistent balances |
| Distributed counter | Lost updates |
| Config file write | Corrupted configuration |
| Leader election | Split-brain scenarios |

### Requirements for a Correct Algorithm

1. **Safety** — At most one process is in the critical section at any time.
2. **Liveness** — Every request to enter eventually succeeds (no starvation).
3. **Ordering** (optional) — Requests are granted in happened-before order (fairness).

---

## Centralized Approach (Coordinator)

The simplest solution: elect one node as the **coordinator**. Every process asks the coordinator for permission.

```
Process P                Coordinator                Process Q
   |--- REQUEST ------------>|                          |
   |                         |  (CS is free)            |
   |<-- GRANT ---------------|                          |
   |   [enters CS]           |                          |
   |                         |<--- REQUEST -------------|
   |                         |  (CS busy, queue Q)      |
   |--- RELEASE ------------>|                          |
   |                         |--- GRANT --------------->|
   |                         |                   [enters CS]
```

### Properties

| Metric | Value |
|--------|-------|
| Messages per entry | 3 (REQUEST, GRANT, RELEASE) |
| Delay before entry | 2 message delays (best case) |
| Single point of failure | Yes — coordinator crash blocks all |

### Implementation Sketch (pseudocode)

```python
# Coordinator
queue = []
cs_held = False

def on_request(sender):
    if not cs_held:
        cs_held = True
        send(sender, "GRANT")
    else:
        queue.append(sender)

def on_release(sender):
    if queue:
        next_proc = queue.pop(0)
        send(next_proc, "GRANT")
    else:
        cs_held = False
```

### Drawbacks

- **Single point of failure**: if the coordinator crashes, no one can enter the CS.
- **Bottleneck**: every CS entry goes through one node.
- **Cannot distinguish** a slow coordinator from a dead one.

---

## Token-Based Algorithms

A unique **token** circulates among processes. Only the token holder may enter the critical section.

### Token Ring Algorithm

Processes are organized in a logical ring. The token passes from node to node.

```
   P0 ---> P1 ---> P2 ---> P3
    ^                        |
    |________________________|
```

**Protocol:**

1. When a process receives the token and wants to enter the CS, it enters.
2. When done (or if it doesn't need the CS), it forwards the token to the next neighbor.

```python
def on_token_received(token):
    if want_to_enter:
        enter_critical_section()
        # ... do work ...
        exit_critical_section()
    forward_token(next_neighbor)
```

### Performance

| Metric | Value |
|--------|-------|
| Messages per entry | 1 to N−1 (depends on position) |
| Average wait | N/2 message passes |
| Synchronization delay | 1 message (token hand-off) |
| Fault tolerance | Token loss requires regeneration |

### Token Loss Problem

If the token-holding node crashes, the token is lost. Solutions:

- **Timeout-based regeneration**: if no token seen in T seconds, elect a leader to create a new token.
- **Token duplication detection**: use sequence numbers; if two tokens exist, the lower-numbered one is destroyed.

---

## Permission-Based Algorithms

Instead of a circulating token, a process **asks permission** from other processes before entering.

### Lamport's Algorithm (1978)

Based on Lamport logical clocks. Every process maintains a request queue ordered by timestamps.

**Steps:**

1. Process Pi sends `REQUEST(tsi, i)` to all other processes.
2. Pi adds the request to its own queue.
3. On receiving `REQUEST(tsj, j)`, a process adds it to its queue and sends `REPLY` to Pj.
4. Pi enters the CS when:
   - Its own request is at the **head** of its queue (smallest timestamp).
   - It has received `REPLY` from **all** other processes.
5. On exit, Pi sends `RELEASE` to all; every process removes Pi's request from its queue.

```python
# Process i
def request_cs():
    ts = increment_clock()
    broadcast(REQUEST, ts, my_id)
    add_to_queue(ts, my_id)
    wait_until(my_request_at_head() and all_replies_received())
    enter_cs()

def release_cs():
    remove_from_queue(my_id)
    broadcast(RELEASE, my_id)

def on_request(ts, sender):
    add_to_queue(ts, sender)
    update_clock(ts)
    send(sender, REPLY)

def on_release(sender):
    remove_from_queue(sender)
```

### Message Complexity

| Event | Messages |
|-------|----------|
| REQUEST broadcast | N − 1 |
| REPLY messages | N − 1 |
| RELEASE broadcast | N − 1 |
| **Total per CS entry** | **3(N − 1)** |

---

### Ricart-Agrawala Algorithm (1981)

An optimization of Lamport's approach that **eliminates the RELEASE message** by combining it with deferred replies.

**Key Insight:** A process only sends REPLY immediately if it doesn't want the CS or the requester has a smaller timestamp. Otherwise, it **defers** the reply until it exits the CS.

```python
# Process i
requesting = False
my_ts = 0
deferred = []
replies_received = 0

def request_cs():
    requesting = True
    my_ts = increment_clock()
    replies_received = 0
    broadcast(REQUEST, my_ts, my_id)
    wait_until(replies_received == N - 1)
    enter_cs()

def release_cs():
    requesting = False
    for proc in deferred:
        send(proc, REPLY)
    deferred.clear()

def on_request(ts, sender):
    if not requesting or (ts, sender) < (my_ts, my_id):
        send(sender, REPLY)
    else:
        deferred.append(sender)
```

### Performance

| Metric | Value |
|--------|-------|
| Messages per CS entry | 2(N − 1) |
| Synchronization delay | 1 message round-trip |
| Improvement over Lamport | Saves N − 1 messages |

---

### Maekawa's Quorum-Based Algorithm (1985)

Instead of getting permission from **all** processes, a process only needs permission from a **quorum** (voting set).

**Quorum Properties:**

- Each process Pi has a voting set Vi.
- For any two processes Pi, Pj: Vi ∩ Vj ≠ ∅ (intersection is non-empty).
- Each process is in its own voting set: Pi ∈ Vi.
- All voting sets have equal size: |Vi| = K.

The optimal quorum size is approximately **√N**.

```
N = 9 processes, K = 3

V1 = {P1, P2, P3}
V2 = {P1, P4, P7}
V3 = {P1, P5, P8}
...
(Each pair of sets intersects)
```

**Protocol:**

1. Pi sends REQUEST to all members of Vi.
2. A process grants its vote to at most one requester at a time.
3. Pi enters CS after receiving votes from all members of Vi.
4. On exit, Pi sends RELEASE to Vi; members can then vote for another.

```python
def request_cs():
    for proc in my_voting_set:
        send(proc, REQUEST, my_ts, my_id)
    wait_until(votes_received == len(my_voting_set))
    enter_cs()

def release_cs():
    for proc in my_voting_set:
        send(proc, RELEASE)

def on_request(ts, sender):
    if not voted:
        voted = True
        voted_for = sender
        send(sender, VOTE)
    else:
        queue.append((ts, sender))

def on_release(sender):
    if queue:
        next_req = queue.pop(0)
        voted_for = next_req
        send(next_req, VOTE)
    else:
        voted = False
```

### Performance

| Metric | Value |
|--------|-------|
| Messages per CS entry | 3√N (REQUEST + VOTE + RELEASE) |
| Deadlock possible? | Yes — requires deadlock handling |
| Advantage | Fewer messages for large N |

### Deadlock in Maekawa's Algorithm

Because votes are exclusive, circular waiting can occur. Solutions:

- Use Lamport timestamps to order conflicting requests.
- Add INQUIRE/YIELD messages to retract votes.

---

## Performance Comparison

| Algorithm | Messages per Entry | Sync Delay | Problems |
|-----------|--------------------|------------|----------|
| Centralized | 3 | 2 | SPOF, bottleneck |
| Token Ring | 1 to N−1 | 0 to N−1 | Token loss |
| Lamport | 3(N−1) | 1 | High message count |
| Ricart-Agrawala | 2(N−1) | 1 | High message count |
| Maekawa | 3√N | 2 | Deadlock possible |

### When to Use What

```
Small cluster (N < 10)    → Centralized or Ricart-Agrawala
Medium cluster (10-100)   → Maekawa's quorum
Large cluster (100+)      → Token-based or distributed locks
Cloud/microservices       → Redis/ZooKeeper/etcd locks
```

---

## Distributed Locks in Practice

Real systems rarely implement academic algorithms directly. Instead, they use battle-tested distributed lock services.

### Redis — Redlock Algorithm

Redlock uses **N independent Redis masters** (typically 5) to achieve distributed locking without a single point of failure.

```python
import time
import redis

LOCK_TTL_MS = 10000
QUORUM = 3  # majority of 5

def acquire_redlock(resource, client_id, instances):
    start = time.monotonic_ns()
    votes = 0

    for instance in instances:
        try:
            # SET resource client_id NX PX ttl
            if instance.set(resource, client_id, nx=True, px=LOCK_TTL_MS):
                votes += 1
        except redis.ConnectionError:
            pass

    elapsed_ms = (time.monotonic_ns() - start) / 1_000_000
    validity = LOCK_TTL_MS - elapsed_ms

    if votes >= QUORUM and validity > 0:
        return {"acquired": True, "validity_ms": validity}
    else:
        # Release from all instances
        for instance in instances:
            release_lock(instance, resource, client_id)
        return {"acquired": False}

def release_lock(instance, resource, client_id):
    # Lua script ensures atomicity
    script = """
    if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
    end
    return 0
    """
    instance.eval(script, 1, resource, client_id)
```

**Key Properties:**

| Property | Detail |
|----------|--------|
| Quorum | Majority (N/2 + 1) of Redis instances |
| TTL | Lock auto-expires to prevent deadlock |
| Fencing | Use fencing tokens for correctness |
| Controversy | Martin Kleppmann's critique — clock drift issues |

---

### ZooKeeper Recipes

ZooKeeper provides distributed locks using **ephemeral sequential znodes**.

```java
// Acquire lock
String lockPath = zk.create(
    "/locks/resource-/lock-",
    data,
    OPEN_ACL_UNSAFE,
    CreateMode.EPHEMERAL_SEQUENTIAL
);

List<String> children = zk.getChildren("/locks/resource-", false);
Collections.sort(children);

if (lockPath.endsWith(children.get(0))) {
    // We have the lock!
} else {
    // Watch the node just before ours
    String predecessor = children.get(children.indexOf(myNode) - 1);
    zk.exists("/locks/resource-/" + predecessor, watchCallback);
    // Wait for notification...
}
```

**How It Works:**

1. Each client creates an ephemeral sequential znode under a lock path.
2. Client checks if its znode has the lowest sequence number.
3. If yes → lock acquired. If no → watch the predecessor and wait.
4. When predecessor is deleted (client releases or crashes), watcher fires.

**Advantages:**

- **No TTL guessing** — ephemeral nodes auto-delete on session timeout.
- **Fair ordering** — sequential znodes guarantee FIFO.
- **Herd avoidance** — each client watches only one predecessor.

---

### etcd Distributed Locks

etcd uses **leases** with TTL and **revision-based ordering**.

```go
// Using etcd's concurrency package
import (
    "go.etcd.io/etcd/client/v3/concurrency"
)

func acquireLock(client *clientv3.Client) error {
    session, err := concurrency.NewSession(client, concurrency.WithTTL(10))
    if err != nil {
        return err
    }
    defer session.Close()

    mutex := concurrency.NewMutex(session, "/locks/my-resource")

    // Blocks until lock is acquired
    if err := mutex.Lock(context.TODO()); err != nil {
        return err
    }

    // Critical section
    doWork()

    // Release
    return mutex.Unlock(context.TODO())
}
```

**etcd Lock Properties:**

| Property | Detail |
|----------|--------|
| Consistency | Linearizable (Raft consensus) |
| Lease-based | Auto-release on client failure |
| Watch mechanism | Efficient notification of lock release |
| Fencing | Revision number serves as fencing token |

---

## Lock Contention and Deadlock

### Contention

When many clients compete for the same lock:

```
High contention symptoms:
├── Increased latency (waiting for lock)
├── Reduced throughput (serialized access)
├── Timeout failures (lock TTL expires before work completes)
└── Cascading retries (thundering herd on lock release)
```

**Mitigation Strategies:**

| Strategy | Description |
|----------|-------------|
| Lock striping | Partition resource into N locks (e.g., hash-based sharding) |
| Read-write locks | Allow concurrent readers, exclusive writers |
| Optimistic locking | Use CAS/versioning instead of locks |
| Lock-free algorithms | CRDTs, append-only logs |
| Backoff with jitter | Reduce retry storms |

```python
import random
import time

def acquire_with_backoff(lock_fn, max_retries=10):
    for attempt in range(max_retries):
        if lock_fn():
            return True
        # Exponential backoff with jitter
        base_delay = min(2 ** attempt * 10, 5000)  # ms
        jitter = random.uniform(0, base_delay * 0.3)
        time.sleep((base_delay + jitter) / 1000)
    return False
```

### Deadlock in Distributed Systems

Deadlock occurs when processes form a circular wait for locks.

```
Process A holds Lock 1, waits for Lock 2
Process B holds Lock 2, waits for Lock 1
→ Deadlock!
```

**Detection Approaches:**

| Approach | Mechanism |
|----------|-----------|
| Timeout | If lock not acquired in T seconds, assume deadlock and abort |
| Wait-for graph | Build distributed graph, detect cycles |
| Wound-wait | Older process "wounds" younger (younger aborts) |
| Wait-die | Younger process waits; older dies and retries |

```python
# Wait-die scheme
def on_lock_conflict(my_timestamp, holder_timestamp, lock):
    if my_timestamp < holder_timestamp:
        # I'm older → wait (holder will finish eventually)
        wait_for(lock)
    else:
        # I'm younger → die (abort and retry later)
        abort_and_retry()
```

---

## Practical Considerations and Trade-Offs

### Choosing a Distributed Lock

| Factor | Redis (Redlock) | ZooKeeper | etcd |
|--------|-----------------|-----------|------|
| Consistency | AP (best-effort) | CP (ZAB) | CP (Raft) |
| Performance | Fastest (~1ms) | Medium (~10ms) | Medium (~5ms) |
| Correctness | Debated (clock drift) | Strong | Strong |
| Operational complexity | Low | High | Medium |
| Use case | Caching, rate limiting | Coordination | Kubernetes, config |

### The Fencing Token Pattern

Even with a correct lock, **process pauses** (GC, page faults) can cause two clients to think they hold the lock simultaneously.

```
Client A acquires lock (token=34)
Client A pauses (GC)
Lock expires (TTL)
Client B acquires lock (token=35)
Client B writes to storage (token=35 accepted)
Client A resumes, writes to storage
  → Storage rejects: token 34 < current 35
```

**Implementation:**

```python
# Storage service checks fencing token
def write(data, fencing_token):
    if fencing_token < self.last_seen_token:
        raise StaleTokenError("Rejected: token too old")
    self.last_seen_token = fencing_token
    self.store(data)
```

### Safety vs. Liveness Trade-Off

| Priority | Implication |
|----------|-------------|
| Favor safety | Use CP systems (ZooKeeper, etcd); risk unavailability during partitions |
| Favor liveness | Use AP systems (Redis); risk brief double-holding during failures |
| Balance | Use TTLs + fencing tokens; accept bounded incorrectness window |

---

## Exercises

1. **Message Counting**: In a system with 7 nodes using Ricart-Agrawala, how many messages are exchanged for one CS entry? What about Maekawa's algorithm with optimal quorum size?

2. **Token Ring Failure**: Design a protocol to detect and regenerate a lost token in a ring of 5 nodes. What is the maximum time a process might wait?

3. **Redlock Analysis**: If you have 5 Redis instances and 2 are down, can a client still acquire the lock? What if 3 are down?

4. **Deadlock Detection**: Given processes P1, P2, P3 with:
   - P1 holds L1, wants L2
   - P2 holds L2, wants L3
   - P3 holds L3, wants L1

   Draw the wait-for graph. Implement a cycle detection algorithm for this graph.

5. **Fencing Token**: Explain why a lock with TTL alone (without fencing) is insufficient for correctness. Provide a concrete scenario with a database write.

6. **Algorithm Selection**: Your e-commerce platform has 50 microservices that need to coordinate inventory updates. Which mutual exclusion approach would you choose and why?

---

## Summary

| Concept | Key Takeaway |
|---------|--------------|
| Centralized | Simple but fragile (SPOF) |
| Token Ring | Fair but vulnerable to token loss |
| Lamport/R-A | Correct but O(N) messages |
| Maekawa | O(√N) messages but deadlock risk |
| Redis Redlock | Fast but debated correctness |
| ZooKeeper | Strong guarantees, higher latency |
| etcd | Raft-based, good for Kubernetes |
| Fencing tokens | Essential for real-world safety |
| Trade-off | No perfect solution — pick based on your CAP needs |

Distributed mutual exclusion is one of the foundational problems in distributed computing. Academic algorithms teach the principles; production systems like Redis, ZooKeeper, and etcd provide practical implementations with known trade-offs.
