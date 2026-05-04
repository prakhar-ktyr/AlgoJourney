---
title: "Checkpointing and Recovery"
---

# Checkpointing and Recovery

Checkpointing saves the state of a distributed system at specific points so that, upon failure, the system can **roll back** to a consistent state rather than restarting from scratch.

---

## Why Checkpointing Matters

In long-running distributed computations, failures are inevitable. Without checkpointing:

- Hours or days of computation are lost on a single node crash
- All participating processes must restart from the beginning
- Resources consumed before the failure are entirely wasted

**Rollback recovery** restores the system to a previously saved consistent state:

```text
Timeline:
  P1: ───[C1]─────────[C2]──────X (crash)
  P2: ────────[C1]──────────[C2]───────

  Recovery: Roll back P1 to C2, resume from there
```

| Recovery Approach | Description | Overhead |
|---|---|---|
| Checkpoint-based | Periodically save full state | High storage, low recovery time |
| Log-based | Record messages/events | Low storage, higher recovery time |
| Hybrid | Checkpoint + selective logging | Balanced |

---

## Uncoordinated Checkpointing

Each process independently decides **when** to checkpoint without synchronizing with others.

### The Domino Effect

When processes checkpoint independently, recovering one process may force others to roll back, creating a cascading chain of rollbacks:

```text
P1: ──[C1_1]────m1──────[C1_2]──────m3───X
          │               │
P2: ──────────[C2_1]──m2──────[C2_2]──────
                      │
P3: ──[C3_1]─────────────[C3_2]───────────

Message dependencies can force rollback to C1_1, C2_1, C3_1
(the "domino effect" — rolling all the way back)
```

### Problems with Uncoordinated Checkpointing

| Problem | Explanation |
|---|---|
| Domino effect | Cascading rollbacks to initial state |
| Useless checkpoints | Checkpoints that can never be part of a consistent cut |
| Garbage collection | Hard to determine which checkpoints to discard |
| Orphan messages | Messages received but whose send is undone |
| Lost messages | Messages sent but whose receive is undone |

### Implementation Example

```python
class UncoordinatedCheckpoint:
    def __init__(self, process_id, interval_sec):
        self.process_id = process_id
        self.interval = interval_sec
        self.state = {}
        self.checkpoints = []
        self.dependency_vector = []  # Track causal dependencies

    def take_checkpoint(self):
        """Independently save local state."""
        checkpoint = {
            "id": f"{self.process_id}_{len(self.checkpoints)}",
            "state": self.state.copy(),
            "timestamp": time.time(),
            "dependencies": self.dependency_vector.copy(),
        }
        self.checkpoints.append(checkpoint)
        self.save_to_stable_storage(checkpoint)
        return checkpoint

    def receive_message(self, message, sender_checkpoint_id):
        """Track dependency on sender's checkpoint."""
        self.dependency_vector.append(sender_checkpoint_id)
        self.process_message(message)

    def find_recovery_line(self, all_checkpoints):
        """Find the latest consistent cut across all processes."""
        # Must find checkpoints with no orphan messages
        # This is the core challenge of uncoordinated checkpointing
        pass
```

---

## Coordinated Checkpointing

All processes coordinate to take checkpoints at the **same logical instant**, guaranteeing a consistent global state.

### Chandy-Lamport Based Approach

The Chandy-Lamport snapshot algorithm forms the basis for coordinated checkpointing:

```text
Coordinator:
  1. Broadcast "TAKE_CHECKPOINT" marker
  2. Each process:
     a. Saves local state
     b. Forwards marker on all outgoing channels
     c. Records channel state until marker arrives on each incoming channel
  3. Coordinator collects acknowledgments
  4. Broadcast "COMMIT" (or "ABORT" on failure)
```

### Two-Phase Coordinated Protocol

```python
class CoordinatedCheckpoint:
    def __init__(self, process_id, peers):
        self.process_id = process_id
        self.peers = peers
        self.tentative_checkpoint = None
        self.stable_checkpoint = None

    # --- Coordinator Logic ---

    def initiate_checkpoint(self):
        """Phase 1: Request tentative checkpoint from all."""
        self.take_tentative_checkpoint()
        responses = []
        for peer in self.peers:
            resp = self.send_request(peer, "CHECKPOINT_REQUEST")
            responses.append(resp)

        if all(r == "ACK" for r in responses):
            # Phase 2: Commit
            for peer in self.peers:
                self.send_request(peer, "COMMIT")
            self.commit_checkpoint()
        else:
            # Phase 2: Abort
            for peer in self.peers:
                self.send_request(peer, "ABORT")
            self.discard_tentative()

    # --- Participant Logic ---

    def handle_checkpoint_request(self):
        """Take tentative checkpoint, stop sending messages."""
        self.tentative_checkpoint = self.capture_state()
        return "ACK"

    def handle_commit(self):
        """Make tentative checkpoint permanent."""
        self.stable_checkpoint = self.tentative_checkpoint
        self.tentative_checkpoint = None
        self.garbage_collect_old_checkpoints()

    def handle_abort(self):
        """Discard tentative checkpoint."""
        self.tentative_checkpoint = None
```

### Advantages and Disadvantages

| Aspect | Coordinated | Uncoordinated |
|---|---|---|
| Consistency | Always consistent | May have domino effect |
| Storage | Only latest checkpoint needed | Multiple checkpoints stored |
| Synchronization | Requires global coordination | No coordination |
| Blocking | Processes pause during protocol | Non-blocking |
| Recovery | Simple — use latest checkpoint | Complex — find recovery line |

---

## Communication-Induced Checkpointing

A hybrid approach where processes take **forced checkpoints** based on communication patterns, preventing the domino effect without full coordination.

### Types of Forced Checkpoints

```text
Basic Checkpoints: Taken autonomously by each process
Forced Checkpoints: Taken due to message dependencies

P1: ──[B]───────m1────[F]────────────
                 │          
P2: ─────[B]────────────m2───[F]─────
                         │
P3: ──────────[B]────────────────[B]──

B = Basic (autonomous)  F = Forced (communication-induced)
```

### Index-Based Protocol

```python
class CICProtocol:
    """Communication-Induced Checkpointing using piggybacked info."""

    def __init__(self, process_id):
        self.process_id = process_id
        self.clock = 0  # Logical clock
        self.checkpoint_index = 0
        self.last_checkpoint_clock = 0

    def send_message(self, message, destination):
        """Piggyback checkpoint index on outgoing messages."""
        self.clock += 1
        envelope = {
            "payload": message,
            "sender_id": self.process_id,
            "sender_ckpt_index": self.checkpoint_index,
            "sender_clock": self.clock,
        }
        return envelope

    def receive_message(self, envelope):
        """Check if forced checkpoint is needed."""
        self.clock = max(self.clock, envelope["sender_clock"]) + 1

        # If sender's checkpoint index is ahead, take forced checkpoint
        if envelope["sender_ckpt_index"] > self.checkpoint_index:
            self.take_forced_checkpoint()

        return envelope["payload"]

    def take_forced_checkpoint(self):
        """Force a checkpoint to maintain consistency."""
        self.checkpoint_index += 1
        self.last_checkpoint_clock = self.clock
        self.save_state()
```

---

## Message Logging

Message logging complements checkpointing by recording messages so that they can be **replayed** during recovery.

### Pessimistic Logging

Every message is logged to stable storage **before** delivery:

```python
class PessimisticLogging:
    """Log every message synchronously before processing."""

    def __init__(self, process_id, stable_storage):
        self.process_id = process_id
        self.storage = stable_storage
        self.message_log = []

    def receive_message(self, message):
        # Step 1: Log to stable storage BEFORE processing
        log_entry = {
            "sequence": len(self.message_log),
            "message": message,
            "determinant": self.get_determinant(message),
        }
        self.storage.sync_write(log_entry)  # Synchronous!
        self.message_log.append(log_entry)

        # Step 2: Now safe to process
        self.process(message)

    def recover(self, checkpoint):
        """Replay logged messages from last checkpoint."""
        self.restore_state(checkpoint)
        logged = self.storage.read_log(since=checkpoint["sequence"])
        for entry in logged:
            self.replay(entry["message"], entry["determinant"])
```

### Optimistic Logging

Messages are logged **asynchronously** — buffered in volatile memory and periodically flushed:

```python
class OptimisticLogging:
    """Log messages asynchronously for better performance."""

    def __init__(self, process_id, stable_storage, flush_interval=100):
        self.process_id = process_id
        self.storage = stable_storage
        self.volatile_log = []  # In-memory buffer
        self.flush_interval = flush_interval

    def receive_message(self, message):
        # Log to volatile memory (fast)
        log_entry = {
            "sequence": len(self.volatile_log),
            "message": message,
            "determinant": self.get_determinant(message),
        }
        self.volatile_log.append(log_entry)

        # Periodic async flush
        if len(self.volatile_log) % self.flush_interval == 0:
            self.async_flush()

        # Process immediately (no sync wait)
        self.process(message)

    def recover(self, checkpoint):
        """May lose messages not yet flushed — orphan creation possible."""
        self.restore_state(checkpoint)
        flushed = self.storage.read_log(since=checkpoint["sequence"])
        for entry in flushed:
            self.replay(entry["message"], entry["determinant"])
        # Messages in volatile_log at crash time are LOST
```

### Causal Logging

Logs only the **causal dependencies** needed for deterministic replay:

| Logging Type | Sync Overhead | Recovery | Orphans Possible | Output Commit |
|---|---|---|---|---|
| Pessimistic | High (sync I/O per msg) | Fast, simple | No | Immediate |
| Optimistic | Low (async batch) | May need rollback | Yes | Delayed |
| Causal | Medium (piggyback) | Moderate | No | Delayed |

---

## Checkpoint-Restart in HPC

High-Performance Computing workloads run for days on thousands of nodes; checkpointing is essential.

### System-Level Checkpointing

```bash
# Using DMTCP (Distributed MultiThreaded CheckPointing)
# Start application under DMTCP coordinator
dmtcp_launch --checkpoint-interval 3600 ./my_hpc_application

# Manual checkpoint trigger
dmtcp_command --checkpoint

# Restart from checkpoint
dmtcp_restart ckpt_my_hpc_application_*.dmtcp
```

### Application-Level Checkpointing in MPI

```c
// Periodic checkpoint in an MPI application
void checkpoint_if_needed(int iteration, AppState *state) {
    if (iteration % CHECKPOINT_INTERVAL == 0) {
        // All processes synchronize
        MPI_Barrier(MPI_COMM_WORLD);

        int rank;
        MPI_Comm_rank(MPI_COMM_WORLD, &rank);

        // Each process writes its own state
        char filename[256];
        snprintf(filename, sizeof(filename),
                 "checkpoint/proc_%d_iter_%d.ckpt", rank, iteration);

        FILE *fp = fopen(filename, "wb");
        fwrite(state, sizeof(AppState), 1, fp);
        fclose(fp);

        // Synchronize again to ensure all writes complete
        MPI_Barrier(MPI_COMM_WORLD);

        if (rank == 0) {
            printf("Checkpoint at iteration %d complete\n", iteration);
        }
    }
}
```

### HPC Checkpointing Considerations

| Factor | Consideration |
|---|---|
| Checkpoint size | Can be GBs–TBs across all nodes |
| I/O bandwidth | Burst buffer or parallel file system needed |
| Frequency | Balance overhead vs. lost work on failure |
| Incremental | Only save changed pages (reduces I/O) |
| Multi-level | Local SSD → shared FS → remote archive |

---

## Checkpointing in Stream Processing (Flink Barriers)

Apache Flink uses **aligned checkpoint barriers** to create consistent snapshots of streaming dataflows.

### Barrier Mechanism

```text
Source1: ──[data]──[data]──|B|──[data]──[data]──
                            │
Operator: ──[data]──[data]──|B|──[data]──[data]──
                            │
Sink:     ──[data]──[data]──|B|──[data]──[data]──

|B| = Checkpoint Barrier (injected by coordinator)
```

### How Flink Checkpointing Works

```java
// Flink checkpoint configuration
StreamExecutionEnvironment env =
    StreamExecutionEnvironment.getExecutionEnvironment();

// Enable checkpointing every 60 seconds
env.enableCheckpointing(60000);

// Set checkpoint mode (EXACTLY_ONCE or AT_LEAST_ONCE)
env.getCheckpointConfig()
    .setCheckpointingMode(CheckpointingMode.EXACTLY_ONCE);

// Set timeout — abort if not completed within 10 minutes
env.getCheckpointConfig()
    .setCheckpointTimeout(600000);

// Allow only 1 concurrent checkpoint
env.getCheckpointConfig()
    .setMaxConcurrentCheckpoints(1);

// Minimum pause between checkpoints
env.getCheckpointConfig()
    .setMinPauseBetweenCheckpoints(30000);
```

### Aligned vs. Unaligned Barriers

| Feature | Aligned | Unaligned |
|---|---|---|
| Backpressure handling | Can stall pipeline | Stores in-flight data |
| Checkpoint size | Smaller (operator state only) | Larger (includes buffers) |
| Latency impact | Higher under backpressure | Lower, more predictable |
| Exactly-once | Yes | Yes |
| Introduced in | Flink 1.0 | Flink 1.11 |

---

## Checkpointing in Databases (WAL, ARIES)

### Write-Ahead Logging (WAL)

The WAL protocol ensures durability by writing log records **before** modifying data pages:

```text
Transaction T1:
  1. Write log: <T1, page_5, old_val, new_val>  → LOG (on disk)
  2. Modify page_5 in buffer pool                → MEMORY
  3. Eventually flush page_5 to disk             → DATA FILE

Checkpoint:
  1. Write <BEGIN_CHECKPOINT> to log
  2. Record active transactions and dirty pages
  3. Flush dirty pages to disk
  4. Write <END_CHECKPOINT> to log
```

### ARIES Recovery Algorithm

ARIES (Algorithm for Recovery and Isolation Exploiting Semantics) uses three phases:

```python
class ARIESRecovery:
    """Simplified ARIES recovery protocol."""

    def __init__(self, log, checkpoint):
        self.log = log
        self.checkpoint = checkpoint
        self.dirty_page_table = {}
        self.active_transactions = {}

    def recover(self):
        """Three-phase recovery."""
        self.analysis_phase()
        self.redo_phase()
        self.undo_phase()

    def analysis_phase(self):
        """Scan log from last checkpoint to identify:
        - Which pages are dirty (need redo)
        - Which transactions were active at crash (need undo)
        """
        self.dirty_page_table = self.checkpoint["dirty_pages"].copy()
        self.active_transactions = self.checkpoint["active_txns"].copy()

        for record in self.log.scan_from(self.checkpoint["lsn"]):
            if record.type == "UPDATE":
                self.dirty_page_table[record.page_id] = record.lsn
                self.active_transactions[record.txn_id] = record.lsn
            elif record.type == "COMMIT":
                del self.active_transactions[record.txn_id]
            elif record.type == "ABORT":
                pass  # Will be undone

    def redo_phase(self):
        """Redo all updates from earliest dirty page LSN forward."""
        start_lsn = min(self.dirty_page_table.values())
        for record in self.log.scan_from(start_lsn):
            if record.type == "UPDATE":
                if self.needs_redo(record):
                    self.apply_redo(record)

    def undo_phase(self):
        """Undo all updates from active (uncommitted) transactions."""
        for txn_id, last_lsn in self.active_transactions.items():
            self.undo_transaction(txn_id, last_lsn)
```

---

## Container Checkpoint/Restore (CRIU)

CRIU (Checkpoint/Restore In Userspace) enables freezing a running container and restoring it later.

### Basic CRIU Operations

```bash
# Checkpoint a running container
sudo criu dump --tree <PID> --images-dir /tmp/checkpoint/ \
    --leave-stopped --shell-job

# Restore the container from checkpoint
sudo criu restore --images-dir /tmp/checkpoint/ --shell-job

# Checkpoint a Docker container (uses CRIU underneath)
docker checkpoint create my_container checkpoint_1

# Restore a Docker container
docker start --checkpoint checkpoint_1 my_container
```

### Kubernetes Checkpoint (Forensic Analysis)

```yaml
# Kubernetes 1.25+ supports container checkpointing
# POST /checkpoint/{namespace}/{pod}/{container}
apiVersion: v1
kind: Pod
metadata:
  name: checkpointable-app
spec:
  containers:
  - name: app
    image: my-app:latest
    # Container can be checkpointed via kubelet API
```

### CRIU Use Cases

| Use Case | Description |
|---|---|
| Live migration | Move container between hosts without downtime |
| Fast startup | Restore pre-warmed application state |
| Forensic analysis | Capture state for debugging |
| Spot instance tolerance | Checkpoint before preemption |
| CI/CD caching | Save build environment state |

---

## Practical: Designing a Checkpoint Strategy

### Decision Framework

```text
┌─────────────────────────────────────────┐
│   What is the computation cost of       │
│   re-executing from start?              │
├────────────────┬────────────────────────┤
│ Low (<minutes) │ High (hours/days)      │
│ → No checkpoint│ → Checkpoint needed    │
└────────────────┴────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    Tightly coupled  Loosely coupled  Streaming
         │               │               │
    Coordinated     Uncoordinated    Barrier-based
    checkpoint      + msg logging    (Flink-style)
```

### Choosing Checkpoint Frequency

The optimal checkpoint interval balances overhead against wasted work:

```python
def optimal_checkpoint_interval(
    checkpoint_cost_sec,   # Time to take one checkpoint
    mtbf_sec,             # Mean Time Between Failures
    restart_cost_sec,     # Fixed cost to restart from checkpoint
):
    """
    Young's approximation for optimal checkpoint interval:
    T_opt = sqrt(2 * C * M)
    where C = checkpoint cost, M = MTBF
    """
    import math
    t_opt = math.sqrt(2 * checkpoint_cost_sec * mtbf_sec)
    return t_opt

# Example: 30s checkpoint cost, 24h MTBF
interval = optimal_checkpoint_interval(30, 86400)
print(f"Optimal interval: {interval:.0f} seconds")
# Output: Optimal interval: 2276 seconds (~38 minutes)
```

### Full Strategy Design

```python
class CheckpointStrategy:
    """Design a complete checkpoint strategy for a distributed system."""

    def __init__(self, config):
        self.config = config

    def design(self):
        strategy = {}

        # 1. Determine checkpoint type
        if self.config["coupling"] == "tight":
            strategy["type"] = "coordinated"
            strategy["protocol"] = "chandy-lamport"
        elif self.config["coupling"] == "loose":
            strategy["type"] = "uncoordinated"
            strategy["logging"] = "pessimistic"
        elif self.config["paradigm"] == "streaming":
            strategy["type"] = "barrier-based"
            strategy["semantics"] = "exactly-once"

        # 2. Determine storage backend
        if self.config["state_size_gb"] < 1:
            strategy["storage"] = "distributed_fs"
        elif self.config["state_size_gb"] < 100:
            strategy["storage"] = "parallel_fs_with_burst_buffer"
        else:
            strategy["storage"] = "multi_level"
            strategy["levels"] = ["local_ssd", "shared_fs", "object_store"]

        # 3. Determine frequency
        strategy["interval_sec"] = optimal_checkpoint_interval(
            self.config["checkpoint_cost_sec"],
            self.config["mtbf_sec"],
        )

        # 4. Incremental vs full
        if self.config["state_change_ratio"] < 0.1:
            strategy["mode"] = "incremental"
        else:
            strategy["mode"] = "full"

        # 5. Retention policy
        strategy["keep_last_n"] = 3
        strategy["async_deletion"] = True

        return strategy


# Example usage
config = {
    "coupling": "tight",
    "paradigm": "batch",
    "state_size_gb": 50,
    "checkpoint_cost_sec": 45,
    "mtbf_sec": 43200,  # 12 hours
    "state_change_ratio": 0.05,
}

strategy = CheckpointStrategy(config).design()
```

---

## Recovery Time Considerations

### Recovery Time Components

```text
Total Recovery Time = T_detect + T_restart + T_restore + T_replay

T_detect  : Time to detect the failure (heartbeat timeout)
T_restart : Time to acquire new resources and start processes
T_restore : Time to load checkpoint from stable storage
T_replay  : Time to replay logged messages (log-based recovery)
```

### Reducing Recovery Time

| Technique | Reduces | How |
|---|---|---|
| Frequent checkpoints | T_replay | Less work to replay |
| Local checkpoint storage | T_restore | Faster I/O than remote |
| Parallel restore | T_restore | Multiple threads loading state |
| Standby replicas | T_restart + T_restore | Warm standby already has state |
| Incremental checkpoints | T_restore | Smaller checkpoint to load |
| Pre-allocated resources | T_restart | Spare nodes ready to go |

### Recovery Time Objective (RTO) Planning

```python
def estimate_recovery_time(
    detection_timeout_sec,
    resource_acquisition_sec,
    checkpoint_size_gb,
    restore_bandwidth_gbps,
    log_size_mb,
    replay_rate_mb_per_sec,
):
    """Estimate total recovery time for capacity planning."""
    t_detect = detection_timeout_sec
    t_restart = resource_acquisition_sec
    t_restore = (checkpoint_size_gb * 8) / restore_bandwidth_gbps
    t_replay = log_size_mb / replay_rate_mb_per_sec

    total = t_detect + t_restart + t_restore + t_replay

    breakdown = {
        "detection": t_detect,
        "restart": t_restart,
        "restore": t_restore,
        "replay": t_replay,
        "total_seconds": total,
    }
    return breakdown

# Example: 10GB checkpoint, 10Gbps network, 500MB log
result = estimate_recovery_time(
    detection_timeout_sec=10,
    resource_acquisition_sec=30,
    checkpoint_size_gb=10,
    restore_bandwidth_gbps=10,
    log_size_mb=500,
    replay_rate_mb_per_sec=100,
)
# total ≈ 10 + 30 + 8 + 5 = 53 seconds
```

---

## Exercises

1. **Domino Effect Simulation**: Given three processes with independent checkpoints and a set of inter-process messages, identify whether a consistent recovery line exists and determine the furthest-back rollback required.

2. **Checkpoint Interval Calculation**: A system has a checkpoint cost of 60 seconds and experiences failures every 6 hours on average. Using Young's formula, calculate the optimal checkpoint interval and the expected overhead percentage.

3. **Protocol Comparison**: Design a table comparing coordinated checkpointing, communication-induced checkpointing, and pessimistic message logging for a 100-node cluster processing 10,000 messages/second.

4. **Flink Checkpoint Design**: A Flink job has 50 parallel operators, each with 2GB of state. Network bandwidth is 10Gbps. Calculate the minimum checkpoint interval that keeps overhead below 5%.

5. **Recovery Strategy**: A microservices system has an RTO of 30 seconds. Design a checkpoint/recovery strategy specifying: checkpoint type, frequency, storage backend, and standby configuration.

---

## Summary

| Concept | Key Takeaway |
|---|---|
| Rollback recovery | Restore to a consistent past state on failure |
| Domino effect | Uncoordinated checkpoints can cascade rollbacks |
| Coordinated checkpointing | Guarantees consistency, but requires synchronization |
| Communication-induced | Prevents dominos without full coordination |
| Message logging | Complements checkpoints for finer recovery |
| HPC checkpointing | Multi-level storage, incremental saves |
| Stream processing | Barrier-based aligned/unaligned checkpoints |
| Database (ARIES) | WAL + analysis/redo/undo phases |
| CRIU | Userspace checkpoint/restore for containers |
| Recovery time | Detection + restart + restore + replay |

Effective checkpointing balances **overhead** (time and storage spent saving state) against **vulnerability** (work lost between checkpoints on failure). The optimal strategy depends on computation cost, failure rate, coupling between processes, and recovery time requirements.
