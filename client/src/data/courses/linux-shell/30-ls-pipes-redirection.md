---
title: Pipes & Redirection
---

# Pipes & Redirection

Pipes and redirection are fundamental to the Unix philosophy: small tools that do one thing well, connected together to accomplish complex tasks. Understanding how data flows between commands is essential for effective shell usage.

---

## Standard Streams

Every Linux process has three standard data streams:

| Stream | Number | Description | Default |
|--------|--------|-------------|---------|
| stdin | 0 | Standard input | Keyboard |
| stdout | 1 | Standard output | Terminal screen |
| stderr | 2 | Standard error | Terminal screen |

```bash
# This command:
# - Reads from stdin (keyboard or pipe)
# - Writes results to stdout (screen)
# - Writes errors to stderr (screen)
grep "hello" file.txt
```

---

## Output Redirection — >

Redirect stdout to a file (overwrites existing content):

```bash
# Save command output to a file
echo "Hello World" > greeting.txt

# Save directory listing
ls -la > filelist.txt

# Save date
date > timestamp.txt
```

### Example

```bash
echo "Line 1" > output.txt
echo "Line 2" > output.txt   # OVERWRITES!
cat output.txt
```

**Output:**
```
Line 2
```

> **Warning:** `>` destroys existing file content! Use `>>` to append instead.

---

## Append Redirection — >>

Add output to the end of a file (preserves existing content):

```bash
echo "Line 1" > output.txt
echo "Line 2" >> output.txt
echo "Line 3" >> output.txt
cat output.txt
```

**Output:**
```
Line 1
Line 2
Line 3
```

### Example — Simple Logging

```bash
# Append timestamp to a log file
echo "$(date): Script started" >> app.log
echo "$(date): Processing data..." >> app.log
echo "$(date): Script finished" >> app.log
```

---

## Input Redirection — <

Feed a file's contents as stdin to a command:

```bash
# Instead of: cat file.txt | wc -l
# Use input redirection:
wc -l < file.txt

# Sort contents from a file
sort < unsorted.txt

# Send file as email body
mail user@example.com < message.txt
```

### Example

```bash
cat > names.txt << 'EOF'
Charlie
Alice
Bob
EOF

sort < names.txt
```

**Output:**
```
Alice
Bob
Charlie
```

---

## Error Redirection — 2>

Redirect stderr separately from stdout:

```bash
# Redirect errors to a file
ls /nonexistent 2> errors.txt

# Redirect errors, show stdout normally
find / -name "*.conf" 2> /dev/null

# Append errors to a file
command 2>> error.log
```

### Example

```bash
# Separate stdout and stderr
ls /home /nonexistent > output.txt 2> errors.txt

cat output.txt    # Shows listing of /home
cat errors.txt    # Shows "No such file or directory"
```

---

## Redirect Both stdout and stderr

### Method 1: &> (Bash shorthand)

```bash
# Redirect both to same file
command &> all_output.txt

# Append both
command &>> all_output.txt
```

### Method 2: 2>&1 (POSIX-compatible)

```bash
# Redirect stdout to file, then stderr to same place as stdout
command > output.txt 2>&1

# Append version
command >> output.txt 2>&1
```

> **Order matters!** `2>&1` must come AFTER `> file.txt`

### Example

```bash
# Capture everything from a build
make > build.log 2>&1

# Capture all output from a script
./deploy.sh > deploy.log 2>&1
```

---

## /dev/null — The Black Hole

`/dev/null` discards everything written to it:

```bash
# Discard stdout (only show errors)
command > /dev/null

# Discard stderr (only show output)
command 2> /dev/null

# Discard ALL output (run silently)
command > /dev/null 2>&1
# or
command &> /dev/null
```

### Example

```bash
# Check if a command succeeds without output noise
if grep -q "pattern" file.txt 2>/dev/null; then
  echo "Found it!"
fi

# Suppress "Permission denied" errors from find
find / -name "*.log" 2>/dev/null
```

---

## Pipes — Connecting Commands

The pipe `|` sends stdout of one command to stdin of the next:

```bash
command1 | command2 | command3
```

Each command in the pipeline runs simultaneously. Data flows left to right.

### Basic Examples

```bash
# Count files in a directory
ls | wc -l

# Find text files and sort them
ls | grep ".txt" | sort

# Show disk usage, sorted by size
du -sh * | sort -h

# View a long output page by page
cat bigfile.txt | less
```

---

## Pipeline Examples

### Search and Filter

```bash
# Find running processes containing "node"
ps aux | grep node

# Find large files, sort by size
ls -la | sort -k5 -n | tail -10

# Count unique visitors from access log
cut -d' ' -f1 access.log | sort -u | wc -l
```

### Data Processing

```bash
# Top 5 most common words in a file
cat book.txt | tr -cs '[:alpha:]' '\n' | tr 'A-Z' 'a-z' | sort | uniq -c | sort -rn | head -5

# Disk usage by directory, top 10
du -sh /var/* 2>/dev/null | sort -rh | head -10
```

---

## xargs — Convert stdin to Arguments

Some commands don't read from stdin. `xargs` converts stdin into command-line arguments:

```bash
# Delete all .tmp files found by find
find . -name "*.tmp" | xargs rm

# Safer with filenames containing spaces
find . -name "*.tmp" -print0 | xargs -0 rm

# Run a command for each line of input
cat urls.txt | xargs -I {} curl -O {}

# Limit arguments per invocation
echo "1 2 3 4 5 6" | xargs -n 2 echo
# Output: "1 2", "3 4", "5 6" (one pair per line)

# Find and grep in one pipeline
find . -name "*.js" | xargs grep "TODO"
```

---

## tee — Split Output

`tee` writes to a file AND passes data through to the next command:

```bash
# Save intermediate results in a pipeline
ls -la | tee listing.txt | grep ".js"

# Log and display simultaneously
./build.sh | tee build.log

# Write to multiple files
echo "hello" | tee file1.txt file2.txt > file3.txt
```

---

## Process Substitution — <() and >()

Treat command output as a file:

```bash
# Compare output of two commands (as if they were files)
diff <(ls dir1) <(ls dir2)

# Compare sorted versions
diff <(sort file1.txt) <(sort file2.txt)

# Feed multiple command outputs to another command
paste <(cut -d: -f1 /etc/passwd) <(cut -d: -f7 /etc/passwd)
```

---

## Here Documents — <<

Feed multiple lines of input to a command:

```bash
# Write a multi-line file
cat > config.txt << 'EOF'
host=localhost
port=8080
debug=true
EOF
```

### Variable Expansion

```bash
NAME="World"

# Unquoted delimiter — variables ARE expanded
cat << EOF
Hello $NAME
EOF

# Quoted delimiter — variables NOT expanded (literal)
cat << 'EOF'
Hello $NAME
EOF
```

---

## Here Strings — <<<

Feed a single string as stdin:

```bash
# Instead of: echo "hello" | grep "ell"
grep "ell" <<< "hello"

# Count words in a string
wc -w <<< "one two three four"

# Convert case
tr 'a-z' 'A-Z' <<< "hello world"
# Output: HELLO WORLD
```

---

## Named Pipes (FIFOs)

Named pipes are special files that act as pipes between processes:

```bash
# Create a named pipe
mkfifo mypipe

# Terminal 1: write to the pipe (blocks until someone reads)
echo "Hello from terminal 1" > mypipe

# Terminal 2: read from the pipe
cat < mypipe

# Clean up
rm mypipe
```

---

## Practical Pipeline Examples

### Log Analysis

```bash
# Count errors per hour
grep "ERROR" app.log | cut -d' ' -f1,2 | cut -d: -f1,2 | sort | uniq -c

# Top 10 IP addresses hitting your server
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10
```

### Text Processing Pipeline

```bash
# Generate a word frequency report
cat document.txt |
  tr -cs '[:alpha:]' '\n' |   # Split into words
  tr 'A-Z' 'a-z' |             # Lowercase
  sort |                         # Sort alphabetically
  uniq -c |                      # Count occurrences
  sort -rn |                     # Sort by frequency
  head -20                       # Top 20
```

### Filter, Transform, Aggregate

```bash
# The classic ETL pipeline
cat raw_data.csv |
  grep -v "^#" |           # Filter: remove comments
  cut -d, -f2,4 |          # Transform: extract columns
  sort | uniq -c |          # Aggregate: count unique values
  sort -rn                  # Sort by frequency
```

---

## Practice Exercises

**Exercise 1:** List all `.js` files, sort by size, show the 5 largest.

```bash
ls -lS *.js | head -5
# or with find for recursive:
find . -name "*.js" -exec ls -l {} \; | sort -k5 -rn | head -5
```

**Exercise 2:** Count the number of unique words in a file, ignoring case.

```bash
tr -cs '[:alpha:]' '\n' < file.txt | tr 'A-Z' 'a-z' | sort -u | wc -l
```

**Exercise 3:** Save both output and errors to separate files.

```bash
command > stdout.txt 2> stderr.txt
```

**Exercise 4:** Build a pipeline that finds the most common shell in /etc/passwd.

```bash
cut -d: -f7 /etc/passwd | sort | uniq -c | sort -rn | head -1
```

**Exercise 5:** Compare the sorted contents of two directories.

```bash
diff <(ls dir1 | sort) <(ls dir2 | sort)
```

**Exercise 6:** Create a pipeline that monitors a log file in real-time, showing only errors.

```bash
tail -f app.log | grep --line-buffered "ERROR" | tee errors_live.log
```

---

## Quick Reference

| Syntax | Description |
|--------|-------------|
| `>` | Redirect stdout (overwrite) |
| `>>` | Redirect stdout (append) |
| `<` | Redirect stdin from file |
| `2>` | Redirect stderr |
| `2>>` | Redirect stderr (append) |
| `&>` | Redirect both stdout + stderr |
| `> file 2>&1` | Redirect both (POSIX) |
| `/dev/null` | Discard output |
| `\|` | Pipe stdout to next command |
| `\| tee file` | Pipe and save to file |
| `<(cmd)` | Process substitution (input) |
| `>(cmd)` | Process substitution (output) |
| `<< EOF` | Here document |
| `<<< "str"` | Here string |
| `xargs` | Convert stdin to arguments |
| `mkfifo` | Create named pipe |

Mastering pipes and redirection transforms you from running individual commands to orchestrating powerful data-processing workflows. The Unix philosophy of "small tools, connected together" starts here!
