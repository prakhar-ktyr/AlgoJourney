---
title: Process Control Block
section: "Processes & Scheduling"
---

# Process Control Block

If a process is a "program in execution," then the **Process Control Block (PCB)** is its identity card. The PCB is the data structure the operating system uses to track everything about a process — its state, its registers, its memory, its open files, and more. Without the PCB, the OS would have no way to pause a process, switch to another, and later resume exactly where it left off.

> The **Process Control Block** (also called a _task control block_) is a data structure maintained by the OS for every process. It contains all the information needed to manage the process.

---

## What Is the PCB?

Think of the PCB like a **patient chart** in a hospital. Each patient (process) has a chart that records their name, medical history, current medications, room number, and attending doctor. When a nurse (scheduler) switches from caring for one patient to another, they consult the chart to know exactly what each patient needs.

The PCB serves the same purpose for the OS: it is the **single authoritative record** of everything the OS needs to know about a process.

```text
Operating System's View:
┌─────────────────────────────────────────────────────┐
│                    Process Table                     │
│                                                     │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│   │  PCB 0  │  │  PCB 1  │  │  PCB 2  │  ...      │
│   │ (init)  │  │ (bash)  │  │ (firefox)│           │
│   └─────────┘  └─────────┘  └─────────┘           │
│                                                     │
│   Every process has exactly one PCB.                │
│   The Process Table is an array/list of all PCBs.   │
└─────────────────────────────────────────────────────┘
```

---

## PCB Contents

The PCB stores a rich set of information organized into several categories.

### Detailed PCB Structure

```text
┌─────────────────────────────────────────────────┐
│              Process Control Block               │
├─────────────────────────────────────────────────┤
│  Process ID (PID):              4521             │
│  Parent Process ID (PPID):      1200             │
├─────────────────────────────────────────────────┤
│  Process State:                 RUNNING          │
├─────────────────────────────────────────────────┤
│  Program Counter (PC):          0x0040156A       │
├─────────────────────────────────────────────────┤
│  CPU Registers:                                  │
│    EAX: 0x0000002A    EBX: 0x00000000           │
│    ECX: 0x7FFE4200    EDX: 0x00000001           │
│    ESP: 0x7FFE41F0    EBP: 0x7FFE4210           │
│    ESI: 0x00000000    EDI: 0x00000000           │
│    EFLAGS: 0x00000246                            │
├─────────────────────────────────────────────────┤
│  CPU Scheduling Info:                            │
│    Priority:          15                         │
│    Scheduling Queue:  Ready Queue                │
│    Time Slice Left:   8 ms                       │
├─────────────────────────────────────────────────┤
│  Memory Management Info:                         │
│    Base Register:     0x00400000                 │
│    Limit Register:    0x00800000                 │
│    Page Table Ptr:    0xFFFF8800 3A42C000        │
│    Segment Table Ptr: 0xFFFF8800 3B10E000        │
├─────────────────────────────────────────────────┤
│  Accounting Info:                                │
│    CPU Time Used:     2.34 seconds               │
│    Time Limit:        None                       │
│    Start Time:        2024-03-15 10:23:45        │
│    User ID (UID):     1000                       │
│    Group ID (GID):    1000                       │
├─────────────────────────────────────────────────┤
│  I/O Status Info:                                │
│    Open Files:        [0: stdin, 1: stdout,      │
│                        2: stderr, 3: data.txt]   │
│    I/O Devices:       [/dev/sda]                 │
│    Pending I/O:       None                       │
├─────────────────────────────────────────────────┤
│  Pointer to Next PCB: 0xFFFF8800 3C200000       │
└─────────────────────────────────────────────────┘
```

### PCB Fields Summary Table

| Category           | Field                     | Description                                                 |
| ------------------ | ------------------------- | ----------------------------------------------------------- |
| **Identification** | PID                       | Unique integer identifying the process                      |
|                    | PPID                      | PID of the parent process                                   |
|                    | UID/GID                   | User and group that owns the process                        |
| **State**          | Process State             | Current state: New, Ready, Running, Waiting, Terminated     |
| **CPU Context**    | Program Counter           | Address of the next instruction to execute                  |
|                    | CPU Registers             | Contents of all general-purpose and special registers       |
|                    | Stack Pointer             | Top of the process's kernel/user stack                      |
| **Scheduling**     | Priority                  | Scheduling priority (higher = more important or vice versa) |
|                    | Scheduling Queue Pointer  | Which queue the process is currently in                     |
|                    | Time Slice                | Remaining CPU time before preemption                        |
|                    | Scheduling Algorithm Data | Nice value, virtual runtime (for CFS), etc.                 |
| **Memory**         | Base/Limit Registers      | Address space boundaries                                    |
|                    | Page Table Pointer        | Points to the process's page table                          |
|                    | Memory Size               | Total allocated virtual memory                              |
| **Accounting**     | CPU Time Used             | Total CPU time consumed                                     |
|                    | Wall Clock Time           | Elapsed real time since process started                     |
|                    | Time Limits               | Maximum CPU time allowed                                    |
| **I/O**            | Open File Table           | List of file descriptors and associated files               |
|                    | I/O Device List           | Devices allocated to this process                           |
|                    | Pending I/O Requests      | Outstanding I/O operations                                  |
| **Links**          | Parent/Child Pointers     | Links to parent and child processes                         |
|                    | Next PCB Pointer          | Link to next PCB in queue (linked list)                     |

---

## C Struct Representation

Here is a simplified C struct that represents a PCB:

```c
#include <stdint.h>

#define MAX_OPEN_FILES 256
#define NUM_REGISTERS  16

// Process states
typedef enum {
    PROCESS_NEW,
    PROCESS_READY,
    PROCESS_RUNNING,
    PROCESS_WAITING,
    PROCESS_TERMINATED
} ProcessState;

// Saved CPU register set
typedef struct {
    uint64_t general[NUM_REGISTERS];  // RAX, RBX, RCX, RDX, etc.
    uint64_t rip;                      // Instruction pointer (Program Counter)
    uint64_t rsp;                      // Stack pointer
    uint64_t rbp;                      // Base pointer
    uint64_t rflags;                   // Status/flags register
    uint64_t cr3;                      // Page table base register
} CPUContext;

// Memory management information
typedef struct {
    uint64_t page_table_base;      // Physical address of page table
    uint64_t code_start;           // Start of text segment
    uint64_t code_size;            // Size of text segment
    uint64_t data_start;           // Start of data segment
    uint64_t heap_start;           // Start of heap
    uint64_t heap_end;             // Current end of heap (brk)
    uint64_t stack_start;          // Bottom of stack
    uint64_t stack_size;           // Maximum stack size
    uint64_t total_vm_size;        // Total virtual memory used
} MemoryInfo;

// The Process Control Block
typedef struct PCB {
    // --- Identification ---
    int pid;                        // Process ID
    int ppid;                       // Parent Process ID
    int uid;                        // User ID
    int gid;                        // Group ID

    // --- State ---
    ProcessState state;             // Current process state

    // --- CPU Context (saved during context switch) ---
    CPUContext cpu_context;          // All CPU register values

    // --- Scheduling ---
    int priority;                   // Scheduling priority
    int nice_value;                 // Nice value (-20 to 19)
    uint64_t time_slice;            // Time quantum remaining (ns)
    uint64_t vruntime;              // Virtual runtime (for CFS)

    // --- Memory Management ---
    MemoryInfo memory;              // Memory layout information

    // --- Accounting ---
    uint64_t creation_time;         // When process was created
    uint64_t user_cpu_time;         // CPU time in user mode
    uint64_t kernel_cpu_time;       // CPU time in kernel mode
    uint64_t total_cpu_time;        // Total CPU time consumed

    // --- I/O ---
    int open_files[MAX_OPEN_FILES]; // File descriptor table
    int num_open_files;             // Count of open files

    // --- Links ---
    struct PCB *parent;             // Pointer to parent PCB
    struct PCB *children;           // Linked list of children
    struct PCB *next_sibling;       // Next sibling in child list
    struct PCB *next_in_queue;      // Next PCB in scheduling queue
} PCB;
```

> [!NOTE]
> This is a _simplified_ PCB. Real kernel PCBs like Linux's `task_struct` have hundreds of fields spanning signal handling, namespaces, cgroups, security credentials, and more.

---

## The Process Table

The OS maintains a **process table** — a collection of all PCBs in the system. This table allows the OS to quickly locate any process by its PID.

```text
Process Table Implementation Options:

Option 1: Array (indexed by PID)
┌───────┬───────┬───────┬───────┬───────┬───────┐
│PCB[0] │PCB[1] │PCB[2] │PCB[3] │PCB[4] │ ...   │
│ init  │ bash  │firefox│ vim   │ gcc   │       │
└───────┴───────┴───────┴───────┴───────┴───────┘
  PID 0   PID 1   PID 2   PID 3   PID 4

  Pros: O(1) lookup by PID
  Cons: Wastes space if PIDs are sparse

Option 2: Hash Table (PID → PCB pointer)
┌──────────────────────┐
│ Hash Table           │
│ Bucket 0: ──► PCB(PID 1000) ──► PCB(PID 2000)
│ Bucket 1: ──► PCB(PID 1001)
│ Bucket 2: ──► NULL
│ Bucket 3: ──► PCB(PID 1003) ──► PCB(PID 3003)
│ ...                  │
└──────────────────────┘

  Pros: Space-efficient for sparse PIDs
  Cons: Slightly slower lookup (hash + chain)
```

| Implementation     | Lookup Time      | Space Usage                       | Used In            |
| ------------------ | ---------------- | --------------------------------- | ------------------ |
| **Array**          | $O(1)$           | $O(\text{MAX\_PID})$              | Simple embedded OS |
| **Hash Table**     | $O(1)$ amortized | $O(n)$ where n = active processes | Linux (pidhash)    |
| **Linked List**    | $O(n)$           | $O(n)$                            | Very simple OS     |
| **Red-Black Tree** | $O(\log n)$      | $O(n)$                            | Some RTOS          |

---

## PCB During Context Switches

The PCB plays a **central role** during context switches — the mechanism by which the CPU switches from executing one process to another.

### Context Switch Using PCBs

```text
Process P₁ running          OS Kernel              Process P₂ waiting
─────────────────          ──────────              ─────────────────
      │                        │                         │
      │  Interrupt/Syscall     │                         │
      │──────────────────────►│                         │
      │                        │                         │
      │                   ┌────┴──────────────┐          │
      │                   │ 1. Save P₁'s CPU  │          │
      │                   │    registers into  │          │
      │                   │    PCB₁            │          │
      │                   │                    │          │
      │                   │ 2. Update PCB₁     │          │
      │                   │    state = READY   │          │
      │                   │                    │          │
      │                   │ 3. Select P₂ from  │          │
      │                   │    ready queue     │          │
      │                   │                    │          │
      │                   │ 4. Update PCB₂     │          │
      │                   │    state = RUNNING │          │
      │                   │                    │          │
      │                   │ 5. Load P₂'s CPU   │          │
      │                   │    registers from  │          │
      │                   │    PCB₂            │          │
      │                   │                    │          │
      │                   │ 6. Restore P₂'s    │          │
      │                   │    page table (CR3)│          │
      │                   └────┬──────────────┘          │
      │                        │                         │
      │                        │────────────────────────►│
      │                        │                    P₂ resumes
      │                        │                    execution
   P₁ is now                   │
   idle in                     │
   ready queue                 │
```

### Step-by-Step Context Switch

| Step | Action                         | PCB Field Used                    |
| ---- | ------------------------------ | --------------------------------- |
| 1    | Save program counter of P₁     | `cpu_context.rip` in PCB₁         |
| 2    | Save all CPU registers of P₁   | `cpu_context.general[]` in PCB₁   |
| 3    | Save stack pointer of P₁       | `cpu_context.rsp` in PCB₁         |
| 4    | Update P₁'s state to Ready     | `state` in PCB₁                   |
| 5    | Move PCB₁ to ready queue       | `next_in_queue` pointer           |
| 6    | Select PCB₂ from ready queue   | Scheduler decision                |
| 7    | Update P₂'s state to Running   | `state` in PCB₂                   |
| 8    | Load P₂'s page table           | `cpu_context.cr3` from PCB₂       |
| 9    | Load P₂'s registers            | `cpu_context.general[]` from PCB₂ |
| 10   | Load P₂'s program counter      | `cpu_context.rip` from PCB₂       |
| 11   | Jump to P₂'s saved instruction | CPU resumes P₂                    |

> [!IMPORTANT]
> During a context switch, the CPU does **zero useful work** for user processes. The time spent saving and restoring PCB state is pure overhead. This is why minimizing context switch time is critical for system performance.

---

## PCB in Linux: `task_struct`

In the Linux kernel, the PCB is implemented as the `task_struct` structure, defined in `include/linux/sched.h`. It is one of the largest structures in the kernel.

### Size and Complexity

| Metric                  | Value                   |
| ----------------------- | ----------------------- |
| **Structure name**      | `struct task_struct`    |
| **Approximate size**    | ~6-8 KB per instance    |
| **Number of fields**    | 200+                    |
| **Header file**         | `include/linux/sched.h` |
| **Lines of definition** | ~800 lines              |

### Key Fields in `task_struct`

| Field         | Type                     | Description                                            |
| ------------- | ------------------------ | ------------------------------------------------------ |
| `pid`         | `pid_t`                  | Process ID                                             |
| `tgid`        | `pid_t`                  | Thread Group ID (same as PID for main thread)          |
| `__state`     | `unsigned int`           | Current process state (`TASK_RUNNING`, etc.)           |
| `prio`        | `int`                    | Dynamic priority                                       |
| `static_prio` | `int`                    | Static priority (set by nice value)                    |
| `normal_prio` | `int`                    | Normal priority                                        |
| `rt_priority` | `unsigned int`           | Real-time priority                                     |
| `policy`      | `unsigned int`           | Scheduling policy (`SCHED_NORMAL`, `SCHED_FIFO`, etc.) |
| `se`          | `struct sched_entity`    | CFS scheduling entity (contains `vruntime`)            |
| `mm`          | `struct mm_struct *`     | Memory descriptor (page tables, VMAs)                  |
| `active_mm`   | `struct mm_struct *`     | Active memory descriptor                               |
| `fs`          | `struct fs_struct *`     | Filesystem info (root dir, current dir)                |
| `files`       | `struct files_struct *`  | Open file descriptors                                  |
| `signal`      | `struct signal_struct *` | Signal handling information                            |
| `thread`      | `struct thread_struct`   | CPU-specific state (registers)                         |
| `cred`        | `const struct cred *`    | Security credentials (UID, GID, capabilities)          |
| `comm`        | `char[TASK_COMM_LEN]`    | Executable name (16 chars)                             |
| `parent`      | `struct task_struct *`   | Pointer to parent process                              |
| `children`    | `struct list_head`       | List of child processes                                |
| `sibling`     | `struct list_head`       | Linkage in parent's children list                      |
| `utime`       | `u64`                    | User-mode CPU time                                     |
| `stime`       | `u64`                    | Kernel-mode CPU time                                   |

### Simplified C Representation of `task_struct`

```c
// Highly simplified version of Linux's task_struct
struct task_struct {
    // Scheduling
    volatile long __state;        // -1 unrunnable, 0 runnable, >0 stopped
    int prio, static_prio, normal_prio;
    unsigned int rt_priority;
    unsigned int policy;          // SCHED_NORMAL, SCHED_FIFO, SCHED_RR
    struct sched_entity se;       // CFS scheduling info
    uint64_t vruntime;            // Virtual runtime for CFS

    // Identity
    pid_t pid;                    // Process ID
    pid_t tgid;                   // Thread Group ID
    char comm[16];                // Process name

    // Process hierarchy
    struct task_struct *parent;
    struct list_head children;
    struct list_head sibling;

    // Memory
    struct mm_struct *mm;         // User-space memory descriptor
    struct mm_struct *active_mm;  // Active address space

    // File system
    struct files_struct *files;   // Open file table
    struct fs_struct *fs;         // Root and cwd

    // Credentials
    const struct cred *cred;      // UID, GID, capabilities

    // CPU context (architecture-specific)
    struct thread_struct thread;  // Saved registers

    // Timing
    uint64_t utime, stime;       // User and system CPU time
    uint64_t start_time;         // Monotonic start time
};
```

### Exploring `task_struct` at Runtime

```bash
# View the size of task_struct (requires kernel headers)
$ python3 -c "
import subprocess
result = subprocess.run(['grep', '-c', 'struct task_struct {',
    '/usr/src/linux-headers-$(uname -r)/include/linux/sched.h'],
    capture_output=True, text=True)
print(result.stdout)
"

# Use /proc to see PCB-equivalent information
$ cat /proc/self/status
Name:   cat
Umask:  0022
State:  R (running)
Tgid:   45123
Pid:    45123
PPid:   44000
TracerPid:      0
Uid:    1000    1000    1000    1000
Gid:    1000    1000    1000    1000
Threads:        1
VmPeak: 8560 kB
VmSize: 8560 kB
VmRSS:  1200 kB
```

---

## Process List Management

Linux organizes all `task_struct` instances in a **doubly linked circular list** and also uses a **hash table** for PID-based lookups.

```text
Linux Process List (Doubly Linked Circular List):

         ┌────────────────────────────────────────────────┐
         │                                                │
         ▼                                                │
    ┌──────────┐     ┌──────────┐     ┌──────────┐      │
    │task_struct│────►│task_struct│────►│task_struct│──────┘
    │ PID: 1   │◄────│ PID: 423 │◄────│ PID: 891 │
    │ (init)   │     │ (bash)   │     │ (vim)    │
    └──────────┘     └──────────┘     └──────────┘
         ▲                                   │
         └───────────────────────────────────┘

PID Hash Table (for fast PID → task_struct lookup):

    ┌─────────────┐
    │ pidhash[0]  │──► NULL
    │ pidhash[1]  │──► task_struct(PID 1) ──► task_struct(PID 4097)
    │ pidhash[2]  │──► task_struct(PID 2)
    │ pidhash[3]  │──► NULL
    │    ...      │
    │ pidhash[n]  │──► task_struct(PID 423)
    └─────────────┘
```

### Common Operations on the Process List

| Operation             | Implementation                | Time Complexity          |
| --------------------- | ----------------------------- | ------------------------ |
| Find process by PID   | Hash table lookup             | $O(1)$ average           |
| Iterate all processes | Walk the linked list          | $O(n)$                   |
| Add new process       | Insert into list + hash table | $O(1)$                   |
| Remove process        | Delete from list + hash table | $O(1)$                   |
| Find children         | Walk children list head       | $O(k)$, k = num children |

```c
// Kernel macro to iterate over all processes
// (from include/linux/sched/signal.h)

struct task_struct *task;

// Iterate over every process in the system
for_each_process(task) {
    printk(KERN_INFO "PID: %d, Name: %s, State: %ld\n",
           task->pid, task->comm, task->__state);
}
```

> [!TIP]
> The `for_each_process` macro in the Linux kernel walks the circular doubly linked list of all `task_struct` instances. It's equivalent to iterating through every row of the process table.

---

## Python Example: Building a Simple Process Table

```python
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, List

class ProcessState(Enum):
    NEW = "NEW"
    READY = "READY"
    RUNNING = "RUNNING"
    WAITING = "WAITING"
    TERMINATED = "TERMINATED"

@dataclass
class PCB:
    """Simplified Process Control Block."""
    pid: int
    ppid: int
    name: str
    state: ProcessState = ProcessState.NEW
    priority: int = 0
    program_counter: int = 0
    cpu_registers: dict = field(default_factory=dict)
    memory_base: int = 0
    memory_limit: int = 0
    cpu_time_used: float = 0.0
    open_files: List[str] = field(default_factory=list)

    def __str__(self):
        return (f"PCB[PID={self.pid}, Name={self.name}, "
                f"State={self.state.value}, Priority={self.priority}]")

class ProcessTable:
    """Simple process table using a dictionary."""
    def __init__(self):
        self._table = {}       # PID → PCB
        self._next_pid = 1

    def create_process(self, name: str, ppid: int = 0, priority: int = 0) -> PCB:
        pid = self._next_pid
        self._next_pid += 1
        pcb = PCB(pid=pid, ppid=ppid, name=name, priority=priority)
        self._table[pid] = pcb
        pcb.state = ProcessState.READY
        return pcb

    def get_process(self, pid: int) -> Optional[PCB]:
        return self._table.get(pid)

    def terminate_process(self, pid: int):
        if pid in self._table:
            self._table[pid].state = ProcessState.TERMINATED

    def list_processes(self):
        print(f"{'PID':>5} {'PPID':>5} {'State':<12} {'Priority':>8} {'Name':<15}")
        print("-" * 50)
        for pcb in self._table.values():
            print(f"{pcb.pid:>5} {pcb.ppid:>5} {pcb.state.value:<12} "
                  f"{pcb.priority:>8} {pcb.name:<15}")

# Demo
pt = ProcessTable()
init = pt.create_process("init", ppid=0, priority=0)
bash = pt.create_process("bash", ppid=init.pid, priority=5)
vim = pt.create_process("vim", ppid=bash.pid, priority=10)
gcc = pt.create_process("gcc", ppid=bash.pid, priority=8)

bash.state = ProcessState.RUNNING
vim.state = ProcessState.WAITING

pt.list_processes()
```

**Output:**

```text
  PID  PPID State        Priority Name
--------------------------------------------------
    1     0 READY               0 init
    2     1 RUNNING             5 bash
    3     2 WAITING            10 vim
    4     2 READY               8 gcc
```

---

## Try It Yourself

**Exercise 1:** Extend the `PCB` struct (C version) to include signal handling information: a signal mask, a list of pending signals, and a pointer to a signal handler function. Write the additional struct fields.

:::details Solution

```c
#define MAX_SIGNALS 32

typedef void (*signal_handler_t)(int);

typedef struct {
    uint32_t signal_mask;                      // Bitmask of blocked signals
    uint32_t pending_signals;                  // Bitmask of pending signals
    signal_handler_t handlers[MAX_SIGNALS];    // Handler for each signal
    int signal_queue[MAX_SIGNALS];             // Queue of pending signal numbers
    int signal_queue_count;                    // Number of queued signals
} SignalInfo;

// Add to the PCB struct:
typedef struct PCB {
    // ... existing fields ...
    SignalInfo signals;   // Signal handling information
} PCB;
```

:::

**Exercise 2:** On a Linux system, use `/proc/self/status` and `/proc/self/maps` to find the following about your current shell: (a) PID and PPID, (b) total virtual memory size, (c) addresses of the heap and stack segments.

:::details Solution

```bash
# (a) PID and PPID
grep -E "^(Pid|PPid):" /proc/self/status

# (b) Total virtual memory size
grep "^VmSize:" /proc/self/status

# (c) Heap and stack addresses
grep -E "\[heap\]|\[stack\]" /proc/self/maps

# Example output for maps:
# 0060a000-0062b000 rw-p 00000000 00:00 0    [heap]
# 7fff5a3e0000-7fff5a401000 rw-p 00000000 00:00 0    [stack]
```

The heap typically starts near the end of the data segment, and the stack is near the top of the user address space (just below the kernel boundary).
:::

**Exercise 3:** Why does the PCB need to store the program counter and CPU registers? What would happen if these were not saved during a context switch?

:::details Solution
The PCB stores the **program counter** and **CPU registers** because these represent the exact execution state of the process at the moment it was paused.

- **Program Counter**: Tells the CPU which instruction to execute next. Without saving it, when the process resumes, the CPU would start executing from an arbitrary or default location — likely crashing the process.

- **CPU Registers**: Hold intermediate computation results, function parameters, loop counters, and pointers. Without saving them, all in-progress calculations would be lost. For example, if a process was in the middle of computing `a + b * c` and the register holding `b * c` was overwritten by another process, the result would be incorrect.

**Without saving these fields**, context switching would be impossible — no process could ever be paused and correctly resumed. Every time the CPU switched tasks, the interrupted process's state would be destroyed.
:::

---

## Key Takeaways

- The **Process Control Block (PCB)** is the OS's data structure for a process, containing everything needed to manage it: PID, state, registers, memory info, scheduling info, I/O status, and accounting data.
- The **process table** is the collection of all PCBs — implemented as arrays, hash tables, or linked lists depending on the OS.
- During a **context switch**, the OS saves the running process's CPU state _into_ its PCB and loads the next process's state _from_ its PCB. This is the core mechanism enabling multitasking.
- In Linux, the PCB is the `task_struct` — a massive structure (~6-8 KB) with 200+ fields covering scheduling, memory, files, signals, credentials, and more.
- Linux maintains a **doubly linked circular list** of all `task_struct` instances and a **PID hash table** for fast lookups.
- The PCB is created when a process is born (`fork()`/`clone()`) and destroyed when the process is fully reaped (after `wait()` collects the exit status from a zombie).
- **Every field in the PCB exists for a reason** — each supports a specific OS function: scheduling (priority, vruntime), memory management (page table pointer), security (UID, GID, capabilities), or resource tracking (open files, CPU time).
