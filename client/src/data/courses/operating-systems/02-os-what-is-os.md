---
title: What is an Operating System
section: "Introduction & Foundations"
---

# What is an Operating System

Every time you open an application, save a file, or even move your mouse, dozens of complex operations happen behind the scenes. The **operating system (OS)** is the software that orchestrates all of this. In this lesson, we define what an operating system is, explore its two fundamental roles — _resource manager_ and _extended machine_ — and examine its major components.

---

## Defining an Operating System

There is no single universally agreed-upon definition, but three authoritative ones capture the essence.

> "An operating system is a program that acts as an intermediary between a user of a computer and the computer hardware."
> — Abraham Silberschatz, _Operating System Concepts_

> "The operating system is the most fundamental piece of software that manages hardware resources and provides services to application programs."
> — Andrew S. Tanenbaum, _Modern Operating Systems_

**Working Definition:** An operating system is a layer of software that (1) manages all hardware resources — CPU, memory, storage, and I/O devices — and (2) provides a convenient, abstract interface so that users and applications do not need to deal with raw hardware details.

| Aspect                  | What the OS Does                                      |
| ----------------------- | ----------------------------------------------------- |
| **Abstraction**         | Hides hardware complexity behind clean APIs           |
| **Resource Management** | Allocates CPU time, memory, disk space, I/O bandwidth |
| **Protection**          | Prevents one program from corrupting another          |
| **Coordination**        | Manages concurrent access to shared resources         |
| **Convenience**         | Provides a user interface (shell, GUI)                |

> [!NOTE]
> The _kernel_ is the core part of the OS that runs in privileged mode. The term "operating system" sometimes also includes system utilities, shells, and libraries that ship alongside the kernel.

---

## The OS as a Resource Manager

Think of the OS as the **manager of a busy restaurant**. The kitchen (CPU) can only cook so many dishes at once. The manager decides which orders get cooked first, ensures the pantry (memory) is stocked, assigns waiters (I/O channels) to tables, and makes sure one table's order does not get mixed up with another's.

```text
+---------------------------------------------------------------+
|                        APPLICATIONS                           |
|   Browser    Editor    Game    Music Player    Compiler        |
+------+--------+--------+--------+---------+------------------+
       |        |        |        |         |
       v        v        v        v         v
+---------------------------------------------------------------+
|                   OPERATING  SYSTEM                           |
|                                                               |
|   +----------+  +----------+  +--------+  +---------------+  |
|   |  CPU     |  |  Memory  |  |  File  |  |  I/O Device   |  |
|   |  Sched-  |  |  Manager |  |  System|  |  Manager      |  |
|   |  uler    |  |          |  |        |  |               |  |
|   +----------+  +----------+  +--------+  +---------------+  |
+------+--------+--------+--------+---------+------------------+
       |        |        |        |         |
       v        v        v        v         v
+---------------------------------------------------------------+
|                     HARDWARE                                  |
|   CPU Cores    RAM    SSD / HDD    NIC    GPU    USB          |
+---------------------------------------------------------------+
```

### Resources the OS Manages

| Resource        | What the OS Decides                   | Key Challenge                   |
| --------------- | ------------------------------------- | ------------------------------- |
| **CPU**         | Which process runs and for how long   | Fairness vs responsiveness      |
| **Memory**      | Which process gets how much RAM       | Fragmentation, protection       |
| **Storage**     | Where files are stored on disk        | Allocation, free-space tracking |
| **I/O Devices** | Which process can access which device | Concurrency, buffering          |
| **Network**     | Socket allocation, packet routing     | Bandwidth sharing               |

**Multiplexing** is a key concept: the OS shares resources across multiple programs.

| Multiplexing Type      | Meaning                        | Example                                         |
| ---------------------- | ------------------------------ | ----------------------------------------------- |
| **Time multiplexing**  | Resource is shared over time   | CPU scheduling — each process gets a time slice |
| **Space multiplexing** | Resource is divided into parts | Memory — each process gets a region of RAM      |

---

## The OS as an Extended (Virtual) Machine

Raw hardware is extremely difficult to program. Consider writing to a hard disk: you would need to send commands to the disk controller, specify cylinder/head/sector addresses, handle timing, detect errors, and retry on failure. The OS abstracts all of this into a simple call like `write(fd, buffer, size)`.

| Without OS (Raw Hardware)              | With OS (Abstraction)            |
| -------------------------------------- | -------------------------------- |
| Program disk controller registers      | `open("file.txt", O_WRONLY)`     |
| Calculate cylinder-head-sector         | `write(fd, data, len)`           |
| Busy-wait for disk interrupt           | `close(fd)`                      |
| Handle error recovery manually         | OS handles errors transparently  |
| No protection — any bug crashes system | Protected virtual address spaces |

> "The function of the operating system is to present the user with the equivalent of an **extended machine** or **virtual machine** that is easier to program than the underlying hardware."
> — Andrew S. Tanenbaum

### Layers of Abstraction

```text
+---------------------------------------------+
|             User Applications                |
|  (Browser, Editor, Game, Custom Programs)    |
+---------------------------------------------+
|           System Libraries                   |
|  (glibc, libc, Win32 API, POSIX)            |
+---------------------------------------------+
|           System Call Interface              |
|  (read, write, fork, exec, mmap, ioctl)     |
+=============================================+  <-- Privilege Boundary
|               KERNEL                         |
|  Process Mgmt | Memory Mgmt | File System   |
|  I/O Subsystem | Networking | Security      |
+---------------------------------------------+
|           Device Drivers                     |
|  (disk, NIC, GPU, USB, keyboard)            |
+---------------------------------------------+
|              HARDWARE                        |
|  CPU | RAM | Disk | NIC | Display | ...     |
+---------------------------------------------+
```

---

## User Mode vs Kernel Mode

Modern CPUs provide at least two privilege levels to protect the OS from errant applications.

| Feature            | User Mode                                    | Kernel Mode                                        |
| ------------------ | -------------------------------------------- | -------------------------------------------------- |
| **Privilege**      | Restricted — cannot access hardware directly | Full — can execute any instruction                 |
| **Memory access**  | Only the process's own virtual address space | All physical memory                                |
| **Instructions**   | Cannot execute privileged instructions       | Can execute all instructions (e.g., `HLT`, `LGDT`) |
| **Failure impact** | Only the offending process crashes           | Entire system may crash (kernel panic)             |
| **Example code**   | Your C program, Python script                | Scheduler, device drivers, memory manager          |

### Privilege Rings (x86 Architecture)

```text
+---------------------------------------------------+
|                                                   |
|     Ring 3 — User Applications                    |
|     (Browsers, editors, games)                    |
|                                                   |
|   +-------------------------------------------+   |
|   |                                           |   |
|   |     Ring 2 — Device Drivers (rarely used) |   |
|   |                                           |   |
|   |   +-----------------------------------+   |   |
|   |   |                                   |   |   |
|   |   |   Ring 1 — OS Services            |   |   |
|   |   |          (rarely used)            |   |   |
|   |   |                                   |   |   |
|   |   |   +---------------------------+   |   |   |
|   |   |   |                           |   |   |   |
|   |   |   |   Ring 0 — KERNEL         |   |   |   |
|   |   |   |   (Full hardware access)  |   |   |   |
|   |   |   |                           |   |   |   |
|   |   |   +---------------------------+   |   |   |
|   |   +-----------------------------------+   |   |
|   +-------------------------------------------+   |
+---------------------------------------------------+

Most modern OSes use only Ring 0 (kernel) and Ring 3 (user).
```

### How a Mode Switch Happens

1. A user program calls a library function (e.g., `printf()`).
2. The library translates it into a system call (e.g., `write()`).
3. A **trap** instruction (e.g., `INT 0x80` or `SYSCALL`) switches the CPU to kernel mode.
4. The kernel performs the requested operation.
5. The kernel returns the result and switches the CPU back to user mode.

```c
// Example: A simple write in C triggers a user→kernel mode switch
#include <unistd.h>

int main() {
    // This write() call triggers a system call
    // CPU switches from user mode → kernel mode → user mode
    write(STDOUT_FILENO, "Hello, OS!\n", 11);
    return 0;
}
```

> [!WARNING]
> If user-mode code could execute privileged instructions directly, a single buggy or malicious program could crash the entire system, corrupt other processes' memory, or access restricted hardware.

---

## OS Components Overview

An operating system is made up of several cooperating subsystems. Here is an overview:

| Component             | Responsibility                                       | Key Data Structures                      |
| --------------------- | ---------------------------------------------------- | ---------------------------------------- |
| **Process Manager**   | Create, schedule, terminate processes; handle IPC    | PCB (Process Control Block), ready queue |
| **Memory Manager**    | Allocate/deallocate memory, implement virtual memory | Page tables, frame tables, TLB           |
| **File System**       | Organize, store, retrieve, and protect files         | Inodes, directory entries, superblock    |
| **I/O Subsystem**     | Manage device drivers, buffering, caching, spooling  | Device tables, I/O request queues        |
| **Network Subsystem** | Implement protocols (TCP/IP), manage sockets         | Socket tables, routing tables            |
| **Security Module**   | Authentication, access control, auditing             | ACLs, capability lists, credentials      |

### How Components Interact

```text
    User Process
         |
         | system call
         v
  +------+------+
  | System Call  |
  | Interface    |
  +------+------+
         |
    +----+----+----+----+----+
    |    |    |    |    |    |
    v    v    v    v    v    v
  Proc  Mem  File  I/O  Net  Sec
  Mgr   Mgr  Sys   Sub  Sub  Mod
    |    |    |    |    |    |
    +----+----+----+----+----+
         |
         v
    Hardware Abstraction Layer
         |
         v
      Hardware
```

---

## Where the OS Sits in the System Stack

It is helpful to see the complete picture — from hardware to the human user:

```text
+=========================================+
|             USERS                       |
|   (People interacting with the system)  |
+=========================================+
|         APPLICATION PROGRAMS            |
|   (Web browser, compiler, game, DB)     |
+-----------------------------------------+
|         SYSTEM PROGRAMS                 |
|   (Shell, text editor, compiler tools)  |
+-----------------------------------------+
|         OPERATING SYSTEM                |
|   (Kernel + system libraries)           |
+-----------------------------------------+
|         HARDWARE                        |
|   (CPU, memory, disks, I/O devices)     |
+=========================================+
```

| Layer                | Examples                                   | Who Writes It          |
| -------------------- | ------------------------------------------ | ---------------------- |
| Users                | End users, system administrators           | —                      |
| Application Programs | Chrome, VS Code, Python interpreter        | Application developers |
| System Programs      | bash, gcc, ls, cp, grep                    | System programmers     |
| Operating System     | Linux kernel, Windows NT kernel, macOS XNU | OS developers          |
| Hardware             | Intel Core i9, 32 GB DDR5, NVMe SSD        | Hardware manufacturers |

---

## Modern Operating Systems Comparison

| Feature                    | Linux                       | Windows              | macOS                     | Android              | iOS                 |
| -------------------------- | --------------------------- | -------------------- | ------------------------- | -------------------- | ------------------- |
| **Kernel**                 | Monolithic (modular)        | Hybrid (NT kernel)   | Hybrid (XNU = Mach + BSD) | Linux-based          | XNU-based           |
| **Source model**           | Open source (GPL)           | Proprietary          | Partially open (Darwin)   | Open source (AOSP)   | Proprietary         |
| **Primary use**            | Servers, desktops, embedded | Desktops, enterprise | Desktops, creative work   | Smartphones, tablets | iPhones, iPads      |
| **File system**            | ext4, Btrfs, XFS            | NTFS, ReFS           | APFS                      | ext4, F2FS           | APFS                |
| **Shell**                  | bash, zsh, fish             | cmd, PowerShell      | zsh (default)             | sh (via adb)         | Not user-accessible |
| **Package manager**        | apt, dnf, pacman            | winget, chocolatey   | Homebrew                  | APK (Play Store)     | App Store           |
| **Market share (desktop)** | ~3-4%                       | ~72%                 | ~15%                      | N/A                  | N/A                 |
| **Market share (mobile)**  | N/A                         | N/A                  | N/A                       | ~72%                 | ~27%                |

> [!TIP]
> Linux dominates the **server** market (>90% of cloud instances run Linux), while Windows leads the **desktop** market. Understanding both ecosystems is valuable.

---

## A Simple OS Interaction in Code

Let us see how user code interacts with the OS via system calls. The following Python program uses the `os` module, which wraps native system calls:

```python
import os

# Get the process ID (maps to getpid() system call)
pid = os.getpid()
print(f"My Process ID: {pid}")

# Get the current working directory (maps to getcwd() system call)
cwd = os.getcwd()
print(f"Working Directory: {cwd}")

# List files in current directory (maps to getdents() system call)
files = os.listdir(".")
print(f"Files here: {files[:5]}")  # show first 5

# Create a new directory (maps to mkdir() system call)
os.makedirs("test_dir", exist_ok=True)
print("Created test_dir/")
```

And the equivalent in C, showing the system calls more explicitly:

```c
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>

int main() {
    // getpid() — returns process ID
    pid_t pid = getpid();
    printf("My Process ID: %d\n", pid);

    // getcwd() — returns current working directory
    char cwd[256];
    getcwd(cwd, sizeof(cwd));
    printf("Working Directory: %s\n", cwd);

    // mkdir() — creates a new directory
    mkdir("test_dir", 0755);
    printf("Created test_dir/\n");

    return 0;
}
```

---

## Dual-Mode Operation — A Deeper Look

The mode bit in the CPU's status register controls whether the processor is in user mode or kernel mode.

| Event              | Mode Transition | Triggered By                                  |
| ------------------ | --------------- | --------------------------------------------- |
| System call        | User → Kernel   | `SYSCALL` / `INT 0x80` instruction            |
| System call return | Kernel → User   | `SYSRET` / `IRET` instruction                 |
| Hardware interrupt | User → Kernel   | Timer, disk, keyboard, network                |
| Exception / Fault  | User → Kernel   | Division by zero, page fault, segfault        |
| Process start      | Kernel → User   | Kernel loads process and jumps to entry point |

$$\text{Mode Bit} = \begin{cases} 0 & \text{Kernel Mode (privileged)} \\ 1 & \text{User Mode (restricted)} \end{cases}$$

> [!IMPORTANT]
> The dual-mode mechanism is the **foundation** of OS security. Without it, there is no way to prevent a user program from directly accessing hardware or another process's memory.

---

## Common Misconceptions

| Misconception                               | Reality                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| "The OS is just the GUI"                    | The GUI is a small part; the kernel does the heavy lifting                |
| "Linux has no GUI"                          | Linux supports many GUIs (GNOME, KDE, etc.); the kernel itself has no GUI |
| "The OS runs all the time"                  | The OS runs only when invoked via system calls, interrupts, or exceptions |
| "Applications talk to hardware directly"    | In modern OSes, all hardware access goes through the kernel               |
| "More RAM means no need for virtual memory" | Virtual memory provides protection and abstraction, not just extra space  |

---

## Try It Yourself

**Exercise 1:** List three differences between user mode and kernel mode. For each, explain why that difference is important for system stability.

:::details Solution

1. **Privileged instructions:** Kernel mode can execute instructions like `HLT` (halt CPU) and `LGDT` (load global descriptor table). If user programs could halt the CPU, any program could freeze the entire system.

2. **Memory access:** Kernel mode can access all physical memory; user mode is restricted to the process's virtual address space. This prevents one process from reading or writing another process's data.

3. **Hardware access:** Kernel mode can interact with I/O ports and device registers directly. Restricting this to the kernel ensures that device access is serialized and buffered, preventing data corruption.
   :::

**Exercise 2:** Consider the following sequence of events. For each, state whether the CPU is in user mode or kernel mode.

| Step | Event                                              | Mode? |
| ---- | -------------------------------------------------- | ----- |
| 1    | User types a command in the terminal               | ?     |
| 2    | The shell calls `fork()` to create a child process | ?     |
| 3    | The child process is initialized by the kernel     | ?     |
| 4    | The child process starts executing user code       | ?     |
| 5    | A timer interrupt fires                            | ?     |

:::details Solution
| Step | Event | Mode |
|------|-------|------|
| 1 | User types a command in the terminal | **User mode** — the shell is a user-level program |
| 2 | The shell calls `fork()` to create a child process | **Kernel mode** — `fork()` is a system call; the CPU traps into the kernel |
| 3 | The child process is initialized by the kernel | **Kernel mode** — still inside the kernel handling the fork |
| 4 | The child process starts executing user code | **User mode** — the kernel switches to user mode before jumping to the program's entry point |
| 5 | A timer interrupt fires | **Kernel mode** — hardware interrupts always transfer control to the kernel |
:::

**Exercise 3:** Draw your own ASCII diagram of the computer system stack for a smartphone running Android. Label each layer with at least one concrete example.

:::details Solution

```text
+==========================================+
|              USERS                       |
|   (Person tapping the screen)            |
+==========================================+
|         APPLICATION LAYER                |
|   (Instagram, WhatsApp, Chrome)          |
+------------------------------------------+
|         APPLICATION FRAMEWORK            |
|   (Activity Manager, Content Providers)  |
+------------------------------------------+
|         ANDROID RUNTIME (ART)            |
|   (Dalvik bytecode interpreter, JNI)     |
+------------------------------------------+
|         HARDWARE ABSTRACTION LAYER       |
|   (Camera HAL, Audio HAL, Sensors HAL)   |
+------------------------------------------+
|         LINUX KERNEL                     |
|   (Binder IPC, power mgmt, drivers)     |
+------------------------------------------+
|         HARDWARE                         |
|   (Snapdragon SoC, 8 GB RAM, Flash)     |
+==========================================+
```

:::

---

## Key Takeaways

- An **operating system** is software that manages hardware resources and provides abstractions for user programs.
- The OS plays two fundamental roles: **resource manager** (allocating CPU, memory, I/O) and **extended machine** (hiding hardware complexity behind simple APIs).
- Modern CPUs support **dual-mode operation** (user mode and kernel mode) to protect the OS from errant applications.
- The OS sits between hardware and applications in the system stack, acting as a mediator.
- Major OS components include the **process manager**, **memory manager**, **file system**, **I/O subsystem**, and **security module**.
- All modern operating systems — Linux, Windows, macOS, Android, iOS — share these fundamental concepts, even though their implementations differ.
- System calls are the **gateway** from user space to kernel space; we will explore them in detail in Lesson 06.
