---
title: Process States & Lifecycle
section: "Processes & Scheduling"
---

# Process States & Lifecycle

Every process goes through a **lifecycle** — from birth to death — transitioning between well-defined **states** along the way. Understanding these states and what causes transitions between them is fundamental to grasping how operating systems manage multiple processes simultaneously.

Think of a restaurant kitchen. A dish order (process) goes through stages: received (new), queued for a cook (ready), being cooked (running), waiting for an ingredient delivery (waiting), and served (terminated). The kitchen manager (OS scheduler) decides which order to work on next.

---

## The Five-State Process Model

The most widely taught process model uses **five states**. This model captures the essential lifecycle of any process.

> A process, at any point in time, exists in exactly one of five states: **New**, **Ready**, **Running**, **Waiting**, or **Terminated**.

### State Definitions

| State                 | Description                                          | Where is the process?   |
| --------------------- | ---------------------------------------------------- | ----------------------- |
| **New**               | Process is being created; OS is allocating resources | Not yet in memory fully |
| **Ready**             | Loaded in memory, waiting for CPU                    | In the ready queue      |
| **Running**           | Currently executing on a CPU core                    | On the CPU              |
| **Waiting** (Blocked) | Waiting for an event (I/O, signal, resource)         | In a device/event queue |
| **Terminated** (Exit) | Execution complete, being cleaned up                 | Being deallocated       |

### State Transition Diagram

```text
                    ┌──────────────────────────────────────────────┐
                    │                                              │
                    ▼                                              │
              ┌──────────┐                                         │
              │          │                                         │
              │   New    │                                         │
              │          │                                         │
              └────┬─────┘                                         │
                   │                                               │
                   │ ① Admitted                                    │
                   │ (long-term scheduler)                         │
                   ▼                                               │
              ┌──────────┐     ② Scheduler       ┌──────────┐     │
              │          │────Dispatch──────────→│          │     │
              │  Ready   │                        │ Running  │     │
              │          │←──────────────────────│          │     │
              └──────────┘   ③ Interrupt /        └────┬─────┘     │
                   ▲          Preemption               │           │
                   │                                   │           │
                   │                                   │ ⑤ Exit    │
                   │ ④ I/O or                          │           │
                   │ Event                             ▼           │
                   │ Completion              ┌──────────────┐      │
                   │                         │              │      │
                   │                         │ Terminated   │──────┘
                   │                         │              │
              ┌──────────┐                   └──────────────┘
              │          │
              │ Waiting  │←──── ⑥ I/O or Event Request
              │ (Blocked)│       (from Running)
              │          │
              └──────────┘
```

### Transition Details

| #   | Transition          | From → To            | Trigger                                               |
| --- | ------------------- | -------------------- | ----------------------------------------------------- |
| ①   | Admitted            | New → Ready          | Long-term scheduler loads process into memory         |
| ②   | Dispatch            | Ready → Running      | Short-term scheduler selects process for CPU          |
| ③   | Preempt / Interrupt | Running → Ready      | Time quantum expires, higher-priority process arrives |
| ④   | Event Complete      | Waiting → Ready      | I/O operation finishes, resource becomes available    |
| ⑤   | Exit                | Running → Terminated | Process calls `exit()`, fatal error, or killed        |
| ⑥   | Wait                | Running → Waiting    | Process requests I/O, waits for mutex/semaphore       |

> [!NOTE]
> A process **cannot** go directly from Waiting to Running. It must first return to Ready, then be dispatched by the scheduler. This ensures fairness — the scheduler always decides which process runs next.

### State Transitions in Code

```c
#include <stdio.h>
#include <unistd.h>

int main() {
    // Process is in RUNNING state here
    printf("Process %d is running\n", getpid());

    // This causes transition: Running → Waiting
    // (process blocks waiting for I/O to complete)
    char buf[100];
    read(STDIN_FILENO, buf, sizeof(buf));  // Blocks on I/O

    // After I/O completes: Waiting → Ready → Running
    printf("Got input: %s\n", buf);

    // Process calls exit: Running → Terminated
    return 0;  // exit()
}
```

---

## What Triggers Each Transition

Understanding _why_ transitions happen is critical for OS design. Let's examine each one in detail.

### Running → Ready (Preemption)

```text
Causes of Preemption:
┌─────────────────────────────────────────────────────────────┐
│ 1. Timer interrupt (time quantum expired)                   │
│ 2. Higher-priority process becomes ready                    │
│ 3. Voluntary yield (process calls sched_yield())            │
│ 4. Hardware interrupt that requires immediate attention     │
└─────────────────────────────────────────────────────────────┘
```

### Running → Waiting (Blocking)

| Blocking Event    | System Call Example       | What It Waits For        |
| ----------------- | ------------------------- | ------------------------ |
| Disk I/O          | `read()`, `write()`       | Data transfer completion |
| Network I/O       | `recv()`, `accept()`      | Network packet arrival   |
| Sleep             | `sleep()`, `nanosleep()`  | Timer expiration         |
| Mutex/Lock        | `pthread_mutex_lock()`    | Lock availability        |
| Child termination | `wait()`, `waitpid()`     | Child process to exit    |
| Pipe read         | `read(pipe_fd, ...)`      | Data in pipe buffer      |
| Signal            | `pause()`, `sigsuspend()` | Signal delivery          |

---

## The Seven-State Process Model

The five-state model doesn't account for a critical resource management technique: **swapping**. When memory is scarce, the OS may **swap** processes out to disk to free RAM. This introduces two additional states.

### Suspended States

| State                 | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| **Suspended Ready**   | Process is swapped out to disk but was ready to run         |
| **Suspended Waiting** | Process is swapped out to disk and was waiting for an event |

### Seven-State Diagram

```text
                                  ┌───────────┐
                  ┌──────────────│   New     │
                  │               └───────────┘
                  │ Admit
                  ▼
  ┌────────────────────┐          ┌───────────┐       ┌───────────┐
  │  Suspended Ready   │◄────────│  Ready    │◄──────│  Running  │
  │  (on disk)         │ Suspend  │ (in RAM)  │Preempt│           │
  │                    │─────────►│           │──────►│           │
  └────────────────────┘ Activate └───────────┘       └─────┬─────┘
          ▲                          ▲                      │
          │                          │ I/O                   │ I/O or
          │ I/O Done                 │ Done                  │ Event Wait
          │ (while                   │                      │
          │  suspended)              │                      ▼
  ┌────────────────────┐          ┌───────────┐       ┌───────────┐
  │ Suspended Waiting  │◄────────│  Waiting  │       │Terminated │
  │ (on disk)          │ Suspend  │ (in RAM)  │       │           │
  │                    │─────────►│           │       └───────────┘
  └────────────────────┘ Activate └───────────┘
```

### When Does Suspension Happen?

| Reason              | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| **Memory shortage** | OS needs RAM for higher-priority processes                       |
| **User request**    | User explicitly suspends a process (Ctrl+Z in UNIX)              |
| **Long wait**       | Process has been waiting for I/O so long, OS reclaims its memory |
| **Parent request**  | Parent process suspends child for debugging                      |
| **OS decision**     | Periodic process that only runs at intervals                     |

> [!TIP]
> In UNIX, pressing `Ctrl+Z` sends a `SIGTSTP` signal that suspends the foreground process. You can resume it with `fg` (foreground) or `bg` (background). The `jobs` command lists suspended and background processes.

```bash
# Example of process suspension
$ sleep 1000     # Start a long process
^Z               # Press Ctrl+Z → process suspended
[1]+  Stopped    sleep 1000

$ jobs           # View suspended jobs
[1]+  Stopped    sleep 1000

$ bg %1          # Resume in background
[1]+ sleep 1000 &

$ fg %1          # Bring back to foreground
sleep 1000
```

---

## Schedulers

The OS uses **three types of schedulers** to manage the flow of processes through the system. Each operates at a different frequency and scope.

### The Three Schedulers

```text
                         ┌────────────────────┐
     Job Pool            │                    │            CPU
  (on disk)              │       Memory       │
  ┌────────┐   Long-     │   ┌────────────┐   │  Short-    ┌─────┐
  │ P1     │   Term      │   │ Ready Queue│   │  Term      │     │
  │ P2     │──Scheduler──│──►│ P3  P5  P7 │───│─Scheduler─►│ CPU │
  │ P3     │             │   └────────────┘   │            │     │
  │ ...    │             │         ▲          │            └─────┘
  └────────┘             │         │          │
                         │   Medium-Term      │
                         │   Scheduler        │
                         │   (Swapper)        │
                         │    ▲       │       │
                         │    │       ▼       │
                         │ ┌────────────┐     │
                         │ │ Swap Space │     │
                         │ │ (on disk)  │     │
                         │ └────────────┘     │
                         │                    │
                         └────────────────────┘
```

### Scheduler Comparison Table

| Property              | Long-Term Scheduler          | Short-Term Scheduler         | Medium-Term Scheduler |
| --------------------- | ---------------------------- | ---------------------------- | --------------------- |
| **Also called**       | Job scheduler                | CPU scheduler                | Swapper               |
| **Selects from**      | Job pool (disk)              | Ready queue (memory)         | Memory / Swap space   |
| **Sends to**          | Ready queue                  | CPU                          | Swap space / Memory   |
| **Frequency**         | Infrequent (seconds/minutes) | Very frequent (milliseconds) | Moderate              |
| **Speed requirement** | Can be slow                  | Must be very fast            | Moderate              |
| **Controls**          | Degree of multiprogramming   | CPU allocation               | Memory usage          |
| **Present in**        | Batch systems                | All systems                  | Systems with swapping |

> [!IMPORTANT]
> Modern interactive operating systems (Linux, Windows, macOS) typically don't have a traditional long-term scheduler. Processes are admitted to memory immediately when launched, and the medium-term scheduler (swapper) manages memory pressure.

---

## Degree of Multiprogramming

> The **degree of multiprogramming** is the number of processes currently loaded in memory.

The long-term scheduler controls this number. Too few processes means the CPU is idle; too many means excessive memory pressure and thrashing.

```text
                         Degree of Multiprogramming
  CPU                    │
  Utilization            │              ┌──────────
  (%)                    │            ╱
  100 ─                  │          ╱
   90 ─                  │        ╱
   80 ─                  │      ╱
   70 ─                  │    ╱
   60 ─                  │   ╱
   50 ─                  │  ╱
   40 ─                  │ ╱             Thrashing
   30 ─                  │╱              begins
   20 ─                 ╱│──────────────────▼──────
   10 ─               ╱  │                  ╲
    0 ─┬──────┬──────┬──────┬──────┬──────┬──────
        0     5     10     15     20     25     30
              Number of Processes in Memory
```

### Mix of Processes

The long-term scheduler should maintain a good mix of **CPU-bound** and **I/O-bound** processes:

| Process Type     | CPU Usage | I/O Usage | Effect on System                        |
| ---------------- | --------- | --------- | --------------------------------------- |
| **CPU-bound**    | High      | Low       | Keeps CPU busy, I/O devices idle        |
| **I/O-bound**    | Low       | High      | Keeps I/O devices busy, CPU may be idle |
| **Balanced mix** | Moderate  | Moderate  | Optimal utilization of all resources    |

---

## Process Queues

The OS maintains several **queues** to organize processes waiting for different resources.

### Types of Queues

| Queue             | Contains                                  | Purpose                      |
| ----------------- | ----------------------------------------- | ---------------------------- |
| **Job Queue**     | All processes in the system               | Master list of all processes |
| **Ready Queue**   | Processes in memory, ready to execute     | Waiting for CPU              |
| **Device Queues** | Processes waiting for specific I/O device | One queue per device         |

### Queue Flow Diagram

```text
                    ┌──────────────────────────────────────────────┐
                    │                                              │
                    ▼                                              │
              ┌───────────┐                                        │
              │  Ready    │                                        │
     ┌───────►│  Queue    ├──────────┐                             │
     │        │ P1→P4→P7  │          │                             │
     │        └───────────┘          │                             │
     │                               ▼                             │
     │                          ┌─────────┐                        │
     │                          │         │                        │
     │                          │   CPU   │───────────────────────►│
     │                          │         │     Time quantum       │
     │                          └────┬────┘     expires            │
     │                               │                             │
     │                               │ I/O request                 │
     │                               ▼                             │
     │        ┌───────────────────────────────────────┐            │
     │        │          Device Queues                │            │
     │        │                                       │            │
     │        │  Disk Queue:     P2 → P5 → P9         │            │
     │        │  Network Queue:  P3 → P8              │            │
     │        │  Keyboard Queue: P6                   │            │
     │        │  Printer Queue:  P10 → P11            │            │
     │        │                                       │            │
     │        └────────────────┬──────────────────────┘            │
     │                         │                                   │
     │                         │ I/O complete                      │
     └─────────────────────────┘                                   │
                                                                   │
                    ┌──────────────────────────────────────────────┘
                    │
                    │ Also returns to Ready Queue when:
                    │  - Child process terminates (waited with wait())
                    │  - Interrupt occurs
                    │  - Signal received
```

### Queue Implementation

Queues are typically implemented as **linked lists** of PCBs (Process Control Blocks):

```text
Ready Queue (Linked List):
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ PCB     │     │ PCB     │     │ PCB     │     │ PCB     │
│ PID: 5  │────►│ PID: 12 │────►│ PID: 3  │────►│ PID: 8  │───► NULL
│ State: R│     │ State: R│     │ State: R│     │ State: R│
│ Next: ──│─┐   │ Next: ──│─┐   │ Next: ──│─┐   │ Next:NULL│
└─────────┘ │   └─────────┘ │   └─────────┘ │   └─────────┘
            └──►            └──►            └──►

Head ──► PID 5                                    ◄── Tail
```

---

## Process State in Linux

Linux maps the theoretical states to specific kernel states viewable with `ps`:

| Linux State Code       | `ps` STAT | Meaning                                            | Theoretical State |
| ---------------------- | --------- | -------------------------------------------------- | ----------------- |
| `TASK_RUNNING`         | `R`       | Running or ready to run                            | Running / Ready   |
| `TASK_INTERRUPTIBLE`   | `S`       | Sleeping, can be woken by signal                   | Waiting           |
| `TASK_UNINTERRUPTIBLE` | `D`       | Deep sleep (usually disk I/O)                      | Waiting           |
| `TASK_STOPPED`         | `T`       | Stopped by signal (SIGSTOP/SIGTSTP)                | Suspended         |
| `TASK_TRACED`          | `t`       | Being traced by debugger (ptrace)                  | Suspended         |
| `EXIT_ZOMBIE`          | `Z`       | Terminated, waiting for parent to read exit status | Terminated        |
| `EXIT_DEAD`            | `X`       | Final state before removal                         | Terminated        |

```bash
# See process states in action
$ ps aux | awk '{print $8}' | sort | uniq -c | sort -rn
    142 S    ← Sleeping (interruptible)
     15 I    ← Idle kernel thread
      3 R    ← Running
      1 Z    ← Zombie
```

> [!WARNING]
> A process in `D` (uninterruptible sleep) state **cannot be killed**, not even with `kill -9`. It is waiting for I/O to complete, and the kernel guarantees this wait won't be interrupted. Too many `D` state processes usually indicates a hardware or filesystem problem.

---

## Process Lifecycle: Complete Timeline

Here's a complete lifecycle of a typical process:

```text
Time ──────────────────────────────────────────────────────────────►

User types     OS creates    Scheduler      Process      I/O         I/O done     Process
"./myapp"      process       picks it       requests     completes   Scheduler    calls
               and loads     for CPU        disk read                picks it     exit()
               into memory                                           again

   │              │              │              │            │           │            │
   ▼              ▼              ▼              ▼            ▼           ▼            ▼
┌──────┐     ┌─────────┐    ┌─────────┐   ┌─────────┐  ┌─────────┐ ┌─────────┐ ┌──────────┐
│ NEW  │────►│  READY  │───►│ RUNNING │──►│ WAITING │─►│  READY  │►│ RUNNING │►│TERMINATED│
└──────┘     └─────────┘    └─────────┘   └─────────┘  └─────────┘ └─────────┘ └──────────┘
```

---

## Try It Yourself

**Exercise 1:** A process is currently in the Running state. List all the possible states it can transition to directly, and give one concrete example trigger for each transition.

:::details Solution
From the **Running** state, a process can transition to exactly three states:

1. **Running → Ready**: Timer interrupt fires (time quantum expired), or a higher-priority process becomes ready (preemption).
2. **Running → Waiting**: Process calls `read()` to read from disk, and the data is not in the buffer cache, so it blocks.
3. **Running → Terminated**: Process calls `exit(0)`, or receives a fatal signal like `SIGSEGV` (segmentation fault).

A Running process **cannot** go directly to New or Suspended — those require different mechanisms.
:::

**Exercise 2:** Explain why a process in the Waiting state cannot directly transition to the Running state. Why must it go through Ready first?

:::details Solution
A process in the Waiting state cannot go directly to Running because:

1. **Scheduler authority**: The CPU scheduler (short-term scheduler) is the only entity that decides which process runs on the CPU. When a waiting process's I/O completes, it might not be the highest-priority process — another Ready process might deserve the CPU more.

2. **Fairness**: If blocked processes could jump straight to Running, they would bypass all the processes that have been patiently waiting in the Ready queue. This would violate fairness guarantees.

3. **Design simplicity**: Having a single point of decision (Ready → Running via scheduler) simplifies the OS design and ensures consistent scheduling policy enforcement.

The path is always: Waiting → Ready (when event completes) → Running (when scheduler selects it).
:::

**Exercise 3:** On a Linux system, run `ps aux` and identify processes in different states (R, S, D, Z, T). What is the most common state and why?

:::details Solution

```bash
ps aux | awk '{print $8}' | sort | uniq -c | sort -rn
```

The most common state is almost always **S (Sleeping/Interruptible)** because:

- Most processes spend the majority of their time waiting for events (user input, network data, timers)
- Only one process per CPU core can be in Running (R) state at a time
- A typical system has hundreds of processes but only 4-16 CPU cores
- Background services (daemons) spend nearly all their time sleeping, waking only briefly to handle requests

Example output might be: 200 S, 10 I, 3 R, 0 Z, 0 T — showing that ~95% of processes are sleeping.
:::

---

## Key Takeaways

- Every process exists in exactly one state at any time: **New, Ready, Running, Waiting, or Terminated** (five-state model).
- The **seven-state model** adds **Suspended Ready** and **Suspended Waiting** to handle processes swapped out to disk when memory is scarce.
- Key transitions: Scheduler **dispatches** Ready→Running, timer interrupts cause **preemption** Running→Ready, I/O requests cause **blocking** Running→Waiting, and I/O completion moves Waiting→Ready.
- A waiting process **must** go through Ready before Running — the scheduler always controls CPU access.
- Three schedulers manage process flow: the **long-term** (job) scheduler controls admission, the **short-term** (CPU) scheduler selects the next process to run, and the **medium-term** (swapper) handles suspension.
- The **degree of multiprogramming** — how many processes are in memory — must be balanced: too few wastes the CPU, too many causes thrashing.
- Process queues (**ready queue** and **device queues**) are implemented as linked lists of PCBs and form the backbone of process management.
- In Linux, process states are visible via `ps` with codes like `R`, `S`, `D`, `Z`, and `T`.
