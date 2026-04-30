---
title: Python Tuples
---

# Python Tuples

A `tuple` is an **ordered, immutable** sequence. Think "list that can never change".

```python
point = (3, 4)
rgb = (255, 128, 0)
empty = ()
single = (42,)         # note the trailing comma — without it, (42) is just 42
```

The parentheses are optional in most contexts. These are all tuples:

```python
t = 1, 2, 3
x, y = 10, 20      # tuple unpacking
return a, b, c     # function returning multiple values is really one tuple
```

The comma makes the tuple, not the parentheses. The parens are just for grouping.

## Why tuples exist

Lists do everything tuples do, plus more — so why bother?

1. **Immutability is a guarantee.** A tuple won't change behind your back. Pass it to a function with confidence.
2. **Hashable.** Tuples (of hashable elements) can be dictionary keys and set members. Lists can't.
3. **Slightly faster and smaller.** Useful in tight loops or large data structures.
4. **Signals intent.** A tuple often represents a fixed-shape record (`(latitude, longitude)`); a list is a homogeneous, growable collection.

## Indexing, slicing, length

Identical to lists, except you can't assign to a slice.

```python
t = (10, 20, 30, 40, 50)
t[0]            # 10
t[-1]           # 50
t[1:3]          # (20, 30)
len(t)          # 5
20 in t         # True
```

## Methods

Tuples only have two methods (because they can't change):

```python
t = (1, 2, 2, 3)
t.count(2)      # 2
t.index(3)      # 3
```

## Tuple unpacking

This is one of Python's most loved features.

```python
x, y = (1, 2)
x, y, z = "abc"          # works on any iterable

# Swap
a, b = b, a

# Star unpacks the rest as a list
first, *rest = [1, 2, 3, 4]
*head, last = [1, 2, 3, 4]
first, *middle, last = [1, 2, 3, 4, 5]

# Skip values
_, year, _ = ("Jan", 2025, "USD")
```

A function returning multiple values is really returning a tuple:

```python
def divmod_(a, b):
    return a // b, a % b

q, r = divmod_(17, 5)        # 3, 2
```

## Named tuples — tuples with field names

When you find yourself indexing `t[0]`, `t[1]` and forgetting what each slot means, upgrade to `NamedTuple`:

```python
from typing import NamedTuple

class Point(NamedTuple):
    x: float
    y: float

p = Point(3, 4)
p.x, p.y         # 3, 4
p[0]             # 3   — still works as a regular tuple
```

The classic `collections.namedtuple` is the older equivalent:

```python
from collections import namedtuple
Color = namedtuple("Color", ["r", "g", "b"])
red = Color(255, 0, 0)
```

For records with default values, methods, or mutability needs, see `dataclasses` (covered in the OOP lesson).

## Tuples as dictionary keys

```python
distances = {
    ("NYC", "LA"): 2451,
    ("NYC", "CHI"): 790,
}
distances[("NYC", "LA")]      # 2451
```

This wouldn't work with lists — lists are unhashable.

## Iterating

```python
for value in (10, 20, 30):
    print(value)

for i, v in enumerate(("a", "b", "c")):
    print(i, v)
```

## Converting

```python
tuple([1, 2, 3])      # (1, 2, 3)
list((1, 2, 3))       # [1, 2, 3]
tuple("abc")          # ('a', 'b', 'c')
```

## Try it

```python
def stats(numbers):
    """Return (count, total, average) of an iterable of numbers."""
    nums = list(numbers)
    n = len(nums)
    total = sum(nums)
    return n, total, total / n

count, total, avg = stats([1, 2, 3, 4, 5])
print(f"count={count}, total={total}, avg={avg}")
```

Output:

```
count=5, total=15, avg=3.0
```

That's tuples. Next, the unordered cousins of lists: sets.
