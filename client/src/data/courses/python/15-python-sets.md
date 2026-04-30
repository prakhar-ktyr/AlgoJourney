---
title: Python Sets
---

# Python Sets

A `set` is an **unordered collection of unique, hashable items**. Conceptually it's the mathematical set — useful for membership tests, deduplication, and set algebra (union, intersection, difference).

```python
colors = {"red", "green", "blue"}
empty = set()           # NOTE: {} is an empty *dict*, not set
nums = set([1, 2, 2, 3, 3, 3])     # → {1, 2, 3}
```

## Properties

- **Unique** — duplicates are silently dropped.
- **Unordered** — no indexing, no slicing. Iteration order is _insertion-related but not guaranteed_.
- **Mutable** — add and remove items.
- **Items must be hashable** — so no lists or dicts as members; tuples and frozensets are fine.

## Adding & removing

```python
s = {1, 2, 3}
s.add(4)              # {1, 2, 3, 4}
s.update([5, 6])      # add many   → {1, 2, 3, 4, 5, 6}

s.remove(2)           # KeyError if missing
s.discard(99)         # silent if missing
top = s.pop()         # arbitrary element removed and returned
s.clear()             # empty
```

## Membership is fast

The defining feature: `in` on a set is **O(1)** average, vs **O(n)** for a list.

```python
big_list = list(range(1_000_000))
big_set  = set(big_list)

999_999 in big_list    # slow — has to scan the whole thing
999_999 in big_set     # near-instant
```

If you find yourself doing many `in` checks against the same data, convert it to a set first.

## Set algebra

| Operator          | Method                      | Meaning              |
| ----------------- | --------------------------- | -------------------- | --------------- |
| `a                | b`                          | `a.union(b)`         | items in a or b |
| `a & b`           | `a.intersection(b)`         | items in both        |
| `a - b`           | `a.difference(b)`           | items in a but not b |
| `a ^ b`           | `a.symmetric_difference(b)` | items in exactly one |
| `a <= b`          | `a.issubset(b)`             | every item of a in b |
| `a < b`           | (proper subset)             | subset and not equal |
| `a >= b`          | `a.issuperset(b)`           | every item of b in a |
| `a.isdisjoint(b)` |                             | no common items      |

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

a | b       # {1, 2, 3, 4, 5, 6}
a & b       # {3, 4}
a - b       # {1, 2}
a ^ b       # {1, 2, 5, 6}
```

In-place versions exist: `|=`, `&=`, `-=`, `^=`, or `update`, `intersection_update`, `difference_update`, `symmetric_difference_update`.

## Common idioms

### Deduplicate a list (loses order)

```python
list(set([1, 2, 2, 3, 1]))     # [1, 2, 3] (any order)
```

To preserve order, use a `dict`:

```python
list(dict.fromkeys([1, 2, 2, 3, 1]))   # [1, 2, 3]
```

### Find what changed

```python
old_users = {"alice", "bob", "carol"}
new_users = {"bob", "carol", "dave"}

added   = new_users - old_users     # {'dave'}
removed = old_users - new_users     # {'alice'}
kept    = old_users & new_users     # {'bob', 'carol'}
```

### Count uniques

```python
words = "the quick brown fox jumps over the lazy dog the".split()
len(set(words))     # 9
```

## Set comprehensions

```python
unique_lengths = {len(w) for w in ["hi", "hello", "hi", "world"]}
# {2, 5}
```

## `frozenset` — the immutable cousin

A `frozenset` is hashable, so it can be a dict key or live inside another set.

```python
fs = frozenset([1, 2, 3])
fs.add(4)        # AttributeError — immutable

# Use as a dict key
groupings = {
    frozenset(["red", "green"]): "warm",
    frozenset(["blue", "cyan"]): "cool",
}
```

## What sets _don't_ do

- No indexing: `s[0]` raises `TypeError`.
- No `sort` or guaranteed order. If you need order, convert to `sorted(s)` (returns a list).
- No duplicates ever — by design.

## Try it

```python
def common_words(*texts):
    """Return the words that appear in every text."""
    word_sets = [set(t.lower().split()) for t in texts]
    return word_sets[0].intersection(*word_sets[1:])

print(common_words(
    "the quick brown fox",
    "the lazy brown dog",
    "the brown bear",
))
```

Output:

```
{'the', 'brown'}
```
