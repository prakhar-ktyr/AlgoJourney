---
title: Python If...Else
---

# Python If...Else

Control flow lets your program make decisions. Python uses `if`, `elif`, and `else`.

```python
age = 18

if age >= 18:
    print("adult")
elif age >= 13:
    print("teen")
else:
    print("child")
```

The colon `:` introduces the block. The block is the indented lines beneath it.

## Truth in `if`

`if` doesn't require a `bool` — it accepts anything and tests **truthiness**.

```python
items = []
if items:
    print("we have stuff")
else:
    print("empty")          # printed
```

Recall the falsy values: `False`, `None`, `0`, `0.0`, `""`, `[]`, `()`, `{}`, `set()`.

## `elif` chains

`elif` is the keyword Python uses instead of `else if`. There is no implicit fall-through:

```python
def grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"
```

Order matters — the first matching branch wins.

## Nested `if`

Just indent further:

```python
if user.is_authenticated:
    if user.is_admin:
        show_admin_panel()
    else:
        show_user_dashboard()
else:
    show_login()
```

Often you can flatten by combining conditions or returning early:

```python
if not user.is_authenticated:
    show_login()
    return

if user.is_admin:
    show_admin_panel()
else:
    show_user_dashboard()
```

## One-line `if` (ternary expression)

```python
status = "adult" if age >= 18 else "minor"
abs_x  = x if x >= 0 else -x
```

Use sparingly — readability beats cleverness.

## `pass` — the do-nothing statement

When syntax requires a block but you have nothing to put in it yet:

```python
if rare_condition:
    pass        # TODO: handle this
else:
    handle()
```

## Combining conditions

```python
if 0 <= n <= 100:                # chained comparison
    ...

if name in {"ada", "alan", "alonzo"}:    # set membership is fast
    ...

if has_permission and (is_owner or is_admin):
    ...
```

Use `and`/`or`/`not`. Use parentheses to make precedence obvious — readers shouldn't have to remember the precedence table.

## `match`/`case` — structural pattern matching (Python 3.10+)

When you have many shape-based branches, `match` is cleaner than a long `if`/`elif` chain.

```python
def http_error(status):
    match status:
        case 400:
            return "Bad request"
        case 401 | 403:                       # OR pattern
            return "Not allowed"
        case 404:
            return "Not found"
        case n if 500 <= n < 600:             # guard
            return "Server error"
        case _:                               # wildcard / default
            return "Unknown"
```

It can also destructure data:

```python
def describe(point):
    match point:
        case (0, 0):
            return "origin"
        case (x, 0):
            return f"on the X axis at {x}"
        case (0, y):
            return f"on the Y axis at {y}"
        case (x, y):
            return f"at ({x}, {y})"
        case _:
            return "not a 2D point"
```

`match` is most useful for parsing tagged data (JSON, ASTs, events). For simple value comparisons, plain `if`/`elif` is still fine.

## Try it — FizzBuzz

The classic interview warm-up:

```python
for i in range(1, 21):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)
```
