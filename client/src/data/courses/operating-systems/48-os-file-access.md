---
title: File Access Methods
section: "File Systems"
---

# File Access Methods

Once a file is created and data stored within it, we need ways to access that data. The **access method** determines the order and manner in which records or bytes within a file can be read or written. Choosing the right access method profoundly impacts performance — reading a database record via sequential scan when you could use direct access is like reading an entire dictionary front-to-back to find one word, instead of jumping to the right page.

---

## Sequential Access

> **Sequential access** is the simplest and most common access method. Data is processed in order, one record or byte after another, from beginning to end.

Think of sequential access like listening to a cassette tape — you hear songs in order and must fast-forward or rewind to reach a particular track.

### Operations

| Operation      | Description                                           |
| -------------- | ----------------------------------------------------- |
| `read_next()`  | Read the next record/byte and advance the pointer     |
| `write_next()` | Write at the current position and advance the pointer |
| `reset()`      | Move the pointer back to the beginning of the file    |

### How It Works

```text
File:   ┌───────┬───────┬───────┬───────┬───────┬───────┐
        │ Rec 0 │ Rec 1 │ Rec 2 │ Rec 3 │ Rec 4 │ Rec 5 │
        └───────┴───────┴───────┴───────┴───────┴───────┘

Step 1:  ▲                                    read_next() → Rec 0
         CP (Current Position)

Step 2:          ▲                            read_next() → Rec 1
                 CP

Step 3:                  ▲                    read_next() → Rec 2
                         CP

Step 4:  ▲                                    reset()
         CP (back to start)

         Direction of access ──────────────────────►
```

### Characteristics

| Property                      | Value                                  |
| ----------------------------- | -------------------------------------- |
| **Access direction**          | Forward only (with reset for backward) |
| **Speed for full scan**       | Optimal — O(n)                         |
| **Speed for random record**   | Poor — O(n) average                    |
| **Implementation complexity** | Very simple                            |
| **Storage overhead**          | None (just a pointer)                  |

### Use Cases

- **Text files**: Read line by line from start to end
- **Log files**: Append new entries, read in chronological order
- **Data processing**: ETL pipelines processing every record
- **Compilers**: Scanning source code left to right
- **Streaming media**: Playing audio/video in sequence

### C Example — Sequential Read

```c
#include <stdio.h>

int main() {
    FILE *fp = fopen("log.txt", "r");
    if (!fp) { perror("fopen"); return 1; }

    char line[256];
    int line_num = 0;

    // Read sequentially, line by line
    while (fgets(line, sizeof(line), fp) != NULL) {
        line_num++;
        printf("Line %d: %s", line_num, line);
    }

    // Reset to beginning
    rewind(fp);  // equivalent to fseek(fp, 0, SEEK_SET)
    printf("\n--- Reset to beginning ---\n");

    // Read first line again
    if (fgets(line, sizeof(line), fp))
        printf("First line again: %s", line);

    fclose(fp);
    return 0;
}
```

---

## Direct (Random) Access

> **Direct access** (also called **random access**) allows reading or writing any block of a file immediately, by specifying its block number. No need to traverse preceding blocks.

Direct access is like a vinyl record player — you can drop the needle on any track without playing the ones before it.

### Operations

| Operation  | Description                                  |
| ---------- | -------------------------------------------- |
| `read(n)`  | Read block number _n_                        |
| `write(n)` | Write to block number _n_                    |
| `seek(n)`  | Position the read/write pointer at block _n_ |

### How It Works

```text
File:   ┌─────────┬─────────┬─────────┬─────────┬─────────┐
        │ Block 0 │ Block 1 │ Block 2 │ Block 3 │ Block 4 │
        └─────────┴─────────┴─────────┴─────────┴─────────┘

Direct access: read(3)
        ┌─────────┬─────────┬─────────┬─────────┬─────────┐
        │ Block 0 │ Block 1 │ Block 2 │ Block 3 │ Block 4 │
        └─────────┴─────────┴─────────┴────▲────┴─────────┘
                                            │
                                      Jump directly!
                                      No traversal needed.

Sequential would require:   0 → 1 → 2 → 3   (three reads wasted)
```

### Relative vs Absolute Block Numbers

| Addressing                 | Description                       | Example              |
| -------------------------- | --------------------------------- | -------------------- |
| **Relative block number**  | Offset from the start of the file | Block 5 of this file |
| **Absolute block address** | Physical position on the disk     | Disk sector 27493    |

The OS translates relative block numbers to absolute addresses using the file's allocation data structure (e.g., inode block pointers).

$$\text{Absolute Address} = \text{File Start Block} + \text{Relative Block Number}$$

For non-contiguous allocation, the mapping is more complex and involves index blocks or FAT lookups.

### Characteristics

| Property                      | Value                        |
| ----------------------------- | ---------------------------- |
| **Access pattern**            | Any block, any order         |
| **Speed for specific record** | O(1) with known block number |
| **Speed for full scan**       | Same as sequential — O(n)    |
| **Implementation complexity** | Moderate                     |
| **Storage overhead**          | Needs block-address mapping  |

### Use Cases

- **Databases**: Fetch record by primary key → block lookup
- **Swap files**: OS pages in/out specific blocks
- **Virtual memory backing stores**: Random page access
- **Multimedia editing**: Jump to any frame in a video file
- **Executables**: Loader reads specific sections (text, data, BSS)

### C Example — Direct Access

```c
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

#define RECORD_SIZE 64

typedef struct {
    int id;
    char name[40];
    double balance;
    char padding[12];  // Pad to 64 bytes
} Record;

int main() {
    int fd = open("accounts.db", O_RDONLY);
    if (fd < 0) { perror("open"); return 1; }

    // Directly read record number 42 (0-indexed)
    int record_num = 42;
    off_t offset = (off_t)record_num * RECORD_SIZE;
    lseek(fd, offset, SEEK_SET);

    Record rec;
    read(fd, &rec, sizeof(Record));
    printf("Record %d: id=%d, name=%s, balance=%.2f\n",
           record_num, rec.id, rec.name, rec.balance);

    // Jump to record 7 — no need to read records 0–6
    lseek(fd, 7 * RECORD_SIZE, SEEK_SET);
    read(fd, &rec, sizeof(Record));
    printf("Record 7: id=%d, name=%s\n", rec.id, rec.name);

    close(fd);
    return 0;
}
```

---

## Indexed Access

> **Indexed access** uses a separate **index file** (or index structure) that maps search keys to the locations of records in the data file. This allows efficient lookup without scanning the entire file.

Think of it like the index at the back of a textbook — you look up a keyword, get a page number, and flip directly to that page.

### How It Works

```text
     Index File                        Data File
  ┌─────────┬────────┐         ┌─────────────────────────┐
  │  Key    │ Offset │         │                         │
  ├─────────┼────────┤    ┌───►│ Record: Alice, $5000    │ Block 2
  │ "Alice" │   2    │────┘    │                         │
  ├─────────┼────────┤         ├─────────────────────────┤
  │ "Bob"   │   7    │────┐    │ Record: Carol, $3200    │ Block 5
  ├─────────┼────────┤    │    │                         │
  │ "Carol" │   5    │──┐ │    ├─────────────────────────┤
  ├─────────┼────────┤  │ └───►│ Record: Bob, $8100      │ Block 7
  │ "Dave"  │  12    │──┼─┐    │                         │
  └─────────┴────────┘  │ │    ├─────────────────────────┤
                         │ └───►│ Record: Dave, $1500     │ Block 12
                         │      │                         │
                         └─────►│                         │ Block 5
                                └─────────────────────────┘
```

### Multi-Level Index

For very large files, a single index may itself become too large to search efficiently. A **multi-level index** solves this:

```text
  Master Index              Secondary Index            Data File
  ┌───────┬─────┐          ┌─────────┬────────┐      ┌──────────┐
  │ A-F   │  ──►├─────────►│ "Alice" │   2    │─────►│ Record   │
  ├───────┼─────┤          │ "Bob"   │   7    │      │          │
  │ G-L   │  ──►├──┐       │ "Carol" │   5    │      └──────────┘
  ├───────┼─────┤  │       │ "Dave"  │  12    │
  │ M-R   │  ──►│  │       │ "Eve"   │  15    │
  ├───────┼─────┤  │       └─────────┴────────┘
  │ S-Z   │  ──►│  │
  └───────┴─────┘  │       ┌─────────┬────────┐
                   └──────►│ "Grace" │  20    │
                           │ "Helen" │  23    │
                           │ "Ivan"  │  30    │
                           └─────────┴────────┘
```

### Characteristics

| Property           | Value                              |
| ------------------ | ---------------------------------- |
| **Lookup speed**   | O(log n) with sorted/tree index    |
| **Insertion**      | May require index update           |
| **Space overhead** | Extra space for index file         |
| **Flexibility**    | Multiple indexes on different keys |

### Use Cases

- **Large databases**: B+ tree indexes for fast queries
- **File systems**: Directory structures mapping names to inodes
- **Search engines**: Inverted index mapping words to documents
- **Libraries**: Card catalog mapping titles/authors to shelf locations

---

## Memory-Mapped Files

> **Memory-mapped file I/O** maps a file (or a portion of it) directly into a process's virtual address space. After mapping, reading from or writing to memory addresses automatically translates to file I/O, driven by the virtual memory subsystem.

### How It Works

```text
  Process Virtual Address Space
  ┌─────────────────────────┐
  │         Code            │
  ├─────────────────────────┤
  │         Heap            │
  ├─────────────────────────┤
  │                         │
  │   Memory-Mapped Region  │◄───── mmap() maps file here
  │   (pages from file)     │
  │                         │
  ├─────────────────────────┤
  │         Stack           │
  └─────────────────────────┘
            │
            │  Page fault on first access
            ▼
  ┌─────────────────────────┐
  │    File on Disk          │
  │  ┌──────┬──────┬──────┐ │
  │  │Page 0│Page 1│Page 2│ │
  │  └──────┴──────┴──────┘ │
  └─────────────────────────┘
```

When the process accesses a memory address in the mapped region:

1. A **page fault** occurs if the page is not in RAM.
2. The OS reads the corresponding file block into a page frame.
3. The page table is updated to map the virtual address to the physical frame.
4. Subsequent accesses to that page hit RAM directly — no system call overhead.

### Benefits of Memory-Mapped Files

| Benefit                       | Description                                                         |
| ----------------------------- | ------------------------------------------------------------------- |
| **Simplified I/O**            | Read/write file via memory operations — no `read()`/`write()` calls |
| **Zero-copy**                 | Data goes directly to/from page cache; no user-buffer copy          |
| **Shared memory**             | Multiple processes can map the same file with `MAP_SHARED`          |
| **Lazy loading**              | Only pages actually accessed are loaded from disk                   |
| **Efficient for large files** | No need to load entire file; demand paging handles it               |

### C Example — mmap()

```c
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <string.h>

int main() {
    int fd = open("data.txt", O_RDWR);
    if (fd < 0) { perror("open"); return 1; }

    // Get file size
    struct stat sb;
    fstat(fd, &sb);
    size_t file_size = sb.st_size;

    // Map file into memory
    char *mapped = mmap(NULL, file_size,
                        PROT_READ | PROT_WRITE,  // read + write
                        MAP_SHARED,               // changes visible to others
                        fd, 0);                   // offset 0
    if (mapped == MAP_FAILED) {
        perror("mmap");
        close(fd);
        return 1;
    }

    // Now access file as if it were memory!
    printf("First 20 chars: %.20s\n", mapped);

    // Modify the file by writing to memory
    memcpy(mapped, "MODIFIED", 8);

    // Ensure changes are written to disk
    msync(mapped, file_size, MS_SYNC);

    // Unmap when done
    munmap(mapped, file_size);
    close(fd);
    return 0;
}
```

### Python Example — mmap

```python
import mmap

with open("data.txt", "r+b") as f:
    # Memory-map the entire file
    mm = mmap.mmap(f.fileno(), 0)  # 0 = map entire file

    # Read like memory
    print(f"First 20 bytes: {mm[:20]}")

    # Seek and read
    mm.seek(10)
    line = mm.readline()
    print(f"Line from offset 10: {line}")

    # Modify the file via memory
    mm[0:8] = b"MODIFIED"

    mm.close()
```

### mmap() Parameters

| Parameter | Description                                                       |
| --------- | ----------------------------------------------------------------- |
| `addr`    | Suggested starting address (`NULL` = let OS choose)               |
| `length`  | Number of bytes to map                                            |
| `prot`    | Protection: `PROT_READ`, `PROT_WRITE`, `PROT_EXEC`                |
| `flags`   | `MAP_SHARED` (visible to others) or `MAP_PRIVATE` (copy-on-write) |
| `fd`      | File descriptor of the file to map                                |
| `offset`  | Offset within the file (must be page-aligned)                     |

> [!WARNING]
> When using `MAP_SHARED`, writes by one process are visible to all processes that have mapped the same file. Use proper synchronization (e.g., semaphores) to avoid race conditions.

---

## Comparison of Access Methods

| Property                         | Sequential    | Direct (Random)       | Indexed             | Memory-Mapped        |
| -------------------------------- | ------------- | --------------------- | ------------------- | -------------------- |
| **Access pattern**               | In order      | Any block             | By key              | Any byte via pointer |
| **Read speed (specific record)** | O(n)          | O(1)                  | O(log n)            | O(1) after fault     |
| **Full scan speed**              | O(n)          | O(n)                  | O(n)                | O(n)                 |
| **Implementation**               | Simple        | Moderate              | Complex             | Moderate             |
| **Space overhead**               | None          | Block map             | Index file          | Page tables          |
| **Best for**                     | Logs, streams | Databases, swap       | Large DBs           | Large files, IPC     |
| **Can grow easily**              | Yes           | Depends on allocation | Index update needed | Fixed mapping size   |
| **Random access**                | No            | Yes                   | Yes (via key)       | Yes                  |

> [!TIP]
> Many real-world systems combine access methods. A database might use indexed access for queries, sequential access for full table scans, and memory-mapped files for the buffer pool.

---

## Real-World Access Method Usage

| System               | Primary Access Method     | Reason                                                    |
| -------------------- | ------------------------- | --------------------------------------------------------- |
| **grep**             | Sequential                | Scans every line in order                                 |
| **SQLite**           | Indexed (B-tree) + Direct | B-tree index → page number → direct block read            |
| **Linux page cache** | Memory-mapped             | `mmap()` maps files into kernel page cache                |
| **FAT32**            | Linked + Direct           | FAT table enables direct-like access on linked allocation |
| **Video player**     | Sequential + Direct       | Sequential playback with seek capability                  |
| **Git object store** | Indexed (packfile index)  | SHA-1 → offset in packfile                                |

---

## Mathematical Analysis

For a file with $n$ records of size $R$ bytes each on a disk with block size $B$:

**Number of blocks in file:**

$$N = \left\lceil \frac{n \times R}{B} \right\rceil$$

**Sequential access — time to read record $i$:**

$$T_{seq}(i) = i \times T_{block}$$

where $T_{block}$ is the time to read one block.

**Direct access — time to read any record:**

$$T_{direct} = T_{seek} + T_{rotation} + T_{transfer} = T_{block}$$

which is constant regardless of position.

**Indexed access — time to read by key (B+ tree with order $m$):**

$$T_{indexed} = \lceil \log_m(n) \rceil \times T_{block} + T_{block}$$

The first term is the tree traversal; the last $T_{block}$ is reading the actual data block.

> [!NOTE]
> For a B+ tree of order 100 with 1 million records, the lookup requires only $\lceil \log_{100}(10^6) \rceil = 3$ index block reads plus 1 data block read — a total of 4 disk accesses!

---

## Try It Yourself

**Exercise 1:** A file contains 10,000 fixed-size records (128 bytes each) on a disk with 4 KB blocks. How many blocks does the file occupy? If you need to read record 7,500 sequentially from the start, how many blocks must be read?

:::details Solution
Each block holds $\lfloor 4096 / 128 \rfloor = 32$ records.

Total blocks: $\lceil 10000 / 32 \rceil = \lceil 312.5 \rceil = 313$ blocks.

Record 7,500 is in block number $\lfloor 7500 / 32 \rfloor = 234$ (0-indexed).

Sequential read must read blocks 0 through 234, which is **235 blocks**.

With direct access, only **1 block** (block 234) needs to be read.
:::

**Exercise 2:** Write a C program using `mmap()` that creates a file containing 1000 integers, memory-maps it, and then modifies the 500th integer without using `read()`/`write()`.

:::details Solution

```c
#include <fcntl.h>
#include <unistd.h>
#include <sys/mman.h>
#include <stdio.h>

int main() {
    int fd = open("ints.bin", O_CREAT | O_RDWR | O_TRUNC, 0644);
    size_t size = 1000 * sizeof(int);

    // Set file size
    ftruncate(fd, size);

    // Write 1000 integers using regular write
    for (int i = 0; i < 1000; i++)
        write(fd, &i, sizeof(int));

    // Memory-map the file
    int *arr = mmap(NULL, size, PROT_READ | PROT_WRITE,
                    MAP_SHARED, fd, 0);
    if (arr == MAP_FAILED) { perror("mmap"); return 1; }

    // Directly modify the 500th integer (index 499)
    printf("Before: arr[499] = %d\n", arr[499]);
    arr[499] = 99999;
    printf("After:  arr[499] = %d\n", arr[499]);

    // Sync and cleanup
    msync(arr, size, MS_SYNC);
    munmap(arr, size);
    close(fd);
    return 0;
}
```

:::

**Exercise 3:** Compare the number of disk accesses needed to find a record in a file of 1 million records using (a) sequential access, (b) a B+ tree index with branching factor 200.

:::details Solution
**(a) Sequential access:**
Worst case: scan all blocks. With 32 records per 4 KB block:
$\lceil 1{,}000{,}000 / 32 \rceil = 31{,}250$ blocks.

Average case: $31{,}250 / 2 = 15{,}625$ block reads.

**(b) B+ tree index (branching factor 200):**
Tree height: $\lceil \log_{200}(1{,}000{,}000) \rceil = \lceil 6 / 2.301 \rceil = \lceil 2.607 \rceil = 3$ levels.

Total accesses: 3 (index) + 1 (data) = **4 block reads**.

The indexed approach is about **3,900 times faster** than sequential in this scenario.
:::

---

## Key Takeaways

- **Sequential access** reads data in order — simple, efficient for full scans, but slow for finding specific records.
- **Direct (random) access** reads any block by number in O(1) time — essential for databases and swap files.
- **Indexed access** uses an index structure (often a B+ tree) to map keys to block numbers — gives O(log n) lookup on unsorted data.
- **Memory-mapped files** (`mmap()`) map files into virtual memory, allowing file I/O via pointer operations with zero-copy efficiency.
- The choice of access method depends on the **workload pattern**: sequential scans favor sequential access; point queries favor direct or indexed; large file processing favors memory mapping.
- Real systems often **combine multiple access methods** — e.g., databases use B+ tree indexes with direct block access and memory-mapped buffer pools.
- For a B+ tree with branching factor $m$, lookup in $n$ records requires only $O(\log_m n)$ disk accesses — vastly faster than linear scan.
