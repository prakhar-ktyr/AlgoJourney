---
title: Free Space Management
section: "File Systems"
---

# Free Space Management

When a file is deleted or truncated, the disk blocks it occupied become available for reuse. The operating system must track which blocks are **free** and which are **allocated** so that new files can be created efficiently. The choice of free space management method affects allocation speed, fragmentation, and storage overhead. In this lesson, we explore the classic approaches — bit vectors, linked lists, grouping, and counting — as well as modern innovations like ZFS space maps and SSD TRIM commands.

---

## The Problem

Consider a disk with 16 blocks, some free and some allocated:

```text
  Block:     0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15
  Status:  used used free free used used free used used free free free used used free used
```

The file system needs to:

1. **Find free blocks** quickly when creating or growing a file
2. **Mark blocks as free** when a file is deleted
3. **Mark blocks as used** when allocated to a new file
4. Do all of this with minimal **storage overhead** and **time complexity**

---

## Bit Vector (Bitmap)

> A **bit vector** (or bitmap) uses **one bit per disk block** to indicate whether that block is free or allocated. Typically, `0 = free` and `1 = allocated` (though conventions vary).

### Example

```text
  Block:    0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
  Status:   U  U  F  F  U  U  F  U  U  F  F  F  U  U  F  U

  Bitmap:   1  1  0  0  1  1  0  1  1  0  0  0  1  1  0  1
            ├────────────────────────────────────────────────┤
            Word 0 (16 bits):  1100 1101 1000 1101 = 0xCD8D
```

### Finding Free Blocks

To find the first free block, scan the bitmap for the first `0` bit. Modern CPUs provide hardware instructions for this:

```c
// x86: BSF (Bit Scan Forward) finds first set bit
// To find first 0, invert the word first

#include <strings.h>  // for ffs()

int find_first_free(unsigned int *bitmap, int num_words) {
    for (int i = 0; i < num_words; i++) {
        if (bitmap[i] != 0xFFFFFFFF) {  // Not all allocated
            // Find first zero bit
            unsigned int inverted = ~bitmap[i];
            int bit = ffs(inverted) - 1;  // ffs: find first set (1-indexed)
            return i * 32 + bit;
        }
    }
    return -1;  // Disk full
}
```

### Finding _n_ Contiguous Free Blocks

```c
int find_contiguous(unsigned int *bitmap, int total_blocks, int n) {
    int count = 0;
    int start = -1;

    for (int i = 0; i < total_blocks; i++) {
        int word = i / 32;
        int bit = i % 32;

        if (!(bitmap[word] & (1U << bit))) {  // Bit is 0 (free)
            if (count == 0) start = i;
            count++;
            if (count == n) return start;
        } else {
            count = 0;
        }
    }
    return -1;  // Not enough contiguous space
}
```

### Space Overhead Calculation

For a disk of size $D$ with block size $B$:

$$\text{Number of blocks} = \frac{D}{B}$$

$$\text{Bitmap size} = \frac{D}{B \times 8} \text{ bytes}$$

| Disk Size | Block Size | Number of Blocks | Bitmap Size |
| --------- | ---------- | ---------------- | ----------- |
| 1 GB      | 4 KB       | 262,144          | 32 KB       |
| 100 GB    | 4 KB       | 26,214,400       | 3.125 MB    |
| 1 TB      | 4 KB       | 268,435,456      | 32 MB       |
| 10 TB     | 4 KB       | 2,684,354,560    | 320 MB      |
| 1 PB      | 4 KB       | ~274 billion     | 32 GB       |

> [!NOTE]
> For a 1 TB disk with 4 KB blocks, the bitmap uses only 32 MB — about 0.003% of the total disk space. This is extremely efficient.

### Advantages and Disadvantages

| Advantage                                        | Disadvantage                                         |
| ------------------------------------------------ | ---------------------------------------------------- |
| Simple and efficient                             | Must be kept in memory for performance               |
| Fast to find contiguous free blocks              | Large bitmap for very large disks                    |
| Easy to compute free space (count 0 bits)        | Sequential scan for first-fit can be slow            |
| Hardware bit-scan instructions accelerate search | Bitmap itself must be stored on disk for persistence |

### Bitmap in Python

```python
class BitmapFreeSpace:
    def __init__(self, num_blocks):
        self.num_blocks = num_blocks
        # Using a bytearray; each byte tracks 8 blocks
        self.bitmap = bytearray(num_blocks // 8 + 1)

    def is_free(self, block):
        byte_idx = block // 8
        bit_idx = block % 8
        return not (self.bitmap[byte_idx] & (1 << bit_idx))

    def allocate(self, block):
        byte_idx = block // 8
        bit_idx = block % 8
        self.bitmap[byte_idx] |= (1 << bit_idx)

    def free(self, block):
        byte_idx = block // 8
        bit_idx = block % 8
        self.bitmap[byte_idx] &= ~(1 << bit_idx)

    def find_first_free(self):
        for i in range(self.num_blocks):
            if self.is_free(i):
                return i
        return -1  # Disk full

# Usage
bm = BitmapFreeSpace(1024)
bm.allocate(0)
bm.allocate(1)
print(f"First free block: {bm.find_first_free()}")  # Output: 2
bm.free(0)
print(f"First free block: {bm.find_first_free()}")  # Output: 0
```

---

## Linked List

> A **linked list** of free blocks chains all free blocks together. A head pointer (stored in the superblock) points to the first free block, and each free block contains a pointer to the next free block.

### Example

```text
  Superblock: free_head → 2

  Block 2 (free):  next → 3
  Block 3 (free):  next → 6
  Block 6 (free):  next → 9
  Block 9 (free):  next → 10
  Block 10 (free): next → 11
  Block 11 (free): next → 14
  Block 14 (free): next → NULL

  Free list: 2 → 3 → 6 → 9 → 10 → 11 → 14 → NULL
```

```text
  Disk View:
  ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
  │USED│USED│ →3 │ →6 │USED│USED│ →9 │USED│USED│→10 │→11 │→14 │USED│USED│NULL│USED│
  │ 0  │ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │ 7  │ 8  │ 9  │ 10 │ 11 │ 12 │ 13 │ 14 │ 15 │
  └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

### Operations

| Operation                 | Steps                                   | Complexity                   |
| ------------------------- | --------------------------------------- | ---------------------------- |
| **Allocate 1 block**      | Remove head from list, return it        | O(1)                         |
| **Free 1 block**          | Add block to head of list               | O(1)                         |
| **Allocate n contiguous** | Traverse list to find n adjacent blocks | O(total free blocks) — slow! |
| **Count free blocks**     | Traverse entire list                    | O(total free blocks)         |

### Advantages and Disadvantages

| Advantage                                                   | Disadvantage                                       |
| ----------------------------------------------------------- | -------------------------------------------------- |
| No extra storage for the list (uses free blocks themselves) | Traversal is slow — must read each block from disk |
| Simple single-block allocation (O(1))                       | Finding contiguous blocks is very expensive        |
| Only head pointer in superblock                             | Reading the list causes random I/O across the disk |

> [!WARNING]
> The linked list approach is rarely used alone in modern file systems because of its terrible performance for contiguous allocation. However, FAT can be viewed as a form of linked list stored in a compact table.

---

## Grouping

> **Grouping** optimizes the linked list by storing **multiple free block addresses** in each node rather than just one.

### How It Works

The first free block stores the addresses of $n$ free blocks. The last entry ($n$th address) is the address of the next group block, which in turn stores $n$ more free block addresses.

```text
  Group Block (Block 2):              Group Block (Block 14):
  ┌──────────────────────┐            ┌──────────────────────┐
  │ Free block: 3        │            │ Free block: 17       │
  │ Free block: 6        │            │ Free block: 18       │
  │ Free block: 9        │            │ Free block: 20       │
  │ Free block: 10       │            │ Free block: 22       │
  │ Free block: 11       │            │ Free block: 23       │
  │ Next group: 14  ─────┼───────────►│ Next group: NULL     │
  └──────────────────────┘            └──────────────────────┘

  With 4 KB blocks and 4-byte addresses:
  Each group block can hold 4096/4 - 1 = 1023 free block addresses + 1 next pointer
```

### Advantages

| Advantage                      | Explanation                                     |
| ------------------------------ | ----------------------------------------------- |
| **Faster than linked list**    | One block read gives ~1023 free block numbers   |
| **Efficient batch allocation** | Can allocate many blocks from one group at once |
| **No extra storage**           | Uses the free blocks themselves                 |

---

## Counting

> **Counting** exploits the observation that free blocks often occur in **contiguous clusters**. Instead of storing each free block individually, store `(start_block, count)` pairs.

### Example

```text
  Free space list (counting):
  ┌─────────────┬───────┐
  │ Start Block │ Count │
  ├─────────────┼───────┤
  │      2      │   2   │  → blocks 2, 3
  │      6      │   1   │  → block 6
  │      9      │   3   │  → blocks 9, 10, 11
  │     14      │   1   │  → block 14
  └─────────────┴───────┘

  Total free: 2 + 1 + 3 + 1 = 7 blocks
  Entries: only 4 (vs. 7 entries in a simple list)
```

### When Counting Shines

| Scenario                        | Simple List Entries | Counting Entries |
| ------------------------------- | ------------------- | ---------------- |
| 100 scattered free blocks       | 100                 | 100              |
| 100 contiguous free blocks      | 100                 | 1                |
| 1000 free blocks in 50 clusters | 1000                | 50               |

### Advantages and Disadvantages

| Advantage                                         | Disadvantage                                    |
| ------------------------------------------------- | ----------------------------------------------- |
| Very compact when free blocks are clustered       | Same as linked list when blocks are scattered   |
| Easy to find contiguous space (check count field) | Splitting and merging ranges adds complexity    |
| Similar to extent-based concepts                  | Must maintain sorted order for efficient search |

---

## Space Maps (ZFS Approach)

> **ZFS** uses a novel approach called **space maps** that is designed for very large storage pools (petabyte scale).

### How Space Maps Work

```text
  Storage Pool (ZFS)
  ┌────────────────────────────────────────────────────────┐
  │                                                        │
  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
  │  │ Metaslab │  │ Metaslab │  │ Metaslab │  ...        │
  │  │    0     │  │    1     │  │    2     │             │
  │  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
  │       │              │              │                   │
  │       ▼              ▼              ▼                   │
  │  ┌─────────┐  ┌─────────┐  ┌─────────┐               │
  │  │ Space   │  │ Space   │  │ Space   │               │
  │  │ Map 0   │  │ Map 1   │  │ Map 2   │               │
  │  │(log of  │  │(log of  │  │(log of  │               │
  │  │alloc/   │  │alloc/   │  │alloc/   │               │
  │  │free ops)│  │free ops)│  │free ops)│               │
  │  └─────────┘  └─────────┘  └─────────┘               │
  └────────────────────────────────────────────────────────┘
```

### Key Concepts

| Concept        | Description                                                                      |
| -------------- | -------------------------------------------------------------------------------- |
| **Metaslab**   | The disk is divided into ~200 metaslabs, each ~hundreds of MB to GB              |
| **Space map**  | Per-metaslab log of allocate/free operations                                     |
| **Log format** | Append-only: `ALLOC(offset, size)` or `FREE(offset, size)` entries               |
| **Condense**   | Periodically, the log is replayed into an in-memory tree and rewritten compactly |

### Why Logs Instead of Bitmaps?

| Bitmap                                          | Space Map Log                                         |
| ----------------------------------------------- | ----------------------------------------------------- |
| Must update bitmap on disk for every alloc/free | Just append an entry to the log (sequential write)    |
| Random I/O to update bits                       | Sequential I/O (append-only) — ideal for disk and SSD |
| Fixed size proportional to disk                 | Log size proportional to number of operations         |
| Must load entire bitmap into RAM                | Load only active metaslabs' space maps                |

> [!TIP]
> ZFS's space maps are essentially **write-ahead logs** applied to free space management. This is the same principle that makes journaling efficient for metadata updates.

---

## Comparison of Free Space Management Methods

| Method          | Space Overhead                  | Alloc 1 Block           | Find n Contiguous      | Best When                     |
| --------------- | ------------------------------- | ----------------------- | ---------------------- | ----------------------------- |
| **Bit vector**  | 1 bit/block (32 MB for 1TB)     | Fast (bit scan)         | Good (scan bitmap)     | General purpose, fits in RAM  |
| **Linked list** | 1 pointer/free block (in-place) | O(1) — take head        | O(free) — very slow    | Memory is extremely tight     |
| **Grouping**    | In free blocks themselves       | O(1) from current group | Moderate               | Batch allocation needed       |
| **Counting**    | 8 bytes per free range          | O(1) from first range   | Excellent if clustered | Contiguous free blocks common |
| **Space maps**  | Log entries                     | Append to log           | Via in-memory tree     | Very large disks (ZFS)        |

---

## TRIM/DISCARD for SSDs

Traditional hard drives don't need to know when a block is freed — they can overwrite it anytime. **SSDs** are different: they must **erase** a block before rewriting it, and erasure operates on large units (128–512 KB **erase blocks**).

### The Problem Without TRIM

```text
  1. File system deletes a file, marks blocks free in bitmap
  2. SSD controller still thinks those blocks contain valid data
  3. Later, SSD needs to write to those blocks → must:
     a. Read the entire erase block
     b. Erase the entire erase block
     c. Write back valid data + new data
     This is called WRITE AMPLIFICATION — very slow!
```

### TRIM to the Rescue

```text
  1. File system deletes a file, marks blocks free in bitmap
  2. File system sends TRIM command: "blocks 100-105 are no longer needed"
  3. SSD controller marks those pages as invalid internally
  4. Later, SSD garbage collector can erase the block without copying those pages
  5. Future writes to those blocks are fast — no read-modify-erase-write needed
```

### TRIM Implementation

| OS      | TRIM Support           | Mount Option                               |
| ------- | ---------------------- | ------------------------------------------ |
| Linux   | ext4, Btrfs, XFS, F2FS | `discard` mount option or `fstrim` command |
| Windows | NTFS (automatic)       | Enabled by default                         |
| macOS   | APFS (automatic)       | Enabled by default for Apple SSDs          |

```bash
# Linux: run TRIM on all mounted file systems
sudo fstrim -av

# Linux: enable continuous TRIM (may impact performance)
# In /etc/fstab:
/dev/sda1  /  ext4  defaults,discard  0  1
```

> [!IMPORTANT]
> Continuous TRIM (`discard` mount option) sends a TRIM command on every delete, which can slow down operations. **Periodic TRIM** via `fstrim` (e.g., weekly cron job) is often preferred for better performance.

---

## Fragmentation Prevention Strategies

Even with good free space management, fragmentation can degrade performance. Here are strategies to minimize it:

| Strategy                   | Description                                             | Used By            |
| -------------------------- | ------------------------------------------------------- | ------------------ |
| **Pre-allocation**         | Reserve contiguous space at file creation               | ext4 (`fallocate`) |
| **Delayed allocation**     | Wait until flush to choose blocks (better placement)    | ext4               |
| **Block groups**           | Allocate files near their directory's blocks            | ext2/3/4           |
| **Best-fit allocation**    | Choose the smallest free region that fits               | General            |
| **Buddy system**           | Maintain power-of-2 sized free regions for fast merging | Some FS allocators |
| **Copy-on-write**          | Write to new locations → naturally contiguous writes    | ZFS, Btrfs, APFS   |
| **Online defragmentation** | Move blocks while FS is mounted                         | ext4 (`e4defrag`)  |
| **Log-structured writes**  | All writes sequential → no fragmentation in write path  | F2FS, LFS          |

### Block Group Locality (ext4)

```text
  Block Group 0           Block Group 1           Block Group 2
  ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
  │ Superblock backup  │   │ Superblock backup  │   │                   │
  │ Group descriptors  │   │ Group descriptors  │   │                   │
  │ Inode bitmap       │   │ Inode bitmap       │   │ Inode bitmap       │
  │ Block bitmap       │   │ Block bitmap       │   │ Block bitmap       │
  │ Inode table        │   │ Inode table        │   │ Inode table        │
  │ Data blocks:       │   │ Data blocks:       │   │ Data blocks:       │
  │  /home/alice/*     │   │  /home/bob/*       │   │  /var/log/*        │
  └───────────────────┘   └───────────────────┘   └───────────────────┘

  Files in the same directory tend to be allocated in the same block group
  → Reduced seek time for directory listings and related file access
```

---

## Try It Yourself

**Exercise 1:** A disk has 1 million blocks. Calculate the size of the free space bitmap in (a) bytes, (b) KB, and (c) as a percentage of the total disk space (4 KB blocks).

:::details Solution
**(a) Bitmap size in bytes:**

$$\frac{1{,}000{,}000}{8} = 125{,}000 \text{ bytes}$$

**(b) In KB:**

$$\frac{125{,}000}{1{,}024} \approx 122.07 \text{ KB}$$

**(c) As percentage of total disk:**

Total disk space = $1{,}000{,}000 \times 4{,}096 = 4{,}096{,}000{,}000$ bytes ≈ 3.815 GB

$$\frac{125{,}000}{4{,}096{,}000{,}000} \times 100 \approx 0.00305\%$$

The bitmap uses about 0.003% of the disk — a trivially small overhead.
:::

**Exercise 2:** Given the following disk state (F=Free, U=Used), draw the bitmap and the counting free list:

```
Block:  0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
State:  U  F  F  F  U  U  F  F  U  U  U  F  F  F  F  U
```

:::details Solution
**Bitmap:** (1 = used, 0 = free)

```
Block:   0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
Bitmap:  1  0  0  0  1  1  0  0  1  1  1  0  0  0  0  1
```

Binary: `1000 1100 1110 0001` = `0x8CE1`

**Counting free list:**

| Start Block | Count |
| ----------- | ----- | ----------------------- |
| 1           | 3     | (blocks 1, 2, 3)        |
| 6           | 2     | (blocks 6, 7)           |
| 11          | 4     | (blocks 11, 12, 13, 14) |

Only 3 entries to track 9 free blocks — much more compact than a 9-entry linked list!
:::

**Exercise 3:** Explain why TRIM is important for SSD performance and longevity. What happens without TRIM on a heavily used SSD?

:::details Solution
Without TRIM:

1. **Write amplification increases**: When the SSD needs to write to a page that it thinks is still "valid" (because the file system never told it the data was deleted), it must:
   - Read the entire erase block (128–512 KB)
   - Erase the block
   - Write back all valid pages plus the new page
     This can turn a 4 KB write into 512 KB of I/O.

2. **Performance degrades over time**: As the SSD fills up and the controller has fewer known-free pages, it must perform more garbage collection, causing:
   - Increased write latency
   - Reduced throughput
   - More background I/O competing with user I/O

3. **Reduced SSD lifespan**: Flash memory cells have a limited number of erase cycles (~3,000–100,000 depending on cell type). Write amplification means more erases per logical write, wearing out cells faster.

With TRIM:

- The file system informs the SSD immediately when blocks are freed
- The SSD marks those pages as invalid in its Flash Translation Layer (FTL)
- Garbage collection is more efficient — it doesn't copy invalid pages
- Write amplification is minimized
- SSD performance stays consistent over time
- SSD lifespan is extended
  :::

---

## Key Takeaways

- Free space management tracks which disk blocks are available for allocation using various data structures.
- **Bit vectors (bitmaps)** use one bit per block — compact (32 MB for a 1 TB disk), efficient, and widely used in production file systems (ext4, NTFS).
- **Linked lists** chain free blocks together — zero overhead but terrible performance for finding contiguous space.
- **Grouping** stores many free block addresses per node — better batch allocation than simple linked lists.
- **Counting** stores `(start, count)` pairs — highly efficient when free blocks are clustered.
- **ZFS space maps** use append-only logs per metaslab — ideal for very large disks (petabyte scale).
- **TRIM/DISCARD** informs SSDs about freed blocks, preventing write amplification and maintaining performance and longevity.
- **Fragmentation prevention** strategies include delayed allocation, block group locality, pre-allocation, and copy-on-write — all reducing the need for expensive defragmentation.
- The best method depends on disk size, access patterns, and whether the storage is HDD or SSD.
