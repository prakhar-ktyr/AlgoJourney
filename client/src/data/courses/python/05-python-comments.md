---
title: Python Comments
---

# Python Comments

Comments are notes for human readers that the interpreter ignores. Use them to explain _why_ the code does something — not _what_ it does (the code already says that).

## Single-line comments

Anything after `#` to the end of the line is a comment.

```python
# This greets the user.
print("Hello!")        # End-of-line comment
```

There must be **at least two spaces** before the `#` of an end-of-line comment, by PEP 8 convention.

## Multi-line comments

Python has no `/* ... */` syntax. You have two options:

### Stack `#` lines

```python
# This function downloads the user's profile,
# parses the JSON response, and caches the
# result for 60 seconds.
def get_profile(user_id):
    ...
```

This is the recommended style for actual comments.

### Triple-quoted strings

```python
"""
This is a string literal that nothing assigns
to. Python evaluates it and discards the result,
so it acts like a multi-line comment.
"""
```

This works, but it's not a real comment — it's a string that gets created and thrown away. Use this style only when you mean it as a **docstring** (next section).

## Docstrings

Unlike regular comments (which are ignored entirely), a **docstring** is a triple-quoted string that _documents_ your code and stays accessible at runtime. Think of it as a built-in help message attached to whatever you write.

### What makes a string a docstring?

Two rules:

1. It must be a **triple-quoted string** (`"""..."""` or `'''...'''`).
2. It must be the **very first statement** inside a function, class, method, or module — before any other code.

If both rules are met, Python automatically saves the string so that developers (and tools) can read it later.

### A simple example

```python
def add(a, b):
    """Return the sum of a and b."""
    return a + b
```

The string `"Return the sum of a and b."` is now the docstring for `add`. You didn't assign it to a variable — Python attached it to the function for you.

### How to access a docstring

Python stores the docstring in a special `__doc__` attribute on the object:

```python
print(add.__doc__)
```

Output:

```
Return the sum of a and b.
```

You can also use the built-in `help()` function, which formats the docstring nicely:

```python
help(add)
```

Output:

```
Help on function add:

add(a, b)
    Return the sum of a and b.
```

IDEs, auto-complete tooltips, and documentation generators (like Sphinx) all read `__doc__` — so writing good docstrings means your code documents itself wherever it's used.

### Docstrings vs. comments — when to use which

| Use a **comment** (`#`)     | Use a **docstring** (`"""`)                 |
| --------------------------- | ------------------------------------------- |
| Explain _why_ code exists   | Describe _what_ a function/class/module does |
| Internal notes for the team | Public-facing documentation for users       |
| Ignored by Python entirely  | Stored at runtime and used by tools         |

### Multi-line docstrings

For functions with parameters, a multi-line docstring explains what goes in and what comes out. The standard format is defined by [PEP 257](https://peps.python.org/pep-0257/):

```python
def fetch(url, timeout=10):
    """Download the content at `url`.

    Args:
        url: The URL to fetch.
        timeout: Seconds to wait before giving up.

    Returns:
        The response body as a string.

    Raises:
        TimeoutError: If the download exceeds `timeout` seconds.
    """
    ...
```

Structure:
- **First line** — a short summary (fits on one line, ends with a period).
- **Blank line** — separates the summary from the body.
- **Body** — describes parameters, return values, side effects, or exceptions.

### Common docstring styles

Different projects use different formatting conventions for the body:

| Style                | Used by                                  |
| -------------------- | ---------------------------------------- |
| **Google** (above)   | Most modern projects, Google itself      |
| **NumPy**            | Scientific Python (NumPy, SciPy, pandas) |
| **reStructuredText** | Older Sphinx projects                    |

All three convey the same information — they just look slightly different. Pick one and stick with it across a project.

## Module docstrings

You can also put a docstring at the very top of a `.py` file (before any imports). This documents what the entire file is for:

```python
"""utilities.py — small string and date helpers used across the project."""

import re
...
```

## When to comment, when not to

**Good comments** explain _why_:

```python
# Apple's API rate-limits to 10 req/s; sleep keeps us under the threshold.
time.sleep(0.12)
```

**Bad comments** restate the code:

```python
i = i + 1   # add one to i
```

Whenever you feel the urge to write a "what" comment, ask: _can I rename the variable or extract a function so the code explains itself?_ Usually yes.

## Commenting out code

While debugging it's tempting to "comment out" a block:

```python
# old_value = compute_old(x)
# print(old_value)
```

That's fine for a few minutes — but commit the cleanup. Dead, commented-out code is the #1 cause of stale codebases. Use version control (Git) instead; deleted code can always be recovered.

## Try it

```python
"""Demo of every comment style in one file."""

# A configuration constant.
PI = 3.14159  # close enough for our needs


def area(radius):
    """Return the area of a circle of the given radius."""
    return PI * radius * radius


print(area(5))
print(area.__doc__)
```

Output:

```
78.53975
Return the area of a circle of the given radius.
```

Now you're ready to declare some real variables.
