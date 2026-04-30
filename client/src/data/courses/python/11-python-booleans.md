---
title: Python Booleans
---

# Python Booleans

A `bool` represents a single truth value: `True` or `False`. They're capitalised — `true` and `false` are not valid Python.

```python
is_valid = True
is_admin = False
print(type(is_valid))     # <class 'bool'>
```

## Booleans from comparisons

Comparison operators return booleans:

```python
5 > 3            # True
5 == 5           # True
"a" < "b"        # True   (string ordering is lexicographic)
[1, 2] == [1, 2] # True
[1, 2] is [1, 2] # False  — different objects with the same value
```

| Op            | Meaning                          |
| ------------- | -------------------------------- |
| `==`          | equal                            |
| `!=`          | not equal                        |
| `<` `>`       | less / greater                   |
| `<=` `>=`     | less or equal / greater or equal |
| `is` `is not` | identity (same object)           |
| `in` `not in` | membership                       |

`==` checks **value** equality. `is` checks **identity** — whether two names refer to the same object. Use `is` only with `None`, `True`, `False`, and other singletons.

```python
x = None
if x is None:
    print("none")
```

## Chained comparisons

Python lets you chain like math notation:

```python
0 <= age <= 120                # True if age in that range
"a" < ch < "z"                 # True if ch is a lowercase letter
```

## Boolean operators: `and`, `or`, `not`

```python
True and False        # False
True or  False        # True
not True              # False
```

These are **short-circuit** — evaluation stops as soon as the answer is known:

```python
def expensive():
    print("called")
    return True

False and expensive()    # 'expensive' is never called → False
True  or  expensive()    # 'expensive' is never called → True
```

### `and`/`or` return _operands_, not just `True`/`False`

This trips up newcomers but is incredibly useful:

```python
"" or "default"           # 'default'   — first truthy wins
"hello" or "default"      # 'hello'
"hello" and "world"       # 'world'     — last is returned if all truthy
0 and "anything"          # 0           — first falsy wins
```

The classic idiom for "value or fallback":

```python
display_name = user_input or "Anonymous"
```

(Caveat: `0` and `""` are falsy. If they could be valid values, use `if user_input is None` instead.)

## Truthiness recap

The "falsy" values:

```
False, None, 0, 0.0, 0j, "", [], (), {}, set(), range(0), b""
```

Everything else is truthy.

```python
if my_list:          # idiomatic — true only when non-empty
    process(my_list)
```

## Casting to `bool`

```python
bool(0)              # False
bool("")             # False
bool([])             # False
bool("False")        # True (!) — non-empty string
```

Notice that `bool("False")` is `True` because the _string_ `"False"` is non-empty. To parse user input you need explicit logic:

```python
def parse_bool(s):
    return s.strip().lower() in {"1", "true", "yes", "y", "on"}
```

## `bool` is a subclass of `int`

A historical quirk:

```python
True + 1         # 2
False * 5        # 0
isinstance(True, int)   # True
sum([True, True, False, True])    # 3   (handy for counting)
```

That last trick is genuinely useful — `sum(x > 0 for x in nums)` counts how many positives.

## `all` and `any`

These take any iterable of booleans (or anything with truthiness) and reduce it.

```python
all([True, True, True])          # True
all([True, False, True])         # False
all([])                          # True   (vacuously true!)

any([False, False, True])        # True
any([False, False, False])       # False
any([])                          # False
```

Combined with generator expressions, they're a powerful one-liner pattern:

```python
nums = [2, 4, 6, 8]
all(n % 2 == 0 for n in nums)    # True — all even?
any(n > 100 for n in nums)       # False
```

## Try it

```python
password = input("Password: ")

is_long_enough = len(password) >= 8
has_digit = any(c.isdigit() for c in password)
has_upper = any(c.isupper() for c in password)

if is_long_enough and has_digit and has_upper:
    print("Strong password!")
else:
    print("Try again — needs 8+ chars, a digit, and an uppercase letter.")
```
