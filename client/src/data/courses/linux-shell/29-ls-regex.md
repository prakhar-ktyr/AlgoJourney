---
title: Regular Expressions
---

# Regular Expressions

Regular expressions (regex) are patterns used to match text. They are one of the most powerful tools in a programmer's toolkit — used in `grep`, `sed`, `awk`, and virtually every programming language.

---

## What Are Regular Expressions?

A regular expression is a sequence of characters that defines a search pattern. Instead of searching for an exact string like "hello", you can search for patterns like "any word starting with h and ending with o".

### Where Regex Is Used

- `grep` — search files for patterns
- `sed` — find and replace with patterns
- `awk` — pattern matching and processing
- Programming languages (Python, JavaScript, Java, etc.)
- Text editors (VS Code, Vim, etc.)
- Database queries

---

## Literal Characters

The simplest regex is just literal text:

```bash
# Match the exact string "hello"
grep "hello" file.txt

# Match "error"
grep "error" logfile.txt
```

Special characters that need escaping: `. * + ? [ ] ( ) { } ^ $ | \`

---

## The Dot (.) — Any Character

The `.` matches **any single character** (except newline):

```bash
# Match "cat", "cut", "cot", "c4t", etc.
grep "c.t" file.txt

# Match any 3-character string starting with 'a'
grep "a.." file.txt
```

### Example

```bash
echo -e "cat\ncut\ncot\ncart\ncoot" | grep "c.t"
```

**Output:**
```
cat
cut
cot
```

(`cart` doesn't match — too many characters; `coot` doesn't match — two characters between c and t)

---

## Anchors — Start and End of Line

| Symbol | Meaning |
|--------|---------|
| `^` | Start of line |
| `$` | End of line |

```bash
# Lines starting with "Error"
grep "^Error" logfile.txt

# Lines ending with ".js"
grep "\.js$" filelist.txt

# Blank lines (start immediately followed by end)
grep "^$" file.txt

# Lines that are exactly "hello"
grep "^hello$" file.txt
```

### Example

```bash
cat > lines.txt << 'EOF'
hello world
say hello
hello
world hello world
EOF

grep "^hello" lines.txt
```

**Output:**
```
hello world
hello
```

```bash
grep "hello$" lines.txt
```

**Output:**
```
say hello
hello
```

---

## Character Classes — [...]

Match **one character** from a set:

```bash
# Match 'a', 'b', or 'c'
grep "[abc]" file.txt

# Match any vowel
grep "[aeiou]" file.txt

# Match any digit
grep "[0-9]" file.txt

# Match any lowercase letter
grep "[a-z]" file.txt

# Match any uppercase letter
grep "[A-Z]" file.txt

# Match letter or digit
grep "[a-zA-Z0-9]" file.txt
```

### Negation — [^...]

Match any character **NOT** in the set:

```bash
# Match any non-digit character
grep "[^0-9]" file.txt

# Match lines with non-lowercase characters
grep "[^a-z]" file.txt
```

### Example

```bash
# Match "color" or "colour"
grep "colou[r]" file.txt

# Match any file with a single-digit extension
grep "\.[0-9]$" filelist.txt
```

---

## Repetition — How Many Times

### Basic Regex (BRE) — Used by `grep` and `sed`

| Pattern | Meaning |
|---------|---------|
| `*` | Zero or more of the previous |
| `\+` | One or more (BRE) |
| `\?` | Zero or one (BRE) |
| `\{n\}` | Exactly n times (BRE) |
| `\{n,m\}` | Between n and m times (BRE) |

### Extended Regex (ERE) — Used by `grep -E` and `awk`

| Pattern | Meaning |
|---------|---------|
| `*` | Zero or more |
| `+` | One or more |
| `?` | Zero or one |
| `{n}` | Exactly n times |
| `{n,m}` | Between n and m times |
| `{n,}` | n or more times |

```bash
# Zero or more 'a' characters
grep "ba*" file.txt          # matches "b", "ba", "baa", "baaa"...

# One or more digits (ERE)
grep -E "[0-9]+" file.txt

# Optional 'u' (match "color" or "colour")
grep -E "colou?r" file.txt

# Exactly 3 digits
grep -E "[0-9]{3}" file.txt

# Between 2 and 4 letters
grep -E "[a-z]{2,4}" file.txt
```

### Example

```bash
# Match phone numbers like 555-1234
grep -E "[0-9]{3}-[0-9]{4}" contacts.txt

# Match words with at least 5 characters
grep -E "[a-zA-Z]{5,}" file.txt
```

---

## Alternation — OR

Use `|` in extended regex to match one pattern OR another:

```bash
# Match "cat" or "dog"
grep -E "cat|dog" file.txt

# Match "error" or "warning" or "critical"
grep -E "error|warning|critical" logfile.txt

# Match "gray" or "grey"
grep -E "gr(a|e)y" file.txt
```

---

## Grouping — (...)

Parentheses group parts of a pattern:

```bash
# Match "goodbye" or "goodnight"
grep -E "good(bye|night)" file.txt

# Match repeated patterns: "abab"
grep -E "(ab){2}" file.txt

# Match "ha", "haha", "hahaha"...
grep -E "(ha)+" file.txt
```

---

## POSIX Character Classes

These work inside `[...]` brackets:

| Class | Matches | Equivalent |
|-------|---------|------------|
| `[:alpha:]` | Letters | `[a-zA-Z]` |
| `[:digit:]` | Digits | `[0-9]` |
| `[:alnum:]` | Letters + digits | `[a-zA-Z0-9]` |
| `[:space:]` | Whitespace | `[ \t\n\r\f\v]` |
| `[:upper:]` | Uppercase | `[A-Z]` |
| `[:lower:]` | Lowercase | `[a-z]` |
| `[:punct:]` | Punctuation | |
| `[:blank:]` | Space and tab | |

```bash
# Match any digit (POSIX style)
grep "[[:digit:]]" file.txt

# Match any letter
grep "[[:alpha:]]" file.txt

# Match non-space characters
grep "[^[:space:]]" file.txt
```

> **Note:** Double brackets! `[[:digit:]]` not `[:digit:]`

---

## Word Boundaries

Match at the start or end of a word:

```bash
# Match whole word "cat" (not "catalog" or "bobcat")
grep "\bcat\b" file.txt

# GNU grep shorthand
grep "\<cat\>" file.txt

# Using -w flag (whole word)
grep -w "cat" file.txt
```

### Example

```bash
echo -e "cat\ncatalog\nbobcat\nthe cat sat" | grep -w "cat"
```

**Output:**
```
cat
the cat sat
```

---

## Common Regex Patterns

```bash
# Email address (simplified)
grep -E "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" file.txt

# IP address (simplified)
grep -E "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}" file.txt

# URL
grep -E "https?://[a-zA-Z0-9./?=_%&+-]+" file.txt

# Date (YYYY-MM-DD)
grep -E "[0-9]{4}-[0-9]{2}-[0-9]{2}" file.txt

# Blank lines
grep -E "^[[:space:]]*$" file.txt
```

---

## Regex in grep

```bash
# Extended regex
grep -E "pattern" file.txt

# Case-insensitive
grep -i "pattern" file.txt

# Invert match (lines NOT matching)
grep -v "pattern" file.txt

# Count matches
grep -c "pattern" file.txt

# Show line numbers
grep -n "pattern" file.txt

# Only print the matching part
grep -o "pattern" file.txt

# Recursive search
grep -r "pattern" /path/to/dir/
```

---

## Regex in sed

```bash
# Replace digits with X
sed 's/[0-9]/X/g' file.txt

# Remove HTML tags
sed 's/<[^>]*>//g' page.html

# Remove trailing whitespace
sed 's/[[:space:]]*$//' file.txt
```

---

## Regex in awk

```bash
# Lines matching a pattern
awk '/^[0-9]/' file.txt

# Fields matching a pattern
awk '$1 ~ /^[A-Z]/' file.txt

# Fields NOT matching a pattern
awk '$2 !~ /error/' logfile.txt

# Match and extract
awk '/[0-9]{3}-[0-9]{4}/ {print $0}' contacts.txt
```

---

## Escaping Special Characters

When you need to match a literal special character, escape it with `\`:

```bash
# Match a literal dot
grep "\." file.txt

# Match a literal asterisk
grep "\*" file.txt

# Match a literal dollar sign
grep "\$" file.txt

# Match a literal backslash
grep "\\\\" file.txt

# Match square brackets
grep "\[" file.txt
```

---

## Backreferences

Match the same text again later in the pattern:

```bash
# Find repeated words ("the the", "is is")
grep -E "\b([a-z]+) \1\b" file.txt

# In sed: swap first and last name
echo "John Smith" | sed 's/\([a-zA-Z]*\) \([a-zA-Z]*\)/\2 \1/'
# Output: Smith John
```

---

## Greedy vs. Non-Greedy

By default, regex is **greedy** — it matches as much as possible:

```bash
# Greedy: matches everything between first < and LAST >
echo "<b>hello</b>" | grep -oP "<.*>"
# Output: <b>hello</b>

# Non-greedy (Perl regex -P): matches minimal
echo "<b>hello</b>" | grep -oP "<.*?>"
# Output: <b>
```

---

## Testing Regular Expressions

```bash
# Quick test with echo and grep
echo "test string 123" | grep -E "[0-9]+"

# Show what matched with color
grep --color=always -E "pattern" file.txt

# Print only the matching part
grep -oE "pattern" file.txt
```

### Online Tools

- **regex101.com** — interactive regex tester with explanations
- **regexr.com** — learn and test patterns

---

## Practice Exercises

**Exercise 1:** Find all lines starting with a capital letter.

```bash
grep "^[A-Z]" file.txt
```

**Exercise 2:** Find all lines containing a 3-digit number.

```bash
grep -E "\b[0-9]{3}\b" file.txt
```

**Exercise 3:** Find email addresses in a file.

```bash
grep -oE "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" file.txt
```

**Exercise 4:** Remove all HTML tags from a file.

```bash
sed 's/<[^>]*>//g' page.html
```

**Exercise 5:** Find lines with repeated consecutive words.

```bash
grep -E "\b([a-zA-Z]+) \1\b" document.txt
```

**Exercise 6:** Match lines that are valid IPv4 addresses.

```bash
grep -E "^([0-9]{1,3}\.){3}[0-9]{1,3}$" ips.txt
```

**Exercise 7:** Extract all URLs from a file.

```bash
grep -oE "https?://[^ \"'>]+" file.txt
```

---

## Regex Quick Reference

| Pattern | Matches |
|---------|---------|
| `.` | Any single character |
| `*` | Zero or more of previous |
| `+` | One or more of previous (ERE) |
| `?` | Zero or one of previous (ERE) |
| `^` | Start of line |
| `$` | End of line |
| `[abc]` | One of a, b, or c |
| `[^abc]` | Not a, b, or c |
| `[a-z]` | Range: a through z |
| `\b` | Word boundary |
| `(...)` | Group |
| `\|` | OR (alternation) |
| `{n}` | Exactly n times (ERE) |
| `{n,m}` | Between n and m times (ERE) |
| `\1` | Backreference to group 1 |

### POSIX Classes

| Class | Equivalent |
|-------|------------|
| `[[:alpha:]]` | `[a-zA-Z]` |
| `[[:digit:]]` | `[0-9]` |
| `[[:alnum:]]` | `[a-zA-Z0-9]` |
| `[[:space:]]` | Whitespace |
| `[[:upper:]]` | `[A-Z]` |
| `[[:lower:]]` | `[a-z]` |

Regular expressions take practice, but once mastered, they make text processing incredibly efficient. Start with simple patterns and gradually build up to complex ones!
