---
title: OS Structure & Components
section: "Introduction & Foundations"
---

# OS Structure & Components

How you organize the code inside an operating system determines its performance, reliability, security, and maintainability. Over the decades, engineers have tried radically different architectural approaches — from cramming everything into one big program to splitting the OS into dozens of communicating micro-services. In this lesson we explore six major OS structures, compare their trade-offs, and take a deep dive into how Linux and Windows NT are organized internally.

---

## Why OS Structure Matters

| Concern             | How Structure Affects It                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------- |
| **Performance**     | Monolithic kernels avoid message-passing overhead; microkernels pay the cost              |
| **Reliability**     | A bug in a monolithic kernel crashes everything; in a microkernel, only one service fails |
| **Security**        | Smaller kernels have a smaller attack surface                                             |
| **Maintainability** | Well-layered or modular designs are easier to understand and modify                       |
| **Portability**     | Clean abstractions (HAL, layered design) make porting easier                              |

> "The structure of a system reflects the structure of the organization that built it."
> — Conway's Law (paraphrased)

---

## 1. Simple / Monolithic Structure

In a **monolithic kernel**, the entire operating system runs as a single program in kernel mode. All OS services — process management, memory management, file systems, device drivers, networking — share the same address space.

### Early Example: MS-DOS

MS-DOS had **no clear separation** between user programs and the OS. Application programs could directly access hardware, and there was no memory protection.

```text
MS-DOS Structure (Simplified)
===============================

  +---------------------------+
  |   Application Programs    |  ← Could directly access I/O!
  +---------------------------+
  |   Resident System Program |
  |   (COMMAND.COM)           |
  +---------------------------+
  |   MS-DOS Device Drivers   |
  +---------------------------+
  |   ROM BIOS Drivers        |
  +---------------------------+
  |   Hardware                |
  +---------------------------+

  No protection rings. No virtual memory.
  A crash in any program could take down everything.
```

### Traditional UNIX Monolithic Kernel

Traditional UNIX (and early Linux) used a more structured monolithic approach:

```text
Traditional UNIX Kernel Structure
====================================

  +-----------------------------------------------------+
  |                USER PROGRAMS                         |
  +========================+============================+
  |    Trap / System Call Interface                      |
  +-----------------------------------------------------+
  |                                                     |
  |    +----------+  +---------+  +------------------+  |
  |    | Process  |  | Memory  |  | File Subsystem   |  |
  |    | Control  |  | Mgmt    |  | (inodes, dirs,   |  |
  |    | (sched,  |  | (paging,|  |  buffer cache)   |  |
  |    |  IPC,    |  |  VMM)   |  |                  |  |
  |    |  signals)|  |         |  |                  |  |
  |    +----------+  +---------+  +------------------+  |
  |                                                     |
  |    +----------+  +---------+  +------------------+  |
  |    | Block    |  | Char    |  | Network          |  |
  |    | Device   |  | Device  |  | Subsystem        |  |
  |    | Drivers  |  | Drivers |  | (TCP/IP, sockets)|  |
  |    +----------+  +---------+  +------------------+  |
  |                                                     |
  +-----------------------------------------------------+
  |              Hardware Control                       |
  |   (interrupts, DMA, MMU, I/O ports)                 |
  +-----------------------------------------------------+
  |              HARDWARE                               |
  +-----------------------------------------------------+

  Everything inside the box runs in Ring 0 (kernel mode).
```

### Advantages and Disadvantages

| Advantages                                         | Disadvantages                                               |
| -------------------------------------------------- | ----------------------------------------------------------- |
| **Fast** — no mode switches for internal calls     | A bug in any component can crash the whole kernel           |
| **Simple communication** — direct function calls   | Difficult to maintain as codebase grows (Linux: 30M+ lines) |
| **Efficient** — minimal overhead for OS operations | Hard to port — components tightly coupled                   |
| **Mature** — well-tested, widely deployed          | Large attack surface — all code runs with full privileges   |

> [!NOTE]
> Despite its disadvantages, the monolithic design remains dominant in practice. Linux and most UNIX variants use monolithic kernels (with some modular extensions).

---

## 2. Layered Approach

The **layered approach** organizes the OS as a hierarchy of layers. Each layer uses only the services of the layer directly below it and provides services to the layer above.

### The THE System (Dijkstra, 1968)

Edsger Dijkstra designed the **THE** (Technische Hogeschool Eindhoven) multiprogramming system as six layers:

```text
THE Operating System — Layered Design
========================================

  Layer 5:  User Programs (operators)
  -------------------------------------------------------
  Layer 4:  Buffering for I/O devices
  -------------------------------------------------------
  Layer 3:  Operator Console driver
  -------------------------------------------------------
  Layer 2:  Memory Management (virtual memory)
  -------------------------------------------------------
  Layer 1:  CPU Scheduling (process management)
  -------------------------------------------------------
  Layer 0:  Hardware

  Each layer can ONLY call the layer directly below it.
  Layer N sees layers 0..N-1 as "virtual hardware."
```

### General Layered Model

```text
Layered OS Structure (General)
================================

  +-----------------------------------+  Layer N
  |          User Interface           |
  +-----------------------------------+  Layer N-1
  |          File System              |
  +-----------------------------------+  Layer N-2
  |          I/O Management           |
  +-----------------------------------+  Layer N-3
  |          Memory Management        |
  +-----------------------------------+  Layer N-4
  |          CPU Scheduling           |
  +-----------------------------------+  Layer 0
  |          Hardware                 |
  +-----------------------------------+

  Information hiding: each layer knows
  nothing about the layers above it.
```

### Advantages and Disadvantages

| Advantages                                                         | Disadvantages                                                                                                       |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **Modularity** — each layer can be tested independently            | **Performance overhead** — each layer boundary adds a function call                                                 |
| **Abstraction** — layer N only depends on layer N-1                | **Difficult to define layers** — what goes where? (e.g., does the file system go above or below memory management?) |
| **Ease of debugging** — test from bottom up                        | **Inflexible** — cannot skip layers for performance                                                                 |
| **Information hiding** — changes in one layer do not affect others | Few real OSes use pure layering                                                                                     |

> [!TIP]
> While pure layering is rare in production OSes, the _concept_ of layered design influences every modern OS. Even monolithic kernels have internal layers (HAL, core kernel, subsystems, drivers).

---

## 3. Microkernel Architecture

A **microkernel** keeps only the absolute minimum in kernel mode — typically just IPC (inter-process communication), basic scheduling, and low-level memory management. Everything else (file systems, device drivers, networking) runs as **user-space servers**.

### Design Philosophy

> "Move as much as possible out of the kernel and into user space."
> — The microkernel principle

```text
Microkernel Architecture
==========================

  +-------+  +------+  +-------+  +--------+  +-------+
  | File  |  |Device|  |Network|  |Process |  | App   |
  |System |  |Driver|  |Server |  |Server  |  |       |
  |Server |  |      |  |       |  |        |  |       |
  +---+---+  +--+---+  +---+---+  +---+----+  +---+---+
      |         |           |          |           |
  ====+=========+===========+==========+===========+====
  |                                                    |
  |            USER SPACE (Ring 3)                      |
  |                                                    |
  +====================================================+
  |                 MICROKERNEL (Ring 0)                |
  |                                                    |
  |   +-------+   +----------+   +------------------+ |
  |   |  IPC  |   | Basic    |   | Low-level Memory | |
  |   |       |   | Scheduler|   | Management       | |
  |   +-------+   +----------+   +------------------+ |
  |                                                    |
  +====================================================+
  |                   HARDWARE                         |
  +----------------------------------------------------+

  OS services communicate via message passing through
  the microkernel, not direct function calls.
```

### Message Passing Example

When a user program wants to read a file:

```text
File Read via Microkernel Message Passing
============================================

  User Process          Microkernel         File Server
  +-----------+        +-----------+       +-----------+
  | read()    |  msg   |           |  msg  |           |
  | request --+------->| route msg +------>| handle    |
  |           |        |           |       | request   |
  |           |  msg   |           |  msg  | read disk |
  | receive <-+--------+ route msg |<------+ send data |
  | data      |        |           |       |           |
  +-----------+        +-----------+       +-----------+

  Note: At least 4 mode switches (user→kernel→user→kernel)
  compared to 2 in a monolithic kernel.
```

### Microkernel Examples

| Microkernel      | Year | Use Case                                          |
| ---------------- | ---- | ------------------------------------------------- |
| **Mach**         | 1985 | Research (CMU); basis for macOS XNU               |
| **MINIX 3**      | 2005 | High-reliability, self-healing OS                 |
| **QNX Neutrino** | 2001 | Automotive, medical, industrial                   |
| **L4** (seL4)    | 1993 | Formally verified microkernel                     |
| **GNU Hurd**     | 1990 | GNU project's kernel (still not production-ready) |

### Advantages and Disadvantages

| Advantages                                                  | Disadvantages                                            |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| **Reliability** — driver crash does not take down kernel    | **Performance** — IPC overhead for every OS operation    |
| **Security** — small kernel = small attack surface          | **Complexity** — managing many user-space servers        |
| **Flexibility** — easy to replace/update individual servers | **Latency** — message passing slower than function calls |
| **Formal verification** — small kernel is verifiable (seL4) | Fewer drivers available — less ecosystem support         |

> [!IMPORTANT]
> The famous **Tanenbaum-Torvalds debate** (1992) centered on this issue. Tanenbaum argued microkernels were the future; Torvalds defended Linux's monolithic design. Pragmatically, monolithic won in general-purpose computing, but microkernels dominate safety-critical domains.

---

## 4. Hybrid Kernel Architecture

A **hybrid kernel** attempts to combine the speed of a monolithic kernel with the modularity of a microkernel. It keeps performance-critical services (like the file system and device drivers) in kernel space, while still maintaining some structural separation.

### Windows NT Architecture

```text
Windows NT Hybrid Kernel Architecture
========================================

  +-----------------------------------------------------+
  |            User-Mode Applications                    |
  |  (Win32 apps, .NET apps, UWP apps)                  |
  +-----------------------------------------------------+
  |            Subsystem DLLs                            |
  |  (kernel32.dll, ntdll.dll, user32.dll)               |
  +=====================================================+  ← User/Kernel boundary
  |            Executive Services                        |
  |  +--------+ +------+ +------+ +------+ +---------+  |
  |  |Process | |Memory| |I/O   | |Object| |Security |  |
  |  |Manager | |Mgr   | |Mgr   | |Mgr   | |Ref Mon  |  |
  |  +--------+ +------+ +------+ +------+ +---------+  |
  +-----------------------------------------------------+
  |            NT Kernel (microkernel-like core)          |
  |  (Thread scheduling, interrupt dispatch, sync)       |
  +-----------------------------------------------------+
  |            Hardware Abstraction Layer (HAL)           |
  +-----------------------------------------------------+
  |            HARDWARE                                  |
  +-----------------------------------------------------+
```

### macOS XNU Architecture

macOS uses the **XNU** kernel, which combines the **Mach** microkernel with **BSD** (monolithic) components:

```text
macOS XNU Kernel Architecture
================================

  +-------------------------------------------+
  |         User Applications                 |
  |  (Safari, Xcode, Terminal, etc.)          |
  +-------------------------------------------+
  |         Cocoa / Carbon Frameworks         |
  +-------------------------------------------+
  |         BSD Layer                         |
  |  (POSIX API, networking, VFS, security)   |
  +-----------+-------------------------------+
  |   Mach    |   I/O Kit                     |
  |  (IPC,    |  (Device driver framework)    |
  |  memory,  |                               |
  |  threads) |                               |
  +-----------+-------------------------------+
  |         Platform Expert (HAL)             |
  +-------------------------------------------+
  |         HARDWARE                          |
  +-------------------------------------------+

  XNU = "X is Not Unix" (but it's UNIX-certified!)
```

### Hybrid Comparison

| Feature         | Pure Monolithic | Pure Microkernel | Hybrid                |
| --------------- | --------------- | ---------------- | --------------------- |
| **Performance** | Best            | Worst            | Good                  |
| **Reliability** | Lowest          | Highest          | Medium                |
| **Kernel size** | Large           | Very small       | Medium                |
| **Examples**    | Linux (pure)    | MINIX 3, seL4    | Windows NT, macOS XNU |

---

## 5. Exokernel Architecture

An **exokernel** takes a radically different approach: instead of providing abstractions, it simply **protects** and **multiplexes** raw hardware resources. Applications link against a **library OS** that provides whatever abstractions they need.

```text
Exokernel Architecture
========================

  +----------+  +----------+  +----------+
  | App 1    |  | App 2    |  | App 3    |
  | +------+ |  | +------+ |  | +------+ |
  | |LibOS | |  | |LibOS | |  | |LibOS | |
  | |  A   | |  | |  B   | |  | |  C   | |
  | +------+ |  | +------+ |  | +------+ |
  +-----+----+  +-----+----+  +-----+----+
        |              |              |
  ======+==============+==============+======
  |                                         |
  |         EXOKERNEL (minimal)             |
  |  - Multiplexes hardware safely          |
  |  - No abstractions — just protection    |
  |                                         |
  +=========================================+
  |              HARDWARE                   |
  +=========================================+

  Each app can have a DIFFERENT LibOS
  optimized for its specific workload.
```

| Advantage                                                 | Disadvantage                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------- |
| Maximum flexibility — each app picks its own abstractions | Complex for application developers                            |
| Minimal overhead — no unused features                     | Difficult to share resources across different LibOS instances |
| Performance — app-specific optimizations                  | Limited practical adoption                                    |

> [!NOTE]
> Exokernels remain largely a research concept (MIT Exokernel, Aegis/ExOS), but the idea influenced **unikernels** and **library OSes** used in modern cloud computing.

---

## 6. Modular Approach (Loadable Kernel Modules)

The **modular approach** used by modern Linux is a practical compromise: the kernel is monolithic, but features can be added or removed at runtime via **loadable kernel modules (LKMs)**.

```text
Linux Modular Architecture
=============================

  +------------------------------------------------------+
  |                KERNEL CORE                            |
  |  (Process scheduler, memory manager, VFS, IPC)       |
  |                                                      |
  |  +--------+  +--------+  +--------+  +--------+     |
  |  | Module |  | Module |  | Module |  | Module |     |
  |  | ext4   |  | NIC    |  | USB    |  | iptables|    |
  |  | (FS)   |  | driver |  | driver |  | (netfilter)  |
  |  +--------+  +--------+  +--------+  +--------+     |
  |                                                      |
  |  Modules can be loaded/unloaded at runtime:          |
  |    $ insmod ext4.ko    (load module)                 |
  |    $ rmmod ext4        (unload module)               |
  |    $ lsmod             (list loaded modules)         |
  +------------------------------------------------------+
```

### Working with Kernel Modules

```c
// hello_module.c — A minimal Linux kernel module
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("AlgoJourney");
MODULE_DESCRIPTION("A simple hello world kernel module");

static int __init hello_init(void) {
    printk(KERN_INFO "Hello, Kernel!\n");
    return 0;  // 0 means success
}

static void __exit hello_exit(void) {
    printk(KERN_INFO "Goodbye, Kernel!\n");
}

module_init(hello_init);
module_exit(hello_exit);
```

```bash
# Compile and load the module
make -C /lib/modules/$(uname -r)/build M=$(pwd) modules
sudo insmod hello_module.ko
dmesg | tail -1    # See "Hello, Kernel!"
sudo rmmod hello_module
dmesg | tail -1    # See "Goodbye, Kernel!"
```

### Modular vs Other Approaches

| Feature                   | Monolithic                 | Modular                            | Microkernel                 |
| ------------------------- | -------------------------- | ---------------------------------- | --------------------------- |
| **Runtime extensibility** | No — recompile for changes | Yes — load/unload modules          | Yes — start/stop servers    |
| **Performance**           | Best                       | Near-monolithic                    | Lower (IPC overhead)        |
| **Fault isolation**       | None                       | None (modules run in kernel space) | Yes (servers in user space) |
| **Flexibility**           | Low                        | High                               | High                        |
| **Example**               | Early UNIX                 | Modern Linux                       | QNX, MINIX 3                |

> [!WARNING]
> Kernel modules run with **full kernel privileges**. A buggy module can crash the entire system just like any other kernel code. Modules provide **flexibility**, not fault isolation.

---

## Comprehensive Architecture Comparison

| Architecture          | Kernel Size        | Performance    | Reliability | Maintainability | Real-World Example       |
| --------------------- | ------------------ | -------------- | ----------- | --------------- | ------------------------ |
| **Simple/Monolithic** | Large              | Excellent      | Low         | Difficult       | MS-DOS, early UNIX       |
| **Layered**           | Medium             | Good           | Medium      | Good            | THE system               |
| **Microkernel**       | Very Small         | Lower          | Excellent   | Good            | QNX, MINIX 3, seL4       |
| **Hybrid**            | Medium-Large       | Good-Excellent | Medium-Good | Medium          | Windows NT, macOS XNU    |
| **Exokernel**         | Minimal            | Excellent      | Varies      | Difficult       | MIT Exokernel (research) |
| **Modular**           | Large (extensible) | Excellent      | Low-Medium  | Good            | Linux                    |

---

## Linux Kernel Architecture — Deep Dive

```text
Linux Kernel Detailed Architecture
=====================================

  User Space
  +==========================================================+
  |  Applications (bash, gcc, python, nginx, docker)         |
  +==========================================================+
  |  GNU C Library (glibc) — POSIX API wrapper               |
  +==========================================================+
  |  System Call Interface (≈400+ syscalls)                   |
  +==========================================================+

  Kernel Space
  +==========================================================+
  |                                                          |
  |  +------------------+  +-----------------------------+   |
  |  | Process Mgmt     |  | Virtual File System (VFS)   |   |
  |  | - task_struct     |  | - inode, dentry, file ops   |   |
  |  | - CFS scheduler   |  | - Abstraction over FS types |   |
  |  | - namespaces      |  |                             |   |
  |  +------------------+  +----+-----+-----+-----+------+   |
  |                             |     |     |     |          |
  |  +------------------+   ext4   XFS  Btrfs  NFS  proc     |
  |  | Memory Mgmt      |                                    |
  |  | - Page allocator  |  +-----------------------------+   |
  |  | - Slab allocator  |  | Network Stack               |   |
  |  | - MMU driver      |  | - Socket interface          |   |
  |  | - OOM killer      |  | - TCP/IP, UDP               |   |
  |  +------------------+  | - Netfilter (firewall)       |   |
  |                         +-----------------------------+   |
  |  +------------------+                                     |
  |  | Device Drivers   |  +-----------------------------+   |
  |  | - Block (disk)   |  | Security Modules            |   |
  |  | - Char (terminal)|  | - SELinux, AppArmor         |   |
  |  | - Network (NIC)  |  | - Capabilities              |   |
  |  +------------------+  +-----------------------------+   |
  |                                                          |
  +==========================================================+
  |  Arch-Specific Code (x86, ARM, RISC-V, ...)              |
  +==========================================================+
  |  HARDWARE                                                |
  +----------------------------------------------------------+
```

### Linux Kernel Statistics

| Metric                  | Value (approx., 2024)             |
| ----------------------- | --------------------------------- |
| Lines of code           | ~34 million                       |
| Supported architectures | 30+ (x86, ARM, RISC-V, MIPS, ...) |
| System calls            | ~450                              |
| Active contributors     | ~4,000 per release                |
| Release cycle           | New version every ~9 weeks        |
| File systems supported  | 50+                               |
| Loadable modules        | Thousands available               |

---

## Windows NT Architecture — Overview

| Layer                        | Components                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| **User Mode — Applications** | Win32 apps, .NET apps, UWP apps, WSL                                                                    |
| **User Mode — Subsystems**   | Win32 subsystem, POSIX subsystem (legacy)                                                               |
| **User Mode — Services**     | Service Control Manager, Windows services                                                               |
| **Kernel Mode — Executive**  | Process Manager, Memory Manager, I/O Manager, Object Manager, Security Reference Monitor, Cache Manager |
| **Kernel Mode — Kernel**     | Thread scheduling, interrupt dispatch, multiprocessor synchronization                                   |
| **Kernel Mode — HAL**        | Hardware Abstraction Layer — isolates hardware specifics                                                |
| **Kernel Mode — Drivers**    | File system drivers (NTFS), network drivers, display drivers                                            |

---

## Try It Yourself

**Exercise 1:** In a microkernel OS, a user application wants to print a document. Describe the message-passing sequence between the application, the microkernel, and the printer driver (running in user space). How many mode switches occur?

:::details Solution

1. **Application** sends a "print request" message → **Kernel** (user → kernel mode switch #1)
2. **Kernel** delivers the message to the **Printer Driver Server** → (kernel → user mode switch #2)
3. **Printer Driver Server** processes the request, accesses printer hardware via kernel → (user → kernel mode switch #3)
4. **Kernel** performs hardware I/O → (stays in kernel mode)
5. **Kernel** sends "print complete" message back to Printer Driver → (kernel → user mode switch #4)
6. **Printer Driver** sends "done" message to Application → (user → kernel mode switch #5)
7. **Kernel** delivers the message to Application → (kernel → user mode switch #6)

Total: **6 mode switches** minimum. In a monolithic kernel, the same operation would need only **2** (user → kernel for the print call, kernel → user for the return).
:::

**Exercise 2:** You are designing an OS for a safety-critical automotive braking system. Which architecture would you choose and why? Eliminate at least two options with justification.

:::details Solution
**Best choice: Microkernel (e.g., QNX Neutrino)**

**Eliminated options:**

1. **Monolithic kernel** — eliminated because a bug in any driver could crash the entire system. In a braking system, this could be fatal. No fault isolation.
2. **Exokernel** — eliminated because the flexibility of library OSes is unnecessary for a dedicated braking system, and the complexity of managing custom abstractions adds risk.

**Why microkernel:**

- **Fault isolation** — if a non-critical driver crashes, the kernel and braking control continue running.
- **Small, verifiable kernel** — seL4 has been formally verified; QNX is certified for safety standards (ISO 26262).
- **Deterministic behavior** — microkernels like QNX provide real-time guarantees needed for braking.
- The IPC overhead of microkernels is acceptable because safety is more important than raw throughput.
  :::

**Exercise 3:** List the Linux commands to: (a) view currently loaded kernel modules, (b) load a new module named `snd_hda_intel`, and (c) remove it.

:::details Solution

```bash
# (a) View currently loaded kernel modules
lsmod

# (b) Load a new module
sudo modprobe snd_hda_intel
# OR
sudo insmod /lib/modules/$(uname -r)/kernel/sound/pci/hda/snd-hda-intel.ko

# (c) Remove the module
sudo modprobe -r snd_hda_intel
# OR
sudo rmmod snd_hda_intel
```

`modprobe` is preferred over `insmod`/`rmmod` because it automatically handles module dependencies.
:::

---

## Key Takeaways

- **Monolithic kernels** put all OS services in one address space — fast but fragile. Linux and most UNIX variants use this approach.
- The **layered approach** (Dijkstra's THE system) provides clean abstraction but suffers from performance overhead and layer-definition challenges.
- **Microkernels** move everything except IPC, scheduling, and basic memory management to user space — excellent for reliability and security, but slower due to message passing.
- **Hybrid kernels** (Windows NT, macOS XNU) pragmatically combine monolithic performance with some microkernel structure.
- **Exokernels** provide minimal abstraction and maximum flexibility — mostly a research concept that influenced unikernels.
- **Loadable kernel modules** (Linux) give monolithic kernels runtime extensibility without rebooting.
- The choice of OS structure involves fundamental trade-offs between **performance**, **reliability**, **security**, and **maintainability**.
- In practice, **no production OS uses a pure architecture** — all modern OSes are pragmatic hybrids.
