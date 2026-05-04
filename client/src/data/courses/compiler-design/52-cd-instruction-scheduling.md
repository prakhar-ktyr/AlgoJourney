---
title: Instruction Scheduling
---

# Instruction Scheduling

Instruction scheduling reorders instructions to improve performance by hiding latencies and exploiting **instruction-level parallelism (ILP)** without changing program semantics.

---

## Why Schedule Instructions?

Modern processors use **pipelining** — multiple instructions execute simultaneously in different stages:

```
Time →   1    2    3    4    5    6    7
Instr 1: IF   ID   EX   MEM  WB
Instr 2:      IF   ID   EX   MEM  WB
Instr 3:           IF   ID   EX   MEM  WB
```

**Pipeline hazards** occur when an instruction depends on a result not yet available:

```c
// Without scheduling:
t1 = load(A)     // takes 3 cycles
t2 = t1 + 1      // STALL: must wait for t1!
t3 = load(B)     // could have executed during stall
t4 = t3 * 2
```

```c
// After scheduling:
t1 = load(A)     // cycle 1
t3 = load(B)     // cycle 2 (no dependency on t1)
t2 = t1 + 1      // cycle 4 (t1 ready now, no stall!)
t4 = t3 * 2      // cycle 5 (t3 ready)
```

We saved cycles by filling the latency gap!

---

## Instruction-Level Parallelism (ILP)

ILP measures how many instructions can execute simultaneously:

$$
\text{ILP} = \frac{\text{Total instructions}}{\text{Cycles needed with perfect scheduling}}
$$

A basic block with high ILP can keep multiple functional units busy:

```c
a = x + y    // can execute in parallel
b = p * q    // independent of a
c = m - n    // independent of a and b
d = a + b    // depends on a and b
```

Here, the first three instructions have no dependencies — ILP = 3 for those.

---

## Data Dependences

Three types of data dependences constrain scheduling:

### True Dependence (RAW — Read After Write)

```c
t1 = a + b      // writes t1
t2 = t1 * c     // reads t1 — MUST come after
```

**Cannot** be eliminated. The second instruction genuinely needs the first's result.

### Anti-Dependence (WAR — Write After Read)

```c
t1 = a + b      // reads a
a = c * d       // writes a — must come after the read
```

Can be eliminated by **renaming**:

```c
t1 = a + b
a2 = c * d      // use a different name
```

### Output Dependence (WAW — Write After Write)

```c
t1 = a + b      // writes t1
t1 = c * d      // writes t1 again — must come after
```

Also eliminable by renaming:

```c
t1 = a + b
t2 = c * d
```

---

## Dependency DAG

A **Dependency DAG** (Directed Acyclic Graph) represents all constraints on instruction ordering:

- **Nodes** = instructions
- **Edges** = dependences (labeled with type and latency)

### Example

```c
1: t1 = load(A)      // latency 3
2: t2 = load(B)      // latency 3
3: t3 = t1 + t2      // latency 1, depends on 1 and 2
4: t4 = t1 * 2       // latency 2, depends on 1
5: t5 = t3 + t4      // latency 1, depends on 3 and 4
6: store t5 → C      // latency 1, depends on 5
```

```
DAG:
    [1: load A]  ──3──→  [3: t1+t2]  ──1──→  [5: t3+t4]  ──1──→  [6: store]
        │                     ↑                    ↑
        └──3──→  [4: t1*2] ──2────────────────────┘
    [2: load B]  ──3──→  [3: t1+t2]
```

Edge labels show the minimum cycles between instructions.

---

## Pipeline Model

A simple 5-stage pipeline:

| Stage | Name | Description |
|-------|------|-------------|
| IF | Instruction Fetch | Read instruction from memory |
| ID | Instruction Decode | Decode opcode, read registers |
| EX | Execute | ALU operation |
| MEM | Memory Access | Load/store data |
| WB | Write Back | Write result to register |

### Instruction Latencies

| Operation | Latency (cycles) |
|-----------|-------------------|
| Integer ALU (add, sub) | 1 |
| Integer multiply | 2-3 |
| Load from L1 cache | 3-4 |
| Load from L2 cache | 10-12 |
| Floating-point add | 3-4 |
| Floating-point multiply | 4-5 |
| Division | 20-40 |

---

## List Scheduling Algorithm

The most common basic-block scheduling algorithm:

### Algorithm

```python
def list_schedule(instructions, latencies, dependences):
    # Build dependency DAG
    dag = build_dag(instructions, dependences)
    
    # Compute priorities (longest path from node to exit)
    priority = {}
    for node in reverse_topological_order(dag):
        if is_leaf(node):
            priority[node] = latencies[node]
        else:
            priority[node] = latencies[node] + max(
                priority[succ] for succ in successors(node)
            )
    
    # Schedule
    ready = [n for n in dag if in_degree(n) == 0]
    schedule = []
    cycle = 0
    
    while ready or pending:
        # Move newly ready instructions
        update_ready(ready, pending, cycle)
        
        if ready:
            # Pick highest priority instruction
            ready.sort(key=lambda n: -priority[n])
            instr = ready.pop(0)
            schedule.append((cycle, instr))
            
            # Add successors to pending with availability time
            for succ in successors(instr):
                if all_preds_scheduled(succ):
                    pending.append((succ, cycle + latencies[instr]))
        
        cycle += 1
    
    return schedule
```

### Priority Computation

Priority = length of longest path from instruction to the end of the block.

$$
\text{priority}(n) = \text{latency}(n) + \max_{s \in \text{succ}(n)} \text{priority}(s)
$$

Higher priority instructions are scheduled first (they're on the critical path).

---

## Detailed Example

Schedule this basic block for a pipeline where loads take 3 cycles and ALU takes 1:

```c
1: r1 = load(A)      // latency 3
2: r2 = load(B)      // latency 3
3: r3 = r1 + r2      // latency 1, needs r1, r2
4: r4 = load(C)      // latency 3
5: r5 = r4 + 1       // latency 1, needs r4
6: r6 = r3 * r5      // latency 2, needs r3, r5
7: store r6 → D      // latency 1, needs r6
```

**Step 1: Build DAG and compute priorities**

```
Instruction  Successors       Priority
7: store     (none)           1
6: r3*r5     → 7             2 + 1 = 3
3: r1+r2     → 6             1 + 3 = 4
5: r4+1      → 6             1 + 3 = 4
1: load A    → 3             3 + 4 = 7
2: load B    → 3             3 + 4 = 7
4: load C    → 5             3 + 4 = 7
```

**Step 2: Schedule**

```
Cycle 0: Ready={1,2,4} → Schedule 1 (priority 7, pick any tie)
Cycle 1: Ready={2,4}   → Schedule 2 (priority 7)
Cycle 2: Ready={4}     → Schedule 4 (priority 7)
Cycle 3: Ready={3}     → r1,r2 ready! Schedule 3
Cycle 4: Ready={5}     → Schedule 5 (r4 ready)
Cycle 5: Ready={6}     → r3,r5 ready! Schedule 6
Cycle 7: Ready={7}     → Schedule 7 (r6 ready after 2 cycles)
```

**Final schedule: 8 cycles** (vs. 14 without scheduling due to stalls!)

```
Cycle 0: r1 = load(A)
Cycle 1: r2 = load(B)
Cycle 2: r4 = load(C)
Cycle 3: r3 = r1 + r2
Cycle 4: r5 = r4 + 1
Cycle 5: r6 = r3 * r5
Cycle 6: (wait for multiply)
Cycle 7: store r6 → D
```

---

## Scheduling Constraints

### Resource Constraints

Real machines have limited functional units:

```
If machine has:
  - 1 load/store unit
  - 2 ALU units
  - 1 multiply unit

Then at most 1 load, 2 adds, 1 multiply per cycle
```

List scheduling respects these by checking resource availability before scheduling.

### Register Pressure

Aggressive scheduling can **increase** register pressure:

```c
// Original: 2 registers needed
r1 = load(A)
r2 = r1 + 1
store r2
r1 = load(B)   // reuse r1

// Scheduled: 3 registers needed!
r1 = load(A)
r3 = load(B)   // moved up — now r1 AND r3 live
r2 = r1 + 1
store r2
r4 = r3 + 1
```

A good scheduler balances ILP against register pressure.

---

## Software Pipelining

For **loops**, software pipelining overlaps iterations:

```c
// Original loop:
for (i = 0; i < n; i++) {
    load A[i]       // cycle 1-3
    compute A[i]+1  // cycle 4
    store B[i]      // cycle 5
}
```

```c
// Software pipelined:
// Prologue: start first iterations
load A[0]
load A[1]
load A[2]
// Steady state: all stages active
for (i = 0; i < n-2; i++) {
    store B[i]        // iteration i
    compute A[i+1]+1  // iteration i+1
    load A[i+2]       // iteration i+2
}
// Epilogue: finish last iterations
```

Each cycle does useful work from different iterations — maximum throughput!

---

## Phase Ordering: Scheduling vs Register Allocation

A classic compiler dilemma:

- **Schedule first**: better ILP, but may increase register pressure → more spills
- **Allocate first**: fewer spills, but scheduling is constrained by fixed assignments

Modern compilers typically:
1. Schedule before allocation (pre-pass scheduling)
2. Allocate registers
3. Schedule again after allocation (post-pass scheduling) to hide spill latencies

---

## Summary

| Concept | Purpose |
|---------|---------|
| Pipeline hazards | Motivate instruction reordering |
| Data dependences | RAW, WAR, WAW constrain ordering |
| Dependency DAG | Represents all scheduling constraints |
| List scheduling | Priority-based greedy algorithm |
| Software pipelining | Overlap loop iterations |
| ILP | Measure of parallelism available |

$$
\text{Speedup} = \frac{\text{Unscheduled cycles}}{\text{Scheduled cycles}}
$$

---

## Exercises

1. Build the dependency DAG for this basic block:
   ```c
   a = load(X)
   b = load(Y)
   c = a + b
   d = a - 1
   e = c * d
   store e → Z
   ```
   Assume loads take 3 cycles, ALU takes 1, multiply takes 2.

2. Compute priorities for each instruction and produce a list schedule.

3. What is the minimum number of cycles for the above block on a machine with 1 load unit and 1 ALU unit?

4. Identify all RAW, WAR, and WAW dependences:
   ```c
   r1 = r2 + r3
   r4 = r1 * 2
   r1 = r5 - r6
   r7 = r1 + r4
   ```

5. Given a loop body with latency 10 cycles and 3 independent stages, what throughput (iterations/cycle) can software pipelining achieve in the steady state?

6. Explain why scheduling before register allocation might increase spilling. Give a concrete example with 2 registers.
