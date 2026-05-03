---
title: Arrays
---

# Arrays

Arrays store multiple values in a single variable. Bash supports two types: **indexed arrays** (numbered starting at 0) and **associative arrays** (key-value pairs, Bash 4+).

---

## Creating Indexed Arrays

```bash
# Method 1: Parentheses (most common)
fruits=("apple" "banana" "cherry" "date")

# Method 2: One at a time
colors[0]="red"
colors[1]="green"
colors[2]="blue"

# Method 3: declare (explicit)
declare -a numbers=(10 20 30 40 50)
```

---

## Accessing Elements

Elements are accessed with `${array[index]}`. Indices start at **0**:

```bash
#!/bin/bash

fruits=("apple" "banana" "cherry" "date")

echo "First: ${fruits[0]}"
echo "Second: ${fruits[1]}"
echo "Third: ${fruits[2]}"
echo "Fourth: ${fruits[3]}"
```

Output:

```bash
First: apple
Second: banana
Third: cherry
Fourth: date
```

**Important:** Always use `${array[n]}` with braces. Without braces, `$array[0]` is interpreted as `${array}` (first element) followed by literal `[0]`.

---

## All Elements: @ vs *

```bash
#!/bin/bash

fruits=("apple" "banana" "cherry")

# ${array[@]} — each element is a separate word (preferred)
echo "Using @:"
for fruit in "${fruits[@]}"; do
  echo "  $fruit"
done

# ${array[*]} — all elements joined into one string
echo ""
echo "Using *: ${fruits[*]}"
```

Output:

```bash
Using @:
  apple
  banana
  cherry

Using *: apple banana cherry
```

**Rule of thumb:** Always use `"${array[@]}"` (with quotes) for iteration. It preserves elements containing spaces.

```bash
files=("my document.txt" "photo album" "notes.md")

# CORRECT — 3 iterations
for f in "${files[@]}"; do
  echo "$f"
done

# WRONG — splits on spaces, giving 5 iterations
for f in ${files[@]}; do
  echo "$f"
done
```

---

## Array Length

```bash
#!/bin/bash

fruits=("apple" "banana" "cherry" "date" "elderberry")

echo "Number of elements: ${#fruits[@]}"
echo "Length of first element: ${#fruits[0]}"
```

Output:

```bash
Number of elements: 5
Length of first element: 5
```

---

## Adding Elements

```bash
#!/bin/bash

fruits=("apple" "banana")

# Append one element
fruits+=("cherry")

# Append multiple
fruits+=("date" "elderberry")

echo "Fruits: ${fruits[@]}"
echo "Count: ${#fruits[@]}"
```

Output:

```bash
Fruits: apple banana cherry date elderberry
Count: 5
```

---

## Removing Elements

```bash
#!/bin/bash

fruits=("apple" "banana" "cherry" "date" "elderberry")

# Remove by index
unset fruits[2]

echo "After removing index 2: ${fruits[@]}"
echo "Count: ${#fruits[@]}"
echo "Index 2: '${fruits[2]}'"  # Empty now!
echo "Index 3: '${fruits[3]}'"  # Still "date"
```

Output:

```bash
After removing index 2: apple banana date elderberry
Count: 4
Index 2: ''
Index 3: 'date'
```

**Note:** `unset` leaves a gap — indices don't renumber. If you need contiguous indices, reassign:

```bash
fruits=("${fruits[@]}")  # Re-index the array
```

---

## Array Slicing

Extract a portion of the array:

```bash
${array[@]:start:count}
```

```bash
#!/bin/bash

letters=("a" "b" "c" "d" "e" "f" "g")

echo "All: ${letters[@]}"
echo "From index 2: ${letters[@]:2}"
echo "3 items from index 1: ${letters[@]:1:3}"
echo "Last 2: ${letters[@]: -2}"
```

Output:

```bash
All: a b c d e f g
From index 2: c d e f g
3 items from index 1: b c d
Last 2: f g
```

**Note:** For negative offsets, add a space before the minus: `${arr[@]: -2}` (prevents confusion with `${var:-default}`).

---

## Iterating Over Arrays

```bash
#!/bin/bash

servers=("web01" "web02" "db01" "cache01")

# By value
echo "Servers:"
for server in "${servers[@]}"; do
  echo "  - $server"
done

# By index
echo ""
echo "With indices:"
for i in "${!servers[@]}"; do
  echo "  [$i] = ${servers[$i]}"
done
```

Output:

```bash
Servers:
  - web01
  - web02
  - db01
  - cache01

With indices:
  [0] = web01
  [1] = web02
  [2] = db01
  [3] = cache01
```

`${!array[@]}` gives you the list of valid indices.

---

## Associative Arrays (Bash 4+)

Associative arrays use **string keys** instead of numeric indices. You must declare them with `declare -A`:

```bash
#!/bin/bash

# Must declare first!
declare -A user

user[name]="Alice"
user[age]="30"
user[email]="alice@example.com"
user[role]="admin"

echo "Name: ${user[name]}"
echo "Age: ${user[age]}"
echo "Email: ${user[email]}"
```

Output:

```bash
Name: Alice
Age: 30
Email: alice@example.com
```

### Inline Declaration

```bash
declare -A colors=(
  [red]="#FF0000"
  [green]="#00FF00"
  [blue]="#0000FF"
  [white]="#FFFFFF"
  [black]="#000000"
)

echo "Red hex: ${colors[red]}"
```

---

## Associative Array Keys and Values

```bash
#!/bin/bash

declare -A capitals=(
  [France]="Paris"
  [Germany]="Berlin"
  [Japan]="Tokyo"
  [Brazil]="Brasilia"
)

# All keys
echo "Countries: ${!capitals[@]}"

# All values
echo "Capitals: ${capitals[@]}"

# Iterate over key-value pairs
echo ""
for country in "${!capitals[@]}"; do
  echo "$country -> ${capitals[$country]}"
done
```

Output:

```bash
Countries: France Germany Japan Brazil
Capitals: Paris Berlin Tokyo Brasilia

France -> Paris
Germany -> Berlin
Japan -> Tokyo
Brazil -> Brasilia
```

**Note:** Associative arrays do NOT maintain insertion order.

---

## Checking if a Key Exists

```bash
#!/bin/bash

declare -A config=(
  [host]="localhost"
  [port]="8080"
)

# Check with -v (Bash 4.2+)
if [[ -v config[host] ]]; then
  echo "host is set: ${config[host]}"
fi

if [[ ! -v config[timeout] ]]; then
  echo "timeout is NOT set"
fi
```

---

## Array Operations

### Search

```bash
#!/bin/bash

fruits=("apple" "banana" "cherry" "date")

# Check if element exists
contains() {
  local target="$1"
  shift
  for item in "$@"; do
    if [ "$item" = "$target" ]; then
      return 0
    fi
  done
  return 1
}

if contains "banana" "${fruits[@]}"; then
  echo "Found banana!"
fi

if ! contains "grape" "${fruits[@]}"; then
  echo "No grape found."
fi
```

### Find Index

```bash
#!/bin/bash

fruits=("apple" "banana" "cherry" "date")

find_index() {
  local target="$1"
  shift
  local i=0
  for item in "$@"; do
    if [ "$item" = "$target" ]; then
      echo $i
      return 0
    fi
    ((i++))
  done
  echo -1
  return 1
}

idx=$(find_index "cherry" "${fruits[@]}")
echo "cherry is at index: $idx"
```

### Sort

```bash
#!/bin/bash

numbers=(42 17 93 8 55 31)

# Sort using printf + sort
sorted=($(printf '%s\n' "${numbers[@]}" | sort -n))

echo "Original: ${numbers[@]}"
echo "Sorted:   ${sorted[@]}"
```

Output:

```bash
Original: 42 17 93 8 55 31
Sorted:   8 17 31 42 55 93
```

### Filter

```bash
#!/bin/bash

numbers=(1 2 3 4 5 6 7 8 9 10)
evens=()

for n in "${numbers[@]}"; do
  if (( n % 2 == 0 )); then
    evens+=("$n")
  fi
done

echo "All: ${numbers[@]}"
echo "Evens: ${evens[@]}"
```

Output:

```bash
All: 1 2 3 4 5 6 7 8 9 10
Evens: 2 4 6 8 10
```

---

## Practical Example: Data Processing

```bash
#!/bin/bash

# Process a list of servers and check their status

servers=("web01:80" "web02:80" "db01:5432" "cache01:6379")

declare -A status

for entry in "${servers[@]}"; do
  host="${entry%%:*}"
  port="${entry##*:}"

  if timeout 2 bash -c "echo >/dev/tcp/$host/$port" 2>/dev/null; then
    status[$host]="UP"
  else
    status[$host]="DOWN"
  fi
done

echo "=== Server Status ==="
printf "%-12s %s\n" "HOST" "STATUS"
printf "%-12s %s\n" "----" "------"
for host in "${!status[@]}"; do
  printf "%-12s %s\n" "$host" "${status[$host]}"
done
```

---

## Practical Example: Word Frequency Counter

```bash
#!/bin/bash

# Count word frequency in a file

declare -A freq

while IFS= read -r line; do
  for word in $line; do
    # Lowercase and strip punctuation
    word=$(echo "$word" | tr '[:upper:]' '[:lower:]' | tr -d '[:punct:]')
    if [ -n "$word" ]; then
      ((freq[$word]++))
    fi
  done
done < "${1:-/dev/stdin}"

# Print top 10 words
echo "=== Word Frequency ==="
for word in "${!freq[@]}"; do
  echo "${freq[$word]} $word"
done | sort -rn | head -10
```

Usage:

```bash
echo "the cat sat on the mat the cat" | ./wordfreq.sh
# 3 the
# 2 cat
# 1 sat
# 1 on
# 1 mat
```

---

## Practical Example: Config Parser

```bash
#!/bin/bash

# Parse a key=value config file into an associative array

declare -A config

parse_config() {
  local file="$1"

  if [ ! -f "$file" ]; then
    echo "Error: Config file not found: $file" >&2
    return 1
  fi

  while IFS= read -r line; do
    # Skip comments and empty lines
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue

    # Split on first =
    local key="${line%%=*}"
    local value="${line#*=}"

    # Trim whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)

    config[$key]="$value"
  done < "$file"
}

# Usage
parse_config "app.conf"

echo "Host: ${config[host]}"
echo "Port: ${config[port]}"
echo ""
echo "All settings:"
for key in "${!config[@]}"; do
  echo "  $key = ${config[$key]}"
done
```

---

## Array Gotchas

```bash
# 1. Unquoted arrays split on spaces
files=("my file.txt" "other doc.pdf")
for f in ${files[@]}; do      # BUG! "my" and "file.txt" are separate
  echo "$f"
done
for f in "${files[@]}"; do    # CORRECT
  echo "$f"
done

# 2. unset leaves gaps
arr=(a b c d e)
unset arr[2]
echo "${arr[2]}"   # Empty — not "d"!
echo "${arr[3]}"   # Still "d"

# 3. Assigning string to array gives one element
arr="hello world"          # arr[0]="hello world"
arr=("hello" "world")     # arr[0]="hello", arr[1]="world"

# 4. Associative arrays MUST be declared
declare -A map             # Required!
map[key]="value"           # Without declare -A, it's just map[0]
```

---

## Quick Reference

```bash
# Create
arr=("a" "b" "c")
declare -A map=([key]="val")

# Access
${arr[0]}              # First element
${arr[@]}              # All elements
${#arr[@]}             # Length
${!arr[@]}             # All indices/keys

# Modify
arr+=("new")           # Append
arr[1]="updated"       # Set by index
unset arr[2]           # Remove

# Slice
${arr[@]:2:3}          # 3 elements starting at index 2

# Associative
declare -A m
m[name]="Alice"
echo "${m[name]}"
echo "${!m[@]}"        # All keys
```

---

## Exercises

1. Write a script that stores 5 student names in an array and prints them numbered.
2. Create a function that reverses an array.
3. Build a simple phone book using an associative array with add, search, and list commands.
4. Read a CSV file into parallel arrays (one per column) and display as a formatted table.
5. Write a script that finds duplicate entries in an array.

---

## Summary

- Indexed arrays: `arr=(a b c)`, access with `${arr[0]}`
- All elements: `"${arr[@]}"` (always quote!)
- Length: `${#arr[@]}`
- Append: `arr+=("new")`
- Remove: `unset arr[idx]` (leaves gaps)
- Slice: `${arr[@]:start:count}`
- Associative arrays: `declare -A map`, use string keys
- Keys: `${!map[@]}`, values: `${map[@]}`
- Always quote array expansions to handle spaces correctly

Next lesson: **String Manipulation** — slicing, replacing, and transforming text.
