---
title: Regular Expressions for Data
---

# Regular Expressions for Data

A **regular expression** (regex) is a sequence of characters that defines a search pattern. It's an incredibly powerful tool for finding, extracting, and cleaning text data.

---

## Why Regex in Data Science?

Text data is messy. Regex helps you:

- Extract emails, phone numbers, URLs from text
- Validate data formats (dates, IDs, codes)
- Clean inconsistent data (remove special characters)
- Parse log files and structured text
- Find patterns in unstructured data

---

## Python's re Module

```python
import re

text = "Contact us at support@example.com or call 555-123-4567"

# re.search() — find first match
match = re.search(r"\d{3}-\d{3}-\d{4}", text)
if match:
    print(f"Found phone: {match.group()}")  # 555-123-4567

# re.findall() — find ALL matches
emails = re.findall(r"[\w.-]+@[\w.-]+\.\w+", text)
print(f"Emails: {emails}")  # ['support@example.com']

# re.sub() — replace matches
cleaned = re.sub(r"\d{3}-\d{3}-\d{4}", "[PHONE]", text)
print(cleaned)  # "Contact us at support@example.com or call [PHONE]"

# re.split() — split by pattern
parts = re.split(r"\s+", "hello   world   python")
print(parts)  # ['hello', 'world', 'python']

# re.match() — match from START only
result = re.match(r"Contact", text)
print(result.group())  # "Contact"
```

---

## Basic Patterns

### Literal Characters

```python
import re

text = "The cat sat on the mat"

# Literal match
matches = re.findall(r"at", text)
print(matches)  # ['at', 'at', 'at'] — found in cat, sat, mat
```

### Special Characters

| Pattern | Matches | Example |
|---------|---------|---------|
| `.` | Any character (except newline) | `c.t` → "cat", "cot" |
| `\d` | Any digit [0-9] | `\d\d` → "42" |
| `\D` | Any non-digit | `\D+` → "hello" |
| `\w` | Word character [a-zA-Z0-9_] | `\w+` → "hello_1" |
| `\W` | Non-word character | `\W` → "@", " " |
| `\s` | Whitespace (space, tab, newline) | `\s+` → "   " |
| `\S` | Non-whitespace | `\S+` → "word" |
| `\b` | Word boundary | `\bcat\b` → "cat" not "concatenate" |

```python
import re

text = "Order #123: 5 items at $49.99 each on 2024-01-15"

# \d — digits
numbers = re.findall(r"\d+", text)
print(numbers)  # ['123', '5', '49', '99', '2024', '01', '15']

# \w — word characters
words = re.findall(r"\w+", text)
print(words)  # ['Order', '123', '5', 'items', 'at', '49', '99', ...]

# \s — split by whitespace
parts = re.split(r"\s+", "hello   world")
print(parts)  # ['hello', 'world']

# \b — word boundaries
text2 = "cat concatenate category"
cats = re.findall(r"\bcat\b", text2)
print(cats)  # ['cat'] — only the standalone word
```

---

## Quantifiers

Quantifiers specify **how many** of the preceding pattern to match.

| Quantifier | Meaning | Example |
|------------|---------|---------|
| `*` | 0 or more | `ab*c` → "ac", "abc", "abbc" |
| `+` | 1 or more | `ab+c` → "abc", "abbc" (not "ac") |
| `?` | 0 or 1 | `colou?r` → "color", "colour" |
| `{n}` | Exactly n | `\d{4}` → "2024" |
| `{n,m}` | Between n and m | `\d{2,4}` → "12", "123", "1234" |
| `{n,}` | n or more | `\d{3,}` → "123", "1234", "12345" |

```python
import re

# * (zero or more)
print(re.findall(r"go*d", "gd god good goood"))
# ['gd', 'god', 'good', 'goood']

# + (one or more)
print(re.findall(r"go+d", "gd god good goood"))
# ['god', 'good', 'goood']

# ? (zero or one)
print(re.findall(r"colou?r", "color colour"))
# ['color', 'colour']

# {n} (exact count)
print(re.findall(r"\d{4}", "Call 555-1234 or 98765"))
# ['1234', '9876']

# {n,m} (range)
print(re.findall(r"\d{2,4}", "1 12 123 1234 12345"))
# ['12', '123', '1234', '1234']
```

---

## Anchors

Anchors match **positions**, not characters.

```python
import re

lines = ["hello world", "hello python", "say hello"]

# ^ — start of string
for line in lines:
    if re.search(r"^hello", line):
        print(f"Starts with hello: {line}")
# hello world, hello python

# $ — end of string
for line in lines:
    if re.search(r"hello$", line):
        print(f"Ends with hello: {line}")
# say hello

# Both anchors
print(re.match(r"^\d{5}$", "12345"))   # Match (exactly 5 digits)
print(re.match(r"^\d{5}$", "123456"))  # No match
```

---

## Character Classes

Define a **set** of characters to match:

```python
import re

# [abc] — match a, b, or c
print(re.findall(r"[aeiou]", "hello world"))
# ['e', 'o', 'o']

# [a-z] — range
print(re.findall(r"[A-Z]", "Hello World"))
# ['H', 'W']

# [0-9] same as \d
print(re.findall(r"[0-9]+", "abc123def456"))
# ['123', '456']

# [^abc] — NOT a, b, or c (negation)
print(re.findall(r"[^0-9]+", "abc123def456"))
# ['abc', 'def']

# Combine ranges
print(re.findall(r"[a-zA-Z0-9]+", "hello@world.com"))
# ['hello', 'world', 'com']
```

---

## Groups

Groups let you **capture** parts of a match:

```python
import re

# () — capture group
text = "2024-01-15"
match = re.search(r"(\d{4})-(\d{2})-(\d{2})", text)
if match:
    print(match.group(0))  # Full match: "2024-01-15"
    print(match.group(1))  # First group: "2024"
    print(match.group(2))  # Second group: "01"
    print(match.group(3))  # Third group: "15"

# Named groups (?P<name>...)
match = re.search(
    r"(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})",
    text
)
if match:
    print(match.group("year"))   # "2024"
    print(match.group("month"))  # "01"
```

```python
import re

# (?:...) — non-capturing group (don't save the match)
text = "http://example.com https://secure.com"
urls = re.findall(r"(?:http|https)://[\w.]+", text)
print(urls)  # ['http://example.com', 'https://secure.com']
```

---

## Alternation

The `|` operator means **OR**:

```python
import re

text = "I have a cat and a dog and a bird"

# Match cat OR dog
pets = re.findall(r"cat|dog", text)
print(pets)  # ['cat', 'dog']

# With groups
text2 = "Mr. Smith and Mrs. Jones and Dr. Brown"
titles = re.findall(r"(?:Mr|Mrs|Dr)\.\s\w+", text2)
print(titles)  # ['Mr. Smith', 'Mrs. Jones', 'Dr. Brown']
```

---

## Lookahead and Lookbehind (Brief)

Match based on what comes **before** or **after** without including it:

```python
import re

text = "price: $100 and $200 and 300 items"

# Lookahead (?=...) — followed by
# Find numbers followed by " items"
print(re.findall(r"\d+(?= items)", text))  # ['300']

# Lookbehind (?<=...) — preceded by
# Find numbers preceded by "$"
print(re.findall(r"(?<=\$)\d+", text))  # ['100', '200']
```

---

## Pandas + Regex

Pandas has built-in regex support through the `.str` accessor:

### str.contains() — Filter Rows

```python
import pandas as pd

df = pd.DataFrame({
    "email": [
        "john@gmail.com",
        "jane@yahoo.com",
        "bob@company.org",
        "invalid-email",
        "alice@gmail.com"
    ]
})

# Filter rows with Gmail addresses
gmail_users = df[df["email"].str.contains(r"@gmail\.com$", regex=True)]
print(gmail_users)
```

### str.extract() — Pull Out Data

```python
import pandas as pd

df = pd.DataFrame({
    "text": [
        "Order #1234 placed on 2024-01-15",
        "Order #5678 placed on 2024-02-20",
        "Order #9012 placed on 2024-03-10"
    ]
})

# Extract order numbers
df["order_id"] = df["text"].str.extract(r"#(\d+)")
print(df["order_id"])
# 0    1234
# 1    5678
# 2    9012

# Extract dates
df["date"] = df["text"].str.extract(r"(\d{4}-\d{2}-\d{2})")
print(df["date"])
```

### str.replace() — Clean Data

```python
import pandas as pd

df = pd.DataFrame({
    "phone": [
        "(555) 123-4567",
        "555.123.4567",
        "555-123-4567",
        "5551234567"
    ]
})

# Standardize phone numbers — remove all non-digits
df["clean_phone"] = df["phone"].str.replace(r"\D", "", regex=True)
print(df["clean_phone"])
# 0    5551234567
# 1    5551234567
# 2    5551234567
# 3    5551234567
```

### str.findall() — Multiple Matches

```python
import pandas as pd

df = pd.DataFrame({
    "text": [
        "Contact john@a.com or jane@b.com",
        "Email: bob@c.com",
        "No email here"
    ]
})

# Find all emails in each row
df["emails"] = df["text"].str.findall(r"[\w.-]+@[\w.-]+\.\w+")
print(df["emails"])
# 0    [john@a.com, jane@b.com]
# 1    [bob@c.com]
# 2    []
```

---

## Practical Patterns

### Common Regex Patterns Table

| Pattern | Regex | Matches |
|---------|-------|---------|
| Email | `r'[\w.-]+@[\w.-]+\.\w+'` | user@domain.com |
| Phone (US) | `r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'` | (555) 123-4567 |
| URL | `r'https?://[\w./\-?=&]+'` | https://example.com/page |
| Date (ISO) | `r'\d{4}-\d{2}-\d{2}'` | 2024-01-15 |
| Date (US) | `r'\d{1,2}/\d{1,2}/\d{2,4}'` | 1/15/2024 |
| Currency | `r'\$[\d,]+\.?\d*'` | $1,234.56 |
| IP Address | `r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'` | 192.168.1.1 |
| Zip Code | `r'\d{5}(-\d{4})?'` | 12345, 12345-6789 |

---

## Complete Example: Extract and Clean Data

```python
import re
import pandas as pd

# Sample messy data
data = [
    "John Smith | john.smith@gmail.com | (555) 123-4567 | $85,000",
    "Jane Doe | jane@yahoo.com | 555.987.6543 | $92,500",
    "Bob Wilson | bob_w@company.org | 555-456-7890 | $78,000",
    "Alice Brown | alice123@outlook.com | (555)111-2222 | $105,000"
]

# Parse each record
records = []
for line in data:
    name = re.search(r"^[\w\s]+", line).group().strip()
    email = re.search(r"[\w.-]+@[\w.-]+\.\w+", line).group()
    phone = re.search(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", line).group()
    salary = re.search(r"\$([\d,]+)", line).group(1)

    records.append({
        "name": name,
        "email": email,
        "phone": re.sub(r"\D", "", phone),  # Clean phone
        "salary": int(salary.replace(",", ""))
    })

df = pd.DataFrame(records)
print(df)
```

### Parse Log Files

```python
import re
import pandas as pd

# Sample server log
logs = """
2024-01-15 10:23:45 INFO User login: admin from 192.168.1.100
2024-01-15 10:24:12 ERROR Failed login: guest from 10.0.0.55
2024-01-15 10:25:00 INFO Page view: /dashboard from 192.168.1.100
2024-01-15 10:25:33 WARNING High memory: 92% used
2024-01-15 10:26:01 ERROR Database timeout after 30s
""".strip()

# Parse log entries
pattern = r"(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) (\w+) (.+)"
matches = re.findall(pattern, logs)

df = pd.DataFrame(matches, columns=["date", "time", "level", "message"])
print(df)

# Filter errors only
errors = df[df["level"] == "ERROR"]
print(f"\nErrors: {len(errors)}")
print(errors["message"].tolist())

# Extract IP addresses from messages
df["ip"] = df["message"].str.extract(r"(\d+\.\d+\.\d+\.\d+)")
print(df[["level", "ip"]].dropna())
```

---

## Regex Testing

Use [regex101.com](https://regex101.com) to:

- Build and test patterns interactively
- See explanations of each part
- Test against sample text
- Choose Python flavor

---

## Tips and Gotchas

```python
import re

# 1. Use raw strings (r"...") to avoid escape issues
print(re.findall(r"\d+", "123"))    # Correct
# print(re.findall("\d+", "123"))   # Works but shows warning

# 2. Greedy vs lazy matching
text = "<b>hello</b> and <b>world</b>"
print(re.findall(r"<b>.*</b>", text))    # Greedy: ['<b>hello</b> and <b>world</b>']
print(re.findall(r"<b>.*?</b>", text))   # Lazy: ['<b>hello</b>', '<b>world</b>']

# 3. re.IGNORECASE for case-insensitive
text = "Python PYTHON python"
print(re.findall(r"python", text, re.IGNORECASE))
# ['Python', 'PYTHON', 'python']

# 4. Compile for reuse (faster in loops)
pattern = re.compile(r"\d{3}-\d{4}")
print(pattern.findall("Call 555-1234 or 555-5678"))
```

---

## Try It Yourself

1. Write a regex to validate email addresses
2. Extract all prices (like $19.99) from a text
3. Clean a column of phone numbers to a standard format
4. Parse dates in multiple formats from messy text
5. Use `str.extract()` to pull order IDs from text

---

## Summary

| Task | Method |
|------|--------|
| Find first match | `re.search(pattern, text)` |
| Find all matches | `re.findall(pattern, text)` |
| Replace | `re.sub(pattern, replacement, text)` |
| Split | `re.split(pattern, text)` |
| Pandas filter | `df['col'].str.contains(r'pattern')` |
| Pandas extract | `df['col'].str.extract(r'(group)')` |
| Pandas replace | `df['col'].str.replace(r'pat', 'new', regex=True)` |

Regex is a must-have skill for anyone working with text data!
