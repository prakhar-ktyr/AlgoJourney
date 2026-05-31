---
title: Thrashing & Working Set Model
section: "Memory Management"
---

# Thrashing & Working Set Model

Every operating system walks a tightrope: run as many processes as possible to keep the CPU busy, but give each process enough physical memory to avoid constant page faults. When the balance tips too far toward multiprogramming, the system enters a catastrophic state called **thrashing** — the CPU spends almost all of its time swapping pages in and out of disk, doing virtually no useful work. This lesson explores why thrashing happens, how to detect it, and the elegant models — the **Working Set** and **Page-Fault Frequency** strategies — that modern operating systems use to prevent it.

---

## What Is Thrashing?

> **Thrashing** occurs when a process (or set of processes) spends more time paging — moving pages between main memory and disk — than it does executing instructions.

Imagine a chef in a tiny kitchen who can only keep two ingredients on the counter at a time. Every recipe step requires a different ingredient, so the chef spends all day walking to the pantry and back, barely cooking anything. That is thrashing.

### The Vicious Cycle

Thrashing is not a gradual slowdown — it is a positive feedback loop:

| Step | What Happens                                                            |
| ---- | ----------------------------------------------------------------------- |
| 1    | OS increases degree of multiprogramming (loads more processes)          |
| 2    | Each process gets fewer frames                                          |
| 3    | Page-fault rate rises sharply                                           |
| 4    | CPU utilization drops (processes blocked waiting for I/O)               |
| 5    | OS scheduler sees low CPU utilization and loads **even more** processes |
| 6    | Each process gets even fewer frames → goto Step 3                       |

> [!WARNING]
> The operating system's own response to low CPU utilization — admitting more processes — is exactly what makes thrashing worse. Without an explicit detection mechanism, the system spirals into near-zero throughput.

### CPU Utilization vs Degree of Multiprogramming

The relationship between CPU utilization and the number of active processes follows a distinctive curve:

```text
CPU
Utilization
  |
  |              * * *
  |           *         *    ← Thrashing point
  |         *              *
  |       *                   *
  |      *                       *
  |    *                            *
  |   *                                *
  |  *                                    *
  | *                                        *
  |*                                            *
  +-------------------------------------------------> Degree of
                                                     Multiprogramming

     |<--- Useful region --->|<--- Thrashing --->|
```

To the left of the peak, adding more processes keeps the CPU busier because there is always a ready process when another blocks on I/O. Beyond the peak, adding more processes steals frames from existing ones, causing excessive paging. CPU utilization **plummets** even as the number of processes increases.

| Metric                       | Before Thrashing | During Thrashing |
| ---------------------------- | ---------------- | ---------------- |
| CPU utilization              | 70–95 %          | 5–20 %           |
| Page-fault rate              | Low (normal)     | Extremely high   |
| Disk (swap) utilization      | Moderate         | ~100 %           |
| Effective memory access time | ~100–200 ns      | Milliseconds     |
| System throughput            | High             | Near zero        |

---

## The Locality Model

To understand thrashing prevention, we must first understand **locality of reference** — the empirical observation that programs do not access memory uniformly.

> **Locality Principle:** During any phase of execution, a process tends to reference a relatively small, well-defined set of pages. This set changes gradually over time.

### Types of Locality

| Type                  | Definition                                                         | Example                    |
| --------------------- | ------------------------------------------------------------------ | -------------------------- |
| **Temporal locality** | A page accessed recently is likely to be accessed again soon       | A loop counter variable    |
| **Spatial locality**  | Pages near a recently accessed page are likely to be accessed soon | Sequential array traversal |
| **Branch locality**   | After a branch, the same path tends to be taken repeatedly         | A loop branch condition    |

### Visualizing Locality

Consider a program that initializes an array, sorts it, then searches it:

```text
Pages
Referenced
  |
  |  ****                                   ← Phase 1: init (pages 5–8)
  |  ****
  |       ******                            ← Phase 2: sort (pages 3–8)
  |       ******
  |              ***                        ← Phase 3: search (pages 1–3)
  |              ***
  +---------------------------------------------> Time
      Phase 1    Phase 2      Phase 3

  Locality 1   Locality 2   Locality 3
  {5,6,7,8}    {3,4,5,6,7,8} {1,2,3}
```

During each phase, the process accesses a **locality** — a cluster of pages. If the OS provides enough frames to hold the current locality, page faults are rare. If not, the process thrashes.

> [!NOTE]
> Localities overlap and shift over time. A process does not jump instantly from one locality to another — there are transition periods where the working set grows temporarily.

---

## Working Set Model

The **Working Set Model**, proposed by Peter Denning in 1968, formalizes the locality concept into a practical memory management strategy.

> "The working set of a process at time $t$ is the set of pages referenced during the most recent $\Delta$ memory accesses."
> — Peter Denning, _The Working Set Model for Program Behavior_ (1968)

### Formal Definition

Given a page reference string and a **working set window** $\Delta$:

$$WS(t, \Delta) = \{ \text{pages referenced in the interval } (t - \Delta, t] \}$$

The **working set size** of process $P_i$ at time $t$ is:

$$WSS_i(t) = |WS_i(t, \Delta)|$$

The **total frame demand** across all processes is:

$$D = \sum_{i=1}^{n} WSS_i$$

where $n$ is the number of active processes and $m$ is the total number of available frames.

| Condition  | Interpretation                        | Action                                        |
| ---------- | ------------------------------------- | --------------------------------------------- |
| $D \leq m$ | Enough frames for all working sets    | System operates normally                      |
| $D > m$    | Total demand exceeds available memory | Thrashing will occur — must suspend a process |
| $D \ll m$  | Frames significantly exceed demand    | Can increase multiprogramming                 |

### Choosing $\Delta$

The window parameter $\Delta$ is critical:

| $\Delta$ Value | Effect                                                                |
| -------------- | --------------------------------------------------------------------- |
| Too small      | Working set does not capture the full locality; page faults increase  |
| Too large      | Working set includes pages from old localities; over-allocates memory |
| Ideal          | Matches the size of the current locality                              |

In practice, $\Delta$ is typically set to values between **10,000** and **100,000** memory references.

### Worked Example

Consider the page reference string below with $\Delta = 10$:

```text
Reference string:  2 6 1 5 7 7 7 7 5 1 | 6 2 3 4 1 2 3 4 4 4
                   ←───── window ──────→|
                   t = 10                  t = 20
```

**At time $t = 10$** (looking back 10 references):

Pages referenced: {2, 6, 1, 5, 7} → $WSS = 5$

**At time $t = 20$** (looking back 10 references):

Pages referenced: {6, 2, 3, 4, 1} → $WSS = 5$

Now suppose we have three processes:

| Process       | $WSS_i$ | Explanation                       |
| ------------- | ------- | --------------------------------- |
| $P_1$         | 5       | As computed above at $t = 10$     |
| $P_2$         | 3       | References only pages {8, 9, 10}  |
| $P_3$         | 4       | References pages {11, 12, 13, 14} |
| **Total** $D$ | **12**  | $5 + 3 + 4 = 12$                  |

If total available frames $m = 15$, then $D = 12 \leq 15$ — no thrashing. We even have 3 spare frames.

If $m = 10$, then $D = 12 > 10$ — the OS must **suspend** one process to prevent thrashing.

### Working Set Over Time — ASCII Diagram

```text
WSS
  8 |
  7 |    *****
  6 |   *     **
  5 |  *        ****
  4 | *             ***
  3 |*                 *****
  2 |                       ****
  1 |                           **
  0 +---------------------------------------> Time
       Phase A    Phase B    Phase C

    Locality     Locality    Locality
    shift        shift       shift
    (WSS grows   (WSS        (WSS
     temporarily) stabilizes)  shrinks)
```

> [!IMPORTANT]
> The working set model requires the OS to track which pages each process accesses within the window $\Delta$. Exact tracking is expensive — most implementations approximate it using **interval timer interrupts** combined with **reference bits**.

### Approximating the Working Set

A common approximation uses a fixed timer interval $\tau$ and the reference bit:

```c
// Pseudocode: Working set approximation using reference bits
// Called every timer interrupt (e.g., every 5000 references)

#define HISTORY_BITS 8  // Track 8 intervals

typedef struct {
    uint8_t history;    // Bit history of reference bits
    int     in_ws;      // Is this page in the working set?
} PageEntry;

void timer_interrupt(PageEntry page_table[], int num_pages) {
    for (int i = 0; i < num_pages; i++) {
        // Shift history right; place current reference bit at MSB
        page_table[i].history >>= 1;
        if (get_reference_bit(i)) {
            page_table[i].history |= 0x80;  // Set MSB
            clear_reference_bit(i);
        }
        // Page is in working set if any history bit is set
        page_table[i].in_ws = (page_table[i].history != 0);
    }
}
```

Each bit in `history` represents whether the page was accessed during one timer interval. If **any** bit is set, the page is considered part of the working set. This gives an approximation of $\Delta = \text{HISTORY\_BITS} \times \tau$.

---

## Page-Fault Frequency (PFF) Strategy

The **Page-Fault Frequency** strategy is a more direct approach to thrashing prevention. Instead of estimating the working set, it monitors the actual page-fault rate of each process.

### How PFF Works

| Situation                        | Page-Fault Rate                      | Action                                    |
| -------------------------------- | ------------------------------------ | ----------------------------------------- |
| Rate > upper bound               | Too high — process needs more memory | **Allocate** more frames to this process  |
| Lower bound ≤ Rate ≤ Upper bound | Acceptable                           | No action needed                          |
| Rate < lower bound               | Too low — process has excess memory  | **Reclaim** some frames from this process |

```text
Page-Fault
Rate
  |
  |  *
  |   *                        Upper Bound
  |----*-----------------------=============------
  |     *                  *
  |      *               *
  |       *             *      ← Acceptable zone
  |        **         **
  |----------**-----**-=============-------------
  |            *****               Lower Bound
  |
  +------------------------------------------------> Frames Allocated
         Few                              Many
         frames                           frames
```

> [!TIP]
> PFF is simpler to implement than the full working set model because it only requires counting page faults over time intervals — no need to track individual page references within a window.

### PFF Implementation in Python

```python
class PFFController:
    """Page-Fault Frequency controller for a single process."""

    def __init__(self, upper_bound=0.05, lower_bound=0.01, window=1000):
        self.upper_bound = upper_bound  # Max acceptable fault rate
        self.lower_bound = lower_bound  # Min acceptable fault rate
        self.window = window            # Measurement window (references)
        self.faults_in_window = 0
        self.refs_in_window = 0

    def record_reference(self, is_fault: bool) -> str:
        """Record a memory reference. Returns action to take."""
        self.refs_in_window += 1
        if is_fault:
            self.faults_in_window += 1

        if self.refs_in_window >= self.window:
            rate = self.faults_in_window / self.refs_in_window
            action = self._decide(rate)
            self._reset()
            return action
        return "none"

    def _decide(self, rate: float) -> str:
        if rate > self.upper_bound:
            return "allocate_more_frames"
        elif rate < self.lower_bound:
            return "reclaim_frames"
        return "no_change"

    def _reset(self):
        self.faults_in_window = 0
        self.refs_in_window = 0


# Simulation
controller = PFFController(upper_bound=0.04, lower_bound=0.01, window=500)

# Simulate 500 references with 30 faults (rate = 0.06 > 0.04)
for i in range(500):
    is_fault = (i % 17 == 0)  # ~30 faults in 500 refs
    action = controller.record_reference(is_fault)
    if action != "none":
        print(f"After {500} refs: fault rate = {30/500:.3f}, action = {action}")
        # Output: After 500 refs: fault rate = 0.060, action = allocate_more_frames
```

### Working Set vs PFF Comparison

| Feature           | Working Set Model                        | PFF Strategy                             |
| ----------------- | ---------------------------------------- | ---------------------------------------- |
| What it tracks    | Pages referenced in window $\Delta$      | Page-fault rate over time                |
| Overhead          | High (per-page tracking)                 | Low (just count faults)                  |
| Accuracy          | More precise                             | Reactive, not predictive                 |
| Tuning parameters | Window size $\Delta$                     | Upper and lower bounds                   |
| Response time     | Immediate (knows which pages are needed) | Delayed (waits for fault rate to change) |
| Implementation    | Complex (reference bit approximation)    | Simple (counters)                        |

---

## Frame Allocation Algorithms

When multiple processes share physical memory, the OS must decide **how many frames** each process receives.

### Equal Allocation

The simplest strategy — divide frames equally:

$$\text{Frames per process} = \left\lfloor \frac{m}{n} \right\rfloor$$

where $m$ = total frames and $n$ = number of processes.

**Example:** $m = 120$ frames, $n = 5$ processes → each gets $\lfloor 120/5 \rfloor = 24$ frames.

| Pros                  | Cons                                             |
| --------------------- | ------------------------------------------------ |
| Simple to implement   | Ignores process size differences                 |
| Fair in a basic sense | A 10 KB process gets the same as a 10 GB process |
| No starvation         | Wastes frames on small processes                 |

### Proportional Allocation

Allocate frames proportional to each process's virtual address space size:

$$a_i = \frac{s_i}{\sum_{j=1}^{n} s_j} \times m$$

where $s_i$ is the size (in pages) of process $P_i$.

**Example:** $m = 120$ frames, two processes: $s_1 = 40$ pages, $s_2 = 160$ pages.

$$a_1 = \frac{40}{40 + 160} \times 120 = \frac{40}{200} \times 120 = 24 \text{ frames}$$

$$a_2 = \frac{160}{200} \times 120 = 96 \text{ frames}$$

### Priority Allocation

Combines proportional allocation with process priority:

$$a_i = \frac{p_i}{\sum_{j=1}^{n} p_j} \times m$$

where $p_i$ is a weight derived from both the process's size and its priority level.

| Allocation Scheme | Basis           | Fairness              | Efficiency |
| ----------------- | --------------- | --------------------- | ---------- |
| Equal             | None            | High                  | Low        |
| Proportional      | Process size    | Medium                | Medium     |
| Priority          | Size + priority | Low (priority-biased) | High       |

### C Example: Proportional Allocation Calculator

```c
#include <stdio.h>

#define MAX_PROC 10

typedef struct {
    int pid;
    int size;       // Virtual memory size in pages
    int allocated;  // Frames allocated
} Process;

void proportional_allocate(Process procs[], int n, int total_frames) {
    int total_size = 0;
    for (int i = 0; i < n; i++)
        total_size += procs[i].size;

    int allocated_so_far = 0;
    for (int i = 0; i < n; i++) {
        if (i == n - 1) {
            // Last process gets remaining frames (avoid rounding error)
            procs[i].allocated = total_frames - allocated_so_far;
        } else {
            procs[i].allocated = (int)((double)procs[i].size / total_size * total_frames);
            allocated_so_far += procs[i].allocated;
        }
    }
}

int main() {
    Process procs[] = {
        {1, 40, 0},
        {2, 160, 0},
        {3, 80, 0}
    };
    int n = 3, total_frames = 120;

    proportional_allocate(procs, n, total_frames);

    printf("PID | Size | Allocated Frames\n");
    printf("----|------|------------------\n");
    for (int i = 0; i < n; i++)
        printf("  %d | %4d | %d\n", procs[i].pid, procs[i].size, procs[i].allocated);

    return 0;
}
// Output:
// PID | Size | Allocated Frames
// ----|------|------------------
//   1 |   40 | 17
//   2 |  160 | 68
//   3 |   80 | 35
```

---

## Global vs Local Replacement

When a page fault occurs and all allocated frames are in use, which frame should be replaced?

| Aspect            | Global Replacement                           | Local Replacement                             |
| ----------------- | -------------------------------------------- | --------------------------------------------- |
| Replacement scope | Any frame in system (from any process)       | Only frames belonging to the faulting process |
| Performance       | Generally better throughput                  | More predictable per-process performance      |
| Fairness          | Low — a process can steal frames from others | High — each process manages its own frames    |
| Thrashing risk    | Higher — one process can starve others       | Lower — thrashing is isolated                 |
| Implementation    | Simpler                                      | Requires per-process frame tracking           |
| Used by           | Linux (default), Windows (partially)         | VMS, some real-time systems                   |

```text
Global Replacement:
┌─────────────────────────────────────────────┐
│            Shared Frame Pool                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│  │ P1 │ │ P2 │ │ P1 │ │ P3 │ │ P2 │ │ P1 ││
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘│
│  Any process can replace any frame          │
└─────────────────────────────────────────────┘

Local Replacement:
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  P1 Frames   │ │  P2 Frames   │ │  P3 Frames   │
│ ┌────┐┌────┐ │ │ ┌────┐┌────┐ │ │ ┌────┐┌────┐ │
│ │ P1 ││ P1 │ │ │ │ P2 ││ P2 │ │ │ │ P3 ││ P3 │ │
│ └────┘└────┘ │ │ └────┘└────┘ │ │ └────┘└────┘ │
│ Isolated     │ │ Isolated     │ │ Isolated     │
└──────────────┘ └──────────────┘ └──────────────┘
```

> [!NOTE]
> Most modern general-purpose operating systems use **global replacement** because it allows the system to dynamically redistribute memory to where it is most needed. However, they combine it with working-set-like heuristics to prevent any single process from monopolizing memory.

---

## Prepaging

**Prepaging** (also called **prefetching**) is the practice of loading pages into memory _before_ they are actually referenced, anticipating future needs.

| Strategy             | Description                                          | When Useful                    |
| -------------------- | ---------------------------------------------------- | ------------------------------ |
| Sequential prefetch  | Load the next $k$ pages after a fault                | Array traversal, file reads    |
| Working set prefetch | On process resume, load its entire saved working set | Process swap-in                |
| Predictive prefetch  | Use past access patterns to predict future accesses  | Machine-learning-based systems |

The cost-benefit analysis of prepaging:

$$\text{Net benefit} = s \times p \times T_{\text{fault}} - (1 - s \times p) \times T_{\text{transfer}}$$

where:

- $s$ = fraction of prepaged pages actually used
- $p$ = number of pages prepaged
- $T_{\text{fault}}$ = time saved per avoided page fault (~10 ms)
- $T_{\text{transfer}}$ = time to transfer one page (~0.1 ms)

If $s$ is close to 1 (most prepaged pages are used), prepaging is highly beneficial. If $s$ is small, it wastes I/O bandwidth and memory.

```python
def should_prepage(pages_to_prepage: int, use_probability: float,
                   fault_cost_ms: float = 10.0, transfer_cost_ms: float = 0.1) -> dict:
    """Evaluate whether prepaging is cost-effective."""
    faults_avoided = pages_to_prepage * use_probability
    time_saved = faults_avoided * fault_cost_ms
    time_spent = pages_to_prepage * transfer_cost_ms
    net_benefit = time_saved - time_spent

    return {
        "pages": pages_to_prepage,
        "use_probability": use_probability,
        "time_saved_ms": round(time_saved, 2),
        "time_spent_ms": round(time_spent, 2),
        "net_benefit_ms": round(net_benefit, 2),
        "recommended": net_benefit > 0
    }

# Examples
print(should_prepage(10, 0.8))
# {'pages': 10, 'use_probability': 0.8, 'time_saved_ms': 80.0,
#  'time_spent_ms': 1.0, 'net_benefit_ms': 79.0, 'recommended': True}

print(should_prepage(10, 0.05))
# {'pages': 10, 'use_probability': 0.05, 'time_saved_ms': 5.0,
#  'time_spent_ms': 1.0, 'net_benefit_ms': 4.0, 'recommended': True}

print(should_prepage(100, 0.001))
# {'pages': 100, 'use_probability': 0.001, 'time_saved_ms': 1.0,
#  'time_spent_ms': 10.0, 'net_benefit_ms': -9.0, 'recommended': False}
```

---

## Prevention Strategies — Comparison

| Strategy          | Mechanism                          | Overhead | Effectiveness             | Granularity |
| ----------------- | ---------------------------------- | -------- | ------------------------- | ----------- |
| Working Set Model | Track pages in window $\Delta$     | High     | Excellent (proactive)     | Per-process |
| PFF               | Monitor page-fault rate            | Low      | Good (reactive)           | Per-process |
| Local Replacement | Restrict replacement to own frames | Medium   | Good (isolates thrashing) | Per-process |
| Load Control      | Suspend processes when $D > m$     | Low      | Excellent                 | System-wide |
| Prepaging         | Prefetch likely-needed pages       | Medium   | Moderate                  | Per-process |
| Swapping          | Swap entire processes out          | High     | Last resort               | Per-process |

```text
Prevention Strategy Decision Flow:

                   ┌───────────────────┐
                   │ Is total demand    │
                   │ D > m (frames)?   │
                   └─────────┬─────────┘
                        Yes  │  No
                   ┌─────────┴─────────┐
                   │                   │
              ┌────▼────┐        ┌─────▼────┐
              │ Suspend  │        │ Monitor  │
              │ lowest-  │        │ PFF per  │
              │ priority │        │ process  │
              │ process  │        └─────┬────┘
              └────┬─────┘              │
                   │            ┌───────┴────────┐
                   │       High │ fault rate      │ Low fault rate
                   │       ┌────▼────┐      ┌─────▼─────┐
                   │       │Allocate │      │ Reclaim   │
                   │       │more     │      │ excess    │
                   │       │frames   │      │ frames    │
                   │       └─────────┘      └───────────┘
                   │
              Recalculate D
```

---

## Real-World Examples

### Linux OOM Killer

When Linux detects severe memory pressure and swapping cannot resolve it, the **Out-Of-Memory (OOM) Killer** selects and terminates a process to free memory.

```c
// Simplified logic of Linux OOM killer scoring
// (based on kernel's oom_badness() function)

long oom_badness(struct task_struct *p, unsigned long totalpages) {
    long points;

    // Start with the process's resident set size (RSS)
    points = get_mm_rss(p->mm);  // pages currently in memory

    // Adjust for child processes' memory
    points += get_mm_rss(p->mm) / 2;  // children contribute half

    // Adjust by user-set oom_score_adj (-1000 to +1000)
    // -1000 = never kill, +1000 = always kill first
    long adj = p->signal->oom_score_adj;
    if (adj == OOM_SCORE_ADJ_MIN)  // -1000
        return 0;  // Protected — never kill

    // Scale adjustment relative to total memory
    points += adj * totalpages / 1000;

    return max(points, 1L);
}
```

| OOM Score Adj | Meaning                | Example Process          |
| ------------- | ---------------------- | ------------------------ |
| -1000         | Never kill (protected) | `sshd`, database servers |
| 0             | Default                | Normal user processes    |
| +1000         | Kill first             | Non-critical batch jobs  |

> [!TIP]
> You can check a process's OOM score on Linux with:
>
> ```
> cat /proc/<PID>/oom_score
> cat /proc/<PID>/oom_score_adj
> ```
>
> And protect a critical process:
>
> ```
> echo -1000 > /proc/<PID>/oom_score_adj
> ```

### Memory Pressure on macOS and Windows

| OS          | Mechanism                                  | How It Works                                                             |
| ----------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| **Linux**   | OOM Killer + `cgroups` memory limits       | Kills processes; `cgroups` enforce per-group memory caps                 |
| **macOS**   | Memory pressure notifications + `jetsam`   | Apps receive `didReceiveMemoryWarning`; `jetsam` kills low-priority apps |
| **Windows** | Working set trimming + page file expansion | Trims working sets aggressively; enlarges page file before OOM           |

### Monitoring Memory Pressure

```python
import subprocess
import platform

def check_memory_pressure():
    """Check system memory pressure (macOS example)."""
    if platform.system() != "Darwin":
        print("This example is macOS-specific.")
        return

    result = subprocess.run(
        ["memory_pressure"],
        capture_output=True, text=True, timeout=5
    )
    output = result.stdout
    # Typical output includes:
    # "The system has X bytes of free memory"
    # "System-wide memory free percentage: Y%"
    for line in output.split("\n"):
        if "free percentage" in line.lower() or "pressure" in line.lower():
            print(line.strip())

# On Linux, check /proc/meminfo and /proc/pressure/memory
def check_linux_pressure():
    """Check memory pressure on Linux using PSI."""
    try:
        with open("/proc/pressure/memory") as f:
            print("Memory Pressure (PSI):")
            for line in f:
                print(f"  {line.strip()}")
                # Output example:
                # some avg10=0.00 avg60=0.12 avg300=0.45 total=123456
                # full avg10=0.00 avg60=0.05 avg300=0.20 total=78901
    except FileNotFoundError:
        print("PSI not available on this kernel.")
```

---

## Try It Yourself

**Exercise 1: Working Set Calculation**

Given the page reference string below and $\Delta = 8$, compute the working set and $WSS$ at time $t = 12$:

```text
t:    1  2  3  4  5  6  7  8  9  10  11  12  13  14  15
Ref:  3  4  3  7  4  3  3  8  1   4   8   1   5   6   2
```

:::details Solution
At $t = 12$, we look back $\Delta = 8$ references (from $t = 5$ to $t = 12$):

```text
t:    5  6  7  8  9  10  11  12
Ref:  4  3  3  8  1   4   8   1
```

Pages referenced: {4, 3, 8, 1}

$$WSS = |WS(12, 8)| = |\{1, 3, 4, 8\}| = 4$$

The process needs **at least 4 frames** to hold its current working set without thrashing.
:::

---

**Exercise 2: Frame Allocation**

Three processes share a system with $m = 60$ frames. Their sizes are:

- $P_1$: 20 pages
- $P_2$: 50 pages
- $P_3$: 30 pages

(a) Calculate the equal allocation for each process.
(b) Calculate the proportional allocation for each process.
(c) If the working set sizes are $WSS_1 = 15$, $WSS_2 = 30$, $WSS_3 = 20$, will thrashing occur?

:::details Solution
**(a) Equal allocation:**

$$\text{Frames per process} = \left\lfloor \frac{60}{3} \right\rfloor = 20$$

Each process gets 20 frames.

**(b) Proportional allocation:**

Total size $= 20 + 50 + 30 = 100$ pages.

$$a_1 = \frac{20}{100} \times 60 = 12 \text{ frames}$$
$$a_2 = \frac{50}{100} \times 60 = 30 \text{ frames}$$
$$a_3 = \frac{30}{100} \times 60 = 18 \text{ frames}$$

**(c) Thrashing check:**

$$D = WSS_1 + WSS_2 + WSS_3 = 15 + 30 + 20 = 65$$

Since $D = 65 > m = 60$, **yes, thrashing will occur**. The OS should suspend one process. Suspending $P_3$ would give $D = 15 + 30 = 45 \leq 60$, resolving the issue.
:::

---

**Exercise 3: PFF Decision**

A process running on a system with a PFF controller has the following parameters:

- Upper bound: 4 faults per 1000 references
- Lower bound: 1 fault per 1000 references

In the last 1000 references, the process experienced 6 page faults. What action should the OS take? What if it had experienced 0 faults?

:::details Solution
**Case 1: 6 faults per 1000 references**

Fault rate $= 6 / 1000 = 0.006 = 0.6\%$

Upper bound $= 4 / 1000 = 0.4\%$

Since $0.6\% > 0.4\%$, the fault rate **exceeds the upper bound**.

**Action:** Allocate more frames to this process.

**Case 2: 0 faults per 1000 references**

Fault rate $= 0 / 1000 = 0\%$

Lower bound $= 1 / 1000 = 0.1\%$

Since $0\% < 0.1\%$, the fault rate is **below the lower bound**.

**Action:** Reclaim some frames from this process and give them to processes that need them more.
:::

---

## Key Takeaways

- **Thrashing** occurs when the total page demand of all active processes exceeds available physical memory, causing the system to spend more time paging than executing.
- Thrashing creates a **vicious cycle**: low CPU utilization → OS adds more processes → more page faults → even lower CPU utilization.
- The **Locality Model** explains why programs access a small set of pages during any execution phase — temporal and spatial locality are fundamental to efficient memory management.
- The **Working Set Model** defines $WS(t, \Delta)$ as the set of pages referenced in the last $\Delta$ accesses; if total demand $D = \sum WSS_i > m$, thrashing is imminent.
- The **Page-Fault Frequency (PFF)** strategy is a simpler, reactive alternative: monitor fault rates and adjust frame allocation when rates cross upper or lower thresholds.
- **Frame allocation** strategies range from equal (simple but wasteful) to proportional (size-based) to priority-based (accounts for process importance).
- **Global replacement** offers better overall throughput but can cause one process to starve others; **local replacement** isolates thrashing but may underutilize memory.
- **Prepaging** can reduce fault rates significantly if the prediction accuracy is high, but wastes I/O if most prefetched pages are never used.
- Real systems use **multiple strategies together**: Linux combines global replacement with the OOM killer; macOS uses memory pressure notifications and the `jetsam` daemon.
- The key design insight: **know how much memory each process truly needs** (its working set), and ensure the system never commits to more processes than it can support.
