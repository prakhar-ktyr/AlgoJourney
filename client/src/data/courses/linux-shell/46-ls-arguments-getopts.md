---
title: Script Arguments & getopts
---

# Script Arguments & getopts

When you run a shell script, you can pass **arguments** to it — just like passing arguments to any command. Learning to handle these arguments properly is essential for building useful CLI tools.

---

## Positional Parameters

When you run a script with arguments, each argument is assigned to a **positional parameter**:

```bash
./myscript.sh hello world 42
```

Inside the script:

| Parameter | Value   |
|-----------|---------|
| `$0`      | `./myscript.sh` (script name) |
| `$1`      | `hello` |
| `$2`      | `world` |
| `$3`      | `42`    |

---

## Accessing Parameters $1 Through $9

Parameters `$1` through `$9` are accessed directly:

```bash
#!/bin/bash

echo "First argument: $1"
echo "Second argument: $2"
echo "Third argument: $3"
```

Run it:

```bash
$ ./greet.sh Alice Bob Charlie
First argument: Alice
Second argument: Bob
Third argument: Charlie
```

---

## Parameters Beyond 9: ${10}+

For the 10th argument and beyond, use **curly braces**:

```bash
#!/bin/bash

echo "Argument 1: $1"
echo "Argument 10: ${10}"
echo "Argument 11: ${11}"
```

Without braces, `$10` would be interpreted as `$1` followed by `0`.

```bash
$ ./many.sh a b c d e f g h i j k
Argument 1: a
Argument 10: j
Argument 11: k
```

---

## Special Variables

Bash provides several special variables for working with arguments:

| Variable | Description |
|----------|-------------|
| `$0`    | Name of the script |
| `$#`    | Number of arguments passed |
| `$@`    | All arguments (as separate words) |
| `$*`    | All arguments (as a single string) |
| `$$`    | PID of the current script |
| `$?`    | Exit status of the last command |
| `$!`    | PID of the last background process |

---

## Example: Using Special Variables

```bash
#!/bin/bash

echo "Script name: $0"
echo "Number of arguments: $#"
echo "All arguments (\$@): $@"
echo "All arguments (\$*): $*"
echo "Process ID: $$"
```

```bash
$ ./info.sh apple banana cherry
Script name: ./info.sh
Number of arguments: 3
All arguments ($@): apple banana cherry
All arguments ($*): apple banana cherry
Process ID: 12345
```

---

## "$@" vs "$*" — The Critical Difference

This is one of the most important distinctions in shell scripting.

### Without Quotes — No Difference

```bash
# Both behave the same without quotes
for arg in $@; do echo "$arg"; done
for arg in $*; do echo "$arg"; done
```

### With Quotes — Big Difference!

**"$@"** expands each argument as a **separate quoted string**:

```bash
"$@" → "$1" "$2" "$3" ...
```

**"$*"** expands all arguments as a **single string**:

```bash
"$*" → "$1 $2 $3 ..."
```

### Demonstration

```bash
#!/bin/bash

echo "=== Using \"\$@\" ==="
count=1
for arg in "$@"; do
  echo "  Arg $count: '$arg'"
  ((count++))
done

echo ""
echo "=== Using \"\$*\" ==="
count=1
for arg in "$*"; do
  echo "  Arg $count: '$arg'"
  ((count++))
done
```

```bash
$ ./difference.sh "hello world" foo "bar baz"
=== Using "$@" ===
  Arg 1: 'hello world'
  Arg 2: 'foo'
  Arg 3: 'bar baz'

=== Using "$*" ===
  Arg 1: 'hello world foo bar baz'
```

**Rule:** Always use `"$@"` when you want to preserve argument boundaries.

---

## The shift Command

`shift` removes the first positional parameter and shifts all others down by one:

```bash
#!/bin/bash

echo "Before shift:"
echo "  \$1 = $1"
echo "  \$2 = $2"
echo "  \$3 = $3"
echo "  \$# = $#"

shift

echo ""
echo "After shift:"
echo "  \$1 = $1"
echo "  \$2 = $2"
echo "  \$# = $#"
```

```bash
$ ./shift_demo.sh alpha beta gamma
Before shift:
  $1 = alpha
  $2 = beta
  $3 = gamma
  $# = 3

After shift:
  $1 = beta
  $2 = gamma
  $# = 2
```

### shift n — Shift Multiple Positions

```bash
shift 2  # Remove the first two parameters
```

### Processing All Arguments with shift

```bash
#!/bin/bash

while [ $# -gt 0 ]; do
  echo "Processing: $1"
  shift
done
```

```bash
$ ./process.sh one two three
Processing: one
Processing: two
Processing: three
```

---

## getopts — Parse Short Options

`getopts` is a **built-in** command for parsing command-line options (flags) in your scripts.

### Basic Syntax

```bash
getopts "optstring" variable
```

- **optstring** — the valid option letters
- A colon `:` after a letter means that option requires an argument
- **variable** — stores the current option letter

---

## Simple getopts Example

```bash
#!/bin/bash

while getopts "vh" opt; do
  case $opt in
    v)
      echo "Verbose mode enabled"
      ;;
    h)
      echo "Usage: $0 [-v] [-h]"
      ;;
    \?)
      echo "Invalid option: -$OPTARG"
      exit 1
      ;;
  esac
done
```

```bash
$ ./tool.sh -v
Verbose mode enabled

$ ./tool.sh -h
Usage: ./tool.sh [-v] [-h]

$ ./tool.sh -v -h
Verbose mode enabled
Usage: ./tool.sh [-v] [-h]
```

---

## Options with Arguments

Add a colon `:` after the option letter to require an argument:

```bash
#!/bin/bash

while getopts "f:o:v" opt; do
  case $opt in
    f)
      input_file="$OPTARG"
      echo "Input file: $input_file"
      ;;
    o)
      output_file="$OPTARG"
      echo "Output file: $output_file"
      ;;
    v)
      verbose=true
      echo "Verbose mode on"
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument" >&2
      exit 1
      ;;
  esac
done
```

```bash
$ ./convert.sh -f input.txt -o output.txt -v
Input file: input.txt
Output file: output.txt
Verbose mode on
```

---

## OPTARG and OPTIND

| Variable | Purpose |
|----------|---------|
| `OPTARG` | The argument value for the current option |
| `OPTIND` | The index of the next argument to be processed |

### Using OPTIND to Access Remaining Arguments

```bash
#!/bin/bash

while getopts "f:v" opt; do
  case $opt in
    f) file="$OPTARG" ;;
    v) verbose=true ;;
  esac
done

# Shift past the processed options
shift $((OPTIND - 1))

# Now $@ contains only non-option arguments
echo "File: $file"
echo "Remaining arguments: $@"
```

```bash
$ ./script.sh -f data.csv -v arg1 arg2
File: data.csv
Remaining arguments: arg1 arg2
```

---

## Building a Usage/Help Function

Every good CLI tool needs a help message:

```bash
#!/bin/bash

usage() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS] FILE...

Process files with optional configuration.

Options:
  -f FORMAT    Output format (json, csv, text)
  -o FILE      Output file (default: stdout)
  -n COUNT     Number of records to process
  -v           Verbose output
  -h           Show this help message

Examples:
  $(basename "$0") -f json -o output.json data.csv
  $(basename "$0") -v -n 100 *.txt
EOF
  exit "${1:-0}"
}
```

---

## Complete CLI Tool Example

Here's a fully-featured CLI tool using `getopts`:

```bash
#!/bin/bash

# ============================================
# File Processor — A complete CLI tool example
# ============================================

VERSION="1.0.0"
VERBOSE=false
FORMAT="text"
OUTPUT=""
MAX_LINES=0

# --- Help / Usage ---
usage() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS] FILE...

Process and convert text files.

Options:
  -f FORMAT    Output format: text, json, csv (default: text)
  -o FILE      Write output to FILE (default: stdout)
  -n NUM       Process only first NUM lines (0 = all)
  -v           Enable verbose output
  -V           Show version
  -h           Show this help

Examples:
  $(basename "$0") -f json data.txt
  $(basename "$0") -v -n 50 -o result.csv input.txt
  $(basename "$0") -f csv file1.txt file2.txt
EOF
  exit "${1:-0}"
}

# --- Parse Options ---
while getopts "f:o:n:vVh" opt; do
  case $opt in
    f)
      FORMAT="$OPTARG"
      if [[ ! "$FORMAT" =~ ^(text|json|csv)$ ]]; then
        echo "Error: Invalid format '$FORMAT'" >&2
        echo "Valid formats: text, json, csv" >&2
        exit 1
      fi
      ;;
    o)
      OUTPUT="$OPTARG"
      ;;
    n)
      if [[ ! "$OPTARG" =~ ^[0-9]+$ ]]; then
        echo "Error: -n requires a number" >&2
        exit 1
      fi
      MAX_LINES="$OPTARG"
      ;;
    v)
      VERBOSE=true
      ;;
    V)
      echo "$(basename "$0") version $VERSION"
      exit 0
      ;;
    h)
      usage 0
      ;;
    \?)
      echo "Try '$(basename "$0") -h' for help." >&2
      exit 1
      ;;
    :)
      echo "Error: Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done

shift $((OPTIND - 1))

# --- Validate Input ---
if [ $# -eq 0 ]; then
  echo "Error: No input files specified." >&2
  usage 1
fi

# --- Verbose Logging ---
log() {
  if [ "$VERBOSE" = true ]; then
    echo "[INFO] $*" >&2
  fi
}

# --- Process Files ---
log "Format: $FORMAT"
log "Output: ${OUTPUT:-stdout}"
log "Max lines: ${MAX_LINES:-all}"
log "Files: $@"

for file in "$@"; do
  if [ ! -f "$file" ]; then
    echo "Warning: '$file' not found, skipping." >&2
    continue
  fi

  log "Processing: $file"
  line_count=$(wc -l < "$file")
  log "  Lines in file: $line_count"

  # Read file content
  if [ "$MAX_LINES" -gt 0 ]; then
    content=$(head -n "$MAX_LINES" "$file")
  else
    content=$(cat "$file")
  fi

  echo "Processed $file ($FORMAT format)"
done

log "Done."
```

---

## getopt (External) for Long Options

The **external** `getopt` command supports long options (`--verbose`, `--file`):

```bash
#!/bin/bash

# Note: This uses the external getopt (GNU)
OPTS=$(getopt -o vf:o:h --long verbose,file:,output:,help -n "$0" -- "$@")
if [ $? -ne 0 ]; then
  echo "Failed to parse options" >&2
  exit 1
fi

eval set -- "$OPTS"

while true; do
  case "$1" in
    -v|--verbose) VERBOSE=true; shift ;;
    -f|--file)    FILE="$2"; shift 2 ;;
    -o|--output)  OUTPUT="$2"; shift 2 ;;
    -h|--help)    usage; shift ;;
    --)           shift; break ;;
    *)            echo "Error"; exit 1 ;;
  esac
done
```

```bash
$ ./tool.sh --verbose --file=data.txt -o result.csv
```

> **Note:** The external `getopt` is not available on all systems. macOS ships with a limited BSD version. For portability, prefer the built-in `getopts` for short options.

---

## Default Values and Validation

Always set defaults and validate inputs:

```bash
#!/bin/bash

# Defaults
PORT=${1:-8080}
HOST=${2:-"localhost"}
ENV=${3:-"development"}

# Validation
if [[ ! "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
  echo "Error: Invalid port '$PORT' (must be 1-65535)" >&2
  exit 1
fi

echo "Starting server on $HOST:$PORT ($ENV)"
```

---

## Summary

| Concept | Description |
|---------|-------------|
| `$1`–`$9`, `${10}+` | Positional parameters |
| `$#` | Argument count |
| `"$@"` | All args as separate words (use this!) |
| `"$*"` | All args as one string |
| `shift` | Remove first parameter, shift others down |
| `getopts` | Built-in short option parser |
| `OPTARG` | Current option's argument |
| `OPTIND` | Next argument index |
| `getopt` | External tool for long options |

**Next up:** We'll explore how Linux manages running programs with **Process Management**!
