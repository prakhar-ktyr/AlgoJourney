---
title: Python Iterators & Generators
---

# Python Iterators & Generators

An **iterator** is anything you can use in a `for` loop. A **generator** is the easiest way to write one yourself. Together they let you process data lazily — one item at a time, without building giant lists in memory.

## The iterator protocol

A class is an iterator if it implements two dunder methods:

- `__iter__(self)` returns the iterator (usually `self`).
- `__next__(self)` returns the next value, or raises `StopIteration` when there are no more.

```python
class Countdown:
    def __init__(self, start):
        self.n = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n + 1

for x in Countdown(3):
    print(x)
# 3
# 2
# 1
```

Manually:

```python
it = iter([10, 20, 30])
next(it)        # 10
next(it)        # 20
next(it)        # 30
next(it)        # StopIteration
```

`iter(x)` calls `x.__iter__()`, and `next(it)` calls `it.__next__()`.

## Iterables vs iterators

An **iterable** is anything `iter()` works on — lists, tuples, dicts, sets, strings, files, `range`, generators. An **iterator** is the actual stateful cursor produced by `iter(iterable)`.

A list is iterable but not an iterator: every `for` loop creates a fresh iterator from it. A generator is both.

## Generators with `yield`

Writing iterators by hand is tedious. **Generators** let you write a function that produces a sequence with `yield`:

```python
def countdown(n):
    while n > 0:
        yield n
        n -= 1

for x in countdown(3):
    print(x)
```

When you call `countdown(3)`, the function does **not** run. You get back a _generator object_ — an iterator. Each `next()` resumes the function until the next `yield`.

```python
g = countdown(3)
next(g)         # 3   — runs until first yield
next(g)         # 2
next(g)         # 1
next(g)         # StopIteration
```

This means you can describe huge or infinite sequences in a few lines:

```python
def naturals():
    n = 1
    while True:
        yield n
        n += 1

import itertools
print(list(itertools.islice(naturals(), 5)))     # [1, 2, 3, 4, 5]
```

## Generator expressions

The lazy cousin of a list comprehension. Use `( )` instead of `[ ]`:

```python
squares = (x * x for x in range(10))
sum(squares)        # 285

# Useful when chaining
total = sum(line.count("error") for line in open("app.log"))
```

The whole `app.log` is processed lazily, line by line — no need to load it all in memory.

## `yield from` — delegate to another iterable

```python
def chain(*iterables):
    for it in iterables:
        yield from it

list(chain([1, 2], "ab", (True, None)))
# [1, 2, 'a', 'b', True, None]
```

## Memory wins

Compare:

```python
sum([x * x for x in range(10_000_000)])    # builds a 10M-element list
sum(x * x for x in range(10_000_000))      # generator — constant memory
```

The generator version uses a few hundred bytes regardless of size.

## When to use which

- **List comprehension** — when you need the full result and will index/iterate multiple times.
- **Generator expression / generator function** — when you'll iterate once, the data is large, or it's infinite.
- **Custom iterator class** — rarely. Only when you need state more complex than a single function can express, or you want to support `reset` / multiple independent iterations.

## `itertools` — the Swiss army knife

The `itertools` standard module provides composable building blocks:

```python
import itertools as it

list(it.chain([1, 2], [3, 4]))            # [1, 2, 3, 4]
list(it.cycle([1, 2, 3]))                 # infinite — wrap with islice!
list(it.islice(it.count(10), 5))          # [10, 11, 12, 13, 14]
list(it.permutations("abc", 2))           # [('a','b'),('a','c'),('b','a'),...]
list(it.combinations("abcd", 2))          # [('a','b'),('a','c'),('a','d'),...]
list(it.product([1, 2], "ab"))            # [(1,'a'),(1,'b'),(2,'a'),(2,'b')]

# Group consecutive duplicates
[(k, list(g)) for k, g in it.groupby("aaabbcaa")]
# [('a', ['a','a','a']), ('b', ['b','b']), ('c', ['c']), ('a', ['a','a'])]
```

Worth bookmarking the [`itertools` recipes](https://docs.python.org/3/library/itertools.html#itertools-recipes).

## Try it — Fibonacci forever

```python
def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

import itertools
print(list(itertools.islice(fib(), 10)))
```

Output:

```
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```
