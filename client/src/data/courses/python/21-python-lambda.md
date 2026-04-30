---
title: Python Lambda
---

# Python Lambda

A `lambda` is a small, anonymous function defined with an expression. They're perfect for one-off callbacks where naming a `def` would be overkill.

```python
square = lambda x: x * x
square(5)              # 25

add = lambda a, b: a + b
add(2, 3)              # 5
```

The above are valid but bad style — if you assign a lambda to a name, just use `def`. Lambdas shine when used **inline** as arguments.

## Where lambdas are useful

### Sorting with a key

```python
people = [("Ada", 36), ("Linus", 54), ("Guido", 69)]

by_age = sorted(people, key=lambda p: p[1])
# [('Ada', 36), ('Linus', 54), ('Guido', 69)]

by_name_desc = sorted(people, key=lambda p: p[0], reverse=True)
```

### Filter / map

```python
nums = range(-5, 6)
positives = list(filter(lambda n: n > 0, nums))    # [1, 2, 3, 4, 5]
doubled   = list(map(lambda n: n * 2, nums))
```

(Comprehensions are usually clearer: `[n for n in nums if n > 0]`.)

### As a callback

```python
import threading
threading.Timer(5, lambda: print("ding!")).start()
```

### `min`, `max`, `groupby`

```python
words = ["pear", "apple", "kiwi", "banana"]
shortest = min(words, key=lambda w: len(w))         # 'kiwi'
longest  = max(words, key=lambda w: len(w))         # 'banana'
```

## Syntax restrictions

A `lambda` body must be a **single expression** — no statements, no assignments (the walrus is OK), no `return` keyword (the expression is implicitly returned).

```python
lambda x: x + 1                       # OK
lambda x, y=10: x * y                  # default arg OK
lambda *args, **kwargs: ...            # varargs OK
lambda: print("side effect")           # zero args OK

lambda x: (print(x); x + 1)            # SyntaxError — multiple statements
```

If you need a multi-line function, use `def`. Naming it costs one line and helps the next reader.

## `lambda` vs `def`

| Use `lambda` when…                     | Use `def` when…                    |
| -------------------------------------- | ---------------------------------- |
| The function is a one-line expression  | The function is more than one line |
| It's passed inline to another function | It's reused or has a useful name   |
| Naming it would just add clutter       | You want a docstring               |

## A common pitfall — closures and late binding

```python
funcs = [lambda: i for i in range(3)]
[f() for f in funcs]      # [2, 2, 2] — surprised?
```

All three lambdas captured the _variable_ `i`, not its value at the time. By the time you call them, `i` is `2`. Fix it by binding `i` as a default argument:

```python
funcs = [lambda i=i: i for i in range(3)]
[f() for f in funcs]      # [0, 1, 2]
```

This trap appears anywhere you create closures in a loop, not just with lambdas.

## Try it — sort a CSV-like list

```python
rows = [
    "Ada,36,London",
    "Linus,54,Helsinki",
    "Guido,69,Amsterdam",
]

# Sort by the numeric age (column index 1)
sorted_rows = sorted(rows, key=lambda r: int(r.split(",")[1]))
print(sorted_rows)
```

Output:

```
['Ada,36,London', 'Linus,54,Helsinki', 'Guido,69,Amsterdam']
```
