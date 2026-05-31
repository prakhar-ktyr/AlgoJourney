---
title: Introduction to Processes
---

# Introduction to Processes

A **process** is the fundamental unit of work in any operating system. Every application you run — your web browser, text editor, or music player — lives inside a process. Understanding processes is the gateway to understanding how operating systems manage computation, memory, and resources.

In this lesson, we explore what a process really is, how it differs from a program, how processes are created and organized, and how you can observe them on a live system.

---

## Process vs Program

One of the most important distinctions in operating systems is between a **program** and a **process**.

> A **program** is a passive entity — a file containing instructions stored on disk. A **process** is an active entity — a program in execution, with a program counter, registers, and allocated resources.

Think of it this way: a **recipe** (program) sitting in a cookbook does nothing until a **chef** (the CPU) starts following it. The act of cooking (execution) is the process. You can have multiple chefs following the same recipe simultaneously — that gives you multiple processes from one program.

| Feature       | Program                    | Process                                 |
| ------------- | -------------------------- | --------------------------------------- |
| **Nature**    | Passive (static)           | Active (dynamic)                        |
| **Stored in** | Disk (secondary storage)   | Memory (RAM)                            |
| **Lifetime**  | Permanent until deleted    | Temporary (created and destroyed)       |
| **Resources** | None                       | CPU time, memory, files, I/O devices    |
| **Instances** | One copy on disk           | Multiple processes from one program     |
| **Contains**  | Instructions and data      | Instructions + data + state + resources |
| **Example**   | `/usr/bin/python3` on disk | Running Python script with PID 4521     |

> [!IMPORTANT]
> A single program can produce many processes. When you open three terminal windows, you have three separate processes all created from the same terminal program binary.

---

## Process in Memory

When a program is loaded into memory and becomes a process, the operating system organizes its memory into well-defined **segments**. Each segment serves a distinct purpose.

### Memory Layout Diagram

```text
High Address
┌─────────────────────────┐  ← 0xFFFFFFFF (on 32-bit)
│                         │
│       Kernel Space       │  ← Reserved for OS kernel
│                         │
├─────────────────────────┤  ← 0xC0000000 (typical boundary)
│                         │
│         Stack           │  ← Grows DOWNWARD ↓
│   (local variables,     │
│    function parameters,  │
│    return addresses)     │
│            ↓            │
│           ...            │
│                         │
│            ↑            │
│         Heap            │  ← Grows UPWARD ↑
│   (dynamically allocated │
│    memory: malloc, new)  │
│                         │
├─────────────────────────┤
│         BSS             │  ← Uninitialized global/static vars
│  (Block Started by      │     (zeroed by OS at load time)
│   Symbol)               │
├─────────────────────────┤
│         Data            │  ← Initialized global/static vars
│  (global int x = 42;)   │
├─────────────────────────┤
│         Text            │  ← Executable machine code
│  (read-only, sharable)  │     (instructions)
│                         │
└─────────────────────────┘  ← 0x00000000
Low Address
```

### Segment Details

| Segment   | Contents                                                | Permissions    | Growth              |
| --------- | ------------------------------------------------------- | -------------- | ------------------- |
| **Text**  | Compiled machine instructions                           | Read + Execute | Fixed size          |
| **Data**  | Initialized global and static variables                 | Read + Write   | Fixed size          |
| **BSS**   | Uninitialized global and static variables               | Read + Write   | Fixed size (zeroed) |
| **Heap**  | Dynamically allocated memory (`malloc`, `new`)          | Read + Write   | Grows upward ↑      |
| **Stack** | Local variables, function call frames, return addresses | Read + Write   | Grows downward ↓    |

> [!NOTE]
> The **BSS** segment gets its name from an old assembly directive meaning "Block Started by Symbol." The OS initializes all BSS variables to zero, so the executable file doesn't need to store their values — saving disk space.

### C Code Demonstrating Memory Segments

```c
#include <stdio.h>
#include <stdlib.h>

int global_init = 100;       // Data segment (initialized)
int global_uninit;            // BSS segment (uninitialized → 0)

int main() {
    int local_var = 42;       // Stack segment
    static int static_var;    // BSS segment (static, uninitialized)

    int *heap_var = (int *)malloc(sizeof(int));  // Heap segment
    *heap_var = 99;

    printf("Text segment:  main() is at       %p\n", (void *)main);
    printf("Data segment:  global_init at      %p = %d\n", &global_init, global_init);
    printf("BSS segment:   global_uninit at    %p = %d\n", &global_uninit, global_uninit);
    printf("BSS segment:   static_var at       %p = %d\n", &static_var, static_var);
    printf("Heap segment:  heap_var at         %p = %d\n", heap_var, *heap_var);
    printf("Stack segment: local_var at        %p = %d\n", &local_var, local_var);

    free(heap_var);
    return 0;
}
```

Running this program reveals the actual addresses assigned to each segment, confirming the layout described above.

---

## Process Creation

Processes don't appear from nowhere — they must be **created**. The mechanism differs between operating systems, but the core idea is the same: an existing process (the **parent**) creates a new process (the **child**).

### UNIX/Linux: `fork()` and `exec()`

In UNIX-like systems, process creation follows a two-step model:

1. **`fork()`** — Creates a new child process that is a near-exact _copy_ of the parent
2. **`exec()`** — Replaces the child's memory space with a new program

```text
Parent Process (PID 100)
        │
        │  fork()
        ├──────────────────┐
        │                  │
        ▼                  ▼
Parent (PID 100)     Child (PID 101)
 continues            exact copy of parent
        │                  │
        │                  │  exec("/bin/ls")
        │                  ▼
        │             Child now runs /bin/ls
        │             (new program image)
        │                  │
        │                  │  exit()
        │                  ▼
        │             Child terminates
        │
        ▼
   wait() returns
```

| Step | System Call  | What Happens                                                           |
| ---- | ------------ | ---------------------------------------------------------------------- |
| 1    | `fork()`     | OS creates child process; copies address space (with COW optimization) |
| 2    | Return value | Parent gets child's PID; child gets 0                                  |
| 3    | `exec()`     | Child replaces its image with a new program (optional)                 |
| 4    | `wait()`     | Parent blocks until child terminates                                   |
| 5    | `exit()`     | Child terminates, returns status to parent                             |

### Windows: `CreateProcess()`

Windows combines `fork()` and `exec()` into a single call:

```text
CreateProcess("C:\\Windows\\notepad.exe", ...)
    → Creates a new process AND loads the specified program in one step
```

| Feature               | UNIX `fork()` + `exec()`                | Windows `CreateProcess()`    |
| --------------------- | --------------------------------------- | ---------------------------- |
| **Steps**             | Two separate calls                      | One combined call            |
| **Child copy**        | Yes (child is clone of parent)          | No (loads fresh program)     |
| **Flexibility**       | Child can run parent's code before exec | Must specify program upfront |
| **Address space**     | Inherited then replaced                 | New from scratch             |
| **Parent-child link** | Strong hierarchy (PPID)                 | Handle-based (more flexible) |

---

## Process Hierarchy

UNIX systems organize processes in a **tree structure**. Every process has exactly one parent (except the very first process), and can have multiple children.

### The Process Tree

```text
                        init / systemd (PID 1)
                       /          |           \
                      /           |            \
               sshd (PID 50)  cron (PID 60)  login (PID 70)
              /       \                          |
             /         \                         |
        bash (PID 200)  bash (PID 201)     bash (PID 300)
           |                 |                   |
           |                 |                   |
       vim (PID 500)    python (PID 510)    gcc (PID 600)
                                               / \
                                              /   \
                                        cc1 (PID 601) as (PID 602)
```

> [!NOTE]
> On modern Linux systems, **`systemd`** (PID 1) replaces the traditional `init` as the root of the process tree. It is the ancestor of all user-space processes.

### Key Terminology

| Term               | Definition                                                                 |
| ------------------ | -------------------------------------------------------------------------- |
| **Parent Process** | The process that created this process via `fork()`                         |
| **Child Process**  | A process created by another process                                       |
| **PPID**           | Parent Process ID — stored in every process                                |
| **Orphan Process** | A process whose parent has terminated; adopted by `init`/`systemd`         |
| **Zombie Process** | A terminated process whose exit status hasn't been collected by its parent |
| **Daemon**         | A background process without a controlling terminal                        |

---

## Fork Example in C

Here is a complete C program demonstrating `fork()`:

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid;
    int x = 10;

    printf("Before fork: PID = %d, x = %d\n", getpid(), x);

    pid = fork();  // Create child process

    if (pid < 0) {
        // Fork failed
        perror("fork failed");
        exit(1);
    }
    else if (pid == 0) {
        // ---- Child process ----
        printf("Child:  PID = %d, Parent PID = %d\n", getpid(), getppid());
        x = x + 20;  // Modify x in child's own copy
        printf("Child:  x = %d (modified in child)\n", x);
        exit(0);
    }
    else {
        // ---- Parent process ----
        printf("Parent: PID = %d, Child PID = %d\n", getpid(), pid);
        wait(NULL);  // Wait for child to finish
        printf("Parent: x = %d (unchanged in parent)\n", x);
    }

    printf("Process %d exiting.\n", getpid());
    return 0;
}
```

**Expected output:**

```text
Before fork: PID = 1000, x = 10
Parent: PID = 1000, Child PID = 1001
Child:  PID = 1001, Parent PID = 1000
Child:  x = 30 (modified in child)
Parent: x = 10 (unchanged in parent)
Process 1000 exiting.
```

> [!TIP]
> Notice that `x` is modified to 30 in the child but remains 10 in the parent. After `fork()`, parent and child have **separate copies** of the address space. Changes in one do not affect the other.

### Fork Puzzle

How many processes does this code create?

```c
fork();
fork();
fork();
```

The answer is $2^3 = 8$ total processes (including the original). Each `fork()` doubles the number of existing processes:

$$\text{Total processes} = 2^n \quad \text{where } n = \text{number of fork() calls}$$

---

## Viewing Processes on a Live System

### The `ps` Command

```bash
# Show processes for the current user
ps

# Show all processes with full details
ps aux

# Show process tree
ps axjf

# Show specific columns
ps -eo pid,ppid,state,cmd --sort=-pcpu | head -20
```

| `ps` Column | Meaning                          |
| ----------- | -------------------------------- |
| `PID`       | Process ID                       |
| `PPID`      | Parent Process ID                |
| `%CPU`      | CPU usage percentage             |
| `%MEM`      | Memory usage percentage          |
| `STAT`      | Process state (R, S, D, Z, T)    |
| `CMD`       | Command that started the process |
| `TIME`      | Cumulative CPU time              |
| `TTY`       | Controlling terminal             |

### The `top` and `htop` Commands

```bash
# Real-time process viewer
top

# Enhanced interactive viewer (install with: sudo apt install htop)
htop
```

| Feature           | `top`               | `htop`                 |
| ----------------- | ------------------- | ---------------------- |
| **Display**       | Text-based, minimal | Colorful, bar graphs   |
| **Scroll**        | Limited             | Full scrolling         |
| **Process tree**  | Not built-in        | Press F5 for tree view |
| **Mouse support** | No                  | Yes                    |
| **Kill process**  | Press `k`           | Press F9               |
| **Filter**        | Press `o`           | Press F4               |

---

## The `/proc` Filesystem

Linux exposes detailed process information through the `/proc` virtual filesystem. Each running process has a directory `/proc/<PID>/` containing files with process metadata.

```bash
# List information about process with PID 1234
ls /proc/1234/

# Key files in /proc/<PID>/
cat /proc/1234/status    # Human-readable status
cat /proc/1234/cmdline   # Command line arguments
cat /proc/1234/maps      # Memory mappings
cat /proc/1234/stat      # Raw status information
cat /proc/1234/environ   # Environment variables
ls -la /proc/1234/fd/    # Open file descriptors
```

| File      | Contents                                                |
| --------- | ------------------------------------------------------- |
| `status`  | PID, state, memory usage, threads, UID, GID             |
| `cmdline` | Full command line (null-separated)                      |
| `maps`    | Virtual memory regions (text, heap, stack, shared libs) |
| `stat`    | Raw process stats (used by `ps` and `top`)              |
| `environ` | Environment variables                                   |
| `fd/`     | Directory of symbolic links to open files               |
| `cwd`     | Symbolic link to current working directory              |
| `exe`     | Symbolic link to the executable binary                  |

### Python Script to Explore `/proc`

```python
import os

def get_process_info(pid):
    """Read key information from /proc for a given PID."""
    proc_dir = f"/proc/{pid}"

    if not os.path.exists(proc_dir):
        print(f"Process {pid} does not exist.")
        return

    # Read status file
    with open(f"{proc_dir}/status") as f:
        for line in f:
            if line.startswith(("Name:", "State:", "Pid:", "PPid:", "VmSize:", "Threads:")):
                print(line.strip())

    # Read command line
    with open(f"{proc_dir}/cmdline") as f:
        cmdline = f.read().replace('\x00', ' ').strip()
        print(f"Command: {cmdline}")

# Explore current process
get_process_info(os.getpid())

# List first 10 running processes
print("\n--- Running Processes ---")
pids = sorted([int(d) for d in os.listdir("/proc") if d.isdigit()])[:10]
for pid in pids:
    try:
        with open(f"/proc/{pid}/status") as f:
            name = f.readline().split(":")[1].strip()
            state = f.readline().split(":")[1].strip()
            print(f"PID {pid:>6}: {name:<20} State: {state}")
    except (PermissionError, FileNotFoundError):
        pass
```

> [!WARNING]
> The `/proc` filesystem is Linux-specific. macOS uses `sysctl` and the Mach API instead, while Windows exposes process info through the Win32 API and tools like Task Manager.

---

## Process Address Space in Detail

The `size` command in Linux reveals the size of each segment in a compiled executable:

```bash
$ gcc -o hello hello.c
$ size hello
   text    data     bss     dec     hex filename
   1518     600       8    2126     84e hello
```

```text
Segment Sizes Comparison:
┌────────────────────────────────────────────────┐
│ Segment │  Static Program  │  Running Process  │
├─────────┼──────────────────┼───────────────────┤
│  Text   │   In binary ✓    │  Loaded to RAM    │
│  Data   │   In binary ✓    │  Loaded to RAM    │
│  BSS    │   Size only      │  Zeroed in RAM    │
│  Heap   │   Not in binary  │  Created at run   │
│  Stack  │   Not in binary  │  Created at run   │
└────────────────────────────────────────────────┘
```

---

## Try It Yourself

**Exercise 1:** Write a C program that forks a child process. The parent should print even numbers from 0 to 10, and the child should print odd numbers from 1 to 9. Use `wait()` to ensure proper ordering.

:::details Solution

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork();

    if (pid < 0) {
        perror("fork");
        exit(1);
    } else if (pid == 0) {
        // Child: print odd numbers
        for (int i = 1; i <= 9; i += 2)
            printf("Child [%d]: %d\n", getpid(), i);
        exit(0);
    } else {
        // Parent: wait for child, then print even numbers
        wait(NULL);
        for (int i = 0; i <= 10; i += 2)
            printf("Parent [%d]: %d\n", getpid(), i);
    }
    return 0;
}
```

:::

**Exercise 2:** How many processes are created by the following code (including the original process)?

```c
fork();
fork();
if (fork() == 0) {
    fork();
}
```

:::details Solution
Let's trace step by step:

- After first `fork()`: 2 processes
- After second `fork()`: 4 processes
- After third `fork()`: 8 processes, but only 4 of them (the children where `fork() == 0`) execute the inner `fork()`
- After inner `fork()`: 4 children create 4 more = 8 + 4 = **12 total processes**

Wait — let's recount carefully:

1. Start: 1 process
2. `fork()` → 2 processes
3. `fork()` → 4 processes
4. `fork()` → 8 processes (4 parents + 4 children)
5. Only 4 children (where return == 0) call `fork()` → 4 + 4 = 8, plus the 4 parents = **12 total processes**
   :::

**Exercise 3:** Use the `/proc` filesystem (or `ps`) to find the PID, parent PID, and state of your current shell process. What is the chain of ancestors back to PID 1?

:::details Solution

```bash
# Find your shell's PID
echo $$

# Find its parent
cat /proc/$$/status | grep -E "^(Name|Pid|PPid|State)"

# Trace ancestry back to PID 1
pid=$$
while [ "$pid" != "1" ] && [ "$pid" != "0" ]; do
    name=$(cat /proc/$pid/status 2>/dev/null | grep "^Name:" | awk '{print $2}')
    ppid=$(cat /proc/$pid/status 2>/dev/null | grep "^PPid:" | awk '{print $2}')
    echo "PID $pid: $name (parent: $ppid)"
    pid=$ppid
done
echo "PID 1: $(cat /proc/1/status | grep '^Name:' | awk '{print $2}')"
```

A typical chain might look like: `bash → sshd → systemd (PID 1)`
:::

---

## Key Takeaways

- A **program** is a passive file on disk; a **process** is that program actively running in memory with its own state and resources.
- A process's memory is divided into **five segments**: text (code), data (initialized globals), BSS (uninitialized globals), heap (dynamic allocation growing upward), and stack (function calls growing downward).
- In UNIX, processes are created with **`fork()`** (clone parent) followed by **`exec()`** (load new program). Windows combines these into `CreateProcess()`.
- Processes form a **tree hierarchy** — every process has a parent, and `init`/`systemd` (PID 1) is the root ancestor of all user processes.
- **Orphan processes** are adopted by `init`; **zombie processes** have terminated but await their parent to collect their exit status.
- Linux exposes rich process metadata through the **`/proc`** virtual filesystem, and tools like `ps`, `top`, and `htop` make process inspection easy.
- After `fork()`, parent and child have **separate address spaces** — modifications in one do not affect the other.
