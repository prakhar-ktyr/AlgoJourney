---
title: Functions
---

# Functions

Functions let you group commands into reusable, named blocks. Define once, call many times. They make scripts shorter, more organized, and easier to maintain.

---

## Defining Functions

Two valid syntaxes (both do the same thing):

```bash
# Style 1: Preferred (POSIX-compatible)
function_name() {
  # commands
}

# Style 2: Uses the "function" keyword (Bash-specific)
function function_name {
  # commands
}
```

```bash
#!/bin/bash

greet() {
  echo "Hello, World!"
}
```

---

## Calling Functions

Just type the function name — no parentheses, no special syntax:

```bash
#!/bin/bash

greet() {
  echo "Hello, World!"
}

# Call the function
greet
greet
greet
```

Output:

```bash
Hello, World!
Hello, World!
Hello, World!
```

**Important:** The function must be defined _before_ it's called. Bash reads scripts top to bottom.

---

## Function Arguments

Pass arguments just like you'd pass arguments to a script — separated by spaces after the function name:

```bash
#!/bin/bash

greet() {
  echo "Hello, $1!"
}

greet "Alice"
greet "Bob"
```

Output:

```bash
Hello, Alice!
Hello, Bob!
```

Inside the function, arguments are accessed with `$1`, `$2`, `$3`, etc.:

```bash
#!/bin/bash

add() {
  local result=$(( $1 + $2 ))
  echo "$1 + $2 = $result"
}

add 5 3
add 100 200
```

Output:

```bash
5 + 3 = 8
100 + 200 = 300
```

### Special Variables Inside Functions

| Variable | Meaning |
|----------|---------|
| `$1, $2...` | Positional arguments (to the function, NOT the script!) |
| `$#` | Number of arguments passed to the function |
| `$@` | All arguments as separate words |
| `$*` | All arguments as a single string |
| `$0` | Still the script name (not the function name) |

```bash
#!/bin/bash

show_args() {
  echo "Function received $# arguments:"
  for arg in "$@"; do
    echo "  - $arg"
  done
}

show_args "apple" "banana" "cherry"
```

Output:

```bash
Function received 3 arguments:
  - apple
  - banana
  - cherry
```

---

## Return Values

The `return` statement sets an **exit code** (0–255 only). It does NOT return a string or number like in other languages!

```bash
#!/bin/bash

is_even() {
  if (( $1 % 2 == 0 )); then
    return 0   # success = true
  else
    return 1   # failure = false
  fi
}

if is_even 4; then
  echo "4 is even"
fi

if is_even 7; then
  echo "7 is even"
else
  echo "7 is odd"
fi
```

Output:

```bash
4 is even
7 is odd
```

Check the return value with `$?`:

```bash
#!/bin/bash

file_exists() {
  [ -f "$1" ]
  return $?
}

file_exists "/etc/passwd"
echo "Exit code: $?"  # 0 (file exists)

file_exists "/nonexistent"
echo "Exit code: $?"  # 1 (file doesn't exist)
```

---

## Capturing Output (The Real "Return")

To get actual data back from a function, use **command substitution** — the function `echo`s its result, and you capture it:

```bash
#!/bin/bash

get_uppercase() {
  echo "$1" | tr '[:lower:]' '[:upper:]'
}

result=$(get_uppercase "hello world")
echo "Result: $result"
```

Output:

```bash
Result: HELLO WORLD
```

More examples:

```bash
#!/bin/bash

add() {
  echo $(( $1 + $2 ))
}

multiply() {
  echo $(( $1 * $2 ))
}

sum=$(add 5 3)
product=$(multiply 4 7)

echo "Sum: $sum"
echo "Product: $product"
echo "Combined: $(add $sum $product)"
```

Output:

```bash
Sum: 8
Product: 28
Combined: 36
```

---

## Local Variables

By default, variables inside functions are **global** — they're visible everywhere. Use `local` to limit scope:

```bash
#!/bin/bash

my_func() {
  local local_var="I'm local"
  global_var="I'm global"
  echo "Inside function: $local_var"
}

my_func

echo "Outside function:"
echo "  global_var = $global_var"    # Works
echo "  local_var = $local_var"      # Empty!
```

Output:

```bash
Inside function: I'm local
Outside function:
  global_var = I'm global
  local_var =
```

**Best practice:** Always use `local` for variables that don't need to be accessed outside the function.

```bash
#!/bin/bash

calculate_area() {
  local width=$1
  local height=$2
  local area=$(( width * height ))
  echo $area
}

result=$(calculate_area 5 10)
echo "Area: $result"
# $width, $height, $area are NOT set out here
```

---

## Variable Scope Pitfalls

```bash
#!/bin/bash

counter=0

increment() {
  # This modifies the GLOBAL counter!
  ((counter++))
}

echo "Before: $counter"
increment
increment
increment
echo "After: $counter"
```

Output:

```bash
Before: 0
After: 3
```

If you didn't intend this, use `local`:

```bash
safe_increment() {
  local counter=$counter
  ((counter++))
  echo $counter  # Only way to "return" the new value
}
```

---

## Recursive Functions

Functions can call themselves. Always include a base case to prevent infinite recursion:

```bash
#!/bin/bash

factorial() {
  local n=$1
  if [ $n -le 1 ]; then
    echo 1
  else
    local sub=$(factorial $((n - 1)))
    echo $((n * sub))
  fi
}

echo "5! = $(factorial 5)"
echo "7! = $(factorial 7)"
echo "10! = $(factorial 10)"
```

Output:

```bash
5! = 120
7! = 5040
10! = 3628800
```

Another example — directory tree printer:

```bash
#!/bin/bash

print_tree() {
  local dir=$1
  local indent=$2

  for item in "$dir"/*; do
    [ -e "$item" ] || continue
    local name=$(basename "$item")
    echo "${indent}${name}"
    if [ -d "$item" ]; then
      print_tree "$item" "  ${indent}"
    fi
  done
}

print_tree "." ""
```

---

## Function Libraries (Sourcing)

You can define functions in a separate file and load them with `source` (or `.`):

**utils.sh** (the library):

```bash
#!/bin/bash
# utils.sh — Reusable utility functions

log_info() {
  echo "[INFO] $(date '+%H:%M:%S') $1"
}

log_error() {
  echo "[ERROR] $(date '+%H:%M:%S') $1" >&2
}

log_warn() {
  echo "[WARN] $(date '+%H:%M:%S') $1"
}

is_number() {
  [[ "$1" =~ ^[0-9]+$ ]]
}

file_size() {
  if [ -f "$1" ]; then
    stat -f%z "$1" 2>/dev/null || stat -c%s "$1" 2>/dev/null
  else
    echo "0"
  fi
}

confirm() {
  local prompt="${1:-Are you sure?}"
  read -p "$prompt [y/N]: " answer
  [[ "$answer" =~ ^[Yy] ]]
}
```

**main.sh** (uses the library):

```bash
#!/bin/bash

# Load the library
source "$(dirname "$0")/utils.sh"

log_info "Script started"

if confirm "Delete temp files?"; then
  log_info "Deleting..."
  rm -f /tmp/myapp_*
  log_info "Done"
else
  log_warn "Skipped cleanup"
fi

log_info "Script finished"
```

The `source` command executes the file in the current shell, making all its functions available.

---

## Full Example: Utility Function Library

```bash
#!/bin/bash
# string_utils.sh — String utility functions

# Check if string is empty
is_empty() {
  [ -z "$1" ]
}

# Check if string contains substring
contains() {
  local string="$1"
  local substring="$2"
  [[ "$string" == *"$substring"* ]]
}

# Trim whitespace from both ends
trim() {
  local str="$1"
  str="${str#"${str%%[![:space:]]*}"}"
  str="${str%"${str##*[![:space:]]}"}"
  echo "$str"
}

# Repeat a string N times
repeat() {
  local str="$1"
  local n=$2
  local result=""
  for ((i = 0; i < n; i++)); do
    result+="$str"
  done
  echo "$result"
}

# Center text in a given width
center() {
  local text="$1"
  local width=${2:-80}
  local len=${#text}
  local pad=$(( (width - len) / 2 ))
  printf "%*s%s\n" $pad "" "$text"
}

# Print a separator line
separator() {
  local char="${1:--}"
  local width=${2:-60}
  repeat "$char" "$width"
}
```

Using it:

```bash
#!/bin/bash
source ./string_utils.sh

separator "="
center "MY APPLICATION" 60
separator "="
echo ""

name="  hello world  "
echo "Before trim: '$name'"
echo "After trim: '$(trim "$name")'"
echo ""

if contains "hello world" "world"; then
  echo "'hello world' contains 'world'"
fi
```

Output:

```bash
============================================================
                     MY APPLICATION
============================================================

Before trim: '  hello world  '
After trim: 'hello world'

'hello world' contains 'world'
```

---

## Functions with Error Handling

```bash
#!/bin/bash

# Safe division with error checking
divide() {
  local numerator=$1
  local denominator=$2

  if ! [[ "$numerator" =~ ^-?[0-9]+$ ]]; then
    echo "Error: '$numerator' is not a number" >&2
    return 1
  fi

  if ! [[ "$denominator" =~ ^-?[0-9]+$ ]]; then
    echo "Error: '$denominator' is not a number" >&2
    return 1
  fi

  if [ "$denominator" -eq 0 ]; then
    echo "Error: Division by zero" >&2
    return 1
  fi

  echo $(( numerator / denominator ))
  return 0
}

# Usage with error checking
if result=$(divide 10 3); then
  echo "10 / 3 = $result"
fi

if result=$(divide 10 0); then
  echo "This won't print"
else
  echo "Division failed (exit code: $?)"
fi
```

---

## Function Best Practices

```bash
#!/bin/bash

# 1. Always use local variables
good_function() {
  local temp="something"
  local result=""
  # ...
  echo "$result"
}

# 2. Validate arguments
safe_function() {
  if [ $# -lt 2 ]; then
    echo "Usage: safe_function <arg1> <arg2>" >&2
    return 1
  fi
  # proceed...
}

# 3. Use meaningful names
calculate_monthly_payment() { :; }  # Good
cmp() { :; }                         # Bad — what does it do?

# 4. Single responsibility — one function, one job
# Bad: does too much
do_everything() {
  read_config
  validate_input
  process_data
  generate_report
  send_email
}

# Good: each function does one thing
main() {
  read_config
  validate_input
  process_data
  generate_report
  send_email
}
```

---

## Quick Reference

```bash
# Define
my_func() { echo "hello"; }

# Call
my_func

# With arguments
greet() { echo "Hi, $1!"; }
greet "Alice"

# Capture output
result=$(my_func)

# Return exit code
check() { return 0; }
if check; then echo "ok"; fi

# Local variables
f() { local x=5; echo $x; }

# Source a library
source ./mylib.sh
```

---

## Exercises

1. Write a function `max` that returns the larger of two numbers.
2. Write a function `is_palindrome` that checks if a string reads the same forwards and backwards.
3. Create a library file with functions for: `to_upper`, `to_lower`, `word_count`, and `char_count`.
4. Write a recursive function to calculate the Nth Fibonacci number.
5. Build a script that sources a config file and uses functions to validate all required settings are present.

---

## Summary

- Define with `name() { ... }`, call with just `name`
- Arguments: `$1`, `$2`, etc. (function-local, not script args)
- `return` sets exit code (0–255 only); use `echo` + `$(...)` for actual values
- `local` keeps variables inside the function
- Source other files with `source ./file.sh` to import functions
- Recursive functions need a base case
- Always validate arguments and use `local` for clean code

Next lesson: **Arrays** — indexed and associative data structures.
