---
title: Python Variables
---

# Python Variables

A **variable** is a name that refers to a value. Unlike C or Java, you don't declare the type — Python figures it out from whatever you assign.

```python
x = 5
name = "Alice"
pi = 3.14
is_admin = True
```

That's it. No `int x;`, no `var`, no `let`. The `=` is the **assignment** operator.

## Reassigning is fine — and the type can change

```python
x = 5
print(x)      # 5
x = "hello"
print(x)      # hello
```

Python is **dynamically typed**: a variable can hold any kind of value at any time. This is convenient but means type errors only show up when the offending line actually runs.

## Naming rules

A variable name:

- must start with a letter or underscore (`_`),
- can contain letters, digits, and underscores,
- is case-sensitive (`age` and `Age` are different),
- cannot be a reserved Python keyword (`if`, `def`, `class`, `for`, `True`, …).

Valid: `user_count`, `_temp`, `total2`, `αlpha` (yes, Unicode letters work).
Invalid: `2cool`, `my-var`, `class`.

## Naming conventions ([PEP 8](https://peps.python.org/pep-0008/))

| Kind      | Style              | Example                    |
| --------- | ------------------ | -------------------------- |
| Variables | `lower_snake_case` | `user_name`, `retry_count` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_BUFFER`, `PI`         |
| "Private" | leading underscore | `_cache`                   |

The interpreter doesn't enforce these — they're cultural. Following them makes your code instantly readable to other Python programmers.

## Multiple assignment

Assign several variables at once:

```python
x, y, z = 1, 2, 3
print(x, y, z)   # 1 2 3
```

This is **tuple unpacking** under the hood — the right side is the tuple `(1, 2, 3)` and the left side has matching slots.

Or assign the same value to several names:

```python
a = b = c = 0
```

A famous trick: swap two variables without a temporary.

```python
a, b = 10, 20
a, b = b, a
print(a, b)   # 20 10
```

## Variables are _names_, not boxes

This is the most important mental model in Python. A variable doesn't _contain_ a value — it **points to** one.

```python
a = [1, 2, 3]
b = a            # b now points to the same list
b.append(4)
print(a)         # [1, 2, 3, 4]  — surprised?
```

`a` and `b` are two names for the same underlying list. Mutating through one is visible through the other. We'll revisit this when we cover lists in detail.

## `del` removes a name

```python
x = 5
del x
print(x)   # NameError: name 'x' is not defined
```

`del` deletes the _name_, not necessarily the value. Once nothing refers to a value, Python's garbage collector reclaims its memory eventually.

## Constants

Python has no `const` keyword. The convention is **all-caps**, and other programmers will treat them as constants.

```python
MAX_RETRIES = 5
DATABASE_URL = "postgres://localhost/app"
```

If you want a real, enforced constant, use [`typing.Final`](https://docs.python.org/3/library/typing.html#typing.Final) (covered in the typing lesson) or expose values via a frozen dataclass or enum.

## Output multiple variables

`print` accepts any number of arguments and joins them with a space:

```python
first = "Ada"
last = "Lovelace"
print(first, last)            # Ada Lovelace
```

Or use an **f-string** for fine control:

```python
print(f"Hello, {first} {last}!")    # Hello, Ada Lovelace!
```

You can mix expressions inside `{ }`:

```python
x, y = 4, 7
print(f"{x} + {y} = {x + y}")        # 4 + 7 = 11
```

## Chained comparisons & global vs local

We'll cover **scope** (which functions can see which variables) in its own lesson, but a quick teaser:

```python
counter = 0

def bump():
    global counter
    counter += 1

bump(); bump(); bump()
print(counter)   # 3
```

Without `global`, assigning to `counter` inside `bump()` would create a brand-new local variable. Forgetting `global` is a classic beginner trap.

## Try it

```python
name = "World"
greeting = f"Hello, {name}!"
print(greeting)

# Reassign and re-print
name = "Python"
greeting = f"Hello, {name}!"
print(greeting)
```

Output:

```
Hello, World!
Hello, Python!
```

You've now got everything you need to talk about _what_ you're storing — which means it's time to meet Python's data types.
