---
title: "Global Snapshots"
---

# Global Snapshots in Distributed Systems

A **global snapshot** captures the state of an entire distributed system — every process and every communication channel — at a logically consistent point in time. Think of it as "freezing" the system so you can inspect it without actually stopping anything.

---

## Why Global Snapshots Matter

In a centralized system you can pause execution and inspect memory. In a distributed system there is no shared memory and no global clock, so you need an algorithmic way to capture state.

### Key Use Cases

| Use Case | What the Snapshot Provides |
|---|---|
| **Checkpointing / Recovery** | A consistent state to roll back to after a failure |
| **Debugging** | A coherent view of the system for offline analysis |
| **Garbage Collection** | Detecting objects no longer referenced by any process |
| **Deadlock Detection** | Building a wait-for graph from a consistent state |
| **Termination Detection** | Determining if all processes are idle and channels empty |
| **Stable Property Detection** | Once a property (deadlock, termination) becomes true it stays true — a snapshot can detect it |

> **Stable property:** A predicate $\phi$ is *stable* if once $\phi$ becomes true it remains true forever.  
> Examples: deadlock, termination, token loss.  
> Non-stable properties (e.g., "the token is at process $P_2$") cannot be reliably detected with snapshots.

---

## System Model

We assume:

1. A finite set of $n$ processes $P_1, P_2, \dots, P_n$.
2. Processes communicate by **message passing** over FIFO channels.
3. Channels are **reliable** — no loss, duplication, or corruption.
4. Communication is **unidirectional** per channel; there may be a pair of channels between two processes.
5. There is **no global clock**.

The **global state** $S$ consists of:

$$
S = \left(\; \bigcup_{i=1}^{n} s_i \;,\; \bigcup_{(i,j)} c_{ij} \;\right)
$$

where $s_i$ is the local state of process $P_i$ and $c_{ij}$ is the state (sequence of in-transit messages) of the channel from $P_i$ to $P_j$.

---

## Cuts, Consistent Cuts, and Runs

### Definitions

A **cut** is a set of events $C = \{e_1, e_2, \dots, e_n\}$ containing exactly one "frontier" event per process. Everything up to and including that event is considered "before" the cut.

A **consistent cut** satisfies:

$$
\forall\; e \in C,\; \text{if } e' \rightarrow e \text{ then } e' \in C
$$

In words: if the cut includes an event, it must also include every event that *happened before* it (in the Lamport sense).

### Consistent vs Inconsistent — Visual

```
Process P1:  ──a──b──────c──────▶
                    \
                     \  msg m
                      \
Process P2:  ─────d────e────f───▶

Consistent cut C1:    |          (includes b and d)
  P1 frontier: b
  P2 frontier: d
  m is in-transit → recorded in channel state ✓

Inconsistent cut C2:       |     (includes a and f)
  P1 frontier: a
  P2 frontier: f
  f is the RECEIVE of m, but a is BEFORE the SEND of m
  → the receive is in the cut but the send is not ✗
```

### Why Consistency Matters

An inconsistent cut implies an effect without a cause — a received message whose send has not yet "happened." Any analysis performed on an inconsistent snapshot (deadlock detection, checkpointing) can yield **incorrect results**.

---

## The Chandy-Lamport Algorithm

Leslie Lamport and K. Mani Chandy published this landmark algorithm in 1985. It records a **consistent global snapshot** without freezing or synchronising the processes.

### Assumptions

- All channels are **FIFO** (first-in, first-out).
- All channels are **reliable**.
- The communication graph is **strongly connected** (every process can reach every other).

### Core Idea — Marker Messages

The algorithm uses a special control message called a **marker**. Markers serve as separators: they divide messages sent *before* the snapshot from those sent *after*.

### Algorithm Steps

#### Initiator ($P_i$ starts the snapshot)

```
1. Record own local state  s_i
2. For each outgoing channel C_out:
       Send a MARKER on C_out
3. Begin recording messages on every incoming channel
```

#### Any process $P_j$ receiving a MARKER on channel $C_{kj}$

```
IF P_j has NOT yet recorded its state:
    1. Record own local state  s_j
    2. Record channel  C_{kj}  state as EMPTY
    3. For each outgoing channel C_out (except C_{kj}):
           Send a MARKER on C_out
    4. Begin recording messages on all other incoming channels

ELSE (P_j already recorded its state):
    1. Stop recording on channel  C_{kj}
    2. The recorded messages on  C_{kj}  form the channel state
```

#### Termination

The algorithm terminates at a process when it has received a marker on **every** incoming channel.

### Pseudocode

```python
# State at each process P_j
recorded = False
local_state = None
channel_state = {}       # channel_id -> list of messages
recording = set()        # channels currently being recorded

def initiate_snapshot():
    """Called by the initiator process."""
    global recorded, local_state
    recorded = True
    local_state = capture_local_state()
    for ch in outgoing_channels:
        send(ch, MARKER)
    for ch in incoming_channels:
        recording.add(ch)
        channel_state[ch] = []

def on_receive_marker(channel):
    """Called when a MARKER arrives on `channel`."""
    global recorded, local_state
    if not recorded:
        recorded = True
        local_state = capture_local_state()
        channel_state[channel] = []          # empty
        for ch in outgoing_channels:
            send(ch, MARKER)
        for ch in incoming_channels:
            if ch != channel:
                recording.add(ch)
                channel_state[ch] = []
    else:
        recording.discard(channel)
        # channel_state[channel] already has recorded messages

def on_receive_message(channel, msg):
    """Called when an application message arrives."""
    if channel in recording:
        channel_state[channel].append(msg)
    deliver(msg)
```

---

## Proof of Correctness

**Claim:** The Chandy-Lamport algorithm records a consistent cut.

### Key Observations

1. **Send before marker.** When $P_i$ records its state it immediately sends markers on all outgoing channels. Any application message $P_i$ sends *after* recording its state will follow the marker in the FIFO channel.

2. **Receive ordering.** Because channels are FIFO, if $P_j$ receives a message $m$ *before* the marker on channel $C_{ij}$, then $m$ was sent by $P_i$ *before* $P_i$ recorded its state.

3. **Channel state.** Messages recorded on $C_{ij}$ (between $P_j$ recording its state and receiving the marker on $C_{ij}$) are exactly those messages that were in-transit at the snapshot instant.

### Formal Argument

Suppose event $e$ (a send of message $m$ on channel $C_{ij}$) is not in the recorded cut but the corresponding receive $e'$ is. Then:

- $P_j$ recorded state *before* receiving $m$.
- $P_i$ sent $m$ *after* recording state (otherwise $m$ would precede the marker and be included in channel state).
- But then $m$ follows the marker on $C_{ij}$, and $P_j$ would have stopped recording $C_{ij}$ after receiving the marker — so $P_j$ could not have delivered $m$ before the marker.

This is a contradiction. Therefore no such pair $(e, e')$ exists, and the cut is consistent. $\blacksquare$

---

## Example Walkthrough — Three Processes

Consider processes $P_1$, $P_2$, $P_3$ connected in a ring:

```
     P1
    /    \
   ▼      ▲
  P2 ───▶ P3
```

Channels: $C_{12}$, $C_{23}$, $C_{31}$ (and reverse channels $C_{21}$, $C_{32}$, $C_{13}$).

### Initial Application State

| Process | Balance |
|---------|---------|
| $P_1$ | \$500 |
| $P_2$ | \$200 |
| $P_3$ | \$300 |

**Total money in the system: \$1000** (this is a conservation invariant).

### Event Sequence

| Step | Event |
|------|-------|
| 1 | $P_1$ sends \$50 to $P_2$ on $C_{12}$ |
| 2 | $P_1$ **initiates snapshot** — records state $s_1 = \$450$, sends MARKER on $C_{12}$ and $C_{13}$ |
| 3 | $P_2$ receives \$50 from $P_1$ — balance becomes \$250 |
| 4 | $P_2$ sends \$30 to $P_3$ on $C_{23}$ |
| 5 | $P_2$ receives MARKER on $C_{12}$ — first marker! Records $s_2 = \$220$, sets $C_{12} = \emptyset$, sends MARKER on $C_{21}$ and $C_{23}$, starts recording $C_{32}$ |
| 6 | $P_3$ receives MARKER on $C_{13}$ — first marker! Records $s_3 = \$300$, sets $C_{13} = \emptyset$, sends MARKER on $C_{31}$ and $C_{32}$, starts recording $C_{23}$ |
| 7 | $P_3$ receives \$30 from $P_2$ on $C_{23}$ — this arrived *while recording* $C_{23}$, so record it: $C_{23} = [\$30]$ |
| 8 | $P_3$ receives MARKER on $C_{23}$ — stop recording $C_{23}$. Final $C_{23} = [\$30]$ |
| 9 | $P_2$ receives MARKER on $C_{32}$ — stop recording $C_{32}$. Final $C_{32} = []$ |
| 10 | $P_1$ receives MARKER on $C_{21}$ — stop recording. $C_{21} = []$ |
| 11 | $P_1$ receives MARKER on $C_{31}$ — stop recording. $C_{31} = []$ |

### Recorded Global Snapshot

| Component | Value |
|-----------|-------|
| $s_1$ | \$450 |
| $s_2$ | \$220 |
| $s_3$ | \$300 |
| $C_{23}$ | [\$30] |
| All other channels | $\emptyset$ |

**Verification:** $450 + 220 + 300 + 30 = \$1000$ ✓ — the conservation invariant holds.

> The recorded state is consistent even though no process saw this exact combination of balances at the same wall-clock instant.

---

## Lai-Yang Algorithm

The Chandy-Lamport algorithm requires **FIFO** channels. The **Lai-Yang algorithm** (1987) relaxes this assumption and works with **non-FIFO** channels.

### Key Idea — Colouring Messages

Instead of markers, processes *colour* their messages:

1. Every message is tagged **white** (pre-snapshot) or **red** (post-snapshot).
2. When a process records its state, it "turns red" — all subsequent messages are red.
3. Each process records all **white** messages it receives after turning red. These form the channel state.

### Algorithm Outline

```
# At process P_j

colour = WHITE

def initiate_snapshot():
    global colour
    record_local_state()
    colour = RED
    # Piggyback snapshot request on next outgoing messages
    # (or send explicit control messages)

def on_receive(msg, msg_colour, channel):
    if colour == RED and msg_colour == WHITE:
        channel_state[channel].append(msg)
    deliver(msg)
```

### Comparison

| Feature | Chandy-Lamport | Lai-Yang |
|---------|---------------|----------|
| Channel model | FIFO required | Non-FIFO OK |
| Control messages | Explicit markers | Piggyback colouring |
| Message overhead | $O(e)$ markers ($e$ = edges) | Colour bit per message |
| Complexity | $O(e)$ messages | $O(e)$ messages |
| Implementation | Simpler | More bookkeeping |

---

## Snapshot Applications

### 1. Distributed Debugging

A snapshot provides a **consistent global state** that you can examine offline:

- Extract variable values across all processes.
- Build a combined event log.
- Verify invariants (e.g., total money in a banking system).

### 2. Stable Property Detection

A property $\phi$ is **stable** if:

$$
S \models \phi \implies \forall S' \text{ reachable from } S,\; S' \models \phi
$$

**Theorem:** If a stable property $\phi$ holds in the actual system state when the snapshot begins, then $\phi$ holds in the recorded snapshot.

This lets you use snapshots to detect:

- **Deadlock:** If the snapshot shows a cycle in the wait-for graph, the system is truly deadlocked.
- **Termination:** If all processes are idle and all channels are empty in the snapshot, the computation has terminated.
- **Token loss:** If no process holds the token and no channel contains it, the token is lost.

### 3. Checkpointing and Recovery

Periodically take snapshots. On failure, restore the most recent consistent snapshot and replay or restart from there.

```
Timeline:
  ──────[Snapshot S1]──────[Snapshot S2]──────✗ CRASH
                                              │
                         Roll back to S2 ◄────┘
```

### 4. Garbage Collection

An object is garbage if no live reference points to it across the entire system. A snapshot lets you scan all process states and channel contents for references.

---

## Relationship to Happens-Before

The Chandy-Lamport snapshot is deeply connected to Lamport's **happens-before** relation ($\rightarrow$).

### Consistent Cut Characterisation

A cut $C$ is **consistent** if and only if:

$$
\forall\; e \in C,\; e' \rightarrow e \implies e' \in C
$$

This is exactly the *downward closure* under $\rightarrow$. The set of events before a consistent cut forms a **causally closed** set — a *prefix* of the partial order defined by $\rightarrow$.

### Lattice of Consistent Cuts

The set of all consistent cuts of a distributed computation forms a **lattice** under set inclusion. The snapshot algorithm finds one point in this lattice.

```
         {} (empty cut)
        / \
       /   \
     C1     C2
       \   /
        \ /
       C1 ∪ C2
        ...
      (full execution)
```

### Possible vs Definite Snapshots

The recorded snapshot $S^*$ satisfies:

$$
S_{\text{before}} \leadsto^{*} S^* \leadsto^{*} S_{\text{after}}
$$

where $S_{\text{before}}$ is the state when the snapshot started and $S_{\text{after}}$ is the state when it completed. The snapshot is a **reachable** state — it *could* have occurred, even if it never actually did at any single instant.

---

## Implementation Considerations

### 1. Initiating the Snapshot

Any process can initiate. In practice:

- A **monitor process** initiates periodically for checkpointing.
- Multiple concurrent snapshots are distinguished by unique **snapshot IDs**.

```python
marker = {
    "type": "MARKER",
    "snapshot_id": uuid4(),
    "initiator": process_id,
}
```

### 2. Concurrent Snapshots

Multiple snapshots can run simultaneously. Each process maintains separate state per snapshot ID:

```python
snapshots = {}  # snapshot_id -> { local_state, channel_states, recording }

def on_receive_marker(channel, snapshot_id):
    if snapshot_id not in snapshots:
        snapshots[snapshot_id] = new_snapshot_state()
        # ... first marker logic
    else:
        # ... subsequent marker logic for this snapshot_id
```

### 3. Message Complexity

For a system with $n$ processes and $e$ directed channels:

| Metric | Value |
|--------|-------|
| Marker messages | $O(e)$ |
| Additional application messages | $0$ |
| Space per process | $O($ incoming messages $)$ |
| Time to complete | $O(d)$ where $d$ = diameter of the network |

### 4. FIFO Enforcement

If your network does not guarantee FIFO, you have two options:

1. **Build FIFO on top of non-FIFO** using sequence numbers.
2. **Use the Lai-Yang algorithm** which handles non-FIFO natively.

```python
# Simple FIFO enforcement with sequence numbers
seq_out = {}   # channel -> next send seq
seq_in = {}    # channel -> next expected seq
buffer = {}    # channel -> {seq: msg}

def fifo_send(channel, msg):
    seq_out[channel] = seq_out.get(channel, 0) + 1
    raw_send(channel, (seq_out[channel], msg))

def fifo_receive(channel, packet):
    seq, msg = packet
    buffer.setdefault(channel, {})[seq] = msg
    expected = seq_in.get(channel, 1)
    while expected in buffer[channel]:
        deliver(buffer[channel].pop(expected))
        expected += 1
    seq_in[channel] = expected
```

### 5. Failure Handling

The basic algorithm assumes no failures during the snapshot. In practice:

- Use **timeouts** to detect failed processes.
- Combine with a **failure detector** to handle crashes.
- Treat a crashed process's last checkpointed state as its snapshot state.

### 6. Large-Scale Systems

In systems with thousands of nodes (e.g., Apache Flink, Google Dataflow):

- **Asynchronous Barrier Snapshotting (ABS):** A variant where barriers (markers) flow through the data pipeline and each operator snapshots when it receives barriers on *all* inputs.
- **Incremental snapshots:** Only record *changes* since the last snapshot.

```
Operator graph (streaming pipeline):

  Source ──▶ Map ──▶ KeyBy ──▶ Reduce ──▶ Sink
          barrier     barrier    barrier
          ──▶         ──▶        ──▶
```

---

## Exercises

### Exercise 1 — Identify the Cut

Given the following execution, determine whether each cut is consistent:

```
P1:  a ──── b ──────── c ──── d
              \
               msg m1
                \
P2:  e ──── f ──── g ──── h
                  /
               msg m2
              /
P3:  i ──── j ──── k ──── l
```

- **Cut A:** $P_1$ after $b$, $P_2$ after $g$, $P_3$ after $j$
- **Cut B:** $P_1$ after $a$, $P_2$ after $g$, $P_3$ after $k$

<details>
<summary>Solution</summary>

**Cut A:**  
- $b \rightarrow g$ via $m_1$. Cut includes $b$ (sender) and $g$ (receiver). The send is in the cut. ✓  
- $j \rightarrow g$ via $m_2$. Cut includes $j$ (sender) and $g$ (receiver). ✓  
- **Consistent.** ✓

**Cut B:**  
- $b \rightarrow g$ via $m_1$. Cut includes $g$ (receiver) at $P_2$ but $P_1$ is only at $a$, so $b$ (the send) is NOT in the cut. An effect without a cause.  
- **Inconsistent.** ✗

</details>

---

### Exercise 2 — Chandy-Lamport Trace

Three processes $P_1$, $P_2$, $P_3$ with the following events:

1. $P_1$ sends $m_1$ to $P_2$.
2. $P_1$ initiates a snapshot.
3. $P_2$ receives $m_1$.
4. $P_2$ sends $m_2$ to $P_3$.
5. $P_2$ receives MARKER from $P_1$.
6. $P_3$ receives MARKER from $P_1$.
7. $P_3$ receives $m_2$.
8. $P_3$ receives MARKER from $P_2$.

What are the recorded channel states for $C_{12}$, $C_{13}$, and $C_{23}$?

<details>
<summary>Solution</summary>

- **$C_{12}$:** $P_2$ received $m_1$ *before* the marker (step 3 < step 5), and $P_2$'s first marker is from $P_1$ on $C_{12}$. Since $m_1$ arrived before the marker, it is NOT recorded in channel state (it is reflected in $P_2$'s local state instead). $C_{12} = \emptyset$.

  Wait — let's re-examine. $P_2$'s first marker arrives at step 5. At that point $P_2$ records its state. Since this is the first marker, $C_{12} = \emptyset$ by the algorithm rule.

- **$C_{13}$:** $P_3$'s first marker is from $P_1$ at step 6. This is the first marker for $P_3$, so $C_{13} = \emptyset$.

- **$C_{23}$:** $P_3$ starts recording $C_{23}$ at step 6 (after receiving first marker from $P_1$). $m_2$ arrives at step 7 (while recording). MARKER from $P_2$ arrives at step 8 → stop recording. $C_{23} = [m_2]$.

</details>

---

### Exercise 3 — Conservation Check

A distributed banking system has 4 processes with balances \$100, \$200, \$150, \$50. A snapshot records:

| Component | Value |
|-----------|-------|
| $s_1$ | \$80 |
| $s_2$ | \$210 |
| $s_3$ | \$130 |
| $s_4$ | \$50 |
| $C_{12}$ | [\$20] |
| $C_{31}$ | [\$10] |
| All others | $\emptyset$ |

Is this snapshot valid? Verify the conservation invariant.

<details>
<summary>Solution</summary>

Total = $80 + 210 + 130 + 50 + 20 + 10 = \$500$.

Original total = $100 + 200 + 150 + 50 = \$500$.

$500 = 500$ ✓ — The conservation invariant holds. The snapshot is valid.

The \$20 on $C_{12}$ represents money sent by $P_1$ (which is why $P_1$ shows \$80 instead of \$100) that has not yet been received by $P_2$. Similarly, \$10 on $C_{31}$ was sent by $P_3$ but not yet received by $P_1$.

</details>

---

### Exercise 4 — Lai-Yang Colouring

Explain why the Lai-Yang algorithm works correctly with non-FIFO channels, while Chandy-Lamport does not.

<details>
<summary>Solution</summary>

In Chandy-Lamport, the marker acts as a **separator** in the FIFO channel: all pre-snapshot messages arrive before the marker, and all post-snapshot messages arrive after. If the channel is non-FIFO, a post-snapshot message could overtake the marker and be incorrectly included in the channel state.

In Lai-Yang, every message carries its own colour (white = pre-snapshot, red = post-snapshot). The receiver can distinguish pre- and post-snapshot messages regardless of arrival order. The channel state is simply all white messages received after the process turns red — order does not matter.

</details>

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Global snapshot | Captures process states + channel states consistently |
| Consistent cut | Causally closed — no effect without its cause |
| Chandy-Lamport | Marker-based, requires FIFO, $O(e)$ messages |
| Lai-Yang | Colour-based, works with non-FIFO channels |
| Stable properties | Can be reliably detected from any consistent snapshot |
| Happens-before link | Consistent cuts = downward-closed sets under $\rightarrow$ |
| Practical use | Checkpointing, debugging, deadlock/termination detection |

> **Key takeaway:** You cannot observe a distributed system at a single instant, but the Chandy-Lamport algorithm lets you capture a state that *could have* occurred — and that is sufficient for detecting stable properties, checkpointing, and debugging.
