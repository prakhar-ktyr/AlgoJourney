---
title: Allocation Methods
---

# Allocation Methods

When a file is created and grows, the operating system must decide **which disk blocks** to assign to that file. This fundamental decision — the **allocation method** — directly impacts performance, fragmentation, and the complexity of the file system implementation. There are three classic approaches: contiguous, linked, and indexed allocation. Each makes a different tradeoff between simplicity, performance, and flexibility. Modern file systems often combine ideas from all three.

---

## The Allocation Problem

Consider a disk with blocks numbered 0 through N-1:

```text
  Disk Blocks:
  ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
  │  0 │  1 │  2 │  3 │  4 │  5 │  6 │  7 │  8 │  9 │ 10 │ 11 │
  └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘

  Files need to be stored:
  - File A: 3 blocks
  - File B: 2 blocks
  - File C: 4 blocks

  Question: Which blocks should each file use?
```

The answer depends on the allocation method. Each method stores different metadata in the directory entry and the file control block.

| Allocation Method | Directory Entry Stores    | Key Idea                                  |
| ----------------- | ------------------------- | ----------------------------------------- |
| **Contiguous**    | Start block + length      | File occupies consecutive blocks          |
| **Linked**        | Start block (+ end block) | Each block has a pointer to the next      |
| **Indexed**       | Index block number        | A separate block holds all block pointers |

---

## Contiguous Allocation

> In **contiguous allocation**, each file occupies a set of **contiguous (adjacent) blocks** on disk. The directory entry records just the starting block address and the number of blocks.

### Example

```text
  Directory:
  ┌──────────┬───────┬────────┐
  │ Filename │ Start │ Length │
  ├──────────┼───────┼────────┤
  │ File A   │   0   │   3    │
  │ File B   │   5   │   2    │
  │ File C   │   8   │   4    │
  └──────────┴───────┴────────┘

  Disk Layout:
  ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
  │ A  │ A  │ A  │free│free│ B  │ B  │free│ C  │ C  │ C  │ C  │
  │ 0  │ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │ 7  │ 8  │ 9  │ 10 │ 11 │
  └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

### Accessing Block _i_ of a File

To read logical block _i_ of a file starting at block _s_:

$$\text{Disk block} = s + i$$

This is a simple addition — **O(1) random access**!

### Advantages

| Advantage                       | Explanation                                        |
| ------------------------------- | -------------------------------------------------- |
| **Simple metadata**             | Only start + length needed                         |
| **Excellent sequential access** | Blocks are physically adjacent — minimal seek time |
| **Excellent random access**     | Direct calculation: block = start + offset         |
| **Minimal overhead**            | No pointers, no index blocks                       |

### Disadvantages

| Disadvantage                        | Explanation                                                   |
| ----------------------------------- | ------------------------------------------------------------- |
| **External fragmentation**          | Free space becomes scattered as files are created and deleted |
| **File growth is difficult**        | Cannot easily extend a file if adjacent blocks are occupied   |
| **Must know file size at creation** | Need to pre-allocate the right number of contiguous blocks    |
| **Compaction is expensive**         | Defragmentation requires moving large amounts of data         |

### External Fragmentation Example

```text
  Initial state (after some creates and deletes):
  ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
  │ A  │ A  │free│free│ B  │ B  │free│ C  │free│free│ D  │ D  │
  └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘

  Need to allocate File E with 4 blocks:
  Total free blocks = 5 (enough!)
  But largest contiguous chunk = 2 blocks (not enough!)
  → CANNOT allocate despite having sufficient total space

  After compaction (defragmentation):
  ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
  │ A  │ A  │ B  │ B  │ C  │ D  │ D  │free│free│free│free│free│
  └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
  Now File E can fit in blocks 7-10!
```

### Extent-Based Allocation

Modern file systems like **ext4** use a variation called **extent-based allocation**:

> An **extent** is a contiguous range of blocks described by `(start_block, length)`. A file can have multiple extents, combining the benefits of contiguous allocation with the flexibility to grow.

```text
  File with 3 extents:
  ┌─────────────────┬─────────────────┬─────────────────┐
  │ Extent 1        │ Extent 2        │ Extent 3        │
  │ Start: 100      │ Start: 500      │ Start: 800      │
  │ Length: 50       │ Length: 30      │ Length: 20       │
  └─────────────────┴─────────────────┴─────────────────┘
  Total: 100 blocks across 3 extents
  (Each extent is internally contiguous)
```

| Feature       | Pure Contiguous | Extent-Based                         |
| ------------- | --------------- | ------------------------------------ |
| Growth        | Cannot grow     | Add new extent                       |
| Fragmentation | High            | Moderate (per-extent)                |
| Random access | O(1)            | O(log e) where e = number of extents |
| Metadata      | 2 values        | 2 values per extent                  |

---

## Linked Allocation

> In **linked allocation**, each file is a **linked list of disk blocks**. Each block contains a pointer to the next block. The directory entry stores the first (and optionally last) block.

### Example

```text
  Directory:
  ┌──────────┬───────┬─────┐
  │ Filename │ Start │ End │
  ├──────────┼───────┼─────┤
  │ File A   │   2   │  11 │
  └──────────┴───────┴─────┘

  Disk Layout (File A uses blocks 2, 7, 5, 11):
  ┌────┬────┬────────┬────┬────┬────────┬────┬────────┬────┬────┬────┬────────┐
  │    │    │ A data │    │    │ A data │    │ A data │    │    │    │ A data │
  │ 0  │ 1  │ next→7 │ 3  │ 4  │ next→11│ 6  │ next→5 │ 8  │ 9  │10 │next→-1│
  └────┴────┴────────┴────┴────┴────────┴────┴────────┴────┴────┴────┴────────┘

  Traversal: 2 → 7 → 5 → 11 → END
```

```text
  Logical View of File A:

  Block 2          Block 7          Block 5          Block 11
  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
  │ data      │    │ data      │    │ data      │    │ data      │
  │           │    │           │    │           │    │           │
  │ next: 7 ──┼───►│ next: 5 ──┼───►│ next: 11──┼───►│ next: -1  │
  └───────────┘    └───────────┘    └───────────┘    └───────────┘
```

### Advantages

| Advantage                           | Explanation                                             |
| ----------------------------------- | ------------------------------------------------------- |
| **No external fragmentation**       | Any free block can be used; blocks need not be adjacent |
| **Files can grow easily**           | Just allocate a new block and link it to the end        |
| **No need to know size in advance** | File grows one block at a time                          |
| **Simple allocation**               | Take any free block                                     |

### Disadvantages

| Disadvantage         | Explanation                                                          |
| -------------------- | -------------------------------------------------------------------- |
| **No random access** | To reach block _i_, must traverse _i_ pointers — O(n)                |
| **Pointer overhead** | Each block loses space for the pointer (e.g., 4 bytes out of 4096)   |
| **Reliability risk** | A single corrupted pointer breaks the chain for the rest of the file |
| **Scattered blocks** | Blocks may be spread across the disk → heavy seeking                 |

### Pointer Space Overhead

With a 4 KB block and a 4-byte pointer:

$$\text{Usable data per block} = 4096 - 4 = 4092 \text{ bytes}$$

$$\text{Overhead} = \frac{4}{4096} \approx 0.1\%$$

Small overhead, but it means file block boundaries don't align with disk block boundaries — complicating code.

### FAT (File Allocation Table)

The **File Allocation Table** improves linked allocation by moving all the "next" pointers out of the data blocks and into a separate table in memory.

```text
  FAT (File Allocation Table)           Disk Data Blocks
  ┌───────┬───────────┐                 ┌────────────┐
  │ Block │ Next Block│                 │            │
  ├───────┼───────────┤                 │            │
  │   0   │   free    │                 │  Block 0   │
  │   1   │   free    │                 │  Block 1   │
  │   2   │     7     │ ← File A start │  Block 2: A data (full block!)│
  │   3   │   free    │                 │  Block 3   │
  │   4   │   free    │                 │  Block 4   │
  │   5   │    11     │                 │  Block 5: A data │
  │   6   │   free    │                 │  Block 6   │
  │   7   │     5     │                 │  Block 7: A data │
  │   8   │   free    │                 │  Block 8   │
  │   9   │   free    │                 │  Block 9   │
  │  10   │   free    │                 │  Block 10  │
  │  11   │    EOF    │ ← File A end    │  Block 11: A data │
  └───────┴───────────┘                 └────────────┘

  Traversal via FAT: entry[2]=7, entry[7]=5, entry[5]=11, entry[11]=EOF
  File A blocks: 2 → 7 → 5 → 11
```

### FAT Advantages over Basic Linked

| Feature            | Basic Linked                               | FAT                                         |
| ------------------ | ------------------------------------------ | ------------------------------------------- |
| **Random access**  | O(n) — traverse on disk                    | O(n) — traverse in RAM (much faster)        |
| **Data per block** | Block size − pointer size                  | Full block (no embedded pointers)           |
| **Reliability**    | Pointer in block — lost if block corrupted | FAT stored separately; can keep backup copy |

### FAT Variants

| FAT Type | Bits per Entry | Max Clusters | Max Volume Size |
| -------- | -------------- | ------------ | --------------- |
| FAT12    | 12             | 4,084        | ~16 MB          |
| FAT16    | 16             | 65,524       | ~2 GB           |
| FAT32    | 28 (of 32)     | 268,435,456  | ~2 TB           |
| exFAT    | 32             | ~4 billion   | ~128 PB         |

> [!NOTE]
> FAT32 is still widely used for USB drives, SD cards, and other removable media due to its simplicity and near-universal OS support.

---

## Indexed Allocation

> In **indexed allocation**, each file has its own **index block** — a dedicated block that stores pointers to all data blocks of the file. The directory entry points to the index block.

### Example

```text
  Directory:
  ┌──────────┬─────────────┐
  │ Filename │ Index Block  │
  ├──────────┼─────────────┤
  │ File A   │     3        │
  └──────────┴─────────────┘

  Index Block (Block 3):             Data Blocks:
  ┌────────────────────┐
  │ [0] → Block 8      │────────────► ┌──────────┐
  │ [1] → Block 2      │──────┐       │ Block 8  │ A data (logical 0)
  │ [2] → Block 11     │──┐   │       └──────────┘
  │ [3] → Block 5      │─┐│   │
  │ [4] → -1 (unused)  │ ││   └─────► ┌──────────┐
  │ ...                 │ ││           │ Block 2  │ A data (logical 1)
  └────────────────────┘ │ │           └──────────┘
                         │ │
                         │ └─────────► ┌──────────┐
                         │             │ Block 11 │ A data (logical 2)
                         │             └──────────┘
                         │
                         └───────────► ┌──────────┐
                                       │ Block 5  │ A data (logical 3)
                                       └──────────┘
```

### Accessing Block _i_ of a File

1. Read the index block from disk (or cache)
2. Look up entry `[i]` → get physical block number
3. Read that physical block

$$\text{Access time} = T_{\text{index\_read}} + T_{\text{data\_read}} = 2 \text{ disk reads (worst case)}$$

### Advantages

| Advantage                     | Explanation                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| **Supports random access**    | Read index block, jump to any entry — O(1) after loading index |
| **No external fragmentation** | Blocks can be anywhere on disk                                 |
| **Files can grow**            | Add pointers to the index block                                |

### Disadvantages

| Disadvantage             | Explanation                                         |
| ------------------------ | --------------------------------------------------- |
| **Index block overhead** | Even a 1-byte file needs an entire index block      |
| **Limited file size**    | A single index block can only hold so many pointers |
| **Wasted space**         | Small files waste most of the index block           |

### Index Block Size Limitation

With a 4 KB index block and 4-byte pointers:

$$\text{Max pointers per index block} = \frac{4096}{4} = 1024$$

$$\text{Max file size} = 1024 \times 4096 = 4 \text{ MB}$$

This is far too small! Solutions:

### Variations to Handle Large Files

| Variation               | Description                                                 | Max File Size (4KB blocks, 4B ptrs) |
| ----------------------- | ----------------------------------------------------------- | ----------------------------------- |
| **Linked index blocks** | Last entry in index block points to another index block     | Unlimited (but slow traversal)      |
| **Multilevel index**    | Index block points to other index blocks (like page tables) | 4 GB (2-level), 4 TB (3-level)      |
| **Combined scheme**     | Direct blocks + indirect blocks (UNIX inode)                | ~4 TB                               |

### Multilevel Index

```text
  Outer Index Block              Inner Index Blocks          Data Blocks
  ┌──────────────┐
  │ [0] ─────────┼──► ┌──────────┐
  │ [1] ─────────┼─┐  │ ptr → D0 │──► ┌────────┐
  │ [2] ...      │ │  │ ptr → D1 │    │ Data 0 │
  │              │ │  │ ...      │    └────────┘
  └──────────────┘ │  │ ptr → D  │
                   │  │      1023│
                   │  └──────────┘
                   │
                   └► ┌──────────┐
                      │ ptr → D  │──► ┌────────────┐
                      │      1024│    │ Data 1024  │
                      │ ptr → D  │    └────────────┘
                      │      1025│
                      │ ...      │
                      └──────────┘
```

### The UNIX Combined Scheme

The UNIX inode combines direct and indexed allocation (see Lesson 51 for the full inode structure):

```text
  ┌────────────────────────────────────────────────────────────┐
  │  12 direct block pointers     → Direct allocation (fast)  │
  │  1 single indirect pointer    → 1-level indexed           │
  │  1 double indirect pointer    → 2-level indexed           │
  │  1 triple indirect pointer    → 3-level indexed           │
  └────────────────────────────────────────────────────────────┘

  Small files (≤ 48 KB): Only direct pointers used — zero index overhead!
  Medium files (≤ ~4 MB): Direct + single indirect
  Large files (≤ ~4 GB): Direct + single + double indirect
  Very large files (≤ ~4 TB): All four levels
```

> [!TIP]
> The combined scheme is elegant because most files are small (< 48 KB), so they use only direct blocks — no index overhead at all. The expensive multi-level indexing kicks in only for the rare large files.

---

## Comprehensive Comparison

| Property                   | Contiguous                     | Linked                          | Indexed                          |
| -------------------------- | ------------------------------ | ------------------------------- | -------------------------------- |
| **Directory entry**        | (start, length)                | (start, end)                    | (index block)                    |
| **Sequential access**      | Excellent                      | Good (follow pointers)          | Good (read index, then blocks)   |
| **Random access**          | Excellent — O(1)               | Poor — O(n)                     | Good — O(1) with index in memory |
| **External fragmentation** | Yes (severe)                   | No                              | No                               |
| **Internal fragmentation** | Last block only                | Last block only                 | Last block + index block waste   |
| **Space overhead**         | None                           | Pointer per block (~0.1%)       | Index block(s)                   |
| **File growth**            | Difficult (need adjacent free) | Easy (append to list)           | Easy (add to index)              |
| **Max file size**          | Limited by contiguous space    | Unlimited (linked list)         | Limited by index block capacity  |
| **Reliability**            | Lose start → lose file         | Broken link → lose rest of file | Lose index → lose mapping        |
| **Real-world use**         | CD-ROM (ISO 9660)              | FAT file system                 | UNIX/ext4 inode, NTFS            |

---

## Performance Analysis

### Sequential Read of an Entire File (n blocks)

| Method         | Disk Operations                  | Seek Pattern                      |
| -------------- | -------------------------------- | --------------------------------- |
| **Contiguous** | n reads                          | Minimal seeking (adjacent blocks) |
| **Linked**     | n reads                          | Potentially random seeking        |
| **Indexed**    | 1 (index) + n (data) = n+1 reads | Random seeking for data blocks    |
| **FAT**        | n reads (FAT traversal in RAM)   | Random seeking for data blocks    |

### Random Read of Block _i_

| Method         | Disk Operations               | Calculation                              |
| -------------- | ----------------------------- | ---------------------------------------- |
| **Contiguous** | 1 read                        | start + i → direct access                |
| **Linked**     | i+1 reads                     | Must traverse i pointers on disk         |
| **Indexed**    | 2 reads                       | 1 index read + 1 data read               |
| **FAT**        | 1 read (i FAT lookups in RAM) | Traverse FAT in memory, then 1 disk read |

### Space Utilization

For a file using $n$ blocks with block size $B$ and pointer size $P$:

| Method         | Usable data per block               | Total usable data                         |
| -------------- | ----------------------------------- | ----------------------------------------- |
| **Contiguous** | $B$                                 | $n \times B$                              |
| **Linked**     | $B - P$                             | $n \times (B - P)$                        |
| **Indexed**    | $B$ (data blocks), 0 (index blocks) | $(n-k) \times B$ where $k$ = index blocks |
| **FAT**        | $B$                                 | $n \times B$ (FAT stored separately)      |

> _"There is no single best allocation strategy. The choice depends on the expected file access patterns and the characteristics of the storage device."_ — William Stallings, _Operating Systems: Internals and Design Principles_

---

## Allocation in Practice

| File System     | Allocation Method  | Details                                              |
| --------------- | ------------------ | ---------------------------------------------------- |
| **FAT12/16/32** | Linked (with FAT)  | FAT table separates pointers from data               |
| **ext2/ext3**   | Indexed (inode)    | 12 direct + 3 levels of indirect blocks              |
| **ext4**        | Indexed + Extents  | Extent tree replaces indirect blocks for efficiency  |
| **NTFS**        | Indexed (MFT runs) | MFT stores run lists: (start_cluster, length) pairs  |
| **ISO 9660**    | Contiguous         | CD-ROM: files written once, no fragmentation concern |
| **APFS**        | Extent-based + COW | Copy-on-write with extent-based allocation           |
| **ZFS**         | Dynamic (DVAs)     | Variable-sized blocks, copy-on-write                 |

---

## Try It Yourself

**Exercise 1:** A disk has 20 blocks (0–19). Files A (3 blocks), B (2 blocks), and C (4 blocks) are allocated contiguously starting at blocks 0, 5, and 10 respectively. File B is deleted. Can a new file D (4 blocks) be allocated contiguously? What about with linked allocation?

:::details Solution
After deleting File B, the disk looks like:

```text
┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
│ A  │ A  │ A  │free│free│free│free│free│free│free│ C  │ C  │ C  │ C  │free│free│free│free│free│free│
│ 0  │ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │ 7  │ 8  │ 9  │ 10 │ 11 │ 12 │ 13 │ 14 │ 15 │ 16 │ 17 │ 18 │ 19 │
└────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

**Contiguous allocation for D (4 blocks):** YES! Blocks 3–6 or 5–8 or 6–9 or 14–17 etc. There are multiple contiguous runs large enough.

**Linked allocation for D (4 blocks):** YES! Any 4 free blocks can be used (e.g., 3, 5, 7, 14) linked together. Linked allocation always works if enough total free blocks exist.

In this case, both methods work. But if the free space were more fragmented (e.g., free blocks at 3, 7, 14, 18 only), contiguous would fail while linked would succeed.
:::

**Exercise 2:** A FAT-based file system has 4 KB blocks and a 16-bit FAT. How much space does the FAT occupy? What is the maximum volume size?

:::details Solution
**FAT size:**
With FAT16, each entry is 2 bytes. Maximum clusters = $2^{16} = 65{,}536$.

FAT size = $65{,}536 \times 2 = 131{,}072$ bytes = **128 KB**

**Maximum volume size:**
$65{,}536 \times 4{,}096 = 268{,}435{,}456$ bytes = **256 MB**

(In practice, FAT16 supports up to ~2 GB with 32 KB clusters, but with 4 KB clusters the limit is 256 MB.)
:::

**Exercise 3:** Compare the number of disk I/O operations needed to read the 500th block of a file using (a) contiguous, (b) linked, and (c) indexed allocation (single-level index in memory).

:::details Solution
**(a) Contiguous allocation:**

- Compute: disk_block = start + 500
- Read 1 block from disk
- **Total: 1 disk I/O**

**(b) Linked allocation:**

- Must traverse blocks 0 through 499, reading each one to follow its pointer
- Then read block 500
- **Total: 501 disk I/Os** (extremely slow!)

**(c) Indexed allocation (index block already in memory):**

- Look up entry [500] in the index block (in RAM — no disk I/O)
- Read the data block pointed to by entry [500]
- **Total: 1 disk I/O** (if index is cached; 2 if index must be read from disk)

This dramatically illustrates why linked allocation is unsuitable for random-access workloads.
:::

---

## Key Takeaways

- **Contiguous allocation** assigns adjacent blocks to each file — excellent performance but suffers from external fragmentation and cannot grow files easily.
- **Extent-based allocation** (ext4) extends contiguous allocation by allowing multiple contiguous extents per file, balancing performance and flexibility.
- **Linked allocation** chains blocks via embedded pointers — eliminates fragmentation but destroys random access performance (O(n)).
- **FAT** improves linked allocation by centralizing pointers in a table loaded into RAM, enabling faster traversal.
- **Indexed allocation** uses a separate index block per file — provides O(1) random access (once the index is loaded) at the cost of index block overhead.
- The **UNIX inode** uses a combined scheme: 12 direct blocks for small files and up to triple indirect blocks for files up to ~4 TB.
- Most real-world file systems **combine approaches**: ext4 uses extents (contiguous within extents) with B-tree indexing; NTFS uses MFT run lists (extents) with B+ tree directories.
- The best allocation method depends on the workload: sequential access favors contiguous; random access favors indexed; simple removable media favors FAT.
