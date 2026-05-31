---
title: Interrupt Handling & DMA
section: "I/O Systems"
---

# Interrupt Handling & DMA

Interrupts are the **heartbeat of a modern operating system**. Without them, the CPU would have to constantly poll every device, wasting enormous computational resources. The interrupt mechanism allows hardware devices to asynchronously signal the CPU, enabling efficient multitasking, responsive I/O, and precise timekeeping. Paired with **Direct Memory Access (DMA)**, interrupts form the foundation of high-performance I/O in every modern system.

---

## The Interrupt Mechanism

> **"Almost all of the functionality of a modern operating system depends on the interrupt mechanism."**
> — Silberschatz, Galvin & Gagne

An **interrupt** is an asynchronous signal from hardware (or a synchronous trap from software) that diverts the CPU from its current execution path to handle an urgent event.

Think of it like a doorbell: you don't stand at the door all day waiting (polling) — you go about your business, and the doorbell _interrupts_ you when someone arrives.

---

## Interrupt Lifecycle

When a device needs CPU attention, the following sequence unfolds:

```text
Time ──────────────────────────────────────────────────────────▶

           ┌──────────────────────────────────────┐
Device:    │     Processing I/O request...        │──▶ DONE ──┐
           └──────────────────────────────────────┘           │
                                                    IRQ signal│
CPU:       │ Executing │ Finish  │ Check │ Save │ Look up│ Run │ Restore│ Resume │
           │ current   │ current │ IRQ   │ state│ ISR in │ ISR │ state  │ process│
           │ process   │ instr   │ line  │      │ IVT    │     │        │        │
           ├───────────┼─────────┼───────┼──────┼────────┼─────┼────────┼────────┤
                                    ▲                      │
                                    │  interrupt asserted   │
                                    └──────────────────────┘
```

### Step-by-Step Breakdown

| Step | Action                                             | Who Does It              |
| ---- | -------------------------------------------------- | ------------------------ |
| 1    | Device raises interrupt signal on IRQ line         | Hardware (device)        |
| 2    | CPU finishes executing current instruction         | CPU hardware             |
| 3    | CPU checks the interrupt request line              | CPU hardware             |
| 4    | CPU saves current state: PC, flags, registers      | CPU hardware (automatic) |
| 5    | CPU looks up ISR address in Interrupt Vector Table | CPU hardware             |
| 6    | CPU jumps to and executes the ISR                  | Software (OS)            |
| 7    | ISR acknowledges interrupt, handles the event      | Software (OS)            |
| 8    | CPU restores saved state                           | CPU hardware             |
| 9    | CPU resumes interrupted process                    | CPU hardware             |

> [!NOTE]
> Steps 2-5 and 8-9 are performed **automatically by hardware** — they take only a few dozen clock cycles. The ISR execution (steps 6-7) is the software part.

---

## Interrupt Vector Table (IVT)

The **Interrupt Vector Table** is an array in memory that maps each interrupt number to the address of its handler (ISR). On x86 systems, this is called the **Interrupt Descriptor Table (IDT)**.

| Vector # | Type      | Handler Address | Description                       |
| -------- | --------- | --------------- | --------------------------------- |
| 0        | Exception | `0xC0001000`    | Divide-by-zero error              |
| 1        | Exception | `0xC0001080`    | Debug exception                   |
| 6        | Exception | `0xC0001300`    | Invalid opcode                    |
| 8        | Exception | `0xC0001400`    | Double fault                      |
| 13       | Exception | `0xC0001A00`    | General protection fault          |
| 14       | Exception | `0xC0001B00`    | Page fault                        |
| 32       | Timer     | `0xC0002000`    | PIT / APIC timer interrupt        |
| 33       | Hardware  | `0xC0002080`    | Keyboard interrupt (IRQ 1)        |
| 36       | Hardware  | `0xC0002200`    | Serial port COM1 (IRQ 4)          |
| 46       | Hardware  | `0xC0002B00`    | Primary IDE/SATA (IRQ 14)         |
| 128      | Software  | `0xC0003000`    | System call (`int 0x80` on Linux) |

```text
Memory Layout of IVT (x86 real mode):

Address 0x0000:  ┌─────────────────┐
                 │ Vector 0: IP,CS │ → Divide-by-zero handler
Address 0x0004:  │ Vector 1: IP,CS │ → Debug handler
Address 0x0008:  │ Vector 2: IP,CS │ → NMI handler
                 │      ...        │
Address 0x007C:  │ Vector 31:IP,CS │ → Reserved exception
Address 0x0080:  │ Vector 32:IP,CS │ → Timer (IRQ 0)
                 │      ...        │
Address 0x03FC:  │ Vector 255:IP,CS│ → Last vector
                 └─────────────────┘
```

---

## Types of Interrupts

### Hardware Interrupts (External)

Generated by **hardware devices** outside the CPU. They are truly **asynchronous** — they can occur at any time.

| Source      | IRQ (x86)  | Purpose                               |
| ----------- | ---------- | ------------------------------------- |
| Timer       | IRQ 0      | Generate periodic tick for scheduling |
| Keyboard    | IRQ 1      | Key press or release                  |
| Cascade     | IRQ 2      | Slave interrupt controller            |
| Serial Port | IRQ 3/4    | Data received on COM port             |
| Disk        | IRQ 14/15  | Disk I/O completion                   |
| Network     | IRQ varies | Packet received/transmitted           |
| USB         | IRQ varies | USB device event                      |

### Software Interrupts (Traps)

Generated **intentionally by software** or by CPU-detected error conditions. They are **synchronous** — they occur at a specific instruction.

| Type            | Cause                       | Example                      |
| --------------- | --------------------------- | ---------------------------- |
| **System call** | Deliberate trap instruction | `int 0x80`, `syscall`, `svc` |
| **Exception**   | CPU-detected error          | Division by zero, page fault |
| **Breakpoint**  | Debug instruction           | `int 3` (debug trap)         |

### Comparison

| Feature      | Hardware Interrupt       | Software Interrupt                    |
| ------------ | ------------------------ | ------------------------------------- |
| **Trigger**  | External device signal   | Executing a trap instruction or error |
| **Timing**   | Asynchronous             | Synchronous (at specific instruction) |
| **Source**   | I/O devices, timer, DMA  | Programs, CPU exceptions              |
| **Maskable** | Usually yes (except NMI) | No — they occur deterministically     |
| **Purpose**  | Signal I/O events        | System calls, error handling          |
| **Example**  | Keyboard press → IRQ 1   | `int 0x80` → system call              |

---

## Interrupt Priority and Masking

Not all interrupts are equally urgent. A **priority scheme** determines which interrupts can preempt others.

```text
Priority Level (high to low):
┌─────────────────────────────────┐
│ NMI (Non-Maskable Interrupt)    │  ← Power failure, hardware error
├─────────────────────────────────┤     Cannot be disabled
│ Machine Check                   │  ← Uncorrectable hardware error
├─────────────────────────────────┤
│ Timer Interrupt                 │  ← Scheduling decisions
├─────────────────────────────────┤
│ Disk Interrupt                  │  ← I/O completion
├─────────────────────────────────┤
│ Network Interrupt               │  ← Packet arrival
├─────────────────────────────────┤
│ Keyboard Interrupt              │  ← Key press
├─────────────────────────────────┤
│ Software Interrupts             │  ← System calls
└─────────────────────────────────┘
```

### Nested Interrupts

When a higher-priority interrupt arrives while a lower-priority ISR is running, the CPU **nests** the interrupt:

```text
Time ───────────────────────────────────────────────▶

Process A:  ████████                          ██████
                    \                        /
Low-prio ISR:       ██████          ████████
                          \        /
High-prio ISR:             ████████
                           (preempts low-priority ISR)
```

### Interrupt Masking

The CPU can **mask** (disable) certain interrupts:

```c
// x86: Disable all maskable interrupts
asm volatile("cli");  // Clear Interrupt Flag

// Critical section — no interrupts can occur
// ... manipulate shared data structures ...

// Re-enable interrupts
asm volatile("sti");  // Set Interrupt Flag
```

> [!WARNING]
> Disabling interrupts for too long causes **missed events**, increased latency, and system unresponsiveness. The kernel must minimize the time spent with interrupts disabled.

---

## Top-Half vs Bottom-Half Processing

Modern kernels split interrupt handling into two phases to **minimize interrupt latency**:

| Phase           | Also Called      | Runs With           | Duration     | Work Done                                               |
| --------------- | ---------------- | ------------------- | ------------ | ------------------------------------------------------- |
| **Top-half**    | Hard IRQ handler | Interrupts disabled | Microseconds | Acknowledge IRQ, copy urgent data, schedule bottom-half |
| **Bottom-half** | Deferred work    | Interrupts enabled  | Milliseconds | Process data, wake processes, update data structures    |

### Why Split?

If the top-half does all the work, interrupts are disabled the entire time. This causes:

- Other interrupts are delayed or lost
- System latency increases
- Timer ticks are missed → scheduling breaks

### Linux Bottom-Half Mechanisms

| Mechanism        | Context           | Can Sleep? | Use Case                                        |
| ---------------- | ----------------- | ---------- | ----------------------------------------------- |
| **Softirq**      | Interrupt context | No         | High-frequency: networking, block I/O           |
| **Tasklet**      | Interrupt context | No         | Per-device deferred work                        |
| **Work Queue**   | Process context   | Yes        | Complex processing, may need to allocate memory |
| **Threaded IRQ** | Kernel thread     | Yes        | Modern preferred approach                       |

```c
// Top-half: runs with interrupts disabled — be FAST
irqreturn_t my_top_half(int irq, void *dev_id) {
    u32 status = ioread32(dev->status_reg);
    if (!(status & OUR_IRQ))
        return IRQ_NONE;

    // Save urgent data
    dev->saved_status = status;

    // Acknowledge hardware interrupt
    iowrite32(status, dev->status_reg);

    // Schedule bottom-half processing
    tasklet_schedule(&dev->my_tasklet);

    return IRQ_HANDLED;
}

// Bottom-half: runs with interrupts enabled — can take longer
void my_bottom_half(unsigned long data) {
    struct my_device *dev = (struct my_device *)data;

    // Process the data — this might take milliseconds
    process_received_data(dev);
    wake_up_interruptible(&dev->wait_queue);
}
```

---

## Direct Memory Access (DMA) In Detail

DMA is a hardware mechanism that allows a device to transfer data to/from memory **without CPU involvement** for each byte.

### DMA Controller Setup

The CPU programs the DMA controller with four parameters:

| Parameter               | Description                         | Example Value                 |
| ----------------------- | ----------------------------------- | ----------------------------- |
| **Source address**      | Where to read data from             | `0x1000_0000` (device buffer) |
| **Destination address** | Where to write data to              | `0x8000_0000` (RAM buffer)    |
| **Byte count**          | Number of bytes to transfer         | `65536` (64 KB)               |
| **Direction**           | Read from device or write to device | `DEVICE_TO_MEMORY`            |

### DMA Transfer Steps

```text
Step 1: CPU programs DMA controller
┌─────┐    setup     ┌─────────────┐
│ CPU │─────────────▶│ DMA Control │
└─────┘              └─────────────┘

Step 2: DMA takes control of bus, transfers data
              ┌─────────────┐    data    ┌────────┐
              │ DMA Control │───────────▶│ Memory │
              └──────┬──────┘            └────────┘
                     │ data
              ┌──────▼──────┐
              │   Device    │
              └─────────────┘

Step 3: DMA signals completion
┌─────┐  interrupt   ┌─────────────┐
│ CPU │◀─────────────│ DMA Control │
└─────┘              └─────────────┘
```

### DMA Transfer Modes

| Mode               | Description                                              | Bus Usage                 | CPU Impact                                            |
| ------------------ | -------------------------------------------------------- | ------------------------- | ----------------------------------------------------- |
| **Burst Mode**     | DMA takes exclusive bus control until transfer completes | High — bus is monopolized | CPU is locked out of memory for entire transfer       |
| **Cycle Stealing** | DMA transfers one word at a time, then yields bus        | Interleaved with CPU      | CPU is slightly slowed — each stolen cycle adds delay |
| **Transparent**    | DMA only uses bus when CPU doesn't need it               | Only idle bus cycles      | Zero impact on CPU — but transfer is slower           |

```text
Bus Timeline — Cycle Stealing:

Time ──────────────────────────────────────▶
CPU:  │ use │ wait │ use │ wait │ use │ use │
DMA:  │     │ xfer │     │ xfer │     │     │
Bus:  │ CPU │ DMA  │ CPU │ DMA  │ CPU │ CPU │
```

### Cache Coherency Issues with DMA

DMA introduces a critical **cache coherency problem**:

```text
Scenario: DMA writes data to memory location X

  Cache:     X = old_value  (stale!)
  Memory:    X = new_value  (updated by DMA)

CPU reads X → gets old_value from cache → WRONG!
```

**Solutions:**

| Solution                      | How It Works                                                  | Overhead                            |
| ----------------------------- | ------------------------------------------------------------- | ----------------------------------- |
| **Cache snooping**            | Hardware monitors bus, invalidates stale cache lines          | Requires hardware support           |
| **Cache flushing**            | OS flushes cache before DMA read, invalidates after DMA write | Software overhead per DMA operation |
| **Non-cacheable DMA buffers** | Mark DMA memory regions as uncacheable                        | Slower CPU access to those regions  |
| **IOMMU**                     | I/O memory management unit manages coherent DMA               | Hardware support needed             |

> [!IMPORTANT]
> In Linux, the DMA API (`dma_alloc_coherent()`, `dma_map_single()`) handles cache coherency automatically. Driver writers should **always** use the DMA API rather than managing caches manually.

---

## Scatter-Gather I/O

Traditional DMA transfers data to/from a **single contiguous** memory region. But real-world data is often scattered across multiple non-contiguous buffers (e.g., network protocol headers + payload + trailer).

**Scatter-Gather DMA** can transfer to/from a **list of memory regions** in a single operation:

```text
Traditional DMA:
  Device ──────────▶ [Contiguous Buffer: 64KB]

Scatter-Gather DMA:
  Device ──────────▶ [Header Buffer: 64B ]  (0x1000)
                     [Payload Buffer: 4KB]  (0x5000)
                     [Trailer Buffer: 32B]  (0xA000)
```

The DMA controller uses a **scatter-gather list** (SGL) — an array of (address, length) pairs:

```c
// Scatter-gather list entry
struct scatterlist {
    unsigned long   page_link;  // Page containing the buffer
    unsigned int    offset;     // Offset within the page
    unsigned int    length;     // Length of this segment
    dma_addr_t      dma_address;// DMA (bus) address
};
```

| Feature               | Traditional DMA                              | Scatter-Gather DMA               |
| --------------------- | -------------------------------------------- | -------------------------------- |
| **Memory layout**     | Must be contiguous                           | Can be scattered                 |
| **Memory allocation** | Needs large contiguous blocks (hard!)        | Uses existing page-sized buffers |
| **Copies**            | May need to copy data into contiguous buffer | Zero-copy possible               |
| **Hardware**          | Simple DMA controller                        | Needs SG-capable DMA controller  |
| **Use cases**         | Small, simple transfers                      | Network I/O, storage I/O         |

---

## Performance Calculations

### Interrupt Rate

If a device generates data at rate $R$ bytes/second and each interrupt transfers $B$ bytes:

$$\text{Interrupt Rate} = \frac{R}{B} \text{ interrupts/second}$$

**Example:** A network card receiving data at 1 Gbps (125 MB/s) with 1500-byte packets:

$$\text{Interrupt Rate} = \frac{125 \times 10^6}{1500} \approx 83{,}333 \text{ interrupts/second}$$

If each interrupt takes 4 µs to handle:

$$\text{CPU time for interrupts} = 83{,}333 \times 4 \times 10^{-6} = 0.333 \text{ seconds}$$

That's **33.3% of one CPU core** spent just handling interrupts!

> [!TIP]
> This is why modern NICs use **interrupt coalescing** — they batch multiple packets into one interrupt. If we coalesce 64 packets per interrupt, the rate drops to ~1,302 interrupts/second, using only 0.5% of CPU.

### DMA Throughput

$$\text{Effective DMA Throughput} = \frac{\text{Transfer Size}}{\text{Setup Time} + \text{Transfer Time}}$$

For a DMA transfer of 64 KB over a bus with 4 GB/s bandwidth and 5 µs setup:

$$\text{Transfer Time} = \frac{65{,}536}{4 \times 10^9} = 16.4\text{ µs}$$

$$\text{Effective Throughput} = \frac{65{,}536}{5 + 16.4} = \frac{65{,}536}{21.4\text{ µs}} \approx 3.06 \text{ GB/s}$$

The setup overhead reduces effective throughput from 4 GB/s to 3.06 GB/s. Larger transfers amortize the setup cost better.

---

## Interrupts in a Complete System

```text
┌────────────────────────────────────────────────────────┐
│                    CPU                                  │
│  ┌──────────┐  ┌────────────┐  ┌───────────────────┐  │
│  │ Process  │  │ Interrupt  │  │ Interrupt         │  │
│  │ Execution│  │ Controller │  │ Descriptor Table  │  │
│  │          │◀─┤ (APIC/PIC) │  │ (IDT)             │  │
│  └──────────┘  └─────┬──────┘  └───────────────────┘  │
│                      │                                  │
└──────────────────────┼──────────────────────────────────┘
                       │ IRQ lines
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────▼───┐   ┌─────▼────┐  ┌────▼───┐
    │ Timer  │   │ Disk     │  │Network │
    │ (IRQ0) │   │ (IRQ14)  │  │(IRQ11) │
    └────────┘   └──────────┘  └────────┘
```

---

## Try It Yourself

**Exercise 1:** A system has a 10 Gbps network card that uses interrupt coalescing with a maximum of 256 packets per interrupt. Each packet is 1500 bytes. Calculate: (a) the maximum interrupt rate, (b) if each interrupt takes 5 µs, what percentage of a 3 GHz CPU is used for interrupt handling?

:::details Solution
(a) Data rate: 10 Gbps = 1.25 GB/s = $1.25 \times 10^9$ bytes/s

Packets per second: $\frac{1.25 \times 10^9}{1500} = 833{,}333$ packets/s

With coalescing (256 packets/interrupt):
$$\text{Interrupt rate} = \frac{833{,}333}{256} \approx 3{,}255 \text{ interrupts/s}$$

(b) CPU time per second: $3{,}255 \times 5 \times 10^{-6} = 0.01628$ seconds

CPU utilization: $\frac{0.01628}{1} = 1.63\%$

Without coalescing, it would be $833{,}333 \times 5\mu s = 4.17$ seconds — more than 100% of one core! Coalescing reduces this to a manageable 1.63%.
:::

**Exercise 2:** Explain why a page fault is classified as a software interrupt (exception) even though it might eventually trigger a disk read (hardware interrupt). Trace the full sequence of events.

:::details Solution
A **page fault** is a **synchronous exception** because it is caused by a specific instruction attempting to access a not-present page. The CPU detects the fault deterministically at the moment of the memory access.

Full sequence:

1. CPU executes `MOV EAX, [address]` → page table entry marked "not present"
2. CPU raises **exception #14** (page fault) — this is a synchronous software interrupt
3. CPU saves state, looks up vector 14 in IDT, jumps to page fault handler
4. Page fault handler determines the page is on disk
5. Handler issues a disk read request (via device driver)
6. CPU is free to schedule another process
7. Disk completes the read → raises a **hardware interrupt** (IRQ 14 or similar)
8. Disk interrupt handler copies data to page frame, updates page table
9. Original process is made runnable
10. When scheduled, the faulting instruction is **re-executed** successfully

So the page fault (software interrupt) triggers a disk I/O that later produces a hardware interrupt. They are two separate interrupt events of different types.
:::

**Exercise 3:** A DMA controller is set up to transfer 1 MB in burst mode over a bus with 8 GB/s bandwidth. During the burst, the CPU cannot access memory. If the CPU runs at 4 GHz and accesses memory every 5th cycle, how many memory accesses does the CPU miss during the DMA burst?

:::details Solution
DMA transfer time: $\frac{1 \times 10^6}{8 \times 10^9} = 125\text{ µs}$

CPU cycles during DMA: $125 \times 10^{-6} \times 4 \times 10^9 = 500{,}000$ cycles

Memory accesses missed (1 every 5 cycles): $\frac{500{,}000}{5} = 100{,}000$ memory accesses

This is why **cycle-stealing** or **transparent** DMA modes are preferred for long transfers — they allow the CPU to interleave memory accesses with DMA, at the cost of slower DMA completion.
:::

---

## Key Takeaways

- The **interrupt lifecycle** involves 9 steps — hardware saves state, looks up the ISR in the **Interrupt Vector Table**, executes the handler, then restores state
- **Hardware interrupts** are asynchronous (from devices); **software interrupts** (traps/exceptions) are synchronous (from instructions)
- Interrupt **priority** ensures urgent events (NMI, timer) preempt less critical ones; **nested interrupts** allow high-priority handlers to interrupt lower-priority ones
- **Top-half/bottom-half** splitting minimizes time spent with interrupts disabled — the top-half does minimal work, the bottom-half handles complex processing with interrupts re-enabled
- **DMA** frees the CPU from byte-by-byte transfers — the CPU only performs setup and receives one completion interrupt; three modes (burst, cycle-stealing, transparent) trade off transfer speed vs CPU impact
- **Scatter-gather DMA** eliminates the need for contiguous memory buffers, enabling zero-copy I/O for network and storage stacks
- **Cache coherency** is a critical concern with DMA — always use the OS DMA API to ensure correct behavior
- **Interrupt coalescing** prevents interrupt storms from high-speed devices by batching multiple events into a single interrupt
