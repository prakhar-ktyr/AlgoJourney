---
title: Python Functions
---

# Python Functions

A **function** is a named, reusable block of code. Define one with `def`:

```python
def greet(name):
    return f"Hello, {name}!"

print(greet("Ada"))      # Hello, Ada!
```

Anatomy:

- `def` introduces a function definition.
- `greet` is the name.
- `(name)` is the parameter list.
- `:` ends the header; the indented block is the body.
- `return` sends a value back. A function without an explicit `return` returns `None`.

## Calling a function

```python
result = greet("Linus")
```

A function is a value, just like any other. You can pass it around:

```python
say = greet
say("Guido")        # 'Hello, Guido!'
```

## Parameters and arguments

Vocabulary:

- A **parameter** is the name in the function definition (`name` above).
- An **argument** is the value you pass when calling (`"Ada"`).

### Positional vs keyword

```python
def power(base, exp):
    return base ** exp

power(2, 10)              # positional → 1024
power(base=2, exp=10)     # keyword
power(exp=10, base=2)     # order doesn't matter with keywords
power(2, exp=10)          # mix: positionals first
```

### Default values

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Ada")                       # 'Hello, Ada!'
greet("Ada", greeting="Hi")        # 'Hi, Ada!'
```

> **Mutable default trap.** Don't write `def f(x, history=[]):` — the same list is reused across all calls. Use `None` and create a fresh list inside.

```python
def f(x, history=None):
    if history is None:
        history = []
    history.append(x)
    return history
```

### `*args` and `**kwargs`

`*args` collects extra positional arguments into a tuple; `**kwargs` collects extra keyword arguments into a dict.

```python
def log(*args, **kwargs):
    print("positional:", args)
    print("keyword:   ", kwargs)

log(1, 2, 3, level="info", source="db")
# positional: (1, 2, 3)
# keyword:    {'level': 'info', 'source': 'db'}
```

The names `args` and `kwargs` are convention — only the `*` and `**` matter.

### Forwarding arguments

```python
def loud_print(*args, **kwargs):
    print(*args, **{k: str(v).upper() for k, v in kwargs.items()})
```

### Positional-only and keyword-only

The `/` and `*` markers (Python 3.8+) restrict how parameters can be passed:

```python
def f(pos_only, /, both, *, kw_only):
    ...

f(1, 2, kw_only=3)       # OK
f(1, both=2, kw_only=3)  # OK
f(pos_only=1, both=2, kw_only=3)   # TypeError — pos_only can't be a keyword
```

This is mostly relevant when designing libraries, but it's good to recognize.

## Returning multiple values

Just return a tuple. Python has tuple unpacking on the receiving side, so it feels like multiple returns:

```python
def divmod_(a, b):
    return a // b, a % b

q, r = divmod_(17, 5)
```

## First-class functions & higher-order functions

Functions are objects. You can store them in lists, pass them as arguments, return them from other functions.

```python
def apply(func, value):
    return func(value)

apply(str.upper, "hello")     # 'HELLO'
apply(lambda x: x + 1, 41)    # 42
```

`map`, `filter`, and `sorted(..., key=...)` are common higher-order helpers:

```python
list(map(str.upper, ["a", "b"]))            # ['A', 'B']
list(filter(lambda n: n > 0, [-1, 0, 1, 2])) # [1, 2]
sorted(["bb", "a", "ccc"], key=len)          # ['a', 'bb', 'ccc']
```

In modern Python, list comprehensions are usually preferred to `map`/`filter`.

## Docstrings (recap)

```python
def add(a, b):
    """Return the sum of a and b."""
    return a + b
```

`help(add)` and tooltips in your IDE will show this string.

## Type hints (preview)

```python
def add(a: int, b: int) -> int:
    return a + b
```

Hints don't change behavior — they enable static analysis and richer IDE support. Full lesson coming up.

## Try it

```python
def stats(*nums):
    """Return min, max, and average of any number of values."""
    if not nums:
        raise ValueError("need at least one number")
    return min(nums), max(nums), sum(nums) / len(nums)

print(stats(3, 1, 4, 1, 5, 9, 2, 6))
```

Output:

```
(1, 9, 3.875)
```
