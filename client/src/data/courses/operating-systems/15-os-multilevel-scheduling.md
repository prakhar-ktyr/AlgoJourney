---
title: Multilevel Queue & Feedback Scheduling
section: "Processes & Scheduling"
---

# Multilevel Queue & Feedback Scheduling

The scheduling algorithms we've studied so far — FCFS, SJF, Priority, and Round Robin — each have strengths and weaknesses. In practice, no single algorithm works well for _all_ types of processes. **Multilevel Queue Scheduling** solves this by dividing processes into categories, giving each category its own queue and scheduling algorithm. **Multilevel Feedback Queue (MLFQ)** takes this further by allowing processes to move between queues based on their behavior.

MLFQ is arguably the most important scheduling algorithm in operating systems — it is the foundation for schedulers in Linux, Windows, macOS, and most modern operating systems.

---

## Multilevel Queue Scheduling

### Concept

> In **Multilevel Queue Scheduling**, the ready queue is split into multiple separate queues, each with its own scheduling algorithm. Processes are permanently assigned to one queue based on their type or priority.

Think of airline boarding: First Class, Business, Economy, and Basic Economy each have their own line (queue). First Class always boards before Business, Business before Economy, etc. Each class may have its own internal ordering (assigned seats vs free-for-all).

### Process Classification

| Queue Level | Process Type                                    | Scheduling Algorithm | Priority |
| ----------- | ----------------------------------------------- | -------------------- | -------- |
| Queue 1     | **System processes** (kernel, daemon)           | Priority scheduling  | Highest  |
| Queue 2     | **Interactive processes** (editors, shells)     | Round Robin (q=8ms)  | High     |
| Queue 3     | **Interactive editing** (foreground apps)       | Round Robin (q=16ms) | Medium   |
| Queue 4     | **Batch processes** (compilations, simulations) | FCFS                 | Low      |
| Queue 5     | **Student/background processes**                | FCFS                 | Lowest   |

### Architecture Diagram

```text
                    Multilevel Queue Scheduling
                    ═══════════════════════════

  Highest   ┌──────────────────────────────────────────┐
  Priority  │  Queue 1: System Processes               │
            │  Algorithm: Priority                     │
            │  [systemd] → [kthread] → [ksoftirqd]     │
            └──────────────────────┬───────────────────┘
                                   │ if empty, try next
            ┌──────────────────────▼───────────────────┐
            │  Queue 2: Interactive Processes           │
            │  Algorithm: Round Robin (q=8ms)           │
            │  [bash] → [vim] → [firefox]               │
            └──────────────────────┬───────────────────┘
                                   │ if empty, try next
            ┌──────────────────────▼───────────────────┐
            │  Queue 3: Foreground Batch               │
            │  Algorithm: Round Robin (q=16ms)          │
            │  [make] → [python script]                 │
            └──────────────────────┬───────────────────┘
                                   │ if empty, try next
            ┌──────────────────────▼───────────────────┐
  Lowest    │  Queue 4: Background Batch               │
  Priority  │  Algorithm: FCFS                         │
            │  [nightly_backup] → [data_analysis]       │
            └──────────────────────────────────────────┘

                         ↓ Selected process goes to CPU ↓

                        ┌──────────────────┐
                        │       CPU        │
                        └──────────────────┘
```

### Scheduling Between Queues

There are two main approaches to scheduling _between_ queues:

| Approach           | Description                                                                                       | Problem                                |
| ------------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **Fixed priority** | Always serve highest-priority queue first; lower queues only run when all higher queues are empty | Lower queues may starve                |
| **Time slice**     | Each queue gets a percentage of CPU time                                                          | Wastes CPU if a queue has no processes |

**Time Slice Example:**

| Queue       | CPU Share | Scheduling  |
| ----------- | --------- | ----------- |
| System      | 40%       | Priority    |
| Interactive | 30%       | Round Robin |
| Batch       | 20%       | SJF         |
| Student     | 10%       | FCFS        |

> [!WARNING]
> The fundamental limitation of Multilevel Queue Scheduling is that processes are **permanently assigned** to queues. A process that starts as batch but becomes interactive (or vice versa) cannot be moved. This inflexibility is what MLFQ solves.

---

## Multilevel Feedback Queue (MLFQ)

### Concept

> In **Multilevel Feedback Queue (MLFQ)** scheduling, processes can **move between queues** based on their observed behavior. CPU-bound processes gradually sink to lower-priority queues, while I/O-bound processes rise to higher-priority queues.

MLFQ learns from a process's past behavior to predict its future needs — without requiring any advance knowledge of burst times (unlike SJF).

### MLFQ Rules (Arpaci-Dusseau Formulation)

| Rule        | Statement                                                                                               | Purpose                                              |
| ----------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Rule 1**  | If Priority(A) > Priority(B), A runs (B doesn't)                                                        | Higher-priority processes run first                  |
| **Rule 2**  | If Priority(A) = Priority(B), A and B run in Round Robin                                                | Same-level fairness                                  |
| **Rule 3**  | When a process enters the system, it is placed at the **highest priority** (topmost queue)              | Assume all processes are short/interactive initially |
| **Rule 4a** | If a process uses up its entire time quantum, its priority is **reduced** (moved to a lower queue)      | Penalize CPU-bound behavior                          |
| **Rule 4b** | If a process gives up the CPU before the quantum expires (I/O), it **stays at the same priority level** | Reward I/O-bound behavior                            |
| **Rule 5**  | After time period $S$, **boost** all processes to the topmost queue                                     | Prevent starvation; re-evaluate behavior             |

### MLFQ Architecture

```text
                    Multilevel Feedback Queue
                    ═════════════════════════

  Highest   ┌──────────────────────────────────────────┐
  Priority  │  Queue 0 (RR, q=8ms)                     │
            │  New processes start here                 │
            │  [P_new] → [P_interactive]                │
            └───────┬──────────────────────┬───────────┘
                    │                      │
          uses full quantum          yields before quantum
          (CPU-bound behavior)       (I/O-bound behavior)
                    │                      │
                    ▼                      │ stays here
            ┌──────────────────────┐       │
            │  Queue 1 (RR, q=16ms)│◄──────┘
            │  [P_mixed]            │
            └───────┬──────────────┘
                    │
          uses full quantum
                    │
                    ▼
            ┌──────────────────────┐
            │  Queue 2 (RR, q=32ms)│
            │  [P_cpu_heavy]       │
            └───────┬──────────────┘
                    │
          uses full quantum
                    │
                    ▼
  Lowest    ┌──────────────────────┐
  Priority  │  Queue 3 (FCFS)      │
            │  [P_batch] [P_long]  │
            └──────────────────────┘

  ┌──────────────────────────────────────────────┐
  │  Priority Boost (Rule 5):                     │
  │  Every S seconds, ALL processes move back to  │
  │  Queue 0 to prevent starvation and allow      │
  │  processes to be re-evaluated.                │
  └──────────────────────────────────────────────┘
```

### Worked Example: MLFQ in Action

Consider three processes entering the system:

| Process | Type                    | Burst Time                    |
| ------- | ----------------------- | ----------------------------- |
| P₁      | Interactive (I/O-bound) | Short bursts of 2ms, then I/O |
| P₂      | CPU-bound               | 40ms total                    |
| P₃      | Mixed                   | 15ms burst                    |

**Phase 1: All start in Queue 0 (q=8ms)**

```text
Time 0-2:    P₁ runs 2ms in Q0, yields for I/O → stays in Q0
Time 2-10:   P₂ runs 8ms in Q0, uses full quantum → demoted to Q1
Time 10-18:  P₃ runs 8ms in Q0, uses full quantum → demoted to Q1
```

**Phase 2: P₁ still in Q0, P₂ and P₃ in Q1 (q=16ms)**

```text
Time 18-20:  P₁ returns from I/O, runs 2ms in Q0, yields → stays in Q0
Time 20-36:  P₂ runs 16ms in Q1, uses full quantum → demoted to Q2
Time 36-43:  P₃ runs 7ms in Q1 (finishes!) → done
```

**Phase 3: P₁ still in Q0, P₂ now in Q2**

```text
Time 43-45:  P₁ runs 2ms, yields → stays in Q0
Time 45-61:  P₂ runs 16ms in Q2 (finishes!) → done
```

```text
Timeline:
         Q0(8ms)      Q0     Q1(16ms)    Q1       Q0   Q2(16ms)
P₁: ━━│░░░░░░░░░░░░░░░│━━│░░░░░░░░░░░░░░░░░░░░░░│━━│░░░░░░░░░░░...
P₂: ░░│━━━━━━━━│░░░░░░░░░░│━━━━━━━━━━━━━━━━│░░░░░░░░│━━━━━━━━━━━━...
P₃: ░░░░░░░░░░│━━━━━━━━│░░░░░░░░░░░░░░░░░░│━━━━━━━│done

━ = running   ░ = waiting/blocked
```

> [!TIP]
> Notice how MLFQ automatically differentiates between process types:
>
> - **P₁** (interactive) stays in the highest queue because it yields the CPU quickly
> - **P₂** (CPU-bound) sinks to the lowest queue because it uses full quanta
> - **P₃** (mixed) lands in the middle
>
> This happens **without any advance knowledge** of process behavior!

---

## Anti-Gaming Rules

Without protection, a clever process could **game** the MLFQ by deliberately yielding the CPU just before the quantum expires, staying in a high-priority queue while getting most of the CPU time.

```text
Gaming Attack:
  Malicious process does:
    1. Run for 7.9ms (quantum = 8ms)
    2. Issue a trivial I/O (write 1 byte to /dev/null)
    3. Return to I/O → gets placed back in high-priority queue!
    4. Repeat → gets 99% of CPU at highest priority!
```

### Solutions

| Solution                                       | Mechanism                                                                                 |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Accounting-based demotion** (Rule 4 revised) | Track total CPU time at each level, not per-quantum. Demote when total exceeds threshold. |
| **Priority boost** (Rule 5)                    | Periodically move all processes to highest queue. Resets gaming advantages.               |
| **Lottery/proportional share**                 | Randomize allocation to prevent exploitation                                              |

**Revised Rule 4:** Once a process has used up its total time allotment at a given level (regardless of how many times it gives up the CPU), its priority is reduced.

> [!IMPORTANT]
> The priority boost (Rule 5) serves a dual purpose: it **prevents starvation** of CPU-bound processes stuck in low queues, and it **re-evaluates** process behavior — a process that was CPU-bound but has become interactive gets a fresh chance in the high-priority queue.

### Choosing the Boost Period $S$

| $S$ value | Effect                                                  |
| --------- | ------------------------------------------------------- |
| Too small | High-priority queue always full; MLFQ degenerates to RR |
| Too large | Starvation still possible; slow adaptation              |
| Typical   | 100ms - 1000ms (system-dependent)                       |

---

## Comparison of ALL Scheduling Algorithms

| Algorithm       | Type           | Criterion          | Starvation           | Convoy Effect | Overhead    | Best For          |
| --------------- | -------------- | ------------------ | -------------------- | ------------- | ----------- | ----------------- |
| **FCFS**        | Non-preemptive | Arrival order      | No                   | Yes           | Minimal     | Simple batch      |
| **SJF**         | Non-preemptive | Shortest burst     | Yes                  | No            | Low         | Known burst times |
| **SRTF**        | Preemptive     | Shortest remaining | Yes                  | No            | Medium      | Optimal avg wait  |
| **Priority**    | Both           | Priority value     | Yes (without aging)  | No            | Low         | Importance-based  |
| **Round Robin** | Preemptive     | Time quantum       | No                   | No            | Medium-High | Interactive/fair  |
| **MLQ**         | Both           | Queue assignment   | Yes (fixed priority) | Possible      | Low         | Mixed workloads   |
| **MLFQ**        | Preemptive     | Adaptive           | No (with boost)      | No            | Medium      | General purpose   |

### Detailed Metrics Comparison

| Algorithm       | Avg Waiting Time | Response Time    | Throughput | Fairness           |
| --------------- | ---------------- | ---------------- | ---------- | ------------------ |
| **FCFS**        | High             | High             | Low-Medium | Fair (arrival)     |
| **SJF**         | Optimal (NP)     | Medium           | High       | Unfair to long     |
| **SRTF**        | Optimal (all)    | Low (short jobs) | Highest    | Unfair to long     |
| **Priority**    | Depends          | Low (high pri)   | Medium     | Unfair (by design) |
| **Round Robin** | Medium           | Low (all)        | Medium     | Very fair          |
| **MLQ**         | Varies           | Low (top queue)  | High       | Fair within queue  |
| **MLFQ**        | Near optimal     | Low              | High       | Adaptive fair      |

---

## Real OS Scheduling Examples

### Linux: Completely Fair Scheduler (CFS)

Linux uses the **Completely Fair Scheduler (CFS)** as its default scheduler since kernel 2.6.23 (2007).

| Feature              | Description                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Core idea**        | Fair allocation based on virtual runtime (vruntime)                                                                  |
| **Data structure**   | Red-black tree (ordered by vruntime)                                                                                 |
| **Selection**        | Always pick process with lowest vruntime                                                                             |
| **Time accounting**  | Each process's vruntime increases proportional to actual CPU time, inversely proportional to its weight (nice value) |
| **Nice values**      | -20 (highest priority) to +19 (lowest priority)                                                                      |
| **No fixed quantum** | Target latency divided among runnable processes                                                                      |

```text
CFS Red-Black Tree:

                    ┌──────────┐
                    │ P3       │
                    │ vrt=150  │
                    └───┬──┬───┘
                       ╱    ╲
              ┌────────┐    ┌────────┐
              │ P1     │    │ P5     │
              │ vrt=100│    │ vrt=200│
              └─┬────┬─┘    └─┬────┬─┘
               ╱      ╲      ╱      ╲
          ┌────┐   ┌────┐ ┌────┐  ┌────┐
          │ P2 │   │ P4 │ │ P6 │  │ P7 │
          │vr=50│  │vr=120│vr=180│ │vr=250│
          └────┘   └────┘ └────┘  └────┘

  Leftmost node (P2, vruntime=50) runs next!
  → O(1) to find via cached leftmost pointer
  → O(log n) to insert/remove from tree
```

**CFS Virtual Runtime Formula:**

$$\text{vruntime} += \text{actual\_runtime} \times \frac{\text{NICE\_0\_WEIGHT}}{\text{process\_weight}}$$

Where `NICE_0_WEIGHT = 1024` (nice value 0).

| Nice Value | Weight | Relative Share  |
| ---------- | ------ | --------------- |
| -20        | 88761  | 86.68x more CPU |
| -10        | 9548   | 9.33x more CPU  |
| 0          | 1024   | 1.0x (baseline) |
| 10         | 110    | 0.107x less CPU |
| 19         | 15     | 0.015x less CPU |

### Windows Scheduling

| Feature                   | Description                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------ |
| **Algorithm**             | Priority-based preemptive with 32 priority levels                                    |
| **Priority ranges**       | 0 (lowest) to 31 (highest)                                                           |
| **Real-time class**       | Priorities 16-31 (fixed, no adjustment)                                              |
| **Variable class**        | Priorities 0-15 (dynamically adjusted)                                               |
| **Boost mechanism**       | Foreground window gets priority boost; threads awakened from I/O get temporary boost |
| **Quantum**               | Varies by Windows edition (longer for servers)                                       |
| **Starvation prevention** | Balance Set Manager boosts starved threads to priority 15                            |

```text
Windows Priority Levels:

  31 ──┐
  ...  │  Real-time priorities (fixed)
  16 ──┘  Used by: drivers, multimedia, critical services

  15 ──┐
  ...  │  Variable priorities (dynamic, boosted)
   1 ──┘  Used by: normal applications, services

   0 ──── Zero Page Thread only (memory zeroing)
```

### Comparison: Linux CFS vs Windows Scheduler

| Feature                   | Linux CFS                                    | Windows                       |
| ------------------------- | -------------------------------------------- | ----------------------------- |
| **Approach**              | Fair share (proportional)                    | Priority-based                |
| **Data structure**        | Red-black tree                               | Multi-level priority array    |
| **Priority levels**       | Nice: -20 to +19 (40 levels)                 | 0-31 (32 levels)              |
| **Preemptive**            | Yes                                          | Yes                           |
| **Real-time support**     | Separate RT scheduler (SCHED_FIFO, SCHED_RR) | Integrated (priorities 16-31) |
| **Starvation prevention** | Fair share inherently prevents it            | Periodic priority boosting    |
| **Quantum**               | Dynamic (target latency)                     | Fixed (class-dependent)       |

---

## Python Simulation: MLFQ Scheduler

```python
from collections import deque

class Process:
    def __init__(self, name, burst):
        self.name = name
        self.burst_remaining = burst
        self.total_burst = burst
        self.current_queue = 0
        self.time_in_queue = 0

    def __repr__(self):
        return f"{self.name}(rem={self.burst_remaining}, q={self.current_queue})"

def mlfq_simulate(processes, quanta, boost_period=None):
    """Simulate MLFQ with given queue quanta."""
    num_queues = len(quanta)
    queues = [deque() for _ in range(num_queues)]
    time = 0
    gantt = []

    # All processes start in highest queue (Rule 3)
    for p in processes:
        queues[0].append(p)

    while any(queues):
        # Priority boost (Rule 5)
        if boost_period and time > 0 and time % boost_period == 0:
            for i in range(1, num_queues):
                while queues[i]:
                    p = queues[i].popleft()
                    p.current_queue = 0
                    p.time_in_queue = 0
                    queues[0].append(p)
            print(f"  [t={time}] Priority boost! All processes → Queue 0")

        # Find highest non-empty queue (Rule 1)
        selected_queue = -1
        for i in range(num_queues):
            if queues[i]:
                selected_queue = i
                break

        if selected_queue == -1:
            break

        process = queues[selected_queue].popleft()
        quantum = quanta[selected_queue]
        run_time = min(quantum, process.burst_remaining)

        gantt.append((process.name, time, time + run_time, selected_queue))
        print(f"  [t={time}-{time+run_time}] {process.name} runs in Queue {selected_queue} "
              f"(quantum={quantum}, burst_rem={process.burst_remaining})")

        process.burst_remaining -= run_time
        time += run_time

        if process.burst_remaining > 0:
            if run_time == quantum:
                # Used full quantum → demote (Rule 4a)
                new_queue = min(selected_queue + 1, num_queues - 1)
                process.current_queue = new_queue
                queues[new_queue].append(process)
                if new_queue != selected_queue:
                    print(f"         → {process.name} demoted to Queue {new_queue}")
            else:
                # Yielded early → stay (Rule 4b)
                queues[selected_queue].append(process)
        else:
            print(f"         → {process.name} finished!")

    # Print Gantt chart
    print("\nGantt Chart:")
    chart = "  "
    labels = "  "
    for name, start, end, q in gantt:
        width = (end - start) * 3
        chart += "─" * width
        label = f" {name} "
        labels += label.center(width)
    print(chart)
    print(labels)

# Run simulation
print("=== MLFQ Simulation ===")
print("Queue 0: RR(q=4), Queue 1: RR(q=8), Queue 2: FCFS\n")
processes = [
    Process("P1", 20),  # CPU-bound
    Process("P2", 3),   # Short interactive
    Process("P3", 10),  # Mixed
]
mlfq_simulate(processes, quanta=[4, 8, 9999], boost_period=30)
```

---

## Try It Yourself

**Exercise 1:** Design an MLFQ with 3 queues (q=4, q=8, FCFS) for these processes. Show which queue each process ends up in:

| Process | Burst | Behavior                  |
| ------- | ----- | ------------------------- |
| P₁      | 3     | Short burst, yields early |
| P₂      | 30    | Long CPU-bound            |
| P₃      | 6     | Medium, uses full quanta  |

:::details Solution
**P₁ (burst = 3):**

- Starts in Queue 0 (q=4). Runs 3ms, yields before quantum → **stays in Queue 0**.
- Finishes! Final queue: **Queue 0**.

**P₂ (burst = 30):**

- Queue 0: Runs 4ms, full quantum → demoted to Queue 1. Remaining: 26ms.
- Queue 1: Runs 8ms, full quantum → demoted to Queue 2. Remaining: 18ms.
- Queue 2: Runs 18ms (FCFS), finishes. Final queue: **Queue 2**.

**P₃ (burst = 6):**

- Queue 0: Runs 4ms, full quantum → demoted to Queue 1. Remaining: 2ms.
- Queue 1: Runs 2ms, yields before quantum (8ms) → **stays in Queue 1**.
- Finishes! Final queue: **Queue 1**.

Summary: Interactive processes (P₁) stay high, CPU-bound (P₂) sink low, mixed (P₃) land in the middle. MLFQ correctly categorized all three without any prior knowledge!
:::

**Exercise 2:** Without priority boosting, describe a scenario where a CPU-bound process in the lowest MLFQ queue starves. Then explain how periodic boosting with period $S = 50\text{ms}$ fixes it.

:::details Solution
**Starvation scenario:**

- P_heavy (burst = 200ms) arrives, sinks to Queue 2 (lowest) after using up quanta in Queue 0 and 1.
- At time 20ms, P_io1 arrives and stays in Queue 0 (short bursts, yields for I/O).
- At time 25ms, P_io2 arrives and stays in Queue 0.
- At time 30ms, P_io3 arrives and stays in Queue 0.
- Queue 0 always has processes → P_heavy in Queue 2 **never gets the CPU**.
- P_heavy starves indefinitely.

**With priority boost (S = 50ms):**

- At t=50ms, ALL processes (including P_heavy) are moved back to Queue 0.
- P_heavy gets to run for at least one quantum (4ms) before being demoted again.
- At t=100ms, another boost → P_heavy gets another 4ms.
- Over time, P_heavy gets $\frac{4}{50} = 8\%$ of CPU time minimum — not starving!
- The I/O-bound processes still get most of the CPU (they stay in Queue 0 between boosts), but P_heavy makes steady progress.
  :::

**Exercise 3:** Calculate the weight and CPU share for a Linux CFS process with nice value +5, given that nice 0 has weight 1024.

:::details Solution
Each nice increment multiplies the weight by approximately $\frac{1}{1.25}$. The formula is:

$$\text{weight} = 1024 \times 1.25^{-\text{nice}}$$

For nice = +5:
$$\text{weight} = 1024 \times 1.25^{-5} = 1024 \times \frac{1}{3.0518} \approx 335$$

(The actual Linux kernel uses a lookup table; the value for nice +5 is 335.)

If there are two processes: nice 0 (weight 1024) and nice +5 (weight 335), CPU share:

$$\text{Share}_{+5} = \frac{335}{1024 + 335} = \frac{335}{1359} \approx 24.6\%$$

$$\text{Share}_{0} = \frac{1024}{1359} \approx 75.4\%$$

The nice 0 process gets roughly 3× the CPU time of the nice +5 process.
:::

---

## Key Takeaways

- **Multilevel Queue Scheduling** divides processes into permanent queues by type (system, interactive, batch). Each queue has its own algorithm. The main limitation is that processes **cannot move between queues**.
- **Multilevel Feedback Queue (MLFQ)** allows processes to **migrate between queues** based on behavior: CPU-bound processes sink to lower queues, I/O-bound processes stay in higher queues.
- MLFQ's five rules: start high (Rule 3), demote on full quantum (Rule 4a), keep on yield (Rule 4b), serve highest queue first (Rule 1), Round Robin among equals (Rule 2), and periodically boost all (Rule 5).
- **Priority boosting** (Rule 5) prevents starvation and re-evaluates process behavior periodically.
- **Anti-gaming** measures (total time accounting rather than per-quantum) prevent malicious processes from exploiting the system.
- **Linux CFS** uses a red-black tree ordered by virtual runtime to achieve proportional fair sharing. Processes with lower nice values get more CPU time.
- **Windows** uses a 32-level priority scheduler with dynamic boosting for interactive responsiveness and periodic starvation prevention.
- MLFQ is used in most modern operating systems because it **automatically adapts** to process behavior without requiring advance knowledge of burst times — combining the best aspects of SJF (favors short jobs) and RR (fair time-sharing).
