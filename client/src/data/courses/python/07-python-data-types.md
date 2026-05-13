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

You'll notice the word `class` in the output. For now, just read that as "Python telling you what kind of value this is." We'll connect it to classes and objects later in the OOP lesson.

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

1. **Shared references.** If two variables point to the same mutable value, changing it through one name changes what the other name sees.
2. **Dictionary keys and set items.** Only immutable values can be used as dictionary keys or set members. `{[1, 2]: "x"}` raises `TypeError: unhashable type: 'list'`.

## Specifying the type explicitly

You can create or convert values by calling a type like a function:

```python
n   = int("42")          # str → int
f   = float(7)           # int → float
s   = str(3.14)          # float → str
lst = list("abc")        # iterable → list  → ['a', 'b', 'c']
d   = dict(x=1, y=2)     # → {'x': 1, 'y': 2}
b   = bool(0)            # → False
```

This is usually called **type conversion** or **casting**. We'll cover it in more detail in the casting lesson.

## Checking the type

Most of the time, use `isinstance()`:

```python
x = 5

# Good for normal program logic
isinstance(x, int)              # True
isinstance(x, (int, float))     # True for either
```

It answers the question, "Can I treat this value like an `int`?" That is usually what you want in real code.

If you need the **exact** type and nothing else, use `type(x) is ...`:

`is` is Python's **identity operator** — it checks whether two expressions refer to the _exact same object_ in memory, rather than just equal values. Type objects (`int`, `str`, `bool`, …) are singletons — there is only one `int` type object in the entire program — so `type(x) is int` is a reliable exact-type check. We'll cover `is` fully in the operators lesson; for now just know it means "literally the same object".

```python
type(x) is int                  # True
type(True) is int               # False
```

One Python quirk: `bool` is a specialized form of `int`, so this is true:

```python
isinstance(True, int)           # True
type(True) is bool              # True
```

Rule of thumb:

- Use `isinstance()` in normal code.
- Use `type(...) is ...` only when you specifically need an exact type match.

## The `None` value

`None` means "no value here" or "nothing has been set yet". It has its own type, `NoneType`.

```python
result = None
if result is None:
    print("nothing yet")
```

Always compare to `None` with `is`, not `==`. That's the standard Python style and it avoids surprising behavior from custom equality rules.

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
    print(v, "→", type(v))
```

Output:

```
42 → <class 'int'>
3.14 → <class 'float'>
hello → <class 'str'>
True → <class 'bool'>
None → <class 'NoneType'>
[1, 2] → <class 'list'>
(3, 4) → <class 'tuple'>
{'k': 'v'} → <class 'dict'>
```

:::details Cleaner output with column alignment (uses syntax covered later)

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

Two things used here that haven't been introduced yet:

- **`:<15`** — an f-string format specifier that left-aligns the value in a 15-character-wide column. Covered in the [Strings lesson](/tutorials/python/python-strings).
- **`type(v).__name__`** — every Python class object has a `.__name__` attribute that holds its name as a plain string (e.g. `"int"` instead of `<class 'int'>`). Attribute access with `.` is covered in the [Classes & Objects lesson](/tutorials/python/python-classes-objects).

:::

Now we'll zoom into the most common ones, starting with numbers.
