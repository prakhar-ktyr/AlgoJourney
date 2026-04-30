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

A **docstring** is a string literal placed as the _first statement_ of a module, function, class, or method. Python stores it in the object's `__doc__` attribute, and tools like `help()`, IDE tooltips, and Sphinx use it to generate documentation.

```python
def add(a, b):
    """Return the sum of a and b."""
    return a + b

print(add.__doc__)   # Return the sum of a and b.
help(add)            # opens an interactive help screen
```

Multi-line docstrings follow [PEP 257](https://peps.python.org/pep-0257/):

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

Common docstring styles:

| Style                | Used by                                  |
| -------------------- | ---------------------------------------- |
| **Google** (above)   | Most modern projects, Google itself      |
| **NumPy**            | Scientific Python (NumPy, SciPy, pandas) |
| **reStructuredText** | Older Sphinx projects                    |

Pick one and stick with it across a project.

## Module docstrings

Put one at the very top of a `.py` file:

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
