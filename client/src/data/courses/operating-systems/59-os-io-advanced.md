---
title: Advanced I/O Topics
---

# Advanced I/O Topics

Beyond the basic I/O models of polling, interrupts, and DMA lies a rich landscape of advanced techniques that modern operating systems use to squeeze maximum performance from I/O subsystems. This lesson covers **blocking vs non-blocking vs asynchronous I/O**, **I/O multiplexing** for handling thousands of concurrent connections, **zero-copy** techniques that eliminate unnecessary data copies, and the complete lifecycle of an I/O request from application to hardware.

---

## I/O Models: Blocking, Non-Blocking, and Asynchronous

The way a process interacts with the I/O subsystem fundamentally affects application design and performance.

### Blocking I/O

In **blocking I/O**, the process calls `read()` or `write()` and is **suspended** until the operation completes. The process cannot do anything else during the wait.

```text
Process              Kernel               Device
   │                    │                    │
   ├── read() ────────▶│                    │
   │   (process        │── issue I/O ─────▶│
   │    sleeps)        │                    │
   │   zzz...          │   zzz...           │ working...
   │                    │                    │
   │                    │◀── data ready ────│
   │                    │                    │
   │◀── return data ───│                    │
   │   (process wakes)  │                    │
   ├── process data     │                    │
```

### Non-Blocking I/O

In **non-blocking I/O**, `read()` returns **immediately** — either with available data, or with an indication that no data is ready yet. The process must **poll** repeatedly.

```text
Process              Kernel               Device
   │                    │                    │
   ├── read() ────────▶│                    │
   │◀── EWOULDBLOCK ──│  (no data yet)     │ working...
   │                    │                    │
   ├── read() ────────▶│                    │
   │◀── EWOULDBLOCK ──│  (still not ready) │ working...
   │                    │                    │
   ├── read() ────────▶│                    │
   │◀── EWOULDBLOCK ──│                    │
   │                    │◀── data ready ────│
   ├── read() ────────▶│                    │
   │◀── return data ──│                    │
   ├── process data     │                    │
```

### Asynchronous I/O

In **asynchronous I/O**, the process issues a request and continues execution immediately. The kernel **notifies** the process when the operation completes (via signal, callback, or completion event).

```text
Process              Kernel               Device
   │                    │                    │
   ├── aio_read() ────▶│                    │
   │◀── return OK ─────│── issue I/O ─────▶│
   │                    │                    │
   │  (do other work)  │   waiting...       │ working...
   │  █████████████     │                    │
   │                    │◀── data ready ────│
   │                    │                    │
   │◀── signal/callback│  (data copied to   │
   │   SIGIO or event   │   user buffer)     │
   ├── process data     │                    │
```

### Comparison

| Feature                | Blocking                | Non-Blocking                    | Asynchronous             |
| ---------------------- | ----------------------- | ------------------------------- | ------------------------ |
| **Process during I/O** | Suspended (sleeps)      | Active (polls)                  | Active (does other work) |
| **Return behavior**    | Waits for completion    | Returns immediately with status | Returns immediately      |
| **Data availability**  | Data ready on return    | May not be ready                | Notified when ready      |
| **CPU usage**          | None (process blocked)  | High (polling loop)             | Efficient (event-driven) |
| **Complexity**         | Simple                  | Moderate                        | Complex                  |
| **Scalability**        | Poor (1 thread per I/O) | Moderate                        | Excellent                |
| **POSIX functions**    | `read()`, `write()`     | `fcntl(O_NONBLOCK)`             | `aio_read()`, `io_uring` |

> [!TIP]
> Modern high-performance servers use **asynchronous I/O** or **I/O multiplexing** (next section) to handle thousands of connections with a small number of threads. Blocking I/O requires one thread per connection, which doesn't scale.

---

## I/O Multiplexing

**I/O multiplexing** allows a single thread to monitor **multiple file descriptors** simultaneously, blocking until at least one is ready. This is the foundation of event-driven servers like Nginx and Node.js.

### The Three Interfaces

| Interface  | POSIX      | Introduced       | Scalability                            | Mechanism                 |
| ---------- | ---------- | ---------------- | -------------------------------------- | ------------------------- |
| `select()` | Yes        | 4.2BSD (1983)    | O(n) per call, FD_SETSIZE limit (1024) | Bitmap of FDs             |
| `poll()`   | Yes        | SVR4 (1986)      | O(n) per call, no FD limit             | Array of `pollfd` structs |
| `epoll`    | Linux only | Linux 2.6 (2003) | O(1) for events, O(n) one-time setup   | Kernel event table        |

```c
// Using select() — monitor multiple FDs
#include <sys/select.h>

fd_set read_fds;
FD_ZERO(&read_fds);
FD_SET(socket1, &read_fds);
FD_SET(socket2, &read_fds);

// Block until at least one FD is ready
int ready = select(max_fd + 1, &read_fds, NULL, NULL, &timeout);

if (FD_ISSET(socket1, &read_fds)) {
    // socket1 has data — read it
    read(socket1, buf, sizeof(buf));
}
```

```c
// Using epoll — scales to millions of connections
#include <sys/epoll.h>

int epfd = epoll_create1(0);

struct epoll_event ev;
ev.events = EPOLLIN;
ev.data.fd = socket1;
epoll_ctl(epfd, EPOLL_CTL_ADD, socket1, &ev);

struct epoll_event events[MAX_EVENTS];
int n = epoll_wait(epfd, events, MAX_EVENTS, timeout_ms);

for (int i = 0; i < n; i++) {
    read(events[i].data.fd, buf, sizeof(buf));
}
```

### Performance Comparison

| Connections | `select()`                | `poll()`    | `epoll`            |
| ----------- | ------------------------- | ----------- | ------------------ |
| 100         | ~fast                     | ~fast       | ~fast              |
| 1,000       | Slow (scan 1000 FDs)      | Slow        | Fast (O(1) events) |
| 10,000      | Very slow                 | Very slow   | Fast               |
| 100,000     | Not possible (FD_SETSIZE) | Very slow   | Fast               |
| 1,000,000   | Not possible              | Impractical | Practical          |

> [!NOTE]
> Other OS-specific multiplexing interfaces include **kqueue** (FreeBSD/macOS) and **IOCP** (Windows). Linux's newest API, **io_uring** (since kernel 5.1), provides even higher performance by sharing ring buffers between user space and kernel, minimizing system call overhead.

---

## Vectored I/O (Scatter-Gather)

**Vectored I/O** allows reading into or writing from **multiple non-contiguous buffers** in a single system call, avoiding unnecessary data copies.

```c
#include <sys/uio.h>

// Write a protocol message: header + payload + footer
struct iovec iov[3];

iov[0].iov_base = &header;     // 12 bytes
iov[0].iov_len  = sizeof(header);

iov[1].iov_base = payload;     // 4096 bytes
iov[1].iov_len  = payload_len;

iov[2].iov_base = &footer;     // 4 bytes
iov[2].iov_len  = sizeof(footer);

// Single system call writes all three buffers
ssize_t written = writev(fd, iov, 3);
```

| Approach                             | System Calls | Memory Copies  | Performance                                  |
| ------------------------------------ | ------------ | -------------- | -------------------------------------------- |
| Three separate `write()` calls       | 3            | 3              | Slow — 3 context switches                    |
| Copy into one buffer, then `write()` | 1            | 1 extra copy   | Medium                                       |
| `writev()` with 3 iovecs             | 1            | 0 extra copies | **Fast** — single syscall, zero extra copies |

---

## SPOOLING

**SPOOL** stands for **S**imultaneous **P**eripheral **O**perations **O**n-**L**ine. Spooling decouples fast processes from slow, dedicated devices by using disk as an intermediate buffer.

```text
┌──────────┐    ┌──────────────────────────────────┐    ┌─────────┐
│Process A │───▶│                                  │    │         │
│ print()  │    │   Spool Directory (on disk)       │    │         │
├──────────┤    │   ┌──────┐┌──────┐┌──────┐       │    │ PRINTER │
│Process B │───▶│   │Job 1 ││Job 2 ││Job 3 │       │───▶│         │
│ print()  │    │   └──────┘└──────┘└──────┘       │    │ (slow)  │
├──────────┤    │         Queue (FIFO)              │    │         │
│Process C │───▶│   ┌──────┐                       │    │         │
│ print()  │    │   │Job 4 │  ← newest             │    └─────────┘
│          │    │   └──────┘                       │
└──────────┘    │                  Spool Daemon ───▶│
                │                  (lpd/cups)       │
                └──────────────────────────────────┘
```

| Without Spooling                             | With Spooling                                      |
| -------------------------------------------- | -------------------------------------------------- |
| Process must wait for printer to finish      | Process returns immediately after writing to spool |
| Only one process can "use" printer at a time | Multiple processes can submit jobs concurrently    |
| CPU is wasted waiting for slow device        | CPU is free to do useful work                      |
| No job ordering or priority                  | Can prioritize, reorder, or cancel jobs            |

---

## Kernel I/O Subsystem Responsibilities

The kernel's I/O subsystem sits between the high-level system call interface and the device drivers, managing several critical functions:

| Responsibility         | Description                             | Example                                  |
| ---------------------- | --------------------------------------- | ---------------------------------------- |
| **I/O Scheduling**     | Reorder requests for efficiency         | Disk elevator algorithm                  |
| **Buffering**          | Handle speed/size mismatch              | Double buffering for streaming           |
| **Caching**            | Keep hot data in fast memory            | Page cache for disk blocks               |
| **Spooling**           | Queue jobs for dedicated devices        | Print spooler                            |
| **Device Reservation** | Exclusive access to dedicated devices   | `mount` for disk, `open` for serial port |
| **Error Handling**     | Detect, report, and recover from errors | Retry transient disk errors              |

### Error Handling Strategies

| Error Type      | Description                          | Recovery Strategy                   |
| --------------- | ------------------------------------ | ----------------------------------- |
| **Transient**   | Temporary — device was busy, timeout | Retry with exponential backoff      |
| **Recoverable** | Data corruption detected             | Use ECC to correct, re-read sector  |
| **Permanent**   | Hardware failure, bad sector         | Remap sector, report to application |
| **Protocol**    | Invalid command, device confusion    | Reset controller, retry sequence    |

```text
Error Handling Flow:

I/O request fails
       │
       ▼
┌─────────────────┐     Yes     ┌────────────────┐
│ Transient error?├────────────▶│ Retry (N times)│
└────────┬────────┘             └───────┬────────┘
         │ No                           │ Still failing
         ▼                              │
┌─────────────────┐                     ▼
│ Recoverable?    │     Yes     ┌────────────────┐
│ (ECC, remap)    ├────────────▶│ Correct & retry│
└────────┬────────┘             └────────────────┘
         │ No
         ▼
┌─────────────────┐
│ Report error    │
│ to application  │
│ (errno = EIO)   │
└─────────────────┘
```

---

## I/O Request Lifecycle

Let's trace a complete `read()` call from application to data delivery:

```text
Step 1: Application calls read(fd, buf, 4096)
         │
         ▼
Step 2: C library wrapper traps to kernel (syscall)
         │
         ▼
Step 3: Kernel VFS layer:
         - Validate fd
         - Map fd → inode → file system
         - Check permissions
         │
         ▼
Step 4: Check page cache:
         - Data in cache? → copy to user buf → RETURN ✓
         - Data NOT in cache? → continue ↓
         │
         ▼
Step 5: File system layer:
         - Map file offset → disk block number
         - Allocate page frame for cache
         │
         ▼
Step 6: Block I/O layer:
         - Create I/O request (struct bio)
         - Add to I/O scheduler queue
         - I/O scheduler reorders for efficiency
         │
         ▼
Step 7: Device driver:
         - Dequeue request
         - Program DMA controller
         - Issue command to disk controller
         │
         ▼
Step 8: Hardware:
         - Disk seeks, rotates, reads sector
         - DMA transfers data to page frame in RAM
         │
         ▼
Step 9: Interrupt:
         - Device signals completion
         - ISR runs → wakes driver
         - Driver marks I/O complete
         │
         ▼
Step 10: Kernel:
          - Data now in page cache
          - Copy from page cache → user buffer
          - Wake up sleeping process
          │
          ▼
Step 11: Application:
          - read() returns with data in buf
          - Process continues execution
```

> [!IMPORTANT]
> This path involves **two data copies** (device → page cache → user buffer). Zero-copy techniques eliminate some of these copies.

---

## Zero-Copy I/O

Traditional file-to-network transfers require **four copies** and **four context switches**:

```text
Traditional send(file → socket):

 User Space          Kernel Space           Hardware
 ┌────────┐         ┌──────────────┐       ┌──────────┐
 │        │  read() │              │  DMA  │          │
 │App buf │◀────────│ Page Cache   │◀──────│   Disk   │
 │        │ copy 2  │   copy 1     │       │          │
 └───┬────┘         └──────────────┘       └──────────┘
     │
     │ write()
     ▼               ┌──────────────┐       ┌──────────┐
 ┌────────┐          │              │  DMA  │          │
 │        │─────────▶│ Socket buf   │──────▶│   NIC    │
 │App buf │  copy 3  │   copy 4     │       │          │
 │        │          │              │       │          │
 └────────┘          └──────────────┘       └──────────┘

Copies: 4 (disk→cache, cache→app, app→socket, socket→NIC)
Context switches: 4 (read in, read out, write in, write out)
```

### Zero-Copy with `sendfile()`

```text
Zero-copy sendfile(file_fd → socket_fd):

 User Space          Kernel Space           Hardware
                    ┌──────────────┐       ┌──────────┐
                    │              │  DMA  │          │
                    │ Page Cache   │◀──────│   Disk   │
                    │              │       │          │
                    └──────┬───────┘       └──────────┘
                           │
                           │ (data stays in kernel!)
                           ▼
                    ┌──────────────┐       ┌──────────┐
                    │              │  DMA  │          │
                    │ Socket buf   │──────▶│   NIC    │
                    │  (or direct) │       │          │
                    └──────────────┘       └──────────┘

Copies: 2 (disk→cache, cache→NIC via DMA)
Context switches: 2 (sendfile in, sendfile out)
```

```c
#include <sys/sendfile.h>

// Traditional: read into user buffer, then write to socket
char buf[4096];
read(file_fd, buf, 4096);    // 2 copies, 2 ctx switches
write(sock_fd, buf, 4096);   // 2 copies, 2 ctx switches

// Zero-copy: kernel transfers directly
sendfile(sock_fd, file_fd, &offset, 4096);
// Only 2 copies, 2 context switches!
```

### Zero-Copy Techniques Comparison

| Technique        | System Call          | Copies | Context Switches | Availability   |
| ---------------- | -------------------- | ------ | ---------------- | -------------- |
| **Traditional**  | `read()` + `write()` | 4      | 4                | Everywhere     |
| **sendfile()**   | `sendfile()`         | 2-3    | 2                | Linux, FreeBSD |
| **splice()**     | `splice()`           | 0-2    | 2                | Linux 2.6.17+  |
| **mmap + write** | `mmap()` + `write()` | 3      | 4                | POSIX          |
| **io_uring**     | `io_uring_submit()`  | 2      | 0 (batched)      | Linux 5.1+     |

---

## Performance Optimization Strategies

I/O is typically the **largest bottleneck** in modern systems:

| Strategy                     | Technique                                                   | Benefit                            |
| ---------------------------- | ----------------------------------------------------------- | ---------------------------------- |
| **Reduce context switches**  | Use multiplexing (`epoll`) instead of thread-per-connection | Fewer kernel transitions           |
| **Reduce data copies**       | Zero-copy (`sendfile`, `splice`)                            | Less CPU and memory bandwidth used |
| **Use DMA**                  | Offload data movement to DMA controllers                    | Free CPU for computation           |
| **Balance CPU/disk/network** | Profile and identify bottleneck                             | Targeted optimization              |
| **Batch operations**         | `io_uring` submission queue                                 | Amortize syscall overhead          |
| **Prefetching**              | `readahead()`, `posix_fadvise()`                            | Overlap I/O with computation       |
| **Caching**                  | Page cache, buffer cache                                    | Avoid repeated device access       |

```python
# Demonstrating I/O performance difference
import time

def traditional_copy(src_path, dst_path):
    """Traditional read-write copy."""
    with open(src_path, 'rb') as src, open(dst_path, 'wb') as dst:
        while True:
            chunk = src.read(4096)  # Read into user buffer
            if not chunk:
                break
            dst.write(chunk)        # Write from user buffer

def efficient_copy(src_path, dst_path):
    """More efficient copy with larger buffers."""
    BUFSIZE = 1024 * 1024  # 1 MB buffer
    with open(src_path, 'rb') as src, open(dst_path, 'wb') as dst:
        while True:
            chunk = src.read(BUFSIZE)
            if not chunk:
                break
            dst.write(chunk)

# Larger buffers reduce the number of system calls
# For a 1 GB file:
#   4 KB buffer: ~262,144 read() + write() calls
#   1 MB buffer: ~1,024 read() + write() calls
```

---

## Try It Yourself

**Exercise 1:** A web server handles 10,000 concurrent connections. Compare the resource requirements using: (a) one thread per connection with blocking I/O, (b) a single thread with `epoll`.

:::details Solution
**(a) Thread-per-connection with blocking I/O:**

- 10,000 threads needed
- Each thread has its own stack (default 8 MB on Linux): $10{,}000 \times 8\text{ MB} = 80\text{ GB}$ of virtual address space for stacks alone
- Context switching overhead: switching between 10,000 threads creates massive scheduler overhead
- Most threads are sleeping (waiting for I/O), wasting resources

**(b) Single thread with `epoll`:**

- 1 thread (or a small thread pool, e.g., number-of-CPUs threads)
- Stack memory: 1 thread × 8 MB = 8 MB
- `epoll_wait()` returns only the FDs that are ready — no scanning
- Per-FD overhead: ~160 bytes in the kernel epoll data structure
- Total: $10{,}000 \times 160\text{ B} \approx 1.6\text{ MB}$

The `epoll` approach uses **~50,000× less memory** and eliminates context-switching overhead. This is why Nginx (event-driven) can handle 10,000+ connections on a single core while Apache (thread-per-connection) struggles past a few hundred.
:::

**Exercise 2:** A file server sends files to network clients. The average file is 1 MB. Using traditional I/O, each file transfer requires 4 copies. With `sendfile()`, it requires 2 copies. If the memory bus runs at 25 GB/s and each copy takes full bandwidth, how much time is saved per file with zero-copy?

:::details Solution
Time per copy of 1 MB: $\frac{1 \times 10^6}{25 \times 10^9} = 40\text{ µs}$

Traditional (4 copies): $4 \times 40\text{ µs} = 160\text{ µs}$ of memory bus time

Zero-copy (2 copies): $2 \times 40\text{ µs} = 80\text{ µs}$ of memory bus time

Savings per file: $160 - 80 = 80\text{ µs}$

At 10,000 files/second: $80\text{ µs} \times 10{,}000 = 0.8$ seconds of memory bus time saved per second. This also frees CPU cache lines and TLB entries that would have been polluted by the extra copies.
:::

---

## Key Takeaways

- **Blocking I/O** is simple but suspends the process; **non-blocking I/O** returns immediately but requires polling; **asynchronous I/O** provides the best of both worlds with event notification
- **I/O multiplexing** (`select`, `poll`, `epoll`) lets a single thread efficiently monitor thousands of file descriptors — `epoll` scales to millions of connections with O(1) event retrieval
- **Vectored I/O** (`readv`/`writev`) eliminates extra copies and system calls when data spans multiple buffers
- **SPOOLING** decouples fast processes from slow dedicated devices by using disk as an intermediate queue
- The kernel I/O subsystem handles scheduling, buffering, caching, spooling, and error recovery — transparent to applications
- A `read()` call traverses **11 steps** from application through VFS, file system, block layer, driver, hardware, and back
- **Zero-copy I/O** (`sendfile`, `splice`, `io_uring`) reduces data copies from 4 to 2 and context switches from 4 to 2, dramatically improving file serving performance
- I/O is the dominant bottleneck in most systems — optimization focuses on reducing copies, context switches, and syscall overhead
