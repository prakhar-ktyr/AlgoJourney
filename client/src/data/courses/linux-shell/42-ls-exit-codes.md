---
title: Exit Codes & Error Handling
---

# Exit Codes & Error Handling

Every command in Linux returns an **exit code** (also called exit status or return code). Understanding exit codes is essential for writing robust scripts that handle errors gracefully.

---

## What Are Exit Codes?

When a command finishes, it returns a number between 0 and 255:

- **0** = success
- **Non-zero** = failure (or some specific condition)

```bash
# Check the exit code of the last command
ls /tmp
echo $?    # 0 (success)

ls /nonexistent
echo $?    # 2 (no such file)
```

---

## The $? Variable

`$?` holds the exit code of the **most recently executed** command:

```bash
# Successful command
true
echo $?    # 0

# Failed command
false
echo $?    # 1

# Real example
grep "pattern" file.txt
echo $?    # 0 if found, 1 if not found, 2 if error
```

**Important:** `$?` is overwritten by every command, including `echo`!

```bash
false
exit_code=$?
echo "Exit code was: $exit_code"
```

---

## Common Exit Codes

| Code | Meaning | Example |
|------|---------|---------|
| 0 | Success | Command ran fine |
| 1 | General error | Catchall for errors |
| 2 | Misuse of shell command | Invalid arguments |
| 126 | Permission problem | File not executable |
| 127 | Command not found | Typo in command name |
| 128+N | Killed by signal N | 130 = Ctrl+C (SIGINT) |
| 130 | Ctrl+C (SIGINT) | Script interrupted |
| 137 | SIGKILL (kill -9) | Force killed |
| 143 | SIGTERM | Graceful termination |

---

## Setting Exit Codes in Scripts

Use `exit N` to set your script's exit code:

```bash
#!/bin/bash

config_file="$1"

if [[ -z "$config_file" ]]; then
  echo "Usage: $0 <config_file>" >&2
  exit 1
fi

if [[ ! -f "$config_file" ]]; then
  echo "Error: File not found: $config_file" >&2
  exit 2
fi

echo "Config is valid!"
exit 0
```

---

## Using Exit Codes in Conditionals

`if` checks the exit code directly:

```bash
# if tests exit code (0 = true, non-zero = false)
if grep -q "error" logfile.txt; then
  echo "Errors found!"
fi

# Negation with !
if ! ping -c 1 google.com > /dev/null 2>&1; then
  echo "No internet connection"
fi
```

---

## && and || Operators

These use exit codes for flow control:

```bash
# && — run next only if previous succeeded
mkdir newdir && cd newdir && echo "Done"

# || — run next only if previous failed
cd /nonexistent || echo "Directory doesn't exist"

# Common pattern: do or die
cd "$target_dir" || exit 1

# Combine both (caution: not a true if/else)
command && echo "Success" || echo "Failed"
```

---

## set -e: Exit on Error

`set -e` makes your script exit immediately when any command fails:

```bash
#!/bin/bash
set -e

echo "Step 1: Creating directory"
mkdir /some/path

echo "Step 2: Copying files"
cp important.txt /some/path/

echo "Step 3: Done"
# If mkdir or cp fails, script stops immediately
```

**Gotchas:** `set -e` does NOT trigger in `if` conditions, after `&&`/`||`, or in pipeline middle commands.

---

## set -u: Error on Undefined Variables

`set -u` treats unset variables as errors:

```bash
#!/bin/bash
set -u

echo "$name"    # ERROR! 'name' is unset — script exits
```

**Handling optional variables with set -u:**

```bash
set -u

# Use default values to avoid errors
echo "${name:-unknown}"      # "unknown" if unset
echo "${count:-0}"           # "0" if unset

# Check if variable is set
if [[ -v name ]]; then
  echo "Name is: $name"
fi
```

---

## set -o pipefail: Pipe Failure Detection

By default, a pipeline's exit code is the **last command's** exit code:

```bash
# Without pipefail
false | true
echo $?    # 0 (only true's exit code matters!)

# With pipefail — exit code is the rightmost failure
set -o pipefail
false | true
echo $?    # 1 (false failed!)
```

---

## The Safety Trifecta: set -euo pipefail

The gold standard for robust bash scripts:

```bash
#!/bin/bash
set -euo pipefail

# -e: Exit on any error
# -u: Error on undefined variables
# -o pipefail: Catch errors in pipelines

echo "Running safely..."
```

---

## trap: Catching Signals and Errors

`trap` lets you run code when your script receives signals or exits:

```bash
trap 'commands' SIGNAL_LIST
```

**Common signals:**

| Signal | Trigger |
|--------|---------|
| EXIT | Script exits (any reason) |
| ERR | Command returns non-zero |
| INT | Ctrl+C pressed |
| TERM | kill command |

---

## trap EXIT: Cleanup on Exit

```bash
#!/bin/bash
set -euo pipefail

tmp_file=$(mktemp)

# Ensure cleanup happens no matter how script exits
trap 'rm -f "$tmp_file"' EXIT

echo "data" > "$tmp_file"
process_data "$tmp_file"
# Temp file is automatically deleted when script ends
```

**More complex cleanup:**

```bash
#!/bin/bash

cleanup() {
  echo "Cleaning up..."
  rm -f "$tmp_file" "$lock_file"
  [[ -d "$tmp_dir" ]] && rm -rf "$tmp_dir"
}

trap cleanup EXIT

tmp_file=$(mktemp)
tmp_dir=$(mktemp -d)
lock_file="/var/run/myapp.lock"
touch "$lock_file"
```

---

## trap ERR: Handle Errors

```bash
#!/bin/bash
set -euo pipefail

on_error() {
  echo "ERROR: Script failed at line $LINENO" >&2
  echo "Last command exit code: $?" >&2
}

trap on_error ERR

mkdir /protected/directory  # This will fail
echo "This won't print"
```

---

## trap INT: Handle Ctrl+C

```bash
#!/bin/bash

handle_interrupt() {
  echo ""
  echo "Caught Ctrl+C! Cleaning up..."
  exit 130
}

trap handle_interrupt INT

for i in {1..100}; do
  echo "Processing item $i..."
  sleep 1
done
```

---

## Error Handling Patterns

### Pattern 1: Check and exit

```bash
if ! command; then
  echo "Error: command failed" >&2
  exit 1
fi
```

### Pattern 2: Or-die

```bash
cd "$directory" || { echo "Can't enter $directory" >&2; exit 1; }
```

### Pattern 3: Custom die function

```bash
die() {
  echo "ERROR: $1" >&2
  exit "${2:-1}"
}

[[ -f "$config" ]] || die "Config file not found: $config"
[[ -n "$API_KEY" ]] || die "API_KEY not set" 2
```

### Pattern 4: Try/catch equivalent

```bash
if output=$(risky_command 2>&1); then
  echo "Success: $output"
else
  exit_code=$?
  echo "Failed (code $exit_code): $output" >&2
fi
```

---

## Comprehensive Error Handling Template

```bash
#!/bin/bash
set -euo pipefail

SCRIPT_NAME=$(basename "$0")
LOG_FILE="/tmp/${SCRIPT_NAME}.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }
die() { log "FATAL: $1" >&2; exit "${2:-1}"; }

cleanup() {
  local exit_code=$?
  if ((exit_code != 0)); then
    log "Script failed with exit code $exit_code"
  fi
  rm -f "${TMP_FILE:-}"
}
trap cleanup EXIT
trap 'log "Error at line $LINENO: $BASH_COMMAND"' ERR

main() {
  log "Starting $SCRIPT_NAME"
  [[ $# -ge 1 ]] || die "Usage: $SCRIPT_NAME <argument>"

  TMP_FILE=$(mktemp)
  log "Processing: $1"
  # ... do work ...
  log "Completed successfully"
}

main "$@"
```

---

## Exit Codes in Functions

Functions use `return` instead of `exit`:

```bash
is_valid_email() {
  local email="$1"
  if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    return 0
  else
    return 1
  fi
}

if is_valid_email "user@example.com"; then
  echo "Valid email"
else
  echo "Invalid email"
fi
```

---

## PIPESTATUS Array

`$PIPESTATUS` captures exit codes for every command in a pipeline:

```bash
false | true | false
echo "${PIPESTATUS[0]}"  # 1 (false)
echo "${PIPESTATUS[1]}"  # 0 (true)
echo "${PIPESTATUS[2]}"  # 1 (false)
```

---

## Summary

| Concept | Syntax | Purpose |
|---------|--------|---------|
| Check exit code | `$?` | Get last command's status |
| Exit on error | `set -e` | Stop script on failure |
| Undefined vars | `set -u` | Catch typos in var names |
| Pipe failures | `set -o pipefail` | Detect pipe errors |
| All three | `set -euo pipefail` | Maximum safety |
| Signal handler | `trap 'cmd' SIGNAL` | Catch events |
| Custom exit | `exit N` | Set script's exit code |
| Function return | `return N` | Set function's exit code |
| Die function | `die "msg"` | Error + exit pattern |
| Pipeline codes | `${PIPESTATUS[@]}` | Per-command exit codes |

---

## Exercises

1. Write a script that checks if a file exists, is readable, and contains at least 10 lines — exit with different codes for each failure
2. Create a `die()` function and use it to validate three command-line arguments
3. Write a script with `trap EXIT` that creates a temp directory, does work, and always cleans up
4. Use `set -euo pipefail` and handle a pipeline that might partially fail
5. Implement a retry function that attempts a network request up to 5 times with backoff
