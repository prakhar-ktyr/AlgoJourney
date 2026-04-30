---
title: Python Data Types
---

# Python Data Types

Every value in Python has a **type**. The built-in `type()` function tells you what it is:

```python
>>> type(5)
<class 'int'>
>>> type("hello")
<class 'str'>
>>> type([1, 2, 3])
<class 'list'>
```

Note "class" — in Python, every type is a class, and every value is an _object_. We'll come back to this when we cover OOP.

## The built-in types at a glance

| Category | Types                              |
| -------- | ---------------------------------- |
| Text     | `str`                              |
| Numeric  | `int`, `float`, `complex`          |
| Sequence | `list`, `tuple`, `range`           |
| Mapping  | `dict`                             |
| Set      | `set`, `frozenset`                 |
| Boolean  | `bool`                             |
| Binary   | `bytes`, `bytearray`, `memoryview` |
| None     | `NoneType`                         |

We'll dedicate full lessons to most of them. This page is a quick tour.

## Examples of each

```python
# Text
greeting = "Hello"

# Numeric
count = 42                  # int
pi = 3.14159                # float
z = 2 + 3j                  # complex

# Sequence
fruits = ["apple", "banana", "cherry"]   # list  (mutable)
point = (1.0, 2.0)                       # tuple (immutable)
nums = range(10)                         # range (lazy 0..9)

# Mapping
user = {"name": "Ada", "age": 36}        # dict

# Set
letters = {"a", "b", "c"}                # set   (unique, unordered)

# Boolean
is_admin = True

# Binary
raw = b"\x00\x01\x02"                    # bytes (immutable)

# Absence of value
result = None
```

## Mutable vs immutable

A type is **mutable** if its value can change in place after creation, **immutable** if not. This distinction matters constantly in Python.

| Mutable                            | Immutable                                                             |
| ---------------------------------- | --------------------------------------------------------------------- |
| `list`, `dict`, `set`, `bytearray` | `int`, `float`, `bool`, `str`, `tuple`, `frozenset`, `bytes`, `range` |

Why care? Two reasons:

1. **Aliasing.** Mutable values can be modified through any name pointing to them (we saw this in the variables lesson).
2. **Hashability.** Only immutable values can be used as dictionary keys or set members. `{[1, 2]: "x"}` raises `TypeError: unhashable type: 'list'`.

## Specifying the type explicitly

You can construct any value via its type's _constructor_:

```python
n   = int("42")          # str → int
f   = float(7)           # int → float
s   = str(3.14)          # float → str
lst = list("abc")        # iterable → list  → ['a', 'b', 'c']
d   = dict(x=1, y=2)     # → {'x': 1, 'y': 2}
b   = bool(0)            # → False
```

This is **explicit casting** — covered in depth two lessons from now.

## Checking the type

Two ways:

```python
x = 5

# Equality of type — narrow, exact
type(x) is int           # True

# Subclass-aware — recommended for normal code
isinstance(x, int)       # True
isinstance(x, (int, float))    # True for either
```

`bool` is a subclass of `int`, so `isinstance(True, int)` is `True`. That occasionally surprises people.

## The `None` value

`None` is Python's "no value" / "null" sentinel. It is its own type, `NoneType`, and has exactly one instance.

```python
result = None
if result is None:
    print("nothing yet")
```

Always compare to `None` with `is`, not `==`. It's faster and more correct.

## Type hints (optional, recommended)

Modern Python lets you _annotate_ what type a variable is supposed to hold:

```python
name: str = "Ada"
ages: list[int] = [10, 20, 30]
```

The interpreter ignores these annotations at runtime — but tools like **mypy**, **pyright**, and your IDE use them to catch bugs. We'll have a full lesson on typing later.

## Try it

```python
values = [42, 3.14, "hello", True, None, [1, 2], (3, 4), {"k": "v"}]
for v in values:
    print(f"{str(v):<15} → {type(v).__name__}")
```

Output:

```
42              → int
3.14            → float
hello           → str
True            → bool
None            → NoneType
[1, 2]          → list
(3, 4)          → tuple
{'k': 'v'}      → dict
```

Now we'll zoom into the most common ones, starting with numbers.
