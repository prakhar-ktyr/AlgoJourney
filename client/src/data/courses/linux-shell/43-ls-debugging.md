---
title: Debugging Scripts
---

# Debugging Scripts

When your bash script doesn't work as expected, you need debugging tools. Bash provides built-in tracing, verbose output, and strategies to find and fix bugs quickly.

---

## set -x: Trace Mode

`set -x` prints every command **before** it executes, showing exactly what bash is doing:

```bash
#!/bin/bash
set -x

name="World"
greeting="Hello, $name"
echo "$greeting"
```

**Output:**

```
+ name=World
+ greeting='Hello, World'
+ echo 'Hello, World'
Hello, World
```

Each traced line starts with `+` so you can distinguish debug output from normal output.

---

## Enabling and Disabling Tracing

You don't have to trace the entire script:

```bash
#!/bin/bash

echo "This is NOT traced"

set -x
result=$((5 + 3))
echo "Result: $result"
set +x

echo "This is NOT traced either"
```

**Output:**

```
This is NOT traced
+ result=8
+ echo 'Result: 8'
Result: 8
+ set +x
This is NOT traced either
```

---

## Running a Script with Tracing

Enable tracing without modifying the script:

```bash
# Run with tracing from the command line
bash -x script.sh

# With arguments
bash -x script.sh arg1 arg2

# Combine with other flags
bash -ex script.sh    # trace + exit on error
bash -eux script.sh   # trace + exit on error + undefined vars
```

---

## set -v: Verbose Mode

`set -v` prints each line **as it's read** (before variable expansion):

```bash
#!/bin/bash
set -v

name="World"
echo "Hello, $name"
```

**Output:**

```
name="World"
echo "Hello, $name"
Hello, World
```

| Mode | Shows | Expansion |
|------|-------|-----------|
| `set -x` | Commands as executed | Variables expanded |
| `set -v` | Lines as read | Variables NOT expanded |

---

## Customizing Trace Output with PS4

`PS4` controls the prefix shown in trace mode (default is `+ `):

```bash
#!/bin/bash

# Show script name and line number
PS4='+ ${BASH_SOURCE}:${LINENO}: '
set -x

echo "Hello"
echo "World"
```

**Output:**

```
+ script.sh:6: echo Hello
+ script.sh:7: echo World
```

**Advanced PS4 with function names:**

```bash
#!/bin/bash
export PS4='+(${BASH_SOURCE}:${LINENO}): ${FUNCNAME[0]:+${FUNCNAME[0]}(): }'
set -x

greet() {
  local name="$1"
  echo "Hello, $name"
}

greet "Alice"
```

**Output:**

```
+(script.sh:10): main(): greet Alice
+(script.sh:7): greet(): local name=Alice
+(script.sh:8): greet(): echo 'Hello, Alice'
```

---

## trap ERR: Catch Errors with Context

```bash
#!/bin/bash
set -euo pipefail

trap 'echo "ERROR at line $LINENO: command \"$BASH_COMMAND\" failed with exit code $?"' ERR

echo "Step 1: OK"
echo "Step 2: OK"
ls /nonexistent_path    # This will fail
echo "Step 3: Never reached"
```

**Output:**

```
Step 1: OK
Step 2: OK
ERROR at line 8: command "ls /nonexistent_path" failed with exit code 2
```

---

## Comprehensive Error Trap

```bash
#!/bin/bash
set -euo pipefail

error_handler() {
  local exit_code=$?
  local line_number=$1
  local command=$2

  echo "" >&2
  echo "═══════════════════════════════════" >&2
  echo "  SCRIPT ERROR" >&2
  echo "  File:    ${BASH_SOURCE[1]}" >&2
  echo "  Line:    $line_number" >&2
  echo "  Command: $command" >&2
  echo "  Code:    $exit_code" >&2
  echo "═══════════════════════════════════" >&2
}

trap 'error_handler $LINENO "$BASH_COMMAND"' ERR
```

---

## Debug Function

Create a reusable debug function toggled by environment variable:

```bash
#!/bin/bash

DEBUG=${DEBUG:-false}

debug() {
  if [[ "$DEBUG" == true ]]; then
    echo "[DEBUG] $*" >&2
  fi
}

debug_var() {
  if [[ "$DEBUG" == true ]]; then
    local var_name="$1"
    local var_value="${!1}"
    echo "[DEBUG] $var_name = '$var_value'" >&2
  fi
}

# Usage
name="Alice"
count=42

debug "Starting script"
debug_var name
debug_var count
```

**Run normally vs with debugging:**

```bash
./script.sh              # No debug output
DEBUG=true ./script.sh   # Shows debug lines
```

---

## Redirect Trace Output to a File

```bash
#!/bin/bash

# Use file descriptor 3 for trace output
exec 3> debug.log
BASH_XTRACEFD=3
set -x

echo "Normal output (visible)"
# Trace output goes to debug.log only
```

---

## ShellCheck: Static Analysis

**ShellCheck** finds bugs without running your script:

```bash
# Install shellcheck
sudo apt install shellcheck    # Debian/Ubuntu
brew install shellcheck        # macOS

# Run on a script
shellcheck script.sh
```

---

## Common ShellCheck Warnings

```bash
#!/bin/bash

# SC2086: Double quote to prevent globbing and word splitting
name="hello world"
echo $name          # WARNING: unquoted variable
echo "$name"        # FIXED

# SC2046: Quote command substitution
rm $(find . -name "*.tmp")   # WARNING

# FIXED: use while loop
find . -name "*.tmp" -print0 | while IFS= read -r -d '' file; do
  rm "$file"
done

# SC2155: Declare and assign separately
local result=$(command)    # WARNING
local result               # FIXED
result=$(command)

# SC2164: Use cd ... || exit
cd /some/dir        # WARNING: may fail silently
cd /some/dir || exit 1  # FIXED
```

---

## Common Bugs and How to Find Them

### Bug 1: Quoting Issues

```bash
# BUG: breaks on filenames with spaces
for file in $(find . -name "*.txt"); do
  echo "$file"
done

# FIX: use while read with null delimiter
while IFS= read -r -d '' file; do
  echo "$file"
done < <(find . -name "*.txt" -print0)
```

### Bug 2: Subshell Variable Loss

```bash
# BUG: count is always 0 (modified in subshell)
count=0
cat file.txt | while read -r line; do
  ((count++))
done
echo "$count"  # 0!

# FIX: redirect instead of pipe
count=0
while read -r line; do
  ((count++))
done < file.txt
echo "$count"  # Correct!
```

### Bug 3: Glob Expansion

```bash
# BUG in [ ] (single brackets):
if [ "$var" == *.txt ]; then  # Glob expands!
  echo "match"
fi

# FIX: use [[ ]] for pattern matching
if [[ "$var" == *.txt ]]; then
  echo "match"
fi
```

---

## Debugging Strategy: Dry Run Mode

```bash
#!/bin/bash

DRY_RUN=${DRY_RUN:-false}

run() {
  if [[ "$DRY_RUN" == true ]]; then
    echo "[DRY RUN] $*" >&2
  else
    "$@"
  fi
}

# Usage — real commands wrapped with run()
run mkdir -p /deploy/app
run cp -r build/* /deploy/app/
run systemctl restart myapp

# Test without actually doing anything:
# DRY_RUN=true ./deploy.sh
```

---

## Debugging Strategy: Assertions

```bash
#!/bin/bash

assert() {
  local condition="$1"
  local message="${2:-Assertion failed}"

  if ! eval "$condition"; then
    echo "ASSERTION FAILED: $message" >&2
    echo "  Condition: $condition" >&2
    echo "  Location: ${BASH_SOURCE[1]}:${BASH_LINENO[0]}" >&2
    exit 99
  fi
}

# Usage
count=5
assert '[[ $count -gt 0 ]]' "count must be positive"
assert '[[ -f "config.txt" ]]' "config.txt must exist"
```

---

## Common Debugging Checklist

When a script doesn't work, check these in order:

```bash
# 1. Check syntax
bash -n script.sh

# 2. Run with tracing
bash -x script.sh

# 3. Check with ShellCheck
shellcheck script.sh

# 4. Verify permissions
ls -la script.sh

# 5. Check shebang
head -1 script.sh  # Should be #!/bin/bash

# 6. Check for hidden characters (Windows line endings)
cat -A script.sh | head -5  # Shows ^M for \r\n

# 7. Fix Windows line endings
sed -i 's/\r$//' script.sh
```

---

## Debugging Cron Jobs

Cron runs with a minimal environment — scripts that work manually may fail:

```bash
#!/bin/bash
# Always use full paths in cron scripts

# Log everything for debugging
exec > /tmp/cronjob.log 2>&1
set -x

# Source profile for environment variables
source /home/user/.profile

# Use absolute paths
/usr/bin/python3 /home/user/scripts/backup.py

echo "Cron job completed at $(date)"
```

---

## Summary

| Tool | Purpose | Usage |
|------|---------|-------|
| `set -x` | Trace commands | Show expanded commands |
| `set +x` | Stop tracing | Turn off trace |
| `set -v` | Verbose mode | Show lines as read |
| `bash -x` | External trace | Trace without editing |
| `PS4` | Custom trace prefix | Add line numbers |
| `trap ERR` | Catch errors | Show error context |
| `shellcheck` | Static analysis | Find bugs without running |
| `bash -n` | Syntax check | Find syntax errors only |
| `BASH_XTRACEFD` | Trace to file | Separate trace from output |
| `DEBUG` variable | Conditional debug | Toggle debug output |

---

## Exercises

1. Write a script with a bug (unquoted variable with spaces) and use `set -x` to find it
2. Create a `PS4` that shows timestamp, filename, line number, and function name
3. Write a debug function that can be toggled with an environment variable
4. Use ShellCheck on an existing script and fix all warnings
5. Create a script with a `--dry-run` flag that shows what it would do without doing it
