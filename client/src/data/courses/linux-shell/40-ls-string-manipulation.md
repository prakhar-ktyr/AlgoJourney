---
title: String Manipulation
---

# String Manipulation

Bash has powerful built-in string operations — no external tools needed. You can measure, slice, replace, trim, and transform strings using parameter expansion syntax.

---

## String Length

Get the number of characters with `${#string}`:

```bash
#!/bin/bash

name="Hello, World!"

echo "String: '$name'"
echo "Length: ${#name}"
```

Output:

```bash
String: 'Hello, World!'
Length: 13
```

More examples:

```bash
#!/bin/bash

empty=""
short="hi"
long="This is a longer sentence."

echo "empty: ${#empty}"   # 0
echo "short: ${#short}"   # 2
echo "long: ${#long}"     # 27
```

---

## Substring Extraction

Extract part of a string with `${string:position:length}`:

```bash
#!/bin/bash

text="Hello, World!"

echo "${text:0:5}"    # Hello    (5 chars from position 0)
echo "${text:7:5}"    # World    (5 chars from position 7)
echo "${text:7}"      # World!   (everything from position 7)
```

Position is 0-based. If length is omitted, you get everything from position to end.

### Negative Offset (From the End)

```bash
#!/bin/bash

text="Hello, World!"

echo "${text: -6}"      # orld!  (last 6 characters)
echo "${text: -6:4}"    # orld   (4 chars starting 6 from end)
```

**Important:** Add a space before the minus sign — `${text: -6}` not `${text:-6}` (the latter is default-value syntax).

---

## String Replacement

### Replace First Occurrence

```bash
${string/pattern/replacement}
```

```bash
#!/bin/bash

text="The cat sat on the cat mat"

echo "${text/cat/dog}"
```

Output:

```bash
The dog sat on the cat mat
```

Only the **first** match is replaced.

### Replace All Occurrences

```bash
${string//pattern/replacement}
```

```bash
#!/bin/bash

text="The cat sat on the cat mat"

echo "${text//cat/dog}"
```

Output:

```bash
The dog sat on the dog mat
```

### Replace at Beginning or End

```bash
#!/bin/bash

file="hello_world.txt"

# Replace only if at the beginning
echo "${file/#hello/goodbye}"    # goodbye_world.txt

# Replace only if at the end
echo "${file/%.txt/.md}"         # hello_world.md
```

### Delete (Replace with Nothing)

```bash
#!/bin/bash

text="Hello, World!"

echo "${text/,/}"       # Hello World!  (remove first comma)
echo "${text// /}"      # Hello,World!  (remove all spaces)
```

---

## Remove Prefix

Strip from the **beginning** of a string:

| Syntax | Behavior |
|--------|----------|
| `${string#pattern}` | Remove shortest prefix match |
| `${string##pattern}` | Remove longest prefix match (greedy) |

```bash
#!/bin/bash

path="/home/user/documents/report.txt"

echo "Original: $path"
echo "Remove first /*/: ${path#*/}"       # home/user/documents/report.txt
echo "Remove all /*/:  ${path##*/}"       # report.txt (just the filename!)
```

Common use — get filename from path:

```bash
#!/bin/bash

filepath="/var/log/app/server.log"

filename="${filepath##*/}"
echo "Filename: $filename"   # server.log
```

Get everything after first dot:

```bash
#!/bin/bash

email="user@example.com"

domain="${email#*@}"
echo "Domain: $domain"   # example.com
```

---

## Remove Suffix

Strip from the **end** of a string:

| Syntax | Behavior |
|--------|----------|
| `${string%pattern}` | Remove shortest suffix match |
| `${string%%pattern}` | Remove longest suffix match (greedy) |

```bash
#!/bin/bash

path="/home/user/documents/report.txt"

echo "Original: $path"
echo "Remove last /*:  ${path%/*}"      # /home/user/documents  (dirname!)
echo "Remove all /*:   ${path%%/*}"     # (empty — everything after first /)
```

Common use — get directory from path:

```bash
#!/bin/bash

filepath="/var/log/app/server.log"

dirname="${filepath%/*}"
echo "Directory: $dirname"   # /var/log/app
```

Get file extension:

```bash
#!/bin/bash

file="archive.tar.gz"

echo "Last extension:  ${file##*.}"   # gz
echo "All extensions:  ${file#*.}"    # tar.gz
echo "Without last ext: ${file%.*}"   # archive.tar
echo "Without all ext:  ${file%%.*}"  # archive
```

---

## Prefix and Suffix Summary

```bash
#!/bin/bash

url="https://www.example.com/path/page.html"

echo "Protocol: ${url%%://*}"           # https
echo "Without protocol: ${url#*://}"    # www.example.com/path/page.html
echo "Domain: $(temp=${url#*://}; echo ${temp%%/*})"  # www.example.com
echo "Filename: ${url##*/}"             # page.html
echo "Directory: ${url%/*}"             # https://www.example.com/path
```

---

## Uppercase and Lowercase (Bash 4+)

| Syntax | Effect |
|--------|--------|
| `${string^^}` | ALL UPPERCASE |
| `${string,,}` | all lowercase |
| `${string^}` | First letter uppercase |
| `${string,}` | First letter lowercase |

```bash
#!/bin/bash

text="Hello World"

echo "Original:   $text"
echo "UPPER:      ${text^^}"
echo "lower:      ${text,,}"
echo "First up:   ${text^}"
echo "First down: ${text,}"
```

Output:

```bash
Original:   Hello World
UPPER:      HELLO WORLD
lower:      hello world
First up:   Hello World
First down: hello World
```

Convert specific characters:

```bash
#!/bin/bash

text="Hello World"

echo "${text^^[aeiou]}"    # HEllO WOrld (only vowels uppercase)
echo "${text,,[HW]}"       # hello world (only H and W lowercase)
```

---

## Default Values

Handle empty or unset variables gracefully:

| Syntax | Behavior |
|--------|----------|
| `${var:-default}` | Use default if var is unset/empty |
| `${var:=default}` | Set var to default if unset/empty |
| `${var:+alternate}` | Use alternate if var IS set |
| `${var:?error}` | Print error and exit if var is unset/empty |

```bash
#!/bin/bash

# :-  Use default (doesn't change the variable)
name=""
echo "Hello, ${name:-World}"    # Hello, World
echo "name is still: '$name'"   # name is still: ''

# :=  Assign default (changes the variable)
echo "Hello, ${name:=World}"    # Hello, World
echo "name is now: '$name'"     # name is now: 'World'
```

```bash
#!/bin/bash

# :+  Alternate value (use something ONLY if var is set)
greeting="Hi"
echo "${greeting:+$greeting, }everyone!"  # Hi, everyone!

greeting=""
echo "${greeting:+$greeting, }everyone!"  # everyone!
```

```bash
#!/bin/bash

# :?  Error if unset (great for required variables)
# This will print the error and exit if DB_HOST is not set:
db_host="${DB_HOST:?Error: DB_HOST environment variable is required}"
echo "Connecting to $db_host..."
```

---

## String Concatenation

Bash concatenates strings by placing them next to each other:

```bash
#!/bin/bash

first="Hello"
second="World"

# Simple concatenation
combined="${first} ${second}"
echo "$combined"     # Hello World

# Appending
greeting="Good"
greeting+=" morning"
echo "$greeting"     # Good morning

# Building strings in a loop
result=""
for i in {1..5}; do
  result+="$i "
done
echo "Numbers: $result"   # Numbers: 1 2 3 4 5
```

---

## Splitting Strings with IFS

`IFS` (Internal Field Separator) controls how Bash splits strings into words:

```bash
#!/bin/bash

# Split a CSV line into an array
line="Alice,30,Engineer,NYC"

IFS=',' read -ra fields <<< "$line"

echo "Name: ${fields[0]}"
echo "Age: ${fields[1]}"
echo "Job: ${fields[2]}"
echo "City: ${fields[3]}"
```

Output:

```bash
Name: Alice
Age: 30
Job: Engineer
City: NYC
```

Split on multiple delimiters:

```bash
#!/bin/bash

path="/usr/local/bin:/usr/bin:/bin"

IFS=':' read -ra dirs <<< "$path"

echo "PATH directories:"
for dir in "${dirs[@]}"; do
  echo "  $dir"
done
```

Output:

```bash
PATH directories:
  /usr/local/bin
  /usr/bin
  /bin
```

**Important:** Always save and restore IFS if changing it globally:

```bash
old_ifs="$IFS"
IFS=','
# ... do stuff ...
IFS="$old_ifs"
```

Or use it only in the `read` command (as shown above) which is safer.

---

## Pattern Matching in Strings

Use `[[ ... ]]` with `==` for glob patterns or `=~` for regex:

```bash
#!/bin/bash

email="user@example.com"

# Glob pattern
if [[ "$email" == *@*.* ]]; then
  echo "Looks like an email"
fi

# Regex
if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
  echo "Valid email format"
fi
```

Access regex capture groups with `BASH_REMATCH`:

```bash
#!/bin/bash

date_str="2024-03-15"

if [[ "$date_str" =~ ^([0-9]{4})-([0-9]{2})-([0-9]{2})$ ]]; then
  echo "Year:  ${BASH_REMATCH[1]}"
  echo "Month: ${BASH_REMATCH[2]}"
  echo "Day:   ${BASH_REMATCH[3]}"
fi
```

Output:

```bash
Year:  2024
Month: 03
Day:   15
```

---

## Practical Example: String Processing

```bash
#!/bin/bash

# sanitize_filename — clean a string for use as a filename

sanitize() {
  local input="$1"
  local clean="$input"

  # Lowercase
  clean="${clean,,}"

  # Replace spaces with hyphens
  clean="${clean// /-}"

  # Remove everything except letters, numbers, hyphens, dots
  clean=$(echo "$clean" | tr -cd 'a-z0-9.-')

  # Remove leading/trailing hyphens
  clean="${clean#-}"
  clean="${clean%-}"

  echo "$clean"
}

# Test it
echo "$(sanitize "Hello World! (2024)")"      # hello-world-2024
echo "$(sanitize "  My File Name.txt  ")"     # my-file-name.txt
echo "$(sanitize "Résumé & Cover Letter")"    # rsum--cover-letter
```

---

## Practical Example: Path Utilities

```bash
#!/bin/bash

# Path manipulation without external commands

filepath="/home/user/projects/app/src/main.js"

# Get components
dirname="${filepath%/*}"
basename="${filepath##*/}"
extension="${basename##*.}"
filename="${basename%.*}"

echo "Full path:  $filepath"
echo "Directory:  $dirname"
echo "Basename:   $basename"
echo "Filename:   $filename"
echo "Extension:  $extension"
echo ""

# Change extension
new_path="${filepath%.*}.ts"
echo "Change ext: $new_path"

# Add suffix before extension
versioned="${filepath%.*}_v2.${extension}"
echo "Versioned:  $versioned"
```

Output:

```bash
Full path:  /home/user/projects/app/src/main.js
Directory:  /home/user/projects/app/src
Basename:   main.js
Filename:   main
Extension:  js

Change ext: /home/user/projects/app/src/main.ts
Versioned:  /home/user/projects/app/src/main_v2.js
```

---

## Practical Example: Variable Validation

```bash
#!/bin/bash

# Validate and sanitize user input using parameter expansion

validate_port() {
  local port="${1:?Port number required}"

  # Check it's a number
  if [[ ! "$port" =~ ^[0-9]+$ ]]; then
    echo "Error: '$port' is not a number" >&2
    return 1
  fi

  # Check range
  if (( port < 1 || port > 65535 )); then
    echo "Error: Port must be 1-65535" >&2
    return 1
  fi

  echo "$port"
}

# Use defaults for optional config
host="${APP_HOST:-localhost}"
port=$(validate_port "${APP_PORT:-8080}") || exit 1
protocol="${APP_PROTOCOL:-http}"

echo "Server: ${protocol}://${host}:${port}"
```

---

## Practical Example: Template Rendering

```bash
#!/bin/bash

# Simple template variable replacement

render_template() {
  local template="$1"
  shift

  local result="$template"

  # Replace each {{KEY}} with its value
  while [ $# -gt 0 ]; do
    local key="${1%%=*}"
    local value="${1#*=}"
    result="${result//\{\{$key\}\}/$value}"
    shift
  done

  echo "$result"
}

template="Hello, {{name}}! Welcome to {{city}}. Your role is {{role}}."

output=$(render_template "$template" \
  "name=Alice" \
  "city=New York" \
  "role=Engineer")

echo "$output"
```

Output:

```bash
Hello, Alice! Welcome to New York. Your role is Engineer.
```

---

## Quick Reference

```bash
# Length
${#str}                    # character count

# Substring
${str:pos:len}             # extract
${str: -N}                 # last N chars

# Replace
${str/old/new}             # first occurrence
${str//old/new}            # all occurrences
${str/#prefix/new}         # replace prefix
${str/%suffix/new}         # replace suffix

# Remove prefix
${str#pattern}             # shortest match
${str##pattern}            # longest match

# Remove suffix
${str%pattern}             # shortest match
${str%%pattern}            # longest match

# Case (Bash 4+)
${str^^}                   # UPPERCASE
${str,,}                   # lowercase
${str^}                    # First char upper
${str,}                    # First char lower

# Defaults
${var:-default}            # use default if empty
${var:=default}            # assign default if empty
${var:+alternate}          # use alternate if set
${var:?error msg}          # error if empty

# Split
IFS=',' read -ra arr <<< "$str"

# Concatenate
result="${str1}${str2}"
result+=" more"
```

---

## Exercises

1. Write a script that extracts the username and domain from an email address using only parameter expansion.
2. Create a `slugify` function that converts "My Blog Post Title!" to "my-blog-post-title".
3. Write a script that renames all `.jpeg` files to `.jpg` using string replacement.
4. Build a simple CSV parser that reads a file and prints columns aligned.
5. Create a URL parser that extracts protocol, host, port, and path from a URL string.

---

## Summary

- `${#str}` — string length
- `${str:pos:len}` — substring extraction
- `${str/old/new}` — replace first; `${str//old/new}` — replace all
- `${str#pat}` / `${str##pat}` — remove prefix (short/greedy)
- `${str%pat}` / `${str%%pat}` — remove suffix (short/greedy)
- `${str^^}` / `${str,,}` — change case (Bash 4+)
- `${var:-default}` — provide fallback values
- `IFS=',' read -ra arr <<< "$str"` — split into array
- All operations are non-destructive — they produce a new value, the original variable is unchanged

These built-in operations are faster than calling external tools like `sed`, `awk`, or `cut` for simple transformations.
