---
title: Priority & Round Robin Scheduling
---

# Priority & Round Robin Scheduling

In the previous lesson, we studied FCFS and SJF — algorithms that use arrival order or burst length to make scheduling decisions. Now we explore two more widely-used strategies: **Priority Scheduling**, which assigns explicit importance levels to processes, and **Round Robin (RR)**, which gives every process a fair, equal share of the CPU through time slicing.

Together, these algorithms form the toolkit from which modern operating systems build their scheduling policies.

---

## Priority Scheduling

### Concept

> In **Priority Scheduling**, each process is assigned a numerical priority. The CPU is allocated to the process with the **highest priority** (lowest or highest number, depending on convention). If two processes have equal priority, FCFS is used as a tiebreaker.

Think of an emergency room: patients are treated based on the severity (priority) of their condition, not by arrival time. A heart attack patient (priority 1) gets attention before a sprained ankle (priority 5), even if the ankle arrived first.

| Property                | Value                                                   |
| ----------------------- | ------------------------------------------------------- |
| **Type**                | Can be preemptive or non-preemptive                     |
| **Selection Rule**      | Highest priority process in ready queue                 |
| **Priority Convention** | Varies: lower number = higher priority (common in UNIX) |
| **Starvation**          | Yes — low-priority processes may never run              |
| **Overhead**            | Low (priority comparison is O(n) or O(log n) with heap) |

### Internal vs External Priorities

| Priority Type | Source                                            | Examples                                                                |
| ------------- | ------------------------------------------------- | ----------------------------------------------------------------------- |
| **Internal**  | Computed by the OS based on measurable attributes | Time limits, memory requirement, I/O-to-CPU ratio, number of open files |
| **External**  | Set by user or system administrator               | Process importance, department funding, political factors               |

### Worked Example — Non-Preemptive Priority

| Process | Arrival Time | Burst Time | Priority (lower = higher) |
| ------- | ------------ | ---------- | ------------------------- |
| P₁      | 0            | 10         | 3                         |
| P₂      | 0            | 1          | 1                         |
| P₃      | 0            | 2          | 4                         |
| P₄      | 0            | 1          | 5                         |
| P₅      | 0            | 5          | 2                         |

**Order:** P₂ (pri 1) → P₅ (pri 2) → P₁ (pri 3) → P₃ (pri 4) → P₄ (pri 5)

#### Gantt Chart

```text
┌───┬───────┬──────────────┬────┬───┐
│P₂ │  P₅   │      P₁      │ P₃ │P₄ │
└───┴───────┴──────────────┴────┴───┘
0   1       6             16   18  19
```

#### Metric Calculations

| Process | Arrival | Burst | Priority | Completion | Turnaround | Waiting |
| ------- | ------- | ----- | -------- | ---------- | ---------- | ------- |
| P₁      | 0       | 10    | 3        | 16         | 16         | 6       |
| P₂      | 0       | 1     | 1        | 1          | 1          | 0       |
| P₃      | 0       | 2     | 4        | 18         | 18         | 16      |
| P₄      | 0       | 1     | 5        | 19         | 19         | 18      |
| P₅      | 0       | 5     | 2        | 6          | 6          | 1       |

$$\text{Avg Waiting Time} = \frac{6 + 0 + 16 + 18 + 1}{5} = \frac{41}{5} = 8.20 \text{ ms}$$

$$\text{Avg Turnaround Time} = \frac{16 + 1 + 18 + 19 + 6}{5} = \frac{60}{5} = 12.00 \text{ ms}$$

### Preemptive Priority — Worked Example

Now consider processes arriving at different times with preemption:

| Process | Arrival Time | Burst Time | Priority |
| ------- | ------------ | ---------- | -------- |
| P₁      | 0            | 7          | 3        |
| P₂      | 2            | 4          | 1        |
| P₃      | 4            | 1          | 4        |
| P₄      | 5            | 4          | 2        |

**Execution trace:**

- t=0: Only P₁ ready → P₁ runs
- t=2: P₂ arrives (pri 1 < P₁'s pri 3) → **preempt!** P₂ runs
- t=4: P₃ arrives (pri 4 > P₂'s pri 1) → no preempt. P₂ continues
- t=5: P₄ arrives (pri 2 > P₂'s pri 1) → no preempt. P₂ continues
- t=6: P₂ finishes. Ready: P₁(rem 5, pri 3), P₃(1, pri 4), P₄(4, pri 2). Highest: P₄ (pri 2)
- t=10: P₄ finishes. Highest: P₁ (pri 3)
- t=15: P₁ finishes. Only P₃ (pri 4) remains
- t=16: P₃ finishes.

#### Gantt Chart

```text
┌────┬──────────┬──────────┬───────────┬───┐
│ P₁ │    P₂    │    P₄    │    P₁     │P₃ │
└────┴──────────┴──────────┴───────────┴───┘
0    2          6         10          15  16
```

| Process | Arrival | Burst | Completion | Turnaround | Waiting |
| ------- | ------- | ----- | ---------- | ---------- | ------- |
| P₁      | 0       | 7     | 15         | 15         | 8       |
| P₂      | 2       | 4     | 6          | 4          | 0       |
| P₃      | 4       | 1     | 16         | 12         | 11      |
| P₄      | 5       | 4     | 10         | 5          | 1       |

$$\text{Avg Waiting} = \frac{8 + 0 + 11 + 1}{4} = 5.00 \text{ ms}$$

---

## The Starvation Problem and Aging

### Starvation

Low-priority processes can **starve** indefinitely if high-priority processes keep arriving:

```text
Starvation Timeline:

Priority 1 jobs:  ━━━━━━ ━━━━ ━━━━━━━━ ━━━━━ ━━━━━━━ ━━━━━━━━━━
Priority 2 jobs:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Priority 5 job:   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ NEVER RUNS!

━ = running    ░ = ready but not selected    ▒ = starving
```

### Aging: The Solution

> **Aging** gradually increases the priority of a process the longer it waits in the ready queue. This guarantees that even the lowest-priority process will eventually reach the highest priority and get to run.

$$\text{Effective Priority} = \text{Base Priority} + \left\lfloor \frac{\text{Wait Time}}{T_{\text{aging}}} \right\rfloor$$

| Wait Time | Base Priority | Aging Boost | Effective Priority |
| --------- | ------------- | ----------- | ------------------ |
| 0 ms      | 10            | +0          | 10                 |
| 100 ms    | 10            | +1          | 9                  |
| 200 ms    | 10            | +2          | 8                  |
| 500 ms    | 10            | +5          | 5                  |
| 1000 ms   | 10            | +10         | 0 (highest!)       |

> [!NOTE]
> With aging, starvation becomes impossible. Given enough time, any process's effective priority will surpass all others, guaranteeing it CPU time. Most real-world priority schedulers implement some form of aging.

---

## The Priority Inversion Problem

### What Is Priority Inversion?

**Priority inversion** occurs when a high-priority process is indirectly blocked by a low-priority process because of a shared resource (typically a mutex lock).

```text
Priority Inversion:

High priority   P_H ━━━━━░░░░░░░░░░░░░░░░░░░░░░━━━━━━━
                           blocked waiting for lock!

Medium priority P_M ░░░░░░░━━━━━━━━━━━━━━━━━━━━━░░░░░░░
                           runs because P_H is blocked!

Low priority    P_L ━━━━━━━░░░░░░░░░░░░░░░░░░░░░░━━━━━━
                    holds lock │                 releases lock
                               │
            P_H has higher priority than P_M, but P_M runs
            while P_H waits! Priority is INVERTED!
```

### The Mars Pathfinder Incident (1997)

The most famous case of priority inversion occurred on NASA's Mars Pathfinder mission:

| Detail                   | Description                                                                  |
| ------------------------ | ---------------------------------------------------------------------------- |
| **What happened**        | The rover's computer kept resetting unexpectedly                             |
| **Root cause**           | Priority inversion between three tasks sharing a mutex on an information bus |
| **High-priority task**   | Bus management task (deadline-critical)                                      |
| **Low-priority task**    | Meteorological data collection (held the bus mutex)                          |
| **Medium-priority task** | Communication task (preempted the low-priority task)                         |
| **Effect**               | The high-priority task missed its deadline, triggering a watchdog reset      |
| **Fix**                  | Engineers uploaded a patch enabling **priority inheritance** on the mutex    |

> [!IMPORTANT]
> The Pathfinder incident demonstrated that priority inversion can have catastrophic real-world consequences. It led to widespread adoption of **priority inheritance protocols** in real-time operating systems.

### Solutions to Priority Inversion

| Solution                 | Mechanism                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Priority Inheritance** | When P_H blocks on a lock held by P_L, P_L temporarily inherits P_H's priority until it releases the lock                                              |
| **Priority Ceiling**     | Each mutex has a ceiling priority = highest priority of any task that may use it. A task's priority is raised to the ceiling when it acquires the lock |
| **Random boosting**      | Periodically boost the priority of lock holders randomly (used in Windows)                                                                             |

---

## Round Robin (RR) Scheduling

### Concept

> **Round Robin** is a preemptive scheduling algorithm that gives each process a fixed **time quantum** (time slice). Processes are arranged in a circular queue; each process runs for at most one quantum before being moved to the back of the queue.

Round Robin is like a carousel ride — everyone gets an equal turn for the same duration, then moves to the back of the line.

| Property           | Value                                    |
| ------------------ | ---------------------------------------- |
| **Type**           | Preemptive                               |
| **Selection Rule** | FCFS within the time quantum             |
| **Time Quantum**   | Fixed duration (typically 10-100 ms)     |
| **Starvation**     | No (every process gets a turn)           |
| **Overhead**       | Context switch at every quantum boundary |

### Worked Example — Quantum = 4

| Process | Arrival Time | Burst Time |
| ------- | ------------ | ---------- |
| P₁      | 0            | 24         |
| P₂      | 0            | 3          |
| P₃      | 0            | 3          |

**Execution with quantum = 4:**

Ready queue trace (front → back):

| Time | Event                             | Ready Queue  | Running |
| ---- | --------------------------------- | ------------ | ------- |
| 0    | Start                             | [P₁, P₂, P₃] | P₁      |
| 4    | P₁ quantum expired (rem 20)       | [P₂, P₃, P₁] | P₂      |
| 7    | P₂ finishes (burst 3 < quantum 4) | [P₃, P₁]     | P₃      |
| 10   | P₃ finishes                       | [P₁]         | P₁      |
| 14   | P₁ quantum expired (rem 16)       | [P₁]         | P₁      |
| 18   | P₁ quantum expired (rem 12)       | [P₁]         | P₁      |
| 22   | P₁ quantum expired (rem 8)        | [P₁]         | P₁      |
| 26   | P₁ quantum expired (rem 4)        | [P₁]         | P₁      |
| 30   | P₁ finishes                       | []           | —       |

#### Gantt Chart

```text
┌──────┬─────┬─────┬──────┬──────┬──────┬──────┬──────┐
│  P₁  │ P₂  │ P₃  │  P₁  │  P₁  │  P₁  │  P₁  │  P₁  │
└──────┴─────┴─────┴──────┴──────┴──────┴──────┴──────┘
0      4     7    10     14     18     22     26     30
```

#### Metric Calculations

| Process | Arrival | Burst | Completion | Turnaround | Waiting | Response |
| ------- | ------- | ----- | ---------- | ---------- | ------- | -------- |
| P₁      | 0       | 24    | 30         | 30         | 6       | 0        |
| P₂      | 0       | 3     | 7          | 7          | 4       | 4        |
| P₃      | 0       | 3     | 10         | 10         | 7       | 7        |

$$\text{Avg Turnaround} = \frac{30 + 7 + 10}{3} = \frac{47}{3} = 15.67 \text{ ms}$$

$$\text{Avg Waiting} = \frac{6 + 4 + 7}{3} = \frac{17}{3} = 5.67 \text{ ms}$$

$$\text{Avg Response} = \frac{0 + 4 + 7}{3} = \frac{11}{3} = 3.67 \text{ ms}$$

> [!NOTE]
> Compare RR's response time (3.67 ms) with FCFS on the same processes. In FCFS, P₃ would wait 27 ms. RR provides _much_ better response time at the cost of higher turnaround time for P₁.

---

## Effect of Time Quantum Size

The choice of time quantum dramatically affects RR's behavior:

```text
Effect of Quantum Size:

Very small quantum (q → 0):
┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐
│1│2│3│1│2│3│1│2│3│1│2│3│1│2│3│1│2│3│1│ │ │1│1│1│
└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘ └ └┘└┘└┘
  → Feels like simultaneous execution (processor sharing)
  → TOO MANY context switches! CPU wastes time switching.

Very large quantum (q → ∞):
┌──────────────────────────────────────┬─────┬─────┐
│                 P₁                   │ P₂  │ P₃  │
└──────────────────────────────────────┴─────┴─────┘
  → Degenerates into FCFS!
  → No preemption, same convoy effect problems.

Optimal quantum:
┌──────────┬──────────┬──────────┬──────────┬──────┐
│    P₁    │    P₂    │    P₃    │    P₁    │  P₁  │
└──────────┴──────────┴──────────┴──────────┴──────┘
  → Good balance between responsiveness and overhead
```

### Rule of Thumb

> **80% of CPU bursts should be shorter than the time quantum.** This ensures most processes complete within a single quantum, minimizing unnecessary context switches while still providing fair preemption for long-running processes.

### Performance Comparison: Varying Quantum Sizes

Using P₁(24), P₂(3), P₃(3) all arriving at time 0:

| Quantum (q) | # Context Switches | Avg Turnaround | Avg Waiting | Avg Response | Behavior               |
| ----------- | ------------------ | -------------- | ----------- | ------------ | ---------------------- |
| 1           | 29                 | 22.33          | 12.33       | 1.33         | Near processor-sharing |
| 2           | 14                 | 18.33          | 8.33        | 2.00         | Good responsiveness    |
| 4           | 7                  | 15.67          | 5.67        | 3.67         | Balanced               |
| 8           | 5                  | 14.33          | 4.33        | 5.33         | Reasonable             |
| 30          | 2                  | 17.67          | 7.67        | 9.00         | Approaches FCFS        |
| ∞           | 2                  | 17.67          | 7.67        | 9.00         | Identical to FCFS      |

> [!WARNING]
> As the quantum decreases, context switch overhead increases. If the quantum is comparable to or smaller than the context switch time, the system will spend more time switching than computing!
>
> Context switch takes ~5 μs. A 10 μs quantum means **33% overhead**. A 5 ms quantum means only **0.1% overhead**.

---

## Turnaround Time vs Quantum Size

A key insight is that **turnaround time does not necessarily improve with smaller quantum**:

```text
Avg Turnaround Time vs Quantum Size
(for processes with bursts 6, 3, 1, 7)

Avg TT │
  18   │  ●
       │   ╲
  16   │    ╲
       │     ╲
  14   │      ╲──────●
       │              ╲
  12   │               ●
       │
  10   │        ●──────
       │
   8   │
       └──┬──┬──┬──┬──┬──┬──── Quantum
          1  2  4  6  8  ∞

  The relationship is NOT monotonic!
  There is a sweet spot — not too small, not too large.
```

---

## Round Robin: Detailed Trace with Different Quantum

Let's compare quantum = 2 and quantum = 6 for the same process set:

| Process | Arrival | Burst |
| ------- | ------- | ----- |
| P₁      | 0       | 5     |
| P₂      | 1       | 3     |
| P₃      | 2       | 8     |
| P₄      | 3       | 6     |

### Quantum = 2

```text
Ready queue evolution:
t=0:  [P₁]           → P₁ runs (2ms)
t=1:  P₂ arrives
t=2:  [P₂,P₃,P₁]     → P₂ runs (2ms), P₃ arrives at t=2
t=3:  P₄ arrives
t=4:  [P₃,P₁,P₄,P₂]  → P₃ runs (2ms), P₂ has 1ms left
t=6:  [P₁,P₄,P₂,P₃]  → P₁ runs (2ms)
t=8:  [P₄,P₂,P₃,P₁]  → P₄ runs (2ms)
t=10: [P₂,P₃,P₁,P₄]  → P₂ runs (1ms, done!)
t=11: [P₃,P₁,P₄]     → P₃ runs (2ms)
t=13: [P₁,P₄,P₃]     → P₁ runs (1ms, done!)
t=14: [P₄,P₃]         → P₄ runs (2ms)
t=16: [P₃,P₄]         → P₃ runs (2ms)
t=18: [P₄,P₃]         → P₄ runs (2ms, done!)
t=20: [P₃]            → P₃ runs (2ms, done!)
t=22: done
```

```text
┌────┬────┬────┬────┬────┬───┬────┬───┬────┬────┬────┐
│ P₁ │ P₂ │ P₃ │ P₁ │ P₄ │P₂ │ P₃ │P₁ │ P₄ │ P₃ │ P₄ │ P₃│
└────┴────┴────┴────┴────┴───┴────┴───┴────┴────┴────┘
0    2    4    6    8   10  11  13  14  16   18  20  22
```

### Quantum = 6

```text
t=0:  [P₁]               → P₁ runs (5ms, done at t=5!)
t=5:  [P₂,P₃,P₄]         → P₂ runs (3ms, done at t=8!)
t=8:  [P₃,P₄]            → P₃ runs (6ms of 8, rem 2)
t=14: [P₄,P₃]            → P₄ runs (6ms, done!)
t=20: [P₃]               → P₃ runs (2ms, done!)
t=22: done
```

```text
┌───────┬─────┬────────────┬────────────┬────┐
│  P₁   │ P₂  │     P₃     │     P₄     │ P₃ │
└───────┴─────┴────────────┴────────────┴────┘
0       5     8           14           20   22
```

| Metric                 | q = 2 | q = 6 |
| ---------------------- | ----- | ----- |
| **# Context Switches** | 11    | 4     |
| **Avg Turnaround**     | 15.00 | 12.75 |
| **Avg Response**       | 1.25  | 2.50  |
| **P₃ Turnaround**      | 20    | 20    |

With q=2, response is better (1.25 vs 2.50) but turnaround is worse (15.00 vs 12.75) and there are far more context switches.

---

## Priority vs Round Robin: Comparison

| Feature             | Priority Scheduling                | Round Robin                  |
| ------------------- | ---------------------------------- | ---------------------------- |
| **Basis**           | Importance/priority                | Fairness/time sharing        |
| **Preemption**      | Optional                           | Always (at quantum)          |
| **Starvation**      | Yes (without aging)                | No                           |
| **Response time**   | Good for high-priority             | Good for all (equal turns)   |
| **CPU utilization** | High                               | High                         |
| **Fairness**        | Unfair (favors high priority)      | Fair (equal time slices)     |
| **Overhead**        | Low                                | Moderate (frequent switches) |
| **Best for**        | Systems with clear priority levels | Interactive time-sharing     |
| **Example systems** | Real-time OS, VIP services         | UNIX time-sharing            |

---

## Try It Yourself

**Exercise 1:** Apply non-preemptive priority scheduling (lower number = higher priority) to these processes. Calculate average waiting time.

| Process | Arrival | Burst | Priority |
| ------- | ------- | ----- | -------- |
| P₁      | 0       | 8     | 3        |
| P₂      | 1       | 2     | 1        |
| P₃      | 2       | 4     | 2        |
| P₄      | 3       | 1     | 4        |

:::details Solution

- t=0: Only P₁ → P₁ runs to completion (non-preemptive)
- t=8: Ready: P₂(pri 1), P₃(pri 2), P₄(pri 4). Highest: P₂ → runs
- t=10: Ready: P₃(pri 2), P₄(pri 4). Highest: P₃ → runs
- t=14: Only P₄ → runs
- t=15: Done.

```text
┌──────────────┬────┬──────┬───┐
│      P₁      │ P₂ │  P₃  │P₄ │
└──────────────┴────┴──────┴───┘
0              8   10     14  15
```

| Process | Arrival | Burst | Completion | Waiting |
| ------- | ------- | ----- | ---------- | ------- |
| P₁      | 0       | 8     | 8          | 0       |
| P₂      | 1       | 2     | 10         | 7       |
| P₃      | 2       | 4     | 14         | 8       |
| P₄      | 3       | 1     | 15         | 11      |

$$\text{Avg Waiting} = \frac{0 + 7 + 8 + 11}{4} = 6.50 \text{ ms}$$
:::

**Exercise 2:** Apply Round Robin with quantum = 3 to these processes (all arrive at time 0). Draw the Gantt chart and compute average turnaround time.

| Process | Burst |
| ------- | ----- |
| P₁      | 4     |
| P₂      | 6     |
| P₃      | 2     |

:::details Solution

- t=0: [P₁, P₂, P₃] → P₁ runs 3ms (rem 1)
- t=3: [P₂, P₃, P₁] → P₂ runs 3ms (rem 3)
- t=6: [P₃, P₁, P₂] → P₃ runs 2ms (done!)
- t=8: [P₁, P₂] → P₁ runs 1ms (done!)
- t=9: [P₂] → P₂ runs 3ms (done!)
- t=12: Done.

```text
┌─────┬─────┬────┬───┬─────┐
│ P₁  │ P₂  │ P₃ │P₁ │ P₂  │
└─────┴─────┴────┴───┴─────┘
0     3     6    8   9    12
```

| Process | Burst | Completion | Turnaround |
| ------- | ----- | ---------- | ---------- |
| P₁      | 4     | 9          | 9          |
| P₂      | 6     | 12         | 12         |
| P₃      | 2     | 8          | 8          |

$$\text{Avg Turnaround} = \frac{9 + 12 + 8}{3} = 9.67 \text{ ms}$$
:::

**Exercise 3:** Explain the Mars Pathfinder priority inversion bug and how priority inheritance would have prevented it. Use the three-process model (P_H, P_M, P_L).

:::details Solution
**The scenario:**

1. **P_L** (low priority) acquires a mutex lock on the shared information bus
2. **P_H** (high priority, bus management) tries to acquire the same mutex → **blocks** waiting for P_L to release
3. **P_M** (medium priority, communication) becomes ready and **preempts P_L** since it has higher priority
4. P_M runs for a long time, keeping P_L from running and releasing the mutex
5. P_H remains blocked the entire time — **despite being the highest-priority task**
6. P_H misses its deadline → watchdog timer triggers a system reset

**Priority inversion:** P_H is effectively running at a lower priority than P_M because it depends on P_L.

**How priority inheritance fixes it:**

1. When P_H blocks on the mutex held by P_L, the OS temporarily **raises P_L's priority to P_H's level**
2. Now P_L has the highest priority in the system → P_M **cannot preempt** P_L
3. P_L quickly finishes its critical section and releases the mutex
4. P_L's priority reverts to its original level
5. P_H immediately acquires the mutex and runs — meeting its deadline

The key insight: the lock holder inherits the priority of the highest-priority waiter, ensuring that the critical section completes as fast as possible.
:::

---

## Key Takeaways

- **Priority Scheduling** assigns importance levels to processes — the highest-priority ready process always runs first. It can be preemptive or non-preemptive.
- Priorities can be **internal** (computed by the OS from measurable attributes) or **external** (set by users/administrators).
- Priority scheduling suffers from **starvation** (low-priority processes may never run). **Aging** — gradually increasing a waiting process's priority — solves this.
- **Priority inversion** occurs when a high-priority process is blocked by a low-priority process holding a shared resource, while medium-priority processes run freely. **Priority inheritance** is the standard solution.
- **Round Robin** gives each process a fixed **time quantum** and rotates through a circular queue. It guarantees fairness and eliminates starvation.
- **Quantum size** is critical: too large → degenerates to FCFS; too small → excessive context switch overhead. Rule of thumb: **80% of CPU bursts should be shorter than the quantum**.
- Round Robin provides excellent **response time** (every process gets CPU quickly) but may have higher **turnaround time** than SJF.
- Neither algorithm alone is perfect — this motivates **multilevel queue** and **multilevel feedback queue** scheduling, which combine priority and time-sharing.
