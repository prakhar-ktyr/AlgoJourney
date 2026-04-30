---
title: Python Lists
---

# Python Lists

A `list` is an **ordered, mutable** sequence. It can hold values of any type, even mixed types, and grow or shrink as you add and remove items.

```python
fruits = ["apple", "banana", "cherry"]
mixed  = [1, "two", 3.0, [4, 5]]
empty  = []
also_empty = list()
```

Lists are written with square brackets. Internally they're dynamic arrays — index access is O(1), append is amortized O(1), insert/delete in the middle is O(n).

## Indexing & slicing

Same rules as strings.

```python
fruits = ["apple", "banana", "cherry", "date", "elderberry"]
fruits[0]         # 'apple'
fruits[-1]        # 'elderberry'
fruits[1:3]       # ['banana', 'cherry']
fruits[::2]       # ['apple', 'cherry', 'elderberry']
fruits[::-1]      # reversed
```

Unlike strings, lists are **mutable** — you can assign to a slice:

```python
fruits[1:3] = ["mango"]
print(fruits)     # ['apple', 'mango', 'date', 'elderberry']
```

## Length, membership

```python
len(fruits)              # number of items
"mango" in fruits        # True
"kiwi" not in fruits     # True
```

## Adding items

```python
fruits.append("kiwi")          # add to end
fruits.insert(0, "starfruit")  # insert at position
fruits.extend(["lime", "fig"]) # append every item from another iterable
fruits += ["pear"]             # equivalent to extend
```

`append` adds **one item** (even if it's a list — `[1].append([2,3]) → [1,[2,3]]`). `extend` flattens one level.

## Removing items

```python
fruits.remove("kiwi")     # delete first occurrence — ValueError if missing
last = fruits.pop()       # remove & return last item
first = fruits.pop(0)     # remove & return item at index
del fruits[2]             # remove by index, no return value
fruits.clear()            # empty the list
```

## Searching, counting, sorting

```python
nums = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
nums.index(4)             # 2     — first index of 4 (ValueError if missing)
nums.count(5)             # 2

nums.sort()               # in-place
nums.sort(reverse=True)
nums.sort(key=abs)        # by a key function

sorted(nums)              # returns a new sorted list, original untouched
sorted(nums, key=lambda x: -x)

nums.reverse()            # in-place
list(reversed(nums))      # new reversed list
```

## Iterating

```python
for fruit in fruits:
    print(fruit)

# With index
for i, fruit in enumerate(fruits):
    print(i, fruit)

# Two lists in parallel
prices = [1.0, 2.0, 1.5]
for fruit, price in zip(fruits, prices):
    print(fruit, price)
```

`enumerate` and `zip` are two of the most-used functions in real Python code.

## Copying

This is the trap from the variables lesson:

```python
a = [1, 2, 3]
b = a            # SAME list — mutating b mutates a

c = a.copy()     # shallow copy — a new list, but inner objects are shared
d = a[:]         # equivalent to a.copy()
e = list(a)      # equivalent

import copy
f = copy.deepcopy(a)   # also copies nested mutable objects
```

A **shallow copy** is enough most of the time. Use `deepcopy` only when you have nested mutables that you also want to clone.

## List comprehensions (preview)

The Pythonic way to build a list from another iterable:

```python
squares = [x * x for x in range(10)]
evens   = [x for x in range(20) if x % 2 == 0]
matrix  = [[r * c for c in range(3)] for r in range(3)]
```

We have a full lesson on comprehensions later.

## Useful list patterns

```python
# Flatten one level
nested = [[1, 2], [3, 4], [5]]
flat = [x for row in nested for x in row]      # [1, 2, 3, 4, 5]

# Remove duplicates while preserving order (Python 3.7+ dicts are ordered)
items = [3, 1, 2, 1, 3, 4]
unique = list(dict.fromkeys(items))            # [3, 1, 2, 4]

# Split a list into chunks of n
def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

list(chunks(range(10), 3))   # [range(0,3), range(3,6), ...]
```

## Stacks and queues

A list is naturally a **stack** (LIFO):

```python
stack = []
stack.append(1)
stack.append(2)
stack.pop()      # 2
```

A list as a queue (FIFO) works but `pop(0)` is O(n). Use `collections.deque` for fast both-end access:

```python
from collections import deque
q = deque([1, 2, 3])
q.append(4)        # right
q.appendleft(0)    # left
q.popleft()        # 0
```

## Try it

```python
def top_n(nums, n):
    """Return the n largest values, sorted descending."""
    return sorted(nums, reverse=True)[:n]

print(top_n([3, 1, 4, 1, 5, 9, 2, 6, 5, 3], 3))
```

Output:

```
[9, 6, 5]
```
