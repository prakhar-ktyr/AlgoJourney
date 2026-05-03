---
title: Case Statements
---

# Case Statements

The `case` statement is Bash's version of a switch/select — it matches a value against multiple patterns and runs the corresponding code block. It's cleaner than long `if-elif` chains when you need to compare one variable against many possible values.

---

## Basic Case Syntax

The general structure of a `case` statement:

```bash
case $variable in
  pattern1)
    # commands for pattern1
    ;;
  pattern2)
    # commands for pattern2
    ;;
  *)
    # default commands (if nothing else matches)
    ;;
esac
```

Key parts:
- `case $variable in` — starts the statement
- Each pattern ends with `)`
- Each block ends with `;;` (double semicolons)
- `esac` — ends the statement (`case` spelled backwards)

---

## Simple Example

```bash
#!/bin/bash

fruit="apple"

case $fruit in
  apple)
    echo "It's an apple — red and crunchy!"
    ;;
  banana)
    echo "It's a banana — yellow and soft!"
    ;;
  orange)
    echo "It's an orange — round and juicy!"
    ;;
  *)
    echo "Unknown fruit: $fruit"
    ;;
esac
```

Output:

```bash
It's an apple — red and crunchy!
```

---

## Multiple Patterns with |

You can match several patterns in a single block using the pipe `|` operator:

```bash
#!/bin/bash

animal="cat"

case $animal in
  cat|dog|hamster)
    echo "$animal is a pet"
    ;;
  lion|tiger|bear)
    echo "$animal is a wild animal"
    ;;
  eagle|sparrow|parrot)
    echo "$animal is a bird"
    ;;
  *)
    echo "I don't know what $animal is"
    ;;
esac
```

Output:

```bash
cat is a pet
```

This is much cleaner than writing `if [ "$animal" = "cat" ] || [ "$animal" = "dog" ] || ...`.

---

## Wildcard Patterns

Case patterns support shell globbing (wildcards):

| Pattern | Matches |
|---------|---------|
| `*` | Anything (default/catch-all) |
| `?` | Any single character |
| `[abc]` | Any one of a, b, or c |
| `[0-9]` | Any digit |

```bash
#!/bin/bash

filename="report.pdf"

case $filename in
  *.txt)
    echo "Text file"
    ;;
  *.pdf)
    echo "PDF document"
    ;;
  *.jpg|*.png|*.gif)
    echo "Image file"
    ;;
  *.sh)
    echo "Shell script"
    ;;
  *)
    echo "Unknown file type"
    ;;
esac
```

Output:

```bash
PDF document
```

---

## The Default Pattern: *)

The `*)` pattern matches anything not caught by previous patterns. Always put it **last** — patterns are checked top-to-bottom, and `*` matches everything.

```bash
#!/bin/bash

read -p "Enter a command: " cmd

case $cmd in
  start)
    echo "Starting service..."
    ;;
  stop)
    echo "Stopping service..."
    ;;
  restart)
    echo "Restarting service..."
    ;;
  *)
    echo "Error: Unknown command '$cmd'"
    echo "Usage: start | stop | restart"
    ;;
esac
```

---

## Menu-Driven Scripts

Case statements are perfect for interactive menus:

```bash
#!/bin/bash

show_menu() {
  echo "================================"
  echo "    FILE MANAGER MENU"
  echo "================================"
  echo "1) List files"
  echo "2) Show current directory"
  echo "3) Show disk usage"
  echo "4) Show date and time"
  echo "5) Exit"
  echo "================================"
}

while true; do
  show_menu
  read -p "Enter your choice [1-5]: " choice

  case $choice in
    1)
      echo ""
      ls -la
      echo ""
      ;;
    2)
      echo ""
      echo "Current directory: $(pwd)"
      echo ""
      ;;
    3)
      echo ""
      df -h .
      echo ""
      ;;
    4)
      echo ""
      date "+%A, %B %d, %Y - %H:%M:%S"
      echo ""
      ;;
    5)
      echo "Goodbye!"
      exit 0
      ;;
    *)
      echo ""
      echo "Invalid option. Please choose 1-5."
      echo ""
      ;;
  esac

  read -p "Press Enter to continue..."
done
```

This creates an interactive menu that loops until the user picks "Exit."

---

## Processing Command-Line Arguments

Case is commonly used to parse script options and arguments:

```bash
#!/bin/bash

# Simple argument parser
usage() {
  echo "Usage: $0 [-v] [-o output] [-h] filename"
  exit 1
}

verbose=false
output=""

while [ $# -gt 0 ]; do
  case $1 in
    -v|--verbose)
      verbose=true
      shift
      ;;
    -o|--output)
      output="$2"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    -*)
      echo "Error: Unknown option $1"
      usage
      ;;
    *)
      filename="$1"
      shift
      ;;
  esac
done

echo "Verbose: $verbose"
echo "Output: $output"
echo "Filename: $filename"
```

Running it:

```bash
./script.sh -v -o results.txt data.csv
# Verbose: true
# Output: results.txt
# Filename: data.csv
```

---

## Case with User Input Validation

```bash
#!/bin/bash

read -p "Are you sure? (yes/no): " answer

case $answer in
  [Yy]|[Yy][Ee][Ss])
    echo "Proceeding..."
    ;;
  [Nn]|[Nn][Oo])
    echo "Cancelled."
    exit 0
    ;;
  *)
    echo "Please answer yes or no."
    exit 1
    ;;
esac
```

The pattern `[Yy]` matches both uppercase and lowercase. `[Yy][Ee][Ss]` matches "yes", "Yes", "YES", "yEs", etc.

---

## Case vs if-elif: When to Use Which

| Use `case` when... | Use `if-elif` when... |
|---|---|
| Comparing ONE variable to many values | Comparing multiple different variables |
| Matching patterns/wildcards | Testing complex conditions |
| Building menus | Checking ranges (numeric comparisons) |
| Parsing options/arguments | Combining conditions with && or \|\| |

**Case is better here:**

```bash
# Clean and readable
case $day in
  Mon|Tue|Wed|Thu|Fri) echo "Weekday" ;;
  Sat|Sun) echo "Weekend" ;;
esac
```

**if-elif is better here:**

```bash
# Need numeric comparison
if [ "$age" -lt 13 ]; then
  echo "Child"
elif [ "$age" -lt 18 ]; then
  echo "Teenager"
else
  echo "Adult"
fi
```

---

## Full Example: File Type Handler

A script that performs different actions based on file extension:

```bash
#!/bin/bash

# file_handler.sh — Open/process files based on their type

if [ $# -eq 0 ]; then
  echo "Usage: $0 <filename>"
  exit 1
fi

file="$1"

if [ ! -f "$file" ]; then
  echo "Error: '$file' not found or is not a regular file."
  exit 1
fi

# Get the extension (lowercase)
ext="${file##*.}"
ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

case $ext in
  txt|md|log)
    echo "=== Text File: $file ==="
    echo "Lines: $(wc -l < "$file")"
    echo "Words: $(wc -w < "$file")"
    echo "--- First 10 lines ---"
    head -10 "$file"
    ;;
  sh|bash)
    echo "=== Shell Script: $file ==="
    echo "Checking syntax..."
    if bash -n "$file" 2>/dev/null; then
      echo "Syntax OK"
    else
      echo "Syntax errors found!"
      bash -n "$file"
    fi
    ;;
  csv)
    echo "=== CSV File: $file ==="
    echo "Rows: $(wc -l < "$file")"
    echo "Columns: $(head -1 "$file" | tr ',' '\n' | wc -l)"
    echo "--- Header ---"
    head -1 "$file"
    ;;
  json)
    echo "=== JSON File: $file ==="
    if command -v jq &>/dev/null; then
      jq '.' "$file"
    else
      echo "Install jq for pretty-printing"
      cat "$file"
    fi
    ;;
  tar|gz|tgz|zip)
    echo "=== Archive: $file ==="
    case $ext in
      tar)
        tar -tf "$file" | head -20
        ;;
      gz|tgz)
        tar -tzf "$file" | head -20
        ;;
      zip)
        unzip -l "$file" | head -20
        ;;
    esac
    ;;
  jpg|jpeg|png|gif|svg)
    echo "=== Image: $file ==="
    echo "Size: $(du -h "$file" | cut -f1)"
    if command -v file &>/dev/null; then
      file "$file"
    fi
    ;;
  *)
    echo "=== Unknown type: .$ext ==="
    echo "File info:"
    file "$file"
    echo "Size: $(du -h "$file" | cut -f1)"
    ;;
esac
```

---

## Fall-Through with ;;&

In Bash 4+, you can use `;;&` instead of `;;` to continue testing subsequent patterns (fall-through):

```bash
#!/bin/bash

number=15

case $number in
  *5)
    echo "$number ends in 5"
    ;;&
  1?)
    echo "$number is between 10 and 19"
    ;;&
  [0-9]|1[0-5])
    echo "$number is 15 or less"
    ;;
esac
```

Output:

```bash
15 ends in 5
15 is between 10 and 19
15 is 15 or less
```

With `;;` only the first match would execute. With `;;&` all matching patterns execute.

---

## Quick Reference

```bash
# Basic case
case $var in
  value1) commands ;;
  value2) commands ;;
  *) default ;;
esac

# Multiple patterns
case $var in
  a|b|c) echo "matched" ;;
esac

# Glob patterns
case $file in
  *.txt) echo "text" ;;
  ???) echo "3 chars" ;;
  [A-Z]*) echo "starts uppercase" ;;
esac
```

---

## Exercises

1. Write a menu script with options: add, remove, list, and quit.
2. Write an argument parser that accepts `-n name`, `-a age`, and `--help`.
3. Write a script that reads a character and reports if it's a vowel, consonant, digit, or special character.
4. Create a "season checker" — input a month name, output the season.

---

## Summary

- `case` matches one variable against multiple patterns
- Patterns support wildcards: `*`, `?`, `[...]`
- Use `|` for multiple patterns in one block
- `*)` is the catch-all default — always put it last
- End each block with `;;`
- Perfect for menus, argument parsing, and file-type switching
- Prefer `case` over long `if-elif` chains when comparing one value

Next lesson: **Loops** — `for`, `while`, and `until`.
