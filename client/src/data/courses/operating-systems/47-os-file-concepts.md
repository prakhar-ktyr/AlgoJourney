---
title: File Concepts & Operations
---

# File Concepts & Operations

A computer's main memory is volatile — its contents vanish the moment power is cut. To store information permanently, the operating system must write it to **secondary storage** such as hard disks or SSDs. The fundamental abstraction that makes this manageable is the **file**: a named collection of related information recorded on secondary storage. In this lesson, we explore what files are, how the OS represents them, and the operations we can perform on them.

---

## What Is a File?

> A **file** is the smallest allotment of logical secondary storage visible to the user. It maps abstract data onto physical devices so that users and applications never need to worry about disk geometry, sectors, or blocks.

Think of a file like a labelled box in a warehouse. The label (filename) lets you find it, the box holds your belongings (data), and the warehouse manager (OS) tracks its location on the shelves (disk blocks).

From the user's perspective, a file is simply a contiguous logical address space. The OS handles the mapping of that logical space to physical storage.

### Why Do We Need Files?

| Concern          | Without Files          | With Files                   |
| ---------------- | ---------------------- | ---------------------------- |
| **Persistence**  | Data lost on reboot    | Data survives power off      |
| **Naming**       | Must use raw addresses | Use human-readable names     |
| **Sharing**      | No standard mechanism  | Controlled multi-user access |
| **Organization** | Flat pool of bytes     | Hierarchical directories     |
| **Protection**   | Anyone reads anything  | Per-file permissions         |

---

## File Attributes

Every file carries metadata — information _about_ the file that the OS maintains separately from the file's actual data.

| Attribute      | Description                                  | Example              |
| -------------- | -------------------------------------------- | -------------------- |
| **Name**       | Human-readable identifier                    | `report.pdf`         |
| **Identifier** | Unique numeric tag within the file system    | inode 48372          |
| **Type**       | Indicates kind of file                       | `.c`, `.txt`, `.exe` |
| **Location**   | Pointer to device and block(s)               | disk 2, block 1024   |
| **Size**       | Current size in bytes, words, or blocks      | 4096 bytes           |
| **Protection** | Access control information                   | `rwxr-xr--`          |
| **Timestamps** | Creation, last access, last modification     | `2025-06-01 09:30`   |
| **Owner**      | User who created/owns the file               | uid 1000             |
| **Link count** | Number of directory entries pointing to file | 2                    |

> [!NOTE]
> On UNIX systems, all file attributes except the name itself are stored in a structure called the **inode**. The directory entry holds only the name and the inode number.

---

## File Types

Operating systems support several distinct types of files, each serving a different purpose.

| File Type             | Description                         | Typical Extensions           | UNIX Indicator |
| --------------------- | ----------------------------------- | ---------------------------- | -------------- |
| **Regular file**      | Contains user data (text or binary) | `.txt`, `.c`, `.jpg`, `.exe` | `-`            |
| **Directory**         | Contains list of other files        | (none)                       | `d`            |
| **Character special** | Models serial I/O devices           | (none)                       | `c`            |
| **Block special**     | Models block I/O devices (disks)    | (none)                       | `b`            |
| **Symbolic link**     | Points to another file by pathname  | (none)                       | `l`            |
| **Socket**            | Endpoint for network communication  | `.sock`                      | `s`            |
| **Named pipe (FIFO)** | Inter-process communication channel | (none)                       | `p`            |

### Common File Extensions

| Extension      | File Type   | Description                  |
| -------------- | ----------- | ---------------------------- |
| `.c`, `.h`     | Source code | C language source and header |
| `.o`, `.obj`   | Object file | Compiled but not linked      |
| `.exe`, `.out` | Executable  | Ready-to-run binary          |
| `.sh`, `.py`   | Script      | Interpreted program          |
| `.txt`, `.md`  | Text        | Plain text or markdown       |
| `.jpg`, `.png` | Image       | Compressed image data        |
| `.pdf`         | Document    | Portable document format     |
| `.tar`, `.zip` | Archive     | Bundled/compressed files     |

### File Type Detection

The OS uses several strategies to determine a file's type:

| Method               | Description                              | Example                                |
| -------------------- | ---------------------------------------- | -------------------------------------- |
| **Extension**        | Suffix of the filename                   | `.pdf` → PDF viewer                    |
| **Magic number**     | Special bytes at the start of a file     | `0x7f 0x45 0x4c 0x46` → ELF executable |
| **Metadata**         | File system attributes or resource forks | macOS UTI types                        |
| **Content sniffing** | Examine bytes to guess format            | `file` command in UNIX                 |

> [!TIP]
> The UNIX `file` command uses a comprehensive magic number database (`/usr/share/misc/magic`) to identify file types regardless of extension.

---

## File Structure

Files can be internally organized in different ways, and the OS may or may not impose a structure.

| Structure                   | Description                                                   | Example                     |
| --------------------------- | ------------------------------------------------------------- | --------------------------- |
| **None (byte sequence)**    | File is an unstructured stream of bytes                       | UNIX, Windows regular files |
| **Simple record structure** | File is a sequence of fixed-length or variable-length records | Mainframe data files, CSV   |
| **Complex structure**       | Application-defined internal format                           | PDF, DOCX, database files   |

```text
Byte Sequence (UNIX model):
┌──────────────────────────────────────────────────┐
│ b0 │ b1 │ b2 │ b3 │ b4 │ ... │ bn-1 │ bn │
└──────────────────────────────────────────────────┘
  OS sees: just a stream of bytes, no record boundaries

Simple Record Structure:
┌──────────┬──────────┬──────────┬──────────┐
│ Record 0 │ Record 1 │ Record 2 │ Record 3 │
└──────────┴──────────┴──────────┴──────────┘
  Each record has fixed length L; record i starts at offset i × L

Complex Structure (e.g., PDF):
┌────────┬──────────┬─────────┬────────┬──────────┐
│ Header │ Body     │ Xref    │ Trailer│ %%EOF    │
│ %PDF-  │ Objects  │ Table   │        │          │
└────────┴──────────┴─────────┴────────┴──────────┘
```

Modern UNIX and Windows treat files as byte sequences. Any higher-level structure is the application's responsibility, giving maximum flexibility.

---

## File Operations

The operating system provides a set of **system calls** for manipulating files. These are the building blocks upon which all file I/O is constructed.

| Operation             | Description                            | UNIX System Call    | Windows API           |
| --------------------- | -------------------------------------- | ------------------- | --------------------- |
| **Create**            | Allocate space, create directory entry | `creat()`, `open()` | `CreateFile()`        |
| **Open**              | Find file, load metadata into memory   | `open()`            | `CreateFile()`        |
| **Read**              | Transfer data from file to buffer      | `read()`            | `ReadFile()`          |
| **Write**             | Transfer data from buffer to file      | `write()`           | `WriteFile()`         |
| **Reposition (Seek)** | Move read/write pointer to offset      | `lseek()`           | `SetFilePointer()`    |
| **Delete**            | Remove directory entry, free blocks    | `unlink()`          | `DeleteFile()`        |
| **Truncate**          | Erase contents but keep attributes     | `ftruncate()`       | `SetEndOfFile()`      |
| **Close**             | Release in-memory structures           | `close()`           | `CloseHandle()`       |
| **Rename**            | Change the file's name                 | `rename()`          | `MoveFile()`          |
| **Get attributes**    | Read file metadata                     | `stat()`            | `GetFileAttributes()` |

> [!IMPORTANT]
> Most operations require the file to be **opened** first. The `open()` call returns a **file descriptor** that is used by all subsequent operations to refer to the file.

---

## The Open File Table

When a process opens a file, the OS does not search the directory tree on every read or write. Instead, it caches the file's metadata in memory using a two-level table structure.

```text
  Process A                    Process B
  ┌──────────────┐             ┌──────────────┐
  │ Per-process   │             │ Per-process   │
  │ Open File     │             │ Open File     │
  │ Table         │             │ Table         │
  ├──────────────┤             ├──────────────┤
  │ fd 0 → stdin │             │ fd 0 → stdin │
  │ fd 1 → stdout│             │ fd 1 → stdout│
  │ fd 2 → stderr│             │ fd 2 → stderr│
  │ fd 3 ────────┼──┐          │ fd 3 ────────┼──┐
  │ fd 4 ────────┼──┼──┐       └──────────────┘  │
  └──────────────┘  │  │                          │
                    │  │                          │
                    ▼  │                          ▼
         ┌─────────────────────────────────────────────┐
         │          System-Wide Open File Table         │
         ├───────┬──────────┬──────────┬───────────────┤
         │ Entry │ Open Cnt │ Offset   │ Ptr to Inode  │
         ├───────┼──────────┼──────────┼───────────────┤
         │   0   │    2     │  4096    │  → inode 372  │
         │   1   │    1     │  0       │  → inode 108  │
         │   2   │    1     │  2048    │  → inode 372  │
         └───────┴──────────┴──────────┴───────────────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │  Inode Cache │
                                    │  (in memory) │
                                    └──────────────┘
```

### Per-Process Open File Table

Each process maintains its own table indexed by **file descriptors** (small non-negative integers).

| Field                        | Description                           |
| ---------------------------- | ------------------------------------- |
| File descriptor (fd)         | Index into this table                 |
| Pointer to system-wide entry | Links to the shared entry             |
| Access mode                  | Read, write, or both                  |
| Per-process offset           | Some implementations keep offset here |

### System-Wide Open File Table

A single, kernel-maintained table shared by all processes.

| Field                  | Description                             |
| ---------------------- | --------------------------------------- |
| Open count             | Number of processes with this file open |
| File offset            | Current read/write position             |
| Access mode            | How the file was opened                 |
| Pointer to inode/vnode | Link to in-memory metadata              |

---

## File Descriptors and File Handles

**UNIX** uses **file descriptors** — small integers starting from 0. By convention:

| fd  | Standard Stream | Purpose               |
| --- | --------------- | --------------------- |
| 0   | `stdin`         | Standard input        |
| 1   | `stdout`        | Standard output       |
| 2   | `stderr`        | Standard error        |
| 3+  | User files      | Opened by the process |

**Windows** uses **file handles** — opaque `HANDLE` values returned by `CreateFile()`. They serve the same purpose but are not simple integers.

---

## C Code Examples

### Opening, Reading, Writing, and Closing a File

```c
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

int main() {
    // Create and open a file for writing
    int fd = open("example.txt", O_CREAT | O_WRONLY | O_TRUNC, 0644);
    if (fd < 0) {
        perror("open");
        return 1;
    }

    // Write data to the file
    const char *msg = "Hello, File Systems!\n";
    ssize_t bytes_written = write(fd, msg, strlen(msg));
    printf("Wrote %zd bytes\n", bytes_written);

    close(fd);  // Close after writing

    // Reopen the file for reading
    fd = open("example.txt", O_RDONLY);
    if (fd < 0) {
        perror("open");
        return 1;
    }

    // Read data from the file
    char buffer[128];
    ssize_t bytes_read = read(fd, buffer, sizeof(buffer) - 1);
    buffer[bytes_read] = '\0';  // Null-terminate
    printf("Read: %s", buffer);

    close(fd);
    return 0;
}
```

### Using lseek() to Reposition

```c
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

int main() {
    int fd = open("example.txt", O_RDONLY);

    // Seek to byte offset 7 from the beginning
    off_t pos = lseek(fd, 7, SEEK_SET);
    printf("Seeked to position: %lld\n", (long long)pos);

    // Read from that position
    char buf[32];
    ssize_t n = read(fd, buf, 13);
    buf[n] = '\0';
    printf("Read from offset 7: '%s'\n", buf);

    // Seek relative to current position
    lseek(fd, -5, SEEK_CUR);

    // Seek to end of file
    off_t size = lseek(fd, 0, SEEK_END);
    printf("File size: %lld bytes\n", (long long)size);

    close(fd);
    return 0;
}
```

### Python Equivalent

```python
# Writing to a file
with open("example.txt", "w") as f:
    f.write("Hello, File Systems!\n")

# Reading from a file
with open("example.txt", "r") as f:
    content = f.read()
    print(f"Read: {content}")

# Seeking within a file
with open("example.txt", "rb") as f:
    f.seek(7)                 # SEEK_SET (default)
    chunk = f.read(13)
    print(f"From offset 7: {chunk}")

    f.seek(-5, 1)             # SEEK_CUR
    f.seek(0, 2)              # SEEK_END
    print(f"File size: {f.tell()} bytes")
```

---

## File Locking

When multiple processes access the same file concurrently, we need **file locking** to prevent corruption and ensure consistency.

### Lock Types

| Lock Type          | Also Called | Behavior                                                           |
| ------------------ | ----------- | ------------------------------------------------------------------ |
| **Shared lock**    | Read lock   | Multiple processes can hold simultaneously; blocks exclusive locks |
| **Exclusive lock** | Write lock  | Only one process can hold; blocks all other locks                  |

### Locking Strategies

| Strategy              | Description                                       | Enforcement                           |
| --------------------- | ------------------------------------------------- | ------------------------------------- |
| **Advisory locking**  | Processes _voluntarily_ check locks before access | OS does not enforce; cooperative      |
| **Mandatory locking** | OS _enforces_ locks on all file operations        | Every `read()`/`write()` checks locks |

> [!WARNING]
> Advisory locks only work if **all** processes cooperate and check for locks. A rogue process can ignore advisory locks and read/write freely.

### File Locking in C (POSIX)

```c
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

int main() {
    int fd = open("data.db", O_RDWR);

    // Set up a write (exclusive) lock on the entire file
    struct flock lock;
    lock.l_type   = F_WRLCK;    // Exclusive lock
    lock.l_whence = SEEK_SET;
    lock.l_start  = 0;          // Start of file
    lock.l_len    = 0;          // Lock entire file (0 = to EOF)

    // Try to acquire the lock (blocking)
    if (fcntl(fd, F_SETLKW, &lock) == -1) {
        perror("fcntl lock");
        return 1;
    }
    printf("Lock acquired! Writing data...\n");

    write(fd, "critical data", 13);

    // Release the lock
    lock.l_type = F_UNLCK;
    fcntl(fd, F_SETLK, &lock);
    printf("Lock released.\n");

    close(fd);
    return 0;
}
```

### Lock Granularity

| Granularity     | Scope                           | Concurrency | Overhead |
| --------------- | ------------------------------- | ----------- | -------- |
| **Entire file** | Lock whole file                 | Low         | Low      |
| **Byte range**  | Lock specific byte ranges       | High        | Higher   |
| **Record**      | Lock logical records (database) | Highest     | Highest  |

> _"A file is a named collection of related information that is recorded on secondary storage."_ — Abraham Silberschatz, _Operating System Concepts_

---

## Try It Yourself

**Exercise 1:** Write a C program that creates a file, writes 100 integers (0–99) as binary data, then uses `lseek()` to read the 50th integer directly without reading the preceding 49.

:::details Solution

```c
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

int main() {
    int fd = open("numbers.bin", O_CREAT | O_RDWR | O_TRUNC, 0644);

    // Write 100 integers
    for (int i = 0; i < 100; i++) {
        write(fd, &i, sizeof(int));
    }

    // Seek to the 50th integer (index 49)
    lseek(fd, 49 * sizeof(int), SEEK_SET);

    int value;
    read(fd, &value, sizeof(int));
    printf("The 50th integer is: %d\n", value);  // Should print 49

    close(fd);
    return 0;
}
```

:::

**Exercise 2:** Explain what happens when two processes each open the same file independently. How many entries are created in the per-process and system-wide open file tables?

:::details Solution
When two processes independently open the same file:

- Each process gets **one new entry** in its per-process open file table (one fd each).
- The system-wide open file table gets **two entries** (one per `open()` call), each with its own file offset and access mode.
- Both system-wide entries point to the **same inode** in the inode cache.
- The inode's open count is incremented to 2.
- Each process can independently seek and read/write without affecting the other's file position, because they have separate system-wide entries.
  :::

**Exercise 3:** What is the difference between `unlink()` and `ftruncate()`? When would you use each?

:::details Solution

- **`unlink()`** removes the directory entry for a file. The file's inode and data blocks are freed only when the link count drops to 0 AND no process has the file open. Use `unlink()` to delete a file.
- **`ftruncate()`** sets the file's length to a specified size (often 0). The directory entry, inode, and file attributes remain intact — only the data is erased. Use `ftruncate()` when you want to clear a file's contents but keep the file itself (e.g., resetting a log file).
  :::

---

## Key Takeaways

- A **file** is a named, persistent abstraction over secondary storage managed by the OS.
- File **attributes** (name, size, type, permissions, timestamps) are stored separately from file data — in the **inode** on UNIX systems.
- File **types** include regular files, directories, device files, links, sockets, and pipes.
- The six core file operations — **create, open, read, write, seek, close** — form the API for all file I/O.
- The OS maintains a **two-level open file table**: per-process tables hold file descriptors that point into a system-wide table caching inode data.
- **File descriptors** (UNIX) are small integers; **file handles** (Windows) are opaque values — both identify an open file within a process.
- **File locking** can be shared (read) or exclusive (write), and advisory (cooperative) or mandatory (OS-enforced).
- Byte-range locking provides finer granularity and higher concurrency than whole-file locking.
