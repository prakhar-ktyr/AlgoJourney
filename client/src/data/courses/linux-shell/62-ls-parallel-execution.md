---
title: Parallel Execution & Job Control
---

# Parallel Execution & Job Control

Modern computers have multiple CPU cores. Running tasks sequentially when they could run in parallel wastes time and resources. Shell scripting gives you several tools to run commands simultaneously.

This lesson covers background jobs, `wait`, parallel loops, `xargs`, GNU Parallel, and inter-process communication.

---

## Background Jobs: The & Operator

Append `&` to any command to run it in the background:

```bash
# Run a command in the background
long_running_task &

# The shell immediately returns a job number and PID
# [1] 12345
```

### Example

```bash
#!/bin/bash

echo "Starting downloads..."

# Run three downloads in parallel
curl -sO "https://example.com/file1.tar.gz" &
curl -sO "https://example.com/file2.tar.gz" &
curl -sO "https://example.com/file3.tar.gz" &

echo "Downloads started in background"
echo "Doing other work while they run..."
```

### Job Control Commands

```bash
# List background jobs
jobs

# Bring job to foreground
fg %1

# Send job to background
bg %1

# Kill a background job
kill %1

# Reference jobs by number
kill %2
```

---

## The wait Command

`wait` pauses the script until background jobs finish:

```bash
#!/bin/bash

echo "Starting three tasks..."

task_a() { sleep 3; echo "Task A done"; }
task_b() { sleep 2; echo "Task B done"; }
task_c() { sleep 4; echo "Task C done"; }

task_a &
task_b &
task_c &

echo "Waiting for all tasks..."
wait
echo "All tasks completed!"
```

### Wait for a Specific Process

```bash
#!/bin/bash

# Start two jobs, save their PIDs
slow_job &
PID1=$!

fast_job &
PID2=$!

# Wait only for the slow job
wait $PID1
echo "Slow job finished (exit code: $?)"

# Wait for the fast job
wait $PID2
echo "Fast job finished (exit code: $?)"
```

### Check Exit Status of Background Jobs

```bash
#!/bin/bash

process_file() {
    local file="$1"
    # Simulate processing (some might fail)
    if [[ -f "$file" ]]; then
        wc -l "$file" > /dev/null
        return 0
    else
        return 1
    fi
}

# Start parallel jobs
declare -A PIDS

for file in data/*.csv; do
    process_file "$file" &
    PIDS[$!]="$file"
done

# Collect results
FAILED=0
for pid in "${!PIDS[@]}"; do
    if ! wait "$pid"; then
        echo "FAILED: ${PIDS[$pid]}"
        ((FAILED++))
    fi
done

echo "Completed: ${#PIDS[@]} total, $FAILED failed"
```

---

## Parallel Loops

The most common pattern — run a loop body in parallel:

```bash
#!/bin/bash

# Sequential (slow)
for file in *.jpg; do
    convert "$file" -resize 800x600 "resized_$file"
done

# Parallel (fast!)
for file in *.jpg; do
    convert "$file" -resize 800x600 "resized_$file" &
done
wait
```

### Limiting Concurrency

Running too many jobs at once can overwhelm the system. Limit concurrent jobs:

```bash
#!/bin/bash

MAX_JOBS=4
CURRENT_JOBS=0

for file in *.jpg; do
    convert "$file" -resize 800x600 "thumb_$file" &
    ((CURRENT_JOBS++))

    # When we hit the limit, wait for one job to finish
    if (( CURRENT_JOBS >= MAX_JOBS )); then
        wait -n  # Wait for ANY single job to finish (bash 4.3+)
        ((CURRENT_JOBS--))
    fi
done

# Wait for remaining jobs
wait
echo "All images processed"
```

### Portable Concurrency Limiter (Pre-bash 4.3)

```bash
#!/bin/bash

MAX_JOBS=4

run_with_limit() {
    # Wait until we have fewer than MAX_JOBS running
    while (( $(jobs -r | wc -l) >= MAX_JOBS )); do
        sleep 0.1
    done
    "$@" &
}

for file in *.log; do
    run_with_limit process_log "$file"
done

wait
```

---

## xargs -P: Parallel Execution

`xargs` can run commands in parallel with the `-P` flag:

```bash
# Process 4 files at a time in parallel
find . -name "*.txt" | xargs -P4 -I{} wc -l {}

# Compress files in parallel (8 jobs)
find . -name "*.log" | xargs -P8 gzip

# Download URLs in parallel
cat urls.txt | xargs -P4 -I{} curl -sO {}
```

### xargs Options for Parallel Work

```bash
# -P N     — Run N processes in parallel
# -I{}     — Replace {} with input item
# -n N     — Pass N arguments per command invocation
# -0       — Handle null-delimited input (for filenames with spaces)

# Process files with spaces in names
find . -name "*.csv" -print0 | xargs -0 -P4 -I{} process {}

# Pass 2 arguments at a time
echo "a b c d e f" | xargs -n2 -P3 echo "Pair:"
# Output (interleaved):
# Pair: a b
# Pair: c d
# Pair: e f
```

### xargs with a Shell Function

```bash
#!/bin/bash

# Export function so subshells can use it
process_item() {
    local item="$1"
    echo "Processing: $item (PID: $$)"
    sleep 1
    echo "Done: $item"
}
export -f process_item

# Run function in parallel via xargs
echo -e "apple\nbanana\ncherry\ndate\nfig" | \
    xargs -P3 -I{} bash -c 'process_item "$@"' _ {}
```

---

## GNU Parallel

GNU Parallel is a powerful tool designed specifically for parallel execution. It must be installed separately.

```bash
# Install GNU Parallel
# macOS: brew install parallel
# Ubuntu/Debian: sudo apt install parallel

# Basic usage: run command on each argument
parallel echo ::: A B C D

# Process files in parallel (4 jobs)
parallel -j4 gzip ::: *.log

# Read input from a file
parallel -j4 process_file < filelist.txt

# Use with pipe
find . -name "*.txt" | parallel -j4 wc -l

# Replacement strings
parallel -j4 convert {} -resize 50% resized_{} ::: *.jpg
```

### GNU Parallel Features

```bash
# Progress bar
parallel --progress -j4 sleep ::: 1 2 3 4

# Keep output order (matches input order)
parallel --keep-order -j4 'sleep {}; echo {}' ::: 3 1 4 1 5

# Dry run (show commands without executing)
parallel --dry-run gzip ::: *.log

# Resume interrupted work (skip completed)
parallel --resume --joblog /tmp/job.log -j4 process ::: {1..100}

# Remote execution (SSH)
parallel -S server1,server2 -j4 process ::: *.dat
```

---

## Collecting Results from Parallel Jobs

### Using Temporary Files

```bash
#!/bin/bash

RESULTS_DIR=$(mktemp -d)
trap 'rm -rf "$RESULTS_DIR"' EXIT

process_item() {
    local item="$1"
    local result_file="$2"
    # Do work and save result
    local count
    count=$(wc -l < "$item")
    echo "$item:$count" > "$result_file"
}

# Run in parallel, each job writes to its own file
i=0
for file in data/*.csv; do
    process_item "$file" "$RESULTS_DIR/result_$i" &
    ((i++))
done
wait

# Combine results
echo "=== Results ==="
cat "$RESULTS_DIR"/result_*
```

### Using a Shared Output File (with locking)

```bash
#!/bin/bash

OUTPUT_FILE="results.txt"
LOCK_FILE="/tmp/results.lock"

> "$OUTPUT_FILE"  # Clear output file

write_result() {
    local result="$1"
    # Use flock for atomic writes
    (
        flock -x 200
        echo "$result" >> "$OUTPUT_FILE"
    ) 200>"$LOCK_FILE"
}

process_and_report() {
    local file="$1"
    local lines
    lines=$(wc -l < "$file")
    write_result "$file: $lines lines"
}

export -f write_result process_and_report
export OUTPUT_FILE LOCK_FILE

# Run in parallel
find . -name "*.sh" -print0 | \
    xargs -0 -P4 -I{} bash -c 'process_and_report "$@"' _ {}

echo "Results written to $OUTPUT_FILE"
cat "$OUTPUT_FILE"
```

---

## Named Pipes (FIFOs)

Named pipes enable inter-process communication:

```bash
#!/bin/bash

PIPE="/tmp/myfifo_$$"

# Create a named pipe
mkfifo "$PIPE"
trap 'rm -f "$PIPE"' EXIT

# Producer: write to pipe in background
produce() {
    for i in {1..5}; do
        echo "Message $i"
        sleep 1
    done > "$PIPE"
}

# Consumer: read from pipe
consume() {
    while IFS= read -r line; do
        echo "Received: $line"
    done < "$PIPE"
}

# Run producer in background, consumer in foreground
produce &
consume

echo "All messages processed"
```

### Job Queue with Named Pipe

```bash
#!/bin/bash

QUEUE="/tmp/job_queue_$$"
mkfifo "$QUEUE"
trap 'rm -f "$QUEUE"' EXIT

NUM_WORKERS=3

# Worker function
worker() {
    local id="$1"
    while IFS= read -r job; do
        [[ "$job" == "DONE" ]] && break
        echo "Worker $id processing: $job"
        sleep $((RANDOM % 3 + 1))  # Simulate work
        echo "Worker $id finished: $job"
    done
}

# Start workers reading from the queue
for ((i=1; i<=NUM_WORKERS; i++)); do
    worker "$i" < "$QUEUE" &
done

# Feed jobs into the queue
{
    for job in "compile" "test" "lint" "package" "deploy" "notify"; do
        echo "$job"
    done
    # Send stop signal to each worker
    for ((i=1; i<=NUM_WORKERS; i++)); do
        echo "DONE"
    done
} > "$QUEUE"

wait
echo "All jobs completed"
```

---

## Coprocesses (coproc)

Bash 4+ supports coprocesses — background processes with connected pipes:

```bash
#!/bin/bash

# Start a coprocess
coproc COUNTER {
    local count=0
    while IFS= read -r line; do
        ((count++))
        echo "$count: $line"
    done
}

# Send data to the coprocess
echo "Hello" >&${COUNTER[1]}
echo "World" >&${COUNTER[1]}
echo "Bash" >&${COUNTER[1]}

# Close the input to signal we're done
exec {COUNTER[1]}>&-

# Read results from the coprocess
while IFS= read -r line; do
    echo "Got: $line"
done <&${COUNTER[0]}

wait $COUNTER_PID
echo "Coprocess finished"
```

### Coprocess as a Service

```bash
#!/bin/bash

# Calculator coprocess
coproc CALC {
    while IFS= read -r expr; do
        result=$(echo "$expr" | bc -l 2>/dev/null)
        echo "${result:-ERROR}"
    done
}

# Use the calculator
calculate() {
    echo "$1" >&${CALC[1]}
    read -r result <&${CALC[0]}
    echo "$result"
}

echo "5 + 3 = $(calculate '5 + 3')"
echo "10 / 3 = $(calculate '10 / 3')"
echo "2 ^ 10 = $(calculate '2 ^ 10')"

# Clean up
exec {CALC[1]}>&-
wait $CALC_PID
```

---

## Practical: Parallel File Processing

```bash
#!/bin/bash
set -uo pipefail

# === Configuration ===
INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./processed}"
MAX_JOBS="${3:-4}"
LOG_FILE="/tmp/parallel_process_$$.log"

# === Setup ===
mkdir -p "$OUTPUT_DIR"
> "$LOG_FILE"

TOTAL=0
SUCCESS=0
FAILED=0
declare -a PIDS=()
declare -A PID_FILES=()

# === Processing Function ===
process_file() {
    local input="$1"
    local output="$2"

    # Simulate processing: count words, add header
    {
        echo "# Processed: $(date)"
        echo "# Source: $input"
        echo "# Words: $(wc -w < "$input")"
        echo "---"
        cat "$input"
    } > "$output"
}

# === Main Loop ===
echo "Processing files from: $INPUT_DIR"
echo "Output directory: $OUTPUT_DIR"
echo "Max parallel jobs: $MAX_JOBS"
echo "---"

for file in "$INPUT_DIR"/*.txt; do
    [[ -f "$file" ]] || continue

    basename="${file##*/}"
    output="$OUTPUT_DIR/$basename"
    ((TOTAL++))

    # Wait if at capacity
    while (( ${#PIDS[@]} >= MAX_JOBS )); do
        # Check each PID
        for i in "${!PIDS[@]}"; do
            if ! kill -0 "${PIDS[$i]}" 2>/dev/null; then
                wait "${PIDS[$i]}"
                if (( $? == 0 )); then
                    ((SUCCESS++))
                else
                    ((FAILED++))
                    echo "FAILED: ${PID_FILES[${PIDS[$i]}]}" >> "$LOG_FILE"
                fi
                unset 'PIDS[i]'
                unset 'PID_FILES[${PIDS[$i]}]'
            fi
        done
        PIDS=("${PIDS[@]}")  # Reindex array
        sleep 0.1
    done

    # Launch job
    process_file "$file" "$output" &
    pid=$!
    PIDS+=("$pid")
    PID_FILES[$pid]="$file"
done

# Wait for remaining jobs
for pid in "${PIDS[@]}"; do
    wait "$pid"
    if (( $? == 0 )); then
        ((SUCCESS++))
    else
        ((FAILED++))
    fi
done

# === Report ===
echo "=== Complete ==="
echo "Total: $TOTAL"
echo "Success: $SUCCESS"
echo "Failed: $FAILED"

if (( FAILED > 0 )); then
    echo "See failures in: $LOG_FILE"
    exit 1
fi
```

---

## Practical: Batch URL Checker

```bash
#!/bin/bash
set -uo pipefail

MAX_PARALLEL=10
TIMEOUT=5

check_url() {
    local url="$1"
    local http_code
    http_code=$(curl -sL -o /dev/null -w '%{http_code}' \
        --max-time "$TIMEOUT" "$url" 2>/dev/null)

    if [[ "$http_code" == "200" ]]; then
        echo "OK  $http_code $url"
    elif [[ "$http_code" == "000" ]]; then
        echo "ERR timeout $url"
    else
        echo "ERR $http_code $url"
    fi
}

export -f check_url
export TIMEOUT

# Read URLs and check in parallel
if [[ -f "${1:-}" ]]; then
    cat "$1"
else
    echo "https://example.com"
    echo "https://google.com"
    echo "https://github.com"
fi | xargs -P"$MAX_PARALLEL" -I{} bash -c 'check_url "$@"' _ {}
```

---

## Summary

| Method | Best For | Concurrency Control |
|--------|----------|-------------------|
| `cmd &` + `wait` | Simple parallelism | Manual with `wait -n` |
| `xargs -P` | Command-line tools | Built-in (`-P N`) |
| GNU Parallel | Complex workflows | Built-in (`-j N`) |
| Named pipes | Producer/consumer | Custom |
| `coproc` | Interactive IPC | Single coprocess |

### Best Practices

1. **Always `wait`** for background jobs before exiting
2. **Limit concurrency** — don't spawn thousands of jobs
3. **Handle failures** — check exit codes of background processes
4. **Use `wait -n`** (bash 4.3+) for efficient job-slot reuse
5. **Lock shared resources** — use `flock` for file writes
6. **Clean up** — trap EXIT to remove temp files and kill children
7. **Test sequentially first** — parallelize only after logic is correct

---
