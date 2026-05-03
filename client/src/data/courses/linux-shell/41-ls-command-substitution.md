---
title: Command Substitution & Subshells
---

# Command Substitution & Subshells

Command substitution lets you capture the **output of a command** and use it as a value — in variables, arguments, or anywhere a string is expected. Subshells let you run commands in an **isolated child process**.

---

## What Is Command Substitution?

Command substitution runs a command and replaces itself with that command's standard output.

There are two syntaxes:

```bash
# Modern syntax (preferred)
$(command)

# Legacy syntax (backticks)
`command`
```

---

## Basic Examples

```bash
# Store today's date in a variable
today=$(date +%Y-%m-%d)
echo "Today is $today"

# Use command output directly in a string
echo "You are logged in as $(whoami)"

# Count files in current directory
echo "There are $(ls | wc -l) files here"
```

**Output:**

```
Today is 2024-01-15
You are logged in as john
There are 12 files here
```

---

## $(command) vs \`command\`

Both do the same thing, but `$(...)` is preferred:

```bash
# These are equivalent
user=$(whoami)
user=`whoami`

# But $() is easier to read and nest
echo "Home: $(dirname $(which bash))"

# Backticks require escaping for nesting (ugly!)
echo "Home: `dirname \`which bash\``"
```

**Why prefer $()?**

| Feature | $() | Backticks |
|---------|-----|-----------|
| Nesting | Easy | Requires escaping |
| Readability | Clear | Can confuse with quotes |
| Modern scripts | Standard | Legacy |

---

## Capturing Command Output

The most common use: store command output in a variable.

```bash
# Get the current working directory
current_dir=$(pwd)
echo "Working in: $current_dir"

# Get system hostname
hostname=$(hostname)
echo "Machine: $hostname"

# Get number of running processes
proc_count=$(ps aux | wc -l)
echo "Running processes: $proc_count"

# Get disk usage percentage for root
disk_usage=$(df / | awk 'NR==2 {print $5}')
echo "Disk usage: $disk_usage"
```

---

## Nesting Command Substitutions

You can nest `$(...)` inside another `$(...)`:

```bash
# Find the directory of the bash binary
bash_dir=$(dirname $(which bash))
echo "Bash lives in: $bash_dir"

# Get the real path of a symlinked command
real_python=$(readlink -f $(which python3))
echo "Python binary: $real_python"

# Count lines in the largest file
largest_file=$(ls -S | head -1)
line_count=$(wc -l < "$largest_file")
echo "$largest_file has $line_count lines"
```

**Deeper nesting:**

```bash
# Get the owner of the directory containing bash
owner=$(stat -c %U $(dirname $(which bash)))
echo "Owner: $owner"
```

---

## Command Substitution with Multiple Commands

You can use pipes, semicolons, and logic operators inside `$(...)`:

```bash
# Pipe inside substitution
upper_user=$(whoami | tr 'a-z' 'A-Z')
echo "USER: $upper_user"

# Multiple commands with semicolons
info=$(echo "User: $(whoami)"; echo "Date: $(date +%H:%M)")
echo "$info"

# Conditional inside substitution
status=$([ -f config.txt ] && echo "found" || echo "missing")
echo "Config: $status"
```

---

## Dynamic Filenames

Command substitution is perfect for creating dynamic filenames:

```bash
# Backup with timestamp
backup_file="backup_$(date +%Y%m%d_%H%M%S).tar.gz"
echo "Creating: $backup_file"
tar -czf "$backup_file" ./data/

# Log file with hostname
log_file="/var/log/$(hostname)_app.log"
echo "Logging to: $log_file"

# Unique temp file
tmp_file="/tmp/script_$(whoami)_$$.tmp"
echo "Temp file: $tmp_file"
```

---

## Subshells: (commands)

A **subshell** runs commands in a child process. Changes inside don't affect the parent.

```bash
# Syntax: wrap in parentheses
(commands)
```

**Example:**

```bash
# Current directory is preserved
echo "Before: $(pwd)"
(cd /tmp && echo "Inside subshell: $(pwd)")
echo "After: $(pwd)"
```

**Output:**

```
Before: /home/john
Inside subshell: /tmp
After: /home/john
```

The `cd` only affected the subshell — the parent stayed in `/home/john`.

---

## Subshell Environment Isolation

Variables set in a subshell don't leak to the parent:

```bash
name="Alice"

(
  name="Bob"
  new_var="Hello"
  echo "Inside: name=$name, new_var=$new_var"
)

echo "Outside: name=$name"
echo "Outside: new_var=$new_var"  # Empty!
```

**Output:**

```
Inside: name=Bob, new_var=Hello
Outside: name=Alice
Outside: new_var=
```

---

## When to Use Subshells

```bash
# 1. Temporary directory change
(cd /tmp && tar -xzf archive.tar.gz)

# 2. Temporary environment variable
(export PATH="/custom/bin:$PATH" && run_special_command)

# 3. Group commands for redirection
(
  echo "=== Report ==="
  echo "Date: $(date)"
  echo "User: $(whoami)"
  df -h
) > report.txt

# 4. Isolate set options
(
  set -e
  risky_command_1
  risky_command_2
)
# Parent continues even if subshell fails
echo "Still running"
```

---

## Process Substitution: <(command) and >(command)

Process substitution creates a **temporary file-like object** from command output. It's different from pipes!

```bash
# <(command) — treat command output as a file
diff <(ls dir1) <(ls dir2)

# >(command) — treat command input as a file
tee >(grep ERROR > errors.log) < input.txt
```

---

## Process Substitution: <(command)

Use `<(command)` where a filename is expected:

```bash
# Compare two command outputs
diff <(sort file1.txt) <(sort file2.txt)

# Compare remote and local file
diff <(ssh server cat /etc/config) /etc/config

# Feed multiple inputs to a command
paste <(cut -f1 data.csv) <(cut -f3 data.csv)

# Read from process substitution in a while loop
while read -r line; do
  echo "Processing: $line"
done < <(find . -name "*.log" -mtime -1)
```

---

## Process Substitution: >(command)

Use `>(command)` to send output to a command as if it were a file:

```bash
# Write to two places at once
echo "Hello" | tee >(cat > file1.txt) >(cat > file2.txt) > /dev/null

# Log and display simultaneously
./build.sh > >(tee build.log) 2> >(tee errors.log >&2)
```

---

## Process Substitution vs Pipes

```bash
# PIPE: runs in a subshell (variables are lost!)
count=0
echo -e "a\nb\nc" | while read -r line; do
  ((count++))
done
echo "Count: $count"  # Prints 0! (subshell issue)

# PROCESS SUBSTITUTION: runs in current shell
count=0
while read -r line; do
  ((count++))
done < <(echo -e "a\nb\nc")
echo "Count: $count"  # Prints 3! (correct)
```

---

## Practical: Conditional Logic from Command Output

```bash
# Check if a service is running
if pgrep -x "nginx" > /dev/null; then
  echo "Nginx is running"
else
  echo "Nginx is stopped"
fi

# Use command output in conditions
if [[ $(whoami) == "root" ]]; then
  echo "Running as root"
fi

# Check disk space and alert
usage=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
if (( usage > 80 )); then
  echo "WARNING: Disk usage at ${usage}%"
fi
```

---

## Practical: Build Scripts

```bash
#!/bin/bash
# Dynamic build script

VERSION=$(git describe --tags 2>/dev/null || echo "dev")
BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
COMMIT=$(git rev-parse --short HEAD)
BRANCH=$(git branch --show-current)

echo "Building version $VERSION"
echo "Commit: $COMMIT on branch $BRANCH"
echo "Build date: $BUILD_DATE"

# Create build directory with version
BUILD_DIR="build/$(echo $VERSION | tr '.' '_')"
mkdir -p "$BUILD_DIR"

# Compile with embedded info
gcc -o "$BUILD_DIR/app" \
  -DVERSION="\"$VERSION\"" \
  -DBUILD_DATE="\"$BUILD_DATE\"" \
  main.c
```

---

## Practical: System Information Script

```bash
#!/bin/bash
# Gather system info using command substitution

echo "=== System Report ==="
echo "Hostname:    $(hostname)"
echo "OS:          $(uname -s) $(uname -r)"
echo "Kernel:      $(uname -v)"
echo "Uptime:      $(uptime -p 2>/dev/null || uptime)"
echo "CPU:         $(nproc) cores"
echo "Memory:      $(free -h | awk '/Mem:/ {print $3 "/" $2}')"
echo "Disk:        $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}')"
echo "IP Address:  $(hostname -I 2>/dev/null | awk '{print $1}')"
echo "Users:       $(who | wc -l) logged in"
echo "Processes:   $(ps aux | wc -l)"
echo "Load Avg:    $(cat /proc/loadavg 2>/dev/null | cut -d' ' -f1-3)"
```

---

## Practical: File Processing

```bash
#!/bin/bash
# Rename files with dates

for file in *.jpg; do
  if [[ -f "$file" ]]; then
    # Get file modification date
    mod_date=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file")
    formatted_date=$(date -d "@$mod_date" +%Y%m%d 2>/dev/null)

    # Create new filename
    base=$(basename "$file" .jpg)
    new_name="${formatted_date}_${base}.jpg"

    echo "Renaming: $file -> $new_name"
    mv "$file" "$new_name"
  fi
done
```

---

## Arithmetic in Command Substitution

```bash
# Combine with arithmetic
total_kb=$(du -s /var/log | cut -f1)
total_mb=$(( total_kb / 1024 ))
echo "Logs: ${total_mb}MB"

# Calculate percentage
used=$(df / | awk 'NR==2 {print $3}')
total=$(df / | awk 'NR==2 {print $2}')
percent=$(( used * 100 / total ))
echo "Disk: ${percent}% used"
```

---

## Common Pitfalls

### Trailing newlines are stripped

```bash
# Command substitution strips trailing newlines
output=$(printf "hello\n\n\n")
echo "[$output]"  # Prints: [hello]

# Workaround: add a character and remove it
output=$(printf "hello\n\n\n"; echo x)
output="${output%x}"
```

### Word splitting with unquoted substitution

```bash
# WRONG — word splitting happens
files=$(ls)
for f in $files; do  # Breaks on spaces in filenames
  echo "$f"
done

# RIGHT — use proper tools
for f in *; do
  echo "$f"
done
```

### Command substitution in assignments doesn't need quotes

```bash
# Both work (no word splitting in assignments)
result=$(some_command)
result="$(some_command)"

# But in OTHER contexts, always quote!
echo "$(some_command)"    # Safe
echo $(some_command)      # Might break on spaces
```

---

## Summary

| Concept | Syntax | Purpose |
|---------|--------|---------|
| Command substitution | `$(cmd)` | Capture output |
| Legacy substitution | `` `cmd` `` | Same (avoid) |
| Subshell | `(cmds)` | Isolate changes |
| Process substitution | `<(cmd)` | Output as file |
| Process substitution | `>(cmd)` | Input as file |

**Key takeaways:**
- Use `$(...)` to capture command output in variables or strings
- Use subshells `(...)` to isolate directory changes or variable modifications
- Use process substitution `<(...)` when you need a filename but have command output
- Always quote `"$(command)"` except in variable assignments

---

## Exercises

1. Write a script that creates a backup file named `backup_YYYY-MM-DD_HH-MM-SS.tar.gz`
2. Use nested command substitution to find the size of the largest file in `/tmp`
3. Compare the output of two commands using `diff` and process substitution
4. Write a script that uses a subshell to temporarily change directory and perform work
5. Create a system info one-liner that shows hostname, user, and date all from command substitution
