---
title: Advanced Scripting Patterns
---

# Advanced Scripting Patterns

This lesson covers professional patterns that make shell scripts robust, maintainable, and production-ready. These techniques separate quick hacks from reliable automation tools.

---

## Script Organization

A well-organized script follows a predictable structure:

```bash
#!/bin/bash
# ============================================================
# script-name.sh — Brief description of what this script does
# Author: Your Name
# Date: 2024-01-15
# ============================================================

set -euo pipefail  # Strict mode

# --- Constants ---
readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
readonly VERSION="1.0.0"

# --- Configuration ---
LOG_LEVEL="${LOG_LEVEL:-info}"
CONFIG_FILE="${CONFIG_FILE:-/etc/myapp/config}"

# --- Functions ---
# (defined here)

# --- Main Logic ---
main() {
    # Entry point
    parse_args "$@"
    validate_environment
    do_work
    cleanup
}

# --- Run ---
main "$@"
```

---

## The "main" Pattern

Wrapping logic in a `main()` function has several benefits:
- Functions are defined before they're called
- Local variables stay scoped
- The script can be sourced without executing

```bash
#!/bin/bash
set -euo pipefail

usage() {
    cat <<EOF
Usage: $0 [OPTIONS] <target>

Options:
    -v, --verbose    Enable verbose output
    -d, --dry-run    Show what would be done
    -h, --help       Show this help message

Examples:
    $0 production
    $0 --dry-run staging
EOF
}

parse_args() {
    VERBOSE=false
    DRY_RUN=false
    TARGET=""

    while [[ $# -gt 0 ]]; do
        case "$1" in
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            -*)
                echo "Unknown option: $1" >&2
                usage
                exit 1
                ;;
            *)
                TARGET="$1"
                shift
                ;;
        esac
    done

    if [[ -z "$TARGET" ]]; then
        echo "Error: target is required" >&2
        usage
        exit 1
    fi
}

do_deploy() {
    echo "Deploying to $TARGET..."
    if [[ "$DRY_RUN" == true ]]; then
        echo "[DRY RUN] Would deploy to $TARGET"
        return
    fi
    # Actual deploy logic here
}

main() {
    parse_args "$@"
    do_deploy
}

main "$@"
```

---

## Temporary Files and Cleanup

### mktemp — Create safe temporary files

```bash
# Create a temporary file
TMPFILE=$(mktemp)
echo "Temp file: $TMPFILE"

# Create with a template (XXXXXX gets replaced)
TMPFILE=$(mktemp /tmp/myapp.XXXXXX)

# Create a temporary directory
TMPDIR=$(mktemp -d)
echo "Temp dir: $TMPDIR"

# Create with a specific suffix
TMPFILE=$(mktemp --suffix=.json)
```

### trap — Automatic Cleanup

`trap` ensures cleanup runs even if the script fails or is interrupted.

```bash
#!/bin/bash
set -euo pipefail

# Create temp resources
TMPFILE=$(mktemp)
TMPDIR=$(mktemp -d)

# Register cleanup function
cleanup() {
    local exit_code=$?
    rm -f "$TMPFILE"
    rm -rf "$TMPDIR"
    exit $exit_code
}

trap cleanup EXIT  # Runs on any exit (success, error, or signal)

# Now use TMPFILE and TMPDIR safely...
echo "working data" > "$TMPFILE"
cp important-files/* "$TMPDIR/"

# Process data...
sort "$TMPFILE" > "${TMPFILE}.sorted"
mv "${TMPFILE}.sorted" "$TMPFILE"

# When the script exits (any reason), cleanup runs automatically
echo "Done! Temp files will be cleaned up."
```

### Multiple traps

```bash
#!/bin/bash

TMPFILE=""
LOCKFILE=""

cleanup() {
    [[ -n "$TMPFILE" && -f "$TMPFILE" ]] && rm -f "$TMPFILE"
    [[ -n "$LOCKFILE" && -f "$LOCKFILE" ]] && rm -f "$LOCKFILE"
    echo "Cleanup complete."
}

on_interrupt() {
    echo ""
    echo "Interrupted by user."
    cleanup
    exit 130
}

trap cleanup EXIT
trap on_interrupt INT TERM

TMPFILE=$(mktemp)
LOCKFILE="/tmp/myscript.lock"
touch "$LOCKFILE"

# Long-running work here...
```

---

## Lock Files — Preventing Concurrent Execution

### Using flock

```bash
#!/bin/bash
# Prevent multiple instances of this script from running

LOCKFILE="/var/lock/myscript.lock"

# Method 1: flock with file descriptor
exec 200>"$LOCKFILE"
if ! flock -n 200; then
    echo "Another instance is already running. Exiting."
    exit 1
fi

# Script logic here...
echo "Running exclusively..."
sleep 10

# Lock is automatically released when the script exits
```

### flock with subshell

```bash
#!/bin/bash

LOCKFILE="/tmp/myscript.lock"

(
    # Try to acquire lock (wait up to 30 seconds)
    if ! flock -w 30 9; then
        echo "Could not acquire lock after 30 seconds. Exiting."
        exit 1
    fi

    # Critical section — only one instance runs this
    echo "Performing exclusive operation..."
    sleep 5
    echo "Done."

) 9>"$LOCKFILE"
```

### Simple PID-based lock

```bash
#!/bin/bash

PIDFILE="/tmp/myscript.pid"

# Check if already running
if [[ -f "$PIDFILE" ]]; then
    OLD_PID=$(cat "$PIDFILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "Already running (PID: $OLD_PID). Exiting."
        exit 1
    else
        echo "Stale PID file found. Removing."
        rm -f "$PIDFILE"
    fi
fi

# Write our PID
echo $$ > "$PIDFILE"

# Cleanup on exit
trap 'rm -f "$PIDFILE"' EXIT

# Script logic...
echo "Running with PID $$"
```

---

## Configuration Files

### Reading key=value configs

```bash
#!/bin/bash

CONFIG_FILE="${1:-/etc/myapp/config.conf}"

# Example config.conf:
# # This is a comment
# APP_NAME=MyApplication
# APP_PORT=3000
# DB_HOST=localhost
# DB_PORT=5432
# LOG_LEVEL=info

# Method 1: Source the file (simple but less safe)
# Only use this with trusted config files!
if [[ -f "$CONFIG_FILE" ]]; then
    source "$CONFIG_FILE"
fi

# Method 2: Parse safely (recommended)
read_config() {
    local config_file="$1"

    if [[ ! -f "$config_file" ]]; then
        echo "Config file not found: $config_file" >&2
        return 1
    fi

    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ "$key" =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue

        # Trim whitespace
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)

        # Remove surrounding quotes from value
        value="${value%\"}"
        value="${value#\"}"
        value="${value%\'}"
        value="${value#\'}"

        # Export as environment variable
        export "$key=$value"
    done < "$config_file"
}

read_config "$CONFIG_FILE"

echo "App: $APP_NAME on port $APP_PORT"
```

### Get a specific config value

```bash
# Get a single value from a config file
get_config() {
    local file="$1"
    local key="$2"
    local default="${3:-}"

    local value
    value=$(grep -E "^${key}=" "$file" 2>/dev/null | cut -d'=' -f2- | xargs)

    echo "${value:-$default}"
}

# Usage:
DB_HOST=$(get_config "/etc/myapp/config.conf" "DB_HOST" "localhost")
DB_PORT=$(get_config "/etc/myapp/config.conf" "DB_PORT" "5432")
```

---

## Logging from Scripts

### Log function with levels

```bash
#!/bin/bash

# Log levels: debug=0, info=1, warn=2, error=3
LOG_LEVEL="${LOG_LEVEL:-info}"
LOG_FILE="${LOG_FILE:-/var/log/myscript.log}"

declare -A LOG_LEVELS=([debug]=0 [info]=1 [warn]=2 [error]=3)

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    # Check if we should log this level
    local level_num="${LOG_LEVELS[$level]:-1}"
    local threshold="${LOG_LEVELS[$LOG_LEVEL]:-1}"
    
    if [[ $level_num -lt $threshold ]]; then
        return
    fi

    local formatted="[$timestamp] [${level^^}] $message"

    # Output to stderr and log file
    echo "$formatted" >&2
    echo "$formatted" >> "$LOG_FILE"
}

log_debug() { log debug "$@"; }
log_info()  { log info "$@"; }
log_warn()  { log warn "$@"; }
log_error() { log error "$@"; }

# Usage:
log_info "Starting application..."
log_debug "Debug variable: x=$x"
log_warn "Disk space is low"
log_error "Failed to connect to database"
```

### Simple logging without levels

```bash
#!/bin/bash

LOG_FILE="/var/log/myapp.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "Script started"
log "Processing files..."
log "Script completed"
```

---

## Color Output

### ANSI escape codes

```bash
#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'  # No Color (reset)

# Bold variants
BOLD='\033[1m'
DIM='\033[2m'
UNDERLINE='\033[4m'

# Usage:
echo -e "${RED}Error: something went wrong${NC}"
echo -e "${GREEN}Success: operation completed${NC}"
echo -e "${YELLOW}Warning: check your input${NC}"
echo -e "${BOLD}Important message${NC}"
echo -e "${UNDERLINE}Underlined text${NC}"
```

### Using tput (more portable)

```bash
#!/bin/bash

# tput-based colors (works on more terminals)
RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
BLUE=$(tput setaf 4)
BOLD=$(tput bold)
RESET=$(tput sgr0)

echo "${RED}Error message${RESET}"
echo "${GREEN}Success message${RESET}"
echo "${BOLD}Bold text${RESET}"
```

### Smart color (disable when not a terminal)

```bash
#!/bin/bash

# Only use colors when outputting to a terminal
if [[ -t 1 ]]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    NC=''
fi

# Now colors work in terminal, but are stripped in pipes/files
echo -e "${GREEN}This is colored in terminal, plain in files${NC}"
```

### Status output helpers

```bash
#!/bin/bash

print_status() { echo -e "\033[0;34m[*]\033[0m $1"; }
print_success() { echo -e "\033[0;32m[✓]\033[0m $1"; }
print_error() { echo -e "\033[0;31m[✗]\033[0m $1"; }
print_warning() { echo -e "\033[1;33m[!]\033[0m $1"; }

print_status "Installing packages..."
print_success "Packages installed"
print_warning "Some packages are outdated"
print_error "Failed to install dependency X"
```

---

## Progress Bars and Spinners

### Simple progress bar

```bash
#!/bin/bash

progress_bar() {
    local current="$1"
    local total="$2"
    local width=50
    local percent=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))

    printf "\r["
    printf "%${filled}s" | tr ' ' '#'
    printf "%${empty}s" | tr ' ' '-'
    printf "] %3d%% (%d/%d)" "$percent" "$current" "$total"
}

# Usage:
total=50
for i in $(seq 1 $total); do
    progress_bar "$i" "$total"
    sleep 0.1  # Simulate work
done
echo ""  # New line after completion
```

### Spinner animation

```bash
#!/bin/bash

spinner() {
    local pid="$1"
    local message="${2:-Working...}"
    local spin_chars='|/-\'
    local i=0

    while kill -0 "$pid" 2>/dev/null; do
        printf "\r%s %c" "$message" "${spin_chars:$i:1}"
        i=$(((i + 1) % 4))
        sleep 0.1
    done
    printf "\r%s Done!   \n" "$message"
}

# Usage:
long_running_command() {
    sleep 5  # Simulate work
}

long_running_command &
spinner $! "Processing data..."
```

### Dots animation

```bash
#!/bin/bash

show_dots() {
    local pid="$1"
    local message="${2:-Working}"

    printf "%s" "$message"
    while kill -0 "$pid" 2>/dev/null; do
        printf "."
        sleep 0.5
    done
    echo " done!"
}

# Usage:
sleep 3 &
show_dots $! "Downloading"
```

---

## Handling Signals

### Graceful shutdown

```bash
#!/bin/bash

RUNNING=true

shutdown() {
    echo ""
    echo "Shutting down gracefully..."
    RUNNING=false
    # Perform cleanup
    echo "Saving state..."
    echo "Closing connections..."
    echo "Goodbye!"
    exit 0
}

trap shutdown SIGINT SIGTERM

echo "Server running (PID: $$). Press Ctrl+C to stop."

while $RUNNING; do
    # Main loop
    echo "Working... $(date '+%H:%M:%S')"
    sleep 2
done
```

### Trap multiple signals

```bash
#!/bin/bash

on_exit() {
    echo "Script exiting (exit code: $?)"
}

on_interrupt() {
    echo ""
    echo "Caught SIGINT (Ctrl+C)"
    exit 130
}

on_terminate() {
    echo "Caught SIGTERM"
    exit 143
}

on_hangup() {
    echo "Caught SIGHUP — reloading config..."
    # Reload configuration here
}

trap on_exit EXIT
trap on_interrupt INT
trap on_terminate TERM
trap on_hangup HUP

echo "Running... (PID: $$)"
echo "Send signals: kill -HUP $$, kill -TERM $$, or Ctrl+C"

while true; do
    sleep 1
done
```

---

## Professional Script Template

Here's a complete template combining all the patterns above:

```bash
#!/bin/bash
# ============================================================
# myscript.sh — Description of what this script does
#
# Usage: myscript.sh [OPTIONS] <argument>
# Author: Your Name
# Version: 1.0.0
# ============================================================

set -euo pipefail
IFS=$'\n\t'

# --- Constants ---
readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
readonly VERSION="1.0.0"

# --- Colors (only if terminal) ---
if [[ -t 1 ]]; then
    readonly RED='\033[0;31m'
    readonly GREEN='\033[0;32m'
    readonly YELLOW='\033[1;33m'
    readonly BLUE='\033[0;34m'
    readonly NC='\033[0m'
else
    readonly RED='' GREEN='' YELLOW='' BLUE='' NC=''
fi

# --- Globals ---
VERBOSE=false
DRY_RUN=false
TMPDIR=""

# --- Logging ---
log_info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $*" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }
log_debug() { [[ "$VERBOSE" == true ]] && echo -e "[DEBUG] $*" >&2 || true; }

die() {
    log_error "$@"
    exit 1
}

# --- Cleanup ---
cleanup() {
    local exit_code=$?
    if [[ -n "$TMPDIR" && -d "$TMPDIR" ]]; then
        log_debug "Cleaning up temp dir: $TMPDIR"
        rm -rf "$TMPDIR"
    fi
    exit $exit_code
}

trap cleanup EXIT
trap 'echo ""; die "Interrupted."' INT TERM

# --- Usage ---
usage() {
    cat <<EOF
${SCRIPT_NAME} v${VERSION} — Brief description

Usage:
    ${SCRIPT_NAME} [OPTIONS] <target>

Options:
    -v, --verbose      Enable verbose output
    -n, --dry-run      Show what would be done without doing it
    -c, --config FILE  Use specified config file
    -h, --help         Show this help message
    --version          Show version

Arguments:
    target             The target to operate on

Examples:
    ${SCRIPT_NAME} production
    ${SCRIPT_NAME} --dry-run --verbose staging
    ${SCRIPT_NAME} -c /path/to/config staging
EOF
}

# --- Argument Parsing ---
parse_args() {
    local config_file=""
    TARGET=""

    while [[ $# -gt 0 ]]; do
        case "$1" in
            -v|--verbose)  VERBOSE=true; shift ;;
            -n|--dry-run)  DRY_RUN=true; shift ;;
            -c|--config)
                [[ $# -lt 2 ]] && die "Option $1 requires an argument"
                config_file="$2"; shift 2
                ;;
            -h|--help)     usage; exit 0 ;;
            --version)     echo "$VERSION"; exit 0 ;;
            --)            shift; break ;;
            -*)            die "Unknown option: $1. Use --help for usage." ;;
            *)             TARGET="$1"; shift ;;
        esac
    done

    # Validate required args
    [[ -z "$TARGET" ]] && die "Missing required argument: target. Use --help."

    # Load config if specified
    if [[ -n "$config_file" ]]; then
        [[ -f "$config_file" ]] || die "Config file not found: $config_file"
        log_debug "Loading config: $config_file"
    fi
}

# --- Validation ---
check_dependencies() {
    local deps=(curl jq)
    local missing=()

    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &>/dev/null; then
            missing+=("$dep")
        fi
    done

    if [[ ${#missing[@]} -gt 0 ]]; then
        die "Missing dependencies: ${missing[*]}"
    fi
}

# --- Core Logic ---
do_work() {
    log_info "Operating on target: $TARGET"

    TMPDIR=$(mktemp -d)
    log_debug "Created temp directory: $TMPDIR"

    if [[ "$DRY_RUN" == true ]]; then
        log_warn "[DRY RUN] Would perform operations on $TARGET"
        return
    fi

    # Your actual logic here
    log_info "Step 1: Preparing..."
    log_info "Step 2: Executing..."
    log_info "Step 3: Verifying..."

    log_ok "Operation completed successfully!"
}

# --- Main ---
main() {
    parse_args "$@"
    check_dependencies
    do_work
}

main "$@"
```

---

## Summary

| Pattern | Purpose |
|---------|---------|
| `main() { ... }; main "$@"` | Clean entry point, source-safe |
| `set -euo pipefail` | Strict error handling |
| `mktemp` + `trap cleanup EXIT` | Safe temp files with auto-cleanup |
| `flock` | Prevent concurrent execution |
| `read_config()` | Parse key=value config files |
| `log_info/warn/error` | Structured logging with levels |
| Color codes + `[[ -t 1 ]]` | Pretty output only in terminals |
| `progress_bar` / `spinner` | User-friendly feedback |
| `trap SIGINT SIGTERM` | Graceful signal handling |
| Argument parsing with `case` | Professional CLI interface |

**Best Practices:**
- Always use `set -euo pipefail` for safety
- Clean up temp files with `trap ... EXIT`
- Provide `--help` and `--dry-run` options
- Use functions to organize code
- Log meaningful messages at appropriate levels
- Test scripts with `bash -x script.sh` for debugging
