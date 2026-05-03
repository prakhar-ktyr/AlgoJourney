---
title: File Testing & Comparisons
---

# File Testing & Comparisons

Bash provides powerful operators to test file properties, compare strings, and evaluate numeric conditions. These are the building blocks of conditional logic in shell scripts.

---

## File Test Operators

File test operators check properties of files and directories. Use them inside `[[ ]]` or `[ ]`:

```bash
if [[ -f "myfile.txt" ]]; then
  echo "myfile.txt exists and is a regular file"
fi
```

---

## Existence Tests

### -e: File Exists (any type)

```bash
if [[ -e "/etc/passwd" ]]; then
  echo "File exists"
fi
```

### -f: Regular File

```bash
if [[ -f "config.txt" ]]; then
  echo "config.txt is a regular file"
fi

# Common pattern: check before reading
if [[ -f "$1" ]]; then
  source "$1"
else
  echo "Error: $1 is not a file" >&2
  exit 1
fi
```

### -d: Directory

```bash
if [[ -d "/home/user" ]]; then
  echo "Directory exists"
fi

# Create directory only if it doesn't exist
if [[ ! -d "$output_dir" ]]; then
  mkdir -p "$output_dir"
fi
```

---

## File Type Tests

```bash
# -f  Regular file
# -d  Directory
# -L  Symbolic link (also -h)
# -p  Named pipe (FIFO)
# -S  Socket
# -b  Block device
# -c  Character device

path="/usr/bin/python3"

if [[ -L "$path" ]]; then
  echo "$path is a symbolic link"
  echo "Points to: $(readlink -f "$path")"
elif [[ -f "$path" ]]; then
  echo "$path is a regular file"
elif [[ -d "$path" ]]; then
  echo "$path is a directory"
fi
```

---

## Permission Tests

### -r: Readable, -w: Writable, -x: Executable

```bash
if [[ -r "data.txt" ]]; then
  cat "data.txt"
else
  echo "Cannot read data.txt" >&2
fi

if [[ -w "/var/log/app.log" ]]; then
  echo "$(date): Starting" >> /var/log/app.log
fi

if [[ -x "./build.sh" ]]; then
  ./build.sh
else
  echo "build.sh is not executable — run: chmod +x build.sh"
fi
```

**Combined permission check:**

```bash
check_file() {
  local file="$1"
  echo "Checking: $file"
  [[ -r "$file" ]] && echo "  Readable: yes" || echo "  Readable: no"
  [[ -w "$file" ]] && echo "  Writable: yes" || echo "  Writable: no"
  [[ -x "$file" ]] && echo "  Executable: yes" || echo "  Executable: no"
}

check_file "/etc/passwd"
check_file "/usr/bin/ls"
```

---

## Size and Content Tests

### -s: File is Non-Empty

```bash
if [[ -s "output.log" ]]; then
  echo "Log file has content"
else
  echo "Log file is empty or doesn't exist"
fi

# File exists but is empty
if [[ -f "file.txt" && ! -s "file.txt" ]]; then
  echo "File exists but is empty"
fi
```

---

## Symbolic Link Tests

```bash
if [[ -L "/usr/bin/python" ]]; then
  echo "python is a symlink"
  echo "Target: $(readlink /usr/bin/python)"
fi
```

---

## File Comparison Tests

### -nt: Newer Than

```bash
if [[ "source.c" -nt "program" ]]; then
  echo "Source is newer — recompiling..."
  gcc -o program source.c
fi
```

### -ot: Older Than

```bash
if [[ "cache.json" -ot "data.json" ]]; then
  echo "Cache is stale — regenerating..."
  generate_cache data.json > cache.json
fi
```

### -ef: Same File (Same Inode)

```bash
if [[ "link1" -ef "link2" ]]; then
  echo "Both names point to the same file"
fi
```

---

## Complete File Test Reference

```bash
# Existence          # Permissions         # Comparison
-e  Exists (any)     -r  Readable          -nt  Newer than
-f  Regular file     -w  Writable          -ot  Older than
-d  Directory        -x  Executable        -ef  Same file
-L  Symlink          -u  SUID bit
-p  Named pipe       -g  SGID bit          # Size
-S  Socket           -k  Sticky bit        -s   Non-empty
-b  Block device     -O  Owned by user
-c  Char device      -G  Owned by group
```

---

## String Comparisons

Use `[[ ]]` for string comparisons (preferred over `[ ]`):

### Equality, Inequality, Empty/Non-Empty

```bash
name="Alice"

if [[ "$name" == "Alice" ]]; then
  echo "Hello Alice!"
fi

if [[ "$name" != "Bob" ]]; then
  echo "You're not Bob"
fi

# -z: string is empty (zero length)
if [[ -z "$var" ]]; then
  echo "Variable is empty or unset"
fi

# -n: string is non-empty
if [[ -n "$var" ]]; then
  echo "Variable has a value: $var"
fi
```

### Lexicographic Ordering

```bash
if [[ "apple" < "banana" ]]; then
  echo "apple comes before banana"
fi
```

---

## Pattern Matching with ==

Inside `[[ ]]`, the `==` operator supports **glob patterns** on the right side:

```bash
file="document.pdf"

if [[ "$file" == *.pdf ]]; then
  echo "It's a PDF"
fi

if [[ "$file" == doc* ]]; then
  echo "Starts with 'doc'"
fi
```

---

## Regex Matching with =~

The `=~` operator matches against **extended regular expressions**:

```bash
email="user@example.com"

if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
  echo "Valid email format"
fi

# Capture groups with BASH_REMATCH
version="v3.14.2"
if [[ "$version" =~ ^v([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
  echo "Major: ${BASH_REMATCH[1]}"  # 3
  echo "Minor: ${BASH_REMATCH[2]}"  # 14
  echo "Patch: ${BASH_REMATCH[3]}"  # 2
fi
```

**More regex examples:**

```bash
# Check if string is a number
if [[ "$input" =~ ^[0-9]+$ ]]; then
  echo "$input is a number"
fi

# Check date format YYYY-MM-DD
if [[ "$date_str" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "Valid date format"
fi
```

---

## Integer Comparisons

For numbers, use these operators inside `[[ ]]`:

```bash
# -eq  Equal            -ne  Not equal
# -lt  Less than        -gt  Greater than
# -le  Less or equal    -ge  Greater or equal

count=5

if [[ $count -eq 5 ]]; then echo "equals 5"; fi
if [[ $count -lt 10 ]]; then echo "less than 10"; fi
if [[ $count -ge 1 ]]; then echo "at least 1"; fi
```

### Integer Comparisons in (( ))

Arithmetic context uses familiar operators:

```bash
count=5

if (( count == 5 )); then echo "equals 5"; fi
if (( count < 10 )); then echo "less than 10"; fi
if (( count >= 1 )); then echo "at least 1"; fi
```

**Note:** No `$` needed for variables in `(( ))`.

---

## Combining Tests

```bash
# Logical AND (&&)
if [[ -f "config.txt" && -r "config.txt" ]]; then
  echo "Config exists and is readable"
fi

# Logical OR (||)
if [[ -z "$1" || "$1" == "--help" ]]; then
  echo "Usage: $0 <filename>"
fi

# Logical NOT (!)
if [[ ! -d "$dir" ]]; then
  echo "Directory does not exist"
fi

# Parentheses for grouping
if [[ ( -f "$file" && -r "$file" ) || "$force" == true ]]; then
  process "$file"
fi

# Numeric range
if (( age >= 18 && age <= 65 )); then
  echo "Working age"
fi
```

---

## [[ ]] vs [ ] vs test

| Feature | `[ ]` / `test` | `[[ ]]` |
|---------|--------|---------|
| Word splitting | Yes (quote everything!) | No |
| Glob expansion | Yes (dangerous!) | Controlled |
| Pattern matching | No | Yes (`==` with globs) |
| Regex | No | Yes (`=~`) |
| `&&` and `\|\|` | Use `-a` and `-o` | Yes |
| `<` and `>` | Must escape | Works directly |

**Always prefer `[[ ]]`** for new scripts.

---

## Practical: File Validation Script

```bash
#!/bin/bash
set -euo pipefail

validate_input() {
  local file="$1"

  if [[ ! -e "$file" ]]; then
    echo "Error: '$file' does not exist" >&2
    return 1
  fi
  if [[ ! -f "$file" ]]; then
    echo "Error: '$file' is not a regular file" >&2
    return 1
  fi
  if [[ ! -r "$file" ]]; then
    echo "Error: '$file' is not readable" >&2
    return 1
  fi
  if [[ ! -s "$file" ]]; then
    echo "Error: '$file' is empty" >&2
    return 1
  fi
  echo "File '$file' is valid"
}

for arg in "$@"; do
  validate_input "$arg"
done
```

---

## Practical: Input Validation

```bash
#!/bin/bash

validate_port() {
  local port="$1"
  if [[ ! "$port" =~ ^[0-9]+$ ]]; then
    echo "Error: Port must be a number" >&2
    return 1
  fi
  if (( port < 1 || port > 65535 )); then
    echo "Error: Port must be 1-65535" >&2
    return 1
  fi
  return 0
}

validate_hostname() {
  local host="$1"
  if [[ -z "$host" ]]; then
    echo "Error: Hostname cannot be empty" >&2
    return 1
  fi
  if [[ ! "$host" =~ ^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$ ]]; then
    echo "Error: Invalid hostname format" >&2
    return 1
  fi
  return 0
}

validate_hostname "${1:-}" || exit 1
validate_port "${2:-}" || exit 1
echo "Connecting to $1:$2..."
```

---

## Summary

| Category | Operator | Meaning |
|----------|----------|---------|
| **File existence** | `-e` | Exists (any type) |
| | `-f` | Regular file |
| | `-d` | Directory |
| | `-L` | Symbolic link |
| **Permissions** | `-r` | Readable |
| | `-w` | Writable |
| | `-x` | Executable |
| **Size** | `-s` | Non-empty |
| **Comparison** | `-nt` | Newer than |
| | `-ot` | Older than |
| | `-ef` | Same file |
| **String** | `==` | Equal (glob in `[[ ]]`) |
| | `!=` | Not equal |
| | `=~` | Regex match |
| | `-z` | Empty |
| | `-n` | Non-empty |
| **Integer** | `-eq -ne -lt -gt -le -ge` | Numeric comparisons |
| **Logic** | `&&` `\|\|` `!` | AND, OR, NOT |

---

## Exercises

1. Write a script that takes a path and reports file type (file/dir/symlink/other) plus permissions
2. Create a function that validates an email address using `=~` regex matching
3. Write a "safe delete" script that checks existence and permissions before deleting
4. Implement a build script that only recompiles when source is newer than output (`-nt`)
5. Create a numeric range validator that accepts min, max, and value arguments
