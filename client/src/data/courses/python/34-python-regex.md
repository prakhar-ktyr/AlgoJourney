---
title: Python Regex
---

# Python Regex

A **regular expression** (regex) is a tiny language for describing text patterns. Python's `re` module is the standard interface.

```python
import re

re.search(r"\d+", "order #1234 confirmed").group()    # '1234'
```

The `r"..."` is a **raw string** — Python doesn't process backslash escapes, which is exactly what regex needs.

## The most useful functions

| Function               | Returns                                                 |
| ---------------------- | ------------------------------------------------------- |
| `re.search(pat, s)`    | first match anywhere, or `None`                         |
| `re.match(pat, s)`     | match only at the start                                 |
| `re.fullmatch(pat, s)` | entire string must match                                |
| `re.findall(pat, s)`   | list of all non-overlapping matches (strings or tuples) |
| `re.finditer(pat, s)`  | iterator of `Match` objects (memory friendly)           |
| `re.sub(pat, repl, s)` | replace all matches                                     |
| `re.split(pat, s)`     | split on the pattern                                    |
| `re.compile(pat)`      | precompile a pattern for repeated use                   |

```python
import re

re.findall(r"\b\w+@\w+\.\w+\b", "ada@x.io and bo@y.org")
# ['ada@x.io', 'bo@y.org']

re.sub(r"\s+", " ", "  too   much    space ")
# ' too much space '

re.split(r"[,;]\s*", "a, b; c,d")
# ['a', 'b', 'c', 'd']
```

## Pattern syntax cheat sheet

### Character classes

| Pattern   | Matches                          |
| --------- | -------------------------------- |
| `.`       | any char except newline          |
| `\d` `\D` | digit / non-digit                |
| `\w` `\W` | word char (`[A-Za-z0-9_]`) / not |
| `\s` `\S` | whitespace / not                 |
| `[abc]`   | one of `a`, `b`, `c`             |
| `[^abc]`  | anything except `a`, `b`, `c`    |
| `[a-z]`   | range                            |

### Anchors

| Pattern   | Matches                                |
| --------- | -------------------------------------- |
| `^`       | start of string (or line in MULTILINE) |
| `$`       | end of string (or line in MULTILINE)   |
| `\b` `\B` | word boundary / not                    |

### Quantifiers

| Pattern | Means     |
| ------- | --------- |
| `*`     | 0 or more |
| `+`     | 1 or more |
| `?`     | 0 or 1    |
| `{n}`   | exactly n |
| `{n,}`  | n or more |
| `{n,m}` | n to m    |

Quantifiers are **greedy** by default — they consume as much as possible. Add `?` to make them **lazy**:

```python
re.search(r"<.*>", "<a><b>").group()        # '<a><b>'   greedy
re.search(r"<.*?>", "<a><b>").group()       # '<a>'      lazy
```

### Groups

Parentheses **capture** matched text:

```python
m = re.search(r"(\d{4})-(\d{2})-(\d{2})", "today is 2025-01-15")
m.group(0)        # '2025-01-15'   the whole match
m.group(1)        # '2025'
m.group(2)        # '01'
m.groups()        # ('2025', '01', '15')
```

Named groups are easier to read:

```python
m = re.search(r"(?P<year>\d{4})-(?P<month>\d{2})", "2025-01")
m.group("year")
m.groupdict()     # {'year': '2025', 'month': '01'}
```

Non-capturing groups: `(?:...)` — group without saving.

### Alternation

```python
re.findall(r"cat|dog|fish", "I have a cat and a dog")
# ['cat', 'dog']
```

## Flags

Pass after the pattern, OR them with `|`:

```python
re.findall(r"py", "Python", re.IGNORECASE)         # ['P', 'y'] no — but matches case-insensitively
```

Common flags:

| Flag            | Short  | Effect                                     |
| --------------- | ------ | ------------------------------------------ |
| `re.IGNORECASE` | `re.I` | case-insensitive                           |
| `re.MULTILINE`  | `re.M` | `^`/`$` match line boundaries              |
| `re.DOTALL`     | `re.S` | `.` matches newlines too                   |
| `re.VERBOSE`    | `re.X` | allow whitespace + comments in the pattern |

Verbose mode is great for documentation:

```python
phone = re.compile(r"""
    (?P<area>\d{3})  -    # area code
    (?P<prefix>\d{3}) -   # prefix
    (?P<line>\d{4})       # line number
""", re.VERBOSE)
```

## `re.sub` with a function

For complex replacements, pass a callable:

```python
def shout(m):
    return m.group(0).upper()

re.sub(r"\b\w{4,}\b", shout, "the quick brown fox")
# 'the QUICK BROWN fox'
```

## Compiling for reuse

If you use the same pattern many times, compile once:

```python
EMAIL = re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b")

for line in big_log:
    for m in EMAIL.finditer(line):
        print(m.group())
```

## Common patterns

```python
# Strip HTML tags (rough)
re.sub(r"<[^>]+>", "", html)

# Validate-ish email
re.fullmatch(r"[\w.+-]+@[\w-]+\.[\w.-]+", "ada@example.com")

# Slug from a title
re.sub(r"[^\w]+", "-", "Hello, World!").strip("-").lower()
# 'hello-world'

# IPv4 (relaxed)
re.findall(r"\b\d{1,3}(?:\.\d{1,3}){3}\b", text)
```

## When _not_ to use regex

- Parsing HTML/XML — use `html.parser`, `lxml`, or `BeautifulSoup`.
- Parsing JSON — use `json`.
- Parsing structured grammars (programming languages, math expressions) — use a real parser like `lark` or `pyparsing`.
- Anything where the rules nest (`<div><div></div></div>`) — regex literally cannot do this in general.

The rule of thumb: regex is for _flat_ pattern matching in unstructured text.

## Try it — find all hashtags

```python
import re

text = "Loving #Python and #regex! See also #python3.13"
tags = re.findall(r"#\w+", text)
print(tags)
```

Output:

```
['#Python', '#regex', '#python3']
```

(Note `\w` doesn't include `.` — extending the pattern is left as an exercise.)
