---
title: System Calls
---

# System Calls

A **system call** is the mechanism by which a user-space program requests a service from the operating system kernel. Every time your program opens a file, creates a process, allocates memory, or sends data over the network, a system call is involved. Understanding system calls is understanding the **exact boundary** between your code and the OS.

In this lesson we explore how system calls work at the hardware level, categorize the major types, write real C and Python code that uses them, and learn how to trace them with `strace`.

---

## What Is a System Call?

> "System calls provide the interface between a process and the operating system."
> — Silberschatz, _Operating System Concepts_

Think of system calls as a **service counter at a government office**. You (user program) cannot walk behind the counter and access the files yourself. Instead, you fill out a form (set up registers), take a number (invoke a trap), and a clerk (the kernel) processes your request and hands back the result.

| Concept      | Analogy              | Technical Reality                             |
| ------------ | -------------------- | --------------------------------------------- |
| User program | Customer             | Process running in user mode (Ring 3)         |
| System call  | Service request form | Trap instruction + syscall number + arguments |
| Kernel       | Government clerk     | OS code running in kernel mode (Ring 0)       |
| Return value | Completed form       | Result in register (e.g., `rax` on x86-64)    |

### System Call vs Library Function

| Feature              | System Call                   | Library Function                   |
| -------------------- | ----------------------------- | ---------------------------------- |
| **Runs in**          | Kernel mode                   | User mode                          |
| **Overhead**         | High (mode switch)            | Low (normal function call)         |
| **Example**          | `write()`, `fork()`, `mmap()` | `printf()`, `strlen()`, `malloc()` |
| **Direct HW access** | Yes                           | No (may internally call a syscall) |
| **Error reporting**  | Sets `errno`                  | Varies                             |

> [!NOTE]
> `printf()` is a **library function** (in glibc) that internally calls the `write()` **system call**. `malloc()` may call `brk()` or `mmap()` system calls when it needs more memory from the OS.

---

## System Call Interface and API

Most programmers do not invoke system calls directly. Instead, they use a **system call interface** provided by the C library (e.g., glibc on Linux, CRT on Windows) or a higher-level language runtime.

### The API Layers

```text
System Call API Layers
========================

  +---------------------------------------------+
  |  Application Code                           |
  |  fp = fopen("data.txt", "r");               |
  +---------------------------------------------+
           |
           v
  +---------------------------------------------+
  |  C Library (glibc)                          |
  |  fopen() → open() wrapper                   |
  |  Sets up registers, executes SYSCALL instr   |
  +---------------------------------------------+
           |
           | SYSCALL instruction (trap)
           v
  +=============================================+
  |  Kernel System Call Dispatcher              |
  |  Looks up syscall number in sys_call_table  |
  |  Calls sys_open() kernel function           |
  +=============================================+
           |
           v
  +---------------------------------------------+
  |  Kernel Implementation (sys_open)           |
  |  VFS layer → file system → disk driver      |
  +---------------------------------------------+
           |
           | Return result
           v
  +---------------------------------------------+
  |  glibc wrapper                              |
  |  Check return value, set errno if error     |
  +---------------------------------------------+
           |
           v
  +---------------------------------------------+
  |  Application receives file descriptor       |
  +---------------------------------------------+
```

### Major System Call APIs

| API Standard       | Platform           | Description                                                 |
| ------------------ | ------------------ | ----------------------------------------------------------- |
| **POSIX**          | Linux, macOS, BSDs | Portable Operating System Interface — defines ~200 syscalls |
| **Win32 API**      | Windows            | Windows system call interface (via `ntdll.dll`)             |
| **Linux-specific** | Linux              | Syscalls unique to Linux (e.g., `epoll`, `io_uring`)        |

> [!TIP]
> POSIX compatibility means that C programs using standard system calls (`open`, `read`, `write`, `fork`, `exec`) can compile on Linux, macOS, and BSDs with minimal changes.

---

## How a System Call Works — Step by Step

Let us trace exactly what happens when a program calls `write(1, "Hello\n", 6)` on a Linux x86-64 system:

### Step-by-Step Walkthrough

| Step | Location         | Action                                                                     |
| ---- | ---------------- | -------------------------------------------------------------------------- |
| 1    | User code        | Program calls `write(1, "Hello\n", 6)`                                     |
| 2    | glibc wrapper    | Loads syscall number (1 for `write`) into `rax` register                   |
| 3    | glibc wrapper    | Loads arguments: `rdi=1` (fd), `rsi=buffer_addr`, `rdx=6` (count)          |
| 4    | glibc wrapper    | Executes `SYSCALL` instruction                                             |
| 5    | CPU hardware     | CPU switches to Ring 0 (kernel mode)                                       |
| 6    | CPU hardware     | Saves user stack pointer, loads kernel stack                               |
| 7    | Kernel entry     | `entry_SYSCALL_64` saves registers, checks syscall number                  |
| 8    | Kernel dispatch  | Looks up `sys_call_table[1]` → `sys_write()`                               |
| 9    | Kernel execution | `sys_write()` validates fd, copies data to kernel buffer, writes to device |
| 10   | Kernel return    | Places return value (bytes written) in `rax`                               |
| 11   | CPU hardware     | Executes `SYSRET` — switches back to Ring 3 (user mode)                    |
| 12   | glibc wrapper    | Checks `rax`: if negative, sets `errno = -rax`, returns -1                 |
| 13   | User code        | `write()` returns 6 (success)                                              |

### ASCII Diagram

```text
System Call Execution Flow
============================

  USER MODE (Ring 3)                KERNEL MODE (Ring 0)
  ==================                ==================

  1. write(1, buf, 6)
         |
  2. Load rax = 1 (syscall #)
  3. Load rdi=1, rsi=buf, rdx=6
         |
  4. SYSCALL instruction
         |
         +---- mode switch -----> 5. CPU enters Ring 0
                                  6. Save user context
                                  7. Validate syscall #
                                  8. Dispatch: sys_write()
                                  9. Execute: write to device
                                  10. Set rax = bytes written
                                      |
  12. Check rax        <---- mode switch ---- 11. SYSRET
  13. Return to caller
```

### x86-64 System Call Convention

| Register | Purpose                                            |
| -------- | -------------------------------------------------- |
| `rax`    | System call number (input) / Return value (output) |
| `rdi`    | 1st argument                                       |
| `rsi`    | 2nd argument                                       |
| `rdx`    | 3rd argument                                       |
| `r10`    | 4th argument                                       |
| `r8`     | 5th argument                                       |
| `r9`     | 6th argument                                       |

---

## Categories of System Calls

System calls are grouped into six major categories:

| Category                    | Purpose                                 | Example Calls                                        |
| --------------------------- | --------------------------------------- | ---------------------------------------------------- |
| **Process Control**         | Create, terminate, manage processes     | `fork()`, `exec()`, `wait()`, `exit()`, `kill()`     |
| **File Management**         | Open, read, write, close files          | `open()`, `read()`, `write()`, `close()`, `lseek()`  |
| **Device Management**       | Request, release, read/write devices    | `ioctl()`, `read()`, `write()`                       |
| **Information Maintenance** | Get/set system data                     | `getpid()`, `alarm()`, `time()`, `uname()`           |
| **Communication**           | IPC — message passing and shared memory | `pipe()`, `shmget()`, `mmap()`, `socket()`, `send()` |
| **Protection**              | Set permissions, manage access          | `chmod()`, `chown()`, `umask()`, `setuid()`          |

### Detailed System Call Table

| System Call | Category      | Description                             | Return Value                  |
| ----------- | ------------- | --------------------------------------- | ----------------------------- |
| `fork()`    | Process       | Create a child process (copy of parent) | Child PID (parent), 0 (child) |
| `exec()`    | Process       | Replace process image with new program  | Does not return on success    |
| `wait()`    | Process       | Wait for child process to terminate     | Child PID                     |
| `exit()`    | Process       | Terminate calling process               | Does not return               |
| `kill()`    | Process       | Send signal to a process                | 0 on success                  |
| `open()`    | File          | Open a file, return file descriptor     | File descriptor (≥ 0)         |
| `read()`    | File          | Read bytes from file descriptor         | Bytes read                    |
| `write()`   | File          | Write bytes to file descriptor          | Bytes written                 |
| `close()`   | File          | Close a file descriptor                 | 0 on success                  |
| `lseek()`   | File          | Move read/write position                | New offset                    |
| `pipe()`    | Communication | Create a unidirectional pipe            | 0 on success                  |
| `socket()`  | Communication | Create a network socket                 | Socket descriptor             |
| `mmap()`    | Memory/File   | Map file or memory into address space   | Pointer to mapped region      |
| `getpid()`  | Information   | Get current process ID                  | PID                           |
| `chmod()`   | Protection    | Change file permissions                 | 0 on success                  |

---

## C Code Examples

### Process Control: fork(), exec(), wait()

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    printf("Parent process PID: %d\n", getpid());

    pid_t pid = fork();  // Create a child process

    if (pid < 0) {
        // fork() failed
        perror("fork failed");
        exit(1);
    }
    else if (pid == 0) {
        // Child process
        printf("Child process PID: %d\n", getpid());

        // Replace child with "ls -la" program
        execlp("ls", "ls", "-la", NULL);

        // If exec returns, it failed
        perror("exec failed");
        exit(1);
    }
    else {
        // Parent process
        int status;
        pid_t child_pid = wait(&status);  // Wait for child

        if (WIFEXITED(status)) {
            printf("Child %d exited with status %d\n",
                   child_pid, WEXITSTATUS(status));
        }
    }

    return 0;
}
```

**Output:**

```text
Parent process PID: 12345
Child process PID: 12346
total 24
drwxr-xr-x  3 user user 4096 May 30 10:00 .
drwxr-xr-x 10 user user 4096 May 30 09:00 ..
-rwxr-xr-x  1 user user 8720 May 30 10:00 program
Child 12346 exited with status 0
```

### File Management: open(), read(), write(), close()

```c
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

int main() {
    // Open (create) a file for writing
    int fd = open("hello.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd < 0) {
        perror("open for write failed");
        return 1;
    }

    // Write to the file
    const char *msg = "Hello from system calls!\n";
    ssize_t bytes_written = write(fd, msg, strlen(msg));
    printf("Wrote %zd bytes\n", bytes_written);

    // Close the file
    close(fd);

    // Reopen for reading
    fd = open("hello.txt", O_RDONLY);
    if (fd < 0) {
        perror("open for read failed");
        return 1;
    }

    // Read from the file
    char buffer[256];
    ssize_t bytes_read = read(fd, buffer, sizeof(buffer) - 1);
    buffer[bytes_read] = '\0';  // Null-terminate
    printf("Read %zd bytes: %s", bytes_read, buffer);

    // Close the file
    close(fd);

    return 0;
}
```

---

## Python Equivalents

Python's `os` module provides direct wrappers around many POSIX system calls:

### Process Control

```python
import os
import sys

print(f"Parent PID: {os.getpid()}")

pid = os.fork()  # fork() system call

if pid == 0:
    # Child process
    print(f"Child PID: {os.getpid()}")
    # Replace with "ls -la"
    os.execlp("ls", "ls", "-la")
    # Never reaches here on success
else:
    # Parent process
    child_pid, status = os.wait()  # wait() system call
    exit_code = os.WEXITSTATUS(status)
    print(f"Child {child_pid} exited with status {exit_code}")
```

### File Operations

```python
import os

# open() system call — returns a file descriptor (integer)
fd = os.open("test.txt", os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)

# write() system call
message = b"Hello from Python system calls!\n"
bytes_written = os.write(fd, message)
print(f"Wrote {bytes_written} bytes")

# close() system call
os.close(fd)

# Re-open for reading
fd = os.open("test.txt", os.O_RDONLY)

# read() system call
data = os.read(fd, 256)
print(f"Read: {data.decode()}")

# close() system call
os.close(fd)
```

> [!TIP]
> Python's higher-level `open()` built-in (which returns a file object) is built on top of the `os.open()` system call wrapper. For learning OS concepts, use `os.open()`, `os.read()`, `os.write()` to see the raw syscall behavior.

---

## Tracing System Calls with strace

`strace` is a powerful Linux tool that intercepts and records every system call made by a program.

### Basic Usage

```bash
# Trace all system calls of a program
strace ./my_program

# Trace only specific categories
strace -e trace=file ./my_program     # File-related syscalls
strace -e trace=process ./my_program  # Process-related syscalls
strace -e trace=network ./my_program  # Network syscalls

# Count and summarize syscalls
strace -c ./my_program

# Trace with timestamps
strace -t ./my_program

# Trace a running process by PID
strace -p 12345
```

### Example: Tracing a Simple Program

Consider this tiny C program:

```c
// hello.c
#include <stdio.h>
int main() {
    printf("Hello, World!\n");
    return 0;
}
```

```bash
$ gcc -o hello hello.c
$ strace ./hello 2>&1 | head -20
```

**Simplified output:**

```text
execve("./hello", ["./hello"], [/* env */]) = 0
brk(NULL)                               = 0x55a4c3d01000
mmap(NULL, 8192, PROT_READ|PROT_WRITE, ...) = 0x7f9a...
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT
openat(AT_FDCWD, "/lib/x86_64-linux-gnu/libc.so.6", O_RDONLY) = 3
read(3, "\177ELF\002\001\001\003...", 832) = 832
close(3)                                = 0
mmap(...)                               = 0x7f9a...
...
write(1, "Hello, World!\n", 14)         = 14
exit_group(0)                           = ?
```

### Reading strace Output

| Component                         | Meaning                         |
| --------------------------------- | ------------------------------- |
| `write(1, "Hello, World!\n", 14)` | Syscall name and arguments      |
| `= 14`                            | Return value (14 bytes written) |
| `= -1 ENOENT`                     | Error: file not found           |
| `1` in `write(1, ...)`            | File descriptor 1 = stdout      |
| `3` in `openat(...) = 3`          | Returned file descriptor 3      |

### Counting System Calls

```bash
$ strace -c ./hello
Hello, World!
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- --------
 25.00    0.000025          25         1           write
 20.00    0.000020           5         4           mmap
 15.00    0.000015          15         1           openat
 10.00    0.000010           5         2           close
 10.00    0.000010          10         1         1 access
  5.00    0.000005           5         1           read
  5.00    0.000005           5         1           brk
  5.00    0.000005           5         1           execve
  5.00    0.000005           5         1           arch_prctl
------ ----------- ----------- --------- --------- --------
100.00    0.000100                    13         1 total
```

> Even a simple "Hello, World!" makes **13 system calls** — most are for loading shared libraries and setting up the process.

---

## System Call Overhead and Performance

System calls are expensive compared to normal function calls because of the mode switch overhead.

### Cost Breakdown

| Operation                               | Approximate Time (modern CPU) |
| --------------------------------------- | ----------------------------- |
| Regular function call                   | ~1–5 nanoseconds              |
| System call (fast path)                 | ~100–300 nanoseconds          |
| System call (slow path, e.g., disk I/O) | Microseconds to milliseconds  |

### Why System Calls Are Expensive

```text
Cost Components of a System Call
==================================

  1. Save user-mode registers        (~10 ns)
  2. Switch to kernel stack           (~5 ns)
  3. Validate syscall number          (~2 ns)
  4. Execute kernel function          (varies)
  5. Copy data user↔kernel (if any)   (varies)
  6. Restore user-mode registers      (~10 ns)
  7. Switch back to user stack        (~5 ns)

  + TLB flush (on some architectures)
  + Pipeline flush
  + Spectre/Meltdown mitigations      (~50-100 ns extra)

  Total overhead: ~100-300 ns minimum
```

### Performance Implications

| Strategy                | Description                                         | Example                                                  |
| ----------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| **Buffered I/O**        | Batch many small writes into one large write        | `printf()` buffers; `fflush()` triggers actual `write()` |
| **Memory-mapped files** | Map file into memory, avoid read/write syscalls     | `mmap()` — file access becomes memory access             |
| **io_uring**            | Batch many I/O requests, reduce syscall count       | Linux async I/O — submit queue of requests               |
| **vDSO**                | Some syscalls run in user space without mode switch | `gettimeofday()`, `clock_gettime()` via vDSO             |

$$\text{Total I/O time} = n \times t_{syscall} + \frac{data\_size}{bandwidth}$$

where $n$ is the number of system calls and $t_{syscall}$ is the per-call overhead. Reducing $n$ by buffering dramatically improves performance.

> [!WARNING]
> After the Spectre and Meltdown vulnerabilities were discovered (2018), system call overhead increased significantly on affected processors due to kernel page table isolation (KPTI) mitigations.

---

## Error Handling in System Calls

System calls report errors by returning **-1** and setting the global variable `errno`. Use `perror()` or `strerror(errno)` to convert the error code to a human-readable message.

| errno | Name     | Meaning                   |
| ----- | -------- | ------------------------- |
| 1     | `EPERM`  | Operation not permitted   |
| 2     | `ENOENT` | No such file or directory |
| 9     | `EBADF`  | Bad file descriptor       |
| 12    | `ENOMEM` | Out of memory             |
| 13    | `EACCES` | Permission denied         |
| 22    | `EINVAL` | Invalid argument          |
| 28    | `ENOSPC` | No space left on device   |

> [!TIP]
> You can find all system call numbers on your system with: `ausyscall --dump` or `cat /usr/include/asm/unistd_64.h`

---

## Try It Yourself

**Exercise 1:** Write a C program that creates a child process using `fork()`. The child should print its PID and the parent's PID, then exit. The parent should wait for the child and print the child's exit status.

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
        // Child
        printf("Child: My PID = %d, Parent PID = %d\n",
               getpid(), getppid());
        exit(42);  // Exit with status 42
    } else {
        // Parent
        int status;
        pid_t child = wait(&status);
        if (WIFEXITED(status)) {
            printf("Parent: Child %d exited with status %d\n",
                   child, WEXITSTATUS(status));
        }
    }
    return 0;
}
```

:::

**Exercise 2:** Use `strace` to trace the system calls made by `cat /etc/hostname`. Identify which system call opens the file, which reads it, and which writes the output to the terminal.

:::details Solution

```bash
strace cat /etc/hostname 2>&1
```

Key system calls in the output:

1. **Open the file:** `openat(AT_FDCWD, "/etc/hostname", O_RDONLY) = 3`
   - Opens `/etc/hostname` in read-only mode, returns file descriptor 3.

2. **Read the file:** `read(3, "my-computer\n", 131072) = 12`
   - Reads 12 bytes from file descriptor 3.

3. **Write to terminal:** `write(1, "my-computer\n", 12) = 12`
   - Writes 12 bytes to file descriptor 1 (stdout = terminal).

4. **Close the file:** `close(3) = 0`
   - Closes file descriptor 3.
     :::

**Exercise 3:** Explain why `printf("Hello")` in C does NOT always immediately result in a `write()` system call. What mechanism is involved, and how can you force the write to happen immediately?

:::details Solution
`printf()` uses **user-space buffering** provided by the C standard library (glibc). When you call `printf()`:

1. The text is written to an internal buffer in the `FILE` structure (typically 4096 or 8192 bytes for files, line-buffered for terminals).
2. The buffer is **flushed** (causing an actual `write()` system call) only when:
   - The buffer is full
   - A newline `\n` is encountered (for line-buffered streams like stdout connected to a terminal)
   - `fflush(stdout)` is called explicitly
   - The program exits normally

To force an immediate write:

```c
printf("Hello");
fflush(stdout);    // Forces write() syscall now
```

Or use the system call directly:

```c
write(STDOUT_FILENO, "Hello", 5);  // Always writes immediately
```

This buffering exists to **reduce the number of expensive system calls**. Instead of making one syscall per character, the library batches characters and makes one syscall per buffer-full.
:::

---

## Key Takeaways

- A **system call** is the interface between user-space programs and the kernel — the only way to request OS services.
- System calls involve a **mode switch** from user mode (Ring 3) to kernel mode (Ring 0) via a trap instruction.
- On x86-64 Linux, the `SYSCALL` instruction triggers the transition; the syscall number goes in `rax`, arguments in `rdi`, `rsi`, `rdx`, `r10`, `r8`, `r9`.
- System calls are grouped into six categories: **process control**, **file management**, **device management**, **information maintenance**, **communication**, and **protection**.
- The C library (glibc) wraps raw system calls in convenient functions like `open()`, `read()`, `write()`, `fork()`, and `exec()`.
- Python's `os` module provides direct access to many POSIX system calls.
- `strace` is an essential debugging tool that shows every system call a program makes — invaluable for understanding program behavior.
- System calls have significant **overhead** (~100–300 ns) compared to regular function calls (~1–5 ns), which is why buffering and batching are important optimization strategies.
- Error handling follows a consistent pattern: return -1 on failure and set `errno` to indicate the specific error.
