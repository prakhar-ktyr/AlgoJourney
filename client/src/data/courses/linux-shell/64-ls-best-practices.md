---
title: Shell Script Best Practices
---

# Shell Script Best Practices

Writing a quick one-off script is easy. Writing a script that's reliable, maintainable, and doesn't break in production requires discipline. This lesson covers the conventions and practices used by professional shell script developers.

---

## 1. Always Use a Shebang

The shebang line tells the system which interpreter to use:

```bash
#!/bin/bash
```

Or for maximum portability across systems where bash may be in different locations:

```bash
#!/usr/bin/env bash
```

### Why It Matters

```bash
# Without a shebang, the script runs in whatever shell calls it
# This can cause subtle bugs if you use bash-specific features

# Bad: no shebang
echo "Hello"

# Good: explicit interpreter
#!/usr/bin/env bash
echo "Hello"
```

---

## 2. Use set -euo pipefail

Put this at the top of every script (right after the shebang):

```bash
#!/usr/bin/env bash
set -euo pipefail
```

### What Each Option Does

```bash
# set -e (errexit)
# Exit immediately if any command fails
set -e
false        # Script exits here!
echo "Never reached"

# set -u (nounset)
# Treat unset variables as errors
set -u
echo "$UNDEFINED_VAR"   # Script exits with error

# set -o pipefail
# Pipeline fails if ANY command in it fails (not just the last)
set -o pipefail
false | true    # Without pipefail: success. With pipefail: failure!
```

### Handling Expected Failures

Sometimes you expect a command to fail. Handle it explicitly:

```bash
#!/usr/bin/env bash
set -euo pipefail

# This is fine — the || provides a fallback
result=$(grep "pattern" file.txt || true)

# This is fine — we check the exit code
if ! grep -q "pattern" file.txt; then
    echo "Pattern not found"
fi

# This is fine — explicit handling
command_that_might_fail || {
    echo "Command failed, handling gracefully"
    # recovery logic
}
```

---

## 3. Quote All Variables

Unquoted variables are the #1 source of shell script bugs:

```bash
# BAD — breaks if filename contains spaces
file=my file.txt
cp $file backup/
# Runs: cp my file.txt backup/ (3 arguments!)

# GOOD — properly quoted
file="my file.txt"
cp "$file" backup/
# Runs: cp "my file.txt" backup/ (2 arguments)
```

### Always Quote

```bash
# BAD
if [ -f $file ]; then
    cat $file | grep $pattern
    rm $file
fi

# GOOD
if [[ -f "$file" ]]; then
    grep "$pattern" "$file"
    rm "$file"
fi
```

### When You Don't Need Quotes

```bash
# Assignments (right side) don't need quotes if no spaces
count=0
name="has spaces"

# Arithmetic context
(( count++ ))

# Inside [[ ]] on the right side of == with no spaces
[[ "$var" == pattern ]]
```

### The Special Cases

```bash
# Arrays — quote the expansion
files=("file 1.txt" "file 2.txt")
for f in "${files[@]}"; do   # Correct: preserves elements
    echo "$f"
done

# $@ vs $* — always use "$@" for arguments
for arg in "$@"; do
    echo "$arg"
done
```

---

## 4. Use [[ ]] Over [ ] in Bash

Double brackets are safer and more powerful:

```bash
# BAD — [ ] has many pitfalls
if [ $var = "hello" ]; then     # Fails if var is empty
if [ -f $file ]; then           # Fails if file has spaces
if [ $a -gt $b ]; then          # Error if a or b is empty

# GOOD — [[ ]] handles these correctly
if [[ "$var" == "hello" ]]; then
if [[ -f "$file" ]]; then
if [[ "$a" -gt "$b" ]]; then
```

### [[ ]] Advantages

```bash
# Pattern matching (glob)
if [[ "$file" == *.txt ]]; then
    echo "Text file"
fi

# Regex matching
if [[ "$email" =~ ^[a-zA-Z0-9.]+@[a-zA-Z0-9.]+$ ]]; then
    echo "Valid email format"
fi

# Logical operators (no need for -a, -o)
if [[ -f "$file" && -r "$file" ]]; then
    echo "File exists and is readable"
fi

# Safe with empty variables (no quoting issues)
if [[ -z $possibly_empty ]]; then
    echo "Variable is empty"
fi
```

---

## 5. Use $(command) Over Backticks

```bash
# BAD — backticks are hard to read and can't nest
date=`date`
files=`find . -name \`echo "*.txt"\``

# GOOD — $() is clear and nestable
date=$(date)
files=$(find . -name "$(echo "*.txt")")

# Nesting example
echo "Config dir: $(dirname $(readlink -f "$0"))/config"
```

---

## 6. Use Functions for Reusable Logic

```bash
#!/usr/bin/env bash
set -euo pipefail

# === Functions ===
log() {
    echo "[$(date '+%H:%M:%S')] $*" >&2
}

die() {
    log "ERROR: $*"
    exit 1
}

usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS] <input_file>

Options:
    -o FILE    Output file (default: stdout)
    -v         Verbose mode
    -h         Show this help

Examples:
    $(basename "$0") data.csv
    $(basename "$0") -o results.txt -v data.csv
EOF
    exit 0
}

# === Use them ===
log "Starting processing..."
[[ -f "$input" ]] || die "Input file not found: $input"
```

### Function Best Practices

```bash
# Use local variables to avoid polluting global scope
process_file() {
    local file="$1"
    local output="${2:-/dev/stdout}"
    local line_count

    line_count=$(wc -l < "$file")
    echo "Processing $file ($line_count lines)" > "$output"
}

# Return values via stdout (not global variables)
get_extension() {
    local file="$1"
    echo "${file##*.}"
}

ext=$(get_extension "document.pdf")
echo "$ext"  # pdf

# Use return codes for success/failure
is_valid_port() {
    local port="$1"
    [[ "$port" =~ ^[0-9]+$ ]] && (( port >= 1 && port <= 65535 ))
}

if is_valid_port "$PORT"; then
    echo "Valid port"
fi
```

---

## 7. Validate All Inputs

Never trust input — from arguments, files, or users:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Validate argument count
if (( $# < 1 )); then
    echo "Usage: $0 <filename>" >&2
    exit 1
fi

# Validate file exists and is readable
input="$1"
if [[ ! -f "$input" ]]; then
    echo "Error: File not found: $input" >&2
    exit 1
fi
if [[ ! -r "$input" ]]; then
    echo "Error: File not readable: $input" >&2
    exit 1
fi

# Validate numeric input
if [[ -n "${2:-}" ]]; then
    if ! [[ "$2" =~ ^[0-9]+$ ]]; then
        echo "Error: Second argument must be a number" >&2
        exit 1
    fi
fi

# Validate required environment variables
: "${DATABASE_URL:?Error: DATABASE_URL is not set}"
: "${API_KEY:?Error: API_KEY is not set}"
```

### Defensive Patterns

```bash
# Default values for optional variables
output_dir="${OUTPUT_DIR:-./output}"
max_retries="${MAX_RETRIES:-3}"
verbose="${VERBOSE:-false}"

# Validate before destructive operations
if [[ -z "$target_dir" ]]; then
    echo "Error: target_dir is empty — refusing to rm -rf" >&2
    exit 1
fi
rm -rf "${target_dir:?}/tmp"   # :? prevents rm -rf /tmp if empty
```

---

## 8. Use Meaningful Variable Names

```bash
# BAD
f=$1
d=$(date +%Y%m%d)
n=0
for x in *.log; do
    ((n++))
    cp "$x" "/backup/$d-$x"
done

# GOOD
input_file="$1"
today=$(date +%Y%m%d)
file_count=0
for log_file in *.log; do
    ((file_count++))
    cp "$log_file" "/backup/${today}-${log_file}"
done
echo "Backed up $file_count files"
```

### Naming Conventions

```bash
# Local variables: lowercase with underscores
local file_path="/tmp/data.txt"
local line_count=0

# Constants/environment: UPPER_CASE
readonly MAX_RETRIES=3
readonly CONFIG_DIR="/etc/myapp"
export DATABASE_URL="postgres://..."

# Functions: lowercase with underscores (verb_noun)
process_file() { ... }
validate_input() { ... }
send_notification() { ... }
```

---

## 9. Add Comments and Documentation

```bash
#!/usr/bin/env bash
#
# backup.sh — Create daily backups of application data
#
# Usage: backup.sh [OPTIONS]
#   -d DIR    Source directory (default: /var/app/data)
#   -o DIR    Backup destination (default: /backups)
#   -r N      Retain N days of backups (default: 30)
#   -h        Show help
#
# Environment:
#   BACKUP_ENCRYPTION_KEY — If set, encrypt backups with this key
#
# Exit codes:
#   0 — Success
#   1 — Invalid arguments
#   2 — Source directory not found
#   3 — Backup failed
#

set -euo pipefail

# Comment complex logic, not obvious code
# BAD: increment counter
((count++))

# GOOD: Skip the header row (first line is column names)
tail -n +2 "$input" | while IFS= read -r line; do
    ...
done
```

---

## 10. Handle Errors Gracefully

```bash
#!/usr/bin/env bash
set -euo pipefail

# Cleanup function for trap
cleanup() {
    local exit_code=$?
    if (( exit_code != 0 )); then
        echo "Error: Script failed with exit code $exit_code" >&2
        echo "  Last command: line $BASH_LINENO" >&2
    fi
    # Remove temp files
    rm -f "$TMPFILE"
    exit "$exit_code"
}

TMPFILE=$(mktemp)
trap cleanup EXIT

# Retry pattern for flaky operations
retry() {
    local max_attempts="${1:-3}"
    local delay="${2:-1}"
    shift 2
    local attempt=1

    while (( attempt <= max_attempts )); do
        if "$@"; then
            return 0
        fi
        echo "Attempt $attempt/$max_attempts failed. Retrying in ${delay}s..." >&2
        sleep "$delay"
        ((attempt++))
    done

    echo "All $max_attempts attempts failed" >&2
    return 1
}

# Usage
retry 3 2 curl -sf "https://api.example.com/health"
```

### Error Context with Line Numbers

```bash
#!/usr/bin/env bash
set -euo pipefail

# Show which line caused the error
trap 'echo "Error on line $LINENO: $BASH_COMMAND" >&2' ERR

# Now any failure shows context:
# Error on line 42: curl -sf https://api.example.com/data
```

---

## 11. Use ShellCheck

ShellCheck is a static analysis tool that catches common mistakes:

```bash
# Install ShellCheck
# macOS: brew install shellcheck
# Ubuntu: sudo apt install shellcheck

# Run on a script
shellcheck myscript.sh

# Example issues ShellCheck catches:
# SC2086: Double quote to prevent globbing and word splitting
# SC2046: Quote this to prevent word splitting
# SC2034: Variable appears unused
# SC2155: Declare and assign separately to avoid masking return values
```

### Common ShellCheck Fixes

```bash
# SC2155: Declare and assign separately
# BAD
local output=$(command)

# GOOD
local output
output=$(command)

# SC2086: Quote to prevent splitting
# BAD
rm $file

# GOOD
rm "$file"

# SC2046: Quote command substitution
# BAD
cp $(find . -name "*.bak") /backup/

# GOOD
while IFS= read -r -d '' file; do
    cp "$file" /backup/
done < <(find . -name "*.bak" -print0)
```

### Integrate in CI

```bash
# In your CI pipeline (GitHub Actions, etc.)
- name: Lint shell scripts
  run: |
    find . -name "*.sh" -exec shellcheck {} +
```

---

## 12. Portability: Bash vs POSIX sh

If your script must run on minimal systems (Alpine, BusyBox, old Unix):

```bash
# Bash-only features (NOT portable):
[[ ... ]]           # Use [ ... ] in POSIX
(( ... ))           # Use expr or [ "$a" -gt "$b" ]
arrays              # Not available in POSIX sh
local               # Use without local keyword
function keyword    # Use name() { ... } only
<<<                 # Here-strings (use echo ... | instead)
${var,,}            # Case conversion (use tr instead)
{1..10}            # Brace expansion (use seq instead)
```

### Portable Alternatives

```bash
# Instead of [[ ]]
if [ -f "$file" ] && [ -r "$file" ]; then
    echo "OK"
fi

# Instead of (( ))
count=$((count + 1))
if [ "$count" -gt 10 ]; then
    echo "More than 10"
fi

# Instead of arrays
# Use space-separated strings or files
files="file1.txt file2.txt file3.txt"
for f in $files; do
    echo "$f"
done

# Instead of <<<
echo "$var" | command

# Instead of ${var,,}
lower=$(echo "$var" | tr '[:upper:]' '[:lower:]')
```

---

## Example: Bad Script vs Good Script

### The Bad Script

```bash
#!/bin/sh
# dont change this it works (mostly)

dir=$1
if [ $dir = "" ]; then
    dir=.
fi

for f in `ls $dir`; do
    sz=`du -sh $dir/$f | awk '{print $1}'`
    ext=`echo $f | awk -F. '{print $NF}'`
    if [ $ext = "log" ]; then
        if [ `wc -l $dir/$f | awk '{print $1}'` -gt 1000 ]; then
            gzip $dir/$f
            echo "compressed $f"
        fi
    fi
done
```

Problems with this script:
- No `set -e` or error handling
- Unquoted variables (breaks on spaces)
- Uses `ls` in a for loop (never do this)
- Backticks instead of `$()`
- No input validation
- Parses `du` and `wc` output fragily
- No cleanup, no logging
- Misleading shebang (uses bash features with `#!/bin/sh`)

### The Good Script

```bash
#!/usr/bin/env bash
#
# compress-large-logs.sh — Compress .log files larger than N lines
#
# Usage: compress-large-logs.sh [DIRECTORY] [MIN_LINES]
#

set -euo pipefail

# === Configuration ===
readonly DEFAULT_DIR="."
readonly DEFAULT_MIN_LINES=1000

# === Functions ===
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >&2
}

die() {
    log "ERROR: $*"
    exit 1
}

usage() {
    cat <<EOF >&2
Usage: $(basename "$0") [DIRECTORY] [MIN_LINES]

Compress .log files with more than MIN_LINES lines.

Arguments:
    DIRECTORY    Directory to scan (default: .)
    MIN_LINES    Minimum lines to trigger compression (default: 1000)

Example:
    $(basename "$0") /var/log 5000
EOF
    exit 1
}

# === Input Validation ===
if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    usage
fi

target_dir="${1:-$DEFAULT_DIR}"
min_lines="${2:-$DEFAULT_MIN_LINES}"

if [[ ! -d "$target_dir" ]]; then
    die "Directory not found: $target_dir"
fi

if ! [[ "$min_lines" =~ ^[0-9]+$ ]]; then
    die "MIN_LINES must be a positive number, got: $min_lines"
fi

# === Main Logic ===
compressed=0
skipped=0
errors=0

log "Scanning $target_dir for .log files > $min_lines lines"

while IFS= read -r -d '' log_file; do
    line_count=$(wc -l < "$log_file")

    if (( line_count > min_lines )); then
        if gzip "$log_file"; then
            log "Compressed: $log_file ($line_count lines)"
            ((compressed++))
        else
            log "WARNING: Failed to compress: $log_file"
            ((errors++))
        fi
    else
        ((skipped++))
    fi
done < <(find "$target_dir" -maxdepth 1 -name "*.log" -type f -print0)

# === Summary ===
log "Done: $compressed compressed, $skipped skipped, $errors errors"

if (( errors > 0 )); then
    exit 1
fi
```

---

## Quick Reference Checklist

Before committing any shell script, verify:

```bash
# 1. Has shebang?
head -1 script.sh   # Should be #!/usr/bin/env bash

# 2. Has strict mode?
grep "set -euo pipefail" script.sh

# 3. Variables quoted?
grep -n '$[^(({]' script.sh | grep -v '"'   # Find unquoted vars

# 4. Uses [[ ]] not [ ]?
grep -n '\[ ' script.sh   # Should be empty for bash scripts

# 5. ShellCheck passes?
shellcheck script.sh

# 6. Has error handling?
grep -n 'trap' script.sh

# 7. Validates inputs?
# Check first 30 lines for validation logic
head -30 script.sh
```

---

## Summary

| Practice | Why |
|----------|-----|
| `#!/usr/bin/env bash` | Explicit interpreter |
| `set -euo pipefail` | Fail fast on errors |
| Quote `"$variables"` | Prevent word splitting |
| Use `[[ ]]` | Safer conditionals |
| Use `$()` | Readable, nestable |
| Use functions | Reusable, testable |
| Validate inputs | Prevent surprises |
| Meaningful names | Readable code |
| Comments | Explain why, not what |
| `trap cleanup EXIT` | Always clean up |
| ShellCheck | Catch mistakes early |
| Know POSIX limits | Write portable code |

### The Golden Rules

1. **If it's not tested, it's broken** — run your script with edge cases
2. **If it's not quoted, it's a bug** — always quote variables
3. **If it's not validated, it's dangerous** — check all inputs
4. **If it can fail, handle it** — don't let errors pass silently
5. **If it's complex, use a real language** — bash isn't always the right tool

---
