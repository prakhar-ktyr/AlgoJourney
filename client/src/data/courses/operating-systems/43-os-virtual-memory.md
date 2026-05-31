---
title: Introduction to Virtual Memory
---

# Introduction to Virtual Memory

What if a program is larger than physical memory? What if we want to run 50 programs simultaneously, each thinking it has gigabytes of RAM, on a machine with only 16 GB? **Virtual memory** makes this possible by separating the logical address space from physical memory, allowing programs to use more memory than physically exists — transparently and efficiently.

---

## Motivation

### The Problem

Without virtual memory, a program's entire code and data must fit in physical memory during execution:

| Constraint                               | Impact                                     |
| ---------------------------------------- | ------------------------------------------ |
| Program size ≤ physical memory           | Cannot run large programs                  |
| All code must be loaded                  | Wastes memory on rarely-used code paths    |
| Each process needs its own physical copy | Memory fills up quickly with few processes |
| No isolation between processes           | One buggy process can corrupt another      |

### The Observation

Most programs don't use all their code and data at any given moment:

- **Error handling code**: executed only when errors occur (rarely)
- **Unused features**: large applications have features most users never touch
- **Large data structures**: arrays and tables often have unused regions
- **Libraries**: linked libraries may have thousands of functions; a process uses a handful

> _"A program that is 10 MB in size may only actively use 200 KB at any given moment."_

This observation led to virtual memory: **only keep the actively-used portions of a program in physical memory**.

---

## What Is Virtual Memory?

> **Virtual memory** is a technique that allows execution of processes that are not completely in memory. It provides an illusion to each process that it has a large, contiguous address space, while physically the data may be partly in RAM and partly on disk.

```text
  Without Virtual Memory:         With Virtual Memory:

  ┌────────────┐                  ┌────────────────────────┐
  │ Process A  │ Must be          │ Process A (virtual)    │
  │ (all in    │ entirely         │ ┌────┬────┬────┬────┐  │
  │  RAM)      │ in RAM           │ │RAM │RAM │DISK│DISK│  │
  │            │                  │ │    │    │    │    │  │
  └────────────┘                  │ └────┴────┴────┴────┘  │
                                  │ Some pages in RAM,     │
  Limited to physical             │ others on disk.        │
  memory size.                    │ Process doesn't know!  │
                                  └────────────────────────┘

                                  Can exceed physical memory.
```

---

## Benefits of Virtual Memory

| Benefit                        | Description                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| **Larger address spaces**      | Processes can have logical address spaces much larger than physical RAM                 |
| **Efficient memory use**       | Only active pages are in RAM; inactive pages stay on disk                               |
| **Process isolation**          | Each process has its own virtual address space — cannot access another's memory         |
| **Simplified programming**     | Programmers don't worry about physical memory layout or size                            |
| **Increased multiprogramming** | More processes can run simultaneously (each using only a fraction of RAM)               |
| **Simplified linking/loading** | Programs always start at virtual address 0; linker doesn't need to know physical layout |
| **Memory-mapped files**        | Files can be accessed as if they were in memory                                         |
| **Shared memory**              | Multiple processes can share physical frames while having separate virtual pages        |

---

## Virtual Address Space

Each process has a **virtual address space** — the logical view of how memory is organized. This is typically much larger than physical memory.

### Logical View: Contiguous and Clean

```text
  Process Virtual Address Space (e.g., 4 GB for 32-bit):

  0x00000000 ┌─────────────────────┐
             │ Text (Code)          │  Fixed size, read-only
             ├─────────────────────┤
             │ Data                 │  Initialized globals
             ├─────────────────────┤
             │ BSS                  │  Uninitialized globals (zeroed)
             ├─────────────────────┤
             │ Heap                 │
             │   ↓ grows downward   │  (toward higher addresses)
             │                     │
             │                     │
             │   (unmapped gap)    │  ← Sparse: no physical memory
             │                     │     allocated for this region!
             │                     │
             │   ↑ grows upward    │  (toward lower addresses)
             │ Stack               │
             ├─────────────────────┤
             │ Kernel Space        │  (not accessible in user mode)
  0xFFFFFFFF └─────────────────────┘
```

### Physical Reality: Scattered and Shared

```text
  Physical Memory (RAM):          Disk (Swap/Page File):
  ┌──────────────┐                ┌──────────────────┐
  │ OS Kernel    │                │ P1 page 5        │
  ├──────────────┤                │ P2 page 12       │
  │ P1 page 0   │                │ P1 page 8        │
  ├──────────────┤                │ P3 page 2        │
  │ P2 page 3   │                │ ...               │
  ├──────────────┤                └──────────────────┘
  │ P1 page 2   │
  ├──────────────┤                Only ACTIVE pages in RAM.
  │ P3 page 0   │                Inactive pages on disk.
  ├──────────────┤                Pages brought in ON DEMAND.
  │ P2 page 7   │
  ├──────────────┤
  │ (free)       │
  └──────────────┘
```

---

## Sparse Address Spaces

One powerful feature of virtual memory is support for **sparse address spaces** — the heap and stack can grow toward each other without pre-allocating all the memory in between:

```text
  Virtual Address Space:

  ┌─────────────────────┐  0x0000
  │ Code + Data          │  Allocated
  ├─────────────────────┤
  │ Heap                 │  Allocated
  │  ↓ (grows)           │
  ├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
  │                     │
  │  HOLE               │  NOT allocated!
  │  (sparse region)    │  No physical memory or
  │                     │  disk space used.
  │                     │  Accessing this → page fault
  │                     │  → OS allocates on demand
  │                     │  (or kills process if illegal)
  ├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
  │  ↑ (grows)           │
  │ Stack               │  Allocated
  └─────────────────────┘  0xFFFF
```

The gap between heap and stack is part of the virtual address space but has **no physical backing** until accessed. This is incredibly space-efficient:

| Process     | Virtual Size | Physical Pages Used | Physical Memory Used |
| ----------- | ------------ | ------------------- | -------------------- |
| Text editor | 100 MB       | 500                 | 2 MB                 |
| Web browser | 2 GB         | 50,000              | 200 MB               |
| Database    | 64 GB        | 2,000,000           | 8 GB                 |

> [!NOTE]
> A process can have a 64 GB virtual address space on a machine with only 8 GB of RAM. Only the actively-used pages occupy physical memory. The rest either doesn't exist yet (sparse regions) or is stored on disk.

---

## Shared Memory via Virtual Memory

Virtual memory makes sharing between processes elegant. Two processes can map the same physical frames into their virtual address spaces:

```text
  Process P1:                    Process P2:
  ┌──────────────────┐           ┌──────────────────┐
  │ Page 0 → Frame 5 │           │ Page 0 → Frame 10│
  │ Page 1 → Frame 3 │           │ Page 1 → Frame 3 │ ← Same frame!
  │ Page 2 → Frame 7 │           │ Page 2 → Frame 12│
  └──────────────────┘           └──────────────────┘

  Physical Memory:
  ┌──────────────────┐
  │ Frame 3: SHARED  │ ← Both P1 (page 1) and P2 (page 1)
  │          DATA    │    map to this frame
  └──────────────────┘
```

### Use Cases for Shared Memory

| Use Case                        | How It Works                                                                |
| ------------------------------- | --------------------------------------------------------------------------- |
| **Shared libraries**            | `libc.so` loaded once, mapped into every process's virtual space            |
| **Inter-process communication** | Processes share a memory region for fast data exchange                      |
| **fork() optimization**         | Parent and child share all pages initially (Copy-on-Write)                  |
| **Memory-mapped files**         | File contents mapped to virtual pages; multiple processes can map same file |

---

## Shared Libraries Through Virtual Memory

Without virtual memory, each process loads its own copy of shared libraries:

```text
  Without VM Sharing:              With VM Sharing:

  P1: [code][libc][data]          P1: [code][data]───┐
  P2: [code][libc][data]          P2: [code][data]───┤── libc (1 copy
  P3: [code][libc][data]          P3: [code][data]───┘   in physical
                                                          memory)
  3 copies of libc                1 copy of libc
  in physical memory              in physical memory
```

**Example savings**: If `libc` is 2 MB and 100 processes use it:

- Without sharing: $100 \times 2 = 200$ MB
- With sharing: $2$ MB
- **Savings: 198 MB**

---

## Demand Paging Preview

The key mechanism that enables virtual memory is **demand paging**:

> **Demand paging**: Pages are loaded into memory only when they are **accessed** (referenced). If a page is not in memory when accessed, a **page fault** occurs, and the OS loads it from disk.

```text
  ┌─────────────────────────────────────────────┐
  │            Demand Paging Concept              │
  │                                               │
  │  Process starts with ZERO pages in memory.   │
  │                                               │
  │  Access page 0 → Page fault → Load from disk │
  │  Access page 0 → In memory → No fault        │
  │  Access page 5 → Page fault → Load from disk │
  │  Access page 0 → In memory → No fault        │
  │  Access page 3 → Page fault → Load from disk │
  │  ...                                          │
  │                                               │
  │  Pages loaded on demand, one at a time.       │
  │  Very efficient — only load what you use!     │
  └─────────────────────────────────────────────┘
```

We will study demand paging in full detail in the next lesson.

---

## Virtual Memory: The Complete Picture

```text
  ┌────────────────────────────────────────────────────────┐
  │                 Virtual Memory System                    │
  │                                                         │
  │  ┌──────────┐     ┌──────────┐     ┌──────────────┐   │
  │  │   CPU    │────→│   MMU    │────→│   Physical   │   │
  │  │ (virtual │     │ (page    │     │   Memory     │   │
  │  │  address)│     │  table + │     │   (RAM)      │   │
  │  └──────────┘     │  TLB)   │     └──────┬───────┘   │
  │                    └─────────┘            │            │
  │                         │                 │            │
  │                    Page fault?            │            │
  │                    ┌────┴────┐            │            │
  │                    │ YES     │ NO         │            │
  │                    ↓         └───→ Data   │            │
  │              ┌──────────┐     returned    │            │
  │              │ OS loads  │                │            │
  │              │ page from │                │            │
  │              │ disk      │←───────────────┘            │
  │              └──────────┘                              │
  │                    │                                    │
  │                    ↓                                    │
  │              ┌──────────────┐                          │
  │              │   Disk       │                          │
  │              │  (Swap/Page  │                          │
  │              │   File)      │                          │
  │              └──────────────┘                          │
  └────────────────────────────────────────────────────────┘
```

---

## Virtual Memory in Practice

### System Calls Related to Virtual Memory

```c
#include <sys/mman.h>

// Memory-map a file (shared library, data file)
void *addr = mmap(NULL, length, PROT_READ | PROT_WRITE,
                  MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);

// Unmap memory
munmap(addr, length);

// Advise kernel about usage patterns
madvise(addr, length, MADV_SEQUENTIAL);  // Will access sequentially
madvise(addr, length, MADV_DONTNEED);    // Won't need this soon
```

### Checking Virtual Memory Usage

```python
import os
import resource

# Get process memory info
usage = resource.getrusage(resource.RUSAGE_SELF)
print(f"Max RSS (physical): {usage.ru_maxrss} KB")
print(f"Page faults (minor): {usage.ru_minflt}")
print(f"Page faults (major): {usage.ru_majflt}")
```

**On Linux, check `/proc/<pid>/status`:**

```text
VmSize:    102400 kB    ← Virtual memory size (total mapped)
VmRSS:      12800 kB    ← Resident Set Size (in physical RAM)
VmSwap:      2048 kB    ← Swapped to disk

VmSize >> VmRSS is normal! Virtual >> Physical.
```

---

## Historical Context

| Year  | Milestone                                                                |
| ----- | ------------------------------------------------------------------------ |
| 1956  | Concept of "one-level storage" (virtual memory precursor) by Tom Kilburn |
| 1961  | Atlas computer at University of Manchester — first virtual memory system |
| 1962  | Burroughs B5000 — commercial system with virtual memory                  |
| 1970  | IBM System/370 — virtual memory becomes mainstream                       |
| 1985  | Intel 80386 — paging support in x86 processors                           |
| 1990s | Virtual memory standard in all general-purpose OSes                      |
| 2003  | x86-64 — 48-bit virtual address spaces (256 TB)                          |
| 2019  | Intel LA57 — 57-bit virtual address spaces (128 PB)                      |

> [!NOTE]
> Virtual memory was considered controversial in the 1960s. Many believed the overhead was too high. Today, it is so fundamental that no general-purpose OS operates without it.

---

## Virtual Memory vs Physical Memory — Key Metrics

| Metric            | Virtual Memory                                            | Physical Memory           |
| ----------------- | --------------------------------------------------------- | ------------------------- |
| **Size (32-bit)** | 4 GB per process                                          | Typically 1-16 GB shared  |
| **Size (64-bit)** | 256 TB (48-bit) per process                               | Typically 8-256 GB shared |
| **Speed**         | RAM speed for resident pages; disk speed for non-resident | Always RAM speed          |
| **Cost**          | Cheap (disk is inexpensive)                               | Expensive (DRAM costs)    |
| **Managed by**    | OS + MMU hardware                                         | OS                        |
| **Visible to**    | Every process (own space)                                 | Only OS kernel            |

---

## Try It Yourself

**Exercise 1:** A system has 4 GB of physical RAM. Three processes are running:

- P1: 8 GB virtual, 1 GB resident
- P2: 16 GB virtual, 2 GB resident
- P3: 4 GB virtual, 0.5 GB resident

Is this possible? How much physical memory is used? How much is on disk?

:::details Solution
Yes, this is entirely possible with virtual memory!

**Physical memory used**: $1 + 2 + 0.5 = 3.5$ GB out of 4 GB. Leaves 0.5 GB free for the OS and buffers.

**Virtual memory total**: $8 + 16 + 4 = 28$ GB.

**On disk (or unallocated)**: $28 - 3.5 = 24.5$ GB worth of pages are either on disk (swap) or part of sparse regions that haven't been accessed yet.

Each process can have a virtual space larger than physical memory because only active pages reside in RAM.
:::

**Exercise 2:** Explain how `fork()` in Unix benefits from virtual memory and the Copy-on-Write optimization.

:::details Solution
When a process calls `fork()`, the OS creates a child process that is a copy of the parent. Without virtual memory, the OS would need to copy all of the parent's memory — expensive for large processes.

With **Copy-on-Write (COW)**:

1. The child gets a copy of the parent's **page table**, pointing to the **same physical frames**.
2. All shared pages are marked **read-only**.
3. If either process **writes** to a page, a page fault occurs.
4. The OS then copies just that one page and gives the writing process its own private copy.

**Benefit**: If the child immediately calls `exec()` (common pattern), most pages are never written to, so they're never copied. The `fork()` is nearly instantaneous regardless of process size.
:::

**Exercise 3:** Why can a process have a 256 TB virtual address space on a machine with only 16 GB of RAM? Isn't that wasteful?

:::details Solution
It's not wasteful because:

1. **Sparse allocation**: Most of the 256 TB is **unmapped** — no physical memory or disk space is used for it. The page table uses multi-level structure so entries for unmapped regions don't exist.
2. **Demand paging**: Pages are only allocated physical frames when first accessed.
3. **Flexibility**: The large address space allows the heap and stack to grow freely, libraries to be mapped at convenient addresses, and memory-mapped files to be placed without conflicts.
4. **It's free**: Having a large virtual address space costs nothing until pages are actually used. An unused page number is just a number — it doesn't consume any physical resource.
   :::

---

## Key Takeaways

- **Virtual memory** separates logical memory from physical memory, allowing processes to use more memory than physically available.
- Programs exhibit **locality of reference** — only a small fraction of pages are active at any time, making virtual memory efficient.
- Each process has its own **virtual address space** — typically much larger than physical memory — providing isolation and simplified programming.
- **Sparse address spaces** allow heap and stack to grow independently without pre-allocating the gap between them.
- Virtual memory enables **shared memory** and **shared libraries** by mapping multiple virtual pages to the same physical frame.
- **Demand paging** (next lesson) is the mechanism that loads pages only when accessed, triggering page faults for non-resident pages.
- Virtual memory is so fundamental that **no modern general-purpose OS operates without it**.
- The key tradeoff: virtual memory adds complexity (page tables, TLB, page faults) but provides enormous benefits in memory utilization, isolation, and programming simplicity.
