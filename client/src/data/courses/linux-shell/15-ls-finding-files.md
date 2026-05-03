---
title: Finding Files
---

# Finding Files

In this lesson, you will learn how to search for files and directories in Linux using `find`, `locate`, `which`, `whereis`, and `type`.

Finding files quickly is an essential skill — especially on systems with thousands of files.

---

## The find Command

`find` is the most powerful file search tool in Linux. It searches the filesystem in real-time.

### Basic Syntax

```bash
find [path] [options] [expression]
```

### Simple Example

```bash
find /home/user -name "report.txt"
```

This searches `/home/user` and all subdirectories for a file named `report.txt`.

---

## Finding by Name

### Exact Name Match

```bash
find /home -name "config.json"
```

**Note:** `-name` is case-sensitive! Use `-iname` for case-insensitive search.

### Wildcard Patterns

```bash
# Find all .txt files
find /home -name "*.txt"

# Find files starting with "log"
find /var -name "log*"

# Find files with "backup" anywhere in the name
find / -name "*backup*"
```

**Important:** Always quote wildcard patterns to prevent shell expansion:

```bash
# WRONG — shell expands * before find runs
find . -name *.txt

# CORRECT — find receives the pattern
find . -name "*.txt"
```

---

## Finding by Type

Use `-type` to search for specific file types:

| Flag | Type |
|------|------|
| `f` | Regular file |
| `d` | Directory |
| `l` | Symbolic link |

### Examples

```bash
# Find only files (not directories)
find /home -type f -name "*.py"

# Find only directories
find /var -type d -name "log*"

# Find empty files
find /tmp -type f -empty

# Find empty directories
find . -type d -empty
```

---

## Finding by Size

Use `-size` with size suffixes:

| Suffix | Unit |
|--------|------|
| `c` | Bytes |
| `k` | Kilobytes |
| `M` | Megabytes |
| `G` | Gigabytes |

### Examples

```bash
# Find files larger than 100MB
find / -size +100M

# Find files smaller than 10KB
find . -size -10k

# Find files between 10MB and 100MB
find / -size +10M -size -100M
```

### Practical: Find Disk Space Hogs

```bash
find / -type f -size +100M 2>/dev/null | head -10
```

---

## Finding by Time

Linux tracks three timestamps for every file:

| Option | Timestamp |
|--------|-----------|
| `-mtime` | Modification time (content changed) |
| `-atime` | Access time (file read) |
| `-ctime` | Change time (metadata changed) |

The value is in **days**. Use `+` for "more than" and `-` for "less than":

### Examples

```bash
# Files modified in the last 24 hours
find . -mtime -1

# Files modified more than 30 days ago
find /tmp -mtime +30

# Files modified in the last 30 minutes
find . -mmin -30

# Files NOT accessed in 90 days (candidates for cleanup)
find /home -atime +90 -type f
```

### Using -newer

Find files newer than a reference file:

```bash
find . -newer reference.txt
```

---

## Finding with Actions

The real power of `find` is combining searches with actions.

### -print (Default)

```bash
find . -name "*.txt" -print
```

### -exec — Execute a Command

Run a command on each result:

```bash
# Show details of each found file
find . -name "*.log" -exec ls -lh {} \;

# Change permissions on found files
find . -name "*.sh" -exec chmod +x {} \;

# Search inside found files
find . -name "*.py" -exec grep -l "import os" {} \;
```

**Syntax:** `{}` is replaced with the filename, `\;` marks the end of -exec.

### -exec with + (Batch Mode)

Pass multiple files at once (faster):

```bash
find . -name "*.txt" -exec grep -l "error" {} +
```

### -delete — Delete Found Files

```bash
# Delete all .tmp files
find /tmp -name "*.tmp" -delete

# Delete empty directories
find . -type d -empty -delete
```

**Warning:** `-delete` is permanent! Always test with `-print` first:

```bash
# Test: see what would be deleted
find /tmp -name "*.tmp" -print

# If it looks correct, actually delete
find /tmp -name "*.tmp" -delete
```

---

## Combining Conditions

### AND (Default)

Multiple conditions are AND-ed by default:

```bash
# Files that are .txt AND larger than 1MB
find . -name "*.txt" -size +1M

# Directories named "cache" modified over 7 days ago
find / -type d -name "cache" -mtime +7
```

### OR (-o)

```bash
# Find .jpg OR .png files
find . -name "*.jpg" -o -name "*.png"

# Find .js OR .ts files
find . \( -name "*.js" -o -name "*.ts" \) -type f
```

**Important:** Use `\(` and `\)` to group OR conditions when combined with other expressions.

### NOT (! or -not)

```bash
# Find files that are NOT .git directories
find . -not -name ".git" -type d

# Find non-empty files
find . -type f ! -empty

# Find files not owned by root
find / -not -user root -type f
```

### Complex Combinations

```bash
# Find .py or .js files modified in the last week, excluding node_modules
find . \( -name "*.py" -o -name "*.js" \) \
  -mtime -7 \
  -not -path "*/node_modules/*"
```

---

## Finding by Permissions and Ownership

```bash
# Find files with exact permissions 777
find . -perm 777

# Find world-writable files (security audit)
find / -perm -o+w -type f 2>/dev/null

# Find files owned by a user
find /home -user john

# Find files with no owner (orphaned)
find / -nouser 2>/dev/null
```

---

## Limiting Search Depth

```bash
# Search only in the current directory (no subdirectories)
find . -maxdepth 1 -name "*.txt"

# Search current directory and one level deep
find . -maxdepth 2 -name "*.conf"

# Skip the starting directory, search only subdirectories
find . -mindepth 1 -name "*.log"
```

---

## The locate Command

`locate` searches a pre-built database of filenames. Much faster than `find` but may not reflect recent changes.

```bash
# Find all files named "httpd.conf"
locate httpd.conf

# Case-insensitive search
locate -i readme

# Limit results
locate -l 10 "*.py"
```

### Updating the Database

```bash
sudo updatedb
```

### locate vs find

| Feature | find | locate |
|---------|------|--------|
| Speed | Slow (real-time) | Very fast (database) |
| Accuracy | Always current | May be outdated |
| Conditions | Many (size, time, perms) | Name only |
| Actions | Yes (-exec, -delete) | No |

---

## The which Command

`which` finds the location of an executable command.

### Basic Usage

```bash
which python
# /usr/bin/python

which node
# /usr/local/bin/node

which ls
# /bin/ls
```

### Find All Locations

```bash
which -a python
# /usr/bin/python
# /usr/local/bin/python
```

### Practical Uses

```bash
# Check if a command is installed
which docker
# /usr/bin/docker  ← installed

which nonexistent
# (no output, exit code 1) ← not found
```

---

## The whereis Command

`whereis` locates the binary, source, and manual pages for a command.

```bash
whereis python
# python: /usr/bin/python /usr/lib/python3 /usr/share/man/man1/python.1.gz

whereis ls
# ls: /bin/ls /usr/share/man/man1/ls.1.gz
```

---

## The type Command

`type` tells you what a command is — builtin, alias, function, or external program.

### Basic Usage

```bash
type cd
# cd is a shell builtin

type ls
# ls is aliased to 'ls --color=auto'

type python
# python is /usr/bin/python

type for
# for is a shell keyword
```

### Show All Locations

```bash
type -a echo
# echo is a shell builtin
# echo is /bin/echo
```

---

## fd — Modern Alternative to find

`fd` is a faster, simpler alternative to `find` with sane defaults.

### Install fd

```bash
# Ubuntu/Debian
sudo apt install fd-find

# macOS
brew install fd
```

### Key Advantages

- Ignores `.gitignore` patterns by default
- Colorized output
- Smart case sensitivity
- Simpler syntax

### Examples

```bash
# Find by extension (no -name or quotes needed)
fd -e py

# Find directories only
fd -t d "config"

# Find and execute
fd -e py -x chmod +x {}

# Include hidden files
fd -H ".bashrc"
```

---

## Practical Exercises

### Exercise 1: Finding Files by Name

```bash
# Create test structure
mkdir -p project/{src,tests,docs}
touch project/src/{app.py,utils.py,config.json}
touch project/tests/{test_app.py,test_utils.py}
touch project/docs/{README.md,CHANGELOG.md}

# Find all Python files
find project/ -name "*.py"

# Find all Markdown files
find project/ -name "*.md"

# Find files with "test" in the name
find project/ -name "*test*"
```

### Exercise 2: Find with Actions

```bash
# Create some files
mkdir scripts
echo '#!/bin/bash' > scripts/deploy.sh
echo '#!/bin/bash' > scripts/backup.sh

# Find scripts and make them executable
find scripts/ -name "*.sh" -exec chmod +x {} \;

# Verify
ls -l scripts/
```

### Exercise 3: Using which, whereis, type

```bash
# Check where common commands are
which bash
which python3
which git

# Get full info
whereis bash

# Check command types
type echo
type cd
type ls
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `find . -name "*.txt"` | Find by name |
| `find . -iname "*.txt"` | Find by name (case-insensitive) |
| `find . -type f` | Find files only |
| `find . -type d` | Find directories only |
| `find . -size +100M` | Find files larger than 100MB |
| `find . -mtime -7` | Find modified in last 7 days |
| `find . -exec cmd {} \;` | Execute command on results |
| `find . -delete` | Delete found files |
| `find . -maxdepth 1` | Search current directory only |
| `locate filename` | Fast database search |
| `which command` | Find command executable |
| `whereis command` | Find binary, source, man pages |
| `type command` | Show command type |

---

## Summary

In this lesson, you learned:

- `find` searches the filesystem in real-time with many filters
- Search by name, type, size, time, permissions, and ownership
- `-exec` runs commands on found files
- Combine conditions with AND, OR (-o), and NOT (!)
- Always test with `-print` before using `-delete`
- `locate` is fast but searches a database (may be outdated)
- `which` finds executable locations in PATH
- `whereis` finds binaries, source, and man pages
- `type` reveals if a command is builtin, alias, or external
- `fd` is a modern, faster alternative to `find`

---
