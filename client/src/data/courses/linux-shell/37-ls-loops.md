---
title: Loops
---

# Loops

Loops let you repeat commands automatically. Bash has three loop types: `for` (iterate over a list), `while` (repeat while condition is true), and `until` (repeat until condition becomes true).

---

## For Loop — Basic Syntax

```bash
for variable in list; do
  # commands using $variable
done
```

The loop assigns each item from the list to `variable`, one at a time:

```bash
#!/bin/bash

for color in red green blue yellow; do
  echo "Color: $color"
done
```

Output:

```bash
Color: red
Color: green
Color: blue
Color: yellow
```

---

## For Loop with Brace Ranges

Use `{start..end}` to loop over a range of numbers:

```bash
#!/bin/bash

for i in {1..5}; do
  echo "Number: $i"
done
```

Output:

```bash
Number: 1
Number: 2
Number: 3
Number: 4
Number: 5
```

You can add a step value:

```bash
# Count by 2
for i in {0..10..2}; do
  echo "$i"
done
# 0, 2, 4, 6, 8, 10

# Count backwards
for i in {10..1}; do
  echo "$i"
done
# 10, 9, 8, ... 1
```

---

## C-Style For Loop

For arithmetic loops with more control, use the C-style syntax:

```bash
for ((initialization; condition; increment)); do
  # commands
done
```

```bash
#!/bin/bash

for ((i = 0; i < 5; i++)); do
  echo "Index: $i"
done
```

Output:

```bash
Index: 0
Index: 1
Index: 2
Index: 3
Index: 4
```

More examples:

```bash
# Count down
for ((i = 10; i > 0; i--)); do
  echo "$i..."
done
echo "Liftoff!"

# Step by 3
for ((i = 0; i <= 30; i += 3)); do
  echo "$i"
done

# Multiple variables
for ((i = 0, j = 10; i < j; i++, j--)); do
  echo "i=$i, j=$j"
done
```

---

## For Loop with Command Output

Loop over the output of a command:

```bash
#!/bin/bash

# Loop over files in current directory
for file in *.txt; do
  echo "Found text file: $file"
done
```

```bash
#!/bin/bash

# Loop over lines from a command
for user in $(cat /etc/passwd | cut -d: -f1 | head -5); do
  echo "User: $user"
done
```

**Important:** Word splitting applies. If filenames have spaces, use a `while read` loop instead (covered below).

```bash
# Safe way to loop over files (handles spaces)
for file in /path/to/dir/*; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
  fi
done
```

---

## While Loop

Repeats as long as the condition is **true** (exit code 0):

```bash
while [ condition ]; do
  # commands
done
```

```bash
#!/bin/bash

count=1

while [ $count -le 5 ]; do
  echo "Count: $count"
  ((count++))
done
```

Output:

```bash
Count: 1
Count: 2
Count: 3
Count: 4
Count: 5
```

Another example — waiting for a file:

```bash
#!/bin/bash

echo "Waiting for data.txt to appear..."

while [ ! -f "data.txt" ]; do
  sleep 1
done

echo "File found! Processing..."
```

---

## Until Loop

Repeats as long as the condition is **false** (opposite of `while`):

```bash
until [ condition ]; do
  # commands
done
```

```bash
#!/bin/bash

count=1

until [ $count -gt 5 ]; do
  echo "Count: $count"
  ((count++))
done
```

Output (same as the while example):

```bash
Count: 1
Count: 2
Count: 3
Count: 4
Count: 5
```

`until` is useful when you want to express "keep going until this becomes true":

```bash
#!/bin/bash

# Keep asking until they say yes
until [ "$answer" = "yes" ]; do
  read -p "Do you agree? (yes/no): " answer
done
echo "Thank you!"
```

---

## Reading Files Line by Line

The safest way to process a file line by line:

```bash
while IFS= read -r line; do
  echo "Line: $line"
done < filename.txt
```

- `IFS=` — prevents trimming leading/trailing whitespace
- `-r` — prevents backslash interpretation

```bash
#!/bin/bash

# Count non-empty lines in a file
total=0
non_empty=0

while IFS= read -r line; do
  ((total++))
  if [ -n "$line" ]; then
    ((non_empty++))
  fi
done < "myfile.txt"

echo "Total lines: $total"
echo "Non-empty lines: $non_empty"
```

Reading from a command:

```bash
#!/bin/bash

# Process each running process
ps aux | while IFS= read -r line; do
  echo "$line" | awk '{print $1, $11}'
done
```

**Tip:** Piping into `while` creates a subshell. Variables set inside won't persist outside. Use process substitution instead:

```bash
# Variables persist after the loop
while IFS= read -r line; do
  ((count++))
done < <(cat file.txt)

echo "Count: $count"  # This works!
```

---

## Loop Control: break and continue

### break — Exit the Loop Immediately

```bash
#!/bin/bash

for i in {1..100}; do
  if [ $i -eq 6 ]; then
    echo "Breaking at $i"
    break
  fi
  echo "Number: $i"
done
echo "Loop finished"
```

Output:

```bash
Number: 1
Number: 2
Number: 3
Number: 4
Number: 5
Breaking at 6
Loop finished
```

### continue — Skip to the Next Iteration

```bash
#!/bin/bash

for i in {1..10}; do
  # Skip even numbers
  if (( i % 2 == 0 )); then
    continue
  fi
  echo "Odd: $i"
done
```

Output:

```bash
Odd: 1
Odd: 3
Odd: 5
Odd: 7
Odd: 9
```

### break N — Break Out of Nested Loops

```bash
#!/bin/bash

for i in {1..3}; do
  for j in {1..3}; do
    if [ $j -eq 2 ]; then
      break 2  # Break out of BOTH loops
    fi
    echo "i=$i, j=$j"
  done
done
```

Output:

```bash
i=1, j=1
```

---

## Infinite Loops

Sometimes you need a loop that runs forever (until manually stopped or broken out of):

```bash
#!/bin/bash

# Using while true
while true; do
  read -p "Enter command (quit to exit): " cmd
  case $cmd in
    quit) break ;;
    date) date ;;
    *) echo "Unknown: $cmd" ;;
  esac
done
```

```bash
# Using colon (same as true)
while :; do
  echo "Still running..."
  sleep 5
done
```

```bash
# C-style infinite loop
for (( ;; )); do
  echo "Forever..."
  sleep 1
done
```

---

## Nested Loops

Loops inside loops — useful for grids, combinations, or matrix operations:

```bash
#!/bin/bash

# Multiplication table
for i in {1..5}; do
  for j in {1..5}; do
    printf "%4d" $((i * j))
  done
  echo ""
done
```

Output:

```bash
   1   2   3   4   5
   2   4   6   8  10
   3   6   9  12  15
   4   8  12  16  20
   5  10  15  20  25
```

---

## Practical Example: Batch File Processing

```bash
#!/bin/bash

# batch_rename.sh — Add a prefix to all .txt files

prefix="2024_"
count=0

for file in *.txt; do
  # Skip if no matches (glob didn't expand)
  [ -e "$file" ] || continue

  newname="${prefix}${file}"
  mv "$file" "$newname"
  echo "Renamed: $file -> $newname"
  ((count++))
done

echo "Done. Renamed $count files."
```

---

## Practical Example: Log File Monitor

```bash
#!/bin/bash

# monitor.sh — Watch a log file for errors

logfile="/var/log/app.log"
error_count=0

while IFS= read -r line; do
  case $line in
    *ERROR*|*FATAL*)
      ((error_count++))
      echo "[ALERT #$error_count] $line"
      ;;
    *WARNING*)
      echo "[WARN] $line"
      ;;
  esac
done < <(tail -f "$logfile")
```

---

## Practical Example: Retry Logic

```bash
#!/bin/bash

# retry.sh — Retry a command up to N times

max_attempts=5
attempt=1
url="https://example.com/api/health"

until curl -sf "$url" > /dev/null; do
  if [ $attempt -ge $max_attempts ]; then
    echo "Failed after $max_attempts attempts."
    exit 1
  fi
  echo "Attempt $attempt failed. Retrying in 3 seconds..."
  ((attempt++))
  sleep 3
done

echo "Success on attempt $attempt!"
```

---

## Practical Example: Directory Backup

```bash
#!/bin/bash

# backup_dirs.sh — Backup multiple directories

backup_dest="/tmp/backups"
mkdir -p "$backup_dest"

dirs=("$HOME/Documents" "$HOME/Projects" "$HOME/Pictures")

for dir in "${dirs[@]}"; do
  if [ -d "$dir" ]; then
    dirname=$(basename "$dir")
    tarfile="${backup_dest}/${dirname}_$(date +%Y%m%d).tar.gz"
    echo "Backing up $dir..."
    tar -czf "$tarfile" -C "$(dirname "$dir")" "$dirname"
    echo "  -> $tarfile ($(du -h "$tarfile" | cut -f1))"
  else
    echo "Skipping $dir (not found)"
  fi
done

echo "All backups complete!"
```

---

## Loop Patterns Cheat Sheet

```bash
# For: iterate over list
for item in a b c; do echo "$item"; done

# For: numeric range
for i in {1..10}; do echo "$i"; done

# For: C-style
for ((i=0; i<10; i++)); do echo "$i"; done

# For: files
for f in /path/*; do echo "$f"; done

# While: condition
while [ $x -lt 10 ]; do ((x++)); done

# While: read lines
while IFS= read -r line; do echo "$line"; done < file

# Until: opposite of while
until [ $x -ge 10 ]; do ((x++)); done

# Infinite
while true; do ...; done

# Break out
for i in {1..99}; do [ $i -eq 5 ] && break; done

# Skip iteration
for i in {1..10}; do [ $i -eq 5 ] && continue; echo $i; done
```

---

## Exercises

1. Print the first 20 Fibonacci numbers using a while loop.
2. Loop through all `.sh` files in a directory and check each one for syntax errors.
3. Create a number guessing game using an infinite loop with break.
4. Read a CSV file and print each column separately.
5. Write a nested loop that prints a right-aligned triangle of stars.

---

## Summary

- **for** — iterate over lists, ranges, or command output
- **while** — repeat while condition is true
- **until** — repeat until condition becomes true
- **break** — exit the loop immediately
- **continue** — skip to the next iteration
- Use `while IFS= read -r` for safe line-by-line file reading
- C-style `for ((...))` gives full arithmetic control
- `while true` creates infinite loops (break to exit)

Next lesson: **Functions** — reusable code blocks.
