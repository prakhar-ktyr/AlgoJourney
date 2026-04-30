---
title: Python Dictionaries
---

# Python Dictionaries

A `dict` (dictionary) maps **keys** to **values**. Other languages call it a hash map, hash table, or associative array. It's arguably Python's most important data structure — the language itself uses dicts for module namespaces, object attributes, and keyword arguments.

```python
user = {
    "name": "Ada",
    "age": 36,
    "is_admin": True,
}
empty = {}
also_empty = dict()
```

## Keys must be hashable; values can be anything

Hashable types: `int`, `float`, `str`, `bool`, `tuple` (of hashable items), `frozenset`, `None`, plus most user-defined classes. Lists, sets, and dicts are **not** hashable.

```python
{(1, 2): "ok"}      # tuple key — fine
{[1, 2]: "no"}      # TypeError: unhashable type: 'list'
```

## Access, insert, update, delete

```python
user["name"]              # 'Ada'
user["email"] = "ada@x"   # insert
user["age"] = 37          # update
del user["is_admin"]      # delete
```

Reading a missing key raises `KeyError`. Use `.get()` to supply a default:

```python
user.get("phone")              # None  (not an error)
user.get("phone", "unknown")   # 'unknown'
```

For "get or insert", use `setdefault`:

```python
counts = {}
counts.setdefault("apple", 0)
counts["apple"] += 1
```

…or, more idiomatically, use `collections.defaultdict` (below).

## Insertion order is preserved (Python 3.7+)

Dicts iterate in **insertion order**. This was an implementation detail in 3.6, became part of the language spec in 3.7. You can rely on it.

## Iteration

```python
for key in user:                 # iterating yields keys
    print(key, user[key])

for key in user.keys():          # explicit; same as above
    ...

for value in user.values():
    ...

for key, value in user.items():  # most common
    print(f"{key}: {value}")
```

## Membership

```python
"name" in user        # True   — checks keys
"Ada" in user.values()# True
```

## Useful methods

```python
user.update({"age": 40, "city": "London"})    # merge in another dict
user.pop("city")                              # remove & return; KeyError if missing
user.pop("city", None)                        # ...with default → no error
user.popitem()                                # remove & return last (key, value)
user.clear()
list(user.keys())
list(user.values())
list(user.items())
```

## Dict union (Python 3.9+)

```python
a = {"x": 1, "y": 2}
b = {"y": 99, "z": 3}

a | b        # {'x': 1, 'y': 99, 'z': 3}    — b wins on conflict
a |= b       # in-place merge
```

Pre-3.9, the equivalent is `{**a, **b}`.

## Dict comprehensions

```python
squares = {x: x * x for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# Invert a dict (assuming values are unique)
flipped = {v: k for k, v in squares.items()}
```

## Nested dicts

```python
people = {
    "ada": {"age": 36, "city": "London"},
    "linus": {"age": 54, "city": "Helsinki"},
}
people["ada"]["city"]      # 'London'
```

## `collections.defaultdict`

A subclass that auto-creates missing values via a factory function.

```python
from collections import defaultdict

word_count = defaultdict(int)        # missing keys → 0
for word in "the quick brown fox the".split():
    word_count[word] += 1
# defaultdict(<class 'int'>, {'the': 2, 'quick': 1, 'brown': 1, 'fox': 1})

groups = defaultdict(list)           # missing keys → []
for word in ["apple", "ant", "bee", "bear"]:
    groups[word[0]].append(word)
# {'a': ['apple', 'ant'], 'b': ['bee', 'bear']}
```

## `collections.Counter`

A purpose-built dict for counting hashable items.

```python
from collections import Counter
c = Counter("mississippi")
# Counter({'i': 4, 's': 4, 'p': 2, 'm': 1})
c.most_common(2)         # [('i', 4), ('s', 4)]
```

## Try it — building a frequency table

```python
def histogram(text):
    counts = {}
    for ch in text.lower():
        if ch.isalpha():
            counts[ch] = counts.get(ch, 0) + 1
    return dict(sorted(counts.items()))

print(histogram("Hello, World!"))
```

Output:

```
{'d': 1, 'e': 1, 'h': 1, 'l': 3, 'o': 2, 'r': 1, 'w': 1}
```

You now know the four core collection types — list, tuple, set, dict. Next we get into control flow.
