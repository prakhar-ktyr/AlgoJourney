---
title: Python Strings
---

# Python Strings

A `str` is an **immutable** sequence of Unicode characters. Strings are everywhere in Python, so this is one of the most important lessons in the course.

## String literals

```python
a = 'single quotes'
b = "double quotes"          # identical to single — pick one and stick with it
c = '''triple-single, can
span multiple lines'''
d = """triple-double, also
multi-line"""
```

Use triple quotes for multi-line strings and docstrings. Inside a triple-quoted string, both newlines and the other quote character are literal.

## Escape sequences

| Sequence  | Meaning                |
| --------- | ---------------------- |
| `\n`      | newline                |
| `\t`      | tab                    |
| `\\`      | backslash              |
| `\'` `\"` | quote                  |
| `\u00e9`  | Unicode code point (é) |
| `\xff`    | hex byte (in `bytes`)  |

```python
print("line 1\nline 2")
print("Tab\there")
```

## Raw strings

Prefix with `r` to disable escapes — handy for Windows paths and regex:

```python
path = r"C:\Users\Ada\file.txt"      # backslashes are literal
pattern = r"\d{3}-\d{4}"             # for the re module
```

## f-strings (formatted strings)

The modern way to embed values in text. Available since Python 3.6.

```python
name, age = "Ada", 36
print(f"Hello, {name}! You are {age}.")
print(f"Next year you'll be {age + 1}.")    # any expression works
```

### Format specifiers

After a `:` inside `{}`, you control how the value is rendered.

```python
pi = 3.14159
f"{pi:.2f}"          # '3.14'        — 2 decimal places
f"{pi:10.2f}"        # '      3.14'  — width 10, right-aligned
f"{pi:<10.2f}"       # '3.14      '  — left-aligned
f"{pi:^10.2f}"       # '   3.14   '  — centered

n = 42
f"{n:05d}"           # '00042'       — pad with zeros to width 5
f"{n:b}"             # '101010'      — binary
f"{n:x}"             # '2a'          — hex
f"{n:,}"             # '42'   ; for 1000000 → '1,000,000'

# Debug form (Python 3.8+): prints `name=value`
f"{name=}"           # "name='Ada'"
```

The full mini-language is in the [docs](https://docs.python.org/3/library/string.html#format-specification-mini-language).

## String concatenation

```python
"Hello, " + "World"          # 'Hello, World'
"ha" * 3                     # 'hahaha'
"Hello" "World"              # 'HelloWorld' (literal concatenation, no operator)
```

For building large strings in a loop, **never** use `+=`. Use `"".join(parts)` — it's O(n) instead of O(n²).

```python
parts = []
for word in ["the", "quick", "brown"]:
    parts.append(word)
" ".join(parts)              # 'the quick brown'
```

## Indexing and slicing

Strings are sequences. Index with `[i]` (zero-based, negatives count from the end). Slice with `[start:stop:step]`.

```python
s = "Python"
s[0]            # 'P'
s[-1]           # 'n'
s[1:4]          # 'yth'      — stop is exclusive
s[:3]           # 'Pyt'
s[3:]           # 'hon'
s[::2]          # 'Pto'      — every 2nd char
s[::-1]         # 'nohtyP'   — reverse
```

Strings are **immutable** — you can't assign to a slice.

```python
s[0] = "J"      # TypeError
```

## Length and membership

```python
len("Python")        # 6
"Py" in "Python"     # True
"X" not in "Python"  # True
```

## Useful methods (memorize the common ones)

```python
"  hello  ".strip()          # 'hello'   (also lstrip, rstrip)
"hello".upper()              # 'HELLO'
"HELLO".lower()              # 'hello'
"hello world".title()        # 'Hello World'
"Python".startswith("Py")    # True
"file.txt".endswith(".txt")  # True
"banana".count("a")          # 3
"banana".replace("a", "o")   # 'bonono'
"a,b,c".split(",")           # ['a', 'b', 'c']
"-".join(["a","b","c"])      # 'a-b-c'
"3.14".find(".")             # 1     (-1 if not found)
"3.14".index(".")            # 1     (raises ValueError if missing)
"abc".center(7, "*")         # '**abc**'
"abc".zfill(6)               # '000abc'
"abc123".isalnum()           # True
"abc".isalpha()              # True
"123".isdigit()              # True
"hello".encode("utf-8")      # b'hello'  (str → bytes)
```

There are about forty methods on `str`. Skim them in the REPL with `dir("")` or `help(str)` when you need one.

## Iterating

```python
for ch in "abc":
    print(ch)
```

## Strings are Unicode

A Python `str` is a sequence of _code points_, not bytes. `len("café")` is 4, not 5. To get bytes, encode:

```python
"café".encode("utf-8")       # b'caf\xc3\xa9'
b"caf\xc3\xa9".decode("utf-8")   # 'café'
```

Always be explicit about encoding when reading and writing files (we'll cover this).

## Try it

```python
def slugify(text):
    """Turn a title into a URL-safe slug."""
    return "-".join(text.lower().split())

print(slugify("Hello, World!  Welcome to Python"))
```

Output:

```
hello,-world!-welcome-to-python
```

(A real slugifier would also strip punctuation — try improving it!)
