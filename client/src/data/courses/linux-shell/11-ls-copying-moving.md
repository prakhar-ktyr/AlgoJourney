---
title: Copying, Moving & Renaming
---

# Copying, Moving & Renaming

In this lesson, you will learn how to copy, move, and rename files and directories in Linux using the `cp` and `mv` commands.

These are among the most frequently used commands in everyday Linux work.

---

## The cp Command

The `cp` command copies files and directories from one location to another.

### Basic Syntax

```bash
cp source destination
```

### Copy a File

```bash
cp report.txt report_backup.txt
```

This creates a copy of `report.txt` named `report_backup.txt` in the same directory.

### Copy a File to Another Directory

```bash
cp report.txt /home/user/backups/
```

This copies `report.txt` into the `backups` directory, keeping the same filename.

### Copy with a New Name

```bash
cp report.txt /home/user/backups/report_2024.txt
```

This copies and renames the file in one step.

---

## cp Options

The `cp` command has several useful options that control its behavior.

### -r — Recursive Copy (Directories)

To copy a directory and all its contents, you **must** use `-r`:

```bash
cp -r projects/ projects_backup/
```

Without `-r`, copying a directory will fail:

```bash
cp projects/ projects_backup/
# Error: cp: omitting directory 'projects/'
```

### -i — Interactive Mode

The `-i` flag asks for confirmation before overwriting an existing file:

```bash
cp -i report.txt /home/user/backups/
# cp: overwrite '/home/user/backups/report.txt'? y
```

This is a safety measure to prevent accidental data loss.

### -v — Verbose Mode

The `-v` flag shows what is being copied:

```bash
cp -v file1.txt file2.txt /home/user/docs/
# 'file1.txt' -> '/home/user/docs/file1.txt'
# 'file2.txt' -> '/home/user/docs/file2.txt'
```

### -u — Update Only

Copy only when the source file is newer than the destination:

```bash
cp -u *.txt /home/user/backups/
```

### -p — Preserve Attributes

Preserve the original file's permissions, timestamps, and ownership:

```bash
cp -p important.conf /etc/backup/
```

### Combining Options

You can combine multiple options together:

```bash
cp -riv projects/ projects_backup/
```

This copies a directory recursively, interactively, and verbosely.

---

## Copying Multiple Files

You can copy multiple files to a directory in one command:

```bash
cp file1.txt file2.txt file3.txt /home/user/documents/
```

The **last argument** must be a directory when copying multiple files.

### Using Wildcards

Copy all `.txt` files to a directory:

```bash
cp *.txt /home/user/documents/
```

Copy all files starting with "report":

```bash
cp report* /home/user/backups/
```

Copy all files with any extension:

```bash
cp project.* /home/user/backups/
```

---

## The mv Command

The `mv` command moves or renames files and directories.

Unlike `cp`, the original file is removed after moving.

### Basic Syntax

```bash
mv source destination
```

---

## Renaming with mv

To rename a file, use `mv` with the old and new name:

```bash
mv old_name.txt new_name.txt
```

### Examples

Rename a file:

```bash
mv draft.txt final.txt
```

Rename a directory:

```bash
mv old_project/ new_project/
```

**Note:** Unlike `cp`, you do NOT need `-r` to rename or move directories with `mv`.

---

## Moving with mv

To move a file to a different directory:

```bash
mv file.txt /home/user/documents/
```

Move a file and rename it simultaneously:

```bash
mv report.txt /home/user/archive/report_2024.txt
```

Move a directory:

```bash
mv projects/ /home/user/archive/
```

### Moving Multiple Files

Move multiple files to a directory:

```bash
mv file1.txt file2.txt file3.txt /home/user/archive/
```

Move all `.log` files:

```bash
mv *.log /var/archive/
```

---

## mv Options

### -i — Interactive (Overwrite Protection)

Ask before overwriting an existing file:

```bash
mv -i report.txt /home/user/documents/
# mv: overwrite '/home/user/documents/report.txt'? y
```

### -n — No Clobber

Never overwrite an existing file (silently skip):

```bash
mv -n report.txt /home/user/documents/
```

If `report.txt` already exists in the destination, nothing happens.

### -v — Verbose

Show what is being moved:

```bash
mv -v *.txt /home/user/documents/
# renamed 'notes.txt' -> '/home/user/documents/notes.txt'
# renamed 'todo.txt' -> '/home/user/documents/todo.txt'
```

### -u — Update Only

Move only if the source is newer:

```bash
mv -u *.conf /etc/backup/
```

---

## Overwrite Protection Summary

| Flag | Behavior |
|------|----------|
| (none) | Overwrites without asking |
| `-i` | Asks for confirmation |
| `-n` | Never overwrites (skips silently) |
| `-f` | Force overwrite (override `-i`) |

**Best Practice:** Use `-i` by default. Many users add this alias to their shell config:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias mv='mv -i'
alias cp='cp -i'
```

---

## rsync — Advanced Copying (Preview)

For more complex copying tasks, `rsync` is a powerful tool:

### Basic rsync Usage

```bash
rsync -av source/ destination/
```

- `-a` — archive mode (preserves permissions, timestamps, symlinks)
- `-v` — verbose output

### Why Use rsync Over cp?

- Copies only changed files (incremental)
- Can copy over the network (SSH)
- Shows progress
- Can resume interrupted transfers

### Examples

Copy a directory with progress:

```bash
rsync -av --progress projects/ /backup/projects/
```

Sync two directories (mirror):

```bash
rsync -av --delete source/ destination/
```

Copy to a remote server:

```bash
rsync -av projects/ user@server:/backup/projects/
```

**Note:** `rsync` is covered in depth in a later lesson. This is just a preview!

---

## Batch Renaming with Loops (Preview)

You can rename multiple files at once using shell loops.

### Rename All .txt to .md

```bash
for file in *.txt; do
  mv "$file" "${file%.txt}.md"
done
```

**Explanation:**
- `${file%.txt}` removes the `.txt` suffix from the variable
- `.md` adds the new extension

### Add a Prefix to All Files

```bash
for file in *.jpg; do
  mv "$file" "vacation_$file"
done
```

### Add a Date Prefix

```bash
for file in *.log; do
  mv "$file" "$(date +%Y%m%d)_$file"
done
```

### Replace Spaces with Underscores

```bash
for file in *\ *; do
  mv "$file" "${file// /_}"
done
```

**Note:** Batch renaming is covered in more detail in the scripting lessons.

---

## Practical Exercises

### Exercise 1: Basic Copying

```bash
# Create a test file
echo "Hello, Linux!" > greeting.txt

# Copy it with a new name
cp greeting.txt greeting_backup.txt

# Verify both files exist
ls -l greeting*.txt
```

### Exercise 2: Copy a Directory

```bash
# Create a directory with files
mkdir my_project
echo "print('hello')" > my_project/app.py
echo "# README" > my_project/README.md

# Copy the entire directory
cp -rv my_project/ my_project_backup/

# Verify the copy
ls -R my_project_backup/
```

### Exercise 3: Move and Rename

```bash
# Create files
touch draft1.txt draft2.txt draft3.txt

# Create a destination directory
mkdir final_docs

# Move and rename
mv draft1.txt final_docs/chapter1.txt
mv draft2.txt final_docs/chapter2.txt
mv draft3.txt final_docs/chapter3.txt

# Verify
ls final_docs/
```

### Exercise 4: Safe Copying with Options

```bash
# Create source and destination
mkdir source dest
echo "original" > source/data.txt
echo "existing" > dest/data.txt

# Try copying with -i (interactive)
cp -i source/data.txt dest/
# Answer 'n' to keep existing, 'y' to overwrite

# Try with -n (no clobber)
cp -n source/data.txt dest/
cat dest/data.txt  # Still "existing"
```

### Exercise 5: Batch Operations

```bash
# Create multiple files
touch report_jan.txt report_feb.txt report_mar.txt

# Copy all reports to a backup directory
mkdir reports_backup
cp -v report_*.txt reports_backup/

# Rename all to .md
cd reports_backup
for file in *.txt; do
  mv -v "$file" "${file%.txt}.md"
done
ls
```

---

## Key Differences: cp vs mv

| Feature | cp | mv |
|---------|----|----|
| Original file | Kept | Removed |
| Needs -r for dirs | Yes | No |
| Creates duplicate | Yes | No |
| Speed (same filesystem) | Slower (copies data) | Instant (renames entry) |
| Speed (cross filesystem) | Same | Same (copies then deletes) |

---

## Common Mistakes

### Forgetting -r with cp

```bash
# WRONG — will fail
cp my_directory/ backup/

# CORRECT
cp -r my_directory/ backup/
```

### Overwriting Without Thinking

```bash
# DANGEROUS — no warning!
cp new_data.txt important_data.txt

# SAFER
cp -i new_data.txt important_data.txt
```

### Moving to a Non-Existent Directory

```bash
# If /backup/ doesn't exist, this RENAMES the file to "backup"
mv file.txt /backup

# Make sure the directory exists first
mkdir -p /backup
mv file.txt /backup/
```

---

## Summary

In this lesson, you learned:

- `cp` copies files and directories
- `cp -r` is required for directories
- `cp -i` provides overwrite protection
- `mv` moves and renames files
- `mv` does NOT need `-r` for directories
- `-i` (interactive) and `-n` (no-clobber) prevent accidental overwrites
- `rsync` provides advanced copying features
- Shell loops enable batch renaming

---
