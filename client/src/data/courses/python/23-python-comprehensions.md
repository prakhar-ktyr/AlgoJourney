---
title: Python Comprehensions
---

# Python Comprehensions

A **comprehension** is a one-expression way to build a list, set, dict, or generator from another iterable. They're the most "Pythonic" feature in the language — once you internalize them, you'll write less code and read it faster.

## List comprehensions

```python
squares = [x * x for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

Read it left-to-right: *the value `x*x`for each`x`in`range(10)`\*.

The general shape:

```
[ EXPRESSION for VAR in ITERABLE if CONDITION ]
```

Both the `if` clause and the `EXPRESSION` are optional in different ways:

```python
evens = [x for x in range(20) if x % 2 == 0]
words = ["hello world".split()]   # without comprehension — just a regular expression

# Multiple sources (nested loops)
pairs = [(r, c) for r in range(3) for c in range(3)]
# [(0,0),(0,1),(0,2),(1,0),...]
```

The order of `for` clauses matches nested loops:

```python
[(r, c) for r in range(3) for c in range(3)]

# is equivalent to

result = []
for r in range(3):
    for c in range(3):
        result.append((r, c))
```

## Filtering with `if`

```python
positives = [n for n in [-2, -1, 0, 1, 2] if n > 0]
# [1, 2]
```

You can stack multiple `if` clauses:

```python
[n for n in range(50) if n % 2 == 0 if n % 3 == 0]
# [0, 6, 12, 18, 24, 30, 36, 42, 48]
```

## Conditional expression in the value

For "transform if condition else other":

```python
[n if n >= 0 else -n for n in [-3, -1, 0, 1, 3]]
# [3, 1, 0, 1, 3]
```

## Set comprehensions

Same syntax with `{ }`:

```python
unique_lengths = {len(w) for w in ["pi", "tau", "phi", "rho", "psi"]}
# {2, 3}
```

## Dict comprehensions

```python
squares = {n: n * n for n in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# Invert a dict
flipped = {v: k for k, v in squares.items()}

# Filter
adults = {name: age for name, age in people.items() if age >= 18}
```

## Generator expressions

Same as a list comprehension but with `( )` — produces values lazily, one at a time, instead of building a list in memory.

```python
gen = (x * x for x in range(10))
next(gen)         # 0
next(gen)         # 1
sum(x * x for x in range(1_000_000))   # no parens needed inside a single-arg call
```

Use generators when:

- the input is large (or infinite),
- you only need to iterate once,
- you're chaining transformations.

## Comprehensions vs `map`/`filter`

These two are equivalent:

```python
list(map(str.upper, words))
[w.upper() for w in words]
```

```python
list(filter(lambda n: n > 0, nums))
[n for n in nums if n > 0]
```

Most Pythonistas prefer comprehensions — they read top-to-bottom in one pass and are usually shorter.

## Don't over-do it

Comprehensions can become unreadable. If you have:

- More than two `for` clauses, or
- Complex conditions, or
- Side effects,

…just use a `for` loop.

```python
# Too clever
result = [transform(x) for sub in data for x in sub if matches(x) for y in subprocess(x) if x != y]

# Better — write the loop
result = []
for sub in data:
    for x in sub:
        if not matches(x):
            continue
        for y in subprocess(x):
            if x != y:
                result.append(transform(x))
```

## The walrus inside comprehensions

Useful when you need to compute a value once and both filter and use it:

```python
nums = [1, 2, 3, 4, 5, 6]
result = [y for n in nums if (y := n * n) > 10]
# [16, 25, 36]
```

## Try it — a word frequency one-liner

```python
text = "the quick brown fox jumps over the lazy dog the quick fox"

# Build {word: count} for words appearing more than once
counts = {w: text.split().count(w)
          for w in set(text.split())
          if text.split().count(w) > 1}

print(counts)
```

Output:

```
{'the': 3, 'quick': 2, 'fox': 2}
```

(In real code, use `collections.Counter` — it's much faster.)
