---
title: Getting Help
---

# Getting Help

You don't need to memorize every command and every option. Linux has a powerful built-in help system. Learning to find answers quickly is more valuable than memorizing everything.

---

## man — The Manual Pages

The `man` command opens the **manual page** for any command. It's the most comprehensive help available.

```bash
man ls
```

This opens a detailed page explaining everything about `ls` — what it does, every option, examples, and more.

### Reading Man Pages

When a man page opens, you're in a **pager** (usually `less`). Here's how to navigate:

```bash
# Navigation inside man pages:
Space       # Scroll down one page
b           # Scroll up one page
Enter       # Scroll down one line
q           # Quit (exit the man page)
/search     # Search for "search" (forward)
?search     # Search for "search" (backward)
n           # Next search result
N           # Previous search result
g           # Go to beginning
G           # Go to end
h           # Help for the pager itself
```

### Try It Yourself

```bash
# Open the manual for ls
man ls

# Inside the man page:
# Press / then type "-l" to find the -l option
# Press n to jump to next match
# Press q to quit
```

### Man Page Structure

Every man page follows a standard structure:

```bash
# Typical sections in a man page:
NAME        # Command name and one-line description
SYNOPSIS    # How to use it (syntax)
DESCRIPTION # Detailed explanation
OPTIONS     # All available flags/options
EXAMPLES    # Usage examples (not always present)
FILES       # Related files
SEE ALSO    # Related commands
AUTHOR      # Who wrote it
BUGS        # Known issues
```

### Example: Reading man ls

```bash
man ls
```

You'll see something like:

```bash
LS(1)                     User Commands                     LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

DESCRIPTION
       List information about the FILEs (the current directory
       by default). Sort entries alphabetically if none of
       -cftuvSUX nor --sort is specified.

       -a, --all
              do not ignore entries starting with .

       -l     use a long listing format

       -h, --human-readable
              with -l, print sizes like 1K 234M 2G
```

---

## Man Page Sections (1-8)

Man pages are organized into **numbered sections**. Sometimes the same name exists in multiple sections.

```bash
# Section 1: User commands (most common)
man 1 ls
man 1 grep

# Section 2: System calls (kernel functions)
man 2 open
man 2 read

# Section 3: Library functions (C library)
man 3 printf
man 3 malloc

# Section 4: Special files (devices)
man 4 null
man 4 random

# Section 5: File formats (config files)
man 5 passwd
man 5 crontab

# Section 6: Games
man 6 fortune

# Section 7: Miscellaneous (conventions, protocols)
man 7 ascii
man 7 regex

# Section 8: System administration commands
man 8 mount
man 8 useradd
```

### Why Sections Matter

Some names appear in multiple sections:

```bash
# passwd the command (section 1)
man 1 passwd
# How to change your password

# passwd the file format (section 5)
man 5 passwd
# Format of /etc/passwd file

# printf the command (section 1)
man 1 printf

# printf the C function (section 3)
man 3 printf
```

### Finding Which Section

```bash
# Search all sections for "passwd"
man -f passwd
# passwd (1)   - change user password
# passwd (5)   - the password file

# Same as whatis
whatis passwd
```

---

## --help Flag

Almost every command supports a `--help` flag for a quick summary.

```bash
ls --help
```

**Output (abbreviated):**

```bash
Usage: ls [OPTION]... [FILE]...
List information about the FILEs (the current directory by default).

Mandatory arguments to long options are mandatory for short options too.
  -a, --all                  do not ignore entries starting with .
  -A, --almost-all           do not list implied . and ..
  -l                         use a long listing format
  -h, --human-readable       with -l, print sizes like 1K 234M 2G
  -r, --reverse              reverse order while sorting
  -t                         sort by time, newest first
  -S                         sort by file size, largest first
```

### When to Use --help vs man

```bash
# Quick reminder of options → use --help
ls --help

# Full documentation with examples → use man
man ls
```

### Try It Yourself

```bash
# Get quick help for common commands
grep --help
cp --help
mkdir --help
chmod --help
find --help
```

> **Note:** Some commands use `-h` instead of `--help`. If one doesn't work, try the other.

```bash
# Some commands use -h
python3 -h

# Some use --help
git --help

# Some support both
curl -h
curl --help
```

---

## info — GNU Info Pages

The `info` command provides even more detailed documentation for GNU tools.

```bash
info coreutils
```

### Navigating Info Pages

```bash
# Navigation inside info:
Space       # Scroll down
Backspace   # Scroll up
n           # Next node (section)
p           # Previous node
u           # Up one level
Enter       # Follow a link (menu item)
l           # Go back (like browser back)
q           # Quit
Tab         # Jump to next link
/search     # Search
```

### Info vs Man

```bash
# Info pages are structured like a book with chapters
info bash

# Man pages are flat reference documents
man bash

# For GNU tools, info often has tutorials and examples
info grep
info sed
info awk
```

### Try It Yourself

```bash
# Browse the coreutils info page (ls, cp, mv, etc.)
info coreutils

# Get info on bash itself
info bash

# If info page doesn't exist, it falls back to man page
info ls
```

---

## whatis — One-Line Descriptions

The `whatis` command gives you a quick one-line description of a command.

```bash
whatis ls
```

**Output:**

```bash
ls (1)               - list directory contents
```

### Multiple Commands at Once

```bash
whatis ls cp mv rm mkdir
```

**Output:**

```bash
ls (1)               - list directory contents
cp (1)               - copy files and directories
mv (1)               - move (rename) files
rm (1)               - remove files or directories
mkdir (1)            - make directories
```

### Try It Yourself

```bash
# Quick descriptions of commands you know
whatis pwd cd echo date cal

# Find out what unfamiliar commands do
whatis awk sed grep find xargs

# Check a command before using it
whatis chmod
# chmod (1)  - change file mode bits
```

---

## apropos — Search by Keyword

Don't know the command name? Use `apropos` to search by keyword!

```bash
apropos "copy files"
```

**Output:**

```bash
cp (1)               - copy files and directories
install (1)          - copy files and set attributes
scp (1)              - secure copy (remote file copy program)
```

### More Search Examples

```bash
# Find commands related to "network"
apropos network

# Find commands related to "password"
apropos password

# Find commands related to "disk"
apropos disk

# Find commands related to "compress"
apropos compress
```

### Narrow Your Search

```bash
# Search only section 1 (user commands)
apropos -s 1 "edit"

# Use regex for more specific searches
apropos -r "^ls"

# Find commands about processes
apropos process | head -20
```

### Try It Yourself

```bash
# How do I search for files?
apropos "search file"
apropos "find file"

# How do I download something?
apropos download

# How do I view a file?
apropos "display file"
```

> **Tip:** If `apropos` returns nothing, try updating the database:
> ```bash
> sudo mandb
> ```

---

## type — What Kind of Command Is It?

The `type` command tells you whether something is a built-in, an alias, a function, or an external program.

```bash
type cd
```

**Output:**

```bash
cd is a shell builtin
```

### Different Types

```bash
# Shell builtin — part of bash itself
type cd
# cd is a shell builtin

type echo
# echo is a shell builtin

# External command — a program on disk
type ls
# ls is /usr/bin/ls (or aliased to 'ls --color=auto')

type grep
# grep is /usr/bin/grep

# Alias — a shortcut defined in your shell
type ll
# ll is aliased to 'ls -la'

# Function — a shell function
type my_function
# my_function is a function
```

### Why This Matters

```bash
# Knowing the type helps with debugging
# If a command behaves unexpectedly, check if it's aliased:
type ls
# ls is aliased to 'ls --color=auto'

# Use the raw command (bypass alias) with a backslash:
\ls

# Or find the actual path:
type -P ls
# /usr/bin/ls

# Show all definitions:
type -a echo
# echo is a shell builtin
# echo is /usr/bin/echo
```

### Try It Yourself

```bash
# Check various commands
type cd
type ls
type pwd
type grep
type python3
type git

# Find where a command lives
which ls
which python3
which git

# whereis shows man page locations too
whereis ls
# ls: /usr/bin/ls /usr/share/man/man1/ls.1.gz
```

---

## Online Resources

When built-in help isn't enough, these online tools are invaluable:

### tldr Pages

The `tldr` command provides simplified, practical examples (community-maintained).

```bash
# Install tldr
sudo apt install tldr    # Debian/Ubuntu
brew install tldr        # macOS

# Use it
tldr tar
```

**Output:**

```bash
tar
Archiving utility.

- Create an archive from files:
  tar cf target.tar file1 file2 file3

- Extract an archive:
  tar xf source.tar

- Create a gzipped archive:
  tar czf target.tar.gz file1 file2 file3

- Extract a gzipped archive:
  tar xzf source.tar.gz
```

### ExplainShell.com

A website that breaks down any command into its parts:

```bash
# Visit https://explainshell.com and paste:
find /home -name "*.txt" -mtime -7 -exec grep -l "TODO" {} \;

# It will explain each piece:
# find     → search for files
# /home    → starting directory
# -name    → match filename pattern
# -mtime   → modified time
# -exec    → run command on results
```

### Other Helpful Resources

```bash
# Check the command's official website
# Most tools link to docs in their man page under "SEE ALSO"

# Stack Overflow / Unix & Linux Stack Exchange
# Great for "how do I..." questions

# The Arch Wiki
# Excellent documentation even for non-Arch users

# GitHub repos often have READMEs with usage examples
```

---

## Reading Documentation Effectively

### Understanding SYNOPSIS Format

Man pages use a special notation in the SYNOPSIS:

```bash
# SYNOPSIS notation:
# [optional]    — square brackets mean optional
# REQUIRED      — no brackets means required
# ...           — ellipsis means repeatable
# a | b         — pipe means "or"

# Example: ls [OPTION]... [FILE]...
# Meaning: ls, followed by zero or more options,
#          followed by zero or more files

# Example: cp [OPTION]... SOURCE... DEST
# Meaning: cp, options, one or more sources, one destination

# Example: mkdir [OPTION]... DIRECTORY...
# Meaning: mkdir, options, one or more directory names
```

### Quick Lookup Strategy

```bash
# 1. Don't know the command? Search for it:
apropos "what you want to do"

# 2. Know the command, need quick syntax?
command --help

# 3. Need details on a specific option?
man command
# Then press / and search for the option

# 4. Want practical examples?
tldr command

# 5. Want to understand a complex command?
# Use explainshell.com
```

### Try It Yourself

```bash
# Practice the lookup strategy:

# 1. Find a command to count lines in a file
apropos "count lines"
# or
apropos "line count"
# → wc (word count)

# 2. Quick syntax check
wc --help

# 3. Full documentation
man wc

# 4. Simple examples
tldr wc
```

---

## Helpful Built-in Variables

Your shell has variables that provide useful information:

```bash
# Check your shell
echo $SHELL
# /bin/bash

# Check your shell version
echo $BASH_VERSION
# 5.1.16(1)-release

# Check your PATH (where commands are found)
echo $PATH
# /usr/local/bin:/usr/bin:/bin

# Check your terminal type
echo $TERM
# xterm-256color
```

---

## Quick Reference

| Command | What It Does | Example |
|---------|-------------|---------|
| `man cmd` | Full manual page | `man ls` |
| `cmd --help` | Quick help summary | `ls --help` |
| `info cmd` | Detailed GNU docs | `info bash` |
| `whatis cmd` | One-line description | `whatis grep` |
| `apropos keyword` | Search for commands | `apropos "copy"` |
| `type cmd` | What kind of command | `type cd` |
| `which cmd` | Path to command | `which python3` |
| `tldr cmd` | Practical examples | `tldr tar` |

---

## Exercises

### Exercise 1: Explore Man Pages

```bash
# Open the man page for grep
man grep

# Find what -i does (search for "-i")
# Press / then type "-i," and press Enter
# Answer: ignore case

# Find what -r does
# Answer: recursive search

# Quit with q
```

### Exercise 2: Find Commands

```bash
# Use apropos to find:

# A command to sort text
apropos sort

# A command to compare files
apropos compare

# A command to display disk usage
apropos "disk usage"
```

### Exercise 3: Identify Command Types

```bash
# Check the type of each:
type echo
type cat
type ls
type alias
type cd
type git

# Which are builtins? Which are external?
```

### Exercise 4: Quick Help

```bash
# Use --help to find out:

# How to make cp ask before overwriting?
cp --help | grep -i "interactive"
# Answer: cp -i

# How to make rm prompt before every removal?
rm --help | grep -i "prompt"
# Answer: rm -i

# How to make mkdir create parent directories?
mkdir --help | grep -i "parent"
# Answer: mkdir -p
```

---

## Summary

You now know how to find help for any command:

- **man** — full manual (most detailed)
- **--help** — quick reference
- **info** — book-style GNU documentation
- **whatis** — one-line summary
- **apropos** — search by keyword
- **type** — identify command type
- **tldr** — practical examples
- **explainshell.com** — visual command breakdown

The golden rule: **you don't need to memorize everything**. You just need to know how to look things up quickly!

In the next lesson, you'll learn about the Linux file system hierarchy — understanding how files and directories are organized.
