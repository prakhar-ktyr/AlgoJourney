---
title: Signal Handling & Traps
---

# Signal Handling & Traps

Signals are how Unix processes communicate with each other. They allow the operating system, users, and other processes to notify a running program about events — like requesting it to stop, restart, or clean up.

Understanding signals and the `trap` command lets you write robust scripts that handle interruptions gracefully.

---

## What Are Signals?

A **signal** is a software interrupt delivered to a process. When a process receives a signal, it can:

1. **Handle it** — run custom code in response
2. **Ignore it** — pretend it never happened
3. **Use the default action** — let the OS handle it (often termination)

You send signals every time you press `Ctrl+C` (sends SIGINT) or close a terminal (sends SIGHUP).

---

## Common Signals

Here are the most important signals you'll encounter:

| Signal  | Number | Default Action | Description                        |
|---------|--------|----------------|------------------------------------|
| SIGHUP  | 1      | Terminate      | Terminal closed / hangup           |
| SIGINT  | 2      | Terminate      | Interrupt (Ctrl+C)                 |
| SIGQUIT | 3      | Core dump      | Quit (Ctrl+\\)                     |
| SIGKILL | 9      | Terminate      | Force kill (cannot be caught)      |
| SIGUSR1 | 10     | Terminate      | User-defined signal 1              |
| SIGUSR2 | 12     | Terminate      | User-defined signal 2              |
| SIGTERM | 15     | Terminate      | Graceful termination request       |
| SIGCHLD | 17     | Ignore         | Child process stopped or exited    |
| SIGCONT | 18     | Continue       | Resume a stopped process           |
| SIGSTOP | 19     | Stop           | Pause process (cannot be caught)   |
| SIGTSTP | 20     | Stop           | Terminal stop (Ctrl+Z)             |

### Key Points

- **SIGKILL (9)** and **SIGSTOP (19)** cannot be caught, blocked, or ignored
- **SIGTERM (15)** is the polite "please stop" signal — programs should handle it
- **SIGINT (2)** is what `Ctrl+C` sends to the foreground process

---

## Sending Signals

Use the `kill` command to send signals to processes:

```bash
# Send SIGTERM (default) to a process
kill 1234

# Send a specific signal by name
kill -SIGINT 1234

# Send a specific signal by number
kill -9 1234

# Send signal to all processes with a name
killall -SIGTERM nginx

# Send signal to processes matching a pattern
pkill -SIGHUP -f "my_script.sh"
```

### List Available Signals

```bash
# List all signal names
kill -l

# Get signal number from name
kill -l SIGTERM
# Output: 15
```

---

## The trap Command

The `trap` command lets you catch signals in your shell scripts and run custom code when they arrive.

### Basic Syntax

```bash
trap 'commands' SIGNAL [SIGNAL...]
```

### Simple Example

```bash
#!/bin/bash

# Catch Ctrl+C
trap 'echo "Caught SIGINT! Use exit to quit."' SIGINT

echo "Running... Press Ctrl+C to test"
while true; do
    sleep 1
done
```

When you press `Ctrl+C`, instead of terminating, the script prints the message and continues running.

---

## Cleanup on EXIT

The `EXIT` pseudo-signal fires when the script exits — whether normally, due to an error, or because of a signal. This is the most important trap pattern.

```bash
#!/bin/bash

# Create a temporary file
TMPFILE=$(mktemp)
echo "Created temp file: $TMPFILE"

# Clean up on exit (always runs)
trap 'rm -f "$TMPFILE"; echo "Cleaned up!"' EXIT

# Do work with the temp file
echo "Important data" > "$TMPFILE"
cat "$TMPFILE"

# Even if we exit early, cleanup runs
if [[ ! -f "/some/required/file" ]]; then
    echo "Required file missing, exiting..."
    exit 1
fi

echo "Script completed normally"
```

### Why EXIT Is Special

The EXIT trap runs in ALL of these cases:

- Script reaches the end
- `exit` is called explicitly
- An error causes termination (with `set -e`)
- A signal terminates the script (if the signal is caught)

---

## Using a Cleanup Function

For complex cleanup, use a function:

```bash
#!/bin/bash

TMPDIR=""
LOCKFILE=""

cleanup() {
    echo "Performing cleanup..."

    # Remove temp directory
    if [[ -n "$TMPDIR" && -d "$TMPDIR" ]]; then
        rm -rf "$TMPDIR"
        echo "  Removed temp dir: $TMPDIR"
    fi

    # Remove lock file
    if [[ -n "$LOCKFILE" && -f "$LOCKFILE" ]]; then
        rm -f "$LOCKFILE"
        echo "  Removed lock file: $LOCKFILE"
    fi

    echo "Cleanup complete"
}

trap cleanup EXIT

# Create resources
TMPDIR=$(mktemp -d)
LOCKFILE="/tmp/myscript.lock"
echo $$ > "$LOCKFILE"

echo "Working in $TMPDIR..."
# ... do work ...
```

---

## Ignoring Signals

To ignore a signal completely, use an empty string:

```bash
#!/bin/bash

# Ignore Ctrl+C — user cannot interrupt
trap '' SIGINT

echo "This script cannot be interrupted with Ctrl+C"
echo "Use 'kill -9 $$' from another terminal to stop it"

for i in {1..10}; do
    echo "Step $i of 10..."
    sleep 1
done

echo "Done!"
```

### When to Ignore Signals

- During critical operations that must not be interrupted
- In sections where partial execution would leave things in a bad state
- Temporarily, while performing atomic operations

```bash
#!/bin/bash

# Allow interruption normally
echo "Preparing..."
sleep 2

# Ignore interrupts during critical section
trap '' SIGINT
echo "=== CRITICAL SECTION (cannot interrupt) ==="
cp important_file backup_location
update_database
echo "=== END CRITICAL SECTION ==="

# Restore default interrupt behavior
trap - SIGINT
echo "Safe to interrupt again"
sleep 10
```

---

## Resetting Traps

Use `trap - SIGNAL` to reset a signal to its default behavior:

```bash
#!/bin/bash

# Set custom handler
trap 'echo "Caught!"' SIGINT

echo "Ctrl+C is caught (try it)"
sleep 3

# Reset to default (Ctrl+C will terminate)
trap - SIGINT

echo "Ctrl+C will now terminate (try it)"
sleep 10
```

---

## Handling Multiple Signals

You can trap multiple signals with one command, or set different handlers for each:

```bash
#!/bin/bash

# Same handler for multiple signals
trap 'echo "Received termination signal"; exit 0' SIGINT SIGTERM SIGHUP

# Different handlers for different signals
handle_int() {
    echo "Interrupted by user (SIGINT)"
    exit 130
}

handle_term() {
    echo "Termination requested (SIGTERM)"
    exit 143
}

handle_hup() {
    echo "Hangup detected (SIGHUP) — reloading config..."
    source /etc/myapp/config
}

trap handle_int SIGINT
trap handle_term SIGTERM
trap handle_hup SIGHUP

echo "PID: $$"
echo "Running... Send signals to test"
while true; do
    sleep 1
done
```

---

## Exit Codes and Signals

When a process is killed by a signal, its exit code is 128 + signal number:

```bash
# SIGINT (2): exit code = 128 + 2 = 130
# SIGTERM (15): exit code = 128 + 15 = 143
# SIGKILL (9): exit code = 128 + 9 = 137
```

Use this convention in your handlers:

```bash
#!/bin/bash

trap 'exit 130' SIGINT
trap 'exit 143' SIGTERM
```

---

## Practical Pattern: Temp File Cleanup

```bash
#!/bin/bash
set -euo pipefail

# Array to track temp files
declare -a TEMP_FILES=()

create_temp() {
    local tmpfile
    tmpfile=$(mktemp "${1:-/tmp/myscript.XXXXXX}")
    TEMP_FILES+=("$tmpfile")
    echo "$tmpfile"
}

cleanup() {
    for f in "${TEMP_FILES[@]}"; do
        rm -f "$f"
    done
}

trap cleanup EXIT

# Usage
input=$(create_temp)
output=$(create_temp)
log=$(create_temp /tmp/myscript-log.XXXXXX)

echo "Processing..." > "$log"
curl -s "https://example.com/data" > "$input"
process_data < "$input" > "$output"
cat "$output"

# Temp files automatically removed on exit
```

---

## Practical Pattern: Graceful Shutdown

```bash
#!/bin/bash

RUNNING=true
CHILDREN=()

shutdown() {
    echo "Shutting down gracefully..."
    RUNNING=false

    # Stop all child processes
    for pid in "${CHILDREN[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill -SIGTERM "$pid"
        fi
    done

    # Wait for children to finish
    wait

    echo "All processes stopped"
    exit 0
}

trap shutdown SIGINT SIGTERM

# Start background workers
for i in {1..3}; do
    (
        while $RUNNING; do
            echo "Worker $i processing..."
            sleep 2
        done
    ) &
    CHILDREN+=($!)
done

echo "Started ${#CHILDREN[@]} workers (PID: $$)"
echo "Send SIGTERM to stop gracefully"

# Wait for workers
wait
```

---

## Practical Pattern: Restart on SIGHUP

Many daemons reload their configuration when they receive SIGHUP:

```bash
#!/bin/bash

CONFIG_FILE="/etc/myapp/config.conf"
LOG_LEVEL="info"
PORT=8080

load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        source "$CONFIG_FILE"
        echo "[$(date)] Config reloaded: LOG_LEVEL=$LOG_LEVEL, PORT=$PORT"
    else
        echo "[$(date)] Warning: config file not found"
    fi
}

trap 'load_config' SIGHUP
trap 'echo "Shutting down..."; exit 0' SIGTERM

# Initial config load
load_config

echo "Daemon running (PID: $$)"
echo "Send SIGHUP to reload config: kill -HUP $$"

while true; do
    # Main daemon loop
    echo "[$(date)] Running (log_level=$LOG_LEVEL)..."
    sleep 5
done
```

---

## Practical Pattern: Lock File with Cleanup

```bash
#!/bin/bash
set -euo pipefail

LOCKFILE="/var/run/myscript.lock"

# Check if already running
if [[ -f "$LOCKFILE" ]]; then
    OLD_PID=$(cat "$LOCKFILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "Error: Script already running (PID: $OLD_PID)"
        exit 1
    else
        echo "Removing stale lock file"
        rm -f "$LOCKFILE"
    fi
fi

# Create lock file and ensure cleanup
echo $$ > "$LOCKFILE"
trap 'rm -f "$LOCKFILE"' EXIT

echo "Running with lock (PID: $$)..."
# ... main logic ...
sleep 30
```

---

## Full Example: Daemon-Like Script

Here's a complete script combining all signal handling patterns:

```bash
#!/bin/bash
set -uo pipefail

# === Configuration ===
SCRIPT_NAME="myservice"
PID_FILE="/tmp/${SCRIPT_NAME}.pid"
LOG_FILE="/tmp/${SCRIPT_NAME}.log"
CONFIG_FILE="/tmp/${SCRIPT_NAME}.conf"
POLL_INTERVAL=5

# === State ===
RUNNING=true
REQUEST_COUNT=0

# === Functions ===
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        source "$CONFIG_FILE"
        log "Configuration reloaded from $CONFIG_FILE"
    else
        log "No config file found, using defaults"
    fi
}

cleanup() {
    log "Cleaning up..."
    rm -f "$PID_FILE"
    log "Service stopped (handled $REQUEST_COUNT requests)"
}

graceful_shutdown() {
    log "Received shutdown signal"
    RUNNING=false
}

status_report() {
    log "STATUS: Running=$RUNNING, Requests=$REQUEST_COUNT, Uptime=$(( $(date +%s) - START_TIME ))s"
}

# === Signal Handlers ===
trap cleanup EXIT
trap graceful_shutdown SIGINT SIGTERM
trap load_config SIGHUP
trap status_report SIGUSR1

# === Main ===
# Check for existing instance
if [[ -f "$PID_FILE" ]]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "Already running (PID: $OLD_PID)"
        exit 1
    fi
fi

# Write PID file
echo $$ > "$PID_FILE"
START_TIME=$(date +%s)

log "=== $SCRIPT_NAME started (PID: $$) ==="
log "Send SIGHUP to reload config"
log "Send SIGUSR1 for status"
log "Send SIGTERM to stop"

# Load initial config
load_config

# Main service loop
while $RUNNING; do
    # Simulate processing work
    ((REQUEST_COUNT++))

    if (( REQUEST_COUNT % 10 == 0 )); then
        log "Processed $REQUEST_COUNT requests"
    fi

    sleep "$POLL_INTERVAL"
done

log "Graceful shutdown complete"
exit 0
```

---

## Debugging Traps

```bash
# See what traps are currently set
trap -p

# Output:
# trap -- 'cleanup' EXIT
# trap -- 'graceful_shutdown' SIGINT
# trap -- '' SIGTERM
```

---

## Summary

| Concept | Syntax | Use Case |
|---------|--------|----------|
| Catch signal | `trap 'code' SIG` | Custom handling |
| Cleanup on exit | `trap cleanup EXIT` | Remove temp files |
| Ignore signal | `trap '' SIG` | Critical sections |
| Reset signal | `trap - SIG` | Restore default |
| List traps | `trap -p` | Debugging |

### Best Practices

1. **Always use EXIT traps** for cleanup (temp files, lock files, child processes)
2. **Handle SIGTERM** for graceful shutdown in long-running scripts
3. **Use functions** for complex cleanup logic
4. **Remember**: SIGKILL and SIGSTOP cannot be trapped
5. **Set proper exit codes**: 128 + signal number for signal deaths
6. **Keep handlers fast** — don't do heavy work in signal handlers

---
