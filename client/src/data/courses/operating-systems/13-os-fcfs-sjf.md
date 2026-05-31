---
title: FCFS & SJF Scheduling
section: "Processes & Scheduling"
---

# FCFS & SJF Scheduling

Now that we understand scheduling criteria, Gantt charts, and the difference between preemptive and non-preemptive scheduling, it's time to study our first concrete algorithms. In this lesson, we cover three foundational scheduling strategies: **First-Come, First-Served (FCFS)**, **Shortest Job First (SJF)**, and its preemptive cousin, **Shortest Remaining Time First (SRTF)**.

These algorithms form the building blocks of scheduling theory. Understanding their strengths, weaknesses, and edge cases is essential before tackling more complex algorithms.

---

## First-Come, First-Served (FCFS)

### Algorithm Description

> **FCFS** schedules processes in the exact order they arrive in the ready queue. The first process to arrive is the first to run, and it runs to completion without interruption.

FCFS is the simplest scheduling algorithm — it's essentially a **FIFO queue**. Think of it as a line at a grocery store: whoever arrives first gets served first, regardless of how many items they have.

| Property           | Value                                     |
| ------------------ | ----------------------------------------- |
| **Type**           | Non-preemptive                            |
| **Data Structure** | FIFO queue                                |
| **Selection Rule** | Earliest arrival time                     |
| **Complexity**     | $O(n)$ — single pass through process list |
| **Starvation**     | No (every process eventually runs)        |
| **Optimal?**       | No                                        |

### Worked Example

Consider the following set of processes (all times in milliseconds):

| Process | Arrival Time | Burst Time |
| ------- | ------------ | ---------- |
| P₁      | 0            | 24         |
| P₂      | 1            | 3          |
| P₃      | 2            | 3          |
| P₄      | 3            | 5          |

#### Gantt Chart

```text
┌──────────────────────────────────┬─────┬─────┬───────┐
│               P₁                 │ P₂  │ P₃  │  P₄   │
└──────────────────────────────────┴─────┴─────┴───────┘
0                                  24    27    30     35
```

#### Metric Calculations

| Process | Arrival | Burst | Completion | Turnaround | Waiting   | Response  |
| ------- | ------- | ----- | ---------- | ---------- | --------- | --------- |
| P₁      | 0       | 24    | 24         | $24-0=24$  | $24-24=0$ | $0-0=0$   |
| P₂      | 1       | 3     | 27         | $27-1=26$  | $26-3=23$ | $24-1=23$ |
| P₃      | 2       | 3     | 30         | $30-2=28$  | $28-3=25$ | $27-2=25$ |
| P₄      | 3       | 5     | 35         | $35-3=32$  | $32-5=27$ | $30-3=27$ |

$$\text{Avg Turnaround Time} = \frac{24 + 26 + 28 + 32}{4} = \frac{110}{4} = 27.50 \text{ ms}$$

$$\text{Avg Waiting Time} = \frac{0 + 23 + 25 + 27}{4} = \frac{75}{4} = 18.75 \text{ ms}$$

$$\text{Avg Response Time} = \frac{0 + 23 + 25 + 27}{4} = \frac{75}{4} = 18.75 \text{ ms}$$

> [!WARNING]
> Notice how P₂, P₃, and P₄ all have to wait over 20 ms despite having very short burst times. This is because P₁'s long burst (24 ms) blocks everyone behind it.

### The Convoy Effect

The **convoy effect** is the primary weakness of FCFS. When a single CPU-bound process with a long burst time arrives before several I/O-bound processes with short bursts, all the short processes queue behind the long one — like small cars stuck behind a slow truck on a single-lane road.

```text
The Convoy Effect:

FCFS Order (P₁ arrives first with burst = 24):
┌──────────────────────────────────┬───┬───┬─────┐
│           P₁ (24 ms)             │P₂ │P₃ │ P₄  │
└──────────────────────────────────┴───┴───┴─────┘
0                                  24  27  30   35
  Avg waiting time = 18.75 ms  ← BAD!

If P₁ arrived last instead:
┌───┬───┬─────┬──────────────────────────────────┐
│P₂ │P₃ │ P₄  │           P₁ (24 ms)             │
└───┴───┴─────┴──────────────────────────────────┘
0   3   6    11                                  35
  Avg waiting time = 5.75 ms  ← MUCH BETTER!
```

The convoy effect makes FCFS **highly sensitive to arrival order** — average waiting time can vary dramatically depending on which process arrives first.

### FCFS: Pros and Cons

| Pros                                  | Cons                                   |
| ------------------------------------- | -------------------------------------- |
| Simplest to implement                 | Convoy effect causes long average wait |
| No starvation (fair in arrival order) | Not optimal for any metric             |
| Zero overhead (no preemption)         | Poor for interactive systems           |
| Predictable (no surprises)            | Short jobs penalized by long jobs      |
| Good for batch processing             | Non-preemptive (can't handle urgency)  |

---

## Shortest Job First (SJF) — Non-Preemptive

### Algorithm Description

> **SJF** selects the process with the **shortest CPU burst time** from the ready queue. It is provably optimal for minimizing average waiting time among non-preemptive algorithms.

Think of it as the "express lane" strategy: let the quickest jobs through first so fewer processes are left waiting.

| Property           | Value                                |
| ------------------ | ------------------------------------ |
| **Type**           | Non-preemptive                       |
| **Selection Rule** | Shortest burst among ready processes |
| **Complexity**     | $O(n \log n)$ — need to find minimum |
| **Starvation**     | Yes (long processes may starve)      |
| **Optimal?**       | Yes — minimizes average waiting time |

> [!IMPORTANT]
> SJF is **provably optimal** for minimizing average waiting time. The proof is intuitive: placing a short job before a long job reduces the waiting time for the short job by the long job's duration, while only increasing the long job's wait by the short job's (smaller) duration. The net effect is always positive.

### Worked Example

Same process set as before:

| Process | Arrival Time | Burst Time |
| ------- | ------------ | ---------- |
| P₁      | 0            | 24         |
| P₂      | 1            | 3          |
| P₃      | 2            | 3          |
| P₄      | 3            | 5          |

**At time 0:** Only P₁ has arrived → P₁ runs (no choice).
**At time 24:** P₂, P₃, P₄ are all waiting. SJF picks shortest: P₂ (3) or P₃ (3) — tie, pick either.
**At time 27:** P₃ and P₄ remain. P₃ (3) < P₄ (5) → P₃ runs.
**At time 30:** Only P₄ remains → P₄ runs.

#### Gantt Chart

```text
┌──────────────────────────────────┬─────┬─────┬───────┐
│               P₁                 │ P₂  │ P₃  │  P₄   │
└──────────────────────────────────┴─────┴─────┴───────┘
0                                  24    27    30     35
```

In this case, the FCFS and SJF schedules happen to be **identical** because P₁ arrives first and runs uninterrupted. The difference only matters when multiple processes are ready simultaneously.

### Better Example for SJF

Let's use processes that arrive at the same time to show SJF's advantage:

| Process | Arrival Time | Burst Time |
| ------- | ------------ | ---------- |
| P₁      | 0            | 6          |
| P₂      | 0            | 8          |
| P₃      | 0            | 7          |
| P₄      | 0            | 3          |

**FCFS Order (by PID):**

```text
┌────────┬──────────┬─────────┬─────┐
│   P₁   │    P₂    │   P₃    │ P₄  │
└────────┴──────────┴─────────┴─────┘
0        6         14        21    24
```

| Process | Waiting (FCFS) |
| ------- | -------------- |
| P₁      | 0              |
| P₂      | 6              |
| P₃      | 14             |
| P₄      | 21             |
| **Avg** | **10.25**      |

**SJF Order (shortest first: P₄, P₁, P₃, P₂):**

```text
┌─────┬────────┬─────────┬──────────┐
│ P₄  │   P₁   │   P₃    │    P₂    │
└─────┴────────┴─────────┴──────────┘
0     3        9        16         24
```

| Process | Waiting (SJF) |
| ------- | ------------- |
| P₄      | 0             |
| P₁      | 3             |
| P₃      | 9             |
| P₂      | 16            |
| **Avg** | **7.00**      |

$$\text{SJF improvement} = \frac{10.25 - 7.00}{10.25} \times 100\% = 31.7\% \text{ reduction}$$

---

## The Burst Time Prediction Problem

SJF is optimal, but it has a critical practical problem: **how do you know the next CPU burst time in advance?**

> You **can't** know future burst times exactly. But you can **predict** them based on past behavior using **exponential averaging**.

### Exponential Averaging Formula

$$\tau_{n+1} = \alpha \cdot t_n + (1 - \alpha) \cdot \tau_n$$

Where:

- $\tau_{n+1}$ = predicted next burst time
- $t_n$ = actual duration of the $n$-th burst (most recent)
- $\tau_n$ = predicted duration of the $n$-th burst (previous prediction)
- $\alpha$ = smoothing factor, $0 \leq \alpha \leq 1$

| $\alpha$ value         | Behavior                                          |
| ---------------------- | ------------------------------------------------- |
| $\alpha = 0$           | Prediction never changes (ignores actual history) |
| $\alpha = 1$           | Prediction = last actual burst (no smoothing)     |
| $\alpha = 0.5$         | Equal weight to recent history and prediction     |
| Common: $\alpha = 0.5$ | Good balance between responsiveness and stability |

### Worked Example of Burst Prediction

Let $\alpha = 0.5$ and initial prediction $\tau_0 = 10$ ms:

| Burst $n$ | Actual $t_n$ | Predicted $\tau_n$ | Formula                         | Next Prediction $\tau_{n+1}$ |
| --------- | ------------ | ------------------ | ------------------------------- | ---------------------------- |
| 0         | —            | 10                 | —                               | —                            |
| 1         | 6            | 10                 | $0.5 \times 6 + 0.5 \times 10$  | 8.0                          |
| 2         | 4            | 8                  | $0.5 \times 4 + 0.5 \times 8$   | 6.0                          |
| 3         | 6            | 6                  | $0.5 \times 6 + 0.5 \times 6$   | 6.0                          |
| 4         | 4            | 6                  | $0.5 \times 4 + 0.5 \times 6$   | 5.0                          |
| 5         | 13           | 5                  | $0.5 \times 13 + 0.5 \times 5$  | 9.0                          |
| 6         | 13           | 9                  | $0.5 \times 13 + 0.5 \times 9$  | 11.0                         |
| 7         | 13           | 11                 | $0.5 \times 13 + 0.5 \times 11$ | 12.0                         |

```text
Burst Prediction vs Actual:

    │ actual ●   predicted ○
 14 │                        ●─────●─────●
    │                       ╱     ╱     ╱
 12 │                      ╱  ○──╱─────○
    │                     ╱  ╱  ╱
 10 │ ○                  ╱  ╱  ╱
    │  ╲                ╱  ╱  ╱
  8 │   ○              ╱  ○  ╱
    │    ╲            ╱     ╱
  6 │ ●   ○── ●──○  ╱     ╱
    │      ╲       ╲╱     ╱
  4 │       ●       ●    ╱
    │                    ╱
  2 │
    └──┬──┬──┬──┬──┬──┬──┬── burst number
       1  2  3  4  5  6  7
```

---

## Shortest Remaining Time First (SRTF) — Preemptive SJF

### Algorithm Description

> **SRTF** is the preemptive version of SJF. Whenever a new process arrives with a burst time shorter than the **remaining time** of the currently running process, the running process is preempted.

| Property           | Value                                                     |
| ------------------ | --------------------------------------------------------- |
| **Type**           | Preemptive                                                |
| **Selection Rule** | Shortest remaining burst time                             |
| **Complexity**     | $O(n \log n)$ per scheduling decision                     |
| **Starvation**     | Yes (long processes can starve badly)                     |
| **Optimal?**       | Yes — minimizes average waiting time among all algorithms |

### Worked Example

| Process | Arrival Time | Burst Time |
| ------- | ------------ | ---------- |
| P₁      | 0            | 8          |
| P₂      | 1            | 4          |
| P₃      | 2            | 9          |
| P₄      | 3            | 5          |

**Step-by-step execution:**

| Time | Event                                            | Ready Queue (remaining times) | Running |
| ---- | ------------------------------------------------ | ----------------------------- | ------- |
| 0    | P₁ arrives                                       | P₁(8)                         | P₁      |
| 1    | P₂ arrives. P₂(4) < P₁ remaining(7) → preempt!   | P₁(7)                         | **P₂**  |
| 2    | P₃ arrives. P₃(9) > P₂ remaining(3) → no preempt | P₁(7), P₃(9)                  | P₂      |
| 3    | P₄ arrives. P₄(5) > P₂ remaining(2) → no preempt | P₁(7), P₃(9), P₄(5)           | P₂      |
| 5    | P₂ finishes. Shortest: P₄(5)                     | P₁(7), P₃(9)                  | **P₄**  |
| 10   | P₄ finishes. Shortest: P₁(7)                     | P₃(9)                         | **P₁**  |
| 17   | P₁ finishes. Shortest: P₃(9)                     | (empty)                       | **P₃**  |
| 26   | P₃ finishes. All done.                           |                               |         |

#### Gantt Chart

```text
┌────┬──────────┬───────────┬─────────────────┬──────────────────────┐
│ P₁ │    P₂    │    P₄     │       P₁        │         P₃           │
└────┴──────────┴───────────┴─────────────────┴──────────────────────┘
0    1          5          10                 17                     26
```

#### Metric Calculations

| Process | Arrival | Burst | Completion | Turnaround | Waiting   | Response  |
| ------- | ------- | ----- | ---------- | ---------- | --------- | --------- |
| P₁      | 0       | 8     | 17         | $17-0=17$  | $17-8=9$  | $0-0=0$   |
| P₂      | 1       | 4     | 5          | $5-1=4$    | $4-4=0$   | $1-1=0$   |
| P₃      | 2       | 9     | 26         | $26-2=24$  | $24-9=15$ | $17-2=15$ |
| P₄      | 3       | 5     | 10         | $10-3=7$   | $7-5=2$   | $5-3=2$   |

$$\text{Avg Turnaround} = \frac{17 + 4 + 24 + 7}{4} = \frac{52}{4} = 13.00 \text{ ms}$$

$$\text{Avg Waiting} = \frac{9 + 0 + 15 + 2}{4} = \frac{26}{4} = 6.50 \text{ ms}$$

### Comparison: FCFS vs SJF vs SRTF

Let's compare all three algorithms on the same process set:

| Algorithm                | Avg Turnaround                       | Avg Waiting                         | Avg Response                  |
| ------------------------ | ------------------------------------ | ----------------------------------- | ----------------------------- |
| **FCFS**                 | $\frac{8 + 11 + 24 + 23}{4} = 16.50$ | $\frac{0 + 7 + 15 + 18}{4} = 10.00$ | $\frac{0+7+15+18}{4} = 10.00$ |
| **SJF (non-preemptive)** | $\frac{8 + 11 + 26 + 18}{4} = 15.75$ | $\frac{0 + 7 + 17 + 10}{4} = 8.50$  | $\frac{0+7+17+10}{4} = 8.50$  |
| **SRTF (preemptive)**    | $\frac{17 + 4 + 24 + 7}{4} = 13.00$  | $\frac{9 + 0 + 15 + 2}{4} = 6.50$   | $\frac{0+0+15+2}{4} = 4.25$   |

> [!TIP]
> SRTF achieves the **lowest average waiting time** of all three — confirming its theoretical optimality. It also provides the best response time because short jobs get immediate attention.

---

## Starvation in SJF/SRTF

Both SJF and SRTF suffer from **starvation**: if a continuous stream of short processes keeps arriving, long processes may never get to run.

```text
Starvation scenario:

Time 0:   P_long (burst = 100) arrives
Time 1:   P_short1 (burst = 2) arrives → preempts P_long
Time 3:   P_short2 (burst = 3) arrives → runs before P_long
Time 6:   P_short3 (burst = 1) arrives → runs before P_long
Time 7:   P_short4 (burst = 4) arrives → runs before P_long
...

P_long sits in the ready queue FOREVER because shorter
processes keep arriving and cutting in line!

Time ────────────────────────────────────────────────────►
P_long:  ─ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (starving!)
P_short: ━━━━━ ━━━━━━ ━━ ━━━━━━━ ━━━━ ━━━ ━━━━━━━━ (getting served)

━ = running    ░ = waiting (starving)
```

### Solutions to Starvation

| Solution                      | Description                                       | Mechanism                                  |
| ----------------------------- | ------------------------------------------------- | ------------------------------------------ |
| **Aging**                     | Gradually increase priority of waiting processes  | After waiting for time $T$, boost priority |
| **Maximum wait time**         | Set an upper bound on how long a process can wait | Promote after exceeding threshold          |
| **Multilevel Feedback Queue** | Processes move between priority queues            | Long-waiting processes get promoted        |

---

## C Implementation: SJF Scheduler Simulation

```c
#include <stdio.h>
#include <stdlib.h>
#include <limits.h>

#define MAX_PROCESSES 10

typedef struct {
    char name[4];
    int arrival;
    int burst;
    int remaining;    // For SRTF
    int completion;
    int first_run;
    int started;
} Process;

void sjf_nonpreemptive(Process procs[], int n) {
    int time = 0, completed = 0;
    int done[MAX_PROCESSES] = {0};

    printf("\n=== SJF (Non-Preemptive) ===\n");

    while (completed < n) {
        int shortest = -1;
        int min_burst = INT_MAX;

        // Find shortest available job
        for (int i = 0; i < n; i++) {
            if (!done[i] && procs[i].arrival <= time && procs[i].burst < min_burst) {
                min_burst = procs[i].burst;
                shortest = i;
            }
        }

        if (shortest == -1) {
            time++;  // CPU idle
            continue;
        }

        procs[shortest].first_run = time;
        time += procs[shortest].burst;
        procs[shortest].completion = time;
        done[shortest] = 1;
        completed++;

        printf("  Time %2d-%2d: %s runs (burst=%d)\n",
               procs[shortest].first_run, time, procs[shortest].name,
               procs[shortest].burst);
    }
}

void print_results(Process procs[], int n) {
    float total_tat = 0, total_wt = 0;
    printf("\n  %-5s %-8s %-6s %-11s %-11s %-8s\n",
           "Proc", "Arrival", "Burst", "Completion", "Turnaround", "Waiting");
    printf("  %-5s %-8s %-6s %-11s %-11s %-8s\n",
           "----", "-------", "-----", "----------", "----------", "-------");

    for (int i = 0; i < n; i++) {
        int tat = procs[i].completion - procs[i].arrival;
        int wt = tat - procs[i].burst;
        total_tat += tat;
        total_wt += wt;
        printf("  %-5s %-8d %-6d %-11d %-11d %-8d\n",
               procs[i].name, procs[i].arrival, procs[i].burst,
               procs[i].completion, tat, wt);
    }
    printf("\n  Avg Turnaround: %.2f ms\n", total_tat / n);
    printf("  Avg Waiting:    %.2f ms\n", total_wt / n);
}

int main() {
    Process procs[] = {
        {"P1", 0, 6, 6, 0, -1, 0},
        {"P2", 0, 8, 8, 0, -1, 0},
        {"P3", 0, 7, 7, 0, -1, 0},
        {"P4", 0, 3, 3, 0, -1, 0},
    };
    int n = 4;

    sjf_nonpreemptive(procs, n);
    print_results(procs, n);

    return 0;
}
```

---

## Summary Comparison Table

| Feature              | FCFS                | SJF (Non-preemptive)  | SRTF (Preemptive)                  |
| -------------------- | ------------------- | --------------------- | ---------------------------------- |
| **Selection**        | First arrived       | Shortest burst        | Shortest remaining                 |
| **Preemptive?**      | No                  | No                    | Yes                                |
| **Optimal?**         | No                  | Yes (non-preemptive)  | Yes (all algorithms)               |
| **Avg Waiting Time** | High                | Low                   | Lowest                             |
| **Response Time**    | High                | Medium                | Low (for short jobs)               |
| **Starvation**       | No                  | Yes (long jobs)       | Yes (long jobs)                    |
| **Convoy Effect**    | Yes                 | No                    | No                                 |
| **Implementation**   | Simple (FIFO queue) | Need burst prediction | Need burst prediction + preemption |
| **Overhead**         | None                | Low                   | Medium (context switches)          |
| **Best for**         | Batch systems       | Known burst times     | Interactive + known bursts         |

---

## Try It Yourself

**Exercise 1:** Given the following processes, compute the average waiting time using both FCFS and SJF (non-preemptive). All arrive at time 0.

| Process | Burst Time |
| ------- | ---------- |
| P₁      | 10         |
| P₂      | 1          |
| P₃      | 2          |
| P₄      | 1          |
| P₅      | 5          |

:::details Solution
**FCFS (order: P₁, P₂, P₃, P₄, P₅):**

```text
┌──────────────┬───┬────┬───┬───────┐
│      P₁      │P₂ │ P₃ │P₄ │  P₅   │
└──────────────┴───┴────┴───┴───────┘
0             10  11   13  14      19
```

Waiting: P₁=0, P₂=10, P₃=11, P₄=13, P₅=14
$$\text{Avg} = \frac{0+10+11+13+14}{5} = \frac{48}{5} = 9.60 \text{ ms}$$

**SJF (order: P₂, P₄, P₃, P₅, P₁):**

```text
┌───┬───┬────┬───────┬──────────────┐
│P₂ │P₄ │ P₃ │  P₅   │      P₁      │
└───┴───┴────┴───────┴──────────────┘
0   1   2    4       9             19
```

Waiting: P₂=0, P₄=1, P₃=2, P₅=4, P₁=9
$$\text{Avg} = \frac{0+1+2+4+9}{5} = \frac{16}{5} = 3.20 \text{ ms}$$

**SJF reduces average waiting time by 66.7%!**
:::

**Exercise 2:** Apply SRTF to these processes and draw the Gantt chart:

| Process | Arrival | Burst |
| ------- | ------- | ----- |
| P₁      | 0       | 7     |
| P₂      | 2       | 4     |
| P₃      | 4       | 1     |
| P₄      | 5       | 4     |

:::details Solution
**Step-by-step:**

- t=0: P₁ runs (only process). Remaining: P₁(7)
- t=2: P₂ arrives. P₂(4) < P₁ remaining(5) → preempt! P₂ runs.
- t=4: P₃ arrives. P₃(1) < P₂ remaining(2) → preempt! P₃ runs.
- t=5: P₃ done. P₄ arrives. Ready: P₁(5), P₂(2), P₄(4). Shortest: P₂(2)
- t=7: P₂ done. Ready: P₁(5), P₄(4). Shortest: P₄(4)
- t=11: P₄ done. P₁(5) runs.
- t=16: P₁ done.

```text
┌────┬──────┬───┬──────┬──────────┬───────────┐
│ P₁ │  P₂  │P₃ │  P₂  │    P₄    │    P₁     │
└────┴──────┴───┴──────┴──────────┴───────────┘
0    2      4   5      7         11           16
```

| Process | Arrival | Burst | Completion | Turnaround | Waiting |
| ------- | ------- | ----- | ---------- | ---------- | ------- |
| P₁      | 0       | 7     | 16         | 16         | 9       |
| P₂      | 2       | 4     | 7          | 5          | 1       |
| P₃      | 4       | 1     | 5          | 1          | 0       |
| P₄      | 5       | 4     | 11         | 6          | 2       |

$$\text{Avg Waiting} = \frac{9+1+0+2}{4} = 3.00 \text{ ms}$$
:::

**Exercise 3:** Use the exponential averaging formula with $\alpha = 0.5$ and $\tau_0 = 8$ to predict bursts. Actual bursts are: 6, 4, 6, 4, 6. Show all predictions.

:::details Solution
| $n$ | Actual $t_n$ | Predicted $\tau_n$ | Computation | $\tau_{n+1}$ |
|-----|-------------|-------------------|-------------|-------------|
| 0 | — | 8.0 | (initial) | — |
| 1 | 6 | 8.0 | $0.5(6) + 0.5(8.0)$ | 7.0 |
| 2 | 4 | 7.0 | $0.5(4) + 0.5(7.0)$ | 5.5 |
| 3 | 6 | 5.5 | $0.5(6) + 0.5(5.5)$ | 5.75 |
| 4 | 4 | 5.75 | $0.5(4) + 0.5(5.75)$ | 4.875 |
| 5 | 6 | 4.875 | $0.5(6) + 0.5(4.875)$ | 5.4375 |

The prediction oscillates and converges toward the actual average burst time of 5.0. With $\alpha = 0.5$, it adapts moderately to changes.
:::

---

## Key Takeaways

- **FCFS** is the simplest scheduler (FIFO queue), but suffers from the **convoy effect** where long processes delay all shorter ones behind them.
- **SJF (non-preemptive)** is provably **optimal** for minimizing average waiting time — it always schedules the shortest available job next.
- **SRTF (preemptive SJF)** extends SJF by preempting the running process if a new arrival has a shorter remaining time, achieving the lowest possible average waiting time of any scheduling algorithm.
- The main challenge with SJF/SRTF is **predicting burst times**. The **exponential averaging** formula $\tau_{n+1} = \alpha t_n + (1-\alpha)\tau_n$ estimates future bursts from past behavior.
- Both SJF and SRTF can cause **starvation** of long processes. **Aging** (gradually increasing priority of waiting processes) is the primary solution.
- FCFS has no starvation but poor average performance. SJF/SRTF have excellent average performance but can starve individual processes. This is a fundamental **fairness vs efficiency** tradeoff.
