---
title: Demand Paging
section: "Memory Management"
---

# Demand Paging

Virtual memory promises that processes can use more memory than physically available. **Demand paging** is the mechanism that delivers on this promise: pages are loaded into physical memory only when they are actually **accessed**. This "lazy" approach is remarkably efficient because most programs only touch a fraction of their pages at any given time.

---

## Concept

> **Demand paging**: A page is brought into memory only when the CPU references an address on that page. If the page is not in memory, a **page fault** occurs, and the operating system loads the page from disk.

Think of it like a library that only fetches books from the warehouse when a reader requests them, rather than stocking every book on the shelves.

### Pager vs Swapper

| Term        | Granularity      | Meaning                                     |
| ----------- | ---------------- | ------------------------------------------- |
| **Swapper** | Entire process   | Moves whole processes between RAM and disk  |
| **Pager**   | Individual pages | Moves individual pages between RAM and disk |

Modern systems use **pagers**, not swappers. The term "swapping" persists in terminology (swap space, swap file) but the actual mechanism is page-level.

---

## Valid-Invalid Bit

Each page table entry has a **valid-invalid bit** that indicates where the page currently resides:

| Bit Value       | Meaning                                                          |
| --------------- | ---------------------------------------------------------------- |
| **v (valid)**   | Page is in physical memory — access proceeds normally            |
| **i (invalid)** | Page is on disk (or is an illegal address) — triggers page fault |

```text
  Page Table:
  ┌──────┬───────┬──────────┐
  │ Page │ Frame │ Valid/Inv │
  ├──────┼───────┼──────────┤
  │  0   │   4   │    v     │  ← In memory
  │  1   │   —   │    i     │  ← On disk
  │  2   │   7   │    v     │  ← In memory
  │  3   │   —   │    i     │  ← On disk
  │  4   │   2   │    v     │  ← In memory
  │  5   │   —   │    i     │  ← On disk
  │  6   │   —   │    i     │  ← Illegal address
  └──────┴───────┴──────────┘
```

---

## Page Fault Handling

When the CPU accesses a page marked as **invalid**, the hardware generates a **page fault trap**. The OS then handles it through the following steps:

### Step-by-Step Process

```text
  ┌─────────────────────────────────────────────────────────┐
  │                 Page Fault Handling                       │
  │                                                          │
  │  ① CPU references page → checks page table              │
  │     Valid bit = 'i' → TRAP to OS (page fault)           │
  │                                                          │
  │  ② OS checks: is this a legal address?                  │
  │     ├── Illegal → terminate process (segfault)          │
  │     └── Legal but on disk → continue to step ③          │
  │                                                          │
  │  ③ Find a FREE FRAME in physical memory                 │
  │     (if none free → invoke page replacement)            │
  │                                                          │
  │  ④ Issue DISK I/O: read page from disk into frame       │
  │     (process is blocked during I/O)                     │
  │                                                          │
  │  ⑤ Update page table: set frame number, valid bit = 'v' │
  │                                                          │
  │  ⑥ RESTART the instruction that caused the fault        │
  │     (now the page is in memory — access succeeds)       │
  └─────────────────────────────────────────────────────────┘
```

### Flow Diagram

```text
  CPU                   OS                    Disk
   │                     │                     │
   │─── reference ──→   │                     │
   │    page P          │                     │
   │                     │                     │
   │  page table:       │                     │
   │  P is invalid!     │                     │
   │                     │                     │
   │──── page fault ──→ │                     │
   │     trap           │                     │
   │                     │── is addr legal? ──│
   │                     │   YES              │
   │                     │                     │
   │                     │── find free frame ─│
   │                     │                     │
   │                     │──── read page ────→│
   │   (blocked)         │    from disk       │
   │                     │                     │── disk I/O ──│
   │                     │                     │              │
   │                     │←── I/O complete ───│
   │                     │                     │
   │                     │── update page      │
   │                     │   table: v, frame# │
   │                     │                     │
   │←── restart ────────│                     │
   │    instruction      │                     │
   │                     │                     │
   │── access succeeds! │                     │
```

---

## Pure Demand Paging

In its purest form, demand paging starts a process with **zero pages** in memory:

```text
  Process starts:
  ┌────────────────────────────────────────┐
  │ Page table: ALL entries = invalid      │
  │                                        │
  │ First instruction → page fault (code)  │
  │ First data access → page fault (data)  │
  │ First stack use  → page fault (stack)  │
  │                                        │
  │ Gradually, working set loads into RAM  │
  └────────────────────────────────────────┘
```

| Approach               | Pages Loaded at Start        | First Instruction                |
| ---------------------- | ---------------------------- | -------------------------------- |
| **Pre-paging**         | All pages (or predicted set) | No fault (fast start)            |
| **Pure demand paging** | Zero pages                   | Page fault on every first access |
| **Hybrid**             | A few predicted pages        | Fewer initial faults             |

> [!NOTE]
> Pure demand paging has high startup cost (many initial page faults) but wastes no memory loading unused pages. Most real systems use a hybrid approach: pre-load a few pages (e.g., the entry point and initial stack) and demand-page the rest.

---

## Effective Access Time with Page Faults

Let:

- $p$ = probability of a page fault ($0 \leq p \leq 1$)
- $t_\text{mem}$ = memory access time (typically 10-200 ns)
- $t_\text{pf}$ = page fault service time (typically 1-10 ms)

$$\text{EAT} = (1 - p) \times t_\text{mem} + p \times t_\text{pf}$$

### Worked Example

Given: $t_\text{mem} = 200$ ns, $t_\text{pf} = 8$ ms $= 8,000,000$ ns, $p = 0.001$ (1 in 1000 accesses):

$$\text{EAT} = (1 - 0.001) \times 200 + 0.001 \times 8{,}000{,}000$$

$$= 0.999 \times 200 + 8{,}000 = 199.8 + 8{,}000 = 8{,}199.8 \text{ ns}$$

**Slowdown factor**: $\frac{8199.8}{200} \approx 41\times$ slower!

Even at one page fault per 1000 accesses, the system is **41 times slower** because disk access is so expensive.

### How Low Must p Be?

To keep the slowdown below 10% (EAT < 220 ns):

$$220 > (1-p) \times 200 + p \times 8{,}000{,}000$$

$$220 > 200 - 200p + 8{,}000{,}000p$$

$$20 > 7{,}999{,}800p$$

$$p < \frac{20}{7{,}999{,}800} \approx 2.5 \times 10^{-6}$$

> Less than **one page fault per 400,000** memory accesses! This is achievable thanks to locality of reference.

### EAT vs Page Fault Rate Table

| Page Fault Rate ($p$) | EAT (ns) | Slowdown |
| --------------------- | -------- | -------- |
| 0 (no faults)         | 200      | 1×       |
| $10^{-6}$             | 208      | 1.04×    |
| $10^{-5}$             | 280      | 1.4×     |
| $10^{-4}$             | 1,000    | 5×       |
| $10^{-3}$             | 8,200    | 41×      |
| $10^{-2}$             | 80,200   | 401×     |
| 0.1                   | 800,200  | 4,001×   |

> [!WARNING]
> The page fault rate must be extremely low for demand paging to perform well. This is why page replacement algorithms and working set management (upcoming lessons) are so critical.

---

## Page Fault Service Time Breakdown

What happens during those 8 milliseconds? Here's a detailed cost breakdown:

| Step      | Activity                           | Time                    |
| --------- | ---------------------------------- | ----------------------- |
| 1         | Trap to OS, save process state     | 1-10 μs                 |
| 2         | Determine page fault is legal      | 1-10 μs                 |
| 3         | Find free frame (or select victim) | 1-10 μs                 |
| 4         | **Issue disk read**                | **~2-8 ms** (dominant!) |
| 5         | Disk seek + rotational latency     | included above          |
| 6         | Transfer page from disk to frame   | included above          |
| 7         | Interrupt from disk controller     | 1-10 μs                 |
| 8         | Update page table                  | 1-10 μs                 |
| 9         | Restart instruction                | 1-10 μs                 |
| **Total** |                                    | **~2-10 ms**            |

```text
  Time breakdown (not to scale):

  |──────|──────|──────────────────────────────────|──────|
  │ trap │ check│          DISK I/O                │update│
  │ <1%  │ <1%  │          ~99% of time            │ <1%  │
  |──────|──────|──────────────────────────────────|──────|

  The disk I/O dominates everything!
```

> [!IMPORTANT]
> With SSDs, page fault time drops from ~8 ms (HDD) to ~0.1 ms, making demand paging roughly 80× faster. This is one reason SSDs dramatically improve system responsiveness.

| Storage  | Page Fault Time | EAT at $p=10^{-3}$ |
| -------- | --------------- | ------------------ |
| HDD      | ~8 ms           | 8,200 ns (41×)     |
| SSD      | ~0.1 ms         | 300 ns (1.5×)      |
| NVMe SSD | ~0.02 ms        | 220 ns (1.1×)      |

---

## Copy-on-Write (COW)

**Copy-on-Write** is a crucial optimization for `fork()` that leverages the virtual memory system:

### The Problem

When a process calls `fork()`, the child is a copy of the parent. Naively, this requires copying all of the parent's memory — potentially gigabytes.

### The Solution

Instead of copying memory, the parent and child **share** the same physical pages. All shared pages are marked **read-only**:

```text
  After fork() with COW:

  Parent's Page Table:         Child's Page Table:
  ┌───┬───────┬──────┐         ┌───┬───────┬──────┐
  │ 0 │ Fr. 5 │ R/O  │         │ 0 │ Fr. 5 │ R/O  │  ← Same frame!
  │ 1 │ Fr. 8 │ R/O  │         │ 1 │ Fr. 8 │ R/O  │  ← Same frame!
  │ 2 │ Fr. 3 │ R/O  │         │ 2 │ Fr. 3 │ R/O  │  ← Same frame!
  └───┴───────┴──────┘         └───┴───────┴──────┘

  Physical memory:
  Frame 3: [shared data - read only]
  Frame 5: [shared data - read only]
  Frame 8: [shared data - read only]

  No copying happened! fork() was nearly instant.
```

### When a Write Occurs

```text
  Child writes to page 1:

  1. Write to Frame 8 → page marked R/O → page fault!
  2. OS detects COW situation
  3. OS copies Frame 8 → new Frame 12
  4. Child's page table: page 1 → Frame 12 (R/W)
  5. Parent's page table: page 1 → Frame 8 (R/W, if no other sharers)
  6. Child's write proceeds on Frame 12

  Parent:                       Child:
  ┌───┬───────┬──────┐          ┌───┬────────┬──────┐
  │ 0 │ Fr. 5 │ R/O  │          │ 0 │ Fr. 5  │ R/O  │
  │ 1 │ Fr. 8 │ R/W  │          │ 1 │ Fr. 12 │ R/W  │ ← Own copy!
  │ 2 │ Fr. 3 │ R/O  │          │ 2 │ Fr. 3  │ R/O  │
  └───┴───────┴──────┘          └───┴────────┴──────┘

  Only the WRITTEN page was copied — not all pages!
```

### COW Benefits

| Scenario                            | Without COW                              | With COW                                         |
| ----------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| `fork()` + `exec()` (shell pattern) | Copy all pages, then discard immediately | Copy zero pages; `exec()` replaces address space |
| `fork()` + child reads only         | Copy all pages unnecessarily             | No copies — shared read-only                     |
| `fork()` + child writes 1 page      | Copy all pages                           | Copy only 1 page                                 |

> [!TIP]
> The common Unix pattern `fork()` + `exec()` benefits enormously from COW. The child process replaces its entire address space with `exec()`, so any pages copied during `fork()` would be immediately wasted. COW avoids this waste entirely.

---

## Page Fault Handling in Practice

### Linux Page Fault Handler (Simplified)

```c
// Simplified Linux page fault handler
void do_page_fault(struct pt_regs *regs, unsigned long address) {
    struct vm_area_struct *vma;

    // Step 1: Find the VMA (Virtual Memory Area) for this address
    vma = find_vma(current->mm, address);

    if (!vma || address < vma->vm_start) {
        // Address not in any valid VMA → segmentation fault
        send_signal(SIGSEGV, current);
        return;
    }

    // Step 2: Check permissions
    if (is_write && !(vma->vm_flags & VM_WRITE)) {
        // Check for Copy-on-Write
        if (is_cow_page(address)) {
            handle_cow(address);  // Copy page, update mapping
            return;
        }
        send_signal(SIGSEGV, current);  // Permission denied
        return;
    }

    // Step 3: Handle the fault
    if (page_is_in_swap(address)) {
        // Page was swapped to disk → read it back
        swap_in_page(address);
    } else if (is_anonymous_page(vma)) {
        // New page (first access) → allocate zeroed page
        allocate_zero_page(address);
    } else {
        // File-backed page → read from file
        filemap_fault(vma, address);
    }
}
```

### Types of Page Faults

| Type                   | Cause                                                                | Handling                   | Cost     |
| ---------------------- | -------------------------------------------------------------------- | -------------------------- | -------- |
| **Minor (soft) fault** | Page is in memory but not mapped in page table (e.g., in page cache) | Update page table only     | ~1 μs    |
| **Major (hard) fault** | Page must be read from disk                                          | Disk I/O required          | ~1-10 ms |
| **Invalid fault**      | Access to truly invalid address                                      | Process killed (SIGSEGV)   | N/A      |
| **COW fault**          | Write to shared (COW) page                                           | Copy page, update mappings | ~1-10 μs |

```python
import resource

# Monitor page faults in Python
before = resource.getrusage(resource.RUSAGE_SELF)

# Do some work that might cause page faults
data = [0] * 10_000_000  # Allocate ~80 MB
for i in range(0, len(data), 4096 // 8):
    data[i] = 1  # Touch each page

after = resource.getrusage(resource.RUSAGE_SELF)

minor_faults = after.ru_minflt - before.ru_minflt
major_faults = after.ru_majflt - before.ru_majflt
print(f"Minor page faults: {minor_faults}")
print(f"Major page faults: {major_faults}")
```

---

## Instruction Restart

A subtle requirement of demand paging is that the CPU must be able to **restart any instruction** after a page fault. This is challenging because some instructions modify state before faulting:

| Issue                     | Example                                                              | Solution                                    |
| ------------------------- | -------------------------------------------------------------------- | ------------------------------------------- |
| Multi-step instruction    | Block move (MVC on IBM) touches multiple pages                       | Microcode checks all pages before executing |
| Auto-increment addressing | `MOV (R1)+, (R2)+` modifies registers before fault on second operand | Save register state, restore on fault       |
| Partial execution         | Instruction modified memory before faulting                          | Hardware undo or careful ordering           |

> [!NOTE]
> Modern architectures (x86, ARM) are designed to support precise interrupts — the CPU can always restart an instruction cleanly after a page fault. This was not always the case with older architectures.

---

## Try It Yourself

**Exercise 1:** A system has memory access time of 100 ns. The page fault service time is 5 ms. What is the maximum acceptable page fault rate to keep the EAT below 150 ns?

:::details Solution
$$150 > (1-p) \times 100 + p \times 5{,}000{,}000$$

$$150 > 100 - 100p + 5{,}000{,}000p$$

$$50 > 4{,}999{,}900p$$

$$p < \frac{50}{4{,}999{,}900} \approx 1.0 \times 10^{-5}$$

The page fault rate must be less than **1 in 100,000** accesses — approximately one page fault per 100,000 memory references.
:::

**Exercise 2:** After a `fork()`, the parent process has 1000 pages. The child process runs and writes to 50 pages before calling `exec()`. How many pages were actually copied with COW? How many would have been copied without COW?

:::details Solution
**With COW**: Only the 50 written pages are copied. Total copies = **50 pages**.

**Without COW**: All 1000 pages copied during `fork()`. Total copies = **1000 pages**.

**Savings**: $\frac{1000 - 50}{1000} = 95\%$ of the copying work is saved. Plus, the `exec()` call replaces the child's entire address space, so even those 50 copies were arguably wasteful (but unavoidable since the child wrote to them before `exec()`).
:::

**Exercise 3:** Arrange these events in the correct order for a page fault on page 7:
(a) Restart the instruction
(b) Trap to OS
(c) Update page table entry
(d) CPU references address on page 7
(e) Read page from disk into free frame
(f) Find a free frame

:::details Solution
Correct order: **(d) → (b) → (f) → (e) → (c) → (a)**

1. **(d)** CPU references address on page 7 — discovers page is invalid
2. **(b)** Trap to OS — page fault handler invoked
3. **(f)** Find a free frame — OS checks free frame list
4. **(e)** Read page from disk into free frame — disk I/O (slowest step)
5. **(c)** Update page table entry — set frame number and valid bit
6. **(a)** Restart the instruction — now the page is in memory
   :::

---

## Key Takeaways

- **Demand paging** loads pages only when accessed — "lazy loading" at the page level.
- The **valid-invalid bit** in the page table indicates whether a page is in memory (v) or on disk (i).
- A **page fault** triggers a trap to the OS, which loads the page from disk, updates the page table, and restarts the instruction.
- **Effective Access Time**: $\text{EAT} = (1-p) \times t_\text{mem} + p \times t_\text{pf}$. Even small page fault rates cause significant slowdowns because disk is ~100,000× slower than RAM.
- The page fault rate must be **extremely low** (~$10^{-6}$) for acceptable performance.
- **Copy-on-Write** optimizes `fork()` by sharing pages until a write occurs — then only the written page is copied.
- Page faults are classified as **minor** (page in cache, fast) or **major** (disk I/O required, slow).
- SSDs reduce page fault penalty from ~8 ms to ~0.1 ms, making demand paging much more practical.
- CPU architectures must support **instruction restart** for demand paging to work correctly.
