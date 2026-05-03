---
title: Introduction to Shell Scripting
---

# Introduction to Shell Scripting

Shell scripting lets you automate repetitive tasks by writing commands in a file. Instead of typing commands one by one, you write them once and run them whenever you need.

---

## What Is a Shell Script?

A **shell script** is a text file containing a series of commands that the shell can execute. Think of it as a recipe — a step-by-step list of instructions for the computer.

**Why use shell scripts?**

- Automate repetitive tasks
- Combine multiple commands into one action
- Schedule tasks to run automatically
- Reduce human error
- Save time

**Example:** Instead of typing 5 commands every morning to set up your workspace, you write them in a script and run it with one command.

---

## The Shebang Line

Every shell script should start with a **shebang** (also called hashbang):

```bash
#!/bin/bash
```

This tells the system which interpreter to use when running the script.

**Common shebangs:**

```bash
#!/bin/bash       # Use Bash shell
#!/bin/sh         # Use POSIX shell (more portable)
#!/bin/zsh        # Use Zsh shell
#!/usr/bin/env bash  # Find bash in PATH (most portable)
```

**Note:** The shebang must be the very first line — no blank lines or spaces before it!

---

## Creating Your First Script

Let's create a simple script called `hello.sh`:

```bash
#!/bin/bash
# My first shell script
echo "Hello, World!"
```

**Step 1:** Create the file:

```bash
nano hello.sh
```

**Step 2:** Type the script content and save (Ctrl+O, then Ctrl+X in nano).

You can also create it in one command:

```bash
cat > hello.sh << 'EOF'
#!/bin/bash
# My first shell script
echo "Hello, World!"
EOF
```

---

## Making a Script Executable

By default, a new file is not executable. You need to add execute permission:

```bash
chmod +x hello.sh
```

**Verify the permissions:**

```bash
ls -l hello.sh
```

**Output:**

```bash
-rwxr-xr-x 1 user user 52 Jan 15 10:00 hello.sh
```

The `x` in the permissions means it's now executable.

---

## Running Scripts

There are three ways to run a shell script:

### Method 1: Direct Execution (Recommended)

```bash
./hello.sh
```

**Note:** The `./` tells the shell to look in the current directory. This requires the file to be executable (`chmod +x`).

### Method 2: Using the Interpreter

```bash
bash hello.sh
```

This does NOT require the file to be executable. The `bash` command reads and executes it.

### Method 3: Using source

```bash
source hello.sh
```

Or the shorthand:

```bash
. hello.sh
```

**Important difference:** `source` runs the script in the CURRENT shell. This means any variables set in the script will remain available after it finishes. The other methods run in a sub-shell.

**Example showing the difference:**

```bash
#!/bin/bash
# test-source.sh
MY_VAR="I was set in the script"
```

```bash
# Run with ./
./test-source.sh
echo $MY_VAR        # Empty! Variable is gone

# Run with source
source test-source.sh
echo $MY_VAR        # "I was set in the script"
```

---

## Comments

Comments explain what your code does. The shell ignores them.

### Single-Line Comments

Use `#` for single-line comments:

```bash
#!/bin/bash

# This is a comment
echo "Hello"  # This is an inline comment

# The next line prints the date
date
```

### Multi-Line Comments (Workaround)

Bash doesn't have true multi-line comments, but you can use a heredoc trick:

```bash
#!/bin/bash

: << 'COMMENT'
This is a
multi-line comment.
The shell ignores all of this.
COMMENT

echo "This line runs normally"
```

**Best practice:** Just use multiple `#` lines — it's clearer:

```bash
#!/bin/bash

# This script backs up the home directory
# Author: Your Name
# Date: 2024-01-15
# Usage: ./backup.sh
```

---

## Script Structure

A well-organized script follows this structure:

```bash
#!/bin/bash
#
# Script Name: backup.sh
# Description: Backs up the Documents folder
# Author: Your Name
# Date: 2024-01-15
#

# --- Configuration ---
BACKUP_DIR="/tmp/backups"
SOURCE_DIR="$HOME/Documents"

# --- Functions ---
create_backup_dir() {
    mkdir -p "$BACKUP_DIR"
}

# --- Main Script ---
echo "Starting backup..."
create_backup_dir
cp -r "$SOURCE_DIR" "$BACKUP_DIR"
echo "Backup complete!"
```

---

## Output: echo and printf

### echo

The `echo` command prints text to the screen:

```bash
#!/bin/bash

echo "Hello, World!"
echo "Today is $(date)"
echo "Your home directory is $HOME"
```

**Useful echo options:**

```bash
echo -n "No newline at the end"    # No trailing newline
echo -e "Line 1\nLine 2"          # Enable escape sequences
echo -e "Tab\there"               # Tab character
echo -e "\033[1mBold text\033[0m" # Bold text (ANSI codes)
```

**Common escape sequences with `echo -e`:**

| Sequence | Meaning |
|----------|---------|
| `\n` | Newline |
| `\t` | Tab |
| `\\` | Backslash |
| `\a` | Alert (bell) |

### printf

`printf` gives you more control over formatting:

```bash
#!/bin/bash

printf "Hello, %s!\n" "World"
printf "Name: %s, Age: %d\n" "Alice" 30
printf "Price: $%.2f\n" 19.99
printf "Hex: %x\n" 255
```

**Output:**

```bash
Hello, World!
Name: Alice, Age: 30
Price: $19.99
Hex: ff
```

**Format specifiers:**

| Specifier | Meaning |
|-----------|---------|
| `%s` | String |
| `%d` | Integer |
| `%f` | Float |
| `%x` | Hexadecimal |
| `%o` | Octal |
| `%%` | Literal % |

**Padding and alignment:**

```bash
#!/bin/bash

printf "%-20s %5s %10s\n" "Name" "Age" "City"
printf "%-20s %5d %10s\n" "Alice" 30 "New York"
printf "%-20s %5d %10s\n" "Bob" 25 "London"
printf "%-20s %5d %10s\n" "Charlie" 35 "Tokyo"
```

**Output:**

```bash
Name                   Age       City
Alice                   30   New York
Bob                     25     London
Charlie                 35      Tokyo
```

---

## Exit Codes

Every command returns an **exit code** (also called return code or exit status):

- **0** = Success
- **1-255** = Failure (different numbers can mean different errors)

### Checking the Last Exit Code

The special variable `$?` holds the exit code of the last command:

```bash
#!/bin/bash

ls /tmp
echo "Exit code: $?"  # 0 (success)

ls /nonexistent_directory
echo "Exit code: $?"  # 2 (failure - no such file)
```

### Setting Exit Codes in Your Scripts

Use `exit` to set the exit code when your script finishes:

```bash
#!/bin/bash
# check-file.sh — Check if a file exists

FILE="/etc/passwd"

if [ -f "$FILE" ]; then
    echo "File exists: $FILE"
    exit 0    # Success
else
    echo "File not found: $FILE"
    exit 1    # Failure
fi
```

**Using exit codes in other scripts:**

```bash
#!/bin/bash

./check-file.sh
if [ $? -eq 0 ]; then
    echo "The check passed!"
else
    echo "The check failed!"
fi
```

**Common exit codes by convention:**

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Misuse of command |
| 126 | Command not executable |
| 127 | Command not found |
| 128+n | Killed by signal n |
| 130 | Terminated by Ctrl+C |

---

## Good Practices

### 1. Use Meaningful Names

```bash
# Bad
x.sh
script1.sh

# Good
backup-home.sh
deploy-website.sh
cleanup-logs.sh
```

### 2. Always Add Comments

```bash
#!/bin/bash
# deploy.sh — Deploy application to production server
# Usage: ./deploy.sh [version]
# Requires: ssh access to production server
```

### 3. Check for Errors

```bash
#!/bin/bash

# Stop on first error
set -e

# Stop on undefined variables
set -u

# Catch pipe errors
set -o pipefail

# All three combined (recommended for scripts):
set -euo pipefail
```

### 4. Use Meaningful Exit Codes

```bash
#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: $0 <filename>" >&2
    exit 1
fi
```

### 5. Quote Your Variables

```bash
#!/bin/bash

# Bad — breaks if filename has spaces
cp $file /backup/

# Good — handles spaces correctly
cp "$file" /backup/
```

---

## Putting It All Together

Here's a complete, well-structured script:

```bash
#!/bin/bash
#
# Script: greet.sh
# Description: Greets the user and shows system info
# Author: Your Name
# Date: 2024-01-15
# Usage: ./greet.sh
#

# Exit on errors
set -euo pipefail

# --- Main Script ---
echo "================================"
echo "  Welcome, $(whoami)!"
echo "================================"
echo ""
echo "Date     : $(date '+%Y-%m-%d %H:%M:%S')"
echo "Hostname : $(hostname)"
echo "OS       : $(uname -s)"
echo "Uptime   : $(uptime -p 2>/dev/null || uptime)"
echo "Shell    : $SHELL"
echo ""
echo "Have a productive day!"

exit 0
```

**Run it:**

```bash
chmod +x greet.sh
./greet.sh
```

**Output:**

```bash
================================
  Welcome, alice!
================================

Date     : 2024-01-15 10:30:45
Hostname : my-laptop
OS       : Linux
Uptime   : up 2 days, 5 hours
Shell    : /bin/bash

Have a productive day!
```

---

## Quick Reference

| Concept | Syntax |
|---------|--------|
| Shebang | `#!/bin/bash` |
| Make executable | `chmod +x script.sh` |
| Run script | `./script.sh` |
| Comment | `# comment` |
| Print text | `echo "text"` |
| Formatted output | `printf "%s\n" "text"` |
| Exit success | `exit 0` |
| Exit failure | `exit 1` |
| Last exit code | `$?` |
| Strict mode | `set -euo pipefail` |

---

## Try It Yourself

**Exercise 1:** Create a script that prints your name, the current date, and the current directory.

**Exercise 2:** Create a script that checks if a directory exists and prints an appropriate message with the correct exit code.

**Exercise 3:** Create a formatted report script using `printf` that displays a table of your favorite commands and what they do.

---

## Summary

- A shell script is a file containing commands the shell executes
- Start every script with `#!/bin/bash`
- Use `chmod +x` to make scripts executable
- Use `echo` and `printf` for output
- Every script should return meaningful exit codes
- Follow good practices: comments, error handling, quoting

Next, we'll learn about **variables and data types** — the building blocks of any script!
