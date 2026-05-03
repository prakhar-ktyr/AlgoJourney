---
title: Viewing File Contents
---

# Viewing File Contents

In this lesson, you will learn how to view and inspect file contents in Linux without opening a text editor.

Linux provides many tools for reading files — from displaying the entire content to viewing just the first or last few lines.

---

## The cat Command

`cat` (short for "concatenate") displays the entire contents of a file.

### Basic Usage

```bash
cat filename.txt
```

### Example

```bash
cat /etc/hostname
# mycomputer
```

### Display Multiple Files

```bash
cat file1.txt file2.txt file3.txt
```

This displays all three files one after another — this is the "concatenate" part.

### Concatenate Files into a New File

```bash
cat header.txt body.txt footer.txt > full_document.txt
```

### cat with Line Numbers

Use `-n` to show line numbers:

```bash
cat -n script.py
#      1  #!/usr/bin/env python3
#      2  import sys
#      3
#      4  def main():
#      5      print("Hello, World!")
#      6
#      7  if __name__ == "__main__":
#      8      main()
```

### Show Only Non-Blank Line Numbers

Use `-b` to number only non-empty lines:

```bash
cat -b script.py
```

### When NOT to Use cat

`cat` dumps the entire file at once. For large files, use `less` or `head`/`tail` instead:

```bash
# BAD — floods your terminal with thousands of lines
cat /var/log/syslog

# GOOD — page through it
less /var/log/syslog
```

---

## The less Command

`less` is an interactive file viewer (pager) that lets you scroll through files page by page.

### Basic Usage

```bash
less filename.txt
```

### Why "less"?

The name is a joke: "less is more" — it's an improved version of the older `more` command.

### Navigation Keys

Once inside `less`, use these keys:

| Key | Action |
|-----|--------|
| `Space` or `f` | Forward one page |
| `b` | Back one page |
| `Enter` or `j` | Forward one line |
| `k` | Back one line |
| `d` | Forward half page |
| `u` | Back half page |
| `G` | Go to end of file |
| `g` | Go to beginning of file |
| `q` | Quit less |

### Searching in less

| Key | Action |
|-----|--------|
| `/pattern` | Search forward for "pattern" |
| `?pattern` | Search backward for "pattern" |
| `n` | Next search match |
| `N` | Previous search match |

### Example: Searching a Log File

```bash
less /var/log/syslog
```

Then type `/error` and press Enter to find the first occurrence of "error". Press `n` to jump to the next match.

### Jump to a Specific Line

```bash
# Inside less, type the line number followed by g
50g    # Jump to line 50
```

### less with Line Numbers

```bash
less -N filename.txt
```

### less with Search Highlighting

By default, `less` highlights search matches. You can toggle this with `Esc` then `u`.

---

## The more Command

`more` is a simpler, older pager that only scrolls forward. Use `less` instead — it does everything `more` does and more.

```bash
more filename.txt
```

---

## The head Command

`head` displays the first lines of a file. By default, it shows 10 lines.

### Basic Usage

```bash
head filename.txt
```

### Specify Number of Lines

```bash
# Show first 20 lines
head -n 20 filename.txt

# Short form
head -20 filename.txt
```

### Show First N Bytes

```bash
head -c 100 filename.txt    # First 100 bytes
```

### View Headers of Multiple Files

```bash
head -n 5 *.txt
```

### Practical Use Cases

```bash
# Quick peek at a CSV to see headers
head -n 1 data.csv

# Check shebang line of a script
head -n 1 script.sh
```

---

## The tail Command

`tail` displays the last lines of a file. By default, it shows 10 lines.

### Basic Usage

```bash
tail filename.txt
```

### Specify Number of Lines

```bash
# Show last 20 lines
tail -n 20 filename.txt

# Short form
tail -20 filename.txt
```

### Show Everything After Line N

Use `+` to start from a specific line:

```bash
# Show from line 100 to end
tail -n +100 filename.txt
```

### tail -f — Follow a File in Real-Time

This is one of the most useful commands for system administrators!

```bash
tail -f /var/log/syslog
```

The terminal stays open and shows new lines as they are added to the file. Perfect for monitoring logs. Press `Ctrl+C` to stop following.

### Follow with Retry

If the file might be rotated (renamed and recreated):

```bash
tail -F /var/log/nginx/access.log
```

`-F` is like `-f` but keeps trying if the file is renamed or recreated.

### Practical Use Cases

```bash
# Monitor a web server log
tail -f /var/log/nginx/access.log

# See recent errors
tail -n 50 /var/log/syslog | grep "error"
```

---

## The wc Command

`wc` (word count) counts lines, words, and characters in a file.

### Basic Usage

```bash
wc filename.txt
#  42  318  2105 filename.txt
#  lines  words  bytes
```

### Count Only Lines

```bash
wc -l filename.txt
# 42 filename.txt
```

### Count Only Words

```bash
wc -w filename.txt
# 318 filename.txt
```

### Count Only Characters/Bytes

```bash
wc -c filename.txt    # Bytes
wc -m filename.txt    # Characters (multi-byte aware)
```

### Count Multiple Files

```bash
wc -l *.py
#   25 app.py
#   42 utils.py
#   13 config.py
#   80 total
```

### Combine with Pipes

```bash
# Count how many files in a directory
ls | wc -l

# Count how many lines contain "error"
grep "error" logfile.txt | wc -l

# Count processes running
ps aux | wc -l
```

---

## The file Command

The `file` command determines the type of a file by examining its contents (not just the extension).

### Basic Usage

```bash
file document.pdf
# document.pdf: PDF document, version 1.7

file photo.jpg
# photo.jpg: JPEG image data, JFIF standard 1.01

file script.sh
# script.sh: Bourne-Again shell script, ASCII text executable

file mystery_file
# mystery_file: ELF 64-bit LSB executable, x86-64
```

### Why Is This Useful?

File extensions can lie! A file named `image.jpg` might actually be a text file:

```bash
file suspicious.jpg
# suspicious.jpg: ASCII text
```

### Check Multiple Files

```bash
file *
# app.py:      Python script, ASCII text executable
# data.csv:    CSV text
# image.png:   PNG image data, 800 x 600, 8-bit/color RGBA
# archive.tar: POSIX tar archive
```

### MIME Type Output

```bash
file --mime-type document.pdf
# document.pdf: application/pdf

file --mime-type image.png
# image.png: image/png
```

---

## The stat Command

`stat` displays detailed metadata about a file.

### Basic Usage

```bash
stat filename.txt
```

### Example Output

```bash
stat report.txt
#   File: report.txt
#   Size: 2105       Blocks: 8          IO Block: 4096   regular file
# Device: 802h/2050d Inode: 1234567     Links: 1
# Access: (0644/-rw-r--r--)  Uid: (1000/user)   Gid: (1000/user)
# Access: 2024-03-15 10:30:45.123456789 +0000
# Modify: 2024-03-14 15:22:10.987654321 +0000
# Change: 2024-03-14 15:22:10.987654321 +0000
#  Birth: 2024-03-10 09:00:00.000000000 +0000
```

### What the Timestamps Mean

| Timestamp | Meaning |
|-----------|---------|
| Access | Last time the file was read |
| Modify | Last time the file content was changed |
| Change | Last time the file metadata (permissions, etc.) changed |
| Birth | When the file was created (not always available) |

### Formatted Output

```bash
# Show only the size
stat -c %s filename.txt
# 2105

# Show only permissions (octal)
stat -c %a filename.txt
# 644

# Show only modification time
stat -c %y filename.txt
# 2024-03-14 15:22:10.987654321 +0000
```

---

## Practical Exercises

### Exercise 1: Exploring cat

```bash
# Create a file with some content
echo -e "Line 1\nLine 2\nLine 3\nLine 4\nLine 5" > sample.txt

# Display with line numbers
cat -n sample.txt

# Create another file and concatenate
echo -e "Line 6\nLine 7" > more.txt
cat sample.txt more.txt > combined.txt
cat -n combined.txt
```

### Exercise 2: Using head and tail Together

```bash
# Create a file with 100 lines
seq 1 100 > numbers.txt

# Show first 5 lines
head -n 5 numbers.txt

# Show last 5 lines
tail -n 5 numbers.txt

# Show lines 45-55 (middle of file)
head -n 55 numbers.txt | tail -n 11
```

### Exercise 3: Monitoring Logs with tail -f

```bash
# In terminal 1: Start following a file
tail -f test.log

# In terminal 2: Append lines to the file
echo "$(date): Server started" >> test.log
echo "$(date): Connection received" >> test.log
echo "$(date): Error: timeout" >> test.log

# Watch them appear in terminal 1 in real-time!
# Press Ctrl+C in terminal 1 to stop
```

### Exercise 4: File Analysis

```bash
# Create a sample script
cat > example.sh << 'EOF'
#!/bin/bash
# A simple script
echo "Hello, World!"
echo "Today is $(date)"
echo "You are $(whoami)"
EOF

# Analyze it
wc example.sh           # lines, words, bytes
wc -l example.sh        # just lines
file example.sh         # file type
stat example.sh         # full metadata
```

### Exercise 5: Navigating with less

```bash
# Create a large file
seq 1 1000 > big_file.txt

# Open in less
less -N big_file.txt

# Practice:
# - Press Space to page down
# - Press b to page up
# - Type /500 to search for "500"
# - Press n for next match
# - Type 750g to jump to line 750
# - Press G to go to end
# - Press g to go to beginning
# - Press q to quit
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `cat file` | Display entire file |
| `cat -n file` | Display with line numbers |
| `less file` | Interactive pager (scroll both ways) |
| `more file` | Simple pager (forward only) |
| `head file` | First 10 lines |
| `head -n 20 file` | First 20 lines |
| `tail file` | Last 10 lines |
| `tail -n 20 file` | Last 20 lines |
| `tail -f file` | Follow file in real-time |
| `wc file` | Count lines, words, bytes |
| `wc -l file` | Count lines only |
| `file file` | Determine file type |
| `stat file` | Detailed file metadata |

---

## Summary

In this lesson, you learned:

- `cat` displays file contents (best for small files)
- `less` is an interactive pager with search and navigation
- `more` is a simpler, forward-only pager
- `head` shows the beginning of a file
- `tail` shows the end of a file
- `tail -f` follows a file in real-time (essential for logs)
- `wc` counts lines, words, and characters
- `file` identifies file types by content
- `stat` shows detailed file metadata and timestamps
- Combine these tools with pipes for powerful analysis

---
