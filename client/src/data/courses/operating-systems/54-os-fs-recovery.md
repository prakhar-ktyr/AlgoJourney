---
title: File System Recovery & Journaling
---

# File System Recovery & Journaling

File systems operate under a constant threat: **at any moment**, power can fail, the OS can crash, or hardware can malfunction — potentially leaving the file system in an **inconsistent state**. A half-completed write might update a directory entry but not the inode, or allocate a data block but not record it in the bitmap. In this lesson, we explore the techniques that file systems use to detect, prevent, and recover from such inconsistencies — from traditional consistency checkers like `fsck`, through journaling (write-ahead logging), to modern copy-on-write and log-structured designs.

---

## Why Recovery Is Needed

File system operations are not atomic — they involve multiple disk writes that must all complete to maintain consistency. A single "create a file" operation requires:

1. Allocate an inode (update inode bitmap)
2. Initialize the inode (write inode data)
3. Add a directory entry (update directory block)
4. Update the data block bitmap (if writing data)
5. Write data blocks
6. Update the superblock (free counts)

If the system crashes between any of these steps, the file system is left in an **inconsistent state**.

### Types of Inconsistency

| Inconsistency                | Description                                           | Example                                                 |
| ---------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| **Block leak**               | Block marked used in bitmap but no file references it | Inode written, directory entry not written              |
| **Double allocation**        | Two files claim the same block                        | Block pointer written to new file before freed from old |
| **Orphan inode**             | Inode allocated but no directory entry points to it   | Directory entry deleted, inode not freed                |
| **Dangling directory entry** | Directory points to freed/invalid inode               | Inode freed, directory entry not removed                |
| **Incorrect free count**     | Superblock says more/fewer free blocks than reality   | Superblock not updated after allocation                 |
| **Corrupted data**           | File data doesn't match what was intended             | Data write interrupted mid-block                        |

```text
  Normal operation (all steps complete):

  Step 1          Step 2          Step 3          Step 4
  Allocate ──────► Init ──────► Add dir ──────► Update
  inode           inode         entry           bitmap
     ✓               ✓              ✓              ✓
                                                CONSISTENT ✓

  Crash between steps 2 and 3:

  Step 1          Step 2          Step 3          Step 4
  Allocate ──────► Init ──────► ✗ CRASH
  inode           inode
     ✓               ✓
                              INCONSISTENT! ✗
                              (Orphan inode: allocated but unreachable)
```

---

## Consistency Checking

### fsck (UNIX) and chkdsk (Windows)

> **fsck** (file system check) and **chkdsk** (check disk) are post-crash recovery tools that scan the entire file system to detect and repair inconsistencies.

#### Block Consistency Check

The checker builds two tables by scanning the entire disk:

```text
  Pass 1: Count how many times each block appears in files
  Pass 2: Count how many times each block appears in the free list/bitmap

  For each block, the counts should satisfy:

  ┌───────────────────────────────────────────────────────┐
  │  in_use_count + free_count = 1   (for every block)    │
  └───────────────────────────────────────────────────────┘
```

| in_use | free | Status                                           | Action                              |
| ------ | ---- | ------------------------------------------------ | ----------------------------------- |
| 0      | 1    | OK — block is free                               | None                                |
| 1      | 0    | OK — block is in use                             | None                                |
| 0      | 0    | **Missing block** — not in any file or free list | Add to free list                    |
| 1      | 1    | **Block in file AND free list**                  | Remove from free list               |
| 2+     | 0    | **Duplicate allocation**                         | Copy block, assign copy to one file |

#### File (Inode) Consistency Check

```text
  For each inode:
    - Count directory entries pointing to it (actual link count)
    - Compare with inode's stored link count

  ┌──────────────────────────────────────────────────────────┐
  │  actual_links == inode.i_links_count  (must be equal)     │
  └──────────────────────────────────────────────────────────┘
```

| Actual Links | Stored Links | Problem                                                    | Action                               |
| ------------ | ------------ | ---------------------------------------------------------- | ------------------------------------ |
| 3            | 3            | OK                                                         | None                                 |
| 2            | 3            | **Stored count too high**                                  | Set to 2 (harmless but wastes inode) |
| 3            | 2            | **Stored count too low** — inode may be prematurely freed! | Set to 3 (critical fix)              |
| 0            | 1+           | **Orphan inode** — allocated but unreachable               | Move to `lost+found/`                |

### Problems with fsck/chkdsk

| Problem                    | Impact                                                        |
| -------------------------- | ------------------------------------------------------------- |
| **Extremely slow**         | Must scan every inode and every block — hours for large disks |
| **Requires unmounted FS**  | Cannot run on a mounted, active file system safely            |
| **May lose data**          | Cannot always determine correct state; may discard files      |
| **Doesn't prevent damage** | Only detects and repairs — the crash already happened         |

> [!WARNING]
> On a 10 TB file system with 4 KB blocks, fsck must examine ~2.5 billion blocks and millions of inodes. This can take **hours** — completely unacceptable for servers requiring high availability.

---

## Journaling (Write-Ahead Logging)

> **Journaling** prevents inconsistency by writing a description of each file system operation to a **journal (log)** before performing the actual disk updates. If a crash occurs, the journal is replayed on recovery to complete or undo the interrupted operations.

This is the same technique used by databases — called **Write-Ahead Logging (WAL)**.

### How Journaling Works

```text
  Normal Operation:

  1. Write transaction to journal    2. Write actual data/metadata    3. Mark journal
     (BEGIN, changes, END)              to their final locations         entry as complete

  ┌──────────────────────┐         ┌──────────────────────┐        ┌────────────────┐
  │ JOURNAL              │         │ FILE SYSTEM           │        │ JOURNAL        │
  │ ┌──────────────────┐ │         │                      │        │ ┌────────────┐ │
  │ │ TXN BEGIN   #42  │ │         │  inode table updated │        │ │ TXN #42    │ │
  │ │ inode 5032:      │ │ ──────► │  bitmap updated      │ ──────►│ │ COMMITTED  │ │
  │ │   size=8192      │ │         │  directory updated   │        │ └────────────┘ │
  │ │ bitmap: blk 100  │ │         │                      │        │                │
  │ │ dir: add entry   │ │         │                      │        │                │
  │ │ TXN END     #42  │ │         │                      │        │                │
  │ └──────────────────┘ │         │                      │        │                │
  └──────────────────────┘         └──────────────────────┘        └────────────────┘
```

### Journal Structure

| Component                    | Description                                                        |
| ---------------------------- | ------------------------------------------------------------------ |
| **Transaction begin**        | Marks the start; includes transaction ID                           |
| **Log blocks**               | Copies of the metadata (and optionally data) blocks being modified |
| **Transaction end (commit)** | Marks the transaction as complete and valid                        |

### Recovery Process

On boot after a crash, the journal is scanned:

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                    Journal Recovery                         │
  │                                                             │
  │  For each transaction in the journal:                       │
  │                                                             │
  │  Has both BEGIN and COMMIT?                                 │
  │     YES → REDO: replay the changes to the file system       │
  │     NO  → DISCARD: ignore the incomplete transaction        │
  │                                                             │
  │  After replay, clear the journal                            │
  └─────────────────────────────────────────────────────────────┘
```

| Scenario                                                | BEGIN? | COMMIT? | Action                              |
| ------------------------------------------------------- | ------ | ------- | ----------------------------------- |
| Transaction fully written, FS updated                   | ✓      | ✓       | Skip (already applied)              |
| Transaction fully written, FS NOT updated               | ✓      | ✓       | **Redo** — replay from journal      |
| Transaction partially written (crash during journaling) | ✓      | ✗       | **Discard** — ignore incomplete txn |
| No transaction in journal                               | —      | —       | No recovery needed                  |

> [!NOTE]
> Recovery from a journal is **very fast** — typically seconds, regardless of file system size. Only the journal (a fixed, small area of disk) needs to be scanned, not the entire file system.

### Journaling Modes

Most journaling file systems offer three modes that trade off safety for performance:

| Mode                  | What Is Journaled                                  | Data Safety                                                | Performance                                      |
| --------------------- | -------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| **Journal** (full)    | Metadata AND data                                  | Highest — both metadata and data are recoverable           | Slowest — all data written twice                 |
| **Ordered** (default) | Metadata only, but data is written BEFORE metadata | High — data is consistent because it's written first       | Moderate — data written once, metadata journaled |
| **Writeback**         | Metadata only, data written in any order           | Lower — metadata consistent, but data may be stale/garbage | Fastest — minimal journaling overhead            |

```text
  Journal mode (safest):
  ┌────────────────────────────────────────────────────────┐
  │  write data to journal → write metadata to journal →   │
  │  commit → write data to FS → write metadata to FS →    │
  │  mark complete                                         │
  └────────────────────────────────────────────────────────┘

  Ordered mode (default for ext4):
  ┌────────────────────────────────────────────────────────┐
  │  write data to FS → write metadata to journal →        │
  │  commit → write metadata to FS → mark complete         │
  └────────────────────────────────────────────────────────┘

  Writeback mode (fastest):
  ┌────────────────────────────────────────────────────────┐
  │  write metadata to journal → commit →                   │
  │  write data + metadata to FS (any order) → mark done   │
  └────────────────────────────────────────────────────────┘
```

> [!TIP]
> **Ordered mode** is the best balance for most workloads. It guarantees that you never see a file with new metadata pointing to old/garbage data, while avoiding the double-write cost of full journaling.

### Journal Write → Checkpoint Flow

```text
  ┌───────────────────────────────────────────────────────────────┐
  │                      Journal Area (Circular Buffer)            │
  │  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐    │
  │  │TXN 1│TXN 2│TXN 3│TXN 4│TXN 5│     │     │     │     │    │
  │  │done │done │done │new  │new  │     │     │     │     │    │
  │  └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘    │
  │       ▲                                   ▲                    │
  │       │                                   │                    │
  │   checkpoint                           log head               │
  │   (oldest unwritten)              (newest entry)               │
  │                                                                │
  │  Checkpoint process:                                           │
  │  1. Write TXN 1's changes to actual FS locations               │
  │  2. Advance checkpoint pointer past TXN 1                      │
  │  3. Space before checkpoint can be reused                      │
  └───────────────────────────────────────────────────────────────┘
```

### ext3/ext4 Journaling Implementation

| Feature                   | ext3                                            | ext4                                             |
| ------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| **Journal location**      | Dedicated file (`/.journal`) or separate device | Same, plus journal checksum                      |
| **Default mode**          | Ordered                                         | Ordered                                          |
| **Journal size**          | Typically 128 MB                                | Typically 128 MB                                 |
| **Transaction checksums** | No                                              | Yes — detects corrupt journal entries            |
| **Fast commit**           | No                                              | Yes — logs only essential changes for common ops |
| **Recovery time**         | Seconds                                         | Seconds (faster with checksums)                  |

### Performance Impact

| Operation              | No Journal           | Journal Mode | Ordered Mode  | Writeback Mode |
| ---------------------- | -------------------- | ------------ | ------------- | -------------- |
| **Small file create**  | 1x                   | ~2x slower   | ~1.1x slower  | ~1.05x slower  |
| **Large file write**   | 1x                   | ~2x slower   | ~1.05x slower | ~1.02x slower  |
| **Metadata-heavy ops** | 1x                   | ~1.5x slower | ~1.3x slower  | ~1.1x slower   |
| **Recovery time**      | Minutes–hours (fsck) | Seconds      | Seconds       | Seconds        |

---

## Log-Structured File Systems (LFS)

> A **log-structured file system** treats the entire disk as an **append-only log**. All writes — data, metadata, inodes — are written sequentially to the end of the log.

### Design Philosophy

```text
  Traditional FS:                     Log-Structured FS:
  ┌──────────────────────────┐        ┌──────────────────────────┐
  │ Fixed locations:          │        │ Everything is a log:     │
  │  Superblock at block 0   │        │                          │
  │  Inodes at blocks 10-100 │        │  ┌─────┬─────┬─────┐    │
  │  Data scattered           │        │  │Data │Inode│Data │    │
  │                           │        │  │  A  │  A  │  B  │    │
  │  Writes go to many        │        │  └─────┴─────┴─────┘    │
  │  different locations      │        │         ▲                │
  │  → random I/O!            │        │     All writes go here  │
  └──────────────────────────┘        │     → sequential I/O!   │
                                      └──────────────────────────┘
```

### How LFS Works

```text
  Write operation: create file "hello.txt" with content "Hi"

  Log (sequential writes):
  ┌────────────┬──────────────┬─────────────┬──────────────┬────────────┐
  │ Data block │ Inode for    │ Dir entry   │ Inode for    │ Inode Map  │
  │ "Hi"       │ hello.txt    │ update      │ parent dir   │ update     │
  │            │ (points to   │ (add        │ (new mtime)  │ (where are │
  │            │  data block) │  "hello.txt")│             │  inodes?)  │
  └────────────┴──────────────┴─────────────┴──────────────┴────────────┘
  ──────────────────────────────────────────────────────────────────────►
                           Direction of log growth
```

### The Inode Map

Since inodes are no longer at fixed locations, LFS maintains an **inode map** — a small structure that maps inode numbers to their current log positions.

| Inode # | Current Log Position |
| ------- | -------------------- |
| 1       | Log offset 0x40000   |
| 2       | Log offset 0x78200   |
| 3       | Log offset 0xA0100   |
| ...     | ...                  |

### Garbage Collection (The Cleaner)

As the log wraps around, old versions of data and inodes become **garbage** (superseded by newer versions). A **cleaner** process reclaims this space:

```text
  Log segments:
  ┌──────────┬──────────┬──────────┬──────────┬──────────┐
  │ Segment 0│ Segment 1│ Segment 2│ Segment 3│ Segment 4│
  │ 20% live │ 80% live │ 10% live │ 95% live │ empty    │
  └──────────┴──────────┴──────────┴──────────┴──────────┘

  Cleaner picks Segment 2 (most garbage):
  1. Read Segment 2
  2. Copy the 10% live data to end of log
  3. Free Segment 2 for reuse

  After cleaning:
  ┌──────────┬──────────┬──────────┬──────────┬──────────┐
  │ Segment 0│ Segment 1│  FREE    │ Segment 3│ Seg 4+   │
  │ 20% live │ 80% live │          │ 95% live │ cleaned  │
  └──────────┴──────────┴──────────┴──────────┴──────────┘
```

### LFS Characteristics

| Advantage                                                          | Disadvantage                                                    |
| ------------------------------------------------------------------ | --------------------------------------------------------------- |
| **Excellent write performance** — all writes are sequential        | **Read performance** can suffer — data scattered in log         |
| **Natural recovery** — log is always consistent                    | **Garbage collection** overhead — cleaner must run periodically |
| **Good for SSD** — sequential writes match SSD's preferred pattern | **Random read requires inode map lookup**                       |

> [!NOTE]
> Modern flash-optimized file systems like **F2FS** (Flash-Friendly File System) are based on LFS principles, adapted for the characteristics of NAND flash storage.

---

## Copy-on-Write (COW) File Systems

> In a **copy-on-write** file system, data is **never overwritten in place**. When a block needs to be modified, the new version is written to a **new location**, and pointers are updated to reference the new block.

### How COW Works

```text
  Before modification:

  Root         Directory       File Inode      Data Block
  ┌────┐       ┌────────┐      ┌────────┐      ┌────────┐
  │ ●──┼──────►│ ●──────┼─────►│ ●──────┼─────►│ "Hello"│
  └────┘       └────────┘      └────────┘      └────────┘

  After modifying the data block (write "World"):

  Root         Directory       File Inode      Data Block
  ┌────┐       ┌────────┐      ┌────────┐      ┌────────┐
  │old │       │ old    │      │ old    │      │ "Hello"│ ← old, now garbage
  └────┘       └────────┘      └────────┘      └────────┘

  ┌────┐       ┌────────┐      ┌────────┐      ┌────────┐
  │ ●──┼──────►│ ●──────┼─────►│ ●──────┼─────►│"World" │ ← new blocks
  └────┘       └────────┘      └────────┘      └────────┘
  new root     new dir         new inode       new data

  The write "bubbles up" from data → inode → directory → root
```

### Snapshots for Free

Because old blocks are never overwritten, the file system can create **snapshots** by simply keeping a pointer to an old root:

```text
  Snapshot (taken at time T1):          Current state (time T2):

  Root@T1 ──► Dir@T1 ──► Inode@T1     Root@T2 ──► Dir@T2 ──► Inode@T2
                              │                                    │
                              ▼                                    ▼
                         Data "Hello"                         Data "World"

  Both trees share unchanged blocks:
  ┌─────────┐
  │ Root@T1 │──────────────────────► ┌────────┐
  └─────────┘                        │Shared  │
                                     │blocks  │ ← unchanged files are
  ┌─────────┐                        │(not    │    shared between
  │ Root@T2 │──────────────────────► │modified│    snapshot and current
  └─────────┘                        │)       │
                                     └────────┘
```

Creating a snapshot takes **O(1) time** — just save the current root pointer. No data is copied!

### Self-Healing with Checksums

ZFS and Btrfs store **checksums** for every data and metadata block:

```text
  ┌─────────────────┐
  │ Parent Block     │
  │                  │
  │ Child ptr + cksum│──► ┌────────────────┐
  │ Child ptr + cksum│    │ Data Block     │
  │                  │    │                │
  └─────────────────┘    │ checksum: 0xAB │ ← stored checksum
                          └────────────────┘
                                  │
                          Verify: compute checksum of data
                                  compare with stored value
                                  Mismatch? → use mirror/parity to repair!
```

| Feature                | Traditional (ext4)            | COW (ZFS/Btrfs)                              |
| ---------------------- | ----------------------------- | -------------------------------------------- |
| **Data integrity**     | No checksums (trust the disk) | Checksums on every block                     |
| **Silent corruption**  | Undetected                    | Detected and auto-repaired (with redundancy) |
| **Bit rot protection** | None                          | Periodic scrub verifies all data             |

### ZFS and Btrfs Comparison

| Feature               | ZFS                               | Btrfs                         |
| --------------------- | --------------------------------- | ----------------------------- |
| **Origin**            | Sun Microsystems (2005)           | Oracle/Linux community (2009) |
| **OS support**        | FreeBSD, Linux (OpenZFS), Solaris | Linux native                  |
| **Volume management** | Integrated (zpools)               | Integrated                    |
| **RAID**              | RAID-Z1, Z2, Z3                   | RAID 0, 1, 5, 6, 10           |
| **Max volume size**   | 256 ZB                            | 16 EB                         |
| **Deduplication**     | Yes (in-line)                     | Yes (offline, experimental)   |
| **Compression**       | LZ4, GZIP, ZSTD                   | LZO, ZLIB, ZSTD               |
| **Send/Receive**      | Yes (incremental snapshots)       | Yes                           |
| **Maturity**          | Very mature                       | Maturing                      |

---

## Comparison of Recovery Approaches

| Feature            | fsck / chkdsk    | Journaling                               | LFS                 | Copy-on-Write                              |
| ------------------ | ---------------- | ---------------------------------------- | ------------------- | ------------------------------------------ |
| **Recovery time**  | Minutes to hours | Seconds                                  | Instant (log is FS) | Instant (COW is FS)                        |
| **Data loss risk** | May lose data    | Minimal (ordered/journal mode)           | Very low            | Very low                                   |
| **Write overhead** | None             | Moderate (double write for journal mode) | Low (sequential)    | Moderate (write amplification up the tree) |
| **Snapshots**      | No               | No (need LVM)                            | Possible            | Yes — free and instant                     |
| **Checksums**      | No               | No (ext4 has journal checksums only)     | Not typically       | Yes (ZFS, Btrfs)                           |
| **Complexity**     | Moderate         | Moderate                                 | High (cleaner)      | High (GC, reference counting)              |
| **Used by**        | Legacy, fallback | ext3/4, NTFS, XFS                        | F2FS, WAFL          | ZFS, Btrfs, APFS                           |

---

## Backup Strategies

Even with journaling and COW, **backups** are essential — they protect against human error, malware, and complete disk failure.

| Backup Type      | Description                                                     | Space  | Speed                  |
| ---------------- | --------------------------------------------------------------- | ------ | ---------------------- |
| **Full backup**  | Copy all files                                                  | Large  | Slow (copy everything) |
| **Incremental**  | Copy only files changed since LAST backup (full or incremental) | Small  | Fast                   |
| **Differential** | Copy only files changed since last FULL backup                  | Medium | Moderate               |

```text
  Day 1: Full backup         (all files: A B C D E)
  Day 2: Incremental          (changed: B)
  Day 3: Incremental          (changed: C E)
  Day 4: Incremental          (changed: A)
  Day 5: Full backup         (all files again)

  To restore Day 4 state:
  - Incremental: need Day 1 + Day 2 + Day 3 + Day 4  (4 backups)

  Day 1: Full backup         (all files: A B C D E)
  Day 2: Differential         (changed since Day 1: B)
  Day 3: Differential         (changed since Day 1: B C E)
  Day 4: Differential         (changed since Day 1: A B C E)

  To restore Day 4 state:
  - Differential: need Day 1 + Day 4 only  (2 backups)
```

| Property               | Full             | Incremental  | Differential       |
| ---------------------- | ---------------- | ------------ | ------------------ |
| **Backup time**        | Long             | Short        | Medium             |
| **Backup storage**     | Large            | Small        | Growing            |
| **Restore time**       | Short (1 backup) | Long (chain) | Medium (2 backups) |
| **Restore complexity** | Simple           | Complex      | Moderate           |

> [!IMPORTANT]
> The **3-2-1 backup rule** recommends: **3** copies of data, on **2** different types of media, with **1** copy offsite. No file system recovery feature replaces proper backups.

---

## Try It Yourself

**Exercise 1:** A file system crash occurs while creating a new file. The inode has been allocated and initialized, but the directory entry has not been written. What type of inconsistency results? How would (a) fsck and (b) journaling handle this?

:::details Solution
**Inconsistency type:** **Orphan inode** — the inode is allocated (bitmap says "in use", inode has valid metadata) but no directory entry points to it. The file is unreachable by users.

**(a) fsck handling:**

1. fsck scans all directory entries and counts references to each inode.
2. It finds that inode N has a stored link count ≥ 1 but actual directory references = 0.
3. fsck moves the inode to the `/lost+found/` directory with a name based on its inode number (e.g., `#12345`).
4. The user must manually inspect and rename/delete the recovered file.

**(b) Journaling handling:**

1. On reboot, the journal is replayed.
2. The "create file" transaction has a BEGIN record but no COMMIT record (crash interrupted it).
3. The incomplete transaction is **discarded**.
4. The inode allocation is rolled back — the inode is freed, and the file system is consistent.
5. The file creation never happened — the user must retry.

Journaling is clearly superior: recovery is automatic, fast, and clean.
:::

**Exercise 2:** Explain why ordered journaling mode prevents "garbage in files" but writeback mode does not.

:::details Solution
**Ordered mode guarantee:** Data blocks are written to their final locations **before** the metadata transaction is committed to the journal.

```text
Ordered: Data written → Metadata journaled → Commit
```

If the system crashes after the commit, the metadata is replayed from the journal. Since data was already written before the commit, the file's metadata (size, block pointers) correctly describes the actual data on disk.

If the system crashes before the commit, the transaction is discarded. The data blocks that were written are simply orphaned — no metadata points to them, so they appear as if they never existed.

**Writeback mode:** Data and metadata can be written in **any order**.

```text
Writeback: Metadata journaled → Commit → Data may not be written yet!
```

If the system crashes after the commit but before the data is written, the journal replays the metadata. The file now has valid metadata pointing to blocks that contain **old/stale data** (from a previously deleted file) — this is "garbage in files."

The file appears to exist with the correct size, but its contents are wrong. This can be a **security risk** (exposing another user's deleted data) and a **data integrity problem**.
:::

**Exercise 3:** A ZFS pool uses copy-on-write. You take a snapshot, then modify 100 MB of files. How much additional disk space does the snapshot consume? What about the modifications?

:::details Solution
**Snapshot space consumption:**
The snapshot itself consumes essentially **0 bytes** at creation time. It's just a saved pointer to the current root of the block tree.

**After modifying 100 MB:**

- The modifications write **100 MB of new blocks** to the pool (COW never overwrites).
- The old versions of those blocks (100 MB) are now referenced **only** by the snapshot.
- Without the snapshot, those old blocks would be freed.
- With the snapshot, those old blocks must be kept.

**Total additional space used: ~200 MB**

- 100 MB for the new (current) data
- 100 MB for the old data (preserved by the snapshot)

If the snapshot is deleted later, the old 100 MB becomes garbage and is freed by ZFS's garbage collection.

**Key insight:** Snapshots are "free" to create but consume space over time proportional to the amount of data that has **changed** since the snapshot was taken.
:::

---

## Key Takeaways

- File system crashes can cause **inconsistencies** — orphan inodes, leaked blocks, dangling directory entries, and incorrect free counts.
- **fsck/chkdsk** scan the entire file system to detect and repair inconsistencies — effective but **extremely slow** on large disks (hours for multi-TB volumes).
- **Journaling (write-ahead logging)** records operations to a journal before applying them, enabling **seconds-fast recovery** by replaying or discarding transactions.
- Journaling has three modes: **journal** (safest, slowest), **ordered** (good balance, default for ext4), and **writeback** (fastest, least safe).
- **Log-structured file systems** treat the entire disk as an append-only log — excellent write performance but require garbage collection.
- **Copy-on-write file systems** (ZFS, Btrfs, APFS) never overwrite data — modifications create new blocks, enabling instant **snapshots** and **self-healing** via checksums.
- COW file systems detect and repair **silent data corruption** (bit rot) using per-block checksums and redundant copies.
- No file system recovery mechanism replaces **backups**. Use the 3-2-1 rule: 3 copies, 2 media types, 1 offsite.
- Modern file systems increasingly favor **COW** over journaling, as COW provides stronger integrity guarantees with native snapshot support.
