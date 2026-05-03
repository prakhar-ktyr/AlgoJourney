---
title: Text Utilities — cut, sort, uniq, tr & wc
---

# Text Utilities — cut, sort, uniq, tr & wc

Linux provides a rich set of small, focused text-processing utilities. Each tool does one thing well, and when combined with pipes, they form powerful data-processing pipelines.

---

## cut — Extract Columns

`cut` extracts sections from each line of input.

### Cut by Delimiter and Field

```bash
cut -d 'delimiter' -f field_numbers filename
```

### Examples

```bash
# Extract usernames from /etc/passwd (field 1, colon-separated)
cut -d: -f1 /etc/passwd

# Extract username and shell (fields 1 and 7)
cut -d: -f1,7 /etc/passwd

# Extract fields 1 through 3
cut -d: -f1-3 /etc/passwd

# CSV: extract second column
cut -d, -f2 data.csv
```

### Cut by Character Position

```bash
# First 10 characters of each line
cut -c1-10 filename

# Characters 5 through 15
cut -c5-15 filename

# From character 20 to end of line
cut -c20- filename

# Only the first character
cut -c1 filename
```

### Example

```bash
cat > people.csv << 'EOF'
Name,Age,City
Alice,30,New York
Bob,25,London
Charlie,35,Paris
Diana,28,Tokyo
EOF

# Extract names
cut -d, -f1 people.csv
```

**Output:**
```
Name
Alice
Bob
Charlie
Diana
```

```bash
# Extract age and city
cut -d, -f2,3 people.csv
```

**Output:**
```
Age,City
30,New York
25,London
35,Paris
28,Tokyo
```

---

## sort — Sort Lines

`sort` arranges lines in alphabetical, numeric, or custom order.

### Basic Sorting

```bash
# Alphabetical sort (default)
sort filename

# Reverse sort
sort -r filename

# Numeric sort
sort -n filename

# Reverse numeric sort
sort -rn filename
```

### Example

```bash
cat > numbers.txt << 'EOF'
42
7
100
3
25
EOF

# Alphabetical sort (wrong for numbers!)
sort numbers.txt
# Output: 100, 25, 3, 42, 7

# Numeric sort (correct)
sort -n numbers.txt
# Output: 3, 7, 25, 42, 100
```

### Sort by Specific Field

```bash
# Sort by 2nd field
sort -k2 filename

# Sort by 3rd field numerically
sort -k3 -n filename

# Sort by 2nd field, then by 3rd field
sort -k2,2 -k3,3n filename
```

### Example

```bash
cat > scores.txt << 'EOF'
Alice 95
Bob 87
Charlie 95
Diana 92
Eve 87
EOF

# Sort by score (2nd field), numerically, reversed
sort -k2 -rn scores.txt
# Output: Alice 95, Charlie 95, Diana 92, Bob 87, Eve 87
```

### Sort with Custom Delimiter

```bash
# Sort /etc/passwd by UID (field 3, colon-separated)
sort -t: -k3 -n /etc/passwd
```

### Remove Duplicates While Sorting

```bash
# Sort and remove duplicate lines
sort -u filename
```

### Other Useful Options

```bash
# Case-insensitive sort
sort -f filename

# Check if file is already sorted
sort -c filename

# Human-numeric sort (1K, 2M, 3G)
sort -h filename
```

---

## uniq — Remove Duplicates

`uniq` removes **adjacent** duplicate lines. This means you usually need to `sort` first!

```bash
# Remove adjacent duplicates
uniq filename

# Proper deduplication (sort first!)
sort filename | uniq
```

### Example

```bash
cat > colors.txt << 'EOF'
red
blue
red
green
blue
blue
red
EOF

# sort + uniq (removes ALL duplicates)
sort colors.txt | uniq
```

**Output:**
```
blue
green
red
```

### Count Occurrences

```bash
sort colors.txt | uniq -c
```

**Output:**
```
   2 blue
   1 green
   3 red
```

### Other Options

```bash
# Show only duplicated lines
sort colors.txt | uniq -d

# Show only unique lines (appear once)
sort colors.txt | uniq -u

# Ignore case
sort colors.txt | uniq -i
```

---

## tr — Translate/Delete Characters

`tr` translates, squeezes, or deletes characters. It reads from stdin only (no filename argument).

### Translate Characters

```bash
# Convert lowercase to uppercase
echo "hello world" | tr 'a-z' 'A-Z'
# Output: HELLO WORLD

# Convert uppercase to lowercase
echo "HELLO WORLD" | tr 'A-Z' 'a-z'
# Output: hello world

# Replace spaces with underscores
echo "hello world" | tr ' ' '_'
# Output: hello_world
```

### Delete Characters

```bash
# Remove all digits
echo "abc123def456" | tr -d '0-9'
# Output: abcdef

# Remove all whitespace
echo "h e l l o" | tr -d ' '
# Output: hello

# Remove punctuation
echo "Hello, World!" | tr -d '[:punct:]'
# Output: Hello World
```

### Squeeze Repeats

```bash
# Squeeze multiple spaces into one
echo "hello     world" | tr -s ' '
# Output: hello world

# Squeeze multiple newlines into one
cat file_with_blank_lines.txt | tr -s '\n'
```

### Character Classes

| Class | Matches |
|-------|---------|
| `[:alpha:]` | Letters |
| `[:digit:]` | Digits |
| `[:alnum:]` | Letters + digits |
| `[:space:]` | Whitespace |
| `[:upper:]` | Uppercase |
| `[:lower:]` | Lowercase |
| `[:punct:]` | Punctuation |

### Complement (`-c`)

```bash
# Delete everything except digits
echo "Phone: 555-1234" | tr -cd '0-9'
# Output: 5551234
```

---

## wc — Word Count

`wc` counts lines, words, and characters:

```bash
# All three counts: lines, words, characters
wc filename

# Lines only
wc -l filename

# Words only
wc -w filename

# Characters only
wc -c filename

# Bytes (same as -c for ASCII)
wc -m filename
```

### Example

```bash
wc people.csv
```

**Output:**
```
       5      5     72 people.csv
```

(5 lines, 5 words, 72 characters)

```bash
# Count files in a directory
ls | wc -l

# Count lines of code
find . -name "*.js" | xargs wc -l

# Count words in multiple files
wc -w *.txt
```

---

## tee — Write to File AND Stdout

`tee` splits output: it writes to a file while also passing data through:

```bash
# Save output to file AND display it
ls -l | tee listing.txt

# Append instead of overwrite
ls -l | tee -a listing.txt

# Write to multiple files
echo "hello" | tee file1.txt file2.txt file3.txt
```

### Example — Log a Pipeline

```bash
# Process data and save intermediate results
cat data.txt | sort | tee sorted.txt | uniq -c | tee counted.txt | sort -rn > final.txt
```

This saves the sorted data to `sorted.txt`, the counted data to `counted.txt`, and the final result to `final.txt`.

---

## paste — Merge Files Line by Line

`paste` joins corresponding lines from multiple files:

```bash
# Merge side by side (tab-separated by default)
paste names.txt ages.txt

# Custom delimiter
paste -d, names.txt ages.txt

# Merge all lines into one (serial)
paste -s -d, names.txt
```

### Example

```bash
cat > names.txt << 'EOF'
Alice
Bob
Charlie
EOF

cat > ages.txt << 'EOF'
30
25
35
EOF

paste -d, names.txt ages.txt
```

**Output:**
```
Alice,30
Bob,25
Charlie,35
```

---

## diff — Compare Files

`diff` shows differences between two files:

```bash
# Normal diff
diff file1.txt file2.txt

# Unified format (easier to read)
diff -u file1.txt file2.txt

# Side-by-side comparison
diff -y file1.txt file2.txt

# Brief (just say if files differ)
diff -q file1.txt file2.txt

# Recursive directory comparison
diff -r dir1/ dir2/

# Ignore whitespace
diff -w file1.txt file2.txt
```

---

## Combining Tools with Pipes

The real power comes from combining these tools:

### Example 1 — Top 5 Most Common Words

```bash
cat article.txt | tr 'A-Z' 'a-z' | tr -cs '[:alpha:]' '\n' | sort | uniq -c | sort -rn | head -5
```

### Example 2 — Unique IP Addresses from a Log

```bash
cut -d' ' -f1 access.log | sort -u | wc -l
```

### Example 3 — Find Users with Bash Shell

```bash
grep "/bin/bash" /etc/passwd | cut -d: -f1 | sort
```

---

## Practice Exercises

**Exercise 1:** Extract and sort unique cities from people.csv.

```bash
tail -n +2 people.csv | cut -d, -f3 | sort -u
```

**Exercise 2:** Count the number of unique words in a file.

```bash
tr -cs '[:alpha:]' '\n' < article.txt | sort -u | wc -l
```

**Exercise 3:** Find the 3 longest lines in a file.

```bash
awk '{print length, $0}' filename | sort -rn | head -3 | cut -d' ' -f2-
```

**Exercise 4:** Merge two files with a comma delimiter and add a header.

```bash
echo "Name,Age" > combined.csv
paste -d, names.txt ages.txt >> combined.csv
```

**Exercise 5:** Find which words appear exactly once in a file.

```bash
tr -cs '[:alpha:]' '\n' < article.txt | sort | uniq -c | awk '$1 == 1 {print $2}'
```

---

## Quick Reference

| Tool | Purpose | Key Flags |
|------|---------|-----------|
| `cut` | Extract columns | `-d` delimiter, `-f` fields, `-c` chars |
| `sort` | Sort lines | `-n` numeric, `-r` reverse, `-k` key, `-u` unique |
| `uniq` | Deduplicate | `-c` count, `-d` duplicates, `-u` unique only |
| `tr` | Translate chars | `-d` delete, `-s` squeeze, `-c` complement |
| `wc` | Count | `-l` lines, `-w` words, `-c` chars |
| `tee` | Split output | `-a` append |
| `paste` | Merge files | `-d` delimiter, `-s` serial |
| `diff` | Compare files | `-u` unified, `-y` side-by-side, `-r` recursive |

These utilities are the building blocks of shell data processing. Learn them individually, then combine them in pipelines for powerful text transformations!
