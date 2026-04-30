---
title: Python Casting
---

# Python Casting

**Casting** (or _conversion_) is changing a value from one type to another. Python uses type **constructors** — the type names themselves act as functions.

```python
int("42")        # 42        — str  → int
str(42)          # "42"      — int  → str
float(3)         # 3.0       — int  → float
list("abc")      # ['a','b','c']  — str → list of chars
tuple([1, 2])    # (1, 2)    — list → tuple
set([1, 1, 2])   # {1, 2}    — list → set (dedup)
dict([("a",1)])  # {'a': 1}  — pairs → dict
bool(0)          # False
```

## Numeric casts

```python
int(3.9)         # 3       — truncates *toward zero*
int(-3.9)        # -3
int("0b101", 2)  # 5       — second arg is the base (2..36)
int("ff", 16)    # 255

float("3.14")    # 3.14
float("inf")     # inf
float(True)      # 1.0
```

`int()` of a string only accepts whole numbers:

```python
int("3.14")      # ValueError
int(float("3.14"))   # 3   — go through float first
```

## String casts

`str(x)` calls the object's `__str__` method — almost everything in Python knows how to turn itself into a string.

```python
str(123)             # '123'
str([1, 2, 3])       # '[1, 2, 3]'
str({"a": 1})        # "{'a': 1}"
str(None)            # 'None'
```

For controlled formatting, prefer **f-strings** or `format()`:

```python
n = 0.123456
f"{n:.3f}"           # '0.123'
f"{42:>5}"           # '   42'   right-aligned in width 5
f"{255:08b}"         # '11111111' binary, 8 digits
```

## `bool()` — truthiness

`bool(x)` returns `False` for these "falsy" values and `True` for everything else:

```python
False, None, 0, 0.0, 0j, "", [], (), {}, set(), range(0), b""
```

Everything else is **truthy**:

```python
bool([0])      # True   (a non-empty list, even if its only element is 0)
bool(" ")      # True   (a string with one space)
bool(-1)       # True
```

This means you can write idiomatic Python like:

```python
items = []
if not items:
    print("nothing to do")
```

instead of `if len(items) == 0`.

## Collection casts

```python
list("abc")               # ['a', 'b', 'c']
list(range(3))            # [0, 1, 2]
tuple([1, 2, 3])          # (1, 2, 3)
set("hello")              # {'h', 'e', 'l', 'o'}
dict([("a",1),("b",2)])   # {'a': 1, 'b': 2}

# zip → dict
keys = ["x", "y", "z"]
vals = [1, 2, 3]
dict(zip(keys, vals))     # {'x': 1, 'y': 2, 'z': 3}
```

## Implicit conversion (a bit)

Python is **strongly typed** — it does not silently coerce strings to numbers like JavaScript:

```python
"3" + 4          # TypeError: can only concatenate str (not "int") to str
```

The one place Python does promote types is **mixed arithmetic** between `int` and `float`:

```python
1 + 2.0          # 3.0    (int promoted to float)
True + 1         # 2      (bool is a subclass of int)
```

## Common casting patterns

### Read a number from `input()`

```python
age = int(input("How old are you? "))
```

`input()` always returns a string — convert it.

### Safely parse with a default

```python
def parse_int(s, default=0):
    try:
        return int(s)
    except ValueError:
        return default

parse_int("42")     # 42
parse_int("oops")   # 0
```

### Round-trip via JSON

When a value comes in as text and you don't know its shape:

```python
import json
json.loads("42")            # 42        (int)
json.loads("3.14")          # 3.14      (float)
json.loads('"hello"')       # 'hello'   (str)
json.loads("[1, 2, 3]")     # [1, 2, 3] (list)
```

We have a full JSON lesson later.

## Try it

```python
raw = input("Enter two numbers separated by a space: ")
a, b = raw.split()                # → ['12', '34']  (still strings)
total = int(a) + int(b)
print(f"{a} + {b} = {total}")
```

```
Enter two numbers separated by a space: 12 34
12 + 34 = 46
```

Now that you can move freely between types, let's dig into the most-used one of all: strings.
