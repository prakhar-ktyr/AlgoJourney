---
title: Removing Files & Directories
---

# Removing Files & Directories

In this lesson, you will learn how to delete files and directories in Linux using `rm` and `rmdir`.

**Warning:** Linux does not have a recycle bin on the command line. Once a file is deleted with `rm`, it is **gone permanently**. Read this lesson carefully!

---

## The rm Command

The `rm` command removes (deletes) files.

### Basic Syntax

```bash
rm filename
```

### Remove a Single File

```bash
rm old_notes.txt
```

The file is immediately deleted. No confirmation, no undo.

### Remove Multiple Files

```bash
rm file1.txt file2.txt file3.txt
```

### Remove Files with Wildcards

```bash
# Remove all .tmp files
rm *.tmp

# Remove all files starting with "backup"
rm backup*

# Remove all .log files in current directory
rm *.log
```

---

## rm Options

### -i — Interactive Mode

Ask for confirmation before each deletion:

```bash
rm -i important.txt
# rm: remove regular file 'important.txt'? y
```

Type `y` to confirm or `n` to cancel.

For multiple files, it asks for each one:

```bash
rm -i *.txt
# rm: remove regular file 'notes.txt'? y
# rm: remove regular file 'todo.txt'? n
# rm: remove regular file 'draft.txt'? y
```

### -I — Interactive (Less Intrusive)

Ask once before removing more than 3 files or when removing recursively:

```bash
rm -I *.log
# rm: remove 12 arguments? y
```

This is less annoying than `-i` for bulk operations.

### -v — Verbose Mode

Show what is being deleted:

```bash
rm -v *.tmp
# removed 'cache.tmp'
# removed 'session.tmp'
# removed 'data.tmp'
```

### -f — Force Mode

Remove files without any prompts, even if write-protected:

```bash
rm -f locked_file.txt
```

- No error if file doesn't exist
- No confirmation prompts
- Overrides `-i`

### -r — Recursive Mode

Remove directories and their contents:

```bash
rm -r old_project/
```

This removes the directory and **everything inside it** — subdirectories, files, all of it.

---

## ⚠️ DANGER ZONE: rm -rf

The combination of `-r` (recursive) and `-f` (force) is the most dangerous command in Linux.

### What rm -rf Does

```bash
rm -rf directory/
```

This deletes `directory/` and everything inside it **immediately**, with **no confirmation** and **no recovery**.

### THE COMMAND YOU SHOULD NEVER RUN

```bash
# ⚠️⚠️⚠️ NEVER EVER RUN THIS ⚠️⚠️⚠️
# rm -rf /
# This attempts to delete EVERYTHING on your system
# Including the operating system itself!
```

Modern Linux systems have a safeguard:

```bash
rm -rf /
# rm: it is dangerous to operate recursively on '/'
# rm: use --no-preserve-root to override this failsafe
```

But **do NOT** rely on this protection. Variations can still destroy your system:

```bash
# ⚠️ ALL OF THESE ARE EXTREMELY DANGEROUS:
# rm -rf /*
# rm -rf ~
# rm -rf $VARIABLE/  (if VARIABLE is empty, becomes "rm -rf /")
```

### The Empty Variable Trap

```bash
# If $DIR is empty or unset:
DIR=""
rm -rf $DIR/
# This becomes: rm -rf /  ← CATASTROPHIC!

# SAFE alternative: use quotes and check
if [ -n "$DIR" ]; then
  rm -rf "$DIR/"
fi
```

---

## rmdir — Remove Empty Directories

The `rmdir` command removes **only empty** directories:

```bash
rmdir empty_folder/
```

If the directory contains anything, it fails:

```bash
rmdir non_empty_folder/
# rmdir: failed to remove 'non_empty_folder/': Directory not empty
```

### Why Use rmdir?

It's a **safety mechanism**. You can only accidentally delete an empty directory — no data loss possible.

### Remove Nested Empty Directories

Use `-p` to remove parent directories if they become empty:

```bash
# If a/b/c/ are all empty:
rmdir -p a/b/c/
# Removes c/, then b/, then a/
```

### rmdir vs rm -r

| Command | Removes empty dirs | Removes non-empty dirs | Safe |
|---------|-------------------|----------------------|------|
| `rmdir` | Yes | No (fails) | Very safe |
| `rm -r` | Yes | Yes (deletes all) | Dangerous |

**Rule:** Use `rmdir` when you expect the directory to be empty. Use `rm -r` only when you intentionally want to delete everything inside.

---

## trash-cli — A Safer Alternative

Instead of permanently deleting files, you can move them to a trash can.

### Install trash-cli

```bash
# Ubuntu/Debian
sudo apt install trash-cli

# macOS (with Homebrew)
brew install trash-cli

# Fedora
sudo dnf install trash-cli
```

### Usage

```bash
# Move file to trash (instead of rm)
trash-put old_file.txt

# List trashed files
trash-list

# Restore a file from trash
trash-restore

# Empty the trash
trash-empty

# Empty files older than 30 days
trash-empty 30
```

### Make It Your Default

Add aliases to use `trash-put` instead of `rm`:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias rm='echo "Use trash-put instead! (or \\rm for real rm)"'
alias tp='trash-put'
alias tl='trash-list'
alias tr='trash-restore'
```

---

## Recovering Deleted Files

### The Bad News

On Linux, `rm` does not move files to a trash can. The file's directory entry is removed, and the disk space is marked as available.

### Can Files Be Recovered?

| Situation | Recovery Possible? |
|-----------|-------------------|
| Just deleted, disk not written to | Maybe (with tools) |
| Time has passed, disk in use | Unlikely |
| SSD with TRIM enabled | Almost impossible |
| File was in trash-cli | Yes — restore it |

### Recovery Tools (Advanced)

```bash
# extundelete — for ext3/ext4 filesystems
sudo extundelete /dev/sda1 --restore-file path/to/file

# testdisk / photorec — for various filesystems
sudo photorec /dev/sda1
```

**Important:** These tools are not guaranteed to work. Prevention is always better than recovery.

---

## Safe Practices

### 1. Always Use -i for Important Operations

```bash
rm -i critical_data.txt
```

### 2. List Before You Delete

```bash
# First, see what will be deleted
ls *.tmp

# Then delete
rm *.tmp
```

### 3. Use Echo to Preview Wildcards

```bash
# Preview what the wildcard matches
echo rm *.log
# Output: rm access.log error.log debug.log

# If it looks right, actually delete
rm *.log
```

### 4. Double-Check Your Path

```bash
# Before running rm -r, verify your current directory
pwd
ls

# Then proceed
rm -r old_backup/
```

### 5. Use Variables Carefully

```bash
# ALWAYS quote variables
rm -rf "$DIRECTORY/"

# ALWAYS check if variable is set
if [ -z "$DIRECTORY" ]; then
  echo "Error: DIRECTORY is empty!"
  exit 1
fi
rm -rf "$DIRECTORY/"
```

### 6. Set rm Aliases

```bash
# Add to ~/.bashrc
alias rm='rm -i'       # Always ask
alias rmf='rm -f'     # For when you really mean it
```

### 7. Use Version Control

```bash
# If your files are in git, you can recover them
git checkout -- accidentally_deleted.txt

# See what was deleted
git status
```

---

## Practical Exercises

### Exercise 1: Basic File Removal

```bash
# Create test files
touch temp1.txt temp2.txt temp3.txt
ls temp*.txt

# Remove one file
rm temp1.txt
ls temp*.txt

# Remove remaining files verbosely
rm -v temp2.txt temp3.txt
```

### Exercise 2: Interactive Removal

```bash
# Create files
touch keep_me.txt delete_me.txt maybe.txt

# Use interactive mode
rm -i *.txt
# Answer 'n' for keep_me.txt, 'y' for others

# Verify
ls *.txt
```

### Exercise 3: Directory Removal

```bash
# Create a directory structure
mkdir -p project/{src,docs,tests}
touch project/src/app.py
touch project/docs/readme.md
touch project/tests/test_app.py

# Try rmdir (will fail — not empty)
rmdir project/
# Error!

# Remove contents first, or use rm -r
rm -ri project/
# Confirms each file and directory
```

### Exercise 4: Safe Wildcard Deletion

```bash
# Create mixed files
touch important.doc notes.doc temp.log cache.log data.tmp

# Preview what *.log matches
echo *.log

# Delete only .log and .tmp files
rm -v *.log *.tmp

# Verify .doc files are safe
ls *.doc
```

### Exercise 5: The Echo Preview Technique

```bash
# Create various files
touch report_jan.pdf report_feb.pdf data_jan.csv data_feb.csv

# STEP 1: Preview what the wildcard matches
echo rm *.csv

# STEP 2: Looks correct? Execute!
rm -v *.csv

# PDFs are untouched
ls *.pdf
```

---

## Common Mistakes

### Mistake 1: Spaces in rm Commands

```bash
# WRONG — deletes "my", "file", and ".txt" (3 separate files!)
rm my file .txt

# CORRECT — quote the filename
rm "my file.txt"
```

### Mistake 2: Wildcard Too Broad

```bash
# You want to delete backup files, but...
rm *backup*
# This matches: backup.txt, my_backup_2024.tar, backup_important.doc

# SAFER: be specific
rm *.backup
rm backup_*.tmp
```

### Mistake 3: Wrong Directory

```bash
# You think you're in /tmp but you're in /home
rm -rf old_files/
# Oops! That was your home folder's old_files!

# ALWAYS check first
pwd
ls old_files/
rm -ri old_files/
```

### Mistake 4: Following Symlinks

```bash
# rm -r on a symlink to a directory can delete the target's contents
# Use unlink or rm (without -r) to remove just the symlink
unlink my_symlink
# or
rm my_symlink   # Without -r!
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `rm file` | Delete a file |
| `rm -i file` | Delete with confirmation |
| `rm -v file` | Delete with output |
| `rm -f file` | Force delete |
| `rm -r dir/` | Delete directory and contents |
| `rm -ri dir/` | Delete directory interactively |
| `rmdir dir/` | Delete empty directory only |
| `rmdir -p a/b/c/` | Delete nested empty dirs |
| `trash-put file` | Move to trash (recoverable) |

---

## Summary

In this lesson, you learned:

- `rm` permanently deletes files — there is no undo
- `-i` provides interactive confirmation (use it!)
- `-r` enables recursive deletion of directories
- `-f` forces deletion without prompts
- `rm -rf` is extremely dangerous — always double-check
- `rmdir` only removes empty directories (safe)
- `trash-cli` provides a recoverable alternative
- Always preview with `ls` or `echo` before deleting
- Quote your variables and filenames

**Golden Rule:** Think twice, delete once. You can always delete later, but you can't un-delete.

---
