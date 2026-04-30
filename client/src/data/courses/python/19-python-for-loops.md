---
title: Python For Loops
---

# Python For Loops

Python's `for` is **for-each**, not the C-style `for(i = 0; i < n; i++)`. It iterates over the items of any iterable.

```python
for fruit in ["apple", "banana", "cherry"]:
    print(fruit)

for ch in "Python":
    print(ch)

for key in {"a": 1, "b": 2}:
    print(key)
```

If you need an index, use `enumerate`. If you need numeric counters, use `range`.

## `range` — generates numbers on demand

```python
for i in range(5):           # 0, 1, 2, 3, 4
    print(i)

for i in range(2, 8):        # 2..7
    print(i)

for i in range(0, 10, 2):    # 0, 2, 4, 6, 8
    print(i)

for i in range(10, 0, -1):   # countdown 10..1
    print(i)
```

`range` is **lazy** — it doesn't build a list, it produces numbers as needed. `range(10**12)` uses a few bytes of memory.

## `enumerate` — index + value

```python
fruits = ["apple", "banana", "cherry"]
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")
# 0: apple
# 1: banana
# 2: cherry

for i, fruit in enumerate(fruits, start=1):
    print(f"{i}: {fruit}")
# 1: apple ...
```

Beats the C-flavoured `for i in range(len(fruits)):` every time.

## `zip` — iterate two (or more) iterables in parallel

```python
names  = ["Ada", "Linus", "Guido"]
scores = [95, 80, 88]

for name, score in zip(names, scores):
    print(name, score)
```

`zip` stops at the shortest input. Use `zip(..., strict=True)` (Python 3.10+) to raise an error on length mismatch:

```python
list(zip([1, 2, 3], "ab", strict=True))   # ValueError
```

## Iterating dicts

```python
prices = {"apple": 1.0, "banana": 0.5, "cherry": 2.5}

for key in prices:                    # keys
    ...

for key, value in prices.items():     # (key, value) pairs
    print(f"{key}: ${value:.2f}")
```

## `break`, `continue`, `else`

Same as `while`:

```python
for n in [4, 6, 8, 9, 10]:
    if n == 9:
        break                # found odd, stop
else:
    print("all even")        # only runs if no break
```

## Nested loops

```python
for r in range(3):
    for c in range(3):
        print(f"({r}, {c})", end="  ")
    print()
```

Output:

```
(0, 0)  (0, 1)  (0, 2)
(1, 0)  (1, 1)  (1, 2)
(2, 0)  (2, 1)  (2, 2)
```

## `pass`, again

If you need a syntactically-required body that does nothing:

```python
for _ in range(10):
    pass
```

`_` is the conventional name for "I don't care about this value".

## Looping with state — but consider comprehensions

A typical "transform every item" loop:

```python
squares = []
for x in range(10):
    squares.append(x * x)
```

Idiomatic Python:

```python
squares = [x * x for x in range(10)]
```

We have a full lesson on comprehensions.

## Iterating safely while mutating

**Never modify a list while you iterate over it.** The behaviour is undefined.

```python
nums = [1, 2, 3, 4, 5]

# WRONG
for n in nums:
    if n % 2 == 0:
        nums.remove(n)        # skips items, breaks indexing

# RIGHT — iterate a copy or build a new list
nums = [n for n in nums if n % 2 != 0]
```

## Try it — multiplication table

```python
for i in range(1, 6):
    for j in range(1, 6):
        print(f"{i*j:4}", end="")
    print()
```

Output:

```
   1   2   3   4   5
   2   4   6   8  10
   3   6   9  12  15
   4   8  12  16  20
   5  10  15  20  25
```
