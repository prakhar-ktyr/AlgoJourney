---
title: Inter-Process Communication
---

# Inter-Process Communication

Processes in an operating system don't exist in isolation — they often need to **communicate** and **coordinate** with each other. A web server process might pass a request to a worker process. A shell pipes the output of one command into the input of another. A producer process generates data that a consumer process uses. All of these require **Inter-Process Communication (IPC)**.

IPC is the set of mechanisms that the operating system provides for processes to exchange data, synchronize actions, and coordinate their execution.

---

## Why Is IPC Needed?

Processes are isolated by design — each has its own private address space. This isolation provides **protection** (one process can't corrupt another's memory) but creates a challenge: how do processes share information?

| Motivation               | Description                                                | Example                                             |
| ------------------------ | ---------------------------------------------------------- | --------------------------------------------------- |
| **Data sharing**         | Multiple processes need access to the same data            | Database server with multiple client handlers       |
| **Computation speedup**  | Divide a task among multiple processes running in parallel | MapReduce, parallel compilation                     |
| **Modularity**           | System design with separate components communicating       | Microservices architecture                          |
| **Convenience**          | User working on multiple tasks simultaneously              | Copy-paste between applications                     |
| **Privilege separation** | Isolate privileged operations from unprivileged code       | Chrome's sandbox model (renderer ↔ browser process) |

> [!NOTE]
> Threads within the same process share memory automatically. IPC is specifically for communication **between different processes**, each with its own address space.

---

## IPC Models Overview

There are two fundamental models of IPC:

```text
        Shared Memory Model                    Message Passing Model
    ┌────────────────────────┐            ┌────────────────────────┐
    │                        │            │                        │
    │  ┌──────┐  ┌──────┐   │            │  ┌──────┐  ┌──────┐   │
    │  │Proc A│  │Proc B│   │            │  │Proc A│  │Proc B│   │
    │  └──┬───┘  └──┬───┘   │            │  └──┬───┘  └──┬───┘   │
    │     │         │       │            │     │         │       │
    │     ▼         ▼       │            │     │  send() │       │
    │  ┌──────────────┐     │            │     │────────►│       │
    │  │   Shared     │     │            │     │         │       │
    │  │   Memory     │     │            │     │ recv()  │       │
    │  │   Region     │     │            │     │◄────────│       │
    │  └──────────────┘     │            │     │         │       │
    │                        │            │     │ Kernel  │       │
    │  Processes read/write  │            │     │ manages │       │
    │  to shared region      │            │     │messages │       │
    │  directly              │            │                        │
    └────────────────────────┘            └────────────────────────┘
```

| Feature             | Shared Memory                                 | Message Passing                     |
| ------------------- | --------------------------------------------- | ----------------------------------- |
| **Communication**   | Read/write to shared region                   | Send/receive messages               |
| **Speed**           | Fast (no kernel involvement after setup)      | Slower (kernel copies data)         |
| **Synchronization** | Must be done by programmer (mutex, semaphore) | Built into send/receive             |
| **Ease of use**     | More complex (race conditions)                | Simpler (no shared state)           |
| **Address spaces**  | Overlapping region                            | Completely separate                 |
| **Best for**        | Large data, frequent access                   | Small messages, distributed systems |
| **Examples**        | POSIX shared memory, mmap                     | Pipes, message queues, sockets      |

---

## Shared Memory

### The Producer-Consumer Problem

The classic motivation for shared memory IPC is the **producer-consumer problem**: one process produces data items and places them in a shared buffer; another process consumes items from the buffer.

> The **bounded buffer** variant uses a fixed-size buffer. The producer must wait when the buffer is full; the consumer must wait when it is empty.

```text
Bounded Buffer (size = 5):

  Producer                                    Consumer
  ┌──────┐     ┌───┬───┬───┬───┬───┐        ┌──────┐
  │      │────►│ A │ B │ C │   │   │────────►│      │
  │ Proc │     └───┴───┴───┴───┴───┘        │ Proc │
  │  P   │      ↑ in              ↑ out      │  C   │
  └──────┘      (write position)  (read pos) └──────┘

  in  = next free position (producer writes here)
  out = next full position (consumer reads here)

  Buffer full when:  (in + 1) % SIZE == out
  Buffer empty when: in == out
```

### C Code: POSIX Shared Memory

```c
// producer.c — Creates shared memory and writes data
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <unistd.h>

#define SHM_NAME "/my_shared_mem"
#define SHM_SIZE 4096

int main() {
    int shm_fd = shm_open(SHM_NAME, O_CREAT | O_RDWR, 0666);
    ftruncate(shm_fd, SHM_SIZE);

    void *ptr = mmap(NULL, SHM_SIZE, PROT_READ | PROT_WRITE,
                     MAP_SHARED, shm_fd, 0);

    const char *message = "Hello from the producer!";
    memcpy(ptr, message, strlen(message) + 1);
    printf("Producer wrote: %s\n", message);

    getchar();  // Keep alive for consumer
    munmap(ptr, SHM_SIZE);
    shm_unlink(SHM_NAME);
    return 0;
}
```

The consumer opens the same shared memory region with `shm_open(SHM_NAME, O_RDONLY, 0666)`, maps it read-only, and reads the data directly.

### POSIX Shared Memory API Summary

| Function       | Purpose                                      | Header         |
| -------------- | -------------------------------------------- | -------------- |
| `shm_open()`   | Create or open a shared memory object        | `<sys/mman.h>` |
| `ftruncate()`  | Set the size of the shared memory            | `<unistd.h>`   |
| `mmap()`       | Map shared memory into process address space | `<sys/mman.h>` |
| `munmap()`     | Unmap shared memory from address space       | `<sys/mman.h>` |
| `shm_unlink()` | Remove the shared memory object              | `<sys/mman.h>` |

> [!WARNING]
> Shared memory requires **explicit synchronization** (mutexes, semaphores) to prevent race conditions. Without it, the producer and consumer may read/write simultaneously, causing data corruption.

---

## Message Passing

### Primitives

Message passing uses two fundamental operations:

| Operation   | Syntax                       | Description                           |
| ----------- | ---------------------------- | ------------------------------------- |
| **Send**    | `send(destination, message)` | Transmit a message to another process |
| **Receive** | `receive(source, message)`   | Wait for and accept a message         |

### Direct vs Indirect Communication

| Feature                | Direct Communication               | Indirect Communication                     |
| ---------------------- | ---------------------------------- | ------------------------------------------ |
| **Addressing**         | Name the process explicitly        | Use a mailbox (port)                       |
| **Send**               | `send(P, msg)` — send to process P | `send(A, msg)` — send to mailbox A         |
| **Receive**            | `receive(Q, msg)` — receive from Q | `receive(A, msg)` — receive from mailbox A |
| **Link**               | Automatic between pair             | Must share a mailbox                       |
| **Processes per link** | Exactly 2                          | Many-to-many possible                      |
| **Flexibility**        | Low (hardcoded partners)           | High (any process can use mailbox)         |
| **Example**            | Unix signals                       | POSIX message queues                       |

```text
Direct Communication:
  P₁ ──── send(P₂, msg) ────► P₂
  P₁ ◄── receive(P₁, msg) ─── P₂
  (Each process must name the other)

Indirect Communication (Mailbox):
  P₁ ── send(M, msg) ──► ┌─────┐ ◄── send(M, msg) ── P₃
                          │  M  │
  P₂ ◄─ receive(M, msg) ─┤ail  ├── receive(M, msg) ─► P₄
                          │box  │
                          └─────┘
  (Any process with access to mailbox M can send/receive)
```

### Synchronous vs Asynchronous

| Property        | Synchronous (Blocking)                     | Asynchronous (Non-blocking)           |
| --------------- | ------------------------------------------ | ------------------------------------- |
| **Send**        | Sender blocks until receiver gets message  | Sender continues immediately          |
| **Receive**     | Receiver blocks until message is available | Receiver gets message or null         |
| **Also called** | Rendezvous (both block)                    | Buffered communication                |
| **Complexity**  | Simpler (implicit sync)                    | More complex (need polling/callbacks) |
| **Use case**    | Request-response patterns                  | Event-driven, high-throughput         |

### Buffering

Messages are stored in a **queue** (buffer) attached to the communication link:

| Capacity               | Behavior                                            | Description                                |
| ---------------------- | --------------------------------------------------- | ------------------------------------------ |
| **Zero capacity**      | No buffering; sender blocks until receiver is ready | Rendezvous — both must be synchronized     |
| **Bounded capacity**   | Buffer of size $n$; sender blocks when full         | Most common practical approach             |
| **Unbounded capacity** | Infinite buffer; sender never blocks                | Theoretical — memory is finite in practice |

---

## Pipes

Pipes are the simplest and most commonly used IPC mechanism in UNIX. They provide a **unidirectional byte stream** between processes.

### Ordinary (Unnamed) Pipes

> An **ordinary pipe** is a unidirectional communication channel between a parent and child process. Data flows in one direction: the write end → the read end.

```text
Ordinary Pipe:

  Parent Process              Child Process
  ┌──────────────┐            ┌──────────────┐
  │              │            │              │
  │  write(fd[1])│───────────►│  read(fd[0]) │
  │              │   pipe     │              │
  │              │  (kernel   │              │
  │              │   buffer)  │              │
  └──────────────┘            └──────────────┘

  fd[0] = read end
  fd[1] = write end

  The pipe exists only while both processes are alive.
```

### C Code: Ordinary Pipe

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    int pipefd[2];    // pipefd[0] = read end, pipefd[1] = write end
    pid_t pid;
    char write_msg[] = "Hello from parent via pipe!";
    char read_buf[100];

    // Create the pipe
    if (pipe(pipefd) == -1) {
        perror("pipe");
        exit(1);
    }

    pid = fork();

    if (pid < 0) {
        perror("fork");
        exit(1);
    }
    else if (pid == 0) {
        // ---- Child process: reads from pipe ----
        close(pipefd[1]);  // Close unused write end

        int n = read(pipefd[0], read_buf, sizeof(read_buf));
        read_buf[n] = '\0';
        printf("Child received: %s\n", read_buf);

        close(pipefd[0]);
        exit(0);
    }
    else {
        // ---- Parent process: writes to pipe ----
        close(pipefd[0]);  // Close unused read end

        write(pipefd[1], write_msg, strlen(write_msg));
        printf("Parent sent: %s\n", write_msg);

        close(pipefd[1]);
        wait(NULL);  // Wait for child
    }

    return 0;
}
```

**Output:**

```text
Parent sent: Hello from parent via pipe!
Child received: Hello from parent via pipe!
```

### Shell Pipes

The shell `|` operator creates ordinary pipes between commands:

```bash
# This creates two processes connected by a pipe:
ls -la | grep ".txt"

# Equivalent to:
#   Process 1 (ls):   stdout → pipe write end
#   Process 2 (grep): stdin  ← pipe read end
```

```text
Shell Pipeline: ls -la | grep ".txt" | wc -l

  ┌─────────┐   pipe1   ┌──────────┐   pipe2   ┌─────────┐
  │  ls -la │──────────►│grep ".txt"│──────────►│  wc -l  │
  │ stdout  │           │stdin  out │           │  stdin  │
  └─────────┘           └──────────┘           └─────────┘
```

### Named Pipes (FIFOs)

> A **named pipe** (FIFO) is a pipe with a name in the filesystem. Unlike ordinary pipes, FIFOs can be used between **unrelated processes** (not just parent-child).

| Feature          | Ordinary Pipe                       | Named Pipe (FIFO)                     |
| ---------------- | ----------------------------------- | ------------------------------------- |
| **Persistence**  | Exists only during process lifetime | Exists as a file in the filesystem    |
| **Relationship** | Parent-child only                   | Any processes                         |
| **Direction**    | Unidirectional                      | Can be bidirectional (with two FIFOs) |
| **Creation**     | `pipe()` system call                | `mkfifo()` or `mkfifo` command        |
| **Naming**       | No name (anonymous)                 | Has a filesystem path                 |

```bash
# Create and use a named pipe
mkfifo /tmp/my_fifo

# Terminal 1 (writer):
echo "Hello through FIFO!" > /tmp/my_fifo

# Terminal 2 (reader):
cat /tmp/my_fifo
# Output: Hello through FIFO!

rm /tmp/my_fifo  # Cleanup
```

In C, use `mkfifo(path, 0666)` to create a FIFO, then `open()`, `read()`/`write()`, and `close()` — exactly like a regular file.

---

## Signals

Signals are a form of **asynchronous notification** sent to a process to notify it of events. They are the simplest form of IPC, but carry no data — only a signal number.

> A **signal** is a software interrupt delivered to a process. It can be sent by the kernel, another process, or the process itself.

### Common Signal Types

| Signal    | Number | Default Action | Description                         |
| --------- | ------ | -------------- | ----------------------------------- |
| `SIGHUP`  | 1      | Terminate      | Hangup (terminal disconnected)      |
| `SIGINT`  | 2      | Terminate      | Interrupt (Ctrl+C)                  |
| `SIGQUIT` | 3      | Core dump      | Quit (Ctrl+\\)                      |
| `SIGKILL` | 9      | Terminate      | Kill (cannot be caught or ignored)  |
| `SIGSEGV` | 11     | Core dump      | Segmentation fault                  |
| `SIGPIPE` | 13     | Terminate      | Broken pipe                         |
| `SIGALRM` | 14     | Terminate      | Alarm clock timer                   |
| `SIGTERM` | 15     | Terminate      | Termination request (polite kill)   |
| `SIGCHLD` | 17     | Ignore         | Child process stopped or terminated |
| `SIGSTOP` | 19     | Stop           | Stop process (cannot be caught)     |
| `SIGTSTP` | 20     | Stop           | Terminal stop (Ctrl+Z)              |
| `SIGCONT` | 18     | Continue       | Continue if stopped                 |
| `SIGUSR1` | 10     | Terminate      | User-defined signal 1               |
| `SIGUSR2` | 12     | Terminate      | User-defined signal 2               |

### Signal Handling in C

```c
#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <unistd.h>

// Custom signal handler
void handle_sigint(int sig) {
    printf("\nCaught signal %d (SIGINT). Cleaning up...\n", sig);
    // Perform cleanup: close files, free memory, etc.
    exit(0);
}

void handle_sigusr1(int sig) {
    printf("Received SIGUSR1! Custom action triggered.\n");
}

int main() {
    // Register signal handlers
    signal(SIGINT, handle_sigint);    // Handle Ctrl+C
    signal(SIGUSR1, handle_sigusr1);  // Handle user signal

    printf("Process PID: %d\n", getpid());
    printf("Send me signals! (SIGINT with Ctrl+C, SIGUSR1 with kill -USR1 %d)\n",
           getpid());

    // Process main loop
    while (1) {
        printf("Working...\n");
        sleep(2);
    }

    return 0;
}
```

```bash
# In another terminal, send signals:
kill -USR1 <pid>    # Sends SIGUSR1
kill -TERM <pid>    # Sends SIGTERM (polite termination)
kill -9 <pid>       # Sends SIGKILL (forced, cannot be caught!)
```

### Signal Handling Options

| Option      | How                                                      | When to Use                       |
| ----------- | -------------------------------------------------------- | --------------------------------- |
| **Default** | Don't register handler                                   | Accept default behavior           |
| **Catch**   | Register custom handler with `signal()` or `sigaction()` | Custom cleanup, graceful shutdown |
| **Ignore**  | `signal(SIGINT, SIG_IGN)`                                | Explicitly ignore a signal        |
| **Block**   | Use `sigprocmask()`                                      | Defer handling to a safe time     |

> [!WARNING]
> `SIGKILL` (9) and `SIGSTOP` (19) **cannot** be caught, ignored, or blocked. They are the OS's last resort for controlling processes. Always try `SIGTERM` first, which allows the process to clean up.

---

## Sockets

**Sockets** are the most versatile IPC mechanism. Unlike pipes and shared memory, sockets work across **network boundaries** — enabling communication between processes on different machines.

```text
Socket Communication:

  Machine A                              Machine B
  ┌────────────────┐                     ┌────────────────┐
  │   Process A    │                     │   Process B    │
  │                │                     │                │
  │ socket()       │                     │ socket()       │
  │ bind()         │                     │                │
  │ listen()       │                     │                │
  │ accept() ◄─────│─── TCP connection ──│──── connect()  │
  │                │                     │                │
  │ recv() ◄───────│─── data ───────────│──── send()     │
  │ send() ────────│─── data ───────────│────► recv()    │
  │                │                     │                │
  │ close()        │                     │ close()        │
  └────────────────┘                     └────────────────┘
```

### Socket Types

| Type                      | Protocol | Connection          | Reliability           | Use Case                    |
| ------------------------- | -------- | ------------------- | --------------------- | --------------------------- |
| **Stream (SOCK_STREAM)**  | TCP      | Connection-oriented | Reliable, ordered     | Web servers, databases      |
| **Datagram (SOCK_DGRAM)** | UDP      | Connectionless      | Unreliable, unordered | DNS, video streaming        |
| **Unix Domain (AF_UNIX)** | Local    | Either              | Reliable              | Local IPC (faster than TCP) |

### Python Socket Example

```python
import socket

# Server: listen, accept, echo
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(('localhost', 9999))
server.listen(1)
conn, addr = server.accept()
data = conn.recv(1024)
conn.sendall(f"Echo: {data.decode().upper()}".encode())
conn.close(); server.close()

# Client: connect, send, receive
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(('localhost', 9999))
client.sendall(b"hello")
print(client.recv(1024).decode())  # Echo: HELLO
client.close()
```

> [!TIP]
> For local IPC between processes on the **same machine**, Unix domain sockets (`AF_UNIX`) are faster than TCP sockets because they bypass the full network stack.

---

## IPC Mechanisms Comparison

| Mechanism              | Direction        | Relationship    | Speed   | Data Size          | Across Network | Complexity         |
| ---------------------- | ---------------- | --------------- | ------- | ------------------ | -------------- | ------------------ |
| **Shared Memory**      | Bidirectional    | Any (with name) | Fastest | Large              | No             | High (sync needed) |
| **Ordinary Pipe**      | Unidirectional   | Parent-child    | Fast    | Stream             | No             | Low                |
| **Named Pipe (FIFO)**  | Unidirectional\* | Any             | Fast    | Stream             | No             | Low                |
| **Message Queue**      | Bidirectional    | Any             | Medium  | Messages           | No             | Medium             |
| **Signals**            | Unidirectional   | Any (with PID)  | Fast    | None (number only) | No             | Low                |
| **Socket (TCP/UDP)**   | Bidirectional    | Any             | Medium  | Stream/Datagram    | Yes            | Medium-High        |
| **Unix Domain Socket** | Bidirectional    | Same machine    | Fast    | Stream/Datagram    | No             | Medium             |

\*Named pipes can be bidirectional with two FIFOs.

### When to Use What

| Scenario                               | Best IPC Mechanism            | Why                               |
| -------------------------------------- | ----------------------------- | --------------------------------- |
| Large shared dataset between processes | **Shared Memory**             | Zero-copy, fastest for large data |
| Shell command pipeline                 | **Ordinary Pipe**             | Built into the shell, simple      |
| Logging from many processes            | **Named Pipe (FIFO)**         | Multiple writers, one reader      |
| Event notification                     | **Signals**                   | Lightweight, asynchronous         |
| Client-server on same machine          | **Unix Domain Socket**        | Bidirectional, reliable, fast     |
| Client-server across network           | **TCP Socket**                | Works across machines             |
| Decoupled producer-consumer            | **Message Queue**             | Buffered, persistent              |
| Real-time data sharing                 | **Shared Memory + Semaphore** | Lowest latency                    |

---

## Summary: IPC in Different Operating Systems

| IPC Mechanism         | Linux                    | macOS              | Windows                   |
| --------------------- | ------------------------ | ------------------ | ------------------------- |
| **Pipes**             | ✓                        | ✓                  | ✓ (anonymous pipes)       |
| **Named Pipes**       | ✓ (FIFO)                 | ✓ (FIFO)           | ✓ (different API)         |
| **Shared Memory**     | ✓ (POSIX, System V)      | ✓ (POSIX)          | ✓ (File Mapping)          |
| **Message Queues**    | ✓ (POSIX, System V)      | ✓ (POSIX)          | ✓ (Mailslots)             |
| **Signals**           | ✓                        | ✓                  | Limited (events instead)  |
| **Sockets**           | ✓ (TCP, UDP, Unix)       | ✓ (TCP, UDP, Unix) | ✓ (TCP, UDP, named pipes) |
| **Unique mechanisms** | D-Bus, eventfd, io_uring | Mach ports, XPC    | COM, RPC, WM_COPYDATA     |

---

## Try It Yourself

**Exercise 1:** Write a C program where a parent sends an integer array to a child via a pipe, and the child returns the sum through a second pipe.

:::details Solution
Create two pipes (`pipe_to_child`, `pipe_to_parent`). Parent writes the array to `pipe_to_child[1]`, child reads from `pipe_to_child[0]`, computes `sum`, then writes `sum` to `pipe_to_parent[1]`. Parent reads the result from `pipe_to_parent[0]`. Remember to close unused ends in each process to avoid deadlocks. For an array `{10, 20, 30, 40, 50}`, the child would return `sum = 150`.
:::

**Exercise 2:** Explain why shared memory requires explicit synchronization but message passing does not.

:::details Solution
In shared memory, both processes can read/write the same location simultaneously, causing **race conditions** (e.g., both read `count=5`, one writes 6, the other writes 4 — final value is wrong). In message passing, the kernel manages the queue: `send()` atomically enqueues, `receive()` atomically dequeues. No shared state exists to corrupt. Shared memory solutions: mutexes, semaphores, or atomic operations.
:::

**Exercise 3:** Compare `ls | wc -l` vs `ls > file && wc -l < file`. What IPC mechanism does each use?

:::details Solution

- **Pipe version** (`|`): Uses an ordinary pipe. Both processes run concurrently, data flows through kernel memory. Fast, automatic cleanup.
- **File version**: Uses the filesystem as intermediary. Sequential execution (ls finishes first), data hits disk. Slower, file persists and needs cleanup.
  :::

---

## Key Takeaways

- **IPC** enables processes with separate address spaces to exchange data, synchronize, and coordinate — motivated by data sharing, speedup, modularity, and convenience.
- The two fundamental IPC models are **shared memory** (fast, but requires explicit synchronization) and **message passing** (simpler, kernel-managed, but slower due to data copying).
- **Shared memory** (`shm_open`, `mmap`) provides the fastest IPC by letting processes access the same physical memory region, but programmers must use mutexes/semaphores to prevent race conditions.
- **Pipes** are the simplest Unix IPC: ordinary pipes are anonymous and unidirectional between parent-child; **named pipes (FIFOs)** have filesystem names and work between unrelated processes.
- **Message passing** can be direct (name the process) or indirect (use a mailbox), and synchronous (blocking) or asynchronous (non-blocking), with zero, bounded, or unbounded buffering.
- **Signals** are asynchronous notifications carrying only a signal number — used for event notification, not data transfer. `SIGKILL` and `SIGSTOP` cannot be caught.
- **Sockets** are the most versatile IPC mechanism, supporting bidirectional communication across network boundaries (TCP/UDP) or locally (Unix domain sockets).
- Choose the right IPC mechanism based on your needs: shared memory for high-performance large data sharing, pipes for simple command chaining, sockets for network communication, and signals for lightweight notifications.
