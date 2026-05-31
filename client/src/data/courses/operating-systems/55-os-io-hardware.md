---
title: I/O Hardware
section: "I/O Systems"
---

# I/O Hardware

Every computer system must communicate with the outside world — reading keystrokes, displaying graphics, storing files, and sending network packets. The **Input/Output (I/O) subsystem** bridges the gap between the CPU/memory core and the vast ecosystem of peripheral devices. Understanding I/O hardware is essential because I/O performance often dominates overall system performance; a perfectly scheduled CPU is useless if the disk or network becomes a bottleneck.

---

## I/O Device Diversity

Modern computers interact with hundreds of device types. We broadly classify them by their **function** in the system.

| Category                      | Purpose                   | Examples                                        |
| ----------------------------- | ------------------------- | ----------------------------------------------- |
| **Storage devices**           | Persistent data storage   | HDD, SSD, NVMe, USB flash, tape                 |
| **Communication devices**     | Network and data transfer | Ethernet NIC, Wi-Fi adapter, Bluetooth, modem   |
| **Human-interface devices**   | User interaction          | Keyboard, mouse, touchscreen, monitor, speaker  |
| **Multimedia devices**        | Audio/video processing    | GPU, sound card, webcam, capture card           |
| **Machine-interface devices** | Control physical systems  | Sensors, actuators, DAQ cards, SCSI controllers |

> **"The I/O system is the most varied and complex part of any operating system."**
> — Andrew S. Tanenbaum

---

## Block Devices vs Character Devices

At a fundamental level, devices are classified by **how they transfer data**.

| Feature              | Block Devices                       | Character Devices                     |
| -------------------- | ----------------------------------- | ------------------------------------- |
| **Data unit**        | Fixed-size blocks (512 B – 4 KB)    | Single characters (bytes)             |
| **Addressable**      | Yes — random access by block number | No — sequential stream                |
| **Seekable**         | Yes                                 | No                                    |
| **Buffered**         | OS usually buffers via block cache  | Typically unbuffered or line-buffered |
| **Examples**         | HDD, SSD, CD-ROM, USB drive         | Keyboard, mouse, serial port, printer |
| **UNIX device file** | `/dev/sda`, `/dev/nvme0n1`          | `/dev/ttyS0`, `/dev/input/mice`       |

> [!NOTE]
> Some devices don't fit neatly into either category. A **network interface** is neither block nor character — it produces/consumes packets of varying size. Most OSes treat networking as a separate subsystem.

---

## I/O Hardware Components

Three core hardware concepts form the backbone of every I/O system: **ports**, **buses**, and **controllers**.

### Port

A **port** is a connection point where a device attaches to the system. Each port has a set of registers the CPU can read or write.

### Bus

A **bus** is a shared set of wires (plus a protocol) that connects multiple devices. Buses can be **daisy-chained** or connected through a **hub/switch**.

### Controller

A **device controller** (or host adapter) is the electronics that operate a port, bus, or device. The controller presents a **register interface** to the CPU.

```text
┌────────────┐     ┌──────────────┐     ┌──────────────┐
│    CPU     │────▶│  System Bus  │────▶│ Memory (RAM) │
└────────────┘     │  (Front-side)│     └──────────────┘
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │  I/O Bridge   │
                   │  (Chipset)    │
                   └──────┬───────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
        ┌─────▼────┐ ┌───▼─────┐ ┌───▼─────┐
        │ PCIe Bus │ │USB Ctrl │ │SATA Ctrl│
        └─────┬────┘ └───┬─────┘ └───┬─────┘
              │           │           │
         ┌────▼───┐  ┌───▼────┐  ┌───▼────┐
         │  GPU   │  │Keyboard│  │  HDD   │
         └────────┘  │ Mouse  │  │  SSD   │
                     └────────┘  └────────┘
```

### Device Controller Registers

Every device controller exposes a small set of registers to the CPU:

| Register              | Direction    | Purpose                                |
| --------------------- | ------------ | -------------------------------------- |
| **Data-In**           | Device → CPU | Holds data read from the device        |
| **Data-Out**          | CPU → Device | Holds data to be written to the device |
| **Status**            | Device → CPU | Flags: busy, ready, error, done        |
| **Control** (Command) | CPU → Device | Commands: start, reset, mode select    |

The CPU interacts with a device by writing commands to the **control register**, checking the **status register**, and transferring data through the **data registers**.

---

## I/O Communication Techniques

The CPU and devices must cooperate to transfer data. There are three fundamental techniques, each with different performance characteristics.

### 1. Programmed I/O (Polling)

In **programmed I/O**, the CPU manually manages every step of the transfer and **repeatedly polls** the device status register.

```text
  CPU                    Device Controller
   │                           │
   ├──── Write command ──────▶│
   │                           │ (device busy)
   ├──── Read status ────────▶│  ← "busy"
   ├──── Read status ────────▶│  ← "busy"
   ├──── Read status ────────▶│  ← "busy"
   ├──── Read status ────────▶│  ← "READY"
   │                           │
   ├──── Read data-in ───────▶│  ← data byte
   │                           │
   └──── Process data          │
```

```c
// Polling example: read one byte from a device
#define STATUS_REG  0x64
#define DATA_REG    0x60
#define READY_BIT   0x01

unsigned char poll_read(void) {
    // Busy-wait until device is ready
    while ((inb(STATUS_REG) & READY_BIT) == 0) {
        // CPU spins here — wasting cycles!
    }
    return inb(DATA_REG);
}
```

> [!WARNING]
> Polling **wastes CPU cycles** during the busy-wait loop. If a device takes 1 ms to become ready and the CPU runs at 3 GHz, approximately **3 million CPU cycles are wasted** per transfer.

### 2. Interrupt-Driven I/O

With **interrupt-driven I/O**, the CPU issues a command and continues other work. The device **raises an interrupt** when the operation completes.

```text
Time ──────────────────────────────────────────────────▶

CPU:  [Issue cmd] [Run process A] [Run process B] [ISR] [Resume]
                                                    ▲
Device: [busy...........................done]────────┘
                                            interrupt signal
```

The interrupt mechanism eliminates busy-waiting:

1. CPU writes command to the device controller
2. CPU switches to another process
3. Device completes operation and asserts the interrupt line
4. CPU saves current state and jumps to the **Interrupt Service Routine (ISR)**
5. ISR reads data, signals waiting process
6. CPU restores state and resumes

### 3. Direct Memory Access (DMA)

For high-volume data transfers, even interrupt-driven I/O is too slow — the CPU must still copy each byte between device registers and memory. **DMA** offloads the entire data transfer to a dedicated **DMA controller**.

```text
┌───────┐         ┌──────────────┐         ┌──────────┐
│  CPU  │────────▶│ DMA Controller│────────▶│  Memory  │
└───────┘  setup  │              │  data    └──────────┘
   │              │  src addr    │     ▲
   │              │  dst addr    │     │  direct
   │              │  byte count  │     │  transfer
   │              │  direction   │     │
   │              └──────┬───────┘     │
   │                     │             │
   │              ┌──────▼───────┐     │
   │              │   Device     │─────┘
   │              │  Controller  │
   │              └──────────────┘
   │                     │
   │◀── interrupt ───────┘  (transfer complete)
```

**DMA Transfer Steps:**

1. CPU programs the DMA controller: source address, destination address, byte count, direction
2. CPU tells device controller to begin
3. DMA controller takes over the bus and transfers data directly between device and memory
4. When finished, DMA controller interrupts the CPU
5. CPU receives one interrupt for the entire block — not one per byte

---

## Polling vs Interrupts vs DMA

| Feature             | Polling                     | Interrupt-Driven                        | DMA                             |
| ------------------- | --------------------------- | --------------------------------------- | ------------------------------- |
| **CPU involvement** | Full — busy-wait            | Per-byte interrupt                      | Minimal — setup + one interrupt |
| **CPU waste**       | Very high                   | Moderate (context switch per interrupt) | Very low                        |
| **Throughput**      | Low for slow devices        | Medium                                  | High                            |
| **Latency**         | Low (if polling fast)       | Depends on interrupt latency            | Slightly higher (DMA setup)     |
| **Complexity**      | Very simple                 | Moderate                                | Complex (DMA controller needed) |
| **Best for**        | Very fast devices, embedded | Infrequent I/O (keyboard)               | Bulk transfers (disk, network)  |

> [!TIP]
> Modern systems use a **hybrid** approach. Fast devices (NVMe SSDs) may start with polling for low-latency I/O and switch to interrupt mode under high load to avoid interrupt storms.

---

## Memory-Mapped I/O vs Port-Mapped I/O

The CPU must read/write device controller registers. Two hardware architectures exist for this.

### Memory-Mapped I/O

Device registers are assigned addresses in the **regular memory address space**. The CPU uses ordinary `load` and `store` instructions.

```text
Address Space:
 0x0000_0000  ┌────────────────┐
              │    RAM         │
 0x7FFF_FFFF  ├────────────────┤
              │    Reserved    │
 0xFE00_0000  ├────────────────┤
              │  GPU Registers │  ← Memory-mapped device
 0xFF00_0000  ├────────────────┤
              │  NIC Registers │  ← Memory-mapped device
 0xFFFF_FFFF  └────────────────┘
```

### Port-Mapped I/O (Isolated I/O)

Device registers live in a **separate I/O address space**. The CPU uses special instructions (`IN`, `OUT` on x86).

```c
// Port-mapped I/O on x86
outb(0x60, data);       // Write 'data' to I/O port 0x60
value = inb(0x64);      // Read from I/O port 0x64
```

### Comparison

| Feature           | Memory-Mapped I/O                       | Port-Mapped I/O                   |
| ----------------- | --------------------------------------- | --------------------------------- |
| **Address space** | Shared with RAM                         | Separate I/O space                |
| **Instructions**  | Regular `load`/`store`                  | Special `IN`/`OUT`                |
| **Protection**    | Via page tables (per-page)              | Via privilege level (kernel only) |
| **Caching**       | Must disable caching for device regions | Not cached by default             |
| **Programming**   | Easier — use pointers in C              | Requires special inline assembly  |
| **Used by**       | ARM, modern x86 PCIe devices            | Legacy x86 (ISA devices)          |

> [!IMPORTANT]
> Most modern systems use **memory-mapped I/O** because it is faster, more flexible, and works naturally with virtual memory protection. Port-mapped I/O survives mainly for legacy compatibility on x86.

---

## I/O Bus Architectures

Devices connect to the CPU through various bus standards, each optimized for different bandwidth and distance requirements.

| Bus             | Type                   | Max Bandwidth            | Lanes/Wires       | Typical Use                   |
| --------------- | ---------------------- | ------------------------ | ----------------- | ----------------------------- |
| **PCI**         | Parallel, shared       | 533 MB/s (64-bit/66 MHz) | 32 or 64          | Legacy expansion cards        |
| **PCIe 3.0**    | Serial, point-to-point | ~1 GB/s per lane         | ×1 to ×16         | GPU, NVMe SSD, NIC            |
| **PCIe 4.0**    | Serial, point-to-point | ~2 GB/s per lane         | ×1 to ×16         | High-end GPU, NVMe            |
| **PCIe 5.0**    | Serial, point-to-point | ~4 GB/s per lane         | ×1 to ×16         | Data center, AI accelerators  |
| **USB 2.0**     | Serial, hub-based      | 480 Mbps (60 MB/s)       | 4 wires           | Keyboard, mouse, flash drive  |
| **USB 3.2**     | Serial, hub-based      | 20 Gbps (2.5 GB/s)       | 10+ wires         | External SSD, docking station |
| **USB4**        | Serial, tunneled       | 40 Gbps (5 GB/s)         | Thunderbolt-based | Universal connector           |
| **SATA III**    | Serial, point-to-point | 6 Gbps (600 MB/s)        | 7 wires           | HDD, SATA SSD                 |
| **NVMe (PCIe)** | Via PCIe               | 32 GB/s (×4 PCIe 5.0)    | PCIe lanes        | High-perf SSD                 |

```text
Bus Bandwidth Comparison (log scale, approximate):

USB 2.0   |████                                            60 MB/s
SATA III  |████████████                                   600 MB/s
USB 3.2   |██████████████████████████                   2,500 MB/s
PCIe 3 x4 |███████████████████████████████              4,000 MB/s
PCIe 4 x16|██████████████████████████████████████████  32,000 MB/s
```

---

## Calculating I/O Transfer Time

For any I/O operation, the total time depends on multiple factors:

$$T_{total} = T_{overhead} + \frac{n}{BW}$$

Where:

- $T_{overhead}$ = setup time (command issue, DMA setup, interrupt handling)
- $n$ = number of bytes to transfer
- $BW$ = bus bandwidth in bytes/second

**Example:** Transfer 4 KB over PCIe 3.0 ×1 lane (~1 GB/s):

$$T_{total} = 2\mu s + \frac{4096}{1 \times 10^9} \approx 2\mu s + 4.1\mu s = 6.1\mu s$$

For the same transfer via USB 2.0 (60 MB/s):

$$T_{total} = 10\mu s + \frac{4096}{60 \times 10^6} \approx 10\mu s + 68.3\mu s = 78.3\mu s$$

> [!NOTE]
> The overhead term matters greatly for small transfers. This is why NVMe SSDs with PCIe use **submission/completion queues** in memory to minimize per-I/O overhead.

---

## Try It Yourself

**Exercise 1:** A device controller has a status register that takes 100 ns to read. If the device takes 500 µs to complete an operation, how many polling iterations does the CPU perform? How many CPU cycles are wasted at 2 GHz?

:::details Solution
Polling iterations = $\frac{500 \times 10^{-6}}{100 \times 10^{-9}} = 5000$ iterations

CPU cycles wasted = $500 \times 10^{-6} \times 2 \times 10^{9} = 1{,}000{,}000$ cycles

That's **one million wasted cycles** — the CPU could have executed roughly 500,000 useful instructions in that time.
:::

**Exercise 2:** A DMA controller transfers a 64 KB block from disk to memory via a PCIe 3.0 ×4 bus (~4 GB/s). DMA setup takes 5 µs. Calculate the total transfer time. Compare this with interrupt-driven I/O where each 4-byte word triggers an interrupt taking 2 µs to handle.

:::details Solution
**DMA approach:**
$$T_{DMA} = 5\mu s + \frac{65536}{4 \times 10^9} = 5\mu s + 16.4\mu s = 21.4\mu s$$

**Interrupt-driven approach:**
Number of 4-byte words: $\frac{65536}{4} = 16384$ interrupts

$$T_{interrupt} = 16384 \times 2\mu s = 32{,}768\mu s = 32.77\text{ ms}$$

DMA is roughly **1530× faster** for this bulk transfer!
:::

**Exercise 3:** A system uses memory-mapped I/O. A programmer accidentally enables caching for the device register memory region. What could go wrong?

:::details Solution
If the CPU caches device register reads, it may read **stale values** from the cache instead of the current register contents. For example:

1. CPU reads the status register → cached as "busy"
2. Device completes and sets status to "ready"
3. CPU reads status again → cache returns "busy" (stale!)
4. CPU never sees the device become ready → **system hangs**

This is why device memory regions must be mapped as **uncacheable** (e.g., using the `UC` memory type on x86 page tables or marking the region with `ioremap_nocache()` in the Linux kernel).
:::

---

## Key Takeaways

- I/O devices are classified as **block** (random access, fixed-size chunks) or **character** (sequential byte streams), though some devices like NICs don't fit either category
- Every device controller presents **four types of registers**: data-in, data-out, status, and control
- **Polling** is simple but wastes CPU cycles; **interrupt-driven I/O** frees the CPU but adds per-transfer overhead; **DMA** is optimal for bulk transfers, requiring only setup + one interrupt
- **Memory-mapped I/O** maps device registers into the address space (use `load`/`store`); **port-mapped I/O** uses special instructions (`IN`/`OUT`) — most modern systems prefer memory-mapped
- Bus architectures range from USB 2.0 at 60 MB/s to PCIe 5.0 ×16 at ~64 GB/s — choosing the right bus for a device determines maximum throughput
- Modern I/O increasingly uses **hybrid techniques**: polling for low-latency fast devices, interrupts for infrequent events, and DMA for all bulk data movement
- I/O hardware understanding is fundamental to writing device drivers and optimizing system performance
