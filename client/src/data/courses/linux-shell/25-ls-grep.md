---
title: grep — Pattern Searching
---

# grep — Pattern Searching

`grep` is one of the most used commands in Linux. It searches for **patterns** in files and outputs matching lines. The name stands for **G**lobal **R**egular **E**xpression **P**rint.

---

## Basic Usage

```bash
grep "pattern" filename
```

**Example:**

```bash
# Search for "error" in a log file
grep "error" /var/log/syslog
```

This prints every line in the file that contains the word "error".

---

### Multiple Files

```bash
# Search in multiple files
grep "pattern" file1.txt file2.txt file3.txt

# Search all .txt files in current directory
grep "pattern" *.txt

# Search all files in current directory
grep "pattern" *
```

---

## Common Flags

### -i — Case Insensitive

```bash
# Match "error", "Error", "ERROR", "eRrOr", etc.
grep -i "error" logfile.txt
```

Output:

```bash
[2024-01-15] ERROR: Connection failed
[2024-01-15] Error: timeout occurred
[2024-01-15] error in module auth
```

---

### -n — Show Line Numbers

```bash
# Show line numbers with matches
grep -n "error" logfile.txt
```

Output:

```bash
15:ERROR: Connection failed
42:Error: timeout occurred
89:error in module auth
```

---

### -c — Count Matches

```bash
# Count how many lines match
grep -c "error" logfile.txt
```

Output:

```bash
3
```

This counts **lines** with matches, not total occurrences.

---

### -r — Recursive Search

```bash
# Search in all files in a directory (recursively)
grep -r "TODO" /home/user/project/

# Same as -r but follows symlinks
grep -R "TODO" /home/user/project/
```

Output:

```bash
/home/user/project/src/main.js:// TODO: fix this function
/home/user/project/src/utils.js:// TODO: add error handling
/home/user/project/README.md:- TODO: write documentation
```

---

### -l — List Filenames Only

```bash
# Show only filenames that contain matches (not the lines)
grep -rl "password" /etc/
```

Output:

```bash
/etc/shadow
/etc/login.defs
/etc/pam.d/common-password
```

Useful when you just need to know **which** files contain the pattern.

---

### -L — List Files WITHOUT Matches

```bash
# Show files that do NOT contain the pattern
grep -rL "error" *.log
```

---

### -v — Invert Match

```bash
# Show lines that do NOT match the pattern
grep -v "comment" config.txt
```

**Example: Filter out blank lines and comments:**

```bash
# Show only active configuration lines
grep -v "^#" /etc/ssh/sshd_config | grep -v "^$"
```

---

### -w — Whole Word Match

```bash
# Match whole word "error" only
grep -w "error" logfile.txt
```

This prevents matching "errors", "error_log", "terrorism", etc.

```bash
# Without -w: matches "error" inside other words
grep "error" file.txt
# Matches: error, errors, error_code, myerror

# With -w: matches only the standalone word "error"
grep -w "error" file.txt
# Matches: error (only)
```

---

### -A, -B, -C — Context Lines

```bash
# Show 3 lines AFTER each match
grep -A 3 "error" logfile.txt

# Show 2 lines BEFORE each match
grep -B 2 "error" logfile.txt

# Show 2 lines BEFORE and AFTER each match (Context)
grep -C 2 "error" logfile.txt
```

**Example:**

```bash
grep -C 2 "Exception" app.log
```

Output:

```bash
2024-01-15 10:30:01 Calling database service
2024-01-15 10:30:02 Exception: Connection refused
2024-01-15 10:30:02 Retrying in 5 seconds...
```

---

### --color — Highlight Matches

```bash
# Highlight the matching text in color
grep --color=auto "error" logfile.txt

# Most systems alias grep to include --color=auto
```
```

---

## grep with Pipes

One of grep's most powerful uses is filtering output from other commands:

```bash
# Find running processes
ps aux | grep "nginx"

# Filter command history
history | grep "git"

# Filter environment variables
env | grep "PATH"

# Find specific user
cat /etc/passwd | grep "username"
```

---

### Combining Multiple greps

```bash
# AND logic: must match both patterns
grep "error" logfile.txt | grep "database"

# NOT logic: match one but not the other
grep "error" logfile.txt | grep -v "timeout"
```

---

## grep with Basic Regex

By default, grep uses **Basic Regular Expressions (BRE)**.

### Common Regex Patterns

```bash
# . = any single character
grep "h.t" file.txt          # Matches: hat, hot, hit, h3t

# ^ = start of line
grep "^Error" logfile.txt    # Lines STARTING with "Error"

# $ = end of line
grep "done$" logfile.txt     # Lines ENDING with "done"

# * = zero or more of previous character
grep "go*d" file.txt         # Matches: gd, god, good, goood

# [] = character class
grep "[aeiou]" file.txt      # Lines with any vowel
grep "[0-9]" file.txt        # Lines with any digit
grep "[A-Z]" file.txt        # Lines with uppercase letter

# [^] = negated character class
grep "[^0-9]" file.txt       # Lines with non-digit characters

# \{n\} = exactly n repetitions (BRE requires backslash)
grep "o\{2\}" file.txt       # Matches: "oo" (like "food", "good")

# \< \> = word boundaries (BRE)
grep "\<error\>" file.txt    # Whole word "error" only
```

---

### Practical Regex Examples

```bash
# Find empty lines
grep "^$" file.txt

# Find lines starting with a number
grep "^[0-9]" file.txt

# Find IP addresses (simple)
grep "[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}" file.txt

# Find commented lines
grep "^#" config.txt
```

---

## egrep / grep -E — Extended Regex

Extended regex adds more operators **without** needing backslashes:

```bash
# Use grep -E or egrep (same thing)
grep -E "pattern" file.txt
egrep "pattern" file.txt
```

### Extended Regex Operators

```bash
# + = one or more of previous character
grep -E "go+d" file.txt      # Matches: god, good, goood (NOT gd)

# ? = zero or one of previous character
grep -E "colou?r" file.txt   # Matches: color, colour

# | = OR (alternation)
grep -E "error|warning|critical" logfile.txt

# () = grouping
grep -E "(error|warn)ing" file.txt   # Matches: erroring, warning

# {n} = exactly n repetitions (no backslash needed)
grep -E "o{2}" file.txt      # Matches: "oo"
grep -E "[0-9]{3}" file.txt  # Three consecutive digits

# {n,m} = between n and m repetitions
grep -E "[0-9]{2,4}" file.txt  # 2 to 4 consecutive digits
```

---

### Extended Regex Examples

```bash
# Find phone numbers (xxx-xxx-xxxx)
grep -E "[0-9]{3}-[0-9]{3}-[0-9]{4}" contacts.txt

# Find URLs
grep -E "https?://[a-zA-Z0-9./?=_-]+" file.txt

# Find either "color" or "colour"
grep -E "colou?r" file.txt

# Find hex color codes
grep -E "#[0-9a-fA-F]{6}" styles.css

# Find function definitions (JavaScript)
grep -E "function [a-zA-Z_]+\(" *.js
```

---

## fgrep / grep -F — Fixed Strings

`grep -F` (or `fgrep`) treats the pattern as a **literal string** — no regex at all.

This is **faster** and useful when searching for text that contains regex special characters:

```bash
# Search for literal string (no regex interpretation)
grep -F "error.log" file.txt

# Without -F, the dot would match any character
grep "error.log" file.txt    # Would also match "errorXlog"

# With -F, dot is treated literally
grep -F "error.log" file.txt  # Only matches "error.log"

# Useful for strings with special characters
grep -F "price = $9.99" receipt.txt
grep -F "[WARNING]" logfile.txt
grep -F "array[0]" code.js
grep -F "2^10" math.txt
```

---

### When to Use grep -F

```bash
# Searching for code with regex characters
grep -F "if (x > 0 && y < 10)" code.c

# Searching for URLs with special characters
grep -F "https://example.com/page?id=5&type=user" links.txt
```

---

## Real-World Examples

### Searching Log Files

```bash
# Find failed SSH login attempts
grep "Failed password" /var/log/auth.log

# Find top error messages
grep "ERROR" app.log | sort | uniq -c | sort -rn | head -10

# Monitor logs in real-time (combine with tail)
tail -f /var/log/syslog | grep --line-buffered "error"
```

---

### Searching Code

```bash
# Find all TODO/FIXME comments
grep -rn "TODO\|FIXME\|HACK\|XXX" src/

# Find function definitions
grep -rn "function " --include="*.js" src/

# Find all files containing a class
grep -rl "class MyClass" --include="*.java" src/
```

---

## grep Exit Codes

grep returns exit codes that are useful in scripts:

```bash
# 0 = match found
# 1 = no match found
# 2 = error occurred

# Use in if statements
if grep -q "error" logfile.txt; then
    echo "Errors found!"
fi

# The -q flag suppresses output (quiet mode)
grep -q "pattern" file.txt
echo $?    # 0 if found, 1 if not found
```

---

## Practice Exercises

```bash
# Create a sample file
cat > /tmp/grep-practice.txt << 'EOF'
Hello World
hello world
HELLO WORLD
This is line 4
Error: something went wrong
warning: disk space low
ERROR: critical failure
The cat sat on the mat
The bat sat on the hat
12345 numbers here
email: user@example.com
price: $9.99
file: error.log
EOF

# Exercise 1: Case insensitive search
grep -i "hello" /tmp/grep-practice.txt

# Exercise 2: Count matches
grep -ic "error" /tmp/grep-practice.txt

# Exercise 3: Line numbers and context
grep -in -A 1 "error" /tmp/grep-practice.txt

# Exercise 4: Invert match
grep -iv "error\|warning" /tmp/grep-practice.txt

# Exercise 5: Regex — lines starting with capital
grep "^[A-Z]" /tmp/grep-practice.txt

# Exercise 6: Whole word matching
grep -w "error" /tmp/grep-practice.txt

# Exercise 7: Fixed string search
grep -F "$9.99" /tmp/grep-practice.txt
grep -F "error.log" /tmp/grep-practice.txt

# Exercise 8: Pipe with grep
ps aux | grep "$USER" | grep -v "grep"
echo $PATH | tr ':' '\n' | grep "local"

# Exercise 9: Extended regex
grep -E "The [a-z]+ sat" /tmp/grep-practice.txt

# Exercise 10: Combining flags
grep -winC 1 "error" /tmp/grep-practice.txt
```

---

## Quick Reference

```bash
# Basic usage
grep "pattern" file            # Search in file
grep -r "pattern" dir/         # Recursive search

# Common flags
-i    # Case insensitive
-n    # Line numbers
-c    # Count matches
-r    # Recursive
-l    # Filenames only
-v    # Invert (non-matching lines)
-w    # Whole word
-o    # Only matching part
-q    # Quiet (for scripts)
-A n  # n lines After match
-B n  # n lines Before match
-C n  # n lines Context (before + after)

# Regex modes
grep "pattern"     # Basic regex (BRE)
grep -E "pattern"  # Extended regex (ERE)
grep -F "pattern"  # Fixed string (no regex)

# File filtering
--include="*.js"        # Only search these files
--exclude="*.min.js"    # Skip these files
--exclude-dir="node_modules"  # Skip directories
```

---

## Summary

- `grep` searches for patterns in files and outputs matching lines
- Use `-i` for case insensitive, `-n` for line numbers, `-r` for recursive
- Use `-v` to invert, `-w` for whole word matching
- Combine with pipes (`|`) to filter any command's output
- `grep -E` enables extended regex; `grep -F` uses literal strings
- Context flags (`-A`, `-B`, `-C`) show surrounding lines
- Use `--include` and `--exclude` to filter file types
