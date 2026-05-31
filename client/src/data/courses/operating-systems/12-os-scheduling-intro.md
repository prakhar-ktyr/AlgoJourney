---
title: Introduction to CPU Scheduling
---

# Introduction to CPU Scheduling

CPU scheduling is the art and science of deciding **which process gets the CPU next** — and for how long. It is one of the most fundamental functions of an operating system. Without scheduling, only one program could run at a time, and your computer would feel like a 1970s mainframe.

Good scheduling makes the system feel responsive, keeps the CPU busy, and ensures fairness among processes. In this lesson, we lay the groundwork for understanding scheduling: the CPU-I/O burst cycle, scheduling criteria, preemptive vs non-preemptive approaches, and the role of the dispatcher.

---

## The CPU-I/O Burst Cycle

Every process alternates between two phases of activity: **CPU bursts** (computation) and **I/O bursts** (waiting for input/output).

> A **CPU burst** is a period of time during which a process is actively using the CPU for computation. An **I/O burst** is a period during which the process waits for an I/O operation to complete.

```text
Process Execution Pattern:

     ┌──────────┐  ┌────┐  ┌──────────┐  ┌──────┐  ┌────┐  ┌─────┐
     │ CPU Burst│  │I/O │  │ CPU Burst│  │ I/O  │  │CPU │  │Exit │
     │  12 ms   │  │Wait│  │   3 ms   │  │ Wait │  │Burst│ │     │
     │          │  │8 ms│  │          │  │15 ms │  │1 ms│  │     │
     └──────────┘  └────┘  └──────────┘  └──────┘  └────┘  └─────┘
     ◄─────────── CPU ──── I/O ────── CPU ──── I/O ── CPU ── End──►

     Time →
```

### CPU Burst Duration Histogram

Research shows that CPU burst durations follow an **exponential** (or hyper-exponential) distribution — most bursts are very short, with a long tail of longer bursts.

```text
Frequency
    │
 40 │ ██
    │ ██
 35 │ ██
    │ ██
 30 │ ██ ██
    │ ██ ██
 25 │ ██ ██
    │ ██ ██
 20 │ ██ ██ ██
    │ ██ ██ ██
 15 │ ██ ██ ██ ██
    │ ██ ██ ██ ██
 10 │ ██ ██ ██ ██ ██
    │ ██ ██ ██ ██ ██ ██
  5 │ ██ ██ ██ ██ ██ ██ ██ ██
    │ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██
  0 └──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──── CPU Burst Duration (ms)
       2  4  6  8  10 12 14 16 18 20 22 24

  Most bursts are SHORT (< 8 ms)
  Few bursts are LONG (> 16 ms)
```

> [!NOTE]
> This distribution is important because it tells us that optimizing for short bursts (as SJF does) can significantly reduce average waiting time — most processes will benefit.

---

## CPU-Bound vs I/O-Bound Processes

Processes can be broadly classified based on where they spend most of their time:

| Characteristic           | CPU-Bound Process                                                      | I/O-Bound Process                                   |
| ------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------- |
| **Spends most time**     | Computing on CPU                                                       | Waiting for I/O                                     |
| **CPU burst length**     | Long (tens to hundreds of ms)                                          | Short (a few ms)                                    |
| **I/O burst length**     | Short or infrequent                                                    | Long and frequent                                   |
| **Examples**             | Matrix multiplication, video encoding, compiler, scientific simulation | Text editor, web browser, database query, file copy |
| **Scheduling need**      | Needs long time quanta                                                 | Needs fast response                                 |
| **CPU utilization**      | High                                                                   | Low                                                 |
| **I/O utilization**      | Low                                                                    | High                                                |
| **Impact of preemption** | Necessary to ensure fairness                                           | Less needed (gives up CPU voluntarily)              |

```text
CPU-Bound Process:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ░░ ━━━━━━━━━━━━━━━━━━━━━━━━━━ ░░ ━━━━━
       Long CPU burst                I/O     Long CPU burst            I/O  CPU

I/O-Bound Process:
━━━ ░░░░░░░░░░░ ━━ ░░░░░░░░ ━━━ ░░░░░░░░░░░░░ ━━ ░░░░░░░░░ ━━ ░░░░░░░
CPU   Long I/O   CPU  I/O    CPU    Long I/O     CPU   I/O     CPU  I/O

━━━ = CPU burst    ░░░ = I/O burst (waiting)
```

> [!TIP]
> A well-balanced system needs a mix of CPU-bound and I/O-bound processes. If all processes are CPU-bound, I/O devices sit idle. If all are I/O-bound, the CPU sits idle. The long-term scheduler (if present) should maintain this balance.

---

## When Do Scheduling Decisions Happen?

CPU scheduling decisions can occur under **four circumstances**:

| #   | Circumstance                                 | State Transition     | Preemptive?                     |
| --- | -------------------------------------------- | -------------------- | ------------------------------- |
| 1   | Process switches from Running to **Waiting** | Running → Waiting    | No (voluntary)                  |
| 2   | Process switches from Running to **Ready**   | Running → Ready      | Yes (preemption)                |
| 3   | Process switches from Waiting to **Ready**   | Waiting → Ready      | Yes (if it has higher priority) |
| 4   | Process **terminates**                       | Running → Terminated | No (process is done)            |

```text
Scheduling Decision Points:

                         ┌──────────┐
                    ②───│  Ready   │◄──③
                    │    └────┬─────┘   │
                    │         │         │
                    │    ┌────▼─────┐   │
                    └────│ Running  │───┘
                         └──┬───┬──┘
                            │   │
                         ①──┘   └──④
                            │      │
                     ┌──────▼──┐   │
                     │ Waiting │   │
                     └─────────┘   │
                              ┌────▼──────┐
                              │Terminated │
                              └───────────┘

  ① and ④: Non-preemptive (only option is to schedule)
  ② and ③: Preemptive (scheduler has a choice)
```

> [!IMPORTANT]
> If scheduling only happens under circumstances **1** and **4**, the system is **non-preemptive** (cooperative). If it also happens under **2** and **3**, the system is **preemptive**. All modern general-purpose operating systems use preemptive scheduling.

---

## Preemptive vs Non-Preemptive Scheduling

| Feature                  | Non-Preemptive (Cooperative)          | Preemptive                               |
| ------------------------ | ------------------------------------- | ---------------------------------------- |
| **CPU release**          | Process voluntarily gives up CPU      | OS can force process off CPU             |
| **When it switches**     | Only on I/O, wait, or termination     | Also on timer interrupt, priority change |
| **Scheduling decisions** | Circumstances 1 and 4 only            | All 4 circumstances                      |
| **Responsiveness**       | Poor (one process can hog CPU)        | Good (guaranteed time sharing)           |
| **Complexity**           | Simple (no race conditions in kernel) | Complex (needs synchronization)          |
| **Starvation risk**      | High (long process blocks others)     | Lower (timer ensures fairness)           |
| **Used in**              | Windows 3.1, Mac OS 9, simple RTOS    | Linux, Windows NT+, macOS, modern RTOS   |
| **Example algorithms**   | FCFS, non-preemptive SJF              | Round Robin, SRTF, preemptive priority   |

### Dangers of Non-Preemptive Scheduling

```text
Non-preemptive: One misbehaving process blocks everyone

Process A (infinite loop):  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━→ never yields!
Process B (waiting):        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░→ starved!
Process C (waiting):        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░→ starved!

Preemptive: Timer ensures fairness

Process A:  ━━━━━━━━━━ │ ░░░░░░░░░░░░░░░░░░░░ │ ━━━━━━━━━━ │ ░░░░░░...
Process B:  ░░░░░░░░░░ │ ━━━━━━━━━━ │ ░░░░░░░░░░░░░░░░░░░░ │ ━━━━━━...
Process C:  ░░░░░░░░░░░░░░░░░░░░ │ ━━━━━━━━━━ │ ░░░░░░░░░░ │ ━━━━━━...
            ─────────────────────────────────────────────────────────────→ time
            Timer forces switches every quantum
```

---

## Scheduling Criteria

To evaluate and compare scheduling algorithms, we use several metrics:

### Criteria Definitions

| Criterion           | Definition                                     | Goal                      |
| ------------------- | ---------------------------------------------- | ------------------------- |
| **CPU Utilization** | Percentage of time the CPU is busy             | Maximize (ideally 40-90%) |
| **Throughput**      | Number of processes completed per unit time    | Maximize                  |
| **Turnaround Time** | Total time from submission to completion       | Minimize                  |
| **Waiting Time**    | Total time a process spends in the ready queue | Minimize                  |
| **Response Time**   | Time from submission to first response         | Minimize                  |

### Formulas

**Turnaround Time** — The total time a process spends in the system:

$$T_{\text{turnaround}} = T_{\text{completion}} - T_{\text{arrival}}$$

**Waiting Time** — Time spent waiting in the ready queue (not running, not doing I/O):

$$T_{\text{waiting}} = T_{\text{turnaround}} - T_{\text{burst}}$$

**Response Time** — Time from arrival until first execution:

$$T_{\text{response}} = T_{\text{first run}} - T_{\text{arrival}}$$

**Throughput** — Processes completed per unit time:

$$\text{Throughput} = \frac{\text{Number of processes completed}}{\text{Total time}}$$

**CPU Utilization:**

$$\text{CPU Utilization} = \frac{T_{\text{busy}}}{T_{\text{total}}} \times 100\%$$

### Worked Example

Consider a process P with:

- Arrival time = 0 ms
- CPU burst = 8 ms
- Completion time = 15 ms (waited in ready queue for some time)
- First run time = 3 ms

| Metric          | Calculation      | Value |
| --------------- | ---------------- | ----- |
| Turnaround Time | $15 - 0 = 15$ ms | 15 ms |
| Waiting Time    | $15 - 8 = 7$ ms  | 7 ms  |
| Response Time   | $3 - 0 = 3$ ms   | 3 ms  |

### What Matters Most?

| System Type             | Most Important Criteria     | Why                                 |
| ----------------------- | --------------------------- | ----------------------------------- |
| **Batch systems**       | Throughput, Turnaround Time | Process as many jobs as possible    |
| **Interactive systems** | Response Time, Waiting Time | Users expect fast reactions         |
| **Real-time systems**   | Deadline compliance         | Missing deadlines = failure         |
| **All systems**         | CPU Utilization, Fairness   | Waste and starvation are always bad |

> [!NOTE]
> Optimizing one criterion often comes at the expense of another. For example, minimizing average waiting time (SJF) can starve long processes. Scheduling is fundamentally about **tradeoffs**.

---

## The Dispatcher

The **dispatcher** is the OS module that gives control of the CPU to the process selected by the scheduler. It is separate from the scheduler itself.

> The **scheduler** decides _which_ process runs next. The **dispatcher** actually _performs_ the context switch to hand over the CPU.

### Dispatcher Responsibilities

```text
┌────────────────────────────────────────────────┐
│                  Dispatcher                     │
│                                                │
│  1. Perform context switch                      │
│     → Save current process state to PCB         │
│     → Load selected process state from PCB      │
│                                                │
│  2. Switch to user mode                         │
│     → Transition from kernel (ring 0)           │
│       to user mode (ring 3)                     │
│                                                │
│  3. Jump to proper location                     │
│     → Set program counter to the saved PC       │
│       in the selected process's PCB             │
│                                                │
└────────────────────────────────────────────────┘
```

### Dispatch Latency

> **Dispatch latency** is the time it takes for the dispatcher to stop one process and start another. It is the time overhead of every scheduling decision.

$$\text{Dispatch Latency} = T_{\text{context switch}} + T_{\text{mode switch}} + T_{\text{jump to user code}}$$

| Component                               | Typical Time |
| --------------------------------------- | ------------ |
| Context switch (save/restore registers) | 1-5 μs       |
| Mode switch (kernel → user)             | 0.5-1 μs     |
| Jump to user code location              | ~0.1 μs      |
| **Total dispatch latency**              | **2-6 μs**   |

```text
Scheduling Decision and Dispatch Timeline:

  Process P₁     Scheduler      Dispatcher      Process P₂
  ──────────    ──────────     ──────────       ──────────
      │              │              │               │
      │  interrupt   │              │               │
      │─────────────►│              │               │
      │              │              │               │
      │         Run algorithm       │               │
      │         Select P₂           │               │
      │              │              │               │
      │              │─────────────►│               │
      │              │              │               │
      │              │         Save P₁ state        │
      │              │         Load P₂ state        │
      │              │         Switch to user mode  │
      │              │              │               │
      │              │              │──────────────►│
      │              │              │          P₂ resumes
      │                                             │
      │◄──── Scheduling ───►◄── Dispatch ──►       │
      │       Decision          Latency             │
```

---

## Gantt Chart Notation

Throughout the scheduling lessons, we will use **Gantt charts** to visualize how the CPU is allocated to processes over time. A Gantt chart is a horizontal bar showing which process occupies the CPU at each moment.

### Gantt Chart Format

```text
Gantt Chart:
┌──────┬──────┬──────┬──────┬──────┐
│  P₁  │  P₂  │  P₃  │  P₁  │  P₂  │
└──────┴──────┴──────┴──────┴──────┘
0      4      7      9     14     17

Reading the chart:
  P₁ runs from time 0 to 4  (burst = 4)
  P₂ runs from time 4 to 7  (burst = 3)
  P₃ runs from time 7 to 9  (burst = 2)
  P₁ runs from time 9 to 14 (burst = 5)
  P₂ runs from time 14 to 17 (burst = 3)
```

### Gantt Chart with Idle CPU

```text
┌──────┬──────┬──────┬──────┬──────┐
│  P₁  │ idle │  P₂  │  P₃  │  P₂  │
└──────┴──────┴──────┴──────┴──────┘
0      3      5      8     11     15

  CPU is idle from time 3 to 5 (no ready processes)
```

### Computing Metrics from a Gantt Chart

Given this Gantt chart and process data:

| Process | Arrival | Burst |
| ------- | ------- | ----- |
| P₁      | 0       | 4     |
| P₂      | 1       | 3     |
| P₃      | 2       | 2     |

```text
┌──────┬──────┬──────┐
│  P₁  │  P₂  │  P₃  │
└──────┴──────┴──────┘
0      4      7      9
```

| Process     | Arrival | Burst | Completion | Turnaround | Waiting  | Response |
| ----------- | ------- | ----- | ---------- | ---------- | -------- | -------- |
| P₁          | 0       | 4     | 4          | $4-0=4$    | $4-4=0$  | $0-0=0$  |
| P₂          | 1       | 3     | 7          | $7-1=6$    | $6-3=3$  | $4-1=3$  |
| P₃          | 2       | 2     | 9          | $9-2=7$    | $7-2=5$  | $7-2=5$  |
| **Average** |         |       |            | **5.67**   | **2.67** | **2.67** |

$$\text{Avg Turnaround} = \frac{4 + 6 + 7}{3} = 5.67 \text{ ms}$$

$$\text{Avg Waiting} = \frac{0 + 3 + 5}{3} = 2.67 \text{ ms}$$

---

## Scheduling Algorithm Overview

In the following lessons, we will study these scheduling algorithms in detail:

| Algorithm       | Type           | Key Idea                            | Optimal?                       |
| --------------- | -------------- | ----------------------------------- | ------------------------------ |
| **FCFS**        | Non-preemptive | First process to arrive runs first  | No                             |
| **SJF**         | Non-preemptive | Shortest burst runs first           | Yes (for avg waiting time)     |
| **SRTF**        | Preemptive     | Shortest remaining time runs first  | Yes (preemptive optimal)       |
| **Priority**    | Both           | Highest priority runs first         | Depends on priority assignment |
| **Round Robin** | Preemptive     | Fixed time quantum, rotate          | No, but fair                   |
| **MLQ**         | Both           | Multiple queues with fixed priority | No                             |
| **MLFQ**        | Preemptive     | Dynamic priority based on behavior  | Near-optimal in practice       |

---

## Python Simulation: Scheduling Metrics Calculator

```python
from dataclasses import dataclass
from typing import List

@dataclass
class Process:
    name: str
    arrival_time: int
    burst_time: int
    completion_time: int = 0
    first_run_time: int = -1

    @property
    def turnaround_time(self) -> int:
        return self.completion_time - self.arrival_time

    @property
    def waiting_time(self) -> int:
        return self.turnaround_time - self.burst_time

    @property
    def response_time(self) -> int:
        return self.first_run_time - self.arrival_time

def print_metrics(processes: List[Process]):
    """Print a table of scheduling metrics."""
    print(f"{'Process':<10} {'Arrival':>8} {'Burst':>6} {'Completion':>11} "
          f"{'Turnaround':>11} {'Waiting':>8} {'Response':>9}")
    print("-" * 70)
    for p in processes:
        print(f"{p.name:<10} {p.arrival_time:>8} {p.burst_time:>6} "
              f"{p.completion_time:>11} {p.turnaround_time:>11} "
              f"{p.waiting_time:>8} {p.response_time:>9}")
    print("-" * 70)

    n = len(processes)
    avg_tat = sum(p.turnaround_time for p in processes) / n
    avg_wt = sum(p.waiting_time for p in processes) / n
    avg_rt = sum(p.response_time for p in processes) / n
    print(f"{'Average':<10} {'':>8} {'':>6} {'':>11} "
          f"{avg_tat:>11.2f} {avg_wt:>8.2f} {avg_rt:>9.2f}")

# Example: FCFS scheduling
processes = [
    Process("P1", arrival_time=0, burst_time=4),
    Process("P2", arrival_time=1, burst_time=3),
    Process("P3", arrival_time=2, burst_time=2),
]

# Simulate FCFS
time = 0
for p in sorted(processes, key=lambda x: x.arrival_time):
    if time < p.arrival_time:
        time = p.arrival_time  # CPU idle until process arrives
    p.first_run_time = time
    time += p.burst_time
    p.completion_time = time

print("=== FCFS Scheduling Results ===")
print_metrics(processes)
```

**Output:**

```text
=== FCFS Scheduling Results ===
Process    Arrival  Burst  Completion  Turnaround  Waiting  Response
----------------------------------------------------------------------
P1               0      4           4           4        0         0
P2               1      3           7           6        3         3
P3               2      2           9           7        5         5
----------------------------------------------------------------------
Average                                      5.67     2.67      2.67
```

---

## Try It Yourself

**Exercise 1:** A system has 5 processes with the following CPU burst times: 3, 8, 2, 5, 1 ms. If all arrive at time 0, calculate the throughput when processing completes.

:::details Solution
Total burst time = $3 + 8 + 2 + 5 + 1 = 19$ ms (minimum, assuming no idle time)

$$\text{Throughput} = \frac{5 \text{ processes}}{19 \text{ ms}} = 0.263 \text{ processes/ms} = 263 \text{ processes/second}$$

Note: This is the theoretical maximum throughput. Context switch overhead would slightly reduce this in practice.
:::

**Exercise 2:** A process arrives at time 5 ms, first executes at time 12 ms, and completes at time 28 ms. Its total CPU burst time is 10 ms. Calculate its turnaround time, waiting time, and response time.

:::details Solution

- **Turnaround Time** = Completion - Arrival = $28 - 5 = 23$ ms
- **Waiting Time** = Turnaround - Burst = $23 - 10 = 13$ ms
- **Response Time** = First Run - Arrival = $12 - 5 = 7$ ms

The process waited 13 ms total in the ready queue (possibly in multiple segments if preempted), and had to wait 7 ms before first getting the CPU.
:::

**Exercise 3:** Explain why minimizing average **response time** is more important than minimizing average **turnaround time** in interactive systems. Give a concrete example.

:::details Solution
**Response time** measures how quickly a process first reacts to user input. In interactive systems, users perceive the system as "fast" or "slow" based on when they see the _first_ response, not when the task finishes.

**Example:** Consider a text editor. When a user types a character:

- **Response time** = time until the character appears on screen (~1 ms needed for good UX)
- **Turnaround time** = time until all background tasks (spell check, autosave) complete (~100 ms)

If a scheduling algorithm minimizes turnaround time but gives poor response time, the character might not appear for 50 ms — the user perceives lag and thinks the system is broken, even though the total work completes efficiently.

Round Robin scheduling prioritizes response time (every process gets a quick turn), while SJF prioritizes turnaround/waiting time. This is why interactive systems use preemptive, time-sharing schedulers.
:::

---

## Key Takeaways

- Every process alternates between **CPU bursts** (computation) and **I/O bursts** (waiting). Most CPU bursts are short, following an exponential distribution.
- Processes are classified as **CPU-bound** (long CPU bursts, little I/O) or **I/O-bound** (short CPU bursts, frequent I/O). A good scheduler handles both efficiently.
- Scheduling decisions occur under **four circumstances**: process blocks (1), preemption (2), I/O completion (3), and termination (4). Non-preemptive scheduling only uses 1 and 4.
- **Preemptive scheduling** (used by all modern OS) can forcibly remove a running process, providing better responsiveness and fairness than non-preemptive (cooperative) scheduling.
- Five key **scheduling criteria**: CPU utilization (maximize), throughput (maximize), turnaround time (minimize), waiting time (minimize), and response time (minimize).
- Key formulas: $T_{\text{turnaround}} = T_{\text{completion}} - T_{\text{arrival}}$ and $T_{\text{waiting}} = T_{\text{turnaround}} - T_{\text{burst}}$.
- The **dispatcher** performs the actual context switch after the scheduler makes its decision. **Dispatch latency** is the time overhead of each switch.
- **Gantt charts** are the standard tool for visualizing CPU scheduling — showing which process runs at each point in time.
