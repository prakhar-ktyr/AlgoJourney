---
title: Paging
section: "Memory Management"
---

# Paging

Contiguous allocation suffers from external fragmentation — free memory exists but is scattered in unusable fragments. **Paging** solves this by breaking both physical and logical memory into fixed-size blocks. A process's pages can be placed in _any_ available frames, eliminating external fragmentation entirely.

---

## Why Paging?

| Problem with Contiguous Allocation   | How Paging Solves It                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| External fragmentation               | Pages can use any free frame — no need for contiguous blocks |
| Compaction overhead                  | No compaction needed                                         |
| Process size limited by largest hole | Process can use scattered frames                             |
| Difficult memory sharing             | Share individual pages between processes                     |

---

## Core Concepts

### Physical Memory: Frames

Physical memory (RAM) is divided into fixed-size blocks called **frames**:

$$\text{Number of frames} = \frac{\text{Physical memory size}}{\text{Frame size}}$$

### Logical Memory: Pages

A process's logical address space is divided into blocks of the **same size** called **pages**:

$$\text{Number of pages} = \frac{\text{Process size}}{\text{Page size}}$$

> **Page size = Frame size** (always). Typical sizes: 4 KB, 2 MB, or 1 GB (for huge pages).

### Page Table

Each process has a **page table** that maps its page numbers to frame numbers in physical memory:

```text
  Logical Memory            Page Table         Physical Memory
  (Process View)                               (Frames)

  ┌──────────┐  Page 0 ──→ ┌───┬───┐          ┌──────────┐ Frame 0
  │  Page 0   │             │ 0 │ 5 │          │  (other) │
  ├──────────┤  Page 1 ──→ ├───┼───┤          ├──────────┤ Frame 1
  │  Page 1   │             │ 1 │ 2 │          │  (other) │
  ├──────────┤  Page 2 ──→ ├───┼───┤          ├──────────┤ Frame 2
  │  Page 2   │             │ 2 │ 8 │          │  Page 1  │ ←
  ├──────────┤  Page 3 ──→ ├───┼───┤          ├──────────┤ Frame 3
  │  Page 3   │             │ 3 │ 1 │          │  (other) │
  └──────────┘             └───┴───┘          ├──────────┤ ...
                                               ├──────────┤ Frame 5
  Pages are contiguous                        │  Page 0  │ ←
  in logical memory                           ├──────────┤ ...
  but scattered in                            ├──────────┤ Frame 8
  physical memory!                            │  Page 2  │ ←
                                               └──────────┘
```

---

## Address Translation

A logical address in a paging system has two parts:

```text
  Logical Address (m bits total):
  ┌──────────────────────┬──────────────┐
  │   Page Number (p)    │  Offset (d)  │
  │   (m - n bits)       │  (n bits)    │
  └──────────────────────┴──────────────┘

  Where page size = 2^n bytes
```

### Translation Formulas

Given a logical address `LA` and page size `S`:

$$p = \left\lfloor \frac{\text{LA}}{\text{S}} \right\rfloor \qquad d = \text{LA} \mod \text{S}$$

The physical address is:

$$\text{PA} = \text{frame\_number} \times \text{S} + d$$

where `frame_number = PageTable[p]`.

### Translation Hardware

```text
  CPU                              Memory
  ┌───────────┐                    ┌──────────────────┐
  │ Logical   │    ┌──────────┐   │                  │
  │ Address   │───→│Page Table│   │   Physical       │
  │           │    │          │   │   Memory         │
  │  ┌───┬───┐│    │  p → f   │   │                  │
  │  │ p │ d ││    └────┬─────┘   │  ┌───┬──────┐   │
  │  └───┴───┘│         │         │  │ f │  d   │   │
  └───────────┘         │         │  └───┴──────┘   │
                        │         │  Physical Addr   │
                   frame number   │                  │
                   f              └──────────────────┘
```

---

## Worked Example

**System**: Page size = 4 KB = 4096 bytes. Process has 16 KB of logical memory (4 pages).

**Page table:**

| Page | Frame |
| ---- | ----- |
| 0    | 5     |
| 1    | 2     |
| 2    | 8     |
| 3    | 1     |

**Translate logical address 5000:**

$$p = \left\lfloor \frac{5000}{4096} \right\rfloor = 1 \qquad d = 5000 \mod 4096 = 904$$

Page 1 maps to frame 2:

$$\text{PA} = 2 \times 4096 + 904 = 8192 + 904 = 9096$$

**Translate logical address 13000:**

$$p = \left\lfloor \frac{13000}{4096} \right\rfloor = 3 \qquad d = 13000 \mod 4096 = 712$$

Page 3 maps to frame 1:

$$\text{PA} = 1 \times 4096 + 712 = 4096 + 712 = 4808$$

### Complete Translation Table

| Logical Address | Page (p) | Offset (d) | Frame (f) | Physical Address |
| --------------- | -------- | ---------- | --------- | ---------------- |
| 0               | 0        | 0          | 5         | 20480            |
| 4095            | 0        | 4095       | 5         | 24575            |
| 4096            | 1        | 0          | 2         | 8192             |
| 5000            | 1        | 904        | 2         | 9096             |
| 8192            | 2        | 0          | 8         | 32768            |
| 13000           | 3        | 712        | 1         | 4808             |

---

## Address Bit Breakdown

For a system with logical address space = $2^m$ bytes and page size = $2^n$ bytes:

| Component                 | Bits    | Count                   |
| ------------------------- | ------- | ----------------------- |
| **Page number**           | $m - n$ | $2^{m-n}$ pages         |
| **Offset**                | $n$     | Addresses within a page |
| **Total logical address** | $m$     | $2^m$ addressable bytes |

**Example**: 32-bit logical address, 4 KB ($2^{12}$) pages:

| Field       | Bits           | Value                            |
| ----------- | -------------- | -------------------------------- |
| Page number | $32 - 12 = 20$ | Up to $2^{20} = 1,048,576$ pages |
| Offset      | 12             | 4096 bytes per page              |

```text
  32-bit logical address with 4KB pages:

  ┌──────────────────────────┬──────────────┐
  │    Page Number (20 bits) │ Offset (12)  │
  │    (up to ~1 million     │ (0 to 4095)  │
  │     page table entries)  │              │
  └──────────────────────────┴──────────────┘

  Each page table entry needs at least 20 bits for frame number
  (typically 32 bits with flags: valid, dirty, protection bits)
```

---

## Internal Fragmentation in Paging

Paging eliminates external fragmentation but introduces minor **internal fragmentation** — the last page of a process may not be fully used.

**On average**, the last page wastes half a page:

$$\text{Expected waste} = \frac{\text{Page size}}{2}$$

| Page Size | Average Waste per Process | Waste for 100 Processes |
| --------- | ------------------------- | ----------------------- |
| 4 KB      | 2 KB                      | 200 KB                  |
| 2 MB      | 1 MB                      | 100 MB                  |
| 1 GB      | 512 MB                    | 50 GB                   |

> [!WARNING]
> This is why **huge pages** (2 MB, 1 GB) should only be used for processes that actually need large contiguous memory regions. For small processes, huge pages waste significant memory.

---

## Page Size Tradeoffs

| Factor                     | Small Pages (e.g., 4 KB)   | Large Pages (e.g., 2 MB)               |
| -------------------------- | -------------------------- | -------------------------------------- |
| **Internal fragmentation** | Less waste (avg 2 KB)      | More waste (avg 1 MB)                  |
| **Page table size**        | Larger (more entries)      | Smaller (fewer entries)                |
| **Disk I/O efficiency**    | More transfers, each small | Fewer transfers, each large            |
| **TLB coverage**           | Less memory covered by TLB | More memory covered (better TLB reach) |
| **Memory resolution**      | Fine-grained allocation    | Coarse-grained allocation              |
| **Locality match**         | Precise to working set     | May bring in unneeded data             |

> [!NOTE]
> Modern systems use a mix: **4 KB pages** for general use and **2 MB or 1 GB huge pages** for specific high-performance applications (databases, virtual machines, scientific computing).

---

## Free Frame Management

The OS maintains a **frame table** — a data structure tracking the status of every physical frame:

| Frame | Status    | Process | Page |
| ----- | --------- | ------- | ---- |
| 0     | Allocated | OS      | —    |
| 1     | Allocated | P1      | 3    |
| 2     | Allocated | P1      | 1    |
| 3     | Free      | —       | —    |
| 4     | Free      | —       | —    |
| 5     | Allocated | P1      | 0    |
| 6     | Free      | —       | —    |
| 7     | Allocated | P2      | 0    |
| 8     | Allocated | P1      | 2    |

### Free Frame List

```text
  Free frame list (linked list or stack):

  Head → [3] → [4] → [6] → NULL

  When a process needs a frame:
  - Pop from free list

  When a process releases a frame:
  - Push onto free list
```

### Loading a Process

When a new process with $n$ pages is loaded:

1. Find $n$ free frames from the free frame list.
2. Load each page into a frame (in **any** order — they don't need to be contiguous!).
3. Set up the page table entries to map pages to their assigned frames.

```text
  Process P2 (3 pages) being loaded:

  Free frames available: [3, 4, 6]

  Page 0 → Frame 3
  Page 1 → Frame 6   (not contiguous — that's fine!)
  Page 2 → Frame 4

  P2's page table:
  ┌───┬───┐
  │ 0 │ 3 │
  ├───┼───┤
  │ 1 │ 6 │
  ├───┼───┤
  │ 2 │ 4 │
  └───┴───┘
```

---

## Hardware Support for Page Tables

### Option 1: Dedicated Registers

Store the entire page table in fast CPU registers.

| Pros                                | Cons                               |
| ----------------------------------- | ---------------------------------- |
| Very fast — no memory access needed | Only works for small page tables   |
| Simple hardware                     | Expensive for large address spaces |

Practical only for page tables with ≤ 256 entries.

### Option 2: Memory-Resident Page Table with PTBR

Store the page table in main memory. Use a **Page Table Base Register (PTBR)** that points to the page table's location.

```text
  CPU                    Memory
  ┌────────────┐         ┌─────────────────────┐
  │ PTBR ──────┼────────→│ Page Table (in RAM)  │
  │            │         │ ┌───┬───┐           │
  │ Logical    │         │ │ 0 │ 5 │           │
  │ addr: p|d  │──p────→ │ ├───┼───┤           │
  │            │         │ │ 1 │ 2 │           │
  │            │         │ ├───┼───┤           │
  │            │  frame f│ │ 2 │ 8 │           │
  │            │←────────│ └───┴───┘           │
  │            │         │                     │
  │ PA = f|d   │────────→│ Data at frame f     │
  └────────────┘         └─────────────────────┘
```

**Problem**: Every logical memory access requires **two** physical memory accesses:

1. Access the page table to get the frame number.
2. Access the actual data at the physical address.

This **doubles** the effective memory access time!

$$\text{Effective Access Time} = 2 \times t_\text{memory}$$

For $t_\text{memory} = 100$ ns: $EAT = 200$ ns — a 100% slowdown!

> [!IMPORTANT]
> This two-access penalty is unacceptable. The solution is the **Translation Lookaside Buffer (TLB)** — a fast hardware cache for page table entries — which we study in the next lesson.

---

## Page Table Entry (PTE) Structure

Each entry in the page table contains more than just the frame number:

```text
  Page Table Entry:
  ┌───────┬───────┬───────┬────────┬──────────────────┐
  │ Valid │ Dirty │ Ref   │ Prot   │  Frame Number    │
  │ bit   │ bit   │ bit   │ bits   │                  │
  └───────┴───────┴───────┴────────┴──────────────────┘
    1 bit   1 bit   1 bit   2-3 bits   20+ bits
```

| Field               | Purpose                                                              |
| ------------------- | -------------------------------------------------------------------- |
| **Valid bit**       | 1 = page is in memory; 0 = page is on disk or invalid                |
| **Dirty bit**       | 1 = page has been modified; needs to be written to disk when evicted |
| **Reference bit**   | 1 = page has been accessed recently; used by replacement algorithms  |
| **Protection bits** | Read/write/execute permissions                                       |
| **Frame number**    | The physical frame where this page resides                           |

---

## Paging: No External Fragmentation

The key advantage of paging is that processes use **non-contiguous** physical memory:

```text
  Without Paging:                  With Paging:
  (Contiguous allocation)          (Non-contiguous)

  ┌──────┐                         ┌──────┐
  │ P1   │                         │ P1-0 │ Frame 0
  │      │                         ├──────┤
  │      │                         │ P2-0 │ Frame 1
  ├──────┤                         ├──────┤
  │ FREE │ ← Too small for P3     │ P1-1 │ Frame 2
  ├──────┤                         ├──────┤
  │ P2   │                         │ P3-0 │ Frame 3
  │      │                         ├──────┤
  ├──────┤                         │ P2-1 │ Frame 4
  │ FREE │ ← Too small for P3     ├──────┤
  └──────┘                         │ P3-1 │ Frame 5
                                   └──────┘
  P3 can't fit!                    P3 fits easily!
  EXTERNAL FRAGMENTATION           NO EXTERNAL FRAGMENTATION
```

---

## Protection and Sharing with Paging

### Protection

Each page table entry contains **protection bits**:

| Permission  | Meaning                       |
| ----------- | ----------------------------- |
| R (Read)    | Page can be read              |
| W (Write)   | Page can be written           |
| X (Execute) | Page contains executable code |

Code pages are typically marked `R-X` (read and execute, no write). Data pages are `RW-` (read-write, no execute). This prevents code injection attacks.

### Sharing

Two processes can share the same physical frames by having their page tables point to the same frame:

```text
  P1's Page Table:        P2's Page Table:        Physical Memory:
  ┌───┬───┐               ┌───┬───┐               ┌──────────┐ Frame 10
  │ 0 │10 │───┐            │ 0 │10 │───┐            │  Shared  │ ← Both point here!
  ├───┼───┤   └──────────→├───┼───┤   └──────────→│  Code    │
  │ 1 │20 │               │ 1 │25 │               ├──────────┤ Frame 20
  └───┴───┘               └───┴───┘               │ P1 Data  │
                                                   ├──────────┤ Frame 25
  Shared code page!                                │ P2 Data  │
  (e.g., libc)                                     └──────────┘
```

---

## Try It Yourself

**Exercise 1:** A system has 64 KB of physical memory and uses 4 KB pages. A process has 20 KB of logical memory. How many pages and frames are there? How many page table entries does this process need?

:::details Solution

- **Frames**: $\frac{64 \text{ KB}}{4 \text{ KB}} = 16$ frames
- **Pages** for this process: $\frac{20 \text{ KB}}{4 \text{ KB}} = 5$ pages
- **Page table entries**: 5 (one per page)

The process needs 5 frames out of the 16 available. These frames do not need to be contiguous.
:::

**Exercise 2:** Given page size = 8 KB, translate logical address 25000 to a physical address using this page table: Page 0→Frame 3, Page 1→Frame 7, Page 2→Frame 0, Page 3→Frame 5.

:::details Solution
Page size = 8 KB = 8192 bytes.

$p = \lfloor 25000 / 8192 \rfloor = 3$

$d = 25000 \mod 8192 = 25000 - 3 \times 8192 = 25000 - 24576 = 424$

Page 3 → Frame 5.

$\text{PA} = 5 \times 8192 + 424 = 40960 + 424 = 41384$

Logical address 25000 → Physical address **41384**.
:::

**Exercise 3:** A system uses 32-bit addresses and 8 KB pages. How many bits for the page number and offset? How many page table entries are possible?

:::details Solution
Page size = 8 KB = $2^{13}$ bytes → offset = **13 bits**.
Page number = $32 - 13 = $ **19 bits**.
Maximum page table entries = $2^{19} = 524,288$.

Each entry is typically 4 bytes → page table size = $524,288 \times 4 = 2$ MB per process.
:::

---

## Key Takeaways

- **Paging** divides physical memory into fixed-size **frames** and logical memory into same-size **pages**.
- The **page table** maps each page to a frame: `PageTable[page_number] = frame_number`.
- Address translation: $p = \lfloor \text{addr} / \text{page\_size} \rfloor$, $d = \text{addr} \mod \text{page\_size}$, $\text{PA} = f \times \text{page\_size} + d$.
- Paging **eliminates external fragmentation** because pages can be placed in any free frame.
- **Internal fragmentation** is minimal — at most half a page wasted per process (on average).
- A **memory-resident page table** doubles memory access time → the TLB (next lesson) fixes this.
- Page table entries contain frame number plus **valid**, **dirty**, **reference**, and **protection** bits.
- Paging enables easy **memory sharing** — multiple processes' page tables can point to the same physical frame.
- Page size is a tradeoff between table size, fragmentation, I/O efficiency, and TLB coverage.
