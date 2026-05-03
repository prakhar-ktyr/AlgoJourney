---
title: Your First Commands
---

# Your First Commands

Now that you have access to a terminal, it's time to learn your first Linux commands! These are the commands you'll use every single day.

Think of the terminal as a conversation with your computer — you type a command, press Enter, and the computer responds.

---

## pwd — Print Working Directory

The `pwd` command tells you **where you are** in the file system. It prints the full path of your current directory.

```bash
pwd
```

**Output:**

```bash
/home/alice
```

Think of it like asking "Where am I right now?" The computer tells you the full address.

### Try It Yourself

Open your terminal and type `pwd`. You should see something like `/home/yourusername` or `/Users/yourusername` (on macOS).

```bash
# You are always "somewhere" in the file system
pwd
# /home/alice

# After changing directories, pwd shows the new location
cd /etc
pwd
# /etc
```

---

## ls — List Directory Contents

The `ls` command **lists** what's inside a directory — files, folders, everything.

### Basic ls

```bash
ls
```

**Output:**

```bash
Desktop  Documents  Downloads  Music  Pictures  Videos
```

### ls -l (Long Format)

The `-l` flag shows detailed information: permissions, owner, size, and date.

```bash
ls -l
```

**Output:**

```bash
total 24
drwxr-xr-x 2 alice alice 4096 Jan 15 09:30 Desktop
drwxr-xr-x 5 alice alice 4096 Jan 14 14:22 Documents
drwxr-xr-x 2 alice alice 4096 Jan 15 08:45 Downloads
drwxr-xr-x 2 alice alice 4096 Dec 20 11:00 Music
drwxr-xr-x 3 alice alice 4096 Jan 10 16:30 Pictures
drwxr-xr-x 2 alice alice 4096 Dec 15 09:00 Videos
```

### ls -la (Show Hidden Files)

Files starting with a dot (`.`) are hidden. Use `-a` to see them all.

```bash
ls -la
```

**Output:**

```bash
total 56
drwxr-xr-x 8 alice alice 4096 Jan 15 09:30 .
drwxr-xr-x 3 root  root  4096 Jan  1 00:00 ..
-rw-r--r-- 1 alice alice  220 Jan  1 00:00 .bash_logout
-rw-r--r-- 1 alice alice 3771 Jan  1 00:00 .bashrc
-rw-r--r-- 1 alice alice  807 Jan  1 00:00 .profile
drwxr-xr-x 2 alice alice 4096 Jan 15 09:30 Desktop
drwxr-xr-x 5 alice alice 4096 Jan 14 14:22 Documents
drwxr-xr-x 2 alice alice 4096 Jan 15 08:45 Downloads
```

### ls -lh (Human-Readable Sizes)

The `-h` flag makes file sizes easier to read (KB, MB, GB instead of bytes).

```bash
ls -lh
```

**Output:**

```bash
total 1.2G
-rw-r--r-- 1 alice alice 4.5K Jan 15 09:30 notes.txt
-rw-r--r-- 1 alice alice 2.3M Jan 14 14:22 photo.jpg
-rw-r--r-- 1 alice alice 1.1G Jan 15 08:45 video.mp4
```

### Combining Flags

You can combine multiple flags together:

```bash
# All three flags combined
ls -lah

# List a specific directory
ls -l /etc

# List only .txt files
ls *.txt
```

### Try It Yourself

```bash
# List your home directory
ls ~

# List with details
ls -l

# Show hidden files too
ls -la

# Human-readable sizes with hidden files
ls -lah

# List contents of another directory
ls /usr/bin
```

---

## cd — Change Directory

The `cd` command **moves** you to a different directory. It's like walking to a different room.

### Basic cd

```bash
# Move to the Documents folder
cd Documents

# Verify you moved
pwd
# /home/alice/Documents
```

### cd .. (Go Up One Level)

Two dots (`..`) means "the parent directory" — one level up.

```bash
pwd
# /home/alice/Documents

cd ..

pwd
# /home/alice
```

### cd ~ (Go Home)

The tilde (`~`) is a shortcut for your home directory.

```bash
# These all take you home:
cd ~
cd
cd $HOME
```

### cd - (Go Back)

A dash (`-`) takes you to the **previous** directory you were in.

```bash
pwd
# /home/alice

cd /etc
pwd
# /etc

cd -
pwd
# /home/alice
```

This is like the "Back" button in a web browser!

### cd with Absolute Paths

An absolute path starts with `/` and gives the full address:

```bash
# Go to an absolute path
cd /var/log

# Go to another user's home (if you have permission)
cd /home/bob

# Go to the root of the file system
cd /
```

### Try It Yourself

```bash
# Start at home
cd ~
pwd

# Go into Documents
cd Documents
pwd

# Go up one level
cd ..
pwd

# Go to /tmp
cd /tmp
pwd

# Jump back to where you were
cd -
pwd
```

---

## echo — Print Text

The `echo` command **prints text** to the screen. Simple but incredibly useful!

### Print a Message

```bash
echo "Hello, World!"
```

**Output:**

```bash
Hello, World!
```

### Print Variables

```bash
echo $USER
# alice

echo $HOME
# /home/alice

echo "Hello, $USER! Your home is $HOME"
# Hello, alice! Your home is /home/alice
```

### Single vs Double Quotes

```bash
# Double quotes: variables are expanded
echo "Hello, $USER"
# Hello, alice

# Single quotes: everything is literal
echo 'Hello, $USER'
# Hello, $USER
```

### Print Without Newline

```bash
echo -n "Loading"
echo -n "."
echo -n "."
echo "done!"
# Loading..done!
```

### Print Special Characters

```bash
# Use -e to enable escape sequences
echo -e "Line 1\nLine 2\nLine 3"
# Line 1
# Line 2
# Line 3

echo -e "Column1\tColumn2\tColumn3"
# Column1    Column2    Column3
```

### Try It Yourself

```bash
# Print your username
echo "My name is $USER"

# Print today's date in a message
echo "Today is $(date)"

# Print the current directory
echo "I am in: $(pwd)"
```

---

## clear — Clear the Screen

When your terminal gets cluttered, `clear` gives you a fresh start.

```bash
clear
```

### Keyboard Shortcut

You can also press **Ctrl+L** — it's faster than typing `clear`.

```bash
# Both do the same thing:
clear        # Type this command
# Ctrl+L    # Or press this shortcut
```

> **Note:** `clear` doesn't delete your history. You can still scroll up to see previous output.

---

## whoami — Current User

The `whoami` command tells you which user you're logged in as.

```bash
whoami
```

**Output:**

```bash
alice
```

This is useful when you're working on shared servers or switching between users.

```bash
# Check who you are
whoami
# alice

# Compare with the $USER variable
echo $USER
# alice

# They should match!
```

---

## date — Current Date and Time

The `date` command shows the current date and time.

```bash
date
```

**Output:**

```bash
Mon Jan 15 09:45:32 UTC 2024
```

### Custom Formats

```bash
# Just the date
date +%Y-%m-%d
# 2024-01-15

# Just the time
date +%H:%M:%S
# 09:45:32

# Day of the week
date +%A
# Monday

# Custom format
date "+%B %d, %Y at %I:%M %p"
# January 15, 2024 at 09:45 AM
```

### Common Format Codes

```bash
# %Y — Year (2024)
# %m — Month (01-12)
# %d — Day (01-31)
# %H — Hour 24h (00-23)
# %M — Minute (00-59)
# %S — Second (00-59)
# %A — Day name (Monday)
# %B — Month name (January)
# %I — Hour 12h (01-12)
# %p — AM/PM
```

### Try It Yourself

```bash
# Current date and time
date

# ISO format
date +%Y-%m-%d

# Timestamp for filenames
date +%Y%m%d_%H%M%S

# How many seconds since epoch (Jan 1, 1970)
date +%s
```

---

## cal — Calendar

The `cal` command displays a simple calendar.

```bash
cal
```

**Output:**

```bash
    January 2024
Su Mo Tu We Th Fr Sa
    1  2  3  4  5  6
 7  8  9 10 11 12 13
14 15 16 17 18 19 20
21 22 23 24 25 26 27
28 29 30 31
```

### Calendar Options

```bash
# Show a specific month
cal 3 2024
# March 2024

# Show the entire year
cal 2024

# Show previous, current, and next month
cal -3

# Highlight today
cal --color
```

### Try It Yourself

```bash
# This month
cal

# Your birth month/year
cal 6 1995

# The whole year
cal 2024
```

---

## uname — System Information

The `uname` command shows information about your operating system.

```bash
uname
```

**Output:**

```bash
Linux
```

### uname -a (All Information)

```bash
uname -a
```

**Output:**

```bash
Linux mycomputer 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux
```

### Individual Pieces

```bash
# Kernel name
uname -s
# Linux

# Hostname
uname -n
# mycomputer

# Kernel version
uname -r
# 5.15.0-91-generic

# Machine architecture
uname -m
# x86_64

# Operating system
uname -o
# GNU/Linux
```

---

## history — Command History

The shell remembers every command you type. `history` shows them all.

```bash
history
```

**Output:**

```bash
  1  pwd
  2  ls -la
  3  cd Documents
  4  ls
  5  cat readme.txt
  6  cd ..
  7  history
```

### Repeat Previous Commands

```bash
# Repeat the last command
!!

# Repeat command number 3
!3

# Repeat the last command that started with "cd"
!cd

# Search history interactively (Ctrl+R)
# Type part of a command, press Ctrl+R to search
```

### History Tips

```bash
# Show last 10 commands
history 10

# Search history with grep
history | grep "git"

# Clear history
history -c

# Run last command with sudo
sudo !!
```

### Try It Yourself

```bash
# Run a few commands first
pwd
ls
date
whoami

# Now check your history
history

# Repeat the date command
!date

# Repeat the last command
!!
```

---

## Putting It All Together

Here's a practice session combining all commands:

```bash
# 1. Where am I?
pwd

# 2. What's here?
ls -la

# 3. Who am I?
whoami

# 4. What's the date?
date "+%A, %B %d, %Y"

# 5. Print a greeting
echo "Hello, $USER! Welcome to $(uname -s)!"

# 6. Check the calendar
cal

# 7. Move to /tmp
cd /tmp

# 8. Confirm the move
pwd

# 9. Go back home
cd ~

# 10. Clear the screen
clear
```

---

## Quick Reference

| Command | What It Does | Example |
|---------|-------------|---------|
| `pwd` | Show current directory | `pwd` |
| `ls` | List files | `ls -lah` |
| `cd` | Change directory | `cd Documents` |
| `echo` | Print text | `echo "Hello"` |
| `clear` | Clear screen | `clear` or Ctrl+L |
| `whoami` | Show current user | `whoami` |
| `date` | Show date/time | `date +%Y-%m-%d` |
| `cal` | Show calendar | `cal` |
| `uname` | System info | `uname -a` |
| `history` | Command history | `history` |

---

## Exercises

### Exercise 1: Explore Your System

```bash
# Print your username
whoami

# Print your home directory
echo $HOME

# What operating system are you on?
uname -a

# What's today's date in YYYY-MM-DD format?
date +%Y-%m-%d
```

### Exercise 2: Navigate and List

```bash
# Go to your home directory
cd ~

# List all files (including hidden)
ls -la

# Go to /etc
cd /etc

# List the first 10 items
ls | head -10

# Go back home
cd ~
```

### Exercise 3: History Tricks

```bash
# Run several commands
echo "one"
echo "two"
echo "three"

# Check history
history | tail -5

# Repeat the second echo
!echo

# Repeat the very last command
!!
```

---

## Summary

You've learned 10 essential commands that form the foundation of working in the terminal:

- **pwd** — know where you are
- **ls** — see what's around you
- **cd** — move around
- **echo** — print messages
- **clear** — clean up the screen
- **whoami** — check your identity
- **date** — check the time
- **cal** — view the calendar
- **uname** — check your system
- **history** — recall past commands

In the next lesson, you'll learn how to get help when you don't remember how a command works!
