---
title: Archiving & Compression
---

# Archiving & Compression

Archiving combines multiple files into one; compression reduces file size. Together they make backups, transfers, and storage efficient. This lesson covers the essential tools every Linux user needs.

---

## tar — Tape Archive

`tar` is the most common archiving tool on Linux. It bundles files and directories into a single archive file.

### Create an Archive

```bash
# Create archive.tar containing file1.txt, file2.txt, and the docs/ directory
$ tar -cvf archive.tar file1.txt file2.txt docs/
file1.txt
file2.txt
docs/
docs/readme.md
docs/notes.txt
```

**Flags explained:**
- `-c` — create a new archive
- `-v` — verbose (list files as they're added)
- `-f` — specify the archive filename

### Extract an Archive

```bash
# Extract all files from archive.tar
$ tar -xvf archive.tar
file1.txt
file2.txt
docs/
docs/readme.md
docs/notes.txt
```

**Flags:**
- `-x` — extract files from archive
- `-v` — verbose
- `-f` — specify the archive filename

### Extract to a Specific Directory

```bash
# Extract archive.tar into /tmp/restored/
$ tar -xvf archive.tar -C /tmp/restored/
file1.txt
file2.txt
docs/
docs/readme.md
docs/notes.txt

$ ls /tmp/restored/
file1.txt  file2.txt  docs/
```

### List Archive Contents

```bash
# View contents without extracting
$ tar -tvf archive.tar
-rw-r--r-- user/group    1024 2025-03-15 10:30 file1.txt
-rw-r--r-- user/group    2048 2025-03-15 10:31 file2.txt
drwxr-xr-x user/group       0 2025-03-15 10:32 docs/
-rw-r--r-- user/group     512 2025-03-15 10:32 docs/readme.md
-rw-r--r-- user/group     256 2025-03-15 10:32 docs/notes.txt
```

---

## tar with Compression

`tar` alone only bundles files — it doesn't compress them. Combine with compression algorithms for smaller archives.

### tar + gzip (.tar.gz or .tgz)

gzip is the most common compression method. Fast and widely supported.

```bash
# Create a gzipped archive
$ tar -czvf archive.tar.gz project/
project/
project/src/
project/src/main.c
project/README.md

# Extract a gzipped archive
$ tar -xzvf archive.tar.gz

# List contents of a gzipped archive
$ tar -tzvf archive.tar.gz
```

**Flag:** `-z` activates gzip compression.

### tar + bzip2 (.tar.bz2)

bzip2 gives better compression than gzip but is slower.

```bash
# Create a bzip2 compressed archive
$ tar -cjvf archive.tar.bz2 project/
project/
project/src/
project/src/main.c
project/README.md

# Extract a bzip2 archive
$ tar -xjvf archive.tar.bz2

# List contents
$ tar -tjvf archive.tar.bz2
```

**Flag:** `-j` activates bzip2 compression.

### tar + xz (.tar.xz)

xz offers the best compression ratio but is the slowest.

```bash
# Create an xz compressed archive
$ tar -cJvf archive.tar.xz project/
project/
project/src/
project/src/main.c
project/README.md

# Extract an xz archive
$ tar -xJvf archive.tar.xz

# List contents
$ tar -tJvf archive.tar.xz
```

**Flag:** `-J` (uppercase) activates xz compression.

### Extract a Specific File from Archive

```bash
# Extract only README.md from the archive
$ tar -xzvf archive.tar.gz project/README.md
project/README.md
```

### Append Files to an Existing Archive

```bash
# Add newfile.txt to existing uncompressed archive
$ tar -rvf archive.tar newfile.txt
newfile.txt
```

> **Note:** You cannot append to compressed archives (.tar.gz, .tar.bz2, .tar.xz).

### Exclude Files

```bash
# Create archive excluding .git and node_modules
$ tar -czvf project.tar.gz --exclude='.git' --exclude='node_modules' project/
```

---

## gzip / gunzip — Single File Compression

`gzip` compresses individual files. It replaces the original file with a `.gz` version.

### Compress a File

```bash
$ ls -lh report.txt
-rw-r--r-- 1 user group 5.2M Mar 15 10:00 report.txt

$ gzip report.txt

$ ls -lh report.txt.gz
-rw-r--r-- 1 user group 1.1M Mar 15 10:00 report.txt.gz
```

> The original `report.txt` is **replaced** by `report.txt.gz`.

### Decompress a File

```bash
$ gunzip report.txt.gz
# or equivalently:
$ gzip -d report.txt.gz

$ ls -lh report.txt
-rw-r--r-- 1 user group 5.2M Mar 15 10:00 report.txt
```

### Keep the Original File

```bash
# Compress but keep original
$ gzip -k report.txt

$ ls report.txt*
report.txt  report.txt.gz
```

### View Compressed File Without Extracting

```bash
$ zcat report.txt.gz | head -5
This is the first line...
Second line of the report...
...
```

### Compression Levels

```bash
# Fastest compression (least compression)
$ gzip -1 largefile.txt

# Best compression (slowest)
$ gzip -9 largefile.txt

# Default is -6
$ gzip largefile.txt
```

---

## bzip2 / bunzip2

`bzip2` offers better compression than gzip at the cost of speed.

### Compress

```bash
$ bzip2 report.txt

$ ls report.txt.bz2
report.txt.bz2
```

### Decompress

```bash
$ bunzip2 report.txt.bz2
# or:
$ bzip2 -d report.txt.bz2
```

### Keep Original

```bash
$ bzip2 -k report.txt
```

### View Without Extracting

```bash
$ bzcat report.txt.bz2 | head -5
```

---

## xz / unxz

`xz` provides the highest compression ratio among standard Linux tools.

### Compress

```bash
$ xz report.txt

$ ls report.txt.xz
report.txt.xz
```

### Decompress

```bash
$ unxz report.txt.xz
# or:
$ xz -d report.txt.xz
```

### Keep Original

```bash
$ xz -k report.txt
```

### View Without Extracting

```bash
$ xzcat report.txt.xz | head -5
```

### Multithreaded Compression

```bash
# Use 4 threads for faster compression
$ xz -T4 largefile.txt

# Use all available CPU cores
$ xz -T0 largefile.txt
```

---

## zip / unzip — Cross-Platform

`zip` creates archives compatible with Windows, macOS, and Linux.

### Create a ZIP Archive

```bash
$ zip archive.zip file1.txt file2.txt
  adding: file1.txt (deflated 62%)
  adding: file2.txt (deflated 58%)
```

### ZIP a Directory Recursively

```bash
$ zip -r project.zip project/
  adding: project/ (stored 0%)
  adding: project/src/ (stored 0%)
  adding: project/src/main.c (deflated 45%)
  adding: project/README.md (deflated 38%)
```

### Extract a ZIP Archive

```bash
$ unzip archive.zip
Archive:  archive.zip
  inflating: file1.txt
  inflating: file2.txt
```

### Extract to a Specific Directory

```bash
$ unzip archive.zip -d /tmp/extracted/
```

### List ZIP Contents

```bash
$ unzip -l archive.zip
Archive:  archive.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
     1024  2025-03-15 10:30   file1.txt
     2048  2025-03-15 10:31   file2.txt
---------                     -------
     3072                     2 files
```

### Password-Protected ZIP

```bash
# Create encrypted ZIP
$ zip -e secret.zip confidential.txt
Enter password:
Verify password:
  adding: confidential.txt (deflated 55%)

# Extract (will prompt for password)
$ unzip secret.zip
```

---

## Compression Comparison Table

| Tool   | Extension   | Speed   | Ratio  | Best For                    |
|--------|-------------|---------|--------|-----------------------------|
| gzip   | .gz         | Fast    | Good   | Daily backups, quick tasks  |
| bzip2  | .bz2        | Medium  | Better | Balance of speed and size   |
| xz     | .xz         | Slow    | Best   | Distribution, long-term storage |
| zip    | .zip        | Fast    | Good   | Cross-platform sharing      |

### Real-World Comparison

```bash
# Start with a 100MB text file
$ ls -lh data.txt
-rw-r--r-- 1 user group 100M Mar 15 10:00 data.txt

# gzip: fast, decent compression
$ time gzip -k data.txt
real    0m1.2s
$ ls -lh data.txt.gz
-rw-r--r-- 1 user group  25M Mar 15 10:00 data.txt.gz

# bzip2: slower, better compression
$ time bzip2 -k data.txt
real    0m4.8s
$ ls -lh data.txt.bz2
-rw-r--r-- 1 user group  18M Mar 15 10:00 data.txt.bz2

# xz: slowest, best compression
$ time xz -k data.txt
real    0m12.3s
$ ls -lh data.txt.xz
-rw-r--r-- 1 user group  12M Mar 15 10:00 data.txt.xz
```

---

## Practical Backup Scripts

### Simple Backup Script

```bash
#!/bin/bash
# backup.sh — Back up a directory with timestamp

SOURCE="/home/user/documents"
DEST="/backups"
DATE=$(date +%Y-%m-%d_%H%M%S)
FILENAME="documents_backup_${DATE}.tar.gz"

echo "Starting backup..."
tar -czvf "${DEST}/${FILENAME}" "$SOURCE"
echo "Backup complete: ${DEST}/${FILENAME}"
```

### Rotating Backup Script

```bash
#!/bin/bash
# rotate-backup.sh — Keep only the last 7 daily backups

BACKUP_DIR="/backups/daily"
SOURCE="/var/www/html"
DATE=$(date +%Y-%m-%d)
KEEP=7

# Create today's backup
tar -czvf "${BACKUP_DIR}/web_${DATE}.tar.gz" "$SOURCE"

# Remove backups older than $KEEP days
find "$BACKUP_DIR" -name "web_*.tar.gz" -mtime +$KEEP -delete

echo "Backup complete. Old backups removed (keeping last $KEEP days)."
```

### Incremental Backup with tar

```bash
#!/bin/bash
# incremental-backup.sh — Only archive files changed since last backup

SNAPSHOT="/backups/.snapshot"
SOURCE="/home/user/project"
DEST="/backups/incremental"
DATE=$(date +%Y-%m-%d_%H%M%S)

tar -czvf "${DEST}/inc_${DATE}.tar.gz" \
    --listed-incremental="$SNAPSHOT" \
    "$SOURCE"

echo "Incremental backup saved to ${DEST}/inc_${DATE}.tar.gz"
```

### Database + Files Backup

```bash
#!/bin/bash
# full-backup.sh — Back up database and files together

BACKUP_DIR="/backups"
DATE=$(date +%Y-%m-%d)
TMPDIR=$(mktemp -d)

# Dump database
mysqldump -u root mydb > "${TMPDIR}/database.sql"

# Copy important configs
cp /etc/nginx/nginx.conf "${TMPDIR}/"
cp /etc/crontab "${TMPDIR}/"

# Archive everything together
tar -czvf "${BACKUP_DIR}/full_backup_${DATE}.tar.gz" \
    "${TMPDIR}" \
    /var/www/html

# Clean up temp directory
rm -rf "$TMPDIR"

echo "Full backup complete: ${BACKUP_DIR}/full_backup_${DATE}.tar.gz"
```

---

## Quick Reference

| Task                            | Command                                      |
|---------------------------------|----------------------------------------------|
| Create tar archive              | `tar -cvf archive.tar files/`                |
| Extract tar archive             | `tar -xvf archive.tar`                       |
| Create .tar.gz                  | `tar -czvf archive.tar.gz files/`            |
| Extract .tar.gz                 | `tar -xzvf archive.tar.gz`                   |
| Create .tar.bz2                 | `tar -cjvf archive.tar.bz2 files/`           |
| Create .tar.xz                  | `tar -cJvf archive.tar.xz files/`            |
| Compress single file            | `gzip file.txt`                              |
| Decompress .gz                  | `gunzip file.txt.gz`                         |
| Create ZIP                      | `zip -r archive.zip folder/`                 |
| Extract ZIP                     | `unzip archive.zip`                          |
| List archive contents           | `tar -tvf archive.tar`                       |
| Extract to directory            | `tar -xvf archive.tar -C /path/`             |

---

## Summary

- **tar** bundles files into a single archive; combine with `-z` (gzip), `-j` (bzip2), or `-J` (xz) for compression.
- **gzip** is fast and good enough for most tasks.
- **bzip2** offers better compression at moderate speed cost.
- **xz** gives the best ratio but is slowest — ideal for distribution.
- **zip** is your go-to for cross-platform sharing.
- Always test your backups by listing contents (`tar -tvf`) before relying on them.
