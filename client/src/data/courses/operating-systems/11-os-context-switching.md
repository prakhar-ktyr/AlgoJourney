---
title: Context Switching
---

# Context Switching

The ability to run multiple processes on a single CPU is the foundation of modern multitasking operating systems. The mechanism that makes this possible is the **context switch** — the process of saving the state of one process and loading the state of another so the CPU can seamlessly switch between them.

A context switch is like a surgeon being called away from one operation to handle an emergency. Before leaving, they must meticulously document exactly where they are in the procedure (save context), so they — or a colleague — can continue seamlessly when they return (restore context).

---

## What Is a Context Switch?

> A **context switch** is the mechanism by which the operating system saves the CPU state (context) of the currently running process and restores the previously saved state of a different process, allowing multiple processes to share a single CPU.

The **context** of a process includes everything the CPU needs to resume execution:

| Context Component             | Description                          | Storage Location              |
| ----------------------------- | ------------------------------------ | ----------------------------- |
| **Program Counter (PC/RIP)**  | Address of next instruction          | PCB → `cpu_context.rip`       |
| **General-Purpose Registers** | RAX, RBX, RCX, RDX, RSI, RDI, R8-R15 | PCB → `cpu_context.general[]` |
| **Stack Pointer (RSP)**       | Top of the current stack             | PCB → `cpu_context.rsp`       |
| **Base Pointer (RBP)**        | Current stack frame base             | PCB → `cpu_context.rbp`       |
| **Flags Register (RFLAGS)**   | Status flags (zero, carry, overflow) | PCB → `cpu_context.rflags`    |
| **Page Table Base (CR3)**     | Points to process's page table       | PCB → `cpu_context.cr3`       |
| **Floating Point State**      | FPU/SSE/AVX registers                | PCB → extended state area     |
| **Kernel Stack Pointer**      | Pointer to kernel-mode stack         | PCB → `thread.sp`             |

---

## Step-by-Step Context Switch Walkthrough

Let's trace a complete context switch from Process P₁ to Process P₂.

### Timeline Diagram

```text
          P₁ (Running)                Kernel                  P₂ (Ready)
          ────────────               ────────                 ──────────
Time
 │   ┌──────────────────┐
 │   │ Executing user   │
 │   │ code:            │
 │   │   x = a + b;     │
 │   │   y = x * 2;     │
 │   └────────┬─────────┘
 │            │
 │            │ ←── Timer interrupt fires!
 │            ▼
 │   ┌──────────────────────────────────────────┐
 │   │ STEP 1: Hardware saves minimal state     │
 │   │  → Push RIP, CS, RFLAGS, RSP, SS        │
 │   │    onto P₁'s kernel stack                │
 │   ├──────────────────────────────────────────┤
 │   │ STEP 2: Enter interrupt handler          │
 │   │  → Switch to kernel mode (ring 0)        │
 │   │  → Jump to timer interrupt handler       │
 │   ├──────────────────────────────────────────┤
 │   │ STEP 3: Save P₁'s full CPU context      │
 │   │  → Save all general-purpose registers    │
 │   │    (RAX, RBX, ..., R15) into PCB₁        │
 │   │  → Save FPU/SSE state if needed          │
 │   │  → Record PC in PCB₁                     │
 │   ├──────────────────────────────────────────┤
 │   │ STEP 4: Update P₁'s PCB                 │
 │   │  → PCB₁.state = READY                   │
 │   │  → Move PCB₁ to ready queue             │
 │   ├──────────────────────────────────────────┤
 │   │ STEP 5: Invoke the scheduler             │
 │   │  → Run scheduling algorithm              │
 │   │  → Select P₂ from ready queue            │
 │   ├──────────────────────────────────────────┤
 │   │ STEP 6: Update P₂'s PCB                 │
 │   │  → PCB₂.state = RUNNING                 │
 │   │  → Remove P₂ from ready queue            │
 │   ├──────────────────────────────────────────┤
 │   │ STEP 7: Restore P₂'s context            │
 │   │  → Load CR3 from PCB₂ (switch page table)│
 │   │  → Load all registers from PCB₂          │
 │   │  → Load PC from PCB₂                     │
 │   ├──────────────────────────────────────────┤
 │   │ STEP 8: Return from interrupt            │
 │   │  → IRET instruction                      │
 │   │  → Switch back to user mode               │
 │   │  → Jump to P₂'s saved PC                 │
 │   └──────────────────────────────────────────┘
 │                                         │
 │                                         ▼
 │                                ┌──────────────────┐
 │                                │ P₂ resumes from  │
 │                                │ exactly where it │
 │                                │ left off:        │
 │                                │   z = c - d;     │
 │                                │   w = z / 3;     │
 │                                └──────────────────┘
 ▼
```

### Summary of Steps

| Step                  | Action                                     | Who Does It              | Time Cost   |
| --------------------- | ------------------------------------------ | ------------------------ | ----------- |
| 1                     | Save minimal hardware state                | CPU hardware (automatic) | ~10 ns      |
| 2                     | Switch to kernel mode                      | CPU hardware             | ~5 ns       |
| 3                     | Save full register set to PCB₁             | OS kernel software       | ~100-500 ns |
| 4                     | Update PCB₁ state and queue                | OS kernel software       | ~50 ns      |
| 5                     | Run scheduler to pick next process         | OS kernel software       | ~100-500 ns |
| 6                     | Update PCB₂ state                          | OS kernel software       | ~50 ns      |
| 7                     | Restore registers and page table from PCB₂ | OS kernel software       | ~100-500 ns |
| 8                     | Return to user mode (IRET)                 | CPU hardware             | ~10 ns      |
| **Total direct cost** |                                            |                          | **~1-5 μs** |

---

## What Triggers Context Switches

Context switches don't happen randomly — they are triggered by specific events.

### Trigger Categories

```text
Context Switch Triggers:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────────────┐   ┌──────────────────────┐           │
│  │  INVOLUNTARY          │   │  VOLUNTARY            │           │
│  │  (Process has no      │   │  (Process initiates   │           │
│  │   choice)             │   │   the switch)         │           │
│  │                       │   │                       │           │
│  │  • Timer interrupt    │   │  • System call        │           │
│  │    (quantum expired)  │   │    (read, write, etc.)│           │
│  │  • Higher-priority    │   │  • sleep() / yield()  │           │
│  │    process arrives    │   │  • wait() for child   │           │
│  │  • Hardware interrupt │   │  • Blocking I/O       │           │
│  │    (I/O completion)   │   │  • Mutex/semaphore    │           │
│  │  • Page fault         │   │    wait               │           │
│  └──────────────────────┘   └──────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Trigger Table

| Trigger              | Type        | Description                                                | Example                              |
| -------------------- | ----------- | ---------------------------------------------------------- | ------------------------------------ |
| **Timer interrupt**  | Involuntary | Time quantum expired in preemptive scheduling              | Process used 10ms, quantum is 10ms   |
| **I/O request**      | Voluntary   | Process needs data from disk/network                       | `read(fd, buf, size)`                |
| **I/O completion**   | Involuntary | Device finishes, interrupted process may change            | Disk DMA transfer completes          |
| **System call**      | Voluntary   | Process requests OS service                                | `fork()`, `exec()`, `open()`         |
| **Signal delivery**  | Involuntary | Signal arrives for a different process                     | `SIGCHLD` to parent                  |
| **Higher priority**  | Involuntary | Preemptive scheduler detects higher-priority ready process | Real-time process becomes ready      |
| **Page fault**       | Involuntary | Required page not in memory                                | Access to swapped-out page           |
| **`sched_yield()`**  | Voluntary   | Process explicitly gives up the CPU                        | Cooperative multitasking             |
| **Mutex contention** | Voluntary   | Process blocks waiting for a lock                          | `pthread_mutex_lock()` on held mutex |

---

## Voluntary vs Involuntary Context Switches

Understanding the distinction between voluntary and involuntary switches is important for performance analysis.

| Property          | Voluntary                         | Involuntary                   |
| ----------------- | --------------------------------- | ----------------------------- |
| **Initiated by**  | The process itself                | The OS / hardware             |
| **Cause**         | Process blocks (I/O, sleep, lock) | Preemption (timer, priority)  |
| **Process state** | Running → Waiting                 | Running → Ready               |
| **Typical of**    | I/O-bound processes               | CPU-bound processes           |
| **Implication**   | Process needs a resource          | Process is using too much CPU |
| **Linux counter** | `voluntary_ctxt_switches`         | `nonvoluntary_ctxt_switches`  |

### Checking Context Switches in Linux

```bash
# View context switch counts for a specific process
$ cat /proc/<PID>/status | grep ctxt
voluntary_ctxt_switches:        1523
nonvoluntary_ctxt_switches:     47

# System-wide context switch rate
$ vmstat 1
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs  us sy id wa
 2  0      0 245612  98404 1024588    0    0     4    12  156  312  5  2 93  0
                                                          ^^^  ^^^
                                                   interrupts  context switches
                                                   per second  per second

# Per-process context switches using pidstat
$ pidstat -w 1
Average:      UID       PID   cswch/s nvcswch/s  Command
Average:     1000      1234     45.00      3.00  python3
Average:     1000      5678    120.00      1.00  firefox
```

> [!TIP]
> A process with many **voluntary** context switches is I/O-bound (frequently waiting for data). A process with many **involuntary** context switches is CPU-bound (being forced off the CPU by the scheduler).

---

## Context Switch Overhead

Context switches are necessary but **expensive**. The cost goes beyond just saving and restoring registers.

### Direct Costs

| Cost Component         | Time         | Description                      |
| ---------------------- | ------------ | -------------------------------- |
| Save/restore registers | ~200-500 ns  | Copy 16+ registers to/from PCB   |
| Scheduler execution    | ~100-500 ns  | Run scheduling algorithm         |
| TLB flush              | ~100-1000 ns | Invalidate address translations  |
| Pipeline flush         | ~50-100 ns   | Discard in-flight instructions   |
| Mode switches          | ~50-100 ns   | User → Kernel → User transitions |
| **Total direct**       | **~1-5 μs**  |                                  |

### Indirect Costs (The Hidden Tax)

The **indirect costs** of context switches are often much larger than the direct costs:

```text
Cache Pollution Effect:

Before context switch:
┌─────────────────────────────────────────────┐
│            L1/L2/L3 Cache                    │
│  [P₁ data][P₁ data][P₁ code][P₁ data]      │  ← Cache is "warm" for P₁
│  Cache hit rate: 95%                         │
└─────────────────────────────────────────────┘

After context switch to P₂:
┌─────────────────────────────────────────────┐
│            L1/L2/L3 Cache                    │
│  [P₁ data][P₁ data][P₁ code][P₁ data]      │  ← P₂'s data NOT in cache!
│  Cache hit rate: 20% (cold cache)            │
└─────────────────────────────────────────────┘

P₂ must gradually fill cache with its own data:
┌─────────────────────────────────────────────┐
│            L1/L2/L3 Cache                    │
│  [P₂ data][P₂ data][P₂ code][P₁ data]      │  ← Mixed, improving
│  Cache hit rate: 60% (warming up)            │
└─────────────────────────────────────────────┘

Eventually:
┌─────────────────────────────────────────────┐
│            L1/L2/L3 Cache                    │
│  [P₂ data][P₂ data][P₂ code][P₂ data]      │  ← Cache warm for P₂
│  Cache hit rate: 95%                         │
└─────────────────────────────────────────────┘
```

### TLB Flush Impact

The **Translation Lookaside Buffer (TLB)** caches virtual-to-physical address mappings. When switching processes, the TLB must be flushed because each process has its own page table.

```text
TLB Before Context Switch (P₁ active):
┌──────────────────────────────────────────────┐
│ Virtual Page │ Physical Frame │ Valid │ PID   │
├──────────────┼────────────────┼───────┼───────┤
│ 0x00401      │ 0x1A3          │  ✓    │ P₁    │
│ 0x00402      │ 0x2F1          │  ✓    │ P₁    │
│ 0x7FFF5      │ 0x0B8          │  ✓    │ P₁    │
│ 0x00600      │ 0x3C2          │  ✓    │ P₁    │
└──────────────┴────────────────┴───────┴───────┘
All entries valid → Fast address translation

TLB After Context Switch (P₂ active, TLB flushed):
┌──────────────────────────────────────────────┐
│ Virtual Page │ Physical Frame │ Valid │ PID   │
├──────────────┼────────────────┼───────┼───────┤
│     —        │      —         │  ✗    │  —    │
│     —        │      —         │  ✗    │  —    │
│     —        │      —         │  ✗    │  —    │
│     —        │      —         │  ✗    │  —    │
└──────────────┴────────────────┴───────┴───────┘
All entries invalid → Every memory access causes a TLB miss!
```

> [!WARNING]
> TLB misses are expensive — each miss requires a **page table walk** that can take 10-100 CPU cycles. After a context switch, the process may experience hundreds of TLB misses as it "warms up" its TLB entries.

### Total Cost Summary

| Cost Type                          | Typical Time                      | Impact       |
| ---------------------------------- | --------------------------------- | ------------ |
| **Direct (register save/restore)** | 1-5 μs                            | Small, fixed |
| **TLB flush**                      | 10-100 μs of degraded performance | Medium       |
| **Cache pollution**                | 100-1000 μs of cold cache         | Large        |
| **Pipeline flush**                 | 10-50 ns                          | Small        |
| **Branch predictor pollution**     | Variable                          | Medium       |
| **Total effective cost**           | **~10-1000 μs**                   | Significant  |

---

## Hardware Support for Fast Context Switching

Modern CPUs provide hardware features to reduce context switch overhead.

| Hardware Feature             | Description                              | Benefit                                    |
| ---------------------------- | ---------------------------------------- | ------------------------------------------ |
| **Tagged TLB (ASID/PCID)**   | Each TLB entry tagged with process ID    | Eliminates TLB flush on switch             |
| **Hardware task switching**  | x86 TSS (Task State Segment)             | CPU saves/restores registers automatically |
| **Register windows** (SPARC) | Multiple register sets in hardware       | Switch registers instantly                 |
| **Shadow registers** (ARM)   | Banked registers for different modes     | Fast mode switching                        |
| **XSAVE/XRSTOR** (x86)       | Efficient save/restore of extended state | Fast FPU/SSE/AVX context                   |
| **Last Branch Record (LBR)** | Hardware tracks branch history           | Preserves prediction accuracy              |

### Tagged TLB (PCID on x86)

```text
Without PCID (Process Context ID):
  Context switch → Flush entire TLB → All translations lost

With PCID (Intel Haswell+):
  Each TLB entry has a PCID tag:
  ┌──────────┬──────────────┬────────────────┬───────┐
  │  PCID    │ Virtual Page │ Physical Frame │ Valid │
  ├──────────┼──────────────┼────────────────┼───────┤
  │  001     │ 0x00401      │ 0x1A3          │  ✓    │  ← P₁'s entry
  │  001     │ 0x00402      │ 0x2F1          │  ✓    │  ← P₁'s entry
  │  002     │ 0x00401      │ 0x5B7          │  ✓    │  ← P₂'s entry
  │  002     │ 0x00500      │ 0x8C1          │  ✓    │  ← P₂'s entry
  └──────────┴──────────────┴────────────────┴───────┘

  Context switch: Just change PCID from 001 to 002
  → P₂'s entries are already there! No TLB flush needed!
  → When switching back to P₁, its entries are still valid!
```

> [!NOTE]
> Linux enabled PCID support in kernel 4.14. This was especially important after the Meltdown/Spectre mitigations (KPTI), which would otherwise double the context switch overhead by requiring TLB flushes on every kernel entry/exit.

---

## Measuring Context Switch Time

### Experimental Approach

We can measure context switch time using a pipe-based ping-pong between two processes:

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <time.h>
#include <sys/wait.h>

#define NUM_ITERATIONS 100000

int main() {
    int pipe1[2], pipe2[2];  // Two pipes for bidirectional communication
    char byte = 'x';

    pipe(pipe1);  // Parent writes, child reads
    pipe(pipe2);  // Child writes, parent reads

    pid_t pid = fork();

    if (pid == 0) {
        // Child process: read from pipe1, write to pipe2
        close(pipe1[1]);
        close(pipe2[0]);

        for (int i = 0; i < NUM_ITERATIONS; i++) {
            read(pipe1[0], &byte, 1);   // Block until parent writes
            write(pipe2[1], &byte, 1);  // Signal back to parent
        }
        exit(0);
    }

    // Parent process: write to pipe1, read from pipe2
    close(pipe1[0]);
    close(pipe2[1]);

    struct timespec start, end;
    clock_gettime(CLOCK_MONOTONIC, &start);

    for (int i = 0; i < NUM_ITERATIONS; i++) {
        write(pipe1[1], &byte, 1);  // Wake up child
        read(pipe2[0], &byte, 1);   // Block until child responds
    }

    clock_gettime(CLOCK_MONOTONIC, &end);
    wait(NULL);

    double elapsed = (end.tv_sec - start.tv_sec) * 1e9 +
                     (end.tv_nsec - start.tv_nsec);

    // Each iteration involves 2 context switches (parent→child, child→parent)
    double per_switch = elapsed / (2.0 * NUM_ITERATIONS);

    printf("Total time: %.2f ms\n", elapsed / 1e6);
    printf("Context switches: %d\n", 2 * NUM_ITERATIONS);
    printf("Average context switch time: %.2f ns (%.2f μs)\n",
           per_switch, per_switch / 1000.0);

    return 0;
}
```

**Typical output on a modern system:**

```text
Total time: 580.42 ms
Context switches: 200000
Average context switch time: 2901.10 ns (2.90 μs)
```

### Python Measurement Script

```python
import os
import time

def measure_context_switch(iterations=50000):
    """Measure context switch time using pipe ping-pong."""
    # Create two pipes
    r1, w1 = os.pipe()  # Parent → Child
    r2, w2 = os.pipe()  # Child → Parent

    pid = os.fork()

    if pid == 0:
        # Child
        os.close(w1)
        os.close(r2)
        for _ in range(iterations):
            os.read(r1, 1)
            os.write(w2, b'x')
        os._exit(0)

    # Parent
    os.close(r1)
    os.close(w2)

    start = time.perf_counter_ns()
    for _ in range(iterations):
        os.write(w1, b'x')
        os.read(r2, 1)
    elapsed = time.perf_counter_ns() - start

    os.waitpid(pid, 0)

    per_switch = elapsed / (2 * iterations)
    print(f"Iterations: {iterations}")
    print(f"Total time: {elapsed / 1e6:.2f} ms")
    print(f"Avg context switch: {per_switch:.0f} ns ({per_switch/1000:.2f} μs)")

measure_context_switch()
```

> [!TIP]
> For accurate measurements, pin both processes to the same CPU core using `taskset` so that every pipe read/write forces a context switch rather than running on different cores simultaneously:
>
> ```bash
> taskset -c 0 ./measure_context_switch
> ```

---

## Context Switch Cost: Architecture Comparison

Context switch costs vary significantly across architectures and over time:

| Architecture / System            | Approx. Context Switch Time | Notes                           |
| -------------------------------- | --------------------------- | ------------------------------- |
| **x86-64 (modern Intel/AMD)**    | 2-5 μs (direct)             | With PCID, reduced TLB cost     |
| **x86-64 (with KPTI)**           | 5-10 μs (direct)            | Meltdown mitigation overhead    |
| **ARM Cortex-A (mobile)**        | 3-8 μs                      | Fewer registers than x86        |
| **ARM Cortex-M (embedded)**      | 1-3 μs                      | Hardware-assisted tail-chaining |
| **RISC-V**                       | 2-5 μs                      | Clean register save/restore     |
| **SPARC (register windows)**     | 1-2 μs                      | Hardware register switching     |
| **Thread switch (same process)** | 0.5-2 μs                    | No page table / TLB change      |
| **Coroutine / fiber switch**     | 50-200 ns                   | User-space only, minimal state  |

### Process Switch vs Thread Switch

| Aspect                       | Process Context Switch        | Thread Context Switch    |
| ---------------------------- | ----------------------------- | ------------------------ |
| **Page table switch**        | Yes (CR3 reload)              | No (same address space)  |
| **TLB flush**                | Yes (unless PCID)             | No                       |
| **Cache impact**             | High (different working sets) | Lower (shared code/data) |
| **Register save/restore**    | Full set                      | Full set                 |
| **Memory protection change** | Yes                           | No                       |
| **Typical time**             | 3-10 μs                       | 1-3 μs                   |

---

## Context Switching and Performance

### The Context Switch Tax

Excessive context switching directly reduces system throughput:

$$\text{CPU Efficiency} = \frac{T_{\text{useful}}}{T_{\text{useful}} + T_{\text{context switch}}} \times 100\%$$

For example, with a 10 ms time quantum and 5 μs context switch:

$$\text{Efficiency} = \frac{10{,}000}{10{,}000 + 5} \times 100\% = 99.95\%$$

But with a 0.1 ms (100 μs) quantum:

$$\text{Efficiency} = \frac{100}{100 + 5} \times 100\% = 95.24\%$$

| Time Quantum | Context Switch Time | Efficiency | Context Switches/sec |
| ------------ | ------------------- | ---------- | -------------------- |
| 100 ms       | 5 μs                | 99.995%    | 10                   |
| 10 ms        | 5 μs                | 99.95%     | 100                  |
| 1 ms         | 5 μs                | 99.5%      | 1,000                |
| 100 μs       | 5 μs                | 95.2%      | 10,000               |
| 10 μs        | 5 μs                | 66.7%      | 100,000              |

> [!IMPORTANT]
> This is why time quantum selection is critical in Round Robin scheduling. Too small a quantum means the CPU spends more time switching than computing. The rule of thumb is that context switch time should be less than 1% of the time quantum.

---

## Reducing Context Switch Overhead

| Technique                   | Description                                  | Reduction              |
| --------------------------- | -------------------------------------------- | ---------------------- |
| **Use threads**             | Threads in same process share address space  | 30-70% less overhead   |
| **Use PCID/ASID**           | Tagged TLB avoids flushing                   | Eliminates TLB cost    |
| **Increase time quantum**   | Fewer switches per second                    | Proportional reduction |
| **CPU affinity**            | Bind process to specific core                | Preserves cache warmth |
| **Use coroutines**          | User-space cooperative switching             | 90%+ reduction         |
| **Batch similar processes** | Schedule processes with similar working sets | Better cache reuse     |
| **Lazy FPU save**           | Only save FPU state if next process uses it  | Saves FPU copy time    |

---

## Try It Yourself

**Exercise 1:** Compile and run the C context switch measurement program. Try running it with and without `taskset -c 0`. Explain why the results differ.

:::details Solution

```bash
gcc -O2 -o ctx_measure ctx_measure.c
# Without taskset (may run on different cores)
./ctx_measure

# With taskset (forces same core, guarantees context switches)
taskset -c 0 ./ctx_measure
```

**Why results differ:**

- **Without `taskset`**: The parent and child may run on different CPU cores simultaneously. The pipe communication doesn't force a context switch — both processes run in parallel. The measured time reflects pipe latency, not context switch time.
- **With `taskset -c 0`**: Both processes are pinned to core 0. Only one can run at a time, so every pipe read/write forces a real context switch. This gives a more accurate measurement.
  :::

**Exercise 2:** Calculate the CPU efficiency for a system with 50 processes, a 20 ms time quantum, and 3 μs context switch time. How many context switches per second?

:::details Solution
**Context switches per second:**
Each of 50 processes gets the CPU once per round. One round takes $50 \times (20\text{ ms} + 0.003\text{ ms}) = 1000.15\text{ ms} \approx 1\text{ second}$.

So approximately $50$ context switches per second.

**CPU Efficiency:**
$$\text{Efficiency} = \frac{T_{\text{useful}}}{T_{\text{useful}} + T_{\text{switch}}} = \frac{20{,}000}{20{,}000 + 3} \times 100\% = 99.985\%$$

The overhead is negligible because the 20 ms quantum is much larger than the 3 μs switch time.
:::

**Exercise 3:** On a Linux system, compare the voluntary and nonvoluntary context switch counts for a CPU-bound process (`yes > /dev/null`) and an I/O-bound process (`find / -name "*.txt"`). Which has more of each type, and why?

:::details Solution

```bash
# Start CPU-bound process
yes > /dev/null &
CPU_PID=$!
sleep 5
grep ctxt /proc/$CPU_PID/status
kill $CPU_PID

# Start I/O-bound process
find / -name "*.txt" > /dev/null 2>&1 &
IO_PID=$!
sleep 5
grep ctxt /proc/$IO_PID/status
kill $IO_PID
```

**Expected results:**

- **CPU-bound (`yes`)**: High `nonvoluntary_ctxt_switches` (scheduler keeps preempting it), low `voluntary_ctxt_switches` (rarely blocks).
- **I/O-bound (`find`)**: High `voluntary_ctxt_switches` (frequently blocks on disk reads), low `nonvoluntary_ctxt_switches` (usually gives up CPU before quantum expires).

This demonstrates that CPU-bound processes are _forced_ off the CPU while I/O-bound processes _voluntarily_ give it up.
:::

---

## Key Takeaways

- A **context switch** saves the CPU state of the current process (into its PCB) and loads the state of the next process (from its PCB), enabling multitasking on a single CPU.
- Context switches are triggered by **timer interrupts** (involuntary preemption), **I/O requests** (voluntary blocking), **system calls**, and **higher-priority process arrival**.
- The **direct cost** of a context switch is 1-5 μs, but **indirect costs** (cache pollution, TLB flush, pipeline flush) can add 10-1000 μs of degraded performance.
- **Voluntary** context switches occur when a process blocks (I/O-bound); **involuntary** switches occur when the scheduler preempts a process (CPU-bound).
- Hardware features like **tagged TLBs (PCID/ASID)**, **register windows**, and **lazy FPU save** significantly reduce context switch overhead.
- **Thread** context switches are cheaper than process switches because threads share the same address space (no page table or TLB change needed).
- The **time quantum** must be much larger than the context switch time — a common rule is that switch time should be < 1% of the quantum.
- Context switch time can be measured experimentally using a **pipe ping-pong** between two processes pinned to the same CPU core.
