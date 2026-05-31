---
title: File System Implementation
section: "File Systems"
---

# File System Implementation

Understanding how a file system is **implemented** — the on-disk structures that persist data across reboots and the in-memory structures that make file access fast — is essential for any systems programmer. In this lesson, we dissect the layered architecture of a file system, trace the journey of a file from creation through reading, explore the UNIX inode structure with its ingenious multi-level block pointers, and compare modern file systems like ext4, NTFS, APFS, and ZFS.

---

## On-Disk Structures

A formatted disk partition contains several critical regions, each serving a distinct purpose.

### Disk Layout Overview

```text
  ┌──────────┬─────────────┬──────────────┬──────────────────┬─────────────────┐
  │  Boot    │  Superblock  │  Inode       │  Data Block      │  Data Block     │
  │  Block   │  (Volume     │  Table       │  Bitmap          │  Region         │
  │  (MBR/   │  Control     │              │  + Inode Bitmap  │                 │
  │  VBR)    │  Block)      │              │                  │                 │
  └──────────┴─────────────┴──────────────┴──────────────────┴─────────────────┘
   Sector 0    Block 1       Blocks 2-N     Blocks N+1...      Blocks M...
```

### On-Disk Structure Details

| Structure                | UNIX Name                         | NTFS Name                      | Purpose                                                               |
| ------------------------ | --------------------------------- | ------------------------------ | --------------------------------------------------------------------- |
| **Boot control block**   | Boot block / VBR                  | Volume Boot Record             | Code to bootstrap the OS from this volume                             |
| **Volume control block** | Superblock                        | Master File Table (MFT) header | File system metadata: size, block count, free block count, block size |
| **Directory structure**  | Directory files (list of dirents) | B+ tree index in MFT           | Maps file names to inode numbers / MFT entries                        |
| **File control block**   | Inode                             | MFT Record                     | Per-file metadata: size, permissions, block pointers                  |
| **Data blocks**          | Data blocks                       | Clusters                       | Actual file content                                                   |

### The Superblock

The superblock is the most critical on-disk structure. If it is corrupted, the entire file system may be unreadable.

| Superblock Field      | Description                      | Example Value      |
| --------------------- | -------------------------------- | ------------------ |
| `s_magic`             | Magic number identifying FS type | `0xEF53` (ext4)    |
| `s_inodes_count`      | Total number of inodes           | 6,553,600          |
| `s_blocks_count`      | Total number of data blocks      | 26,214,400         |
| `s_free_blocks_count` | Number of free blocks            | 18,742,118         |
| `s_free_inodes_count` | Number of free inodes            | 6,420,033          |
| `s_block_size`        | Block size in bytes              | 4096               |
| `s_blocks_per_group`  | Blocks per block group           | 32,768             |
| `s_mtime`             | Last mount time                  | `2025-06-01 10:00` |
| `s_state`             | FS state (clean/error)           | `EXT4_VALID_FS`    |

> [!IMPORTANT]
> ext4 keeps **backup copies** of the superblock at the start of certain block groups (groups 0, 1, 3, 5, 7, ...). If the primary superblock is corrupted, recovery tools can use a backup.

---

## In-Memory Structures

When the OS boots and mounts file systems, it loads critical metadata into RAM for fast access.

```text
  ┌──────────────────┐      ┌──────────────────────┐
  │  Mount Table     │      │  Directory Cache      │
  │ ┌──────────────┐ │      │     (dcache)          │
  │ │ / → ext4 dev │ │      │ ┌──────────────────┐  │
  │ │/home→ext4 dev│ │      │ │ "/" → inode 2     │  │
  │ │/tmp → tmpfs  │ │      │ │ "home" → inode 45 │  │
  │ └──────────────┘ │      │ │ "alice" → in 1001 │  │
  └──────────────────┘      │ └──────────────────┘  │
                            └──────────────────────┘
  ┌──────────────────────────────────────────────────────┐
  │            System-Wide Open File Table               │
  │  ┌─────┬──────────┬────────┬──────────┬───────────┐  │
  │  │ Idx │ Offset   │ Flags  │ RefCount │ Inode Ptr │  │
  │  ├─────┼──────────┼────────┼──────────┼───────────┤  │
  │  │  0  │ 4096     │ O_RDWR │    2     │ → in 3078 │  │
  │  │  1  │ 0        │ O_RDONLY│   1     │ → in 1050 │  │
  │  │  2  │ 8192     │ O_WRONLY│   1     │ → in 3078 │  │
  │  └─────┴──────────┴────────┴──────────┴───────────┘  │
  └──────────────────────────────────────────────────────┘
          ▲                    ▲
          │                    │
  ┌───────┴────────┐  ┌───────┴────────┐
  │ Per-Process     │  │ Per-Process     │
  │ Open File Table │  │ Open File Table │
  │ (Process A)     │  │ (Process B)     │
  ├────────────────┤  ├────────────────┤
  │ fd 0 → syswide 0│ │ fd 0 → syswide 0│
  │ fd 1 → syswide 1│ │ fd 3 → syswide 2│
  └────────────────┘  └────────────────┘
```

### In-Memory Structure Summary

| Structure                       | Contents                                                  | Purpose                                             |
| ------------------------------- | --------------------------------------------------------- | --------------------------------------------------- |
| **Mount table**                 | List of mounted file systems and their mount points       | Determine which FS handles each path                |
| **Directory cache (dcache)**    | Recently resolved path components → inode mappings        | Avoid repeated directory lookups                    |
| **Inode cache**                 | Recently accessed inodes loaded from disk                 | Avoid repeated inode reads                          |
| **System-wide open file table** | One entry per `open()` call: offset, flags, inode pointer | Track all open files across all processes           |
| **Per-process open file table** | Maps fd numbers to system-wide table entries              | Give each process its own file descriptor namespace |
| **Buffer cache / page cache**   | Cached data blocks from disk                              | Speed up read/write by serving from RAM             |

---

## File Operations — Step by Step

### Creating a File: `open("new.txt", O_CREAT | O_WRONLY, 0644)`

```text
Step 1: Resolve parent directory path
        - Walk dcache/directory to find parent dir's inode

Step 2: Allocate a new inode
        - Scan inode bitmap for a free inode → mark as used
        - Initialize inode: permissions=0644, size=0, links=1

Step 3: Create directory entry
        - Add ("new.txt", inode_num) to parent directory's data

Step 4: Set up in-memory structures
        - Add entry to system-wide open file table (offset=0, flags=WRONLY)
        - Add entry to per-process table → return fd to user

Step 5: Return file descriptor to the calling process
```

### Opening an Existing File: `open("data.txt", O_RDONLY)`

```text
Step 1: Path resolution
        - Start at root (or CWD for relative paths)
        - For each component: look up name in directory → get inode number
        - Check dcache first; read from disk if cache miss

Step 2: Permission check
        - Compare process's UID/GID against inode's permissions
        - Deny access if insufficient permissions

Step 3: Load inode into inode cache (if not already there)

Step 4: Create system-wide open file table entry
        - Set offset = 0, mode = O_RDONLY, inode pointer

Step 5: Create per-process table entry
        - Find lowest unused fd → point to system-wide entry
        - Return fd to process
```

### Reading a File: `read(fd, buffer, 100)`

```text
Step 1: Look up fd in per-process table → system-wide entry

Step 2: Get current offset from system-wide entry (e.g., offset = 0)

Step 3: Use inode's block pointers to find which disk block
        contains bytes at offset 0
        - offset 0, block_size 4096 → logical block 0
        - Inode's i_block[0] → physical block 8492

Step 4: Check page cache for block 8492
        - If cached: copy 100 bytes to user buffer (fast!)
        - If not cached: schedule disk I/O, load block into cache, then copy

Step 5: Update file offset: 0 + 100 = 100

Step 6: Return 100 (number of bytes read)
```

---

## UNIX Inode Structure

The **inode** (index node) is the heart of the UNIX file system. It stores all metadata about a file and provides the mapping from logical file blocks to physical disk blocks.

### Inode Metadata Fields

| Field           | Size (typical) | Description                               |
| --------------- | -------------- | ----------------------------------------- |
| `i_mode`        | 2 bytes        | File type + permissions (rwxrwxrwx)       |
| `i_uid`         | 4 bytes        | Owner user ID                             |
| `i_gid`         | 4 bytes        | Owner group ID                            |
| `i_size`        | 8 bytes        | File size in bytes                        |
| `i_atime`       | 4 bytes        | Last access timestamp                     |
| `i_mtime`       | 4 bytes        | Last modification timestamp               |
| `i_ctime`       | 4 bytes        | Last inode change timestamp               |
| `i_links_count` | 2 bytes        | Number of hard links                      |
| `i_blocks`      | 4 bytes        | Number of 512-byte blocks allocated       |
| `i_flags`       | 4 bytes        | File flags (immutable, append-only, etc.) |
| `i_block[15]`   | 60 bytes       | Block pointers (see below)                |

### Block Pointer Structure

The `i_block[15]` array is the key to mapping file content to disk blocks:

```text
  Inode
  ┌─────────────────┐
  │   i_mode        │
  │   i_uid, i_gid  │
  │   i_size        │
  │   timestamps    │
  │   ...           │
  ├─────────────────┤
  │ i_block[0]  ────┼──► Data Block 0         ┐
  │ i_block[1]  ────┼──► Data Block 1         │
  │ i_block[2]  ────┼──► Data Block 2         │ 12 direct blocks
  │   ...           │      ...                │ (48 KB with 4KB blocks)
  │ i_block[11] ────┼──► Data Block 11        ┘
  ├─────────────────┤
  │ i_block[12] ────┼──► ┌─────────────┐     Single Indirect
  │  (single        │    │ ptr → blk 12│     (1024 more blocks
  │   indirect)     │    │ ptr → blk 13│      = 4 MB)
  │                 │    │ ...         │
  │                 │    │ ptr → blk   │
  │                 │    │       1035  │
  │                 │    └─────────────┘
  ├─────────────────┤
  │ i_block[13] ────┼──► ┌─────────────┐     Double Indirect
  │  (double        │    │ ptr → ──────┼──►  ┌────────────┐
  │   indirect)     │    │ ptr → ──────┼──►  │ 1024 ptrs  │
  │                 │    │ ...         │     │ to data    │
  │                 │    │ (1024 ptrs  │     │ blocks     │
  │                 │    │  to indirect│     └────────────┘
  │                 │    │  blocks)    │
  │                 │    └─────────────┘     (1024² = 1M blocks = 4 GB)
  ├─────────────────┤
  │ i_block[14] ────┼──► ┌─────────────┐     Triple Indirect
  │  (triple        │    │ ptr → ──────┼──►  (points to 1024
  │   indirect)     │    │ ptr → ...   │      double indirect blocks)
  │                 │    └─────────────┘     (1024³ = 1G blocks = 4 TB)
  └─────────────────┘
```

### Maximum File Size Calculation

With 4 KB block size and 4-byte block pointers:

- Pointers per block: $P = 4096 / 4 = 1024$

$$\text{Max file size} = (12 + P + P^2 + P^3) \times B$$

$$= (12 + 1024 + 1024^2 + 1024^3) \times 4096$$

$$= (12 + 1{,}024 + 1{,}048{,}576 + 1{,}073{,}741{,}824) \times 4{,}096$$

$$= 1{,}074{,}791{,}436 \times 4{,}096$$

$$\approx 4.004 \text{ TB}$$

| Level           | Blocks Addressable | Data Capacity (4 KB blocks) |
| --------------- | ------------------ | --------------------------- |
| Direct (12)     | 12                 | 48 KB                       |
| Single indirect | 1,024              | 4 MB                        |
| Double indirect | 1,048,576          | 4 GB                        |
| Triple indirect | 1,073,741,824      | 4 TB                        |
| **Total**       | **~1,074,791,436** | **~4 TB**                   |

> [!NOTE]
> Modern ext4 uses **extents** instead of the traditional indirect block scheme. An extent describes a contiguous range of blocks with a single `(start_block, length)` tuple, greatly reducing metadata overhead for large files.

---

## NTFS Overview

The **New Technology File System** (NTFS) takes a fundamentally different approach from UNIX file systems.

### Master File Table (MFT)

The MFT is a table where **every file and directory** is represented by at least one 1 KB record.

```text
  MFT (Master File Table)
  ┌────────────────────────────────────────────┐
  │ Record 0: $MFT (the MFT itself)            │
  │ Record 1: $MFTMirr (MFT mirror)            │
  │ Record 2: $LogFile (journal)                │
  │ Record 3: $Volume (volume info)             │
  │ Record 4: $AttrDef (attribute definitions)  │
  │ Record 5: \ (root directory)                │
  │ Record 6: $Bitmap (block allocation)        │
  │ Record 7: $Boot (boot sector)               │
  │ ...                                         │
  │ Record N: user_file.txt                     │
  └────────────────────────────────────────────┘
```

### Key NTFS Features

| Feature                  | Description                                        |
| ------------------------ | -------------------------------------------------- |
| **Everything is a file** | Even metadata ($MFT, $LogFile) is stored as files  |
| **Attribute-based**      | Files consist of attributes (DATA, FILENAME, etc.) |
| **Resident data**        | Small files stored directly in the MFT record      |
| **B+ tree directories**  | Directories use B+ trees for fast lookup           |
| **Data streams**         | A file can have multiple named data streams        |
| **Journaling**           | $LogFile provides transaction-based recovery       |
| **Compression**          | Per-file LZNT1 compression                         |
| **Encryption**           | Per-file EFS encryption                            |

---

## ext4 Features

ext4 is the most widely used Linux file system, evolving from ext2 → ext3 → ext4.

| Feature                      | ext2  | ext3  | ext4           |
| ---------------------------- | ----- | ----- | -------------- |
| **Journaling**               | No    | Yes   | Yes            |
| **Max file size**            | 2 TB  | 2 TB  | 16 TB          |
| **Max volume size**          | 32 TB | 32 TB | 1 EB (exabyte) |
| **Extents**                  | No    | No    | Yes            |
| **Delayed allocation**       | No    | No    | Yes            |
| **Nanosecond timestamps**    | No    | No    | Yes            |
| **Online defragmentation**   | No    | No    | Yes            |
| **Multi-block allocator**    | No    | No    | Yes            |
| **Persistent preallocation** | No    | No    | Yes            |

### Extents vs Indirect Blocks

| Property                   | Indirect Blocks (ext2/3)             | Extents (ext4)                    |
| -------------------------- | ------------------------------------ | --------------------------------- |
| **Metadata per range**     | One pointer per block                | One extent per contiguous range   |
| **Large file overhead**    | Proportional to block count          | Proportional to number of extents |
| **A 1 GB contiguous file** | 262,144 pointers (+ indirect blocks) | 1 extent: `(start, 262144)`       |
| **Tree structure**         | Linear chain of indirect blocks      | Extent tree (B+ tree like)        |

### Delayed Allocation

Instead of allocating disk blocks immediately when `write()` is called, ext4 **delays allocation** until data must actually be flushed to disk:

```text
Traditional:
  write() → allocate block → buffer data → flush later

Delayed allocation:
  write() → buffer data (no allocation yet) → flush → allocate blocks
                                                        └── allocator sees full request,
                                                            can choose contiguous blocks
```

Benefits:

- Better block placement (allocator has more context)
- Reduced fragmentation
- Batch allocation is more efficient

> [!WARNING]
> Delayed allocation means data exists only in memory until a flush. If the system crashes before flushing, buffered data is lost. ext4 mitigates this with careful ordering and journal commits.

---

## File System Comparison

| Feature             | ext4                   | NTFS            | APFS               | ZFS                   |
| ------------------- | ---------------------- | --------------- | ------------------ | --------------------- |
| **OS**              | Linux                  | Windows         | macOS/iOS          | Cross-platform        |
| **Max file size**   | 16 TB                  | 16 EB           | 8 EB               | 16 EB                 |
| **Max volume size** | 1 EB                   | 16 EB           | 8 EB               | 256 ZB                |
| **Journaling**      | Yes (metadata)         | Yes (metadata)  | No (COW instead)   | No (COW + ZIL)        |
| **Copy-on-Write**   | No                     | No              | Yes                | Yes                   |
| **Snapshots**       | No (use LVM)           | Shadow copies   | Yes (native)       | Yes (native)          |
| **Checksums**       | Metadata only          | No              | Yes (metadata)     | Yes (data + metadata) |
| **Compression**     | No                     | Per-file        | Yes (transparent)  | Yes (transparent)     |
| **Encryption**      | dm-crypt (external)    | EFS / BitLocker | Yes (native)       | Yes (native)          |
| **Deduplication**   | No                     | Yes (server)    | No (clone-based)   | Yes                   |
| **Allocation**      | Extents                | Runs (clusters) | Extents + COW      | Variable blocks       |
| **B-tree usage**    | Extent tree, dir htree | B+ tree dirs    | B+ tree everything | DMU (block-level)     |
| **Self-healing**    | No                     | No              | Limited            | Yes (scrub + mirrors) |

---

## Try It Yourself

**Exercise 1:** Calculate the maximum file size for a UNIX-like file system with 8 KB block size and 8-byte block pointers. How does it compare to the 4 KB / 4-byte case?

:::details Solution
With 8 KB block size ($B = 8192$) and 8-byte pointers:

Pointers per block: $P = 8192 / 8 = 1024$

$$\text{Max size} = (12 + 1024 + 1024^2 + 1024^3) \times 8192$$

$$= 1{,}074{,}791{,}436 \times 8{,}192$$

$$\approx 8.008 \text{ TB}$$

Comparison:

- 4 KB blocks / 4-byte pointers: ~4 TB
- 8 KB blocks / 8-byte pointers: ~8 TB

The number of addressable blocks is the same (since $P = 1024$ in both cases), but each block is twice as large, doubling the maximum file size.
:::

**Exercise 2:** A file system has 4 KB blocks. A file is 100 KB in size. How many disk accesses are needed to read byte 50,000 of this file using the inode-based indirect block scheme?

:::details Solution
Block size = 4096 bytes. Byte 50,000 is in logical block $\lfloor 50000 / 4096 \rfloor = 12$ (0-indexed).

Block 12 is beyond the 12 direct blocks (indices 0–11), so it's the **first block pointed to by the single indirect block**.

Disk accesses:

1. **Read the inode** (to get i_block[12] — the single indirect block pointer)
2. **Read the single indirect block** (to get the pointer to data block 12)
3. **Read data block 12** (to get the actual data containing byte 50,000)

**Total: 3 disk accesses** (assuming a cold cache).

If the inode is cached (likely for an open file): **2 disk accesses**.
:::

**Exercise 3:** Why does ext4 use extents instead of indirect blocks? Give a concrete example showing the metadata savings.

:::details Solution
Consider a 1 GB contiguous file on a file system with 4 KB blocks.

**Number of blocks:** $1{,}073{,}741{,}824 / 4{,}096 = 262{,}144$ blocks

**Indirect blocks approach:**

- 12 direct: 12 blocks
- Single indirect: 1 block of 1024 pointers
- Double indirect: 1 + 256 indirect blocks = 257 blocks of pointers
- Remaining blocks through double indirect: $262{,}144 - 12 - 1{,}024 = 261{,}108$
- Indirect block overhead: ~257 pointer blocks × 4 KB = ~1 MB of metadata

**Extents approach:**

- The file is contiguous → **1 extent**: `(start_block=X, length=262144)`
- Extent metadata: about 12 bytes

**Savings:** From ~1 MB of metadata down to 12 bytes — a reduction of ~99.999%!

For non-contiguous files, the savings are smaller but still significant. ext4's extent tree (similar to a B+ tree) efficiently manages files with many non-contiguous extents.
:::

---

## Key Takeaways

- The **on-disk layout** consists of the boot block, superblock, inode/MFT table, bitmaps, and data blocks.
- The **superblock** stores global file system metadata; its corruption can destroy the entire file system, so backups are kept.
- **In-memory structures** — mount table, dcache, inode cache, open file tables, and page cache — make file operations fast by avoiding repeated disk I/O.
- File **creation** allocates an inode and directory entry; **opening** loads the inode into memory and creates open file table entries; **reading** translates file offsets to disk blocks via the inode's block pointers.
- The UNIX **inode** uses 12 direct, single, double, and triple indirect block pointers, supporting files up to ~4 TB with 4 KB blocks.
- **NTFS** uses the Master File Table (MFT) with attribute-based records, B+ tree directories, and named data streams.
- **ext4** improves on ext3 with extents (replacing indirect blocks), delayed allocation, and nanosecond timestamps.
- Modern file systems like **APFS** and **ZFS** use copy-on-write instead of journaling, enabling native snapshots and self-healing with checksums.
