---
title: Conditional Statements
---

# Conditional Statements

Conditional statements let your scripts **make decisions**. Based on whether a condition is true or false, different code paths execute.

---

## The if Statement

The basic syntax:

```bash
if [ condition ]; then
    # Commands to run if condition is true
fi
```

**Example:**

```bash
#!/bin/bash

age=18

if [ $age -ge 18 ]; then
    echo "You are an adult."
fi
```

**Important:** Spaces inside `[ ]` are **required**:

```bash
# Correct:
if [ $age -ge 18 ]; then

# WRONG (will error):
if [$age -ge 18]; then
```

---

## if-else

Execute one block if true, another if false:

```bash
if [ condition ]; then
    # True branch
else
    # False branch
fi
```

**Example:**

```bash
#!/bin/bash

read -p "Enter a number: " num

if [ $num -gt 0 ]; then
    echo "$num is positive"
else
    echo "$num is not positive"
fi
```

---

## if-elif-else

Test multiple conditions in sequence:

```bash
if [ condition1 ]; then
    # condition1 is true
elif [ condition2 ]; then
    # condition2 is true
elif [ condition3 ]; then
    # condition3 is true
else
    # None of the above
fi
```

**Example:**

```bash
#!/bin/bash

read -p "Enter your score (0-100): " score

if [ $score -ge 90 ]; then
    grade="A"
elif [ $score -ge 80 ]; then
    grade="B"
elif [ $score -ge 70 ]; then
    grade="C"
elif [ $score -ge 60 ]; then
    grade="D"
else
    grade="F"
fi

echo "Your grade: $grade"
```

---

## Test Commands: [ ] vs [[ ]] vs (( ))

Bash provides three ways to test conditions:

### [ ] — Single brackets (POSIX test)

```bash
# Works in all POSIX shells (sh, bash, dash, etc.)
if [ "$name" = "Alice" ]; then
    echo "Hello Alice"
fi
```

### [[ ]] — Double brackets (Bash extended test)

```bash
# Bash-specific, more features, safer
if [[ "$name" == "Alice" ]]; then
    echo "Hello Alice"
fi
```

### (( )) — Arithmetic evaluation

```bash
# For numeric comparisons only
if (( age >= 18 )); then
    echo "Adult"
fi
```

---

## String Comparisons

### Using [ ] (POSIX)

```bash
#!/bin/bash

str1="hello"
str2="world"
empty=""

# Equal:
if [ "$str1" = "$str2" ]; then
    echo "Strings are equal"
fi

# Not equal:
if [ "$str1" != "$str2" ]; then
    echo "Strings are different"
fi

# Empty string (-z = zero length):
if [ -z "$empty" ]; then
    echo "Variable is empty"
fi

# Non-empty string (-n = non-zero length):
if [ -n "$str1" ]; then
    echo "Variable is not empty"
fi
```

### Using [[ ]] (Bash — recommended for strings)

```bash
#!/bin/bash

name="Alice"

# Equal (== works in [[ ]]):
if [[ "$name" == "Alice" ]]; then
    echo "Match!"
fi

# Pattern matching with wildcards:
if [[ "$name" == A* ]]; then
    echo "Name starts with A"
fi

# Pattern matching:
if [[ "$name" == *lic* ]]; then
    echo "Name contains 'lic'"
fi

# Regex matching with =~:
if [[ "$name" =~ ^[A-Z][a-z]+$ ]]; then
    echo "Name is capitalized"
fi
```

### String comparison operators summary

| Operator | Meaning | Context |
|----------|---------|---------|
| `=` | Equal | `[ ]` and `[[ ]]` |
| `==` | Equal | `[[ ]]` only |
| `!=` | Not equal | Both |
| `-z` | Empty (zero length) | Both |
| `-n` | Not empty (non-zero length) | Both |
| `<` | Less than (alphabetical) | `[[ ]]` (needs `\<` in `[ ]`) |
| `>` | Greater than (alphabetical) | `[[ ]]` (needs `\>` in `[ ]`) |

---

## Integer Comparisons

### Using [ ] with flags

```bash
#!/bin/bash

a=10
b=20

if [ $a -eq $b ]; then echo "Equal"; fi
if [ $a -ne $b ]; then echo "Not equal"; fi
if [ $a -lt $b ]; then echo "$a < $b"; fi
if [ $a -gt $b ]; then echo "$a > $b"; fi
if [ $a -le $b ]; then echo "$a <= $b"; fi
if [ $a -ge $b ]; then echo "$a >= $b"; fi
```

### Integer comparison operators

| Operator | Meaning |
|----------|---------|
| `-eq` | Equal |
| `-ne` | Not equal |
| `-lt` | Less than |
| `-gt` | Greater than |
| `-le` | Less than or equal |
| `-ge` | Greater than or equal |

### Using (( )) for numeric comparisons (cleaner)

```bash
#!/bin/bash

a=10
b=20

if (( a == b )); then echo "Equal"; fi
if (( a != b )); then echo "Not equal"; fi
if (( a < b ));  then echo "$a < $b"; fi
if (( a > b ));  then echo "$a > $b"; fi
if (( a <= b )); then echo "$a <= $b"; fi
if (( a >= b )); then echo "$a >= $b"; fi
```

**(( )) is much more readable for numeric conditions!**

---

## File Test Operators

Test file properties — extremely useful for scripts:

```bash
#!/bin/bash

file="/etc/passwd"
dir="/tmp"
script="./myscript.sh"

# File exists?
if [ -f "$file" ]; then
    echo "$file exists and is a regular file"
fi

# Directory exists?
if [ -d "$dir" ]; then
    echo "$dir exists and is a directory"
fi

# File or directory exists (any type)?
if [ -e "$file" ]; then
    echo "$file exists"
fi

# Readable?
if [ -r "$file" ]; then
    echo "$file is readable"
fi

# Writable?
if [ -w "$file" ]; then
    echo "$file is writable"
fi

# Executable?
if [ -x "$script" ]; then
    echo "$script is executable"
fi

# File is non-empty (size > 0)?
if [ -s "$file" ]; then
    echo "$file is not empty"
fi
```

### Complete file test operators

| Operator | True if... |
|----------|-----------|
| `-f file` | Regular file exists |
| `-d file` | Directory exists |
| `-e file` | File exists (any type) |
| `-r file` | File is readable |
| `-w file` | File is writable |
| `-x file` | File is executable |
| `-s file` | File is non-empty (size > 0) |
| `-L file` | File is a symbolic link |
| `-p file` | File is a named pipe |
| `-b file` | File is a block device |
| `-c file` | File is a character device |
| `-O file` | You own the file |
| `-G file` | File's group matches yours |
| `f1 -nt f2` | f1 is newer than f2 |
| `f1 -ot f2` | f1 is older than f2 |

**Practical example:**

```bash
#!/bin/bash
# safe_delete.sh — Delete a file with safety checks

file="$1"

if [ -z "$file" ]; then
    echo "Usage: $0 <filename>"
    exit 1
fi

if [ ! -e "$file" ]; then
    echo "Error: '$file' does not exist"
    exit 1
fi

if [ -d "$file" ]; then
    echo "Error: '$file' is a directory, use rm -r"
    exit 1
fi

if [ ! -w "$file" ]; then
    echo "Error: No write permission on '$file'"
    exit 1
fi

rm "$file"
echo "Deleted: $file"
```

---

## Logical Operators

Combine multiple conditions:

### AND (&&) — both must be true

```bash
#!/bin/bash

age=25
name="Alice"

# Using && inside [[ ]]:
if [[ $age -ge 18 && "$name" == "Alice" ]]; then
    echo "Adult named Alice"
fi

# Using -a inside [ ] (older style):
if [ $age -ge 18 -a "$name" = "Alice" ]; then
    echo "Adult named Alice"
fi

# Using separate brackets with &&:
if [ $age -ge 18 ] && [ "$name" = "Alice" ]; then
    echo "Adult named Alice"
fi
```

### OR (||) — at least one must be true

```bash
#!/bin/bash

day="Saturday"

# Using || inside [[ ]]:
if [[ "$day" == "Saturday" || "$day" == "Sunday" ]]; then
    echo "It's the weekend!"
fi

# Using -o inside [ ] (older style):
if [ "$day" = "Saturday" -o "$day" = "Sunday" ]; then
    echo "It's the weekend!"
fi

# Using separate brackets with ||:
if [ "$day" = "Saturday" ] || [ "$day" = "Sunday" ]; then
    echo "It's the weekend!"
fi
```

### NOT (!) — negate a condition

```bash
#!/bin/bash

file="test.txt"

# File does NOT exist:
if [ ! -f "$file" ]; then
    echo "$file not found"
fi

# String is NOT empty:
if [[ ! -z "$name" ]]; then
    echo "Name is set"
fi

# NOT equal:
if [ "$answer" != "yes" ]; then
    echo "You did not say yes"
fi
```

### Combining AND, OR, NOT

```bash
#!/bin/bash

age=25
country="US"

if [[ $age -ge 21 && "$country" == "US" ]]; then
    echo "Can purchase alcohol in the US"
fi

if [[ ($age -ge 18 && "$country" == "US") || ($age -ge 16 && "$country" == "UK") ]]; then
    echo "Can drive"
fi
```

---

## [[ ]] vs [ ] — Key Differences

| Feature | `[ ]` | `[[ ]]` |
|---------|-------|---------|
| POSIX compatible | Yes | No (bash only) |
| Variable quoting | Required | Optional (but recommended) |
| Pattern matching | No | Yes (`==` with `*`, `?`) |
| Regex matching | No | Yes (`=~`) |
| Logical `&&` `\|\|` inside | No (use `-a` `-o`) | Yes |
| Word splitting | Yes | No |

```bash
#!/bin/bash

# [ ] requires quoting to prevent word splitting:
name="John Doe"
if [ "$name" = "John Doe" ]; then echo "match"; fi

# [[ ]] handles it without quoting:
if [[ $name == "John Doe" ]]; then echo "match"; fi

# Pattern matching (only in [[ ]]):
filename="report_2024.pdf"
if [[ "$filename" == *.pdf ]]; then echo "PDF file"; fi
if [[ "$filename" == report_* ]]; then echo "It's a report"; fi

# Regex matching (only in [[ ]]):
email="user@example.com"
if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "Valid email"
fi
```

---

## Short-Circuit Evaluation

```bash
#!/bin/bash

# command && run_if_success
[ -f "config.txt" ] && echo "Config exists"

# command || run_if_failure
[ -f "config.txt" ] || echo "Config NOT found"

# Practical examples:
[ -d "$dir" ] || mkdir -p "$dir"     # Create dir if missing
[ -f "$file" ] && source "$file"     # Source file if exists
```

---

## Nested if Statements

```bash
#!/bin/bash

read -p "Enter a number: " num

if [ $num -gt 0 ]; then
    echo "$num is positive"
    if [ $((num % 2)) -eq 0 ]; then
        echo "And it's even"
    else
        echo "And it's odd"
    fi
elif [ $num -lt 0 ]; then
    echo "$num is negative"
else
    echo "The number is zero"
fi
```

---

## Practice: File Type Checker

```bash
#!/bin/bash
# filetype.sh — Check what type a path is

path="$1"

if [ -z "$path" ]; then
    echo "Usage: $0 <path>"
    exit 1
fi

if [ ! -e "$path" ]; then
    echo "'$path' does not exist"
    exit 1
fi

echo "Path: $path"

if [ -f "$path" ]; then
    echo "Type: Regular file"
    echo "Size: $(wc -c < "$path") bytes"
    [ -r "$path" ] && echo "Readable: Yes" || echo "Readable: No"
    [ -w "$path" ] && echo "Writable: Yes" || echo "Writable: No"
    [ -x "$path" ] && echo "Executable: Yes" || echo "Executable: No"
elif [ -d "$path" ]; then
    echo "Type: Directory"
    echo "Contents: $(ls -1 "$path" | wc -l) items"
else
    echo "Type: Other"
fi
```

---

## Summary

| Construct | Usage |
|-----------|-------|
| `if [ ]; then ... fi` | Basic conditional |
| `if ... else ... fi` | Two branches |
| `if ... elif ... else ... fi` | Multiple branches |
| `[ ]` | POSIX test (quote vars!) |
| `[[ ]]` | Bash extended test (patterns, regex) |
| `(( ))` | Arithmetic conditions |
| `case ... esac` | Pattern-based branching |

**String tests:** `=`, `!=`, `-z`, `-n`
**Integer tests:** `-eq`, `-ne`, `-lt`, `-gt`, `-le`, `-ge`
**File tests:** `-f`, `-d`, `-e`, `-r`, `-w`, `-x`, `-s`

---

## Next Steps

Now that your scripts can make decisions, the next lesson covers **loops** — repeating actions with `for`, `while`, and `until` to process data and automate repetitive tasks.
