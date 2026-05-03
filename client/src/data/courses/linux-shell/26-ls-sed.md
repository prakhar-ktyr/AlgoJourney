---
title: sed — Stream Editor
---

# sed — Stream Editor

`sed` (Stream Editor) is a powerful non-interactive text editor that processes text line by line. It reads input, applies editing commands, and writes the result to standard output — all without opening a file in an editor.

---

## Why Use sed?

- Edit files without opening them
- Automate repetitive text changes
- Process text in pipelines
- Modify configuration files in scripts
- Perform batch find-and-replace operations

---

## Basic Syntax

```bash
sed 'command' filename
```

`sed` reads the file line by line, applies the command to each line, and prints the result:

```bash
# Print file contents (like cat)
sed '' myfile.txt

# Apply a substitution
sed 's/hello/world/' myfile.txt
```

> **Note:** By default, `sed` does NOT modify the original file. It prints the modified output to stdout.

---

## Substitution — Find and Replace

The most common `sed` command is `s` (substitute):

```bash
sed 's/old/new/' filename
```

This replaces the **first occurrence** of "old" with "new" on each line.

### Example

```bash
# Create a sample file
echo "hello world hello" > sample.txt
echo "hello again" >> sample.txt

# Replace first "hello" on each line
sed 's/hello/hi/' sample.txt
```

**Output:**
```
hi world hello
hi again
```

Notice: only the **first** "hello" on line 1 was replaced.

---

## Global Substitution

Add the `g` flag to replace **all occurrences** on each line:

```bash
sed 's/old/new/g' filename
```

### Example

```bash
echo "apple banana apple banana apple" | sed 's/apple/orange/g'
```

**Output:**
```
orange banana orange banana orange
```

---

## Replace Nth Occurrence

Replace only the 2nd occurrence on each line:

```bash
sed 's/old/new/2' filename
```

### Example

```bash
echo "cat dog cat dog cat" | sed 's/cat/bird/2'
```

**Output:**
```
cat dog bird dog cat
```

---

## Case-Insensitive Substitution

Use the `i` flag (GNU sed) for case-insensitive matching:

```bash
sed 's/hello/world/gi' filename
```

### Example

```bash
echo "Hello HELLO hello" | sed 's/hello/hi/gi'
```

**Output:**
```
hi hi hi
```

---

## In-Place Editing

Use `-i` to modify the file directly:

```bash
# Edit file in place (GNU sed)
sed -i 's/old/new/g' filename

# macOS sed requires a backup extension
sed -i '' 's/old/new/g' filename

# Create a backup before editing
sed -i.bak 's/old/new/g' filename
```

### Example

```bash
echo "color=red" > config.txt

# Change the value in place
sed -i '' 's/color=red/color=blue/' config.txt

cat config.txt
```

**Output:**
```
color=blue
```

---

## Deleting Lines

Use the `d` command to delete lines:

```bash
# Delete all lines
sed 'd' filename

# Delete line 3
sed '3d' filename

# Delete lines 2 through 5
sed '2,5d' filename

# Delete the last line
sed '$d' filename

# Delete lines matching a pattern
sed '/pattern/d' filename

# Delete blank lines
sed '/^$/d' filename
```

### Example

```bash
cat > fruits.txt << 'EOF'
apple
banana
cherry
date
elderberry
EOF

# Delete line 2
sed '2d' fruits.txt
```

**Output:**
```
apple
cherry
date
elderberry
```

```bash
# Delete lines containing 'an'
sed '/an/d' fruits.txt
```

**Output:**
```
apple
cherry
date
elderberry
```

---

## Printing Specific Lines

Use `-n` (suppress default output) with `p` (print):

```bash
# Print only line 5
sed -n '5p' filename

# Print lines 5 through 10
sed -n '5,10p' filename

# Print the first line
sed -n '1p' filename

# Print the last line
sed -n '$p' filename

# Print lines matching a pattern
sed -n '/error/p' filename
```

### Example

```bash
# Print lines 2 to 4
sed -n '2,4p' fruits.txt
```

**Output:**
```
banana
cherry
date
```

---

## Insert and Append Text

### Insert Before a Line (`i\`)

```bash
# Insert before line 3
sed '3i\This is inserted' filename

# Insert before lines matching a pattern
sed '/cherry/i\--- FRUIT ---' fruits.txt
```

### Append After a Line (`a\`)

```bash
# Append after line 2
sed '2a\This is appended' filename

# Append after the last line
sed '$a\THE END' filename
```

### Example

```bash
sed '1i\=== FRUIT LIST ===' fruits.txt
```

**Output:**
```
=== FRUIT LIST ===
apple
banana
cherry
date
elderberry
```

---

## Address Ranges

Apply commands only to specific line ranges:

```bash
# Substitute only on lines 2-4
sed '2,4s/a/A/g' filename

# Substitute from line 3 to end
sed '3,$s/old/new/g' filename

# Substitute on lines matching a pattern
sed '/start/,/end/s/old/new/g' filename
```

### Example

```bash
sed '2,4s/e/E/g' fruits.txt
```

**Output:**
```
apple
banana
chErry
datE
elderberry
```

Only lines 2–4 were affected.

---

## Multiple Commands

### Using `-e` Flag

```bash
sed -e 's/apple/APPLE/' -e 's/banana/BANANA/' fruits.txt
```

### Using Semicolons

```bash
sed 's/apple/APPLE/; s/banana/BANANA/' fruits.txt
```

### Using a Script File

```bash
cat > commands.sed << 'EOF'
s/apple/APPLE/
s/banana/BANANA/
s/cherry/CHERRY/
EOF

sed -f commands.sed fruits.txt
```

---

## Using Different Delimiters

When your text contains `/`, use a different delimiter:

```bash
# Replace a file path (use | as delimiter)
sed 's|/usr/local/bin|/opt/bin|g' config.txt

# Use # as delimiter
sed 's#http://#https://#g' urls.txt
```

---

## Capturing Groups

Use `\(` and `\)` to capture, then `\1`, `\2` to reference:

```bash
# Swap first two words
echo "hello world" | sed 's/\([a-z]*\) \([a-z]*\)/\2 \1/'
```

**Output:**
```
world hello
```

```bash
# Add quotes around words
echo "name=value" | sed 's/\(.*\)=\(.*\)/\1="\2"/'
```

**Output:**
```
name="value"
```

---

## Real-World Examples

### Edit Configuration Files

```bash
# Change a port number in a config
sed -i '' 's/port=8080/port=9090/' app.conf

# Enable a commented setting
sed -i '' 's/^#MaxRetries/MaxRetries/' app.conf

# Comment out a line
sed -i '' 's/^DebugMode=true/#DebugMode=true/' app.conf
```

### Process Log Files

```bash
# Remove timestamps from logs
sed 's/^[0-9-]* [0-9:]* //' app.log

# Extract only ERROR lines
sed -n '/ERROR/p' app.log

# Remove ANSI color codes
sed 's/\x1b\[[0-9;]*m//g' colored_output.txt
```

### Batch Rename Content

```bash
# Update copyright year in all files
for file in *.html; do
  sed -i '' 's/2024/2025/g' "$file"
done

# Replace a function name across source files
find . -name "*.js" -exec sed -i '' 's/oldFunc/newFunc/g' {} \;
```

### Add/Remove Lines

```bash
# Add a header to a CSV file
sed -i '' '1i\name,age,city' data.csv

# Remove the first line (header)
sed -i '' '1d' data.csv

# Add a blank line after every line
sed 'G' filename
```

---

## Useful sed One-Liners

```bash
# Double-space a file
sed 'G' file

# Number each line
sed = file | sed 'N;s/\n/\t/'

# Remove leading whitespace
sed 's/^[ \t]*//' file

# Remove trailing whitespace
sed 's/[ \t]*$//' file

# Remove both leading and trailing whitespace
sed 's/^[ \t]*//;s/[ \t]*$//' file

# Convert DOS line endings to Unix
sed 's/\r$//' file

# Print lines between two patterns
sed -n '/START/,/END/p' file

# Replace only if line matches another pattern
sed '/pattern/s/old/new/g' file
```

---

## Practice Exercises

**Exercise 1:** Replace all occurrences of "Linux" with "GNU/Linux" in a file.

```bash
sed 's/Linux/GNU\/Linux/g' article.txt
# Or with different delimiter:
sed 's|Linux|GNU/Linux|g' article.txt
```

**Exercise 2:** Delete all blank lines from a file.

```bash
sed '/^$/d' file.txt
```

**Exercise 3:** Print only lines 10-20 of a file.

```bash
sed -n '10,20p' file.txt
```

**Exercise 4:** Add line numbers to a file.

```bash
sed = file.txt | sed 'N;s/\n/: /'
```

**Exercise 5:** Replace the 3rd line of a file with custom text.

```bash
sed '3s/.*/This is the new line 3/' file.txt
```

---

## Summary

| Command | Description |
|---------|-------------|
| `sed 's/old/new/'` | Replace first occurrence |
| `sed 's/old/new/g'` | Replace all occurrences |
| `sed -i 's/old/new/g'` | Edit file in place |
| `sed '3d'` | Delete line 3 |
| `sed -n '5p'` | Print only line 5 |
| `sed '/pattern/d'` | Delete matching lines |
| `sed '2,5s/a/b/g'` | Substitute in range |
| `sed -e 'cmd1' -e 'cmd2'` | Multiple commands |

`sed` is indispensable for automated text processing. Master it and you'll handle config edits, log parsing, and batch transformations with ease!
