---
title: Python Syntax
---

# Python Syntax

Let's pull apart the "Hello, World" program and a few of its close relatives.

```python
print("Hello, World!")
```

That is a complete Python program. No `#include`, no `main` function, no semicolons. Compare this to the same program in C, which needs five lines. Python's brevity is intentional.

## Statements end at the newline

Python uses **newlines** instead of semicolons to end statements. This:

```python
x = 1
y = 2
print(x + y)
```

is three statements. You _can_ put multiple on one line with semicolons (`x = 1; y = 2`), but it's considered bad style.

If a statement is too long, break it with a backslash `\` or — preferably — wrap it in parentheses, brackets, or braces:

```python
total = (1 + 2 + 3
         + 4 + 5 + 6)
```

## Indentation defines blocks

This is Python's most distinctive feature. Where C uses `{ }`, Python uses **leading whitespace**.

```python
if 5 > 2:
    print("Five is greater than two!")
    print("Still inside the if block")
print("Outside the if block")
```

Rules:

1. The colon `:` introduces a block — after `if`, `for`, `while`, `def`, `class`, etc.
2. Every line in the block must be indented **the same amount**. The standard is **4 spaces**.
3. Mixing tabs and spaces in the same block is a syntax error in Python 3.

This:

```python
if True:
  print("two spaces")
    print("four spaces")  # IndentationError!
```

…will not run. Set your editor to insert 4 spaces when you press Tab and you'll never think about it again.

## Case sensitivity

`Name`, `name`, and `NAME` are three different variables. Built-in keywords (`if`, `def`, `True`) are always lowercase except for the constants `True`, `False`, and `None`.

## Comments

```python
# Single-line comment

# Python has no /* ... */ multi-line comment syntax,
# but you can stack # lines or use a triple-quoted string
# that nothing assigns to.
"""
This is a string the interpreter
discards immediately, often used
as a multi-line note.
"""
```

We dedicate the next lesson to comments and **docstrings**.

## Identifiers

A name (variable, function, class) must:

- start with a letter or underscore,
- contain only letters, digits, and underscores,
- not be a reserved keyword (`if`, `class`, `lambda`, …).

Conventions:

| Kind                | Convention         | Example                   |
| ------------------- | ------------------ | ------------------------- |
| Variable / function | `lower_snake_case` | `user_count`, `parse_url` |
| Class               | `UpperCamelCase`   | `HttpClient`              |
| Constant            | `UPPER_SNAKE_CASE` | `MAX_RETRIES`             |
| "Private" attribute | leading underscore | `_internal`               |

Python doesn't enforce these — they're just culture, codified in [PEP 8](https://peps.python.org/pep-0008/).

## A slightly bigger example

```python
a = 10
b = 32
total = a + b

if total > 0:
    print(f"{a} + {b} = {total}")
else:
    print("Not positive")
```

Run it:

```
10 + 32 = 42
```

Notes:

- `f"{a} + {b}"` is an **f-string** — variables inside `{ }` are substituted with their values. F-strings are fast, readable, and the modern way to format text.
- The `if`/`else` block uses indentation; the `print` after it (none here) would be "unindented" back to column 0.

## The interactive `>>>`

When the docs (or this course) show:

```python
>>> 2 + 2
4
```

…the `>>>` is the REPL prompt and the next line is what Python printed back. You don't type the `>>>`; it's just a marker showing "this is interactive". In real `.py` files there are no prompts.

## Common beginner gotchas

- **`SyntaxError: invalid syntax`** — usually a missing `:` after `if`/`for`/`def`, or unbalanced quotes/parentheses.
- **`IndentationError`** — mixed tabs and spaces, or you forgot to indent the body of an `if`.
- **`NameError: name 'x' is not defined`** — you're using a variable that doesn't exist yet (or you typoed the name — Python is case-sensitive!).

That's the whole syntax, more or less. The rest of the course adds features, not punctuation.
