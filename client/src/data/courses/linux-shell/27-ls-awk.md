---
title: awk — Text Processing
---

# awk — Text Processing

`awk` is a powerful pattern-action programming language designed for processing structured text data. It excels at extracting and transforming columnar data — think of it as a mini programming language for text files.

---

## Why Use awk?

- Extract specific columns from data
- Perform calculations on text files
- Filter rows based on conditions
- Format and transform output
- Process CSVs, logs, and system files

---

## Basic Syntax

```bash
awk 'pattern {action}' filename
```

- **pattern** — when to act (optional; if omitted, acts on every line)
- **action** — what to do (enclosed in `{}`)

```bash
# Print every line (like cat)
awk '{print}' filename

# Print every line with explicit $0
awk '{print $0}' filename
```

---

## Fields — Splitting Lines into Columns

`awk` automatically splits each line into fields by whitespace:

| Variable | Meaning |
|----------|---------|
| `$0` | The entire line |
| `$1` | First field |
| `$2` | Second field |
| `$NF` | Last field |
| `$(NF-1)` | Second-to-last field |

### Example

```bash
echo "John 25 Engineer" | awk '{print $1}'
```

**Output:**
```
John
```

```bash
echo "John 25 Engineer" | awk '{print $1, $3}'
```

**Output:**
```
John Engineer
```

---

## Specifying the Field Separator

Use `-F` to set a custom delimiter:

```bash
# Colon-separated (like /etc/passwd)
awk -F: '{print $1}' /etc/passwd

# Comma-separated (CSV)
awk -F, '{print $1, $3}' data.csv

# Tab-separated
awk -F'\t' '{print $2}' data.tsv

# Multiple delimiters
awk -F'[,;:]' '{print $1}' mixed.txt
```

### Example — Extract Usernames

```bash
# Print all usernames from /etc/passwd
awk -F: '{print $1}' /etc/passwd
```

**Output:**
```
root
daemon
bin
sys
...
```

---

## Print Multiple Fields

```bash
# Print fields with custom separator
awk '{print $1, $2}' file.txt         # Space between
awk '{print $1 "\t" $2}' file.txt     # Tab between
awk '{print $1 ":" $2}' file.txt      # Colon between
```

### Example

```bash
cat > employees.txt << 'EOF'
John Sales 50000
Jane Engineering 75000
Bob Marketing 45000
Alice Engineering 80000
Eve Sales 55000
EOF

# Print name and salary
awk '{print $1, $3}' employees.txt
```

**Output:**
```
John 50000
Jane 75000
Bob 45000
Alice 80000
Eve 55000
```

---

## Pattern Matching

Process only lines that match a pattern:

```bash
# Lines containing "Engineering"
awk '/Engineering/ {print $1}' employees.txt

# Lines NOT containing "Sales"
awk '!/Sales/ {print}' employees.txt

# Lines where field 3 is greater than 50000
awk '$3 > 50000 {print $1, $3}' employees.txt
```

### Example

```bash
awk '$3 > 50000 {print $1, "earns", $3}' employees.txt
```

**Output:**
```
Jane earns 75000
Alice earns 80000
Eve earns 55000
```

---

## Built-in Variables

| Variable | Description |
|----------|-------------|
| `NR` | Current record (line) number |
| `NF` | Number of fields in current line |
| `FS` | Input field separator |
| `OFS` | Output field separator |
| `RS` | Input record separator |
| `ORS` | Output record separator |
| `FILENAME` | Name of current file |

### Examples

```bash
# Print line numbers
awk '{print NR, $0}' employees.txt

# Print number of fields per line
awk '{print NR, "has", NF, "fields"}' employees.txt

# Print only lines with exactly 3 fields
awk 'NF == 3 {print}' data.txt

# Print the last field of each line
awk '{print $NF}' employees.txt
```

**Line numbers example output:**
```
1 John Sales 50000
2 Jane Engineering 75000
3 Bob Marketing 45000
4 Alice Engineering 80000
5 Eve Sales 55000
```

---

## BEGIN and END Blocks

- `BEGIN` — runs once before processing any input
- `END` — runs once after all input is processed

```bash
awk 'BEGIN {print "=== Report ==="} {print $1} END {print "=== Done ==="}' employees.txt
```

**Output:**
```
=== Report ===
John
Jane
Bob
Alice
Eve
=== Done ===
```

### Setting Variables in BEGIN

```bash
awk 'BEGIN {FS=":"; OFS=" -> "} {print $1, $7}' /etc/passwd
```

---

## Conditional Statements

```bash
# if-else
awk '{if ($3 > 60000) print $1, "Senior"; else print $1, "Junior"}' employees.txt

# Ternary operator
awk '{level = ($3 > 60000) ? "Senior" : "Junior"; print $1, level}' employees.txt
```

**Output:**
```
John Junior
Jane Senior
Bob Junior
Alice Senior
Eve Junior
```

---

## Math Operations

### Sum a Column

```bash
awk '{sum += $3} END {print "Total:", sum}' employees.txt
```

**Output:**
```
Total: 305000
```

### Average

```bash
awk '{sum += $3; count++} END {print "Average:", sum/count}' employees.txt
```

**Output:**
```
Average: 61000
```

### Min and Max

```bash
awk 'BEGIN {max=0} {if ($3 > max) max=$3} END {print "Max salary:", max}' employees.txt
```

**Output:**
```
Max salary: 80000
```

```bash
awk 'NR==1 {min=$3} {if ($3 < min) min=$3} END {print "Min salary:", min}' employees.txt
```

**Output:**
```
Min salary: 45000
```

---

## printf — Formatted Output

`printf` gives you control over output formatting:

```bash
# Fixed-width columns
awk '{printf "%-10s %-15s %8d\n", $1, $2, $3}' employees.txt
```

**Output:**
```
John       Sales              50000
Jane       Engineering        75000
Bob        Marketing          45000
Alice      Engineering        80000
Eve        Sales              55000
```

### Format Specifiers

| Specifier | Description |
|-----------|-------------|
| `%s` | String |
| `%d` | Integer |
| `%f` | Float |
| `%-10s` | Left-aligned, 10 chars wide |
| `%8d` | Right-aligned, 8 chars wide |
| `%.2f` | Float with 2 decimals |

---

## String Functions

```bash
# Length of a field
awk '{print $1, length($1)}' employees.txt

# Convert to uppercase
awk '{print toupper($1)}' employees.txt

# Convert to lowercase
awk '{print tolower($2)}' employees.txt

# Substring: substr(string, start, length)
awk '{print substr($1, 1, 3)}' employees.txt

# Find position: index(string, target)
awk '{print index($0, "Engineering")}' employees.txt

# Split string into array
echo "a:b:c" | awk '{split($0, arr, ":"); print arr[2]}'
```

---

## Arrays

`awk` supports associative arrays (like dictionaries):

```bash
# Count employees per department
awk '{dept[$2]++} END {for (d in dept) print d, dept[d]}' employees.txt
```

**Output:**
```
Sales 2
Engineering 2
Marketing 1
```

### Sum by Category

```bash
# Total salary per department
awk '{sum[$2] += $3} END {for (d in sum) print d, sum[d]}' employees.txt
```

**Output:**
```
Sales 105000
Engineering 155000
Marketing 45000
```

---

## Processing /etc/passwd

```bash
# List all users and their shells
awk -F: '{print $1, $7}' /etc/passwd

# Users with /bin/bash shell
awk -F: '$7 == "/bin/bash" {print $1}' /etc/passwd

# Count users per shell
awk -F: '{shells[$7]++} END {for (s in shells) print s, shells[s]}' /etc/passwd
```

---

## Processing CSV Files

```bash
cat > sales.csv << 'EOF'
Product,Quantity,Price
Widget,100,9.99
Gadget,50,24.99
Doohickey,200,4.99
Thingamajig,75,14.99
EOF

# Skip header and calculate total revenue
awk -F, 'NR > 1 {total += $2 * $3} END {printf "Total Revenue: $%.2f\n", total}' sales.csv
```

**Output:**
```
Total Revenue: $4622.00
```

```bash
# Find product with highest quantity
awk -F, 'NR > 1 {if ($2 > max) {max=$2; product=$1}} END {print product, max}' sales.csv
```

**Output:**
```
Doohickey 200
```

---

## Practice Exercises

**Exercise 1:** Print the 3rd field of every line in a colon-separated file.

```bash
awk -F: '{print $3}' /etc/passwd
```

**Exercise 2:** Calculate the total of all numbers in a column.

```bash
awk '{sum += $3} END {print sum}' employees.txt
```

**Exercise 3:** Print lines where field 2 is "Engineering".

```bash
awk '$2 == "Engineering" {print}' employees.txt
```

**Exercise 4:** Count the number of non-empty lines in a file.

```bash
awk 'NF > 0 {count++} END {print count}' filename
```

**Exercise 5:** Print a file with line numbers and field count.

```bash
awk '{printf "%3d [%d fields]: %s\n", NR, NF, $0}' employees.txt
```

---

## Summary

| Feature | Syntax |
|---------|--------|
| Print field | `awk '{print $1}'` |
| Set delimiter | `awk -F: '{print $1}'` |
| Pattern match | `awk '/pattern/ {action}'` |
| Condition | `awk '$3 > 100 {print}'` |
| Line number | `NR` |
| Field count | `NF` |
| Sum column | `{sum += $1} END {print sum}` |
| Count by group | `{arr[$1]++} END {for (k in arr) print k, arr[k]}` |

`awk` is your go-to tool for structured text processing. Combined with pipes, it handles everything from quick field extraction to full data reports!
